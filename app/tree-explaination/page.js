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
    v => /Natural/i.test(v.name) && /male|man|guy|guy|ryan|davis|mark|daniel|alex|james|chris|liam|aaron|arthur|oliver|george/i.test(v.name) && v.lang.startsWith("en"),
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
    u.onend  = onEnd;
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
  intro: `A tree is a hierarchical data structure — imagine a family tree or a company org chart. Unlike arrays or linked lists that are linear, trees branch outward. Every tree has exactly one root node at the top, and branches grow downward. There are no cycles — you cannot loop back. Trees are everywhere: your computer's file system, the HTML structure of every webpage, database indexes, and even the autocomplete on your phone — all powered by trees.`,
  anatomy: `Let's master the vocabulary. The root is the single top-most node — it has no parent and is where all operations begin. Internal nodes are in the middle — they have both a parent and children. Leaf nodes have no children and sit at the edge of the tree. An edge is the connection between two nodes. The depth of a node counts how many edges separate it from the root. The height is the longest path from root down to any leaf. A subtree is any node taken with all of its descendants.`,
  types: `There are several important types of trees. A general tree allows any number of children. A binary tree limits each node to at most two children. A Full binary tree has every node with zero or exactly two children. A Complete binary tree fills all levels except possibly the last, left to right. A Binary Search Tree adds ordering: left is smaller, right is larger. An AVL tree adds auto-balancing. A Heap adds priority ordering. Each type solves a different problem.`,
  bst: `A Binary Search Tree enforces one golden rule: every node's left subtree has only smaller values, and the right subtree has only larger values. This simple rule enables O log n search — to find any value among a billion items, you need at most 30 comparisons. Insertion follows the same path. The problem is that inserting sorted data creates a degenerate tree that looks like a linked list, degrading to O n. That is exactly why AVL trees were invented.`,
  avl: `An AVL tree, named after inventors Adelson-Velsky and Landis, solves BST degeneration. It tracks a balance factor at every node — the height difference between left and right subtrees. AVL enforces that this is always minus one, zero, or plus one. When violated, it performs rotations. There are four cases: Left-Left uses a right rotation, Right-Right uses a left rotation, Left-Right and Right-Left each use two rotations. The guarantee is that height stays within one point four four times log n always.`,
  heap: `A Heap is a complete binary tree with a special property. In a Max Heap, every parent is greater than or equal to its children, so the maximum element always sits at the root — accessible in O one. In a Min Heap, the minimum is always at root. The clever storage trick: heaps live in plain arrays with no pointers. For a node at index i, left child is at 2i plus 1, right at 2i plus 2, and parent at i minus 1 divided by 2. This makes heaps memory-efficient and cache-friendly, perfect for priority queues.`,
  trie: `A Trie stores strings character by character, one letter per edge. Searching for a word of length m takes O m time — completely independent of how many words are stored. Add ten million words: search speed does not change. Type a prefix in autocomplete: traverse to that node, collect every word in the subtree. This is how Google Suggest, browser URL bars, spell checkers, and IP routing tables all work. The name Trie comes from re-TRIE-val.`,
  traversal: `Tree traversal means visiting every node exactly once in a specific order. In-Order visits Left subtree, then the current node, then Right — for any BST this always gives sorted ascending output. Pre-Order visits the current node first, then left, then right — perfect for copying a tree. Post-Order visits left, then right, then the current node — used for safe deletion since children are freed before their parent. Breadth-First Search visits nodes level by level using a queue — essential for shortest path problems.`,
  quiz: `Outstanding work reaching the quiz! You have learned the complete foundation: what trees are, their anatomy, types of binary trees, Binary Search Trees, AVL self-balancing, Heaps, Tries, and all four traversal methods. Now test yourself honestly. Getting answers wrong is how learning happens. Every expert was once a complete beginner. Take your time, trust what you studied, and let's find out what you know.`,
};

const NAV_SECTIONS = [
  { id:"intro",     icon:"🌱", label:"Intro",     col:"#4ade80" },
  { id:"anatomy",   icon:"🔬", label:"Anatomy",   col:"#818cf8" },
  { id:"types",     icon:"🌿", label:"Types",     col:"#38bdf8" },
  { id:"bst",       icon:"🔍", label:"BST",       col:"#06b6d4" },
  { id:"avl",       icon:"⚖️",  label:"AVL",       col:"#fbbf24" },
  { id:"heap",      icon:"🏔️", label:"Heap",      col:"#f97316" },
  { id:"trie",      icon:"📝", label:"Trie",      col:"#a855f7" },
  { id:"traversal", icon:"🗺️", label:"Traversal", col:"#34d399" },
  { id:"quiz",      icon:"🧠", label:"Quiz",      col:"#ec4899" },
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
        background:"linear-gradient(90deg,#6366f1,#38bdf8,#4ade80)",
        transition:"width 0.12s linear",
        boxShadow:"0 0 10px rgba(99,102,241,0.7)",
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
          background: open ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.05)",
          border:`1.5px solid ${open ? "#6366f1" : "rgba(255,255,255,0.1)"}`,
          fontFamily:"'JetBrains Mono',monospace", fontSize:9, fontWeight:700,
          color: open ? "#818cf8" : "#64748b", transition:"all 0.2s",
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
              background: speed === s ? "rgba(99,102,241,0.2)" : "transparent",
              border:`1px solid ${speed === s ? "rgba(99,102,241,0.45)" : "transparent"}`,
              fontFamily:"'JetBrains Mono',monospace", fontSize:10, fontWeight:700,
              color: speed === s ? "#818cf8" : "#475569", transition:"all 0.15s",
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
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    const h = () => setShow(window.scrollY > 500);
    window.addEventListener("scroll", h, { passive:true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  return (
    <>
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
        {/* Desktop section pills */}
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

        {/* Divider */}
        <div style={{ width:1, height:20, background:"rgba(255,255,255,0.08)", margin:"0 4px" }}/>

        {/* Speed control */}
        <SpeedPanel speed={speed} setSpeed={setSpeed} speaking={!!speaking} onRestart={onRestart}/>

        {/* Speaking indicator */}
        {speaking && (
          <div style={{
            marginLeft:4, display:"flex", alignItems:"center", gap:5,
            padding:"4px 10px", borderRadius:14,
            background:"rgba(74,222,128,0.12)", border:"1px solid rgba(74,222,128,0.3)",
          }}>
            <SpeakingWave color="#4ade80" size={14}/>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:"#4ade80", fontWeight:700 }}>ON</span>
          </div>
        )}
      </nav>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SPEAKING WAVE ANIMATION
// ═══════════════════════════════════════════════════════════════════════════════
function SpeakingWave({ color = "#4ade80", size = 16 }) {
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
// BACK TO TOP BUTTON
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
        background:"rgba(99,102,241,0.15)", border:"1px solid rgba(99,102,241,0.35)",
        color:"#818cf8", fontSize:18,
        display:"flex", alignItems:"center", justifyContent:"center",
        opacity: show ? 1 : 0, transform: show ? "scale(1)" : "scale(0.7)",
        pointerEvents: show ? "auto" : "none",
        transition:"all 0.3s cubic-bezier(0.22,1,0.36,1)",
        boxShadow:"0 8px 24px rgba(99,102,241,0.3)",
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
      background:"rgba(74,222,128,0.12)", border:"1px solid rgba(74,222,128,0.3)",
      color:"#4ade80", letterSpacing:"0.08em",
      animation:"fadeIn 0.4s ease both",
    }}>✓ READ</span>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// HERO
