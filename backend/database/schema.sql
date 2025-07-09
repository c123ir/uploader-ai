-- backend/database/schema.sql - اسکریپت ایجاد جداول پایگاه داده

-- ایجاد پایگاه داده
CREATE DATABASE IF NOT EXISTS uploader_ai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE uploader_ai;

-- جدول تنظیمات سیستم
CREATE TABLE IF NOT EXISTS settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_setting_key (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول فایل‌های آپلود شده
CREATE TABLE IF NOT EXISTS files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    unique_link VARCHAR(100) NOT NULL UNIQUE,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    document_type ENUM('check', 'contract', 'unknown') DEFAULT 'unknown',
    processing_status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_unique_link (unique_link),
    INDEX idx_processing_status (processing_status),
    INDEX idx_document_type (document_type),
    INDEX idx_upload_date (upload_date),
    FULLTEXT INDEX idx_search (original_name, filename)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول داده‌های چک‌ها
CREATE TABLE IF NOT EXISTS checks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    file_id INT NOT NULL,
    amount VARCHAR(100),
    date VARCHAR(50),
    payee VARCHAR(255),
    check_number VARCHAR(100),
    bank_name VARCHAR(255),
    account_number VARCHAR(100),
    extracted_text TEXT,
    confidence DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE,
    INDEX idx_file_id (file_id),
    INDEX idx_check_number (check_number),
    INDEX idx_bank_name (bank_name),
    FULLTEXT INDEX idx_search (amount, date, payee, check_number, bank_name, account_number, extracted_text)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول داده‌های قراردادها
CREATE TABLE IF NOT EXISTS contracts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    file_id INT NOT NULL,
    contract_type VARCHAR(100),
    party_a VARCHAR(255),
    party_b VARCHAR(255),
    start_date VARCHAR(50),
    end_date VARCHAR(50),
    amount VARCHAR(100),
    key_terms JSON,
    extracted_text TEXT,
    confidence DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE,
    INDEX idx_file_id (file_id),
    INDEX idx_contract_type (contract_type),
    INDEX idx_party_a (party_a),
    INDEX idx_party_b (party_b),
    FULLTEXT INDEX idx_search (contract_type, party_a, party_b, start_date, end_date, amount, extracted_text)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- درج تنظیمات پیش‌فرض
INSERT IGNORE INTO settings (setting_key, setting_value) VALUES
('openai_api_key', ''),
('max_file_size', '10485760'),
('allowed_file_types', 'image/jpeg,image/png,image/gif,application/pdf'),
('queue_enabled', 'false'),
('ocr_language', 'fas+eng'),
('ai_model', 'gpt-3.5-turbo');