// 'use client'
// /* eslint-disable react-hooks/refs */
// import { useState, useRef, useEffect } from 'react'
// import { motion, AnimatePresence } from 'framer-motion'
// import Navbar from '@/comps/navbar'

// // ─── BST pure-data (plain objects, no class — avoids structuredClone issues) ──

// function mkNode(val) { return { val, left: null, right: null } }

// function insert(node, val) {
//   if (!node) return mkNode(val)
//   if (val < node.val) return { ...node, left:  insert(node.left,  val) }
//   if (val > node.val) return { ...node, right: insert(node.right, val) }
//   return node   // duplicate — ignore
// }

// function minNode(node) { return node.left ? minNode(node.left) : node }

// function remove(node, val) {
//   if (!node) return null
//   if (val < node.val) return { ...node, left:  remove(node.left,  val) }
//   if (val > node.val) return { ...node, right: remove(node.right, val) }
//   if (!node.left)  return node.right
//   if (!node.right) return node.left
//   const m = minNode(node.right)
//   return { ...node, val: m.val, right: remove(node.right, m.val) }
// }

// function searchPath(node, val, path = []) {
//   if (!node) return { path, found: false }
//   path.push(node.val)
//   if (val === node.val) return { path, found: true }
//   return val < node.val
//     ? searchPath(node.left,  val, path)
//     : searchPath(node.right, val, path)
// }

// function inorder(node, out = [])   { if (!node) return out; inorder(node.left, out); out.push(node.val); inorder(node.right, out); return out }
// function preorder(node, out = [])  { if (!node) return out; out.push(node.val); preorder(node.left, out); preorder(node.right, out); return out }
// function postorder(node, out = []) { if (!node) return out; postorder(node.left, out); postorder(node.right, out); out.push(node.val); return out }
// function treeSize(node)            { return node ? 1 + treeSize(node.left) + treeSize(node.right) : 0 }
// function treeHeight(node)          { return node ? 1 + Math.max(treeHeight(node.left), treeHeight(node.right)) : 0 }

// // ─── Layout: assign pixel coords to every node ───────────────────────────────
// // Returns { nodes: [{val,x,y,id}], edges: [{x1,y1,x2,y2,key}] }
// function layout(root, W, H) {
//   const nodes = [], edges = []
//   if (!root) return { nodes, edges }

//   const LEVEL_H = 70
//   const R       = 20
//   const PAD     = R + 8

//   function subtreeSize(n) { return n ? 1 + subtreeSize(n.left) + subtreeSize(n.right) : 0 }

//   let nodeId = 0
//   function place(node, xMin, xMax, depth) {
//     if (!node) return null
//     const ls   = subtreeSize(node.left)
//     const tot  = subtreeSize(node)
//     const x    = xMin + (ls + 0.5) * (xMax - xMin) / tot
//     const y    = PAD + depth * LEVEL_H
//     const id   = nodeId++
//     node._x = x; node._y = y; node._id = id
//     const entry = { val: node.val, x, y, r: R, id }
//     nodes.push(entry)

//     const lChild = place(node.left,  xMin, x,    depth + 1)
//     const rChild = place(node.right, x,    xMax, depth + 1)

//     if (lChild) edges.push({ x1: x, y1: y, x2: lChild.x,  y2: lChild.y,  key: `${id}-l` })
//     if (rChild) edges.push({ x1: x, y1: y, x2: rChild.x,  y2: rChild.y,  key: `${id}-r` })

//     return entry
//   }
//   place(root, PAD, W - PAD, 0)
//   return { nodes, edges }
// }

// // ─── Colours ──────────────────────────────────────────────────────────────────
// const G  = '#00e5a0'   // green  — insert / inorder
// const B  = '#38bdf8'   // blue   — search / preorder
// const Y  = '#fbbf24'   // amber  — postorder / warn
// const R  = '#f87171'   // red    — delete
// const DIM = '#091525'

// // ─── Component ────────────────────────────────────────────────────────────────
// export default function BSTPage() {
//   const [root,          setRoot]          = useState(null)
//   const [input,         setInput]         = useState('')
//   const [msg,           setMsg]           = useState(null)
//   const [hl,            setHl]            = useState(new Set())   // highlighted node vals
//   const [hlCol,         setHlCol]         = useState(G)
//   const [travSeq,       setTravSeq]       = useState([])
//   const [travActive,    setTravActive]    = useState(new Set())
//   const [travCol,       setTravCol]       = useState(G)
//   const [svgW,          setSvgW]          = useState(600)
//   const [svgH,          setSvgH]          = useState(400)
//   const wrapRef  = useRef(null)
//   const timers   = useRef({ msg: null, hl: [] })

//   // measure SVG wrapper
//   useEffect(() => {
//     if (!wrapRef.current) return
//     const ro = new ResizeObserver(([e]) => {
//       setSvgW(Math.max(e.contentRect.width,  200))
//       setSvgH(Math.max(e.contentRect.height, 200))
//     })
//     ro.observe(wrapRef.current)
//     return () => ro.disconnect()
//   }, [])

//   // ── helpers ──────────────────────────────────────────────
//   const showMsg = (text, type = 'info') => {
//     clearTimeout(timers.current.msg)
//     setMsg({ text, type })
//     timers.current.msg = setTimeout(() => setMsg(null), 2600)
//   }

//   const clearHlTimers = () => {
//     timers.current.hl.forEach(clearTimeout)
//     timers.current.hl = []
//   }

//   const flashNodes = (vals, col, ms = 1800) => {
//     clearHlTimers()
//     setHl(new Set(vals))
//     setHlCol(col)
//     timers.current.hl.push(setTimeout(() => setHl(new Set()), ms))
//   }

//   const stepNodes = (seq, col, stepMs = 370) => {
//     clearHlTimers()
//     setHl(new Set())
//     setTravSeq(seq)
//     setTravActive(new Set())
//     setTravCol(col)
//     const seen = new Set()
//     seq.forEach((v, i) => {
//       timers.current.hl.push(setTimeout(() => {
//         seen.add(v)
//         setHl(new Set(seen))
//         setHlCol(col)
//         setTravActive(new Set(seen))
//         if (i === seq.length - 1) {
//           timers.current.hl.push(setTimeout(() => {
//             setHl(new Set())
//             setTravActive(new Set())
//           }, 1400))
//         }
//       }, i * stepMs))
//     })
//   }

//   // ── actions ──────────────────────────────────────────────
//   const handleInsert = () => {
//     const n = Number(input)
//     if (!input.trim() || isNaN(n)) { showMsg('Enter a valid number', 'error'); return }
//     if (n < -999 || n > 999)       { showMsg('Use -999 to 999', 'error'); return }
//     setRoot(prev => insert(prev, n))
//     setInput('')
//     setTimeout(() => flashNodes([n], G), 40)
//     showMsg(`Inserted  ${n}`, 'success')
//   }

//   const handleDelete = () => {
//     const n = Number(input)
//     if (!input.trim() || isNaN(n)) { showMsg('Enter a number to delete', 'error'); return }
//     if (!root)                     { showMsg('Tree is empty', 'error'); return }
//     const { found } = searchPath(root, n)
//     if (!found)                    { showMsg(`${n} not found`, 'error'); return }
//     flashNodes([n], R, 500)
//     setTimeout(() => setRoot(prev => remove(prev, n)), 520)
//     setInput('')
//     showMsg(`Deleted  ${n}`, 'delete')
//   }

