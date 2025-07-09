// frontend/src/App.tsx - کامپوننت اصلی اپلیکیشن
import React, { useState, useEffect } from 'react';
import { Upload, FileText, Settings as SettingsIcon, Menu, X, RefreshCw, Zap } from 'lucide-react';
import FileUploader from './components/FileUploader';
import FileList from './components/FileList';
import SettingsComponent from './components/Settings';
import type { FileUpload } from './types';
import './App.css';

type TabType = 'upload' | 'files' | 'settings';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('upload');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [recentFiles, setRecentFiles] = useState<FileUpload[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // مدیریت وضعیت اتصال اینترنت
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // مدیریت آپلود موفق
  const handleUploadSuccess = (file: FileUpload) => {
    setRecentFiles(prev => [file, ...prev.slice(0, 4)]);
    // Toast notification
    showNotification('فایل با موفقیت آپلود شد! 🎉', 'success');
  };

  // مدیریت خطای آپلود
  const handleUploadError = (error: string) => {
    showNotification(`خطا در آپلود: ${error}`, 'error');
  };

  // نمایش نوتیفیکیشن
  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    // در پروژه واقعی از کتابخانه toast استفاده کنید
    console.log(`${type.toUpperCase()}: ${message}`);
  };

  // تعریف تب‌ها
  const tabs = [
    {
      id: 'upload' as TabType,
      label: 'آپلود فایل',
      icon: <Upload className="w-5 h-5" />,
      description: 'آپلود و تشخیص اسناد'
    },
    {
      id: 'files' as TabType,
      label: 'فایل‌ها',
      icon: <FileText className="w-5 h-5" />,
      description: 'مشاهده و مدیریت فایل‌ها'
    },
    {
      id: 'settings' as TabType,
      label: 'تنظیمات',
      icon: <SettingsIcon className="w-5 h-5" />,
      description: 'تنظیمات سیستم'
    }
  ];

  const currentTab = tabs.find(tab => tab.id === activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full bg-gradient-to-br from-white/10 to-transparent animate-pulse"></div>
      </div>
      
      {/* Status Bar */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white text-center py-2 text-sm">
          🔌 اتصال اینترنت قطع است - برخی قابلیت‌ها در دسترس نیستند
        </div>
      )}

      {/* Header */}
      <header className="relative z-10 bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-600 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Uploader AI 🚀</h1>
                <p className="text-white/70 text-sm hidden sm:block">سیستم هوشمند پردازش اسناد</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white/10 backdrop-blur-lg border-t border-white/20">
            <div className="px-4 py-2 space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-right ${
                    activeTab === tab.id
                      ? 'bg-white/20 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {tab.icon}
                  <div className="text-right">
                    <div>{tab.label}</div>
                    <div className="text-xs text-white/50">{tab.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Page Header */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              {currentTab?.icon && React.cloneElement(currentTab.icon, { className: 'w-8 h-8 text-white' })}
            </div>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            {currentTab?.label}
          </h2>
          <p className="text-white/80 text-lg">
            {currentTab?.description}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {activeTab === 'upload' && (
            <div className="space-y-8">
              <FileUploader
                onUploadSuccess={handleUploadSuccess}
                onUploadError={handleUploadError}
              />
              
              {/* Recent Files */}
              {recentFiles.length > 0 && (
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <RefreshCw className="w-5 h-5" />
                    آخرین فایل‌های آپلود شده
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {recentFiles.map((file) => (
                      <div
                        key={file.id}
                        className="bg-white/10 rounded-xl p-4 hover:bg-white/20 transition-colors cursor-pointer"
                        onClick={() => setActiveTab('files')}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                            {file.mimeType?.startsWith('image/') ? (
                              <img
                                src={file.downloadUrl}
                                alt={file.originalName}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <FileText className="w-5 h-5 text-white" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium text-sm truncate">
                              {file.originalName}
                            </p>
                            <p className="text-white/60 text-xs">
                              {file.status === 'completed' ? '✅' : '🔄'} {new Date(file.uploadedAt).toLocaleTimeString('fa-IR')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'files' && <FileList />}
          {activeTab === 'settings' && <SettingsComponent />}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/20 bg-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-white/70 text-sm text-center sm:text-right">
              <p>🚀 Uploader AI - سیستم هوشمند پردازش اسناد</p>
              <p className="mt-1">ساخته شده با ❤️ برای تسهیل کار شما</p>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-white/60">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`}></div>
                {isOnline ? 'آنلاین' : 'آفلاین'}
              </div>
              <div>
                نسخه 1.0.0
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Action Button - Mobile */}
      <div className="fixed bottom-6 left-6 md:hidden z-20">
        <button
          onClick={() => setActiveTab('upload')}
          className={`w-14 h-14 rounded-full shadow-lg backdrop-blur-sm transition-all ${
            activeTab === 'upload'
              ? 'bg-blue-600 text-white scale-110'
              : 'bg-white/20 text-white hover:bg-white/30'
          }`}
        >
          <Upload className="w-6 h-6 mx-auto" />
        </button>
      </div>
    </div>
  );
};

export default App;