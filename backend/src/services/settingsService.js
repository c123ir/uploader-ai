// backend/src/services/settingsService.js - سرویس مدیریت تنظیمات سیستم

class SettingsService {
    constructor() {
        this._databaseService = null;
    }

    // Lazy load database service
    async _getDatabaseService() {
        if (!this._databaseService) {
            this._databaseService = require('./databaseService');
        }
        return this._databaseService;
    }

    // دریافت تمام تنظیمات
    async getAllSettings() {
        const { executeQuery } = await this._getDatabaseService();
        const query = 'SELECT * FROM settings ORDER BY setting_key';
        return await executeQuery(query);
    }

    // دریافت یک تنظیم خاص
    async getSetting(key) {
        const { executeQuery } = await this._getDatabaseService();
        const query = 'SELECT setting_value FROM settings WHERE setting_key = ?';
        const result = await executeQuery(query, [key]);
        return result.length > 0 ? result[0].setting_value : null;
    }

    // بروزرسانی تنظیم
    async updateSetting(key, value) {
        const { executeQuery } = await this._getDatabaseService();
        const query = `
            INSERT INTO settings (setting_key, setting_value) 
            VALUES (?, ?) 
            ON DUPLICATE KEY UPDATE 
            setting_value = VALUES(setting_value),
            updated_at = CURRENT_TIMESTAMP
        `;
        return await executeQuery(query, [key, value]);
    }

    // بروزرسانی چندین تنظیم
    async updateMultipleSettings(settings) {
        const promises = Object.entries(settings).map(([key, value]) => 
            this.updateSetting(key, value)
        );
        return await Promise.all(promises);
    }

    // دریافت تنظیمات به صورت object
    async getSettingsObject() {
        const settings = await this.getAllSettings();
        const settingsObj = {};
        settings.forEach(setting => {
            settingsObj[setting.setting_key] = setting.setting_value;
        });
        return settingsObj;
    }

    // بررسی فعال بودن صف
    async isQueueEnabled() {
        const value = await this.getSetting('queue_enabled');
        return value === 'true';
    }

    // دریافت کلید OpenAI
    async getOpenAIKey() {
        return await this.getSetting('openai_api_key');
    }

    // دریافت کلید OpenAI (alias)
    async getOpenAIApiKey() {
        return await this.getSetting('openai_api_key');
    }

    // دریافت حداکثر سایز فایل
    async getMaxFileSize() {
        const value = await this.getSetting('max_file_size');
        return parseInt(value) || 10485760; // 10MB default
    }

    // دریافت انواع فایل مجاز
    async getAllowedFileTypes() {
        const value = await this.getSetting('allowed_file_types');
        return value ? value.split(',') : ['image/jpeg', 'image/png', 'image/jpg'];
    }
}

module.exports = new SettingsService();