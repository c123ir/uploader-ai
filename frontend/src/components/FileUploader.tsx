// frontend/src/components/FileUploader.tsx - کامپوننت آپلود فایل
import React, { useState, useCallback } from 'react';
import { ApiService } from '../services/api';
import type { FileUpload } from '../types';

interface FileUploaderProps {
  onUploadSuccess: (file: FileUpload) => void;
  onUploadError: (error: string) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onUploadSuccess, onUploadError }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    documentType: string;
    confidence: number;
    detectedText?: string;
  } | null>(null);

  const handleFiles = useCallback(async (files: FileList) => {
    if (files.length === 0) return;

    const file = files[0];
    
    if (!file.type.startsWith('image/')) {
      onUploadError('لطفا فقط فایل‌های تصویری انتخاب کنید');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      onUploadError('حجم فایل نباید بیشتر از 10 مگابایت باشد');
      return;
    }

    setIsUploading(true);
    setIsAnalyzing(true);
    setAnalysisResult(null);
    
    try {
      // ارسال فایل به API برای تشخیص با هوش مصنوعی
      const response = await ApiService.uploadFile(file, 'auto'); // تشخیص خودکار
      
      if (response.success && response.data) {
        const data = response.data;
        setAnalysisResult({
          documentType: data.documentType || 'نامشخص',
          confidence: data.confidence || 0,
          detectedText: data.extractedText
        });
        
        setIsAnalyzing(false);
        
        // نمایش نتیجه برای 2 ثانیه
        setTimeout(() => {
          onUploadSuccess(data);
          setAnalysisResult(null);
        }, 2000);
      } else {
        setIsAnalyzing(false);
        onUploadError(response.message || 'خطا در تشخیص و پردازش فایل');
      }
    } catch (error) {
      setIsAnalyzing(false);
      onUploadError('خطا در ارسال فایل به سرور');
    } finally {
      setTimeout(() => {
        setIsUploading(false);
      }, 2500);
    }
  }, [onUploadSuccess, onUploadError]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  const getDocumentTypeEmoji = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'چک': '💵',
      'قرارداد': '📋',
      'فاکتور': '🧾',
      'شناسنامه': '🆔',
      'کارت ملی': '🪪',
      'گواهینامه': '📄',
      'سند': '📃',
      'برگه': '📋',
      'نامه': '💌',
      'فرم': '📝',
      'مدرک': '🎓',
      'گزارش': '📊',
      'default': '📄'
    };
    return typeMap[type] || typeMap['default'];
  };

  return (
    <div style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}>
      {/* منطقه آپلود */}
      <div
        style={{
          border: dragActive ? '2px dashed #4facfe' : '2px dashed rgba(255, 255, 255, 0.3)',
          borderRadius: '15px',
          padding: '50px 30px',
          textAlign: 'center',
          backgroundColor: dragActive 
            ? 'rgba(79, 172, 254, 0.1)' 
            : 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          transition: 'all 0.3s ease',
          minHeight: '300px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '20px',
          cursor: isUploading ? 'not-allowed' : 'pointer',
          opacity: isUploading ? 0.9 : 1,
          position: 'relative'
        }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleChange}
          disabled={isUploading}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: 0,
            cursor: 'pointer'
          }}
        />
        
        {isUploading ? (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            gap: '20px'
          }}>
            {isAnalyzing ? (
              <>
                <div style={{
                  width: '60px',
                  height: '60px',
                  border: '4px solid rgba(255, 255, 255, 0.3)',
                  borderTop: '4px solid #4facfe',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                <div style={{ textAlign: 'center' }}>
                  <h3 style={{ color: 'white', fontSize: '18px', margin: '0 0 10px 0' }}>
                    🤖 در حال تشخیص با هوش مصنوعی...
                  </h3>
                  <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', margin: 0 }}>
                    لطفاً صبر کنید، سند شما در حال تحلیل است
                  </p>
                </div>
              </>
            ) : analysisResult ? (
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                padding: '25px',
                borderRadius: '15px',
                textAlign: 'center',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '15px' }}>
                  {getDocumentTypeEmoji(analysisResult.documentType)}
                </div>
                <h3 style={{ color: 'white', fontSize: '20px', margin: '0 0 10px 0' }}>
                  نوع سند تشخیص داده شد
                </h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '16px', margin: '0 0 15px 0' }}>
                  <strong>{analysisResult.documentType}</strong>
                </p>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  gap: '10px',
                  marginBottom: '10px'
                }}>
                  <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>
                    درصد اطمینان:
                  </span>
                  <div style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    padding: '5px 12px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    color: 'white',
                    fontWeight: 'bold'
                  }}>
                    {Math.round(analysisResult.confidence * 100)}%
                  </div>
                </div>
                <div style={{
                  width: '100%',
                  height: '4px',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '2px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${analysisResult.confidence * 100}%`,
                    height: '100%',
                    backgroundColor: analysisResult.confidence > 0.8 ? '#10b981' : analysisResult.confidence > 0.6 ? '#f59e0b' : '#ef4444',
                    transition: 'width 0.5s ease'
                  }}></div>
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            gap: '20px'
          }}>
            <div style={{
              width: '100px',
              height: '100px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '40px',
              transition: 'transform 0.3s ease'
            }}>
              🤖
            </div>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ color: 'white', fontSize: '24px', margin: '0 0 10px 0' }}>
                تشخیص هوشمند اسناد
              </h3>
              <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '16px', margin: '0 0 15px 0' }}>
                فایل خود را اینجا رها کنید
              </p>
              <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px', margin: 0 }}>
                یا برای انتخاب کلیک کنید
              </p>
            </div>
            <div style={{ 
              display: 'flex', 
              gap: '25px',
              marginTop: '15px',
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.6)'
            }}>
              <span>📷 PNG, JPG, GIF</span>
              <span>📏 حداکثر 10MB</span>
              <span>🤖 تشخیص خودکار</span>
            </div>
          </div>
        )}
      </div>

      {/* راهنمای انواع اسناد قابل تشخیص */}
      <div style={{
        marginTop: '30px',
        padding: '20px',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '10px',
        textAlign: 'center'
      }}>
        <h4 style={{ color: 'white', fontSize: '16px', margin: '0 0 15px 0' }}>
          انواع اسناد قابل تشخیص:
        </h4>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          justifyContent: 'center'
        }}>
          {[
            { type: 'چک بانکی', emoji: '💵' },
            { type: 'قرارداد', emoji: '📋' },
            { type: 'فاکتور', emoji: '🧾' },
            { type: 'شناسنامه', emoji: '🆔' },
            { type: 'کارت ملی', emoji: '🪪' },
            { type: 'گواهینامه', emoji: '📄' },
            { type: 'و بیشتر...', emoji: '✨' }
          ].map((item, index) => (
            <div key={index} style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              padding: '8px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.8)',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              <span>{item.emoji}</span>
              <span>{item.type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FileUploader;