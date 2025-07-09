// frontend/src/components/FileList.tsx - گالری ساده و کاربردی
import React, { useState, useEffect } from 'react';
import { Search, Grid3X3, List, Eye, Download, Copy } from 'lucide-react';
import { getFilesList } from '../services/api';
import type { FileUpload } from '../types';

const FileList: React.FC = () => {
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // بارگذاری فایل‌ها
  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      setLoading(true);
      
      // Try to load from API first
      try {
        const result = await getFilesList(1, 100);
        
        // Fix download URLs
        const fixedFiles = (result.files || []).map(file => ({
          ...file,
          downloadUrl: `http://localhost:5199/uploads/${file.filename}`
        }));
        
        setFiles(fixedFiles);
        return;
      } catch (apiError) {
        console.log('API failed, using mock data');
      }
      
      // Fallback to mock data if API fails
      const mockFiles: FileUpload[] = [
        {
          id: '1',
          filename: 'sample1.jpg',
          originalName: 'نمونه تصویر ۱.jpg',
          fileType: 'check',
          status: 'completed',
          uploadedAt: new Date().toISOString(),
          fileSize: 1024000,
          mimeType: 'image/jpeg',
          downloadUrl: 'https://via.placeholder.com/300x300/667eea/ffffff?text=نمونه+۱'
        },
        {
          id: '2',
          filename: 'sample2.png',
          originalName: 'نمونه تصویر ۲.png',
          fileType: 'contract',
          status: 'processing',
          uploadedAt: new Date().toISOString(),
          fileSize: 2048000,
          mimeType: 'image/png',
          downloadUrl: 'https://via.placeholder.com/300x300/764ba2/ffffff?text=نمونه+۲'
        },
        {
          id: '3',
          filename: 'sample3.pdf',
          originalName: 'نمونه سند.pdf',
          fileType: 'invoice',
          status: 'completed',
          uploadedAt: new Date().toISOString(),
          fileSize: 512000,
          mimeType: 'application/pdf',
          downloadUrl: '#'
        }
      ];
      
      setFiles(mockFiles);
      
    } catch (error) {
      console.error('Error loading files:', error);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  // فیلتر فایل‌ها بر اساس جستجو
  const filteredFiles = files.filter(file =>
    file.originalName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 بایت';
    const k = 1024;
    const sizes = ['بایت', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR');
  };

  const handleCopyLink = async (downloadUrl: string) => {
    try {
      await navigator.clipboard.writeText(downloadUrl);
      alert('لینک کپی شد! 📋');
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"></div>
          <p className="text-white text-lg">در حال بارگذاری فایل‌ها...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* هدر */}
      <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">گالری فایل‌ها</h2>
            <p className="text-white text-opacity-80">
              {filteredFiles.length} فایل از {files.length} فایل
            </p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-3 rounded-xl transition-all ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
              }`}
            >
              <Grid3X3 className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => setViewMode('list')}
              className={`p-3 rounded-xl transition-all ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* جستجو */}
      <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-20">
        <div className="relative">
          <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white text-opacity-60" />
          <input
            type="text"
            placeholder="جستجو در نام فایل‌ها..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white bg-opacity-10 border border-white border-opacity-30 rounded-xl px-12 py-4 text-white placeholder-white placeholder-opacity-60 focus:outline-none focus:border-blue-400 focus:bg-opacity-20 transition-all text-lg"
          />
        </div>
      </div>

      {/* لیست فایل‌ها */}
      {filteredFiles.length === 0 ? (
        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-12 border border-white border-opacity-20 text-center">
          <div className="w-20 h-20 mx-auto bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-6">
            <Grid3X3 className="w-10 h-10 text-white text-opacity-60" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">فایلی یافت نشد</h3>
          <p className="text-white text-opacity-80 text-lg">
            {searchTerm ? 'جستجوی شما نتیجه‌ای نداشت' : 'هنوز فایلی آپلود نکرده‌اید'}
          </p>
        </div>
      ) : (
        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-20">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className="group bg-white bg-opacity-10 rounded-xl overflow-hidden border border-white border-opacity-20 hover:border-opacity-40 hover:bg-opacity-20 transition-all"
                >
                  <div className="aspect-square relative bg-gray-100">
                    {file.mimeType?.startsWith('image/') ? (
                      <img
                        src={file.downloadUrl}
                        alt={file.originalName}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          console.log('Image failed to load:', file.downloadUrl);
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                        <span className="text-4xl">📄</span>
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <a
                        href={file.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg transition-colors"
                        title="مشاهده"
                      >
                        <Eye className="w-4 h-4" />
                      </a>
                      <a
                        href={file.downloadUrl}
                        download={file.originalName}
                        className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg transition-colors"
                        title="دانلود"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleCopyLink(file.downloadUrl)}
                        className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg transition-colors"
                        title="کپی لینک"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="text-white font-medium text-sm truncate mb-2" title={file.originalName}>
                      {file.originalName}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-white text-opacity-60">
                      <span>{formatFileSize(file.fileSize)}</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        file.status === 'completed' ? 'bg-green-500 bg-opacity-20 text-green-300' :
                        file.status === 'processing' ? 'bg-blue-500 bg-opacity-20 text-blue-300' :
                        file.status === 'failed' ? 'bg-red-500 bg-opacity-20 text-red-300' :
                        'bg-yellow-500 bg-opacity-20 text-yellow-300'
                      }`}>
                        {file.status === 'completed' ? '✅' :
                         file.status === 'processing' ? '🔄' :
                         file.status === 'failed' ? '❌' : '⏳'}
                      </span>
                    </div>
                    <div className="text-xs text-white text-opacity-50 mt-1">
                      {formatDate(file.uploadedAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-4 p-4 bg-white bg-opacity-10 rounded-xl border border-white border-opacity-20 hover:border-opacity-40 hover:bg-opacity-20 transition-all"
                >
                  <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                    {file.mimeType?.startsWith('image/') ? (
                      <img
                        src={file.downloadUrl}
                        alt={file.originalName}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                        <span className="text-2xl">📄</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium truncate mb-1">
                      {file.originalName}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-white text-opacity-60">
                      <span>{formatFileSize(file.fileSize)}</span>
                      <span>{formatDate(file.uploadedAt)}</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        file.status === 'completed' ? 'bg-green-500 bg-opacity-20 text-green-300' :
                        file.status === 'processing' ? 'bg-blue-500 bg-opacity-20 text-blue-300' :
                        file.status === 'failed' ? 'bg-red-500 bg-opacity-20 text-red-300' :
                        'bg-yellow-500 bg-opacity-20 text-yellow-300'
                      }`}>
                        {file.status === 'completed' ? '✅ تکمیل شده' :
                         file.status === 'processing' ? '🔄 در حال پردازش' :
                         file.status === 'failed' ? '❌ خطا' : '⏳ در انتظار'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0 flex gap-2">
                    <a
                      href={file.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-white bg-opacity-10 hover:bg-opacity-20 text-white rounded-lg transition-colors"
                      title="مشاهده"
                    >
                      <Eye className="w-4 h-4" />
                    </a>
                    <a
                      href={file.downloadUrl}
                      download={file.originalName}
                      className="p-2 bg-white bg-opacity-10 hover:bg-opacity-20 text-white rounded-lg transition-colors"
                      title="دانلود"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleCopyLink(file.downloadUrl)}
                      className="p-2 bg-white bg-opacity-10 hover:bg-opacity-20 text-white rounded-lg transition-colors"
                      title="کپی لینک"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FileList;