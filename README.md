# Flask + MongoDB CRUD de Clientes (Docker)

Proyecto de ejemplo que provee:
- API REST (Flask + pymongo) con endpoints CRUD para `clientes`.
- Frontend con plantillas Jinja2 que consume la API.
- Dockerfile y docker-compose para levantar la app y MongoDB.

## Requisitos
- Docker
- Docker Compose

## Levantar el sistema (modo local con Docker)
1. Clonar repo:
   ```bash
   git clone <TU_REPO_URL>
   cd flask-mongo-crud
2. Construir y levantar:

   `docker compose up --build`


   La app quedará en http://localhost:5000
   MongoDB en mongodb://localhost:27017

3. Para detener:

`docker compose down`