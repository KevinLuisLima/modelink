import os
import joblib
import uuid

MODEL_DIR = "saved_models"

os.makedirs(MODEL_DIR, exist_ok=True)


def save_model(model_package: dict) -> str:
    predictor_id = str(uuid.uuid4())
    path = os.path.join(MODEL_DIR, f"{predictor_id}.joblib")

    joblib.dump(model_package, path)

    return predictor_id


def load_model(predictor_id: str) -> dict:
    path = os.path.join(MODEL_DIR, f"{predictor_id}.joblib")

    if not os.path.exists(path):
        raise FileNotFoundError("Modelo não encontrado")

    return joblib.load(path)