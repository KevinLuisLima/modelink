import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    precision_score,
    recall_score,
    confusion_matrix
)

from app.services.supabase_store import upload_model_to_supabase


def train_random_forest_classifier_from_df(df: pd.DataFrame, target: str):
    df = df.copy()

    if target not in df.columns:
        raise ValueError(f"Coluna alvo '{target}' não encontrada.")

    df = df.dropna(subset=[target])

    X = df.drop(columns=[target])
    y = df[target]

    if pd.api.types.is_numeric_dtype(y) and y.nunique() > 20:
        raise ValueError(
            "A coluna alvo escolhida parece ser numérica contínua. "
            "Para Random Forest de classificação, escolha uma coluna categórica."
        )

    original_features = list(X.columns)

    X = pd.get_dummies(X)
    X = X.fillna(0)

    encoded_features = list(X.columns)

    if len(X.columns) == 0:
        raise ValueError("Não existem colunas válidas para treinamento.")

    stratify_column = (
        y if y.nunique() < len(y) and y.value_counts().min() >= 2 else None
    )

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=stratify_column
    )

    model = RandomForestClassifier(
        n_estimators=100,
        random_state=42,
        max_depth=8,
        min_samples_leaf=2
    )

    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)

    accuracy = accuracy_score(y_test, y_pred)

    precision = precision_score(
        y_test,
        y_pred,
        average="weighted",
        zero_division=0
    )

    recall = recall_score(
        y_test,
        y_pred,
        average="weighted",
        zero_division=0
    )

    class_labels = sorted(y.unique())
    class_names = [str(c) for c in class_labels]

    cm = confusion_matrix(
        y_test,
        y_pred,
        labels=class_labels
    )

    report = classification_report(
        y_test,
        y_pred,
        output_dict=True,
        zero_division=0
    )

    importances = {
        col: float(score)
        for col, score in zip(
            encoded_features,
            model.feature_importances_
        )
    }

    importances = dict(
        sorted(
            importances.items(),
            key=lambda item: item[1],
            reverse=True
        )
    )

    return {
        "trained_model": model,
        "target": target,
        "accuracy": round(float(accuracy), 4),
        "precision": round(float(precision), 4),
        "recall": round(float(recall), 4),
        "features": encoded_features,
        "original_features": original_features,
        "confusion_matrix": cm.tolist(),
        "class_names": class_names,
        "feature_importance": importances,
        "classification_report": report
    }


def train_random_forest_and_publish_from_df(
    df: pd.DataFrame,
    target: str
):
    result = train_random_forest_classifier_from_df(df, target)

    upload_result = upload_model_to_supabase(
        model_package={
            "model": result["trained_model"],
            "feature_names": result["features"],
            "original_features": result["original_features"],
            "algorithm": "RandomForest"
        },
        metadata={
            "algorithm": "RandomForest",
            "target": result["target"],
            "accuracy": result["accuracy"],
            "precision": result["precision"],
            "recall": result["recall"],
            "features": result["features"],
            "original_features": result["original_features"],
            "confusion_matrix": result["confusion_matrix"],
            "class_names": result["class_names"],
            "tree_image": None,
            "feature_importance": result["feature_importance"],
            "classification_report": result["classification_report"]
        }
    )

    return {
        "model_id": upload_result["model_id"],
        "algorithm": "RandomForest",
        "classifier": "Random Forest",
        "target": result["target"],
        "accuracy": result["accuracy"],
        "precision": result["precision"],
        "recall": result["recall"],
        "features": result["original_features"],
        "encoded_features": result["features"],
        "confusion_matrix": result["confusion_matrix"],
        "class_names": result["class_names"],
        "tree_image": None,
        "feature_importance": result["feature_importance"]
    }