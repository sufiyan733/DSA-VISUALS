// "use client";
// import { useState, useEffect, useCallback, useRef } from "react";
// import { useRouter, usePathname } from "next/navigation";
// import { useSidebar } from "./sbc";

// // ─────────────────────────────────────────────────────────────────────────────
// // DATA
// // ─────────────────────────────────────────────────────────────────────────────
// const ROUTES = {
//   array:          "/array",
//   "linked-list":  "/linked-list",
//   stack:          "/stack",
//   queue:          "/queue",
//   deque:          "/deque",
//   "binary-tree":  "/binary-tree",
//   bst:            "/bs-tree",
//   avl:            "/avl-tree",
//   heap:           "/heap",
//   trie:           "/trie",
//   graph:          "/graph",
//   "adj-list":     "/adj-list",
//   "adj-matrix":   "/adj-matrix",
//   "hash-map":     "/hash-map",
//   "hash-set":     "/hash-set",
//   bubble:         "/bubble-sort",
//   insertion:      "/insertion-sort",
//   merge:          "/merge-sort",
//   quick:          "/quick-sort",
//   "heap-sort":    "/heap-sort",
//   radix:          "/radix-sort",
//   "linear-s":     "/linear-search",
//   "binary-s":     "/binary-search",
//   bfs:            "/bfs",
//   dfs:            "/dfs",
//   dijkstra:       "/dijkstra",
//   bellman:        "/bellman-ford",
//   kruskal:        "/kruskal",
//   prim:           "/prim",
//   fibonacci:      "/fibonacci",
//   knapsack:       "/knapsack",
//   lcs:            "/lcs",
//   lis:            "/lis",
// };

// const NAV = [
//   {
//     id: "ds", label: "Data Structures", icon: "⬡",
//     accent: "#818cf8", glow: "rgba(129,140,248,0.5)",
//     groups: [
//       { label: "Linear", icon: "▤", color: "#818cf8",
//         items: [
//           { id: "array",       label: "Array",       icon: "[ ]", complexity: "O(1)",     tag: "Basic" },
//           { id: "linked-list", label: "Linked List", icon: "→",   complexity: "O(n)",     tag: "Basic" },
//           { id: "stack",       label: "Stack",       icon: "⬆",   complexity: "O(1)",     tag: "Basic" },
//           { id: "queue",       label: "Queue",       icon: "⇥",   complexity: "O(1)",     tag: "Basic" },
//           { id: "deque",       label: "Deque",       icon: "⇔",   complexity: "O(1)",     tag: "Basic" },
//         ]},
//       { label: "Trees", icon: "⑂", color: "#a78bfa",
//         items: [
//           { id: "binary-tree", label: "Binary Tree", icon: "⑂",  complexity: "O(log n)", tag: "Mid"   },
//           { id: "bst",         label: "BST",         icon: "⑂",  complexity: "O(log n)", tag: "Mid"   },
//           { id: "avl",         label: "AVL Tree",    icon: "⑂",  complexity: "O(log n)", tag: "Hard"  },
//           { id: "heap",        label: "Heap",        icon: "△",   complexity: "O(log n)", tag: "Mid"   },
//           { id: "trie",        label: "Trie",        icon: "⑂",  complexity: "O(m)",     tag: "Hard"  },
//         ]},
//       { label: "Graphs", icon: "◎", color: "#c084fc",
//         items: [
//           { id: "graph",      label: "Graph",      icon: "◎",  complexity: "O(V+E)",  tag: "Hard" },
//           { id: "adj-list",   label: "Adj. List",  icon: "≡",   complexity: "O(V+E)",  tag: "Mid"  },
//           { id: "adj-matrix", label: "Adj. Matrix",icon: "⊞",   complexity: "O(V²)",   tag: "Mid"  },
//         ]},
//       { label: "Hashing", icon: "#", color: "#e879f9",
//         items: [
//           { id: "hash-map", label: "Hash Map", icon: "{}", complexity: "O(1)", tag: "Mid" },
//           { id: "hash-set", label: "Hash Set", icon: "∅",  complexity: "O(1)", tag: "Mid" },
//         ]},
//     ],
//   },
//   {
//     id: "algo", label: "Algorithms", icon: "⚙",
//     accent: "#22d3ee", glow: "rgba(34,211,238,0.5)",
//     groups: [
//       { label: "Sorting", icon: "↕", color: "#22d3ee",
//         items: [
//           { id: "bubble",    label: "Bubble Sort",    icon: "○",  complexity: "O(n²)",      tag: "Basic" },
//           { id: "insertion", label: "Insertion Sort", icon: "↩",  complexity: "O(n²)",      tag: "Basic" },
//           { id: "merge",     label: "Merge Sort",     icon: "⊕",  complexity: "O(n log n)", tag: "Mid"   },
//           { id: "quick",     label: "Quick Sort",     icon: "⚡", complexity: "O(n log n)", tag: "Mid"   },
//           { id: "heap-sort", label: "Heap Sort",      icon: "△",  complexity: "O(n log n)", tag: "Mid"   },
//           { id: "radix",     label: "Radix Sort",     icon: "⌗",  complexity: "O(nk)",      tag: "Hard"  },
//         ]},
//       { label: "Searching", icon: "◉", color: "#2dd4bf",
//         items: [
//           { id: "linear-s", label: "Linear Search", icon: "→",   complexity: "O(n)",     tag: "Basic" },
//           { id: "binary-s", label: "Binary Search", icon: "⟨⟩", complexity: "O(log n)", tag: "Basic" },
//         ]},
//       { label: "Graph Algos", icon: "⬡", color: "#34d399",
//         items: [
//           { id: "bfs",      label: "BFS",          icon: "⊙",  complexity: "O(V+E)",    tag: "Mid"  },
//           { id: "dfs",      label: "DFS",          icon: "⬇",  complexity: "O(V+E)",    tag: "Mid"  },
//           { id: "dijkstra", label: "Dijkstra",     icon: "⬡",  complexity: "O(E log V)", tag: "Hard" },
//           { id: "bellman",  label: "Bellman-Ford", icon: "⊕",  complexity: "O(VE)",     tag: "Hard" },
//           { id: "kruskal",  label: "Kruskal",      icon: "⑂",  complexity: "O(E log E)", tag: "Hard" },
//           { id: "prim",     label: "Prim's",       icon: "◈",  complexity: "O(E log V)", tag: "Hard" },
//         ]},
//       { label: "Dynamic Prog.", icon: "⊞", color: "#86efac",
//         items: [
//           { id: "fibonacci", label: "Fibonacci", icon: "∞",  complexity: "O(n)",  tag: "Mid"  },
//           { id: "knapsack",  label: "Knapsack",  icon: "⊡",  complexity: "O(nW)", tag: "Hard" },
//           { id: "lcs",       label: "LCS",       icon: "≈",   complexity: "O(mn)", tag: "Hard" },
//           { id: "lis",       label: "LIS",       icon: "↑",   complexity: "O(n²)", tag: "Hard" },
//         ]},
//     ],
//   },
// ];

// const TAG_STYLE = {
//   Basic: { bg: "rgba(99,102,241,0.15)",  text: "#a5b4fc", border: "rgba(165,180,252,0.3)" },
//   Mid:   { bg: "rgba(6,182,212,0.15)",   text: "#67e8f9", border: "rgba(103,232,249,0.3)" },
//   Hard:  { bg: "rgba(239,68,68,0.15)",   text: "#fca5a5", border: "rgba(252,165,165,0.3)" },
// };

// function getSectionForPath(pathname) {
//   for (const section of NAV) {
//     for (const group of section.groups) {
//       for (const item of group.items) {
//         if (ROUTES[item.id] === pathname) return section.id;
//       }
//     }
//   }
//   return "ds";
// }

// function getActiveItem(pathname) {
//   for (const section of NAV) {
//     for (const group of section.groups) {
//       for (const item of group.items) {
//         if (ROUTES[item.id] === pathname) return item.id;
//       }
//     }
//   }
//   return null;
// }

// function globalSearch(query) {
//   if (!query.trim()) return null;
//   const q = query.toLowerCase();
//   const results = [];
//   for (const section of NAV) {
//     const matchedGroups = [];
//     for (const group of section.groups) {
//       const items = group.items.filter(it => it.label.toLowerCase().includes(q));
//       if (items.length) matchedGroups.push({ ...group, items });
//     }
//     if (matchedGroups.length) results.push({ ...section, groups: matchedGroups });
//   }
//   return results;
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // SIDEBAR COMPONENT
// // ─────────────────────────────────────────────────────────────────────────────
// export default function Sidebar() {
//   const router   = useRouter();
//   const pathname = usePathname();
//   const { collapsed, toggleCollapse } = useSidebar();

//   const activeSection = getSectionForPath(pathname);

//   const [activeTab, setActiveTab] = useState(activeSection);
//   const [openGroups, setOpenGroups] = useState(() => {
//     const init = {};
//     NAV.forEach(sec =>
//       sec.groups.forEach((_, i) => { init[`${sec.id}-${i}`] = sec.id === activeSection; })
//     );
//     return init;
//   });
//   const [hovItem,       setHovItem]       = useState(null);
//   const [search,        setSearch]        = useState("");
//   const [mobileOpen,    setMobileOpen]    = useState(false);
//   const [searchFocused, setSearchFocused] = useState(false);
//   const [toggleHovered, setToggleHovered] = useState(false);
//   const [mounted, setMounted] = useState(false);
//   const searchInputRef = useRef(null);

//   const section = NAV.find(s => s.id === activeTab) ?? NAV[0];

//   const globalResults = globalSearch(search);
//   const isSearching   = !!globalResults;

