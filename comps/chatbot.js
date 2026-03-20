// "use client";
// import { useState, useEffect, useRef, useCallback } from "react";

// // ─────────────────────────────────────────────────────────────────────────────
// // DESIGN TOKENS
// // ─────────────────────────────────────────────────────────────────────────────
// const SURFACE  = "rgba(8,11,24,0.99)";
// const BORDER   = "rgba(255,255,255,0.06)";
// const BORDER2  = "rgba(255,255,255,0.10)";
// const TEXT_PRI = "#f0f4ff";
// const TEXT_SEC = "#8fa4cc";
// const TEXT_DIM = "#3d526b";
// const MONO     = "'Space Mono', monospace";
// const SANS     = "'DM Sans', -apple-system, sans-serif";
// const DISPLAY  = "'Space Mono', monospace";
// const ACCENT   = "#6d78fa";
// const ACCENT2  = "#818cf8";
// const ACCENT3  = "#38bdf8";
// const ACCENT4  = "#a5b4fc";
// const GLOW_A   = "rgba(109,120,250,0.35)";
// const GLOW_B   = "rgba(56,189,248,0.20)";

// // ─────────────────────────────────────────────────────────────────────────────
// // SUGGESTIONS
// // ─────────────────────────────────────────────────────────────────────────────
// const SUGGESTION_GROUPS = [
//   {
//     group: "Trees",
//     color: "#818cf8",
//     items: [
//       { icon: "⑂", label: "Explain AVL rotations step-by-step",          sub: "Self-balancing · O(log n)" },
//       { icon: "⊢", label: "Red-Black Tree vs AVL Tree trade-offs",        sub: "Comparison · Use-cases" },
//       { icon: "⊕", label: "Segment Tree with lazy propagation",           sub: "Range queries · Updates" },
//     ],
//   },
//   {
//     group: "Sorting",
//     color: "#38bdf8",
//     items: [
//       { icon: "⇅", label: "Quick Sort vs Merge Sort deep dive",           sub: "Complexity · Trade-offs" },
//       { icon: "◈", label: "Why is Tim Sort used in practice?",            sub: "Hybrid · Real-world" },
//       { icon: "∿", label: "Counting Sort and Radix Sort explained",       sub: "Linear time · Non-comparative" },
//     ],
//   },
//   {
//     group: "Graphs",
//     color: "#34d399",
//     items: [
//       { icon: "⬡", label: "Dijkstra vs Bellman-Ford vs Floyd-Warshall",   sub: "Shortest path · Negatives" },
//       { icon: "⊗", label: "Topological sort with Kahn's algorithm",       sub: "DAG · BFS approach" },
//       { icon: "⊙", label: "Union-Find / Disjoint Set Union explained",    sub: "Path compression · Rank" },
//     ],
//   },
//   {
//     group: "DP",
//     color: "#f472b6",
//     items: [
//       { icon: "∞", label: "Tabulation vs memoization in dynamic programming", sub: "Bottom-up · Top-down" },
//       { icon: "⊞", label: "0/1 Knapsack problem from scratch",           sub: "Classic · Reconstruction" },
//       { icon: "⋯", label: "Longest Common Subsequence visualised",        sub: "2-D DP · Trace-back" },
//     ],
//   },
// ];

// const SPEED_OPTIONS = [
//   { label: "0.75×", rate: 0.75 },
//   { label: "1×",    rate: 1.0  },
//   { label: "1.25×", rate: 1.25 },
//   { label: "1.5×",  rate: 1.5  },
//   { label: "2×",    rate: 2.0  },
// ];

// // ─────────────────────────────────────────────────────────────────────────────
// // ROBOT LOGO
// // ─────────────────────────────────────────────────────────────────────────────
// function RobotLogo({ size = 20, animated = false }) {
//   return (
//     <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"
//       style={animated ? { animation: "bot-logo-float 4s ease-in-out infinite" } : {}}>
//       <line x1="16" y1="2" x2="16" y2="7" stroke={ACCENT2} strokeWidth="1.5" strokeLinecap="round"/>
//       <circle cx="16" cy="2" r="1.5" fill={ACCENT3}
//         style={animated ? { animation: "bot-antenna-pulse 2s ease-in-out infinite" } : {}}/>
//       <rect x="6" y="7" width="20" height="14" rx="4" fill="url(#botGrad)"
//         stroke={ACCENT2} strokeWidth="0.8" strokeOpacity="0.5"/>
//       <circle cx="11.5" cy="14" r="2.5" fill={ACCENT3}
//         style={animated ? { animation: "bot-eye-blink 4s ease-in-out infinite" } : {}}/>
//       <circle cx="20.5" cy="14" r="2.5" fill={ACCENT3}
//         style={animated ? { animation: "bot-eye-blink 4s ease-in-out infinite 0.15s" } : {}}/>
//       <circle cx="12.2" cy="13.2" r="0.8" fill="white" opacity="0.9"/>
//       <circle cx="21.2" cy="13.2" r="0.8" fill="white" opacity="0.9"/>
//       <path d="M12 18.5 Q16 20.5 20 18.5" stroke={ACCENT2} strokeWidth="1.2" strokeLinecap="round" fill="none"/>
//       <rect x="13" y="21" width="6" height="3" rx="1.5" fill={ACCENT2} opacity="0.6"/>
//       <rect x="8" y="24" width="16" height="7" rx="3" fill="url(#botGrad2)"
//         stroke={ACCENT2} strokeWidth="0.8" strokeOpacity="0.4"/>
//       <circle cx="13" cy="27.5" r="1.2" fill={ACCENT3} opacity="0.7"/>
//       <circle cx="16" cy="27.5" r="1.2" fill={ACCENT2} opacity="0.7"/>
//       <circle cx="19" cy="27.5" r="1.2" fill={ACCENT3} opacity="0.7"/>
//       <defs>
//         <linearGradient id="botGrad" x1="6" y1="7" x2="26" y2="21" gradientUnits="userSpaceOnUse">
//           <stop offset="0%" stopColor="#1e1b4b"/><stop offset="100%" stopColor="#0f172a"/>
//         </linearGradient>
//         <linearGradient id="botGrad2" x1="8" y1="24" x2="24" y2="31" gradientUnits="userSpaceOnUse">
//           <stop offset="0%" stopColor="#1e1b4b"/><stop offset="100%" stopColor="#0c0f20"/>
//         </linearGradient>
//       </defs>
//     </svg>
//   );
// }

// function TypingDots() {
//   return (
//     <div style={{ display:"flex", alignItems:"center", gap:"5px", padding:"6px 2px" }}>
//       {[0,1,2].map(i => (
//         <span key={i} style={{
//           width:"7px", height:"7px", borderRadius:"50%",
//           background:`radial-gradient(circle,${ACCENT3} 0%,${ACCENT} 100%)`,
//           display:"inline-block",
//           animation:`bot-typing-dot 1.4s cubic-bezier(0.4,0,0.6,1) ${i*0.22}s infinite`,
//           boxShadow:`0 0 6px ${ACCENT3}60`,
//         }}/>
//       ))}
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // ICONS
// // ─────────────────────────────────────────────────────────────────────────────
// function IconVolume({ size=14 }) {
//   return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//     <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
//     <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
//   </svg>;
// }
// function IconVolumeOff({ size=14 }) {
//   return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//     <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
//     <line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>
//   </svg>;
// }
// function IconGlobe({ size=14 }) {
//   return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//     <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
//     <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
//   </svg>;
// }
// function IconTrash({ size=14 }) {
//   return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//     <polyline points="3 6 5 6 21 6"/>
//     <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
//   </svg>;
// }
// function IconX({ size=14 }) {
//   return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
//     <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
//   </svg>;
// }
// function IconCopy({ size=11 }) {
//   return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//     <rect x="9" y="9" width="13" height="13" rx="2"/>
//     <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
//   </svg>;
// }
// function IconCheck({ size=11 }) {
//   return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
//     <polyline points="20 6 9 17 4 12"/>
//   </svg>;
// }
// // NEW ICONS
// function IconSearch({ size=14 }) {
//   return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//     <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
//   </svg>;
// }
// function IconDownload({ size=14 }) {
//   return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//     <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
//     <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
//   </svg>;
// }
// function IconKeyboard({ size=14 }) {
//   return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//     <rect x="2" y="4" width="20" height="16" rx="2"/>
//     <path d="M6 8h.001M10 8h.001M14 8h.001M18 8h.001M8 12h.001M12 12h.001M16 12h.001M7 16h10"/>
//   </svg>;
// }
// function IconMic({ size=14 }) {
//   return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//     <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
//     <path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/>
//     <line x1="8" y1="23" x2="16" y2="23"/>
//   </svg>;
// }
// function IconStop({ size=14 }) {
//   return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none">
//     <rect x="4" y="4" width="16" height="16" rx="2"/>
//   </svg>;
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // HEADER BUTTON
// // ─────────────────────────────────────────────────────────────────────────────
// function HeaderBtn({ icon, tooltip, onClick, variant="default", disabled=false, active=false }) {
//   const [hov, setHov] = useState(false);
//   const [tip, setTip] = useState(false);
//   const styles = {
//     default: { idle:TEXT_DIM, hover:ACCENT2, bg:"transparent", hBg:"rgba(109,120,250,0.12)", b:"transparent", hB:"rgba(109,120,250,0.3)" },
//     danger:  { idle:TEXT_DIM, hover:"#fca5a5", bg:"transparent", hBg:"rgba(239,68,68,0.1)", b:"transparent", hB:"rgba(239,68,68,0.3)" },
//     close:   { idle:TEXT_DIM, hover:"#f0f4ff", bg:"transparent", hBg:"rgba(255,255,255,0.08)", b:"transparent", hB:"rgba(255,255,255,0.15)" },
//     lang:    { idle:ACCENT4, hover:ACCENT3, bg:"rgba(109,120,250,0.08)", hBg:"rgba(56,189,248,0.12)", b:"rgba(109,120,250,0.2)", hB:"rgba(56,189,248,0.4)" },
//     search:  { idle:TEXT_DIM, hover:"#34d399", bg:"transparent", hBg:"rgba(52,211,153,0.1)", b:"transparent", hB:"rgba(52,211,153,0.3)" },
//     export:  { idle:TEXT_DIM, hover:ACCENT3, bg:"transparent", hBg:"rgba(56,189,248,0.1)", b:"transparent", hB:"rgba(56,189,248,0.3)" },
//     keys:    { idle:TEXT_DIM, hover:ACCENT4, bg:"transparent", hBg:"rgba(165,180,252,0.1)", b:"transparent", hB:"rgba(165,180,252,0.3)" },
//   };
//   const s = styles[variant] || styles.default;
//   return (
//     <div style={{ position:"relative" }}>
//       <button
//         onClick={onClick} disabled={disabled}
//         onMouseEnter={()=>{ setHov(true); setTip(true); }}
//         onMouseLeave={()=>{ setHov(false); setTip(false); }}
//         style={{
//           width:"34px", height:"34px", borderRadius:"10px",
//           background: hov ? s.hBg : (active ? "rgba(109,120,250,0.1)" : s.bg),
//           border:`1px solid ${hov ? s.hB : (active ? "rgba(109,120,250,0.25)" : s.b)}`,
//           color: hov ? s.hover : (active ? ACCENT2 : s.idle),
//           cursor: disabled ? "default" : "pointer",
//           display:"flex", alignItems:"center", justifyContent:"center",
//           outline:"none", flexShrink:0, opacity: disabled ? 0.35 : 1,
//           transition:"all 0.18s cubic-bezier(0.22,1,0.36,1)",
//           transform: hov && !disabled ? (variant==="close" ? "rotate(90deg)" : "translateY(-1px)") : "none",
//         }}
//         aria-label={tooltip}
//       >
//         {icon}
//       </button>
//       {tip && tooltip && (
//         <div style={{
//           position:"absolute", top:"calc(100% + 7px)", right:0,
//           background:"rgba(8,11,24,0.97)", border:"1px solid rgba(255,255,255,0.1)",
//           borderRadius:"7px", padding:"4px 10px",
//           fontFamily:MONO, fontSize:"9px", color:TEXT_SEC,
//           whiteSpace:"nowrap", pointerEvents:"none",
//           boxShadow:"0 8px 24px rgba(0,0,0,0.5)",
//           animation:"bot-tip-in 0.15s ease-out", zIndex:50, letterSpacing:"0.04em",
//         }}>
//           {tooltip}
//           <div style={{ position:"absolute", bottom:"100%", right:"11px", width:0, height:0,
//             borderLeft:"4px solid transparent", borderRight:"4px solid transparent",
//             borderBottom:"4px solid rgba(255,255,255,0.1)" }}/>
//         </div>
//       )}
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // CODE BLOCK — FIX: copy button always below on mobile, never overlapping
// // ─────────────────────────────────────────────────────────────────────────────
// function CodeBlock({ code }) {
//   const [copied, setCopied] = useState(false);
//   const copy = () => {
//     navigator.clipboard?.writeText(code).catch(()=>{});
//     setCopied(true);
//     setTimeout(()=> setCopied(false), 1800);
//   };
//   return (
//     <div style={{ margin:"10px 0" }}>
//       <pre style={{
//         background:"rgba(0,0,0,0.52)",
//         border:"1px solid rgba(109,120,250,0.22)",
//         borderLeft:`3px solid ${ACCENT}`,
//         borderRadius:"10px 10px 0 0",
//         padding:"13px 14px",
//         overflowX:"auto",
//         fontFamily:MONO, fontSize:"11.5px",
//         color:"#c8d8f8", lineHeight:"1.65",
//         margin:0,
//       }}>
//         {code}
//       </pre>
//       {/* Copy bar always below — never overlapping code */}
//       <div style={{
//         display:"flex", justifyContent:"flex-end",
//         background:"rgba(0,0,0,0.35)",
//         border:"1px solid rgba(109,120,250,0.18)",
//         borderTop:"1px solid rgba(109,120,250,0.10)",
//         borderRadius:"0 0 10px 10px",
//         padding:"5px 8px",
//       }}>
//         <button onClick={copy} style={{
//           display:"flex", alignItems:"center", gap:"4px",
//           background: copied ? "rgba(52,211,153,0.18)" : "rgba(109,120,250,0.12)",
//           border:`1px solid ${copied ? "rgba(52,211,153,0.4)" : "rgba(109,120,250,0.25)"}`,
//           borderRadius:"6px", padding:"3px 10px",
//           fontFamily:MONO, fontSize:"8px",
//           color: copied ? "#34d399" : TEXT_DIM,
//           cursor:"pointer", outline:"none", transition:"all 0.18s",
//           letterSpacing:"0.04em",
//         }}>
//           {copied ? <><IconCheck size={10}/>&nbsp;COPIED</> : <><IconCopy size={10}/>&nbsp;COPY CODE</>}
//         </button>
//       </div>
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // MARKDOWN RENDERER
// // ─────────────────────────────────────────────────────────────────────────────
// function RichText({ content }) {
//   const parts = content.split(/(```[\s\S]*?```)/g);
//   return (
//     <div style={{ margin:0, lineHeight:"1.72", wordBreak:"break-word" }}>
//       {parts.map((part, i) => {
//         if (part.startsWith("```")) {
//           const inner = part.replace(/^```\w*\n?/, "").replace(/```$/, "").trimEnd();
//           return <CodeBlock key={i} code={inner}/>;
//         }
//         const lines = part.split("\n");
//         return (
//           <span key={i}>
//             {lines.map((line, li) => {
//               const isLast = li === lines.length-1;
//               const bMatch = line.match(/^(\s*[-•*]\s+)(.*)/);
//               const nMatch = line.match(/^(\s*\d+\.\s+)(.*)/);
//               const raw = bMatch ? bMatch[2] : nMatch ? nMatch[2] : line;
//               const tokens = raw.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
//               const inline = tokens.map((tok, ti) => {
//                 if (tok.startsWith("`") && tok.endsWith("`"))
//                   return <code key={ti} style={{
//                     background:"rgba(109,120,250,0.18)", border:"1px solid rgba(109,120,250,0.3)",
//                     borderRadius:"4px", padding:"1px 5px", fontFamily:MONO, fontSize:"10.5px", color:ACCENT3,
//                   }}>{tok.slice(1,-1)}</code>;
//                 if (tok.startsWith("**") && tok.endsWith("**"))
//                   return <strong key={ti} style={{ color:TEXT_PRI, fontWeight:700 }}>{tok.slice(2,-2)}</strong>;
//                 return tok;
//               });
//               let rendered;
//               if (bMatch) {
//                 rendered = <div key={li} style={{ display:"flex", gap:"7px", margin:"3px 0" }}>
//                   <span style={{ color:ACCENT, fontWeight:700, flexShrink:0, marginTop:"1px" }}>▸</span>
//                   <span>{inline}</span></div>;
//               } else if (nMatch) {
//                 rendered = <div key={li} style={{ display:"flex", gap:"7px", margin:"3px 0" }}>
//                   <span style={{ color:ACCENT3, fontFamily:MONO, fontSize:"10px", flexShrink:0, minWidth:"14px" }}>{nMatch[1].trim()}</span>
//                   <span>{inline}</span></div>;
//               } else {
//                 rendered = <span key={li}>{inline}</span>;
//               }
//               return (
//                 <span key={li}>
//                   {rendered}
//                   {!isLast && line==="" ? <br/> : !isLast && !bMatch && !nMatch ? <br/> : null}
//                 </span>
//               );
//             })}
//           </span>
//         );
//       })}
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // VOICE PICKER MODAL — FIX: premium voices with instant speed change
// // ─────────────────────────────────────────────────────────────────────────────
// function VoicePickerModal({ currentVoice, onSelect, onClose, voiceSpeed, onSpeedChange }) {
//   const [availableVoices, setAvailableVoices] = useState([]);

//   useEffect(() => {
//     const load = () => {
//       const all = window.speechSynthesis?.getVoices() || [];
//       // Prefer premium/natural voices, filter English
//       const preferred = [
//         "Google US English",
//         "Google UK English Female",
//         "Google UK English Male",
//         "Microsoft Aria Online (Natural) - English (United States)",
//         "Microsoft Guy Online (Natural) - English (United States)",
//         "Microsoft Jenny Online (Natural) - English (United States)",
//         "Samantha",
//         "Alex",
//         "Karen",
//         "Daniel",
//       ];
//       const enVoices = all.filter(v => v.lang.startsWith("en"));
//       const sorted = [
//         ...enVoices.filter(v => preferred.some(p => v.name.includes(p.split(" ")[0]) || v.name === p)),
//         ...enVoices.filter(v => !preferred.some(p => v.name.includes(p.split(" ")[0]) || v.name === p)),
//       ].slice(0, 12);
//       setAvailableVoices(sorted.length ? sorted : enVoices.slice(0, 12));
//     };
//     load();
//     window.speechSynthesis?.addEventListener("voiceschanged", load);
//     return () => window.speechSynthesis?.removeEventListener("voiceschanged", load);
//   }, []);

//   return (
//     <div style={{
//       position:"absolute", inset:0, zIndex:12,
//       background:"rgba(3,7,18,0.88)", backdropFilter:"blur(14px)",
//       display:"flex", alignItems:"center", justifyContent:"center",
//       animation:"bot-modal-in 0.22s cubic-bezier(0.22,1,0.36,1)",
//     }} onClick={e=> e.target===e.currentTarget && onClose()}>
//       <div style={{
//         background:"linear-gradient(145deg,rgba(14,17,35,0.98) 0%,rgba(8,11,24,0.99) 100%)",
//         border:"1px solid rgba(56,189,248,0.25)", borderRadius:"20px",
//         padding:"26px 22px", width:"min(420px,calc(100vw - 28px))",
//         boxShadow:"0 32px 80px rgba(0,0,0,0.7),inset 0 1px 0 rgba(255,255,255,0.07)",
//         position:"relative", maxHeight:"85vh", overflowY:"auto",
//       }}>
//         <button onClick={onClose} style={{
//           position:"absolute", top:"14px", right:"14px",
//           width:"28px", height:"28px", borderRadius:"8px",
//           background:"rgba(255,255,255,0.04)", border:`1px solid ${BORDER}`,
//           color:TEXT_DIM, cursor:"pointer", display:"flex",
//           alignItems:"center", justifyContent:"center", outline:"none",
//         }}><IconX size={12}/></button>

//         <div style={{ textAlign:"center", marginBottom:"20px" }}>
//           <div style={{ fontFamily:DISPLAY, fontSize:"15px", color:TEXT_PRI, fontWeight:700, letterSpacing:"0.04em", marginBottom:"5px" }}>
//             Voice & Speed
//           </div>
//           <div style={{ fontFamily:SANS, fontSize:"11.5px", color:TEXT_DIM }}>
//             Choose a premium voice and reading speed
//           </div>
//         </div>

//         {/* Speed slider */}
//         <div style={{
//           marginBottom:"18px", padding:"12px 14px", borderRadius:"10px",
//           background:"rgba(56,189,248,0.06)", border:"1px solid rgba(56,189,248,0.15)",
//         }}>
//           <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"8px" }}>
//             <span style={{ fontFamily:MONO, fontSize:"9px", color:ACCENT3, letterSpacing:"0.08em" }}>READING SPEED</span>
//             <span style={{ fontFamily:MONO, fontSize:"9px", color:TEXT_PRI, fontWeight:700 }}>
//               {SPEED_OPTIONS.find(s=>s.rate===voiceSpeed)?.label ?? `${voiceSpeed}×`}
//             </span>
//           </div>
//           <div style={{ display:"flex", gap:"6px" }}>
//             {SPEED_OPTIONS.map(opt => (
//               <button key={opt.rate} onClick={()=> onSpeedChange(opt.rate)} style={{
//                 flex:1, padding:"6px 4px", borderRadius:"7px",
//                 background: voiceSpeed===opt.rate ? "rgba(56,189,248,0.2)" : "rgba(255,255,255,0.03)",
//                 border:`1px solid ${voiceSpeed===opt.rate ? "rgba(56,189,248,0.5)" : "rgba(255,255,255,0.06)"}`,
//                 fontFamily:MONO, fontSize:"8.5px",
//                 color: voiceSpeed===opt.rate ? ACCENT3 : TEXT_DIM,
//                 cursor:"pointer", outline:"none", transition:"all 0.15s",
//               }}>{opt.label}</button>
//             ))}
//           </div>
//         </div>

//         {/* Voice list */}
//         <div style={{ fontFamily:MONO, fontSize:"9px", color:TEXT_DIM, letterSpacing:"0.08em", marginBottom:"10px" }}>
//           AVAILABLE VOICES
//         </div>
//         <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
//           {availableVoices.length === 0 && (
//             <div style={{ fontFamily:SANS, fontSize:"12px", color:TEXT_DIM, padding:"12px", textAlign:"center" }}>
//               No voices found — your browser may not support speech synthesis.
//             </div>
//           )}
//           {availableVoices.map((v, i) => {
//             const isOnline = v.name.toLowerCase().includes("online") || v.name.toLowerCase().includes("natural") || v.name.toLowerCase().includes("neural");
//             const isSel = currentVoice?.name === v.name;
//             return (
//               <button key={i} onClick={()=> onSelect(v)} style={{
//                 display:"flex", alignItems:"center", gap:"10px",
//                 padding:"10px 12px", borderRadius:"10px",
//                 background: isSel ? "rgba(56,189,248,0.12)" : "rgba(255,255,255,0.02)",
//                 border:`1px solid ${isSel ? "rgba(56,189,248,0.4)" : "rgba(255,255,255,0.05)"}`,
//                 cursor:"pointer", outline:"none", textAlign:"left",
//                 transition:"all 0.15s",
//               }}
//                 onMouseEnter={e=>{ if(!isSel){ e.currentTarget.style.background="rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor="rgba(255,255,255,0.1)"; }}}
//                 onMouseLeave={e=>{ if(!isSel){ e.currentTarget.style.background="rgba(255,255,255,0.02)"; e.currentTarget.style.borderColor="rgba(255,255,255,0.05)"; }}}
//               >
//                 <div style={{
//                   width:"28px", height:"28px", borderRadius:"8px", flexShrink:0,
//                   background: isSel ? "rgba(56,189,248,0.2)" : "rgba(255,255,255,0.04)",
//                   display:"flex", alignItems:"center", justifyContent:"center",
//                   color: isSel ? ACCENT3 : TEXT_DIM,
//                 }}><IconVolume size={13}/></div>
//                 <div style={{ flex:1, minWidth:0 }}>
//                   <div style={{ fontFamily:SANS, fontSize:"12px", color:isSel?TEXT_PRI:TEXT_SEC, fontWeight:600,
//                     overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
//                     {v.name}
//                   </div>
//                   <div style={{ display:"flex", gap:"5px", alignItems:"center", marginTop:"2px" }}>
//                     <span style={{ fontFamily:MONO, fontSize:"8px", color:TEXT_DIM }}>{v.lang}</span>
//                     {isOnline && (
//                       <span style={{
//                         fontFamily:MONO, fontSize:"7px", color:"#34d399",
//                         background:"rgba(52,211,153,0.12)", border:"1px solid rgba(52,211,153,0.25)",
//                         borderRadius:"4px", padding:"1px 5px", letterSpacing:"0.06em",
//                       }}>PREMIUM</span>
//                     )}
//                   </div>
//                 </div>
//                 {isSel && <div style={{ width:"7px", height:"7px", borderRadius:"50%", background:ACCENT3, flexShrink:0 }}/>}
//               </button>
//             );
//           })}
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // SEARCH OVERLAY — search within conversation
// // ─────────────────────────────────────────────────────────────────────────────
// function SearchOverlay({ messages, onClose, onJump }) {
//   const [query, setQuery] = useState("");
//   const inputRef = useRef(null);

