import os
import uuid
import pandas as pd

from io import BytesIO, StringIO
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse

from app.services.datasest_store import save_dataset, save_classifier

router = APIRouter()

CLASSIFIER_LABELS = {
    "randomforest": "Random Forest",
    "svm": "SVM",
    "knn": "KNN",
    "decisiontree": "Decision Tree",
}


def _detect_types(df: pd.DataFrame) -> dict:
    types = {}

    for col in df.columns:
        if pd.api.types.is_numeric_dtype(df[col]):
            types[col] = "num"
        else:
            types[col] = "str"

    return types


def _prepare_json_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df = df.fillna("")

    for col in df.columns:
        if pd.api.types.is_datetime64_any_dtype(df[col]):
            df[col] = df[col].astype(str)

    return df


@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    classifier: str = Form("decisiontree"),
):
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

        else:
            df = pd.read_excel(BytesIO(content))

    except Exception as e:
        raise HTTPException(422, f"Erro ao processar arquivo: {e}")

    dataset_id = str(uuid.uuid4())
    df.attrs["filename"] = os.path.splitext(file.filename)[0]

    save_dataset(dataset_id, df)
    save_classifier(dataset_id, classifier)

    df_json = _prepare_json_dataframe(df)

    return JSONResponse({
        "dataset_id": dataset_id,
        "filename": df.attrs["filename"],
        "classifier": CLASSIFIER_LABELS.get(classifier, classifier),
        "rows": len(df),
        "columns": list(df.columns),
        "types": _detect_types(df),
        "preview": df_json.head(100).to_dict(orient="records"),
    })
