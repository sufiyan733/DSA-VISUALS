"use client";
import { useState, useEffect, useRef, useCallback } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────────────────────────────────────
const BG       = "rgba(7,9,20,0.99)";
const PANEL    = "rgba(11,14,28,0.98)";
const SURFACE  = "rgba(16,20,40,0.7)";
const SURFACE2 = "rgba(22,27,52,0.6)";
const BORDER   = "rgba(255,255,255,0.055)";
const BORDER2  = "rgba(255,255,255,0.09)";
const TEXT_PRI = "#eef2ff";
const TEXT_SEC = "#8b9fc4";
const TEXT_DIM = "#384a6a";
const MONO     = "'JetBrains Mono', 'Fira Code', monospace";
const SANS     = "'Inter', -apple-system, sans-serif";
const ACCENT   = "#7c6fff";
const ACCENT2  = "#9d8fff";
const ACCENT3  = "#38bdf8";
const GLOW_A   = "rgba(124,111,255,0.3)";
const GLOW_B   = "rgba(56,189,248,0.18)";

// Complexity color map
const COMPLEXITY_COLORS = {
  "O(1)":        { bg:"rgba(52,211,153,0.12)", border:"rgba(52,211,153,0.35)", text:"#34d399" },
  "O(log n)":    { bg:"rgba(56,189,248,0.12)", border:"rgba(56,189,248,0.35)", text:"#38bdf8" },
  "O(n)":        { bg:"rgba(124,111,255,0.12)", border:"rgba(124,111,255,0.35)", text:"#a78bfa" },
  "O(n log n)":  { bg:"rgba(251,191,36,0.12)", border:"rgba(251,191,36,0.35)", text:"#fbbf24" },
  "O(n²)":       { bg:"rgba(244,114,182,0.12)", border:"rgba(244,114,182,0.35)", text:"#f472b6" },
  "O(2ⁿ)":       { bg:"rgba(239,68,68,0.12)", border:"rgba(239,68,68,0.35)", text:"#f87171" },
};

// ─────────────────────────────────────────────────────────────────────────────
// SOUND ENGINE
// ─────────────────────────────────────────────────────────────────────────────
class SoundEngine {
  constructor() { this.ctx = null; this.enabled = true; this.lastTypeTime = 0; }
  getCtx() {
    if (!this.ctx) {
      try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch {}
    }
    return this.ctx;
  }
  playTyping() {
    if (!this.enabled) return;
    const now = Date.now();
    if (now - this.lastTypeTime < 45) return;
    this.lastTypeTime = now;
    try {
      const ctx = this.getCtx(); if (!ctx) return;
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = [880,1046,1174,1318][Math.floor(Math.random()*4)];
      o.type = "sine";
      g.gain.setValueAtTime(0.03, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.05);
    } catch {}
  }
  playSend() {
    if (!this.enabled) return;
    try {
      const ctx = this.getCtx(); if (!ctx) return;
      [523,659,784].forEach((freq, i) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.frequency.value = freq; o.type = "sine";
        const t = ctx.currentTime + i * 0.05;
        g.gain.setValueAtTime(0.07, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
        o.start(t); o.stop(t + 0.14);
      });
    } catch {}
  }
  playReceive() {
    if (!this.enabled) return;
    try {
      const ctx = this.getCtx(); if (!ctx) return;
      [784,659,523].forEach((freq, i) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.frequency.value = freq; o.type = "triangle";
        const t = ctx.currentTime + i * 0.06;
        g.gain.setValueAtTime(0.05, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
        o.start(t); o.stop(t + 0.12);
      });
    } catch {}
  }
  playOpen() {
    if (!this.enabled) return;
    try {
      const ctx = this.getCtx(); if (!ctx) return;
      [261,330,392,523].forEach((freq, i) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.frequency.value = freq; o.type = "sine";
        const t = ctx.currentTime + i * 0.07;
        g.gain.setValueAtTime(0.06, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        o.start(t); o.stop(t + 0.2);
      });
    } catch {}
  }
  playError() {
    if (!this.enabled) return;
    try {
      const ctx = this.getCtx(); if (!ctx) return;
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.setValueAtTime(440, ctx.currentTime);
      o.frequency.linearRampToValueAtTime(220, ctx.currentTime + 0.2);
      o.type = "sawtooth";
      g.gain.setValueAtTime(0.04, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.2);
    } catch {}
  }
}
const soundEngine = new SoundEngine();

// ─────────────────────────────────────────────────────────────────────────────
// SUGGESTION GROUPS
// ─────────────────────────────────────────────────────────────────────────────
const SUGGESTION_GROUPS = [
  {
    group: "Trees",
    color: "#818cf8",
    items: [
      { icon: "⑂", label: "Explain AVL rotations step-by-step",        sub: "Self-balancing · O(log n)" },
      { icon: "⊢", label: "Red-Black Tree vs AVL Tree trade-offs",      sub: "Comparison · Use-cases" },
      { icon: "⊕", label: "Segment Tree with lazy propagation",         sub: "Range queries · Updates" },
    ],
  },
  {
    group: "Sorting",
    color: "#38bdf8",
    items: [
      { icon: "⇅", label: "Quick Sort vs Merge Sort deep dive",         sub: "Complexity · Trade-offs" },
      { icon: "◈", label: "Why is Tim Sort used in practice?",          sub: "Hybrid · Real-world" },
      { icon: "∿", label: "Counting Sort and Radix Sort explained",     sub: "Linear time · Non-comparative" },
    ],
  },
  {
    group: "Graphs",
    color: "#34d399",
    items: [
      { icon: "⬡", label: "Dijkstra vs Bellman-Ford vs Floyd-Warshall", sub: "Shortest path · Negatives" },
      { icon: "⊗", label: "Topological sort with Kahn's algorithm",     sub: "DAG · BFS approach" },
      { icon: "⊙", label: "Union-Find / Disjoint Set Union explained",  sub: "Path compression · Rank" },
    ],
  },
  {
    group: "DP",
    color: "#f472b6",
    items: [
      { icon: "∞", label: "Tabulation vs memoization in dynamic programming", sub: "Bottom-up · Top-down" },
      { icon: "⊞", label: "0/1 Knapsack problem from scratch",         sub: "Classic · Reconstruction" },
      { icon: "⋯", label: "Longest Common Subsequence visualised",      sub: "2-D DP · Trace-back" },
    ],
  },
];

const SPEED_OPTIONS = [
  { label: "0.75×", rate: 0.75 },
  { label: "1×",    rate: 1.0  },
  { label: "1.25×", rate: 1.25 },
  { label: "1.5×",  rate: 1.5  },
  { label: "2×",    rate: 2.0  },
];

// ─────────────────────────────────────────────────────────────────────────────
// KNOWLEDGE CARD — replaces flowchart + reactions
// A structured breakdown rendered from AI response metadata
// ─────────────────────────────────────────────────────────────────────────────
function ComplexityBadge({ label }) {
  const c = COMPLEXITY_COLORS[label] || { bg:"rgba(124,111,255,0.12)", border:"rgba(124,111,255,0.3)", text:"#a78bfa" };
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:"3px",
      padding:"2px 8px", borderRadius:"20px",
      background:c.bg, border:`1px solid ${c.border}`,
      fontFamily:MONO, fontSize:"10px", color:c.text,
      letterSpacing:"0.02em", whiteSpace:"nowrap",
    }}>{label}</span>
  );
}

