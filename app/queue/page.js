"use client";
import { useState, useEffect, useRef, useCallback } from "react";

// ── Helper hooks ────────────────────────────────────────────────────────────
function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) setMatches(media.matches);
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);
  return matches;
}

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

// ── VOICE ENGINE ────────────────────────────────────────────────────────────
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

// ── NARRATIONS ──────────────────────────────────────────────────────────────
const NARR = {
  intro: `A queue is a fundamental data structure that follows the First In, First Out — FIFO — principle. Imagine a line of people waiting at a ticket counter: the first person to arrive is the first to be served. That is exactly how a queue works. Elements are added at the rear and removed from the front. This simple rule makes queues perfect for managing tasks in order, processing requests, and ensuring fairness.`,
  ops: `A queue has four core operations. Enqueue adds an element to the rear in O(1). Dequeue removes and returns the front element in O(1). Front returns the element at the front without removing it in O(1). isEmpty checks if the queue is empty in O(1). Every operation is constant time — no loops, no searching.`,
  impl: `Queues can be implemented in two ways. An array implementation uses two pointers: front and rear. Enqueue advances rear, dequeue advances front. But a simple array wastes space when elements are removed. A circular queue reuses the freed space by wrapping around. The linked list implementation uses head and tail pointers; enqueue adds after tail, dequeue moves head forward. Both give O(1) operations.`,
  types: `There are several important queue variants. A simple linear queue is the basic FIFO structure. A circular queue connects the end to the front, reusing space and preventing overflow. A deque (double-ended queue) allows insertion and deletion at both ends. A priority queue serves elements based on priority rather than order of arrival — often implemented with a heap.`,
  circular: `A circular queue solves the space wastage of linear arrays. When the rear reaches the end, it wraps to the beginning if the front has moved forward. This allows full utilization of the allocated array. The queue is full when (rear + 1) % capacity equals front, and empty when front equals rear. This is the classic ring buffer — used in audio buffers, network packets, and operating system schedulers.`,
  deque: `A deque (double-ended queue) is a generalization of both stack and queue. You can push and pop from both ends. This gives O(1) operations at either end. Deques are used in sliding window problems, palindrome checking, and implementing both stacks and queues efficiently. Python's collections.deque is a highly optimized deque.`,
  applications: `Queues are everywhere. Breadth-First Search (BFS) in graphs uses a queue to explore nodes level by level. Task scheduling in operating systems uses queues to manage processes. Print spoolers use a queue to handle multiple print jobs. Message queues in distributed systems like RabbitMQ rely on queues. Even network routers use packet queues to handle incoming traffic fairly.`,
  quiz: `You have reached the quiz. You've learned about FIFO, all O(1) operations, array and linked list implementations, circular queues, deques, priority queues, and real-world applications. Some questions are tricky — take your time. Getting a wrong answer is the fastest way to lock the correct understanding into memory.`,
};

const NAV_SECTIONS = [
  { id:"intro",      icon:"📋", label:"Intro",      col:"#60a5fa" },
  { id:"ops",        icon:"⚡", label:"Operations", col:"#4ade80" },
  { id:"impl",       icon:"🔧", label:"Implement",  col:"#f472b6" },
  { id:"types",      icon:"🗂️", label:"Types",      col:"#818cf8" },
  { id:"circular",   icon:"🔄", label:"Circular",   col:"#34d399" },
  { id:"deque",      icon:"↔️", label:"Deque",       col:"#f59e0b" },
  { id:"applications",icon:"🌍",label:"Apps",       col:"#a78bfa" },
  { id:"quiz",       icon:"🧠", label:"Quiz",       col:"#ec4899" },
];
const SPEED_OPTIONS = [0.75, 1.0, 1.25, 1.5, 2.0];

// ── PROGRESS BAR ────────────────────────────────────────────────────────────
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

// ── SPEAKING WAVE ───────────────────────────────────────────────────────────
function SpeakingWave({ color="#4ade80", size=16 }) {
  return (
    <div style={{ display:"flex",alignItems:"center",gap:2,height:size }}>
      {[0,1,2,3].map(i => (
        <div key={i} style={{ width:size*0.18,height:size*0.5,background:color,borderRadius:99,animation:`wave 1.1s ease-in-out ${i*0.15}s infinite` }}/>
      ))}
    </div>
  );
}

// ── SPEED PANEL ─────────────────────────────────────────────────────────────
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

