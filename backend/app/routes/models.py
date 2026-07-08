import pandas as pd

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.supabase_store import (
    get_model_by_id,
    load_model_from_supabase
)

router = APIRouter()


class PredictRequest(BaseModel):
    values: dict


@router.get("/models/{model_id}")
async def get_model_result(model_id: str):
    model = get_model_by_id(model_id)

    if not model:
        raise HTTPException(
            status_code=404,
            detail="Modelo não encontrado"
        )

    return {
        "model_id": model.get("model_id"),
        "filename": model.get("filename"),
        "classifier": model.get("algorithm"),
        "algorithm": model.get("algorithm"),
        "target": model.get("target"),
        "accuracy": model.get("accuracy"),
        "precision": model.get("precision"),
        "recall": model.get("recall"),

        "features": model.get("original_features", []),
        "encoded_features": model.get("features", []),

        "feature_importance": model.get("feature_importance", {}),
        "confusion_matrix": model.get("confusion_matrix"),
        "class_names": model.get("class_names"),
        "tree_image": model.get("tree_image"),
        "created_at": model.get("created_at")
    }


@router.post("/models/{model_id}/predict")
async def predict_model(model_id: str, request: PredictRequest):
    model_data = get_model_by_id(model_id)

    if not model_data:
        raise HTTPException(
            status_code=404,
            detail="Modelo não encontrado"
        )

    model_path = model_data.get("model_path")

    if not model_path:
        raise HTTPException(
            status_code=400,
            detail="Caminho do modelo não encontrado"
        )

    model_package = load_model_from_supabase(model_path)

    model = model_package.get("model")
    feature_names = model_package.get("feature_names")
    original_features = model_package.get("original_features")

    if model is None:
        raise HTTPException(
            status_code=400,
            detail="Modelo inválido ou corrompido"
        )

    if not feature_names:
        raise HTTPException(
            status_code=400,
            detail="Features do modelo não encontradas"
        )

    if not original_features:
        raise HTTPException(
            status_code=400,
            detail="Colunas originais do modelo não encontradas"
        )

    input_df = pd.DataFrame([request.values])

    input_df.columns = [
        str(col).strip()
        for col in input_df.columns
    ]

    original_features = [
        str(col).strip()
        for col in original_features
    ]

    missing_columns = [
        col for col in original_features
        if col not in input_df.columns
    ]

    if missing_columns:
        raise HTTPException(
            status_code=400,
            detail=f"Campos ausentes para predição: {missing_columns}"
        )

    input_df = input_df[original_features]

    for coluna in input_df.columns:
        convertida = pd.to_numeric(
            input_df[coluna],
            errors="coerce"
        )

        if convertida.notna().all():
            input_df[coluna] = convertida

    for coluna in input_df.select_dtypes(include=["object"]).columns:
        input_df[coluna] = (
            input_df[coluna]
            .astype(str)
            .str.strip()
            .str.title()
        )

    input_df = pd.get_dummies(input_df)

    input_df = input_df.reindex(
        columns=feature_names,
        fill_value=0
    )

    print("VALORES RECEBIDOS:")
    print(request.values)

    print("COLUNAS RECEBIDAS:")
    print(list(input_df.columns))

    print("ORIGINAL FEATURES:")
    print(original_features)

    print("FEATURE NAMES DO MODELO:")
    print(feature_names)

    print("INPUT FINAL ENVIADO AO MODELO:")
    print(input_df.to_dict(orient="records"))

    try:
        prediction = model.predict(input_df)[0]

        confidence = None

        if hasattr(model, "predict_proba"):
            probabilities = model.predict_proba(input_df)
            confidence = float(probabilities.max())

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Erro ao realizar predição: {str(e)}"
        )

    return {
        "model_id": model_id,
        "prediction": str(prediction),
        "confidence": round(confidence, 4) if confidence is not None else None
    }