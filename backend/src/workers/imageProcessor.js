// backend/src/workers/imageProcessor.js - کارگر پردازش تصاویر
const { Worker } = require('bullmq');
const Redis = require('ioredis');
const ocrService = require('../services/ocrService');
const aiService = require('../services/aiService');
const fileService = require('../services/fileService');
const databaseService = require('../services/databaseService');

const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    maxRetriesPerRequest: 3
});

class ImageProcessor {
    constructor() {
        this.worker = null;
    }

    start() {
        this.worker = new Worker('image-processing', async (job) => {
            const { fileId, filePath, fileType } = job.data;
            
            try {
                // به‌روزرسانی وضعیت به "در حال پردازش"
                await fileService.updateFileStatus(fileId, 'processing');
                job.updateProgress(10);

                // استخراج متن با OCR
                console.log(`Starting OCR for file ${fileId}`);
                const ocrResult = await ocrService.extractText(filePath);
                
                if (!ocrResult.success) {
                    throw new Error(`OCR failed: ${ocrResult.error}`);
                }

                job.updateProgress(50);

                // تحلیل متن با AI
                console.log(`Starting AI analysis for file ${fileId}`);
                let analysisResult;
                
                if (fileType === 'check') {
                    analysisResult = await aiService.analyzeCheck(ocrResult.text);
                } else if (fileType === 'contract') {
                    analysisResult = await aiService.analyzeContract(ocrResult.text);
                } else {
                    throw new Error(`Unsupported file type: ${fileType}`);
                }

                job.updateProgress(80);

                // ذخیره نتایج در دیتابیس
                await this.saveResults(fileId, fileType, ocrResult, analysisResult);
                
                // به‌روزرسانی وضعیت به "تکمیل شده"
                await fileService.updateFileStatus(fileId, 'completed');
                job.updateProgress(100);

                console.log(`Successfully processed file ${fileId}`);
                return {
                    success: true,
                    ocrResult,
                    analysisResult
                };

            } catch (error) {
                console.error(`Failed to process file ${fileId}:`, error);
                await fileService.updateFileStatus(fileId, 'failed');
                throw error;
            }
        }, {
            connection: redis,
            concurrency: 2
        });

        this.worker.on('completed', (job) => {
            console.log(`Job ${job.id} completed successfully`);
        });

        this.worker.on('failed', (job, err) => {
            console.error(`Job ${job.id} failed:`, err);
        });

        console.log('Image processor worker started');
    }

    async saveResults(fileId, fileType, ocrResult, analysisResult) {
        const connection = await databaseService.getConnection();
        
        try {
            await connection.beginTransaction();

            if (fileType === 'check') {
                await connection.execute(
                    `INSERT INTO checks (file_id, amount, date, payee, check_number, bank_name, account_number, extracted_text, confidence) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        fileId,
                        analysisResult.amount || null,
                        analysisResult.date || null,
                        analysisResult.payee || null,
                        analysisResult.check_number || null,
                        analysisResult.bank_name || null,
                        analysisResult.account_number || null,
                        ocrResult.text,
                        ocrResult.confidence
                    ]
                );
            } else if (fileType === 'contract') {
                await connection.execute(
                    `INSERT INTO contracts (file_id, contract_type, party_a, party_b, start_date, end_date, amount, key_terms, extracted_text, confidence) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        fileId,
                        analysisResult.contract_type || null,
                        analysisResult.party_a || null,
                        analysisResult.party_b || null,
                        analysisResult.start_date || null,
                        analysisResult.end_date || null,
                        analysisResult.amount || null,
                        JSON.stringify(analysisResult.key_terms || []),
                        ocrResult.text,
                        ocrResult.confidence
                    ]
                );
            }

            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    stop() {
        if (this.worker) {
            this.worker.close();
            console.log('Image processor worker stopped');
        }
    }
}

module.exports = new ImageProcessor();