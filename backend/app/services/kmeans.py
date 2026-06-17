import pandas as pd
from sklearn.cluster import KMeans
from app.services.datasest_store import get_dataset

def train_kmeans(dataset_id: str, n_clusters: int = 3):
    df = get_dataset(dataset_id).copy()

    # Mantém apenas colunas numéricas
    X = df.select_dtypes(include=["number"])

    if X.empty:
        raise ValueError(
            "O dataset não possui colunas numéricas para clustering."
        )

    X = X.dropna()

    if len(X) < n_clusters:
        raise ValueError("O número de clusters é maior que a quantidade de amostras disponíveis.")

    model = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)

    clusters = model.fit_predict(X)

    result = X.copy()
    result["cluster"] = clusters

    centers = []

    for idx, center in enumerate(model.cluster_centers_):
        centers.append({"cluster": idx,"center": {
                column: float(value)
                for column, value in zip(X.columns, center)}})

    cluster_sizes = (result["cluster"].value_counts().sort_index().to_dict())

    return {
        "model": "KMeans",
        "n_clusters": n_clusters,
        "rows_used": len(X),
        "features": list(X.columns),
        "inertia": float(model.inertia_),
        "cluster_sizes": cluster_sizes,
        "centroids": centers,
        "preview": result.head(100).to_dict(orient="records")
    }
