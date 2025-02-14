import os
import sys

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import (
    users_router,
    match_router,
    # solve_router,
    system_router,
    llm_router
)
from logging import getLogger, StreamHandler, INFO


is_prod = os.getenv("IS_PROD") == "True"

logger = getLogger(__name__)
handler = StreamHandler(sys.stdout)
handler.setLevel(INFO)
logger.addHandler(handler)
logger.setLevel(INFO)

app = FastAPI(
    title="Synergy Matchmaker",
    description="Synergy Matchmaker API",
    version="0.4.0",
    docs_url=None if is_prod else "/docs",
    redoc_url=None if is_prod else "/redoc",
    openapi_url=None if is_prod else "/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://sm3.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# @app.middleware("http")
# async def log_middle(request: Request, call_next):
#     # health_checkの場合はログを出力しない
#     if not (request.url.path == "/"):

#         async def receive() -> Message:
#             return {"type": "http.request", "body": body}

#         body = await request.body()
#         # ログインサイトで絞り込む時に複数行だと絞り込めないため1行にする
#         logger.info(
#             f"{request.method} {request.url.path} Headers: {dict(request.headers)}"
#         )
#         if body:
#             logger.info(
#                 f"{request.method} {request.url.path} Body: {body.decode()}")
#         request._receive = receive
#     response = await call_next(request)
#     return response


@app.get("/", include_in_schema=False)
async def health_check():
    return {"message": "Health check succeeded."}


app.include_router(users_router)
# app.include_router(solve_router)
app.include_router(match_router)
app.include_router(system_router)
app.include_router(llm_router)
