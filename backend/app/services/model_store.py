import pickle
import sqlite3
import uuid
from pathlib import Path
from datetime import datetime

MODELS_DIR = Path("storage/models")
DB_PATH = Path("storage/models.db")

MODELS_DIR.mkdir(parents=True, exist_ok=True)
DB_PATH.parent.mkdir(parents=True, exist_ok=True)


def init_db():
    conn = sqlite3.connect(DB_PATH)

    conn.execute("""
        CREATE TABLE IF NOT EXISTS models (
            model_id TEXT PRIMARY KEY,
            algorithm TEXT NOT NULL,
            target TEXT,
            accuracy REAL,
            model_path TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)

    conn.commit()
    conn.close()


init_db()


def save_model(
    model,
    algorithm: str,
    target: str = None,
    accuracy: float = None
):
    model_id = str(uuid.uuid4())

    model_path = MODELS_DIR / f"{model_id}.pkl"

    with open(model_path, "wb") as f:
        pickle.dump(model, f)

    conn = sqlite3.connect(DB_PATH)

    conn.execute("""
        INSERT INTO models (
            model_id,
            algorithm,
            target,
            accuracy,
            model_path,
            created_at
        )
        VALUES (?, ?, ?, ?, ?, ?)
    """, (
        model_id,
        algorithm,
        target,
        accuracy,
        str(model_path),
        datetime.utcnow().isoformat()
    ))

    conn.commit()
    conn.close()

    return model_id


def load_model(model_id: str):
    conn = sqlite3.connect(DB_PATH)

    row = conn.execute("""
        SELECT model_path
        FROM models
        WHERE model_id = ?
    """, (model_id,)).fetchone()

    conn.close()

    if row is None:
        raise ValueError("Modelo não encontrado.")

    model_path = row[0]

    with open(model_path, "rb") as f:
        return pickle.load(f)


def get_model_metadata(model_id: str):
    conn = sqlite3.connect(DB_PATH)

    row = conn.execute("""
        SELECT
            model_id,
            algorithm,
            target,
            accuracy,
            created_at
        FROM models
        WHERE model_id = ?
    """, (model_id,)).fetchone()

    conn.close()

    if row is None:
        raise ValueError("Modelo não encontrado.")

    return {
        "model_id": row[0],
        "algorithm": row[1],
        "target": row[2],
        "accuracy": row[3],
        "created_at": row[4]
    }