function KnowledgeCard({ card }) {
  const [activeTab, setActiveTab] = useState(0);
  const tabs = [
    card.concept   && { id:0, label:"Concept",    icon:"◎" },
    card.steps     && { id:1, label:"How it works",icon:"⟳" },
    card.analogies && { id:2, label:"Intuition",   icon:"💡" },
    card.complexity&& { id:3, label:"Complexity",  icon:"⏱" },
    card.pitfalls  && { id:4, label:"Pitfalls",    icon:"⚠" },
  ].filter(Boolean);

  if (!tabs.length) return null;

  const activeData = (() => {
    switch (activeTab) {
      case 0: return card.concept;
      case 1: return card.steps;
      case 2: return card.analogies;
      case 3: return card.complexity;
      case 4: return card.pitfalls;
      default: return null;
    }
  })();

  return (
    <div style={{
      margin:"14px 0 6px",
      background:"rgba(7,9,20,0.6)",
      border:"1px solid rgba(124,111,255,0.2)",
      borderRadius:"14px",
      overflow:"hidden",
    }}>
      {/* Header */}
      <div style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"10px 14px 0",
        borderBottom:"1px solid rgba(255,255,255,0.04)",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
          <span style={{ color:ACCENT2, fontSize:"11px" }}>◈</span>
          <span style={{ fontFamily:MONO, fontSize:"9px", color:ACCENT2, letterSpacing:"0.1em" }}>
            KNOWLEDGE BREAKDOWN
          </span>
          {card.title && (
            <>
              <span style={{ color:TEXT_DIM, fontSize:"9px" }}>—</span>
              <span style={{ fontFamily:SANS, fontSize:"10px", color:TEXT_SEC }}>{card.title}</span>
            </>
          )}
        </div>
        {card.timeComplexity && <ComplexityBadge label={card.timeComplexity}/>}
      </div>

      {/* Tabs */}
      <div style={{
        display:"flex", gap:0, padding:"0 6px",
        borderBottom:"1px solid rgba(255,255,255,0.04)",
        overflowX:"auto",
      }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={()=> setActiveTab(tab.id)} style={{
            display:"flex", alignItems:"center", gap:"4px",
            padding:"8px 10px 9px",
            background:"none", border:"none",
            borderBottom:`2px solid ${activeTab===tab.id ? ACCENT2 : "transparent"}`,
            fontFamily:MONO, fontSize:"8.5px", letterSpacing:"0.06em",
            color: activeTab===tab.id ? ACCENT2 : TEXT_DIM,
            cursor:"pointer", outline:"none", whiteSpace:"nowrap",
            transition:"all 0.15s",
          }}>
            <span style={{ fontSize:"9px" }}>{tab.icon}</span>
            {tab.label.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding:"12px 14px" }}>
        {activeTab === 0 && card.concept && (
          <div style={{ fontFamily:SANS, fontSize:"12.5px", color:TEXT_SEC, lineHeight:"1.7" }}>
            {card.concept}
          </div>
        )}

        {activeTab === 1 && card.steps && (
          <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
            {card.steps.map((step, i) => (
              <div key={i} style={{
                display:"flex", gap:"10px", alignItems:"flex-start",
                padding:"8px 10px", borderRadius:"8px",
                background:"rgba(255,255,255,0.02)",
                border:"1px solid rgba(255,255,255,0.04)",
              }}>
                <div style={{
                  width:"20px", height:"20px", borderRadius:"6px",
                  background:"rgba(124,111,255,0.15)",
                  border:"1px solid rgba(124,111,255,0.3)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontFamily:MONO, fontSize:"8px", color:ACCENT2,
                  flexShrink:0, marginTop:"1px",
                }}>{i+1}</div>
                <div>
                  {step.title && <div style={{ fontFamily:SANS, fontSize:"11.5px", color:TEXT_PRI, fontWeight:600, marginBottom:"2px" }}>{step.title}</div>}
                  <div style={{ fontFamily:SANS, fontSize:"11.5px", color:TEXT_SEC, lineHeight:"1.6" }}>{step.desc || step}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 2 && card.analogies && (
          <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
            {card.analogies.map((a, i) => (
              <div key={i} style={{
                padding:"10px 12px", borderRadius:"8px",
                background:"rgba(56,189,248,0.04)",
                border:"1px solid rgba(56,189,248,0.12)",
                borderLeft:"2px solid rgba(56,189,248,0.4)",
              }}>
                {a.label && <div style={{ fontFamily:MONO, fontSize:"8px", color:ACCENT3, letterSpacing:"0.08em", marginBottom:"4px" }}>{a.label.toUpperCase()}</div>}
                <div style={{ fontFamily:SANS, fontSize:"12px", color:TEXT_SEC, lineHeight:"1.65" }}>{a.text || a}</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 3 && card.complexity && (
          <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
            {card.complexity.map((row, i) => {
              const c = COMPLEXITY_COLORS[row.value] || { bg:"rgba(124,111,255,0.08)", border:"rgba(124,111,255,0.2)", text:"#a78bfa" };
              return (
                <div key={i} style={{
                  display:"flex", alignItems:"center", justifyContent:"space-between",
                  padding:"8px 12px", borderRadius:"8px",
                  background:"rgba(255,255,255,0.02)",
                  border:"1px solid rgba(255,255,255,0.04)",
                }}>
                  <div>
                    <div style={{ fontFamily:SANS, fontSize:"11.5px", color:TEXT_PRI, fontWeight:600 }}>{row.label}</div>
                    {row.note && <div style={{ fontFamily:SANS, fontSize:"10.5px", color:TEXT_DIM, marginTop:"2px" }}>{row.note}</div>}
                  </div>
                  <span style={{
                    padding:"3px 10px", borderRadius:"20px",
                    background:c.bg, border:`1px solid ${c.border}`,
                    fontFamily:MONO, fontSize:"10.5px", color:c.text,
                  }}>{row.value}</span>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 4 && card.pitfalls && (
          <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
            {card.pitfalls.map((p, i) => (
              <div key={i} style={{
                display:"flex", gap:"8px", alignItems:"flex-start",
                padding:"8px 10px", borderRadius:"8px",
                background:"rgba(244,114,182,0.04)",
                border:"1px solid rgba(244,114,182,0.12)",
              }}>
                <span style={{ color:"#f472b6", fontSize:"10px", marginTop:"2px", flexShrink:0 }}>⚠</span>
                <div style={{ fontFamily:SANS, fontSize:"12px", color:TEXT_SEC, lineHeight:"1.6" }}>{p}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────────────────────────────────────────
function IconVolume({ size=14 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
  </svg>;
}
function IconVolumeOff({ size=14 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
    <line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>
  </svg>;
}
function IconGlobe({ size=14 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>;
}
function IconTrash({ size=14 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>;
}
function IconX({ size=14 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>;
}
function IconCopy({ size=11 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>;
}
function IconCheck({ size=11 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>;
}
function IconSearch({ size=14 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>;
}
function IconDownload({ size=14 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>;
}
function IconKeyboard({ size=14 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="M6 8h.001M10 8h.001M14 8h.001M18 8h.001M8 12h.001M12 12h.001M16 12h.001M7 16h10"/>
  </svg>;
}
function IconMic({ size=14 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/>
    <line x1="8" y1="23" x2="16" y2="23"/>
  </svg>;
}
function IconStop({ size=14 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <rect x="4" y="4" width="16" height="16" rx="2"/>
  </svg>;
}
function IconBookmark({ size=14 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
  </svg>;
}
function IconSound({ size=14 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
  </svg>;
}
function IconPin({ size=14 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>;
}

// ─────────────────────────────────────────────────────────────────────────────
// ROBOT LOGO
// ─────────────────────────────────────────────────────────────────────────────
function RobotLogo({ size = 20, animated = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={animated ? { animation: "bot-logo-float 4s ease-in-out infinite" } : {}}>
      <line x1="16" y1="2" x2="16" y2="7" stroke={ACCENT2} strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="16" cy="2" r="1.5" fill={ACCENT3} style={animated ? { animation:"bot-antenna-pulse 2s ease-in-out infinite" } : {}}/>
      <rect x="6" y="7" width="20" height="14" rx="4" fill="url(#botG1)" stroke={ACCENT2} strokeWidth="0.8" strokeOpacity="0.5"/>
      <circle cx="11.5" cy="14" r="2.5" fill={ACCENT3} style={animated ? { animation:"bot-eye-blink 4s ease-in-out infinite" } : {}}/>
      <circle cx="20.5" cy="14" r="2.5" fill={ACCENT3} style={animated ? { animation:"bot-eye-blink 4s ease-in-out infinite 0.15s" } : {}}/>
      <circle cx="12.2" cy="13.2" r="0.8" fill="white" opacity="0.9"/>
      <circle cx="21.2" cy="13.2" r="0.8" fill="white" opacity="0.9"/>
      <path d="M12 18.5 Q16 20.5 20 18.5" stroke={ACCENT2} strokeWidth="1.2" strokeLinecap="round" fill="none"/>
      <rect x="13" y="21" width="6" height="3" rx="1.5" fill={ACCENT2} opacity="0.6"/>
      <rect x="8" y="24" width="16" height="7" rx="3" fill="url(#botG2)" stroke={ACCENT2} strokeWidth="0.8" strokeOpacity="0.4"/>
      <circle cx="13" cy="27.5" r="1.2" fill={ACCENT3} opacity="0.7"/>
      <circle cx="16" cy="27.5" r="1.2" fill={ACCENT2} opacity="0.7"/>
      <circle cx="19" cy="27.5" r="1.2" fill={ACCENT3} opacity="0.7"/>
      <defs>
        <linearGradient id="botG1" x1="6" y1="7" x2="26" y2="21" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1e1b4b"/><stop offset="100%" stopColor="#0f172a"/>
        </linearGradient>
        <linearGradient id="botG2" x1="8" y1="24" x2="24" y2="31" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1e1b4b"/><stop offset="100%" stopColor="#0c0f20"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

function TypingDots() {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:"5px", padding:"4px 0" }}>
      {[0,1,2].map(i => (
        <span key={i} style={{
          width:"6px", height:"6px", borderRadius:"50%",
          background:`radial-gradient(circle,${ACCENT3} 0%,${ACCENT} 100%)`,
          display:"inline-block",
          animation:`bot-typing-dot 1.4s cubic-bezier(0.4,0,0.6,1) ${i*0.22}s infinite`,
          boxShadow:`0 0 5px ${ACCENT3}50`,
        }}/>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HEADER BUTTON
// ─────────────────────────────────────────────────────────────────────────────
function HeaderBtn({ icon, tooltip, onClick, variant="default", disabled=false, active=false }) {
  const [hov, setHov] = useState(false);
  const [tip, setTip] = useState(false);
  const styles = {
    default:  { idle:TEXT_DIM, hover:ACCENT2,    hBg:"rgba(124,111,255,0.1)", hB:"rgba(124,111,255,0.28)" },
    danger:   { idle:TEXT_DIM, hover:"#fca5a5",  hBg:"rgba(239,68,68,0.1)",  hB:"rgba(239,68,68,0.28)" },
    close:    { idle:TEXT_DIM, hover:"#f0f4ff",  hBg:"rgba(255,255,255,0.07)",hB:"rgba(255,255,255,0.14)" },
    lang:     { idle:ACCENT2,  hover:ACCENT3,    hBg:"rgba(56,189,248,0.1)", hB:"rgba(56,189,248,0.35)" },
    search:   { idle:TEXT_DIM, hover:"#34d399",  hBg:"rgba(52,211,153,0.1)", hB:"rgba(52,211,153,0.28)" },
    export:   { idle:TEXT_DIM, hover:ACCENT3,    hBg:"rgba(56,189,248,0.1)", hB:"rgba(56,189,248,0.28)" },
    keys:     { idle:TEXT_DIM, hover:"#c4b5fd",  hBg:"rgba(196,181,253,0.1)",hB:"rgba(196,181,253,0.28)" },
    bookmark: { idle:TEXT_DIM, hover:"#f472b6",  hBg:"rgba(244,114,182,0.1)",hB:"rgba(244,114,182,0.28)" },
    focus:    { idle:TEXT_DIM, hover:"#fbbf24",  hBg:"rgba(251,191,36,0.1)", hB:"rgba(251,191,36,0.28)" },
    sound:    { idle:TEXT_DIM, hover:"#34d399",  hBg:"rgba(52,211,153,0.1)", hB:"rgba(52,211,153,0.28)" },
  };
  const s = styles[variant] || styles.default;
  return (
    <div style={{ position:"relative" }}>
      <button
        onClick={onClick} disabled={disabled}
        onMouseEnter={()=>{ setHov(true); setTip(true); }}
        onMouseLeave={()=>{ setHov(false); setTip(false); }}
        style={{
          width:"32px", height:"32px", borderRadius:"9px",
          background: hov ? s.hBg : (active ? "rgba(124,111,255,0.08)" : "transparent"),
          border:`1px solid ${hov ? s.hB : (active ? "rgba(124,111,255,0.22)" : "transparent")}`,
          color: hov ? s.hover : (active ? ACCENT2 : s.idle),
          cursor: disabled ? "default" : "pointer",
          display:"flex", alignItems:"center", justifyContent:"center",
          outline:"none", flexShrink:0, opacity: disabled ? 0.3 : 1,
          transition:"all 0.16s cubic-bezier(0.22,1,0.36,1)",
          transform: hov && !disabled ? (variant==="close" ? "rotate(90deg)" : "translateY(-1px)") : "none",
        }}
        aria-label={tooltip}
      >
        {icon}
      </button>
      {tip && tooltip && (
        <div style={{
          position:"absolute", top:"calc(100% + 6px)", right:0,
          background:"rgba(7,9,20,0.97)", border:`1px solid ${BORDER2}`,
          borderRadius:"7px", padding:"4px 9px",
          fontFamily:MONO, fontSize:"9px", color:TEXT_SEC,
          whiteSpace:"nowrap", pointerEvents:"none",
          boxShadow:"0 8px 24px rgba(0,0,0,0.6)",
          animation:"bot-tip-in 0.15s ease-out", zIndex:50, letterSpacing:"0.04em",
        }}>
          {tooltip}
          <div style={{ position:"absolute", bottom:"100%", right:"11px", width:0, height:0,
            borderLeft:"4px solid transparent", borderRight:"4px solid transparent",
            borderBottom:`4px solid ${BORDER2}` }}/>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CODE BLOCK — enhanced with language badge + line numbers
// ─────────────────────────────────────────────────────────────────────────────
function CodeBlock({ code, lang }) {
  const [copied, setCopied] = useState(false);
  const lines = code.split("\n");
  const copy = () => {
    navigator.clipboard?.writeText(code).catch(()=>{});
    setCopied(true);
    setTimeout(()=> setCopied(false), 1800);
  };
  return (
    <div style={{ margin:"12px 0", borderRadius:"10px", overflow:"hidden",
      border:"1px solid rgba(124,111,255,0.18)", boxShadow:"0 4px 20px rgba(0,0,0,0.4)" }}>
      {/* Code header */}
      <div style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"7px 12px",
        background:"rgba(0,0,0,0.55)",
        borderBottom:"1px solid rgba(124,111,255,0.12)",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
          <div style={{ display:"flex", gap:"4px" }}>
            {["#f87171","#fbbf24","#34d399"].map(c=>(
              <div key={c} style={{ width:"8px", height:"8px", borderRadius:"50%", background:c, opacity:0.6 }}/>
            ))}
          </div>
          {lang && (
            <span style={{ fontFamily:MONO, fontSize:"9px", color:ACCENT3, letterSpacing:"0.06em",
              background:"rgba(56,189,248,0.1)", border:"1px solid rgba(56,189,248,0.2)",
              borderRadius:"4px", padding:"1px 6px" }}>{lang}</span>
          )}
        </div>
        <button onClick={copy} style={{
          display:"flex", alignItems:"center", gap:"4px",
          background: copied ? "rgba(52,211,153,0.15)" : "rgba(124,111,255,0.1)",
          border:`1px solid ${copied ? "rgba(52,211,153,0.35)" : "rgba(124,111,255,0.22)"}`,
          borderRadius:"5px", padding:"2px 9px",
          fontFamily:MONO, fontSize:"8px",
          color: copied ? "#34d399" : TEXT_DIM,
          cursor:"pointer", outline:"none", transition:"all 0.16s", letterSpacing:"0.04em",
        }}>
          {copied ? <><IconCheck size={9}/>&nbsp;COPIED</> : <><IconCopy size={9}/>&nbsp;COPY</>}
        </button>
      </div>
      {/* Code body with line numbers */}
      <div style={{ display:"flex", background:"rgba(0,0,0,0.45)", overflowX:"auto" }}>
        <div style={{
          display:"flex", flexDirection:"column",
          padding:"12px 0", minWidth:"32px",
          background:"rgba(0,0,0,0.2)",
          borderRight:"1px solid rgba(255,255,255,0.04)",
          userSelect:"none",
        }}>
          {lines.map((_,i) => (
            <div key={i} style={{ padding:"0 10px", fontFamily:MONO, fontSize:"10px",
              color:TEXT_DIM, lineHeight:"1.65", textAlign:"right" }}>{i+1}</div>
          ))}
        </div>
        <pre style={{
          flex:1, padding:"12px 14px", margin:0,
          fontFamily:MONO, fontSize:"11.5px",
          color:"#c8d8f8", lineHeight:"1.65",
          overflowX:"auto", whiteSpace:"pre",
        }}>{code}</pre>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RICH TEXT RENDERER — enhanced formatting
// ─────────────────────────────────────────────────────────────────────────────
function RichText({ content, cardData }) {
  // Strip markdown headings
  const cleaned = content.replace(/^(#{1,6})\s+/gm, "");
  const parts = cleaned.split(/(```(?:\w+)?\n?[\s\S]*?```)/g);

  return (
    <div style={{ margin:0, lineHeight:"1.74", wordBreak:"break-word" }}>
      {parts.map((part, i) => {
        if (part.startsWith("```")) {
          const langMatch = part.match(/^```(\w+)/);
          const lang = langMatch ? langMatch[1] : null;
          const inner = part.replace(/^```\w*\n?/, "").replace(/```$/, "").trimEnd();
          return <CodeBlock key={i} code={inner} lang={lang}/>;
        }
        const lines = part.split("\n");
        return (
          <span key={i}>
            {lines.map((line, li) => {
              const isLast = li === lines.length-1;
              const bMatch = line.match(/^(\s*[-•*]\s+)(.*)/);
              const nMatch = line.match(/^(\s*\d+\.\s+)(.*)/);
              const raw = bMatch ? bMatch[2] : nMatch ? nMatch[2] : line;

              // Inline token parsing: `code`, **bold**, ==highlight==
             const tokens = raw.split(/(`[^`]+`|\*\*[^*]+\*\*|==(?:[^=]+)==)/g);
const inline = tokens.map((tok, ti) => {
  if (tok == null) return null;
  if (tok.startsWith("`") && tok.endsWith("`"))
    return <code key={ti} style={{
      background:"rgba(124,111,255,0.15)",
      border:"1px solid rgba(124,111,255,0.28)",
      borderRadius:"4px", padding:"1px 5px",
      fontFamily:MONO, fontSize:"10.5px", color:ACCENT3,
    }}>{tok.slice(1,-1)}</code>;
  if (tok.startsWith("**") && tok.endsWith("**"))
    return <strong key={ti} style={{ color:TEXT_PRI, fontWeight:600 }}>{tok.slice(2,-2)}</strong>;
  if (tok.startsWith("==") && tok.endsWith("=="))
    return <mark key={ti} style={{ background:"rgba(251,191,36,0.15)", color:"#fbbf24", borderRadius:"3px", padding:"0 3px" }}>{tok.slice(2,-2)}</mark>;
  return tok;
});
              let rendered;
              if (bMatch) {
                rendered = (
                  <div key={li} style={{ display:"flex", gap:"8px", margin:"3px 0", paddingLeft:"4px" }}>
                    <span style={{ color:ACCENT, fontWeight:700, flexShrink:0, marginTop:"1px", fontSize:"10px" }}>▸</span>
                    <span>{inline}</span>
                  </div>
                );
              } else if (nMatch) {
                rendered = (
                  <div key={li} style={{ display:"flex", gap:"8px", margin:"3px 0", paddingLeft:"4px" }}>
                    <span style={{ color:ACCENT3, fontFamily:MONO, fontSize:"10px", flexShrink:0, minWidth:"14px" }}>{nMatch[1].trim()}</span>
                    <span>{inline}</span>
                  </div>
                );
              } else {
                rendered = <span key={li}>{inline}</span>;
              }
              return (
                <span key={li}>
                  {rendered}
                  {!isLast && line==="" ? <br/> : !isLast && !bMatch && !nMatch ? <br/> : null}
                </span>
              );
            })}
          </span>
        );
      })}
      {/* Knowledge Card rendered after prose */}
      {cardData && <KnowledgeCard card={cardData}/>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STREAMING TEXT RENDERER
// ─────────────────────────────────────────────────────────────────────────────
function StreamingMessage({ fullText, onDone, streamKey }) {
  const [displayed, setDisplayed] = useState("");
  const idxRef = useRef(0);
  const rafRef = useRef(null);
  const lastTimeRef = useRef(0);

  useEffect(() => {
    idxRef.current = 0;
    setDisplayed("");
    lastTimeRef.current = 0;
    const CHARS_PER_FRAME = 4, MIN_INTERVAL = 16;
    const tick = (timestamp) => {
      if (timestamp - lastTimeRef.current >= MIN_INTERVAL) {
        lastTimeRef.current = timestamp;
        const next = Math.min(idxRef.current + CHARS_PER_FRAME, fullText.length);
        idxRef.current = next;
        setDisplayed(fullText.slice(0, next));
        if (next >= fullText.length) { onDone?.(); soundEngine.playReceive(); return; }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [fullText, streamKey]);

  return <RichText content={displayed} cardData={null}/>;
}

// ─────────────────────────────────────────────────────────────────────────────
// VOICE PICKER MODAL
// ─────────────────────────────────────────────────────────────────────────────
function VoicePickerModal({ currentVoice, onSelect, onClose, voiceSpeed, onSpeedChange }) {
  const [availableVoices, setAvailableVoices] = useState([]);
  const [testingIdx, setTestingIdx] = useState(null);
  useEffect(() => {
    const load = () => {
      const all = window.speechSynthesis?.getVoices() || [];
      const en = all.filter(v => v.lang.startsWith("en"));
      const isPremium = v => ["natural","neural","online","enhanced"].some(k=>v.name.toLowerCase().includes(k));
      setAvailableVoices([...en.filter(isPremium),...en.filter(v=>!isPremium(v))].slice(0,16));
    };
    load();
    window.speechSynthesis?.addEventListener("voiceschanged", load);
    return () => window.speechSynthesis?.removeEventListener("voiceschanged", load);
  }, []);
  const testVoice = (v, idx) => {
    setTestingIdx(idx); window.speechSynthesis?.cancel();
    const u = new SpeechSynthesisUtterance("Hello! Ready to explain algorithms.");
    u.voice=v; u.rate=voiceSpeed;
    u.onend=()=>setTestingIdx(null); u.onerror=()=>setTestingIdx(null);
    window.speechSynthesis?.speak(u);
  };
  return (
    <div style={{
      position:"absolute", inset:0, zIndex:12,
      background:"rgba(3,5,16,0.9)", backdropFilter:"blur(16px)",
      display:"flex", alignItems:"center", justifyContent:"center",
      animation:"bot-modal-in 0.22s cubic-bezier(0.22,1,0.36,1)",
    }} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{
        background:PANEL, border:`1px solid rgba(56,189,248,0.22)`,
        borderRadius:"18px", padding:"24px 20px",
        width:"min(420px,calc(100vw - 28px))", maxHeight:"85vh", overflowY:"auto",
        boxShadow:"0 32px 80px rgba(0,0,0,0.7)", position:"relative",
      }}>
        <button onClick={onClose} style={{
          position:"absolute", top:"12px", right:"12px",
          width:"28px", height:"28px", borderRadius:"8px",
          background:SURFACE, border:`1px solid ${BORDER}`,
          color:TEXT_DIM, cursor:"pointer", display:"flex",
          alignItems:"center", justifyContent:"center", outline:"none",
        }}><IconX size={12}/></button>
        <div style={{ textAlign:"center", marginBottom:"18px" }}>
          <div style={{ fontFamily:MONO, fontSize:"13px", color:TEXT_PRI, fontWeight:700, letterSpacing:"0.04em", marginBottom:"4px" }}>Voice & Speed</div>
          <div style={{ fontFamily:SANS, fontSize:"11px", color:TEXT_DIM }}>Choose a voice · click to preview</div>
        </div>
        <div style={{ marginBottom:"16px", padding:"11px 13px", borderRadius:"10px",
          background:"rgba(56,189,248,0.05)", border:"1px solid rgba(56,189,248,0.14)" }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"8px" }}>
            <span style={{ fontFamily:MONO, fontSize:"9px", color:ACCENT3, letterSpacing:"0.08em" }}>SPEED</span>
            <span style={{ fontFamily:MONO, fontSize:"9px", color:TEXT_PRI }}>{SPEED_OPTIONS.find(s=>s.rate===voiceSpeed)?.label ?? `${voiceSpeed}×`}</span>
          </div>
          <div style={{ display:"flex", gap:"5px" }}>
            {SPEED_OPTIONS.map(opt => (
              <button key={opt.rate} onClick={()=>onSpeedChange(opt.rate)} style={{
                flex:1, padding:"5px 0", borderRadius:"7px",
                background:voiceSpeed===opt.rate?"rgba(56,189,248,0.18)":"rgba(255,255,255,0.03)",
                border:`1px solid ${voiceSpeed===opt.rate?"rgba(56,189,248,0.45)":BORDER}`,
                fontFamily:MONO, fontSize:"8.5px", color:voiceSpeed===opt.rate?ACCENT3:TEXT_DIM,
                cursor:"pointer", outline:"none", transition:"all 0.14s",
              }}>{opt.label}</button>
            ))}
          </div>
        </div>
        <div style={{ fontFamily:MONO, fontSize:"9px", color:TEXT_DIM, letterSpacing:"0.08em", marginBottom:"8px" }}>
          VOICES ({availableVoices.length})
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:"5px" }}>
          {availableVoices.map((v,i) => {
            const sel = currentVoice?.name===v.name, testing = testingIdx===i;
            return (
              <div key={i} style={{
                display:"flex", alignItems:"center", gap:"7px", padding:"9px 11px", borderRadius:"9px",
                background:sel?"rgba(56,189,248,0.1)":"rgba(255,255,255,0.02)",
                border:`1px solid ${sel?"rgba(56,189,248,0.38)":BORDER}`, transition:"all 0.14s",
              }}>
                <button onClick={()=>onSelect(v)} style={{ display:"flex",alignItems:"center",gap:"9px",flex:1,background:"none",border:"none",cursor:"pointer",outline:"none",textAlign:"left" }}>
                  <div style={{ fontFamily:SANS, fontSize:"12px", color:sel?TEXT_PRI:TEXT_SEC, fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{v.name}</div>
                  {sel && <div style={{ width:"6px",height:"6px",borderRadius:"50%",background:ACCENT3,flexShrink:0 }}/>}
                </button>
                <button onClick={()=>testVoice(v,i)} style={{
                  width:"26px",height:"26px",borderRadius:"6px",flexShrink:0,
                  background:testing?"rgba(52,211,153,0.14)":"rgba(255,255,255,0.03)",
                  border:`1px solid ${testing?"rgba(52,211,153,0.38)":BORDER}`,
                  color:testing?"#34d399":TEXT_DIM, cursor:"pointer",
                  display:"flex",alignItems:"center",justifyContent:"center",outline:"none",transition:"all 0.14s",
                }}>{testing?<IconStop size={10}/>:<IconVolume size={11}/>}</button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BOOKMARKS PANEL
// ─────────────────────────────────────────────────────────────────────────────
function BookmarksPanel({ bookmarks, messages, onJump, onRemove, onClose }) {
  return (
    <div style={{
      position:"absolute", inset:0, zIndex:13,
      background:"rgba(3,5,16,0.9)", backdropFilter:"blur(16px)",
      display:"flex", alignItems:"flex-start", justifyContent:"flex-end",
      animation:"bot-modal-in 0.22s cubic-bezier(0.22,1,0.36,1)",
    }} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{
        background:PANEL, border:`1px solid rgba(244,114,182,0.18)`,
        borderRadius:"0 0 0 18px", padding:"18px 16px",
        width:"min(340px,100vw)", height:"100%", overflowY:"auto",
        boxShadow:"-20px 0 50px rgba(0,0,0,0.5)",
      }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"16px" }}>
          <div>
            <div style={{ fontFamily:MONO, fontSize:"12px", color:TEXT_PRI, fontWeight:700, letterSpacing:"0.04em" }}>Bookmarks</div>
            <div style={{ fontFamily:MONO, fontSize:"9px", color:TEXT_DIM, marginTop:"2px" }}>{bookmarks.length} saved</div>
          </div>
          <button onClick={onClose} style={{ width:"26px",height:"26px",borderRadius:"8px",background:SURFACE,border:`1px solid ${BORDER}`,color:TEXT_DIM,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",outline:"none" }}><IconX size={12}/></button>
        </div>
        {bookmarks.length===0 && (
          <div style={{ textAlign:"center", padding:"40px 0" }}>
            <div style={{ fontSize:"24px", marginBottom:"8px" }}>🔖</div>
            <div style={{ fontFamily:SANS, fontSize:"12px", color:TEXT_DIM }}>No bookmarks yet</div>
          </div>
        )}
        <div style={{ display:"flex", flexDirection:"column", gap:"7px" }}>
          {bookmarks.map(idx => {
            const msg = messages[idx]; if (!msg) return null;
            return (
              <div key={idx} style={{ padding:"11px 13px", borderRadius:"10px",
                background:"rgba(244,114,182,0.05)", border:"1px solid rgba(244,114,182,0.14)" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"5px" }}>
                  <span style={{ fontFamily:MONO, fontSize:"8px", color:"#f472b6", letterSpacing:"0.06em" }}>MSG #{idx+1} · {msg.time}</span>
                  <div style={{ display:"flex", gap:"4px" }}>
                    <button onClick={()=>{onJump(idx);onClose();}} style={{ fontFamily:MONO,fontSize:"8px",color:ACCENT3,background:"rgba(56,189,248,0.1)",border:"1px solid rgba(56,189,248,0.22)",borderRadius:"4px",padding:"2px 7px",cursor:"pointer",outline:"none" }}>JUMP</button>
                    <button onClick={()=>onRemove(idx)} style={{ fontFamily:MONO,fontSize:"8px",color:"#fca5a5",background:"rgba(239,68,68,0.07)",border:"1px solid rgba(239,68,68,0.18)",borderRadius:"4px",padding:"2px 7px",cursor:"pointer",outline:"none" }}>✕</button>
                  </div>
                </div>
                <div style={{ fontFamily:SANS, fontSize:"11px", color:TEXT_SEC, lineHeight:"1.5",
                  overflow:"hidden", display:"-webkit-box", WebkitLineClamp:3, WebkitBoxOrient:"vertical" }}>
                  {msg.content.slice(0,130)}{msg.content.length>130?"…":""}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SEARCH OVERLAY
// ─────────────────────────────────────────────────────────────────────────────
function SearchOverlay({ messages, onClose, onJump }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);
  useEffect(()=>{ setTimeout(()=>inputRef.current?.focus(), 80); },[]);
  const results = query.trim().length < 2 ? [] : messages
    .map((m,i)=>({...m, idx:i}))
    .filter(m=>m.content.toLowerCase().includes(query.toLowerCase()))
    .slice(0,8);
  return (
    <div style={{
      position:"absolute", inset:0, zIndex:15,
      background:"rgba(3,5,16,0.92)", backdropFilter:"blur(18px)",
      display:"flex", flexDirection:"column", alignItems:"center",
      padding:"56px 18px 18px",
      animation:"bot-modal-in 0.2s cubic-bezier(0.22,1,0.36,1)",
    }} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ width:"100%", maxWidth:"520px" }}>
        <div style={{
          display:"flex", alignItems:"center", gap:"10px",
          background:SURFACE, border:`1px solid rgba(124,111,255,0.42)`,
          borderRadius:"12px", padding:"9px 13px",
          boxShadow:"0 0 0 3px rgba(124,111,255,0.07)", marginBottom:"12px",
        }}>
          <span style={{ color:TEXT_DIM }}><IconSearch size={14}/></span>
          <input ref={inputRef} value={query} onChange={e=>setQuery(e.target.value)}
            placeholder="Search messages…"
            style={{ flex:1,background:"none",border:"none",outline:"none",
              fontFamily:SANS,fontSize:"13px",color:TEXT_PRI,caretColor:ACCENT3 }}/>
          {query&&<button onClick={()=>setQuery("")} style={{ background:"none",border:"none",color:TEXT_DIM,cursor:"pointer",outline:"none",display:"flex",alignItems:"center" }}><IconX size={12}/></button>}
          <button onClick={onClose} style={{ background:SURFACE2,border:`1px solid ${BORDER}`,borderRadius:"5px",padding:"3px 8px",fontFamily:MONO,fontSize:"9px",color:TEXT_DIM,cursor:"pointer",outline:"none" }}>ESC</button>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:"5px" }}>
          {query.trim().length>=2&&results.length===0&&(
            <div style={{ textAlign:"center",fontFamily:SANS,fontSize:"12px",color:TEXT_DIM,padding:"22px 0" }}>No results for "{query}"</div>
          )}
          {results.map(m=>(
            <button key={m.idx} onClick={()=>{onJump(m.idx);onClose();}} style={{
              display:"flex",alignItems:"flex-start",gap:"9px",padding:"11px 13px",borderRadius:"10px",
              background:SURFACE,border:`1px solid ${BORDER}`,cursor:"pointer",outline:"none",textAlign:"left",transition:"all 0.14s",
            }}
              onMouseEnter={e=>{e.currentTarget.style.background="rgba(124,111,255,0.08)";e.currentTarget.style.borderColor="rgba(124,111,255,0.28)";}}
              onMouseLeave={e=>{e.currentTarget.style.background=SURFACE;e.currentTarget.style.borderColor=BORDER;}}
            >
              <div style={{ width:"22px",height:"22px",borderRadius:"6px",flexShrink:0,
                background:m.role==="user"?"rgba(124,111,255,0.18)":"rgba(56,189,248,0.14)",
                display:"flex",alignItems:"center",justifyContent:"center",
                fontFamily:MONO,fontSize:"8px",color:m.role==="user"?ACCENT2:ACCENT3,fontWeight:700,marginTop:"1px",
              }}>{m.role==="user"?"U":"AI"}</div>
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ fontFamily:SANS,fontSize:"11.5px",color:TEXT_SEC,lineHeight:"1.5",
                  overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical" }}>
                  {m.content.slice(0,110)}{m.content.length>110?"…":""}
                </div>
                <div style={{ fontFamily:MONO,fontSize:"8px",color:TEXT_DIM,marginTop:"3px" }}>{m.time} · #{m.idx+1}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SHORTCUTS MODAL
// ─────────────────────────────────────────────────────────────────────────────
function ShortcutsModal({ onClose }) {
  const shortcuts = [
    { keys:["Enter"],            desc:"Send message" },
    { keys:["Shift","Enter"],    desc:"New line" },
    { keys:["Esc"],              desc:"Close / dismiss" },
    { keys:["Ctrl","K"],         desc:"Search conversation" },
    { keys:["Ctrl","⇧","E"],    desc:"Export conversation" },
    { keys:["Ctrl","⇧","C"],    desc:"Clear conversation" },
    { keys:["Ctrl","⇧","L"],    desc:"Change language" },
    { keys:["Ctrl","M"],         desc:"Toggle voice input" },
    { keys:["Ctrl","⇧","B"],    desc:"Bookmarks" },
    { keys:["Ctrl","⇧","F"],    desc:"Focus mode" },
    { keys:["Ctrl","⇧","S"],    desc:"Toggle sound" },
  ];
  return (
    <div style={{ position:"absolute",inset:0,zIndex:14,background:"rgba(3,5,16,0.88)",backdropFilter:"blur(16px)",display:"flex",alignItems:"center",justifyContent:"center",animation:"bot-modal-in 0.22s cubic-bezier(0.22,1,0.36,1)" }}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:PANEL,border:`1px solid rgba(196,181,253,0.18)`,borderRadius:"18px",padding:"24px",width:"min(400px,calc(100vw - 28px))",boxShadow:"0 32px 80px rgba(0,0,0,0.7)",position:"relative" }}>
        <button onClick={onClose} style={{ position:"absolute",top:"12px",right:"12px",width:"26px",height:"26px",borderRadius:"8px",background:SURFACE,border:`1px solid ${BORDER}`,color:TEXT_DIM,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",outline:"none" }}><IconX size={12}/></button>
        <div style={{ marginBottom:"18px" }}>
          <div style={{ fontFamily:MONO,fontSize:"13px",color:TEXT_PRI,fontWeight:700,letterSpacing:"0.04em",marginBottom:"3px" }}>Keyboard Shortcuts</div>
          <div style={{ fontFamily:SANS,fontSize:"11px",color:TEXT_DIM }}>Move faster without lifting your hands</div>
        </div>
        <div style={{ display:"flex",flexDirection:"column",gap:"3px" }}>
          {shortcuts.map((s,i)=>(
            <div key={i} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 11px",borderRadius:"7px",background:i%2===0?SURFACE:"transparent" }}>
              <span style={{ fontFamily:SANS,fontSize:"12px",color:TEXT_SEC }}>{s.desc}</span>
              <div style={{ display:"flex",gap:"3px" }}>
                {s.keys.map((k,ki)=>(
                  <span key={ki} style={{ fontFamily:MONO,fontSize:"9px",color:"#c4b5fd",background:"rgba(196,181,253,0.09)",border:"1px solid rgba(196,181,253,0.22)",borderRadius:"4px",padding:"2px 6px" }}>{k}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT
// ─────────────────────────────────────────────────────────────────────────────
function exportConversation(messages) {
  const lines = ["# VisuoSlayer AI — Export", `${new Date().toLocaleString()}`, "","---",""];
  messages.forEach(m=>{
    lines.push(`## [${m.time}] ${m.role==="user"?"You":"VisuoSlayer AI"}`);
    lines.push(""); lines.push(m.content); lines.push(""); lines.push("---"); lines.push("");
  });
  const blob = new Blob([lines.join("\n")],{type:"text/markdown"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href=url; a.download=`vsai-${Date.now()}.md`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
}

// ─────────────────────────────────────────────────────────────────────────────
// VOICE INPUT
// ─────────────────────────────────────────────────────────────────────────────
function useVoiceInput(onTranscript) {
  const [listening, setListening] = useState(false);
  const recogRef = useRef(null);
  const toggle = useCallback(()=>{
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("Speech recognition not supported."); return; }
    if (listening) { recogRef.current?.stop(); setListening(false); return; }
    const r = new SR(); recogRef.current=r;
    r.continuous=false; r.interimResults=false; r.lang="en-US";
    r.onstart=()=>setListening(true); r.onend=()=>setListening(false); r.onerror=()=>setListening(false);
    r.onresult=(e)=>{
      const t=Array.from(e.results).map(r=>r[0].transcript).join(" ").trim();
      if (t) onTranscript(t);
    };
    r.start();
  },[listening,onTranscript]);
  return { listening, toggle };
}

// ─────────────────────────────────────────────────────────────────────────────
// VOICE ENGINE
// ─────────────────────────────────────────────────────────────────────────────
function useVoiceEngine(voiceSpeedRef, selectedVoiceRef) {
  const [speakingIdx, setSpeakingIdx] = useState(null);
  const speakText = useCallback((text,idx,overrideRate)=>{
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel(); setSpeakingIdx(idx);
    const clean = text.replace(/```[\s\S]*?```/g,"").replace(/\*\*/g,"").replace(/`/g,"").trim();
    const utt = new SpeechSynthesisUtterance(clean);
    utt.lang="en-US"; utt.rate=overrideRate??voiceSpeedRef.current;
    if (selectedVoiceRef.current) utt.voice=selectedVoiceRef.current;
    utt.onend=()=>setSpeakingIdx(null); utt.onerror=()=>setSpeakingIdx(null);
    window.speechSynthesis.speak(utt);
  },[]);
  const stopSpeak = useCallback(()=>{ window.speechSynthesis?.cancel(); setSpeakingIdx(null); },[]);
  const changeSpeedWhileSpeaking = useCallback((rate,text,idx)=>{
    if (speakingIdx===idx) { window.speechSynthesis.cancel(); setTimeout(()=>speakText(text,idx,rate),80); }
  },[speakingIdx,speakText]);
  return { speakingIdx, speakText, stopSpeak, changeSpeedWhileSpeaking };
}

// ─────────────────────────────────────────────────────────────────────────────
// MESSAGE BUBBLE — enhanced
// ─────────────────────────────────────────────────────────────────────────────
function MessageBubble({ msg, idx, speakingIdx, onSpeak, onStopSpeak, voiceSpeed, onSpeedChange, isBookmarked, onBookmark, isStreaming, isMobile }) {
  const isUser = msg.role === "user";
  const isSpeaking = speakingIdx === idx;
  const [copied, setCopied] = useState(false);
  const [showSpeeds, setShowSpeeds] = useState(false);
  const [streamDone, setStreamDone] = useState(!isStreaming);
  const speedRef = useRef(null);

  useEffect(()=>{ if (!isStreaming) setStreamDone(true); },[isStreaming]);
  useEffect(()=>{
    if (!showSpeeds) return;
    const fn=(e)=>{ if(speedRef.current&&!speedRef.current.contains(e.target)) setShowSpeeds(false); };
    document.addEventListener("mousedown",fn);
    return ()=>document.removeEventListener("mousedown",fn);
  },[showSpeeds]);

  const handleCopy = ()=>{
    navigator.clipboard?.writeText(msg.content).catch(()=>{});
    setCopied(true); setTimeout(()=>setCopied(false),1800);
  };
  const handleSpeedChange=(rate)=>{ onSpeedChange(rate,msg.content,idx); setShowSpeeds(false); };

  return (
    <div className="bot-msg-in" style={{
      display:"flex",
      flexDirection: isUser ? "row-reverse" : "row",
      alignItems:"flex-start", gap:"10px",
      animationDelay:`${Math.min(idx*0.04,0.3)}s`,
    }}>

      {/* AI Avatar */}
      {!isUser && (
        <div style={{
          width:"30px", height:"30px", borderRadius:"9px", flexShrink:0,
          background:"linear-gradient(135deg,#1e1b4b 0%,#0f172a 100%)",
          display:"flex", alignItems:"center", justifyContent:"center",
          border:`1px solid rgba(124,111,255,0.32)`,
          boxShadow:`0 4px 16px ${GLOW_A}`, marginTop:"2px",
        }}>
          <RobotLogo size={18}/>
        </div>
      )}

      <div style={{
        maxWidth: isUser ? "min(76%,600px)" : "min(88%,720px)",
        width:"fit-content",
      }}>

        {/* ── TOP BAR: name + actions (AI only) ── */}
        {!isUser && (
          <div ref={speedRef} style={{
            display:"flex", alignItems:"center",
            justifyContent:"space-between",
            marginBottom:"6px", position:"relative",
          }}>
            {/* Left: name + status dot */}
            <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
              <span style={{ fontFamily:MONO, fontSize:"9px", fontWeight:700, color:ACCENT2, letterSpacing:"0.1em" }}>
                VISUOSLAYER AI
              </span>
              <div style={{ width:"4px", height:"4px", borderRadius:"50%", background:"#34d399", boxShadow:"0 0 5px #34d399" }}/>
              {isStreaming && !streamDone && (
                <span style={{ fontFamily:MONO, fontSize:"8px", color:ACCENT3, animation:"bot-antenna-pulse 1s infinite" }}>
                  GENERATING…
                </span>
              )}
            </div>

            {/* Right: bookmark + copy + speed + tts */}
            <div style={{ display:"flex", alignItems:"center", gap:"3px" }}>

              {/* Bookmark */}
              <button onClick={()=>onBookmark(idx)} style={{
                display:"flex", alignItems:"center",
                background:isBookmarked?"rgba(244,114,182,0.13)":"none",
                border:`1px solid ${isBookmarked?"rgba(244,114,182,0.28)":"transparent"}`,
                borderRadius:"6px", padding:"4px 5px",
                color:isBookmarked?"#f472b6":TEXT_DIM,
                cursor:"pointer", outline:"none", transition:"all 0.16s",
              }}><IconBookmark size={11}/></button>

              {/* Copy */}
              <button onClick={handleCopy} style={{
                display:"flex", alignItems:"center", gap:"3px",
                background:copied?"rgba(52,211,153,0.13)":"none",
                border:`1px solid ${copied?"rgba(52,211,153,0.28)":"transparent"}`,
                borderRadius:"6px", padding:"4px 7px",
                fontFamily:MONO, fontSize:"8px",
                color:copied?"#34d399":TEXT_DIM,
                cursor:"pointer", outline:"none", transition:"all 0.16s", letterSpacing:"0.04em",
              }}>
                {copied
                  ? <><IconCheck size={9}/>&nbsp;COPIED</>
                  : <><IconCopy size={9}/>&nbsp;COPY</>
                }
              </button>

              {/* Speed badge — only when speaking */}
              {isSpeaking && (
                <button onClick={()=>setShowSpeeds(v=>!v)} style={{
                  background:"rgba(56,189,248,0.1)", border:"1px solid rgba(56,189,248,0.28)",
                  borderRadius:"5px", padding:"2px 7px",
                  fontFamily:MONO, fontSize:"8px", color:ACCENT3,
                  cursor:"pointer", outline:"none", letterSpacing:"0.04em",
                }}>
                  {SPEED_OPTIONS.find(s=>s.rate===voiceSpeed)?.label??"1×"}
                </button>
              )}

              {/* Speed dropdown */}
              {showSpeeds && (
                <div style={{
                  position:"absolute", top:"calc(100% + 5px)", right:0, zIndex:60,
                  background:"rgba(7,9,20,0.98)", border:`1px solid rgba(124,111,255,0.22)`,
                  borderRadius:"9px", overflow:"hidden", boxShadow:"0 12px 32px rgba(0,0,0,0.6)",
                  animation:"bot-tip-in 0.15s ease-out", minWidth:"76px",
                }}>
                  {SPEED_OPTIONS.map(opt=>(
                    <button key={opt.rate} onClick={()=>handleSpeedChange(opt.rate)} style={{
                      display:"block", width:"100%", padding:"7px 12px",
                      background:voiceSpeed===opt.rate?"rgba(124,111,255,0.14)":"none",
                      border:"none", borderBottom:`1px solid ${BORDER}`,
                      fontFamily:MONO, fontSize:"9px",
                      color:voiceSpeed===opt.rate?ACCENT3:TEXT_SEC,
                      cursor:"pointer", textAlign:"left", outline:"none",
                    }}>{opt.label}</button>
                  ))}
                </div>
              )}

              {/* TTS toggle */}
              <button onClick={()=>isSpeaking?onStopSpeak():onSpeak(msg.content,idx)} style={{
                background:isSpeaking?"rgba(56,189,248,0.13)":"none",
                border:`1px solid ${isSpeaking?"rgba(56,189,248,0.28)":"transparent"}`,
                borderRadius:"6px", padding:"4px 5px",
                color:isSpeaking?ACCENT3:TEXT_DIM,
                display:"flex", alignItems:"center", justifyContent:"center",
                cursor:"pointer", outline:"none", transition:"all 0.16s",
              }}>
                {isSpeaking?<IconVolumeOff size={12}/>:<IconVolume size={12}/>}
              </button>

            </div>
          </div>
        )}

        {/* ── BUBBLE ── */}
        <div style={{
          padding: isUser ? "11px 15px" : "14px 16px",
          borderRadius: isUser ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
          background: isUser
            ? "linear-gradient(135deg,rgba(124,111,255,0.22) 0%,rgba(56,189,248,0.1) 100%)"
            : SURFACE,
          border:`1px solid ${isUser ? "rgba(124,111,255,0.3)" : BORDER}`,
          boxShadow: isUser
            ? "0 4px 20px rgba(124,111,255,0.15)"
            : "0 2px 12px rgba(0,0,0,0.3)",
          position:"relative",
        }}>
          {!isUser && (
            <div style={{
              position:"absolute", top:0, left:"14px", right:"14px", height:"1px",
              background:`linear-gradient(90deg,transparent,${ACCENT}40,transparent)`,
            }}/>
          )}

          {/* Message content */}
          <div style={{
            fontFamily:SANS, fontSize:"13.5px", lineHeight:"1.72",
            color: isUser ? TEXT_PRI : TEXT_SEC,
            fontWeight: isUser ? 500 : 400,
          }}>
            {isUser
              ? msg.content
              : isStreaming && !streamDone
                ? <StreamingMessage fullText={msg.content} onDone={()=>setStreamDone(true)} streamKey={msg.streamKey}/>
                : <RichText content={msg.content} cardData={msg.card}/>
            }
          </div>

          {/* Timestamp only at bottom */}
          <div style={{
            marginTop:"8px",
            display:"flex", alignItems:"center",
            justifyContent: isUser ? "flex-end" : "flex-start",
          }}>
            <span style={{ fontFamily:MONO, fontSize:"8.5px", color:TEXT_DIM }}>{msg.time}</span>
            {isUser && <span style={{ fontSize:"9px", color:ACCENT2, opacity:0.6, marginLeft:"5px" }}>✓✓</span>}
          </div>

        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LANGUAGE SELECTOR
// ─────────────────────────────────────────────────────────────────────────────
function LanguageSelector({ currentLang, onSelect, onClose }) {
  const langs = [
    { name:"Python",icon:"🐍",color:"#3b82f6" },{ name:"JavaScript",icon:"⚡",color:"#f59e0b" },
    { name:"TypeScript",icon:"🔷",color:"#60a5fa" },{ name:"Java",icon:"☕",color:"#ef4444" },
    { name:"C++",icon:"⚙️",color:"#8b5cf6" },{ name:"C#",icon:"🎯",color:"#a855f7" },
    { name:"Go",icon:"🔵",color:"#06b6d4" },{ name:"Rust",icon:"🦀",color:"#f97316" },
    { name:"Kotlin",icon:"🟣",color:"#7c3aed" },{ name:"Swift",icon:"🍎",color:"#f43f5e" },
  ];
  return (
    <div style={{ position:"absolute",inset:0,zIndex:10,background:"rgba(3,5,16,0.88)",backdropFilter:"blur(16px)",display:"flex",alignItems:"center",justifyContent:"center",animation:"bot-modal-in 0.22s cubic-bezier(0.22,1,0.36,1)" }}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:PANEL,border:`1px solid rgba(124,111,255,0.22)`,borderRadius:"18px",padding:"26px 22px",width:"min(440px,calc(100vw - 28px))",boxShadow:"0 32px 80px rgba(0,0,0,0.7)",position:"relative",maxHeight:"90vh",overflowY:"auto" }}>
        <button onClick={onClose} style={{ position:"absolute",top:"12px",right:"12px",width:"26px",height:"26px",borderRadius:"8px",background:SURFACE,border:`1px solid ${BORDER}`,color:TEXT_DIM,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",outline:"none" }}><IconX size={12}/></button>
        <div style={{ textAlign:"center",marginBottom:"20px" }}>
          <div style={{ fontFamily:MONO,fontSize:"14px",color:TEXT_PRI,fontWeight:700,letterSpacing:"0.04em",marginBottom:"5px" }}>Preferred Language</div>
          <div style={{ fontFamily:SANS,fontSize:"11.5px",color:TEXT_DIM }}>Code examples will use this language</div>
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px" }}>
          {langs.map(lang=>{
            const sel=currentLang===lang.name;
            return (
              <button key={lang.name} onClick={()=>onSelect(lang.name)} style={{
                display:"flex",alignItems:"center",gap:"9px",padding:"10px 12px",borderRadius:"11px",
                background:sel?`${lang.color}1a`:"rgba(255,255,255,0.02)",
                border:`1px solid ${sel?`${lang.color}48`:BORDER}`,
                color:sel?TEXT_PRI:TEXT_SEC,cursor:"pointer",fontFamily:SANS,fontSize:"12px",
                fontWeight:600,transition:"all 0.16s",outline:"none",textAlign:"left",
              }}
                onMouseEnter={e=>{if(!sel){e.currentTarget.style.background=`${lang.color}10`;e.currentTarget.style.borderColor=`${lang.color}30`;}}}
                onMouseLeave={e=>{if(!sel){e.currentTarget.style.background="rgba(255,255,255,0.02)";e.currentTarget.style.borderColor=BORDER;}}}
              >
                <span style={{ fontSize:"14px",flexShrink:0 }}>{lang.icon}</span>
                <span>{lang.name}</span>
                {sel&&<div style={{ width:"6px",height:"6px",borderRadius:"50%",background:lang.color,marginLeft:"auto",flexShrink:0 }}/>}
              </button>
            );
          })}
        </div>
        {currentLang&&(
          <div style={{ marginTop:"12px",padding:"8px 13px",borderRadius:"9px",background:"rgba(124,111,255,0.06)",border:`1px solid rgba(124,111,255,0.14)`,fontFamily:MONO,fontSize:"9px",color:ACCENT2,letterSpacing:"0.06em",display:"flex",alignItems:"center",gap:"7px" }}>
            <span style={{ opacity:0.5 }}>ACTIVE →</span>
            <span style={{ color:ACCENT3,fontWeight:700 }}>{currentLang}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CLEAR MODAL
// ─────────────────────────────────────────────────────────────────────────────
function ClearModal({ count, onConfirm, onCancel }) {
  return (
    <div style={{ position:"absolute",inset:0,zIndex:11,background:"rgba(3,5,16,0.88)",backdropFilter:"blur(16px)",display:"flex",alignItems:"center",justifyContent:"center",animation:"bot-modal-in 0.2s cubic-bezier(0.22,1,0.36,1)" }}
      onClick={e=>e.target===e.currentTarget&&onCancel()}>
      <div style={{ background:PANEL,border:"1px solid rgba(239,68,68,0.18)",borderRadius:"16px",padding:"24px",width:"min(300px,calc(100vw - 28px))",boxShadow:"0 24px 60px rgba(0,0,0,0.7)",textAlign:"center" }}>
        <div style={{ width:"44px",height:"44px",borderRadius:"13px",margin:"0 auto 12px",background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.18)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"18px" }}>🗑️</div>
        <div style={{ fontFamily:MONO,fontSize:"12px",color:TEXT_PRI,marginBottom:"7px",fontWeight:700 }}>Clear conversation?</div>
        <div style={{ fontFamily:SANS,fontSize:"12px",color:TEXT_DIM,marginBottom:"18px",lineHeight:1.5 }}>This will remove all {count} message{count!==1?"s":""}.</div>
        <div style={{ display:"flex",gap:"8px" }}>
          <button onClick={onCancel} style={{ flex:1,padding:"9px",borderRadius:"9px",background:SURFACE,border:`1px solid ${BORDER2}`,color:TEXT_SEC,fontFamily:SANS,fontSize:"12px",fontWeight:600,cursor:"pointer",outline:"none",transition:"all 0.16s" }}
            onMouseEnter={e=>{e.currentTarget.style.background=SURFACE2;e.currentTarget.style.color=TEXT_PRI;}}
            onMouseLeave={e=>{e.currentTarget.style.background=SURFACE;e.currentTarget.style.color=TEXT_SEC;}}
          >Cancel</button>
          <button onClick={onConfirm} style={{ flex:1,padding:"9px",borderRadius:"9px",background:"rgba(239,68,68,0.15)",border:"1px solid rgba(239,68,68,0.3)",color:"#fca5a5",fontFamily:SANS,fontSize:"12px",fontWeight:700,cursor:"pointer",outline:"none",transition:"all 0.16s" }}
            onMouseEnter={e=>{e.currentTarget.style.background="rgba(239,68,68,0.25)";}}
            onMouseLeave={e=>{e.currentTarget.style.background="rgba(239,68,68,0.15)";}}
          >Clear All</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FOCUS MODE BANNER
// ─────────────────────────────────────────────────────────────────────────────
function FocusModeBanner({ onExit }) {
  return (
    <div style={{ padding:"5px 16px",background:"rgba(251,191,36,0.05)",borderBottom:"1px solid rgba(251,191,36,0.12)",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0 }}>
      <div style={{ display:"flex",alignItems:"center",gap:"7px" }}>
        <span style={{ width:"5px",height:"5px",borderRadius:"50%",background:"#fbbf24",boxShadow:"0 0 5px #fbbf24",display:"inline-block" }}/>
        <span style={{ fontFamily:MONO,fontSize:"9px",color:"#fbbf24",letterSpacing:"0.08em" }}>FOCUS MODE — DISTRACTION-FREE</span>
      </div>
      <button onClick={onExit} style={{ fontFamily:MONO,fontSize:"8px",color:TEXT_DIM,background:SURFACE,border:`1px solid ${BORDER}`,borderRadius:"5px",padding:"2px 8px",cursor:"pointer",outline:"none" }}>EXIT</button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EMPTY STATE
// ─────────────────────────────────────────────────────────────────────────────
function EmptyState({ onSend }) {
  const [activeGroup, setActiveGroup] = useState(0);
  const group = SUGGESTION_GROUPS[activeGroup];
  return (
    <div style={{ flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-start",padding:"24px 0 16px",minHeight:"100%" }}>
      {/* Hero */}
      <div style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:"12px",marginBottom:"28px" }}>
        <div style={{ position:"relative",animation:"bot-empty-float 7s ease-in-out infinite" }}>
          <div style={{ width:"66px",height:"66px",borderRadius:"18px",background:"linear-gradient(135deg,#1e1b4b 0%,#0f172a 100%)",display:"flex",alignItems:"center",justifyContent:"center",border:`1.5px solid rgba(124,111,255,0.42)`,boxShadow:`0 8px 32px ${GLOW_A}`,position:"relative",overflow:"hidden" }}>
            <RobotLogo size={38} animated/>
            <div style={{ position:"absolute",left:0,right:0,height:"1.5px",background:`linear-gradient(90deg,transparent,${ACCENT3}70,transparent)`,animation:"bot-scan-line 3s ease-in-out infinite" }}/>
          </div>
          {[0,1].map(i=>(
            <div key={i} style={{ position:"absolute",inset:`${-13-i*10}px`,borderRadius:`${24+i*7}px`,border:`1px solid rgba(124,111,255,${0.12-i*0.04})`,animation:`bot-ring-expand ${2.5+i}s ease-out ${i*0.8}s infinite` }}/>
          ))}
        </div>
        <div style={{ textAlign:"center",maxWidth:"290px" }}>
          <div style={{ fontFamily:MONO,fontSize:"16px",fontWeight:700,letterSpacing:"0.02em",background:`linear-gradient(90deg,${TEXT_PRI} 0%,${ACCENT2} 55%,${ACCENT3} 100%)`,backgroundSize:"200% auto",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",marginBottom:"6px",animation:"bot-logo-shimmer 5s ease-in-out infinite" }}>
            What do you want to master?
          </div>
          <div style={{ fontFamily:SANS,fontSize:"12.5px",color:TEXT_DIM,lineHeight:"1.6" }}>
            Pick a topic or type your own question
          </div>
        </div>
      </div>

      {/* Category pills */}
      <div style={{ display:"flex",gap:"6px",marginBottom:"14px",width:"100%",maxWidth:"500px",flexWrap:"wrap",justifyContent:"center",padding:"0 4px" }}>
        {SUGGESTION_GROUPS.map((g,gi)=>(
          <button key={gi} onClick={()=>setActiveGroup(gi)} style={{
            padding:"5px 13px",borderRadius:"40px",
            background:activeGroup===gi?`${g.color}1a`:"rgba(255,255,255,0.03)",
            border:`1px solid ${activeGroup===gi?`${g.color}50`:BORDER}`,
            fontFamily:MONO,fontSize:"9px",fontWeight:700,letterSpacing:"0.08em",
            color:activeGroup===gi?g.color:TEXT_DIM,
            cursor:"pointer",outline:"none",transition:"all 0.16s",
          }}
            onMouseEnter={e=>{if(activeGroup!==gi){e.currentTarget.style.color=TEXT_SEC;e.currentTarget.style.background="rgba(255,255,255,0.05)";}}}
            onMouseLeave={e=>{if(activeGroup!==gi){e.currentTarget.style.color=TEXT_DIM;e.currentTarget.style.background="rgba(255,255,255,0.03)";}}}
          >{g.group.toUpperCase()}</button>
        ))}
      </div>

      {/* Suggestions */}
      <div style={{ display:"flex",flexDirection:"column",gap:"8px",width:"100%",maxWidth:"500px",padding:"0 4px" }}>
        {group.items.map((s,i)=>(
          <button key={`${activeGroup}-${i}`} className="bot-suggestion" onClick={()=>onSend(s.label)}
            style={{ display:"flex",alignItems:"center",gap:"13px",padding:"13px 15px",borderRadius:"13px",background:`${group.color}08`,border:`1px solid ${group.color}1e`,color:TEXT_SEC,fontFamily:SANS,fontSize:"13px",fontWeight:500,cursor:"pointer",textAlign:"left",outline:"none",animation:`bot-suggestion-slide 0.28s cubic-bezier(0.22,1,0.36,1) ${i*0.06}s both` }}
            onMouseEnter={e=>{ e.currentTarget.style.background=`${group.color}14`; e.currentTarget.style.borderColor=`${group.color}42`; e.currentTarget.style.color=TEXT_PRI; }}
            onMouseLeave={e=>{ e.currentTarget.style.background=`${group.color}08`; e.currentTarget.style.borderColor=`${group.color}1e`; e.currentTarget.style.color=TEXT_SEC; }}
          >
            <span style={{ width:"36px",height:"36px",borderRadius:"9px",flexShrink:0,background:`${group.color}12`,border:`1px solid ${group.color}24`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:MONO,fontSize:"14px",color:group.color }}>{s.icon}</span>
            <div style={{ flex:1,minWidth:0 }}>
              <div style={{ fontWeight:600,fontSize:"13px",lineHeight:"1.35",marginBottom:"2px" }}>{s.label}</div>
              <div style={{ fontFamily:MONO,fontSize:"9px",color:group.color,opacity:0.55,letterSpacing:"0.04em" }}>{s.sub}</div>
            </div>
            <span style={{ color:TEXT_DIM,fontSize:"15px",flexShrink:0 }}>›</span>
          </button>
        ))}
      </div>

      <div style={{ marginTop:"20px",display:"flex",alignItems:"center",gap:"10px",width:"100%",maxWidth:"500px",padding:"0 4px" }}>
        <div style={{ flex:1,height:"1px",background:BORDER }}/>
        <span style={{ fontFamily:MONO,fontSize:"8px",color:TEXT_DIM,letterSpacing:"0.09em",whiteSpace:"nowrap" }}>OR TYPE YOUR OWN</span>
        <div style={{ flex:1,height:"1px",background:BORDER }}/>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function ChatBot() {
  const [open,           setOpen]           = useState(false);
  const [messages,       setMessages]       = useState([]);
  const [streamingIdx,   setStreamingIdx]   = useState(null);
  const [input,          setInput]          = useState("");
  const [loading,        setLoading]        = useState(false);
  const [fabHov,         setFabHov]         = useState(false);
  const [mounted,        setMounted]        = useState(false);
  const [inputFoc,       setInputFoc]       = useState(false);
  const [particles,      setParticles]      = useState([]);
  const [panelAnim,      setPanelAnim]      = useState("in");
  const [charCount,      setCharCount]      = useState(0);
  const [userLanguage,   setUserLanguage]   = useState(null);
  const [showLangModal,  setShowLangModal]  = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showSearch,     setShowSearch]     = useState(false);
  const [showShortcuts,  setShowShortcuts]  = useState(false);
  const [showBookmarks,  setShowBookmarks]  = useState(false);
  const [bookmarks,      setBookmarks]      = useState([]);
  const [focusMode,      setFocusMode]      = useState(false);
  const [voiceSpeed,     setVoiceSpeed]     = useState(1.0);
  const [selectedVoice,  setSelectedVoice]  = useState(null);
  const [jumpToIdx,      setJumpToIdx]      = useState(null);
  const [exportFlash,    setExportFlash]    = useState(false);
  const [isMobile,       setIsMobile]       = useState(false);
  const [soundEnabled,   setSoundEnabled]   = useState(true);
  const [unreadCount,    setUnreadCount]    = useState(0);

  const voiceSpeedRef    = useRef(1.0);
  const selectedVoiceRef = useRef(null);
  const abortRef         = useRef(null);
  const messagesEndRef   = useRef(null);
  const inputRef         = useRef(null);
  const textareaRef      = useRef(null);
  const msgRefs          = useRef({});
  const scrollContainerRef = useRef(null);

  useEffect(()=>{ voiceSpeedRef.current=voiceSpeed; },[voiceSpeed]);
  useEffect(()=>{ selectedVoiceRef.current=selectedVoice; },[selectedVoice]);
  useEffect(()=>{ soundEngine.enabled=soundEnabled; },[soundEnabled]);

  useEffect(()=>{
    const check=()=>setIsMobile(window.innerWidth<=600);
    check(); window.addEventListener("resize",check);
    return ()=>window.removeEventListener("resize",check);
  },[]);

  useEffect(()=>{
    if (open) {
      const prev=document.body.style.overflow;
      document.body.style.overflow="hidden";
      document.body.style.position="fixed";
      document.body.style.width="100%";
      return ()=>{ document.body.style.overflow=prev; document.body.style.position=""; document.body.style.width=""; };
    }
  },[open]);

  const { speakingIdx, speakText, stopSpeak, changeSpeedWhileSpeaking } = useVoiceEngine(voiceSpeedRef, selectedVoiceRef);
  const { listening, toggle: toggleVoice } = useVoiceInput((transcript)=>{
    setInput(prev=>(prev?prev+" ":"")+transcript);
    setCharCount(prev=>prev+transcript.length+1);
  });

  useEffect(()=>{
    try {
      const stored=localStorage.getItem("vsai_lang");
      if (stored) setUserLanguage(stored); else setShowLangModal(true);
    } catch {}
  },[]);

  const handleLanguageSelect=(lang)=>{
    setUserLanguage(lang);
    try { localStorage.setItem("vsai_lang",lang); } catch {}
    setShowLangModal(false);
  };

  useEffect(()=>{
    setMounted(true);
    setParticles(Array.from({length:10},(_,i)=>({
      id:i, top:`${8+(i*9.1)%84}%`, left:`${8+((i*41)%84)}%`,
      delay:`${i*0.38}s`, dur:`${3.5+(i%4)*0.7}s`,
      size:i%3===0?"2.5px":i%3===1?"1.5px":"2px",
      color:i%4===0?ACCENT:i%4===1?ACCENT3:i%4===2?"#f472b6":"#34d399",
    })));
  },[]);

  useEffect(()=>{ messagesEndRef.current?.scrollIntoView({behavior:"smooth"}); },[messages,loading]);
  useEffect(()=>{ if(open){ setTimeout(()=>inputRef.current?.focus(),350); soundEngine.playOpen(); } },[open]);

  useEffect(()=>{
    if (!open) { setUnreadCount(messages.filter(m=>m.role==="assistant").length); }
    else { setUnreadCount(0); }
  },[open,messages]);

  useEffect(()=>{
    if (jumpToIdx!==null&&msgRefs.current[jumpToIdx]) {
      msgRefs.current[jumpToIdx].scrollIntoView({behavior:"smooth",block:"center"});
      setJumpToIdx(null);
    }
  },[jumpToIdx]);

  useEffect(()=>{
    const el=scrollContainerRef.current;
    if (!el||!open) return;
    const handler=(e)=>e.stopPropagation();
    el.addEventListener("wheel",handler,{passive:true});
    return ()=>el.removeEventListener("wheel",handler);
  },[open]);

  useEffect(()=>{
    const h=(e)=>{
      if(e.key==="Escape"){
        if(showSearch){setShowSearch(false);return;}
        if(showShortcuts){setShowShortcuts(false);return;}
        if(showVoiceModal){setShowVoiceModal(false);return;}
        if(showBookmarks){setShowBookmarks(false);return;}
        if(open) closePanel();
      }
      if(!open) return;
      if((e.ctrlKey||e.metaKey)&&e.key==="k"){e.preventDefault();setShowSearch(true);}
      if((e.ctrlKey||e.metaKey)&&e.shiftKey&&e.key==="E"){e.preventDefault();handleExport();}
      if((e.ctrlKey||e.metaKey)&&e.shiftKey&&e.key==="C"){e.preventDefault();if(messages.length>0)setShowClearModal(true);}
      if((e.ctrlKey||e.metaKey)&&e.shiftKey&&e.key==="L"){e.preventDefault();setShowLangModal(true);}
      if((e.ctrlKey||e.metaKey)&&e.key==="m"){e.preventDefault();toggleVoice();}
      if((e.ctrlKey||e.metaKey)&&e.key==="/"){e.preventDefault();setShowShortcuts(true);}
      if((e.ctrlKey||e.metaKey)&&e.shiftKey&&e.key==="B"){e.preventDefault();setShowBookmarks(v=>!v);}
      if((e.ctrlKey||e.metaKey)&&e.shiftKey&&e.key==="F"){e.preventDefault();setFocusMode(v=>!v);}
      if((e.ctrlKey||e.metaKey)&&e.shiftKey&&e.key==="S"){e.preventDefault();setSoundEnabled(v=>!v);}
    };
    window.addEventListener("keydown",h);
    return ()=>window.removeEventListener("keydown",h);
  },[open,showSearch,showShortcuts,showVoiceModal,showBookmarks,messages,toggleVoice]);

  useEffect(()=>{
    if (textareaRef.current) {
      textareaRef.current.style.height="22px";
      textareaRef.current.style.height=Math.min(textareaRef.current.scrollHeight,96)+"px";
    }
  },[input]);

  const closePanel=()=>{ setPanelAnim("out"); setTimeout(()=>{setOpen(false);setPanelAnim("in");},260); };
  const openPanel=()=>{ setOpen(true);setPanelAnim("in"); };
  const getTime=()=>new Date().toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"});
  const handleExport=()=>{ if(!messages.length)return; exportConversation(messages); setExportFlash(true); setTimeout(()=>setExportFlash(false),1500); };
  const toggleBookmark=(idx)=>setBookmarks(prev=>prev.includes(idx)?prev.filter(b=>b!==idx):[...prev,idx]);

  const handleSpeedChange=useCallback((newRate,msgContent,msgIdx)=>{
    setVoiceSpeed(newRate); voiceSpeedRef.current=newRate;
    changeSpeedWhileSpeaking(newRate,msgContent,msgIdx);
  },[changeSpeedWhileSpeaking]);

  // ── SEND ──
  const sendMessage = useCallback(async(text)=>{
    const userText=(text??input).trim();
    if (!userText) return;
    if (abortRef.current){abortRef.current.abort();abortRef.current=null;}
    stopSpeak(); soundEngine.playSend();
    setInput(""); setCharCount(0); setLoading(true); setStreamingIdx(null);
    const streamKey=Date.now();
    const userMsg={role:"user",content:userText,time:getTime()};
    setMessages(prev=>[...prev,userMsg]);
    const controller=new AbortController(); abortRef.current=controller;

    try {
      const lang=userLanguage||"Python";
      const systemPrompt = `You are a concise, expert DSA tutor.

STRICT RULES:
1. NEVER open with greetings, affirmations or filler.
2. BEGIN immediately with technical content.
3. Use **bold** for key terms, \`inline code\` for variables/complexities, fenced code blocks for algorithms.
4. Use bullet points (-) for lists.
5. Always include a working ${lang} code example.
6. Structure: Concept → intuition → complexity → code.
7. NEVER use ### or ## or # headings. Write section labels as plain **bold** text instead.

After your explanation, output a JSON knowledge card inside <CARD></CARD> tags. Use this exact format:
<CARD>
{
  "title": "Topic Name",
  "timeComplexity": "O(n log n)",
  "concept": "One sentence crystal-clear definition.",
  "steps": [
    {"title": "Step title", "desc": "What happens in this step"},
    {"title": "Step title", "desc": "What happens in this step"}
  ],
  "analogies": [
    {"label": "Real world", "text": "Analogy text here"},
    {"label": "Mental model", "text": "Another analogy"}
  ],
  "complexity": [
    {"label": "Time (average)", "value": "O(n log n)", "note": "Divide & merge phases"},
    {"label": "Time (worst)", "value": "O(n²)", "note": "Already sorted input"},
    {"label": "Space", "value": "O(n)", "note": "Merge buffer"}
  ],
  "pitfalls": [
    "Common mistake 1",
    "Common mistake 2"
  ]
}
</CARD>

Supported timeComplexity values: O(1), O(log n), O(n), O(n log n), O(n²), O(2ⁿ)`;

      const historyForApi=[...messages,userMsg].map(m=>({role:m.role,content:m.content}));
      const res=await fetch("/api/chat",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({messages:[{role:"system",content:systemPrompt},...historyForApi]}),
        signal:controller.signal,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data=await res.json();
      let reply=data.content??data.error??"Something went wrong.";
      if (controller.signal.aborted) return;

      // Extract CARD JSON
      let cardData=null;
      const cardMatch=reply.match(/<CARD>([\s\S]*?)<\/CARD>/);
      if (cardMatch) {
        try { cardData=JSON.parse(cardMatch[1].trim()); } catch {}
        reply=reply.replace(/<CARD>[\s\S]*?<\/CARD>/g,"").trim();
      }

      setMessages(prev=>{
        const next=[...prev,{role:"assistant",content:reply,time:getTime(),streamKey,card:cardData}];
        setStreamingIdx(next.length-1);
        return next;
      });
    } catch(err) {
      if (err.name==="AbortError") return;
      soundEngine.playError();
      setMessages(prev=>[...prev,{role:"assistant",content:"Connection error. Please try again.",time:getTime(),streamKey}]);
    } finally {
      if (!controller.signal.aborted) setLoading(false);
      abortRef.current=null;
    }
  },[input,messages,loading,userLanguage,stopSpeak]);

  const handleKey=(e)=>{ if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMessage();} };
  const handleInput=(e)=>{ setInput(e.target.value); setCharCount(e.target.value.length); soundEngine.playTyping(); };

  if (!mounted) return null;
  const hasMessages=messages.length>0;
  const chatPaddingH=isMobile?"12px":"clamp(14px,4vw,72px)";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;}

        @keyframes bot-typing-dot {
          0%,60%,100%{transform:translateY(0) scale(0.8);opacity:0.4;}
          30%{transform:translateY(-5px) scale(1.1);opacity:1;}
        }
        @keyframes bot-panel-in{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes bot-panel-out{from{opacity:1;transform:translateY(0)}to{opacity:0;transform:translateY(16px)}}
        @keyframes bot-fab-pulse{
          0%,100%{box-shadow:0 0 0 0 rgba(124,111,255,0),0 8px 30px rgba(124,111,255,0.4)}
          50%{box-shadow:0 0 0 9px rgba(124,111,255,0.05),0 8px 30px rgba(124,111,255,0.55)}
        }
        @keyframes bot-msg-in{from{opacity:0;transform:translateY(9px) scale(0.98)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes bot-particle{0%,100%{opacity:0.08;transform:translateY(0) scale(1)}50%{opacity:0.4;transform:translateY(-9px) scale(1.3)}}
        @keyframes bot-orb1{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(16px,-10px) scale(1.07)}66%{transform:translate(-7px,7px) scale(0.94)}}
        @keyframes bot-orb2{0%,100%{transform:translate(0,0) scale(1)}40%{transform:translate(-13px,9px) scale(1.04)}80%{transform:translate(9px,-5px) scale(0.96)}}
        @keyframes bot-badge-pop{0%{transform:scale(0) rotate(-20deg)}70%{transform:scale(1.25) rotate(5deg)}100%{transform:scale(1) rotate(0)}}
        @keyframes bot-glow-ring{0%,100%{opacity:0.5;transform:scale(1)}50%{opacity:1;transform:scale(1.1)}}
        @keyframes bot-scan-line{0%{top:-1px;opacity:0}10%{opacity:0.7}90%{opacity:0.7}100%{top:100%;opacity:0}}
        @keyframes bot-logo-shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes bot-header-gradient{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
        @keyframes bot-grid-move{0%{transform:translate(0,0)}100%{transform:translate(22px,22px)}}
        @keyframes bot-antenna-pulse{0%,100%{opacity:1}50%{opacity:0.55}}
        @keyframes bot-eye-blink{0%,92%,100%{transform:scaleY(1)}95%{transform:scaleY(0.1)}}
        @keyframes bot-logo-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-2px)}}
        @keyframes bot-send-ready{0%,100%{box-shadow:0 4px 14px rgba(124,111,255,0.4)}50%{box-shadow:0 4px 22px rgba(56,189,248,0.5)}}
        @keyframes bot-suggestion-slide{from{opacity:0;transform:translateX(-9px)}to{opacity:1;transform:translateX(0)}}
        @keyframes bot-empty-float{0%,100%{transform:translateY(0) rotate(0deg)}33%{transform:translateY(-4px) rotate(0.8deg)}66%{transform:translateY(-2px) rotate(-0.6deg)}}
        @keyframes bot-ring-expand{0%{transform:scale(0.8);opacity:0.8}100%{transform:scale(2.2);opacity:0}}
        @keyframes bot-modal-in{from{opacity:0;transform:scale(0.96) translateY(7px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes bot-tip-in{from{opacity:0;transform:translateY(-3px)}to{opacity:1;transform:translateY(0)}}
        @keyframes bot-mic-pulse{0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,0.4)}50%{box-shadow:0 0 0 7px rgba(239,68,68,0)}}
        @keyframes bot-progress{from{transform:scaleX(0)}to{transform:scaleX(1)}}

        .bot-msg-in{animation:bot-msg-in 0.3s cubic-bezier(0.22,1,0.36,1) both;}
        .bot-scroll{scrollbar-width:thin;scrollbar-color:rgba(124,111,255,0.18) transparent;overscroll-behavior:contain;}
        .bot-scroll::-webkit-scrollbar{width:3px;}
        .bot-scroll::-webkit-scrollbar-thumb{background:rgba(124,111,255,0.18);border-radius:10px;}
        .bot-scroll::-webkit-scrollbar-thumb:hover{background:rgba(124,111,255,0.35);}
        .bot-suggestion{-webkit-tap-highlight-color:transparent;transition:all 0.2s cubic-bezier(0.22,1,0.36,1) !important;}
        .bot-suggestion:hover{transform:translateX(4px) translateY(-1px) !important;}
        .bot-suggestion:active{transform:scale(0.98) !important;}
        .bot-send{transition:all 0.16s cubic-bezier(0.22,1,0.36,1);-webkit-tap-highlight-color:transparent;}
        .bot-send:hover:not(:disabled){transform:scale(1.08) rotate(6deg);}
        .bot-send:active:not(:disabled){transform:scale(0.92);}

        @media(min-width:601px){
          .bot-msgs-inner{max-width:860px;margin:0 auto;width:100%;}
          .bot-input-inner{max-width:860px;margin:0 auto;width:100%;}
        }
        @media(max-width:600px){
          .bot-header-inner{gap:5px !important;padding:9px 10px !important;}
          .bot-title-txt{font-size:11px !important;}
          .bot-hbtns{gap:2px !important;}
        }
      `}</style>

      {/* ── FAB ── */}
      {!open && (
        <div style={{ position:"fixed",bottom:`calc(env(safe-area-inset-bottom,0px) + 20px)`,right:"20px",zIndex:9998 }}>
          <div style={{ position:"absolute",inset:"-8px",borderRadius:"22px",background:`radial-gradient(circle,${GLOW_A} 0%,transparent 70%)`,animation:"bot-glow-ring 3.5s ease-in-out infinite",pointerEvents:"none" }}/>
          <button onClick={openPanel} onMouseEnter={()=>setFabHov(true)} onMouseLeave={()=>setFabHov(false)}
            aria-label="Open DSA assistant"
            style={{ position:"relative",width:"54px",height:"54px",borderRadius:"15px",background:fabHov?"linear-gradient(135deg,#5a52e8 0%,#3b82f6 100%)":"linear-gradient(135deg,#4338ca 0%,#7c6fff 50%,#38bdf8 100%)",border:`1.5px solid ${fabHov?"rgba(56,189,248,0.55)":"rgba(124,111,255,0.55)"}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 8px 32px rgba(124,111,255,0.5),0 4px 14px rgba(0,0,0,0.4)",transition:"all 0.22s cubic-bezier(0.22,1,0.36,1)",animation:!fabHov?"bot-fab-pulse 3.5s ease-in-out infinite":"none",backdropFilter:"blur(16px)",outline:"none" }}>
            <div style={{ transition:"transform 0.22s",transform:fabHov?"scale(1.1) rotate(-5deg)":"scale(1)" }}>
              <RobotLogo size={24} animated/>
            </div>
          </button>
          {unreadCount>0&&(
            <div style={{ position:"absolute",top:"-5px",right:"-5px",minWidth:"17px",height:"17px",borderRadius:"8px",background:"linear-gradient(135deg,#f472b6,#e879f9)",border:"2px solid #030712",animation:"bot-badge-pop 0.35s cubic-bezier(0.22,1,0.36,1)",boxShadow:"0 0 9px rgba(248,121,249,0.7)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:MONO,fontSize:"8px",color:"white",fontWeight:700,padding:"0 3px" }}>{unreadCount}</div>
          )}
        </div>
      )}

      {/* ── PANEL ── */}
      {open && (
        <div style={{ position:"fixed",top:0,left:0,right:0,bottom:0,width:"100dvw",height:"100dvh",background:BG,display:"flex",flexDirection:"column",overflow:"hidden",animation:panelAnim==="in"?"bot-panel-in 0.3s cubic-bezier(0.22,1,0.36,1)":"bot-panel-out 0.22s cubic-bezier(0.4,0,0.6,1) forwards",zIndex:9999 }}>

          {/* Ambient BG */}
          <div style={{ position:"absolute",inset:0,overflow:"hidden",pointerEvents:"none",zIndex:0 }}>
            <div style={{ position:"absolute",top:"-50px",left:"12%",width:"240px",height:"240px",borderRadius:"50%",background:`radial-gradient(circle,${GLOW_A} 0%,transparent 70%)`,filter:"blur(50px)",animation:"bot-orb1 18s ease-in-out infinite" }}/>
            <div style={{ position:"absolute",bottom:"60px",right:"-20px",width:"180px",height:"180px",borderRadius:"50%",background:`radial-gradient(circle,${GLOW_B} 0%,transparent 70%)`,filter:"blur(40px)",animation:"bot-orb2 22s ease-in-out infinite" }}/>
            <div style={{ position:"absolute",inset:"-22px",backgroundImage:"radial-gradient(circle,rgba(124,111,255,0.055) 1px,transparent 1px)",backgroundSize:"22px 22px",animation:"bot-grid-move 8s linear infinite" }}/>
            {particles.map(p=>(
              <div key={p.id} style={{ position:"absolute",top:p.top,left:p.left,width:p.size,height:p.size,borderRadius:"50%",background:p.color,boxShadow:`0 0 3px ${p.color}`,animation:`bot-particle ${p.dur} ease-in-out ${p.delay} infinite` }}/>
            ))}
          </div>

          {/* ── HEADER ── */}
          <div className="bot-header-inner" style={{ padding:"12px 16px",borderBottom:`1px solid ${BORDER}`,display:"flex",alignItems:"center",gap:"10px",flexShrink:0,position:"relative",zIndex:2,background:"rgba(7,9,20,0.6)",backdropFilter:"blur(24px)" }}>
            <div style={{ position:"absolute",bottom:0,left:"8%",right:"8%",height:"1px",background:`linear-gradient(90deg,transparent,${ACCENT}55,${ACCENT3}55,transparent)`,animation:"bot-header-gradient 4s ease-in-out infinite",backgroundSize:"200% 100%" }}/>

            {/* Avatar */}
            <div style={{ width:"38px",height:"38px",borderRadius:"11px",flexShrink:0,background:"linear-gradient(135deg,#1e1b4b 0%,#0f172a 100%)",display:"flex",alignItems:"center",justifyContent:"center",border:`1px solid rgba(124,111,255,0.38)`,boxShadow:`0 4px 18px ${GLOW_A}`,position:"relative",overflow:"hidden" }}>
              <RobotLogo size={22} animated/>
              <div style={{ position:"absolute",left:0,right:0,height:"1.5px",background:`linear-gradient(90deg,transparent,${ACCENT3}70,transparent)`,animation:"bot-scan-line 4s ease-in-out infinite" }}/>
            </div>

            {/* Title */}
            <div style={{ flex:1,minWidth:0 }}>
              <div className="bot-title-txt" style={{ fontFamily:MONO,fontWeight:700,fontSize:"13px",background:`linear-gradient(90deg,${ACCENT2} 0%,${ACCENT3} 30%,#c084fc 60%,${ACCENT2} 90%)`,backgroundSize:"200% auto",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",animation:"bot-logo-shimmer 5s ease-in-out infinite",letterSpacing:"0.03em",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>VisuoSlayer AI</div>
              <div style={{ display:"flex",alignItems:"center",gap:"5px",marginTop:"2px",flexWrap:"wrap" }}>
                <span style={{ width:"5px",height:"5px",borderRadius:"50%",flexShrink:0,background:"#34d399",boxShadow:"0 0 7px #34d399",display:"inline-block",animation:"bot-glow-ring 2s ease-in-out infinite" }}/>
                <span style={{ fontFamily:MONO,fontSize:"9px",color:"#34d399",fontWeight:700,letterSpacing:"0.1em" }}>ONLINE</span>
                {userLanguage&&<><span style={{ color:TEXT_DIM,fontSize:"8px" }}>·</span><span style={{ fontFamily:MONO,fontSize:"9px",color:ACCENT2,opacity:0.7 }}>{userLanguage}</span></>}
                {messages.length>0&&<><span style={{ color:TEXT_DIM,fontSize:"8px" }}>·</span><span style={{ fontFamily:MONO,fontSize:"9px",color:TEXT_DIM }}>{messages.length} msgs</span></>}
                {focusMode&&<><span style={{ color:TEXT_DIM,fontSize:"8px" }}>·</span><span style={{ fontFamily:MONO,fontSize:"9px",color:"#fbbf24" }}>FOCUS</span></>}
                {loading&&<><span style={{ color:TEXT_DIM,fontSize:"8px" }}>·</span><span style={{ fontFamily:MONO,fontSize:"9px",color:ACCENT3,animation:"bot-antenna-pulse 1s infinite" }}>THINKING</span></>}
              </div>
            </div>

            {/* Buttons */}
            <div className="bot-hbtns" style={{ display:"flex",gap:"3px",flexShrink:0,alignItems:"center" }}>
              {!isMobile&&<><HeaderBtn icon={<IconSearch size={13}/>} tooltip="Search (Ctrl+K)" onClick={()=>setShowSearch(true)} variant="search" disabled={!hasMessages}/><HeaderBtn icon={<IconDownload size={13}/>} tooltip={exportFlash?"Exported!":"Export (Ctrl+⇧+E)"} onClick={handleExport} variant="export" disabled={!hasMessages} active={exportFlash}/></>}
              <HeaderBtn icon={<IconBookmark size={13}/>} tooltip={`Bookmarks${bookmarks.length>0?" ("+bookmarks.length+")":""}`} onClick={()=>setShowBookmarks(true)} variant="bookmark" active={bookmarks.length>0}/>
              {!isMobile&&<HeaderBtn icon={<IconPin size={13}/>} tooltip={focusMode?"Exit focus":"Focus mode"} onClick={()=>setFocusMode(v=>!v)} variant="focus" active={focusMode}/>}
              <HeaderBtn icon={soundEnabled?<IconSound size={13}/>:<IconVolumeOff size={13}/>} tooltip={soundEnabled?"Sound on":"Sound off"} onClick={()=>setSoundEnabled(v=>!v)} variant="sound" active={soundEnabled}/>
              <HeaderBtn icon={<IconVolume size={13}/>} tooltip="TTS settings" onClick={()=>setShowVoiceModal(true)} variant="default" active={!!selectedVoice}/>
              {!isMobile&&<HeaderBtn icon={<IconKeyboard size={13}/>} tooltip="Shortcuts (Ctrl+/)" onClick={()=>setShowShortcuts(true)} variant="keys"/>}
              <div style={{ width:"1px",height:"18px",background:BORDER,flexShrink:0,marginLeft:"1px" }}/>
              <HeaderBtn icon={<IconGlobe size={13}/>} tooltip={userLanguage?`Language: ${userLanguage}`:"Set language"} onClick={()=>setShowLangModal(true)} variant="lang" active={!!userLanguage}/>
              <HeaderBtn icon={<IconTrash size={13}/>} tooltip={hasMessages?`Clear ${messages.length} msgs`:"No messages"} onClick={()=>hasMessages&&setShowClearModal(true)} variant="danger" disabled={!hasMessages}/>
              <div style={{ width:"1px",height:"18px",background:BORDER,flexShrink:0,marginLeft:"1px" }}/>
              <HeaderBtn icon={<IconX size={13}/>} tooltip="Close (Esc)" onClick={closePanel} variant="close"/>
            </div>
          </div>

          {focusMode&&<FocusModeBanner onExit={()=>setFocusMode(false)}/>}

          {/* ── MESSAGES ── */}
          <div ref={scrollContainerRef} className="bot-scroll" style={{ flex:1,overflowY:"auto",padding:`16px ${chatPaddingH} 8px`,display:"flex",flexDirection:"column",position:"relative",zIndex:1,WebkitOverflowScrolling:"touch",overscrollBehavior:"contain" }}>
            <div className="bot-msgs-inner" style={{ display:"flex",flexDirection:"column",gap:isMobile?"15px":"13px" }}>
              {messages.length===0 ? (
                <EmptyState onSend={sendMessage}/>
              ) : (
                <>
                  {messages.map((msg,i)=>(
                    <div key={i} ref={el=>msgRefs.current[i]=el}
                      style={{ opacity:focusMode&&i<messages.length-2?0.35:1,transition:"opacity 0.3s" }}>
                      <MessageBubble
                        msg={msg} idx={i}
                        speakingIdx={speakingIdx}
                        onSpeak={speakText}
                        onStopSpeak={stopSpeak}
                        voiceSpeed={voiceSpeed}
                        onSpeedChange={handleSpeedChange}
                        isBookmarked={bookmarks.includes(i)}
                        onBookmark={toggleBookmark}
                        isStreaming={streamingIdx===i}
                        isMobile={isMobile}
                      />
                    </div>
                  ))}
                  {loading && (
                    <div className="bot-msg-in" style={{ display:"flex",alignItems:"flex-end",gap:"9px" }}>
                      <div style={{ width:"30px",height:"30px",borderRadius:"9px",flexShrink:0,background:"linear-gradient(135deg,#1e1b4b 0%,#0f172a 100%)",display:"flex",alignItems:"center",justifyContent:"center",border:`1px solid rgba(124,111,255,0.32)`,boxShadow:`0 4px 16px ${GLOW_A}`,marginBottom:"2px" }}>
                        <RobotLogo size={18} animated/>
                      </div>
                      <div style={{ padding:"12px 14px",borderRadius:"4px 14px 14px 14px",background:SURFACE,border:`1px solid ${BORDER}` }}>
                        <TypingDots/>
                        <div style={{ fontFamily:MONO,fontSize:"8px",color:TEXT_DIM,marginTop:"3px" }}>thinking…</div>
                      </div>
                    </div>
                  )}
                </>
              )}
              <div ref={messagesEndRef}/>
            </div>
          </div>

          {/* ── INPUT ── */}
          <div style={{ padding:`10px ${chatPaddingH} calc(env(safe-area-inset-bottom,0px) + 12px)`,borderTop:`1px solid ${BORDER}`,flexShrink:0,position:"relative",zIndex:2,background:"rgba(7,9,20,0.7)",backdropFilter:"blur(24px)" }}>
            {loading && (
              <div style={{ position:"absolute",top:0,left:0,right:0,height:"2px",background:`linear-gradient(90deg,${ACCENT},${ACCENT3},${ACCENT})`,backgroundSize:"200% 100%",animation:"bot-logo-shimmer 1.4s linear infinite",borderRadius:"0 0 2px 2px" }}/>
            )}
            <div className="bot-input-inner">
              <div style={{ display:"flex",alignItems:"flex-end",gap:"7px",background:inputFoc?"rgba(124,111,255,0.06)":"rgba(255,255,255,0.022)",border:`1px solid ${inputFoc?"rgba(124,111,255,0.45)":BORDER2}`,borderRadius:"13px",padding:"9px 9px 9px 12px",transition:"all 0.22s cubic-bezier(0.22,1,0.36,1)",boxShadow:inputFoc?"0 0 0 3px rgba(124,111,255,0.09)":"none" }}>
                <textarea ref={el=>{inputRef.current=el;textareaRef.current=el;}} value={input} onChange={handleInput} onKeyDown={handleKey} onFocus={()=>setInputFoc(true)} onBlur={()=>setInputFoc(false)} placeholder="Ask any DSA question…" rows={1} style={{ flex:1,background:"none",border:"none",outline:"none",fontFamily:SANS,fontSize:"13px",color:TEXT_PRI,fontWeight:400,resize:"none",lineHeight:"1.55",maxHeight:"96px",overflow:"auto",minHeight:"22px",caretColor:ACCENT3,padding:0 }}/>
                {charCount>0&&<span style={{ fontFamily:MONO,fontSize:"8px",color:charCount>400?"#f472b6":TEXT_DIM,alignSelf:"center",flexShrink:0,transition:"color 0.2s" }}>{charCount}</span>}
                <button onClick={toggleVoice} title={listening?"Stop":"Voice"} style={{ width:"32px",height:"32px",borderRadius:"9px",flexShrink:0,background:listening?"rgba(239,68,68,0.14)":"rgba(255,255,255,0.03)",border:`1px solid ${listening?"rgba(239,68,68,0.4)":BORDER}`,color:listening?"#fca5a5":TEXT_DIM,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",outline:"none",alignSelf:"flex-end",animation:listening?"bot-mic-pulse 1.2s ease-in-out infinite":"none",transition:"all 0.16s" }}>
                  {listening?<IconStop size={11}/>:<IconMic size={12}/>}
                </button>
                <button className="bot-send" onClick={()=>{ if(loading){abortRef.current?.abort();abortRef.current=null;setLoading(false);}else{sendMessage();} }} style={{ width:"34px",height:"34px",borderRadius:"10px",flexShrink:0,background:loading?"linear-gradient(135deg,rgba(239,68,68,0.28),rgba(239,68,68,0.16))":input.trim()?`linear-gradient(135deg,${ACCENT} 0%,${ACCENT3} 100%)`:"rgba(255,255,255,0.04)",border:`1px solid ${loading?"rgba(239,68,68,0.38)":input.trim()?"rgba(124,111,255,0.5)":BORDER}`,color:(loading||input.trim())?"#fff":TEXT_DIM,cursor:(loading||input.trim())?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"14px",boxShadow:loading?"0 4px 16px rgba(239,68,68,0.28)":input.trim()?"0 4px 16px rgba(124,111,255,0.4)":"none",animation:(!loading&&input.trim())?"bot-send-ready 2s ease-in-out infinite":"none",outline:"none",alignSelf:"flex-end",transition:"all 0.16s cubic-bezier(0.22,1,0.36,1)" }} title={loading?"Cancel":"Send"}>
                  {loading?<IconStop size={11}/>:"↑"}
                </button>
              </div>
              {!isMobile&&(
                <div style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:"7px",marginTop:"6px" }}>
                  <span style={{ fontFamily:MONO,fontSize:"8px",color:TEXT_DIM,opacity:0.4 }}>↵ send</span>
                  <span style={{ color:TEXT_DIM,opacity:0.18,fontSize:"8px" }}>·</span>
                  <span style={{ fontFamily:MONO,fontSize:"8px",color:TEXT_DIM,opacity:0.4 }}>shift+↵ newline</span>
                  <span style={{ color:TEXT_DIM,opacity:0.18,fontSize:"8px" }}>·</span>
                  <span style={{ fontFamily:MONO,fontSize:"8px",color:TEXT_DIM,opacity:0.28 }}>ctrl+k search</span>
                  {loading&&<><span style={{ color:TEXT_DIM,opacity:0.18,fontSize:"8px" }}>·</span><span style={{ fontFamily:MONO,fontSize:"8px",color:"#fca5a5",opacity:0.65 }}>■ stop to cancel</span></>}
                </div>
              )}
            </div>
          </div>

          {/* ── MODALS ── */}
          {showLangModal&&<LanguageSelector currentLang={userLanguage} onSelect={handleLanguageSelect} onClose={()=>setShowLangModal(false)}/>}
          {showClearModal&&<ClearModal count={messages.length} onConfirm={()=>{setMessages([]);setShowClearModal(false);stopSpeak();setBookmarks([]);setStreamingIdx(null);abortRef.current?.abort();setLoading(false);}} onCancel={()=>setShowClearModal(false)}/>}
          {showVoiceModal&&<VoicePickerModal currentVoice={selectedVoice} onSelect={v=>{setSelectedVoice(v);selectedVoiceRef.current=v;setShowVoiceModal(false);}} onClose={()=>setShowVoiceModal(false)} voiceSpeed={voiceSpeed} onSpeedChange={rate=>{setVoiceSpeed(rate);voiceSpeedRef.current=rate;}}/>}
          {showSearch&&<SearchOverlay messages={messages} onClose={()=>setShowSearch(false)} onJump={idx=>setJumpToIdx(idx)}/>}
          {showShortcuts&&<ShortcutsModal onClose={()=>setShowShortcuts(false)}/>}
          {showBookmarks&&<BookmarksPanel bookmarks={bookmarks} messages={messages} onJump={idx=>setJumpToIdx(idx)} onRemove={idx=>setBookmarks(prev=>prev.filter(b=>b!==idx))} onClose={()=>setShowBookmarks(false)}/>}
        </div>
      )}
    </>
  );
}