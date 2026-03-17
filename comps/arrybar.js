'use client'
import { motion } from 'framer-motion'

const STATE_STYLES = {
  default:   { border: '#0ea5e940', bg: '#0ea5e915', glow: 'none'                 },
  comparing: { border: '#f59e0b80', bg: '#f59e0b20', glow: '0 0 12px #f59e0b50'  },
  swapping:  { border: '#ef444480', bg: '#ef444420', glow: '0 0 12px #ef444450'  },
  sorted:    { border: '#10b98160', bg: '#10b98118', glow: '0 0 8px #10b98140'   },
}

export default function ArrayBar({ value, state = 'default', maxValue }) {
  const s   = STATE_STYLES[state] || STATE_STYLES.default
  const pct = Math.max((value / maxValue) * 100, 1)

  return (
    <div style={{ height: '100%', display: 'flex', alignItems: 'flex-end' }}>
      <motion.div
        animate={{
          height:      `${pct}%`,
          background:  `linear-gradient(to top, ${s.border}, ${s.bg})`,
          borderColor: s.border,
          boxShadow:   s.glow,
        }}
        transition={{ duration: 0.12, ease: 'easeOut' }}
        style={{
          width:        '100%',
          minHeight:    '3px',
          borderRadius: '3px 3px 1px 1px',
          border:       `1px solid ${s.border}`,
          position:     'relative',
          overflow:     'hidden',
        }}
      >
        {/* shimmer on active */}
        {(state === 'comparing' || state === 'swapping') && (
          <motion.div
            animate={{ y: ['-100%', '200%'] }}
            transition={{ duration: 0.65, repeat: Infinity, ease: 'linear' }}
            style={{
              position: 'absolute', left: 0, right: 0, height: '35%',
              background: `linear-gradient(to bottom, transparent, ${s.border}70, transparent)`,
              pointerEvents: 'none',
            }}
          />
        )}
      </motion.div>
    </div>
  )
}