//   useEffect(() => { setTimeout(()=> inputRef.current?.focus(), 100); }, []);

//   const results = query.trim().length < 2 ? [] : messages
//     .map((m, i) => ({ ...m, idx: i }))
//     .filter(m => m.content.toLowerCase().includes(query.toLowerCase()))
//     .slice(0, 8);

//   const highlight = (text, q) => {
//     const idx = text.toLowerCase().indexOf(q.toLowerCase());
//     if (idx === -1) return text.slice(0, 80) + (text.length>80?"…":"");
//     const start = Math.max(0, idx - 30);
//     const snip = text.slice(start, start + 120);
//     return snip + (text.length > start+120 ? "…" : "");
//   };

//   return (
//     <div style={{
//       position:"absolute", inset:0, zIndex:15,
//       background:"rgba(3,7,18,0.92)", backdropFilter:"blur(16px)",
//       display:"flex", flexDirection:"column", alignItems:"center",
//       padding:"60px 20px 20px",
//       animation:"bot-modal-in 0.2s cubic-bezier(0.22,1,0.36,1)",
//     }} onClick={e=> e.target===e.currentTarget && onClose()}>
//       <div style={{ width:"100%", maxWidth:"540px" }}>
//         {/* Search input */}
//         <div style={{
//           display:"flex", alignItems:"center", gap:"10px",
//           background:"rgba(255,255,255,0.04)",
//           border:"1px solid rgba(109,120,250,0.45)",
//           borderRadius:"14px", padding:"10px 14px",
//           boxShadow:"0 0 0 4px rgba(109,120,250,0.08)",
//           marginBottom:"14px",
//         }}>
//           <span style={{ color:TEXT_DIM, flexShrink:0 }}><IconSearch size={15}/></span>
//           <input
//             ref={inputRef}
//             value={query}
//             onChange={e=> setQuery(e.target.value)}
//             placeholder="Search messages…"
//             style={{
//               flex:1, background:"none", border:"none", outline:"none",
//               fontFamily:SANS, fontSize:"14px", color:TEXT_PRI,
//               caretColor:ACCENT3,
//             }}
//           />
//           {query && (
//             <button onClick={()=> setQuery("")} style={{
//               background:"none", border:"none", color:TEXT_DIM,
//               cursor:"pointer", outline:"none", display:"flex", alignItems:"center",
//             }}><IconX size={12}/></button>
//           )}
//           <button onClick={onClose} style={{
//             background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)",
//             borderRadius:"6px", padding:"3px 8px",
//             fontFamily:MONO, fontSize:"9px", color:TEXT_DIM,
//             cursor:"pointer", outline:"none", letterSpacing:"0.04em",
//           }}>ESC</button>
//         </div>

//         {/* Results */}
//         <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
//           {query.trim().length >= 2 && results.length === 0 && (
//             <div style={{ textAlign:"center", fontFamily:SANS, fontSize:"13px", color:TEXT_DIM, padding:"24px 0" }}>
//               No messages found for "{query}"
//             </div>
//           )}
//           {results.map((m) => (
//             <button key={m.idx} onClick={()=>{ onJump(m.idx); onClose(); }} style={{
//               display:"flex", alignItems:"flex-start", gap:"10px",
//               padding:"12px 14px", borderRadius:"12px",
//               background:"rgba(255,255,255,0.025)",
//               border:"1px solid rgba(255,255,255,0.06)",
//               cursor:"pointer", outline:"none", textAlign:"left",
//               transition:"all 0.15s",
//             }}
//               onMouseEnter={e=>{ e.currentTarget.style.background="rgba(109,120,250,0.1)"; e.currentTarget.style.borderColor="rgba(109,120,250,0.3)"; }}
//               onMouseLeave={e=>{ e.currentTarget.style.background="rgba(255,255,255,0.025)"; e.currentTarget.style.borderColor="rgba(255,255,255,0.06)"; }}
//             >
//               <div style={{
//                 width:"24px", height:"24px", borderRadius:"6px", flexShrink:0,
//                 background: m.role==="user" ? "rgba(109,120,250,0.2)" : "rgba(56,189,248,0.15)",
//                 display:"flex", alignItems:"center", justifyContent:"center",
//                 fontFamily:MONO, fontSize:"8px",
//                 color: m.role==="user" ? ACCENT2 : ACCENT3,
//                 fontWeight:700, letterSpacing:"0.04em",
//                 marginTop:"1px",
//               }}>{m.role==="user"?"U":"AI"}</div>
//               <div style={{ flex:1, minWidth:0 }}>
//                 <div style={{ fontFamily:SANS, fontSize:"12px", color:TEXT_SEC, lineHeight:"1.5",
//                   overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>
//                   {highlight(m.content, query)}
//                 </div>
//                 <div style={{ fontFamily:MONO, fontSize:"8px", color:TEXT_DIM, marginTop:"4px" }}>
//                   {m.time} · msg #{m.idx+1}
//                 </div>
//               </div>
//             </button>
//           ))}
//         </div>

//         {query.trim().length < 2 && (
//           <div style={{ textAlign:"center", fontFamily:MONO, fontSize:"9px", color:TEXT_DIM, marginTop:"20px", letterSpacing:"0.06em" }}>
//             TYPE TO SEARCH YOUR CONVERSATION
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // KEYBOARD SHORTCUTS MODAL
// // ─────────────────────────────────────────────────────────────────────────────
// function ShortcutsModal({ onClose }) {
//   const shortcuts = [
//     { keys:["Enter"],            desc:"Send message" },
//     { keys:["Shift","Enter"],    desc:"New line in message" },
//     { keys:["Esc"],              desc:"Close chat / dismiss modal" },
//     { keys:["Ctrl","K"],         desc:"Search conversation" },
//     { keys:["Ctrl","Shift","E"], desc:"Export conversation" },
//     { keys:["Ctrl","Shift","C"], desc:"Clear conversation" },
//     { keys:["Ctrl","Shift","L"], desc:"Change language" },
//     { keys:["Ctrl","M"],         desc:"Toggle voice input" },
//   ];

//   return (
//     <div style={{
//       position:"absolute", inset:0, zIndex:14,
//       background:"rgba(3,7,18,0.88)", backdropFilter:"blur(14px)",
//       display:"flex", alignItems:"center", justifyContent:"center",
//       animation:"bot-modal-in 0.22s cubic-bezier(0.22,1,0.36,1)",
//     }} onClick={e=> e.target===e.currentTarget && onClose()}>
//       <div style={{
//         background:"linear-gradient(145deg,rgba(14,17,35,0.98) 0%,rgba(8,11,24,0.99) 100%)",
//         border:"1px solid rgba(165,180,252,0.2)", borderRadius:"20px",
//         padding:"26px 24px", width:"min(420px,calc(100vw - 28px))",
//         boxShadow:"0 32px 80px rgba(0,0,0,0.7),inset 0 1px 0 rgba(255,255,255,0.07)",
//         position:"relative",
//       }}>
//         <button onClick={onClose} style={{
//           position:"absolute", top:"14px", right:"14px",
//           width:"28px", height:"28px", borderRadius:"8px",
//           background:"rgba(255,255,255,0.04)", border:`1px solid ${BORDER}`,
//           color:TEXT_DIM, cursor:"pointer", display:"flex",
//           alignItems:"center", justifyContent:"center", outline:"none",
//         }}><IconX size={12}/></button>

//         <div style={{ marginBottom:"20px" }}>
//           <div style={{ fontFamily:DISPLAY, fontSize:"15px", color:TEXT_PRI, fontWeight:700, letterSpacing:"0.04em", marginBottom:"5px" }}>
//             Keyboard Shortcuts
//           </div>
//           <div style={{ fontFamily:SANS, fontSize:"11.5px", color:TEXT_DIM }}>
//             Move faster without lifting your hands
//           </div>
//         </div>

//         <div style={{ display:"flex", flexDirection:"column", gap:"4px" }}>
//           {shortcuts.map((s, i) => (
//             <div key={i} style={{
//               display:"flex", alignItems:"center", justifyContent:"space-between",
//               padding:"9px 12px", borderRadius:"8px",
//               background: i%2===0 ? "rgba(255,255,255,0.02)" : "transparent",
//             }}>
//               <span style={{ fontFamily:SANS, fontSize:"12.5px", color:TEXT_SEC }}>{s.desc}</span>
//               <div style={{ display:"flex", gap:"4px", flexShrink:0 }}>
//                 {s.keys.map((k, ki) => (
//                   <span key={ki} style={{
//                     fontFamily:MONO, fontSize:"9px", color:ACCENT4,
//                     background:"rgba(165,180,252,0.1)", border:"1px solid rgba(165,180,252,0.25)",
//                     borderRadius:"5px", padding:"2px 6px", letterSpacing:"0.04em",
//                   }}>{k}</span>
//                 ))}
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // EXPORT CONVERSATION
// // ─────────────────────────────────────────────────────────────────────────────
// function exportConversation(messages) {
//   const lines = ["# VisuoSlayer AI — Conversation Export", `Exported: ${new Date().toLocaleString()}`, "", "---", ""];
//   messages.forEach((m, i) => {
//     lines.push(`## [${m.time}] ${m.role === "user" ? "You" : "VisuoSlayer AI"}`);
//     lines.push("");
//     lines.push(m.content);
//     lines.push("");
//     lines.push("---");
//     lines.push("");
//   });
//   const blob = new Blob([lines.join("\n")], { type:"text/markdown" });
//   const url  = URL.createObjectURL(blob);
//   const a    = document.createElement("a");
//   a.href = url; a.download = `vsai-conversation-${Date.now()}.md`;
//   document.body.appendChild(a); a.click();
//   document.body.removeChild(a);
//   URL.revokeObjectURL(url);
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // VOICE INPUT (STT)
// // ─────────────────────────────────────────────────────────────────────────────
// function useVoiceInput(onTranscript) {
//   const [listening, setListening] = useState(false);
//   const recogRef = useRef(null);

//   const toggle = useCallback(() => {
//     const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
//     if (!SR) { alert("Speech recognition not supported in this browser."); return; }
//     if (listening) {
//       recogRef.current?.stop();
//       setListening(false);
//       return;
//     }
//     const r = new SR();
//     recogRef.current = r;
//     r.continuous = false; r.interimResults = false; r.lang = "en-US";
//     r.onstart  = () => setListening(true);
//     r.onend    = () => setListening(false);
//     r.onerror  = () => setListening(false);
//     r.onresult = (e) => {
//       const t = Array.from(e.results).map(r=>r[0].transcript).join(" ").trim();
//       if (t) onTranscript(t);
//     };
//     r.start();
//   }, [listening, onTranscript]);

//   return { listening, toggle };
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // MESSAGE BUBBLE — FIX: speed change takes effect instantly
// // ─────────────────────────────────────────────────────────────────────────────
// function MessageBubble({ msg, idx, speakingIdx, onSpeak, onStopSpeak, voiceSpeed, onSpeedChange }) {
//   const isUser = msg.role === "user";
//   const isSpeaking = speakingIdx === idx;
//   const [copiedMsg, setCopiedMsg] = useState(false);
//   const [showSpeeds, setShowSpeeds] = useState(false);
//   const speedRef = useRef(null);

//   useEffect(() => {
//     if (!showSpeeds) return;
//     const fn = (e) => { if (speedRef.current && !speedRef.current.contains(e.target)) setShowSpeeds(false); };
//     document.addEventListener("mousedown", fn);
//     return () => document.removeEventListener("mousedown", fn);
//   }, [showSpeeds]);

//   const copyMsg = () => {
//     navigator.clipboard?.writeText(msg.content).catch(()=>{});
//     setCopiedMsg(true);
//     setTimeout(()=> setCopiedMsg(false), 1800);
//   };

//   const handleSpeedChange = (rate) => {
//     onSpeedChange(rate);
//     setShowSpeeds(false);
//     // FIX: immediately restart with new speed if currently speaking
//     if (isSpeaking) {
//       setTimeout(() => onSpeak(msg.content, idx, rate), 50);
//     }
//   };

//   return (
//     <div className="bot-msg-in" style={{
//       display:"flex",
//       flexDirection: isUser ? "row-reverse" : "row",
//       alignItems:"flex-start", gap:"10px",
//       animationDelay:`${idx*0.04}s`,
//     }}>
//       {!isUser && (
//         <div style={{
//           width:"32px", height:"32px", borderRadius:"10px", flexShrink:0,
//           background:"linear-gradient(135deg,#1e1b4b 0%,#0f172a 100%)",
//           display:"flex", alignItems:"center", justifyContent:"center",
//           border:"1px solid rgba(109,120,250,0.35)",
//           boxShadow:`0 4px 16px ${GLOW_A},inset 0 1px 0 rgba(255,255,255,0.1)`,
//           marginTop:"2px",
//         }}>
//           <RobotLogo size={20}/>
//         </div>
//       )}

//       <div className="bot-bubble" style={{
//         maxWidth:"min(90%, 700px)",
//         width:"fit-content",
//         padding: isUser ? "11px 16px" : "14px 17px",
//         borderRadius: isUser ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
//         background: isUser
//           ? "linear-gradient(135deg,rgba(109,120,250,0.22) 0%,rgba(56,189,248,0.12) 100%)"
//           : "linear-gradient(145deg,rgba(255,255,255,0.035) 0%,rgba(30,27,75,0.2) 100%)",
//         border:`1px solid ${isUser ? "rgba(109,120,250,0.35)" : "rgba(255,255,255,0.06)"}`,
//         boxShadow: isUser
//           ? "0 4px 20px rgba(109,120,250,0.2),inset 0 1px 0 rgba(255,255,255,0.08)"
//           : "0 2px 12px rgba(0,0,0,0.4),inset 0 1px 0 rgba(255,255,255,0.03)",
//         position:"relative", overflow:"hidden",
//       }}>
//         {!isUser && <div style={{
//           position:"absolute", top:0, left:"12px", right:"12px", height:"1px",
//           background:`linear-gradient(90deg,transparent,${ACCENT}50,transparent)`,
//         }}/>}
//         {isUser && <div style={{
//           position:"absolute", inset:0, borderRadius:"inherit",
//           background:"linear-gradient(105deg,transparent 40%,rgba(109,120,250,0.08) 50%,transparent 60%)",
//           backgroundSize:"200% 100%", animation:"bot-shimmer 4s ease-in-out infinite",
//         }}/>}

//         {!isUser && (
//           <div style={{
//             display:"flex", alignItems:"center", justifyContent:"space-between",
//             marginBottom:"9px", gap:"8px",
//           }}>
//             <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
//               <span style={{ fontFamily:MONO, fontSize:"9px", fontWeight:700, color:ACCENT2, letterSpacing:"0.12em" }}>
//                 VISUOSLAYER AI
//               </span>
//               <div style={{ width:"4px", height:"4px", borderRadius:"50%", background:"#34d399", boxShadow:"0 0 5px #34d399" }}/>
//             </div>

//             <div ref={speedRef} style={{ display:"flex", alignItems:"center", gap:"4px", position:"relative" }}>
//               <button onClick={copyMsg} style={{
//                 display:"flex", alignItems:"center", gap:"3px",
//                 background: copiedMsg ? "rgba(52,211,153,0.15)" : "none",
//                 border:`1px solid ${copiedMsg ? "rgba(52,211,153,0.3)" : "transparent"}`,
//                 borderRadius:"5px", padding:"3px 7px",
//                 fontFamily:MONO, fontSize:"8px",
//                 color: copiedMsg ? "#34d399" : TEXT_DIM,
//                 cursor:"pointer", outline:"none", transition:"all 0.18s",
//                 letterSpacing:"0.04em",
//               }}
//                 onMouseEnter={e=>{ if(!copiedMsg){ e.currentTarget.style.color=TEXT_SEC; e.currentTarget.style.background="rgba(255,255,255,0.05)"; }}}
//                 onMouseLeave={e=>{ if(!copiedMsg){ e.currentTarget.style.color=TEXT_DIM; e.currentTarget.style.background="none"; }}}
//               >
//                 {copiedMsg ? <><IconCheck size={10}/>&nbsp;COPIED</> : <><IconCopy size={10}/>&nbsp;COPY</>}
//               </button>

//               {isSpeaking && (
//                 <button onClick={()=> setShowSpeeds(v=>!v)} style={{
//                   background:"rgba(56,189,248,0.1)", border:"1px solid rgba(56,189,248,0.3)",
//                   borderRadius:"5px", padding:"2px 7px",
//                   fontFamily:MONO, fontSize:"8px", color:ACCENT3,
//                   cursor:"pointer", outline:"none", transition:"all 0.15s",
//                   letterSpacing:"0.04em",
//                 }}>
//                   {SPEED_OPTIONS.find(s=>s.rate===voiceSpeed)?.label ?? "1×"}
//                 </button>
//               )}

//               {showSpeeds && (
//                 <div style={{
//                   position:"absolute", top:"calc(100% + 6px)", right:0, zIndex:60,
//                   background:"rgba(8,11,24,0.98)", border:"1px solid rgba(109,120,250,0.25)",
//                   borderRadius:"10px", overflow:"hidden",
//                   boxShadow:"0 12px 32px rgba(0,0,0,0.6)",
//                   animation:"bot-tip-in 0.15s ease-out", minWidth:"80px",
//                 }}>
//                   {SPEED_OPTIONS.map(opt => (
//                     <button key={opt.rate} onClick={()=> handleSpeedChange(opt.rate)} style={{
//                       display:"block", width:"100%", padding:"7px 12px",
//                       background: voiceSpeed===opt.rate ? "rgba(109,120,250,0.15)" : "none",
//                       border:"none", borderBottom:"1px solid rgba(255,255,255,0.04)",
//                       fontFamily:MONO, fontSize:"9px",
//                       color: voiceSpeed===opt.rate ? ACCENT3 : TEXT_SEC,
//                       cursor:"pointer", textAlign:"left", outline:"none",
//                       transition:"background 0.12s", letterSpacing:"0.04em",
//                     }}
//                       onMouseEnter={e=>{ if(voiceSpeed!==opt.rate) e.currentTarget.style.background="rgba(255,255,255,0.05)"; }}
//                       onMouseLeave={e=>{ if(voiceSpeed!==opt.rate) e.currentTarget.style.background="none"; }}
//                     >{opt.label}</button>
//                   ))}
//                 </div>
//               )}

//               <button onClick={()=> isSpeaking ? onStopSpeak() : onSpeak(msg.content, idx)} style={{
//                 background: isSpeaking ? "rgba(56,189,248,0.15)" : "none",
//                 border:`1px solid ${isSpeaking ? "rgba(56,189,248,0.3)" : "transparent"}`,
//                 borderRadius:"5px", padding:"3px 5px",
//                 color: isSpeaking ? ACCENT3 : TEXT_DIM,
//                 display:"flex", alignItems:"center", justifyContent:"center",
//                 cursor:"pointer", outline:"none", transition:"all 0.18s",
//               }}
//                 onMouseEnter={e=>{ if(!isSpeaking){ e.currentTarget.style.color=ACCENT3; e.currentTarget.style.background="rgba(56,189,248,0.07)"; }}}
//                 onMouseLeave={e=>{ if(!isSpeaking){ e.currentTarget.style.color=TEXT_DIM; e.currentTarget.style.background="none"; }}}
//               >
//                 {isSpeaking ? <IconVolumeOff size={12}/> : <IconVolume size={12}/>}
//               </button>
//             </div>
//           </div>
//         )}

//         <div style={{
//           fontFamily:SANS, fontSize:"13.5px", lineHeight:"1.72",
//           color: isUser ? TEXT_PRI : TEXT_SEC,
//           position:"relative", zIndex:1, fontWeight: isUser ? 500 : 400,
//         }}>
//           {isUser ? msg.content : <RichText content={msg.content}/>}
//         </div>

