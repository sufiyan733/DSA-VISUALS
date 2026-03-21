"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

// ─────────────────────────────────────────────────────────────────────────────
// ROUTE MAP
// ─────────────────────────────────────────────────────────────────────────────
const ROUTES = {
  "array":        "/array",
  "linked-list":  "/linked-list",
  "stack":        "/stack",
  "queue":        "/queue",
  "deque":        "/deque",
  "binary-tree":  "/tree",
  "bst":          "/tree",
  "avl":          "/tree",
  "heap":         "/tree",
  "trie":         "/tree",
  "graph":        "/graph",
  "adj-list":     "/graph",
  "adj-matrix":   "/graph",
  "hash-map":     "/hash-map",
  "hash-set":     "/hash-set",
  "bubble":       "/bubble-sort",
  "insertion":    "/insertion-sort",
  "merge":        "/merge-sort",
  "quick":        "/quick-sort",
  "heap-sort":    "/heap-sort",
  "radix":        "/radix-sort",
  "linear-s":     "/linear-search",
  "binary-s":     "/binary-search",
  "bfs":          "/bfs",
  "dfs":          "/dfs",
  "dijkstra":     "/dijkstra",
  "bellman":      "/bellman-ford",
  "kruskal":      "/kruskal",
  "prim":         "/prim",
  "fibonacci":    "/fibonacci",
  "knapsack":     "/knapsack",
  "lcs":          "/lcs",
  "lis":          "/lis",
};

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────
const TREE = {
  ds: {
    label:"Data Structures", accent:"#818cf8", glow:"rgba(129,140,248,0.45)",
    description:"Foundational structures that organise and store data efficiently.",
    categories:[
      { id:"linear",  label:"Linear",    color:"#818cf8", icon:"▤", desc:"Sequential memory layout",
        items:[
          {id:"array",       label:"Array",       icon:"[ ]", complexity:"O(1)",     tag:"Basic", desc:"Indexed collection"},
          {id:"linked-list", label:"Linked List", icon:"→",   complexity:"O(n)",     tag:"Basic", desc:"Node chain"},
          {id:"stack",       label:"Stack",       icon:"⬆",   complexity:"O(1)",     tag:"Basic", desc:"LIFO structure"},
          {id:"queue",       label:"Queue",       icon:"⇥",   complexity:"O(1)",     tag:"Basic", desc:"FIFO structure"},
          {id:"deque",       label:"Deque",       icon:"⇔",   complexity:"O(1)",     tag:"Basic", desc:"Double-ended queue"},
        ]},
      { id:"trees",   label:"Trees",     color:"#a78bfa", icon:"⑂", desc:"Hierarchical node structures",
        items:[
          {id:"binary-tree", label:"Binary Tree", icon:"⑂", complexity:"O(log n)", tag:"Mid",  desc:"Two children max"},
          {id:"bst",         label:"BST",         icon:"⑂", complexity:"O(log n)", tag:"Mid",  desc:"Ordered binary tree"},
          {id:"avl",         label:"AVL Tree",    icon:"⑂", complexity:"O(log n)", tag:"Hard", desc:"Self-balancing BST"},
          {id:"heap",        label:"Heap",        icon:"△",  complexity:"O(log n)", tag:"Mid",  desc:"Priority ordering"},
          {id:"trie",        label:"Trie",        icon:"⑂", complexity:"O(m)",     tag:"Hard", desc:"Prefix tree"},
        ]},
      { id:"graphs",  label:"Graphs",    color:"#c084fc", icon:"◎", desc:"Vertices connected by edges",
        items:[
          {id:"graph",      label:"Graph",       icon:"◎", complexity:"O(V+E)", tag:"Hard", desc:"General graph"},
          {id:"adj-list",   label:"Adj. List",   icon:"≡",  complexity:"O(V+E)", tag:"Mid",  desc:"Sparse representation"},
          {id:"adj-matrix", label:"Adj. Matrix", icon:"⊞",  complexity:"O(V²)",  tag:"Mid",  desc:"Dense representation"},
        ]},
      { id:"hashing", label:"Hashing",   color:"#e879f9", icon:"#", desc:"O(1) key-value lookup",
        items:[
          {id:"hash-map", label:"Hash Map", icon:"{}", complexity:"O(1)", tag:"Mid", desc:"Key-value store"},
          {id:"hash-set", label:"Hash Set", icon:"∅",  complexity:"O(1)", tag:"Mid", desc:"Unique values"},
        ]},
    ],
  },
  algo: {
    label:"Algorithms", accent:"#22d3ee", glow:"rgba(34,211,238,0.45)",
    description:"Step-by-step procedures that solve computational problems.",
    categories:[
      { id:"sorting",   label:"Sorting",       color:"#22d3ee", icon:"↕", desc:"Arrange elements in order",
        items:[
          {id:"bubble",    label:"Bubble Sort",    icon:"○",  complexity:"O(n²)",      tag:"Basic", desc:"Adjacent swaps"},
          {id:"insertion", label:"Insertion Sort", icon:"↩",  complexity:"O(n²)",      tag:"Basic", desc:"Build sorted array"},
          {id:"merge",     label:"Merge Sort",     icon:"⊕",  complexity:"O(n log n)", tag:"Mid",   desc:"Divide and merge"},
          {id:"quick",     label:"Quick Sort",     icon:"⚡", complexity:"O(n log n)", tag:"Mid",   desc:"Partition pivot"},
          {id:"heap-sort", label:"Heap Sort",      icon:"△",  complexity:"O(n log n)", tag:"Mid",   desc:"Heap-based sort"},
          {id:"radix",     label:"Radix Sort",     icon:"⌗",  complexity:"O(nk)",      tag:"Hard",  desc:"Digit-by-digit"},
        ]},
      { id:"searching", label:"Searching",     color:"#2dd4bf", icon:"◉", desc:"Locate elements in data",
        items:[
          {id:"linear-s", label:"Linear Search", icon:"→",   complexity:"O(n)",     tag:"Basic", desc:"Sequential scan"},
          {id:"binary-s", label:"Binary Search", icon:"⟨⟩", complexity:"O(log n)", tag:"Basic", desc:"Halving search"},
        ]},
      { id:"graph-a",   label:"Graph Algos",   color:"#34d399", icon:"⬡", desc:"Traverse and analyse graphs",
        items:[
          {id:"bfs",      label:"BFS",          icon:"⊙", complexity:"O(V+E)",    tag:"Mid",  desc:"Level-order traversal"},
          {id:"dfs",      label:"DFS",          icon:"⬇", complexity:"O(V+E)",    tag:"Mid",  desc:"Depth traversal"},
          {id:"dijkstra", label:"Dijkstra",     icon:"⬡", complexity:"O(E log V)", tag:"Hard", desc:"Shortest path"},
          {id:"bellman",  label:"Bellman-Ford", icon:"⊕", complexity:"O(VE)",     tag:"Hard", desc:"Negative weights"},
          {id:"kruskal",  label:"Kruskal",      icon:"⑂", complexity:"O(E log E)", tag:"Hard", desc:"Minimum span tree"},
          {id:"prim",     label:"Prim's",       icon:"◈", complexity:"O(E log V)", tag:"Hard", desc:"Greedy MST"},
        ]},
      { id:"dp", label:"Dynamic Prog.", color:"#86efac", icon:"⊞", desc:"Memoised subproblem solving",
        items:[
          {id:"fibonacci", label:"Fibonacci", icon:"∞", complexity:"O(n)",  tag:"Mid",  desc:"Classic DP example"},
          {id:"knapsack",  label:"Knapsack",  icon:"⊡", complexity:"O(nW)", tag:"Hard", desc:"Weight optimisation"},
          {id:"lcs",       label:"LCS",       icon:"≈",  complexity:"O(mn)", tag:"Hard", desc:"Common subsequence"},
          {id:"lis",       label:"LIS",       icon:"↑",  complexity:"O(n²)", tag:"Hard", desc:"Increasing subsequence"},
        ]},
    ],
  },
};

