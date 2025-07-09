# frontend/Dockerfile - Frontend container setup
FROM node:18-alpine

WORKDIR /app

# کپی فایل‌های package
COPY package*.json ./

# نصب وابستگی‌ها
RUN npm install

# کپی کد منبع
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]