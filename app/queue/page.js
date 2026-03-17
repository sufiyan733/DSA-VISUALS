// 'use client'
// import { useState, useRef } from 'react'
// import { motion, AnimatePresence } from 'framer-motion'
// import Navbar from '@/comps/navbar'

// const MAX_SIZE  = 6
// const SLOT_W    = 80   // px — every block is exactly this wide
// const SLOT_H    = 70   // px — pipe height
// const SLOT_GAP  = 6    // px

// const QUEUE_COLORS = [
//   { bg: '#f59e0b', border: '#f59e0b70', glow: '#f59e0b35' },
//   { bg: '#10b981', border: '#10b98170', glow: '#10b98135' },
//   { bg: '#06b6d4', border: '#06b6d470', glow: '#06b6d435' },
//   { bg: '#f97316', border: '#f9731670', glow: '#f9731635' },
//   { bg: '#a78bfa', border: '#a78bfa70', glow: '#a78bfa35' },
//   { bg: '#34d399', border: '#34d39970', glow: '#34d39935' },
// ]

// export default function QueuePage() {
//   const [queue, setQueue]       = useState([])
//   const [inputVal, setInputVal] = useState('')
//   const [message, setMessage]   = useState(null)
//   const [peeking, setPeeking]   = useState(false)
//   const colorIndex              = useRef(0)
//   const msgTimeout              = useRef(null)

//   const showMessage = (text, type = 'info') => {
//     clearTimeout(msgTimeout.current)
//     setMessage({ text, type })
//     msgTimeout.current = setTimeout(() => setMessage(null), 2200)
//   }

//   // Enqueue — adds to LEFT (index 0 = leftmost = front of visual)
//   // Array is stored front→rear as index 0→n
//   // New item arrives from the LEFT and pushes existing items right
//   const handleEnqueue = () => {
//     const val = inputVal.trim()
//     if (!val) { showMessage('Enter a value to enqueue', 'error'); return }
//     if (queue.length >= MAX_SIZE) { showMessage('Queue Full!', 'error'); return }
//     const color = QUEUE_COLORS[colorIndex.current % QUEUE_COLORS.length]
//     colorIndex.current++
//     // unshift = prepend → new item is at index 0 (LEFT / REAR visually)
//     setQueue(prev => [{ id: Date.now() + Math.random(), value: val, color }, ...prev])
//     setInputVal('')
//     showMessage(`Enqueued "${val}"  →  enters from left`, 'success')
//   }

//   // Dequeue — removes from RIGHT (last index = front of visual = oldest item)
//   const handleDequeue = () => {
//     if (!queue.length) { showMessage('Queue is empty!', 'error'); return }
//     const front = queue[queue.length - 1]
//     setQueue(prev => prev.slice(0, -1))
//     showMessage(`Dequeued "${front.value}"  ←  exits from right`, 'dequeue')
//   }

//   const handlePeek = () => {
//     if (!queue.length) { showMessage('Queue is empty', 'error'); return }
//     setPeeking(true)
//     showMessage(`Front = "${queue[queue.length - 1].value}"`, 'peek')
//     setTimeout(() => setPeeking(false), 1800)
//   }

//   const handleClear  = () => { setQueue([]); showMessage('Queue cleared', 'info') }
//   const handleKeyDown = (e) => { if (e.key === 'Enter') handleEnqueue() }

//   const msgStyles = {
//     success: { color: '#f59e0b', border: '#f59e0b30' },
//     error:   { color: '#ef4444', border: '#ef444430' },
//     dequeue: { color: '#10b981', border: '#10b98130' },
//     peek:    { color: '#06b6d4', border: '#06b6d430' },
//     info:    { color: '#94a3b8', border: '#94a3b820' },
//   }

//   // pipe total width so it stays fixed regardless of queue length
//   const PIPE_W = MAX_SIZE * SLOT_W + (MAX_SIZE - 1) * SLOT_GAP + 16 // 16 = 2×8px padding

//   return (
//     <>
//       <Navbar />

//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;700&display=swap');
//         html, body { margin:0; padding:0; overflow:hidden; height:100%; }
//         *, *::before, *::after { box-sizing:border-box; }

//         .shell {
//           height: calc(100vh - 52px);
//           background: #05070f;
//           display: flex; overflow: hidden; position: relative;
//         }
//         .shell::before {
//           content:''; position:absolute; top:-80px; left:-80px;
//           width:380px; height:380px; pointer-events:none; z-index:0;
//           background: radial-gradient(circle, #f59e0b09 0%, transparent 70%);
//         }
//         .shell::after {
//           content:''; position:absolute; bottom:-80px; right:-60px;
//           width:320px; height:320px; pointer-events:none; z-index:0;
//           background: radial-gradient(circle, #10b98109 0%, transparent 70%);
//         }

//         .left-half, .right-half {
//           position:relative; z-index:1;
//           width:50%; height:100%; overflow:hidden;
//           display:flex; flex-direction:column;
//         }
//         .left-half  { padding:20px 16px 20px 28px; border-right:1px solid #0d1421; }
//         .right-half { padding:20px 28px 20px 16px; }

//         /* pipe area fills remaining height */
//         .pipe-area {
//           flex:1; min-height:0;
//           display:flex; flex-direction:column;
//           justify-content:center;
//           gap:8px;
//         }

//         /* right panel */
//         .right-inner { flex:1; min-height:0; display:flex; flex-direction:column; gap:10px; }
//         .card { background:#0a0e1a; border:1px solid #131b2e; border-radius:12px; padding:12px 14px; flex-shrink:0; }
//         .card.ops { flex:1; min-height:0; display:flex; flex-direction:column; }
//         .card-label { font-family:'Syne'; font-weight:700; font-size:9px; color:#1e2d45; letter-spacing:2.5px; text-transform:uppercase; margin-bottom:8px; flex-shrink:0; }
//         .ops-list { flex:1; min-height:0; display:flex; flex-direction:column; }
//         .op-row { flex:1; min-height:0; display:flex; align-items:center; justify-content:space-between; padding:0 10px; border-radius:6px; background:#0d1117; border:1px solid #131b2e; margin-bottom:5px; transition:border-color 0.2s; }
//         .op-row:last-child { margin-bottom:0; }
//         .op-row:hover { border-color:#1e2d45; }

