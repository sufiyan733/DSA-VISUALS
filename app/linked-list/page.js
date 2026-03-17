'use client'
/* eslint-disable react-hooks/refs */
import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '@/comps/navbar'

const MAX = 8
const P  = '#f472b6'   // pink/rose
const P2 = '#fb923c'   // orange
const G  = '#34d399'   // green
const R  = '#f87171'   // red
const B  = '#38bdf8'   // blue

let uid = 0
const mkNode = (val) => ({ id: ++uid, val, next: null })

// flat linked list stored as array of node objects for easy rendering
// index 0 = head

export default function LinkedListPage() {
  const [list,   setList]   = useState([])
  const [input,  setInput]  = useState('')
  const [idxInp, setIdxInp] = useState('')
  const [msg,    setMsg]    = useState(null)
  const [hl,     setHl]     = useState(new Set())   // highlighted ids
  const [hlCol,  setHlCol]  = useState(P)
  const [traversing, setTraversing] = useState(false)
  const timers = useRef([])

  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = [] }

  const showMsg = (text, type = 'info') => {
    clearTimers()
    setMsg({ text, type })
    timers.current.push(setTimeout(() => setMsg(null), 2600))
  }

  const flashIds = (ids, col = P, ms = 1800) => {
    clearTimers()
    setHl(new Set(ids))
    setHlCol(col)
    timers.current.push(setTimeout(() => setHl(new Set()), ms))
  }

  // ── operations ──────────────────────────────────────────
  const handlePrepend = () => {
    const v = input.trim()
    if (!v) { showMsg('Enter a value', 'error'); return }
    if (list.length >= MAX) { showMsg(`List full (max ${MAX})`, 'error'); return }
    const node = mkNode(v)
    setList(prev => [node, ...prev])
    setInput('')
    setTimeout(() => flashIds([node.id], P), 30)
    showMsg(`Prepended  "${v}"  at head`, 'success')
  }

  const handleAppend = () => {
    const v = input.trim()
    if (!v) { showMsg('Enter a value', 'error'); return }
    if (list.length >= MAX) { showMsg(`List full (max ${MAX})`, 'error'); return }
    const node = mkNode(v)
    setList(prev => [...prev, node])
    setInput('')
    setTimeout(() => flashIds([node.id], P), 30)
    showMsg(`Appended  "${v}"  at tail`, 'success')
  }

  const handleInsertAt = () => {
    const v   = input.trim()
    const idx = parseInt(idxInp)
    if (!v) { showMsg('Enter a value', 'error'); return }
    if (isNaN(idx) || idx < 0 || idx > list.length) { showMsg(`Index 0–${list.length}`, 'error'); return }
    if (list.length >= MAX) { showMsg(`List full (max ${MAX})`, 'error'); return }
    const node = mkNode(v)
    setList(prev => { const a = [...prev]; a.splice(idx, 0, node); return a })
    setInput(''); setIdxInp('')
    setTimeout(() => flashIds([node.id], P), 30)
    showMsg(`Inserted  "${v}"  at position ${idx}`, 'success')
  }

  const handleDeleteHead = () => {
    if (!list.length) { showMsg('List is empty', 'error'); return }
    const head = list[0]
    flashIds([head.id], R, 400)
    setTimeout(() => setList(prev => prev.slice(1)), 420)
    showMsg(`Deleted head  "${head.val}"`, 'delete')
  }

  const handleDeleteTail = () => {
    if (!list.length) { showMsg('List is empty', 'error'); return }
    const tail = list[list.length - 1]
    flashIds([tail.id], R, 400)
    setTimeout(() => setList(prev => prev.slice(0, -1)), 420)
    showMsg(`Deleted tail  "${tail.val}"`, 'delete')
  }

  const handleDeleteAt = () => {
    const idx = parseInt(idxInp)
    if (isNaN(idx) || idx < 0 || idx >= list.length) { showMsg(`Index 0–${list.length - 1}`, 'error'); return }
    const node = list[idx]
    flashIds([node.id], R, 420)
    setTimeout(() => setList(prev => prev.filter((_, i) => i !== idx)), 440)
    setIdxInp('')
    showMsg(`Deleted  "${node.val}"  at position ${idx}`, 'delete')
  }

  const handleSearch = () => {
    const v = input.trim()
    if (!v) { showMsg('Enter a value to search', 'error'); return }
    if (!list.length) { showMsg('List is empty', 'error'); return }
    clearTimers()
    setTraversing(true)
    setHl(new Set())
    let found = false
    list.forEach((node, i) => {
      timers.current.push(setTimeout(() => {
        setHl(new Set([node.id]))
        setHlCol(node.val === v ? G : B)
        if (node.val === v && !found) {
          found = true
          showMsg(`Found  "${v}"  at position ${i}`, 'success')
          timers.current.push(setTimeout(() => { setHl(new Set()); setTraversing(false) }, 1600))
        }
        if (i === list.length - 1 && !found) {
          showMsg(`"${v}"  not found`, 'error')
          timers.current.push(setTimeout(() => { setHl(new Set()); setTraversing(false) }, 1200))
        }
      }, i * 420))
    })
    setInput('')
  }

  const handleReverse = () => {
    if (list.length < 2) { showMsg('Need at least 2 nodes', 'error'); return }
    clearTimers()
    setHl(new Set())
    // animate traversal then flip
    list.forEach((node, i) => {
      timers.current.push(setTimeout(() => {
        setHl(new Set([node.id]))
        setHlCol(P2)
      }, i * 200))
    })
    timers.current.push(setTimeout(() => {
      setList(prev => [...prev].reverse())
      setHl(new Set())
      showMsg('List reversed', 'success')
    }, list.length * 200 + 200))
  }

  const handleClear = () => {
    clearTimers(); setList([]); setHl(new Set())
    showMsg('List cleared', 'info')
  }

  const msgStyle = {
    success: { c: G,         b: `${G}28`   },
    error:   { c: R,         b: `${R}28`   },
    delete:  { c: '#fb923c', b: '#fb923c28' },
    info:    { c: '#64748b', b: '#64748b20' },
  }

  return (
    <>
      <Navbar />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');
        html,body{margin:0;padding:0;overflow:hidden;height:100%;}
        *,*::before,*::after{box-sizing:border-box;}

        .shell{height:calc(100vh - 52px);background:#0a030f;display:flex;overflow:hidden;position:relative;}
        .shell::after{content:'';position:absolute;inset:0;pointer-events:none;z-index:0;
          background-image:radial-gradient(circle,#2a031520 1px,transparent 1px);background-size:24px 24px;}

        .col{position:relative;z-index:1;width:50%;height:100%;overflow:hidden;display:flex;flex-direction:column;}
        .col-l{padding:18px 14px 16px 22px;border-right:1px solid #1e0515;}
        .col-r{padding:18px 22px 16px 14px;}

        .ll-canvas{flex:1;min-height:0;border-radius:14px;border:1px solid #1e0515;background:#060310;
          position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center;}
        .ll-canvas::before{content:'';position:absolute;inset:0;pointer-events:none;
          background:linear-gradient(#1e051512 1px,transparent 1px),linear-gradient(90deg,#1e051512 1px,transparent 1px);
          background-size:28px 28px;}

        .panel{flex:1;min-height:0;display:flex;flex-direction:column;gap:8px;}
        .card{background:#060310;border:1px solid #1e0515;border-radius:10px;padding:10px 13px;flex-shrink:0;}
        .card.fill{flex:1;min-height:0;display:flex;flex-direction:column;}
        .clabel{font-family:'Syne';font-weight:700;font-size:9px;color:#2a0318;letter-spacing:2px;text-transform:uppercase;margin-bottom:7px;flex-shrink:0;}
        .olist{flex:1;min-height:0;display:flex;flex-direction:column;}
        .orow{flex:1;min-height:0;display:flex;align-items:center;justify-content:space-between;
          padding:0 10px;border-radius:6px;background:#04020a;border:1px solid #1e0515;
          margin-bottom:4px;transition:border-color 0.2s;}
        .orow:last-child{margin-bottom:0;}
        .orow:hover{border-color:#3d0525;}

        .btn-main{background:linear-gradient(135deg,${P},#e879a4);color:#fff;border:none;border-radius:8px;
          padding:9px 16px;font-family:'Syne';font-size:12px;font-weight:800;cursor:pointer;
          box-shadow:0 0 16px ${P}28;transition:all 0.18s;white-space:nowrap;flex-shrink:0;}
        .btn-main:hover{transform:translateY(-1px);box-shadow:0 0 26px ${P}50;}
        .btn-main2{background:linear-gradient(135deg,${P2},#f59e0b);color:#000;border:none;border-radius:8px;
          padding:9px 16px;font-family:'Syne';font-size:12px;font-weight:800;cursor:pointer;
          box-shadow:0 0 14px ${P2}28;transition:all 0.18s;white-space:nowrap;flex-shrink:0;}
        .btn-main2:hover{transform:translateY(-1px);box-shadow:0 0 24px ${P2}50;}

        .btn-act{flex:1;border:none;border-radius:7px;padding:8px 4px;font-family:'Syne';font-size:10px;font-weight:700;cursor:pointer;transition:all 0.18s;}
        .btn-act:disabled{opacity:0.22;cursor:not-allowed;}
        .btn-act:hover:not(:disabled){transform:translateY(-1px);}
        .b-dh  {background:${R}14;color:${R};border:1px solid ${R}28;}
        .b-dt  {background:${R}14;color:${R};border:1px solid ${R}28;}
        .b-di  {background:${R}14;color:${R};border:1px solid ${R}28;}
        .b-ins {background:${P}14;color:${P};border:1px solid ${P}28;}
        .b-srch{background:${B}14;color:${B};border:1px solid ${B}28;}
        .b-rev {background:${P2}14;color:${P2};border:1px solid ${P2}28;}
        .b-clr {background:#64748b14;color:#64748b;border:1px solid #64748b28;}
        .b-dh:hover:not(:disabled)  {background:${R}22;}
        .b-dt:hover:not(:disabled)  {background:${R}22;}
        .b-di:hover:not(:disabled)  {background:${R}22;}
        .b-ins:hover:not(:disabled) {background:${P}22;}
        .b-srch:hover:not(:disabled){background:${B}22;}
        .b-rev:hover:not(:disabled) {background:${P2}22;}
        .b-clr:hover:not(:disabled) {background:#64748b22;}

        .ll-inp{flex:1;background:#04020a;border:1px solid #2a0318;border-radius:8px;
          padding:9px 12px;color:#e2e8f0;font-family:'JetBrains Mono';font-size:13px;
          outline:none;min-width:0;transition:border-color 0.2s,box-shadow 0.2s;}
        .ll-inp:focus{border-color:${P}55;box-shadow:0 0 0 3px ${P}12;}
        .ll-inp::placeholder{color:#2a0318;}
        .idx-inp{width:68px;flex-shrink:0;background:#04020a;border:1px solid #2a0318;border-radius:8px;
          padding:9px 9px;color:#e2e8f0;font-family:'JetBrains Mono';font-size:13px;
          outline:none;transition:border-color 0.2s,box-shadow 0.2s;}
        .idx-inp:focus{border-color:${P}55;box-shadow:0 0 0 3px ${P}12;}
        .idx-inp::placeholder{color:#2a0318;}
        .idx-inp::-webkit-inner-spin-button{-webkit-appearance:none;}
        .idx-inp[type=number]{-moz-appearance:textfield;}
      `}</style>

      <div className="shell">

        {/* ════ LEFT ════ */}
        <div className="col col-l">

          {/* header */}
          <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'10px', flexShrink:0 }}>
            <h1 style={{ fontFamily:'Syne', fontWeight:800, fontSize:'1.6rem', color:'#e2e8f0', letterSpacing:'-0.5px', lineHeight:1, margin:0 }}>Linked List</h1>
            <span style={{ fontFamily:'JetBrains Mono', fontSize:'10px', color:P, background:`${P}14`, border:`1px solid ${P}28`, borderRadius:'4px', padding:'2px 8px', letterSpacing:'0.5px' }}>
              Singly
            </span>
            <span style={{ fontFamily:'JetBrains Mono', fontSize:'10px', color:'#2a0318', marginLeft:'auto' }}>
              {list.length}/{MAX} nodes
            </span>
          </div>

          {/* linked list canvas */}
          <div className="ll-canvas">

            {/* empty state */}
            {list.length === 0 && (
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'10px', pointerEvents:'none', zIndex:2 }}>
                <div style={{ width:'36px', height:'36px', border:'1px dashed #1e0515', borderRadius:'6px', display:'flex', alignItems:'center', justifyContent:'center', color:'#1e0515', fontSize:'12px', fontFamily:'JetBrains Mono' }}>null</div>
                <p style={{ fontFamily:'JetBrains Mono', fontSize:'10px', color:'#1e0515', letterSpacing:'1px' }}>prepend or append a node</p>
              </div>
            )}

            {/* nodes + arrows — horizontal chain */}
            {list.length > 0 && (
              <div style={{ position:'relative', zIndex:4, display:'flex', alignItems:'center', padding:'20px', gap:0, flexWrap:'wrap', justifyContent:'center', rowGap:'16px' }}>
                <AnimatePresence mode="popLayout" initial={false}>
                  {list.map((node, i) => {
                    const isHl   = hl.has(node.id)
                    const isHead = i === 0
                    const isTail = i === list.length - 1

                    return (
                      <motion.div
                        key={node.id}
                        layout
                        initial={{ opacity:0, scale:0.5, x:-30 }}
                        animate={{ opacity:1, scale:1, x:0 }}
                        exit={{ opacity:0, scale:0.5, x:30, transition:{ duration:0.22 } }}
                        transition={{ layout:{ type:'spring', stiffness:360, damping:28 }, default:{ type:'spring', stiffness:340, damping:22 } }}
                        style={{ display:'flex', alignItems:'center' }}
                      >
                        {/* HEAD label */}
                        {isHead && (
                          <motion.div initial={{opacity:0,y:-4}} animate={{opacity:1,y:0}}
                            style={{ position:'absolute', top:'-22px', left:'0', width:'100%' }}>
                          </motion.div>
                        )}

                        {/* node box */}
                        <motion.div
                          animate={{
                            background: isHl ? `${hlCol}1a` : '#08051a',
                            borderColor: isHl ? hlCol : '#2a0520',
                            boxShadow: isHl ? `0 0 16px ${hlCol}40` : 'none',
                          }}
                          transition={{ duration:0.2 }}
                          style={{
                            width:'72px', height:'72px',
                            borderRadius:'10px',
                            border:`1px solid #2a0520`,
                            display:'flex', flexDirection:'column',
                            alignItems:'center', justifyContent:'center',
                            position:'relative', overflow:'hidden',
                          }}
                        >
                          {/* top glow */}
                          <div style={{ position:'absolute', top:0, left:0, right:0, height:'2px', background: isHl ? `linear-gradient(90deg,transparent,${hlCol},transparent)` : 'transparent', transition:'background 0.3s' }} />

                          {/* data section */}
                          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'1px', flex:1, justifyContent:'center' }}>
                            <span style={{ fontFamily:'JetBrains Mono', fontWeight:700, fontSize: node.val.length > 4 ? '10px' : '14px', color: isHl ? hlCol : '#3d0530', letterSpacing:'0.5px', lineHeight:1 }}>
                              {node.val}
                            </span>
                            <span style={{ fontFamily:'JetBrains Mono', fontSize:'7px', color:'#2a0318', marginTop:'3px' }}>
                              [{i}]
                            </span>
                          </div>

                          {/* next pointer section at bottom */}
                          <div style={{ width:'100%', height:'18px', borderTop:'1px solid #2a0520', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                            <span style={{ fontFamily:'JetBrains Mono', fontSize:'7px', color: isTail ? '#2a0318' : `${P}60`, letterSpacing:'0.5px' }}>
                              {isTail ? 'null' : 'next →'}
                            </span>
                          </div>

                          {/* badge */}
                          {(isHead || isTail) && !(isHead && isTail) && (
                            <motion.div initial={{opacity:0,y:-3}} animate={{opacity:1,y:0}}
                              style={{ position:'absolute', top:'3px', left:0, right:0, display:'flex', justifyContent:'center' }}>
                              <span style={{ fontFamily:'Syne', fontWeight:800, fontSize:'6px', letterSpacing:'1px', color: isHead ? P : '#2a0318', background: isHead ? `${P}20` : '#0c041a', border:`1px solid ${isHead ? `${P}40` : '#2a0318'}`, borderRadius:'3px', padding:'1px 5px' }}>
                                {isHead ? 'HEAD' : 'TAIL'}
                              </span>
                            </motion.div>
                          )}
                          {isHead && isTail && (
                            <motion.div initial={{opacity:0,y:-3}} animate={{opacity:1,y:0}}
                              style={{ position:'absolute', top:'3px', left:0, right:0, display:'flex', justifyContent:'center' }}>
                              <span style={{ fontFamily:'Syne', fontWeight:800, fontSize:'6px', letterSpacing:'1px', color:P, background:`${P}20`, border:`1px solid ${P}40`, borderRadius:'3px', padding:'1px 5px' }}>
                                HEAD · TAIL
                              </span>
                            </motion.div>
                          )}

                          {/* pulse ring */}
                          {isHl && (
                            <motion.div initial={{opacity:0.7}} animate={{opacity:0}}
                              transition={{duration:0.85, repeat:Infinity}}
                              style={{ position:'absolute', inset:-1, border:`1px solid ${hlCol}`, borderRadius:'10px', pointerEvents:'none' }}
                            />
                          )}
                        </motion.div>

                        {/* arrow to next node */}
                        {!isTail && (
                          <motion.div
                            layout
                            style={{ display:'flex', alignItems:'center', gap:'0', margin:'0 2px' }}
                          >
                            {/* line */}
                            <motion.div
                              animate={{ background: isHl ? `linear-gradient(90deg,${hlCol},${hlCol}60)` : `linear-gradient(90deg,#2a0520,#2a052060)` }}
                              transition={{ duration:0.2 }}
                              style={{ width:'24px', height:'1.5px' }}
                            />
                            {/* arrowhead */}
                            <motion.div
                              animate={{ borderLeftColor: isHl ? hlCol : '#2a0520' }}
                              transition={{ duration:0.2 }}
                              style={{ width:0, height:0, borderTop:'5px solid transparent', borderBottom:'5px solid transparent', borderLeft:`7px solid #2a0520` }}
                            />
                          </motion.div>
                        )}

                        {/* null terminator after tail */}
                        {isTail && list.length > 0 && (
                          <motion.div layout style={{ display:'flex', alignItems:'center', gap:'0', margin:'0 2px' }}>
                            <div style={{ width:'20px', height:'1.5px', background:'linear-gradient(90deg,#2a0520,#2a052060)' }} />
                            <div style={{ width:'28px', height:'22px', border:'1px solid #2a0520', borderRadius:'4px', display:'flex', alignItems:'center', justifyContent:'center' }}>
                              <span style={{ fontFamily:'JetBrains Mono', fontSize:'7px', color:'#2a0318', letterSpacing:'0.5px' }}>null</span>
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* message */}
          <div style={{ height:'28px', marginTop:'7px', marginBottom:'7px', flexShrink:0 }}>
            <AnimatePresence mode="wait">
              {msg && (
                <motion.div key={msg.text}
                  initial={{opacity:0,y:3}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-3}}
                  transition={{duration:0.15}}
                  style={{ background:'#04020a', border:`1px solid ${msgStyle[msg.type].b}`, borderRadius:'7px', padding:'5px 13px', fontFamily:'JetBrains Mono', fontSize:'11px', color:msgStyle[msg.type].c, height:'100%', display:'flex', alignItems:'center' }}>
                  {msg.text}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* input rows */}
          <div style={{ display:'flex', gap:'7px', marginBottom:'7px', flexShrink:0 }}>
            <input className="ll-inp" placeholder="value…" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter') handleAppend() }} />
            <input className="idx-inp" type="number" placeholder="idx" value={idxInp} onChange={e=>setIdxInp(e.target.value)} />
          </div>

          <div style={{ display:'flex', gap:'7px', marginBottom:'7px', flexShrink:0 }}>
            <button className="btn-main"  onClick={handlePrepend} disabled={list.length>=MAX}>Prepend</button>
            <button className="btn-main2" onClick={handleAppend}  disabled={list.length>=MAX}>Append</button>
            <button className="btn-act b-ins" onClick={handleInsertAt} disabled={list.length>=MAX}>Insert at</button>
          </div>

          <div style={{ display:'flex', gap:'7px', marginBottom:'7px', flexShrink:0 }}>
            <button className="btn-act b-dh"   onClick={handleDeleteHead} disabled={!list.length}>Del Head</button>
            <button className="btn-act b-dt"   onClick={handleDeleteTail} disabled={!list.length}>Del Tail</button>
            <button className="btn-act b-di"   onClick={handleDeleteAt}   disabled={!list.length}>Del at</button>
            <button className="btn-act b-srch" onClick={handleSearch}     disabled={!list.length || traversing}>Search</button>
          </div>

          <div style={{ display:'flex', gap:'7px', flexShrink:0 }}>
            <button className="btn-act b-rev"  onClick={handleReverse} disabled={list.length < 2}>Reverse</button>
            <button className="btn-act b-clr"  onClick={handleClear}   disabled={!list.length}>Clear</button>
          </div>
        </div>

        {/* ════ RIGHT ════ */}
        <div className="col col-r">
          <div style={{ marginBottom:'10px', flexShrink:0 }}>
            <h2 style={{ fontFamily:'Syne', fontWeight:800, fontSize:'1.6rem', color:'#e2e8f0', letterSpacing:'-0.5px', lineHeight:1, margin:0 }}>Info</h2>
            <p style={{ fontFamily:'JetBrains Mono', fontSize:'10px', color:'#2a0318', marginTop:'4px' }}>
              nodes linked by pointers  ·  O(1) insert at head
            </p>
          </div>

          <div className="panel">

            <div className="card">
              <p className="clabel">Structure</p>
              <div style={{ display:'flex', gap:'6px' }}>
                {[
                  { lbl:'Head ptr', val:'→ first', col:P  },
                  { lbl:'Each node', val:'data+next', col:B  },
                  { lbl:'Tail',     val:'→ null',  col:P2 },
                ].map(({lbl,val,col})=>(
                  <div key={lbl} style={{ flex:1, background:'#04020a', border:'1px solid #1e0515', borderRadius:'7px', padding:'8px 6px', textAlign:'center' }}>
                    <p style={{ fontFamily:'JetBrains Mono', fontSize:'8px', color:'#2a0318', marginBottom:'3px' }}>{lbl}</p>
                    <p style={{ fontFamily:'JetBrains Mono', fontWeight:700, fontSize:'12px', color:col }}>{val}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <p className="clabel">Complexity</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'5px' }}>
                {[
                  { lbl:'Prepend (head)',  val:'O(1)', col:G  },
                  { lbl:'Append (tail)',   val:'O(n)', col:P2 },
                  { lbl:'Search',          val:'O(n)', col:B  },
                  { lbl:'Delete at head',  val:'O(1)', col:G  },
                  { lbl:'Delete at tail',  val:'O(n)', col:R  },
                  { lbl:'Space',           val:'O(n)', col:P  },
                ].map(({lbl,val,col})=>(
                  <div key={lbl} style={{ background:'#04020a', border:'1px solid #1e0515', borderRadius:'6px', padding:'7px 9px' }}>
                    <p style={{ fontFamily:'JetBrains Mono', fontSize:'8px', color:'#2a0318', marginBottom:'2px' }}>{lbl}</p>
                    <p style={{ fontFamily:'JetBrains Mono', fontWeight:700, fontSize:'13px', color:col }}>{val}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <p className="clabel">vs Array</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'5px' }}>
                {[
                  { lbl:'LL insert head', val:'O(1)',    col:G  },
                  { lbl:'Arr insert head',val:'O(n)',    col:R  },
                  { lbl:'LL access [i]',  val:'O(n)',    col:R  },
                  { lbl:'Arr access [i]', val:'O(1)',    col:G  },
                  { lbl:'LL memory',      val:'+ ptrs',  col:P2 },
                  { lbl:'Arr memory',     val:'contiguous',col:B },
                ].map(({lbl,val,col})=>(
                  <div key={lbl} style={{ background:'#04020a', border:'1px solid #1e0515', borderRadius:'6px', padding:'7px 9px' }}>
                    <p style={{ fontFamily:'JetBrains Mono', fontSize:'8px', color:'#2a0318', marginBottom:'2px' }}>{lbl}</p>
                    <p style={{ fontFamily:'JetBrains Mono', fontWeight:700, fontSize:'12px', color:col }}>{val}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="card fill">
              <p className="clabel">Operations</p>
              <div className="olist">
                {[
                  { op:'prepend(x)',    desc:'Insert before head',       col:P  },
                  { op:'append(x)',     desc:'Insert after tail',        col:P2 },
                  { op:'insert(i,x)',   desc:'Insert at position i',     col:P  },
                  { op:'deleteHead()',  desc:'Remove head node',         col:R  },
                  { op:'deleteTail()',  desc:'Remove tail node',         col:R  },
                  { op:'search(x)',     desc:'Traverse until found',     col:B  },
                ].map(({op,desc,col})=>(
                  <div key={op} className="orow">
                    <div>
                      <p style={{ fontFamily:'JetBrains Mono', fontWeight:700, fontSize:'11px', color:col, margin:0 }}>{op}</p>
                      <p style={{ fontFamily:'JetBrains Mono', fontSize:'9px', color:'#2a0318', marginTop:'1px' }}>{desc}</p>
                    </div>
                    <span style={{ fontFamily:'JetBrains Mono', fontSize:'9px', color:P, background:`${P}10`, border:`1px solid ${P}22`, borderRadius:'4px', padding:'2px 6px', flexShrink:0 }}>
                      {op==='prepend(x)'||op==='deleteHead()' ? 'O(1)' : 'O(n)'}
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