//   useEffect(() => {
//     const sec = getSectionForPath(pathname);
//     setActiveTab(sec);
//     const secData = NAV.find(s => s.id === sec);
//     if (!secData) return;
//     secData.groups.forEach((g, i) => {
//       if (g.items.some(it => ROUTES[it.id] === pathname))
//         setOpenGroups(p => ({ ...p, [`${sec}-${i}`]: true }));
//     });
//   }, [pathname]);

//   // Close mobile sidebar on route change
//   useEffect(() => { setMobileOpen(false); }, [pathname]);

//   // Mark as mounted so sidebar becomes visible after client hydration
//   useEffect(() => { setMounted(true); }, []);

//   useEffect(() => {
//     const handleKey = (e) => {
//       if ((e.metaKey || e.ctrlKey) && e.key === "k") {
//         e.preventDefault();
//         searchInputRef.current?.focus();
//       }
//       if (e.key === "Escape") {
//         if (search) setSearch("");
//         else setMobileOpen(false);
//       }
//     };
//     window.addEventListener("keydown", handleKey);
//     return () => window.removeEventListener("keydown", handleKey);
//   }, [search]);

//   // Lock body scroll when mobile sidebar is open
//   useEffect(() => {
//     if (typeof document === "undefined") return;
//     document.body.style.overflow = mobileOpen ? "hidden" : "";
//     return () => { document.body.style.overflow = ""; };
//   }, [mobileOpen]);

//   const toggleGroup = useCallback((key) => {
//     setOpenGroups(p => ({ ...p, [key]: !p[key] }));
//   }, []);

//   const navigate = useCallback((itemId) => {
//     const route = ROUTES[itemId];
//     if (route) router.push(route);
//     setMobileOpen(false);
//   }, [router]);

//   useEffect(() => {
//     if (!globalResults) return;
//     const next = { ...openGroups };
//     globalResults.forEach(sec => {
//       sec.groups.forEach((_, i) => { next[`${sec.id}-${i}`] = true; });
//     });
//     setOpenGroups(next);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [search]);

//   const tabGroups = section.groups;

//   const W_OPEN = 272;

//   const BG       = "#030712";
//   const SURFACE  = "rgba(10,13,22,0.97)";
//   const BORDER   = "rgba(255,255,255,0.07)";
//   const TEXT_PRI = "#f1f5f9";
//   const TEXT_SEC = "#94a3b8";
//   const TEXT_DIM = "#475569";
//   const MONO     = "'Space Mono', monospace";
//   const SANS     = "'Inter', -apple-system, sans-serif";
//   const ACCENT   = "#7c6bfa";
//   const ACCENT2  = "#a78bfa";

//   const renderGroups = (sections) =>
//     sections.map((sec) => {
//       const secData = NAV.find(s => s.id === sec.id);
//       return (
//         <div key={sec.id}>
//           {isSearching && (
//             <div style={{
//               display: "flex", alignItems: "center", gap: "8px",
//               padding: "8px 11px 4px",
//             }}>
//               <span style={{
//                 fontSize: "9px", fontWeight: 700, fontFamily: SANS,
//                 letterSpacing: "0.1em", textTransform: "uppercase",
//                 color: secData?.accent ?? TEXT_DIM,
//               }}>
//                 {sec.label}
//               </span>
//               <div style={{ flex: 1, height: "1px", background: `${secData?.accent ?? TEXT_DIM}22` }} />
//             </div>
//           )}
//           {sec.groups.map((group, gi) => {
//             const realGi = NAV.find(s => s.id === sec.id)?.groups.findIndex(g => g.label === group.label) ?? gi;
//             const groupKey = `${sec.id}-${realGi}`;
//             const isOpen   = isSearching ? true : (openGroups[groupKey] !== false);

//             return (
//               <div key={group.label} style={{ marginBottom: "4px" }}>
//                 <button
//                   onClick={() => !isSearching && toggleGroup(groupKey)}
//                   style={{
//                     width: "100%",
//                     display: "flex", alignItems: "center", gap: "8px",
//                     padding: "9px 11px",
//                     borderRadius: "9px",
//                     background: isOpen
//                       ? `linear-gradient(135deg, ${group.color}10, ${group.color}06)`
//                       : "transparent",
//                     border: `1px solid ${isOpen ? group.color + "30" : "transparent"}`,
//                     color: isOpen ? group.color : TEXT_DIM,
//                     fontFamily: SANS, fontSize: "11px", fontWeight: 700,
//                     cursor: isSearching ? "default" : "pointer",
//                     transition: "all 0.2s cubic-bezier(0.22,1,0.36,1)",
//                     letterSpacing: "0.03em",
//                   }}
//                   onMouseEnter={e => {
//                     if (!isOpen && !isSearching) {
//                       e.currentTarget.style.background = `${group.color}08`;
//                       e.currentTarget.style.color = group.color;
//                       e.currentTarget.style.borderColor = group.color + "20";
//                     }
//                   }}
//                   onMouseLeave={e => {
//                     if (!isOpen && !isSearching) {
//                       e.currentTarget.style.background = "transparent";
//                       e.currentTarget.style.color = TEXT_DIM;
//                       e.currentTarget.style.borderColor = "transparent";
//                     }
//                   }}
//                 >
//                   <span style={{
//                     width: "5px", height: "5px", borderRadius: "50%", flexShrink: 0,
//                     background: isOpen ? group.color : TEXT_DIM,
//                     boxShadow: isOpen ? `0 0 8px ${group.color}` : "none",
//                     transition: "all 0.2s",
//                   }} />
//                   <span style={{ fontFamily: MONO, fontSize: "11px", opacity: 0.7, flexShrink: 0 }}>{group.icon}</span>
//                   <span style={{ flex: 1, textAlign: "left" }}>{group.label}</span>
//                   <span style={{
//                     fontFamily: MONO, fontSize: "9px", fontWeight: 700,
//                     padding: "1px 7px", borderRadius: "5px",
//                     background: isOpen ? `${group.color}22` : "rgba(255,255,255,0.05)",
//                     color: isOpen ? group.color : TEXT_DIM,
//                     border: `1px solid ${isOpen ? group.color + "30" : "rgba(255,255,255,0.07)"}`,
//                     transition: "all 0.2s",
//                   }}>{group.items.length}</span>
//                   {!isSearching && (
//                     <span style={{
//                       fontSize: "9px", color: isOpen ? group.color : TEXT_DIM,
//                       transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
//                       transition: "transform 0.25s cubic-bezier(0.22,1,0.36,1), color 0.2s",
//                       flexShrink: 0,
//                     }}>▼</span>
//                   )}
//                 </button>

//                 {isOpen && (
//                   <div className="vs-group-open" style={{
//                     marginLeft: "16px",
//                     paddingLeft: "10px",
//                     borderLeft: `1px solid ${group.color}18`,
//                     marginTop: "3px",
//                   }}>
//                     {group.items.map((item, idx) => {
//                       const route    = ROUTES[item.id];
//                       const isActive = pathname === route;
//                       const available = !!route;
//                       const isHov    = hovItem === item.id;
//                       const tc       = TAG_STYLE[item.tag];

//                       return (
//                         <button
//                           key={item.id}
//                           onClick={() => available && navigate(item.id)}
//                           onMouseEnter={() => setHovItem(item.id)}
//                           onMouseLeave={() => setHovItem(null)}
//                           className={`vs-item-in${isActive ? " vs-active-item" : ""}`}
//                           style={{
//                             animationDelay: `${idx * 0.025}s`,
//                             width: "100%",
//                             display: "flex", alignItems: "center", gap: "8px",
//                             padding: "10px 10px",
//                             borderRadius: "9px",
//                             margin: "2px 0",
//                             background: isActive
//                               ? `linear-gradient(135deg, ${group.color}18, ${group.color}0c)`
//                               : isHov && available
//                                 ? `${group.color}0e`
//                                 : "transparent",
//                             border: `1px solid ${
//                               isActive ? group.color + "45"
//                               : isHov && available ? group.color + "25"
//                               : "transparent"
//                             }`,
//                             cursor: available ? "pointer" : "default",
//                             opacity: available ? 1 : 0.38,
//                             transition: "all 0.18s cubic-bezier(0.22,1,0.36,1)",
//                             position: "relative", overflow: "hidden",
//                             boxShadow: isActive
//                               ? `0 3px 10px ${group.color}22, inset 0 1px 0 rgba(255,255,255,0.06)`
//                               : "none",
//                             WebkitTapHighlightColor: "transparent",
//                             minHeight: "44px",
//                           }}
//                         >
//                           {isActive && (
//                             <>
//                               <div style={{
//                                 position: "absolute", left: 0, top: "20%", bottom: "20%",
//                                 width: "2px",
//                                 background: `linear-gradient(to bottom, transparent, ${group.color}, transparent)`,
//                                 borderRadius: "0 2px 2px 0",
//                                 boxShadow: `0 0 6px ${group.color}`,
//                               }} />
//                               <div style={{
//                                 position: "absolute", inset: 0,
//                                 background: `linear-gradient(90deg, transparent, ${group.color}07, transparent)`,
//                                 transform: "translateX(-100%)",
//                                 animation: "vs-progress 3s ease-in-out infinite",
//                               }} />
//                             </>
//                           )}

//                           <span style={{
//                             width: "26px", height: "26px", borderRadius: "7px",
//                             display: "flex", alignItems: "center", justifyContent: "center",
//                             fontSize: "10px", fontFamily: MONO, flexShrink: 0,
//                             color: isActive || isHov ? group.color : TEXT_DIM,
//                             background: isActive
//                               ? `${group.color}28`
//                               : isHov ? `${group.color}14`
//                               : "rgba(255,255,255,0.04)",
//                             border: `1px solid ${
//                               isActive ? group.color + "45"
//                               : isHov ? group.color + "25"
//                               : "rgba(255,255,255,0.07)"
//                             }`,
//                             transition: "all 0.18s",
//                             position: "relative", zIndex: 1,
//                           }}>
//                             {item.icon}
//                           </span>

