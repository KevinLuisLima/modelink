import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score, classification_report

from app.services.datasest_store import get_dataset


def train_tree_classifier(dataset_id: str, target: str):
    df = get_dataset(dataset_id).copy()

    if target not in df.columns:
        raise ValueError(
            f"Coluna alvo '{target}' não encontrada."
        )

    df = df.dropna(subset=[target])

    X = df.drop(columns=[target])
    y = df[target]

    X = pd.get_dummies(X)

    if len(X.columns) == 0:
        raise ValueError(
            "Não existem colunas válidas para treinamento."
        )

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

    report = classification_report(
        y_test,
        y_pred,
        output_dict=True
    )

    importances = {
        col: float(score)
        for col, score in zip(
            X.columns,
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
        "model": "DecisionTreeClassifier",
        "target": target,
        "rows_used": len(df),
        "features": list(X.columns),
        "accuracy": round(float(accuracy), 4),
        "feature_importance": importances,
        "classification_report": report
    }