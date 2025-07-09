// backend/src/services/fileService.js - سرویس مدیریت فایل‌ها
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');

class FileService {
    constructor() {
        this.uploadsDir = path.join(__dirname, '../../uploads');
        this.ensureUploadsDir();
        this._databaseService = null;
        this._settingsService = null;
    }

    // Lazy load database service
    async _getDatabaseService() {
        if (!this._databaseService) {
            this._databaseService = require('./databaseService');
        }
        return this._databaseService;
    }

    // Lazy load settings service
    async _getSettingsService() {
        if (!this._settingsService) {
            this._settingsService = require('./settingsService');
        }
        return this._settingsService;
    }

    async ensureUploadsDir() {
        await fs.ensureDir(this.uploadsDir);
    }

    // ذخیره فایل آپلود شده
    async saveUploadedFile(file, fileType = 'auto') {
        try {
            const { executeQuery } = await this._getDatabaseService();
            const settingsService = await this._getSettingsService();
            
            const uniqueId = uuidv4();
            const fileExtension = path.extname(file.originalname);
            const filename = `${uniqueId}${fileExtension}`;
            const filePath = path.join(this.uploadsDir, filename);
            const uniqueLink = `${uniqueId}-${Date.now()}`;

            // بررسی سایز فایل
            const maxSize = await settingsService.getMaxFileSize();
            if (file.size > maxSize) {
                throw new Error(`سایز فایل نباید بیشتر از ${Math.round(maxSize / 1024 / 1024)}MB باشد`);
            }

            // بررسی نوع فایل
            const allowedTypes = await settingsService.getAllowedFileTypes();
            if (!allowedTypes.includes(file.mimetype)) {
                throw new Error('نوع فایل مجاز نیست');
            }

            // بهینه‌سازی تصویر
            let processedBuffer = file.buffer;
            if (file.mimetype.startsWith('image/')) {
                processedBuffer = await sharp(file.buffer)
                    .resize(2048, 2048, { 
                        fit: 'inside',
                        withoutEnlargement: true 
                    })
                    .jpeg({ quality: 85 })
                    .toBuffer();
            }

            // ذخیره فایل
            await fs.writeFile(filePath, processedBuffer);

            // ذخیره اطلاعات در پایگاه داده
            const query = `
                INSERT INTO files 
                (filename, original_name, file_path, file_size, mime_type, unique_link, document_type, processing_status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            const result = await executeQuery(query, [
                filename,
                file.originalname,
                filePath,
                processedBuffer.length,
                file.mimetype,
                uniqueLink,
                fileType,
                'pending'
            ]);

            return {
                id: result.insertId,
                filename,
                originalName: file.originalname,
                filePath,
                fileSize: processedBuffer.length,
                mimeType: file.mimetype,
                uniqueLink,
                documentType: fileType,
                downloadUrl: `/api/upload/download/${uniqueLink}`
            };
        } catch (error) {
            console.error('خطا در ذخیره فایل:', error);
            throw error;
        }
    }

    // دریافت اطلاعات فایل با لینک یکتا
    async getFileByUniqueLink(uniqueLink) {
        const { executeQuery } = await this._getDatabaseService();
        const query = 'SELECT * FROM files WHERE unique_link = ?';
        const result = await executeQuery(query, [uniqueLink]);
        return result.length > 0 ? result[0] : null;
    }

    // بروزرسانی وضعیت پردازش
    async updateProcessingStatus(fileId, status, documentType = null, confidence = null, extractedText = null) {
        const { executeQuery } = await this._getDatabaseService();
        
        let query = 'UPDATE files SET processing_status = ?, processed_at = CURRENT_TIMESTAMP';
        const params = [status];
        
        if (documentType) {
            query += ', document_type = ?';
            params.push(documentType);
        }
        
        query += ' WHERE id = ?';
        params.push(fileId);
        
        const result = await executeQuery(query, params);
        
        // بازگشت اطلاعات کامل فایل
        const fileQuery = 'SELECT * FROM files WHERE id = ?';
        const fileResult = await executeQuery(fileQuery, [fileId]);
        
        if (fileResult.length > 0) {
            const file = fileResult[0];
            return {
                id: file.id,
                filename: file.filename,
                originalName: file.original_name,
                fileType: file.document_type,
                status: file.processing_status,
                uploadedAt: file.upload_date,
                processedAt: file.processed_at,
                fileSize: file.file_size,
                mimeType: file.mime_type,
                documentType: documentType || file.document_type,
                confidence: confidence || 0.85, // مقدار فرضی
                extractedText: extractedText
            };
        }
        
        return result;
    }

    // حذف فایل
    async deleteFile(fileId) {
        const { executeQuery } = await this._getDatabaseService();
        
        const query = 'SELECT file_path FROM files WHERE id = ?';
        const result = await executeQuery(query, [fileId]);
        
        if (result.length > 0) {
            const filePath = result[0].file_path;
            
            // حذف فایل از دیسک
            if (await fs.pathExists(filePath)) {
                await fs.remove(filePath);
            }
            
            // حذف از پایگاه داده
            const deleteQuery = 'DELETE FROM files WHERE id = ?';
            await executeQuery(deleteQuery, [fileId]);
            
            return true;
        }
        
        return false;
    }

    // دریافت لیست فایل‌ها
    async getFilesList(page = 1, limit = 20) {
        try {
            const { executeQuery } = await this._getDatabaseService();
            
            // First, let's try a simple query without LIMIT and OFFSET
            const query = `
                SELECT 
                    id,
                    filename,
                    original_name,
                    file_size,
                    mime_type,
                    unique_link,
                    upload_date,
                    processed_at,
                    processing_status,
                    document_type
                FROM files 
                ORDER BY upload_date DESC
            `;
            
            const files = await executeQuery(query);
            
            // شمارش کل فایل‌ها
            const countQuery = 'SELECT COUNT(*) as total FROM files';
            const countResult = await executeQuery(countQuery);
            const total = countResult[0].total;
            
            // اضافه کردن URL‌های دانلود و پیش‌نمایش
            const filesWithUrls = files.map(file => ({
                id: file.id.toString(),
                filename: file.filename,
                originalName: file.original_name,
                fileSize: file.file_size,
                mimeType: file.mime_type,
                uniqueLink: file.unique_link,
                uploadedAt: file.upload_date,
                processedAt: file.processed_at,
                status: file.processing_status,
                fileType: file.document_type,
                downloadUrl: `/api/upload/download/${file.unique_link}`,
                previewUrl: file.mime_type.startsWith('image/') ? `/uploads/${file.filename}` : null
            }));

            const result = {
                files: filesWithUrls,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            };
            
            return result;
        } catch (error) {
            console.error('❌ Error in getFilesList:', error);
            throw error;
        }
    }
}

module.exports = new FileService();