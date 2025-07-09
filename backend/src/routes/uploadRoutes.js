// backend/src/routes/uploadRoutes.js - مسیرهای مربوط به آپلود فایل
const express = require('express');
const multer = require('multer');
const uploadController = require('../controllers/uploadController');
const settingsService = require('../services/settingsService');

const router = express.Router();

// تنظیمات Multer برای آپلود فایل
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB حداکثر (بررسی دقیق‌تر در سرویس انجام می‌شود)
    },
    fileFilter: async (req, file, cb) => {
        try {
            const allowedTypes = await settingsService.getAllowedFileTypes();
            if (allowedTypes.includes(file.mimetype)) {
                cb(null, true);
            } else {
                cb(new Error('نوع فایل مجاز نیست'), false);
            }
        } catch (error) {
            cb(error, false);
        }
    }
});

// مسیرها
router.post('/', upload.single('file'), uploadController.uploadFile.bind(uploadController));
router.get('/download/:uniqueLink', uploadController.downloadFile.bind(uploadController));
router.get('/status/:uniqueLink', uploadController.getFileStatus.bind(uploadController));
router.get('/list', uploadController.getFilesList.bind(uploadController));
router.delete('/:fileId', uploadController.deleteFile.bind(uploadController));

// مدیریت خطاهای Multer
router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'سایز فایل بیش از حد مجاز است'
            });
        }
    }
    
    res.status(400).json({
        success: false,
        message: error.message || 'خطا در آپلود فایل'
    });
});

module.exports = router;