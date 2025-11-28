# REST API Service (Express + MySQL + TypeORM)

Сервис реализует систему аутентификации (JWT + Refresh Tokens) и управление файлами.

## 🛠 Технологии

-   **Node.js** & **Express**
-   **TypeScript**
-   **MySQL** (в Docker)
-   **TypeORM** (ORM)
-   **JWT** (Access + Refresh tokens)
-   **Multer** (Загрузка файлов)

## 🚀 Запуск проекта

### Предварительные требования

-   Установленный **Docker** и **Docker Compose**.
-   Установленный **Node.js** (v16+).

### 1. Настройка переменных окружения

Переименуйте файл .env.example в .env

### 2. Запуск базы данных

docker-compose up -d
База данных будет доступна на порту 3306.

### 3. Установка зависимостей

npm install

### 4. Запуск приложения

npm run start
Сервер запустится на http://localhost:3000

### 5. Документация API

POST /signup Регистрация { "id": "email", "password": "pass" }
POST /signin Вход { "id": "email", "password": "pass" }
POST /signin/new_token Обновление токена { "refreshToken": "..." }
GET /info Инфо о юзере (Auth Bearer)
GET /logout Выход ?refreshToken=... (Auth Bearer)

POST /file/upload Загрузка (multipart/form-data, поле file)
GET /file/list Список ?page=1&list_size=10
GET /file/:id Инфо о файле
GET /file/download/:id Скачать файл
PUT /file/update/:id Обновить файл
DELETE /file/delete/:id Удалить файл
