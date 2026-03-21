"use client";
import { useState, useEffect, useRef, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════════════════════
// VOICE ENGINE
// ═══════════════════════════════════════════════════════════════════════════════
function getMaleVoice() {
  if (typeof window === "undefined") return null;
  const all = window.speechSynthesis.getVoices();
  const picks = [
    v => v.name === "Google UK English Male",
    v => v.name === "Microsoft Ryan Online (Natural) - English (United Kingdom)",
    v => v.name === "Microsoft Guy Online (Natural) - English (United States)",
    v => v.name === "Microsoft Davis Online (Natural) - English (United States)",
    v => v.name === "Microsoft Mark - English (United States)",
    v => v.name === "Alex",
    v => v.name === "Daniel",
    v => /Natural/i.test(v.name) && /male|man|guy|ryan|davis|mark|daniel|alex|james|chris|liam|aaron/i.test(v.name) && v.lang.startsWith("en"),
    v => /Neural/i.test(v.name) && v.lang.startsWith("en-US") && !/aria|jenny|zira|hazel|susan|linda|eva/i.test(v.name),
    v => v.lang.startsWith("en-GB"),
    v => v.lang.startsWith("en"),
  ];
  for (const fn of picks) { const m = all.find(fn); if (m) return m; }
  return all[0] ?? null;
}
let currentRate = 1.25;
function voiceSpeak(text, onEnd, rate) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const go = () => {
    const u = new SpeechSynthesisUtterance(text);
    u.rate = rate ?? currentRate; u.pitch = 0.92; u.volume = 1;
    const v = getMaleVoice(); if (v) u.voice = v;
    u.onend = onEnd; u.onerror = () => onEnd?.();
    window.speechSynthesis.speak(u);
  };
  window.speechSynthesis.getVoices().length === 0
    ? (window.speechSynthesis.onvoiceschanged = () => { go(); window.speechSynthesis.onvoiceschanged = null; })
    : go();
}
function voiceStop() { typeof window !== "undefined" && window.speechSynthesis?.cancel(); }

// ═══════════════════════════════════════════════════════════════════════════════
// NARRATIONS
// ═══════════════════════════════════════════════════════════════════════════════
const NARR = {
  intro: `A hash map is arguably the most powerful data structure in a programmer's toolkit. It stores key‑value pairs and gives you average O(1) — constant time — for insertion, lookup, and deletion. The secret is a hash function that converts any key into an array index. Think of it as a supercharged array where instead of accessing elements by position, you access them by name. This is how Python dictionaries, JavaScript objects, and Java HashMaps work under the hood.`,
  ops: `A hash map exposes five core operations. Put inserts or updates a key‑value pair in O(1). Get retrieves a value by key in O(1). Remove deletes an entry in O(1). ContainsKey checks existence in O(1). Size returns the count in O(1). Every single operation is constant time on average. Compare this to a sorted array where search is O(log n), or a linked list where search is O(n). The hash map is almost always faster.`,
  hash: `The hash function is the heart of a hash map. It takes any key — a string, number, or object — and deterministically converts it into an integer. We then reduce that integer to a valid array index using modulo: index equals hash of key, modulo capacity. A great hash function distributes keys as uniformly as possible across all buckets. Clustering — many keys landing in the same bucket — degrades performance from O(1) toward O(n). This is why choosing the right hash function matters enormously.`,
  collisions: `A collision happens when two different keys produce the same bucket index. Collisions are mathematically inevitable — by the birthday paradox, with just 23 people in a room, there is a 50% chance two share a birthday. Two strategies dominate. Separate chaining stores a linked list at each bucket; collisions simply append to the list. Open addressing finds the next available slot in the array itself using probing. Java uses chaining and even converts long chains to red-black trees for O(log n) worst case.`,
  impl: `Implementing a hash map from scratch teaches you how every language works internally. You need an array of buckets, a hash function, and collision handling. Start simple: allocate an array of 16 buckets, use separate chaining. The put operation hashes the key, finds the bucket, searches the chain for an existing entry, updates if found, appends if not. Get does the same but returns the value. This is exactly how Python dictionaries worked before Python 3.6.`,
  resizing: `When entries divided by capacity — the load factor — exceeds a threshold (typically 0.75), the hash map must grow. The standard approach is to double the capacity and rehash every existing entry into the new array. This is an O(n) operation, but it happens so rarely that the amortized cost per insertion remains O(1). Java's HashMap starts at capacity 16, load factor 0.75, so it first resizes at 12 entries. The key insight: each entry is moved at most once per doubling, and doublings are exponentially rare.`,
  internals: `Modern hash map implementations are highly optimized. Python's dict since 3.6 preserves insertion order and uses compact arrays. Java's HashMap converts bucket chains to red-black trees when chain length exceeds 8, giving O(log n) worst case instead of O(n). C++ unordered_map uses separate chaining by default. Robin Hood hashing minimizes variance in probe lengths. Understanding these internals helps you write better code and ace system design interviews.`,
  apps: `Hash maps power more systems than any other data structure. Two-sum in O(n) instead of O(n squared). Counting word frequencies in a document. Implementing a cache or memoizing recursive functions. Building a graph's adjacency list. Detecting duplicates in an array. DNS lookups. Database indexes. Routing tables in network switches. Symbol tables in compilers. Every time you need to answer "does this key exist and what is its value" — instantly — a hash map is the answer.`,
  quiz: `You have reached the quiz. You have studied hash functions, O(1) operations, separate chaining, open addressing, load factor, resizing, language internals, and real applications. Some questions are deliberately tricky. Getting a wrong answer is the fastest way to cement the correct understanding into memory. Think carefully before selecting.`,
};

const NAV_SECTIONS = [
  { id:"intro",     icon:"🗺️", label:"Intro",     col:"#60a5fa" },
  { id:"ops",       icon:"⚡",  label:"Operations",col:"#4ade80" },
  { id:"hash",      icon:"#️⃣",  label:"Hash Fn",   col:"#f472b6" },
  { id:"collisions",icon:"💥",  label:"Collisions",col:"#f59e0b" },
  { id:"impl",      icon:"🔧",  label:"Implement", col:"#818cf8" },
  { id:"resizing",  icon:"📈",  label:"Resizing",  col:"#34d399" },
  { id:"internals", icon:"⚙️",  label:"Internals", col:"#fb923c" },
  { id:"apps",      icon:"🌍",  label:"Apps",      col:"#a78bfa" },
  { id:"quiz",      icon:"🧠",  label:"Quiz",      col:"#ec4899" },
];
const SPEED_OPTIONS = [0.75, 1.0, 1.25, 1.5, 2.0];

// ═══════════════════════════════════════════════════════════════════════════════
// HOOKS
// ═══════════════════════════════════════════════════════════════════════════════
function useVisible(threshold = 0.07) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return [ref, vis];
}

function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [query]);
  return matches;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROGRESS BAR
