// backend/src/queue/queueService.js - سرویس مدیریت صف
const { Queue } = require('bullmq');
const Redis = require('ioredis');

const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    maxRetriesPerRequest: 3
});

const imageProcessingQueue = new Queue('image-processing', {
    connection: redis,
    defaultJobOptions: {
        removeOnComplete: 10,
        removeOnFail: 5,
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 2000
        }
    }
});

class QueueService {
    async addImageProcessingJob(fileId, filePath, fileType) {
        try {
            const job = await imageProcessingQueue.add('process-image', {
                fileId,
                filePath,
                fileType,
                timestamp: new Date().toISOString()
            });

            console.log(`Added job ${job.id} for file ${fileId}`);
            return job;
        } catch (error) {
            console.error('Failed to add job to queue:', error);
            throw error;
        }
    }

    async getJobStatus(jobId) {
        try {
            const job = await imageProcessingQueue.getJob(jobId);
            if (!job) {
                return { status: 'not_found' };
            }

            return {
                status: await job.getState(),
                progress: job.progress,
                data: job.data,
                result: job.returnvalue,
                error: job.failedReason
            };
        } catch (error) {
            console.error('Failed to get job status:', error);
            throw error;
        }
    }

    getQueue() {
        return imageProcessingQueue;
    }
}

// Export کلاس به جای instance
module.exports = QueueService;