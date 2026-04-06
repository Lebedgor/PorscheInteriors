# Project Rules

## Структура проекта

- `back/` — Express backend на Node.js с MySQL.
- `front/` — frontend на React (`react-scripts`) с исходниками в `src/` и шаблоном в `public/`.
- Корневой `package.json` используется как единая точка dev-запуска всего проекта.
- Стандартная папка для всех загружаемых изображений: `uploads/` в корне проекта.
- Backend очищен от Mongoose и работает через MySQL-модели из `back/models/*.js`.
- Основная точка входа backend: `back/index.js`.
- Основные точки входа frontend: `front/src/index.js`, `front/src/App.js`, `front/public/index.html`.
- Основной язык сайта украинский.

## Команды запуска

### Корень проекта

Рабочая директория:

```powershell
cd c:\Users\felin\Desktop\IT\porschednipro
```

Установка корневых зависимостей:

```powershell
npm install
```

Общий dev-запуск backend и frontend:

```powershell
npm run dev
```

Дополнительные команды:

```powershell
npm run dev:back
npm run dev:front
```

### Backend

Рабочая директория:

```powershell
cd c:\Users\felin\Desktop\IT\porschednipro\back
```

Установка зависимостей:

```powershell
npm install
```

Запуск:

```powershell
npm start
```

Backend поднимается на:

```text
http://localhost:4444
```

### Frontend

Рабочая директория:

```powershell
cd c:\Users\felin\Desktop\IT\porschednipro\front
```

Установка зависимостей:

```powershell
npm install --legacy-peer-deps
```

Запуск frontend:

```powershell
npm start
```

Frontend открывать по адресу:

```text
http://localhost:8080
```

## Локальная схема работы

- Frontend должен открываться с `http://localhost:8080`.
- Backend API должен отвечать с `http://localhost:4444`.
- При локальной работе нельзя ломать эту связку.
- `npm run dev` из корня должен поднимать обе части одновременно: backend через `nodemon`, frontend через `react-scripts`.
- Если изображение по пути `/uploads/...` не найдено, backend должен отдавать `uploads/placeholder.jpg`.
- Локальная переменная frontend `REACT_APP_BASEURL` должна указывать на `http://localhost:4444`.
- Для локального запуска frontend используется `PORT=8080` в `front/.env`.

## Проверка после изменений

- После изменений в backend сначала запускать `npm start` из папки `back`.
- Для сквозной локальной проверки допускается запуск из корня через `npm run dev`.
- При успешном старте backend в консоли должны появиться логи `DB OK` и `Server OK`.
- `DB OK` теперь означает, что backend выполнил реальную проверку соединения с MySQL через тестовый запрос, а не просто создал pool.
- Для быстрой проверки API использовать:

```powershell
Invoke-WebRequest -UseBasicParsing http://localhost:4444/category
Invoke-WebRequest -UseBasicParsing http://localhost:4444/model
Invoke-WebRequest -UseBasicParsing http://localhost:4444/model/1
Invoke-WebRequest -UseBasicParsing http://localhost:4444/interior/9
Invoke-WebRequest -UseBasicParsing http://localhost:4444/auth/me
```

- В проекте сейчас нет отдельных команд `lint`, `typecheck` или `test` в `back/package.json`, поэтому основной способ проверки — запуск сервера и ручная проверка API.
- Если порт `4444` занят, сначала освободить его, потом повторно запускать backend.
- Если занят порт `8080`, сначала освободить его, потом повторно запускать frontend или общий `npm run dev`.
- После правок во frontend запускать `npm start` из папки `front` и проверять, что `http://localhost:8080` отвечает кодом `200`.
- После правок в логике изображений проверять, что `http://localhost:4444/uploads/does-not-exist.jpg` отвечает кодом `200` и отдает placeholder.
- Если frontend не стартует с ошибкой `react-scripts is not recognized`, сначала установить зависимости в `front`.
- Для `GET /auth/me` без токена ожидаемый ответ — `403`, это нормальная проверка auth middleware.

## Ключевые маршруты backend

- Авторизация:
  - `POST /auth/register`
  - `POST /auth/login`
  - `GET /auth/me`
- Установка/инициализация:
  - `GET /install` — защищённый маршрут, требует авторизацию и создаёт таблицы `category`, `image`, `model`, `interior`, `user`
