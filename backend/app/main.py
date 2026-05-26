from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware

from app.routes import upload

app = FastAPI(title="Modelink API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router, prefix="/api")


@app.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    categorias: str = Form(""),
    instrucoes: str = Form("")
):
    return {
        "mensagem": "Arquivo recebido com sucesso",
        "arquivo": file.filename,
        "categorias": categorias,
        "instrucoes": instrucoes
    }