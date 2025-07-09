// backend/src/controllers/settingsController.js - کنترلر مدیریت تنظیمات
const settingsService = require('../services/settingsService');

class SettingsController {
    // دریافت تمام تنظیمات
    async getAllSettings(req, res) {
        try {
            const settings = await settingsService.getSettingsObject();
            
            // حذف کلید OpenAI از پاسخ برای امنیت
            const safeSettings = { ...settings };
            if (safeSettings.openai_api_key) {
                safeSettings.openai_api_key = safeSettings.openai_api_key.substring(0, 10) + '...';
            }

            res.json({
                success: true,
                data: safeSettings
            });
        } catch (error) {
            console.error('خطا در دریافت تنظیمات:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در دریافت تنظیمات'
            });
        }
    }

    // بروزرسانی تنظیمات
    async updateSettings(req, res) {
        try {
            const settings = req.body;
            
            // اعتبارسنجی تنظیمات
            const validationResult = this.validateSettings(settings);
            if (!validationResult.isValid) {
                return res.status(400).json({
                    success: false,
                    message: validationResult.message
                });
            }

            await settingsService.updateMultipleSettings(settings);

            res.json({
                success: true,
                message: 'تنظیمات با موفقیت بروزرسانی شد'
            });
        } catch (error) {
            console.error('خطا در بروزرسانی تنظیمات:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در بروزرسانی تنظیمات'
            });
        }
    }

    // اعتبارسنجی تنظیمات
    validateSettings(settings) {
        // بررسی کلید OpenAI
        if (settings.openai_api_key && !settings.openai_api_key.startsWith('sk-')) {
            return {
                isValid: false,
                message: 'کلید OpenAI معتبر نیست'
            };
        }

        // بررسی حداکثر سایز فایل
        if (settings.max_file_size) {
            const maxSize = parseInt(settings.max_file_size);
            if (isNaN(maxSize) || maxSize < 1024 || maxSize > 104857600) { // 1KB to 100MB
                return {
                    isValid: false,
                    message: 'حداکثر سایز فایل باید بین 1KB تا 100MB باشد'
                };
            }
        }

        // بررسی انواع فایل مجاز
        if (settings.allowed_file_types) {
            const types = settings.allowed_file_types.split(',');
            const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
            const invalidTypes = types.filter(type => !validTypes.includes(type.trim()));
            
            if (invalidTypes.length > 0) {
                return {
                    isValid: false,
                    message: `انواع فایل نامعتبر: ${invalidTypes.join(', ')}`
                };
            }
        }

        return { isValid: true };
    }

    // تست اتصال OpenAI
    async testOpenAIConnection(req, res) {
        try {
            const { apiKey } = req.body;
            
            if (!apiKey || !apiKey.startsWith('sk-')) {
                return res.status(400).json({
                    success: false,
                    message: 'کلید API معتبر نیست'
                });
            }

            // تست ساده اتصال
            const OpenAI = require('openai');
            const openai = new OpenAI({ apiKey });
            
            await openai.models.list();

            res.json({
                success: true,
                message: 'اتصال به OpenAI موفقیت‌آمیز بود'
            });
        } catch (error) {
            console.error('خطا در تست OpenAI:', error);
            res.status(400).json({
                success: false,
                message: 'خطا در اتصال به OpenAI: ' + error.message
            });
        }
    }
}

module.exports = new SettingsController();