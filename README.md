# Uploader AI - سیستم هوشمند پردازش اسناد

سیستم هوشمند برای آپلود و پردازش تصاویر چک و قراردادها با استفاده از OCR و هوش مصنوعی.

## ویژگی‌ها

- 📤 آپلود تصاویر مختلف تصاویر و اسناد حسابداری و متنی
- 🔍 استخراج متن با OCR (Tesseract)
- 🤖 تحلیل هوشمند با OpenAI GPT
- 📊 مدیریت صف پردازش با BullMQ
- 💾 ذخیره‌سازی در MySQL
- 🎨 رابط کاربری مدرن با React و Tailwind
- 🐳 پشتیبانی کامل از Docker
- 🔍 جستجوی سریع با FULLTEXT INDEX
- 📋 کپی لینک دانلود در کلیپ‌بورد

## نیازمندی‌ها

- Docker و Docker Compose
- کلید API OpenAI

## راه‌اندازی

### روش اول: با Docker (توصیه شده)

1. کلون کردن پروژه:
https://github.com/c123ir/uploader-ai.git
```bash
git clone <repository-url>
cd uploader-ai
```

1. کپی کردن فایل تنظیمات:
```bash
cp env.example .env
```

1. ویرایش فایل `.env` و تنظیم کلید OpenAI:
```bash
nano .env
```

1. اجرای پروژه:
```bash
chmod +x start.sh
./start.sh
```

### روش دوم: بدون Docker

1. نصب وابستگی‌ها:
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

2. راه‌اندازی MySQL و Redis:
```bash
# MySQL
mysql -u root -p123 -e "CREATE DATABASE IF NOT EXISTS uploader_ai;"

# Redis
redis-server
```

3. اجرای سرویس‌ها:
```bash
# Backend (در ترمینال اول)
cd backend
npm run dev

# Frontend (در ترمینال دوم)
cd frontend
npm run dev
```

## پورت‌های سرویس

- 🌐 Frontend: http://localhost:5173
- 🔧 Backend API: http://localhost:5199
- 📊 Redis: localhost:6379
- 🗄️ MySQL: localhost:3306

## ساختار پروژه

```
uploader-ai/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── queue/
│   │   └── workers/
│   ├── database/
│   └── uploads/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   └── types/
│   └── public/
├── docker-compose.yml
├── start.sh
└── README.md
```

## قابلیت‌های اصلی

### 🔍 تشخیص هوشمند اسناد
- تشخیص خودکار نوع سند (چک، قرارداد، فاکتور، شناسنامه و...)
- استخراج متن با OCR فارسی و انگلیسی
- تحلیل محتوا با OpenAI GPT

### 📊 مدیریت فایل‌ها
- آپلود با drag & drop
- نمایش پیش‌نمایش تصاویر
- کپی لینک دانلود در کلیپ‌بورد
- جستجوی سریع در فایل‌ها

### ⚙️ تنظیمات سیستم
- تنظیم کلید OpenAI
- تغییر سایز حداکثر فایل
- تنظیم زبان OCR
- فعال/غیرفعال کردن صف پردازش

## پشتیبانی از انواع اسناد

- 💵 چک‌های بانکی
- 📋 قراردادها
- 🧾 فاکتورها
- 🆔 کارت ملی و شناسنامه
- 📄 گواهینامه‌ها و مدارک
- 💌 نامه‌ها و مکاتبات
- 📝 فرم‌ها و درخواست‌ها
- 📊 گزارش‌ها و تحلیل‌ها

## امنیت

- کلیدهای API در فایل `.env` ذخیره می‌شوند
- فایل‌ها در مسیر امن ذخیره می‌شوند
- CORS برای امنیت تنظیم شده است
- اعتبارسنجی فایل‌های آپلود شده

## مشارکت

برای مشارکت در پروژه، لطفاً:

1. Fork کنید
2. Branch جدید ایجاد کنید
3. تغییرات را commit کنید
4. Pull Request ارسال کنید

## لایسنس

این پروژه تحت لایسنس MIT منتشر شده است.
