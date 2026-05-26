import uuid
import pandas as pd
import os
from io import BytesIO, StringIO
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse

router = APIRouter()

_datasets: dict[str, pd.DataFrame] = {}


def _detect_types(df: pd.DataFrame) -> dict:
    types = {}
    for col in df.columns:
        if pd.api.types.is_numeric_dtype(df[col]):
            types[col] = "num"
        else:
            types[col] = "str"
    return types


@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    filename = file.filename.lower()

    if not (
        filename.endswith(".csv")
        or filename.endswith(".xlsx")
        or filename.endswith(".xls")
        or filename.endswith(".tsv")
    ):
        raise HTTPException(
            400,
            "Apenas arquivos .csv, .xlsx, .xls ou .tsv são aceitos"
        )

    content = await file.read()

    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(413, "Arquivo excede o limite de 10 MB")

    try:
        if filename.endswith(".csv"):
            df = pd.read_csv(StringIO(content.decode("utf-8")))

        elif filename.endswith(".tsv"):
            df = pd.read_csv(StringIO(content.decode("utf-8")), sep="\t")

        elif filename.endswith(".xlsx") or filename.endswith(".xls"):
            df = pd.read_excel(BytesIO(content))

    except Exception as e:
        raise HTTPException(422, f"Erro ao processar arquivo: {e}")

    dataset_id = str(uuid.uuid4())
    _datasets[dataset_id] = df
    df.attrs["filename"] = os.path.splitext(file.filename)[0]

    df = df.fillna("")

    for col in df.columns:
        if pd.api.types.is_datetime64_any_dtype(df[col]):
            df[col] = df[col].astype(str)

    preview = df.head(100).to_dict(orient="records")

    return JSONResponse({
        "dataset_id": dataset_id,
        "filename": file.filename,
        "rows": len(df),
        "columns": list(df.columns),
        "types": _detect_types(df),
        "preview": preview,
    })

@router.get("/dataset/{dataset_id}")
async def get_dataset_preview(dataset_id: str):

    df = get_dataset(dataset_id)

    df = df.fillna("")

    for col in df.columns:
        if pd.api.types.is_datetime64_any_dtype(df[col]):
            df[col] = df[col].astype(str)

    return {
        "filename": df.attrs.get("filename", "Arquivo"),
        "columns": list(df.columns),
        "preview": df.head(100).to_dict(orient="records")
    }

def get_dataset(dataset_id: str) -> pd.DataFrame:
    df = _datasets.get(dataset_id)

    if df is None:
        raise HTTPException(404, "Dataset não encontrado, faça o upload novamente")

    return df