const TAG = {
  Basic:{ bg:"rgba(99,102,241,0.12)", text:"#a5b4fc", border:"rgba(99,102,241,0.22)" },
  Mid:  { bg:"rgba(6,182,212,0.12)",  text:"#67e8f9", border:"rgba(6,182,212,0.22)"  },
  Hard: { bg:"rgba(239,68,68,0.12)",  text:"#fca5a5", border:"rgba(239,68,68,0.22)"  },
};

function useIsMobile(bp = 768) {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const check = () => setMobile(window.innerWidth <= bp);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [bp]);
  return mobile;
}

// ─────────────────────────────────────────────────────────────────────────────
// PARTICLE CANVAS
// ─────────────────────────────────────────────────────────────────────────────
function ParticleCanvas() {
  const ref = useRef(null), anim = useRef(null);
  useEffect(() => {
    const c = ref.current, ctx = c.getContext("2d");
    const resize = () => { c.width = window.innerWidth; c.height = window.innerHeight; };
    resize(); window.addEventListener("resize", resize);
    const n = window.innerWidth < 768 ? 28 : 48;
    const pts = Array.from({length:n}, () => ({
      x:Math.random()*window.innerWidth, y:Math.random()*window.innerHeight,
      r:Math.random()*1.3+0.2, vx:(Math.random()-.5)*.15, vy:(Math.random()-.5)*.15,
      a:Math.random()*.25+.05,
    }));
    const draw = () => {
      ctx.clearRect(0,0,c.width,c.height);
      for (let i=0;i<pts.length;i++) {
        const p=pts[i]; p.x+=p.vx; p.y+=p.vy;
        if(p.x<0)p.x=c.width; if(p.x>c.width)p.x=0;
        if(p.y<0)p.y=c.height; if(p.y>c.height)p.y=0;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle=`rgba(99,102,241,${p.a})`; ctx.fill();
        for(let j=i+1;j<pts.length;j++){
          const q=pts[j],d=Math.hypot(p.x-q.x,p.y-q.y);
          if(d<90){ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.strokeStyle=`rgba(99,102,241,${.038*(1-d/90)})`;ctx.lineWidth=.4;ctx.stroke();}
        }
      }
      anim.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>{cancelAnimationFrame(anim.current);window.removeEventListener("resize",resize);};
  },[]);
  return <canvas ref={ref} style={{position:"fixed",top:0,left:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:0}}/>;
}

// ─────────────────────────────────────────────────────────────────────────────
// PREMIUM LOGO — Fixed "y" descender clipping
// ─────────────────────────────────────────────────────────────────────────────
function PremiumLogo({ size = "md" }) {
  const isLg = size === "lg";
  const badgeSize = isLg ? 52 : 42;
  const fontSize = isLg ? "clamp(18px, 2vw, 24px)" : "clamp(15px, 1.6vw, 20px)";
  const monoSize = isLg ? "16px" : "14px";

  return (
    <div style={{
      display:"flex", alignItems:"center", gap:"13px",
      cursor:"default", userSelect:"none",
    }}>
      {/* ── Monogram badge ── */}
      <div style={{ position:"relative", width:`${badgeSize}px`, height:`${badgeSize}px`, flexShrink:0 }}>
        <div style={{
          position:"absolute", inset:"-8px", borderRadius:"16px",
          background:"radial-gradient(ellipse at 50% 50%, rgba(129,140,248,0.38) 0%, rgba(167,139,250,0.18) 45%, transparent 75%)",
          filter:"blur(8px)",
          animation:"logoPulse 3.8s ease-in-out infinite",
        }}/>
        <div style={{
          position:"absolute", inset:"-1.5px", borderRadius:"12px",
          background:"linear-gradient(135deg, #818cf8, #c084fc, #22d3ee, #818cf8)",
          backgroundSize:"300% 300%",
          animation:"borderSpin 4s linear infinite",
          opacity:0.9,
        }}/>
        <div style={{
          position:"absolute", inset:"1.5px", borderRadius:"10.5px",
          background:"linear-gradient(155deg, #0e0e2e 0%, #080818 55%, #0c0c25 100%)",
          display:"flex", alignItems:"center", justifyContent:"center",
          overflow:"hidden",
          boxShadow:"inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(0,0,0,0.4)",
        }}>
          <div style={{position:"absolute",top:0,left:0,width:"14px",height:"14px",background:"radial-gradient(circle at 0% 0%, rgba(129,140,248,0.5) 0%, transparent 70%)"}}/>
          <div style={{position:"absolute",bottom:0,right:0,width:"14px",height:"14px",background:"radial-gradient(circle at 100% 100%, rgba(34,211,238,0.4) 0%, transparent 70%)"}}/>
          <div style={{
            position:"absolute",top:"-20%",left:"-80%",
            width:"55%",height:"140%",
            background:"linear-gradient(105deg, transparent, rgba(255,255,255,0.09), transparent)",
            transform:"skewX(-15deg)",
            animation:"badgeSweep 3.2s ease-in-out infinite",
          }}/>
          <span style={{
            fontFamily:"'Space Mono', monospace",
            fontSize:monoSize, fontWeight:700, letterSpacing:"-0.03em",
            background:"linear-gradient(145deg, #e0e7ff 0%, #a5b4fc 35%, #c084fc 65%, #67e8f9 100%)",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
            position:"relative", zIndex:1,
            filter:"drop-shadow(0 0 6px rgba(129,140,248,0.6))",
          }}>VS</span>
        </div>
      </div>

      {/* ── Wordmark — FIXED: overflow:visible + paddingBottom prevents "y" clip ── */}
      <div style={{ lineHeight:1, position:"relative" }}>
        <div style={{ display:"flex", alignItems:"baseline", gap:"0px", position:"relative" }}>
          {/* "Visuo" */}
          <span style={{
            fontFamily:"'Space Mono', monospace",
            fontSize, fontWeight:700, letterSpacing:"0.02em",
            color:"#dde4ff",
            textShadow:"0 0 18px rgba(199,210,254,0.25)",
            lineHeight: 1.4,
          }}>Visuo</span>

          {/* "Slayer" — KEY FIX: use display:inline-block + paddingBottom to
              prevent the gradient clip from slicing off the "y" descender.
              The paddingBottom creates space below the baseline for descenders,
              and the negative marginBottom compensates so layout is unaffected. */}
          <span style={{
            fontFamily:"'Space Mono', monospace",
            fontSize, fontWeight:700, letterSpacing:"0.02em",
            background:"linear-gradient(90deg, #818cf8 0%, #a78bfa 22%, #e879f9 44%, #22d3ee 66%, #a78bfa 88%, #818cf8 100%)",
            backgroundSize:"250% auto",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
            animation:"shimmer 3.6s linear infinite",
            filter:"drop-shadow(0 0 8px rgba(167,139,250,0.45))",
            /* ↓ THE FIX: give extra vertical room for descenders */
            display:"inline-block",
            lineHeight: 1.4,
            paddingBottom:"0.2em",
            marginBottom:"-0.2em",
          }}>Slayer</span>
        </div>

        {/* Underline accent */}
        <div style={{
          height:"1px", marginTop:"4px",
          background:"linear-gradient(to right, rgba(129,140,248,0.5), rgba(34,211,238,0.3), transparent)",
          borderRadius:"1px",
        }}/>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TOPIC CARD — Enhanced with richer hover, better hierarchy
// ─────────────────────────────────────────────────────────────────────────────
function TopicCard({ item, catColor, onLeafClick, animDelay }) {
  const [hov, setHov] = useState(false);
  const tc = TAG[item.tag] || TAG.Basic;
  return (
    <div
      onClick={() => onLeafClick(item)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position:"relative", padding:"14px", borderRadius:"13px",
        cursor:"pointer", overflow:"hidden",
        background: hov ? `${catColor}0f` : "rgba(255,255,255,0.03)",
        border:`1px solid ${hov ? catColor+"55" : "rgba(255,255,255,0.07)"}`,
        boxShadow: hov ? `0 8px 28px ${catColor}18, inset 0 1px 0 rgba(255,255,255,0.06)` : "inset 0 1px 0 rgba(255,255,255,0.03)",
        transition:"all .18s cubic-bezier(.16,1,.3,1)",
        transform: hov ? "translateY(-3px) scale(1.01)" : "translateY(0) scale(1)",
        animation:`itemFade .26s ${animDelay}ms both ease-out`,
      }}
    >
      {/* Glow orb on hover */}
      {hov && (
        <div style={{
          position:"absolute", top:"-30%", left:"20%",
          width:"80px", height:"80px", borderRadius:"50%",
          background:`radial-gradient(circle, ${catColor}22, transparent 70%)`,
          filter:"blur(12px)", pointerEvents:"none",
          transition:"opacity .18s",
        }}/>
      )}

      <div style={{display:"flex",alignItems:"flex-start",gap:"10px",marginBottom:"10px"}}>
        {/* Icon box */}
        <span style={{
          width:"32px", height:"32px", borderRadius:"9px", flexShrink:0,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:"13px", fontFamily:"'Space Mono',monospace", color:catColor,
          background: hov ? `${catColor}24` : `${catColor}14`,
          border:`1px solid ${hov ? catColor+"50" : catColor+"22"}`,
          boxShadow: hov ? `0 0 12px ${catColor}28` : "none",
          transition:"all .18s",
        }}>{item.icon}</span>

        {/* Label + desc */}
        <div style={{flex:1, minWidth:0}}>
          <div style={{
            fontSize:"13px", fontWeight:700, lineHeight:1.2,
            color: hov ? "#f1f5f9" : "#cbd5e1",
            transition:"color .18s",
            whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
          }}>{item.label}</div>
          <div style={{fontSize:"10px", color:"#4b5563", lineHeight:1.3, marginTop:"2px"}}>{item.desc}</div>
        </div>
      </div>

      {/* Footer row */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <code style={{
          fontSize:"9px", fontFamily:"'Space Mono',monospace",
          color: hov ? catColor : "#374151",
          background: hov ? `${catColor}14` : "rgba(255,255,255,0.04)",
          padding:"2px 7px", borderRadius:"5px",
          border:`1px solid ${hov ? catColor+"30" : "rgba(255,255,255,0.06)"}`,
          transition:"all .18s",
        }}>{item.complexity}</code>
        <span style={{
          fontSize:"8px", fontWeight:700, letterSpacing:"0.05em",
          padding:"2px 7px", borderRadius:"5px",
          background:tc.bg, color:tc.text, border:`1px solid ${tc.border}`,
        }}>{item.tag}</span>
      </div>

      {/* Bottom shimmer bar on hover */}
      {hov && (
        <div style={{
          position:"absolute", bottom:0, left:0, right:0, height:"2px",
          background:`linear-gradient(to right, transparent, ${catColor}80, transparent)`,
          borderRadius:"0 0 13px 13px",
        }}/>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DSA EXPLORER — Enhanced category panel + item grid
// ─────────────────────────────────────────────────────────────────────────────
function DSAExplorer({ onLeafClick }) {
  const [tabId,  setTabId]  = useState("ds");
  const [catId,  setCatId]  = useState("linear");
  const [fadeIn, setFadeIn] = useState(true);
  const isMobile = useIsMobile(700);

  const tab = TREE[tabId];
  const cat = tab.categories.find(c => c.id === catId) || tab.categories[0];

  const switchTab = (id) => {
    if (id === tabId) return;
    setFadeIn(false);
    setTimeout(() => { setTabId(id); setCatId(TREE[id].categories[0].id); setFadeIn(true); }, 140);
  };
  const switchCat = (id) => {
    if (id === catId && !isMobile) return;
    setFadeIn(false);
    setTimeout(() => { setCatId(id); setFadeIn(true); }, 100);
  };

  const cols = cat.items.length <= 2 ? 2 : cat.items.length <= 4 ? 2 : 3;

  return (
    <div style={{width:"100%", fontFamily:"'DM Sans',sans-serif"}}>
      {/* Tab switcher */}
      <div style={{display:"flex", justifyContent:"center", marginBottom:"22px"}}>
        <div style={{
          display:"flex", gap:"4px", padding:"4px",
          borderRadius:"14px",
          background:"rgba(255,255,255,0.03)",
          border:"1px solid rgba(255,255,255,0.08)",
          backdropFilter:"blur(8px)",
        }}>
          {Object.entries(TREE).map(([id,t]) => {
            const active = tabId===id;
            return (
              <button key={id} onClick={()=>switchTab(id)} style={{
                display:"flex", alignItems:"center", gap:"7px",
                padding: isMobile ? "8px 16px" : "10px 24px",
                borderRadius:"10px",
                background: active ? `${t.accent}1e` : "transparent",
                border: `1px solid ${active ? t.accent+"55" : "transparent"}`,
                color: active ? t.accent : "#4b5563",
                fontSize: isMobile ? "12px" : "13px",
                fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif",
                transition:"all .18s cubic-bezier(.16,1,.3,1)",
                boxShadow: active ? `0 2px 16px ${t.glow}` : "none",
                whiteSpace:"nowrap", userSelect:"none",
              }}>
                <span style={{
                  fontSize:"14px",
                  filter: active ? `drop-shadow(0 0 6px ${t.accent})` : "none",
                  transition:"filter .18s",
                }}>{id==="ds" ? "⬡" : "⚙"}</span>
                {isMobile ? (id==="ds" ? "Data Structures" : "Algorithms") : t.label}
              </button>
            );
          })}
        </div>
      </div>

      {!isMobile && (
        <div style={{
          display:"grid", gridTemplateColumns:"200px 1fr",
          borderRadius:"16px",
          border:"1px solid rgba(255,255,255,0.08)",
          overflow:"hidden", minHeight:"360px",
          background:"rgba(4,4,20,0.6)",
          boxShadow:"0 0 0 1px rgba(99,102,241,0.04), inset 0 1px 0 rgba(255,255,255,0.04)",
        }}>
          {/* Left panel */}
          <div style={{
            borderRight:"1px solid rgba(255,255,255,0.07)",
            display:"flex", flexDirection:"column",
            background:"rgba(0,0,0,0.2)",
          }}>
            {/* Section header */}
            <div style={{padding:"16px 14px 12px", borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
              <div style={{display:"flex", alignItems:"center", gap:"7px", marginBottom:"6px"}}>
                <span style={{
                  width:"20px", height:"20px", borderRadius:"6px",
                  background:`${tab.accent}1e`, border:`1px solid ${tab.accent}28`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:"10px", color:tab.accent,
                }}>{tabId==="ds" ? "⬡" : "⚙"}</span>
                <span style={{fontSize:"11px", fontWeight:800, color:tab.accent, letterSpacing:"0.02em"}}>{tab.label}</span>
              </div>
              <p style={{fontSize:"10px", color:"#374151", lineHeight:1.5}}>{tab.description}</p>
            </div>

            {/* Category list */}
            <div style={{padding:"8px", flex:1, display:"flex", flexDirection:"column", gap:"2px"}}>
              <div style={{
                fontSize:"9px", fontWeight:700, letterSpacing:"0.14em",
                textTransform:"uppercase", color:"#1e293b",
                padding:"4px 8px 8px",
              }}>Categories</div>
              {tab.categories.map(c => {
                const active = catId===c.id;
                return (
                  <button key={c.id} onClick={()=>switchCat(c.id)} style={{
                    display:"flex", alignItems:"center", gap:"8px",
                    padding:"9px 10px", borderRadius:"9px", width:"100%", textAlign:"left",
                    background: active ? `${c.color}18` : "transparent",
                    border:`1px solid ${active ? c.color+"40" : "transparent"}`,
                    color: active ? c.color : "#4b5563",
                    fontSize:"12px", fontWeight: active ? 700 : 500,
                    cursor:"pointer", fontFamily:"'DM Sans',sans-serif",
                    transition:"all .15s",
                    boxShadow: active ? `0 2px 12px ${c.color}14` : "none",
                    userSelect:"none",
                  }}
                  onMouseEnter={e=>{if(!active){e.currentTarget.style.background=`${c.color}0d`;e.currentTarget.style.color=c.color;}}}
                  onMouseLeave={e=>{if(!active){e.currentTarget.style.background="transparent";e.currentTarget.style.color="#4b5563";}}}>
                    <span style={{
                      width:"7px", height:"7px", borderRadius:"50%", flexShrink:0,
                      background: active ? c.color : "#1e293b",
                      boxShadow: active ? `0 0 6px ${c.color}` : "none",
                      transition:"all .15s",
                    }}/>
                    <span style={{flex:1}}>{c.label}</span>
                    <span style={{
                      fontSize:"9px", fontWeight:700, padding:"1px 6px", borderRadius:"4px",
                      background: active ? `${c.color}22` : "rgba(255,255,255,0.04)",
                      color: active ? c.color : "#374151",
                      border:`1px solid ${active ? c.color+"28" : "rgba(255,255,255,0.05)"}`,
                      transition:"all .15s",
                    }}>{c.items.length}</span>
                  </button>
                );
              })}
            </div>

            {/* Category footer hint */}
            <div style={{padding:"12px 14px", borderTop:"1px solid rgba(255,255,255,0.05)"}}>
              <div style={{display:"flex", alignItems:"center", gap:"5px", marginBottom:"3px"}}>
                <span style={{fontSize:"11px", color:cat.color, filter:`drop-shadow(0 0 4px ${cat.color}80)`}}>{cat.icon}</span>
                <span style={{fontSize:"11px", fontWeight:700, color:cat.color}}>{cat.label}</span>
              </div>
              <p style={{fontSize:"9px", color:"#374151", lineHeight:1.4}}>{cat.desc}</p>
            </div>
          </div>

          {/* Right panel */}
          <div style={{
            padding:"20px",
            opacity:fadeIn?1:0,
            transform:fadeIn?"translateY(0)":"translateY(5px)",
            transition:"opacity .15s, transform .15s",
            display:"flex", flexDirection:"column",
          }}>
            {/* Panel header */}
            <div style={{
              display:"flex", alignItems:"flex-start", justifyContent:"space-between",
              marginBottom:"16px", paddingBottom:"14px",
              borderBottom:"1px solid rgba(255,255,255,0.06)",
            }}>
              <div>
                <div style={{display:"flex", alignItems:"center", gap:"8px", marginBottom:"4px"}}>
                  <span style={{
                    width:"30px", height:"30px", borderRadius:"8px", flexShrink:0,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:"13px", fontFamily:"'Space Mono',monospace",
                    color:cat.color,
                    background:`${cat.color}1c`,
                    border:`1px solid ${cat.color}30`,
                    boxShadow:`0 0 10px ${cat.color}18`,
                  }}>{cat.icon}</span>
                  <span style={{fontSize:"15px", fontWeight:800, color:"#f1f5f9", letterSpacing:"-0.01em"}}>{cat.label}</span>
                  <span style={{
                    fontSize:"10px", color:"#4b5563",
                    background:"rgba(255,255,255,0.04)",
                    padding:"2px 8px", borderRadius:"5px",
                    border:"1px solid rgba(255,255,255,0.06)",
                  }}>{cat.items.length} topics</span>
                </div>
                <p style={{fontSize:"11px", color:"#4b5563", marginLeft:"38px"}}>{cat.desc}</p>
              </div>
              <div style={{display:"flex", gap:"5px", flexShrink:0}}>
                {["Basic","Mid","Hard"].map(t=>(
                  <span key={t} style={{
                    fontSize:"8px", fontWeight:700, letterSpacing:"0.05em",
                    padding:"2px 8px", borderRadius:"5px",
                    background:TAG[t].bg, color:TAG[t].text, border:`1px solid ${TAG[t].border}`,
                  }}>{t}</span>
                ))}
              </div>
            </div>

            {/* Item grid */}
            <div style={{
              display:"grid",
              gridTemplateColumns:`repeat(${cols},1fr)`,
              gap:"8px", flex:1, alignContent:"start",
            }}>
              {cat.items.map((item,ii)=>(
                <TopicCard key={item.id} item={item} catColor={cat.color} onLeafClick={onLeafClick} animDelay={ii*25}/>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile accordion */}
      {isMobile && (
        <div style={{display:"flex", flexDirection:"column", gap:"6px"}}>
          {tab.categories.map(c => {
            const open = catId===c.id;
            return (
              <div key={c.id} style={{
                borderRadius:"13px",
                border:`1px solid ${open ? c.color+"45" : "rgba(255,255,255,0.07)"}`,
                overflow:"hidden",
                transition:"border-color .18s",
                boxShadow: open ? `0 4px 20px ${c.color}14` : "none",
              }}>
                <button onClick={()=>setCatId(open ? "__none" : c.id)} style={{
                  width:"100%", display:"flex", alignItems:"center", gap:"10px",
                  padding:"14px", background: open ? `${c.color}12` : "rgba(255,255,255,0.025)",
                  border:"none", cursor:"pointer", textAlign:"left",
                  fontFamily:"'DM Sans',sans-serif", transition:"background .18s",
                }}>
                  <span style={{
                    width:"30px", height:"30px", borderRadius:"9px", flexShrink:0,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:"13px", color:c.color,
                    background:`${c.color}18`, border:`1px solid ${c.color}28`,
                    boxShadow: open ? `0 0 10px ${c.color}28` : "none",
                  }}>{c.icon}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:"13px", fontWeight:700, color:open ? c.color : "#94a3b8"}}>{c.label}</div>
                    <div style={{fontSize:"10px", color:"#4b5563", marginTop:"2px"}}>{c.desc} · {c.items.length} topics</div>
                  </div>
                  <span style={{
                    fontSize:"10px", color:open ? c.color : "#4b5563",
                    transform:open ? "rotate(180deg)" : "rotate(0deg)",
                    transition:"transform .25s, color .18s",
                    display:"inline-block", flexShrink:0,
                  }}>▼</span>
                </button>
                {open && (
                  <div style={{padding:"12px", background:"rgba(0,0,0,0.15)", animation:"itemFade .22s ease-out"}}>
                    <div style={{display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:"6px"}}>
                      {c.items.map((item,ii)=>(
                        <TopicCard key={item.id} item={item} catColor={c.color} onLeafClick={onLeafClick} animDelay={ii*18}/>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE CARD — Enhanced glass morphism + icon treatment
// ─────────────────────────────────────────────────────────────────────────────
function FeatureCard({ icon, title, desc, accent, delay }) {
  const [vis, setVis] = useState(false);
  const [hov, setHov] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const t = setTimeout(() => {
      const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); });
      if (ref.current) obs.observe(ref.current);
      return () => obs.disconnect();
    }, delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position:"relative", overflow:"hidden",
        background: hov ? `${accent}08` : "rgba(255,255,255,0.025)",
        border:`1px solid ${hov ? accent+"35" : "rgba(255,255,255,0.06)"}`,
        borderRadius:"16px", padding:"24px 22px",
        transition:"all .3s cubic-bezier(.16,1,.3,1)",
        opacity:vis?1:0, transform:vis ? (hov ? "translateY(-5px)" : "translateY(0)") : "translateY(20px)",
        cursor:"default",
        boxShadow: hov ? `0 20px 44px ${accent}12, inset 0 1px 0 rgba(255,255,255,0.06)` : "inset 0 1px 0 rgba(255,255,255,0.03)",
      }}
    >
      {/* Corner glow */}
      <div style={{
        position:"absolute", top:0, left:0, width:"80px", height:"80px",
        background:`radial-gradient(circle at 0% 0%, ${accent}${hov?"20":"10"}, transparent 65%)`,
        pointerEvents:"none", transition:"opacity .3s",
      }}/>

      {/* Icon */}
      <div style={{
        width:"44px", height:"44px", borderRadius:"12px",
        background: hov ? `${accent}20` : `${accent}12`,
        border:`1px solid ${hov ? accent+"35" : accent+"20"}`,
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:"20px", marginBottom:"14px", position:"relative",
        boxShadow: hov ? `0 0 16px ${accent}28` : "none",
        transition:"all .3s",
      }}>{icon}</div>

      <div style={{fontSize:"13px", fontWeight:800, color: hov ? "#f1f5f9" : "#e2e8f0", marginBottom:"8px", letterSpacing:"-0.01em", position:"relative"}}>{title}</div>
      <div style={{fontSize:"12px", color:"#4b5563", lineHeight:1.7, position:"relative"}}>{desc}</div>

      {/* Bottom accent line */}
      <div style={{
        position:"absolute", bottom:0, left:0, right:0, height:"1px",
        background:`linear-gradient(to right, transparent, ${accent}${hov?"50":"20"}, transparent)`,
        transition:"opacity .3s",
      }}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STAT CARD
// ─────────────────────────────────────────────────────────────────────────────
function StatCard({ num, suffix, label, accent, delay }) {
  const [vis, setVis] = useState(false);
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const t = setTimeout(() => {
      const obs = new IntersectionObserver(([e]) => {
        if (e.isIntersecting && !started.current) {
          started.current = true; setVis(true);
          let s=0; const step=num/55;
          const timer=setInterval(()=>{s+=step;if(s>=num){setCount(num);clearInterval(timer);}else setCount(Math.floor(s));},18);
        }
      });
      if (ref.current) obs.observe(ref.current);
      return () => obs.disconnect();
    }, delay);
    return () => clearTimeout(t);
  }, [delay, num]);

  return (
    <div ref={ref} style={{
      textAlign:"center", padding:"24px 16px", borderRadius:"14px",
      background:"rgba(255,255,255,0.025)",
      border:"1px solid rgba(255,255,255,0.06)",
      transition:"all .4s cubic-bezier(.16,1,.3,1)",
      opacity:vis?1:0, transform:vis?"translateY(0)":"translateY(14px)",
      position:"relative", overflow:"hidden",
    }}>
      <div style={{
        position:"absolute", top:0, left:"50%", transform:"translateX(-50%)",
        width:"60%", height:"1px",
        background:`linear-gradient(to right, transparent, ${accent}50, transparent)`,
      }}/>
      <div style={{
        fontSize:"clamp(28px,4vw,40px)", fontWeight:900,
        fontFamily:"'Space Mono',monospace", color:accent,
        lineHeight:1, marginBottom:"6px", letterSpacing:"-0.02em",
        filter:`drop-shadow(0 0 12px ${accent}50)`,
      }}>
        {count}{suffix}
      </div>
      <div style={{fontSize:"11px", color:"#4b5563", fontWeight:500, letterSpacing:"0.03em"}}>{label}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TOAST
// ─────────────────────────────────────────────────────────────────────────────
function Toast({ message, onClose }) {
  useEffect(()=>{const t=setTimeout(onClose,2500);return()=>clearTimeout(t);},[onClose]);
  return (
    <div style={{
      position:"fixed", bottom:"24px", right:"24px",
      background:"linear-gradient(135deg, #4f46e5, #7c3aed)",
      color:"#fff", padding:"12px 20px", borderRadius:"12px",
      fontSize:"12px", fontWeight:600, zIndex:9999,
      boxShadow:"0 8px 32px rgba(99,102,241,.5), 0 0 0 1px rgba(255,255,255,0.1)",
      animation:"toastIn .28s cubic-bezier(.16,1,.3,1)",
      maxWidth:"calc(100vw - 48px)",
      display:"flex", alignItems:"center", gap:"8px",
    }}>
      <span style={{opacity:.75, fontSize:"10px"}}>✦</span> {message}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const router = useRouter();
  const [toast,   setToast]   = useState(null);
  const [heroVis, setHeroVis] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile(768);

  useEffect(() => {
    setTimeout(() => setHeroVis(true), 80);
    const fn = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", fn, {passive:true});
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const handleLeafClick = useCallback((item) => {
    const route = ROUTES[item.id];
    if (route) { setToast(`Opening ${item.label}…`); router.push(route); }
    else setToast(`${item.label} — coming soon!`);
  }, [router]);

  const features = [
    {icon:"⚡",accent:"#818cf8",title:"Step-by-step playback",  desc:"Pause, rewind and scrub through every operation at any speed from 0.25× to 4×."},
    {icon:"🎨",accent:"#a78bfa",title:"Fluid animations",       desc:"Every pointer, swap and comparison rendered with colour-coded precision."},
    {icon:"📊",accent:"#22d3ee",title:"Live Big-O analysis",    desc:"Time and space complexity updates in real-time as your algorithm executes."},
    {icon:"🧠",accent:"#34d399",title:"40+ topics",             desc:"Arrays to Dijkstra — the full competitive-programming toolkit, nothing left out."},
    {icon:"🔗",accent:"#f472b6",title:"Interactive explorer",   desc:"Select any category and click a card to launch that visualizer immediately."},
    {icon:"🌙",accent:"#fb923c",title:"Built for grinders",     desc:"Dark-first, zero-distraction. Engineered for focused late-night sessions."},
  ];

  const stats = [
    {num:40, suffix:"+", label:"Topics covered",     accent:"#818cf8"},
    {num:12, suffix:"+", label:"Sorting algorithms", accent:"#22d3ee"},
    {num:8,  suffix:"+", label:"Graph algorithms",   accent:"#34d399"},
    {num:100,suffix:"%", label:"Free forever",       accent:"#f472b6"},
  ];

  const navScrolled = scrollY > 40;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,700;0,9..40,900;1,9..40,400&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        html { scroll-behavior:smooth; -webkit-text-size-adjust:100%; }
        body { background:#030912; font-family:'DM Sans',sans-serif; color:#e2e8f0; overflow-x:hidden; }
        ::-webkit-scrollbar { width:3px; }
        ::-webkit-scrollbar-track { background:#030912; }
        ::-webkit-scrollbar-thumb { background:#4f46e5; border-radius:2px; }
        html, body { max-width:100%; width:100%; }

        @keyframes toastIn     { from{opacity:0;transform:translateY(10px)scale(.96)} to{opacity:1;transform:none} }
        @keyframes pulseRing   { 0%,100%{opacity:.4;transform:translate(-50%,-50%)scale(1)} 50%{opacity:.12;transform:translate(-50%,-50%)scale(1.15)} }
        @keyframes shimmer     { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes scrollBounce{ 0%,100%{transform:translateX(-50%)translateY(0)} 50%{transform:translateX(-50%)translateY(7px)} }
        @keyframes itemFade    { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:none} }
        @keyframes scanline    { 0%{left:-50%} 100%{left:150%} }
        @keyframes badgePulse  { 0%,100%{opacity:1} 50%{opacity:.55} }
        @keyframes heroIn      { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:none} }
        @keyframes badgeSweep  { 0%{left:-80%} 60%,100%{left:170%} }
        @keyframes logoPulse   { 0%,100%{opacity:.7;transform:scale(1)} 50%{opacity:1;transform:scale(1.08)} }
        @keyframes borderSpin  { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        @keyframes fadeInScale { from{opacity:0;transform:scale(.96)} to{opacity:1;transform:scale(1)} }
        @keyframes floatUp     { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }

        .shimmer-text {
          background: linear-gradient(90deg,#6366f1 0%,#a5b4fc 28%,#e0e7ff 50%,#a5b4fc 72%,#6366f1 100%);
          background-size:200% auto;
          -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
          animation:shimmer 5s linear infinite;
          /* Fix descender clipping */
          display:inline-block;
          padding-bottom:0.1em;
          margin-bottom:-0.1em;
        }

        .container {
          width:100%; max-width:1180px;
          margin-left:auto; margin-right:auto;
          padding-left:clamp(16px,4vw,44px);
          padding-right:clamp(16px,4vw,44px);
          box-sizing:border-box;
        }

        .nav-bar-inner {
          display:flex; align-items:center; justify-content:space-between; height:62px;
        }
        .nav-logo { display:flex; align-items:center; flex-shrink:0; }
        .nav-links-right { display:flex; align-items:center; gap:4px; }
        @media(max-width:768px) { .nav-links-right { display:none !important; } }

        .nav-link {
          color:#4b5563; text-decoration:none; font-size:12px; font-weight:600;
          letter-spacing:0.04em; text-transform:uppercase; padding:6px 14px;
          border-radius:8px; border:1px solid transparent;
          transition:all .2s cubic-bezier(.16,1,.3,1); white-space:nowrap;
        }
        .nav-link:hover { color:#c7d2fe; background:rgba(129,140,248,0.08); border-color:rgba(129,140,248,0.2); }

        .glow-btn {
          background:linear-gradient(135deg,#4f46e5,#7c3aed); color:#fff; border:none;
          border-radius:12px; padding:14px 32px; font-size:14px; font-weight:700;
          cursor:pointer; position:relative; overflow:hidden;
          transition:transform .18s, box-shadow .18s;
          box-shadow:0 4px 22px rgba(99,102,241,.35);
          font-family:'DM Sans',sans-serif; letter-spacing:.015em; white-space:nowrap;
          display:inline-flex; align-items:center; justify-content:center; text-decoration:none;
        }
        .glow-btn:hover { transform:translateY(-2px); box-shadow:0 10px 40px rgba(99,102,241,.55); }
        .glow-btn:active { transform:translateY(0) scale(.98); }
        .glow-btn::after {
          content:''; position:absolute; top:-50%; left:-60%;
          width:50%; height:200%; background:rgba(255,255,255,.14);
          transform:skewX(-20deg); transition:left .5s;
        }
        .glow-btn:hover::after { left:120%; }

        .hr {
          width:100%; height:1px;
          background:linear-gradient(to right, transparent, rgba(255,255,255,0.06) 20%, rgba(255,255,255,0.06) 80%, transparent);
        }

        .feat-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
        .stats-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; }

        @media(max-width:1024px) { .stats-grid { grid-template-columns:repeat(2,1fr); } }
        @media(max-width:900px) { .feat-grid { grid-template-columns:repeat(2,1fr); } }
        @media(max-width:768px) {
          .hero-btns { flex-direction:column!important; align-items:stretch!important; width:100%; }
          .hero-btns .glow-btn { width:100%; max-width:100%; }
        }
        @media(max-width:580px) {
          .feat-grid { grid-template-columns:1fr; }
          .stats-grid { grid-template-columns:repeat(2,1fr); }
          .footer-inner { flex-direction:column!important; align-items:center!important; text-align:center; gap:16px!important; }
          .footer-links { justify-content:center!important; }
        }

        /* Mobile menu */
        .mobile-menu-overlay {
          position:fixed; inset:0; z-index:200;
          background:rgba(3,9,18,0.97); backdrop-filter:blur(24px);
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          gap:28px; animation:fadeInScale .24s cubic-bezier(.16,1,.3,1);
        }
        .mobile-nav-link {
          color:#64748b; text-decoration:none; font-size:24px; font-weight:800;
          transition:color .18s; letter-spacing:-0.02em;
        }
        .mobile-nav-link:hover { color:#c7d2fe; }

        /* Hamburger button */
        .hamburger-btn {
          display:none;
          background:rgba(255,255,255,0.04);
          border:1px solid rgba(255,255,255,0.08);
          border-radius:10px; padding:8px 10px;
          color:#64748b; cursor:pointer; font-size:16px;
          transition:all .2s; line-height:1;
        }
        @media(max-width:768px) { .hamburger-btn { display:flex; align-items:center; justify-content:center; } }
        .hamburger-btn:hover { color:#c7d2fe; background:rgba(129,140,248,0.1); border-color:rgba(129,140,248,0.25); }
      `}</style>

      <ParticleCanvas />

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="mobile-menu-overlay">
          <button
            onClick={() => setMobileMenuOpen(false)}
            style={{position:"absolute",top:"16px",right:"16px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"9px",color:"#64748b",fontSize:"16px",cursor:"pointer",padding:"8px 11px",lineHeight:1,transition:"all .2s"}}
          >✕</button>
          <PremiumLogo size="lg" />
          {[["#features","Features"],["#tree","Topics"],["#footer","End"]].map(([href,label])=>(
            <a key={href} href={href} onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">{label}</a>
          ))}
          <a href="#tree" onClick={() => setMobileMenuOpen(false)} className="glow-btn" style={{marginTop:"8px",padding:"14px 40px",fontSize:"15px"}}>Get Started →</a>
        </div>
      )}

      {/* ════ NAV ═══════════════════════════════════════════════════ */}
      <nav style={{
        position:"fixed", top:0, left:0, right:0, zIndex:100,
        background: navScrolled ? "rgba(3,9,18,0.95)" : "rgba(3,9,18,0.6)",
        backdropFilter:"blur(24px) saturate(160%)",
        borderBottom: navScrolled ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(255,255,255,0.04)",
        transition:"all .3s cubic-bezier(.16,1,.3,1)",
      }}>
        {/* Top shimmer line — shows when scrolled */}
        {navScrolled && (
          <div style={{
            position:"absolute", top:0, left:0, right:0, height:"1px",
            background:"linear-gradient(to right, transparent, rgba(129,140,248,0.4) 30%, rgba(167,139,250,0.5) 50%, rgba(129,140,248,0.4) 70%, transparent)",
          }}/>
        )}
        <div className="container" style={{paddingTop:"0", paddingBottom:"0"}}>
          <div className="nav-bar-inner">
            <div className="nav-logo"><PremiumLogo /></div>

            {/* Desktop nav */}
            <div className="nav-links-right">
              {[["#features","Features"],["#tree","Topics"],["#footer","End"]].map(([href,label])=>(
                <a key={href} href={href} className="nav-link">{label}</a>
              ))}
              <a href="#tree" style={{
                marginLeft:"8px", display:"inline-flex", alignItems:"center", gap:"6px",
                padding:"8px 18px", borderRadius:"10px",
                background:"linear-gradient(135deg, rgba(79,70,229,0.22), rgba(124,58,237,0.18))",
                border:"1px solid rgba(129,140,248,0.3)",
                color:"#a5b4fc", fontSize:"12px", fontWeight:700,
                letterSpacing:"0.04em", textTransform:"uppercase", textDecoration:"none",
                transition:"all .2s cubic-bezier(.16,1,.3,1)",
                boxShadow:"0 2px 14px rgba(99,102,241,0.18)",
              }}
              onMouseEnter={e=>{e.currentTarget.style.background="linear-gradient(135deg,rgba(79,70,229,0.35),rgba(124,58,237,0.3))";e.currentTarget.style.borderColor="rgba(129,140,248,0.55)";e.currentTarget.style.color="#e0e7ff";e.currentTarget.style.boxShadow="0 4px 24px rgba(99,102,241,0.32)";}}
              onMouseLeave={e=>{e.currentTarget.style.background="linear-gradient(135deg,rgba(79,70,229,0.22),rgba(124,58,237,0.18))";e.currentTarget.style.borderColor="rgba(129,140,248,0.3)";e.currentTarget.style.color="#a5b4fc";e.currentTarget.style.boxShadow="0 2px 14px rgba(99,102,241,0.18)";}}>
                Get Started →
              </a>
            </div>

            {/* Mobile hamburger */}
            <button className="hamburger-btn" onClick={() => setMobileMenuOpen(true)} aria-label="Open menu">☰</button>
          </div>
        </div>
      </nav>

      {/* ════ HERO ══════════════════════════════════════════════════ */}
      <section style={{
        minHeight:"100vh", display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center",
        paddingTop:"clamp(100px,14vw,130px)",
        paddingBottom:"clamp(60px,8vw,90px)",
        position:"relative", zIndex:1, textAlign:"center", overflow:"hidden", width:"100%",
      }}>
        {/* Ambient glows */}
        <div style={{position:"absolute",width:"min(900px,130vw)",height:"min(700px,100vw)",borderRadius:"50%",background:"radial-gradient(ellipse,rgba(79,70,229,0.18) 0%,rgba(99,102,241,0.08) 35%,transparent 70%)",top:"50%",left:"50%",transform:"translate(-50%,-55%)",pointerEvents:"none",zIndex:0}}/>
        <div style={{position:"absolute",width:"min(480px,80vw)",height:"min(480px,80vw)",borderRadius:"50%",background:"radial-gradient(circle,rgba(129,140,248,0.22) 0%,rgba(99,102,241,0.1) 40%,transparent 68%)",top:"45%",left:"50%",transform:"translate(-50%,-50%)",pointerEvents:"none",zIndex:0}}/>
        <div style={{position:"absolute",width:"min(380px,60vw)",height:"min(380px,60vw)",borderRadius:"50%",background:"radial-gradient(circle,rgba(167,139,250,0.14) 0%,transparent 65%)",top:"38%",left:"62%",transform:"translateX(-50%)",pointerEvents:"none",zIndex:0}}/>
        <div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:"60%",height:"2px",background:"linear-gradient(to right,transparent,rgba(129,140,248,0.35) 30%,rgba(167,139,250,0.45) 50%,rgba(129,140,248,0.35) 70%,transparent)",pointerEvents:"none",zIndex:0}}/>
        <div style={{position:"absolute",width:"min(700px,95vw)",height:"min(700px,95vw)",borderRadius:"50%",border:"1px solid rgba(99,102,241,0.06)",top:"50%",left:"50%",transform:"translate(-50%,-50%)",animation:"pulseRing 8s ease-in-out infinite",pointerEvents:"none",zIndex:0}}/>

        <div className="container" style={{display:"flex",flexDirection:"column",alignItems:"center",width:"100%",position:"relative",zIndex:1}}>

          {/* Badge */}
          <div style={{
            display:"inline-flex", alignItems:"center", gap:"8px",
            background:"rgba(110,231,183,0.07)", border:"1px solid rgba(110,231,183,0.2)",
            borderRadius:"999px", padding:"5px 16px",
            fontSize:"10px", fontWeight:700, color:"#6ee7b7", letterSpacing:"0.1em", textTransform:"uppercase",
            marginBottom:"26px",
            opacity:heroVis?1:0, transform:heroVis?"translateY(0)":"translateY(-10px)",
            transition:"all .6s cubic-bezier(.16,1,.3,1)",
          }}>
            <span style={{width:"6px",height:"6px",borderRadius:"50%",background:"#6ee7b7",display:"inline-block",boxShadow:"0 0 6px #6ee7b7",animation:"badgePulse 2.2s ease-in-out infinite"}}/>
            Visual Learning · 40+ Topics
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize:"clamp(32px,8.5vw,90px)", fontWeight:900, lineHeight:1.02,
            maxWidth:"820px", marginBottom:"20px", letterSpacing:"-0.025em",
            opacity:heroVis?1:0,
            animation:heroVis?"heroIn .7s .08s both cubic-bezier(.16,1,.3,1)":"none",
          }}>
            {/* Apply the same fix to h1 shimmer text */}
            <span className="shimmer-text">See the code.</span><br/>
            <span style={{color:"#f8fafc"}}>Feel the logic.</span>
          </h1>

          {/* Subtext */}
          <p style={{
            fontSize:"clamp(14px,2vw,17px)", color:"#64748b", maxWidth:"500px",
            lineHeight:1.8, marginBottom:"34px",
            opacity:heroVis?1:0,
            animation:heroVis?"heroIn .7s .18s both cubic-bezier(.16,1,.3,1)":"none",
          }}>
            Interactive visualizations for every major data structure and algorithm.
            Step through, watch complexity unfold — finally{" "}
            <em style={{color:"#a5b4fc",fontStyle:"normal",fontWeight:700,background:"rgba(99,102,241,0.1)",padding:"1px 7px",borderRadius:"5px"}}>understand</em>{" "}DSA.
          </p>

          {/* CTA */}
          <div className="hero-btns" style={{
            display:"flex", gap:"12px", flexWrap:"wrap", justifyContent:"center", alignItems:"center",
            width:"100%", maxWidth:"420px",
            opacity:heroVis?1:0,
            animation:heroVis?"heroIn .7s .28s both cubic-bezier(.16,1,.3,1)":"none",
          }}>
            <a href="#tree" className="glow-btn" style={{flex:"1 1 auto", fontSize:"15px", padding:"15px 36px"}}>
              Explore Topics ↓
            </a>
            <a href="#features" style={{
              flex:"0 0 auto", display:"inline-flex", alignItems:"center", gap:"6px",
              padding:"15px 22px", borderRadius:"12px",
              background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)",
              color:"#94a3b8", fontSize:"14px", fontWeight:600, textDecoration:"none",
              transition:"all .2s",
            }}
            onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.07)";e.currentTarget.style.color="#e2e8f0";}}
            onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.04)";e.currentTarget.style.color="#94a3b8";}}>
              Learn more
            </a>
          </div>

          {/* Floating scroll indicator */}
          <div style={{
            position:"absolute", bottom:"-clamp(50px,6vw,70px)", left:"50%",
            display:"flex", flexDirection:"column", alignItems:"center", gap:"5px",
            animation:"scrollBounce 2.4s ease-in-out infinite",
            opacity:heroVis?0.28:0, transition:"opacity .8s 1s", zIndex:1,
          }}>
            <span style={{fontSize:"9px",letterSpacing:"0.14em",color:"#374151",textTransform:"uppercase"}}>scroll</span>
            <div style={{width:"1px",height:"24px",background:"linear-gradient(to bottom,#6366f1,transparent)"}}/>
          </div>
        </div>
      </section>

      <div className="hr"/>

      {/* ════ STATS ═════════════════════════════════════════════════ */}
      <section style={{paddingTop:"clamp(44px,6vw,64px)",paddingBottom:"clamp(44px,6vw,64px)",position:"relative",zIndex:1}}>
        <div className="container">
          <div className="stats-grid">
            {stats.map((s,i)=><StatCard key={s.label} {...s} delay={i*55}/>)}
          </div>
        </div>
      </section>

      <div className="hr"/>

      {/* ════ FEATURES ══════════════════════════════════════════════ */}
      <section id="features" style={{paddingTop:"clamp(64px,8vw,96px)",paddingBottom:"clamp(64px,8vw,96px)",position:"relative",zIndex:1}}>
        <div className="container">
          <div style={{textAlign:"center",marginBottom:"clamp(36px,5vw,52px)"}}>
            <p style={{fontSize:"10px",fontWeight:700,letterSpacing:"0.16em",color:"#6366f1",textTransform:"uppercase",marginBottom:"10px"}}>Why VisuoSlayer</p>
            <h2 style={{fontSize:"clamp(22px,4.5vw,44px)",fontWeight:900,color:"#f8fafc",letterSpacing:"-0.025em",marginBottom:"12px",lineHeight:1.06}}>
              Everything to{" "}<span className="shimmer-text">master DSA</span>
            </h2>
            <p style={{color:"#4b5563",fontSize:"14px",maxWidth:"360px",margin:"0 auto",lineHeight:1.7}}>
              One platform. Every structure. Every algorithm. All visual.
            </p>
          </div>
          <div className="feat-grid">
            {features.map((f,i)=><FeatureCard key={f.title} {...f} delay={i*40}/>)}
          </div>
        </div>
      </section>

      <div className="hr"/>

      {/* ════ DSA EXPLORER ══════════════════════════════════════════ */}
      <section id="tree" style={{paddingTop:"clamp(64px,8vw,96px)",paddingBottom:"clamp(64px,8vw,96px)",position:"relative",zIndex:1,overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 18% 50%,rgba(79,70,229,0.05) 0%,transparent 46%),radial-gradient(ellipse at 82% 50%,rgba(8,145,178,0.04) 0%,transparent 46%)",pointerEvents:"none"}}/>

        <div className="container" style={{textAlign:"center",marginBottom:"clamp(28px,4vw,44px)"}}>
          <h2 style={{fontSize:"clamp(22px,4.5vw,44px)",fontWeight:900,color:"#f8fafc",letterSpacing:"-0.025em",lineHeight:1.06}}>
            Click any topic to{" "}<span className="shimmer-text">launch it</span>
          </h2>
        </div>

        <div className="container">
          <div style={{
            background:"rgba(3,9,18,0.6)",
            border:"1px solid rgba(255,255,255,0.08)",
            borderRadius:"22px", padding:"clamp(14px,2.5vw,26px)",
            boxShadow:"0 0 0 1px rgba(99,102,241,0.05), 0 28px 64px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.05)",
            position:"relative", overflow:"hidden",
          }}>
            <div style={{position:"absolute",top:0,left:0,width:"120px",height:"120px",background:"radial-gradient(circle at 0% 0%,rgba(99,102,241,0.1) 0%,transparent 60%)",pointerEvents:"none"}}/>
            <div style={{position:"absolute",bottom:0,right:0,width:"120px",height:"120px",background:"radial-gradient(circle at 100% 100%,rgba(6,182,212,0.08) 0%,transparent 60%)",pointerEvents:"none"}}/>
            <div style={{position:"absolute",top:0,left:"-50%",width:"40%",height:"100%",background:"linear-gradient(100deg,transparent,rgba(255,255,255,0.006),transparent)",animation:"scanline 8s ease-in-out infinite",pointerEvents:"none"}}/>
            <DSAExplorer onLeafClick={handleLeafClick}/>
          </div>
        </div>

        {/* Legend */}
        <div style={{display:"flex",justifyContent:"center",gap:"20px",flexWrap:"wrap",marginTop:"22px",padding:"0 clamp(16px,4vw,44px)"}}>
          {[{dot:"#818cf8",label:"Basic"},{dot:"#22d3ee",label:"Intermediate"},{dot:"#f87171",label:"Advanced"}].map(({dot,label})=>(
            <div key={label} style={{display:"flex",alignItems:"center",gap:"6px"}}>
              <span style={{width:"7px",height:"7px",borderRadius:"50%",background:dot,boxShadow:`0 0 5px ${dot}`,display:"inline-block"}}/>
              <span style={{fontSize:"11px",color:"#4b5563",letterSpacing:"0.04em",fontWeight:500}}>{label}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="hr"/>

      {/* ════ CTA ═══════════════════════════════════════════════════ */}
      <section style={{paddingTop:"clamp(72px,9vw,108px)",paddingBottom:"clamp(72px,9vw,108px)",position:"relative",zIndex:1,overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 50% 60%,rgba(79,70,229,0.1) 0%,transparent 55%)",pointerEvents:"none"}}/>
        {/* Decorative ring */}
        <div style={{position:"absolute",top:"50%",left:"50%",width:"500px",height:"500px",borderRadius:"50%",border:"1px solid rgba(99,102,241,0.06)",transform:"translate(-50%,-50%)",animation:"pulseRing 10s ease-in-out infinite",pointerEvents:"none"}}/>
        <div className="container" style={{textAlign:"center",position:"relative"}}>
          <p style={{fontSize:"10px",fontWeight:700,letterSpacing:"0.16em",color:"#6366f1",textTransform:"uppercase",marginBottom:"10px"}}>Ready to level up?</p>
          <h2 style={{fontSize:"clamp(24px,5.5vw,54px)",fontWeight:900,color:"#f8fafc",marginBottom:"14px",letterSpacing:"-0.025em",lineHeight:1.06}}>
            Stop memorizing.<br/><span className="shimmer-text">Start visualizing.</span>
          </h2>
          <p style={{color:"#4b5563",fontSize:"14px",maxWidth:"360px",margin:"0 auto 32px",lineHeight:1.7}}>
            Open source · No account needed · Just click and learn.
          </p>
          <a href="#tree" className="glow-btn" style={{fontSize:"15px",padding:"15px 44px"}}>
            Get Started — It&apos;s Free →
          </a>
        </div>
      </section>

      <div className="hr"/>

      {/* ════ FOOTER ════════════════════════════════════════════════ */}
      <footer id="footer" style={{paddingTop:"clamp(24px,3vw,32px)",paddingBottom:"clamp(24px,3vw,32px)",position:"relative",zIndex:1,background:"rgba(3,9,18,0.8)"}}>
        <div className="container">
          <div className="footer-inner" style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"14px"}}>
            <PremiumLogo />
            <div className="footer-links" style={{display:"flex",gap:"20px",flexWrap:"wrap",alignItems:"center"}}>
              {[["#features","Features"],["#tree","Topics"],["#","GitHub"]].map(([href,label])=>(
                <a key={label} href={href} style={{color:"#1e293b",textDecoration:"none",fontSize:"12px",fontWeight:500,transition:"color .18s"}}
                  onMouseEnter={e=>e.target.style.color="#a5b4fc"} onMouseLeave={e=>e.target.style.color="#1e293b"}>{label}</a>
              ))}
            </div>
            <p style={{color:"#1e293b",fontSize:"11px"}}>Built with Next.js · Open source</p>
          </div>
        </div>
      </footer>

      {toast && <Toast message={toast} onClose={()=>setToast(null)}/>}
    </>
  );
}