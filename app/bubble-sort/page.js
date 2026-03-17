'use client'
import { useReducer, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ArrayBar from '@/comps/arrybar'
import ControlPanel from '@/comps/cp'
import Navbar from '@/comps/navbar'
import PseudoCode from '@/comps/ps'
import { generateBubbleSortSteps } from '@/comps/algo/bs'

const randomArray = (size) =>
  Array.from({ length: size }, () => Math.floor(Math.random() * 350) + 30)

const initialState = {
  arraySize: 20,
  speed:     200,
  steps:     [],
  stepIndex: 0,
  isPlaying: false,
  isDone:    false,
}

function reducer(state, action) {
  switch (action.type) {
    case 'GENERATE':
      return { ...state, steps: action.steps, stepIndex: 0, isPlaying: false, isDone: false }
    case 'PLAY':
      return { ...state, isPlaying: true, isDone: false }
    case 'PAUSE':
      return { ...state, isPlaying: false }
    case 'NEXT_STEP': {
      const next = state.stepIndex + 1
      if (next >= state.steps.length - 1)
        return { ...state, stepIndex: state.steps.length - 1, isPlaying: false, isDone: true }
      return { ...state, stepIndex: next }
    }
    case 'RESET':
      return { ...state, stepIndex: 0, isPlaying: false, isDone: false }
    case 'SET_SPEED':
      return { ...state, speed: action.speed }
    case 'SET_SIZE':
      return { ...state, arraySize: action.arraySize }
    default:
      return state
  }
}

// ── colour map ────────────────────────────────────────────────────────────────
const STATE_META = {
  default:   { bg: '#0ea5e915', border: '#0ea5e940', glow: 'none',                    text: '#1e3a5c' },
  comparing: { bg: '#f59e0b20', border: '#f59e0b80', glow: '0 0 12px #f59e0b50',     text: '#f59e0b' },
  swapping:  { bg: '#ef444420', border: '#ef444480', glow: '0 0 12px #ef444450',     text: '#ef4444' },
  sorted:    { bg: '#10b98118', border: '#10b98160', glow: '0 0 8px #10b98140',      text: '#10b981' },
}

const LEGEND = [
  { state: 'default',   label: 'Unsorted'  },
  { state: 'comparing', label: 'Comparing' },
  { state: 'swapping',  label: 'Swapping'  },
  { state: 'sorted',    label: 'Sorted'    },
]

export default function BubbleSortPage() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const { arraySize, speed, steps, stepIndex, isPlaying, isDone } = state
  const intervalRef = useRef(null)

  const currentStep = steps[stepIndex] ?? {
    array: randomArray(arraySize), comparing: [], swapping: [], sorted: [], currentLine: -1,
  }

  useEffect(() => {
    clearInterval(intervalRef.current)
    dispatch({ type: 'GENERATE', steps: generateBubbleSortSteps(randomArray(arraySize)) })
  }, [arraySize])

  useEffect(() => {
    if (!isPlaying || !steps.length) { clearInterval(intervalRef.current); return }
    clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => dispatch({ type: 'NEXT_STEP' }), speed)
    return () => clearInterval(intervalRef.current)
  }, [isPlaying, speed, steps.length])

  useEffect(() => () => clearInterval(intervalRef.current), [])

  const handleGenerate = useCallback(() => {
    clearInterval(intervalRef.current)
    dispatch({ type: 'GENERATE', steps: generateBubbleSortSteps(randomArray(arraySize)) })
  }, [arraySize])

  const handlePlay  = useCallback(() => { if (!isDone && steps.length) dispatch({ type: 'PLAY'      }) }, [isDone, steps.length])
  const handlePause = useCallback(() => { clearInterval(intervalRef.current); dispatch({ type: 'PAUSE' }) }, [])
  const handleStep  = useCallback(() => { if (!isDone && steps.length)  dispatch({ type: 'NEXT_STEP' }) }, [isDone, steps.length])
  const handleReset = useCallback(() => { clearInterval(intervalRef.current); dispatch({ type: 'RESET' }) }, [])

  const getBarState = (i) => {
    if (currentStep.sorted?.includes(i))    return 'sorted'
    if (currentStep.swapping?.includes(i))  return 'swapping'
    if (currentStep.comparing?.includes(i)) return 'comparing'
    return 'default'
  }

  const maxVal  = Math.max(...(currentStep.array || [1]))
  const pct     = steps.length > 1 ? (stepIndex / (steps.length - 1)) * 100 : 0
  const sortedCount = currentStep.sorted?.length ?? 0

  // status message
  let statusText  = 'Press ▶ Play or ⏭ Step to begin'
  let statusColor = '#334155'
  if (isDone) {
    statusText  = '✦ Array fully sorted'
    statusColor = '#10b981'
  } else if (currentStep.swapping?.length) {
    const [a, b] = currentStep.swapping
    statusText  = `Swapping  ${currentStep.array[a]}  ↔  ${currentStep.array[b]}   (idx ${a} & ${b})`
    statusColor = '#ef4444'
  } else if (currentStep.comparing?.length) {
    const [a, b] = currentStep.comparing
    statusText  = `Comparing  ${currentStep.array[a]}  vs  ${currentStep.array[b]}   (idx ${a} & ${b})`
    statusColor = '#f59e0b'
  }

  return (
    <>
      <Navbar />

    <style>{`
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');

  html, body { margin:0; padding:0; overflow:hidden; height:100%; }
  *, *::before, *::after { box-sizing:border-box; }

  .bs-shell {
    height: calc(100vh - 52px);
    background: #02060f;
    color: white;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    padding: 14px 20px 12px;
    gap: 10px;
    position: relative;
    font-family: 'Syne', sans-serif;
  }

  /* dot-grid background */
  .bs-shell::after {
    content: '';
    position: absolute; inset: 0;
    pointer-events: none; z-index: 0;
    background-image: radial-gradient(circle, #0ea5e910 1px, transparent 1px);
    background-size: 26px 26px;
  }

  /* ambient glow */
  .bs-shell::before {
    content: '';
    position: absolute;
    top: -100px; left: 50%;
    transform: translateX(-50%);
    width: 600px; height: 300px;
    background: radial-gradient(ellipse, #0ea5e908 0%, transparent 70%);
    pointer-events: none; z-index: 0;
  }

  .bs-inner {
    position: relative; z-index: 1;
    flex: 1; min-height: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  /* header with wrapping */
  .bs-header {
    display: flex;
    align-items: center;
    gap: 8px 12px;
    flex-shrink: 0;
    flex-wrap: wrap;
  }

  .bs-header h1 {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: clamp(1.2rem, 5vw, 1.5rem);
    color: #e2e8f0;
    letter-spacing: -0.5px;
    line-height: 1;
    margin: 0;
  }

  /* bar canvas */
  .bar-canvas {
    flex: 1;
    min-height: 0;
    background: #040d18;
    border: 1px solid #0a1f35;
    border-radius: 14px;
    padding: 14px 14px 10px;
    display: flex;
    align-items: flex-end;
    gap: clamp(1px, 0.5vw, 3px);
    position: relative;
    overflow: hidden;
  }

  .bar-canvas::before {
    content: '';
    position: absolute; inset: 0;
    pointer-events: none;
    background:
      linear-gradient(#0a1f3510 1px, transparent 1px),
      linear-gradient(90deg, #0a1f3510 1px, transparent 1px);
    background-size: 40px 40px;
    border-radius: 14px;
  }

  /* bottom strip – flexible on mobile */
  .bs-bottom {
    display: flex;
    gap: 10px;
    flex-shrink: 0;
    align-items: stretch;
    height: 148px;              /* desktop default */
  }

  /* left controls wrapper */
  .bs-controls-wrap {
    flex: 1; min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  /* status bar – no fixed height */
  .bs-status {
    background: #040d18;
    border: 1px solid #0a1f35;
    border-radius: 9px;
    padding: 6px 14px;
    font-family: 'JetBrains Mono', monospace;
    font-size: clamp(10px, 2.5vw, 11px);
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
    min-height: 32px;
  }

  /* progress */
  .bs-progress {
    background: #040d18;
    border: 1px solid #0a1f35;
    border-radius: 9px;
    padding: 7px 14px;
    flex-shrink: 0;
  }

  /* controls row */
  .bs-ctrl {
    flex: 1; min-height: 0;
    background: #040d18;
    border: 1px solid #0a1f35;
    border-radius: 9px;
    padding: 8px 14px;
    display: flex;
    align-items: center;
  }

  /* pseudocode panel – fixed width on desktop */
  .bs-pseudo {
    width: 230px;
    flex-shrink: 0;
    background: #040d18;
    border: 1px solid #0a1f35;
    border-radius: 14px;
    overflow: hidden;
  }

  /* 📱 Mobile styles (≤ 600px) */
  @media (max-width: 600px) {
    .bs-bottom {
      flex-direction: column;
      height: auto;              /* remove fixed height */
      gap: 8px;
    }

    .bar-canvas {
      flex: 0 0 auto;            /* don't grow/shrink */
      height: 30vh;              /* roughly 1/3 of viewport */
      max-height: 30vh;
    }

    .bs-pseudo {
      width: 100%;               /* full width */
      height: 140px;             /* give it some space – adjust as needed */
    }

    .bs-header > div:last-child {
      margin-left: 0;             /* center legend on small screens */
      justify-content: flex-start;
    }
  }

  /* legend inside header – keep it flexible */
  .bs-header > div:last-child {
    margin-left: auto;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: flex-end;
  }
`}</style>

      <div className="bs-shell">
        <div className="bs-inner">

          {/* ── HEADER ── */}
          <div className="bs-header">
            <h1 style={{
              fontFamily: 'Syne', fontWeight: 800, fontSize: '1.5rem',
              color: '#e2e8f0', letterSpacing: '-0.5px', lineHeight: 1, margin: 0,
            }}>
              Bubble Sort
            </h1>
            <span style={{
              fontFamily: 'JetBrains Mono', fontSize: '10px',
              color: '#0ea5e9', background: '#0ea5e915',
              border: '1px solid #0ea5e930', borderRadius: '4px',
              padding: '2px 8px', letterSpacing: '0.5px',
            }}>O(n²)</span>

            {/* sorted progress indicator */}
            {sortedCount > 0 && (
              <motion.span
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{
                  fontFamily: 'JetBrains Mono', fontSize: '10px',
                  color: '#10b981', background: '#10b98115',
                  border: '1px solid #10b98130', borderRadius: '4px',
                  padding: '2px 8px',
                }}
              >
                {sortedCount} / {arraySize} sorted
              </motion.span>
            )}

            {/* legend */}
            <div style={{ display: 'flex', gap: '12px', marginLeft: 'auto', alignItems: 'center' }}>
              {LEGEND.map(({ state: s, label }) => (
                <span key={s} style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  fontFamily: 'JetBrains Mono', fontSize: '10px',
                  color: STATE_META[s].text,
                }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: '2px',
                    backgroundColor: STATE_META[s].border,
                    display: 'inline-block', flexShrink: 0,
                    boxShadow: STATE_META[s].glow,
                  }} />
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* ── BAR CANVAS ── */}
          <div className="bar-canvas">
            {currentStep.array?.map((value, i) => {
              const s    = getBarState(i)
              const meta = STATE_META[s]
              const h    = Math.max((value / maxVal) * 100, 1)

              return (
                <motion.div
                  key={i}
                  style={{ flex: 1, height: '100%', display: 'flex', alignItems: 'flex-end' }}
                >
                  <motion.div
                    animate={{
                      height:      `${h}%`,
                      background:  `linear-gradient(to top, ${meta.border}, ${meta.bg})`,
                      borderColor: meta.border,
                      boxShadow:   meta.glow,
                    }}
                    transition={{ duration: 0.12, ease: 'easeOut' }}
                    style={{
                      width:        '100%',
                      minHeight:    '3px',
                      borderRadius: '3px 3px 1px 1px',
                      border:       `1px solid ${meta.border}`,
                      position:     'relative',
                      overflow:     'hidden',
                    }}
                  >
                    {/* shimmer on active bars */}
                    {(s === 'comparing' || s === 'swapping') && (
                      <motion.div
                        animate={{ y: ['-100%', '200%'] }}
                        transition={{ duration: 0.6, repeat: Infinity, ease: 'linear' }}
                        style={{
                          position: 'absolute', left: 0, right: 0, height: '40%',
                          background: `linear-gradient(to bottom, transparent, ${meta.border}60, transparent)`,
                          pointerEvents: 'none',
                        }}
                      />
                    )}
                  </motion.div>
                </motion.div>
              )
            })}
          </div>

          {/* ── BOTTOM STRIP ── */}
          <div className="bs-bottom">

            {/* left side: status + progress + controls */}
            <div className="bs-controls-wrap">

              {/* status */}
              <div className="bs-status">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={statusText}
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -3 }}
                    transition={{ duration: 0.15 }}
                    style={{ color: statusColor, letterSpacing: '0.3px' }}
                  >
                    {statusText}
                  </motion.span>
                </AnimatePresence>
              </div>

              {/* progress */}
              <div className="bs-progress">
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  fontFamily: 'JetBrains Mono', fontSize: '10px',
                  color: '#1e3a5c', marginBottom: '5px',
                }}>
                  <span>Progress</span>
                  <span style={{ color: pct > 0 ? '#0ea5e9' : '#1e3a5c' }}>
                    {stepIndex} / {Math.max(steps.length - 1, 0)}
                  </span>
                </div>
                <div style={{
                  width: '100%', height: '4px',
                  background: '#0a1f35', borderRadius: '999px',
                  position: 'relative', overflow: 'hidden',
                }}>
                  <motion.div
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.08 }}
                    style={{
                      height: '4px', borderRadius: '999px',
                      background: isDone
                        ? 'linear-gradient(90deg, #10b981, #34d399)'
                        : 'linear-gradient(90deg, #0ea5e9, #38bdf8)',
                      boxShadow: isDone ? '0 0 8px #10b98160' : '0 0 8px #0ea5e960',
                    }}
                  />
                </div>
              </div>

              {/* controls */}
              <div className="bs-ctrl">
                <ControlPanel
                  onGenerate={handleGenerate} onPlay={handlePlay}
                  onPause={handlePause} onReset={handleReset} onStep={handleStep}
                  isPlaying={isPlaying} isDone={isDone}
                  speed={speed} onSpeedChange={(s) => dispatch({ type: 'SET_SPEED', speed: s })}
                  arraySize={arraySize} onSizeChange={(s) => dispatch({ type: 'SET_SIZE', arraySize: s })}
                />
              </div>
            </div>

            {/* right side: pseudocode */}
            <div className="bs-pseudo">
              <PseudoCode currentLine={currentStep.currentLine} />
            </div>

          </div>
        </div>
      </div>
    </>
  )
}