"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

// ═══════════════════════════════════════════════════════════════════════════════
// VOICE ENGINE — Male human-like voice, variable speed
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
    v => /Natural/i.test(v.name) && /male|man|guy|ryan|davis|mark|daniel|alex|james|chris|liam|aaron|arthur|oliver|george/i.test(v.name) && v.lang.startsWith("en"),
    v => /Neural/i.test(v.name) && v.lang.startsWith("en-US") && !/aria|jenny|zira|hazel|susan|linda|eva|natasha|heather|karen|samantha|victoria/i.test(v.name),
    v => v.lang.startsWith("en-GB"),
    v => v.lang.startsWith("en-AU"),
    v => v.lang.startsWith("en"),
  ];
  for (const fn of picks) { const m = all.find(fn); if (m) return m; }
  return all[0] ?? null;
}

let currentRate = 1.25;

function voiceSpeak(text, onEnd, rate) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const speed = rate ?? currentRate;
  const go = () => {
    const u = new SpeechSynthesisUtterance(text);
    u.rate  = speed;
    u.pitch = 0.92;
    u.volume = 1;
    const v = getMaleVoice();
    if (v) u.voice = v;
    u.onend   = onEnd;
    u.onerror = () => onEnd?.();
    window.speechSynthesis.speak(u);
  };
  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.onvoiceschanged = () => { go(); window.speechSynthesis.onvoiceschanged = null; };
  } else { go(); }
}
function voiceStop() { typeof window !== "undefined" && window.speechSynthesis?.cancel(); }

// ═══════════════════════════════════════════════════════════════════════════════
// NARRATIONS
// ═══════════════════════════════════════════════════════════════════════════════
const NARR = {
  intro: `An array is the most fundamental data structure in computer science. Imagine a row of numbered mailboxes in a post office — each box has a fixed address and holds exactly one item. That is an array. Elements are stored in contiguous memory locations, meaning they sit right next to each other with no gaps. This gives arrays their superpower: accessing any element by its index takes exactly the same time, whether it is the first element or the millionth. Arrays are everywhere — your pixels on screen are an array, a song file is an array of audio samples, and almost every algorithm you will ever write touches an array.`,
  memory: `Understanding how arrays live in memory is the key to mastering them. When you create an array of integers, the system reserves a single unbroken block of memory. Each integer occupies four bytes, so element zero is at base address, element one is at base plus four, element two at base plus eight, and so on. The formula is: address = base address plus index times element size. This formula is why index access is O one — a single multiplication and addition, no searching required. This is fundamentally different from a linked list, where each node can live anywhere in memory and you must follow pointers one by one.`,
  operations: `Every array has five core operations with specific time complexities you must memorize. Access by index is O one — the fastest possible. Search for a value in an unsorted array is O n — you may have to look at every element. Insertion at the end of a dynamic array is amortized O one. Insertion in the middle is O n because you must shift all subsequent elements one position right to make room. Deletion follows the same pattern — remove from end is O one, remove from middle is O n because you fill the gap by shifting left. These complexities directly determine when to use an array and when a different structure is better.`,
  types: `There are several important array variants. A one-dimensional array is a single row of elements. A two-dimensional array, often called a matrix, organizes data in rows and columns — think a chess board, a spreadsheet, or pixel colors in an image. A three-dimensional array adds depth — used in scientific simulations and 3D graphics. A jagged array, also called a ragged array, is an array of arrays where each inner array can have a different length. A dynamic array, like ArrayList in Java or a list in Python, can grow and shrink at runtime by allocating a new larger block when full and copying all elements over. This doubling strategy makes appending amortized O one.`,
  searching: `Two fundamental searching algorithms operate on arrays. Linear search examines each element one by one from the beginning until a match is found or the end is reached. It works on any array — sorted or not — but takes O n time in the worst case. Binary search is dramatically faster at O log n, but requires the array to be sorted first. It works by repeatedly halving the search space: compare the target to the middle element, then discard the half that cannot contain the target. For one billion sorted elements, binary search needs only thirty comparisons. The trade-off is real: binary search requires a sorted array, and sorting costs O n log n up front.`,
  sorting: `Sorting transforms a random array into ordered data, enabling binary search and many algorithms. Bubble Sort repeatedly swaps adjacent elements — simple but O n squared, only for tiny arrays. Selection Sort finds the minimum each pass — also O n squared. Insertion Sort builds a sorted left portion one element at a time — O n squared worst case but O n on nearly-sorted data, which is why it is used as a finishing pass in Timsort. Merge Sort splits in half, sorts each half recursively, then merges — O n log n always, stable, but requires O n extra space. Quick Sort picks a pivot, partitions, recurses — O n log n average, O one extra space, but O n squared worst case. In practice, Timsort, which combines Merge and Insertion Sort, is used in Python and Java.`,
  twopointer: `The two-pointer technique is one of the most powerful array patterns for solving problems in O n instead of O n squared. Place one pointer at the start and one at the end. Move them toward each other based on a condition. Classic problems solved this way include: finding two numbers that sum to a target in a sorted array, removing duplicates from a sorted array in-place, reversing an array in-place, and the container with most water problem. The sliding window is a related pattern using two pointers that move in the same direction — used for finding subarrays with maximum sum, longest substring without repeating characters, and minimum window substring. These patterns appear in nearly every coding interview.`,
  prefixsum: `The prefix sum technique transforms an array into a cumulative sum array, enabling any range sum query in O one instead of O n. Precompute prefix where prefix at index i equals the sum of all elements from index zero to i. Then the sum from index left to right equals prefix at right minus prefix at left minus one. This technique powers many advanced algorithms: two-sum variations, subarray sum equals k, maximum subarray problems, and range minimum queries. The kadane algorithm for maximum subarray sum is also array-based: maintain a running current sum and a global maximum, reset current to zero when it goes negative. This solves a classic interview problem in a single pass at O n time and O one space.`,
  quiz: `Excellent work making it to the quiz! You have covered the complete foundation of arrays: memory layout and index addressing, all five core operations and their complexities, array types including dynamic arrays, linear and binary search, five sorting algorithms, and the two-pointer and prefix sum techniques. This knowledge underpins virtually every algorithm and data structure you will encounter. The quiz ahead has six questions designed to test whether you truly understand these concepts, not just memorized them. Take your time. Think carefully. Let's find out what you know.`,
};

const NAV_SECTIONS = [
  { id:"intro",      icon:"📦", label:"Intro",      col:"#60a5fa" },
  { id:"memory",     icon:"🧱", label:"Memory",     col:"#34d399" },
  { id:"operations", icon:"⚡", label:"Operations", col:"#f59e0b" },
  { id:"types",      icon:"🗂️", label:"Types",      col:"#818cf8" },
  { id:"searching",  icon:"🔎", label:"Search",     col:"#38bdf8" },
  { id:"sorting",    icon:"🔢", label:"Sorting",    col:"#fb7185" },
  { id:"twopointer", icon:"👆", label:"2-Pointer",  col:"#a78bfa" },
  { id:"prefixsum",  icon:"∑",  label:"Prefix",     col:"#4ade80" },
  { id:"quiz",       icon:"🧠", label:"Quiz",       col:"#ec4899" },
];

const SPEED_OPTIONS = [0.75, 1.0, 1.25, 1.5, 2.0];

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED HELPERS
// ═══════════════════════════════════════════════════════════════════════════════
function useVisible(threshold = 0.1) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return [ref, vis];
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
    <div style={{ position:"fixed", top:0, left:0, right:0, height:3, zIndex:999, background:"rgba(255,255,255,0.04)" }}>
      <div style={{
        height:"100%", width:`${p}%`,
        background:"linear-gradient(90deg,#60a5fa,#34d399,#f59e0b)",
        transition:"width 0.12s linear",
        boxShadow:"0 0 10px rgba(96,165,250,0.7)",
      }}/>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SPEED CONTROL PANEL
