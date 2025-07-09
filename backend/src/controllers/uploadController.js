// backend/src/controllers/uploadController.js - کنترلر مدیریت آپلود فایل‌ها
const path = require('path');
const fs = require('fs-extra');

class UploadController {
    constructor() {
        this._fileService = null;
        this._settingsService = null;
        this._aiService = null;
        this._queueManager = null;
    }

    // Lazy load services
    async _getFileService() {
        if (!this._fileService) {
            this._fileService = require('../services/fileService');
        }
        return this._fileService;
    }

    async _getSettingsService() {
        if (!this._settingsService) {
            this._settingsService = require('../services/settingsService');
        }
        return this._settingsService;
    }

    async _getAIService() {
        if (!this._aiService) {
            this._aiService = require('../services/aiService');
        }
        return this._aiService;
    }

    async _getQueueManager() {
        if (!this._queueManager) {
            this._queueManager = require('../queue/queueManager');
        }
        return this._queueManager;
    }

    // آپلود فایل جدید
    async uploadFile(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'هیچ فایلی انتخاب نشده است'
                });
            }

            const fileService = await this._getFileService();
            // const aiService = await this._getAIService();

            // دریافت نوع فایل از درخواست
            const fileType = req.body.fileType || 'auto';

            // ذخیره فایل
            const fileData = await fileService.saveUploadedFile(req.file, fileType);

            // اگر نوع فایل auto است، پردازش AI انجام دهیم
            if (fileType === 'auto') {
                try {
                    // تشخیص نوع سند با AI - temporarily disabled
                    // const aiResult = await aiService.detectDocumentType(fileData.filePath);
                    
                    // بروزرسانی اطلاعات فایل
                    const updatedFile = await fileService.updateProcessingStatus(
                        fileData.id, 
                        'completed', 
                        'unknown', // aiResult.documentType,
                        0.5, // aiResult.confidence,
                        'تشخیص خودکار موقتا غیرفعال است' // aiResult.extractedText
                    );
                    
                    res.json({
                        success: true,
                        message: 'فایل با موفقیت آپلود و پردازش شد',
                        data: updatedFile
                    });
                } catch (aiError) {
                    console.error('خطا در پردازش AI:', aiError);
                    
                    // در صورت خطا، فایل را به عنوان unknown ذخیره کنیم
                    const fallbackFile = await fileService.updateProcessingStatus(
                        fileData.id, 
                        'completed', 
                        'unknown',
                        0.5,
                        'تشخیص خودکار ممکن نیست'
                    );
                    
                    res.json({
                        success: true,
                        message: 'فایل آپلود شد ولی تشخیص خودکار ممکن نیست',
                        data: fallbackFile
                    });
                }
            } else {
                // اگر نوع فایل مشخص است، بدون پردازش AI ذخیره کنیم
                const completedFile = await fileService.updateProcessingStatus(
                    fileData.id, 
                    'completed', 
                    fileType,
                    1.0,
                    'نوع سند دستی تعیین شده'
                );
                
                res.json({
                    success: true,
                    message: 'فایل با موفقیت آپلود شد',
                    data: completedFile
                });
            }
        } catch (error) {
            console.error('خطا در آپلود فایل:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'خطا در آپلود فایل'
            });
        }
    }

    // دانلود فایل با لینک یکتا
    async downloadFile(req, res) {
        try {
            const fileService = await this._getFileService();
            const { uniqueLink } = req.params;
            const fileData = await fileService.getFileByUniqueLink(uniqueLink);

            if (!fileData) {
                return res.status(404).json({
                    success: false,
                    message: 'فایل یافت نشد'
                });
            }

            const filePath = fileData.file_path;
            if (!await fs.pathExists(filePath)) {
                return res.status(404).json({
                    success: false,
                    message: 'فایل در سرور یافت نشد'
                });
            }

            // تنظیم هدرهای مناسب
            res.setHeader('Content-Type', fileData.mime_type);
            res.setHeader('Content-Disposition', `attachment; filename="${fileData.original_name}"`);
            res.setHeader('Content-Length', fileData.file_size);

            // ارسال فایل
            const fileStream = fs.createReadStream(filePath);
            fileStream.pipe(res);
        } catch (error) {
            console.error('خطا در دانلود فایل:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در دانلود فایل'
            });
        }
    }

    // دریافت وضعیت پردازش فایل
    async getFileStatus(req, res) {
        try {
            const fileService = await this._getFileService();
            const { uniqueLink } = req.params;
            const fileData = await fileService.getFileByUniqueLink(uniqueLink);

            if (!fileData) {
                return res.status(404).json({
                    success: false,
                    message: 'فایل یافت نشد'
                });
            }

            res.json({
                success: true,
                data: {
                    id: fileData.id,
                    filename: fileData.filename,
                    originalName: fileData.original_name,
                    processingStatus: fileData.processing_status,
                    documentType: fileData.document_type,
                    uploadDate: fileData.upload_date
                }
            });
        } catch (error) {
            console.error('خطا در دریافت وضعیت فایل:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در دریافت وضعیت فایل'
            });
        }
    }

    // دریافت لیست فایل‌ها
    async getFilesList(req, res) {
        try {
            const fileService = await this._getFileService();
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;

            const result = await fileService.getFilesList(page, limit);

            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            console.error('خطا در دریافت لیست فایل‌ها:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در دریافت لیست فایل‌ها'
            });
        }
    }

    // حذف فایل
    async deleteFile(req, res) {
        try {
            const fileService = await this._getFileService();
            const { fileId } = req.params;
            const result = await fileService.deleteFile(parseInt(fileId));

            if (result) {
                res.json({
                    success: true,
                    message: 'فایل با موفقیت حذف شد'
                });
            } else {
                res.status(404).json({
                    success: false,
                    message: 'فایل یافت نشد'
                });
            }
        } catch (error) {
            console.error('خطا در حذف فایل:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در حذف فایل'
            });
        }
    }
}

module.exports = new UploadController();