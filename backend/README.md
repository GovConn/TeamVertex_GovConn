# Backend Service

Handles core business logic, data management, and API endpoints for TeamVertex GovConn. Built with Python, it connects to databases and serves as the main data provider for frontend and AI services.

## Key Features
- RESTful API endpoints
- Database integration
- Analytics and CRUD operations

## Usage
See the main README for deployment and API documentation.

--- 

## Requirements
# GovConn Backend — API Documentation

This document describes the GovConn FastAPI backend: how to set it up, run it, and a concise reference for the main API endpoints.

---

## Project overview

- Language: Python (FastAPI)
- HTTP framework: FastAPI
- ORM: SQLAlchemy
- Purpose: Backend services for GovConn — managing citizens, services, documents, appointments, notifications, and related resources.

Repository layout (important files/folders):

- `app/` — application package
  - `app/main.py` — FastAPI application entrypoint
  - `app/api/endpoints/` — API route modules (documents, services, citizens, appointments, etc.)
  - `app/schemas/` — Pydantic schemas for validation and serialization
  - `app/crud/` — CRUD functions for DB models
  - `app/models/` — SQLAlchemy ORM models
  - `app/db/` — database session and base
  - `app/utils/` — helpers: auth, token, hashing, email, blob uploads

---

## Requirements

- Python 3.10+ (project uses 3.10/3.11 in compiled files)
- SUPABASE or PostgreSQL or other DB configured for SQLAlchemy (see your environment/compose files)

Install dependencies:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

---

## Configuration & environment

- Configuration is in `app/core/config.py` (environment-driven). Typical environment variables:
  - SUPABASE_URL or SQLALCHEMY_DATABASE_URI — DB connection string
  - SECRET_KEY — JWT / token signing secret
  - MAIL settings — for sending emails (if used)

Ensure the DB is reachable and migrations (if any) are applied before running the app.

---

## Run locally

Run the development server with uvicorn:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

If using Docker, build and run with provided `Dockerfile` and `entrypoint.sh`.

---

## Interactive API docs

When the app is running, FastAPI provides automatic API docs:

- Swagger UI: `http://localhost:8000/docs`

Use those to inspect schemas, try endpoints, and view request/response examples.

---

## Database access

Database sessions are injected using the dependency `get_db` from `app.db.session`. CRUD functions in `app/crud/` accept a `Session` instance.

---

## Authentication

Auth utilities live in `app/utils/` (for example `token.py`, `auth.py`). Endpoints that require authentication will typically depend on a user/token dependency — consult route docstrings or the interactive docs for required headers.

---

## API Endpoints (summary)

Below are the main API groups and representative endpoints. Use the interactive docs for full details.

### Documents

Prefix: `/api/v1/documents`

- POST `/api/v1/documents/` — Create a new document type
  - Request body: `DocumentTypeCreate` (see `app/schemas/document_types_schema.py`)
  - Response: `DocumentTypeBase`
  - Summary: Add a new document type.

- GET `/api/v1/documents/{document_id}` — Get document type by id
  - Response: `DocumentTypeBase`

- GET `/api/v1/documents/all/` — Get all document types
  - Response: `List[DocumentTypeBase]`

Example curl (create document type):

```bash
curl -X POST "http://localhost:8000/api/v1/documents/" \
  -H "Content-Type: application/json" \
  -d '{"name": "Passport", "description": "Government issued ID"}'
```

Example curl (get document by id):

```bash
curl "http://localhost:8000/api/v1/documents/1"
```


### Citizens

Prefix: `/api/v1/citizens`

- Typical operations: create, get by id, list/search, update, delete
- Schemas: `app/schemas/citizen_schema.py`


### Services

Prefix: `/api/v1/services`

- Manage service definitions, reservation services, and ratings.
- See `app/schemas/services_schema.py` and `app/crud/service_crud.py` for details.


### Appointments / Reservations

Prefix: `/api/v1/appointments`

- Create and manage bookings/reservations for services.


### Notifications

Prefix: `/api/v1/notifications`

- Create/list notifications for users.


### Blob / File Uploads

Prefix: `/api/v1/blob` (or similar)

- Upload and download blobs. Uses utilities in `app/utils/upload_blobs.py` and CRUD in `app/crud/blob_crud.py`.


### Government / Gov Nodes

Prefix: `/api/v1/gov` and `/api/v1/gov-node-services`

- Endpoints to manage government entities and node services used by GovConn.


### Auth / Users

Prefix: `/api/v1/auth` (or token endpoints)

- Login, token generation, user creation. Schemas in `app/schemas/token_schema.py` and `app/schemas/user.py`.

---

## Errors & exceptions

- The API uses FastAPI `HTTPException` for error responses. Look at route implementations to see status codes and messages.

---

## Extending the API

- Add new route modules in `app/api/endpoints/` and register them in `app/main.py` (the project likely auto-includes endpoints or imports them there).
- Add CRUD functions in `app/crud/` and Pydantic schemas in `app/schemas/`.

---

## Troubleshooting

- If DB sessions fail, confirm `DATABASE_URL` and that the DB is reachable.
- Use the interactive docs to see exact JSON shapes for requests.
- Check `app.log` for runtime logging information.

---

## Contributing

- Follow existing code style and schema patterns.
- Add unit tests for new CRUD logic and endpoints.

---

## License

This repository includes a `LICENSE` file. Check it for license details.

