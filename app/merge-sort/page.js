"use client";
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
  intro: `Merge Sort is one of the most elegant algorithms ever designed. It follows a beautifully simple idea: if a problem is too big to solve, split it into two halves, solve each half, then combine the results. This is called Divide and Conquer. A single element is already sorted. So if we keep splitting until every piece has just one element, then carefully merge those pieces back together in sorted order — we get a perfectly sorted array every single time. This is not a trick or a shortcut. This is mathematical guarantee.`,
  divide: `The Divide step is pure recursion. We find the midpoint of the array and split it into left and right halves. Then we recursively divide each half again. And again. And again. Until every subarray has exactly one element. A single element cannot be unsorted — it is trivially sorted. This is our base case. The recursion tree gets wider as we go down, doubling the number of pieces at each level, while each piece gets half as large. With eight elements, we get three levels deep.`,
  merge: `The Merge step is where the magic happens. We have two sorted subarrays sitting side by side. We place one pointer at the start of each. Compare the two elements. Take the smaller one and place it in the output. Advance that pointer. Repeat until one array is exhausted. Copy whatever remains from the other array. The result is a perfectly merged, sorted array. This runs in O of n time — exactly one pass through both arrays.`,
  complexity: `Merge Sort guarantees O of n log n in every case — best, average, and worst. No matter how disordered the input is, the algorithm takes the same number of steps. Compare this to Quick Sort, which degrades to O of n squared on already-sorted data. The log n comes from the number of levels in the recursion tree. The n comes from the merge work at each level. Multiply them: O of n log n. The cost is O of n extra space for the temporary merge arrays.`,
  recursion: `Let us trace the recursion tree for the array 38, 27, 43, 3. First call divides into 38, 27 and 43, 3. Each of those divides into single elements. Now we merge upward. 38 and 27 merge into 27, 38. 43 and 3 merge into 3, 43. Finally, we merge 27, 38 with 3, 43 into 3, 27, 38, 43. Every merge produces a sorted array. The recursion unwinds like a stack — the deepest calls return first, building sorted pieces from the bottom up.`,
  stability: `Merge Sort is a stable sorting algorithm. Stability means that two equal elements maintain their original relative order after sorting. When merging, if two elements are equal, we always pick from the left array first — this one rule preserves stability. This matters enormously in practice: sorting a table of students by grade when they are already sorted by name should preserve the name ordering within each grade. Merge Sort guarantees this. Quick Sort does not.`,
  variants: `There are powerful variants of Merge Sort. Bottom-up iterative Merge Sort avoids recursion entirely — start with runs of size one, merge to size two, then four, then eight. It uses O of one stack space. External Merge Sort handles data too large for memory: sort chunks that fit in RAM, write them to disk, then merge the sorted files. Tim Sort, used in Python and Java, is a hybrid that detects naturally sorted runs and uses insertion sort for small chunks — the most widely deployed sorting algorithm in the world today.`,
  quiz: `You have reached the quiz. You studied divide and conquer, the merge procedure, time and space complexity, recursion trees, stability, and Tim Sort. Some questions test deep understanding, not just memorization. A wrong answer is the fastest way to lock the correct concept into long-term memory. Take your time.`,
};

const NAV_SECTIONS = [
  { id:"intro",      icon:"🌊", label:"Intro",      col:"#60a5fa" },
  { id:"divide",     icon:"✂️",  label:"Divide",     col:"#f472b6" },
  { id:"merge",      icon:"🔀", label:"Merge",      col:"#4ade80" },
  { id:"complexity", icon:"📊", label:"Complexity", col:"#fb923c" },
  { id:"recursion",  icon:"🌳", label:"Recursion",  col:"#a78bfa" },
  { id:"stability",  icon:"⚖️",  label:"Stability",  col:"#34d399" },
  { id:"variants",   icon:"🚀", label:"Variants",   col:"#f59e0b" },
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
      <div style={{ height:"100%",width:`${p}%`,background:"linear-gradient(90deg,#60a5fa,#f472b6,#4ade80)",transition:"width 0.1s linear",boxShadow:"0 0 12px rgba(96,165,250,0.8)" }}/>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SPEAKING WAVE
// ═══════════════════════════════════════════════════════════════════════════════
function SpeakingWave({ color="#4ade80", size=16 }) {
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
      background:"rgba(3,6,18,0.94)",backdropFilter:"blur(28px) saturate(180%)",
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
      {/* Progress pill */}
      <div style={{ padding:"3px 9px",borderRadius:12,background:"rgba(96,165,250,0.08)",border:"1px solid rgba(96,165,250,0.2)",display:"flex",alignItems:"center",gap:5 }}>
        <div style={{ width:28,height:4,borderRadius:99,background:"rgba(255,255,255,0.06)",overflow:"hidden" }}>
          <div style={{ height:"100%",width:`${(seenCount/NAV_SECTIONS.length)*100}%`,background:"#60a5fa",borderRadius:99,transition:"width 0.5s ease" }}/>
        </div>
        <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:"#60a5fa",fontWeight:700 }}>{seenCount}/{NAV_SECTIONS.length}</span>
      </div>
      <div style={{ width:1,height:20,background:"rgba(255,255,255,0.08)",margin:"0 4px" }}/>
      {/* Code link */}
      <button onClick={() => { if(typeof window!=="undefined") window.location.href="/mergesort-implementation"; }} style={{
        padding:"4px 12px",borderRadius:20,cursor:"pointer",
        background:"rgba(244,114,182,0.12)",border:"1px solid rgba(244,114,182,0.35)",
        fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:700,
        color:"#f472b6",transition:"all 0.2s",
      }}>💻 Code</button>
      <div style={{ width:1,height:20,background:"rgba(255,255,255,0.08)",margin:"0 4px" }}/>
      <div style={{ padding:"3px 9px",borderRadius:12,background:"rgba(74,222,128,0.08)",border:"1px solid rgba(74,222,128,0.2)",display:"flex",alignItems:"center",gap:5 }}>
        <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:"#4ade80",fontWeight:700 }}>1.25×</span>
        {speaking && <SpeakingWave color="#4ade80" size={12}/>}
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
      background:"rgba(96,165,250,0.15)",border:"1px solid rgba(96,165,250,0.35)",
      color:"#93c5fd",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",
      opacity:show?1:0,transform:show?"scale(1)":"scale(0.7)",
      pointerEvents:show?"auto":"none",
      transition:"all 0.3s cubic-bezier(0.22,1,0.36,1)",
      boxShadow:"0 8px 24px rgba(96,165,250,0.3)",
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
      background:"rgba(96,165,250,0.12)",border:"1px solid rgba(96,165,250,0.3)",
      color:"#60a5fa",letterSpacing:"0.08em",animation:"fadeIn 0.4s ease both",
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
      background:"rgba(5,8,20,0.96)",backdropFilter:"blur(24px)",
      border:"1px solid rgba(96,165,250,0.3)",
      boxShadow:"0 8px 36px rgba(96,165,250,0.18),0 2px 12px rgba(0,0,0,0.7)",
      animation:"slideUp 0.35s cubic-bezier(0.22,1,0.36,1) both",
      maxWidth:"calc(100vw - 48px)",
    }}>
      <SpeakingWave color="#60a5fa" size={16}/>
      <div>
        <div style={{ fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,color:"#e2e8f0",lineHeight:1 }}>{speakingLabel}</div>
        <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#60a5fa",marginTop:2 }}>1.25× · male voice</div>
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
// HERO — Animated merge sort visualization
// ═══════════════════════════════════════════════════════════════════════════════
const HERO_COLORS = ["#60a5fa","#f472b6","#4ade80","#fb923c","#a78bfa","#f59e0b","#34d399","#e879f9"];
const HERO_NUMS = [38,27,43,3,9,82,10];