// ── RIGHT SIDEBAR (collapsible, responsive) ─────────────────────────────────
function RightSidebar({ active, speaking, speed, setSpeed, onRestart, seenCount, open, setOpen }) {
  const [show, setShow] = useState(false);
  const [speedOpen, setSpeedOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 600px)');

  useEffect(() => {
    const h = () => setShow(window.scrollY > 500);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  // Replace with actual implementation pages if you have them
  const goToArray = () => { window.location.href = "/queue-vis"; };
  const goToLL = () => { window.location.href = "/queue-vis"; };

  if (!open) {
    const btnSize = isMobile ? 36 : 40;
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

  const desktopBtnSize = 36;
  const desktopGap = 4;
  const desktopPadding = "8px 6px";
  const desktopFontIcon = 16;
  const desktopFontText = 8;
  const desktopCodePadding = "4px 8px";
  const desktopProgressPillPadding = "3px 6px";
  const desktopProgressBarWidth = 24;
  const desktopSpeakingPadding = "3px 6px";

  const mobileBtnSize = 32;
  const mobileGap = 3;
  const mobilePadding = "8px 6px";
  const mobileFontIcon = 18;
  const mobileFontText = 9;
  const mobileCodePadding = "4px 8px";
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
        📦 {isMobileView ? "Array" : "Array Queue"}
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
        🔗 {isMobileView ? "Linked" : "Linked Queue"}
      </button>

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

// ── BACK TO TOP ─────────────────────────────────────────────────────────────
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

// ── COMPLETED BADGE ─────────────────────────────────────────────────────────
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

// ── MINI PLAYER ─────────────────────────────────────────────────────────────
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

// ── HERO (animated FIFO queue, fixed height, responsive) ────────────────────
const MAX_SLOTS = 6;
function Hero({ onStart, onVoice }) {
  const isMobile = useMediaQuery("(max-width: 600px)");
  const slotSize    = isMobile ? 56 : 72;
  const slotGap     = isMobile ? 4 : 8;
  const fontSize    = isMobile ? 18 : 22;
  const labelOffset = isMobile ? 18 : 22;
  const railHeight  = slotSize + 16;
  const showArrows  = !isMobile;

  const makeSlots = (items) => {
    const s = Array(MAX_SLOTS).fill(null);
    items.forEach((it, i) => { s[i] = { ...it, state: "idle" }; });
    return s;
  };
  const INITIAL = [
    { id: 1, v: 10, col: "#60a5fa" },
    { id: 2, v: 25, col: "#4ade80" },
    { id: 3, v: 37, col: "#f472b6" },
  ];

  const [slots, setSlots]       = useState(() => makeSlots(INITIAL));
  const [opLabel, setOpLabel]   = useState(null);
  const [paused, setPaused]     = useState(false);
  const counterRef  = useRef(4);
  const vIdxRef     = useRef(0);
  const pausedRef   = useRef(false);
  const busyRef     = useRef(false);
  const VALUES      = [42, 55, 68, 81, 99, 17, 63, 28];
  const COLORS      = ["#60a5fa", "#4ade80", "#f472b6", "#f59e0b", "#a78bfa", "#34d399", "#fb923c"];

  useEffect(() => { pausedRef.current = paused; }, [paused]);

  useEffect(() => {
    const tick = () => {
      if (pausedRef.current || busyRef.current) return;

      setSlots((prev) => {
        const live = prev.filter(Boolean);
        if (live.length >= 5) {
          // Dequeue
          const frontIdx = prev.findIndex(Boolean);
          if (frontIdx === -1) return prev;
          const front = prev[frontIdx];
          busyRef.current = true;
          setOpLabel({ text: `DEQUEUE → ${front.v}`, col: "#f472b6", icon: "⬆" });
          const s1 = [...prev];
          s1[frontIdx] = { ...front, state: "leaving" };
          setTimeout(() => {
            setSlots((cur) => {
              const filled = cur.filter((x) => x && x.state !== "leaving");
              const fresh  = Array(MAX_SLOTS).fill(null);
              filled.forEach((it, i) => { fresh[i] = { ...it, state: "idle" }; });
              return fresh;
            });
            setTimeout(() => {
              setOpLabel(null);
              busyRef.current = false;
            }, 400);
          }, 520);
          return s1;
        } else {
          // Enqueue
          const live2 = prev.filter(Boolean);
          const rearSlot = live2.length;
          if (rearSlot >= MAX_SLOTS) return prev;
          const val = VALUES[vIdxRef.current % VALUES.length];
          vIdxRef.current++;
          const col = COLORS[counterRef.current % COLORS.length];
          const id  = counterRef.current++;
          busyRef.current = true;
          setOpLabel({ text: `ENQUEUE ${val}`, col: "#4ade80", icon: "⬇" });
          const s1 = [...prev];
          s1[rearSlot] = { id, v: val, col, state: "entering" };
          setTimeout(() => {
            setSlots((cur) => {
              const s2 = [...cur];
              const idx2 = s2.findIndex((x) => x && x.id === id);
              if (idx2 !== -1) s2[idx2] = { ...s2[idx2], state: "idle" };
              return s2;
            });
            setTimeout(() => {
              setOpLabel(null);
              busyRef.current = false;
            }, 300);
          }, 500);
          return s1;
        }
      });
    };
    const interval = setInterval(tick, 2200);
    return () => clearInterval(interval);
  }, []);

  const liveSlots   = slots.filter(Boolean);
  const frontItem   = liveSlots[0];
  const rearItem    = liveSlots[liveSlots.length - 1];

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: isMobile ? "48px 16px 32px" : "64px 24px 48px",
      textAlign: "center",
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{ position:"absolute", inset:0, pointerEvents:"none", backgroundImage:"radial-gradient(circle,rgba(96,165,250,0.045) 1px,transparent 1px)", backgroundSize:"38px 38px" }}/>
      <div style={{ position:"absolute", top:"4%", left:"2%", width:isMobile?300:500, height:isMobile?300:500, borderRadius:"50%", background:"radial-gradient(circle,rgba(96,165,250,0.11) 0%,transparent 68%)", filter:"blur(90px)", pointerEvents:"none", animation:"orb1 24s ease-in-out infinite" }}/>
      <div style={{ position:"absolute", bottom:"6%", right:"2%", width:isMobile?250:400, height:isMobile?250:400, borderRadius:"50%", background:"radial-gradient(circle,rgba(244,114,182,0.09) 0%,transparent 68%)", filter:"blur(75px)", pointerEvents:"none", animation:"orb2 30s ease-in-out infinite" }}/>

      <div style={{ width:"100%", maxWidth:isMobile?"100%":620, marginBottom:isMobile?24:40, position:"relative" }}>
        <div style={{ height:36, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:4 }}>
          {opLabel && (
            <span style={{
              display:"inline-flex", alignItems:"center", gap:7, padding:"4px 14px", borderRadius:20,
              background:`${opLabel.col}16`, border:`1px solid ${opLabel.col}48`,
              fontFamily:"'JetBrains Mono', monospace", fontSize:isMobile?9:11, fontWeight:700,
              color:opLabel.col, animation:"opLabelIn 0.28s cubic-bezier(0.22,1,0.36,1) both",
              backdropFilter:"blur(8px)", boxShadow:`0 0 20px ${opLabel.col}22`,
            }}>
              <span style={{ fontSize:isMobile?10:12 }}>{opLabel.icon}</span>{opLabel.text}
            </span>
          )}
        </div>

        <div style={{ display:"flex", justifyContent:"center", alignItems:"center", gap:slotGap, height:slotSize, position:"relative" }}>
          {showArrows && (
            <div style={{ position:"absolute", left:-8, top:"50%", transform:"translateY(-50%)", display:"flex", flexDirection:"column", alignItems:"center", gap:3, opacity:0.45, pointerEvents:"none" }}>
              <div style={{ width:20, height:20, borderRadius:6, background:"rgba(244,114,182,0.15)", border:"1px solid rgba(244,114,182,0.35)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:"#f472b6" }}>←</div>
              <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:7, color:"#f472b6", letterSpacing:"0.05em" }}>OUT</span>
            </div>
          )}
          {slots.map((item, si) => {
            if (!item) return <div key={`slot-${si}`} style={{ width:slotSize, height:slotSize, borderRadius:14, flexShrink:0, opacity:0, pointerEvents:"none" }} />;
            const isFront = item.id === frontItem?.id && item.state !== "leaving";
            const isRear = item.id === rearItem?.id && item.state !== "leaving";
            const isLeaving = item.state === "leaving";
            const isEntering = item.state === "entering";
            return (
              <div key={item.id} style={{
                width:slotSize, height:slotSize, borderRadius:14, flexShrink:0, position:"relative",
                opacity: isLeaving ? 0 : isEntering ? 0 : 1,
                transform: isLeaving ? `translateX(-${slotGap*2}px) scale(0.78)` : isEntering ? "translateY(-18px) scale(0.82)" : "translateX(0) scale(1)",
                filter: isLeaving ? "blur(2px)" : "blur(0)",
                transition: "opacity 0.42s cubic-bezier(0.4,0,0.2,1), transform 0.42s cubic-bezier(0.34,1.28,0.64,1), filter 0.3s ease",
                background: `linear-gradient(145deg, ${item.col}1a, ${item.col}08)`,
                border: `1.5px solid ${isFront ? item.col : `${item.col}55`}`,
                boxShadow: isFront ? `0 0 24px ${item.col}50, 0 4px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)` : `0 2px 8px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)`,
                display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", backdropFilter:"blur(4px)",
              }}>
                <div style={{ position:"absolute", inset:0, borderRadius:13, background:"linear-gradient(145deg, rgba(255,255,255,0.07) 0%, transparent 55%)", pointerEvents:"none" }}/>
                <span style={{ fontFamily:"'JetBrains Mono', monospace", fontSize, fontWeight:700, color:item.col, lineHeight:1, position:"relative", zIndex:1 }}>{item.v}</span>
                {isFront && <span style={{ position:"absolute", bottom:-labelOffset, fontFamily:"'JetBrains Mono', monospace", fontSize:isMobile?7:8, fontWeight:700, color:item.col, letterSpacing:"0.06em", opacity:0.85, animation:"fadeIn 0.3s ease", whiteSpace:"nowrap" }}>FRONT</span>}
                {isRear && !isFront && <span style={{ position:"absolute", top:-labelOffset, fontFamily:"'JetBrains Mono', monospace", fontSize:isMobile?7:8, fontWeight:700, color:item.col, letterSpacing:"0.06em", opacity:0.85, animation:"fadeIn 0.3s ease", whiteSpace:"nowrap" }}>REAR</span>}
              </div>
            );
          })}
          {showArrows && (
            <div style={{ position:"absolute", right:-8, top:"50%", transform:"translateY(-50%)", display:"flex", flexDirection:"column", alignItems:"center", gap:3, opacity:0.45, pointerEvents:"none" }}>
              <div style={{ width:20, height:20, borderRadius:6, background:"rgba(74,222,128,0.15)", border:"1px solid rgba(74,222,128,0.35)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:"#4ade80" }}>→</div>
              <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:7, color:"#4ade80", letterSpacing:"0.05em" }}>IN</span>
            </div>
          )}
        </div>
        <div style={{ height: labelOffset + 4 }} />
        <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%, -50%)", width:"calc(100% - 32px)", height:railHeight, borderRadius:18, border:"1px solid rgba(255,255,255,0.04)", background:"rgba(255,255,255,0.012)", pointerEvents:"none", zIndex:-1, marginTop:22 }} />
        <div style={{ display:"flex", justifyContent:"center", gap:10, marginTop:isMobile?8:12 }}>
          <button onClick={() => setPaused(p => !p)} style={{
            padding:isMobile?"4px 14px":"6px 18px", borderRadius:22, cursor:"pointer",
            background:paused?"rgba(251,191,36,0.13)":"rgba(255,255,255,0.04)",
            border:`1px solid ${paused?"rgba(251,191,36,0.4)":"rgba(255,255,255,0.09)"}`,
            fontFamily:"'JetBrains Mono', monospace", fontSize:isMobile?8:9, fontWeight:700,
            color:paused?"#fbbf24":"#334155", transition:"all 0.2s", display:"flex", alignItems:"center", gap:6, letterSpacing:"0.06em",
          }}>{paused?"▶ RESUME":"⏸ PAUSE"}</button>
        </div>
        <div style={{ marginTop:10, fontFamily:"'JetBrains Mono', monospace", fontSize:isMobile?7:8, color:"#1e2a38", textAlign:"center", letterSpacing:"0.14em" }}>FIFO — FIRST IN, FIRST OUT</div>
      </div>

      <div style={{ maxWidth:620, position:"relative", width:"100%", padding:isMobile?"0 8px":0 }}>
        <div style={{ display:"inline-flex", alignItems:"center", gap:6, marginBottom:isMobile?16:20, padding:isMobile?"3px 12px":"5px 18px", borderRadius:40, background:"rgba(96,165,250,0.08)", border:"1px solid rgba(96,165,250,0.2)", fontFamily:"'JetBrains Mono', monospace", fontSize:isMobile?8:10, color:"#60a5fa", letterSpacing:"0.1em" }}>
          📋 {isMobile ? "INTERACTIVE GUIDE" : "INTERACTIVE VISUAL GUIDE · FOR COMPLETE BEGINNERS"}
        </div>
        <h1 style={{ margin:"0 0 12px", fontFamily:"'Syne', sans-serif", fontSize:"clamp(32px, 8vw, 78px)", fontWeight:800, letterSpacing:"-0.035em", lineHeight:1.02, background:"linear-gradient(145deg,#f8fafc 0%,#bfdbfe 30%,#86efac 65%,#f9a8d4 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
          Queue Data<br />Structures
        </h1>
        <p style={{ margin:"0 auto 24px", fontFamily:"'DM Sans', sans-serif", fontSize:"clamp(13px, 3.5vw, 18px)", color:"#64748b", lineHeight:1.6, maxWidth:500 }}>
          Every queue concept — animated, explained, narrated with a <strong style={{ color:"#93c5fd" }}>natural male voice</strong>. FIFO to circular queues and deques.
        </p>
        <div style={{ display:"flex", gap:isMobile?10:12, justifyContent:"center", flexWrap:"wrap" }}>
          <button onClick={onStart} style={{
            padding:isMobile?"10px 24px":"15px 36px", borderRadius:16, cursor:"pointer",
            background:"linear-gradient(135deg,#3b82f6 0%,#ec4899 100%)", border:"none",
            fontFamily:"'Syne', sans-serif", fontSize:isMobile?14:16, fontWeight:700, color:"#fff",
            boxShadow:"0 8px 36px rgba(59,130,246,0.45)", transition:"all 0.25s",
          }} onMouseEnter={(e) => { e.currentTarget.style.transform="translateY(-3px) scale(1.02)"; e.currentTarget.style.boxShadow="0 14px 48px rgba(59,130,246,0.6)"; }}
             onMouseLeave={(e) => { e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="0 8px 36px rgba(59,130,246,0.45)"; }}>Begin Learning ↓</button>
          <button onClick={onVoice} style={{
            padding:isMobile?"10px 20px":"15px 26px", borderRadius:16, cursor:"pointer",
            background:"rgba(255,255,255,0.05)", border:"1.5px solid rgba(255,255,255,0.15)",
            fontFamily:"'Syne', sans-serif", fontSize:isMobile?14:16, fontWeight:600, color:"#94a3b8",
            transition:"all 0.25s", display:"flex", alignItems:"center", gap:6,
          }} onMouseEnter={(e) => { e.currentTarget.style.background="rgba(255,255,255,0.1)"; e.currentTarget.style.color="#f8fafc"; }}
             onMouseLeave={(e) => { e.currentTarget.style.background="rgba(255,255,255,0.05)"; e.currentTarget.style.color="#94a3b8"; }}>
            <span style={{ fontSize:isMobile?16:18 }}>🔊</span> Hear Intro
          </button>
        </div>
        <div style={{ display:"flex", gap:4, justifyContent:"center", alignItems:"center", marginTop:16, flexWrap:"wrap" }}>
          <span style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:isMobile?8:9, color:"#2d3748", letterSpacing:"0.08em" }}>VOICE SPEED:</span>
          {[0.75,1.0,1.25,1.5,2.0].map(s => (
            <button key={s} onClick={() => { currentRate = s; }} style={{
              padding:isMobile?"2px 8px":"4px 11px", borderRadius:20, cursor:"pointer",
              background:currentRate===s?"rgba(96,165,250,0.18)":"rgba(255,255,255,0.04)",
              border:`1px solid ${currentRate===s?"rgba(96,165,250,0.5)":"rgba(255,255,255,0.08)"}`,
              fontFamily:"'JetBrains Mono', monospace", fontSize:isMobile?8:9, fontWeight:700,
              color:currentRate===s?"#93c5fd":"#2d3748", transition:"all 0.18s",
            }}>{s}×</button>
          ))}
        </div>
        <div style={{ display:"flex", gap:isMobile?16:28, justifyContent:"center", marginTop:isMobile?24:44, flexWrap:"wrap" }}>
          {[["8","Sections"],["6+","Animations"],["6","Quiz Qs"],["O(1)","All Ops"]].map(([n,l]) => (
            <div key={l} style={{ textAlign:"center" }}>
              <div style={{ fontFamily:"'Syne', sans-serif", fontSize:isMobile?24:28, fontWeight:800, background:"linear-gradient(135deg,#93c5fd,#86efac)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>{n}</div>
              <div style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:isMobile?7:9, color:"#2d3748", letterSpacing:"0.1em", marginTop:3 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── SECTION WRAPPER ─────────────────────────────────────────────────────────
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
        <div style={{ width:50,height:50,borderRadius:16,flexShrink:0,background:`${color}14`,border:`1px solid ${color}38`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,boxShadow:`0 0 28px ${color}18` }}>{icon}</div>
        <h2 style={{ flex:1,margin:0,minWidth:0,fontFamily:"'Syne',sans-serif",fontSize:"clamp(19px,3.8vw,30px)",fontWeight:800,color:"#f8fafc",letterSpacing:"-0.022em",lineHeight:1.15 }}>{title}</h2>
        <div style={{ display:"flex",alignItems:"center",gap:8,flexShrink:0 }}>
          <CompletedBadge seen={seen}/>
          <button onClick={() => onVoice(id, voice)} style={{
            display:"flex",alignItems:"center",gap:6,padding:"7px 14px",borderRadius:28,cursor:"pointer",
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
        <div style={{ padding:20,borderRadius:22,background:"linear-gradient(150deg,rgba(255,255,255,0.028) 0%,rgba(0,0,0,0.22) 100%)",border:`1px solid ${color}18`,boxShadow:`0 0 64px ${color}09`,minWidth:0 }}>{visual}</div>
        <div style={{ display:"flex",flexDirection:"column",gap:9,minWidth:0 }}>
          {cards.map((c,i) => (
            <div key={i} style={{ padding:"12px 14px",borderRadius:13,background:"rgba(255,255,255,0.022)",border:"1px solid rgba(255,255,255,0.052)",borderLeft:`3px solid ${color}55`,animation:vis?`sRight 0.5s cubic-bezier(0.22,1,0.36,1) ${0.1+i*0.1}s both`:"none" }}>
              {c.lbl && <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:8.5,fontWeight:700,color,letterSpacing:"0.12em",marginBottom:5,opacity:0.88 }}>{c.lbl}</div>}
              <div style={{ fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#94a3b8",lineHeight:1.68 }}>{c.body}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── VISUAL COMPONENTS ────────────────────────────────────────────────────────
// (VisIntro, VisOps, VisImpl, VisTypes, VisCircular, VisDeque, VisApplications,
//  ComplexityTable, ShortcutsModal, Confetti, Quiz)
// Place them here exactly as provided in your original queue code.
// For brevity, we'll include them now.

function VisIntro() {
  const [queue, setQueue] = useState([10, 20, 30]);
  const [log, setLog] = useState([]);
  const [inputVal, setInputVal] = useState("");
  const addLog = (msg) => setLog(l => [msg, ...l].slice(0, 5));
  const enqueue = () => {
    const val = parseInt(inputVal);
    if (isNaN(val)) return;
    setQueue(q => [...q, val]);
    addLog(`ENQUEUE(${val}) → rear now ${val}`);
    setInputVal("");
  };
  const dequeue = () => {
    if (queue.length === 0) return;
    const front = queue[0];
    setQueue(q => q.slice(1));
    addLog(`DEQUEUE() → returned ${front}`);
  };
  const front = () => {
    if (queue.length === 0) return;
    addLog(`FRONT() → ${queue[0]} (unchanged)`);
  };
  const clear = () => {
    setQueue([]);
    addLog("CLEAR → queue empty");
  };
  return (
    <div>
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        <div style={{ display:"flex", gap:6, alignItems:"center", justifyContent:"center", flexWrap:"wrap" }}>
          {queue.map((v, i) => (
            <div key={i} style={{
              width:48, height:48, borderRadius:8,
              background:i===0?"rgba(96,165,250,0.2)":"rgba(255,255,255,0.04)",
              border:`2px solid ${i===0?"#60a5fa":"rgba(255,255,255,0.1)"}`,
              display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
              position:"relative",
            }}>
              <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:16, fontWeight:700, color:i===0?"#60a5fa":"#94a3b8" }}>{v}</span>
              {i===0 && <span style={{ position:"absolute", bottom:-20, fontSize:8, fontFamily:"'JetBrains Mono',monospace", color:"#60a5fa" }}>FRONT</span>}
              {i===queue.length-1 && <span style={{ position:"absolute", top:-20, fontSize:8, fontFamily:"'JetBrains Mono',monospace", color:"#4ade80" }}>REAR</span>}
            </div>
          ))}
          {queue.length === 0 && (
            <div style={{ width:120, padding:12, textAlign:"center", borderRadius:8, border:"1px dashed rgba(255,255,255,0.2)", fontFamily:"'JetBrains Mono',monospace", fontSize:12, color:"#475569" }}>EMPTY</div>
          )}
        </div>

        <div style={{ display:"flex", gap:5, justifyContent:"center", flexWrap:"wrap" }}>
          <input value={inputVal} onChange={e=>setInputVal(e.target.value)} onKeyDown={e=>e.key==="Enter"&&enqueue()} placeholder="value"
            style={{ width:70, padding:"5px 8px", borderRadius:8, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", fontFamily:"'JetBrains Mono',monospace", color:"#f8fafc", outline:"none" }}/>
          <button onClick={enqueue} style={{ padding:"5px 12px", borderRadius:20, background:"rgba(74,222,128,0.15)", border:"1px solid rgba(74,222,128,0.3)", fontFamily:"'JetBrains Mono',monospace", fontSize:9, fontWeight:700, color:"#4ade80" }}>ENQUEUE</button>
          <button onClick={dequeue} disabled={queue.length===0} style={{ padding:"5px 12px", borderRadius:20, background:"rgba(244,114,182,0.15)", border:"1px solid rgba(244,114,182,0.3)", fontFamily:"'JetBrains Mono',monospace", fontSize:9, fontWeight:700, color:queue.length?"#f472b6":"#2d3748" }}>DEQUEUE</button>
          <button onClick={front} disabled={queue.length===0} style={{ padding:"5px 12px", borderRadius:20, background:"rgba(96,165,250,0.12)", border:"1px solid rgba(96,165,250,0.3)", fontFamily:"'JetBrains Mono',monospace", fontSize:9, fontWeight:700, color:queue.length?"#60a5fa":"#2d3748" }}>FRONT</button>
          <button onClick={clear} disabled={queue.length===0} style={{ padding:"5px 12px", borderRadius:20, background:"rgba(251,146,60,0.12)", border:"1px solid rgba(251,146,60,0.3)", fontFamily:"'JetBrains Mono',monospace", fontSize:9, fontWeight:700, color:queue.length?"#fb923c":"#2d3748" }}>CLEAR</button>
        </div>

        <div style={{ marginTop:4, padding:"8px 12px", borderRadius:10, background:"rgba(0,0,0,0.3)", border:"1px solid rgba(255,255,255,0.06)" }}>
          {log.map((l,i) => <div key={i} style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:i===0?"#60a5fa":"#2d3748", padding:"1px 0" }}>{l}</div>)}
        </div>
      </div>
    </div>
  );
}

function VisOps() {
  const [active, setActive] = useState(null);
  const OPS = [
    { name:"Enqueue", icon:"⬇️", color:"#4ade80", time:"O(1)", desc:"Adds element to the rear. Increment rear pointer.", code:"queue.append(val)  # Python\nqueue.enqueue(val); // Java", steps:["New element arrives","Place at rear","Increment rear","Done in O(1)"] },
    { name:"Dequeue", icon:"⬆️", color:"#f472b6", time:"O(1)", desc:"Removes and returns front element. Increment front pointer.", code:"queue.pop(0)        # Python (inefficient!)\nqueue.dequeue();    // Java", steps:["Check not empty","Save front value","Increment front","Return saved value"] },
    { name:"Front",   icon:"👁️", color:"#60a5fa", time:"O(1)", desc:"Returns front element without removing.", code:"queue[0]            # Python\nqueue.front();      // Java", steps:["Check not empty","Read front index","Return element","Queue unchanged"] },
    { name:"isEmpty", icon:"∅",   color:"#fb923c", time:"O(1)", desc:"Returns true if queue is empty.", code:"len(queue)==0       # Python\nqueue.isEmpty();    // Java", steps:["Read size/pointers","Compare to zero","Return boolean","Pure O(1)"] },
  ];
  const sel = OPS.find(o => o.name === active);
  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:14 }}>
        {OPS.map(op => (
          <button key={op.name} onClick={() => setActive(active===op.name?null:op.name)} style={{
            padding:"10px 12px", borderRadius:12, cursor:"pointer", textAlign:"left",
            background:active===op.name?`${op.color}18`:"rgba(255,255,255,0.03)",
            border:`1.5px solid ${active===op.name?op.color:"rgba(255,255,255,0.07)"}`,
            transition:"all 0.25s", display:"flex", alignItems:"center", gap:8,
          }}>
            <span style={{ fontSize:20 }}>{op.icon}</span>
            <div>
              <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, fontWeight:700, color:active===op.name?op.color:"#94a3b8" }}>{op.name}</div>
              <div style={{ display:"inline-block", marginTop:3, padding:"1px 8px", borderRadius:20, background:`${op.color}15`, border:`1px solid ${op.color}30`, fontFamily:"'JetBrains Mono',monospace", fontSize:9, fontWeight:700, color:op.color }}>{op.time}</div>
            </div>
          </button>
        ))}
      </div>
      {sel ? (
        <div style={{ padding:"14px 16px", borderRadius:14, background:`${sel.color}09`, border:`1px solid ${sel.color}25`, animation:"fUp 0.3s ease both" }}>
          <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:"#94a3b8", marginBottom:10, lineHeight:1.6 }}>{sel.desc}</p>
          <div style={{ display:"flex", gap:5, marginBottom:10, flexWrap:"wrap" }}>
            {sel.steps.map((s,i) => (
              <div key={i} style={{ padding:"4px 10px", borderRadius:20, background:`${sel.color}12`, border:`1px solid ${sel.color}25`, fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:sel.color, animation:`sRight 0.35s ease ${i*0.08}s both` }}>
                <span style={{ opacity:0.5, marginRight:5 }}>{i+1}.</span>{s}
              </div>
            ))}
          </div>
          <div style={{ padding:"10px 14px", borderRadius:10, background:"rgba(0,0,0,0.4)", border:"1px solid rgba(255,255,255,0.06)" }}>
            <pre style={{ margin:0, fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:"#94a3b8", lineHeight:1.7, whiteSpace:"pre-wrap" }}>{sel.code}</pre>
          </div>
        </div>
      ) : (
        <div style={{ padding:14, borderRadius:14, background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.05)", textAlign:"center" }}>
          <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:"#1e2a38", letterSpacing:"0.08em" }}>SELECT AN OPERATION ABOVE</p>
        </div>
      )}
    </div>
  );
}

function VisImpl() {
  const [mode, setMode] = useState("array");
  const queue = [10, 20, 30, 40];
  return (
    <div>
      <div style={{ display:"flex", gap:7, justifyContent:"center", marginBottom:14 }}>
        {[["array","[ ] Array"],["linked","↔ Linked List"]].map(([m,lbl]) => (
          <button key={m} onClick={() => setMode(m)} style={{
            padding:"6px 14px", borderRadius:20, cursor:"pointer",
            background:mode===m?"rgba(244,114,182,0.2)":"rgba(255,255,255,0.04)",
            border:`1px solid ${mode===m?"#f472b6":"rgba(255,255,255,0.1)"}`,
            fontFamily:"'JetBrains Mono',monospace", fontSize:10, fontWeight:700,
            color:mode===m?"#f472b6":"#475569", transition:"all 0.22s",
          }}>{lbl}</button>
        ))}
      </div>
      {mode === "array" ? (
        <div>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:0, marginBottom:16 }}>
            {queue.map((v,i) => (
              <div key={i} style={{
                width:48, height:48, border:`1.5px solid ${i===0?"#60a5fa":i===queue.length-1?"#4ade80":"rgba(255,255,255,0.1)"}`,
                background:`rgba(96,165,250,0.05)`, display:"flex", alignItems:"center", justifyContent:"center",
                borderTopLeftRadius: i===0?8:0, borderBottomLeftRadius: i===0?8:0,
                borderTopRightRadius: i===queue.length-1?8:0, borderBottomRightRadius: i===queue.length-1?8:0,
              }}>
                <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:14, fontWeight:700, color:i===0?"#60a5fa":i===queue.length-1?"#4ade80":"#94a3b8" }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ display:"flex", justifyContent:"center", gap:24, marginBottom:12 }}>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:"#60a5fa" }}>FRONT pointer</div>
              <div style={{ fontSize:12, fontFamily:"'JetBrains Mono',monospace", color:"#60a5fa" }}>index 0</div>
            </div>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:"#4ade80" }}>REAR pointer</div>
              <div style={{ fontSize:12, fontFamily:"'JetBrains Mono',monospace", color:"#4ade80" }}>index {queue.length-1}</div>
            </div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:5, marginTop:12 }}>
            <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:"#4ade80" }}>✓ Cache-friendly</div>
            <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:"#4ade80" }}>✓ O(1) access</div>
            <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:"#f87171" }}>✗ Fixed capacity (wastes space if not circular)</div>
          </div>
        </div>
      ) : (
        <div>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:0, flexWrap:"wrap" }}>
            {queue.map((v,i) => (
              <div key={i} style={{ display:"flex", alignItems:"center" }}>
                <div style={{
                  padding:"8px 12px", borderRadius:8, background:"rgba(96,165,250,0.05)", border:`1px solid ${i===0?"#60a5fa":i===queue.length-1?"#4ade80":"rgba(255,255,255,0.1)"}`,
                  fontFamily:"'JetBrains Mono',monospace", fontSize:14, fontWeight:700, color:i===0?"#60a5fa":i===queue.length-1?"#4ade80":"#94a3b8"
                }}>{v}</div>
                {i < queue.length-1 && <div style={{ margin:"0 4px", color:"#2d3748", fontSize:10 }}>→</div>}
              </div>
            ))}
          </div>
          <div style={{ display:"flex", justifyContent:"center", gap:24, marginTop:12 }}>
            <div><span style={{ color:"#60a5fa" }}>HEAD</span> (front)</div>
            <div><span style={{ color:"#4ade80" }}>TAIL</span> (rear)</div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:5, marginTop:12 }}>
            <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:"#4ade80" }}>✓ Dynamic size</div>
            <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:"#4ade80" }}>✓ No wasted memory</div>
            <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:"#f87171" }}>✗ Extra pointer per node</div>
          </div>
        </div>
      )}
    </div>
  );
}