// ═══════════════════════════════════════════════════════════════════════════════
function Hero({ onStart, onVoice, speed }) {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setFrame(f => (f + 1) % 5), 1800);
    return () => clearInterval(t);
  }, []);

  const hNodes = [
    { x:220, y:58,  r:28, c:"#818cf8", lbl:"Root", d:0    },
    { x:128, y:148, r:21, c:"#38bdf8", lbl:"B",    d:0.28 },
    { x:312, y:148, r:21, c:"#38bdf8", lbl:"C",    d:0.46 },
    { x:76,  y:226, r:16, c:"#4ade80", lbl:"D",    d:0.64 },
    { x:180, y:226, r:16, c:"#4ade80", lbl:"E",    d:0.82 },
    { x:264, y:226, r:16, c:"#f472b6", lbl:"F",    d:1.0  },
    { x:360, y:226, r:16, c:"#f472b6", lbl:"G",    d:1.18 },
  ];
  const edges = [[0,1],[0,2],[1,3],[1,4],[2,5],[2,6]];
  const show = frame < 1 ? 1 : frame < 2 ? 3 : 7;

  return (
    <div style={{
      minHeight:"100vh", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      padding:"80px 24px 48px", textAlign:"center", position:"relative", overflow:"hidden",
    }}>
      <div style={{ position:"absolute",inset:0,pointerEvents:"none",
        backgroundImage:"radial-gradient(circle,rgba(99,102,241,0.055) 1px,transparent 1px)",
        backgroundSize:"38px 38px" }}/>
      <div style={{ position:"absolute",top:"8%",left:"5%",width:420,height:420,borderRadius:"50%",
        background:"radial-gradient(circle,rgba(99,102,241,0.14) 0%,transparent 68%)",
        filter:"blur(72px)",pointerEvents:"none",
        animation:"hOrb1 22s ease-in-out infinite" }}/>
      <div style={{ position:"absolute",bottom:"10%",right:"4%",width:320,height:320,borderRadius:"50%",
        background:"radial-gradient(circle,rgba(56,189,248,0.11) 0%,transparent 68%)",
        filter:"blur(60px)",pointerEvents:"none",
        animation:"hOrb2 28s ease-in-out infinite" }}/>

      <div style={{ width:"100%",maxWidth:440,marginBottom:36 }}>
        <svg viewBox="0 0 440 268" width="100%">
          <defs>
            <filter id="hGlw">
              <feGaussianBlur stdDeviation="7" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>
          {edges.map(([a,b],i) => {
            const n1=hNodes[a], n2=hNodes[b];
            if (Math.min(a,b) >= show) return null;
            return <line key={i} x1={n1.x} y1={n1.y} x2={n2.x} y2={n2.y}
              stroke="rgba(255,255,255,0.1)" strokeWidth="1.5"
              style={{ animation:`hFade 0.5s ease ${n2.d}s both` }}/>;
          })}
          {hNodes.slice(0,show).map((n,i) => (
            <g key={i} style={{ animation:`hPop 0.65s cubic-bezier(0.22,1,0.36,1) ${n.d}s both` }}>
              <circle cx={n.x} cy={n.y} r={n.r+12}
                fill="none" stroke={n.c} strokeWidth="1" strokeOpacity="0.12"
                style={{ animation:i===0?"hRing 4s ease-in-out infinite":"none" }}/>
              <circle cx={n.x} cy={n.y} r={n.r}
                fill={`${n.c}1a`} stroke={n.c}
                strokeWidth={i===0?2.5:1.5}
                filter={i===0?"url(#hGlw)":"none"}/>
              <text x={n.x} y={n.y+1} textAnchor="middle" dominantBaseline="middle"
                fill={n.c} fontSize={i===0?12:10}
                fontFamily="'JetBrains Mono',monospace" fontWeight="700">{n.lbl}</text>
            </g>
          ))}
          <style>{`
            @keyframes hPop{from{opacity:0;transform-origin:50% 50%;transform:scale(0) rotate(-12deg)}to{opacity:1;transform:scale(1) rotate(0)}}
            @keyframes hFade{from{opacity:0}to{opacity:1}}
            @keyframes hRing{0%,100%{opacity:0.12}50%{opacity:0.38}}
          `}</style>
        </svg>
      </div>

      <div style={{ maxWidth:640, position:"relative" }}>
        <div style={{
          display:"inline-flex",alignItems:"center",gap:8,marginBottom:20,
          padding:"5px 18px",borderRadius:40,
          background:"rgba(99,102,241,0.1)",border:"1px solid rgba(99,102,241,0.25)",
          fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#818cf8",letterSpacing:"0.1em",
        }}>🌲 INTERACTIVE VISUAL GUIDE · FOR COMPLETE BEGINNERS</div>

        <h1 style={{
          margin:"0 0 18px",
          fontFamily:"'Syne',sans-serif",
          fontSize:"clamp(36px,7.5vw,76px)",
          fontWeight:800,letterSpacing:"-0.035em",lineHeight:1.02,
          background:"linear-gradient(145deg,#f8fafc 0%,#c7d2fe 35%,#38bdf8 65%,#4ade80 100%)",
          WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",
        }}>Tree Data<br/>Structures</h1>

        <p style={{
          margin:"0 auto 32px",fontFamily:"'DM Sans',sans-serif",
          fontSize:"clamp(14px,2.2vw,18px)",color:"#64748b",lineHeight:1.68,maxWidth:520,
        }}>
          Every major tree concept — animated, explained, and narrated with a <strong style={{ color:"#818cf8" }}>natural male voice</strong> at your chosen speed.
        </p>

        <div style={{ display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap" }}>
          <button onClick={onStart} style={{
            padding:"15px 36px",borderRadius:16,cursor:"pointer",
            background:"linear-gradient(135deg,#6366f1 0%,#38bdf8 100%)",
            border:"none",fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:700,
            color:"#fff",boxShadow:"0 8px 36px rgba(99,102,241,0.45)",transition:"all 0.25s",
          }}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px) scale(1.02)";e.currentTarget.style.boxShadow="0 14px 48px rgba(99,102,241,0.6)";}}
            onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="0 8px 36px rgba(99,102,241,0.45)";}}>
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

        {/* Speed selector row under hero buttons */}
        <div style={{ display:"flex",gap:6,justifyContent:"center",alignItems:"center",marginTop:20,flexWrap:"wrap" }}>
          <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#2d3748",letterSpacing:"0.08em" }}>VOICE SPEED:</span>
          {SPEED_OPTIONS.map(s => (
            <button key={s} onClick={() => { currentRate = s; }} style={{
              padding:"4px 11px",borderRadius:20,cursor:"pointer",
              background: currentRate===s ? "rgba(99,102,241,0.18)" : "rgba(255,255,255,0.04)",
              border:`1px solid ${currentRate===s ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.08)"}`,
              fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:700,
              color: currentRate===s ? "#818cf8" : "#2d3748",transition:"all 0.18s",
            }}>{s}×</button>
          ))}
        </div>

        <div style={{ display:"flex",gap:28,justifyContent:"center",marginTop:44,flexWrap:"wrap" }}>
          {[["9","Sections"],["7+","Animations"],["6","Quiz Qs"],["♂","Male Voice"]].map(([n,l]) => (
            <div key={l} style={{ textAlign:"center" }}>
              <div style={{
                fontFamily:"'Syne',sans-serif",fontSize:28,fontWeight:800,
                background:"linear-gradient(135deg,#818cf8,#38bdf8)",
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
      {/* Header */}
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

      {/* Grid — stacks on mobile */}
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
// VISUAL: Animated Binary Tree
// ═══════════════════════════════════════════════════════════════════════════════
function VisIntro() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setP(x => (x + 1) % 9), 620);
    return () => clearInterval(t);
  }, []);
  const NS = [
    {id:0,x:200,y:52, v:"A",par:null},{id:1,x:110,y:132,v:"B",par:0},
    {id:2,x:290,y:132,v:"C",par:0},{id:3,x:62, y:208,v:"D",par:1},
    {id:4,x:158,y:208,v:"E",par:1},{id:5,x:242,y:208,v:"F",par:2},
    {id:6,x:338,y:208,v:"G",par:2},{id:7,x:40, y:280,v:"H",par:3},
    {id:8,x:84, y:280,v:"I",par:3},
  ];
  const COLS = ["#818cf8","#38bdf8","#38bdf8","#4ade80","#4ade80","#4ade80","#4ade80","#f472b6","#f472b6"];
  return (
    <svg viewBox="0 0 400 312" width="100%" style={{ maxHeight:280 }}>
      <defs><filter id="vgI"><feGaussianBlur stdDeviation="5" result="b"/>
        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
      {NS.filter(n=>n.par!==null).map(n=>{
        const pr=NS[n.par];
        return <line key={n.id} x1={pr.x} y1={pr.y} x2={n.x} y2={n.y}
          stroke={`${COLS[n.id]}42`} strokeWidth="1.8"
          style={{animation:`vFd 0.6s ease ${n.id*0.09}s both`}}/>;
      })}
      {NS.map((n,i)=>{
        const ip=p===i, c=COLS[i], r=i===0?24:i<=2?20:i<=6?16:13;
        return (
          <g key={n.id} style={{animation:`vPp 0.5s cubic-bezier(0.22,1,0.36,1) ${i*0.09}s both`}}>
            {ip&&<circle cx={n.x} cy={n.y} r={r+15} fill="none" stroke={c} strokeWidth="1" strokeOpacity="0.22" style={{animation:"vRip 0.8s ease-out forwards"}}/>}
            <circle cx={n.x} cy={n.y} r={r} fill={`${c}1a`} stroke={c} strokeWidth={ip?2.5:1.5} filter={ip?"url(#vgI)":"none"} style={{transition:"all 0.3s"}}/>
            <text x={n.x} y={n.y+1} textAnchor="middle" dominantBaseline="middle" fill={c} fontSize={i===0?13:11} fontFamily="'JetBrains Mono',monospace" fontWeight="700">{n.v}</text>
          </g>
        );
      })}
      <style>{`@keyframes vPp{from{opacity:0;transform-origin:50% 50%;transform:scale(0) rotate(-14deg)}to{opacity:1;transform:scale(1) rotate(0)}}@keyframes vFd{from{opacity:0}to{opacity:1}}@keyframes vRip{from{r:18;opacity:0.5}to{r:42;opacity:0}}`}</style>
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VISUAL: Anatomy
// ═══════════════════════════════════════════════════════════════════════════════
function VisAnatomy() {
  const [hov, setHov] = useState(null);
  const LBL = [
    {id:"root",  nx:200,ny:55, lx:252,ly:40, t:"ROOT",    d:"Top node — no parent. All traversals begin here.",  c:"#818cf8"},
    {id:"edge",  nx:155,ny:95, lx:55, ly:76, t:"EDGE",    d:"Connection between two nodes.",                     c:"#38bdf8"},
    {id:"leaf",  nx:70, ny:210,lx:8,  ly:200,t:"LEAF",    d:"No children — an endpoint of the tree.",            c:"#4ade80"},
    {id:"depth", nx:120,ny:130,lx:348,ly:128,t:"DEPTH=1", d:"Number of edges from root to this node.",           c:"#fbbf24"},
    {id:"height",nx:280,ny:130,lx:348,ly:162,t:"HT=2",    d:"Longest root-to-leaf path in the whole tree.",      c:"#f97316"},
    {id:"sub",   nx:120,ny:162,lx:8,  ly:162,t:"SUBTREE", d:"A node plus all its descendants forms a subtree.",  c:"#a855f7"},
    {id:"intern",nx:120,ny:130,lx:8,  ly:130,t:"INTERNAL",d:"Has both a parent and children — middle of tree.",  c:"#34d399"},
  ];
  const ND = [{x:200,y:55,p:null},{x:120,y:130,p:0},{x:280,y:130,p:0},{x:70,y:210,p:1},{x:170,y:210,p:1},{x:235,y:210,p:2},{x:325,y:210,p:2}];
  const hL = LBL.find(l=>l.id===hov);
  return (
    <div>
      <svg viewBox="-12 10 424 238" width="100%" style={{ maxHeight:240 }}>
        {ND.filter(n=>n.p!==null).map((n,i)=>{const pr=ND[n.p];return <line key={i} x1={pr.x} y1={pr.y} x2={n.x} y2={n.y} stroke="rgba(255,255,255,0.18)" strokeWidth="1.5"/>;} )}
        <ellipse cx={120} cy={172} rx={64} ry={58} fill="rgba(168,85,247,0.07)" stroke="rgba(168,85,247,0.25)" strokeWidth="1" strokeDasharray="5,3"/>
        {ND.map((n,i)=>(
          <circle key={i} cx={n.x} cy={n.y} r={i===0?23:18}
            fill={i===0?"rgba(129,140,248,0.22)":i>=3?"rgba(74,222,128,0.12)":"rgba(56,189,248,0.1)"}
            stroke={i===0?"#818cf8":i>=3?"#4ade80":"#38bdf8"} strokeWidth="1.5"/>
        ))}
        {ND.slice(0,3).map((n,i)=>(
          <text key={i} x={n.x} y={n.y+1} textAnchor="middle" dominantBaseline="middle"
            fill={i===0?"#818cf8":"#38bdf8"} fontSize={i===0?12:10} fontFamily="'JetBrains Mono',monospace" fontWeight="700">
            {i===0?"R":"N"}
          </text>
        ))}
        {ND.slice(3).map((n,i)=>(
          <text key={i} x={n.x} y={n.y+1} textAnchor="middle" dominantBaseline="middle" fill="#4ade80" fontSize="10" fontFamily="'JetBrains Mono',monospace" fontWeight="700">L</text>
        ))}
        {LBL.map(l=>(
          <g key={l.id} onMouseEnter={()=>setHov(l.id)} onMouseLeave={()=>setHov(null)} style={{cursor:"default"}}>
            <line x1={l.nx} y1={l.ny} x2={l.lx} y2={l.ly} stroke={hov===l.id?l.c:"rgba(255,255,255,0.1)"} strokeWidth={hov===l.id?1.5:1} strokeDasharray="4,3" style={{transition:"stroke 0.2s"}}/>
            <text x={l.lx} y={l.ly} fill={hov===l.id?l.c:"#3d4860"} fontSize="9" fontFamily="'JetBrains Mono',monospace" fontWeight="700" style={{transition:"fill 0.22s"}}>{l.t}</text>
          </g>
        ))}
      </svg>
      <div style={{
        minHeight:36,padding:"7px 12px",borderRadius:10,marginTop:4,
        background:hov?`${hL?.c}10`:"rgba(255,255,255,0.02)",
        border:`1px solid ${hov?hL?.c+"32":"rgba(255,255,255,0.06)"}`,
        transition:"all 0.25s",
      }}>
        {hov
          ? <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:12.5,color:"#94a3b8",lineHeight:1.5,margin:0}}>
              <span style={{color:hL?.c,fontWeight:700}}>{hL?.t}</span> — {hL?.d}
            </p>
          : <p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#253046",letterSpacing:"0.08em",margin:0}}>HOVER LABELS TO LEARN EACH TERM</p>
        }
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VISUAL: Tree Types
// ═══════════════════════════════════════════════════════════════════════════════
function VisTypes() {
  const [tab, setTab] = useState(0);
  const TYPES = [
    { nm:"General",  ic:"🌳", c:"#4ade80", desc:"Any node can have any number of children. No restriction.",
      nodes:[[140,30,22],[80,90,17],[200,90,17],[40,165,13],[110,165,13],[170,165,13],[230,165,13]],
      edges:[[140,30,80,90],[140,30,200,90],[80,90,40,165],[80,90,110,165],[200,90,170,165],[200,90,230,165]] },
    { nm:"Binary",   ic:"⑂",  c:"#38bdf8", desc:"Each node has at most 2 children: left and right.",
      nodes:[[140,30,22],[80,100,17],[200,100,17],[50,170,13],[110,170,13],[175,170,13],[225,170,13]],
      edges:[[140,30,80,100],[140,30,200,100],[80,100,50,170],[80,100,110,170],[200,100,175,170],[200,100,225,170]] },
    { nm:"Full",     ic:"✦",  c:"#818cf8", desc:"Every node has exactly 0 or 2 children — never 1.",
      nodes:[[140,30,22],[80,100,17],[200,100,17],[50,170,13],[110,170,13],[170,170,13],[230,170,13]],
      edges:[[140,30,80,100],[140,30,200,100],[80,100,50,170],[80,100,110,170],[200,100,170,170],[200,100,230,170]] },
    { nm:"Complete", ic:"▦",  c:"#fbbf24", desc:"All levels filled except possibly last, which fills left→right.",
      nodes:[[140,30,22],[80,100,17],[200,100,17],[50,170,13],[110,170,13],[170,170,13]],
      edges:[[140,30,80,100],[140,30,200,100],[80,100,50,170],[80,100,110,170],[200,100,170,170]] },
  ];
  const T = TYPES[tab];
  return (
    <div>
      <div style={{ display:"flex",gap:5,marginBottom:10,flexWrap:"wrap" }}>
        {TYPES.map((ty,i)=>(
          <button key={i} onClick={()=>setTab(i)} style={{
            padding:"5px 10px",borderRadius:20,cursor:"pointer",
            background:tab===i?`${ty.c}1c`:"rgba(255,255,255,0.04)",
            border:`1px solid ${tab===i?`${ty.c}55`:"rgba(255,255,255,0.08)"}`,
            fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:700,
            color:tab===i?ty.c:"#475569",transition:"all 0.2s",
          }}>{ty.ic} {ty.nm}</button>
        ))}
      </div>
      <div style={{ padding:12,borderRadius:14,background:`${T.c}09`,border:`1px solid ${T.c}22` }}>
        <svg viewBox="0 0 280 200" width="100%" style={{ maxHeight:185 }}>
          {T.edges.map(([x1,y1,x2,y2],i)=>(
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={`${T.c}50`} strokeWidth="1.5"/>
          ))}
          {T.nodes.map(([x,y,r],i)=>(
            <g key={`${tab}-${i}`} style={{animation:`vPp 0.4s cubic-bezier(0.22,1,0.36,1) ${i*0.07}s both`}}>
              <circle cx={x} cy={y} r={r} fill={`${T.c}18`} stroke={T.c} strokeWidth={i===0?2:1.5}/>
              {i===0&&<text x={x} y={y+1} textAnchor="middle" dominantBaseline="middle" fill={T.c} fontSize="11" fontFamily="'JetBrains Mono',monospace" fontWeight="700">R</text>}
            </g>
          ))}
          {tab===3&&<circle cx={230} cy={170} r={13} fill="none" stroke={`${T.c}2a`} strokeWidth="1" strokeDasharray="4,3"/>}
          <style>{`@keyframes vPp{from{opacity:0;transform-origin:50% 50%;transform:scale(0)}to{opacity:1;transform:scale(1)}}`}</style>
        </svg>
        <p style={{ textAlign:"center",fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#94a3b8",margin:"6px 0 0" }}>
          <span style={{color:T.c,fontWeight:700}}>{T.nm} Tree</span> — {T.desc}
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VISUAL: BST
// ═══════════════════════════════════════════════════════════════════════════════
function VisBST() {
  const [mode, setMode] = useState("insert");
  const [step, setStep] = useState(0);
  const [sPath, setSPath] = useState([]);
  const [sTarget, setSTarget] = useState(null);
  const [found, setFound] = useState(null);
  const seq = [50,30,70,20,40,60,80];
  const ND = [
    {id:0,x:200,y:55, v:50,par:null},{id:1,x:120,y:130,v:30,par:0},
    {id:2,x:280,y:130,v:70,par:0},{id:3,x:75, y:210,v:20,par:1},
    {id:4,x:165,y:210,v:40,par:1},{id:5,x:235,y:210,v:60,par:2},
    {id:6,x:325,y:210,v:80,par:2},
  ];
  const SPATHS = {40:[0,1,4],60:[0,2,5],20:[0,1,3],80:[0,2,6]};
  const tmr = useRef();
  useEffect(()=>{
    if(mode!=="insert"){clearInterval(tmr.current);return;}
    tmr.current=setInterval(()=>setStep(s=>(s+1)%(seq.length+2)),1100);
    return()=>clearInterval(tmr.current);
  },[mode]);
  const search=v=>{
    setSTarget(v);setSPath([]);setFound(null);
    const path=SPATHS[v]||[];
    path.forEach((id,i)=>setTimeout(()=>{
      setSPath(p=>[...p,id]);
      if(i===path.length-1)setFound(id);
    },i*700));
  };
  const ins=mode==="insert"?Math.min(step,seq.length):seq.length;
  const cmp=mode==="insert"&&step>0&&step<=seq.length?step-1:-1;
  const vis=ND.filter(n=>n.id<ins);
  return (
    <div>
      <div style={{display:"flex",gap:6,justifyContent:"center",marginBottom:10}}>
        {[["insert","▶ WATCH INSERT"],["search","🔍 SEARCH"]].map(([m,lbl])=>(
          <button key={m} onClick={()=>{setMode(m);setSPath([]);setFound(null);setSTarget(null);}} style={{
            padding:"5px 14px",borderRadius:20,cursor:"pointer",
            background:mode===m?"rgba(6,182,212,0.2)":"rgba(255,255,255,0.04)",
            border:`1px solid ${mode===m?"#06b6d4":"rgba(255,255,255,0.1)"}`,
            fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:700,
            color:mode===m?"#06b6d4":"#475569",transition:"all 0.2s",
          }}>{lbl}</button>
        ))}
      </div>
      {mode==="insert"&&<div style={{textAlign:"center",marginBottom:6,fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#64748b"}}>
        INSERTING:{step>0&&step<=seq.length?<span style={{color:"#4ade80",fontWeight:700}}> {seq[step-1]}</span>:" ..."}
      </div>}
      {mode==="search"&&(
        <div style={{display:"flex",gap:5,justifyContent:"center",marginBottom:8,flexWrap:"wrap"}}>
          <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#64748b",alignSelf:"center"}}>FIND:</span>
          {[40,60,20,80].map(v=>(
            <button key={v} onClick={()=>search(v)} style={{
              padding:"4px 12px",borderRadius:20,cursor:"pointer",
              background:sTarget===v&&sPath.length?"rgba(6,182,212,0.2)":"rgba(255,255,255,0.04)",
              border:`1px solid ${sTarget===v&&sPath.length?"#06b6d4":"rgba(255,255,255,0.1)"}`,
              fontFamily:"'JetBrains Mono',monospace",fontSize:10,fontWeight:700,
              color:sTarget===v&&sPath.length?"#06b6d4":"#475569",transition:"all 0.2s",
            }}>{v}</button>
          ))}
        </div>
      )}
      <svg viewBox="0 0 400 262" width="100%" style={{maxHeight:248}}>
        <defs><filter id="bGlw"><feGaussianBlur stdDeviation="4" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
        {vis.filter(n=>n.par!==null&&n.par<ins).map(n=>{
          const pr=ND[n.par];
          const se=mode==="search"&&sPath.includes(n.id)&&sPath.includes(n.par);
          return <line key={n.id} x1={pr.x} y1={pr.y} x2={n.x} y2={n.y}
            stroke={se?"#06b6d4":"rgba(255,255,255,0.12)"} strokeWidth={se?2.5:1.5}
            style={{transition:"stroke 0.3s",animation:"vFd 0.4s ease"}}/>;
        })}
        {vis.map(n=>{
          const iC=mode==="insert"&&n.id===cmp;
          const iSN=mode==="search"&&sPath.includes(n.id);
          const iF=mode==="search"&&found===n.id;
          const col=iF?"#4ade80":iSN?"#06b6d4":iC?"#4ade80":n.par===null?"#818cf8":"#38bdf8";
          return (
            <g key={n.id} style={{animation:"bstP 0.5s cubic-bezier(0.22,1,0.36,1) both"}}>
              {(iC||iF)&&<circle cx={n.x} cy={n.y} r={32} fill="none" stroke={col} strokeWidth="1" strokeOpacity="0.3" style={{animation:"vRip 0.8s ease-out forwards"}}/>}
              <circle cx={n.x} cy={n.y} r={20} fill={`${col}20`} stroke={col} strokeWidth={(iC||iF)?2.5:1.5} filter={(iC||iF)?"url(#bGlw)":"none"} style={{transition:"all 0.3s"}}/>
              <text x={n.x} y={n.y+1} textAnchor="middle" dominantBaseline="middle" fill={col} fontSize="12" fontFamily="'JetBrains Mono',monospace" fontWeight="700">{n.v}</text>
            </g>
          );
        })}
        {mode==="insert"&&step>1&&<text x={160} y={95} fill="rgba(248,113,113,0.72)" fontSize="9" fontFamily="'JetBrains Mono',monospace">{"< 50 → LEFT"}</text>}
        {mode==="insert"&&step>2&&<text x={222} y={95} fill="rgba(74,222,128,0.72)" fontSize="9" fontFamily="'JetBrains Mono',monospace">{"> 50 → RIGHT"}</text>}
        {mode==="search"&&found!==null&&(
          <text x={200} y={252} textAnchor="middle" fill="#4ade80" fontSize="10" fontFamily="'JetBrains Mono',monospace">✓ Found {sTarget} in {SPATHS[sTarget]?.length} comparisons</text>
        )}
        <style>{`@keyframes bstP{from{opacity:0;transform-origin:50% 50%;transform:scale(0.2)}to{opacity:1;transform:scale(1)}}@keyframes vRip{from{r:22;opacity:0.5}to{r:40;opacity:0}}@keyframes vFd{from{opacity:0}to{opacity:1}}`}</style>
      </svg>
      {mode==="insert"&&(
        <div style={{display:"flex",gap:5,justifyContent:"center",flexWrap:"wrap",marginTop:4}}>
          {seq.map((v,i)=>(
            <div key={i} style={{
              width:32,height:32,borderRadius:8,transition:"all 0.3s",
              background:i<Math.min(step,seq.length)?"rgba(6,182,212,0.2)":"rgba(255,255,255,0.04)",
              border:`1px solid ${i===step-1?"#06b6d4":i<step?"rgba(6,182,212,0.35)":"rgba(255,255,255,0.1)"}`,
              display:"flex",alignItems:"center",justifyContent:"center",
              fontFamily:"'JetBrains Mono',monospace",fontSize:11,fontWeight:700,
              color:i<Math.min(step,seq.length)?"#06b6d4":"#475569",
            }}>{v}</div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VISUAL: AVL
// ═══════════════════════════════════════════════════════════════════════════════
function VisAVL() {
  const [ph, setPh] = useState(0);
  const [auto, setAuto] = useState(true);
  useEffect(()=>{
    if(!auto)return;
    const t=setInterval(()=>setPh(p=>(p+1)%3),2300);
    return()=>clearInterval(t);
  },[auto]);
  const SC = [
    {tag:"⚠ UNBALANCED",col:"#ef4444",
     nodes:[{x:200,y:55,v:1,bf:"+2",bc:"#ef4444"},{x:280,y:130,v:2,bf:"+1",bc:"#f97316"},{x:340,y:200,v:3,bf:"0",bc:"#4ade80"}],
     edges:[[0,1],[1,2]],note:"Height diff > 1 at root — left rotation needed"},
    {tag:"⟳ ROTATING",col:"#fbbf24",
     nodes:[{x:200,y:55,v:1,bf:"+2",bc:"#ef4444"},{x:280,y:130,v:2,bf:"+1",bc:"#f97316"},{x:340,y:200,v:3,bf:"0",bc:"#4ade80"}],
     edges:[[0,1],[1,2]],note:"Performing left rotation around node 1…"},
    {tag:"✓ BALANCED",col:"#4ade80",
     nodes:[{x:200,y:55,v:2,bf:"0",bc:"#4ade80"},{x:120,y:130,v:1,bf:"0",bc:"#4ade80"},{x:280,y:130,v:3,bf:"0",bc:"#4ade80"}],
     edges:[[0,1],[0,2]],note:"All balance factors = 0 · search O(log n) guaranteed"},
  ];
  const S=SC[ph];
  return (
    <div>
      <div style={{display:"flex",gap:5,justifyContent:"center",marginBottom:10,flexWrap:"wrap",alignItems:"center"}}>
        {SC.map((s,i)=>(
          <button key={i} onClick={()=>{setPh(i);setAuto(false);}} style={{
            padding:"4px 10px",borderRadius:20,cursor:"pointer",
            background:ph===i?`${s.col}18`:"rgba(255,255,255,0.03)",
            border:`1px solid ${ph===i?s.col+"45":"rgba(255,255,255,0.08)"}`,
            fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:700,
            color:ph===i?s.col:"#475569",transition:"all 0.2s",
          }}>{s.tag}</button>
        ))}
        <button onClick={()=>setAuto(true)} style={{padding:"4px 9px",borderRadius:20,cursor:"pointer",background:auto?"rgba(255,255,255,0.06)":"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.1)",fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#475569"}}>AUTO</button>
      </div>
      <svg viewBox="0 0 400 252" width="100%" style={{maxHeight:238}}>
        <defs>
          <marker id="avlArr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#fbbf24"/>
          </marker>
        </defs>
        {S.edges.map(([a,b],i)=>(
          <line key={i} x1={S.nodes[a].x} y1={S.nodes[a].y} x2={S.nodes[b].x} y2={S.nodes[b].y}
            stroke={ph===2?"#4ade80":"rgba(255,255,255,0.2)"} strokeWidth="2"
            strokeDasharray={ph===1?"6,4":"none"} style={{transition:"all 0.7s"}}/>
        ))}
        {ph===1&&<path d="M 265 94 Q 210 140 157 114" fill="none" stroke="#fbbf24" strokeWidth="2.5" markerEnd="url(#avlArr)" strokeDasharray="6,3" style={{animation:"avlDash 1s linear infinite"}}/>}
        {S.nodes.map((n,i)=>(
          <g key={`${ph}-${i}`} style={{animation:"avlPp 0.45s cubic-bezier(0.22,1,0.36,1) both"}}>
            <circle cx={n.x} cy={n.y} r={25}
              fill={ph===2?"rgba(74,222,128,0.14)":i===0&&ph===0?"rgba(239,68,68,0.18)":"rgba(255,255,255,0.055)"}
              stroke={ph===2?"#4ade80":i===0&&ph===0?"#ef4444":"rgba(255,255,255,0.28)"}
              strokeWidth="2" style={{transition:"all 0.6s"}}/>
            <text x={n.x} y={n.y+1} textAnchor="middle" dominantBaseline="middle"
              fill={ph===2?"#4ade80":"#f1f5f9"} fontSize="14" fontFamily="'JetBrains Mono',monospace" fontWeight="700">{n.v}</text>
            <text x={n.x+34} y={n.y-17} fill={n.bc} fontSize="10" fontFamily="'JetBrains Mono',monospace" fontWeight="700">bf={n.bf}</text>
          </g>
        ))}
        <text x={200} y={240} textAnchor="middle" fill={S.col} fontSize="10" fontFamily="'JetBrains Mono',monospace">{S.note}</text>
        <style>{`@keyframes avlPp{from{opacity:0;transform-origin:50% 50%;transform:scale(0.4)}to{opacity:1;transform:scale(1)}}@keyframes avlDash{to{stroke-dashoffset:-18}}`}</style>
      </svg>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginTop:8}}>
        {[["Left Rot","RR case","#06b6d4"],["Right Rot","LL case","#818cf8"],["Left-Right","LR case","#fbbf24"],["Right-Left","RL case","#f97316"]].map(([r,c,col])=>(
          <div key={r} style={{padding:"6px 10px",borderRadius:8,background:`${col}0d`,border:`1px solid ${col}22`}}>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:700,color:col}}>{r}</div>
            <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:"#475569",marginTop:2}}>{c}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VISUAL: Heap
// ═══════════════════════════════════════════════════════════════════════════════
function VisHeap() {
  const [type,setType]=useState("max");
  const [hl,setHl]=useState([]);
  const [busy,setBusy]=useState(false);
  const MAX=[
    {id:0,x:200,y:50, v:90,par:null},{id:1,x:120,y:130,v:70,par:0},{id:2,x:280,y:130,v:80,par:0},
    {id:3,x:75, y:210,v:50,par:1},{id:4,x:165,y:210,v:60,par:1},{id:5,x:235,y:210,v:65,par:2},{id:6,x:325,y:210,v:75,par:2},
  ];
  const MIN=MAX.map(n=>({...n,v:100-n.v}));
  const ND=type==="max"?MAX:MIN;
  const col=type==="max"?"#f97316":"#38bdf8";
  const heapify=()=>{
    setBusy(true);setHl([]);
    [6,2,0].forEach((id,i)=>setTimeout(()=>setHl([id]),i*600));
    setTimeout(()=>{setHl([]);setBusy(false);},2300);
  };
  return (
    <div>
      <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:10,flexWrap:"wrap",alignItems:"center"}}>
        {["max","min"].map(t=>(
          <button key={t} onClick={()=>setType(t)} style={{
            padding:"5px 16px",borderRadius:20,cursor:"pointer",
            background:type===t?`${col}20`:"rgba(255,255,255,0.04)",
            border:`1px solid ${type===t?col:"rgba(255,255,255,0.1)"}`,
            fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:700,
            color:type===t?col:"#475569",transition:"all 0.3s",
          }}>{t.toUpperCase()} HEAP</button>
        ))}
        <button onClick={heapify} disabled={busy} style={{
          padding:"5px 14px",borderRadius:20,cursor:busy?"default":"pointer",
          background:busy?"rgba(255,255,255,0.02)":"rgba(255,255,255,0.06)",
          border:"1px solid rgba(255,255,255,0.1)",
          fontFamily:"'JetBrains Mono',monospace",fontSize:9,
          color:busy?"#2d3748":"#94a3b8",
        }}>{busy?"HEAPIFYING...":"⬆ HEAPIFY"}</button>
      </div>
      <svg viewBox="0 0 400 252" width="100%" style={{maxHeight:238}}>
        {ND.filter(n=>n.par!==null).map(n=>{
          const pr=ND[n.par];
          const isH=hl.includes(n.id)&&hl.includes(n.par);
          return <line key={n.id} x1={pr.x} y1={pr.y} x2={n.x} y2={n.y} stroke={isH?col:`${col}38`} strokeWidth={isH?2.5:1.5} style={{transition:"stroke 0.3s"}}/>;
        })}
        {ND.map((n,i)=>{
          const iR=n.par===null, isH=hl.includes(n.id);
          return (
            <g key={`${type}-${n.id}`} style={{animation:`hpIn 0.4s cubic-bezier(0.22,1,0.36,1) ${i*0.06}s both`}}>
              {iR&&<circle cx={n.x} cy={n.y} r={36} fill="none" stroke={col} strokeWidth="1" strokeOpacity="0.2" strokeDasharray="5,3" style={{animation:"hpSpin 10s linear infinite"}}/>}
              {isH&&<circle cx={n.x} cy={n.y} r={30} fill="none" stroke={col} strokeWidth="1.5" strokeOpacity="0.4" style={{animation:"vRip 0.8s ease-out forwards"}}/>}
              <circle cx={n.x} cy={n.y} r={iR?25:20} fill={isH?`${col}35`:iR?`${col}28`:`${col}0e`} stroke={isH?col:iR?col:`${col}72`} strokeWidth={iR?2.5:1.5} style={{transition:"all 0.35s"}}/>
              <text x={n.x} y={n.y+1} textAnchor="middle" dominantBaseline="middle" fill={iR?col:"#cbd5e1"} fontSize={iR?14:12} fontFamily="'JetBrains Mono',monospace" fontWeight="700">{n.v}</text>
            </g>
          );
        })}
        <text x={200} y={244} textAnchor="middle" fill="#2d3748" fontSize="9" fontFamily="'JetBrains Mono',monospace">Array: [{ND.map(n=>n.v).join(", ")}]</text>
        <style>{`@keyframes hpIn{from{opacity:0;transform-origin:50% 50%;transform:scale(0)}to{opacity:1;transform:scale(1)}}@keyframes hpSpin{to{transform-origin:50% 50%;transform:rotate(360deg)}}@keyframes vRip{from{r:22;opacity:0.5}to{r:38;opacity:0}}`}</style>
      </svg>
      <div style={{padding:"8px 14px",borderRadius:10,marginTop:6,background:`${col}0e`,border:`1px solid ${col}28`,fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:col,textAlign:"center"}}>
        {type==="max"?"Parent ≥ Children · Max at root O(1) · Perfect for priority queues":"Parent ≤ Children · Min at root O(1) · Powers Dijkstra & A* algorithms"}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VISUAL: Trie
// ═══════════════════════════════════════════════════════════════════════════════
function VisTrie() {
  const [typed,setTyped]=useState("");
  const [val,setVal]=useState("");
  const WORDS=["cat","car","cake","cap","dog","done"];
  const TN=[
    {id:"root",x:200,y:35, lbl:"∅",par:null},{id:"c",x:130,y:105,lbl:"c",par:"root"},
    {id:"d",x:265,y:105,lbl:"d",par:"root"},{id:"ca",x:90, y:175,lbl:"a",par:"c"},
    {id:"co",x:170,y:175,lbl:"o",par:"c"},{id:"do",x:240,y:175,lbl:"o",par:"d"},
    {id:"dn",x:310,y:175,lbl:"n",par:"d"},{id:"cat",x:55, y:245,lbl:"t✓",par:"ca"},
    {id:"car",x:100,y:245,lbl:"r✓",par:"ca"},{id:"cak",x:145,y:245,lbl:"k",par:"ca"},
    {id:"cap",x:190,y:245,lbl:"p✓",par:"ca"},{id:"dog",x:240,y:245,lbl:"g✓",par:"do"},
    {id:"don",x:310,y:245,lbl:"e✓",par:"dn"},
  ];
  const NM=Object.fromEntries(TN.map(n=>[n.id,n]));
  const CM={root:{c:"c",d:"d"},c:{a:"ca",o:"co"},d:{o:"do",n:"dn"},ca:{t:"cat",r:"car",k:"cak",p:"cap"},do:{g:"dog"},dn:{e:"don"}};
  const hlSet=new Set();
  if(typed){
    hlSet.add("root");let cur="root";
    for(const ch of typed){const nxt=CM[cur]?.[ch];if(nxt){hlSet.add(nxt);cur=nxt;}else break;}
  }
  const matches=WORDS.filter(w=>w.startsWith(typed)&&typed.length>0);
  return (
    <div>
      <div style={{display:"flex",gap:5,alignItems:"center",justifyContent:"center",marginBottom:10,flexWrap:"wrap"}}>
        <div style={{display:"flex",alignItems:"center",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(168,85,247,0.3)",borderRadius:20,overflow:"hidden"}}>
          <span style={{padding:"5px 10px",fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#475569"}}>TYPE</span>
          <input value={val} onChange={e=>{setVal(e.target.value);setTyped(e.target.value);}} placeholder="ca..." maxLength={4}
            style={{background:"none",border:"none",outline:"none",fontFamily:"'JetBrains Mono',monospace",fontSize:12,fontWeight:700,color:"#a855f7",width:55,padding:"5px 10px 5px 0"}}/>
        </div>
        {["c","ca","car","dog",""].map((w,i)=>(
          <button key={i} onClick={()=>{setTyped(w);setVal(w);}} style={{
            padding:"4px 9px",borderRadius:20,cursor:"pointer",
            background:typed===w?"rgba(168,85,247,0.2)":"rgba(255,255,255,0.04)",
            border:`1px solid ${typed===w?"#a855f7":"rgba(255,255,255,0.1)"}`,
            fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:700,
            color:typed===w?"#a855f7":"#475569",transition:"all 0.2s",
          }}>{w||"CLR"}</button>
        ))}
      </div>
      <svg viewBox="0 0 380 272" width="100%" style={{maxHeight:260}}>
        {TN.filter(n=>n.par).map(n=>{
          const pr=NM[n.par], hl=hlSet.has(n.id)&&hlSet.has(n.par);
          return <line key={n.id} x1={pr.x} y1={pr.y} x2={n.x} y2={n.y} stroke={hl?"#a855f7":"rgba(255,255,255,0.1)"} strokeWidth={hl?2.5:1} style={{transition:"all 0.3s"}}/>;
        })}
        {TN.map(n=>{
          const hl=hlSet.has(n.id), isE=n.lbl.includes("✓"), isR=n.id==="root";
          const r=isR?18:isE?15:13;
          return (
            <g key={n.id}>
              {hl&&<circle cx={n.x} cy={n.y} r={r+10} fill="none" stroke="#a855f7" strokeWidth="1" strokeOpacity="0.25" style={{animation:"vRip 0.7s ease-out forwards"}}/>}
              <circle cx={n.x} cy={n.y} r={r} fill={hl?"rgba(168,85,247,0.3)":isE?"rgba(74,222,128,0.12)":"rgba(255,255,255,0.04)"} stroke={hl?"#a855f7":isE?"#4ade80":"rgba(255,255,255,0.14)"} strokeWidth={hl?2.5:1.5} style={{transition:"all 0.3s"}}/>
              <text x={n.x} y={n.y+1} textAnchor="middle" dominantBaseline="middle" fill={hl?"#a855f7":isE?"#4ade80":"#5a6b84"} fontSize="10" fontFamily="'JetBrains Mono',monospace" fontWeight="700">{n.lbl}</text>
            </g>
          );
        })}
      </svg>
      {matches.length>0?(
        <div style={{display:"flex",gap:5,justifyContent:"center",flexWrap:"wrap",marginTop:5}}>
          <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#475569",alignSelf:"center"}}>AUTOCOMPLETE:</span>
          {matches.map(w=>(<span key={w} style={{padding:"3px 12px",borderRadius:20,background:"rgba(168,85,247,0.15)",border:"1px solid rgba(168,85,247,0.3)",fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#a855f7",fontWeight:700}}>{w}</span>))}
        </div>
      ):(
        <p style={{textAlign:"center",fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#1e2a38",marginTop:8}}>TYPE A PREFIX TO SEE AUTOCOMPLETE IN ACTION</p>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VISUAL: Traversal
// ═══════════════════════════════════════════════════════════════════════════════
function VisTraversal() {
  const [mode,setMode]=useState("inorder");
  const [step,setStep]=useState(0);
  const [play,setPlay]=useState(false);
  const ND=[
    {id:0,x:200,y:55, v:4,par:null},{id:1,x:120,y:130,v:2,par:0},{id:2,x:280,y:130,v:6,par:0},
    {id:3,x:75, y:210,v:1,par:1},{id:4,x:165,y:210,v:3,par:1},{id:5,x:235,y:210,v:5,par:2},{id:6,x:325,y:210,v:7,par:2},
  ];
  const ORDS={
    inorder:  {sq:[3,1,4,0,5,2,6],c:"#38bdf8",d:"L→Root→R = sorted output for BST!"},
    preorder: {sq:[0,1,3,4,2,5,6],c:"#a855f7",d:"Root→L→R = copy / serialize tree"},
    postorder:{sq:[3,4,1,5,6,2,0],c:"#f97316",d:"L→R→Root = safe deletion order"},
    bfs:      {sq:[0,1,2,3,4,5,6],c:"#4ade80",d:"Level by level = Breadth-First Search"},
  };
  const CUR=ORDS[mode];
  const visited=new Set(CUR.sq.slice(0,step));
  useEffect(()=>{
    if(!play)return;
    if(step>=CUR.sq.length){setPlay(false);return;}
    const t=setTimeout(()=>setStep(s=>s+1),720);
    return()=>clearTimeout(t);
  },[play,step,CUR]);
  const reset=()=>{setStep(0);setPlay(false);};
  return (
    <div>
      <div style={{display:"flex",gap:5,justifyContent:"center",marginBottom:8,flexWrap:"wrap"}}>
        {Object.entries(ORDS).map(([m,o])=>(
          <button key={m} onClick={()=>{setMode(m);reset();}} style={{
            padding:"4px 9px",borderRadius:20,cursor:"pointer",
            background:mode===m?`${o.c}1c`:"rgba(255,255,255,0.04)",
            border:`1px solid ${mode===m?o.c:"rgba(255,255,255,0.1)"}`,
            fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:700,
            color:mode===m?o.c:"#475569",transition:"all 0.2s",
          }}>{m.toUpperCase()}</button>
        ))}
      </div>
      <svg viewBox="0 0 400 248" width="100%" style={{maxHeight:234}}>
        {ND.filter(n=>n.par!==null).map(n=>{const pr=ND[n.par];return <line key={n.id} x1={pr.x} y1={pr.y} x2={n.x} y2={n.y} stroke="rgba(255,255,255,0.1)" strokeWidth="1.5"/>;} )}
        {ND.map(n=>{
          const isV=visited.has(n.id), isC=CUR.sq[step-1]===n.id, ord=CUR.sq.indexOf(n.id);
          return (
            <g key={n.id}>
              {isC&&<circle cx={n.x} cy={n.y} r={34} fill="none" stroke={CUR.c} strokeWidth="1.5" strokeOpacity="0.3" style={{animation:"vRip 0.75s ease-out forwards"}}/>}
              <circle cx={n.x} cy={n.y} r={20} fill={isC?`${CUR.c}35`:isV?`${CUR.c}12`:"rgba(255,255,255,0.05)"} stroke={isC?CUR.c:isV?`${CUR.c}72`:"rgba(255,255,255,0.14)"} strokeWidth={isC?2.5:1.5} style={{transition:"all 0.35s"}}/>
              {isV&&<text x={n.x+26} y={n.y-14} fill={CUR.c} fontSize="10" fontFamily="'JetBrains Mono',monospace" fontWeight="700">{ord+1}</text>}
              <text x={n.x} y={n.y+1} textAnchor="middle" dominantBaseline="middle" fill={isC?CUR.c:isV?"#94a3b8":"#e2e8f0"} fontSize="13" fontFamily="'JetBrains Mono',monospace" fontWeight="700">{n.v}</text>
            </g>
          );
        })}
        <style>{`@keyframes vRip{from{r:22;opacity:0.5}to{r:42;opacity:0}}`}</style>
      </svg>
      <div style={{display:"flex",gap:4,justifyContent:"center",flexWrap:"wrap",margin:"6px 0"}}>
        {CUR.sq.map((nid,i)=>(
          <div key={i} style={{
            width:28,height:28,borderRadius:6,transition:"all 0.3s",
            background:i<step?`${CUR.c}1c`:"rgba(255,255,255,0.03)",
            border:`1px solid ${i===step-1?CUR.c:i<step?`${CUR.c}48`:"rgba(255,255,255,0.07)"}`,
            display:"flex",alignItems:"center",justifyContent:"center",
            fontFamily:"'JetBrains Mono',monospace",fontSize:11,fontWeight:700,
            color:i<step?CUR.c:"#1a2030",
          }}>{ND[nid].v}</div>
        ))}
      </div>
      <p style={{textAlign:"center",fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:CUR.c,margin:"0 0 8px"}}>{CUR.d}</p>
      <div style={{display:"flex",gap:8,justifyContent:"center"}}>
        <button onClick={reset} style={{padding:"5px 14px",borderRadius:20,cursor:"pointer",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#475569"}}>↺ RESET</button>
        <button onClick={play?()=>setPlay(false):()=>{if(step>=CUR.sq.length)setStep(0);setPlay(true);}} style={{padding:"5px 18px",borderRadius:20,cursor:"pointer",background:`${CUR.c}1c`,border:`1px solid ${CUR.c}62`,fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:700,color:CUR.c}}>
          {play?"⏸ PAUSE":step>=CUR.sq.length?"↺ REPLAY":"▶ PLAY"}
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPLEXITY TABLE
// ═══════════════════════════════════════════════════════════════════════════════
function ComplexityTable() {
  const [hov,setHov]=useState(null);
  const rows=[
    {nm:"Binary Tree",   c:"#818cf8",s:"O(n)",     i:"O(n)",     d:"O(n)",     n:"No ordering — must scan all nodes"},
    {nm:"BST (balanced)",c:"#06b6d4",s:"O(log n)", i:"O(log n)", d:"O(log n)", n:"Ordered + balanced = fast always"},
    {nm:"BST (skewed)",  c:"#ef4444",s:"O(n)",     i:"O(n)",     d:"O(n)",     n:"Sorted input → degrades to linked list"},
    {nm:"AVL Tree",      c:"#4ade80",s:"O(log n)", i:"O(log n)", d:"O(log n)", n:"Guaranteed balance — always O(log n)"},
    {nm:"Max/Min Heap",  c:"#f97316",s:"O(n)",     i:"O(log n)", d:"O(log n)", n:"Min/Max at root O(1) · array-backed"},
    {nm:"Trie",          c:"#a855f7",s:"O(m)",     i:"O(m)",     d:"O(m)",     n:"m=word length · n-independent search"},
  ];
  return (
    <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
      <table style={{width:"100%",borderCollapse:"collapse",minWidth:480}}>
        <thead>
          <tr>{["Structure","Search","Insert","Delete","Notes"].map(h=>(
            <th key={h} style={{padding:"10px 14px",textAlign:"left",fontFamily:"'JetBrains Mono',monospace",fontSize:9,letterSpacing:"0.1em",color:"#2d3748",borderBottom:"1px solid rgba(255,255,255,0.06)",fontWeight:700,whiteSpace:"nowrap"}}>{h}</th>
          ))}</tr>
        </thead>
        <tbody>
          {rows.map((r,i)=>(
            <tr key={i} onMouseEnter={()=>setHov(i)} onMouseLeave={()=>setHov(null)}
              style={{borderBottom:"1px solid rgba(255,255,255,0.04)",background:hov===i?"rgba(255,255,255,0.028)":"transparent",transition:"background 0.2s"}}>
              <td style={{padding:"10px 14px",whiteSpace:"nowrap"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{width:7,height:7,borderRadius:"50%",background:r.c,flexShrink:0,boxShadow:hov===i?`0 0 8px ${r.c}`:"none",transition:"box-shadow 0.2s"}}/>
                  <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,fontWeight:700,color:"#e2e8f0"}}>{r.nm}</span>
                </div>
              </td>
              {[r.s,r.i,r.d].map((v,j)=>(
                <td key={j} style={{padding:"10px 14px",fontFamily:"'JetBrains Mono',monospace",fontSize:11,fontWeight:v.includes("log")||v==="O(m)"?700:400,color:v.includes("log")||v==="O(m)"?"#4ade80":"#ef4444",whiteSpace:"nowrap"}}>{v}</td>
              ))}
              <td style={{padding:"10px 14px",fontFamily:"'DM Sans',sans-serif",fontSize:11,color:"#475569"}}>{r.n}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// KEYBOARD SHORTCUTS HELP MODAL
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
        background:"rgba(8,12,24,0.98)", border:"1px solid rgba(99,102,241,0.35)",
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
            <kbd style={{ background:"rgba(99,102,241,0.15)", border:"1px solid rgba(99,102,241,0.35)", borderRadius:6, padding:"3px 10px", fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:"#818cf8", fontWeight:700 }}>{k}</kbd>
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
    {q:"Which BST traversal ALWAYS produces sorted output?",opts:["Pre-order","In-order","Post-order","Level-order"],ans:1,exp:"In-order (L→Root→R) visits BST nodes in ascending order — this is a fundamental and frequently tested property."},
    {q:"What is the worst-case height of a BST built by inserting 1, 2, 3, 4, 5, 6, 7 in order?",opts:["3","6","4","log₂(7) ≈ 3"],ans:1,exp:"Inserting sorted data creates a right-skewed chain. Height = n−1 = 6. This is the degenerate BST case."},
    {q:"AVL balance factor is defined as:",opts:["Value of node","height(left) − height(right)","Number of children","Depth from root"],ans:1,exp:"BF = height(left subtree) − height(right subtree). AVL guarantees |BF| ≤ 1 at every single node."},
    {q:"In a heap stored as an array, what is the index of the LEFT child of node at index i?",opts:["i + 1","2i","2i + 1","(i − 1) / 2"],ans:2,exp:"Left child = 2i+1, Right = 2i+2, Parent = ⌊(i−1)/2⌋. No pointers needed — this is what makes heaps memory-efficient."},
    {q:"Trie search for a word of length m has complexity:",opts:["O(n)","O(m · log n)","O(m)","O(log n)"],ans:2,exp:"O(m) — completely independent of n (total words stored). Add a million more words: search speed is unchanged."},
    {q:"Which structure gives O(1) access to the maximum element?",opts:["AVL Tree","BST","Max Heap","Trie"],ans:2,exp:"Max Heap always keeps the maximum at the root. Peek = O(1). Extract = O(log n). Perfect for priority queues."},
  ];
  const [ans,setAns]=useState({});
  const [rev,setRev]=useState({});
  const score=Object.entries(ans).filter(([qi,ai])=>QS[+qi].ans===+ai).length;
  useEffect(()=>{if(Object.keys(rev).length===QS.length)onDone?.(score,QS.length);},[rev]);

  // Progress indicator
  const answered = Object.keys(rev).length;
  const pct = (answered / QS.length) * 100;

  return (
    <div>
      {/* Quiz progress bar */}
      <div style={{ marginBottom:20 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:"#2d3748", letterSpacing:"0.08em" }}>PROGRESS</span>
          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:"#818cf8", fontWeight:700 }}>{answered}/{QS.length}</span>
        </div>
        <div style={{ height:4, background:"rgba(255,255,255,0.06)", borderRadius:99, overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${pct}%`, background:"linear-gradient(90deg,#6366f1,#38bdf8)", borderRadius:99, transition:"width 0.5s cubic-bezier(0.22,1,0.36,1)" }}/>
        </div>
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        {QS.map((q,qi)=>{
          const isR=rev[qi];
          const bc=isR?(ans[qi]===q.ans?"rgba(74,222,128,0.35)":"rgba(239,68,68,0.35)"):"rgba(255,255,255,0.07)";
          return (
            <div key={qi} style={{padding:"16px 18px",borderRadius:16,background:"rgba(255,255,255,0.02)",border:`1px solid ${bc}`,transition:"border-color 0.3s"}}>
              <div style={{display:"flex",gap:10,marginBottom:12,alignItems:"flex-start"}}>
                <span style={{
                  width:24,height:24,borderRadius:8,flexShrink:0,marginTop:1,
                  background:isR?(ans[qi]===q.ans?"rgba(74,222,128,0.2)":"rgba(239,68,68,0.2)"):"rgba(99,102,241,0.15)",
                  border:`1px solid ${isR?(ans[qi]===q.ans?"rgba(74,222,128,0.42)":"rgba(239,68,68,0.42)"):"rgba(99,102,241,0.32)"}`,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:700,
                  color:isR?(ans[qi]===q.ans?"#4ade80":"#ef4444"):"#818cf8",
                }}>{qi+1}</span>
                <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:600,color:"#e2e8f0",lineHeight:1.52}}>{q.q}</div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
                {q.opts.map((opt,oi)=>{
                  const isSel=ans[qi]===oi, isCorr=q.ans===oi;
                  let bg="rgba(255,255,255,0.03)",brd="rgba(255,255,255,0.07)",col="#64748b";
                  if(isR){
                    if(isCorr){bg="rgba(74,222,128,0.12)";brd="rgba(74,222,128,0.38)";col="#4ade80";}
                    else if(isSel){bg="rgba(239,68,68,0.12)";brd="rgba(239,68,68,0.38)";col="#f87171";}
                    else col="#2d3748";
                  } else if(isSel){bg="rgba(99,102,241,0.12)";brd="rgba(99,102,241,0.38)";col="#818cf8";}
                  return (
                    <button key={oi} onClick={()=>!isR&&setAns(a=>({...a,[qi]:oi}))} style={{
                      padding:"9px 12px",borderRadius:10,cursor:isR?"default":"pointer",
                      background:bg,border:`1px solid ${brd}`,
                      fontFamily:"'DM Sans',sans-serif",fontSize:13,color:col,
                      textAlign:"left",transition:"all 0.22s",display:"flex",alignItems:"center",gap:8,
                    }}>
                      <span style={{
                        width:19,height:19,borderRadius:"50%",flexShrink:0,
                        background:isR?(isCorr?"rgba(74,222,128,0.26)":isSel?"rgba(239,68,68,0.26)":"rgba(255,255,255,0.04)"):(isSel?"rgba(99,102,241,0.26)":"rgba(255,255,255,0.04)"),
                        border:`1px solid ${col}50`,
                        display:"flex",alignItems:"center",justifyContent:"center",
                        fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:700,color:col,
                      }}>{isR&&isCorr?"✓":isR&&isSel&&!isCorr?"✗":String.fromCharCode(65+oi)}</span>
                      {opt}
                    </button>
                  );
                })}
              </div>
              {ans[qi]!==undefined&&!isR&&(
                <button onClick={()=>setRev(r=>({...r,[qi]:true}))} style={{marginTop:10,padding:"6px 18px",borderRadius:20,cursor:"pointer",background:"rgba(99,102,241,0.12)",border:"1px solid rgba(99,102,241,0.3)",fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:700,color:"#818cf8"}}>CHECK →</button>
              )}
              {isR&&(
                <div style={{marginTop:10,padding:"9px 12px",borderRadius:10,background:ans[qi]===q.ans?"rgba(74,222,128,0.07)":"rgba(239,68,68,0.07)",border:`1px solid ${ans[qi]===q.ans?"rgba(74,222,128,0.2)":"rgba(239,68,68,0.2)"}`,fontFamily:"'DM Sans',sans-serif",fontSize:12.5,color:"#94a3b8",lineHeight:1.58,animation:"fUp 0.3s ease"}}>
                  <span style={{fontWeight:700,color:ans[qi]===q.ans?"#4ade80":"#f87171"}}>{ans[qi]===q.ans?"✓ Correct! ":"✗ Not quite — "}</span>{q.exp}
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
      border:"1px solid rgba(74,222,128,0.3)",
      boxShadow:"0 8px 36px rgba(74,222,128,0.15), 0 2px 12px rgba(0,0,0,0.6)",
      animation:"slideUp 0.35s cubic-bezier(0.22,1,0.36,1) both",
      maxWidth:"calc(100vw - 48px)",
    }}>
      <SpeakingWave color="#4ade80" size={16}/>
      <div>
        <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:600, color:"#e2e8f0", lineHeight:1 }}>{speakingLabel}</div>
        <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:"#4ade80", marginTop:2 }}>{speed}× speed · male voice</div>
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
export default function TreePage() {
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

  /* Active section tracker — marks section as seen */
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

  const goStack = () => router.push("/bs-tree");
  const goIntro = () => document.getElementById("intro")?.scrollIntoView({ behavior:"smooth" });

  const SECTS = [
    { id:"intro", icon:"🌱", title:"What is a Tree?", color:"#4ade80", voice:NARR.intro,
      visual:<VisIntro/>,
      cards:[
        {lbl:"DEFINITION",      body:"A non-linear, hierarchical data structure where nodes connect via edges. Unlike linear structures, trees branch outward — no cycles, no loops."},
        {lbl:"REAL-WORLD USE",  body:"File systems, HTML DOM, company org charts, decision trees in AI, routing tables, and database B-Trees all use tree structures."},
        {lbl:"THE KEY RULE",    body:"Every tree has exactly one root. Any two nodes are connected by exactly one unique path. Cycles are impossible."},
        {lbl:"WHY TREES WIN",   body:"O(log n) search vs O(n) scan. For 1 billion records: 30 comparisons vs 1 billion. That difference is the entire reason trees exist."},
      ]},
    { id:"anatomy", icon:"🔬", title:"Anatomy of a Tree", color:"#818cf8", voice:NARR.anatomy,
      visual:<VisAnatomy/>,
      cards:[
        {lbl:"ROOT",            body:"The single entry point with no parent. All operations — search, insert, delete — begin by visiting the root."},
        {lbl:"LEAVES & INTERNAL", body:"Leaves have no children: they are the endpoints. Internal nodes have at least one child and sit in the middle of the tree."},
        {lbl:"DEPTH vs HEIGHT", body:"Depth counts edges from root to a specific node (root depth = 0). Height is the maximum depth of any node in the entire tree."},
        {lbl:"SUBTREE & DEGREE", body:"Any node plus all descendants forms a subtree. Degree = number of children. Binary trees enforce degree ≤ 2 per node."},
      ]},
    { id:"types", icon:"🌿", title:"Types of Trees", color:"#38bdf8", voice:NARR.types,
      visual:<VisTypes/>,
      cards:[
        {lbl:"GENERAL TREE",    body:"No restriction on children per node. Represents any hierarchy: folder structures, XML documents, org charts."},
        {lbl:"BINARY TREE",     body:"Each node has at most 2 children (left and right). The foundation for BST, AVL, heap, and most tree algorithms."},
        {lbl:"FULL BINARY",     body:"Every node has exactly 0 or 2 children. No node has exactly 1 child. Useful in expression trees and Huffman encoding."},
        {lbl:"COMPLETE BINARY", body:"All levels fully filled except possibly the last, which fills left to right. This is exactly how heaps are stored."},
      ]},
    { id:"bst", icon:"🔍", title:"Binary Search Tree", color:"#06b6d4", voice:NARR.bst,
      visual:<VisBST/>,
      cards:[
        {lbl:"THE GOLDEN RULE", body:"Left subtree < node value < Right subtree — always. This single invariant makes every operation O(log n)."},
        {lbl:"SEARCH",          body:"At each node: target smaller → go left, target larger → go right. Each step eliminates half the remaining nodes."},
        {lbl:"INSERT",          body:"Follow the exact same path as search. When you hit null, that's where the new node belongs — always correct position."},
        {lbl:"THE PROBLEM",     body:"Insert 1, 2, 3, 4, 5 in order → right-skewed chain → height O(n). BST degenerates to a linked list. AVL fixes this."},
      ]},
    { id:"avl", icon:"⚖️", title:"AVL Tree — Self-Balancing", color:"#fbbf24", voice:NARR.avl,
      visual:<VisAVL/>,
      cards:[
        {lbl:"BALANCE FACTOR",  body:"BF = height(left) − height(right). AVL enforces |BF| ≤ 1 at every node. Any violation immediately triggers a rotation."},
        {lbl:"4 ROTATION TYPES",body:"LL case → Right Rotation. RR case → Left Rotation. LR case → Left then Right. RL case → Right then Left."},
        {lbl:"GUARANTEED HEIGHT", body:"AVL height ≤ 1.44 × log₂(n+2). Every single search is O(log n) no matter what order you inserted values."},
        {lbl:"TRADE-OFF",       body:"Insertions and deletions are slightly slower due to rebalancing. Worth it for read-heavy systems needing consistent speed."},
      ]},
    { id:"heap", icon:"🏔️", title:"Heap", color:"#f97316", voice:NARR.heap,
      visual:<VisHeap/>,
      cards:[
        {lbl:"MAX HEAP",        body:"Every parent ≥ both children. The maximum element always sits at root. No search needed — just read root in O(1)."},
        {lbl:"MIN HEAP",        body:"Every parent ≤ both children. Minimum always at root. Powers Dijkstra's shortest path, A* search, Prim's MST."},
        {lbl:"HEAPIFY",         body:"Insert: add at end, bubble up swapping with parent. Delete root: move last to root, bubble down. Both are O(log n)."},
        {lbl:"ARRAY TRICK",     body:"Node at i: left=2i+1, right=2i+2, parent=⌊(i-1)/2⌋. No pointers at all. Cache-friendly, memory-efficient storage."},
      ]},
    { id:"trie", icon:"📝", title:"Trie — Prefix Tree", color:"#a855f7", voice:NARR.trie,
      visual:<VisTrie/>,
      cards:[
        {lbl:"STRUCTURE",       body:"Each edge represents one character. To find a word, follow edges letter by letter. End-of-word nodes are marked."},
        {lbl:"O(m) SEARCH",     body:"m = word length. Adding 1 million more words does not slow search at all. Total words stored (n) is completely irrelevant."},
        {lbl:"AUTOCOMPLETE",    body:"Type prefix → reach its node → collect all words in the subtree below. This is exactly how Google Search suggestions work."},
        {lbl:"APPLICATIONS",    body:"Spell checkers, browser URL bars, IP routing tables (longest prefix match), T9 keyboards, DNA sequence searching."},
      ]},
    { id:"traversal", icon:"🗺️", title:"Tree Traversal", color:"#34d399", voice:NARR.traversal,
      visual:<VisTraversal/>,
      cards:[
        {lbl:"IN-ORDER (L→N→R)", body:"Visits left subtree, then current node, then right subtree. For any BST, this always outputs all values in sorted ascending order."},
        {lbl:"PRE-ORDER (N→L→R)", body:"Current node first, then subtrees. Used to serialize and copy a tree. Output mirrors the top-down tree structure."},
        {lbl:"POST-ORDER (L→R→N)", body:"Both children before parent. Used for safe deletion (children freed first) and evaluating postfix expression trees."},
        {lbl:"BFS / LEVEL-ORDER", body:"Uses a queue. Visits all nodes at depth 0, then 1, then 2… Essential for shortest path in unweighted trees."},
      ]},
  ];

  return (
    <div style={{ background:"#060810", color:"#f8fafc", minHeight:"100vh", overflowX:"hidden" }}>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        ::selection{background:rgba(99,102,241,0.42)}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(99,102,241,0.38);border-radius:8px}
        ::-webkit-scrollbar-thumb:hover{background:rgba(99,102,241,0.58)}

        @keyframes hOrb1{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(22px,-16px) scale(1.06)}66%{transform:translate(-12px,9px) scale(0.96)}}
        @keyframes hOrb2{0%,100%{transform:translate(0,0)}42%{transform:translate(-20px,14px)}84%{transform:translate(14px,-9px)}}
        @keyframes sPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.62;transform:scale(1.07)}}
        @keyframes sRight{from{opacity:0;transform:translateX(26px)}to{opacity:1;transform:translateX(0)}}
        @keyframes fUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes popIn{from{opacity:0;transform:scale(0.88) translateY(12px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes panelPop{from{opacity:0;transform:translateY(-8px) scale(0.96)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes slideUp{from{opacity:0;transform:translate(-50%,20px)}to{opacity:1;transform:translate(-50%,0)}}
        @keyframes wave{0%,100%{transform:scaleY(0.4)}50%{transform:scaleY(1)}}

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
        speed={speed}
      />

      {/* Keyboard shortcut hint */}
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
          <div style={{ display:"flex",alignItems:"center",gap:14,marginBottom:22,flexWrap:"wrap" }}>
            <div style={{ width:50,height:50,borderRadius:16,flexShrink:0,
              background:"rgba(56,189,248,0.12)",border:"1px solid rgba(56,189,248,0.32)",
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,
              boxShadow:"0 0 28px rgba(56,189,248,0.15)" }}>⚡</div>
            <div>
              <h2 style={{ fontFamily:"'Syne',sans-serif",fontSize:"clamp(19px,3.8vw,30px)",fontWeight:800,color:"#f8fafc" }}>Complexity Cheat Sheet</h2>
              <p style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#2d3748",marginTop:3,letterSpacing:"0.08em" }}>GREEN = FAST · RED = SLOW · HOVER ROWS TO HIGHLIGHT</p>
            </div>
          </div>
          <div style={{ borderRadius:22,overflow:"hidden",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)" }}>
            <ComplexityTable/>
          </div>
          <div style={{ display:"flex",gap:16,marginTop:12,flexWrap:"wrap" }}>
            {[["🟢 O(log n)","optimal — always prefer"],["🔴 O(n)","avoid for large data"],["🔵 O(m)","m = word/string length"]].map(([k,v])=>(
              <div key={k} style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#2d3748" }}>
                {k}<span style={{ color:"#1a2030" }}> = {v}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Quiz Section ───────────────────────────────────────── */}
        <section id="quiz" style={{ marginBottom:80 }}>
          <div style={{ display:"flex",alignItems:"center",gap:14,marginBottom:8,flexWrap:"wrap" }}>
            <div style={{ width:50,height:50,borderRadius:16,flexShrink:0,
              background:"rgba(236,72,153,0.12)",border:"1px solid rgba(236,72,153,0.32)",
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,
              boxShadow:"0 0 28px rgba(236,72,153,0.15)" }}>🧠</div>
            <div style={{ flex:1,minWidth:0 }}>
              <h2 style={{ fontFamily:"'Syne',sans-serif",fontSize:"clamp(19px,3.8vw,30px)",fontWeight:800,color:"#f8fafc" }}>Test Your Knowledge</h2>
              <p style={{ fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#475569",marginTop:3 }}>6 questions · covers every section · some are tricky</p>
            </div>
            <button onClick={()=>handleVoice("quiz",NARR.quiz)} style={{
              display:"flex",alignItems:"center",gap:7,
              padding:"7px 14px",borderRadius:28,cursor:"pointer",flexShrink:0,
              background:speaking==="quiz"?"rgba(236,72,153,0.2)":"rgba(255,255,255,0.04)",
              border:`1.5px solid ${speaking==="quiz"?"#ec4899":"rgba(255,255,255,0.1)"}`,
              fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:700,
              color:speaking==="quiz"?"#ec4899":"#475569",transition:"all 0.22s",
            }}>
              {speaking==="quiz"?<SpeakingWave color="#ec4899" size={12}/>:<span style={{fontSize:12}}>🔊</span>}
              {speaking==="quiz"?"STOP":"LISTEN"}
            </button>
          </div>

          <div style={{ marginBottom:22 }}/>
          <Quiz onDone={(sc,tot)=>{ setQScore(sc); setQTotal(tot); }}/>

          {qScore !== null && (
            <div style={{
              marginTop:30,padding:"36px 24px",borderRadius:24,textAlign:"center",
              background:`linear-gradient(138deg,${qScore>=5?"rgba(74,222,128,0.1)":qScore>=3?"rgba(251,191,36,0.1)":"rgba(239,68,68,0.1)"} 0%,rgba(0,0,0,0) 100%)`,
              border:`1px solid ${qScore>=5?"rgba(74,222,128,0.32)":qScore>=3?"rgba(251,191,36,0.32)":"rgba(239,68,68,0.32)"}`,
              animation:"fUp 0.5s ease",
            }}>
              <div style={{ fontSize:52,marginBottom:12 }}>{qScore>=5?"🏆":qScore>=3?"🌟":"💪"}</div>
              <div style={{ fontFamily:"'Syne',sans-serif",fontSize:40,fontWeight:800,
                color:qScore>=5?"#4ade80":qScore>=3?"#fbbf24":"#f87171" }}>
                {qScore} / {qTotal}
              </div>
              <p style={{ fontFamily:"'DM Sans',sans-serif",fontSize:15,color:"#94a3b8",margin:"10px 0 24px",lineHeight:1.55 }}>
                {qScore>=5
                  ? "Exceptional! You have genuinely mastered tree data structures."
                  : qScore>=3
                  ? "Solid work. Review the sections you missed, then retry."
                  : "Keep going — re-read the sections above and come back stronger."}
              </p>
              <button onClick={goStack} style={{
                padding:"14px 34px",borderRadius:16,cursor:"pointer",
                background:"linear-gradient(135deg,#6366f1 0%,#38bdf8 100%)",
                border:"none",fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:700,
                color:"#fff",boxShadow:"0 8px 32px rgba(99,102,241,0.42)",
                transition:"all 0.25s",display:"inline-flex",alignItems:"center",gap:11,
              }}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 14px 44px rgba(99,102,241,0.58)";}}
                onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="0 8px 32px rgba(99,102,241,0.42)";}}>
                <span>Next: Stack Data Structure</span>
                <span style={{ fontSize:20 }}>→</span>
              </button>
            </div>
          )}
        </section>

        {/* ── Footer CTA ─────────────────────────────────────────── */}
        <div style={{
          textAlign:"center",padding:"48px 24px",borderRadius:26,
          background:"linear-gradient(140deg,rgba(99,102,241,0.09) 0%,rgba(56,189,248,0.07) 50%,rgba(74,222,128,0.06) 100%)",
          border:"1px solid rgba(99,102,241,0.18)",
          position:"relative",overflow:"hidden",
        }}>
          <div style={{ position:"absolute",inset:0,backgroundImage:"radial-gradient(circle,rgba(99,102,241,0.04) 1px,transparent 1px)",backgroundSize:"30px 30px",pointerEvents:"none" }}/>
          <div style={{ fontSize:48,marginBottom:14 }}>🌲</div>
          <h3 style={{ fontFamily:"'Syne',sans-serif",fontSize:"clamp(17px,3.2vw,26px)",fontWeight:800,color:"#f8fafc",marginBottom:12 }}>
            You have completed the Tree guide!
          </h3>
          <p style={{ fontFamily:"'DM Sans',sans-serif",fontSize:14,color:"#64748b",maxWidth:440,margin:"0 auto 28px",lineHeight:1.72 }}>
            Implement these yourself. Start with a BST, then add AVL balancing.
            Writing the code makes every concept permanent.
          </p>

          {/* Section completion progress */}
          <div style={{ display:"flex",gap:6,justifyContent:"center",flexWrap:"wrap",marginBottom:24 }}>
            {NAV_SECTIONS.map(s => (
              <div key={s.id} style={{
                padding:"4px 12px",borderRadius:20,
                background:seenSections.has(s.id)?`${s.col}18`:"rgba(255,255,255,0.03)",
                border:`1px solid ${seenSections.has(s.id)?`${s.col}38`:"rgba(255,255,255,0.06)"}`,
                fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:700,
                color:seenSections.has(s.id)?s.col:"#1a2030",transition:"all 0.3s",
              }}>
                {s.icon} {s.label} {seenSections.has(s.id)?"✓":""}
              </div>
            ))}
          </div>
          <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#2d3748",marginBottom:22 }}>
            {seenSections.size} / {NAV_SECTIONS.length} sections visited
          </div>

          <div style={{ display:"flex",gap:9,justifyContent:"center",flexWrap:"wrap",marginBottom:20 }}>
            {["💻 Code a BST","💻 Code AVL Tree","💻 Code Max Heap","💻 Code a Trie"].map(t=>(
              <button key={t} onClick={goStack} style={{
                padding:"8px 16px",borderRadius:22,cursor:"pointer",
                background:"rgba(99,102,241,0.1)",border:"1px solid rgba(99,102,241,0.24)",
                fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#818cf8",
                letterSpacing:"0.04em",transition:"all 0.22s",
              }}
                onMouseEnter={e=>{e.currentTarget.style.background="rgba(99,102,241,0.2)";e.currentTarget.style.borderColor="rgba(99,102,241,0.45)";}}
                onMouseLeave={e=>{e.currentTarget.style.background="rgba(99,102,241,0.1)";e.currentTarget.style.borderColor="rgba(99,102,241,0.24)";}}>
                {t}
              </button>
            ))}
          </div>

          <button onClick={() => setShortcutsOpen(true)} style={{
            background:"none",border:"1px solid rgba(255,255,255,0.08)",borderRadius:20,cursor:"pointer",
            padding:"6px 16px",fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#2d3748",
            transition:"all 0.2s",
          }}>⌨️ VIEW KEYBOARD SHORTCUTS</button>
        </div>

      </main>
    </div>
  );
}