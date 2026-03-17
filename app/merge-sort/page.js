// 'use client'
// import { useReducer, useEffect, useRef, useCallback } from 'react'
// import { motion, AnimatePresence } from 'framer-motion'
// import Navbar from '@/comps/navbar'
// import { generateMergeSortSteps } from './ms'

// // ── colours ───────────────────────────────────────────────────────────────────
// const V  = '#8b5cf6'   // violet  — main accent
// const V2 = '#a78bfa'   // light violet
// const C  = '#06b6d4'   // cyan    — comparing
// const G  = '#10b981'   // green   — sorted / merged
// const R  = '#f87171'   // red     — placing
// const Y  = '#fbbf24'   // amber   — active range

// const BAR_STATES = {
//   sorted:    { border: `${G}70`,  bg: `${G}18`,  glow: `0 0 8px ${G}40`  },
//   comparing: { border: `${C}80`,  bg: `${C}20`,  glow: `0 0 14px ${C}55` },
//   placing:   { border: `${R}80`,  bg: `${R}20`,  glow: `0 0 14px ${R}55` },
//   active:    { border: `${Y}60`,  bg: `${Y}14`,  glow: `0 0 8px ${Y}35`  },
//   merging:   { border: `${V2}70`, bg: `${V2}18`, glow: `0 0 10px ${V2}45`},
//   default:   { border: '#0a1f35', bg: '#040d18',  glow: 'none'            },
// }

// const PSEUDO = [
//   { code: 'function mergeSort(arr, l, r)',  indent: 0 },
//   { code: 'if l >= r → return',             indent: 1 },
//   { code: 'mid = ⌊(l + r) / 2⌋',          indent: 1 },
//   { code: 'mergeSort(arr, l, mid)',          indent: 1 },
//   { code: 'mergeSort(arr, mid+1, r)',        indent: 1 },
//   { code: 'merge(arr, l, mid, r)',           indent: 1 },
//   { code: 'compare left[i] vs right[j]',    indent: 2 },
//   { code: 'place smaller element',           indent: 2 },
//   { code: 'copy remaining elements',         indent: 2 },
//   { code: '✦ subarray merged',              indent: 1 },
//   { code: '✦ array fully sorted',           indent: 0 },
// ]

// const LEGEND = [
//   { key: 'default',   label: 'Unsorted'  },
//   { key: 'active',    label: 'Range'     },
//   { key: 'comparing', label: 'Comparing' },
//   { key: 'placing',   label: 'Placing'   },
//   { key: 'sorted',    label: 'Sorted'    },
// ]

// // ── reducer ───────────────────────────────────────────────────────────────────
// const randomArray = (size) =>
//   Array.from({ length: size }, () => Math.floor(Math.random() * 340) + 30)

// const init = { arraySize: 20, speed: 180, steps: [], stepIndex: 0, isPlaying: false, isDone: false }

// function reducer(state, action) {
//   switch (action.type) {
//     case 'GENERATE': return { ...state, steps: action.steps, stepIndex: 0, isPlaying: false, isDone: false }
//     case 'PLAY':     return { ...state, isPlaying: true,  isDone: false }
//     case 'PAUSE':    return { ...state, isPlaying: false }
//     case 'NEXT_STEP': {
//       const next = state.stepIndex + 1
//       if (next >= state.steps.length - 1)
//         return { ...state, stepIndex: state.steps.length - 1, isPlaying: false, isDone: true }
//       return { ...state, stepIndex: next }
//     }
//     case 'RESET':     return { ...state, stepIndex: 0, isPlaying: false, isDone: false }
//     case 'SET_SPEED': return { ...state, speed: action.speed }
//     case 'SET_SIZE':  return { ...state, arraySize: action.arraySize }
//     default:          return state
//   }
// }

// export default function MergeSortPage() {
//   const [state, dispatch] = useReducer(reducer, init)
//   const { arraySize, speed, steps, stepIndex, isPlaying, isDone } = state
//   const iRef = useRef(null)

//   const step = steps[stepIndex] ?? {
//     array: randomArray(arraySize), phase: 'idle',
//     left: 0, mid: 0, right: 0,
//     comparing: [], merging: [], sorted: [], currentLine: -1, depth: 0,
//   }

//   useEffect(() => {
//     clearInterval(iRef.current)
//     dispatch({ type: 'GENERATE', steps: generateMergeSortSteps(randomArray(arraySize)) })
//   }, [arraySize])

//   useEffect(() => {
//     if (!isPlaying || !steps.length) { clearInterval(iRef.current); return }
//     clearInterval(iRef.current)
//     iRef.current = setInterval(() => dispatch({ type: 'NEXT_STEP' }), speed)
//     return () => clearInterval(iRef.current)
//   }, [isPlaying, speed, steps.length])

//   useEffect(() => () => clearInterval(iRef.current), [])

//   const handleGenerate = useCallback(() => {
//     clearInterval(iRef.current)
//     dispatch({ type: 'GENERATE', steps: generateMergeSortSteps(randomArray(arraySize)) })
//   }, [arraySize])

//   const handlePlay  = useCallback(() => { if (!isDone && steps.length) dispatch({ type: 'PLAY'      }) }, [isDone, steps.length])
//   const handlePause = useCallback(() => { clearInterval(iRef.current); dispatch({ type: 'PAUSE' })     }, [])
//   const handleStep  = useCallback(() => { if (!isDone && steps.length) dispatch({ type: 'NEXT_STEP' }) }, [isDone, steps.length])
//   const handleReset = useCallback(() => { clearInterval(iRef.current); dispatch({ type: 'RESET' })     }, [])

//   // ── bar state ──────────────────────────────────────────────────────────────
//   const getBarState = (i) => {
//     if (step.sorted?.includes(i))    return 'sorted'
//     if (step.comparing?.includes(i)) return 'comparing'
//     if (step.merging?.includes(i))   return 'placing'
//     if (i >= step.left && i <= step.right && step.phase !== 'done') return 'active'
//     return 'default'
//   }

//   const maxVal = Math.max(...(step.array || [1]))
//   const pct    = steps.length > 1 ? (stepIndex / (steps.length - 1)) * 100 : 0
//   const sortedCount = step.sorted?.length ?? 0

