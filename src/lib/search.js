// src/lib/search.js
const SW_TO_EN = [
  ["kuhara", "diarrhea"], ["mbwa", "dog"], ["ng'ombe","cow"], ["ngombe","cow"],
  ["chanjo","vaccination"], ["maziwa mbichi","raw milk"], ["kuku","chicken"]
];

function normalize(s){ if(!s) return ""; let out=s.toLowerCase().normalize("NFKD");
  for(const [sw,en] of SW_TO_EN){ out = out.replaceAll(sw,en) }
  return out.replace(/[^\w\s]/g," ").replace(/\s+/g," ").trim();
}
function tokenize(s){ return normalize(s).split(" ").filter(t=>t && t.length>=3) }

function score(query, blob){
  const q = new Set(tokenize(query)), t = new Set(tokenize(blob));
  let hits = 0; for(const tok of q){ if(t.has(tok)) hits++ }
  return hits;
}

// === Existing KB (myths) ===
export function findBestAnswer(query, kb){
  if(!query || !Array.isArray(kb)) return null
  let best=null, bestScore=-1
  for(const item of kb){
    const blob = `${item.topic} ${item.misinformation} ${item.verified_answer} ${item.farmer_friendly}`
    const s = score(query, blob)
    if(s>bestScore){ bestScore=s; best=item }
  }
  return bestScore>=2 ? best : null
}

// === New: clinical KB search ===
export function findBestCondition(query, ck){
  if(!query || !Array.isArray(ck)) return null
  let best=null, bestScore=-1
  for(const c of ck){
    const blob = [
      c.species, c.condition, (c.aka||[]).join(" "),
      (c.key_signs||[]).join(" "), (c.differentials||[]).join(" "),
      (c.common_triggers||[]).join(" "), (c.prevention||[]).join(" ")
    ].join(" ")
    const s = score(query, blob)
    if(s>bestScore){ bestScore=s; best=c }
  }
  // allow slightly lower threshold because clinical terms match fewer tokens
  return bestScore>=1 ? best : null
}
