"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSidebar } from "./sbc";

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────
const ROUTES = {
  array:          "/array",
  "linked-list":  "/linked-list",
  stack:          "/stack",
  queue:          "/queue",
  deque:          "/deque",
  "binary-tree":  "/binary-tree",
  bst:            "/bs-tree",
  avl:            "/avl-tree",
  heap:           "/heap",
  trie:           "/trie",
  graph:          "/graph",
  "adj-list":     "/adj-list",
  "adj-matrix":   "/adj-matrix",
  "hash-map":     "/hash-map",
  "hash-set":     "/hash-set",
  bubble:         "/bubble-sort",
  insertion:      "/insertion-sort",
  merge:          "/merge-sort",
  quick:          "/quick-sort",
  "heap-sort":    "/heap-sort",
  radix:          "/radix-sort",
  "linear-s":     "/linear-search",
  "binary-s":     "/binary-search",
  bfs:            "/bfs",
  dfs:            "/dfs",
  dijkstra:       "/dijkstra",
  bellman:        "/bellman-ford",
  kruskal:        "/kruskal",
  prim:           "/prim",
  fibonacci:      "/fibonacci",
  knapsack:       "/knapsack",
  lcs:            "/lcs",
  lis:            "/lis",
};

const NAV = [
  {
    id: "ds", label: "Data Structures", icon: "⬡",
    accent: "#818cf8", glow: "rgba(129,140,248,0.5)",
    groups: [
      { label: "Linear", icon: "▤", color: "#818cf8",
        items: [
          { id: "array",       label: "Array",       icon: "[ ]", complexity: "O(1)",     tag: "Basic" },
          { id: "linked-list", label: "Linked List", icon: "→",   complexity: "O(n)",     tag: "Basic" },
          { id: "stack",       label: "Stack",       icon: "⬆",   complexity: "O(1)",     tag: "Basic" },
          { id: "queue",       label: "Queue",       icon: "⇥",   complexity: "O(1)",     tag: "Basic" },
          { id: "deque",       label: "Deque",       icon: "⇔",   complexity: "O(1)",     tag: "Basic" },
        ]},
      { label: "Trees", icon: "⑂", color: "#a78bfa",
        items: [
          { id: "binary-tree", label: "Binary Tree", icon: "⑂",  complexity: "O(log n)", tag: "Mid"   },
          { id: "bst",         label: "BST",         icon: "⑂",  complexity: "O(log n)", tag: "Mid"   },
          { id: "avl",         label: "AVL Tree",    icon: "⑂",  complexity: "O(log n)", tag: "Hard"  },
          { id: "heap",        label: "Heap",        icon: "△",   complexity: "O(log n)", tag: "Mid"   },
          { id: "trie",        label: "Trie",        icon: "⑂",  complexity: "O(m)",     tag: "Hard"  },
        ]},
      { label: "Graphs", icon: "◎", color: "#c084fc",
        items: [
          { id: "graph",      label: "Graph",      icon: "◎",  complexity: "O(V+E)",  tag: "Hard" },
          { id: "adj-list",   label: "Adj. List",  icon: "≡",   complexity: "O(V+E)",  tag: "Mid"  },
          { id: "adj-matrix", label: "Adj. Matrix",icon: "⊞",   complexity: "O(V²)",   tag: "Mid"  },
        ]},
      { label: "Hashing", icon: "#", color: "#e879f9",
        items: [
          { id: "hash-map", label: "Hash Map", icon: "{}", complexity: "O(1)", tag: "Mid" },
          { id: "hash-set", label: "Hash Set", icon: "∅",  complexity: "O(1)", tag: "Mid" },
        ]},
    ],
  },
  {
    id: "algo", label: "Algorithms", icon: "⚙",
    accent: "#22d3ee", glow: "rgba(34,211,238,0.5)",
    groups: [
      { label: "Sorting", icon: "↕", color: "#22d3ee",
        items: [
          { id: "bubble",    label: "Bubble Sort",    icon: "○",  complexity: "O(n²)",      tag: "Basic" },
          { id: "insertion", label: "Insertion Sort", icon: "↩",  complexity: "O(n²)",      tag: "Basic" },
          { id: "merge",     label: "Merge Sort",     icon: "⊕",  complexity: "O(n log n)", tag: "Mid"   },
          { id: "quick",     label: "Quick Sort",     icon: "⚡", complexity: "O(n log n)", tag: "Mid"   },
          { id: "heap-sort", label: "Heap Sort",      icon: "△",  complexity: "O(n log n)", tag: "Mid"   },
          { id: "radix",     label: "Radix Sort",     icon: "⌗",  complexity: "O(nk)",      tag: "Hard"  },
        ]},
      { label: "Searching", icon: "◉", color: "#2dd4bf",
        items: [
          { id: "linear-s", label: "Linear Search", icon: "→",   complexity: "O(n)",     tag: "Basic" },
          { id: "binary-s", label: "Binary Search", icon: "⟨⟩", complexity: "O(log n)", tag: "Basic" },
        ]},
      { label: "Graph Algos", icon: "⬡", color: "#34d399",
        items: [
          { id: "bfs",      label: "BFS",          icon: "⊙",  complexity: "O(V+E)",    tag: "Mid"  },
          { id: "dfs",      label: "DFS",          icon: "⬇",  complexity: "O(V+E)",    tag: "Mid"  },
          { id: "dijkstra", label: "Dijkstra",     icon: "⬡",  complexity: "O(E log V)", tag: "Hard" },
          { id: "bellman",  label: "Bellman-Ford", icon: "⊕",  complexity: "O(VE)",     tag: "Hard" },
          { id: "kruskal",  label: "Kruskal",      icon: "⑂",  complexity: "O(E log E)", tag: "Hard" },
          { id: "prim",     label: "Prim's",       icon: "◈",  complexity: "O(E log V)", tag: "Hard" },
        ]},
      { label: "Dynamic Prog.", icon: "⊞", color: "#86efac",
        items: [
          { id: "fibonacci", label: "Fibonacci", icon: "∞",  complexity: "O(n)",  tag: "Mid"  },
          { id: "knapsack",  label: "Knapsack",  icon: "⊡",  complexity: "O(nW)", tag: "Hard" },
          { id: "lcs",       label: "LCS",       icon: "≈",   complexity: "O(mn)", tag: "Hard" },
          { id: "lis",       label: "LIS",       icon: "↑",   complexity: "O(n²)", tag: "Hard" },
        ]},
    ],
  },
];

