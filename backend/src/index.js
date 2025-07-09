// backend/src/index.js - فایل اصلی سرور Express
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const uploadRoutes = require('./routes/uploadRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const searchRoutes = require('./routes/searchRoutes');
const { initializeDatabase } = require('./services/databaseService');
const { initializeQueue } = require('./queue/queueManager');

const app = express();
const PORT = process.env.PORT || 5199;

// Middleware - CORS Configuration
app.use(cors({
    origin: [
        'http://localhost:3000', 
        'http://localhost:5173', 
        'http://127.0.0.1:5173',
        'http://frontend:3000'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
        'Content-Type', 
        'Authorization', 
        'X-Requested-With',
        'Accept',
        'Origin'
    ],
    optionsSuccessStatus: 200
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploads - make sure the path is absolute
const uploadsPath = path.join(__dirname, '../uploads');
console.log('📁 Serving uploads from:', uploadsPath);
app.use('/uploads', express.static(uploadsPath));

// Routes
app.use('/api/upload', uploadRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/search', searchRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'سرور در حال اجرا است' });
});

// Test database endpoint
app.get('/api/test-db', async (req, res) => {
    try {
        const { executeQuery } = require('./services/databaseService');
        const result = await executeQuery('SELECT COUNT(*) as count FROM files');
        res.json({ 
            success: true, 
            message: 'Database connection working',
            count: result[0].count 
        });
    } catch (error) {
        console.error('Database test error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Database connection failed',
            error: error.message 
        });
    }
});

// Test fileService endpoint
app.get('/api/test-fileservice', async (req, res) => {
    try {
        const fileService = require('./services/fileService');
        const result = await fileService.getFilesList(1, 5);
        res.json({ 
            success: true, 
            message: 'FileService working',
            data: result 
        });
    } catch (error) {
        console.error('FileService test error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'FileService failed',
            error: error.message 
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('❌ Unhandled error:', err);
    res.status(500).json({
        success: false,
        message: 'خطای سرور'
    });
});

// Initialize services and start server
async function startServer() {
    try {
        await initializeDatabase();
        await initializeQueue();
        
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 سرور در پورت ${PORT} راه‌اندازی شد`);
            console.log(`📁 فایل‌های آپلود شده در: ${uploadsPath}`);
            console.log(`🌐 CORS enabled for: localhost:3000, localhost:5173`);
        });
    } catch (error) {
        console.error('خطا در راه‌اندازی سرور:', error);
        process.exit(1);
    }
}

startServer();