//   const handleSearch = () => {
//     const n = Number(input)
//     if (!input.trim() || isNaN(n)) { showMsg('Enter a number to search', 'error'); return }
//     if (!root)                     { showMsg('Tree is empty', 'error'); return }
//     const { path, found } = searchPath(root, n)
//     clearHlTimers()
//     setHl(new Set())
//     const seen = new Set()
//     path.forEach((v, i) => {
//       timers.current.hl.push(setTimeout(() => {
//         seen.add(v)
//         setHl(new Set(seen))
//         setHlCol(found && i === path.length - 1 ? G : Y)
//         if (i === path.length - 1) {
//           showMsg(found ? `Found  ${n}  —  ${path.length} step${path.length > 1 ? 's' : ''}` : `${n}  not found`, found ? 'success' : 'error')
//           timers.current.hl.push(setTimeout(() => setHl(new Set()), 1800))
//         }
//       }, i * 420))
//     })
//     setInput('')
//   }

//   const handleSeed = () => {
//     let r = null
//     ;[50, 30, 70, 20, 40, 60, 80, 10, 35, 55, 65].forEach(v => { r = insert(r, v) })
//     setRoot(r)
//     setHl(new Set()); setTravSeq([])
//     showMsg('Sample tree loaded', 'info')
//   }

//   const handleClear = () => {
//     clearHlTimers()
//     setRoot(null); setHl(new Set()); setTravSeq([]); setTravActive(new Set())
//     showMsg('Tree cleared', 'info')
//   }

//   const handleInorder   = () => { if (root) stepNodes(inorder(root),   G) }
//   const handlePreorder  = () => { if (root) stepNodes(preorder(root),  B) }
//   const handlePostorder = () => { if (root) stepNodes(postorder(root), Y) }

//   // ── layout ───────────────────────────────────────────────
//   const { nodes, edges } = layout(root, svgW, svgH)

//   // build a map for quick lookup: val → {x,y}
//   const nodeMap = {}
//   nodes.forEach(n => { nodeMap[n.val] = n })

//   const msgStyle = {
//     success: { c: G,        b: `${G}28`  },
//     error:   { c: R,        b: `${R}28`  },
//     delete:  { c: '#fb923c',b: '#fb923c28'},
//     info:    { c: '#64748b',b: '#64748b20'},
//   }

//   const nodeCount  = treeSize(root)
//   const nodeHeight = treeHeight(root)

//   return (
//     <>
//       <Navbar />

//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');
//         html,body { margin:0; padding:0; overflow:hidden; height:100%; }
//         *,*::before,*::after { box-sizing:border-box; }

//         .shell {
//           height: calc(100vh - 52px);
//           background: #03080f;
//           display: flex; overflow: hidden; position: relative;
//         }

//         /* subtle dot-grid background */
//         .shell::after {
//           content:''; position:absolute; inset:0; pointer-events:none; z-index:0;
//           background-image: radial-gradient(circle, #0a1f3520 1px, transparent 1px);
//           background-size: 28px 28px;
//         }

//         .col {
//           position:relative; z-index:1;
//           width:50%; height:100%; overflow:hidden;
//           display:flex; flex-direction:column;
//         }
//         .col-l { padding:18px 14px 16px 22px; border-right:1px solid #091a2e; }
//         .col-r { padding:18px 22px 16px 14px; }

//         /* tree canvas */
//         .canvas {
//           flex:1; min-height:0;
//           border-radius:14px;
//           border:1px solid #091a2e;
//           background:#020c18;
//           position:relative; overflow:hidden;
//         }
//         .canvas::before {
//           content:''; position:absolute; inset:0; pointer-events:none;
//           background:
//             linear-gradient(#091a2e18 1px, transparent 1px),
//             linear-gradient(90deg, #091a2e18 1px, transparent 1px);
//           background-size: 32px 32px;
//         }

//         /* right panel */
//         .panel { flex:1; min-height:0; display:flex; flex-direction:column; gap:8px; }
//         .card  { background:#040d1a; border:1px solid #091a2e; border-radius:10px; padding:10px 13px; flex-shrink:0; }
//         .card.fill { flex:1; min-height:0; display:flex; flex-direction:column; }
//         .clabel {
//           font-family:'Syne'; font-weight:700; font-size:9px;
//           color:#112240; letter-spacing:2px; text-transform:uppercase;
//           margin-bottom:7px; flex-shrink:0;
//         }
//         .olist { flex:1; min-height:0; display:flex; flex-direction:column; }
//         .orow  {
//           flex:1; min-height:0; display:flex; align-items:center;
//           justify-content:space-between; padding:0 10px;
//           border-radius:6px; background:#020c18;
//           border:1px solid #091a2e; margin-bottom:4px;
//           transition:border-color 0.2s;
//         }
//         .orow:last-child { margin-bottom:0; }
//         .orow:hover { border-color:#122540; }

//         /* buttons */
//         .btn-insert {
//           background:linear-gradient(135deg,${G},#00c49a);
//           color:#000; border:none; border-radius:8px; padding:9px 20px;
//           font-family:'Syne'; font-size:12px; font-weight:800; cursor:pointer;
//           box-shadow:0 0 16px ${G}28; transition:all 0.18s;
//           white-space:nowrap; flex-shrink:0; letter-spacing:0.3px;
//         }
//         .btn-insert:hover { transform:translateY(-1px); box-shadow:0 0 26px ${G}50; }

//         .btn-act {
//           flex:1; border:none; border-radius:7px;
//           padding:8px 6px; font-family:'Syne'; font-size:11px;
//           font-weight:700; cursor:pointer; transition:all 0.18s; letter-spacing:0.2px;
//         }
//         .btn-act:disabled { opacity:0.22; cursor:not-allowed; }
//         .btn-act:hover:not(:disabled) { transform:translateY(-1px); }
//         .b-srch  { background:${B}14; color:${B};        border:1px solid ${B}28; }
//         .b-del   { background:${R}14; color:${R};        border:1px solid ${R}28; }
//         .b-seed  { background:${Y}14; color:${Y};        border:1px solid ${Y}28; }
//         .b-clear { background:#64748b14; color:#64748b;  border:1px solid #64748b28; }
//         .b-srch:hover:not(:disabled)  { background:${B}22; }
//         .b-del:hover:not(:disabled)   { background:${R}22; }
//         .b-seed:hover:not(:disabled)  { background:${Y}22; }
//         .b-clear:hover:not(:disabled) { background:#64748b22; }

//         .btn-trav {
//           flex:1; border:none; border-radius:7px;
//           padding:7px 4px; font-family:'Syne'; font-size:10px;
//           font-weight:700; cursor:pointer; transition:all 0.18s;
//           background:#020c18; border:1px solid #091a2e; color:#112240;
//         }
//         .btn-trav:disabled { opacity:0.2; cursor:not-allowed; }
//         .btn-trav:hover:not(:disabled) { transform:translateY(-1px); }

//         .bst-inp {
//           flex:1; background:#020c18; border:1px solid #0e2240;
//           border-radius:8px; padding:9px 13px; color:#e2e8f0;
//           font-family:'JetBrains Mono'; font-size:13px;
//           outline:none; min-width:0;
//           transition:border-color 0.2s, box-shadow 0.2s;
//         }
//         .bst-inp:focus { border-color:${G}55; box-shadow:0 0 0 3px ${G}12; }
//         .bst-inp::placeholder { color:#112240; }

//         /* hide number input arrows */
//         .bst-inp::-webkit-inner-spin-button,
//         .bst-inp::-webkit-outer-spin-button { -webkit-appearance:none; }
//         .bst-inp[type=number] { -moz-appearance:textfield; }
//       `}</style>

//       <div className="shell">

//         {/* ════ LEFT — Tree canvas ════ */}
//         <div className="col col-l">

