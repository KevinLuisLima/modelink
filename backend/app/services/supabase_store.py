import io
import os
import json
import pickle
import uuid

from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase = create_client(
    SUPABASE_URL,
    SUPABASE_KEY
)

MODELS_BUCKET = "models"


def upload_model_to_supabase(model_package, metadata):
    model_id = str(uuid.uuid4())

    model_path = f"{model_id}.pkl"

    model_bytes = io.BytesIO()
    pickle.dump(model_package, model_bytes)
    model_bytes.seek(0)

    supabase.storage.from_(MODELS_BUCKET).upload(
        model_path,
        model_bytes.getvalue(),
        {
            "content-type": "application/octet-stream"
        }
    )

    supabase.table("models").insert({
        "model_id": model_id,
        "model_path": model_path,
        "algorithm": metadata.get("algorithm"),
        "target": metadata.get("target"),
        "accuracy": metadata.get("accuracy"),
        "precision": metadata.get("precision"),
        "recall": metadata.get("recall"),
        "features": metadata.get("features"),
        "original_features": metadata.get("original_features"),
        "feature_importance": metadata.get("feature_importance"),
        "confusion_matrix": metadata.get("confusion_matrix"),
        "class_names": metadata.get("class_names"),
        "tree_image": metadata.get("tree_image")
    }).execute()

    return {
        "model_id": model_id,
        "model_path": model_path
    }


def get_model_by_id(model_id):
    response = (
        supabase
        .table("models")
        .select("*")
        .eq("model_id", model_id)
        .single()
        .execute()
    )

    return response.data


def load_model_from_supabase(model_path):
    response = (
        supabase
        .storage
        .from_(MODELS_BUCKET)
        .download(model_path)
    )

    model_package = pickle.loads(response)

    return model_package


def delete_model(model_id):
    model = get_model_by_id(model_id)

    if model is None:
        return

    supabase.storage.from_(MODELS_BUCKET).remove(
        [model["model_path"]]
    )

    supabase.table("models") \
        .delete() \
        .eq("model_id", model_id) \
        .execute()