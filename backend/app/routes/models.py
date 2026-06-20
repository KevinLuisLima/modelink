from fastapi import APIRouter, HTTPException, Query

from app.services.decision_tree import train_tree_and_publish
router = APIRouter()

@router.post("/models/tree/{dataset_id}")
async def publish_tree_model(
    dataset_id: str,
    target: str = Query(...)
):
    try:
        return train_tree_and_publish(dataset_id,target)

    except ValueError as e:
        raise HTTPException(status_code=400,detail=str(e))