// src/lib/search.js

const SW_TO_EN = [
  ["kuhara", "diarrhea"],
  ["mbwa", "dog"],
  ["ng'ombe", "cow"],
  ["ngombe", "cow"],
  ["chanjo", "vaccination"],
  ["maziwa mbichi", "raw milk"],
  ["kerosene", "kerosene"],
  ["panya", "rat"],
  ["kuku", "chicken"],
  ["magonjwa", "disease"],
];

function normalize(s) {
  if (!s) return "";
  let out = s.toLowerCase().normalize("NFKD");
  // naive Swahili → English assists
  for (const [sw, en] of SW_TO_EN) {
    out = out.replaceAll(sw, en);
  }
  // strip punctuation, collapse spaces
  out = out.replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
  return out;
}

function tokenize(s) {
  return normalize(s)
    .split(" ")
    .filter(t => t && t.length >= 3);
}

// simple overlap score between query tokens and item text tokens
function score(query, itemText) {
  const q = new Set(tokenize(query));
  const t = new Set(tokenize(itemText));
  let hits = 0;
  for (const tok of q) {
    if (t.has(tok)) hits += 1;
  }
  // boost for key phrases
  const text = normalize(itemText);
  if (normalize(query).includes("kerosene salt") && text.includes("kerosene")) hits += 2;
  if (normalize(query).includes("raw milk") && text.includes("raw milk")) hits += 2;
  if (normalize(query).includes("rabies") && (text.includes("rabies") || text.includes("vaccination"))) hits += 1;
  return hits;
}

/**
 * Find best matching knowledge item for a user query.
 * @param {string} query
 * @param {Array} kb JSON array of knowledge items
 * @returns {object|null}
 */
export function findBestAnswer(query, kb) {
  if (!query || !Array.isArray(kb)) return null;
  let best = null;
  let bestScore = -1;

  for (const item of kb) {
    const searchBlob = `${item.topic} ${item.misinformation} ${item.verified_answer} ${item.farmer_friendly}`;
    const s = score(query, searchBlob);
    if (s > bestScore) {
      bestScore = s;
      best = item;
    }
  }

  // threshold: require at least 2 token hits to trust the match
  if (bestScore >= 2) return best;
  return null;
    }
