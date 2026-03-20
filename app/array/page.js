"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS & THEME
// ─────────────────────────────────────────────────────────────────────────────
const ACCENT   = "#818cf8";
const ACCENT2  = "#a78bfa";
const CYAN     = "#22d3ee";
const GREEN    = "#34d399";
const RED      = "#f87171";
const ORANGE   = "#fb923c";
const PINK     = "#f472b6";
const BG       = "#030912";
const SURFACE  = "rgba(10,13,28,0.95)";
const BORDER   = "rgba(255,255,255,0.07)";
const TEXT_PRI = "#f1f5f9";
const TEXT_SEC = "#94a3b8";
const TEXT_DIM = "#374151";
const MONO     = "'Space Mono', monospace";
const SANS     = "'DM Sans', sans-serif";

const ANIMATION_SPEED = 520; // ms per step

// Cell states → colors
const CELL_COLORS = {
  normal:   { bg:"rgba(129,140,248,0.10)", border:"rgba(129,140,248,0.28)", text:ACCENT,  glow:"rgba(129,140,248,0.15)" },
  active:   { bg:"rgba(34,211,238,0.18)",  border:"rgba(34,211,238,0.7)",   text:CYAN,    glow:"rgba(34,211,238,0.35)"  },
  found:    { bg:"rgba(52,211,153,0.18)",  border:"rgba(52,211,153,0.7)",   text:GREEN,   glow:"rgba(52,211,153,0.35)"  },
  insert:   { bg:"rgba(248,114,182,0.18)", border:"rgba(248,114,182,0.7)",  text:PINK,    glow:"rgba(248,114,182,0.35)" },
  delete:   { bg:"rgba(248,113,113,0.18)", border:"rgba(248,113,113,0.7)",  text:RED,     glow:"rgba(248,113,113,0.35)" },
  compare:  { bg:"rgba(251,146,60,0.18)",  border:"rgba(251,146,60,0.7)",   text:ORANGE,  glow:"rgba(251,146,60,0.35)"  },
  sorted:   { bg:"rgba(52,211,153,0.12)",  border:"rgba(52,211,153,0.4)",   text:GREEN,   glow:"rgba(52,211,153,0.2)"   },
  pivot:    { bg:"rgba(248,114,182,0.22)", border:"rgba(248,114,182,0.8)",  text:PINK,    glow:"rgba(248,114,182,0.4)"  },
};

// ─────────────────────────────────────────────────────────────────────────────
// OPERATIONS CONFIG
// ─────────────────────────────────────────────────────────────────────────────
const OPERATIONS = [
  { id:"push",     label:"Push",          icon:"⊕", color:PINK,   group:"modify"  },
  { id:"pop",      label:"Pop",           icon:"⊖", color:RED,    group:"modify"  },
  { id:"insert",   label:"Insert At",     icon:"↪", color:CYAN,   group:"modify"  },
  { id:"delete",   label:"Delete At",     icon:"✂", color:ORANGE, group:"modify"  },
  { id:"update",   label:"Update",        icon:"✎", color:ACCENT, group:"modify"  },
  { id:"reverse",  label:"Reverse",       icon:"⇄", color:ACCENT2,group:"transform"},
  { id:"rotate",   label:"Rotate",        icon:"↻", color:GREEN,  group:"transform"},
  { id:"search",   label:"Linear Search", icon:"⌕", color:CYAN,   group:"search"  },
  { id:"binary",   label:"Binary Search", icon:"⟨⟩",color:PINK,  group:"search"  },
  { id:"bubble",   label:"Bubble Sort",   icon:"○", color:ORANGE, group:"sort"    },
  { id:"selection",label:"Selection Sort",icon:"◎", color:GREEN,  group:"sort"    },
  { id:"insertion",label:"Insertion Sort",icon:"↩", color:CYAN,   group:"sort"    },
];

const OP_GROUPS = [
  { id:"modify",    label:"Modify",    color:PINK   },
  { id:"transform", label:"Transform", color:GREEN  },
  { id:"search",    label:"Search",    color:CYAN   },
  { id:"sort",      label:"Sort",      color:ORANGE },
];

