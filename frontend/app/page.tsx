"use client"

import type React from "react"

import { useState } from "react"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL

type Evaluation = {
  clarity: number
  factuality: number
  helpfulness: number
  hallucination_risk: number
  tone: string
  rationale: string
}

const getRatingColor = (score: number, isRisk = false) => {
  if (isRisk) {
    // For hallucination risk, lower is better
    if (score <= 2) return "text-green-600"
    if (score <= 3) return "text-yellow-600"
    return "text-red-600"
  } else {
    // For other metrics, higher is better
    if (score >= 4) return "text-green-600"
    if (score >= 3) return "text-yellow-600"
    return "text-red-600"
  }
}

const getRatingBg = (score: number, isRisk = false) => {
  if (isRisk) {
    if (score <= 2) return "bg-green-50 border-green-200"
    if (score <= 3) return "bg-yellow-50 border-yellow-200"
    return "bg-red-50 border-red-200"
  } else {
    if (score >= 4) return "bg-green-50 border-green-200"
    if (score >= 3) return "bg-yellow-50 border-yellow-200"
    return "bg-red-50 border-red-200"
  }
}

const getProgressColor = (score: number, isRisk = false) => {
  if (isRisk) {
    if (score <= 2) return "bg-green-500"
    if (score <= 3) return "bg-yellow-500"
    return "bg-red-500"
  } else {
    if (score >= 4) return "bg-green-500"
    if (score >= 3) return "bg-yellow-500"
    return "bg-red-500"
  }
}

export default function HomePage() {
  const [prompt, setPrompt] = useState("")
  const [response, setResponse] = useState("")
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
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        })
        const data = await res.json()
        modelResponse = data.response
        setResponse(modelResponse)
      }

      // Call evaluator
      const evalRes = await fetch(`${BACKEND_URL}/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">🧠</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              PromptRx
            </h1>
          </div>
          <p className="text-slate-600 text-lg">AI Response Evaluation Tool</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur rounded-xl shadow-lg border border-white/20 p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="text-blue-600">⚙️</span>
                Input Configuration
              </h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="manual-mode"
                    checked={manualMode}
                    onChange={() => setManualMode(!manualMode)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="manual-mode" className="text-sm text-slate-700">
                    Manual response input mode
                  </label>
                </div>
                <p className="text-xs text-slate-500">
                  {manualMode
                    ? "You'll input both prompt and response manually"
                    : "GPT-4 will generate the response automatically"}
                </p>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur rounded-xl shadow-lg border border-white/20 p-6">
              <h2 className="text-xl font-semibold mb-4">User Prompt</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <textarea
                  className="w-full p-4 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200 bg-white/50"
                  rows={6}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Enter your prompt here..."
                  required
                />

                {manualMode && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Model Response</label>
                    <textarea
                      className="w-full p-4 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200 bg-white/50"
                      rows={6}
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      placeholder="Paste the model response here..."
                      required
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    "Evaluate Response"
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {/* Response Display */}
            {response && (
              <div className="bg-white/80 backdrop-blur rounded-xl shadow-lg border border-white/20 p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="text-green-600">💬</span>
                  AI Response
                </h2>
                <div className="p-4 bg-slate-50 rounded-lg border-l-4 border-green-500">
                  <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{response}</p>
                </div>
              </div>
            )}

            {/* Evaluation Results */}
            {evaluation && (
              <div className="bg-white/80 backdrop-blur rounded-xl shadow-lg border border-white/20 p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <span className="text-purple-600">✅</span>
                  Evaluation Results
                </h2>
                <div className="space-y-6">
                  {/* Rating Metrics */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { key: "clarity", label: "Clarity", icon: "🔍" },
                      { key: "factuality", label: "Factuality", icon: "✓" },
                      { key: "helpfulness", label: "Helpfulness", icon: "💡" },
                      { key: "hallucination_risk", label: "Hallucination Risk", icon: "⚠️", isRisk: true },
                    ].map(({ key, label, icon, isRisk = false }) => {
                      const score = evaluation[key as keyof Evaluation] as number
                      return (
                        <div key={key} className={`p-4 rounded-lg border-2 ${getRatingBg(score, isRisk)}`}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{icon}</span>
                              <span className="font-medium text-slate-700">{label}</span>
                            </div>
                            <span
                              className={`px-2 py-1 rounded-full text-sm font-bold bg-white/80 ${getRatingColor(score, isRisk)}`}
                            >
                              {score}/5
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(score, isRisk)}`}
                              style={{ width: `${(score / 5) * 100}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Tone */}
                  <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">🎭</span>
                      <span className="font-medium text-slate-700">Tone</span>
                    </div>
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium border border-blue-300">
                      {evaluation.tone}
                    </span>
                  </div>

                  {/* Rationale */}
                  <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">📝</span>
                      <span className="font-medium text-slate-700">Evaluation Rationale</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed">{evaluation.rationale}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="bg-white/80 backdrop-blur rounded-xl shadow-lg border border-white/20 p-6">
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">Evaluating response...</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
