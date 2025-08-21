import { useState } from "react"

function App() {
  const [messages, setMessages] = useState([
    { from: "bot", text: "👋 Hi! I’m ChatVet. Ask me about animal health." },
  ])
  const [input, setInput] = useState("")

  const handleSend = () => {
    if (!input.trim()) return
    const userMsg = { from: "user", text: input }
    const botMsg = { from: "bot", text: getBotResponse(input) }
    setMessages([...messages, userMsg, botMsg])
    setInput("")
  }

  const getBotResponse = (q) => {
    q = q.toLowerCase()
    if (q.includes("diarrhea") && q.includes("kerosene"))
      return "❌ That is unsafe. ✅ Use oral rehydration solution and consult a vet."
    if (q.includes("worms"))
      return "🐐 Deworm goats regularly with approved veterinary drugs."
    if (q.includes("rabies"))
      return "💉 Vaccination is the ONLY way to prevent rabies."
    return "🤖 I don’t know that yet, but I’m learning every day!"
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-r from-green-100 to-blue-100">
      <h1 className="text-3xl font-bold mb-4">🐾 ChatVet MVP</h1>
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-4 space-y-2">
        <div className="h-80 overflow-y-auto border rounded p-2">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`p-2 my-1 rounded ${
                m.from === "user"
                  ? "bg-blue-200 text-right"
                  : "bg-gray-200 text-left"
              }`}
            >
              {m.text}
            </div>
          ))}
        </div>
        <div className="flex mt-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 border rounded-l px-2"
            placeholder="Ask a vet question..."
          />
          <button
            onClick={handleSend}
            className="bg-blue-500 text-white px-4 rounded-r"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
