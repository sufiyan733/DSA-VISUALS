// "use client";
// import { useState, useEffect, useRef, useCallback } from "react";

// // ─────────────────────────────────────────────────────────────────────────────
// // DESIGN TOKENS (slightly tweaked)
// // ─────────────────────────────────────────────────────────────────────────────
// const BG        = "#030712";
// const SURFACE   = "rgba(8,11,24,0.98)";
// const SURFACE2  = "rgba(12,15,30,0.95)";
// const BORDER    = "rgba(255,255,255,0.06)";
// const BORDER2   = "rgba(255,255,255,0.10)";
// const TEXT_PRI  = "#f0f4ff";
// const TEXT_SEC  = "#8fa4cc";
// const TEXT_DIM  = "#3d526b";
// const MONO      = "'Space Mono', monospace";
// const SANS      = "'DM Sans', -apple-system, sans-serif";
// const DISPLAY   = "'Space Mono', monospace";
// const ACCENT    = "#6d78fa";
// const ACCENT2   = "#818cf8";
// const ACCENT3   = "#38bdf8";
// const ACCENT4   = "#a5b4fc";
// const GLOW_A    = "rgba(109,120,250,0.35)";
// const GLOW_B    = "rgba(56,189,248,0.20)";

// // ─────────────────────────────────────────────────────────────────────────────
// // SUGGESTIONS (unchanged)
// // ─────────────────────────────────────────────────────────────────────────────
// const SUGGESTIONS = [
//   { icon: "⑂",  label: "Explain AVL rotations",        color: "#818cf8", sub: "Trees · Balancing" },
//   { icon: "⚡",  label: "Quick Sort vs Merge Sort",     color: "#38bdf8", sub: "Sorting · Complexity" },
//   { icon: "⬡",  label: "How does Dijkstra work?",      color: "#34d399", sub: "Graphs · Shortest Path" },
//   { icon: "∞",   label: "Dynamic programming basics",  color: "#f472b6", sub: "DP · Optimization" },
// ];

// // ─────────────────────────────────────────────────────────────────────────────
// // SVG ROBOT LOGO (unchanged)
// // ─────────────────────────────────────────────────────────────────────────────
// function RobotLogo({ size = 20, animated = false }) {
//   return (
//     <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"
//       style={animated ? { animation: "bot-logo-float 4s ease-in-out infinite" } : {}}>
//       <line x1="16" y1="2" x2="16" y2="7" stroke={ACCENT2} strokeWidth="1.5" strokeLinecap="round"/>
//       <circle cx="16" cy="2" r="1.5" fill={ACCENT3} style={animated ? { animation: "bot-antenna-pulse 2s ease-in-out infinite" } : {}}/>
//       <rect x="6" y="7" width="20" height="14" rx="4" fill="url(#botGrad)" stroke={ACCENT2} strokeWidth="0.8" strokeOpacity="0.5"/>
//       <circle cx="11.5" cy="14" r="2.5" fill={ACCENT3} style={animated ? { animation: "bot-eye-blink 4s ease-in-out infinite" } : {}}/>
//       <circle cx="20.5" cy="14" r="2.5" fill={ACCENT3} style={animated ? { animation: "bot-eye-blink 4s ease-in-out infinite 0.15s" } : {}}/>
//       <circle cx="12.2" cy="13.2" r="0.8" fill="white" opacity="0.9"/>
//       <circle cx="21.2" cy="13.2" r="0.8" fill="white" opacity="0.9"/>
//       <path d="M12 18.5 Q16 20.5 20 18.5" stroke={ACCENT2} strokeWidth="1.2" strokeLinecap="round" fill="none"/>
//       <rect x="13" y="21" width="6" height="3" rx="1.5" fill={ACCENT2} opacity="0.6"/>
//       <rect x="8" y="24" width="16" height="7" rx="3" fill="url(#botGrad2)" stroke={ACCENT2} strokeWidth="0.8" strokeOpacity="0.4"/>
//       <circle cx="13" cy="27.5" r="1.2" fill={ACCENT3} opacity="0.7"/>
//       <circle cx="16" cy="27.5" r="1.2" fill={ACCENT2} opacity="0.7"/>
//       <circle cx="19" cy="27.5" r="1.2" fill={ACCENT3} opacity="0.7"/>
//       <defs>
//         <linearGradient id="botGrad" x1="6" y1="7" x2="26" y2="21" gradientUnits="userSpaceOnUse">
//           <stop offset="0%" stopColor="#1e1b4b"/>
//           <stop offset="100%" stopColor="#0f172a"/>
//         </linearGradient>
//         <linearGradient id="botGrad2" x1="8" y1="24" x2="24" y2="31" gradientUnits="userSpaceOnUse">
//           <stop offset="0%" stopColor="#1e1b4b"/>
//           <stop offset="100%" stopColor="#0c0f20"/>
//         </linearGradient>
//       </defs>
//     </svg>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // TYPING INDICATOR (unchanged)
// // ─────────────────────────────────────────────────────────────────────────────
// function TypingDots() {
//   return (
//     <div style={{ display: "flex", alignItems: "center", gap: "5px", padding: "6px 2px" }}>
//       {[0, 1, 2].map(i => (
//         <span key={i} style={{
//           width: "7px", height: "7px", borderRadius: "50%",
//           background: `radial-gradient(circle, ${ACCENT3} 0%, ${ACCENT} 100%)`,
//           display: "inline-block",
//           animation: `bot-typing-dot 1.4s cubic-bezier(0.4,0,0.6,1) ${i * 0.22}s infinite`,
//           boxShadow: `0 0 6px ${ACCENT3}60`,
//         }} />
//       ))}
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // MARKDOWN-LITE RENDERER (unchanged)
// // ─────────────────────────────────────────────────────────────────────────────
// function RichText({ content }) {
//   const parts = content.split(/(```[\s\S]*?```)/g);
//   return (
//     <div style={{ margin: 0, lineHeight: "1.7", wordBreak: "break-word" }}>
//       {parts.map((part, i) => {
//         if (part.startsWith("```")) {
//           const inner = part.replace(/^```\w*\n?/, "").replace(/```$/, "");
//           return (
//             <pre key={i} style={{
//               background: "rgba(0,0,0,0.45)",
//               border: `1px solid rgba(109,120,250,0.25)`,
//               borderLeft: `3px solid ${ACCENT}`,
//               borderRadius: "8px",
//               padding: "10px 13px",
//               margin: "8px 0",
//               overflowX: "auto",
//               fontFamily: MONO,
//               fontSize: "11px",
//               color: "#c8d8f8",
//               lineHeight: "1.6",
//               position: "relative",
//             }}>
//               <div style={{
//                 position: "absolute", top: "6px", right: "8px",
//                 fontSize: "8px", color: TEXT_DIM, fontFamily: MONO, letterSpacing: "0.1em",
//               }}>CODE</div>
//               {inner}
//             </pre>
//           );
//         }
//         const lines = part.split("\n");
//         return (
//           <span key={i}>
//             {lines.map((line, li) => {
//               const isLast = li === lines.length - 1;
//               const bulletMatch = line.match(/^(\s*[-•*]\s+)(.*)/);
//               const numMatch = line.match(/^(\s*\d+\.\s+)(.*)/);
//               let rendered;
//               const rawLine = bulletMatch ? bulletMatch[2] : numMatch ? numMatch[2] : line;
//               const tokens = rawLine.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
//               const inline = tokens.map((tok, ti) => {
//                 if (tok.startsWith("`") && tok.endsWith("`")) {
//                   return <code key={ti} style={{
//                     background: "rgba(109,120,250,0.18)",
//                     border: `1px solid rgba(109,120,250,0.3)`,
//                     borderRadius: "4px",
//                     padding: "1px 5px",
//                     fontFamily: MONO,
//                     fontSize: "10.5px",
//                     color: ACCENT3,
//                   }}>{tok.slice(1,-1)}</code>;
//                 }
//                 if (tok.startsWith("**") && tok.endsWith("**")) {
//                   return <strong key={ti} style={{ color: TEXT_PRI, fontWeight: 700 }}>{tok.slice(2,-2)}</strong>;
//                 }
//                 return tok;
//               });
//               if (bulletMatch) {
//                 rendered = (
//                   <div key={li} style={{ display: "flex", gap: "7px", margin: "3px 0" }}>
//                     <span style={{ color: ACCENT, fontWeight: 700, flexShrink: 0, marginTop: "1px" }}>▸</span>
//                     <span>{inline}</span>
//                   </div>
//                 );
//               } else if (numMatch) {
//                 rendered = (
//                   <div key={li} style={{ display: "flex", gap: "7px", margin: "3px 0" }}>
//                     <span style={{ color: ACCENT3, fontFamily: MONO, fontSize: "10px", flexShrink: 0, minWidth: "14px" }}>{numMatch[1].trim()}</span>
//                     <span>{inline}</span>
//                   </div>
//                 );
//               } else {
//                 rendered = <span key={li}>{inline}</span>;
//               }
//               return (
//                 <span key={li}>
//                   {rendered}
//                   {!isLast && line === "" ? <br /> : !isLast && !bulletMatch && !numMatch ? <br /> : null}
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
// // MESSAGE BUBBLE (with voice button)
// // ─────────────────────────────────────────────────────────────────────────────
// function MessageBubble({ msg, idx, onSpeak }) {
//   const isUser = msg.role === "user";
//   return (
//     <div
//       className="bot-msg-in"
//       style={{
//         display: "flex",
//         flexDirection: isUser ? "row-reverse" : "row",
//         alignItems: "flex-start",
//         gap: "10px",
//         animationDelay: `${idx * 0.04}s`,
//       }}
//     >
//       {!isUser && (
//         <div style={{
//           width: "32px", height: "32px", borderRadius: "10px", flexShrink: 0,
//           background: "linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)",
//           display: "flex", alignItems: "center", justifyContent: "center",
//           border: `1px solid rgba(109,120,250,0.35)`,
//           boxShadow: `0 4px 16px ${GLOW_A}, inset 0 1px 0 rgba(255,255,255,0.1)`,
//           marginTop: "2px",
//         }}>
//           <RobotLogo size={20} />
//         </div>
//       )}

//       <div style={{
//         maxWidth: "80%",
//         padding: isUser ? "11px 14px" : "13px 15px",
//         borderRadius: isUser ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
//         background: isUser
//           ? `linear-gradient(135deg, rgba(109,120,250,0.22) 0%, rgba(56,189,248,0.12) 100%)`
//           : `linear-gradient(145deg, rgba(255,255,255,0.035) 0%, rgba(30,27,75,0.2) 100%)`,
//         border: `1px solid ${isUser ? "rgba(109,120,250,0.35)" : "rgba(255,255,255,0.06)"}`,
//         boxShadow: isUser
//           ? `0 4px 20px rgba(109,120,250,0.2), inset 0 1px 0 rgba(255,255,255,0.08)`
//           : `0 2px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)`,
//         position: "relative",
//         overflow: "hidden",
//       }}>
//         {!isUser && (
//           <div style={{
//             position: "absolute", top: 0, left: "12px", right: "12px", height: "1px",
//             background: `linear-gradient(90deg, transparent, ${ACCENT}50, transparent)`,
//           }} />
//         )}
//         {isUser && (
//           <div style={{
//             position: "absolute", inset: 0, borderRadius: "inherit",
//             background: `linear-gradient(105deg, transparent 40%, rgba(109,120,250,0.08) 50%, transparent 60%)`,
//             backgroundSize: "200% 100%",
//             animation: "bot-shimmer 4s ease-in-out infinite",
//           }} />
//         )}

//         {!isUser && (
//           <div style={{
//             display: "flex", alignItems: "center", justifyContent: "space-between",
//             marginBottom: "8px",
//           }}>
//             <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
//               <span style={{
//                 fontFamily: MONO, fontSize: "9px", fontWeight: 700,
//                 color: ACCENT2, letterSpacing: "0.12em",
//               }}>VISUOSLAYER AI</span>
//               <div style={{
//                 width: "4px", height: "4px", borderRadius: "50%",
//                 background: "#34d399", boxShadow: "0 0 5px #34d399",
//               }} />
//             </div>
//             <button
//               onClick={() => onSpeak(msg.content)}
//               style={{
//                 background: "none", border: "none", cursor: "pointer",
//                 fontSize: "12px", color: TEXT_SEC, display: "flex",
//                 alignItems: "center", justifyContent: "center",
//                 padding: "2px", borderRadius: "6px",
//                 transition: "all 0.2s",
//               }}
//               onMouseEnter={(e) => e.currentTarget.style.color = ACCENT2}
//               onMouseLeave={(e) => e.currentTarget.style.color = TEXT_SEC}
//               aria-label="Read aloud"
//             >
//               🔊
//             </button>
//           </div>
//         )}

