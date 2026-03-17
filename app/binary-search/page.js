
'use client'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '@/comps/navbar'

const DEFAULT_ARRAY = [2, 5, 8, 12, 16, 23, 38, 45, 56, 72]
const MAX_STEPS     = 30

// ── new colour theme: deep teal / emerald ─────────────────────────────────────
const T  = '#2dd4bf'   // teal     — LOW pointer
const E  = '#a3e635'   // lime     — MID pointer  
const O  = '#fb923c'   // orange   — HIGH pointer
const G  = '#34d399'   // emerald  — found
const R  = '#f87171'   // red      — not found
const S  = '#818cf8'   // indigo   — accent

export default function BinarySearchPage() {
  const [array,   setArray]   = useState(DEFAULT_ARRAY)
  const [target,  setTarget]  = useState('')
  const [low,     setLow]     = useState(0)
  const [high,    setHigh]    = useState(DEFAULT_ARRAY.length - 1)
  const [mid,     setMid]     = useState(-1)
  const [status,  setStatus]  = useState('idle')
  const [message, setMessage] = useState(null)
  const [history, setHistory] = useState([])
  const [editIdx, setEditIdx] = useState(null)
  const [editVal, setEditVal] = useState('')
  const timers   = useRef([])
  const stepsRef = useRef(0)
  const editRef  = useRef(null)

  useEffect(() => () => timers.current.forEach(clearTimeout), [])
  useEffect(() => { if (editIdx !== null && editRef.current) editRef.current.focus() }, [editIdx])

  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = [] }

  const showMsg = (text, type = 'info') => {
    clearTimers()
    setMessage({ text, type })
    timers.current.push(setTimeout(() => setMessage(null), 2800))
  }

  const resetSearch = (newArr) => {
    const arr = newArr ?? array
    clearTimers()
    setLow(0); setHigh(arr.length - 1); setMid(-1)
    setStatus('idle'); setHistory([])
    stepsRef.current = 0
  }

  // ── array editing ──────────────────────────────────────────────────────────
  const startEdit = (i) => {
    if (status !== 'idle') { showMsg('Reset before editing', 'info'); return }
    setEditIdx(i); setEditVal(String(array[i]))
  }

  const commitEdit = (i) => {
    const n = parseInt(editVal)
    if (!isNaN(n)) {
      const newArr = [...array]; newArr[i] = n
      newArr.sort((a, b) => a - b)
      setArray(newArr); resetSearch(newArr)
      showMsg('Updated & re-sorted', 'info')
    }
    setEditIdx(null); setEditVal('')
  }

  const cancelEdit = () => { setEditIdx(null); setEditVal('') }

  const addElement = () => {
    if (status !== 'idle') { showMsg('Reset before editing', 'info'); return }
    const newArr = [...array, 0].sort((a, b) => a - b)
    setArray(newArr); resetSearch(newArr)
    setEditIdx(newArr.indexOf(0)); setEditVal('0')
  }

  const removeElement = (i) => {
    if (status !== 'idle') { showMsg('Reset before editing', 'info'); return }
    if (array.length <= 3) { showMsg('Need at least 3 elements', 'info'); return }
    const newArr = array.filter((_, j) => j !== i)
    setArray(newArr); resetSearch(newArr)
  }

  // ── search ─────────────────────────────────────────────────────────────────
  const stepSearch = () => {
    if (status === 'found')    { showMsg('Found! Reset to search again.', 'info'); return }
    if (status === 'notfound') { showMsg('Not found. Reset or try another.', 'info'); return }
    const targetNum = parseInt(target)
    if (isNaN(targetNum) || !target.trim()) { showMsg('Enter a valid target number', 'error'); return }

    if (status === 'idle') {
      if (low > high) { setStatus('notfound'); showMsg(`${targetNum} not found`, 'error'); return }
      setStatus('searching')
      const m = Math.floor((low + high) / 2)
      setMid(m); setHistory([{ low, high, mid: m, val: array[m] }])
      stepsRef.current = 1
      if (array[m] === targetNum) {
        setStatus('found'); showMsg(`✦ Found ${targetNum} at index ${m}`, 'success')
      } else {
        showMsg(`arr[${m}] = ${array[m]}  →  ${array[m] < targetNum ? 'go right ▶' : '◀ go left'}`, 'info')
      }
      return
    }

    if (stepsRef.current >= MAX_STEPS) { resetSearch(); return }
    if (low > high) { setStatus('notfound'); showMsg(`${targetNum} not found`, 'error'); return }
    if (array[mid] === targetNum) { setStatus('found'); showMsg(`✦ Found at index ${mid}`, 'success'); return }

    let nL = low, nH = high
    if (array[mid] < targetNum) nL = mid + 1
    else                         nH = mid - 1

    if (nL > nH) {
      setLow(nL); setHigh(nH); setMid(-1)
      setStatus('notfound'); showMsg(`${targetNum} not found`, 'error'); return
    }

    const nM = Math.floor((nL + nH) / 2)
    setLow(nL); setHigh(nH); setMid(nM)
    setHistory(prev => [...prev, { low: nL, high: nH, mid: nM, val: array[nM] }])
    stepsRef.current++
    if (array[nM] === targetNum) {
      setStatus('found'); showMsg(`✦ Found ${targetNum} at index ${nM}`, 'success')
    } else {
      showMsg(`arr[${nM}] = ${array[nM]}  →  ${array[nM] < targetNum ? 'go right ▶' : '◀ go left'}`, 'info')
    }
  }

  const searchFull = () => {
    const targetNum = parseInt(target)
    if (isNaN(targetNum) || !target.trim()) { showMsg('Enter a valid target number', 'error'); return }
    let l = 0, h = array.length - 1, found = -1
    const hist = []
    while (l <= h) {
      const m = Math.floor((l + h) / 2)
      hist.push({ low: l, high: h, mid: m, val: array[m] })
      if      (array[m] === targetNum) { found = m; break }
      else if (array[m] < targetNum)   l = m + 1
      else                              h = m - 1
    }
    setHistory(hist); stepsRef.current = hist.length
    if (found !== -1) {
      setLow(found); setHigh(found); setMid(found); setStatus('found')
      showMsg(`✦ Found ${targetNum} at [${found}] — ${hist.length} steps`, 'success')
    } else {
      setLow(l); setHigh(h); setMid(-1); setStatus('notfound')
      showMsg(`${targetNum} not found — ${hist.length} steps`, 'error')
    }
  }

  const generateRandom = () => {
    const len = Math.floor(math.random() * 6) + 8
    const arr = Array.from({ length: len }, () => Math.floor(Math.random() * 90) + 5).sort((a,b)=>a-b)
    setArray(arr); setTarget(''); resetSearch(arr)
    showMsg('New sorted array generated', 'info')
  }

  // pointer map
  const ptrs = {}
  const addPtr = (i, lbl, col) => { if (i >= 0 && i < array.length) ptrs[i] = [...(ptrs[i]||[]), { lbl, col }] }
  if (status !== 'idle') { addPtr(low, 'LOW', T); addPtr(high, 'HIGH', O) }
  if (mid >= 0)           addPtr(mid, 'MID', E)

  const msgStyle = {
    success: { c: G, b: `${G}35` },
    error:   { c: R, b: `${R}35` },
    info:    { c: '#475569', b: '#47556925' },
  }

  return (
    <>
      <Navbar />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');
        html,body{margin:0;padding:0;overflow:hidden;height:100%;}
        *,*::before,*::after{box-sizing:border-box;}

        .shell {
          height: calc(100vh - 52px);
          background: #020c10;
          display: flex;
          flex-direction: column;   /* ← top/bottom layout */
          overflow: hidden;
          position: relative;
        }

        /* teal ambient top-left */
        .shell::before {
          content:'';position:absolute;top:-60px;left:-40px;
          width:500px;height:380px;pointer-events:none;z-index:0;
          background:radial-gradient(ellipse,${T}09 0%,transparent 65%);
        }
        /* lime ambient bottom-right */
        .shell::after {
          content:'';position:absolute;bottom:-40px;right:-40px;
          width:420px;height:320px;pointer-events:none;z-index:0;
          background:radial-gradient(ellipse,${E}07 0%,transparent 65%);
        }

        /* ── TOP ROW: full width, exactly 50% height ── */
        .top-row {
          position:relative;z-index:1;
          width:100%;
          height:50%;          /* exactly half the page */
          flex-shrink:0;
          display:flex;
          flex-direction:column;
          padding:14px 22px 0;
          gap:8px;
          overflow:hidden;
        }

        /* array canvas fills the top row */
        .array-canvas {
          flex:1;min-height:0;
          background:#030f14;
          border:1px solid #0a2030;
          border-radius:18px;
          position:relative;overflow:hidden;
          display:flex;
          flex-direction:column;
          align-items:center;
          justify-content:center;
          padding:24px 20px 20px;
        }
        /* subtle teal dot grid */
        .array-canvas::before {
          content:'';position:absolute;inset:0;pointer-events:none;
          background-image:radial-gradient(circle,${T}0c 1px,transparent 1px);
          background-size:24px 24px;border-radius:18px;
        }

        /* cells */
        .cells-wrap {
          display:flex;flex-wrap:wrap;gap:12px;
          justify-content:center;align-items:flex-end;
          position:relative;z-index:2;padding-top:30px;
        }

        .cell-outer { position:relative;display:flex;flex-direction:column;align-items:center; }

        .ptr-stack {
          position:absolute;bottom:calc(100% + 5px);left:50%;transform:translateX(-50%);
          display:flex;flex-direction:column;align-items:center;gap:3px;
          pointer-events:none;z-index:10;
        }
        .ptr-pill {
          font-family:'Syne';font-weight:800;font-size:7px;
          padding:2px 8px;border-radius:10px;
          border:1px solid currentColor;white-space:nowrap;
          background:#020c10;letter-spacing:1.5px;
        }

        .cell {
          width:64px;height:64px;border-radius:14px;
          display:flex;flex-direction:column;
          align-items:center;justify-content:center;
          position:relative;overflow:hidden;
          cursor:pointer;transition:transform 0.15s;
          user-select:none;
        }
        .cell:hover{transform:translateY(-2px);}

        .cell-edit-inp {
          width:100%;height:100%;background:transparent;border:none;outline:none;
          text-align:center;font-family:'JetBrains Mono';font-weight:700;font-size:18px;
          color:white;padding:0;
        }
        .cell-edit-inp::-webkit-inner-spin-button{-webkit-appearance:none;}
        .cell-edit-inp[type=number]{-moz-appearance:textfield;}

        .del-x {
          position:absolute;top:3px;right:4px;
          width:14px;height:14px;border-radius:50%;
          background:${R}20;border:1px solid ${R}50;
          display:flex;align-items:center;justify-content:center;
          cursor:pointer;font-size:8px;color:${R};
          opacity:0;transition:opacity 0.15s;
        }
        .cell-outer:hover .del-x{opacity:1;}

        .add-cell {
          width:64px;height:64px;border-radius:14px;
          border:1px dashed #0a2030;
          display:flex;align-items:center;justify-content:center;
          cursor:pointer;font-size:24px;color:#0a2030;
          transition:all 0.2s;background:transparent;
        }
        .add-cell:hover{border-color:${T}60;color:${T};transform:translateY(-2px);}

        /* ── BOTTOM ROW: full width, remaining 50% ── */
        .bottom-row {
          position:relative;z-index:1;
          flex:1;min-height:0;
          display:flex;
          padding:8px 22px 14px;
          gap:12px;
          overflow:hidden;
        }

        /* each info card column */
        .info-col {
          display:flex;flex-direction:column;gap:8px;
          overflow:hidden;
        }
        .col-controls { width:280px;flex-shrink:0; }
        .col-history  { width:240px;flex-shrink:0; }
        .col-algo     { flex:1;min-width:0; }
        .col-complex  { width:200px;flex-shrink:0; }

        .card {
          background:#030f14;border:1px solid #0a2030;
          border-radius:12px;padding:10px 13px;flex-shrink:0;
        }
        .card.fill{flex:1;min-height:0;display:flex;flex-direction:column;}
        .clabel {
          font-family:'Syne';font-weight:700;font-size:9px;
          color:#0f3040;letter-spacing:2px;text-transform:uppercase;
          margin-bottom:7px;flex-shrink:0;
        }
        .olist{flex:1;min-height:0;display:flex;flex-direction:column;}
        .orow{
          flex:1;min-height:0;display:flex;align-items:center;
          padding:0 9px;border-radius:6px;
          background:#020c10;border:1px solid #0a2030;
          margin-bottom:4px;transition:border-color 0.2s;
        }
        .orow:last-child{margin-bottom:0;}
        .orow:hover{border-color:#0f2a3a;}

        /* buttons */
        .btn{border:none;border-radius:8px;padding:9px 14px;font-family:'Syne';font-size:11px;font-weight:700;cursor:pointer;transition:all 0.18s;letter-spacing:0.3px;}
        .btn:disabled{opacity:0.22;cursor:not-allowed;}
        .btn:hover:not(:disabled){transform:translateY(-1px);}

        .b-step { background:${E}15; color:${E}; border:1px solid ${E}35; }
        .b-full { background:${T}15; color:${T}; border:1px solid ${T}35; }
        .b-rst  { background:#47556915; color:#64748b; border:1px solid #47556928; }
        .b-rand { background:${O}15; color:${O}; border:1px solid ${O}35; }
        .b-step:hover:not(:disabled){background:${E}25;}
        .b-full:hover:not(:disabled){background:${T}25;}
        .b-rand:hover:not(:disabled){background:${O}25;}

        .tgt-inp {
          flex:1;background:#020c10;border:1px solid #0a2030;
          border-radius:8px;padding:9px 13px;color:#e2e8f0;
          font-family:'JetBrains Mono';font-size:14px;font-weight:700;
          outline:none;min-width:0;
          transition:border-color 0.2s,box-shadow 0.2s;
        }
        .tgt-inp:focus{border-color:${T}55;box-shadow:0 0 0 3px ${T}12;}
        .tgt-inp::placeholder{color:#0f3040;}
        .tgt-inp::-webkit-inner-spin-button{-webkit-appearance:none;}
        .tgt-inp[type=number]{-moz-appearance:textfield;}
      `}</style>

      <div className="shell">

        {/* ════════════════════════════════════════════
            TOP ROW — full width, 50% height
            Array canvas + header + controls
            ════════════════════════════════════════════ */}
        <div className="top-row">

          {/* header strip */}
          <div style={{ display:'flex', alignItems:'center', gap:'10px', flexShrink:0 }}>
            <h1 style={{ fontFamily:'Syne', fontWeight:800, fontSize:'1.5rem', color:'#e2e8f0', letterSpacing:'-0.5px', lineHeight:1, margin:0 }}>
              Binary Search
            </h1>
            <span style={{ fontFamily:'JetBrains Mono', fontSize:'10px', color:T, background:`${T}14`, border:`1px solid ${T}28`, borderRadius:'4px', padding:'2px 8px' }}>
              O(log n)
            </span>
            {/* pointer legend */}
            <div style={{ display:'flex', gap:'8px', marginLeft:'12px' }}>
              {[{ lbl:'LOW', col:T }, { lbl:'MID', col:E }, { lbl:'HIGH', col:O }].map(({ lbl, col }) => (
                <span key={lbl} style={{ fontFamily:'JetBrains Mono', fontSize:'9px', color:col, background:`${col}14`, border:`1px solid ${col}28`, borderRadius:'8px', padding:'2px 8px', letterSpacing:'1px' }}>
                  {lbl}
                </span>
              ))}
            </div>
            <span style={{ fontFamily:'JetBrains Mono', fontSize:'9px', color:'#0f3040', marginLeft:'8px' }}>
              click cell to edit  ·  click + to add  ·  hover × to remove
            </span>
            <span style={{ fontFamily:'JetBrains Mono', fontSize:'10px', color:'#0f3040', marginLeft:'auto' }}>
              step {stepsRef.current}  ·  n = {array.length}
            </span>
          </div>

          {/* THE ARRAY CANVAS */}
          <div className="array-canvas">

            {/* sorted strip bottom */}
            <div style={{ position:'absolute', bottom:'10px', left:'14px', right:'14px', zIndex:5, display:'flex', gap:'4px', alignItems:'center', background:'#020c10', border:'1px solid #0a2030', borderRadius:'8px', padding:'5px 10px', flexWrap:'wrap' }}>
              <span style={{ fontFamily:'JetBrains Mono', fontSize:'7px', color:'#0f3040', letterSpacing:'2px', marginRight:'4px' }}>SORTED</span>
              {array.map((v, i) => {
                const eliminated = status !== 'idle' && (i < low || i > high) && status !== 'found'
                return (
                  <span key={i} style={{ fontFamily:'JetBrains Mono', fontSize:'10px', color: status === 'found' && i === mid ? G : eliminated ? '#0f2030' : '#1a4050', transition:'color 0.3s' }}>
                    {v}{i < array.length - 1 ? <span style={{ color:'#0a1820' }}>,</span> : ''}
                  </span>
                )
              })}
            </div>

            {/* cells */}
            <div className="cells-wrap">
              {array.map((value, i) => {
                const isEditing = editIdx === i
                const cellPtrs  = ptrs[i] ?? []
                const isFound   = status === 'found' && mid === i
                const isMid     = mid === i && !isFound
                const isLow     = low === i && status !== 'idle'
                const isHigh    = high === i && status !== 'idle'
                const inRange   = status !== 'idle' && i >= low && i <= high
                const eliminated= status !== 'idle' && !inRange && status !== 'found'

                let border = '#0a2030', bg = '#030f14', valCol = '#0f3040', glow = 'none'
                if (isFound)          { border = G;  bg = `${G}18`;  valCol = G;  glow = `0 0 22px ${G}55` }
                else if (isMid)       { border = E;  bg = `${E}16`;  valCol = E;  glow = `0 0 16px ${E}50` }
                else if (isLow && isHigh) { border = S; bg = `${S}15`; valCol = S }
                else if (isLow)       { border = T;  bg = `${T}13`;  valCol = T  }
                else if (isHigh)      { border = O;  bg = `${O}13`;  valCol = O  }
                else if (inRange)     { border = '#0f2a3a'; bg = '#040f18'; valCol = '#1a4050' }
                if (eliminated)       { border = '#050f14'; bg = '#020a0e'; valCol = '#0a1820'; glow = 'none' }

                return (
                  <div key={i} className="cell-outer">
                    {/* pointer labels */}
                    {cellPtrs.length > 0 && (
                      <div className="ptr-stack">
                        {cellPtrs.map(({ lbl, col }) => (
                          <motion.span key={lbl} className="ptr-pill"
                            initial={{ opacity:0, y:-4 }} animate={{ opacity:1, y:0 }}
                            style={{ color:col, borderColor:col }}>
                            {lbl}
                          </motion.span>
                        ))}
                      </div>
                    )}

                    {/* delete */}
                    {status === 'idle' && !isEditing && (
                      <div className="del-x" onClick={e => { e.stopPropagation(); removeElement(i) }}>×</div>
                    )}

                    {/* cell body */}
                    <motion.div className="cell"
                      animate={{ borderColor:border, background:bg, boxShadow:glow }}
                      transition={{ duration:0.22 }}
                      style={{ border:`1px solid ${border}` }}
                      onClick={() => !isEditing && startEdit(i)}
                    >
                      {/* shimmer on active */}
                      {(isMid || isFound) && (
                        <motion.div
                          animate={{ y:['-100%','220%'] }}
                          transition={{ duration:1.1, repeat:Infinity, ease:'linear' }}
                          style={{ position:'absolute', left:0, right:0, height:'35%', background:`linear-gradient(to bottom,transparent,${isFound?G:E}55,transparent)`, pointerEvents:'none' }}
                        />
                      )}

                      {isEditing ? (
                        <input ref={editRef} className="cell-edit-inp" type="number"
                          value={editVal}
                          onChange={e => setEditVal(e.target.value)}
                          onBlur={() => commitEdit(i)}
                          onKeyDown={e => { if(e.key==='Enter') commitEdit(i); if(e.key==='Escape') cancelEdit() }}
                          onClick={e => e.stopPropagation()}
                        />
                      ) : (
                        <>
                          <span style={{ fontFamily:'JetBrains Mono', fontWeight:700, fontSize: value >= 100 ? '13px' : '18px', color:valCol, lineHeight:1, transition:'color 0.22s' }}>
                            {value}
                          </span>
                          <span style={{ fontFamily:'JetBrains Mono', fontSize:'8px', color:'#0a1820', marginTop:'4px' }}>
                            [{i}]
                          </span>
                        </>
                      )}
                    </motion.div>
                  </div>
                )
              })}

              {/* + add */}
              {status === 'idle' && (
                <div className="add-cell" onClick={addElement} title="Add element">+</div>
              )}
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════
            BOTTOM ROW — full width, remaining 50%
            4 info columns side by side
            ════════════════════════════════════════════ */}
        <div className="bottom-row">

          {/* ── COL 1: Controls ── */}
          <div className="info-col col-controls">

            {/* message */}
            <div style={{ height:'30px', flexShrink:0 }}>
              <AnimatePresence mode="wait">
                {message && (
                  <motion.div key={message.text}
                    initial={{opacity:0,y:3}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-3}}
                    transition={{duration:0.15}}
                    style={{ background:'#030f14', border:`1px solid ${msgStyle[message.type].b}`, borderRadius:'8px', padding:'5px 13px', fontFamily:'JetBrains Mono', fontSize:'11px', color:msgStyle[message.type].c, height:'100%', display:'flex', alignItems:'center' }}>
                    {message.text}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* target input */}
            <div style={{ display:'flex', gap:'7px', flexShrink:0 }}>
              <input className="tgt-inp" type="number" placeholder="target…" value={target}
                onChange={e => setTarget(e.target.value)}
                onKeyDown={e => e.key==='Enter' && stepSearch()} />
              <button className="btn b-step" onClick={stepSearch} disabled={status==='found'||status==='notfound'} style={{ flexShrink:0 }}>
                ⏭ Step
              </button>
            </div>

            {/* action buttons */}
            <div style={{ display:'flex', gap:'7px', flexShrink:0 }}>
              <button className="btn b-full" onClick={searchFull} disabled={!target.trim()}>⚡ Full</button>
              <button className="btn b-rst"  onClick={() => resetSearch()}>↺ Reset</button>
              <button className="btn b-rand" onClick={generateRandom}>⟳ Random</button>
            </div>

            {/* pointer legend card */}
            <div className="card" style={{ flex:1, minHeight:0 }}>
              <p className="clabel">Pointers</p>
              <div style={{ display:'flex', flexDirection:'column', gap:'7px' }}>
                {[
                  { lbl:'LOW',  col:T, desc:'left search boundary'  },
                  { lbl:'MID',  col:E, desc:'current pivot element' },
                  { lbl:'HIGH', col:O, desc:'right search boundary' },
                ].map(({ lbl, col, desc }) => (
                  <div key={lbl} style={{ display:'flex', alignItems:'center', gap:'8px', padding:'7px 10px', background:'#020c10', border:`1px solid ${col}22`, borderRadius:'8px' }}>
                    <span style={{ fontFamily:'Syne', fontWeight:800, fontSize:'9px', color:col, minWidth:'32px', letterSpacing:'1px' }}>{lbl}</span>
                    <span style={{ fontFamily:'JetBrains Mono', fontSize:'9px', color:'#1a4050' }}>{desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── COL 2: Step History ── */}
          <div className="info-col col-history">
            <div className="card fill">
              <p className="clabel">
                Step History
                <span style={{ color:T, marginLeft:'6px' }}>({history.length})</span>
              </p>
              {history.length === 0 ? (
                <p style={{ fontFamily:'JetBrains Mono', fontSize:'10px', color:'#0f3040', margin:0 }}>
                  No steps yet
                </p>
              ) : (
                <div style={{ flex:1, minHeight:0, overflowY:'auto', display:'flex', flexDirection:'column', gap:'3px' }}>
                  {history.map((h, i) => (
                    <div key={i} style={{ display:'flex', gap:'6px', alignItems:'center', padding:'4px 8px', background:'#020c10', border:'1px solid #0a2030', borderRadius:'6px', flexShrink:0 }}>
                      <span style={{ fontFamily:'JetBrains Mono', fontSize:'8px', color:'#0f3040', minWidth:'20px' }}>#{i+1}</span>
                      <span style={{ fontFamily:'JetBrains Mono', fontSize:'9px', color:T }}>L={h.low}</span>
                      <span style={{ fontFamily:'JetBrains Mono', fontSize:'9px', color:O }}>H={h.high}</span>
                      <span style={{ fontFamily:'JetBrains Mono', fontSize:'9px', color:E }}>M={h.mid}</span>
                      <span style={{ fontFamily:'JetBrains Mono', fontSize:'9px', color:'#1a4050', marginLeft:'auto' }}>[{h.val}]</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── COL 3: Algorithm ── */}
          <div className="info-col col-algo">
            <div className="card fill">
              <p className="clabel">Algorithm</p>
              <div className="olist">
                {[
                  { n:1, s:'Set  low = 0,  high = n − 1',         col:T },
                  { n:2, s:'mid = ⌊(low + high) / 2⌋',           col:E },
                  { n:3, s:'arr[mid] == target  →  ✦ found',       col:G },
                  { n:4, s:'arr[mid] < target   →  low = mid + 1', col:T },
                  { n:5, s:'arr[mid] > target   →  high = mid − 1',col:O },
                  { n:6, s:'low > high  →  not found',             col:R },
                ].map(({ n, s, col }) => (
                  <div key={n} className="orow">
                    <span style={{ fontFamily:'JetBrains Mono', fontSize:'9px', color:col, background:`${col}14`, border:`1px solid ${col}28`, borderRadius:'50%', width:'18px', height:'18px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginRight:'9px' }}>{n}</span>
                    <span style={{ fontFamily:'JetBrains Mono', fontSize:'10px', color:'#1a4050' }}>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── COL 4: Complexity ── */}
          <div className="info-col col-complex">
            <div className="card fill">
              <p className="clabel">Complexity</p>
              <div style={{ flex:1, display:'flex', flexDirection:'column', gap:'7px' }}>
                {[
                  { lbl:'Time (average)', val:'O(log n)', col:G  },
                  { lbl:'Time (worst)',   val:'O(log n)', col:G  },
                  { lbl:'Time (best)',    val:'O(1)',     col:T  },
                  { lbl:'Space',         val:'O(1)',     col:E  },
                  { lbl:'Precondition',  val:'Sorted ↑', col:O  },
                  { lbl:'Type',          val:'Iterative',col:S  },
                ].map(({ lbl, val, col }) => (
                  <div key={lbl} style={{ flex:1, background:'#020c10', border:'1px solid #0a2030', borderRadius:'8px', padding:'6px 10px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontFamily:'JetBrains Mono', fontSize:'9px', color:'#0f3040' }}>{lbl}</span>
                    <span style={{ fontFamily:'JetBrains Mono', fontWeight:700, fontSize:'12px', color:col }}>{val}</span>
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