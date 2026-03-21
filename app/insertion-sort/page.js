"use client"
import { useState, useEffect, useRef, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════════════════════
// VOICE ENGINE — Premium male voice at 1.25x fixed
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

function voiceSpeak(text, onEnd) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const go = () => {
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.25; u.pitch = 0.92; u.volume = 1;
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
  intro: `Insertion Sort is the algorithm you already know. Think about how you sort playing cards in your hand. You pick up cards one at a time, and each new card gets slid into its correct position among the cards you're already holding. That is exactly what Insertion Sort does. It maintains a sorted portion on the left, and one by one, takes each new element and inserts it into its correct place. It is simple. It is intuitive. And for small arrays or nearly-sorted data, it can beat algorithms like Merge Sort and Quick Sort in raw speed. The best engineers know when to reach for it.`,
  howItWorks: `The algorithm walks through the array from left to right. At each step, we have a key — the current element we want to place. We compare it against the elements to its left, shifting each one rightward until we find the correct spot. Then we drop the key in. After every pass, the left portion grows by one sorted element. It is like inserting a book onto a shelf where all the other books are already alphabetized. You don't re-sort all the books. You just find the right gap and slide it in.`,
  invariant: `An invariant is something that stays true at every step of an algorithm. For Insertion Sort, the invariant is: after processing position i, the subarray from index 0 to i is sorted. Always. We can prove this by induction: before the first element, the array of one element is trivially sorted. Each insertion step maintains the sorted property. Therefore, when we finish processing the last element, the entire array is sorted. This invariant is the mathematical guarantee that the algorithm is correct.`,
  complexity: `The time complexity depends entirely on the input. In the best case — a perfectly sorted array — Insertion Sort runs in O of n time. It simply compares each element once against its neighbor and moves on. No shifts needed. This is linear! In the worst case — a reverse-sorted array — every element must shift past all preceding elements. That is one plus two plus three up to n minus one shifts, which sums to O of n squared. The average case, with random input, is also O of n squared. But here is the key insight: for small arrays or nearly-sorted data, the constants are so small that Insertion Sort outperforms theoretically superior algorithms.`,
  adaptive: `Insertion Sort is adaptive. This means it runs faster on nearly-sorted data. If every element is at most k positions away from its sorted position, Insertion Sort runs in O of k times n time — much faster than O of n squared. Tim Sort, the algorithm used in Python and Java, exploits this exactly. It detects naturally-sorted runs in real data and uses Insertion Sort on them, then merges the results. This is why Insertion Sort is still relevant today — not as a standalone solution for large data, but as a critical sub-routine in the world's most deployed sorting algorithm.`,
  stable: `Insertion Sort is stable. When two elements are equal, the one that appeared earlier in the input will appear earlier in the output. This happens naturally from the algorithm's logic. When we scan leftward looking for the insertion point, we stop as soon as we find an element less than or equal to our key. We never slide an equal element rightward past our key. So equal elements always preserve their original order. This stability makes Insertion Sort safe to use in multi-key sorting scenarios where relative order within equal groups must be preserved.`,
  binary: `Binary Insertion Sort is a clever optimization. Instead of scanning linearly leftward to find the insertion point, we use binary search to locate it in O of log n comparisons. This brings the total number of comparisons down to O of n log n — the same as Merge Sort. However, the number of shifts remains O of n squared, because we still need to physically move elements rightward to open up the gap. So the improvement in comparisons does not change the overall worst-case time complexity. It is most useful when comparisons are expensive — for example, sorting strings or complex objects — and shifts are cheap.`,
  quiz: `You have reached the quiz. You studied the card-sorting intuition, the step-by-step algorithm, the sorted invariant, time and space complexity, adaptivity on nearly-sorted data, stability, and binary insertion sort. Some questions test deep understanding, not just memorization. A wrong answer is the fastest path to permanent knowledge. Take your time.`,
};

const NAV_SECTIONS = [
  { id:"intro",      icon:"🃏", label:"Intro",      col:"#f59e0b" },
  { id:"howitworks", icon:"⚙️",  label:"Algorithm",  col:"#38bdf8" },
  { id:"invariant",  icon:"🔒", label:"Invariant",  col:"#a78bfa" },
  { id:"complexity", icon:"📊", label:"Complexity", col:"#fb923c" },
  { id:"adaptive",   icon:"⚡", label:"Adaptive",   col:"#4ade80" },
  { id:"stable",     icon:"⚖️",  label:"Stable",     col:"#f472b6" },
  { id:"binary",     icon:"🔍", label:"Binary IS",  col:"#34d399" },
  { id:"quiz",       icon:"🧠", label:"Quiz",       col:"#ec4899" },
];

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
      <div style={{ height:"100%",width:`${p}%`,background:"linear-gradient(90deg,#f59e0b,#38bdf8,#a78bfa,#4ade80)",transition:"width 0.1s linear",boxShadow:"0 0 14px rgba(245,158,11,0.8)" }}/>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SPEAKING WAVE
// ═══════════════════════════════════════════════════════════════════════════════
function SpeakingWave({ color="#f59e0b", size=16 }) {
  return (
    <div style={{ display:"flex",alignItems:"center",gap:2,height:size }}>
      {[0,1,2,3].map(i => (
        <div key={i} style={{ width:size*0.18,height:size*0.5,background:color,borderRadius:99,animation:`wave 1.1s ease-in-out ${i*0.15}s infinite` }}/>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STICKY NAV
// ═══════════════════════════════════════════════════════════════════════════════
function StickyNav({ active, speaking, seenCount }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const h = () => setShow(window.scrollY > 500);
    window.addEventListener("scroll", h, { passive:true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <nav style={{
      position:"fixed",top:14,left:"50%",transform:"translateX(-50%)",
      zIndex:900,display:"flex",alignItems:"center",gap:2,padding:"5px 8px",
      background:"rgba(8,4,2,0.94)",backdropFilter:"blur(28px) saturate(180%)",
      borderRadius:22,border:"1px solid rgba(255,255,255,0.07)",
      boxShadow:"0 12px 48px rgba(0,0,0,0.7)",
      opacity:show?1:0,pointerEvents:show?"auto":"none",
      transition:"opacity 0.3s ease",maxWidth:"calc(100vw - 24px)",
    }}>
      <div className="nav-pills" style={{ display:"flex",gap:2,flexWrap:"wrap",justifyContent:"center" }}>
        {NAV_SECTIONS.map(s => (
          <button key={s.id}
            onClick={() => document.getElementById(s.id)?.scrollIntoView({ behavior:"smooth" })}
            title={s.label}
            style={{
              width:34,height:34,borderRadius:12,border:"none",cursor:"pointer",
              background:active===s.id?`${s.col}22`:"transparent",
              outline:active===s.id?`1.5px solid ${s.col}55`:"1.5px solid transparent",
              fontSize:15,transition:"all 0.2s",display:"flex",alignItems:"center",justifyContent:"center",
            }}>
            {s.icon}
          </button>
        ))}
      </div>
      <div style={{ width:1,height:20,background:"rgba(255,255,255,0.08)",margin:"0 4px" }}/>
      <div style={{ padding:"3px 9px",borderRadius:12,background:"rgba(245,158,11,0.08)",border:"1px solid rgba(245,158,11,0.2)",display:"flex",alignItems:"center",gap:5 }}>
        <div style={{ width:28,height:4,borderRadius:99,background:"rgba(255,255,255,0.06)",overflow:"hidden" }}>
          <div style={{ height:"100%",width:`${(seenCount/NAV_SECTIONS.length)*100}%`,background:"#f59e0b",borderRadius:99,transition:"width 0.5s ease" }}/>
        </div>
        <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:"#f59e0b",fontWeight:700 }}>{seenCount}/{NAV_SECTIONS.length}</span>
      </div>
      <div style={{ width:1,height:20,background:"rgba(255,255,255,0.08)",margin:"0 4px" }}/>
      <div style={{ padding:"3px 9px",borderRadius:12,background:"rgba(56,189,248,0.08)",border:"1px solid rgba(56,189,248,0.2)",display:"flex",alignItems:"center",gap:5 }}>
        <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:"#38bdf8",fontWeight:700 }}>1.25×</span>
        {speaking && <SpeakingWave color="#38bdf8" size={12}/>}
      </div>
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
    window.addEventListener("scroll", h, { passive:true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  return (
    <button onClick={() => window.scrollTo({ top:0, behavior:"smooth" })} style={{
      position:"fixed",bottom:24,right:20,zIndex:850,
      width:44,height:44,borderRadius:14,cursor:"pointer",
      background:"rgba(245,158,11,0.15)",border:"1px solid rgba(245,158,11,0.35)",
      color:"#fcd34d",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",
      opacity:show?1:0,transform:show?"scale(1)":"scale(0.7)",
      pointerEvents:show?"auto":"none",
      transition:"all 0.3s cubic-bezier(0.22,1,0.36,1)",
      boxShadow:"0 8px 24px rgba(245,158,11,0.3)",
    }}>↑</button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPLETED BADGE
// ═══════════════════════════════════════════════════════════════════════════════
function CompletedBadge({ seen }) {
  if (!seen) return null;
  return (
    <span style={{
      padding:"2px 9px",borderRadius:20,fontSize:9,
      fontFamily:"'JetBrains Mono',monospace",fontWeight:700,
      background:"rgba(245,158,11,0.12)",border:"1px solid rgba(245,158,11,0.3)",
      color:"#f59e0b",letterSpacing:"0.08em",animation:"fadeIn 0.4s ease both",
    }}>✓ READ</span>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MINI PLAYER
// ═══════════════════════════════════════════════════════════════════════════════
function MiniPlayer({ speaking, speakingLabel, onStop }) {
  if (!speaking) return null;
  return (
    <div style={{
      position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",
      zIndex:850,display:"flex",alignItems:"center",gap:12,
      padding:"10px 20px",borderRadius:99,
      background:"rgba(8,4,2,0.96)",backdropFilter:"blur(24px)",
      border:"1px solid rgba(245,158,11,0.3)",
      boxShadow:"0 8px 36px rgba(245,158,11,0.18),0 2px 12px rgba(0,0,0,0.7)",
      animation:"slideUp 0.35s cubic-bezier(0.22,1,0.36,1) both",
      maxWidth:"calc(100vw - 48px)",
    }}>
      <SpeakingWave color="#f59e0b" size={16}/>
      <div>
        <div style={{ fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,color:"#e2e8f0",lineHeight:1 }}>{speakingLabel}</div>
        <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#f59e0b",marginTop:2 }}>1.25× · male voice</div>
      </div>
      <button onClick={onStop} style={{
        background:"rgba(239,68,68,0.15)",border:"1px solid rgba(239,68,68,0.35)",
        borderRadius:20,cursor:"pointer",padding:"4px 12px",
        fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:700,color:"#f87171",
      }}>⏹ STOP</button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// HERO — Animated card-sorting metaphor
// ═══════════════════════════════════════════════════════════════════════════════
const HERO_NUMS   = [5, 2, 8, 1, 9, 3];
const CARD_SUITS  = ["♠","♥","♦","♣","♠","♥"];
const CARD_COLORS = ["#f59e0b","#38bdf8","#a78bfa","#fb923c","#4ade80","#f472b6"];

function Hero({ onStart, onVoice }) {
  const [animPhase, setAnimPhase] = useState(0);

  useEffect(() => {
    const phases = [0,1,2,3,4,5,6];
    let i = 0;
    const tick = () => { i = (i+1) % phases.length; setAnimPhase(phases[i]); };
    const id = setInterval(tick, 1800);
    return () => clearInterval(id);
  }, []);

  // Simulate insertion sort steps on HERO_NUMS
  const getState = (phase) => {
    const a = [...HERO_NUMS];
    for (let p = 0; p < phase && p < a.length-1; p++) {
      let j = p+1;
      const key = a[j];
      while (j > 0 && a[j-1] > key) { a[j] = a[j-1]; j--; }
      a[j] = key;
    }
    return { arr: a, sorted: phase, key: phase < a.length ? HERO_NUMS[Math.min(phase, a.length-1)] : null };
  };

  const { arr, sorted, key } = getState(animPhase);
  const phaseLabels = [
    "UNSORTED ARRAY","PICK KEY: 2","PICK KEY: 5","PICK KEY: 1","PICK KEY: 8","PICK KEY: 3","✓ FULLY SORTED!",
  ];

  return (
    <div style={{
      minHeight:"100vh",display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"center",
      padding:"80px 24px 48px",textAlign:"center",position:"relative",overflow:"hidden",
    }}>
      {/* BG dot grid */}
      <div style={{ position:"absolute",inset:0,pointerEvents:"none",backgroundImage:"radial-gradient(circle,rgba(245,158,11,0.06) 1px,transparent 1px)",backgroundSize:"40px 40px" }}/>
      {/* Diagonal accent lines */}
      <div style={{ position:"absolute",top:0,left:0,right:0,bottom:0,pointerEvents:"none",overflow:"hidden" }}>
        {[...Array(5)].map((_,i) => (
          <div key={i} style={{ position:"absolute",top:0,bottom:0,left:`${i*25}%`,width:1,background:`linear-gradient(180deg,transparent,rgba(245,158,11,0.04),transparent)`,transform:"skewX(-12deg)" }}/>
        ))}
      </div>
      {/* Orbs */}
      <div style={{ position:"absolute",top:"5%",right:"5%",width:500,height:500,borderRadius:"50%",background:"radial-gradient(circle,rgba(245,158,11,0.11) 0%,transparent 70%)",filter:"blur(90px)",pointerEvents:"none",animation:"orb1 26s ease-in-out infinite" }}/>
      <div style={{ position:"absolute",bottom:"5%",left:"3%",width:380,height:380,borderRadius:"50%",background:"radial-gradient(circle,rgba(56,189,248,0.09) 0%,transparent 70%)",filter:"blur(72px)",pointerEvents:"none",animation:"orb2 32s ease-in-out infinite" }}/>

      {/* Card animation */}
      <div style={{ marginBottom:44,position:"relative",width:"100%",maxWidth:520 }}>
        <div style={{ height:30,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:16 }}>
          <span key={animPhase} style={{
            padding:"4px 16px",borderRadius:20,
            fontFamily:"'JetBrains Mono',monospace",fontSize:10,fontWeight:700,
            background:animPhase===6?"rgba(74,222,128,0.15)":animPhase===0?"rgba(245,158,11,0.12)":"rgba(56,189,248,0.12)",
            border:`1px solid ${animPhase===6?"rgba(74,222,128,0.4)":animPhase===0?"rgba(245,158,11,0.38)":"rgba(56,189,248,0.38)"}`,
            color:animPhase===6?"#4ade80":animPhase===0?"#f59e0b":"#38bdf8",
            animation:"opLabelIn 0.35s cubic-bezier(0.22,1,0.36,1) both",
          }}>{phaseLabels[Math.min(animPhase, phaseLabels.length-1)]}</span>
        </div>

        {/* Playing cards row */}
        <div style={{ display:"flex",gap:8,justifyContent:"center",perspective:"600px" }}>
          {arr.map((v, i) => {
            const origIdx = HERO_NUMS.indexOf(v);
            const isSortedRegion = i < Math.min(sorted+1, arr.length);
            const isKey = animPhase > 0 && animPhase < 6 && i === Math.min(sorted, arr.length-1) && sorted < arr.length;
            const col = CARD_COLORS[origIdx % CARD_COLORS.length];
            const suit = CARD_SUITS[origIdx % CARD_SUITS.length];
            return (
              <div key={`${v}-${i}`} style={{
                width:52,height:72,borderRadius:10,flexShrink:0,
                background:animPhase===6
                  ? "linear-gradient(145deg,rgba(74,222,128,0.25),rgba(74,222,128,0.1))"
                  : isSortedRegion
                    ? `linear-gradient(145deg,${col}30,${col}10)`
                    : "linear-gradient(145deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02))",
                border:`2px solid ${animPhase===6?"rgba(74,222,128,0.7)":isSortedRegion?`${col}80`:"rgba(255,255,255,0.12)"}`,
                display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2,
                boxShadow:isKey?`0 0 24px ${col}70, 0 8px 24px rgba(0,0,0,0.5)`:isSortedRegion?`0 4px 16px rgba(0,0,0,0.4)`:undefined,
                transform:isKey?"translateY(-14px) scale(1.1) rotateX(6deg)":"translateY(0) scale(1)",
                transition:"all 0.45s cubic-bezier(0.34,1.56,0.64,1)",
                animation:`cardReveal 0.5s cubic-bezier(0.34,1.56,0.64,1) ${i*0.07}s both`,
                zIndex:isKey?10:1,
                position:"relative",
              }}>
                <div style={{ fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:800,color:animPhase===6?"#4ade80":isSortedRegion?col:"#334155",lineHeight:1 }}>{v}</div>
                <div style={{ fontFamily:"Georgia,serif",fontSize:13,color:animPhase===6?"rgba(74,222,128,0.7)":isSortedRegion?`${col}90`:"rgba(255,255,255,0.12)",lineHeight:1 }}>{suit}</div>
              </div>
            );
          })}
        </div>

        {/* Sorted indicator */}
        {animPhase > 0 && animPhase < 6 && (
          <div style={{ display:"flex",justifyContent:"center",marginTop:10,animation:"fadeIn 0.3s ease" }}>
            <div style={{ display:"flex",alignItems:"center",gap:6,padding:"4px 14px",borderRadius:20,background:"rgba(74,222,128,0.07)",border:"1px solid rgba(74,222,128,0.2)" }}>
              <div style={{ width:`${(sorted/HERO_NUMS.length)*80}px`,maxWidth:80,height:3,borderRadius:99,background:"linear-gradient(90deg,#4ade80,#22c55e)",transition:"width 0.5s ease" }}/>
              <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:8.5,color:"#4ade80",fontWeight:700 }}>{sorted} sorted</span>
            </div>
          </div>
        )}
      </div>

      {/* Hero text */}
      <div style={{ maxWidth:660,position:"relative" }}>
        <div style={{
          display:"inline-flex",alignItems:"center",gap:8,marginBottom:20,
          padding:"5px 18px",borderRadius:40,
          background:"rgba(245,158,11,0.08)",border:"1px solid rgba(245,158,11,0.2)",
          fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#f59e0b",letterSpacing:"0.1em",
        }}>🃏 INTERACTIVE VISUAL GUIDE · THE ALGORITHM YOU ALREADY KNOW</div>

        <h1 style={{
          margin:"0 0 16px",fontFamily:"'Syne',sans-serif",
          fontSize:"clamp(38px,7.5vw,82px)",fontWeight:800,letterSpacing:"-0.035em",lineHeight:1.0,
          background:"linear-gradient(145deg,#fff5e6 0%,#fde68a 25%,#38bdf8 55%,#a78bfa 80%,#f472b6 100%)",
          WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",
        }}>Insertion<br/>Sort</h1>

        <p style={{ margin:"0 auto 8px",fontFamily:"'DM Sans',sans-serif",fontSize:"clamp(14px,2.2vw,18px)",color:"#57534e",lineHeight:1.68,maxWidth:520 }}>
          The algorithm you've been doing <strong style={{ color:"#fbbf24" }}>your whole life</strong> — sorting cards in your hand. Simple, adaptive, and surprisingly powerful for the right inputs.
        </p>
        <p style={{ margin:"0 auto 32px",fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"#292524",letterSpacing:"0.06em" }}>O(n²) worst · O(n) best · In-place · Stable · Adaptive</p>

        <div style={{ display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap" }}>
          <button onClick={onStart} style={{
            padding:"15px 36px",borderRadius:16,cursor:"pointer",
            background:"linear-gradient(135deg,#d97706 0%,#0ea5e9 100%)",
            border:"none",fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:700,
            color:"#fff",boxShadow:"0 8px 36px rgba(217,119,6,0.45)",transition:"all 0.25s",
          }}
            onMouseEnter={e => { e.currentTarget.style.transform="translateY(-3px) scale(1.02)"; e.currentTarget.style.boxShadow="0 14px 48px rgba(217,119,6,0.6)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="0 8px 36px rgba(217,119,6,0.45)"; }}>
            Begin Learning ↓
          </button>
          <button onClick={onVoice} style={{
            padding:"15px 26px",borderRadius:16,cursor:"pointer",
            background:"rgba(255,255,255,0.05)",border:"1.5px solid rgba(255,255,255,0.12)",
            fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:600,
            color:"#78716c",transition:"all 0.25s",display:"flex",alignItems:"center",gap:9,
          }}
            onMouseEnter={e => { e.currentTarget.style.background="rgba(255,255,255,0.1)"; e.currentTarget.style.color="#f8fafc"; }}
            onMouseLeave={e => { e.currentTarget.style.background="rgba(255,255,255,0.05)"; e.currentTarget.style.color="#78716c"; }}>
            <span style={{ fontSize:18 }}>🔊</span> Hear Intro
          </button>
        </div>

        {/* Stats row */}
        <div style={{ display:"flex",gap:28,justifyContent:"center",marginTop:44,flexWrap:"wrap" }}>
          {[["8","Sections"],["6+","Animations"],["6","Quiz Qs"],["O(n)","Best Case!"]].map(([n,l]) => (
            <div key={l} style={{ textAlign:"center" }}>
              <div style={{ fontFamily:"'Syne',sans-serif",fontSize:26,fontWeight:800,background:"linear-gradient(135deg,#fde68a,#38bdf8)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text" }}>{n}</div>
              <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#292524",letterSpacing:"0.1em",marginTop:3 }}>{l}</div>
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
      opacity:vis?1:0,transform:vis?"none":"translateY(52px)",
      transition:"opacity 0.78s cubic-bezier(0.22,1,0.36,1),transform 0.78s cubic-bezier(0.22,1,0.36,1)",
    }}>
      <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:24,flexWrap:"wrap" }}>
        <div style={{
          width:50,height:50,borderRadius:16,flexShrink:0,
          background:`${color}14`,border:`1px solid ${color}38`,
          display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,
          boxShadow:`0 0 28px ${color}18`,
        }}>{icon}</div>
        <h2 style={{ flex:1,margin:0,minWidth:0,fontFamily:"'Syne',sans-serif",fontSize:"clamp(19px,3.8vw,30px)",fontWeight:800,color:"#f8fafc",letterSpacing:"-0.022em",lineHeight:1.15 }}>{title}</h2>
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
            {isSp?<SpeakingWave color={color} size={12}/>:<span style={{ fontSize:12 }}>🔊</span>}
            {isSp?"STOP":"LISTEN"}
          </button>
        </div>
      </div>
      <div className="sg" style={{ display:"grid",gridTemplateColumns:"minmax(0,1.12fr) minmax(0,0.88fr)",gap:18 }}>
        <div style={{
          padding:20,borderRadius:22,
          background:"linear-gradient(150deg,rgba(255,255,255,0.025) 0%,rgba(0,0,0,0.25) 100%)",
          border:`1px solid ${color}18`,boxShadow:`0 0 64px ${color}09`,minWidth:0,
        }}>{visual}</div>
        <div style={{ display:"flex",flexDirection:"column",gap:9,minWidth:0 }}>
          {cards.map((c,i) => (
            <div key={i} style={{
              padding:"12px 14px",borderRadius:13,
              background:"rgba(255,255,255,0.018)",
              border:"1px solid rgba(255,255,255,0.045)",
              borderLeft:`3px solid ${color}55`,
              animation:vis?`sRight 0.5s cubic-bezier(0.22,1,0.36,1) ${0.1+i*0.1}s both`:"none",
            }}>
              {c.lbl && <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:8.5,fontWeight:700,color,letterSpacing:"0.12em",marginBottom:5,opacity:0.88 }}>{c.lbl}</div>}
              <div style={{ fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#78716c",lineHeight:1.68 }}>{c.body}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VISUAL: Intro — Full animated insertion sort with bars
// ═══════════════════════════════════════════════════════════════════════════════
function VisIntro() {
  const INIT = [64, 25, 12, 22, 11];
  const [arr, setArr] = useState([...INIT]);
  const [keyIdx, setKeyIdx] = useState(-1);
  const [sortedUpTo, setSortedUpTo] = useState(0);
  const [comparing, setComparing] = useState(-1);
  const [log, setLog] = useState([]);
  const [sorting, setSorting] = useState(false);
  const [done, setDone] = useState(false);
  const COLORS = ["#f59e0b","#38bdf8","#a78bfa","#fb923c","#4ade80"];
  const maxH = Math.max(...arr);

  const sleep = ms => new Promise(r => setTimeout(r, ms));

  const reset = () => {
    setArr([...INIT]); setKeyIdx(-1); setSortedUpTo(0);
    setComparing(-1); setLog([]); setSorting(false); setDone(false);
  };

  const animate = async () => {
    if (sorting) return;
    setSorting(true); setDone(false); setLog([]);
    const a = [...INIT];
    for (let i = 1; i < a.length; i++) {
      const key = a[i];
      setKeyIdx(i);
      setLog(l => [`Pick key = ${key} (index ${i})`,...l].slice(0,7));
      await sleep(500);
      let j = i - 1;
      while (j >= 0 && a[j] > key) {
        setComparing(j);
        setLog(l => [`  ${a[j]} > ${key} → shift right`,...l].slice(0,7));
        a[j+1] = a[j];
        setArr([...a]);
        await sleep(380);
        j--;
      }
      a[j+1] = key;
      setArr([...a]);
      setComparing(-1);
      setSortedUpTo(i+1);
      setLog(l => [`  ✓ Insert ${key} at index ${j+1}`,...l].slice(0,7));
      await sleep(420);
    }
    setKeyIdx(-1); setSorting(false); setDone(true);
    setLog(l => ["✓ Array fully sorted!",...l].slice(0,7));
  };

  return (
    <div>
      <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:8.5,color:"#44403c",letterSpacing:"0.08em",marginBottom:12 }}>LIVE INSERTION SORT — watch every shift</div>

      {/* Bars */}
      <div style={{ display:"flex",gap:8,alignItems:"flex-end",height:110,marginBottom:12,justifyContent:"center" }}>
        {arr.map((v,i) => {
          const isKey = i === keyIdx;
          const isSorted = done || i < sortedUpTo;
          const isComp = i === comparing;
          const col = COLORS[i % COLORS.length];
          return (
            <div key={i} style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:4 }}>
              <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:11,fontWeight:700,color:done?"#4ade80":isKey?"#f59e0b":isSorted?col:"#44403c",transition:"color 0.3s" }}>{v}</span>
              <div style={{
                width:40,borderRadius:"8px 8px 0 0",
                height:`${(v/maxH)*80}px`,
                background:done
                  ? "linear-gradient(180deg,#4ade80,#22c55e)"
                  : isKey
                    ? "linear-gradient(180deg,#f59e0b,#d97706)"
                    : isComp
                      ? "linear-gradient(180deg,#ef4444,#dc2626)"
                      : isSorted
                        ? `linear-gradient(180deg,${col},${col}99)`
                        : `linear-gradient(180deg,${col}44,${col}22)`,
                border:`2px solid ${done?"rgba(74,222,128,0.7)":isKey?"rgba(245,158,11,0.9)":isComp?"rgba(239,68,68,0.9)":isSorted?col:`${col}44`}`,
                transition:"height 0.28s cubic-bezier(0.34,1.2,0.64,1),background 0.3s,border-color 0.3s",
                boxShadow:isKey?`0 0 20px rgba(245,158,11,0.6)`:isComp?`0 0 16px rgba(239,68,68,0.5)`:"none",
              }}/>
              {/* Index label */}
              <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:isKey?"#f59e0b":isSorted?"#44403c":"#292524" }}>[{i}]</span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display:"flex",gap:10,justifyContent:"center",marginBottom:10,flexWrap:"wrap" }}>
        {[["#f59e0b","KEY (being inserted)"],["#ef4444","COMPARING (shifting)"],["#4ade80","SORTED REGION"]].map(([c,l]) => (
          <div key={l} style={{ display:"flex",alignItems:"center",gap:4 }}>
            <div style={{ width:8,height:8,borderRadius:"50%",background:c }}/>
            <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:7.5,color:"#44403c" }}>{l}</span>
          </div>
        ))}
      </div>

      {/* Log */}
      <div style={{ minHeight:68,padding:"8px 10px",borderRadius:10,background:"rgba(0,0,0,0.3)",border:"1px solid rgba(255,255,255,0.05)",marginBottom:10 }}>
        {log.map((l,i) => (
          <div key={i} style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:i===0?"#f59e0b":"#44403c",padding:"1px 0",animation:i===0?"fadeIn 0.15s ease":"none" }}>{l}</div>
        ))}
        {log.length===0 && <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#292524" }}>Press SORT to watch every step…</div>}
      </div>

      <div style={{ display:"flex",gap:7,justifyContent:"center" }}>
        <button onClick={animate} disabled={sorting} style={{
          padding:"8px 20px",borderRadius:22,cursor:sorting?"not-allowed":"pointer",
          background:sorting?"rgba(255,255,255,0.03)":"rgba(245,158,11,0.18)",
          border:`1px solid ${sorting?"rgba(255,255,255,0.06)":"rgba(245,158,11,0.5)"}`,
          fontFamily:"'JetBrains Mono',monospace",fontSize:10,fontWeight:700,
          color:sorting?"#292524":"#f59e0b",opacity:sorting?0.5:1,
        }}>{sorting?"⏳ SORTING…":"▶ SORT"}</button>
        <button onClick={reset} disabled={sorting} style={{
          padding:"8px 16px",borderRadius:22,cursor:"pointer",
          background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",
          fontFamily:"'JetBrains Mono',monospace",fontSize:10,fontWeight:700,color:"#44403c",
        }}>↺ RESET</button>
        {done && (
          <div style={{ padding:"8px 16px",borderRadius:22,background:"rgba(74,222,128,0.12)",border:"1px solid rgba(74,222,128,0.35)",fontFamily:"'JetBrains Mono',monospace",fontSize:10,fontWeight:700,color:"#4ade80",animation:"fadeIn 0.3s ease" }}>✓ SORTED</div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VISUAL: How It Works — step-by-step walkthrough
// ═══════════════════════════════════════════════════════════════════════════════
function VisHowItWorks() {
  const [step, setStep] = useState(0);
  const INITIAL = [5, 3, 8, 1, 6];
  const STEPS = [
    { arr:[5,3,8,1,6], keyIdx:null, sorted:0, desc:"Start: the array is unsorted. The first element (index 0) is trivially sorted on its own.", note:"sorted region = [5]" },
    { arr:[3,5,8,1,6], keyIdx:1,    sorted:1, desc:"KEY = 3. Compare left: 5 > 3, shift 5 right. Insert 3 at index 0.", note:"sorted region = [3, 5]" },
    { arr:[3,5,8,1,6], keyIdx:2,    sorted:2, desc:"KEY = 8. Compare left: 5 ≤ 8. No shift needed. 8 stays in place.", note:"sorted region = [3, 5, 8]" },
    { arr:[1,3,5,8,6], keyIdx:3,    sorted:3, desc:"KEY = 1. Compare left: 8>1 → shift. 5>1 → shift. 3>1 → shift. Insert 1 at index 0.", note:"sorted region = [1, 3, 5, 8]" },
    { arr:[1,3,5,6,8], keyIdx:4,    sorted:4, desc:"KEY = 6. Compare left: 8>6 → shift. 5≤6. Insert 6 at index 3.", note:"✓ sorted region = [1, 3, 5, 6, 8]" },
  ];
  const cur = STEPS[step];
  const COLS = ["#f59e0b","#38bdf8","#a78bfa","#fb923c","#4ade80"];

  return (
    <div>
      <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:8.5,color:"#44403c",letterSpacing:"0.08em",marginBottom:12 }}>STEP-BY-STEP — press NEXT to walk through</div>

      {/* Array display */}
      <div style={{ display:"flex",gap:7,justifyContent:"center",marginBottom:14 }}>
        {cur.arr.map((v,i) => {
          const isSorted = i < cur.sorted + (cur.keyIdx === null ? 1 : 0);
          const isKey = i === cur.sorted;
          const col = COLS[i];
          return (
            <div key={i} style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:4,animation:`heroPush 0.4s cubic-bezier(0.34,1.56,0.64,1) ${i*0.06}s both` }}>
              <div style={{
                width:44,height:44,borderRadius:11,
                background:step===4?"rgba(74,222,128,0.2)":isKey?`${col}30`:isSorted?`${col}18`:"rgba(255,255,255,0.04)",
                border:`2px solid ${step===4?"rgba(74,222,128,0.7)":isKey?col:isSorted?`${col}80`:"rgba(255,255,255,0.1)"}`,
                display:"flex",alignItems:"center",justifyContent:"center",
                fontFamily:"'JetBrains Mono',monospace",fontSize:15,fontWeight:700,
                color:step===4?"#4ade80":isKey?col:isSorted?col:"#44403c",
                boxShadow:isKey?`0 0 18px ${col}50`:undefined,
                transform:isKey?"translateY(-8px) scale(1.06)":"none",
                transition:"all 0.35s cubic-bezier(0.34,1.56,0.64,1)",
              }}>{v}</div>
              <div style={{ width:5,height:5,borderRadius:"50%",background:step===4?"#4ade80":isSorted?col:"#292524",transition:"background 0.3s" }}/>
            </div>
          );
        })}
      </div>

      {/* Key highlight */}
      {cur.keyIdx !== null && step < 5 && (
        <div style={{ display:"flex",justifyContent:"center",marginBottom:12,animation:"fadeIn 0.25s ease" }}>
          <div style={{ display:"flex",alignItems:"center",gap:6,padding:"5px 16px",borderRadius:20,background:"rgba(245,158,11,0.1)",border:"1px solid rgba(245,158,11,0.3)" }}>
            <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#f59e0b",fontWeight:700 }}>🔑 KEY = {cur.arr[cur.sorted]}</span>
            <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#44403c" }}>scanning left to find insertion point</span>
          </div>
        </div>
      )}

      {/* Description */}
      <div style={{ padding:"10px 14px",borderRadius:12,background:"rgba(56,189,248,0.06)",border:"1px solid rgba(56,189,248,0.18)",marginBottom:8 }}>
        <div style={{ fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#7dd3fc",lineHeight:1.62 }}>{cur.desc}</div>
        <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#0c4a6e",marginTop:5 }}>{cur.note}</div>
      </div>

      {/* Controls */}
      <div style={{ display:"flex",gap:7,justifyContent:"center" }}>
        <button onClick={() => setStep(s=>Math.max(0,s-1))} disabled={step===0} style={{ padding:"6px 14px",borderRadius:20,cursor:step===0?"not-allowed":"pointer",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:700,color:step===0?"#292524":"#44403c",opacity:step===0?0.4:1 }}>← PREV</button>
        <div style={{ padding:"5px 14px",borderRadius:20,background:"rgba(56,189,248,0.1)",border:"1px solid rgba(56,189,248,0.25)",fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#38bdf8",fontWeight:700 }}>{step+1} / {STEPS.length}</div>
        <button onClick={() => setStep(s=>Math.min(STEPS.length-1,s+1))} disabled={step===STEPS.length-1} style={{ padding:"6px 14px",borderRadius:20,cursor:step===STEPS.length-1?"not-allowed":"pointer",background:"rgba(56,189,248,0.12)",border:"1px solid rgba(56,189,248,0.3)",fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:700,color:step===STEPS.length-1?"#292524":"#38bdf8",opacity:step===STEPS.length-1?0.4:1 }}>NEXT →</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VISUAL: Invariant — highlight invariant at each step
// ═══════════════════════════════════════════════════════════════════════════════
function VisInvariant() {
  const [step, setStep] = useState(0);
  const STATES = [
    { arr:[7,3,5,1,4], sorted:1, claim:"After i=0: subarray [7] is sorted. (trivially — length 1)" },
    { arr:[3,7,5,1,4], sorted:2, claim:"After i=1: subarray [3, 7] is sorted. ✓" },
    { arr:[3,5,7,1,4], sorted:3, claim:"After i=2: subarray [3, 5, 7] is sorted. ✓" },
    { arr:[1,3,5,7,4], sorted:4, claim:"After i=3: subarray [1, 3, 5, 7] is sorted. ✓" },
    { arr:[1,3,4,5,7], sorted:5, claim:"After i=4: subarray [1, 3, 4, 5, 7] is sorted. ✓ — entire array!" },
  ];
  const cur = STATES[step];

  return (
    <div>
      <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:8.5,color:"#44403c",letterSpacing:"0.08em",marginBottom:10 }}>LOOP INVARIANT — left half is ALWAYS sorted</div>

      {/* Array with sorted/unsorted visual split */}
      <div style={{ display:"flex",gap:6,justifyContent:"center",marginBottom:10,position:"relative" }}>
        {/* Sorted region background */}
        <div style={{
          position:"absolute",top:0,bottom:0,left:0,
          width:`${(cur.sorted/cur.arr.length)*100}%`,
          background:"rgba(167,139,250,0.06)",borderRadius:10,
          border:"1px solid rgba(167,139,250,0.18)",
          transition:"width 0.4s ease",pointerEvents:"none",
        }}/>
        {cur.arr.map((v,i) => {
          const isSorted = i < cur.sorted;
          return (
            <div key={i} style={{ width:44,height:44,borderRadius:10,zIndex:1,
              background:isSorted?"rgba(167,139,250,0.22)":"rgba(255,255,255,0.03)",
              border:`2px solid ${isSorted?"rgba(167,139,250,0.65)":"rgba(255,255,255,0.1)"}`,
              display:"flex",alignItems:"center",justifyContent:"center",
              fontFamily:"'JetBrains Mono',monospace",fontSize:14,fontWeight:700,
              color:isSorted?"#a78bfa":"#44403c",
              boxShadow:isSorted?"0 0 12px rgba(167,139,250,0.3)":"none",
              transition:"all 0.35s ease",
              animation:`heroPush 0.4s cubic-bezier(0.34,1.56,0.64,1) ${i*0.07}s both`,
            }}>{v}</div>
          );
        })}
      </div>

      {/* Labels */}
      <div style={{ display:"flex",gap:8,justifyContent:"center",marginBottom:12 }}>
        <div style={{ padding:"3px 12px",borderRadius:20,background:"rgba(167,139,250,0.12)",border:"1px solid rgba(167,139,250,0.3)",fontFamily:"'JetBrains Mono',monospace",fontSize:8.5,color:"#a78bfa",fontWeight:700 }}>
          ← SORTED [{cur.arr.slice(0,cur.sorted).join(", ")}]
        </div>
        {cur.sorted < cur.arr.length && (
          <div style={{ padding:"3px 12px",borderRadius:20,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",fontFamily:"'JetBrains Mono',monospace",fontSize:8.5,color:"#44403c" }}>
            [{cur.arr.slice(cur.sorted).join(", ")}] UNSORTED →
          </div>
        )}
      </div>

      {/* Invariant claim */}
      <div style={{ padding:"10px 14px",borderRadius:12,background:"rgba(167,139,250,0.07)",border:"1px solid rgba(167,139,250,0.22)",marginBottom:10 }}>
        <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:8.5,color:"#7c3aed",letterSpacing:"0.08em",marginBottom:5,fontWeight:700 }}>INVARIANT CHECK</div>
        <div style={{ fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#c4b5fd",lineHeight:1.55 }}>{cur.claim}</div>
      </div>

      <div style={{ display:"flex",gap:7,justifyContent:"center" }}>
        <button onClick={() => setStep(s=>Math.max(0,s-1))} disabled={step===0} style={{ padding:"6px 14px",borderRadius:20,cursor:step===0?"not-allowed":"pointer",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:700,color:step===0?"#1c1917":"#44403c",opacity:step===0?0.4:1 }}>← PREV</button>
        <div style={{ padding:"5px 14px",borderRadius:20,background:"rgba(167,139,250,0.1)",border:"1px solid rgba(167,139,250,0.25)",fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#a78bfa",fontWeight:700 }}>{step+1} / {STATES.length}</div>
        <button onClick={() => setStep(s=>Math.min(STATES.length-1,s+1))} disabled={step===STATES.length-1} style={{ padding:"6px 14px",borderRadius:20,cursor:step===STATES.length-1?"not-allowed":"pointer",background:"rgba(167,139,250,0.12)",border:"1px solid rgba(167,139,250,0.3)",fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:700,color:step===STATES.length-1?"#1c1917":"#a78bfa",opacity:step===STATES.length-1?0.4:1 }}>NEXT →</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VISUAL: Complexity — best/worst input comparison
// ═══════════════════════════════════════════════════════════════════════════════
function VisComplexity() {
  const [input, setInput] = useState("random");
  const CASES = {
    sorted:   { label:"BEST CASE — Already Sorted",  col:"#4ade80", arr:[1,2,3,4,5,6,7], shifts:0,  ops:"O(n) = 7 ops",    tc:"O(n)",   note:"Each element only compared once — no shifts. Linear!" },
    random:   { label:"AVERAGE CASE — Random",       col:"#f59e0b", arr:[4,2,6,1,5,3,7], shifts:9,  ops:"O(n²/4) ≈ 12 ops",tc:"O(n²)",  note:"Expected n²/4 comparisons and n²/4 shifts on average." },
    reversed: { label:"WORST CASE — Reverse Sorted", col:"#ef4444", arr:[7,6,5,4,3,2,1], shifts:21, ops:"O(n²) = 21 ops",   tc:"O(n²)",  note:"Every element must shift past all preceding. Maximum work!" },
  };
  const cur = CASES[input];
  const maxShifts = CASES.reversed.shifts;

  return (
    <div>
      <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:8.5,color:"#44403c",letterSpacing:"0.08em",marginBottom:10 }}>INPUT SHAPE DETERMINES SPEED — choose an input</div>

      {/* Toggle */}
      <div style={{ display:"flex",gap:5,justifyContent:"center",marginBottom:14,flexWrap:"wrap" }}>
        {Object.entries(CASES).map(([k,v]) => (
          <button key={k} onClick={() => setInput(k)} style={{
            padding:"5px 14px",borderRadius:20,cursor:"pointer",
            background:input===k?`${v.col}18`:"rgba(255,255,255,0.03)",
            border:`1.5px solid ${input===k?v.col:"rgba(255,255,255,0.07)"}`,
            fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:700,
            color:input===k?v.col:"#44403c",transition:"all 0.2s",
          }}>{k.toUpperCase()}</button>
        ))}
      </div>

      {/* Array display */}
      <div key={input} style={{ display:"flex",gap:6,justifyContent:"center",marginBottom:14,animation:"fadeIn 0.3s ease" }}>
        {cur.arr.map((v,i) => (
          <div key={i} style={{
            width:38,height:38,borderRadius:9,
            background:`${cur.col}18`,border:`2px solid ${cur.col}80`,
            display:"flex",alignItems:"center",justifyContent:"center",
            fontFamily:"'JetBrains Mono',monospace",fontSize:13,fontWeight:700,color:cur.col,
            animation:`heroPush 0.4s cubic-bezier(0.34,1.56,0.64,1) ${i*0.06}s both`,
          }}>{v}</div>
        ))}
      </div>

      {/* Shift count meter */}
      <div style={{ marginBottom:12 }}>
        <div style={{ display:"flex",justifyContent:"space-between",marginBottom:5 }}>
          <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:8.5,color:"#44403c" }}>TOTAL SHIFTS</span>
          <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:8.5,color:cur.col,fontWeight:700 }}>{cur.shifts} shifts</span>
        </div>
        <div style={{ height:8,background:"rgba(255,255,255,0.05)",borderRadius:99,overflow:"hidden" }}>
          <div style={{ height:"100%",width:`${(cur.shifts/maxShifts)*100}%`,background:`linear-gradient(90deg,${cur.col},${cur.col}88)`,borderRadius:99,transition:"width 0.5s ease",boxShadow:`0 0 8px ${cur.col}50` }}/>
        </div>
      </div>

      {/* Info card */}
      <div style={{ padding:"10px 14px",borderRadius:12,background:`${cur.col}08`,border:`1px solid ${cur.col}22`,marginBottom:10 }}>
        <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:5 }}>
          <span style={{ padding:"2px 10px",borderRadius:20,background:`${cur.col}20`,fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:800,color:cur.col }}>{cur.tc}</span>
          <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#44403c" }}>{cur.ops}</span>
        </div>
        <div style={{ fontFamily:"'DM Sans',sans-serif",fontSize:12.5,color:"#78716c",lineHeight:1.6 }}>{cur.note}</div>
      </div>

      {/* Comparison table */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:5 }}>
        {[
          { label:"Best Case",   val:"O(n)",   col:"#4ade80" },
          { label:"Average",     val:"O(n²)",  col:"#f59e0b" },
          { label:"Worst Case",  val:"O(n²)",  col:"#ef4444" },
          { label:"Space",       val:"O(1)",   col:"#38bdf8" },
          { label:"Stable",      val:"Yes",    col:"#a78bfa" },
          { label:"In-Place",    val:"Yes ✓",  col:"#4ade80" },
        ].map(({label,val,col}) => (
          <div key={label} style={{ padding:"7px 10px",borderRadius:9,background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.05)",textAlign:"center" }}>
            <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:11,fontWeight:800,color:col,marginBottom:2 }}>{val}</div>
            <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:7.5,color:"#44403c" }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VISUAL: Adaptive — comparison with nearly-sorted data
// ═══════════════════════════════════════════════════════════════════════════════
function VisAdaptive() {
  const [mode, setMode] = useState("nearly");
  const [running, setRunning] = useState(false);
  const [arr, setArr] = useState(null);
  const [ops, setOps] = useState(0);
  const [done, setDone] = useState(false);
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  const MODES = {
    nearly:  { arr:[1,2,4,3,5,6,8,7], label:"Nearly Sorted (k=1)",    col:"#4ade80",  expected:"O(kn) ≈ O(n) ops" },
    random:  { arr:[6,2,8,1,4,7,3,5], label:"Random",                 col:"#f59e0b",  expected:"O(n²/4) ops" },
    reverse: { arr:[8,7,6,5,4,3,2,1], label:"Reverse Sorted",          col:"#ef4444",  expected:"O(n²) ops" },
  };

  const run = async () => {
    if (running) return;
    setRunning(true); setOps(0); setDone(false);
    const a = [...MODES[mode].arr];
    setArr([...a]);
    let count = 0;
    for (let i = 1; i < a.length; i++) {
      const key = a[i];
      let j = i-1;
      while (j >= 0 && a[j] > key) {
        a[j+1] = a[j]; j--; count++;
        setArr([...a]); setOps(count);
        await sleep(200);
      }
      a[j+1] = key;
      setArr([...a]); count++;
      setOps(count);
      await sleep(150);
    }
    setDone(true); setRunning(false);
  };

  const reset = () => { setArr(null); setOps(0); setDone(false); setRunning(false); };
  const displayArr = arr || MODES[mode].arr;
  const maxV = Math.max(...MODES[mode].arr);
  const cur = MODES[mode];

  return (
    <div>
      <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:8.5,color:"#44403c",letterSpacing:"0.08em",marginBottom:10 }}>ADAPTIVITY — real work varies with input quality</div>

      <div style={{ display:"flex",gap:5,marginBottom:14,justifyContent:"center" }}>
        {Object.entries(MODES).map(([k,v]) => (
          <button key={k} onClick={() => { reset(); setMode(k); }} style={{
            padding:"4px 12px",borderRadius:20,cursor:"pointer",
            background:mode===k?`${v.col}18`:"rgba(255,255,255,0.03)",
            border:`1px solid ${mode===k?v.col:"rgba(255,255,255,0.07)"}`,
            fontFamily:"'JetBrains Mono',monospace",fontSize:8.5,fontWeight:700,
            color:mode===k?v.col:"#44403c",transition:"all 0.2s",
          }}>{k.toUpperCase()}</button>
        ))}
      </div>

      {/* Bars */}
      <div style={{ display:"flex",gap:6,alignItems:"flex-end",height:80,justifyContent:"center",marginBottom:12 }}>
        {displayArr.map((v,i) => (
          <div key={i} style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:2 }}>
            <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:done?"#4ade80":cur.col,transition:"color 0.3s" }}>{v}</span>
            <div style={{ width:32,borderRadius:"5px 5px 0 0",height:`${(v/maxV)*56}px`,
              background:done?`linear-gradient(180deg,#4ade80,#22c55e)`:`linear-gradient(180deg,${cur.col},${cur.col}80)`,
              border:`1.5px solid ${done?"rgba(74,222,128,0.7)":cur.col}`,
              transition:"height 0.22s cubic-bezier(0.34,1.2,0.64,1),background 0.3s",
            }}/>
          </div>
        ))}
      </div>

      {/* Ops counter */}
      <div style={{ textAlign:"center",marginBottom:10 }}>
        <div style={{ fontFamily:"'Syne',sans-serif",fontSize:32,fontWeight:800,color:done?"#4ade80":cur.col,transition:"color 0.3s",lineHeight:1 }}>{ops}</div>
        <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#44403c",marginTop:3 }}>operations · {cur.expected}</div>
      </div>

      {done && (
        <div style={{ padding:"8px 14px",borderRadius:12,background:`${cur.col}08`,border:`1px solid ${cur.col}25`,marginBottom:10,animation:"fUp 0.3s ease",textAlign:"center" }}>
          <div style={{ fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#78716c" }}>
            {mode==="nearly"&&"🟢 Only "+ops+" ops! Adaptive algorithms are fastest on near-sorted data."}
            {mode==="random"&&"🟡 "+ops+" ops — typical average case performance."}
            {mode==="reverse"&&"🔴 "+ops+" ops — maximum work. Every element shifted past all others."}
          </div>
        </div>
      )}

      <div style={{ display:"flex",gap:7,justifyContent:"center" }}>
        <button onClick={run} disabled={running} style={{ padding:"8px 18px",borderRadius:22,cursor:running?"not-allowed":"pointer",background:running?"rgba(255,255,255,0.03)":`${cur.col}18`,border:`1px solid ${running?"rgba(255,255,255,0.06)":cur.col}50`,fontFamily:"'JetBrains Mono',monospace",fontSize:10,fontWeight:700,color:running?"#292524":cur.col,opacity:running?0.5:1 }}>{running?"⏳ RUNNING…":"▶ RUN"}</button>
        <button onClick={() => { reset(); }} style={{ padding:"8px 14px",borderRadius:22,cursor:"pointer",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#44403c" }}>↺</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VISUAL: Stability
// ═══════════════════════════════════════════════════════════════════════════════
function VisStable() {
  const [sorted, setSorted] = useState(false);
  const ITEMS = [
    { name:"Ava",   score:85, id:1, col:"#f59e0b" },
    { name:"Ben",   score:92, id:2, col:"#38bdf8" },
    { name:"Clara", score:85, id:3, col:"#a78bfa" },
    { name:"Dan",   score:78, id:4, col:"#4ade80" },
    { name:"Eve",   score:92, id:5, col:"#f472b6" },
  ];
  const stableSort = [...ITEMS].sort((a,b) => a.score - b.score); // stable: preserves id order for equal scores
  const display = sorted ? stableSort : ITEMS;

  return (
    <div>
      <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:8.5,color:"#44403c",letterSpacing:"0.08em",marginBottom:10 }}>STABILITY — sort by score, preserve original name order</div>

      <div style={{ display:"flex",flexDirection:"column",gap:5,marginBottom:10 }}>
        {display.map((item, i) => (
          <div key={item.id} style={{
            display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:11,
            background:`${item.col}10`,border:`1.5px solid ${item.col}45`,
            animation:sorted?`sRight 0.4s cubic-bezier(0.22,1,0.36,1) ${i*0.07}s both`:"none",
            transition:"border-color 0.3s",
          }}>
            <span style={{ width:22,height:22,borderRadius:"50%",background:`${item.col}25`,border:`1px solid ${item.col}60`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:700,color:item.col,flexShrink:0 }}>#{item.id}</span>
            <span style={{ fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700,color:"#f8fafc",flex:1 }}>{item.name}</span>
            <span style={{ padding:"3px 10px",borderRadius:20,background:`${item.col}20`,fontFamily:"'JetBrains Mono',monospace",fontSize:10,fontWeight:700,color:item.col }}>Score: {item.score}</span>
          </div>
        ))}
      </div>

      <button onClick={() => setSorted(s=>!s)} style={{
        width:"100%",padding:"9px",borderRadius:11,cursor:"pointer",marginBottom:10,
        background:sorted?"rgba(244,114,182,0.12)":"rgba(244,114,182,0.08)",
        border:`1px solid ${sorted?"rgba(244,114,182,0.4)":"rgba(244,114,182,0.25)"}`,
        fontFamily:"'JetBrains Mono',monospace",fontSize:10,fontWeight:700,
        color:"#f472b6",transition:"all 0.3s",
      }}>
        {sorted?"↺ UNSORT — reset":"🔀 SORT by Score (stable)"}
      </button>

      {sorted && (
        <div style={{ animation:"fUp 0.3s ease" }}>
          <div style={{ padding:"8px 12px",borderRadius:9,background:"rgba(244,114,182,0.07)",border:"1px solid rgba(244,114,182,0.2)",fontFamily:"'DM Sans',sans-serif",fontSize:12.5,color:"#fda4af",lineHeight:1.58,marginBottom:5 }}>
            <strong>✓ Stable:</strong> Ava (#1, 85) still comes before Clara (#3, 85). Ben (#2, 92) still comes before Eve (#5, 92). Original id-order preserved within ties!
          </div>
          <div style={{ padding:"6px 12px",borderRadius:9,background:"rgba(245,158,11,0.07)",border:"1px solid rgba(245,158,11,0.2)",fontFamily:"'JetBrains Mono',monospace",fontSize:8.5,color:"#fcd34d" }}>
            KEY: we stop shifting when arr[j] &lt;= key — equal elements are NEVER swapped
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VISUAL: Binary Insertion Sort
// ═══════════════════════════════════════════════════════════════════════════════
function VisBinary() {
  const [step, setStep] = useState(0);
  const ARR = [2, 5, 8, 12, 16, 23]; // sorted half
  const KEY = 11;
  const STEPS = [
    { lo:0, hi:5, mid:null, desc:"SORTED REGION: [2, 5, 8, 12, 16, 23]. KEY = 11. Linear scan would check 6 elements. Binary search: check only 3.", found:false },
    { lo:0, hi:5, mid:2,    desc:"mid = 2, arr[2]=8. Is 8 < 11? Yes → search right half. lo = mid+1 = 3", found:false },
    { lo:3, hi:5, mid:4,    desc:"mid = 4, arr[4]=16. Is 16 < 11? No → search left half. hi = mid-1 = 3", found:false },
    { lo:3, hi:3, mid:3,    desc:"mid = 3, arr[3]=12. Is 12 < 11? No → hi = mid-1 = 2. lo > hi → done!", found:false },
    { lo:3, hi:2, mid:null, desc:"INSERT at index lo=3. Shift [12, 16, 23] right. Place 11 at index 3. Result: [2, 5, 8, 11, 12, 16, 23]", found:true },
  ];
  const cur = STEPS[step];

  return (
    <div>
      <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:8.5,color:"#44403c",letterSpacing:"0.08em",marginBottom:10 }}>BINARY INSERTION SORT — O(log n) comparisons, O(n) shifts</div>

      {/* Key display */}
      <div style={{ display:"flex",justifyContent:"center",marginBottom:10 }}>
        <div style={{ display:"flex",alignItems:"center",gap:8,padding:"6px 18px",borderRadius:20,background:"rgba(52,211,153,0.12)",border:"1px solid rgba(52,211,153,0.35)" }}>
          <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#44403c" }}>KEY =</span>
          <span style={{ fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800,color:"#34d399" }}>{KEY}</span>
          <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#44403c" }}>finding insertion point via binary search</span>
        </div>
      </div>

      {/* Sorted array with search window */}
      <div style={{ position:"relative",marginBottom:14 }}>
        <div style={{ display:"flex",gap:5,justifyContent:"center" }}>
          {ARR.map((v,i) => {
            const inRange = i >= cur.lo && i <= cur.hi;
            const isMid   = i === cur.mid;
            const isInsert = cur.found && i === cur.lo;
            return (
              <div key={i} style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:3 }}>
                <div style={{
                  width:40,height:40,borderRadius:9,
                  background:cur.found&&isInsert?"rgba(52,211,153,0.3)":isMid?"rgba(56,189,248,0.25)":inRange?"rgba(255,255,255,0.07)":"rgba(255,255,255,0.02)",
                  border:`2px solid ${cur.found&&isInsert?"rgba(52,211,153,0.8)":isMid?"rgba(56,189,248,0.8)":inRange?"rgba(255,255,255,0.2)":"rgba(255,255,255,0.06)"}`,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontFamily:"'JetBrains Mono',monospace",fontSize:13,fontWeight:700,
                  color:cur.found&&isInsert?"#34d399":isMid?"#38bdf8":inRange?"#f8fafc":"#44403c",
                  boxShadow:isMid?"0 0 16px rgba(56,189,248,0.5)":cur.found&&isInsert?"0 0 14px rgba(52,211,153,0.5)":undefined,
                  transition:"all 0.3s",
                }}>{v}</div>
                <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:7.5,color:isMid?"#38bdf8":inRange?"#44403c":"#292524" }}>
                  {isMid?"mid":i===cur.lo&&!cur.found?"lo":i===cur.hi&&!cur.found?"hi":""}
                </span>
              </div>
            );
          })}
        </div>
        {/* Search window overlay */}
        {!cur.found && (
          <div style={{
            position:"absolute",top:"-4px",bottom:"-4px",
            left:`calc(${(cur.lo/(ARR.length))*100}% + 0px)`,
            width:`calc(${((cur.hi-cur.lo+1)/ARR.length)*100}%)`,
            border:"1.5px dashed rgba(56,189,248,0.45)",borderRadius:12,pointerEvents:"none",
            transition:"all 0.35s ease",
          }}/>
        )}
      </div>

      {/* Description */}
      <div style={{ padding:"10px 14px",borderRadius:12,background:cur.found?"rgba(52,211,153,0.07)":"rgba(56,189,248,0.06)",border:`1px solid ${cur.found?"rgba(52,211,153,0.25)":"rgba(56,189,248,0.18)"}`,marginBottom:8 }}>
        <div style={{ fontFamily:"'DM Sans',sans-serif",fontSize:12.5,color:cur.found?"#6ee7b7":"#7dd3fc",lineHeight:1.6 }}>{cur.desc}</div>
      </div>

      {/* Stat */}
      <div style={{ padding:"7px 12px",borderRadius:9,background:"rgba(52,211,153,0.06)",border:"1px solid rgba(52,211,153,0.15)",marginBottom:10,textAlign:"center",fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#34d399" }}>
        log₂(6) ≈ 3 comparisons vs 6 linear · 50% fewer comparisons!
      </div>

      <div style={{ display:"flex",gap:7,justifyContent:"center" }}>
        <button onClick={() => setStep(s=>Math.max(0,s-1))} disabled={step===0} style={{ padding:"6px 14px",borderRadius:20,cursor:step===0?"not-allowed":"pointer",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:step===0?"#1c1917":"#44403c",opacity:step===0?0.4:1 }}>← PREV</button>
        <div style={{ padding:"5px 14px",borderRadius:20,background:"rgba(52,211,153,0.1)",border:"1px solid rgba(52,211,153,0.25)",fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#34d399",fontWeight:700 }}>{step+1} / {STEPS.length}</div>
        <button onClick={() => setStep(s=>Math.min(STEPS.length-1,s+1))} disabled={step===STEPS.length-1} style={{ padding:"6px 14px",borderRadius:20,cursor:step===STEPS.length-1?"not-allowed":"pointer",background:"rgba(52,211,153,0.12)",border:"1px solid rgba(52,211,153,0.3)",fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:700,color:step===STEPS.length-1?"#1c1917":"#34d399",opacity:step===STEPS.length-1?0.4:1 }}>NEXT →</button>
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
    { nm:"Best Case",    c:"#4ade80",tc:"O(n)",   sc:"O(1)",n:"Already sorted — each element compared once, zero shifts" },
    { nm:"Average Case", c:"#f59e0b",tc:"O(n²)",  sc:"O(1)",n:"Random input — n²/4 comparisons and n²/4 shifts expected" },
    { nm:"Worst Case",   c:"#ef4444",tc:"O(n²)",  sc:"O(1)",n:"Reverse sorted — n(n-1)/2 comparisons and shifts" },
    { nm:"Space",        c:"#38bdf8",tc:"—",       sc:"O(1)",n:"In-place! Only one extra variable (key) needed" },
    { nm:"Stable",       c:"#a78bfa",tc:"Yes",     sc:"—",   n:"Stop shifting when arr[j] ≤ key — never swaps equals" },
    { nm:"Adaptive",     c:"#4ade80",tc:"Yes",     sc:"—",   n:"Faster on nearly-sorted input — O(kn) where k = max displacement" },
    { nm:"In-Place",     c:"#4ade80",tc:"Yes ✓",   sc:"—",   n:"Unlike Merge Sort, requires zero extra memory" },
  ];
  return (
    <div style={{ overflowX:"auto" }}>
      <table style={{ width:"100%",borderCollapse:"collapse",minWidth:400 }}>
        <thead>
          <tr>{["Property","Time","Space","Notes"].map(h => (
            <th key={h} style={{ padding:"10px 14px",textAlign:"left",fontFamily:"'JetBrains Mono',monospace",fontSize:9,letterSpacing:"0.1em",color:"#44403c",borderBottom:"1px solid rgba(255,255,255,0.06)",fontWeight:700,whiteSpace:"nowrap" }}>{h}</th>
          ))}</tr>
        </thead>
        <tbody>
          {rows.map((r,i) => (
            <tr key={i} onMouseEnter={()=>setHov(i)} onMouseLeave={()=>setHov(null)}
              style={{ borderBottom:"1px solid rgba(255,255,255,0.04)",background:hov===i?"rgba(255,255,255,0.02)":"transparent",transition:"background 0.2s" }}>
              <td style={{ padding:"10px 14px" }}>
                <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                  <span style={{ width:7,height:7,borderRadius:"50%",background:r.c,flexShrink:0,boxShadow:hov===i?`0 0 8px ${r.c}`:"none",transition:"box-shadow 0.2s" }}/>
                  <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:11,fontWeight:700,color:"#e2e8f0" }}>{r.nm}</span>
                </div>
              </td>
              <td style={{ padding:"10px 14px",fontFamily:"'JetBrains Mono',monospace",fontSize:11,fontWeight:700,color:r.tc==="O(n)"?"#4ade80":r.tc==="O(n²)"?"#f87171":r.tc==="Yes"?"#4ade80":r.tc==="Yes ✓"?"#4ade80":"#94a3b8",whiteSpace:"nowrap" }}>{r.tc}</td>
              <td style={{ padding:"10px 14px",fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:r.sc==="O(1)"?"#38bdf8":"#94a3b8",whiteSpace:"nowrap" }}>{r.sc}</td>
              <td style={{ padding:"10px 14px",fontFamily:"'DM Sans',sans-serif",fontSize:11,color:"#44403c" }}>{r.n}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONFETTI
// ═══════════════════════════════════════════════════════════════════════════════
function Confetti() {
  const pieces = Array.from({ length: 32 }, (_,i) => ({
    id:i, x:Math.random()*100, delay:Math.random()*0.8, dur:1.8+Math.random()*1.2,
    color:["#f59e0b","#38bdf8","#a78bfa","#4ade80","#f472b6","#fb923c"][i%6], size:6+Math.random()*6,
  }));
  return (
    <div style={{ position:"fixed",inset:0,pointerEvents:"none",zIndex:3000,overflow:"hidden" }}>
      {pieces.map(p => (
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
    { q:"What is the best-case time complexity of Insertion Sort?",opts:["O(n²)","O(n log n)","O(n)","O(log n)"],ans:2,exp:"O(n) — when the array is already sorted. Each element is compared once with its left neighbor and no shifts occur. This linear best case is Insertion Sort's superpower over algorithms like Merge Sort." },
    { q:"What does it mean that Insertion Sort is 'adaptive'?",opts:["It changes its algorithm mid-sort","It runs faster on nearly-sorted input","It adapts to any data type","It uses adaptive memory"],ans:1,exp:"Adaptive means the runtime improves on partially-sorted input. If each element is at most k positions from its sorted location, Insertion Sort runs in O(kn) time — much better than O(n²)." },
    { q:"Why does Insertion Sort use O(1) space?",opts:["It copies the array","It only needs one temp variable (the key)","It uses a linked list","It sorts in place with no extra memory at all"],ans:1,exp:"Insertion Sort only ever holds the 'key' (the element being inserted) in a temporary variable while shifting others right. No auxiliary arrays needed — it sorts entirely in-place." },
    { q:"Insertion Sort is stable. This is because:",opts:["It never compares equal elements","It stops shifting when arr[j] ≤ key, never swapping equals","It sorts from right to left","It's a comparison sort"],ans:1,exp:"The condition arr[j] > key (strictly greater than) means we stop scanning when we find an equal element. Equal elements are never swapped past each other, preserving their original order." },
    { q:"Binary Insertion Sort reduces which part of Insertion Sort's cost?",opts:["Number of shifts","Number of comparisons","Space complexity","Overall time complexity"],ans:1,exp:"Binary Insertion Sort uses binary search to find the insertion point in O(log n) comparisons instead of O(n). But you still need O(n) shifts to open the gap, so total worst-case time remains O(n²)." },
    { q:"Tim Sort uses Insertion Sort internally because:",opts:["Insertion Sort is always fastest","Insertion Sort has O(n) best case and low overhead for small/nearly-sorted arrays","Insertion Sort is stable and in-place","Insertion Sort is easy to implement"],ans:1,exp:"Tim Sort detects naturally sorted 'runs' in real data and uses Insertion Sort on small runs (≤64 elements) where its O(n) best case and tiny constant factors beat even O(n log n) algorithms. Then it merges the sorted runs." },
  ];
  const [ans, setAns] = useState({});
  const [rev, setRev] = useState({});
  const score    = Object.entries(ans).filter(([qi,ai]) => QS[+qi].ans === +ai).length;
  const answered = Object.keys(rev).length;
  useEffect(() => { if (answered===QS.length) onDone?.(score,QS.length); }, [rev]);
  return (
    <div>
      <div style={{ marginBottom:20 }}>
        <div style={{ display:"flex",justifyContent:"space-between",marginBottom:8 }}>
          <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#44403c" }}>PROGRESS</span>
          <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#f59e0b",fontWeight:700 }}>{answered}/{QS.length}</span>
        </div>
        <div style={{ height:4,background:"rgba(255,255,255,0.06)",borderRadius:99,overflow:"hidden" }}>
          <div style={{ height:"100%",width:`${(answered/QS.length)*100}%`,background:"linear-gradient(90deg,#d97706,#0ea5e9)",borderRadius:99,transition:"width 0.5s cubic-bezier(0.22,1,0.36,1)" }}/>
        </div>
      </div>
      <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
        {QS.map((q,qi) => {
          const isR=rev[qi];
          const bc=isR?(ans[qi]===q.ans?"rgba(74,222,128,0.35)":"rgba(239,68,68,0.35)"):"rgba(255,255,255,0.07)";
          return (
            <div key={qi} style={{ padding:"16px 18px",borderRadius:16,background:"rgba(255,255,255,0.015)",border:`1px solid ${bc}`,transition:"border-color 0.3s" }}>
              <div style={{ display:"flex",gap:10,marginBottom:12,alignItems:"flex-start" }}>
                <span style={{ width:24,height:24,borderRadius:8,flexShrink:0,marginTop:1,background:isR?(ans[qi]===q.ans?"rgba(74,222,128,0.2)":"rgba(239,68,68,0.2)"):"rgba(245,158,11,0.15)",border:`1px solid ${isR?(ans[qi]===q.ans?"rgba(74,222,128,0.42)":"rgba(239,68,68,0.42)"):"rgba(245,158,11,0.32)"}`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:700,color:isR?(ans[qi]===q.ans?"#4ade80":"#ef4444"):"#f59e0b" }}>{qi+1}</span>
                <div style={{ fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:600,color:"#e2e8f0",lineHeight:1.52 }}>{q.q}</div>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:7 }}>
                {q.opts.map((opt,oi) => {
                  const isSel=ans[qi]===oi, isCorr=q.ans===oi;
                  let bg="rgba(255,255,255,0.03)",brd="rgba(255,255,255,0.07)",col="#44403c";
                  if(isR){if(isCorr){bg="rgba(74,222,128,0.12)";brd="rgba(74,222,128,0.38)";col="#4ade80";}else if(isSel){bg="rgba(239,68,68,0.12)";brd="rgba(239,68,68,0.38)";col="#f87171";}else col="#292524";}
                  else if(isSel){bg="rgba(245,158,11,0.12)";brd="rgba(245,158,11,0.38)";col="#fbbf24";}
                  return (
                    <button key={oi} onClick={() => !isR&&setAns(a=>({...a,[qi]:oi}))} style={{ padding:"9px 12px",borderRadius:10,cursor:isR?"default":"pointer",background:bg,border:`1px solid ${brd}`,fontFamily:"'DM Sans',sans-serif",fontSize:13,color:col,textAlign:"left",transition:"all 0.22s",display:"flex",alignItems:"center",gap:8 }}>
                      <span style={{ width:19,height:19,borderRadius:"50%",flexShrink:0,background:isR?(isCorr?"rgba(74,222,128,0.26)":isSel?"rgba(239,68,68,0.26)":"rgba(255,255,255,0.04)"):(isSel?"rgba(245,158,11,0.26)":"rgba(255,255,255,0.04)"),border:`1px solid ${col}50`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:700,color:col }}>{isR&&isCorr?"✓":isR&&isSel&&!isCorr?"✗":String.fromCharCode(65+oi)}</span>
                      {opt}
                    </button>
                  );
                })}
              </div>
              {ans[qi]!==undefined&&!isR&&(
                <button onClick={() => setRev(r=>({...r,[qi]:true}))} style={{ marginTop:10,padding:"6px 18px",borderRadius:20,cursor:"pointer",background:"rgba(245,158,11,0.12)",border:"1px solid rgba(245,158,11,0.3)",fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:700,color:"#f59e0b" }}>CHECK →</button>
              )}
              {isR&&(
                <div style={{ marginTop:10,padding:"9px 12px",borderRadius:10,background:ans[qi]===q.ans?"rgba(74,222,128,0.07)":"rgba(239,68,68,0.07)",border:`1px solid ${ans[qi]===q.ans?"rgba(74,222,128,0.2)":"rgba(239,68,68,0.2)"}`,fontFamily:"'DM Sans',sans-serif",fontSize:12.5,color:"#94a3b8",lineHeight:1.58,animation:"fUp 0.3s ease" }}>
                  <span style={{ fontWeight:700,color:ans[qi]===q.ans?"#4ade80":"#f87171" }}>{ans[qi]===q.ans?"✓ Correct! ":"✗ Not quite — "}</span>{q.exp}
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
export default function InsertionSortPage() {
  const [speaking,     setSpeaking]     = useState(null);
  const [active,       setActive]       = useState("intro");
  const [qScore,       setQScore]       = useState(null);
  const [qTotal,       setQTotal]       = useState(null);
  const [seenSections, setSeenSections] = useState(new Set());
  const [showConfetti, setShowConfetti] = useState(false);
  const currentNarr = useRef(null);

  // Fonts + voice warmup
  useEffect(() => {
    const lk = document.createElement("link");
    lk.rel = "stylesheet";
    lk.href = "https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;700&display=swap";
    document.head.appendChild(lk);
    const warm = () => { window.speechSynthesis?.getVoices(); window.removeEventListener("click", warm); };
    window.addEventListener("click", warm);
    return () => { try { document.head.removeChild(lk); } catch {} };
  }, []);

  // Active section + seen tracker
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

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName==="INPUT"||e.target.tagName==="TEXTAREA") return;
      if (e.key==="s"||e.key==="S") { voiceStop(); setSpeaking(null); }
      if (e.key==="ArrowDown") {
        e.preventDefault();
        const idx=NAV_SECTIONS.findIndex(s=>s.id===active);
        const next=NAV_SECTIONS[Math.min(idx+1,NAV_SECTIONS.length-1)];
        if(next) document.getElementById(next.id)?.scrollIntoView({ behavior:"smooth" });
      }
      if (e.key==="ArrowUp") {
        e.preventDefault();
        const idx=NAV_SECTIONS.findIndex(s=>s.id===active);
        const prev=NAV_SECTIONS[Math.max(idx-1,0)];
        if(prev) document.getElementById(prev.id)?.scrollIntoView({ behavior:"smooth" });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  const handleVoice = useCallback((id, text) => {
    if (speaking===id) { voiceStop(); setSpeaking(null); currentNarr.current=null; }
    else {
      currentNarr.current = { id, text };
      setSpeaking(id);
      voiceSpeak(text, () => { setSpeaking(null); currentNarr.current=null; });
    }
  }, [speaking]);

  const handleStop = useCallback(() => { voiceStop(); setSpeaking(null); currentNarr.current=null; }, []);

  const speakingLabel = speaking
    ? (NAV_SECTIONS.find(s=>s.id===speaking)?.label ?? (speaking==="__hero__"?"Introduction":speaking))
    : null;

  const goIntro = () => document.getElementById("intro")?.scrollIntoView({ behavior:"smooth" });

  const SECTS = [
    { id:"intro",      icon:"🃏",title:"What is Insertion Sort?",             color:"#f59e0b",voice:NARR.intro,      visual:<VisIntro/>,       cards:[
        { lbl:"THE CARD METAPHOR",    body:"Think of sorting playing cards in your hand. You hold a sorted group on the left. Pick up one new card at a time. Slide it left until it finds its spot." },
        { lbl:"HOW IT WORKS",         body:"Maintain a sorted left portion. One by one, take the next element (the 'key'). Shift sorted elements rightward until the key's correct position is found. Insert." },
        { lbl:"WHEN IT WINS",         body:"For small arrays (n ≤ 20–50), Insertion Sort outperforms Merge Sort and Quick Sort in practice because its constant factors are extremely small." },
        { lbl:"IN THE REAL WORLD",    body:"Used inside Tim Sort (Python/Java) for small runs. Used in embedded systems with tight memory. Used wherever data arrives one item at a time." },
      ]},
    { id:"howitworks", icon:"⚙️", title:"The Algorithm — Step by Step",        color:"#38bdf8",voice:NARR.howItWorks, visual:<VisHowItWorks/>,  cards:[
        { lbl:"THE OUTER LOOP",       body:"for i from 1 to n-1: the outer loop walks right, picking up each new element (key) to insert into the already-sorted left portion." },
        { lbl:"THE INNER LOOP",       body:"while j ≥ 0 AND arr[j] > key: shift arr[j] one position right. The inner loop opens a gap for the key by shifting larger elements." },
        { lbl:"THE INSERT",           body:"arr[j+1] = key: after the inner loop ends (either j < 0 or arr[j] ≤ key), place key in the gap. This is O(1) — one assignment." },
        { lbl:"TERMINATION",          body:"When the outer loop reaches the last element and inserts it, the full array is sorted. The algorithm always terminates in exactly n-1 outer iterations." },
      ]},
    { id:"invariant",  icon:"🔒",title:"The Loop Invariant",                   color:"#a78bfa",voice:NARR.invariant,  visual:<VisInvariant/>,   cards:[
        { lbl:"WHAT IS AN INVARIANT", body:"A loop invariant is a property that holds true before and after every iteration of a loop. It's the mathematical guarantee that an algorithm is correct." },
        { lbl:"INSERTION SORT'S INVARIANT", body:"At the start of each outer iteration i, the subarray arr[0..i-1] is sorted. This is trivially true for i=1 (one element). Each insertion step maintains it." },
        { lbl:"INDUCTIVE PROOF",      body:"Induction: the single element arr[0] is sorted (base). If arr[0..i-1] is sorted, inserting arr[i] in the right place makes arr[0..i] sorted (step). QED." },
        { lbl:"WHY IT MATTERS",       body:"Invariants let us reason about correctness formally. When the outer loop ends at i=n, the invariant tells us arr[0..n-1] — the whole array — is sorted." },
      ]},
    { id:"complexity", icon:"📊",title:"Time & Space Complexity",              color:"#fb923c",voice:NARR.complexity, visual:<VisComplexity/>,  cards:[
        { lbl:"BEST CASE O(n)",       body:"If the array is already sorted, the inner loop never executes. We make n-1 comparisons total — one per outer iteration. Pure linear time." },
        { lbl:"WORST CASE O(n²)",     body:"Reverse-sorted input: element at position i must shift past all i preceding elements. Total: 1+2+3+…+(n-1) = n(n-1)/2 = O(n²) shifts." },
        { lbl:"O(1) SPACE",           body:"Insertion Sort is in-place. The only extra memory is the 'key' variable holding the current element. No auxiliary arrays, no recursion stack." },
        { lbl:"VS MERGE SORT",        body:"Merge Sort always beats Insertion Sort on large random data. But Insertion Sort wins on sorted or nearly-sorted small arrays — hence Tim Sort uses both." },
      ]},
    { id:"adaptive",   icon:"⚡",title:"Adaptivity — Why Input Matters",       color:"#4ade80",voice:NARR.adaptive,   visual:<VisAdaptive/>,   cards:[
        { lbl:"WHAT ADAPTIVE MEANS",  body:"An algorithm is adaptive if it runs faster when the input is partially sorted. Insertion Sort is adaptive; Merge Sort is not — both take O(n log n) regardless." },
        { lbl:"THE k-DISPLACEMENT",   body:"If every element is at most k positions from its final location, Insertion Sort runs in O(kn) time. For k=1 (almost sorted), that's O(n) — linear!" },
        { lbl:"TIM SORT EXPLOITS THIS",body:"Tim Sort finds naturally sorted runs (ascending or descending sequences) in real-world data. Insertion Sort is applied to each run. Real data is often nearly-sorted." },
        { lbl:"PRACTICAL IMPLICATION",body:"When you know your data is nearly-sorted (e.g., re-sorting a leaderboard after one update), Insertion Sort or Tim Sort will dramatically outperform a naive O(n log n) choice." },
      ]},
    { id:"stable",     icon:"⚖️", title:"Stability & Why It Matters",          color:"#f472b6",voice:NARR.stable,     visual:<VisStable/>,     cards:[
        { lbl:"STABLE SORT DEFINITION",body:"A stable sort preserves the relative order of elements with equal keys. If Alice and Bob both have score 85 and Alice came first, she stays first after sorting." },
        { lbl:"HOW INSERTION SORT ACHIEVES IT",body:"The inner loop condition is arr[j] > key (strictly greater). When equal, we stop — the key is inserted after the equal element, never before it." },
        { lbl:"MULTI-KEY SORTING",    body:"Sort a table by grade, then by name. First sort by name (stable), then sort by grade (stable). The name-order within each grade is perfectly preserved." },
        { lbl:"CONTRAST WITH UNSTABLE SORTS",body:"Shell Sort and heap sort are NOT stable. Quick Sort is not stable by default. Insertion Sort's stability makes it the go-to choice when relative order matters." },
      ]},
    { id:"binary",     icon:"🔍",title:"Binary Insertion Sort",                 color:"#34d399",voice:NARR.binary,     visual:<VisBinary/>,     cards:[
        { lbl:"THE OPTIMIZATION",     body:"Instead of scanning leftward linearly (O(n) comparisons), use binary search to find the insertion point in O(log n) comparisons." },
        { lbl:"TOTAL COMPARISONS",    body:"With binary search: ⌈log₂(2)⌉ + ⌈log₂(3)⌉ + … + ⌈log₂(n)⌉ = O(n log n) total comparisons — the same as Merge Sort!" },
        { lbl:"BUT SHIFTS REMAIN O(n²)",body:"Finding the position is now fast, but we still need to physically shift elements to open the gap. Total time is still O(n²) in the worst case." },
        { lbl:"WHEN IT HELPS",        body:"Binary Insertion Sort shines when comparisons are expensive (e.g., sorting strings or complex objects) and shifts are cheap (e.g., arrays of pointers). It's a targeted win." },
      ]},
  ];

  return (
    <div style={{ background:"#0a0804",color:"#f8fafc",minHeight:"100vh",overflowX:"hidden" }}>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        ::selection{background:rgba(245,158,11,0.35)}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(245,158,11,0.3);border-radius:8px}
        ::-webkit-scrollbar-thumb:hover{background:rgba(245,158,11,0.5)}

        @keyframes orb1{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(24px,-18px) scale(1.05)}66%{transform:translate(-14px,11px) scale(0.97)}}
        @keyframes orb2{0%,100%{transform:translate(0,0)}42%{transform:translate(-22px,16px)}84%{transform:translate(16px,-10px)}}
        @keyframes heroPush{0%{opacity:0;transform:translateY(-50px) scaleY(0.7) scaleX(0.85)}60%{opacity:1;transform:translateY(4px) scaleY(1.04) scaleX(0.97)}100%{transform:translateY(0) scaleY(1) scaleX(1);opacity:1}}
        @keyframes opLabelIn{from{opacity:0;transform:scale(0.85) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes cardReveal{0%{opacity:0;transform:translateY(-40px) rotateX(-30deg)}60%{opacity:1;transform:translateY(4px) rotateX(3deg)}100%{transform:translateY(0) rotateX(0);opacity:1}}
        @keyframes topPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(1.5)}}
        @keyframes plateIn{from{opacity:0;transform:translateY(-28px) scale(0.9)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes sRight{from{opacity:0;transform:translateX(26px)}to{opacity:1;transform:translateX(0)}}
        @keyframes fUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes slideUp{from{opacity:0;transform:translate(-50%,20px)}to{opacity:1;transform:translate(-50%,0)}}
        @keyframes wave{0%,100%{transform:scaleY(0.4)}50%{transform:scaleY(1)}}
        @keyframes confettiFall{0%{transform:translateY(0) rotate(0deg);opacity:1}80%{opacity:1}100%{transform:translateY(110vh) rotate(720deg);opacity:0}}

        @media(max-width:760px){
          .sg{grid-template-columns:1fr !important}
          .nav-pills button{width:30px !important;height:30px !important;font-size:13px !important}
        }
      `}</style>

      {showConfetti && <Confetti/>}
      <ProgressBar/>
      <StickyNav active={active} speaking={!!speaking} seenCount={seenSections.size}/>
      <BackToTop/>
      <MiniPlayer speaking={speaking} speakingLabel={speakingLabel} onStop={handleStop}/>

      <Hero onStart={goIntro} onVoice={() => handleVoice("__hero__", NARR.intro)}/>

      {/* Shortcut hint */}
      <div style={{ textAlign:"center",marginBottom:32,fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#292524",letterSpacing:"0.1em" }}>
        PRESS <kbd style={{ background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:5,padding:"1px 7px",color:"#44403c" }}>S</kbd> TO STOP VOICE · <kbd style={{ background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:5,padding:"1px 7px",color:"#44403c" }}>↑↓</kbd> TO NAVIGATE
      </div>

      <main style={{ maxWidth:1000,margin:"0 auto",padding:"0 20px 100px" }}>
        {SECTS.map(s => (
          <Sect key={s.id} id={s.id} icon={s.icon} title={s.title}
            color={s.color} visual={s.visual} cards={s.cards}
            voice={s.voice} speaking={speaking} onVoice={handleVoice}
            seen={seenSections.has(s.id)}/>
        ))}

        {/* Complexity table */}
        <section id="complexity-table" style={{ marginBottom:80 }}>
          <div style={{ display:"flex",alignItems:"center",gap:14,marginBottom:22,flexWrap:"wrap" }}>
            <div style={{ width:50,height:50,borderRadius:16,flexShrink:0,background:"rgba(56,189,248,0.12)",border:"1px solid rgba(56,189,248,0.32)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,boxShadow:"0 0 28px rgba(56,189,248,0.15)" }}>⚡</div>
            <div>
              <h2 style={{ fontFamily:"'Syne',sans-serif",fontSize:"clamp(19px,3.8vw,30px)",fontWeight:800,color:"#f8fafc" }}>Quick Reference Cheat Sheet</h2>
              <p style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#44403c",marginTop:3,letterSpacing:"0.08em" }}>ALL CASES · HOVER ROWS FOR DETAILS</p>
            </div>
          </div>
          <div style={{ borderRadius:22,overflow:"hidden",background:"rgba(255,255,255,0.015)",border:"1px solid rgba(255,255,255,0.06)" }}>
            <ComplexityTable/>
          </div>
        </section>

        {/* Python Code Reference */}
        <section style={{ marginBottom:80 }}>
          <div style={{ display:"flex",alignItems:"center",gap:14,marginBottom:22 }}>
            <div style={{ width:50,height:50,borderRadius:16,flexShrink:0,background:"rgba(245,158,11,0.12)",border:"1px solid rgba(245,158,11,0.32)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24 }}>🐍</div>
            <div>
              <h2 style={{ fontFamily:"'Syne',sans-serif",fontSize:"clamp(19px,3.8vw,30px)",fontWeight:800,color:"#f8fafc" }}>Clean Python Implementation</h2>
              <p style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#44403c",marginTop:3,letterSpacing:"0.08em" }}>CLASSIC · BINARY · WITH COMMENTS</p>
            </div>
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }} className="sg">
            {[
              { label:"CLASSIC (LINEAR SCAN)", col:"#f59e0b", code:`def insertion_sort(arr):
    # Walk from 2nd element to end
    for i in range(1, len(arr)):
        key = arr[i]      # Element to insert
        j = i - 1        # Start scanning left
        
        # Shift elements greater than key
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]  # Shift right
            j -= 1
        
        arr[j + 1] = key  # Insert key in gap
    
    return arr

# Example
arr = [64, 25, 12, 22, 11]
insertion_sort(arr)
# → [11, 12, 22, 25, 64]` },
              { label:"BINARY INSERTION SORT", col:"#34d399", code:`import bisect

def binary_insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        
        # Binary search for insertion point
        # bisect_left returns index where key
        # should be inserted to keep sorted
        pos = bisect.bisect_left(arr, key, 0, i)
        
        # Shift arr[pos..i-1] right by 1
        arr[pos + 1 : i + 1] = arr[pos : i]
        arr[pos] = key
    
    return arr

# O(log n) comparisons per element
# Still O(n²) total due to shifts
# Best when comparisons are expensive
arr = [64, 25, 12, 22, 11]
binary_insertion_sort(arr)
# → [11, 12, 22, 25, 64]` },
            ].map(({ label, col, code }) => (
              <div key={label} style={{ borderRadius:18,overflow:"hidden",border:`1px solid ${col}20` }}>
                <div style={{ padding:"10px 16px",background:`${col}12`,borderBottom:`1px solid ${col}18`,fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:700,color:col,letterSpacing:"0.1em" }}>{label}</div>
                <div style={{ padding:"16px",background:"rgba(0,0,0,0.5)" }}>
                  <pre style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"#78716c",lineHeight:1.8,whiteSpace:"pre-wrap",margin:0 }}>{code}</pre>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop:12,padding:"10px 16px",borderRadius:12,background:"rgba(245,158,11,0.06)",border:"1px solid rgba(245,158,11,0.15)",fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#f59e0b" }}>
            💡 Tip: Python's <span style={{ color:"#fcd34d" }}>sorted()</span> and <span style={{ color:"#fcd34d" }}>list.sort()</span> use Tim Sort — which uses Insertion Sort internally for small runs. When you call <span style={{ color:"#fcd34d" }}>list.sort()</span>, Insertion Sort runs millions of times a day.
          </div>
        </section>

        {/* Algorithm Comparison */}
        <section style={{ marginBottom:80 }}>
          <div style={{ display:"flex",alignItems:"center",gap:14,marginBottom:22 }}>
            <div style={{ width:50,height:50,borderRadius:16,flexShrink:0,background:"rgba(167,139,250,0.12)",border:"1px solid rgba(167,139,250,0.32)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24 }}>⚔️</div>
            <div>
              <h2 style={{ fontFamily:"'Syne',sans-serif",fontSize:"clamp(19px,3.8vw,30px)",fontWeight:800,color:"#f8fafc" }}>When to Use Insertion Sort</h2>
              <p style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#44403c",marginTop:3,letterSpacing:"0.08em" }}>PRACTICAL DECISION GUIDE</p>
            </div>
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12 }} className="sg">
            {[
              { icon:"✅",title:"USE Insertion Sort when…",col:"#4ade80",items:["n ≤ 20–50 elements","Array is already nearly sorted","Data arrives one item at a time (online sort)","Memory is severely constrained (embedded systems)","You need in-place sorting with O(1) space","Comparisons are expensive, data small"] },
              { icon:"❌",title:"AVOID Insertion Sort when…",col:"#ef4444",items:["n > 100 and data is random","Array is large and reverse-sorted","Consistent O(n log n) guaranteed needed","Parallel sorting is required","Working with linked lists (use Merge Sort instead)","Memory is not a concern (Merge Sort is safer)"] },
            ].map(({icon,title,col,items}) => (
              <div key={title} style={{ padding:"16px 18px",borderRadius:18,background:`${col}07`,border:`1px solid ${col}22` }}>
                <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:12 }}>
                  <span style={{ fontSize:20 }}>{icon}</span>
                  <h3 style={{ fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:800,color:col,margin:0 }}>{title}</h3>
                </div>
                <div style={{ display:"flex",flexDirection:"column",gap:7 }}>
                  {items.map((item,i) => (
                    <div key={i} style={{ display:"flex",alignItems:"flex-start",gap:8 }}>
                      <span style={{ width:5,height:5,borderRadius:"50%",background:col,flexShrink:0,marginTop:5 }}/>
                      <span style={{ fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#78716c",lineHeight:1.55 }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quiz */}
        <section id="quiz" style={{ marginBottom:80 }}>
          <div style={{ display:"flex",alignItems:"center",gap:14,marginBottom:8,flexWrap:"wrap" }}>
            <div style={{ width:50,height:50,borderRadius:16,flexShrink:0,background:"rgba(236,72,153,0.12)",border:"1px solid rgba(236,72,153,0.32)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,boxShadow:"0 0 28px rgba(236,72,153,0.15)" }}>🧠</div>
            <div style={{ flex:1,minWidth:0 }}>
              <h2 style={{ fontFamily:"'Syne',sans-serif",fontSize:"clamp(19px,3.8vw,30px)",fontWeight:800,color:"#f8fafc" }}>Test Your Knowledge</h2>
              <p style={{ fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#44403c",marginTop:3 }}>6 questions · covers every section · some require real understanding</p>
            </div>
            <button onClick={() => handleVoice("quiz",NARR.quiz)} style={{
              display:"flex",alignItems:"center",gap:7,
              padding:"7px 14px",borderRadius:28,cursor:"pointer",flexShrink:0,
              background:speaking==="quiz"?"rgba(236,72,153,0.2)":"rgba(255,255,255,0.04)",
              border:`1.5px solid ${speaking==="quiz"?"#ec4899":"rgba(255,255,255,0.1)"}`,
              fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:700,
              color:speaking==="quiz"?"#ec4899":"#44403c",transition:"all 0.22s",
            }}>
              {speaking==="quiz"?<SpeakingWave color="#ec4899" size={12}/>:<span style={{ fontSize:12 }}>🔊</span>}
              {speaking==="quiz"?"STOP":"LISTEN"}
            </button>
          </div>
          <div style={{ marginBottom:22 }}/>
          <Quiz onDone={(sc,tot) => {
            setQScore(sc); setQTotal(tot);
            if(sc>=tot){ setShowConfetti(true); setTimeout(()=>setShowConfetti(false),4000); }
          }}/>

          {qScore !== null && (
            <div style={{
              marginTop:30,padding:"36px 24px",borderRadius:24,textAlign:"center",
              background:`linear-gradient(138deg,${qScore>=5?"rgba(74,222,128,0.1)":qScore>=3?"rgba(245,158,11,0.1)":"rgba(239,68,68,0.1)"} 0%,rgba(0,0,0,0) 100%)`,
              border:`1px solid ${qScore>=5?"rgba(74,222,128,0.32)":qScore>=3?"rgba(245,158,11,0.32)":"rgba(239,68,68,0.32)"}`,
              animation:"fUp 0.5s ease",
            }}>
              <div style={{ fontSize:52,marginBottom:12 }}>{qScore>=5?"🏆":qScore>=3?"🌟":"💪"}</div>
              <div style={{ fontFamily:"'Syne',sans-serif",fontSize:40,fontWeight:800,color:qScore>=5?"#4ade80":qScore>=3?"#fbbf24":"#f87171" }}>{qScore} / {qTotal}</div>
              <p style={{ fontFamily:"'DM Sans',sans-serif",fontSize:15,color:"#78716c",margin:"10px 0 24px",lineHeight:1.55 }}>
                {qScore>=5?"Excellent! You understand when and why Insertion Sort wins — that's the hard part.":qScore>=3?"Good foundation. Re-read the sections you missed and retry.":"Keep going — revisit the animations and come back stronger."}
              </p>
              <div style={{ display:"inline-block",padding:"12px 28px",borderRadius:16,background:"linear-gradient(135deg,#d97706,#0ea5e9)",fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:700,color:"#fff" }}>
                🎉 Complete — Explore Merge Sort Next
              </div>
            </div>
          )}
        </section>

        {/* Footer CTA */}
        <div style={{
          textAlign:"center",padding:"48px 24px",borderRadius:26,
          background:"linear-gradient(140deg,rgba(245,158,11,0.08) 0%,rgba(56,189,248,0.06) 50%,rgba(167,139,250,0.05) 100%)",
          border:"1px solid rgba(245,158,11,0.16)",position:"relative",overflow:"hidden",
        }}>
          <div style={{ position:"absolute",inset:0,backgroundImage:"radial-gradient(circle,rgba(245,158,11,0.04) 1px,transparent 1px)",backgroundSize:"32px 32px",pointerEvents:"none" }}/>
          <div style={{ fontSize:48,marginBottom:14 }}>🃏</div>
          <h3 style={{ fontFamily:"'Syne',sans-serif",fontSize:"clamp(17px,3.2vw,26px)",fontWeight:800,color:"#f8fafc",marginBottom:12 }}>You've mastered Insertion Sort!</h3>
          <p style={{ fontFamily:"'DM Sans',sans-serif",fontSize:14,color:"#44403c",maxWidth:480,margin:"0 auto 28px",lineHeight:1.72 }}>
            Implement it from scratch — write the inner while loop without looking. Once you can sort a hand of cards on paper in under 30 seconds, it's yours forever.
          </p>
          <div style={{ display:"flex",gap:6,justifyContent:"center",flexWrap:"wrap",marginBottom:16 }}>
            {NAV_SECTIONS.map(s => (
              <div key={s.id} style={{
                padding:"4px 12px",borderRadius:20,
                background:seenSections.has(s.id)?`${s.col}18`:"rgba(255,255,255,0.02)",
                border:`1px solid ${seenSections.has(s.id)?`${s.col}38`:"rgba(255,255,255,0.05)"}`,
                fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:700,
                color:seenSections.has(s.id)?s.col:"#1c1917",transition:"all 0.3s",
              }}>{s.icon} {s.label} {seenSections.has(s.id)?"✓":""}</div>
            ))}
          </div>
          <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#292524",marginBottom:22 }}>{seenSections.size} / {NAV_SECTIONS.length} sections visited</div>
          <div style={{ display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap" }}>
            <button onClick={() => { if(typeof window!=="undefined") window.location.href="/merge-sort"; }} style={{
              padding:"12px 28px",borderRadius:14,cursor:"pointer",
              background:"rgba(56,189,248,0.15)",border:"1.5px solid rgba(56,189,248,0.4)",
              fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700,color:"#38bdf8",
              transition:"all 0.25s",
            }}
              onMouseEnter={e=>{ e.currentTarget.style.background="rgba(56,189,248,0.25)"; }}
              onMouseLeave={e=>{ e.currentTarget.style.background="rgba(56,189,248,0.15)"; }}>
              🌊 Explore Merge Sort →
            </button>
            <button onClick={() => { if(typeof window!=="undefined") window.location.href="/insertion-sort-implementation"; }} style={{
              padding:"12px 28px",borderRadius:14,cursor:"pointer",
              background:"rgba(245,158,11,0.15)",border:"1.5px solid rgba(245,158,11,0.4)",
              fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700,color:"#f59e0b",
              transition:"all 0.25s",
            }}
              onMouseEnter={e=>{ e.currentTarget.style.background="rgba(245,158,11,0.25)"; }}
              onMouseLeave={e=>{ e.currentTarget.style.background="rgba(245,158,11,0.15)"; }}>
              💻 View Code →
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}