//         <div style={{
//           fontFamily: SANS, fontSize: "13px", lineHeight: "1.7",
//           color: isUser ? TEXT_PRI : TEXT_SEC,
//           position: "relative", zIndex: 1,
//           fontWeight: isUser ? 500 : 400,
//         }}>
//           {isUser ? msg.content : <RichText content={msg.content} />}
//         </div>

//         <div style={{
//           display: "flex", alignItems: "center", justifyContent: isUser ? "flex-end" : "flex-start",
//           gap: "5px", marginTop: "8px",
//         }}>
//           <span style={{ fontFamily: MONO, fontSize: "8.5px", color: TEXT_DIM }}>{msg.time}</span>
//           {isUser && <span style={{ fontSize: "9px", color: ACCENT2, opacity: 0.7 }}>✓✓</span>}
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // LANGUAGE SELECTOR MODAL (with close on outside click)
// // ─────────────────────────────────────────────────────────────────────────────
// function LanguageSelector({ onSelect, onClose }) {
//   const languages = ["Python", "JavaScript", "Java", "C++", "Go", "Rust"];
//   const modalRef = useRef(null);

//   const handleOutsideClick = (e) => {
//     if (modalRef.current && !modalRef.current.contains(e.target)) {
//       onClose();
//     }
//   };

//   useEffect(() => {
//     document.addEventListener("mousedown", handleOutsideClick);
//     return () => document.removeEventListener("mousedown", handleOutsideClick);
//   }, []);

//   return (
//     <div style={{
//       position: "absolute", inset: 0, zIndex: 10,
//       background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)",
//       display: "flex", alignItems: "center", justifyContent: "center",
//     }}>
//       <div ref={modalRef} style={{
//         background: SURFACE, border: `1px solid ${BORDER2}`, borderRadius: "24px",
//         padding: "24px", maxWidth: "320px", width: "90%", textAlign: "center",
//         boxShadow: "0 32px 64px rgba(0,0,0,0.5)",
//       }}>
//         <h2 style={{ fontFamily: DISPLAY, fontSize: "18px", color: TEXT_PRI, marginBottom: "16px" }}>
//           Choose your language
//         </h2>
//         <p style={{ fontFamily: SANS, fontSize: "13px", color: TEXT_SEC, marginBottom: "20px" }}>
//           I'll provide code examples in your preferred language.
//         </p>
//         <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "center" }}>
//           {languages.map(lang => (
//             <button
//               key={lang}
//               onClick={() => onSelect(lang)}
//               style={{
//                 background: `rgba(109,120,250,0.15)`, border: `1px solid ${ACCENT}60`,
//                 borderRadius: "40px", padding: "8px 16px", fontFamily: MONO,
//                 fontSize: "12px", color: TEXT_PRI, cursor: "pointer",
//                 transition: "all 0.2s",
//               }}
//               onMouseEnter={e => e.currentTarget.style.background = `rgba(109,120,250,0.3)`}
//               onMouseLeave={e => e.currentTarget.style.background = `rgba(109,120,250,0.15)`}
//             >
//               {lang}
//             </button>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // MAIN CHATBOT
// // ─────────────────────────────────────────────────────────────────────────────
// export default function ChatBot() {
//   const [open,      setOpen]      = useState(false);
//   const [messages,  setMessages]  = useState([]);
//   const [input,     setInput]     = useState("");
//   const [loading,   setLoading]   = useState(false);
//   const [fabHov,    setFabHov]    = useState(false);
//   const [mounted,   setMounted]   = useState(false);
//   const [inputFoc,  setInputFoc]  = useState(false);
//   const [particles, setParticles] = useState([]);
//   const [panelAnim, setPanelAnim] = useState("in");
//   const [charCount, setCharCount] = useState(0);
//   const [userLanguage, setUserLanguage] = useState(null);
//   const [showLangModal, setShowLangModal] = useState(false);

//   const messagesEndRef = useRef(null);
//   const inputRef       = useRef(null);

//   // Load language from localStorage
//   useEffect(() => {
//     const stored = localStorage.getItem("userLanguage");
//     if (stored) setUserLanguage(stored);
//     else setShowLangModal(true);
//   }, []);

//   const handleLanguageSelect = (lang) => {
//     setUserLanguage(lang);
//     localStorage.setItem("userLanguage", lang);
//     setShowLangModal(false);
//     setMessages(prev => [...prev, {
//       role: "assistant",
//       content: `Great! I'll use **${lang}** for code examples. How can I help you with DSA today?`,
//       time: getTime(),
//     }]);
//   };

//   useEffect(() => {
//     setMounted(true);
//     setParticles(Array.from({ length: 12 }, (_, i) => ({
//       id: i,
//       top:   `${5 + (i * 8.1) % 90}%`,
//       left:  `${5 + ((i * 37) % 90)}%`,
//       delay: `${i * 0.35}s`,
//       dur:   `${3.5 + (i % 4) * 0.8}s`,
//       size:  i % 3 === 0 ? "3px" : i % 3 === 1 ? "2px" : "1.5px",
//       color: i % 4 === 0 ? ACCENT : i % 4 === 1 ? ACCENT3 : i % 4 === 2 ? "#f472b6" : "#34d399",
//     })));
//   }, []);

//   useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);
//   useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 350); }, [open]);
//   useEffect(() => {
//     const h = (e) => { if (e.key === "Escape" && open) closePanel(); };
//     window.addEventListener("keydown", h);
//     return () => window.removeEventListener("keydown", h);
//   }, [open]);

//   const closePanel = () => { setPanelAnim("out"); setTimeout(() => { setOpen(false); setPanelAnim("in"); }, 260); };
//   const openPanel  = () => { setOpen(true); setPanelAnim("in"); };
//   const getTime    = () => new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

//   const speakText = (text) => {
//     if (!('speechSynthesis' in window)) return;
//     window.speechSynthesis.cancel();
//     const utterance = new SpeechSynthesisUtterance(text);
//     utterance.lang = "en-US";
//     window.speechSynthesis.speak(utterance);
//   };

//   const clearChat = () => {
//     if (window.confirm("Are you sure you want to clear the conversation?")) {
//       setMessages([]);
//     }
//   };

//   const sendMessage = useCallback(async (text) => {
//     const userText = (text ?? input).trim();
//     if (!userText || loading) return;
//     setInput(""); setCharCount(0);

//     const userMsg = { role: "user", content: userText, time: getTime() };
//     setMessages(prev => [...prev, userMsg]);
//     setLoading(true);

//     try {
//       const systemPrompt = `You are VisuoSlayer AI — an expert DSA tutor embedded in a Data Structures & Algorithms visualizer app.
// Answer with clarity and depth. Format your responses with:
// - Use **bold** for key terms
// - Use \`inline code\` for variable names, complexities
// - Use code blocks (\`\`\`) for algorithms/pseudocode
// - Use bullet points (- ) for lists
// - Be encouraging, precise, and technical.

// **Important**: The user's preferred programming language is ${userLanguage || "Python"}. Always include a relevant code example in that language when explaining algorithms or data structures. If the question is conceptual, give a minimal working example to illustrate.`;

//       const history = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));
//       const res = await fetch("/api/chat", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           messages: [
//             { role: "system", content: systemPrompt },
//             ...history,
//           ],
//         }),
//       });
//       const data = await res.json();
//       const reply = data.content ?? data.error ?? "Something went wrong.";
//       setMessages(prev => [...prev, { role: "assistant", content: reply, time: getTime() }]);
//     } catch {
//       setMessages(prev => [...prev, { role: "assistant", content: "Connection error. Please try again.", time: getTime() }]);
//     } finally { setLoading(false); }
//   }, [input, messages, loading, userLanguage]);

//   const handleKey = (e) => {
//     if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
//   };
//   const handleInput = (e) => { setInput(e.target.value); setCharCount(e.target.value.length); };

//   if (!mounted) return null;

//   const hasMessages = messages.length > 0;

//   return (
//     <>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');

//         /* Keyframes (all kept) */
//         @keyframes bot-typing-dot {
//           0%,60%,100% { transform: translateY(0) scale(0.8); opacity: 0.4; }
//           30%          { transform: translateY(-5px) scale(1.1); opacity: 1; }
//         }
//         @keyframes bot-shimmer {
//           0%   { background-position: -200% 0; }
//           100% { background-position:  200% 0; }
//         }
//         @keyframes bot-panel-in {
//           0%   { opacity:0; transform: scale(0.95) translateY(20px); }
//           100% { opacity:1; transform: scale(1) translateY(0); }
//         }
//         @keyframes bot-panel-out {
//           0%   { opacity:1; transform: scale(1) translateY(0); }
//           100% { opacity:0; transform: scale(0.95) translateY(20px); }
//         }
//         @keyframes bot-fab-pulse {
//           0%,100% { box-shadow: 0 0 0 0 rgba(109,120,250,0), 0 8px 32px rgba(109,120,250,0.4); }
//           50%      { box-shadow: 0 0 0 10px rgba(109,120,250,0.06), 0 8px 32px rgba(109,120,250,0.55); }
//         }
//         @keyframes bot-fab-spin {
//           0%   { transform: rotate(0deg); }
//           100% { transform: rotate(360deg); }
//         }
//         @keyframes bot-msg-in {
//           from { opacity:0; transform: translateY(12px) scale(0.97); }
//           to   { opacity:1; transform: translateY(0) scale(1); }
//         }
//         @keyframes bot-particle {
//           0%,100% { opacity:0.1; transform: translateY(0) scale(1); }
//           50%      { opacity:0.5; transform: translateY(-10px) scale(1.4); }
//         }
//         @keyframes bot-orb1 {
//           0%,100% { transform: translate(0,0) scale(1); }
//           33%      { transform: translate(18px,-12px) scale(1.08); }
//           66%      { transform: translate(-8px, 8px) scale(0.94); }
//         }
//         @keyframes bot-orb2 {
//           0%,100% { transform: translate(0,0) scale(1); }
//           40%      { transform: translate(-15px, 10px) scale(1.05); }
//           80%      { transform: translate(10px,-6px) scale(0.96); }
//         }
//         @keyframes bot-badge-pop {
//           0%   { transform: scale(0) rotate(-20deg); }
//           70%  { transform: scale(1.25) rotate(5deg); }
//           100% { transform: scale(1) rotate(0); }
//         }
//         @keyframes bot-glow-ring {
//           0%,100% { opacity:0.5; transform: scale(1); }
//           50%      { opacity:1; transform: scale(1.1); }
//         }
//         @keyframes bot-scan-line {
//           0%   { top:-1px; opacity:0; }
//           10%  { opacity:0.7; }
//           90%  { opacity:0.7; }
//           100% { top:100%; opacity:0; }
//         }
//         @keyframes bot-logo-shimmer {
//           0%   { background-position: -200% 0; }
//           100% { background-position:  200% 0; }
//         }
//         @keyframes bot-header-gradient {
//           0%,100% { background-position: 0% 50%; }
//           50%      { background-position: 100% 50%; }
//         }
//         @keyframes bot-grid-move {
//           0%   { transform: translate(0,0); }
//           100% { transform: translate(24px,24px); }
//         }
//         @keyframes bot-border-glow {
//           0%,100% { box-shadow: 0 0 0 1px rgba(109,120,250,0.15), 0 32px 80px rgba(0,0,0,0.8); }
//           50%      { box-shadow: 0 0 0 1px rgba(56,189,248,0.25), 0 32px 80px rgba(0,0,0,0.8), 0 0 60px rgba(109,120,250,0.08); }
//         }
//         @keyframes bot-antenna-pulse {
//           0%,100% { r: 1.5; opacity: 1; }
//           50%      { r: 2.5; opacity: 0.7; }
//         }
//         @keyframes bot-eye-blink {
//           0%,92%,100% { transform: scaleY(1); }
//           95%          { transform: scaleY(0.1); }
//         }
//         @keyframes bot-logo-float {
//           0%,100% { transform: translateY(0); }
//           50%      { transform: translateY(-2px); }
//         }
//         @keyframes bot-send-ready {
//           0%,100% { box-shadow: 0 4px 14px rgba(109,120,250,0.4); }
//           50%      { box-shadow: 0 4px 22px rgba(56,189,248,0.5); }
//         }
//         @keyframes bot-progress-bar {
//           0%   { width: 0%; }
//           50%  { width: 70%; }
//           100% { width: 100%; }
//         }
//         @keyframes bot-suggestion-slide {
//           from { opacity:0; transform: translateX(-12px); }
//           to   { opacity:1; transform: translateX(0); }
//         }
//         @keyframes bot-empty-float {
//           0%,100% { transform: translateY(0) rotate(0deg); }
//           33%      { transform: translateY(-6px) rotate(1.5deg); }
//           66%      { transform: translateY(-3px) rotate(-1deg); }
//         }
//         @keyframes bot-ring-expand {
//           0%    { transform: scale(0.8); opacity: 0.8; }
//           100%  { transform: scale(2.2); opacity: 0; }
//         }
//         @keyframes bot-fab-ring-expand {
//           0%    { transform: scale(1); opacity: 0.5; }
//           100%  { transform: scale(1.8); opacity: 0; }
//         }