//           {/* header */}
//           <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'10px', flexShrink:0 }}>
//             <h1 style={{ fontFamily:'Syne', fontWeight:800, fontSize:'1.6rem', color:'#e2e8f0', letterSpacing:'-0.5px', lineHeight:1, margin:0 }}>
//               BST
//             </h1>
//             <span style={{ fontFamily:'JetBrains Mono', fontSize:'10px', color:G, background:`${G}14`, border:`1px solid ${G}28`, borderRadius:'4px', padding:'2px 8px', letterSpacing:'0.5px' }}>
//               Binary Search Tree
//             </span>
//             <span style={{ fontFamily:'JetBrains Mono', fontSize:'10px', color:'#112240', marginLeft:'auto' }}>
//               {nodeCount > 0 ? `${nodeCount} node${nodeCount > 1 ? 's' : ''}  ·  h = ${nodeHeight}` : 'empty'}
//             </span>
//           </div>

//           {/* canvas */}
//           <div className="canvas" ref={wrapRef}>

//             {/* empty state */}
//             {!root && (
//               <div style={{ position:'absolute', inset:0, zIndex:2, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'10px', pointerEvents:'none' }}>
//                 <svg width="36" height="36" viewBox="0 0 36 36">
//                   <circle cx="18" cy="18" r="17" fill="none" stroke="#091a2e" strokeWidth="1" strokeDasharray="4 3"/>
//                   <text x="18" y="22" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="14" fill="#091a2e">∅</text>
//                 </svg>
//                 <p style={{ fontFamily:'JetBrains Mono', fontSize:'10px', color:'#091a2e', letterSpacing:'1px' }}>
//                   insert a number to begin
//                 </p>
//               </div>
//             )}

//             <svg
//               width={svgW} height={svgH}
//               style={{ position:'absolute', inset:0, zIndex:3, overflow:'visible' }}
//             >
//               <defs>
//                 <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
//                   <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur"/>
//                   <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
//                 </filter>
//                 <filter id="glow2" x="-80%" y="-80%" width="260%" height="260%">
//                   <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur"/>
//                   <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
//                 </filter>
//               </defs>

//               {/* ── dim edges ── */}
//               {edges.map(e => (
//                 <motion.line
//                   key={e.key}
//                   x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
//                   stroke="#0d2035" strokeWidth={1.5} strokeLinecap="round"
//                   initial={{ opacity:0, pathLength:0 }}
//                   animate={{ opacity:1, pathLength:1 }}
//                   transition={{ duration:0.35, ease:'easeOut' }}
//                 />
//               ))}

//               {/* ── glowing edges when both endpoint nodes are highlighted ── */}
//               {edges.map(e => {
//                 const nA = nodes.find(n => Math.round(n.x) === Math.round(e.x1) && Math.round(n.y) === Math.round(e.y1))
//                 const nB = nodes.find(n => Math.round(n.x) === Math.round(e.x2) && Math.round(n.y) === Math.round(e.y2))
//                 const lit = nA && nB && hl.has(nA.val) && hl.has(nB.val)
//                 if (!lit) return null
//                 return (
//                   <motion.line
//                     key={`hl-${e.key}`}
//                     x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
//                     stroke={hlCol} strokeWidth={2} strokeLinecap="round"
//                     filter="url(#glow)" opacity={0.7}
//                     initial={{ opacity:0 }} animate={{ opacity:0.7 }}
//                     transition={{ duration:0.2 }}
//                   />
//                 )
//               })}

//               {/* ── nodes ── */}
//               <AnimatePresence>
//                 {nodes.map(node => {
//                   const isHl  = hl.has(node.val)
//                   const col   = isHl ? hlCol : '#0d2035'
//                   const tCol  = isHl ? hlCol : '#1a3a5c'
//                   const bgCol = isHl ? `${hlCol}16` : '#040d1a'

//                   return (
//                     <motion.g
//                       key={node.val}
//                       initial={{ scale:0, opacity:0 }}
//                       animate={{ scale:1, opacity:1 }}
//                       exit={{ scale:0, opacity:0, transition:{ duration:0.2 } }}
//                       transition={{ type:'spring', stiffness:420, damping:22 }}
//                       // SVG transform-origin fix — use cx/cy directly
//                       style={{ transformOrigin: `${node.x}px ${node.y}px` }}
//                     >
//                       {/* pulse ring on highlight */}
//                       {isHl && (
//                         <motion.circle
//                           cx={node.x} cy={node.y}
//                           fill="none" stroke={hlCol} strokeWidth={1}
//                           filter="url(#glow2)"
//                           initial={{ r: node.r + 2, opacity: 0.7 }}
//                           animate={{ r: node.r + 14, opacity: 0 }}
//                           transition={{ duration: 0.9, repeat: Infinity, ease:'easeOut' }}
//                         />
//                       )}

//                       {/* node fill */}
//                       <circle
//                         cx={node.x} cy={node.y} r={node.r}
//                         fill={bgCol}
//                         stroke={col} strokeWidth={isHl ? 1.5 : 1}
//                         filter={isHl ? 'url(#glow)' : undefined}
//                       />

//                       {/* value text */}
//                       <text
//                         x={node.x} y={node.y}
//                         textAnchor="middle" dominantBaseline="central"
//                         fontFamily="JetBrains Mono" fontWeight="700"
//                         fontSize={Math.abs(node.val) >= 100 ? 9 : Math.abs(node.val) >= 10 ? 11 : 13}
//                         fill={tCol}
//                         style={{ userSelect:'none', pointerEvents:'none' }}
//                       >
//                         {node.val}
//                       </text>
//                     </motion.g>
//                   )
//                 })}
//               </AnimatePresence>
//             </svg>
//           </div>

//           {/* traversal sequence strip */}
//           <AnimatePresence>
//             {travSeq.length > 0 && (
//               <motion.div
//                 initial={{ opacity:0, y:5 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:5 }}
//                 transition={{ duration:0.2 }}
//                 style={{ flexShrink:0, marginTop:'7px', background:'#020c18', border:'1px solid #091a2e', borderRadius:'8px', padding:'7px 12px', display:'flex', alignItems:'center', gap:'5px', flexWrap:'wrap', minHeight:'34px' }}
//               >
//                 <span style={{ fontFamily:'JetBrains Mono', fontSize:'8px', color:'#112240', letterSpacing:'1.5px', marginRight:'4px', flexShrink:0 }}>SEQ</span>
//                 {travSeq.map((v, i) => {
//                   const active = travActive.has(v)
//                   return (
//                     <motion.span key={`${v}-${i}`}
//                       initial={{ opacity:0, scale:0.7 }}
//                       animate={{ opacity:1, scale:1 }}
//                       transition={{ delay: i * 0.37, type:'spring', stiffness:400, damping:20 }}
//                       style={{
//                         fontFamily:'JetBrains Mono', fontWeight:700, fontSize:'11px',
//                         color:      active ? travCol : '#1a3a5c',
//                         background: active ? `${travCol}18` : 'transparent',
//                         border:     `1px solid ${active ? `${travCol}40` : '#091a2e'}`,
//                         borderRadius:'4px', padding:'2px 7px',
//                         transition: 'all 0.25s',
//                       }}
//                     >{v}</motion.span>
//                   )
//                 })}
//               </motion.div>
//             )}
//           </AnimatePresence>

//           {/* message bar */}
//           <div style={{ height:'28px', marginTop:'6px', marginBottom:'6px', flexShrink:0 }}>
//             <AnimatePresence mode="wait">
//               {msg && (
//                 <motion.div key={msg.text}
//                   initial={{ opacity:0, y:3 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-3 }}
//                   transition={{ duration:0.15 }}
//                   style={{ background:'#020c18', border:`1px solid ${msgStyle[msg.type].b}`, borderRadius:'7px', padding:'5px 13px', fontFamily:'JetBrains Mono', fontSize:'11px', color:msgStyle[msg.type].c, height:'100%', display:'flex', alignItems:'center' }}
//                 >
//                   {msg.text}
//                 </motion.div>
//               )}
//             </AnimatePresence>
//           </div>

