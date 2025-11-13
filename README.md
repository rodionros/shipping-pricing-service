# Shipping Pricing Service (Bun + Elysia + DDD + Clean Architecture)

Независимый микросервис для расчёта стоимости доставки с использованием Bun.js, Elysia.js, Drizzle ORM, PostgreSQL и Redis.

## Архитектура

Сервис построен по принципам DDD и Чистой Архитектуры:

- **Domain Layer**
    - Доменные сущности: `ShipmentRequest`, `DeliveryOption`, `Address`.
    - Интерфейсы провайдеров: `ShippingProvider`.
    - Интерфейсы репозиториев: `ShippingRequestRepository`, `ShippingQuoteRepository`.
    - Доменные ошибки.

- **Application Layer**
    - Use-case / сервис приложения: `ShippingService`.
    - DTO и мапперы запрос/ответ.
    - Валидация входных данных (Zod-схемы).
    - Координация: вызов доменных провайдеров, кэширование, сохранение в БД.
    - **Важно:** бизнес-правила инкапсулированы в домене, Application только оркестрирует.

- **Infrastructure Layer**
    - HTTP API на Elysia: роут `POST /shipping/quotes`.
    - Реализация провайдеров: `MockCdekProvider`, `MockBoxberryProvider`.
    - Drizzle ORM + PostgreSQL для хранения запросов и котировок.
    - Redis:
        - Кэширование ответов по ключу `(cart + address)` на короткое время.
        - Очередь событий (worker читает из Redis-очереди и логирует их).
    - Централизованный error handler.
    - Логирование.

### Добавление нового провайдера (расширяемость)

Чтобы добавить нового провайдера (например, `YandexDeliveryProvider`):

1. В домене уже определён интерфейс:

   ```ts
   export interface ShippingProvider {
     readonly code: string;
     getQuotes(request: ShipmentRequest): Promise<DeliveryOption[]>;
   }