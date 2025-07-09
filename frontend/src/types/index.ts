// @/uploader-ai/frontend/src/types/index.ts - تعریف انواع TypeScript

// پاسخ API
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
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

export interface Settings {
  openai_api_key: string;
  max_file_size: string;
  allowed_file_types: string;
  queue_enabled?: string;
  ocr_language?: string;
  ai_model?: string;
}