// backend/src/services/ocrService.js - سرویس OCR برای استخراج متن از تصاویر
const Tesseract = require('tesseract.js');
const path = require('path');
const fs = require('fs-extra');

class OCRService {
    constructor() {
        this.worker = null;
        this.isInitialized = false;
    }

    async initialize() {
        if (this.isInitialized) return;
        
        try {
            this.worker = await Tesseract.createWorker('fas+eng', 1, {
                logger: m => console.log(m)
            });
            this.isInitialized = true;
            console.log('OCR Worker initialized successfully');
        } catch (error) {
            console.error('Failed to initialize OCR worker:', error);
            throw error;
        }
    }

    async extractText(imagePath) {
        if (!this.isInitialized) {
            await this.initialize();
        }

        try {
            const { data: { text, confidence } } = await this.worker.recognize(imagePath);
            return {
                text: text.trim(),
                confidence,
                success: true
            };
        } catch (error) {
            console.error('OCR extraction failed:', error);
            return {
                text: '',
                confidence: 0,
                success: false,
                error: error.message
            };
        }
    }

    async terminate() {
        if (this.worker) {
            await this.worker.terminate();
            this.isInitialized = false;
        }
    }
}

module.exports = new OCRService();