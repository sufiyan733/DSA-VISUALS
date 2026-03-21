"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

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
    v => v.name === "Alex", v => v.name === "Daniel",
    v => /Natural/i.test(v.name) && /male|man|guy|ryan|davis|mark|daniel|alex/i.test(v.name) && v.lang.startsWith("en"),
    v => v.lang.startsWith("en-GB"), v => v.lang.startsWith("en"),
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
  intro: `A graph is the most powerful and versatile data structure in computer science. While trees are hierarchical and arrays are linear, graphs are unrestricted — any node can connect to any other node, in any direction, with any weight. Think of a social network where every person is a node and every friendship is an edge. Think of Google Maps where intersections are nodes and roads are weighted edges. Think of the internet itself — every webpage a node, every hyperlink an edge. Graphs model relationships, and relationships are everywhere. Mastering graphs means mastering the structure of the real world.`,
  terminology: `Before algorithms, you must speak the language. A vertex, also called a node, is a point in the graph. An edge is a connection between two vertices. A directed graph, or digraph, has arrows — edges have a specific direction from source to destination. An undirected graph has bidirectional edges — connections go both ways. A weighted graph assigns a numeric cost to each edge, representing distance, time, or priority. Degree counts how many edges touch a vertex. In-degree counts incoming edges; out-degree counts outgoing. A path is a sequence of vertices connected by edges. A cycle is a path that returns to its starting vertex.`,
  representation: `How you store a graph completely determines the speed of every operation. The adjacency matrix is a two-dimensional array where matrix[u][v] equals one if an edge exists from u to v. Checking an edge is O one — instantly. But storing it costs O V squared space — wasteful for sparse graphs. The adjacency list stores each vertex alongside a list of its neighbors. Space is O V plus E — efficient for sparse graphs. Edge lookup takes O degree time. For most real-world graphs like social networks and road maps, adjacency lists are the clear winner. Choose your representation based on density: dense graphs favor matrices, sparse graphs favor lists.`,
  bfs: `Breadth-First Search is the algorithm that explores level by level, like ripples spreading from a stone dropped in water. Start at a source vertex, mark it visited, add it to a queue. Then repeatedly dequeue a vertex, visit all its unvisited neighbors, and enqueue them. This guarantees you visit all vertices at distance one before any at distance two, then all at distance two before three, and so on. The result is a shortest-path tree — for unweighted graphs, BFS finds the minimum number of edges between source and any reachable vertex. BFS runs in O V plus E time, visiting every vertex and edge exactly once. It powers social network friend suggestions, GPS navigation on unweighted maps, and web crawlers.`,
  dfs: `Depth-First Search dives as deep as possible before backtracking. Start at a source, mark it visited, then recursively visit an unvisited neighbor. Keep going deeper until you reach a dead end — a vertex with no unvisited neighbors — then backtrack and try another path. DFS runs in O V plus E time and uses O V space on the call stack. But its true power lies in what it discovers during traversal. DFS finds connected components, detects cycles, produces topological orderings, and identifies strongly connected components. The order in which vertices finish their DFS exploration — the finish time — is one of the most powerful concepts in all of graph theory.`,
  dijkstra: `Dijkstra's algorithm solves the single-source shortest path problem on graphs with non-negative edge weights. The insight is elegant: always process the unvisited vertex with the smallest known distance from the source. Use a min-heap priority queue. Start with source distance zero, all others infinity. Extract the minimum, relax all its neighbors — if going through this vertex gives a shorter path, update that neighbor's distance. Repeat until all vertices are processed. With a binary heap, Dijkstra runs in O E log V time. It powers every GPS navigation system, every network routing protocol, and every game pathfinding algorithm. The only restriction: no negative edge weights, which can corrupt the greedy assumption.`,
  bellman: `Bellman-Ford solves shortest paths even when edge weights are negative — something Dijkstra cannot do. The algorithm is beautifully simple: repeat V minus one times the process of relaxing every single edge. After k iterations, all shortest paths using at most k edges are found. After V minus one iterations, all shortest paths are found — because any shortest path in a graph with V vertices can use at most V minus one edges. Bellman-Ford also detects negative weight cycles: if any distance can still be reduced after V minus one rounds, a negative cycle exists. The time complexity is O V times E, slower than Dijkstra but universal. It powers financial arbitrage detection and network routing with variable costs.`,
  topo: `Topological sort orders the vertices of a directed acyclic graph — a DAG — such that for every directed edge from u to v, u appears before v in the ordering. It only makes sense on DAGs: any cycle makes a topological order impossible. The DFS-based algorithm is elegant: run DFS on all unvisited vertices. When a vertex finishes — all its descendants explored — push it onto a stack. The stack's reverse is the topological order. Kahn's algorithm uses in-degrees instead: start with all zero-in-degree vertices in a queue, process them, reduce neighbors' in-degrees, enqueue newly zero-in-degree vertices. Topological sort is the engine behind build systems like Make and Gradle, course prerequisite scheduling, spreadsheet formula evaluation, and compiler dependency resolution.`,
  mst: `A Minimum Spanning Tree is a subset of edges that connects all vertices in a weighted undirected graph with minimum total edge weight, using exactly V minus one edges and no cycles. Kruskal's algorithm sorts all edges by weight, then greedily adds the cheapest edge that does not create a cycle — using a Union-Find data structure to detect cycles efficiently. Time: O E log E. Prim's algorithm grows the MST from a starting vertex, always adding the minimum-weight edge that connects the tree to a new vertex — similar in spirit to Dijkstra. Time: O E log V with a binary heap. MSTs are used in network design, clustering algorithms, image segmentation, and circuit layout. They form the backbone of efficient infrastructure.`,
  quiz: `Excellent work reaching the quiz! You have covered the complete graph foundation: the nature of graphs and their real-world power, all essential terminology including directed, undirected, weighted, degree, path, and cycle, the two storage representations — matrix and list — and when to choose each, Breadth-First Search for level-by-level exploration and shortest unweighted paths, Depth-First Search for deep exploration and cycle detection, Dijkstra's algorithm for non-negative weighted shortest paths, Bellman-Ford for graphs with negative weights, topological sort for DAG ordering, and Minimum Spanning Trees with Kruskal's and Prim's algorithms. This is the complete graph toolkit. Let's find out what you truly know.`,
};

const NAV_SECTIONS = [
  { id:"intro",    icon:"🕸️", label:"Intro",      col:"#38bdf8" },
  { id:"terminology",icon:"📐",label:"Terms",      col:"#818cf8" },
  { id:"representation",icon:"🗄️",label:"Represent",col:"#34d399" },
  { id:"bfs",      icon:"🌊", label:"BFS",         col:"#60a5fa" },
  { id:"dfs",      icon:"🌀", label:"DFS",         col:"#a78bfa" },
  { id:"dijkstra", icon:"🗺️", label:"Dijkstra",   col:"#fbbf24" },
  { id:"bellman",  icon:"⚖️", label:"Bellman-Ford",col:"#fb7185" },
  { id:"topo",     icon:"📋", label:"Topo Sort",   col:"#4ade80" },
  { id:"mst",      icon:"🌲", label:"MST",         col:"#f97316" },
  { id:"visualizer",icon:"💻",label:"Visualizer",  col:"#e879f9" },
  { id:"quiz",     icon:"🧠", label:"Quiz",        col:"#ec4899" },
];