// ═══════════════════════════════════════════════════════════════════════════════
function ProgressBar() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const h = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setP(max > 0 ? (window.scrollY / max) * 100 : 0);
    };
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  return (
    <div style={{ position:"fixed",top:0,left:0,right:0,height:3,zIndex:999,background:"rgba(255,255,255,0.03)" }}>
      <div style={{ height:"100%",width:`${p}%`,background:"linear-gradient(90deg,#60a5fa,#4ade80,#f472b6)",transition:"width 0.1s linear",boxShadow:"0 0 12px rgba(96,165,250,0.8)" }}/>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SPEAKING WAVE
// ═══════════════════════════════════════════════════════════════════════════════
function SpeakingWave({ color = "#4ade80", size = 16 }) {
  return (
    <div style={{ display:"flex",alignItems:"center",gap:2,height:size }}>
      {[0,1,2,3].map(i => (
        <div key={i} style={{ width:size*0.18,height:size*0.5,background:color,borderRadius:99,animation:`wave 1.1s ease-in-out ${i*0.15}s infinite` }}/>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// RIGHT SIDEBAR (identical pattern to Stack page)
// ═══════════════════════════════════════════════════════════════════════════════
function RightSidebar({ active, speaking, speed, setSpeed, onRestart, seenCount, open, setOpen }) {
  const [show, setShow] = useState(false);
  const [speedOpen, setSpeedOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 600px)");

  useEffect(() => {
    const h = () => setShow(window.scrollY > 500);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  if (!open) {
    const btnSize = isMobile ? 36 : 40;
    return (
      <button onClick={() => setOpen(true)} style={{
        position:"fixed", right: isMobile ? 12 : 16, top:"50%", transform:"translateY(-50%)",
        zIndex:950, width:btnSize, height:btnSize, borderRadius:btnSize/2,
        background:"rgba(96,165,250,0.2)", border:"1px solid rgba(96,165,250,0.4)",
        backdropFilter:"blur(12px)", cursor:"pointer",
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize: isMobile ? 18 : 20, color:"#60a5fa", transition:"all 0.2s",
        boxShadow:"0 4px 12px rgba(0,0,0,0.3)",
      }}>◀</button>
    );
  }

  const btnSize = isMobile ? 32 : 36;
  const gap = isMobile ? 3 : 4;
  const padding = "8px 6px";
  const fontSizeIcon = isMobile ? 18 : 16;
  const fontSizeText = isMobile ? 9 : 8;
  const codePadding = "4px 8px";

  return (
    <nav style={{
      position:"fixed", right: isMobile ? 12 : 16, top:"50%", transform:"translateY(-50%)",
      zIndex:900, display:"flex", flexDirection:"column", alignItems:"center", gap,
      padding, background:"rgba(3,6,18,0.94)", backdropFilter:"blur(28px) saturate(180%)",
      borderRadius:24, border:"1px solid rgba(255,255,255,0.07)",
      boxShadow:"0 12px 48px rgba(0,0,0,0.7)",
      opacity:show?1:0, pointerEvents:show?"auto":"none", transition:"opacity 0.3s ease",
      maxHeight: isMobile ? "85vh" : "auto", overflowY: isMobile ? "auto" : "visible",
    }}>
      <button onClick={() => setOpen(false)} style={{
        width:btnSize, height:btnSize, borderRadius:10, border:"none",
        background:"rgba(255,255,255,0.05)", cursor:"pointer", fontSize:14,
        display:"flex", alignItems:"center", justifyContent:"center", color:"#94a3b8", marginBottom:2,
      }}>✕</button>

      {NAV_SECTIONS.map(s => (
        <button key={s.id}
          onClick={() => document.getElementById(s.id)?.scrollIntoView({ behavior:"smooth" })}
          title={s.label}
          style={{
            width:btnSize, height:btnSize, borderRadius:8, border:"none", cursor:"pointer",
            background:active===s.id?`${s.col}22`:"transparent",
            outline:active===s.id?`1.5px solid ${s.col}55`:"1.5px solid transparent",
            fontSize:fontSizeIcon, transition:"all 0.2s",
            display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
          }}>{s.icon}</button>
      ))}

      <div style={{
        padding:codePadding, borderRadius:16,
        background:"rgba(96,165,250,0.08)", border:"1px solid rgba(96,165,250,0.2)",
        display:"flex", alignItems:"center", gap:4,
      }}>
        <div style={{ width:24, height:4, borderRadius:99, background:"rgba(255,255,255,0.06)", overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${(seenCount/NAV_SECTIONS.length)*100}%`, background:"#60a5fa", borderRadius:99, transition:"width 0.5s ease" }}/>
        </div>
        <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize: isMobile ? 8 : 7, color:"#60a5fa", fontWeight:700 }}>{seenCount}/{NAV_SECTIONS.length}</span>
      </div>

      {/* Speed panel */}
      <div style={{ position:"relative" }}>
        <button onClick={() => setSpeedOpen(o => !o)} style={{
          display:"flex", alignItems:"center", gap:3, padding:codePadding, borderRadius:16, cursor:"pointer",
          background:speedOpen?"rgba(96,165,250,0.2)":"rgba(255,255,255,0.05)",
          border:`1.5px solid ${speedOpen?"#60a5fa":"rgba(255,255,255,0.1)"}`,
          fontFamily:"'JetBrains Mono',monospace", fontSize:fontSizeText, fontWeight:700,
          color:speedOpen?"#93c5fd":"#64748b", transition:"all 0.2s",
        }}>⚡ {speed}×</button>
        {speedOpen && (
          <div style={{
            position:"absolute", top:0, right:"calc(100% + 8px)",
            background:"rgba(5,8,20,0.97)", backdropFilter:"blur(28px)",
            border:"1px solid rgba(255,255,255,0.1)", borderRadius:12,
            padding:"4px", display:"flex", flexDirection:"column", gap:2,
            zIndex:1000, minWidth:80, boxShadow:"0 16px 48px rgba(0,0,0,0.8)",
            animation:"panelPop 0.18s cubic-bezier(0.22,1,0.36,1) both",
          }}>
            <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:6, color:"#2d3748", letterSpacing:"0.1em", padding:"1px 5px 3px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>SPEED</div>
            {SPEED_OPTIONS.map(s => (
              <button key={s} onClick={() => { currentRate=s; setSpeed(s); setSpeedOpen(false); if(speaking) onRestart(); }} style={{
                padding:"3px 8px", borderRadius:5, cursor:"pointer", textAlign:"left",
                background:speed===s?"rgba(96,165,250,0.2)":"transparent",
                border:`1px solid ${speed===s?"rgba(96,165,250,0.45)":"transparent"}`,
                fontFamily:"'JetBrains Mono',monospace", fontSize:8, fontWeight:700,
                color:speed===s?"#93c5fd":"#475569", transition:"all 0.15s",
              }}>{s===1.25?`${s}× ★`:`${s}×`}</button>
            ))}
          </div>
        )}
      </div>

      {speaking && (
        <div style={{ display:"flex", alignItems:"center", gap:3, padding:codePadding, borderRadius:12, background:"rgba(96,165,250,0.12)", border:"1px solid rgba(96,165,250,0.3)" }}>
          <SpeakingWave color="#60a5fa" size={isMobile ? 10 : 9}/>
        </div>
      )}
    </nav>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// BACK TO TOP
// ═══════════════════════════════════════════════════════════════════════════════
function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const h = () => setShow(window.scrollY > 1200);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  return (
    <button onClick={() => window.scrollTo({ top:0, behavior:"smooth" })} style={{
      position:"fixed", bottom:24, right:20, zIndex:850,
      width:44, height:44, borderRadius:14, cursor:"pointer",
      background:"rgba(96,165,250,0.15)", border:"1px solid rgba(96,165,250,0.35)",
      color:"#93c5fd", fontSize:18, display:"flex", alignItems:"center", justifyContent:"center",
      opacity:show?1:0, transform:show?"scale(1)":"scale(0.7)",
      pointerEvents:show?"auto":"none",
      transition:"all 0.3s cubic-bezier(0.22,1,0.36,1)",
      boxShadow:"0 8px 24px rgba(96,165,250,0.3)",
    }}>↑</button>
  );
}

function CompletedBadge({ seen }) {
  if (!seen) return null;
  return (
    <span style={{
      padding:"2px 9px", borderRadius:20, fontSize:9,
      fontFamily:"'JetBrains Mono',monospace", fontWeight:700,
      background:"rgba(96,165,250,0.12)", border:"1px solid rgba(96,165,250,0.3)",
      color:"#60a5fa", letterSpacing:"0.08em", animation:"fadeIn 0.4s ease both",
    }}>✓ READ</span>
  );
}

function MiniPlayer({ speaking, speakingLabel, onStop, speed }) {
  if (!speaking) return null;
  return (
    <div style={{
      position:"fixed", bottom:24, left:"50%", transform:"translateX(-50%)",
      zIndex:850, display:"flex", alignItems:"center", gap:12,
      padding:"10px 20px", borderRadius:99,
      background:"rgba(5,8,20,0.96)", backdropFilter:"blur(24px)",
      border:"1px solid rgba(96,165,250,0.3)",
      boxShadow:"0 8px 36px rgba(96,165,250,0.18),0 2px 12px rgba(0,0,0,0.7)",
      animation:"slideUp 0.35s cubic-bezier(0.22,1,0.36,1) both",
      maxWidth:"calc(100vw - 48px)",
    }}>
      <SpeakingWave color="#60a5fa" size={16}/>
      <div>
        <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:600, color:"#e2e8f0", lineHeight:1 }}>{speakingLabel}</div>
        <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:"#60a5fa", marginTop:2 }}>{speed}× · male voice</div>
      </div>
      <button onClick={onStop} style={{
        background:"rgba(239,68,68,0.15)", border:"1px solid rgba(239,68,68,0.35)",
        borderRadius:20, cursor:"pointer", padding:"4px 12px",
        fontFamily:"'JetBrains Mono',monospace", fontSize:9, fontWeight:700, color:"#f87171",
      }}>⏹ STOP</button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// HERO — Fixed animation, no layout shift
// Uses fixed-slot pattern: always 8 bucket columns, items CSS-transition in/out
// ═══════════════════════════════════════════════════════════════════════════════
const HERO_KEYS   = ["apple","cat","zoo","hi","js","db","red","pi","ax","key"];
const HERO_VALS   = [42, 7, 99, 15, 63, 28, 81, 55, 37, 20];
const HERO_COLORS = ["#60a5fa","#f472b6","#4ade80","#f59e0b","#a78bfa","#34d399","#fb923c","#e879f9"];
const NUM_BUCKETS = 8;

function heroHash(k) {
  let h = 0;
  for (let i = 0; i < k.length; i++) h = ((h << 5) - h) + k.charCodeAt(i) | 0;
  return Math.abs(h % NUM_BUCKETS);
}

function Hero({ onStart, onVoice }) {
  // map: { key → { val, col, state: "idle"|"entering"|"leaving" } }
  const [entries, setEntries] = useState(() => ({
    apple: { val:42,  col:"#60a5fa", state:"idle" },
    cat:   { val:7,   col:"#f472b6", state:"idle" },
    zoo:   { val:99,  col:"#4ade80", state:"idle" },
  }));
  const [opLabel, setOpLabel] = useState(null);
  const [paused,  setPaused]  = useState(false);

  const entriesRef = useRef(entries);
  const pauseRef   = useRef(false);
  const busyRef    = useRef(false);
  const kidxRef    = useRef(3);
  const vidxRef    = useRef(3);

  useEffect(() => { entriesRef.current = entries; }, [entries]);
  useEffect(() => { pauseRef.current = paused; }, [paused]);

  useEffect(() => {
    const tick = () => {
      if (pauseRef.current || busyRef.current) return;
      const cur = entriesRef.current;
      const keys = Object.keys(cur);

      if (keys.length >= 6) {
        // Remove a random live key
        const target = keys[Math.floor(Math.random() * keys.length)];
        const item = cur[target];
        busyRef.current = true;
        setOpLabel({ text:`REMOVE "${target}"`, col:"#f472b6", icon:"❌" });
        // mark leaving
        setEntries(prev => ({ ...prev, [target]: { ...prev[target], state:"leaving" } }));
        setTimeout(() => {
          setEntries(prev => {
            const next = { ...prev };
            delete next[target];
            return next;
          });
          setTimeout(() => { setOpLabel(null); busyRef.current = false; }, 350);
        }, 500);
      } else {
        // Add a new key
        const k = HERO_KEYS[kidxRef.current % HERO_KEYS.length];
        kidxRef.current++;
        if (entriesRef.current[k]) { busyRef.current = false; return; } // skip if exists
        const v = HERO_VALS[vidxRef.current % HERO_VALS.length];
        vidxRef.current++;
        const c = HERO_COLORS[kidxRef.current % HERO_COLORS.length];
        busyRef.current = true;
        setOpLabel({ text:`PUT "${k}" → ${v}`, col:"#4ade80", icon:"📝" });
        setEntries(prev => ({ ...prev, [k]: { val:v, col:c, state:"entering" } }));
        setTimeout(() => {
          setEntries(prev => prev[k] ? { ...prev, [k]: { ...prev[k], state:"idle" } } : prev);
          setTimeout(() => { setOpLabel(null); busyRef.current = false; }, 350);
        }, 500);
      }
    };
    const id = setInterval(tick, 2200);
    return () => clearInterval(id);
  }, []);

  // Build bucket display — fixed 8 slots
  const buckets = Array.from({ length:NUM_BUCKETS }, (_, bi) => {
    const items = Object.entries(entries)
      .filter(([k]) => heroHash(k) === bi)
      .map(([k, v]) => ({ k, ...v }));
    return { bi, items };
  });

  return (
    <div style={{
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      padding:"72px 24px 52px", textAlign:"center", position:"relative", overflow:"hidden",
    }}>
      {/* BG */}
      <div style={{ position:"absolute",inset:0,pointerEvents:"none",backgroundImage:"radial-gradient(circle,rgba(96,165,250,0.045) 1px,transparent 1px)",backgroundSize:"38px 38px" }}/>
      <div style={{ position:"absolute",top:"5%",left:"3%",width:480,height:480,borderRadius:"50%",background:"radial-gradient(circle,rgba(96,165,250,0.12) 0%,transparent 68%)",filter:"blur(90px)",pointerEvents:"none",animation:"orb1 24s ease-in-out infinite" }}/>
      <div style={{ position:"absolute",bottom:"6%",right:"3%",width:400,height:400,borderRadius:"50%",background:"radial-gradient(circle,rgba(244,114,182,0.09) 0%,transparent 68%)",filter:"blur(75px)",pointerEvents:"none",animation:"orb2 30s ease-in-out infinite" }}/>

      {/* ── HASH MAP VISUALIZER ── fixed height, zero layout shift */}
      <div style={{ width:"100%", maxWidth:680, marginBottom:44, position:"relative" }}>

        {/* Op label — fixed 36px zone, never pushes content */}
        <div style={{ height:36, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:10 }}>
          {opLabel && (
            <span key={opLabel.text} style={{
              display:"inline-flex", alignItems:"center", gap:7,
              padding:"5px 18px", borderRadius:20,
              background:`${opLabel.col}16`, border:`1px solid ${opLabel.col}45`,
              fontFamily:"'JetBrains Mono',monospace", fontSize:11, fontWeight:700,
              color:opLabel.col, animation:"opLabelIn 0.28s cubic-bezier(0.22,1,0.36,1) both",
              backdropFilter:"blur(8px)", boxShadow:`0 0 20px ${opLabel.col}20`,
            }}>
              <span>{opLabel.icon}</span> {opLabel.text}
            </span>
          )}
        </div>

        {/* Bucket grid — FIXED layout, no height change */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(8,1fr)", gap:6 }}>
          {buckets.map(({ bi, items }) => (
            <div key={bi} style={{
              borderRadius:12,
              background: items.length > 0 ? "rgba(96,165,250,0.06)" : "rgba(255,255,255,0.018)",
              border:`1px solid ${items.length > 0 ? "rgba(96,165,250,0.22)" : "rgba(255,255,255,0.06)"}`,
              padding:"8px 4px",
              minHeight:110, // fixed — never changes
              display:"flex", flexDirection:"column", gap:4, alignItems:"stretch",
              position:"relative", transition:"border-color 0.3s, background 0.3s",
            }}>
              {/* Bucket index label */}
              <div style={{
                fontFamily:"'JetBrains Mono',monospace", fontSize:8, fontWeight:700,
                color: items.length > 0 ? "#60a5fa" : "#1e2a38",
                textAlign:"center", marginBottom:2, letterSpacing:"0.04em",
              }}>B{bi}</div>

              {/* Items — CSS transitions handle enter/leave, NO DOM add/remove mid-render */}
              {items.map(item => (
                <div key={item.k} style={{
                  borderRadius:7, padding:"3px 4px",
                  background:`${item.col}18`, border:`1px solid ${item.col}50`,
                  display:"flex", flexDirection:"column", alignItems:"center", gap:1,
                  opacity:    item.state === "leaving"  ? 0 : item.state === "entering" ? 0 : 1,
                  transform:  item.state === "leaving"  ? "scale(0.7) translateY(8px)" :
                              item.state === "entering" ? "scale(0.7) translateY(-8px)" : "scale(1)",
                  transition: "opacity 0.42s ease, transform 0.42s cubic-bezier(0.34,1.28,0.64,1)",
                  boxShadow: item.state === "idle" ? `0 0 8px ${item.col}25` : "none",
                }}>
                  <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, fontWeight:700, color:item.col, lineHeight:1 }}>{item.k}</span>
                  <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:8, color:"rgba(255,255,255,0.45)", lineHeight:1 }}>→{item.val}</span>
                </div>
              ))}

              {/* Chain indicator when >1 entry (collision) */}
              {items.length > 1 && (
                <div style={{
                  position:"absolute", top:4, right:4,
                  width:14, height:14, borderRadius:"50%",
                  background:"rgba(245,158,11,0.25)", border:"1px solid rgba(245,158,11,0.55)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontFamily:"'JetBrains Mono',monospace", fontSize:7, fontWeight:700, color:"#f59e0b",
                }}>{items.length}</div>
              )}
            </div>
          ))}
        </div>

        {/* Axis labels */}
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:6, padding:"0 2px" }}>
          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:7, color:"#1e2a38", letterSpacing:"0.06em" }}>BUCKET 0</span>
          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:7, color:"#1e2a38", letterSpacing:"0.06em" }}>BUCKET 7</span>
        </div>

        {/* Controls */}
        <div style={{ display:"flex", justifyContent:"center", gap:10, marginTop:12 }}>
          <button onClick={() => setPaused(p => !p)} style={{
            padding:"6px 18px", borderRadius:22, cursor:"pointer",
            background:paused?"rgba(251,191,36,0.13)":"rgba(255,255,255,0.04)",
            border:`1px solid ${paused?"rgba(251,191,36,0.4)":"rgba(255,255,255,0.09)"}`,
            fontFamily:"'JetBrains Mono',monospace", fontSize:9, fontWeight:700,
            color:paused?"#fbbf24":"#334155", transition:"all 0.2s",
            display:"flex", alignItems:"center", gap:6, letterSpacing:"0.06em",
          }}>
            {paused?"▶ RESUME":"⏸ PAUSE"}
          </button>
        </div>
        <div style={{ marginTop:8, fontFamily:"'JetBrains Mono',monospace", fontSize:8, color:"#1e2a38", textAlign:"center", letterSpacing:"0.14em" }}>
          HASH MAP — 8 BUCKETS · SEPARATE CHAINING · djb2 MOD 8
        </div>
        <div style={{ marginTop:4, fontFamily:"'JetBrains Mono',monospace", fontSize:7.5, color:"#1a2535", textAlign:"center" }}>
          🟡 orange badge = collision (multiple keys in same bucket)
        </div>
      </div>

      {/* Hero text */}
      <div style={{ maxWidth:620, position:"relative" }}>
        <div style={{
          display:"inline-flex", alignItems:"center", gap:8, marginBottom:20,
          padding:"5px 18px", borderRadius:40,
          background:"rgba(96,165,250,0.08)", border:"1px solid rgba(96,165,250,0.2)",
          fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:"#60a5fa", letterSpacing:"0.1em",
        }}>🗺️ INTERACTIVE VISUAL GUIDE · FOR COMPLETE BEGINNERS</div>

        <h1 style={{
          margin:"0 0 16px", fontFamily:"'Syne',sans-serif",
          fontSize:"clamp(38px,7.5vw,78px)", fontWeight:800, letterSpacing:"-0.035em", lineHeight:1.02,
          background:"linear-gradient(145deg,#f8fafc 0%,#bfdbfe 30%,#86efac 65%,#f9a8d4 100%)",
          WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
        }}>Hash Map<br/>Data Structure</h1>

        <p style={{ margin:"0 auto 32px", fontFamily:"'DM Sans',sans-serif", fontSize:"clamp(14px,2.2vw,18px)", color:"#64748b", lineHeight:1.68, maxWidth:500 }}>
          O(1) key‑value storage — explained, animated, narrated with a <strong style={{ color:"#93c5fd" }}>natural male voice</strong>. Hash functions to internals.
        </p>

        <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
          <button onClick={onStart} style={{
            padding:"15px 36px", borderRadius:16, cursor:"pointer",
            background:"linear-gradient(135deg,#3b82f6 0%,#ec4899 100%)",
            border:"none", fontFamily:"'Syne',sans-serif", fontSize:16, fontWeight:700,
            color:"#fff", boxShadow:"0 8px 36px rgba(59,130,246,0.45)", transition:"all 0.25s",
          }}
            onMouseEnter={e => { e.currentTarget.style.transform="translateY(-3px) scale(1.02)"; e.currentTarget.style.boxShadow="0 14px 48px rgba(59,130,246,0.6)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="0 8px 36px rgba(59,130,246,0.45)"; }}
          >Begin Learning ↓</button>
          <button onClick={onVoice} style={{
            padding:"15px 26px", borderRadius:16, cursor:"pointer",
            background:"rgba(255,255,255,0.05)", border:"1.5px solid rgba(255,255,255,0.15)",
            fontFamily:"'Syne',sans-serif", fontSize:16, fontWeight:600,
            color:"#94a3b8", transition:"all 0.25s", display:"flex", alignItems:"center", gap:9,
          }}
            onMouseEnter={e => { e.currentTarget.style.background="rgba(255,255,255,0.1)"; e.currentTarget.style.color="#f8fafc"; }}
            onMouseLeave={e => { e.currentTarget.style.background="rgba(255,255,255,0.05)"; e.currentTarget.style.color="#94a3b8"; }}
          ><span style={{ fontSize:18 }}>🔊</span> Hear Intro</button>
        </div>

        <div style={{ display:"flex", gap:6, justifyContent:"center", alignItems:"center", marginTop:20, flexWrap:"wrap" }}>
          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:"#2d3748", letterSpacing:"0.08em" }}>VOICE SPEED:</span>
          {SPEED_OPTIONS.map(s => (
            <button key={s} onClick={() => { currentRate=s; }} style={{
              padding:"4px 11px", borderRadius:20, cursor:"pointer",
              background:currentRate===s?"rgba(96,165,250,0.18)":"rgba(255,255,255,0.04)",
              border:`1px solid ${currentRate===s?"rgba(96,165,250,0.5)":"rgba(255,255,255,0.08)"}`,
              fontFamily:"'JetBrains Mono',monospace", fontSize:9, fontWeight:700,
              color:currentRate===s?"#93c5fd":"#2d3748", transition:"all 0.18s",
            }}>{s}×</button>
          ))}
        </div>

        <div style={{ display:"flex", gap:28, justifyContent:"center", marginTop:44, flexWrap:"wrap" }}>
          {[["9","Sections"],["O(1)","Avg. ops"],["6","Quiz Qs"],["0.75","Load Factor"]].map(([n,l]) => (
            <div key={l} style={{ textAlign:"center" }}>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:28, fontWeight:800, background:"linear-gradient(135deg,#93c5fd,#86efac)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>{n}</div>
              <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:"#2d3748", letterSpacing:"0.1em", marginTop:3 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION WRAPPER
// ═══════════════════════════════════════════════════════════════════════════════
function Sect({ id, icon, title, color, visual, cards, voice, speaking, onVoice, seen }) {
  const [ref, vis] = useVisible(0.07);
  const isSp = speaking === id;
  return (
    <section id={id} ref={ref} style={{
      padding:"0 0 80px",
      opacity:vis?1:0, transform:vis?"none":"translateY(52px)",
      transition:"opacity 0.78s cubic-bezier(0.22,1,0.36,1),transform 0.78s cubic-bezier(0.22,1,0.36,1)",
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:24, flexWrap:"wrap" }}>
        <div style={{
          width:50, height:50, borderRadius:16, flexShrink:0,
          background:`${color}14`, border:`1px solid ${color}38`,
          display:"flex", alignItems:"center", justifyContent:"center", fontSize:24,
          boxShadow:`0 0 28px ${color}18`,
        }}>{icon}</div>
        <h2 style={{ flex:1, margin:0, minWidth:0, fontFamily:"'Syne',sans-serif", fontSize:"clamp(19px,3.8vw,30px)", fontWeight:800, color:"#f8fafc", letterSpacing:"-0.022em", lineHeight:1.15 }}>{title}</h2>
        <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
          <CompletedBadge seen={seen}/>
          <button onClick={() => onVoice(id, voice)} style={{
            display:"flex", alignItems:"center", gap:6,
            padding:"7px 14px", borderRadius:28, cursor:"pointer",
            background:isSp?`${color}20`:"rgba(255,255,255,0.04)",
            border:`1.5px solid ${isSp?color:"rgba(255,255,255,0.1)"}`,
            fontFamily:"'JetBrains Mono',monospace", fontSize:9, fontWeight:700,
            color:isSp?color:"#475569", transition:"all 0.22s",
          }}>
            {isSp?<SpeakingWave color={color} size={12}/>:<span style={{ fontSize:12 }}>🔊</span>}
            {isSp?"STOP":"LISTEN"}
          </button>
        </div>
      </div>
      <div className="sg" style={{ display:"grid", gridTemplateColumns:"minmax(0,1.12fr) minmax(0,0.88fr)", gap:18 }}>
        <div style={{
          padding:20, borderRadius:22,
          background:"linear-gradient(150deg,rgba(255,255,255,0.028) 0%,rgba(0,0,0,0.22) 100%)",
          border:`1px solid ${color}18`, boxShadow:`0 0 64px ${color}09`, minWidth:0,
        }}>{visual}</div>
        <div style={{ display:"flex", flexDirection:"column", gap:9, minWidth:0 }}>
          {cards.map((c,i) => (
            <div key={i} style={{
              padding:"12px 14px", borderRadius:13,
              background:"rgba(255,255,255,0.022)", border:"1px solid rgba(255,255,255,0.052)",
              borderLeft:`3px solid ${color}55`,
              animation:vis?`sRight 0.5s cubic-bezier(0.22,1,0.36,1) ${0.1+i*0.1}s both`:"none",
            }}>
              {c.lbl && <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:8.5, fontWeight:700, color, letterSpacing:"0.12em", marginBottom:5, opacity:0.88 }}>{c.lbl}</div>}
              <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:"#94a3b8", lineHeight:1.68 }}>{c.body}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VIS: Intro — interactive put/get/delete on live map
// ═══════════════════════════════════════════════════════════════════════════════
function VisIntro() {
  const [map, setMap]     = useState({ name:"Alice", age:"25", city:"NY" });
  const [inputKey, setInputKey] = useState("");
  const [inputVal, setInputVal] = useState("");
  const [log, setLog]     = useState([]);
  const [flash, setFlash] = useState(null); // { key, type }
  const addLog = (msg, type="info") => setLog(l => [{ msg, type, ts:Date.now() }, ...l].slice(0,5));

  const doFlash = (key, type) => {
    setFlash({ key, type });
    setTimeout(() => setFlash(null), 700);
  };

  const put = () => {
    if (!inputKey.trim()) return;
    const isNew = !(inputKey in map);
    setMap(m => ({ ...m, [inputKey]: inputVal }));
    addLog(`${isNew?"PUT":"UPDATE"} "${inputKey}" → "${inputVal}" (bucket ${heroHash(inputKey)})`, "put");
    doFlash(inputKey, "put");
    setInputKey(""); setInputVal("");
  };
  const get = () => {
    if (!inputKey.trim()) return;
    const v = map[inputKey];
    addLog(v !== undefined ? `GET "${inputKey}" → "${v}"` : `GET "${inputKey}" → null (key not found)`, v !== undefined ? "get":"err");
    doFlash(inputKey, "get");
  };
  const del = () => {
    if (!inputKey.trim() || !(inputKey in map)) { addLog(`DELETE "${inputKey}" → key not found`, "err"); return; }
    const newMap = { ...map }; delete newMap[inputKey];
    setMap(newMap);
    addLog(`DELETE "${inputKey}" → removed (bucket ${heroHash(inputKey)})`, "del");
    doFlash(inputKey, "del");
    setInputKey("");
  };

  const typeColors = { put:"#4ade80", get:"#60a5fa", del:"#f472b6", err:"#f87171", info:"#94a3b8" };

  return (
    <div>
      <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:8.5, color:"#2d3748", letterSpacing:"0.08em", marginBottom:8 }}>INTERACTIVE HASH MAP</div>
      <div style={{ display:"flex", flexDirection:"column", gap:4, marginBottom:14 }}>
        {Object.entries(map).map(([k, v]) => {
          const isFlashing = flash?.key === k;
          const fc = flash ? typeColors[flash.type] : "#60a5fa";
          return (
            <div key={k} style={{
              display:"flex", alignItems:"center", gap:10, padding:"7px 12px",
              borderRadius:9,
              background:isFlashing ? `${fc}18` : "rgba(255,255,255,0.03)",
              border:`1px solid ${isFlashing ? fc : "rgba(255,255,255,0.07)"}`,
              transition:"all 0.25s", boxShadow:isFlashing ? `0 0 12px ${fc}30` : "none",
            }}>
              <div style={{ width:28, height:18, borderRadius:5, background:"rgba(96,165,250,0.15)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'JetBrains Mono',monospace", fontSize:8, color:"#60a5fa", fontWeight:700, flexShrink:0 }}>B{heroHash(k)}</div>
              <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, fontWeight:700, color:isFlashing ? fc : "#93c5fd", flex:1 }}>"{k}"</span>
              <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:"#475569" }}>→</span>
              <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:isFlashing ? fc : "#e2e8f0" }}>"{v}"</span>
            </div>
          );
        })}
        {Object.keys(map).length === 0 && (
          <div style={{ padding:"12px", borderRadius:9, border:"1px dashed rgba(255,255,255,0.1)", textAlign:"center", fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:"#1e2a38" }}>MAP IS EMPTY</div>
        )}
      </div>
      <div style={{ display:"flex", gap:5, marginBottom:10, flexWrap:"wrap" }}>
        <input value={inputKey} onChange={e=>setInputKey(e.target.value)} onKeyDown={e=>e.key==="Enter"&&put()} placeholder="key"
          style={{ flex:1, minWidth:80, padding:"6px 10px", borderRadius:8, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:"#f8fafc", outline:"none" }}/>
        <input value={inputVal} onChange={e=>setInputVal(e.target.value)} onKeyDown={e=>e.key==="Enter"&&put()} placeholder="value"
          style={{ flex:1, minWidth:70, padding:"6px 10px", borderRadius:8, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:"#f8fafc", outline:"none" }}/>
        <button onClick={put} style={{ padding:"6px 12px", borderRadius:20, background:"rgba(74,222,128,0.15)", border:"1px solid rgba(74,222,128,0.35)", fontFamily:"'JetBrains Mono',monospace", fontSize:9, fontWeight:700, color:"#4ade80" }}>PUT</button>
        <button onClick={get} disabled={!inputKey} style={{ padding:"6px 12px", borderRadius:20, background:"rgba(96,165,250,0.12)", border:"1px solid rgba(96,165,250,0.3)", fontFamily:"'JetBrains Mono',monospace", fontSize:9, fontWeight:700, color:inputKey?"#60a5fa":"#2d3748" }}>GET</button>
        <button onClick={del} disabled={!inputKey} style={{ padding:"6px 12px", borderRadius:20, background:"rgba(244,114,182,0.12)", border:"1px solid rgba(244,114,182,0.3)", fontFamily:"'JetBrains Mono',monospace", fontSize:9, fontWeight:700, color:inputKey?"#f472b6":"#2d3748" }}>DELETE</button>
      </div>
      <div style={{ padding:"6px 10px", borderRadius:8, background:"rgba(0,0,0,0.3)", border:"1px solid rgba(255,255,255,0.05)", minHeight:52 }}>
        {log.map((l,i) => (
          <div key={l.ts} style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:i===0?typeColors[l.type]:"#2d3748", padding:"1px 0", animation:i===0?"fadeIn 0.2s ease":"none" }}>{l.msg}</div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VIS: Operations
// ═══════════════════════════════════════════════════════════════════════════════
function VisOps() {
  const [active, setActive] = useState(null);
  const [animKey, setAnimKey] = useState(0);
  const OPS = [
    { name:"put",        icon:"📝", color:"#4ade80", time:"O(1) avg", desc:"Insert or update. Hash the key → find bucket → if key exists update, else append new node.", code:`map.put("name", "Alice");\nmap["name"] = "Alice"  # Python\nmap.set("name", "Alice")  // JS Map` , steps:["Hash the key","Find bucket","Search chain for key","Update or append"] },
    { name:"get",        icon:"🔍", color:"#60a5fa", time:"O(1) avg", desc:"Lookup by key. Hash → find bucket → traverse chain until key matches → return value.", code:`val = map.get("name");  // "Alice"\nval = map["name"]  # Python` ,       steps:["Hash the key","Find bucket","Walk chain for key","Return value or null"] },
    { name:"remove",     icon:"❌", color:"#f472b6", time:"O(1) avg", desc:"Delete entry. Hash → find bucket → unlink node from chain.", code:`map.remove("name");\ndel map["name"]  # Python\nmap.delete("name")  // JS Map` ,       steps:["Hash the key","Find bucket","Find node","Unlink from chain"] },
    { name:"containsKey",icon:"🔎", color:"#fbbf24", time:"O(1) avg", desc:"Check existence. Same as get but returns boolean instead of value.", code:`map.containsKey("name");  // true\n"name" in map  # Python\nmap.has("name")  // JS Map` ,       steps:["Hash the key","Find bucket","Walk chain","Return true/false"] },
    { name:"size",       icon:"📏", color:"#a78bfa", time:"O(1)",     desc:"Return the count of key‑value pairs. Maintained as a field, not recomputed.", code:`map.size();  // Java\nlen(map)    # Python\nmap.size    // JS Map` ,            steps:["Read size field","Return it","No hash needed","Pure O(1)"] },
  ];
  const sel = OPS.find(o => o.name === active);
  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7, marginBottom:12 }}>
        {OPS.map(op => (
          <button key={op.name} onClick={() => { setActive(active===op.name?null:op.name); setAnimKey(k=>k+1); }} style={{
            padding:"9px 10px", borderRadius:11, cursor:"pointer", textAlign:"left",
            background:active===op.name?`${op.color}18`:"rgba(255,255,255,0.03)",
            border:`1.5px solid ${active===op.name?op.color:"rgba(255,255,255,0.07)"}`,
            transition:"all 0.22s", display:"flex", alignItems:"center", gap:7,
          }}>
            <span style={{ fontSize:18 }}>{op.icon}</span>
            <div>
              <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, fontWeight:700, color:active===op.name?op.color:"#94a3b8" }}>{op.name}()</div>
              <div style={{ marginTop:2, padding:"1px 7px", borderRadius:20, display:"inline-block", background:`${op.color}14`, border:`1px solid ${op.color}28`, fontFamily:"'JetBrains Mono',monospace", fontSize:8, fontWeight:700, color:op.color }}>{op.time}</div>
            </div>
          </button>
        ))}
        {/* filler to keep grid even */}
        <div/>
      </div>
      {sel ? (
        <div key={animKey} style={{ padding:"13px 15px", borderRadius:13, background:`${sel.color}09`, border:`1px solid ${sel.color}22`, animation:"fUp 0.28s ease both" }}>
          <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:"#94a3b8", marginBottom:9, lineHeight:1.6 }}>{sel.desc}</p>
          <div style={{ display:"flex", gap:4, marginBottom:9, flexWrap:"wrap" }}>
            {sel.steps.map((s,i) => (
              <div key={i} style={{ padding:"3px 9px", borderRadius:20, background:`${sel.color}12`, border:`1px solid ${sel.color}25`, fontFamily:"'JetBrains Mono',monospace", fontSize:8.5, color:sel.color, animation:`sRight 0.32s ease ${i*0.07}s both` }}>
                <span style={{ opacity:0.5, marginRight:4 }}>{i+1}.</span>{s}
              </div>
            ))}
          </div>
          <div style={{ padding:"9px 12px", borderRadius:9, background:"rgba(0,0,0,0.4)", border:"1px solid rgba(255,255,255,0.06)" }}>
            <pre style={{ margin:0, fontFamily:"'JetBrains Mono',monospace", fontSize:10.5, color:"#7dd3fc", lineHeight:1.7, whiteSpace:"pre-wrap" }}>{sel.code}</pre>
          </div>
        </div>
      ) : (
        <div style={{ padding:12, borderRadius:13, background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.05)", textAlign:"center" }}>
          <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:"#1e2a38", letterSpacing:"0.08em" }}>SELECT AN OPERATION ABOVE</p>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VIS: Hash Function — live calculator
// ═══════════════════════════════════════════════════════════════════════════════
function VisHash() {
  const [key, setKey]       = useState("hello");
  const [capacity, setCap]  = useState(8);
  const [steps, setSteps]   = useState([]);
  const [result, setResult] = useState({ raw:0, idx:0 });

  useEffect(() => {
    // djb2
    let h = 5381;
    const ns = [];
    for (let i = 0; i < Math.min(key.length, 6); i++) {
      const code = key.charCodeAt(i);
      const prev = h;
      h = ((h << 5) + h + code) | 0;
      ns.push({ ch: key[i], code, prev: Math.abs(prev), after: Math.abs(h) });
    }
    const raw = Math.abs(h);
    const idx = raw % capacity;
    setSteps(ns);
    setResult({ raw, idx });
  }, [key, capacity]);

  return (
    <div>
      <div style={{ marginBottom:12 }}>
        <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:"#2d3748", marginBottom:4 }}>KEY TO HASH</div>
        <input value={key} onChange={e=>setKey(e.target.value)} style={{
          width:"100%", padding:"9px 12px", borderRadius:11,
          background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)",
          fontFamily:"'JetBrains Mono',monospace", fontSize:14, color:"#f8fafc", outline:"none",
        }}/>
      </div>
      <div style={{ display:"flex", gap:8, marginBottom:12, flexWrap:"wrap" }}>
        {[4,8,16,32].map(c => (
          <button key={c} onClick={() => setCap(c)} style={{
            padding:"3px 10px", borderRadius:20, cursor:"pointer",
            background:capacity===c?"rgba(244,114,182,0.18)":"rgba(255,255,255,0.04)",
            border:`1px solid ${capacity===c?"#f472b6":"rgba(255,255,255,0.1)"}`,
            fontFamily:"'JetBrains Mono',monospace", fontSize:9, fontWeight:700,
            color:capacity===c?"#f472b6":"#475569",
          }}>{c} buckets</button>
        ))}
      </div>

      {/* Step-by-step visualization */}
      <div style={{ padding:"10px 12px", borderRadius:11, background:"rgba(0,0,0,0.35)", border:"1px solid rgba(255,255,255,0.06)", marginBottom:12 }}>
        <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:8, color:"#2d3748", marginBottom:7, letterSpacing:"0.1em" }}>HASH COMPUTATION (djb2, first 6 chars)</div>
        {steps.map((s,i) => (
          <div key={i} style={{ display:"flex", gap:8, alignItems:"center", padding:"2px 0", borderBottom:"1px solid rgba(255,255,255,0.03)", animation:`fadeIn 0.2s ease ${i*0.05}s both` }}>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:"#f472b6", width:14, textAlign:"center" }}>'{s.ch}'</span>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:"#475569" }}>code={s.code}</span>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:"#2d3748" }}>→</span>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:"#60a5fa" }}>h={s.after.toLocaleString()}</span>
          </div>
        ))}
        {key.length > 6 && <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:8, color:"#2d3748", marginTop:4 }}>... {key.length - 6} more chars</div>}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        <div style={{ background:"rgba(244,114,182,0.1)", borderRadius:12, padding:"12px", textAlign:"center" }}>
          <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:"#475569", marginBottom:4 }}>Raw Hash</div>
          <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:18, fontWeight:700, color:"#f472b6" }}>{result.raw.toLocaleString()}</div>
        </div>
        <div style={{ background:"rgba(96,165,250,0.1)", borderRadius:12, padding:"12px", textAlign:"center" }}>
          <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:"#475569", marginBottom:4 }}>Bucket Index</div>
          <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:18, fontWeight:700, color:"#60a5fa" }}>{result.idx}</div>
          <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:8, color:"#2d3748", marginTop:3 }}>{result.raw.toLocaleString()} % {capacity} = {result.idx}</div>
        </div>
      </div>

      <p style={{ marginTop:10, fontFamily:"'DM Sans',sans-serif", fontSize:11, color:"#475569", lineHeight:1.55 }}>
        The same key <em>always</em> produces the same index — that's the determinism requirement. Try "hello" vs "Hello" — one character difference gives a completely different hash.
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VIS: Collisions — side-by-side chaining vs open addressing
// ═══════════════════════════════════════════════════════════════════════════════
function VisCollisions() {
  const [mode, setMode] = useState("chaining");
  const [chainBuckets, setChain] = useState(() => {
    const b = Array.from({ length:5 }, () => []);
    b[2] = [{ k:"apple", v:1 }, { k:"grape", v:2 }]; // deliberate collision at 2
    b[0] = [{ k:"cat", v:3 }];
    b[4] = [{ k:"dog", v:4 }];
    return b;
  });
  const [openArr, setOpen] = useState(["cat","",  "apple", "grape","dog","","","",]);
  const [inputKey, setInputKey] = useState("");
  const [inputVal, setInputVal] = useState("");
  const [log, setLog] = useState([]);
  const addLog = m => setLog(l => [m, ...l].slice(0, 4));

  const chainHash = k => {
    let h=0; for(let i=0;i<k.length;i++) h=((h<<5)-h)+k.charCodeAt(i)|0; return Math.abs(h%5);
  };

  const putChain = () => {
    if (!inputKey) return;
    const idx = chainHash(inputKey);
    const newB = chainBuckets.map(b => [...b]);
    const existing = newB[idx].find(e => e.k === inputKey);
    if (existing) { existing.v = inputVal; addLog(`UPDATE "${inputKey}" at bucket ${idx}`); }
    else { newB[idx].push({ k:inputKey, v:inputVal }); addLog(`INSERT "${inputKey}" at bucket ${idx} (chain len: ${newB[idx].length})`); }
    setChain(newB);
    setInputKey(""); setInputVal("");
  };

  return (
    <div>
      <div style={{ display:"flex", gap:7, justifyContent:"center", marginBottom:14 }}>
        {[["chaining","🔗 Separate Chaining"],["open","🏷️ Open Addressing"]].map(([m,lbl]) => (
          <button key={m} onClick={() => setMode(m)} style={{
            padding:"5px 14px", borderRadius:20, cursor:"pointer",
            background:mode===m?"rgba(245,158,11,0.18)":"rgba(255,255,255,0.04)",
            border:`1px solid ${mode===m?"#f59e0b":"rgba(255,255,255,0.1)"}`,
            fontFamily:"'JetBrains Mono',monospace", fontSize:9, fontWeight:700,
            color:mode===m?"#f59e0b":"#475569", transition:"all 0.2s",
          }}>{lbl}</button>
        ))}
      </div>

      {mode === "chaining" ? (
        <div>
          <div style={{ display:"flex", gap:6, justifyContent:"center", marginBottom:10 }}>
            {chainBuckets.map((bucket,i) => (
              <div key={i} style={{ flex:1, background:"rgba(255,255,255,0.03)", borderRadius:10, padding:"6px 4px", border:"1px solid rgba(255,255,255,0.08)", minWidth:0 }}>
                <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:8, color:"#60a5fa", textAlign:"center", marginBottom:4, fontWeight:700 }}>B{i}</div>
                {bucket.map((e,j) => (
                  <div key={j} style={{
                    background:`rgba(${j===0?"96,165,250":"245,158,11"},0.12)`,
                    borderRadius:5, padding:"3px 4px", margin:"2px 0",
                    display:"flex", justifyContent:"space-between", gap:2,
                    border:`1px solid rgba(${j===0?"96,165,250":"245,158,11"},0.3)`,
                    animation:"popIn 0.2s ease",
                  }}>
                    <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:8, color:j===0?"#60a5fa":"#f59e0b", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{e.k}</span>
                    <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:8, color:"#475569", flexShrink:0 }}>:{e.v}</span>
                  </div>
                ))}
                {bucket.length === 0 && <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:8, color:"#1a2030", textAlign:"center", padding:"4px 0" }}>∅</div>}
                {bucket.length > 1 && (
                  <div style={{ textAlign:"center", marginTop:3, fontFamily:"'JetBrains Mono',monospace", fontSize:7, color:"#f59e0b" }}>⚠ collision</div>
                )}
              </div>
            ))}
          </div>
          <div style={{ display:"flex", gap:5, marginBottom:7, flexWrap:"wrap" }}>
            <input value={inputKey} onChange={e=>setInputKey(e.target.value)} placeholder="key" style={{ flex:1, padding:"5px 8px", borderRadius:7, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:"#f8fafc", outline:"none" }}/>
            <input value={inputVal} onChange={e=>setInputVal(e.target.value)} placeholder="val" style={{ width:50, padding:"5px 6px", borderRadius:7, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:"#f8fafc", outline:"none" }}/>
            <button onClick={putChain} style={{ padding:"5px 12px", borderRadius:18, background:"rgba(74,222,128,0.15)", border:"1px solid rgba(74,222,128,0.3)", fontFamily:"'JetBrains Mono',monospace", fontSize:8, fontWeight:700, color:"#4ade80" }}>PUT</button>
          </div>
          <div style={{ padding:"5px 8px", borderRadius:7, background:"rgba(0,0,0,0.3)", border:"1px solid rgba(255,255,255,0.05)" }}>
            {log.map((l,i) => <div key={i} style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:8.5, color:i===0?"#f59e0b":"#2d3748" }}>{l}</div>)}
          </div>
          <p style={{ marginTop:8, fontFamily:"'DM Sans',sans-serif", fontSize:11, color:"#475569", lineHeight:1.55 }}>
            Each bucket holds a linked list. Collisions just append to the list. Lookup walks the list until key matches.
          </p>
        </div>
      ) : (
        <div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:5, marginBottom:10 }}>
            {openArr.map((v,i) => (
              <div key={i} style={{
                height:44, borderRadius:8, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
                background:v?"rgba(96,165,250,0.12)":"rgba(255,255,255,0.02)",
                border:`1.5px solid ${v?"#60a5fa":"rgba(255,255,255,0.07)"}`,
              }}>
                <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:8, color:"#2d3748" }}>[{i}]</span>
                <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, fontWeight:700, color:v?"#60a5fa":"#1a2030" }}>{v||"—"}</span>
              </div>
            ))}
          </div>
          <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:"#475569", lineHeight:1.55, marginBottom:8 }}>
            Open addressing stores entries directly in the array. On collision, it probes the next slot (linear probing shown). No linked list overhead, but clustering can degrade performance.
          </p>
          <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
            {[["✓ No pointer overhead — better cache locality","#4ade80"],["✓ All data in one array — simpler memory layout","#4ade80"],["✗ Clustering: consecutive filled slots slow lookup","#f87171"],["✗ Deletions require a 'tombstone' marker","#f87171"]].map(([t,c])=>(
              <div key={t} style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:c }}>{t}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VIS: Implementation — step-by-step put walkthrough
// ═══════════════════════════════════════════════════════════════════════════════
function VisImpl() {
  const [mode, setMode]   = useState("put");
  const [step, setStep]   = useState(0);
  const [animKey, setAK]  = useState(0);

  const PUT_STEPS = [
    { title:"1. Compute hash", desc:`hash("name") → djb2 → 4,294,101,234`, code:`int h = hash("name");`, highlight:"hash" },
    { title:"2. Modulo for index", desc:`4,294,101,234 % 16 = 5 → bucket 5`, code:`int idx = Math.abs(h) % capacity;`, highlight:"mod" },
    { title:"3. Find bucket", desc:`Go to arr[5] — currently contains one entry`, code:`LinkedList bucket = arr[idx];`, highlight:"bucket" },
    { title:"4. Search chain", desc:`Walk linked list: does any node have key "name"?`, code:`for (Node n=bucket.head; n!=null; n=n.next)\n  if (n.key.equals(key)) update...`, highlight:"search" },
    { title:"5a. Key found → update", desc:`Found! Overwrite value. Return.`, code:`n.value = value; return;`, highlight:"update" },
    { title:"5b. Not found → insert", desc:`Append new node to front of list. size++`, code:`bucket.addFirst(new Node(key, value));\nsize++;`, highlight:"insert" },
  ];

  const GET_STEPS = [
    { title:"1. Compute hash", desc:`hash("name") → same hash as put`, code:`int h = hash("name");`, highlight:"hash" },
    { title:"2. Modulo for index", desc:`h % capacity → same bucket 5`, code:`int idx = Math.abs(h) % capacity;`, highlight:"mod" },
    { title:"3. Walk bucket chain", desc:`Walk arr[5]'s list looking for key "name"`, code:`for (Node n=arr[idx].head; n!=null; n=n.next)`, highlight:"search" },
    { title:"4. Compare keys", desc:`n.key.equals("name") → true! Return n.value`, code:`if (n.key.equals(key)) return n.value;`, highlight:"found" },
    { title:"5. Key not found", desc:`Exhausted list — key absent. Return null.`, code:`return null;`, highlight:"null" },
  ];

  const steps = mode === "put" ? PUT_STEPS : GET_STEPS;
  const cur = steps[Math.min(step, steps.length - 1)];
  const colors = { hash:"#f472b6", mod:"#f59e0b", bucket:"#60a5fa", search:"#a78bfa", update:"#4ade80", insert:"#4ade80", found:"#4ade80", null:"#f87171" };

  return (
    <div>
      <div style={{ display:"flex", gap:7, justifyContent:"center", marginBottom:14 }}>
        {[["put","PUT walkthrough"],["get","GET walkthrough"]].map(([m,lbl]) => (
          <button key={m} onClick={() => { setMode(m); setStep(0); setAK(k=>k+1); }} style={{
            padding:"5px 14px", borderRadius:20, cursor:"pointer",
            background:mode===m?"rgba(244,114,182,0.18)":"rgba(255,255,255,0.04)",
            border:`1px solid ${mode===m?"#f472b6":"rgba(255,255,255,0.1)"}`,
            fontFamily:"'JetBrains Mono',monospace", fontSize:9, fontWeight:700,
            color:mode===m?"#f472b6":"#475569", transition:"all 0.2s",
          }}>{lbl}</button>
        ))}
      </div>

      {/* Step visualizer */}
      <div key={`${mode}-${animKey}`} style={{ padding:"14px 16px", borderRadius:14, background:`${colors[cur.highlight]}0c`, border:`1px solid ${colors[cur.highlight]}28`, marginBottom:12, animation:"fUp 0.28s ease both" }}>
        <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, fontWeight:700, color:colors[cur.highlight], marginBottom:6 }}>{cur.title}</div>
        <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:"#94a3b8", marginBottom:9, lineHeight:1.6 }}>{cur.desc}</p>
        <div style={{ padding:"8px 12px", borderRadius:9, background:"rgba(0,0,0,0.4)", border:"1px solid rgba(255,255,255,0.06)" }}>
          <pre style={{ margin:0, fontFamily:"'JetBrains Mono',monospace", fontSize:10.5, color:"#7dd3fc", lineHeight:1.65, whiteSpace:"pre-wrap" }}>{cur.code}</pre>
        </div>
      </div>

      {/* Step controls */}
      <div style={{ display:"flex", alignItems:"center", gap:8, justifyContent:"center" }}>
        <button onClick={() => setStep(s => Math.max(0,s-1))} disabled={step===0} style={{ padding:"5px 12px", borderRadius:20, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:step===0?"#1e2a38":"#94a3b8", cursor:step===0?"not-allowed":"pointer" }}>← PREV</button>
        <div style={{ display:"flex", gap:4 }}>
          {steps.map((_,i) => (
            <div key={i} onClick={() => setStep(i)} style={{ width:8, height:8, borderRadius:"50%", cursor:"pointer", background:i===step?colors[cur.highlight]:"rgba(255,255,255,0.1)", transition:"all 0.2s" }}/>
          ))}
        </div>
        <button onClick={() => setStep(s => Math.min(steps.length-1,s+1))} disabled={step===steps.length-1} style={{ padding:"5px 12px", borderRadius:20, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:step===steps.length-1?"#1e2a38":"#94a3b8", cursor:step===steps.length-1?"not-allowed":"pointer" }}>NEXT →</button>
      </div>
      <div style={{ textAlign:"center", marginTop:5, fontFamily:"'JetBrains Mono',monospace", fontSize:8, color:"#2d3748" }}>Step {step+1} / {steps.length}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VIS: Resizing — interactive load factor demo