//         .enq-btn { background:linear-gradient(135deg,#f59e0b,#f97316); color:#000; border:none; border-radius:8px; padding:9px 18px; font-family:'Syne'; font-size:12px; font-weight:800; cursor:pointer; box-shadow:0 0 16px #f59e0b28; transition:all 0.2s; white-space:nowrap; flex-shrink:0; }
//         .enq-btn:hover { transform:translateY(-1px); box-shadow:0 0 26px #f59e0b50; }
//         .act-btn { flex:1; border:none; border-radius:8px; padding:9px 4px; font-family:'Syne'; font-size:11px; font-weight:700; cursor:pointer; transition:all 0.2s; }
//         .act-btn:disabled { opacity:0.28; cursor:not-allowed; }
//         .act-btn:hover:not(:disabled) { transform:translateY(-1px); }
//         .deq-btn   { background:#10b98115; color:#10b981; border:1px solid #10b98130; }
//         .peek-btn  { background:#06b6d415; color:#06b6d4; border:1px solid #06b6d430; }
//         .clear-btn { background:#94a3b810; color:#94a3b8; border:1px solid #94a3b820; }
//         .deq-btn:hover:not(:disabled)   { background:#10b98125; }
//         .peek-btn:hover:not(:disabled)  { background:#06b6d425; }
//         .clear-btn:hover:not(:disabled) { background:#94a3b820; }

//         .q-input { flex:1; background:#0d1117; border:1px solid #1e2736; border-radius:8px; padding:9px 12px; color:white; font-family:'JetBrains Mono'; font-size:13px; outline:none; min-width:0; transition:border-color 0.2s, box-shadow 0.2s; }
//         .q-input:focus { border-color:#f59e0b60; box-shadow:0 0 0 3px #f59e0b14; }
//         .q-input::placeholder { color:#1e2d45; }
//       `}</style>

//       <div className="shell">

//         {/* ══════ LEFT 50% ══════ */}
//         <div className="left-half">

//           {/* header */}
//           <div style={{ display:'flex', alignItems:'baseline', gap:'10px', marginBottom:'14px', flexShrink:0 }}>
//             <h1 style={{ fontFamily:'Syne', fontWeight:800, fontSize:'1.7rem', color:'white', letterSpacing:'-0.5px', lineHeight:1 }}>Queue</h1>
//             <span style={{ fontFamily:'JetBrains Mono', fontSize:'10px', color:'#f59e0b', background:'#f59e0b15', border:'1px solid #f59e0b30', borderRadius:'4px', padding:'2px 8px', letterSpacing:'1px' }}>FIFO</span>
//             {queue.length > 0 && (
//               <motion.span initial={{opacity:0}} animate={{opacity:1}}
//                 style={{ fontFamily:'JetBrains Mono', fontSize:'10px', color:'#f59e0b', background:'#f59e0b15', border:'1px solid #f59e0b30', borderRadius:'4px', padding:'2px 8px' }}>
//                 {queue.length}/{MAX_SIZE}
//               </motion.span>
//             )}
//           </div>

//           <div className="pipe-area">

//             {/* ── direction labels above pipe ── */}
//             <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
//               <span style={{ fontFamily:'JetBrains Mono', fontSize:'9px', color:'#f59e0b', letterSpacing:'2px', textTransform:'uppercase', display:'flex', alignItems:'center', gap:'5px' }}>
//                 <motion.span animate={{x:[2,-2,2]}} transition={{duration:1.2,repeat:Infinity,ease:'easeInOut'}}>←</motion.span>
//                 enqueue (enter left)
//               </span>
//               <span style={{ fontFamily:'JetBrains Mono', fontSize:'9px', color:'#10b981', letterSpacing:'2px', textTransform:'uppercase', display:'flex', alignItems:'center', gap:'5px' }}>
//                 dequeue (exit right)
//                 <motion.span animate={{x:[-2,2,-2]}} transition={{duration:1.2,repeat:Infinity,ease:'easeInOut'}}>→</motion.span>
//               </span>
//             </div>

//             {/*
//               ── THE PIPE ──
//               Fixed pixel width = MAX_SIZE * (SLOT_W + SLOT_GAP) + padding
//               Ghost slots always rendered → pipe never resizes
//               Real items layered on top via absolute positioning
//             */}
//             <div style={{
//               width:        `${PIPE_W}px`,
//               height:       `${SLOT_H + 16}px`,
//               background:   '#080b14',
//               border:       '2px solid #131b2e',
//               borderRadius: '14px',
//               position:     'relative',
//               overflow:     'hidden',
//               flexShrink:   0,
//             }}>

//               {/* subtle grid lines */}
//               <div style={{
//                 position:'absolute', inset:0, pointerEvents:'none', zIndex:0,
//                 backgroundImage:`repeating-linear-gradient(90deg,transparent 0px,transparent ${SLOT_W+SLOT_GAP-1}px,#0d142150 ${SLOT_W+SLOT_GAP-1}px,#0d142150 ${SLOT_W+SLOT_GAP}px)`,
//                 backgroundPosition: '8px 0',
//               }} />

//               {/* size badge */}
//               <div style={{ position:'absolute', top:'7px', right:'10px', zIndex:20, fontFamily:'JetBrains Mono', fontSize:'9px', color: queue.length >= MAX_SIZE ? '#ef4444' : '#131b2e', letterSpacing:'1px' }}>
//                 {queue.length}/{MAX_SIZE}
//               </div>

//               {/* ── GHOST SLOTS — always MAX_SIZE, pipe never resizes ── */}
//               <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', padding:`8px`, gap:`${SLOT_GAP}px`, zIndex:1 }}>
//                 {Array.from({length: MAX_SIZE}).map((_,i) => (
//                   <div key={i} style={{ width:`${SLOT_W}px`, height:`${SLOT_H}px`, flexShrink:0, borderRadius:'8px', border:'1px dashed #0d1421' }} />
//                 ))}
//               </div>

//               {/* empty label */}
//               {queue.length === 0 && (
//                 <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', zIndex:5 }}>
//                   <span style={{ fontFamily:'JetBrains Mono', fontSize:'10px', color:'#0d1421', letterSpacing:'1px' }}>empty queue</span>
//                 </div>
//               )}

//               {/*
//                 ── REAL ITEMS ──

//                 Layout logic:
//                   queue array:  [newest, ..., oldest]   (index 0 = newest = LEFT)
//                   Visual slots: slot 0 = LEFT, slot MAX_SIZE-1 = RIGHT

//                   Item at queue[i] occupies slot i (from left).
//                   Oldest item = queue[queue.length-1] = rightmost slot.

//                   On ENQUEUE: new item enters at slot 0 (LEFT).
//                     → All existing items shift one slot to the right.
//                     → New item animates in from x = -(SLOT_W+SLOT_GAP).

//                   On DEQUEUE: oldest item (rightmost) exits to the right.
//                     → All remaining items shift one slot to the right.
//                     → Exiting item animates to x = +(SLOT_W+SLOT_GAP).

//                   `layout` prop on each item makes framer-motion automatically
//                   animate the x-position change when items shift slots.
//               */}
//               <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', padding:`8px`, gap:`${SLOT_GAP}px`, zIndex:10 }}>
//                 <AnimatePresence mode="popLayout" initial={false}>
//                   {queue.map((item, index) => {
//                     const isNewest  = index === 0                       // leftmost  = just enqueued
//                     const isOldest  = index === queue.length - 1       // rightmost = will dequeue next
//                     const isPeek    = peeking && isOldest