//   // ── status ─────────────────────────────────────────────────────────────────
//   const phaseLabel = {
//     idle:    { text: 'Press ▶ Play or ⏭ Step to begin',  color: '#334155' },
//     split:   { text: `Splitting  [${step.left}…${step.right}]  at mid ${step.mid}`, color: V2 },
//     single:  { text: `Base case — single element at [${step.left}]`, color: Y },
//     compare: { text: `Comparing  arr[${step.comparing?.[0]}]  vs  arr[${step.comparing?.[1]}]`, color: C },
//     place:   { text: `Placing element at index ${step.merging?.[0]}`, color: R },
//     merged:  { text: `✦ Merged  [${step.left}…${step.right}]  — ${step.right - step.left + 1} elements sorted`, color: G },
//     done:    { text: '✦ Array fully sorted', color: G },
//   }
//   const status = phaseLabel[step.phase] ?? phaseLabel.idle

//   // max recursion depth for depth meter
//   const maxDepth = Math.ceil(Math.log2(arraySize + 1))

//   return (
//     <>
//       <Navbar />

//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');
//         html,body{margin:0;padding:0;overflow:hidden;height:100%;}
//         *,*::before,*::after{box-sizing:border-box;}

//         .shell {
//           height: calc(100vh - 52px);
//           background: #030612;
//           color: white;
//           display: flex;
//           flex-direction: column;
//           overflow: hidden;
//           padding: 14px 20px 12px;
//           gap: 10px;
//           position: relative;
//         }

//         /* violet ambient */
//         .shell::before {
//           content:'';position:absolute;top:-80px;left:50%;
//           transform:translateX(-50%);width:700px;height:280px;
//           background:radial-gradient(ellipse,${V}0a 0%,transparent 70%);
//           pointer-events:none;z-index:0;
//         }
//         .shell::after {
//           content:'';position:absolute;inset:0;pointer-events:none;z-index:0;
//           background-image:radial-gradient(circle,${V}0e 1px,transparent 1px);
//           background-size:26px 26px;
//         }

//         .inner {position:relative;z-index:1;flex:1;min-height:0;display:flex;flex-direction:column;gap:10px;}

//         /* bar canvas */
//         .canvas {
//           flex:1;min-height:0;
//           background:#040912;
//           border:1px solid #150a2e;
//           border-radius:14px;
//           padding:14px 14px 8px;
//           display:flex;align-items:flex-end;gap:2px;
//           position:relative;overflow:hidden;
//         }
//         .canvas::before {
//           content:'';position:absolute;inset:0;pointer-events:none;
//           background:linear-gradient(#150a2e10 1px,transparent 1px),
//                      linear-gradient(90deg,#150a2e10 1px,transparent 1px);
//           background-size:36px 36px;border-radius:14px;
//         }

//         /* range bracket overlay */
//         .range-bar {
//           position:absolute;bottom:0;height:3px;
//           border-radius:999px;pointer-events:none;z-index:10;
//           transition:left 0.15s,width 0.15s;
//         }

//         /* bottom strip */
//         .bottom {
//           display:flex;gap:10px;flex-shrink:0;
//           align-items:stretch;
//         }

//         /* left controls col */
//         .ctrl-col {
//           flex:1;min-width:0;
//           display:flex;flex-direction:column;gap:8px;
//         }

//         .status-bar {
//           background:#040912;border:1px solid #150a2e;
//           border-radius:9px;padding:7px 14px;
//           font-family:'JetBrains Mono',monospace;font-size:11px;
//           height:32px;display:flex;align-items:center;flex-shrink:0;
//         }

//         .progress-wrap {
//           background:#040912;border:1px solid #150a2e;
//           border-radius:9px;padding:7px 14px;flex-shrink:0;
//         }

//         .ctrl-wrap {
//           flex:1;min-height:0;
//           background:#040912;border:1px solid #150a2e;
//           border-radius:9px;padding:9px 14px;
//           display:flex;align-items:center;
//         }

//         /* pseudocode */
//         .pseudo-panel {
//           width:230px;flex-shrink:0;
//           background:#040912;border:1px solid #150a2e;
//           border-radius:14px;overflow:hidden;
//           display:flex;flex-direction:column;
//         }

//         /* depth meter */
//         .depth-panel {
//           width:52px;flex-shrink:0;
//           background:#040912;border:1px solid #150a2e;
//           border-radius:14px;overflow:hidden;
//           display:flex;flex-direction:column;
//           align-items:center;padding:10px 6px;gap:6px;
//         }

//         /* buttons */
//         .btn {
//           border:none;border-radius:8px;cursor:pointer;
//           font-family:'Syne',sans-serif;font-weight:700;
//           transition:all 0.18s;letter-spacing:0.3px;
//         }
//         .btn:disabled{opacity:0.25;cursor:not-allowed;}
//         .btn:hover:not(:disabled){transform:translateY(-1px);}

//         .btn-play {
//           background:linear-gradient(135deg,${V},#7c3aed);
//           color:#fff;padding:9px 20px;font-size:12px;
//           box-shadow:0 0 16px ${V}30;
//         }
//         .btn-play:hover:not(:disabled){box-shadow:0 0 24px ${V}55;}

//         .btn-sm {
//           background:${V}14;color:${V2};
//           border:1px solid ${V}30 !important;
//           padding:8px 14px;font-size:11px;
//         }
//         .btn-sm.b-gen  {background:${C}14;color:${C};border:1px solid ${C}30 !important;}
//         .btn-sm.b-step {background:${Y}14;color:${Y};border:1px solid ${Y}30 !important;}
//         .btn-sm.b-rst  {background:#64748b14;color:#64748b;border:1px solid #64748b28 !important;}

//         input[type=range] { accent-color:${V}; }
//       `}</style>

//       <div className="shell">
//         <div className="inner">

//           {/* ── HEADER ── */}
//           <div style={{ display:'flex', alignItems:'center', gap:'10px', flexShrink:0 }}>
//             <h1 style={{ fontFamily:'Syne', fontWeight:800, fontSize:'1.5rem', color:'#e2e8f0', letterSpacing:'-0.5px', lineHeight:1, margin:0 }}>
//               Merge Sort
//             </h1>
//             <span style={{ fontFamily:'JetBrains Mono', fontSize:'10px', color:V2, background:`${V}14`, border:`1px solid ${V}30`, borderRadius:'4px', padding:'2px 8px', letterSpacing:'0.5px' }}>
//               O(n log n)
//             </span>
//             <span style={{ fontFamily:'JetBrains Mono', fontSize:'10px', color:'#1e3a5c' }}>
//               divide &amp; conquer
//             </span>

