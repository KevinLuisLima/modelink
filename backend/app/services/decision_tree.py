import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score, classification_report
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

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42
    )

    model = DecisionTreeClassifier(
        random_state=42,
        max_depth=5
    )

    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)

    accuracy = accuracy_score(y_test, y_pred)

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
            "accuracy": float(accuracy),
            "features": list(X.columns),
            "feature_importance": importances
        }
    )

    return {
        "model_id": upload_result["model_id"],
        "algorithm": "DecisionTree",
        "accuracy": round(float(accuracy), 4),
        "target": target,
        "features": list(X.columns)
    }