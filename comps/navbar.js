'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/bubble-sort',  label: '🫧 Bubble Sort' },
  { href: '/stack',        label: '📚 Stack'        },
  { href: '/queue',        label: '🚶 Queue'        },
  { href: '/bst',          label: '🌳 BST'          },
  { href: '/array',        label: '▦ Array'         },
  { href: '/linked-list',  label: '⬡ Linked List'   },
  { href: '/merge-sort', label: '⇅ Merge Sort' },
  { href: '/binary-search', label: '⚡ Binary Search' },
]

export default function Navbar() {
  const pathname = usePathname()
  return (
    <nav style={{
      backgroundColor: '#060a12',
      borderBottom:    '1px solid #0a1628',
      padding:         '0 20px',
      display:         'flex',
      alignItems:      'center',
      gap:             '20px',
      height:          '52px',
      flexShrink:      0,
    }}>
      <span style={{ color: '#00e5a0', fontWeight: 'bold', fontSize: '14px', fontFamily: 'monospace', whiteSpace: 'nowrap', letterSpacing: '0.5px', flexShrink: 0 }}>
        ⬡ DSA Visualizer
      </span>
      <div style={{ display: 'flex', gap: '5px', overflowX: 'auto' }}>
        {links.map(({ href, label }) => (
          <Link key={href} href={href} style={{
            padding:         '5px 12px',
            borderRadius:    '6px',
            fontWeight:      '600',
            fontSize:        '11px',
            textDecoration:  'none',
            backgroundColor: pathname === href ? '#00e5a015' : 'transparent',
            color:           pathname === href ? '#00e5a0'   : '#1e3050',
            border:          pathname === href ? '1px solid #00e5a030' : '1px solid #0a1628',
            transition:      'all 0.2s',
            whiteSpace:      'nowrap',
            fontFamily:      'monospace',
          }}>
            {label}
          </Link>
        ))}
      </div>
    </nav>
  )
}