//                     return (
//                       <motion.div
//                         key={item.id}
//                         layout                          // ← animates position shift automatically
//                         initial={{
//                           opacity: 0,
//                           x: -(SLOT_W + SLOT_GAP),     // slides IN from LEFT
//                           scale: 0.78,
//                           rotateY: -25,
//                         }}
//                         animate={{
//                           opacity: 1,
//                           x: 0,
//                           scale: isPeek ? 1.06 : 1,
//                           rotateY: 0,
//                           background: isPeek
//                             ? `linear-gradient(135deg,${item.color.bg}55,${item.color.bg}28)`
//                             : isOldest
//                             ? `linear-gradient(135deg,${item.color.bg}35,${item.color.bg}12)`
//                             : isNewest
//                             ? `linear-gradient(135deg,${item.color.bg}22,${item.color.bg}08)`
//                             : `linear-gradient(135deg,${item.color.bg}12,transparent)`,
//                           boxShadow: isPeek
//                             ? `0 0 22px ${item.color.glow}, inset 0 0 14px ${item.color.bg}22`
//                             : isOldest
//                             ? `0 0 12px ${item.color.glow}`
//                             : 'none',
//                         }}
//                         exit={{
//                           opacity: 0,
//                           x: (SLOT_W + SLOT_GAP),      // slides OUT to RIGHT
//                           scale: 0.75,
//                           rotateY: 25,
//                           transition: { duration: 0.3, ease: [0.4, 0, 1, 1] },
//                         }}
//                         transition={{
//                           layout:  { type:'spring', stiffness:320, damping:30 },
//                           default: { type:'spring', stiffness:300, damping:24 },
//                         }}
//                         style={{
//                           width:        `${SLOT_W}px`,
//                           height:       `${SLOT_H}px`,
//                           flexShrink:   0,
//                           borderRadius: '8px',
//                           border:       `1px solid ${isOldest ? item.color.bg : item.color.border}`,
//                           display:      'flex',
//                           flexDirection:'column',
//                           alignItems:   'center',
//                           justifyContent:'center',
//                           position:     'relative',
//                           overflow:     'hidden',
//                           cursor:       'default',
//                           perspective:  '400px',
//                         }}
//                       >
//                         {/* top shimmer on oldest (front/dequeue) */}
//                         <div style={{
//                           position:'absolute', top:0, left:0, right:0, height:'2px',
//                           background: isOldest
//                             ? `linear-gradient(90deg,transparent,${item.color.bg},transparent)`
//                             : 'transparent',
//                           transition: 'background 0.4s',
//                         }} />

//                         {/* bottom shimmer on newest (rear/enqueue) */}
//                         <div style={{
//                           position:'absolute', bottom:0, left:0, right:0, height:'2px',
//                           background: isNewest
//                             ? `linear-gradient(90deg,transparent,${item.color.bg}80,transparent)`
//                             : 'transparent',
//                           transition: 'background 0.4s',
//                         }} />

//                         {/* color dot */}
//                         <div style={{
//                           width:'6px', height:'6px', borderRadius:'50%',
//                           backgroundColor: item.color.bg,
//                           boxShadow: `0 0 ${isOldest ? 8 : 4}px ${item.color.bg}`,
//                           marginBottom:'4px', flexShrink:0,
//                         }} />

//                         {/* value */}
//                         <span style={{
//                           fontFamily:'JetBrains Mono', fontWeight:700, fontSize:'17px',
//                           color: isOldest ? item.color.bg : '#2a3d58',
//                           letterSpacing:'0.5px', lineHeight:1,
//                         }}>
//                           {item.value}
//                         </span>

//                         {/* slot index */}
//                         <span style={{ fontFamily:'JetBrains Mono', fontSize:'8px', color:'#1e2d45', marginTop:'3px' }}>
//                           [{index}]
//                         </span>

//                         {/* FRONT / REAR badge */}
//                         {(isOldest || isNewest) && !(isOldest && isNewest) && (
//                           <motion.div
//                             initial={{opacity:0,y:3}} animate={{opacity:1,y:0}}
//                             style={{ position:'absolute', top:'4px', left:0, right:0, display:'flex', justifyContent:'center' }}
//                           >
//                             <span style={{
//                               fontFamily:'Syne', fontWeight:800, fontSize:'6px', letterSpacing:'1px',
//                               color:      isOldest ? item.color.bg : '#1e2d45',
//                               background: isOldest ? `${item.color.bg}20` : '#0d1421',
//                               border:     `1px solid ${isOldest ? item.color.border : '#1a2535'}`,
//                               borderRadius:'3px', padding:'1px 5px',
//                             }}>
//                               {isOldest ? 'FRONT' : 'REAR'}
//                             </span>
//                           </motion.div>
//                         )}

//                         {/* combined badge when only 1 item */}
//                         {isOldest && isNewest && (
//                           <motion.div initial={{opacity:0,y:3}} animate={{opacity:1,y:0}}
//                             style={{ position:'absolute', top:'4px', left:0, right:0, display:'flex', justifyContent:'center' }}>
//                             <span style={{ fontFamily:'Syne', fontWeight:800, fontSize:'6px', letterSpacing:'1px', color:item.color.bg, background:`${item.color.bg}20`, border:`1px solid ${item.color.border}`, borderRadius:'3px', padding:'1px 5px' }}>
//                               FRONT · REAR
//                             </span>
//                           </motion.div>
//                         )}

//                         {/* peek pulse */}
//                         {isPeek && (
//                           <motion.div
//                             initial={{opacity:0.8}} animate={{opacity:0}}
//                             transition={{duration:0.8, repeat:Infinity}}
//                             style={{ position:'absolute', inset:-1, border:`2px solid ${item.color.bg}`, borderRadius:'9px', pointerEvents:'none' }}
//                           />
//                         )}

//                         {/* entry flash — newest item only */}
//                         {isNewest && (
//                           <motion.div
//                             initial={{opacity:0.5}} animate={{opacity:0}}
//                             transition={{duration:0.5}}
//                             style={{ position:'absolute', inset:0, background:`${item.color.bg}30`, borderRadius:'8px', pointerEvents:'none' }}
//                           />
//                         )}
//                       </motion.div>
//                     )
//                   })}
//                 </AnimatePresence>
//               </div>
//             </div>

//             {/* ── direction arrows below pipe ── */}
//             <div style={{ display:'flex', alignItems:'center', gap:'6px', flexShrink:0 }}>
//               <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'1px' }}>
//                 <motion.span animate={{x:[2,-2,2]}} transition={{duration:1.2,repeat:Infinity,ease:'easeInOut'}}
//                   style={{ fontFamily:'JetBrains Mono', fontSize:'12px', color:'#f59e0b' }}>←</motion.span>
//                 <span style={{ fontFamily:'JetBrains Mono', fontSize:'7px', color:'#f59e0b60', letterSpacing:'1px' }}>IN</span>
//               </div>
//               <div style={{ flex:1, height:'1px', background:'linear-gradient(90deg,#f59e0b,#f59e0b40,#10b98140,#10b981)' }} />
//               <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'1px' }}>
//                 <motion.span animate={{x:[-2,2,-2]}} transition={{duration:1.2,repeat:Infinity,ease:'easeInOut'}}
//                   style={{ fontFamily:'JetBrains Mono', fontSize:'12px', color:'#10b981' }}>→</motion.span>
//                 <span style={{ fontFamily:'JetBrains Mono', fontSize:'7px', color:'#10b98160', letterSpacing:'1px' }}>OUT</span>
//               </div>
//             </div>

