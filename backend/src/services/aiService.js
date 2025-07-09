// backend/src/services/aiService.js - سرویس هوش مصنوعی برای تشخیص اسناد
const fs = require('fs-extra');
const Tesseract = require('tesseract.js');
const OpenAI = require('openai/index.js');
const settingsService = require('./settingsService');

class AIService {
    constructor() {
        this.openai = null;
        this.initializeOpenAI();
    }

    async initializeOpenAI() {
        try {
            const apiKey = await settingsService.getOpenAIApiKey();
            if (apiKey) {
                this.openai = new OpenAI({
                    apiKey: apiKey
                });
            }
        } catch (error) {
            console.warn('OpenAI API Key یافت نشد، از تشخیص محلی استفاده می‌شود');
        }
    }

    // تشخیص نوع سند
    async detectDocumentType(filePath) {
        try {
            // ابتدا متن را استخراج کنیم
            const extractedText = await this.extractTextFromImage(filePath);
            
            // تشخیص نوع سند بر اساس متن
            const documentType = await this.classifyDocument(extractedText);
            
            // محاسبه confidence بر اساس کیفیت تشخیص
            const confidence = this.calculateConfidence(extractedText, documentType);
            
            return {
                documentType,
                confidence,
                extractedText
            };
        } catch (error) {
            console.error('خطا در تشخیص نوع سند:', error);
            throw error;
        }
    }

    // استخراج متن از تصویر با OCR
    async extractTextFromImage(filePath) {
        try {
            const result = await Tesseract.recognize(filePath, 'fas+eng', {
                logger: m => {
                    if (m.status === 'recognizing text') {
                        console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
                    }
                }
            });
            
            return result.data.text;
        } catch (error) {
            console.error('خطا در استخراج متن:', error);
            return '';
        }
    }

    // طبقه‌بندی سند بر اساس متن
    async classifyDocument(text) {
        // اگر متن خالی است
        if (!text || text.trim().length < 10) {
            return 'unknown';
        }

        const normalizedText = text.toLowerCase().replace(/\s+/g, ' ');

        // الگوهای تشخیص برای انواع مختلف اسناد
        const patterns = {
            'check': [
                'چک', 'بانک', 'مبلغ', 'ریال', 'تومان', 'شماره چک', 
                'در وجه', 'تاریخ', 'امضا', 'حساب', 'bank', 'check'
            ],
            'contract': [
                'قرارداد', 'طرفین', 'موافقتنامه', 'شرایط', 'بند', 'ماده',
                'امضا', 'تاریخ', 'contract', 'agreement', 'party'
            ],
            'invoice': [
                'فاکتور', 'صورتحساب', 'invoice', 'مبلغ', 'قیمت', 'تعداد',
                'جمع کل', 'مالیات', 'تخفیف', 'bill', 'receipt'
            ],
            'id_card': [
                'کارت ملی', 'کد ملی', 'شماره ملی', 'national card',
                'identity card', 'id card'
            ],
            'birth_certificate': [
                'شناسنامه', 'کد ملی', 'محل تولد', 'تاریخ تولد', 'نام پدر',
                'شماره شناسنامه', 'birth certificate', 'national id'
            ],
            'license': [
                'گواهینامه', 'مدرک', 'دانشگاه', 'مؤسسه', 'certificate',
                'diploma', 'degree', 'گواهی'
            ],
            'letter': [
                'نامه', 'letter', 'مکاتبه', 'تاریخ', 'گیرنده', 'فرستنده',
                'محترم', 'با سلام', 'correspondence'
            ],
            'form': [
                'فرم', 'درخواست', 'تقاضا', 'application', 'form',
                'پرسشنامه', 'questionnaire'
            ],
            'report': [
                'گزارش', 'report', 'آمار', 'statistics', 'analysis',
                'تحلیل', 'بررسی', 'مطالعه'
            ]
        };

        // امتیازدهی به هر نوع سند
        const scores = {};
        
        for (const [docType, keywords] of Object.entries(patterns)) {
            let score = 0;
            
            keywords.forEach(keyword => {
                const regex = new RegExp(keyword.replace(/\s+/g, '\\s+'), 'gi');
                const matches = normalizedText.match(regex);
                if (matches) {
                    score += matches.length;
                }
            });
            
            scores[docType] = score;
        }

        // یافتن نوع سند با بالاترین امتیاز
        const maxScore = Math.max(...Object.values(scores));
        
        if (maxScore === 0) {
            return 'other';
        }
        
        const detectedType = Object.keys(scores).find(key => scores[key] === maxScore);
        
        // اگر OpenAI در دسترس است، از آن برای تأیید استفاده کنیم
        if (this.openai && maxScore < 3) {
            try {
                const aiType = await this.classifyWithOpenAI(text);
                return aiType || detectedType || 'other';
            } catch (error) {
                console.warn('خطا در تشخیص OpenAI:', error.message);
            }
        }
        
        return detectedType || 'other';
    }

    // تشخیص با OpenAI (اختیاری)
    async classifyWithOpenAI(text) {
        if (!this.openai) {
            return null;
        }

        try {
            const completion = await this.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: `شما یک سیستم تشخیص نوع اسناد هستید. متن زیر را بررسی کرده و نوع سند را مشخص کنید. پاسخ خود را فقط یکی از این گزینه‌ها ارائه دهید:
- check (چک بانکی)
- contract (قرارداد)
- invoice (فاکتور)
- id_card (کارت ملی)
- birth_certificate (شناسنامه)
- license (گواهینامه)
- letter (نامه)
- form (فرم)
- report (گزارش)
- other (سایر)`
                    },
                    {
                        role: "user",
                        content: text.substring(0, 1000) // محدود کردن طول متن
                    }
                ],
                max_tokens: 50,
                temperature: 0.1
            });

            return completion.choices[0]?.message?.content?.trim().toLowerCase().split(' ')[0];
        } catch (error) {
            console.error('خطا در OpenAI:', error);
            return null;
        }
    }

    // محاسبه confidence بر اساس کیفیت تشخیص
    calculateConfidence(text, documentType) {
        if (!text || text.trim().length < 10) {
            return 0.3;
        }

        if (documentType === 'unknown' || documentType === 'other') {
            return 0.5;
        }

        // بررسی طول متن (متن بیشتر = اطمینان بیشتر)
        const textLength = text.trim().length;
        let confidence = 0.6;

        if (textLength > 100) confidence += 0.1;
        if (textLength > 300) confidence += 0.1;
        if (textLength > 500) confidence += 0.1;

        // بررسی وجود اعداد (برای چک و فاکتور مهم است)
        const hasNumbers = /\d/.test(text);
        if (hasNumbers && (documentType.includes('check') || documentType.includes('invoice'))) {
            confidence += 0.1;
        }

        // بررسی وجود تاریخ
        const hasDate = /\d{2,4}[\/\-]\d{1,2}[\/\-]\d{2,4}/.test(text);
        if (hasDate) {
            confidence += 0.05;
        }

        return Math.min(confidence, 0.95); // حداکثر 95%
    }
}

module.exports = new AIService();