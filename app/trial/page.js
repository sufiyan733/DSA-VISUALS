"use client";
import { useState, useRef, useEffect, useCallback } from "react";

/* ─── Graph Logic ─── */
class GraphNode {
  constructor(id, label = null) {
    this.id = id;
    this.label = label ?? id.toString();
    this.x = 0; // will be set by layout
    this.y = 0;
  }
}

class Graph {
  constructor() {
    this.nodes = new Map(); // id -> GraphNode
    this.adj = new Map();   // id -> Set of neighbor ids
    this.nextId = 0;
  }

  addNode(label) {
    const id = this.nextId++;
    const node = new GraphNode(id, label);
    this.nodes.set(id, node);
    this.adj.set(id, new Set());
    return node;
  }

  addEdge(fromId, toId) {
    if (!this.nodes.has(fromId) || !this.nodes.has(toId)) return false;
    this.adj.get(fromId).add(toId);
    this.adj.get(toId).add(fromId); // undirected
    return true;
  }

  removeNode(id) {
    if (!this.nodes.has(id)) return false;
    // remove edges from neighbors
    for (const neighbor of this.adj.get(id)) {
      this.adj.get(neighbor).delete(id);
    }
    this.adj.delete(id);
    this.nodes.delete(id);
    return true;
  }

  removeEdge(fromId, toId) {
    if (!this.nodes.has(fromId) || !this.nodes.has(toId)) return false;
    if (!this.adj.get(fromId).has(toId)) return false;
    this.adj.get(fromId).delete(toId);
    this.adj.get(toId).delete(fromId);
    return true;
  }

  bfs(startId, visitCallback = null) {
    const visited = new Set();
    const queue = [startId];
    const order = [];
    visited.add(startId);
    while (queue.length) {
      const id = queue.shift();
      order.push(id);
      if (visitCallback) visitCallback(id);
      for (const neighbor of this.adj.get(id)) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }
    return order;
  }

  dfs(startId, visitCallback = null) {
    const visited = new Set();
    const stack = [startId];
    const order = [];
    while (stack.length) {
      const id = stack.pop();
      if (visited.has(id)) continue;
      visited.add(id);
      order.push(id);
      if (visitCallback) visitCallback(id);
      // push neighbors in reverse order to simulate typical DFS order
      const neighbors = [...this.adj.get(id)].reverse();
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          stack.push(neighbor);
        }
      }
    }
    return order;
  }

  clone() {
    const g = new Graph();
    // clone nodes
    for (const [id, node] of this.nodes) {
      const newNode = new GraphNode(id, node.label);
      g.nodes.set(id, newNode);
      g.adj.set(id, new Set());
    }
    // clone edges
    for (const [id, neighbors] of this.adj) {
      for (const nb of neighbors) {
        g.adj.get(id).add(nb);
      }
    }
    g.nextId = this.nextId;
    return g;
  }
}

// Layout using force-directed or simple circular layout
function layoutGraph(graph, width = 600, height = 400) {
  const nodes = Array.from(graph.nodes.values());
  const n = nodes.length;
  if (n === 0) return { positions: new Map() };
  // simple circular layout
  const radius = Math.min(width, height) * 0.35;
  const centerX = width / 2;
  const centerY = height / 2;
  const positions = new Map();
  nodes.forEach((node, i) => {
    const angle = (i / n) * 2 * Math.PI;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    positions.set(node.id, { x, y });
  });
  return positions;
}

