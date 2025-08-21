// src/App.jsx
import { useState, useEffect } from "react"
import kb from "./data/vet_knowledge.json"
import { findBestAnswer } from "./lib/search"

function App() {
  const [messages, setMessages] = useState([
    { from: "bot", text: "👋 Hi! I’m ChatVet. Ask me about animal health (English or simple Swahili supported)." }
  ])
  const [input, setInput] = useState("")
  const [showSource, setShowSource] = useState(true)

  useEffect(() => {
    // ensure localStorage bucket exists
    if (!localStorage.getItem("chatvet_unknown")) {
      localStorage.setItem("chatvet_unknown", JSON.stringify([]))
    }
  }, [])

  function logUnknown(q) {
    try {
      const arr = JSON.parse(localStorage.getItem("chatvet_unknown") || "[]")
      arr.push({ q, ts: Date.now() })
      localStorage.setItem("chatvet_unknown", JSON.stringify(arr))
    } catch {}
  }

  function formatReply(item) {
    if (!item) return "🤖 I’m not sure yet. I’m learning. Please consult a certified vet for urgent issues."
    const base = `${item.farmer_friendly}`
    return showSource ? `${base}\n🔎 Source: ${item.source}` : base
  }

  function handleSend() {
    const q = input.trim()
    if (!q) return

    const userMsg = { from: "user", text: q }
    const match = findBestAnswer(q, kb)
    const botMsg = { from: "bot", text: formatReply(match) }

    if (!match) logUnknown(q)

    setMessages(prev => [...prev, userMsg, botMsg])
    setInput("")
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-green-100 to-blue-100 p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">🐾 ChatVet • VetConnect MIL</h1>
          <label className="text-sm flex items-center gap-2">
            <input
              type="checkbox"
              checked={showSource}
              onChange={e => setShowSource(e.target.checked)}
            />
            Show sources
          </label>
        </header>

        <div className="bg-white rounded-xl shadow p-4">
          <div className="h-96 overflow-y-auto border rounded p-3 space-y-2 bg-gray-50">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`p-2 rounded ${m.from === "user" ? "bg-blue-200 text-right" : "bg-gray-200 text-left"}`}
                style={{ whiteSpace: "pre-wrap" }}
              >
                {m.text}
              </div>
            ))}
          </div>

          <div className="flex mt-3">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSend()}
              className="flex-1 border rounded-l px-3 py-2"
              placeholder="Ask: 'Can I use kerosene for calf diarrhea?' or 'How to prevent worms in goats?'"
            />
            <button
              onClick={handleSend}
              className="bg-green-600 text-white px-4 rounded-r"
            >
              Send
            </button>
          </div>
        </div>

        <div className="text-xs text-gray-600">
          <p>Tip: Try asking about <em>kerosene for calf diarrhea</em>, <em>raw milk safety</em>, <em>rabies vaccination</em>, or <em>garlic for worms</em>.</p>
        </div>
      </div>
    </div>
  )
}

export default App
