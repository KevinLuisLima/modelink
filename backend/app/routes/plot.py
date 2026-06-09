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


@router.get("/table/{dataset_id}")
async def get_filtered_table(
    dataset_id: str,
    search: str = Query("", description="Texto para filtrar em todas as colunas"),
    sort_by: str = Query("", description="Coluna usada para ordenação"),
    order: str = Query("asc", description="asc ou desc"),
    limit: int = Query(100, ge=1, le=1000)
):
    df = get_dataset(dataset_id).copy()

    if search:
        search_lower = search.lower()

        df = df[
            df.astype(str)
            .apply(
                lambda row: row.str.lower().str.contains(search_lower, na=False).any(),
                axis=1
            )
        ]

    if sort_by:
        if sort_by not in df.columns:
            raise HTTPException(400, f"Coluna inválida para ordenação: {sort_by}")

        ascending = order.lower() == "asc"

        df = df.sort_values(
            by=sort_by,
            ascending=ascending,
            na_position="last"
        )

    df = df.fillna("")

    for col in df.columns:
        if pd.api.types.is_datetime64_any_dtype(df[col]):
            df[col] = df[col].astype(str)

    return {
        "filename": df.attrs.get("filename", "Arquivo"),
        "rows": len(df),
        "columns": list(df.columns),
        "preview": df.head(limit).to_dict(orient="records")
    }