//         <div style={{
//           display:"flex", alignItems:"center",
//           justifyContent: isUser ? "flex-end" : "flex-start",
//           gap:"5px", marginTop:"8px",
//         }}>
//           <span style={{ fontFamily:MONO, fontSize:"8.5px", color:TEXT_DIM }}>{msg.time}</span>
//           {isUser && <span style={{ fontSize:"9px", color:ACCENT2, opacity:0.7 }}>✓✓</span>}
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // LANGUAGE MODAL
// // ─────────────────────────────────────────────────────────────────────────────
// function LanguageSelector({ currentLang, onSelect, onClose }) {
//   const langs = [
//     { name:"Python",     icon:"🐍", color:"#3b82f6" },
//     { name:"JavaScript", icon:"⚡", color:"#f59e0b" },
//     { name:"Java",       icon:"☕", color:"#ef4444" },
//     { name:"C++",        icon:"⚙️", color:"#8b5cf6" },
//     { name:"Go",         icon:"🔵", color:"#06b6d4" },
//     { name:"Rust",       icon:"🦀", color:"#f97316" },
//   ];
//   return (
//     <div style={{
//       position:"absolute", inset:0, zIndex:10,
//       background:"rgba(3,7,18,0.88)", backdropFilter:"blur(14px)",
//       display:"flex", alignItems:"center", justifyContent:"center",
//       animation:"bot-modal-in 0.22s cubic-bezier(0.22,1,0.36,1)",
//     }} onClick={e=> e.target===e.currentTarget && onClose()}>
//       <div style={{
//         background:"linear-gradient(145deg,rgba(14,17,35,0.98) 0%,rgba(8,11,24,0.99) 100%)",
//         border:"1px solid rgba(109,120,250,0.25)", borderRadius:"20px",
//         padding:"28px 24px", width:"min(380px,calc(100vw - 28px))",
//         boxShadow:"0 32px 80px rgba(0,0,0,0.7),inset 0 1px 0 rgba(255,255,255,0.07)",
//         position:"relative",
//       }}>
//         <div style={{ position:"absolute", top:"-40px", left:"50%", transform:"translateX(-50%)",
//           width:"200px", height:"200px", borderRadius:"50%",
//           background:"radial-gradient(circle,rgba(109,120,250,0.12) 0%,transparent 70%)", pointerEvents:"none" }}/>
//         <button onClick={onClose} style={{
//           position:"absolute", top:"14px", right:"14px",
//           width:"28px", height:"28px", borderRadius:"8px",
//           background:"rgba(255,255,255,0.04)", border:`1px solid ${BORDER}`,
//           color:TEXT_DIM, cursor:"pointer", display:"flex",
//           alignItems:"center", justifyContent:"center", outline:"none",
//         }}><IconX size={12}/></button>
//         <div style={{ textAlign:"center", marginBottom:"22px" }}>
//           <div style={{ fontFamily:DISPLAY, fontSize:"16px", color:TEXT_PRI, fontWeight:700, letterSpacing:"0.04em", marginBottom:"6px" }}>
//             Preferred Language
//           </div>
//           <div style={{ fontFamily:SANS, fontSize:"12px", color:TEXT_DIM, lineHeight:1.5 }}>
//             Code examples will be shown in your chosen language
//           </div>
//         </div>
//         <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" }}>
//           {langs.map(lang => {
//             const sel = currentLang===lang.name;
//             return (
//               <button key={lang.name} onClick={()=> onSelect(lang.name)} style={{
//                 display:"flex", alignItems:"center", gap:"10px",
//                 padding:"12px 14px", borderRadius:"12px",
//                 background: sel ? `linear-gradient(135deg,${lang.color}20 0%,${lang.color}10 100%)` : "rgba(255,255,255,0.02)",
//                 border:`1px solid ${sel ? `${lang.color}50` : "rgba(255,255,255,0.06)"}`,
//                 color: sel ? TEXT_PRI : TEXT_SEC,
//                 cursor:"pointer", fontFamily:SANS, fontSize:"12.5px", fontWeight:600,
//                 transition:"all 0.18s cubic-bezier(0.22,1,0.36,1)", outline:"none", textAlign:"left",
//                 boxShadow: sel ? `0 4px 16px ${lang.color}20` : "none",
//               }}
//                 onMouseEnter={e=>{ if(!sel){ e.currentTarget.style.background=`${lang.color}12`; e.currentTarget.style.borderColor=`${lang.color}35`; e.currentTarget.style.color=TEXT_PRI; e.currentTarget.style.transform="translateY(-1px)"; }}}
//                 onMouseLeave={e=>{ if(!sel){ e.currentTarget.style.background="rgba(255,255,255,0.02)"; e.currentTarget.style.borderColor="rgba(255,255,255,0.06)"; e.currentTarget.style.color=TEXT_SEC; e.currentTarget.style.transform="none"; }}}
//               >
//                 <span style={{ fontSize:"16px", flexShrink:0 }}>{lang.icon}</span>
//                 <div style={{ flex:1, minWidth:0 }}><div style={{ fontWeight:600, fontSize:"12.5px" }}>{lang.name}</div></div>
//                 {sel && <div style={{ width:"8px", height:"8px", borderRadius:"50%", background:lang.color, boxShadow:`0 0 8px ${lang.color}`, flexShrink:0 }}/>}
//               </button>
//             );
//           })}
//         </div>
//         {currentLang && (
//           <div style={{
//             marginTop:"14px", padding:"9px 14px", borderRadius:"10px",
//             background:"rgba(109,120,250,0.06)", border:"1px solid rgba(109,120,250,0.15)",
//             fontFamily:MONO, fontSize:"9px", color:ACCENT4, letterSpacing:"0.06em",
//             display:"flex", alignItems:"center", gap:"8px",
//           }}>
//             <span style={{ opacity:0.5 }}>CURRENT →</span>
//             <span style={{ color:ACCENT3, fontWeight:700 }}>{currentLang}</span>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // CLEAR MODAL
// // ─────────────────────────────────────────────────────────────────────────────
// function ClearModal({ count, onConfirm, onCancel }) {
//   return (
//     <div style={{
//       position:"absolute", inset:0, zIndex:11,
//       background:"rgba(3,7,18,0.88)", backdropFilter:"blur(14px)",
//       display:"flex", alignItems:"center", justifyContent:"center",
//       animation:"bot-modal-in 0.2s cubic-bezier(0.22,1,0.36,1)",
//     }} onClick={e=> e.target===e.currentTarget && onCancel()}>
//       <div style={{
//         background:"linear-gradient(145deg,rgba(14,17,35,0.98),rgba(8,11,24,0.99))",
//         border:"1px solid rgba(239,68,68,0.2)", borderRadius:"18px",
//         padding:"26px", width:"min(310px,calc(100vw - 28px))",
//         boxShadow:"0 24px 60px rgba(0,0,0,0.7)", textAlign:"center",
//       }}>
//         <div style={{
//           width:"46px", height:"46px", borderRadius:"14px", margin:"0 auto 14px",
//           background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.2)",
//           display:"flex", alignItems:"center", justifyContent:"center", fontSize:"20px",
//         }}>🗑️</div>
//         <div style={{ fontFamily:DISPLAY, fontSize:"13px", color:TEXT_PRI, marginBottom:"8px", fontWeight:700 }}>
//           Clear conversation?
//         </div>
//         <div style={{ fontFamily:SANS, fontSize:"12px", color:TEXT_DIM, marginBottom:"20px", lineHeight:1.5 }}>
//           This will remove all {count} message{count!==1?"s":""}. Cannot be undone.
//         </div>
//         <div style={{ display:"flex", gap:"10px" }}>
//           <button onClick={onCancel} style={{
//             flex:1, padding:"10px", borderRadius:"10px",
//             background:"rgba(255,255,255,0.04)", border:`1px solid ${BORDER2}`,
//             color:TEXT_SEC, fontFamily:SANS, fontSize:"12px", fontWeight:600,
//             cursor:"pointer", outline:"none", transition:"all 0.18s",
//           }}
//             onMouseEnter={e=>{ e.currentTarget.style.background="rgba(255,255,255,0.08)"; e.currentTarget.style.color=TEXT_PRI; }}
//             onMouseLeave={e=>{ e.currentTarget.style.background="rgba(255,255,255,0.04)"; e.currentTarget.style.color=TEXT_SEC; }}
//           >Cancel</button>
//           <button onClick={onConfirm} style={{
//             flex:1, padding:"10px", borderRadius:"10px",
//             background:"linear-gradient(135deg,rgba(239,68,68,0.2),rgba(239,68,68,0.12))",
//             border:"1px solid rgba(239,68,68,0.35)",
//             color:"#fca5a5", fontFamily:SANS, fontSize:"12px", fontWeight:700,
//             cursor:"pointer", outline:"none", transition:"all 0.18s",
//           }}
//             onMouseEnter={e=>{ e.currentTarget.style.background="linear-gradient(135deg,rgba(239,68,68,0.3),rgba(239,68,68,0.2))"; }}
//             onMouseLeave={e=>{ e.currentTarget.style.background="linear-gradient(135deg,rgba(239,68,68,0.2),rgba(239,68,68,0.12))"; }}
//           >Clear All</button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // EMPTY STATE
// // ─────────────────────────────────────────────────────────────────────────────
// function EmptyState({ onSend }) {
//   const [activeGroup, setActiveGroup] = useState(0);
//   const group = SUGGESTION_GROUPS[activeGroup];

//   return (
//     <div style={{
//       flex:1, display:"flex", flexDirection:"column",
//       alignItems:"center", justifyContent:"flex-start",
//       padding:"24px 0 16px", minHeight:"100%",
//     }}>
//       <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"14px", marginBottom:"28px" }}>
//         <div style={{ position:"relative", animation:"bot-empty-float 7s ease-in-out infinite" }}>
//           <div style={{
//             width:"70px", height:"70px", borderRadius:"20px",
//             background:"linear-gradient(135deg,#1e1b4b 0%,#0f172a 100%)",
//             display:"flex", alignItems:"center", justifyContent:"center",
//             border:"1.5px solid rgba(109,120,250,0.45)",
//             boxShadow:`0 8px 32px ${GLOW_A},inset 0 1px 0 rgba(255,255,255,0.12)`,
//             position:"relative", overflow:"hidden",
//           }}>
//             <RobotLogo size={40} animated/>
//             <div style={{
//               position:"absolute", left:0, right:0, height:"1.5px",
//               background:`linear-gradient(90deg,transparent,${ACCENT3}80,transparent)`,
//               animation:"bot-scan-line 3s ease-in-out infinite",
//             }}/>
//           </div>
//           {[0,1].map(i=> (
//             <div key={i} style={{
//               position:"absolute", inset:`${-14-i*12}px`, borderRadius:`${26+i*8}px`,
//               border:`1px solid rgba(109,120,250,${0.13-i*0.04})`,
//               animation:`bot-ring-expand ${2.5+i}s ease-out ${i*0.8}s infinite`,
//             }}/>
//           ))}
//         </div>
//         <div style={{ textAlign:"center", maxWidth:"300px" }}>
//           <div style={{
//             fontFamily:DISPLAY, fontSize:"17px", fontWeight:700, letterSpacing:"0.03em",
//             background:`linear-gradient(90deg,${TEXT_PRI} 0%,${ACCENT4} 100%)`,
//             WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
//             backgroundClip:"text", marginBottom:"7px",
//           }}>What do you want to master?</div>
//           <div style={{ fontFamily:SANS, fontSize:"12.5px", color:TEXT_DIM, lineHeight:"1.6" }}>
//             Pick a topic or type your own question below
//           </div>
//         </div>
//       </div>

//       <div style={{
//         display:"flex", gap:"7px", marginBottom:"16px",
//         width:"100%", maxWidth:"500px",
//         flexWrap:"wrap", justifyContent:"center", padding:"0 4px",
//       }}>
//         {SUGGESTION_GROUPS.map((g, gi) => (
//           <button key={gi} onClick={()=> setActiveGroup(gi)} style={{
//             padding:"6px 14px", borderRadius:"40px",
//             background: activeGroup===gi ? `${g.color}1e` : "rgba(255,255,255,0.03)",
//             border:`1px solid ${activeGroup===gi ? `${g.color}55` : "rgba(255,255,255,0.07)"}`,
//             fontFamily:MONO, fontSize:"9px", fontWeight:700, letterSpacing:"0.08em",
//             color: activeGroup===gi ? g.color : TEXT_DIM,
//             cursor:"pointer", outline:"none",
//             transition:"all 0.18s cubic-bezier(0.22,1,0.36,1)",
//             boxShadow: activeGroup===gi ? `0 2px 10px ${g.color}20` : "none",
//           }}
//             onMouseEnter={e=>{ if(activeGroup!==gi){ e.currentTarget.style.color=TEXT_SEC; e.currentTarget.style.background="rgba(255,255,255,0.06)"; }}}
//             onMouseLeave={e=>{ if(activeGroup!==gi){ e.currentTarget.style.color=TEXT_DIM; e.currentTarget.style.background="rgba(255,255,255,0.03)"; }}}
//           >{g.group.toUpperCase()}</button>
//         ))}
//       </div>

//       <div style={{ display:"flex", flexDirection:"column", gap:"9px", width:"100%", maxWidth:"500px", padding:"0 4px" }}>
//         {group.items.map((s, i) => (
//           <button key={`${activeGroup}-${i}`} className="bot-suggestion"
//             onClick={()=> onSend(s.label)}
//             style={{
//               display:"flex", alignItems:"center", gap:"14px",
//               padding:"14px 16px", borderRadius:"14px",
//               background:`${group.color}08`, border:`1px solid ${group.color}22`,
//               color:TEXT_SEC, fontFamily:SANS, fontSize:"13px",
//               fontWeight:500, cursor:"pointer", textAlign:"left", outline:"none",
//               animation:`bot-suggestion-slide 0.28s cubic-bezier(0.22,1,0.36,1) ${i*0.06}s both`,
//             }}
//             onMouseEnter={e=>{ e.currentTarget.style.background=`${group.color}16`; e.currentTarget.style.borderColor=`${group.color}48`; e.currentTarget.style.color=TEXT_PRI; }}
//             onMouseLeave={e=>{ e.currentTarget.style.background=`${group.color}08`; e.currentTarget.style.borderColor=`${group.color}22`; e.currentTarget.style.color=TEXT_SEC; }}
//           >
//             <span style={{
//               width:"38px", height:"38px", borderRadius:"10px", flexShrink:0,
//               background:`${group.color}14`, border:`1px solid ${group.color}28`,
//               display:"flex", alignItems:"center", justifyContent:"center",
//               fontFamily:MONO, fontSize:"15px", color:group.color,
//             }}>{s.icon}</span>
//             <div style={{ flex:1, minWidth:0 }}>
//               <div style={{ fontWeight:600, fontSize:"13px", color:"inherit", lineHeight:"1.35", marginBottom:"3px" }}>
//                 {s.label}
//               </div>
//               <div style={{ fontFamily:MONO, fontSize:"9px", color:group.color, opacity:0.6, letterSpacing:"0.04em" }}>
//                 {s.sub}
//               </div>
//             </div>
//             <span style={{ color:TEXT_DIM, fontSize:"16px", flexShrink:0, marginRight:"-2px" }}>›</span>
//           </button>
//         ))}
//       </div>

//       <div style={{
//         marginTop:"22px", display:"flex", alignItems:"center", gap:"12px",
//         width:"100%", maxWidth:"500px", padding:"0 4px",
//       }}>
//         <div style={{ flex:1, height:"1px", background:"rgba(255,255,255,0.04)" }}/>
//         <span style={{ fontFamily:MONO, fontSize:"8px", color:TEXT_DIM, letterSpacing:"0.09em", whiteSpace:"nowrap" }}>
//           OR TYPE YOUR OWN QUESTION
//         </span>
//         <div style={{ flex:1, height:"1px", background:"rgba(255,255,255,0.04)" }}/>
//       </div>
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // MAIN COMPONENT
// // ─────────────────────────────────────────────────────────────────────────────
// export default function ChatBot() {
//   const [open,            setOpen]            = useState(false);
//   const [messages,        setMessages]        = useState([]);
//   const [input,           setInput]           = useState("");
//   const [loading,         setLoading]         = useState(false);
//   const [fabHov,          setFabHov]          = useState(false);
//   const [mounted,         setMounted]         = useState(false);
//   const [inputFoc,        setInputFoc]        = useState(false);
//   const [particles,       setParticles]       = useState([]);
//   const [panelAnim,       setPanelAnim]       = useState("in");
//   const [charCount,       setCharCount]       = useState(0);
//   const [userLanguage,    setUserLanguage]    = useState(null);
//   const [showLangModal,   setShowLangModal]   = useState(false);
//   const [showClearModal,  setShowClearModal]  = useState(false);
//   const [showVoiceModal,  setShowVoiceModal]  = useState(false);
//   const [showSearch,      setShowSearch]      = useState(false);
//   const [showShortcuts,   setShowShortcuts]   = useState(false);
//   const [speakingIdx,     setSpeakingIdx]     = useState(null);
//   const [voiceSpeed,      setVoiceSpeed]      = useState(1.0);
//   const [selectedVoice,   setSelectedVoice]   = useState(null);
//   const [jumpToIdx,       setJumpToIdx]       = useState(null);
//   const [exportFlash,     setExportFlash]     = useState(false);

//   const messagesEndRef = useRef(null);
//   const inputRef       = useRef(null);
//   const textareaRef    = useRef(null);
//   const msgRefs        = useRef({});

//   // Voice input hook
//   const { listening, toggle: toggleVoice } = useVoiceInput((transcript) => {
//     setInput(prev => (prev ? prev + " " : "") + transcript);
//     setCharCount(prev => prev + transcript.length + 1);
//   });

//   useEffect(() => {
//     try {
//       const stored = localStorage.getItem("vsai_lang");
//       if (stored) setUserLanguage(stored);
//       else setShowLangModal(true);
//     } catch {}
//   }, []);

//   const handleLanguageSelect = (lang) => {
//     setUserLanguage(lang);
//     try { localStorage.setItem("vsai_lang", lang); } catch {}
//     setShowLangModal(false);
//   };

//   useEffect(() => {
//     setMounted(true);
//     setParticles(Array.from({ length:12 }, (_,i) => ({
//       id:i,
//       top:`${5+(i*8.1)%90}%`, left:`${5+((i*37)%90)}%`,
//       delay:`${i*0.35}s`, dur:`${3.5+(i%4)*0.8}s`,
//       size: i%3===0?"3px":i%3===1?"2px":"1.5px",
//       color: i%4===0?ACCENT:i%4===1?ACCENT3:i%4===2?"#f472b6":"#34d399",
//     })));
//   }, []);

//   useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages, loading]);
//   useEffect(() => { if (open) setTimeout(()=> inputRef.current?.focus(), 350); }, [open]);

//   // Jump to message
//   useEffect(() => {
//     if (jumpToIdx !== null && msgRefs.current[jumpToIdx]) {
//       msgRefs.current[jumpToIdx].scrollIntoView({ behavior:"smooth", block:"center" });
//       setJumpToIdx(null);
//     }
//   }, [jumpToIdx]);

//   // Keyboard shortcuts
//   useEffect(() => {
//     const h = (e) => {
//       if (e.key==="Escape") {
//         if (showSearch) { setShowSearch(false); return; }
//         if (showShortcuts) { setShowShortcuts(false); return; }
//         if (showVoiceModal) { setShowVoiceModal(false); return; }
//         if (open) closePanel();
//       }
//       if (!open) return;
//       // Ctrl+K → search
//       if ((e.ctrlKey||e.metaKey) && e.key==="k") { e.preventDefault(); setShowSearch(true); }
//       // Ctrl+Shift+E → export
//       if ((e.ctrlKey||e.metaKey) && e.shiftKey && e.key==="E") { e.preventDefault(); handleExport(); }
//       // Ctrl+Shift+C → clear
//       if ((e.ctrlKey||e.metaKey) && e.shiftKey && e.key==="C") { e.preventDefault(); if(messages.length>0) setShowClearModal(true); }
//       // Ctrl+Shift+L → language
//       if ((e.ctrlKey||e.metaKey) && e.shiftKey && e.key==="L") { e.preventDefault(); setShowLangModal(true); }
//       // Ctrl+M → voice input
//       if ((e.ctrlKey||e.metaKey) && e.key==="m") { e.preventDefault(); toggleVoice(); }
//       // Ctrl+/ → shortcuts
//       if ((e.ctrlKey||e.metaKey) && e.key==="/") { e.preventDefault(); setShowShortcuts(true); }
//     };
//     window.addEventListener("keydown", h);
//     return () => window.removeEventListener("keydown", h);
//   }, [open, showSearch, showShortcuts, showVoiceModal, messages, toggleVoice]);

//   useEffect(() => {
//     if (textareaRef.current) {
//       textareaRef.current.style.height = "22px";
//       textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 96)+"px";
//     }
//   }, [input]);

//   const closePanel = () => { setPanelAnim("out"); setTimeout(()=>{ setOpen(false); setPanelAnim("in"); }, 260); };
//   const openPanel  = () => { setOpen(true); setPanelAnim("in"); };
//   const getTime    = () => new Date().toLocaleTimeString("en-US",{ hour:"2-digit", minute:"2-digit" });

//   const handleExport = () => {
//     if (!messages.length) return;
//     exportConversation(messages);
//     setExportFlash(true);
//     setTimeout(()=> setExportFlash(false), 1500);
//   };

//   // FIX: speakText accepts optional overrideRate to instantly change speed
//   const speakText = useCallback((text, idx, overrideRate) => {
//     if (!('speechSynthesis' in window)) return;
//     window.speechSynthesis.cancel();
//     setSpeakingIdx(idx);
//     const clean = text
//       .replace(/```[\s\S]*?```/g,"")
//       .replace(/\*\*/g,"").replace(/`/g,"").trim();
//     const utt = new SpeechSynthesisUtterance(clean);
//     utt.lang = "en-US";
//     utt.rate = overrideRate ?? voiceSpeed;
//     if (selectedVoice) utt.voice = selectedVoice;
//     utt.onend  = () => setSpeakingIdx(null);
//     utt.onerror = () => setSpeakingIdx(null);
//     window.speechSynthesis.speak(utt);
//   }, [voiceSpeed, selectedVoice]);

//   const stopSpeak = () => { window.speechSynthesis?.cancel(); setSpeakingIdx(null); };

//   const sendMessage = useCallback(async (text) => {
//     const userText = (text ?? input).trim();
//     if (!userText || loading) return;
//     setInput(""); setCharCount(0);

//     const userMsg = { role:"user", content:userText, time:getTime() };
//     setMessages(prev => [...prev, userMsg]);
//     setLoading(true);

//     try {
//       const lang = userLanguage || "Python";
//       const systemPrompt = `You are a concise, expert DSA (Data Structures & Algorithms) tutor.

// STRICT RULES — never break these:
// 1. NEVER open with greetings, self-introductions, affirmations, or filler phrases such as "Great question!", "Certainly!", "Of course!", "I'd be happy to help", "As an AI language model", "Sure!", or any similar preamble.
// 2. NEVER mention, reference, or promote any AI product, company, or model name — including yourself.
// 3. BEGIN every answer IMMEDIATELY with the technical content. Zero warm-up sentences.
// 4. Use **bold** for key terms, \`inline code\` for variables/complexities, and fenced code blocks (\`\`\`) for algorithms.
// 5. Use bullet points (- ) for lists. Be precise, dense with value, and technically accurate.
// 6. Always include a working ${lang} code example when explaining algorithms or data structures.
// 7. Keep explanations structured: concept → intuition → complexity → code.`;

//       const history = [...messages, userMsg].map(m=>({ role:m.role, content:m.content }));
//       const res = await fetch("/api/chat", {
//         method:"POST", headers:{ "Content-Type":"application/json" },
//         body:JSON.stringify({ messages:[{ role:"system", content:systemPrompt }, ...history] }),
//       });
//       const data = await res.json();
//       const reply = data.content ?? data.error ?? "Something went wrong.";
//       setMessages(prev => [...prev, { role:"assistant", content:reply, time:getTime() }]);
//     } catch {
//       setMessages(prev => [...prev, { role:"assistant", content:"Connection error. Please try again.", time:getTime() }]);
//     } finally { setLoading(false); }
//   }, [input, messages, loading, userLanguage]);

//   const handleKey   = (e) => { if (e.key==="Enter" && !e.shiftKey){ e.preventDefault(); sendMessage(); } };
//   const handleInput = (e) => { setInput(e.target.value); setCharCount(e.target.value.length); };

//   if (!mounted) return null;
//   const hasMessages = messages.length > 0;

//   return (
//     <>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
//         *, *::before, *::after { box-sizing:border-box; }

//         @keyframes bot-typing-dot {
//           0%,60%,100%{ transform:translateY(0) scale(0.8); opacity:0.4; }
//           30%         { transform:translateY(-5px) scale(1.1); opacity:1; }
//         }
//         @keyframes bot-shimmer {
//           0%  { background-position:-200% 0; }
//           100%{ background-position:200% 0; }
//         }
//         @keyframes bot-panel-in {
//           from{ opacity:0; transform:translateY(18px); }
//           to  { opacity:1; transform:translateY(0); }
//         }
//         @keyframes bot-panel-out {
//           from{ opacity:1; transform:translateY(0); }
//           to  { opacity:0; transform:translateY(18px); }
//         }
//         @keyframes bot-fab-pulse {
//           0%,100%{ box-shadow:0 0 0 0 rgba(109,120,250,0),0 8px 32px rgba(109,120,250,0.4); }
//           50%    { box-shadow:0 0 0 10px rgba(109,120,250,0.06),0 8px 32px rgba(109,120,250,0.55); }
//         }
//         @keyframes bot-fab-spin { to{ transform:rotate(360deg); } }
//         @keyframes bot-msg-in {
//           from{ opacity:0; transform:translateY(10px) scale(0.98); }
//           to  { opacity:1; transform:translateY(0) scale(1); }
//         }
//         @keyframes bot-particle {
//           0%,100%{ opacity:0.1; transform:translateY(0) scale(1); }
//           50%    { opacity:0.5; transform:translateY(-10px) scale(1.4); }
//         }
//         @keyframes bot-orb1 {
//           0%,100%{ transform:translate(0,0) scale(1); }
//           33%    { transform:translate(18px,-12px) scale(1.08); }
//           66%    { transform:translate(-8px,8px) scale(0.94); }
//         }
//         @keyframes bot-orb2 {
//           0%,100%{ transform:translate(0,0) scale(1); }
//           40%    { transform:translate(-15px,10px) scale(1.05); }
//           80%    { transform:translate(10px,-6px) scale(0.96); }
//         }
//         @keyframes bot-badge-pop {
//           0% { transform:scale(0) rotate(-20deg); }
//           70%{ transform:scale(1.25) rotate(5deg); }
//           100%{ transform:scale(1) rotate(0); }
//         }
//         @keyframes bot-glow-ring {
//           0%,100%{ opacity:0.5; transform:scale(1); }
//           50%    { opacity:1; transform:scale(1.1); }
//         }
//         @keyframes bot-scan-line {
//           0%  { top:-1px; opacity:0; }
//           10% { opacity:0.7; }
//           90% { opacity:0.7; }
//           100%{ top:100%; opacity:0; }
//         }
//         @keyframes bot-logo-shimmer {
//           0%  { background-position:-200% 0; }
//           100%{ background-position:200% 0; }
//         }
//         @keyframes bot-header-gradient {
//           0%,100%{ background-position:0% 50%; }
//           50%    { background-position:100% 50%; }
//         }
//         @keyframes bot-grid-move {
//           0%  { transform:translate(0,0); }
//           100%{ transform:translate(24px,24px); }
//         }
//         @keyframes bot-antenna-pulse {
//           0%,100%{ opacity:1; }
//           50%    { opacity:0.55; }
//         }
//         @keyframes bot-eye-blink {
//           0%,92%,100%{ transform:scaleY(1); }
//           95%         { transform:scaleY(0.1); }
//         }
//         @keyframes bot-logo-float {
//           0%,100%{ transform:translateY(0); }
//           50%    { transform:translateY(-2px); }
//         }
//         @keyframes bot-send-ready {
//           0%,100%{ box-shadow:0 4px 14px rgba(109,120,250,0.4); }
//           50%    { box-shadow:0 4px 22px rgba(56,189,248,0.5); }
//         }
//         @keyframes bot-suggestion-slide {
//           from{ opacity:0; transform:translateX(-10px); }
//           to  { opacity:1; transform:translateX(0); }
//         }
//         @keyframes bot-empty-float {
//           0%,100%{ transform:translateY(0) rotate(0deg); }
//           33%    { transform:translateY(-5px) rotate(1deg); }
//           66%    { transform:translateY(-2px) rotate(-0.8deg); }
//         }
//         @keyframes bot-ring-expand {
//           0%  { transform:scale(0.8); opacity:0.8; }
//           100%{ transform:scale(2.2); opacity:0; }
//         }
//         @keyframes bot-modal-in {
//           from{ opacity:0; transform:scale(0.96) translateY(8px); }
//           to  { opacity:1; transform:scale(1) translateY(0); }
//         }
//         @keyframes bot-tip-in {
//           from{ opacity:0; transform:translateY(-3px); }
//           to  { opacity:1; transform:translateY(0); }
//         }
//         @keyframes bot-mic-pulse {
//           0%,100%{ box-shadow:0 0 0 0 rgba(239,68,68,0.4); }
//           50%    { box-shadow:0 0 0 8px rgba(239,68,68,0); }
//         }

