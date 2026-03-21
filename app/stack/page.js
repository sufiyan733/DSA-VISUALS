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
  intro: `A stack is one of the most elegant data structures in computer science. It follows a single rule: Last In, First Out — LIFO. Think of a stack of plates. You always place on top, always take from the top. This simple constraint makes stacks incredibly powerful. Every Ctrl-Z, every browser back button, every function call — a stack is doing the work invisibly.`,
  ops: `A stack has exactly four operations. Push adds to the top in O(1). Pop removes from the top in O(1). Peek looks at the top without removing in O(1). isEmpty checks if empty in O(1). Every single operation is constant time — no matter how many elements are inside. This is the superpower of stacks.`,
  impl: `Stacks can be built two ways. The array implementation uses a top pointer — simple and cache-friendly but fixed capacity. The linked list uses nodes where head equals top — unlimited capacity but needs pointer memory. Python gives you a free stack with list.append and pop. Both give identical Big-O performance.`,
  callstack: `The call stack is how every language manages functions. When a function is called, its state is pushed as a stack frame. When it returns, the frame is popped. Recursion pushes frames until the base case, then pops them all back. A stack overflow literally means the call stack ran out of memory.`,
  apps: `Stacks power countless real systems. Undo-redo in every editor. Browser history. Balanced bracket checking. Expression evaluation using two stacks. Depth-First Search. Backtracking algorithms like Sudoku solvers. Even your code's indentation rules are checked by a parser using a stack.`,
  monotonic: `A monotonic stack maintains elements in strictly increasing or decreasing order. When pushing, first pop all elements that violate the order. This gives you Next Greater Element for every item in O(n) instead of O(n squared). Histogram rectangles, rainwater trapping, stock span — all collapse to linear time.`,
  minstack: `The min stack problem: design a stack with push, pop, peek, and getMinimum all in O(1). The trick is two parallel stacks. The main stack operates normally. A secondary min-tracking stack only pushes when the new value is less than or equal to the current minimum. getMinimum just peeks the min stack top.`,
  quiz: `You have reached the quiz. You studied LIFO, all four operations, both implementations, the call stack, five applications, monotonic stacks, and the min stack pattern. Some questions are subtle. Getting a wrong answer is the fastest way to lock the correct understanding into memory. Take your time.`,
};

const NAV_SECTIONS = [
  { id:"intro",     icon:"📚", label:"Intro",     col:"#60a5fa" },
  { id:"ops",       icon:"⚡", label:"Operations",col:"#4ade80" },
  { id:"impl",      icon:"🔧", label:"Implement", col:"#f472b6" },
  { id:"callstack", icon:"🧵", label:"Call Stack",col:"#fb923c" },
  { id:"apps",      icon:"🌍", label:"Apps",      col:"#a78bfa" },
  { id:"monotonic", icon:"📈", label:"Monotonic", col:"#34d399" },
  { id:"minstack",  icon:"🔑", label:"Min Stack", col:"#f59e0b" },
  { id:"quiz",      icon:"🧠", label:"Quiz",      col:"#ec4899" },
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
// SPEED PANEL
// ═══════════════════════════════════════════════════════════════════════════════
function SpeedPanel({ speed, setSpeed, speaking, onRestart }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position:"relative" }}>
      <button onClick={() => setOpen(o => !o)} style={{
        display:"flex",alignItems:"center",gap:5,padding:"5px 11px",borderRadius:20,cursor:"pointer",
        background:open?"rgba(96,165,250,0.2)":"rgba(255,255,255,0.05)",
        border:`1.5px solid ${open?"#60a5fa":"rgba(255,255,255,0.1)"}`,
        fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:700,
        color:open?"#93c5fd":"#64748b",transition:"all 0.2s",
      }}>⚡ {speed}×</button>
      {open && (
        <div style={{
          position:"absolute",top:"calc(100% + 8px)",right:0,
          background:"rgba(5,8,20,0.97)",backdropFilter:"blur(28px)",
          border:"1px solid rgba(255,255,255,0.1)",borderRadius:14,
          padding:"8px 6px",display:"flex",flexDirection:"column",gap:3,
          zIndex:1000,minWidth:100,boxShadow:"0 16px 48px rgba(0,0,0,0.8)",
          animation:"panelPop 0.18s cubic-bezier(0.22,1,0.36,1) both",
        }}>
          <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:"#2d3748",letterSpacing:"0.1em",padding:"2px 8px 6px",borderBottom:"1px solid rgba(255,255,255,0.06)" }}>SPEED</div>
          {SPEED_OPTIONS.map(s => (
            <button key={s} onClick={() => { currentRate=s; setSpeed(s); setOpen(false); if(speaking) onRestart(); }} style={{
              padding:"6px 12px",borderRadius:8,cursor:"pointer",textAlign:"left",
              background:speed===s?"rgba(96,165,250,0.2)":"transparent",
              border:`1px solid ${speed===s?"rgba(96,165,250,0.45)":"transparent"}`,
              fontFamily:"'JetBrains Mono',monospace",fontSize:10,fontWeight:700,
              color:speed===s?"#93c5fd":"#475569",transition:"all 0.15s",
            }}>{s===1.25?`${s}× ★`:`${s}×`}</button>
          ))}
        </div>
      )}
    </div>
  );
}
function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) setMatches(media.matches);
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);
  return matches;
}

