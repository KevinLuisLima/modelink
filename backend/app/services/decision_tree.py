import base64
import io
import pandas as pd
import matplotlib.pyplot as plt

from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier, plot_tree
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    confusion_matrix
)

from app.services.supabase_store import upload_model_to_supabase


def train_tree_and_publish_from_df(df: pd.DataFrame, target: str):
    df = df.copy()

    if target not in df.columns:
        raise ValueError(f"Coluna alvo '{target}' não encontrada.")

    df = df.dropna(subset=[target])

    X = df.drop(columns=[target])
    y = df[target]

    X = pd.get_dummies(X)

    if len(X.columns) == 0:
        raise ValueError("Não existem colunas válidas para treinamento.")

    if pd.api.types.is_numeric_dtype(y) and y.nunique() > 20:
        raise ValueError(
        "A coluna alvo escolhida parece ser numérica contínua. "
        "Para classificação, escolha uma coluna categórica, como: classe, status, tipo, categoria, ou 'sim/não'."
    )

    stratify_column = y if y.nunique() < len(y) and y.value_counts().min() >= 2 else None

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=stratify_column
    )

    model = DecisionTreeClassifier(
        random_state=42,
        max_depth=5
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

    class_names = [str(c) for c in model.classes_]

    matrix = confusion_matrix(
        y_test,
        y_pred,
        labels=model.classes_
    ).tolist()

    plt.figure(figsize=(22, 10))

    plot_tree(
        model,
        feature_names=list(X.columns),
        class_names=class_names,
        filled=True,
        rounded=True,
        fontsize=8
    )

    buffer = io.BytesIO()
    plt.savefig(buffer, format="png", bbox_inches="tight")
    plt.close()

    buffer.seek(0)

    tree_image = "data:image/png;base64," + base64.b64encode(
        buffer.read()
    ).decode("utf-8")

    importances = {
        col: float(score)
        for col, score in zip(X.columns, model.feature_importances_)
    }

    upload_result = upload_model_to_supabase(
        model_package={
            "model": model,
            "feature_names": list(X.columns),
            "algorithm": "DecisionTree"
        },
        metadata={
            "algorithm": "DecisionTree",
            "target": target,
            "accuracy": round(float(accuracy), 4),
            "precision": round(float(precision), 4),
            "recall": round(float(recall), 4),
            "features": list(X.columns),
            "confusion_matrix": matrix,
            "class_names": class_names,
            "tree_image": tree_image,
            "feature_importance": importances
        }
    )

    return {
        "model_id": upload_result["model_id"],
        "algorithm": "DecisionTree",
        "classifier": "Decision Tree",
        "target": target,
        "accuracy": round(float(accuracy), 4),
        "precision": round(float(precision), 4),
        "recall": round(float(recall), 4),
        "features": list(X.columns),
        "confusion_matrix": matrix,
        "class_names": class_names,
        "tree_image": tree_image
    }