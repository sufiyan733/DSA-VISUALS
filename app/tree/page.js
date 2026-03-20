"use client";

import { useState, useRef, useEffect, useCallback } from "react";

// ─── Tree Node ───────────────────────────────────────────────────────────────
class TreeNode {
  constructor(val) {
    this.val = val;
    this.left = null;
    this.right = null;
    this.id = Math.random().toString(36).slice(2);
  }
}

// ─── Parse & Execute user code to extract tree steps ─────────────────────────
function parseAndRunCode(code, lang) {
  const steps = [];
  const errors = [];

  try {
    // We support JS/Python/Java/C++ as display options
    // We actually execute only JS (safely sandboxed via Function)
    // For other langs we parse insert/search patterns via regex heuristics

    if (lang === "javascript" || lang === "typescript") {
      // intercept BST operations
      const insertCalls = [];
      const searchCalls = [];
      const deleteCalls = [];

      // Match: insert(val), tree.insert(val), bst.insert(val)
      const insertRe = /(?:insert|add|push)\s*\(\s*(\d+)\s*\)/g;
      const searchRe = /(?:search|find|contains|has)\s*\(\s*(\d+)\s*\)/g;
      const deleteRe = /(?:delete|remove)\s*\(\s*(\d+)\s*\)/g;

      let m;
      while ((m = insertRe.exec(code)) !== null) insertCalls.push(+m[1]);
      while ((m = searchRe.exec(code)) !== null) searchCalls.push(+m[1]);
      while ((m = deleteRe.exec(code)) !== null) deleteCalls.push(+m[1]);

      if (insertCalls.length === 0 && searchCalls.length === 0 && deleteCalls.length === 0) {
        errors.push("No recognizable BST operations found (insert/search/delete).");
        return { steps, errors };
      }

      // Build tree step by step
      let root = null;

      const bstInsert = (node, val) => {
        if (!node) return new TreeNode(val);
        if (val < node.val) node.left = bstInsert(node.left, val);
        else if (val > node.val) node.right = bstInsert(node.right, val);
        return node;
      };

      const cloneTree = (node) => {
        if (!node) return null;
        const n = new TreeNode(node.val);
        n.id = node.id;
        n.left = cloneTree(node.left);
        n.right = cloneTree(node.right);
        return n;
      };

      const pathToNode = (node, val, path = []) => {
        if (!node) return null;
        path.push(node.val);
        if (val === node.val) return path;
        if (val < node.val) return pathToNode(node.left, val, path);
        return pathToNode(node.right, val, path);
      };

      for (const val of insertCalls) {
        root = bstInsert(root, val);
        steps.push({
          type: "insert",
          value: val,
          tree: cloneTree(root),
          highlight: [val],
          path: pathToNode(cloneTree(root), val),
          message: `Inserting ${val} into the BST`,
        });
      }

      for (const val of searchCalls) {
        const path = pathToNode(cloneTree(root), val);
        steps.push({
          type: "search",
          value: val,
          tree: cloneTree(root),
          highlight: path || [],
          path: path,
          found: !!path,
          message: path
            ? `Searching for ${val} → Found! Path: ${path.join(" → ")}`
            : `Searching for ${val} → Not found`,
        });
      }

      for (const val of deleteCalls) {
        const bstDelete = (node, v) => {
          if (!node) return null;
          if (v < node.val) { node.left = bstDelete(node.left, v); return node; }
          if (v > node.val) { node.right = bstDelete(node.right, v); return node; }
          if (!node.left) return node.right;
          if (!node.right) return node.left;
          let succ = node.right;
          while (succ.left) succ = succ.left;
          node.val = succ.val;
          node.right = bstDelete(node.right, succ.val);
          return node;
        };
        root = bstDelete(root, val);
        steps.push({
          type: "delete",
          value: val,
          tree: cloneTree(root),
          highlight: [],
          message: `Deleted ${val} from the BST`,
        });
      }
    } else {
      // For Python / Java / C++ — same regex heuristic
      const insertRe = /(?:insert|add|push)\s*\(\s*(\d+)\s*\)/g;
      const searchRe = /(?:search|find|contains)\s*\(\s*(\d+)\s*\)/g;
      let m;
      const insertCalls = [];
      const searchCalls = [];
      while ((m = insertRe.exec(code)) !== null) insertCalls.push(+m[1]);
      while ((m = searchRe.exec(code)) !== null) searchCalls.push(+m[1]);

      if (insertCalls.length === 0) {
        errors.push("No recognizable insert(val) calls found.");
        return { steps, errors };
      }

      let root = null;
      const bstInsert = (node, val) => {
        if (!node) return new TreeNode(val);
        if (val < node.val) node.left = bstInsert(node.left, val);
        else if (val > node.val) node.right = bstInsert(node.right, val);
        return node;
      };
      const cloneTree = (node) => {
        if (!node) return null;
        const n = new TreeNode(node.val);
        n.id = node.id;
        n.left = cloneTree(node.left);
        n.right = cloneTree(node.right);
        return n;
      };
      const pathToNode = (node, val, path = []) => {
        if (!node) return null;
        path.push(node.val);
        if (val === node.val) return path;
        if (val < node.val) return pathToNode(node.left, val, path);
        return pathToNode(node.right, val, path);
      };

      for (const val of insertCalls) {
        root = bstInsert(root, val);
        steps.push({
          type: "insert",
          value: val,
          tree: cloneTree(root),
          highlight: [val],
          path: pathToNode(cloneTree(root), val),
          message: `Inserting ${val}`,
        });
      }
      for (const val of searchCalls) {
        const path = pathToNode(cloneTree(root), val);
        steps.push({
          type: "search",
          value: val,
          tree: cloneTree(root),
          highlight: path || [],
          path,
          found: !!path,
          message: path ? `Found ${val}! Path: ${path.join(" → ")}` : `${val} not found`,
        });
      }
    }
  } catch (e) {
    errors.push(e.message);
  }

  return { steps, errors };
}