function Hero({ onStart, onVoice }) {
  const [phase, setPhase] = useState(0); // 0=original,1=split,2=split2,3=sorted,4=merged
  const [animPhase, setAnimPhase] = useState(0);

  useEffect(() => {
    const phases = [0,1,2,3,4,0];
    let i = 0;
    const tick = () => {
      i = (i + 1) % phases.length;
      setAnimPhase(phases[i]);
    };
    const id = setInterval(tick, 2200);
    return () => clearInterval(id);
  }, []);

  // Map phase to visual state
  const sorted = [...HERO_NUMS].sort((a,b)=>a-b);

  return (
    <div style={{
      minHeight:"100vh",display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"center",
      padding:"80px 24px 48px",textAlign:"center",position:"relative",overflow:"hidden",
    }}>
      {/* BG grid */}
      <div style={{ position:"absolute",inset:0,pointerEvents:"none",backgroundImage:"radial-gradient(circle,rgba(96,165,250,0.05) 1px,transparent 1px)",backgroundSize:"36px 36px" }}/>
      {/* Orbs */}
      <div style={{ position:"absolute",top:"6%",left:"3%",width:440,height:440,borderRadius:"50%",background:"radial-gradient(circle,rgba(96,165,250,0.13) 0%,transparent 70%)",filter:"blur(80px)",pointerEvents:"none",animation:"orb1 24s ease-in-out infinite" }}/>
      <div style={{ position:"absolute",bottom:"8%",right:"3%",width:360,height:360,borderRadius:"50%",background:"radial-gradient(circle,rgba(244,114,182,0.1) 0%,transparent 70%)",filter:"blur(68px)",pointerEvents:"none",animation:"orb2 30s ease-in-out infinite" }}/>

      {/* Mini recursion tree animation */}
      <div style={{ marginBottom:40,position:"relative",width:"100%",maxWidth:480 }}>
        {/* Phase label */}
        <div style={{ height:28,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:12 }}>
          <span key={animPhase} style={{
            padding:"3px 14px",borderRadius:20,
            fontFamily:"'JetBrains Mono',monospace",fontSize:10,fontWeight:700,
            background:animPhase===0?"rgba(96,165,250,0.15)":animPhase<=2?"rgba(244,114,182,0.15)":animPhase===3?"rgba(74,222,128,0.15)":"rgba(251,146,60,0.15)",
            border:`1px solid ${animPhase===0?"rgba(96,165,250,0.4)":animPhase<=2?"rgba(244,114,182,0.4)":animPhase===3?"rgba(74,222,128,0.4)":"rgba(251,146,60,0.4)"}`,
            color:animPhase===0?"#93c5fd":animPhase<=2?"#f9a8d4":animPhase===3?"#86efac":"#fdba74",
            animation:"opLabelIn 0.35s cubic-bezier(0.22,1,0.36,1) both",
          }}>
            {animPhase===0?"UNSORTED ARRAY":animPhase===1?"DIVIDE — split in half":animPhase===2?"DIVIDE — single elements":animPhase===3?"MERGE — sorted halves":"MERGE — fully sorted!"}
          </span>
        </div>

        {/* Array display */}
        {animPhase === 0 && (
          <div style={{ display:"flex",gap:6,justifyContent:"center",animation:"fadeIn 0.4s ease" }}>
            {HERO_NUMS.map((v,i) => (
              <div key={i} style={{ width:46,height:46,borderRadius:12,background:`${HERO_COLORS[i]}18`,border:`1.5px solid ${HERO_COLORS[i]}80`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'JetBrains Mono',monospace",fontSize:14,fontWeight:700,color:HERO_COLORS[i],boxShadow:`0 0 14px ${HERO_COLORS[i]}30`,animation:`heroPush 0.5s cubic-bezier(0.34,1.56,0.64,1) ${i*0.06}s both` }}>{v}</div>
            ))}
          </div>
        )}
        {animPhase === 1 && (
          <div style={{ display:"flex",gap:18,justifyContent:"center",animation:"fadeIn 0.4s ease" }}>
            <div style={{ display:"flex",gap:5,padding:"8px 12px",borderRadius:14,background:"rgba(96,165,250,0.07)",border:"1px solid rgba(96,165,250,0.25)" }}>
              {HERO_NUMS.slice(0,4).map((v,i) => (
                <div key={i} style={{ width:38,height:38,borderRadius:10,background:`${HERO_COLORS[i]}18`,border:`1.5px solid ${HERO_COLORS[i]}60`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'JetBrains Mono',monospace",fontSize:12,fontWeight:700,color:HERO_COLORS[i] }}>{v}</div>
              ))}
            </div>
            <div style={{ display:"flex",gap:5,padding:"8px 12px",borderRadius:14,background:"rgba(244,114,182,0.07)",border:"1px solid rgba(244,114,182,0.25)" }}>
              {HERO_NUMS.slice(4).map((v,i) => (
                <div key={i} style={{ width:38,height:38,borderRadius:10,background:`${HERO_COLORS[i+4]}18`,border:`1.5px solid ${HERO_COLORS[i+4]}60`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'JetBrains Mono',monospace",fontSize:12,fontWeight:700,color:HERO_COLORS[i+4] }}>{v}</div>
              ))}
            </div>
          </div>
        )}
        {animPhase === 2 && (
          <div style={{ display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap",animation:"fadeIn 0.4s ease" }}>
            {HERO_NUMS.map((v,i) => (
              <div key={i} style={{ width:38,height:38,borderRadius:9,background:`${HERO_COLORS[i]}22`,border:`2px solid ${HERO_COLORS[i]}`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'JetBrains Mono',monospace",fontSize:13,fontWeight:700,color:HERO_COLORS[i],animation:`heroPush 0.4s cubic-bezier(0.34,1.56,0.64,1) ${i*0.07}s both` }}>{v}</div>
            ))}
          </div>
        )}
        {animPhase === 3 && (
          <div style={{ display:"flex",gap:18,justifyContent:"center",animation:"fadeIn 0.4s ease" }}>
            <div style={{ display:"flex",gap:5,padding:"8px 12px",borderRadius:14,background:"rgba(74,222,128,0.07)",border:"1px solid rgba(74,222,128,0.3)" }}>
              {[...HERO_NUMS.slice(0,4)].sort((a,b)=>a-b).map((v,i) => (
                <div key={i} style={{ width:38,height:38,borderRadius:10,background:"rgba(74,222,128,0.15)",border:"1.5px solid rgba(74,222,128,0.5)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'JetBrains Mono',monospace",fontSize:12,fontWeight:700,color:"#4ade80" }}>{v}</div>
              ))}
            </div>
            <div style={{ display:"flex",gap:5,padding:"8px 12px",borderRadius:14,background:"rgba(74,222,128,0.07)",border:"1px solid rgba(74,222,128,0.3)" }}>
              {[...HERO_NUMS.slice(4)].sort((a,b)=>a-b).map((v,i) => (
                <div key={i} style={{ width:38,height:38,borderRadius:10,background:"rgba(74,222,128,0.15)",border:"1.5px solid rgba(74,222,128,0.5)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'JetBrains Mono',monospace",fontSize:12,fontWeight:700,color:"#4ade80" }}>{v}</div>
              ))}
            </div>
          </div>
        )}
        {animPhase === 4 && (
          <div style={{ display:"flex",gap:6,justifyContent:"center",animation:"fadeIn 0.4s ease" }}>
            {sorted.map((v,i) => (
              <div key={i} style={{ width:46,height:46,borderRadius:12,background:"rgba(251,146,60,0.18)",border:"2px solid rgba(251,146,60,0.8)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'JetBrains Mono',monospace",fontSize:14,fontWeight:700,color:"#fdba74",boxShadow:"0 0 16px rgba(251,146,60,0.3)",animation:`heroPush 0.45s cubic-bezier(0.34,1.56,0.64,1) ${i*0.06}s both` }}>{v}</div>
            ))}
          </div>
        )}
      </div>

      {/* Text */}
      <div style={{ maxWidth:640,position:"relative" }}>
        <div style={{
          display:"inline-flex",alignItems:"center",gap:8,marginBottom:20,
          padding:"5px 18px",borderRadius:40,
          background:"rgba(96,165,250,0.08)",border:"1px solid rgba(96,165,250,0.2)",
          fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#60a5fa",letterSpacing:"0.1em",
        }}>📚 INTERACTIVE VISUAL GUIDE · FOR COMPLETE BEGINNERS</div>

        <h1 style={{
          margin:"0 0 16px",fontFamily:"'Syne',sans-serif",
          fontSize:"clamp(38px,7.5vw,78px)",fontWeight:800,letterSpacing:"-0.035em",lineHeight:1.02,
          background:"linear-gradient(145deg,#f8fafc 0%,#bfdbfe 30%,#f9a8d4 65%,#86efac 100%)",
          WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",
        }}>Merge Sort</h1>

        <p style={{ margin:"0 auto 8px",fontFamily:"'DM Sans',sans-serif",fontSize:"clamp(14px,2.2vw,18px)",color:"#64748b",lineHeight:1.68,maxWidth:500 }}>
          The most <strong style={{ color:"#93c5fd" }}>beautiful algorithm</strong> in computer science — animated, explained, and narrated. Divide. Conquer. Merge.
        </p>
        <p style={{ margin:"0 auto 32px",fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"#334155",letterSpacing:"0.06em" }}>O(n log n) guaranteed · Stable · Divide &amp; Conquer</p>

        <div style={{ display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap" }}>
          <button onClick={onStart} style={{
            padding:"15px 36px",borderRadius:16,cursor:"pointer",
            background:"linear-gradient(135deg,#3b82f6 0%,#ec4899 100%)",
            border:"none",fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:700,
            color:"#fff",boxShadow:"0 8px 36px rgba(59,130,246,0.45)",transition:"all 0.25s",
          }}
            onMouseEnter={e => { e.currentTarget.style.transform="translateY(-3px) scale(1.02)"; e.currentTarget.style.boxShadow="0 14px 48px rgba(59,130,246,0.6)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="0 8px 36px rgba(59,130,246,0.45)"; }}>
            Begin Learning ↓
          </button>
          <button onClick={onVoice} style={{
            padding:"15px 26px",borderRadius:16,cursor:"pointer",
            background:"rgba(255,255,255,0.05)",border:"1.5px solid rgba(255,255,255,0.15)",
            fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:600,
            color:"#94a3b8",transition:"all 0.25s",display:"flex",alignItems:"center",gap:9,
          }}
            onMouseEnter={e => { e.currentTarget.style.background="rgba(255,255,255,0.1)"; e.currentTarget.style.color="#f8fafc"; }}
            onMouseLeave={e => { e.currentTarget.style.background="rgba(255,255,255,0.05)"; e.currentTarget.style.color="#94a3b8"; }}>
            <span style={{ fontSize:18 }}>🔊</span> Hear Intro
          </button>
        </div>

        {/* Stats row */}
        <div style={{ display:"flex",gap:28,justifyContent:"center",marginTop:44,flexWrap:"wrap" }}>
          {[["8","Sections"],["7+","Animations"],["6","Quiz Qs"],["O(n log n)","Guaranteed"]].map(([n,l]) => (
            <div key={l} style={{ textAlign:"center" }}>
              <div style={{ fontFamily:"'Syne',sans-serif",fontSize:26,fontWeight:800,background:"linear-gradient(135deg,#93c5fd,#f9a8d4)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text" }}>{n}</div>
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
          background:"linear-gradient(150deg,rgba(255,255,255,0.028) 0%,rgba(0,0,0,0.22) 100%)",
          border:`1px solid ${color}18`,boxShadow:`0 0 64px ${color}09`,minWidth:0,
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
              {c.lbl && <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:8.5,fontWeight:700,color,letterSpacing:"0.12em",marginBottom:5,opacity:0.88 }}>{c.lbl}</div>}
              <div style={{ fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#94a3b8",lineHeight:1.68 }}>{c.body}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VISUAL: Intro — Interactive full merge sort demo
// ═══════════════════════════════════════════════════════════════════════════════
function VisIntro() {
  const [arr, setArr] = useState([38,27,43,3,9,82,10]);
  const [sorting, setSorting] = useState(false);
  const [sorted, setSorted] = useState(false);
  const [currentMerge, setCurrentMerge] = useState(null);
  const [log, setLog] = useState([]);
  const [barHeights, setBarHeights] = useState([38,27,43,3,9,82,10]);
  const [activeIndices, setActiveIndices] = useState([]);

  const COLORS = ["#60a5fa","#f472b6","#4ade80","#fb923c","#a78bfa","#f59e0b","#34d399"];

  const reset = () => {
    const fresh = [38,27,43,3,9,82,10];
    setArr(fresh);
    setBarHeights(fresh);
    setSorted(false);
    setSorting(false);
    setCurrentMerge(null);
    setLog([]);
    setActiveIndices([]);
  };

  const sleep = ms => new Promise(r => setTimeout(r, ms));

  const animatedMergeSort = async () => {
    if (sorting) return;
    setSorting(true);
    setSorted(false);
    setLog([]);
    const a = [...arr];

    const mergeStep = async (arr, left, mid, right) => {
      setActiveIndices(Array.from({length:right-left+1},(_,i)=>left+i));
      setLog(l => [`Merging [${arr.slice(left,mid+1).join(",")}] + [${arr.slice(mid+1,right+1).join(",")}]`,...l].slice(0,6));
      await sleep(400);
      const L = arr.slice(left, mid+1);
      const R = arr.slice(mid+1, right+1);
      let i=0,j=0,k=left;
      while(i<L.length&&j<R.length){
        if(L[i]<=R[j]){arr[k]=L[i];i++;}
        else{arr[k]=R[j];j++;}
        k++;
        setBarHeights([...arr]);
        await sleep(180);
      }
      while(i<L.length){arr[k]=L[i];i++;k++;setBarHeights([...arr]);await sleep(180);}
      while(j<R.length){arr[k]=R[j];j++;k++;setBarHeights([...arr]);await sleep(180);}
      setCurrentMerge([left,right]);
      await sleep(200);
    };

    const sort = async (arr, left, right) => {
      if(left>=right) return;
      const mid = Math.floor((left+right)/2);
      await sort(arr, left, mid);
      await sort(arr, mid+1, right);
      await mergeStep(arr, left, mid, right);
    };

    await sort(a, 0, a.length-1);
    setArr([...a]);
    setBarHeights([...a]);
    setActiveIndices([]);
    setCurrentMerge(null);
    setSorted(true);
    setSorting(false);
    setLog(l => ["✓ Array fully sorted!",...l].slice(0,6));
  };

  const maxH = Math.max(...barHeights);

  return (
    <div>
      <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:8.5,color:"#2d3748",letterSpacing:"0.08em",marginBottom:12 }}>LIVE MERGE SORT — watch every comparison</div>

      {/* Bar chart */}
      <div style={{ display:"flex",gap:5,alignItems:"flex-end",height:100,marginBottom:12,justifyContent:"center" }}>
        {barHeights.map((v,i) => {
          const isActive = activeIndices.includes(i);
          const isSorted = sorted;
          const col = isSorted?"#4ade80":isActive?COLORS[i%COLORS.length]:`${COLORS[i%COLORS.length]}70`;
          return (
            <div key={i} style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:3 }}>
              <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:700,color:col,transition:"color 0.3s" }}>{v}</span>
              <div style={{
                width:36,borderRadius:"6px 6px 0 0",
                height:`${(v/maxH)*72}px`,
                background:isSorted?`linear-gradient(180deg,#4ade80,#22c55e)`:isActive?`linear-gradient(180deg,${col},${col}88)`:`linear-gradient(180deg,${col}55,${col}22)`,
                border:`1.5px solid ${col}`,
                transition:"height 0.25s cubic-bezier(0.34,1.2,0.64,1),background 0.3s,border-color 0.3s",
                boxShadow:isActive?`0 0 14px ${col}50`:"none",
              }}/>
            </div>
          );
        })}
      </div>

      {/* Log */}
      <div style={{ minHeight:64,marginBottom:10 }}>
        {log.map((l,i) => (
          <div key={i} style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:i===0?"#60a5fa":"#2d3748",padding:"2px 0",animation:i===0?"fadeIn 0.2s ease":"none" }}>
            {i===0?"▶ ":"  "}{l}
          </div>
        ))}
        {log.length===0 && <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#1a2030" }}>Press Sort to watch it live…</div>}
      </div>

      {/* Buttons */}
      <div style={{ display:"flex",gap:7,justifyContent:"center",flexWrap:"wrap" }}>
        <button onClick={animatedMergeSort} disabled={sorting} style={{
          padding:"8px 20px",borderRadius:22,cursor:sorting?"not-allowed":"pointer",
          background:sorting?"rgba(255,255,255,0.03)":"rgba(74,222,128,0.18)",
          border:`1px solid ${sorting?"rgba(255,255,255,0.06)":"rgba(74,222,128,0.5)"}`,
          fontFamily:"'JetBrains Mono',monospace",fontSize:10,fontWeight:700,
          color:sorting?"#1e2a38":"#4ade80",opacity:sorting?0.5:1,
        }}>{sorting?"⏳ SORTING…":"▶ SORT"}</button>
        <button onClick={reset} disabled={sorting} style={{
          padding:"8px 16px",borderRadius:22,cursor:"pointer",
          background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",
          fontFamily:"'JetBrains Mono',monospace",fontSize:10,fontWeight:700,color:"#475569",
        }}>↺ RESET</button>
        {sorted && (
          <div style={{ padding:"8px 16px",borderRadius:22,background:"rgba(74,222,128,0.12)",border:"1px solid rgba(74,222,128,0.35)",fontFamily:"'JetBrains Mono',monospace",fontSize:10,fontWeight:700,color:"#4ade80",animation:"fadeIn 0.3s ease" }}>✓ SORTED</div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VISUAL: Divide — Step-through splitting
// ═══════════════════════════════════════════════════════════════════════════════
function VisDivide() {
  const [step, setStep] = useState(0);
  const arr = [38,27,43,3];
  const LEVELS = [
    { label:"Level 0 — Original", groups:[[38,27,43,3]], color:"#f472b6" },
    { label:"Level 1 — Split in half",groups:[[38,27],[43,3]], color:"#f472b6" },
    { label:"Level 2 — Split again",groups:[[38],[27],[43],[3]], color:"#f472b6" },
    { label:"Base case — Single elements are sorted!",groups:[[38],[27],[43],[3]], color:"#4ade80", done:true },
  ];
  const cur = LEVELS[step];
  return (
    <div>
      <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:8.5,color:"#2d3748",letterSpacing:"0.08em",marginBottom:10 }}>DIVIDE STEP — click NEXT to split</div>

      {/* Visual */}
      <div style={{ display:"flex",flexDirection:"column",gap:14,marginBottom:14 }}>
        {/* Tree connecting lines */}
        {step >= 1 && (
          <div style={{ display:"flex",justifyContent:"center",position:"relative",height:24 }}>
            <div style={{ position:"absolute",top:0,left:"50%",width:1,height:"100%",background:"rgba(244,114,182,0.4)" }}/>
            <div style={{ position:"absolute",top:"50%",left:"30%",right:"30%",height:1,background:"rgba(244,114,182,0.4)" }}/>
          </div>
        )}
        <div key={step} style={{ display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap",animation:"fadeIn 0.35s ease" }}>
          {cur.groups.map((group, gi) => (
            <div key={gi} style={{
              display:"flex",gap:4,padding:"8px 12px",borderRadius:12,
              background:cur.done?"rgba(74,222,128,0.1)":gi%2===0?"rgba(96,165,250,0.07)":"rgba(244,114,182,0.07)",
              border:`1px solid ${cur.done?"rgba(74,222,128,0.35)":gi%2===0?"rgba(96,165,250,0.25)":"rgba(244,114,182,0.25)"}`,
            }}>
              {group.map((v,vi) => (
                <div key={vi} style={{
                  width:36,height:36,borderRadius:9,
                  background:cur.done?"rgba(74,222,128,0.2)":"rgba(255,255,255,0.06)",
                  border:`1.5px solid ${cur.done?"rgba(74,222,128,0.6)":"rgba(255,255,255,0.15)"}`,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontFamily:"'JetBrains Mono',monospace",fontSize:13,fontWeight:700,
                  color:cur.done?"#4ade80":"#94a3b8",
                  boxShadow:cur.done?"0 0 10px rgba(74,222,128,0.3)":"none",
                  transition:"all 0.3s",
                }}>{v}</div>
              ))}
              {group.length===1 && cur.done && (
                <div style={{ display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#4ade80",marginLeft:2 }}>✓</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Label */}
      <div style={{ padding:"8px 14px",borderRadius:10,background:`${cur.done?"rgba(74,222,128,0.08)":"rgba(244,114,182,0.07)"}`,border:`1px solid ${cur.done?"rgba(74,222,128,0.25)":"rgba(244,114,182,0.2)"}`,marginBottom:10 }}>
        <div style={{ fontFamily:"'DM Sans',sans-serif",fontSize:13,color:cur.done?"#86efac":"#f9a8d4",fontWeight:600 }}>{cur.label}</div>
        <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#2d3748",marginTop:3 }}>
          {cur.done?"Every group has 1 element → trivially sorted → ready to merge!":step===0?"mid = floor((0+3)/2) = 1 → split at index 1":step===1?"Recursively divide each half":"Each subarray of length 1 is our base case"}
        </div>
      </div>

      {/* Controls */}
      <div style={{ display:"flex",gap:7,justifyContent:"center" }}>
        <button onClick={() => setStep(s=>Math.max(0,s-1))} disabled={step===0} style={{ padding:"6px 14px",borderRadius:20,cursor:step===0?"not-allowed":"pointer",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:700,color:step===0?"#1e2a38":"#475569",opacity:step===0?0.4:1 }}>← PREV</button>
        <div style={{ padding:"5px 14px",borderRadius:20,background:"rgba(244,114,182,0.1)",border:"1px solid rgba(244,114,182,0.25)",fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#f472b6",fontWeight:700 }}>{step+1} / {LEVELS.length}</div>
        <button onClick={() => setStep(s=>Math.min(LEVELS.length-1,s+1))} disabled={step===LEVELS.length-1} style={{ padding:"6px 14px",borderRadius:20,cursor:step===LEVELS.length-1?"not-allowed":"pointer",background:"rgba(244,114,182,0.12)",border:"1px solid rgba(244,114,182,0.3)",fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:700,color:step===LEVELS.length-1?"#1e2a38":"#f472b6",opacity:step===LEVELS.length-1?0.4:1 }}>NEXT →</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VISUAL: Merge — Pointer step-through
// ═══════════════════════════════════════════════════════════════════════════════
function VisMerge() {
  const LEFT  = [3,27,38];
  const RIGHT = [9,43,82];
  const [step, setStep] = useState(0);
  const [auto, setAuto] = useState(false);

  // Pre-compute all merge steps
  const computeSteps = () => {
    const steps = [];
    let L=[...LEFT],R=[...RIGHT],out=[],li=0,ri=0;
    steps.push({ li,ri,out:[],desc:"Two sorted subarrays. Two pointers at start." });
    while(li<L.length&&ri<R.length){
      const take=L[li]<=R[ri]?"L":"R";
      const val=take==="L"?L[li]:R[ri];
      const newOut=[...out,val];
      steps.push({ li:take==="L"?li+1:li,ri:take==="R"?ri+1:ri,out:newOut,pick:take,desc:`Compare ${L[li]} vs ${R[ri]} → pick ${val} from ${take}` });
      out=newOut;
      if(take==="L")li++;else ri++;
    }
    while(li<L.length){ out=[...out,L[li]]; steps.push({ li:li+1,ri,out:[...out],desc:`Copy remaining from Left: ${L[li]}`,pick:"L" }); li++; }
    while(ri<R.length){ out=[...out,R[ri]]; steps.push({ li,ri:ri+1,out:[...out],desc:`Copy remaining from Right: ${R[ri]}`,pick:"R" }); ri++; }
    steps.push({ li:L.length,ri:R.length,out:[3,9,27,38,43,82],desc:"✓ Merge complete — one sorted array!" });
    return steps;
  };
  const STEPS = computeSteps();
  const cur = STEPS[Math.min(step,STEPS.length-1)];
  const isDone = step >= STEPS.length-1;

  useEffect(() => {
    if (!auto) return;
    if (isDone) { setAuto(false); return; }
    const t = setTimeout(() => setStep(s=>s+1), 900);
    return () => clearTimeout(t);
  }, [auto, step, isDone]);

  return (
    <div>
      <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:8.5,color:"#2d3748",letterSpacing:"0.08em",marginBottom:12 }}>MERGE PROCEDURE — compare, pick smaller, advance pointer</div>

      {/* Two input arrays */}
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14 }}>
        {[{ label:"LEFT",arr:LEFT,pointer:cur.li,col:"#60a5fa" },{ label:"RIGHT",arr:RIGHT,pointer:cur.ri,col:"#f472b6" }].map(({ label,arr,pointer,col }) => (
          <div key={label} style={{ padding:"10px 12px",borderRadius:12,background:`${col}09`,border:`1px solid ${col}25` }}>
            <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:col,marginBottom:8,letterSpacing:"0.1em",fontWeight:700 }}>{label} ARRAY</div>
            <div style={{ display:"flex",gap:5,justifyContent:"center" }}>
              {arr.map((v,i) => {
                const isPast = (label==="LEFT"&&i<cur.li)||(label==="RIGHT"&&i<cur.ri);
                const isCur  = (label==="LEFT"&&i===cur.li)||(label==="RIGHT"&&i===cur.ri);
                return (
                  <div key={i} style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:3 }}>
                    <div style={{ width:36,height:36,borderRadius:9,background:isCur?`${col}25`:isPast?"rgba(255,255,255,0.02)":"rgba(255,255,255,0.05)",border:`1.5px solid ${isCur?col:isPast?"rgba(255,255,255,0.05)":"rgba(255,255,255,0.12)"}`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'JetBrains Mono',monospace",fontSize:13,fontWeight:700,color:isCur?col:isPast?"#2d3748":"#64748b",transition:"all 0.3s",boxShadow:isCur?`0 0 12px ${col}40`:"none",textDecoration:isPast?"line-through":"none" }}>{v}</div>
                    {isCur && <div style={{ width:4,height:4,borderRadius:"50%",background:col,animation:"topPulse 1.2s infinite" }}/>}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Output array */}
      <div style={{ padding:"10px 12px",borderRadius:12,background:"rgba(74,222,128,0.07)",border:"1px solid rgba(74,222,128,0.2)",marginBottom:10 }}>
        <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:"#4ade80",marginBottom:8,letterSpacing:"0.1em",fontWeight:700 }}>OUTPUT (MERGED)</div>
        <div style={{ display:"flex",gap:5,minHeight:42,alignItems:"center" }}>
          {cur.out.map((v,i) => (
            <div key={i} style={{ width:36,height:36,borderRadius:9,background:"rgba(74,222,128,0.18)",border:"1.5px solid rgba(74,222,128,0.5)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'JetBrains Mono',monospace",fontSize:13,fontWeight:700,color:"#4ade80",animation:i===cur.out.length-1?"plateIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both":"none" }}>{v}</div>
          ))}
          {cur.out.length===0&&<span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#1a2030" }}>empty</span>}
        </div>
      </div>

      {/* Step description */}
      <div style={{ padding:"8px 12px",borderRadius:10,background:isDone?"rgba(74,222,128,0.07)":"rgba(255,255,255,0.03)",border:`1px solid ${isDone?"rgba(74,222,128,0.25)":"rgba(255,255,255,0.07)"}`,marginBottom:10 }}>
        <div style={{ fontFamily:"'DM Sans',sans-serif",fontSize:12,color:isDone?"#86efac":"#94a3b8" }}>{cur.desc}</div>
      </div>

      {/* Controls */}
      <div style={{ display:"flex",gap:7,justifyContent:"center" }}>
        <button onClick={() => { setAuto(false);setStep(0); }} style={{ padding:"5px 11px",borderRadius:20,cursor:"pointer",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#475569" }}>↺</button>
        <button onClick={() => setStep(s=>Math.max(0,s-1))} disabled={step===0} style={{ padding:"5px 12px",borderRadius:20,cursor:"pointer",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#475569",opacity:step===0?0.4:1 }}>← BACK</button>
        <button onClick={() => setAuto(a=>!a)} style={{ padding:"5px 14px",borderRadius:20,cursor:"pointer",background:auto?"rgba(96,165,250,0.15)":"rgba(255,255,255,0.04)",border:`1px solid ${auto?"rgba(96,165,250,0.4)":"rgba(255,255,255,0.1)"}`,fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:700,color:auto?"#60a5fa":"#475569" }}>{auto?"⏸ PAUSE":"▶ AUTO"}</button>
        <button onClick={() => setStep(s=>Math.min(STEPS.length-1,s+1))} disabled={isDone} style={{ padding:"5px 12px",borderRadius:20,cursor:"pointer",background:"rgba(74,222,128,0.12)",border:"1px solid rgba(74,222,128,0.3)",fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:700,color:isDone?"#1e2a38":"#4ade80",opacity:isDone?0.4:1 }}>NEXT →</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VISUAL: Complexity
// ═══════════════════════════════════════════════════════════════════════════════
function VisComplexity() {
  const [hover, setHover] = useState(null);
  const data = [
    { n:1,  ms:1  },{ n:2,  ms:2  },{ n:4,  ms:8  },{ n:8,  ms:24 },
    { n:16, ms:64 },{ n:32, ms:160},{ n:64, ms:384 },
  ];
  const maxMs = Math.max(...data.map(d=>d.ms));
  const ALGOS = [
    { name:"Merge Sort",  color:"#4ade80",  tc:"O(n log n)", wc:"O(n log n)", sc:"O(n)",   note:"Guaranteed — no worst case" },
    { name:"Quick Sort",  color:"#f59e0b",  tc:"O(n log n)", wc:"O(n²)",     sc:"O(log n)",note:"Worst case on sorted input" },
    { name:"Bubble Sort", color:"#ef4444",  tc:"O(n²)",      wc:"O(n²)",     sc:"O(1)",    note:"Simple but very slow" },
    { name:"Binary Search Insert.",color:"#60a5fa",tc:"O(n log n)",wc:"O(n²)",sc:"O(1)",   note:"Good for nearly-sorted data" },
  ];

  return (
    <div>
      <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:8.5,color:"#2d3748",letterSpacing:"0.08em",marginBottom:10 }}>OPERATIONS vs INPUT SIZE — n log n beats n²</div>

      {/* Chart */}
      <div style={{ display:"flex",gap:3,alignItems:"flex-end",height:90,marginBottom:14,justifyContent:"center" }}>
        {data.map((d,i) => (
          <div key={i} style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:3 }}>
            <div style={{ width:36,borderRadius:"5px 5px 0 0",height:`${(d.ms/maxMs)*70}px`,background:`linear-gradient(180deg,#4ade80,#22c55e)`,border:"1px solid rgba(74,222,128,0.6)",boxShadow:"0 0 8px rgba(74,222,128,0.25)",transition:"height 0.4s" }}/>
            <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:7.5,color:"#2d3748" }}>{d.n}</span>
          </div>
        ))}
      </div>

      {/* Comparison table */}
      <div style={{ display:"flex",flexDirection:"column",gap:5,marginBottom:8 }}>
        {ALGOS.map((a,i) => (
          <div key={i} onMouseEnter={()=>setHover(i)} onMouseLeave={()=>setHover(null)} style={{
            padding:"9px 12px",borderRadius:10,cursor:"default",
            background:hover===i?`${a.color}10`:"rgba(255,255,255,0.02)",
            border:`1px solid ${hover===i?`${a.color}40`:"rgba(255,255,255,0.06)"}`,
            transition:"all 0.2s",
            display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",
          }}>
            <span style={{ width:7,height:7,borderRadius:"50%",background:a.color,flexShrink:0 }}/>
            <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:10,fontWeight:700,color:"#e2e8f0",minWidth:120 }}>{a.name}</span>
            <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
              <span style={{ padding:"2px 8px",borderRadius:20,background:`${a.color}14`,fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:a.color,fontWeight:700 }}>avg: {a.tc}</span>
              <span style={{ padding:"2px 8px",borderRadius:20,background:"rgba(255,255,255,0.04)",fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:a.wc===a.tc?"#475569":"#f87171" }}>worst: {a.wc}</span>
              <span style={{ padding:"2px 8px",borderRadius:20,background:"rgba(255,255,255,0.04)",fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#64748b" }}>space: {a.sc}</span>
            </div>
            {hover===i && <div style={{ flex:1,fontFamily:"'DM Sans',sans-serif",fontSize:11,color:"#64748b",animation:"fadeIn 0.2s ease" }}>{a.note}</div>}
          </div>
        ))}
      </div>

      <div style={{ padding:"7px 12px",borderRadius:9,background:"rgba(74,222,128,0.07)",border:"1px solid rgba(74,222,128,0.18)",fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#4ade80",textAlign:"center" }}>
        log(n) levels × n work per level = <strong>O(n log n)</strong> total
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VISUAL: Recursion Tree
// ═══════════════════════════════════════════════════════════════════════════════
function VisRecursion() {
  const [revealed, setRevealed] = useState(0);
  const TREE = [
    { level:0, nodes:[{ val:"[38,27,43,3]", col:"#60a5fa", phase:"divide" }] },
    { level:1, nodes:[{ val:"[38,27]",col:"#f472b6",phase:"divide" },{ val:"[43,3]",col:"#f472b6",phase:"divide" }] },
    { level:2, nodes:[{ val:"[38]",col:"#4ade80",phase:"base" },{ val:"[27]",col:"#4ade80",phase:"base" },{ val:"[43]",col:"#4ade80",phase:"base" },{ val:"[3]",col:"#4ade80",phase:"base" }] },
    { level:3, nodes:[{ val:"[27,38]",col:"#fb923c",phase:"merge" },{ val:"[3,43]",col:"#fb923c",phase:"merge" }] },
    { level:4, nodes:[{ val:"[3,27,38,43]",col:"#a78bfa",phase:"sorted" }] },
  ];
  const PHASE_LABELS = { divide:"DIVIDE ↓", base:"BASE CASE", merge:"MERGE ↑", sorted:"SORTED ✓" };
  const maxReveal = TREE.length;

  return (
    <div>
      <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:8.5,color:"#2d3748",letterSpacing:"0.08em",marginBottom:10 }}>RECURSION TREE — click REVEAL to unfold</div>

      <div style={{ display:"flex",flexDirection:"column",gap:14,marginBottom:14,minHeight:200 }}>
        {TREE.slice(0, revealed+1).map((row,ri) => (
          <div key={ri} style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:4,animation:"fUp 0.4s ease" }}>
            <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:7.5,color:"#1e3050",letterSpacing:"0.1em" }}>
              {row.nodes[0].phase==="divide"?"↓ DIVIDE":row.nodes[0].phase==="base"?"★ BASE CASE":row.nodes[0].phase==="merge"?"↑ MERGE":"✓ DONE"} · depth {ri}
            </div>
            <div style={{ display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap" }}>
              {row.nodes.map((n,ni) => (
                <div key={ni} style={{
                  padding:"6px 12px",borderRadius:10,
                  background:`${n.col}14`,border:`1.5px solid ${n.col}${n.phase==="base"?"99":"55"}`,
                  fontFamily:"'JetBrains Mono',monospace",fontSize:10,fontWeight:700,color:n.col,
                  boxShadow:n.phase==="sorted"?`0 0 16px ${n.col}40`:"none",
                  transition:"all 0.3s",
                  animation:`heroPush 0.4s cubic-bezier(0.34,1.56,0.64,1) ${ni*0.08}s both`,
                }}>
                  {n.val}
                  {n.phase==="base"&&<span style={{ marginLeft:5,fontSize:8,opacity:0.7 }}>✓</span>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display:"flex",gap:7,justifyContent:"center",marginBottom:8 }}>
        <button onClick={() => setRevealed(0)} style={{ padding:"5px 11px",borderRadius:20,cursor:"pointer",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#475569" }}>↺</button>
        <button onClick={() => setRevealed(r=>Math.min(maxReveal-1,r+1))} disabled={revealed>=maxReveal-1} style={{ padding:"5px 16px",borderRadius:20,cursor:revealed>=maxReveal-1?"not-allowed":"pointer",background:"rgba(167,139,250,0.15)",border:"1px solid rgba(167,139,250,0.35)",fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:700,color:revealed>=maxReveal-1?"#1e2a38":"#a78bfa",opacity:revealed>=maxReveal-1?0.4:1 }}>REVEAL NEXT →</button>
      </div>

      <div style={{ padding:"8px 12px",borderRadius:10,background:"rgba(167,139,250,0.07)",border:"1px solid rgba(167,139,250,0.18)",fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#a78bfa",textAlign:"center" }}>
        {revealed===0?"Start: call stack begins here":revealed===1?"Split into 2 subproblems":revealed===2?"Base case: 4 single elements, each trivially sorted":revealed===3?"Unwinding: merge pairs back together":revealed>=4?"Stack fully resolved! 4 elements → 3 levels → sorted ✓":""}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VISUAL: Stability
// ═══════════════════════════════════════════════════════════════════════════════
function VisStability() {
  const [sorted, setSorted] = useState(false);
  const ITEMS = [
    { name:"Alice",  grade:"B",  id:1, col:"#60a5fa" },
    { name:"Bob",    grade:"A",  id:2, col:"#f472b6" },
    { name:"Carol",  grade:"B",  id:3, col:"#4ade80" },
    { name:"David",  grade:"A",  id:4, col:"#fb923c" },
  ];
  // Stable sort by grade: A < B, preserve original order within same grade
  const stable = [...ITEMS].sort((a,b) => a.grade.localeCompare(b.grade));
  const display = sorted ? stable : ITEMS;

  return (
    <div>
      <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:8.5,color:"#2d3748",letterSpacing:"0.08em",marginBottom:10 }}>STABLE SORT — equal elements keep original order</div>

      <div style={{ display:"flex",gap:5,marginBottom:10,flexWrap:"wrap" }}>
        {display.map((item,i) => (
          <div key={item.id} style={{
            padding:"9px 14px",borderRadius:11,
            background:`${item.col}14`,border:`1.5px solid ${item.col}55`,
            display:"flex",flexDirection:"column",alignItems:"center",gap:3,
            animation:sorted?"plateIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both":"none",
            minWidth:64,
          }}>
            <div style={{ fontFamily:"'Syne',sans-serif",fontSize:20 }}>
              {item.name==="Alice"?"👩":item.name==="Bob"?"👨":item.name==="Carol"?"👩‍💼":"👨‍💼"}
            </div>
            <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:10,fontWeight:700,color:item.col }}>{item.name}</div>
            <div style={{ padding:"2px 8px",borderRadius:20,background:`${item.col}20`,border:`1px solid ${item.col}40`,fontFamily:"'JetBrains Mono',monospace",fontSize:10,fontWeight:700,color:item.col }}>Grade {item.grade}</div>
            <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:7.5,color:"#2d3748" }}>orig #{item.id}</div>
          </div>
        ))}
      </div>

      <button onClick={() => setSorted(s=>!s)} style={{
        width:"100%",padding:"9px",borderRadius:11,cursor:"pointer",marginBottom:10,
        background:sorted?"rgba(74,222,128,0.12)":"rgba(52,211,153,0.1)",
        border:`1px solid ${sorted?"rgba(74,222,128,0.4)":"rgba(52,211,153,0.3)"}`,
        fontFamily:"'JetBrains Mono',monospace",fontSize:10,fontWeight:700,
        color:sorted?"#4ade80":"#34d399",transition:"all 0.3s",
      }}>
        {sorted?"↺ UNSORT — reset":"🔀 SORT by Grade (stable)"}
      </button>

      {sorted && (
        <div style={{ display:"flex",flexDirection:"column",gap:5,animation:"fUp 0.3s ease" }}>
          <div style={{ padding:"8px 12px",borderRadius:9,background:"rgba(74,222,128,0.07)",border:"1px solid rgba(74,222,128,0.2)",fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"#86efac",lineHeight:1.58 }}>
            <strong>✓ Stable:</strong> Bob (A, #2) still comes before David (A, #4). Carol (B, #3) still comes before Alice (B, #1). Original name-order within each grade is preserved!
          </div>
          <div style={{ padding:"7px 12px",borderRadius:9,background:"rgba(251,191,36,0.07)",border:"1px solid rgba(251,191,36,0.2)",fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#fcd34d" }}>
            KEY: when merging equals, always pick from LEFT array first → preserves original order
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VISUAL: Variants
// ═══════════════════════════════════════════════════════════════════════════════
function VisVariants() {
  const [active, setActive] = useState(null);
  const VARIANTS = [
    { id:"bottomup", icon:"⬆", name:"Bottom-Up Iterative", col:"#f59e0b",
      desc:"No recursion! Start with runs of size 1. Merge to size 2, then 4, then 8. Uses O(1) stack space — great for systems with stack limits.",
      code:`# Bottom-up merge sort
def bottom_up_merge_sort(arr):
    n = len(arr)
    size = 1
    while size < n:
        for start in range(0, n, size*2):
            mid   = min(start + size - 1, n-1)
            end   = min(start + size*2 - 1, n-1)
            merge(arr, start, mid, end)
        size *= 2
    return arr` },
    { id:"external", icon:"💾", name:"External Merge Sort", col:"#60a5fa",
      desc:"For data too large for RAM. Sort chunks that fit in memory → write to disk → merge sorted files in one pass. Used in databases and big data systems.",
      code:`# External merge sort (conceptual)
1. Read chunk of data into RAM
2. Sort chunk in memory
3. Write sorted chunk to disk
4. Repeat until all data is in chunks
5. Merge all sorted files using
   k-way merge (priority queue)
6. Single linear pass → sorted output` },
    { id:"timsort", icon:"🐍", name:"Tim Sort (Python/Java)", col:"#4ade80",
      desc:"The world's most widely used sort. Detects naturally sorted 'runs' in real data. Uses insertion sort for small chunks (≤64 elements), merge sort for large. Python list.sort() and Java Arrays.sort() use this.",
      code:`# Tim Sort strategy
1. Detect natural runs (ascending/desc)
2. Reverse descending runs
3. Extend short runs via insertion sort
4. Merge runs using merge sort

# Python uses this automatically:
my_list.sort()       # Tim Sort!
sorted(my_list)      # Tim Sort!` },
    { id:"parallel", icon:"⚡", name:"Parallel Merge Sort", col:"#a78bfa",
      desc:"Merge Sort's independence of subproblems makes it perfect for parallelism. Each half can be sorted on a separate CPU core. The merge step can be parallelized with binary search splits.",
      code:`# Parallel merge sort (Python threads)
from concurrent.futures import ThreadPoolExecutor

def parallel_merge_sort(arr):
    if len(arr) <= 1024:
        return merge_sort(arr)  # fallback
    mid = len(arr) // 2
    with ThreadPoolExecutor(2) as ex:
        left  = ex.submit(parallel_merge_sort, arr[:mid])
        right = ex.submit(parallel_merge_sort, arr[mid:])
    return merge(left.result(), right.result())` },
  ];

  const sel = VARIANTS.find(v=>v.id===active);

  return (
    <div>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:12 }}>
        {VARIANTS.map(v => (
          <button key={v.id} onClick={() => setActive(active===v.id?null:v.id)} style={{
            padding:"9px 10px",borderRadius:11,cursor:"pointer",textAlign:"left",
            background:active===v.id?`${v.col}16`:"rgba(255,255,255,0.03)",
            border:`1.5px solid ${active===v.id?v.col:"rgba(255,255,255,0.07)"}`,
            transition:"all 0.2s",display:"flex",alignItems:"center",gap:7,
          }}>
            <span style={{ fontSize:18 }}>{v.icon}</span>
            <div>
              <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:10,fontWeight:700,color:active===v.id?v.col:"#64748b",lineHeight:1.3 }}>{v.name}</div>
            </div>
          </button>
        ))}
      </div>
      {sel ? (
        <div key={sel.id} style={{ padding:"14px 16px",borderRadius:14,background:`${sel.col}09`,border:`1px solid ${sel.col}25`,animation:"fUp 0.3s ease" }}>
          <p style={{ fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#94a3b8",marginBottom:10,lineHeight:1.6 }}>{sel.desc}</p>
          <div style={{ padding:"10px 14px",borderRadius:10,background:"rgba(0,0,0,0.4)",border:"1px solid rgba(255,255,255,0.06)" }}>
            <pre style={{ margin:0,fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#94a3b8",lineHeight:1.7,whiteSpace:"pre-wrap" }}>{sel.code}</pre>
          </div>
        </div>
      ) : (
        <div style={{ padding:14,borderRadius:14,background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.05)",textAlign:"center" }}>
          <p style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#1e2a38",letterSpacing:"0.08em" }}>SELECT A VARIANT ABOVE</p>
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
    { nm:"Best Case",     c:"#4ade80",tc:"O(n log n)",sc:"O(n)",  n:"Same as worst — always divides evenly" },
    { nm:"Average Case",  c:"#4ade80",tc:"O(n log n)",sc:"O(n)",  n:"No input distribution affects it" },
    { nm:"Worst Case",    c:"#4ade80",tc:"O(n log n)",sc:"O(n)",  n:"Guaranteed — unlike Quick Sort" },
    { nm:"Space",         c:"#60a5fa",tc:"—",          sc:"O(n)", n:"Needs temp array for merging" },
    { nm:"Stable",        c:"#f59e0b",tc:"Yes",         sc:"—",    n:"Equal elements keep original order" },
    { nm:"In-Place",      c:"#ef4444",tc:"No",          sc:"—",    n:"Cannot merge in-place in O(n log n)" },
  ];
  return (
    <div style={{ overflowX:"auto" }}>
      <table style={{ width:"100%",borderCollapse:"collapse",minWidth:400 }}>
        <thead>
          <tr>{["Property","Time","Space","Notes"].map(h => (
            <th key={h} style={{ padding:"10px 14px",textAlign:"left",fontFamily:"'JetBrains Mono',monospace",fontSize:9,letterSpacing:"0.1em",color:"#2d3748",borderBottom:"1px solid rgba(255,255,255,0.06)",fontWeight:700,whiteSpace:"nowrap" }}>{h}</th>
          ))}</tr>
        </thead>
        <tbody>
          {rows.map((r,i) => (
            <tr key={i} onMouseEnter={()=>setHov(i)} onMouseLeave={()=>setHov(null)}
              style={{ borderBottom:"1px solid rgba(255,255,255,0.04)",background:hov===i?"rgba(255,255,255,0.025)":"transparent",transition:"background 0.2s" }}>
              <td style={{ padding:"10px 14px" }}>
                <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                  <span style={{ width:7,height:7,borderRadius:"50%",background:r.c,flexShrink:0,boxShadow:hov===i?`0 0 8px ${r.c}`:"none",transition:"box-shadow 0.2s" }}/>
                  <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:11,fontWeight:700,color:"#e2e8f0" }}>{r.nm}</span>
                </div>
              </td>
              <td style={{ padding:"10px 14px",fontFamily:"'JetBrains Mono',monospace",fontSize:11,fontWeight:700,color:r.tc==="O(n log n)"?"#4ade80":r.tc==="Yes"?"#f59e0b":r.tc==="No"?"#ef4444":"#94a3b8",whiteSpace:"nowrap" }}>{r.tc}</td>
              <td style={{ padding:"10px 14px",fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:r.sc==="O(n)"?"#60a5fa":"#94a3b8",whiteSpace:"nowrap" }}>{r.sc}</td>
              <td style={{ padding:"10px 14px",fontFamily:"'DM Sans',sans-serif",fontSize:11,color:"#475569" }}>{r.n}</td>
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
  const pieces = Array.from({ length: 32 }, (_, i) => ({
    id:i, x:Math.random()*100, delay:Math.random()*0.8, dur:1.8+Math.random()*1.2,
    color:["#60a5fa","#f472b6","#4ade80","#fbbf24","#a78bfa","#fb923c"][i%6], size:6+Math.random()*6,
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
    { q:"What is the time complexity of Merge Sort in the WORST case?",opts:["O(n²)","O(n log n)","O(n)","O(log n)"],ans:1,exp:"O(n log n) — always. Unlike Quick Sort, Merge Sort guarantees this regardless of input order. This is its biggest advantage." },
    { q:"What is the base case in Merge Sort's recursion?",opts:["Array of length 0","Array of length 2","Array of length 1","Empty array"],ans:2,exp:"A single element is trivially sorted — nothing to do. This is the base case that stops the recursion." },
    { q:"Merge Sort requires O(n) extra space because:",opts:["It uses a hash map","It needs a temp array to merge two halves","It copies the input","It uses a call stack"],ans:1,exp:"Merging two sorted arrays requires a temporary output array of size n. This cannot be avoided with standard merge sort." },
    { q:"Which real-world sorting algorithm is based on Merge Sort?",opts:["Quick Select","Heap Sort","Tim Sort","Radix Sort"],ans:2,exp:"Tim Sort — used in Python list.sort() and Java Arrays.sort(). It combines merge sort with insertion sort and detects natural runs." },
    { q:"Merge Sort is 'stable'. This means:",opts:["It never crashes","Equal elements keep their original relative order","It sorts in O(1) space","It works on linked lists only"],ans:1,exp:"Stability means equal elements maintain their original ordering. Merge sort achieves this by always picking from the left array when elements are equal during merge." },
    { q:"The 'log n' in O(n log n) comes from:",opts:["The merge step","The comparison count","The number of recursion levels","The space needed"],ans:2,exp:"Each level of the recursion tree halves the problem size. log₂(n) tells us exactly how many levels deep we go before reaching single elements." },
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
          <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#2d3748" }}>PROGRESS</span>
          <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#60a5fa",fontWeight:700 }}>{answered}/{QS.length}</span>
        </div>
        <div style={{ height:4,background:"rgba(255,255,255,0.06)",borderRadius:99,overflow:"hidden" }}>
          <div style={{ height:"100%",width:`${(answered/QS.length)*100}%`,background:"linear-gradient(90deg,#3b82f6,#ec4899)",borderRadius:99,transition:"width 0.5s cubic-bezier(0.22,1,0.36,1)" }}/>
        </div>
      </div>
      <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
        {QS.map((q,qi) => {
          const isR=rev[qi];
          const bc=isR?(ans[qi]===q.ans?"rgba(74,222,128,0.35)":"rgba(239,68,68,0.35)"):"rgba(255,255,255,0.07)";
          return (
            <div key={qi} style={{ padding:"16px 18px",borderRadius:16,background:"rgba(255,255,255,0.02)",border:`1px solid ${bc}`,transition:"border-color 0.3s" }}>
              <div style={{ display:"flex",gap:10,marginBottom:12,alignItems:"flex-start" }}>
                <span style={{ width:24,height:24,borderRadius:8,flexShrink:0,marginTop:1,background:isR?(ans[qi]===q.ans?"rgba(74,222,128,0.2)":"rgba(239,68,68,0.2)"):"rgba(96,165,250,0.15)",border:`1px solid ${isR?(ans[qi]===q.ans?"rgba(74,222,128,0.42)":"rgba(239,68,68,0.42)"):"rgba(96,165,250,0.32)"}`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:700,color:isR?(ans[qi]===q.ans?"#4ade80":"#ef4444"):"#60a5fa" }}>{qi+1}</span>
                <div style={{ fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:600,color:"#e2e8f0",lineHeight:1.52 }}>{q.q}</div>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:7 }}>
                {q.opts.map((opt,oi) => {
                  const isSel=ans[qi]===oi, isCorr=q.ans===oi;
                  let bg="rgba(255,255,255,0.03)",brd="rgba(255,255,255,0.07)",col="#64748b";
                  if(isR){if(isCorr){bg="rgba(74,222,128,0.12)";brd="rgba(74,222,128,0.38)";col="#4ade80";}else if(isSel){bg="rgba(239,68,68,0.12)";brd="rgba(239,68,68,0.38)";col="#f87171";}else col="#2d3748";}
                  else if(isSel){bg="rgba(96,165,250,0.12)";brd="rgba(96,165,250,0.38)";col="#93c5fd";}
                  return (
                    <button key={oi} onClick={() => !isR&&setAns(a=>({...a,[qi]:oi}))} style={{ padding:"9px 12px",borderRadius:10,cursor:isR?"default":"pointer",background:bg,border:`1px solid ${brd}`,fontFamily:"'DM Sans',sans-serif",fontSize:13,color:col,textAlign:"left",transition:"all 0.22s",display:"flex",alignItems:"center",gap:8 }}>
                      <span style={{ width:19,height:19,borderRadius:"50%",flexShrink:0,background:isR?(isCorr?"rgba(74,222,128,0.26)":isSel?"rgba(239,68,68,0.26)":"rgba(255,255,255,0.04)"):(isSel?"rgba(96,165,250,0.26)":"rgba(255,255,255,0.04)"),border:`1px solid ${col}50`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:700,color:col }}>{isR&&isCorr?"✓":isR&&isSel&&!isCorr?"✗":String.fromCharCode(65+oi)}</span>
                      {opt}
                    </button>
                  );
                })}
              </div>
              {ans[qi]!==undefined&&!isR&&(
                <button onClick={() => setRev(r=>({...r,[qi]:true}))} style={{ marginTop:10,padding:"6px 18px",borderRadius:20,cursor:"pointer",background:"rgba(96,165,250,0.12)",border:"1px solid rgba(96,165,250,0.3)",fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:700,color:"#60a5fa" }}>CHECK →</button>
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
export default function MergeSortPage() {
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
    { id:"intro",      icon:"🌊",title:"What is Merge Sort?",              color:"#60a5fa",voice:NARR.intro,      visual:<VisIntro/>,      cards:[
        { lbl:"DIVIDE AND CONQUER",  body:"Split the problem in half. Solve each half. Combine results. Repeat until trivial. This is the most powerful algorithm design paradigm." },
        { lbl:"THE INSIGHT",         body:"A single element cannot be unsorted. So split until every subarray has one element — then merge everything back in order." },
        { lbl:"GUARANTEED O(n log n)",body:"Best case, average case, worst case — all O(n log n). No matter how chaotic the input, the number of steps is the same." },
        { lbl:"WHERE IT'S USED",      body:"Python list.sort(), Java Arrays.sort() (Tim Sort), database ORDER BY, external sorting, any situation requiring stable sort." },
      ]},
    { id:"divide",     icon:"✂️", title:"Step 1 — Divide",                  color:"#f472b6",voice:NARR.divide,     visual:<VisDivide/>,     cards:[
        { lbl:"FIND THE MIDPOINT",    body:"mid = floor((left + right) / 2). Always split at the middle. Left half: indices left..mid. Right half: mid+1..right." },
        { lbl:"RECURSIVE SPLITTING",  body:"Keep dividing each half. log₂(n) levels deep. With 8 elements → 3 levels. With 1024 elements → only 10 levels!" },
        { lbl:"BASE CASE",            body:"An array of 1 element is already sorted. When left >= right, stop recursing. This is guaranteed to terminate." },
        { lbl:"RECURSION DEPTH",      body:"log₂(8)=3, log₂(64)=6, log₂(1024)=10, log₂(1M)=20. The depth grows very slowly — this is the beauty of log." },
      ]},
    { id:"merge",      icon:"🔀",title:"Step 2 — Merge",                   color:"#4ade80",voice:NARR.merge,      visual:<VisMerge/>,      cards:[
        { lbl:"TWO POINTERS",         body:"Start a pointer at the beginning of each sorted half. Compare the two elements. Take the smaller one. Advance that pointer." },
        { lbl:"EXHAUST ONE SIDE",     body:"When one pointer reaches the end, copy everything remaining from the other side — it's already sorted, no comparisons needed." },
        { lbl:"O(n) PER MERGE",       body:"Each element is looked at exactly once. Total comparisons per merge = O(left.length + right.length). One clean pass." },
        { lbl:"PRODUCES SORTED OUTPUT",body:"The merged array is guaranteed sorted because both inputs were sorted and we always pick the smaller of the two heads." },
      ]},
    { id:"complexity", icon:"📊",title:"Time & Space Complexity",           color:"#fb923c",voice:NARR.complexity, visual:<VisComplexity/>, cards:[
        { lbl:"THE LOG N FACTOR",     body:"The recursion tree has log₂(n) levels. Each level does O(n) total work across all merges. Multiply: O(n) × O(log n) = O(n log n)." },
        { lbl:"WHY NOT O(n²)",        body:"We never compare an element against every other element. Each element is merged at most log n times — once per level." },
        { lbl:"O(n) SPACE COST",      body:"The temporary merge array is unavoidable. Some in-place merge algorithms exist but have worse constant factors." },
        { lbl:"VS QUICK SORT",        body:"Quick Sort is faster in practice (cache-friendly, in-place) but its worst case is O(n²). Merge Sort wins on guaranteed performance." },
      ]},
    { id:"recursion",  icon:"🌳",title:"Recursion Tree Walkthrough",        color:"#a78bfa",voice:NARR.recursion,  visual:<VisRecursion/>,  cards:[
        { lbl:"PUSH PHASE (DOWN)",    body:"Each recursive call pushes a new stack frame. Going down: problem shrinks. More calls, smaller arrays, until base case." },
        { lbl:"POP PHASE (UP)",       body:"Returning from base case, each return pops a frame. Going up: sorted results merge. Smaller sorted arrays become larger ones." },
        { lbl:"TOTAL CALLS",          body:"For n elements: 2n-1 total recursive calls. n leaf calls (base cases) + n-1 internal merge calls. Linear in n." },
        { lbl:"TRACE fact(4) PATTERN",body:"Looks identical to how factorial recursion unwinds. Deep call, then return chain. LIFO — a stack at its core." },
      ]},
    { id:"stability",  icon:"⚖️", title:"Stability — Why It Matters",        color:"#34d399",voice:NARR.stability,  visual:<VisStability/>,  cards:[
        { lbl:"STABLE = ORDER PRESERVED", body:"When two elements are equal, the one that appeared first in the original array stays first in the output. Always." },
        { lbl:"HOW MERGE ACHIEVES IT",    body:"In the merge step: if left[i] == right[j], always pick left[i] first. This one rule preserves original order." },
        { lbl:"REAL WORLD EXAMPLE",       body:"Sort employees by salary. A stable sort preserves their original name order within each salary level. Invaluable for multi-key sorting." },
        { lbl:"QUICK SORT IS NOT STABLE", body:"Quick sort's partition step can swap equal elements. Merge sort never does. Use merge sort when stability matters." },
      ]},
    { id:"variants",   icon:"🚀",title:"Variants & Real-World Uses",         color:"#f59e0b",voice:NARR.variants,   visual:<VisVariants/>,   cards:[
        { lbl:"BOTTOM-UP MERGE SORT", body:"Iterative version. No recursion stack at all. Merge size-1 runs → size-2 → size-4 → ... O(1) stack space." },
        { lbl:"EXTERNAL MERGE SORT",  body:"When data doesn't fit in RAM. Sort chunks → write to disk → merge files. Powers every database ORDER BY on large tables." },
        { lbl:"TIM SORT",             body:"Python list.sort() and Java Arrays.sort(). Detects natural sorted runs. Insertion sort for tiny arrays. Merge sort for large. The world's most deployed sort." },
        { lbl:"PARALLEL MERGE SORT",  body:"Each half is independent — perfect for multi-core. Theoretical O(n) time with O(n) processors. Used in distributed systems." },
      ]},
  ];

  return (
    <div style={{ background:"#030612",color:"#f8fafc",minHeight:"100vh",overflowX:"hidden" }}>
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
        @keyframes heroPush{0%{opacity:0;transform:translateY(-50px) scaleY(0.7) scaleX(0.85)}60%{opacity:1;transform:translateY(4px) scaleY(1.04) scaleX(0.97)}100%{transform:translateY(0) scaleY(1) scaleX(1);opacity:1}}
        @keyframes opLabelIn{from{opacity:0;transform:scale(0.85) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}
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
      <div style={{ textAlign:"center",marginBottom:32,fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#1e2a38",letterSpacing:"0.1em" }}>
        PRESS <kbd style={{ background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:5,padding:"1px 7px",color:"#2d3748" }}>S</kbd> TO STOP VOICE · <kbd style={{ background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:5,padding:"1px 7px",color:"#2d3748" }}>↑↓</kbd> TO NAVIGATE
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
            <div style={{ width:50,height:50,borderRadius:16,flexShrink:0,background:"rgba(251,146,60,0.12)",border:"1px solid rgba(251,146,60,0.32)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,boxShadow:"0 0 28px rgba(251,146,60,0.15)" }}>⚡</div>
            <div>
              <h2 style={{ fontFamily:"'Syne',sans-serif",fontSize:"clamp(19px,3.8vw,30px)",fontWeight:800,color:"#f8fafc" }}>Quick Reference Cheat Sheet</h2>
              <p style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#2d3748",marginTop:3,letterSpacing:"0.08em" }}>ALL CASES · HOVER ROWS FOR DETAILS</p>
            </div>
          </div>
          <div style={{ borderRadius:22,overflow:"hidden",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)" }}>
            <ComplexityTable/>
          </div>
        </section>

        {/* Python Code Reference */}
        <section style={{ marginBottom:80 }}>
          <div style={{ display:"flex",alignItems:"center",gap:14,marginBottom:22 }}>
            <div style={{ width:50,height:50,borderRadius:16,flexShrink:0,background:"rgba(96,165,250,0.12)",border:"1px solid rgba(96,165,250,0.32)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24 }}>🐍</div>
            <div>
              <h2 style={{ fontFamily:"'Syne',sans-serif",fontSize:"clamp(19px,3.8vw,30px)",fontWeight:800,color:"#f8fafc" }}>Clean Python Implementation</h2>
              <p style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#2d3748",marginTop:3,letterSpacing:"0.08em" }}>CLASSIC · READABLE · WITH COMMENTS</p>
            </div>
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }} className="sg">
            {[
              { label:"CLASSIC RECURSIVE", col:"#60a5fa", code:`def merge_sort(arr):
    # Base case: 0 or 1 element
    if len(arr) <= 1:
        return arr
    
    # Divide
    mid = len(arr) // 2
    left  = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    
    # Conquer
    return merge(left, right)

def merge(left, right):
    result = []
    i = j = 0
    
    # Pick smaller of the two heads
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:  # <= keeps stability
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    
    # Copy remainder
    result.extend(left[i:])
    result.extend(right[j:])
    return result` },
              { label:"IN-PLACE (NO EXTRA LIST)", col:"#4ade80", code:`def merge_sort_inplace(arr, left=0, right=None):
    if right is None:
        right = len(arr) - 1
    
    if left >= right:
        return  # Base case
    
    mid = (left + right) // 2
    
    # Sort both halves
    merge_sort_inplace(arr, left, mid)
    merge_sort_inplace(arr, mid + 1, right)
    
    # Merge in temp array, write back
    merge_inplace(arr, left, mid, right)

def merge_inplace(arr, left, mid, right):
    L = arr[left:mid+1]
    R = arr[mid+1:right+1]
    i = j = 0
    k = left
    while i < len(L) and j < len(R):
        if L[i] <= R[j]:
            arr[k] = L[i]; i += 1
        else:
            arr[k] = R[j]; j += 1
        k += 1
    while i < len(L):
        arr[k] = L[i]; i += 1; k += 1
    while j < len(R):
        arr[k] = R[j]; j += 1; k += 1` },
            ].map(({ label, col, code }) => (
              <div key={label} style={{ borderRadius:18,overflow:"hidden",border:`1px solid ${col}20` }}>
                <div style={{ padding:"10px 16px",background:`${col}12`,borderBottom:`1px solid ${col}18`,fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:700,color:col,letterSpacing:"0.1em" }}>{label}</div>
                <div style={{ padding:"16px",background:"rgba(0,0,0,0.45)" }}>
                  <pre style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"#94a3b8",lineHeight:1.8,whiteSpace:"pre-wrap",margin:0 }}>{code}</pre>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop:12,padding:"10px 16px",borderRadius:12,background:"rgba(96,165,250,0.06)",border:"1px solid rgba(96,165,250,0.15)",fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#60a5fa" }}>
            💡 Tip: In Python, <span style={{ color:"#93c5fd" }}>sorted()</span> and <span style={{ color:"#93c5fd" }}>list.sort()</span> both use Tim Sort — a Merge Sort variant. You're already using merge sort every day!
          </div>
        </section>

        {/* Quiz */}
        <section id="quiz" style={{ marginBottom:80 }}>
          <div style={{ display:"flex",alignItems:"center",gap:14,marginBottom:8,flexWrap:"wrap" }}>
            <div style={{ width:50,height:50,borderRadius:16,flexShrink:0,background:"rgba(236,72,153,0.12)",border:"1px solid rgba(236,72,153,0.32)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,boxShadow:"0 0 28px rgba(236,72,153,0.15)" }}>🧠</div>
            <div style={{ flex:1,minWidth:0 }}>
              <h2 style={{ fontFamily:"'Syne',sans-serif",fontSize:"clamp(19px,3.8vw,30px)",fontWeight:800,color:"#f8fafc" }}>Test Your Knowledge</h2>
              <p style={{ fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#475569",marginTop:3 }}>6 questions · covers every section · some require real understanding</p>
            </div>
            <button onClick={() => handleVoice("quiz",NARR.quiz)} style={{
              display:"flex",alignItems:"center",gap:7,
              padding:"7px 14px",borderRadius:28,cursor:"pointer",flexShrink:0,
              background:speaking==="quiz"?"rgba(236,72,153,0.2)":"rgba(255,255,255,0.04)",
              border:`1.5px solid ${speaking==="quiz"?"#ec4899":"rgba(255,255,255,0.1)"}`,
              fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:700,
              color:speaking==="quiz"?"#ec4899":"#475569",transition:"all 0.22s",
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
              background:`linear-gradient(138deg,${qScore>=5?"rgba(74,222,128,0.1)":qScore>=3?"rgba(251,191,36,0.1)":"rgba(239,68,68,0.1)"} 0%,rgba(0,0,0,0) 100%)`,
              border:`1px solid ${qScore>=5?"rgba(74,222,128,0.32)":qScore>=3?"rgba(251,191,36,0.32)":"rgba(239,68,68,0.32)"}`,
              animation:"fUp 0.5s ease",
            }}>
              <div style={{ fontSize:52,marginBottom:12 }}>{qScore>=5?"🏆":qScore>=3?"🌟":"💪"}</div>
              <div style={{ fontFamily:"'Syne',sans-serif",fontSize:40,fontWeight:800,color:qScore>=5?"#4ade80":qScore>=3?"#fbbf24":"#f87171" }}>{qScore} / {qTotal}</div>
              <p style={{ fontFamily:"'DM Sans',sans-serif",fontSize:15,color:"#94a3b8",margin:"10px 0 24px",lineHeight:1.55 }}>
                {qScore>=5?"Outstanding! Merge Sort is now part of your permanent toolkit.":qScore>=3?"Solid progress. Re-read the sections you missed and retry.":"Great start — revisit the animations and come back stronger."}
              </p>
              <div style={{ display:"inline-block",padding:"12px 28px",borderRadius:16,background:"linear-gradient(135deg,#3b82f6,#ec4899)",fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:700,color:"#fff" }}>
                🎉 Complete — Explore Quick Sort Next
              </div>
            </div>
          )}
        </section>

        {/* Footer CTA */}
        <div style={{
          textAlign:"center",padding:"48px 24px",borderRadius:26,
          background:"linear-gradient(140deg,rgba(96,165,250,0.09) 0%,rgba(244,114,182,0.07) 50%,rgba(74,222,128,0.06) 100%)",
          border:"1px solid rgba(96,165,250,0.18)",position:"relative",overflow:"hidden",
        }}>
          <div style={{ position:"absolute",inset:0,backgroundImage:"radial-gradient(circle,rgba(96,165,250,0.04) 1px,transparent 1px)",backgroundSize:"30px 30px",pointerEvents:"none" }}/>
          <div style={{ fontSize:48,marginBottom:14 }}>🌊</div>
          <h3 style={{ fontFamily:"'Syne',sans-serif",fontSize:"clamp(17px,3.2vw,26px)",fontWeight:800,color:"#f8fafc",marginBottom:12 }}>You've mastered Merge Sort!</h3>
          <p style={{ fontFamily:"'DM Sans',sans-serif",fontSize:14,color:"#64748b",maxWidth:480,margin:"0 auto 28px",lineHeight:1.72 }}>
            Now implement it from scratch — no peeking. Once you can write the merge function in under 10 minutes, it belongs to you permanently.
          </p>
          <div style={{ display:"flex",gap:6,justifyContent:"center",flexWrap:"wrap",marginBottom:16 }}>
            {NAV_SECTIONS.map(s => (
              <div key={s.id} style={{
                padding:"4px 12px",borderRadius:20,
                background:seenSections.has(s.id)?`${s.col}18`:"rgba(255,255,255,0.03)",
                border:`1px solid ${seenSections.has(s.id)?`${s.col}38`:"rgba(255,255,255,0.06)"}`,
                fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:700,
                color:seenSections.has(s.id)?s.col:"#1a2030",transition:"all 0.3s",
              }}>{s.icon} {s.label} {seenSections.has(s.id)?"✓":""}</div>
            ))}
          </div>
          <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#2d3748",marginBottom:22 }}>{seenSections.size} / {NAV_SECTIONS.length} sections visited</div>
          <button onClick={() => { if(typeof window!=="undefined") window.location.href="/mergesort-implementation"; }} style={{
            padding:"12px 28px",borderRadius:14,cursor:"pointer",
            background:"rgba(244,114,182,0.15)",border:"1.5px solid rgba(244,114,182,0.4)",
            fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700,color:"#f472b6",
            transition:"all 0.25s",
          }}
            onMouseEnter={e=>{ e.currentTarget.style.background="rgba(244,114,182,0.25)"; }}
            onMouseLeave={e=>{ e.currentTarget.style.background="rgba(244,114,182,0.15)"; }}>
            💻 View Code Implementation →
          </button>
        </div>
      </main>
    </div>
  );
}