// ═══════════════════════════════════════════════════════════════════════════════
function VisResizing() {
  const [entries, setEntries] = useState([10,20,30,40,50,60]);
  const [capacity, setCap]    = useState(8);
  const [resizing, setResizing] = useState(false);
  const loadFactor = entries.length / capacity;
  const threshold  = 0.75;
  const needResize = loadFactor >= threshold;

  const doResize = () => {
    if (resizing) return;
    setResizing(true);
    setTimeout(() => { setCap(c => c * 2); setResizing(false); }, 900);
  };
  const addEntry  = () => setEntries(e => [...e, Math.floor(Math.random()*90)+10]);
  const remEntry  = () => setEntries(e => e.slice(0,-1));

  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:12 }}>
        {[["Entries",entries.length,"#60a5fa"],["Capacity",capacity,"#4ade80"],["Load Factor",loadFactor.toFixed(2),loadFactor>=threshold?"#f87171":"#4ade80"]].map(([lbl,val,c]) => (
          <div key={lbl} style={{ textAlign:"center", padding:"8px", borderRadius:10, background:`${c}0c`, border:`1px solid ${c}22` }}>
            <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:8, color:"#475569", marginBottom:3 }}>{lbl}</div>
            <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:18, fontWeight:700, color:c }}>{val}</div>
          </div>
        ))}
      </div>

      {/* Load factor bar */}
      <div style={{ marginBottom:12 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:8, color:"#2d3748" }}>Load factor progress</span>
          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:8, color:"#f59e0b" }}>threshold: 0.75</span>
        </div>
        <div style={{ height:8, background:"rgba(255,255,255,0.06)", borderRadius:99, position:"relative", overflow:"hidden" }}>
          <div style={{ width:`${Math.min(loadFactor/1.0,1)*100}%`, height:"100%", background:loadFactor>=threshold?"linear-gradient(90deg,#fbbf24,#f87171)":"linear-gradient(90deg,#4ade80,#60a5fa)", borderRadius:99, transition:"width 0.3s ease" }}/>
          {/* threshold marker */}
          <div style={{ position:"absolute", top:0, left:"75%", width:2, height:"100%", background:"rgba(245,158,11,0.7)" }}/>
        </div>
        <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:7.5, color:"#2d3748", marginTop:3, textAlign:"right" }}>
          {entries.length} / {capacity} = {loadFactor.toFixed(2)} {needResize?"⚠ RESIZE NEEDED":""}
        </div>
      </div>

      {/* Bucket grid */}
      <div style={{ display:"flex", gap:3, flexWrap:"wrap", justifyContent:"center", marginBottom:12 }}>
        {Array.from({ length: Math.min(capacity, 24) }, (_,i) => (
          <div key={i} style={{
            width:32, height:32, borderRadius:6,
            background:i<entries.length?"rgba(96,165,250,0.18)":"rgba(255,255,255,0.025)",
            border:`1px solid ${i<entries.length?"#60a5fa":"rgba(255,255,255,0.07)"}`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:i<entries.length?"#93c5fd":"#1a2030",
            transition:"all 0.2s",
            boxShadow:i<entries.length?"0 0 6px rgba(96,165,250,0.2)":"none",
          }}>{i<entries.length?entries[i]:""}</div>
        ))}
        {capacity > 24 && <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:8, color:"#2d3748", padding:"6px" }}>+{capacity-24} more</div>}
      </div>

      <div style={{ display:"flex", gap:8, justifyContent:"center" }}>
        <button onClick={addEntry} style={{ padding:"5px 13px", borderRadius:20, background:"rgba(74,222,128,0.15)", border:"1px solid rgba(74,222,128,0.3)", fontFamily:"'JetBrains Mono',monospace", fontSize:9, fontWeight:700, color:"#4ade80" }}>+ Add Entry</button>
        <button onClick={remEntry} disabled={entries.length===0} style={{ padding:"5px 13px", borderRadius:20, background:"rgba(244,114,182,0.1)", border:"1px solid rgba(244,114,182,0.25)", fontFamily:"'JetBrains Mono',monospace", fontSize:9, fontWeight:700, color:entries.length?"#f472b6":"#2d3748" }}>− Remove</button>
        {needResize && !resizing && (
          <button onClick={doResize} style={{ padding:"5px 13px", borderRadius:20, background:"rgba(251,191,36,0.15)", border:"1px solid rgba(251,191,36,0.4)", fontFamily:"'JetBrains Mono',monospace", fontSize:9, fontWeight:700, color:"#fbbf24", animation:"pulse 1.2s ease-in-out infinite" }}>⚡ RESIZE ×2</button>
        )}
      </div>
      {resizing && (
        <div style={{ marginTop:10, textAlign:"center", fontFamily:"'JetBrains Mono',monospace", fontSize:9.5, color:"#fbbf24" }}>
          Rehashing {entries.length} entries into new capacity {capacity*2}…
        </div>
      )}
      <p style={{ marginTop:10, fontFamily:"'DM Sans',sans-serif", fontSize:11, color:"#475569", lineHeight:1.55 }}>
        When load factor exceeds 0.75, the map doubles capacity and rehashes all entries. This O(n) resize is rare — the amortized cost per insert stays O(1).
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VIS: Internals — language comparison
// ═══════════════════════════════════════════════════════════════════════════════
function VisInternals() {
  const [lang, setLang] = useState("python");
  const LANGS = {
    python: {
      name:"Python dict",
      color:"#4ec9b0",
      facts:[
        "Compact open addressing (not chaining) since Python 3.6",
        "Preserves insertion order since Python 3.7 (guaranteed)",
        "Uses 8-slot initial table, resizes at 2/3 capacity (load ≈ 0.67)",
        "String keys use cached __hash__, avoids recomputation",
        "PYTHONHASHSEED randomizes hash per interpreter process (security)",
      ],
      code:`# Python dict internals
d = {"a": 1, "b": 2}
d["a"]        # O(1)
"a" in d      # O(1)
d.get("c", 0) # O(1), default 0`,
    },
    java: {
      name:"Java HashMap",
      color:"#ed8b00",
      facts:[
        "Separate chaining with singly linked lists by default",
        "Converts chain to red-black tree when length > 8 (Java 8+)",
        "Reverts back to list when length falls below 6",
        "Default capacity 16, load factor 0.75",
        "Not thread-safe — use ConcurrentHashMap for concurrent access",
      ],
      code:`// Java HashMap
Map<String, Integer> map = new HashMap<>();
map.put("a", 1);
map.get("a");           // 1
map.getOrDefault("c", 0); // 0`,
    },
    js: {
      name:"JS Map / Object",
      color:"#f7df1e",
      facts:[
        "V8 uses hidden classes + inline caches for object property access",
        "JS Map (ES6) is a proper hash map with any key type",
        "Object keys must be strings or Symbols",
        "Map preserves insertion order, Object does mostly (spec quirks)",
        "Map.has() / Map.get() are O(1) average",
      ],
      code:`// JS Map (recommended)
const map = new Map();
map.set("a", 1);
map.get("a");     // 1
map.has("a");     // true
map.size;         // 1`,
    },
    cpp: {
      name:"C++ unordered_map",
      color:"#00b4d8",
      facts:[
        "Separate chaining, contiguous bucket array",
        "Default max load factor 1.0 (higher than Java/Python)",
        "std::hash<> specializations for built-in types",
        "Custom types need a hash function or std::hash specialization",
        "Worst case O(n) — prefer absl::flat_hash_map for performance",
      ],
      code:`// C++ unordered_map
unordered_map<string,int> m;
m["a"] = 1;
m.find("a") != m.end(); // exists?
m.count("a");           // 0 or 1`,
    },
  };
  const cur = LANGS[lang];
  return (
    <div>
      <div style={{ display:"flex", gap:6, justifyContent:"center", marginBottom:14, flexWrap:"wrap" }}>
        {Object.entries(LANGS).map(([k, v]) => (
          <button key={k} onClick={() => setLang(k)} style={{
            padding:"5px 12px", borderRadius:20, cursor:"pointer",
            background:lang===k?`${v.color}22`:"rgba(255,255,255,0.04)",
            border:`1px solid ${lang===k?v.color:"rgba(255,255,255,0.1)"}`,
            fontFamily:"'JetBrains Mono',monospace", fontSize:9, fontWeight:700,
            color:lang===k?v.color:"#475569", transition:"all 0.2s",
          }}>{v.name}</button>
        ))}
      </div>
      <div style={{ animation:"fUp 0.28s ease both" }} key={lang}>
        <div style={{ display:"flex", flexDirection:"column", gap:5, marginBottom:12 }}>
          {cur.facts.map((f,i) => (
            <div key={i} style={{ display:"flex", gap:8, alignItems:"flex-start", padding:"6px 10px", borderRadius:8, background:"rgba(255,255,255,0.02)", border:`1px solid ${cur.color}18`, animation:`sRight 0.3s ease ${i*0.06}s both` }}>
              <span style={{ color:cur.color, flexShrink:0, fontSize:11, marginTop:1 }}>▸</span>
              <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:"#94a3b8", lineHeight:1.55 }}>{f}</span>
            </div>
          ))}
        </div>
        <div style={{ padding:"10px 13px", borderRadius:11, background:"rgba(0,0,0,0.38)", border:"1px solid rgba(255,255,255,0.06)" }}>
          <pre style={{ margin:0, fontFamily:"'JetBrains Mono',monospace", fontSize:10.5, color:"#7dd3fc", lineHeight:1.7, whiteSpace:"pre-wrap" }}>{cur.code}</pre>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VIS: Applications — frequency counter + two-sum
