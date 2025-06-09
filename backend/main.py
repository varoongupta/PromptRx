
from fastapi import FastAPI, Request
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Enable CORS for frontend dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class EvalRequest(BaseModel):
    prompt: str
    response: str

@app.post("/evaluate")
async def evaluate(req: EvalRequest):
    # Mock evaluation logic
    return {
        "clarity": 4.5,
        "factuality": 3.8,
        "helpfulness": 4.2,
        "hallucination_risk": 2.0,
        "tone": "Neutral"
    }
