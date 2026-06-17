import base64
from io import BytesIO

import pandas as pd
import matplotlib.pyplot as plt

from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier, plot_tree, export_text
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, precision_score, recall_score, confusion_matrix
from app.services.model_store import save_model
from app.config import FRONTEND_URL

def _prepare_features(X: pd.DataFrame):
    X = X.copy()
    encoders = {}

    for col in X.columns:
        if not pd.api.types.is_numeric_dtype(X[col]):
            encoder = LabelEncoder()
            X[col] = encoder.fit_transform(X[col].astype(str))
            encoders[col] = encoder

    return X, encoders


def _encode_target(y: pd.Series):
    encoder = LabelEncoder()
    y_encoded = encoder.fit_transform(y.astype(str))
    return y_encoded, encoder


def _tree_image_base64(model, feature_names, class_names):
    plt.figure(figsize=(18, 10))

    plot_tree(
        model,
        feature_names=feature_names,
        class_names=class_names,
        filled=True,
        rounded=True,
        fontsize=8
    )

    buffer = BytesIO()
    plt.savefig(buffer, format="png", bbox_inches="tight")
    plt.close()

    buffer.seek(0)
    image_base64 = base64.b64encode(buffer.read()).decode("utf-8")

    return f"data:image/png;base64,{image_base64}"


def run_decision_tree(df: pd.DataFrame, target_column: str) -> dict:
    df_model = df.copy().dropna()

    if not target_column:
        target_column = df_model.columns[-1]

    X = df_model.drop(columns=[target_column])
    y = df_model[target_column]

    X, feature_encoders = _prepare_features(X)
    y, target_encoder = _encode_target(y)

    class_names = list(target_encoder.classes_)

    value_counts = pd.Series(y).value_counts()

    can_stratify = (
        len(value_counts) > 1
        and value_counts.min() >= 2
    )

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.3,
        random_state=42,
        stratify=y if can_stratify else None
    )

    model = DecisionTreeClassifier(
        max_depth=4,
        random_state=42
    )

    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)

    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred, average="weighted", zero_division=0)
    recall = recall_score(y_test, y_pred, average="weighted", zero_division=0)

    matrix = confusion_matrix(y_test, y_pred)

    feature_importance = [
        {
            "feature": feature,
            "importance": round(float(importance), 4)
        }
        for feature, importance in zip(X.columns, model.feature_importances_)
    ]

    feature_importance = sorted(
        feature_importance,
        key=lambda item: item["importance"],
        reverse=True
    )

    rules = export_text(
        model,
        feature_names=list(X.columns)
    )

    tree_image = _tree_image_base64(
        model,
        feature_names=list(X.columns),
        class_names=class_names
    )

    total_errors = int((y_test != y_pred).sum())

    model_package = {
        "model": model,
        "feature_columns": list(X.columns),
        "target_column": target_column,
        "target_classes": class_names,
        "feature_encoders": feature_encoders,
        "target_encoder": target_encoder,
    }

    predictor_id = save_model(model_package)

    return {
        "classifier": "Decision Tree",
        "target_column": target_column,
        "model_type": "classification",

        "metrics": {
            "accuracy": round(float(accuracy), 4),
            "precision": round(float(precision), 4),
            "recall": round(float(recall), 4)
        },

        "translated_metrics": {
            "accuracy": f"O modelo acertou {round(accuracy * 100, 2)}% dos casos.",
            "precision": f"Quando o modelo previu uma classe, ele esteve correto em {round(precision * 100, 2)}% das vezes.",
            "recall": f"De todos os casos reais de cada classe, o modelo conseguiu identificar {round(recall * 100, 2)}%."
        },

        "confusion_matrix": matrix.tolist(),
        "class_names": class_names,

        "human_confusion": {
            "total_errors": total_errors,
            "explanation": f"O modelo errou {total_errors} casos no conjunto de teste."
        },

        "feature_importance": feature_importance,

        "rules": rules,

        "tree_image": tree_image,

        "rows": {
            "total": len(df_model),
            "train": len(X_train),
            "test": len(X_test)
        },
        "predictor_id": predictor_id,
        "predictor_url": (f"{FRONTEND_URL}/predictor/{predictor_id}")
    }


def run_classifier(
    df: pd.DataFrame,
    classifier: str = "decisiontree",
    target_column: str = ""
) -> dict:
    return run_decision_tree(df, target_column)
