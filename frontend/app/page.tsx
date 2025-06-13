'use client'

import { useState } from 'react'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL

type Evaluation = {
  clarity: number
  factuality: number
  helpfulness: number
  hallucination_risk: number
  tone: string
  rationale: string
}

export default function HomePage() {
  const [prompt, setPrompt] = useState('')
  const [response, setResponse] = useState('')
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null)
  const [loading, setLoading] = useState(false)
  const [manualMode, setManualMode] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setEvaluation(null)

    try {
      let modelResponse = response

      // Only call backend for response if not in manual mode
      if (!manualMode) {
        const res = await fetch(`${BACKEND_URL}/api/prompt`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt }),
        })
        const data = await res.json()
        modelResponse = data.response
        setResponse(modelResponse)
      }

      // Call evaluator
      const evalRes = await fetch(`${BACKEND_URL}/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, response: modelResponse }),
      })
      const evalData = await evalRes.json()
      setEvaluation(evalData)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">PromptRx</h1>

      <label className="block mb-2">
        <input
          type="checkbox"
          checked={manualMode}
          onChange={() => setManualMode(!manualMode)}
          className="mr-2"
        />
        Manually input model response (when not selected, GPT-4 will be used for model response)
      </label>

      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          className="w-full p-2 border rounded h-28"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter a prompt..."
        />

        {manualMode && (
          <textarea
            className="w-full p-2 border rounded h-28"
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Paste the model response here..."
          />
        )}

        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded"
          disabled={loading}
        >
          {loading ? "Processing..." : "Submit"}
        </button>
      </form>

      {response && !manualMode && (
        <div className="mt-6 p-4 border rounded bg-gray-100">
          <p><strong>Response:</strong> {response}</p>
        </div>
      )}

      {evaluation && (
        <div className="mt-6 p-4 border rounded bg-green-100">
          <h2 className="font-semibold mb-2">Evaluation:</h2>
          <ul className="list-disc ml-5 space-y-1">
            <li><strong>Clarity:</strong> {evaluation.clarity} / 5</li>
            <li><strong>Factuality:</strong> {evaluation.factuality} / 5</li>
            <li><strong>Helpfulness:</strong> {evaluation.helpfulness} / 5</li>
            <li><strong>Hallucination Risk:</strong> {evaluation.hallucination_risk} / 5</li>
            <li><strong>Tone:</strong> {evaluation.tone}</li>
            <li><strong>Rationale:</strong> {evaluation.rationale}</li>
          </ul>
        </div>
      )}
    </main>
  )
}