//                           <div style={{ flex: 1, textAlign: "left", position: "relative", zIndex: 1, minWidth: 0 }}>
//                             <div style={{
//                               fontFamily: SANS, fontSize: "12px",
//                               fontWeight: isActive ? 700 : 500,
//                               color: isActive ? TEXT_PRI : TEXT_SEC,
//                               transition: "all 0.18s",
//                               whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
//                             }}>
//                               {item.label}
//                             </div>
//                             {(isActive || isHov) && available && (
//                               <div style={{
//                                 fontFamily: MONO, fontSize: "9px",
//                                 color: group.color, opacity: 0.75, marginTop: "1px",
//                               }}>
//                                 {item.complexity}
//                               </div>
//                             )}
//                           </div>

//                           {!available && (
//                             <span style={{
//                               fontSize: "8px", color: TEXT_DIM, fontWeight: 700,
//                               letterSpacing: "0.06em", fontFamily: SANS,
//                               background: "rgba(255,255,255,0.04)",
//                               padding: "2px 6px", borderRadius: "4px",
//                               border: `1px solid ${BORDER}`, flexShrink: 0,
//                             }}>SOON</span>
//                           )}

//                           {(isActive || isHov) && available && tc && (
//                             <span style={{
//                               fontSize: "8px", fontWeight: 700, fontFamily: MONO,
//                               padding: "2px 7px", borderRadius: "5px",
//                               background: tc.bg, color: tc.text,
//                               border: `1px solid ${tc.border}`,
//                               flexShrink: 0, position: "relative", zIndex: 1,
//                             }}>
//                               {item.tag}
//                             </span>
//                           )}
//                         </button>
//                       );
//                     })}
//                   </div>
//                 )}
//               </div>
//             );
//           })}
//         </div>
//       );
//     });

//   // ── RENDER GUARD ─────────────────────────────────────────────────────────
//   // Don't render anything until we know the client viewport.
//   // This is the only reliable way to prevent the sidebar flashing open
//   // on first load on any screen size — CSS-only solutions are too late
//   // because the browser paints before the stylesheet takes effect.
//   if (!mounted) return null;

//   // ── COLLAPSED ────────────────────────────────────────────────────────────
//   // On mobile, collapsed state shows nothing — the FAB handles opening.
//   // On desktop, collapsed state shows the edge pull-tab.
//   if (collapsed) {
//     return (
//       <>
//         <style>{`
//           @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Inter:wght@300;400;500;600;700;800&display=swap');
//           @keyframes vs-arrow-glow {
//             0%,100% { box-shadow: 4px 0 16px rgba(0,0,0,0.4); }
//             50%      { box-shadow: 4px 0 20px rgba(124,107,250,0.25); }
//           }
//           .vs-collapse-btn { animation: vs-arrow-glow 3s ease-in-out infinite; }
//           /* On mobile, hide the desktop pull-tab entirely */
//           @media (max-width: 768px) { .vs-collapse-btn-wrap { display: none !important; } }
//         `}</style>
//         <div className="vs-collapse-btn-wrap" style={{
//           position: "fixed", top: "50%", left: 0,
//           transform: "translateY(-50%)", zIndex: 400,
//         }}>
//           <button
//             className="vs-collapse-btn"
//             onClick={toggleCollapse}
//             onMouseEnter={() => setToggleHovered(true)}
//             onMouseLeave={() => setToggleHovered(false)}
//             title="Expand sidebar"
//             style={{
//               display: "flex", alignItems: "center", justifyContent: "center",
//               width: "28px", height: "52px", borderRadius: "0 12px 12px 0",
//               background: toggleHovered
//                 ? "linear-gradient(180deg, #6d5ce8 0%, #9b7ef8 100%)"
//                 : "linear-gradient(180deg, rgba(18,15,38,0.97) 0%, rgba(12,10,28,0.97) 100%)",
//               border: "1px solid", borderLeft: "none",
//               borderColor: toggleHovered ? "rgba(155,126,248,0.65)" : "rgba(124,107,250,0.3)",
//               color: toggleHovered ? "#fff" : ACCENT2,
//               cursor: "pointer", fontSize: "14px", fontFamily: MONO,
//               backdropFilter: "blur(16px)",
//               transition: "background 0.22s, border-color 0.22s, color 0.22s",
//               outline: "none", position: "relative", overflow: "hidden",
//             }}
//           >
//             <span style={{
//               display: "block", fontSize: "13px", lineHeight: 1,
//               transition: "transform 0.22s cubic-bezier(0.22,1,0.36,1)",
//               transform: toggleHovered ? "translateX(2px)" : "translateX(0)",
//               position: "relative", zIndex: 1,
//             }}>›</span>
//           </button>
//         </div>
//       </>
//     );
//   }

//   // ── EXPANDED SIDEBAR ─────────────────────────────────────────────────────
//   return (
//     <>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Inter:wght@300;400;500;600;700;800&display=swap');
//         *, *::before, *::after { box-sizing: border-box; }

//         .vs-scroll::-webkit-scrollbar { width: 3px; }
//         .vs-scroll::-webkit-scrollbar-track { background: transparent; }
//         .vs-scroll::-webkit-scrollbar-thumb { background: rgba(124,107,250,0.25); border-radius: 10px; }
//         .vs-scroll::-webkit-scrollbar-thumb:hover { background: rgba(124,107,250,0.45); }

//         @keyframes vs-shimmer {
//           0%   { background-position: -200% 0; }
//           100% { background-position:  200% 0; }
//         }
//         .vs-logo-text {
//           background: linear-gradient(90deg, #818cf8 0%, #c084fc 25%, #e879f9 50%, #c084fc 75%, #818cf8 100%);
//           background-size: 200% auto;
//           -webkit-background-clip: text;
//           -webkit-text-fill-color: transparent;
//           background-clip: text;
//           animation: vs-shimmer 5s ease-in-out infinite;
//         }

//         @keyframes vs-pulse-border {
//           0%,100% { border-color: rgba(124,107,250,0.4); box-shadow: 0 0 0 0 rgba(124,107,250,0); }
//           50%      { border-color: rgba(167,139,250,0.6); box-shadow: 0 0 12px rgba(124,107,250,0.2); }
//         }
//         .vs-active-item { animation: vs-pulse-border 2.5s ease-in-out infinite; }

//         @keyframes vs-slide-down {
//           from { opacity:0; transform:translateY(-6px); }
//           to   { opacity:1; transform:translateY(0);    }
//         }
//         .vs-group-open { animation: vs-slide-down 0.22s cubic-bezier(0.22,1,0.36,1); }

//         @keyframes vs-item-in {
//           from { opacity:0; transform:translateX(-6px); }
//           to   { opacity:1; transform:translateX(0);    }
//         }
//         .vs-item-in { animation: vs-item-in 0.2s cubic-bezier(0.22,1,0.36,1) both; }

//         @keyframes vs-progress {
//           from { transform:translateX(-100%); }
//           to   { transform:translateX(400%); }
//         }
//         @keyframes vs-orb1 {
//           0%,100% { transform: translate(0,0) scale(1); }
//           50%      { transform: translate(20px,-15px) scale(1.08); }
//         }
//         @keyframes vs-orb2 {
//           0%,100% { transform: translate(0,0) scale(1); }
//           50%      { transform: translate(-15px,10px) scale(0.92); }
//         }
//         @keyframes vs-sidebar-in {
//           from { opacity:0; transform:translateX(-16px); }
//           to   { opacity:1; transform:translateX(0);     }
//         }
//         @keyframes vs-fade-in { from{opacity:0} to{opacity:1} }

//         /* ─────────────────────────────────────────────────────────────
//            CORE MOBILE LAYOUT FIX
           
//            Desktop  : sidebar is a normal fixed panel at left:0.
//                       Page content must have margin-left: 272px
//                       (handled in the parent layout — we just ensure
//                        the sidebar never leaves the viewport).
           
//            Mobile (≤768px) :
//              • Sidebar is ALWAYS off-screen (translateX(-100%)).
//              • It slides in only when .mobile-open is added.
//              • It should NEVER push page content — it overlays it.
//              • The FAB triggers open/close.
//              • Width is capped at 85vw so it never fills the screen.
//         ───────────────────────────────────────────────────────────── */

//         /* ── Sidebar visibility gated on mount ────────────────────
//            Before JS runs (SSR / first paint), sidebar is hidden on
//            ALL viewports. The mounted flag adds data-ready which
//            triggers the correct visible/hidden state per breakpoint.
//            This prevents the flash-of-open-sidebar on any screen size.
//         ───────────────────────────────────────────────────────── */

//         /* Before mount: always hidden, no transition (prevents flash) */
//         .vs-sidebar-root {
//           transform: translateX(-100%);
//           overflow-x: hidden;
//           /* No transition here — we don't want an animated slide on load */
//         }

//         /* After mount on DESKTOP: slide in with the entry animation */
//         .vs-sidebar-root[data-ready="true"] {
//           transform: translateX(0);
//           animation: vs-sidebar-in 0.3s cubic-bezier(0.22,1,0.36,1);
//           transition: none; /* animation handles it */
//         }