//             {sortedCount > 0 && (
//               <motion.span initial={{opacity:0}} animate={{opacity:1}}
//                 style={{ fontFamily:'JetBrains Mono', fontSize:'10px', color:G, background:`${G}14`, border:`1px solid ${G}28`, borderRadius:'4px', padding:'2px 8px' }}>
//                 {sortedCount} / {arraySize} sorted
//               </motion.span>
//             )}

//             {/* legend */}
//             <div style={{ display:'flex', gap:'12px', marginLeft:'auto', alignItems:'center' }}>
//               {LEGEND.map(({ key, label }) => (
//                 <span key={key} style={{ display:'flex', alignItems:'center', gap:'5px', fontFamily:'JetBrains Mono', fontSize:'10px', color:BAR_STATES[key].border.replace('70','').replace('80','').replace('60','') }}>
//                   <span style={{ width:8, height:8, borderRadius:'2px', backgroundColor:BAR_STATES[key].border, display:'inline-block', flexShrink:0, boxShadow:BAR_STATES[key].glow }} />
//                   {label}
//                 </span>
//               ))}
//             </div>
//           </div>

//           {/* ── MAIN ROW: canvas + depth meter ── */}
//           <div style={{ flex:1, minHeight:0, display:'flex', gap:'10px', overflow:'hidden' }}>

//             {/* BAR CANVAS */}
//             <div className="canvas" style={{ flex:1 }}>

//               {/* active range bracket at bottom */}
//               {step.phase !== 'idle' && step.phase !== 'done' && step.array?.length > 0 && (
//                 <motion.div
//                   className="range-bar"
//                   animate={{
//                     left:  `${(step.left  / step.array.length) * 100}%`,
//                     width: `${((step.right - step.left + 1) / step.array.length) * 100}%`,
//                     background: step.phase === 'merged' ? G : V2,
//                     boxShadow: step.phase === 'merged' ? `0 0 8px ${G}60` : `0 0 8px ${V2}60`,
//                   }}
//                   transition={{ duration:0.2 }}
//                 />
//               )}

//               {/* mid divider line */}
//               {(step.phase === 'split' || step.phase === 'compare' || step.phase === 'place' || step.phase === 'merged') &&
//                step.array?.length > 0 && step.mid > step.left && (
//                 <motion.div
//                   animate={{ opacity:[0.4,0.8,0.4] }}
//                   transition={{ duration:1.2, repeat:Infinity }}
//                   style={{
//                     position:'absolute', bottom:0, zIndex:9,
//                     left:`${((step.mid + 0.5) / step.array.length) * 100}%`,
//                     width:'1px', top:'8px',
//                     background:`linear-gradient(to bottom,transparent,${V2}80,${V2}80,transparent)`,
//                     pointerEvents:'none',
//                   }}
//                 />
//               )}

//               {/* bars */}
//               {step.array?.map((value, i) => {
//                 const s    = getBarState(i)
//                 const meta = BAR_STATES[s]
//                 const h    = Math.max((value / maxVal) * 100, 1)

//                 return (
//                   <div key={i} style={{ flex:1, height:'100%', display:'flex', alignItems:'flex-end', position:'relative', zIndex:5 }}>
//                     <motion.div
//                       animate={{
//                         height:      `${h}%`,
//                         background:  `linear-gradient(to top, ${meta.border}, ${meta.bg})`,
//                         borderColor: meta.border,
//                         boxShadow:   meta.glow,
//                       }}
//                       transition={{ duration:0.12, ease:'easeOut' }}
//                       style={{
//                         width:'100%', minHeight:'3px',
//                         borderRadius:'3px 3px 1px 1px',
//                         border:`1px solid ${meta.border}`,
//                         position:'relative', overflow:'hidden',
//                       }}
//                     >
//                       {(s === 'comparing' || s === 'placing') && (
//                         <motion.div
//                           animate={{ y:['-100%','220%'] }}
//                           transition={{ duration:0.7, repeat:Infinity, ease:'linear' }}
//                           style={{ position:'absolute', left:0, right:0, height:'35%', background:`linear-gradient(to bottom,transparent,${meta.border}70,transparent)`, pointerEvents:'none' }}
//                         />
//                       )}
//                     </motion.div>
//                   </div>
//                 )
//               })}
//             </div>

//             {/* DEPTH METER */}
//             <div className="depth-panel">
//               <span style={{ fontFamily:'Syne', fontWeight:700, fontSize:'8px', color:'#1e3050', letterSpacing:'2px', textTransform:'uppercase', writingMode:'vertical-rl', transform:'rotate(180deg)', marginBottom:'4px' }}>
//                 Depth
//               </span>
//               <div style={{ flex:1, display:'flex', flexDirection:'column', gap:'4px', justifyContent:'flex-end', width:'100%' }}>
//                 {Array.from({ length: maxDepth }).map((_, d) => {
//                   const isActive = step.depth === d && step.phase !== 'done' && step.phase !== 'idle'
//                   return (
//                     <motion.div key={d}
//                       animate={{
//                         background: isActive ? `linear-gradient(135deg,${V},${V2})` : '#0a1628',
//                         boxShadow:  isActive ? `0 0 10px ${V}60` : 'none',
//                         scale:      isActive ? 1.08 : 1,
//                       }}
//                       transition={{ duration:0.2 }}
//                       style={{ width:'100%', height:'18px', borderRadius:'4px', border:`1px solid ${isActive ? V : '#150a2e'}`, display:'flex', alignItems:'center', justifyContent:'center' }}
//                     >
//                       <span style={{ fontFamily:'JetBrains Mono', fontSize:'8px', color: isActive ? 'white' : '#1e3050', fontWeight: isActive ? 700 : 400 }}>{d}</span>
//                     </motion.div>
//                   )
//                 })}
//               </div>
//               <span style={{ fontFamily:'JetBrains Mono', fontSize:'7px', color:'#1e3050', letterSpacing:'0.5px', marginTop:'4px' }}>
//                 lvl
//               </span>
//             </div>
//           </div>

//           {/* ── BOTTOM STRIP ── */}
//           <div className="bottom">

//             {/* left: status + progress + controls */}
//             <div className="ctrl-col">

//               {/* status */}
//               <div className="status-bar">
//                 <AnimatePresence mode="wait">
//                   <motion.span key={status.text}
//                     initial={{opacity:0,y:3}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-3}}
//                     transition={{duration:0.15}}
//                     style={{ color:status.color, letterSpacing:'0.3px' }}>
//                     {status.text}
//                   </motion.span>
//                 </AnimatePresence>
//               </div>

