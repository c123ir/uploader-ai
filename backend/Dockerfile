# backend/Dockerfile - Backend container setup
FROM node:18-alpine

# نصب Tesseract برای OCR
RUN apk add --no-cache tesseract-ocr tesseract-ocr-data-fas tesseract-ocr-data-eng

WORKDIR /app

# کپی فایل‌های package
COPY package*.json ./

# نصب وابستگی‌ها
RUN npm install

# کپی کد منبع
COPY . .

# ایجاد پوشه uploads
RUN mkdir -p uploads

EXPOSE 5000

CMD ["npm", "run", "dev"]