//         /* After mount on MOBILE: stay off-screen, transition on toggle */
//         @media (max-width: 768px) {
//           .vs-sidebar-root[data-ready="true"] {
//             animation: none !important;
//             transform: translateX(-100%) !important;
//             transition: transform 0.3s cubic-bezier(0.22,1,0.36,1),
//                         box-shadow 0.3s cubic-bezier(0.22,1,0.36,1) !important;
//             width: min(272px, 85vw) !important;
//           }
//           .vs-sidebar-root.mobile-open {
//             transform: translateX(0) !important;
//             box-shadow: 4px 0 40px rgba(0,0,0,0.8), 20px 0 60px rgba(0,0,0,0.5) !important;
//           }
//         }

//         /* ── FAB (floating action button) ─────────────────────────── */
//         /* Hidden on desktop */
//         .vs-mobile-fab {
//           display: none;
//         }
//         /* Shown on mobile */
//         @media (max-width: 768px) {
//           .vs-mobile-fab {
//             display: flex;
//             position: fixed;
//             /* Bottom-left, clear of common system UI */
//             bottom: env(safe-area-inset-bottom, 20px);
//             /* Add 20px to the env() safe area */
//             bottom: calc(env(safe-area-inset-bottom, 0px) + 20px);
//             left: 16px;
//             z-index: 1001;
//             width: 48px;
//             height: 48px;
//             border-radius: 14px;
//             background: rgba(10,13,22,0.95);
//             border: 1px solid rgba(124,107,250,0.3);
//             backdrop-filter: blur(16px);
//             color: #a78bfa;
//             font-size: 18px;
//             align-items: center;
//             justify-content: center;
//             box-shadow: 0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(124,107,250,0.1);
//             cursor: pointer;
//             -webkit-tap-highlight-color: transparent;
//             transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
//             /* When sidebar is open, FAB becomes a close button */
//           }
//           .vs-mobile-fab:active {
//             transform: scale(0.9);
//           }
//           /* When open: shift FAB right to clear the sidebar */
//           .vs-mobile-fab.sidebar-open {
//             left: calc(min(272px, 85vw) + 12px);
//             background: rgba(30,12,50,0.97);
//             border-color: rgba(239,68,68,0.35);
//             color: #fca5a5;
//           }
//         }

//         /* ── Backdrop ──────────────────────────────────────────────── */
//         /* Never rendered on desktop (conditional render handles it),
//            but guard with CSS too */
//         .vs-mobile-backdrop {
//           display: none;
//         }
//         @media (max-width: 768px) {
//           .vs-mobile-backdrop {
//             display: block;
//           }
//         }

//         .vs-kbd {
//           font-family: 'Space Mono', monospace;
//           font-size: 9px;
//           padding: 2px 5px;
//           background: rgba(255,255,255,0.04);
//           border: 1px solid rgba(255,255,255,0.1);
//           border-radius: 4px;
//           color: #475569;
//           letter-spacing: 0.04em;
//         }

//         .vs-tab-indicator {
//           position: absolute;
//           bottom: 0; left: 10%; right: 10%;
//           height: 2px; border-radius: 2px 2px 0 0;
//           transition: opacity 0.2s;
//         }
//       `}</style>

//       {/* ── Mobile FAB ─────────────────────────────────────────────────── */}
//       <button
//         className={`vs-mobile-fab${mobileOpen ? " sidebar-open" : ""}`}
//         onClick={() => setMobileOpen(p => !p)}
//         aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
//         aria-expanded={mobileOpen}
//       >
//         {/* Animated hamburger ↔ X */}
//         <span style={{
//           display: "block",
//           fontSize: mobileOpen ? "16px" : "18px",
//           transition: "font-size 0.15s, transform 0.2s",
//           transform: mobileOpen ? "rotate(90deg)" : "rotate(0deg)",
//           lineHeight: 1,
//         }}>
//           {mobileOpen ? "✕" : "☰"}
//         </span>
//       </button>

//       {/* ── Mobile backdrop — tap to close ─────────────────────────────── */}
//       {mobileOpen && (
//         <div
//           className="vs-mobile-backdrop"
//           onClick={() => setMobileOpen(false)}
//           aria-hidden="true"
//           style={{
//             position: "fixed", inset: 0,
//             background: "rgba(0,0,0,0.72)",
//             backdropFilter: "blur(4px)",
//             WebkitBackdropFilter: "blur(4px)",
//             zIndex: 299,
//             animation: "vs-fade-in 0.2s",
//             // Prevent any touch events falling through
//             touchAction: "none",
//           }}
//         />
//       )}

//       {/* ── SIDEBAR SHELL ──────────────────────────────────────────────── */}
//       <aside
//         className={`vs-sidebar-root${mobileOpen ? " mobile-open" : ""}`}
//         data-ready={mounted ? "true" : "false"}
//         aria-label="Navigation sidebar"
//         aria-hidden={!mobileOpen ? undefined : undefined}
//         style={{
//           width: `${W_OPEN}px`,
//           height: "100vh",
//           /* Use dvh where supported for accurate mobile viewport */
//           height: "100dvh",
//           position: "fixed",
//           top: 0,
//           left: 0,
//           background: SURFACE,
//           borderRight: `1px solid ${BORDER}`,
//           backdropFilter: "blur(28px)",
//           WebkitBackdropFilter: "blur(28px)",
//           display: "flex",
//           flexDirection: "column",
//           overflow: "hidden",
//           /* z-index: above backdrop(299) and FAB(1001)? No — sidebar at 300,
//              FAB at 1001 so FAB close button is always tappable */
//           zIndex: 300,
//           boxShadow: "12px 0 60px rgba(0,0,0,0.7), inset -1px 0 0 rgba(255,255,255,0.04)",
//         }}
//       >
//         {/* Ambient orbs */}
//         <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
//           <div style={{
//             position: "absolute", top: "-60px", left: "30%",
//             width: "200px", height: "200px", borderRadius: "50%",
//             background: `radial-gradient(circle, ${section.accent}14 0%, transparent 70%)`,
//             filter: "blur(50px)",
//             animation: "vs-orb1 18s ease-in-out infinite",
//           }} />
//           <div style={{
//             position: "absolute", bottom: "40px", right: "-20px",
//             width: "160px", height: "160px", borderRadius: "50%",
//             background: `radial-gradient(circle, ${section.accent}10 0%, transparent 70%)`,
//             filter: "blur(40px)",
//             animation: "vs-orb2 22s ease-in-out infinite",
//           }} />
//         </div>

//         {/* Dot-grid texture */}
//         <div style={{
//           position: "absolute", inset: 0, pointerEvents: "none",
//           backgroundImage: "radial-gradient(circle, rgba(99,102,241,0.08) 1px, transparent 1px)",
//           backgroundSize: "24px 24px", opacity: 0.5,
//         }} />

//         <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", height: "100%" }}>

//           {/* ── HEADER ─────────────────────────────────────────────────── */}
//           <div style={{
//             padding: "18px 16px 16px",
//             borderBottom: `1px solid ${BORDER}`,
//             display: "flex", alignItems: "center", justifyContent: "space-between",
//             background: "linear-gradient(to bottom, rgba(124,107,250,0.04), transparent)",
//             flexShrink: 0,
//           }}>
//             <a href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
//               <div style={{
//                 width: "34px", height: "34px", borderRadius: "10px",
//                 background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 55%, #a855f7 100%)",
//                 display: "flex", alignItems: "center", justifyContent: "center",
//                 fontSize: "15px",
//                 boxShadow: "0 6px 20px rgba(99,102,241,0.45), inset 0 1px 0 rgba(255,255,255,0.25)",
//                 flexShrink: 0,
//               }}>◈</div>
//               <div>
//                 <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: "14px", letterSpacing: "0.03em", lineHeight: 1 }}>
//                   <span className="vs-logo-text">VisuoSlayer</span>
//                 </div>
//                 <div style={{
//                   fontFamily: SANS, fontSize: "9px", fontWeight: 500,
//                   color: TEXT_DIM, letterSpacing: "0.12em",
//                   textTransform: "uppercase", marginTop: "3px",
//                 }}>
//                   DS &amp; Algo Visualizer
//                 </div>
//               </div>
//             </a>

//             {/* Collapse button — desktop only (mobile uses FAB) */}
//             <button
//               onClick={toggleCollapse}
//               title="Collapse sidebar"
//               style={{
//                 width: "30px", height: "30px", borderRadius: "8px",
//                 background: "rgba(255,255,255,0.04)",
//                 border: `1px solid ${BORDER}`,
//                 color: TEXT_DIM, cursor: "pointer",
//                 display: "flex", alignItems: "center", justifyContent: "center",
//                 fontSize: "13px", fontFamily: MONO,
//                 transition: "all 0.2s cubic-bezier(0.22,1,0.36,1)",
//                 flexShrink: 0, WebkitTapHighlightColor: "transparent",
//               }}
//               onMouseEnter={e => {
//                 e.currentTarget.style.color = ACCENT;
//                 e.currentTarget.style.background = "rgba(124,107,250,0.12)";
//                 e.currentTarget.style.borderColor = "rgba(124,107,250,0.4)";
//                 e.currentTarget.style.boxShadow = "0 0 12px rgba(124,107,250,0.15)";
//               }}
//               onMouseLeave={e => {
//                 e.currentTarget.style.color = TEXT_DIM;
//                 e.currentTarget.style.background = "rgba(255,255,255,0.04)";
//                 e.currentTarget.style.borderColor = BORDER;
//                 e.currentTarget.style.boxShadow = "none";
//               }}
//             >‹</button>
//           </div>

