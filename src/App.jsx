// src/App.jsx
import { useState } from "react"
import myths from "./data/vet_knowledge.json"
import conditions from "./data/vet_conditions.json"
import { findBestAnswer, findBestCondition } from "./lib/search"

function renderCondition(c){
  if(!c) return "🤖 I’m not sure yet. Consult a certified vet for urgent issues."
  const lines = []
  lines.push(`🩺 **Diagnosis & Treatment: ${titleCase(c.condition)} (${titleCase(c.species)})**`)
  if (c.aka?.length) lines.push(`_Also known as:_ ${c.aka.join(", ")}`)
  if (c.key_signs?.length) lines.push(`**Key signs:** ${c.key_signs.join("; ")}`)
  if (c.red_flags?.length) lines.push(`**Red flags (urgent vet):** ${c.red_flags.join("; ")}`)
  if (c.field_diagnosis?.length) lines.push(`**Field diagnosis steps:**\n- ${c.field_diagnosis.join("\n- ")}`)
  if (c.recommended_tests?.length) lines.push(`**Recommended tests:** ${c.recommended_tests.join("; ")}`)
  if (c.treatment_firstline?.length) lines.push(`**First-line treatment:**\n- ${c.treatment_firstline.join("\n- ")}`)
  if (c.treatment_adjunct?.length) lines.push(`**Adjuncts:**\n- ${c.treatment_adjunct.join("\n- ")}`)
  if (c.dosing_notes?.length) lines.push(`**Dosing/notes:**\n- ${c.dosing_notes.join("\n- ")}`)
  if (c.supportive_care?.length) lines.push(`**Supportive care:** ${c.supportive_care.join("; ")}`)
  if (c.prevention?.length) lines.push(`**Prevention:** ${c.prevention.join("; ")}`)
  if (c.sources?.length) lines.push(`🔎 **Sources:** ${c.sources.join(" • ")}`)
  lines.push("\n⚠️ This information is educational. Always follow local regulations and a licensed veterinarian’s advice.")
  return lines.join("\n")
}

function titleCase(s){ return s.replace(/\b\w/g, m => m.toUpperCase()) }

export default function App(){
  const [messages, setMessages] = useState([
    { from:"bot", text:"👋 Hi! I’m ChatVet. Ask for **diagnosis** or **treatment** (e.g., “treatment for mastitis”, “diagnose calf diarrhea”), or any myth you’ve heard." }
  ])
  const [input, setInput] = useState("")

  function handleSend(){
    const q = input.trim()
    if(!q) return
    const next = [{ from:"user", text:q }]

    // 1) Try myth KB first if question looks like a remedy/claim
    const looksLikeMyth = /(use|can i|remedy|true|myth|salt|kerosene|garlic|raw milk|holy water)/i.test(q)
    const mythHit = looksLikeMyth ? findBestAnswer(q, myths) : null

    // 2) Otherwise try clinical KB
    const clinicalHit = findBestCondition(q, conditions)

    let reply
    if (mythHit){
      reply = `${mythHit.farmer_friendly}\n\n🔎 Source: ${mythHit.source}\n\n💡 Ask: “diagnosis for ${mythHit.topic}” or “treatment for ${mythHit.topic}” to see clinical guidance.`
    } else if (clinicalHit){
      reply = renderCondition(clinicalHit)
    } else {
      reply = "🤖 I’m not sure yet. Try asking: “diagnosis calf diarrhea” or “treatment mastitis” or “is kerosene safe for calves?”"
      // optionally log unknowns here
    }

    next.push({ from:"bot", text: reply })
    setMessages(prev => [...prev, ...next])
    setInput("")
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-green-100 to-blue-100 p-4">
      <div className="max-w-3xl mx-auto space-y-4">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">🐾 ChatVet • Diagnosis & Treatment</h1>
        </header>

        <div className="bg-white rounded-xl shadow p-4">
          <div className="h-96 overflow-y-auto border rounded p-3 space-y-2 bg-gray-50">
            {messages.map((m,i)=>(
              <div key={i}
                   className={`p-2 rounded ${m.from==="user"?"bg-blue-200 text-right":"bg-gray-200 text-left"}`}
                   style={{ whiteSpace:"pre-wrap" }}>
                {m.text}
              </div>
            ))}
          </div>
          <div className="flex mt-3">
            <input
              value={input}
              onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>e.key==="Enter" && handleSend()}
              className="flex-1 border rounded-l px-3 py-2"
              placeholder='Try: "diagnosis calf diarrhea", "treatment mastitis", or "is raw milk safe?"'
            />
            <button onClick={handleSend} className="bg-green-600 text-white px-4 rounded-r">Send</button>
          </div>
        </div>

        <p className="text-xs text-gray-600">
          Educational use only. Follow national guidelines and a licensed veterinarian’s directions for drugs, doses and withdrawals.
        </p>
      </div>
    </div>
  )
                                                    }