// ═══════════════════════════════════════════════════════════════════════════════
// STICKY NAV
// ═══════════════════════════════════════════════════════════════════════════════
function RightSidebar({ active, speaking, speed, setSpeed, onRestart, seenCount, open, setOpen }) {
  const [show, setShow] = useState(false);
  const [speedOpen, setSpeedOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 600px)');

  useEffect(() => {
    const h = () => setShow(window.scrollY > 500);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  const goToArray = () => { window.location.href = "/stack-array"; };
  const goToLL = () => { window.location.href = "/stack-ll"; };

  if (!open) {
    const btnSize = isMobile ? 36 : 40;      // reduced from 48 to 36
    const btnRight = isMobile ? 12 : 16;
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          position: "fixed",
          right: btnRight,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 950,
          width: btnSize,
          height: btnSize,
          borderRadius: btnSize / 2,
          background: "rgba(96,165,250,0.2)",
          border: "1px solid rgba(96,165,250,0.4)",
          backdropFilter: "blur(12px)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: isMobile ? 18 : 20,
          color: "#60a5fa",
          transition: "all 0.2s",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        }}
      >
        ◀
      </button>
    );
  }

  // Desktop values (unchanged)
  const desktopBtnSize = 36;
  const desktopGap = 4;
  const desktopPadding = "8px 6px";
  const desktopFontIcon = 16;
  const desktopFontText = 8;
  const desktopCodePadding = "4px 8px";
  const desktopProgressPillPadding = "3px 6px";
  const desktopProgressBarWidth = 24;
  const desktopSpeakingPadding = "3px 6px";

  // Mobile values – reduced width by ~50% from previous large version
  const mobileBtnSize = 32;                 // was 42 → now 32
  const mobileGap = 3;                     // was 4
  const mobilePadding = "8px 6px";         // was 12px 8px
  const mobileFontIcon = 18;               // was 21 → 18
  const mobileFontText = 9;                // was 11 → 9
  const mobileCodePadding = "4px 8px";     // was 8px 12px → matches desktop
  const mobileProgressPillPadding = "4px 8px";
  const mobileProgressBarWidth = 24;
  const mobileSpeakingPadding = "4px 8px";

  const isMobileView = isMobile;
  const btnSize = isMobileView ? mobileBtnSize : desktopBtnSize;
  const gap = isMobileView ? mobileGap : desktopGap;
  const padding = isMobileView ? mobilePadding : desktopPadding;
  const fontSizeIcon = isMobileView ? mobileFontIcon : desktopFontIcon;
  const fontSizeText = isMobileView ? mobileFontText : desktopFontText;
  const codePadding = isMobileView ? mobileCodePadding : desktopCodePadding;
  const progressPillPadding = isMobileView ? mobileProgressPillPadding : desktopProgressPillPadding;
  const progressBarWidth = isMobileView ? mobileProgressBarWidth : desktopProgressBarWidth;
  const speakingPadding = isMobileView ? mobileSpeakingPadding : desktopSpeakingPadding;

  return (
    <nav
      style={{
        position: "fixed",
        right: isMobileView ? 12 : 16,
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 900,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap,
        padding,
        background: "rgba(3,6,18,0.94)",
        backdropFilter: "blur(28px) saturate(180%)",
        borderRadius: isMobileView ? 24 : 24,
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "0 12px 48px rgba(0,0,0,0.7)",
        opacity: show ? 1 : 0,
        pointerEvents: show ? "auto" : "none",
        transition: "opacity 0.3s ease",
        width: "auto",
        maxHeight: isMobileView ? "85vh" : "auto",
        overflowY: isMobileView ? "auto" : "visible",
        scrollbarWidth: "thin",
      }}
    >
      {/* Close button */}
      <button
        onClick={() => setOpen(false)}
        style={{
          width: btnSize,
          height: btnSize,
          borderRadius: 10,
          border: "none",
          background: "rgba(255,255,255,0.05)",
          cursor: "pointer",
          fontSize: isMobileView ? 14 : 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#94a3b8",
          marginBottom: 2,
        }}
      >
        ✕
      </button>

      {/* Section icons */}
      {NAV_SECTIONS.map((s) => (
        <button
          key={s.id}
          onClick={() => document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth" })}
          title={s.label}
          style={{
            width: btnSize,
            height: btnSize,
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            background: active === s.id ? `${s.col}22` : "transparent",
            outline: active === s.id ? `1.5px solid ${s.col}55` : "1.5px solid transparent",
            fontSize: fontSizeIcon,
            transition: "all 0.2s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            flexShrink: 0,
          }}
        >
          {s.icon}
        </button>
      ))}

      {/* Progress pill */}
      <div
        style={{
          padding: progressPillPadding,
          borderRadius: 16,
          background: "rgba(96,165,250,0.08)",
          border: "1px solid rgba(96,165,250,0.2)",
          display: "flex",
          alignItems: "center",
          gap: 4,
          width: "auto",
        }}
      >
        <div
          style={{
            width: progressBarWidth,
            height: isMobileView ? 3 : 4,
            borderRadius: 99,
            background: "rgba(255,255,255,0.06)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${(seenCount / NAV_SECTIONS.length) * 100}%`,
              background: "#60a5fa",
              borderRadius: 99,
              transition: "width 0.5s ease",
            }}
          />
        </div>
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: isMobileView ? 8 : 7,
            color: "#60a5fa",
            fontWeight: 700,
          }}
        >
          {seenCount}/{NAV_SECTIONS.length}
        </span>
      </div>

      {/* Code buttons – shortened labels on mobile */}
      <button
        onClick={goToArray}
        style={{
          padding: codePadding,
          borderRadius: 16,
          cursor: "pointer",
          background: "rgba(74,222,128,0.12)",
          border: "1px solid rgba(74,222,128,0.35)",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: fontSizeText,
          fontWeight: 700,
          color: "#4ade80",
          transition: "all 0.2s",
          whiteSpace: "nowrap",
        }}
      >
        📦 {isMobileView ? "Array" : "Array Impl."}
      </button>
      <button
        onClick={goToLL}
        style={{
          padding: codePadding,
          borderRadius: 16,
          cursor: "pointer",
          background: "rgba(96,165,250,0.12)",
          border: "1px solid rgba(96,165,250,0.35)",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: fontSizeText,
          fontWeight: 700,
          color: "#60a5fa",
          transition: "all 0.2s",
          whiteSpace: "nowrap",
        }}
      >
        🔗 {isMobileView ? "Linked" : "Linked Impl."}
      </button>

      {/* Speed Panel */}
      <div style={{ position: "relative" }}>
        <button
          onClick={() => setSpeedOpen((o) => !o)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 3,
            padding: codePadding,
            borderRadius: 16,
            cursor: "pointer",
            background: speedOpen ? "rgba(96,165,250,0.2)" : "rgba(255,255,255,0.05)",
            border: `1.5px solid ${speedOpen ? "#60a5fa" : "rgba(255,255,255,0.1)"}`,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: fontSizeText,
            fontWeight: 700,
            color: speedOpen ? "#93c5fd" : "#64748b",
            transition: "all 0.2s",
          }}
        >
          ⚡ {speed}×
        </button>
        {speedOpen && (
          <div
            style={{
              position: "absolute",
              top: 0,
              right: "calc(100% + 8px)",
              background: "rgba(5,8,20,0.97)",
              backdropFilter: "blur(28px)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 12,
              padding: "4px 4px",
              display: "flex",
              flexDirection: "column",
              gap: 2,
              zIndex: 1000,
              minWidth: 80,
              boxShadow: "0 16px 48px rgba(0,0,0,0.8)",
              animation: "panelPop 0.18s cubic-bezier(0.22,1,0.36,1) both",
            }}
          >
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 6,
                color: "#2d3748",
                letterSpacing: "0.1em",
                padding: "1px 5px 3px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              SPEED
            </div>
            {SPEED_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => {
                  currentRate = s;
                  setSpeed(s);
                  setSpeedOpen(false);
                  if (speaking) onRestart();
                }}
                style={{
                  padding: "3px 8px",
                  borderRadius: 5,
                  cursor: "pointer",
                  textAlign: "left",
                  background: speed === s ? "rgba(96,165,250,0.2)" : "transparent",
                  border: `1px solid ${speed === s ? "rgba(96,165,250,0.45)" : "transparent"}`,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 8,
                  fontWeight: 700,
                  color: speed === s ? "#93c5fd" : "#475569",
                  transition: "all 0.15s",
                }}
              >
                {s === 1.25 ? `${s}× ★` : `${s}×`}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Speaking indicator */}
      {speaking && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 3,
            padding: speakingPadding,
            borderRadius: 12,
            background: "rgba(96,165,250,0.12)",
            border: "1px solid rgba(96,165,250,0.3)",
          }}
        >
          <SpeakingWave color="#60a5fa" size={isMobileView ? 10 : 9} />
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
function MiniPlayer({ speaking, speakingLabel, onStop, speed }) {
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
        <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#60a5fa",marginTop:2 }}>{speed}× · male voice</div>
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
// HERO — FIXED animation (no stale closures, fixed-height container)
// ═══════════════════════════════════════════════════════════════════════════════
const HERO_COLORS = ["#60a5fa","#f472b6","#4ade80","#fb923c","#a78bfa","#f59e0b","#34d399","#e879f9"];
const HERO_VALS   = ["10","25","37","99","42","7","88","15","63","21"];

function Hero({ onStart, onVoice }) {
  const [stack, setStack]       = useState([
    { id:1, v:"10", c:"#60a5fa" },
    { id:2, v:"25", c:"#f472b6" },
    { id:3, v:"37", c:"#4ade80" },
  ]);
  const [pushingId, setPushingId]   = useState(null);  // id of the newly pushed item
  const [poppingId, setPoppingId]   = useState(null);  // id of the item being popped
  const [opLabel,   setOpLabel]     = useState(null);  // { text, col }
  const [paused,    setPaused]      = useState(false);

  const stackRef   = useRef(stack);
  const counterRef = useRef(4);
  const vidxRef    = useRef(3);
  const pauseRef   = useRef(false);

  // Keep refs in sync
  useEffect(() => { stackRef.current = stack; }, [stack]);
  useEffect(() => { pauseRef.current = paused; }, [paused]);

  useEffect(() => {
    const tick = () => {
      if (pauseRef.current) return;
      const cur = stackRef.current;

      if (cur.length >= 6) {
        // POP the top
        const top = cur[cur.length - 1];
        setPoppingId(top.id);
        setOpLabel({ text:`POP → ${top.v}`, col:"#f472b6" });
        setTimeout(() => {
          setStack(s => s.filter(x => x.id !== top.id));
          setPoppingId(null);
          setTimeout(() => setOpLabel(null), 600);
        }, 480);
      } else {
        // PUSH a new item
        const vi  = vidxRef.current % HERO_VALS.length;
        const ci  = (counterRef.current) % HERO_COLORS.length;
        const item = { id: counterRef.current++, v: HERO_VALS[vi], c: HERO_COLORS[ci] };
        vidxRef.current++;
        setStack(s => [...s, item]);
        setPushingId(item.id);
        setOpLabel({ text:`PUSH ${item.v}`, col:"#4ade80" });
        setTimeout(() => {
          setPushingId(null);
          setTimeout(() => setOpLabel(null), 600);
        }, 500);
      }
    };

    const id = setInterval(tick, 2000);
    return () => clearInterval(id);
  }, []); // safe — uses only refs

  const MAX_SHOW = 6;
  const visible  = stack.slice(-MAX_SHOW);

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

      {/* Fixed-height stack wrapper */}
      <div style={{ marginBottom:36, position:"relative", width:240, height:380 }}>
        {/* Operation label area */}
        <div style={{
          position:"absolute", top:0, left:0, right:0, height:32,
          display:"flex", alignItems:"center", justifyContent:"center",
        }}>
          {opLabel && (
            <span key={opLabel.text} style={{
              padding:"4px 16px", borderRadius:20,
              background:`${opLabel.col}18`, border:`1px solid ${opLabel.col}50`,
              fontFamily:"'JetBrains Mono',monospace", fontSize:11, fontWeight:700,
              color:opLabel.col,
              animation:"opLabelIn 0.3s cubic-bezier(0.22,1,0.36,1) both",
            }}>{opLabel.text}</span>
          )}
        </div>

        {/* Stack items container */}
        <div style={{
          position:"absolute", top:32, bottom:44, left:0, right:0,
          display:"flex", flexDirection:"column-reverse",
          justifyContent:"flex-start", alignItems:"center", gap:5,
          overflow:"hidden",
        }}>
          {visible.map((pl, i) => {
            const isTop     = i === visible.length - 1;
            const isPushing = pl.id === pushingId;
            const isPopping = pl.id === poppingId;
            const w = Math.max(150, 210 - (visible.length - 1 - i) * 10);

            return (
              <div key={pl.id} style={{
                width: w, height: 46, borderRadius: 13,
                background: `linear-gradient(135deg,${pl.c}22,${pl.c}0e)`,
                border: `1.5px solid ${isTop ? pl.c : `${pl.c}50`}`,
                display:"flex", alignItems:"center", justifyContent:"space-between",
                padding:"0 16px",
                boxShadow: isTop ? `0 0 28px ${pl.c}45,0 4px 16px rgba(0,0,0,0.5)` : `0 3px 10px rgba(0,0,0,0.35)`,
                position:"relative", overflow:"hidden",
                animation: isPushing
                  ? "heroPush 0.52s cubic-bezier(0.34,1.56,0.64,1) both"
                  : isPopping
                  ? "heroPop 0.46s cubic-bezier(0.55,0,1,0.45) forwards"
                  : "none",
                transition:"width 0.35s ease,box-shadow 0.3s ease",
              }}>
                <div style={{ position:"absolute", inset:0, background:"linear-gradient(135deg,rgba(255,255,255,0.12) 0%,transparent 55%)", borderRadius:"inherit", pointerEvents:"none" }}/>
                <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:15, fontWeight:700, color:pl.c, position:"relative" }}>{pl.v}</span>
                {isTop && (
                  <div style={{ display:"flex", alignItems:"center", gap:5, position:"relative" }}>
                    <div style={{ width:6, height:6, borderRadius:"50%", background:pl.c, animation:"topPulse 1.5s ease-in-out infinite", boxShadow:`0 0 8px ${pl.c}` }}/>
                    <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:8, color:`${pl.c}cc`, letterSpacing:"0.06em" }}>TOP</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Base platform */}
        <div style={{
          position:"absolute", bottom:30, left:0, right:0, height:10,
          borderRadius:8,
          background:"linear-gradient(90deg,rgba(96,165,250,0.25),rgba(96,165,250,0.12),rgba(96,165,250,0.25))",
          boxShadow:"0 0 20px rgba(96,165,250,0.25),0 4px 12px rgba(0,0,0,0.4)",
          overflow:"hidden",
        }}>
          <div style={{
            position:"absolute", top:0, left:"-100%", width:"50%", height:"100%",
            background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)",
            animation:"platShine 3s ease-in-out infinite",
          }}/>
        </div>

        {/* Size counter */}
        <div style={{
          position:"absolute", bottom:0, left:0, right:0,
          display:"flex", justifyContent:"space-between", padding:"0 4px",
          fontFamily:"'JetBrains Mono',monospace", fontSize:8, color:"#334155",
        }}>
          <span style={{ color:"#1e3050" }}>▲ BASE</span>
          <span>size: {visible.length}</span>
        </div>

        {/* LIFO badge */}
        <div style={{
          position:"absolute", right:-72, top:"50%", transform:"translateY(-50%)",
          background:"rgba(96,165,250,0.1)", border:"1px solid rgba(96,165,250,0.25)",
          borderRadius:8, padding:"4px 10px",
          fontFamily:"'JetBrains Mono',monospace", fontSize:9, fontWeight:700, color:"#60a5fa",
          letterSpacing:"0.06em", whiteSpace:"nowrap",
          animation:"lifoFloat 4s ease-in-out infinite",
        }}>LIFO</div>

        {/* Pause button */}
        <button onClick={() => setPaused(p => !p)} style={{
          position:"absolute", bottom:-32, right:0,
          padding:"3px 10px", borderRadius:20, cursor:"pointer",
          background:paused?"rgba(251,191,36,0.15)":"rgba(255,255,255,0.04)",
          border:`1px solid ${paused?"rgba(251,191,36,0.4)":"rgba(255,255,255,0.1)"}`,
          fontFamily:"'JetBrains Mono',monospace", fontSize:8, fontWeight:700,
          color:paused?"#fbbf24":"#334155", transition:"all 0.2s",
        }}>{paused?"▶ RESUME":"⏸ PAUSE"}</button>
      </div>

      {/* Text */}
      <div style={{ maxWidth:620,position:"relative" }}>
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
        }}>Stack Data<br/>Structures</h1>

        <p style={{ margin:"0 auto 32px",fontFamily:"'DM Sans',sans-serif",fontSize:"clamp(14px,2.2vw,18px)",color:"#64748b",lineHeight:1.68,maxWidth:500 }}>
          Every stack concept — animated, explained, narrated with a <strong style={{ color:"#93c5fd" }}>natural male voice</strong>. LIFO to monotonic stacks.
        </p>

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

        {/* Speed selector */}
        <div style={{ display:"flex",gap:6,justifyContent:"center",alignItems:"center",marginTop:20,flexWrap:"wrap" }}>
          <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#2d3748",letterSpacing:"0.08em" }}>VOICE SPEED:</span>
          {SPEED_OPTIONS.map(s => (
            <button key={s} onClick={() => { currentRate=s; }} style={{
              padding:"4px 11px",borderRadius:20,cursor:"pointer",
              background:currentRate===s?"rgba(96,165,250,0.18)":"rgba(255,255,255,0.04)",
              border:`1px solid ${currentRate===s?"rgba(96,165,250,0.5)":"rgba(255,255,255,0.08)"}`,
              fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:700,
              color:currentRate===s?"#93c5fd":"#2d3748",transition:"all 0.18s",
            }}>{s}×</button>
          ))}
        </div>

        {/* Stats row */}
        <div style={{ display:"flex",gap:28,justifyContent:"center",marginTop:44,flexWrap:"wrap" }}>
          {[["8","Sections"],["6+","Animations"],["6","Quiz Qs"],["O(1)","All Ops"]].map(([n,l]) => (
            <div key={l} style={{ textAlign:"center" }}>
              <div style={{ fontFamily:"'Syne',sans-serif",fontSize:28,fontWeight:800,background:"linear-gradient(135deg,#93c5fd,#f9a8d4)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text" }}>{n}</div>
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
// VISUAL: Intro — Interactive LIFO Demo with live code snippet
// ═══════════════════════════════════════════════════════════════════════════════
function VisIntro() {
  const PALETTE = ["#60a5fa","#f472b6","#4ade80","#fb923c","#a78bfa","#f59e0b","#34d399"];
  const [stack,    setStack]    = useState([{ id:1,v:10,c:"#60a5fa" },{ id:2,v:20,c:"#f472b6" },{ id:3,v:30,c:"#4ade80" }]);
  const [log,      setLog]      = useState([]);
  const [codeSnip, setCodeSnip] = useState('const s = new Stack();\n// Push some values...');
  const [pushing,  setPushing]  = useState(false);
  const [popping,  setPopping]  = useState(false);
  const [popAnim,  setPopAnim]  = useState(null);
  const counter = useRef(4);
  const vals    = [40,50,60,70,80,90];
  const vIdx    = useRef(0);

  const addLog = (msg, code) => {
    setLog(l => [{ msg, ts: Date.now() }, ...l].slice(0, 5));
    if (code) setCodeSnip(code);
  };

  const doPush = () => {
    if (stack.length >= 6 || pushing) return;
    const v = vals[vIdx.current % vals.length]; vIdx.current++;
    const item = { id:counter.current++, v, c:PALETTE[stack.length % PALETTE.length] };
    setPushing(true);
    setTimeout(() => {
      setStack(s => [...s, item]);
      addLog(`PUSH(${v}) → top is now ${v}`, `s.push(${v});  // top = ${v}`);
      setPushing(false);
    }, 320);
  };

  const doPop = () => {
    if (stack.length === 0 || popping) return;
    const top = stack[stack.length - 1];
    setPopping(true);
    setPopAnim(top);
    setTimeout(() => {
      setStack(s => s.slice(0,-1));
      addLog(`POP() → returned ${top.v}`, `s.pop();  // returned ${top.v}`);
      setPopping(false); setPopAnim(null);
    }, 420);
  };

  const doPeek = () => {
    if (stack.length === 0) return;
    const t = stack[stack.length-1];
    addLog(`PEEK() → ${t.v} (unchanged)`, `s.peek();  // ${t.v} (stack unchanged)`);
  };

  const doClear = () => {
    setStack([]); setPopAnim(null);
    addLog("CLEAR → stack is empty", "while (!s.isEmpty()) s.pop();");
  };

  return (
    <div>
      <div style={{ display:"flex",gap:16,alignItems:"flex-end",justifyContent:"center",marginBottom:14,minHeight:260,position:"relative" }}>
        {/* Stack column */}
        <div style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:4,position:"relative",minWidth:150 }}>
          {/* Flying pop animation */}
          {popAnim && (
            <div key={`pop-${popAnim.id}`} style={{
              position:"absolute",top:-56,left:"50%",transform:"translateX(-50%)",
              width:136,height:40,borderRadius:10,
              background:`${popAnim.c}22`,border:`2px solid ${popAnim.c}`,
              display:"flex",alignItems:"center",justifyContent:"center",gap:8,
              fontFamily:"'JetBrains Mono',monospace",fontSize:14,fontWeight:700,color:popAnim.c,
              animation:"introPopFly 0.42s cubic-bezier(0.22,1,0.36,1) forwards",
              boxShadow:`0 0 24px ${popAnim.c}50`,zIndex:10,
            }}>
              {popAnim.v} <span style={{ fontSize:9,opacity:0.8 }}>↑ POP</span>
            </div>
          )}

          {/* Stack items — column-reverse */}
          <div style={{ display:"flex",flexDirection:"column-reverse",gap:4,alignItems:"center" }}>
            {stack.map((item,i) => {
              const isTop = i === stack.length-1;
              return (
                <div key={item.id} style={{
                  width:136,height:40,borderRadius:10,
                  background:`${item.c}18`,
                  border:`1.5px solid ${item.c}${isTop?"cc":"55"}`,
                  display:"flex",alignItems:"center",justifyContent:"space-between",
                  padding:"0 14px",
                  boxShadow:isTop?`0 0 20px ${item.c}40`:"none",
                  transition:"all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
                  animation:"introPush 0.4s cubic-bezier(0.34,1.56,0.64,1) both",
                }}>
                  <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:14,fontWeight:700,color:item.c }}>{item.v}</span>
                  <div style={{ display:"flex",flexDirection:"column",alignItems:"flex-end",gap:1 }}>
                    {isTop && <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:7.5,color:`${item.c}99`,letterSpacing:"0.06em" }}>TOP</span>}
                    <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:7,color:"rgba(255,255,255,0.2)" }}>[{i}]</span>
                  </div>
                </div>
              );
            })}
          </div>

          {stack.length === 0 && (
            <div style={{ width:136,height:44,borderRadius:10,border:"1px dashed rgba(255,255,255,0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#1e2a38" }}>EMPTY</div>
          )}

          <div style={{ width:154,height:7,borderRadius:4,background:"linear-gradient(90deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))",border:"1px solid rgba(255,255,255,0.1)",marginTop:4 }}/>
          <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:"#2d3748",marginTop:3 }}>size: {stack.length}</span>
        </div>

        {/* Live log + code snippet */}
        <div style={{ flex:1,display:"flex",flexDirection:"column",gap:8 }}>
          <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:"#2d3748",letterSpacing:"0.1em" }}>OPERATION LOG</div>
          <div style={{ minHeight:100 }}>
            {log.length === 0
              ? <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#1a2030",padding:"6px 0" }}>Click buttons below…</div>
              : log.map((l,i) => (
                <div key={l.ts} style={{
                  fontFamily:"'JetBrains Mono',monospace",fontSize:10,
                  color:i===0?"#60a5fa":"#2d3748",
                  padding:"3px 0",borderBottom:"1px solid rgba(255,255,255,0.04)",
                  animation:i===0?"fadeIn 0.28s ease":"none",
                }}>{i===0?"▶ ":"  "}{l.msg}</div>
              ))
            }
          </div>
          {/* Live code */}
          <div style={{ padding:"8px 10px",borderRadius:9,background:"rgba(0,0,0,0.4)",border:"1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:7.5,color:"#1e3050",letterSpacing:"0.1em",marginBottom:4 }}>LIVE CODE</div>
            <pre style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#7dd3fc",margin:0,lineHeight:1.65,whiteSpace:"pre-wrap",animation:"fadeIn 0.25s ease" }}
              key={codeSnip}>{codeSnip}</pre>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display:"flex",gap:7,justifyContent:"center",flexWrap:"wrap" }}>
        {[
          ["⬇ PUSH", doPush, "#4ade80", stack.length >= 6],
          ["⬆ POP",  doPop,  "#f472b6", stack.length === 0],
          ["👁 PEEK", doPeek, "#fbbf24", stack.length === 0],
          ["✕ CLEAR",doClear,"#fb923c", stack.length === 0],
        ].map(([label,fn,col,disabled]) => (
          <button key={label} onClick={fn} disabled={disabled} style={{
            padding:"8px 18px",borderRadius:22,cursor:disabled?"not-allowed":"pointer",
            background:disabled?"rgba(255,255,255,0.03)":`${col}18`,
            border:`1px solid ${disabled?"rgba(255,255,255,0.06)":`${col}55`}`,
            fontFamily:"'JetBrains Mono',monospace",fontSize:10,fontWeight:700,
            color:disabled?"#1e2a38":col,transition:"all 0.2s",opacity:disabled?0.4:1,
          }}>{label}</button>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VISUAL: Operations — O(1) animated ticker
// ═══════════════════════════════════════════════════════════════════════════════
function VisOps() {
  const [active,  setActive]  = useState(null);
  const [animKey, setAnimKey] = useState(0);
  const OPS = [
    { name:"PUSH", icon:"⬇", color:"#4ade80", time:"O(1)", desc:"Adds element to top. Increment top pointer.", code:"stack.append(val)  # Python\nstack.push(val);   // Java", steps:["New element arrives","Place on top","Increment pointer","Done in O(1)"] },
    { name:"POP",  icon:"⬆", color:"#f472b6", time:"O(1)", desc:"Removes & returns top element. Decrement top pointer.", code:"stack.pop()       # Python\nstack.pop();      // Java", steps:["Check not empty","Save top value","Decrement pointer","Return saved value"] },
    { name:"PEEK", icon:"👁", color:"#60a5fa", time:"O(1)", desc:"Returns top element without removing it.", code:"stack[-1]         # Python\nstack.peek();     // Java", steps:["Check not empty","Read top index","Return element","Stack unchanged"] },
    { name:"isEmpty", icon:"∅", color:"#fb923c", time:"O(1)", desc:"Returns true if stack is empty.", code:"len(stack)==0     # Python\nstack.isEmpty();  // Java", steps:["Read size/pointer","Compare to zero","Return boolean","Pure O(1) check"] },
  ];
  const sel = OPS.find(o => o.name === active);
  return (
    <div>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14 }}>
        {OPS.map(op => (
          <button key={op.name} onClick={() => { setActive(active===op.name?null:op.name); setAnimKey(k=>k+1); }} style={{
            padding:"10px 12px",borderRadius:12,cursor:"pointer",textAlign:"left",
            background:active===op.name?`${op.color}18`:"rgba(255,255,255,0.03)",
            border:`1.5px solid ${active===op.name?op.color:"rgba(255,255,255,0.07)"}`,
            transition:"all 0.25s",display:"flex",alignItems:"center",gap:8,
          }}>
            <span style={{ fontSize:20 }}>{op.icon}</span>
            <div>
              <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:11,fontWeight:700,color:active===op.name?op.color:"#94a3b8" }}>{op.name}</div>
              <div style={{ display:"inline-block",marginTop:3,padding:"1px 8px",borderRadius:20,background:`${op.color}15`,border:`1px solid ${op.color}30`,fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:700,color:op.color }}>{op.time}</div>
            </div>
          </button>
        ))}
      </div>
      {sel ? (
        <div key={animKey} style={{ padding:"14px 16px",borderRadius:14,background:`${sel.color}09`,border:`1px solid ${sel.color}25`,animation:"fUp 0.3s ease both" }}>
          <p style={{ fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#94a3b8",marginBottom:10,lineHeight:1.6 }}>{sel.desc}</p>
          <div style={{ display:"flex",gap:5,marginBottom:10,flexWrap:"wrap" }}>
            {sel.steps.map((s,i) => (
              <div key={i} style={{ padding:"4px 10px",borderRadius:20,background:`${sel.color}12`,border:`1px solid ${sel.color}25`,fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:sel.color,animation:`sRight 0.35s ease ${i*0.08}s both` }}>
                <span style={{ opacity:0.5,marginRight:5 }}>{i+1}.</span>{s}
              </div>
            ))}
          </div>
          <div style={{ padding:"10px 14px",borderRadius:10,background:"rgba(0,0,0,0.4)",border:"1px solid rgba(255,255,255,0.06)" }}>
            <pre style={{ margin:0,fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"#94a3b8",lineHeight:1.7,whiteSpace:"pre-wrap" }}>{sel.code}</pre>
          </div>
        </div>
      ) : (
        <div style={{ padding:14,borderRadius:14,background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.05)",textAlign:"center" }}>
          <p style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#1e2a38",letterSpacing:"0.08em" }}>SELECT AN OPERATION ABOVE</p>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VISUAL: Implementation
// ═══════════════════════════════════════════════════════════════════════════════
function VisImpl() {
  const [mode, setMode] = useState("array");
  const [showMem, setShowMem] = useState(false);
  const stack = [10,20,30,40];
  const BASE_ADDR = 0x1000;

  return (
    <div>
      <div style={{ display:"flex",gap:7,justifyContent:"center",marginBottom:14,flexWrap:"wrap" }}>
        {[["array","[ ] Array"],["linked","↔ Linked"]].map(([m,lbl]) => (
          <button key={m} onClick={() => setMode(m)} style={{
            padding:"6px 14px",borderRadius:20,cursor:"pointer",
            background:mode===m?"rgba(244,114,182,0.2)":"rgba(255,255,255,0.04)",
            border:`1px solid ${mode===m?"#f472b6":"rgba(255,255,255,0.1)"}`,
            fontFamily:"'JetBrains Mono',monospace",fontSize:10,fontWeight:700,
            color:mode===m?"#f472b6":"#475569",transition:"all 0.22s",
          }}>{lbl}</button>
        ))}
        <button onClick={() => setShowMem(s => !s)} style={{
          padding:"6px 12px",borderRadius:20,cursor:"pointer",
          background:showMem?"rgba(96,165,250,0.15)":"rgba(255,255,255,0.04)",
          border:`1px solid ${showMem?"#60a5fa":"rgba(255,255,255,0.1)"}`,
          fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:700,
          color:showMem?"#60a5fa":"#475569",transition:"all 0.2s",
        }}>🧠 {showMem?"Hide":"Show"} Memory</button>
      </div>

      {mode === "array" ? (
        <div>
          <div style={{ display:"flex",alignItems:"stretch",justifyContent:"center",gap:0,marginBottom:showMem?8:20,position:"relative" }}>
            {stack.map((v,i) => (
              <div key={i} style={{
                width:52,height:52,
                borderRadius:i===0?"10px 0 0 10px":i===stack.length-1?"0 10px 10px 0":0,
                background:i===stack.length-1?"rgba(244,114,182,0.22)":"rgba(255,255,255,0.04)",
                border:`1px solid ${i===stack.length-1?"#f472b6":"rgba(255,255,255,0.1)"}`,
                display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
                borderLeft:i>0?"none":undefined,position:"relative",transition:"all 0.3s",
                boxShadow:i===stack.length-1?"0 0 16px rgba(244,114,182,0.3)":"none",
              }}>
                <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:13,fontWeight:700,color:i===stack.length-1?"#f472b6":"#94a3b8" }}>{v}</span>
                <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:"#2d3748" }}>[{i}]</span>
                {i===stack.length-1 && <div style={{ position:"absolute",bottom:-20,fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:"#f472b6",fontWeight:700,whiteSpace:"nowrap" }}>↑ top={i}</div>}
              </div>
            ))}
            {[0,1,2].map(i => (
              <div key={`e${i}`} style={{ width:52,height:52,borderRadius:i===2?"0 10px 10px 0":0,background:"rgba(255,255,255,0.015)",border:"1px dashed rgba(255,255,255,0.06)",borderLeft:"none",display:"flex",alignItems:"center",justifyContent:"center" }}>
                <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#1a2030" }}>—</span>
              </div>
            ))}
          </div>
          {showMem && (
            <div style={{ marginTop:24,marginBottom:12,padding:"8px 10px",borderRadius:10,background:"rgba(96,165,250,0.06)",border:"1px solid rgba(96,165,250,0.15)" }}>
              <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:"#2d3748",marginBottom:5,letterSpacing:"0.1em" }}>MEMORY ADDRESSES</div>
              <div style={{ display:"flex",gap:4,flexWrap:"wrap" }}>
                {stack.map((v,i) => (
                  <div key={i} style={{ padding:"3px 8px",borderRadius:7,background:"rgba(96,165,250,0.1)",border:"1px solid rgba(96,165,250,0.2)",fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#60a5fa" }}>
                    0x{(BASE_ADDR + i*4).toString(16).toUpperCase()} → {v}
                  </div>
                ))}
              </div>
            </div>
          )}
          <div style={{ display:"flex",flexDirection:"column",gap:5,marginTop:showMem?8:24 }}>
            {[["✓ Cache-friendly (contiguous memory)","#4ade80"],["✓ O(1) random access","#4ade80"],["✗ Fixed capacity — must resize","#f87171"],["✗ Wasted space if sparse","#f87171"]].map(([t,c]) => (
              <div key={t} style={{ fontFamily:"'DM Sans',sans-serif",fontSize:12,color:c,padding:"2px 0",display:"flex",gap:6 }}>{t}</div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:0,marginBottom:12,flexWrap:"wrap" }}>
            <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#f472b6",marginRight:8,fontWeight:700 }}>HEAD</div>
            {[...stack].reverse().map((v,i) => (
              <div key={i} style={{ display:"flex",alignItems:"center" }}>
                <div style={{ borderRadius:10,overflow:"hidden",display:"flex",border:`1.5px solid ${i===0?"#f472b6":"rgba(255,255,255,0.1)"}`,boxShadow:i===0?"0 0 16px rgba(244,114,182,0.3)":"none" }}>
                  <div style={{ width:44,height:44,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:i===0?"rgba(244,114,182,0.2)":"rgba(255,255,255,0.04)",gap:1 }}>
                    <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:13,fontWeight:700,color:i===0?"#f472b6":"#94a3b8" }}>{v}</span>
                    {showMem && <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:7,color:"#1e3050" }}>0x{(BASE_ADDR+i*16).toString(16).toUpperCase()}</span>}
                  </div>
                  <div style={{ width:30,height:44,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(255,255,255,0.03)",borderLeft:"1px solid rgba(255,255,255,0.07)",fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:i===stack.length-1?"#2d3748":"#60a5fa" }}>{i===stack.length-1?"∅":"→"}</div>
                </div>
                {i<stack.length-1 && <div style={{ width:8,height:2,background:"rgba(96,165,250,0.3)" }}/>}
              </div>
            ))}
          </div>
          <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#2d3748",textAlign:"center",marginBottom:10 }}>head = top · null = bottom</div>
          <div style={{ display:"flex",flexDirection:"column",gap:5 }}>
            {[["✓ Dynamic size — unlimited","#4ade80"],["✓ No wasted memory","#4ade80"],["✗ Extra pointer per node","#f87171"],["✗ Not cache-friendly","#f87171"]].map(([t,c]) => (
              <div key={t} style={{ fontFamily:"'DM Sans',sans-serif",fontSize:12,color:c,padding:"2px 0" }}>{t}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VISUAL: Call Stack
// ═══════════════════════════════════════════════════════════════════════════════
function VisCallStack() {
  const [auto, setAuto]             = useState(true);
  const [frameCount, setFrameCount] = useState(0);
  const FRAMES = [
    { fn:"main()",   line:"calls fact(4)", col:"#60a5fa", ret:null },
    { fn:"fact(4)",  line:"calls fact(3)", col:"#f472b6", ret:"= 4 × fact(3)" },
    { fn:"fact(3)",  line:"calls fact(2)", col:"#4ade80", ret:"= 3 × fact(2)" },
    { fn:"fact(2)",  line:"calls fact(1)", col:"#fb923c", ret:"= 2 × fact(1)" },
    { fn:"fact(1)",  line:"BASE → return 1",col:"#a78bfa",ret:"= 1" },
  ];
  useEffect(() => {
    if (!auto) return;
    const t = setInterval(() => {
      setFrameCount(fc => {
        if (fc < FRAMES.length) return fc+1;
        if (fc < FRAMES.length*2) return fc+1;
        return 0;
      });
    }, 900);
    return () => clearInterval(t);
  }, [auto]);
  const isPopping = frameCount > FRAMES.length;
  const visCount  = isPopping ? FRAMES.length-(frameCount-FRAMES.length) : Math.min(frameCount,FRAMES.length);
  const visible   = FRAMES.slice(0, visCount);
  return (
    <div>
      <div style={{ display:"flex",gap:7,justifyContent:"center",marginBottom:10 }}>
        <button onClick={() => setAuto(a=>!a)} style={{ padding:"5px 14px",borderRadius:20,cursor:"pointer",background:auto?"rgba(96,165,250,0.15)":"rgba(255,255,255,0.04)",border:`1px solid ${auto?"#60a5fa":"rgba(255,255,255,0.1)"}`,fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:700,color:auto?"#60a5fa":"#475569" }}>{auto?"⏸ AUTO":"▶ AUTO"}</button>
        {!auto && <>
          <button onClick={() => setFrameCount(fc=>Math.min(fc+1,FRAMES.length*2))} style={{ padding:"5px 12px",borderRadius:20,cursor:"pointer",background:"rgba(74,222,128,0.12)",border:"1px solid rgba(74,222,128,0.3)",fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:700,color:"#4ade80" }}>NEXT →</button>
          <button onClick={() => setFrameCount(0)} style={{ padding:"5px 10px",borderRadius:20,cursor:"pointer",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#475569" }}>↺</button>
        </>}
      </div>
      <div style={{ textAlign:"center",fontFamily:"'JetBrains Mono',monospace",fontSize:8.5,color:"#2d3748",marginBottom:7 }}>
        {isPopping?"↑ RETURNING — popping frames":frameCount===0?"Press AUTO or NEXT":"↓ CALLING — pushing frames"}
      </div>
      <div style={{ display:"flex",flexDirection:"column-reverse",gap:4,minHeight:230,justifyContent:"flex-start" }}>
        {visible.map((fr,i) => {
          const isTop = i===visible.length-1;
          return (
            <div key={i} style={{
              padding:"8px 14px",borderRadius:10,
              background:isTop?`${fr.col}20`:"rgba(255,255,255,0.03)",
              border:`1px solid ${isTop?fr.col:`${fr.col}30`}`,
              display:"flex",justifyContent:"space-between",alignItems:"center",
              boxShadow:isTop?`0 0 20px ${fr.col}30`:"none",
              transition:"all 0.4s",
              animation:isTop&&!isPopping?"frameIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both":isTop&&isPopping?"frameOut 0.4s ease forwards":"none",
            }}>
              <div>
                <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:11,fontWeight:700,color:isTop?fr.col:"#475569" }}>{fr.fn}</div>
                <div style={{ fontFamily:"'DM Sans',sans-serif",fontSize:11,color:"#2d3748",marginTop:2 }}>{isTop&&isPopping&&fr.ret?fr.ret:fr.line}</div>
              </div>
              {isTop && <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:fr.col,border:`1px solid ${fr.col}40`,padding:"2px 7px",borderRadius:20 }}>TOP</span>}
            </div>
          );
        })}
        {visible.length===0 && <div style={{ padding:20,textAlign:"center",fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#1a2030",border:"1px dashed rgba(255,255,255,0.06)",borderRadius:10 }}>call stack is empty</div>}
      </div>
      <div style={{ marginTop:10,padding:"8px 12px",borderRadius:10,background:"rgba(96,165,250,0.07)",border:"1px solid rgba(96,165,250,0.15)",fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#60a5fa",textAlign:"center" }}>
        fact(4) = 4 × 3 × 2 × 1 = <strong>24</strong>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VISUAL: Apps — Bracket Checker
// ═══════════════════════════════════════════════════════════════════════════════
function VisApps() {
  const [expr,     setExpr]     = useState("({[]})");
  const [inputVal, setInputVal] = useState("({[]})");
  const [result,   setResult]   = useState(null);
  const [steps,    setSteps]    = useState([]);
  const [visStep,  setVisStep]  = useState(0);
  const [playing,  setPlaying]  = useState(false);
  const EXAMPLES = ["({[]})", "((()))", "{[}", "([)]", "(("];
  const PAIRS    = { ")":"(", "}":"{", "]":"[" };
  const OPEN     = new Set(["(","{",'[']);
  const CLOSE    = new Set([")","}", "]"]);
  const COLS     = { "(":"#60a5fa","{":"#f472b6","[":"#4ade80", ")":"#60a5fa","}":"#f472b6","]":"#4ade80" };

  const check = (str) => {
    const ns = []; const stk = [];
    for (let i=0; i<str.length; i++) {
      const ch = str[i];
      if (OPEN.has(ch)) { stk.push(ch); ns.push({ char:ch,stack:[...stk],action:`PUSH '${ch}'`,ok:true }); }
      else if (CLOSE.has(ch)) {
        if (stk.length===0||stk[stk.length-1]!==PAIRS[ch]) {
          ns.push({ char:ch,stack:[...stk],action:`MISMATCH! expected '${PAIRS[ch]}'`,ok:false });
          setResult(false); setSteps(ns); return;
        }
        stk.pop();
        ns.push({ char:ch,stack:[...stk],action:`POP '${PAIRS[ch]}' ✓`,ok:true });
      }
    }
    const ok = stk.length===0;
    ns.push({ char:"END",stack:[...stk],action:ok?"Stack empty → BALANCED ✓":`${stk.length} unclosed`,ok });
    setResult(ok); setSteps(ns);
  };

  useEffect(() => {
    if (!playing) return;
    if (visStep>=steps.length) { setPlaying(false); return; }
    const t = setTimeout(() => setVisStep(s=>s+1), 580);
    return () => clearTimeout(t);
  }, [playing,visStep,steps]);

  const run = (str) => { setVisStep(0); setResult(null); check(str); setTimeout(()=>setPlaying(true),50); };
  const shown = steps.slice(0, visStep);

  return (
    <div>
      <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:8.5,color:"#2d3748",letterSpacing:"0.08em",marginBottom:8 }}>BRACKET CHECKER — POWERED BY STACK</div>
      <div style={{ display:"flex",gap:5,marginBottom:9,flexWrap:"wrap" }}>
        {EXAMPLES.map(ex => (
          <button key={ex} onClick={() => { setInputVal(ex);setExpr(ex);run(ex); }} style={{ padding:"4px 11px",borderRadius:20,cursor:"pointer",background:expr===ex?"rgba(167,139,250,0.18)":"rgba(255,255,255,0.04)",border:`1px solid ${expr===ex?"#a78bfa":"rgba(255,255,255,0.08)"}`,fontFamily:"'JetBrains Mono',monospace",fontSize:11,fontWeight:700,color:expr===ex?"#a78bfa":"#475569",transition:"all 0.2s" }}>{ex}</button>
        ))}
      </div>
      <div style={{ display:"flex",gap:5,marginBottom:10 }}>
        <input value={inputVal} onChange={e=>setInputVal(e.target.value)} placeholder="Type brackets..."
          style={{ flex:1,padding:"7px 12px",borderRadius:9,outline:"none",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",fontFamily:"'JetBrains Mono',monospace",fontSize:13,color:"#f8fafc" }}/>
        <button onClick={() => { setExpr(inputVal);run(inputVal); }} style={{ padding:"7px 14px",borderRadius:9,cursor:"pointer",background:"rgba(167,139,250,0.15)",border:"1px solid rgba(167,139,250,0.3)",fontFamily:"'JetBrains Mono',monospace",fontSize:10,fontWeight:700,color:"#a78bfa" }}>CHECK →</button>
      </div>
      <div style={{ display:"flex",gap:4,justifyContent:"center",marginBottom:10,flexWrap:"wrap" }}>
        {expr.split("").map((ch,i) => {
          const done = shown.some(s=>s.char===ch);
          return (
            <div key={i} style={{ width:30,height:30,borderRadius:8,background:done?`${COLS[ch]||"#94a3b8"}20`:"rgba(255,255,255,0.03)",border:`1.5px solid ${done?(COLS[ch]||"#94a3b8"):"rgba(255,255,255,0.08)"}`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'JetBrains Mono',monospace",fontSize:13,fontWeight:700,color:done?(COLS[ch]||"#94a3b8"):"#2d3748",transition:"all 0.3s" }}>{ch}</div>
          );
        })}
      </div>
      <div style={{ minHeight:72 }}>
        {shown.map((s,i) => (
          <div key={i} style={{ padding:"3px 9px",borderRadius:6,marginBottom:3,background:s.ok?"rgba(74,222,128,0.06)":"rgba(239,68,68,0.08)",border:`1px solid ${s.ok?"rgba(74,222,128,0.2)":"rgba(239,68,68,0.2)"}`,display:"flex",justifyContent:"space-between",alignItems:"center",animation:"fadeIn 0.2s ease both" }}>
            <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:s.ok?"#4ade80":"#f87171" }}>{s.action}</span>
            <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:8.5,color:"#2d3748" }}>[{s.stack.join("")}]</span>
          </div>
        ))}
      </div>
      {result!==null&&visStep>=steps.length && (
        <div style={{ padding:"9px 14px",borderRadius:10,textAlign:"center",background:result?"rgba(74,222,128,0.1)":"rgba(239,68,68,0.1)",border:`1px solid ${result?"rgba(74,222,128,0.3)":"rgba(239,68,68,0.3)"}`,fontFamily:"'JetBrains Mono',monospace",fontSize:12,fontWeight:700,color:result?"#4ade80":"#f87171",animation:"fUp 0.3s ease" }}>
          {result?"✓ BALANCED":"✗ UNBALANCED"}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VISUAL: Monotonic Stack
// ═══════════════════════════════════════════════════════════════════════════════
function VisMonotonic() {
  const ARR = [2,1,5,6,2,3];
  const [step,    setStep]    = useState(0);
  const [playing, setPlaying] = useState(false);
  const [stack,   setStack]   = useState([]);
  const [result,  setResult]  = useState(Array(ARR.length).fill(null));
  const [history, setHistory] = useState([]);
  const reset = () => { setStep(0);setStack([]);setResult(Array(ARR.length).fill(null));setHistory([]);setPlaying(false); };
  useEffect(() => {
    if (!playing) return;
    if (step>=ARR.length) { setPlaying(false); return; }
    const t = setTimeout(() => {
      const val=ARR[step], ns=[...stack], nr=[...result], pops=[];
      while (ns.length>0&&ARR[ns[ns.length-1]]<val) { const top=ns.pop(); nr[top]=val; pops.push(top); }
      ns.push(step);
      setStack(ns); setResult(nr);
      setHistory(h=>[`i=${step} val=${val}: pop [${pops.map(p=>ARR[p]).join(",")||"—"}], push ${val}`,...h].slice(0,5));
      setStep(s=>s+1);
    }, 800);
    return () => clearTimeout(t);
  }, [playing,step,stack,result]);
  useEffect(() => {
    if (step===ARR.length&&!playing&&step>0) setResult(r=>r.map(v=>v===null?-1:v));
  }, [step,playing]);
  return (
    <div>
      <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:8.5,color:"#2d3748",letterSpacing:"0.08em",marginBottom:8 }}>NEXT GREATER ELEMENT — O(n) with monotonic stack</div>
      <div style={{ display:"flex",gap:4,justifyContent:"center",marginBottom:6,flexWrap:"wrap" }}>
        {ARR.map((v,i) => {
          const isCur=i===step&&playing, isDone=i<step, inStk=stack.includes(i);
          return (
            <div key={i} style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:4 }}>
              <div style={{ width:36,height:26,borderRadius:6,background:result[i]!==null?"rgba(52,211,153,0.12)":"rgba(255,255,255,0.02)",border:`1px solid ${result[i]!==null?"rgba(52,211,153,0.3)":"rgba(255,255,255,0.06)"}`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'JetBrains Mono',monospace",fontSize:11,fontWeight:700,color:result[i]!==null?"#34d399":"#1a2030",transition:"all 0.3s" }}>{result[i]!==null?result[i]:"?"}</div>
              <div style={{ width:36,height:36,borderRadius:8,background:isCur?"rgba(52,211,153,0.25)":inStk?"rgba(96,165,250,0.15)":isDone?"rgba(255,255,255,0.03)":"rgba(255,255,255,0.04)",border:`1.5px solid ${isCur?"#34d399":inStk?"#60a5fa":isDone?"rgba(255,255,255,0.06)":"rgba(255,255,255,0.1)"}`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'JetBrains Mono',monospace",fontSize:13,fontWeight:700,color:isCur?"#34d399":inStk?"#93c5fd":"#94a3b8",transition:"all 0.3s",boxShadow:isCur?"0 0 14px rgba(52,211,153,0.4)":"none" }}>{v}</div>
              <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:"#2d3748" }}>[{i}]</div>
            </div>
          );
        })}
      </div>
      <div style={{ padding:"7px 12px",borderRadius:9,background:"rgba(52,211,153,0.06)",border:"1px solid rgba(52,211,153,0.15)",marginBottom:9 }}>
        <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:7.5,color:"#2d3748",marginBottom:3 }}>MONOTONIC STACK:</div>
        <div style={{ display:"flex",gap:4 }}>
          {stack.length===0?<span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#1a2030" }}>[ empty ]</span>
            :stack.map((idx2,i) => <span key={i} style={{ padding:"2px 9px",borderRadius:20,background:"rgba(52,211,153,0.15)",border:"1px solid rgba(52,211,153,0.3)",fontFamily:"'JetBrains Mono',monospace",fontSize:10,fontWeight:700,color:"#34d399" }}>{ARR[idx2]}</span>)}
        </div>
      </div>
      <div style={{ minHeight:44 }}>
        {history.map((l,i) => <div key={i} style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:i===0?"#34d399":"#1e2a38",padding:"1px 0",animation:i===0?"fadeIn 0.2s ease":"none" }}>{l}</div>)}
      </div>
      <div style={{ display:"flex",gap:7,justifyContent:"center",marginTop:7 }}>
        <button onClick={reset} style={{ padding:"5px 12px",borderRadius:20,cursor:"pointer",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#475569" }}>↺ RESET</button>
        <button onClick={() => { if(step===0)reset(); setPlaying(p=>!p); }} style={{ padding:"5px 16px",borderRadius:20,cursor:"pointer",background:"rgba(52,211,153,0.15)",border:"1px solid rgba(52,211,153,0.35)",fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:700,color:"#34d399" }}>{playing?"⏸ PAUSE":step>=ARR.length?"↺ REPLAY":"▶ PLAY"}</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VISUAL: Min Stack
// ═══════════════════════════════════════════════════════════════════════════════
function VisMinStack() {
  const [mainStack, setMain]    = useState([3,1,2]);
  const [minTrack,  setMinTrack]= useState([3,1,1]);
  const [log,       setLog]     = useState([]);
  const [pushVal,   setPushVal] = useState("");
  const [highlight, setHighlight] = useState(null); // 'main'|'min'

  const flash = (which) => { setHighlight(which); setTimeout(()=>setHighlight(null),600); };

  const push = (v) => {
    const val=parseInt(v); if(isNaN(val)) return;
    const newMin=minTrack.length===0?val:Math.min(val,minTrack[minTrack.length-1]);
    setMain(s=>[...s,val]); setMinTrack(m=>[...m,newMin]);
    setLog(l=>[`PUSH(${val}) → min is now ${newMin}`,...l].slice(0,5));
    flash("main"); setPushVal("");
  };
  const pop = () => {
    if (mainStack.length===0) return;
    const top=mainStack[mainStack.length-1];
    const nm=minTrack.slice(0,-1);
    const newMin=nm.length>0?nm[nm.length-1]:"—";
    setMain(s=>s.slice(0,-1)); setMinTrack(nm);
    setLog(l=>[`POP() → removed ${top}, min now ${newMin}`,...l].slice(0,5));
    flash("main");
  };
  const getMin = () => {
    if(minTrack.length===0) return;
    setLog(l=>[`getMin() → ${minTrack[minTrack.length-1]} (O(1) peek!)`,...l].slice(0,5));
    flash("min");
  };

  return (
    <div>
      <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:8.5,color:"#2d3748",marginBottom:8,letterSpacing:"0.08em" }}>TWO-STACK TECHNIQUE — getMin() in O(1)</div>
      <div style={{ display:"flex",gap:12,justifyContent:"center",marginBottom:12 }}>
        {[{ label:"MAIN STACK",data:mainStack,col:"#f59e0b",key:"main" },{ label:"MIN TRACKER",data:minTrack,col:"#60a5fa",key:"min" }].map(({ label,data,col,key }) => (
          <div key={label} style={{ flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:5 }}>
            <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:7.5,color:"#2d3748",letterSpacing:"0.1em" }}>{label}</div>
            <div style={{
              display:"flex",flexDirection:"column-reverse",gap:4,width:"100%",alignItems:"center",minHeight:130,
              padding:"6px",borderRadius:10,
              background:highlight===key?`${col}0a`:"transparent",
              border:`1px solid ${highlight===key?`${col}30`:"transparent"}`,
              transition:"all 0.3s",
            }}>
              {data.map((v,i) => {
                const isTop=i===data.length-1;
                return <div key={i} style={{ width:"90%",height:34,borderRadius:8,background:isTop?`${col}22`:"rgba(255,255,255,0.03)",border:`1.5px solid ${isTop?col:`${col}30`}`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'JetBrains Mono',monospace",fontSize:13,fontWeight:700,color:isTop?col:"#475569",transition:"all 0.35s cubic-bezier(0.34,1.56,0.64,1)",animation:isTop?"plateIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both":"none",boxShadow:isTop?`0 0 14px ${col}30`:"none" }}>{v}</div>;
              })}
              {data.length===0&&<div style={{ width:"90%",height:34,borderRadius:8,border:"1px dashed rgba(255,255,255,0.06)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#1a2030" }}>empty</div>}
            </div>
            {data.length>0&&<div style={{ padding:"2px 9px",borderRadius:20,background:`${col}14`,border:`1px solid ${col}30`,fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:700,color:col }}>top: {data[data.length-1]}</div>}
          </div>
        ))}
      </div>
      {minTrack.length>0&&(
        <div style={{ textAlign:"center",marginBottom:9,padding:"7px",borderRadius:9,background:"rgba(245,158,11,0.08)",border:"1px solid rgba(245,158,11,0.2)" }}>
          <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#f59e0b" }}>
            Current Min = <strong style={{ fontSize:15 }}>{minTrack[minTrack.length-1]}</strong> — always O(1)
          </span>
        </div>
      )}
      <div style={{ display:"flex",gap:5,justifyContent:"center",flexWrap:"wrap",marginBottom:7 }}>
        <div style={{ display:"flex",borderRadius:9,overflow:"hidden",border:"1px solid rgba(255,255,255,0.1)" }}>
          <input value={pushVal} onChange={e=>setPushVal(e.target.value)} onKeyDown={e=>e.key==="Enter"&&push(pushVal)} placeholder="val" type="number"
            style={{ width:52,padding:"5px 9px",background:"rgba(255,255,255,0.04)",border:"none",outline:"none",fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:"#f8fafc" }}/>
          <button onClick={() => push(pushVal)} style={{ padding:"5px 11px",background:"rgba(245,158,11,0.2)",border:"none",borderLeft:"1px solid rgba(255,255,255,0.1)",cursor:"pointer",fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:700,color:"#f59e0b" }}>PUSH</button>
        </div>
        <button onClick={pop} disabled={mainStack.length===0} style={{ padding:"5px 12px",borderRadius:9,cursor:mainStack.length?"pointer":"not-allowed",background:"rgba(244,114,182,0.1)",border:"1px solid rgba(244,114,182,0.25)",fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:700,color:mainStack.length?"#f472b6":"#2d3748",opacity:mainStack.length?1:0.5 }}>POP</button>
        <button onClick={getMin} disabled={mainStack.length===0} style={{ padding:"5px 12px",borderRadius:9,cursor:mainStack.length?"pointer":"not-allowed",background:"rgba(96,165,250,0.1)",border:"1px solid rgba(96,165,250,0.25)",fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:700,color:mainStack.length?"#60a5fa":"#2d3748",opacity:mainStack.length?1:0.5 }}>GET MIN</button>
      </div>
      {log.map((l,i) => <div key={i} style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:i===0?"#f59e0b":"#2d3748",padding:"1px 0",animation:i===0?"fadeIn 0.3s ease":"none" }}>{l}</div>)}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPLEXITY TABLE
// ═══════════════════════════════════════════════════════════════════════════════
function ComplexityTable() {
  const [hov, setHov] = useState(null);
  const rows = [
    { nm:"Push",       c:"#4ade80",avg:"O(1)",wc:"O(1)*",sp:"O(1)",n:"Amortized O(1) for dynamic arrays. Linked list always O(1)." },
    { nm:"Pop",        c:"#4ade80",avg:"O(1)",wc:"O(1)", sp:"O(1)",n:"Remove top element. Always constant time." },
    { nm:"Peek / Top", c:"#4ade80",avg:"O(1)",wc:"O(1)", sp:"O(1)",n:"Just read the top pointer. No traversal needed." },
    { nm:"isEmpty",    c:"#4ade80",avg:"O(1)",wc:"O(1)", sp:"O(1)",n:"Compare size or top pointer to zero." },
    { nm:"Search",     c:"#ef4444",avg:"O(n)",wc:"O(n)", sp:"O(1)",n:"Must scan entire stack — use a different structure for search." },
    { nm:"Space",      c:"#60a5fa",avg:"O(n)",wc:"O(n)", sp:"—",   n:"Proportional to number of elements stored." },
  ];
  return (
    <div style={{ overflowX:"auto" }}>
      <table style={{ width:"100%",borderCollapse:"collapse",minWidth:480 }}>
        <thead>
          <tr>{["Operation","Average","Worst Case","Space","Notes"].map(h => (
            <th key={h} style={{ padding:"10px 14px",textAlign:"left",fontFamily:"'JetBrains Mono',monospace",fontSize:9,letterSpacing:"0.1em",color:"#2d3748",borderBottom:"1px solid rgba(255,255,255,0.06)",fontWeight:700,whiteSpace:"nowrap" }}>{h}</th>
          ))}</tr>
        </thead>
        <tbody>
          {rows.map((r,i) => (
            <tr key={i} onMouseEnter={()=>setHov(i)} onMouseLeave={()=>setHov(null)}
              style={{ borderBottom:"1px solid rgba(255,255,255,0.04)",background:hov===i?"rgba(255,255,255,0.025)":"transparent",transition:"background 0.2s" }}>
              <td style={{ padding:"10px 14px",whiteSpace:"nowrap" }}>
                <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                  <span style={{ width:7,height:7,borderRadius:"50%",background:r.c,flexShrink:0,boxShadow:hov===i?`0 0 8px ${r.c}`:"none",transition:"box-shadow 0.2s" }}/>
                  <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:11,fontWeight:700,color:"#e2e8f0" }}>{r.nm}</span>
                </div>
              </td>
              {[r.avg,r.wc,r.sp].map((v,j) => (
                <td key={j} style={{ padding:"10px 14px",fontFamily:"'JetBrains Mono',monospace",fontSize:11,fontWeight:v.includes("O(1)")?700:400,color:v.includes("O(1)")?"#4ade80":v==="O(n)"?"#ef4444":"#94a3b8",whiteSpace:"nowrap" }}>{v}</td>
              ))}
              <td style={{ padding:"10px 14px",fontFamily:"'DM Sans',sans-serif",fontSize:11,color:"#475569" }}>{r.n}</td>
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
      <div style={{ background:"rgba(5,8,20,0.98)",border:"1px solid rgba(96,165,250,0.3)",borderRadius:24,padding:"32px 36px",maxWidth:400,width:"calc(100% - 40px)",boxShadow:"0 24px 80px rgba(0,0,0,0.9)",animation:"popIn 0.25s cubic-bezier(0.22,1,0.36,1) both" }} onClick={e=>e.stopPropagation()}>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24 }}>
          <h3 style={{ fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:800,color:"#f8fafc",margin:0 }}>⌨️ Shortcuts</h3>
          <button onClick={onClose} style={{ background:"none",border:"1px solid rgba(255,255,255,0.1)",color:"#64748b",cursor:"pointer",borderRadius:8,padding:"4px 10px",fontFamily:"'JetBrains Mono',monospace",fontSize:10 }}>ESC</button>
        </div>
        {[["S","Stop narration"],["↑ / ↓","Navigate sections"],["?","Toggle shortcuts"],["Esc","Close panels"]].map(([k,d]) => (
          <div key={k} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
            <span style={{ fontFamily:"'DM Sans',sans-serif",fontSize:14,color:"#94a3b8" }}>{d}</span>
            <kbd style={{ background:"rgba(96,165,250,0.15)",border:"1px solid rgba(96,165,250,0.35)",borderRadius:6,padding:"3px 10px",fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"#93c5fd",fontWeight:700 }}>{k}</kbd>
          </div>
        ))}
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════════
// CONFETTI (quiz perfect score)
// ═══════════════════════════════════════════════════════════════════════════════
function Confetti() {
  const pieces = Array.from({ length: 32 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.8,
    dur: 1.8 + Math.random() * 1.2,
    color: ["#60a5fa","#f472b6","#4ade80","#fbbf24","#a78bfa","#fb923c"][i % 6],
    size: 6 + Math.random() * 6,
  }));
  return (
    <div style={{ position:"fixed",inset:0,pointerEvents:"none",zIndex:3000,overflow:"hidden" }}>
      {pieces.map(p => (
        <div key={p.id} style={{
          position:"absolute",top:"-10%",left:`${p.x}%`,
          width:p.size,height:p.size,borderRadius:p.id%3===0?"50%":2,
          background:p.color,
          animation:`confettiFall ${p.dur}s ease-in ${p.delay}s both`,
        }}/>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// QUIZ
// ═══════════════════════════════════════════════════════════════════════════════
function Quiz({ onDone }) {
  const QS = [
    { q:"A stack follows which ordering principle?",opts:["FIFO","LIFO","LILO","Priority Order"],ans:1,exp:"LIFO — Last In, First Out. The last element pushed is always the first to be popped." },
    { q:"What is the time complexity of PEEK on a stack?",opts:["O(n)","O(log n)","O(1)","O(n²)"],ans:2,exp:"O(1). Peek reads the top pointer with no traversal. All four stack operations are O(1)." },
    { q:"Which of these is NOT a standard stack operation?",opts:["Push","Pop","Peek","Search"],ans:3,exp:"Search is not standard. To find an element you must pop everything above it — O(n). Stacks aren't designed for search." },
    { q:"A 'stack overflow' error means:",opts:["Divided by zero","Call stack ran out of memory","Null pointer accessed","Array out of bounds"],ans:1,exp:"Stack overflow occurs when the call stack exceeds its memory limit — usually from infinite recursion." },
    { q:"The Min Stack's getMin() in O(1) requires:",opts:["Binary search","A second parallel min-tracking stack","Sorting on push","A hash map"],ans:1,exp:"A second stack that mirrors the main stack but only pushes when new value ≤ current minimum. getMin() peeks this stack in O(1)." },
    { q:"Monotonic stack solves 'Next Greater Element' in:",opts:["O(n²)","O(n log n)","O(n)","O(log n)"],ans:2,exp:"O(n) — each element is pushed and popped at most once. Total = 2n = O(n)." },
  ];
  
  const [ans,  setAns]  = useState({});
  const [rev,  setRev]  = useState({});
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
                  if (isR) { if(isCorr){bg="rgba(74,222,128,0.12)";brd="rgba(74,222,128,0.38)";col="#4ade80";} else if(isSel){bg="rgba(239,68,68,0.12)";brd="rgba(239,68,68,0.38)";col="#f87171";} else col="#2d3748"; }
                  else if (isSel) { bg="rgba(96,165,250,0.12)";brd="rgba(96,165,250,0.38)";col="#93c5fd"; }
                  return (
                    <button key={oi} onClick={() => !isR&&setAns(a=>({...a,[qi]:oi}))} style={{ padding:"9px 12px",borderRadius:10,cursor:isR?"default":"pointer",background:bg,border:`1px solid ${brd}`,fontFamily:"'DM Sans',sans-serif",fontSize:13,color:col,textAlign:"left",transition:"all 0.22s",display:"flex",alignItems:"center",gap:8 }}>
                      <span style={{ width:19,height:19,borderRadius:"50%",flexShrink:0,background:isR?(isCorr?"rgba(74,222,128,0.26)":isSel?"rgba(239,68,68,0.26)":"rgba(255,255,255,0.04)"):(isSel?"rgba(96,165,250,0.26)":"rgba(255,255,255,0.04)"),border:`1px solid ${col}50`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:700,color:col }}>{isR&&isCorr?"✓":isR&&isSel&&!isCorr?"✗":String.fromCharCode(65+oi)}</span>
                      {opt}
                    </button>
                  );
                })}
              </div>
              {ans[qi]!==undefined&&!isR && (
                <button onClick={() => setRev(r=>({...r,[qi]:true}))} style={{ marginTop:10,padding:"6px 18px",borderRadius:20,cursor:"pointer",background:"rgba(96,165,250,0.12)",border:"1px solid rgba(96,165,250,0.3)",fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:700,color:"#60a5fa" }}>CHECK →</button>
              )}
              {isR && (
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
export default function StackPage() {
  const [speaking,      setSpeaking]      = useState(null);
  const [active,        setActive]        = useState("intro");
  const [navOpen, setNavOpen] = useState(true); // true = sidebar visible by default
  const [qScore,        setQScore]        = useState(null);
  const [qTotal,        setQTotal]        = useState(null);
  const [speed,         setSpeed]         = useState(1.25);
  const [seenSections,  setSeenSections]  = useState(new Set());
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [showConfetti,  setShowConfetti]  = useState(false);
  const currentNarr = useRef(null);

  // Load fonts + warm-up voices
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
      if (e.key==="?"||e.key==="/") { e.preventDefault(); setShortcutsOpen(o=>!o); }
      if (e.key==="Escape") setShortcutsOpen(false);
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
      voiceSpeak(text, () => { setSpeaking(null); currentNarr.current=null; }, currentRate);
    }
  }, [speaking]);

  const handleRestart = useCallback(() => {
    if (currentNarr.current) {
      const { id, text } = currentNarr.current;
      voiceStop();
      setTimeout(() => voiceSpeak(text, () => { setSpeaking(null); currentNarr.current=null; }, currentRate), 80);
    }
  }, []);

  const handleStop = useCallback(() => { voiceStop(); setSpeaking(null); currentNarr.current=null; }, []);

  const speakingLabel = speaking
    ? (NAV_SECTIONS.find(s=>s.id===speaking)?.label ?? (speaking==="__hero__"?"Introduction":speaking))
    : null;
  const goIntro = () => document.getElementById("intro")?.scrollIntoView({ behavior:"smooth" });

  const SECTS = [
    { id:"intro",     icon:"📚",title:"What is a Stack?",              color:"#60a5fa",voice:NARR.intro,     visual:<VisIntro/>,     cards:[
        { lbl:"LIFO RULE",          body:"Last In, First Out — the single defining rule. The most recently added element is always the first to be removed." },
        { lbl:"REAL-WORLD ANALOGY", body:"A stack of plates. Always put on top, always take from top. Pulling from the middle is forbidden — and physically dangerous!" },
        { lbl:"WHERE STACKS APPEAR",body:"Undo/redo, browser back button, call stacks in every language, expression parsers, DFS graph traversal, backtracking." },
        { lbl:"WHY SO POWERFUL",    body:"All four operations are O(1). The LIFO constraint is what makes stacks so predictable — you always know exactly what's next." },
      ]},
    { id:"ops",       icon:"⚡",title:"Stack Operations",              color:"#4ade80",voice:NARR.ops,       visual:<VisOps/>,      cards:[
        { lbl:"PUSH — O(1)",   body:"Adds an element to the top. Array: arr[++top] = val. Linked list: create node, set as new head." },
        { lbl:"POP — O(1)",    body:"Removes and returns the top element. Must check isEmpty first to avoid underflow error." },
        { lbl:"PEEK — O(1)",   body:"Returns the top element without removing it. Essential for lookahead logic in parsers." },
        { lbl:"THE GUARANTEE", body:"Every stack operation is O(1) — no loops, no comparisons. This is the superpower." },
      ]},
    { id:"impl",      icon:"🔧",title:"Stack Implementation",          color:"#f472b6",voice:NARR.impl,      visual:<VisImpl/>,     cards:[
        { lbl:"ARRAY IMPL",    body:"Use an array + top pointer. Push: arr[++top] = val. Pop: return arr[top--]. Simple, cache-friendly, fixed capacity." },
        { lbl:"LINKED LIST",   body:"Head node is always the top. Push: new node becomes head. Pop: save head value, advance head.next." },
        { lbl:"PYTHON",        body:"Python list is a free stack: append() = push, pop() = pop, list[-1] = peek. All O(1) amortized." },
        { lbl:"JAVA / C++",    body:"Use ArrayDeque in Java — avoids Vector overhead of java.util.Stack. In C++, std::stack wraps std::deque." },
      ]},
    { id:"callstack", icon:"🧵",title:"The Call Stack & Recursion",    color:"#fb923c",voice:NARR.callstack, visual:<VisCallStack/>,cards:[
        { lbl:"STACK FRAME",   body:"When a function is called, its local variables, parameters, and return address are pushed as a stack frame." },
        { lbl:"RECURSION",     body:"Each recursive call pushes a frame. Base case stops pushing. Then frames pop in reverse — each returning its value down." },
        { lbl:"STACK OVERFLOW",body:"When the call stack runs out of allocated memory. Caused by infinite recursion or too many nested calls." },
        { lbl:"DEBUGGING",     body:"A stack trace in an error IS the call stack — every frame currently alive, from main at bottom to crash at top." },
      ]},
    { id:"apps",      icon:"🌍",title:"Stack Applications",            color:"#a78bfa",voice:NARR.apps,      visual:<VisApps/>,     cards:[
        { lbl:"UNDO / REDO",         body:"Every action pushed to undo stack. Ctrl+Z pops from undo, pushes to redo. Ctrl+Y reverses." },
        { lbl:"BRACKET MATCHING",    body:"Push every opener. On each closer, pop and match. If empty at end → balanced. Used in every editor and compiler." },
        { lbl:"EXPRESSION EVAL",     body:"Shunting-yard algorithm uses two stacks (operators + operands) to evaluate infix math expressions correctly." },
        { lbl:"DFS & BACKTRACKING",  body:"DFS uses a stack to track the path. Backtracking pops to the last decision point. Sudoku, N-Queens, maze solvers." },
      ]},
    { id:"monotonic", icon:"📈",title:"Monotonic Stack",               color:"#34d399",voice:NARR.monotonic, visual:<VisMonotonic/>,cards:[
        { lbl:"CORE IDEA",     body:"A stack maintained in strictly increasing or decreasing order. When pushing, first pop all elements that violate the order." },
        { lbl:"NGE IN O(n)",   body:"For each index: while top < arr[i], pop and record arr[i] as its answer. Each element pushed/popped at most once → O(n)." },
        { lbl:"PROBLEMS",      body:"Daily temperatures, largest rectangle in histogram, trapping rainwater, stock span — all collapse to O(n)." },
        { lbl:"WHY O(n)",      body:"Total ops = 2n (each element pushed once, popped once). Despite nested loops in code, amortized analysis proves O(n)." },
      ]},
    { id:"minstack",  icon:"🔑",title:"Min Stack — O(1) getMin",       color:"#f59e0b",voice:NARR.minstack,  visual:<VisMinStack/>, cards:[
        { lbl:"THE CHALLENGE", body:"Design a stack with push, pop, peek, and getMin all in O(1). Naïve scan for minimum is O(n) — not good enough." },
        { lbl:"THE SOLUTION",  body:"Two parallel stacks. Main operates normally. Min stack only pushes when new value ≤ current minimum." },
        { lbl:"WHY IT WORKS",  body:"The min stack always holds the current minimum at its top — never stale because it mirrors every pop that could change min." },
        { lbl:"INTERVIEW GOLD",body:"One of the most common top-tech interviews. Demonstrates space–time trade-off: O(n) space for O(1) time." },
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
        @keyframes orb3{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(18px,-12px) scale(1.08)}}

        /* HERO ANIMATIONS — fixed */
        @keyframes heroPush{
          0%  {opacity:0;transform:translateY(-70px) scaleY(0.7) scaleX(0.85)}
          55% {opacity:1;transform:translateY(6px) scaleY(1.06) scaleX(0.97)}
          75% {transform:translateY(-3px) scaleY(0.98) scaleX(1.01)}
          100%{transform:translateY(0) scaleY(1) scaleX(1);opacity:1}
        }
        @keyframes heroPop{
          0%  {opacity:1;transform:translateY(0) scaleX(1) rotate(0deg)}
          100%{opacity:0;transform:translateY(-90px) scaleX(0.6) rotate(12deg)}
        }
        @keyframes topPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(1.5)}}
        @keyframes platShine{0%,100%{left:-100%}55%{left:160%}}
        @keyframes lifoFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        @keyframes opLabelIn{from{opacity:0;transform:scale(0.85) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}

        /* INTRO VIS ANIMATIONS */
        @keyframes introPush{from{opacity:0;transform:translateY(-40px) scale(0.88)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes introPopFly{from{opacity:1;transform:translateX(-50%) translateY(0) scale(1)}to{opacity:0;transform:translateX(calc(-50% + 60px)) translateY(-80px) scale(0.6) rotate(15deg)}}

        @keyframes frameIn{from{opacity:0;transform:translateX(-22px) scale(0.94)}to{opacity:1;transform:translateX(0) scale(1)}}
        @keyframes frameOut{from{opacity:1;transform:translateX(0) scale(1)}to{opacity:0;transform:translateX(22px) scale(0.92)}}
        @keyframes plateIn{from{opacity:0;transform:translateY(-28px) scale(0.9)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes sRight{from{opacity:0;transform:translateX(26px)}to{opacity:1;transform:translateX(0)}}
        @keyframes fUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes popIn{from{opacity:0;transform:scale(0.88) translateY(12px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes panelPop{from{opacity:0;transform:translateY(-8px) scale(0.96)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes slideUp{from{opacity:0;transform:translate(-50%,20px)}to{opacity:1;transform:translate(-50%,0)}}
        @keyframes wave{0%,100%{transform:scaleY(0.4)}50%{transform:scaleY(1)}}

        @keyframes confettiFall{
          0%  {transform:translateY(0) rotate(0deg);opacity:1}
          80% {opacity:1}
          100%{transform:translateY(110vh) rotate(720deg);opacity:0}
        }

        @media(max-width:760px){
          .sg{grid-template-columns:1fr !important}
          .nav-pills button{width:30px !important;height:30px !important;font-size:13px !important}
        }
      `}</style>

      {showConfetti && <Confetti/>}
      <ProgressBar/>
      <BackToTop/>
      <ShortcutsModal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)}/>
      <MiniPlayer speaking={speaking} speakingLabel={speakingLabel} onStop={handleStop} speed={speed}/>

      <Hero onStart={goIntro} onVoice={() => handleVoice("__hero__", NARR.intro)}/>

      {/* Shortcut hint */}
      <div style={{ textAlign:"center",marginBottom:32,fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#1e2a38",letterSpacing:"0.1em" }}>
        PRESS <kbd style={{ background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:5,padding:"1px 7px",color:"#2d3748" }}>?</kbd> FOR KEYBOARD SHORTCUTS
      </div>

      <main style={{ maxWidth:1000,margin:"0 auto",padding:"0 20px 100px" }}>

        {SECTS.map(s => (
          <Sect key={s.id} id={s.id} icon={s.icon} title={s.title}
            color={s.color} visual={s.visual} cards={s.cards}
            voice={s.voice} speaking={speaking} onVoice={handleVoice}
            seen={seenSections.has(s.id)}/>
        ))}

        {/* Complexity table */}
        <section id="complexity" style={{ marginBottom:80 }}>
          <div style={{ display:"flex",alignItems:"center",gap:14,marginBottom:22,flexWrap:"wrap" }}>
            <div style={{ width:50,height:50,borderRadius:16,flexShrink:0,background:"rgba(96,165,250,0.12)",border:"1px solid rgba(96,165,250,0.32)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,boxShadow:"0 0 28px rgba(96,165,250,0.15)" }}>⚡</div>
            <div>
              <h2 style={{ fontFamily:"'Syne',sans-serif",fontSize:"clamp(19px,3.8vw,30px)",fontWeight:800,color:"#f8fafc" }}>Complexity Cheat Sheet</h2>
              <p style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#2d3748",marginTop:3,letterSpacing:"0.08em" }}>GREEN = O(1) FAST · RED = SLOW · HOVER ROWS</p>
            </div>
          </div>
          <div style={{ borderRadius:22,overflow:"hidden",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)" }}>
            <ComplexityTable/>
          </div>
          <div style={{ marginTop:12,padding:"10px 16px",borderRadius:12,background:"rgba(96,165,250,0.06)",border:"1px solid rgba(96,165,250,0.15)",fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#60a5fa" }}>
            * Dynamic array push is amortized O(1) — occasional O(n) resize, averaged over n pushes = O(1) per op.
          </div>
        </section>

        {/* Quiz */}
        <section id="quiz" style={{ marginBottom:80 }}>
          <div style={{ display:"flex",alignItems:"center",gap:14,marginBottom:8,flexWrap:"wrap" }}>
            <div style={{ width:50,height:50,borderRadius:16,flexShrink:0,background:"rgba(236,72,153,0.12)",border:"1px solid rgba(236,72,153,0.32)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,boxShadow:"0 0 28px rgba(236,72,153,0.15)" }}>🧠</div>
            <div style={{ flex:1,minWidth:0 }}>
              <h2 style={{ fontFamily:"'Syne',sans-serif",fontSize:"clamp(19px,3.8vw,30px)",fontWeight:800,color:"#f8fafc" }}>Test Your Knowledge</h2>
              <p style={{ fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#475569",marginTop:3 }}>6 questions · covers every section · some are tricky</p>
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
            if (sc>=tot) { setShowConfetti(true); setTimeout(()=>setShowConfetti(false), 4000); }
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
                {qScore>=5?"Outstanding! You have genuinely mastered stack data structures.":qScore>=3?"Solid progress. Review the sections you missed and retry.":"Great start — re-read the sections above and come back stronger."}
              </p>
              <div style={{ display:"inline-block",padding:"12px 28px",borderRadius:16,background:"linear-gradient(135deg,#3b82f6,#ec4899)",fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:700,color:"#fff" }}>
                🎉 Stack Complete — Explore Queues Next
              </div>
            </div>
          )}
        </section>

        {/* Footer CTA (card at the end) */}
        <div style={{
          textAlign:"center",padding:"48px 24px",borderRadius:26,
          background:"linear-gradient(140deg,rgba(96,165,250,0.09) 0%,rgba(244,114,182,0.07) 50%,rgba(74,222,128,0.06) 100%)",
          border:"1px solid rgba(96,165,250,0.18)",position:"relative",overflow:"hidden",
        }}>
          <div style={{ position:"absolute",inset:0,backgroundImage:"radial-gradient(circle,rgba(96,165,250,0.04) 1px,transparent 1px)",backgroundSize:"30px 30px",pointerEvents:"none" }}/>
          <div style={{ fontSize:48,marginBottom:14 }}>📚</div>
          <h3 style={{ fontFamily:"'Syne',sans-serif",fontSize:"clamp(17px,3.2vw,26px)",fontWeight:800,color:"#f8fafc",marginBottom:12 }}>You have completed the Stack guide!</h3>
          <p style={{ fontFamily:"'DM Sans',sans-serif",fontSize:14,color:"#64748b",maxWidth:440,margin:"0 auto 28px",lineHeight:1.72 }}>
            Now implement one from scratch. Start with array-based, then add the min-stack trick. Writing the code makes every concept permanent.
          </p>
          {/* Section progress */}
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
        </div>
      </main>
      <RightSidebar
        active={active}
        speaking={speaking}
        speed={speed}
        setSpeed={setSpeed}
        onRestart={handleRestart}
        seenCount={seenSections.size}
        open={navOpen}
        setOpen={setNavOpen}
      />
    </div>
  );
}