//         .bot-msg-in { animation:bot-msg-in 0.3s cubic-bezier(0.22,1,0.36,1) both; }

//         .bot-scroll { scrollbar-width:thin; scrollbar-color:rgba(109,120,250,0.2) transparent; }
//         .bot-scroll::-webkit-scrollbar { width:3px; }
//         .bot-scroll::-webkit-scrollbar-thumb { background:rgba(109,120,250,0.2); border-radius:10px; }
//         .bot-scroll::-webkit-scrollbar-thumb:hover { background:rgba(109,120,250,0.4); }

//         .bot-suggestion {
//           -webkit-tap-highlight-color:transparent;
//           transition:all 0.22s cubic-bezier(0.22,1,0.36,1) !important;
//         }
//         .bot-suggestion:hover  { transform:translateX(5px) translateY(-1px) !important; }
//         .bot-suggestion:active { transform:scale(0.98) !important; }

//         .bot-send { transition:all 0.18s cubic-bezier(0.22,1,0.36,1); -webkit-tap-highlight-color:transparent; }
//         .bot-send:hover:not(:disabled)  { transform:scale(1.08) rotate(8deg); }
//         .bot-send:active:not(:disabled) { transform:scale(0.92); }

//         @media (max-width:520px) {
//           .bot-bubble { max-width:92% !important; }
//           .bot-header-inner { gap:8px !important; padding:11px 12px !important; }
//           .bot-title-txt { font-size:12px !important; }
//           .bot-avatar-wrap { width:32px !important; height:32px !important; border-radius:10px !important; }
//           .bot-msgs-area { padding:10px 10px 6px !important; gap:11px !important; }
//           .bot-input-area { padding:8px 10px calc(env(safe-area-inset-bottom,0px)+10px) !important; }
//           .bot-hbtns { gap:3px !important; }
//           .bot-hbtn-wrap > button { width:28px !important; height:28px !important; border-radius:8px !important; }
//           .bot-send-btn { width:32px !important; height:32px !important; }
//         }
//         @media (max-width:360px) {
//           .bot-header-inner { padding:9px 10px !important; gap:6px !important; }
//         }
//       `}</style>

//       {/* ── FAB ── */}
//       {!open && (
//         <div style={{
//           position:"fixed",
//           bottom:`calc(env(safe-area-inset-bottom,0px) + 22px)`,
//           right:"22px", zIndex:500,
//         }}>
//           <div style={{
//             position:"absolute", inset:"-8px", borderRadius:"24px",
//             background:`radial-gradient(circle,${GLOW_A} 0%,transparent 70%)`,
//             animation:"bot-glow-ring 3.5s ease-in-out infinite", pointerEvents:"none",
//           }}/>
//           <button
//             onClick={openPanel}
//             onMouseEnter={()=> setFabHov(true)}
//             onMouseLeave={()=> setFabHov(false)}
//             aria-label="Open DSA assistant"
//             style={{
//               position:"relative", width:"56px", height:"56px", borderRadius:"16px",
//               background: fabHov
//                 ? "linear-gradient(135deg,#5a62e8 0%,#3b82f6 100%)"
//                 : "linear-gradient(135deg,#4338ca 0%,#6d78fa 50%,#38bdf8 100%)",
//               border:`1.5px solid ${fabHov?"rgba(56,189,248,0.6)":"rgba(109,120,250,0.6)"}`,
//               cursor:"pointer",
//               display:"flex", alignItems:"center", justifyContent:"center",
//               boxShadow:"0 8px 36px rgba(109,120,250,0.55),0 4px 16px rgba(0,0,0,0.4)",
//               transition:"all 0.25s cubic-bezier(0.22,1,0.36,1)",
//               animation:!fabHov?"bot-fab-pulse 3.5s ease-in-out infinite":"none",
//               backdropFilter:"blur(16px)", outline:"none",
//             }}
//           >
//             <div style={{ transition:"transform 0.25s", transform:fabHov?"scale(1.1) rotate(-5deg)":"scale(1)" }}>
//               <RobotLogo size={26} animated/>
//             </div>
//           </button>
//           {hasMessages && (
//             <div style={{
//               position:"absolute", top:"-5px", right:"-5px",
//               width:"14px", height:"14px", borderRadius:"50%",
//               background:"linear-gradient(135deg,#f472b6,#e879f9)",
//               border:"2px solid #030712",
//               animation:"bot-badge-pop 0.35s cubic-bezier(0.22,1,0.36,1)",
//               boxShadow:"0 0 10px rgba(248,121,249,0.7)",
//             }}/>
//           )}
//         </div>
//       )}

//       {/* ── PANEL ── */}
//       {open && (
//         <div style={{
//           position:"fixed", top:0, left:0, right:0, bottom:0,
//           width:"100dvw", height:"100dvh",
//           background:SURFACE, display:"flex", flexDirection:"column",
//           overflow:"hidden",
//           animation: panelAnim==="in"
//             ? "bot-panel-in 0.32s cubic-bezier(0.22,1,0.36,1)"
//             : "bot-panel-out 0.24s cubic-bezier(0.4,0,0.6,1) forwards",
//           zIndex:499,
//         }}>

//           {/* ambient */}
//           <div style={{ position:"absolute", inset:0, overflow:"hidden", pointerEvents:"none", zIndex:0 }}>
//             <div style={{ position:"absolute", top:"-60px", left:"15%", width:"260px", height:"260px", borderRadius:"50%",
//               background:`radial-gradient(circle,${GLOW_A} 0%,transparent 70%)`,
//               filter:"blur(50px)", animation:"bot-orb1 18s ease-in-out infinite" }}/>
//             <div style={{ position:"absolute", bottom:"40px", right:"-30px", width:"200px", height:"200px", borderRadius:"50%",
//               background:`radial-gradient(circle,${GLOW_B} 0%,transparent 70%)`,
//               filter:"blur(40px)", animation:"bot-orb2 22s ease-in-out infinite" }}/>
//             <div style={{ position:"absolute", bottom:"-20px", left:"10%", width:"150px", height:"150px", borderRadius:"50%",
//               background:"radial-gradient(circle,rgba(244,114,182,0.08) 0%,transparent 70%)",
//               filter:"blur(35px)", animation:"bot-orb1 28s ease-in-out infinite reverse" }}/>
//             <div style={{ position:"absolute", inset:"-24px",
//               backgroundImage:"radial-gradient(circle,rgba(109,120,250,0.07) 1px,transparent 1px)",
//               backgroundSize:"24px 24px", animation:"bot-grid-move 8s linear infinite" }}/>
//             {particles.map(p=>(
//               <div key={p.id} style={{ position:"absolute", top:p.top, left:p.left,
//                 width:p.size, height:p.size, borderRadius:"50%",
//                 background:p.color, boxShadow:`0 0 4px ${p.color}`,
//                 animation:`bot-particle ${p.dur} ease-in-out ${p.delay} infinite` }}/>
//             ))}
//           </div>

//           {/* ── HEADER ── */}
//           <div className="bot-header-inner" style={{
//             padding:"14px 18px",
//             borderBottom:`1px solid ${BORDER}`,
//             display:"flex", alignItems:"center", gap:"12px",
//             flexShrink:0, position:"relative", zIndex:2,
//             background:"linear-gradient(to bottom,rgba(109,120,250,0.05) 0%,transparent 100%)",
//           }}>
//             <div style={{
//               position:"absolute", bottom:0, left:"10%", right:"10%", height:"1px",
//               background:`linear-gradient(90deg,transparent,${ACCENT}60,${ACCENT3}60,transparent)`,
//               animation:"bot-header-gradient 4s ease-in-out infinite", backgroundSize:"200% 100%",
//             }}/>

//             {/* avatar */}
//             <div className="bot-avatar-wrap" style={{
//               width:"40px", height:"40px", borderRadius:"12px", flexShrink:0,
//               background:"linear-gradient(135deg,#1e1b4b 0%,#0f172a 100%)",
//               display:"flex", alignItems:"center", justifyContent:"center",
//               border:"1px solid rgba(109,120,250,0.4)",
//               boxShadow:`0 4px 20px ${GLOW_A},inset 0 1px 0 rgba(255,255,255,0.12)`,
//               position:"relative", overflow:"hidden",
//             }}>
//               <RobotLogo size={24} animated/>
//               <div style={{ position:"absolute", left:0, right:0, height:"1.5px",
//                 background:`linear-gradient(90deg,transparent,${ACCENT3}80,transparent)`,
//                 animation:"bot-scan-line 4s ease-in-out infinite" }}/>
//             </div>

//             {/* title */}
//             <div style={{ flex:1, minWidth:0 }}>
//               <div className="bot-title-txt" style={{
//                 fontFamily:DISPLAY, fontWeight:700, fontSize:"14px",
//                 background:`linear-gradient(90deg,${ACCENT2} 0%,${ACCENT3} 30%,#c084fc 60%,${ACCENT2} 90%)`,
//                 backgroundSize:"200% auto",
//                 WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
//                 animation:"bot-logo-shimmer 5s ease-in-out infinite",
//                 letterSpacing:"0.03em", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
//               }}>VisuoSlayer AI</div>
//               <div style={{ display:"flex", alignItems:"center", gap:"6px", marginTop:"2px", flexWrap:"wrap" }}>
//                 <span style={{ width:"6px", height:"6px", borderRadius:"50%", flexShrink:0,
//                   background:"#34d399", boxShadow:"0 0 8px #34d399",
//                   display:"inline-block", animation:"bot-glow-ring 2s ease-in-out infinite" }}/>
//                 <span style={{ fontFamily:MONO, fontSize:"9px", color:"#34d399", fontWeight:700, letterSpacing:"0.1em" }}>ONLINE</span>
//                 {userLanguage && <>
//                   <span style={{ color:TEXT_DIM, fontSize:"8px" }}>·</span>
//                   <span style={{ fontFamily:MONO, fontSize:"9px", color:ACCENT4, opacity:0.7 }}>{userLanguage}</span>
//                 </>}
//                 {messages.length > 0 && <>
//                   <span style={{ color:TEXT_DIM, fontSize:"8px" }}>·</span>
//                   <span style={{ fontFamily:MONO, fontSize:"9px", color:TEXT_DIM }}>{messages.length} msgs</span>
//                 </>}
//               </div>
//             </div>

//             {/* ── HEADER BUTTONS — 4 new + existing ── */}
//             <div className="bot-hbtns" style={{ display:"flex", gap:"5px", flexShrink:0, alignItems:"center" }}>

//               {/* Search conversation — NEW */}
//               <div className="bot-hbtn-wrap">
//                 <HeaderBtn icon={<IconSearch size={14}/>}
//                   tooltip="Search  (Ctrl+K)"
//                   onClick={()=> setShowSearch(true)}
//                   variant="search"
//                   disabled={!hasMessages}/>
//               </div>

//               {/* Export — NEW */}
//               <div className="bot-hbtn-wrap">
//                 <HeaderBtn icon={<IconDownload size={14}/>}
//                   tooltip={exportFlash ? "Exported!" : "Export  (Ctrl+Shift+E)"}
//                   onClick={handleExport}
//                   variant="export"
//                   disabled={!hasMessages}
//                   active={exportFlash}/>
//               </div>

//               {/* Voice & Speed — NEW (replaces per-message only) */}
//               <div className="bot-hbtn-wrap">
//                 <HeaderBtn icon={<IconVolume size={14}/>}
//                   tooltip={selectedVoice ? `Voice: ${selectedVoice.name.split(" ").slice(0,2).join(" ")}` : "Voice settings"}
//                   onClick={()=> setShowVoiceModal(true)}
//                   variant="default"
//                   active={!!selectedVoice}/>
//               </div>

//               {/* Keyboard shortcuts — NEW */}
//               <div className="bot-hbtn-wrap">
//                 <HeaderBtn icon={<IconKeyboard size={14}/>}
//                   tooltip="Shortcuts  (Ctrl+/)"
//                   onClick={()=> setShowShortcuts(true)}
//                   variant="keys"/>
//               </div>

//               <div style={{ width:"1px", height:"20px", background:"rgba(255,255,255,0.07)", flexShrink:0 }}/>

//               {/* Language */}
//               <div className="bot-hbtn-wrap">
//                 <HeaderBtn icon={<IconGlobe size={14}/>}
//                   tooltip={userLanguage?`Language: ${userLanguage}`:"Set language"}
//                   onClick={()=> setShowLangModal(true)}
//                   variant="lang" active={!!userLanguage}/>
//               </div>

//               {/* Clear */}
//               <div className="bot-hbtn-wrap">
//                 <HeaderBtn icon={<IconTrash size={14}/>}
//                   tooltip={hasMessages?`Clear ${messages.length} msgs`:"No messages"}
//                   onClick={()=> hasMessages && setShowClearModal(true)}
//                   variant="danger" disabled={!hasMessages}/>
//               </div>

//               <div style={{ width:"1px", height:"20px", background:"rgba(255,255,255,0.07)", flexShrink:0 }}/>

//               {/* Close */}
//               <div className="bot-hbtn-wrap">
//                 <HeaderBtn icon={<IconX size={14}/>} tooltip="Close  (Esc)" onClick={closePanel} variant="close"/>
//               </div>
//             </div>
//           </div>

//           {/* ── MESSAGES ── */}
//           <div className="bot-scroll bot-msgs-area" style={{
//             flex:1, overflowY:"auto",
//             padding:"16px 18px 8px",
//             display:"flex", flexDirection:"column", gap:"14px",
//             position:"relative", zIndex:1,
//             WebkitOverflowScrolling:"touch",
//           }}>
//             {messages.length===0 ? (
//               <EmptyState onSend={sendMessage}/>
//             ) : (
//               <>
//                 {messages.map((msg, i)=>(
//                   <div key={i} ref={el=> msgRefs.current[i]=el}>
//                     <MessageBubble
//                       msg={msg} idx={i}
//                       speakingIdx={speakingIdx}
//                       onSpeak={speakText}
//                       onStopSpeak={stopSpeak}
//                       voiceSpeed={voiceSpeed}
//                       onSpeedChange={setVoiceSpeed}
//                     />
//                   </div>
//                 ))}
//                 {loading && (
//                   <div className="bot-msg-in" style={{ display:"flex", alignItems:"flex-end", gap:"10px" }}>
//                     <div style={{
//                       width:"32px", height:"32px", borderRadius:"10px", flexShrink:0,
//                       background:"linear-gradient(135deg,#1e1b4b 0%,#0f172a 100%)",
//                       display:"flex", alignItems:"center", justifyContent:"center",
//                       border:"1px solid rgba(109,120,250,0.35)",
//                       boxShadow:`0 4px 16px ${GLOW_A}`, marginBottom:"2px",
//                     }}>
//                       <RobotLogo size={20} animated/>
//                     </div>
//                     <div style={{
//                       padding:"13px 16px", borderRadius:"4px 16px 16px 16px",
//                       background:"linear-gradient(145deg,rgba(255,255,255,0.04),rgba(30,27,75,0.2))",
//                       border:`1px solid ${BORDER}`,
//                     }}>
//                       <TypingDots/>
//                       <div style={{ fontFamily:MONO, fontSize:"8px", color:TEXT_DIM, marginTop:"4px" }}>thinking...</div>
//                     </div>
//                   </div>
//                 )}
//               </>
//             )}
//             <div ref={messagesEndRef}/>
//           </div>

//           {/* ── INPUT ── */}
//           <div className="bot-input-area" style={{
//             padding:`12px 18px calc(env(safe-area-inset-bottom,0px) + 14px)`,
//             borderTop:`1px solid ${BORDER}`,
//             flexShrink:0, position:"relative", zIndex:2,
//             background:"linear-gradient(to top,rgba(109,120,250,0.04) 0%,transparent 100%)",
//           }}>
//             {loading && (
//               <div style={{
//                 position:"absolute", top:0, left:0, right:0, height:"2px",
//                 background:`linear-gradient(90deg,${ACCENT},${ACCENT3},${ACCENT})`,
//                 backgroundSize:"200% 100%",
//                 animation:"bot-logo-shimmer 1.5s linear infinite",
//                 borderRadius:"0 0 2px 2px",
//               }}/>
//             )}

//             <div style={{
//               display:"flex", alignItems:"flex-end", gap:"8px",
//               background: inputFoc ? "rgba(109,120,250,0.07)" : "rgba(255,255,255,0.025)",
//               border:`1px solid ${inputFoc?"rgba(109,120,250,0.5)":BORDER2}`,
//               borderRadius:"14px", padding:"10px 10px 10px 12px",
//               transition:"all 0.25s cubic-bezier(0.22,1,0.36,1)",
//               boxShadow: inputFoc ? "0 0 0 3px rgba(109,120,250,0.1),0 4px 20px rgba(109,120,250,0.08)" : "none",
//             }}>
//               <textarea
//                 ref={el=>{ inputRef.current=el; textareaRef.current=el; }}
//                 value={input} onChange={handleInput} onKeyDown={handleKey}
//                 onFocus={()=> setInputFoc(true)} onBlur={()=> setInputFoc(false)}
//                 placeholder="Ask any DSA question…"
//                 rows={1} disabled={loading}
//                 style={{
//                   flex:1, background:"none", border:"none", outline:"none",
//                   fontFamily:SANS, fontSize:"13px", color:TEXT_PRI,
//                   fontWeight:400, resize:"none", lineHeight:"1.55",
//                   maxHeight:"96px", overflow:"auto", minHeight:"22px",
//                   opacity:loading?0.45:1, transition:"opacity 0.2s",
//                   caretColor:ACCENT3, padding:0,
//                 }}
//               />

//               {charCount>0 && (
//                 <span style={{
//                   fontFamily:MONO, fontSize:"8px",
//                   color:charCount>400?"#f472b6":TEXT_DIM,
//                   alignSelf:"center", flexShrink:0, transition:"color 0.2s",
//                 }}>{charCount}</span>
//               )}

//               {/* Voice input button — NEW */}
//               <button
//                 onClick={toggleVoice}
//                 title={listening?"Stop recording (Ctrl+M)":"Voice input (Ctrl+M)"}
//                 style={{
//                   width:"34px", height:"34px", borderRadius:"10px", flexShrink:0,
//                   background: listening ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.03)",
//                   border:`1px solid ${listening?"rgba(239,68,68,0.45)":"rgba(255,255,255,0.06)"}`,
//                   color: listening ? "#fca5a5" : TEXT_DIM,
//                   cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
//                   outline:"none", alignSelf:"flex-end",
//                   animation: listening ? "bot-mic-pulse 1.2s ease-in-out infinite" : "none",
//                   transition:"all 0.18s",
//                 }}
//               >
//                 {listening ? <IconStop size={12}/> : <IconMic size={13}/>}
//               </button>

//               <button className="bot-send bot-send-btn"
//                 onClick={()=> sendMessage()}
//                 disabled={!input.trim()||loading}
//                 style={{
//                   width:"36px", height:"36px", borderRadius:"11px", flexShrink:0,
//                   background: input.trim()&&!loading
//                     ? `linear-gradient(135deg,${ACCENT} 0%,${ACCENT3} 100%)`
//                     : "rgba(255,255,255,0.04)",
//                   border:`1px solid ${input.trim()&&!loading?"rgba(109,120,250,0.55)":BORDER}`,
//                   color: input.trim()&&!loading?"#fff":TEXT_DIM,
//                   cursor:input.trim()&&!loading?"pointer":"default",
//                   display:"flex", alignItems:"center", justifyContent:"center",
//                   fontSize:"15px",
//                   boxShadow:input.trim()&&!loading?"0 4px 18px rgba(109,120,250,0.45)":"none",
//                   animation:input.trim()&&!loading?"bot-send-ready 2s ease-in-out infinite":"none",
//                   outline:"none", alignSelf:"flex-end",
//                 }}
//               >
//                 {loading ? (
//                   <span style={{
//                     width:"12px", height:"12px", borderRadius:"50%",
//                     border:`2px solid ${ACCENT2}40`, borderTopColor:ACCENT2,
//                     display:"inline-block", animation:"bot-fab-spin 0.75s linear infinite",
//                   }}/>
//                 ) : "↑"}
//               </button>
//             </div>

//             <div style={{
//               display:"flex", alignItems:"center", justifyContent:"center",
//               gap:"8px", marginTop:"7px",
//             }}>
//               <span style={{ fontFamily:MONO, fontSize:"8px", color:TEXT_DIM, opacity:0.45 }}>↵ send</span>
//               <span style={{ color:TEXT_DIM, opacity:0.2, fontSize:"8px" }}>·</span>
//               <span style={{ fontFamily:MONO, fontSize:"8px", color:TEXT_DIM, opacity:0.45 }}>shift+↵ newline</span>
//               <span style={{ color:TEXT_DIM, opacity:0.2, fontSize:"8px" }}>·</span>
//               <span style={{ fontFamily:MONO, fontSize:"8px", color:TEXT_DIM, opacity:0.3 }}>ctrl+k search</span>
//             </div>
//           </div>

//           {/* ── MODALS ── */}
//           {showLangModal && (
//             <LanguageSelector currentLang={userLanguage} onSelect={handleLanguageSelect} onClose={()=> setShowLangModal(false)}/>
//           )}
//           {showClearModal && (
//             <ClearModal
//               count={messages.length}
//               onConfirm={()=>{ setMessages([]); setShowClearModal(false); stopSpeak(); }}
//               onCancel={()=> setShowClearModal(false)}
//             />
//           )}
//           {showVoiceModal && (
//             <VoicePickerModal
//               currentVoice={selectedVoice}
//               onSelect={(v)=>{ setSelectedVoice(v); setShowVoiceModal(false); }}
//               onClose={()=> setShowVoiceModal(false)}
//               voiceSpeed={voiceSpeed}
//               onSpeedChange={setVoiceSpeed}
//             />
//           )}
//           {showSearch && (
//             <SearchOverlay
//               messages={messages}
//               onClose={()=> setShowSearch(false)}
//               onJump={(idx)=>{ setJumpToIdx(idx); }}
//             />
//           )}
//           {showShortcuts && (
//             <ShortcutsModal onClose={()=> setShowShortcuts(false)}/>
//           )}
//         </div>
//       )}
//     </>
//   );
// }


"use client";
import { useState, useEffect, useRef, useCallback } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────────────────────────────────────
const SURFACE  = "rgba(8,11,24,0.99)";
const BORDER   = "rgba(255,255,255,0.06)";
const BORDER2  = "rgba(255,255,255,0.10)";
const TEXT_PRI = "#f0f4ff";
const TEXT_SEC = "#8fa4cc";
const TEXT_DIM = "#3d526b";
const MONO     = "'Space Mono', monospace";
const SANS     = "'DM Sans', -apple-system, sans-serif";
const DISPLAY  = "'Space Mono', monospace";
const ACCENT   = "#6d78fa";
const ACCENT2  = "#818cf8";
const ACCENT3  = "#38bdf8";
const ACCENT4  = "#a5b4fc";
const GLOW_A   = "rgba(109,120,250,0.35)";
const GLOW_B   = "rgba(56,189,248,0.20)";

