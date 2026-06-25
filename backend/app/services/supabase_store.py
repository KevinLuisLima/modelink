import io
import pickle
import uuid
import os

from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client

BASE_DIR = Path(__file__).resolve().parents[2]
load_dotenv(BASE_DIR / ".env")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL:
    raise RuntimeError("SUPABASE_URL não encontrada")

if not SUPABASE_KEY:
    raise RuntimeError("SUPABASE_KEY não encontrada")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

MODELS_BUCKET = "models"


def upload_model_to_supabase(model_package, metadata):
    model_id = str(uuid.uuid4())

    model_bytes = io.BytesIO()
    pickle.dump(model_package, model_bytes)
    model_bytes.seek(0)

    model_path = f"{model_id}.pkl"

    supabase.storage.from_(MODELS_BUCKET).upload(
        model_path,
        model_bytes.getvalue(),
        {"content-type": "application/octet-stream"}
    )

    supabase.table("models").insert({
        "model_id": model_id,
        "algorithm": metadata.get("algorithm"),
        "target": metadata.get("target"),
        "accuracy": metadata.get("accuracy"),
        "precision": metadata.get("precision"),
        "recall": metadata.get("recall"),
        "features": metadata.get("features", []),
        "confusion_matrix": metadata.get("confusion_matrix"),
        "class_names": metadata.get("class_names"),
        "tree_image": metadata.get("tree_image"),
        "extra_data": metadata
    }).execute()

    return {
        "model_id": model_id,
        "model_path": model_path
    }


def get_model_by_id(model_id: str):
    response = (
        supabase
        .table("models")
        .select("*")
        .eq("model_id", model_id)
        .execute()
    )

    if not response.data:
        return None

    return response.data[0]