//           {/* ── SEARCH ─────────────────────────────────────────────────── */}
//           <div style={{ padding: "14px 14px 0", flexShrink: 0 }}>
//             <div style={{
//               display: "flex", alignItems: "center", gap: "9px",
//               background: searchFocused ? "rgba(124,107,250,0.07)" : "rgba(255,255,255,0.03)",
//               border: `1px solid ${searchFocused ? "rgba(124,107,250,0.45)" : BORDER}`,
//               borderRadius: "11px",
//               padding: "9px 13px",
//               transition: "all 0.22s cubic-bezier(0.22,1,0.36,1)",
//               boxShadow: searchFocused ? "0 0 0 3px rgba(124,107,250,0.09)" : "none",
//             }}>
//               <span style={{
//                 fontSize: "13px",
//                 color: searchFocused ? ACCENT : TEXT_DIM,
//                 transition: "color 0.2s", flexShrink: 0,
//               }}>⌕</span>
//               <input
//                 ref={searchInputRef}
//                 type="text"
//                 value={search}
//                 onChange={e => setSearch(e.target.value)}
//                 onFocus={() => setSearchFocused(true)}
//                 onBlur={() => setSearchFocused(false)}
//                 placeholder="Search all topics..."
//                 style={{
//                   flex: 1, background: "none", border: "none", outline: "none",
//                   fontFamily: SANS, fontSize: "12px", color: TEXT_PRI,
//                   fontWeight: 500, minWidth: 0,
//                 }}
//               />
//               {!search && <kbd className="vs-kbd">⌘K</kbd>}
//               {search && (
//                 <button
//                   onClick={() => setSearch("")}
//                   style={{
//                     background: "none", border: "none",
//                     color: TEXT_DIM, cursor: "pointer", fontSize: "11px",
//                     padding: "1px 4px", borderRadius: "4px",
//                     transition: "all 0.15s", flexShrink: 0,
//                     WebkitTapHighlightColor: "transparent",
//                   }}
//                   onMouseEnter={e => { e.currentTarget.style.color = TEXT_PRI; e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
//                   onMouseLeave={e => { e.currentTarget.style.color = TEXT_DIM; e.currentTarget.style.background = "none"; }}
//                 >✕</button>
//               )}
//             </div>

//             {isSearching && (
//               <div style={{
//                 fontFamily: SANS, fontSize: "10px", color: TEXT_DIM,
//                 padding: "6px 2px 0",
//                 display: "flex", alignItems: "center", gap: "4px",
//               }}>
//                 <span style={{ color: ACCENT2, fontSize: "9px" }}>◈</span>
//                 Searching across all sections
//               </div>
//             )}
//           </div>

//           {/* ── TABS ───────────────────────────────────────────────────── */}
//           {!isSearching && (
//             <div style={{ padding: "12px 14px 0", display: "flex", gap: "6px", flexShrink: 0 }}>
//               {NAV.map(sec => {
//                 const active = activeTab === sec.id;
//                 return (
//                   <button
//                     key={sec.id}
//                     onClick={() => { setActiveTab(sec.id); }}
//                     style={{
//                       flex: 1,
//                       display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
//                       padding: "9px 8px",
//                       borderRadius: "10px",
//                       background: active
//                         ? `linear-gradient(135deg, ${sec.accent}18, ${sec.accent}0a)`
//                         : "rgba(255,255,255,0.03)",
//                       border: `1px solid ${active ? sec.accent + "45" : "rgba(255,255,255,0.06)"}`,
//                       color: active ? sec.accent : TEXT_DIM,
//                       fontFamily: SANS, fontSize: "11px", fontWeight: 700,
//                       cursor: "pointer",
//                       transition: "all 0.22s cubic-bezier(0.22,1,0.36,1)",
//                       position: "relative", overflow: "hidden",
//                       boxShadow: active ? `0 4px 14px ${sec.glow}` : "none",
//                       letterSpacing: "0.02em",
//                       WebkitTapHighlightColor: "transparent",
//                       minHeight: "40px",
//                     }}
//                     onMouseEnter={e => {
//                       if (!active) {
//                         e.currentTarget.style.color = sec.accent;
//                         e.currentTarget.style.background = `${sec.accent}0d`;
//                         e.currentTarget.style.borderColor = sec.accent + "30";
//                       }
//                     }}
//                     onMouseLeave={e => {
//                       if (!active) {
//                         e.currentTarget.style.color = TEXT_DIM;
//                         e.currentTarget.style.background = "rgba(255,255,255,0.03)";
//                         e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
//                       }
//                     }}
//                   >
//                     {active && (
//                       <div style={{
//                         position: "absolute", inset: 0,
//                         background: `linear-gradient(90deg, transparent, ${sec.accent}0d, transparent)`,
//                         transform: "translateX(-100%)",
//                         animation: "vs-progress 2.5s ease-in-out infinite",
//                       }} />
//                     )}
//                     <span style={{ fontSize: "13px", position: "relative", zIndex: 1 }}>{sec.icon}</span>
//                     <span style={{ position: "relative", zIndex: 1 }}>
//                       {sec.id === "ds" ? "Structures" : "Algorithms"}
//                     </span>
//                     {active && (
//                       <span className="vs-tab-indicator" style={{ background: `linear-gradient(90deg, transparent, ${sec.accent}, transparent)` }} />
//                     )}
//                   </button>
//                 );
//               })}
//             </div>
//           )}

//           {/* Section label + count */}
//           {!isSearching && (
//             <div style={{
//               padding: "12px 16px 8px",
//               display: "flex", alignItems: "center", justifyContent: "space-between",
//               flexShrink: 0,
//             }}>
//               <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
//                 <span style={{
//                   width: "5px", height: "5px", borderRadius: "50%",
//                   background: section.accent, boxShadow: `0 0 8px ${section.accent}`,
//                   display: "inline-block",
//                 }} />
//                 <span style={{
//                   fontFamily: SANS, fontSize: "10px", fontWeight: 700,
//                   color: TEXT_SEC, letterSpacing: "0.1em", textTransform: "uppercase",
//                 }}>{section.label}</span>
//               </div>
//               <span style={{
//                 fontFamily: MONO, fontSize: "9px", color: TEXT_DIM,
//                 background: "rgba(255,255,255,0.04)",
//                 padding: "2px 8px", borderRadius: "6px",
//                 border: `1px solid ${BORDER}`,
//               }}>
//                 {section.groups.reduce((a, g) => a + g.items.length, 0)} topics
//               </span>
//             </div>
//           )}

//           {/* Search results count */}
//           {isSearching && (
//             <div style={{
//               padding: "10px 16px 6px",
//               display: "flex", alignItems: "center", justifyContent: "space-between",
//               flexShrink: 0,
//             }}>
//               <span style={{
//                 fontFamily: SANS, fontSize: "10px", fontWeight: 700,
//                 color: TEXT_SEC, letterSpacing: "0.1em", textTransform: "uppercase",
//               }}>Results</span>
//               <span style={{
//                 fontFamily: MONO, fontSize: "9px", color: ACCENT2,
//                 background: "rgba(124,107,250,0.1)",
//                 padding: "2px 8px", borderRadius: "6px",
//                 border: "1px solid rgba(124,107,250,0.25)",
//               }}>
//                 {globalResults.reduce((a, s) => a + s.groups.reduce((b, g) => b + g.items.length, 0), 0)} found
//               </span>
//             </div>
//           )}

//           {/* ── NAV TREE ───────────────────────────────────────────────── */}
//           <nav
//             className="vs-scroll"
//             style={{
//               flex: 1, overflowY: "auto", overflowX: "hidden",
//               padding: "0 10px 16px",
//               display: "flex", flexDirection: "column", gap: "3px",
//               WebkitOverflowScrolling: "touch",
//               /* Extra bottom padding so last item isn't hidden behind FAB on mobile */
//               paddingBottom: "72px",
//             }}
//           >
//             {isSearching
//               ? globalResults.length > 0
//                 ? renderGroups(globalResults)
//                 : (
//                   <div style={{ padding: "48px 20px", textAlign: "center", color: TEXT_DIM }}>
//                     <div style={{ fontSize: "28px", opacity: 0.2, marginBottom: "12px" }}>⌕</div>
//                     <p style={{ fontFamily: SANS, fontSize: "12px", fontWeight: 500, marginBottom: "16px" }}>
//                       No results for &ldquo;{search}&rdquo;
//                     </p>
//                     <button
//                       onClick={() => setSearch("")}
//                       style={{
//                         fontFamily: SANS, fontSize: "11px", fontWeight: 600,
//                         background: "rgba(124,107,250,0.15)",
//                         border: "1px solid rgba(124,107,250,0.35)",
//                         borderRadius: "8px", padding: "7px 16px",
//                         color: ACCENT2, cursor: "pointer", transition: "all 0.2s",
//                         WebkitTapHighlightColor: "transparent",
//                       }}
//                     >
//                       Clear search
//                     </button>
//                   </div>
//                 )
//               : renderGroups([{ ...section, groups: tabGroups }])
//             }
//           </nav>

//           {/* ── FOOTER ─────────────────────────────────────────────────── */}
//           <div style={{
//             borderTop: `1px solid ${BORDER}`,
//             padding: "12px 16px",
//             display: "flex", alignItems: "center", justifyContent: "space-between",
//             background: "linear-gradient(to top, rgba(124,107,250,0.03), transparent)",
//             flexShrink: 0,
//           }}>
//             <div>
//               <div style={{
//                 fontFamily: MONO, fontSize: "9px", color: TEXT_DIM,
//                 letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.5,
//               }}>VisuoSlayer</div>
//               <div style={{ fontFamily: SANS, fontSize: "10px", color: TEXT_DIM, marginTop: "2px" }}>v1.0</div>
//             </div>
//             <a
//               href="/"
//               style={{
//                 display: "flex", alignItems: "center", gap: "5px",
//                 fontSize: "11px", fontWeight: 600,
//                 color: TEXT_DIM, textDecoration: "none",
//                 padding: "8px 11px", borderRadius: "8px",
//                 background: "rgba(255,255,255,0.03)",
//                 border: `1px solid ${BORDER}`,
//                 transition: "all 0.2s cubic-bezier(0.22,1,0.36,1)",
//                 fontFamily: SANS, WebkitTapHighlightColor: "transparent",
//                 minHeight: "36px",
//               }}
//               onMouseEnter={e => {
//                 e.currentTarget.style.color = ACCENT;
//                 e.currentTarget.style.borderColor = "rgba(124,107,250,0.4)";
//                 e.currentTarget.style.background = "rgba(124,107,250,0.08)";
//                 e.currentTarget.style.transform = "translateY(-1px)";
//               }}
//               onMouseLeave={e => {
//                 e.currentTarget.style.color = TEXT_DIM;
//                 e.currentTarget.style.borderColor = BORDER;
//                 e.currentTarget.style.background = "rgba(255,255,255,0.03)";
//                 e.currentTarget.style.transform = "translateY(0)";
//               }}
//             >
//               <span style={{ fontSize: "12px" }}>⌂</span>
//               <span>Home</span>
//             </a>
//           </div>