//         .bot-msg-in { animation: bot-msg-in 0.3s cubic-bezier(0.22,1,0.36,1) both; }
//         .bot-scroll::-webkit-scrollbar { width: 3px; }
//         .bot-scroll::-webkit-scrollbar-track { background: transparent; }
//         .bot-scroll::-webkit-scrollbar-thumb { background: rgba(109,120,250,0.2); border-radius: 10px; }
//         .bot-scroll::-webkit-scrollbar-thumb:hover { background: rgba(109,120,250,0.4); }

//         .bot-suggestion {
//           transition: all 0.22s cubic-bezier(0.22,1,0.36,1);
//           -webkit-tap-highlight-color: transparent;
//         }
//         .bot-suggestion:hover {
//           transform: translateX(5px) translateY(-1px);
//         }
//         .bot-send {
//           transition: all 0.18s cubic-bezier(0.22,1,0.36,1);
//           -webkit-tap-highlight-color: transparent;
//         }
//         .bot-send:hover:not(:disabled) { transform: scale(1.08) rotate(10deg); }
//         .bot-send:active:not(:disabled) { transform: scale(0.92); }
//         .bot-close-btn { transition: all 0.2s cubic-bezier(0.22,1,0.36,1); }
//         .bot-close-btn:hover { transform: rotate(90deg) scale(1.1); }

//         /* Full‑screen adjustments */
//         @media (max-width: 600px) {
//           .bot-panel {
//             padding-bottom: env(safe-area-inset-bottom, 0px);
//           }
//         }
//       `}</style>

//       {/* FAB – only visible when panel is closed */}
//       {!open && (
//         <div className="bot-fab-wrap" style={{
//           position: "fixed",
//           bottom: "calc(env(safe-area-inset-bottom,0px) + 24px)",
//           right: "24px", zIndex: 500,
//         }}>
//           <div style={{
//             position: "absolute", inset: "-8px", borderRadius: "24px",
//             background: `radial-gradient(circle, ${GLOW_A} 0%, transparent 70%)`,
//             animation: "bot-glow-ring 3.5s ease-in-out infinite",
//             pointerEvents: "none",
//           }} />

//           <button
//             onClick={openPanel}
//             onMouseEnter={() => setFabHov(true)}
//             onMouseLeave={() => setFabHov(false)}
//             aria-label="Open AI assistant"
//             style={{
//               position: "relative", width: "56px", height: "56px", borderRadius: "16px",
//               background: fabHov
//                 ? "linear-gradient(135deg, #5a62e8 0%, #3b82f6 100%)"
//                 : "linear-gradient(135deg, #4338ca 0%, #6d78fa 50%, #38bdf8 100%)",
//               border: `1.5px solid ${fabHov ? "rgba(56,189,248,0.6)" : "rgba(109,120,250,0.6)"}`,
//               color: "#fff",
//               cursor: "pointer",
//               display: "flex", alignItems: "center", justifyContent: "center",
//               boxShadow: `0 8px 36px rgba(109,120,250,0.55), 0 4px 16px rgba(0,0,0,0.4)`,
//               transition: "all 0.25s cubic-bezier(0.22,1,0.36,1)",
//               animation: !fabHov ? "bot-fab-pulse 3.5s ease-in-out infinite" : "none",
//               backdropFilter: "blur(16px)", outline: "none",
//             }}
//           >
//             <div style={{ transition: "transform 0.25s", transform: fabHov ? "scale(1.1) rotate(-5deg)" : "scale(1)" }}>
//               <RobotLogo size={26} animated />
//             </div>
//           </button>

//           {!open && hasMessages && (
//             <div style={{
//               position: "absolute", top: "-5px", right: "-5px",
//               width: "14px", height: "14px", borderRadius: "50%",
//               background: "linear-gradient(135deg, #f472b6, #e879f9)",
//               border: "2px solid #030712",
//               animation: "bot-badge-pop 0.35s cubic-bezier(0.22,1,0.36,1)",
//               boxShadow: "0 0 10px rgba(248,121,249,0.7)",
//             }} />
//           )}
//         </div>
//       )}

//       {/* FULL‑SCREEN CHAT PANEL */}
//       {open && (
//         <div
//           className="bot-panel"
//           style={{
//             position: "fixed",
//             top: 0, left: 0, right: 0, bottom: 0,
//             width: "100vw",
//             height: "100vh",
//             borderRadius: 0,
//             background: SURFACE,
//             border: "none",
//             backdropFilter: "blur(32px)",
//             WebkitBackdropFilter: "blur(32px)",
//             display: "flex", flexDirection: "column",
//             overflow: "hidden",
//             animation: panelAnim === "in"
//               ? "bot-panel-in 0.35s cubic-bezier(0.22,1,0.36,1)"
//               : "bot-panel-out 0.26s cubic-bezier(0.4,0,0.6,1) forwards",
//             zIndex: 499,
//             animationFillMode: "both",
//             animationName: panelAnim === "in" ? "bot-panel-in, bot-border-glow" : "bot-panel-out",
//             animationDuration: panelAnim === "in" ? "0.35s, 5s" : "0.26s",
//             animationTimingFunction: panelAnim === "in" ? "cubic-bezier(0.22,1,0.36,1), ease-in-out" : "cubic-bezier(0.4,0,0.6,1)",
//             animationIterationCount: panelAnim === "in" ? "1, infinite" : "1",
//             animationDelay: panelAnim === "in" ? "0s, 0.35s" : "0s",
//           }}
//         >
//           {/* Ambient layer (unchanged) */}
//           <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
//             <div style={{
//               position: "absolute", top: "-60px", left: "15%",
//               width: "260px", height: "260px", borderRadius: "50%",
//               background: `radial-gradient(circle, ${GLOW_A} 0%, transparent 70%)`,
//               filter: "blur(50px)", animation: "bot-orb1 18s ease-in-out infinite",
//             }} />
//             <div style={{
//               position: "absolute", bottom: "40px", right: "-30px",
//               width: "200px", height: "200px", borderRadius: "50%",
//               background: `radial-gradient(circle, ${GLOW_B} 0%, transparent 70%)`,
//               filter: "blur(40px)", animation: "bot-orb2 22s ease-in-out infinite",
//             }} />
//             <div style={{
//               position: "absolute", bottom: "-20px", left: "10%",
//               width: "150px", height: "150px", borderRadius: "50%",
//               background: "radial-gradient(circle, rgba(244,114,182,0.08) 0%, transparent 70%)",
//               filter: "blur(35px)", animation: "bot-orb1 28s ease-in-out infinite reverse",
//             }} />
//             <div style={{
//               position: "absolute", inset: "-24px",
//               backgroundImage: "radial-gradient(circle, rgba(109,120,250,0.07) 1px, transparent 1px)",
//               backgroundSize: "24px 24px",
//               animation: "bot-grid-move 8s linear infinite",
//             }} />
//             {particles.map(p => (
//               <div key={p.id} style={{
//                 position: "absolute", top: p.top, left: p.left,
//                 width: p.size, height: p.size, borderRadius: "50%",
//                 background: p.color,
//                 boxShadow: `0 0 4px ${p.color}`,
//                 animation: `bot-particle ${p.dur} ease-in-out ${p.delay} infinite`,
//               }} />
//             ))}
//           </div>

//           {/* Header */}
//           <div style={{
//             padding: "15px 18px",
//             borderBottom: `1px solid ${BORDER}`,
//             display: "flex", alignItems: "center", gap: "12px",
//             flexShrink: 0, position: "relative", zIndex: 2,
//             background: "linear-gradient(to bottom, rgba(109,120,250,0.06) 0%, transparent 100%)",
//           }}>
//             <div style={{
//               position: "absolute", bottom: 0, left: "15%", right: "15%", height: "1px",
//               background: `linear-gradient(90deg, transparent, ${ACCENT}60, ${ACCENT3}60, transparent)`,
//               animation: "bot-header-gradient 4s ease-in-out infinite",
//               backgroundSize: "200% 100%",
//             }} />

//             <div style={{
//               width: "40px", height: "40px", borderRadius: "12px", flexShrink: 0,
//               background: "linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)",
//               display: "flex", alignItems: "center", justifyContent: "center",
//               border: `1px solid rgba(109,120,250,0.4)`,
//               boxShadow: `0 4px 20px ${GLOW_A}, inset 0 1px 0 rgba(255,255,255,0.12)`,
//               position: "relative", overflow: "hidden",
//             }}>
//               <RobotLogo size={24} animated />
//               <div style={{
//                 position: "absolute", left: 0, right: 0, height: "1.5px",
//                 background: `linear-gradient(90deg, transparent, ${ACCENT3}80, transparent)`,
//                 animation: "bot-scan-line 4s ease-in-out infinite",
//               }} />
//             </div>

//             <div style={{ flex: 1, minWidth: 0 }}>
//               <div style={{
//                 fontFamily: DISPLAY, fontWeight: 700, fontSize: "14px",
//                 background: `linear-gradient(90deg, ${ACCENT2} 0%, ${ACCENT3} 30%, #c084fc 60%, ${ACCENT2} 90%)`,
//                 backgroundSize: "200% auto",
//                 WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
//                 backgroundClip: "text",
//                 animation: "bot-logo-shimmer 5s ease-in-out infinite",
//                 letterSpacing: "0.03em",
//               }}>VisuoSlayer AI</div>
//               <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "3px" }}>
//                 <span style={{
//                   width: "6px", height: "6px", borderRadius: "50%",
//                   background: "#34d399", boxShadow: "0 0 8px #34d399",
//                   display: "inline-block", animation: "bot-glow-ring 2s ease-in-out infinite",
//                 }} />
//                 <span style={{ fontFamily: MONO, fontSize: "9px", color: "#34d399", fontWeight: 700, letterSpacing: "0.1em" }}>
//                   ONLINE · DSA EXPERT
//                 </span>
//                 <span style={{ fontFamily: MONO, fontSize: "9px", color: TEXT_DIM }}>· claude-powered</span>
//               </div>
//             </div>

//             <div style={{ display: "flex", gap: "7px", flexShrink: 0 }}>
//               <button
//                 onClick={() => setShowLangModal(true)}
//                 title={userLanguage ? `Current language: ${userLanguage}` : "Select language"}
//                 style={{
//                   width: "32px", height: "32px", borderRadius: "9px",
//                   background: "rgba(255,255,255,0.03)", border: `1px solid ${BORDER}`,
//                   color: TEXT_DIM, cursor: "pointer",
//                   display: "flex", alignItems: "center", justifyContent: "center",
//                   fontSize: "12px", outline: "none", transition: "all 0.2s",
//                 }}
//                 onMouseEnter={e => { e.currentTarget.style.color = ACCENT; e.currentTarget.style.background = "rgba(109,120,250,0.1)"; e.currentTarget.style.borderColor = "rgba(109,120,250,0.45)"; }}
//                 onMouseLeave={e => { e.currentTarget.style.color = TEXT_DIM; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = BORDER; }}
//               >
//                 🌐
//               </button>
//               {hasMessages && (
//                 <button onClick={clearChat} title="Clear chat" style={{
//                   width: "32px", height: "32px", borderRadius: "9px",
//                   background: "rgba(255,255,255,0.03)", border: `1px solid ${BORDER}`,
//                   color: TEXT_DIM, cursor: "pointer",
//                   display: "flex", alignItems: "center", justifyContent: "center",
//                   fontSize: "12px", outline: "none", transition: "all 0.2s",
//                 }}
//                   onMouseEnter={e => { e.currentTarget.style.color="#fca5a5"; e.currentTarget.style.background="rgba(239,68,68,0.1)"; e.currentTarget.style.borderColor="rgba(252,165,165,0.35)"; }}
//                   onMouseLeave={e => { e.currentTarget.style.color=TEXT_DIM; e.currentTarget.style.background="rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor=BORDER; }}
//                 >⊘</button>
//               )}
//               <button onClick={closePanel} title="Close" className="bot-close-btn" style={{
//                 width: "32px", height: "32px", borderRadius: "9px",
//                 background: "rgba(255,255,255,0.03)", border: `1px solid ${BORDER}`,
//                 color: TEXT_DIM, cursor: "pointer",
//                 display: "flex", alignItems: "center", justifyContent: "center",
//                 fontSize: "14px", outline: "none", transition: "all 0.2s",
//               }}
//                 onMouseEnter={e => { e.currentTarget.style.color=ACCENT; e.currentTarget.style.background=`rgba(109,120,250,0.1)`; e.currentTarget.style.borderColor=`rgba(109,120,250,0.45)`; }}
//                 onMouseLeave={e => { e.currentTarget.style.color=TEXT_DIM; e.currentTarget.style.background="rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor=BORDER; }}
//               >✕</button>
//             </div>
//           </div>

