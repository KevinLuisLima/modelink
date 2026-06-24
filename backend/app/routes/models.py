from fastapi import APIRouter, HTTPException

from app.services.supabase_store import get_model_by_id

router = APIRouter()

@router.get("/models/{model_id}")
async def get_model_result(model_id: str):
    model = get_model_by_id(model_id)

    if not model:
        raise HTTPException(404, "Modelo não encontrado")

    return {
        "model_id": model["model_id"],
        "classifier": model["algorithm"],
        "algorithm": model["algorithm"],
        "target": model.get("target"),
        "accuracy": model.get("accuracy"),
        "precision": model.get("precision"),
        "recall": model.get("recall"),
        "features": model.get("features", []),
        "confusion_matrix": model.get("confusion_matrix"),
        "class_names": model.get("class_names"),
        "tree_image": model.get("tree_image"),
        "created_at": model.get("created_at")
    }