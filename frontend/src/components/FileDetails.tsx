// frontend/src/components/FileDetails.tsx - کامپوننت نمایش جزئیات فایل
import React, { useState } from 'react';
import type { FileUpload } from '../types';

interface FileDetailsProps {
  file: FileUpload;
  onClose: () => void;
}

const FileDetails: React.FC<FileDetailsProps> = ({ file, onClose }) => {
  const [showFullImage, setShowFullImage] = useState(false);

  // تابع کمکی برای فرمت تاریخ
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // تابع کمکی برای فرمت سایز فایل
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 بایت';
    const k = 1024;
    const sizes = ['بایت', 'کیلوبایت', 'مگابایت', 'گیگابایت'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // تابع کمکی برای نمایش نوع سند
  const getDocumentTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'check': '💵 چک',
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

  // تابع کمکی برای نمایش وضعیت
  const getStatusLabel = (status: string) => {
    const statuses: { [key: string]: { label: string; color: string } } = {
      'pending': { label: '⏳ در انتظار', color: 'text-yellow-600 bg-yellow-50' },
      'processing': { label: '🔄 در حال پردازش', color: 'text-blue-600 bg-blue-50' },
      'completed': { label: '✅ تکمیل شده', color: 'text-green-600 bg-green-50' },
      'failed': { label: '❌ خطا', color: 'text-red-600 bg-red-50' }
    };
    return statuses[status] || statuses['pending'];
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(file.downloadUrl);
      alert('لینک دانلود در کلیپ‌بورد کپی شد!');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      alert('خطا در کپی کردن لینک');
    }
  };

  const handleDownload = () => {
    window.open(file.downloadUrl, '_blank');
  };

  return (
    <>
      {/* مودال اصلی */}
      <div className="fixed inset-0 bg-black bg-opacity-75 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden" style={{ direction: 'rtl', fontFamily: 'Vazirmatn' }}>
          {/* هدر */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">جزئیات فایل</h3>
              <p className="text-gray-600 mt-1">{file.originalName}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <svg className="h-6 w-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* محتوا */}
          <div className="flex flex-col lg:flex-row h-full">
            {/* بخش تصویر */}
            <div className="lg:w-2/3 p-6 bg-gray-50">
              <div className="bg-white rounded-xl p-6 shadow-sm h-full flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">پیش‌نمایش فایل</h4>
                  {file.mimeType.startsWith('image/') && (
                    <button
                      onClick={() => setShowFullImage(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      مشاهده در سایز واقعی
                    </button>
                  )}
                </div>
                
                <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden">
                  {file.mimeType.startsWith('image/') && file.previewUrl ? (
                    <img 
                      src={file.previewUrl}
                      alt={file.originalName}
                      className="max-w-full max-h-full object-contain rounded-lg cursor-pointer hover:scale-105 transition-transform duration-300"
                      onClick={() => setShowFullImage(true)}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-image.png';
                      }}
                    />
                  ) : (
                    <div className="text-center p-8">
                      <div className="w-32 h-32 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-gray-500 text-lg">پیش‌نمایش برای این نوع فایل در دسترس نیست</p>
                    </div>
                  )}
                </div>

                {/* دکمه‌های عملیات */}
                <div className="flex justify-center space-x-4 space-x-reverse mt-6">
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <svg className="h-5 w-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    دانلود فایل
                  </button>
                  <button
                    onClick={handleCopyLink}
                    className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <svg className="h-5 w-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    کپی لینک
                  </button>
                </div>
              </div>
            </div>

            {/* بخش اطلاعات */}
            <div className="lg:w-1/3 p-6 overflow-y-auto">
              <div className="space-y-6">
                {/* اطلاعات اصلی */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="h-5 w-5 ml-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    اطلاعات اصلی
                  </h4>
                  <div className="space-y-4">
                    <div className="bg-gray-50 px-4 py-3 rounded-lg">
                      <dt className="text-sm font-medium text-gray-500">نام فایل</dt>
                      <dd className="mt-1 text-sm text-gray-900 break-all">{file.originalName}</dd>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 rounded-lg">
                      <dt className="text-sm font-medium text-gray-500">نوع سند</dt>
                      <dd className="mt-1 text-sm text-gray-900">{getDocumentTypeLabel(file.fileType)}</dd>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 rounded-lg">
                      <dt className="text-sm font-medium text-gray-500">حجم فایل</dt>
                      <dd className="mt-1 text-sm text-gray-900">{formatFileSize(file.fileSize)}</dd>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 rounded-lg">
                      <dt className="text-sm font-medium text-gray-500">فرمت فایل</dt>
                      <dd className="mt-1 text-sm text-gray-900">{file.mimeType}</dd>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 rounded-lg">
                      <dt className="text-sm font-medium text-gray-500">تاریخ آپلود</dt>
                      <dd className="mt-1 text-sm text-gray-900">{formatDate(file.uploadedAt)}</dd>
                    </div>
                    {file.processedAt && (
                      <div className="bg-gray-50 px-4 py-3 rounded-lg">
                        <dt className="text-sm font-medium text-gray-500">تاریخ پردازش</dt>
                        <dd className="mt-1 text-sm text-gray-900">{formatDate(file.processedAt)}</dd>
                      </div>
                    )}
                    <div className="bg-gray-50 px-4 py-3 rounded-lg">
                      <dt className="text-sm font-medium text-gray-500">وضعیت پردازش</dt>
                      <dd className="mt-1">
                        <span className={`text-xs px-3 py-1 rounded-full ${getStatusLabel(file.status).color}`}>
                          {getStatusLabel(file.status).label}
                        </span>
                      </dd>
                    </div>
                  </div>
                </div>

                {/* اطلاعات هوش مصنوعی */}
                {file.aiAnalysis && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <svg className="h-5 w-5 ml-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      تحلیل هوش مصنوعی
                    </h4>
                    <div className="bg-green-50 border border-green-200 px-4 py-3 rounded-lg">
                      <p className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">
                        {file.aiAnalysis}
                      </p>
                    </div>
                  </div>
                )}

                {/* اطلاعات استخراج شده */}
                {file.extractedText && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <svg className="h-5 w-5 ml-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      متن استخراج شده
                    </h4>
                    <div className="bg-purple-50 border border-purple-200 px-4 py-3 rounded-lg max-h-40 overflow-y-auto">
                      <p className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">
                        {file.extractedText}
                      </p>
                    </div>
                  </div>
                )}

                {/* اطلاعات اطمینان */}
                {file.confidence && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <svg className="h-5 w-5 ml-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      سطح اطمینان
                    </h4>
                    <div className="bg-orange-50 border border-orange-200 px-4 py-3 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-900">دقت تشخیص:</span>
                        <span className="text-lg font-bold text-orange-600">
                          {Math.round(file.confidence * 100)}%
                        </span>
                      </div>
                      <div className="mt-2 bg-orange-200 rounded-full h-2">
                        <div 
                          className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${file.confidence * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* مودال تصویر در سایز واقعی */}
      {showFullImage && file.mimeType.startsWith('image/') && file.previewUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-[60] flex items-center justify-center p-4">
          <div className="relative max-w-full max-h-full">
            <button
              onClick={() => setShowFullImage(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition-all"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img 
              src={file.previewUrl}
              alt={file.originalName}
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder-image.png';
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default FileDetails;