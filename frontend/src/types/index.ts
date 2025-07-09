// frontend/src/types/index.ts - تعریف انواع TypeScript

// پاسخ API
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// فایل آپلود شده
export interface FileUpload {
  id: string;
  filename: string;
  originalName: string;
  fileType: 'check' | 'contract' | 'auto' | 'invoice' | 'id_card' | 'birth_certificate' | 'license' | 'document' | 'form' | 'letter' | 'report' | 'other' | 'unknown';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  uploadedAt: string;
  processedAt?: string;
  fileSize: number;
  mimeType: string;
  // فیلدهای مربوط به تشخیص AI
  documentType?: string;
  confidence?: number;
  extractedText?: string;
  detectedLanguage?: string;
  previewUrl?: string;
  downloadUrl: string;
  aiAnalysis?: string;
  // اطلاعات اضافی
  userAgent?: string;
  ipAddress?: string;
  description?: string;
}

// پاسخ لیست فایل‌ها
export interface FileListResponse {
  files: FileUpload[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// داده‌های چک بانکی
export interface CheckData {
  id: string;
  fileId: string;
  amount?: string;
  date?: string;
  payee?: string;
  checkNumber?: string;
  bankName?: string;
  accountNumber?: string;
  extractedText: string;
  confidence: number;
}

// داده‌های قرارداد
export interface ContractData {
  id: string;
  fileId: string;
  contractType?: string;
  partyA?: string;
  partyB?: string;
  startDate?: string;
  endDate?: string;
  amount?: string;
  keyTerms?: string[];
  extractedText: string;
  confidence: number;
}

// تنظیمات سیستم
export interface SystemSettings {
  openai_api_key: string;
  max_file_size: string;
  allowed_file_types: string;
  queue_enabled?: string;
  ocr_language?: string;
  ai_model?: string;
  processing_timeout?: string;
  auto_delete_failed?: string;
  notification_email?: string;
}
  openai_api_key: string;
  max_file_size: string;
  allowed_file_types: string;
  queue_enabled?: string;
  ocr_language?: string;
  ai_model?: string;
  processing_timeout?: string;
  auto_delete_failed?: string;
  notification_email?: string;
}

// آمار سیستم
export interface SystemStats {
  totalFiles: number;
  totalSize: string;
  processingQueue: number;
  completedToday: number;
  failedToday: number;
  fileTypes: { [key: string]: number };
  uploadTrend: Array<{
    date: string;
    count: number;
  }>;
}

// تنظیمات کاربر
export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: 'fa' | 'en';
  defaultFileType: string;
  autoRefresh: boolean;
  notificationsEnabled: boolean;
}

// وضعیت شبکه
export interface NetworkStatus {
  isOnline: boolean;
  lastCheck: string;
  connectionType?: string;
  speed?: 'slow' | 'fast';
}

// نوتیفیکیشن
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
}

// فیلتر جستجو
export interface SearchFilters {
  fileType?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  sizeMin?: number;
  sizeMax?: number;
  hasText?: boolean;
  confidence?: number;
}

// نتیجه جستجو
export interface SearchResult {
  files: FileUpload[];
  totalResults: number;
  searchTime: number;
  suggestions?: string[];
  filters?: SearchFilters;
}

// Progress tracking
export interface UploadProgress {
  fileId: string;
  progress: number;
  stage: 'uploading' | 'processing' | 'analyzing' | 'completed' | 'error';
  message?: string;
  error?: string;
}

// OCR Result
export interface OCRResult {
  text: string;
  confidence: number;
  language: string;
  blocks?: Array<{
    text: string;
    confidence: number;
    boundingBox: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  }>;
}

// AI Analysis Result
export interface AIAnalysisResult {
  documentType: string;
  confidence: number;
  extractedData: { [key: string]: any };
  summary: string;
  keyPoints: string[];
  metadata?: { [key: string]: any };
}

// Queue Job
export interface QueueJob {
  id: string;
  fileId: string;
  type: 'ocr' | 'ai_analysis' | 'thumbnail';
  status: 'waiting' | 'active' | 'completed' | 'failed';
  priority: number;
  attempts: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  error?: string;
}

// Health Check Response
export interface HealthCheck {
  status: 'OK' | 'ERROR' | 'DEGRADED';
  message: string;
  timestamp: string;
  services: {
    database: boolean;
    redis: boolean;
    openai: boolean;
    fileSystem?: boolean;
  };
  version?: string;
  uptime?: number;
}

// Export all types
export type FileStatus = FileUpload['status'];
export type FileType = FileUpload['fileType'];
export type NotificationType = Notification['type'];
export type Theme = UserPreferences['theme'];
export type Language = UserPreferences['language'];
export type QueueJobStatus = QueueJob['status'];
export type QueueJobType = QueueJob['type'];