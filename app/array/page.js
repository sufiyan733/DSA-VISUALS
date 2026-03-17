'use client'
/* eslint-disable react-hooks/refs */
import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '@/comps/navbar'

const MAX = 12
const A   = '#a78bfa'   // violet accent
const A2  = '#38bdf8'   // blue
const G   = '#34d399'   // green
const R   = '#f87171'   // red
const Y   = '#fbbf24'   // amber

export default function ArrayPage() {
  const [arr,     setArr]     = useState([])
  const [input,   setInput]   = useState('')
  const [idxInput,setIdxInput]= useState('')
  const [msg,     setMsg]     = useState(null)
  const [hl,      setHl]      = useState(new Set())   // highlighted indices
  const [hlCol,   setHlCol]   = useState(A)
  const [searching,setSearching]=useState(false)
  const timers = useRef([])

  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = [] }

  const showMsg = (text, type = 'info') => {
    clearTimers()
    setMsg({ text, type })
    timers.current.push(setTimeout(() => setMsg(null), 2500))
  }

  const flashIdx = (indices, col = A, ms = 1800) => {
    clearTimers()
    setHl(new Set(indices))
    setHlCol(col)
    timers.current.push(setTimeout(() => setHl(new Set()), ms))
  }

  // ── operations ──────────────────────────────────────────
  const handlePush = () => {
    const v = input.trim()
    if (!v) { showMsg('Enter a value', 'error'); return }
    if (arr.length >= MAX) { showMsg(`Array full (max ${MAX})`, 'error'); return }
    const id = Date.now() + Math.random()
    setArr(prev => [...prev, { id, val: v }])
    setInput('')
    setTimeout(() => flashIdx([arr.length], A), 30)
    showMsg(`Pushed  "${v}"  at index ${arr.length}`, 'success')
  }

  const handlePop = () => {
    if (!arr.length) { showMsg('Array is empty', 'error'); return }
    const last = arr[arr.length - 1]
    flashIdx([arr.length - 1], R, 400)
    setTimeout(() => setArr(prev => prev.slice(0, -1)), 420)
    showMsg(`Popped  "${last.val}"  from index ${arr.length - 1}`, 'delete')
  }

  const handleInsertAt = () => {
    const v   = input.trim()
    const idx = parseInt(idxInput)
    if (!v) { showMsg('Enter a value', 'error'); return }
    if (isNaN(idx) || idx < 0 || idx > arr.length) { showMsg(`Index must be 0–${arr.length}`, 'error'); return }
    if (arr.length >= MAX) { showMsg(`Array full (max ${MAX})`, 'error'); return }
    const id = Date.now() + Math.random()
    setArr(prev => { const a = [...prev]; a.splice(idx, 0, { id, val: v }); return a })
    setInput(''); setIdxInput('')
    setTimeout(() => flashIdx([idx], A), 30)
    showMsg(`Inserted  "${v}"  at index ${idx}`, 'success')
  }

  const handleDeleteAt = () => {
    const idx = parseInt(idxInput)
    if (isNaN(idx) || idx < 0 || idx >= arr.length) { showMsg(`Index must be 0–${arr.length - 1}`, 'error'); return }
    const val = arr[idx].val
    flashIdx([idx], R, 420)
    setTimeout(() => setArr(prev => prev.filter((_, i) => i !== idx)), 440)
    setIdxInput('')
    showMsg(`Deleted  "${val}"  at index ${idx}`, 'delete')
  }

  const handleLinearSearch = () => {
    const v = input.trim()
    if (!v) { showMsg('Enter a value to search', 'error'); return }
    if (!arr.length) { showMsg('Array is empty', 'error'); return }
    clearTimers()
    setSearching(true)
    setHl(new Set())
    let found = false
    arr.forEach((item, i) => {
      timers.current.push(setTimeout(() => {
        setHl(new Set([i]))
        setHlCol(item.val === v ? G : Y)
        if (item.val === v && !found) {
          found = true
          showMsg(`Found  "${v}"  at index ${i}`, 'success')
          timers.current.push(setTimeout(() => { setHl(new Set()); setSearching(false) }, 1600))
        }
        if (i === arr.length - 1 && !found) {
          showMsg(`"${v}"  not found`, 'error')
          timers.current.push(setTimeout(() => { setHl(new Set()); setSearching(false) }, 1200))
        }
      }, i * 380))
    })
    setInput('')
  }

  const handleReverse = () => {
    if (!arr.length) { showMsg('Array is empty', 'error'); return }
    clearTimers()
    const n = arr.length
    let step = 0
    const animate = (l, r, cur) => {
      if (l >= r) {
        setArr([...cur])
        setHl(new Set())
        showMsg('Array reversed', 'success')
        return
      }
      setHl(new Set([l, r]))
      setHlCol(A2)
      timers.current.push(setTimeout(() => {
        const next = [...cur]
        ;[next[l], next[r]] = [next[r], next[l]]
        setArr([...next])
        animate(l + 1, r - 1, next)
      }, 480))
    }
    animate(0, n - 1, [...arr])
  }

  const handleSort = () => {
    if (!arr.length) { showMsg('Nothing to sort', 'error'); return }
    clearTimers()
    const a = arr.map(item => ({ ...item }))
    const steps = []
    for (let i = 0; i < a.length - 1; i++) {
      for (let j = 0; j < a.length - i - 1; j++) {
        steps.push({ type: 'compare', i: j, j: j + 1, arr: a.map(x => ({ ...x })) })
        if (a[j].val > a[j + 1].val) {
          ;[a[j], a[j + 1]] = [a[j + 1], a[j]]
          steps.push({ type: 'swap', i: j, j: j + 1, arr: a.map(x => ({ ...x })) })
        }
      }
    }
    steps.push({ type: 'done', arr: a.map(x => ({ ...x })) })
    steps.forEach((s, idx) => {
      timers.current.push(setTimeout(() => {
        setArr(s.arr)
        if (s.type === 'compare') { setHl(new Set([s.i, s.j])); setHlCol(Y) }
        else if (s.type === 'swap') { setHl(new Set([s.i, s.j])); setHlCol(R) }
        else { setHl(new Set()); showMsg('Sorted!', 'success') }
      }, idx * 180))
    })
  }

  const handleClear = () => {
    clearTimers(); setArr([]); setHl(new Set())
    showMsg('Array cleared', 'info')
  }

  const msgStyle = {
    success: { c: G,         b: `${G}28`  },
    error:   { c: R,         b: `${R}28`  },
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

        .shell{height:calc(100vh - 52px);background:#03060f;display:flex;overflow:hidden;position:relative;}
        .shell::after{content:'';position:absolute;inset:0;pointer-events:none;z-index:0;
          background-image:radial-gradient(circle,#1a0a3520 1px,transparent 1px);background-size:24px 24px;}

        .col{position:relative;z-index:1;width:50%;height:100%;overflow:hidden;display:flex;flex-direction:column;}
        .col-l{padding:18px 14px 16px 22px;border-right:1px solid #130a2e;}
        .col-r{padding:18px 22px 16px 14px;}

        .arr-canvas{flex:1;min-height:0;border-radius:14px;border:1px solid #130a2e;background:#040814;
          position:relative;overflow:hidden;display:flex;flex-direction:column;}
        .arr-canvas::before{content:'';position:absolute;inset:0;pointer-events:none;
          background:linear-gradient(#130a2e12 1px,transparent 1px),linear-gradient(90deg,#130a2e12 1px,transparent 1px);
          background-size:28px 28px;}

        /* memory address row */
        .addr-row{position:absolute;bottom:0;left:0;right:0;height:20px;
          display:flex;align-items:flex-end;padding:0 24px;gap:0;pointer-events:none;z-index:5;}

        .panel{flex:1;min-height:0;display:flex;flex-direction:column;gap:8px;}
        .card{background:#040814;border:1px solid #130a2e;border-radius:10px;padding:10px 13px;flex-shrink:0;}
        .card.fill{flex:1;min-height:0;display:flex;flex-direction:column;}
        .clabel{font-family:'Syne';font-weight:700;font-size:9px;color:#1a0a35;letter-spacing:2px;text-transform:uppercase;margin-bottom:7px;flex-shrink:0;}
        .olist{flex:1;min-height:0;display:flex;flex-direction:column;}
        .orow{flex:1;min-height:0;display:flex;align-items:center;justify-content:space-between;
          padding:0 10px;border-radius:6px;background:#030610;border:1px solid #130a2e;
          margin-bottom:4px;transition:border-color 0.2s;}
        .orow:last-child{margin-bottom:0;}
        .orow:hover{border-color:#2a1260;}

        .btn-main{background:linear-gradient(135deg,${A},#8b5cf6);color:#fff;border:none;border-radius:8px;
          padding:9px 18px;font-family:'Syne';font-size:12px;font-weight:800;cursor:pointer;
          box-shadow:0 0 16px ${A}28;transition:all 0.18s;white-space:nowrap;flex-shrink:0;}
        .btn-main:hover{transform:translateY(-1px);box-shadow:0 0 26px ${A}50;}

        .btn-act{flex:1;border:none;border-radius:7px;padding:8px 4px;font-family:'Syne';
          font-size:11px;font-weight:700;cursor:pointer;transition:all 0.18s;}
        .btn-act:disabled{opacity:0.22;cursor:not-allowed;}
        .btn-act:hover:not(:disabled){transform:translateY(-1px);}
        .b-pop  {background:${R}14;color:${R};border:1px solid ${R}28;}
        .b-ins  {background:${A}14;color:${A};border:1px solid ${A}28;}
        .b-del  {background:${R}14;color:${R};border:1px solid ${R}28;}
        .b-srch {background:${A2}14;color:${A2};border:1px solid ${A2}28;}
        .b-rev  {background:${A2}14;color:${A2};border:1px solid ${A2}28;}
        .b-sort {background:${G}14;color:${G};border:1px solid ${G}28;}
        .b-clr  {background:#64748b14;color:#64748b;border:1px solid #64748b28;}
        .b-pop:hover:not(:disabled)  {background:${R}22;}
        .b-ins:hover:not(:disabled)  {background:${A}22;}
        .b-del:hover:not(:disabled)  {background:${R}22;}
        .b-srch:hover:not(:disabled) {background:${A2}22;}
        .b-rev:hover:not(:disabled)  {background:${A2}22;}
        .b-sort:hover:not(:disabled) {background:${G}22;}
        .b-clr:hover:not(:disabled)  {background:#64748b22;}

        .arr-inp{flex:1;background:#030610;border:1px solid #1a0a35;border-radius:8px;
          padding:9px 12px;color:#e2e8f0;font-family:'JetBrains Mono';font-size:13px;
          outline:none;min-width:0;transition:border-color 0.2s,box-shadow 0.2s;}
        .arr-inp:focus{border-color:${A}55;box-shadow:0 0 0 3px ${A}12;}
        .arr-inp::placeholder{color:#1a0a35;}
        .idx-inp{width:72px;flex-shrink:0;background:#030610;border:1px solid #1a0a35;border-radius:8px;
          padding:9px 10px;color:#e2e8f0;font-family:'JetBrains Mono';font-size:13px;
          outline:none;transition:border-color 0.2s,box-shadow 0.2s;}
        .idx-inp:focus{border-color:${A}55;box-shadow:0 0 0 3px ${A}12;}
        .idx-inp::placeholder{color:#1a0a35;}
        .idx-inp::-webkit-inner-spin-button{-webkit-appearance:none;}
        .idx-inp[type=number]{-moz-appearance:textfield;}
      `}</style>

      <div className="shell">

        {/* ════ LEFT ════ */}
        <div className="col col-l">

          {/* header */}
          <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'10px', flexShrink:0 }}>
            <h1 style={{ fontFamily:'Syne', fontWeight:800, fontSize:'1.6rem', color:'#e2e8f0', letterSpacing:'-0.5px', lineHeight:1, margin:0 }}>Array</h1>
            <span style={{ fontFamily:'JetBrains Mono', fontSize:'10px', color:A, background:`${A}14`, border:`1px solid ${A}28`, borderRadius:'4px', padding:'2px 8px', letterSpacing:'0.5px' }}>
              contiguous memory
            </span>
            <span style={{ fontFamily:'JetBrains Mono', fontSize:'10px', color:'#1a0a35', marginLeft:'auto' }}>
              {arr.length}/{MAX}
            </span>
          </div>

          {/* array canvas */}
          <div className="arr-canvas">

            {/* empty */}
            {arr.length === 0 && (
              <div style={{ position:'absolute', inset:0, zIndex:2, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'10px', pointerEvents:'none' }}>
                <div style={{ width:'36px', height:'36px', border:'1px dashed #130a2e', borderRadius:'6px', display:'flex', alignItems:'center', justifyContent:'center', color:'#130a2e', fontSize:'14px' }}>[ ]</div>
                <p style={{ fontFamily:'JetBrains Mono', fontSize:'10px', color:'#130a2e', letterSpacing:'1px' }}>push a value to begin</p>
              </div>
            )}

            {/* CELLS — horizontally centered, vertically centered */}
            <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'16px 20px', position:'relative', zIndex:4, gap:0 }}>
              <AnimatePresence mode="popLayout" initial={false}>
                {arr.map((item, i) => {
                  const isHl = hl.has(i)
                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity:0, scaleY:0.3, y:-20 }}
                      animate={{
                        opacity:1, scaleY:1, y:0,
                        background: isHl ? `${hlCol}20` : '#070f1e',
                        borderColor: isHl ? hlCol : '#1a0a35',
                        boxShadow: isHl ? `0 0 14px ${hlCol}40` : 'none',
                      }}
                      exit={{ opacity:0, scaleY:0.3, y:20, transition:{ duration:0.2 } }}
                      transition={{ layout:{ type:'spring', stiffness:380, damping:30 }, default:{ type:'spring', stiffness:360, damping:24 } }}
                      style={{
                        width:'64px', height:'64px', flexShrink:0,
                        border:'1px solid #1a0a35',
                        borderRight: i < arr.length - 1 ? 'none' : undefined,
                        borderRadius: i === 0 ? '8px 0 0 8px' : i === arr.length - 1 ? '0 8px 8px 0' : '0',
                        display:'flex', flexDirection:'column',
                        alignItems:'center', justifyContent:'center',
                        position:'relative', overflow:'hidden',
                        cursor:'default',
                      }}
                    >
                      {/* top accent line */}
                      <div style={{ position:'absolute', top:0, left:0, right:0, height:'2px', background: isHl ? `linear-gradient(90deg,transparent,${hlCol},transparent)` : 'transparent', transition:'background 0.3s' }} />

                      {/* value */}
                      <span style={{ fontFamily:'JetBrains Mono', fontWeight:700, fontSize: item.val.length > 4 ? '10px' : '15px', color: isHl ? hlCol : '#2a1260', letterSpacing:'0.5px', lineHeight:1 }}>
                        {item.val}
                      </span>

                      {/* index label */}
                      <span style={{ fontFamily:'JetBrains Mono', fontSize:'8px', color:'#1a0a35', marginTop:'4px' }}>
                        [{i}]
                      </span>

                      {/* glow pulse */}
                      {isHl && (
                        <motion.div
                          initial={{ opacity:0.6 }} animate={{ opacity:0 }}
                          transition={{ duration:0.8, repeat:Infinity }}
                          style={{ position:'absolute', inset:0, border:`1px solid ${hlCol}`, pointerEvents:'none' }}
                        />
                      )}
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>

            {/* memory address strip at bottom */}
            {arr.length > 0 && (
              <div style={{ flexShrink:0, padding:'0 20px 10px', display:'flex', justifyContent:'center', gap:0, zIndex:4 }}>
                {arr.map((item, i) => (
                  <div key={item.id} style={{ width:'64px', textAlign:'center', flexShrink:0 }}>
                    <span style={{ fontFamily:'JetBrains Mono', fontSize:'7px', color:'#1a0a35', letterSpacing:'0.5px' }}>
                      0x{(i * 4).toString(16).padStart(3,'0').toUpperCase()}
                    </span>
                  </div>
                ))}
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
                  style={{ background:'#030610', border:`1px solid ${msgStyle[msg.type].b}`, borderRadius:'7px', padding:'5px 13px', fontFamily:'JetBrains Mono', fontSize:'11px', color:msgStyle[msg.type].c, height:'100%', display:'flex', alignItems:'center' }}>
                  {msg.text}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* input rows */}
          <div style={{ display:'flex', gap:'7px', marginBottom:'7px', flexShrink:0 }}>
            <input className="arr-inp" placeholder="value…" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter') handlePush() }} />
            <input className="idx-inp" type="number" placeholder="idx" value={idxInput} onChange={e=>setIdxInput(e.target.value)} />
            <button className="btn-main" onClick={handlePush}>Push</button>
          </div>

          <div style={{ display:'flex', gap:'7px', marginBottom:'7px', flexShrink:0 }}>
            <button className="btn-act b-pop"  onClick={handlePop}      disabled={!arr.length}>Pop</button>
            <button className="btn-act b-ins"  onClick={handleInsertAt} disabled={arr.length>=MAX}>Insert at</button>
            <button className="btn-act b-del"  onClick={handleDeleteAt} disabled={!arr.length}>Delete at</button>
            <button className="btn-act b-srch" onClick={handleLinearSearch} disabled={!arr.length || searching}>Search</button>
          </div>

          <div style={{ display:'flex', gap:'7px', flexShrink:0 }}>
            <button className="btn-act b-rev"  onClick={handleReverse}  disabled={arr.length < 2}>Reverse</button>
            <button className="btn-act b-sort" onClick={handleSort}     disabled={arr.length < 2}>Bubble Sort</button>
            <button className="btn-act b-clr"  onClick={handleClear}    disabled={!arr.length}>Clear</button>
          </div>
        </div>

        {/* ════ RIGHT ════ */}
        <div className="col col-r">
          <div style={{ marginBottom:'10px', flexShrink:0 }}>
            <h2 style={{ fontFamily:'Syne', fontWeight:800, fontSize:'1.6rem', color:'#e2e8f0', letterSpacing:'-0.5px', lineHeight:1, margin:0 }}>Info</h2>
            <p style={{ fontFamily:'JetBrains Mono', fontSize:'10px', color:'#1a0a35', marginTop:'4px' }}>contiguous memory  ·  O(1) access by index</p>
          </div>

          <div className="panel">

            <div className="card">
              <p className="clabel">Memory Model</p>
              <div style={{ display:'flex', gap:'6px', alignItems:'stretch' }}>
                {[
                  { lbl:'Access',   val:'O(1)',  col:A,  note:'by index' },
                  { lbl:'Contiguous',val:'fixed',col:A2, note:'memory' },
                  { lbl:'Cache',    val:'fast',  col:G,  note:'friendly' },
                ].map(({lbl,val,col,note})=>(
                  <div key={lbl} style={{ flex:1, background:'#030610', border:'1px solid #130a2e', borderRadius:'7px', padding:'8px 6px', textAlign:'center' }}>
                    <p style={{ fontFamily:'JetBrains Mono', fontSize:'8px', color:'#1a0a35', marginBottom:'3px' }}>{lbl}</p>
                    <p style={{ fontFamily:'JetBrains Mono', fontWeight:700, fontSize:'13px', color:col }}>{val}</p>
                    <p style={{ fontFamily:'JetBrains Mono', fontSize:'7px', color:'#1a0a35', marginTop:'2px' }}>{note}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <p className="clabel">Complexity</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'5px' }}>
                {[
                  { lbl:'Access by index', val:'O(1)', col:G  },
                  { lbl:'Search (linear)', val:'O(n)', col:Y  },
                  { lbl:'Insert at end',   val:'O(1)', col:A  },
                  { lbl:'Insert at idx',   val:'O(n)', col:R  },
                  { lbl:'Delete at end',   val:'O(1)', col:A  },
                  { lbl:'Delete at idx',   val:'O(n)', col:R  },
                ].map(({lbl,val,col})=>(
                  <div key={lbl} style={{ background:'#030610', border:'1px solid #130a2e', borderRadius:'6px', padding:'7px 9px' }}>
                    <p style={{ fontFamily:'JetBrains Mono', fontSize:'8px', color:'#1a0a35', marginBottom:'2px' }}>{lbl}</p>
                    <p style={{ fontFamily:'JetBrains Mono', fontWeight:700, fontSize:'13px', color:col }}>{val}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <p className="clabel">Array vs Linked List</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'5px' }}>
                {[
                  { lbl:'Array',         val:'O(1) access', col:A  },
                  { lbl:'Linked List',   val:'O(n) access', col:'#f472b6' },
                  { lbl:'Array insert',  val:'O(n) shift',  col:R  },
                  { lbl:'LL insert',     val:'O(1) ptr',    col:G  },
                ].map(({lbl,val,col})=>(
                  <div key={lbl} style={{ background:'#030610', border:'1px solid #130a2e', borderRadius:'6px', padding:'7px 9px' }}>
                    <p style={{ fontFamily:'JetBrains Mono', fontSize:'8px', color:'#1a0a35', marginBottom:'2px' }}>{lbl}</p>
                    <p style={{ fontFamily:'JetBrains Mono', fontWeight:700, fontSize:'12px', color:col }}>{val}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="card fill">
              <p className="clabel">Operations</p>
              <div className="olist">
                {[
                  { op:'arr[i]',       desc:'Direct access by index',     col:A  },
                  { op:'push(x)',      desc:'Append to end',              col:G  },
                  { op:'pop()',        desc:'Remove last element',        col:R  },
                  { op:'insert(i,x)',  desc:'Insert at index, shift right', col:A  },
                  { op:'delete(i)',    desc:'Remove at index, shift left', col:R  },
                  { op:'search(x)',    desc:'Linear scan for value',      col:A2 },
                ].map(({op,desc,col})=>(
                  <div key={op} className="orow">
                    <div>
                      <p style={{ fontFamily:'JetBrains Mono', fontWeight:700, fontSize:'11px', color:col, margin:0 }}>{op}</p>
                      <p style={{ fontFamily:'JetBrains Mono', fontSize:'9px', color:'#1a0a35', marginTop:'1px' }}>{desc}</p>
                    </div>
                    <span style={{ fontFamily:'JetBrains Mono', fontSize:'9px', color:A, background:`${A}10`, border:`1px solid ${A}22`, borderRadius:'4px', padding:'2px 6px', flexShrink:0 }}>
                      {op==='arr[i]'||op==='push(x)'||op==='pop()' ? 'O(1)' : op==='search(x)' ? 'O(n)' : 'O(n)'}
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