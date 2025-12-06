# National Chemical Registry (НРОХВ)

Система учета и контроля опасных химических веществ РУз.

## Технологический стек
- **Backend:** Django, DRF, Celery
- **Database:** PostgreSQL + pg_trgm (Search)
- **Files:** MinIO (S3)
- **Infrastructure:** Docker Compose

## Установка и запуск

1. **Клонируйте репозиторий:**
   ```bash
   git clone <ссылка>
   cd chem_project


Создайте файл .env:
Скопируйте .env.example в .env и задайте свои пароли.
Запустите проект:
code
Bash
docker-compose up -d --build
Примените миграции:
code
Bash
docker-compose exec api python manage.py migrate
docker-compose exec api python manage.py createsuperuser
Доступы:
Сайт API: http://localhost:8000
Админка: http://localhost:8000/admin
MinIO Console: http://localhost:9001
code
Code
---

### ШАГ 5. Инициализация Git и Первый коммит

Откройте терминал в корне проекта (где `docker-compose.yml`).

1.  **Инициализация:**
    ```bash
    git init
    ```

2.  **Добавление файлов (Индексация):**
    ```bash
    git add .
    ```
    *После этой команды посмотрите список добавленного (`git status`). Убедитесь, что там НЕТ папок `node_modules`, `postgres_data`, `venv`.*

3.  **Первый коммит:**
    ```bash
    git commit -m "Initial commit: Backend Ready (API, S3, Celery, Auth, Registry Logic)"
    ```

4.  **Создание ветки main:**
    ```bash
    git branch -M main
    ```

---

### ШАГ 6. Заливка на GitHub/GitLab

1.  Создайте **пустой репозиторий** на GitHub (без README, без .gitignore — они у вас уже есть).
2.  Скопируйте ссылку (например `https://github.com/yourname/chem-registry.git`).
3.  В терминале свяжите ваш локальный гит с удаленным:
    ```bash
    git remote add origin https://github.com/yourname/chem-registry.git
    ```
4.  Отправьте данные:
    ```bash
    git push -u origin main
    ```

### ИТОГ

Ваш проект в безопасности. Теперь, если вы что-то сломаете на фронтенде или в конфигах, вы всегда сможете вернуться к состоянию **"Полностью рабочий бэкенд"**.