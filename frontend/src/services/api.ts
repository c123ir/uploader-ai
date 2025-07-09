// frontend/src/services/api.ts - سرویس API
import axios from 'axios';
import type { FileUpload, CheckData, ContractData, Settings, ApiResponse, FileListResponse } from '../types';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

// رهگیری درخواست‌ها
api.interceptors.request.use((config) => {
  console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

// رهگیری پاسخ‌ها
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    throw error;
  }
);

export class ApiService {
  // آپلود فایل با تشخیص هوشمند
  static async uploadFile(file: File, fileType: FileUpload['fileType']): Promise<ApiResponse<FileUpload>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileType', fileType);

    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // دریافت لیست فایل‌ها
  static async getFiles(): Promise<ApiResponse<FileListResponse>> {
    const response = await api.get('/upload/list');
    return response.data;
  }

  // دریافت وضعیت فایل
  static async getFileStatus(uniqueLink: string): Promise<ApiResponse<FileUpload>> {
    const response = await api.get(`/upload/status/${uniqueLink}`);
    return response.data;
  }

  // حذف فایل
  static async deleteFile(fileId: string): Promise<ApiResponse<void>> {
    const response = await api.delete(`/upload/${fileId}`);
    return response.data;
  }

  // دریافت تنظیمات
  static async getSettings(): Promise<ApiResponse<Settings>> {
    const response = await api.get('/settings');
    return response.data;
  }

  // بروزرسانی تنظیمات
  static async updateSettings(settings: Partial<Settings>): Promise<ApiResponse<Settings>> {
    const response = await api.patch('/settings', settings);
    return response.data;
  }

  // جستجو در فایل‌ها
  static async searchFiles(query: string, type?: string, status?: string): Promise<ApiResponse<FileUpload[]>> {
    const response = await api.get('/search/files', {
      params: { q: query, type, status }
    });
    return response.data;
  }
}