const TAG_STYLE = {
  Basic: { bg: "rgba(99,102,241,0.15)",  text: "#a5b4fc", border: "rgba(165,180,252,0.3)" },
  Mid:   { bg: "rgba(6,182,212,0.15)",   text: "#67e8f9", border: "rgba(103,232,249,0.3)" },
  Hard:  { bg: "rgba(239,68,68,0.15)",   text: "#fca5a5", border: "rgba(252,165,165,0.3)" },
};

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

// Build cross-section search results grouped by section
function globalSearch(query) {
  if (!query.trim()) return null;
  const q = query.toLowerCase();
  const results = [];
  for (const section of NAV) {
    const matchedGroups = [];
    for (const group of section.groups) {
      const items = group.items.filter(it => it.label.toLowerCase().includes(q));
      if (items.length) matchedGroups.push({ ...group, items });
    }
    if (matchedGroups.length) results.push({ ...section, groups: matchedGroups });
  }
  return results;
}

// ─────────────────────────────────────────────────────────────────────────────
// SIDEBAR COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function Sidebar() {
  const router   = useRouter();
  const pathname = usePathname();
  const { collapsed, toggleCollapse } = useSidebar();

  const activeSection = getSectionForPath(pathname);

  const [activeTab, setActiveTab] = useState(activeSection);
  const [openGroups, setOpenGroups] = useState(() => {
    const init = {};
    NAV.forEach(sec =>
      sec.groups.forEach((_, i) => { init[`${sec.id}-${i}`] = sec.id === activeSection; })
    );
    return init;
  });
  const [hovItem,       setHovItem]       = useState(null);
  const [search,        setSearch]        = useState("");
  const [mobileOpen,    setMobileOpen]    = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [toggleHovered, setToggleHovered] = useState(false);
  const searchInputRef = useRef(null);

  const section = NAV.find(s => s.id === activeTab) ?? NAV[0];

  // Global search results (null = not searching)
  const globalResults = globalSearch(search);
  const isSearching   = !!globalResults;

  useEffect(() => {
    const sec = getSectionForPath(pathname);
    setActiveTab(sec);
    const secData = NAV.find(s => s.id === sec);
    if (!secData) return;
    secData.groups.forEach((g, i) => {
      if (g.items.some(it => ROUTES[it.id] === pathname))
        setOpenGroups(p => ({ ...p, [`${sec}-${i}`]: true }));
    });
  }, [pathname]);

  // Close mobile sidebar on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  useEffect(() => {
    const handleKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === "Escape") {
        if (search) setSearch("");
        else setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [search]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const toggleGroup = useCallback((key) => {
    setOpenGroups(p => ({ ...p, [key]: !p[key] }));
  }, []);

  const navigate = useCallback((itemId) => {
    const route = ROUTES[itemId];
    if (route) router.push(route);
    setMobileOpen(false);
  }, [router]);

  // When searching, open all groups in results automatically
  useEffect(() => {
    if (!globalResults) return;
    const next = { ...openGroups };
    globalResults.forEach(sec => {
      sec.groups.forEach((_, i) => { next[`${sec.id}-${i}`] = true; });
    });
    setOpenGroups(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Current tab's groups (used when NOT searching)
  const tabGroups = section.groups;

  const W_OPEN = 272;

  // Design tokens
  const BG       = "#030712";
  const SURFACE  = "rgba(10,13,22,0.97)";
  const BORDER   = "rgba(255,255,255,0.07)";
  const TEXT_PRI = "#f1f5f9";
  const TEXT_SEC = "#94a3b8";
  const TEXT_DIM = "#475569";
  const MONO     = "'Space Mono', monospace";
  const SANS     = "'Inter', -apple-system, sans-serif";
  const ACCENT   = "#7c6bfa";
  const ACCENT2  = "#a78bfa";

  // Shared renderer for a list of sections+groups
  const renderGroups = (sections) =>
    sections.map((sec) => {
      const secData = NAV.find(s => s.id === sec.id);
      return (
        <div key={sec.id}>
          {/* Section divider when in global search mode */}
          {isSearching && (
            <div style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "8px 11px 4px",
            }}>
              <span style={{
                fontSize: "9px", fontWeight: 700, fontFamily: SANS,
                letterSpacing: "0.1em", textTransform: "uppercase",
                color: secData?.accent ?? TEXT_DIM,
              }}>
                {sec.label}
              </span>
              <div style={{ flex: 1, height: "1px", background: `${secData?.accent ?? TEXT_DIM}22` }} />
            </div>
          )}
          {sec.groups.map((group, gi) => {
            // Find real index in original NAV for consistent key
            const realGi = NAV.find(s => s.id === sec.id)?.groups.findIndex(g => g.label === group.label) ?? gi;
            const groupKey = `${sec.id}-${realGi}`;
            const isOpen   = isSearching ? true : (openGroups[groupKey] !== false);

            return (
              <div key={group.label} style={{ marginBottom: "4px" }}>
                {/* Group header */}
                <button
                  onClick={() => !isSearching && toggleGroup(groupKey)}
                  style={{
                    width: "100%",
                    display: "flex", alignItems: "center", gap: "8px",
                    padding: "9px 11px",
                    borderRadius: "9px",
                    background: isOpen
                      ? `linear-gradient(135deg, ${group.color}10, ${group.color}06)`
                      : "transparent",
                    border: `1px solid ${isOpen ? group.color + "30" : "transparent"}`,
                    color: isOpen ? group.color : TEXT_DIM,
                    fontFamily: SANS, fontSize: "11px", fontWeight: 700,
                    cursor: isSearching ? "default" : "pointer",
                    transition: "all 0.2s cubic-bezier(0.22,1,0.36,1)",
                    letterSpacing: "0.03em",
                  }}
                  onMouseEnter={e => {
                    if (!isOpen && !isSearching) {
                      e.currentTarget.style.background = `${group.color}08`;
                      e.currentTarget.style.color = group.color;
                      e.currentTarget.style.borderColor = group.color + "20";
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isOpen && !isSearching) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = TEXT_DIM;
                      e.currentTarget.style.borderColor = "transparent";
                    }
                  }}
                >
                  <span style={{
                    width: "5px", height: "5px", borderRadius: "50%", flexShrink: 0,
                    background: isOpen ? group.color : TEXT_DIM,
                    boxShadow: isOpen ? `0 0 8px ${group.color}` : "none",
                    transition: "all 0.2s",
                  }} />
                  <span style={{ fontFamily: MONO, fontSize: "11px", opacity: 0.7, flexShrink: 0 }}>{group.icon}</span>
                  <span style={{ flex: 1, textAlign: "left" }}>{group.label}</span>
                  <span style={{
                    fontFamily: MONO, fontSize: "9px", fontWeight: 700,
                    padding: "1px 7px", borderRadius: "5px",
                    background: isOpen ? `${group.color}22` : "rgba(255,255,255,0.05)",
                    color: isOpen ? group.color : TEXT_DIM,
                    border: `1px solid ${isOpen ? group.color + "30" : "rgba(255,255,255,0.07)"}`,
                    transition: "all 0.2s",
                  }}>{group.items.length}</span>
                  {!isSearching && (
                    <span style={{
                      fontSize: "9px", color: isOpen ? group.color : TEXT_DIM,
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.25s cubic-bezier(0.22,1,0.36,1), color 0.2s",
                      flexShrink: 0,
                    }}>▼</span>
                  )}
                </button>

                {/* Items */}
                {isOpen && (
                  <div className="vs-group-open" style={{
                    marginLeft: "16px",
                    paddingLeft: "10px",
                    borderLeft: `1px solid ${group.color}18`,
                    marginTop: "3px",
                  }}>
                    {group.items.map((item, idx) => {
                      const route    = ROUTES[item.id];
                      const isActive = pathname === route;
                      const available = !!route;
                      const isHov    = hovItem === item.id;
                      const tc       = TAG_STYLE[item.tag];

                      return (
                        <button
                          key={item.id}
                          onClick={() => available && navigate(item.id)}
                          onMouseEnter={() => setHovItem(item.id)}
                          onMouseLeave={() => setHovItem(null)}
                          className={`vs-item-in${isActive ? " vs-active-item" : ""}`}
                          style={{
                            animationDelay: `${idx * 0.025}s`,
                            width: "100%",
                            display: "flex", alignItems: "center", gap: "8px",
                            padding: "10px 10px", // slightly taller for touch
                            borderRadius: "9px",
                            margin: "2px 0",
                            background: isActive
                              ? `linear-gradient(135deg, ${group.color}18, ${group.color}0c)`
                              : isHov && available
                                ? `${group.color}0e`
                                : "transparent",
                            border: `1px solid ${
                              isActive ? group.color + "45"
                              : isHov && available ? group.color + "25"
                              : "transparent"
                            }`,
                            cursor: available ? "pointer" : "default",
                            opacity: available ? 1 : 0.38,
                            transition: "all 0.18s cubic-bezier(0.22,1,0.36,1)",
                            position: "relative", overflow: "hidden",
                            boxShadow: isActive
                              ? `0 3px 10px ${group.color}22, inset 0 1px 0 rgba(255,255,255,0.06)`
                              : "none",
                            WebkitTapHighlightColor: "transparent",
                            minHeight: "44px", // accessible touch target
                          }}
                        >
                          {isActive && (
                            <>
                              <div style={{
                                position: "absolute", left: 0, top: "20%", bottom: "20%",
                                width: "2px",
                                background: `linear-gradient(to bottom, transparent, ${group.color}, transparent)`,
                                borderRadius: "0 2px 2px 0",
                                boxShadow: `0 0 6px ${group.color}`,
                              }} />
                              <div style={{
                                position: "absolute", inset: 0,
                                background: `linear-gradient(90deg, transparent, ${group.color}07, transparent)`,
                                transform: "translateX(-100%)",
                                animation: "vs-progress 3s ease-in-out infinite",
                              }} />
                            </>
                          )}

                          <span style={{
                            width: "26px", height: "26px", borderRadius: "7px",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "10px", fontFamily: MONO, flexShrink: 0,
                            color: isActive || isHov ? group.color : TEXT_DIM,
                            background: isActive
                              ? `${group.color}28`
                              : isHov ? `${group.color}14`
                              : "rgba(255,255,255,0.04)",
                            border: `1px solid ${
                              isActive ? group.color + "45"
                              : isHov ? group.color + "25"
                              : "rgba(255,255,255,0.07)"
                            }`,
                            transition: "all 0.18s",
                            position: "relative", zIndex: 1,
                          }}>
                            {item.icon}
                          </span>

                          <div style={{ flex: 1, textAlign: "left", position: "relative", zIndex: 1, minWidth: 0 }}>
                            <div style={{
                              fontFamily: SANS, fontSize: "12px",
                              fontWeight: isActive ? 700 : 500,
                              color: isActive ? TEXT_PRI : TEXT_SEC,
                              transition: "all 0.18s",
                              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                            }}>
                              {item.label}
                            </div>
                            {(isActive || isHov) && available && (
                              <div style={{
                                fontFamily: MONO, fontSize: "9px",
                                color: group.color, opacity: 0.75, marginTop: "1px",
                              }}>
                                {item.complexity}
                              </div>
                            )}
                          </div>

                          {!available && (
                            <span style={{
                              fontSize: "8px", color: TEXT_DIM, fontWeight: 700,
                              letterSpacing: "0.06em", fontFamily: SANS,
                              background: "rgba(255,255,255,0.04)",
                              padding: "2px 6px", borderRadius: "4px",
                              border: `1px solid ${BORDER}`, flexShrink: 0,
                            }}>SOON</span>
                          )}

                          {(isActive || isHov) && available && tc && (
                            <span style={{
                              fontSize: "8px", fontWeight: 700, fontFamily: MONO,
                              padding: "2px 7px", borderRadius: "5px",
                              background: tc.bg, color: tc.text,
                              border: `1px solid ${tc.border}`,
                              flexShrink: 0, position: "relative", zIndex: 1,
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
        </div>
      );
    });

  // ── COLLAPSED ────────────────────────────────────────────────────────────
  if (collapsed) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Inter:wght@300;400;500;600;700;800&display=swap');
          @keyframes vs-arrow-glow {
            0%,100% { box-shadow: 4px 0 16px rgba(0,0,0,0.4); }
            50%      { box-shadow: 4px 0 20px rgba(124,107,250,0.25); }
          }
          .vs-collapse-btn {
            animation: vs-arrow-glow 3s ease-in-out infinite;
          }
        `}</style>
        <div style={{
          position: "fixed", top: "50%", left: 0,
          transform: "translateY(-50%)", zIndex: 400,
        }}>
          <button
            className="vs-collapse-btn"
            onClick={toggleCollapse}
            onMouseEnter={() => setToggleHovered(true)}
            onMouseLeave={() => setToggleHovered(false)}
            title="Expand sidebar"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: "28px", height: "52px", borderRadius: "0 12px 12px 0",
              background: toggleHovered
                ? "linear-gradient(180deg, #6d5ce8 0%, #9b7ef8 100%)"
                : "linear-gradient(180deg, rgba(18,15,38,0.97) 0%, rgba(12,10,28,0.97) 100%)",
              border: "1px solid", borderLeft: "none",
              borderColor: toggleHovered ? "rgba(155,126,248,0.65)" : "rgba(124,107,250,0.3)",
              color: toggleHovered ? "#fff" : ACCENT2,
              cursor: "pointer", fontSize: "14px", fontFamily: MONO,
              backdropFilter: "blur(16px)",
              transition: "background 0.22s, border-color 0.22s, color 0.22s",
              outline: "none", position: "relative", overflow: "hidden",
            }}
          >
            <span style={{
              display: "block", fontSize: "13px", lineHeight: 1,
              transition: "transform 0.22s cubic-bezier(0.22,1,0.36,1)",
              transform: toggleHovered ? "translateX(2px)" : "translateX(0)",
              position: "relative", zIndex: 1,
            }}>›</span>
          </button>
        </div>
      </>
    );
  }

  // ── EXPANDED SIDEBAR ─────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Inter:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }

        .vs-scroll::-webkit-scrollbar { width: 3px; }
        .vs-scroll::-webkit-scrollbar-track { background: transparent; }
        .vs-scroll::-webkit-scrollbar-thumb { background: rgba(124,107,250,0.25); border-radius: 10px; }
        .vs-scroll::-webkit-scrollbar-thumb:hover { background: rgba(124,107,250,0.45); }

        @keyframes vs-shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        .vs-logo-text {
          background: linear-gradient(90deg, #818cf8 0%, #c084fc 25%, #e879f9 50%, #c084fc 75%, #818cf8 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: vs-shimmer 5s ease-in-out infinite;
        }

        @keyframes vs-pulse-border {
          0%,100% { border-color: rgba(124,107,250,0.4); box-shadow: 0 0 0 0 rgba(124,107,250,0); }
          50%      { border-color: rgba(167,139,250,0.6); box-shadow: 0 0 12px rgba(124,107,250,0.2); }
        }
        .vs-active-item { animation: vs-pulse-border 2.5s ease-in-out infinite; }

        @keyframes vs-slide-down {
          from { opacity:0; transform:translateY(-6px); }
          to   { opacity:1; transform:translateY(0);    }
        }
        .vs-group-open { animation: vs-slide-down 0.22s cubic-bezier(0.22,1,0.36,1); }

        @keyframes vs-item-in {
          from { opacity:0; transform:translateX(-6px); }
          to   { opacity:1; transform:translateX(0);    }
        }
        .vs-item-in { animation: vs-item-in 0.2s cubic-bezier(0.22,1,0.36,1) both; }

        @keyframes vs-progress {
          from { transform:translateX(-100%); }
          to   { transform:translateX(400%); }
        }

        @keyframes vs-orb1 {
          0%,100% { transform: translate(0,0) scale(1); }
          50%      { transform: translate(20px,-15px) scale(1.08); }
        }
        @keyframes vs-orb2 {
          0%,100% { transform: translate(0,0) scale(1); }
          50%      { transform: translate(-15px,10px) scale(0.92); }
        }

        @keyframes vs-sidebar-in {
          from { opacity:0; transform:translateX(-16px); }
          to   { opacity:1; transform:translateX(0);     }
        }

        @keyframes vs-fade-in { from{opacity:0} to{opacity:1} }

        /* ─── MOBILE STYLES ─────────────────────────────────────────── */
        /* Desktop: sidebar is always visible, no transform needed */
        .vs-sidebar-root {
          transform: translateX(0);
          animation: vs-sidebar-in 0.3s cubic-bezier(0.22,1,0.36,1);
        }

        /* Mobile: sidebar slides in/out, starts hidden */
        @media (max-width: 768px) {
          .vs-sidebar-root {
            animation: none !important;
            transform: translateX(-100%) !important;
            transition: transform 0.3s cubic-bezier(0.22,1,0.36,1) !important;
          }
          .vs-sidebar-root.mobile-open {
            transform: translateX(0) !important;
          }
        }

        .vs-kbd {
          font-family: 'Space Mono', monospace;
          font-size: 9px;
          padding: 2px 5px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 4px;
          color: #475569;
          letter-spacing: 0.04em;
        }

        .vs-tab-indicator {
          position: absolute;
          bottom: 0; left: 10%; right: 10%;
          height: 2px; border-radius: 2px 2px 0 0;
          transition: opacity 0.2s;
        }

        .vs-mobile-fab {
          display: none;
          position: fixed;
          bottom: 24px; left: 20px;
          z-index: 1001;
          width: 52px; height: 52px;
          border-radius: 16px;
          background: rgba(10,13,22,0.95);
          border: 1px solid rgba(255,255,255,0.07);
          backdrop-filter: blur(16px);
          color: #94a3b8;
          font-size: 20px;
          align-items: center;
          justify-content: center;
          box-shadow: 0 12px 40px rgba(0,0,0,0.5);
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
          transition: background 0.2s, transform 0.2s;
        }
        @media (max-width: 768px) {
          .vs-mobile-fab { display: flex; }
        }
        .vs-mobile-fab:active { transform: scale(0.92); }

        /* On desktop, never show the backdrop */
        .vs-mobile-backdrop { display: none; }
        @media (max-width: 768px) {
          .vs-mobile-backdrop { display: block; }
        }
      `}</style>

      {/* Mobile FAB */}
      <button
        className="vs-mobile-fab"
        onClick={() => setMobileOpen(p => !p)}
        aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
      >
        {mobileOpen ? "✕" : "☰"}
      </button>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="vs-mobile-backdrop"
          onClick={() => setMobileOpen(false)}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(6px)",
            zIndex: 299,
            animation: "vs-fade-in 0.2s",
          }}
        />
      )}

      {/* ── SIDEBAR SHELL ──────────────────────────────────────────────── */}
      <aside
        className={`vs-sidebar-root${mobileOpen ? " mobile-open" : ""}`}
        style={{
          width: `${W_OPEN}px`,
          height: "100vh",
          position: "fixed", top: 0, left: 0,
          background: SURFACE,
          borderRight: `1px solid ${BORDER}`,
          backdropFilter: "blur(28px)",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
          zIndex: 300,
          boxShadow: "12px 0 60px rgba(0,0,0,0.7), inset -1px 0 0 rgba(255,255,255,0.04)",
          // On mobile, ensure sidebar is full-width friendly
          maxWidth: "min(272px, calc(100vw - 32px))",
        }}
      >
        {/* Ambient orbs */}
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
          <div style={{
            position: "absolute", top: "-60px", left: "30%",
            width: "200px", height: "200px", borderRadius: "50%",
            background: `radial-gradient(circle, ${section.accent}14 0%, transparent 70%)`,
            filter: "blur(50px)",
            animation: "vs-orb1 18s ease-in-out infinite",
          }} />
          <div style={{
            position: "absolute", bottom: "40px", right: "-20px",
            width: "160px", height: "160px", borderRadius: "50%",
            background: `radial-gradient(circle, ${section.accent}10 0%, transparent 70%)`,
            filter: "blur(40px)",
            animation: "vs-orb2 22s ease-in-out infinite",
          }} />
        </div>

        {/* Dot-grid texture */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "radial-gradient(circle, rgba(99,102,241,0.08) 1px, transparent 1px)",
          backgroundSize: "24px 24px", opacity: 0.5,
        }} />

        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", height: "100%" }}>

          {/* ── HEADER ─────────────────────────────────────────────────── */}
          <div style={{
            padding: "18px 16px 16px",
            borderBottom: `1px solid ${BORDER}`,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: "linear-gradient(to bottom, rgba(124,107,250,0.04), transparent)",
            flexShrink: 0,
          }}>
            <a href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
              <div style={{
                width: "34px", height: "34px", borderRadius: "10px",
                background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 55%, #a855f7 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "15px",
                boxShadow: "0 6px 20px rgba(99,102,241,0.45), inset 0 1px 0 rgba(255,255,255,0.25)",
                flexShrink: 0,
              }}>◈</div>
              <div>
                <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: "14px", letterSpacing: "0.03em", lineHeight: 1 }}>
                  <span className="vs-logo-text">VisuoSlayer</span>
                </div>
                <div style={{
                  fontFamily: SANS, fontSize: "9px", fontWeight: 500,
                  color: TEXT_DIM, letterSpacing: "0.12em",
                  textTransform: "uppercase", marginTop: "3px",
                }}>
                  DS &amp; Algo Visualizer
                </div>
              </div>
            </a>

            <button
              onClick={toggleCollapse}
              title="Collapse sidebar"
              style={{
                width: "30px", height: "30px", borderRadius: "8px",
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${BORDER}`,
                color: TEXT_DIM, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "13px", fontFamily: MONO,
                transition: "all 0.2s cubic-bezier(0.22,1,0.36,1)",
                flexShrink: 0, WebkitTapHighlightColor: "transparent",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = ACCENT;
                e.currentTarget.style.background = "rgba(124,107,250,0.12)";
                e.currentTarget.style.borderColor = "rgba(124,107,250,0.4)";
                e.currentTarget.style.boxShadow = "0 0 12px rgba(124,107,250,0.15)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = TEXT_DIM;
                e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                e.currentTarget.style.borderColor = BORDER;
                e.currentTarget.style.boxShadow = "none";
              }}
            >‹</button>
          </div>

          {/* ── SEARCH ─────────────────────────────────────────────────── */}
          <div style={{ padding: "14px 14px 0", flexShrink: 0 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: "9px",
              background: searchFocused ? "rgba(124,107,250,0.07)" : "rgba(255,255,255,0.03)",
              border: `1px solid ${searchFocused ? "rgba(124,107,250,0.45)" : BORDER}`,
              borderRadius: "11px",
              padding: "9px 13px",
              transition: "all 0.22s cubic-bezier(0.22,1,0.36,1)",
              boxShadow: searchFocused ? "0 0 0 3px rgba(124,107,250,0.09)" : "none",
            }}>
              <span style={{
                fontSize: "13px",
                color: searchFocused ? ACCENT : TEXT_DIM,
                transition: "color 0.2s", flexShrink: 0,
              }}>⌕</span>
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder="Search all topics..."
                style={{
                  flex: 1, background: "none", border: "none", outline: "none",
                  fontFamily: SANS, fontSize: "12px", color: TEXT_PRI,
                  fontWeight: 500, minWidth: 0,
                }}
              />
              {!search && <kbd className="vs-kbd">⌘K</kbd>}
              {search && (
                <button
                  onClick={() => setSearch("")}
                  style={{
                    background: "none", border: "none",
                    color: TEXT_DIM, cursor: "pointer", fontSize: "11px",
                    padding: "1px 4px", borderRadius: "4px",
                    transition: "all 0.15s", flexShrink: 0,
                    WebkitTapHighlightColor: "transparent",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = TEXT_PRI; e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = TEXT_DIM; e.currentTarget.style.background = "none"; }}
                >✕</button>
              )}
            </div>

            {/* Search hint */}
            {isSearching && (
              <div style={{
                fontFamily: SANS, fontSize: "10px", color: TEXT_DIM,
                padding: "6px 2px 0",
                display: "flex", alignItems: "center", gap: "4px",
              }}>
                <span style={{ color: ACCENT2, fontSize: "9px" }}>◈</span>
                Searching across all sections
              </div>
            )}
          </div>

          {/* ── TABS (hidden during search) ─────────────────────────── */}
          {!isSearching && (
            <div style={{ padding: "12px 14px 0", display: "flex", gap: "6px", flexShrink: 0 }}>
              {NAV.map(sec => {
                const active = activeTab === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => { setActiveTab(sec.id); }}
                    style={{
                      flex: 1,
                      display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                      padding: "9px 8px",
                      borderRadius: "10px",
                      background: active
                        ? `linear-gradient(135deg, ${sec.accent}18, ${sec.accent}0a)`
                        : "rgba(255,255,255,0.03)",
                      border: `1px solid ${active ? sec.accent + "45" : "rgba(255,255,255,0.06)"}`,
                      color: active ? sec.accent : TEXT_DIM,
                      fontFamily: SANS, fontSize: "11px", fontWeight: 700,
                      cursor: "pointer",
                      transition: "all 0.22s cubic-bezier(0.22,1,0.36,1)",
                      position: "relative", overflow: "hidden",
                      boxShadow: active ? `0 4px 14px ${sec.glow}` : "none",
                      letterSpacing: "0.02em",
                      WebkitTapHighlightColor: "transparent",
                      minHeight: "40px",
                    }}
                    onMouseEnter={e => {
                      if (!active) {
                        e.currentTarget.style.color = sec.accent;
                        e.currentTarget.style.background = `${sec.accent}0d`;
                        e.currentTarget.style.borderColor = sec.accent + "30";
                      }
                    }}
                    onMouseLeave={e => {
                      if (!active) {
                        e.currentTarget.style.color = TEXT_DIM;
                        e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                      }
                    }}
                  >
                    {active && (
                      <div style={{
                        position: "absolute", inset: 0,
                        background: `linear-gradient(90deg, transparent, ${sec.accent}0d, transparent)`,
                        transform: "translateX(-100%)",
                        animation: "vs-progress 2.5s ease-in-out infinite",
                      }} />
                    )}
                    <span style={{ fontSize: "13px", position: "relative", zIndex: 1 }}>{sec.icon}</span>
                    <span style={{ position: "relative", zIndex: 1 }}>
                      {sec.id === "ds" ? "Structures" : "Algorithms"}
                    </span>
                    {active && (
                      <span className="vs-tab-indicator" style={{ background: `linear-gradient(90deg, transparent, ${sec.accent}, transparent)` }} />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Section label + count (hidden during search) */}
          {!isSearching && (
            <div style={{
              padding: "12px 16px 8px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              flexShrink: 0,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                <span style={{
                  width: "5px", height: "5px", borderRadius: "50%",
                  background: section.accent, boxShadow: `0 0 8px ${section.accent}`,
                  display: "inline-block",
                }} />
                <span style={{
                  fontFamily: SANS, fontSize: "10px", fontWeight: 700,
                  color: TEXT_SEC, letterSpacing: "0.1em", textTransform: "uppercase",
                }}>{section.label}</span>
              </div>
              <span style={{
                fontFamily: MONO, fontSize: "9px", color: TEXT_DIM,
                background: "rgba(255,255,255,0.04)",
                padding: "2px 8px", borderRadius: "6px",
                border: `1px solid ${BORDER}`,
              }}>
                {section.groups.reduce((a, g) => a + g.items.length, 0)} topics
              </span>
            </div>
          )}

          {/* Search mode: total matches */}
          {isSearching && (
            <div style={{
              padding: "10px 16px 6px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              flexShrink: 0,
            }}>
              <span style={{
                fontFamily: SANS, fontSize: "10px", fontWeight: 700,
                color: TEXT_SEC, letterSpacing: "0.1em", textTransform: "uppercase",
              }}>Results</span>
              <span style={{
                fontFamily: MONO, fontSize: "9px", color: ACCENT2,
                background: "rgba(124,107,250,0.1)",
                padding: "2px 8px", borderRadius: "6px",
                border: "1px solid rgba(124,107,250,0.25)",
              }}>
                {globalResults.reduce((a, s) => a + s.groups.reduce((b, g) => b + g.items.length, 0), 0)} found
              </span>
            </div>
          )}

          {/* ── NAV TREE ───────────────────────────────────────────────── */}
          <nav className="vs-scroll" style={{
            flex: 1, overflowY: "auto", overflowX: "hidden",
            padding: "0 10px 16px",
            display: "flex", flexDirection: "column", gap: "3px",
            // Smooth scroll on iOS
            WebkitOverflowScrolling: "touch",
          }}>
            {isSearching
              ? globalResults.length > 0
                ? renderGroups(globalResults)
                : (
                  <div style={{ padding: "48px 20px", textAlign: "center", color: TEXT_DIM }}>
                    <div style={{ fontSize: "28px", opacity: 0.2, marginBottom: "12px" }}>⌕</div>
                    <p style={{ fontFamily: SANS, fontSize: "12px", fontWeight: 500, marginBottom: "16px" }}>
                      No results for "{search}"
                    </p>
                    <button
                      onClick={() => setSearch("")}
                      style={{
                        fontFamily: SANS, fontSize: "11px", fontWeight: 600,
                        background: "rgba(124,107,250,0.15)",
                        border: "1px solid rgba(124,107,250,0.35)",
                        borderRadius: "8px", padding: "7px 16px",
                        color: ACCENT2, cursor: "pointer", transition: "all 0.2s",
                        WebkitTapHighlightColor: "transparent",
                      }}
                    >
                      Clear search
                    </button>
                  </div>
                )
              : renderGroups([{ ...section, groups: tabGroups }])
            }
          </nav>

          {/* ── FOOTER ─────────────────────────────────────────────────── */}
          <div style={{
            borderTop: `1px solid ${BORDER}`,
            padding: "12px 16px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: "linear-gradient(to top, rgba(124,107,250,0.03), transparent)",
            flexShrink: 0,
          }}>
            <div>
              <div style={{
                fontFamily: MONO, fontSize: "9px", color: TEXT_DIM,
                letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.5,
              }}>VisuoSlayer</div>
              <div style={{ fontFamily: SANS, fontSize: "10px", color: TEXT_DIM, marginTop: "2px" }}>v1.0</div>
            </div>
            <a
              href="/"
              style={{
                display: "flex", alignItems: "center", gap: "5px",
                fontSize: "11px", fontWeight: 600,
                color: TEXT_DIM, textDecoration: "none",
                padding: "8px 11px", borderRadius: "8px",
                background: "rgba(255,255,255,0.03)",
                border: `1px solid ${BORDER}`,
                transition: "all 0.2s cubic-bezier(0.22,1,0.36,1)",
                fontFamily: SANS, WebkitTapHighlightColor: "transparent",
                minHeight: "36px",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = ACCENT;
                e.currentTarget.style.borderColor = "rgba(124,107,250,0.4)";
                e.currentTarget.style.background = "rgba(124,107,250,0.08)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = TEXT_DIM;
                e.currentTarget.style.borderColor = BORDER;
                e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <span style={{ fontSize: "12px" }}>⌂</span>
              <span>Home</span>
            </a>
          </div>
        </div>
      </aside>
    </>
  );
}