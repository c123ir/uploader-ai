// frontend/src/components/Settings.tsx - کامپوننت تنظیمات
import React, { useState, useEffect } from 'react';
import { ApiService } from '../services/api';
import type { Settings as SettingsType } from '../types';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<SettingsType>({
    openai_api_key: '',
    max_file_size: '10485760', // 10MB
    allowed_file_types: 'image/jpeg,image/png,image/gif',
    queue_enabled: 'false',
    ocr_language: 'fas+eng',
    ai_model: 'gpt-3.5-turbo'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getSettings();
      if (response.success && response.data) {
        setSettings(response.data);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'خطا در بارگیری تنظیمات' });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      setMessage(null);
      
      const response = await ApiService.updateSettings(settings);
      if (response.success) {
        setMessage({ type: 'success', text: 'تنظیمات با موفقیت ذخیره شد' });
      } else {
        setMessage({ type: 'error', text: response.message || 'خطا در ذخیره تنظیمات' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'خطا در ذخیره تنظیمات' });
    } finally {
      setSaving(false);
    }
  };

  const testOpenAI = async () => {
    try {
      setTesting(true);
      setMessage(null);
      
      const response = await ApiService.testOpenAIConnection(settings.openai_api_key);
      if (response.success) {
        setMessage({ type: 'success', text: 'اتصال به OpenAI موفقیت‌آمیز بود' });
      } else {
        setMessage({ type: 'error', text: response.message || 'خطا در اتصال به OpenAI' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'خطا در تست اتصال' });
    } finally {
      setTesting(false);
    }
  };

  const formatFileSize = (bytes: string) => {
    return Math.round(parseInt(bytes) / (1024 * 1024)) + ' MB';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const fileTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const currentTypes = settings.allowed_file_types.split(',').map(t => t.trim()).filter(t => t);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
            تنظیمات سیستم
          </h3>

          {message && (
            <div className={`mb-4 p-4 rounded-md ${
              message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              {message.text}
            </div>
          )}

          <div className="space-y-6">
            {/* کلید OpenAI */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                کلید API OpenAI
              </label>
              <div className="flex space-x-2 space-x-reverse">
                <input
                  type="password"
                  value={settings.openai_api_key}
                  onChange={(e) => setSettings({ ...settings, openai_api_key: e.target.value })}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="sk-..."
                />
                <button
                  onClick={testOpenAI}
                  disabled={testing || !settings.openai_api_key}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {testing ? 'در حال تست...' : 'تست اتصال'}
                </button>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                کلید API خود را از OpenAI دریافت کنید
              </p>
            </div>

            {/* حداکثر حجم فایل */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                حداکثر حجم فایل: {formatFileSize(settings.max_file_size)}
              </label>
              <input
                type="range"
                min="1048576" // 1MB
                max="52428800" // 50MB
                step="1048576" // 1MB
                value={parseInt(settings.max_file_size)}
                onChange={(e) => setSettings({ ...settings, max_file_size: e.target.value })}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1 MB</span>
                <span>50 MB</span>
              </div>
            </div>

            {/* انواع فایل مجاز */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                انواع فایل مجاز
              </label>
              <div className="space-y-2">
                {fileTypes.map((type) => (
                  <label key={type} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={currentTypes.includes(type)}
                      onChange={(e) => {
                        const newTypes = e.target.checked
                          ? [...currentTypes, type]
                          : currentTypes.filter(t => t !== type);
                        setSettings({
                          ...settings,
                          allowed_file_types: newTypes.join(',')
                        });
                      }}
                      className="ml-2"
                    />
                    {type.replace('image/', '').toUpperCase()}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={saveSettings}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'در حال ذخیره...' : 'ذخیره تنظیمات'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;