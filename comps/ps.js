'use client'

const lines = [
  { code: 'for i = 0 to n-1',           indent: 0 },
  { code: 'for j = 0 to n-i-2',         indent: 1 },
  { code: 'if arr[j] > arr[j+1]',       indent: 2 },
  { code: 'swap(arr[j], arr[j+1])',     indent: 3 },
  { code: 'end if',                      indent: 2 },
  { code: 'end for',                     indent: 1 },
  { code: 'end for',                     indent: 0 },
]

export default function PseudoCode({ currentLine }) {
  return (
    <div className="bg-gray-900 rounded-xl p-4 font-mono text-sm w-full">
      <p className="text-gray-400 text-xs mb-3 uppercase tracking-wider">
        Pseudocode
      </p>

      {lines.map((line, i) => (
        <div
          key={i}
          className={`px-2 py-1 rounded transition-all duration-200
            ${i === currentLine
              ? 'bg-yellow-500 text-black font-bold'
              : 'text-gray-300 hover:bg-gray-800'
            }`}
          style={{ paddingLeft: `${line.indent * 16 + 8}px` }}
        >
          {i === currentLine ? '▶ ' : '  '}
          {line.code}
        </div>
      ))}

      {/* Complexity */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">
          Complexity
        </p>
        <div className="flex gap-4">
          <div>
            <p className="text-xs text-gray-500">Time</p>
            <p className="text-yellow-400 font-bold">O(n²)</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Space</p>
            <p className="text-green-400 font-bold">O(1)</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Stable</p>
            <p className="text-blue-400 font-bold">Yes</p>
          </div>
        </div>
      </div>
    </div>
  )
}