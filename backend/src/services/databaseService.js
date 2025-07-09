// backend/src/services/databaseService.js - سرویس اتصال و مدیریت پایگاه داده
const mysql = require('mysql2/promise');
const fs = require('fs-extra');
const path = require('path');

let pool;

const createPool = () => {
    return mysql.createPool({
        host: process.env.MYSQL_HOST || 'localhost',
        port: process.env.MYSQL_PORT || 3306,
        user: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD || '123',
        database: process.env.MYSQL_DATABASE || 'uploader_ai',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        charset: 'utf8mb4',
        timezone: '+00:00',
        multipleStatements: true
    });
};

const initializeDatabase = async () => {
    try {
        // ابتدا بدون database اتصال برقرار کنیم
        const tempPool = mysql.createPool({
            host: process.env.MYSQL_HOST || 'localhost',
            port: process.env.MYSQL_PORT || 3306,
            user: process.env.MYSQL_USER || 'root',
            password: process.env.MYSQL_PASSWORD || '123',
            charset: 'utf8mb4',
            multipleStatements: true
        });

        // بررسی اتصال
        const connection = await tempPool.getConnection();
        console.log('✅ اتصال به MySQL برقرار شد');
        
        // ایجاد پایگاه داده اگر وجود نداشته باشد
        const dbName = process.env.MYSQL_DATABASE || 'uploader_ai';
        await connection.execute(`CREATE DATABASE IF NOT EXISTS ${dbName} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
        console.log(`✅ پایگاه داده ${dbName} آماده است`);
        
        connection.release();
        await tempPool.end();

        // حالا با database اصلی اتصال برقرار کنیم
        pool = createPool();
        
        // اجرای اسکریپت schema
        await createTables();
        
        console.log('✅ پایگاه داده و جداول آماده هستند');
        return pool;
    } catch (error) {
        console.error('❌ خطا در راه‌اندازی پایگاه داده:', error);
        throw error;
    }
};

const createTables = async () => {
    try {
        const schemaPath = path.join(__dirname, '../../database/schema.sql');
        
        if (await fs.pathExists(schemaPath)) {
            const schema = await fs.readFile(schemaPath, 'utf8');
            
            // تقسیم فایل schema به کوئری‌های جداگانه
            const statements = schema
                .split(';')
                .map(stmt => stmt.trim())
                .filter(stmt => 
                    stmt.length > 0 && 
                    !stmt.startsWith('--') && 
                    !stmt.startsWith('CREATE DATABASE') && 
                    !stmt.startsWith('USE')
                );
            
            // اجرای هر کوئری به صورت جداگانه
            for (const statement of statements) {
                if (statement.trim()) {
                    await pool.execute(statement);
                }
            }
            
            console.log('✅ جداول از فایل schema.sql ایجاد شدند');
        } else {
            // اگر فایل schema وجود نداشت، جداول را به صورت دستی ایجاد کنیم
            await createTablesManually();
        }
    } catch (error) {
        console.error('❌ خطا در ایجاد جداول:', error);
        throw error;
    }
};

const createTablesManually = async () => {
    const tables = [
        `CREATE TABLE IF NOT EXISTS settings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            setting_key VARCHAR(100) NOT NULL UNIQUE,
            setting_value TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_setting_key (setting_key)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
        
        `CREATE TABLE IF NOT EXISTS files (
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
            INDEX idx_upload_date (upload_date)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
        
        `CREATE TABLE IF NOT EXISTS checks (
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
            INDEX idx_bank_name (bank_name)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
        
        `CREATE TABLE IF NOT EXISTS contracts (
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
            INDEX idx_party_b (party_b)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
    ];

    for (const table of tables) {
        await pool.execute(table);
    }

    // درج تنظیمات پیش‌فرض
    const defaultSettings = [
        ['openai_api_key', ''],
        ['max_file_size', '10485760'],
        ['allowed_file_types', 'image/jpeg,image/png,image/gif,application/pdf'],
        ['queue_enabled', 'false'],
        ['ocr_language', 'fas+eng'],
        ['ai_model', 'gpt-3.5-turbo']
    ];

    for (const [key, value] of defaultSettings) {
        await pool.execute(
            'INSERT IGNORE INTO settings (setting_key, setting_value) VALUES (?, ?)',
            [key, value]
        );
    }

    console.log('✅ جداول و تنظیمات پیش‌فرض ایجاد شدند');
};

const executeQuery = async (query, params = []) => {
    try {
        if (!pool) {
            console.error('❌ Database pool is not initialized!');
            throw new Error('Database pool is not initialized');
        }
        
        const [rows] = await pool.execute(query, params);
        return rows;
    } catch (error) {
        console.error('❌ خطا در اجرای کوئری:', error);
        throw error;
    }
};

const executeTransaction = async (queries) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        
        const results = [];
        for (const { query, params } of queries) {
            const [result] = await connection.execute(query, params || []);
            results.push(result);
        }
        
        await connection.commit();
        return results;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

const getConnection = async () => {
    return await pool.getConnection();
};

module.exports = {
    initializeDatabase,
    executeQuery,
    executeTransaction,
    getConnection
};