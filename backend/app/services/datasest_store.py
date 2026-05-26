import pandas as pd
from fastapi import HTTPException

_datasets: dict[str, pd.DataFrame] = {}


def save_dataset(dataset_id: str, df: pd.DataFrame):
    _datasets[dataset_id] = df


def get_dataset(dataset_id: str) -> pd.DataFrame:
    df = _datasets.get(dataset_id)

    if df is None:
        raise HTTPException(404, "Dataset não encontrado, faça o upload novamente")

    return df