//           {/* input + insert */}
//           <div style={{ display:'flex', gap:'7px', marginBottom:'7px', flexShrink:0 }}>
//             <input
//               className="bst-inp" type="number" value={input}
//               onChange={e => setInput(e.target.value)}
//               onKeyDown={e => { if (e.key === 'Enter') handleInsert() }}
//               placeholder="enter number…"
//             />
//             <button className="btn-insert" onClick={handleInsert}>Insert</button>
//           </div>

//           {/* action buttons */}
//           <div style={{ display:'flex', gap:'7px', marginBottom:'7px', flexShrink:0 }}>
//             <button className="btn-act b-srch"  onClick={handleSearch} disabled={!root}>Search</button>
//             <button className="btn-act b-del"   onClick={handleDelete} disabled={!root}>Delete</button>
//             <button className="btn-act b-seed"  onClick={handleSeed}                  >Sample</button>
//             <button className="btn-act b-clear" onClick={handleClear}  disabled={!root}>Clear</button>
//           </div>

//           {/* traversal buttons */}
//           <div style={{ display:'flex', gap:'7px', flexShrink:0 }}>
//             {[
//               { label:'Inorder',   fn: handleInorder,   col: G },
//               { label:'Preorder',  fn: handlePreorder,  col: B },
//               { label:'Postorder', fn: handlePostorder, col: Y },
//             ].map(({ label, fn, col }) => (
//               <button key={label} className="btn-trav" onClick={fn} disabled={!root}
//                 style={root ? { color:col, borderColor:`${col}30`, background:`${col}0e` } : {}}>
//                 {label}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* ════ RIGHT — Info panel ════ */}
//         <div className="col col-r">

//           <div style={{ marginBottom:'10px', flexShrink:0 }}>
//             <h2 style={{ fontFamily:'Syne', fontWeight:800, fontSize:'1.6rem', color:'#e2e8f0', letterSpacing:'-0.5px', lineHeight:1, margin:0 }}>
//               Info
//             </h2>
//             <p style={{ fontFamily:'JetBrains Mono', fontSize:'10px', color:'#112240', marginTop:'4px' }}>
//               left &lt; root &lt; right  ·  O(log n) average
//             </p>
//           </div>

//           <div className="panel">

//             {/* BST rule */}
//             <div className="card">
//               <p className="clabel">BST Rule</p>
//               <div style={{ display:'flex', gap:'6px' }}>
//                 {[
//                   { lbl:'Left subtree',  val:'< root', col: B },
//                   { lbl:'Root',          val:'pivot',  col: G },
//                   { lbl:'Right subtree', val:'> root', col: Y },
//                 ].map(({ lbl, val, col }) => (
//                   <div key={lbl} style={{ flex:1, background:'#020c18', border:'1px solid #091a2e', borderRadius:'7px', padding:'8px 6px', textAlign:'center' }}>
//                     <p style={{ fontFamily:'JetBrains Mono', fontSize:'8px', color:'#112240', marginBottom:'3px', letterSpacing:'0.5px' }}>{lbl}</p>
//                     <p style={{ fontFamily:'JetBrains Mono', fontWeight:700, fontSize:'13px', color:col }}>{val}</p>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* complexity */}
//             <div className="card">
//               <p className="clabel">Complexity</p>
//               <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'5px' }}>
//                 {[
//                   { lbl:'Search (avg)',  val:'O(log n)', col: G },
//                   { lbl:'Search (worst)',val:'O(n)',     col: R },
//                   { lbl:'Insert (avg)',  val:'O(log n)', col: B },
//                   { lbl:'Space',         val:'O(n)',     col: Y },
//                 ].map(({ lbl, val, col }) => (
//                   <div key={lbl} style={{ background:'#020c18', border:'1px solid #091a2e', borderRadius:'6px', padding:'7px 9px' }}>
//                     <p style={{ fontFamily:'JetBrains Mono', fontSize:'8px', color:'#112240', marginBottom:'2px' }}>{lbl}</p>
//                     <p style={{ fontFamily:'JetBrains Mono', fontWeight:700, fontSize:'13px', color:col }}>{val}</p>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* traversals */}
//             <div className="card">
//               <p className="clabel">Traversals</p>
//               <div style={{ display:'flex', flexDirection:'column', gap:'5px' }}>
//                 {[
//                   { name:'Inorder',   pattern:'L → Root → R', note:'sorted output',      col: G },
//                   { name:'Preorder',  pattern:'Root → L → R', note:'copy / serialize',   col: B },
//                   { name:'Postorder', pattern:'L → R → Root', note:'delete / evaluate',  col: Y },
//                 ].map(({ name, pattern, note, col }) => (
//                   <div key={name} style={{ background:'#020c18', border:'1px solid #091a2e', borderRadius:'7px', padding:'8px 10px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
//                     <div>
//                       <p style={{ fontFamily:'JetBrains Mono', fontWeight:700, fontSize:'11px', color:col, margin:0 }}>{name}</p>
//                       <p style={{ fontFamily:'JetBrains Mono', fontSize:'9px', color:'#112240', marginTop:'2px' }}>{pattern}</p>
//                     </div>
//                     <span style={{ fontFamily:'JetBrains Mono', fontSize:'9px', color:'#112240', textAlign:'right' }}>{note}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* operations — fills rest */}
//             <div className="card fill">
//               <p className="clabel">Operations</p>
//               <div className="olist">
//                 {[
//                   { op:'insert(x)',   desc:'Add, preserve BST order',      col: G },
//                   { op:'delete(x)',   desc:'Remove, restructure tree',      col: R },
//                   { op:'search(x)',   desc:'Go left/right until found',     col: B },
//                   { op:'inorder()',   desc:'Produces sorted sequence',      col: G },
//                   { op:'height()',    desc:'Depth of deepest leaf',         col: Y },
//                 ].map(({ op, desc, col }) => (
//                   <div key={op} className="orow">
//                     <div>
//                       <p style={{ fontFamily:'JetBrains Mono', fontWeight:700, fontSize:'11px', color:col, margin:0 }}>{op}</p>
//                       <p style={{ fontFamily:'JetBrains Mono', fontSize:'9px', color:'#112240', marginTop:'1px' }}>{desc}</p>
//                     </div>
//                     <span style={{ fontFamily:'JetBrains Mono', fontSize:'9px', color:G, background:`${G}10`, border:`1px solid ${G}22`, borderRadius:'4px', padding:'2px 6px', flexShrink:0 }}>
//                       O(log n)
//                     </span>
//                   </div>
//                 ))}
//               </div>
//             </div>

//           </div>
//         </div>

//       </div>
//     </>
//   )
// }
'use client'
/* eslint-disable react-hooks/refs */
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '@/comps/navbar'

// ─── BST pure-data (plain objects, no class — avoids structuredClone issues) ──

function mkNode(val) { return { val, left: null, right: null } }

function insert(node, val) {
  if (!node) return mkNode(val)
  if (val < node.val) return { ...node, left:  insert(node.left,  val) }
  if (val > node.val) return { ...node, right: insert(node.right, val) }
  return node   // duplicate — ignore
}

function minNode(node) { return node.left ? minNode(node.left) : node }