// ═══════════════════════════════════════════════════════════════════════════════
function VisApplications() {
  const [tab, setTab] = useState("freq");

  // Frequency counter
  const [freqText, setFreqText] = useState("the quick brown fox jumps over the lazy dog the fox");
  const freqMap = (() => {
    const w = freqText.toLowerCase().split(/\s+/).filter(Boolean);
    const f = {};
    w.forEach(wd => f[wd] = (f[wd]||0)+1);
    return Object.entries(f).sort((a,b)=>b[1]-a[1]).slice(0,12);
  })();

  // Two Sum
  const [tsArr, setTsArr]   = useState("2,7,11,15");
  const [tsTarget, setTsTarget] = useState("9");
  const [tsResult, setTsResult] = useState(null);
  const [tsSteps, setTsSteps]   = useState([]);

  const runTwoSum = () => {
    const arr = tsArr.split(",").map(Number).filter(n => !isNaN(n));
    const target = parseInt(tsTarget);
    const seen = {};
    const steps = [];
    for (let i = 0; i < arr.length; i++) {
      const complement = target - arr[i];
      steps.push({ i, val:arr[i], complement, found: complement in seen, idx:seen[complement] });
      if (complement in seen) {
        setTsResult([seen[complement], i]);
        setTsSteps(steps);
        return;
      }
      seen[arr[i]] = i;
    }
    setTsResult(null);
    setTsSteps(steps);
  };

  return (
    <div>
      <div style={{ display:"flex", gap:7, justifyContent:"center", marginBottom:12 }}>
        {[["freq","📊 Word Frequency"],["twosum","🎯 Two‑Sum O(n)"]].map(([t,lbl]) => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding:"5px 12px", borderRadius:20, cursor:"pointer",
            background:tab===t?"rgba(167,139,250,0.18)":"rgba(255,255,255,0.04)",
            border:`1px solid ${tab===t?"#a78bfa":"rgba(255,255,255,0.1)"}`,
            fontFamily:"'JetBrains Mono',monospace", fontSize:9, fontWeight:700,
            color:tab===t?"#a78bfa":"#475569", transition:"all 0.2s",
          }}>{lbl}</button>
        ))}
      </div>

      {tab === "freq" ? (
        <div>
          <textarea value={freqText} onChange={e=>setFreqText(e.target.value)} rows={2}
            style={{ width:"100%", padding:"8px 10px", borderRadius:9, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", fontFamily:"'DM Sans',sans-serif", color:"#f8fafc", outline:"none", fontSize:12, marginBottom:10, resize:"none" }}/>
          <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
            {freqMap.map(([word,count],i) => (
              <div key={word} style={{
                padding:"4px 10px", borderRadius:20,
                background:`rgba(96,165,250,${0.06+count*0.04})`,
                border:`1px solid rgba(96,165,250,${0.2+count*0.05})`,
                fontFamily:"'JetBrains Mono',monospace", fontSize:10.5, color:"#93c5fd",
                animation:`fadeIn 0.2s ease ${i*0.04}s both`,
              }}>{word} <span style={{ color:"#60a5fa", fontWeight:700 }}>×{count}</span></div>
            ))}
          </div>
          <p style={{ marginTop:10, fontFamily:"'DM Sans',sans-serif", fontSize:11, color:"#475569", lineHeight:1.55 }}>
            Classic HashMap use case: O(n) frequency count in a single pass. No sorting needed.
          </p>
        </div>
      ) : (
        <div>
          <div style={{ display:"flex", gap:7, marginBottom:10, flexWrap:"wrap" }}>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:8, color:"#2d3748", marginBottom:3 }}>ARRAY (comma-separated)</div>
              <input value={tsArr} onChange={e=>setTsArr(e.target.value)} style={{ width:"100%", padding:"6px 10px", borderRadius:8, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", fontFamily:"'JetBrains Mono',monospace", fontSize:12, color:"#f8fafc", outline:"none" }}/>
            </div>
            <div style={{ width:80 }}>
              <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:8, color:"#2d3748", marginBottom:3 }}>TARGET</div>
              <input value={tsTarget} onChange={e=>setTsTarget(e.target.value)} style={{ width:"100%", padding:"6px 10px", borderRadius:8, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", fontFamily:"'JetBrains Mono',monospace", fontSize:12, color:"#f8fafc", outline:"none" }}/>
            </div>
            <button onClick={runTwoSum} style={{ alignSelf:"flex-end", padding:"6px 16px", borderRadius:20, background:"rgba(167,139,250,0.15)", border:"1px solid rgba(167,139,250,0.35)", fontFamily:"'JetBrains Mono',monospace", fontSize:9, fontWeight:700, color:"#a78bfa" }}>RUN</button>
          </div>
          {tsSteps.length > 0 && (
            <>
              <div style={{ display:"flex", flexDirection:"column", gap:3, marginBottom:9 }}>
                {tsSteps.map((s,i) => (
                  <div key={i} style={{ display:"flex", gap:8, alignItems:"center", padding:"4px 8px", borderRadius:7, background:s.found?"rgba(74,222,128,0.1)":"rgba(255,255,255,0.02)", border:`1px solid ${s.found?"rgba(74,222,128,0.3)":"rgba(255,255,255,0.05)"}`, animation:`fadeIn 0.15s ease ${i*0.04}s both` }}>
                    <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:"#475569" }}>i={s.i}</span>
                    <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:"#60a5fa" }}>val={s.val}</span>
                    <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:"#2d3748" }}>need={s.complement}</span>
                    <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:s.found?"#4ade80":"#f87171", marginLeft:"auto" }}>{s.found?"✓ FOUND!":"map miss"}</span>
                  </div>
                ))}
              </div>
              {tsResult ? (
                <div style={{ padding:"9px 14px", borderRadius:10, background:"rgba(74,222,128,0.1)", border:"1px solid rgba(74,222,128,0.3)", textAlign:"center", fontFamily:"'JetBrains Mono',monospace", fontSize:12, fontWeight:700, color:"#4ade80" }}>
                  Indices [{tsResult[0]}, {tsResult[1]}] — O(n) solution using HashMap!
                </div>
              ) : (
                <div style={{ padding:"9px 14px", borderRadius:10, background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.25)", textAlign:"center", fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:"#f87171" }}>No solution found</div>
              )}
            </>
          )}
          <p style={{ marginTop:10, fontFamily:"'DM Sans',sans-serif", fontSize:11, color:"#475569", lineHeight:1.55 }}>
            Without HashMap: O(n²) nested loops. With HashMap: one pass, O(n). HashMap turns a brute-force solution into a linear one.
          </p>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPLEXITY TABLE
