from fastapi import APIRouter, HTTPException

from app.services.supabase_store import get_model_by_id

router = APIRouter()


@router.get("/models/{model_id}")
async def get_model(model_id: str):
    model = get_model_by_id(model_id)

    if model is None:
        raise HTTPException(
            status_code=404,
            detail="Modelo não encontrado"
        )

    return {
        "model_id": model.get("model_id"),
        "classifier": model.get("algorithm"),
        "algorithm": model.get("algorithm"),
        "target": model.get("target"),

        "accuracy": model.get("accuracy"),
        "precision": model.get("precision"),
        "recall": model.get("recall"),

        "features": model.get("features", []),

        "feature_importance": model.get(
            "feature_importance",
            {}
        ),

        "confusion_matrix": model.get(
            "confusion_matrix"
        ),

        "class_names": model.get(
            "class_names"
        ),

        "tree_image": model.get(
            "tree_image"
        ),

        "created_at": model.get(
            "created_at"
        )
    }