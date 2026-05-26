import pandas as pd

from fastapi import APIRouter, HTTPException, Query

from app.services.datasest_store import get_dataset

router = APIRouter()

@router.get("/plot/columns/{dataset_id}")
async def get_columns_for_plot(dataset_id: str):
    df = get_dataset(dataset_id)

    return {
        "columns": list(df.columns),
        "numeric_columns": [
            col for col in df.columns
            if pd.api.types.is_numeric_dtype(df[col])
        ],
        "categorical_columns": [
            col for col in df.columns
            if not pd.api.types.is_numeric_dtype(df[col])
        ],
    }


@router.get("/plot/bar/{dataset_id}")
async def bar_plot_data(
    dataset_id: str,
    x: str = Query(...),
    y: str = Query(...)
):
    df = get_dataset(dataset_id)

    if x not in df.columns:
        raise HTTPException(400, f"Coluna X inválida: {x}")

    if y not in df.columns:
        raise HTTPException(400, f"Coluna Y inválida: {y}")

    if not pd.api.types.is_numeric_dtype(df[y]):
        raise HTTPException(400, "A coluna Y precisa ser numérica")

    grouped = (
        df.groupby(x)[y]
        .sum()
        .reset_index()
        .fillna("")
    )

    return {
        "type": "bar",
        "x": x,
        "y": y,
        "data": grouped.to_dict(orient="records")
    }


@router.get("/plot/pie/{dataset_id}")
async def pie_plot_data(
    dataset_id: str,
    column: str = Query(...)
):
    df = get_dataset(dataset_id)

    if column not in df.columns:
        raise HTTPException(400, f"Coluna inválida: {column}")

    counts = (
        df[column]
        .fillna("Vazio")
        .value_counts()
        .reset_index()
    )

    counts.columns = [column, "quantidade"]

    return {
        "type": "pie",
        "column": column,
        "data": counts.to_dict(orient="records")
    }