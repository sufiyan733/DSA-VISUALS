"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

// ─────────────────────────────────────────────────────────────────────────────
// ROUTE MAP — item id → exact Next.js route slug
// Add new entries here as you build more visualizer pages
// ─────────────────────────────────────────────────────────────────────────────
const ROUTES = {
  // ── Data Structures ──
  "array":        "/array",
  "linked-list":  "/linked-list",
  "stack":        "/stack",
  "queue":        "/queue",
  "deque":        "/deque",
  "binary-tree":  "/binary-tree",
  "bst":          "/bs-tree",       // folder is bs-tree
  "avl":          "/avl-tree",
  "heap":         "/heap",
  "trie":         "/trie",
  "graph":        "/graph",
  "adj-list":     "/adj-list",
  "adj-matrix":   "/adj-matrix",
  "hash-map":     "/hash-map",
  "hash-set":     "/hash-set",
  // ── Algorithms ──
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

// ─── hooks ──────────────────────────────────────────────────────────────────
function useIsMobile(bp = 768) {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width:${bp}px)`);
    setMobile(mq.matches);
    const fn = e => setMobile(e.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
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
// TOPIC CARD  (leaf)
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
        position:"relative", padding:"12px 13px", borderRadius:"11px",
        cursor:"pointer", overflow:"hidden",
        background: hov ? `${catColor}0e` : "rgba(255,255,255,0.028)",
        border:`1px solid ${hov ? catColor+"50" : "rgba(255,255,255,0.06)"}`,
        boxShadow: hov ? `0 4px 18px ${catColor}18` : "none",
        transition:"all .16s cubic-bezier(.16,1,.3,1)",
        transform: hov ? "translateY(-2px)" : "translateY(0)",
        animation:`itemFade .26s ${animDelay}ms both ease-out`,
      }}
    >
      {hov && <div style={{position:"absolute",inset:0,borderRadius:"11px",background:`radial-gradient(ellipse at 50% -10%,${catColor}12,transparent 60%)`,pointerEvents:"none"}}/>}
      <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"7px"}}>
        <span style={{
          width:"24px",height:"24px",borderRadius:"7px",flexShrink:0,
          display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:"10px",fontFamily:"'Space Mono',monospace",color:catColor,
          background:`${catColor}18`,border:`1px solid ${hov?catColor+"45":catColor+"22"}`,
          transition:"all .16s",
          ...(hov?{background:`${catColor}24`,boxShadow:`0 0 8px ${catColor}28`}:{}),
        }}>{item.icon}</span>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:"12px",fontWeight:700,color:hov?"#f1f5f9":"#94a3b8",transition:"color .16s",lineHeight:1.2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{item.label}</div>
          <div style={{fontSize:"9px",color:"#2d3748",lineHeight:1.2,marginTop:"1px"}}>{item.desc}</div>
        </div>
      </div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <code style={{fontSize:"9px",fontFamily:"'Space Mono',monospace",color:hov?catColor:"#374151",transition:"color .16s"}}>{item.complexity}</code>
        <span style={{fontSize:"8px",fontWeight:700,letterSpacing:"0.04em",padding:"2px 6px",borderRadius:"4px",background:tc.bg,color:tc.text,border:`1px solid ${tc.border}`}}>{item.tag}</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DSA EXPLORER  — sidebar on desktop, accordion on mobile
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
    <div style={{width:"100%",fontFamily:"'DM Sans',sans-serif"}}>

      {/* Tab switcher */}
      <div style={{display:"flex",justifyContent:"center",marginBottom:"20px"}}>
        <div style={{display:"flex",gap:"5px",padding:"4px",borderRadius:"13px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)"}}>
          {Object.entries(TREE).map(([id,t]) => {
            const active = tabId===id;
            return (
              <button key={id} onClick={()=>switchTab(id)} style={{
                display:"flex",alignItems:"center",gap:"6px",
                padding: isMobile ? "8px 14px" : "9px 22px",
                borderRadius:"9px",
                background:active?`${t.accent}1c`:"transparent",
                border:`1px solid ${active?t.accent+"55":"transparent"}`,
                color:active?t.accent:"#4b5563",
                fontSize: isMobile ? "12px" : "13px",
                fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",
                transition:"all .18s cubic-bezier(.16,1,.3,1)",
                boxShadow:active?`0 2px 14px ${t.glow}`:"none",
                whiteSpace:"nowrap",userSelect:"none",
              }}>
                <span style={{fontSize:"13px"}}>{id==="ds"?"⬡":"⚙"}</span>
                {isMobile ? (id==="ds"?"Data Structures":"Algorithms") : t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── DESKTOP: sidebar + content grid ── */}
      {!isMobile && (
        <div style={{
          display:"grid",gridTemplateColumns:"185px 1fr",
          borderRadius:"14px",border:"1px solid rgba(255,255,255,0.07)",
          overflow:"hidden",minHeight:"340px",background:"rgba(4,4,20,0.5)",
        }}>
          {/* Sidebar */}
          <div style={{borderRight:"1px solid rgba(255,255,255,0.06)",display:"flex",flexDirection:"column",background:"rgba(0,0,0,0.18)"}}>
            <div style={{padding:"14px 12px 10px",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
              <div style={{display:"flex",alignItems:"center",gap:"6px",marginBottom:"4px"}}>
                <span style={{width:"18px",height:"18px",borderRadius:"5px",background:`${tab.accent}1e`,border:`1px solid ${tab.accent}28`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"9px",color:tab.accent}}>{tabId==="ds"?"⬡":"⚙"}</span>
                <span style={{fontSize:"11px",fontWeight:700,color:tab.accent}}>{tab.label}</span>
              </div>
              <p style={{fontSize:"10px",color:"#374151",lineHeight:1.45}}>{tab.description}</p>
            </div>
            <div style={{padding:"6px",flex:1,display:"flex",flexDirection:"column",gap:"2px"}}>
              <div style={{fontSize:"9px",fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:"#2d3748",padding:"4px 8px 6px"}}>Categories</div>
              {tab.categories.map(c => {
                const active = catId===c.id;
                return (
                  <button key={c.id} onClick={()=>switchCat(c.id)} style={{
                    display:"flex",alignItems:"center",gap:"8px",padding:"8px 10px",borderRadius:"8px",width:"100%",textAlign:"left",
                    background:active?`${c.color}16`:"transparent",border:`1px solid ${active?c.color+"40":"transparent"}`,
                    color:active?c.color:"#4b5563",fontSize:"12px",fontWeight:active?700:500,
                    cursor:"pointer",fontFamily:"'DM Sans',sans-serif",transition:"all .15s",userSelect:"none",
                  }}
                  onMouseEnter={e=>{if(!active){e.currentTarget.style.background=`${c.color}0d`;e.currentTarget.style.color=c.color;}}}
                  onMouseLeave={e=>{if(!active){e.currentTarget.style.background="transparent";e.currentTarget.style.color="#4b5563";}}}>
                    <span style={{width:"6px",height:"6px",borderRadius:"50%",flexShrink:0,background:active?c.color:"#2d3748",boxShadow:active?`0 0 5px ${c.color}`:"none",transition:"all .15s"}}/>
                    <span style={{flex:1}}>{c.label}</span>
                    <span style={{fontSize:"9px",fontWeight:700,padding:"1px 5px",borderRadius:"4px",background:active?`${c.color}20`:"rgba(255,255,255,0.04)",color:active?c.color:"#374151",border:`1px solid ${active?c.color+"28":"rgba(255,255,255,0.05)"}`,transition:"all .15s"}}>{c.items.length}</span>
                  </button>
                );
              })}
            </div>
            <div style={{padding:"10px 12px",borderTop:"1px solid rgba(255,255,255,0.05)"}}>
              <div style={{display:"flex",alignItems:"center",gap:"5px",marginBottom:"2px"}}>
                <span style={{fontSize:"10px",color:cat.color}}>{cat.icon}</span>
                <span style={{fontSize:"10px",fontWeight:700,color:cat.color}}>{cat.label}</span>
              </div>
              <p style={{fontSize:"9px",color:"#374151",lineHeight:1.35}}>{cat.desc}</p>
            </div>
          </div>

          {/* Content */}
          <div style={{padding:"18px",opacity:fadeIn?1:0,transform:fadeIn?"translateY(0)":"translateY(4px)",transition:"opacity .15s,transform .15s",display:"flex",flexDirection:"column"}}>
            <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:"14px",paddingBottom:"12px",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:"7px",marginBottom:"3px"}}>
                  <span style={{width:"26px",height:"26px",borderRadius:"7px",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"11px",fontFamily:"'Space Mono',monospace",color:cat.color,background:`${cat.color}18`,border:`1px solid ${cat.color}28`}}>{cat.icon}</span>
                  <span style={{fontSize:"13px",fontWeight:800,color:"#f1f5f9",letterSpacing:"-0.01em"}}>{cat.label}</span>
                  <span style={{fontSize:"10px",color:"#374151"}}>{cat.items.length} topics</span>
                </div>
                <p style={{fontSize:"11px",color:"#4b5563",marginLeft:"33px"}}>{cat.desc}</p>
              </div>
              <div style={{display:"flex",gap:"5px",flexShrink:0}}>
                {["Basic","Mid","Hard"].map(t=>(
                  <span key={t} style={{fontSize:"8px",fontWeight:700,letterSpacing:"0.05em",padding:"2px 7px",borderRadius:"4px",background:TAG[t].bg,color:TAG[t].text,border:`1px solid ${TAG[t].border}`}}>{t}</span>
                ))}
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:`repeat(${cols},1fr)`,gap:"7px",flex:1,alignContent:"start"}}>
              {cat.items.map((item,ii)=>(
                <TopicCard key={item.id} item={item} catColor={cat.color} onLeafClick={onLeafClick} animDelay={ii*22}/>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── MOBILE: accordion ── */}
      {isMobile && (
        <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
          {tab.categories.map(c => {
            const open = catId===c.id;
            return (
              <div key={c.id} style={{borderRadius:"12px",border:`1px solid ${open?c.color+"45":"rgba(255,255,255,0.07)"}`,overflow:"hidden",transition:"border-color .18s"}}>
                {/* Accordion header */}
                <button onClick={()=>setCatId(open?"__none":c.id)} style={{
                  width:"100%",display:"flex",alignItems:"center",gap:"10px",
                  padding:"13px 14px",background:open?`${c.color}12`:"rgba(255,255,255,0.025)",
                  border:"none",cursor:"pointer",textAlign:"left",fontFamily:"'DM Sans',sans-serif",
                  transition:"background .18s",
                }}>
                  <span style={{width:"28px",height:"28px",borderRadius:"8px",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"12px",color:c.color,background:`${c.color}18`,border:`1px solid ${c.color}28`}}>{c.icon}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:"13px",fontWeight:700,color:open?c.color:"#94a3b8"}}>{c.label}</div>
                    <div style={{fontSize:"10px",color:"#374151",marginTop:"1px"}}>{c.desc} · {c.items.length} topics</div>
                  </div>
                  <span style={{fontSize:"10px",color:open?c.color:"#374151",transform:open?"rotate(180deg)":"rotate(0deg)",transition:"transform .25s",display:"inline-block",flexShrink:0}}>▼</span>
                </button>
                {/* Accordion content */}
                {open && (
                  <div style={{padding:"12px",background:"rgba(0,0,0,0.12)",animation:"itemFade .22s ease-out"}}>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:"6px"}}>
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
// FEATURE CARD
// ─────────────────────────────────────────────────────────────────────────────
function FeatureCard({ icon, title, desc, accent, delay }) {
  const [vis, setVis] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const t = setTimeout(() => {
      const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); });
      if (ref.current) obs.observe(ref.current);
    }, delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div ref={ref} style={{
      position:"relative",overflow:"hidden",
      background:"rgba(255,255,255,0.02)",
      border:"1px solid rgba(255,255,255,0.055)",
      borderRadius:"16px",padding:"24px 20px",
      transition:"all .4s cubic-bezier(.16,1,.3,1)",
      opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(20px)",cursor:"default",
    }}
      onMouseEnter={e=>{e.currentTarget.style.background=`${accent}0a`;e.currentTarget.style.borderColor=`${accent}30`;e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.boxShadow=`0 16px 36px ${accent}10`;}}
      onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.02)";e.currentTarget.style.borderColor="rgba(255,255,255,0.055)";e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="none";}}
    >
      <div style={{position:"absolute",top:0,left:0,width:"56px",height:"56px",background:`radial-gradient(circle at 0% 0%,${accent}14,transparent 70%)`,pointerEvents:"none"}}/>
      <div style={{width:"38px",height:"38px",borderRadius:"10px",background:`${accent}14`,border:`1px solid ${accent}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"18px",marginBottom:"13px",position:"relative"}}>{icon}</div>
      <div style={{fontSize:"13px",fontWeight:700,color:"#e2e8f0",marginBottom:"7px",letterSpacing:"-0.01em"}}>{title}</div>
      <div style={{fontSize:"12px",color:"#4b5563",lineHeight:1.65}}>{desc}</div>
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
  useEffect(() => {
    const t = setTimeout(() => {
      const obs = new IntersectionObserver(([e]) => {
        if (e.isIntersecting) {
          setVis(true);
          let s=0; const step=num/55;
          const timer=setInterval(()=>{s+=step;if(s>=num){setCount(num);clearInterval(timer);}else setCount(Math.floor(s));},18);
        }
      });
      if (ref.current) obs.observe(ref.current);
    }, delay);
    return () => clearTimeout(t);
  }, [delay, num]);

  return (
    <div ref={ref} style={{
      textAlign:"center",padding:"22px 16px",borderRadius:"14px",
      background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.055)",
      transition:"all .4s cubic-bezier(.16,1,.3,1)",
      opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(14px)",
    }}>
      <div style={{fontSize:"clamp(26px,4vw,38px)",fontWeight:900,fontFamily:"'Space Mono',monospace",color:accent,lineHeight:1,marginBottom:"5px",letterSpacing:"-0.02em"}}>
        {count}{suffix}
      </div>
      <div style={{fontSize:"11px",color:"#4b5563",fontWeight:500,letterSpacing:"0.02em"}}>{label}</div>
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
      position:"fixed",bottom:"20px",right:"20px",
      background:"linear-gradient(135deg,#4f46e5,#7c3aed)",
      color:"#fff",padding:"11px 18px",borderRadius:"12px",
      fontSize:"12px",fontWeight:600,zIndex:9999,
      boxShadow:"0 6px 28px rgba(99,102,241,.45)",
      animation:"toastIn .28s cubic-bezier(.16,1,.3,1)",
      maxWidth:"calc(100vw - 40px)",display:"flex",alignItems:"center",gap:"8px",
    }}>
      <span style={{opacity:.75,fontSize:"10px"}}>✦</span> {message}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MOBILE MENU
