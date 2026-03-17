'use client'

export default function ControlPanel({
  onGenerate,
  onPlay,
  onPause,
  onReset,
  onStep,
  isPlaying,
  isDone,
  speed,
  onSpeedChange,
  arraySize,
  onSizeChange,
}) {
  return (
    <div className="flex flex-wrap gap-4 items-center justify-center
                    bg-gray-800 p-4 rounded-xl">

      {/* Buttons */}
      <div className="flex gap-2 flex-wrap justify-center">
        <button
          onClick={onGenerate}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600
                     text-white rounded-lg font-medium transition"
        >
          🔀 Generate
        </button>

        {!isPlaying ? (
          <button
            onClick={onPlay}
            disabled={isDone}
            className="px-4 py-2 bg-green-500 hover:bg-green-600
                       text-white rounded-lg font-medium transition
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ▶ Play
          </button>
        ) : (
          <button
            onClick={onPause}
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600
                       text-white rounded-lg font-medium transition"
          >
            ⏸ Pause
          </button>
        )}

        <button
          onClick={onStep}
          disabled={isPlaying || isDone}
          className="px-4 py-2 bg-purple-500 hover:bg-purple-600
                     text-white rounded-lg font-medium transition
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ⏭ Step
        </button>

        <button
          onClick={onReset}
          className="px-4 py-2 bg-red-500 hover:bg-red-600
                     text-white rounded-lg font-medium transition"
        >
          🔄 Reset
        </button>
      </div>

      {/* Speed Slider */}
      <div className="flex items-center gap-2 text-white">
        <span className="text-sm">🐢</span>
        <input
          type="range" min="50" max="1000" step="50"
          value={1050 - speed}
          onChange={(e) => onSpeedChange(1050 - Number(e.target.value))}
          className="w-28 accent-blue-400"
        />
        <span className="text-sm">🐇</span>
        <span className="text-xs text-gray-400 w-14">{speed}ms/step</span>
      </div>

      {/* Size Slider */}
      <div className="flex items-center gap-2 text-white">
        <span className="text-sm text-gray-400">Size:</span>
        <input
          type="range" min="10" max="60" step="5"
          value={arraySize}
          onChange={(e) => onSizeChange(Number(e.target.value))}
          className="w-28 accent-blue-400"
        />
        <span className="text-xs text-gray-400 w-6">{arraySize}</span>
      </div>

    </div>
  )
}