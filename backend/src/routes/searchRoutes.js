// backend/src/routes/searchRoutes.js - مسیرهای جستجو
const express = require('express');
const { executeQuery } = require('../services/databaseService');

const router = express.Router();

// جستجو در فایل‌ها
router.get('/files', async (req, res) => {
    try {
        const { q, type, status } = req.query;
        let query = 'SELECT * FROM files WHERE 1=1';
        const params = [];

        if (q) {
            // استفاده از FULLTEXT INDEX برای جستجوی سریع‌تر
            query += ' AND MATCH(original_name, filename) AGAINST(? IN BOOLEAN MODE)';
            params.push(q);
        }

        if (type) {
            query += ' AND document_type = ?';
            params.push(type);
        }

        if (status) {
            query += ' AND processing_status = ?';
            params.push(status);
        }

        query += ' ORDER BY upload_date DESC LIMIT 50';

        const files = await executeQuery(query, params);

        res.json({
            success: true,
            data: files
        });
    } catch (error) {
        console.error('خطا در جستجو:', error);
        res.status(500).json({
            success: false,
            message: 'خطا در جستجو'
        });
    }
});

// جستجو در چک‌ها
router.get('/checks', async (req, res) => {
    try {
        const { q } = req.query;
        let query = `
            SELECT c.*, f.original_name, f.filename 
            FROM checks c 
            JOIN files f ON c.file_id = f.id 
            WHERE 1=1
        `;
        const params = [];

        if (q) {
            // استفاده از FULLTEXT INDEX برای جستجوی سریع‌تر
            query += ` AND MATCH(c.amount, c.date, c.payee, c.check_number, c.bank_name, c.account_number, c.extracted_text) AGAINST(? IN BOOLEAN MODE)`;
            params.push(q);
        }

        query += ' ORDER BY c.created_at DESC LIMIT 50';

        const checks = await executeQuery(query, params);

        res.json({
            success: true,
            data: checks
        });
    } catch (error) {
        console.error('خطا در جستجوی چک‌ها:', error);
        res.status(500).json({
            success: false,
            message: 'خطا در جستجوی چک‌ها'
        });
    }
});

// جستجو در قراردادها
router.get('/contracts', async (req, res) => {
    try {
        const { q } = req.query;
        let query = `
            SELECT c.*, f.original_name, f.filename 
            FROM contracts c 
            JOIN files f ON c.file_id = f.id 
            WHERE 1=1
        `;
        const params = [];

        if (q) {
            // استفاده از FULLTEXT INDEX برای جستجوی سریع‌تر
            query += ` AND MATCH(c.contract_type, c.party_a, c.party_b, c.start_date, c.end_date, c.amount, c.extracted_text) AGAINST(? IN BOOLEAN MODE)`;
            params.push(q);
        }

        query += ' ORDER BY c.created_at DESC LIMIT 50';

        const contracts = await executeQuery(query, params);

        res.json({
            success: true,
            data: contracts
        });
    } catch (error) {
        console.error('خطا در جستجوی قراردادها:', error);
        res.status(500).json({
            success: false,
            message: 'خطا در جستجوی قراردادها'
        });
    }
});

module.exports = router;