//           {/* Messages area */}
//           <div className="bot-scroll" style={{
//             flex: 1, overflowY: "auto", padding: "16px 18px 8px",
//             display: "flex", flexDirection: "column", gap: "14px",
//             position: "relative", zIndex: 1,
//             WebkitOverflowScrolling: "touch",
//           }}>
//             {messages.length === 0 ? (
//               <div style={{
//                 flex: 1, display: "flex", flexDirection: "column",
//                 alignItems: "center", justifyContent: "center",
//                 padding: "24px 16px", gap: "24px", minHeight: "100%",
//               }}>
//                 <div style={{ position: "relative", animation: "bot-empty-float 7s ease-in-out infinite" }}>
//                   <div style={{
//                     width: "72px", height: "72px", borderRadius: "20px",
//                     background: "linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)",
//                     display: "flex", alignItems: "center", justifyContent: "center",
//                     border: `1.5px solid rgba(109,120,250,0.45)`,
//                     boxShadow: `0 8px 32px ${GLOW_A}, inset 0 1px 0 rgba(255,255,255,0.12)`,
//                     position: "relative", overflow: "hidden",
//                   }}>
//                     <RobotLogo size={40} animated />
//                     <div style={{
//                       position: "absolute", left: 0, right: 0, height: "1.5px",
//                       background: `linear-gradient(90deg, transparent, ${ACCENT3}80, transparent)`,
//                       animation: "bot-scan-line 3s ease-in-out infinite",
//                     }} />
//                   </div>
//                   {[0,1].map(i => (
//                     <div key={i} style={{
//                       position: "absolute",
//                       inset: `${-16 - i*14}px`,
//                       borderRadius: `${28 + i*8}px`,
//                       border: `1px solid rgba(109,120,250,${0.15 - i*0.05})`,
//                       animation: `bot-ring-expand ${2.5 + i}s ease-out ${i*0.8}s infinite`,
//                     }} />
//                   ))}
//                 </div>

//                 <div style={{ textAlign: "center" }}>
//                   <div style={{
//                     fontFamily: DISPLAY, fontSize: "15px", fontWeight: 700,
//                     color: TEXT_PRI, marginBottom: "8px", letterSpacing: "0.03em",
//                     background: `linear-gradient(90deg, ${TEXT_PRI}, ${ACCENT4})`,
//                     WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
//                     backgroundClip: "text",
//                   }}>Ask me anything about DSA</div>
//                   <div style={{
//                     fontFamily: SANS, fontSize: "12px", color: TEXT_DIM,
//                     lineHeight: "1.65", maxWidth: "260px", margin: "0 auto",
//                   }}>
//                     I explain algorithms, compare complexities,<br/>and guide you through every visualization.
//                   </div>
//                 </div>

