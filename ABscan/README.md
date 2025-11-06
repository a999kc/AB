## ABscan — запуск и API

### 0) Форматирование кода

Проект использует **Prettier** для единообразного форматирования кода.

**Настройки форматирования:**
- Отступы: 2 пробела
- Двойные кавычки для строк
- Точки с запятой обязательны
- Длина строки: 100 символов

**Форматирование кода:**

```bash
# Backend
cd backend
npm run format

# Frontend
cd frontend
npm run format

# Или используйте скрипт для всего проекта (Windows PowerShell):
.\format-all.ps1
```

**Автоматическое форматирование:**
Большинство редакторов (VS Code, WebStorm и др.) могут автоматически форматировать код при сохранении, если установлено расширение Prettier.

### 1) Необходимые зависимости

**Для локального запуска:**

- Node.js 18+ (рекомендовано 20+)
- npm 9+
- PostgreSQL 13+ (локально или в контейнере)

**Для запуска через Docker:**

- Docker Desktop (или Docker Engine + Docker Compose)

Frontend:

- Vite + React

Backend:

- NestJS 11
- Sequelize (sequelize-typescript) + драйверы `pg`, `pg-hstore`
- `dotenv` для переменных окружения

Переменные окружения (файл `.env` в корне репозитория `c:\TestTask\`):

```
# Порт бекенда (должен совпадать с BASE_URL на фронте)
PORT=7000

# Подключение к PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PWD=postgres
POSTGRES_DB=abscan
```

Обратите внимание: фронтенд использует базовый URL `http://localhost:7000` (см. `frontend/src/services/ax.ts`).

### 2) Запуск приложения (локально, без Docker)

1. Создайте базу данных PostgreSQL (пример: `abscan`).
2. Заполните `.env` как выше (в корне `c:\TestTask\`).
3. Установка зависимостей:
   - Backend: `cd ABscan/backend && npm install`
   - Frontend: `cd ../frontend && npm install`
4. Запустите backend (NestJS):
   - `cd ABscan/backend`
   - `npm run start:dev`
   - По умолчанию поднимется на порту из `PORT` (`7000`). CORS разрешён для `http://localhost:5173`.
5. Запустите frontend (Vite):
   - `cd ABscan/frontend`
   - `npm run dev`
   - Откройте `http://localhost:5173`

Если порт бекенда отличается от `7000`, обновите `BASE_URL` в `frontend/src/services/ax.ts`.

### 2.1) Запуск через Docker (рекомендуется)

Проект полностью настроен для запуска через Docker Compose. Все необходимые контейнеры (PostgreSQL, Backend, Frontend) будут запущены одной командой.

**Требования:**

- Docker Desktop (или Docker Engine + Docker Compose)
- Порты 5432, 7000, 5173 должны быть свободны

**Запуск:**

1. Перейдите в директорию проекта:

   ```bash
   cd ABscan
   ```

2. Запустите все сервисы:

   ```bash
   docker compose up
   ```

   Для запуска в фоновом режиме:

   ```bash
   docker compose up -d
   ```

3. Приложение будет доступно:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:7000
   - PostgreSQL: localhost:5432

**Остановка:**

```bash
docker compose down
```

**Остановка с удалением volumes (удалит данные БД):**

```bash
docker compose down -v
```

**Пересборка образов (после изменений в коде):**

```bash
docker compose up --build
```

**Структура контейнеров:**

- `abscan-db` — PostgreSQL база данных
- `abscan-backend` — NestJS API сервер
- `abscan-frontend` — React приложение (Nginx)

**Переменные окружения в Docker:**
Все переменные окружения задаются в `docker-compose.yml`. Для изменения настроек (порты, пароли БД и т.д.) отредактируйте файл `docker-compose.yml`.

**Примечание:** При первом запуске Docker автоматически создаст базу данных и применит миграции (если они есть). Данные БД сохраняются в Docker volume `postgres_data`.

### 2.2) Тестирование с GoLogin браузером

GoLogin и другие изолированные браузеры не могут обращаться к `localhost`. Используйте IP-адрес вашего компьютера.

**Шаги:**

1. **Узнайте IP-адрес вашего компьютера:**
   - Windows: откройте PowerShell и выполните:
     ```powershell
     ipconfig | findstr /i "IPv4"
     ```
   - Linux/Mac: выполните:
     ```bash
     hostname -I
     ```
   - Обычно это адрес вида `192.168.x.x` или `10.x.x.x`

2. **Убедитесь, что приложение запущено:**

   ```bash
   docker compose up
   # или локально
   ```

3. **Откройте приложение в GoLogin:**
   - Запустите GoLogin браузер
   - Откройте профиль
   - Перейдите на `http://ВАШ_IP:5173` (например: `http://192.168.0.10:5173`)
   - **Не используйте `localhost`** — он не будет работать в GoLogin

4. **Примечание:**
   - Приложение автоматически определит хост и будет использовать правильный URL для API
   - CORS настроен для работы с любыми origins (для тестирования)
   - Если возникают проблемы с подключением, проверьте, что брандмауэр Windows разрешает входящие подключения на портах 5173 и 7000

### 3) Описание API (endpoints)

Базовый URL бекенда: `http://localhost:7000`

#### Users

- POST `/users`
  - Назначение: создать нового пользователя
  - Тело: без тела
  - Ответ 200:
    ```json
    { "id": number }
    ```

- GET `/users`
  - Назначение: получить всех пользователей
  - Ответ 200: массив пользователей
    ```json
    [
      { "id": number }
    ]
    ```

#### Scans

- POST `/scans`
  - Назначение: создать запись сканирования
  - Тело (JSON):
    ```json
    {
      "user": number,   // ID существующего пользователя
      "isAb": boolean   // результат детекции
    }
    ```
  - Ответ 200: созданный объект скана

- GET `/scans`
  - Назначение: получить все сканы
  - Ответ 200: массив сканов

- GET `/scans/:id`
  - Назначение: получить скан по ID
  - Параметры пути: `id` (number)
  - Ответ 200: объект скана

- DELETE `/scans/:id`
  - Назначение: удалить скан по ID
  - Параметры пути: `id` (number)
  - Ответ 200: удалённый объект или служебная информация

- DELETE `/scans`
  - Назначение: удалить все сканы
  - Ответ 200: служебная информация

### 4) Frontend — важные места

- `frontend/src/services/ax.ts` — базовый URL API (`BASE_URL = "http://localhost:7000"`), методы для работы со сканами/пользователями
- `frontend/src/components/Home.tsx` — создание пользователя при первом входе и запуск сканирования

### 5) Частые проблемы

- Несовпадение порта бекенда и `BASE_URL` на фронте — обновите одно из значений
- Нет соединения с PostgreSQL — проверьте переменные окружения и доступность БД
- CORS ошибки — бекенд разрешает `http://localhost:5173`; при необходимости добавьте ваш origin в `backend/src/main.ts`
