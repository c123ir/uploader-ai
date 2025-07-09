// frontend/src/components/FileList.tsx - گالری حرفه‌ای فایل‌ها با جستجو و فیلتر
import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Grid3X3, List, Eye, Download, Copy, FileText, SortDesc, SortAsc } from 'lucide-react';
import { getFilesList, searchFiles } from '../services/api';
import FileDetails from './FileDetails';
import type { FileUpload } from '../types';

const FileList: React.FC = () => {
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFile, setSelectedFile] = useState<FileUpload | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // انواع فایل برای فیلتر
  const fileTypeFilters = [
    { value: 'all', label: 'همه فایل‌ها', icon: '📁', count: 0 },
    { value: 'check', label: 'چک‌ها', icon: '💵', count: 0 },
    { value: 'contract', label: 'قراردادها', icon: '📋', count: 0 },
    { value: 'invoice', label: 'فاکتورها', icon: '🧾', count: 0 },
    { value: 'id_card', label: 'کارت ملی', icon: '🆔', count: 0 },
    { value: 'other', label: 'سایر', icon: '📄', count: 0 }
  ];

  // بارگذاری فایل‌ها
  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const result = await getFilesList(1, 100);
      setFiles(result.files || []);
    } catch (error) {
      console.error('Error loading files:', error);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  // جستجو در فایل‌ها
  useEffect(() => {
    const performSearch = async () => {
      if (searchTerm.trim()) {
        try {
          const result = await searchFiles(searchTerm);
          setFiles(result.files || []);
        } catch (error) {
          console.error('Search error:', error);
        }
      } else {
        loadFiles();
      }
    };

    const debounceTimer = setTimeout(performSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  // فیلتر و مرتب‌سازی فایل‌ها
  const filteredAndSortedFiles = useMemo(() => {
    let filtered = files.filter(file => {
      if (selectedFilter === 'all') return true;
      return file.fileType === selectedFilter;
    });

    // مرتب‌سازی
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
          break;
        case 'name':
          comparison = a.originalName.localeCompare(b.originalName, 'fa');
          break;
        case 'size':
          comparison = a.fileSize - b.fileSize;
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [files, selectedFilter, sortBy, sortOrder]);

  // محاسبه تعداد فایل‌ها برای هر فیلتر
  const filtersWithCount = useMemo(() => {
    return fileTypeFilters.map(filter => ({
      ...filter,
      count: filter.value === 'all' 
        ? files.length 
        : files.filter(f => f.fileType === filter.value).length
    }));
  }, [files]);

  // تابع‌های کمکی
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 بایت';
    const k = 1024;
    const sizes = ['بایت', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getFileIcon = (file: FileUpload) => {
    if (file.mimeType?.startsWith('image/')) {
      return file.downloadUrl;
    }
    
    const iconMap: { [key: string]: string } = {
      'check': '💵',
      'contract': '📋',
      'invoice': '🧾',
      'id_card': '🆔',
      'birth_certificate': '📄',
      'license': '🎓',
      'other': '📄'
    };
    
    return iconMap[file.fileType] || '📄';
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
      <div className="w-full max-w-6xl mx-auto p-4">
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-white/30 border-t-white rounded-full mx-auto mb-4"></div>
          <p className="text-white/70">در حال بارگذاری فایل‌ها...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      {/* هدر و آمار */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">گالری فایل‌ها</h2>
            <p className="text-white/70">
              {files.length} فایل از {filteredAndSortedFiles.length} فایل
            </p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid3X3 className="w-5 h-5" />}
            </button>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-colors ${
                showFilters ? 'bg-blue-500/20 text-blue-300' : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* جستجو و فیلترها */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 space-y-4">
        {/* جستجو */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
          <input
            type="text"
            placeholder="جستجو در اسناد، نام فایل و محتوا..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-12 py-3 text-white placeholder-white/50 focus:outline-none focus:border-blue-400 focus:bg-white/20 transition-all"
          />
        </div>

        {/* فیلترها */}
        {showFilters && (
          <div className="space-y-4">
            {/* فیلتر نوع فایل */}
            <div>
              <h3 className="text-white font-medium mb-3">نوع سند:</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                {filtersWithCount.map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setSelectedFilter(filter.value)}
                    className={`p-3 rounded-lg border transition-all text-sm ${
                      selectedFilter === filter.value
                        ? 'border-blue-400 bg-blue-500/20 text-blue-100'
                        : 'border-white/20 bg-white/10 text-white/80 hover:border-white/40'
                    }`}
                  >
                    <div className="text-lg mb-1">{filter.icon}</div>
                    <div className="font-medium">{filter.label}</div>
                    <div className="text-xs opacity-70">({filter.count})</div>
                  </button>
                ))}
              </div>
            </div>

            {/* مرتب‌سازی */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <span className="text-white/70 text-sm">مرتب‌سازی:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'name' | 'size')}
                  className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:border-blue-400"
                >
                  <option value="date">تاریخ</option>
                  <option value="name">نام</option>
                  <option value="size">حجم</option>
                </select>
              </div>
              
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="flex items-center gap-1 px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm"
              >
                {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                {sortOrder === 'asc' ? 'صعودی' : 'نزولی'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* لیست فایل‌ها */}
      {filteredAndSortedFiles.length === 0 ? (
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-12 border border-white/20 text-center">
          <div className="w-16 h-16 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-white/50" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">فایلی یافت نشد</h3>
          <p className="text-white/70">
            {searchTerm ? 'جستجوی شما نتیجه‌ای نداشت' : 'هنوز فایلی آپلود نکرده‌اید'}
          </p>
        </div>
      ) : (
        <div className={`${
          viewMode === 'grid' 
            ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4' 
            : 'space-y-4'
        }`}>
          {filteredAndSortedFiles.map((file) => (
            <div
              key={file.id}
              className={`bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl overflow-hidden hover:border-white/40 hover:bg-white/20 transition-all group ${
                viewMode === 'list' ? 'p-4' : ''
              }`}
            >
              {viewMode === 'grid' ? (
                // نمایش Grid
                <>
                  <div className="aspect-square relative">
                    {file.mimeType?.startsWith('image/') ? (
                      <img
                        src={file.downloadUrl}
                        alt={file.originalName}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-white/5">
                        <div className="text-4xl">{getFileIcon(file)}</div>
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => setSelectedFile(file)}
                        className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
                        title="مشاهده جزئیات"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <a
                        href={file.downloadUrl}
                        download
                        className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
                        title="دانلود"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleCopyLink(file.downloadUrl)}
                        className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
                        title="کپی لینک"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-3 space-y-2">
                    <h3 className="text-white font-medium text-sm truncate" title={file.originalName}>
                      {file.originalName}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-white/60">
                      <span>{formatFileSize(file.fileSize)}</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        file.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                        file.status === 'processing' ? 'bg-blue-500/20 text-blue-300' :
                        file.status === 'failed' ? 'bg-red-500/20 text-red-300' :
                        'bg-yellow-500/20 text-yellow-300'
                      }`}>
                        {file.status === 'completed' ? '✅' :
                         file.status === 'processing' ? '🔄' :
                         file.status === 'failed' ? '❌' : '⏳'}
                      </span>
                    </div>
                    <div className="text-xs text-white/50">
                      {formatDate(file.uploadedAt)}
                    </div>
                  </div>
                </>
              ) : (
                // نمایش List
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-white/5">
                    {file.mimeType?.startsWith('image/') ? (
                      <img
                        src={file.downloadUrl}
                        alt={file.originalName}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-2xl">{getFileIcon(file)}</div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium truncate">
                      {file.originalName}
                    </h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-white/60">
                      <span>{formatFileSize(file.fileSize)}</span>
                      <span>{formatDate(file.uploadedAt)}</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        file.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                        file.status === 'processing' ? 'bg-blue-500/20 text-blue-300' :
                        file.status === 'failed' ? 'bg-red-500/20 text-red-300' :
                        'bg-yellow-500/20 text-yellow-300'
                      }`}>
                        {file.status === 'completed' ? '✅ تکمیل شده' :
                         file.status === 'processing' ? '🔄 در حال پردازش' :
                         file.status === 'failed' ? '❌ خطا' : '⏳ در انتظار'}
                      </span>
                    </div>
                    {file.extractedText && (
                      <p className="text-xs text-white/50 mt-1 truncate">
                        {file.extractedText.substring(0, 100)}...
                      </p>
                    )}
                  </div>
                  
                  <div className="flex-shrink-0 flex gap-2">
                    <button
                      onClick={() => setSelectedFile(file)}
                      className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                      title="مشاهده جزئیات"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <a
                      href={file.downloadUrl}
                      download
                      className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                      title="دانلود"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleCopyLink(file.downloadUrl)}
                      className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                      title="کپی لینک"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* مودال جزئیات فایل */}
      {selectedFile && (
        <FileDetails
          file={selectedFile}
          onClose={() => setSelectedFile(null)}
        />
      )}
    </div>
  );
};

export default FileList;