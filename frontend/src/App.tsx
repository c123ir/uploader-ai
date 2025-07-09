// frontend/src/App.tsx - اپلیکیشن فوق‌العاده ساده
import React, { useState } from 'react';
import { Upload, FileText, Settings as SettingsIcon } from 'lucide-react';
import FileUploader from './components/FileUploader';
import FileList from './components/FileList';
import SettingsComponent from './components/Settings';
import './App.css';

type TabType = 'upload' | 'files' | 'settings';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('upload');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800 relative">
      {/* Header ساده */}
      <header className="bg-white bg-opacity-10 backdrop-blur-lg border-b border-white border-opacity-20">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* لوگو */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🚀</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Uploader AI</h1>
                <p className="text-white text-opacity-70 text-sm">سیستم هوشمند پردازش اسناد</p>
              </div>
            </div>

            {/* تب‌های ساده */}
            <nav className="hidden md:flex items-center gap-2">
              <button
                onClick={() => setActiveTab('upload')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                  activeTab === 'upload'
                    ? 'bg-white bg-opacity-20 text-white shadow-lg'
                    : 'text-white text-opacity-70 hover:text-white hover:bg-white hover:bg-opacity-10'
                }`}
              >
                <Upload className="w-5 h-5" />
                آپلود فایل
              </button>
              
              <button
                onClick={() => setActiveTab('files')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                  activeTab === 'files'
                    ? 'bg-white bg-opacity-20 text-white shadow-lg'
                    : 'text-white text-opacity-70 hover:text-white hover:bg-white hover:bg-opacity-10'
                }`}
              >
                <FileText className="w-5 h-5" />
                فایل‌ها
              </button>
              
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                  activeTab === 'settings'
                    ? 'bg-white bg-opacity-20 text-white shadow-lg'
                    : 'text-white text-opacity-70 hover:text-white hover:bg-white hover:bg-opacity-10'
                }`}
              >
                <SettingsIcon className="w-5 h-5" />
                تنظیمات
              </button>
            </nav>

            {/* منوی موبایل */}
            <div className="md:hidden">
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value as TabType)}
                className="bg-white bg-opacity-20 border border-white border-opacity-30 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-400"
              >
                <option value="upload">📤 آپلود</option>
                <option value="files">📁 فایل‌ها</option>
                <option value="settings">⚙️ تنظیمات</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* محتوای اصلی */}
      <main className="py-8 px-4">
        {activeTab === 'upload' && <FileUploader />}
        {activeTab === 'files' && <FileList />}
        {activeTab === 'settings' && <SettingsComponent />}
      </main>

      {/* فوتر ساده */}
      <footer className="text-center text-white text-opacity-60 py-6">
        <p>🚀 Uploader AI - سیستم هوشمند پردازش اسناد</p>
      </footer>
    </div>
  );
};

export default App;