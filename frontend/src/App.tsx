import { useState } from 'react';
import FileUploader from './components/FileUploader';
import FileList from './components/FileList';
import Settings from './components/Settings';
import type { FileUpload } from './types';

type TabType = 'upload' | 'files' | 'settings';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('upload');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleUploadSuccess = (file: FileUpload) => {
    setNotification({ type: 'success', message: `فایل ${file.originalName} با موفقیت آپلود شد` });
    setRefreshTrigger(prev => prev + 1);
    setTimeout(() => setNotification(null), 5000);
  };

  const handleUploadError = (error: string) => {
    setNotification({ type: 'error', message: error });
    setTimeout(() => setNotification(null), 5000);
  };

  const tabs = [
    { id: 'upload', label: 'آپلود فایل' },
    { id: 'files', label: 'فایل‌ها' },
    { id: 'settings', label: 'تنظیمات' }
  ];

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      direction: 'rtl'
    }}>
      {/* Header */}
      <header style={{ 
        padding: '20px',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        marginBottom: '20px'
      }}>
        <h1 style={{ 
          color: 'white', 
          textAlign: 'center',
          fontSize: '32px',
          margin: 0
        }}>
          🚀 Uploader AI
        </h1>
        <p style={{ 
          color: 'rgba(255, 255, 255, 0.8)', 
          textAlign: 'center',
          margin: '10px 0 0 0'
        }}>
          سیستم هوشمند پردازش اسناد
        </p>
      </header>

      {/* Navigation */}
      <nav style={{ 
        padding: '0 20px',
        marginBottom: '20px'
      }}>
        <div style={{ 
          display: 'flex',
          gap: '10px',
          justifyContent: 'center'
        }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              style={{
                padding: '15px 30px',
                backgroundColor: activeTab === tab.id 
                  ? 'rgba(255, 255, 255, 0.9)' 
                  : 'rgba(255, 255, 255, 0.1)',
                color: activeTab === tab.id ? '#333' : 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '16px',
                transition: 'all 0.3s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main style={{ 
        padding: '20px',
        minHeight: '60vh'
      }}>
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '15px',
          padding: '30px',
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          {activeTab === 'upload' && (
            <FileUploader 
              onUploadSuccess={handleUploadSuccess} 
              onUploadError={handleUploadError} 
            />
          )}
          {activeTab === 'files' && (
            <FileList refreshTrigger={refreshTrigger} />
          )}
          {activeTab === 'settings' && (
            <Settings />
          )}
        </div>
      </main>

      {/* Notification */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          backgroundColor: notification.type === 'success' ? '#10b981' : '#ef4444',
          color: 'white',
          padding: '15px 25px',
          borderRadius: '10px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
        }}>
          {notification.message}
          <button 
            onClick={() => setNotification(null)}
            style={{
              marginRight: '15px',
              backgroundColor: 'transparent',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