// ─── Layout: assign x/y to each node ─────────────────────────────────────────
function layoutTree(root) {
  const positions = {};
  let counter = 0;
  const inorder = (node) => {
    if (!node) return;
    inorder(node.left);
    positions[node.id] = { x: counter++, y: 0 };
    inorder(node.right);
  };
  const setDepth = (node, depth) => {
    if (!node) return;
    positions[node.id].y = depth;
    setDepth(node.left, depth + 1);
    setDepth(node.right, depth + 1);
  };
  inorder(root);
  setDepth(root, 0);
  return positions;
}

// ─── SVG Tree Renderer ────────────────────────────────────────────────────────
function TreeViz({ tree, highlight = [], animKey }) {
  const W = 700, H = 380;
  const NODE_R = 26;

  if (!tree) {
    return (
      <div className="tree-empty">
        <span>Tree will appear here</span>
      </div>
    );
  }

  const positions = layoutTree(tree);
  const nodes = [];
  const edges = [];

  const maxX = Math.max(...Object.values(positions).map((p) => p.x));
  const maxY = Math.max(...Object.values(positions).map((p) => p.y));

  const px = (x) => ((x / (maxX || 1)) * (W - 120)) + 60;
  const py = (y) => y * 72 + 48;

  const collectNodes = (node) => {
    if (!node) return;
    nodes.push(node);
    if (node.left) {
      edges.push({ from: node.id, to: node.left.id });
      collectNodes(node.left);
    }
    if (node.right) {
      edges.push({ from: node.id, to: node.right.id });
      collectNodes(node.right);
    }
  };
  collectNodes(tree);

  const svgH = (maxY + 1) * 72 + 80;

  return (
    <svg
      key={animKey}
      viewBox={`0 0 ${W} ${svgH}`}
      width="100%"
      style={{ maxHeight: 420, overflow: "visible" }}
    >
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id="nodeGrad" cx="35%" cy="30%">
          <stop offset="0%" stopColor="#7ee8fa" />
          <stop offset="100%" stopColor="#1a6cf7" />
        </radialGradient>
        <radialGradient id="hlGrad" cx="35%" cy="30%">
          <stop offset="0%" stopColor="#ffd98a" />
          <stop offset="100%" stopColor="#ff6b35" />
        </radialGradient>
      </defs>

      {/* Edges */}
      {edges.map((e) => {
        const fp = positions[e.from];
        const tp = positions[e.to];
        const isHighlighted =
          highlight.includes(nodes.find((n) => n.id === e.from)?.val) &&
          highlight.includes(nodes.find((n) => n.id === e.to)?.val);
        return (
          <line
            key={`${e.from}-${e.to}`}
            x1={px(fp.x)} y1={py(fp.y)}
            x2={px(tp.x)} y2={py(tp.y)}
            stroke={isHighlighted ? "#ff6b35" : "#334155"}
            strokeWidth={isHighlighted ? 3 : 1.5}
            strokeOpacity={isHighlighted ? 1 : 0.5}
            filter={isHighlighted ? "url(#glow)" : undefined}
            className="tree-edge"
          />
        );
      })}

      {/* Nodes */}
      {nodes.map((node) => {
        const pos = positions[node.id];
        const isHL = highlight.includes(node.val);
        return (
          <g key={node.id} className="tree-node-group">
            <circle
              cx={px(pos.x)} cy={py(pos.y)}
              r={NODE_R}
              fill={isHL ? "url(#hlGrad)" : "url(#nodeGrad)"}
              stroke={isHL ? "#ffd98a" : "#4aaeff"}
              strokeWidth={isHL ? 2.5 : 1.5}
              filter={isHL ? "url(#glow)" : undefined}
              className={isHL ? "node-highlight" : "node-normal"}
            />
            <text
              x={px(pos.x)} y={py(pos.y)}
              textAnchor="middle"
              dominantBaseline="central"
              fill="white"
              fontSize="14"
              fontWeight="700"
              fontFamily="'JetBrains Mono', monospace"
            >
              {node.val}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Code templates ───────────────────────────────────────────────────────────
const TEMPLATES = {
  javascript: `// Binary Search Tree - JavaScript
class BST {
  constructor() { this.root = null; }

  insert(val) { /* ... */ }
  search(val) { /* ... */ }
}

const tree = new BST();
tree.insert(50);
tree.insert(30);
tree.insert(70);
tree.insert(20);
tree.insert(40);
tree.insert(60);
tree.insert(80);
tree.search(40);
tree.search(99);
`,
  python: `# Binary Search Tree - Python
class BST:
    def insert(self, val): pass
    def search(self, val): pass

tree = BST()
tree.insert(50)
tree.insert(30)
tree.insert(70)
tree.insert(20)
tree.insert(40)
tree.search(40)
tree.search(99)
`,
  java: `// Binary Search Tree - Java
public class BST {
    void insert(int val) {}
    boolean search(int val) { return false; }

    public static void main(String[] args) {
        BST tree = new BST();
        tree.insert(50);
        tree.insert(30);
        tree.insert(70);
        tree.insert(20);
        tree.search(30);
    }
}
`,
  cpp: `// Binary Search Tree - C++
#include <iostream>
using namespace std;

struct BST {
    void insert(int val) {}
    bool search(int val) { return false; }
};

int main() {
    BST tree;
    tree.insert(50);
    tree.insert(30);
    tree.insert(70);
    tree.insert(40);
    tree.search(30);
    return 0;
}
`,
};

const LANG_LABELS = {
  javascript: "JavaScript",
  typescript: "TypeScript",
  python: "Python",
  java: "Java",
  cpp: "C++",
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TreeDSPage() {
  const [lang, setLang] = useState("javascript");
  const [code, setCode] = useState(TEMPLATES["javascript"]);
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [error, setError] = useState("");
  const [running, setRunning] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const [done, setDone] = useState(false);
  const intervalRef = useRef(null);
  const textareaRef = useRef(null);

  const handleLangChange = (l) => {
    setLang(l);
    setCode(TEMPLATES[l] || "");
    reset();
  };

  const reset = () => {
    clearInterval(intervalRef.current);
    setSteps([]);
    setCurrentStep(-1);
    setError("");
    setRunning(false);
    setDone(false);
  };

  const handleRun = () => {
    reset();
    const { steps: s, errors } = parseAndRunCode(code, lang);
    if (errors.length > 0) {
      setError(errors.join("\n"));
      return;
    }
    if (s.length === 0) {
      setError("No BST operations detected. Use insert(val), search(val), or delete(val).");
      return;
    }
    setSteps(s);
    setRunning(true);
    setCurrentStep(0);
    setAnimKey((k) => k + 1);
  };

  useEffect(() => {
    if (!running || steps.length === 0) return;
    intervalRef.current = setInterval(() => {
      setCurrentStep((prev) => {
        const next = prev + 1;
        setAnimKey((k) => k + 1);
        if (next >= steps.length) {
          clearInterval(intervalRef.current);
          setRunning(false);
          setDone(true);
          return prev;
        }
        return next;
      });
    }, 1400);
    return () => clearInterval(intervalRef.current);
  }, [running, steps]);

  const step = steps[currentStep] || null;

  // Tab key support in textarea
  const handleKeyDown = (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const s = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newVal = code.substring(0, s) + "  " + code.substring(end);
      setCode(newVal);
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = s + 2;
          textareaRef.current.selectionEnd = s + 2;
        }
      });
    }
  };

  const opColor = {
    insert: "#4aaeff",
    search: "#ffd98a",
    delete: "#ff6b6b",
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Syne:wght@700;800&family=Inter:wght@400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #050a14;
          color: #e2e8f0;
          font-family: 'Inter', sans-serif;
          min-height: 100vh;
        }

        .page {
          min-height: 100vh;
          background: radial-gradient(ellipse at 20% 10%, #0d1f3c 0%, #050a14 60%),
                      radial-gradient(ellipse at 80% 80%, #0a1628 0%, transparent 60%);
          padding: 0 0 60px;
        }

        /* Header */
        .header {
          border-bottom: 1px solid #1a2744;
          padding: 22px 48px;
          display: flex;
          align-items: center;
          gap: 18px;
          background: rgba(5,10,20,0.8);
          backdrop-filter: blur(12px);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .header-icon {
          width: 40px; height: 40px;
          background: linear-gradient(135deg, #1a6cf7, #7ee8fa);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 20px;
          box-shadow: 0 0 20px rgba(26,108,247,0.4);
        }

        .header-title {
          font-family: 'Syne', sans-serif;
          font-size: 22px;
          font-weight: 800;
          letter-spacing: -0.5px;
          background: linear-gradient(90deg, #7ee8fa, #4aaeff, #a78bfa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .header-sub {
          font-size: 12px;
          color: #4a6080;
          font-family: 'JetBrains Mono', monospace;
          margin-top: 2px;
        }

        .header-badge {
          margin-left: auto;
          background: rgba(26,108,247,0.15);
          border: 1px solid rgba(74,174,255,0.3);
          color: #4aaeff;
          font-size: 11px;
          font-family: 'JetBrains Mono', monospace;
          padding: 5px 12px;
          border-radius: 20px;
        }

        /* Main Layout */
        .main {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          padding: 28px 48px;
          max-width: 1400px;
          margin: 0 auto;
        }

        @media (max-width: 900px) {
          .main { grid-template-columns: 1fr; padding: 20px 16px; }
          .header { padding: 16px 20px; }
        }

        /* Panel */
        .panel {
          background: rgba(10,18,35,0.7);
          border: 1px solid #1a2744;
          border-radius: 16px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .panel-header {
          padding: 14px 20px;
          border-bottom: 1px solid #1a2744;
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(15,25,50,0.6);
        }

        .panel-dot {
          width: 10px; height: 10px;
          border-radius: 50%;
        }

        .panel-title {
          font-size: 12px;
          font-family: 'JetBrains Mono', monospace;
          color: #6888aa;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        /* Lang selector */
        .lang-row {
          display: flex;
          gap: 6px;
          padding: 14px 18px;
          border-bottom: 1px solid #0f1e3a;
          flex-wrap: wrap;
        }

        .lang-btn {
          padding: 5px 14px;
          border-radius: 6px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          cursor: pointer;
          border: 1px solid #1a2744;
          background: transparent;
          color: #4a6080;
          transition: all 0.18s;
        }

        .lang-btn:hover { color: #7ee8fa; border-color: #2a4070; }

        .lang-btn.active {
          background: rgba(26,108,247,0.2);
          border-color: #4aaeff;
          color: #7ee8fa;
        }

        /* Editor */
        .editor-area {
          flex: 1;
          position: relative;
        }

        .code-textarea {
          width: 100%;
          height: 100%;
          min-height: 320px;
          padding: 18px 20px;
          background: transparent;
          border: none;
          outline: none;
          color: #c5daf0;
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          line-height: 1.7;
          resize: vertical;
          caret-color: #4aaeff;
        }

        .code-textarea::selection { background: rgba(74,174,255,0.2); }

        .code-textarea::placeholder { color: #2a4060; }

        /* Run button */
        .run-row {
          padding: 14px 18px;
          border-top: 1px solid #0f1e3a;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .run-btn {
          padding: 10px 28px;
          border-radius: 8px;
          background: linear-gradient(135deg, #1a6cf7, #4aaeff);
          border: none;
          color: white;
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 0 18px rgba(26,108,247,0.35);
          position: relative;
          overflow: hidden;
        }

        .run-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 0 30px rgba(74,174,255,0.5);
        }

        .run-btn:active { transform: translateY(0); }

        .run-btn.running {
          background: linear-gradient(135deg, #1a3060, #2a5090);
          animation: pulse-btn 1s infinite;
        }

        @keyframes pulse-btn {
          0%, 100% { box-shadow: 0 0 18px rgba(26,108,247,0.35); }
          50% { box-shadow: 0 0 36px rgba(74,174,255,0.7); }
        }

        .reset-btn {
          padding: 10px 18px;
          border-radius: 8px;
          background: transparent;
          border: 1px solid #1a2744;
          color: #4a6080;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .reset-btn:hover { color: #ff6b6b; border-color: #ff6b6b; }

        /* Error */
        .error-box {
          margin: 14px 18px;
          padding: 14px 16px;
          background: rgba(255,80,80,0.08);
          border: 1px solid rgba(255,100,100,0.25);
          border-radius: 10px;
          color: #ff8888;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          line-height: 1.6;
        }

        .error-title {
          font-weight: 700;
          margin-bottom: 6px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* Viz panel */
        .viz-body {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .tree-canvas {
          flex: 1;
          padding: 20px;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          min-height: 280px;
          position: relative;
        }

        .tree-empty {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 200px;
          color: #1e3050;
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          border: 1px dashed #1a2744;
          border-radius: 12px;
        }

        /* Node animations */
        .node-normal {
          transition: all 0.4s ease;
        }

        .node-highlight {
          animation: node-pop 0.5s cubic-bezier(0.34,1.56,0.64,1);
        }

        @keyframes node-pop {
          0% { r: 10; opacity: 0.3; }
          60% { r: 32; }
          100% { r: 26; opacity: 1; }
        }

        .tree-edge {
          transition: all 0.3s ease;
        }

        /* Step info */
        .step-info {
          padding: 14px 20px;
          border-top: 1px solid #0f1e3a;
          background: rgba(8,15,30,0.5);
        }

        .step-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          border-radius: 20px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 8px;
          animation: badge-in 0.3s ease;
        }

        @keyframes badge-in {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .step-message {
          font-size: 13px;
          color: #8899bb;
          font-family: 'JetBrains Mono', monospace;
          animation: msg-in 0.3s ease;
        }

        @keyframes msg-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        /* Progress bar */
        .progress-row {
          padding: 10px 20px;
          border-top: 1px solid #0f1e3a;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .progress-track {
          flex: 1;
          height: 4px;
          background: #0f1e3a;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #1a6cf7, #7ee8fa);
          border-radius: 4px;
          transition: width 0.4s ease;
          box-shadow: 0 0 8px rgba(74,174,255,0.5);
        }

        .progress-text {
          font-size: 11px;
          font-family: 'JetBrains Mono', monospace;
          color: #2a4060;
          white-space: nowrap;
        }

        /* Done celebration */
        .done-banner {
          padding: 16px 20px;
          background: rgba(74,200,100,0.08);
          border-top: 1px solid rgba(74,200,100,0.2);
          display: flex;
          align-items: center;
          gap: 10px;
          animation: done-in 0.5s ease;
        }

        @keyframes done-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .done-text {
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          color: #68d391;
        }

        .sparkle {
          animation: spin-sparkle 1s ease-in-out;
          display: inline-block;
        }

        @keyframes spin-sparkle {
          0% { transform: scale(0) rotate(-180deg); opacity: 0; }
          60% { transform: scale(1.3) rotate(20deg); }
          100% { transform: scale(1) rotate(0); opacity: 1; }
        }

        /* Steps sidebar */
        .steps-list {
          border-top: 1px solid #0f1e3a;
          max-height: 140px;
          overflow-y: auto;
          padding: 10px 18px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .steps-list::-webkit-scrollbar { width: 4px; }
        .steps-list::-webkit-scrollbar-track { background: transparent; }
        .steps-list::-webkit-scrollbar-thumb { background: #1a2744; border-radius: 4px; }

        .step-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 5px 8px;
          border-radius: 6px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          color: #2a4060;
          cursor: pointer;
          transition: all 0.15s;
        }

        .step-item:hover { background: rgba(26,108,247,0.08); color: #4a7090; }

        .step-item.active {
          background: rgba(26,108,247,0.12);
          color: #7ee8fa;
        }

        .step-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }
      `}</style>

      <div className="page">
        {/* Header */}
        <header className="header">
          <div className="header-icon">🌲</div>
          <div>
            <div className="header-title">Tree DS Visualizer</div>
            <div className="header-sub">Binary Search Tree · Step-by-step animation</div>
          </div>
          <div className="header-badge">v1.0 · BST Engine</div>
        </header>

        {/* Main Grid */}
        <main className="main">
          {/* Left: Code Editor */}
          <div className="panel">
            <div className="panel-header">
              <span className="panel-dot" style={{ background: "#ff5f57" }} />
              <span className="panel-dot" style={{ background: "#ffbd2e" }} />
              <span className="panel-dot" style={{ background: "#28c840" }} />
              <span className="panel-title" style={{ marginLeft: 8 }}>Code Editor</span>
            </div>

            {/* Language Selector */}
            <div className="lang-row">
              {Object.entries(LANG_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  className={`lang-btn${lang === key ? " active" : ""}`}
                  onClick={() => handleLangChange(key)}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Editor */}
            <div className="editor-area">
              <textarea
                ref={textareaRef}
                className="code-textarea"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={handleKeyDown}
                spellCheck={false}
                placeholder="// Write your BST code here..."
              />
            </div>

            {/* Error */}
            {error && (
              <div className="error-box">
                <div className="error-title">
                  <span>⚠</span> Write Correct Code
                </div>
                <div style={{ whiteSpace: "pre-wrap" }}>{error}</div>
              </div>
            )}

            {/* Run Row */}
            <div className="run-row">
              <button
                className={`run-btn${running ? " running" : ""}`}
                onClick={handleRun}
                disabled={running}
              >
                {running ? "▶ Running..." : "▶ Run & Visualize"}
              </button>
              {(steps.length > 0 || error) && (
                <button className="reset-btn" onClick={reset}>↺ Reset</button>
              )}
            </div>
          </div>

          {/* Right: Visualization */}
          <div className="panel">
            <div className="panel-header">
              <span className="panel-dot" style={{ background: "#4aaeff" }} />
              <span className="panel-dot" style={{ background: "#7ee8fa" }} />
              <span className="panel-dot" style={{ background: "#a78bfa" }} />
              <span className="panel-title" style={{ marginLeft: 8 }}>Tree Visualization</span>
            </div>

            <div className="viz-body">
              {/* SVG Canvas */}
              <div className="tree-canvas">
                <TreeViz
                  tree={step?.tree || null}
                  highlight={step?.highlight || []}
                  animKey={animKey}
                />
              </div>

              {/* Step Info */}
              {step && (
                <div className="step-info">
                  <div
                    className="step-badge"
                    style={{
                      background: `rgba(${
                        step.type === "insert" ? "26,108,247" :
                        step.type === "search" ? "255,180,50" :
                        "255,80,80"
                      }, 0.15)`,
                      border: `1px solid ${opColor[step.type]}55`,
                      color: opColor[step.type],
                    }}
                  >
                    <span>{
                      step.type === "insert" ? "➕ INSERT" :
                      step.type === "search" ? "🔍 SEARCH" : "✂ DELETE"
                    }</span>
                    <span style={{ opacity: 0.7 }}>val = {step.value}</span>
                  </div>
                  <div className="step-message">{step.message}</div>
                </div>
              )}

              {/* Done */}
              {done && (
                <div className="done-banner">
                  <span className="sparkle">🎉</span>
                  <span className="done-text">All {steps.length} operations visualized successfully!</span>
                </div>
              )}

              {/* Progress */}
              {steps.length > 0 && (
                <div className="progress-row">
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${((currentStep + 1) / steps.length) * 100}%`,
                      }}
                    />
                  </div>
                  <div className="progress-text">
                    {currentStep + 1} / {steps.length}
                  </div>
                </div>
              )}

              {/* Steps List */}
              {steps.length > 0 && (
                <div className="steps-list">
                  {steps.map((s, i) => (
                    <div
                      key={i}
                      className={`step-item${i === currentStep ? " active" : ""}`}
                      onClick={() => { setCurrentStep(i); setAnimKey((k) => k + 1); }}
                    >
                      <span
                        className="step-dot"
                        style={{
                          background:
                            i < currentStep ? "#28c840" :
                            i === currentStep ? opColor[s.type] :
                            "#1a2744",
                        }}
                      />
                      <span>
                        {s.type.toUpperCase()}({s.value})
                        {s.type === "search" && (s.found ? " ✓" : " ✗")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}