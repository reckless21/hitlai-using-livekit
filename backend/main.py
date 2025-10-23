from fastapi import FastAPI
from routers import help_requests, supervisor
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(help_requests.router, prefix="/api")
app.include_router(supervisor.router, prefix="/api")
