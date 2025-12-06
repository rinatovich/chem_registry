FROM node:20-alpine

WORKDIR /app

# Копируем package.json, чтобы установить зависимости
COPY package*.json ./
RUN npm install

# Копируем остальной код
COPY . .

# Открываем порт
EXPOSE 5173

# Запускаем в режиме разработки с флагом --host (важно для доступа из браузера)
CMD ["npm", "run", "dev", "--", "--host"]