- Пользователи:
  - `PATCH /user/edit`
  - `GET /user/getUser`
  - `GET /user/getAllUsers`
  - `PATCH /user/activate`
- Категории:
  - `GET /category`
  - `GET /category/:id`
  - `POST /category`
  - `PATCH /category`
  - `DELETE /category/:id`
- Модели:
  - `GET /model`
  - `GET /model/:id`
  - `POST /model`
  - `PATCH /model`
  - `DELETE /model/:id`
- Интерьеры:
  - `GET /interior/:id`
  - `POST /interior`
  - `PATCH /interior`
  - `DELETE /interior/:id`
- Изображения:
  - `POST /upload_image`
  - `GET /interior_images/:id`
  - `DELETE /image`
  - `POST /remove`

## Правила изменений

- Не переводить backend обратно на MongoDB без явной необходимости.
- При изменениях ориентироваться на MySQL-модели и текущие маршруты Express.
- Если добавляются новые маршруты, проверять, что frontend реально может их вызвать локально.
- Если меняется frontend, учитывать, что это React-приложение на `react-scripts`, а не просто набор статических файлов.
- Не ломать локальную связку:
  - frontend: `http://localhost:8080`
  - backend API: `http://localhost:4444`
- Если меняются dev-скрипты, сохранять возможность запуска всего проекта одной командой `npm run dev` из корня.
- Если меняется логика изображений, сохранять единый публичный путь `/uploads/...` и единую физическую директорию `porschednipro\uploads\`.
- При изменениях в `back/index.js` проверять, что все маршруты, используемые frontend, действительно смонтированы.
- При изменениях в моделях MySQL не возвращать в проект старую Mongoose-логику.
- Новые SQL-запросы писать только параметризованно, без string interpolation с пользовательским вводом.
- Если редактируется логика пользователей, всегда проверять SQL-запросы на наличие корректного `WHERE`.
- Если меняется загрузка файлов, сохранять создание корневой директории `uploads` через рекурсивное создание папок.
- Если меняется загрузка файлов, сохранять санацию имени файла и не допускать path traversal.
- Если меняется auth-логика, не возвращать fallback для `JWT_SECRET`: переменная обязательна и должна валидироваться явно.
- Если меняются ответы контроллеров, по возможности сохранять единый формат `success + payload/message`, но не ломать текущий frontend-контракт на чтение данных.
- Так как основной язык сайта украинский, любые новые пользовательские тексты во frontend и публичных сообщениях лучше добавлять на украинском, если это не ломает уже существующий контракт.
- Не использовать для frontend локальный backend на `8088`: актуальный локальный API-адрес — `http://localhost:4444`.

## Окружение

- Основные переменные backend лежат в `back/.env`.
- Для запуска нужны:
  - `PORT`
  - `DB_HOST`
  - `DB_USER`
  - `DB_NAME`
  - `DB_PASSWORD`
- Обязательна переменная `JWT_SECRET` — без неё backend не должен стартовать.
- Если backend стартует, но API падает на запросах, сначала проверять подключение к MySQL и значения в `back/.env`.
- Если backend не стартует до `Server OK`, сначала проверять `JWT_SECRET` и доступность MySQL.

## Приоритетные файлы для анализа

- `back/index.js`
- `back/package.json`
- `back/utils/db.js`
- `back/controllers/*.js`
- `back/models/*.js`
- `back/validations/validation.js`
- `package.json`
- `front/package.json`
- `front/.env`
- `front/src/axios.js`
- `front/src/index.js`
- `front/src/App.js`
- `front/public/index.html`

## Известные особенности

- Изображения продолжают использовать пути из `/uploads/...`.
- Все новые изображения сохраняются в корневую папку `uploads`, без дополнительных вложенных папок.
- Если файл из `/uploads/...` отсутствует, backend отдает `uploads/placeholder.jpg`.
- Backend использует единый middleware обработки ошибок для `multer` и общих server errors.
- В части read-эндпоинтов ещё может встречаться старый формат ответа без обёртки `success`, поэтому менять это нужно осторожно, чтобы не сломать frontend.
- Корневой `npm run dev` запускает backend и frontend параллельно через `concurrently`.
- В `npm install` есть предупреждения по зависимостям и уязвимостям, но они не блокируют локальный запуск.
- Во frontend возможны peer dependency warnings из старых пакетов; для локальной установки может потребоваться `npm install --legacy-peer-deps`.
