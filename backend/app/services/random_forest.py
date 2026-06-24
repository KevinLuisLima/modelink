import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (accuracy_score,classification_report,precision_score,recall_score,confusion_matrix)
from app.services.supabase_store import upload_model_to_supabase

def train_random_forest_classifier_from_df(df: pd.DataFrame,target: str):
    if target not in df.columns:
        raise ValueError(f"Coluna alvo '{target}' não encontrada.")

    df = df.dropna(subset=[target])
    X = df.drop(columns=[target])
    y = df[target]
    X = pd.get_dummies(X)

    if len(X.columns) == 0:
        raise ValueError("Não existem colunas válidas para treinamento.")

    X_train, X_test, y_train, y_test = train_test_split(X,y,test_size=0.2, random_state=42)

    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred, average="weighted", zero_division=0)
    recall = recall_score(y_test, y_pred, average="weighted", zero_division=0)
    cm = confusion_matrix(y_test, y_pred)

    report = classification_report(y_test, y_pred, output_dict=True)
    importances = {
        col: float(score)
        for col, score in zip(X.columns, model.feature_importances_)
    }

    importances = dict(sorted(importances.items(), key=lambda item: item[1], reverse=True))

    return {
        "trained_model": model,
        "target": target,
        "accuracy": round(float(accuracy), 4),
        "precision": round(float(precision), 4),
        "recall": round(float(recall), 4),
        "features": list(X.columns),
        "confusion_matrix": cm.tolist(),
        "class_names": [
            str(c)
            for c in sorted(y.unique())
        ],

        "feature_importance": importances,
        "classification_report": report
    }


def train_random_forest_and_publish_from_df(df: pd.DataFrame, target: str):
    result = train_random_forest_classifier_from_df(df, target)

    upload_result = upload_model_to_supabase(
        model_package={
            "model": result["trained_model"],
            "feature_names": result["features"]
        },
        metadata={
            "algorithm": "RandomForest",

            "target": result["target"],
            "accuracy": result["accuracy"],
            "precision": result["precision"],
            "recall": result["recall"],
            "features": result["features"],

            "confusion_matrix":
                result["confusion_matrix"],

            "class_names":
                result["class_names"],
            "tree_image": None,
            "feature_importance":
                result["feature_importance"],
            "classification_report":
                result["classification_report"]
        }
    )

    return {
        "model_id": upload_result["model_id"],
        "classifier": "Random Forest",
        "target": result["target"],
        "accuracy": result["accuracy"],
        "precision": result["precision"],
        "recall": result["recall"],
        "features": result["features"],

        "confusion_matrix":
            result["confusion_matrix"],

        "class_names":
            result["class_names"],

        "tree_image": None
    }