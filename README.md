# PromptRx

PromptRx is an MVP tool for evaluating LLM responses using another LLM. Given a prompt, it:

1. Generates a response from GPT-4
2. Evaluates that response using GPT-4 on clarity, factuality, helpfulness, hallucination risk, tone, and rationale

## 🧪 How it works

* Built with FastAPI (backend) and Next.js (frontend)
* Uses OpenAI's `gpt-4` model for both generation and evaluation
* Evaluation is strict and flags vague or speculative answers

## 🖥️ Local Development

### Backend (FastAPI)

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

Access frontend at: `http://localhost:3000` Backend runs on: `http://localhost:8000`

## 🔑 Environment Variables

Create a `.env` file in the `backend` directory with:

```
OPENAI_API_KEY=your-key-here
```

(see `.env.example`)

## 🚀 Deployment

### Frontend (Vercel)

* Push to GitHub
* Import repo in vercel.com
* Set build command to `npm run build`
* Set output directory to `.next`

### Backend (Render)

* Create a new Web Service
* Connect to your GitHub repo
* Set `start command` to: `uvicorn main:app --host 0.0.0.0 --port 10000`
* Add environment variable `OPENAI_API_KEY`

## 📄 License

MIT - see `LICENSE`

## 🤝 Contributing

See `CONTRIBUTING.md`
