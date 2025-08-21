// netlify/functions/query.js
const kb = require("./data/vet_knowledge.json")

function normalize(s) {
  if (!s) return ""
  return s
    .toString()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function tokenize(s) {
  return normalize(s).split(" ").filter(t => t && t.length >= 3)
}

function score(query, itemText) {
  const q = new Set(tokenize(query))
  const t = new Set(tokenize(itemText))
  let hits = 0
  for (const tok of q) {
    if (t.has(tok)) hits += 1
  }
  // small heuristics for boost
  const qnorm = normalize(query)
  const txt = normalize(itemText)
  if (qnorm.includes("kerosene") && txt.includes("kerosene")) hits += 2
  if (qnorm.includes("rabies") && txt.includes("rabies")) hits += 1
  if (qnorm.includes("raw milk") && txt.includes("raw milk")) hits += 2
  return hits
}

function findBest(query) {
  let best = null
  let bestScore = -1
  for (const item of kb) {
    const blob = `${item.topic} ${item.misinformation} ${item.verified_answer} ${item.farmer_friendly}`
    const s = score(query, blob)
    if (s > bestScore) {
      bestScore = s
      best = item
    }
  }
  // threshold—require at least 2 token hits to trust it
  if (bestScore >= 2) return { item: best, score: bestScore }
  return { item: null, score: bestScore }
}

exports.handler = async function (event) {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) }
    }

    const body = JSON.parse(event.body || "{}")
    const text = (body.text || "").toString().trim()
    if (!text) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing 'text' in request body" }) }
    }

    // simple language hint: detect swahili keywords and label lang
    const lang = /ku|kwa|na|ni|mwezi|mbwa|ngombe|kuku/i.test(text) ? "sw" : "en"

    // do best-match
    const { item, score } = findBest(text)

    if (item) {
      const resp = {
        found: true,
        type: "myth",
        topic: item.topic,
        farmer_friendly: item.farmer_friendly,
        verified_answer: item.verified_answer,
        source: item.source,
        confidence: Math.min(1, 0.4 + 0.2 * score) // heuristic confidence
      }
      return { statusCode: 200, body: JSON.stringify(resp) }
    }

    // fallback (no myth match) => respond neutral, suggest clinical help
    const fallback = {
      found: false,
      type: "unknown",
      reply: "🤖 I’m not sure about that yet. Please consult a certified veterinarian. You can also ask: 'treatment for mastitis' or 'diagnosis calf diarrhea'.",
      confidence: 0.2
    }
    return { statusCode: 200, body: JSON.stringify(fallback) }
  } catch (err) {
    console.error("Query function error:", err)
    return { statusCode: 500, body: JSON.stringify({ error: "Internal error" }) }
  }
}