//         </div>
//       </aside>
//     </>
//   );
// }
"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSidebar } from "./sbc";

// ─────────────────────────────────────────────────────────────────────────────
// DATA  (unchanged)
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
  const [mounted,       setMounted]       = useState(false);
  // ── NEW: track whether chatbot is open so we hide the FAB ──
  const [chatbotOpen,   setChatbotOpen]   = useState(false);
  const searchInputRef = useRef(null);

  const section    = NAV.find(s => s.id === activeTab) ?? NAV[0];
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

  useEffect(() => { setMobileOpen(false); }, [pathname]);
  useEffect(() => { setMounted(true); }, []);

  // ── Listen for chatbot open/close events ──
  useEffect(() => {
    const handler = (e) => {
      setChatbotOpen(e.detail?.open ?? false);
      // If chatbot opens, also close the sidebar on mobile
      if (e.detail?.open) setMobileOpen(false);
    };
    window.addEventListener("chatbot-open-change", handler);
    // Also sync on mount in case chatbot was already open
    if (typeof window !== "undefined") {
      setChatbotOpen(!!window.__chatbotOpen);
    }
    return () => window.removeEventListener("chatbot-open-change", handler);
  }, []);

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

  useEffect(() => {
    if (!globalResults) return;
    const next = { ...openGroups };
    globalResults.forEach(sec => {
      sec.groups.forEach((_, i) => { next[`${sec.id}-${i}`] = true; });
    });
    setOpenGroups(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const tabGroups = section.groups;
  const W_OPEN = 272;

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

  const renderGroups = (sections) =>
    sections.map((sec) => {
      const secData = NAV.find(s => s.id === sec.id);
      return (
        <div key={sec.id}>
          {isSearching && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 11px 4px" }}>
              <span style={{ fontSize: "9px", fontWeight: 700, fontFamily: SANS, letterSpacing: "0.1em", textTransform: "uppercase", color: secData?.accent ?? TEXT_DIM }}>{sec.label}</span>
              <div style={{ flex: 1, height: "1px", background: `${secData?.accent ?? TEXT_DIM}22` }} />
            </div>
          )}
          {sec.groups.map((group, gi) => {
            const realGi = NAV.find(s => s.id === sec.id)?.groups.findIndex(g => g.label === group.label) ?? gi;
            const groupKey = `${sec.id}-${realGi}`;
            const isOpen   = isSearching ? true : (openGroups[groupKey] !== false);

            return (
              <div key={group.label} style={{ marginBottom: "4px" }}>
                <button
                  onClick={() => !isSearching && toggleGroup(groupKey)}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: "8px", padding: "9px 11px", borderRadius: "9px", background: isOpen ? `linear-gradient(135deg, ${group.color}10, ${group.color}06)` : "transparent", border: `1px solid ${isOpen ? group.color + "30" : "transparent"}`, color: isOpen ? group.color : TEXT_DIM, fontFamily: SANS, fontSize: "11px", fontWeight: 700, cursor: isSearching ? "default" : "pointer", transition: "all 0.2s cubic-bezier(0.22,1,0.36,1)", letterSpacing: "0.03em" }}
                  onMouseEnter={e => { if (!isOpen && !isSearching) { e.currentTarget.style.background = `${group.color}08`; e.currentTarget.style.color = group.color; e.currentTarget.style.borderColor = group.color + "20"; }}}
                  onMouseLeave={e => { if (!isOpen && !isSearching) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = TEXT_DIM; e.currentTarget.style.borderColor = "transparent"; }}}
                >
                  <span style={{ width: "5px", height: "5px", borderRadius: "50%", flexShrink: 0, background: isOpen ? group.color : TEXT_DIM, boxShadow: isOpen ? `0 0 8px ${group.color}` : "none", transition: "all 0.2s" }} />
                  <span style={{ fontFamily: MONO, fontSize: "11px", opacity: 0.7, flexShrink: 0 }}>{group.icon}</span>
                  <span style={{ flex: 1, textAlign: "left" }}>{group.label}</span>
                  <span style={{ fontFamily: MONO, fontSize: "9px", fontWeight: 700, padding: "1px 7px", borderRadius: "5px", background: isOpen ? `${group.color}22` : "rgba(255,255,255,0.05)", color: isOpen ? group.color : TEXT_DIM, border: `1px solid ${isOpen ? group.color + "30" : "rgba(255,255,255,0.07)"}`, transition: "all 0.2s" }}>{group.items.length}</span>
                  {!isSearching && <span style={{ fontSize: "9px", color: isOpen ? group.color : TEXT_DIM, transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.25s cubic-bezier(0.22,1,0.36,1), color 0.2s", flexShrink: 0 }}>▼</span>}
                </button>

                {isOpen && (
                  <div className="vs-group-open" style={{ marginLeft: "16px", paddingLeft: "10px", borderLeft: `1px solid ${group.color}18`, marginTop: "3px" }}>
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
                          style={{ animationDelay: `${idx * 0.025}s`, width: "100%", display: "flex", alignItems: "center", gap: "8px", padding: "10px 10px", borderRadius: "9px", margin: "2px 0", background: isActive ? `linear-gradient(135deg, ${group.color}18, ${group.color}0c)` : isHov && available ? `${group.color}0e` : "transparent", border: `1px solid ${isActive ? group.color + "45" : isHov && available ? group.color + "25" : "transparent"}`, cursor: available ? "pointer" : "default", opacity: available ? 1 : 0.38, transition: "all 0.18s cubic-bezier(0.22,1,0.36,1)", position: "relative", overflow: "hidden", boxShadow: isActive ? `0 3px 10px ${group.color}22, inset 0 1px 0 rgba(255,255,255,0.06)` : "none", WebkitTapHighlightColor: "transparent", minHeight: "44px" }}
                        >
                          {isActive && (
                            <>
                              <div style={{ position: "absolute", left: 0, top: "20%", bottom: "20%", width: "2px", background: `linear-gradient(to bottom, transparent, ${group.color}, transparent)`, borderRadius: "0 2px 2px 0", boxShadow: `0 0 6px ${group.color}` }} />
                              <div style={{ position: "absolute", inset: 0, background: `linear-gradient(90deg, transparent, ${group.color}07, transparent)`, transform: "translateX(-100%)", animation: "vs-progress 3s ease-in-out infinite" }} />
                            </>
                          )}
                          <span style={{ width: "26px", height: "26px", borderRadius: "7px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontFamily: MONO, flexShrink: 0, color: isActive || isHov ? group.color : TEXT_DIM, background: isActive ? `${group.color}28` : isHov ? `${group.color}14` : "rgba(255,255,255,0.04)", border: `1px solid ${isActive ? group.color + "45" : isHov ? group.color + "25" : "rgba(255,255,255,0.07)"}`, transition: "all 0.18s", position: "relative", zIndex: 1 }}>{item.icon}</span>
                          <div style={{ flex: 1, textAlign: "left", position: "relative", zIndex: 1, minWidth: 0 }}>
                            <div style={{ fontFamily: SANS, fontSize: "12px", fontWeight: isActive ? 700 : 500, color: isActive ? TEXT_PRI : TEXT_SEC, transition: "all 0.18s", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.label}</div>
                            {(isActive || isHov) && available && <div style={{ fontFamily: MONO, fontSize: "9px", color: group.color, opacity: 0.75, marginTop: "1px" }}>{item.complexity}</div>}
                          </div>
                          {!available && <span style={{ fontSize: "8px", color: TEXT_DIM, fontWeight: 700, letterSpacing: "0.06em", fontFamily: SANS, background: "rgba(255,255,255,0.04)", padding: "2px 6px", borderRadius: "4px", border: `1px solid ${BORDER}`, flexShrink: 0 }}>SOON</span>}
                          {(isActive || isHov) && available && tc && <span style={{ fontSize: "8px", fontWeight: 700, fontFamily: MONO, padding: "2px 7px", borderRadius: "5px", background: tc.bg, color: tc.text, border: `1px solid ${tc.border}`, flexShrink: 0, position: "relative", zIndex: 1 }}>{item.tag}</span>}
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

  if (!mounted) return null;

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
          .vs-collapse-btn { animation: vs-arrow-glow 3s ease-in-out infinite; }
          @media (max-width: 768px) { .vs-collapse-btn-wrap { display: none !important; } }
        `}</style>
        <div className="vs-collapse-btn-wrap" style={{ position: "fixed", top: "50%", left: 0, transform: "translateY(-50%)", zIndex: 400 }}>
          <button
            className="vs-collapse-btn"
            onClick={toggleCollapse}
            onMouseEnter={() => setToggleHovered(true)}
            onMouseLeave={() => setToggleHovered(false)}
            title="Expand sidebar"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "28px", height: "52px", borderRadius: "0 12px 12px 0", background: toggleHovered ? "linear-gradient(180deg, #6d5ce8 0%, #9b7ef8 100%)" : "linear-gradient(180deg, rgba(18,15,38,0.97) 0%, rgba(12,10,28,0.97) 100%)", border: "1px solid", borderLeft: "none", borderColor: toggleHovered ? "rgba(155,126,248,0.65)" : "rgba(124,107,250,0.3)", color: toggleHovered ? "#fff" : ACCENT2, cursor: "pointer", fontSize: "14px", fontFamily: MONO, backdropFilter: "blur(16px)", transition: "background 0.22s, border-color 0.22s, color 0.22s", outline: "none", position: "relative", overflow: "hidden" }}
          >
            <span style={{ display: "block", fontSize: "13px", lineHeight: 1, transition: "transform 0.22s cubic-bezier(0.22,1,0.36,1)", transform: toggleHovered ? "translateX(2px)" : "translateX(0)", position: "relative", zIndex: 1 }}>›</span>
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
        *, *::before, *::after { box-sizing: border-box; }

        .vs-scroll::-webkit-scrollbar { width: 3px; }
        .vs-scroll::-webkit-scrollbar-track { background: transparent; }
        .vs-scroll::-webkit-scrollbar-thumb { background: rgba(124,107,250,0.25); border-radius: 10px; }
        .vs-scroll::-webkit-scrollbar-thumb:hover { background: rgba(124,107,250,0.45); }

        @keyframes vs-shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        .vs-logo-text {
          background: linear-gradient(90deg, #818cf8 0%, #c084fc 25%, #e879f9 50%, #c084fc 75%, #818cf8 100%);
          background-size: 200% auto;
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text; animation: vs-shimmer 5s ease-in-out infinite;
        }
        @keyframes vs-pulse-border {
          0%,100% { border-color: rgba(124,107,250,0.4); box-shadow: 0 0 0 0 rgba(124,107,250,0); }
          50%      { border-color: rgba(167,139,250,0.6); box-shadow: 0 0 12px rgba(124,107,250,0.2); }
        }
        .vs-active-item { animation: vs-pulse-border 2.5s ease-in-out infinite; }
        @keyframes vs-slide-down { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
        .vs-group-open { animation: vs-slide-down 0.22s cubic-bezier(0.22,1,0.36,1); }
        @keyframes vs-item-in { from{opacity:0;transform:translateX(-6px)} to{opacity:1;transform:translateX(0)} }
        .vs-item-in { animation: vs-item-in 0.2s cubic-bezier(0.22,1,0.36,1) both; }
        @keyframes vs-progress { from{transform:translateX(-100%)} to{transform:translateX(400%)} }
        @keyframes vs-orb1 {
          0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(20px,-15px) scale(1.08)}
        }
        @keyframes vs-orb2 {
          0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-15px,10px) scale(0.92)}
        }
        @keyframes vs-sidebar-in { from{opacity:0;transform:translateX(-16px)} to{opacity:1;transform:translateX(0)} }
        @keyframes vs-fade-in { from{opacity:0} to{opacity:1} }

        .vs-sidebar-root {
          transform: translateX(-100%);
          overflow-x: hidden;
        }
        .vs-sidebar-root[data-ready="true"] {
          transform: translateX(0);
          animation: vs-sidebar-in 0.3s cubic-bezier(0.22,1,0.36,1);
          transition: none;
        }

        @media (max-width: 768px) {
          .vs-sidebar-root[data-ready="true"] {
            animation: none !important;
            transform: translateX(-100%) !important;
            transition: transform 0.3s cubic-bezier(0.22,1,0.36,1),
                        box-shadow 0.3s cubic-bezier(0.22,1,0.36,1) !important;
            width: min(272px, 85vw) !important;
          }
          .vs-sidebar-root.mobile-open {
            transform: translateX(0) !important;
            box-shadow: 4px 0 40px rgba(0,0,0,0.8), 20px 0 60px rgba(0,0,0,0.5) !important;
          }
        }

        /* ── Mobile FAB ──────────────────────────────────────────────────
           Hidden on desktop.
           On mobile: shown normally, BUT hidden when chatbot is open.
           We use both:
             1. The React state (chatbotOpen) via inline style
             2. The CSS body attribute (data-chatbot-open) as a fallback
                — this is injected by ChatBot.jsx and handles the instant
                  CSS suppression even before React re-renders.
        ────────────────────────────────────────────────────────────── */
        .vs-mobile-fab { display: none; }

        @media (max-width: 768px) {
          .vs-mobile-fab {
            display: flex;
            position: fixed;
            bottom: calc(env(safe-area-inset-bottom, 0px) + 20px);
            left: 16px;
            z-index: 1001;
            width: 48px; height: 48px;
            border-radius: 14px;
            background: rgba(10,13,22,0.95);
            border: 1px solid rgba(124,107,250,0.3);
            backdrop-filter: blur(16px);
            color: #a78bfa; font-size: 18px;
            align-items: center; justify-content: center;
            box-shadow: 0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(124,107,250,0.1);
            cursor: pointer;
            -webkit-tap-highlight-color: transparent;
            transition: background 0.2s, transform 0.15s, box-shadow 0.2s,
                        opacity 0.2s, visibility 0.2s;
          }
          .vs-mobile-fab:active { transform: scale(0.9); }
          .vs-mobile-fab.sidebar-open {
            left: calc(min(272px, 85vw) + 12px);
            background: rgba(30,12,50,0.97);
            border-color: rgba(239,68,68,0.35);
            color: #fca5a5;
          }

          /*
           * CSS-level suppression: when <body data-chatbot-open="true"> is set
           * by ChatBot.jsx, hide and disable the FAB immediately.
           * This is the primary mechanism — zero JS round-trip needed.
           */
          body[data-chatbot-open="true"] .vs-mobile-fab {
            opacity: 0 !important;
            pointer-events: none !important;
            visibility: hidden !important;
            transform: scale(0.8) !important;
          }
        }

        .vs-mobile-backdrop { display: none; }
        @media (max-width: 768px) {
          .vs-mobile-backdrop { display: block; }
          /* Backdrop also hidden when chatbot open */
          body[data-chatbot-open="true"] .vs-mobile-backdrop {
            display: none !important;
          }
        }

        .vs-kbd {
          font-family: 'Space Mono', monospace; font-size: 9px;
          padding: 2px 5px; background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1); border-radius: 4px;
          color: #475569; letter-spacing: 0.04em;
        }
        .vs-tab-indicator {
          position: absolute; bottom: 0; left: 10%; right: 10%;
          height: 2px; border-radius: 2px 2px 0 0; transition: opacity 0.2s;
        }
      `}</style>

      {/* ── Mobile FAB ──────────────────────────────────────────────────── */}
      {/* Also hidden via React state (chatbotOpen) as a second layer */}
      <button
        className={`vs-mobile-fab${mobileOpen ? " sidebar-open" : ""}`}
        onClick={() => setMobileOpen(p => !p)}
        aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={mobileOpen}
        // React-level hide: in addition to CSS body attribute suppression
        style={{
          opacity: chatbotOpen ? 0 : undefined,
          pointerEvents: chatbotOpen ? "none" : undefined,
          visibility: chatbotOpen ? "hidden" : undefined,
        }}
      >
        <span style={{ display: "block", fontSize: mobileOpen ? "16px" : "18px", transition: "font-size 0.15s, transform 0.2s", transform: mobileOpen ? "rotate(90deg)" : "rotate(0deg)", lineHeight: 1 }}>
          {mobileOpen ? "✕" : "☰"}
        </span>
      </button>

      {/* ── Mobile backdrop — tap to close (also hidden when chatbot open) ── */}
      {mobileOpen && !chatbotOpen && (
        <div
          className="vs-mobile-backdrop"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.72)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)", zIndex: 299, animation: "vs-fade-in 0.2s", touchAction: "none" }}
        />
      )}

      {/* ── SIDEBAR SHELL ──────────────────────────────────────────────── */}
      <aside
        className={`vs-sidebar-root${mobileOpen ? " mobile-open" : ""}`}
        data-ready={mounted ? "true" : "false"}
        aria-label="Navigation sidebar"
        style={{ width: `${W_OPEN}px`, height: "100vh", height: "100dvh", position: "fixed", top: 0, left: 0, background: SURFACE, borderRight: `1px solid ${BORDER}`, backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)", display: "flex", flexDirection: "column", overflow: "hidden", zIndex: 300, boxShadow: "12px 0 60px rgba(0,0,0,0.7), inset -1px 0 0 rgba(255,255,255,0.04)" }}
      >
        {/* Ambient orbs */}
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
          <div style={{ position: "absolute", top: "-60px", left: "30%", width: "200px", height: "200px", borderRadius: "50%", background: `radial-gradient(circle, ${section.accent}14 0%, transparent 70%)`, filter: "blur(50px)", animation: "vs-orb1 18s ease-in-out infinite" }} />
          <div style={{ position: "absolute", bottom: "40px", right: "-20px", width: "160px", height: "160px", borderRadius: "50%", background: `radial-gradient(circle, ${section.accent}10 0%, transparent 70%)`, filter: "blur(40px)", animation: "vs-orb2 22s ease-in-out infinite" }} />
        </div>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: "radial-gradient(circle, rgba(99,102,241,0.08) 1px, transparent 1px)", backgroundSize: "24px 24px", opacity: 0.5 }} />

        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", height: "100%" }}>

          {/* ── HEADER ─────────────────────────────────────────────────── */}
          <div style={{ padding: "18px 16px 16px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: "linear-gradient(to bottom, rgba(124,107,250,0.04), transparent)", flexShrink: 0 }}>
            <a href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
              <div style={{ width: "34px", height: "34px", borderRadius: "10px", background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 55%, #a855f7 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", boxShadow: "0 6px 20px rgba(99,102,241,0.45), inset 0 1px 0 rgba(255,255,255,0.25)", flexShrink: 0 }}>◈</div>
              <div>
                <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: "14px", letterSpacing: "0.03em", lineHeight: 1 }}><span className="vs-logo-text">VisuoSlayer</span></div>
                <div style={{ fontFamily: SANS, fontSize: "9px", fontWeight: 500, color: TEXT_DIM, letterSpacing: "0.12em", textTransform: "uppercase", marginTop: "3px" }}>DS &amp; Algo Visualizer</div>
              </div>
            </a>
            <button onClick={toggleCollapse} title="Collapse sidebar" style={{ width: "30px", height: "30px", borderRadius: "8px", background: "rgba(255,255,255,0.04)", border: `1px solid ${BORDER}`, color: TEXT_DIM, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontFamily: MONO, transition: "all 0.2s cubic-bezier(0.22,1,0.36,1)", flexShrink: 0, WebkitTapHighlightColor: "transparent" }}
              onMouseEnter={e => { e.currentTarget.style.color = ACCENT; e.currentTarget.style.background = "rgba(124,107,250,0.12)"; e.currentTarget.style.borderColor = "rgba(124,107,250,0.4)"; e.currentTarget.style.boxShadow = "0 0 12px rgba(124,107,250,0.15)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = TEXT_DIM; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.boxShadow = "none"; }}>‹</button>
          </div>

          {/* ── SEARCH ─────────────────────────────────────────────────── */}
          <div style={{ padding: "14px 14px 0", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "9px", background: searchFocused ? "rgba(124,107,250,0.07)" : "rgba(255,255,255,0.03)", border: `1px solid ${searchFocused ? "rgba(124,107,250,0.45)" : BORDER}`, borderRadius: "11px", padding: "9px 13px", transition: "all 0.22s cubic-bezier(0.22,1,0.36,1)", boxShadow: searchFocused ? "0 0 0 3px rgba(124,107,250,0.09)" : "none" }}>
              <span style={{ fontSize: "13px", color: searchFocused ? ACCENT : TEXT_DIM, transition: "color 0.2s", flexShrink: 0 }}>⌕</span>
              <input ref={searchInputRef} type="text" value={search} onChange={e => setSearch(e.target.value)} onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)} placeholder="Search all topics..." style={{ flex: 1, background: "none", border: "none", outline: "none", fontFamily: SANS, fontSize: "12px", color: TEXT_PRI, fontWeight: 500, minWidth: 0 }}/>
              {!search && <kbd className="vs-kbd">⌘K</kbd>}
              {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", color: TEXT_DIM, cursor: "pointer", fontSize: "11px", padding: "1px 4px", borderRadius: "4px", transition: "all 0.15s", flexShrink: 0, WebkitTapHighlightColor: "transparent" }} onMouseEnter={e => { e.currentTarget.style.color = TEXT_PRI; e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }} onMouseLeave={e => { e.currentTarget.style.color = TEXT_DIM; e.currentTarget.style.background = "none"; }}>✕</button>}
            </div>
            {isSearching && <div style={{ fontFamily: SANS, fontSize: "10px", color: TEXT_DIM, padding: "6px 2px 0", display: "flex", alignItems: "center", gap: "4px" }}><span style={{ color: ACCENT2, fontSize: "9px" }}>◈</span>Searching across all sections</div>}
          </div>

          {/* ── TABS ───────────────────────────────────────────────────── */}
          {!isSearching && (
            <div style={{ padding: "12px 14px 0", display: "flex", gap: "6px", flexShrink: 0 }}>
              {NAV.map(sec => {
                const active = activeTab === sec.id;
                return (
                  <button key={sec.id} onClick={() => setActiveTab(sec.id)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "9px 8px", borderRadius: "10px", background: active ? `linear-gradient(135deg, ${sec.accent}18, ${sec.accent}0a)` : "rgba(255,255,255,0.03)", border: `1px solid ${active ? sec.accent + "45" : "rgba(255,255,255,0.06)"}`, color: active ? sec.accent : TEXT_DIM, fontFamily: SANS, fontSize: "11px", fontWeight: 700, cursor: "pointer", transition: "all 0.22s cubic-bezier(0.22,1,0.36,1)", position: "relative", overflow: "hidden", boxShadow: active ? `0 4px 14px ${sec.glow}` : "none", letterSpacing: "0.02em", WebkitTapHighlightColor: "transparent", minHeight: "40px" }}
                    onMouseEnter={e => { if (!active) { e.currentTarget.style.color = sec.accent; e.currentTarget.style.background = `${sec.accent}0d`; e.currentTarget.style.borderColor = sec.accent + "30"; }}}
                    onMouseLeave={e => { if (!active) { e.currentTarget.style.color = TEXT_DIM; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}}>
                    {active && <div style={{ position: "absolute", inset: 0, background: `linear-gradient(90deg, transparent, ${sec.accent}0d, transparent)`, transform: "translateX(-100%)", animation: "vs-progress 2.5s ease-in-out infinite" }} />}
                    <span style={{ fontSize: "13px", position: "relative", zIndex: 1 }}>{sec.icon}</span>
                    <span style={{ position: "relative", zIndex: 1 }}>{sec.id === "ds" ? "Structures" : "Algorithms"}</span>
                    {active && <span className="vs-tab-indicator" style={{ background: `linear-gradient(90deg, transparent, ${sec.accent}, transparent)` }} />}
                  </button>
                );
              })}
            </div>
          )}

          {/* Section label */}
          {!isSearching && (
            <div style={{ padding: "12px 16px 8px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: section.accent, boxShadow: `0 0 8px ${section.accent}`, display: "inline-block" }} />
                <span style={{ fontFamily: SANS, fontSize: "10px", fontWeight: 700, color: TEXT_SEC, letterSpacing: "0.1em", textTransform: "uppercase" }}>{section.label}</span>
              </div>
              <span style={{ fontFamily: MONO, fontSize: "9px", color: TEXT_DIM, background: "rgba(255,255,255,0.04)", padding: "2px 8px", borderRadius: "6px", border: `1px solid ${BORDER}` }}>{section.groups.reduce((a, g) => a + g.items.length, 0)} topics</span>
            </div>
          )}

          {/* Search results count */}
          {isSearching && (
            <div style={{ padding: "10px 16px 6px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
              <span style={{ fontFamily: SANS, fontSize: "10px", fontWeight: 700, color: TEXT_SEC, letterSpacing: "0.1em", textTransform: "uppercase" }}>Results</span>
              <span style={{ fontFamily: MONO, fontSize: "9px", color: ACCENT2, background: "rgba(124,107,250,0.1)", padding: "2px 8px", borderRadius: "6px", border: "1px solid rgba(124,107,250,0.25)" }}>{globalResults.reduce((a, s) => a + s.groups.reduce((b, g) => b + g.items.length, 0), 0)} found</span>
            </div>
          )}

          {/* ── NAV TREE ───────────────────────────────────────────────── */}
          <nav className="vs-scroll" style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "0 10px 16px", display: "flex", flexDirection: "column", gap: "3px", WebkitOverflowScrolling: "touch", paddingBottom: "72px" }}>
            {isSearching
              ? globalResults.length > 0
                ? renderGroups(globalResults)
                : (
                  <div style={{ padding: "48px 20px", textAlign: "center", color: TEXT_DIM }}>
                    <div style={{ fontSize: "28px", opacity: 0.2, marginBottom: "12px" }}>⌕</div>
                    <p style={{ fontFamily: SANS, fontSize: "12px", fontWeight: 500, marginBottom: "16px" }}>No results for &ldquo;{search}&rdquo;</p>
                    <button onClick={() => setSearch("")} style={{ fontFamily: SANS, fontSize: "11px", fontWeight: 600, background: "rgba(124,107,250,0.15)", border: "1px solid rgba(124,107,250,0.35)", borderRadius: "8px", padding: "7px 16px", color: ACCENT2, cursor: "pointer", transition: "all 0.2s", WebkitTapHighlightColor: "transparent" }}>Clear search</button>
                  </div>
                )
              : renderGroups([{ ...section, groups: tabGroups }])
            }
          </nav>

          {/* ── FOOTER ─────────────────────────────────────────────────── */}
          <div style={{ borderTop: `1px solid ${BORDER}`, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "linear-gradient(to top, rgba(124,107,250,0.03), transparent)", flexShrink: 0 }}>
            <div>
              <div style={{ fontFamily: MONO, fontSize: "9px", color: TEXT_DIM, letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.5 }}>VisuoSlayer</div>
              <div style={{ fontFamily: SANS, fontSize: "10px", color: TEXT_DIM, marginTop: "2px" }}>v1.0</div>
            </div>
            <a href="/" style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "11px", fontWeight: 600, color: TEXT_DIM, textDecoration: "none", padding: "8px 11px", borderRadius: "8px", background: "rgba(255,255,255,0.03)", border: `1px solid ${BORDER}`, transition: "all 0.2s cubic-bezier(0.22,1,0.36,1)", fontFamily: SANS, WebkitTapHighlightColor: "transparent", minHeight: "36px" }}
              onMouseEnter={e => { e.currentTarget.style.color = ACCENT; e.currentTarget.style.borderColor = "rgba(124,107,250,0.4)"; e.currentTarget.style.background = "rgba(124,107,250,0.08)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = TEXT_DIM; e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.transform = "translateY(0)"; }}>
              <span style={{ fontSize: "12px" }}>⌂</span>
              <span>Home</span>
            </a>
          </div>

        </div>
      </aside>
    </>
  );
}