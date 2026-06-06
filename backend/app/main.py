from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.auth import router as auth_router
from app.api.routes.health import router as health_router
from app.api.routes.stats import router as stats_router
from app.api.routes.tasks import router as tasks_router
from app.core.config import get_settings

settings = get_settings()

app = FastAPI(title="Carrot & Stick API")

cors_kwargs = {
    "allow_origins": settings.parsed_cors_origins,
    "allow_credentials": True,
    "allow_methods": ["*"],
    "allow_headers": ["*"],
}

if settings.is_dev:
    cors_kwargs["allow_origin_regex"] = r"http://.*:5173"

app.add_middleware(CORSMiddleware, **cors_kwargs)

app.include_router(health_router, prefix="/api")
app.include_router(auth_router, prefix="/api")
app.include_router(stats_router, prefix="/api")
app.include_router(tasks_router, prefix="/api")


@app.get("/")
def root() -> dict[str, str]:
    return {"name": "Carrot & Stick API", "status": "ok"}
