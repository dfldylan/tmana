#!/bin/sh

# 应用数据库迁移
echo "Applying database migrations..."
python manage.py migrate --noinput

# 启动 Django 开发服务器
echo "Starting Django development server..."
python manage.py runserver 0.0.0.0:8000