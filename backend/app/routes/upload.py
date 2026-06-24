import os
import pandas as pd

from io import BytesIO, StringIO
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse

from app.services.decision_tree import train_tree_and_publish_from_df
# from app.services.SVM import train_svm_and_publish_from_df
# from app.services.kmeans import train_kmeans_and_publish_from_df

router = APIRouter()

CLASSIFIER_LABELS = {
    "decisiontree": "Decision Tree",
    "svm": "SVM",
    "kmeans": "KMeans",
}

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    classifier: str = Form("decisiontree"),
    target_column: str = Form(None),
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

    if classifier not in CLASSIFIER_LABELS:
        raise HTTPException(400, "Classificador inválido")

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

    if df.empty:
        raise HTTPException(400, "O dataset está vazio")

    if not target_column:
        target_column = df.columns[-1]

    try:
        if classifier == "decisiontree":
            result = train_tree_and_publish_from_df(df, target_column)

       # elif classifier == "svm":
       #    result = train_svm_and_publish_from_df(df, target_column)

       # elif classifier == "kmeans":
       #   result = train_kmeans_and_publish_from_df(df)

        else:
            raise HTTPException(400, "Classificador inválido")

    except ValueError as e:
        raise HTTPException(400, str(e))

    return JSONResponse({
        "filename": os.path.splitext(file.filename)[0],
        "model_id": result["model_id"],
        "classifier": result["classifier"],
        "target": result.get("target"),
        "accuracy": result.get("accuracy"),
        "precision": result.get("precision"),
        "recall": result.get("recall"),
        "features": result.get("features", []),
        "confusion_matrix": result.get("confusion_matrix"),
        "class_names": result.get("class_names"),
        "tree_image": result.get("tree_image"),
    })