//             {/* ── how it works card ── */}
//             <div style={{ background:'#080b14', border:'1px solid #0d1421', borderRadius:'10px', padding:'12px 14px', flexShrink:0 }}>
//               <p style={{ fontFamily:'JetBrains Mono', fontSize:'9px', color:'#1e2d45', letterSpacing:'1px', marginBottom:'10px', textTransform:'uppercase' }}>How it works</p>
//               <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>

//                 {/* IN side */}
//                 <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'3px', flexShrink:0 }}>
//                   <motion.div animate={{x:[3,-3,3]}} transition={{duration:1,repeat:Infinity,ease:'easeInOut'}}
//                     style={{ fontFamily:'JetBrains Mono', fontSize:'14px', color:'#f59e0b' }}>←</motion.div>
//                   <span style={{ fontFamily:'JetBrains Mono', fontSize:'7px', color:'#f59e0b', letterSpacing:'1px' }}>NEW</span>
//                 </div>

//                 {/* mini static queue */}
//                 <div style={{ flex:1, display:'flex', gap:'3px', justifyContent:'center' }}>
//                   {[
//                     { l:'D', isNew:true  },
//                     { l:'C', isNew:false },
//                     { l:'B', isNew:false },
//                     { l:'A', isOld:true  },
//                   ].map(({ l, isNew, isOld }) => (
//                     <div key={l} style={{ width:'26px', height:'26px', borderRadius:'5px', background: isOld ? '#10b98120' : isNew ? '#f59e0b20' : '#0d1117', border:`1px solid ${isOld ? '#10b98150' : isNew ? '#f59e0b50' : '#131b2e'}`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'JetBrains Mono', fontSize:'9px', fontWeight:700, color: isOld ? '#10b981' : isNew ? '#f59e0b' : '#1e2d45' }}>
//                       {l}
//                     </div>
//                   ))}
//                 </div>

//                 {/* OUT side */}
//                 <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'3px', flexShrink:0 }}>
//                   <motion.div animate={{x:[-3,3,-3]}} transition={{duration:1,repeat:Infinity,ease:'easeInOut'}}
//                     style={{ fontFamily:'JetBrains Mono', fontSize:'14px', color:'#10b981' }}>→</motion.div>
//                   <span style={{ fontFamily:'JetBrains Mono', fontSize:'7px', color:'#10b981', letterSpacing:'1px' }}>OLD</span>
//                 </div>

//               </div>
//               <div style={{ display:'flex', justifyContent:'space-between', marginTop:'7px' }}>
//                 <span style={{ fontFamily:'JetBrains Mono', fontSize:'7px', color:'#f59e0b60' }}>← rear (newest)</span>
//                 <span style={{ fontFamily:'JetBrains Mono', fontSize:'7px', color:'#10b98160' }}>front (oldest) →</span>
//               </div>
//             </div>

//           </div>{/* end pipe-area */}

//           {/* message */}
//           <div style={{ height:'30px', marginBottom:'8px', flexShrink:0 }}>
//             <AnimatePresence mode="wait">
//               {message && (
//                 <motion.div key={message.text}
//                   initial={{opacity:0,y:3}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-3}}
//                   transition={{duration:0.15}}
//                   style={{ background:'#080b14', border:`1px solid ${msgStyles[message.type].border}`, borderRadius:'7px', padding:'6px 12px', fontFamily:'JetBrains Mono', fontSize:'11px', color:msgStyles[message.type].color }}>
//                   {message.text}
//                 </motion.div>
//               )}
//             </AnimatePresence>
//           </div>

//           {/* input */}
//           <div style={{ display:'flex', gap:'8px', marginBottom:'8px', flexShrink:0 }}>
//             <input className="q-input" type="text" value={inputVal}
//               onChange={e => setInputVal(e.target.value)}
//               onKeyDown={handleKeyDown} placeholder="value..." maxLength={5} />
//             <button className="enq-btn" onClick={handleEnqueue}>← Enqueue</button>
//           </div>

//           {/* actions */}
//           <div style={{ display:'flex', gap:'8px', flexShrink:0 }}>
//             <button className="act-btn deq-btn"   onClick={handleDequeue} disabled={!queue.length}>Dequeue →</button>
//             <button className="act-btn peek-btn"  onClick={handlePeek}    disabled={!queue.length}>Peek</button>
//             <button className="act-btn clear-btn" onClick={handleClear}   disabled={!queue.length}>Clear</button>
//           </div>
//         </div>

//         {/* ══════ RIGHT 50% ══════ */}
//         <div className="right-half">

//           <div style={{ marginBottom:'10px', flexShrink:0 }}>
//             <h2 style={{ fontFamily:'Syne', fontWeight:800, fontSize:'1.7rem', color:'white', letterSpacing:'-0.5px', lineHeight:1 }}>Info</h2>
//             <p style={{ fontFamily:'JetBrains Mono', fontSize:'10px', color:'#1e2d45', marginTop:'4px' }}>First In · First Out · all ops O(1)</p>
//           </div>

//           <div className="right-inner">

