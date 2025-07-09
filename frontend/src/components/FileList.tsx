// frontend/src/components/FileList.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { ApiService } from '../services/api';
import FileDetails from './FileDetails';
import type { FileUpload } from '../types';

interface FileListProps {
  refreshTrigger: number;
}

const FileList: React.FC<FileListProps> = ({ refreshTrigger }) => {
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<FileUpload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Helpers
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 بایت';
    const k = 1024;
    const sizes = ['بایت', 'کیلوبایت', 'مگابایت', 'گیگابایت'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('application/pdf')) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-red-50">
          <svg className="h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
      );
    }
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      </div>
    );
  };

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

  const getStatusLabel = (status: string) => {
    const statuses: { [key: string]: { label: string; color: string } } = {
      'pending': { label: '⏳ در انتظار', color: 'text-yellow-600 bg-yellow-50' },
      'processing': { label: '🔄 در حال پردازش', color: 'text-blue-600 bg-blue-50' },
      'completed': { label: '✅ تکمیل شده', color: 'text-green-600 bg-green-50' },
      'failed': { label: '❌ خطا', color: 'text-red-600 bg-red-50' }
    };
    return statuses[status] || statuses['pending'];
  };

  // فیلتر کردن فایل‌ها بر اساس جستجو و فیلترها
  const filteredFiles = useMemo(() => {
    return files.filter(file => {
      const matchesSearch = searchTerm === '' ||
        file.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getDocumentTypeLabel(file.fileType).toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || file.status === statusFilter;
      const matchesType = typeFilter === 'all' || file.fileType === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [files, searchTerm, statusFilter, typeFilter]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ApiService.getFiles();
      if (response.success && response.data?.files) {
        setFiles(response.data.files);
      } else {
        setError(response.message || 'خطا در بارگیری فایل‌ها');
        setFiles([]);
      }
    } catch (error) {
      setError('خطا در بارگیری فایل‌ها');
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, [refreshTrigger]);

  const handleDelete = async (fileId: string) => {
    if (!confirm('آیا از حذف این فایل اطمینان دارید؟')) return;
    try {
      const response = await ApiService.deleteFile(fileId);
      if (response.success) {
        setFiles(files.filter(f => f.id !== fileId));
        if (selectedFile?.id === fileId) {
          setSelectedFile(null);
          setShowModal(false);
        }
      } else {
        alert(response.message || 'خطا در حذف فایل');
      }
    } catch {
      alert('خطا در حذف فایل');
    }
  };

  const handleFileClick = (file: FileUpload) => {
    setSelectedFile(file);
    setShowModal(true);
  };

  const handleCopyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      alert('لینک دانلود در کلیپ‌بورد کپی شد!');
    } catch {
      alert('خطا در کپی کردن لینک');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setTypeFilter('all');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">در حال بارگیری فایل‌ها...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-4">
        <div className="flex items-center space-x-3 space-x-reverse">
          <svg className="h-6 w-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-800">{error}</p>
        </div>
        <button 
          onClick={loadFiles}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          تلاش مجدد
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-8" style={{ direction: 'rtl', fontFamily: 'Vazirmatn' }}>
      {/* هدر و کنترل‌ها */}
      <div className="flex justify-between items-center bg-white rounded-lg p-4 shadow-sm">
        <div>
          <h3 className="text-xl font-bold text-gray-900">گالری فایل‌ها</h3>
          <p className="text-gray-600 text-sm mt-1">
            {filteredFiles.length} از {files.length} فایل
          </p>
        </div>
        <div className="flex items-center space-x-2 space-x-reverse">
          <button
            onClick={() => setView('grid')}
            className={`p-3 rounded-lg transition-all ${
              view === 'grid' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="نمایش گالری"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            onClick={() => setView('list')}
            className={`p-3 rounded-lg transition-all ${
              view === 'list' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="نمایش لیستی"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* فیلترها و جستجو */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* جستجو */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">جستجو</label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="جستجو بر اساس نام فایل یا نوع سند..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          {/* فیلتر وضعیت */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">وضعیت</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">همه وضعیت‌ها</option>
              <option value="pending">⏳ در انتظار</option>
              <option value="processing">🔄 در حال پردازش</option>
              <option value="completed">✅ تکمیل شده</option>
              <option value="failed">❌ خطا</option>
            </select>
          </div>
          {/* فیلتر نوع */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">نوع سند</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">همه انواع</option>
              <option value="check">💵 چک</option>
              <option value="contract">📋 قرارداد</option>
              <option value="invoice">🧾 فاکتور</option>
              <option value="id_card">🆔 کارت ملی</option>
              <option value="birth_certificate">📄 شناسنامه</option>
              <option value="license">🎓 گواهینامه</option>
              <option value="letter">💌 نامه</option>
              <option value="form">📝 فرم</option>
              <option value="report">📊 گزارش</option>
              <option value="other">📄 سند</option>
            </select>
          </div>
        </div>
        {(searchTerm || statusFilter !== 'all' || typeFilter !== 'all') && (
          <div className="mt-4">
            <button
              onClick={clearFilters}
              className="text-sm text-gray-600 hover:text-gray-800 flex items-center"
            >
              <svg className="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              پاک کردن فیلترها
            </button>
          </div>
        )}
      </div>

      {/* نمایش فایل‌ها */}
      {filteredFiles.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {files.length === 0 ? 'هیچ فایلی یافت نشد' : 'نتیجه‌ای یافت نشد'}
          </h3>
          <p className="text-gray-500">
            {files.length === 0 ? 'هنوز فایلی آپلود نکرده‌اید' : 'فیلترهای اعمال شده نتیجه‌ای ندارند'}
          </p>
        </div>
      ) : (
        <div className={view === 'grid' ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4' : 'space-y-3'}>
          {filteredFiles.map((file) => (
            view === 'grid' ? (
              <div
                key={file.id}
                className="group relative bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border border-gray-200"
                onClick={() => handleFileClick(file)}
              >
                <div className="w-[150px] h-[150px] overflow-hidden bg-gray-50 flex items-center justify-center">
                  {(file.mimeType.startsWith('image/')) ? (
                    <img
                      src={file.previewUrl || `http://localhost:5199/uploads/${file.filename}`}
                      alt={file.originalName}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-image.png';
                      }}
                    />
                  ) : (
                    getFileIcon(file.mimeType)
                  )}
                </div>
                <div className="p-3">
                  <p className="font-medium text-gray-900 text-sm truncate" title={file.originalName}>
                    {file.originalName}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    {formatFileSize(file.fileSize)}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusLabel(file.status).color}`}>
                      {getStatusLabel(file.status).label}
                    </span>
                    <span className="text-xs text-gray-400">
                      {getDocumentTypeLabel(file.fileType)}
                    </span>
                  </div>
                </div>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex space-x-1 space-x-reverse">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyLink(file.downloadUrl);
                      }}
                      className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center hover:bg-green-700 transition-colors"
                      title="کپی لینک"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(file.downloadUrl, '_blank');
                      }}
                      className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                      title="دانلود"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(file.id);
                      }}
                      className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-colors"
                      title="حذف"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // حالت لیستی (همان کد قبلی)
              <div
                key={file.id}
                className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer"
                onClick={() => handleFileClick(file)}
              >
                <div className="flex items-center space-x-4 space-x-reverse">
                  <div className="w-16 h-16 flex-shrink-0">
                    {file.mimeType.startsWith('image/') && file.previewUrl ? (
                      <img 
                        src={`http://localhost:5199/uploads/${file.filename}`}
                        alt={file.originalName}
                        className="w-full h-full object-cover rounded"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder-image.png';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded">
                        {getFileIcon(file.mimeType)}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.originalName}</p>
                    <p className="text-sm text-gray-500">
                      {getDocumentTypeLabel(file.fileType)} • {formatFileSize(file.fileSize)}
                    </p>
                    <div className="flex items-center space-x-2 space-x-reverse mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusLabel(file.status).color}`}>
                        {getStatusLabel(file.status).label}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyLink(file.downloadUrl);
                    }}
                    className="text-green-600 hover:text-green-800 p-2"
                    title="کپی لینک"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(file.downloadUrl, '_blank');
                    }}
                    className="text-blue-600 hover:text-blue-800 p-2"
                    title="دانلود"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(file.id);
                    }}
                    className="text-red-600 hover:text-red-800 p-2"
                    title="حذف"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            )
          ))}
        </div>
      )}

      {/* مودال نمایش جزئیات */}
      {showModal && selectedFile && (
        <FileDetails
          file={selectedFile}
          onClose={() => {
            setShowModal(false);
            setSelectedFile(null);
          }}
        />
      )}
    </div>
  );
};

export default FileList; 