//               {/* progress */}
//               <div className="progress-wrap">
//                 <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'JetBrains Mono', fontSize:'10px', color:'#1e3a5c', marginBottom:'5px' }}>
//                   <span>Progress</span>
//                   <span style={{ color: pct > 0 ? V2 : '#1e3a5c' }}>{stepIndex} / {Math.max(steps.length - 1, 0)}</span>
//                 </div>
//                 <div style={{ width:'100%', height:'4px', background:'#0a1628', borderRadius:'999px', overflow:'hidden' }}>
//                   <motion.div
//                     animate={{ width:`${pct}%` }}
//                     transition={{ duration:0.08 }}
//                     style={{
//                       height:'4px', borderRadius:'999px',
//                       background: isDone
//                         ? `linear-gradient(90deg,${G},#34d399)`
//                         : `linear-gradient(90deg,${V},${V2})`,
//                       boxShadow: isDone ? `0 0 8px ${G}60` : `0 0 8px ${V}60`,
//                     }}
//                   />
//                 </div>
//               </div>

//               {/* controls */}
//               <div className="ctrl-wrap">
//                 <div style={{ display:'flex', alignItems:'center', gap:'8px', width:'100%', flexWrap:'wrap' }}>

//                   {/* play/pause */}
//                   <button className="btn btn-play" onClick={isPlaying ? handlePause : handlePlay} disabled={isDone && !isPlaying}>
//                     {isPlaying ? '⏸ Pause' : isDone ? '✦ Done' : '▶ Play'}
//                   </button>

//                   <button className="btn btn-sm b-step" onClick={handleStep} disabled={isPlaying || isDone}>⏭ Step</button>
//                   <button className="btn btn-sm b-rst"  onClick={handleReset} disabled={stepIndex === 0 && !isDone}>↺ Reset</button>
//                   <button className="btn btn-sm b-gen"  onClick={handleGenerate}>⟳ New Array</button>

//                   {/* speed */}
//                   <div style={{ display:'flex', alignItems:'center', gap:'6px', marginLeft:'auto' }}>
//                     <span style={{ fontFamily:'JetBrains Mono', fontSize:'9px', color:'#1e3a5c' }}>🐢</span>
//                     <input type="range" min={40} max={800} step={20}
//                       value={1040 - speed}
//                       onChange={e => dispatch({ type:'SET_SPEED', speed: 1040 - Number(e.target.value) })}
//                       style={{ width:'80px' }}
//                     />
//                     <span style={{ fontFamily:'JetBrains Mono', fontSize:'9px', color:'#1e3a5c' }}>🐇</span>
//                     <span style={{ fontFamily:'JetBrains Mono', fontSize:'9px', color:'#334155', minWidth:'36px' }}>{speed}ms</span>
//                   </div>

//                   {/* array size */}
//                   <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
//                     <span style={{ fontFamily:'JetBrains Mono', fontSize:'9px', color:'#1e3a5c' }}>n:</span>
//                     <input type="range" min={6} max={40} step={2}
//                       value={arraySize}
//                       onChange={e => dispatch({ type:'SET_SIZE', arraySize: Number(e.target.value) })}
//                       style={{ width:'70px' }}
//                     />
//                     <span style={{ fontFamily:'JetBrains Mono', fontSize:'9px', color:'#334155', minWidth:'20px' }}>{arraySize}</span>
//                   </div>

//                 </div>
//               </div>
//             </div>

//             {/* pseudocode panel */}
//             <div className="pseudo-panel">
//               <div style={{ padding:'8px 12px 4px', borderBottom:'1px solid #150a2e', flexShrink:0 }}>
//                 <span style={{ fontFamily:'Syne', fontWeight:700, fontSize:'9px', color:'#1e3050', letterSpacing:'2px', textTransform:'uppercase' }}>
//                   Pseudocode
//                 </span>
//               </div>
//               <div style={{ flex:1, overflow:'hidden', padding:'6px 8px', display:'flex', flexDirection:'column', gap:'1px' }}>
//                 {PSEUDO.map((line, i) => {
//                   const active = i === step.currentLine
//                   return (
//                     <motion.div key={i}
//                       animate={{
//                         background: active ? `${V}20` : 'transparent',
//                         borderLeftColor: active ? V : 'transparent',
//                       }}
//                       transition={{ duration:0.15 }}
//                       style={{
//                         paddingLeft: `${line.indent * 14 + 8}px`,
//                         paddingTop:'3px', paddingBottom:'3px', paddingRight:'8px',
//                         borderRadius:'5px',
//                         borderLeft:`2px solid ${active ? V : 'transparent'}`,
//                         fontFamily:'JetBrains Mono', fontSize:'10px',
//                         color: active ? V2 : '#1e3050',
//                         fontWeight: active ? 700 : 400,
//                         lineHeight:1.4,
//                         display:'flex', alignItems:'center', gap:'6px',
//                       }}
//                     >
//                       {active && (
//                         <motion.span
//                           animate={{ opacity:[1,0.3,1] }}
//                           transition={{ duration:0.8, repeat:Infinity }}
//                           style={{ color:V2, fontSize:'8px', flexShrink:0 }}
//                         >▶</motion.span>
//                       )}
//                       <span style={{ marginLeft: active ? 0 : '14px' }}>{line.code}</span>
//                     </motion.div>
//                   )
//                 })}
//               </div>

