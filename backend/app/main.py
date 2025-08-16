from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from app.db.base import Base
from app.db.session import engine
from app.api.endpoints import appointments, citizen, gov, blob, services, gov_node_services, service_rating, document, notifications, analytics
from app.models import (
    services_model,
    citizen_model,
    registration_model,
    gov_model,
    notification_model,
    reservation_services_model,
    gov_node_services_model,
    service_ratings_model,
    document_types_model,
)
from typing import Dict
from collections import defaultdict
import time
import asyncio

app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:8080",
    "http://localhost:3000",
    "http://localhost:8000",
    "https://govportal.vercel.app",
    "https://govconn-frontend-app.ambitioustree-9332536f.eastasia.azurecontainerapps.io",
    "https://govconn-frontend-app.ambitioustree-9332536f.eastasia.azurecontainerapps.io/",
    "https://govconn-portal.ambitioustree-9332536f.eastasia.azurecontainerapps.io"
]

class SecurityCustomHeaderCheckMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Exclude FastAPI docs and OpenAPI schema paths
        excluded_paths = ["/docs", "/redoc", "/openapi.json"]
        if request.url.path in excluded_paths:
            return await call_next(request)

        # Check if the "Secret-token" header exists and is valid
        if request.headers.get("Secret-token") == "tech25":
            return await call_next(request)
        else:
            return Response(content="Invalid or missing security token", status_code=401)

class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, rate_limit: float = 1.0, exclude_paths=None):
        """
        Custom Rate Limiting Middleware.

        :param app: FastAPI app instance.
        :param rate_limit: Time interval in seconds for rate limiting (default: 1 second).
        :param exclude_paths: List of paths to exclude from rate limiting.
        """
        super().__init__(app)
        self.rate_limit_records: Dict[str, float] = defaultdict(float)
        self.rate_limit = rate_limit
        self.exclude_paths = exclude_paths or ["/docs", "/redoc", "/openapi.json"]
        self.lock = asyncio.Lock()

    async def log_message(self, message: str):
        """Log messages (customize as needed)."""
        print(message)

    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host
        path = request.url.path

        # Skip rate limiting for excluded paths
        if path in self.exclude_paths:
            return await call_next(request)

        current_time = time.time()

        # Enforce rate limiting
        async with self.lock:  # Prevent race conditions in `rate_limit_records`
            last_request_time = self.rate_limit_records.get(client_ip, 0)
            if current_time - last_request_time < self.rate_limit:
                await self.log_message(f"Rate limit exceeded for {client_ip} at {path}")
                return Response(content="Rate limit exceeded", status_code=429)

            self.rate_limit_records[client_ip] = current_time

        await self.log_message(f"Request to {path} from {client_ip}")

        # Process request
        start_time = time.time()
        response = await call_next(request)
        process_time = time.time() - start_time

        # Add custom header to response
        response.headers["X-Process-Time"] = f"{process_time:.4f} seconds"

        await self.log_message(f"Processed request to {path} from {client_ip} in {process_time:.4f} seconds")

        return response

# app.add_middleware(SecurityCustomHeaderCheckMiddleware)

# app.add_middleware(
#     RateLimitMiddleware,
#     rate_limit=0.1,
#     exclude_paths=["/docs", "/redoc", "/openapi.json"]
# )

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(citizen.router)
app.include_router(gov.router)
app.include_router(blob.router)
app.include_router(services.router)
app.include_router(appointments.router)
app.include_router(service_rating.router)
app.include_router(gov_node_services.router)
app.include_router(document.router)
app.include_router(notifications.router)
app.include_router(analytics.router)

# health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.get("/")
async def read_root():
    return "Welcome to the GovConn API"