// ─────────────────────────────────────────────────────────────────────────────
// STEP GENERATOR — returns array of animation frames
// ─────────────────────────────────────────────────────────────────────────────
function generateSteps(op, arr, param1, param2) {
  const steps = [];
  const a = [...arr];
  const push = (array, highlights, message, extra = {}) =>
    steps.push({ array: [...array], highlights: { ...highlights }, message, ...extra });

  switch (op) {
    case "push": {
      const val = Number(param1);
      push(a, {}, `Pushing ${val} to the end…`);
      a.push(val);
      push(a, { [a.length - 1]: "insert" }, `✓ ${val} appended at index ${a.length - 1}`);
      push(a, {}, "Done.");
      break;
    }
    case "pop": {
      if (!a.length) { push(a, {}, "Array is empty — nothing to pop."); break; }
      push(a, { [a.length - 1]: "delete" }, `Marking last element (${a[a.length - 1]}) for removal…`);
      const popped = a.pop();
      push(a, {}, `✓ Popped ${popped}. Array length is now ${a.length}.`);
      break;
    }
    case "insert": {
      const idx = Math.max(0, Math.min(Number(param1), a.length));
      const val = Number(param2);
      push(a, { [idx]: "active" }, `Target index: ${idx}. Shifting elements right…`);
      for (let i = a.length - 1; i >= idx; i--) {
        const h = {};
        for (let j = i; j < a.length; j++) h[j] = "compare";
        push(a, h, `Shifting element at ${i} → ${i + 1}`);
      }
      a.splice(idx, 0, val);
      push(a, { [idx]: "insert" }, `✓ Inserted ${val} at index ${idx}`);
      push(a, {}, "Done.");
      break;
    }
    case "delete": {
      const idx = Math.max(0, Math.min(Number(param1), a.length - 1));
      const val = a[idx];
      push(a, { [idx]: "delete" }, `Marking index ${idx} (value: ${val}) for deletion…`);
      a.splice(idx, 1);
      for (let i = idx; i < a.length; i++) {
        const h = {};
        for (let j = i; j < a.length; j++) h[j] = "compare";
        push(a, h, `Shifting element at ${i + 1} ← ${i}`);
      }
      push(a, {}, `✓ Deleted ${val}. New length: ${a.length}`);
      break;
    }
    case "update": {
      const idx = Math.max(0, Math.min(Number(param1), a.length - 1));
      const val = Number(param2);
      const old = a[idx];
      push(a, { [idx]: "active" }, `Accessing index ${idx} (current value: ${old})…`);
      a[idx] = val;
      push(a, { [idx]: "insert" }, `✓ Updated index ${idx}: ${old} → ${val}`);
      push(a, {}, "Done.");
      break;
    }
    case "reverse": {
      push(a, {}, "Starting reverse — two pointer technique…");
      let l = 0, r = a.length - 1;
      while (l < r) {
        push(a, { [l]: "active", [r]: "active" }, `Swapping indices ${l} and ${r}: ${a[l]} ↔ ${a[r]}`);
        [a[l], a[r]] = [a[r], a[l]];
        push(a, { [l]: "found", [r]: "found" }, `✓ Swapped → ${a[l]} at ${l}, ${a[r]} at ${r}`);
        l++; r--;
      }
      push(a, {}, "✓ Array reversed!");
      break;
    }
    case "rotate": {
      const k = ((Number(param1) % a.length) + a.length) % a.length;
      push(a, {}, `Rotating right by ${k} positions…`);
      for (let step = 0; step < k; step++) {
        const h = {};
        for (let i = 0; i < a.length; i++) h[i] = "compare";
        push(a, h, `Step ${step + 1}/${k}: moving last element to front`);
        a.unshift(a.pop());
        push(a, { 0: "insert" }, `After step ${step + 1}: ${a[0]} is now at front`);
      }
      push(a, {}, `✓ Rotated by ${k}!`);
      break;
    }
    case "search": {
      const target = Number(param1);
      push(a, {}, `Linear search for ${target}. Scanning each element…`);
      let found = false;
      for (let i = 0; i < a.length; i++) {
        push(a, { [i]: "active" }, `Checking index ${i}: ${a[i]} === ${target}?`);
        if (a[i] === target) {
          push(a, { [i]: "found" }, `✓ Found ${target} at index ${i}!`);
          found = true; break;
        }
        push(a, { [i]: "compare" }, `${a[i]} ≠ ${target}, continue…`);
      }
      if (!found) push(a, {}, `✗ ${target} not found in array.`);
      break;
    }
    case "binary": {
      const target = Number(param1);
      const sorted = [...a].sort((x, y) => x - y);
      push(sorted, {}, `Binary search for ${target}. Array must be sorted first…`);
      let lo = 0, hi = sorted.length - 1, found = false;
      while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);
        const h = {};
        for (let i = lo; i <= hi; i++) h[i] = "compare";
        push(sorted, { ...h, [mid]: "active" }, `lo=${lo}, hi=${hi}, mid=${mid} → value=${sorted[mid]}`);
        if (sorted[mid] === target) {
          push(sorted, { [mid]: "found" }, `✓ Found ${target} at index ${mid}!`);
          found = true; break;
        } else if (sorted[mid] < target) {
          push(sorted, h, `${sorted[mid]} < ${target}, search right half`);
          lo = mid + 1;
        } else {
          push(sorted, h, `${sorted[mid]} > ${target}, search left half`);
          hi = mid - 1;
        }
      }
      if (!found) push(sorted, {}, `✗ ${target} not found.`);
      break;
    }
    case "bubble": {
      push(a, {}, "Bubble sort: comparing adjacent pairs, bubbling largest to end…");
      const n = a.length;
      for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
          const h = {};
          for (let k = n - i; k < n; k++) h[k] = "sorted";
          push(a, { ...h, [j]: "active", [j+1]: "active" }, `Comparing ${a[j]} and ${a[j+1]}`);
          if (a[j] > a[j + 1]) {
            [a[j], a[j + 1]] = [a[j + 1], a[j]];
            const h2 = {};
            for (let k = n - i; k < n; k++) h2[k] = "sorted";
            push(a, { ...h2, [j]: "compare", [j+1]: "compare" }, `Swapped! ${a[j]} ↔ ${a[j+1]}`);
          }
        }
        const h3 = {};
        for (let k = n - i - 1; k < n; k++) h3[k] = "sorted";
        push(a, h3, `Pass ${i + 1} done — index ${n-i-1} is sorted`);
      }
      const allSorted = {}; for (let k = 0; k < n; k++) allSorted[k] = "sorted";
      push(a, allSorted, "✓ Array fully sorted!");
      break;
    }
    case "selection": {
      push(a, {}, "Selection sort: finding minimum in unsorted portion…");
      const n = a.length;
      for (let i = 0; i < n - 1; i++) {
        let minIdx = i;
        const sortedH = {};
        for (let k = 0; k < i; k++) sortedH[k] = "sorted";
        push(a, { ...sortedH, [i]: "active" }, `Finding minimum from index ${i}…`);
        for (let j = i + 1; j < n; j++) {
          push(a, { ...sortedH, [minIdx]: "pivot", [j]: "active" }, `Comparing a[${j}]=${a[j]} with current min a[${minIdx}]=${a[minIdx]}`);
          if (a[j] < a[minIdx]) { minIdx = j; push(a, { ...sortedH, [minIdx]: "found" }, `New min found: ${a[minIdx]} at ${minIdx}`); }
        }
        if (minIdx !== i) {
          push(a, { ...sortedH, [i]: "delete", [minIdx]: "insert" }, `Swapping ${a[i]} ↔ ${a[minIdx]}`);
          [a[i], a[minIdx]] = [a[minIdx], a[i]];
        }
        const sh2 = {}; for (let k = 0; k <= i; k++) sh2[k] = "sorted";
        push(a, sh2, `✓ Index ${i} placed correctly`);
      }
      const allSorted = {}; for (let k = 0; k < n; k++) allSorted[k] = "sorted";
      push(a, allSorted, "✓ Array fully sorted!");
      break;
    }
    case "insertion": {
      push(a, {}, "Insertion sort: building sorted portion one element at a time…");
      const n = a.length;
      const sh0 = { 0: "sorted" };
      push(a, sh0, "Index 0 is trivially sorted.");
      for (let i = 1; i < n; i++) {
        const key = a[i];
        let j = i - 1;
        const sortedH = {}; for (let k = 0; k < i; k++) sortedH[k] = "sorted";
        push(a, { ...sortedH, [i]: "active" }, `Inserting ${key} into sorted portion…`);
        while (j >= 0 && a[j] > key) {
          push(a, { ...sortedH, [j]: "compare", [j+1]: "active" }, `${a[j]} > ${key}, shifting right`);
          a[j + 1] = a[j]; j--;
          const sh2 = {}; for (let k = 0; k <= i; k++) sh2[k] = "sorted";
          push(a, { ...sh2 }, `Shifted`);
        }
        a[j + 1] = key;
        const sh3 = {}; for (let k = 0; k <= i; k++) sh3[k] = "sorted";
        push(a, { ...sh3, [j+1]: "found" }, `✓ Placed ${key} at index ${j+1}`);
      }
      const allSorted = {}; for (let k = 0; k < n; k++) allSorted[k] = "sorted";
      push(a, allSorted, "✓ Array fully sorted!");
      break;
    }
    default: break;
  }
  return steps;
}