/* ─── Parser ─── */
function parseAndRunGraphCode(code) {
  const steps = [], errors = [];
  const stripped = code.replace(/\/\/[^\n]*/g, "").replace(/\/\*[\s\S]*?\*\//g, "").replace(/#[^\n]*/g, "");
  const lines = code.split("\n");
  const strippedLines = stripped.split("\n");

  // Find graph instance variable
  let instanceVar = null;
  const instancePatterns = [
    /(?:const|let|var)\s+(\w+)\s*=\s*new\s+\w*[Gg]raph\s*\(/,
    /(?:const|let|var)\s+(\w+)\s*=\s*new\s+\w+\s*\(\s*\)/,
    /(\w+)\s*=\s*(?:Graph|UndirectedGraph|Graph)\s*\(\s*\)/,
    /(\w+)\s*:=\s*&?\s*(?:Graph|UndirectedGraph|Graph)\s*[({]/,
    /(?:Graph|UndirectedGraph|Graph)\s*(?:<\w+>)?\s+(\w+)\s*[=;]/,
  ];
  for (const pat of instancePatterns) {
    const m = stripped.match(pat);
    if (m) { instanceVar = m[1]; break; }
  }
  if (!instanceVar) {
    const fb = stripped.match(/(\w+)\s*\.\s*(?:addNode|addEdge|bfs|dfs)\s*\(/);
    if (fb) instanceVar = fb[1];
  }
  if (!instanceVar) {
    errors.push("Could not find Graph instance.\nCreate one:\n  const graph = new Graph();\n  graph.addNode(0);");
    return { steps, errors };
  }

  const varRe = instanceVar.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // Patterns for operations: addNode(label), addEdge(from, to), removeNode(id), removeEdge(from, to), bfs(start), dfs(start)
  const addNodeRe = new RegExp(`${varRe}\\s*\\.\\s*(addNode|addNode)\\s*\\(\\s*([^,)]+)\\s*\\)`, "g");
  const addEdgeRe = new RegExp(`${varRe}\\s*\\.\\s*(addEdge|addEdge)\\s*\\(\\s*(\\d+)\\s*,\\s*(\\d+)\\s*\\)`, "g");
  const removeNodeRe = new RegExp(`${varRe}\\s*\\.\\s*(removeNode|removeNode)\\s*\\(\\s*(\\d+)\\s*\\)`, "g");
  const removeEdgeRe = new RegExp(`${varRe}\\s*\\.\\s*(removeEdge|removeEdge)\\s*\\(\\s*(\\d+)\\s*,\\s*(\\d+)\\s*\\)`, "g");
  const bfsRe = new RegExp(`${varRe}\\s*\\.\\s*(bfs|BFS)\\s*\\(\\s*(\\d+)\\s*\\)`, "g");
  const dfsRe = new RegExp(`${varRe}\\s*\\.\\s*(dfs|DFS)\\s*\\(\\s*(\\d+)\\s*\\)`, "g");

  const allOps = [];
  let m;
  while ((m = addNodeRe.exec(stripped)) !== null) {
    const label = m[2].trim().replace(/['"]/g, "");
    allOps.push({ type: "addNode", label: label || null, charIdx: m.index });
  }
  while ((m = addEdgeRe.exec(stripped)) !== null) {
    allOps.push({ type: "addEdge", from: parseInt(m[2]), to: parseInt(m[3]), charIdx: m.index });
  }
  while ((m = removeNodeRe.exec(stripped)) !== null) {
    allOps.push({ type: "removeNode", id: parseInt(m[2]), charIdx: m.index });
  }
  while ((m = removeEdgeRe.exec(stripped)) !== null) {
    allOps.push({ type: "removeEdge", from: parseInt(m[2]), to: parseInt(m[3]), charIdx: m.index });
  }
  while ((m = bfsRe.exec(stripped)) !== null) {
    allOps.push({ type: "bfs", start: parseInt(m[2]), charIdx: m.index });
  }
  while ((m = dfsRe.exec(stripped)) !== null) {
    allOps.push({ type: "dfs", start: parseInt(m[2]), charIdx: m.index });
  }

  if (!allOps.length) {
    errors.push(`Instance '${instanceVar}' found but no calls detected.\nCall addNode, addEdge, bfs, dfs.`);
    return { steps, errors };
  }

  const getLineNum = (ci) => {
    let cur = 0;
    for (let i = 0; i < strippedLines.length; i++) {
      cur += strippedLines[i].length + 1;
      if (cur > ci) return i;
    }
    return lines.length - 1;
  };

  let graph = new Graph();
  for (const op of allOps) {
    const lineNum = getLineNum(op.charIdx);
    const codeLine = lines[lineNum]?.trim() ?? "";
    if (op.type === "addNode") {
      const node = graph.addNode(op.label);
      const snap = graph.clone();
      steps.push({
        type: "addNode",
        value: node.id,
        label: op.label,
        graph: snap,
        highlight: [node.id],
        message: `addNode(${op.label ?? node.id}) → added node ${node.id}`,
        nodeCount: graph.nodes.size,
        edgeCount: Array.from(graph.adj.values()).reduce((s, set) => s + set.size, 0) / 2,
        lineNum,
        codeLine,
      });
    } else if (op.type === "addEdge") {
      const success = graph.addEdge(op.from, op.to);
      const snap = graph.clone();
      steps.push({
        type: "addEdge",
        from: op.from,
        to: op.to,
        graph: snap,
        highlight: [op.from, op.to],
        message: success ? `addEdge(${op.from}, ${op.to}) → edge added` : `addEdge(${op.from}, ${op.to}) → failed (nodes missing)`,
        nodeCount: graph.nodes.size,
        edgeCount: Array.from(graph.adj.values()).reduce((s, set) => s + set.size, 0) / 2,
        lineNum,
        codeLine,
      });
    } else if (op.type === "removeNode") {
      const success = graph.removeNode(op.id);
      const snap = graph.clone();
      steps.push({
        type: "removeNode",
        id: op.id,
        graph: snap,
        highlight: [],
        message: success ? `removeNode(${op.id}) → node removed` : `removeNode(${op.id}) → node not found`,
        nodeCount: graph.nodes.size,
        edgeCount: Array.from(graph.adj.values()).reduce((s, set) => s + set.size, 0) / 2,
        lineNum,
        codeLine,
      });
    } else if (op.type === "removeEdge") {
      const success = graph.removeEdge(op.from, op.to);
      const snap = graph.clone();
      steps.push({
        type: "removeEdge",
        from: op.from,
        to: op.to,
        graph: snap,
        highlight: [op.from, op.to],
        message: success ? `removeEdge(${op.from}, ${op.to}) → edge removed` : `removeEdge(${op.from}, ${op.to}) → edge not found`,
        nodeCount: graph.nodes.size,
        edgeCount: Array.from(graph.adj.values()).reduce((s, set) => s + set.size, 0) / 2,
        lineNum,
        codeLine,
      });
    } else if (op.type === "bfs") {
      const order = graph.bfs(op.start);
      const snap = graph.clone();
      steps.push({
        type: "bfs",
        start: op.start,
        order,
        graph: snap,
        highlight: order,
        message: `bfs(${op.start}) → order: ${order.join(" → ")}`,
        nodeCount: graph.nodes.size,
        edgeCount: Array.from(graph.adj.values()).reduce((s, set) => s + set.size, 0) / 2,
        lineNum,
        codeLine,
      });
    } else if (op.type === "dfs") {
      const order = graph.dfs(op.start);
      const snap = graph.clone();
      steps.push({
        type: "dfs",
        start: op.start,
        order,
        graph: snap,
        highlight: order,
        message: `dfs(${op.start}) → order: ${order.join(" → ")}`,
        nodeCount: graph.nodes.size,
        edgeCount: Array.from(graph.adj.values()).reduce((s, set) => s + set.size, 0) / 2,
        lineNum,
        codeLine,
      });
    }
  }
  return { steps, errors };
}

/* ─── Graph SVG ─── */
const GRAPH_CONFIG = {
  W: 660,
  NR: 24,
};

function GraphViz({ graph, highlight = [], animKey, idle }) {
  if (!graph || graph.nodes.size === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, width: "100%", minHeight: 200, justifyContent: "center", border: "1px dashed rgba(96,165,250,0.1)", borderRadius: 14, background: "rgba(59,130,246,0.015)" }}>
        <div style={{ fontSize: 40, animation: "idleFloat 3.5s ease-in-out infinite", filter: "drop-shadow(0 0 12px rgba(96,165,250,0.25))" }}>📊</div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: "#2a4060", letterSpacing: ".1em", textAlign: "center", lineHeight: 2.2, textTransform: "uppercase" }}>
          {idle ? "Write Graph code · addNode / addEdge · Run" : "Graph will appear here"}
        </div>
      </div>
    );
  }

  const { W, NR } = GRAPH_CONFIG;
  const positions = layoutGraph(graph, W, 400);
  const svgH = 420;

  const nodes = Array.from(graph.nodes.values());
  const edges = [];
  const edgeSet = new Set();
  for (const [id, neighbors] of graph.adj) {
    for (const nb of neighbors) {
      const key = `${Math.min(id, nb)}-${Math.max(id, nb)}`;
      if (!edgeSet.has(key)) {
        edgeSet.add(key);
        edges.push({ from: id, to: nb });
      }
    }
  }

  const highlightSet = new Set(highlight);

  return (
    <svg viewBox={`0 0 ${W} ${svgH}`} width="100%" style={{ overflow: "visible", maxHeight: 420, display: "block" }}>
      <defs>
        <radialGradient id="nodeGrad" cx="38%" cy="30%">
          <stop offset="0%" stopColor="#162035" />
          <stop offset="100%" stopColor="#060d1e" />
        </radialGradient>
        <radialGradient id="highlightGrad" cx="38%" cy="30%">
          <stop offset="0%" stopColor="#1d4ed8" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </radialGradient>
        <filter id="glow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M0,0 L0,8 L8,4 z" fill="#60a5fa" opacity="0.6" />
        </marker>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(96,130,255,0.04)" strokeWidth="1" />
        </pattern>
        <style>{`
          .edgeLine { stroke: rgba(80,120,200,0.3); stroke-width: 1.8; }
          .edgeHl { stroke: #60a5fa; stroke-width: 2.5; filter: url(#glow); }
          .nodeBase { transition: all 0.2s; }
          .nodeHl { animation: pulse 0.5s ease-in-out; }
          @keyframes pulse { 0% { r: ${NR-2}; } 50% { r: ${NR+4}; } 100% { r: ${NR}; } }
        `}</style>
      </defs>
      <rect width={W} height={svgH} fill="url(#grid)" />

      {/* Edges */}
      {edges.map(({ from, to }) => {
        const p1 = positions.get(from);
        const p2 = positions.get(to);
        if (!p1 || !p2) return null;
        const isHl = highlightSet.has(from) && highlightSet.has(to);
        return (
          <line
            key={`e-${from}-${to}`}
            x1={p1.x} y1={p1.y}
            x2={p2.x} y2={p2.y}
            className={isHl ? "edgeHl" : "edgeLine"}
            markerEnd={isHl ? "url(#arrow)" : undefined}
          />
        );
      })}

      {/* Nodes */}
      {nodes.map(node => {
        const pos = positions.get(node.id);
        if (!pos) return null;
        const isHl = highlightSet.has(node.id);
        const fill = isHl ? "url(#highlightGrad)" : "url(#nodeGrad)";
        const stroke = isHl ? "#60a5fa" : "rgba(80,120,200,0.3)";
        const strokeWidth = isHl ? 2.2 : 1.2;
        return (
          <g key={node.id} className={isHl ? "nodeHl" : ""}>
            <circle cx={pos.x} cy={pos.y} r={NR} fill={fill} stroke={stroke} strokeWidth={strokeWidth} filter="url(#glow)" />
            <text x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="central" fill={isHl ? "#fff" : "#8aaccc"} fontSize="12" fontWeight="700" fontFamily="'JetBrains Mono', monospace">
              {node.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ─── Constants & Templates ─── */
const LANGS = {
  javascript: { name: "JavaScript", ext: "JS", accent: "#fde047", bg: "rgba(253,224,71,0.12)", border: "rgba(253,224,71,0.38)" },
  typescript: { name: "TypeScript", ext: "TS", accent: "#60a5fa", bg: "rgba(96,165,250,0.12)", border: "rgba(96,165,250,0.38)" },
  python: { name: "Python", ext: "PY", accent: "#4ade80", bg: "rgba(74,222,128,0.12)", border: "rgba(74,222,128,0.38)" },
  java: { name: "Java", ext: "JV", accent: "#fb923c", bg: "rgba(251,146,60,0.12)", border: "rgba(251,146,60,0.38)" },
  cpp: { name: "C++", ext: "C++", accent: "#38bdf8", bg: "rgba(56,189,248,0.12)", border: "rgba(56,189,248,0.38)" },
  csharp: { name: "C#", ext: "C#", accent: "#c084fc", bg: "rgba(192,132,252,0.12)", border: "rgba(192,132,252,0.38)" },
  go: { name: "Go", ext: "GO", accent: "#34d399", bg: "rgba(52,211,153,0.12)", border: "rgba(52,211,153,0.38)" },
};

const TPL = {
  javascript: `// Graph — JavaScript
class Graph {
  constructor() {
    this.adj = new Map();  // adjacency list
    this.nodes = new Map(); // id -> label
    this.nextId = 0;
  }

  addNode(label = null) {
    const id = this.nextId++;
    this.nodes.set(id, label ?? id);
    this.adj.set(id, new Set());
    return id;
  }

  addEdge(u, v) {
    if (!this.nodes.has(u) || !this.nodes.has(v)) return false;
    this.adj.get(u).add(v);
    this.adj.get(v).add(u);
    return true;
  }

  bfs(start) {
    const visited = new Set();
    const queue = [start];
    const order = [];
    visited.add(start);
    while (queue.length) {
      const u = queue.shift();
      order.push(u);
      for (const v of this.adj.get(u)) {
        if (!visited.has(v)) {
          visited.add(v);
          queue.push(v);
        }
      }
    }
    return order;
  }

  dfs(start) {
    const visited = new Set();
    const stack = [start];
    const order = [];
    while (stack.length) {
      const u = stack.pop();
      if (visited.has(u)) continue;
      visited.add(u);
      order.push(u);
      for (const v of this.adj.get(u)) {
        if (!visited.has(v)) stack.push(v);
      }
    }
    return order;
  }
}

const graph = new Graph();
graph.addNode("A");
graph.addNode("B");
graph.addNode("C");
graph.addNode("D");
graph.addEdge(0, 1);
graph.addEdge(0, 2);
graph.addEdge(1, 3);
graph.bfs(0);
graph.dfs(0);`,

  typescript: `// Graph — TypeScript
class Graph {
  private adj: Map<number, Set<number>> = new Map();
  private nodes: Map<number, string | number> = new Map();
  private nextId = 0;

  addNode(label?: string | number): number {
    const id = this.nextId++;
    this.nodes.set(id, label ?? id);
    this.adj.set(id, new Set());
    return id;
  }

  addEdge(u: number, v: number): boolean {
    if (!this.nodes.has(u) || !this.nodes.has(v)) return false;
    this.adj.get(u)!.add(v);
    this.adj.get(v)!.add(u);
    return true;
  }

  bfs(start: number): number[] {
    const visited = new Set<number>();
    const queue: number[] = [start];
    const order: number[] = [];
    visited.add(start);
    while (queue.length) {
      const u = queue.shift()!;
      order.push(u);
      for (const v of this.adj.get(u)!) {
        if (!visited.has(v)) {
          visited.add(v);
          queue.push(v);
        }
      }
    }
    return order;
  }

  dfs(start: number): number[] {
    const visited = new Set<number>();
    const stack: number[] = [start];
    const order: number[] = [];
    while (stack.length) {
      const u = stack.pop()!;
      if (visited.has(u)) continue;
      visited.add(u);
      order.push(u);
      for (const v of this.adj.get(u)!) {
        if (!visited.has(v)) stack.push(v);
      }
    }
    return order;
  }
}

const graph = new Graph();
graph.addNode("A");
graph.addNode("B");
graph.addNode("C");
graph.addNode("D");
graph.addEdge(0, 1);
graph.addEdge(0, 2);
graph.addEdge(1, 3);
graph.bfs(0);
graph.dfs(0);`,

  python: `# Graph — Python
class Graph:
    def __init__(self):
        self.adj = {}
        self.nodes = {}
        self.next_id = 0

    def add_node(self, label=None):
        nid = self.next_id
        self.next_id += 1
        self.nodes[nid] = label if label is not None else nid
        self.adj[nid] = set()
        return nid

    def add_edge(self, u, v):
        if u not in self.nodes or v not in self.nodes:
            return False
        self.adj[u].add(v)
        self.adj[v].add(u)
        return True

    def bfs(self, start):
        visited = set()
        queue = [start]
        order = []
        visited.add(start)
        while queue:
            u = queue.pop(0)
            order.append(u)
            for v in self.adj[u]:
                if v not in visited:
                    visited.add(v)
                    queue.append(v)
        return order

    def dfs(self, start):
        visited = set()
        stack = [start]
        order = []
        while stack:
            u = stack.pop()
            if u in visited:
                continue
            visited.add(u)
            order.append(u)
            for v in self.adj[u]:
                if v not in visited:
                    stack.append(v)
        return order

graph = Graph()
graph.add_node("A")
graph.add_node("B")
graph.add_node("C")
graph.add_node("D")
graph.add_edge(0, 1)
graph.add_edge(0, 2)
graph.add_edge(1, 3)
graph.bfs(0)
graph.dfs(0)`,

  java: `// Graph — Java
import java.util.*;

class Graph {
    private Map<Integer, Set<Integer>> adj = new HashMap<>();
    private Map<Integer, Object> nodes = new HashMap<>();
    private int nextId = 0;

    public int addNode(Object label) {
        int id = nextId++;
        nodes.put(id, label != null ? label : id);
        adj.put(id, new HashSet<>());
        return id;
    }

    public boolean addEdge(int u, int v) {
        if (!nodes.containsKey(u) || !nodes.containsKey(v)) return false;
        adj.get(u).add(v);
        adj.get(v).add(u);
        return true;
    }

    public List<Integer> bfs(int start) {
        Set<Integer> visited = new HashSet<>();
        Queue<Integer> queue = new LinkedList<>();
        List<Integer> order = new ArrayList<>();
        visited.add(start);
        queue.add(start);
        while (!queue.isEmpty()) {
            int u = queue.poll();
            order.add(u);
            for (int v : adj.get(u)) {
                if (!visited.contains(v)) {
                    visited.add(v);
                    queue.add(v);
                }
            }
        }
        return order;
    }

    public List<Integer> dfs(int start) {
        Set<Integer> visited = new HashSet<>();
        Stack<Integer> stack = new Stack<>();
        List<Integer> order = new ArrayList<>();
        stack.push(start);
        while (!stack.isEmpty()) {
            int u = stack.pop();
            if (visited.contains(u)) continue;
            visited.add(u);
            order.add(u);
            for (int v : adj.get(u)) {
                if (!visited.contains(v)) stack.push(v);
            }
        }
        return order;
    }

    public static void main(String[] args) {
        Graph graph = new Graph();
        graph.addNode("A");
        graph.addNode("B");
        graph.addNode("C");
        graph.addNode("D");
        graph.addEdge(0, 1);
        graph.addEdge(0, 2);
        graph.addEdge(1, 3);
        graph.bfs(0);
        graph.dfs(0);
    }
}`,

  cpp: `// Graph — C++
#include <iostream>
#include <vector>
#include <unordered_map>
#include <unordered_set>
#include <queue>
#include <stack>

class Graph {
private:
    std::unordered_map<int, std::unordered_set<int>> adj;
    std::unordered_map<int, std::string> nodes;
    int nextId = 0;

public:
    int addNode(const std::string& label = "") {
        int id = nextId++;
        nodes[id] = label.empty() ? std::to_string(id) : label;
        adj[id] = {};
        return id;
    }

    bool addEdge(int u, int v) {
        if (nodes.find(u) == nodes.end() || nodes.find(v) == nodes.end()) return false;
        adj[u].insert(v);
        adj[v].insert(u);
        return true;
    }

    std::vector<int> bfs(int start) {
        std::unordered_set<int> visited;
        std::queue<int> q;
        std::vector<int> order;
        visited.insert(start);
        q.push(start);
        while (!q.empty()) {
            int u = q.front(); q.pop();
            order.push_back(u);
            for (int v : adj[u]) {
                if (visited.find(v) == visited.end()) {
                    visited.insert(v);
                    q.push(v);
                }
            }
        }
        return order;
    }

    std::vector<int> dfs(int start) {
        std::unordered_set<int> visited;
        std::stack<int> st;
        std::vector<int> order;
        st.push(start);
        while (!st.empty()) {
            int u = st.top(); st.pop();
            if (visited.find(u) != visited.end()) continue;
            visited.insert(u);
            order.push_back(u);
            for (int v : adj[u]) {
                if (visited.find(v) == visited.end()) st.push(v);
            }
        }
        return order;
    }
};

int main() {
    Graph graph;
    graph.addNode("A");
    graph.addNode("B");
    graph.addNode("C");
    graph.addNode("D");
    graph.addEdge(0, 1);
    graph.addEdge(0, 2);
    graph.addEdge(1, 3);
    graph.bfs(0);
    graph.dfs(0);
    return 0;
}`,

  csharp: `// Graph — C#
using System;
using System.Collections.Generic;
using System.Linq;

class Graph {
    private Dictionary<int, HashSet<int>> adj = new Dictionary<int, HashSet<int>>();
    private Dictionary<int, object> nodes = new Dictionary<int, object>();
    private int nextId = 0;

    public int AddNode(object label = null) {
        int id = nextId++;
        nodes[id] = label ?? id;
        adj[id] = new HashSet<int>();
        return id;
    }

    public bool AddEdge(int u, int v) {
        if (!nodes.ContainsKey(u) || !nodes.ContainsKey(v)) return false;
        adj[u].Add(v);
        adj[v].Add(u);
        return true;
    }

    public List<int> Bfs(int start) {
        var visited = new HashSet<int>();
        var queue = new Queue<int>();
        var order = new List<int>();
        visited.Add(start);
        queue.Enqueue(start);
        while (queue.Count > 0) {
            int u = queue.Dequeue();
            order.Add(u);
            foreach (int v in adj[u]) {
                if (!visited.Contains(v)) {
                    visited.Add(v);
                    queue.Enqueue(v);
                }
            }
        }
        return order;
    }

    public List<int> Dfs(int start) {
        var visited = new HashSet<int>();
        var stack = new Stack<int>();
        var order = new List<int>();
        stack.Push(start);
        while (stack.Count > 0) {
            int u = stack.Pop();
            if (visited.Contains(u)) continue;
            visited.Add(u);
            order.Add(u);
            foreach (int v in adj[u]) {
                if (!visited.Contains(v)) stack.Push(v);
            }
        }
        return order;
    }

    static void Main() {
        Graph graph = new Graph();
        graph.AddNode("A");
        graph.AddNode("B");
        graph.AddNode("C");
        graph.AddNode("D");
        graph.AddEdge(0, 1);
        graph.AddEdge(0, 2);
        graph.AddEdge(1, 3);
        graph.Bfs(0);
        graph.Dfs(0);
    }
}`,

  go: `// Graph — Go
package main

import "fmt"

type Graph struct {
    adj   map[int]map[int]bool
    nodes map[int]interface{}
    nextId int
}

func NewGraph() *Graph {
    return &Graph{
        adj:   make(map[int]map[int]bool),
        nodes: make(map[int]interface{}),
        nextId: 0,
    }
}

func (g *Graph) AddNode(label interface{}) int {
    id := g.nextId
    g.nextId++
    if label == nil {
        label = id
    }
    g.nodes[id] = label
    g.adj[id] = make(map[int]bool)
    return id
}

func (g *Graph) AddEdge(u, v int) bool {
    if _, ok := g.nodes[u]; !ok { return false }
    if _, ok := g.nodes[v]; !ok { return false }
    g.adj[u][v] = true
    g.adj[v][u] = true
    return true
}

func (g *Graph) Bfs(start int) []int {
    visited := make(map[int]bool)
    queue := []int{start}
    order := []int{}
    visited[start] = true
    for len(queue) > 0 {
        u := queue[0]
        queue = queue[1:]
        order = append(order, u)
        for v := range g.adj[u] {
            if !visited[v] {
                visited[v] = true
                queue = append(queue, v)
            }
        }
    }
    return order
}

func (g *Graph) Dfs(start int) []int {
    visited := make(map[int]bool)
    stack := []int{start}
    order := []int{}
    for len(stack) > 0 {
        u := stack[len(stack)-1]
        stack = stack[:len(stack)-1]
        if visited[u] {
            continue
        }
        visited[u] = true
        order = append(order, u)
        for v := range g.adj[u] {
            if !visited[v] {
                stack = append(stack, v)
            }
        }
    }
    return order
}

func main() {
    graph := NewGraph()
    graph.AddNode("A")
    graph.AddNode("B")
    graph.AddNode("C")
    graph.AddNode("D")
    graph.AddEdge(0, 1)
    graph.AddEdge(0, 2)
    graph.AddEdge(1, 3)
    graph.Bfs(0)
    graph.Dfs(0)
    fmt.Println("done")
}`,
};

const OP = {
  addNode: { label: "ADD NODE", icon: "⊕", c: "#60a5fa", bg: "rgba(59,130,246,0.12)", bd: "rgba(96,165,250,0.45)" },
  addEdge: { label: "ADD EDGE", icon: "⎯", c: "#93c5fd", bg: "rgba(59,130,246,0.1)", bd: "rgba(147,197,253,0.4)" },
  removeNode: { label: "REMOVE NODE", icon: "⊖", c: "#f87171", bg: "rgba(239,68,68,0.1)", bd: "rgba(248,113,113,0.45)" },
  removeEdge: { label: "REMOVE EDGE", icon: "⨯", c: "#f87171", bg: "rgba(239,68,68,0.1)", bd: "rgba(248,113,113,0.45)" },
  bfs: { label: "BFS", icon: "◎", c: "#4ade80", bg: "rgba(74,222,128,0.1)", bd: "rgba(74,222,128,0.45)" },
  dfs: { label: "DFS", icon: "◉", c: "#4ade80", bg: "rgba(74,222,128,0.1)", bd: "rgba(74,222,128,0.45)" },
};

const LINE_H = 20;

async function validateWithAI(code, lang) {
  const prompt = `Graph code reviewer. Check: Graph class, logic bugs, syntax.
Return ONLY JSON, no markdown:
{"valid":true,"reason":"","errors":[]} OR {"valid":false,"reason":"short","errors":[{"line":1,"message":"issue"}]}
Code:\n\`\`\`${lang}\n${code.slice(0, 3000)}\n\`\`\``;
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [{ role: "user", content: prompt }] }),
    });
    const data = await res.json();
    if (data.error) return { valid: true, reason: "", errors: [], apiError: data.error };
    const raw = (data.content ?? "").replace(/```json|```/gi, "").trim();
    const parsed = JSON.parse(raw);
    return {
      valid: !!parsed.valid,
      reason: parsed.reason ?? "",
      errors: Array.isArray(parsed.errors) ? parsed.errors : [],
      apiError: null,
    };
  } catch (e) {
    return { valid: true, reason: "", errors: [], apiError: e.message };
  }
}

/* ─── Code Editor (same as BST) ─── */
function CodeEditor({ code, setCode, step, errorLineSet, onKeyDown, taRef }) {
  const lines = code.split("\n");
  const lnRef = useRef(null);
  const sync = useCallback(() => {
    if (taRef.current && lnRef.current) lnRef.current.scrollTop = taRef.current.scrollTop;
  }, [taRef]);
  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.addEventListener("scroll", sync, { passive: true });
    return () => ta.removeEventListener("scroll", sync);
  }, [sync]);
  return (
    <div style={{ flex: 1, display: "flex", minHeight: 0, overflow: "hidden", position: "relative" }}>
      <div
        ref={lnRef}
        style={{
          width: 38,
          flexShrink: 0,
          background: "rgba(2,5,16,0.92)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          overflowY: "hidden",
          paddingTop: 12,
          paddingBottom: 12,
          display: "flex",
          flexDirection: "column",
          userSelect: "none",
          pointerEvents: "none",
          scrollbarWidth: "none",
        }}
      >
        {lines.map((_, i) => {
          const isAct = step?.lineNum === i,
            isErr = errorLineSet.has(i);
          return (
            <div
              key={i}
              style={{
                height: LINE_H,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                paddingRight: 8,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 9,
                lineHeight: 1,
                color: isErr ? "#f87171" : isAct ? "#93c5fd" : "#2a4060",
                background: isErr
                  ? "rgba(239,68,68,0.07)"
                  : isAct
                  ? "rgba(59,130,246,0.07)"
                  : "transparent",
                transition: "color .12s,background .12s",
              }}
            >
              {i + 1}
            </div>
          );
        })}
      </div>
      {step && (
        <div
          style={{
            position: "absolute",
            left: 38,
            right: 0,
            height: LINE_H,
            top: 12 + step.lineNum * LINE_H,
            background: "rgba(59,130,246,0.05)",
            borderLeft: "2px solid rgba(96,165,250,0.45)",
            pointerEvents: "none",
            zIndex: 1,
            transition: "top .17s cubic-bezier(.4,0,.2,1)",
          }}
        />
      )}
      {[...errorLineSet].map((i) => (
        <div
          key={`e${i}`}
          style={{
            position: "absolute",
            left: 38,
            right: 0,
            height: LINE_H,
            top: 12 + i * LINE_H,
            background: "rgba(239,68,68,0.05)",
            borderLeft: "2px solid rgba(248,113,113,0.45)",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />
      ))}
      <textarea
        ref={taRef}
        style={{
          flex: 1,
          padding: "12px 14px 12px 11px",
          background: "transparent",
          border: "none",
          outline: "none",
          color: "#cfe2ff",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          lineHeight: `${LINE_H}px`,
          resize: "none",
          caretColor: "#60a5fa",
          tabSize: 2,
          whiteSpace: "pre",
          overflowY: "auto",
          overflowX: "auto",
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(96,165,250,0.18) transparent",
          position: "relative",
          zIndex: 2,
        }}
        value={code}
        onChange={(e) => setCode(e.target.value)}
        onKeyDown={onKeyDown}
        spellCheck={false}
        placeholder="// Write your Graph code here…"
      />
    </div>
  );
}

/* ─── Terminal (same) ─── */
function Terminal({ lines, validating }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [lines, validating]);
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        background: "#020509",
        minHeight: 0,
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: "10px",
      }}
    >
      <div
        ref={ref}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "6px 0",
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(96,165,250,0.14) transparent",
        }}
      >
        {lines.length === 0 && !validating && (
          <div style={{ padding: "4px 16px", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ color: "#4ade80", userSelect: "none" }}>$</span>
            <span
              style={{ animation: "blink 1.1s step-end infinite", color: "#050d0a", marginLeft: 4 }}
            >
              _
            </span>
          </div>
        )}
        {lines.map((line, i) => (
          <TLine key={i} line={line} isLast={i === lines.length - 1 && !validating} />
        ))}
        {validating && (
          <div style={{ padding: "3px 16px", display: "flex", alignItems: "center", gap: 9 }}>
            <span
              style={{
                display: "inline-block",
                width: 10,
                height: 10,
                borderRadius: "50%",
                border: "1.5px solid rgba(96,165,250,0.18)",
                borderTopColor: "#60a5fa",
                animation: "spin .65s linear infinite",
                flexShrink: 0,
              }}
            />
            <span style={{ color: "#2a4060", fontSize: 9 }}>AI reviewing Graph code…</span>
          </div>
        )}
      </div>
    </div>
  );
}

