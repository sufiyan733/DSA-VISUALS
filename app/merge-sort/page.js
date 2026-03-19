'use client'
import { useReducer, useEffect, useRef, useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '@/comps/navbar'
import { generateMergeSortSteps } from './ms'

// ── Theme tokens (matched to landing page) ────────────────────────────────────
const T = {
  bg:       '#04040f',       // landing: body background
  surface:  'rgba(4,4,20,0.72)',
  border:   'rgba(255,255,255,0.07)',
  borderHi: 'rgba(255,255,255,0.11)',
  violet:   '#818cf8',       // landing: ds accent
  violetHi: '#a78bfa',
  violet2:  '#4f46e5',       // landing: glow-btn base
  cyan:     '#22d3ee',       // landing: algo accent
  green:    '#10b981',
  red:      '#f87171',
  amber:    '#fbbf24',
  textPri:  '#f1f5f9',
  textSec:  '#94a3b8',
  textDim:  '#475569',
  font:     "'DM Sans', sans-serif",
  mono:     "'Space Mono', monospace",
}

// ── Bar state palette ─────────────────────────────────────────────────────────
const BS = {
  sorted:    { border:`${T.green}70`,    bg:`${T.green}15`,    glow:`0 0 10px ${T.green}45`    },
  comparing: { border:`${T.cyan}80`,     bg:`${T.cyan}18`,     glow:`0 0 16px ${T.cyan}60`     },
  placing:   { border:`${T.red}80`,      bg:`${T.red}18`,      glow:`0 0 16px ${T.red}60`      },
  active:    { border:`${T.amber}55`,    bg:`${T.amber}12`,    glow:`0 0 10px ${T.amber}38`    },
  merging:   { border:`${T.violetHi}65`, bg:`${T.violetHi}15`, glow:`0 0 12px ${T.violetHi}50`},
  default:   { border:'rgba(255,255,255,0.06)', bg:'rgba(255,255,255,0.02)', glow:'none' },
}

const LEGEND = [
  { key:'default',   label:'Unsorted'  },
  { key:'active',    label:'Range'     },
  { key:'comparing', label:'Comparing' },
  { key:'placing',   label:'Placing'   },
  { key:'sorted',    label:'Sorted'    },
]

const PSEUDO = [
  { code:'mergeSort(arr, l, r)',          indent:0 },
  { code:'if l >= r → return',           indent:1 },
  { code:'mid = ⌊(l+r)/2⌋',             indent:1 },
  { code:'mergeSort(arr, l, mid)',        indent:1 },
  { code:'mergeSort(arr, mid+1, r)',      indent:1 },
  { code:'merge(arr, l, mid, r)',         indent:1 },
  { code:'compare left[i] vs right[j]',  indent:2 },
  { code:'place smaller element',        indent:2 },
  { code:'copy remaining elements',      indent:2 },
  { code:'✦ subarray merged',            indent:1 },
  { code:'✦ array fully sorted',         indent:0 },
]

// ── Reducer ───────────────────────────────────────────────────────────────────
const rnd = (n) => Array.from({length:n}, () => Math.floor(Math.random()*340)+30)
const INIT = { arraySize:20, speed:180, steps:[], stepIndex:0, isPlaying:false, isDone:false }

function reducer(s, a) {
  switch(a.type) {
    case 'GENERATE':  return {...s, steps:a.steps, stepIndex:0, isPlaying:false, isDone:false}
    case 'PLAY':      return {...s, isPlaying:true,  isDone:false}
    case 'PAUSE':     return {...s, isPlaying:false}
    case 'NEXT_STEP': {
      const nx = s.stepIndex + 1
      if (nx >= s.steps.length-1) return {...s, stepIndex:s.steps.length-1, isPlaying:false, isDone:true}
      return {...s, stepIndex:nx}
    }
    case 'RESET':     return {...s, stepIndex:0, isPlaying:false, isDone:false}
    case 'SET_SPEED': return {...s, speed:a.speed}
    case 'SET_SIZE':  return {...s, arraySize:a.arraySize}
    default:          return s
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function Label({children, color=T.textDim, size='9px', mono=false, style={}}) {
  return (
    <span style={{fontFamily:mono?T.mono:T.font, fontSize:size, color, letterSpacing:'0.06em', ...style}}>
      {children}
    </span>
  )
}

function Badge({children, color=T.violet}) {
  return (
    <span style={{
      fontFamily:T.mono, fontSize:'10px', color,
      background:`${color}18`, border:`1px solid ${color}35`,
      borderRadius:'999px', padding:'2px 10px', letterSpacing:'0.04em',
    }}>{children}</span>
  )
}

function Card({children, style={}, className=''}) {
  return (
    <div className={className} style={{
      background:T.surface,
      border:`1px solid ${T.border}`,
      borderRadius:'16px',
      backdropFilter:'blur(12px)',
      boxShadow:'0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)',
      ...style,
    }}>
      {children}
    </div>
  )
}

function Btn({children, variant='secondary', onClick, disabled}) {
  const styles = {
    primary: {
      background:`linear-gradient(135deg,${T.violet2},#7c3aed)`,
      color:'#fff', border:'none',
      boxShadow:`0 4px 18px rgba(99,102,241,0.35)`,
    },
    secondary: {
      background:'rgba(255,255,255,0.04)',
      color:T.textSec, border:`1px solid ${T.border}`,
    },
    cyan: {
      background:`${T.cyan}12`,
      color:T.cyan, border:`1px solid ${T.cyan}30`,
    },
    amber: {
      background:`${T.amber}12`,
      color:T.amber, border:`1px solid ${T.amber}30`,
    },
  }
  return (
    <button
      onClick={onClick} disabled={disabled}
      style={{
        ...styles[variant],
        fontFamily:T.font, fontWeight:700, fontSize:'12px',
        padding:'8px 16px', borderRadius:'10px',
        cursor:'pointer', letterSpacing:'0.02em',
        transition:'all 0.18s cubic-bezier(0.4,0,0.2,1)',
        opacity: disabled ? 0.28 : 1,
        whiteSpace:'nowrap',
      }}
      onMouseEnter={e => { if(!disabled) e.currentTarget.style.transform='translateY(-1px)' }}
      onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)' }}
    >
      {children}
    </button>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function MergeSortPage() {
  const [state, dispatch] = useReducer(reducer, INIT)
  const {arraySize, speed, steps, stepIndex, isPlaying, isDone} = state
  const iRef = useRef(null)
  const [isMobile, setIsMobile] = useState(false)
  const [showPseudo, setShowPseudo] = useState(true)

  // detect mobile
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    setIsMobile(mq.matches)
    if (mq.matches) setShowPseudo(false)
    const fn = e => { setIsMobile(e.matches); if(e.matches) setShowPseudo(false) }
    mq.addEventListener('change', fn)
    return () => mq.removeEventListener('change', fn)
  }, [])

  const step = steps[stepIndex] ?? {
    array: rnd(arraySize), phase:'idle',
    left:0, mid:0, right:0,
    comparing:[], merging:[], sorted:[], currentLine:-1, depth:0,
  }

  useEffect(() => {
    clearInterval(iRef.current)
    dispatch({type:'GENERATE', steps:generateMergeSortSteps(rnd(arraySize))})
  }, [arraySize])

  useEffect(() => {
    if (!isPlaying || !steps.length) { clearInterval(iRef.current); return }
    clearInterval(iRef.current)
    iRef.current = setInterval(() => dispatch({type:'NEXT_STEP'}), speed)
    return () => clearInterval(iRef.current)
  }, [isPlaying, speed, steps.length])

  useEffect(() => () => clearInterval(iRef.current), [])

  const handleGenerate = useCallback(() => {
    clearInterval(iRef.current)
    dispatch({type:'GENERATE', steps:generateMergeSortSteps(rnd(arraySize))})
  }, [arraySize])

  const handlePlay  = useCallback(() => { if(!isDone && steps.length) dispatch({type:'PLAY'}) }, [isDone, steps.length])
  const handlePause = useCallback(() => { clearInterval(iRef.current); dispatch({type:'PAUSE'}) }, [])
  const handleStep  = useCallback(() => { if(!isDone && steps.length) dispatch({type:'NEXT_STEP'}) }, [isDone, steps.length])
  const handleReset = useCallback(() => { clearInterval(iRef.current); dispatch({type:'RESET'}) }, [])

  const getBarState = (i) => {
    if (step.sorted?.includes(i))    return 'sorted'
    if (step.comparing?.includes(i)) return 'comparing'
    if (step.merging?.includes(i))   return 'placing'
    if (i >= step.left && i <= step.right && step.phase !== 'done') return 'active'
    return 'default'
  }

  const maxVal = Math.max(...(step.array || [1]))
  const pct    = steps.length > 1 ? (stepIndex / (steps.length-1)) * 100 : 0
  const sortedCount = step.sorted?.length ?? 0
  const maxDepth = Math.ceil(Math.log2(arraySize+1))

  const statusMap = {
    idle:    {text:'Press ▶ Play or ⏭ Step to begin', color:T.textDim},
    split:   {text:`Splitting [${step.left}…${step.right}] at mid ${step.mid}`, color:T.violetHi},
    single:  {text:`Base case — single element at [${step.left}]`, color:T.amber},
    compare: {text:`Comparing arr[${step.comparing?.[0]}] vs arr[${step.comparing?.[1]}]`, color:T.cyan},
    place:   {text:`Placing element at index ${step.merging?.[0]}`, color:T.red},
    merged:  {text:`✦ Merged [${step.left}…${step.right}] — ${step.right-step.left+1} elements`, color:T.green},
    done:    {text:'✦ Array fully sorted', color:T.green},
  }
  const status = statusMap[step.phase] ?? statusMap.idle

  // ── Layout: mobile stacks vertically, desktop is column layout ──────────────
  return (
    <>
      <Navbar />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@400;500;700;900&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        html, body { height:100%; overflow:hidden; background:${T.bg}; }

        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes scanline { 0%{left:-50%} 100%{left:150%} }
        @keyframes rangePulse { 0%,100%{opacity:1} 50%{opacity:.6} }
        @keyframes barShine { from{top:-120%} to{top:220%} }

        .ms-shell {
          height: calc(100vh - 52px);
          background: ${T.bg};
          overflow: hidden;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        /* Ambient glow matching landing hero */
        .ms-shell::before {
          content:''; position:absolute;
          width:min(640px,90vw); height:min(480px,70vw);
          top:-10%; left:50%; transform:translateX(-50%);
          border-radius:50%;
          background:radial-gradient(ellipse,rgba(99,102,241,0.11) 0%,rgba(79,70,229,0.05) 40%,transparent 70%);
          pointer-events:none; z-index:0;
        }
        /* Dot grid */
        .ms-shell::after {
          content:''; position:absolute; inset:0; pointer-events:none; z-index:0;
          background-image:radial-gradient(circle,rgba(129,140,248,0.06) 1px,transparent 1px);
          background-size:28px 28px;
        }

        .ms-inner {
          position:relative; z-index:1;
          flex:1; min-height:0;
          display:flex; flex-direction:column;
          padding:clamp(10px,1.5vw,16px) clamp(12px,2vw,20px) clamp(8px,1.2vw,12px);
          gap:clamp(8px,1.2vw,12px);
          overflow:hidden;
        }

        /* Canvas area */
        .ms-canvas {
          flex:1; min-height:0;
          background:${T.surface};
          border:1px solid ${T.border};
          border-radius:18px;
          padding:clamp(10px,1.5vw,16px) clamp(10px,1.5vw,16px) clamp(6px,1vw,10px);
          display:flex; align-items:flex-end; gap:clamp(1px,0.2vw,3px);
          position:relative; overflow:hidden;
          backdrop-filter:blur(10px);
          box-shadow:0 16px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05);
        }
        /* Grid lines on canvas */
        .ms-canvas::before {
          content:''; position:absolute; inset:0; pointer-events:none; border-radius:18px;
          background:
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        /* Scanline shimmer */
        .ms-canvas-scan {
          position:absolute; top:0; height:100%; width:40%; pointer-events:none; z-index:10;
          background:linear-gradient(100deg,transparent,rgba(255,255,255,0.008),transparent);
          animation:scanline 9s ease-in-out infinite;
        }

        /* Range indicator */
        .ms-range {
          position:absolute; bottom:0; height:3px;
          border-radius:999px; pointer-events:none; z-index:15;
        }

        /* Bottom strip */
        .ms-bottom {
          display:flex;
          gap:clamp(8px,1.2vw,12px);
          flex-shrink:0;
          align-items:stretch;
          min-height:0;
        }

        /* Controls column */
        .ms-ctrl-col {
          flex:1; min-width:0;
          display:flex; flex-direction:column;
          gap:clamp(6px,1vw,8px);
        }

        /* Depth panel - hidden on mobile, shown on large screens */
        .ms-depth { display:flex; }
        @media(max-width:900px) { .ms-depth { display:none !important; } }

        /* Pseudo panel - toggleable on small screens */
        .ms-pseudo { display:flex; }
        @media(max-width:768px) { .ms-pseudo { display:none !important; } }
        .ms-pseudo.force-show { display:flex !important; }

        /* Mobile: bottom strip stacks vertically */
        @media(max-width:640px) {
          .ms-bottom { flex-direction:column; }
          .ms-ctrl-col { gap:6px; }
        }

        /* Sliders */
        input[type=range] {
          accent-color: ${T.violet};
          cursor:pointer;
        }
        input[type=range]::-webkit-slider-thumb { cursor:pointer; }

        /* Scrollbar */
        ::-webkit-scrollbar { width:3px; height:3px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:${T.violet2}; border-radius:2px; }
      `}</style>

      <div className="ms-shell">
        <div className="ms-inner">

          {/* ── HEADER ─────────────────────────────────────────────── */}
          <div style={{
            display:'flex', alignItems:'center', flexWrap:'wrap',
            gap:'8px', flexShrink:0,
            paddingBottom:`clamp(6px,1vw,10px)`,
            borderBottom:`1px solid ${T.border}`,
          }}>
            <h1 style={{
              fontFamily:T.font, fontWeight:900,
              fontSize:'clamp(18px,2.5vw,26px)',
              color:T.textPri, letterSpacing:'-0.02em',
              lineHeight:1, margin:0,
            }}>
              Merge Sort
            </h1>
            <Badge color={T.violet}>O(n log n)</Badge>
            <Badge color={T.cyan}>Divide &amp; Conquer</Badge>
            <Badge color={T.green}>Stable</Badge>

            <AnimatePresence>
              {sortedCount > 0 && (
                <motion.div
                  initial={{opacity:0,scale:.9,x:-6}}
                  animate={{opacity:1,scale:1,x:0}}
                  exit={{opacity:0,scale:.9}}
                  transition={{duration:.2}}
                >
                  <Badge color={T.green}>{sortedCount}/{arraySize} sorted</Badge>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Legend — hidden on very small screens */}
            <div style={{
              display:'flex', gap:isMobile?'8px':'14px',
              marginLeft:'auto', alignItems:'center', flexWrap:'wrap',
            }}>
              {LEGEND.map(({key, label}) => (
                <span key={key} style={{
                  display:'flex', alignItems:'center', gap:'5px',
                  fontFamily:T.mono, fontSize:'9px',
                  color:BS[key].border.replace('70','cc').replace('80','cc').replace('55','cc').replace('65','cc'),
                }}>
                  <span style={{
                    width:8, height:8, borderRadius:'2px', flexShrink:0,
                    background:BS[key].border,
                    boxShadow:BS[key].glow,
                    display:'inline-block',
                  }}/>
                  {!isMobile && label}
                </span>
              ))}
              {/* Toggle pseudocode on mobile */}
              {isMobile && (
                <button
                  onClick={() => setShowPseudo(p => !p)}
                  style={{
                    fontFamily:T.mono, fontSize:'9px', color:T.violet,
                    background:`${T.violet}14`, border:`1px solid ${T.violet}30`,
                    borderRadius:'6px', padding:'3px 8px', cursor:'pointer',
                  }}
                >
                  {showPseudo ? 'Hide' : '{ }'} Code
                </button>
              )}
            </div>
          </div>

          {/* ── MAIN ROW: canvas + depth ────────────────────────────── */}
          <div style={{flex:1, minHeight:0, display:'flex', gap:'clamp(8px,1.2vw,12px)', overflow:'hidden'}}>

            {/* BAR CANVAS */}
            <div className="ms-canvas" style={{flex:1}}>
              <div className="ms-canvas-scan"/>

              {/* Range bracket */}
              {step.phase !== 'idle' && step.phase !== 'done' && step.array?.length > 0 && (
                <motion.div
                  className="ms-range"
                  animate={{
                    left:`${(step.left/step.array.length)*100}%`,
                    width:`${((step.right-step.left+1)/step.array.length)*100}%`,
                    background: step.phase==='merged' ? T.green : T.violetHi,
                    boxShadow: step.phase==='merged' ? `0 0 10px ${T.green}` : `0 0 10px ${T.violetHi}`,
                  }}
                  transition={{duration:.18}}
                />
              )}

              {/* Mid divider */}
              {['split','compare','place','merged'].includes(step.phase) &&
               step.array?.length > 0 && step.mid > step.left && (
                <motion.div
                  animate={{opacity:[.35,.75,.35]}}
                  transition={{duration:1.6, repeat:Infinity}}
                  style={{
                    position:'absolute', bottom:0, zIndex:9,
                    left:`${((step.mid+.5)/step.array.length)*100}%`,
                    width:'1px', top:'6px',
                    background:`linear-gradient(to bottom,transparent,${T.violetHi}80,${T.violetHi}80,transparent)`,
                    pointerEvents:'none',
                  }}
                />
              )}

              {/* Bars */}
              {step.array?.map((val, i) => {
                const st   = getBarState(i)
                const meta = BS[st]
                const h    = Math.max((val/maxVal)*100, 1)
                return (
                  <div key={i} style={{flex:1, height:'100%', display:'flex', alignItems:'flex-end', position:'relative', zIndex:5}}>
                    <motion.div
                      animate={{
                        height:`${h}%`,
                        background:`linear-gradient(to top,${meta.border},${meta.bg})`,
                        borderColor:meta.border,
                        boxShadow:meta.glow,
                      }}
                      transition={{duration:.11}}
                      style={{
                        width:'100%', minHeight:'3px',
                        borderRadius:'3px 3px 1px 1px',
                        border:`1px solid ${meta.border}`,
                        position:'relative', overflow:'hidden',
                      }}
                    >
                      {(st==='comparing'||st==='placing') && (
                        <motion.div
                          style={{
                            position:'absolute', left:0, right:0, height:'30%',
                            background:`linear-gradient(to bottom,transparent,${meta.border}70,transparent)`,
                            pointerEvents:'none',
                            top:'-120%',
                          }}
                          animate={{top:['−120%','220%']}}
                          transition={{duration:.75, repeat:Infinity, ease:'linear'}}
                        />
                      )}
                    </motion.div>
                  </div>
                )
              })}
            </div>

            {/* DEPTH METER */}
            <Card className="ms-depth" style={{
              width:'clamp(48px,5vw,60px)',
              flexShrink:0, flexDirection:'column',
              alignItems:'center', padding:'12px 6px', gap:'6px',
            }}>
              <span style={{
                fontFamily:T.mono, fontWeight:700, fontSize:'7px',
                color:T.textDim, letterSpacing:'2px', textTransform:'uppercase',
                writingMode:'vertical-rl', transform:'rotate(180deg)',
              }}>Depth</span>
              <div style={{flex:1, display:'flex', flexDirection:'column', gap:'3px', justifyContent:'flex-end', width:'100%'}}>
                {Array.from({length:maxDepth}).map((_,d) => {
                  const active = step.depth===d && !['done','idle'].includes(step.phase)
                  return (
                    <motion.div key={d}
                      animate={{
                        background: active ? `linear-gradient(135deg,${T.violet2},${T.violetHi})` : 'rgba(255,255,255,0.03)',
                        boxShadow:  active ? `0 0 10px ${T.violetHi}60` : 'none',
                        scaleX:     active ? 1.05 : 1,
                      }}
                      transition={{duration:.18}}
                      style={{
                        width:'100%', height:'clamp(14px,1.8vw,20px)', borderRadius:'6px',
                        border:`1px solid ${active ? T.violetHi : T.border}`,
                        display:'flex', alignItems:'center', justifyContent:'center',
                      }}
                    >
                      <span style={{fontFamily:T.mono, fontSize:'8px', color:active?'#fff':T.textDim, fontWeight:active?700:400}}>{d}</span>
                    </motion.div>
                  )
                })}
              </div>
              <span style={{fontFamily:T.mono, fontSize:'7px', color:T.textDim}}>lvl</span>
            </Card>
          </div>

          {/* ── BOTTOM STRIP ────────────────────────────────────────── */}
          <div className="ms-bottom">

            {/* Controls column */}
            <div className="ms-ctrl-col">

              {/* Status bar */}
              <Card style={{padding:'8px 14px', display:'flex', alignItems:'center', minHeight:'36px', flexShrink:0}}>
                <AnimatePresence mode="wait">
                  <motion.span key={status.text}
                    initial={{opacity:0,y:3}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-3}}
                    transition={{duration:.14}}
                    style={{fontFamily:T.mono, fontSize:'clamp(9px,1.1vw,11px)', color:status.color, letterSpacing:'0.02em'}}
                  >
                    {status.text}
                  </motion.span>
                </AnimatePresence>
              </Card>

              {/* Progress */}
              <Card style={{padding:'8px 14px', flexShrink:0}}>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:'6px'}}>
                  <Label mono>Progress</Label>
                  <Label color={pct>0?T.violetHi:T.textDim} mono>
                    {stepIndex} / {Math.max(steps.length-1,0)}
                  </Label>
                </div>
                <div style={{width:'100%', height:'5px', background:'rgba(255,255,255,0.05)', borderRadius:'999px', overflow:'hidden'}}>
                  <motion.div
                    animate={{width:`${pct}%`}}
                    transition={{duration:.08}}
                    style={{
                      height:'5px', borderRadius:'999px',
                      background: isDone
                        ? `linear-gradient(90deg,${T.green},#34d399)`
                        : `linear-gradient(90deg,${T.violet2},${T.violetHi})`,
                      boxShadow: isDone ? `0 0 8px ${T.green}60` : `0 0 8px ${T.violetHi}60`,
                    }}
                  />
                </div>
              </Card>

              {/* Controls */}
              <Card style={{padding:'10px 14px', flex:1, display:'flex', alignItems:'center'}}>
                <div style={{
                  display:'flex', alignItems:'center',
                  gap:'clamp(6px,1vw,10px)',
                  width:'100%', flexWrap:'wrap',
                }}>
                  {/* Primary play/pause */}
                  <Btn variant="primary" onClick={isPlaying?handlePause:handlePlay} disabled={isDone&&!isPlaying}>
                    {isPlaying ? '⏸ Pause' : isDone ? '✦ Done' : '▶ Play'}
                  </Btn>

                  <Btn variant="amber" onClick={handleStep} disabled={isPlaying||isDone}>⏭ Step</Btn>
                  <Btn variant="secondary" onClick={handleReset} disabled={stepIndex===0&&!isDone}>↺ Reset</Btn>
                  <Btn variant="cyan" onClick={handleGenerate}>⟳ New Array</Btn>

                  {/* Speed slider */}
                  <div style={{display:'flex', alignItems:'center', gap:'5px', marginLeft:'auto'}}>
                    <Label mono size="9px">🐢</Label>
                    <input type="range" min={40} max={800} step={20}
                      value={1040-speed}
                      onChange={e=>dispatch({type:'SET_SPEED', speed:1040-Number(e.target.value)})}
                      style={{width:'clamp(60px,7vw,90px)'}}
                    />
                    <Label mono size="9px">🐇</Label>
                    <Label mono color={T.textSec} size="9px" style={{minWidth:'38px'}}>{speed}ms</Label>
                  </div>

                  {/* Array size slider */}
                  <div style={{display:'flex', alignItems:'center', gap:'5px'}}>
                    <Label mono size="9px">n:</Label>
                    <input type="range" min={6} max={40} step={2}
                      value={arraySize}
                      onChange={e=>dispatch({type:'SET_SIZE', arraySize:Number(e.target.value)})}
                      style={{width:'clamp(55px,6vw,80px)'}}
                    />
                    <Label mono color={T.textSec} size="9px" style={{minWidth:'20px'}}>{arraySize}</Label>
                  </div>
                </div>
              </Card>
            </div>

            {/* Pseudocode panel */}
            <Card
              className={`ms-pseudo${showPseudo?' force-show':''}`}
              style={{
                width:'clamp(220px,22vw,280px)',
                flexShrink:0, flexDirection:'column',
              }}
            >
              <div style={{padding:'10px 14px 7px', borderBottom:`1px solid ${T.border}`, flexShrink:0}}>
                <Label mono size="9px" color={T.textDim} style={{letterSpacing:'0.14em', textTransform:'uppercase'}}>
                  Pseudocode
                </Label>
              </div>

              <div style={{flex:1, overflow:'hidden', padding:'7px 8px', display:'flex', flexDirection:'column', gap:'1px'}}>
                {PSEUDO.map((line, i) => {
                  const active = i === step.currentLine
                  return (
                    <motion.div key={i}
                      animate={{
                        background: active ? `${T.violet}1e` : 'transparent',
                        borderLeftColor: active ? T.violet : 'transparent',
                      }}
                      transition={{duration:.14}}
                      style={{
                        paddingLeft:`${line.indent*14+10}px`,
                        paddingTop:'3px', paddingBottom:'3px', paddingRight:'6px',
                        borderRadius:'6px',
                        borderLeft:`2px solid`,
                        fontFamily:T.mono, fontSize:'clamp(8px,1vw,10px)',
                        color: active ? T.violetHi : T.textDim,
                        fontWeight: active ? 700 : 400,
                        lineHeight:1.4,
                        display:'flex', alignItems:'center', gap:'5px',
                      }}
                    >
                      {active && (
                        <motion.span
                          animate={{opacity:[1,.3,1]}}
                          transition={{duration:.9, repeat:Infinity}}
                          style={{color:T.violetHi, fontSize:'7px', flexShrink:0}}
                        >▶</motion.span>
                      )}
                      <span style={{marginLeft:active?0:'12px'}}>{line.code}</span>
                    </motion.div>
                  )
                })}
              </div>

              {/* Complexity footer */}
              <div style={{borderTop:`1px solid ${T.border}`, padding:'9px 14px', display:'flex', justifyContent:'space-between', flexShrink:0}}>
                {[
                  {lbl:'Time',  val:'O(n log n)', col:T.violetHi},
                  {lbl:'Space', val:'O(n)',        col:T.amber},
                  {lbl:'Stable',val:'Yes',         col:T.green},
                ].map(({lbl,val,col})=>(
                  <div key={lbl} style={{textAlign:'center'}}>
                    <p style={{fontFamily:T.mono, fontSize:'7px', color:T.textDim, marginBottom:'2px', letterSpacing:'0.1em'}}>{lbl.toUpperCase()}</p>
                    <p style={{fontFamily:T.mono, fontWeight:700, fontSize:'clamp(10px,1.2vw,12px)', color:col, margin:0}}>{val}</p>
                  </div>
                ))}
              </div>
            </Card>

          </div>
        </div>
      </div>
    </>
  )
}