//                 <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%", maxWidth: "380px" }}>
//                   {SUGGESTIONS.map((s, i) => (
//                     <button key={i} className="bot-suggestion"
//                       onClick={() => sendMessage(s.label)}
//                       style={{
//                         display: "flex", alignItems: "center", gap: "11px",
//                         padding: "11px 14px", borderRadius: "12px",
//                         background: `${s.color}08`,
//                         border: `1px solid ${s.color}20`,
//                         color: TEXT_SEC, fontFamily: SANS, fontSize: "12.5px",
//                         fontWeight: 500, cursor: "pointer", textAlign: "left",
//                         animation: `bot-suggestion-slide 0.3s cubic-bezier(0.22,1,0.36,1) ${i * 0.07}s both`,
//                         position: "relative", overflow: "hidden",
//                       }}
//                       onMouseEnter={e => {
//                         e.currentTarget.style.background = `${s.color}14`;
//                         e.currentTarget.style.borderColor = `${s.color}40`;
//                         e.currentTarget.style.color = TEXT_PRI;
//                       }}
//                       onMouseLeave={e => {
//                         e.currentTarget.style.background = `${s.color}08`;
//                         e.currentTarget.style.borderColor = `${s.color}20`;
//                         e.currentTarget.style.color = TEXT_SEC;
//                       }}
//                     >
//                       <span style={{
//                         width: "30px", height: "30px", borderRadius: "8px", flexShrink: 0,
//                         background: `${s.color}15`, border: `1px solid ${s.color}30`,
//                         display: "flex", alignItems: "center", justifyContent: "center",
//                         fontFamily: MONO, fontSize: "12px", color: s.color,
//                       }}>{s.icon}</span>
//                       <div style={{ flex: 1, minWidth: 0 }}>
//                         <div style={{ color: "inherit", fontWeight: 600, fontSize: "12.5px" }}>{s.label}</div>
//                         <div style={{ fontFamily: MONO, fontSize: "9px", color: s.color, opacity: 0.7, marginTop: "1px" }}>{s.sub}</div>
//                       </div>
//                       <span style={{ color: TEXT_DIM, fontSize: "13px" }}>›</span>
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             ) : (
//               <>
//                 {messages.map((msg, i) => (
//                   <MessageBubble key={i} msg={msg} idx={i} onSpeak={speakText} />
//                 ))}
//                 {loading && (
//                   <div className="bot-msg-in" style={{ display: "flex", alignItems: "flex-end", gap: "10px" }}>
//                     <div style={{
//                       width: "32px", height: "32px", borderRadius: "10px", flexShrink: 0,
//                       background: "linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)",
//                       display: "flex", alignItems: "center", justifyContent: "center",
//                       border: `1px solid rgba(109,120,250,0.35)`,
//                       boxShadow: `0 4px 16px ${GLOW_A}`,
//                       marginBottom: "2px",
//                     }}>
//                       <RobotLogo size={20} animated />
//                     </div>
//                     <div style={{
//                       padding: "13px 16px",
//                       borderRadius: "4px 16px 16px 16px",
//                       background: "linear-gradient(145deg, rgba(255,255,255,0.04), rgba(30,27,75,0.2))",
//                       border: `1px solid ${BORDER}`,
//                     }}>
//                       <TypingDots />
//                       <div style={{ fontFamily: MONO, fontSize: "8px", color: TEXT_DIM, marginTop: "4px" }}>
//                         thinking...
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </>
//             )}
//             <div ref={messagesEndRef} />
//           </div>

//           {/* Input area */}
//           <div style={{
//             padding: "13px 18px 15px",
//             borderTop: `1px solid ${BORDER}`,
//             flexShrink: 0, position: "relative", zIndex: 2,
//             background: "linear-gradient(to top, rgba(109,120,250,0.04) 0%, transparent 100%)",
//           }}>
//             {loading && (
//               <div style={{
//                 position: "absolute", top: 0, left: 0, right: 0, height: "2px",
//                 background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT3}, ${ACCENT})`,
//                 backgroundSize: "200% 100%",
//                 animation: "bot-logo-shimmer 1.5s linear infinite, bot-progress-bar 2s ease-in-out",
//                 borderRadius: "0 0 2px 2px",
//               }} />
//             )}

//             <div style={{
//               display: "flex", alignItems: "flex-end", gap: "10px",
//               background: inputFoc
//                 ? `rgba(109,120,250,0.07)`
//                 : "rgba(255,255,255,0.025)",
//               border: `1px solid ${inputFoc ? "rgba(109,120,250,0.5)" : BORDER2}`,
//               borderRadius: "14px", padding: "11px 12px",
//               transition: "all 0.25s cubic-bezier(0.22,1,0.36,1)",
//               boxShadow: inputFoc ? `0 0 0 3px rgba(109,120,250,0.1)` : "none",
//             }}>
//               <textarea
//                 ref={inputRef}
//                 value={input}
//                 onChange={handleInput}
//                 onKeyDown={handleKey}
//                 onFocus={() => setInputFoc(true)}
//                 onBlur={() => setInputFoc(false)}
//                 placeholder="Ask about any DSA topic…"
//                 rows={1}
//                 disabled={loading}
//                 style={{
//                   flex: 1, background: "none", border: "none", outline: "none",
//                   fontFamily: SANS, fontSize: "13px", color: TEXT_PRI,
//                   fontWeight: 400, resize: "none", lineHeight: "1.55",
//                   maxHeight: "96px", overflow: "auto", minHeight: "22px",
//                   opacity: loading ? 0.45 : 1, transition: "opacity 0.2s",
//                   caretColor: ACCENT3,
//                 }}
//               />

//               {charCount > 0 && (
//                 <span style={{
//                   fontFamily: MONO, fontSize: "8px", color: charCount > 400 ? "#f472b6" : TEXT_DIM,
//                   alignSelf: "center", flexShrink: 0, transition: "color 0.2s",
//                 }}>{charCount}</span>
//               )}

//               <button
//                 className="bot-send"
//                 onClick={() => sendMessage()}
//                 disabled={!input.trim() || loading}
//                 title="Send (Enter)"
//                 style={{
//                   width: "36px", height: "36px", borderRadius: "11px", flexShrink: 0,
//                   background: input.trim() && !loading
//                     ? `linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT3} 100%)`
//                     : "rgba(255,255,255,0.04)",
//                   border: `1px solid ${input.trim() && !loading ? "rgba(109,120,250,0.55)" : BORDER}`,
//                   color: input.trim() && !loading ? "#fff" : TEXT_DIM,
//                   cursor: input.trim() && !loading ? "pointer" : "default",
//                   display: "flex", alignItems: "center", justifyContent: "center",
//                   fontSize: "15px",
//                   boxShadow: input.trim() && !loading
//                     ? "0 4px 18px rgba(109,120,250,0.45)"
//                     : "none",
//                   animation: input.trim() && !loading ? "bot-send-ready 2s ease-in-out infinite" : "none",
//                   transition: "all 0.2s cubic-bezier(0.22,1,0.36,1)",
//                   outline: "none", alignSelf: "flex-end",
//                 }}
//               >
//                 {loading ? (
//                   <span style={{
//                     width: "12px", height: "12px", borderRadius: "50%",
//                     border: `2px solid ${ACCENT2}40`,
//                     borderTopColor: ACCENT2,
//                     display: "inline-block",
//                     animation: "bot-fab-spin 0.75s linear infinite",
//                   }} />
//                 ) : "↑"}
//               </button>
//             </div>

//             <div style={{
//               display: "flex", alignItems: "center", justifyContent: "center",
//               gap: "8px", marginTop: "8px",
//             }}>
//               <span style={{ fontFamily: MONO, fontSize: "8px", color: TEXT_DIM, opacity: 0.5 }}>
//                 ↵ send
//               </span>
//               <span style={{ color: TEXT_DIM, opacity: 0.25, fontSize: "8px" }}>·</span>
//               <span style={{ fontFamily: MONO, fontSize: "8px", color: TEXT_DIM, opacity: 0.5 }}>
//                 shift+↵ newline
//               </span>
//               <span style={{ color: TEXT_DIM, opacity: 0.25, fontSize: "8px" }}>·</span>
//               <span style={{ fontFamily: MONO, fontSize: "8px", color: ACCENT2, opacity: 0.6 }}>
//                 powered by claude
//               </span>
//             </div>
//           </div>

//           {/* Language selector modal */}
//           {showLangModal && (
//             <LanguageSelector
//               onSelect={handleLanguageSelect}
//               onClose={() => setShowLangModal(false)}
//             />
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
const BG        = "#030712";
const SURFACE   = "rgba(8,11,24,0.99)";
const BORDER    = "rgba(255,255,255,0.06)";
const BORDER2   = "rgba(255,255,255,0.10)";
const TEXT_PRI  = "#f0f4ff";
const TEXT_SEC  = "#8fa4cc";
const TEXT_DIM  = "#3d526b";
const MONO      = "'Space Mono', monospace";
const SANS      = "'DM Sans', -apple-system, sans-serif";
const DISPLAY   = "'Space Mono', monospace";
const ACCENT    = "#6d78fa";
const ACCENT2   = "#818cf8";
const ACCENT3   = "#38bdf8";
const ACCENT4   = "#a5b4fc";
const GLOW_A    = "rgba(109,120,250,0.35)";
const GLOW_B    = "rgba(56,189,248,0.20)";

// ─────────────────────────────────────────────────────────────────────────────
// SUGGESTIONS
// ─────────────────────────────────────────────────────────────────────────────
const SUGGESTIONS = [
  { icon: "⑂",  label: "Explain AVL rotations",       color: "#818cf8", sub: "Trees · Balancing" },
  { icon: "⚡",  label: "Quick Sort vs Merge Sort",    color: "#38bdf8", sub: "Sorting · Complexity" },
  { icon: "⬡",  label: "How does Dijkstra work?",     color: "#34d399", sub: "Graphs · Shortest Path" },
  { icon: "∞",   label: "Dynamic programming basics", color: "#f472b6", sub: "DP · Optimization" },
];

// ─────────────────────────────────────────────────────────────────────────────
// SVG ROBOT LOGO
// ─────────────────────────────────────────────────────────────────────────────
function RobotLogo({ size = 20, animated = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={animated ? { animation: "bot-logo-float 4s ease-in-out infinite" } : {}}>
      <line x1="16" y1="2" x2="16" y2="7" stroke={ACCENT2} strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="16" cy="2" r="1.5" fill={ACCENT3} style={animated ? { animation: "bot-antenna-pulse 2s ease-in-out infinite" } : {}}/>
      <rect x="6" y="7" width="20" height="14" rx="4" fill="url(#botGrad)" stroke={ACCENT2} strokeWidth="0.8" strokeOpacity="0.5"/>
      <circle cx="11.5" cy="14" r="2.5" fill={ACCENT3} style={animated ? { animation: "bot-eye-blink 4s ease-in-out infinite" } : {}}/>
      <circle cx="20.5" cy="14" r="2.5" fill={ACCENT3} style={animated ? { animation: "bot-eye-blink 4s ease-in-out infinite 0.15s" } : {}}/>
      <circle cx="12.2" cy="13.2" r="0.8" fill="white" opacity="0.9"/>
      <circle cx="21.2" cy="13.2" r="0.8" fill="white" opacity="0.9"/>
      <path d="M12 18.5 Q16 20.5 20 18.5" stroke={ACCENT2} strokeWidth="1.2" strokeLinecap="round" fill="none"/>
      <rect x="13" y="21" width="6" height="3" rx="1.5" fill={ACCENT2} opacity="0.6"/>
      <rect x="8" y="24" width="16" height="7" rx="3" fill="url(#botGrad2)" stroke={ACCENT2} strokeWidth="0.8" strokeOpacity="0.4"/>
      <circle cx="13" cy="27.5" r="1.2" fill={ACCENT3} opacity="0.7"/>
      <circle cx="16" cy="27.5" r="1.2" fill={ACCENT2} opacity="0.7"/>
      <circle cx="19" cy="27.5" r="1.2" fill={ACCENT3} opacity="0.7"/>
      <defs>
        <linearGradient id="botGrad" x1="6" y1="7" x2="26" y2="21" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1e1b4b"/>
          <stop offset="100%" stopColor="#0f172a"/>
        </linearGradient>
        <linearGradient id="botGrad2" x1="8" y1="24" x2="24" y2="31" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1e1b4b"/>
          <stop offset="100%" stopColor="#0c0f20"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TYPING INDICATOR
// ─────────────────────────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "5px", padding: "6px 2px" }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: "7px", height: "7px", borderRadius: "50%",
          background: `radial-gradient(circle, ${ACCENT3} 0%, ${ACCENT} 100%)`,
          display: "inline-block",
          animation: `bot-typing-dot 1.4s cubic-bezier(0.4,0,0.6,1) ${i * 0.22}s infinite`,
          boxShadow: `0 0 6px ${ACCENT3}60`,
        }} />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MARKDOWN-LITE RENDERER
// ─────────────────────────────────────────────────────────────────────────────
function RichText({ content }) {
  const parts = content.split(/(```[\s\S]*?```)/g);
  return (
    <div style={{ margin: 0, lineHeight: "1.7", wordBreak: "break-word" }}>
      {parts.map((part, i) => {
        if (part.startsWith("```")) {
          const inner = part.replace(/^```\w*\n?/, "").replace(/```$/, "");
          return (
            <pre key={i} style={{
              background: "rgba(0,0,0,0.45)",
              border: `1px solid rgba(109,120,250,0.25)`,
              borderLeft: `3px solid ${ACCENT}`,
              borderRadius: "8px",
              padding: "10px 13px",
              margin: "8px 0",
              overflowX: "auto",
              fontFamily: MONO,
              fontSize: "11px",
              color: "#c8d8f8",
              lineHeight: "1.6",
              position: "relative",
            }}>
              <div style={{
                position: "absolute", top: "6px", right: "8px",
                fontSize: "8px", color: TEXT_DIM, fontFamily: MONO, letterSpacing: "0.1em",
              }}>CODE</div>
              {inner}
            </pre>
          );
        }
        const lines = part.split("\n");
        return (
          <span key={i}>
            {lines.map((line, li) => {
              const isLast = li === lines.length - 1;
              const bulletMatch = line.match(/^(\s*[-•*]\s+)(.*)/);
              const numMatch = line.match(/^(\s*\d+\.\s+)(.*)/);
              let rendered;
              const rawLine = bulletMatch ? bulletMatch[2] : numMatch ? numMatch[2] : line;
              const tokens = rawLine.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
              const inline = tokens.map((tok, ti) => {
                if (tok.startsWith("`") && tok.endsWith("`")) {
                  return <code key={ti} style={{
                    background: "rgba(109,120,250,0.18)",
                    border: `1px solid rgba(109,120,250,0.3)`,
                    borderRadius: "4px",
                    padding: "1px 5px",
                    fontFamily: MONO,
                    fontSize: "10.5px",
                    color: ACCENT3,
                  }}>{tok.slice(1,-1)}</code>;
                }
                if (tok.startsWith("**") && tok.endsWith("**")) {
                  return <strong key={ti} style={{ color: TEXT_PRI, fontWeight: 700 }}>{tok.slice(2,-2)}</strong>;
                }
                return tok;
              });
              if (bulletMatch) {
                rendered = (
                  <div key={li} style={{ display: "flex", gap: "7px", margin: "3px 0" }}>
                    <span style={{ color: ACCENT, fontWeight: 700, flexShrink: 0, marginTop: "1px" }}>▸</span>
                    <span>{inline}</span>
                  </div>
                );
              } else if (numMatch) {
                rendered = (
                  <div key={li} style={{ display: "flex", gap: "7px", margin: "3px 0" }}>
                    <span style={{ color: ACCENT3, fontFamily: MONO, fontSize: "10px", flexShrink: 0, minWidth: "14px" }}>{numMatch[1].trim()}</span>
                    <span>{inline}</span>
                  </div>
                );
              } else {
                rendered = <span key={li}>{inline}</span>;
              }
              return (
                <span key={li}>
                  {rendered}
                  {!isLast && line === "" ? <br /> : !isLast && !bulletMatch && !numMatch ? <br /> : null}
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
// ICON COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
function IconVolume({ size = 14, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
    </svg>
  );
}

function IconVolumeOff({ size = 14, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
      <line x1="23" y1="9" x2="17" y2="15"/>
      <line x1="17" y1="9" x2="23" y2="15"/>
    </svg>
  );
}

function IconGlobe({ size = 14, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  );
}

function IconTrash({ size = 14, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  );
}

function IconX({ size = 14, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}

function IconMinus({ size = 14, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round">
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HEADER ICON BUTTON — reusable, animated, tooltip
// ─────────────────────────────────────────────────────────────────────────────
function HeaderBtn({ icon, tooltip, onClick, variant = "default", disabled = false, active = false }) {
  const [hov, setHov] = useState(false);
  const [showTip, setShowTip] = useState(false);

  const colors = {
    default: { idle: TEXT_DIM, hover: ACCENT2, bg: "transparent", hoverBg: `rgba(109,120,250,0.12)`, border: "transparent", hoverBorder: `rgba(109,120,250,0.3)` },
    danger:  { idle: TEXT_DIM, hover: "#fca5a5", bg: "transparent", hoverBg: `rgba(239,68,68,0.1)`, border: "transparent", hoverBorder: `rgba(239,68,68,0.3)` },
    close:   { idle: TEXT_DIM, hover: "#f0f4ff", bg: "transparent", hoverBg: `rgba(255,255,255,0.08)`, border: "transparent", hoverBorder: `rgba(255,255,255,0.15)` },
    lang:    { idle: ACCENT4, hover: ACCENT3, bg: `rgba(109,120,250,0.08)`, hoverBg: `rgba(56,189,248,0.12)`, border: `rgba(109,120,250,0.2)`, hoverBorder: `rgba(56,189,248,0.4)` },
  };
  const c = colors[variant] || colors.default;

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={onClick}
        disabled={disabled}
        onMouseEnter={() => { setHov(true); setShowTip(true); }}
        onMouseLeave={() => { setHov(false); setShowTip(false); }}
        style={{
          width: "34px", height: "34px", borderRadius: "10px",
          background: hov ? c.hoverBg : (active ? `rgba(109,120,250,0.1)` : c.bg),
          border: `1px solid ${hov ? c.hoverBorder : (active ? `rgba(109,120,250,0.25)` : c.border)}`,
          color: hov ? c.hover : (active ? ACCENT2 : c.idle),
          cursor: disabled ? "default" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          outline: "none",
          transition: "all 0.18s cubic-bezier(0.22,1,0.36,1)",
          transform: hov && !disabled ? (variant === "close" ? "rotate(90deg)" : "translateY(-1px)") : "none",
          opacity: disabled ? 0.35 : 1,
          flexShrink: 0,
        }}
        aria-label={tooltip}
      >
        {icon}
      </button>

      {/* Tooltip */}
      {showTip && tooltip && (
        <div style={{
          position: "absolute", top: "calc(100% + 7px)", right: 0,
          background: "rgba(8,11,24,0.97)", border: `1px solid rgba(255,255,255,0.1)`,
          borderRadius: "7px", padding: "4px 9px",
          fontFamily: MONO, fontSize: "9px", color: TEXT_SEC,
          whiteSpace: "nowrap", pointerEvents: "none",
          boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
          animation: "bot-tip-in 0.15s ease-out",
          zIndex: 50,
          letterSpacing: "0.04em",
        }}>
          {tooltip}
          <div style={{
            position: "absolute", bottom: "100%", right: "11px",
            width: 0, height: 0,
            borderLeft: "4px solid transparent",
            borderRight: "4px solid transparent",
            borderBottom: "4px solid rgba(255,255,255,0.1)",
          }} />
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MESSAGE BUBBLE
// ─────────────────────────────────────────────────────────────────────────────
function MessageBubble({ msg, idx, onSpeak, isSpeaking, onStopSpeak }) {
  const isUser = msg.role === "user";
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div
      className="bot-msg-in"
      style={{
        display: "flex",
        flexDirection: isUser ? "row-reverse" : "row",
        alignItems: "flex-start",
        gap: "10px",
        animationDelay: `${idx * 0.04}s`,
      }}
    >
      {!isUser && (
        <div style={{
          width: "32px", height: "32px", borderRadius: "10px", flexShrink: 0,
          background: "linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          border: `1px solid rgba(109,120,250,0.35)`,
          boxShadow: `0 4px 16px ${GLOW_A}, inset 0 1px 0 rgba(255,255,255,0.1)`,
          marginTop: "2px",
        }}>
          <RobotLogo size={20} />
        </div>
      )}

      <div style={{
        maxWidth: "min(80%, 560px)",
        width: "fit-content",
        padding: isUser ? "11px 14px" : "13px 15px",
        borderRadius: isUser ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
        background: isUser
          ? `linear-gradient(135deg, rgba(109,120,250,0.22) 0%, rgba(56,189,248,0.12) 100%)`
          : `linear-gradient(145deg, rgba(255,255,255,0.035) 0%, rgba(30,27,75,0.2) 100%)`,
        border: `1px solid ${isUser ? "rgba(109,120,250,0.35)" : "rgba(255,255,255,0.06)"}`,
        boxShadow: isUser
          ? `0 4px 20px rgba(109,120,250,0.2), inset 0 1px 0 rgba(255,255,255,0.08)`
          : `0 2px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)`,
        position: "relative",
        overflow: "hidden",
      }}>
        {!isUser && (
          <div style={{
            position: "absolute", top: 0, left: "12px", right: "12px", height: "1px",
            background: `linear-gradient(90deg, transparent, ${ACCENT}50, transparent)`,
          }} />
        )}
        {isUser && (
          <div style={{
            position: "absolute", inset: 0, borderRadius: "inherit",
            background: `linear-gradient(105deg, transparent 40%, rgba(109,120,250,0.08) 50%, transparent 60%)`,
            backgroundSize: "200% 100%",
            animation: "bot-shimmer 4s ease-in-out infinite",
          }} />
        )}

        {!isUser && (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginBottom: "8px", gap: "8px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{
                fontFamily: MONO, fontSize: "9px", fontWeight: 700,
                color: ACCENT2, letterSpacing: "0.12em",
              }}>VISUOSLAYER AI</span>
              <div style={{
                width: "4px", height: "4px", borderRadius: "50%",
                background: "#34d399", boxShadow: "0 0 5px #34d399",
              }} />
            </div>
            <div style={{ display: "flex", gap: "4px" }}>
              {/* Copy */}
              <button
                onClick={handleCopy}
                title={copied ? "Copied!" : "Copy"}
                style={{
                  background: copied ? "rgba(52,211,153,0.15)" : "none",
                  border: `1px solid ${copied ? "rgba(52,211,153,0.3)" : "transparent"}`,
                  cursor: "pointer", padding: "3px 6px", borderRadius: "5px",
                  fontFamily: MONO, fontSize: "8px",
                  color: copied ? "#34d399" : TEXT_DIM,
                  transition: "all 0.2s", display: "flex", alignItems: "center", gap: "3px",
                }}
                onMouseEnter={e => !copied && (e.currentTarget.style.color = TEXT_SEC)}
                onMouseLeave={e => !copied && (e.currentTarget.style.color = TEXT_DIM)}
              >
                {copied ? "✓ COPIED" : "COPY"}
              </button>
              {/* Speak */}
              <button
                onClick={() => isSpeaking ? onStopSpeak() : onSpeak(msg.content)}
                title={isSpeaking ? "Stop reading" : "Read aloud"}
                style={{
                  background: isSpeaking ? "rgba(56,189,248,0.15)" : "none",
                  border: `1px solid ${isSpeaking ? "rgba(56,189,248,0.3)" : "transparent"}`,
                  cursor: "pointer", padding: "3px 5px", borderRadius: "5px",
                  color: isSpeaking ? ACCENT3 : TEXT_DIM,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => !isSpeaking && (e.currentTarget.style.color = ACCENT3)}
                onMouseLeave={e => !isSpeaking && (e.currentTarget.style.color = TEXT_DIM)}
              >
                {isSpeaking
                  ? <IconVolumeOff size={11} color="currentColor" />
                  : <IconVolume size={11} color="currentColor" />
                }
              </button>
            </div>
          </div>
        )}

        <div style={{
          fontFamily: SANS, fontSize: "13px", lineHeight: "1.7",
          color: isUser ? TEXT_PRI : TEXT_SEC,
          position: "relative", zIndex: 1,
          fontWeight: isUser ? 500 : 400,
        }}>
          {isUser ? msg.content : <RichText content={msg.content} />}
        </div>

        <div style={{
          display: "flex", alignItems: "center", justifyContent: isUser ? "flex-end" : "flex-start",
          gap: "5px", marginTop: "8px",
        }}>
          <span style={{ fontFamily: MONO, fontSize: "8.5px", color: TEXT_DIM }}>{msg.time}</span>
          {isUser && <span style={{ fontSize: "9px", color: ACCENT2, opacity: 0.7 }}>✓✓</span>}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LANGUAGE SELECTOR MODAL
// ─────────────────────────────────────────────────────────────────────────────
function LanguageSelector({ currentLang, onSelect, onClose }) {
  const languages = [
    { name: "Python", icon: "🐍", color: "#3b82f6" },
    { name: "JavaScript", icon: "⚡", color: "#f59e0b" },
    { name: "Java", icon: "☕", color: "#ef4444" },
    { name: "C++", icon: "⚙️", color: "#8b5cf6" },
    { name: "Go", icon: "🔵", color: "#06b6d4" },
    { name: "Rust", icon: "🦀", color: "#f97316" },
  ];

  return (
    <div
      style={{
        position: "absolute", inset: 0, zIndex: 10,
        background: "rgba(3,7,18,0.85)", backdropFilter: "blur(12px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        animation: "bot-modal-in 0.22s cubic-bezier(0.22,1,0.36,1)",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: "linear-gradient(145deg, rgba(14,17,35,0.98) 0%, rgba(8,11,24,0.99) 100%)",
        border: `1px solid rgba(109,120,250,0.25)`,
        borderRadius: "20px",
        padding: "28px 24px",
        width: "min(380px, calc(100vw - 40px))",
        boxShadow: `0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(109,120,250,0.1), inset 0 1px 0 rgba(255,255,255,0.07)`,
        position: "relative", overflow: "hidden",
      }}>
        {/* Background glow */}
        <div style={{
          position: "absolute", top: "-40px", left: "50%", transform: "translateX(-50%)",
          width: "200px", height: "200px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(109,120,250,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: "14px", right: "14px",
            width: "28px", height: "28px", borderRadius: "8px",
            background: "rgba(255,255,255,0.04)", border: `1px solid ${BORDER}`,
            color: TEXT_DIM, cursor: "pointer", display: "flex",
            alignItems: "center", justifyContent: "center", outline: "none",
            transition: "all 0.18s",
          }}
          onMouseEnter={e => { e.currentTarget.style.color = TEXT_PRI; e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = TEXT_DIM; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
        >
          <IconX size={12} color="currentColor" />
        </button>

        <div style={{ textAlign: "center", marginBottom: "24px", position: "relative" }}>
          <div style={{
            fontFamily: DISPLAY, fontSize: "16px", color: TEXT_PRI,
            fontWeight: 700, letterSpacing: "0.04em", marginBottom: "8px",
          }}>Preferred Language</div>
          <div style={{ fontFamily: SANS, fontSize: "12px", color: TEXT_DIM, lineHeight: 1.5 }}>
            Code examples will be shown in your chosen language
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          {languages.map(lang => {
            const isSelected = currentLang === lang.name;
            return (
              <button
                key={lang.name}
                onClick={() => onSelect(lang.name)}
                style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  padding: "12px 14px", borderRadius: "12px",
                  background: isSelected
                    ? `linear-gradient(135deg, ${lang.color}20 0%, ${lang.color}10 100%)`
                    : "rgba(255,255,255,0.02)",
                  border: `1px solid ${isSelected ? `${lang.color}50` : "rgba(255,255,255,0.06)"}`,
                  color: isSelected ? TEXT_PRI : TEXT_SEC,
                  cursor: "pointer", fontFamily: SANS, fontSize: "12.5px", fontWeight: 600,
                  transition: "all 0.18s cubic-bezier(0.22,1,0.36,1)",
                  outline: "none", textAlign: "left",
                  boxShadow: isSelected ? `0 4px 16px ${lang.color}20` : "none",
                }}
                onMouseEnter={e => {
                  if (!isSelected) {
                    e.currentTarget.style.background = `${lang.color}12`;
                    e.currentTarget.style.borderColor = `${lang.color}35`;
                    e.currentTarget.style.color = TEXT_PRI;
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }
                }}
                onMouseLeave={e => {
                  if (!isSelected) {
                    e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                    e.currentTarget.style.color = TEXT_SEC;
                    e.currentTarget.style.transform = "none";
                  }
                }}
              >
                <span style={{ fontSize: "16px", flexShrink: 0 }}>{lang.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: "12.5px" }}>{lang.name}</div>
                </div>
                {isSelected && (
                  <div style={{
                    width: "8px", height: "8px", borderRadius: "50%",
                    background: lang.color, boxShadow: `0 0 8px ${lang.color}`,
                    flexShrink: 0,
                  }} />
                )}
              </button>
            );
          })}
        </div>

        {currentLang && (
          <div style={{
            marginTop: "16px", padding: "10px 14px", borderRadius: "10px",
            background: "rgba(109,120,250,0.06)", border: `1px solid rgba(109,120,250,0.15)`,
            fontFamily: MONO, fontSize: "9px", color: ACCENT4, letterSpacing: "0.06em",
            display: "flex", alignItems: "center", gap: "8px",
          }}>
            <span style={{ opacity: 0.5 }}>CURRENT →</span>
            <span style={{ color: ACCENT3, fontWeight: 700 }}>{currentLang}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CLEAR CONFIRM MODAL
// ─────────────────────────────────────────────────────────────────────────────
function ClearConfirmModal({ onConfirm, onCancel, count }) {
  return (
    <div
      style={{
        position: "absolute", inset: 0, zIndex: 11,
        background: "rgba(3,7,18,0.85)", backdropFilter: "blur(12px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        animation: "bot-modal-in 0.2s cubic-bezier(0.22,1,0.36,1)",
      }}
      onClick={e => e.target === e.currentTarget && onCancel()}
    >
      <div style={{
        background: "linear-gradient(145deg, rgba(14,17,35,0.98), rgba(8,11,24,0.99))",
        border: `1px solid rgba(239,68,68,0.2)`,
        borderRadius: "18px", padding: "24px",
        width: "min(320px, calc(100vw - 40px))",
        boxShadow: "0 24px 60px rgba(0,0,0,0.7)",
        textAlign: "center",
      }}>
        <div style={{
          width: "48px", height: "48px", borderRadius: "14px", margin: "0 auto 16px",
          background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "20px",
        }}>🗑️</div>
        <div style={{ fontFamily: DISPLAY, fontSize: "14px", color: TEXT_PRI, marginBottom: "8px", fontWeight: 700 }}>
          Clear conversation?
        </div>
        <div style={{ fontFamily: SANS, fontSize: "12px", color: TEXT_DIM, marginBottom: "22px", lineHeight: 1.5 }}>
          This will remove all {count} messages. This action cannot be undone.
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: "10px", borderRadius: "10px",
              background: "rgba(255,255,255,0.04)", border: `1px solid ${BORDER2}`,
              color: TEXT_SEC, fontFamily: SANS, fontSize: "12px", fontWeight: 600,
              cursor: "pointer", outline: "none", transition: "all 0.18s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = TEXT_PRI; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = TEXT_SEC; }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: "10px", borderRadius: "10px",
              background: "linear-gradient(135deg, rgba(239,68,68,0.2), rgba(239,68,68,0.12))",
              border: `1px solid rgba(239,68,68,0.35)`,
              color: "#fca5a5", fontFamily: SANS, fontSize: "12px", fontWeight: 700,
              cursor: "pointer", outline: "none", transition: "all 0.18s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "linear-gradient(135deg, rgba(239,68,68,0.3), rgba(239,68,68,0.2))"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "linear-gradient(135deg, rgba(239,68,68,0.2), rgba(239,68,68,0.12))"; }}
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN CHATBOT
// ─────────────────────────────────────────────────────────────────────────────
export default function ChatBot() {
  const [open,           setOpen]           = useState(false);
  const [messages,       setMessages]       = useState([]);
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
  const [speakingIdx,    setSpeakingIdx]    = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);
  const textareaRef    = useRef(null);

  // Load language
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
    if (messages.length === 0) {
      setMessages([{
        role: "assistant",
        content: `Ready to go! I'll use **${lang}** for all code examples. What DSA concept would you like to explore?`,
        time: getTime(),
      }]);
    }
  };

  useEffect(() => {
    setMounted(true);
    setParticles(Array.from({ length: 12 }, (_, i) => ({
      id: i,
      top:   `${5 + (i * 8.1) % 90}%`,
      left:  `${5 + ((i * 37) % 90)}%`,
      delay: `${i * 0.35}s`,
      dur:   `${3.5 + (i % 4) * 0.8}s`,
      size:  i % 3 === 0 ? "3px" : i % 3 === 1 ? "2px" : "1.5px",
      color: i % 4 === 0 ? ACCENT : i % 4 === 1 ? ACCENT3 : i % 4 === 2 ? "#f472b6" : "#34d399",
    })));
  }, []);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 350); }, [open]);
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape" && open) closePanel(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "22px";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 96) + "px";
    }
  }, [input]);

  const closePanel = () => { setPanelAnim("out"); setTimeout(() => { setOpen(false); setPanelAnim("in"); }, 260); };
  const openPanel  = () => { setOpen(true); setPanelAnim("in"); };
  const getTime    = () => new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  const speakText = (text, idx) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    setSpeakingIdx(idx);
    const utterance = new SpeechSynthesisUtterance(text.replace(/```[\s\S]*?```/g, '').replace(/\*\*/g, '').replace(/`/g, ''));
    utterance.lang = "en-US";
    utterance.rate = 0.95;
    utterance.onend = () => setSpeakingIdx(null);
    utterance.onerror = () => setSpeakingIdx(null);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeak = () => {
    window.speechSynthesis?.cancel();
    setSpeakingIdx(null);
  };

  const sendMessage = useCallback(async (text) => {
    const userText = (text ?? input).trim();
    if (!userText || loading) return;
    setInput(""); setCharCount(0);

    const userMsg = { role: "user", content: userText, time: getTime() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const systemPrompt = `You are VisuoSlayer AI — an expert DSA tutor embedded in a Data Structures & Algorithms visualizer app.
Answer with clarity and depth. Format your responses with:
- Use **bold** for key terms
- Use \`inline code\` for variable names, complexities
- Use code blocks (\`\`\`) for algorithms/pseudocode
- Use bullet points (- ) for lists
- Be encouraging, precise, and technical.

**Important**: The user's preferred programming language is ${userLanguage || "Python"}. Always include a relevant code example in that language when explaining algorithms or data structures. If the question is conceptual, give a minimal working example to illustrate.`;

      const history = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", content: systemPrompt },
            ...history,
          ],
        }),
      });
      const data = await res.json();
      const reply = data.content ?? data.error ?? "Something went wrong.";
      setMessages(prev => [...prev, { role: "assistant", content: reply, time: getTime() }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Connection error. Please try again.", time: getTime() }]);
    } finally { setLoading(false); }
  }, [input, messages, loading, userLanguage]);

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };
  const handleInput = (e) => { setInput(e.target.value); setCharCount(e.target.value.length); };

  if (!mounted) return null;

  const hasMessages = messages.length > 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        @keyframes bot-typing-dot {
          0%,60%,100% { transform: translateY(0) scale(0.8); opacity: 0.4; }
          30%          { transform: translateY(-5px) scale(1.1); opacity: 1; }
        }
        @keyframes bot-shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        @keyframes bot-panel-in {
          0%   { opacity:0; transform: translateY(16px); }
          100% { opacity:1; transform: translateY(0); }
        }
        @keyframes bot-panel-out {
          0%   { opacity:1; transform: translateY(0); }
          100% { opacity:0; transform: translateY(16px); }
        }
        @keyframes bot-fab-pulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(109,120,250,0), 0 8px 32px rgba(109,120,250,0.4); }
          50%      { box-shadow: 0 0 0 10px rgba(109,120,250,0.06), 0 8px 32px rgba(109,120,250,0.55); }
        }
        @keyframes bot-fab-spin {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes bot-msg-in {
          from { opacity:0; transform: translateY(10px) scale(0.98); }
          to   { opacity:1; transform: translateY(0) scale(1); }
        }
        @keyframes bot-particle {
          0%,100% { opacity:0.1; transform: translateY(0) scale(1); }
          50%      { opacity:0.5; transform: translateY(-10px) scale(1.4); }
        }
        @keyframes bot-orb1 {
          0%,100% { transform: translate(0,0) scale(1); }
          33%      { transform: translate(18px,-12px) scale(1.08); }
          66%      { transform: translate(-8px, 8px) scale(0.94); }
        }
        @keyframes bot-orb2 {
          0%,100% { transform: translate(0,0) scale(1); }
          40%      { transform: translate(-15px, 10px) scale(1.05); }
          80%      { transform: translate(10px,-6px) scale(0.96); }
        }
        @keyframes bot-badge-pop {
          0%   { transform: scale(0) rotate(-20deg); }
          70%  { transform: scale(1.25) rotate(5deg); }
          100% { transform: scale(1) rotate(0); }
        }
        @keyframes bot-glow-ring {
          0%,100% { opacity:0.5; transform: scale(1); }
          50%      { opacity:1; transform: scale(1.1); }
        }
        @keyframes bot-scan-line {
          0%   { top:-1px; opacity:0; }
          10%  { opacity:0.7; }
          90%  { opacity:0.7; }
          100% { top:100%; opacity:0; }
        }
        @keyframes bot-logo-shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        @keyframes bot-header-gradient {
          0%,100% { background-position: 0% 50%; }
          50%      { background-position: 100% 50%; }
        }
        @keyframes bot-grid-move {
          0%   { transform: translate(0,0); }
          100% { transform: translate(24px,24px); }
        }
        @keyframes bot-border-glow {
          0%,100% { box-shadow: 0 0 0 1px rgba(109,120,250,0.15), 0 32px 80px rgba(0,0,0,0.8); }
          50%      { box-shadow: 0 0 0 1px rgba(56,189,248,0.25), 0 32px 80px rgba(0,0,0,0.8), 0 0 60px rgba(109,120,250,0.08); }
        }
        @keyframes bot-antenna-pulse {
          0%,100% { r: 1.5; opacity: 1; }
          50%      { r: 2.5; opacity: 0.7; }
        }
        @keyframes bot-eye-blink {
          0%,92%,100% { transform: scaleY(1); }
          95%          { transform: scaleY(0.1); }
        }
        @keyframes bot-logo-float {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-2px); }
        }
        @keyframes bot-send-ready {
          0%,100% { box-shadow: 0 4px 14px rgba(109,120,250,0.4); }
          50%      { box-shadow: 0 4px 22px rgba(56,189,248,0.5); }
        }
        @keyframes bot-suggestion-slide {
          from { opacity:0; transform: translateX(-10px); }
          to   { opacity:1; transform: translateX(0); }
        }
        @keyframes bot-empty-float {
          0%,100% { transform: translateY(0) rotate(0deg); }
          33%      { transform: translateY(-6px) rotate(1.5deg); }
          66%      { transform: translateY(-3px) rotate(-1deg); }
        }
        @keyframes bot-ring-expand {
          0%    { transform: scale(0.8); opacity: 0.8; }
          100%  { transform: scale(2.2); opacity: 0; }
        }
        @keyframes bot-fab-ring-expand {
          0%    { transform: scale(1); opacity: 0.5; }
          100%  { transform: scale(1.8); opacity: 0; }
        }
        @keyframes bot-modal-in {
          from { opacity:0; transform: scale(0.96) translateY(8px); }
          to   { opacity:1; transform: scale(1) translateY(0); }
        }
        @keyframes bot-tip-in {
          from { opacity:0; transform: translateY(-3px); }
          to   { opacity:1; transform: translateY(0); }
        }
        @keyframes bot-progress-bar {
          0%   { width: 0%; }
          50%  { width: 70%; }
          100% { width: 100%; }
        }

        .bot-msg-in { animation: bot-msg-in 0.3s cubic-bezier(0.22,1,0.36,1) both; }

        .bot-scroll { scrollbar-width: thin; scrollbar-color: rgba(109,120,250,0.2) transparent; }
        .bot-scroll::-webkit-scrollbar { width: 3px; }
        .bot-scroll::-webkit-scrollbar-track { background: transparent; }
        .bot-scroll::-webkit-scrollbar-thumb { background: rgba(109,120,250,0.2); border-radius: 10px; }
        .bot-scroll::-webkit-scrollbar-thumb:hover { background: rgba(109,120,250,0.4); }

        .bot-suggestion {
          transition: all 0.22s cubic-bezier(0.22,1,0.36,1);
          -webkit-tap-highlight-color: transparent;
        }
        .bot-suggestion:hover { transform: translateX(4px) translateY(-1px); }

        .bot-send {
          transition: all 0.18s cubic-bezier(0.22,1,0.36,1);
          -webkit-tap-highlight-color: transparent;
        }
        .bot-send:hover:not(:disabled) { transform: scale(1.08) rotate(8deg); }
        .bot-send:active:not(:disabled) { transform: scale(0.92); }

        /* Responsive: smaller padding on mobile */
        @media (max-width: 480px) {
          .bot-header-pad { padding: 12px 14px !important; }
          .bot-messages-pad { padding: 12px 14px 8px !important; }
          .bot-input-pad { padding: 10px 14px 12px !important; }
          .bot-bubble-max { max-width: 90% !important; }
        }
      `}</style>

      {/* ── FAB ── Only show when panel is CLOSED */}
      {!open && (
        <div style={{
          position: "fixed",
          bottom: "calc(env(safe-area-inset-bottom, 0px) + 24px)",
          right: "24px", zIndex: 500,
        }}>
          <div style={{
            position: "absolute", inset: "-8px", borderRadius: "24px",
            background: `radial-gradient(circle, ${GLOW_A} 0%, transparent 70%)`,
            animation: "bot-glow-ring 3.5s ease-in-out infinite",
            pointerEvents: "none",
          }} />

          <button
            onClick={openPanel}
            onMouseEnter={() => setFabHov(true)}
            onMouseLeave={() => setFabHov(false)}
            aria-label="Open AI assistant"
            style={{
              position: "relative", width: "56px", height: "56px", borderRadius: "16px",
              background: fabHov
                ? "linear-gradient(135deg, #5a62e8 0%, #3b82f6 100%)"
                : "linear-gradient(135deg, #4338ca 0%, #6d78fa 50%, #38bdf8 100%)",
              border: `1.5px solid ${fabHov ? "rgba(56,189,248,0.6)" : "rgba(109,120,250,0.6)"}`,
              color: "#fff",
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 8px 36px rgba(109,120,250,0.55), 0 4px 16px rgba(0,0,0,0.4)`,
              transition: "all 0.25s cubic-bezier(0.22,1,0.36,1)",
              animation: !fabHov ? "bot-fab-pulse 3.5s ease-in-out infinite" : "none",
              backdropFilter: "blur(16px)", outline: "none",
            }}
          >
            <div style={{ transition: "transform 0.25s", transform: fabHov ? "scale(1.1) rotate(-5deg)" : "scale(1)" }}>
              <RobotLogo size={26} animated />
            </div>
          </button>

          {hasMessages && (
            <div style={{
              position: "absolute", top: "-5px", right: "-5px",
              width: "14px", height: "14px", borderRadius: "50%",
              background: "linear-gradient(135deg, #f472b6, #e879f9)",
              border: "2px solid #030712",
              animation: "bot-badge-pop 0.35s cubic-bezier(0.22,1,0.36,1)",
              boxShadow: "0 0 10px rgba(248,121,249,0.7)",
            }} />
          )}
        </div>
      )}

      {/* ── FULL-SCREEN CHAT PANEL ── */}
      {open && (
        <div
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            width: "100dvw", height: "100dvh",
            background: SURFACE,
            display: "flex", flexDirection: "column",
            overflow: "hidden",
            animation: panelAnim === "in"
              ? "bot-panel-in 0.32s cubic-bezier(0.22,1,0.36,1)"
              : "bot-panel-out 0.24s cubic-bezier(0.4,0,0.6,1) forwards",
            zIndex: 499,
          }}
        >
          {/* Ambient background */}
          <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
            <div style={{
              position: "absolute", top: "-60px", left: "15%",
              width: "260px", height: "260px", borderRadius: "50%",
              background: `radial-gradient(circle, ${GLOW_A} 0%, transparent 70%)`,
              filter: "blur(50px)", animation: "bot-orb1 18s ease-in-out infinite",
            }} />
            <div style={{
              position: "absolute", bottom: "40px", right: "-30px",
              width: "200px", height: "200px", borderRadius: "50%",
              background: `radial-gradient(circle, ${GLOW_B} 0%, transparent 70%)`,
              filter: "blur(40px)", animation: "bot-orb2 22s ease-in-out infinite",
            }} />
            <div style={{
              position: "absolute", bottom: "-20px", left: "10%",
              width: "150px", height: "150px", borderRadius: "50%",
              background: "radial-gradient(circle, rgba(244,114,182,0.08) 0%, transparent 70%)",
              filter: "blur(35px)", animation: "bot-orb1 28s ease-in-out infinite reverse",
            }} />
            <div style={{
              position: "absolute", inset: "-24px",
              backgroundImage: "radial-gradient(circle, rgba(109,120,250,0.07) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
              animation: "bot-grid-move 8s linear infinite",
            }} />
            {particles.map(p => (
              <div key={p.id} style={{
                position: "absolute", top: p.top, left: p.left,
                width: p.size, height: p.size, borderRadius: "50%",
                background: p.color, boxShadow: `0 0 4px ${p.color}`,
                animation: `bot-particle ${p.dur} ease-in-out ${p.delay} infinite`,
              }} />
            ))}
          </div>

          {/* ── HEADER ── */}
          <div
            className="bot-header-pad"
            style={{
              padding: "14px 18px",
              borderBottom: `1px solid ${BORDER}`,
              display: "flex", alignItems: "center", gap: "12px",
              flexShrink: 0, position: "relative", zIndex: 2,
              background: "linear-gradient(to bottom, rgba(109,120,250,0.05) 0%, transparent 100%)",
            }}
          >
            {/* Animated gradient underline */}
            <div style={{
              position: "absolute", bottom: 0, left: "15%", right: "15%", height: "1px",
              background: `linear-gradient(90deg, transparent, ${ACCENT}60, ${ACCENT3}60, transparent)`,
              animation: "bot-header-gradient 4s ease-in-out infinite",
              backgroundSize: "200% 100%",
            }} />

            {/* Avatar */}
            <div style={{
              width: "40px", height: "40px", borderRadius: "12px", flexShrink: 0,
              background: "linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              border: `1px solid rgba(109,120,250,0.4)`,
              boxShadow: `0 4px 20px ${GLOW_A}, inset 0 1px 0 rgba(255,255,255,0.12)`,
              position: "relative", overflow: "hidden",
            }}>
              <RobotLogo size={24} animated />
              <div style={{
                position: "absolute", left: 0, right: 0, height: "1.5px",
                background: `linear-gradient(90deg, transparent, ${ACCENT3}80, transparent)`,
                animation: "bot-scan-line 4s ease-in-out infinite",
              }} />
            </div>

            {/* Title & status */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontFamily: DISPLAY, fontWeight: 700, fontSize: "14px",
                background: `linear-gradient(90deg, ${ACCENT2} 0%, ${ACCENT3} 30%, #c084fc 60%, ${ACCENT2} 90%)`,
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                animation: "bot-logo-shimmer 5s ease-in-out infinite",
                letterSpacing: "0.03em",
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}>VisuoSlayer AI</div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px", flexWrap: "wrap" }}>
                <span style={{
                  width: "6px", height: "6px", borderRadius: "50%", flexShrink: 0,
                  background: "#34d399", boxShadow: "0 0 8px #34d399",
                  display: "inline-block", animation: "bot-glow-ring 2s ease-in-out infinite",
                }} />
                <span style={{ fontFamily: MONO, fontSize: "9px", color: "#34d399", fontWeight: 700, letterSpacing: "0.1em" }}>
                  ONLINE
                </span>
                {userLanguage && (
                  <>
                    <span style={{ color: TEXT_DIM, fontSize: "8px" }}>·</span>
                    <span style={{ fontFamily: MONO, fontSize: "9px", color: ACCENT4, opacity: 0.7 }}>{userLanguage}</span>
                  </>
                )}
              </div>
            </div>

            {/* ── ACTION BUTTONS (improved) ── */}
            <div style={{ display: "flex", gap: "6px", flexShrink: 0, alignItems: "center" }}>

              {/* Language selector */}
              <HeaderBtn
                icon={<IconGlobe size={14} color="currentColor" />}
                tooltip={userLanguage ? `Language: ${userLanguage}` : "Set language"}
                onClick={() => setShowLangModal(true)}
                variant="lang"
                active={!!userLanguage}
              />

              {/* Clear chat */}
              <HeaderBtn
                icon={<IconTrash size={14} color="currentColor" />}
                tooltip={hasMessages ? `Clear ${messages.length} messages` : "No messages"}
                onClick={() => hasMessages && setShowClearModal(true)}
                variant="danger"
                disabled={!hasMessages}
              />

              {/* Divider */}
              <div style={{
                width: "1px", height: "20px",
                background: "rgba(255,255,255,0.07)",
                flexShrink: 0,
              }} />

              {/* Minimize / close */}
              <HeaderBtn
                icon={<IconX size={14} color="currentColor" />}
                tooltip="Close (Esc)"
                onClick={closePanel}
                variant="close"
              />
            </div>
          </div>

          {/* ── MESSAGES ── */}
          <div
            className="bot-scroll bot-messages-pad"
            style={{
              flex: 1, overflowY: "auto", padding: "16px 18px 8px",
              display: "flex", flexDirection: "column", gap: "14px",
              position: "relative", zIndex: 1,
              WebkitOverflowScrolling: "touch",
            }}
          >
            {messages.length === 0 ? (
              <div style={{
                flex: 1, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                padding: "24px 16px", gap: "24px", minHeight: "100%",
              }}>
                {/* Floating robot */}
                <div style={{ position: "relative", animation: "bot-empty-float 7s ease-in-out infinite" }}>
                  <div style={{
                    width: "72px", height: "72px", borderRadius: "20px",
                    background: "linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    border: `1.5px solid rgba(109,120,250,0.45)`,
                    boxShadow: `0 8px 32px ${GLOW_A}, inset 0 1px 0 rgba(255,255,255,0.12)`,
                    position: "relative", overflow: "hidden",
                  }}>
                    <RobotLogo size={40} animated />
                    <div style={{
                      position: "absolute", left: 0, right: 0, height: "1.5px",
                      background: `linear-gradient(90deg, transparent, ${ACCENT3}80, transparent)`,
                      animation: "bot-scan-line 3s ease-in-out infinite",
                    }} />
                  </div>
                  {[0,1].map(i => (
                    <div key={i} style={{
                      position: "absolute", inset: `${-16 - i*14}px`, borderRadius: `${28 + i*8}px`,
                      border: `1px solid rgba(109,120,250,${0.15 - i*0.05})`,
                      animation: `bot-ring-expand ${2.5 + i}s ease-out ${i*0.8}s infinite`,
                    }} />
                  ))}
                </div>

                <div style={{ textAlign: "center" }}>
                  <div style={{
                    fontFamily: DISPLAY, fontSize: "15px", fontWeight: 700,
                    color: TEXT_PRI, marginBottom: "8px", letterSpacing: "0.03em",
                    background: `linear-gradient(90deg, ${TEXT_PRI}, ${ACCENT4})`,
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}>Ask me anything about DSA</div>
                  <div style={{
                    fontFamily: SANS, fontSize: "12px", color: TEXT_DIM,
                    lineHeight: "1.65", maxWidth: "260px", margin: "0 auto",
                  }}>
                    Algorithms, complexities, visualizations —<br/>I've got you covered.
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%", maxWidth: "400px" }}>
                  {SUGGESTIONS.map((s, i) => (
                    <button key={i} className="bot-suggestion"
                      onClick={() => sendMessage(s.label)}
                      style={{
                        display: "flex", alignItems: "center", gap: "11px",
                        padding: "11px 14px", borderRadius: "12px",
                        background: `${s.color}08`, border: `1px solid ${s.color}20`,
                        color: TEXT_SEC, fontFamily: SANS, fontSize: "12.5px",
                        fontWeight: 500, cursor: "pointer", textAlign: "left",
                        animation: `bot-suggestion-slide 0.3s cubic-bezier(0.22,1,0.36,1) ${i * 0.07}s both`,
                        outline: "none",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = `${s.color}14`; e.currentTarget.style.borderColor = `${s.color}40`; e.currentTarget.style.color = TEXT_PRI; }}
                      onMouseLeave={e => { e.currentTarget.style.background = `${s.color}08`; e.currentTarget.style.borderColor = `${s.color}20`; e.currentTarget.style.color = TEXT_SEC; }}
                    >
                      <span style={{
                        width: "30px", height: "30px", borderRadius: "8px", flexShrink: 0,
                        background: `${s.color}15`, border: `1px solid ${s.color}30`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontFamily: MONO, fontSize: "12px", color: s.color,
                      }}>{s.icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: "inherit", fontWeight: 600, fontSize: "12.5px" }}>{s.label}</div>
                        <div style={{ fontFamily: MONO, fontSize: "9px", color: s.color, opacity: 0.7, marginTop: "1px" }}>{s.sub}</div>
                      </div>
                      <span style={{ color: TEXT_DIM, fontSize: "13px" }}>›</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, i) => (
                  <MessageBubble
                    key={i} msg={msg} idx={i}
                    onSpeak={(text) => speakText(text, i)}
                    isSpeaking={speakingIdx === i}
                    onStopSpeak={stopSpeak}
                  />
                ))}
                {loading && (
                  <div className="bot-msg-in" style={{ display: "flex", alignItems: "flex-end", gap: "10px" }}>
                    <div style={{
                      width: "32px", height: "32px", borderRadius: "10px", flexShrink: 0,
                      background: "linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      border: `1px solid rgba(109,120,250,0.35)`,
                      boxShadow: `0 4px 16px ${GLOW_A}`,
                      marginBottom: "2px",
                    }}>
                      <RobotLogo size={20} animated />
                    </div>
                    <div style={{
                      padding: "13px 16px",
                      borderRadius: "4px 16px 16px 16px",
                      background: "linear-gradient(145deg, rgba(255,255,255,0.04), rgba(30,27,75,0.2))",
                      border: `1px solid ${BORDER}`,
                    }}>
                      <TypingDots />
                      <div style={{ fontFamily: MONO, fontSize: "8px", color: TEXT_DIM, marginTop: "4px" }}>
                        thinking...
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* ── INPUT AREA ── */}
          <div
            className="bot-input-pad"
            style={{
              padding: "12px 18px calc(env(safe-area-inset-bottom, 0px) + 14px)",
              borderTop: `1px solid ${BORDER}`,
              flexShrink: 0, position: "relative", zIndex: 2,
              background: "linear-gradient(to top, rgba(109,120,250,0.04) 0%, transparent 100%)",
            }}
          >
            {loading && (
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: "2px",
                background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT3}, ${ACCENT})`,
                backgroundSize: "200% 100%",
                animation: "bot-logo-shimmer 1.5s linear infinite",
                borderRadius: "0 0 2px 2px",
              }} />
            )}

            <div style={{
              display: "flex", alignItems: "flex-end", gap: "10px",
              background: inputFoc
                ? `rgba(109,120,250,0.07)`
                : "rgba(255,255,255,0.025)",
              border: `1px solid ${inputFoc ? "rgba(109,120,250,0.5)" : BORDER2}`,
              borderRadius: "14px", padding: "10px 12px",
              transition: "all 0.25s cubic-bezier(0.22,1,0.36,1)",
              boxShadow: inputFoc ? `0 0 0 3px rgba(109,120,250,0.1), 0 4px 20px rgba(109,120,250,0.08)` : "none",
            }}>
              <textarea
                ref={(el) => { inputRef.current = el; textareaRef.current = el; }}
                value={input}
                onChange={handleInput}
                onKeyDown={handleKey}
                onFocus={() => setInputFoc(true)}
                onBlur={() => setInputFoc(false)}
                placeholder="Ask about any DSA topic…"
                rows={1}
                disabled={loading}
                style={{
                  flex: 1, background: "none", border: "none", outline: "none",
                  fontFamily: SANS, fontSize: "13px", color: TEXT_PRI,
                  fontWeight: 400, resize: "none", lineHeight: "1.55",
                  maxHeight: "96px", overflow: "auto", minHeight: "22px",
                  opacity: loading ? 0.45 : 1, transition: "opacity 0.2s",
                  caretColor: ACCENT3, padding: 0,
                }}
              />

              {charCount > 0 && (
                <span style={{
                  fontFamily: MONO, fontSize: "8px",
                  color: charCount > 400 ? "#f472b6" : TEXT_DIM,
                  alignSelf: "center", flexShrink: 0,
                  transition: "color 0.2s",
                }}>{charCount}</span>
              )}

              <button
                className="bot-send"
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                title="Send (Enter)"
                style={{
                  width: "36px", height: "36px", borderRadius: "11px", flexShrink: 0,
                  background: input.trim() && !loading
                    ? `linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT3} 100%)`
                    : "rgba(255,255,255,0.04)",
                  border: `1px solid ${input.trim() && !loading ? "rgba(109,120,250,0.55)" : BORDER}`,
                  color: input.trim() && !loading ? "#fff" : TEXT_DIM,
                  cursor: input.trim() && !loading ? "pointer" : "default",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "15px",
                  boxShadow: input.trim() && !loading ? "0 4px 18px rgba(109,120,250,0.45)" : "none",
                  animation: input.trim() && !loading ? "bot-send-ready 2s ease-in-out infinite" : "none",
                  transition: "all 0.2s cubic-bezier(0.22,1,0.36,1)",
                  outline: "none", alignSelf: "flex-end",
                }}
              >
                {loading ? (
                  <span style={{
                    width: "12px", height: "12px", borderRadius: "50%",
                    border: `2px solid ${ACCENT2}40`, borderTopColor: ACCENT2,
                    display: "inline-block",
                    animation: "bot-fab-spin 0.75s linear infinite",
                  }} />
                ) : "↑"}
              </button>
            </div>

            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: "8px", marginTop: "8px",
            }}>
              <span style={{ fontFamily: MONO, fontSize: "8px", color: TEXT_DIM, opacity: 0.5 }}>↵ send</span>
              <span style={{ color: TEXT_DIM, opacity: 0.25, fontSize: "8px" }}>·</span>
              <span style={{ fontFamily: MONO, fontSize: "8px", color: TEXT_DIM, opacity: 0.5 }}>shift+↵ newline</span>
              <span style={{ color: TEXT_DIM, opacity: 0.25, fontSize: "8px" }}>·</span>
              <span style={{ fontFamily: MONO, fontSize: "8px", color: ACCENT2, opacity: 0.6 }}>
                powered by claude
              </span>
            </div>
          </div>

          {/* ── MODALS ── */}
          {showLangModal && (
            <LanguageSelector
              currentLang={userLanguage}
              onSelect={handleLanguageSelect}
              onClose={() => setShowLangModal(false)}
            />
          )}

          {showClearModal && (
            <ClearConfirmModal
              count={messages.length}
              onConfirm={() => { setMessages([]); setShowClearModal(false); stopSpeak(); }}
              onCancel={() => setShowClearModal(false)}
            />
          )}
        </div>
      )}
    </>
  );
}