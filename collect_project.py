import os

# Имя выходного файла
OUTPUT_FILE = 'project_context_full.txt'

# Папки, которые ОБЯЗАТЕЛЬНО нужно игнорировать (иначе файл будет огромным)
IGNORE_DIRS = {
    'node_modules', 'venv', '.venv', 'env', '.git', '__pycache__',
    'build', 'dist', '.idea', '.vscode', 'media', 'staticfiles',
    '.DS_Store'
}

# Файлы, которые точно не нужны (лок-файлы и сама база)
IGNORE_FILES = {
    'db.sqlite3', 'package-lock.json', 'yarn.lock', 'poetry.lock',
    'Pipfile.lock', OUTPUT_FILE, os.path.basename(__file__)
}

def is_binary(file_path):
    """
    Проверяет, является ли файл бинарным.
    Читает первые 1024 байта и ищет нулевой байт.
    """
    try:
        with open(file_path, 'rb') as f:
            chunk = f.read(1024)
            if b'\0' in chunk:
                return True
            # Дополнительная проверка: попробуем декодировать как utf-8
            try:
                chunk.decode('utf-8')
            except UnicodeDecodeError:
                return True
    except Exception:
        return True
    return False

def print_tree(startpath, outfile):
    """Записывает визуальное дерево файлов в начало отчета"""
    outfile.write("PROJECT STRUCTURE:\n")
    outfile.write("==================\n")

    for root, dirs, files in os.walk(startpath):
        # Фильтрация папок
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]

        level = root.replace(startpath, '').count(os.sep)
        indent = ' ' * 4 * (level)
        outfile.write(f"{indent}{os.path.basename(root)}/\n")

        subindent = ' ' * 4 * (level + 1)
        for f in files:
            if f not in IGNORE_FILES:
                outfile.write(f"{subindent}{f}\n")

    outfile.write("\n" + "="*50 + "\n\n")

def collect_code():
    total_files = 0

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as outfile:
        # 1. Сначала пишем структуру проекта (дерево)
        print("Генерация структуры проекта...")
        print_tree('.', outfile)

        # 2. Теперь содержимое файлов
        print("Сбор содержимого файлов...")

        for root, dirs, files in os.walk('.'):
            # Фильтрация папок
            dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]

            for file in files:
                if file in IGNORE_FILES:
                    continue

                file_path = os.path.join(root, file)
                total_files += 1

                outfile.write(f"{'='*50}\n")
                outfile.write(f"FILE: {file_path}\n")
                outfile.write(f"{'='*50}\n")

                if is_binary(file_path):
                    outfile.write("[BINARY FILE OR NON-UTF8 CONTENT - SKIPPED]\n\n")
                    print(f"Skipped binary: {file_path}")
                else:
                    try:
                        with open(file_path, 'r', encoding='utf-8') as f:
                            content = f.read()
                            outfile.write(content + "\n\n")
                        print(f"Added: {file_path}")
                    except Exception as e:
                        outfile.write(f"[ERROR READING FILE: {e}]\n\n")

    print(f"\nГотово! Обработано файлов: {total_files}")
    print(f"Результат сохранен в: {OUTPUT_FILE}")

if __name__ == '__main__':
    collect_code()