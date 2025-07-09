// frontend/src/components/Settings.tsx - کامپوننت تنظیمات سیستم
import React, { useState, useEffect } from 'react';
import { 
  Save, 
  TestTube, 
  HardDrive, 
  Zap, 
  Globe, 
  Shield,
  AlertCircle,
  CheckCircle,
  Loader,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react';
import { getSettings, updateSettings, testOpenAIConnection, healthCheck } from '../services/api';
import type { SystemSettings, HealthCheck } from '../types';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings>({
    openai_api_key: '',
    max_file_size: '10MB',
    allowed_file_types: 'image/*,application/pdf',
    queue_enabled: 'true',
    ocr_language: 'fas+eng',
    ai_model: 'gpt-4-vision-preview'
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [health, setHealth] = useState<HealthCheck | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'ai' | 'system' | 'health'>('general');

  // بارگذاری تنظیمات
  useEffect(() => {
    loadSettings();
    checkHealth();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await getSettings();
      setSettings(data);
    } catch (error) {
      console.error('Error loading settings:', error);
      showNotification('خطا در بارگذاری تنظیمات', 'error');
    } finally {
      setLoading(false);
    }
  };

  const checkHealth = async () => {
    try {
      const healthData = await healthCheck();
      setHealth(healthData);
    } catch (error) {
      console.error('Health check failed:', error);
    }
  };

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    // In real app, use toast library
    alert(`${type.toUpperCase()}: ${message}`);
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      await updateSettings(settings);
      showNotification('تنظیمات با موفقیت ذخیره شدند', 'success');
    } catch (error) {
      console.error('Error saving settings:', error);
      showNotification('خطا در ذخیره تنظیمات', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleTestOpenAI = async () => {
    try {
      setTesting(true);
      setTestResult(null);
      
      const result = await testOpenAIConnection(settings.openai_api_key);
      
      setTestResult({
        success: result,
        message: result ? 'اتصال موفق!' : 'اتصال ناموفق - کلید را بررسی کنید'
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'خطای نامشخص'
      });
    } finally {
      setTesting(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'عمومی', icon: <Globe className="w-4 h-4" /> },
    { id: 'ai', label: 'هوش مصنوعی', icon: <Zap className="w-4 h-4" /> },
    { id: 'system', label: 'سیستم', icon: <HardDrive className="w-4 h-4" /> },
    { id: 'health', label: 'سلامت سیستم', icon: <Shield className="w-4 h-4" /> }
  ];

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
          <div className="text-center">
            <Loader className="w-8 h-8 animate-spin text-white mx-auto mb-4" />
            <p className="text-white/70">در حال بارگذاری تنظیمات...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      {/* تب‌ها */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden">
        <div className="flex flex-wrap border-b border-white/20">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors flex-1 min-w-0 ${
                activeTab === tab.id
                  ? 'bg-blue-500/20 text-blue-300 border-b-2 border-blue-400'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.icon}
              <span className="truncate">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* تنظیمات عمومی */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">تنظیمات عمومی</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      حداکثر حجم فایل
                    </label>
                    <select
                      value={settings.max_file_size}
                      onChange={(e) => setSettings({...settings, max_file_size: e.target.value})}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-400"
                    >
                      <option value="5MB">5 مگابایت</option>
                      <option value="10MB">10 مگابایت</option>
                      <option value="25MB">25 مگابایت</option>
                      <option value="50MB">50 مگابایت</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      انواع فایل مجاز
                    </label>
                    <input
                      type="text"
                      value={settings.allowed_file_types}
                      onChange={(e) => setSettings({...settings, allowed_file_types: e.target.value})}
                      placeholder="image/*,application/pdf"
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-blue-400"
                    />
                    <p className="text-white/50 text-xs mt-1">
                      مثال: image/*,application/pdf,.docx
                    </p>
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      زبان OCR
                    </label>
                    <select
                      value={settings.ocr_language}
                      onChange={(e) => setSettings({...settings, ocr_language: e.target.value})}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-400"
                    >
                      <option value="fas">فارسی</option>
                      <option value="eng">انگلیسی</option>
                      <option value="fas+eng">فارسی + انگلیسی</option>
                      <option value="ara">عربی</option>
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={settings.queue_enabled === 'true'}
                        onChange={(e) => setSettings({...settings, queue_enabled: e.target.checked ? 'true' : 'false'})}
                        className="w-5 h-5 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500"
                      />
                      <span className="text-white/80">فعال‌سازی صف پردازش</span>
                    </label>
                    <p className="text-white/50 text-xs mt-1 mr-8">
                      برای پردازش همزمان چندین فایل
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* تنظیمات هوش مصنوعی */}
          {activeTab === 'ai' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">تنظیمات هوش مصنوعی</h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      کلید API OpenAI
                    </label>
                    <div className="relative">
                      <input
                        type={showApiKey ? 'text' : 'password'}
                        value={settings.openai_api_key}
                        onChange={(e) => setSettings({...settings, openai_api_key: e.target.value})}
                        placeholder="sk-..."
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 pr-12 text-white placeholder-white/50 focus:outline-none focus:border-blue-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white"
                      >
                        {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={handleTestOpenAI}
                        disabled={testing || !settings.openai_api_key}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
                      >
                        {testing ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <TestTube className="w-4 h-4" />
                        )}
                        {testing ? 'در حال تست...' : 'تست اتصال'}
                      </button>
                      
                      {testResult && (
                        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                          testResult.success 
                            ? 'bg-green-500/20 text-green-300' 
                            : 'bg-red-500/20 text-red-300'
                        }`}>
                          {testResult.success ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <AlertCircle className="w-4 h-4" />
                          )}
                          <span className="text-sm">{testResult.message}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      مدل هوش مصنوعی
                    </label>
                    <select
                      value={settings.ai_model}
                      onChange={(e) => setSettings({...settings, ai_model: e.target.value})}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-400"
                    >
                      <option value="gpt-4-vision-preview">GPT-4 Vision (توصیه شده)</option>
                      <option value="gpt-4">GPT-4</option>
                      <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                    </select>
                    <p className="text-white/50 text-xs mt-1">
                      مدل GPT-4 Vision برای تحلیل تصاویر بهتر است
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* تنظیمات سیستم */}
          {activeTab === 'system' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">تنظیمات سیستم</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/5 rounded-xl p-4">
                    <h4 className="text-white font-medium mb-3">پردازش</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/70">حداکثر زمان پردازش:</span>
                        <span className="text-white">300 ثانیه</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">تعداد همزمان:</span>
                        <span className="text-white">3 فایل</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">حذف خودکار خطاها:</span>
                        <span className="text-white">بعد از 7 روز</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-xl p-4">
                    <h4 className="text-white font-medium mb-3">ذخیره‌سازی</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/70">مسیر آپلود:</span>
                        <span className="text-white">/uploads</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">فشرده‌سازی:</span>
                        <span className="text-white">فعال</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">پشتیبان‌گیری:</span>
                        <span className="text-white">روزانه</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* سلامت سیستم */}
          {activeTab === 'health' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">سلامت سیستم</h3>
                <button
                  onClick={checkHealth}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  بروزرسانی
                </button>
              </div>
              
              {health && (
                <div className="space-y-4">
                  <div className={`p-4 rounded-xl border-2 ${
                    health.status === 'OK' 
                      ? 'bg-green-500/20 border-green-400/50 text-green-300'
                      : health.status === 'DEGRADED'
                      ? 'bg-yellow-500/20 border-yellow-400/50 text-yellow-300'
                      : 'bg-red-500/20 border-red-400/50 text-red-300'
                  }`}>
                    <div className="flex items-center gap-3">
                      {health.status === 'OK' ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <AlertCircle className="w-6 h-6" />
                      )}
                      <div>
                        <h4 className="font-semibold">وضعیت کلی: {health.status}</h4>
                        <p className="text-sm opacity-90">{health.message}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(health.services).map(([service, status]) => (
                      <div
                        key={service}
                        className={`p-4 rounded-xl border ${
                          status 
                            ? 'bg-green-500/10 border-green-400/30 text-green-300'
                            : 'bg-red-500/10 border-red-400/30 text-red-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">
                            {service === 'database' ? 'پایگاه داده' :
                             service === 'redis' ? 'ردیس' :
                             service === 'openai' ? 'OpenAI' :
                             service === 'fileSystem' ? 'سیستم فایل' :
                             service}
                          </span>
                          {status ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            <AlertCircle className="w-5 h-5" />
                          )}
                        </div>
                        <p className="text-sm opacity-75 mt-1">
                          {status ? 'عملکرد طبیعی' : 'خطا در اتصال'}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white/5 rounded-xl p-4">
                    <h4 className="text-white font-medium mb-3">اطلاعات سیستم</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-white/70">نسخه:</span>
                        <span className="text-white mr-2">{health.version || '1.0.0'}</span>
                      </div>
                      <div>
                        <span className="text-white/70">مدت فعالیت:</span>
                        <span className="text-white mr-2">
                          {health.uptime ? Math.round(health.uptime / 3600) : 0} ساعت
                        </span>
                      </div>
                      <div>
                        <span className="text-white/70">آخرین بررسی:</span>
                        <span className="text-white mr-2">
                          {new Date(health.timestamp).toLocaleTimeString('fa-IR')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* دکمه ذخیره */}
        <div className="border-t border-white/20 p-6">
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="flex items-center justify-center gap-2 w-full md:w-auto px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-xl font-medium transition-colors"
          >
            {saving ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {saving ? 'در حال ذخیره...' : 'ذخیره تنظیمات'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;