//               {/* complexity footer */}
//               <div style={{ borderTop:'1px solid #150a2e', padding:'8px 12px', display:'flex', justifyContent:'space-between', flexShrink:0 }}>
//                 {[
//                   { lbl:'Time', val:'O(n log n)', col:V2 },
//                   { lbl:'Space', val:'O(n)', col:Y     },
//                   { lbl:'Stable', val:'Yes', col:G     },
//                 ].map(({lbl,val,col})=>(
//                   <div key={lbl} style={{ textAlign:'center' }}>
//                     <p style={{ fontFamily:'JetBrains Mono', fontSize:'7px', color:'#1e3050', marginBottom:'2px', letterSpacing:'1px' }}>{lbl.toUpperCase()}</p>
//                     <p style={{ fontFamily:'JetBrains Mono', fontWeight:700, fontSize:'11px', color:col, margin:0 }}>{val}</p>
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
import { useReducer, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '@/comps/navbar'
import { generateMergeSortSteps } from './ms'

// ── Premium color palette ─────────────────────────────────────────────────────
const palette = {
  violet: '#8b5cf6',
  violetLight: '#a78bfa',
  cyan: '#06b6d4',
  green: '#10b981',
  red: '#f87171',
  amber: '#fbbf24',
  darkBg: '#030612',
  cardBg: 'rgba(4, 9, 18, 0.8)',
  border: '#1e2a4a',
  textDim: '#8a9bb5',
  text: '#e2e8f0',
  glow: 'rgba(139, 92, 246, 0.4)',
}

const BAR_STATES = {
  sorted:    { border: `${palette.green}70`,  bg: `${palette.green}18`,  glow: `0 0 12px ${palette.green}50`  },
  comparing: { border: `${palette.cyan}80`,  bg: `${palette.cyan}20`,  glow: `0 0 18px ${palette.cyan}70` },
  placing:   { border: `${palette.red}80`,   bg: `${palette.red}20`,   glow: `0 0 18px ${palette.red}70`  },
  active:    { border: `${palette.amber}60`, bg: `${palette.amber}14`, glow: `0 0 12px ${palette.amber}40` },
  merging:   { border: `${palette.violetLight}70`, bg: `${palette.violetLight}18`, glow: `0 0 14px ${palette.violetLight}60` },
  default:   { border: '#1e3050',             bg: '#0f1a30',           glow: 'none' },
}

const PSEUDO = [
  { code: 'function mergeSort(arr, l, r)',  indent: 0 },
  { code: 'if l >= r → return',             indent: 1 },
  { code: 'mid = ⌊(l + r) / 2⌋',            indent: 1 },
  { code: 'mergeSort(arr, l, mid)',          indent: 1 },
  { code: 'mergeSort(arr, mid+1, r)',        indent: 1 },
  { code: 'merge(arr, l, mid, r)',           indent: 1 },
  { code: 'compare left[i] vs right[j]',     indent: 2 },
  { code: 'place smaller element',            indent: 2 },
  { code: 'copy remaining elements',          indent: 2 },
  { code: '✦ subarray merged',                indent: 1 },
  { code: '✦ array fully sorted',             indent: 0 },
]

const LEGEND = [
  { key: 'default',   label: 'Unsorted'  },
  { key: 'active',    label: 'Range'     },
  { key: 'comparing', label: 'Comparing' },
  { key: 'placing',   label: 'Placing'   },
  { key: 'sorted',    label: 'Sorted'    },
]

// ── reducer ───────────────────────────────────────────────────────────────────
const randomArray = (size) =>
  Array.from({ length: size }, () => Math.floor(Math.random() * 340) + 30)

const init = { arraySize: 20, speed: 180, steps: [], stepIndex: 0, isPlaying: false, isDone: false }

function reducer(state, action) {
  switch (action.type) {
    case 'GENERATE': return { ...state, steps: action.steps, stepIndex: 0, isPlaying: false, isDone: false }
    case 'PLAY':     return { ...state, isPlaying: true,  isDone: false }
    case 'PAUSE':    return { ...state, isPlaying: false }
    case 'NEXT_STEP': {
      const next = state.stepIndex + 1
      if (next >= state.steps.length - 1)
        return { ...state, stepIndex: state.steps.length - 1, isPlaying: false, isDone: true }
      return { ...state, stepIndex: next }
    }
    case 'RESET':     return { ...state, stepIndex: 0, isPlaying: false, isDone: false }
    case 'SET_SPEED': return { ...state, speed: action.speed }
    case 'SET_SIZE':  return { ...state, arraySize: action.arraySize }
    default:          return state
  }
}

export default function MergeSortPage() {
  const [state, dispatch] = useReducer(reducer, init)
  const { arraySize, speed, steps, stepIndex, isPlaying, isDone } = state
  const iRef = useRef(null)

  const step = steps[stepIndex] ?? {
    array: randomArray(arraySize), phase: 'idle',
    left: 0, mid: 0, right: 0,
    comparing: [], merging: [], sorted: [], currentLine: -1, depth: 0,
  }

  // Generate steps when array size changes
  useEffect(() => {
    clearInterval(iRef.current)
    dispatch({ type: 'GENERATE', steps: generateMergeSortSteps(randomArray(arraySize)) })
  }, [arraySize])

  // Playback interval
  useEffect(() => {
    if (!isPlaying || !steps.length) { clearInterval(iRef.current); return }
    clearInterval(iRef.current)
    iRef.current = setInterval(() => dispatch({ type: 'NEXT_STEP' }), speed)
    return () => clearInterval(iRef.current)
  }, [isPlaying, speed, steps.length])

  // Cleanup on unmount
  useEffect(() => () => clearInterval(iRef.current), [])

  const handleGenerate = useCallback(() => {
    clearInterval(iRef.current)
    dispatch({ type: 'GENERATE', steps: generateMergeSortSteps(randomArray(arraySize)) })
  }, [arraySize])

  const handlePlay  = useCallback(() => { if (!isDone && steps.length) dispatch({ type: 'PLAY'      }) }, [isDone, steps.length])
  const handlePause = useCallback(() => { clearInterval(iRef.current); dispatch({ type: 'PAUSE' })     }, [])
  const handleStep  = useCallback(() => { if (!isDone && steps.length) dispatch({ type: 'NEXT_STEP' }) }, [isDone, steps.length])
  const handleReset = useCallback(() => { clearInterval(iRef.current); dispatch({ type: 'RESET' })     }, [])

  // ── bar state ──────────────────────────────────────────────────────────────
  const getBarState = (i) => {
    if (step.sorted?.includes(i))    return 'sorted'
    if (step.comparing?.includes(i)) return 'comparing'
    if (step.merging?.includes(i))   return 'placing'
    if (i >= step.left && i <= step.right && step.phase !== 'done') return 'active'
    return 'default'
  }

  const maxVal = Math.max(...(step.array || [1]))
  const pct    = steps.length > 1 ? (stepIndex / (steps.length - 1)) * 100 : 0
  const sortedCount = step.sorted?.length ?? 0

  // ── status ─────────────────────────────────────────────────────────────────
  const phaseLabel = {
    idle:    { text: 'Press ▶ Play or ⏭ Step to begin',  color: palette.textDim },
    split:   { text: `Splitting  [${step.left}…${step.right}]  at mid ${step.mid}`, color: palette.violetLight },
    single:  { text: `Base case — single element at [${step.left}]`, color: palette.amber },
    compare: { text: `Comparing  arr[${step.comparing?.[0]}]  vs  arr[${step.comparing?.[1]}]`, color: palette.cyan },
    place:   { text: `Placing element at index ${step.merging?.[0]}`, color: palette.red },
    merged:  { text: `✦ Merged  [${step.left}…${step.right}]  — ${step.right - step.left + 1} elements sorted`, color: palette.green },
    done:    { text: '✦ Array fully sorted', color: palette.green },
  }
  const status = phaseLabel[step.phase] ?? phaseLabel.idle

  // max recursion depth for depth meter
  const maxDepth = Math.ceil(Math.log2(arraySize + 1))

  return (
    <>
      <Navbar />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');
        html,body{margin:0;padding:0;overflow:hidden;height:100%;background:${palette.darkBg};}
        *,*::before,*::after{box-sizing:border-box;}

        .shell {
          height: calc(100vh - 52px);
          background: radial-gradient(circle at 50% 20%, #1a1f3a, ${palette.darkBg});
          color: white;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          padding: 14px 20px 12px;
          gap: 10px;
          position: relative;
        }

        /* premium noise overlay */
        .shell::after {
          content:''; position:absolute; inset:0; pointer-events:none; z-index:0;
          background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.015'/%3E%3C/svg%3E");
        }

        .inner {position:relative;z-index:1;flex:1;min-height:0;display:flex;flex-direction:column;gap:10px;}

        /* bar canvas */
        .canvas {
          flex:1;min-height:0;
          background:${palette.cardBg};
          backdrop-filter:blur(8px);
          border:1px solid ${palette.border};
          border-radius:24px;
          padding:14px 14px 8px;
          display:flex;align-items:flex-end;gap:2px;
          position:relative;overflow:hidden;
          box-shadow:0 20px 40px -15px rgba(0,0,0,0.7), inset 0 1px 2px rgba(255,255,255,0.05);
        }
        .canvas::before {
          content:'';position:absolute;inset:0;pointer-events:none;
          background:linear-gradient(${palette.border}10 1px, transparent 1px),
                     linear-gradient(90deg,${palette.border}10 1px, transparent 1px);
          background-size:36px 36px;border-radius:24px;
        }

        /* range bracket */
        .range-bar {
          position:absolute;bottom:0;height:4px;
          border-radius:999px;pointer-events:none;z-index:10;
          transition:left 0.2s,width 0.2s;
          filter:drop-shadow(0 0 8px currentColor);
        }

        /* bottom strip */
        .bottom {
          display:flex;gap:10px;flex-shrink:0;
          align-items:stretch;
        }

        /* left controls col */
        .ctrl-col {
          flex:1;min-width:0;
          display:flex;flex-direction:column;gap:8px;
        }

        .status-bar {
          background:${palette.cardBg};
          backdrop-filter:blur(8px);
          border:1px solid ${palette.border};
          border-radius:12px;
          padding:8px 16px;
          font-family:'JetBrains Mono',monospace;font-size:11px;
          height:38px;display:flex;align-items:center;flex-shrink:0;
          box-shadow:0 4px 12px rgba(0,0,0,0.3);
        }

        .progress-wrap {
          background:${palette.cardBg};
          backdrop-filter:blur(8px);
          border:1px solid ${palette.border};
          border-radius:12px;
          padding:8px 14px;flex-shrink:0;
          box-shadow:0 4px 12px rgba(0,0,0,0.3);
        }

        .ctrl-wrap {
          flex:1;min-height:0;
          background:${palette.cardBg};
          backdrop-filter:blur(8px);
          border:1px solid ${palette.border};
          border-radius:12px;
          padding:10px 16px;
          display:flex;align-items:center;
          box-shadow:0 4px 12px rgba(0,0,0,0.3);
        }

        /* pseudocode panel */
        .pseudo-panel {
          width:260px;flex-shrink:0;
          background:${palette.cardBg};
          backdrop-filter:blur(8px);
          border:1px solid ${palette.border};
          border-radius:20px;
          overflow:hidden;
          display:flex;flex-direction:column;
          box-shadow:0 20px 30px -15px rgba(0,0,0,0.7);
        }

        /* depth meter */
        .depth-panel {
          width:60px;flex-shrink:0;
          background:${palette.cardBg};
          backdrop-filter:blur(8px);
          border:1px solid ${palette.border};
          border-radius:20px;
          overflow:hidden;
          display:flex;flex-direction:column;
          align-items:center;padding:12px 6px;gap:8px;
          box-shadow:0 20px 30px -15px rgba(0,0,0,0.7);
        }

        /* buttons */
        .btn {
          border:none;border-radius:10px;cursor:pointer;
          font-family:'Syne',sans-serif;font-weight:700;
          transition:all 0.2s cubic-bezier(0.4,0,0.2,1);
          letter-spacing:0.3px;
        }
        .btn:disabled{opacity:0.25;cursor:not-allowed;}
        .btn:hover:not(:disabled){transform:translateY(-2px);}

        .btn-play {
          background:linear-gradient(135deg,${palette.violet},#7c3aed);
          color:#fff;padding:9px 22px;font-size:12px;
          box-shadow:0 8px 16px -6px ${palette.glow};
        }
        .btn-play:hover:not(:disabled){box-shadow:0 14px 24px -8px ${palette.violet}80;}

        .btn-sm {
          background:rgba(8,6,16,0.6);
          backdrop-filter:blur(4px);
          border:1px solid ${palette.border} !important;
          padding:8px 14px;font-size:11px;
          color:${palette.textDim};
        }
        .btn-sm:hover:not(:disabled){border-color:currentColor !important;}
        .b-gen  { color:${palette.cyan}; }
        .b-step { color:${palette.amber}; }
        .b-rst  { color:${palette.textDim}; }

        input[type=range] { accent-color:${palette.violet}; }
      `}</style>

      <div className="shell">
        <div className="inner">

          {/* ── HEADER ── */}
          <div style={{ display:'flex', alignItems:'center', gap:'10px', flexShrink:0 }}>
            <h1 style={{ fontFamily:'Syne', fontWeight:800, fontSize:'1.6rem', color:'#e2e8f0', letterSpacing:'-0.5px', lineHeight:1, margin:0 }}>
              Merge Sort
            </h1>
            <span style={{ fontFamily:'JetBrains Mono', fontSize:'10px', color:palette.violetLight, background:`${palette.violet}20`, border:`1px solid ${palette.violet}40`, borderRadius:'20px', padding:'2px 12px' }}>
              O(n log n)
            </span>
            <span style={{ fontFamily:'JetBrains Mono', fontSize:'10px', color:palette.textDim }}>
              divide & conquer
            </span>

            {sortedCount > 0 && (
              <motion.span
                initial={{opacity:0, scale:0.9}}
                animate={{opacity:1, scale:1}}
                style={{ fontFamily:'JetBrains Mono', fontSize:'10px', color:palette.green, background:`${palette.green}20`, border:`1px solid ${palette.green}40`, borderRadius:'20px', padding:'2px 12px' }}
              >
                {sortedCount} / {arraySize} sorted
              </motion.span>
            )}

            {/* legend */}
            <div style={{ display:'flex', gap:'12px', marginLeft:'auto', alignItems:'center' }}>
              {LEGEND.map(({ key, label }) => (
                <span key={key} style={{ display:'flex', alignItems:'center', gap:'5px', fontFamily:'JetBrains Mono', fontSize:'9px', color:BAR_STATES[key].border.replace('70','').replace('80','').replace('60','') }}>
                  <span style={{ width:8, height:8, borderRadius:'2px', backgroundColor:BAR_STATES[key].border, display:'inline-block', boxShadow:BAR_STATES[key].glow }} />
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* ── MAIN ROW: canvas + depth meter ── */}
          <div style={{ flex:1, minHeight:0, display:'flex', gap:'10px', overflow:'hidden' }}>

            {/* BAR CANVAS */}
            <div className="canvas" style={{ flex:1 }}>

              {/* active range bracket */}
              {step.phase !== 'idle' && step.phase !== 'done' && step.array?.length > 0 && (
                <motion.div
                  className="range-bar"
                  animate={{
                    left:  `${(step.left  / step.array.length) * 100}%`,
                    width: `${((step.right - step.left + 1) / step.array.length) * 100}%`,
                    background: step.phase === 'merged' ? palette.green : palette.violetLight,
                    boxShadow: step.phase === 'merged' ? `0 0 12px ${palette.green}` : `0 0 12px ${palette.violetLight}`,
                  }}
                  transition={{ duration:0.2 }}
                />
              )}

              {/* mid divider */}
              {(step.phase === 'split' || step.phase === 'compare' || step.phase === 'place' || step.phase === 'merged') &&
               step.array?.length > 0 && step.mid > step.left && (
                <motion.div
                  animate={{ opacity:[0.4,0.8,0.4] }}
                  transition={{ duration:1.5, repeat:Infinity }}
                  style={{
                    position:'absolute', bottom:0, zIndex:9,
                    left:`${((step.mid + 0.5) / step.array.length) * 100}%`,
                    width:'2px', top:'8px',
                    background:`linear-gradient(to bottom,transparent,${palette.violetLight},${palette.violetLight},transparent)`,
                    pointerEvents:'none',
                  }}
                />
              )}

              {/* bars */}
              {step.array?.map((value, i) => {
                const s    = getBarState(i)
                const meta = BAR_STATES[s]
                const h    = Math.max((value / maxVal) * 100, 1)

                return (
                  <motion.div
                    key={i}
                    layout
                    transition={{ layout: { type:'spring', stiffness:300, damping:30 } }}
                    style={{ flex:1, height:'100%', display:'flex', alignItems:'flex-end', position:'relative', zIndex:5 }}
                  >
                    <motion.div
                      animate={{
                        height: `${h}%`,
                        background: `linear-gradient(to top, ${meta.border}, ${meta.bg})`,
                        borderColor: meta.border,
                        boxShadow: meta.glow,
                      }}
                      transition={{ duration:0.12 }}
                      style={{
                        width:'100%', minHeight:'3px',
                        borderRadius:'4px 4px 2px 2px',
                        border:`1px solid ${meta.border}`,
                        position:'relative', overflow:'hidden',
                      }}
                    >
                      {/* shine effect for active bars */}
                      {(s === 'comparing' || s === 'placing') && (
                        <motion.div
                          animate={{ y:['-100%','200%'] }}
                          transition={{ duration:0.8, repeat:Infinity, ease:'linear' }}
                          style={{ position:'absolute', left:0, right:0, height:'30%', background:`linear-gradient(to bottom,transparent,${meta.border}80,transparent)`, pointerEvents:'none' }}
                        />
                      )}
                    </motion.div>
                  </motion.div>
                )
              })}
            </div>

            {/* DEPTH METER */}
            <div className="depth-panel">
              <span style={{ fontFamily:'Syne', fontWeight:700, fontSize:'8px', color:palette.textDim, letterSpacing:'2px', textTransform:'uppercase', writingMode:'vertical-rl', transform:'rotate(180deg)', marginBottom:'4px' }}>
                Depth
              </span>
              <div style={{ flex:1, display:'flex', flexDirection:'column', gap:'4px', justifyContent:'flex-end', width:'100%' }}>
                {Array.from({ length: maxDepth }).map((_, d) => {
                  const isActive = step.depth === d && step.phase !== 'done' && step.phase !== 'idle'
                  return (
                    <motion.div
                      key={d}
                      animate={{
                        background: isActive ? `linear-gradient(135deg,${palette.violet},${palette.violetLight})` : palette.cardBg,
                        boxShadow:  isActive ? `0 0 12px ${palette.violetLight}` : 'none',
                        scale:      isActive ? 1.1 : 1,
                      }}
                      transition={{ duration:0.2 }}
                      style={{
                        width:'100%', height:'20px', borderRadius:'8px',
                        border:`1px solid ${isActive ? palette.violetLight : palette.border}`,
                        display:'flex', alignItems:'center', justifyContent:'center',
                      }}
                    >
                      <span style={{ fontFamily:'JetBrains Mono', fontSize:'9px', color: isActive ? 'white' : palette.textDim, fontWeight: isActive ? 700 : 400 }}>{d}</span>
                    </motion.div>
                  )
                })}
              </div>
              <span style={{ fontFamily:'JetBrains Mono', fontSize:'7px', color:palette.textDim, marginTop:'4px' }}>level</span>
            </div>
          </div>

          {/* ── BOTTOM STRIP ── */}
          <div className="bottom">

            {/* left: status + progress + controls */}
            <div className="ctrl-col">

              {/* status */}
              <div className="status-bar">
                <AnimatePresence mode="wait">
                  <motion.span key={status.text}
                    initial={{opacity:0,y:3}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-3}}
                    transition={{duration:0.15}}
                    style={{ color:status.color, letterSpacing:'0.3px' }}
                  >
                    {status.text}
                  </motion.span>
                </AnimatePresence>
              </div>

              {/* progress */}
              <div className="progress-wrap">
                <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'JetBrains Mono', fontSize:'10px', color:palette.textDim, marginBottom:'6px' }}>
                  <span>Progress</span>
                  <span style={{ color: pct > 0 ? palette.violetLight : palette.textDim }}>{stepIndex} / {Math.max(steps.length - 1, 0)}</span>
                </div>
                <div style={{ width:'100%', height:'6px', background:'#0a1628', borderRadius:'999px', overflow:'hidden' }}>
                  <motion.div
                    animate={{ width:`${pct}%` }}
                    transition={{ duration:0.08 }}
                    style={{
                      height:'6px', borderRadius:'999px',
                      background: isDone
                        ? `linear-gradient(90deg,${palette.green},#34d399)`
                        : `linear-gradient(90deg,${palette.violet},${palette.violetLight})`,
                      boxShadow: isDone ? `0 0 10px ${palette.green}` : `0 0 10px ${palette.violetLight}`,
                    }}
                  />
                </div>
              </div>

              {/* controls */}
              <div className="ctrl-wrap">
                <div style={{ display:'flex', alignItems:'center', gap:'8px', width:'100%', flexWrap:'wrap' }}>

                  {/* play/pause */}
                  <button className="btn btn-play" onClick={isPlaying ? handlePause : handlePlay} disabled={isDone && !isPlaying}>
                    {isPlaying ? '⏸ Pause' : isDone ? '✦ Done' : '▶ Play'}
                  </button>

                  <button className="btn btn-sm b-step" onClick={handleStep} disabled={isPlaying || isDone}>⏭ Step</button>
                  <button className="btn btn-sm b-rst"  onClick={handleReset} disabled={stepIndex === 0 && !isDone}>↺ Reset</button>
                  <button className="btn btn-sm b-gen"  onClick={handleGenerate}>⟳ New Array</button>

                  {/* speed */}
                  <div style={{ display:'flex', alignItems:'center', gap:'6px', marginLeft:'auto' }}>
                    <span style={{ fontFamily:'JetBrains Mono', fontSize:'9px', color:palette.textDim }}>🐢</span>
                    <input
                      type="range" min={40} max={800} step={20}
                      value={1040 - speed}
                      onChange={e => dispatch({ type:'SET_SPEED', speed: 1040 - Number(e.target.value) })}
                      style={{ width:'90px' }}
                    />
                    <span style={{ fontFamily:'JetBrains Mono', fontSize:'9px', color:palette.textDim }}>🐇</span>
                    <span style={{ fontFamily:'JetBrains Mono', fontSize:'9px', color:palette.textDim, minWidth:'40px' }}>{speed}ms</span>
                  </div>

                  {/* array size */}
                  <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                    <span style={{ fontFamily:'JetBrains Mono', fontSize:'9px', color:palette.textDim }}>n:</span>
                    <input
                      type="range" min={6} max={40} step={2}
                      value={arraySize}
                      onChange={e => dispatch({ type:'SET_SIZE', arraySize: Number(e.target.value) })}
                      style={{ width:'80px' }}
                    />
                    <span style={{ fontFamily:'JetBrains Mono', fontSize:'9px', color:palette.textDim, minWidth:'22px' }}>{arraySize}</span>
                  </div>

                </div>
              </div>
            </div>

            {/* pseudocode panel */}
            <div className="pseudo-panel">
              <div style={{ padding:'10px 14px 6px', borderBottom:'1px solid '+palette.border, flexShrink:0 }}>
                <span style={{ fontFamily:'Syne', fontWeight:700, fontSize:'10px', color:palette.textDim, letterSpacing:'2px', textTransform:'uppercase' }}>
                  Pseudocode
                </span>
              </div>
              <div style={{ flex:1, overflow:'hidden', padding:'8px 10px', display:'flex', flexDirection:'column', gap:'2px' }}>
                {PSEUDO.map((line, i) => {
                  const active = i === step.currentLine
                  return (
                    <motion.div key={i}
                      animate={{
                        background: active ? `${palette.violet}20` : 'transparent',
                        borderLeftColor: active ? palette.violet : 'transparent',
                      }}
                      transition={{ duration:0.15 }}
                      style={{
                        paddingLeft: `${line.indent * 16 + 12}px`,
                        paddingTop:'4px', paddingBottom:'4px', paddingRight:'8px',
                        borderRadius:'6px',
                        borderLeft:`3px solid`,
                        fontFamily:'JetBrains Mono', fontSize:'10px',
                        color: active ? palette.violetLight : palette.textDim,
                        fontWeight: active ? 700 : 400,
                        lineHeight:1.4,
                        display:'flex', alignItems:'center', gap:'6px',
                      }}
                    >
                      {active && (
                        <motion.span
                          animate={{ opacity:[1,0.3,1] }}
                          transition={{ duration:0.8, repeat:Infinity }}
                          style={{ color:palette.violetLight, fontSize:'8px' }}
                        >▶</motion.span>
                      )}
                      <span style={{ marginLeft: active ? 0 : '14px' }}>{line.code}</span>
                    </motion.div>
                  )
                })}
              </div>

              {/* complexity footer */}
              <div style={{ borderTop:'1px solid '+palette.border, padding:'10px 14px', display:'flex', justifyContent:'space-between', flexShrink:0 }}>
                {[
                  { lbl:'Time', val:'O(n log n)', col:palette.violetLight },
                  { lbl:'Space', val:'O(n)', col:palette.amber },
                  { lbl:'Stable', val:'Yes', col:palette.green },
                ].map(({lbl,val,col})=>(
                  <div key={lbl} style={{ textAlign:'center' }}>
                    <p style={{ fontFamily:'JetBrains Mono', fontSize:'8px', color:palette.textDim, marginBottom:'2px', letterSpacing:'1px' }}>{lbl.toUpperCase()}</p>
                    <p style={{ fontFamily:'JetBrains Mono', fontWeight:700, fontSize:'12px', color:col, margin:0 }}>{val}</p>
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