function TLine({ line, isLast }) {
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVis(true), 12);
    return () => clearTimeout(t);
  }, []);
  if (line.type === "separator")
    return (
      <div
        style={{
          margin: "4px 16px",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          opacity: vis ? 1 : 0,
        }}
      />
    );
  if (line.type === "blank") return <div style={{ height: 4 }} />;
  if (line.type === "prompt")
    return (
      <div
        style={{
          padding: "2px 16px",
          display: "flex",
          alignItems: "center",
          gap: 7,
          opacity: vis ? 1 : 0,
        }}
      >
        <span style={{ color: "#4ade80", userSelect: "none" }}>$</span>
        <span style={{ color: "#3a5878" }}>{line.text}</span>
      </div>
    );
  const cm = {
    addNode: "#93c5fd",
    addEdge: "#7dd3fc",
    removeNode: "#f87171",
    removeEdge: "#f87171",
    bfs: "#4ade80",
    dfs: "#4ade80",
    error: "#f87171",
    stderr: "#f87171",
    success: "#4ade80",
    warn: "#fbbf24",
    info: "#60a5fa",
    output: "#3a5878",
  };
  const pm = {
    addNode: "⊕",
    addEdge: "⎯",
    removeNode: "⊖",
    removeEdge: "⨯",
    bfs: "◎",
    dfs: "◉",
    error: "✗",
    stderr: "✗",
    success: "✓",
    warn: "⚠",
    info: "·",
  };
  const c = cm[line.type] ?? "#3a5878";
  return (
    <div
      style={{
        padding: "1.5px 16px",
        display: "flex",
        alignItems: "flex-start",
        opacity: vis ? 1 : 0,
        transition: "opacity .08s",
      }}
    >
      <span style={{ color: c, width: 18, flexShrink: 0, fontSize: 8, paddingTop: 2 }}>
        {pm[line.type] ?? ""}
      </span>
      <span style={{ color: c, wordBreak: "break-word", lineHeight: 1.7, flex: 1 }}>
        {line.text}
        {isLast && (
          <span style={{ animation: "blink 1.1s step-end infinite", color: "#040a09" }}> _</span>
        )}
      </span>
      {line.lineNum && (
        <span
          style={{
            marginLeft: 10,
            color: "#1e3a50",
            fontSize: 7.5,
            flexShrink: 0,
            paddingTop: 3,
          }}
        >
          :{line.lineNum}
        </span>
      )}
    </div>
  );
}

