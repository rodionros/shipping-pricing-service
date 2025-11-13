# Shipping Pricing Service

Сервис для расчёта стоимости и сроков доставки на основе данных корзины и адреса.

**Стек:** Bun, Elysia, TypeScript, PostgreSQL, Redis, Drizzle ORM, Docker.

---

## 🚀 Локальный запуск

### 1. Установка зависимостей

```bash
bun install
```

### 2. Создай `.env`

```env
PORT=3000
NODE_ENV=development

DATABASE_URL=postgres://postgres:postgres@localhost:5432/shipping_db
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 3. PostgreSQL и Redis

```bash
docker run --rm -p 5432:5432   -e POSTGRES_DB=shipping_db   -e POSTGRES_USER=postgres   -e POSTGRES_PASSWORD=postgres   postgres:16

docker run --rm -p 6379:6379 redis:7
```

### 4. Миграции + запуск

```bash
bun run migrate
bun run dev
```

Проверка:

```bash
curl http://localhost:3000/health
```

---

## 🐳 Запуск через Docker

### Сборка образа

```bash
docker build -t ghcr.io/rodionrostovchshikov/shipping-pricing-service:local .
```

### Запуск

```bash
docker run --rm -p 3000:3000 --env-file .env   ghcr.io/rodionrostovchshikov/shipping-pricing-service:local
```

---

## 📦 API

### Health-check

```
GET /health
```

### Расчёт стоимости доставки

```
POST /shipping/quotes
Content-Type: application/json
```

---

## 📘 Swagger

```
http://localhost:3000/swagger
```

---

## 🧪 Тесты

```bash
bun test
```
