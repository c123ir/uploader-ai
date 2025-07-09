// frontend/src/components/FileDetails.tsx - مودال نمایش جزئیات فایل
import React, { useState, useEffect } from 'react';
import { X, Download, Copy, ZoomIn, ZoomOut, RotateCw, Share2, FileText, Database, Brain, Eye, EyeOff } from 'lucide-react';
import type { FileUpload } from '../types';

interface FileDetailsProps {
  file: FileUpload;
  onClose: () => void;
}

const FileDetails: React.FC<FileDetailsProps> = ({ file, onClose }) => {
  const [imageZoom, setImageZoom] = useState(1);
  const [imageRotation, setImageRotation] = useState(0);
  const [showFullText, setShowFullText] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'extracted' | 'analysis'>('overview');

  // بستن مودال با ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // جلوگیری از اسکرول body
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 بایت';
    const k = 1024;
    const sizes = ['بایت', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getDocumentTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'check': '💵 چک بانکی',
      'contract': '📋 قرارداد',
      'invoice': '🧾 فاکتور',
      'id_card': '🆔 کارت ملی',
      'birth_certificate': '📄 شناسنامه',
      'license': '🎓 گواهینامه',
      'letter': '💌 نامه',
      'form': '📝 فرم',
      'report': '📊 گزارش',
      'other': '📄 سند',
      'unknown': '❓ نامشخص'
    };
    return types[type] || types['unknown'];
  };

  const getStatusInfo = (status: string) => {
    const statuses: { [key: string]: { label: string; color: string; icon: string } } = {
      'pending': { label: 'در انتظار پردازش', color: 'text-yellow-400 bg-yellow-500/20', icon: '⏳' },
      'processing': { label: 'در حال پردازش', color: 'text-blue-400 bg-blue-500/20', icon: '🔄' },
      'completed': { label: 'پردازش کامل', color: 'text-green-400 bg-green-500/20', icon: '✅' },
      'failed': { label: 'پردازش ناموفق', color: 'text-red-400 bg-red-500/20', icon: '❌' }
    };
    return statuses[status] || statuses['pending'];
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(file.downloadUrl);
      alert('لینک دانلود کپی شد! 📋');
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: file.originalName,
          text: `فایل: ${file.originalName}`,
          url: file.downloadUrl,
        });
      } catch (error) {
        console.log('اشتراک‌گذاری لغو شد');
      }
    } else {
      handleCopyLink();
    }
  };

  const tabs = [
    { id: 'overview', label: 'اطلاعات کلی', icon: <Database className="w-4 h-4" /> },
    { id: 'extracted', label: 'متن استخراج شده', icon: <FileText className="w-4 h-4" /> },
    { id: 'analysis', label: 'تحلیل هوش مصنوعی', icon: <Brain className="w-4 h-4" /> }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-6xl h-full max-h-[90vh] bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden">
        {/* هدر */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              {file.mimeType?.startsWith('image/') ? (
                <img
                  src={file.downloadUrl}
                  alt={file.originalName}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <FileText className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white truncate max-w-sm">
                {file.originalName}
              </h2>
              <p className="text-white/70 text-sm">
                {getDocumentTypeLabel(file.fileType)} • {formatFileSize(file.fileSize)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              title="اشتراک‌گذاری"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <a
              href={file.downloadUrl}
              download
              className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              title="دانلود فایل"
            >
              <Download className="w-5 h-5" />
            </a>
            <button
              onClick={onClose}
              className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              title="بستن"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex h-[calc(100%-80px)]">
          {/* پیش‌نمایش تصویر */}
          {file.mimeType?.startsWith('image/') && (
            <div className="flex-1 bg-black/20 relative overflow-auto">
              <div className="absolute top-4 left-4 z-10 flex gap-2">
                <button
                  onClick={() => setImageZoom(Math.max(0.5, imageZoom - 0.25))}
                  className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-lg backdrop-blur-sm"
                  disabled={imageZoom <= 0.5}
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setImageZoom(Math.min(3, imageZoom + 0.25))}
                  className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-lg backdrop-blur-sm"
                  disabled={imageZoom >= 3}
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setImageRotation((imageRotation + 90) % 360)}
                  className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-lg backdrop-blur-sm"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
                <div className="px-3 py-2 bg-black/50 text-white rounded-lg backdrop-blur-sm text-sm">
                  {Math.round(imageZoom * 100)}%
                </div>
              </div>
              
              <div className="flex items-center justify-center min-h-full p-4">
                <img
                  src={file.downloadUrl}
                  alt={file.originalName}
                  className="max-w-none transition-transform duration-200"
                  style={{
                    transform: `scale(${imageZoom}) rotate(${imageRotation}deg)`,
                    transformOrigin: 'center'
                  }}
                />
              </div>
            </div>
          )}

          {/* پنل اطلاعات */}
          <div className="w-full lg:w-96 bg-white/5 border-r border-white/20 flex flex-col">
            {/* تب‌ها */}
            <div className="flex border-b border-white/20">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center gap-2 p-3 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/10'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* محتوای تب‌ها */}
            <div className="flex-1 overflow-auto p-6 space-y-6">
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  {/* وضعیت پردازش */}
                  <div className="bg-white/10 rounded-xl p-4">
                    <h3 className="text-white font-medium mb-3">وضعیت پردازش</h3>
                    <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${getStatusInfo(file.status).color}`}>
                      <span>{getStatusInfo(file.status).icon}</span>
                      {getStatusInfo(file.status).label}
                    </div>
                  </div>

                  {/* جزئیات فایل */}
                  <div className="bg-white/10 rounded-xl p-4 space-y-3">
                    <h3 className="text-white font-medium mb-3">جزئیات فایل</h3>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-white/60">نام فایل:</span>
                        <p className="text-white font-medium break-all">{file.originalName}</p>
                      </div>
                      
                      <div>
                        <span className="text-white/60">حجم:</span>
                        <p className="text-white font-medium">{formatFileSize(file.fileSize)}</p>
                      </div>
                      
                      <div>
                        <span className="text-white/60">نوع فایل:</span>
                        <p className="text-white font-medium">{file.mimeType}</p>
                      </div>
                      
                      <div>
                        <span className="text-white/60">نوع سند:</span>
                        <p className="text-white font-medium">{getDocumentTypeLabel(file.fileType)}</p>
                      </div>
                      
                      <div className="col-span-2">
                        <span className="text-white/60">تاریخ آپلود:</span>
                        <p className="text-white font-medium">{formatDate(file.uploadedAt)}</p>
                      </div>
                      
                      {file.processedAt && (
                        <div className="col-span-2">
                          <span className="text-white/60">تاریخ پردازش:</span>
                          <p className="text-white font-medium">{formatDate(file.processedAt)}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* دکمه‌های عملیات */}
                  <div className="space-y-2">
                    <button
                      onClick={handleCopyLink}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
                    >
                      <Copy className="w-5 h-5" />
                      کپی لینک دانلود
                    </button>
                    
                    <a
                      href={file.downloadUrl}
                      download
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors"
                    >
                      <Download className="w-5 h-5" />
                      دانلود فایل اصلی
                    </a>
                  </div>
                </div>
              )}

              {activeTab === 'extracted' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-medium">متن استخراج شده (OCR)</h3>
                    {file.extractedText && (
                      <button
                        onClick={() => setShowFullText(!showFullText)}
                        className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm"
                      >
                        {showFullText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        {showFullText ? 'خلاصه' : 'کامل'}
                      </button>
                    )}
                  </div>
                  
                  <div className="bg-white/10 rounded-xl p-4">
                    {file.extractedText ? (
                      <div className="space-y-3">
                        <div className="text-white/70 text-sm">
                          طول متن: {file.extractedText.length} کاراکتر
                        </div>
                        <div className="bg-black/20 rounded-lg p-4 max-h-80 overflow-auto">
                          <pre className="text-white text-sm whitespace-pre-wrap font-mono leading-relaxed">
                            {showFullText ? file.extractedText : file.extractedText.substring(0, 500) + (file.extractedText.length > 500 ? '...' : '')}
                          </pre>
                        </div>
                        <button
                          onClick={() => navigator.clipboard.writeText(file.extractedText || '')}
                          className="w-full px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm"
                        >
                          کپی متن
                        </button>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-white/60">
                        <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>متنی استخراج نشده است</p>
                        <p className="text-sm mt-1">
                          {file.status === 'pending' ? 'پردازش در انتظار است' :
                           file.status === 'processing' ? 'در حال پردازش...' :
                           'استخراج متن ممکن نیست'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'analysis' && (
                <div className="space-y-4">
                  <h3 className="text-white font-medium">تحلیل هوش مصنوعی</h3>
                  
                  <div className="bg-white/10 rounded-xl p-4">
                    {file.aiAnalysis ? (
                      <div className="space-y-3">
                        <div className="text-white/70 text-sm">
                          درجه اطمینان: {file.confidence ? Math.round(file.confidence * 100) : 0}%
                        </div>
                        <div className="bg-black/20 rounded-lg p-4 max-h-80 overflow-auto">
                          <div className="text-white text-sm leading-relaxed">
                            {file.aiAnalysis}
                          </div>
                        </div>
                        <button
                          onClick={() => navigator.clipboard.writeText(file.aiAnalysis || '')}
                          className="w-full px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm"
                        >
                          کپی تحلیل
                        </button>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-white/60">
                        <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>تحلیل هوش مصنوعی انجام نشده است</p>
                        <p className="text-sm mt-1">
                          {file.status === 'pending' ? 'پردازش در انتظار است' :
                           file.status === 'processing' ? 'در حال تحلیل...' :
                           'تحلیل ممکن نیست'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileDetails;