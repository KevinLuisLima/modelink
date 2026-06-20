import io
import pickle
import uuid
import json
import os
from pathlib import Path
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase = create_client(
    SUPABASE_URL,
    SUPABASE_KEY
)
MODELS_BUCKET = "models"

def upload_model_to_supabase(model_package,metadata):
    model_id = str(uuid.uuid4())

    model_bytes = io.BytesIO()
    pickle.dump(model_package,model_bytes)
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
        "features": json.dumps(metadata.get("features", [])),
        "extra_data": json.dumps(metadata)
    }).execute()

    return {
        "model_id": model_id,
        "model_path": model_path
    }