// ─────────────────────────────────────────────────────────────────────────────
function MobileMenu({ open, onClose }) {
  if (!open) return null;
  return (
    <div style={{position:"fixed",inset:0,zIndex:200,background:"rgba(4,4,16,0.97)",backdropFilter:"blur(22px)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"32px",animation:"fadeInScale .24s cubic-bezier(.16,1,.3,1)"}}>
      <button onClick={onClose} style={{position:"absolute",top:"16px",right:"16px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"8px",color:"#64748b",fontSize:"15px",cursor:"pointer",padding:"7px 10px",lineHeight:1}}>✕</button>
      <div style={{fontFamily:"'Space Mono',monospace",fontWeight:700,fontSize:"20px",marginBottom:"8px",userSelect:"none",lineHeight:1}}>
        <span style={{color:"#c7d2fe"}}>Visuo</span>
        <span style={{background:"linear-gradient(90deg,#818cf8,#a78bfa)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>Slayer</span>
      </div>
      {[["#features","Features"],["#tree","Topics"],["#footer","End"]].map(([href,label])=>(
        <a key={href} href={href} onClick={onClose} style={{color:"#4b5563",textDecoration:"none",fontSize:"22px",fontWeight:800,transition:"color .18s",letterSpacing:"-0.01em"}}
          onMouseEnter={e=>e.target.style.color="#c7d2fe"} onMouseLeave={e=>e.target.style.color="#4b5563"}>{label}</a>
      ))}
      <button className="glow-btn" style={{fontSize:"14px",padding:"13px 30px",marginTop:"4px"}}>Launch App →</button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const router = useRouter();
  const [toast,    setToast]    = useState(null);
  const [heroVis,  setHeroVis]  = useState(false);
  const [scrollY,  setScrollY]  = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setTimeout(() => setHeroVis(true), 80);
    const fn = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", fn, {passive:true});
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const handleLeafClick = useCallback((item) => {
    const route = ROUTES[item.id];
    if (route) {
      setToast(`Opening ${item.label}…`);
      router.push(route);
    } else {
      setToast(`${item.label} — coming soon!`);
    }
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

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,700;0,9..40,900;1,9..40,400&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        html{scroll-behavior:smooth;-webkit-text-size-adjust:100%;}
        body{background:#04040f;font-family:'DM Sans',sans-serif;color:#e2e8f0;overflow-x:hidden;}
        ::-webkit-scrollbar{width:3px;}::-webkit-scrollbar-track{background:#04040f;}::-webkit-scrollbar-thumb{background:#4f46e5;border-radius:2px;}

        @keyframes toastIn    {from{opacity:0;transform:translateY(10px)scale(.96)}to{opacity:1;transform:none}}
        @keyframes fadeInScale{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}
        @keyframes pulseRing  {0%,100%{opacity:.5;transform:translate(-50%,-50%)scale(1)}50%{opacity:.15;transform:translate(-50%,-50%)scale(1.15)}}
        @keyframes shimmer    {0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes scrollBounce{0%,100%{transform:translateX(-50%)translateY(0)}50%{transform:translateX(-50%)translateY(7px)}}
        @keyframes itemFade   {from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}
        @keyframes scanline   {0%{left:-50%}100%{left:150%}}
        @keyframes badgePulse {0%,100%{opacity:1}50%{opacity:.55}}
        @keyframes heroIn     {from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}

        /* ── Type ─────────────────────────────────────────────────── */
        .shimmer-text{
          background:linear-gradient(90deg,#6366f1 0%,#a5b4fc 28%,#e0e7ff 50%,#a5b4fc 72%,#6366f1 100%);
          background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
          animation:shimmer 5s linear infinite;
        }
        /* ── Buttons ──────────────────────────────────────────────── */
        .glow-btn{
          background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;border:none;
          border-radius:12px;padding:14px 32px;font-size:14px;font-weight:700;
          cursor:pointer;position:relative;overflow:hidden;
          transition:transform .18s,box-shadow .18s;
          box-shadow:0 4px 22px rgba(99,102,241,.32);
          font-family:'DM Sans',sans-serif;letter-spacing:.015em;white-space:nowrap;
        }
        .glow-btn:hover{transform:translateY(-2px);box-shadow:0 8px 36px rgba(99,102,241,.52);}
        .glow-btn:active{transform:translateY(0)scale(.98);}
        .glow-btn::after{content:'';position:absolute;top:-50%;left:-60%;width:50%;height:200%;background:rgba(255,255,255,.13);transform:skewX(-20deg);transition:left .5s;}
        .glow-btn:hover::after{left:120%;}
        .ghost-btn{
          display:inline-flex;align-items:center;gap:6px;
          padding:13px 22px;border-radius:12px;
          border:1px solid rgba(255,255,255,0.1);
          color:#64748b;text-decoration:none;font-size:14px;font-weight:600;
          font-family:'DM Sans',sans-serif;transition:all .18s;background:rgba(255,255,255,0.025);
          white-space:nowrap;
        }
        .ghost-btn:hover{color:#a5b4fc;border-color:rgba(99,102,241,0.3);background:rgba(99,102,241,0.06);}
        /* ── Nav links ────────────────────────────────────────────── */
        .nav-link{color:#94a3b8;text-decoration:none;font-size:13px;font-weight:500;transition:color .18s;white-space:nowrap;position:relative;padding:3px 0;}
        .nav-link::after{content:'';position:absolute;bottom:0;left:50%;right:50%;height:1px;background:#818cf8;transition:left .2s,right .2s;}
        .nav-link:hover{color:#c7d2fe;}.nav-link:hover::after{left:0;right:0;}
        /* ── Divider ─────────────────────────────────────────────── */
        .hr{width:100%;height:1px;background:linear-gradient(to right,transparent,rgba(255,255,255,0.06) 20%,rgba(255,255,255,0.06) 80%,transparent);}
        /* ── Grids ───────────────────────────────────────────────── */
        .feat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;}
        .stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;}
        /* ── Responsive ──────────────────────────────────────────── */
        @media(max-width:1024px){.stats-grid{grid-template-columns:repeat(2,1fr)!important;gap:10px;}}
        @media(max-width:900px) {.feat-grid{grid-template-columns:repeat(2,1fr)!important;}}
        @media(max-width:580px) {.feat-grid{grid-template-columns:1fr!important;}.stats-grid{grid-template-columns:repeat(2,1fr)!important;}}
        @media(max-width:768px){
          .nav-links{display:none!important;}
          .hamburger{display:flex!important;}
          .hero-btns{flex-direction:column!important;align-items:center!important;width:100%;}
          .hero-btns .glow-btn,.hero-btns .ghost-btn{width:100%;max-width:320px;justify-content:center;}
          .footer-row{flex-direction:column!important;align-items:center!important;text-align:center;gap:16px;}
          .footer-links{justify-content:center!important;}
          section.pad-x{padding-left:18px!important;padding-right:18px!important;}
        }
        @media(min-width:769px){.hamburger{display:none!important;}}
        @media(max-width:400px){
          .feat-grid{grid-template-columns:1fr!important;}
          .stats-grid{grid-template-columns:1fr 1fr!important;}
        }
      `}</style>

      <ParticleCanvas />
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* ════ NAV ═══════════════════════════════════════════════════ */}
      <nav style={{
        position:"fixed",top:0,left:0,right:0,zIndex:100,
        background:scrollY>50?"rgba(4,4,15,0.94)":"rgba(4,4,15,0.55)",
        backdropFilter:"blur(20px) saturate(160%)",
        borderBottom:scrollY>50?"1px solid rgba(255,255,255,0.07)":"1px solid rgba(255,255,255,0.04)",
        transition:"all .3s",
      }}>
        <div style={{maxWidth:"1180px",margin:"0 auto",display:"flex",alignItems:"center",padding:"13px clamp(16px,3vw,32px)",gap:"12px"}}>
          <div style={{fontFamily:"'Space Mono',monospace",fontWeight:700,fontSize:"20px",letterSpacing:"0.01em",flexShrink:0,cursor:"default",userSelect:"none",lineHeight:1}}>
            <span style={{color:"#c7d2fe"}}>Visuo</span>
            <span style={{background:"linear-gradient(90deg,#818cf8,#a78bfa)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>Slayer</span>
          </div>
          <div className="nav-links" style={{display:"flex",alignItems:"center",gap:"28px",flex:1,justifyContent:"center"}}>
            <a href="#features" className="nav-link">Features</a>
            <a href="#tree"     className="nav-link">Topics</a>
            <a href="#footer"   className="nav-link">End</a>
          </div>
          <div className="nav-links" style={{marginLeft:"auto",flexShrink:0}}>
            <button className="glow-btn" style={{padding:"8px 18px",fontSize:"12px",borderRadius:"9px"}}>Launch App →</button>
          </div>
          <button className="hamburger" onClick={()=>setMenuOpen(true)} style={{marginLeft:"auto",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"8px",padding:"7px 10px",cursor:"pointer",color:"#94a3b8",fontSize:"15px",lineHeight:1,display:"flex",alignItems:"center"}}>☰</button>
        </div>
      </nav>

      {/* ════ HERO ══════════════════════════════════════════════════ */}
      <section className="pad-x" style={{
        minHeight:"100vh",display:"flex",flexDirection:"column",
        alignItems:"center",justifyContent:"center",
        padding:"clamp(100px,14vw,130px) clamp(18px,5vw,48px) clamp(60px,8vw,90px)",
        position:"relative",zIndex:1,textAlign:"center",overflow:"hidden",
      }}>
        {/* ── Light effect — layered radial blooms ── */}
        {/* Wide indigo base spill */}
        <div style={{position:"absolute",width:"min(900px,130vw)",height:"min(700px,100vw)",borderRadius:"50%",background:"radial-gradient(ellipse,rgba(79,70,229,0.18) 0%,rgba(99,102,241,0.08) 35%,transparent 70%)",top:"50%",left:"50%",transform:"translate(-50%,-55%)",pointerEvents:"none",zIndex:0}}/>
        {/* Bright central cone — the "light source" */}
        <div style={{position:"absolute",width:"min(480px,80vw)",height:"min(480px,80vw)",borderRadius:"50%",background:"radial-gradient(circle,rgba(129,140,248,0.22) 0%,rgba(99,102,241,0.1) 40%,transparent 68%)",top:"45%",left:"50%",transform:"translate(-50%,-50%)",pointerEvents:"none",zIndex:0}}/>
        {/* Violet right-side accent */}
        <div style={{position:"absolute",width:"min(380px,60vw)",height:"min(380px,60vw)",borderRadius:"50%",background:"radial-gradient(circle,rgba(167,139,250,0.14) 0%,transparent 65%)",top:"38%",left:"62%",transform:"translateX(-50%)",pointerEvents:"none",zIndex:0}}/>
        {/* Cyan bottom-right accent bloom */}
        <div style={{position:"absolute",width:"min(320px,55vw)",height:"min(320px,55vw)",borderRadius:"50%",background:"radial-gradient(circle,rgba(6,182,212,0.1) 0%,transparent 65%)",top:"65%",left:"68%",transform:"translateX(-50%)",pointerEvents:"none",zIndex:0}}/>
        {/* Subtle top edge beam — horizontal streak of light */}
        <div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:"60%",height:"2px",background:"linear-gradient(to right,transparent,rgba(129,140,248,0.35) 30%,rgba(167,139,250,0.45) 50%,rgba(129,140,248,0.35) 70%,transparent)",pointerEvents:"none",zIndex:0}}/>
        {/* Slow pulse ring (kept subtle) */}
        <div style={{position:"absolute",width:"min(700px,95vw)",height:"min(700px,95vw)",borderRadius:"50%",border:"1px solid rgba(99,102,241,0.06)",top:"50%",left:"50%",transform:"translate(-50%,-50%)",animation:"pulseRing 8s ease-in-out infinite",pointerEvents:"none",zIndex:0}}/>

        {/* Badge */}
        <div style={{
          display:"inline-flex",alignItems:"center",gap:"7px",
          background:"rgba(110,231,183,0.07)",border:"1px solid rgba(110,231,183,0.18)",
          borderRadius:"999px",padding:"5px 14px",
          fontSize:"10px",fontWeight:700,color:"#6ee7b7",letterSpacing:"0.1em",textTransform:"uppercase",
          marginBottom:"24px",
          opacity:heroVis?1:0,transform:heroVis?"translateY(0)":"translateY(-10px)",
          transition:"all .6s cubic-bezier(.16,1,.3,1)",
        }}>
          <span style={{width:"6px",height:"6px",borderRadius:"50%",background:"#6ee7b7",display:"inline-block",boxShadow:"0 0 6px #6ee7b7",animation:"badgePulse 2.2s ease-in-out infinite"}}/>
          Visual Learning · 40+ Topics
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize:"clamp(36px,8.5vw,90px)",fontWeight:900,lineHeight:1.02,
          maxWidth:"820px",marginBottom:"18px",letterSpacing:"-0.025em",
          opacity:heroVis?1:0,
          animation:heroVis?"heroIn .7s .08s both cubic-bezier(.16,1,.3,1)":"none",
        }}>
          <span className="shimmer-text">See the code.</span><br/>
          <span style={{color:"#f8fafc"}}>Feel the logic.</span>
        </h1>

        {/* Sub */}
        <p style={{
          fontSize:"clamp(14px,2vw,17px)",color:"#4b5563",maxWidth:"480px",
          lineHeight:1.78,marginBottom:"30px",
          opacity:heroVis?1:0,
          animation:heroVis?"heroIn .7s .18s both cubic-bezier(.16,1,.3,1)":"none",
        }}>
          Interactive visualizations for every major data structure and algorithm.
          Step through, watch complexity unfold — finally{" "}
          <em style={{color:"#a5b4fc",fontStyle:"normal",fontWeight:700,background:"rgba(99,102,241,0.1)",padding:"1px 6px",borderRadius:"5px"}}>understand</em>{" "}DSA.
        </p>

        {/* CTAs */}
        <div className="hero-btns" style={{
          display:"flex",gap:"12px",flexWrap:"wrap",justifyContent:"center",alignItems:"center",
          opacity:heroVis?1:0,
          animation:heroVis?"heroIn .7s .28s both cubic-bezier(.16,1,.3,1)":"none",
        }}>
          <button className="glow-btn" style={{fontSize:"15px",padding:"14px 34px"}}>Start Visualizing →</button>
          <a href="#tree" className="ghost-btn">Browse Topics ↓</a>
        </div>

        {/* Scroll hint */}
        <div style={{
          position:"absolute",bottom:"24px",left:"50%",
          display:"flex",flexDirection:"column",alignItems:"center",gap:"4px",
          animation:"scrollBounce 2.4s ease-in-out infinite",
          opacity:heroVis?0.22:0,transition:"opacity .8s 1s",
        }}>
          <span style={{fontSize:"9px",letterSpacing:"0.12em",color:"#2d3748",textTransform:"uppercase"}}>scroll</span>
          <div style={{width:"1px",height:"22px",background:"linear-gradient(to bottom,#6366f1,transparent)"}}/>
        </div>
      </section>

      <div className="hr"/>

      {/* ════ STATS ═════════════════════════════════════════════════ */}
      <section className="pad-x" style={{padding:"clamp(40px,6vw,60px) clamp(18px,4vw,44px)",maxWidth:"1180px",margin:"0 auto",position:"relative",zIndex:1}}>
        <div className="stats-grid">
          {stats.map((s,i)=><StatCard key={s.label} {...s} delay={i*55}/>)}
        </div>
      </section>

      <div className="hr"/>

      {/* ════ FEATURES ══════════════════════════════════════════════ */}
      <section id="features" className="pad-x" style={{padding:"clamp(60px,8vw,90px) clamp(18px,4vw,44px)",maxWidth:"1180px",margin:"0 auto",position:"relative",zIndex:1}}>
        <div style={{textAlign:"center",marginBottom:"clamp(32px,5vw,48px)"}}>
          <p style={{fontSize:"10px",fontWeight:700,letterSpacing:"0.14em",color:"#6366f1",textTransform:"uppercase",marginBottom:"10px"}}>Why VisuoSlayer</p>
          <h2 style={{fontSize:"clamp(22px,4.5vw,42px)",fontWeight:900,color:"#f8fafc",letterSpacing:"-0.02em",marginBottom:"11px"}}>
            Everything to <span className="shimmer-text">master DSA</span>
          </h2>
          <p style={{color:"#4b5563",fontSize:"14px",maxWidth:"340px",margin:"0 auto",lineHeight:1.6}}>
            One platform. Every structure. Every algorithm. All visual.
          </p>
        </div>
        <div className="feat-grid">
          {features.map((f,i)=><FeatureCard key={f.title} {...f} delay={i*40}/>)}
        </div>
      </section>

      <div className="hr"/>

      {/* ════ DSA EXPLORER ══════════════════════════════════════════ */}
      <section id="tree" style={{padding:"clamp(60px,8vw,88px) 0",position:"relative",zIndex:1,overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 18% 50%,rgba(79,70,229,0.05) 0%,transparent 46%),radial-gradient(ellipse at 82% 50%,rgba(8,145,178,0.04) 0%,transparent 46%)",pointerEvents:"none"}}/>

        <div className="pad-x" style={{textAlign:"center",marginBottom:"clamp(28px,4vw,40px)",padding:"0 clamp(18px,4vw,24px)"}}>
          <h2 style={{fontSize:"clamp(20px,4vw,40px)",fontWeight:900,color:"#f8fafc",letterSpacing:"-0.02em",marginBottom:"11px"}}>
            Click any topic to <span className="shimmer-text">launch it</span>
          </h2>
        </div>

        <div style={{padding:"0 clamp(10px,2.5vw,44px)"}}>
          <div style={{
            maxWidth:"1060px",margin:"0 auto",
            background:"rgba(4,4,18,0.55)",
            border:"1px solid rgba(255,255,255,0.07)",
            borderRadius:"20px",padding:"clamp(16px,2.5vw,24px)",
            boxShadow:"0 0 0 1px rgba(99,102,241,0.04),0 24px 56px rgba(0,0,0,0.38),inset 0 1px 0 rgba(255,255,255,0.04)",
            position:"relative",overflow:"hidden",
          }}>
            <div style={{position:"absolute",top:0,left:0,width:"100px",height:"100px",background:"radial-gradient(circle at 0% 0%,rgba(99,102,241,0.11) 0%,transparent 60%)",pointerEvents:"none"}}/>
            <div style={{position:"absolute",bottom:0,right:0,width:"100px",height:"100px",background:"radial-gradient(circle at 100% 100%,rgba(6,182,212,0.09) 0%,transparent 60%)",pointerEvents:"none"}}/>
            <div style={{position:"absolute",top:0,left:"-50%",width:"40%",height:"100%",background:"linear-gradient(100deg,transparent,rgba(255,255,255,0.007),transparent)",animation:"scanline 8s ease-in-out infinite",pointerEvents:"none"}}/>
            <DSAExplorer onLeafClick={handleLeafClick}/>
          </div>
        </div>

        <div style={{display:"flex",justifyContent:"center",gap:"16px",flexWrap:"wrap",marginTop:"20px",padding:"0 18px"}}>
          {[{dot:"#818cf8",label:"Basic"},{dot:"#22d3ee",label:"Intermediate"},{dot:"#f87171",label:"Advanced"}].map(({dot,label})=>(
            <div key={label} style={{display:"flex",alignItems:"center",gap:"5px"}}>
              <span style={{width:"6px",height:"6px",borderRadius:"50%",background:dot,boxShadow:`0 0 4px ${dot}`,display:"inline-block"}}/>
              <span style={{fontSize:"11px",color:"#4b5563",letterSpacing:"0.03em",fontWeight:500}}>{label}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="hr"/>

      {/* ════ CTA ═══════════════════════════════════════════════════ */}
      <section className="pad-x" style={{padding:"clamp(70px,9vw,100px) clamp(18px,5vw,48px)",textAlign:"center",position:"relative",zIndex:1,overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 50% 60%,rgba(79,70,229,0.08) 0%,transparent 60%)",pointerEvents:"none"}}/>
        <p style={{fontSize:"10px",fontWeight:700,letterSpacing:"0.14em",color:"#6366f1",textTransform:"uppercase",marginBottom:"10px",position:"relative"}}>Ready to level up?</p>
        <h2 style={{fontSize:"clamp(24px,5.5vw,52px)",fontWeight:900,color:"#f8fafc",marginBottom:"12px",letterSpacing:"-0.025em",lineHeight:1.06,position:"relative"}}>
          Stop memorizing.<br/><span className="shimmer-text">Start visualizing.</span>
        </h2>
        <p style={{color:"#4b5563",fontSize:"14px",maxWidth:"340px",margin:"0 auto 28px",lineHeight:1.65,position:"relative"}}>
          Open source · No account needed · Just click and learn.
        </p>
        <button className="glow-btn" style={{fontSize:"15px",padding:"14px 38px",position:"relative"}}>Get Started — It&apos;s Free →</button>
      </section>

      <div className="hr"/>

      {/* ════ FOOTER ════════════════════════════════════════════════ */}
      <footer id="footer" style={{padding:"clamp(22px,3vw,30px) clamp(16px,3vw,32px)",position:"relative",zIndex:1,background:"rgba(4,4,15,0.7)"}}>
        <div className="footer-row" style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"14px",maxWidth:"1180px",margin:"0 auto"}}>
          <div style={{fontFamily:"'Space Mono',monospace",fontWeight:700,fontSize:"17px",letterSpacing:"0.01em",userSelect:"none",lineHeight:1}}>
            <span style={{color:"#c7d2fe"}}>Visuo</span>
            <span style={{background:"linear-gradient(90deg,#818cf8,#a78bfa)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>Slayer</span>
            <span style={{color:"#2d3748",fontSize:"9px",marginLeft:"8px",letterSpacing:"0.08em",textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif",fontWeight:500}}>DSA Visualizer</span>
          </div>
          <div className="footer-links" style={{display:"flex",gap:"20px",flexWrap:"wrap",alignItems:"center"}}>
            {[["#features","Features"],["#tree","Topics"],["#","GitHub"]].map(([href,label])=>(
              <a key={label} href={href} style={{color:"#2d3748",textDecoration:"none",fontSize:"12px",fontWeight:500,transition:"color .18s"}}
                onMouseEnter={e=>e.target.style.color="#a5b4fc"} onMouseLeave={e=>e.target.style.color="#2d3748"}>{label}</a>
            ))}
          </div>
          <p style={{color:"#1e293b",fontSize:"11px"}}>Built with Next.js · Open source</p>
        </div>
      </footer>

      {toast && <Toast message={toast} onClose={()=>setToast(null)}/>}
    </>
  );
}