function remove(node, val) {
  if (!node) return null
  if (val < node.val) return { ...node, left:  remove(node.left,  val) }
  if (val > node.val) return { ...node, right: remove(node.right, val) }
  if (!node.left)  return node.right
  if (!node.right) return node.left
  const m = minNode(node.right)
  return { ...node, val: m.val, right: remove(node.right, m.val) }
}

function searchPath(node, val, path = []) {
  if (!node) return { path, found: false }
  path.push(node.val)
  if (val === node.val) return { path, found: true }
  return val < node.val
    ? searchPath(node.left,  val, path)
    : searchPath(node.right, val, path)
}

function inorder(node, out = [])   { if (!node) return out; inorder(node.left, out); out.push(node.val); inorder(node.right, out); return out }
function preorder(node, out = [])  { if (!node) return out; out.push(node.val); preorder(node.left, out); preorder(node.right, out); return out }
function postorder(node, out = []) { if (!node) return out; postorder(node.left, out); postorder(node.right, out); out.push(node.val); return out }
function treeSize(node)            { return node ? 1 + treeSize(node.left) + treeSize(node.right) : 0 }
function treeHeight(node)          { return node ? 1 + Math.max(treeHeight(node.left), treeHeight(node.right)) : 0 }
function isBalanced(node) {
  if (!node) return true
  const lh = treeHeight(node.left)
  const rh = treeHeight(node.right)
  return Math.abs(lh - rh) <= 1 && isBalanced(node.left) && isBalanced(node.right)
}

// ─── Layout: assign pixel coords to every node ───────────────────────────────
// Returns { nodes: [{val,x,y,id}], edges: [{x1,y1,x2,y2,key}] }
function layout(root, W, H) {
  const nodes = [], edges = []
  if (!root) return { nodes, edges }

  const LEVEL_H = 70
  const R       = 20
  const PAD     = R + 8

  function subtreeSize(n) { return n ? 1 + subtreeSize(n.left) + subtreeSize(n.right) : 0 }

  let nodeId = 0
  function place(node, xMin, xMax, depth) {
    if (!node) return null
    const ls   = subtreeSize(node.left)
    const tot  = subtreeSize(node)
    const x    = xMin + (ls + 0.5) * (xMax - xMin) / tot
    const y    = PAD + depth * LEVEL_H
    const id   = nodeId++
    node._x = x; node._y = y; node._id = id
    const entry = { val: node.val, x, y, r: R, id }
    nodes.push(entry)

    const lChild = place(node.left,  xMin, x,    depth + 1)
    const rChild = place(node.right, x,    xMax, depth + 1)

    if (lChild) edges.push({ x1: x, y1: y, x2: lChild.x,  y2: lChild.y,  key: `${id}-l` })
    if (rChild) edges.push({ x1: x, y1: y, x2: rChild.x,  y2: rChild.y,  key: `${id}-r` })

    return entry
  }
  place(root, PAD, W - PAD, 0)
  return { nodes, edges }
}