// ═══════════════════════════════════════════════════════════════════════════════
function ComplexityTable() {
  const [hov, setHov] = useState(null);
  const rows = [
    { nm:"put / insert",  c:"#4ade80", avg:"O(1)", wc:"O(n)", sp:"O(1)", n:"O(n) only when all keys collide into one bucket — rare with good hash." },
    { nm:"get / lookup",  c:"#4ade80", avg:"O(1)", wc:"O(n)", sp:"O(1)", n:"Same bucket walk as put. Hash quality determines actual speed." },
    { nm:"remove",        c:"#4ade80", avg:"O(1)", wc:"O(n)", sp:"O(1)", n:"Hash + chain walk + pointer update." },
    { nm:"containsKey",   c:"#4ade80", avg:"O(1)", wc:"O(n)", sp:"O(1)", n:"Equivalent to get — just returns boolean." },
    { nm:"size",          c:"#4ade80", avg:"O(1)", wc:"O(1)", sp:"O(1)", n:"Maintained as a counter field, never recomputed." },
    { nm:"iteration",     c:"#fbbf24", avg:"O(n)", wc:"O(n)", sp:"O(1)", n:"Must visit every bucket and every entry." },
    { nm:"resize",        c:"#60a5fa", avg:"O(n)", wc:"O(n)", sp:"O(n)", n:"Rare O(n) event, amortized to O(1) per insert." },
    { nm:"space",         c:"#a78bfa", avg:"O(n)", wc:"O(n)", sp:"—",    n:"Proportional to entries. Load factor controls density." },
  ];
  return (
    <div style={{ overflowX:"auto" }}>
      <table style={{ width:"100%", borderCollapse:"collapse", minWidth:480 }}>
        <thead>
          <tr>{["Operation","Average","Worst","Space","Notes"].map(h=>(
            <th key={h} style={{ padding:"10px 14px", textAlign:"left", fontFamily:"'JetBrains Mono',monospace", fontSize:9, letterSpacing:"0.1em", color:"#2d3748", borderBottom:"1px solid rgba(255,255,255,0.06)", fontWeight:700, whiteSpace:"nowrap" }}>{h}</th>
          ))}</tr>
        </thead>
        <tbody>
          {rows.map((r,i)=>(
            <tr key={i} onMouseEnter={()=>setHov(i)} onMouseLeave={()=>setHov(null)}
              style={{ borderBottom:"1px solid rgba(255,255,255,0.04)", background:hov===i?"rgba(255,255,255,0.025)":"transparent", transition:"background 0.2s" }}>
              <td style={{ padding:"10px 14px", whiteSpace:"nowrap" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ width:7, height:7, borderRadius:"50%", background:r.c, flexShrink:0, boxShadow:hov===i?`0 0 8px ${r.c}`:"none", transition:"box-shadow 0.2s" }}/>
                  <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, fontWeight:700, color:"#e2e8f0" }}>{r.nm}</span>
                </div>
              </td>
              {[r.avg,r.wc,r.sp].map((v,j)=>(
                <td key={j} style={{ padding:"10px 14px", fontFamily:"'JetBrains Mono',monospace", fontSize:11, fontWeight:v.includes("O(1)")?700:400, color:v.includes("O(1)")?"#4ade80":v==="O(n)"?"#ef4444":"#94a3b8", whiteSpace:"nowrap" }}>{v}</td>
              ))}
              <td style={{ padding:"10px 14px", fontFamily:"'DM Sans',sans-serif", fontSize:11, color:"#475569" }}>{r.n}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SHORTCUTS MODAL
// ═══════════════════════════════════════════════════════════════════════════════
function ShortcutsModal({ open, onClose }) {
  if (!open) return null;
  return (
    <div style={{ position:"fixed",inset:0,zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.74)",backdropFilter:"blur(10px)",animation:"fadeIn 0.2s ease" }} onClick={onClose}>
      <div style={{ background:"rgba(5,8,20,0.98)", border:"1px solid rgba(96,165,250,0.3)", borderRadius:24, padding:"32px 36px", maxWidth:400, width:"calc(100% - 40px)", boxShadow:"0 24px 80px rgba(0,0,0,0.9)", animation:"popIn 0.25s cubic-bezier(0.22,1,0.36,1) both" }} onClick={e=>e.stopPropagation()}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
          <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:800, color:"#f8fafc", margin:0 }}>⌨️ Shortcuts</h3>
          <button onClick={onClose} style={{ background:"none", border:"1px solid rgba(255,255,255,0.1)", color:"#64748b", cursor:"pointer", borderRadius:8, padding:"4px 10px", fontFamily:"'JetBrains Mono',monospace", fontSize:10 }}>ESC</button>
        </div>
        {[["S","Stop narration"],["↑ / ↓","Navigate sections"],["?","Toggle shortcuts"],["Esc","Close panels"]].map(([k,d]) => (
          <div key={k} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
            <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, color:"#94a3b8" }}>{d}</span>
            <kbd style={{ background:"rgba(96,165,250,0.15)", border:"1px solid rgba(96,165,250,0.35)", borderRadius:6, padding:"3px 10px", fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:"#93c5fd", fontWeight:700 }}>{k}</kbd>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONFETTI
// ═══════════════════════════════════════════════════════════════════════════════
function Confetti() {
  const pieces = Array.from({ length:32 }, (_,i) => ({
    id:i, x:Math.random()*100, delay:Math.random()*0.8,
    dur:1.8+Math.random()*1.2,
    color:["#60a5fa","#f472b6","#4ade80","#fbbf24","#a78bfa","#fb923c"][i%6],
    size:6+Math.random()*6,
  }));
  return (
    <div style={{ position:"fixed",inset:0,pointerEvents:"none",zIndex:3000,overflow:"hidden" }}>
      {pieces.map(p=>(
        <div key={p.id} style={{ position:"absolute",top:"-10%",left:`${p.x}%`,width:p.size,height:p.size,borderRadius:p.id%3===0?"50%":2,background:p.color,animation:`confettiFall ${p.dur}s ease-in ${p.delay}s both` }}/>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// QUIZ
// ═══════════════════════════════════════════════════════════════════════════════
function Quiz({ onDone }) {
  const QS = [
    { q:"What is the average time complexity of get() in a hash map?", opts:["O(log n)","O(n)","O(1)","O(n log n)"], ans:2, exp:"O(1) on average. The hash function computes the bucket in constant time, and traversal is O(1) on average when the load factor is controlled." },
    { q:"Two different keys produce the same bucket index. This is called:", opts:["A hash miss","A collision","A load overflow","Chaining"], ans:1, exp:"A collision — when two distinct keys map to the same bucket index. Collisions are handled by chaining or open addressing." },
    { q:"Java HashMap converts a long chain to a red-black tree when chain length exceeds:", opts:["4","6","8","16"], ans:2, exp:"8 — Java 8+ converts chains longer than 8 to red-black trees, giving O(log n) worst case instead of O(n)." },
    { q:"A HashMap's load factor is 0.75. It has capacity 16. At how many entries does it resize?", opts:["8","12","16","20"], ans:1, exp:"12 — entries / capacity = 12 / 16 = 0.75. The 13th insertion triggers a resize to capacity 32." },
    { q:"Which technique stores multiple entries per bucket using a linked list?", opts:["Open addressing","Linear probing","Separate chaining","Robin Hood hashing"], ans:2, exp:"Separate chaining — each bucket stores a linked list. Java HashMap and most textbook implementations use this." },
    { q:"The Two‑Sum problem is solved in O(n) (instead of O(n²)) by:", opts:["Binary search","Sorting first","A HashMap storing complement lookups","A priority queue"], ans:2, exp:"A HashMap lets you look up the complement in O(1) during a single pass. O(n) total vs O(n²) for brute force." },
  ];

  const [ans,  setAns]  = useState({});
  const [rev,  setRev]  = useState({});
  const score    = Object.entries(ans).filter(([qi,ai]) => QS[+qi].ans === +ai).length;
  const answered = Object.keys(rev).length;
  useEffect(() => { if (answered===QS.length) onDone?.(score,QS.length); }, [rev]);

  return (
    <div>
      <div style={{ marginBottom:20 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:"#2d3748" }}>PROGRESS</span>
          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:"#60a5fa", fontWeight:700 }}>{answered}/{QS.length}</span>
        </div>
        <div style={{ height:4, background:"rgba(255,255,255,0.06)", borderRadius:99, overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${(answered/QS.length)*100}%`, background:"linear-gradient(90deg,#3b82f6,#ec4899)", borderRadius:99, transition:"width 0.5s cubic-bezier(0.22,1,0.36,1)" }}/>
        </div>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
        {QS.map((q,qi) => {
          const isR=rev[qi];
          const bc=isR?(ans[qi]===q.ans?"rgba(74,222,128,0.35)":"rgba(239,68,68,0.35)"):"rgba(255,255,255,0.07)";
          return (
            <div key={qi} style={{ padding:"16px 18px", borderRadius:16, background:"rgba(255,255,255,0.02)", border:`1px solid ${bc}`, transition:"border-color 0.3s" }}>
              <div style={{ display:"flex", gap:10, marginBottom:12, alignItems:"flex-start" }}>
                <span style={{ width:24, height:24, borderRadius:8, flexShrink:0, marginTop:1, background:isR?(ans[qi]===q.ans?"rgba(74,222,128,0.2)":"rgba(239,68,68,0.2)"):"rgba(96,165,250,0.15)", border:`1px solid ${isR?(ans[qi]===q.ans?"rgba(74,222,128,0.42)":"rgba(239,68,68,0.42)"):"rgba(96,165,250,0.32)"}`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'JetBrains Mono',monospace", fontSize:9, fontWeight:700, color:isR?(ans[qi]===q.ans?"#4ade80":"#ef4444"):"#60a5fa" }}>{qi+1}</span>
                <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:600, color:"#e2e8f0", lineHeight:1.52 }}>{q.q}</div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7 }}>
                {q.opts.map((opt,oi) => {
                  const isSel=ans[qi]===oi, isCorr=q.ans===oi;
                  let bg="rgba(255,255,255,0.03)", brd="rgba(255,255,255,0.07)", col="#64748b";
                  if (isR) { if(isCorr){bg="rgba(74,222,128,0.12)";brd="rgba(74,222,128,0.38)";col="#4ade80";}else if(isSel){bg="rgba(239,68,68,0.12)";brd="rgba(239,68,68,0.38)";col="#f87171";}else col="#2d3748"; }
                  else if (isSel) { bg="rgba(96,165,250,0.12)";brd="rgba(96,165,250,0.38)";col="#93c5fd"; }
                  return (
                    <button key={oi} onClick={() => !isR&&setAns(a=>({...a,[qi]:oi}))} style={{ padding:"9px 12px", borderRadius:10, cursor:isR?"default":"pointer", background:bg, border:`1px solid ${brd}`, fontFamily:"'DM Sans',sans-serif", fontSize:13, color:col, textAlign:"left", transition:"all 0.22s", display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ width:19, height:19, borderRadius:"50%", flexShrink:0, background:isR?(isCorr?"rgba(74,222,128,0.26)":isSel?"rgba(239,68,68,0.26)":"rgba(255,255,255,0.04)"):(isSel?"rgba(96,165,250,0.26)":"rgba(255,255,255,0.04)"), border:`1px solid ${col}50`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'JetBrains Mono',monospace", fontSize:9, fontWeight:700, color:col }}>{isR&&isCorr?"✓":isR&&isSel&&!isCorr?"✗":String.fromCharCode(65+oi)}</span>
                      {opt}
                    </button>
                  );
                })}
              </div>
              {ans[qi]!==undefined&&!isR&&(
                <button onClick={() => setRev(r=>({...r,[qi]:true}))} style={{ marginTop:10, padding:"6px 18px", borderRadius:20, cursor:"pointer", background:"rgba(96,165,250,0.12)", border:"1px solid rgba(96,165,250,0.3)", fontFamily:"'JetBrains Mono',monospace", fontSize:9, fontWeight:700, color:"#60a5fa" }}>CHECK →</button>
              )}
              {isR&&(
                <div style={{ marginTop:10, padding:"9px 12px", borderRadius:10, background:ans[qi]===q.ans?"rgba(74,222,128,0.07)":"rgba(239,68,68,0.07)", border:`1px solid ${ans[qi]===q.ans?"rgba(74,222,128,0.2)":"rgba(239,68,68,0.2)"}`, fontFamily:"'DM Sans',sans-serif", fontSize:12.5, color:"#94a3b8", lineHeight:1.58, animation:"fUp 0.3s ease" }}>
                  <span style={{ fontWeight:700, color:ans[qi]===q.ans?"#4ade80":"#f87171" }}>{ans[qi]===q.ans?"✓ Correct! ":"✗ Not quite — "}</span>{q.exp}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function HashMapPage() {
  const [speaking,      setSpeaking]      = useState(null);
  const [active,        setActive]        = useState("intro");
  const [navOpen,       setNavOpen]       = useState(true);
  const [qScore,        setQScore]        = useState(null);
  const [qTotal,        setQTotal]        = useState(null);
  const [speed,         setSpeed]         = useState(1.25);
  const [seenSections,  setSeenSections]  = useState(new Set());
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [showConfetti,  setShowConfetti]  = useState(false);
  const currentNarr = useRef(null);

  useEffect(() => {
    const lk = document.createElement("link");
    lk.rel = "stylesheet";
    lk.href = "https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;700&display=swap";
    document.head.appendChild(lk);
    const warm = () => { window.speechSynthesis?.getVoices(); window.removeEventListener("click", warm); };
    window.addEventListener("click", warm);
    return () => { try { document.head.removeChild(lk); } catch {} };
  }, []);

  useEffect(() => {
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { setActive(e.target.id); setSeenSections(s => new Set([...s, e.target.id])); }
    }), { rootMargin:"-35% 0px -35% 0px" });
    NAV_SECTIONS.forEach(s => { const el = document.getElementById(s.id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const onKey = e => {
      if (e.target.tagName==="INPUT"||e.target.tagName==="TEXTAREA") return;
      if (e.key==="?"||e.key==="/") { e.preventDefault(); setShortcutsOpen(o=>!o); }
      if (e.key==="Escape") setShortcutsOpen(false);
      if (e.key==="s"||e.key==="S") { voiceStop(); setSpeaking(null); }
      if (e.key==="ArrowDown") { e.preventDefault(); const idx=NAV_SECTIONS.findIndex(s=>s.id===active); const next=NAV_SECTIONS[Math.min(idx+1,NAV_SECTIONS.length-1)]; if(next) document.getElementById(next.id)?.scrollIntoView({ behavior:"smooth" }); }
      if (e.key==="ArrowUp")   { e.preventDefault(); const idx=NAV_SECTIONS.findIndex(s=>s.id===active); const prev=NAV_SECTIONS[Math.max(idx-1,0)]; if(prev) document.getElementById(prev.id)?.scrollIntoView({ behavior:"smooth" }); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  const handleVoice = useCallback((id, text) => {
    if (speaking===id) { voiceStop(); setSpeaking(null); currentNarr.current=null; }
    else { currentNarr.current={id,text}; setSpeaking(id); voiceSpeak(text, () => { setSpeaking(null); currentNarr.current=null; }, currentRate); }
  }, [speaking]);

  const handleRestart = useCallback(() => {
    if (currentNarr.current) { const {id,text}=currentNarr.current; voiceStop(); setTimeout(() => voiceSpeak(text, () => { setSpeaking(null); currentNarr.current=null; }, currentRate), 80); }
  }, []);

  const handleStop = useCallback(() => { voiceStop(); setSpeaking(null); currentNarr.current=null; }, []);

  const speakingLabel = speaking ? (NAV_SECTIONS.find(s=>s.id===speaking)?.label ?? (speaking==="__hero__"?"Introduction":speaking)) : null;
  const goIntro = () => document.getElementById("intro")?.scrollIntoView({ behavior:"smooth" });

  const SECTS = [
    { id:"intro",      icon:"🗺️", title:"What is a Hash Map?",          color:"#60a5fa", voice:NARR.intro,     visual:<VisIntro/>,       cards:[
        { lbl:"KEY‑VALUE STORAGE", body:"Stores pairs of (key, value). Access any value instantly by its key — no scanning, no sorting needed." },
        { lbl:"O(1) OPERATIONS",   body:"On average, every core operation — put, get, delete — takes constant time regardless of how many entries are in the map." },
        { lbl:"THE MECHANISM",     body:"A hash function converts your key to an array index. Store and retrieve in that slot. It's an array with a smart address book." },
        { lbl:"EVERYWHERE",        body:"Python dict, JS object/Map, Java HashMap, C++ unordered_map, Redis keys — hash maps are the most widely used data structure in production code." },
      ]},
    { id:"ops",        icon:"⚡",  title:"Core Operations",               color:"#4ade80", voice:NARR.ops,       visual:<VisOps/>,         cards:[
        { lbl:"PUT — O(1) avg",        body:"Insert or update. If key exists, overwrite. If not, add new entry. The map grows as needed." },
        { lbl:"GET — O(1) avg",        body:"Look up by key. Returns the value, or null/undefined if the key doesn't exist. Never traverses the whole map." },
        { lbl:"REMOVE — O(1) avg",     body:"Delete a key-value pair. The map shrinks its logical size but may not immediately free memory." },
        { lbl:"WHY CONSTANT TIME",     body:"The hash function always goes directly to the right bucket — no binary search, no linear scan. Direct addressing." },
      ]},
    { id:"hash",       icon:"#️⃣",  title:"How Hash Functions Work",       color:"#f472b6", voice:NARR.hash,      visual:<VisHash/>,        cards:[
        { lbl:"WHAT IT DOES",       body:"Takes any key (string, integer, object) and converts it to a non-negative integer deterministically." },
        { lbl:"MODULO REDUCTION",   body:"Raw hash is reduced to a valid index: index = |hash(key)| % capacity. This maps any integer to [0, capacity-1]." },
        { lbl:"GOOD HASH = UNIFORM", body:"A good hash function distributes keys evenly. If 1000 keys all land in bucket 3, your O(1) becomes O(n)." },
        { lbl:"DETERMINISM",        body:"Same key ALWAYS produces same hash. If 'hello' hashes to 5 at put(), it must hash to 5 at get() — otherwise you can never find it." },
      ]},
    { id:"collisions", icon:"💥",  title:"Collisions & Collision Handling", color:"#f59e0b", voice:NARR.collisions, visual:<VisCollisions/>, cards:[
        { lbl:"WHY COLLISIONS HAPPEN",  body:"With n keys and m buckets, if n > m then by pigeonhole principle, at least one bucket must hold 2+ keys. Unavoidable." },
        { lbl:"SEPARATE CHAINING",      body:"Each bucket holds a linked list. Collisions just extend the list. Simple, works well at high load. Used by Java HashMap." },
        { lbl:"OPEN ADDRESSING",        body:"No linked list. On collision, probe for the next empty slot. Linear probing checks i+1, i+2, etc. More cache-friendly." },
        { lbl:"BIRTHDAY PARADOX",       body:"With just 23 people, 50% chance two share a birthday. Hash maps face the same math — collisions happen earlier than intuition suggests." },
      ]},
    { id:"impl",       icon:"🔧",  title:"Implementation Deep Dive",       color:"#818cf8", voice:NARR.impl,      visual:<VisImpl/>,        cards:[
        { lbl:"ARRAY + LINKED LISTS",   body:"The classic: an array of size 16 (or any power of 2). Each slot holds the head of a linked list for that bucket." },
        { lbl:"THE PUT ALGORITHM",      body:"Hash key → index. Walk bucket's list. If key found, update value. If not found, prepend new node. Increment size." },
        { lbl:"THE GET ALGORITHM",      body:"Hash key → same index. Walk bucket's list. Compare keys. Return value on match. Return null if exhausted." },
        { lbl:"POWER OF 2 SIZES",       body:"Capacity is always a power of 2. Then index = hash & (capacity-1) is faster than modulo. This is what Java does." },
      ]},
    { id:"resizing",   icon:"📈",  title:"Load Factor & Resizing",         color:"#34d399", voice:NARR.resizing,  visual:<VisResizing/>,    cards:[
        { lbl:"LOAD FACTOR FORMULA",   body:"loadFactor = entries / capacity. When this exceeds 0.75 (Java default), performance degrades and resize triggers." },
        { lbl:"RESIZE = DOUBLE + REHASH", body:"New array is 2× larger. Every existing entry is re-inserted (rehashed) into the new array. O(n) but rare." },
        { lbl:"AMORTIZED ANALYSIS",    body:"If you do n insertions and resize happens at 1, 2, 4, 8... n: total rehash work = 1+2+4+...+n = 2n = O(n). Divided by n inserts: O(1) per insert." },
        { lbl:"TRADE-OFF",             body:"Lower load factor (e.g. 0.5) = fewer collisions, faster lookups, but 2× memory waste. Higher = denser, slower. 0.75 is the sweet spot." },
      ]},
    { id:"internals",  icon:"⚙️",  title:"Language Internals",              color:"#fb923c", voice:NARR.internals, visual:<VisInternals/>,  cards:[
        { lbl:"PYTHON DICT",     body:"Compact open addressing, insertion-order guaranteed (3.7+), load factor ≈ 0.67. String keys cache their hash. Extremely optimized." },
        { lbl:"JAVA HASHMAP",    body:"Separate chaining. Chains > 8 nodes convert to red-black trees (Java 8) for O(log n) worst case. Not thread-safe." },
        { lbl:"JS Map vs Object",body:"Use Map when keys are not strings, when order matters, or when you need size. Object is fine for simple string-keyed data." },
        { lbl:"C++ unordered_map",body:"Separate chaining by default. Custom hash needed for custom types. absl::flat_hash_map is 2-3× faster for most workloads." },
      ]},
    { id:"apps",       icon:"🌍",  title:"Real-World Applications",        color:"#a78bfa", voice:NARR.apps,      visual:<VisApplications/>, cards:[
        { lbl:"TWO-SUM (LEETCODE)",  body:"O(n) solution: as you scan the array, store each value in a map. For each element, check if its complement already exists." },
        { lbl:"MEMOIZATION",         body:"Recursive functions cache their results: if map[input] exists, return it immediately. Fibonacci O(2^n) → O(n)." },
        { lbl:"ANAGRAM DETECTION",   body:"Count character frequencies with a map. Two strings are anagrams iff their frequency maps are equal. O(n) time." },
        { lbl:"ADJACENCY LIST (GRAPHS)", body:"Graph edges stored as map[node] = [neighbors]. O(1) to check if a node exists, O(degree) to iterate its edges." },
      ]},
  ];

  return (
    <div style={{ background:"#030612", color:"#f8fafc", minHeight:"100vh", overflowX:"hidden" }}>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        ::selection{background:rgba(96,165,250,0.4)}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(96,165,250,0.35);border-radius:8px}
        ::-webkit-scrollbar-thumb:hover{background:rgba(96,165,250,0.55)}

        @keyframes orb1{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(24px,-18px) scale(1.05)}66%{transform:translate(-14px,11px) scale(0.97)}}
        @keyframes orb2{0%,100%{transform:translate(0,0)}42%{transform:translate(-22px,16px)}84%{transform:translate(16px,-10px)}}
        @keyframes opLabelIn{from{opacity:0;transform:scale(0.85) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes sRight{from{opacity:0;transform:translateX(26px)}to{opacity:1;transform:translateX(0)}}
        @keyframes fUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes popIn{from{opacity:0;transform:scale(0.88) translateY(12px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes panelPop{from{opacity:0;transform:translateY(-8px) scale(0.96)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes slideUp{from{opacity:0;transform:translate(-50%,20px)}to{opacity:1;transform:translate(-50%,0)}}
        @keyframes wave{0%,100%{transform:scaleY(0.4)}50%{transform:scaleY(1)}}
        @keyframes confettiFall{0%{transform:translateY(0) rotate(0deg);opacity:1}80%{opacity:1}100%{transform:translateY(110vh) rotate(720deg);opacity:0}}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.85;transform:scale(1.03)}}

        @media(max-width:760px){
          .sg{grid-template-columns:1fr !important}
        }
      `}</style>

      {showConfetti && <Confetti/>}
      <ProgressBar/>
      <BackToTop/>
      <ShortcutsModal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)}/>
      <MiniPlayer speaking={speaking} speakingLabel={speakingLabel} onStop={handleStop} speed={speed}/>
      <RightSidebar active={active} speaking={speaking} speed={speed} setSpeed={setSpeed} onRestart={handleRestart} seenCount={seenSections.size} open={navOpen} setOpen={setNavOpen}/>

      <Hero onStart={goIntro} onVoice={() => handleVoice("__hero__", NARR.intro)}/>

      <div style={{ textAlign:"center", marginBottom:32, fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:"#1e2a38", letterSpacing:"0.1em" }}>
        PRESS <kbd style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:5, padding:"1px 7px", color:"#2d3748" }}>?</kbd> FOR KEYBOARD SHORTCUTS
      </div>

      <main style={{ maxWidth:1000, margin:"0 auto", padding:"0 20px 100px" }}>
        {SECTS.map(s => (
          <Sect key={s.id} id={s.id} icon={s.icon} title={s.title}
            color={s.color} visual={s.visual} cards={s.cards}
            voice={s.voice} speaking={speaking} onVoice={handleVoice}
            seen={seenSections.has(s.id)}/>
        ))}

        {/* Complexity table */}
        <section id="complexity" style={{ marginBottom:80 }}>
          <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:22, flexWrap:"wrap" }}>
            <div style={{ width:50, height:50, borderRadius:16, flexShrink:0, background:"rgba(96,165,250,0.12)", border:"1px solid rgba(96,165,250,0.32)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, boxShadow:"0 0 28px rgba(96,165,250,0.15)" }}>⚡</div>
            <div>
              <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:"clamp(19px,3.8vw,30px)", fontWeight:800, color:"#f8fafc" }}>Complexity Cheat Sheet</h2>
              <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:"#2d3748", marginTop:3, letterSpacing:"0.08em" }}>GREEN = O(1) FAST · YELLOW = AMORTIZED · RED = SLOW · HOVER ROWS</p>
            </div>
          </div>
          <div style={{ borderRadius:22, overflow:"hidden", background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)" }}>
            <ComplexityTable/>
          </div>
          <div style={{ marginTop:12, padding:"10px 16px", borderRadius:12, background:"rgba(96,165,250,0.06)", border:"1px solid rgba(96,165,250,0.15)", fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:"#60a5fa" }}>
            * Worst‑case O(n) occurs only if all keys collide into one bucket — a degenerate hash function or adversarial input. A good hash + 0.75 load factor makes this astronomically rare.
          </div>
        </section>

        {/* Quiz */}
        <section id="quiz" style={{ marginBottom:80 }}>
          <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:8, flexWrap:"wrap" }}>
            <div style={{ width:50, height:50, borderRadius:16, flexShrink:0, background:"rgba(236,72,153,0.12)", border:"1px solid rgba(236,72,153,0.32)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, boxShadow:"0 0 28px rgba(236,72,153,0.15)" }}>🧠</div>
            <div style={{ flex:1, minWidth:0 }}>
              <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:"clamp(19px,3.8vw,30px)", fontWeight:800, color:"#f8fafc" }}>Test Your Knowledge</h2>
              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:"#475569", marginTop:3 }}>6 questions · covers every section · some are tricky</p>
            </div>
            <button onClick={() => handleVoice("quiz", NARR.quiz)} style={{
              display:"flex", alignItems:"center", gap:7,
              padding:"7px 14px", borderRadius:28, cursor:"pointer", flexShrink:0,
              background:speaking==="quiz"?"rgba(236,72,153,0.2)":"rgba(255,255,255,0.04)",
              border:`1.5px solid ${speaking==="quiz"?"#ec4899":"rgba(255,255,255,0.1)"}`,
              fontFamily:"'JetBrains Mono',monospace", fontSize:9, fontWeight:700,
              color:speaking==="quiz"?"#ec4899":"#475569", transition:"all 0.22s",
            }}>
              {speaking==="quiz"?<SpeakingWave color="#ec4899" size={12}/>:<span style={{ fontSize:12 }}>🔊</span>}
              {speaking==="quiz"?"STOP":"LISTEN"}
            </button>
          </div>
          <div style={{ marginBottom:22 }}/>
          <Quiz onDone={(sc,tot) => {
            setQScore(sc); setQTotal(tot);
            if (sc>=tot) { setShowConfetti(true); setTimeout(() => setShowConfetti(false), 4000); }
          }}/>

          {qScore !== null && (
            <div style={{
              marginTop:30, padding:"36px 24px", borderRadius:24, textAlign:"center",
              background:`linear-gradient(138deg,${qScore>=5?"rgba(74,222,128,0.1)":qScore>=3?"rgba(251,191,36,0.1)":"rgba(239,68,68,0.1)"} 0%,rgba(0,0,0,0) 100%)`,
              border:`1px solid ${qScore>=5?"rgba(74,222,128,0.32)":qScore>=3?"rgba(251,191,36,0.32)":"rgba(239,68,68,0.32)"}`,
              animation:"fUp 0.5s ease",
            }}>
              <div style={{ fontSize:52, marginBottom:12 }}>{qScore>=5?"🏆":qScore>=3?"🌟":"💪"}</div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:40, fontWeight:800, color:qScore>=5?"#4ade80":qScore>=3?"#fbbf24":"#f87171" }}>{qScore} / {qTotal}</div>
              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:15, color:"#94a3b8", margin:"10px 0 24px", lineHeight:1.55 }}>
                {qScore>=5?"Outstanding! You have genuinely mastered hash maps.":qScore>=3?"Solid progress. Review the sections you missed and retry.":"Great start — re-read the sections above and come back stronger."}
              </p>
              <div style={{ display:"inline-block", padding:"12px 28px", borderRadius:16, background:"linear-gradient(135deg,#3b82f6,#ec4899)", fontFamily:"'Syne',sans-serif", fontSize:15, fontWeight:700, color:"#fff" }}>
                🗺️ Hash Map Complete — Explore Graphs Next
              </div>
            </div>
          )}
        </section>

        {/* Footer CTA */}
        <div style={{
          textAlign:"center", padding:"48px 24px", borderRadius:26,
          background:"linear-gradient(140deg,rgba(96,165,250,0.09) 0%,rgba(74,222,128,0.07) 50%,rgba(244,114,182,0.06) 100%)",
          border:"1px solid rgba(96,165,250,0.18)", position:"relative", overflow:"hidden",
        }}>
          <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(circle,rgba(96,165,250,0.04) 1px,transparent 1px)", backgroundSize:"30px 30px", pointerEvents:"none" }}/>
          <div style={{ fontSize:48, marginBottom:14 }}>🗺️</div>
          <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:"clamp(17px,3.2vw,26px)", fontWeight:800, color:"#f8fafc", marginBottom:12 }}>You've completed the Hash Map guide!</h3>
          <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, color:"#64748b", maxWidth:440, margin:"0 auto 28px", lineHeight:1.72 }}>
            Now implement one from scratch: array of linked lists, put/get/remove, and resize at 0.75. Writing the code makes every concept permanent.
          </p>
          <div style={{ display:"flex", gap:6, justifyContent:"center", flexWrap:"wrap", marginBottom:16 }}>
            {NAV_SECTIONS.map(s => (
              <div key={s.id} style={{
                padding:"4px 12px", borderRadius:20,
                background:seenSections.has(s.id)?`${s.col}18`:"rgba(255,255,255,0.03)",
                border:`1px solid ${seenSections.has(s.id)?`${s.col}38`:"rgba(255,255,255,0.06)"}`,
                fontFamily:"'JetBrains Mono',monospace", fontSize:9, fontWeight:700,
                color:seenSections.has(s.id)?s.col:"#1a2030", transition:"all 0.3s",
              }}>{s.icon} {s.label} {seenSections.has(s.id)?"✓":""}</div>
            ))}
          </div>
          <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:"#2d3748", marginBottom:22 }}>{seenSections.size} / {NAV_SECTIONS.length} sections visited</div>
        </div>
      </main>
    </div>
  );
}