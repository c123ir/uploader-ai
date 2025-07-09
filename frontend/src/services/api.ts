// frontend/src/services/api.ts - سرویس API با error handling و caching بهبود یافته
import type { FileUpload, FileListResponse, SystemSettings, ApiResponse } from '../types';

// کانفیگ API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5199/api';
const DEFAULT_TIMEOUT = 30000; // 30 seconds

// Cache برای درخواست‌ها
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

// Error Types
class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class NetworkError extends Error {
  constructor(message: string = 'خطا در ارتباط با سرور') {
    super(message);
    this.name = 'NetworkError';
  }
}

class TimeoutError extends Error {
  constructor(message: string = 'درخواست منقضی شد') {
    super(message);
    this.name = 'TimeoutError';
  }
}

// Utility Functions
const getFromCache = (key: string): any | null => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.data;
  }
  cache.delete(key);
  return null;
};

const setCache = (key: string, data: any, ttl: number = 300000) => { // 5 minutes default
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl
  });
};

const clearCache = (pattern?: string) => {
  if (pattern) {
    for (const [key] of cache) {
      if (key.includes(pattern)) {
        cache.delete(key);
      }
    }
  } else {
    cache.clear();
  }
};

// Network Status Check
const isOnline = () => navigator.onLine;

// Create abort controller for cancelling requests
const createAbortController = (timeout: number = DEFAULT_TIMEOUT) => {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeout);
  return controller;
};

// Enhanced fetch wrapper
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {},
  useCache: boolean = false,
  cacheTTL: number = 300000
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  const cacheKey = `${url}_${JSON.stringify(options)}`;

  // Check cache first
  if (useCache && options.method === 'GET') {
    const cached = getFromCache(cacheKey);
    if (cached) {
      return cached;
    }
  }

  // Check network status
  if (!isOnline()) {
    throw new NetworkError('اتصال اینترنت برقرار نیست');
  }

  const controller = createAbortController();
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    },
    signal: controller.signal,
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);

    if (!response.ok) {
      let errorMessage = 'خطایی رخ داده است';
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // Response might not be JSON
        errorMessage = response.statusText || errorMessage;
      }

      throw new ApiError(
        errorMessage,
        response.status,
        response.status.toString()
      );
    }

    const contentType = response.headers.get('content-type');
    let data: T;

    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = (await response.text()) as unknown as T;
    }

    // Cache successful GET requests
    if (useCache && options.method === 'GET') {
      setCache(cacheKey, data, cacheTTL);
    }

    return data;

  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new TimeoutError();
    }
    
    if (error instanceof TypeError) {
      throw new NetworkError();
    }

    throw error;
  }
};

/**
 * آپلود فایل جدید
 */
export const uploadFile = async (
  file: File,
  fileType: string = 'auto',
  onProgress?: (progress: number) => void
): Promise<FileUpload> => {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileType', fileType);

    const xhr = new XMLHttpRequest();

    // Progress tracking
    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          onProgress(progress);
        }
      });
    }

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          if (response.success) {
            // Clear file list cache after successful upload
            clearCache('files');
            resolve(response.data);
          } else {
            reject(new ApiError(response.message || 'خطا در آپلود فایل'));
          }
        } catch (error) {
          reject(new ApiError('پاسخ نامعتبر از سرور'));
        }
      } else {
        reject(new ApiError(`خطا در آپلود: ${xhr.status}`, xhr.status));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new NetworkError('خطا در ارسال فایل'));
    });

    xhr.addEventListener('timeout', () => {
      reject(new TimeoutError('آپلود فایل منقضی شد'));
    });

    xhr.timeout = 60000; // 1 minute for file uploads
    xhr.open('POST', `${API_BASE_URL}/upload`);
    xhr.send(formData);
  });
};

/**
 * دریافت لیست فایل‌ها
 */
export const getFilesList = async (
  page: number = 1,
  limit: number = 20,
  useCache: boolean = true
): Promise<FileListResponse> => {
  const response = await apiRequest<ApiResponse<FileListResponse>>(
    `/upload/list?page=${page}&limit=${limit}`,
    { method: 'GET' },
    useCache,
    180000 // 3 minutes cache
  );

  if (!response.success) {
    throw new ApiError(response.message || 'خطا در دریافت لیست فایل‌ها');
  }

  return response.data || { files: [], pagination: { page, limit, total: 0, totalPages: 0 } };
};

/**
 * جستجو در فایل‌ها
 */
