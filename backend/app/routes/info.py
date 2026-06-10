from fastapi import APIRouter
from app.services.datasest_store import get_dataset, get_classifier

router = APIRouter()

CLASSIFIER_LABELS = {
    "randomforest": "Random Forest",
    "svm": "SVM",
    "knn": "KNN",
    "decisiontree": "Decision Tree",
}


@router.get("/info/{dataset_id}")
async def get_info(dataset_id: str):
    df = get_dataset(dataset_id)
    classifier_raw = get_classifier(dataset_id)
    classifier_label = CLASSIFIER_LABELS.get(classifier_raw, classifier_raw)

    return {
        "dataset_id": dataset_id,
        "filename": df.attrs.get("filename", "Arquivo"),
        "rows": len(df),
        "columns": len(df.columns),
        "classifier": classifier_label,
        "status": "Processado",
        "task_type": "Classificação supervisionada",
        "input_format": "CSV / Planilha",
        "platform": "Modelink",
    }
