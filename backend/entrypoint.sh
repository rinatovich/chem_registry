#!/bin/sh

# Ждем пока база поднимется (можно использовать netcat или python скрипт, но для простоты sleep)
# Лучше использовать wait-for-it.sh, но пока так:
echo "Waiting for DB..."
sleep 5

echo "Applying migrations..."
python manage.py migrate

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Starting Gunicorn..."
# Запускаем Gunicorn на 4 воркерах
gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 3