export const searchFiles = async (
  query: string,
  filters?: {
    fileType?: string;
    dateFrom?: string;
    dateTo?: string;
    status?: string;
  },
  useCache: boolean = true
): Promise<FileListResponse> => {
  const params = new URLSearchParams({
    q: query,
    ...(filters?.fileType && { fileType: filters.fileType }),
    ...(filters?.dateFrom && { dateFrom: filters.dateFrom }),
    ...(filters?.dateTo && { dateTo: filters.dateTo }),
    ...(filters?.status && { status: filters.status }),
  });

  const response = await apiRequest<ApiResponse<FileListResponse>>(
    `/search?${params.toString()}`,
    { method: 'GET' },
    useCache,
    60000 // 1 minute cache for search results
  );

  if (!response.success) {
    throw new ApiError(response.message || 'خطا در جستجو');
  }

  return response.data || { files: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } };
};

/**
 * دریافت جزئیات فایل
 */
export const getFileDetails = async (
  fileId: string,
  useCache: boolean = true
): Promise<FileUpload> => {
  const response = await apiRequest<ApiResponse<FileUpload>>(
    `/upload/status/${fileId}`,
    { method: 'GET' },
    useCache,
    120000 // 2 minutes cache
  );

  if (!response.success) {
    throw new ApiError(response.message || 'خطا در دریافت جزئیات فایل');
  }

  return response.data!;
};

/**
 * حذف فایل
 */
export const deleteFile = async (fileId: string): Promise<boolean> => {
  const response = await apiRequest<ApiResponse<boolean>>(
    `/upload/${fileId}`,
    { method: 'DELETE' }
  );

  if (!response.success) {
    throw new ApiError(response.message || 'خطا در حذف فایل');
  }

  // Clear cache after deletion
  clearCache('files');
  clearCache(fileId);

  return response.data || false;
};

/**
 * دریافت تنظیمات سیستم
 */
export const getSettings = async (useCache: boolean = true): Promise<SystemSettings> => {
  const response = await apiRequest<ApiResponse<SystemSettings>>(
    '/settings',
    { method: 'GET' },
    useCache,
    300000 // 5 minutes cache
  );

  if (!response.success) {
    throw new ApiError(response.message || 'خطا در دریافت تنظیمات');
  }

  return response.data || {
    openai_api_key: '',
    max_file_size: '10MB',
    allowed_file_types: 'image/*,application/pdf',
    queue_enabled: 'true',
    ocr_language: 'fas+eng',
    ai_model: 'gpt-4-vision-preview'
  };
};

/**
 * بروزرسانی تنظیمات
 */
export const updateSettings = async (settings: Partial<SystemSettings>): Promise<SystemSettings> => {
  const response = await apiRequest<ApiResponse<SystemSettings>>(
    '/settings',
    {
      method: 'PUT',
      body: JSON.stringify(settings),
    }
  );

  if (!response.success) {
    throw new ApiError(response.message || 'خطا در بروزرسانی تنظیمات');
  }

  // Clear settings cache
  clearCache('settings');

  return response.data!;
};

/**
 * تست اتصال OpenAI
 */
export const testOpenAIConnection = async (apiKey?: string): Promise<boolean> => {
  const body = apiKey ? { openai_api_key: apiKey } : {};
  
  const response = await apiRequest<ApiResponse<{ valid: boolean }>>(
    '/settings/test-openai',
    {
      method: 'POST',
      body: JSON.stringify(body),
    }
  );

  if (!response.success) {
    throw new ApiError(response.message || 'خطا در تست اتصال OpenAI');
  }

  return response.data?.valid || false;
};

/**
 * تست سلامت سرور
 */
export const healthCheck = async (): Promise<{
  status: 'OK' | 'ERROR';
  message: string;
  timestamp: string;
  services: {
    database: boolean;
    redis: boolean;
    openai: boolean;
  };
}> => {
  try {
    const response = await apiRequest<any>(
      '/health',
      { method: 'GET' },
      false // Don't cache health checks
    );

    return response || {
      status: 'ERROR',
      message: 'پاسخ نامعتبر',
      timestamp: new Date().toISOString(),
      services: { database: false, redis: false, openai: false }
    };
  } catch (error) {
    return {
      status: 'ERROR',
      message: error instanceof Error ? error.message : 'خطای نامشخص',
      timestamp: new Date().toISOString(),
      services: { database: false, redis: false, openai: false }
    };
  }
};

// Export error classes for use in components
export { ApiError, NetworkError, TimeoutError };