// ═══════════════════════════════════════════════════════════════════════════════
function SpeedPanel({ speed, setSpeed, speaking, onRestart }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position:"relative" }}>
      <button
        onClick={() => setOpen(o => !o)}
        title="Playback Speed"
        style={{
          display:"flex", alignItems:"center", gap:5,
          padding:"5px 11px", borderRadius:20, cursor:"pointer",
          background: open ? "rgba(96,165,250,0.2)" : "rgba(255,255,255,0.05)",
          border:`1.5px solid ${open ? "#60a5fa" : "rgba(255,255,255,0.1)"}`,
          fontFamily:"'JetBrains Mono',monospace", fontSize:9, fontWeight:700,
          color: open ? "#93c5fd" : "#64748b", transition:"all 0.2s",
        }}>
        ⚡ {speed}×
      </button>
      {open && (
        <div style={{
          position:"absolute", top:"calc(100% + 8px)", right:0,
          background:"rgba(8,10,22,0.97)", backdropFilter:"blur(28px)",
          border:"1px solid rgba(255,255,255,0.1)", borderRadius:14,
          padding:"8px 6px", display:"flex", flexDirection:"column", gap:3,
          zIndex:1000, minWidth:100,
          boxShadow:"0 16px 48px rgba(0,0,0,0.7)",
          animation:"panelPop 0.18s cubic-bezier(0.22,1,0.36,1) both",
        }}>
          <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:8, color:"#2d3748", letterSpacing:"0.1em", padding:"2px 8px 6px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>SPEED</div>
          {SPEED_OPTIONS.map(s => (
            <button key={s} onClick={() => {
              currentRate = s;
              setSpeed(s);
              setOpen(false);
              if (speaking) onRestart();
            }} style={{
              padding:"6px 12px", borderRadius:8, cursor:"pointer", textAlign:"left",
              background: speed === s ? "rgba(96,165,250,0.2)" : "transparent",
              border:`1px solid ${speed === s ? "rgba(96,165,250,0.45)" : "transparent"}`,
              fontFamily:"'JetBrains Mono',monospace", fontSize:10, fontWeight:700,
              color: speed === s ? "#93c5fd" : "#475569", transition:"all 0.15s",
            }}>
              {s === 1.25 ? `${s}× ★` : `${s}×`}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STICKY NAV
// ═══════════════════════════════════════════════════════════════════════════════
function StickyNav({ active, speaking, speed, setSpeed, onRestart }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const h = () => setShow(window.scrollY > 500);
    window.addEventListener("scroll", h, { passive:true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  return (
    <nav style={{
      position:"fixed", top:14, left:"50%", transform:"translateX(-50%)",
      zIndex:900, display:"flex", alignItems:"center", gap:2, padding:"5px 8px",
      background:"rgba(6,8,18,0.92)", backdropFilter:"blur(28px) saturate(180%)",
      borderRadius:22, border:"1px solid rgba(255,255,255,0.08)",
      boxShadow:"0 12px 48px rgba(0,0,0,0.6)",
      opacity: show ? 1 : 0, pointerEvents: show ? "auto" : "none",
      transition:"opacity 0.3s ease",
      maxWidth:"calc(100vw - 24px)",
    }}>
      <div className="nav-pills" style={{ display:"flex", gap:2, flexWrap:"wrap", justifyContent:"center" }}>
        {NAV_SECTIONS.map(s => (
          <button key={s.id}
            onClick={() => document.getElementById(s.id)?.scrollIntoView({ behavior:"smooth" })}
            title={s.label}
            style={{
              width:34, height:34, borderRadius:12, border:"none", cursor:"pointer",
              background: active===s.id ? `${s.col}22` : "transparent",
              outline: active===s.id ? `1.5px solid ${s.col}55` : "1.5px solid transparent",
              fontSize:15, transition:"all 0.2s", display:"flex", alignItems:"center", justifyContent:"center",
            }}>
            {s.icon}
          </button>
        ))}
      </div>
      <div style={{ width:1, height:20, background:"rgba(255,255,255,0.08)", margin:"0 4px" }}/>
      <SpeedPanel speed={speed} setSpeed={setSpeed} speaking={!!speaking} onRestart={onRestart}/>
      {speaking && (
        <div style={{
          marginLeft:4, display:"flex", alignItems:"center", gap:5,
          padding:"4px 10px", borderRadius:14,
          background:"rgba(96,165,250,0.12)", border:"1px solid rgba(96,165,250,0.3)",
        }}>
          <SpeakingWave color="#60a5fa" size={14}/>
          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:"#60a5fa", fontWeight:700 }}>ON</span>
        </div>
      )}
    </nav>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SPEAKING WAVE
// ═══════════════════════════════════════════════════════════════════════════════
function SpeakingWave({ color = "#60a5fa", size = 16 }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:2, height:size }}>
      {[0,1,2,3].map(i => (
        <div key={i} style={{
          width: size * 0.18, height: size * 0.5,
          background: color, borderRadius:99,
          animation:`wave 1.1s ease-in-out ${i*0.15}s infinite`,
        }}/>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// BACK TO TOP
// ═══════════════════════════════════════════════════════════════════════════════
function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const h = () => setShow(window.scrollY > 1200);
    window.addEventListener("scroll", h, { passive:true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  return (
    <button
      onClick={() => window.scrollTo({ top:0, behavior:"smooth" })}
      title="Back to top"
      style={{
        position:"fixed", bottom:24, right:20, zIndex:850,
        width:44, height:44, borderRadius:14, cursor:"pointer",
        background:"rgba(96,165,250,0.15)", border:"1px solid rgba(96,165,250,0.35)",
        color:"#93c5fd", fontSize:18,
        display:"flex", alignItems:"center", justifyContent:"center",
        opacity: show ? 1 : 0, transform: show ? "scale(1)" : "scale(0.7)",
        pointerEvents: show ? "auto" : "none",
        transition:"all 0.3s cubic-bezier(0.22,1,0.36,1)",
        boxShadow:"0 8px 24px rgba(96,165,250,0.3)",
      }}>↑</button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION COMPLETION BADGE
// ═══════════════════════════════════════════════════════════════════════════════
function CompletedBadge({ seen }) {
  if (!seen) return null;
  return (
    <span style={{
      padding:"2px 9px", borderRadius:20, fontSize:9,
      fontFamily:"'JetBrains Mono',monospace", fontWeight:700,
      background:"rgba(96,165,250,0.12)", border:"1px solid rgba(96,165,250,0.3)",
      color:"#60a5fa", letterSpacing:"0.08em",
      animation:"fadeIn 0.4s ease both",
    }}>✓ READ</span>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// HERO
// ═══════════════════════════════════════════════════════════════════════════════
function Hero({ onStart, onVoice }) {
  const [frame, setFrame] = useState(0);
  const [pulse, setPulse] = useState(null);
  useEffect(() => {
    const t = setInterval(() => {
      const idx = Math.floor(Math.random() * 8);
      setPulse(idx);
      setTimeout(() => setPulse(null), 600);
      setFrame(f => f + 1);
    }, 900);
    return () => clearInterval(t);
  }, []);

  const vals = [12, 47, 8, 93, 35, 61, 24, 78];
  const COLS = ["#60a5fa","#34d399","#f59e0b","#fb7185","#a78bfa","#38bdf8","#4ade80","#fbbf24"];

  return (
    <div style={{
      minHeight:"100vh", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      padding:"80px 24px 48px", textAlign:"center", position:"relative", overflow:"hidden",
    }}>
      <div style={{ position:"absolute",inset:0,pointerEvents:"none",
        backgroundImage:"radial-gradient(circle,rgba(96,165,250,0.04) 1px,transparent 1px)",
        backgroundSize:"38px 38px" }}/>
      <div style={{ position:"absolute",top:"8%",left:"5%",width:420,height:420,borderRadius:"50%",
        background:"radial-gradient(circle,rgba(96,165,250,0.13) 0%,transparent 68%)",
        filter:"blur(72px)",pointerEvents:"none",
        animation:"hOrb1 22s ease-in-out infinite" }}/>
      <div style={{ position:"absolute",bottom:"10%",right:"4%",width:320,height:320,borderRadius:"50%",
        background:"radial-gradient(circle,rgba(52,211,153,0.1) 0%,transparent 68%)",
        filter:"blur(60px)",pointerEvents:"none",
        animation:"hOrb2 28s ease-in-out infinite" }}/>

      {/* Hero array visualization */}
      <div style={{ width:"100%", maxWidth:520, marginBottom:40, padding:"0 8px" }}>
        <svg viewBox="0 0 520 120" width="100%">
          <defs>
            <filter id="hGlwA">
              <feGaussianBlur stdDeviation="6" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>
          {/* Memory address row */}
          {vals.map((_, i) => (
            <text key={i} x={32 + i * 58} y={18} textAnchor="middle"
              fill="rgba(96,165,250,0.35)" fontSize="8"
              fontFamily="'JetBrains Mono',monospace">0x{(i * 4).toString(16).padStart(2,"0").toUpperCase()}</text>
          ))}
          {/* Cells */}
          {vals.map((v, i) => {
            const x = 6 + i * 58;
            const isPulse = pulse === i;
            const col = COLS[i];
            return (
              <g key={i} style={{ animation:`arrCell 0.6s cubic-bezier(0.22,1,0.36,1) ${i * 0.08}s both` }}>
                {isPulse && <rect x={x-2} y={22} width={56} height={56} rx={10}
                  fill="none" stroke={col} strokeWidth="1.5" strokeOpacity="0.4"
                  style={{ animation:"cellRip 0.65s ease-out forwards" }}/>}
                <rect x={x} y={24} width={52} height={52} rx={8}
                  fill={isPulse ? `${col}28` : `${col}10`}
                  stroke={col} strokeWidth={isPulse ? 2 : 1.5}
                  filter={isPulse ? "url(#hGlwA)" : "none"}
                  style={{ transition:"all 0.3s" }}/>
                <text x={x + 26} y={56} textAnchor="middle" dominantBaseline="middle"
                  fill={col} fontSize={isPulse ? "15" : "13"}
                  fontFamily="'JetBrains Mono',monospace" fontWeight="700"
                  style={{ transition:"all 0.3s" }}>{v}</text>
                {/* Index label */}
                <text x={x + 26} y={90} textAnchor="middle"
                  fill="rgba(148,163,184,0.45)" fontSize="9"
                  fontFamily="'JetBrains Mono',monospace">[{i}]</text>
              </g>
            );
          })}
          {/* Bracket labels */}
          <text x={6} y={112} fill="rgba(96,165,250,0.4)" fontSize="9" fontFamily="'JetBrains Mono',monospace">arr[0]</text>
          <text x={460} y={112} textAnchor="end" fill="rgba(96,165,250,0.4)" fontSize="9" fontFamily="'JetBrains Mono',monospace">arr[7]</text>
          <style>{`
            @keyframes arrCell{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
            @keyframes cellRip{from{opacity:0.5;transform:scale(0.9)}to{opacity:0;transform:scale(1.25)}}
          `}</style>
        </svg>
      </div>

      <div style={{ maxWidth:640, position:"relative" }}>
        <div style={{
          display:"inline-flex",alignItems:"center",gap:8,marginBottom:20,
          padding:"5px 18px",borderRadius:40,
          background:"rgba(96,165,250,0.1)",border:"1px solid rgba(96,165,250,0.25)",
          fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#60a5fa",letterSpacing:"0.1em",
        }}>📦 INTERACTIVE VISUAL GUIDE · FOR COMPLETE BEGINNERS</div>

        <h1 style={{
          margin:"0 0 18px",
          fontFamily:"'Syne',sans-serif",
          fontSize:"clamp(36px,7.5vw,76px)",
          fontWeight:800,letterSpacing:"-0.035em",lineHeight:1.02,
          background:"linear-gradient(145deg,#f8fafc 0%,#bfdbfe 35%,#34d399 65%,#f59e0b 100%)",
          WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",
        }}>Array Data<br/>Structures</h1>

        <p style={{
          margin:"0 auto 32px",fontFamily:"'DM Sans',sans-serif",
          fontSize:"clamp(14px,2.2vw,18px)",color:"#64748b",lineHeight:1.68,maxWidth:520,
        }}>
          Every major array concept — animated, explained, and narrated with a <strong style={{ color:"#60a5fa" }}>natural male voice</strong> at your chosen speed.
        </p>

        <div style={{ display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap" }}>
          <button onClick={onStart} style={{
            padding:"15px 36px",borderRadius:16,cursor:"pointer",
            background:"linear-gradient(135deg,#3b82f6 0%,#34d399 100%)",
            border:"none",fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:700,
            color:"#fff",boxShadow:"0 8px 36px rgba(59,130,246,0.45)",transition:"all 0.25s",
          }}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px) scale(1.02)";e.currentTarget.style.boxShadow="0 14px 48px rgba(59,130,246,0.6)";}}
            onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="0 8px 36px rgba(59,130,246,0.45)";}}>
            Begin Learning ↓
          </button>
          <button onClick={onVoice} style={{
            padding:"15px 26px",borderRadius:16,cursor:"pointer",
            background:"rgba(255,255,255,0.05)",border:"1.5px solid rgba(255,255,255,0.15)",
            fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:600,
            color:"#94a3b8",transition:"all 0.25s",display:"flex",alignItems:"center",gap:9,
          }}
            onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.1)";e.currentTarget.style.color="#f8fafc";}}
            onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.05)";e.currentTarget.style.color="#94a3b8";}}>
            <span style={{ fontSize:18 }}>🔊</span> Hear Intro
          </button>
        </div>

        <div style={{ display:"flex",gap:6,justifyContent:"center",alignItems:"center",marginTop:20,flexWrap:"wrap" }}>
          <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#2d3748",letterSpacing:"0.08em" }}>VOICE SPEED:</span>
          {SPEED_OPTIONS.map(s => (
            <button key={s} onClick={() => { currentRate = s; }} style={{
              padding:"4px 11px",borderRadius:20,cursor:"pointer",
              background: currentRate===s ? "rgba(96,165,250,0.18)" : "rgba(255,255,255,0.04)",
              border:`1px solid ${currentRate===s ? "rgba(96,165,250,0.5)" : "rgba(255,255,255,0.08)"}`,
              fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:700,
              color: currentRate===s ? "#60a5fa" : "#2d3748",transition:"all 0.18s",
            }}>{s}×</button>
          ))}
        </div>

        <div style={{ display:"flex",gap:28,justifyContent:"center",marginTop:44,flexWrap:"wrap" }}>
          {[["9","Sections"],["8+","Animations"],["6","Quiz Qs"],["♂","Male Voice"]].map(([n,l]) => (
            <div key={l} style={{ textAlign:"center" }}>
              <div style={{
                fontFamily:"'Syne',sans-serif",fontSize:28,fontWeight:800,
                background:"linear-gradient(135deg,#60a5fa,#34d399)",
                WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",
              }}>{n}</div>
              <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#2d3748",letterSpacing:"0.1em",marginTop:3 }}>{l}</div>
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
      opacity:vis?1:0,
      transform:vis?"none":"translateY(52px)",
      transition:"opacity 0.78s cubic-bezier(0.22,1,0.36,1),transform 0.78s cubic-bezier(0.22,1,0.36,1)",
    }}>
      <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:24,flexWrap:"wrap" }}>
        <div style={{
          width:50,height:50,borderRadius:16,flexShrink:0,
          background:`${color}14`,border:`1px solid ${color}38`,
          display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,
          boxShadow:`0 0 28px ${color}18`,
        }}>{icon}</div>
        <h2 style={{
          flex:1,margin:0,minWidth:0,
          fontFamily:"'Syne',sans-serif",fontSize:"clamp(19px,3.8vw,30px)",
          fontWeight:800,color:"#f8fafc",letterSpacing:"-0.022em",lineHeight:1.15,
        }}>{title}</h2>
        <div style={{ display:"flex",alignItems:"center",gap:8,flexShrink:0 }}>
          <CompletedBadge seen={seen}/>
          <button onClick={() => onVoice(id, voice)} style={{
            display:"flex",alignItems:"center",gap:6,
            padding:"7px 14px",borderRadius:28,cursor:"pointer",
            background:isSp?`${color}20`:"rgba(255,255,255,0.04)",
            border:`1.5px solid ${isSp?color:"rgba(255,255,255,0.1)"}`,
            fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:700,
            color:isSp?color:"#475569",transition:"all 0.22s",
          }}>
            {isSp ? <SpeakingWave color={color} size={12}/> : <span style={{ fontSize:12 }}>🔊</span>}
            {isSp?"STOP":"LISTEN"}
          </button>
        </div>
      </div>

      <div className="sg" style={{
        display:"grid",
        gridTemplateColumns:"minmax(0,1.12fr) minmax(0,0.88fr)",
        gap:18,
      }}>
        <div style={{
          padding:20,borderRadius:22,
          background:"linear-gradient(150deg,rgba(255,255,255,0.028) 0%,rgba(0,0,0,0.22) 100%)",
          border:`1px solid ${color}18`,boxShadow:`0 0 64px ${color}09`,
          minWidth:0,
        }}>{visual}</div>

        <div style={{ display:"flex",flexDirection:"column",gap:9,minWidth:0 }}>
          {cards.map((c,i) => (
            <div key={i} style={{
              padding:"12px 14px",borderRadius:13,
              background:"rgba(255,255,255,0.022)",
              border:"1px solid rgba(255,255,255,0.052)",
              borderLeft:`3px solid ${color}55`,
              animation:vis?`sRight 0.5s cubic-bezier(0.22,1,0.36,1) ${0.1+i*0.1}s both`:"none",
            }}>
              {c.lbl && <div style={{
                fontFamily:"'JetBrains Mono',monospace",fontSize:8.5,fontWeight:700,
                color,letterSpacing:"0.12em",marginBottom:5,opacity:0.88,
              }}>{c.lbl}</div>}
              <div style={{ fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#94a3b8",lineHeight:1.68 }}>
                {c.body}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VISUAL: Intro — Array with index pointer
// ═══════════════════════════════════════════════════════════════════════════════
function VisIntro() {
  const [ptr, setPtr] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setPtr(p => (p + 1) % 7), 900);
    return () => clearInterval(t);
  }, []);
  const vals = [7, 23, 4, 61, 15, 38, 92];
  const COLS = ["#60a5fa","#34d399","#f59e0b","#fb7185","#a78bfa","#38bdf8","#4ade80"];
  return (
    <svg viewBox="0 0 380 200" width="100%" style={{ maxHeight:200 }}>
      <defs>
        <filter id="aGlw">
          <feGaussianBlur stdDeviation="5" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      {/* Contiguous memory label */}
      <rect x={8} y={38} width={364} height={72} rx={10}
        fill="rgba(96,165,250,0.04)" stroke="rgba(96,165,250,0.15)" strokeWidth="1" strokeDasharray="5,3"/>
      <text x={190} y={28} textAnchor="middle" fill="rgba(96,165,250,0.5)" fontSize="9"
        fontFamily="'JetBrains Mono',monospace">CONTIGUOUS MEMORY BLOCK</text>

      {vals.map((v, i) => {
        const x = 12 + i * 52;
        const isP = ptr === i;
        const col = COLS[i];
        return (
          <g key={i} style={{ animation:`arrCell 0.5s cubic-bezier(0.22,1,0.36,1) ${i * 0.07}s both` }}>
            <rect x={x} y={44} width={46} height={60} rx={8}
              fill={isP ? `${col}28` : `${col}0e`}
              stroke={col} strokeWidth={isP ? 2.5 : 1.5}
              filter={isP ? "url(#aGlw)" : "none"}
              style={{ transition:"all 0.3s" }}/>
            <text x={x+23} y={79} textAnchor="middle" dominantBaseline="middle"
              fill={col} fontSize={isP ? "15" : "13"}
              fontFamily="'JetBrains Mono',monospace" fontWeight="700">{v}</text>
            <text x={x+23} y={120} textAnchor="middle"
              fill={isP ? col : "rgba(148,163,184,0.38)"} fontSize="9"
              fontFamily="'JetBrains Mono',monospace" style={{ transition:"fill 0.3s" }}>[{i}]</text>
          </g>
        );
      })}
      {/* Pointer arrow */}
      <g style={{ transform:`translateX(${ptr * 52}px)`, transition:"transform 0.4s cubic-bezier(0.22,1,0.36,1)" }}>
        <polygon points={`${35},148 ${42},160 ${28},160`} fill={COLS[ptr]} opacity="0.9"/>
        <text x={35} y={176} textAnchor="middle" fill={COLS[ptr]}
          fontSize="9" fontFamily="'JetBrains Mono',monospace" fontWeight="700">
          O(1) ACCESS
        </text>
      </g>
      <style>{`@keyframes arrCell{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VISUAL: Memory Layout
// ═══════════════════════════════════════════════════════════════════════════════
function VisMemory() {
  const [hov, setHov] = useState(null);
  const BASE = 1000;
  const vals = [42, 17, 88, 5, 63];
  const COLS = ["#60a5fa","#34d399","#f59e0b","#fb7185","#a78bfa"];
  return (
    <div>
      <svg viewBox="0 0 380 220" width="100%" style={{ maxHeight:220 }}>
        <text x={190} y={20} textAnchor="middle" fill="#2d3748" fontSize="9"
          fontFamily="'JetBrains Mono',monospace" letterSpacing="0.1em">RAM ADDRESSES (int32 = 4 bytes each)</text>

        {vals.map((v, i) => {
          const x = 20 + i * 68;
          const addr = BASE + i * 4;
          const isH = hov === i;
          const col = COLS[i];
          return (
            <g key={i} onMouseEnter={()=>setHov(i)} onMouseLeave={()=>setHov(null)} style={{ cursor:"default" }}>
              {/* Address label */}
              <text x={x+28} y={40} textAnchor="middle" fill={isH ? col : "rgba(148,163,184,0.4)"}
                fontSize="8" fontFamily="'JetBrains Mono',monospace" style={{ transition:"fill 0.2s" }}>
                {addr}
              </text>
              {/* Cell */}
              <rect x={x} y={48} width={56} height={56} rx={8}
                fill={isH ? `${col}22` : `${col}0c`}
                stroke={col} strokeWidth={isH ? 2.5 : 1.5}
                style={{ transition:"all 0.25s" }}/>
              <text x={x+28} y={81} textAnchor="middle" dominantBaseline="middle"
                fill={col} fontSize={isH ? "16" : "14"}
                fontFamily="'JetBrains Mono',monospace" fontWeight="700"
                style={{ transition:"all 0.25s" }}>{v}</text>
              {/* Index */}
              <text x={x+28} y={120} textAnchor="middle" fill={isH ? col : "#2d3748"}
                fontSize="9" fontFamily="'JetBrains Mono',monospace">[{i}]</text>
              {/* 4-byte width indicator */}
              {isH && <>
                <line x1={x} y1={136} x2={x+56} y2={136} stroke={col} strokeWidth="1" strokeOpacity="0.5"/>
                <line x1={x} y1={132} x2={x} y2={140} stroke={col} strokeWidth="1" strokeOpacity="0.5"/>
                <line x1={x+56} y1={132} x2={x+56} y2={140} stroke={col} strokeWidth="1" strokeOpacity="0.5"/>
                <text x={x+28} y={150} textAnchor="middle" fill={col} fontSize="8" fontFamily="'JetBrains Mono',monospace">4 bytes</text>
              </>}
            </g>
          );
        })}

        {/* Formula */}
        <rect x={20} y={165} width={340} height={48} rx={10}
          fill="rgba(96,165,250,0.06)" stroke="rgba(96,165,250,0.2)" strokeWidth="1"/>
        <text x={190} y={185} textAnchor="middle" fill="#60a5fa" fontSize="10"
          fontFamily="'JetBrains Mono',monospace" fontWeight="700">
          address(i) = base + i × sizeof(element)
        </text>
        <text x={190} y={203} textAnchor="middle" fill="#475569" fontSize="9"
          fontFamily="'JetBrains Mono',monospace">
          {hov !== null ? `address(${hov}) = ${BASE} + ${hov} × 4 = ${BASE + hov*4}` : "HOVER A CELL TO SEE ITS ADDRESS"}
        </text>
      </svg>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VISUAL: Operations
// ═══════════════════════════════════════════════════════════════════════════════
function VisOperations() {
  const [op, setOp] = useState("access");
  const [step, setStep] = useState(0);
  const [running, setRunning] = useState(false);
  const INIT = [10, 25, 40, 55, 70];
  const [arr, setArr] = useState(INIT);

  const OPS = {
    access:  { label:"ACCESS [2]", col:"#34d399", steps:["Compute: base + 2×4","Jump directly to address","Return arr[2] = 40"], complexity:"O(1)" },
    search:  { label:"SEARCH 55",  col:"#f59e0b", steps:["Check arr[0]=10 ✗","Check arr[1]=25 ✗","Check arr[2]=40 ✗","Check arr[3]=55 ✓ Found!"], complexity:"O(n)" },
    insert:  { label:"INSERT @[2]", col:"#a78bfa", steps:["Shift arr[4]→[5]","Shift arr[3]→[4]","Shift arr[2]→[3]","Place 99 at [2]"], complexity:"O(n)" },
    delete:  { label:"DELETE [1]", col:"#fb7185", steps:["Remove arr[1]=25","Shift arr[2]→[1]","Shift arr[3]→[2]","Shift arr[4]→[3]"], complexity:"O(n)" },
    append:  { label:"APPEND 85", col:"#60a5fa", steps:["Check capacity","Space available","Place at end arr[5]=85"], complexity:"O(1)*" },
  };

  const cur = OPS[op];
  const activeIdx = op === "access" ? 2 : op === "search" ? Math.min(step, 3) : op === "insert" ? (step < 3 ? 4 - step : 2) : op === "delete" ? Math.min(step + 1, 4) : arr.length;

  const run = () => {
    if (running) return;
    setRunning(true);
    setStep(0);
    let s = 0;
    const iv = setInterval(() => {
      s++;
      setStep(s);
      if (s >= cur.steps.length) { clearInterval(iv); setRunning(false); }
    }, 700);
  };

  return (
    <div>
      <div style={{ display:"flex", gap:5, justifyContent:"center", marginBottom:10, flexWrap:"wrap" }}>
        {Object.entries(OPS).map(([k, o]) => (
          <button key={k} onClick={()=>{setOp(k);setStep(0);setRunning(false);}} style={{
            padding:"4px 9px", borderRadius:20, cursor:"pointer",
            background:op===k?`${o.col}1c`:"rgba(255,255,255,0.04)",
            border:`1px solid ${op===k?o.col:"rgba(255,255,255,0.1)"}`,
            fontFamily:"'JetBrains Mono',monospace", fontSize:9, fontWeight:700,
            color:op===k?o.col:"#475569", transition:"all 0.2s",
          }}>{o.label}</button>
        ))}
      </div>

      <svg viewBox="0 0 380 160" width="100%" style={{ maxHeight:160 }}>
        {INIT.map((v, i) => {
          const x = 20 + i * 62;
          const isActive = i === activeIdx && step > 0;
          const col = cur.col;
          const shifted = op === "insert" && step > 0 && i >= 2;
          const deleted = op === "delete" && step > 0 && i === 1;
          return (
            <g key={i} style={{ transform: shifted ? "translateX(62px)" : "none", transition:"transform 0.4s cubic-bezier(0.22,1,0.36,1)", opacity: deleted && step > 0 ? 0 : 1 }}>
              <rect x={x} y={20} width={54} height={54} rx={8}
                fill={isActive ? `${col}28` : "rgba(255,255,255,0.04)"}
                stroke={isActive ? col : "rgba(255,255,255,0.12)"}
                strokeWidth={isActive ? 2.5 : 1.5}
                style={{ transition:"all 0.35s" }}/>
              <text x={x+27} y={52} textAnchor="middle" dominantBaseline="middle"
                fill={isActive ? col : "#94a3b8"} fontSize="13"
                fontFamily="'JetBrains Mono',monospace" fontWeight="700">{v}</text>
              <text x={x+27} y={86} textAnchor="middle" fill={isActive ? col : "#334155"}
                fontSize="9" fontFamily="'JetBrains Mono',monospace">[{i}]</text>
            </g>
          );
        })}
        {/* Appended element */}
        {op === "append" && step >= 2 && (
          <g style={{ animation:"arrCell 0.4s ease both" }}>
            <rect x={20 + 5*62} y={20} width={54} height={54} rx={8}
              fill={`${cur.col}28`} stroke={cur.col} strokeWidth={2.5}/>
            <text x={20+5*62+27} y={52} textAnchor="middle" dominantBaseline="middle"
              fill={cur.col} fontSize="13" fontFamily="'JetBrains Mono',monospace" fontWeight="700">85</text>
            <text x={20+5*62+27} y={86} textAnchor="middle" fill={cur.col}
              fontSize="9" fontFamily="'JetBrains Mono',monospace">[5]</text>
          </g>
        )}
        {/* Inserted element */}
        {op === "insert" && step >= 4 && (
          <g style={{ animation:"arrCell 0.4s ease both" }}>
            <rect x={20+2*62} y={20} width={54} height={54} rx={8}
              fill={`${cur.col}28`} stroke={cur.col} strokeWidth={2.5}/>
            <text x={20+2*62+27} y={52} textAnchor="middle" dominantBaseline="middle"
              fill={cur.col} fontSize="13" fontFamily="'JetBrains Mono',monospace" fontWeight="700">99</text>
            <text x={20+2*62+27} y={86} textAnchor="middle" fill={cur.col}
              fontSize="9" fontFamily="'JetBrains Mono',monospace">[2]</text>
          </g>
        )}

        {/* Step log */}
        <rect x={10} y={102} width={360} height={50} rx={8}
          fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
        {cur.steps.slice(0, Math.max(step, 1)).map((s, i) => (
          <text key={i} x={20} y={118 + i * 13} fill={i === step - 1 ? cur.col : "#334155"}
            fontSize="9" fontFamily="'JetBrains Mono',monospace"
            style={{ transition:"fill 0.2s" }}>
            {i === step - 1 ? "▶ " : "  "}{s}
          </text>
        ))}
        {step === 0 && <text x={190} y={128} textAnchor="middle" fill="#253046"
          fontSize="9" fontFamily="'JetBrains Mono',monospace">PRESS RUN TO ANIMATE</text>}

        <style>{`@keyframes arrCell{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
      </svg>

      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:6, flexWrap:"wrap", gap:8 }}>
        <div style={{
          padding:"5px 14px", borderRadius:20,
          background:`${cur.col}18`, border:`1px solid ${cur.col}40`,
          fontFamily:"'JetBrains Mono',monospace", fontSize:10, fontWeight:700, color:cur.col,
        }}>Complexity: {cur.complexity}</div>
        <button onClick={run} disabled={running} style={{
          padding:"6px 20px", borderRadius:20, cursor:running?"default":"pointer",
          background:running?"rgba(255,255,255,0.02)":`${cur.col}1c`,
          border:`1px solid ${running?"rgba(255,255,255,0.1)":cur.col+"60"}`,
          fontFamily:"'JetBrains Mono',monospace", fontSize:9, fontWeight:700,
          color:running?"#2d3748":cur.col,
        }}>{running?"RUNNING...":"▶ RUN"}</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VISUAL: Types
// ═══════════════════════════════════════════════════════════════════════════════
function VisTypes() {
  const [tab, setTab] = useState(0);
  const TYPES = [
    { nm:"1D Array", ic:"▬", c:"#60a5fa", desc:"Single row of elements. The most common form.",
      render: () => (
        <svg viewBox="0 0 320 80" width="100%">
          {[3,7,1,9,5,2,8].map((v,i) => (
            <g key={i} style={{animation:`arrCell 0.3s ease ${i*0.06}s both`}}>
              <rect x={8+i*44} y={14} width={38} height={38} rx={7}
                fill="rgba(96,165,250,0.12)" stroke="#60a5fa" strokeWidth="1.5"/>
              <text x={27+i*44} y={38} textAnchor="middle" dominantBaseline="middle"
                fill="#60a5fa" fontSize="13" fontFamily="'JetBrains Mono',monospace" fontWeight="700">{v}</text>
              <text x={27+i*44} y={64} textAnchor="middle" fill="#334155"
                fontSize="8" fontFamily="'JetBrains Mono',monospace">[{i}]</text>
            </g>
          ))}
          <style>{`@keyframes arrCell{from{opacity:0;transform:scale(0.7)}to{opacity:1;transform:scale(1)}}`}</style>
        </svg>
      )},
    { nm:"2D Array", ic:"▦", c:"#818cf8", desc:"Matrix of rows × columns. Used for grids, images, graphs.",
      render: () => (
        <svg viewBox="0 0 320 130" width="100%">
          {[[1,2,3,4],[5,6,7,8],[9,10,11,12]].map((row, r) =>
            row.map((v, c) => (
              <g key={`${r}-${c}`} style={{animation:`arrCell 0.35s ease ${(r*4+c)*0.05}s both`}}>
                <rect x={38+c*62} y={8+r*38} width={54} height={32} rx={6}
                  fill="rgba(129,140,248,0.12)" stroke="#818cf8" strokeWidth="1.5"/>
                <text x={65+c*62} y={28+r*38} textAnchor="middle" dominantBaseline="middle"
                  fill="#818cf8" fontSize="11" fontFamily="'JetBrains Mono',monospace" fontWeight="700">{v}</text>
              </g>
            ))
          )}
          <text x={160} y={126} textAnchor="middle" fill="#334155" fontSize="8" fontFamily="'JetBrains Mono',monospace">arr[row][col] — 3×4 matrix</text>
        </svg>
      )},
    { nm:"Dynamic", ic:"⬌", c:"#34d399", desc:"Grows automatically. Doubles capacity when full.",
      render: () => (
        <svg viewBox="0 0 320 130" width="100%">
          {/* Capacity 8, used 5 */}
          {Array.from({length:8}).map((_,i) => (
            <g key={i}>
              <rect x={8+i*38} y={20} width={32} height={32} rx={6}
                fill={i<5?"rgba(52,211,153,0.12)":"rgba(255,255,255,0.02)"}
                stroke={i<5?"#34d399":"rgba(255,255,255,0.1)"} strokeWidth={i<5?1.5:1}
                strokeDasharray={i>=5?"5,3":"none"}/>
              {i<5 && <text x={24+i*38} y={41} textAnchor="middle" dominantBaseline="middle"
                fill="#34d399" fontSize="11" fontFamily="'JetBrains Mono',monospace" fontWeight="700">
                {[4,8,15,16,23][i]}
              </text>}
            </g>
          ))}
          <text x={160} y={70} textAnchor="middle" fill="#34d399" fontSize="9" fontFamily="'JetBrains Mono',monospace">size=5 / capacity=8</text>
          {/* Doubling arrow */}
          <path d="M 160 85 Q 220 95 280 85" fill="none" stroke="#34d399" strokeWidth="1.5" markerEnd="url(#dynArr)" strokeDasharray="5,3" strokeOpacity="0.6"/>
          <defs><marker id="dynArr" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="#34d399"/></marker></defs>
          <text x={160} y={110} textAnchor="middle" fill="#1a2030" fontSize="8" fontFamily="'JetBrains Mono',monospace">when full → double to capacity=16</text>
          <text x={280} y={75} fill="#34d399" fontSize="8" fontFamily="'JetBrains Mono',monospace">×2</text>
        </svg>
      )},
    { nm:"Jagged", ic:"⫶", c:"#f59e0b", desc:"Array of arrays with different lengths. Flexible rows.",
      render: () => (
        <svg viewBox="0 0 320 130" width="100%">
          {[[1,2],[3,4,5,6],[7],[8,9,10]].map((row, r) => (
            <g key={r}>
              <text x={4} y={28+r*30} fill="#334155" fontSize="9" fontFamily="'JetBrains Mono',monospace">[{r}]</text>
              {row.map((v, c) => (
                <g key={c} style={{animation:`arrCell 0.3s ease ${c*0.07}s both`}}>
                  <rect x={28+c*46} y={14+r*30} width={38} height={24} rx={5}
                    fill="rgba(245,158,11,0.12)" stroke="#f59e0b" strokeWidth="1.5"/>
                  <text x={47+c*46} y={30+r*30} textAnchor="middle" dominantBaseline="middle"
                    fill="#f59e0b" fontSize="10" fontFamily="'JetBrains Mono',monospace" fontWeight="700">{v}</text>
                </g>
              ))}
            </g>
          ))}
          <text x={160} y={126} textAnchor="middle" fill="#334155" fontSize="8" fontFamily="'JetBrains Mono',monospace">each inner array has a different length</text>
        </svg>
      )},
  ];
  const T = TYPES[tab];
  return (
    <div>
      <div style={{ display:"flex", gap:5, marginBottom:10, flexWrap:"wrap" }}>
        {TYPES.map((ty,i) => (
          <button key={i} onClick={()=>setTab(i)} style={{
            padding:"5px 10px", borderRadius:20, cursor:"pointer",
            background:tab===i?`${ty.c}1c`:"rgba(255,255,255,0.04)",
            border:`1px solid ${tab===i?`${ty.c}55`:"rgba(255,255,255,0.08)"}`,
            fontFamily:"'JetBrains Mono',monospace", fontSize:9, fontWeight:700,
            color:tab===i?ty.c:"#475569", transition:"all 0.2s",
          }}>{ty.ic} {ty.nm}</button>
        ))}
      </div>
      <div style={{ padding:12, borderRadius:14, background:`${T.c}09`, border:`1px solid ${T.c}22` }}>
        {T.render()}
        <p style={{ textAlign:"center", fontFamily:"'DM Sans',sans-serif", fontSize:13, color:"#94a3b8", margin:"6px 0 0" }}>
          <span style={{color:T.c, fontWeight:700}}>{T.nm}</span> — {T.desc}
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VISUAL: Searching
// ═══════════════════════════════════════════════════════════════════════════════
function VisSearching() {
  const [mode, setMode] = useState("linear");
  const [target, setTarget] = useState(null);
  const [path, setPath] = useState([]);
  const [found, setFound] = useState(null);
  const [running, setRunning] = useState(false);
  const arr = [3, 9, 14, 21, 35, 47, 62, 78, 85, 93];
  const timerRef = useRef();

  const runSearch = (tgt) => {
    if (running) return;
    setTarget(tgt); setPath([]); setFound(null); setRunning(true);
    clearTimeout(timerRef.current);

    if (mode === "linear") {
      let i = 0;
      const step = () => {
        setPath(p => [...p, i]);
        if (arr[i] === tgt) { setFound(i); setRunning(false); return; }
        if (i >= arr.length - 1) { setRunning(false); return; }
        i++;
        timerRef.current = setTimeout(step, 450);
      };
      timerRef.current = setTimeout(step, 100);
    } else {
      let lo = 0, hi = arr.length - 1;
      const step = () => {
        const mid = Math.floor((lo + hi) / 2);
        setPath(p => [...p, mid]);
        if (arr[mid] === tgt) { setFound(mid); setRunning(false); return; }
        if (arr[mid] < tgt) lo = mid + 1;
        else hi = mid - 1;
        if (lo > hi) { setRunning(false); return; }
        timerRef.current = setTimeout(step, 600);
      };
      timerRef.current = setTimeout(step, 100);
    }
  };

  useEffect(() => () => clearTimeout(timerRef.current), []);
  const col = mode === "linear" ? "#f59e0b" : "#38bdf8";

  return (
    <div>
      <div style={{ display:"flex", gap:6, justifyContent:"center", marginBottom:10, flexWrap:"wrap" }}>
        {[["linear","LINEAR O(n)"],["binary","BINARY O(log n)"]].map(([m,lbl]) => (
          <button key={m} onClick={()=>{setMode(m);setPath([]);setFound(null);setTarget(null);setRunning(false);clearTimeout(timerRef.current);}} style={{
            padding:"5px 14px", borderRadius:20, cursor:"pointer",
            background:mode===m?`${m==="linear"?"rgba(245,158,11,0.2)":"rgba(56,189,248,0.2)"}`:"rgba(255,255,255,0.04)",
            border:`1px solid ${mode===m?col:"rgba(255,255,255,0.1)"}`,
            fontFamily:"'JetBrains Mono',monospace", fontSize:9, fontWeight:700,
            color:mode===m?col:"#475569", transition:"all 0.2s",
          }}>{lbl}</button>
        ))}
      </div>
      <div style={{ display:"flex", gap:4, justifyContent:"center", marginBottom:8, flexWrap:"wrap", alignItems:"center" }}>
        <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:"#475569" }}>FIND:</span>
        {[14,47,85,93].map(v => (
          <button key={v} onClick={()=>runSearch(v)} disabled={running} style={{
            padding:"4px 12px", borderRadius:20, cursor:running?"default":"pointer",
            background:target===v&&found!==null?"rgba(52,211,153,0.2)":target===v?"rgba(255,255,255,0.08)":"rgba(255,255,255,0.04)",
            border:`1px solid ${target===v&&found!==null?"#34d399":target===v?col:"rgba(255,255,255,0.1)"}`,
            fontFamily:"'JetBrains Mono',monospace", fontSize:10, fontWeight:700,
            color:target===v&&found!==null?"#34d399":target===v?col:"#475569", transition:"all 0.2s",
          }}>{v}</button>
        ))}
      </div>
      <svg viewBox="0 0 380 110" width="100%" style={{ maxHeight:110 }}>
        {arr.map((v, i) => {
          const x = 6 + i * 37;
          const isPath = path.includes(i);
          const isCur = path[path.length-1] === i && found === null;
          const isFnd = found === i;
          const c = isFnd ? "#34d399" : isCur ? col : isPath ? `${col}88` : null;
          return (
            <g key={i}>
              <rect x={x} y={10} width={32} height={36} rx={6}
                fill={isFnd?`rgba(52,211,153,0.2)`:isCur?`${col}25`:isPath?`${col}0e`:"rgba(255,255,255,0.04)"}
                stroke={c||"rgba(255,255,255,0.1)"} strokeWidth={isFnd||isCur?2.5:1.5}
                style={{ transition:"all 0.3s" }}/>
              <text x={x+16} y={33} textAnchor="middle" dominantBaseline="middle"
                fill={c||"#94a3b8"} fontSize="11" fontFamily="'JetBrains Mono',monospace" fontWeight="700">{v}</text>
              <text x={x+16} y={58} textAnchor="middle" fill={isPath?col:"#253046"}
                fontSize="8" fontFamily="'JetBrains Mono',monospace">[{i}]</text>
            </g>
          );
        })}
        {found !== null && (
          <text x={190} y={82} textAnchor="middle" fill="#34d399" fontSize="10"
            fontFamily="'JetBrains Mono',monospace" fontWeight="700">
            ✓ Found {target} at [{found}] in {path.length} comparison{path.length!==1?"s":""}
          </text>
        )}
        {target !== null && found === null && !running && (
          <text x={190} y={82} textAnchor="middle" fill="#fb7185" fontSize="10"
            fontFamily="'JetBrains Mono',monospace">Not found — {path.length} comparisons</text>
        )}
        {target === null && (
          <text x={190} y={82} textAnchor="middle" fill="#253046" fontSize="9"
            fontFamily="'JetBrains Mono',monospace">SORTED ARRAY — TAP A VALUE TO SEARCH</text>
        )}
      </svg>
      <div style={{
        marginTop:4, padding:"7px 12px", borderRadius:10,
        background:`${col}0e`, border:`1px solid ${col}22`,
        fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:col, textAlign:"center",
      }}>
        {mode==="linear" ? "Unsorted OK · checks every element · worst case O(n)" : "Sorted REQUIRED · halves search space each step · O(log n)"}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VISUAL: Sorting
// ═══════════════════════════════════════════════════════════════════════════════
function VisSorting() {
  const [algo, setAlgo] = useState("bubble");
  const [arr, setArr] = useState([64,34,25,12,22,11,90]);
  const [comparing, setComparing] = useState([]);
  const [sorted, setSorted] = useState([]);
  const [running, setRunning] = useState(false);
  const stopRef = useRef(false);

  const sleep = ms => new Promise(r => setTimeout(r, ms));

  const reset = () => {
    stopRef.current = true;
    setTimeout(() => {
      setArr([64,34,25,12,22,11,90]);
      setComparing([]); setSorted([]); setRunning(false);
      stopRef.current = false;
    }, 50);
  };

  const runSort = async () => {
    if (running) return;
    stopRef.current = false;
    setRunning(true); setSorted([]);
    let a = [64,34,25,12,22,11,90];
    setArr([...a]);

    if (algo === "bubble") {
      const n = a.length;
      for (let i = 0; i < n-1; i++) {
        for (let j = 0; j < n-i-1; j++) {
          if (stopRef.current) return;
          setComparing([j, j+1]);
          await sleep(220);
          if (a[j] > a[j+1]) { [a[j],a[j+1]] = [a[j+1],a[j]]; setArr([...a]); }
        }
        setSorted(s => [...s, n-1-i]);
      }
      setSorted(Array.from({length:n},(_,i)=>i));
    } else if (algo === "selection") {
      const n = a.length;
      for (let i = 0; i < n; i++) {
        let min = i;
        for (let j = i+1; j < n; j++) {
          if (stopRef.current) return;
          setComparing([min, j]);
          await sleep(220);
          if (a[j] < a[min]) min = j;
        }
        [a[i],a[min]] = [a[min],a[i]]; setArr([...a]);
        setSorted(s => [...s, i]);
      }
    } else if (algo === "insertion") {
      const n = a.length;
      setSorted([0]);
      for (let i = 1; i < n; i++) {
        let j = i;
        while (j > 0 && a[j-1] > a[j]) {
          if (stopRef.current) return;
          setComparing([j-1, j]);
          await sleep(200);
          [a[j-1],a[j]] = [a[j],a[j-1]]; setArr([...a]);
          j--;
        }
        setSorted(s => [...s, i]);
      }
      setSorted(Array.from({length:a.length},(_,i)=>i));
    }

    setComparing([]); setRunning(false);
  };

  const ALGOS = {
    bubble:    { lbl:"Bubble",    col:"#fb7185", cmp:"O(n²)" },
    selection: { lbl:"Selection", col:"#f59e0b", cmp:"O(n²)" },
    insertion: { lbl:"Insertion", col:"#a78bfa", cmp:"O(n²)*" },
  };
  const cur = ALGOS[algo];
  const maxVal = 90;

  return (
    <div>
      <div style={{ display:"flex", gap:5, justifyContent:"center", marginBottom:10, flexWrap:"wrap" }}>
        {Object.entries(ALGOS).map(([k,o]) => (
          <button key={k} onClick={()=>{setAlgo(k);reset();}} style={{
            padding:"4px 9px", borderRadius:20, cursor:"pointer",
            background:algo===k?`${o.col}1c`:"rgba(255,255,255,0.04)",
            border:`1px solid ${algo===k?o.col:"rgba(255,255,255,0.1)"}`,
            fontFamily:"'JetBrains Mono',monospace", fontSize:9, fontWeight:700,
            color:algo===k?o.col:"#475569", transition:"all 0.2s",
          }}>{o.lbl}</button>
        ))}
      </div>

      {/* Bar chart */}
      <svg viewBox="0 0 380 120" width="100%" style={{ maxHeight:120 }}>
        {arr.map((v, i) => {
          const x = 12 + i * 52;
          const h = (v / maxVal) * 80;
          const isCmp = comparing.includes(i);
          const isSrt = sorted.includes(i);
          const col = isSrt ? "#34d399" : isCmp ? cur.col : "rgba(255,255,255,0.15)";
          return (
            <g key={i}>
              <rect x={x} y={88-h} width={40} height={h} rx={4}
                fill={isSrt?"rgba(52,211,153,0.2)":isCmp?`${cur.col}28`:"rgba(255,255,255,0.06)"}
                stroke={col} strokeWidth={isCmp||isSrt?2:1}
                style={{ transition:"all 0.2s" }}/>
              <text x={x+20} y={104} textAnchor="middle" fill={col}
                fontSize="9" fontFamily="'JetBrains Mono',monospace">{v}</text>
            </g>
          );
        })}
      </svg>

      <div style={{ display:"flex", gap:8, justifyContent:"center", marginTop:8, flexWrap:"wrap" }}>
        <button onClick={reset} style={{
          padding:"5px 14px", borderRadius:20, cursor:"pointer",
          background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)",
          fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:"#475569",
        }}>↺ RESET</button>
        <button onClick={running?reset:runSort} style={{
          padding:"5px 18px", borderRadius:20, cursor:"pointer",
          background:`${cur.col}1c`, border:`1px solid ${cur.col}60`,
          fontFamily:"'JetBrains Mono',monospace", fontSize:9, fontWeight:700, color:cur.col,
        }}>{running?"⏹ STOP":"▶ SORT"}</button>
        <div style={{
          padding:"5px 12px", borderRadius:20,
          background:`${cur.col}10`, border:`1px solid ${cur.col}30`,
          fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:cur.col,
        }}>{cur.cmp}</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VISUAL: Two Pointer
// ═══════════════════════════════════════════════════════════════════════════════
function VisTwoPointer() {
  const [mode, setMode] = useState("twosum");
  const [step, setStep] = useState(-1);
  const [running, setRunning] = useState(false);
  const arr = [1, 3, 5, 7, 9, 11, 14, 17];
  const TARGET = 20;
  const timerRef = useRef();

  // Pre-computed steps for two-sum = 20
  const STEPS_TS = [
    {lo:0, hi:7, note:`${arr[0]}+${arr[7]}=18 < 20 → move lo right`},
    {lo:1, hi:7, note:`${arr[1]}+${arr[7]}=20 = 20 → FOUND!`, found:true},
  ];
  // Reverse steps
  const STEPS_REV = arr.map((_,i) => ({
    lo:i, hi:arr.length-1-i,
    note: i < arr.length/2 ? `Swap arr[${i}] ↔ arr[${arr.length-1-i}]` : "Array reversed!",
    done: i >= Math.floor(arr.length/2)
  }));

  const run = () => {
    if (running) return;
    setRunning(true); setStep(0);
    const steps = mode === "twosum" ? STEPS_TS : STEPS_REV;
    let s = 0;
    const tick = () => {
      s++;
      setStep(s);
      if (s >= steps.length) { setRunning(false); return; }
      timerRef.current = setTimeout(tick, 900);
    };
    timerRef.current = setTimeout(tick, 100);
  };
  const reset = () => { clearTimeout(timerRef.current); setStep(-1); setRunning(false); };
  useEffect(() => () => clearTimeout(timerRef.current), []);

  const steps = mode === "twosum" ? STEPS_TS : STEPS_REV;
  const cur = step >= 0 && step < steps.length ? steps[step] : steps[Math.min(step, steps.length-1)];
  const lo = step >= 0 ? (cur?.lo ?? 0) : 0;
  const hi = step >= 0 ? (cur?.hi ?? arr.length-1) : arr.length-1;
  const col = "#a78bfa";

  return (
    <div>
      <div style={{ display:"flex", gap:6, justifyContent:"center", marginBottom:10, flexWrap:"wrap" }}>
        {[["twosum",`TWO SUM = ${TARGET}`],["reverse","REVERSE ARRAY"]].map(([m,lbl]) => (
          <button key={m} onClick={()=>{setMode(m);reset();}} style={{
            padding:"5px 12px", borderRadius:20, cursor:"pointer",
            background:mode===m?"rgba(167,139,250,0.2)":"rgba(255,255,255,0.04)",
            border:`1px solid ${mode===m?col:"rgba(255,255,255,0.1)"}`,
            fontFamily:"'JetBrains Mono',monospace", fontSize:9, fontWeight:700,
            color:mode===m?col:"#475569", transition:"all 0.2s",
          }}>{lbl}</button>
        ))}
      </div>

      <svg viewBox="0 0 380 140" width="100%" style={{ maxHeight:140 }}>
        <defs>
          <filter id="tpGlw"><feGaussianBlur stdDeviation="4" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        {arr.map((v, i) => {
          const x = 10 + i * 45;
          const isLo = i === lo && step >= 0;
          const isHi = i === hi && step >= 0 && lo !== hi;
          const col2 = isLo ? "#60a5fa" : isHi ? "#fb7185" : "rgba(255,255,255,0.1)";
          const found = cur?.found && (isLo || isHi);
          return (
            <g key={i}>
              <rect x={x} y={20} width={38} height={38} rx={7}
                fill={found?"rgba(52,211,153,0.25)":isLo?"rgba(96,165,250,0.2)":isHi?"rgba(251,113,133,0.2)":"rgba(255,255,255,0.04)"}
                stroke={found?"#34d399":col2} strokeWidth={isLo||isHi?2.5:1.5}
                filter={isLo||isHi?"url(#tpGlw)":"none"}
                style={{ transition:"all 0.4s" }}/>
              <text x={x+19} y={44} textAnchor="middle" dominantBaseline="middle"
                fill={found?"#34d399":isLo?"#60a5fa":isHi?"#fb7185":"#94a3b8"}
                fontSize="13" fontFamily="'JetBrains Mono',monospace" fontWeight="700">{v}</text>
            </g>
          );
        })}

        {/* LO pointer */}
        {step >= 0 && (
          <g style={{ transform:`translateX(${lo*45}px)`, transition:"transform 0.45s cubic-bezier(0.22,1,0.36,1)" }}>
            <polygon points="29,66 36,76 22,76" fill="#60a5fa" opacity="0.9"/>
            <text x={29} y={88} textAnchor="middle" fill="#60a5fa" fontSize="8" fontFamily="'JetBrains Mono',monospace" fontWeight="700">LO</text>
          </g>
        )}
        {/* HI pointer */}
        {step >= 0 && lo !== hi && (
          <g style={{ transform:`translateX(${hi*45}px)`, transition:"transform 0.45s cubic-bezier(0.22,1,0.36,1)" }}>
            <polygon points="29,66 36,76 22,76" fill="#fb7185" opacity="0.9"/>
            <text x={29} y={88} textAnchor="middle" fill="#fb7185" fontSize="8" fontFamily="'JetBrains Mono',monospace" fontWeight="700">HI</text>
          </g>
        )}

        {/* Status text */}
        <rect x={10} y={100} width={360} height={34} rx={8}
          fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
        <text x={190} y={121} textAnchor="middle" fill={cur?.found?"#34d399":col}
          fontSize="10" fontFamily="'JetBrains Mono',monospace">
          {step < 0 ? "PRESS RUN — O(n) with only two pointers" : (cur?.note ?? "Done!")}
        </text>
      </svg>

      <div style={{ display:"flex", gap:8, justifyContent:"center", marginTop:8 }}>
        <button onClick={reset} style={{ padding:"5px 14px", borderRadius:20, cursor:"pointer", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:"#475569" }}>↺ RESET</button>
        <button onClick={running?reset:run} style={{ padding:"5px 18px", borderRadius:20, cursor:"pointer", background:"rgba(167,139,250,0.15)", border:`1px solid ${col}60`, fontFamily:"'JetBrains Mono',monospace", fontSize:9, fontWeight:700, color:col }}>
          {running?"⏹ STOP":"▶ RUN"}
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VISUAL: Prefix Sum
// ═══════════════════════════════════════════════════════════════════════════════
function VisPrefixSum() {
  const [l, setL] = useState(1);
  const [r, setR] = useState(4);
  const arr = [3, 1, 4, 1, 5, 9, 2, 6];
  const prefix = arr.reduce((acc, v, i) => { acc.push((acc[i-1]||0) + v); return acc; }, []);
  const rangeSum = r >= l ? (l > 0 ? prefix[r] - prefix[l-1] : prefix[r]) : 0;
  const col = "#4ade80";

  return (
    <div>
      <svg viewBox="0 0 380 200" width="100%" style={{ maxHeight:200 }}>
        {/* Original array */}
        <text x={4} y={22} fill="#475569" fontSize="9" fontFamily="'JetBrains Mono',monospace">ORIGINAL</text>
        {arr.map((v, i) => {
          const x = 42 + i * 42;
          const inRange = i >= l && i <= r;
          return (
            <g key={i}>
              <rect x={x} y={28} width={36} height={32} rx={6}
                fill={inRange?"rgba(74,222,128,0.18)":"rgba(255,255,255,0.05)"}
                stroke={inRange?col:"rgba(255,255,255,0.12)"} strokeWidth={inRange?2:1.5}
                style={{ transition:"all 0.3s" }}/>
              <text x={x+18} y={50} textAnchor="middle" dominantBaseline="middle"
                fill={inRange?col:"#94a3b8"} fontSize="12"
                fontFamily="'JetBrains Mono',monospace" fontWeight="700">{v}</text>
            </g>
          );
        })}

        {/* Prefix array */}
        <text x={4} y={90} fill="#475569" fontSize="9" fontFamily="'JetBrains Mono',monospace">PREFIX</text>
        {prefix.map((v, i) => {
          const x = 42 + i * 42;
          const isL = i === l - 1;
          const isR = i === r;
          return (
            <g key={i}>
              <rect x={x} y={96} width={36} height={32} rx={6}
                fill={isR?"rgba(96,165,250,0.2)":isL?"rgba(251,113,133,0.18)":"rgba(255,255,255,0.03)"}
                stroke={isR?"#60a5fa":isL?"#fb7185":"rgba(255,255,255,0.1)"} strokeWidth={isR||isL?2:1}
                style={{ transition:"all 0.3s" }}/>
              <text x={x+18} y={117} textAnchor="middle" dominantBaseline="middle"
                fill={isR?"#60a5fa":isL?"#fb7185":"#64748b"} fontSize="10"
                fontFamily="'JetBrains Mono',monospace" fontWeight="700">{v}</text>
            </g>
          );
        })}
        <text x={4} y={147} fill="#253046" fontSize="9" fontFamily="'JetBrains Mono',monospace">prefix[i]</text>

        {/* Range selector */}
        <text x={190} y={164} textAnchor="middle" fill="#60a5fa" fontSize="9"
          fontFamily="'JetBrains Mono',monospace">
          sum[{l}..{r}] = prefix[{r}] − prefix[{l-1}] = {prefix[r]} − {l > 0 ? prefix[l-1] : 0} = {rangeSum}
        </text>

        {/* Formula */}
        <rect x={10} y={173} width={360} height={24} rx={7}
          fill="rgba(74,222,128,0.06)" stroke="rgba(74,222,128,0.2)" strokeWidth="1"/>
        <text x={190} y={189} textAnchor="middle" fill={col} fontSize="9"
          fontFamily="'JetBrains Mono',monospace" fontWeight="700">
          O(1) per query after O(n) build · any range instantly
        </text>
      </svg>

      {/* Range sliders */}
      <div style={{ display:"flex", gap:10, justifyContent:"center", marginTop:4, flexWrap:"wrap", alignItems:"center" }}>
        <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:"#475569" }}>L:</div>
        {arr.map((_,i) => (
          <button key={i} onClick={()=>{ if(i<=r) setL(i); }} style={{
            width:28, height:28, borderRadius:6, cursor:"pointer",
            background:i===l?"rgba(74,222,128,0.2)":"rgba(255,255,255,0.04)",
            border:`1px solid ${i===l?col:"rgba(255,255,255,0.1)"}`,
            fontFamily:"'JetBrains Mono',monospace", fontSize:9, fontWeight:700,
            color:i===l?col:"#475569",
          }}>{i}</button>
        ))}
      </div>
      <div style={{ display:"flex", gap:10, justifyContent:"center", marginTop:4, flexWrap:"wrap", alignItems:"center" }}>
        <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:"#475569" }}>R:</div>
        {arr.map((_,i) => (
          <button key={i} onClick={()=>{ if(i>=l) setR(i); }} style={{
            width:28, height:28, borderRadius:6, cursor:"pointer",
            background:i===r?"rgba(74,222,128,0.2)":"rgba(255,255,255,0.04)",
            border:`1px solid ${i===r?col:"rgba(255,255,255,0.1)"}`,
            fontFamily:"'JetBrains Mono',monospace", fontSize:9, fontWeight:700,
            color:i===r?col:"#475569",
          }}>{i}</button>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPLEXITY TABLE
// ═══════════════════════════════════════════════════════════════════════════════
function ComplexityTable() {
  const [hov, setHov] = useState(null);
  const rows = [
    {nm:"Access by index", c:"#34d399", s:"O(1)",     i:"—",         d:"O(1)",     n:"Direct address computation — always instant"},
    {nm:"Search (unsorted)",c:"#f59e0b",s:"O(n)",     i:"O(n)",      d:"O(n)",     n:"May scan every element — no ordering to exploit"},
    {nm:"Binary Search",   c:"#38bdf8", s:"O(log n)", i:"—",         d:"—",        n:"Sorted array only · halves space each step"},
    {nm:"Insert at end",   c:"#34d399", s:"—",         i:"O(1)*",    d:"O(1)*",    n:"Amortized — occasional O(n) resize hidden"},
    {nm:"Insert at middle",c:"#fb7185", s:"—",         i:"O(n)",     d:"O(n)",     n:"Must shift all elements right to make room"},
    {nm:"Bubble/Select Sort",c:"#fb7185",s:"—",        i:"O(n²)",    d:"O(n²)",    n:"Only suitable for tiny arrays under ~50 elements"},
    {nm:"Merge / Quick Sort",c:"#4ade80",s:"—",        i:"O(n log n)",d:"O(n log n)",n:"Industry standard · Quick is in-place, Merge is stable"},
    {nm:"Prefix Sum query", c:"#60a5fa", s:"O(1)",     i:"O(n)",     d:"—",        n:"O(n) build once · any range query in O(1) forever"},
  ];
  return (
    <div style={{ overflowX:"auto", WebkitOverflowScrolling:"touch" }}>
      <table style={{ width:"100%", borderCollapse:"collapse", minWidth:480 }}>
        <thead>
          <tr>
            {["Operation","Time","Space","Notes"].map(h => (
              <th key={h} style={{ padding:"10px 14px", textAlign:"left", fontFamily:"'JetBrains Mono',monospace", fontSize:9, letterSpacing:"0.1em", color:"#2d3748", borderBottom:"1px solid rgba(255,255,255,0.06)", fontWeight:700, whiteSpace:"nowrap" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} onMouseEnter={()=>setHov(i)} onMouseLeave={()=>setHov(null)}
              style={{ borderBottom:"1px solid rgba(255,255,255,0.04)", background:hov===i?"rgba(255,255,255,0.028)":"transparent", transition:"background 0.2s" }}>
              <td style={{ padding:"10px 14px", whiteSpace:"nowrap" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ width:7, height:7, borderRadius:"50%", background:r.c, flexShrink:0, boxShadow:hov===i?`0 0 8px ${r.c}`:"none", transition:"box-shadow 0.2s" }}/>
                  <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, fontWeight:700, color:"#e2e8f0" }}>{r.nm}</span>
                </div>
               </td>
              <td style={{ padding:"10px 14px", fontFamily:"'JetBrains Mono',monospace", fontSize:11, fontWeight:r.s.includes("log")||r.s==="O(1)"||r.s==="O(1)*"?700:400, color:r.s==="—"?"#253046":r.s.includes("log")||r.s==="O(1)"||r.s==="O(1)*"?"#4ade80":"#ef4444", whiteSpace:"nowrap" }}>{r.s}</td>
              <td style={{ padding:"10px 14px", fontFamily:"'JetBrains Mono',monospace", fontSize:11, fontWeight:r.i.includes("log")||r.i==="O(1)"||r.i==="O(1)*"?700:400, color:r.i==="—"?"#253046":r.i.includes("log")||r.i==="O(1)"||r.i==="O(1)*"?"#4ade80":"#ef4444", whiteSpace:"nowrap" }}>{r.i}</td>
              <td style={{ padding:"10px 14px", fontFamily:"'DM Sans',sans-serif", fontSize:11, color:"#475569" }}>{r.n}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// KEYBOARD SHORTCUTS MODAL
// ═══════════════════════════════════════════════════════════════════════════════
function ShortcutsModal({ open, onClose }) {
  if (!open) return null;
  return (
    <div style={{
      position:"fixed", inset:0, zIndex:2000, display:"flex", alignItems:"center", justifyContent:"center",
      background:"rgba(0,0,0,0.72)", backdropFilter:"blur(10px)",
      animation:"fadeIn 0.2s ease",
    }} onClick={onClose}>
      <div style={{
        background:"rgba(8,12,24,0.98)", border:"1px solid rgba(96,165,250,0.35)",
        borderRadius:24, padding:"32px 36px", maxWidth:420, width:"calc(100% - 40px)",
        boxShadow:"0 24px 80px rgba(0,0,0,0.8)",
        animation:"popIn 0.25s cubic-bezier(0.22,1,0.36,1) both",
      }} onClick={e=>e.stopPropagation()}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
          <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:800, color:"#f8fafc", margin:0 }}>⌨️ Shortcuts</h3>
          <button onClick={onClose} style={{ background:"none", border:"1px solid rgba(255,255,255,0.1)", color:"#64748b", cursor:"pointer", borderRadius:8, padding:"4px 10px", fontFamily:"'JetBrains Mono',monospace", fontSize:10 }}>ESC</button>
        </div>
        {[
          ["S","Stop current narration"],
          ["↑ / ↓","Navigate sections"],
          ["?","Toggle this panel"],
          ["Esc","Close panels"],
        ].map(([k,d]) => (
          <div key={k} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
            <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, color:"#94a3b8" }}>{d}</span>
            <kbd style={{ background:"rgba(96,165,250,0.15)", border:"1px solid rgba(96,165,250,0.35)", borderRadius:6, padding:"3px 10px", fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:"#60a5fa", fontWeight:700 }}>{k}</kbd>
          </div>
        ))}
        <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:"#253046", marginTop:18, textAlign:"center", letterSpacing:"0.08em" }}>PRESS ? ANYWHERE TO TOGGLE</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// QUIZ
// ═══════════════════════════════════════════════════════════════════════════════
function Quiz({ onDone }) {
  const QS = [
    {q:"What is the time complexity of accessing an element by index in an array?",
     opts:["O(log n)","O(n)","O(1)","O(n²)"],ans:2,
     exp:"Array access = base + i × size — a single arithmetic operation. Always O(1) regardless of array size."},
    {q:"You insert an element at index 2 in a 10-element array. How many elements must shift?",
     opts:["2","7","8","10"],ans:2,
     exp:"Elements at indices 2 through 9 must each shift one position right — that is 8 elements. This is why mid-insertion is O(n)."},
    {q:"Binary search requires the array to be:",
     opts:["Unsorted","Sorted","Full","Indexed from 1"],ans:1,
     exp:"Binary search works by halving the search space using the sorted order. On an unsorted array, it produces wrong results."},
    {q:"A dynamic array (like Python list) is full and you append. What happens?",
     opts:["Error is thrown","Inserts at front","Allocates bigger block, copies all elements, appends","Discards oldest element"],ans:2,
     exp:"A new block (usually double the capacity) is allocated, all elements are copied over, then the new element is added. Amortized O(1)."},
    {q:"Which sorting algorithm has O(n log n) time in ALL cases, uses O(n) extra space, and is stable?",
     opts:["Quick Sort","Bubble Sort","Merge Sort","Selection Sort"],ans:2,
     exp:"Merge Sort always runs O(n log n) due to its divide-and-conquer guarantee. It is stable and uses O(n) extra space for merging."},
    {q:"Prefix sum array enables range sum queries in:",
     opts:["O(n) per query","O(1) per query after O(n) build","O(log n) per query","O(n²) total"],ans:1,
     exp:"After O(n) preprocessing, sum(l,r) = prefix[r] − prefix[l−1], computed in O(1). This is one of the most powerful array tricks."},
  ];

  const [ans, setAns] = useState({});
  const [rev, setRev] = useState({});
  const score = Object.entries(ans).filter(([qi,ai]) => QS[+qi].ans === +ai).length;
  useEffect(() => { if (Object.keys(rev).length === QS.length) onDone?.(score, QS.length); }, [rev]);
  const answered = Object.keys(rev).length;

  return (
    <div>
      <div style={{ marginBottom:20 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:"#2d3748", letterSpacing:"0.08em" }}>PROGRESS</span>
          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:"#60a5fa", fontWeight:700 }}>{answered}/{QS.length}</span>
        </div>
        <div style={{ height:4, background:"rgba(255,255,255,0.06)", borderRadius:99, overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${(answered/QS.length)*100}%`, background:"linear-gradient(90deg,#3b82f6,#34d399)", borderRadius:99, transition:"width 0.5s cubic-bezier(0.22,1,0.36,1)" }}/>
        </div>
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
        {QS.map((q, qi) => {
          const isR = rev[qi];
          const bc = isR ? (ans[qi]===q.ans?"rgba(74,222,128,0.35)":"rgba(239,68,68,0.35)") : "rgba(255,255,255,0.07)";
          return (
            <div key={qi} style={{ padding:"16px 18px", borderRadius:16, background:"rgba(255,255,255,0.02)", border:`1px solid ${bc}`, transition:"border-color 0.3s" }}>
              <div style={{ display:"flex", gap:10, marginBottom:12, alignItems:"flex-start" }}>
                <span style={{
                  width:24, height:24, borderRadius:8, flexShrink:0, marginTop:1,
                  background:isR?(ans[qi]===q.ans?"rgba(74,222,128,0.2)":"rgba(239,68,68,0.2)"):"rgba(96,165,250,0.15)",
                  border:`1px solid ${isR?(ans[qi]===q.ans?"rgba(74,222,128,0.42)":"rgba(239,68,68,0.42)"):"rgba(96,165,250,0.32)"}`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontFamily:"'JetBrains Mono',monospace", fontSize:9, fontWeight:700,
                  color:isR?(ans[qi]===q.ans?"#4ade80":"#ef4444"):"#60a5fa",
                }}>{qi+1}</span>
                <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:600, color:"#e2e8f0", lineHeight:1.52 }}>{q.q}</div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7 }}>
                {q.opts.map((opt, oi) => {
                  const isSel = ans[qi]===oi, isCorr = q.ans===oi;
                  let bg="rgba(255,255,255,0.03)", brd="rgba(255,255,255,0.07)", col="#64748b";
                  if (isR) {
                    if (isCorr){bg="rgba(74,222,128,0.12)";brd="rgba(74,222,128,0.38)";col="#4ade80";}
                    else if (isSel){bg="rgba(239,68,68,0.12)";brd="rgba(239,68,68,0.38)";col="#f87171";}
                    else col="#2d3748";
                  } else if (isSel){bg="rgba(96,165,250,0.12)";brd="rgba(96,165,250,0.38)";col="#60a5fa";}
                  return (
                    <button key={oi} onClick={()=>!isR&&setAns(a=>({...a,[qi]:oi}))} style={{
                      padding:"9px 12px", borderRadius:10, cursor:isR?"default":"pointer",
                      background:bg, border:`1px solid ${brd}`,
                      fontFamily:"'DM Sans',sans-serif", fontSize:13, color:col,
                      textAlign:"left", transition:"all 0.22s", display:"flex", alignItems:"center", gap:8,
                    }}>
                      <span style={{
                        width:19, height:19, borderRadius:"50%", flexShrink:0,
                        background:isR?(isCorr?"rgba(74,222,128,0.26)":isSel?"rgba(239,68,68,0.26)":"rgba(255,255,255,0.04)"):(isSel?"rgba(96,165,250,0.26)":"rgba(255,255,255,0.04)"),
                        border:`1px solid ${col}50`,
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontFamily:"'JetBrains Mono',monospace", fontSize:9, fontWeight:700, color:col,
                      }}>{isR&&isCorr?"✓":isR&&isSel&&!isCorr?"✗":String.fromCharCode(65+oi)}</span>
                      {opt}
                    </button>
                  );
                })}
              </div>
              {ans[qi]!==undefined && !isR && (
                <button onClick={()=>setRev(r=>({...r,[qi]:true}))} style={{ marginTop:10, padding:"6px 18px", borderRadius:20, cursor:"pointer", background:"rgba(96,165,250,0.12)", border:"1px solid rgba(96,165,250,0.3)", fontFamily:"'JetBrains Mono',monospace", fontSize:9, fontWeight:700, color:"#60a5fa" }}>CHECK →</button>
              )}
              {isR && (
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
// FLOATING VOICE MINI PLAYER
// ═══════════════════════════════════════════════════════════════════════════════
function MiniPlayer({ speaking, speakingLabel, onStop, speed }) {
  if (!speaking) return null;
  return (
    <div style={{
      position:"fixed", bottom:24, left:"50%", transform:"translateX(-50%)",
      zIndex:850, display:"flex", alignItems:"center", gap:12,
      padding:"10px 20px", borderRadius:99,
      background:"rgba(8,12,24,0.94)", backdropFilter:"blur(24px)",
      border:"1px solid rgba(96,165,250,0.3)",
      boxShadow:"0 8px 36px rgba(96,165,250,0.15), 0 2px 12px rgba(0,0,0,0.6)",
      animation:"slideUp 0.35s cubic-bezier(0.22,1,0.36,1) both",
      maxWidth:"calc(100vw - 48px)",
    }}>
      <SpeakingWave color="#60a5fa" size={16}/>
      <div>
        <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:600, color:"#e2e8f0", lineHeight:1 }}>{speakingLabel}</div>
        <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:"#60a5fa", marginTop:2 }}>{speed}× speed · male voice</div>
      </div>
      <button onClick={onStop} style={{
        background:"rgba(239,68,68,0.15)", border:"1px solid rgba(239,68,68,0.35)",
        borderRadius:20, cursor:"pointer", padding:"4px 12px",
        fontFamily:"'JetBrains Mono',monospace", fontSize:9, fontWeight:700, color:"#f87171",
        transition:"all 0.2s",
      }}>⏹ STOP</button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function ArrayPage() {
  const router = useRouter();
  const [speaking, setSpeaking] = useState(null);
  const [active,   setActive]   = useState("intro");
  const [qScore,   setQScore]   = useState(null);
  const [qTotal,   setQTotal]   = useState(null);
  const [speed,    setSpeed]    = useState(1.25);
  const [seenSections, setSeenSections] = useState(new Set());
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const currentNarr = useRef(null);

  /* Load fonts + warm-up voices */
  useEffect(() => {
    const lk = document.createElement("link");
    lk.rel  = "stylesheet";
    lk.href = "https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;700&display=swap";
    document.head.appendChild(lk);
    const warm = () => { window.speechSynthesis?.getVoices(); window.removeEventListener("click", warm); };
    window.addEventListener("click", warm);
    return () => { try { document.head.removeChild(lk); } catch {} };
  }, []);

  /* Active section tracker */
  useEffect(() => {
    const io = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          setActive(e.target.id);
          setSeenSections(s => new Set([...s, e.target.id]));
        }
      }),
      { rootMargin:"-35% 0px -35% 0px" }
    );
    NAV_SECTIONS.forEach(s => { const el = document.getElementById(s.id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, []);

  /* Keyboard shortcuts */
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.key === "?" || e.key === "/") { e.preventDefault(); setShortcutsOpen(o => !o); }
      if (e.key === "Escape") { setShortcutsOpen(false); }
      if (e.key === "s" || e.key === "S") { voiceStop(); setSpeaking(null); }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const idx = NAV_SECTIONS.findIndex(s => s.id === active);
        const next = NAV_SECTIONS[Math.min(idx + 1, NAV_SECTIONS.length - 1)];
        if (next) document.getElementById(next.id)?.scrollIntoView({ behavior:"smooth" });
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        const idx = NAV_SECTIONS.findIndex(s => s.id === active);
        const prev = NAV_SECTIONS[Math.max(idx - 1, 0)];
        if (prev) document.getElementById(prev.id)?.scrollIntoView({ behavior:"smooth" });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  const handleVoice = useCallback((id, text) => {
    if (speaking === id) { voiceStop(); setSpeaking(null); currentNarr.current = null; }
    else {
      currentNarr.current = { id, text };
      setSpeaking(id);
      voiceSpeak(text, () => { setSpeaking(null); currentNarr.current = null; }, currentRate);
    }
  }, [speaking]);

  const handleRestart = useCallback(() => {
    if (currentNarr.current) {
      const { id, text } = currentNarr.current;
      voiceStop();
      setTimeout(() => voiceSpeak(text, () => { setSpeaking(null); currentNarr.current = null; }, currentRate), 80);
    }
  }, []);

  const handleStop = useCallback(() => { voiceStop(); setSpeaking(null); currentNarr.current = null; }, []);

  const speakingLabel = speaking
    ? (NAV_SECTIONS.find(s => s.id === speaking)?.label ?? (speaking === "__hero__" ? "Introduction" : speaking))
    : null;

  const goTree = () => router.push("/tree");
  const goIntro = () => document.getElementById("intro")?.scrollIntoView({ behavior:"smooth" });

  const SECTS = [
    { id:"intro", icon:"📦", title:"What is an Array?", color:"#60a5fa", voice:NARR.intro,
      visual:<VisIntro/>,
      cards:[
        {lbl:"DEFINITION",     body:"A fixed-size, ordered collection of elements stored in contiguous memory. Each element is accessed directly by its integer index in O(1) time."},
        {lbl:"REAL-WORLD USE", body:"Pixel buffers, audio samples, lookup tables, matrix operations, string characters, and the backing storage for almost every other data structure."},
        {lbl:"THE KEY POWER",  body:"Index arithmetic: address = base + index × size. Any element in the entire array reachable in exactly one step — no searching, no pointer chasing."},
        {lbl:"WHY ARRAYS FIRST",body:"Every other data structure — stacks, queues, heaps, hash tables — is built on or explained relative to arrays. This is the foundation."},
      ]},
    { id:"memory", icon:"🧱", title:"Memory Layout", color:"#34d399", voice:NARR.memory,
      visual:<VisMemory/>,
      cards:[
        {lbl:"CONTIGUOUS BLOCK",body:"All elements occupy one unbroken region of RAM. No gaps, no pointers between elements — just raw data packed side by side."},
        {lbl:"ADDRESS FORMULA", body:"address(i) = base + i × sizeof(element). For a 4-byte int array starting at 1000: arr[3] lives at address 1012."},
        {lbl:"WHY O(1) ACCESS", body:"The CPU can compute any address with one multiplication and one addition. Whether the array has 10 or 10 million elements, it is always two arithmetic ops."},
        {lbl:"VS LINKED LIST",  body:"A linked list node can be anywhere in RAM — you must follow pointers sequentially. For random access, an array is always faster by a wide margin."},
      ]},
    { id:"operations", icon:"⚡", title:"Core Operations", color:"#f59e0b", voice:NARR.operations,
      visual:<VisOperations/>,
      cards:[
        {lbl:"ACCESS — O(1)",   body:"Instant. Direct computation. This is the defining operation of arrays — the entire structure is designed around making this as fast as possible."},
        {lbl:"SEARCH — O(n)",   body:"Without sorting, you may check every element. With sorting, binary search gives O(log n) — but sorting costs O(n log n) upfront."},
        {lbl:"INSERT — O(n)",   body:"Adding at the end is O(1) amortized. Adding anywhere else requires shifting all subsequent elements right — can touch every element."},
        {lbl:"DELETE — O(n)",   body:"Removing from the end is O(1). Removing from the middle leaves a gap — filling it requires shifting all elements left to maintain contiguity."},
      ]},
    { id:"types", icon:"🗂️", title:"Types of Arrays", color:"#818cf8", voice:NARR.types,
      visual:<VisTypes/>,
      cards:[
        {lbl:"1D — CLASSIC",    body:"Single linear sequence. The most fundamental form. Accessing element i is as simple as arr[i]. Used everywhere."},
        {lbl:"2D — MATRIX",     body:"Table of rows and columns. arr[row][col]. Used for images, game boards, adjacency matrices, and mathematical operations."},
        {lbl:"DYNAMIC ARRAY",   body:"Grows automatically. When full, allocates a block typically twice the size and copies all data. Amortized O(1) append. Python list, Java ArrayList."},
        {lbl:"JAGGED ARRAY",    body:"Array of arrays, each inner array can have a different length. More flexible than rectangular 2D arrays. Common in triangle matrices."},
      ]},
    { id:"searching", icon:"🔎", title:"Searching Arrays", color:"#38bdf8", voice:NARR.searching,
      visual:<VisSearching/>,
      cards:[
        {lbl:"LINEAR SEARCH",   body:"Start at index 0 and check each element until a match or end is reached. Works on any array — O(n) worst case. Simple, always correct."},
        {lbl:"BINARY SEARCH",   body:"Requires sorted array. Compare target to middle element, discard the impossible half, repeat. O(log n) — 30 steps for 1 billion elements."},
        {lbl:"THE TRADE-OFF",   body:"Sorting costs O(n log n) upfront. Only worth it if you search many times. One search on a small array? Linear is usually faster in practice."},
        {lbl:"BINARY SEARCH BUGS",body:"Off-by-one errors are extremely common. The canonical safe formula for mid is lo + (hi − lo) / 2, which prevents integer overflow."},
      ]},
    { id:"sorting", icon:"🔢", title:"Sorting Algorithms", color:"#fb7185", voice:NARR.sorting,
      visual:<VisSorting/>,
      cards:[
        {lbl:"BUBBLE SORT O(n²)",body:"Compares adjacent pairs, swaps if out of order, repeats. Simple to understand, terrible in practice. Never use on more than ~50 elements."},
        {lbl:"SELECTION O(n²)", body:"Finds the minimum each pass and places it. Makes the fewest swaps of any O(n²) algorithm — useful when writes are extremely expensive."},
        {lbl:"INSERTION O(n²)", body:"Builds a sorted left portion. Excellent on nearly-sorted data — becomes O(n) in that case. This is why it is used in Timsort's finishing pass."},
        {lbl:"MERGE / QUICK",   body:"Merge Sort: O(n log n) always, stable, O(n) space. Quick Sort: O(n log n) average, O(1) space, O(n²) worst case. Both are industry standard."},
      ]},
    { id:"twopointer", icon:"👆", title:"Two-Pointer Technique", color:"#a78bfa", voice:NARR.twopointer,
      visual:<VisTwoPointer/>,
      cards:[
        {lbl:"CORE IDEA",       body:"Place one pointer at each end. Move them toward each other based on a condition. Turns many O(n²) problems into O(n) with O(1) extra space."},
        {lbl:"TWO SUM (SORTED)",body:"If sum < target → move left pointer right. If sum > target → move right pointer left. Finds the pair in one pass. Classic interview problem."},
        {lbl:"SLIDING WINDOW",  body:"Both pointers move in the same direction. Used for max subarray sum, longest substring without repeats, minimum window substring."},
        {lbl:"REVERSAL IN-PLACE",body:"Swap arr[lo] and arr[hi], then lo++ and hi--. Reverses the entire array in O(n/2) swaps with zero extra memory. Pure elegance."},
      ]},
    { id:"prefixsum", icon:"∑", title:"Prefix Sum & Kadane's", color:"#4ade80", voice:NARR.prefixsum,
      visual:<VisPrefixSum/>,
      cards:[
        {lbl:"PREFIX SUM BUILD", body:"prefix[i] = prefix[i−1] + arr[i]. One pass, O(n) time, O(n) space. Build it once and answer any range query in O(1) forever."},
        {lbl:"RANGE QUERY O(1)", body:"sum(l, r) = prefix[r] − prefix[l−1]. What once required iterating through the range now requires exactly one subtraction."},
        {lbl:"KADANE'S ALGORITHM",body:"Maximum subarray sum in O(n) and O(1) space. Keep a running sum — reset to zero when it goes negative. Track the global maximum seen so far."},
        {lbl:"APPLICATIONS",    body:"Subarray sum = k, counting subarrays with given XOR, 2D range sum queries, histogram problems, and many dynamic programming optimizations."},
      ]},
  ];

  return (
    <div style={{ background:"#060810", color:"#f8fafc", minHeight:"100vh", overflowX:"hidden" }}>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        ::selection{background:rgba(96,165,250,0.42)}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(96,165,250,0.38);border-radius:8px}
        ::-webkit-scrollbar-thumb:hover{background:rgba(96,165,250,0.58)}

        @keyframes hOrb1{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(22px,-16px) scale(1.06)}66%{transform:translate(-12px,9px) scale(0.96)}}
        @keyframes hOrb2{0%,100%{transform:translate(0,0)}42%{transform:translate(-20px,14px)}84%{transform:translate(14px,-9px)}}
        @keyframes sRight{from{opacity:0;transform:translateX(26px)}to{opacity:1;transform:translateX(0)}}
        @keyframes fUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes popIn{from{opacity:0;transform:scale(0.88) translateY(12px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes panelPop{from{opacity:0;transform:translateY(-8px) scale(0.96)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes slideUp{from{opacity:0;transform:translate(-50%,20px)}to{opacity:1;transform:translate(-50%,0)}}
        @keyframes wave{0%,100%{transform:scaleY(0.4)}50%{transform:scaleY(1)}}
        @keyframes arrCell{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes cellRip{from{opacity:0.5;transform:scale(0.9)}to{opacity:0;transform:scale(1.25)}}
        @keyframes pulse { 0% { opacity: 0.7; transform: scale(0.98); } 100% { opacity: 1; transform: scale(1); } }

        @media(max-width:760px){
          .sg{grid-template-columns:1fr !important}
          .nav-pills button{width:30px !important;height:30px !important;font-size:13px !important}
        }
        @media(max-width:480px){
          .sg{gap:12px !important}
        }
      `}</style>

      <ProgressBar/>
      <StickyNav active={active} speaking={speaking} speed={speed} setSpeed={setSpeed} onRestart={handleRestart}/>
      <BackToTop/>
      <ShortcutsModal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)}/>
      <MiniPlayer speaking={speaking} speakingLabel={speakingLabel} onStop={handleStop} speed={speed}/>

      <Hero
        onStart={goIntro}
        onVoice={() => handleVoice("__hero__", NARR.intro)}
      />

      <div style={{
        textAlign:"center", marginBottom:32,
        fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:"#1e2a38", letterSpacing:"0.1em",
      }}>
        PRESS <kbd style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:5, padding:"1px 7px", color:"#2d3748" }}>?</kbd> FOR KEYBOARD SHORTCUTS
      </div>

      <main style={{ maxWidth:1000, margin:"0 auto", padding:"0 20px 100px" }}>

        {SECTS.map(s => (
          <Sect key={s.id} id={s.id} icon={s.icon} title={s.title}
            color={s.color} visual={s.visual} cards={s.cards}
            voice={s.voice} speaking={speaking} onVoice={handleVoice}
            seen={seenSections.has(s.id)}/>
        ))}

        {/* ── Complexity Cheat Sheet ─────────────────────────────── */}
        <section id="complexity" style={{ marginBottom:80 }}>
          <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:22, flexWrap:"wrap" }}>
            <div style={{ width:50, height:50, borderRadius:16, flexShrink:0,
              background:"rgba(96,165,250,0.12)", border:"1px solid rgba(96,165,250,0.32)",
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:24,
              boxShadow:"0 0 28px rgba(96,165,250,0.15)" }}>⚡</div>
            <div>
              <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:"clamp(19px,3.8vw,30px)", fontWeight:800, color:"#f8fafc" }}>Complexity Cheat Sheet</h2>
              <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:"#2d3748", marginTop:3, letterSpacing:"0.08em" }}>GREEN = FAST · RED = SLOW · HOVER ROWS TO HIGHLIGHT</p>
            </div>
          </div>
          <div style={{ borderRadius:22, overflow:"hidden", background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)" }}>
            <ComplexityTable/>
          </div>
          <div style={{ display:"flex", gap:16, marginTop:12, flexWrap:"wrap" }}>
            {[["🟢 O(1)","constant time — best possible"],["🟢 O(log n)","optimal search"],["🔴 O(n²)","avoid for large n"]].map(([k,v]) => (
              <div key={k} style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:"#2d3748" }}>
                {k}<span style={{ color:"#1a2030" }}> = {v}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Quiz Section ───────────────────────────────────────── */}
        <section id="quiz" style={{ marginBottom:80 }}>
          <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:8, flexWrap:"wrap" }}>
            <div style={{ width:50, height:50, borderRadius:16, flexShrink:0,
              background:"rgba(236,72,153,0.12)", border:"1px solid rgba(236,72,153,0.32)",
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:24,
              boxShadow:"0 0 28px rgba(236,72,153,0.15)" }}>🧠</div>
            <div style={{ flex:1, minWidth:0 }}>
              <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:"clamp(19px,3.8vw,30px)", fontWeight:800, color:"#f8fafc" }}>Test Your Knowledge</h2>
              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:"#475569", marginTop:3 }}>6 questions · covers every section · some are tricky</p>
            </div>
            <button onClick={()=>handleVoice("quiz",NARR.quiz)} style={{
              display:"flex", alignItems:"center", gap:7,
              padding:"7px 14px", borderRadius:28, cursor:"pointer", flexShrink:0,
              background:speaking==="quiz"?"rgba(236,72,153,0.2)":"rgba(255,255,255,0.04)",
              border:`1.5px solid ${speaking==="quiz"?"#ec4899":"rgba(255,255,255,0.1)"}`,
              fontFamily:"'JetBrains Mono',monospace", fontSize:9, fontWeight:700,
              color:speaking==="quiz"?"#ec4899":"#475569", transition:"all 0.22s",
            }}>
              {speaking==="quiz"?<SpeakingWave color="#ec4899" size={12}/>:<span style={{fontSize:12}}>🔊</span>}
              {speaking==="quiz"?"STOP":"LISTEN"}
            </button>
          </div>

          <div style={{ marginBottom:22 }}/>
          <Quiz onDone={(sc,tot)=>{ setQScore(sc); setQTotal(tot); }}/>

          {qScore !== null && (
            <div style={{
              marginTop:30, padding:"36px 24px", borderRadius:24, textAlign:"center",
              background:`linear-gradient(138deg,${qScore>=5?"rgba(74,222,128,0.1)":qScore>=3?"rgba(251,191,36,0.1)":"rgba(239,68,68,0.1)"} 0%,rgba(0,0,0,0) 100%)`,
              border:`1px solid ${qScore>=5?"rgba(74,222,128,0.32)":qScore>=3?"rgba(251,191,36,0.32)":"rgba(239,68,68,0.32)"}`,
              animation:"fUp 0.5s ease",
            }}>
              <div style={{ fontSize:52, marginBottom:12 }}>{qScore>=5?"🏆":qScore>=3?"🌟":"💪"}</div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:40, fontWeight:800,
                color:qScore>=5?"#4ade80":qScore>=3?"#fbbf24":"#f87171" }}>
                {qScore} / {qTotal}
              </div>
              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:15, color:"#94a3b8", margin:"10px 0 24px", lineHeight:1.55 }}>
                {qScore>=5
                  ? "Outstanding! You have genuinely mastered array data structures."
                  : qScore>=3
                  ? "Solid work. Review the sections you missed, then retry."
                  : "Keep going — re-read the sections above and come back stronger."}
              </p>
              <button onClick={goTree} style={{
                padding:"14px 34px", borderRadius:16, cursor:"pointer",
                background:"linear-gradient(135deg,#3b82f6 0%,#34d399 100%)",
                border:"none", fontFamily:"'Syne',sans-serif", fontSize:16, fontWeight:700,
                color:"#fff", boxShadow:"0 8px 32px rgba(59,130,246,0.42)",
                transition:"all 0.25s", display:"inline-flex", alignItems:"center", gap:11,
              }}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 14px 44px rgba(59,130,246,0.58)";}}
                onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="0 8px 32px rgba(59,130,246,0.42)";}}>
                <span>Next: Tree Data Structure</span>
                <span style={{ fontSize:20 }}>→</span>
              </button>
            </div>
          )}
        </section>

        {/* ── Footer CTA (enhanced) ─────────────────────────────── */}
        <div style={{
          textAlign:"center", padding:"48px 24px", borderRadius:26,
          background:"linear-gradient(140deg,rgba(96,165,250,0.09) 0%,rgba(52,211,153,0.07) 50%,rgba(245,158,11,0.06) 100%)",
          border:"1px solid rgba(96,165,250,0.18)",
          position:"relative", overflow:"hidden",
        }}>
          <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(circle,rgba(96,165,250,0.04) 1px,transparent 1px)", backgroundSize:"30px 30px", pointerEvents:"none" }}/>
          <div style={{ fontSize:48, marginBottom:14 }}>📦</div>
          <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:"clamp(17px,3.2vw,26px)", fontWeight:800, color:"#f8fafc", marginBottom:12 }}>
            You have completed the Array guide!
          </h3>
          <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, color:"#64748b", maxWidth:440, margin:"0 auto 28px", lineHeight:1.72 }}>
            Implement these yourself. Write a dynamic array from scratch, then add binary search and a sorting algorithm.
            Writing the code makes every concept permanent.
          </p>

          {/* Section badges */}
          <div style={{ display:"flex", gap:6, justifyContent:"center", flexWrap:"wrap", marginBottom:24 }}>
            {NAV_SECTIONS.map(s => (
              <div key={s.id} style={{
                padding:"4px 12px", borderRadius:20,
                background:seenSections.has(s.id)?`${s.col}18`:"rgba(255,255,255,0.03)",
                border:`1px solid ${seenSections.has(s.id)?`${s.col}38`:"rgba(255,255,255,0.06)"}`,
                fontFamily:"'JetBrains Mono',monospace", fontSize:9, fontWeight:700,
                color:seenSections.has(s.id)?s.col:"#1a2030", transition:"all 0.3s",
              }}>
                {s.icon} {s.label} {seenSections.has(s.id)?"✓":""}
              </div>
            ))}
          </div>

          <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:"#2d3748", marginBottom:32 }}>
            {seenSections.size} / {NAV_SECTIONS.length} sections visited
            {seenSections.size === NAV_SECTIONS.length && (
              <span style={{ marginLeft:8, color:"#fbbf24", animation:"pulse 0.6s infinite" }}>✨ Complete! ✨</span>
            )}
          </div>

          {/* Enhanced next steps */}
          <div style={{
            display:"flex", flexWrap:"wrap", gap:16, justifyContent:"center",
            marginBottom:32, alignItems:"stretch",
          }}>
            <button
              onClick={goTree}
              style={{
                flex:"1", minWidth:200, padding:"14px 24px", borderRadius:20, cursor:"pointer",
                background:"linear-gradient(135deg,#3b82f6 0%,#34d399 100%)",
                border:"none", fontFamily:"'Syne',sans-serif", fontSize:16, fontWeight:700,
                color:"#fff", boxShadow:"0 8px 32px rgba(59,130,246,0.42)",
                transition:"all 0.25s", display:"inline-flex", alignItems:"center", justifyContent:"center", gap:11,
              }}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 14px 44px rgba(59,130,246,0.58)";}}
              onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="0 8px 32px rgba(59,130,246,0.42)";}}
            >
              <span>🌲 Next: Tree Data Structure</span>
              <span style={{ fontSize:20 }}>→</span>
            </button>

            <button
              onClick={() => window.scrollTo({ top:0, behavior:"smooth" })}
              style={{
                flex:"1", minWidth:140, padding:"14px 24px", borderRadius:20, cursor:"pointer",
                background:"rgba(96,165,250,0.1)", border:"1.5px solid rgba(96,165,250,0.3)",
                fontFamily:"'Syne',sans-serif", fontSize:15, fontWeight:600,
                color:"#60a5fa", transition:"all 0.25s", display:"flex", alignItems:"center", justifyContent:"center", gap:8,
              }}
              onMouseEnter={e=>{e.currentTarget.style.background="rgba(96,165,250,0.2)";e.currentTarget.style.borderColor="rgba(96,165,250,0.5)";}}
              onMouseLeave={e=>{e.currentTarget.style.background="rgba(96,165,250,0.1)";e.currentTarget.style.borderColor="rgba(96,165,250,0.3)";}}
            >
              <span>📚</span> Review from Top
            </button>

            <button
              onClick={() => setShortcutsOpen(true)}
              style={{
                flex:"0 0 auto", padding:"14px 24px", borderRadius:20, cursor:"pointer",
                background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.1)",
                fontFamily:"'JetBrains Mono',monospace", fontSize:12, fontWeight:600,
                color:"#64748b", transition:"all 0.2s", display:"flex", alignItems:"center", gap:8,
              }}
              onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.07)";e.currentTarget.style.color="#94a3b8";}}
              onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.03)";e.currentTarget.style.color="#64748b";}}
            >
              <span>⌨️</span> VIEW KEYBOARD SHORTCUTS
            </button>
          </div>

          <div style={{
            marginTop: 20, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.05)",
            fontSize: 10, fontFamily: "'JetBrains Mono',monospace", color: "#2d3748"
          }}>
            💡 Pro tip: Revisit sections by clicking their badges above. Solid understanding of arrays unlocks all other data structures.
          </div>
        </div>

      </main>
    </div>
  );
}