//             {/* complexity */}
//             <div className="card">
//               <p className="card-label">Complexity</p>
//               <div style={{ display:'flex', gap:'8px' }}>
//                 {[
//                   { label:'Enqueue', value:'O(1)', color:'#f59e0b' },
//                   { label:'Dequeue', value:'O(1)', color:'#10b981' },
//                   { label:'Space',   value:'O(n)', color:'#06b6d4' },
//                 ].map(({ label, value, color }) => (
//                   <div key={label} style={{ flex:1, background:'#0d1117', border:'1px solid #131b2e', borderRadius:'8px', padding:'8px', textAlign:'center' }}>
//                     <p style={{ fontFamily:'JetBrains Mono', fontSize:'8px', color:'#1e2d45', marginBottom:'3px', letterSpacing:'1px' }}>{label.toUpperCase()}</p>
//                     <p style={{ fontFamily:'JetBrains Mono', fontWeight:700, fontSize:'16px', color }}>{value}</p>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* queue vs stack */}
//             <div className="card">
//               <p className="card-label">Queue vs Stack</p>
//               <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px' }}>
//                 {[
//                   { label:'Queue',  val:'FIFO',   sub:'First In First Out',  color:'#f59e0b' },
//                   { label:'Stack',  val:'LIFO',   sub:'Last In First Out',   color:'#0ea5e9' },
//                   { label:'Insert', val:'← Rear', sub:'enters from left',    color:'#f59e0b' },
//                   { label:'Remove', val:'Front →', sub:'exits from right',   color:'#10b981' },
//                 ].map(({ label, val, sub, color }) => (
//                   <div key={label} style={{ background:'#0d1117', border:'1px solid #131b2e', borderRadius:'7px', padding:'8px 10px' }}>
//                     <p style={{ fontFamily:'JetBrains Mono', fontSize:'8px', color:'#1e2d45', letterSpacing:'1px', marginBottom:'2px' }}>{label.toUpperCase()}</p>
//                     <p style={{ fontFamily:'JetBrains Mono', fontWeight:700, fontSize:'13px', color }}>{val}</p>
//                     <p style={{ fontFamily:'JetBrains Mono', fontSize:'8px', color:'#1e2d45', marginTop:'1px' }}>{sub}</p>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* operations */}
//             <div className="card ops">
//               <p className="card-label">Operations</p>
//               <div className="ops-list">
//                 {[
//                   { op:'enqueue(x)', desc:'Add to rear  (left)',    color:'#f59e0b' },
//                   { op:'dequeue()',  desc:'Remove from front (right)', color:'#10b981' },
//                   { op:'peek()',     desc:'Read front element',       color:'#06b6d4' },
//                   { op:'isEmpty()', desc:'Check if empty',           color:'#a78bfa' },
//                   { op:'size()',     desc:'Number of elements',       color:'#f97316' },
//                 ].map(({ op, desc, color }) => (
//                   <div key={op} className="op-row">
//                     <div>
//                       <p style={{ fontFamily:'JetBrains Mono', fontSize:'12px', color, fontWeight:700 }}>{op}</p>
//                       <p style={{ fontFamily:'JetBrains Mono', fontSize:'9px', color:'#1e2d45', marginTop:'1px' }}>{desc}</p>
//                     </div>
//                     <span style={{ fontFamily:'JetBrains Mono', fontSize:'9px', color:'#10b981', background:'#10b98112', border:'1px solid #10b98125', borderRadius:'4px', padding:'2px 6px', flexShrink:0 }}>O(1)</span>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* real world uses */}
//             <div className="card">
//               <p className="card-label">Real World Uses</p>
//               <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
//                 {[
//                   { icon:'🖨', text:'Print queue'    },
//                   { icon:'⌨', text:'Keyboard input'  },
//                   { icon:'📶', text:'Network packets' },
//                   { icon:'🎫', text:'Task scheduler'  },
//                   { icon:'📺', text:'Video buffer'    },
//                 ].map(({ icon, text }) => (
//                   <div key={text} style={{ display:'flex', alignItems:'center', gap:'5px', background:'#0d1117', border:'1px solid #131b2e', borderRadius:'6px', padding:'5px 9px' }}>
//                     <span style={{ fontSize:'11px' }}>{icon}</span>
//                     <span style={{ fontFamily:'Syne', fontWeight:600, fontSize:'11px', color:'#3d5068' }}>{text}</span>
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
import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '@/comps/navbar'

const MAX_SIZE = 6
const ITEM_WIDTH = 70                // fixed width per block (px)
const GAP = 6                        // gap between items (px)

const QUEUE_COLORS = [
  { bg: '#f59e0b', border: '#f59e0b60', glow: '#f59e0b30' },
  { bg: '#10b981', border: '#10b98160', glow: '#10b98130' },
  { bg: '#06b6d4', border: '#06b6d460', glow: '#06b6d430' },
  { bg: '#f97316', border: '#f9731660', glow: '#f9731630' },
  { bg: '#a78bfa', border: '#a78bfa60', glow: '#a78bfa30' },
  { bg: '#34d399', border: '#34d39960', glow: '#34d39930' },
]