/* ─── Complexity Panel (graph specific) ─── */
/* ─── Complexity Panel (graph specific) ─── */
function ComplexityPanel({ visible, onClose }) {
  if (!visible) return null;
  return (
    <div
      style={{
        position: "absolute",
        top: 38,
        right: 8,
        zIndex: 100,
        background: "rgba(5,10,28,0.97)",
        border: "1px solid rgba(96,165,250,0.22)",
        borderRadius: 12,
        padding: "12px 14px",
        minWidth: 220,
        boxShadow: "0 18px 48px rgba(0,0,0,0.65)",
        backdropFilter: "blur(20px)",
        animation: "panelFade .18s ease",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 8,
            color: "#93c5fd",
            letterSpacing: ".12em",
            textTransform: "uppercase",
            fontWeight: 700,
          }}
        >
          Graph Complexity
        </span>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: "#3a5878",
            cursor: "pointer",
            fontSize: 14,
            lineHeight: 1,
            padding: "0 2px",
          }}
        >
          ×
        </button>
      </div>
      <table style={{ borderCollapse: "collapse", width: "100%", fontFamily: "'JetBrains Mono', monospace" }}>
        {[
          ["Operation", "Time"],
          ["Add Node", "O(1)"],
          ["Add Edge", "O(1)"],
          ["Remove Node", "O(V+E)"],
          ["Remove Edge", "O(1)"],
          ["BFS/DFS", "O(V+E)"],
        ].map((row, ri) => (
          <tr key={ri} style={{ borderBottom: ri < 5 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
            {row.map((cell, ci) => (
              <td
                key={ci}
                style={{
                  padding: "6px 6px",
                  fontSize: ri === 0 ? 7 : 10,
                  fontWeight: ci === 0 || ri === 0 ? 700 : 500,
                  color:
                    ri === 0
                      ? "#2a4060"
                      : ci === 0
                      ? "#c8dff5"
                      : "#4ade80",
                  textAlign: ci === 0 ? "left" : "center",
                }}
              >
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </table>
      <div
        style={{
          marginTop: 8,
          padding: "6px 8px",
          background: "rgba(59,130,246,0.07)",
          borderRadius: 8,
          border: "1px solid rgba(96,165,250,0.1)",
        }}
      >
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 7.5,
            color: "#60a5fa",
            lineHeight: 1.75,
          }}
        >
          💡 BFS/DFS traverse all vertices and edges. Use adjacency list for efficient storage.
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function GraphDSPage() {
  const [lang, setLang] = useState("javascript");
  const [code, setCode] = useState(TPL.javascript);
  const [steps, setSteps] = useState([]);
  const [idx, setIdx] = useState(-1);
  const [error, setError] = useState("");
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1.4);
  const [animKey, setAnimKey] = useState(0);
  const [done, setDone] = useState(false);
  const [validating, setValidating] = useState(false);
  const [aiErrors, setAiErrors] = useState([]);
  const [termLines, setTermLines] = useState([]);
  const [sessionId] = useState(() => Math.random().toString(36).slice(2, 8).toUpperCase());
  const [toast, setToast] = useState(null);
  const [termOpen, setTermOpen] = useState(true);
  const [showOh, setShowOh] = useState(false);

  const timerRef = useRef(null);
  const taRef = useRef(null);
  const listRef = useRef(null);

  const bump = () => setAnimKey((k) => k + 1);
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2100);
  };

  const doReset = useCallback(() => {
    clearInterval(timerRef.current);
    setSteps([]);
    setIdx(-1);
    setError("");
    setPlaying(false);
    setDone(false);
    setAiErrors([]);
    setTermLines([]);
  }, []);

  const handleChangeLang = (l) => {
    setLang(l);
    setCode(TPL[l] ?? "");
    doReset();
  };

  const buildTerm = (stps, errs, aiErrs, aiReason) => {
    const ls = [];
    const ts = new Date().toTimeString().slice(0, 8);
    ls.push({ type: "output", text: `VisuoSlayer Graph v1.0  ·  ${ts}  ·  pid:${sessionId}` });
    ls.push({ type: "separator" });
    if (aiErrs.length > 0) {
      ls.push({ type: "prompt", text: `validate --lang=${lang} --ds=graph` });
      ls.push({ type: "blank" });
      if (aiReason) ls.push({ type: "stderr", text: aiReason });
      aiErrs.forEach((e) => ls.push({ type: "error", text: `  L${e.line ?? "?"}  ${e.message}`, lineNum: e.line }));
      ls.push({ type: "blank" });
      ls.push({ type: "error", text: "Process exited with code 1" });
      return ls;
    }
    if (errs.length > 0) {
      ls.push({ type: "prompt", text: `run --lang=${lang}` });
      ls.push({ type: "blank" });
      errs.forEach((e) => ls.push({ type: "stderr", text: e }));
      ls.push({ type: "blank" });
      ls.push({ type: "error", text: "Process exited with code 1" });
      return ls;
    }
    ls.push({ type: "prompt", text: `run --lang=${lang} --ds=graph` });
    ls.push({ type: "blank" });
    stps.forEach((s) => {
      let out = "";
      if (s.type === "addNode") out = `addNode(${s.label ?? s.value}) → node ${s.value}`;
      else if (s.type === "addEdge") out = `addEdge(${s.from}, ${s.to}) → ${s.message.includes("added") ? "edge added" : "failed"}`;
      else if (s.type === "removeNode") out = `removeNode(${s.id}) → ${s.message.includes("removed") ? "removed" : "not found"}`;
      else if (s.type === "removeEdge") out = `removeEdge(${s.from}, ${s.to}) → ${s.message.includes("removed") ? "removed" : "not found"}`;
      else if (s.type === "bfs") out = `bfs(${s.start}) → order: ${s.order.join(" → ")}`;
      else if (s.type === "dfs") out = `dfs(${s.start}) → order: ${s.order.join(" → ")}`;
      ls.push({ type: s.type, text: out, lineNum: s.lineNum + 1 });
    });
    ls.push({ type: "blank" });
    ls.push({ type: "success", text: `${stps.length} op${stps.length !== 1 ? "s" : ""} completed  ·  exit 0` });
    return ls;
  };

  const handleRun = async () => {
    doReset();
    setValidating(true);
    const v = await validateWithAI(code, lang);
    setValidating(false);
    if (!v.valid) {
      setAiErrors(v.errors ?? []);
      setTermLines(buildTerm([], [], v.errors ?? [], v.reason ?? ""));
      return;
    }
    const { steps: s, errors } = parseAndRunGraphCode(code);
    if (errors.length) {
      setError(errors.join("\n"));
      setTermLines(buildTerm([], errors, [], ""));
      return;
    }
    setSteps(s);
    setIdx(0);
    bump();
    setPlaying(true);
    setTermLines(buildTerm(s, [], [], ""));
  };

  const goTo = useCallback(
    (i) => {
      clearInterval(timerRef.current);
      setPlaying(false);
      const ni = Math.max(0, Math.min(i, steps.length - 1));
      setIdx(ni);
      bump();
    },
    [steps]
  );

  useEffect(() => {
    const h = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleRun();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [code, lang]);

  useEffect(() => {
    if (!playing || !steps.length) return;
    timerRef.current = setInterval(() => {
      setIdx((p) => {
        if (p >= steps.length - 1) {
          clearInterval(timerRef.current);
          setPlaying(false);
          setDone(true);
          return p;
        }
        const next = p + 1;
        bump();
        return next;
      });
    }, speed * 1000);
    return () => clearInterval(timerRef.current);
  }, [playing, steps, speed]);

  useEffect(() => {
    listRef.current?.querySelector(".sla")?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [idx]);

  const onKeyDown = (e) => {
    if (e.key !== "Tab") return;
    e.preventDefault();
    const s = e.target.selectionStart,
      en = e.target.selectionEnd;
    const nv = code.slice(0, s) + "  " + code.slice(en);
    setCode(nv);
    requestAnimationFrame(() => {
      if (taRef.current) {
        taRef.current.selectionStart = s + 2;
        taRef.current.selectionEnd = s + 2;
      }
    });
  };

  const step = steps[idx] ?? null,
    os = step ? OP[step.type] ?? OP.addNode : null;
  const prog = steps.length ? Math.round(((idx + 1) / steps.length) * 100) : 0;
  const hasAiErr = aiErrors.length > 0,
    idle = steps.length === 0 && !error && !hasAiErr;
  const lm = LANGS[lang] ?? LANGS.javascript;
  const errLineSet = new Set(aiErrors.map((e) => (e.line ?? 1) - 1));
  const metrics = [
    { lbl: "NODES", val: step?.nodeCount ?? 0, c: "#93c5fd" },
    { lbl: "EDGES", val: step?.edgeCount ?? 0, c: "#fbbf24" },
    { lbl: "OP", val: step?.type?.toUpperCase() ?? "—", c: step ? OP[step.type]?.c ?? "#60a5fa" : "#1e3a50" },
    { lbl: "STEP", val: steps.length ? `${idx + 1}/${steps.length}` : "—", c: "#a78bfa" },
  ];

  const panel = {
    background: "rgba(4,8,22,0.98)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 12,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    minHeight: 0,
    boxShadow: "0 16px 48px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,255,255,0.04)",
  };
  const titlebar = {
    padding: "6px 12px",
    borderBottom: "1px solid rgba(255,255,255,0.07)",
    background: "rgba(3,7,20,0.95)",
    display: "flex",
    alignItems: "center",
    gap: 6,
    flexShrink: 0,
  };
  const dot = (c) => ({ width: 8, height: 8, borderRadius: "50%", background: c, display: "inline-block" });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700;800&family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html,body{height:100%;overflow:hidden}
        body{background:#03060f;color:#c8dff5;font-family:'DM Sans',sans-serif;}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes idleFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
        @keyframes logoBreathe{0%,100%{box-shadow:0 0 12px rgba(59,130,246,0.38)}50%{box-shadow:0 0 24px rgba(59,130,246,0.7),0 0 40px rgba(59,130,246,0.14)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}
        @keyframes pop{0%{transform:scale(.82);opacity:0}65%{transform:scale(1.07)}100%{transform:scale(1);opacity:1}}
        @keyframes progressGlow{0%,100%{box-shadow:0 0 5px rgba(96,165,250,0.45)}50%{box-shadow:0 0 12px rgba(96,165,250,0.85)}}
        @keyframes pillActive{0%,100%{box-shadow:0 0 0 rgba(96,165,250,0)}50%{box-shadow:0 0 8px rgba(96,165,250,0.3)}}
        @keyframes panelFade{0%{opacity:0;transform:translateY(-5px) scale(.98)}100%{opacity:1;transform:none}}
        @keyframes toastIn{0%{opacity:0;transform:translateY(10px) scale(.94)}100%{opacity:1;transform:none}}
        @keyframes toastOut{0%{opacity:1}100%{opacity:0;transform:translateY(-6px)}}
        @keyframes runPulse{0%,100%{box-shadow:0 0 18px rgba(59,130,246,0.4)}50%{box-shadow:0 0 28px rgba(59,130,246,0.65)}}
        button:hover{filter:brightness(1.14)}
        ::-webkit-scrollbar{width:3px;height:3px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(96,165,250,0.18);border-radius:4px}
      `}</style>

      <div
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          background:
            "radial-gradient(ellipse 60% 44% at 7% 0%,rgba(29,78,216,0.07) 0%,transparent 55%),radial-gradient(ellipse 46% 38% at 93% 100%,rgba(124,58,237,0.05) 0%,transparent 52%),#03060f",
        }}
      >
        {/* HEADER */}
        <header
          style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "6px 18px",
            background: "rgba(2,5,16,0.99)",
            backdropFilter: "blur(24px)",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 1px 0 rgba(59,130,246,0.06),0 4px 22px rgba(0,0,0,0.55)",
            zIndex: 20,
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              flexShrink: 0,
              background: "linear-gradient(135deg,#1e3a8a,#2563eb 52%,#7c3aed)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              animation: "logoBreathe 3.5s ease-in-out infinite",
            }}
          >
            📊
          </div>
          <div>
            <div
              style={{
                fontFamily: "'Syne',sans-serif",
                fontSize: 14,
                fontWeight: 800,
                letterSpacing: "-.1px",
                background: "linear-gradient(90deg,#60a5fa,#a78bfa 50%,#60a5fa)",
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                animation: "shimmer 5s linear infinite",
              }}
            >
              VisuoSlayer Graph
            </div>
            <div
              style={{
                fontSize: 6.5,
                color: "#2a4060",
                fontFamily: "'JetBrains Mono',monospace",
                marginTop: 0.5,
                letterSpacing: ".08em",
                textTransform: "uppercase",
              }}
            >
              Graph Algorithm Visualizer
            </div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
            <div
              style={{
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: 7.5,
                color: "#93c5fd",
                padding: "2px 9px",
                borderRadius: 20,
                border: "1px solid rgba(96,165,250,0.32)",
                background: "rgba(59,130,246,0.1)",
                letterSpacing: ".08em",
                fontWeight: 700,
              }}
            >
              GRAPH
            </div>
            <div
              style={{
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: 7.5,
                padding: "2px 9px",
                borderRadius: 20,
                fontWeight: 800,
                color: lm.accent,
                background: lm.bg,
                border: `1px solid ${lm.border}`,
              }}
            >
              {lm.name}
            </div>
            <div
              style={{
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: 6.5,
                color: "#3a5878",
                padding: "2px 8px",
                borderRadius: 20,
                border: "1px solid rgba(255,255,255,0.09)",
                background: "rgba(255,255,255,0.025)",
              }}
            >
              pid:{sessionId}
            </div>
          </div>
        </header>

        {/* MAIN GRID */}
        <main
          style={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: "0.85fr 1.15fr",
            gap: 6,
            padding: "6px 18px 8px",
            minHeight: 0,
            overflow: "hidden",
          }}
        >
          {/* LEFT PANEL */}
          <div style={panel}>
            <div style={titlebar}>
              {["#ff5f57", "#ffbd2e", "#28c840"].map((c, i) => (
                <span key={i} style={dot(c)} />
              ))}
              <span
                style={{
                  marginLeft: 6,
                  fontFamily: "'JetBrains Mono',monospace",
                  fontSize: 7,
                  color: "#4a6a88",
                  textTransform: "uppercase",
                  letterSpacing: "1.2px",
                  fontWeight: 700,
                }}
              >
                Code Editor
              </span>
              <span
                style={{
                  marginLeft: "auto",
                  fontFamily: "'JetBrains Mono',monospace",
                  fontSize: 7.5,
                  fontWeight: 800,
                  color: lm.accent,
                  background: lm.bg,
                  border: `1px solid ${lm.border}`,
                  padding: "1px 8px",
                  borderRadius: 20,
                }}
              >
                {lm.name}
              </span>
            </div>

            <div
              style={{
                flex: termOpen ? "0 0 58%" : 1,
                display: "flex",
                flexDirection: "column",
                minHeight: 0,
                borderBottom: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              {/* Language tabs */}
              <div
                style={{
                  display: "flex",
                  gap: 4,
                  flexWrap: "wrap",
                  padding: "6px 10px",
                  borderBottom: "1px solid rgba(255,255,255,0.07)",
                  background: "rgba(3,6,18,0.96)",
                  flexShrink: 0,
                }}
              >
                {Object.entries(LANGS).map(([k, m]) => (
                  <button
                    key={k}
                    onClick={() => handleChangeLang(k)}
                    style={{
                      padding: "4px 10px",
                      borderRadius: 6,
                      cursor: "pointer",
                      fontFamily: "'JetBrains Mono',monospace",
                      fontSize: 8.5,
                      fontWeight: 800,
                      letterSpacing: ".04em",
                      border: `1.5px solid ${lang === k ? m.border : "rgba(255,255,255,0.18)"}`,
                      background: lang === k ? m.bg : "rgba(255,255,255,0.06)",
                      color: lang === k ? m.accent : "#8aaccc",
                      transition: "all .12s",
                      outline: "none",
                    }}
                  >
                    {m.ext}
                  </button>
                ))}
              </div>

              <CodeEditor
                code={code}
                setCode={setCode}
                step={step}
                errorLineSet={errLineSet}
                onKeyDown={onKeyDown}
                taRef={taRef}
              />

              {step && os && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "4px 10px",
                    borderLeft: `2px solid ${os.bd}`,
                    minHeight: 24,
                    borderTop: "1px solid rgba(255,255,255,0.07)",
                    flexShrink: 0,
                    animation: "fadeUp .14s ease",
                    background: os.bg,
                  }}
                >
                  <span style={{ color: os.c, fontSize: 9, fontWeight: 700 }}>{os.icon}</span>
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono',monospace",
                      fontSize: 8,
                      fontWeight: 700,
                      color: os.c,
                    }}
                  >
                    L{step.lineNum + 1}
                  </span>
                  <code
                    style={{
                      fontFamily: "'JetBrains Mono',monospace",
                      fontSize: 8,
                      color: "#4a6a88",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      flex: 1,
                    }}
                  >
                    {step.codeLine}
                  </code>
                </div>
              )}

              {/* Run bar */}
              <div
                style={{
                  padding: "6px 10px",
                  borderTop: "1px solid rgba(255,255,255,0.07)",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  flexShrink: 0,
                  background: "rgba(2,5,15,0.78)",
                }}
              >
                <button
                  onClick={handleRun}
                  disabled={playing || validating}
                  style={{
                    padding: "5px 16px",
                    borderRadius: 7,
                    background:
                      playing || validating
                        ? "linear-gradient(135deg,#1e3a6e,#1d4ed8)"
                        : "linear-gradient(135deg,#1e40af,#2563eb,#3b82f6)",
                    border: `1.5px solid rgba(96,165,250,${playing || validating ? 0.18 : 0.48})`,
                    color: "#fff",
                    fontFamily: "'JetBrains Mono',monospace",
                    fontSize: 9,
                    fontWeight: 800,
                    cursor: playing || validating ? "not-allowed" : "pointer",
                    letterSpacing: ".05em",
                    boxShadow: playing || validating ? "none" : "0 0 20px rgba(59,130,246,0.42),0 2px 8px rgba(0,0,0,0.4)",
                    animation: playing || validating ? "runPulse 1s ease-in-out infinite" : "none",
                    opacity: playing || validating ? 0.58 : 1,
                    transition: "all .14s",
                    outline: "none",
                  }}
                >
                  {validating ? "⟳  AI Review…" : playing ? "▶  Running…" : "▶  Run & Visualize"}
                </button>
                {(steps.length > 0 || error || hasAiErr) && (
                  <button
                    onClick={doReset}
                    style={{
                      padding: "5px 11px",
                      borderRadius: 7,
                      background: "transparent",
                      border: "1.5px solid rgba(248,113,113,0.4)",
                      color: "#f87171",
                      fontFamily: "'JetBrains Mono',monospace",
                      fontSize: 8,
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "all .13s",
                      outline: "none",
                    }}
                  >
                    ↺ Reset
                  </button>
                )}
                <span
                  style={{
                    fontFamily: "'JetBrains Mono',monospace",
                    fontSize: 7,
                    color: "#4a6a88",
                    padding: "2px 7px",
                    borderRadius: 5,
                    border: "1px solid rgba(255,255,255,0.11)",
                    background: "rgba(255,255,255,0.03)",
                  }}
                >
                  ⌘↵
                </span>
              </div>
            </div>

            {/* Terminal */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                minHeight: 0,
                overflow: "hidden",
                flex: termOpen ? 1 : "0 0 0px",
                opacity: termOpen ? 1 : 0,
                pointerEvents: termOpen ? "auto" : "none",
                transition: "flex .28s cubic-bezier(.4,0,.2,1),opacity .2s ease",
              }}
            >
              <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "5px 10px",
                    background: "rgba(2,4,12,0.99)",
                    borderBottom: "1px solid rgba(255,255,255,0.07)",
                    borderTop: "1px solid rgba(255,255,255,0.07)",
                    flexShrink: 0,
                  }}
                >
                  {["#ff5f57", "#ffbd2e", "#28c840"].map((c, i) => (
                    <span key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: c, display: "inline-block" }} />
                  ))}
                  <span
                    style={{
                      marginLeft: 6,
                      fontFamily: "'JetBrains Mono',monospace",
                      fontSize: 7,
                      color: "#4a6a88",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                    }}
                  >
                    terminal
                  </span>
                  <button
                    onClick={() => setTermOpen(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 16,
                      height: 16,
                      borderRadius: 3,
                      border: "1px solid rgba(255,255,255,0.14)",
                      background: "rgba(255,255,255,0.05)",
                      cursor: "pointer",
                      color: "#4a6a88",
                      fontSize: 8,
                      fontWeight: 800,
                      marginLeft: "auto",
                      outline: "none",
                    }}
                  >
                    ▾
                  </button>
                </div>
                <Terminal lines={termLines} validating={validating} />
              </div>
            </div>
            {!termOpen && (
              <div
                onClick={() => setTermOpen(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "5px 10px",
                  background: "rgba(2,4,12,0.99)",
                  borderTop: "1px solid rgba(255,255,255,0.07)",
                  flexShrink: 0,
                  cursor: "pointer",
                }}
              >
                {["#ff5f57", "#ffbd2e", "#28c840"].map((c, i) => (
                  <span key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: c, display: "inline-block" }} />
                ))}
                <span
                  style={{
                    marginLeft: 6,
                    fontFamily: "'JetBrains Mono',monospace",
                    fontSize: 7,
                    color: "#4a6a88",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                  }}
                >
                  terminal
                </span>
                {termLines.some((l) => l.type === "error" || l.type === "stderr") && (
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono',monospace",
                      fontSize: 6.5,
                      color: "#f87171",
                      background: "rgba(239,68,68,0.12)",
                      border: "1px solid rgba(248,113,113,0.26)",
                      padding: "0 5px",
                      borderRadius: 8,
                      marginLeft: 4,
                    }}
                  >
                    errors
                  </span>
                )}
                {termLines.some((l) => l.type === "success") && (
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono',monospace",
                      fontSize: 6.5,
                      color: "#4ade80",
                      background: "rgba(74,222,128,0.1)",
                      border: "1px solid rgba(74,222,128,0.26)",
                      padding: "0 5px",
                      borderRadius: 8,
                      marginLeft: 4,
                    }}
                  >
                    ok
                  </span>
                )}
                <span
                  style={{
                    marginLeft: "auto",
                    fontFamily: "'JetBrains Mono',monospace",
                    fontSize: 7,
                    color: "#60a5fa",
                    fontWeight: 700,
                  }}
                >
                  ▴
                </span>
              </div>
            )}
          </div>

          {/* RIGHT PANEL */}
          <div style={{ ...panel, position: "relative" }}>
            <div style={titlebar}>
              {["#60a5fa", "#f87171", "#fbbf24"].map((c, i) => (
                <span key={i} style={dot(c)} />
              ))}
              <span
                style={{
                  marginLeft: 6,
                  fontFamily: "'JetBrains Mono',monospace",
                  fontSize: 7,
                  color: "#4a6a88",
                  textTransform: "uppercase",
                  letterSpacing: "1.2px",
                  fontWeight: 700,
                }}
              >
                Visualization
              </span>
              {steps.length > 0 && (
                <span
                  style={{
                    marginLeft: "auto",
                    fontFamily: "'JetBrains Mono',monospace",
                    fontSize: 7.5,
                    color: "#93c5fd",
                    background: "rgba(59,130,246,0.14)",
                    border: "1px solid rgba(96,165,250,0.32)",
                    padding: "1px 8px",
                    borderRadius: 20,
                    fontWeight: 800,
                    animation: "pop .18s ease",
                  }}
                >
                  {idx + 1}/{steps.length}
                </span>
              )}
              <button
                onClick={() => setShowOh((v) => !v)}
                style={{
                  marginLeft: steps.length > 0 ? 4 : "auto",
                  padding: "1px 8px",
                  borderRadius: 20,
                  cursor: "pointer",
                  fontFamily: "'JetBrains Mono',monospace",
                  fontSize: 7.5,
                  fontWeight: 700,
                  border: `1.5px solid ${showOh ? "rgba(167,139,250,0.5)" : "rgba(167,139,250,0.28)"}`,
                  background: showOh ? "rgba(167,139,250,0.18)" : "rgba(167,139,250,0.06)",
                  color: "#a78bfa",
                  transition: "all .13s",
                  outline: "none",
                }}
              >
                O(·)
              </button>
            </div>

            <ComplexityPanel visible={showOh} onClose={() => setShowOh(false)} />

            {/* Metrics */}
            <div
              style={{
                display: "flex",
                borderBottom: "1px solid rgba(255,255,255,0.07)",
                background: "rgba(2,5,18,0.92)",
                flexShrink: 0,
              }}
            >
              {metrics.map((m, mi) => (
                <div
                  key={m.lbl}
                  style={{
                    flex: 1,
                    padding: "6px",
                    textAlign: "center",
                    borderRight: mi < 3 ? "1px solid rgba(255,255,255,0.07)" : "none",
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono',monospace",
                      fontSize: 5.5,
                      color: "#2a4060",
                      letterSpacing: ".2em",
                      textTransform: "uppercase",
                      fontWeight: 700,
                    }}
                  >
                    {m.lbl}
                  </span>
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono',monospace",
                      fontSize: 14,
                      fontWeight: 800,
                      lineHeight: 1.1,
                      color: m.c,
                      transition: "color .3s",
                    }}
                  >
                    {String(m.val)}
                  </span>
                </div>
              ))}
            </div>

            {/* Graph canvas */}
            <div
              style={{
                flex: 1,
                position: "relative",
                overflow: "auto",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "center",
                padding: "10px 8px 6px",
                minHeight: 0,
                scrollbarWidth: "thin",
                scrollbarColor: "rgba(96,165,250,0.1) transparent",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  pointerEvents: "none",
                  backgroundImage:
                    "linear-gradient(rgba(59,130,246,0.028) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,0.028) 1px,transparent 1px)",
                  backgroundSize: "40px 40px",
                  zIndex: 0,
                }}
              />
              <div style={{ position: "relative", zIndex: 2, width: "100%" }}>
                <GraphViz
                  graph={step?.graph ?? null}
                  highlight={step?.highlight ?? []}
                  animKey={animKey}
                  idle={idle}
                />
              </div>
            </div>

            {/* Op message */}
            <div
              style={{
                padding: "5px 12px",
                borderTop: "1px solid rgba(255,255,255,0.07)",
                background: "rgba(2,5,16,0.72)",
                minHeight: 38,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {step && os ? (
                <>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "2px 10px",
                      borderRadius: 18,
                      fontFamily: "'JetBrains Mono',monospace",
                      fontSize: 8,
                      fontWeight: 800,
                      animation: "pop .18s ease",
                      border: `1.5px solid ${os.bd}`,
                      color: os.c,
                      background: os.bg,
                      flexShrink: 0,
                    }}
                  >
                    <span>{os.icon}</span>
                    <span>{os.label}</span>
                    <span style={{ opacity: 0.6 }}>
                      {step.type === "addNode" && (step.label ?? step.value)}
                      {step.type === "addEdge" && `(${step.from},${step.to})`}
                      {step.type === "removeNode" && `(${step.id})`}
                      {step.type === "removeEdge" && `(${step.from},${step.to})`}
                      {step.type === "bfs" && `(${step.start})`}
                      {step.type === "dfs" && `(${step.start})`}
                    </span>
                  </div>
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono',monospace",
                      fontSize: 8.5,
                      color: "#4a6a88",
                      flex: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      animation: "fadeUp .16s ease",
                    }}
                  >
                    {step.message}
                  </span>
                </>
              ) : (
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: "#2a4060" }}>
                  {idle
                    ? "📊  Write Graph code · addNode / addEdge · Run"
                    : hasAiErr
                    ? "⚠  Errors found — see terminal"
                    : error
                    ? "✗  Fix errors and run again"
                    : validating
                    ? "⟳  Reviewing…"
                    : "⏸  Ready"}
                </span>
              )}
            </div>

            {/* Playback controls */}
            {steps.length > 0 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "4px 10px",
                  borderTop: "1px solid rgba(255,255,255,0.07)",
                  background: "rgba(2,4,14,0.82)",
                  flexShrink: 0,
                }}
              >
                {[
                  ["⏮", () => goTo(0), idx <= 0],
                  ["◀", () => goTo(idx - 1), idx <= 0],
                ].map(([icon, fn, dis], i) => (
                  <button
                    key={i}
                    onClick={fn}
                    disabled={dis}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 6,
                      border: "1.5px solid rgba(255,255,255,0.14)",
                      background: "rgba(10,18,44,0.82)",
                      color: dis ? "#1e3a50" : "#7a9cb8",
                      fontSize: 10,
                      cursor: dis ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all .12s",
                      outline: "none",
                    }}
                  >
                    {icon}
                  </button>
                ))}
                <button
                  onClick={() => {
                    if (done || idx >= steps.length - 1) {
                      setIdx(0);
                      bump();
                      setDone(false);
                      setPlaying(true);
                    } else {
                      clearInterval(timerRef.current);
                      setPlaying((p) => !p);
                    }
                  }}
                  style={{
                    height: 24,
                    padding: "0 12px",
                    borderRadius: 6,
                    background: "linear-gradient(135deg,#1e40af,#2563eb,#3b82f6)",
                    border: "1.5px solid rgba(96,165,250,0.45)",
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: 800,
                    cursor: "pointer",
                    boxShadow: "0 0 12px rgba(59,130,246,0.4)",
                    transition: "all .13s",
                    outline: "none",
                  }}
                >
                  {playing ? "⏸" : done ? "↺" : "▶"}
                </button>
                {[
                  ["▶", () => goTo(idx + 1), idx >= steps.length - 1],
                  ["⏭", () => goTo(steps.length - 1), idx >= steps.length - 1],
                ].map(([icon, fn, dis], i) => (
                  <button
                    key={i}
                    onClick={fn}
                    disabled={dis}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 6,
                      border: "1.5px solid rgba(255,255,255,0.14)",
                      background: "rgba(10,18,44,0.82)",
                      color: dis ? "#1e3a50" : "#7a9cb8",
                      fontSize: 10,
                      cursor: dis ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all .12s",
                      outline: "none",
                    }}
                  >
                    {icon}
                  </button>
                ))}
                <div style={{ width: 1, height: 14, background: "rgba(255,255,255,0.09)", margin: "0 2px" }} />
                <div style={{ display: "flex", gap: 2 }}>
                  {[
                    [2, "½×"],
                    [1.4, "1×"],
                    [0.7, "2×"],
                  ].map(([s, lbl]) => (
                    <button
                      key={s}
                      onClick={() => setSpeed(s)}
                      style={{
                        padding: "2px 7px",
                        borderRadius: 5,
                        cursor: "pointer",
                        fontFamily: "'JetBrains Mono',monospace",
                        fontSize: 7.5,
                        fontWeight: 800,
                        border: `1.5px solid ${speed === s ? "rgba(96,165,250,0.48)" : "rgba(255,255,255,0.13)"}`,
                        background: speed === s ? "rgba(59,130,246,0.16)" : "rgba(255,255,255,0.03)",
                        color: speed === s ? "#93c5fd" : "#6a8eaa",
                        transition: "all .12s",
                        outline: "none",
                      }}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
                <div style={{ width: 1, height: 14, background: "rgba(255,255,255,0.09)", margin: "0 2px" }} />
                <button
                  onClick={() => {
                    if (!step) return;
                    const info = `${step.type}: ${step.type === "addNode" ? step.label ?? step.value : step.type === "addEdge" ? `${step.from}→${step.to}` : step.type === "removeNode" ? step.id : step.type === "removeEdge" ? `${step.from}→${step.to}` : step.start} | nodes:${step.nodeCount} edges:${step.edgeCount}`;
                    navigator.clipboard?.writeText(info).then(() => showToast("Copied!"));
                  }}
                  title="Copy state"
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    border: "1.5px solid rgba(255,255,255,0.14)",
                    background: "rgba(10,18,44,0.82)",
                    color: "#6a8eaa",
                    fontSize: 10,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    outline: "none",
                  }}
                >
                  📋
                </button>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, marginLeft: "auto" }}>
                  <span style={{ color: "#93c5fd", fontWeight: 800 }}>{idx + 1}</span>
                  <span style={{ color: "#2a4060" }}>/{steps.length}</span>
                </span>
              </div>
            )}

            {/* Progress */}
            {steps.length > 0 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 12px",
                  borderTop: "1px solid rgba(255,255,255,0.07)",
                  flexShrink: 0,
                }}
              >
                <div style={{ flex: 1, height: 2, background: "rgba(255,255,255,0.05)", borderRadius: 99, overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      borderRadius: 99,
                      width: `${prog}%`,
                      transition: "width .36s cubic-bezier(.4,0,.2,1)",
                      background: "linear-gradient(90deg,#1e40af,#3b82f6,#93c5fd)",
                      animation: "progressGlow 2.4s ease-in-out infinite",
                    }}
                  />
                </div>
                <span
                  style={{
                    fontFamily: "'JetBrains Mono',monospace",
                    fontSize: 7,
                    color: "#2a4060",
                    minWidth: 24,
                    textAlign: "right",
                    fontWeight: 700,
                  }}
                >
                  {prog}%
                </span>
              </div>
            )}

            {/* Op log pills */}
            {steps.length > 0 && (
              <div style={{ flexShrink: 0, borderTop: "1px solid rgba(255,255,255,0.07)", background: "rgba(2,4,14,0.9)" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "3px 12px 2px",
                    fontFamily: "'JetBrains Mono',monospace",
                    fontSize: 5.5,
                    color: "#2a4060",
                    letterSpacing: ".18em",
                    textTransform: "uppercase",
                    fontWeight: 700,
                  }}
                >
                  <span>Operation Log</span>
                  <span style={{ color: "#60a5fa" }}>{steps.length} ops</span>
                </div>
                <div
                  ref={listRef}
                  style={{
                    overflowX: "auto",
                    overflowY: "hidden",
                    padding: "2px 8px 6px",
                    display: "flex",
                    gap: 3,
                    alignItems: "center",
                    scrollbarWidth: "thin",
                    scrollbarColor: "rgba(96,165,250,0.12) transparent",
                  }}
                >
                  {steps.map((s, i) => {
                    const sm = OP[s.type] ?? OP.addNode,
                      past = i < idx,
                      active = i === idx;
                    return (
                      <div
                        key={i}
                        className={active ? "sla" : ""}
                        onClick={() => goTo(i)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 3,
                          padding: "2px 8px",
                          borderRadius: 16,
                          cursor: "pointer",
                          fontFamily: "'JetBrains Mono',monospace",
                          fontSize: 7.5,
                          fontWeight: 700,
                          flexShrink: 0,
                          color: active ? sm.c : past ? "#6a8eaa" : "#2a4060",
                          border: `1.5px solid ${active ? sm.bd : past ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.05)"}`,
                          background: active ? sm.bg : past ? "rgba(255,255,255,0.03)" : "transparent",
                          boxShadow: active ? "0 0 8px rgba(96,165,250,0.22)" : "none",
                          animation: active ? "pillActive 1.5s ease-in-out infinite" : "none",
                          transition: "all .13s",
                        }}
                      >
                        <span
                          style={{
                            width: 4,
                            height: 4,
                            borderRadius: "50%",
                            flexShrink: 0,
                            background: past ? "#4ade80" : active ? sm.c : "#1e3a50",
                            boxShadow: active
                              ? `0 0 4px ${sm.c}`
                              : past
                              ? "0 0 3px rgba(74,222,128,0.5)"
                              : "none",
                          }}
                        />
                        <span>
                          {sm.label.toLowerCase()}
                          <span style={{ opacity: 0.5 }}>
                            {s.type === "addNode" && `(${s.label ?? s.value})`}
                            {s.type === "addEdge" && `(${s.from},${s.to})`}
                            {s.type === "removeNode" && `(${s.id})`}
                            {s.type === "removeEdge" && `(${s.from},${s.to})`}
                            {s.type === "bfs" && `(${s.start})`}
                            {s.type === "dfs" && `(${s.start})`}
                          </span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 16,
            right: 16,
            padding: "6px 14px",
            borderRadius: 8,
            fontFamily: "'JetBrains Mono',monospace",
            fontSize: 8.5,
            fontWeight: 700,
            background: "rgba(4,10,28,0.98)",
            border: "1px solid rgba(96,165,250,0.22)",
            color: "#4ade80",
            boxShadow: "0 8px 26px rgba(0,0,0,0.6)",
            zIndex: 9999,
            animation: "toastIn .2s ease, toastOut .24s ease 1.9s forwards",
            backdropFilter: "blur(16px)",
          }}
        >
          {toast}
        </div>
      )}
    </>
  );
}