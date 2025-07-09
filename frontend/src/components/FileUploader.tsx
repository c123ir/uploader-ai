// frontend/src/components/FileUploader.tsx - کامپوننت آپلود فایل با drag & drop و UI بهبود یافته
import React, { useState, useRef, useCallback } from 'react';
import { Upload, Camera, Image, CheckCircle, Copy } from 'lucide-react';
import { uploadFile } from '../services/api';
import type { FileUpload } from '../types';

interface FileUploaderProps {
  onUploadSuccess?: (file: FileUpload) => void;
  onUploadError?: (error: string) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onUploadSuccess, onUploadError }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<FileUpload | null>(null);
  const [selectedFileType, setSelectedFileType] = useState<string>('auto');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // انواع فایل‌های پشتیبانی شده
  const fileTypes = [
    { value: 'auto', label: '🤖 تشخیص خودکار', icon: '🔍' },
    { value: 'check', label: '💵 چک بانکی', icon: '💰' },
    { value: 'contract', label: '📋 قرارداد', icon: '📄' },
    { value: 'invoice', label: '🧾 فاکتور', icon: '📊' },
    { value: 'id_card', label: '🆔 کارت ملی', icon: '🆔' },
    { value: 'birth_certificate', label: '📄 شناسنامه', icon: '📜' },
    { value: 'license', label: '🎓 گواهینامه', icon: '🏆' },
    { value: 'other', label: '📄 سایر اسناد', icon: '📁' }
  ];

  // مدیریت drag & drop
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, []);

  // آپلود فایل
  const handleFileUpload = async (file: File) => {
    try {
      setIsUploading(true);
      setUploadProgress(0);
      setUploadedFile(null);

      // شبیه‌سازی progress (در پروژه واقعی از XMLHttpRequest استفاده کنید)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const result = await uploadFile(file, selectedFileType);

      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        setUploadedFile(result);
        setIsUploading(false);
        onUploadSuccess?.(result);
      }, 500);

    } catch (error) {
      setIsUploading(false);
      setUploadProgress(0);
      const errorMessage = error instanceof Error ? error.message : 'خطا در آپلود فایل';
      onUploadError?.(errorMessage);
      console.error('Upload error:', error);
    }
  };

  // انتخاب فایل از دستگاه
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // کپی لینک دانلود
  const handleCopyLink = async () => {
    if (uploadedFile?.downloadUrl) {
      try {
        await navigator.clipboard.writeText(uploadedFile.downloadUrl);
        // اینجا می‌تونید toast notification اضافه کنید
        alert('لینک دانلود کپی شد! 📋');
      } catch (error) {
        console.error('Failed to copy link:', error);
      }
    }
  };

  // ریست کردن فرم
  const handleNewUpload = () => {
    setUploadedFile(null);
    setUploadProgress(0);
    setSelectedFileType('auto');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-6">
      {!uploadedFile && (
        <>
          {/* انتخاب نوع سند */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4 text-center">
              انواع اسناد قابل تشخیص:
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {fileTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setSelectedFileType(type.value)}
                  className={`p-3 rounded-xl border-2 transition-all duration-200 text-sm font-medium ${
                    selectedFileType === type.value
                      ? 'border-blue-400 bg-blue-500/20 text-blue-100'
                      : 'border-white/20 bg-white/10 text-white/80 hover:border-white/40 hover:bg-white/20'
                  }`}
                >
                  <div className="text-2xl mb-1">{type.icon}</div>
                  <div className="text-xs leading-tight">{type.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* منطقه آپلود */}
          <div
            className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 ${
              isDragging
                ? 'border-blue-400 bg-blue-500/20 scale-105'
                : 'border-white/30 bg-white/10 hover:border-white/50 hover:bg-white/15'
            } ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {isUploading ? (
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-blue-500/20 rounded-full flex items-center justify-center">
                  <Upload className="w-8 h-8 text-blue-400 animate-bounce" />
                </div>
                <div className="space-y-2">
                  <div className="text-white font-medium">در حال آپلود...</div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <div className="text-white/60 text-sm">{uploadProgress}%</div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="w-20 h-20 mx-auto bg-white/20 rounded-full flex items-center justify-center">
                  <Upload className="w-10 h-10 text-white" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-white">
                    تشخیص هوشمند اسناد
                  </h3>
                  <p className="text-white/80">
                    فایل خود را اینجا رها کنید
                  </p>
                  <p className="text-white/60 text-sm">
                    یا برای انتخاب کلیک کنید
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
                  >
                    <Image className="w-5 h-5" />
                    انتخاب از گالری
                  </button>
                  
                  <button
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors"
                  >
                    <Camera className="w-5 h-5" />
                    عکس‌برداری
                  </button>
                </div>

                <div className="text-white/50 text-xs">
                  حداکثر حجم فایل: 10MB • فرمت‌های پشتیبانی شده: PNG, JPG, GIF, WEBP
                </div>
              </div>
            )}

            {/* Input های مخفی */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </>
      )}

      {/* نمایش نتیجه آپلود موفق */}
      {uploadedFile && (
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              آپلود با موفقیت انجام شد! 🎉
            </h3>
            <p className="text-white/70">
              فایل شما در حال پردازش است و به زودی نتایج آماده می‌شود
            </p>
          </div>

          <div className="bg-white/10 rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white/70">نام فایل:</span>
              <span className="text-white font-medium">{uploadedFile.originalName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">نوع سند:</span>
              <span className="text-white font-medium">
                {fileTypes.find(t => t.value === uploadedFile.fileType)?.label || 'نامشخص'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">وضعیت:</span>
              <span className="text-green-400 font-medium">✅ آپلود شده</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleCopyLink}
              className="flex items-center justify-center gap-2 flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
            >
              <Copy className="w-5 h-5" />
              کپی لینک دانلود
            </button>
            
            <button
              onClick={handleNewUpload}
              className="flex items-center justify-center gap-2 flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-medium transition-colors"
            >
              <Upload className="w-5 h-5" />
              تصویر جدید
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;