import { useState, useMemo } from "react"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"

export default function App() {
  const [tab, setTab] = useState("chat")
  const [lang, setLang] = useState("en")
  const [messages, setMessages] = useState([{ sender: "bot", text: "👋 Welcome to ChatVet! Ask me anything about your animals." }])
  const [input, setInput] = useState("")
  const [events, setEvents] = useState([])

  const translations = {
    welcome: { en: "👋 Welcome to ChatVet! Ask me anything about your animals.", sw: "👋 Karibu ChatVet! Uliza chochote kuhusu mifugo yako." },
    learning: { en: "🤖 I’m still learning about that. Please consult a certified vet for urgent issues.", sw: "🤖 Bado najifunza kuhusu hilo. Tafadhali wasiliana na daktari wa mifugo kwa dharura." }
  }

  const scenarios = {
    "My calf has diarrhea, can I use kerosene and salt?": { bot: "❌ Unsafe. ✅ Provide oral rehydration solution + consult a vet.", botSw: "❌ Hatari. ✅ Mpe maji safi na suluhisho la kurejesha maji mwilini.", tag: "myth:kerosene+salt" },
    "How can I prevent worms in my goats?": { bot: "🐐 Deworm regularly. 🚫 Avoid garlic/ash.", botSw: "🐐 Tumia dawa zilizoidhinishwa mara kwa mara. 🚫 Epuka vitunguu/majivu.", tag: "prevention:deworming" },
    "Quiz": { bot: "Quiz: What prevents rabies? 1️⃣ Herbal tea 2️⃣ Holy water 3️⃣ Vaccination", botSw: "Jaribu: Nini huzuia kichaa cha mbwa? 1️⃣ Mitishamba 2️⃣ Maji matakatifu 3️⃣ Chanjo", tag: "quiz:rabies" },
    "3": { bot: "🎉 Correct! Vaccination is the ONLY prevention.", botSw: "🎉 Sahihi! Chanjo ndio njia pekee.", tag: "quiz:rabies:answer" }
  }

  async function mockApiCall(input) {
    const s = scenarios[input]
    const answer = s?.[lang === "sw" ? "botSw" : "bot"] || translations.learning[lang]
    const tag = s?.tag || "unknown"
    return { answer, tag }
  }

  async function handleSend() {
    const text = input.trim()
    if (!text) return
    setMessages(prev => [...prev, { sender: "user", text }])
    setInput("")
    const res = await mockApiCall(text)
    setTimeout(() => {
      setMessages(prev => [...prev, { sender: "bot", text: res.answer }])
      if (res.tag !== "unknown") setEvents(prev => [...prev, { ts: Date.now(), type: res.tag }])
    }, 300)
  }

  const metrics = useMemo(() => {
    const counts = {}
    events.forEach(e => counts[e.type] = (counts[e.type] || 0) + 1)
    const mythCount = Object.keys(counts).filter(k => k.startsWith("myth:")).reduce((s, k) => s + counts[k], 0)
    const total = events.length || 1
    const mythRate = Math.round((mythCount / total) * 100)
    const topEntries = Object.entries(counts).map(([k, v]) => ({ label: k, count: v }))
    return { mythCount, mythRate, total: events.length, topEntries }
  }, [events])

  return (
    <div className="min-h-screen w-full bg-gray-50 p-6">
      <div className="flex justify-between mb-6">
        <h1 className="text-xl font-bold">VetConnect • ChatVet MVP</h1>
        <select value={lang} onChange={e => setLang(e.target.value)} className="border rounded px-2">
          <option value="en">English</option>
          <option value="sw">Swahili</option>
        </select>
      </div>

      <div className="flex gap-2 mb-4">
        <button onClick={() => setTab("chat")} className={`px-3 py-1 rounded ${tab === "chat" ? "bg-green-600 text-white" : "bg-white border"}`}>Chat</button>
        <button onClick={() => setTab("dashboard")} className={`px-3 py-1 rounded ${tab === "dashboard" ? "bg-green-600 text-white" : "bg-white border"}`}>Dashboard</button>
      </div>

      {tab === "chat" && (
        <div className="max-w-md mx-auto bg-white shadow rounded-2xl flex flex-col">
          <div className="bg-green-600 text-white text-center py-2 rounded-t-2xl">ChatVet Prototype</div>
          <div className="flex-1 p-4 space-y-2 overflow-y-auto" style={{ maxHeight: 400 }}>
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`px-3 py-2 rounded-xl text-sm ${m.sender === "user" ? "bg-green-500 text-white" : "bg-gray-200"}`}>{m.text}</div>
              </div>
            ))}
          </div>
          <div className="flex border-t">
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSend()} placeholder="Type..." className="flex-1 p-2" />
            <button onClick={handleSend} className="bg-green-600 text-white px-4">Send</button>
          </div>
        </div>
      )}

      {tab === "dashboard" && (
        <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="font-bold mb-2">Myths Flagged</h2>
            <p className="text-2xl">{metrics.mythCount}</p>
            <p className="text-sm">Rate: {metrics.mythRate}%</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="font-bold mb-2">Total Queries</h2>
            <p className="text-2xl">{metrics.total}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 md:col-span-2">
            <h2 className="font-bold mb-2">Top Myths</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.topEntries}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#16a34a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  )
         }
