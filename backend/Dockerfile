FROM python:3.10-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Устанавливаем системные зависимости для работы с Postgres и сборки
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Устанавливаем системные зависимости
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    # === НОВОЕ: ЗАВИСИМОСТИ ДЛЯ PDF ===
    python3-dev python3-pip python3-setuptools python3-wheel python3-cffi libcairo2 libpango-1.0-0 libpangocairo-1.0-0 libgdk-pixbuf-2.0-0 libffi-dev shared-mime-info \
    # ==================================
    && rm -rf /var/lib/apt/lists/*
# Сначала копируем зависимости (для кэширования слоев Docker)
COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

# Копируем остальной код
COPY . .

# Порт, который будет слушать контейнер
EXPOSE 8000

# Команда запуска (по умолчанию dev-режим)
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]