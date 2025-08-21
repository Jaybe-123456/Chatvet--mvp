// src/App.jsx (replace or update handleSend to use the serverless function)
import { useState } from "react"

export default function App() {
  const [messages, setMessages] = useState([{ from: "bot", text: "👋 ChatVet ready. Ask a question." }])
  const [input, setInput] = useState("")

  async function handleSend() {
    const q = input.trim()
    if (!q) return
    setMessages(prev => [...prev, { from: "user", text: q }])
    setInput("")

    try {
      const res = await fetch("/.netlify/functions/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: q })
      })
      const data = await res.json()
      if (data.found) {
        const reply = `${data.farmer_friendly}\n\n🔎 Source: ${data.source}\n(Confidence: ${Math.round(data.confidence * 100)}%)`
        setMessages(prev => [...prev, { from: "bot", text: reply }])
      } else {
        setMessages(prev => [...prev, { from: "bot", text: data.reply }])
      }
    } catch (err) {
      console.error(err)
      setMessages(prev => [...prev, { from: "bot", text: "Error contacting service. Try again later." }])
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-100 to-blue-100">
      <div className="w-full max-w-md bg-white rounded-xl shadow p-4">
        <div className="h-80 overflow-y-auto mb-3 space-y-2" style={{ whiteSpace: "pre-wrap" }}>
          {messages.map((m, i) => (
            <div key={i} className={`p-2 rounded ${m.from === "user" ? "bg-blue-200 text-right" : "bg-gray-200 text-left"}`}>
              {m.text}
            </div>
          ))}
        </div>
        <div className="flex">
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSend()}
            className="flex-1 border rounded-l px-3 py-2" placeholder="Ask: 'Can I use kerosene for calf diarrhea?'" />
          <button onClick={handleSend} className="bg-green-600 text-white px-4 rounded-r">Send</button>
        </div>
      </div>
    </div>
  )
          }
