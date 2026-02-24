# Fuzzy Fiesta — Trading API

REST API para gestión de órdenes de inversión, construida con Node.js, TypeScript, Express y Sequelize sobre PostgreSQL.

## Stack

| Capa | Tecnología |
|---|---|
| Runtime | Node.js v22+ |
| Lenguaje | TypeScript |
| Framework HTTP | Express + express-async-errors |
| ORM | Sequelize + sequelize-typescript |
| Base de datos | PostgreSQL |
| Inyección de dependencias | Awilix (PROXY mode) |
| Validación | Zod |
| Testing | Jest + Supertest |

## Requisitos previos

- Node.js v22+
- PostgreSQL con la base de datos `fuzzy_db` disponible

## Instalación

```bash
npm install
```

## Configuración

Copiar el archivo de entorno y completar las variables:

```bash
cp .env.example .env
```

Variables disponibles:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=fuzzy_db
DB_USER=postgres
DB_PASSWORD=
```

## Iniciar la aplicación

```bash
npm start
```

La API queda disponible en `http://localhost:3000`.

La documentación interactiva (Swagger UI) está disponible en `http://localhost:3000/docs`.

## Desarrollo

Inicia el servidor con recarga automática al detectar cambios:

```bash
npm run dev
```

## Endpoints

- `GET /health`
- `GET /instruments?q=:query`
- `GET /portfolio/:userId`
- `POST /orders`
- `DELETE /orders/:orderId`

## Tests

```bash
npm test
```

## Recursos

- [Diagrama de base de datos](docs/dbDiagram.md)
- [Colección Postman](docs/postman/fuzzy-fiesta.postman_collection.json) — importar en Postman y configurar la variable de colección `baseUrl` (única variable requerida) a `http://localhost:3000`