function VisTypes() {
  const [tab, setTab] = useState("simple");
  return (
    <div>
      <div style={{ display:"flex", gap:5, justifyContent:"center", marginBottom:14, flexWrap:"wrap" }}>
        {[
          { id:"simple", label:"Simple", icon:"📋", col:"#60a5fa" },
          { id:"circular", label:"Circular", icon:"🔄", col:"#34d399" },
          { id:"deque", label:"Deque", icon:"↔️", col:"#f59e0b" },
          { id:"priority", label:"Priority", icon:"⭐", col:"#a78bfa" },
        ].map(t => (
          <button key={t.id} onClick={()=>setTab(t.id)} style={{
            padding:"5px 12px", borderRadius:20, cursor:"pointer",
            background:tab===t.id?`${t.col}18`:"rgba(255,255,255,0.04)",
            border:`1px solid ${tab===t.id?t.col:"rgba(255,255,255,0.1)"}`,
            fontFamily:"'JetBrains Mono',monospace", fontSize:9, fontWeight:700,
            color:tab===t.id?t.col:"#475569", transition:"all 0.2s",
          }}>{t.icon} {t.label}</button>
        ))}
      </div>
      <div style={{ padding:12, borderRadius:14, background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)" }}>
        {tab === "simple" && (
          <div>
            <div style={{ display:"flex", gap:8, justifyContent:"center", marginBottom:8 }}>
              {[10,20,30].map((v,i) => (
                <div key={i} style={{ width:44, height:44, borderRadius:8, background:"rgba(96,165,250,0.1)", border:`1px solid ${i===0?"#60a5fa":"rgba(96,165,250,0.3)"}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:14, fontWeight:700, color:i===0?"#60a5fa":"#94a3b8" }}>{v}</span>
                </div>
              ))}
            </div>
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:"#94a3b8", textAlign:"center" }}>Basic FIFO — enqueue rear, dequeue front</p>
          </div>
        )}
        {tab === "circular" && (
          <div>
            <div style={{ display:"flex", justifyContent:"center", gap:8 }}>
              <div style={{ width:44, height:44, borderRadius:8, background:"rgba(52,211,153,0.1)", border:"2px solid #34d399", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:14, fontWeight:700, color:"#34d399" }}>F</span>
              </div>
              <div style={{ width:44, height:44, borderRadius:8, background:"rgba(52,211,153,0.05)", border:"1px solid rgba(52,211,153,0.3)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:14, color:"#94a3b8" }}>20</span>
              </div>
              <div style={{ width:44, height:44, borderRadius:8, background:"rgba(52,211,153,0.05)", border:"1px solid rgba(52,211,153,0.3)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:14, color:"#94a3b8" }}>30</span>
              </div>
              <div style={{ width:44, height:44, borderRadius:8, background:"rgba(52,211,153,0.1)", border:"2px solid #34d399", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:14, fontWeight:700, color:"#34d399" }}>R</span>
              </div>
            </div>
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:"#94a3b8", textAlign:"center", marginTop:8 }}>Reuses space by wrapping around — ring buffer</p>
          </div>
        )}
        {tab === "deque" && (
          <div>
            <div style={{ display:"flex", gap:8, justifyContent:"center", alignItems:"center" }}>
              <button style={{ padding:"5px 8px", borderRadius:20, background:"rgba(245,158,11,0.15)", border:"1px solid rgba(245,158,11,0.3)", fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:"#f59e0b" }}>push_front</button>
              <div style={{ display:"flex", gap:4 }}>
                <div style={{ width:44, height:44, borderRadius:8, background:"rgba(245,158,11,0.1)", border:"1px solid #f59e0b", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:14, color:"#f59e0b" }}>F</span>
                </div>
                <div style={{ width:44, height:44, borderRadius:8, background:"rgba(245,158,11,0.05)", border:"1px solid rgba(245,158,11,0.3)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:14, color:"#94a3b8" }}>20</span>
                </div>
                <div style={{ width:44, height:44, borderRadius:8, background:"rgba(245,158,11,0.05)", border:"1px solid rgba(245,158,11,0.3)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:14, color:"#94a3b8" }}>30</span>
                </div>
                <div style={{ width:44, height:44, borderRadius:8, background:"rgba(245,158,11,0.1)", border:"1px solid #f59e0b", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:14, color:"#f59e0b" }}>R</span>
                </div>
              </div>
              <button style={{ padding:"5px 8px", borderRadius:20, background:"rgba(245,158,11,0.15)", border:"1px solid rgba(245,158,11,0.3)", fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:"#f59e0b" }}>pop_back</button>
            </div>
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:"#94a3b8", textAlign:"center", marginTop:8 }}>Double‑ended — insert/remove at both ends, O(1)</p>
          </div>
        )}
        {tab === "priority" && (
          <div>
            <div style={{ display:"flex", gap:8, justifyContent:"center" }}>
              <div style={{ width:44, height:44, borderRadius:8, background:"rgba(167,139,250,0.1)", border:"1px solid #a78bfa", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:14, color:"#a78bfa" }}>3</span>
              </div>
              <div style={{ width:44, height:44, borderRadius:8, background:"rgba(167,139,250,0.05)", border:"1px solid rgba(167,139,250,0.3)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:14, color:"#94a3b8" }}>1</span>
              </div>
              <div style={{ width:44, height:44, borderRadius:8, background:"rgba(167,139,250,0.05)", border:"1px solid rgba(167,139,250,0.3)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:14, color:"#94a3b8" }}>2</span>
              </div>
            </div>
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:"#94a3b8", textAlign:"center", marginTop:8 }}>Elements ordered by priority (often max‑heap)</p>
          </div>
        )}
      </div>
    </div>
  );
}

function VisCircular() {
  const CAP = 6;
  const [arr, setArr] = useState(Array(CAP).fill(null));
  const [front, setFront] = useState(0);
  const [rear, setRear] = useState(0);
  const [size, setSize] = useState(0);
  const [log, setLog] = useState([]);

  const enqueue = (val) => {
    if (size === CAP) { addLog("FULL! Cannot enqueue."); return; }
    const newArr = [...arr];
    newArr[rear] = val;
    setArr(newArr);
    setRear((rear + 1) % CAP);
    setSize(s => s + 1);
    addLog(`ENQUEUE ${val} at index ${rear}`);
  };
  const dequeue = () => {
    if (size === 0) { addLog("EMPTY! Cannot dequeue."); return; }
    const val = arr[front];
    const newArr = [...arr];
    newArr[front] = null;
    setArr(newArr);
    setFront((front + 1) % CAP);
    setSize(s => s - 1);
    addLog(`DEQUEUE ${val} from index ${front}`);
  };
  const addLog = (msg) => setLog(l => [msg, ...l].slice(0, 4));

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"center", gap:4, marginBottom:12 }}>
        {arr.map((v,i) => (
          <div key={i} style={{
            width:48, height:48, borderRadius:8,
            background: v!==null ? "rgba(52,211,153,0.15)" : "rgba(255,255,255,0.03)",
            border: `2px solid ${i===front ? "#60a5fa" : i===rear ? "#4ade80" : "rgba(255,255,255,0.1)"}`,
            display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
            position:"relative",
          }}>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:16, fontWeight:700, color: v!==null ? "#34d399" : "#2d3748" }}>{v !== null ? v : "—"}</span>
            <span style={{ position:"absolute", bottom:-18, fontSize:8, fontFamily:"'JetBrains Mono',monospace", color:"#2d3748" }}>{i}</span>
            {i===front && <span style={{ position:"absolute", top:-20, fontSize:8, fontFamily:"'JetBrains Mono',monospace", color:"#60a5fa" }}>F</span>}
            {i===rear && <span style={{ position:"absolute", top:-20, fontSize:8, fontFamily:"'JetBrains Mono',monospace", color:"#4ade80" }}>R</span>}
          </div>
        ))}
      </div>
      <div style={{ display:"flex", gap:8, justifyContent:"center", marginBottom:8 }}>
        <button onClick={() => enqueue(Math.floor(Math.random()*90)+10)} disabled={size===CAP} style={{ padding:"5px 12px", borderRadius:20, background:"rgba(74,222,128,0.15)", border:"1px solid rgba(74,222,128,0.3)", fontFamily:"'JetBrains Mono',monospace", fontSize:9, fontWeight:700, color:size===CAP?"#2d3748":"#4ade80" }}>ENQUEUE</button>
        <button onClick={dequeue} disabled={size===0} style={{ padding:"5px 12px", borderRadius:20, background:"rgba(244,114,182,0.15)", border:"1px solid rgba(244,114,182,0.3)", fontFamily:"'JetBrains Mono',monospace", fontSize:9, fontWeight:700, color:size===0?"#2d3748":"#f472b6" }}>DEQUEUE</button>
      </div>
      <div style={{ marginTop:8, padding:"6px 10px", borderRadius:8, background:"rgba(0,0,0,0.3)", border:"1px solid rgba(255,255,255,0.06)" }}>
        {log.map((l,i) => <div key={i} style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:i===0?"#34d399":"#2d3748" }}>{l}</div>)}
      </div>
      <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:8, color:"#2d3748", marginTop:8, textAlign:"center" }}>Circular buffer: (rear+1) % CAP == front → FULL</p>
    </div>
  );
}

function VisDeque() {
  const [deque, setDeque] = useState([10,20,30]);
  const [log, setLog] = useState([]);
  const addLog = (msg) => setLog(l => [msg, ...l].slice(0,4));
  const pushFront = () => {
    const val = Math.floor(Math.random()*90)+10;
    setDeque([val, ...deque]);
    addLog(`push_front(${val})`);
  };
  const pushBack = () => {
    const val = Math.floor(Math.random()*90)+10;
    setDeque([...deque, val]);
    addLog(`push_back(${val})`);
  };
  const popFront = () => {
    if (deque.length===0) return;
    const val = deque[0];
    setDeque(deque.slice(1));
    addLog(`pop_front() → ${val}`);
  };
  const popBack = () => {
    if (deque.length===0) return;
    const val = deque[deque.length-1];
    setDeque(deque.slice(0,-1));
    addLog(`pop_back() → ${val}`);
  };
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"center", gap:8, marginBottom:12 }}>
        {deque.map((v,i) => (
          <div key={i} style={{
            width:48, height:48, borderRadius:8,
            background:i===0||i===deque.length-1?"rgba(245,158,11,0.15)":"rgba(255,255,255,0.03)",
            border:`2px solid ${i===0||i===deque.length-1?"#f59e0b":"rgba(255,255,255,0.1)"}`,
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:16, fontWeight:700, color:i===0||i===deque.length-1?"#f59e0b":"#94a3b8" }}>{v}</span>
          </div>
        ))}
      </div>
      <div style={{ display:"flex", gap:6, justifyContent:"center", flexWrap:"wrap", marginBottom:8 }}>
        <button onClick={pushFront} style={{ padding:"5px 12px", borderRadius:20, background:"rgba(245,158,11,0.15)", border:"1px solid rgba(245,158,11,0.3)", fontFamily:"'JetBrains Mono',monospace", fontSize:9, fontWeight:700, color:"#f59e0b" }}>← PUSH FRONT</button>
        <button onClick={popFront} disabled={deque.length===0} style={{ padding:"5px 12px", borderRadius:20, background:"rgba(245,158,11,0.12)", border:"1px solid rgba(245,158,11,0.3)", fontFamily:"'JetBrains Mono',monospace", fontSize:9, fontWeight:700, color:deque.length?"#f59e0b":"#2d3748" }}>POP FRONT →</button>
        <button onClick={popBack} disabled={deque.length===0} style={{ padding:"5px 12px", borderRadius:20, background:"rgba(245,158,11,0.12)", border:"1px solid rgba(245,158,11,0.3)", fontFamily:"'JetBrains Mono',monospace", fontSize:9, fontWeight:700, color:deque.length?"#f59e0b":"#2d3748" }}>← POP BACK</button>
        <button onClick={pushBack} style={{ padding:"5px 12px", borderRadius:20, background:"rgba(245,158,11,0.15)", border:"1px solid rgba(245,158,11,0.3)", fontFamily:"'JetBrains Mono',monospace", fontSize:9, fontWeight:700, color:"#f59e0b" }}>PUSH BACK →</button>
      </div>
      <div style={{ padding:"6px 10px", borderRadius:8, background:"rgba(0,0,0,0.3)", border:"1px solid rgba(255,255,255,0.06)" }}>
        {log.map((l,i) => <div key={i} style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:i===0?"#f59e0b":"#2d3748" }}>{l}</div>)}
      </div>
      <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:8, color:"#2d3748", marginTop:8, textAlign:"center" }}>Double-ended queue: O(1) ops at both ends</p>
    </div>
  );
}

function VisApplications() {
  const [queue, setQueue] = useState(["Task A","Task B","Task C"]);
  const [processed, setProcessed] = useState([]);
  const [processing, setProcessing] = useState(false);
  const process = () => {
    if (processing || queue.length===0) return;
    setProcessing(true);
    const task = queue[0];
    setTimeout(() => {
      setQueue(q => q.slice(1));
      setProcessed(p => [task, ...p].slice(0,4));
      setProcessing(false);
    }, 1000);
  };
  const addTask = () => {
    const newTask = `Task ${String.fromCharCode(65 + queue.length)}`;
    setQueue(q => [...q, newTask]);
  };
  return (
    <div>
      <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:8.5, color:"#2d3748", marginBottom:8 }}>TASK SCHEDULER — FIFO</div>
      <div style={{ display:"flex", gap:20, justifyContent:"center" }}>
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:"#60a5fa", marginBottom:4 }}>PENDING</div>
          {queue.map((t,i) => (
            <div key={i} style={{ padding:"5px 8px", margin:"4px 0", borderRadius:6, background:i===0?"rgba(96,165,250,0.15)":"rgba(255,255,255,0.03)", border:`1px solid ${i===0?"#60a5fa":"rgba(255,255,255,0.06)"}` }}>
              <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:i===0?"#60a5fa":"#94a3b8" }}>{t}</span>
            </div>
          ))}
          {queue.length===0 && <div style={{ padding:"5px", fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:"#2d3748" }}>empty</div>}
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:"#4ade80", marginBottom:4 }}>PROCESSED</div>
          {processed.map((t,i) => (
            <div key={i} style={{ padding:"5px 8px", margin:"4px 0", borderRadius:6, background:"rgba(74,222,128,0.08)", border:"1px solid rgba(74,222,128,0.2)" }}>
              <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:"#4ade80" }}>{t}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display:"flex", gap:8, justifyContent:"center", marginTop:12 }}>
        <button onClick={process} disabled={processing || queue.length===0} style={{ padding:"5px 12px", borderRadius:20, background:"rgba(74,222,128,0.15)", border:"1px solid rgba(74,222,128,0.3)", fontFamily:"'JetBrains Mono',monospace", fontSize:9, fontWeight:700, color:queue.length?"#4ade80":"#2d3748" }}>PROCESS NEXT</button>
        <button onClick={addTask} style={{ padding:"5px 12px", borderRadius:20, background:"rgba(96,165,250,0.12)", border:"1px solid rgba(96,165,250,0.3)", fontFamily:"'JetBrains Mono',monospace", fontSize:9, fontWeight:700, color:"#60a5fa" }}>ADD TASK</button>
      </div>
    </div>
  );
}

function ComplexityTable() {
  const [hov, setHov] = useState(null);
  const rows = [
    { nm:"Enqueue",       c:"#4ade80", avg:"O(1)", wc:"O(1)*", sp:"O(1)", n:"Amortized O(1) for dynamic array. Linked list always O(1)." },
    { nm:"Dequeue",       c:"#4ade80", avg:"O(1)", wc:"O(1)",   sp:"O(1)", n:"Simple pointer increment (array) or head move (linked list)." },
    { nm:"Front / Peek",  c:"#4ade80", avg:"O(1)", wc:"O(1)",   sp:"O(1)", n:"Read front pointer — no traversal needed." },
    { nm:"isEmpty",       c:"#4ade80", avg:"O(1)", wc:"O(1)",   sp:"O(1)", n:"Check size or front==rear." },
    { nm:"Search",        c:"#ef4444", avg:"O(n)", wc:"O(n)",   sp:"O(1)", n:"Must scan all elements — use a different structure for search." },
    { nm:"Space",         c:"#60a5fa", avg:"O(n)", wc:"O(n)",   sp:"—",    n:"Proportional to number of elements." },
  ];
  return (
    <div style={{ overflowX:"auto" }}>
      <table style={{ width:"100%", borderCollapse:"collapse", minWidth:480 }}>
        <thead>
          <tr>
            {["Operation","Average","Worst Case","Space","Notes"].map(h => (
              <th key={h} style={{ padding:"10px 14px", textAlign:"left", fontFamily:"'JetBrains Mono',monospace", fontSize:9, letterSpacing:"0.1em", color:"#2d3748", borderBottom:"1px solid rgba(255,255,255,0.06)", fontWeight:700, whiteSpace:"nowrap" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r,i) => (
            <tr key={i} onMouseEnter={()=>setHov(i)} onMouseLeave={()=>setHov(null)}
              style={{ borderBottom:"1px solid rgba(255,255,255,0.04)", background:hov===i?"rgba(255,255,255,0.025)":"transparent", transition:"background 0.2s" }}>
              <td style={{ padding:"10px 14px", whiteSpace:"nowrap" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ width:7, height:7, borderRadius:"50%", background:r.c, flexShrink:0, boxShadow:hov===i?`0 0 8px ${r.c}`:"none", transition:"box-shadow 0.2s" }}/>
                  <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, fontWeight:700, color:"#e2e8f0" }}>{r.nm}</span>
                </div>
              </td>
              {[r.avg, r.wc, r.sp].map((v,j) => (
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

function Confetti() {
  const pieces = Array.from({ length: 32 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.8,
    dur: 1.8 + Math.random() * 1.2,
    color: ["#60a5fa","#4ade80","#f472b6","#fbbf24","#a78bfa","#fb923c"][i % 6],
    size: 6 + Math.random() * 6,
  }));
  return (
    <div style={{ position:"fixed",inset:0,pointerEvents:"none",zIndex:3000,overflow:"hidden" }}>
      {pieces.map(p => (
        <div key={p.id} style={{
          position:"absolute", top:"-10%", left:`${p.x}%`,
          width:p.size, height:p.size, borderRadius:p.id%3===0?"50%":2,
          background:p.color,
          animation:`confettiFall ${p.dur}s ease-in ${p.delay}s both`,
        }}/>
      ))}
    </div>
  );
}

function Quiz({ onDone }) {
  const QS = [
    { q:"A queue follows which ordering principle?", opts:["FIFO","LIFO","FILO","Priority"], ans:0, exp:"FIFO — First In, First Out. The first element added is the first to be removed." },
    { q:"What is the time complexity of DEQUEUE on a queue?", opts:["O(n)","O(log n)","O(1)","O(n²)"], ans:2, exp:"O(1). Dequeue removes the front element by simply advancing the front pointer (array) or moving head (linked list)." },
    { q:"Which queue variant reuses space by wrapping around?", opts:["Priority queue","Deque","Circular queue","Simple queue"], ans:2, exp:"Circular queue connects the end to the front, allowing reuse of freed space." },
    { q:"What data structure is used for BFS (Breadth-First Search)?", opts:["Stack","Queue","Priority queue","Deque"], ans:1, exp:"BFS uses a queue to explore nodes level by level." },
    { q:"A deque allows:", opts:["Only insertion at front","Only deletion at rear","Insertion and deletion at both ends","Only peek"], ans:2, exp:"Deque = double-ended queue. Supports O(1) push/pop at both ends." },
    { q:"What is the condition for a circular queue being full (array of size N, front and rear pointers)?", opts:["front == rear","(rear+1)%N == front","rear == N-1","front == (rear+1)%N"], ans:1, exp:"In a circular queue, (rear+1)%N == front indicates full (one slot kept empty to differentiate from empty)." },
  ];
  const [ans, setAns] = useState({});
  const [rev, setRev] = useState({});
  const score = Object.entries(ans).filter(([qi,ai]) => QS[+qi].ans === +ai).length;
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
                {q.opts.map((opt,oi) => {
                  const isSel=ans[qi]===oi, isCorr=q.ans===oi;
                  let bg="rgba(255,255,255,0.03)", brd="rgba(255,255,255,0.07)", col="#64748b";
                  if (isR) {
                    if (isCorr){ bg="rgba(74,222,128,0.12)"; brd="rgba(74,222,128,0.38)"; col="#4ade80"; }
                    else if (isSel){ bg="rgba(239,68,68,0.12)"; brd="rgba(239,68,68,0.38)"; col="#f87171"; }
                    else col="#2d3748";
                  } else if (isSel){ bg="rgba(96,165,250,0.12)"; brd="rgba(96,165,250,0.38)"; col="#93c5fd"; }
                  return (
                    <button key={oi} onClick={() => !isR&&setAns(a=>({...a,[qi]:oi}))} style={{
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
              {ans[qi]!==undefined&&!isR && (
                <button onClick={() => setRev(r=>({...r,[qi]:true}))} style={{ marginTop:10, padding:"6px 18px", borderRadius:20, cursor:"pointer", background:"rgba(96,165,250,0.12)", border:"1px solid rgba(96,165,250,0.3)", fontFamily:"'JetBrains Mono',monospace", fontSize:9, fontWeight:700, color:"#60a5fa" }}>CHECK →</button>
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

// ── MAIN PAGE (with RightSidebar) ────────────────────────────────────────────
export default function QueuePage() {
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
    { id:"intro", icon:"📋", title:"What is a Queue?", color:"#60a5fa", voice:NARR.intro,
      visual:<VisIntro/>, cards:[
        { lbl:"FIFO RULE", body:"First In, First Out — the defining property. The first element added is always the first to be removed." },
        { lbl:"REAL-WORLD ANALOGY", body:"A line of people at a ticket counter. The first person in line gets served first." },
        { lbl:"WHERE QUEUES APPEAR", body:"Task scheduling, BFS in graphs, print spoolers, keyboard buffers, message queues." },
        { lbl:"WHY SO USEFUL", body:"Fairness, order preservation, and all core operations are O(1)." },
      ]},
    { id:"ops", icon:"⚡", title:"Queue Operations", color:"#4ade80", voice:NARR.ops,
      visual:<VisOps/>, cards:[
        { lbl:"ENQUEUE — O(1)", body:"Adds an element to the rear. Array: arr[rear++] = val. Linked list: add after tail." },
        { lbl:"DEQUEUE — O(1)", body:"Removes and returns front element. Must check isEmpty first." },
        { lbl:"FRONT — O(1)", body:"Returns front element without removing. Essential for lookahead." },
        { lbl:"THE GUARANTEE", body:"Every standard queue operation is O(1) — constant time, no loops." },
      ]},
    { id:"impl", icon:"🔧", title:"Queue Implementation", color:"#f472b6", voice:NARR.impl,
      visual:<VisImpl/>, cards:[
        { lbl:"ARRAY IMPL", body:"Use front and rear pointers. Enqueue: arr[rear++] = val. Dequeue: val = arr[front++]. Wastes space if not circular." },
        { lbl:"LINKED LIST", body:"Head = front, tail = rear. Enqueue: add after tail. Dequeue: move head to next." },
        { lbl:"PYTHON", body:"collections.deque is highly optimized. For simple queue, use list and pop(0) — but that's O(n)." },
        { lbl:"JAVA / C++", body:"Java: ArrayDeque (resizable array). C++: std::queue (wrapper around deque)." },
      ]},
    { id:"types", icon:"🗂️", title:"Types of Queues", color:"#818cf8", voice:NARR.types,
      visual:<VisTypes/>, cards:[
        { lbl:"SIMPLE QUEUE", body:"Basic FIFO. Linear structure with front and rear." },
        { lbl:"CIRCULAR QUEUE", body:"Wraps around to reuse space. Full condition: (rear+1)%capacity == front." },
        { lbl:"DEQUE", body:"Double-ended. Insert/delete at both ends in O(1)." },
        { lbl:"PRIORITY QUEUE", body:"Elements served by priority (usually max-heap)." },
      ]},
    { id:"circular", icon:"🔄", title:"Circular Queue", color:"#34d399", voice:NARR.circular,
      visual:<VisCircular/>, cards:[
        { lbl:"RING BUFFER", body:"Connects the end to the front, allowing full array usage without wasted space." },
        { lbl:"FULL CONDITION", body:"(rear + 1) % capacity == front (one slot kept empty to distinguish full from empty)." },
        { lbl:"USES", body:"Audio buffers, network packet queues, keyboard buffers, producer-consumer problems." },
        { lbl:"IMPLEMENTATION", body:"Modulo arithmetic ensures wrap-around. O(1) all operations." },
      ]},
    { id:"deque", icon:"↔️", title:"Deque (Double-Ended)", color:"#f59e0b", voice:NARR.deque,
      visual:<VisDeque/>, cards:[
        { lbl:"BOTH ENDS", body:"Supports push/pop at both front and back — all O(1)." },
        { lbl:"USES", body:"Sliding window maximum, palindrome checking, undo/redo, implementing both stack and queue." },
        { lbl:"PYTHON", body:"collections.deque — highly optimized, thread-safe, with bounded capacity." },
        { lbl:"OPERATIONS", body:"push_front, pop_front, push_back, pop_back. Also peek front/back." },
      ]},
    { id:"applications", icon:"🌍", title:"Queue Applications", color:"#a78bfa", voice:NARR.applications,
      visual:<VisApplications/>, cards:[
        { lbl:"BREADTH-FIRST SEARCH", body:"Graph traversal uses a queue to explore nodes level by level. Shortest path in unweighted graphs." },
        { lbl:"TASK SCHEDULING", body:"OS scheduler uses queues to manage processes. Print spoolers queue print jobs." },
        { lbl:"MESSAGE QUEUES", body:"RabbitMQ, Kafka, etc. — decouple producers and consumers, handle load spikes." },
        { lbl:"BUFFERING", body:"Keyboards, network packets — temporary storage to smooth out bursty input." },
      ]},
  ];

  const isMobile = useMediaQuery("(max-width: 600px)");

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

      <div style={{ textAlign:"center", marginBottom:32, fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:"#1e2a38", letterSpacing:"0.1em" }}>
        PRESS <kbd style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:5, padding:"1px 7px", color:"#2d3748" }}>?</kbd> FOR KEYBOARD SHORTCUTS
      </div>

      <main style={{ maxWidth:1000, margin:"0 auto", padding:"0 20px 100px", marginRight: navOpen ? (isMobile ? "70px" : "clamp(70px, 8vw, 100px)") : "20px", transition:"margin-right 0.3s cubic-bezier(0.22,1,0.36,1)" }}>
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
              <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:"#2d3748", marginTop:3, letterSpacing:"0.08em" }}>GREEN = O(1) FAST · RED = SLOW · HOVER ROWS</p>
            </div>
          </div>
          <div style={{ borderRadius:22, overflow:"hidden", background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)" }}>
            <ComplexityTable/>
          </div>
          <div style={{ marginTop:12, padding:"10px 16px", borderRadius:12, background:"rgba(96,165,250,0.06)", border:"1px solid rgba(96,165,250,0.15)", fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:"#60a5fa" }}>
            * Dynamic array enqueue is amortized O(1) — occasional O(n) resize, averaged over n enqueues = O(1) per op.
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
            if (sc>=tot) { setShowConfetti(true); setTimeout(()=>setShowConfetti(false), 4000); }
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
                {qScore>=5?"Outstanding! You have genuinely mastered queue data structures.":qScore>=3?"Solid progress. Review the sections you missed and retry.":"Great start — re-read the sections above and come back stronger."}
              </p>
              <div style={{ display:"inline-block", padding:"12px 28px", borderRadius:16, background:"linear-gradient(135deg,#3b82f6,#ec4899)", fontFamily:"'Syne',sans-serif", fontSize:15, fontWeight:700, color:"#fff" }}>
                🎉 Queue Complete — Explore More Data Structures
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
          <div style={{ fontSize:48, marginBottom:14 }}>📋</div>
          <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:"clamp(17px,3.2vw,26px)", fontWeight:800, color:"#f8fafc", marginBottom:12 }}>You have completed the Queue guide!</h3>
          <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, color:"#64748b", maxWidth:440, margin:"0 auto 28px", lineHeight:1.72 }}>
            Now implement one from scratch. Start with array-based, then add circular queue and deque. Writing the code makes every concept permanent.
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