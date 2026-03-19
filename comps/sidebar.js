"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";

// ─────────────────────────────────────────────────────────────────────────────
// SIDEBAR DATA  (mirrors landing page TREE + ROUTES exactly)
// ─────────────────────────────────────────────────────────────────────────────
const ROUTES = {
  "array":        "/array",
  "linked-list":  "/linked-list",
  "stack":        "/stack",
  "queue":        "/queue",
  "deque":        "/deque",
  "binary-tree":  "/binary-tree",
  "bst":          "/bs-tree",
  "avl":          "/avl-tree",
  "heap":         "/heap",
  "trie":         "/trie",
  "graph":        "/graph",
  "adj-list":     "/adj-list",
  "adj-matrix":   "/adj-matrix",
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

const NAV = [
  {
    id: "ds", label: "Data Structures", icon: "⬡",
    accent: "#818cf8", glow: "rgba(129,140,248,0.5)",
    groups: [
      { label: "Linear",      icon: "▤", color: "#818cf8",
        items: [
          { id:"array",       label:"Array",       icon:"[ ]", complexity:"O(1)",     tag:"Basic" },
          { id:"linked-list", label:"Linked List", icon:"→",   complexity:"O(n)",     tag:"Basic" },
          { id:"stack",       label:"Stack",       icon:"⬆",   complexity:"O(1)",     tag:"Basic" },
          { id:"queue",       label:"Queue",       icon:"⇥",   complexity:"O(1)",     tag:"Basic" },
          { id:"deque",       label:"Deque",       icon:"⇔",   complexity:"O(1)",     tag:"Basic" },
        ]},
      { label: "Trees",       icon: "⑂", color: "#a78bfa",
        items: [
          { id:"binary-tree", label:"Binary Tree", icon:"⑂",  complexity:"O(log n)", tag:"Mid"   },
          { id:"bst",         label:"BST",         icon:"⑂",  complexity:"O(log n)", tag:"Mid"   },
          { id:"avl",         label:"AVL Tree",    icon:"⑂",  complexity:"O(log n)", tag:"Hard"  },
          { id:"heap",        label:"Heap",        icon:"△",   complexity:"O(log n)", tag:"Mid"   },
          { id:"trie",        label:"Trie",        icon:"⑂",  complexity:"O(m)",     tag:"Hard"  },
        ]},
      { label: "Graphs",      icon: "◎", color: "#c084fc",
        items: [
          { id:"graph",       label:"Graph",       icon:"◎",  complexity:"O(V+E)",   tag:"Hard"  },
          { id:"adj-list",    label:"Adj. List",   icon:"≡",   complexity:"O(V+E)",   tag:"Mid"   },
          { id:"adj-matrix",  label:"Adj. Matrix", icon:"⊞",   complexity:"O(V²)",    tag:"Mid"   },
        ]},
      { label: "Hashing",     icon: "#", color: "#e879f9",
        items: [
          { id:"hash-map",    label:"Hash Map",    icon:"{}",  complexity:"O(1)",     tag:"Mid"   },
          { id:"hash-set",    label:"Hash Set",    icon:"∅",   complexity:"O(1)",     tag:"Mid"   },
        ]},
    ],
  },
  {
    id: "algo", label: "Algorithms", icon: "⚙",
    accent: "#22d3ee", glow: "rgba(34,211,238,0.5)",
    groups: [
      { label: "Sorting",     icon: "↕", color: "#22d3ee",
        items: [
          { id:"bubble",      label:"Bubble Sort",    icon:"○",  complexity:"O(n²)",      tag:"Basic" },
          { id:"insertion",   label:"Insertion Sort", icon:"↩",  complexity:"O(n²)",      tag:"Basic" },
          { id:"merge",       label:"Merge Sort",     icon:"⊕",  complexity:"O(n log n)", tag:"Mid"   },
          { id:"quick",       label:"Quick Sort",     icon:"⚡", complexity:"O(n log n)", tag:"Mid"   },
          { id:"heap-sort",   label:"Heap Sort",      icon:"△",  complexity:"O(n log n)", tag:"Mid"   },
          { id:"radix",       label:"Radix Sort",     icon:"⌗",  complexity:"O(nk)",      tag:"Hard"  },
        ]},
      { label: "Searching",   icon: "◉", color: "#2dd4bf",
        items: [
          { id:"linear-s",    label:"Linear Search",  icon:"→",   complexity:"O(n)",     tag:"Basic" },
          { id:"binary-s",    label:"Binary Search",  icon:"⟨⟩", complexity:"O(log n)", tag:"Basic" },
        ]},
      { label: "Graph Algos", icon: "⬡", color: "#34d399",
        items: [
          { id:"bfs",         label:"BFS",          icon:"⊙",  complexity:"O(V+E)",    tag:"Mid"  },
          { id:"dfs",         label:"DFS",          icon:"⬇",  complexity:"O(V+E)",    tag:"Mid"  },
          { id:"dijkstra",    label:"Dijkstra",     icon:"⬡",  complexity:"O(E log V)", tag:"Hard" },
          { id:"bellman",     label:"Bellman-Ford", icon:"⊕",  complexity:"O(VE)",     tag:"Hard" },
          { id:"kruskal",     label:"Kruskal",      icon:"⑂",  complexity:"O(E log E)", tag:"Hard" },
          { id:"prim",        label:"Prim's",       icon:"◈",  complexity:"O(E log V)", tag:"Hard" },
        ]},
      { label: "Dynamic Prog.", icon: "⊞", color: "#86efac",
        items: [
          { id:"fibonacci",   label:"Fibonacci", icon:"∞",  complexity:"O(n)",  tag:"Mid"  },
          { id:"knapsack",    label:"Knapsack",  icon:"⊡",  complexity:"O(nW)", tag:"Hard" },
          { id:"lcs",         label:"LCS",       icon:"≈",   complexity:"O(mn)", tag:"Hard" },
          { id:"lis",         label:"LIS",       icon:"↑",   complexity:"O(n²)", tag:"Hard" },
        ]},
    ],
  },
];

const TAG_STYLE = {
  Basic: { bg:"rgba(99,102,241,0.12)",  text:"#a5b4fc" },
  Mid:   { bg:"rgba(6,182,212,0.12)",   text:"#67e8f9" },
  Hard:  { bg:"rgba(239,68,68,0.12)",   text:"#fca5a5" },
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

// find which section id contains the current pathname
function getSectionForPath(pathname) {
  for (const section of NAV) {
    for (const group of section.groups) {
      for (const item of group.items) {
        if (ROUTES[item.id] === pathname) return section.id;
      }
    }
  }
  return "ds";
}

// find the active item id for a pathname
function getActiveItem(pathname) {
  for (const section of NAV) {
    for (const group of section.groups) {
      for (const item of group.items) {
        if (ROUTES[item.id] === pathname) return item.id;
      }
    }
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// SIDEBAR COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function Sidebar() {
  const router   = useRouter();
  const pathname = usePathname();

  const activeItem    = getActiveItem(pathname);
  const activeSection = getSectionForPath(pathname);

  const [collapsed,       setCollapsed]       = useState(false);
  const [activeTab,       setActiveTab]       = useState(activeSection);
  const [openGroups,      setOpenGroups]      = useState(() => {
    // open all groups of the active section by default
    const init = {};
    NAV.forEach(sec => {
      sec.groups.forEach((g, i) => {
        init[`${sec.id}-${i}`] = sec.id === activeSection;
      });
    });
    return init;
  });
  const [hovItem,  setHovItem]  = useState(null);
  const [hovTab,   setHovTab]   = useState(null);
  const [search,   setSearch]   = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const section = NAV.find(s => s.id === activeTab) ?? NAV[0];

  // auto-expand the group that contains the active item when route changes
  useEffect(() => {
    const sec = getSectionForPath(pathname);
    setActiveTab(sec);
    const secData = NAV.find(s => s.id === sec);
    if (!secData) return;
    secData.groups.forEach((g, i) => {
      const hasActive = g.items.some(it => ROUTES[it.id] === pathname);
      if (hasActive) setOpenGroups(p => ({...p, [`${sec}-${i}`]: true}));
    });
  }, [pathname]);

  const toggleGroup = useCallback((key) => {
    setOpenGroups(p => ({...p, [key]: !p[key]}));
  }, []);

  const navigate = useCallback((itemId) => {
    const route = ROUTES[itemId];
    if (route) router.push(route);
    setMobileOpen(false);
  }, [router]);

  // filter items by search
  const filteredSection = {
    ...section,
    groups: section.groups
      .map(g => ({
        ...g,
        items: g.items.filter(it =>
          !search || it.label.toLowerCase().includes(search.toLowerCase())
        ),
      }))
      .filter(g => g.items.length > 0),
  };

  const W_OPEN      = "248px";
  const W_COLLAPSED = "56px";
  const width       = collapsed ? W_COLLAPSED : W_OPEN;

  // ── Colours shared with landing ──────────────────────────────────────────
  const BG       = "#04040f";
  const SURFACE  = "rgba(4,4,20,0.85)";
  const BORDER   = "rgba(255,255,255,0.07)";
  const BORDER_HI= "rgba(255,255,255,0.12)";
  const TEXT_PRI = "#f1f5f9";
  const TEXT_SEC = "#94a3b8";
  const TEXT_DIM = "#475569";
  const MONO     = "'Space Mono', monospace";
  const SANS     = "'DM Sans', sans-serif";

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@400;500;700;900&display=swap');

        /* ── Scrollbar ── */
        .vs-scroll::-webkit-scrollbar        { width:3px; }
        .vs-scroll::-webkit-scrollbar-track  { background:transparent; }
        .vs-scroll::-webkit-scrollbar-thumb  { background:rgba(99,102,241,0.35); border-radius:2px; }
        .vs-scroll::-webkit-scrollbar-thumb:hover { background:rgba(99,102,241,0.6); }

        /* ── Transitions ── */
        .vs-sidebar { transition:width .26s cubic-bezier(.16,1,.3,1); }
        .vs-fade    { transition:opacity .18s, transform .18s; }

        /* ── Shimmer for logo ── */
        @keyframes vs-shimmer {
          0%   { background-position:-200% 0; }
          100% { background-position: 200% 0; }
        }
        .vs-logo-text {
          background: linear-gradient(90deg,#6366f1 0%,#a5b4fc 30%,#c7d2fe 50%,#a5b4fc 70%,#6366f1 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: vs-shimmer 5s linear infinite;
        }

        /* ── Glow pulse on active item ── */
        @keyframes vs-active-glow {
          0%,100% { box-shadow: inset 0 0 0 0 transparent; }
          50%     { box-shadow: inset 0 0 12px rgba(99,102,241,0.08); }
        }
        .vs-item-active { animation: vs-active-glow 3s ease-in-out infinite; }

        /* ── Scan line on sidebar bg ── */
        @keyframes vs-scan {
          0%   { top:-30%; }
          100% { top:130%; }
        }
        .vs-scan {
          position:absolute; left:0; right:0; height:40%; pointer-events:none; z-index:0;
          background:linear-gradient(to bottom,transparent,rgba(99,102,241,0.03),transparent);
          animation:vs-scan 12s ease-in-out infinite;
        }

        /* ── Tooltip ── */
        .vs-tooltip {
          position:absolute; left:calc(100% + 10px); top:50%; transform:translateY(-50%);
          background:rgba(4,4,20,0.95); border:1px solid rgba(255,255,255,0.1);
          color:#f1f5f9; font-family:'DM Sans',sans-serif; font-size:12px; font-weight:600;
          padding:5px 10px; border-radius:8px; white-space:nowrap; pointer-events:none;
          backdrop-filter:blur(12px);
          box-shadow:0 8px 24px rgba(0,0,0,0.4);
          z-index:999;
          opacity:0; transition:opacity .15s;
        }
        .vs-has-tooltip:hover .vs-tooltip { opacity:1; }

        /* ── Mobile overlay ── */
        .vs-overlay {
          position:fixed; inset:0; background:rgba(0,0,0,0.6);
          backdrop-filter:blur(4px); z-index:299;
          opacity:0; pointer-events:none;
          transition:opacity .25s;
        }
        .vs-overlay.open { opacity:1; pointer-events:all; }

        /* ── Mobile toggle btn (shown <768px) ── */
        .vs-mobile-btn {
          display:none;
          position:fixed; bottom:22px; left:16px; z-index:400;
        }
        @media(max-width:768px) {
          .vs-mobile-btn { display:flex; }
          .vs-sidebar-wrap { transform:translateX(-100%); }
          .vs-sidebar-wrap.mobile-open { transform:translateX(0); }
          .vs-sidebar-wrap { transition:transform .26s cubic-bezier(.16,1,.3,1),width .26s cubic-bezier(.16,1,.3,1) !important; }
        }
        .vs-sidebar-wrap {
          transition:width .26s cubic-bezier(.16,1,.3,1);
        }
      `}</style>

      {/* Mobile overlay */}
      <div
        className={`vs-overlay${mobileOpen?" open":""}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Mobile toggle button */}
      <button
        className="vs-mobile-btn"
        onClick={() => setMobileOpen(p => !p)}
        style={{
          width:"44px", height:"44px", borderRadius:"12px",
          background:"rgba(4,4,20,0.9)",
          border:"1px solid rgba(255,255,255,0.1)",
          backdropFilter:"blur(16px)",
          color:"#a5b4fc", fontSize:"18px", cursor:"pointer",
          alignItems:"center", justifyContent:"center",
          boxShadow:"0 4px 20px rgba(99,102,241,0.3)",
        }}
      >
        {mobileOpen ? "✕" : "☰"}
      </button>

      {/* ── SIDEBAR SHELL ───────────────────────────────────────────── */}
      <aside
        className={`vs-sidebar vs-sidebar-wrap${mobileOpen ? " mobile-open" : ""}`}
        style={{
          width,
          height:"100vh",
          flexShrink:0,
          background:SURFACE,
          borderRight:`1px solid ${BORDER}`,
          backdropFilter:"blur(20px)",
          display:"flex",
          flexDirection:"column",
          overflow:"hidden",
          position:"relative",
          zIndex:300,
          boxShadow:"4px 0 40px rgba(0,0,0,0.4), inset -1px 0 0 rgba(255,255,255,0.04)",
          // mobile: fixed left
          ...(typeof window !== "undefined" && window.innerWidth <= 768 ? {
            position:"fixed", left:0, top:0,
          } : {}),
        }}
      >
        {/* Ambient glow — top */}
        <div style={{
          position:"absolute", top:"-60px", left:"50%", transform:"translateX(-50%)",
          width:"200px", height:"200px", borderRadius:"50%", pointerEvents:"none", zIndex:0,
          background:"radial-gradient(circle,rgba(99,102,241,0.12) 0%,transparent 70%)",
        }}/>
        {/* Dot grid background */}
        <div style={{
          position:"absolute", inset:0, pointerEvents:"none", zIndex:0,
          backgroundImage:"radial-gradient(circle,rgba(129,140,248,0.05) 1px,transparent 1px)",
          backgroundSize:"22px 22px",
        }}/>
        {/* Scan line */}
        <div className="vs-scan"/>

        {/* Everything on top of bg */}
        <div style={{position:"relative", zIndex:1, display:"flex", flexDirection:"column", height:"100%", overflow:"hidden"}}>

          {/* ── HEADER ─────────────────────────────────────────── */}
          <div style={{
            padding: collapsed ? "16px 0" : "16px 14px",
            borderBottom:`1px solid ${BORDER}`,
            display:"flex",
            alignItems:"center",
            justifyContent: collapsed ? "center" : "space-between",
            flexShrink:0,
            gap:"8px",
          }}>
            {!collapsed && (
              <a href="/" style={{textDecoration:"none", display:"flex", alignItems:"center", gap:"7px", minWidth:0}}>
                {/* Logo mark */}
                <span style={{
                  width:"26px", height:"26px", borderRadius:"8px", flexShrink:0,
                  background:"linear-gradient(135deg,#4f46e5,#7c3aed)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:"12px", boxShadow:"0 0 14px rgba(99,102,241,0.4)",
                }}>◈</span>
                <span style={{fontFamily:MONO, fontWeight:700, fontSize:"14px", letterSpacing:"0.02em", lineHeight:1}}>
                  <span className="vs-logo-text">VisuoSlayer</span>
                </span>
              </a>
            )}

            {collapsed && (
              <a href="/" style={{
                width:"28px", height:"28px", borderRadius:"8px",
                background:"linear-gradient(135deg,#4f46e5,#7c3aed)",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:"13px", boxShadow:"0 0 14px rgba(99,102,241,0.4)",
                textDecoration:"none",
              }}>◈</a>
            )}

            {/* Collapse toggle */}
            <button
              onClick={() => setCollapsed(p => !p)}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              style={{
                width:"26px", height:"26px", borderRadius:"7px", flexShrink:0,
                background:"rgba(255,255,255,0.04)",
                border:`1px solid ${BORDER}`,
                color:TEXT_DIM, cursor:"pointer",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:"11px",
                transition:"all .18s",
              }}
              onMouseEnter={e => { e.currentTarget.style.color = TEXT_SEC; e.currentTarget.style.borderColor = BORDER_HI; }}
              onMouseLeave={e => { e.currentTarget.style.color = TEXT_DIM; e.currentTarget.style.borderColor = BORDER; }}
            >
              {collapsed ? "→" : "←"}
            </button>
          </div>

          {/* ── SEARCH (only when expanded) ────────────────────── */}
          {!collapsed && (
            <div style={{padding:"10px 12px 0", flexShrink:0}}>
              <div style={{
                display:"flex", alignItems:"center", gap:"7px",
                background:"rgba(255,255,255,0.04)",
                border:`1px solid ${search ? "rgba(99,102,241,0.4)" : BORDER}`,
                borderRadius:"10px",
                padding:"7px 10px",
                transition:"border-color .18s",
              }}>
                <span style={{fontSize:"11px", color:TEXT_DIM, flexShrink:0}}>⌕</span>
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search topics…"
                  style={{
                    flex:1, background:"none", border:"none", outline:"none",
                    fontFamily:SANS, fontSize:"12px", color:TEXT_PRI,
                    "::placeholder":{color:TEXT_DIM},
                  }}
                />
                {search && (
                  <button onClick={() => setSearch("")}
                    style={{background:"none",border:"none",color:TEXT_DIM,cursor:"pointer",fontSize:"12px",padding:0,lineHeight:1}}>
                    ✕
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── TAB SWITCHER ───────────────────────────────────── */}
          {!collapsed && (
            <div style={{
              padding:"10px 12px 0",
              flexShrink:0,
              display:"flex",
              gap:"5px",
            }}>
              {NAV.map(sec => {
                const active = activeTab === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => {
                      setActiveTab(sec.id);
                      setSearch("");
                    }}
                    style={{
                      flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:"5px",
                      padding:"7px 6px", borderRadius:"10px",
                      background: active ? `${sec.accent}1c` : "rgba(255,255,255,0.03)",
                      border:`1px solid ${active ? sec.accent+"55" : "rgba(255,255,255,0.06)"}`,
                      color: active ? sec.accent : TEXT_DIM,
                      fontFamily:SANS, fontSize:"11px", fontWeight:700,
                      cursor:"pointer", letterSpacing:"0.03em",
                      transition:"all .2s cubic-bezier(.16,1,.3,1)",
                      boxShadow: active ? `0 2px 12px ${sec.glow}` : "none",
                    }}
                    onMouseEnter={e => { if(!active){ e.currentTarget.style.color = sec.accent; e.currentTarget.style.borderColor = sec.accent+"30"; }}}
                    onMouseLeave={e => { if(!active){ e.currentTarget.style.color = TEXT_DIM; e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}}
                  >
                    <span style={{fontSize:"12px"}}>{sec.icon}</span>
                    <span style={{fontSize:"10px"}}>{sec.id === "ds" ? "Structures" : "Algorithms"}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* ── NAV TREE ───────────────────────────────────────── */}
          <nav
            className="vs-scroll"
            style={{
              flex:1, overflowY:"auto", overflowX:"hidden",
              padding: collapsed ? "10px 6px" : "10px 8px",
              display:"flex", flexDirection:"column", gap:"1px",
            }}
          >
            {/* ── COLLAPSED: icon-rail ─────────────────────────── */}
            {collapsed && NAV.map(sec => (
              <div key={sec.id} style={{marginBottom:"6px"}}>
                {/* Section divider dot */}
                <div style={{
                  width:"100%", display:"flex", justifyContent:"center",
                  padding:"4px 0 6px",
                }}>
                  <span style={{
                    fontSize:"8px", color:sec.accent, opacity:.6,
                    letterSpacing:"0.1em",
                  }}>{sec.icon}</span>
                </div>

                {sec.groups.map(g =>
                  g.items.map(item => {
                    const route = ROUTES[item.id];
                    const isActive = pathname === route;
                    const available = !!route;
                    return (
                      <div
                        key={item.id}
                        className="vs-has-tooltip"
                        style={{position:"relative"}}
                      >
                        <button
                          onClick={() => available && navigate(item.id)}
                          title={item.label}
                          style={{
                            width:"100%", height:"36px", borderRadius:"10px",
                            display:"flex", alignItems:"center", justifyContent:"center",
                            background: isActive ? `${g.color}22` : "transparent",
                            border:`1px solid ${isActive ? g.color+"55" : "transparent"}`,
                            color: isActive ? g.color : available ? TEXT_DIM : TEXT_DIM,
                            fontSize:"12px", fontFamily:MONO,
                            cursor: available ? "pointer" : "default",
                            opacity: available ? 1 : 0.3,
                            transition:"all .15s",
                            flexShrink:0,
                          }}
                          onMouseEnter={e => { if(available && !isActive){ e.currentTarget.style.background=`${g.color}0e`; e.currentTarget.style.color=g.color; }}}
                          onMouseLeave={e => { if(!isActive){ e.currentTarget.style.background="transparent"; e.currentTarget.style.color=available?TEXT_DIM:TEXT_DIM; }}}
                        >
                          {item.icon}
                        </button>
                        {/* Tooltip */}
                        <div className="vs-tooltip">
                          <span style={{marginRight:"6px"}}>{item.label}</span>
                          <span style={{
                            fontSize:"9px", fontFamily:MONO,
                            color: TAG_STYLE[item.tag]?.text ?? "#a5b4fc",
                            background: TAG_STYLE[item.tag]?.bg ?? "rgba(99,102,241,0.12)",
                            padding:"1px 5px", borderRadius:"4px",
                          }}>{item.complexity}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            ))}

            {/* ── EXPANDED: full tree ──────────────────────────── */}
            {!collapsed && (
              <>
                {/* Section label */}
                <div style={{
                  padding:"2px 8px 8px",
                  display:"flex", alignItems:"center", justifyContent:"space-between",
                }}>
                  <span style={{
                    fontFamily:MONO, fontSize:"9px", fontWeight:700,
                    color:TEXT_DIM, letterSpacing:"0.14em", textTransform:"uppercase",
                  }}>
                    {section.label}
                  </span>
                  <span style={{
                    fontFamily:MONO, fontSize:"9px",
                    color:TEXT_DIM,
                  }}>
                    {section.groups.reduce((a,g)=>a+g.items.length,0)}
                  </span>
                </div>

                {filteredSection.groups.map((group, gi) => {
                  const groupKey = `${activeTab}-${section.groups.indexOf(section.groups.find(g=>g.label===group.label)) ?? gi}`;
                  const isGroupOpen = openGroups[groupKey] !== false;

                  return (
                    <div key={group.label} style={{marginBottom:"2px"}}>

                      {/* Group header */}
                      <button
                        onClick={() => toggleGroup(groupKey)}
                        style={{
                          width:"100%", display:"flex", alignItems:"center", gap:"8px",
                          padding:"7px 10px", borderRadius:"10px",
                          background: isGroupOpen ? `${group.color}0e` : "transparent",
                          border:`1px solid ${isGroupOpen ? group.color+"30" : "transparent"}`,
                          color: isGroupOpen ? group.color : TEXT_DIM,
                          fontFamily:SANS, fontSize:"11px", fontWeight:700,
                          cursor:"pointer", letterSpacing:"0.03em",
                          transition:"all .18s",
                          textAlign:"left",
                        }}
                        onMouseEnter={e => { if(!isGroupOpen){ e.currentTarget.style.background=`${group.color}08`; e.currentTarget.style.color=group.color; }}}
                        onMouseLeave={e => { if(!isGroupOpen){ e.currentTarget.style.background="transparent"; e.currentTarget.style.color=TEXT_DIM; }}}
                      >
                        {/* Colour dot */}
                        <span style={{
                          width:"6px", height:"6px", borderRadius:"50%", flexShrink:0,
                          background: isGroupOpen ? group.color : TEXT_DIM,
                          boxShadow: isGroupOpen ? `0 0 6px ${group.color}` : "none",
                          transition:"all .18s",
                        }}/>
                        <span style={{
                          fontFamily:MONO, fontSize:"9px",
                          color: isGroupOpen ? group.color : TEXT_DIM,
                          marginRight:"1px", flexShrink:0,
                        }}>{group.icon}</span>
                        <span style={{flex:1}}>{group.label}</span>
                        {/* Item count badge */}
                        <span style={{
                          fontSize:"9px", fontWeight:700,
                          padding:"1px 6px", borderRadius:"99px",
                          background: isGroupOpen ? `${group.color}20` : "rgba(255,255,255,0.05)",
                          color: isGroupOpen ? group.color : TEXT_DIM,
                          border:`1px solid ${isGroupOpen ? group.color+"30" : "rgba(255,255,255,0.06)"}`,
                          transition:"all .18s",
                        }}>{group.items.length}</span>
                        {/* Chevron */}
                        <span style={{
                          fontSize:"9px", color:TEXT_DIM, flexShrink:0,
                          transform: isGroupOpen ? "rotate(180deg)" : "rotate(0deg)",
                          transition:"transform .25s",
                          display:"inline-block",
                        }}>▼</span>
                      </button>

                      {/* Items */}
                      {isGroupOpen && (
                        <div style={{
                          paddingLeft:"12px",
                          marginTop:"2px",
                          display:"flex", flexDirection:"column", gap:"1px",
                          borderLeft:`1px solid ${group.color}20`,
                          marginLeft:"16px",
                        }}>
                          {group.items.map(item => {
                            const route = ROUTES[item.id];
                            const isActive  = pathname === route;
                            const available = !!route;
                            const isHov     = hovItem === item.id;
                            const tc        = TAG_STYLE[item.tag];

                            return (
                              <button
                                key={item.id}
                                onClick={() => available && navigate(item.id)}
                                onMouseEnter={() => setHovItem(item.id)}
                                onMouseLeave={() => setHovItem(null)}
                                className={isActive ? "vs-item-active" : ""}
                                style={{
                                  width:"100%", display:"flex", alignItems:"center", gap:"8px",
                                  padding:"7px 10px", borderRadius:"9px",
                                  background: isActive
                                    ? `${group.color}18`
                                    : isHov && available
                                      ? `${group.color}0c`
                                      : "transparent",
                                  border:`1px solid ${
                                    isActive
                                      ? group.color+"45"
                                      : isHov && available
                                        ? group.color+"22"
                                        : "transparent"
                                  }`,
                                  cursor: available ? "pointer" : "default",
                                  opacity: available ? 1 : 0.35,
                                  textAlign:"left",
                                  transition:"all .15s cubic-bezier(.16,1,.3,1)",
                                  position:"relative",
                                  overflow:"hidden",
                                }}
                              >
                                {/* Active left bar */}
                                {isActive && (
                                  <div style={{
                                    position:"absolute", left:0, top:"15%", bottom:"15%",
                                    width:"2px", borderRadius:"2px",
                                    background:group.color,
                                    boxShadow:`0 0 6px ${group.color}`,
                                  }}/>
                                )}

                                {/* Icon chip */}
                                <span style={{
                                  width:"20px", height:"20px", borderRadius:"6px", flexShrink:0,
                                  display:"flex", alignItems:"center", justifyContent:"center",
                                  fontSize:"9px", fontFamily:MONO,
                                  color: isActive || isHov ? group.color : TEXT_DIM,
                                  background: isActive ? `${group.color}22` : isHov ? `${group.color}14` : "rgba(255,255,255,0.04)",
                                  border:`1px solid ${isActive ? group.color+"40" : isHov ? group.color+"20" : "rgba(255,255,255,0.06)"}`,
                                  transition:"all .15s",
                                  ...(isActive ? {boxShadow:`0 0 8px ${group.color}30`} : {}),
                                }}>
                                  {item.icon}
                                </span>

                                {/* Label */}
                                <span style={{
                                  flex:1, fontFamily:SANS, fontSize:"12px",
                                  fontWeight: isActive ? 700 : 500,
                                  color: isActive ? "#f1f5f9" : isHov ? "#e2e8f0" : TEXT_SEC,
                                  transition:"color .15s",
                                  lineHeight:1.2,
                                }}>
                                  {item.label}
                                </span>

                                {/* Right side: complexity OR coming-soon */}
                                {available ? (
                                  <span style={{
                                    fontFamily:MONO, fontSize:"9px",
                                    color: isActive ? group.color : TEXT_DIM,
                                    opacity: isActive || isHov ? 1 : 0,
                                    transition:"opacity .15s",
                                    flexShrink:0,
                                  }}>
                                    {item.complexity}
                                  </span>
                                ) : (
                                  <span style={{
                                    fontFamily:MONO, fontSize:"8px", color:TEXT_DIM,
                                    letterSpacing:"0.06em",
                                  }}>soon</span>
                                )}

                                {/* Tag badge */}
                                {(isActive || isHov) && tc && (
                                  <span style={{
                                    fontSize:"8px", fontWeight:700, letterSpacing:"0.05em",
                                    padding:"1px 5px", borderRadius:"4px",
                                    background:tc.bg, color:tc.text, flexShrink:0,
                                  }}>
                                    {item.tag}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Empty state when search yields nothing */}
                {filteredSection.groups.length === 0 && (
                  <div style={{
                    padding:"28px 16px", textAlign:"center",
                    display:"flex", flexDirection:"column", alignItems:"center", gap:"8px",
                  }}>
                    <span style={{fontSize:"22px", opacity:.3}}>⌕</span>
                    <span style={{fontFamily:SANS, fontSize:"12px", color:TEXT_DIM}}>
                      No topics match &ldquo;{search}&rdquo;
                    </span>
                    <button onClick={() => setSearch("")}
                      style={{
                        fontFamily:SANS, fontSize:"11px", color:section.accent,
                        background:`${section.accent}14`, border:`1px solid ${section.accent}30`,
                        borderRadius:"7px", padding:"4px 10px", cursor:"pointer",
                        marginTop:"4px",
                      }}>Clear</button>
                  </div>
                )}
              </>
            )}
          </nav>

          {/* ── FOOTER ─────────────────────────────────────────── */}
          <div style={{
            borderTop:`1px solid ${BORDER}`,
            padding: collapsed ? "12px 6px" : "12px 14px",
            flexShrink:0,
            display:"flex",
            alignItems:"center",
            justifyContent: collapsed ? "center" : "space-between",
            gap:"8px",
          }}>
            {!collapsed && (
              <>
                <div>
                  <div style={{fontFamily:MONO, fontSize:"9px", color:TEXT_DIM, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:"2px"}}>
                    VisuoSlayer
                  </div>
                  <div style={{fontFamily:SANS, fontSize:"10px", color:TEXT_DIM}}>
                    DSA Visualizer
                  </div>
                </div>
                <a href="/"
                  style={{
                    display:"flex", alignItems:"center", gap:"4px",
                    fontFamily:SANS, fontSize:"11px", fontWeight:600,
                    color:TEXT_DIM, textDecoration:"none",
                    padding:"5px 10px", borderRadius:"8px",
                    background:"rgba(255,255,255,0.03)",
                    border:`1px solid ${BORDER}`,
                    transition:"all .18s",
                  }}
                  onMouseEnter={e=>{e.currentTarget.style.color="#a5b4fc";e.currentTarget.style.borderColor="rgba(99,102,241,0.3)";}}
                  onMouseLeave={e=>{e.currentTarget.style.color=TEXT_DIM;e.currentTarget.style.borderColor=BORDER;}}
                >
                  ⌂ Home
                </a>
              </>
            )}

            {collapsed && (
              <a href="/" title="Home" style={{
                width:"32px", height:"32px", borderRadius:"9px",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:"14px", color:TEXT_DIM, textDecoration:"none",
                background:"rgba(255,255,255,0.03)",
                border:`1px solid ${BORDER}`,
                transition:"all .18s",
              }}
              onMouseEnter={e=>{e.currentTarget.style.color="#a5b4fc";e.currentTarget.style.borderColor="rgba(99,102,241,0.3)";}}
              onMouseLeave={e=>{e.currentTarget.style.color=TEXT_DIM;e.currentTarget.style.borderColor=BORDER;}}
              >⌂</a>
            )}
          </div>

        </div>
      </aside>
    </>
  );
}