// ─────────────────────────────────────────────────────────────────────────────
// SUGGESTIONS
// ─────────────────────────────────────────────────────────────────────────────
const SUGGESTION_GROUPS = [
  {
    group: "Trees",
    color: "#818cf8",
    items: [
      { icon: "⑂", label: "Explain AVL rotations step-by-step",          sub: "Self-balancing · O(log n)" },
      { icon: "⊢", label: "Red-Black Tree vs AVL Tree trade-offs",        sub: "Comparison · Use-cases" },
      { icon: "⊕", label: "Segment Tree with lazy propagation",           sub: "Range queries · Updates" },
    ],
  },
  {
    group: "Sorting",
    color: "#38bdf8",
    items: [
      { icon: "⇅", label: "Quick Sort vs Merge Sort deep dive",           sub: "Complexity · Trade-offs" },
      { icon: "◈", label: "Why is Tim Sort used in practice?",            sub: "Hybrid · Real-world" },
      { icon: "∿", label: "Counting Sort and Radix Sort explained",       sub: "Linear time · Non-comparative" },
    ],
  },
  {
    group: "Graphs",
    color: "#34d399",
    items: [
      { icon: "⬡", label: "Dijkstra vs Bellman-Ford vs Floyd-Warshall",   sub: "Shortest path · Negatives" },
      { icon: "⊗", label: "Topological sort with Kahn's algorithm",       sub: "DAG · BFS approach" },
      { icon: "⊙", label: "Union-Find / Disjoint Set Union explained",    sub: "Path compression · Rank" },
    ],
  },
  {
    group: "DP",
    color: "#f472b6",
    items: [
      { icon: "∞", label: "Tabulation vs memoization in dynamic programming", sub: "Bottom-up · Top-down" },
      { icon: "⊞", label: "0/1 Knapsack problem from scratch",           sub: "Classic · Reconstruction" },
      { icon: "⋯", label: "Longest Common Subsequence visualised",        sub: "2-D DP · Trace-back" },
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
// PREMIUM VOICE CATALOG — ordered by quality
// ─────────────────────────────────────────────────────────────────────────────
const PREMIUM_VOICE_PRIORITY = [
  // Microsoft Neural (highest quality)
  "Microsoft Aria Online (Natural) - English (United States)",
  "Microsoft Jenny Online (Natural) - English (United States)",
  "Microsoft Guy Online (Natural) - English (United States)",
  "Microsoft Ana Online (Natural) - English (United States)",
  "Microsoft Emma Online (Natural) - English (United Kingdom)",
  "Microsoft Ryan Online (Natural) - English (United Kingdom)",
  "Microsoft Sonia Online (Natural) - English (United Kingdom)",
  "Microsoft Neerja Online (Natural) - English (India)",
  "Microsoft Prabhat Online (Natural) - English (India)",
  // Google Neural
  "Google US English",
  "Google UK English Female",
  "Google UK English Male",
  // macOS premium
  "Samantha (Enhanced)",
  "Alex",
  "Karen (Enhanced)",
  "Daniel (Enhanced)",
  "Moira (Enhanced)",
  "Rishi (Enhanced)",
  "Tessa (Enhanced)",
  // iOS/macOS standard
  "Samantha",
  "Karen",
  "Daniel",
  "Moira",
];

// ─────────────────────────────────────────────────────────────────────────────
// ROBOT LOGO
// ─────────────────────────────────────────────────────────────────────────────
function RobotLogo({ size = 20, animated = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={animated ? { animation: "bot-logo-float 4s ease-in-out infinite" } : {}}>
      <line x1="16" y1="2" x2="16" y2="7" stroke={ACCENT2} strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="16" cy="2" r="1.5" fill={ACCENT3}
        style={animated ? { animation: "bot-antenna-pulse 2s ease-in-out infinite" } : {}}/>
      <rect x="6" y="7" width="20" height="14" rx="4" fill="url(#botGrad)"
        stroke={ACCENT2} strokeWidth="0.8" strokeOpacity="0.5"/>
      <circle cx="11.5" cy="14" r="2.5" fill={ACCENT3}
        style={animated ? { animation: "bot-eye-blink 4s ease-in-out infinite" } : {}}/>
      <circle cx="20.5" cy="14" r="2.5" fill={ACCENT3}
        style={animated ? { animation: "bot-eye-blink 4s ease-in-out infinite 0.15s" } : {}}/>
      <circle cx="12.2" cy="13.2" r="0.8" fill="white" opacity="0.9"/>
      <circle cx="21.2" cy="13.2" r="0.8" fill="white" opacity="0.9"/>
      <path d="M12 18.5 Q16 20.5 20 18.5" stroke={ACCENT2} strokeWidth="1.2" strokeLinecap="round" fill="none"/>
      <rect x="13" y="21" width="6" height="3" rx="1.5" fill={ACCENT2} opacity="0.6"/>
      <rect x="8" y="24" width="16" height="7" rx="3" fill="url(#botGrad2)"
        stroke={ACCENT2} strokeWidth="0.8" strokeOpacity="0.4"/>
      <circle cx="13" cy="27.5" r="1.2" fill={ACCENT3} opacity="0.7"/>
      <circle cx="16" cy="27.5" r="1.2" fill={ACCENT2} opacity="0.7"/>
      <circle cx="19" cy="27.5" r="1.2" fill={ACCENT3} opacity="0.7"/>
      <defs>
        <linearGradient id="botGrad" x1="6" y1="7" x2="26" y2="21" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1e1b4b"/><stop offset="100%" stopColor="#0f172a"/>
        </linearGradient>
        <linearGradient id="botGrad2" x1="8" y1="24" x2="24" y2="31" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1e1b4b"/><stop offset="100%" stopColor="#0c0f20"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

function TypingDots() {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:"5px", padding:"6px 2px" }}>
      {[0,1,2].map(i => (
        <span key={i} style={{
          width:"7px", height:"7px", borderRadius:"50%",
          background:`radial-gradient(circle,${ACCENT3} 0%,${ACCENT} 100%)`,
          display:"inline-block",
          animation:`bot-typing-dot 1.4s cubic-bezier(0.4,0,0.6,1) ${i*0.22}s infinite`,
          boxShadow:`0 0 6px ${ACCENT3}60`,
        }}/>
      ))}
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
// NEW ICONS
function IconBookmark({ size=14 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
  </svg>;
}
function IconPin({ size=14 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>;
}
function IconTheme({ size=14 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
  </svg>;
}

// ─────────────────────────────────────────────────────────────────────────────
// HEADER BUTTON
// ─────────────────────────────────────────────────────────────────────────────
function HeaderBtn({ icon, tooltip, onClick, variant="default", disabled=false, active=false }) {
  const [hov, setHov] = useState(false);
  const [tip, setTip] = useState(false);
  const styles = {
    default: { idle:TEXT_DIM, hover:ACCENT2, bg:"transparent", hBg:"rgba(109,120,250,0.12)", b:"transparent", hB:"rgba(109,120,250,0.3)" },
    danger:  { idle:TEXT_DIM, hover:"#fca5a5", bg:"transparent", hBg:"rgba(239,68,68,0.1)", b:"transparent", hB:"rgba(239,68,68,0.3)" },
    close:   { idle:TEXT_DIM, hover:"#f0f4ff", bg:"transparent", hBg:"rgba(255,255,255,0.08)", b:"transparent", hB:"rgba(255,255,255,0.15)" },
    lang:    { idle:ACCENT4, hover:ACCENT3, bg:"rgba(109,120,250,0.08)", hBg:"rgba(56,189,248,0.12)", b:"rgba(109,120,250,0.2)", hB:"rgba(56,189,248,0.4)" },
    search:  { idle:TEXT_DIM, hover:"#34d399", bg:"transparent", hBg:"rgba(52,211,153,0.1)", b:"transparent", hB:"rgba(52,211,153,0.3)" },
    export:  { idle:TEXT_DIM, hover:ACCENT3, bg:"transparent", hBg:"rgba(56,189,248,0.1)", b:"transparent", hB:"rgba(56,189,248,0.3)" },
    keys:    { idle:TEXT_DIM, hover:ACCENT4, bg:"transparent", hBg:"rgba(165,180,252,0.1)", b:"transparent", hB:"rgba(165,180,252,0.3)" },
    bookmark:{ idle:TEXT_DIM, hover:"#f472b6", bg:"transparent", hBg:"rgba(244,114,182,0.1)", b:"transparent", hB:"rgba(244,114,182,0.3)" },
    focus:   { idle:TEXT_DIM, hover:"#fbbf24", bg:"transparent", hBg:"rgba(251,191,36,0.1)", b:"transparent", hB:"rgba(251,191,36,0.3)" },
  };
  const s = styles[variant] || styles.default;
  return (
    <div style={{ position:"relative" }}>
      <button
        onClick={onClick} disabled={disabled}
        onMouseEnter={()=>{ setHov(true); setTip(true); }}
        onMouseLeave={()=>{ setHov(false); setTip(false); }}
        style={{
          width:"34px", height:"34px", borderRadius:"10px",
          background: hov ? s.hBg : (active ? "rgba(109,120,250,0.1)" : s.bg),
          border:`1px solid ${hov ? s.hB : (active ? "rgba(109,120,250,0.25)" : s.b)}`,
          color: hov ? s.hover : (active ? ACCENT2 : s.idle),
          cursor: disabled ? "default" : "pointer",
          display:"flex", alignItems:"center", justifyContent:"center",
          outline:"none", flexShrink:0, opacity: disabled ? 0.35 : 1,
          transition:"all 0.18s cubic-bezier(0.22,1,0.36,1)",
          transform: hov && !disabled ? (variant==="close" ? "rotate(90deg)" : "translateY(-1px)") : "none",
        }}
        aria-label={tooltip}
      >
        {icon}
      </button>
      {tip && tooltip && (
        <div style={{
          position:"absolute", top:"calc(100% + 7px)", right:0,
          background:"rgba(8,11,24,0.97)", border:"1px solid rgba(255,255,255,0.1)",
          borderRadius:"7px", padding:"4px 10px",
          fontFamily:MONO, fontSize:"9px", color:TEXT_SEC,
          whiteSpace:"nowrap", pointerEvents:"none",
          boxShadow:"0 8px 24px rgba(0,0,0,0.5)",
          animation:"bot-tip-in 0.15s ease-out", zIndex:50, letterSpacing:"0.04em",
        }}>
          {tooltip}
          <div style={{ position:"absolute", bottom:"100%", right:"11px", width:0, height:0,
            borderLeft:"4px solid transparent", borderRight:"4px solid transparent",
            borderBottom:"4px solid rgba(255,255,255,0.1)" }}/>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CODE BLOCK
// ─────────────────────────────────────────────────────────────────────────────
function CodeBlock({ code }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(code).catch(()=>{});
    setCopied(true);
    setTimeout(()=> setCopied(false), 1800);
  };
  return (
    <div style={{ margin:"10px 0" }}>
      <pre style={{
        background:"rgba(0,0,0,0.52)",
        border:"1px solid rgba(109,120,250,0.22)",
        borderLeft:`3px solid ${ACCENT}`,
        borderRadius:"10px 10px 0 0",
        padding:"13px 14px",
        overflowX:"auto",
        fontFamily:MONO, fontSize:"11.5px",
        color:"#c8d8f8", lineHeight:"1.65",
        margin:0,
      }}>
        {code}
      </pre>
      <div style={{
        display:"flex", justifyContent:"flex-end",
        background:"rgba(0,0,0,0.35)",
        border:"1px solid rgba(109,120,250,0.18)",
        borderTop:"1px solid rgba(109,120,250,0.10)",
        borderRadius:"0 0 10px 10px",
        padding:"5px 8px",
      }}>
        <button onClick={copy} style={{
          display:"flex", alignItems:"center", gap:"4px",
          background: copied ? "rgba(52,211,153,0.18)" : "rgba(109,120,250,0.12)",
          border:`1px solid ${copied ? "rgba(52,211,153,0.4)" : "rgba(109,120,250,0.25)"}`,
          borderRadius:"6px", padding:"3px 10px",
          fontFamily:MONO, fontSize:"8px",
          color: copied ? "#34d399" : TEXT_DIM,
          cursor:"pointer", outline:"none", transition:"all 0.18s",
          letterSpacing:"0.04em",
        }}>
          {copied ? <><IconCheck size={10}/>&nbsp;COPIED</> : <><IconCopy size={10}/>&nbsp;COPY CODE</>}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MARKDOWN RENDERER — supports streaming (partial content)
// ─────────────────────────────────────────────────────────────────────────────
function RichText({ content }) {
  const parts = content.split(/(```[\s\S]*?```)/g);
  return (
    <div style={{ margin:0, lineHeight:"1.72", wordBreak:"break-word" }}>
      {parts.map((part, i) => {
        if (part.startsWith("```")) {
          const inner = part.replace(/^```\w*\n?/, "").replace(/```$/, "").trimEnd();
          return <CodeBlock key={i} code={inner}/>;
        }
        const lines = part.split("\n");
        return (
          <span key={i}>
            {lines.map((line, li) => {
              const isLast = li === lines.length-1;
              const bMatch = line.match(/^(\s*[-•*]\s+)(.*)/);
              const nMatch = line.match(/^(\s*\d+\.\s+)(.*)/);
              const raw = bMatch ? bMatch[2] : nMatch ? nMatch[2] : line;
              const tokens = raw.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
              const inline = tokens.map((tok, ti) => {
                if (tok.startsWith("`") && tok.endsWith("`"))
                  return <code key={ti} style={{
                    background:"rgba(109,120,250,0.18)", border:"1px solid rgba(109,120,250,0.3)",
                    borderRadius:"4px", padding:"1px 5px", fontFamily:MONO, fontSize:"10.5px", color:ACCENT3,
                  }}>{tok.slice(1,-1)}</code>;
                if (tok.startsWith("**") && tok.endsWith("**"))
                  return <strong key={ti} style={{ color:TEXT_PRI, fontWeight:700 }}>{tok.slice(2,-2)}</strong>;
                return tok;
              });
              let rendered;
              if (bMatch) {
                rendered = <div key={li} style={{ display:"flex", gap:"7px", margin:"3px 0" }}>
                  <span style={{ color:ACCENT, fontWeight:700, flexShrink:0, marginTop:"1px" }}>▸</span>
                  <span>{inline}</span></div>;
              } else if (nMatch) {
                rendered = <div key={li} style={{ display:"flex", gap:"7px", margin:"3px 0" }}>
                  <span style={{ color:ACCENT3, fontFamily:MONO, fontSize:"10px", flexShrink:0, minWidth:"14px" }}>{nMatch[1].trim()}</span>
                  <span>{inline}</span></div>;
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
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STREAMING TEXT RENDERER — typewriter effect at natural reading speed
// ─────────────────────────────────────────────────────────────────────────────
function StreamingMessage({ fullText, onDone }) {
  const [displayed, setDisplayed] = useState("");
  const idxRef = useRef(0);
  const rafRef = useRef(null);
  const lastTimeRef = useRef(0);

  useEffect(() => {
    idxRef.current = 0;
    setDisplayed("");
    lastTimeRef.current = 0;

    const CHARS_PER_FRAME = 4; // ~240 chars/sec at 60fps — feels natural, not slow
    const MIN_INTERVAL = 16;   // 60fps cap

    const tick = (timestamp) => {
      if (timestamp - lastTimeRef.current >= MIN_INTERVAL) {
        lastTimeRef.current = timestamp;
        const next = Math.min(idxRef.current + CHARS_PER_FRAME, fullText.length);
        idxRef.current = next;
        setDisplayed(fullText.slice(0, next));
        if (next >= fullText.length) {
          onDone?.();
          return;
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [fullText]);

  return <RichText content={displayed}/>;
}

// ─────────────────────────────────────────────────────────────────────────────
// VOICE PICKER MODAL — fixed: premium voices listed, speed works instantly
// ─────────────────────────────────────────────────────────────────────────────
function VoicePickerModal({ currentVoice, onSelect, onClose, voiceSpeed, onSpeedChange, onTestVoice }) {
  const [availableVoices, setAvailableVoices] = useState([]);
  const [testingIdx, setTestingIdx] = useState(null);

  useEffect(() => {
    const load = () => {
      const all = window.speechSynthesis?.getVoices() || [];
      const enVoices = all.filter(v => v.lang.startsWith("en"));

      // Sort: premium first, then by quality signals
      const isPremium = (v) =>
        v.name.toLowerCase().includes("natural") ||
        v.name.toLowerCase().includes("neural") ||
        v.name.toLowerCase().includes("online") ||
        v.name.toLowerCase().includes("enhanced");

      const isGoogle = (v) => v.name.toLowerCase().includes("google");
      const isMicrosoft = (v) => v.name.toLowerCase().includes("microsoft");

      const sorted = [
        ...enVoices.filter(v => isPremium(v)),
        ...enVoices.filter(v => !isPremium(v) && (isGoogle(v) || isMicrosoft(v))),
        ...enVoices.filter(v => !isPremium(v) && !isGoogle(v) && !isMicrosoft(v)),
      ].slice(0, 16);

      setAvailableVoices(sorted.length ? sorted : enVoices.slice(0, 16));
    };
    load();
    window.speechSynthesis?.addEventListener("voiceschanged", load);
    return () => window.speechSynthesis?.removeEventListener("voiceschanged", load);
  }, []);

  const testVoice = (v, idx) => {
    setTestingIdx(idx);
    window.speechSynthesis?.cancel();
    const utt = new SpeechSynthesisUtterance("Hello! I am ready to explain algorithms.");
    utt.voice = v;
    utt.rate = voiceSpeed;
    utt.onend = () => setTestingIdx(null);
    utt.onerror = () => setTestingIdx(null);
    window.speechSynthesis?.speak(utt);
  };

  const getVoiceQuality = (v) => {
    if (v.name.toLowerCase().includes("natural") || v.name.toLowerCase().includes("neural")) return "NEURAL";
    if (v.name.toLowerCase().includes("enhanced")) return "ENHANCED";
    if (v.name.toLowerCase().includes("online")) return "ONLINE";
    if (v.name.toLowerCase().includes("google")) return "GOOGLE";
    return null;
  };

  return (
    <div style={{
      position:"absolute", inset:0, zIndex:12,
      background:"rgba(3,7,18,0.88)", backdropFilter:"blur(14px)",
      display:"flex", alignItems:"center", justifyContent:"center",
      animation:"bot-modal-in 0.22s cubic-bezier(0.22,1,0.36,1)",
    }} onClick={e=> e.target===e.currentTarget && onClose()}>
      <div style={{
        background:"linear-gradient(145deg,rgba(14,17,35,0.98) 0%,rgba(8,11,24,0.99) 100%)",
        border:"1px solid rgba(56,189,248,0.25)", borderRadius:"20px",
        padding:"26px 22px", width:"min(440px,calc(100vw - 28px))",
        boxShadow:"0 32px 80px rgba(0,0,0,0.7),inset 0 1px 0 rgba(255,255,255,0.07)",
        position:"relative", maxHeight:"85vh", overflowY:"auto",
      }}>
        <button onClick={onClose} style={{
          position:"absolute", top:"14px", right:"14px",
          width:"28px", height:"28px", borderRadius:"8px",
          background:"rgba(255,255,255,0.04)", border:`1px solid ${BORDER}`,
          color:TEXT_DIM, cursor:"pointer", display:"flex",
          alignItems:"center", justifyContent:"center", outline:"none",
        }}><IconX size={12}/></button>

        <div style={{ textAlign:"center", marginBottom:"20px" }}>
          <div style={{ fontFamily:DISPLAY, fontSize:"15px", color:TEXT_PRI, fontWeight:700, letterSpacing:"0.04em", marginBottom:"5px" }}>
            Voice & Speed
          </div>
          <div style={{ fontFamily:SANS, fontSize:"11.5px", color:TEXT_DIM }}>
            Choose a premium voice · click to preview
          </div>
        </div>

        {/* Speed */}
        <div style={{
          marginBottom:"18px", padding:"12px 14px", borderRadius:"10px",
          background:"rgba(56,189,248,0.06)", border:"1px solid rgba(56,189,248,0.15)",
        }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"8px" }}>
            <span style={{ fontFamily:MONO, fontSize:"9px", color:ACCENT3, letterSpacing:"0.08em" }}>READING SPEED</span>
            <span style={{ fontFamily:MONO, fontSize:"9px", color:TEXT_PRI, fontWeight:700 }}>
              {SPEED_OPTIONS.find(s=>s.rate===voiceSpeed)?.label ?? `${voiceSpeed}×`}
            </span>
          </div>
          <div style={{ display:"flex", gap:"6px" }}>
            {SPEED_OPTIONS.map(opt => (
              <button key={opt.rate} onClick={()=> onSpeedChange(opt.rate)} style={{
                flex:1, padding:"6px 4px", borderRadius:"7px",
                background: voiceSpeed===opt.rate ? "rgba(56,189,248,0.2)" : "rgba(255,255,255,0.03)",
                border:`1px solid ${voiceSpeed===opt.rate ? "rgba(56,189,248,0.5)" : "rgba(255,255,255,0.06)"}`,
                fontFamily:MONO, fontSize:"8.5px",
                color: voiceSpeed===opt.rate ? ACCENT3 : TEXT_DIM,
                cursor:"pointer", outline:"none", transition:"all 0.15s",
              }}>{opt.label}</button>
            ))}
          </div>
        </div>

        <div style={{ fontFamily:MONO, fontSize:"9px", color:TEXT_DIM, letterSpacing:"0.08em", marginBottom:"10px" }}>
          AVAILABLE VOICES ({availableVoices.length} found)
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
          {availableVoices.length === 0 && (
            <div style={{ fontFamily:SANS, fontSize:"12px", color:TEXT_DIM, padding:"12px", textAlign:"center" }}>
              No voices found — your browser may not support speech synthesis.
            </div>
          )}
          {availableVoices.map((v, i) => {
            const quality = getVoiceQuality(v);
            const isSel = currentVoice?.name === v.name;
            const isTesting = testingIdx === i;
            const qualityColors = {
              NEURAL: "#34d399", ENHANCED: ACCENT3, ONLINE: ACCENT4, GOOGLE: "#f472b6"
            };
            return (
              <div key={i} style={{
                display:"flex", alignItems:"center", gap:"8px",
                padding:"10px 12px", borderRadius:"10px",
                background: isSel ? "rgba(56,189,248,0.12)" : "rgba(255,255,255,0.02)",
                border:`1px solid ${isSel ? "rgba(56,189,248,0.4)" : "rgba(255,255,255,0.05)"}`,
                transition:"all 0.15s",
              }}>
                <button onClick={()=> onSelect(v)} style={{
                  display:"flex", alignItems:"center", gap:"10px",
                  flex:1, background:"none", border:"none",
                  cursor:"pointer", outline:"none", textAlign:"left",
                }}>
                  <div style={{
                    width:"28px", height:"28px", borderRadius:"8px", flexShrink:0,
                    background: isSel ? "rgba(56,189,248,0.2)" : "rgba(255,255,255,0.04)",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    color: isSel ? ACCENT3 : TEXT_DIM,
                  }}><IconVolume size={13}/></div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontFamily:SANS, fontSize:"12px", color:isSel?TEXT_PRI:TEXT_SEC, fontWeight:600,
                      overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {v.name}
                    </div>
                    <div style={{ display:"flex", gap:"5px", alignItems:"center", marginTop:"2px", flexWrap:"wrap" }}>
                      <span style={{ fontFamily:MONO, fontSize:"8px", color:TEXT_DIM }}>{v.lang}</span>
                      {quality && (
                        <span style={{
                          fontFamily:MONO, fontSize:"7px", color:qualityColors[quality],
                          background:`${qualityColors[quality]}18`, border:`1px solid ${qualityColors[quality]}35`,
                          borderRadius:"4px", padding:"1px 5px", letterSpacing:"0.06em",
                        }}>{quality}</span>
                      )}
                    </div>
                  </div>
                  {isSel && <div style={{ width:"7px", height:"7px", borderRadius:"50%", background:ACCENT3, flexShrink:0 }}/>}
                </button>
                {/* Preview button */}
                <button onClick={()=> testVoice(v, i)} style={{
                  width:"28px", height:"28px", borderRadius:"7px", flexShrink:0,
                  background: isTesting ? "rgba(52,211,153,0.15)" : "rgba(255,255,255,0.04)",
                  border:`1px solid ${isTesting ? "rgba(52,211,153,0.4)" : "rgba(255,255,255,0.06)"}`,
                  color: isTesting ? "#34d399" : TEXT_DIM,
                  cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
                  outline:"none", transition:"all 0.15s",
                }} title="Preview voice">
                  {isTesting ? <IconStop size={10}/> : <IconVolume size={11}/>}
                </button>
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
      background:"rgba(3,7,18,0.9)", backdropFilter:"blur(14px)",
      display:"flex", alignItems:"flex-start", justifyContent:"flex-end",
      animation:"bot-modal-in 0.22s cubic-bezier(0.22,1,0.36,1)",
    }} onClick={e=> e.target===e.currentTarget && onClose()}>
      <div style={{
        background:"linear-gradient(145deg,rgba(14,17,35,0.99) 0%,rgba(8,11,24,0.99) 100%)",
        border:"1px solid rgba(244,114,182,0.2)", borderRadius:"0 0 0 20px",
        padding:"20px 18px", width:"min(360px,100vw)",
        boxShadow:"-24px 0 60px rgba(0,0,0,0.6)",
        height:"100%", overflowY:"auto",
      }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"18px" }}>
          <div>
            <div style={{ fontFamily:DISPLAY, fontSize:"13px", color:TEXT_PRI, fontWeight:700, letterSpacing:"0.04em" }}>
              Bookmarks
            </div>
            <div style={{ fontFamily:MONO, fontSize:"9px", color:TEXT_DIM, marginTop:"3px" }}>
              {bookmarks.length} saved
            </div>
          </div>
          <button onClick={onClose} style={{
            width:"28px", height:"28px", borderRadius:"8px",
            background:"rgba(255,255,255,0.04)", border:`1px solid ${BORDER}`,
            color:TEXT_DIM, cursor:"pointer", display:"flex",
            alignItems:"center", justifyContent:"center", outline:"none",
          }}><IconX size={12}/></button>
        </div>
        {bookmarks.length === 0 && (
          <div style={{ textAlign:"center", padding:"40px 0" }}>
            <div style={{ fontSize:"28px", marginBottom:"10px" }}>🔖</div>
            <div style={{ fontFamily:SANS, fontSize:"12px", color:TEXT_DIM }}>No bookmarks yet</div>
            <div style={{ fontFamily:MONO, fontSize:"9px", color:TEXT_DIM, marginTop:"6px", opacity:0.5 }}>
              Click the bookmark icon on any AI message
            </div>
          </div>
        )}
        <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
          {bookmarks.map((idx) => {
            const msg = messages[idx];
            if (!msg) return null;
            return (
              <div key={idx} style={{
                padding:"12px 14px", borderRadius:"12px",
                background:"rgba(244,114,182,0.06)", border:"1px solid rgba(244,114,182,0.15)",
              }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"6px" }}>
                  <span style={{ fontFamily:MONO, fontSize:"8px", color:"#f472b6", letterSpacing:"0.06em" }}>
                    MSG #{idx+1} · {msg.time}
                  </span>
                  <div style={{ display:"flex", gap:"4px" }}>
                    <button onClick={()=>{ onJump(idx); onClose(); }} style={{
                      fontFamily:MONO, fontSize:"8px", color:ACCENT3,
                      background:"rgba(56,189,248,0.1)", border:"1px solid rgba(56,189,248,0.25)",
                      borderRadius:"5px", padding:"2px 7px", cursor:"pointer", outline:"none",
                    }}>JUMP</button>
                    <button onClick={()=> onRemove(idx)} style={{
                      fontFamily:MONO, fontSize:"8px", color:"#fca5a5",
                      background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)",
                      borderRadius:"5px", padding:"2px 7px", cursor:"pointer", outline:"none",
                    }}>✕</button>
                  </div>
                </div>
                <div style={{ fontFamily:SANS, fontSize:"11.5px", color:TEXT_SEC, lineHeight:"1.5",
                  overflow:"hidden", display:"-webkit-box", WebkitLineClamp:3, WebkitBoxOrient:"vertical" }}>
                  {msg.content.slice(0, 140)}{msg.content.length > 140 ? "…" : ""}
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
// FOCUS MODE — minimal distraction-free view
// ─────────────────────────────────────────────────────────────────────────────
function FocusModeBanner({ onExit }) {
  return (
    <div style={{
      padding:"6px 18px",
      background:"rgba(251,191,36,0.06)", borderBottom:"1px solid rgba(251,191,36,0.15)",
      display:"flex", alignItems:"center", justifyContent:"space-between",
      flexShrink:0, zIndex:2, position:"relative",
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
        <span style={{ width:"6px", height:"6px", borderRadius:"50%", background:"#fbbf24",
          boxShadow:"0 0 6px #fbbf24", display:"inline-block" }}/>
        <span style={{ fontFamily:MONO, fontSize:"9px", color:"#fbbf24", letterSpacing:"0.08em" }}>
          FOCUS MODE — NOTIFICATIONS MUTED
        </span>
      </div>
      <button onClick={onExit} style={{
        fontFamily:MONO, fontSize:"8px", color:TEXT_DIM,
        background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)",
        borderRadius:"5px", padding:"3px 9px", cursor:"pointer", outline:"none",
      }}>EXIT FOCUS</button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SEARCH OVERLAY
// ─────────────────────────────────────────────────────────────────────────────
function SearchOverlay({ messages, onClose, onJump }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);
  useEffect(() => { setTimeout(()=> inputRef.current?.focus(), 100); }, []);

  const results = query.trim().length < 2 ? [] : messages
    .map((m, i) => ({ ...m, idx: i }))
    .filter(m => m.content.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 8);

  return (
    <div style={{
      position:"absolute", inset:0, zIndex:15,
      background:"rgba(3,7,18,0.92)", backdropFilter:"blur(16px)",
      display:"flex", flexDirection:"column", alignItems:"center",
      padding:"60px 20px 20px",
      animation:"bot-modal-in 0.2s cubic-bezier(0.22,1,0.36,1)",
    }} onClick={e=> e.target===e.currentTarget && onClose()}>
      <div style={{ width:"100%", maxWidth:"540px" }}>
        <div style={{
          display:"flex", alignItems:"center", gap:"10px",
          background:"rgba(255,255,255,0.04)",
          border:"1px solid rgba(109,120,250,0.45)",
          borderRadius:"14px", padding:"10px 14px",
          boxShadow:"0 0 0 4px rgba(109,120,250,0.08)",
          marginBottom:"14px",
        }}>
          <span style={{ color:TEXT_DIM, flexShrink:0 }}><IconSearch size={15}/></span>
          <input
            ref={inputRef}
            value={query}
            onChange={e=> setQuery(e.target.value)}
            placeholder="Search messages…"
            style={{
              flex:1, background:"none", border:"none", outline:"none",
              fontFamily:SANS, fontSize:"14px", color:TEXT_PRI, caretColor:ACCENT3,
            }}
          />
          {query && (
            <button onClick={()=> setQuery("")} style={{
              background:"none", border:"none", color:TEXT_DIM,
              cursor:"pointer", outline:"none", display:"flex", alignItems:"center",
            }}><IconX size={12}/></button>
          )}
          <button onClick={onClose} style={{
            background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)",
            borderRadius:"6px", padding:"3px 8px",
            fontFamily:MONO, fontSize:"9px", color:TEXT_DIM,
            cursor:"pointer", outline:"none", letterSpacing:"0.04em",
          }}>ESC</button>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
          {query.trim().length >= 2 && results.length === 0 && (
            <div style={{ textAlign:"center", fontFamily:SANS, fontSize:"13px", color:TEXT_DIM, padding:"24px 0" }}>
              No messages found for "{query}"
            </div>
          )}
          {results.map((m) => (
            <button key={m.idx} onClick={()=>{ onJump(m.idx); onClose(); }} style={{
              display:"flex", alignItems:"flex-start", gap:"10px",
              padding:"12px 14px", borderRadius:"12px",
              background:"rgba(255,255,255,0.025)",
              border:"1px solid rgba(255,255,255,0.06)",
              cursor:"pointer", outline:"none", textAlign:"left", transition:"all 0.15s",
            }}
              onMouseEnter={e=>{ e.currentTarget.style.background="rgba(109,120,250,0.1)"; e.currentTarget.style.borderColor="rgba(109,120,250,0.3)"; }}
              onMouseLeave={e=>{ e.currentTarget.style.background="rgba(255,255,255,0.025)"; e.currentTarget.style.borderColor="rgba(255,255,255,0.06)"; }}
            >
              <div style={{
                width:"24px", height:"24px", borderRadius:"6px", flexShrink:0,
                background: m.role==="user" ? "rgba(109,120,250,0.2)" : "rgba(56,189,248,0.15)",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontFamily:MONO, fontSize:"8px",
                color: m.role==="user" ? ACCENT2 : ACCENT3,
                fontWeight:700, marginTop:"1px",
              }}>{m.role==="user"?"U":"AI"}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontFamily:SANS, fontSize:"12px", color:TEXT_SEC, lineHeight:"1.5",
                  overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>
                  {m.content.slice(0, 120)}{m.content.length>120?"…":""}
                </div>
                <div style={{ fontFamily:MONO, fontSize:"8px", color:TEXT_DIM, marginTop:"4px" }}>
                  {m.time} · msg #{m.idx+1}
                </div>
              </div>
            </button>
          ))}
        </div>
        {query.trim().length < 2 && (
          <div style={{ textAlign:"center", fontFamily:MONO, fontSize:"9px", color:TEXT_DIM, marginTop:"20px", letterSpacing:"0.06em" }}>
            TYPE TO SEARCH YOUR CONVERSATION
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// KEYBOARD SHORTCUTS MODAL
// ─────────────────────────────────────────────────────────────────────────────
function ShortcutsModal({ onClose }) {
  const shortcuts = [
    { keys:["Enter"],              desc:"Send message" },
    { keys:["Shift","Enter"],      desc:"New line in message" },
    { keys:["Esc"],                desc:"Close chat / dismiss modal" },
    { keys:["Ctrl","K"],           desc:"Search conversation" },
    { keys:["Ctrl","Shift","E"],   desc:"Export conversation" },
    { keys:["Ctrl","Shift","C"],   desc:"Clear conversation" },
    { keys:["Ctrl","Shift","L"],   desc:"Change language" },
    { keys:["Ctrl","M"],           desc:"Toggle voice input" },
    { keys:["Ctrl","Shift","B"],   desc:"Show bookmarks" },
    { keys:["Ctrl","Shift","F"],   desc:"Toggle focus mode" },
  ];
  return (
    <div style={{
      position:"absolute", inset:0, zIndex:14,
      background:"rgba(3,7,18,0.88)", backdropFilter:"blur(14px)",
      display:"flex", alignItems:"center", justifyContent:"center",
      animation:"bot-modal-in 0.22s cubic-bezier(0.22,1,0.36,1)",
    }} onClick={e=> e.target===e.currentTarget && onClose()}>
      <div style={{
        background:"linear-gradient(145deg,rgba(14,17,35,0.98) 0%,rgba(8,11,24,0.99) 100%)",
        border:"1px solid rgba(165,180,252,0.2)", borderRadius:"20px",
        padding:"26px 24px", width:"min(420px,calc(100vw - 28px))",
        boxShadow:"0 32px 80px rgba(0,0,0,0.7),inset 0 1px 0 rgba(255,255,255,0.07)",
        position:"relative",
      }}>
        <button onClick={onClose} style={{
          position:"absolute", top:"14px", right:"14px",
          width:"28px", height:"28px", borderRadius:"8px",
          background:"rgba(255,255,255,0.04)", border:`1px solid ${BORDER}`,
          color:TEXT_DIM, cursor:"pointer", display:"flex",
          alignItems:"center", justifyContent:"center", outline:"none",
        }}><IconX size={12}/></button>
        <div style={{ marginBottom:"20px" }}>
          <div style={{ fontFamily:DISPLAY, fontSize:"15px", color:TEXT_PRI, fontWeight:700, letterSpacing:"0.04em", marginBottom:"5px" }}>
            Keyboard Shortcuts
          </div>
          <div style={{ fontFamily:SANS, fontSize:"11.5px", color:TEXT_DIM }}>Move faster without lifting your hands</div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:"4px" }}>
          {shortcuts.map((s, i) => (
            <div key={i} style={{
              display:"flex", alignItems:"center", justifyContent:"space-between",
              padding:"9px 12px", borderRadius:"8px",
              background: i%2===0 ? "rgba(255,255,255,0.02)" : "transparent",
            }}>
              <span style={{ fontFamily:SANS, fontSize:"12.5px", color:TEXT_SEC }}>{s.desc}</span>
              <div style={{ display:"flex", gap:"4px", flexShrink:0 }}>
                {s.keys.map((k, ki) => (
                  <span key={ki} style={{
                    fontFamily:MONO, fontSize:"9px", color:ACCENT4,
                    background:"rgba(165,180,252,0.1)", border:"1px solid rgba(165,180,252,0.25)",
                    borderRadius:"5px", padding:"2px 6px", letterSpacing:"0.04em",
                  }}>{k}</span>
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
// EXPORT CONVERSATION
// ─────────────────────────────────────────────────────────────────────────────
function exportConversation(messages) {
  const lines = ["# VisuoSlayer AI — Conversation Export", `Exported: ${new Date().toLocaleString()}`, "", "---", ""];
  messages.forEach((m) => {
    lines.push(`## [${m.time}] ${m.role === "user" ? "You" : "VisuoSlayer AI"}`);
    lines.push(""); lines.push(m.content); lines.push(""); lines.push("---"); lines.push("");
  });
  const blob = new Blob([lines.join("\n")], { type:"text/markdown" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = `vsai-conversation-${Date.now()}.md`;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}

// ─────────────────────────────────────────────────────────────────────────────
// VOICE INPUT (STT)
// ─────────────────────────────────────────────────────────────────────────────
function useVoiceInput(onTranscript) {
  const [listening, setListening] = useState(false);
  const recogRef = useRef(null);
  const toggle = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("Speech recognition not supported in this browser."); return; }
    if (listening) { recogRef.current?.stop(); setListening(false); return; }
    const r = new SR();
    recogRef.current = r;
    r.continuous = false; r.interimResults = false; r.lang = "en-US";
    r.onstart  = () => setListening(true);
    r.onend    = () => setListening(false);
    r.onerror  = () => setListening(false);
    r.onresult = (e) => {
      const t = Array.from(e.results).map(r=>r[0].transcript).join(" ").trim();
      if (t) onTranscript(t);
    };
    r.start();
  }, [listening, onTranscript]);
  return { listening, toggle };
}

// ─────────────────────────────────────────────────────────────────────────────
// VOICE ENGINE — centralized, fixes speed-change bug
// ─────────────────────────────────────────────────────────────────────────────
function useVoiceEngine(voiceSpeedRef, selectedVoiceRef) {
  const [speakingIdx, setSpeakingIdx] = useState(null);
  const uttRef = useRef(null);

  // FIX: speakText now always reads speed/voice from refs (live values), not stale closure
  const speakText = useCallback((text, idx, overrideRate) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    setSpeakingIdx(idx);
    const clean = text.replace(/```[\s\S]*?```/g,"").replace(/\*\*/g,"").replace(/`/g,"").trim();
    const utt = new SpeechSynthesisUtterance(clean);
    utt.lang = "en-US";
    utt.rate = overrideRate ?? voiceSpeedRef.current;
    if (selectedVoiceRef.current) utt.voice = selectedVoiceRef.current;
    utt.onend  = () => setSpeakingIdx(null);
    utt.onerror = () => setSpeakingIdx(null);
    uttRef.current = utt;
    window.speechSynthesis.speak(utt);
  }, []);

  const stopSpeak = useCallback(() => {
    window.speechSynthesis?.cancel();
    setSpeakingIdx(null);
  }, []);

  // FIX: change speed while speaking — cancel and restart immediately
  const changeSpeedWhileSpeaking = useCallback((newRate, text, idx) => {
    if (speakingIdx === idx) {
      window.speechSynthesis.cancel();
      setTimeout(() => speakText(text, idx, newRate), 80);
    }
  }, [speakingIdx, speakText]);

  return { speakingIdx, speakText, stopSpeak, changeSpeedWhileSpeaking };
}

// ─────────────────────────────────────────────────────────────────────────────
// MESSAGE BUBBLE
// ─────────────────────────────────────────────────────────────────────────────
function MessageBubble({ msg, idx, speakingIdx, onSpeak, onStopSpeak, voiceSpeed, onSpeedChange, isBookmarked, onBookmark, isStreaming }) {
  const isUser = msg.role === "user";
  const isSpeaking = speakingIdx === idx;
  const [copiedMsg, setCopiedMsg] = useState(false);
  const [showSpeeds, setShowSpeeds] = useState(false);
  const speedRef = useRef(null);
  const [streamDone, setStreamDone] = useState(!isStreaming);

  useEffect(() => {
    if (!showSpeeds) return;
    const fn = (e) => { if (speedRef.current && !speedRef.current.contains(e.target)) setShowSpeeds(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [showSpeeds]);

  // When streaming finishes
  useEffect(() => {
    if (!isStreaming) setStreamDone(true);
  }, [isStreaming]);

  const copyMsg = () => {
    navigator.clipboard?.writeText(msg.content).catch(()=>{});
    setCopiedMsg(true);
    setTimeout(()=> setCopiedMsg(false), 1800);
  };

  const handleSpeedChange = (rate) => {
    onSpeedChange(rate, msg.content, idx);
    setShowSpeeds(false);
  };

  return (
    <div className="bot-msg-in" style={{
      display:"flex",
      flexDirection: isUser ? "row-reverse" : "row",
      alignItems:"flex-start", gap:"10px",
      animationDelay:`${Math.min(idx*0.04, 0.3)}s`,
    }}>
      {!isUser && (
        <div style={{
          width:"32px", height:"32px", borderRadius:"10px", flexShrink:0,
          background:"linear-gradient(135deg,#1e1b4b 0%,#0f172a 100%)",
          display:"flex", alignItems:"center", justifyContent:"center",
          border:"1px solid rgba(109,120,250,0.35)",
          boxShadow:`0 4px 16px ${GLOW_A},inset 0 1px 0 rgba(255,255,255,0.1)`,
          marginTop:"2px",
        }}>
          <RobotLogo size={20}/>
        </div>
      )}

      <div className="bot-bubble" style={{
        maxWidth:"min(90%, 700px)", width:"fit-content",
        padding: isUser ? "11px 16px" : "14px 17px",
        borderRadius: isUser ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
        background: isUser
          ? "linear-gradient(135deg,rgba(109,120,250,0.22) 0%,rgba(56,189,248,0.12) 100%)"
          : "linear-gradient(145deg,rgba(255,255,255,0.035) 0%,rgba(30,27,75,0.2) 100%)",
        border:`1px solid ${isUser ? "rgba(109,120,250,0.35)" : "rgba(255,255,255,0.06)"}`,
        boxShadow: isUser
          ? "0 4px 20px rgba(109,120,250,0.2),inset 0 1px 0 rgba(255,255,255,0.08)"
          : "0 2px 12px rgba(0,0,0,0.4),inset 0 1px 0 rgba(255,255,255,0.03)",
        position:"relative", overflow:"hidden",
      }}>
        {!isUser && <div style={{
          position:"absolute", top:0, left:"12px", right:"12px", height:"1px",
          background:`linear-gradient(90deg,transparent,${ACCENT}50,transparent)`,
        }}/>}

        {!isUser && (
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"9px", gap:"8px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
              <span style={{ fontFamily:MONO, fontSize:"9px", fontWeight:700, color:ACCENT2, letterSpacing:"0.12em" }}>
                VISUOSLAYER AI
              </span>
              <div style={{ width:"4px", height:"4px", borderRadius:"50%", background:"#34d399", boxShadow:"0 0 5px #34d399" }}/>
              {isStreaming && !streamDone && (
                <span style={{ fontFamily:MONO, fontSize:"8px", color:ACCENT3, animation:"bot-antenna-pulse 1s infinite", letterSpacing:"0.06em" }}>
                  GENERATING...
                </span>
              )}
            </div>

            <div ref={speedRef} style={{ display:"flex", alignItems:"center", gap:"4px", position:"relative" }}>
              {/* Bookmark */}
              <button onClick={()=> onBookmark(idx)} style={{
                display:"flex", alignItems:"center",
                background: isBookmarked ? "rgba(244,114,182,0.15)" : "none",
                border:`1px solid ${isBookmarked ? "rgba(244,114,182,0.3)" : "transparent"}`,
                borderRadius:"5px", padding:"3px 5px",
                color: isBookmarked ? "#f472b6" : TEXT_DIM,
                cursor:"pointer", outline:"none", transition:"all 0.18s",
              }}
                onMouseEnter={e=>{ if(!isBookmarked){ e.currentTarget.style.color="#f472b6"; e.currentTarget.style.background="rgba(244,114,182,0.08)"; }}}
                onMouseLeave={e=>{ if(!isBookmarked){ e.currentTarget.style.color=TEXT_DIM; e.currentTarget.style.background="none"; }}}
                title={isBookmarked?"Remove bookmark":"Bookmark this response"}
              >
                <IconBookmark size={11}/>
              </button>

              <button onClick={copyMsg} style={{
                display:"flex", alignItems:"center", gap:"3px",
                background: copiedMsg ? "rgba(52,211,153,0.15)" : "none",
                border:`1px solid ${copiedMsg ? "rgba(52,211,153,0.3)" : "transparent"}`,
                borderRadius:"5px", padding:"3px 7px",
                fontFamily:MONO, fontSize:"8px",
                color: copiedMsg ? "#34d399" : TEXT_DIM,
                cursor:"pointer", outline:"none", transition:"all 0.18s", letterSpacing:"0.04em",
              }}
                onMouseEnter={e=>{ if(!copiedMsg){ e.currentTarget.style.color=TEXT_SEC; e.currentTarget.style.background="rgba(255,255,255,0.05)"; }}}
                onMouseLeave={e=>{ if(!copiedMsg){ e.currentTarget.style.color=TEXT_DIM; e.currentTarget.style.background="none"; }}}
              >
                {copiedMsg ? <><IconCheck size={10}/>&nbsp;COPIED</> : <><IconCopy size={10}/>&nbsp;COPY</>}
              </button>

              {isSpeaking && (
                <button onClick={()=> setShowSpeeds(v=>!v)} style={{
                  background:"rgba(56,189,248,0.1)", border:"1px solid rgba(56,189,248,0.3)",
                  borderRadius:"5px", padding:"2px 7px",
                  fontFamily:MONO, fontSize:"8px", color:ACCENT3,
                  cursor:"pointer", outline:"none", transition:"all 0.15s", letterSpacing:"0.04em",
                }}>
                  {SPEED_OPTIONS.find(s=>s.rate===voiceSpeed)?.label ?? "1×"}
                </button>
              )}

              {showSpeeds && (
                <div style={{
                  position:"absolute", top:"calc(100% + 6px)", right:0, zIndex:60,
                  background:"rgba(8,11,24,0.98)", border:"1px solid rgba(109,120,250,0.25)",
                  borderRadius:"10px", overflow:"hidden",
                  boxShadow:"0 12px 32px rgba(0,0,0,0.6)",
                  animation:"bot-tip-in 0.15s ease-out", minWidth:"80px",
                }}>
                  {SPEED_OPTIONS.map(opt => (
                    <button key={opt.rate} onClick={()=> handleSpeedChange(opt.rate)} style={{
                      display:"block", width:"100%", padding:"7px 12px",
                      background: voiceSpeed===opt.rate ? "rgba(109,120,250,0.15)" : "none",
                      border:"none", borderBottom:"1px solid rgba(255,255,255,0.04)",
                      fontFamily:MONO, fontSize:"9px",
                      color: voiceSpeed===opt.rate ? ACCENT3 : TEXT_SEC,
                      cursor:"pointer", textAlign:"left", outline:"none",
                      transition:"background 0.12s", letterSpacing:"0.04em",
                    }}
                      onMouseEnter={e=>{ if(voiceSpeed!==opt.rate) e.currentTarget.style.background="rgba(255,255,255,0.05)"; }}
                      onMouseLeave={e=>{ if(voiceSpeed!==opt.rate) e.currentTarget.style.background="none"; }}
                    >{opt.label}</button>
                  ))}
                </div>
              )}

              <button onClick={()=> isSpeaking ? onStopSpeak() : onSpeak(msg.content, idx)} style={{
                background: isSpeaking ? "rgba(56,189,248,0.15)" : "none",
                border:`1px solid ${isSpeaking ? "rgba(56,189,248,0.3)" : "transparent"}`,
                borderRadius:"5px", padding:"3px 5px",
                color: isSpeaking ? ACCENT3 : TEXT_DIM,
                display:"flex", alignItems:"center", justifyContent:"center",
                cursor:"pointer", outline:"none", transition:"all 0.18s",
              }}
                onMouseEnter={e=>{ if(!isSpeaking){ e.currentTarget.style.color=ACCENT3; e.currentTarget.style.background="rgba(56,189,248,0.07)"; }}}
                onMouseLeave={e=>{ if(!isSpeaking){ e.currentTarget.style.color=TEXT_DIM; e.currentTarget.style.background="none"; }}}
              >
                {isSpeaking ? <IconVolumeOff size={12}/> : <IconVolume size={12}/>}
              </button>
            </div>
          </div>
        )}

        <div style={{
          fontFamily:SANS, fontSize:"13.5px", lineHeight:"1.72",
          color: isUser ? TEXT_PRI : TEXT_SEC,
          position:"relative", zIndex:1, fontWeight: isUser ? 500 : 400,
        }}>
          {isUser ? msg.content :
            isStreaming && !streamDone ?
              <StreamingMessage fullText={msg.content} onDone={()=> setStreamDone(true)}/> :
              <RichText content={msg.content}/>
          }
        </div>

        <div style={{
          display:"flex", alignItems:"center",
          justifyContent: isUser ? "flex-end" : "flex-start",
          gap:"5px", marginTop:"8px",
        }}>
          <span style={{ fontFamily:MONO, fontSize:"8.5px", color:TEXT_DIM }}>{msg.time}</span>
          {isUser && <span style={{ fontSize:"9px", color:ACCENT2, opacity:0.7 }}>✓✓</span>}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LANGUAGE MODAL
// ─────────────────────────────────────────────────────────────────────────────
function LanguageSelector({ currentLang, onSelect, onClose }) {
  const langs = [
    { name:"Python",     icon:"🐍", color:"#3b82f6" },
    { name:"JavaScript", icon:"⚡", color:"#f59e0b" },
    { name:"Java",       icon:"☕", color:"#ef4444" },
    { name:"C++",        icon:"⚙️", color:"#8b5cf6" },
    { name:"Go",         icon:"🔵", color:"#06b6d4" },
    { name:"Rust",       icon:"🦀", color:"#f97316" },
  ];
  return (
    <div style={{
      position:"absolute", inset:0, zIndex:10,
      background:"rgba(3,7,18,0.88)", backdropFilter:"blur(14px)",
      display:"flex", alignItems:"center", justifyContent:"center",
      animation:"bot-modal-in 0.22s cubic-bezier(0.22,1,0.36,1)",
    }} onClick={e=> e.target===e.currentTarget && onClose()}>
      <div style={{
        background:"linear-gradient(145deg,rgba(14,17,35,0.98) 0%,rgba(8,11,24,0.99) 100%)",
        border:"1px solid rgba(109,120,250,0.25)", borderRadius:"20px",
        padding:"28px 24px", width:"min(380px,calc(100vw - 28px))",
        boxShadow:"0 32px 80px rgba(0,0,0,0.7),inset 0 1px 0 rgba(255,255,255,0.07)",
        position:"relative",
      }}>
        <button onClick={onClose} style={{
          position:"absolute", top:"14px", right:"14px",
          width:"28px", height:"28px", borderRadius:"8px",
          background:"rgba(255,255,255,0.04)", border:`1px solid ${BORDER}`,
          color:TEXT_DIM, cursor:"pointer", display:"flex",
          alignItems:"center", justifyContent:"center", outline:"none",
        }}><IconX size={12}/></button>
        <div style={{ textAlign:"center", marginBottom:"22px" }}>
          <div style={{ fontFamily:DISPLAY, fontSize:"16px", color:TEXT_PRI, fontWeight:700, letterSpacing:"0.04em", marginBottom:"6px" }}>
            Preferred Language
          </div>
          <div style={{ fontFamily:SANS, fontSize:"12px", color:TEXT_DIM, lineHeight:1.5 }}>
            Code examples will be shown in your chosen language
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" }}>
          {langs.map(lang => {
            const sel = currentLang===lang.name;
            return (
              <button key={lang.name} onClick={()=> onSelect(lang.name)} style={{
                display:"flex", alignItems:"center", gap:"10px",
                padding:"12px 14px", borderRadius:"12px",
                background: sel ? `linear-gradient(135deg,${lang.color}20 0%,${lang.color}10 100%)` : "rgba(255,255,255,0.02)",
                border:`1px solid ${sel ? `${lang.color}50` : "rgba(255,255,255,0.06)"}`,
                color: sel ? TEXT_PRI : TEXT_SEC,
                cursor:"pointer", fontFamily:SANS, fontSize:"12.5px", fontWeight:600,
                transition:"all 0.18s cubic-bezier(0.22,1,0.36,1)", outline:"none", textAlign:"left",
                boxShadow: sel ? `0 4px 16px ${lang.color}20` : "none",
              }}
                onMouseEnter={e=>{ if(!sel){ e.currentTarget.style.background=`${lang.color}12`; e.currentTarget.style.borderColor=`${lang.color}35`; e.currentTarget.style.color=TEXT_PRI; e.currentTarget.style.transform="translateY(-1px)"; }}}
                onMouseLeave={e=>{ if(!sel){ e.currentTarget.style.background="rgba(255,255,255,0.02)"; e.currentTarget.style.borderColor="rgba(255,255,255,0.06)"; e.currentTarget.style.color=TEXT_SEC; e.currentTarget.style.transform="none"; }}}
              >
                <span style={{ fontSize:"16px", flexShrink:0 }}>{lang.icon}</span>
                <div style={{ flex:1, minWidth:0 }}><div style={{ fontWeight:600, fontSize:"12.5px" }}>{lang.name}</div></div>
                {sel && <div style={{ width:"8px", height:"8px", borderRadius:"50%", background:lang.color, boxShadow:`0 0 8px ${lang.color}`, flexShrink:0 }}/>}
              </button>
            );
          })}
        </div>
        {currentLang && (
          <div style={{
            marginTop:"14px", padding:"9px 14px", borderRadius:"10px",
            background:"rgba(109,120,250,0.06)", border:"1px solid rgba(109,120,250,0.15)",
            fontFamily:MONO, fontSize:"9px", color:ACCENT4, letterSpacing:"0.06em",
            display:"flex", alignItems:"center", gap:"8px",
          }}>
            <span style={{ opacity:0.5 }}>CURRENT →</span>
            <span style={{ color:ACCENT3, fontWeight:700 }}>{currentLang}</span>
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
    <div style={{
      position:"absolute", inset:0, zIndex:11,
      background:"rgba(3,7,18,0.88)", backdropFilter:"blur(14px)",
      display:"flex", alignItems:"center", justifyContent:"center",
      animation:"bot-modal-in 0.2s cubic-bezier(0.22,1,0.36,1)",
    }} onClick={e=> e.target===e.currentTarget && onCancel()}>
      <div style={{
        background:"linear-gradient(145deg,rgba(14,17,35,0.98),rgba(8,11,24,0.99))",
        border:"1px solid rgba(239,68,68,0.2)", borderRadius:"18px",
        padding:"26px", width:"min(310px,calc(100vw - 28px))",
        boxShadow:"0 24px 60px rgba(0,0,0,0.7)", textAlign:"center",
      }}>
        <div style={{
          width:"46px", height:"46px", borderRadius:"14px", margin:"0 auto 14px",
          background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.2)",
          display:"flex", alignItems:"center", justifyContent:"center", fontSize:"20px",
        }}>🗑️</div>
        <div style={{ fontFamily:DISPLAY, fontSize:"13px", color:TEXT_PRI, marginBottom:"8px", fontWeight:700 }}>
          Clear conversation?
        </div>
        <div style={{ fontFamily:SANS, fontSize:"12px", color:TEXT_DIM, marginBottom:"20px", lineHeight:1.5 }}>
          This will remove all {count} message{count!==1?"s":""}. Cannot be undone.
        </div>
        <div style={{ display:"flex", gap:"10px" }}>
          <button onClick={onCancel} style={{
            flex:1, padding:"10px", borderRadius:"10px",
            background:"rgba(255,255,255,0.04)", border:`1px solid ${BORDER2}`,
            color:TEXT_SEC, fontFamily:SANS, fontSize:"12px", fontWeight:600,
            cursor:"pointer", outline:"none", transition:"all 0.18s",
          }}
            onMouseEnter={e=>{ e.currentTarget.style.background="rgba(255,255,255,0.08)"; e.currentTarget.style.color=TEXT_PRI; }}
            onMouseLeave={e=>{ e.currentTarget.style.background="rgba(255,255,255,0.04)"; e.currentTarget.style.color=TEXT_SEC; }}
          >Cancel</button>
          <button onClick={onConfirm} style={{
            flex:1, padding:"10px", borderRadius:"10px",
            background:"linear-gradient(135deg,rgba(239,68,68,0.2),rgba(239,68,68,0.12))",
            border:"1px solid rgba(239,68,68,0.35)",
            color:"#fca5a5", fontFamily:SANS, fontSize:"12px", fontWeight:700,
            cursor:"pointer", outline:"none", transition:"all 0.18s",
          }}
            onMouseEnter={e=>{ e.currentTarget.style.background="linear-gradient(135deg,rgba(239,68,68,0.3),rgba(239,68,68,0.2))"; }}
            onMouseLeave={e=>{ e.currentTarget.style.background="linear-gradient(135deg,rgba(239,68,68,0.2),rgba(239,68,68,0.12))"; }}
          >Clear All</button>
        </div>
      </div>
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
    <div style={{
      flex:1, display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"flex-start",
      padding:"24px 0 16px", minHeight:"100%",
    }}>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"14px", marginBottom:"28px" }}>
        <div style={{ position:"relative", animation:"bot-empty-float 7s ease-in-out infinite" }}>
          <div style={{
            width:"70px", height:"70px", borderRadius:"20px",
            background:"linear-gradient(135deg,#1e1b4b 0%,#0f172a 100%)",
            display:"flex", alignItems:"center", justifyContent:"center",
            border:"1.5px solid rgba(109,120,250,0.45)",
            boxShadow:`0 8px 32px ${GLOW_A},inset 0 1px 0 rgba(255,255,255,0.12)`,
            position:"relative", overflow:"hidden",
          }}>
            <RobotLogo size={40} animated/>
            <div style={{
              position:"absolute", left:0, right:0, height:"1.5px",
              background:`linear-gradient(90deg,transparent,${ACCENT3}80,transparent)`,
              animation:"bot-scan-line 3s ease-in-out infinite",
            }}/>
          </div>
          {[0,1].map(i=> (
            <div key={i} style={{
              position:"absolute", inset:`${-14-i*12}px`, borderRadius:`${26+i*8}px`,
              border:`1px solid rgba(109,120,250,${0.13-i*0.04})`,
              animation:`bot-ring-expand ${2.5+i}s ease-out ${i*0.8}s infinite`,
            }}/>
          ))}
        </div>
        <div style={{ textAlign:"center", maxWidth:"300px" }}>
          <div style={{
            fontFamily:DISPLAY, fontSize:"17px", fontWeight:700, letterSpacing:"0.03em",
            background:`linear-gradient(90deg,${TEXT_PRI} 0%,${ACCENT4} 100%)`,
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
            backgroundClip:"text", marginBottom:"7px",
          }}>What do you want to master?</div>
          <div style={{ fontFamily:SANS, fontSize:"12.5px", color:TEXT_DIM, lineHeight:"1.6" }}>
            Pick a topic or type your own question below
          </div>
        </div>
      </div>
      <div style={{
        display:"flex", gap:"7px", marginBottom:"16px",
        width:"100%", maxWidth:"500px",
        flexWrap:"wrap", justifyContent:"center", padding:"0 4px",
      }}>
        {SUGGESTION_GROUPS.map((g, gi) => (
          <button key={gi} onClick={()=> setActiveGroup(gi)} style={{
            padding:"6px 14px", borderRadius:"40px",
            background: activeGroup===gi ? `${g.color}1e` : "rgba(255,255,255,0.03)",
            border:`1px solid ${activeGroup===gi ? `${g.color}55` : "rgba(255,255,255,0.07)"}`,
            fontFamily:MONO, fontSize:"9px", fontWeight:700, letterSpacing:"0.08em",
            color: activeGroup===gi ? g.color : TEXT_DIM,
            cursor:"pointer", outline:"none",
            transition:"all 0.18s cubic-bezier(0.22,1,0.36,1)",
            boxShadow: activeGroup===gi ? `0 2px 10px ${g.color}20` : "none",
          }}
            onMouseEnter={e=>{ if(activeGroup!==gi){ e.currentTarget.style.color=TEXT_SEC; e.currentTarget.style.background="rgba(255,255,255,0.06)"; }}}
            onMouseLeave={e=>{ if(activeGroup!==gi){ e.currentTarget.style.color=TEXT_DIM; e.currentTarget.style.background="rgba(255,255,255,0.03)"; }}}
          >{g.group.toUpperCase()}</button>
        ))}
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:"9px", width:"100%", maxWidth:"500px", padding:"0 4px" }}>
        {group.items.map((s, i) => (
          <button key={`${activeGroup}-${i}`} className="bot-suggestion"
            onClick={()=> onSend(s.label)}
            style={{
              display:"flex", alignItems:"center", gap:"14px",
              padding:"14px 16px", borderRadius:"14px",
              background:`${group.color}08`, border:`1px solid ${group.color}22`,
              color:TEXT_SEC, fontFamily:SANS, fontSize:"13px",
              fontWeight:500, cursor:"pointer", textAlign:"left", outline:"none",
              animation:`bot-suggestion-slide 0.28s cubic-bezier(0.22,1,0.36,1) ${i*0.06}s both`,
            }}
            onMouseEnter={e=>{ e.currentTarget.style.background=`${group.color}16`; e.currentTarget.style.borderColor=`${group.color}48`; e.currentTarget.style.color=TEXT_PRI; }}
            onMouseLeave={e=>{ e.currentTarget.style.background=`${group.color}08`; e.currentTarget.style.borderColor=`${group.color}22`; e.currentTarget.style.color=TEXT_SEC; }}
          >
            <span style={{
              width:"38px", height:"38px", borderRadius:"10px", flexShrink:0,
              background:`${group.color}14`, border:`1px solid ${group.color}28`,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontFamily:MONO, fontSize:"15px", color:group.color,
            }}>{s.icon}</span>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontWeight:600, fontSize:"13px", color:"inherit", lineHeight:"1.35", marginBottom:"3px" }}>
                {s.label}
              </div>
              <div style={{ fontFamily:MONO, fontSize:"9px", color:group.color, opacity:0.6, letterSpacing:"0.04em" }}>
                {s.sub}
              </div>
            </div>
            <span style={{ color:TEXT_DIM, fontSize:"16px", flexShrink:0, marginRight:"-2px" }}>›</span>
          </button>
        ))}
      </div>
      <div style={{
        marginTop:"22px", display:"flex", alignItems:"center", gap:"12px",
        width:"100%", maxWidth:"500px", padding:"0 4px",
      }}>
        <div style={{ flex:1, height:"1px", background:"rgba(255,255,255,0.04)" }}/>
        <span style={{ fontFamily:MONO, fontSize:"8px", color:TEXT_DIM, letterSpacing:"0.09em", whiteSpace:"nowrap" }}>
          OR TYPE YOUR OWN QUESTION
        </span>
        <div style={{ flex:1, height:"1px", background:"rgba(255,255,255,0.04)" }}/>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function ChatBot() {
  const [open,            setOpen]            = useState(false);
  const [messages,        setMessages]        = useState([]);
  const [streamingIdx,    setStreamingIdx]    = useState(null); // which msg is streaming
  const [input,           setInput]           = useState("");
  const [loading,         setLoading]         = useState(false);
  const [fabHov,          setFabHov]          = useState(false);
  const [mounted,         setMounted]         = useState(false);
  const [inputFoc,        setInputFoc]        = useState(false);
  const [particles,       setParticles]       = useState([]);
  const [panelAnim,       setPanelAnim]       = useState("in");
  const [charCount,       setCharCount]       = useState(0);
  const [userLanguage,    setUserLanguage]    = useState(null);
  const [showLangModal,   setShowLangModal]   = useState(false);
  const [showClearModal,  setShowClearModal]  = useState(false);
  const [showVoiceModal,  setShowVoiceModal]  = useState(false);
  const [showSearch,      setShowSearch]      = useState(false);
  const [showShortcuts,   setShowShortcuts]   = useState(false);
  const [showBookmarks,   setShowBookmarks]   = useState(false);
  const [bookmarks,       setBookmarks]       = useState([]);
  const [focusMode,       setFocusMode]       = useState(false);
  const [voiceSpeed,      setVoiceSpeed]      = useState(1.0);
  const [selectedVoice,   setSelectedVoice]   = useState(null);
  const [jumpToIdx,       setJumpToIdx]       = useState(null);
  const [exportFlash,     setExportFlash]     = useState(false);

  // Refs for voice engine (avoid stale closures)
  const voiceSpeedRef    = useRef(1.0);
  const selectedVoiceRef = useRef(null);

  // Keep refs in sync
  useEffect(() => { voiceSpeedRef.current = voiceSpeed; }, [voiceSpeed]);
  useEffect(() => { selectedVoiceRef.current = selectedVoice; }, [selectedVoice]);

  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);
  const textareaRef    = useRef(null);
  const msgRefs        = useRef({});

  // Voice engine
  const { speakingIdx, speakText, stopSpeak, changeSpeedWhileSpeaking } = useVoiceEngine(voiceSpeedRef, selectedVoiceRef);

  // Voice input
  const { listening, toggle: toggleVoice } = useVoiceInput((transcript) => {
    setInput(prev => (prev ? prev + " " : "") + transcript);
    setCharCount(prev => prev + transcript.length + 1);
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem("vsai_lang");
      if (stored) setUserLanguage(stored);
      else setShowLangModal(true);
    } catch {}
  }, []);

  const handleLanguageSelect = (lang) => {
    setUserLanguage(lang);
    try { localStorage.setItem("vsai_lang", lang); } catch {}
    setShowLangModal(false);
  };

  useEffect(() => {
    setMounted(true);
    setParticles(Array.from({ length:12 }, (_,i) => ({
      id:i,
      top:`${5+(i*8.1)%90}%`, left:`${5+((i*37)%90)}%`,
      delay:`${i*0.35}s`, dur:`${3.5+(i%4)*0.8}s`,
      size: i%3===0?"3px":i%3===1?"2px":"1.5px",
      color: i%4===0?ACCENT:i%4===1?ACCENT3:i%4===2?"#f472b6":"#34d399",
    })));
  }, []);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages, loading]);
  useEffect(() => { if (open) setTimeout(()=> inputRef.current?.focus(), 350); }, [open]);

  useEffect(() => {
    if (jumpToIdx !== null && msgRefs.current[jumpToIdx]) {
      msgRefs.current[jumpToIdx].scrollIntoView({ behavior:"smooth", block:"center" });
      setJumpToIdx(null);
    }
  }, [jumpToIdx]);

  // Keyboard shortcuts
  useEffect(() => {
    const h = (e) => {
      if (e.key==="Escape") {
        if (showSearch) { setShowSearch(false); return; }
        if (showShortcuts) { setShowShortcuts(false); return; }
        if (showVoiceModal) { setShowVoiceModal(false); return; }
        if (showBookmarks) { setShowBookmarks(false); return; }
        if (open) closePanel();
      }
      if (!open) return;
      if ((e.ctrlKey||e.metaKey) && e.key==="k") { e.preventDefault(); setShowSearch(true); }
      if ((e.ctrlKey||e.metaKey) && e.shiftKey && e.key==="E") { e.preventDefault(); handleExport(); }
      if ((e.ctrlKey||e.metaKey) && e.shiftKey && e.key==="C") { e.preventDefault(); if(messages.length>0) setShowClearModal(true); }
      if ((e.ctrlKey||e.metaKey) && e.shiftKey && e.key==="L") { e.preventDefault(); setShowLangModal(true); }
      if ((e.ctrlKey||e.metaKey) && e.key==="m") { e.preventDefault(); toggleVoice(); }
      if ((e.ctrlKey||e.metaKey) && e.key==="/") { e.preventDefault(); setShowShortcuts(true); }
      if ((e.ctrlKey||e.metaKey) && e.shiftKey && e.key==="B") { e.preventDefault(); setShowBookmarks(v=>!v); }
      if ((e.ctrlKey||e.metaKey) && e.shiftKey && e.key==="F") { e.preventDefault(); setFocusMode(v=>!v); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, showSearch, showShortcuts, showVoiceModal, showBookmarks, messages, toggleVoice]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "22px";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 96)+"px";
    }
  }, [input]);

  const closePanel = () => { setPanelAnim("out"); setTimeout(()=>{ setOpen(false); setPanelAnim("in"); }, 260); };
  const openPanel  = () => { setOpen(true); setPanelAnim("in"); };
  const getTime    = () => new Date().toLocaleTimeString("en-US",{ hour:"2-digit", minute:"2-digit" });

  const handleExport = () => {
    if (!messages.length) return;
    exportConversation(messages);
    setExportFlash(true);
    setTimeout(()=> setExportFlash(false), 1500);
  };

  const toggleBookmark = (idx) => {
    setBookmarks(prev =>
      prev.includes(idx) ? prev.filter(b=>b!==idx) : [...prev, idx]
    );
  };

  // FIX: speed change handler — if message is currently speaking, restart with new speed
  const handleSpeedChange = useCallback((newRate, msgContent, msgIdx) => {
    setVoiceSpeed(newRate);
    voiceSpeedRef.current = newRate;
    changeSpeedWhileSpeaking(newRate, msgContent, msgIdx);
  }, [changeSpeedWhileSpeaking]);

  const sendMessage = useCallback(async (text) => {
    const userText = (text ?? input).trim();
    if (!userText || loading) return;
    setInput(""); setCharCount(0);

    const userMsg = { role:"user", content:userText, time:getTime() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const lang = userLanguage || "Python";
      const systemPrompt = `You are a concise, expert DSA (Data Structures & Algorithms) tutor.

STRICT RULES — never break these:
1. NEVER open with greetings, self-introductions, affirmations, or filler phrases such as "Great question!", "Certainly!", "Of course!", "I'd be happy to help", "As an AI language model", "Sure!", or any similar preamble.
2. NEVER mention, reference, or promote any AI product, company, or model name — including yourself.
3. BEGIN every answer IMMEDIATELY with the technical content. Zero warm-up sentences.
4. Use **bold** for key terms, \`inline code\` for variables/complexities, and fenced code blocks (\`\`\`) for algorithms.
5. Use bullet points (- ) for lists. Be precise, dense with value, and technically accurate.
6. Always include a working ${lang} code example when explaining algorithms or data structures.
7. Keep explanations structured: concept → intuition → complexity → code.`;

      const history = [...messages, userMsg].map(m=>({ role:m.role, content:m.content }));
      const res = await fetch("/api/chat", {
        method:"POST", headers:{ "Content-Type":"application/json" },
        body:JSON.stringify({ messages:[{ role:"system", content:systemPrompt }, ...history] }),
      });
      const data = await res.json();
      const reply = data.content ?? data.error ?? "Something went wrong.";

      // Add message and mark it as streaming
      const newIdx = messages.length + 1; // user + assistant
      setMessages(prev => {
        const next = [...prev, { role:"assistant", content:reply, time:getTime() }];
        setStreamingIdx(next.length - 1);
        return next;
      });
    } catch {
      setMessages(prev => [...prev, { role:"assistant", content:"Connection error. Please try again.", time:getTime() }]);
    } finally { setLoading(false); }
  }, [input, messages, loading, userLanguage]);

  // Clear streaming flag after done (via callback from StreamingMessage)
  const handleStreamDone = useCallback((idx) => {
    setStreamingIdx(prev => prev === idx ? null : prev);
  }, []);

  const handleKey   = (e) => { if (e.key==="Enter" && !e.shiftKey){ e.preventDefault(); sendMessage(); } };
  const handleInput = (e) => { setInput(e.target.value); setCharCount(e.target.value.length); };

  if (!mounted) return null;
  const hasMessages = messages.length > 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
        *, *::before, *::after { box-sizing:border-box; }

        @keyframes bot-typing-dot {
          0%,60%,100%{ transform:translateY(0) scale(0.8); opacity:0.4; }
          30%         { transform:translateY(-5px) scale(1.1); opacity:1; }
        }
        @keyframes bot-shimmer {
          0%  { background-position:-200% 0; }
          100%{ background-position:200% 0; }
        }
        @keyframes bot-panel-in {
          from{ opacity:0; transform:translateY(18px); }
          to  { opacity:1; transform:translateY(0); }
        }
        @keyframes bot-panel-out {
          from{ opacity:1; transform:translateY(0); }
          to  { opacity:0; transform:translateY(18px); }
        }
        @keyframes bot-fab-pulse {
          0%,100%{ box-shadow:0 0 0 0 rgba(109,120,250,0),0 8px 32px rgba(109,120,250,0.4); }
          50%    { box-shadow:0 0 0 10px rgba(109,120,250,0.06),0 8px 32px rgba(109,120,250,0.55); }
        }
        @keyframes bot-fab-spin { to{ transform:rotate(360deg); } }
        @keyframes bot-msg-in {
          from{ opacity:0; transform:translateY(10px) scale(0.98); }
          to  { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes bot-particle {
          0%,100%{ opacity:0.1; transform:translateY(0) scale(1); }
          50%    { opacity:0.5; transform:translateY(-10px) scale(1.4); }
        }
        @keyframes bot-orb1 {
          0%,100%{ transform:translate(0,0) scale(1); }
          33%    { transform:translate(18px,-12px) scale(1.08); }
          66%    { transform:translate(-8px,8px) scale(0.94); }
        }
        @keyframes bot-orb2 {
          0%,100%{ transform:translate(0,0) scale(1); }
          40%    { transform:translate(-15px,10px) scale(1.05); }
          80%    { transform:translate(10px,-6px) scale(0.96); }
        }
        @keyframes bot-badge-pop {
          0% { transform:scale(0) rotate(-20deg); }
          70%{ transform:scale(1.25) rotate(5deg); }
          100%{ transform:scale(1) rotate(0); }
        }
        @keyframes bot-glow-ring {
          0%,100%{ opacity:0.5; transform:scale(1); }
          50%    { opacity:1; transform:scale(1.1); }
        }
        @keyframes bot-scan-line {
          0%  { top:-1px; opacity:0; }
          10% { opacity:0.7; }
          90% { opacity:0.7; }
          100%{ top:100%; opacity:0; }
        }
        @keyframes bot-logo-shimmer {
          0%  { background-position:-200% 0; }
          100%{ background-position:200% 0; }
        }
        @keyframes bot-header-gradient {
          0%,100%{ background-position:0% 50%; }
          50%    { background-position:100% 50%; }
        }
        @keyframes bot-grid-move {
          0%  { transform:translate(0,0); }
          100%{ transform:translate(24px,24px); }
        }
        @keyframes bot-antenna-pulse {
          0%,100%{ opacity:1; }
          50%    { opacity:0.55; }
        }
        @keyframes bot-eye-blink {
          0%,92%,100%{ transform:scaleY(1); }
          95%         { transform:scaleY(0.1); }
        }
        @keyframes bot-logo-float {
          0%,100%{ transform:translateY(0); }
          50%    { transform:translateY(-2px); }
        }
        @keyframes bot-send-ready {
          0%,100%{ box-shadow:0 4px 14px rgba(109,120,250,0.4); }
          50%    { box-shadow:0 4px 22px rgba(56,189,248,0.5); }
        }
        @keyframes bot-suggestion-slide {
          from{ opacity:0; transform:translateX(-10px); }
          to  { opacity:1; transform:translateX(0); }
        }
        @keyframes bot-empty-float {
          0%,100%{ transform:translateY(0) rotate(0deg); }
          33%    { transform:translateY(-5px) rotate(1deg); }
          66%    { transform:translateY(-2px) rotate(-0.8deg); }
        }
        @keyframes bot-ring-expand {
          0%  { transform:scale(0.8); opacity:0.8; }
          100%{ transform:scale(2.2); opacity:0; }
        }
        @keyframes bot-modal-in {
          from{ opacity:0; transform:scale(0.96) translateY(8px); }
          to  { opacity:1; transform:scale(1) translateY(0); }
        }
        @keyframes bot-tip-in {
          from{ opacity:0; transform:translateY(-3px); }
          to  { opacity:1; transform:translateY(0); }
        }
        @keyframes bot-mic-pulse {
          0%,100%{ box-shadow:0 0 0 0 rgba(239,68,68,0.4); }
          50%    { box-shadow:0 0 0 8px rgba(239,68,68,0); }
        }

        .bot-msg-in { animation:bot-msg-in 0.3s cubic-bezier(0.22,1,0.36,1) both; }
        .bot-scroll { scrollbar-width:thin; scrollbar-color:rgba(109,120,250,0.2) transparent; }
        .bot-scroll::-webkit-scrollbar { width:3px; }
        .bot-scroll::-webkit-scrollbar-thumb { background:rgba(109,120,250,0.2); border-radius:10px; }
        .bot-scroll::-webkit-scrollbar-thumb:hover { background:rgba(109,120,250,0.4); }

        .bot-suggestion { -webkit-tap-highlight-color:transparent; transition:all 0.22s cubic-bezier(0.22,1,0.36,1) !important; }
        .bot-suggestion:hover  { transform:translateX(5px) translateY(-1px) !important; }
        .bot-suggestion:active { transform:scale(0.98) !important; }

        .bot-send { transition:all 0.18s cubic-bezier(0.22,1,0.36,1); -webkit-tap-highlight-color:transparent; }
        .bot-send:hover:not(:disabled)  { transform:scale(1.08) rotate(8deg); }
        .bot-send:active:not(:disabled) { transform:scale(0.92); }

        @media (max-width:520px) {
          .bot-bubble { max-width:92% !important; }
          .bot-header-inner { gap:6px !important; padding:10px 11px !important; }
          .bot-title-txt { font-size:12px !important; }
          .bot-avatar-wrap { width:32px !important; height:32px !important; border-radius:10px !important; }
          .bot-msgs-area { padding:10px 10px 6px !important; gap:11px !important; }
          .bot-input-area { padding:8px 10px calc(env(safe-area-inset-bottom,0px)+10px) !important; }
          .bot-hbtns { gap:2px !important; }
          .bot-hbtn-wrap > button { width:28px !important; height:28px !important; border-radius:8px !important; }
          .bot-send-btn { width:32px !important; height:32px !important; }
        }
      `}</style>

      {/* ── FAB ── */}
      {!open && (
        <div style={{ position:"fixed", bottom:`calc(env(safe-area-inset-bottom,0px) + 22px)`, right:"22px", zIndex:500 }}>
          <div style={{
            position:"absolute", inset:"-8px", borderRadius:"24px",
            background:`radial-gradient(circle,${GLOW_A} 0%,transparent 70%)`,
            animation:"bot-glow-ring 3.5s ease-in-out infinite", pointerEvents:"none",
          }}/>
          <button
            onClick={openPanel}
            onMouseEnter={()=> setFabHov(true)}
            onMouseLeave={()=> setFabHov(false)}
            aria-label="Open DSA assistant"
            style={{
              position:"relative", width:"56px", height:"56px", borderRadius:"16px",
              background: fabHov
                ? "linear-gradient(135deg,#5a62e8 0%,#3b82f6 100%)"
                : "linear-gradient(135deg,#4338ca 0%,#6d78fa 50%,#38bdf8 100%)",
              border:`1.5px solid ${fabHov?"rgba(56,189,248,0.6)":"rgba(109,120,250,0.6)"}`,
              cursor:"pointer",
              display:"flex", alignItems:"center", justifyContent:"center",
              boxShadow:"0 8px 36px rgba(109,120,250,0.55),0 4px 16px rgba(0,0,0,0.4)",
              transition:"all 0.25s cubic-bezier(0.22,1,0.36,1)",
              animation:!fabHov?"bot-fab-pulse 3.5s ease-in-out infinite":"none",
              backdropFilter:"blur(16px)", outline:"none",
            }}
          >
            <div style={{ transition:"transform 0.25s", transform:fabHov?"scale(1.1) rotate(-5deg)":"scale(1)" }}>
              <RobotLogo size={26} animated/>
            </div>
          </button>
          {hasMessages && (
            <div style={{
              position:"absolute", top:"-5px", right:"-5px",
              width:"14px", height:"14px", borderRadius:"50%",
              background:"linear-gradient(135deg,#f472b6,#e879f9)",
              border:"2px solid #030712",
              animation:"bot-badge-pop 0.35s cubic-bezier(0.22,1,0.36,1)",
              boxShadow:"0 0 10px rgba(248,121,249,0.7)",
            }}/>
          )}
        </div>
      )}

      {/* ── PANEL ── */}
      {open && (
        <div style={{
          position:"fixed", top:0, left:0, right:0, bottom:0,
          width:"100dvw", height:"100dvh",
          background:SURFACE, display:"flex", flexDirection:"column",
          overflow:"hidden",
          animation: panelAnim==="in"
            ? "bot-panel-in 0.32s cubic-bezier(0.22,1,0.36,1)"
            : "bot-panel-out 0.24s cubic-bezier(0.4,0,0.6,1) forwards",
          zIndex:499,
        }}>

          {/* ambient */}
          <div style={{ position:"absolute", inset:0, overflow:"hidden", pointerEvents:"none", zIndex:0 }}>
            <div style={{ position:"absolute", top:"-60px", left:"15%", width:"260px", height:"260px", borderRadius:"50%",
              background:`radial-gradient(circle,${GLOW_A} 0%,transparent 70%)`,
              filter:"blur(50px)", animation:"bot-orb1 18s ease-in-out infinite" }}/>
            <div style={{ position:"absolute", bottom:"40px", right:"-30px", width:"200px", height:"200px", borderRadius:"50%",
              background:`radial-gradient(circle,${GLOW_B} 0%,transparent 70%)`,
              filter:"blur(40px)", animation:"bot-orb2 22s ease-in-out infinite" }}/>
            <div style={{ position:"absolute", bottom:"-20px", left:"10%", width:"150px", height:"150px", borderRadius:"50%",
              background:"radial-gradient(circle,rgba(244,114,182,0.08) 0%,transparent 70%)",
              filter:"blur(35px)", animation:"bot-orb1 28s ease-in-out infinite reverse" }}/>
            <div style={{ position:"absolute", inset:"-24px",
              backgroundImage:"radial-gradient(circle,rgba(109,120,250,0.07) 1px,transparent 1px)",
              backgroundSize:"24px 24px", animation:"bot-grid-move 8s linear infinite" }}/>
            {particles.map(p=>(
              <div key={p.id} style={{ position:"absolute", top:p.top, left:p.left,
                width:p.size, height:p.size, borderRadius:"50%",
                background:p.color, boxShadow:`0 0 4px ${p.color}`,
                animation:`bot-particle ${p.dur} ease-in-out ${p.delay} infinite` }}/>
            ))}
          </div>

          {/* ── HEADER ── */}
          <div className="bot-header-inner" style={{
            padding:"14px 18px",
            borderBottom:`1px solid ${BORDER}`,
            display:"flex", alignItems:"center", gap:"12px",
            flexShrink:0, position:"relative", zIndex:2,
            background:"linear-gradient(to bottom,rgba(109,120,250,0.05) 0%,transparent 100%)",
          }}>
            <div style={{
              position:"absolute", bottom:0, left:"10%", right:"10%", height:"1px",
              background:`linear-gradient(90deg,transparent,${ACCENT}60,${ACCENT3}60,transparent)`,
              animation:"bot-header-gradient 4s ease-in-out infinite", backgroundSize:"200% 100%",
            }}/>

            {/* avatar */}
            <div className="bot-avatar-wrap" style={{
              width:"40px", height:"40px", borderRadius:"12px", flexShrink:0,
              background:"linear-gradient(135deg,#1e1b4b 0%,#0f172a 100%)",
              display:"flex", alignItems:"center", justifyContent:"center",
              border:"1px solid rgba(109,120,250,0.4)",
              boxShadow:`0 4px 20px ${GLOW_A},inset 0 1px 0 rgba(255,255,255,0.12)`,
              position:"relative", overflow:"hidden",
            }}>
              <RobotLogo size={24} animated/>
              <div style={{ position:"absolute", left:0, right:0, height:"1.5px",
                background:`linear-gradient(90deg,transparent,${ACCENT3}80,transparent)`,
                animation:"bot-scan-line 4s ease-in-out infinite" }}/>
            </div>

            {/* title */}
            <div style={{ flex:1, minWidth:0 }}>
              <div className="bot-title-txt" style={{
                fontFamily:DISPLAY, fontWeight:700, fontSize:"14px",
                background:`linear-gradient(90deg,${ACCENT2} 0%,${ACCENT3} 30%,#c084fc 60%,${ACCENT2} 90%)`,
                backgroundSize:"200% auto",
                WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
                animation:"bot-logo-shimmer 5s ease-in-out infinite",
                letterSpacing:"0.03em", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
              }}>VisuoSlayer AI</div>
              <div style={{ display:"flex", alignItems:"center", gap:"6px", marginTop:"2px", flexWrap:"wrap" }}>
                <span style={{ width:"6px", height:"6px", borderRadius:"50%", flexShrink:0,
                  background:"#34d399", boxShadow:"0 0 8px #34d399",
                  display:"inline-block", animation:"bot-glow-ring 2s ease-in-out infinite" }}/>
                <span style={{ fontFamily:MONO, fontSize:"9px", color:"#34d399", fontWeight:700, letterSpacing:"0.1em" }}>ONLINE</span>
                {userLanguage && <>
                  <span style={{ color:TEXT_DIM, fontSize:"8px" }}>·</span>
                  <span style={{ fontFamily:MONO, fontSize:"9px", color:ACCENT4, opacity:0.7 }}>{userLanguage}</span>
                </>}
                {messages.length > 0 && <>
                  <span style={{ color:TEXT_DIM, fontSize:"8px" }}>·</span>
                  <span style={{ fontFamily:MONO, fontSize:"9px", color:TEXT_DIM }}>{messages.length} msgs</span>
                </>}
                {focusMode && <>
                  <span style={{ color:TEXT_DIM, fontSize:"8px" }}>·</span>
                  <span style={{ fontFamily:MONO, fontSize:"9px", color:"#fbbf24" }}>FOCUS</span>
                </>}
              </div>
            </div>

            {/* ── HEADER BUTTONS ── */}
            <div className="bot-hbtns" style={{ display:"flex", gap:"4px", flexShrink:0, alignItems:"center" }}>

              {/* Search */}
              <div className="bot-hbtn-wrap">
                <HeaderBtn icon={<IconSearch size={14}/>} tooltip="Search  (Ctrl+K)"
                  onClick={()=> setShowSearch(true)} variant="search" disabled={!hasMessages}/>
              </div>

              {/* Export */}
              <div className="bot-hbtn-wrap">
                <HeaderBtn icon={<IconDownload size={14}/>}
                  tooltip={exportFlash ? "Exported!" : "Export  (Ctrl+Shift+E)"}
                  onClick={handleExport} variant="export" disabled={!hasMessages} active={exportFlash}/>
              </div>

              {/* Bookmarks — NEW */}
              <div className="bot-hbtn-wrap">
                <HeaderBtn icon={<IconBookmark size={14}/>}
                  tooltip={`Bookmarks${bookmarks.length>0?" ("+bookmarks.length+")":""}  (Ctrl+Shift+B)`}
                  onClick={()=> setShowBookmarks(true)} variant="bookmark"
                  active={bookmarks.length > 0}/>
              </div>

              {/* Focus Mode — NEW */}
              <div className="bot-hbtn-wrap">
                <HeaderBtn icon={<IconPin size={14}/>}
                  tooltip={focusMode ? "Exit focus mode  (Ctrl+Shift+F)" : "Focus mode  (Ctrl+Shift+F)"}
                  onClick={()=> setFocusMode(v=>!v)} variant="focus" active={focusMode}/>
              </div>

              {/* Voice */}
              <div className="bot-hbtn-wrap">
                <HeaderBtn icon={<IconVolume size={14}/>}
                  tooltip={selectedVoice ? `Voice: ${selectedVoice.name.split(" ").slice(0,2).join(" ")}` : "Voice settings"}
                  onClick={()=> setShowVoiceModal(true)} variant="default" active={!!selectedVoice}/>
              </div>

              {/* Shortcuts */}
              <div className="bot-hbtn-wrap">
                <HeaderBtn icon={<IconKeyboard size={14}/>} tooltip="Shortcuts  (Ctrl+/)"
                  onClick={()=> setShowShortcuts(true)} variant="keys"/>
              </div>

              <div style={{ width:"1px", height:"20px", background:"rgba(255,255,255,0.07)", flexShrink:0 }}/>

              {/* Language */}
              <div className="bot-hbtn-wrap">
                <HeaderBtn icon={<IconGlobe size={14}/>}
                  tooltip={userLanguage?`Language: ${userLanguage}`:"Set language"}
                  onClick={()=> setShowLangModal(true)} variant="lang" active={!!userLanguage}/>
              </div>

              {/* Clear */}
              <div className="bot-hbtn-wrap">
                <HeaderBtn icon={<IconTrash size={14}/>}
                  tooltip={hasMessages?`Clear ${messages.length} msgs`:"No messages"}
                  onClick={()=> hasMessages && setShowClearModal(true)}
                  variant="danger" disabled={!hasMessages}/>
              </div>

              <div style={{ width:"1px", height:"20px", background:"rgba(255,255,255,0.07)", flexShrink:0 }}/>

              {/* Close */}
              <div className="bot-hbtn-wrap">
                <HeaderBtn icon={<IconX size={14}/>} tooltip="Close  (Esc)" onClick={closePanel} variant="close"/>
              </div>
            </div>
          </div>

          {/* Focus mode banner */}
          {focusMode && <FocusModeBanner onExit={()=> setFocusMode(false)}/>}

          {/* ── MESSAGES ── */}
          <div className="bot-scroll bot-msgs-area" style={{
            flex:1, overflowY:"auto",
            padding:"16px 18px 8px",
            display:"flex", flexDirection:"column", gap:"14px",
            position:"relative", zIndex:1,
            WebkitOverflowScrolling:"touch",
            // Focus mode: dim everything
            filter: focusMode ? "none" : "none",
          }}>
            {messages.length===0 ? (
              <EmptyState onSend={sendMessage}/>
            ) : (
              <>
                {messages.map((msg, i)=>(
                  <div key={i} ref={el=> msgRefs.current[i]=el}
                    style={{ opacity: focusMode && i < messages.length-2 ? 0.4 : 1, transition:"opacity 0.3s" }}>
                    <MessageBubble
                      msg={msg} idx={i}
                      speakingIdx={speakingIdx}
                      onSpeak={speakText}
                      onStopSpeak={stopSpeak}
                      voiceSpeed={voiceSpeed}
                      onSpeedChange={handleSpeedChange}
                      isBookmarked={bookmarks.includes(i)}
                      onBookmark={toggleBookmark}
                      isStreaming={streamingIdx === i}
                    />
                  </div>
                ))}
                {loading && (
                  <div className="bot-msg-in" style={{ display:"flex", alignItems:"flex-end", gap:"10px" }}>
                    <div style={{
                      width:"32px", height:"32px", borderRadius:"10px", flexShrink:0,
                      background:"linear-gradient(135deg,#1e1b4b 0%,#0f172a 100%)",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      border:"1px solid rgba(109,120,250,0.35)",
                      boxShadow:`0 4px 16px ${GLOW_A}`, marginBottom:"2px",
                    }}>
                      <RobotLogo size={20} animated/>
                    </div>
                    <div style={{
                      padding:"13px 16px", borderRadius:"4px 16px 16px 16px",
                      background:"linear-gradient(145deg,rgba(255,255,255,0.04),rgba(30,27,75,0.2))",
                      border:`1px solid ${BORDER}`,
                    }}>
                      <TypingDots/>
                      <div style={{ fontFamily:MONO, fontSize:"8px", color:TEXT_DIM, marginTop:"4px" }}>thinking...</div>
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef}/>
          </div>

          {/* ── INPUT ── */}
          <div className="bot-input-area" style={{
            padding:`12px 18px calc(env(safe-area-inset-bottom,0px) + 14px)`,
            borderTop:`1px solid ${BORDER}`,
            flexShrink:0, position:"relative", zIndex:2,
            background:"linear-gradient(to top,rgba(109,120,250,0.04) 0%,transparent 100%)",
          }}>
            {loading && (
              <div style={{
                position:"absolute", top:0, left:0, right:0, height:"2px",
                background:`linear-gradient(90deg,${ACCENT},${ACCENT3},${ACCENT})`,
                backgroundSize:"200% 100%",
                animation:"bot-logo-shimmer 1.5s linear infinite",
                borderRadius:"0 0 2px 2px",
              }}/>
            )}

            <div style={{
              display:"flex", alignItems:"flex-end", gap:"8px",
              background: inputFoc ? "rgba(109,120,250,0.07)" : "rgba(255,255,255,0.025)",
              border:`1px solid ${inputFoc?"rgba(109,120,250,0.5)":BORDER2}`,
              borderRadius:"14px", padding:"10px 10px 10px 12px",
              transition:"all 0.25s cubic-bezier(0.22,1,0.36,1)",
              boxShadow: inputFoc ? "0 0 0 3px rgba(109,120,250,0.1),0 4px 20px rgba(109,120,250,0.08)" : "none",
            }}>
              <textarea
                ref={el=>{ inputRef.current=el; textareaRef.current=el; }}
                value={input} onChange={handleInput} onKeyDown={handleKey}
                onFocus={()=> setInputFoc(true)} onBlur={()=> setInputFoc(false)}
                placeholder="Ask any DSA question…"
                rows={1} disabled={loading}
                style={{
                  flex:1, background:"none", border:"none", outline:"none",
                  fontFamily:SANS, fontSize:"13px", color:TEXT_PRI,
                  fontWeight:400, resize:"none", lineHeight:"1.55",
                  maxHeight:"96px", overflow:"auto", minHeight:"22px",
                  opacity:loading?0.45:1, transition:"opacity 0.2s",
                  caretColor:ACCENT3, padding:0,
                }}
              />

              {charCount>0 && (
                <span style={{
                  fontFamily:MONO, fontSize:"8px",
                  color:charCount>400?"#f472b6":TEXT_DIM,
                  alignSelf:"center", flexShrink:0, transition:"color 0.2s",
                }}>{charCount}</span>
              )}

              {/* Voice input button */}
              <button
                onClick={toggleVoice}
                title={listening?"Stop recording (Ctrl+M)":"Voice input (Ctrl+M)"}
                style={{
                  width:"34px", height:"34px", borderRadius:"10px", flexShrink:0,
                  background: listening ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.03)",
                  border:`1px solid ${listening?"rgba(239,68,68,0.45)":"rgba(255,255,255,0.06)"}`,
                  color: listening ? "#fca5a5" : TEXT_DIM,
                  cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
                  outline:"none", alignSelf:"flex-end",
                  animation: listening ? "bot-mic-pulse 1.2s ease-in-out infinite" : "none",
                  transition:"all 0.18s",
                }}
              >
                {listening ? <IconStop size={12}/> : <IconMic size={13}/>}
              </button>

              <button className="bot-send bot-send-btn"
                onClick={()=> sendMessage()}
                disabled={!input.trim()||loading}
                style={{
                  width:"36px", height:"36px", borderRadius:"11px", flexShrink:0,
                  background: input.trim()&&!loading
                    ? `linear-gradient(135deg,${ACCENT} 0%,${ACCENT3} 100%)`
                    : "rgba(255,255,255,0.04)",
                  border:`1px solid ${input.trim()&&!loading?"rgba(109,120,250,0.55)":BORDER}`,
                  color: input.trim()&&!loading?"#fff":TEXT_DIM,
                  cursor:input.trim()&&!loading?"pointer":"default",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:"15px",
                  boxShadow:input.trim()&&!loading?"0 4px 18px rgba(109,120,250,0.45)":"none",
                  animation:input.trim()&&!loading?"bot-send-ready 2s ease-in-out infinite":"none",
                  outline:"none", alignSelf:"flex-end",
                }}
              >
                {loading ? (
                  <span style={{
                    width:"12px", height:"12px", borderRadius:"50%",
                    border:`2px solid ${ACCENT2}40`, borderTopColor:ACCENT2,
                    display:"inline-block", animation:"bot-fab-spin 0.75s linear infinite",
                  }}/>
                ) : "↑"}
              </button>
            </div>

            <div style={{
              display:"flex", alignItems:"center", justifyContent:"center",
              gap:"8px", marginTop:"7px",
            }}>
              <span style={{ fontFamily:MONO, fontSize:"8px", color:TEXT_DIM, opacity:0.45 }}>↵ send</span>
              <span style={{ color:TEXT_DIM, opacity:0.2, fontSize:"8px" }}>·</span>
              <span style={{ fontFamily:MONO, fontSize:"8px", color:TEXT_DIM, opacity:0.45 }}>shift+↵ newline</span>
              <span style={{ color:TEXT_DIM, opacity:0.2, fontSize:"8px" }}>·</span>
              <span style={{ fontFamily:MONO, fontSize:"8px", color:TEXT_DIM, opacity:0.3 }}>ctrl+k search</span>
            </div>
          </div>

          {/* ── MODALS ── */}
          {showLangModal && (
            <LanguageSelector currentLang={userLanguage} onSelect={handleLanguageSelect} onClose={()=> setShowLangModal(false)}/>
          )}
          {showClearModal && (
            <ClearModal
              count={messages.length}
              onConfirm={()=>{ setMessages([]); setShowClearModal(false); stopSpeak(); setBookmarks([]); setStreamingIdx(null); }}
              onCancel={()=> setShowClearModal(false)}
            />
          )}
          {showVoiceModal && (
            <VoicePickerModal
              currentVoice={selectedVoice}
              onSelect={(v)=>{ setSelectedVoice(v); selectedVoiceRef.current=v; setShowVoiceModal(false); }}
              onClose={()=> setShowVoiceModal(false)}
              voiceSpeed={voiceSpeed}
              onSpeedChange={(rate)=>{ setVoiceSpeed(rate); voiceSpeedRef.current=rate; }}
            />
          )}
          {showSearch && (
            <SearchOverlay messages={messages} onClose={()=> setShowSearch(false)}
              onJump={(idx)=>{ setJumpToIdx(idx); }}/>
          )}
          {showShortcuts && <ShortcutsModal onClose={()=> setShowShortcuts(false)}/>}
          {showBookmarks && (
            <BookmarksPanel
              bookmarks={bookmarks} messages={messages}
              onJump={(idx)=>{ setJumpToIdx(idx); }}
              onRemove={(idx)=> setBookmarks(prev=>prev.filter(b=>b!==idx))}
              onClose={()=> setShowBookmarks(false)}
            />
          )}
        </div>
      )}
    </>
  );
}