// ─── Premium color palette ────────────────────────────────────────────────────
const palette = {
  emerald: '#10b981',
  teal:    '#14b8a6',
  sky:     '#38bdf8',
  violet:  '#8b5cf6',
  amber:   '#f59e0b',
  rose:    '#f43f5e',
  slate:   '#1e293b',
  zinc:    '#181e2c',
  border:  '#1f2a3f',
  textDim: '#5f7a9a',
  glow:    'rgba(20, 184, 166, 0.4)',
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function BSTPage() {
  const [root,          setRoot]          = useState(null)
  const [input,         setInput]         = useState('')
  const [msg,           setMsg]           = useState(null)
  const [hl,            setHl]            = useState(new Set())   // highlighted node vals
  const [hlCol,         setHlCol]         = useState(palette.emerald)
  const [travSeq,       setTravSeq]       = useState([])
  const [travActive,    setTravActive]    = useState(new Set())
  const [travCol,       setTravCol]       = useState(palette.emerald)
  const [svgW,          setSvgW]          = useState(600)
  const [svgH,          setSvgH]          = useState(400)
  const wrapRef  = useRef(null)
  const timers   = useRef({ msg: null, hl: [] })

  // measure SVG wrapper
  useEffect(() => {
    if (!wrapRef.current) return
    const ro = new ResizeObserver(([e]) => {
      setSvgW(Math.max(e.contentRect.width,  200))
      setSvgH(Math.max(e.contentRect.height, 200))
    })
    ro.observe(wrapRef.current)
    return () => ro.disconnect()
  }, [])

  // ── helpers ──────────────────────────────────────────────
  const showMsg = (text, type = 'info') => {
    clearTimeout(timers.current.msg)
    setMsg({ text, type })
    timers.current.msg = setTimeout(() => setMsg(null), 2600)
  }

  const clearHlTimers = () => {
    timers.current.hl.forEach(clearTimeout)
    timers.current.hl = []
  }

  const flashNodes = (vals, col, ms = 1800) => {
    clearHlTimers()
    setHl(new Set(vals))
    setHlCol(col)
    timers.current.hl.push(setTimeout(() => setHl(new Set()), ms))
  }

  const stepNodes = (seq, col, stepMs = 370) => {
    clearHlTimers()
    setHl(new Set())
    setTravSeq(seq)
    setTravActive(new Set())
    setTravCol(col)
    const seen = new Set()
    seq.forEach((v, i) => {
      timers.current.hl.push(setTimeout(() => {
        seen.add(v)
        setHl(new Set(seen))
        setHlCol(col)
        setTravActive(new Set(seen))
        if (i === seq.length - 1) {
          timers.current.hl.push(setTimeout(() => {
            setHl(new Set())
            setTravActive(new Set())
          }, 1400))
        }
      }, i * stepMs))
    })
  }

  // ── actions ──────────────────────────────────────────────
  const handleInsert = () => {
    const n = Number(input)
    if (!input.trim() || isNaN(n)) { showMsg('Enter a valid number', 'error'); return }
    if (n < -999 || n > 999)       { showMsg('Use -999 to 999', 'error'); return }
    setRoot(prev => insert(prev, n))
    setInput('')
    setTimeout(() => flashNodes([n], palette.emerald), 40)
    showMsg(`Inserted  ${n}`, 'success')
  }

  const handleDelete = () => {
    const n = Number(input)
    if (!input.trim() || isNaN(n)) { showMsg('Enter a number to delete', 'error'); return }
    if (!root)                     { showMsg('Tree is empty', 'error'); return }
    const { found } = searchPath(root, n)
    if (!found)                    { showMsg(`${n} not found`, 'error'); return }
    flashNodes([n], palette.rose, 500)
    setTimeout(() => setRoot(prev => remove(prev, n)), 520)
    setInput('')
    showMsg(`Deleted  ${n}`, 'delete')
  }

  const handleSearch = () => {
    const n = Number(input)
    if (!input.trim() || isNaN(n)) { showMsg('Enter a number to search', 'error'); return }
    if (!root)                     { showMsg('Tree is empty', 'error'); return }
    const { path, found } = searchPath(root, n)
    clearHlTimers()
    setHl(new Set())
    const seen = new Set()
    path.forEach((v, i) => {
      timers.current.hl.push(setTimeout(() => {
        seen.add(v)
        setHl(new Set(seen))
        setHlCol(found && i === path.length - 1 ? palette.emerald : palette.amber)
        if (i === path.length - 1) {
          showMsg(found ? `Found  ${n}  —  ${path.length} step${path.length > 1 ? 's' : ''}` : `${n}  not found`, found ? 'success' : 'error')
          timers.current.hl.push(setTimeout(() => setHl(new Set()), 1800))
        }
      }, i * 420))
    })
    setInput('')
  }

  const handleSeed = () => {
    let r = null
    ;[50, 30, 70, 20, 40, 60, 80, 10, 35, 55, 65].forEach(v => { r = insert(r, v) })
    setRoot(r)
    setHl(new Set()); setTravSeq([])
    showMsg('Sample tree loaded', 'info')
  }

  const handleClear = () => {
    clearHlTimers()
    setRoot(null); setHl(new Set()); setTravSeq([]); setTravActive(new Set())
    showMsg('Tree cleared', 'info')
  }

  const handleInorder   = () => { if (root) stepNodes(inorder(root),   palette.emerald) }
  const handlePreorder  = () => { if (root) stepNodes(preorder(root),  palette.sky) }
  const handlePostorder = () => { if (root) stepNodes(postorder(root), palette.amber) }

  // ── layout ───────────────────────────────────────────────
  const { nodes, edges } = layout(root, svgW, svgH)

  // build a map for quick lookup: val → {x,y}
  const nodeMap = {}
  nodes.forEach(n => { nodeMap[n.val] = n })

  const msgStyle = {
    success: { c: palette.emerald, b: `${palette.emerald}28` },
    error:   { c: palette.rose,    b: `${palette.rose}28` },
    delete:  { c: palette.amber,   b: `${palette.amber}28` },
    info:    { c: palette.textDim, b: `${palette.border}50` },
  }

  const nodeCount  = treeSize(root)
  const nodeHeight = treeHeight(root)
  const balanced   = root ? isBalanced(root) : true

  return (
    <>
      <Navbar />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');
        html,body { margin:0; padding:0; overflow:hidden; height:100%; background: #03080f; }
        *,*::before,*::after { box-sizing:border-box; }

        .shell {
          height: calc(100vh - 52px);
          display: flex; overflow: hidden; position: relative;
          background: radial-gradient(circle at 20% 30%, #0b1a2f, #02070f);
        }

        /* premium noise overlay */
        .shell::after {
          content:''; position:absolute; inset:0; pointer-events:none;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.025'/%3E%3C/svg%3E");
        }

        .col {
          position:relative; z-index:1;
          width:50%; height:100%; overflow:hidden;
          display:flex; flex-direction:column;
        }
        .col-l { padding:18px 14px 16px 22px; border-right:1px solid ${palette.border}; }
        .col-r { padding:18px 22px 16px 14px; }

        /* tree canvas */
        .canvas {
          flex:1; min-height:0;
          border-radius:20px;
          border:1px solid ${palette.border};
          background: rgba(10, 20, 35, 0.6);
          backdrop-filter: blur(2px);
          box-shadow: 0 10px 30px -15px rgba(0,0,0,0.6), inset 0 1px 2px rgba(255,255,255,0.03);
          position:relative; overflow:hidden;
        }
        .canvas::before {
          content:''; position:absolute; inset:0; pointer-events:none;
          background: 
            linear-gradient(to right, ${palette.border}20 1px, transparent 1px),
            linear-gradient(to bottom, ${palette.border}20 1px, transparent 1px);
          background-size: 40px 40px;
        }

        /* right panel */
        .panel { flex:1; min-height:0; display:flex; flex-direction:column; gap:8px; }
        .card  {
          background: rgba(12, 22, 38, 0.8);
          backdrop-filter: blur(4px);
          border:1px solid ${palette.border};
          border-radius:14px;
          padding:12px 15px;
          flex-shrink:0;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }
        .card.fill { flex:1; min-height:0; display:flex; flex-direction:column; }
        .clabel {
          font-family:'Syne'; font-weight:700; font-size:9px;
          color: ${palette.textDim}; letter-spacing:2.5px; text-transform:uppercase;
          margin-bottom:8px; flex-shrink:0;
        }
        .olist { flex:1; min-height:0; display:flex; flex-direction:column; }
        .orow  {
          flex:1; min-height:0; display:flex; align-items:center;
          justify-content:space-between; padding:0 12px;
          border-radius:10px; background: rgba(6, 15, 26, 0.8);
          border:1px solid ${palette.border}; margin-bottom:5px;
          transition: all 0.2s ease;
        }
        .orow:last-child { margin-bottom:0; }
        .orow:hover {
          border-color: ${palette.teal}60;
          box-shadow: 0 0 0 1px ${palette.teal}20;
        }

        /* buttons */
        .btn-insert {
          background: linear-gradient(135deg, ${palette.emerald}, ${palette.teal});
          color: #000; border:none; border-radius:12px; padding:9px 20px;
          font-family:'Syne'; font-size:13px; font-weight:800; cursor:pointer;
          box-shadow: 0 4px 14px ${palette.glow}, 0 1px 2px rgba(255,255,255,0.1);
          transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1);
          white-space:nowrap; flex-shrink:0; letter-spacing:0.3px;
        }
        .btn-insert:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px ${palette.glow}, 0 2px 4px rgba(255,255,255,0.1);
        }
        .btn-insert:active { transform: translateY(0); }

        .btn-act {
          flex:1; border:none; border-radius:10px;
          padding:8px 6px; font-family:'Syne'; font-size:11px;
          font-weight:700; cursor:pointer; transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1);
          letter-spacing:0.2px; background: rgba(10, 20, 35, 0.8);
          backdrop-filter: blur(2px); border:1px solid transparent;
        }
        .btn-act:disabled { opacity:0.22; cursor:not-allowed; }
        .btn-act:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 14px rgba(0,0,0,0.4);
        }
        .btn-act:active:not(:disabled) { transform: translateY(0); }

        .b-srch  { color: ${palette.sky};        border-color: ${palette.sky}30; }
        .b-del   { color: ${palette.rose};       border-color: ${palette.rose}30; }
        .b-seed  { color: ${palette.amber};      border-color: ${palette.amber}30; }
        .b-clear { color: ${palette.textDim};    border-color: ${palette.border}; }
        .b-srch:hover:not(:disabled)  { background: ${palette.sky}12; border-color: ${palette.sky}60; }
        .b-del:hover:not(:disabled)   { background: ${palette.rose}12; border-color: ${palette.rose}60; }
        .b-seed:hover:not(:disabled)  { background: ${palette.amber}12; border-color: ${palette.amber}60; }
        .b-clear:hover:not(:disabled) { background: #ffffff08; border-color: ${palette.textDim}; }

        .btn-trav {
          flex:1; border:none; border-radius:10px;
          padding:7px 4px; font-family:'Syne'; font-size:10px;
          font-weight:700; cursor:pointer; transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1);
          background: rgba(10, 20, 35, 0.8); backdrop-filter: blur(2px);
          border:1px solid ${palette.border}; color: ${palette.textDim};
        }
        .btn-trav:disabled { opacity:0.2; cursor:not-allowed; }
        .btn-trav:hover:not(:disabled) {
          transform: translateY(-2px);
          border-color: currentColor;
          box-shadow: 0 6px 14px rgba(0,0,0,0.3);
        }

        .bst-inp {
          flex:1; background: rgba(8, 16, 26, 0.8);
          backdrop-filter: blur(4px);
          border:1px solid ${palette.border};
          border-radius:12px; padding:9px 15px; color: #e2e8f0;
          font-family:'JetBrains Mono'; font-size:13px;
          outline:none; min-width:0;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .bst-inp:focus {
          border-color: ${palette.teal}80;
          box-shadow: 0 0 0 3px ${palette.teal}20;
        }
        .bst-inp::placeholder { color: ${palette.textDim}; }

        /* hide number input arrows */
        .bst-inp::-webkit-inner-spin-button,
        .bst-inp::-webkit-outer-spin-button { -webkit-appearance:none; }
        .bst-inp[type=number] { -moz-appearance:textfield; }
      `}</style>

      <div className="shell">

        {/* ════ LEFT — Tree canvas ════ */}
        <div className="col col-l">

          {/* header */}
          <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'12px', flexShrink:0 }}>
            <h1 style={{ fontFamily:'Syne', fontWeight:800, fontSize:'1.7rem', color:'#e2e8f0', letterSpacing:'-0.5px', lineHeight:1, margin:0, textShadow:'0 2px 5px rgba(0,0,0,0.5)' }}>
              BST
            </h1>
            <span style={{ fontFamily:'JetBrains Mono', fontSize:'10px', color:palette.emerald, background:`${palette.emerald}14`, border:`1px solid ${palette.emerald}28`, borderRadius:'20px', padding:'2px 12px', letterSpacing:'0.5px' }}>
              Binary Search Tree
            </span>
            <div style={{ marginLeft:'auto', display:'flex', gap:'8px', alignItems:'center' }}>
              {root && (
                <>
                  <span style={{ fontFamily:'JetBrains Mono', fontSize:'10px', color:palette.textDim, background:palette.zinc, padding:'2px 8px', borderRadius:'12px' }}>
                    {nodeCount} node{nodeCount > 1 ? 's' : ''}
                  </span>
                  <span style={{ fontFamily:'JetBrains Mono', fontSize:'10px', color:balanced ? palette.emerald : palette.amber, background:balanced ? `${palette.emerald}14` : `${palette.amber}14`, border:`1px solid ${balanced ? palette.emerald : palette.amber}30`, borderRadius:'12px', padding:'2px 8px' }}>
                    {balanced ? '⚖️ balanced' : '🌲 unbalanced'}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* canvas */}
          <div className="canvas" ref={wrapRef}>

            {/* empty state */}
            {!root && (
              <div style={{ position:'absolute', inset:0, zIndex:2, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'12px', pointerEvents:'none' }}>
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ opacity:0.6 }}>
                  <circle cx="24" cy="24" r="22" stroke={palette.border} strokeWidth="1.5" strokeDasharray="4 4"/>
                  <text x="24" y="28" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="20" fill={palette.border} fontWeight="500">∅</text>
                </svg>
                <p style={{ fontFamily:'JetBrains Mono', fontSize:'11px', color:palette.border, letterSpacing:'1px' }}>
                  insert a number to begin
                </p>
              </div>
            )}

            <svg
              width={svgW} height={svgH}
              style={{ position:'absolute', inset:0, zIndex:3, overflow:'visible' }}
            >
              <defs>
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur"/>
                  <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
                <filter id="glow2" x="-80%" y="-80%" width="260%" height="260%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur"/>
                  <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
                <linearGradient id="nodeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1e293b" />
                  <stop offset="100%" stopColor="#0f172a" />
                </linearGradient>
              </defs>

              {/* ── dim edges (drawn with dash for subtlety) ── */}
              {edges.map(e => (
                <motion.line
                  key={e.key}
                  x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
                  stroke={palette.border} strokeWidth={1.2} strokeLinecap="round"
                  strokeDasharray="5 3"
                  initial={{ opacity:0, pathLength:0 }}
                  animate={{ opacity:1, pathLength:1 }}
                  transition={{ duration:0.5, ease:'easeOut' }}
                />
              ))}

              {/* ── glowing edges when both endpoint nodes are highlighted ── */}
              {edges.map(e => {
                const nA = nodes.find(n => Math.round(n.x) === Math.round(e.x1) && Math.round(n.y) === Math.round(e.y1))
                const nB = nodes.find(n => Math.round(n.x) === Math.round(e.x2) && Math.round(n.y) === Math.round(e.y2))
                const lit = nA && nB && hl.has(nA.val) && hl.has(nB.val)
                if (!lit) return null
                return (
                  <motion.line
                    key={`hl-${e.key}`}
                    x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
                    stroke={hlCol} strokeWidth={2.5} strokeLinecap="round"
                    filter="url(#glow)" opacity={0.8}
                    initial={{ pathLength:0, opacity:0 }}
                    animate={{ pathLength:1, opacity:0.8 }}
                    transition={{ duration:0.3, ease:'easeOut' }}
                  />
                )
              })}

              {/* ── nodes ── */}
              <AnimatePresence>
                {nodes.map(node => {
                  const isHl  = hl.has(node.val)
                  const col   = isHl ? hlCol : palette.teal
                  const tCol  = isHl ? '#ffffff' : '#b7c9e2'
                  const bgCol = isHl ? `${hlCol}30` : 'url(#nodeGradient)'

                  return (
                    <motion.g
                      key={node.val}
                      initial={{ scale:0, opacity:0, y: -20 }}
                      animate={{ scale:1, opacity:1, y: 0 }}
                      exit={{ scale:0, opacity:0, transition:{ duration:0.2 } }}
                      transition={{ type:'spring', stiffness:450, damping:24 }}
                      style={{ transformOrigin: `${node.x}px ${node.y}px` }}
                    >
                      {/* pulse ring on highlight */}
                      {isHl && (
                        <motion.circle
                          cx={node.x} cy={node.y}
                          fill="none" stroke={hlCol} strokeWidth={1.5}
                          filter="url(#glow2)"
                          initial={{ r: node.r + 3, opacity: 0.8 }}
                          animate={{ r: node.r + 16, opacity: 0 }}
                          transition={{ duration: 1, repeat: Infinity, ease:'easeOut' }}
                        />
                      )}

                      {/* node with inner shadow effect */}
                      <circle
                        cx={node.x} cy={node.y} r={node.r}
                        fill={bgCol}
                        stroke={col} strokeWidth={isHl ? 2 : 1.5}
                        filter={isHl ? 'url(#glow)' : undefined}
                        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}
                      />

                      {/* value text */}
                      <text
                        x={node.x} y={node.y}
                        textAnchor="middle" dominantBaseline="central"
                        fontFamily="JetBrains Mono" fontWeight="700"
                        fontSize={Math.abs(node.val) >= 100 ? 9 : Math.abs(node.val) >= 10 ? 11 : 13}
                        fill={tCol}
                        style={{ userSelect:'none', pointerEvents:'none', textShadow: isHl ? '0 0 8px currentColor' : 'none' }}
                      >
                        {node.val}
                      </text>
                    </motion.g>
                  )
                })}
              </AnimatePresence>
            </svg>
          </div>

          {/* traversal sequence strip */}
          <AnimatePresence>
            {travSeq.length > 0 && (
              <motion.div
                initial={{ opacity:0, y:5 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:5 }}
                transition={{ duration:0.3 }}
                style={{ flexShrink:0, marginTop:'8px', background:'rgba(10, 20, 35, 0.8)', backdropFilter:'blur(4px)', border:'1px solid '+palette.border, borderRadius:'12px', padding:'8px 14px', display:'flex', alignItems:'center', gap:'6px', flexWrap:'wrap', minHeight:'38px', boxShadow:'0 4px 12px rgba(0,0,0,0.3)' }}
              >
                <span style={{ fontFamily:'JetBrains Mono', fontSize:'8px', color:palette.textDim, letterSpacing:'1.5px', marginRight:'6px', flexShrink:0 }}>TRAVERSAL</span>
                {travSeq.map((v, i) => {
                  const active = travActive.has(v)
                  return (
                    <motion.span key={`${v}-${i}`}
                      initial={{ opacity:0, scale:0.7 }}
                      animate={{ opacity:1, scale:1 }}
                      transition={{ delay: i * 0.37, type:'spring', stiffness:400, damping:20 }}
                      style={{
                        fontFamily:'JetBrains Mono', fontWeight:700, fontSize:'11px',
                        color:      active ? travCol : palette.textDim,
                        background: active ? `${travCol}20` : 'transparent',
                        border:     `1px solid ${active ? `${travCol}50` : palette.border}`,
                        borderRadius:'20px', padding:'2px 10px',
                        transition: 'all 0.25s',
                        boxShadow: active ? `0 0 10px ${travCol}40` : 'none',
                      }}
                    >{v}</motion.span>
                  )
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* message bar */}
          <div style={{ height:'30px', marginTop:'6px', marginBottom:'6px', flexShrink:0 }}>
            <AnimatePresence mode="wait">
              {msg && (
                <motion.div key={msg.text}
                  initial={{ opacity:0, y:3 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-3 }}
                  transition={{ duration:0.18 }}
                  style={{ background:'rgba(10, 20, 35, 0.8)', backdropFilter:'blur(4px)', border:`1px solid ${msgStyle[msg.type].b}`, borderRadius:'20px', padding:'5px 16px', fontFamily:'JetBrains Mono', fontSize:'11px', color:msgStyle[msg.type].c, height:'100%', display:'flex', alignItems:'center', boxShadow:'0 2px 8px rgba(0,0,0,0.2)' }}
                >
                  {msg.text}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* input + insert */}
          <div style={{ display:'flex', gap:'8px', marginBottom:'8px', flexShrink:0 }}>
            <input
              className="bst-inp" type="number" value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleInsert() }}
              placeholder="enter number…"
            />
            <button className="btn-insert" onClick={handleInsert}>Insert</button>
          </div>

          {/* action buttons */}
          <div style={{ display:'flex', gap:'8px', marginBottom:'8px', flexShrink:0 }}>
            <button className="btn-act b-srch"  onClick={handleSearch} disabled={!root}>Search</button>
            <button className="btn-act b-del"   onClick={handleDelete} disabled={!root}>Delete</button>
            <button className="btn-act b-seed"  onClick={handleSeed}                  >Sample</button>
            <button className="btn-act b-clear" onClick={handleClear}  disabled={!root}>Clear</button>
          </div>

          {/* traversal buttons */}
          <div style={{ display:'flex', gap:'8px', flexShrink:0 }}>
            {[
              { label:'Inorder',   fn: handleInorder,   col: palette.emerald },
              { label:'Preorder',  fn: handlePreorder,  col: palette.sky },
              { label:'Postorder', fn: handlePostorder, col: palette.amber },
            ].map(({ label, fn, col }) => (
              <button key={label} className="btn-trav" onClick={fn} disabled={!root}
                style={root ? { color:col, borderColor:`${col}50` } : {}}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ════ RIGHT — Info panel ════ */}
        <div className="col col-r">

          <div style={{ marginBottom:'12px', flexShrink:0 }}>
            <h2 style={{ fontFamily:'Syne', fontWeight:800, fontSize:'1.7rem', color:'#e2e8f0', letterSpacing:'-0.5px', lineHeight:1, margin:0, textShadow:'0 2px 5px rgba(0,0,0,0.5)' }}>
              Info
            </h2>
            <p style={{ fontFamily:'JetBrains Mono', fontSize:'10px', color:palette.textDim, marginTop:'4px' }}>
              left &lt; root &lt; right  ·  O(log n) average
            </p>
          </div>

          <div className="panel">

            {/* BST rule */}
            <div className="card">
              <p className="clabel">BST Rule</p>
              <div style={{ display:'flex', gap:'8px' }}>
                {[
                  { lbl:'Left subtree',  val:'< root', col: palette.sky },
                  { lbl:'Root',          val:'pivot',  col: palette.emerald },
                  { lbl:'Right subtree', val:'> root', col: palette.amber },
                ].map(({ lbl, val, col }) => (
                  <div key={lbl} style={{ flex:1, background:'rgba(6, 15, 26, 0.8)', border:'1px solid '+palette.border, borderRadius:'12px', padding:'10px 6px', textAlign:'center' }}>
                    <p style={{ fontFamily:'JetBrains Mono', fontSize:'8px', color:palette.textDim, marginBottom:'4px', letterSpacing:'0.5px' }}>{lbl}</p>
                    <p style={{ fontFamily:'JetBrains Mono', fontWeight:700, fontSize:'14px', color:palette.textDim }}>{val}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* complexity */}
            <div className="card">
              <p className="clabel">Complexity</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px' }}>
                {[
                  { lbl:'Search (avg)',  val:'O(log n)', col: palette.emerald },
                  { lbl:'Search (worst)',val:'O(n)',     col: palette.rose },
                  { lbl:'Insert (avg)',  val:'O(log n)', col: palette.sky },
                  { lbl:'Space',         val:'O(n)',     col: palette.amber },
                ].map(({ lbl, val, col }) => (
                  <div key={lbl} style={{ background:'rgba(6, 15, 26, 0.8)', border:'1px solid '+palette.border, borderRadius:'10px', padding:'9px 8px' }}>
                    <p style={{ fontFamily:'JetBrains Mono', fontSize:'8px', color:palette.textDim, marginBottom:'3px' }}>{lbl}</p>
                    <p style={{ fontFamily:'JetBrains Mono', fontWeight:700, fontSize:'14px', color:palette.textDim }}>{val}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* traversals */}
            <div className="card">
              <p className="clabel">Traversals</p>
              <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                {[
                  { name:'Inorder',   pattern:'L → Root → R', note:'sorted output',      col: palette.emerald },
                  { name:'Preorder',  pattern:'Root → L → R', note:'copy / serialize',   col: palette.sky },
                  { name:'Postorder', pattern:'L → R → Root', note:'delete / evaluate',  col: palette.amber },
                ].map(({ name, pattern, note, col }) => (
                  <div key={name} style={{ background:'rgba(6, 15, 26, 0.8)', border:'1px solid '+palette.border, borderRadius:'12px', padding:'10px 12px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <div>
                      <p style={{ fontFamily:'JetBrains Mono', fontWeight:700, fontSize:'11px', color:col, margin:0 }}>{name}</p>
                      <p style={{ fontFamily:'JetBrains Mono', fontSize:'9px', color:palette.textDim, marginTop:'2px' }}>{pattern}</p>
                    </div>
                    <span style={{ fontFamily:'JetBrains Mono', fontSize:'9px', color:palette.textDim, background:'#0e1625', padding:'2px 10px', borderRadius:'20px', border:'1px solid '+palette.border }}>{note}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* operations — fills rest */}
            <div className="card fill">
              <p className="clabel">Operations</p>
              <div className="olist">
                {[
                  { op:'insert(x)',   desc:'Add, preserve BST order',      col: palette.emerald },
                  { op:'delete(x)',   desc:'Remove, restructure tree',      col: palette.rose },
                  { op:'search(x)',   desc:'Go left/right until found',     col: palette.sky },
                  { op:'inorder()',   desc:'Produces sorted sequence',      col: palette.emerald },
                  { op:'height()',    desc:'Depth of deepest leaf',         col: palette.amber },
                ].map(({ op, desc, col }) => (
                  <div key={op} className="orow">
                    <div>
                      <p style={{ fontFamily:'JetBrains Mono', fontWeight:700, fontSize:'11px', color:col, margin:0 }}>{op}</p>
                      <p style={{ fontFamily:'JetBrains Mono', fontSize:'9px', color:palette.textDim, marginTop:'1px' }}>{desc}</p>
                    </div>
                    <span style={{ fontFamily:'JetBrains Mono', fontSize:'9px', color:palette.emerald, background:`${palette.emerald}12`, border:`1px solid ${palette.emerald}30`, borderRadius:'20px', padding:'2px 10px', flexShrink:0 }}>
                      O(log n)
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </>
  )
}