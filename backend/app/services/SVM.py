import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score, precision_score, recall_score, confusion_matrix
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

from app.services.supabase_store import upload_model_to_supabase


def train_svm_and_publish_from_df(df: pd.DataFrame, target: str):
    df = df.copy()

    if target not in df.columns:
        raise ValueError(f"Coluna alvo '{target}' não encontrada.")

    df = df.dropna(subset=[target])

    X = df.drop(columns=[target])
    y = df[target]

    if pd.api.types.is_numeric_dtype(y) and y.nunique() > 20:
        raise ValueError(
            "A coluna alvo escolhida parece ser numérica contínua. "
            "Para SVM de classificação, escolha uma coluna categórica."
        )

    original_features = list(X.columns)
    X = pd.get_dummies(X)
    encoded_features = list(X.columns)
    X = X.fillna(0)

    if len(X.columns) == 0:
        raise ValueError("Não existem colunas válidas para treinamento.")

    stratify_column = y if y.nunique() < len(y) and y.value_counts().min() >= 2 else None

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=stratify_column
    )

    model = Pipeline([
        ("scaler", StandardScaler()),
        ("svm", SVC(
            kernel="rbf",
            probability=True,
            random_state=42
        ))
    ])

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

    class_names = [str(c) for c in sorted(y.unique())]

    matrix = confusion_matrix(
        y_test,
        y_pred,
        labels=sorted(y.unique())
    ).tolist()

    upload_result = upload_model_to_supabase(
        model_package={
            "model": model,
            "feature_names": encoded_features,
            "original_features": original_features,
            "algorithm": "SVM"
        },
        metadata={
            "algorithm": "SVM",
            "target": target,
            "accuracy": round(float(accuracy), 4),
            "precision": round(float(precision), 4),
            "recall": round(float(recall), 4),
            "features": encoded_features,
            "original_features": original_features,
            "confusion_matrix": matrix,
            "class_names": class_names,
            "tree_image": None,
            "feature_importance": None
        }
    )

    return {
        "model_id": upload_result["model_id"],
        "algorithm": "SVM",
        "classifier": "SVM",
        "target": target,
        "accuracy": round(float(accuracy), 4),
        "precision": round(float(precision), 4),
        "recall": round(float(recall), 4),
        "features": original_features,
        "encoded_features": encoded_features,
        "confusion_matrix": matrix,
        "class_names": class_names,
        "tree_image": None
    }