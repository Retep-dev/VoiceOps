from fastapi import APIRouter, HTTPException
from models.eval import EvalSuiteResult
from services.eval_service import eval_service

router = APIRouter()


@router.post("/run", response_model=EvalSuiteResult)
async def run_evaluation_benchmark():
    """Run automated evaluation suite measuring ASR WER, RAG Faithfulness, Agent Routing & Latency."""
    try:
        return await eval_service.run_benchmark()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Evaluation benchmark execution failed: {str(e)}")


@router.get("/latest", response_model=EvalSuiteResult)
async def get_latest_evaluation():
    """Fetches the latest evaluation benchmark results."""
    if not eval_service.latest_result:
        # Run default initial benchmark if none exists yet
        return await eval_service.run_benchmark()
    return eval_service.latest_result