const SPEED_OPTIONS = [0.75, 1.0, 1.25, 1.5, 2.0];

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED HOOKS
// ═══════════════════════════════════════════════════════════════════════════════
function useVisible(threshold = 0.07) {
  const ref = useRef(null); const [vis, setVis] = useState(false);
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
    const h = () => { const mx = document.documentElement.scrollHeight - window.innerHeight; setP(mx > 0 ? (window.scrollY / mx) * 100 : 0); };
    window.addEventListener("scroll", h, { passive: true }); return () => window.removeEventListener("scroll", h);
  }, []);
  return (
    <div style={{ position:"fixed",top:0,left:0,right:0,height:3,zIndex:999,background:"rgba(255,255,255,0.04)" }}>
      <div style={{ height:"100%",width:`${p}%`,background:"linear-gradient(90deg,#38bdf8,#818cf8,#4ade80)",transition:"width 0.12s linear",boxShadow:"0 0 10px rgba(56,189,248,0.7)" }}/>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SPEAKING WAVE
// ═══════════════════════════════════════════════════════════════════════════════
function SpeakingWave({ color = "#38bdf8", size = 16 }) {
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
      <button onClick={() => setOpen(o => !o)} style={{ display:"flex",alignItems:"center",gap:5,padding:"5px 11px",borderRadius:20,cursor:"pointer",background:open?"rgba(56,189,248,0.2)":"rgba(255,255,255,0.05)",border:`1.5px solid ${open?"#38bdf8":"rgba(255,255,255,0.1)"}`,fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:700,color:open?"#7dd3fc":"#64748b",transition:"all 0.2s" }}>⚡ {speed}×</button>
      {open && (
        <div style={{ position:"absolute",top:"calc(100% + 8px)",right:0,background:"rgba(8,10,22,0.97)",backdropFilter:"blur(28px)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:14,padding:"8px 6px",display:"flex",flexDirection:"column",gap:3,zIndex:1000,minWidth:100,boxShadow:"0 16px 48px rgba(0,0,0,0.7)",animation:"panelPop 0.18s cubic-bezier(0.22,1,0.36,1) both" }}>
          <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:"#2d3748",letterSpacing:"0.1em",padding:"2px 8px 6px",borderBottom:"1px solid rgba(255,255,255,0.06)" }}>SPEED</div>
          {SPEED_OPTIONS.map(s => (
            <button key={s} onClick={() => { currentRate=s; setSpeed(s); setOpen(false); if(speaking) onRestart(); }} style={{ padding:"6px 12px",borderRadius:8,cursor:"pointer",textAlign:"left",background:speed===s?"rgba(56,189,248,0.2)":"transparent",border:`1px solid ${speed===s?"rgba(56,189,248,0.45)":"transparent"}`,fontFamily:"'JetBrains Mono',monospace",fontSize:10,fontWeight:700,color:speed===s?"#7dd3fc":"#475569",transition:"all 0.15s" }}>
              {s===1.25?`${s}× ★`:`${s}×`}
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
  useEffect(() => { const h = () => setShow(window.scrollY > 500); window.addEventListener("scroll", h, { passive:true }); return () => window.removeEventListener("scroll", h); }, []);
  return (
    <nav style={{ position:"fixed",top:14,left:"50%",transform:"translateX(-50%)",zIndex:900,display:"flex",alignItems:"center",gap:2,padding:"5px 8px",background:"rgba(6,8,18,0.92)",backdropFilter:"blur(28px) saturate(180%)",borderRadius:22,border:"1px solid rgba(255,255,255,0.08)",boxShadow:"0 12px 48px rgba(0,0,0,0.6)",opacity:show?1:0,pointerEvents:show?"auto":"none",transition:"opacity 0.3s ease",maxWidth:"calc(100vw - 24px)" }}>
      <div className="nav-pills" style={{ display:"flex",gap:2,flexWrap:"wrap",justifyContent:"center" }}>
        {NAV_SECTIONS.map(s => (
          <button key={s.id} onClick={() => document.getElementById(s.id)?.scrollIntoView({ behavior:"smooth" })} title={s.label} style={{ width:34,height:34,borderRadius:12,border:"none",cursor:"pointer",background:active===s.id?`${s.col}22`:"transparent",outline:active===s.id?`1.5px solid ${s.col}55`:"1.5px solid transparent",fontSize:15,transition:"all 0.2s",display:"flex",alignItems:"center",justifyContent:"center" }}>{s.icon}</button>
        ))}
      </div>
      <div style={{ width:1,height:20,background:"rgba(255,255,255,0.08)",margin:"0 4px" }}/>
      <SpeedPanel speed={speed} setSpeed={setSpeed} speaking={!!speaking} onRestart={onRestart}/>
      {speaking && (
        <div style={{ marginLeft:4,display:"flex",alignItems:"center",gap:5,padding:"4px 10px",borderRadius:14,background:"rgba(56,189,248,0.12)",border:"1px solid rgba(56,189,248,0.3)" }}>
          <SpeakingWave color="#38bdf8" size={14}/>
          <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#38bdf8",fontWeight:700 }}>ON</span>
        </div>
      )}
    </nav>
  );
}

function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => { const h = () => setShow(window.scrollY > 1200); window.addEventListener("scroll", h, { passive:true }); return () => window.removeEventListener("scroll", h); }, []);
  return (
    <button onClick={() => window.scrollTo({ top:0, behavior:"smooth" })} style={{ position:"fixed",bottom:24,right:20,zIndex:850,width:44,height:44,borderRadius:14,cursor:"pointer",background:"rgba(56,189,248,0.15)",border:"1px solid rgba(56,189,248,0.35)",color:"#7dd3fc",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",opacity:show?1:0,transform:show?"scale(1)":"scale(0.7)",pointerEvents:show?"auto":"none",transition:"all 0.3s cubic-bezier(0.22,1,0.36,1)",boxShadow:"0 8px 24px rgba(56,189,248,0.3)" }}>↑</button>
  );
}

function CompletedBadge({ seen }) {
  if (!seen) return null;
  return <span style={{ padding:"2px 9px",borderRadius:20,fontSize:9,fontFamily:"'JetBrains Mono',monospace",fontWeight:700,background:"rgba(56,189,248,0.12)",border:"1px solid rgba(56,189,248,0.3)",color:"#38bdf8",letterSpacing:"0.08em",animation:"fadeIn 0.4s ease both" }}>✓ READ</span>;
}

function MiniPlayer({ speaking, speakingLabel, onStop, speed }) {
  if (!speaking) return null;
  return (
    <div style={{ position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",zIndex:850,display:"flex",alignItems:"center",gap:12,padding:"10px 20px",borderRadius:99,background:"rgba(8,12,24,0.94)",backdropFilter:"blur(24px)",border:"1px solid rgba(56,189,248,0.3)",boxShadow:"0 8px 36px rgba(56,189,248,0.15)",animation:"slideUp 0.35s cubic-bezier(0.22,1,0.36,1) both",maxWidth:"calc(100vw - 48px)" }}>
      <SpeakingWave color="#38bdf8" size={16}/>
      <div>
        <div style={{ fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,color:"#e2e8f0",lineHeight:1 }}>{speakingLabel}</div>
        <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#38bdf8",marginTop:2 }}>{speed}× speed · male voice</div>
      </div>
      <button onClick={onStop} style={{ background:"rgba(239,68,68,0.15)",border:"1px solid rgba(239,68,68,0.35)",borderRadius:20,cursor:"pointer",padding:"4px 12px",fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:700,color:"#f87171" }}>⏹ STOP</button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION WRAPPER
// ═══════════════════════════════════════════════════════════════════════════════
function Sect({ id, icon, title, color, visual, cards, voice, speaking, onVoice, seen }) {
  const [ref, vis] = useVisible();
  const isSp = speaking === id;
  return (
    <section id={id} ref={ref} style={{ padding:"0 0 80px",opacity:vis?1:0,transform:vis?"none":"translateY(52px)",transition:"opacity 0.78s cubic-bezier(0.22,1,0.36,1),transform 0.78s cubic-bezier(0.22,1,0.36,1)" }}>
      <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:24,flexWrap:"wrap" }}>
        <div style={{ width:50,height:50,borderRadius:16,flexShrink:0,background:`${color}14`,border:`1px solid ${color}38`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,boxShadow:`0 0 28px ${color}18` }}>{icon}</div>
        <h2 style={{ flex:1,margin:0,minWidth:0,fontFamily:"'Syne',sans-serif",fontSize:"clamp(19px,3.8vw,30px)",fontWeight:800,color:"#f8fafc",letterSpacing:"-0.022em",lineHeight:1.15 }}>{title}</h2>
        <div style={{ display:"flex",alignItems:"center",gap:8,flexShrink:0 }}>
          <CompletedBadge seen={seen}/>
          <button onClick={() => onVoice(id, voice)} style={{ display:"flex",alignItems:"center",gap:6,padding:"7px 14px",borderRadius:28,cursor:"pointer",background:isSp?`${color}20`:"rgba(255,255,255,0.04)",border:`1.5px solid ${isSp?color:"rgba(255,255,255,0.1)"}`,fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:700,color:isSp?color:"#475569",transition:"all 0.22s" }}>
            {isSp ? <SpeakingWave color={color} size={12}/> : <span style={{ fontSize:12 }}>🔊</span>}
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

// ═══════════════════════════════════════════════════════════════════════════════
// HERO
// ═══════════════════════════════════════════════════════════════════════════════
function Hero({ onStart, onVoice }) {
  const [tick, setTick] = useState(0);
  useEffect(() => { const t = setInterval(() => setTick(x => x+1), 1200); return () => clearInterval(t); }, []);

  const nodes = [
    {id:0,x:240,y:90,  col:"#38bdf8"},{id:1,x:130,y:170, col:"#818cf8"},
    {id:2,x:350,y:175, col:"#4ade80"},{id:3,x:80, y:270, col:"#fbbf24"},
    {id:4,x:200,y:280, col:"#fb7185"},{id:5,x:310,y:270, col:"#a78bfa"},
    {id:6,x:420,y:240, col:"#34d399"},{id:7,x:160,y:350, col:"#f97316"},
  ];
  const edges = [[0,1],[0,2],[1,3],[1,4],[2,4],[2,5],[2,6],[3,7],[4,7],[5,6]];
  const pulseNode = tick % nodes.length;

  return (
    <div style={{ minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"80px 24px 48px",textAlign:"center",position:"relative",overflow:"hidden" }}>
      <div style={{ position:"absolute",inset:0,pointerEvents:"none",backgroundImage:"radial-gradient(circle,rgba(56,189,248,0.045) 1px,transparent 1px)",backgroundSize:"38px 38px" }}/>
      <div style={{ position:"absolute",top:"5%",left:"3%",width:480,height:480,borderRadius:"50%",background:"radial-gradient(circle,rgba(56,189,248,0.12) 0%,transparent 68%)",filter:"blur(72px)",pointerEvents:"none",animation:"hOrb1 22s ease-in-out infinite" }}/>
      <div style={{ position:"absolute",bottom:"8%",right:"2%",width:360,height:360,borderRadius:"50%",background:"radial-gradient(circle,rgba(129,140,248,0.1) 0%,transparent 68%)",filter:"blur(60px)",pointerEvents:"none",animation:"hOrb2 28s ease-in-out infinite" }}/>

      <div style={{ width:"100%",maxWidth:500,marginBottom:32 }}>
        <svg viewBox="0 0 500 420" width="100%">
          <defs>
            <filter id="heroGlw"><feGaussianBlur stdDeviation="7" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <marker id="heroArr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="rgba(56,189,248,0.5)"/></marker>
          </defs>
          {edges.map(([a,b],i) => {
            const n1=nodes[a], n2=nodes[b];
            const active = pulseNode===a||pulseNode===b;
            return <line key={i} x1={n1.x} y1={n1.y} x2={n2.x} y2={n2.y} stroke={active?"rgba(56,189,248,0.6)":"rgba(255,255,255,0.08)"} strokeWidth={active?2:1.2} style={{transition:"all 0.5s ease",animation:`edgeFd 0.6s ease ${i*0.06}s both`}}/>;
          })}
          {nodes.map((n,i) => (
            <g key={n.id} style={{animation:`nodePp 0.6s cubic-bezier(0.22,1,0.36,1) ${i*0.09}s both`}}>
              {pulseNode===i && <circle cx={n.x} cy={n.y} r={38} fill="none" stroke={n.col} strokeWidth="1.5" strokeOpacity="0.25" style={{animation:"nodeRip 1s ease-out forwards"}}/>}
              <circle cx={n.x} cy={n.y} r={pulseNode===i?26:20} fill={`${n.col}${pulseNode===i?"2a":"14"}`} stroke={n.col} strokeWidth={pulseNode===i?2.5:1.5} filter={pulseNode===i?"url(#heroGlw)":"none"} style={{transition:"all 0.5s cubic-bezier(0.22,1,0.36,1)"}}/>
              <text x={n.x} y={n.y+1} textAnchor="middle" dominantBaseline="middle" fill={n.col} fontSize={pulseNode===i?13:10} fontFamily="'JetBrains Mono',monospace" fontWeight="700" style={{transition:"font-size 0.5s"}}>{n.id}</text>
            </g>
          ))}
          <style>{`@keyframes nodePp{from{opacity:0;transform-origin:50% 50%;transform:scale(0) rotate(-12deg)}to{opacity:1;transform:scale(1) rotate(0)}}@keyframes edgeFd{from{opacity:0}to{opacity:1}}@keyframes nodeRip{from{r:26;opacity:0.5}to{r:54;opacity:0}}`}</style>
        </svg>
      </div>

      <div style={{ maxWidth:640,position:"relative" }}>
        <div style={{ display:"inline-flex",alignItems:"center",gap:8,marginBottom:20,padding:"5px 18px",borderRadius:40,background:"rgba(56,189,248,0.1)",border:"1px solid rgba(56,189,248,0.25)",fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#38bdf8",letterSpacing:"0.1em" }}>🕸️ INTERACTIVE VISUAL GUIDE · FOR COMPLETE BEGINNERS</div>
        <h1 style={{ margin:"0 0 18px",fontFamily:"'Syne',sans-serif",fontSize:"clamp(36px,7.5vw,76px)",fontWeight:800,letterSpacing:"-0.035em",lineHeight:1.02,background:"linear-gradient(145deg,#f8fafc 0%,#bae6fd 30%,#818cf8 60%,#4ade80 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text" }}>Graph Data<br/>Structures</h1>
        <p style={{ margin:"0 auto 32px",fontFamily:"'DM Sans',sans-serif",fontSize:"clamp(14px,2.2vw,18px)",color:"#64748b",lineHeight:1.68,maxWidth:520 }}>
          Every major graph concept — animated, explained, and narrated with a <strong style={{ color:"#38bdf8" }}>natural male voice</strong> at your chosen speed. Plus an interactive code visualizer.
        </p>
        <div style={{ display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap" }}>
          <button onClick={onStart} style={{ padding:"15px 36px",borderRadius:16,cursor:"pointer",background:"linear-gradient(135deg,#0ea5e9 0%,#818cf8 100%)",border:"none",fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:700,color:"#fff",boxShadow:"0 8px 36px rgba(14,165,233,0.45)",transition:"all 0.25s" }} onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px) scale(1.02)";}} onMouseLeave={e=>{e.currentTarget.style.transform="none";}}>
            Begin Learning ↓
          </button>
          <button onClick={onVoice} style={{ padding:"15px 26px",borderRadius:16,cursor:"pointer",background:"rgba(255,255,255,0.05)",border:"1.5px solid rgba(255,255,255,0.15)",fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:600,color:"#94a3b8",transition:"all 0.25s",display:"flex",alignItems:"center",gap:9 }} onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.1)";e.currentTarget.style.color="#f8fafc";}} onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.05)";e.currentTarget.style.color="#94a3b8";}}>
            <span style={{ fontSize:18 }}>🔊</span> Hear Intro
          </button>
        </div>
        <div style={{ display:"flex",gap:6,justifyContent:"center",alignItems:"center",marginTop:20,flexWrap:"wrap" }}>
          <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#2d3748",letterSpacing:"0.08em" }}>VOICE SPEED:</span>
          {SPEED_OPTIONS.map(s => (
            <button key={s} onClick={() => { currentRate=s; }} style={{ padding:"4px 11px",borderRadius:20,cursor:"pointer",background:currentRate===s?"rgba(56,189,248,0.18)":"rgba(255,255,255,0.04)",border:`1px solid ${currentRate===s?"rgba(56,189,248,0.5)":"rgba(255,255,255,0.08)"}`,fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:700,color:currentRate===s?"#38bdf8":"#2d3748",transition:"all 0.18s" }}>{s}×</button>
          ))}
        </div>
        <div style={{ display:"flex",gap:28,justifyContent:"center",marginTop:44,flexWrap:"wrap" }}>
          {[["9","Sections"],["8+","Animations"],["6","Quiz Qs"],["💻","Visualizer"]].map(([n,l]) => (
            <div key={l} style={{ textAlign:"center" }}>
              <div style={{ fontFamily:"'Syne',sans-serif",fontSize:28,fontWeight:800,background:"linear-gradient(135deg,#38bdf8,#818cf8)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text" }}>{n}</div>
              <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#2d3748",letterSpacing:"0.1em",marginTop:3 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VISUAL: Intro — animated graph with edge types
// ═══════════════════════════════════════════════════════════════════════════════
function VisIntro() {
  const [mode, setMode] = useState("undirected");
  const [tick, setTick] = useState(0);
  useEffect(() => { const t = setInterval(() => setTick(x => x+1), 700); return () => clearInterval(t); }, []);

  const nodes = [{id:0,x:160,y:60,col:"#38bdf8"},{id:1,x:80,y:160,col:"#818cf8"},{id:2,x:240,y:155,col:"#4ade80"},{id:3,x:60,y:260,col:"#fbbf24"},{id:4,x:180,y:265,col:"#fb7185"},{id:5,x:300,y:230,col:"#a78bfa"}];
  const edges = [[0,1,4],[0,2,7],[1,3,2],[1,4,5],[2,4,3],[2,5,6],[3,4,8]];
  const pulseEdge = tick % edges.length;

  return (
    <div>
      <div style={{ display:"flex",gap:5,marginBottom:10,justifyContent:"center",flexWrap:"wrap" }}>
        {[["undirected","Undirected"],["directed","Directed"],["weighted","Weighted"]].map(([m,lbl]) => (
          <button key={m} onClick={() => setMode(m)} style={{ padding:"4px 10px",borderRadius:20,cursor:"pointer",background:mode===m?"rgba(56,189,248,0.2)":"rgba(255,255,255,0.04)",border:`1px solid ${mode===m?"#38bdf8":"rgba(255,255,255,0.1)"}`,fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:700,color:mode===m?"#38bdf8":"#475569",transition:"all 0.2s" }}>{lbl}</button>
        ))}
      </div>
      <svg viewBox="0 0 360 310" width="100%" style={{ maxHeight:295 }}>
        <defs>
          <marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#38bdf8"/></marker>
          <filter id="gGlw"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        {edges.map(([a,b,w],i) => {
          const n1=nodes[a],n2=nodes[b];
          const active=pulseEdge===i;
          const dx=n2.x-n1.x,dy=n2.y-n1.y,dist=Math.sqrt(dx*dx+dy*dy);
          const ex1=n1.x+(dx/dist)*22, ey1=n1.y+(dy/dist)*22;
          const ex2=n2.x-(dx/dist)*22, ey2=n2.y-(dy/dist)*22;
          const mx=(n1.x+n2.x)/2, my=(n1.y+n2.y)/2;
          return (
            <g key={i}>
              <line x1={ex1} y1={ey1} x2={ex2} y2={ey2} stroke={active?"#38bdf8":"rgba(255,255,255,0.12)"} strokeWidth={active?2.5:1.5} markerEnd={mode==="directed"?"url(#arr)":undefined} filter={active?"url(#gGlw)":undefined} style={{transition:"all 0.4s"}}/>
              {mode==="weighted" && <text x={mx+5} y={my-5} fill={active?"#38bdf8":"#334155"} fontSize="10" fontFamily="'JetBrains Mono',monospace" fontWeight="700" style={{transition:"fill 0.4s"}}>{w}</text>}
            </g>
          );
        })}
        {nodes.map((n) => (
          <g key={n.id} style={{animation:"nodePp 0.5s cubic-bezier(0.22,1,0.36,1) both"}}>
            <circle cx={n.x} cy={n.y} r={20} fill={`${n.col}18`} stroke={n.col} strokeWidth="1.8"/>
            <text x={n.x} y={n.y+1} textAnchor="middle" dominantBaseline="middle" fill={n.col} fontSize="12" fontFamily="'JetBrains Mono',monospace" fontWeight="700">{n.id}</text>
          </g>
        ))}
        <text x={180} y={298} textAnchor="middle" fill="#334155" fontSize="9" fontFamily="'JetBrains Mono',monospace">
          {mode==="undirected"?"Undirected: edges have no direction":mode==="directed"?"Directed: edges are one-way arrows":"Weighted: edges carry numeric costs"}
        </text>
        <style>{`@keyframes nodePp{from{opacity:0;transform-origin:50% 50%;transform:scale(0)}to{opacity:1;transform:scale(1)}}`}</style>
      </svg>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VISUAL: Terminology
// ═══════════════════════════════════════════════════════════════════════════════
function VisTerminology() {
  const [hov, setHov] = useState(null);
  const nodes = [{id:"A",x:160,y:60,col:"#38bdf8"},{id:"B",x:80,y:150,col:"#818cf8"},{id:"C",x:240,y:150,col:"#4ade80"},{id:"D",x:60,y:250,col:"#fbbf24"},{id:"E",x:185,y:250,col:"#fb7185"}];
  const edges = [["A","B",5],["A","C",3],["B","D",7],["B","E",2],["C","E",4]];
  const nodeMap = Object.fromEntries(nodes.map(n=>[n.id,n]));
  const terms = [
    {id:"vertex",  label:"VERTEX",  target:"B",  desc:"A node in the graph — any point with connections",           col:"#818cf8"},
    {id:"edge",    label:"EDGE",    target:null, desc:"Connection between two vertices — the relationship",         col:"#38bdf8"},
    {id:"degree",  label:"DEGREE",  target:"B",  desc:"B has degree 3 — connected to A, D, and E",                 col:"#4ade80"},
    {id:"path",    label:"PATH",    target:null, desc:"A→B→E is a path of length 2 edges",                         col:"#fbbf24"},
    {id:"weight",  label:"WEIGHT",  target:null, desc:"Numeric cost on an edge — distance, time, priority",        col:"#f97316"},
  ];

  return (
    <div>
      <svg viewBox="0 0 360 285" width="100%" style={{ maxHeight:285 }}>
        <defs><filter id="tGlw"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
        {edges.map(([a,b,w],i) => {
          const n1=nodeMap[a],n2=nodeMap[b];
          const pathHL=hov==="path"&&((a==="A"&&b==="B")||(a==="B"&&b==="E"));
          const edgeHL=hov==="edge";
          const wHL=hov==="weight";
          return (
            <g key={i}>
              <line x1={n1.x} y1={n1.y} x2={n2.x} y2={n2.y} stroke={pathHL?"#fbbf24":edgeHL?"#38bdf8":"rgba(255,255,255,0.1)"} strokeWidth={pathHL||edgeHL?2.5:1.5} style={{transition:"all 0.25s"}}/>
              <text x={(n1.x+n2.x)/2+5} y={(n1.y+n2.y)/2-5} fill={wHL?"#f97316":"#253046"} fontSize="10" fontFamily="'JetBrains Mono',monospace" fontWeight="700" style={{transition:"fill 0.25s"}}>{w}</text>
            </g>
          );
        })}
        {nodes.map(n => {
          const vHL=hov==="vertex"&&n.id==="B";
          const degHL=hov==="degree"&&n.id==="B";
          return (
            <g key={n.id}>
              <circle cx={n.x} cy={n.y} r={22} fill={vHL||degHL?`${n.col}30`:`${n.col}14`} stroke={vHL||degHL?n.col:`${n.col}80`} strokeWidth={vHL||degHL?2.5:1.5} filter={vHL||degHL?"url(#tGlw)":undefined} style={{transition:"all 0.25s"}}/>
              <text x={n.x} y={n.y+1} textAnchor="middle" dominantBaseline="middle" fill={n.col} fontSize="13" fontFamily="'JetBrains Mono',monospace" fontWeight="700">{n.id}</text>
            </g>
          );
        })}
        {hov==="path" && <>
          <circle cx={160} cy={60} r={26} fill="none" stroke="#fbbf24" strokeWidth="2" strokeOpacity="0.5" strokeDasharray="5,3"/>
          <circle cx={80} cy={150} r={26} fill="none" stroke="#fbbf24" strokeWidth="2" strokeOpacity="0.5" strokeDasharray="5,3"/>
          <circle cx={185} cy={250} r={26} fill="none" stroke="#fbbf24" strokeWidth="2" strokeOpacity="0.5" strokeDasharray="5,3"/>
        </>}
      </svg>
      <div style={{ display:"flex",flexWrap:"wrap",gap:5,marginTop:4 }}>
        {terms.map(t => (
          <button key={t.id} onMouseEnter={()=>setHov(t.id)} onMouseLeave={()=>setHov(null)} style={{ padding:"4px 10px",borderRadius:20,cursor:"default",background:hov===t.id?`${t.col}20`:"rgba(255,255,255,0.03)",border:`1px solid ${hov===t.id?t.col:"rgba(255,255,255,0.07)"}`,fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:700,color:hov===t.id?t.col:"#334155",transition:"all 0.2s" }}>{t.label}</button>
        ))}
      </div>
      {hov && <div style={{ marginTop:8,padding:"8px 12px",borderRadius:10,background:"rgba(255,255,255,0.03)",border:`1px solid ${terms.find(t=>t.id===hov)?.col}28`,fontFamily:"'DM Sans',sans-serif",fontSize:12.5,color:"#94a3b8",lineHeight:1.5,animation:"fadeIn 0.2s ease" }}>{terms.find(t=>t.id===hov)?.desc}</div>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VISUAL: Representation
// ═══════════════════════════════════════════════════════════════════════════════
function VisRepresentation() {
  const [tab, setTab] = useState("list");
  const nodes = ["A","B","C","D","E"];
  const edges = [["A","B"],["A","C"],["B","D"],["B","E"],["C","E"],["D","E"]];
  const adjList = {A:["B","C"],B:["A","D","E"],C:["A","E"],D:["B","E"],E:["B","C","D"]};
  const adjMatrix = nodes.map(r => nodes.map(c => edges.some(([a,b])=>(a===r&&b===c)||(a===c&&b===r))?1:0));
  const COL = {"A":"#38bdf8","B":"#818cf8","C":"#4ade80","D":"#fbbf24","E":"#fb7185"};

  return (
    <div>
      <div style={{ display:"flex",gap:5,marginBottom:12,justifyContent:"center" }}>
        {[["list","Adjacency List"],["matrix","Adjacency Matrix"]].map(([k,lbl]) => (
          <button key={k} onClick={()=>setTab(k)} style={{ padding:"5px 14px",borderRadius:20,cursor:"pointer",background:tab===k?"rgba(56,189,248,0.2)":"rgba(255,255,255,0.04)",border:`1px solid ${tab===k?"#38bdf8":"rgba(255,255,255,0.1)"}`,fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:700,color:tab===k?"#38bdf8":"#475569",transition:"all 0.2s" }}>{lbl}</button>
        ))}
      </div>

      {tab === "list" ? (
        <div style={{ padding:12,borderRadius:14,background:"rgba(56,189,248,0.06)",border:"1px solid rgba(56,189,248,0.15)" }}>
          {nodes.map(n => (
            <div key={n} style={{ display:"flex",alignItems:"center",gap:8,marginBottom:7,animation:"fadeIn 0.3s ease" }}>
              <div style={{ width:32,height:32,borderRadius:8,background:`${COL[n]}20`,border:`1.5px solid ${COL[n]}`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'JetBrains Mono',monospace",fontSize:12,fontWeight:700,color:COL[n],flexShrink:0 }}>{n}</div>
              <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#334155" }}>→</div>
              <div style={{ display:"flex",gap:4,flexWrap:"wrap" }}>
                {adjList[n].map(nb => (
                  <div key={nb} style={{ width:28,height:28,borderRadius:7,background:`${COL[nb]}14`,border:`1px solid ${COL[nb]}60`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'JetBrains Mono',monospace",fontSize:10,fontWeight:700,color:COL[nb] }}>{nb}</div>
                ))}
              </div>
            </div>
          ))}
          <div style={{ marginTop:8,padding:"6px 10px",borderRadius:8,background:"rgba(56,189,248,0.06)",fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#38bdf8",textAlign:"center" }}>Space: O(V+E) · Edge check: O(degree) · ✓ Sparse graphs</div>
        </div>
      ) : (
        <div style={{ padding:12,borderRadius:14,background:"rgba(129,140,248,0.06)",border:"1px solid rgba(129,140,248,0.15)" }}>
          <div style={{ overflowX:"auto" }}>
            <table style={{ borderCollapse:"collapse",fontFamily:"'JetBrains Mono',monospace",fontSize:10 }}>
              <thead>
                <tr>
                  <td style={{ width:30 }}/>
                  {nodes.map(n => <th key={n} style={{ width:36,textAlign:"center",color:COL[n],fontWeight:700,padding:"4px" }}>{n}</th>)}
                </tr>
              </thead>
              <tbody>
                {nodes.map((r,ri) => (
                  <tr key={r}>
                    <td style={{ color:COL[r],fontWeight:700,padding:"3px 6px" }}>{r}</td>
                    {nodes.map((c,ci) => (
                      <td key={c} style={{ width:36,height:28,textAlign:"center",borderRadius:4,background:adjMatrix[ri][ci]?`${COL[r]}22`:"rgba(255,255,255,0.02)",border:`1px solid ${adjMatrix[ri][ci]?COL[r]+"40":"rgba(255,255,255,0.06)"}`,color:adjMatrix[ri][ci]?COL[r]:"#1e2a38",fontWeight:adjMatrix[ri][ci]?700:400,transition:"all 0.2s" }}>{adjMatrix[ri][ci]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop:8,padding:"6px 10px",borderRadius:8,background:"rgba(129,140,248,0.06)",fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#818cf8",textAlign:"center" }}>Space: O(V²) · Edge check: O(1) · ✓ Dense graphs</div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VISUAL: BFS
// ═══════════════════════════════════════════════════════════════════════════════
function VisBFS() {
  const [step, setStep] = useState(-1);
  const [running, setRunning] = useState(false);
  const tmr = useRef();
  const nodes = [{id:0,x:180,y:50,col:"#60a5fa"},{id:1,x:80,y:135,col:"#60a5fa"},{id:2,x:280,y:135,col:"#60a5fa"},{id:3,x:40,y:230,col:"#60a5fa"},{id:4,x:145,y:230,col:"#60a5fa"},{id:5,x:235,y:230,col:"#60a5fa"},{id:6,x:320,y:230,col:"#60a5fa"}];
  const edges = [[0,1],[0,2],[1,3],[1,4],[2,5],[2,6]];
  // BFS from 0: levels: [0], [1,2], [3,4,5,6]
  const BFS_STEPS = [
    {visited:new Set([0]),queue:[0],current:0,msg:"Start: enqueue node 0"},
    {visited:new Set([0,1,2]),queue:[1,2],current:0,msg:"Process 0: enqueue neighbors 1, 2"},
    {visited:new Set([0,1,2,3,4]),queue:[2,3,4],current:1,msg:"Process 1: enqueue neighbors 3, 4"},
    {visited:new Set([0,1,2,3,4,5,6]),queue:[3,4,5,6],current:2,msg:"Process 2: enqueue neighbors 5, 6"},
    {visited:new Set([0,1,2,3,4,5,6]),queue:[4,5,6],current:3,msg:"Process 3: no unvisited neighbors"},
    {visited:new Set([0,1,2,3,4,5,6]),queue:[5,6],current:4,msg:"Process 4: no unvisited neighbors"},
    {visited:new Set([0,1,2,3,4,5,6]),queue:[6],current:5,msg:"Process 5: no unvisited neighbors"},
    {visited:new Set([0,1,2,3,4,5,6]),queue:[],current:6,msg:"✓ BFS complete — all nodes visited level-by-level"},
  ];
  const cur = step >= 0 && step < BFS_STEPS.length ? BFS_STEPS[step] : null;
  const run = () => {
    if(running) return; setRunning(true); setStep(0);
    let s=0;
    tmr.current=setInterval(()=>{s++;setStep(s);if(s>=BFS_STEPS.length-1){clearInterval(tmr.current);setRunning(false);}},850);
  };
  const reset = () => { clearInterval(tmr.current); setStep(-1); setRunning(false); };
  useEffect(() => () => clearInterval(tmr.current), []);

  const levelColors = ["#60a5fa","#818cf8","#4ade80","#fbbf24"];
  const nodeLevels = [0,1,1,2,2,2,2];

  return (
    <div>
      <svg viewBox="0 0 360 268" width="100%" style={{ maxHeight:260 }}>
        <defs><filter id="bfsGlw"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
        {edges.map(([a,b],i) => {
          const n1=nodes[a],n2=nodes[b];
          const isVis = cur && cur.visited.has(a) && cur.visited.has(b);
          return <line key={i} x1={n1.x} y1={n1.y} x2={n2.x} y2={n2.y} stroke={isVis?"rgba(96,165,250,0.45)":"rgba(255,255,255,0.1)"} strokeWidth={isVis?2:1.5} style={{transition:"all 0.4s"}}/>;
        })}
        {nodes.map((n,i) => {
          const isVisited = cur ? cur.visited.has(n.id) : false;
          const isCurrent = cur && cur.current === n.id;
          const isQueued = cur && cur.queue.includes(n.id) && !isCurrent;
          const lc = levelColors[nodeLevels[i]];
          return (
            <g key={n.id}>
              {isCurrent && <circle cx={n.x} cy={n.y} r={34} fill="none" stroke="#f59e0b" strokeWidth="2" strokeOpacity="0.4" style={{animation:"nodeRip 0.8s ease-out forwards"}}/>}
              <circle cx={n.x} cy={n.y} r={20} fill={isCurrent?`${lc}38`:isQueued?`${lc}20`:isVisited?`${lc}14`:"rgba(255,255,255,0.04)"} stroke={isCurrent?"#f59e0b":isQueued?lc:isVisited?`${lc}70`:"rgba(255,255,255,0.12)"} strokeWidth={isCurrent?2.5:isQueued?2:1.5} filter={isCurrent?"url(#bfsGlw)":undefined} style={{transition:"all 0.4s"}}/>
              <text x={n.x} y={n.y+1} textAnchor="middle" dominantBaseline="middle" fill={isCurrent?"#f59e0b":isVisited?lc:"#475569"} fontSize="12" fontFamily="'JetBrains Mono',monospace" fontWeight="700">{n.id}</text>
              {/* Level label */}
              <text x={n.x} y={n.y+33} textAnchor="middle" fill={isVisited?lc:"#1a2030"} fontSize="8" fontFamily="'JetBrains Mono',monospace">L{nodeLevels[i]}</text>
            </g>
          );
        })}
        <style>{`@keyframes nodeRip{from{r:22;opacity:0.5}to{r:40;opacity:0}}`}</style>
      </svg>
      {cur && <div style={{ padding:"7px 12px",borderRadius:10,background:"rgba(96,165,250,0.08)",border:"1px solid rgba(96,165,250,0.2)",fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#60a5fa",marginBottom:6,animation:"fadeIn 0.3s ease" }}>
        {cur.msg}
        {cur.queue.length > 0 && <span style={{ color:"#475569" }}> · Queue: [{cur.queue.join(",")}]</span>}
      </div>}
      <div style={{ display:"flex",gap:8,justifyContent:"center" }}>
        <button onClick={reset} style={{ padding:"5px 14px",borderRadius:20,cursor:"pointer",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#475569" }}>↺ RESET</button>
        <button onClick={running?reset:run} style={{ padding:"5px 18px",borderRadius:20,cursor:"pointer",background:"rgba(96,165,250,0.15)",border:"1px solid rgba(96,165,250,0.4)",fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:700,color:"#60a5fa" }}>{running?"⏹ STOP":step>=BFS_STEPS.length-1?"↺ REPLAY":"▶ RUN BFS"}</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VISUAL: DFS
// ═══════════════════════════════════════════════════════════════════════════════
function VisDFS() {
  const [step, setStep] = useState(-1);
  const [running, setRunning] = useState(false);
  const tmr = useRef();
  const nodes = [{id:0,x:180,y:50},{id:1,x:80,y:145},{id:2,x:280,y:145},{id:3,x:40,y:240},{id:4,x:145,y:240},{id:5,x:235,y:240},{id:6,x:320,y:240}];
  const edges = [[0,1],[0,2],[1,3],[1,4],[2,5],[2,6]];
  const DFS_STEPS = [
    {visited:new Set([0]),stack:[0],current:0,path:[0],msg:"Visit 0 → push to stack"},
    {visited:new Set([0,1]),stack:[0,1],current:1,path:[0,1],msg:"Go deep: visit 1"},
    {visited:new Set([0,1,3]),stack:[0,1,3],current:3,path:[0,1,3],msg:"Go deep: visit 3 (dead end)"},
    {visited:new Set([0,1,3,4]),stack:[0,1,4],current:4,path:[0,1,4],msg:"Backtrack to 1 → visit 4 (dead end)"},
    {visited:new Set([0,1,2,3,4]),stack:[0,2],current:2,path:[0,2],msg:"Backtrack to 0 → visit 2"},
    {visited:new Set([0,1,2,3,4,5]),stack:[0,2,5],current:5,path:[0,2,5],msg:"Go deep: visit 5 (dead end)"},
    {visited:new Set([0,1,2,3,4,5,6]),stack:[0,2,6],current:6,path:[0,2,6],msg:"✓ DFS complete — explored all nodes depth-first"},
  ];
  const cur = step >= 0 && step < DFS_STEPS.length ? DFS_STEPS[step] : null;
  const run = () => {
    if(running) return; setRunning(true); setStep(0);
    let s=0;
    tmr.current=setInterval(()=>{s++;setStep(s);if(s>=DFS_STEPS.length-1){clearInterval(tmr.current);setRunning(false);}},850);
  };
  const reset = () => { clearInterval(tmr.current); setStep(-1); setRunning(false); };
  useEffect(() => () => clearInterval(tmr.current), []);

  return (
    <div>
      <svg viewBox="0 0 360 265" width="100%" style={{ maxHeight:258 }}>
        <defs><filter id="dfsGlw"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
        {edges.map(([a,b],i) => {
          const n1=nodes[a],n2=nodes[b];
          const pathVis = cur && cur.path.includes(a) && cur.path.includes(b);
          return <line key={i} x1={n1.x} y1={n1.y} x2={n2.x} y2={n2.y} stroke={pathVis?"rgba(167,139,250,0.6)":"rgba(255,255,255,0.1)"} strokeWidth={pathVis?2.5:1.5} style={{transition:"all 0.4s"}}/>;
        })}
        {nodes.map((n) => {
          const isVis = cur && cur.visited.has(n.id);
          const isCur = cur && cur.current === n.id;
          const isPath = cur && cur.path.includes(n.id);
          return (
            <g key={n.id}>
              {isCur && <circle cx={n.x} cy={n.y} r={34} fill="none" stroke="#a78bfa" strokeWidth="2" strokeOpacity="0.4" style={{animation:"nodeRip 0.8s ease-out forwards"}}/>}
              <circle cx={n.x} cy={n.y} r={20} fill={isCur?"rgba(167,139,250,0.35)":isPath?"rgba(167,139,250,0.18)":isVis?"rgba(167,139,250,0.09)":"rgba(255,255,255,0.04)"} stroke={isCur?"#a78bfa":isPath?"rgba(167,139,250,0.8)":isVis?"rgba(167,139,250,0.4)":"rgba(255,255,255,0.12)"} strokeWidth={isCur?2.5:isPath?2:1.5} filter={isCur?"url(#dfsGlw)":undefined} style={{transition:"all 0.4s"}}/>
              <text x={n.x} y={n.y+1} textAnchor="middle" dominantBaseline="middle" fill={isCur||isPath?"#a78bfa":isVis?"rgba(167,139,250,0.7)":"#475569"} fontSize="12" fontFamily="'JetBrains Mono',monospace" fontWeight="700">{n.id}</text>
            </g>
          );
        })}
        {cur && cur.path.length > 1 && cur.path.map((nid,i) => {
          if(i===0) return null;
          const n1=nodes[cur.path[i-1]],n2=nodes[nid];
          return <text key={i} x={(n1.x+n2.x)/2+8} y={(n1.y+n2.y)/2-5} fill="#a78bfa" fontSize="9" fontFamily="'JetBrains Mono',monospace" fontWeight="700">{i}</text>;
        })}
      </svg>
      {cur && <div style={{ padding:"7px 12px",borderRadius:10,background:"rgba(167,139,250,0.08)",border:"1px solid rgba(167,139,250,0.2)",fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#a78bfa",marginBottom:6,animation:"fadeIn 0.3s ease" }}>
        {cur.msg}
        {cur.stack.length > 0 && <span style={{ color:"#475569" }}> · Stack: [{cur.stack.join(",")}]</span>}
      </div>}
      <div style={{ display:"flex",gap:8,justifyContent:"center" }}>
        <button onClick={reset} style={{ padding:"5px 14px",borderRadius:20,cursor:"pointer",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#475569" }}>↺ RESET</button>
        <button onClick={running?reset:run} style={{ padding:"5px 18px",borderRadius:20,cursor:"pointer",background:"rgba(167,139,250,0.15)",border:"1px solid rgba(167,139,250,0.4)",fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:700,color:"#a78bfa" }}>{running?"⏹ STOP":step>=DFS_STEPS.length-1?"↺ REPLAY":"▶ RUN DFS"}</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VISUAL: Dijkstra
// ═══════════════════════════════════════════════════════════════════════════════
function VisDijkstra() {
  const [step, setStep] = useState(-1);
  const [running, setRunning] = useState(false);
  const tmr = useRef();

  const nodes = [{id:0,x:60,y:140,lbl:"S"},{id:1,x:165,y:60,lbl:"A"},{id:2,x:165,y:225,lbl:"B"},{id:3,x:290,y:60,lbl:"C"},{id:4,x:290,y:225,lbl:"D"},{id:5,x:360,y:140,lbl:"T"}];
  const edges = [[0,1,4],[0,2,2],[1,2,1],[1,3,5],[2,4,8],[2,3,8],[3,5,2],[4,3,2],[4,5,3]];

  const STEPS = [
    {dist:{0:0,1:Infinity,2:Infinity,3:Infinity,4:Infinity,5:Infinity},done:new Set(),current:0,msg:"Initialize: S=0, all others=∞"},
    {dist:{0:0,1:4,2:2,3:Infinity,4:Infinity,5:Infinity},done:new Set([0]),current:2,msg:"Process S(0): relax A→4, B→2. Pick B (min)"},
    {dist:{0:0,1:3,2:2,3:10,4:10,5:Infinity},done:new Set([0,2]),current:1,msg:"Process B(2): relax A→3, C→10, D→10. Pick A"},
    {dist:{0:0,1:3,2:2,3:8,4:10,5:Infinity},done:new Set([0,1,2]),current:3,msg:"Process A(3): relax C→8. Pick C"},
    {dist:{0:0,1:3,2:2,3:8,4:10,5:10},done:new Set([0,1,2,3]),current:4,msg:"Process C(8): relax T→10. Pick D"},
    {dist:{0:0,1:3,2:2,3:10,4:10,5:11},done:new Set([0,1,2,3,4]),current:5,msg:"Process D(10): check T→13 (no improvement)"},
    {dist:{0:0,1:3,2:2,3:8,4:10,5:10},done:new Set([0,1,2,3,4,5]),current:5,msg:"✓ Shortest path S→T = 10 (S→B→A→C→T)"},
  ];

  const cur = step >= 0 && step < STEPS.length ? STEPS[step] : null;
  const run = () => {
    if(running) return; setRunning(true); setStep(0);
    let s=0;
    tmr.current=setInterval(()=>{s++;setStep(s);if(s>=STEPS.length-1){clearInterval(tmr.current);setRunning(false);}},950);
  };
  const reset = () => { clearInterval(tmr.current); setStep(-1); setRunning(false); };
  useEffect(() => () => clearInterval(tmr.current), []);

  const shortestPath = new Set([0,1,2,3,5]); // S,B,A,C,T

  return (
    <div>
      <svg viewBox="0 0 420 298" width="100%" style={{ maxHeight:290 }}>
        <defs><filter id="dijGlw"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
        {edges.map(([a,b,w],i) => {
          const n1=nodes[a],n2=nodes[b];
          const isShortPath = cur && step===STEPS.length-1 && shortestPath.has(a) && shortestPath.has(b);
          return (
            <g key={i}>
              <line x1={n1.x} y1={n1.y} x2={n2.x} y2={n2.y} stroke={isShortPath?"#4ade80":"rgba(255,255,255,0.1)"} strokeWidth={isShortPath?2.5:1.5} style={{transition:"all 0.4s"}}/>
              <text x={(n1.x+n2.x)/2+4} y={(n1.y+n2.y)/2-4} fill={isShortPath?"#4ade80":"#334155"} fontSize="9" fontFamily="'JetBrains Mono',monospace" fontWeight="700">{w}</text>
            </g>
          );
        })}
        {nodes.map((n) => {
          const isDone = cur && cur.done.has(n.id);
          const isCur = cur && cur.current === n.id;
          const dist = cur ? cur.dist[n.id] : null;
          const col = isCur ? "#fbbf24" : isDone ? "#34d399" : "#38bdf8";
          return (
            <g key={n.id}>
              {isCur && <circle cx={n.x} cy={n.y} r={34} fill="none" stroke="#fbbf24" strokeWidth="2" strokeOpacity="0.35" style={{animation:"nodeRip 0.8s ease-out forwards"}}/>}
              <circle cx={n.x} cy={n.y} r={22} fill={isCur?"rgba(251,191,36,0.3)":isDone?"rgba(52,211,153,0.18)":"rgba(56,189,248,0.1)"} stroke={col} strokeWidth={isCur?2.5:1.5} filter={isCur?"url(#dijGlw)":undefined} style={{transition:"all 0.4s"}}/>
              <text x={n.x} y={n.y+1} textAnchor="middle" dominantBaseline="middle" fill={col} fontSize="12" fontFamily="'JetBrains Mono',monospace" fontWeight="700">{n.lbl}</text>
              {dist !== null && (
                <text x={n.x} y={n.y-30} textAnchor="middle" fill={isDone?"#34d399":col} fontSize="10" fontFamily="'JetBrains Mono',monospace" fontWeight="700">
                  {dist === Infinity ? "∞" : dist}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {cur && <div style={{ padding:"7px 12px",borderRadius:10,background:"rgba(251,191,36,0.07)",border:"1px solid rgba(251,191,36,0.2)",fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#fbbf24",marginBottom:6,animation:"fadeIn 0.3s ease" }}>{cur.msg}</div>}
      <div style={{ display:"flex",gap:8,justifyContent:"center" }}>
        <button onClick={reset} style={{ padding:"5px 14px",borderRadius:20,cursor:"pointer",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#475569" }}>↺ RESET</button>
        <button onClick={running?reset:run} style={{ padding:"5px 18px",borderRadius:20,cursor:"pointer",background:"rgba(251,191,36,0.15)",border:"1px solid rgba(251,191,36,0.4)",fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:700,color:"#fbbf24" }}>{running?"⏹ STOP":step>=STEPS.length-1?"↺ REPLAY":"▶ RUN DIJKSTRA"}</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VISUAL: Bellman-Ford
// ═══════════════════════════════════════════════════════════════════════════════
function VisBellmanFord() {
  const [step, setStep] = useState(-1);
  const [running, setRunning] = useState(false);
  const tmr = useRef();

  const nodes = [{id:0,x:60,y:130,lbl:"S"},{id:1,x:180,y:55,lbl:"A"},{id:2,x:180,y:210,lbl:"B"},{id:3,x:310,y:130,lbl:"T"}];
  const edges = [[0,1,6],[0,2,7],[1,2,8],[1,3,5],[2,3,-3],[1,0,-2]]; // has negative edge

  const STEPS = [
    {dist:{0:0,1:Infinity,2:Infinity,3:Infinity},pass:0,edge:null,msg:"Initialize: S=0, all others=∞"},
    {dist:{0:0,1:6,2:7,3:Infinity},pass:1,edge:[0,1],msg:"Pass 1: Relax S→A (6), S→B (7)"},
    {dist:{0:0,1:4,2:7,3:11},pass:1,edge:[1,3],msg:"Pass 1: Relax A→T (11), B→T via neg: check"},
    {dist:{0:0,1:4,2:7,3:4},pass:2,edge:[2,3],msg:"Pass 2: Relax B→T via -3 edge: 7+(-3)=4 ✓"},
    {dist:{0:0,1:4,2:7,3:4},pass:3,edge:null,msg:"Pass 3: No improvement. Algorithm converges."},
    {dist:{0:0,1:4,2:7,3:4},pass:"done",edge:null,msg:"✓ Shortest S→T = 4. Handles negative edges!"},
  ];

  const cur = step >= 0 && step < STEPS.length ? STEPS[step] : null;
  const run = () => {
    if(running) return; setRunning(true); setStep(0);
    let s=0;
    tmr.current=setInterval(()=>{s++;setStep(s);if(s>=STEPS.length-1){clearInterval(tmr.current);setRunning(false);}},1000);
  };
  const reset = () => { clearInterval(tmr.current); setStep(-1); setRunning(false); };
  useEffect(() => () => clearInterval(tmr.current), []);

  return (
    <div>
      <svg viewBox="0 0 370 278" width="100%" style={{ maxHeight:270 }}>
        <defs>
          <marker id="bfArr" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="#fb7185"/></marker>
          <filter id="bfGlw"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        {edges.map(([a,b,w],i) => {
          const n1=nodes[a],n2=nodes[b];
          const isNeg=w<0;
          const isActive=cur&&cur.edge&&cur.edge[0]===a&&cur.edge[1]===b;
          const dx=n2.x-n1.x,dy=n2.y-n1.y,dist=Math.sqrt(dx*dx+dy*dy);
          const ex1=n1.x+(dx/dist)*24,ey1=n1.y+(dy/dist)*24;
          const ex2=n2.x-(dx/dist)*24,ey2=n2.y-(dy/dist)*24;
          const mx=(n1.x+n2.x)/2+5,my=(n1.y+n2.y)/2-6;
          return (
            <g key={i}>
              <line x1={ex1} y1={ey1} x2={ex2} y2={ey2} stroke={isActive?"#fb7185":isNeg?"rgba(251,113,133,0.4)":"rgba(255,255,255,0.12)"} strokeWidth={isActive?2.5:1.5} markerEnd="url(#bfArr)" filter={isActive?"url(#bfGlw)":undefined} style={{transition:"all 0.4s"}}/>
              <text x={mx} y={my} fill={isActive?"#fb7185":isNeg?"#fb7185":"#334155"} fontSize="11" fontFamily="'JetBrains Mono',monospace" fontWeight="700">{w}</text>
            </g>
          );
        })}
        {nodes.map((n) => {
          const dist = cur ? cur.dist[n.id] : null;
          return (
            <g key={n.id}>
              <circle cx={n.x} cy={n.y} r={24} fill="rgba(251,113,133,0.1)" stroke="#fb7185" strokeWidth="1.5"/>
              <text x={n.x} y={n.y+1} textAnchor="middle" dominantBaseline="middle" fill="#fb7185" fontSize="13" fontFamily="'JetBrains Mono',monospace" fontWeight="700">{n.lbl}</text>
              {dist !== null && <text x={n.x} y={n.y-32} textAnchor="middle" fill="#fb7185" fontSize="11" fontFamily="'JetBrains Mono',monospace" fontWeight="700">{dist===Infinity?"∞":dist}</text>}
            </g>
          );
        })}
        {/* Negative edge label */}
        <text x={260} y={192} fill="rgba(251,113,133,0.6)" fontSize="9" fontFamily="'JetBrains Mono',monospace">← NEGATIVE EDGE</text>
      </svg>
      {cur && <div style={{ padding:"7px 12px",borderRadius:10,background:"rgba(251,113,133,0.08)",border:"1px solid rgba(251,113,133,0.22)",fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#fb7185",marginBottom:6,animation:"fadeIn 0.3s ease" }}>
        {`Pass ${cur.pass}: `}{cur.msg}
      </div>}
      <div style={{ display:"flex",gap:8,justifyContent:"center" }}>
        <button onClick={reset} style={{ padding:"5px 14px",borderRadius:20,cursor:"pointer",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#475569" }}>↺ RESET</button>
        <button onClick={running?reset:run} style={{ padding:"5px 18px",borderRadius:20,cursor:"pointer",background:"rgba(251,113,133,0.15)",border:"1px solid rgba(251,113,133,0.4)",fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:700,color:"#fb7185" }}>{running?"⏹ STOP":step>=STEPS.length-1?"↺ REPLAY":"▶ RUN BELLMAN-FORD"}</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VISUAL: Topological Sort
// ═══════════════════════════════════════════════════════════════════════════════
function VisTopoSort() {
  const [step, setStep] = useState(-1);
  const [running, setRunning] = useState(false);
  const tmr = useRef();

  const nodes = [{id:0,x:55,y:130,lbl:"A"},{id:1,x:160,y:60,lbl:"B"},{id:2,x:160,y:200,lbl:"C"},{id:3,x:265,y:130,lbl:"D"},{id:4,x:360,y:60,lbl:"E"},{id:5,x:360,y:200,lbl:"F"}];
  // DAG edges: A→B, A→C, B→D, C→D, D→E, D→F
  const edges = [[0,1],[0,2],[1,3],[2,3],[3,4],[3,5]];

  const STEPS = [
    {order:[],visited:new Set(),current:0,inDeg:{0:0,1:1,2:1,3:2,4:1,5:1},msg:"In-degrees: A=0, B=1, C=1, D=2, E=1, F=1"},
    {order:["A"],visited:new Set([0]),current:1,inDeg:{0:0,1:0,2:0,3:2,4:1,5:1},msg:"Enqueue zero-indegree: A. Process A → reduce B,C in-degree to 0"},
    {order:["A","B"],visited:new Set([0,1]),current:2,inDeg:{0:0,1:0,2:0,3:1,4:1,5:1},msg:"Process B → reduce D in-degree to 1"},
    {order:["A","B","C"],visited:new Set([0,1,2]),current:3,inDeg:{0:0,1:0,2:0,3:0,4:1,5:1},msg:"Process C → reduce D in-degree to 0. Enqueue D"},
    {order:["A","B","C","D"],visited:new Set([0,1,2,3]),current:4,inDeg:{0:0,1:0,2:0,3:0,4:0,5:0},msg:"Process D → reduce E,F to 0. Enqueue E,F"},
    {order:["A","B","C","D","E","F"],visited:new Set([0,1,2,3,4,5]),current:-1,inDeg:{0:0,1:0,2:0,3:0,4:0,5:0},msg:"✓ Topo order: A→B→C→D→E→F"},
  ];

  const cur = step >= 0 && step < STEPS.length ? STEPS[step] : null;
  const run = () => {
    if(running) return; setRunning(true); setStep(0);
    let s=0;
    tmr.current=setInterval(()=>{s++;setStep(s);if(s>=STEPS.length-1){clearInterval(tmr.current);setRunning(false);}},900);
  };
  const reset = () => { clearInterval(tmr.current); setStep(-1); setRunning(false); };
  useEffect(() => () => clearInterval(tmr.current), []);

  return (
    <div>
      <svg viewBox="0 0 420 268" width="100%" style={{ maxHeight:260 }}>
        <defs>
          <marker id="topoArr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#4ade80"/></marker>
          <filter id="topoGlw"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        {edges.map(([a,b],i) => {
          const n1=nodes[a],n2=nodes[b];
          const isProc = cur && cur.visited.has(a);
          const dx=n2.x-n1.x,dy=n2.y-n1.y,d=Math.sqrt(dx*dx+dy*dy);
          return <line key={i} x1={n1.x+(dx/d)*22} y1={n1.y+(dy/d)*22} x2={n2.x-(dx/d)*22} y2={n2.y-(dy/d)*22} stroke={isProc?"rgba(74,222,128,0.5)":"rgba(255,255,255,0.12)"} strokeWidth={isProc?2:1.5} markerEnd="url(#topoArr)" style={{transition:"all 0.4s"}}/>;
        })}
        {nodes.map((n) => {
          const isDone = cur && cur.visited.has(n.id);
          const isCur = cur && cur.current === n.id;
          const inDeg = cur ? cur.inDeg[n.id] : null;
          return (
            <g key={n.id}>
              {isCur && <circle cx={n.x} cy={n.y} r={34} fill="none" stroke="#4ade80" strokeWidth="2" strokeOpacity="0.35" style={{animation:"nodeRip 0.8s ease-out forwards"}}/>}
              <circle cx={n.x} cy={n.y} r={22} fill={isDone?"rgba(74,222,128,0.2)":"rgba(255,255,255,0.04)"} stroke={isCur?"#4ade80":isDone?"rgba(74,222,128,0.6)":"rgba(255,255,255,0.15)"} strokeWidth={isCur?2.5:1.5} filter={isCur?"url(#topoGlw)":undefined} style={{transition:"all 0.4s"}}/>
              <text x={n.x} y={n.y+1} textAnchor="middle" dominantBaseline="middle" fill={isDone?"#4ade80":"#94a3b8"} fontSize="13" fontFamily="'JetBrains Mono',monospace" fontWeight="700">{n.lbl}</text>
              {inDeg !== null && <text x={n.x} y={n.y-32} textAnchor="middle" fill={inDeg===0?"#4ade80":"#334155"} fontSize="9" fontFamily="'JetBrains Mono',monospace">in={inDeg}</text>}
            </g>
          );
        })}
      </svg>
      {cur && <div style={{ padding:"7px 12px",borderRadius:10,background:"rgba(74,222,128,0.07)",border:"1px solid rgba(74,222,128,0.2)",fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#4ade80",marginBottom:6,animation:"fadeIn 0.3s ease" }}>{cur.msg}</div>}
      {cur && cur.order.length > 0 && (
        <div style={{ display:"flex",gap:4,justifyContent:"center",flexWrap:"wrap",marginBottom:8 }}>
          {cur.order.map((lbl,i) => (
            <div key={i} style={{ padding:"4px 12px",borderRadius:8,background:"rgba(74,222,128,0.15)",border:"1px solid rgba(74,222,128,0.35)",fontFamily:"'JetBrains Mono',monospace",fontSize:10,fontWeight:700,color:"#4ade80" }}>{i+1}. {lbl}</div>
          ))}
        </div>
      )}
      <div style={{ display:"flex",gap:8,justifyContent:"center" }}>
        <button onClick={reset} style={{ padding:"5px 14px",borderRadius:20,cursor:"pointer",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#475569" }}>↺ RESET</button>
        <button onClick={running?reset:run} style={{ padding:"5px 18px",borderRadius:20,cursor:"pointer",background:"rgba(74,222,128,0.15)",border:"1px solid rgba(74,222,128,0.4)",fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:700,color:"#4ade80" }}>{running?"⏹ STOP":step>=STEPS.length-1?"↺ REPLAY":"▶ RUN TOPO SORT"}</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VISUAL: MST (Kruskal's)
// ═══════════════════════════════════════════════════════════════════════════════
function VisMST() {
  const [algo, setAlgo] = useState("kruskal");
  const [step, setStep] = useState(-1);
  const [running, setRunning] = useState(false);
  const tmr = useRef();

  const nodes = [{id:0,x:80,y:80,lbl:"A"},{id:1,x:220,y:50,lbl:"B"},{id:2,x:60,y:195,lbl:"C"},{id:3,x:200,y:175,lbl:"D"},{id:4,x:320,y:130,lbl:"E"}];
  const allEdges = [[0,1,2],[0,2,3],[1,3,6],[1,4,5],[2,3,4],[3,4,1],[0,3,7],[2,4,8]];
  const sortedEdges = [...allEdges].sort((a,b)=>a[2]-b[2]);

  const KRUSKAL = [
    {mstEdges:[],msg:"Sort all edges by weight: (D,E)=1, (A,B)=2, (A,C)=3, (C,D)=4, (B,E)=5..."},
    {mstEdges:[[3,4]],msg:"Add (D,E)=1 ✓ No cycle"},
    {mstEdges:[[3,4],[0,1]],msg:"Add (A,B)=2 ✓ No cycle"},
    {mstEdges:[[3,4],[0,1],[0,2]],msg:"Add (A,C)=3 ✓ No cycle"},
    {mstEdges:[[3,4],[0,1],[0,2],[2,3]],msg:"Add (C,D)=4 ✓ No cycle. 4 edges = V-1. Done!"},
    {mstEdges:[[3,4],[0,1],[0,2],[2,3]],msg:"✓ MST total weight: 1+2+3+4 = 10"},
  ];
  const STEPS = KRUSKAL;
  const cur = step >= 0 && step < STEPS.length ? STEPS[step] : null;
  const mstSet = cur ? new Set(cur.mstEdges.map(([a,b])=>`${a}-${b}`)) : new Set();

  const run = () => {
    if(running) return; setRunning(true); setStep(0);
    let s=0;
    tmr.current=setInterval(()=>{s++;setStep(s);if(s>=STEPS.length-1){clearInterval(tmr.current);setRunning(false);}},950);
  };
  const reset = () => { clearInterval(tmr.current); setStep(-1); setRunning(false); };
  useEffect(() => () => clearInterval(tmr.current), []);

  return (
    <div>
      <svg viewBox="0 0 390 252" width="100%" style={{ maxHeight:248 }}>
        {allEdges.map(([a,b,w],i) => {
          const n1=nodes[a],n2=nodes[b];
          const isMST = mstSet.has(`${a}-${b}`) || mstSet.has(`${b}-${a}`);
          const mx=(n1.x+n2.x)/2+4,my=(n1.y+n2.y)/2-5;
          return (
            <g key={i}>
              <line x1={n1.x} y1={n1.y} x2={n2.x} y2={n2.y} stroke={isMST?"#f97316":"rgba(255,255,255,0.1)"} strokeWidth={isMST?3:1.5} style={{transition:"all 0.4s"}}/>
              <text x={mx} y={my} fill={isMST?"#f97316":"#253046"} fontSize="10" fontFamily="'JetBrains Mono',monospace" fontWeight={isMST?"700":"400"}>{w}</text>
            </g>
          );
        })}
        {nodes.map(n => (
          <g key={n.id}>
            <circle cx={n.x} cy={n.y} r={22} fill="rgba(249,115,22,0.12)" stroke="#f97316" strokeWidth="1.5"/>
            <text x={n.x} y={n.y+1} textAnchor="middle" dominantBaseline="middle" fill="#f97316" fontSize="13" fontFamily="'JetBrains Mono',monospace" fontWeight="700">{n.lbl}</text>
          </g>
        ))}
      </svg>
      {cur && <div style={{ padding:"7px 12px",borderRadius:10,background:"rgba(249,115,22,0.08)",border:"1px solid rgba(249,115,22,0.22)",fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#f97316",marginBottom:6,animation:"fadeIn 0.3s ease" }}>{cur.msg}</div>}
      <div style={{ display:"flex",gap:8,justifyContent:"center" }}>
        <button onClick={reset} style={{ padding:"5px 14px",borderRadius:20,cursor:"pointer",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#475569" }}>↺ RESET</button>
        <button onClick={running?reset:run} style={{ padding:"5px 18px",borderRadius:20,cursor:"pointer",background:"rgba(249,115,22,0.15)",border:"1px solid rgba(249,115,22,0.4)",fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:700,color:"#f97316" }}>{running?"⏹ STOP":step>=STEPS.length-1?"↺ REPLAY":"▶ KRUSKAL'S MST"}</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// GRAPH VISUALIZER (Code Editor + Live Graph)
// ═══════════════════════════════════════════════════════════════════════════════
const VIZ_TEMPLATES = {
  javascript: `// Graph Visualizer — JavaScript
// Supported: addEdge(u, v, w?), addNode(id), bfs(start), dfs(start)

const g = new Graph();
g.addEdge(0, 1, 4);
g.addEdge(0, 2, 2);
g.addEdge(1, 3, 5);
g.addEdge(2, 3, 8);
g.addEdge(2, 4, 6);
g.addEdge(3, 4, 3);
g.bfs(0);
`,
  python: `# Graph Visualizer — Python
# Supported: add_edge(u, v, w?), bfs(start), dfs(start)

g = Graph()
g.add_edge(0, 1, 4)
g.add_edge(0, 2, 2)
g.add_edge(1, 3, 5)
g.add_edge(2, 3, 8)
g.add_edge(2, 4, 6)
g.add_edge(3, 4, 3)
g.bfs(0)
`,
  java: `// Graph Visualizer — Java
// Supported: addEdge(u, v, w), bfs(start), dfs(start)

Graph g = new Graph();
g.addEdge(0, 1, 4);
g.addEdge(0, 2, 2);
g.addEdge(1, 3, 5);
g.addEdge(2, 3, 8);
g.addEdge(2, 4, 6);
g.addEdge(3, 4, 3);
g.bfs(0);
`,
};

function parseGraphCode(code) {
  const steps = []; const errors = [];
  try {
    const edgeRe = /(?:addEdge|add_edge)\s*\(\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*(\d+))?\s*\)/g;
    const nodeRe = /(?:addNode|add_node)\s*\(\s*(\d+)\s*\)/g;
    const bfsRe  = /(?:bfs)\s*\(\s*(\d+)\s*\)/g;
    const dfsRe  = /(?:dfs)\s*\(\s*(\d+)\s*\)/g;

    const edges = []; const nodeSet = new Set(); let m;
    while ((m = edgeRe.exec(code)) !== null) {
      const u=+m[1],v=+m[2],w=m[3]!==undefined?+m[3]:1;
      edges.push([u,v,w]); nodeSet.add(u); nodeSet.add(v);
      steps.push({ type:"addEdge", u, v, w, edges:[...edges], nodes:[...nodeSet], msg:`addEdge(${u}, ${v}${m[3]!==undefined?", "+w:""})` });
    }
    while ((m = nodeRe.exec(code)) !== null) { nodeSet.add(+m[1]); }

    const adjList = {};
    [...nodeSet].forEach(n => { adjList[n] = []; });
    edges.forEach(([u,v,w]) => { adjList[u].push({to:v,w}); adjList[v].push({to:u,w}); });

    while ((m = bfsRe.exec(code)) !== null) {
      const start = +m[1];
      const visited = new Set(); const queue = [start]; visited.add(start);
      const bfsOrder = [];
      while (queue.length) {
        const cur = queue.shift(); bfsOrder.push(cur);
        (adjList[cur]||[]).forEach(({to}) => { if(!visited.has(to)){visited.add(to);queue.push(to);} });
        steps.push({ type:"bfs", current:cur, visited:new Set(visited), bfsOrder:[...bfsOrder], edges:[...edges], nodes:[...nodeSet], msg:`BFS visiting node ${cur}` });
      }
    }

    while ((m = dfsRe.exec(code)) !== null) {
      const start = +m[1];
      const visited = new Set(); const dfsOrder = [];
      const dfsRun = (node) => {
        visited.add(node); dfsOrder.push(node);
        steps.push({ type:"dfs", current:node, visited:new Set(visited), dfsOrder:[...dfsOrder], edges:[...edges], nodes:[...nodeSet], msg:`DFS visiting node ${node}` });
        (adjList[node]||[]).sort((a,b)=>a.to-b.to).forEach(({to}) => { if(!visited.has(to)) dfsRun(to); });
      };
      dfsRun(start);
    }

    if (steps.length === 0) errors.push("No recognizable operations found.\nUse: addEdge(u, v, w), bfs(start), dfs(start)");
  } catch(e) { errors.push(e.message); }
  return { steps, errors };
}

function GraphCanvas({ nodes, edges, highlight, current, visited, type }) {
  if (!nodes || nodes.length === 0) return (
    <div style={{ display:"flex",alignItems:"center",justifyContent:"center",width:"100%",height:220,color:"#1e3050",fontFamily:"'JetBrains Mono',monospace",fontSize:13,border:"1px dashed #1a2744",borderRadius:12 }}>Graph will appear here</div>
  );

  const W=560, H=300;
  // Auto-layout nodes in a circle
  const nodeList = [...nodes].sort((a,b)=>a-b);
  const n = nodeList.length;
  const cx=W/2, cy=H/2, r=Math.min(cx,cy)-52;
  const pos = {};
  nodeList.forEach((id,i) => {
    const angle = (i/n)*2*Math.PI - Math.PI/2;
    pos[id] = { x: cx+r*Math.cos(angle), y: cy+r*Math.sin(angle) };
  });

  const COLORS = ["#38bdf8","#818cf8","#4ade80","#fbbf24","#fb7185","#a78bfa","#34d399","#f97316","#60a5fa","#e879f9"];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxHeight:300 }}>
      <defs>
        <filter id="cvGlw"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      {edges.map(([u,v,w],i) => {
        if(!pos[u]||!pos[v]) return null;
        const isPath = visited && visited.has(u) && visited.has(v);
        const col = type==="bfs"?"#60a5fa":type==="dfs"?"#a78bfa":"rgba(255,255,255,0.18)";
        return (
          <g key={i}>
            <line x1={pos[u].x} y1={pos[u].y} x2={pos[v].x} y2={pos[v].y} stroke={isPath?col:"rgba(255,255,255,0.1)"} strokeWidth={isPath?2.5:1.5} style={{transition:"all 0.4s"}}/>
            <text x={(pos[u].x+pos[v].x)/2+4} y={(pos[u].y+pos[v].y)/2-5} fill="#253046" fontSize="9" fontFamily="'JetBrains Mono',monospace">{w>1?w:""}</text>
          </g>
        );
      })}
      {nodeList.map((id,i) => {
        const p = pos[id];
        if(!p) return null;
        const isVis = visited && visited.has(id);
        const isCur = current === id;
        const col = COLORS[i % COLORS.length];
        return (
          <g key={id} style={{animation:`nodePp 0.4s cubic-bezier(0.22,1,0.36,1) ${i*0.06}s both`}}>
            {isCur && <circle cx={p.x} cy={p.y} r={34} fill="none" stroke={col} strokeWidth="1.5" strokeOpacity="0.3" style={{animation:"nodeRip 0.8s ease-out forwards"}}/>}
            <circle cx={p.x} cy={p.y} r={22} fill={isVis?`${col}2a`:isCur?`${col}30`:`${col}10`} stroke={col} strokeWidth={isCur?2.5:1.5} filter={isCur?"url(#cvGlw)":undefined} style={{transition:"all 0.35s"}}/>
            <text x={p.x} y={p.y+1} textAnchor="middle" dominantBaseline="middle" fill={col} fontSize="13" fontFamily="'JetBrains Mono',monospace" fontWeight="700">{id}</text>
          </g>
        );
      })}
      <style>{`@keyframes nodePp{from{opacity:0;transform-origin:50% 50%;transform:scale(0)}to{opacity:1;transform:scale(1)}}@keyframes nodeRip{from{r:24;opacity:0.5}to{r:46;opacity:0}}`}</style>
    </svg>
  );
}

function GraphVisualizer() {
  const [lang, setLang] = useState("javascript");
  const [code, setCode] = useState(VIZ_TEMPLATES["javascript"]);
  const [steps, setSteps] = useState([]);
  const [curStep, setCurStep] = useState(-1);
  const [error, setError] = useState("");
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const tmr = useRef();
  const taRef = useRef();

  const reset = () => { clearInterval(tmr.current); setSteps([]); setCurStep(-1); setError(""); setRunning(false); setDone(false); };
  const handleLang = (l) => { setLang(l); setCode(VIZ_TEMPLATES[l]||""); reset(); };

  const handleRun = () => {
    reset();
    const { steps:s, errors } = parseGraphCode(code);
    if (errors.length) { setError(errors.join("\n")); return; }
    setSteps(s); setRunning(true); setCurStep(0);
  };

  useEffect(() => {
    if (!running || steps.length === 0) return;
    tmr.current = setInterval(() => {
      setCurStep(prev => {
        const next = prev + 1;
        if (next >= steps.length) { clearInterval(tmr.current); setRunning(false); setDone(true); return prev; }
        return next;
      });
    }, 900);
    return () => clearInterval(tmr.current);
  }, [running, steps]);

  const step = steps[curStep] || null;
  const handleKeyDown = (e) => {
    if (e.key === "Tab") {
      e.preventDefault(); const s=e.target.selectionStart,end=e.target.selectionEnd;
      const nv=code.substring(0,s)+"  "+code.substring(end); setCode(nv);
      requestAnimationFrame(() => { if(taRef.current){taRef.current.selectionStart=s+2;taRef.current.selectionEnd=s+2;} });
    }
  };

  const opColor = { addEdge:"#38bdf8", bfs:"#60a5fa", dfs:"#a78bfa" };

  return (
    <section id="visualizer" style={{ marginBottom:80 }}>
      <div style={{ display:"flex",alignItems:"center",gap:14,marginBottom:22,flexWrap:"wrap" }}>
        <div style={{ width:50,height:50,borderRadius:16,flexShrink:0,background:"rgba(232,121,249,0.12)",border:"1px solid rgba(232,121,249,0.32)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,boxShadow:"0 0 28px rgba(232,121,249,0.15)" }}>💻</div>
        <div>
          <h2 style={{ fontFamily:"'Syne',sans-serif",fontSize:"clamp(19px,3.8vw,30px)",fontWeight:800,color:"#f8fafc" }}>Interactive Graph Visualizer</h2>
          <p style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#2d3748",marginTop:3,letterSpacing:"0.08em" }}>WRITE CODE · WATCH IT ANIMATE · LEARN BY DOING</p>
        </div>
      </div>

      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:20 }} className="viz-grid">
        {/* Editor Panel */}
        <div style={{ background:"rgba(10,18,35,0.7)",border:"1px solid #1a2744",borderRadius:16,overflow:"hidden",display:"flex",flexDirection:"column" }}>
          <div style={{ padding:"12px 18px",borderBottom:"1px solid #1a2744",display:"flex",alignItems:"center",gap:8,background:"rgba(15,25,50,0.6)" }}>
            {["#ff5f57","#ffbd2e","#28c840"].map((c,i) => <span key={i} style={{ width:10,height:10,borderRadius:"50%",background:c,display:"inline-block" }}/>)}
            <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"#4a6080",letterSpacing:"1px",marginLeft:6,textTransform:"uppercase" }}>Code Editor</span>
          </div>
          <div style={{ display:"flex",gap:5,padding:"10px 16px",borderBottom:"1px solid #0f1e3a",flexWrap:"wrap" }}>
            {Object.keys(VIZ_TEMPLATES).map(l => (
              <button key={l} onClick={()=>handleLang(l)} style={{ padding:"4px 12px",borderRadius:6,fontFamily:"'JetBrains Mono',monospace",fontSize:11,cursor:"pointer",border:`1px solid ${lang===l?"#38bdf8":"#1a2744"}`,background:lang===l?"rgba(56,189,248,0.15)":"transparent",color:lang===l?"#7dd3fc":"#4a6080",transition:"all 0.18s" }}>{l.charAt(0).toUpperCase()+l.slice(1)}</button>
            ))}
          </div>
          <textarea ref={taRef} value={code} onChange={e=>setCode(e.target.value)} onKeyDown={handleKeyDown} spellCheck={false}
            style={{ flex:1,minHeight:260,padding:"16px 18px",background:"transparent",border:"none",outline:"none",color:"#c5daf0",fontFamily:"'JetBrains Mono',monospace",fontSize:12,lineHeight:1.7,resize:"vertical",caretColor:"#38bdf8" }}
            placeholder="// Write your graph code here..."/>
          {error && (
            <div style={{ margin:"10px 16px",padding:"12px 14px",background:"rgba(255,80,80,0.08)",border:"1px solid rgba(255,100,100,0.25)",borderRadius:10,color:"#ff8888",fontFamily:"'JetBrains Mono',monospace",fontSize:11,lineHeight:1.6 }}>
              <div style={{ fontWeight:700,marginBottom:4 }}>⚠ {error}</div>
            </div>
          )}
          <div style={{ padding:"12px 16px",borderTop:"1px solid #0f1e3a",display:"flex",gap:10,alignItems:"center" }}>
            <button onClick={handleRun} disabled={running} style={{ padding:"10px 24px",borderRadius:8,background:running?"rgba(26,108,247,0.3)":"linear-gradient(135deg,#0ea5e9,#38bdf8)",border:"none",color:"#fff",fontFamily:"'JetBrains Mono',monospace",fontSize:12,fontWeight:700,cursor:running?"default":"pointer",boxShadow:running?"none":"0 0 18px rgba(14,165,233,0.4)",transition:"all 0.2s" }}>
              {running?"▶ Running...":"▶ Run & Visualize"}
            </button>
            {(steps.length>0||error) && <button onClick={reset} style={{ padding:"10px 16px",borderRadius:8,background:"transparent",border:"1px solid #1a2744",color:"#4a6080",fontFamily:"'JetBrains Mono',monospace",fontSize:11,cursor:"pointer",transition:"all 0.2s" }}>↺ Reset</button>}
          </div>
        </div>

        {/* Viz Panel */}
        <div style={{ background:"rgba(10,18,35,0.7)",border:"1px solid #1a2744",borderRadius:16,overflow:"hidden",display:"flex",flexDirection:"column" }}>
          <div style={{ padding:"12px 18px",borderBottom:"1px solid #1a2744",display:"flex",alignItems:"center",gap:8,background:"rgba(15,25,50,0.6)" }}>
            {["#38bdf8","#818cf8","#4ade80"].map((c,i) => <span key={i} style={{ width:10,height:10,borderRadius:"50%",background:c,display:"inline-block" }}/>)}
            <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"#4a6080",letterSpacing:"1px",marginLeft:6,textTransform:"uppercase" }}>Graph Visualization</span>
          </div>
          <div style={{ flex:1,padding:"16px",display:"flex",alignItems:"flex-start",justifyContent:"center",minHeight:260 }}>
            <GraphCanvas nodes={step?.nodes||[]} edges={step?.edges||[]} current={step?.current} visited={step?.visited} type={step?.type}/>
          </div>
          {step && (
            <div style={{ padding:"12px 18px",borderTop:"1px solid #0f1e3a",background:"rgba(8,15,30,0.5)" }}>
              <div style={{ display:"inline-flex",alignItems:"center",gap:8,padding:"5px 12px",borderRadius:20,fontFamily:"'JetBrains Mono',monospace",fontSize:11,fontWeight:700,marginBottom:6,background:`rgba(${step.type==="bfs"?"96,165,250":step.type==="dfs"?"167,139,250":"56,189,248"},0.15)`,border:`1px solid ${opColor[step.type]||"#38bdf8"}55`,color:opColor[step.type]||"#38bdf8",animation:"fadeIn 0.3s ease" }}>
                {step.type==="bfs"?"🌊 BFS":step.type==="dfs"?"🌀 DFS":"➕ EDGE"} · {step.type==="addEdge"?`${step.u}↔${step.v}`:`node ${step.current}`}
              </div>
              <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"#4a6080" }}>{step.msg}</div>
              {(step.bfsOrder||step.dfsOrder) && <div style={{ marginTop:4,display:"flex",gap:3,flexWrap:"wrap" }}>
                {(step.bfsOrder||step.dfsOrder||[]).map((n,i) => (
                  <span key={i} style={{ padding:"2px 8px",borderRadius:6,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#64748b" }}>{n}</span>
                ))}
              </div>}
            </div>
          )}
          {done && (
            <div style={{ padding:"14px 18px",background:"rgba(74,200,100,0.08)",borderTop:"1px solid rgba(74,200,100,0.2)",display:"flex",alignItems:"center",gap:10,animation:"fadeIn 0.5s ease" }}>
              <span style={{ fontSize:18,animation:"popIn 0.4s ease" }}>🎉</span>
              <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:"#68d391" }}>All {steps.length} operations visualized!</span>
            </div>
          )}
          {steps.length > 0 && (
            <div style={{ padding:"8px 18px",borderTop:"1px solid #0f1e3a",display:"flex",alignItems:"center",gap:12 }}>
              <div style={{ flex:1,height:4,background:"#0f1e3a",borderRadius:4,overflow:"hidden" }}>
                <div style={{ height:"100%",background:"linear-gradient(90deg,#0ea5e9,#818cf8)",borderRadius:4,width:`${((curStep+1)/steps.length)*100}%`,transition:"width 0.4s",boxShadow:"0 0 8px rgba(14,165,233,0.5)" }}/>
              </div>
              <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#2a4060",whiteSpace:"nowrap" }}>{curStep+1}/{steps.length}</span>
            </div>
          )}
          {steps.length > 0 && (
            <div style={{ maxHeight:120,overflowY:"auto",padding:"8px 16px",borderTop:"1px solid #0f1e3a",display:"flex",flexDirection:"column",gap:3 }}>
              {steps.map((s,i) => (
                <div key={i} onClick={()=>setCurStep(i)} style={{ display:"flex",alignItems:"center",gap:8,padding:"4px 8px",borderRadius:6,cursor:"pointer",background:i===curStep?"rgba(56,189,248,0.1)":"transparent",fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:i===curStep?"#38bdf8":i<curStep?"#28c840":"#1a2744",transition:"all 0.15s" }}>
                  <span style={{ width:7,height:7,borderRadius:"50%",background:i<curStep?"#28c840":i===curStep?(opColor[s.type]||"#38bdf8"):"#1a2744",flexShrink:0 }}/>
                  {s.msg}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPLEXITY TABLE
// ═══════════════════════════════════════════════════════════════════════════════
function ComplexityTable() {
  const [hov, setHov] = useState(null);
  const rows = [
    {nm:"BFS / DFS",        c:"#60a5fa",t:"O(V+E)",  s:"O(V)",    n:"Visit every vertex and edge exactly once"},
    {nm:"Dijkstra (heap)",  c:"#fbbf24",t:"O(E log V)",s:"O(V)",  n:"Min-heap PQ · no negative weights"},
    {nm:"Bellman-Ford",     c:"#fb7185",t:"O(V·E)",  s:"O(V)",    n:"Handles negatives · detects negative cycles"},
    {nm:"Floyd-Warshall",   c:"#818cf8",t:"O(V³)",   s:"O(V²)",   n:"All-pairs shortest paths · small graphs"},
    {nm:"Topological Sort", c:"#4ade80",t:"O(V+E)",  s:"O(V)",    n:"DAG only · DFS finish-time or Kahn's"},
    {nm:"Kruskal's MST",    c:"#f97316",t:"O(E log E)",s:"O(E)",  n:"Sort edges + Union-Find · sparse graphs"},
    {nm:"Prim's MST",       c:"#34d399",t:"O(E log V)",s:"O(V)",  n:"Min-heap · dense graphs prefer adj matrix"},
    {nm:"A* Search",        c:"#e879f9",t:"O(E log V)",s:"O(V)",  n:"Heuristic-guided Dijkstra · game pathfinding"},
  ];
  return (
    <div style={{ overflowX:"auto",WebkitOverflowScrolling:"touch" }}>
      <table style={{ width:"100%",borderCollapse:"collapse",minWidth:480 }}>
        <thead>
          <tr>{["Algorithm","Time","Space","Notes"].map(h => (
            <th key={h} style={{ padding:"10px 14px",textAlign:"left",fontFamily:"'JetBrains Mono',monospace",fontSize:9,letterSpacing:"0.1em",color:"#2d3748",borderBottom:"1px solid rgba(255,255,255,0.06)",fontWeight:700,whiteSpace:"nowrap" }}>{h}</th>
          ))}</tr>
        </thead>
        <tbody>
          {rows.map((r,i) => (
            <tr key={i} onMouseEnter={()=>setHov(i)} onMouseLeave={()=>setHov(null)} style={{ borderBottom:"1px solid rgba(255,255,255,0.04)",background:hov===i?"rgba(255,255,255,0.028)":"transparent",transition:"background 0.2s" }}>
              <td style={{ padding:"10px 14px",whiteSpace:"nowrap" }}>
                <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                  <span style={{ width:7,height:7,borderRadius:"50%",background:r.c,flexShrink:0,boxShadow:hov===i?`0 0 8px ${r.c}`:"none",transition:"box-shadow 0.2s" }}/>
                  <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:11,fontWeight:700,color:"#e2e8f0" }}>{r.nm}</span>
                </div>
              </td>
              <td style={{ padding:"10px 14px",fontFamily:"'JetBrains Mono',monospace",fontSize:11,fontWeight:700,color:r.t.includes("V+E")||r.t.includes("log V")?"#4ade80":r.t.includes("V³")?"#ef4444":"#fbbf24",whiteSpace:"nowrap" }}>{r.t}</td>
              <td style={{ padding:"10px 14px",fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"#64748b",whiteSpace:"nowrap" }}>{r.s}</td>
              <td style={{ padding:"10px 14px",fontFamily:"'DM Sans',sans-serif",fontSize:11,color:"#475569" }}>{r.n}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// QUIZ
// ═══════════════════════════════════════════════════════════════════════════════
function Quiz({ onDone }) {
  const QS = [
    {q:"Which data structure does BFS use internally to track nodes to visit?",opts:["Stack","Queue","Priority Queue","Linked List"],ans:1,exp:"BFS uses a Queue (FIFO). This guarantees level-by-level traversal — all nodes at depth k are visited before any at depth k+1."},
    {q:"Dijkstra's algorithm fails on graphs with:",opts:["Undirected edges","Weighted edges","Negative edge weights","Disconnected components"],ans:2,exp:"Dijkstra's greedy assumption breaks with negative weights — a shorter path via a negative edge discovered later can't correct already-settled distances."},
    {q:"Topological sort is only valid on:",opts:["Any graph","Weighted graphs","Directed Acyclic Graphs (DAGs)","Undirected graphs"],ans:2,exp:"Topological sort requires a DAG. A cycle makes it impossible: in A→B→A, both need to come 'before' the other, a contradiction."},
    {q:"An adjacency matrix uses O(V²) space. When is this justified?",opts:["Always","Never","Dense graphs where E ≈ V²","Sparse graphs where E << V²"],ans:2,exp:"For dense graphs approaching V² edges, the O(V²) waste is minimal and O(1) edge lookup is worth it. Sparse graphs should use adjacency lists."},
    {q:"Which algorithm can detect negative weight cycles?",opts:["Dijkstra","BFS","Bellman-Ford","Prim's"],ans:2,exp:"Bellman-Ford: if any distance can still be reduced after V-1 relaxation passes, a negative cycle exists. Dijkstra can't handle this at all."},
    {q:"Kruskal's algorithm builds an MST by:",opts:["Growing from one vertex","Sorting edges and adding the cheapest non-cycle edge","Running BFS and selecting edges","Using a priority queue on vertices"],ans:1,exp:"Kruskal's sorts all edges by weight, then greedily adds each one if it doesn't form a cycle (checked via Union-Find). Result: minimum spanning tree."},
  ];
  const [ans, setAns] = useState({});
  const [rev, setRev] = useState({});
  const score = Object.entries(ans).filter(([qi,ai])=>QS[+qi].ans===+ai).length;
  useEffect(() => { if(Object.keys(rev).length===QS.length) onDone?.(score,QS.length); }, [rev]);

  return (
    <div>
      <div style={{ marginBottom:20 }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8 }}>
          <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#2d3748",letterSpacing:"0.08em" }}>PROGRESS</span>
          <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#38bdf8",fontWeight:700 }}>{Object.keys(rev).length}/{QS.length}</span>
        </div>
        <div style={{ height:4,background:"rgba(255,255,255,0.06)",borderRadius:99,overflow:"hidden" }}>
          <div style={{ height:"100%",width:`${(Object.keys(rev).length/QS.length)*100}%`,background:"linear-gradient(90deg,#0ea5e9,#818cf8)",borderRadius:99,transition:"width 0.5s cubic-bezier(0.22,1,0.36,1)" }}/>
        </div>
      </div>

      <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
        {QS.map((q,qi) => {
          const isR=rev[qi];
          const bc=isR?(ans[qi]===q.ans?"rgba(74,222,128,0.35)":"rgba(239,68,68,0.35)"):"rgba(255,255,255,0.07)";
          return (
            <div key={qi} style={{ padding:"16px 18px",borderRadius:16,background:"rgba(255,255,255,0.02)",border:`1px solid ${bc}`,transition:"border-color 0.3s" }}>
              <div style={{ display:"flex",gap:10,marginBottom:12,alignItems:"flex-start" }}>
                <span style={{ width:24,height:24,borderRadius:8,flexShrink:0,marginTop:1,background:isR?(ans[qi]===q.ans?"rgba(74,222,128,0.2)":"rgba(239,68,68,0.2)"):"rgba(56,189,248,0.15)",border:`1px solid ${isR?(ans[qi]===q.ans?"rgba(74,222,128,0.42)":"rgba(239,68,68,0.42)"):"rgba(56,189,248,0.32)"}`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:700,color:isR?(ans[qi]===q.ans?"#4ade80":"#ef4444"):"#38bdf8" }}>{qi+1}</span>
                <div style={{ fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:600,color:"#e2e8f0",lineHeight:1.52 }}>{q.q}</div>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:7 }}>
                {q.opts.map((opt,oi) => {
                  const isSel=ans[qi]===oi,isCorr=q.ans===oi;
                  let bg="rgba(255,255,255,0.03)",brd="rgba(255,255,255,0.07)",col="#64748b";
                  if(isR){if(isCorr){bg="rgba(74,222,128,0.12)";brd="rgba(74,222,128,0.38)";col="#4ade80";}else if(isSel){bg="rgba(239,68,68,0.12)";brd="rgba(239,68,68,0.38)";col="#f87171";}else col="#2d3748";}
                  else if(isSel){bg="rgba(56,189,248,0.12)";brd="rgba(56,189,248,0.38)";col="#38bdf8";}
                  return (
                    <button key={oi} onClick={()=>!isR&&setAns(a=>({...a,[qi]:oi}))} style={{ padding:"9px 12px",borderRadius:10,cursor:isR?"default":"pointer",background:bg,border:`1px solid ${brd}`,fontFamily:"'DM Sans',sans-serif",fontSize:13,color:col,textAlign:"left",transition:"all 0.22s",display:"flex",alignItems:"center",gap:8 }}>
                      <span style={{ width:19,height:19,borderRadius:"50%",flexShrink:0,background:isR?(isCorr?"rgba(74,222,128,0.26)":isSel?"rgba(239,68,68,0.26)":"rgba(255,255,255,0.04)"):(isSel?"rgba(56,189,248,0.26)":"rgba(255,255,255,0.04)"),border:`1px solid ${col}50`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:700,color:col }}>{isR&&isCorr?"✓":isR&&isSel&&!isCorr?"✗":String.fromCharCode(65+oi)}</span>
                      {opt}
                    </button>
                  );
                })}
              </div>
              {ans[qi]!==undefined&&!isR&&<button onClick={()=>setRev(r=>({...r,[qi]:true}))} style={{ marginTop:10,padding:"6px 18px",borderRadius:20,cursor:"pointer",background:"rgba(56,189,248,0.12)",border:"1px solid rgba(56,189,248,0.3)",fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:700,color:"#38bdf8" }}>CHECK →</button>}
              {isR&&<div style={{ marginTop:10,padding:"9px 12px",borderRadius:10,background:ans[qi]===q.ans?"rgba(74,222,128,0.07)":"rgba(239,68,68,0.07)",border:`1px solid ${ans[qi]===q.ans?"rgba(74,222,128,0.2)":"rgba(239,68,68,0.2)"}`,fontFamily:"'DM Sans',sans-serif",fontSize:12.5,color:"#94a3b8",lineHeight:1.58,animation:"fUp 0.3s ease" }}>
                <span style={{ fontWeight:700,color:ans[qi]===q.ans?"#4ade80":"#f87171" }}>{ans[qi]===q.ans?"✓ Correct! ":"✗ Not quite — "}</span>{q.exp}
              </div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// KEYBOARD SHORTCUTS MODAL
// ═══════════════════════════════════════════════════════════════════════════════
function ShortcutsModal({ open, onClose }) {
  if (!open) return null;
  return (
    <div style={{ position:"fixed",inset:0,zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.72)",backdropFilter:"blur(10px)",animation:"fadeIn 0.2s ease" }} onClick={onClose}>
      <div style={{ background:"rgba(8,12,24,0.98)",border:"1px solid rgba(56,189,248,0.35)",borderRadius:24,padding:"32px 36px",maxWidth:420,width:"calc(100% - 40px)",boxShadow:"0 24px 80px rgba(0,0,0,0.8)",animation:"popIn 0.25s cubic-bezier(0.22,1,0.36,1) both" }} onClick={e=>e.stopPropagation()}>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24 }}>
          <h3 style={{ fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:800,color:"#f8fafc",margin:0 }}>⌨️ Shortcuts</h3>
          <button onClick={onClose} style={{ background:"none",border:"1px solid rgba(255,255,255,0.1)",color:"#64748b",cursor:"pointer",borderRadius:8,padding:"4px 10px",fontFamily:"'JetBrains Mono',monospace",fontSize:10 }}>ESC</button>
        </div>
        {[["S","Stop current narration"],["↑ / ↓","Navigate sections"],["?","Toggle this panel"],["Esc","Close panels"]].map(([k,d]) => (
          <div key={k} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
            <span style={{ fontFamily:"'DM Sans',sans-serif",fontSize:14,color:"#94a3b8" }}>{d}</span>
            <kbd style={{ background:"rgba(56,189,248,0.15)",border:"1px solid rgba(56,189,248,0.35)",borderRadius:6,padding:"3px 10px",fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"#38bdf8",fontWeight:700 }}>{k}</kbd>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function GraphPage() {
  const router = useRouter();
  const [speaking, setSpeaking] = useState(null);
  const [active, setActive] = useState("intro");
  const [qScore, setQScore] = useState(null);
  const [qTotal, setQTotal] = useState(null);
  const [speed, setSpeed] = useState(1.25);
  const [seenSections, setSeenSections] = useState(new Set());
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const currentNarr = useRef(null);

  useEffect(() => {
    const lk = document.createElement("link");
    lk.rel = "stylesheet";
    lk.href = "https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap";
    document.head.appendChild(lk);
    const warm = () => { window.speechSynthesis?.getVoices(); window.removeEventListener("click", warm); };
    window.addEventListener("click", warm);
    return () => { try { document.head.removeChild(lk); } catch {} };
  }, []);

  useEffect(() => {
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { setActive(e.target.id); setSeenSections(s => new Set([...s, e.target.id])); }
    }), { rootMargin:"-35% 0px -35% 0px" });
    NAV_SECTIONS.forEach(s => { const el = document.getElementById(s.id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.key==="?"||e.key==="/") { e.preventDefault(); setShortcutsOpen(o=>!o); }
      if (e.key==="Escape") setShortcutsOpen(false);
      if (e.key==="s"||e.key==="S") { voiceStop(); setSpeaking(null); }
      if (e.key==="ArrowDown") { e.preventDefault(); const idx=NAV_SECTIONS.findIndex(s=>s.id===active); document.getElementById(NAV_SECTIONS[Math.min(idx+1,NAV_SECTIONS.length-1)].id)?.scrollIntoView({behavior:"smooth"}); }
      if (e.key==="ArrowUp") { e.preventDefault(); const idx=NAV_SECTIONS.findIndex(s=>s.id===active); document.getElementById(NAV_SECTIONS[Math.max(idx-1,0)].id)?.scrollIntoView({behavior:"smooth"}); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  const handleVoice = useCallback((id, text) => {
    if (speaking===id) { voiceStop(); setSpeaking(null); currentNarr.current=null; }
    else { currentNarr.current={id,text}; setSpeaking(id); voiceSpeak(text, () => { setSpeaking(null); currentNarr.current=null; }, currentRate); }
  }, [speaking]);

  const handleRestart = useCallback(() => {
    if (currentNarr.current) { const{id,text}=currentNarr.current; voiceStop(); setTimeout(() => voiceSpeak(text,()=>{setSpeaking(null);currentNarr.current=null;},currentRate),80); }
  }, []);

  const handleStop = useCallback(() => { voiceStop(); setSpeaking(null); currentNarr.current=null; }, []);
  const speakingLabel = speaking ? (NAV_SECTIONS.find(s=>s.id===speaking)?.label ?? (speaking==="__hero__"?"Introduction":speaking)) : null;

  const SECTS = [
    { id:"intro", icon:"🕸️", title:"What is a Graph?", color:"#38bdf8", voice:NARR.intro,
      visual:<VisIntro/>,
      cards:[
        {lbl:"DEFINITION",      body:"A graph G = (V, E) consists of vertices (nodes) and edges (connections). Unlike trees, there is no root, no hierarchy — any node can connect to any other."},
        {lbl:"EVERYWHERE",      body:"Social networks, Google Maps, the internet, airline routes, circuit boards, dependency trees — all graphs. The most general and powerful structure in CS."},
        {lbl:"TYPES",           body:"Directed (one-way), Undirected (bidirectional), Weighted (costs on edges), Unweighted. A graph can be any combination of these properties."},
        {lbl:"SPARSE vs DENSE", body:"Sparse: few edges relative to V². Dense: many edges, approaching V². This distinction drives every decision about representation and algorithm choice."},
      ]},
    { id:"terminology", icon:"📐", title:"Graph Terminology", color:"#818cf8", voice:NARR.terminology,
      visual:<VisTerminology/>,
      cards:[
        {lbl:"VERTEX & EDGE",   body:"Vertex (node): a point. Edge: connection between two vertices. In a directed graph, edges have a source and destination. Hover labels to highlight."},
        {lbl:"DEGREE",          body:"Degree = number of edges connected to a vertex. In directed graphs: in-degree (incoming) and out-degree (outgoing) are tracked separately."},
        {lbl:"PATH & CYCLE",    body:"Path: a sequence of vertices connected by edges, no repeated vertices. Cycle: a path that starts and ends at the same vertex. Cyclic vs acyclic is crucial."},
        {lbl:"CONNECTED",       body:"An undirected graph is connected if every vertex is reachable from every other. A directed graph is strongly connected if this holds for all directed paths."},
      ]},
    { id:"representation", icon:"🗄️", title:"Graph Representation", color:"#34d399", voice:NARR.representation,
      visual:<VisRepresentation/>,
      cards:[
        {lbl:"ADJACENCY LIST",  body:"Each vertex stores a list of its neighbors. Space: O(V+E). Edge check: O(degree). Best for sparse graphs — most real-world graphs."},
        {lbl:"ADJACENCY MATRIX",body:"V×V boolean grid. matrix[u][v]=1 if edge exists. Edge check: O(1). Space: O(V²). Best for dense graphs and Floyd-Warshall."},
        {lbl:"EDGE LIST",       body:"Just a list of all edges [(u,v,w)...]. Simple storage. Used in Kruskal's algorithm where we need edges sorted by weight."},
        {lbl:"CHOOSING WISELY", body:"|E| << |V|²? Use adjacency list. |E| ≈ |V|²? Consider matrix. Need O(1) edge queries on dense graph? Matrix wins. Default to list."},
      ]},
    { id:"bfs", icon:"🌊", title:"Breadth-First Search", color:"#60a5fa", voice:NARR.bfs,
      visual:<VisBFS/>,
      cards:[
        {lbl:"ALGORITHM",       body:"Enqueue source, mark visited. Dequeue, visit all unvisited neighbors, enqueue them. Repeat. Explores level by level — all distance-1 nodes before distance-2."},
        {lbl:"COMPLEXITY",      body:"Time: O(V+E). Space: O(V) for the queue. Visits every vertex once and every edge once. Cannot be improved for unweighted graphs."},
        {lbl:"SHORTEST PATH",   body:"BFS on an unweighted graph finds the shortest path (minimum edges) from source to every reachable vertex. This is provably optimal."},
        {lbl:"APPLICATIONS",    body:"Social network friend suggestions, GPS navigation (unweighted), web crawlers, peer-to-peer networks, solving puzzles like shortest maze path."},
      ]},
    { id:"dfs", icon:"🌀", title:"Depth-First Search", color:"#a78bfa", voice:NARR.dfs,
      visual:<VisDFS/>,
      cards:[
        {lbl:"ALGORITHM",       body:"Mark current visited. Recursively visit each unvisited neighbor. Backtrack when no unvisited neighbors remain. Goes deep before going wide."},
        {lbl:"COMPLEXITY",      body:"Time: O(V+E). Space: O(V) on the call stack (or explicit stack). Identical time to BFS but fundamentally different traversal order."},
        {lbl:"CYCLE DETECTION", body:"If DFS encounters an already-visited node not its direct parent, a cycle exists. Essential for topological sort validity checking."},
        {lbl:"APPLICATIONS",    body:"Topological sorting, finding strongly connected components (Tarjan's, Kosaraju's), solving mazes, generating spanning trees, scheduling problems."},
      ]},
    { id:"dijkstra", icon:"🗺️", title:"Dijkstra's Algorithm", color:"#fbbf24", voice:NARR.dijkstra,
      visual:<VisDijkstra/>,
      cards:[
        {lbl:"ALGORITHM",       body:"Initialize source=0, others=∞. Use min-heap. Extract minimum, relax neighbors (update if shorter path found). Mark extracted nodes as done."},
        {lbl:"COMPLEXITY",      body:"O(E log V) with binary heap. O((V+E) log V) overall. The log V factor comes from heap operations. With Fibonacci heap: O(E + V log V)."},
        {lbl:"GREEDY PROOF",    body:"When a node is extracted from the heap, its distance is final. Proof: any other path would go through an unextracted node with distance ≥ current."},
        {lbl:"LIMITATION",      body:"Fails with negative edge weights — the greedy assumption breaks. Use Bellman-Ford for graphs with negative weights."},
      ]},
    { id:"bellman", icon:"⚖️", title:"Bellman-Ford Algorithm", color:"#fb7185", voice:NARR.bellman,
      visual:<VisBellmanFord/>,
      cards:[
        {lbl:"ALGORITHM",       body:"Relax ALL edges V-1 times. After iteration k, all shortest paths using ≤ k edges are found. V-1 iterations suffices for any acyclic shortest path."},
        {lbl:"COMPLEXITY",      body:"O(V·E) time, O(V) space. Slower than Dijkstra (O(E log V)) but handles negative weights and detects negative cycles."},
        {lbl:"NEGATIVE CYCLES", body:"Run one more (Vth) relaxation round. If any distance still decreases, a negative-weight cycle exists — shortest path is undefined (−∞)."},
        {lbl:"APPLICATIONS",    body:"Financial arbitrage detection (negative cycles = profit loops), network routing with variable costs, currency exchange rate analysis."},
      ]},
    { id:"topo", icon:"📋", title:"Topological Sort", color:"#4ade80", voice:NARR.topo,
      visual:<VisTopoSort/>,
      cards:[
        {lbl:"DEFINITION",      body:"For a DAG, produce a linear ordering of vertices such that for every edge u→v, u appears before v. Only possible on Directed Acyclic Graphs."},
        {lbl:"KAHN'S ALGORITHM",body:"Track in-degrees. Enqueue all zero-in-degree vertices. Process each: reduce neighbors' in-degrees, enqueue newly zero-in-degree ones. O(V+E)."},
        {lbl:"DFS APPROACH",    body:"Run DFS. When a vertex finishes (all descendants explored), push it to a stack. Reverse of stack pop order = topological order."},
        {lbl:"APPLICATIONS",    body:"Build systems (Make, Gradle), package managers (npm install order), spreadsheet formula evaluation, course prerequisite scheduling, compiler phase ordering."},
      ]},
    { id:"mst", icon:"🌲", title:"Minimum Spanning Tree", color:"#f97316", voice:NARR.mst,
      visual:<VisMST/>,
      cards:[
        {lbl:"DEFINITION",      body:"A spanning tree connecting all V vertices with exactly V-1 edges and no cycles. Minimum = lowest possible total edge weight."},
        {lbl:"KRUSKAL'S",       body:"Sort edges by weight. For each edge, add it if it doesn't create a cycle (Union-Find for O(α(n)) cycle detection). O(E log E). Greedy on edges."},
        {lbl:"PRIM'S",          body:"Grow MST from any start vertex. Always add the minimum-weight edge connecting the current tree to a new vertex. O(E log V) with heap."},
        {lbl:"APPLICATIONS",    body:"Telecommunications network design, water pipe planning, cluster analysis in machine learning, image segmentation, circuit layout optimization."},
      ]},
  ];

  return (
    <div style={{ background:"#060810",color:"#f8fafc",minHeight:"100vh",overflowX:"hidden" }}>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        ::selection{background:rgba(56,189,248,0.42)}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(56,189,248,0.38);border-radius:8px}
        ::-webkit-scrollbar-thumb:hover{background:rgba(56,189,248,0.58)}

        @keyframes hOrb1{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(22px,-16px) scale(1.06)}66%{transform:translate(-12px,9px) scale(0.96)}}
        @keyframes hOrb2{0%,100%{transform:translate(0,0)}42%{transform:translate(-20px,14px)}84%{transform:translate(14px,-9px)}}
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
          .viz-grid{grid-template-columns:1fr !important}
        }
        @media(max-width:480px){.sg{gap:12px !important}}
      `}</style>

      <ProgressBar/>
      <StickyNav active={active} speaking={speaking} speed={speed} setSpeed={setSpeed} onRestart={handleRestart}/>
      <BackToTop/>
      <ShortcutsModal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)}/>
      <MiniPlayer speaking={speaking} speakingLabel={speakingLabel} onStop={handleStop} speed={speed}/>

      <Hero onStart={() => document.getElementById("intro")?.scrollIntoView({behavior:"smooth"})} onVoice={() => handleVoice("__hero__", NARR.intro)}/>

      <div style={{ textAlign:"center",marginBottom:32,fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#1e2a38",letterSpacing:"0.1em" }}>
        PRESS <kbd style={{ background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:5,padding:"1px 7px",color:"#2d3748" }}>?</kbd> FOR KEYBOARD SHORTCUTS
      </div>

      <main style={{ maxWidth:1000,margin:"0 auto",padding:"0 20px 100px" }}>

        {SECTS.map(s => (
          <Sect key={s.id} id={s.id} icon={s.icon} title={s.title} color={s.color} visual={s.visual} cards={s.cards} voice={s.voice} speaking={speaking} onVoice={handleVoice} seen={seenSections.has(s.id)}/>
        ))}

        {/* ── Complexity Cheat Sheet ── */}
        <section id="complexity" style={{ marginBottom:80 }}>
          <div style={{ display:"flex",alignItems:"center",gap:14,marginBottom:22,flexWrap:"wrap" }}>
            <div style={{ width:50,height:50,borderRadius:16,flexShrink:0,background:"rgba(56,189,248,0.12)",border:"1px solid rgba(56,189,248,0.32)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,boxShadow:"0 0 28px rgba(56,189,248,0.15)" }}>⚡</div>
            <div>
              <h2 style={{ fontFamily:"'Syne',sans-serif",fontSize:"clamp(19px,3.8vw,30px)",fontWeight:800,color:"#f8fafc" }}>Algorithm Complexity Reference</h2>
              <p style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#2d3748",marginTop:3,letterSpacing:"0.08em" }}>GREEN = FAST · YELLOW = MODERATE · RED = SLOW · HOVER TO HIGHLIGHT</p>
            </div>
          </div>
          <div style={{ borderRadius:22,overflow:"hidden",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)" }}>
            <ComplexityTable/>
          </div>
        </section>

        {/* ── Interactive Visualizer ── */}
        <GraphVisualizer/>

        {/* ── Quiz ── */}
        <section id="quiz" style={{ marginBottom:80 }}>
          <div style={{ display:"flex",alignItems:"center",gap:14,marginBottom:8,flexWrap:"wrap" }}>
            <div style={{ width:50,height:50,borderRadius:16,flexShrink:0,background:"rgba(236,72,153,0.12)",border:"1px solid rgba(236,72,153,0.32)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,boxShadow:"0 0 28px rgba(236,72,153,0.15)" }}>🧠</div>
            <div style={{ flex:1,minWidth:0 }}>
              <h2 style={{ fontFamily:"'Syne',sans-serif",fontSize:"clamp(19px,3.8vw,30px)",fontWeight:800,color:"#f8fafc" }}>Test Your Knowledge</h2>
              <p style={{ fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#475569",marginTop:3 }}>6 questions · covers every section · some are tricky</p>
            </div>
            <button onClick={()=>handleVoice("quiz",NARR.quiz)} style={{ display:"flex",alignItems:"center",gap:7,padding:"7px 14px",borderRadius:28,cursor:"pointer",flexShrink:0,background:speaking==="quiz"?"rgba(236,72,153,0.2)":"rgba(255,255,255,0.04)",border:`1.5px solid ${speaking==="quiz"?"#ec4899":"rgba(255,255,255,0.1)"}`,fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:700,color:speaking==="quiz"?"#ec4899":"#475569",transition:"all 0.22s" }}>
              {speaking==="quiz"?<SpeakingWave color="#ec4899" size={12}/>:<span style={{fontSize:12}}>🔊</span>}
              {speaking==="quiz"?"STOP":"LISTEN"}
            </button>
          </div>
          <div style={{ marginBottom:22 }}/>
          <Quiz onDone={(sc,tot) => { setQScore(sc); setQTotal(tot); }}/>
          {qScore !== null && (
            <div style={{ marginTop:30,padding:"36px 24px",borderRadius:24,textAlign:"center",background:`linear-gradient(138deg,${qScore>=5?"rgba(74,222,128,0.1)":qScore>=3?"rgba(251,191,36,0.1)":"rgba(239,68,68,0.1)"} 0%,rgba(0,0,0,0) 100%)`,border:`1px solid ${qScore>=5?"rgba(74,222,128,0.32)":qScore>=3?"rgba(251,191,36,0.32)":"rgba(239,68,68,0.32)"}`,animation:"fUp 0.5s ease" }}>
              <div style={{ fontSize:52,marginBottom:12 }}>{qScore>=5?"🏆":qScore>=3?"🌟":"💪"}</div>
              <div style={{ fontFamily:"'Syne',sans-serif",fontSize:40,fontWeight:800,color:qScore>=5?"#4ade80":qScore>=3?"#fbbf24":"#f87171" }}>{qScore} / {qTotal}</div>
              <p style={{ fontFamily:"'DM Sans',sans-serif",fontSize:15,color:"#94a3b8",margin:"10px 0 24px",lineHeight:1.55 }}>
                {qScore>=5?"Outstanding! You have genuinely mastered graph algorithms.":qScore>=3?"Solid work. Review the sections you missed, then retry.":"Keep going — re-read the sections above and come back stronger."}
              </p>
              <button onClick={() => router.push("/tree")} style={{ padding:"14px 34px",borderRadius:16,cursor:"pointer",background:"linear-gradient(135deg,#0ea5e9 0%,#818cf8 100%)",border:"none",fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:700,color:"#fff",boxShadow:"0 8px 32px rgba(14,165,233,0.42)",transition:"all 0.25s",display:"inline-flex",alignItems:"center",gap:11 }}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";}} onMouseLeave={e=>{e.currentTarget.style.transform="none";}}>
                <span>Review: Tree Data Structure</span><span style={{ fontSize:20 }}>→</span>
              </button>
            </div>
          )}
        </section>

        {/* ── Footer ── */}
        <div style={{ textAlign:"center",padding:"48px 24px",borderRadius:26,background:"linear-gradient(140deg,rgba(56,189,248,0.09) 0%,rgba(129,140,248,0.07) 50%,rgba(74,222,128,0.06) 100%)",border:"1px solid rgba(56,189,248,0.18)",position:"relative",overflow:"hidden" }}>
          <div style={{ position:"absolute",inset:0,backgroundImage:"radial-gradient(circle,rgba(56,189,248,0.04) 1px,transparent 1px)",backgroundSize:"30px 30px",pointerEvents:"none" }}/>
          <div style={{ fontSize:48,marginBottom:14 }}>🕸️</div>
          <h3 style={{ fontFamily:"'Syne',sans-serif",fontSize:"clamp(17px,3.2vw,26px)",fontWeight:800,color:"#f8fafc",marginBottom:12 }}>You've completed the Graph guide!</h3>
          <p style={{ fontFamily:"'DM Sans',sans-serif",fontSize:14,color:"#64748b",maxWidth:440,margin:"0 auto 28px",lineHeight:1.72 }}>
            Now implement them. Code BFS and DFS first, then Dijkstra. Writing the code makes the algorithms yours permanently.
          </p>
          <div style={{ display:"flex",gap:6,justifyContent:"center",flexWrap:"wrap",marginBottom:24 }}>
            {NAV_SECTIONS.map(s => (
              <div key={s.id} style={{ padding:"4px 12px",borderRadius:20,background:seenSections.has(s.id)?`${s.col}18`:"rgba(255,255,255,0.03)",border:`1px solid ${seenSections.has(s.id)?`${s.col}38`:"rgba(255,255,255,0.06)"}`,fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:700,color:seenSections.has(s.id)?s.col:"#1a2030",transition:"all 0.3s" }}>
                {s.icon} {s.label} {seenSections.has(s.id)?"✓":""}
              </div>
            ))}
          </div>
          <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#2d3748",marginBottom:22 }}>{seenSections.size} / {NAV_SECTIONS.length} sections visited</div>
          <div style={{ display:"flex",gap:9,justifyContent:"center",flexWrap:"wrap",marginBottom:20 }}>
            {["💻 Code BFS","💻 Code Dijkstra","💻 Code Kruskal's","💻 Code Topological Sort"].map(t => (
              <button key={t} style={{ padding:"8px 16px",borderRadius:22,cursor:"pointer",background:"rgba(56,189,248,0.1)",border:"1px solid rgba(56,189,248,0.24)",fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#38bdf8",letterSpacing:"0.04em",transition:"all 0.22s" }}
                onMouseEnter={e=>{e.currentTarget.style.background="rgba(56,189,248,0.2)";}} onMouseLeave={e=>{e.currentTarget.style.background="rgba(56,189,248,0.1)";}}>
                {t}
              </button>
            ))}
          </div>
          <button onClick={() => setShortcutsOpen(true)} style={{ background:"none",border:"1px solid rgba(255,255,255,0.08)",borderRadius:20,cursor:"pointer",padding:"6px 16px",fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#2d3748",transition:"all 0.2s" }}>⌨️ VIEW KEYBOARD SHORTCUTS</button>
        </div>

      </main>
    </div>
  );
}