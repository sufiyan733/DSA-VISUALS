'use client'
import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '@/comps/navbar'

const MAX_SIZE = 8

const STACK_COLORS = [
  { bg: '#0ea5e9', border: '#0ea5e960' },
  { bg: '#8b5cf6', border: '#8b5cf660' },
  { bg: '#ec4899', border: '#ec489960' },
  { bg: '#f59e0b', border: '#f59e0b60' },
  { bg: '#10b981', border: '#10b98160' },
  { bg: '#ef4444', border: '#ef444460' },
  { bg: '#06b6d4', border: '#06b6d460' },
  { bg: '#f97316', border: '#f9731660' },
]

export default function StackPage() {
  const [stack, setStack]       = useState([])
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

  const handlePush = () => {
    const val = inputVal.trim()
    if (!val) { showMessage('Enter a value to push', 'error'); return }
    if (stack.length >= MAX_SIZE) { showMessage('Stack Overflow!', 'error'); return }
    const color = STACK_COLORS[colorIndex.current % STACK_COLORS.length]
    colorIndex.current++
    setStack(prev => [...prev, { id: Date.now(), value: val, color }])
    setInputVal('')
    showMessage(`Pushed "${val}"`, 'success')
  }

  const handlePop = () => {
    if (!stack.length) { showMessage('Stack Underflow!', 'error'); return }
    const top = stack[stack.length - 1]
    setStack(prev => prev.slice(0, -1))
    showMessage(`Popped "${top.value}"`, 'pop')
  }

  const handlePeek = () => {
    if (!stack.length) { showMessage('Stack is empty', 'error'); return }
    setPeeking(true)
    showMessage(`Top = "${stack[stack.length - 1].value}"`, 'peek')
    setTimeout(() => setPeeking(false), 1800)
  }

  const handleClear = () => { setStack([]); showMessage('Cleared', 'info') }
  const handleKeyDown = (e) => { if (e.key === 'Enter') handlePush() }

  const msgStyles = {
    success: { color: '#10b981', border: '#10b98130' },
    error:   { color: '#ef4444', border: '#ef444430' },
    pop:     { color: '#f59e0b', border: '#f59e0b30' },
    peek:    { color: '#8b5cf6', border: '#8b5cf630' },
    info:    { color: '#94a3b8', border: '#94a3b820' },
  }

  return (
    <>
      <Navbar />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;700&display=swap');
        html, body { margin:0; padding:0; overflow:hidden; height:100%; box-sizing:border-box; }
        *, *::before, *::after { box-sizing:border-box; }

        /* full page below navbar */
        .shell {
          height: calc(100vh - 52px);
          background: #05070f;
          display: flex;
          overflow: hidden;
          position: relative;
        }

        /* ambient blobs */
        .shell::before {
          content:''; position:absolute; top:-120px; left:-120px;
          width:400px; height:400px; pointer-events:none; z-index:0;
          background: radial-gradient(circle, #0ea5e90b 0%, transparent 70%);
        }
        .shell::after {
          content:''; position:absolute; bottom:-120px; right:-80px;
          width:380px; height:380px; pointer-events:none; z-index:0;
          background: radial-gradient(circle, #8b5cf90b 0%, transparent 70%);
        }

        /* ── exact 50 / 50 columns ── */
        .left-half, .right-half {
          position: relative; z-index: 1;
          width: 50%;
          height: 100%;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .left-half  { padding: 20px 16px 20px 28px; border-right: 1px solid #0d1421; }
        .right-half { padding: 20px 28px 20px 16px; }

        /* ── stack box fills all available height in left col ── */
        .stack-box {
          flex: 1; min-height: 0;
          background: #080b14;
          border: 2px solid #131b2e;
          border-radius: 18px;
          overflow: hidden;
          position: relative;
          display: flex;
          flex-direction: column;
        }

        /* equal flex slots */
        .slot {
          flex: 1; min-height: 0;
          position: relative;
          border-bottom: 1px solid #0d1421;
        }
        .slot:last-child { border-bottom: none; }

        /* right col: cards stacked to fill height */
        .right-inner {
          flex: 1; min-height: 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .card {
          background: #0a0e1a;
          border: 1px solid #131b2e;
          border-radius: 12px;
          padding: 12px 14px;
          flex-shrink: 0;
        }

        /* ops card gets remaining space */
        .card.ops {
          flex: 1; min-height: 0;
          display: flex; flex-direction: column;
        }

        .card-label {
          font-family: 'Syne'; font-weight: 700; font-size: 9px;
          color: #1e2d45; letter-spacing: 2.5px; text-transform: uppercase;
          margin-bottom: 8px; flex-shrink: 0;
        }

        /* ops list fills the card */
        .ops-list {
          flex: 1; min-height: 0;
          display: flex; flex-direction: column;
          gap: 0;
        }

        .op-row {
          flex: 1; min-height: 0;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 10px;
          border-radius: 6px;
          background: #0d1117;
          border: 1px solid #131b2e;
          margin-bottom: 5px;
          transition: border-color 0.2s;
        }
        .op-row:last-child { margin-bottom: 0; }
        .op-row:hover { border-color: #1e2d45; }

        /* buttons */
        .push-btn {
          background: linear-gradient(135deg, #0ea5e9, #3b82f6);
          color: white; border: none; border-radius: 8px;
          padding: 9px 18px; font-family: 'Syne';
          font-size: 12px; font-weight: 700; cursor: pointer;
          box-shadow: 0 0 16px #0ea5e928;
          transition: all 0.2s; white-space: nowrap; flex-shrink: 0;
        }
        .push-btn:hover { transform: translateY(-1px); box-shadow: 0 0 24px #0ea5e948; }

        .act-btn {
          flex: 1; border: none; border-radius: 8px;
          padding: 9px 4px; font-family: 'Syne';
          font-size: 11px; font-weight: 700; cursor: pointer;
          transition: all 0.2s;
        }
        .act-btn:disabled { opacity: 0.28; cursor: not-allowed; }
        .act-btn:hover:not(:disabled) { transform: translateY(-1px); }
        .pop-btn   { background:#ef444415; color:#ef4444; border:1px solid #ef444430; }
        .peek-btn  { background:#8b5cf615; color:#8b5cf6; border:1px solid #8b5cf630; }
        .clear-btn { background:#94a3b810; color:#94a3b8; border:1px solid #94a3b820; }
        .pop-btn:hover:not(:disabled)   { background:#ef444425; }
        .peek-btn:hover:not(:disabled)  { background:#8b5cf625; }
        .clear-btn:hover:not(:disabled) { background:#94a3b820; }

        .s-input {
          flex:1; background:#0d1117; border:1px solid #1e2736;
          border-radius:8px; padding:9px 12px; color:white;
          font-family:'JetBrains Mono'; font-size:13px;
          outline:none; min-width:0;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .s-input:focus { border-color:#0ea5e960; box-shadow:0 0 0 3px #0ea5e914; }
        .s-input::placeholder { color:#1e2d45; }
      `}</style>

      <div className="shell">

        {/* ══════════ LEFT 50% — Stack visual ══════════ */}
        <div className="left-half">

          {/* header row */}
          <div style={{ display:'flex', alignItems:'baseline', gap:'10px', marginBottom:'10px', flexShrink:0 }}>
            <h1 style={{ fontFamily:'Syne', fontWeight:800, fontSize:'1.7rem', color:'white', letterSpacing:'-0.5px', lineHeight:1 }}>
              Stack
            </h1>
            <span style={{ fontFamily:'JetBrains Mono', fontSize:'10px', color:'#0ea5e9', background:'#0ea5e915', border:'1px solid #0ea5e930', borderRadius:'4px', padding:'2px 8px', letterSpacing:'1px' }}>
              LIFO
            </span>
            {stack.length > 0 && (
              <motion.span initial={{opacity:0}} animate={{opacity:1}}
                style={{ fontFamily:'JetBrains Mono', fontSize:'10px', color:'#0ea5e9', background:'#0ea5e915', border:'1px solid #0ea5e930', borderRadius:'4px', padding:'2px 8px' }}>
                {stack.length}/{MAX_SIZE}
              </motion.span>
            )}
          </div>

          {/* TOP label */}
          <div style={{ fontFamily:'JetBrains Mono', fontSize:'9px', color: stack.length > 0 ? '#0ea5e9' : '#1e2d45', letterSpacing:'2px', textTransform:'uppercase', marginBottom:'6px', flexShrink:0, transition:'color 0.3s' }}>
            ↑ TOP — push &amp; pop here
          </div>

          {/* THE BOX */}
          <div className="stack-box">

            {/* size top-right */}
            <div style={{ position:'absolute', top:'8px', right:'10px', zIndex:10, fontFamily:'JetBrains Mono', fontSize:'9px', color: stack.length >= MAX_SIZE ? '#ef4444' : '#131b2e', letterSpacing:'1px' }}>
              {stack.length}/{MAX_SIZE}
            </div>

            {/* empty state */}
            {stack.length === 0 && (
              <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'8px', zIndex:1 }}>
                <div style={{ width:'36px', height:'36px', borderRadius:'8px', border:'1px dashed #1a2a40', display:'flex', alignItems:'center', justifyContent:'center', color:'#1a2a40', fontSize:'14px' }}>∅</div>
                <p style={{ color:'#1a2a40', fontFamily:'JetBrains Mono', fontSize:'9px', letterSpacing:'1px' }}>empty stack</p>
              </div>
            )}

            {/* slots — fill from bottom */}
            {Array.from({ length: MAX_SIZE }).map((_, slotIndex) => {
              const stackIndex = MAX_SIZE - 1 - slotIndex
              const item       = stack[stackIndex]
              const isFilled   = item !== undefined
              const isTop      = isFilled && stackIndex === stack.length - 1
              const isBase     = isFilled && stackIndex === 0
              const isPeek     = peeking && isTop

              return (
                <div key={slotIndex} className="slot">
                  <AnimatePresence>
                    {isFilled && (
                      <motion.div
                        key={item.id}
                        initial={{ opacity:0, scaleY:0.3 }}
                        animate={{
                          opacity:1, scaleY:1,
                          background: isPeek
                            ? `linear-gradient(90deg,${item.color.bg}45,${item.color.bg}18)`
                            : isTop
                            ? `linear-gradient(90deg,${item.color.bg}28,${item.color.bg}08)`
                            : `linear-gradient(90deg,${item.color.bg}12,transparent)`,
                        }}
                        exit={{ opacity:0, scaleY:0.3, transition:{duration:0.15} }}
                        transition={{ type:'spring', stiffness:420, damping:32 }}
                        style={{
                          position:'absolute', inset:0,
                          display:'flex', alignItems:'center', overflow:'hidden',
                          borderLeft:`4px solid ${isTop ? item.color.bg : item.color.border}`,
                        }}
                      >
                        {/* glow */}
                        {isTop && <div style={{ position:'absolute', left:0, top:0, bottom:0, width:'60px', background:`linear-gradient(90deg,${item.color.bg}20,transparent)`, pointerEvents:'none' }} />}

                        {/* index */}
                        <span style={{ fontFamily:'JetBrains Mono', fontSize:'9px', color:'#1e2d45', minWidth:'34px', paddingLeft:'10px', flexShrink:0 }}>
                          [{stackIndex}]
                        </span>

                        {/* dot */}
                        <div style={{ width:'5px', height:'5px', borderRadius:'50%', backgroundColor:item.color.bg, flexShrink:0, marginRight:'8px', boxShadow: isTop ? `0 0 6px ${item.color.bg}` : 'none' }} />

                        {/* value */}
                        <span style={{ fontFamily:'JetBrains Mono', fontWeight:700, fontSize:'15px', color: isTop ? item.color.bg : '#253347', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                          {item.value}
                        </span>

                        {/* badges */}
                        <div style={{ display:'flex', gap:'4px', paddingRight:'10px', flexShrink:0 }}>
                          {isTop && (
                            <motion.span initial={{opacity:0,scale:0.6}} animate={{opacity:1,scale:1}}
                              style={{ background:item.color.bg, color:'#000', fontSize:'7px', fontWeight:800, fontFamily:'Syne', padding:'2px 6px', borderRadius:'3px', letterSpacing:'1px' }}>
                              TOP
                            </motion.span>
                          )}
                          {isBase && stack.length > 1 && (
                            <span style={{ background:'#0d1421', color:'#253347', fontSize:'7px', fontWeight:700, fontFamily:'Syne', padding:'2px 6px', borderRadius:'3px', border:'1px solid #1a2535', letterSpacing:'1px' }}>
                              BASE
                            </span>
                          )}
                        </div>

                        {/* peek pulse */}
                        {isPeek && (
                          <motion.div initial={{opacity:0.8}} animate={{opacity:0}} transition={{duration:0.9,repeat:Infinity}}
                            style={{ position:'absolute', inset:0, border:`2px solid ${item.color.bg}`, pointerEvents:'none' }} />
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* empty slot label */}
                  {!isFilled && (
                    <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', paddingLeft:'10px' }}>
                      <span style={{ fontFamily:'JetBrains Mono', fontSize:'9px', color:'#0d1421' }}>[{stackIndex}]</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* BASE label */}
          <div style={{ fontFamily:'JetBrains Mono', fontSize:'9px', color:'#1e2d45', letterSpacing:'2px', textTransform:'uppercase', marginTop:'6px', marginBottom:'10px', flexShrink:0 }}>
            ↓ BASE
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

          {/* input row */}
          <div style={{ display:'flex', gap:'8px', marginBottom:'8px', flexShrink:0 }}>
            <input className="s-input" type="text" value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown} placeholder="value..." maxLength={8} />
            <button className="push-btn" onClick={handlePush}>Push ↑</button>
          </div>

          {/* action row */}
          <div style={{ display:'flex', gap:'8px', flexShrink:0 }}>
            <button className="act-btn pop-btn"   onClick={handlePop}   disabled={!stack.length}>Pop ↓</button>
            <button className="act-btn peek-btn"  onClick={handlePeek}  disabled={!stack.length}>Peek</button>
            <button className="act-btn clear-btn" onClick={handleClear} disabled={!stack.length}>Clear</button>
          </div>
        </div>

        {/* ══════════ RIGHT 50% — Info ══════════ */}
        <div className="right-half">

          {/* right header */}
          <div style={{ marginBottom:'10px', flexShrink:0 }}>
            <h2 style={{ fontFamily:'Syne', fontWeight:800, fontSize:'1.7rem', color:'white', letterSpacing:'-0.5px', lineHeight:1 }}>
              Info
            </h2>
            <p style={{ fontFamily:'JetBrains Mono', fontSize:'10px', color:'#1e2d45', marginTop:'4px', letterSpacing:'0.5px' }}>
              Last In · First Out · all ops O(1)
            </p>
          </div>

          <div className="right-inner">

            {/* Complexity — compact row */}
            <div className="card">
              <p className="card-label">Complexity</p>
              <div style={{ display:'flex', gap:'8px' }}>
                {[
                  { label:'Time',   value:'O(1)', color:'#0ea5e9' },
                  { label:'Space',  value:'O(n)', color:'#8b5cf6' },
                  { label:'Stable', value:'Yes',  color:'#10b981' },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ flex:1, background:'#0d1117', border:'1px solid #131b2e', borderRadius:'8px', padding:'8px', textAlign:'center' }}>
                    <p style={{ fontFamily:'JetBrains Mono', fontSize:'8px', color:'#1e2d45', marginBottom:'3px', letterSpacing:'1px' }}>{label.toUpperCase()}</p>
                    <p style={{ fontFamily:'JetBrains Mono', fontWeight:700, fontSize:'16px', color }}>{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Operations — flex grows to fill remaining space */}
            <div className="card ops">
              <p className="card-label">Operations</p>
              <div className="ops-list">
                {[
                  { op:'push(x)',    desc:'Add to top',        color:'#0ea5e9' },
                  { op:'pop()',      desc:'Remove from top',   color:'#ef4444' },
                  { op:'peek()',     desc:'Read top element',  color:'#8b5cf6' },
                  { op:'isEmpty()', desc:'Check if empty',    color:'#10b981' },
                  { op:'size()',     desc:'Number of elements',color:'#f59e0b' },
                ].map(({ op, desc, color }) => (
                  <div key={op} className="op-row">
                    <div>
                      <p style={{ fontFamily:'JetBrains Mono', fontSize:'12px', color, fontWeight:700 }}>{op}</p>
                      <p style={{ fontFamily:'JetBrains Mono', fontSize:'9px', color:'#1e2d45', marginTop:'1px' }}>{desc}</p>
                    </div>
                    <span style={{ fontFamily:'JetBrains Mono', fontSize:'9px', color:'#10b981', background:'#10b98112', border:'1px solid #10b98125', borderRadius:'4px', padding:'2px 6px', flexShrink:0 }}>
                      O(1)
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Real world uses — compact, no scrolling */}
            <div className="card">
              <p className="card-label">Real World Uses</p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                {[
                  { icon:'↩', text:'Undo/Redo'       },
                  { icon:'⬅', text:'Browser back'    },
                  { icon:'ƒ',  text:'Call stack'      },
                  { icon:'{}', text:'Bracket check'  },
                  { icon:'↺', text:'Backtracking'    },
                ].map(({ icon, text }) => (
                  <div key={text} style={{ display:'flex', alignItems:'center', gap:'5px', background:'#0d1117', border:'1px solid #131b2e', borderRadius:'6px', padding:'5px 9px' }}>
                    <span style={{ fontFamily:'JetBrains Mono', fontSize:'11px', color:'#1e2d45' }}>{icon}</span>
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
