// backend/src/routes/settingsRoutes.js - مسیرهای مربوط به تنظیمات
const express = require('express');
const settingsController = require('../controllers/settingsController');

const router = express.Router();

// دریافت تمام تنظیمات
router.get('/', settingsController.getAllSettings);

// بروزرسانی تنظیمات
router.put('/', settingsController.updateSettings);

// تست اتصال OpenAI
router.post('/test-openai', settingsController.testOpenAIConnection);

module.exports = router;