export default function QueuePage() {
  const [queue, setQueue]       = useState([])
  const [inputVal, setInputVal] = useState('')
  const [message, setMessage]   = useState(null)
  const [peeking, setPeeking]   = useState(false)
  const colorIndex              = useRef(0)
  const msgTimeout              = useRef(null)

  const showMessage = (text, type = 'info') => {
    clearTimeout(msgTimeout.current)
    setMessage({ text, type })
    msgTimeout.current = setTimeout(() => setMessage(null), 2200)
  }

  // 🔁 ENQUEUE from LEFT (add to beginning)
  const handleEnqueue = () => {
    const val = inputVal.trim()
    if (!val) { showMessage('Enter a value to enqueue', 'error'); return }
    if (queue.length >= MAX_SIZE) { showMessage('Queue Full!', 'error'); return }
    const color = QUEUE_COLORS[colorIndex.current % QUEUE_COLORS.length]
    colorIndex.current++
    // new item goes to the REAR (left side)
    setQueue(prev => [{ id: Date.now() + Math.random(), value: val, color }, ...prev])
    setInputVal('')
    showMessage(`Enqueued "${val}" at left (rear)`, 'success')
  }

  // 🔁 DEQUEUE from RIGHT (remove from end)
  const handleDequeue = () => {
    if (!queue.length) { showMessage('Queue is empty!', 'error'); return }
    const front = queue[queue.length - 1]   // front is now the rightmost item
    // remove from FRONT (end of array)
    setQueue(prev => prev.slice(0, -1))
    showMessage(`Dequeued "${front.value}" from right (front)`, 'dequeue')
  }

  const handlePeek = () => {
    if (!queue.length) { showMessage('Queue is empty', 'error'); return }
    setPeeking(true)
    showMessage(`Front = "${queue[queue.length - 1].value}"`, 'peek')
    setTimeout(() => setPeeking(false), 1800)
  }

  const handleClear = () => { setQueue([]); showMessage('Queue cleared', 'info') }
  const handleKeyDown = (e) => { if (e.key === 'Enter') handleEnqueue() }

  const msgStyles = {
    success: { color: '#f59e0b', border: '#f59e0b30' },
    error:   { color: '#ef4444', border: '#ef444430' },
    dequeue: { color: '#10b981', border: '#10b98130' },
    peek:    { color: '#06b6d4', border: '#06b6d430' },
    info:    { color: '#94a3b8', border: '#94a3b820' },
  }

  return (
    <>
      <Navbar />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;700&display=swap');
        html, body { margin:0; padding:0; overflow:hidden; height:100%; }
        *, *::before, *::after { box-sizing:border-box; }

        .shell {
          height: calc(100vh - 52px);
          background: #05070f;
          display: flex;
          overflow: hidden;
          position: relative;
        }
        .shell::before {
          content:''; position:absolute; top:-100px; right:-100px;
          width:420px; height:420px; pointer-events:none; z-index:0;
          background: radial-gradient(circle, #f59e0b08 0%, transparent 70%);
        }
        .shell::after {
          content:''; position:absolute; bottom:-100px; left:-80px;
          width:360px; height:360px; pointer-events:none; z-index:0;
          background: radial-gradient(circle, #10b98108 0%, transparent 70%);
        }

        .left-half, .right-half {
          position:relative; z-index:1;
          width:50%; height:100%; overflow:hidden;
          display:flex; flex-direction:column;
        }
        .left-half  { padding:20px 16px 20px 28px; border-right:1px solid #0d1421; }
        .right-half { padding:20px 28px 20px 16px; }

        /* ── THE PIPE ── */
        .pipe-wrap {
          flex:1; min-height:0;
          display:flex; flex-direction:column;
          justify-content:center; gap:6px;
        }

        .pipe-outer {
          width:100%; height:80px;
          position:relative;
          background:#080b14;
          border:2px solid #131b2e;
          border-radius:14px;
          overflow:hidden;
        }

        .pipe-inner {
          position:absolute; inset:0;
          display:flex;
          align-items:stretch;
          padding:7px 8px;
          gap:6px;
        }

        /* ghost slots — always MAX_SIZE slots shown */
        .ghost-slots {
          position:absolute; inset:0;
          display:flex;
          align-items:stretch;
          padding:7px 8px;
          gap:6px;
          pointer-events:none;
        }
        .ghost-slot {
          flex:1;
          border:1px dashed #0d1421;
          border-radius:8px;
        }

        /* each real item card — FIXED WIDTH */
        .q-item {
          width: ${ITEM_WIDTH}px;           /* ← constant block size */
          flex: 0 0 auto;                    /* don't grow/shrink */
          border-radius:8px;
          display:flex; flex-direction:column;
          align-items:center; justify-content:center;
          position:relative; overflow:hidden;
          cursor:default;
        }

        /* right panel */
        .right-inner { flex:1; min-height:0; display:flex; flex-direction:column; gap:10px; }
        .card { background:#0a0e1a; border:1px solid #131b2e; border-radius:12px; padding:12px 14px; flex-shrink:0; }
        .card.ops { flex:1; min-height:0; display:flex; flex-direction:column; }
        .card-label { font-family:'Syne'; font-weight:700; font-size:9px; color:#1e2d45; letter-spacing:2.5px; text-transform:uppercase; margin-bottom:8px; flex-shrink:0; }
        .ops-list { flex:1; min-height:0; display:flex; flex-direction:column; }
        .op-row { flex:1; min-height:0; display:flex; align-items:center; justify-content:space-between; padding:0 10px; border-radius:6px; background:#0d1117; border:1px solid #131b2e; margin-bottom:5px; transition:border-color 0.2s; }
        .op-row:last-child { margin-bottom:0; }
        .op-row:hover { border-color:#1e2d45; }

        .enq-btn { background:linear-gradient(135deg,#f59e0b,#f97316); color:#000; border:none; border-radius:8px; padding:9px 18px; font-family:'Syne'; font-size:12px; font-weight:800; cursor:pointer; box-shadow:0 0 16px #f59e0b28; transition:all 0.2s; white-space:nowrap; flex-shrink:0; }
        .enq-btn:hover { transform:translateY(-1px); box-shadow:0 0 24px #f59e0b48; }

        .act-btn { flex:1; border:none; border-radius:8px; padding:9px 4px; font-family:'Syne'; font-size:11px; font-weight:700; cursor:pointer; transition:all 0.2s; }
        .act-btn:disabled { opacity:0.28; cursor:not-allowed; }
        .act-btn:hover:not(:disabled) { transform:translateY(-1px); }
        .deq-btn   { background:#10b98115; color:#10b981; border:1px solid #10b98130; }
        .peek-btn  { background:#06b6d415; color:#06b6d4; border:1px solid #06b6d430; }
        .clear-btn { background:#94a3b810; color:#94a3b8; border:1px solid #94a3b820; }
        .deq-btn:hover:not(:disabled)   { background:#10b98125; }
        .peek-btn:hover:not(:disabled)  { background:#06b6d425; }
        .clear-btn:hover:not(:disabled) { background:#94a3b820; }

        .q-input { flex:1; background:#0d1117; border:1px solid #1e2736; border-radius:8px; padding:9px 12px; color:white; font-family:'JetBrains Mono'; font-size:13px; outline:none; min-width:0; transition:border-color 0.2s, box-shadow 0.2s; }
        .q-input:focus { border-color:#f59e0b60; box-shadow:0 0 0 3px #f59e0b14; }
        .q-input::placeholder { color:#1e2d45; }
      `}</style>

      <div className="shell">

        {/* ══════ LEFT 50% ══════ */}
        <div className="left-half">

          {/* header */}
          <div style={{ display:'flex', alignItems:'baseline', gap:'10px', marginBottom:'14px', flexShrink:0 }}>
            <h1 style={{ fontFamily:'Syne', fontWeight:800, fontSize:'1.7rem', color:'white', letterSpacing:'-0.5px', lineHeight:1 }}>Queue</h1>
            <span style={{ fontFamily:'JetBrains Mono', fontSize:'10px', color:'#f59e0b', background:'#f59e0b15', border:'1px solid #f59e0b30', borderRadius:'4px', padding:'2px 8px', letterSpacing:'1px' }}>FIFO</span>
            {queue.length > 0 && (
              <motion.span initial={{opacity:0}} animate={{opacity:1}}
                style={{ fontFamily:'JetBrains Mono', fontSize:'10px', color:'#f59e0b', background:'#f59e0b15', border:'1px solid #f59e0b30', borderRadius:'4px', padding:'2px 8px' }}>
                {queue.length}/{MAX_SIZE}
              </motion.span>
            )}
          </div>

          <div className="pipe-wrap">

            {/* ── REAR (left) and FRONT (right) labels ── */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
              <span style={{ fontFamily:'JetBrains Mono', fontSize:'9px', color:'#f59e0b', letterSpacing:'2px', textTransform:'uppercase', display:'flex', alignItems:'center', gap:'4px' }}>
                <motion.span animate={{x:[0,-3,0]}} transition={{duration:1.4,repeat:Infinity,ease:'easeInOut'}}>←</motion.span>
                rear (enqueue)
              </span>
              <span style={{ fontFamily:'JetBrains Mono', fontSize:'9px', color:'#10b981', letterSpacing:'2px', textTransform:'uppercase', display:'flex', alignItems:'center', gap:'4px' }}>
                front (dequeue)
                <motion.span animate={{x:[0,3,0]}} transition={{duration:1.4,repeat:Infinity,ease:'easeInOut'}}>→</motion.span>
              </span>
            </div>

            {/* ── THE PIPE ── */}
            <div className="pipe-outer">

              {/* size badge */}
              <div style={{ position:'absolute', top:'6px', right:'8px', zIndex:20, fontFamily:'JetBrains Mono', fontSize:'9px', color: queue.length >= MAX_SIZE ? '#ef4444' : '#131b2e', letterSpacing:'1px' }}>
                {queue.length}/{MAX_SIZE}
              </div>

              {/* ghost slots — always visible */}
              <div className="ghost-slots">
                {Array.from({length: MAX_SIZE}).map((_,i) => <div key={i} className="ghost-slot" />)}
              </div>

              {/* empty state */}
              {queue.length === 0 && (
                <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', zIndex:5 }}>
                  <span style={{ fontFamily:'JetBrains Mono', fontSize:'10px', color:'#0d1421', letterSpacing:'1px' }}>empty queue</span>
                </div>
              )}

              {/* Items — enqueue from left (enter from left), dequeue from right (exit to right) */}
              <div className="pipe-inner" style={{ zIndex:10 }}>
                <AnimatePresence mode="popLayout">
                  {queue.map((item, index) => {
                    const isFront = index === queue.length - 1   // rightmost is front
                    const isRear  = index === 0                  // leftmost is rear
                    const isPeek  = peeking && isFront

                    return (
                      <motion.div
                        key={item.id}
                        layout
                        className="q-item"
                        initial={{
                          opacity: 0,
                          x: -ITEM_WIDTH - GAP,                  // enters from LEFT
                          scale: 0.82,
                        }}
                        animate={{
                          opacity: 1,
                          x: 0,
                          scale: isPeek ? 1.04 : 1,
                          background: isPeek
                            ? `linear-gradient(135deg,${item.color.bg}50,${item.color.bg}22)`
                            : isFront
                            ? `linear-gradient(135deg,${item.color.bg}32,${item.color.bg}10)`
                            : `linear-gradient(135deg,${item.color.bg}14,transparent)`,
                          boxShadow: isPeek
                            ? `0 0 18px ${item.color.glow}, inset 0 0 10px ${item.color.bg}20`
                            : isFront
                            ? `0 0 8px ${item.color.glow}`
                            : 'none',
                        }}
                        exit={{
                          opacity: 0,
                          x: ITEM_WIDTH + GAP,                    // exits to RIGHT
                          scale: 0.78,
                          transition: { duration: 0.28, ease: 'easeIn' },
                        }}
                        transition={{
                          layout:  { type: 'spring', stiffness: 380, damping: 30 },
                          default: { type: 'spring', stiffness: 340, damping: 26 },
                        }}
                        style={{
                          border: `1px solid ${isFront ? item.color.bg : item.color.border}`,
                        }}
                      >
                        {/* top shimmer line on front */}
                        <div style={{ position:'absolute', top:0, left:0, right:0, height:'2px', background: isFront ? `linear-gradient(90deg,transparent,${item.color.bg},transparent)` : 'transparent', transition:'background 0.3s' }} />

                        {/* value */}
                        <span style={{ fontFamily:'JetBrains Mono', fontWeight:700, fontSize:'16px', color: isFront ? item.color.bg : '#2a3d58', letterSpacing:'0.5px', lineHeight:1, overflow:'hidden', textOverflow:'ellipsis', maxWidth:'100%', padding:'0 4px' }}>
                          {item.value}
                        </span>

                        {/* index label */}
                        <span style={{ fontFamily:'JetBrains Mono', fontSize:'8px', color:'#1e2d45', marginTop:'3px' }}>
                          [{index}]
                        </span>

                        {/* front / rear badge */}
                        {(isFront || isRear) && (
                          <motion.div
                            initial={{opacity:0,y:3}} animate={{opacity:1,y:0}}
                            style={{ position:'absolute', bottom:'3px', left:0, right:0, display:'flex', justifyContent:'center' }}
                          >
                            <span style={{
                              fontFamily:'Syne', fontWeight:800, fontSize:'6px',
                              letterSpacing:'1px',
                              color:       isFront ? item.color.bg : '#253347',
                              background:  isFront ? `${item.color.bg}20` : '#0d1421',
                              border:      `1px solid ${isFront ? item.color.border : '#1a2535'}`,
                              borderRadius:'3px', padding:'1px 5px',
                            }}>
                              {isFront && isRear ? 'FRONT · REAR' : isFront ? 'FRONT' : 'REAR'}
                            </span>
                          </motion.div>
                        )}

                        {/* peek pulse ring */}
                        {isPeek && (
                          <motion.div
                            initial={{opacity:0.7}} animate={{opacity:0}}
                            transition={{duration:0.85, repeat:Infinity}}
                            style={{ position:'absolute', inset:-1, border:`2px solid ${item.color.bg}`, borderRadius:'9px', pointerEvents:'none' }}
                          />
                        )}
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            </div>

            {/* direction strip */}
            <div style={{ display:'flex', alignItems:'center', gap:'6px', padding:'0 2px', flexShrink:0 }}>
              <span style={{ fontFamily:'JetBrains Mono', fontSize:'8px', color:'#f59e0b', letterSpacing:'1px', whiteSpace:'nowrap' }}>← IN</span>
              <div style={{ flex:1, height:'1px', background:'linear-gradient(90deg,#f59e0b,#f59e0b40,#10b98140,#10b981)' }} />
              <span style={{ fontFamily:'JetBrains Mono', fontSize:'8px', color:'#10b981', letterSpacing:'1px', whiteSpace:'nowrap' }}>OUT →</span>
            </div>

            {/* flow diagram */}
            <div style={{ background:'#080b14', border:'1px solid #0d1421', borderRadius:'10px', padding:'10px 14px', flexShrink:0 }}>
              <p style={{ fontFamily:'JetBrains Mono', fontSize:'9px', color:'#1e2d45', letterSpacing:'1px', marginBottom:'10px', textTransform:'uppercase' }}>How it works</p>
              <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>

                {/* IN arrow (left) */}
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'2px', flexShrink:0 }}>
                  <motion.div animate={{x:[0,4,0]}} transition={{duration:1.1,repeat:Infinity,ease:'easeInOut'}}
                    style={{ fontFamily:'JetBrains Mono', fontSize:'13px', color:'#f59e0b', lineHeight:1 }}>→</motion.div>
                  <span style={{ fontFamily:'JetBrains Mono', fontSize:'7px', color:'#f59e0b', letterSpacing:'1px' }}>IN</span>
                </div>

                {/* mini animated queue (now left = rear, right = front) */}
                <div style={{ flex:1, display:'flex', gap:'4px', justifyContent:'center' }}>
                  {['A','B','C','D'].map((l,i) => (
                    <motion.div key={l}
                      initial={{opacity:0, x:-10}} animate={{opacity:1, x:0}}
                      transition={{delay: i*0.08}}
                      style={{ width:'28px', height:'28px', borderRadius:'5px', background: i===0?'#f59e0b20':'#0d1117', border:`1px solid ${i===0?'#f59e0b50':'#131b2e'}`, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', fontFamily:'JetBrains Mono', fontSize:'9px', fontWeight:700, color: i===0?'#f59e0b':'#1e2d45' }}>
                      {l}
                    </motion.div>
                  ))}
                </div>

                {/* OUT arrow (right) */}
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'2px', flexShrink:0 }}>
                  <motion.div animate={{x:[0,-4,0]}} transition={{duration:1.1,repeat:Infinity,ease:'easeInOut'}}
                    style={{ fontFamily:'JetBrains Mono', fontSize:'13px', color:'#10b981', lineHeight:1 }}>←</motion.div>
                  <span style={{ fontFamily:'JetBrains Mono', fontSize:'7px', color:'#10b981', letterSpacing:'1px' }}>OUT</span>
                </div>

              </div>
              <div style={{ display:'flex', justifyContent:'space-between', marginTop:'6px' }}>
                <span style={{ fontFamily:'JetBrains Mono', fontSize:'7px', color:'#1e2d45' }}>rear (new) ←</span>
                <span style={{ fontFamily:'JetBrains Mono', fontSize:'7px', color:'#1e2d45' }}>→ front (old)</span>
              </div>
            </div>

          </div>

          {/* message */}
          <div style={{ height:'30px', marginBottom:'8px', flexShrink:0 }}>
            <AnimatePresence mode="wait">
              {message && (
                <motion.div key={message.text}
                  initial={{opacity:0,y:3}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-3}}
                  transition={{duration:0.15}}
                  style={{ background:'#080b14', border:`1px solid ${msgStyles[message.type].border}`, borderRadius:'7px', padding:'6px 12px', fontFamily:'JetBrains Mono', fontSize:'11px', color:msgStyles[message.type].color }}>
                  {message.text}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* input */}
          <div style={{ display:'flex', gap:'8px', marginBottom:'8px', flexShrink:0 }}>
            <input className="q-input" type="text" value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown} placeholder="value..." maxLength={6} />
            <button className="enq-btn" onClick={handleEnqueue}>Enqueue ←</button>
          </div>

          {/* actions */}
          <div style={{ display:'flex', gap:'8px', flexShrink:0 }}>
            <button className="act-btn deq-btn"   onClick={handleDequeue} disabled={!queue.length}>Dequeue →</button>
            <button className="act-btn peek-btn"  onClick={handlePeek}    disabled={!queue.length}>Peek</button>
            <button className="act-btn clear-btn" onClick={handleClear}   disabled={!queue.length}>Clear</button>
          </div>
        </div>

        {/* ══════ RIGHT 50% (unchanged) ══════ */}
        <div className="right-half">
          <div style={{ marginBottom:'10px', flexShrink:0 }}>
            <h2 style={{ fontFamily:'Syne', fontWeight:800, fontSize:'1.7rem', color:'white', letterSpacing:'-0.5px', lineHeight:1 }}>Info</h2>
            <p style={{ fontFamily:'JetBrains Mono', fontSize:'10px', color:'#1e2d45', marginTop:'4px' }}>First In · First Out · all ops O(1)</p>
          </div>
          <div className="right-inner">
            {/* complexity */}
            <div className="card">
              <p className="card-label">Complexity</p>
              <div style={{ display:'flex', gap:'8px' }}>
                {[
                  { label:'Enqueue', value:'O(1)', color:'#f59e0b' },
                  { label:'Dequeue', value:'O(1)', color:'#10b981' },
                  { label:'Space',   value:'O(n)', color:'#06b6d4' },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ flex:1, background:'#0d1117', border:'1px solid #131b2e', borderRadius:'8px', padding:'8px', textAlign:'center' }}>
                    <p style={{ fontFamily:'JetBrains Mono', fontSize:'8px', color:'#1e2d45', marginBottom:'3px', letterSpacing:'1px' }}>{label.toUpperCase()}</p>
                    <p style={{ fontFamily:'JetBrains Mono', fontWeight:700, fontSize:'16px', color }}>{value}</p>
                  </div>
                ))}
              </div>
            </div>
            {/* queue vs stack */}
            <div className="card">
              <p className="card-label">Queue vs Stack</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px' }}>
                {[
                  { label:'Queue',  val:'FIFO',  sub:'First In First Out',  color:'#f59e0b' },
                  { label:'Stack',  val:'LIFO',  sub:'Last In First Out',   color:'#0ea5e9' },
                  { label:'Insert', val:'Rear ←', sub:'enqueue at left',    color:'#f59e0b' },
                  { label:'Remove', val:'→ Front',sub:'dequeue from right', color:'#10b981' },
                ].map(({ label, val, sub, color }) => (
                  <div key={label} style={{ background:'#0d1117', border:'1px solid #131b2e', borderRadius:'7px', padding:'8px 10px' }}>
                    <p style={{ fontFamily:'JetBrains Mono', fontSize:'8px', color:'#1e2d45', letterSpacing:'1px', marginBottom:'2px' }}>{label.toUpperCase()}</p>
                    <p style={{ fontFamily:'JetBrains Mono', fontWeight:700, fontSize:'13px', color }}>{val}</p>
                    <p style={{ fontFamily:'JetBrains Mono', fontSize:'8px', color:'#1e2d45', marginTop:'1px' }}>{sub}</p>
                  </div>
                ))}
              </div>
            </div>
            {/* operations */}
            <div className="card ops">
              <p className="card-label">Operations</p>
              <div className="ops-list">
                {[
                  { op:'enqueue(x)', desc:'Add to rear (left)',    color:'#f59e0b' },
                  { op:'dequeue()',  desc:'Remove from front (right)', color:'#10b981' },
                  { op:'peek()',     desc:'Read front element',  color:'#06b6d4' },
                  { op:'isEmpty()', desc:'Check if empty',      color:'#a78bfa' },
                  { op:'size()',     desc:'Number of elements',  color:'#f97316' },
                ].map(({ op, desc, color }) => (
                  <div key={op} className="op-row">
                    <div>
                      <p style={{ fontFamily:'JetBrains Mono', fontSize:'12px', color, fontWeight:700 }}>{op}</p>
                      <p style={{ fontFamily:'JetBrains Mono', fontSize:'9px', color:'#1e2d45', marginTop:'1px' }}>{desc}</p>
                    </div>
                    <span style={{ fontFamily:'JetBrains Mono', fontSize:'9px', color:'#10b981', background:'#10b98112', border:'1px solid #10b98125', borderRadius:'4px', padding:'2px 6px', flexShrink:0 }}>O(1)</span>
                  </div>
                ))}
              </div>
            </div>
            {/* real world uses */}
            <div className="card">
              <p className="card-label">Real World Uses</p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                {[
                  { icon:'🖨', text:'Print queue'    },
                  { icon:'⌨', text:'Keyboard input'  },
                  { icon:'📶', text:'Network packets' },
                  { icon:'🎫', text:'Task scheduler'  },
                  { icon:'📺', text:'Video buffer'    },
                ].map(({ icon, text }) => (
                  <div key={text} style={{ display:'flex', alignItems:'center', gap:'5px', background:'#0d1117', border:'1px solid #131b2e', borderRadius:'6px', padding:'5px 9px' }}>
                    <span style={{ fontSize:'11px' }}>{icon}</span>
                    <span style={{ fontFamily:'Syne', fontWeight:600, fontSize:'11px', color:'#3d5068' }}>{text}</span>
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