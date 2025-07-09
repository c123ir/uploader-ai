// backend/src/queue/imageProcessor.js - کارگر پردازش تصاویر
const { Worker } = require('bullmq');
const Redis = require('ioredis');
const OCRService = require('../services/ocrService');
const AIService = require('../services/aiService');
const { executeQuery } = require('../services/databaseService');
const path = require('path');

const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    maxRetriesPerRequest: 3
});

const ocrService = new OCRService();
const aiService = new AIService();

class ImageProcessor {
    constructor() {
        this.worker = null;
    }

    async initialize() {
        try {
            // راه‌اندازی سرویس‌ها
            await ocrService.initialize();
            await aiService.initialize();

            // ایجاد کارگر
            this.worker = new Worker('image-processing', this.processImage.bind(this), {
                connection: redis,
                concurrency: 2
            });

            this.worker.on('completed', (job, result) => {
                console.log(`✅ پردازش فایل ${result.fileId} تکمیل شد`);
            });

            this.worker.on('failed', (job, err) => {
                console.error(`❌ خطا در پردازش فایل ${job.data.fileId}:`, err.message);
            });

            console.log('🔄 کارگر پردازش تصاویر راه‌اندازی شد');
        } catch (error) {
            console.error('خطا در راه‌اندازی کارگر:', error);
            throw error;
        }
    }

    async processImage(job) {
        const { fileId, filePath, fileType } = job.data;
        
        try {
            // به‌روزرسانی وضعیت به "در حال پردازش"
            await this.updateFileStatus(fileId, 'processing');
            
            // استخراج متن با OCR
            job.updateProgress(25);
            const extractedText = await ocrService.extractText(filePath);
            
            if (!extractedText || extractedText.trim().length === 0) {
                throw new Error('متنی از تصویر استخراج نشد');
            }

            // تحلیل متن با AI
            job.updateProgress(50);
            let analysisResult;
            
            if (fileType === 'image/jpeg' || fileType === 'image/png') {
                // تشخیص نوع سند بر اساس محتوا
                const documentType = await this.detectDocumentType(extractedText);
                
                if (documentType === 'check') {
                    analysisResult = await aiService.analyzeCheck(extractedText);
                    await this.saveCheckData(fileId, analysisResult, extractedText);
                } else if (documentType === 'contract') {
                    analysisResult = await aiService.analyzeContract(extractedText);
                    await this.saveContractData(fileId, analysisResult, extractedText);
                }
                
                // به‌روزرسانی نوع سند در فایل
                await this.updateDocumentType(fileId, documentType);
            }

            // به‌روزرسانی وضعیت به "تکمیل شده"
            job.updateProgress(100);
            await this.updateFileStatus(fileId, 'completed');

            return {
                fileId,
                status: 'completed',
                extractedText,
                analysisResult,
                processedAt: new Date().toISOString()
            };

        } catch (error) {
            console.error(`خطا در پردازش فایل ${fileId}:`, error);
            await this.updateFileStatus(fileId, 'failed');
            throw error;
        }
    }

    async detectDocumentType(text) {
        // منطق ساده برای تشخیص نوع سند
        const checkKeywords = ['چک', 'بانک', 'مبلغ', 'تاریخ', 'گیرنده'];
        const contractKeywords = ['قرارداد', 'طرف', 'مدت', 'شرایط', 'تعهد'];
        
        const checkScore = checkKeywords.filter(keyword => text.includes(keyword)).length;
        const contractScore = contractKeywords.filter(keyword => text.includes(keyword)).length;
        
        return checkScore > contractScore ? 'check' : 'contract';
    }

    async updateFileStatus(fileId, status) {
        const query = 'UPDATE files SET processing_status = ?, processed_at = NOW() WHERE id = ?';
        await executeQuery(query, [status, fileId]);
    }

    async updateDocumentType(fileId, documentType) {
        const query = 'UPDATE files SET document_type = ? WHERE id = ?';
        await executeQuery(query, [documentType, fileId]);
    }

    async saveCheckData(fileId, analysisResult, extractedText) {
        const query = `
            INSERT INTO checks (file_id, amount, date, payee, check_number, bank_name, account_number, extracted_text, confidence)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        await executeQuery(query, [
            fileId,
            analysisResult.amount || null,
            analysisResult.date || null,
            analysisResult.payee || null,
            analysisResult.checkNumber || null,
            analysisResult.bankName || null,
            analysisResult.accountNumber || null,
            extractedText,
            analysisResult.confidence || 0
        ]);
    }

    async saveContractData(fileId, analysisResult, extractedText) {
        const query = `
            INSERT INTO contracts (file_id, contract_type, party_a, party_b, start_date, end_date, amount, key_terms, extracted_text, confidence)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        await executeQuery(query, [
            fileId,
            analysisResult.contractType || null,
            analysisResult.partyA || null,
            analysisResult.partyB || null,
            analysisResult.startDate || null,
            analysisResult.endDate || null,
            analysisResult.amount || null,
            JSON.stringify(analysisResult.keyTerms || []),
            extractedText,
            analysisResult.confidence || 0
        ]);
    }

    async close() {
        if (this.worker) {
            await this.worker.close();
        }
        await ocrService.terminate();
    }
}

module.exports = ImageProcessor;