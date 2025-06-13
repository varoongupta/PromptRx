from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import json
import openai

# Load environment variables
load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

print("Loaded OpenAI Key:", openai.api_key[:5] + "..." if openai.api_key else "Not found")

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request models
class PromptRequest(BaseModel):
    prompt: str

class EvalRequest(BaseModel):
    prompt: str
    response: str

@app.post("/api/prompt")
async def process_prompt(req: PromptRequest):
    try:
        chat_response = openai.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "user", "content": req.prompt}
            ],
            temperature=0.7,
            max_tokens=500,
        )
        content = chat_response.choices[0].message.content.strip()
        finish_reason = chat_response.choices[0].finish_reason

        if finish_reason == "length":
            content += "\n\n\u26a0\ufe0f Note: The response was truncated due to length. Try rephrasing or asking for a shorter reply."

        return {"response": content}
    except Exception as e:
        return {"error": str(e)}

@app.post("/evaluate")
async def evaluate(req: EvalRequest):
    system_prompt = """
You are an expert AI output evaluator trained to detect even subtle issues in LLM responses.

Evaluate the model's response using the following criteria, returning a strict and critical JSON scorecard:

- clarity (1-5): Is the response easy to follow?
- factuality (1-5): Are there factual inaccuracies or misleading claims?
- helpfulness (1-5): Does it directly and usefully answer the prompt?
- hallucination_risk (1-5): How likely is the response to contain invented or unsupported information? (1 = very high risk)
- tone (string): Describe the tone (e.g., formal, casual, confident, apologetic)
- rationale (string): Provide a 1-2 sentence justification for the scores, emphasizing errors or red flags.

Be highly critical, and flag any unsupported claims, vague advice, or speculative content. Respond ONLY with a valid JSON object.
"""

    user_input = f"Prompt:\n{req.prompt}\n\nModel Response:\n{req.response}"

    try:
        chat_response = openai.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_input}
            ],
            temperature=0.3
        )
        content = chat_response.choices[0].message.content.strip()
        return json.loads(content)
    except Exception as e:
        return {"error": str(e)}

@app.get("/ping")
def ping():
    return {"message": "pong"}
