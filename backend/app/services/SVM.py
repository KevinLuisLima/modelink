import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score, classification_report


def train_svm_classifier(
    dataset_id: str,
    target: str,
    kernel: str = "rbf"
):
    
    if target not in df.columns:
        raise ValueError(
            f"Coluna alvo '{target}' não encontrada."
        )

    df = df.dropna(subset=[target])

    X = df.drop(columns=[target])
    y = df[target]

    # Converte colunas categóricas
    X = pd.get_dummies(X)

    if len(X.columns) == 0:
        raise ValueError(
            "Não existem colunas válidas para treinamento."
        )

    if y.nunique() < 2:
        raise ValueError(
            "A coluna alvo precisa possuir pelo menos duas classes."
        )

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42
    )

    model = SVC(
        kernel=kernel,
        random_state=42
    )

    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)

    accuracy = accuracy_score(
        y_test,
        y_pred
    )

    report = classification_report(
        y_test,
        y_pred,
        output_dict=True
    )

    return {
        "model": "SVM",
        "kernel": kernel,
        "target": target,
        "rows_used": len(df),
        "features": list(X.columns),
        "accuracy": round(float(accuracy), 4),
        "classes": list(map(str, model.classes_)),
        "classification_report": report
    }