// ─────────────────────────────────────────────────────────────────────────────
// ARRAY CELL COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
function ArrayCell({ value, index, state = "normal", isNew = false, showIndex = true }) {
  const c = CELL_COLORS[state] || CELL_COLORS.normal;
  return (
    <div style={{
      display:"flex", flexDirection:"column", alignItems:"center", gap:"5px",
      animation: isNew ? "cellPop .35s cubic-bezier(.34,1.56,.64,1)" : `cellEntry .3s ${index * 0.04}s both ease-out`,
    }}>
      {/* Index label */}
      {showIndex && (
        <span style={{
          fontFamily:MONO, fontSize:"9px", color: state !== "normal" ? c.text : TEXT_DIM,
          letterSpacing:"0.05em", transition:"color .3s",
        }}>[{index}]</span>
      )}

      {/* Cell body */}
      <div style={{
        width:"56px", height:"56px", borderRadius:"12px",
        display:"flex", alignItems:"center", justifyContent:"center",
        background:c.bg,
        border:`2px solid ${c.border}`,
        boxShadow: state !== "normal"
          ? `0 0 20px ${c.glow}, 0 0 40px ${c.glow}40, inset 0 1px 0 rgba(255,255,255,0.08)`
          : `0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.04)`,
        fontFamily:MONO, fontSize:"16px", fontWeight:700,
        color:c.text,
        transition:"all .28s cubic-bezier(.16,1,.3,1)",
        position:"relative", overflow:"hidden",
        cursor:"default",
        userSelect:"none",
      }}>
        {/* Shimmer on active */}
        {(state === "active" || state === "found" || state === "insert") && (
          <div style={{
            position:"absolute", top:"-50%", left:"-60%",
            width:"55%", height:"200%",
            background:"linear-gradient(105deg,transparent,rgba(255,255,255,0.12),transparent)",
            transform:"skewX(-15deg)",
            animation:"cellShimmer 1.2s ease-in-out infinite",
          }}/>
        )}
        {value}
      </div>

      {/* State indicator dot */}
      <span style={{
        width:"5px", height:"5px", borderRadius:"50%",
        background: state !== "normal" ? c.text : "transparent",
        boxShadow: state !== "normal" ? `0 0 6px ${c.glow}` : "none",
        transition:"all .3s",
      }}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPLEXITY BADGE
// ─────────────────────────────────────────────────────────────────────────────
const OP_COMPLEXITY = {
  push:"O(1)", pop:"O(1)", insert:"O(n)", delete:"O(n)",
  update:"O(1)", reverse:"O(n)", rotate:"O(n·k)",
  search:"O(n)", binary:"O(log n)", bubble:"O(n²)", selection:"O(n²)", insertion:"O(n²)",
};
const OP_SPACE = {
  push:"O(1)", pop:"O(1)", insert:"O(1)", delete:"O(1)",
  update:"O(1)", reverse:"O(1)", rotate:"O(1)",
  search:"O(1)", binary:"O(1)", bubble:"O(1)", selection:"O(1)", insertion:"O(1)",
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function ArrayPage() {
  const router = useRouter();

  // Array state
  const [array,       setArray]       = useState([4, 2, 7, 1, 9, 3, 6, 8, 5]);
  const [highlights,  setHighlights]  = useState({});
  const [message,     setMessage]     = useState("Select an operation to begin visualization.");
  const [isRunning,   setIsRunning]   = useState(false);
  const [isPaused,    setIsPaused]    = useState(false);
  const [stepMode,    setStepMode]    = useState(false);
  const [speed,       setSpeed]       = useState(1);

  // Steps
  const [steps,       setSteps]       = useState([]);
  const [stepIdx,     setStepIdx]     = useState(0);
  const stepIdxRef    = useRef(0);
  const isPausedRef   = useRef(false);
  const isRunningRef  = useRef(false);
  const stepsRef      = useRef([]);
  const animRef       = useRef(null);

  // Op selection
  const [selectedOp,  setSelectedOp]  = useState("push");
  const [param1,      setParam1]      = useState("");
  const [param2,      setParam2]      = useState("");

  // Custom array input
  const [customInput, setCustomInput] = useState("4,2,7,1,9,3,6,8,5");
  const [inputError,  setInputError]  = useState("");

  // Stats
  const [opCount,     setOpCount]     = useState(0);
  const [history,     setHistory]     = useState([]);
  const [newCellIdx,  setNewCellIdx]  = useState(null);

  const op = OPERATIONS.find(o => o.id === selectedOp);

  // Sync refs
  useEffect(() => { isPausedRef.current   = isPaused;   }, [isPaused]);
  useEffect(() => { isRunningRef.current  = isRunning;  }, [isRunning]);
  useEffect(() => { stepsRef.current      = steps;      }, [steps]);
  useEffect(() => { stepIdxRef.current    = stepIdx;    }, [stepIdx]);

  const applyStep = useCallback((s) => {
    setArray(s.array);
    setHighlights(s.highlights);
    setMessage(s.message);
    if (s.newCell !== undefined) { setNewCellIdx(s.newCell); setTimeout(() => setNewCellIdx(null), 500); }
  }, []);

  const runAnimation = useCallback(async (stepsArr, startIdx = 0) => {
    setIsRunning(true); isRunningRef.current = true;
    for (let i = startIdx; i < stepsArr.length; i++) {
      if (!isRunningRef.current) break;
      while (isPausedRef.current) {
        await new Promise(r => setTimeout(r, 80));
        if (!isRunningRef.current) break;
      }
      if (!isRunningRef.current) break;
      applyStep(stepsArr[i]);
      setStepIdx(i); stepIdxRef.current = i;
      await new Promise(r => setTimeout(r, ANIMATION_SPEED / speed));
    }
    if (isRunningRef.current) {
      setIsRunning(false); isRunningRef.current = false;
      setIsPaused(false); isPausedRef.current = false;
    }
  }, [applyStep, speed]);

  const handleRun = useCallback(() => {
    if (isRunning) return;
    const p1 = param1 === "" ? "0" : param1;
    const p2 = param2 === "" ? "0" : param2;
    const generated = generateSteps(selectedOp, array, p1, p2);
    if (!generated.length) return;
    setSteps(generated); stepsRef.current = generated;
    setStepIdx(0); stepIdxRef.current = 0;
    setOpCount(c => c + 1);
    setHistory(h => [{ op: op?.label, time: new Date().toLocaleTimeString() }, ...h].slice(0, 8));
    if (stepMode) { applyStep(generated[0]); setStepIdx(0); }
    else runAnimation(generated, 0);
  }, [isRunning, selectedOp, array, param1, param2, stepMode, op, applyStep, runAnimation]);

  const handlePause = () => { setIsPaused(p => !p); isPausedRef.current = !isPausedRef.current; };
  const handleStop  = () => { setIsRunning(false); isRunningRef.current = false; setIsPaused(false); isPausedRef.current = false; setHighlights({}); setMessage("Stopped."); };

  const handleStepForward = () => {
    const i = stepIdxRef.current + 1;
    if (i < stepsRef.current.length) { applyStep(stepsRef.current[i]); setStepIdx(i); stepIdxRef.current = i; }
  };
  const handleStepBack = () => {
    const i = Math.max(0, stepIdxRef.current - 1);
    if (stepsRef.current.length) { applyStep(stepsRef.current[i]); setStepIdx(i); stepIdxRef.current = i; }
  };

  const handleCustomArray = () => {
    try {
      const parsed = customInput.split(",").map(s => { const n = parseInt(s.trim()); if (isNaN(n)) throw new Error(); return n; });
      if (parsed.length < 1 || parsed.length > 16) throw new Error("Length must be 1–16");
      setArray(parsed); setHighlights({}); setMessage("Array updated."); setInputError("");
      handleStop();
    } catch { setInputError("Invalid input. Use comma-separated integers (max 16)."); }
  };

  const handleReset = () => { setArray([4,2,7,1,9,3,6,8,5]); setHighlights({}); setMessage("Array reset."); handleStop(); setCustomInput("4,2,7,1,9,3,6,8,5"); };

  const handleRandomize = () => {
    const n = Math.floor(Math.random() * 7) + 5;
    const a = Array.from({length:n}, () => Math.floor(Math.random() * 98) + 1);
    setArray(a); setHighlights({}); setMessage("Randomized!"); handleStop();
    setCustomInput(a.join(","));
  };

  // Param labels
  const paramLabels = {
    push:      { p1:"Value to push",       p2:null },
    pop:       { p1:null,                  p2:null },
    insert:    { p1:"Index",               p2:"Value" },
    delete:    { p1:"Index to delete",     p2:null },
    update:    { p1:"Index",               p2:"New value" },
    reverse:   { p1:null,                  p2:null },
    rotate:    { p1:"Steps (right)",       p2:null },
    search:    { p1:"Target value",        p2:null },
    binary:    { p1:"Target value",        p2:null },
    bubble:    { p1:null,                  p2:null },
    selection: { p1:null,                  p2:null },
    insertion: { p1:null,                  p2:null },
  };
  const pl = paramLabels[selectedOp] || {};

  const progress = steps.length ? (stepIdx / Math.max(1, steps.length - 1)) * 100 : 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,700;9..40,800;9..40,900&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        html, body { background:${BG}; font-family:${SANS}; color:${TEXT_PRI}; overflow-x:hidden; }
        ::-webkit-scrollbar { width:3px; }
        ::-webkit-scrollbar-thumb { background:#4f46e5; border-radius:2px; }

        @keyframes cellEntry   { from{opacity:0;transform:translateY(-14px) scale(.8)} to{opacity:1;transform:none} }
        @keyframes cellPop     { 0%{transform:scale(0) rotate(-10deg)} 60%{transform:scale(1.15)} 100%{transform:scale(1)} }
        @keyframes cellShimmer { 0%{left:-80%} 100%{left:170%} }
        @keyframes fadeUp      { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
        @keyframes pulseGlow   { 0%,100%{opacity:0.6} 50%{opacity:1} }
        @keyframes spin        { to{transform:rotate(360deg)} }
        @keyframes msgSlide    { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:none} }
        @keyframes progressPulse { 0%,100%{opacity:1} 50%{opacity:.7} }
        @keyframes borderGlow  { 0%,100%{box-shadow:0 0 10px rgba(129,140,248,0.2)} 50%{box-shadow:0 0 20px rgba(129,140,248,0.5)} }
        @keyframes connectorFlow { 0%{opacity:0.3} 50%{opacity:0.8} 100%{opacity:0.3} }
        @keyframes badgePulse  { 0%,100%{transform:scale(1)} 50%{transform:scale(1.06)} }

        .op-btn { transition:all .18s cubic-bezier(.16,1,.3,1); }
        .op-btn:hover { transform:translateY(-1px); }
        .op-btn:active { transform:scale(.97); }

        .ctrl-btn { transition:all .18s cubic-bezier(.16,1,.3,1); }
        .ctrl-btn:hover:not(:disabled) { transform:translateY(-2px); }
        .ctrl-btn:active:not(:disabled) { transform:scale(.96); }
        .ctrl-btn:disabled { opacity:0.35; cursor:not-allowed; }

        .param-input {
          background:rgba(255,255,255,0.04);
          border:1px solid ${BORDER};
          border-radius:9px;
          color:${TEXT_PRI};
          font-family:${MONO};
          font-size:13px;
          padding:9px 12px;
          outline:none;
          transition:all .2s;
          width:100%;
        }
        .param-input:focus { border-color:rgba(129,140,248,0.5); background:rgba(129,140,248,0.06); box-shadow:0 0 0 3px rgba(129,140,248,0.08); }
        .param-input::placeholder { color:${TEXT_DIM}; }

        .arr-track::-webkit-scrollbar { height:3px; }
        .arr-track::-webkit-scrollbar-thumb { background:rgba(129,140,248,0.3); border-radius:2px; }

        .glass-panel {
          background:${SURFACE};
          border:1px solid ${BORDER};
          border-radius:18px;
          backdrop-filter:blur(20px);
        }

        .connector-line {
          display:flex; align-items:center; justify-content:center;
          width:18px; height:56px; flex-shrink:0;
          position:relative;
        }
        .connector-line::before {
          content:''; position:absolute;
          width:18px; height:2px;
          background:linear-gradient(to right, rgba(129,140,248,0.25), rgba(129,140,248,0.5), rgba(129,140,248,0.25));
          animation:connectorFlow 2s ease-in-out infinite;
          border-radius:1px;
        }

        @media(max-width:900px) {
          .main-layout { flex-direction:column !important; }
          .sidebar { width:100% !important; max-width:100% !important; }
        }
      `}</style>

      <div style={{minHeight:"100vh", background:BG, paddingTop:"0"}}>

        {/* ── TOPBAR ───────────────────────────────────────────────── */}
        <nav style={{
          position:"sticky", top:0, zIndex:50,
          background:"rgba(3,9,18,0.92)", backdropFilter:"blur(20px)",
          borderBottom:`1px solid ${BORDER}`,
        }}>
          <div style={{maxWidth:"1400px", margin:"0 auto", padding:"0 24px", display:"flex", alignItems:"center", justifyContent:"space-between", height:"58px"}}>
            <div style={{display:"flex", alignItems:"center", gap:"16px"}}>
              <button onClick={() => router.back()} style={{
                display:"flex", alignItems:"center", gap:"6px",
                background:"rgba(255,255,255,0.04)", border:`1px solid ${BORDER}`,
                borderRadius:"9px", padding:"6px 12px",
                color:TEXT_SEC, fontSize:"12px", fontWeight:600, cursor:"pointer",
                fontFamily:SANS, transition:"all .18s",
              }}
              onMouseEnter={e=>{e.currentTarget.style.color=ACCENT;e.currentTarget.style.borderColor="rgba(129,140,248,0.4)";}}
              onMouseLeave={e=>{e.currentTarget.style.color=TEXT_SEC;e.currentTarget.style.borderColor=BORDER;}}>
                ‹ Back
              </button>
              <div style={{display:"flex", alignItems:"center", gap:"10px"}}>
                <div style={{
                  width:"34px", height:"34px", borderRadius:"9px",
                  background:"linear-gradient(135deg, rgba(129,140,248,0.3), rgba(167,139,250,0.2))",
                  border:"1px solid rgba(129,140,248,0.4)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:"14px", fontFamily:MONO, color:ACCENT,
                  boxShadow:"0 0 16px rgba(129,140,248,0.2)",
                }}>[ ]</div>
                <div>
                  <div style={{fontFamily:MONO, fontSize:"13px", fontWeight:700, color:TEXT_PRI, lineHeight:1}}>Array</div>
                  <div style={{fontSize:"10px", color:TEXT_DIM, letterSpacing:"0.06em", textTransform:"uppercase", marginTop:"2px"}}>Data Structure</div>
                </div>
              </div>
            </div>

            <div style={{display:"flex", alignItems:"center", gap:"10px"}}>
              {/* Op count badge */}
              <div style={{
                fontFamily:MONO, fontSize:"10px", color:ACCENT2,
                background:"rgba(167,139,250,0.1)", border:"1px solid rgba(167,139,250,0.25)",
                padding:"4px 10px", borderRadius:"6px",
                display:"flex", alignItems:"center", gap:"6px",
              }}>
                <span style={{width:"5px",height:"5px",borderRadius:"50%",background:ACCENT2,boxShadow:`0 0 5px ${ACCENT2}`,animation:"badgePulse 2s infinite"}}/>
                {opCount} ops run
              </div>
              {/* Array size */}
              <div style={{fontFamily:MONO, fontSize:"10px", color:TEXT_DIM, background:"rgba(255,255,255,0.04)", border:`1px solid ${BORDER}`, padding:"4px 10px", borderRadius:"6px"}}>
                size: {array.length}
              </div>
            </div>
          </div>
        </nav>

        <div style={{maxWidth:"1400px", margin:"0 auto", padding:"20px 24px 40px"}}>

          {/* ── PAGE TITLE ───────────────────────────────────────── */}
          <div style={{textAlign:"center", marginBottom:"28px", animation:"fadeUp .5s ease-out"}}>
            <h1 style={{
              fontFamily:MONO, fontSize:"clamp(22px,3.5vw,36px)", fontWeight:700,
              color:TEXT_PRI, letterSpacing:"-0.02em", lineHeight:1.1,
            }}>
              Array{" "}
              <span style={{
                background:`linear-gradient(90deg, ${ACCENT}, ${ACCENT2}, ${CYAN})`,
                backgroundSize:"200% auto",
                WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
                backgroundClip:"text",
                display:"inline-block", paddingBottom:"0.15em", marginBottom:"-0.15em",
                animation:"progressPulse 3s ease-in-out infinite",
              }}>Visualizer</span>
            </h1>
            <p style={{color:TEXT_DIM, fontSize:"13px", marginTop:"8px", letterSpacing:"0.02em"}}>
              Interactive visualizations of all array operations · Watch algorithms execute step by step
            </p>
          </div>

          {/* ── VISUALIZATION STAGE ──────────────────────────────── */}
          <div className="glass-panel" style={{
            padding:"24px", marginBottom:"20px",
            animation:"fadeUp .5s .05s both ease-out",
            position:"relative", overflow:"hidden",
          }}>
            {/* Background grid texture */}
            <div style={{
              position:"absolute", inset:0, borderRadius:"18px",
              backgroundImage:"radial-gradient(circle, rgba(129,140,248,0.06) 1px, transparent 1px)",
              backgroundSize:"32px 32px", opacity:0.5, pointerEvents:"none",
            }}/>
            {/* Corner glows */}
            <div style={{position:"absolute",top:0,left:0,width:"200px",height:"200px",background:"radial-gradient(circle at 0% 0%,rgba(129,140,248,0.07),transparent 60%)",pointerEvents:"none"}}/>
            <div style={{position:"absolute",bottom:0,right:0,width:"200px",height:"200px",background:"radial-gradient(circle at 100% 100%,rgba(34,211,238,0.06),transparent 60%)",pointerEvents:"none"}}/>

            {/* Stage label */}
            <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"20px", position:"relative"}}>
              <div style={{display:"flex", alignItems:"center", gap:"8px"}}>
                <span style={{width:"6px",height:"6px",borderRadius:"50%",background:isRunning&&!isPaused?GREEN:isPaused?ORANGE:ACCENT,boxShadow:`0 0 8px ${isRunning&&!isPaused?GREEN:isPaused?ORANGE:ACCENT}`,animation:isRunning&&!isPaused?"badgePulse 1s infinite":"none"}}/>
                <span style={{fontFamily:MONO, fontSize:"10px", color:TEXT_DIM, letterSpacing:"0.1em", textTransform:"uppercase"}}>
                  {isRunning && !isPaused ? "Running" : isPaused ? "Paused" : "Ready"}
                </span>
              </div>
              <div style={{display:"flex", gap:"8px"}}>
                <span style={{fontFamily:MONO, fontSize:"10px", color:TEXT_DIM, background:"rgba(255,255,255,0.04)", padding:"3px 10px", borderRadius:"6px", border:`1px solid ${BORDER}`}}>
                  indices: 0…{array.length-1}
                </span>
                {steps.length > 0 && (
                  <span style={{fontFamily:MONO, fontSize:"10px", color:ACCENT, background:"rgba(129,140,248,0.08)", padding:"3px 10px", borderRadius:"6px", border:"1px solid rgba(129,140,248,0.2)"}}>
                    step {stepIdx + 1}/{steps.length}
                  </span>
                )}
              </div>
            </div>

            {/* ARRAY TRACK */}
            <div style={{
              display:"flex", justifyContent:"center",
              minHeight:"100px", alignItems:"center",
              padding:"16px 0",
            }}>
              {array.length === 0 ? (
                <div style={{color:TEXT_DIM, fontFamily:MONO, fontSize:"13px", letterSpacing:"0.08em"}}>[ empty array ]</div>
              ) : (
                <div
                  className="arr-track"
                  style={{
                    display:"flex", alignItems:"flex-end", gap:"0px",
                    overflowX:"auto", padding:"8px 16px 4px",
                    maxWidth:"100%",
                  }}
                >
                  {/* Opening bracket */}
                  <div style={{
                    fontFamily:MONO, fontSize:"40px", color:"rgba(129,140,248,0.3)",
                    lineHeight:1, paddingBottom:"18px", flexShrink:0, userSelect:"none",
                    marginRight:"4px",
                  }}>[</div>

                  {array.map((val, i) => (
                    <div key={`${i}-${val}`} style={{display:"flex", alignItems:"center", flexShrink:0}}>
                      <ArrayCell
                        value={val}
                        index={i}
                        state={highlights[i] || "normal"}
                        isNew={i === newCellIdx}
                      />
                      {i < array.length - 1 && <div className="connector-line"/>}
                    </div>
                  ))}

                  {/* Closing bracket */}
                  <div style={{
                    fontFamily:MONO, fontSize:"40px", color:"rgba(129,140,248,0.3)",
                    lineHeight:1, paddingBottom:"18px", flexShrink:0, userSelect:"none",
                    marginLeft:"4px",
                  }}>]</div>
                </div>
              )}
            </div>

            {/* Progress bar */}
            {steps.length > 0 && (
              <div style={{marginTop:"12px", position:"relative"}}>
                <div style={{height:"3px", borderRadius:"2px", background:"rgba(255,255,255,0.05)", overflow:"hidden"}}>
                  <div style={{
                    height:"100%", borderRadius:"2px",
                    width:`${progress}%`,
                    background:`linear-gradient(to right, ${ACCENT}, ${CYAN})`,
                    transition:"width .3s ease-out",
                    boxShadow:`0 0 8px ${ACCENT}80`,
                  }}/>
                </div>
              </div>
            )}

            {/* Message box */}
            <div style={{
              marginTop:"16px", padding:"12px 16px",
              background:"rgba(0,0,0,0.25)",
              border:`1px solid ${BORDER}`,
              borderRadius:"10px",
              display:"flex", alignItems:"center", gap:"10px",
              minHeight:"42px",
            }}>
              <span style={{
                fontSize:"10px", fontFamily:MONO, color:ACCENT,
                flexShrink:0, lineHeight:1,
              }}>❯</span>
              <p style={{
                fontFamily:MONO, fontSize:"12px", color:TEXT_SEC,
                lineHeight:1.5,
                animation:"msgSlide .2s ease-out",
                key:message,
              }} key={message}>{message}</p>
            </div>

            {/* Legend */}
            <div style={{display:"flex", flexWrap:"wrap", gap:"10px", marginTop:"14px", justifyContent:"flex-end"}}>
              {Object.entries(CELL_COLORS).filter(([k])=>k!=="normal").map(([state,c]) => (
                <div key={state} style={{display:"flex", alignItems:"center", gap:"5px"}}>
                  <span style={{width:"8px",height:"8px",borderRadius:"2px",background:c.bg,border:`1px solid ${c.border}`}}/>
                  <span style={{fontSize:"9px",color:TEXT_DIM,fontFamily:MONO,textTransform:"capitalize"}}>{state}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── CONTROLS + SIDEBAR LAYOUT ─────────────────────────── */}
          <div className="main-layout" style={{display:"flex", gap:"16px", alignItems:"flex-start"}}>

            {/* LEFT — Operations panel */}
            <div style={{flex:"1 1 0", minWidth:0, display:"flex", flexDirection:"column", gap:"16px"}}>

              {/* Array controls */}
              <div className="glass-panel" style={{padding:"18px", animation:"fadeUp .5s .1s both ease-out"}}>
                <div style={{fontSize:"11px",fontWeight:700,color:TEXT_DIM,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:"12px"}}>Array Controls</div>
                <div style={{display:"flex", gap:"8px", flexWrap:"wrap", marginBottom:"10px"}}>
                  {[
                    { label:"Randomize", icon:"⚄", action:handleRandomize, color:CYAN   },
                    { label:"Reset",     icon:"↺", action:handleReset,     color:ORANGE },
                  ].map(btn => (
                    <button key={btn.label} onClick={btn.action} className="ctrl-btn" style={{
                      display:"flex", alignItems:"center", gap:"6px",
                      padding:"8px 14px", borderRadius:"9px",
                      background:`${btn.color}14`, border:`1px solid ${btn.color}30`,
                      color:btn.color, fontSize:"12px", fontWeight:700,
                      cursor:"pointer", fontFamily:SANS,
                    }}>
                      <span>{btn.icon}</span>{btn.label}
                    </button>
                  ))}
                </div>
                <div style={{display:"flex", gap:"8px"}}>
                  <input
                    className="param-input"
                    value={customInput}
                    onChange={e => setCustomInput(e.target.value)}
                    placeholder="e.g. 5,2,8,1,9 (max 16 ints)"
                    style={{flex:1}}
                  />
                  <button onClick={handleCustomArray} className="ctrl-btn" style={{
                    padding:"9px 16px", borderRadius:"9px", flexShrink:0,
                    background:"rgba(129,140,248,0.15)", border:"1px solid rgba(129,140,248,0.35)",
                    color:ACCENT, fontSize:"12px", fontWeight:700, cursor:"pointer", fontFamily:SANS,
                    whiteSpace:"nowrap",
                  }}>Set Array</button>
                </div>
                {inputError && <p style={{color:RED, fontSize:"10px", fontFamily:MONO, marginTop:"6px"}}>{inputError}</p>}
              </div>

              {/* Operation selector */}
              <div className="glass-panel" style={{padding:"18px", animation:"fadeUp .5s .15s both ease-out"}}>
                <div style={{fontSize:"11px",fontWeight:700,color:TEXT_DIM,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:"14px"}}>Operations</div>
                {OP_GROUPS.map(grp => (
                  <div key={grp.id} style={{marginBottom:"14px"}}>
                    <div style={{
                      display:"flex", alignItems:"center", gap:"6px", marginBottom:"8px",
                    }}>
                      <span style={{width:"5px",height:"5px",borderRadius:"50%",background:grp.color,boxShadow:`0 0 5px ${grp.color}`}}/>
                      <span style={{fontSize:"9px",fontWeight:700,letterSpacing:"0.12em",color:grp.color,textTransform:"uppercase"}}>{grp.label}</span>
                      <div style={{flex:1,height:"1px",background:`${grp.color}20`}}/>
                    </div>
                    <div style={{display:"flex", flexWrap:"wrap", gap:"6px"}}>
                      {OPERATIONS.filter(o => o.group === grp.id).map(o => {
                        const active = selectedOp === o.id;
                        return (
                          <button
                            key={o.id}
                            onClick={() => { setSelectedOp(o.id); setParam1(""); setParam2(""); }}
                            className="op-btn"
                            style={{
                              display:"flex", alignItems:"center", gap:"6px",
                              padding:"7px 12px", borderRadius:"8px",
                              background: active ? `${o.color}1e` : "rgba(255,255,255,0.03)",
                              border:`1px solid ${active ? o.color+"55" : "rgba(255,255,255,0.06)"}`,
                              color: active ? o.color : TEXT_DIM,
                              fontSize:"12px", fontWeight: active ? 700 : 500,
                              cursor:"pointer", fontFamily:SANS,
                              boxShadow: active ? `0 2px 14px ${o.color}20` : "none",
                            }}
                          >
                            <span style={{fontFamily:MONO, fontSize:"11px", lineHeight:1}}>{o.icon}</span>
                            {o.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Params + run */}
              <div className="glass-panel" style={{padding:"18px", animation:"fadeUp .5s .2s both ease-out"}}>
                <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"14px"}}>
                  <div style={{fontSize:"11px",fontWeight:700,color:TEXT_DIM,letterSpacing:"0.12em",textTransform:"uppercase"}}>
                    Configure: <span style={{color:op?.color}}>{op?.label}</span>
                  </div>
                  {/* Complexity pills */}
                  <div style={{display:"flex", gap:"6px"}}>
                    <span style={{fontFamily:MONO,fontSize:"9px",color:CYAN,background:"rgba(34,211,238,0.1)",border:"1px solid rgba(34,211,238,0.2)",padding:"2px 8px",borderRadius:"5px"}}>
                      Time: {OP_COMPLEXITY[selectedOp]}
                    </span>
                    <span style={{fontFamily:MONO,fontSize:"9px",color:GREEN,background:"rgba(52,211,153,0.1)",border:"1px solid rgba(52,211,153,0.2)",padding:"2px 8px",borderRadius:"5px"}}>
                      Space: {OP_SPACE[selectedOp]}
                    </span>
                  </div>
                </div>

                <div style={{display:"flex", gap:"10px", flexWrap:"wrap", marginBottom:"14px"}}>
                  {pl.p1 && (
                    <div style={{flex:"1 1 120px"}}>
                      <label style={{display:"block",fontSize:"10px",color:TEXT_DIM,fontFamily:MONO,marginBottom:"6px",letterSpacing:"0.06em"}}>{pl.p1}</label>
                      <input className="param-input" type="number" value={param1} onChange={e=>setParam1(e.target.value)} placeholder="0"/>
                    </div>
                  )}
                  {pl.p2 && (
                    <div style={{flex:"1 1 120px"}}>
                      <label style={{display:"block",fontSize:"10px",color:TEXT_DIM,fontFamily:MONO,marginBottom:"6px",letterSpacing:"0.06em"}}>{pl.p2}</label>
                      <input className="param-input" type="number" value={param2} onChange={e=>setParam2(e.target.value)} placeholder="0"/>
                    </div>
                  )}
                  {!pl.p1 && !pl.p2 && (
                    <p style={{color:TEXT_DIM,fontSize:"12px",fontFamily:MONO,padding:"8px 0"}}>No parameters needed.</p>
                  )}
                </div>

                {/* Speed */}
                <div style={{marginBottom:"14px"}}>
                  <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"6px"}}>
                    <label style={{fontSize:"10px",color:TEXT_DIM,fontFamily:MONO,letterSpacing:"0.06em"}}>Speed: {speed}×</label>
                    <span style={{fontSize:"9px",color:TEXT_DIM,fontFamily:MONO}}>slower ←→ faster</span>
                  </div>
                  <input
                    type="range" min="0.25" max="4" step="0.25" value={speed}
                    onChange={e => setSpeed(Number(e.target.value))}
                    style={{width:"100%", accentColor:ACCENT, cursor:"pointer"}}
                  />
                </div>

                {/* Step mode toggle */}
                <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"16px",padding:"10px 12px",background:"rgba(255,255,255,0.03)",borderRadius:"9px",border:`1px solid ${BORDER}`}}>
                  <div
                    onClick={() => { if (!isRunning) setStepMode(s => !s); }}
                    style={{
                      width:"36px", height:"20px", borderRadius:"10px",
                      background: stepMode ? "rgba(129,140,248,0.4)" : "rgba(255,255,255,0.08)",
                      border:`1px solid ${stepMode ? ACCENT+"60" : BORDER}`,
                      cursor:"pointer", position:"relative", transition:"all .2s",
                      flexShrink:0,
                    }}
                  >
                    <div style={{
                      position:"absolute", top:"2px",
                      left: stepMode ? "18px" : "2px",
                      width:"14px", height:"14px", borderRadius:"50%",
                      background: stepMode ? ACCENT : TEXT_DIM,
                      transition:"all .2s cubic-bezier(.16,1,.3,1)",
                      boxShadow: stepMode ? `0 0 8px ${ACCENT}80` : "none",
                    }}/>
                  </div>
                  <div>
                    <div style={{fontSize:"12px",fontWeight:600,color:stepMode?TEXT_PRI:TEXT_DIM,transition:"color .2s"}}>Step Mode</div>
                    <div style={{fontSize:"10px",color:TEXT_DIM}}>Execute one step at a time</div>
                  </div>
                </div>

                {/* Playback controls */}
                <div style={{display:"flex", gap:"8px"}}>
                  {/* Run / Execute */}
                  <button
                    onClick={handleRun}
                    disabled={isRunning && !stepMode}
                    className="ctrl-btn"
                    style={{
                      flex:1, padding:"12px", borderRadius:"11px",
                      background: isRunning && !stepMode
                        ? "rgba(255,255,255,0.04)"
                        : `linear-gradient(135deg, ${op?.color || ACCENT}cc, ${op?.color || ACCENT}88)`,
                      border:`1px solid ${isRunning && !stepMode ? BORDER : (op?.color || ACCENT)+"60"}`,
                      color: isRunning && !stepMode ? TEXT_DIM : "#fff",
                      fontSize:"13px", fontWeight:800,
                      cursor: isRunning && !stepMode ? "not-allowed" : "pointer",
                      fontFamily:SANS, letterSpacing:"0.01em",
                      boxShadow: isRunning && !stepMode ? "none" : `0 4px 20px ${op?.color || ACCENT}30`,
                      display:"flex", alignItems:"center", justifyContent:"center", gap:"8px",
                    }}
                  >
                    {isRunning && !stepMode && !isPaused ? (
                      <><span style={{display:"inline-block",animation:"spin 1s linear infinite",fontSize:"14px"}}>◌</span> Running…</>
                    ) : stepMode ? (
                      <><span>▷</span> Init</>
                    ) : (
                      <><span>{op?.icon}</span> Run {op?.label}</>
                    )}
                  </button>

                  {/* Pause/Resume */}
                  {!stepMode && (
                    <button onClick={handlePause} disabled={!isRunning} className="ctrl-btn" style={{
                      padding:"12px 14px", borderRadius:"11px",
                      background: isPaused ? "rgba(251,146,60,0.15)" : "rgba(255,255,255,0.05)",
                      border:`1px solid ${isPaused ? ORANGE+"50" : BORDER}`,
                      color: isPaused ? ORANGE : TEXT_DIM,
                      fontSize:"16px", cursor:"pointer",
                    }}>
                      {isPaused ? "▶" : "⏸"}
                    </button>
                  )}

                  {/* Step back/forward — step mode only */}
                  {stepMode && (
                    <>
                      <button onClick={handleStepBack} disabled={stepIdx <= 0 || !steps.length} className="ctrl-btn" style={{
                        padding:"12px 14px", borderRadius:"11px",
                        background:"rgba(255,255,255,0.05)", border:`1px solid ${BORDER}`,
                        color:TEXT_SEC, fontSize:"14px", cursor:"pointer",
                      }}>‹</button>
                      <button onClick={handleStepForward} disabled={!steps.length || stepIdx >= steps.length-1} className="ctrl-btn" style={{
                        padding:"12px 14px", borderRadius:"11px",
                        background:"rgba(129,140,248,0.12)", border:"1px solid rgba(129,140,248,0.3)",
                        color:ACCENT, fontSize:"14px", cursor:"pointer",
                      }}>›</button>
                    </>
                  )}

                  {/* Stop */}
                  <button onClick={handleStop} disabled={!isRunning && !isPaused} className="ctrl-btn" style={{
                    padding:"12px 14px", borderRadius:"11px",
                    background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.3)",
                    color:RED, fontSize:"14px", cursor:"pointer",
                  }}>■</button>
                </div>
              </div>
            </div>

            {/* RIGHT — Sidebar info */}
            <div className="sidebar" style={{width:"280px", flexShrink:0, display:"flex", flexDirection:"column", gap:"16px"}}>

              {/* Complexity reference */}
              <div className="glass-panel" style={{padding:"18px", animation:"fadeUp .5s .25s both ease-out"}}>
                <div style={{fontSize:"11px",fontWeight:700,color:TEXT_DIM,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:"14px"}}>Complexity Reference</div>
                <div style={{display:"flex", flexDirection:"column", gap:"6px"}}>
                  {[
                    { op:"Access", time:"O(1)",     space:"O(1)", color:GREEN  },
                    { op:"Search", time:"O(n)",     space:"O(1)", color:CYAN   },
                    { op:"Insert", time:"O(n)",     space:"O(1)", color:ACCENT },
                    { op:"Delete", time:"O(n)",     space:"O(1)", color:ORANGE },
                    { op:"Push",   time:"O(1)*",    space:"O(1)", color:PINK   },
                    { op:"Pop",    time:"O(1)",     space:"O(1)", color:RED    },
                  ].map(row => (
                    <div key={row.op} style={{
                      display:"flex", alignItems:"center", justifyContent:"space-between",
                      padding:"7px 10px", borderRadius:"8px",
                      background:"rgba(255,255,255,0.02)",
                      border:`1px solid ${row.color}18`,
                    }}>
                      <span style={{fontFamily:MONO,fontSize:"11px",color:row.color,fontWeight:700}}>{row.op}</span>
                      <div style={{display:"flex",gap:"8px"}}>
                        <span style={{fontFamily:MONO,fontSize:"10px",color:TEXT_DIM}}>T:{row.time}</span>
                        <span style={{fontFamily:MONO,fontSize:"10px",color:TEXT_DIM}}>S:{row.space}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <p style={{fontSize:"9px",color:TEXT_DIM,fontFamily:MONO,marginTop:"8px"}}>* amortized</p>
              </div>

              {/* Array properties */}
              <div className="glass-panel" style={{padding:"18px", animation:"fadeUp .5s .3s both ease-out"}}>
                <div style={{fontSize:"11px",fontWeight:700,color:TEXT_DIM,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:"14px"}}>Array Properties</div>
                <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
                  {[
                    { label:"Length",  value:array.length,                        color:ACCENT },
                    { label:"Min",     value:array.length ? Math.min(...array) : "—", color:GREEN  },
                    { label:"Max",     value:array.length ? Math.max(...array) : "—", color:PINK   },
                    { label:"Sum",     value:array.length ? array.reduce((a,b)=>a+b,0) : "—", color:CYAN   },
                    { label:"Is Sorted",value:array.length >= 2 && array.every((v,i,a)=>i===0||v>=a[i-1]) ? "✓ Yes" : array.length < 2 ? "—" : "✗ No", color:ORANGE },
                  ].map(p => (
                    <div key={p.label} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${BORDER}`}}>
                      <span style={{fontSize:"11px",color:TEXT_DIM,fontFamily:MONO}}>{p.label}</span>
                      <span style={{fontSize:"12px",fontWeight:700,color:p.color,fontFamily:MONO}}>{String(p.value)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Operation history */}
              <div className="glass-panel" style={{padding:"18px", animation:"fadeUp .5s .35s both ease-out"}}>
                <div style={{fontSize:"11px",fontWeight:700,color:TEXT_DIM,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:"14px"}}>History</div>
                {history.length === 0 ? (
                  <p style={{fontSize:"11px",color:TEXT_DIM,fontFamily:MONO}}>No operations yet.</p>
                ) : (
                  <div style={{display:"flex",flexDirection:"column",gap:"5px"}}>
                    {history.map((h, i) => {
                      const o = OPERATIONS.find(op => op.label === h.op);
                      return (
                        <div key={i} style={{
                          display:"flex",alignItems:"center",justifyContent:"space-between",
                          padding:"6px 9px",borderRadius:"7px",
                          background:"rgba(255,255,255,0.02)",
                          border:`1px solid ${BORDER}`,
                          opacity: 1 - i * 0.1,
                        }}>
                          <div style={{display:"flex",alignItems:"center",gap:"6px"}}>
                            <span style={{fontFamily:MONO,fontSize:"10px",color:o?.color||ACCENT}}>{o?.icon}</span>
                            <span style={{fontSize:"11px",color:TEXT_SEC,fontWeight:500}}>{h.op}</span>
                          </div>
                          <span style={{fontSize:"9px",color:TEXT_DIM,fontFamily:MONO}}>{h.time}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Quick concepts */}
              <div className="glass-panel" style={{padding:"18px", animation:"fadeUp .5s .4s both ease-out"}}>
                <div style={{fontSize:"11px",fontWeight:700,color:TEXT_DIM,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:"14px"}}>Key Concepts</div>
                {[
                  { title:"Contiguous Memory", desc:"Array elements are stored in adjacent memory locations, enabling O(1) random access via index arithmetic.", color:ACCENT },
                  { title:"Cache Friendly", desc:"Sequential memory layout means excellent cache performance — iterating arrays is fast due to hardware prefetching.", color:CYAN },
                  { title:"Fixed vs Dynamic", desc:"Static arrays have fixed size. Dynamic arrays (like Python lists) resize by doubling capacity when full — O(1) amortized push.", color:GREEN },
                ].map(c => (
                  <div key={c.title} style={{marginBottom:"12px",paddingBottom:"12px",borderBottom:`1px solid ${BORDER}`}}>
                    <div style={{display:"flex",alignItems:"center",gap:"6px",marginBottom:"4px"}}>
                      <span style={{width:"5px",height:"5px",borderRadius:"50%",background:c.color,flexShrink:0}}/>
                      <span style={{fontSize:"11px",fontWeight:700,color:c.color}}>{c.title}</span>
                    </div>
                    <p style={{fontSize:"10px",color:TEXT_DIM,lineHeight:1.55,paddingLeft:"11px"}}>{c.desc}</p>
                  </div>
                ))}
              </div>

            </div>
          </div>

          {/* ── MEMORY MODEL VISUALIZATION ───────────────────────── */}
          <div className="glass-panel" style={{padding:"22px", marginTop:"16px", animation:"fadeUp .5s .45s both ease-out"}}>
            <div style={{fontSize:"11px",fontWeight:700,color:TEXT_DIM,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:"16px",display:"flex",alignItems:"center",gap:"8px"}}>
              <span>Memory Model</span>
              <span style={{fontSize:"9px",fontWeight:400,color:TEXT_DIM,background:"rgba(255,255,255,0.04)",border:`1px solid ${BORDER}`,padding:"2px 8px",borderRadius:"4px"}}>
                contiguous allocation simulation
              </span>
            </div>
            <div style={{overflowX:"auto"}}>
              <div style={{display:"flex", gap:"0", minWidth:"max-content"}}>
                {/* Base address label */}
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",marginRight:"4px"}}>
                  <div style={{height:"28px",display:"flex",alignItems:"center"}}>
                    <span style={{fontFamily:MONO,fontSize:"9px",color:TEXT_DIM}}>0x1000</span>
                  </div>
                </div>
                {array.map((val, i) => {
                  const state = highlights[i] || "normal";
                  const c = CELL_COLORS[state];
                  const addr = (0x1000 + i * 4).toString(16).toUpperCase();
                  return (
                    <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",minWidth:"64px"}}>
                      {/* Address */}
                      <div style={{
                        height:"22px", display:"flex",alignItems:"center",
                        fontSize:"8px",fontFamily:MONO,color:state!=="normal"?c.text:TEXT_DIM,
                        transition:"color .3s",
                      }}>0x{addr}</div>
                      {/* Cell */}
                      <div style={{
                        width:"60px", height:"36px",
                        display:"flex",alignItems:"center",justifyContent:"center",
                        background:c.bg, border:`1px solid ${c.border}`,
                        borderRight: i < array.length - 1 ? "none" : `1px solid ${c.border}`,
                        fontFamily:MONO, fontSize:"13px", fontWeight:700, color:c.text,
                        transition:"all .28s",
                        boxShadow: state !== "normal" ? `0 0 12px ${c.glow}` : "none",
                        position:"relative",
                      }}>
                        {val}
                        {i === 0 && (
                          <div style={{
                            position:"absolute",top:"-1px",left:"-1px",
                            fontSize:"8px",fontFamily:MONO,color:ACCENT,
                            background:BG, padding:"1px 3px", borderRadius:"0 0 4px 0",
                            lineHeight:1, border:`1px solid ${ACCENT}40`,
                          }}>▲</div>
                        )}
                      </div>
                      {/* Byte size label */}
                      <div style={{height:"16px",display:"flex",alignItems:"center"}}>
                        <span style={{fontSize:"7px",fontFamily:MONO,color:TEXT_DIM}}>4B</span>
                      </div>
                      {/* Index */}
                      <div style={{fontSize:"9px",fontFamily:MONO,color:state!=="normal"?c.text:TEXT_DIM,transition:"color .3s"}}>[{i}]</div>
                    </div>
                  );
                })}
                {/* Arrow showing next free slot */}
                {array.length < 16 && (
                  <div style={{display:"flex",flexDirection:"column",alignItems:"center",minWidth:"64px"}}>
                    <div style={{height:"22px"}}/>
                    <div style={{
                      width:"60px",height:"36px",
                      display:"flex",alignItems:"center",justifyContent:"center",
                      background:"rgba(255,255,255,0.02)",
                      border:`1px dashed ${BORDER}`,
                      fontFamily:MONO,fontSize:"10px",color:TEXT_DIM,
                    }}>…</div>
                    <div style={{height:"16px"}}/>
                    <div style={{fontSize:"9px",fontFamily:MONO,color:TEXT_DIM}}>[{array.length}]</div>
                  </div>
                )}
              </div>
            </div>
            <div style={{display:"flex",gap:"16px",marginTop:"12px",flexWrap:"wrap"}}>
              <span style={{fontFamily:MONO,fontSize:"9px",color:TEXT_DIM}}>▲ = base pointer &nbsp;|&nbsp; 4B = 4 bytes per int &nbsp;|&nbsp; addr[i] = base + i × 4</span>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}