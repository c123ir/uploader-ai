#!/bin/bash
# start.sh - اسکریپت راه‌اندازی پروژه

echo "🚀 Starting Uploader AI..."

# بررسی وجود Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# ساخت و راه‌اندازی کانتینرها
echo "📦 Building and starting containers..."
docker-compose up --build -d

# انتظار برای راه‌اندازی سرویس‌ها
echo "⏳ Waiting for services to start..."
sleep 10

# بررسی وضعیت سرویس‌ها
echo "🔍 Checking service status..."
docker-compose ps

echo "✅ Uploader AI is running!"
echo "🌐 Frontend: http://localhost:5173"
echo "🔧 Backend API: http://localhost:5199"
echo "📊 Redis: localhost:6379"
echo "🗄️ MySQL: localhost:3306"
echo ""
echo "📝 To stop the application, run: docker-compose down"
echo "📋 To view logs, run: docker-compose logs -f"