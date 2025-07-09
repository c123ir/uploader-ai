// backend/src/queue/queueManager.js - مدیریت صف و کارگرها
const QueueService = require('./queueService');
const { Worker } = require('bullmq');
const Redis = require('ioredis');

const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    maxRetriesPerRequest: 3
});

const queueService = new QueueService();
let worker;

// راه‌اندازی کارگر پردازش تصاویر
// در ابتدای فایل queueManager.js
const QUEUE_ENABLED = process.env.QUEUE_ENABLED === 'true';

async function initializeQueue() {
    if (!QUEUE_ENABLED) {
        console.log('⚠️ صف غیرفعال است');
        return;
    }
    try {
        // ایجاد کارگر
        worker = new Worker('image-processing', async (job) => {
            const { fileId, filePath, fileType } = job.data;
            console.log(`شروع پردازش فایل ${fileId}`);
            
            // شبیه‌سازی پردازش
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            return {
                fileId,
                status: 'completed',
                processedAt: new Date().toISOString()
            };
        }, {
            connection: redis,
            concurrency: 2
        });

        worker.on('completed', (job, result) => {
            console.log(`✅ پردازش فایل ${result.fileId} تکمیل شد`);
        });

        worker.on('failed', (job, err) => {
            console.error(`❌ خطا در پردازش فایل ${job.data.fileId}:`, err.message);
        });

        console.log('🔄 صف پردازش راه‌اندازی شد');
    } catch (error) {
        console.error('خطا در راه‌اندازی صف:', error);
        // در صورت خطا، صف را غیرفعال کنیم
        console.log('⚠️ صف غیرفعال شد');
    }
}

// اضافه کردن کار به صف
async function addToProcessingQueue(jobData) {
    try {
        return await queueService.addImageProcessingJob(
            jobData.fileId,
            jobData.filePath,
            jobData.mimeType
        );
    } catch (error) {
        console.error('خطا در اضافه کردن به صف:', error);
        // در صورت خطا، فقط لاگ کنیم و ادامه دهیم
        return null;
    }
}

// دریافت وضعیت کار
async function getJobStatus(jobId) {
    try {
        return await queueService.getJobStatus(jobId);
    } catch (error) {
        console.error('خطا در دریافت وضعیت:', error);
        return { status: 'error' };
    }
}

// بستن اتصالات
async function closeQueue() {
    if (worker) {
        await worker.close();
    }
    await redis.quit();
}

module.exports = {
    initializeQueue,
    addToProcessingQueue,
    getJobStatus,
    closeQueue
};