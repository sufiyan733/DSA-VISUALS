"use client";
import { useState, useRef, useEffect, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════════════════
// INTERNAL GRAPH ENGINE — self-contained, no dependency on user code
// ═══════════════════════════════════════════════════════════════════════════
class GNode {
  constructor(id, label) { this.id = id; this.label = label ?? String(id); }
}

class GEngine {
  constructor(directed = false) {
    this.nodes   = new Map(); // id → GNode
    this.adj     = new Map(); // id → Set<id>
    this.weights = new Map(); // "u-v" → number
    this.directed = directed;
    this.nextId  = 0;
  }
  addNode(label) {
    const id = this.nextId++;
    this.nodes.set(id, new GNode(id, label));
    this.adj.set(id, new Set());
    return id;
  }
  addEdge(u, v, w = 1) {
    if (!this.nodes.has(u) || !this.nodes.has(v)) return false;
    this.adj.get(u).add(v);
    this.weights.set(`${u}-${v}`, w);
    if (!this.directed) { this.adj.get(v).add(u); this.weights.set(`${v}-${u}`, w); }
    return true;
  }
  removeNode(id) {
    if (!this.nodes.has(id)) return false;
    for (const nb of this.adj.get(id)) { this.adj.get(nb)?.delete(id); }
    this.adj.delete(id); this.nodes.delete(id); return true;
  }
  removeEdge(u, v) {
    if (!this.adj.get(u)?.has(v)) return false;
    this.adj.get(u).delete(v); this.weights.delete(`${u}-${v}`);
    if (!this.directed) { this.adj.get(v).delete(u); this.weights.delete(`${v}-${u}`); }
    return true;
  }
  bfs(start) {
    if (!this.nodes.has(start)) return { order:[], edges:[] };
    const visited = new Set([start]), queue = [start], order = [start], edges = [];
    while (queue.length) {
      const u = queue.shift();
      for (const v of [...this.adj.get(u)].sort((a,b)=>a-b)) {
        if (!visited.has(v)) { visited.add(v); queue.push(v); order.push(v); edges.push([u,v]); }
      }
    }
    return { order, edges };
  }
  dfs(start) {
    if (!this.nodes.has(start)) return { order:[], edges:[] };
    const visited = new Set(), stack = [start], order = [], edges = [];
    while (stack.length) {
      const u = stack.pop();
      if (visited.has(u)) continue;
      visited.add(u); order.push(u);
      for (const v of [...this.adj.get(u)].sort((a,b)=>b-a)) {
        if (!visited.has(v)) { stack.push(v); edges.push([u,v]); }
      }
    }
    return { order, edges };
  }
  dijkstra(start) {
    if (!this.nodes.has(start)) return { dist:{}, prev:{}, order:[], edges:[] };
    const dist = {}, prev = {}, visited = new Set(), order = [];
    for (const id of this.nodes.keys()) dist[id] = Infinity;
    dist[start] = 0;
    const pq = [[0, start]];
    while (pq.length) {
      pq.sort((a,b) => a[0]-b[0]);
      const [d, u] = pq.shift();
      if (visited.has(u)) continue;
      visited.add(u); order.push(u);
      for (const v of this.adj.get(u)) {
        const w = this.weights.get(`${u}-${v}`) ?? 1;
        if (d + w < dist[v]) { dist[v] = d + w; prev[v] = u; pq.push([dist[v], v]); }
      }
    }
    const edges = Object.entries(prev).map(([v,u]) => [Number(u), Number(v)]);
    return { dist, prev, order, edges };
  }
  getEdgeList() {
    const list = [], seen = new Set();
    for (const [u, nbrs] of this.adj) {
      for (const v of nbrs) {
        const key = this.directed ? `${u}-${v}` : `${Math.min(u,v)}-${Math.max(u,v)}`;
        if (!seen.has(key)) { seen.add(key); list.push({ u, v, w: this.weights.get(`${u}-${v}`) ?? 1 }); }
      }
    }
    return list;
  }
  getDegree(id) { return this.adj.get(id)?.size ?? 0; }
  clone() {
    const g = new GEngine(this.directed);
    for (const [id, n] of this.nodes) { g.nodes.set(id, new GNode(id, n.label)); g.adj.set(id, new Set(this.adj.get(id))); }
    g.weights = new Map(this.weights); g.nextId = this.nextId; return g;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// FORCE LAYOUT
// ═══════════════════════════════════════════════════════════════════════════
function runForceLayout(nodeIds, edges, W, H) {
  if (!nodeIds.length) return new Map();
  const k = Math.sqrt((W * H) / nodeIds.length) * 0.85;
  const pos = new Map();
  nodeIds.forEach((id, i) => {
    const a = (i / nodeIds.length) * 2 * Math.PI;
    pos.set(id, { x: W/2 + Math.min(W,H)*0.32*Math.cos(a) + (Math.random()-.5)*8, y: H/2 + Math.min(W,H)*0.32*Math.sin(a) + (Math.random()-.5)*8 });
  });
  for (let iter = 0; iter < 120; iter++) {
    const disp = new Map(); nodeIds.forEach(id => disp.set(id, { x:0, y:0 }));
    for (let i = 0; i < nodeIds.length; i++) for (let j = i+1; j < nodeIds.length; j++) {
      const a = nodeIds[i], b = nodeIds[j], pa = pos.get(a), pb = pos.get(b);
      let dx = pa.x-pb.x, dy = pa.y-pb.y, d = Math.max(Math.sqrt(dx*dx+dy*dy), .01);
      const f = k*k/d; dx=dx/d*f; dy=dy/d*f;
      disp.get(a).x+=dx; disp.get(a).y+=dy; disp.get(b).x-=dx; disp.get(b).y-=dy;
    }
    for (const { u, v } of edges) {
      if (!pos.has(u)||!pos.has(v)) continue;
      const pu = pos.get(u), pv = pos.get(v);
      let dx = pu.x-pv.x, dy = pu.y-pv.y, d = Math.max(Math.sqrt(dx*dx+dy*dy), .01);
      const f = d*d/k; dx=dx/d*f; dy=dy/d*f;
      disp.get(u).x-=dx; disp.get(u).y-=dy; disp.get(v).x+=dx; disp.get(v).y+=dy;
    }
    const temp = k * Math.max(1 - iter/120, 0.05);
    for (const id of nodeIds) {
      const d = disp.get(id), len = Math.max(Math.sqrt(d.x*d.x+d.y*d.y),.01), mv = Math.min(len,temp), p = pos.get(id);
      p.x = Math.max(52, Math.min(W-52, p.x+d.x/len*mv));
      p.y = Math.max(52, Math.min(H-52, p.y+d.y/len*mv));
    }
  }
  return pos;
}

// ═══════════════════════════════════════════════════════════════════════════
// LANGUAGE TEMPLATES — full idiomatic code per language
// ═══════════════════════════════════════════════════════════════════════════
const LANGS = {
  javascript: { name:"JavaScript", ext:"JS",  accent:"#f7df1e", dim:"rgba(247,223,30,0.15)",  border:"rgba(247,223,30,0.4)"  },
  typescript: { name:"TypeScript", ext:"TS",  accent:"#3178c6", dim:"rgba(49,120,198,0.15)",  border:"rgba(49,120,198,0.45)" },
  python:     { name:"Python",     ext:"PY",  accent:"#4fb3d9", dim:"rgba(79,179,217,0.15)",  border:"rgba(79,179,217,0.4)"  },
  cpp:        { name:"C++",        ext:"C++", accent:"#00599c", dim:"rgba(0,89,156,0.18)",    border:"rgba(0,89,156,0.55)"   },
  java:       { name:"Java",       ext:"JV",  accent:"#ed8b00", dim:"rgba(237,139,0,0.15)",   border:"rgba(237,139,0,0.4)"   },
  go:         { name:"Go",         ext:"GO",  accent:"#00acd7", dim:"rgba(0,172,215,0.15)",   border:"rgba(0,172,215,0.4)"   },
};

const TEMPLATES = {
javascript: `// ─── Graph Implementation ─────────────────────────────────────
class Graph {
  constructor() {
    this.nodes   = new Map(); // id → label
    this.adj     = new Map(); // id → Set of neighbor ids
    this.weights = new Map(); // "u-v" → weight
    this.nextId  = 0;
  }

  // Add a node, returns its numeric ID
  addNode(label = null) {
    const id = this.nextId++;
    this.nodes.set(id, label ?? id);
    this.adj.set(id, new Set());
    return id;
  }

  // Add undirected edge between node IDs u and v
  addEdge(u, v, weight = 1) {
    if (!this.nodes.has(u) || !this.nodes.has(v)) return false;
    this.adj.get(u).add(v);
    this.adj.get(v).add(u);
    this.weights.set(\`\${u}-\${v}\`, weight);
    this.weights.set(\`\${v}-\${u}\`, weight);
    return true;
  }

  // Breadth-First Search from startId
  bfs(startId) {
    if (!this.nodes.has(startId)) return [];
    const visited = new Set([startId]);
    const queue   = [startId];
    const order   = [];
    while (queue.length) {
      const u = queue.shift();
      order.push(u);
      for (const v of this.adj.get(u)) {
        if (!visited.has(v)) { visited.add(v); queue.push(v); }
      }
    }
    return order;
  }

  // Depth-First Search from startId
  dfs(startId) {
    if (!this.nodes.has(startId)) return [];
    const visited = new Set();
    const stack   = [startId];
    const order   = [];
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

  // Dijkstra shortest path from startId
  dijkstra(startId) {
    const dist = {}, prev = {}, visited = new Set();
    for (const id of this.nodes.keys()) dist[id] = Infinity;
    dist[startId] = 0;
    const pq = [[0, startId]];
    while (pq.length) {
      pq.sort((a, b) => a[0] - b[0]);
      const [d, u] = pq.shift();
      if (visited.has(u)) continue;
      visited.add(u);
      for (const v of this.adj.get(u)) {
        const w   = this.weights.get(\`\${u}-\${v}\`) ?? 1;
        const alt = d + w;
        if (alt < dist[v]) { dist[v] = alt; prev[v] = u; pq.push([alt, v]); }
      }
    }
    return { dist, prev };
  }
}

// ─── Build & Traverse ──────────────────────────────────────────
const graph = new Graph();

// Add nodes (returns 0, 1, 2, …)
const a = graph.addNode("A");   // 0
const b = graph.addNode("B");   // 1
const c = graph.addNode("C");   // 2
const d = graph.addNode("D");   // 3
const e = graph.addNode("E");   // 4
const f = graph.addNode("F");   // 5

// Connect nodes by their IDs
graph.addEdge(a, b);
graph.addEdge(a, c);
graph.addEdge(b, d);
graph.addEdge(c, d);
graph.addEdge(d, e);
graph.addEdge(e, f);

// Traverse
graph.bfs(a);           // breadth-first from A
graph.dfs(a);           // depth-first  from A
graph.dijkstra(a);      // shortest paths from A`,

typescript: `// ─── Graph Implementation ─────────────────────────────────────
class Graph<T = string> {
  private nodes   = new Map<number, T | number>();
  private adj     = new Map<number, Set<number>>();
  private weights = new Map<string, number>();
  private nextId  = 0;

  // Add a node, returns its numeric ID
  addNode(label?: T): number {
    const id = this.nextId++;
    this.nodes.set(id, label ?? id);
    this.adj.set(id, new Set<number>());
    return id;
  }

  // Add undirected weighted edge
  addEdge(u: number, v: number, weight = 1): boolean {
    if (!this.nodes.has(u) || !this.nodes.has(v)) return false;
    this.adj.get(u)!.add(v);
    this.adj.get(v)!.add(u);
    this.weights.set(\`\${u}-\${v}\`, weight);
    this.weights.set(\`\${v}-\${u}\`, weight);
    return true;
  }

  // Breadth-First Search
  bfs(startId: number): number[] {
    if (!this.nodes.has(startId)) return [];
    const visited = new Set<number>([startId]);
    const queue   = [startId];
    const order: number[] = [];
    while (queue.length) {
      const u = queue.shift()!;
      order.push(u);
      for (const v of this.adj.get(u)!) {
        if (!visited.has(v)) { visited.add(v); queue.push(v); }
      }
    }
    return order;
  }

  // Depth-First Search
  dfs(startId: number): number[] {
    if (!this.nodes.has(startId)) return [];
    const visited = new Set<number>();
    const stack   = [startId];
    const order: number[] = [];
    while (stack.length) {
      const u = stack.pop()!;
      if (visited.has(u)) continue;
      visited.add(u); order.push(u);
      for (const v of this.adj.get(u)!) {
        if (!visited.has(v)) stack.push(v);
      }
    }
    return order;
  }

  // Dijkstra shortest paths
  dijkstra(startId: number): { dist: Record<number, number>; prev: Record<number, number> } {
    const dist: Record<number, number> = {};
    const prev: Record<number, number> = {};
    const visited = new Set<number>();
    for (const id of this.nodes.keys()) dist[id] = Infinity;
    dist[startId] = 0;
    const pq: [number, number][] = [[0, startId]];
    while (pq.length) {
      pq.sort((a, b) => a[0] - b[0]);
      const [d, u] = pq.shift()!;
      if (visited.has(u)) continue;
      visited.add(u);
      for (const v of this.adj.get(u)!) {
        const w   = this.weights.get(\`\${u}-\${v}\`) ?? 1;
        const alt = d + w;
        if (alt < dist[v]) { dist[v] = alt; prev[v] = u; pq.push([alt, v]); }
      }
    }
    return { dist, prev };
  }
}

// ─── Build & Traverse ──────────────────────────────────────────
const graph = new Graph<string>();

const a = graph.addNode("A");   // 0
const b = graph.addNode("B");   // 1
const c = graph.addNode("C");   // 2
const d = graph.addNode("D");   // 3
const e = graph.addNode("E");   // 4
const f = graph.addNode("F");   // 5

graph.addEdge(a, b);
graph.addEdge(a, c);
graph.addEdge(b, d);
graph.addEdge(c, d);
graph.addEdge(d, e);
graph.addEdge(e, f);

graph.bfs(a);
graph.dfs(a);
graph.dijkstra(a);`,

python: `# ─── Graph Implementation ──────────────────────────────────────
from collections import deque
import heapq

class Graph:
    def __init__(self):
        self.nodes   = {}    # id → label
        self.adj     = {}    # id → set of neighbor ids
        self.weights = {}    # (u, v) → weight
        self.next_id = 0

    def add_node(self, label=None):
        """Add a node, returns its numeric ID."""
        nid = self.next_id
        self.next_id += 1
        self.nodes[nid] = label if label is not None else nid
        self.adj[nid]   = set()
        return nid

    def add_edge(self, u, v, weight=1):
        """Add undirected edge between node IDs u and v."""
        if u not in self.nodes or v not in self.nodes:
            return False
        self.adj[u].add(v)
        self.adj[v].add(u)
        self.weights[(u, v)] = weight
        self.weights[(v, u)] = weight
        return True

    def bfs(self, start_id):
        """Breadth-First Search — returns visit order."""
        if start_id not in self.nodes:
            return []
        visited = {start_id}
        queue   = deque([start_id])
        order   = []
        while queue:
            u = queue.popleft()
            order.append(u)
            for v in sorted(self.adj[u]):
                if v not in visited:
                    visited.add(v)
                    queue.append(v)
        return order

    def dfs(self, start_id):
        """Depth-First Search — returns visit order."""
        if start_id not in self.nodes:
            return []
        visited = set()
        stack   = [start_id]
        order   = []
        while stack:
            u = stack.pop()
            if u in visited:
                continue
            visited.add(u)
            order.append(u)
            for v in sorted(self.adj[u], reverse=True):
                if v not in visited:
                    stack.append(v)
        return order

    def dijkstra(self, start_id):
        """Dijkstra shortest paths from start_id."""
        dist = {nid: float('inf') for nid in self.nodes}
        prev = {}
        dist[start_id] = 0
        pq = [(0, start_id)]
        visited = set()
        while pq:
            d, u = heapq.heappop(pq)
            if u in visited:
                continue
            visited.add(u)
            for v in self.adj[u]:
                w   = self.weights.get((u, v), 1)
                alt = d + w
                if alt < dist[v]:
                    dist[v] = alt
                    prev[v] = u
                    heapq.heappush(pq, (alt, v))
        return dist, prev


# ─── Build & Traverse ──────────────────────────────────────────
graph = Graph()

a = graph.add_node("A")   # 0
b = graph.add_node("B")   # 1
c = graph.add_node("C")   # 2
d = graph.add_node("D")   # 3
e = graph.add_node("E")   # 4
f = graph.add_node("F")   # 5

graph.add_edge(a, b)
graph.add_edge(a, c)
graph.add_edge(b, d)
graph.add_edge(c, d)
graph.add_edge(d, e)
graph.add_edge(e, f)

graph.bfs(a)
graph.dfs(a)
graph.dijkstra(a)`,

cpp: `// ─── Graph Implementation ─────────────────────────────────────
#include <iostream>
#include <unordered_map>
#include <unordered_set>
#include <vector>
#include <queue>
#include <stack>
#include <string>
#include <limits>
#include <algorithm>

class Graph {
private:
    struct Node { int id; std::string label; };

    std::unordered_map<int, Node>                       nodes;
    std::unordered_map<int, std::unordered_set<int>>    adj;
    std::unordered_map<std::string, double>             weights;
    int nextId = 0;

    std::string edgeKey(int u, int v) const {
        return std::to_string(u) + "-" + std::to_string(v);
    }

public:
    // Add a node, returns its numeric ID
    int addNode(const std::string& label = "") {
        int id = nextId++;
        nodes[id] = { id, label.empty() ? std::to_string(id) : label };
        adj[id]   = {};
        return id;
    }

    // Add undirected edge between node IDs u and v
    bool addEdge(int u, int v, double weight = 1.0) {
        if (!nodes.count(u) || !nodes.count(v)) return false;
        adj[u].insert(v); adj[v].insert(u);
        weights[edgeKey(u, v)] = weight;
        weights[edgeKey(v, u)] = weight;
        return true;
    }

    // Breadth-First Search
    std::vector<int> bfs(int startId) {
        if (!nodes.count(startId)) return {};
        std::unordered_set<int> visited;
        std::queue<int>         queue;
        std::vector<int>        order;
        visited.insert(startId); queue.push(startId);
        while (!queue.empty()) {
            int u = queue.front(); queue.pop();
            order.push_back(u);
            for (int v : adj[u]) {
                if (!visited.count(v)) { visited.insert(v); queue.push(v); }
            }
        }
        return order;
    }

    // Depth-First Search
    std::vector<int> dfs(int startId) {
        if (!nodes.count(startId)) return {};
        std::unordered_set<int> visited;
        std::stack<int>         stack;
        std::vector<int>        order;
        stack.push(startId);
        while (!stack.empty()) {
            int u = stack.top(); stack.pop();
            if (visited.count(u)) continue;
            visited.insert(u); order.push_back(u);
            for (int v : adj[u]) { if (!visited.count(v)) stack.push(v); }
        }
        return order;
    }

    // Dijkstra shortest paths
    std::unordered_map<int, double> dijkstra(int startId) {
        std::unordered_map<int, double> dist;
        for (auto& [id, _] : nodes) dist[id] = std::numeric_limits<double>::infinity();
        dist[startId] = 0;
        using P = std::pair<double, int>;
        std::priority_queue<P, std::vector<P>, std::greater<P>> pq;
        pq.push({0, startId});
        while (!pq.empty()) {
            auto [d, u] = pq.top(); pq.pop();
            if (d > dist[u]) continue;
            for (int v : adj[u]) {
                double w   = weights.count(edgeKey(u,v)) ? weights.at(edgeKey(u,v)) : 1.0;
                double alt = d + w;
                if (alt < dist[v]) { dist[v] = alt; pq.push({alt, v}); }
            }
        }
        return dist;
    }
};

// ─── Build & Traverse ──────────────────────────────────────────
int main() {
    Graph graph;

    int a = graph.addNode("A");   // 0
    int b = graph.addNode("B");   // 1
    int c = graph.addNode("C");   // 2
    int d = graph.addNode("D");   // 3
    int e = graph.addNode("E");   // 4
    int f = graph.addNode("F");   // 5

    graph.addEdge(a, b);
    graph.addEdge(a, c);
    graph.addEdge(b, d);
    graph.addEdge(c, d);
    graph.addEdge(d, e);
    graph.addEdge(e, f);

    graph.bfs(a);
    graph.dfs(a);
    graph.dijkstra(a);
    return 0;
}`,

java: `// ─── Graph Implementation ─────────────────────────────────────
import java.util.*;

public class Graph {
    private final Map<Integer, String>           nodes   = new HashMap<>();
    private final Map<Integer, Set<Integer>>     adj     = new HashMap<>();
    private final Map<String, Double>            weights = new HashMap<>();
    private int nextId = 0;

    private String edgeKey(int u, int v) { return u + "-" + v; }

    /** Add a node, returns its numeric ID. */
    public int addNode(String label) {
        int id = nextId++;
        nodes.put(id, label != null ? label : String.valueOf(id));
        adj.put(id, new LinkedHashSet<>());
        return id;
    }

    /** Add undirected edge between node IDs u and v. */
    public boolean addEdge(int u, int v, double weight) {
        if (!nodes.containsKey(u) || !nodes.containsKey(v)) return false;
        adj.get(u).add(v); adj.get(v).add(u);
        weights.put(edgeKey(u, v), weight);
        weights.put(edgeKey(v, u), weight);
        return true;
    }
    public boolean addEdge(int u, int v) { return addEdge(u, v, 1.0); }

    /** Breadth-First Search from startId. */
    public List<Integer> bfs(int startId) {
        if (!nodes.containsKey(startId)) return Collections.emptyList();
        Set<Integer>  visited = new HashSet<>(Set.of(startId));
        Queue<Integer> queue  = new LinkedList<>(List.of(startId));
        List<Integer>  order  = new ArrayList<>();
        while (!queue.isEmpty()) {
            int u = queue.poll();
            order.add(u);
            for (int v : adj.get(u)) {
                if (!visited.contains(v)) { visited.add(v); queue.offer(v); }
            }
        }
        return order;
    }

    /** Depth-First Search from startId. */
    public List<Integer> dfs(int startId) {
        if (!nodes.containsKey(startId)) return Collections.emptyList();
        Set<Integer>   visited = new HashSet<>();
        Deque<Integer> stack   = new ArrayDeque<>(List.of(startId));
        List<Integer>  order   = new ArrayList<>();
        while (!stack.isEmpty()) {
            int u = stack.pop();
            if (visited.contains(u)) continue;
            visited.add(u); order.add(u);
            for (int v : adj.get(u)) { if (!visited.contains(v)) stack.push(v); }
        }
        return order;
    }

    /** Dijkstra shortest paths from startId. */
    public Map<Integer, Double> dijkstra(int startId) {
        Map<Integer, Double> dist = new HashMap<>();
        for (int id : nodes.keySet()) dist.put(id, Double.MAX_VALUE);
        dist.put(startId, 0.0);
        PriorityQueue<int[]> pq = new PriorityQueue<>(Comparator.comparingDouble(x -> x[0]));
        pq.offer(new int[]{0, startId});
        Set<Integer> visited = new HashSet<>();
        while (!pq.isEmpty()) {
            int[] top = pq.poll(); double d = top[0]; int u = top[1];
            if (visited.contains(u)) continue;
            visited.add(u);
            for (int v : adj.get(u)) {
                double w   = weights.getOrDefault(edgeKey(u, v), 1.0);
                double alt = d + w;
                if (alt < dist.get(v)) { dist.put(v, alt); pq.offer(new int[]{(int)alt, v}); }
            }
        }
        return dist;
    }

    // ─── Build & Traverse ─────────────────────────────────────
    public static void main(String[] args) {
        Graph graph = new Graph();

        int a = graph.addNode("A");   // 0
        int b = graph.addNode("B");   // 1
        int c = graph.addNode("C");   // 2
        int d = graph.addNode("D");   // 3
        int e = graph.addNode("E");   // 4
        int f = graph.addNode("F");   // 5

        graph.addEdge(a, b);
        graph.addEdge(a, c);
        graph.addEdge(b, d);
        graph.addEdge(c, d);
        graph.addEdge(d, e);
        graph.addEdge(e, f);

        graph.bfs(a);
        graph.dfs(a);
        graph.dijkstra(a);
    }
}`,

go: `// ─── Graph Implementation ─────────────────────────────────────
package main

import (
	"container/heap"
	"fmt"
	"math"
)

// ── Priority Queue for Dijkstra ─────────────────────────────
type Item struct{ dist float64; id int }
type PQ []Item

func (p PQ) Len() int            { return len(p) }
func (p PQ) Less(i, j int) bool  { return p[i].dist < p[j].dist }
func (p PQ) Swap(i, j int)       { p[i], p[j] = p[j], p[i] }
func (p *PQ) Push(x any)         { *p = append(*p, x.(Item)) }
func (p *PQ) Pop() any           { old := *p; n := len(old); x := old[n-1]; *p = old[:n-1]; return x }

// ── Graph ──────────────────────────────────────────────────
type Graph struct {
	nodes   map[int]string
	adj     map[int]map[int]bool
	weights map[string]float64
	nextID  int
}

func NewGraph() *Graph {
	return &Graph{
		nodes:   make(map[int]string),
		adj:     make(map[int]map[int]bool),
		weights: make(map[string]float64),
	}
}

// AddNode adds a labeled node, returns its numeric ID.
func (g *Graph) AddNode(label string) int {
	id := g.nextID; g.nextID++
	g.nodes[id] = label
	g.adj[id]   = make(map[int]bool)
	return id
}

// AddEdge adds an undirected weighted edge.
func (g *Graph) AddEdge(u, v int, weight float64) bool {
	if _, ok := g.nodes[u]; !ok { return false }
	if _, ok := g.nodes[v]; !ok { return false }
	g.adj[u][v] = true; g.adj[v][u] = true
	key := fmt.Sprintf("%d-%d", u, v); keyR := fmt.Sprintf("%d-%d", v, u)
	g.weights[key] = weight; g.weights[keyR] = weight
	return true
}

// BFS returns the breadth-first visit order.
func (g *Graph) BFS(startID int) []int {
	if _, ok := g.nodes[startID]; !ok { return nil }
	visited := map[int]bool{startID: true}
	queue   := []int{startID}
	order   := []int{}
	for len(queue) > 0 {
		u := queue[0]; queue = queue[1:]
		order = append(order, u)
		for v := range g.adj[u] {
			if !visited[v] { visited[v] = true; queue = append(queue, v) }
		}
	}
	return order
}

// DFS returns the depth-first visit order.
func (g *Graph) DFS(startID int) []int {
	if _, ok := g.nodes[startID]; !ok { return nil }
	visited := map[int]bool{}
	stack   := []int{startID}
	order   := []int{}
	for len(stack) > 0 {
		u := stack[len(stack)-1]; stack = stack[:len(stack)-1]
		if visited[u] { continue }
		visited[u] = true; order = append(order, u)
		for v := range g.adj[u] { if !visited[v] { stack = append(stack, v) } }
	}
	return order
}

// Dijkstra returns shortest distances from startID.
func (g *Graph) Dijkstra(startID int) map[int]float64 {
	dist := map[int]float64{}
	for id := range g.nodes { dist[id] = math.Inf(1) }
	dist[startID] = 0
	pq := &PQ{{dist: 0, id: startID}}; heap.Init(pq)
	visited := map[int]bool{}
	for pq.Len() > 0 {
		item := heap.Pop(pq).(Item); u := item.id
		if visited[u] { continue }; visited[u] = true
		for v := range g.adj[u] {
			key := fmt.Sprintf("%d-%d", u, v)
			w, ok := g.weights[key]; if !ok { w = 1.0 }
			if alt := dist[u] + w; alt < dist[v] { dist[v] = alt; heap.Push(pq, Item{alt, v}) }
		}
	}
	return dist
}

// ─── Build & Traverse ──────────────────────────────────────────
func main() {
	graph := NewGraph()

	a := graph.AddNode("A")   // 0
	b := graph.AddNode("B")   // 1
	c := graph.AddNode("C")   // 2
	d := graph.AddNode("D")   // 3
	e := graph.AddNode("E")   // 4
	f := graph.AddNode("F")   // 5

	graph.AddEdge(a, b, 1)
	graph.AddEdge(a, c, 1)
	graph.AddEdge(b, d, 1)
	graph.AddEdge(c, d, 1)
	graph.AddEdge(d, e, 1)
	graph.AddEdge(e, f, 1)

	graph.BFS(a)
	graph.DFS(a)
	graph.Dijkstra(a)
}`,
};

// ═══════════════════════════════════════════════════════════════════════════
// PARSER — reads user's code and drives the internal GEngine
// ═══════════════════════════════════════════════════════════════════════════
function parseCode(code, directed) {
  const steps = [], errors = [];
  // Strip comments
  const stripped = code
    .replace(/\/\/[^\n]*/g, " ")
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/#[^\n]*/g, " ");
  const rawLines = code.split("\n");
  const strLines = stripped.split("\n");

  // Find instance variable
  let inst = null;
  const instPats = [
    /(?:const|let|var)\s+(\w+)\s*=\s*new\s+Graph\s*[(<]/,
    /(?:Graph|Graph<\w+>)\s+(\w+)\s*=/,
    /(\w+)\s*=\s*Graph\s*\(\)/,
    /(\w+)\s*:=\s*NewGraph\s*\(/,
    /(\w+)\s*:=\s*&?Graph\s*{/,
  ];
  for (const p of instPats) { const m = stripped.match(p); if (m) { inst = m[1]; break; } }
  if (!inst) {
    const fb = stripped.match(/(\w+)\s*\.\s*(?:addNode|add_node|AddNode|addEdge|add_edge|AddEdge)\s*\(/);
    if (fb) inst = fb[1];
  }
  if (!inst) {
    errors.push("Cannot find Graph instance.\nExpected: const graph = new Graph();");
    return { steps, errors };
  }

  const e = inst.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // Match all operations with their char positions
  const allOps = [];
  const push = (m, op) => { op.ci = m.index; allOps.push(op); };

  let m;
  const addNodeRe    = new RegExp(`${e}\\s*\\.\\s*(?:addNode|add_node|AddNode)\\s*\\(\\s*([^)]*?)\\s*\\)`, "g");
  const addEdgeRe    = new RegExp(`${e}\\s*\\.\\s*(?:addEdge|add_edge|AddEdge)\\s*\\(\\s*(\\d+)\\s*,\\s*(\\d+)(?:\\s*,\\s*([\\d.]+))?\\s*\\)`, "g");
  const remNodeRe    = new RegExp(`${e}\\s*\\.\\s*(?:removeNode|remove_node|RemoveNode)\\s*\\(\\s*(\\d+)\\s*\\)`, "g");
  const remEdgeRe    = new RegExp(`${e}\\s*\\.\\s*(?:removeEdge|remove_edge|RemoveEdge)\\s*\\(\\s*(\\d+)\\s*,\\s*(\\d+)\\s*\\)`, "g");
  const bfsRe        = new RegExp(`${e}\\s*\\.\\s*(?:bfs|BFS|Bfs)\\s*\\(\\s*(\\d+)\\s*\\)`, "g");
  const dfsRe        = new RegExp(`${e}\\s*\\.\\s*(?:dfs|DFS|Dfs)\\s*\\(\\s*(\\d+)\\s*\\)`, "g");
  const dijkstraRe   = new RegExp(`${e}\\s*\\.\\s*(?:dijkstra|Dijkstra)\\s*\\(\\s*(\\d+)\\s*\\)`, "g");

  while ((m = addNodeRe.exec(stripped))  !== null) push(m, { t:"addNode",    label:m[1].replace(/['"]/g,"").trim()||null });
  while ((m = addEdgeRe.exec(stripped))  !== null) push(m, { t:"addEdge",    u:+m[1], v:+m[2], w:m[3]?+m[3]:1 });
  while ((m = remNodeRe.exec(stripped))  !== null) push(m, { t:"removeNode", id:+m[1] });
  while ((m = remEdgeRe.exec(stripped))  !== null) push(m, { t:"removeEdge", u:+m[1], v:+m[2] });
  while ((m = bfsRe.exec(stripped))      !== null) push(m, { t:"bfs",        start:+m[1] });
  while ((m = dfsRe.exec(stripped))      !== null) push(m, { t:"dfs",        start:+m[1] });
  while ((m = dijkstraRe.exec(stripped)) !== null) push(m, { t:"dijkstra",   start:+m[1] });

  if (!allOps.length) {
    errors.push(`Instance '${inst}' found but no graph operations detected.\nUse addNode, addEdge, bfs, dfs, dijkstra.`);
    return { steps, errors };
  }
  allOps.sort((a,b) => a.ci - b.ci);

  const getLine = (ci) => { let cur=0; for (let i=0;i<strLines.length;i++){cur+=strLines[i].length+1;if(cur>ci)return i;} return rawLines.length-1; };
  const edgeCt  = (g) => { let c=0; for(const s of g.adj.values())c+=s.size; return directed?c:c/2; };

  const g = new GEngine(directed);
  for (const op of allOps) {
    const ln = getLine(op.ci), cl = rawLines[ln]?.trim()??"";
    if (op.t === "addNode") {
      const id = g.addNode(op.label);
      steps.push({ t:"addNode", label:op.label??String(id), id, graph:g.clone(), hl:[id], tEdges:[], msg:`addNode("${op.label??id}") → id:${id}`, nc:g.nodes.size, ec:edgeCt(g), ln, cl });
    } else if (op.t === "addEdge") {
      const ok = g.addEdge(op.u, op.v, op.w);
      steps.push({ t:"addEdge", u:op.u, v:op.v, w:op.w, graph:g.clone(), hl:[op.u,op.v], tEdges:[[op.u,op.v]], msg:ok?`addEdge(${op.u}, ${op.v}${op.w!==1?`, ${op.w}`:""})`:`addEdge failed — node not found`, nc:g.nodes.size, ec:edgeCt(g), ln, cl });
    } else if (op.t === "removeNode") {
      const ok = g.removeNode(op.id);
      steps.push({ t:"removeNode", id:op.id, graph:g.clone(), hl:[], tEdges:[], msg:ok?`removeNode(${op.id}) → removed`:`removeNode(${op.id}) → not found`, nc:g.nodes.size, ec:edgeCt(g), ln, cl });
    } else if (op.t === "removeEdge") {
      const ok = g.removeEdge(op.u, op.v);
      steps.push({ t:"removeEdge", u:op.u, v:op.v, graph:g.clone(), hl:[op.u,op.v], tEdges:[], msg:ok?`removeEdge(${op.u}, ${op.v})`:`removeEdge — edge not found`, nc:g.nodes.size, ec:edgeCt(g), ln, cl });
    } else if (op.t === "bfs") {
      const { order, edges } = g.bfs(op.start);
      steps.push({ t:"bfs", start:op.start, order, graph:g.clone(), hl:order, tEdges:edges, msg:`bfs(${op.start}) → [${order.join(" → ")}]`, nc:g.nodes.size, ec:edgeCt(g), ln, cl });
    } else if (op.t === "dfs") {
      const { order, edges } = g.dfs(op.start);
      steps.push({ t:"dfs", start:op.start, order, graph:g.clone(), hl:order, tEdges:edges, msg:`dfs(${op.start}) → [${order.join(" → ")}]`, nc:g.nodes.size, ec:edgeCt(g), ln, cl });
    } else if (op.t === "dijkstra") {
      const { dist, prev, order, edges } = g.dijkstra(op.start);
      const ds = Object.entries(dist).filter(([,v])=>v!==Infinity).map(([k,v])=>`${g.nodes.get(+k)?.label??k}:${v}`).join(", ");
      steps.push({ t:"dijkstra", start:op.start, order, dist, prev, graph:g.clone(), hl:order, tEdges:edges, msg:`dijkstra(${op.start}) → {${ds}}`, nc:g.nodes.size, ec:edgeCt(g), ln, cl });
    }
  }
  return { steps, errors };
}

// ═══════════════════════════════════════════════════════════════════════════
// NODE COLOR PALETTE
// ═══════════════════════════════════════════════════════════════════════════
const PALETTE = [
  { fill:"#0a1628", ring:"#3b82f6", text:"#93c5fd", glow:"59,130,246"  },
  { fill:"#140a28", ring:"#8b5cf6", text:"#c4b5fd", glow:"139,92,246"  },
  { fill:"#0a2012", ring:"#10b981", text:"#6ee7b7", glow:"16,185,129"  },
  { fill:"#280a0a", ring:"#ef4444", text:"#fca5a5", glow:"239,68,68"   },
  { fill:"#281800", ring:"#f59e0b", text:"#fcd34d", glow:"245,158,11"  },
  { fill:"#200a1e", ring:"#ec4899", text:"#f9a8d4", glow:"236,72,153"  },
  { fill:"#001e22", ring:"#06b6d4", text:"#67e8f9", glow:"6,182,212"   },
  { fill:"#1c1400", ring:"#eab308", text:"#fef08a", glow:"234,179,8"   },
];

const OP_META = {
  addNode:    { label:"ADD NODE",  icon:"⊕", c:"#60a5fa", bg:"rgba(59,130,246,0.12)",  bd:"rgba(96,165,250,0.4)"  },
  addEdge:    { label:"ADD EDGE",  icon:"⎯", c:"#818cf8", bg:"rgba(99,102,241,0.1)",   bd:"rgba(129,140,248,0.38)" },
  removeNode: { label:"DEL NODE",  icon:"⊖", c:"#f87171", bg:"rgba(239,68,68,0.1)",   bd:"rgba(248,113,113,0.4)" },
  removeEdge: { label:"DEL EDGE",  icon:"⨯", c:"#fb7185", bg:"rgba(244,63,94,0.1)",   bd:"rgba(251,113,133,0.4)" },
  bfs:        { label:"BFS",       icon:"◎", c:"#4ade80", bg:"rgba(74,222,128,0.1)",  bd:"rgba(74,222,128,0.4)"  },
  dfs:        { label:"DFS",       icon:"◉", c:"#34d399", bg:"rgba(52,211,153,0.1)",  bd:"rgba(52,211,153,0.4)"  },
  dijkstra:   { label:"DIJKSTRA",  icon:"◈", c:"#fbbf24", bg:"rgba(251,191,36,0.1)",  bd:"rgba(251,191,36,0.4)"  },
};

const LINE_H = 19;

// ═══════════════════════════════════════════════════════════════════════════
// GRAPH CANVAS — hexagonal nodes, bloom glow, animated traversal
// ═══════════════════════════════════════════════════════════════════════════
function hexPath(cx, cy, r) {
  const pts = Array.from({length:6}, (_,i) => {
    const a = (Math.PI/180)*(60*i - 30);
    return `${cx + r*Math.cos(a)},${cy + r*Math.sin(a)}`;
  });
  return `M${pts.join("L")}Z`;
}

function GraphCanvas({ graph, hl, tEdges, directed, weighted, layoutKey }) {
  const svgRef   = useRef(null);
  const [pos,    setPos]    = useState(new Map());
  const [drag,   setDrag]   = useState(null);
  const [pan,    setPan]    = useState(null);
  const [vb,     setVb]     = useState({ x:0, y:0, w:700, h:440 });
  const [tick,   setTick]   = useState(0);
  const rafRef   = useRef(null);
  const W=700, H=440;

  // Layout when graph changes
  useEffect(() => {
    if (!graph || !graph.nodes.size) { setPos(new Map()); return; }
    const ids   = Array.from(graph.nodes.keys());
    const edges = graph.getEdgeList().map(e => ({ u:e.u, v:e.v }));
    const fresh = runForceLayout(ids, edges, W, H);
    setPos(prev => {
      const next = new Map(fresh);
      for (const [id, p] of prev) if (next.has(id)) next.set(id, p);
      return next;
    });
  }, [layoutKey]);

  // Tick for animations
  useEffect(() => {
    let t = 0;
    const loop = () => { t++; setTick(t); rafRef.current = requestAnimationFrame(loop); };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const svgPt = useCallback((e) => {
    const r = svgRef.current?.getBoundingClientRect();
    if (!r) return {x:0,y:0};
    return { x: vb.x + (e.clientX - r.left)*(vb.w/r.width), y: vb.y + (e.clientY - r.top)*(vb.h/r.height) };
  }, [vb]);

  const onNodeDown = (e, id) => { e.stopPropagation(); const pt=svgPt(e); const p=pos.get(id)||{x:W/2,y:H/2}; setDrag({id, ox:pt.x-p.x, oy:pt.y-p.y}); };
  const onBgDown   = (e) => { if(drag) return; const pt=svgPt(e); setPan({sx:pt.x, sy:pt.y, vb0:{...vb}}); };
  const onMove     = (e) => {
    const pt = svgPt(e);
    if (drag) { setPos(p => { const n=new Map(p); n.set(drag.id,{x:Math.max(44,Math.min(W-44,pt.x-drag.ox)),y:Math.max(44,Math.min(H-44,pt.y-drag.oy))}); return n; }); }
    else if (pan) { setVb(v => ({ ...v, x:Math.max(-W*.25,Math.min(W*.25,pan.vb0.x+(pan.sx-pt.x))), y:Math.max(-H*.25,Math.min(H*.25,pan.vb0.y+(pan.sy-pt.y))) })); }
  };
  const onUp       = () => { setDrag(null); setPan(null); };
  const onWheel    = (e) => { e.preventDefault(); const f=e.deltaY>0?1.12:0.9; const pt=svgPt(e); setVb(v=>({ x:pt.x-(pt.x-v.x)*(v.w*f/v.w), y:pt.y-(pt.y-v.y)*(v.h*f/v.h), w:Math.max(220,Math.min(W*2,v.w*f)), h:Math.max(140,Math.min(H*2,v.h*f)) })); };

  if (!graph || !graph.nodes.size) {
    return (
      <div style={{width:"100%",height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12}}>
        <div style={{fontSize:52,animation:"idleFloat 4s ease-in-out infinite",filter:"drop-shadow(0 0 20px rgba(99,102,241,0.4))"}}>⬡</div>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#1a2e48",letterSpacing:".18em",textTransform:"uppercase",textAlign:"center",lineHeight:2.4}}>write graph code · run · watch it come alive</div>
      </div>
    );
  }

  const hlSet = new Set(hl);
  const tSet  = new Set(tEdges.map(([u,v])=>`${u}-${v}`));
  const nodes = Array.from(graph.nodes.values());
  const edges = graph.getEdgeList();
  const colMap = new Map(); nodes.forEach((n,i) => colMap.set(n.id, PALETTE[i % PALETTE.length]));
  const hlOrder = new Map(); hl.forEach((id,i) => hlOrder.set(id, i));
  const R = 22; // hex radius

  return (
    <svg ref={svgRef} viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`} width="100%" height="100%"
      style={{cursor:drag?"grabbing":pan?"grabbing":"grab",userSelect:"none",display:"block"}}
      onMouseDown={onBgDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp} onWheel={onWheel}>
      <defs>
        {/* Dot grid */}
        <pattern id="dotgrid" width="30" height="30" patternUnits="userSpaceOnUse">
          <circle cx="15" cy="15" r="0.7" fill="rgba(99,102,241,0.1)"/>
        </pattern>
        {/* Node bloom filter */}
        <filter id="bloom" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        {/* Soft glow */}
        <filter id="softglow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        {/* Edge glow */}
        <filter id="edgeglow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.8" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        {/* Arrow markers */}
        <marker id="arr"   markerWidth="7" markerHeight="7" refX="22" refY="3.5" orient="auto"><path d="M0,0L7,3.5L0,7" fill="none" stroke="rgba(129,140,248,0.6)" strokeWidth="1.2"/></marker>
        <marker id="arrHl" markerWidth="7" markerHeight="7" refX="22" refY="3.5" orient="auto"><path d="M0,0L7,3.5L0,7" fill="none" stroke="#4ade80" strokeWidth="1.5"/></marker>
        <marker id="arrDj" markerWidth="7" markerHeight="7" refX="22" refY="3.5" orient="auto"><path d="M0,0L7,3.5L0,7" fill="none" stroke="#fbbf24" strokeWidth="1.5"/></marker>
        <style>{`
          @keyframes dashFlow{to{stroke-dashoffset:-24}}
          @keyframes hexPulse{0%,100%{opacity:.25}50%{opacity:.55}}
          @keyframes nodeAppear{from{opacity:0;transform:scale(0)}to{opacity:1;transform:scale(1)}}
        `}</style>
      </defs>

      {/* Background */}
      <rect x={vb.x} y={vb.y} width={vb.w} height={vb.h} fill="url(#dotgrid)"/>

      {/* ── EDGES ── */}
      {edges.map(({u,v,w}) => {
        const p1=pos.get(u), p2=pos.get(v);
        if (!p1||!p2) return null;
        const isHl  = hlSet.has(u) && hlSet.has(v);
        const isTrv = tSet.has(`${u}-${v}`) || tSet.has(`${v}-${u}`);
        const isDij = hl.length && hl.includes(u) && hl.includes(v);

        // Bezier control point for directed curves
        const mx=(p1.x+p2.x)/2, my=(p1.y+p2.y)/2;
        const dx=p2.x-p1.x, dy=p2.y-p1.y, len=Math.sqrt(dx*dx+dy*dy);
        const cpx = directed ? mx - dy*0.18 : mx;
        const cpy = directed ? my + dx*0.18 : my;
        const d   = directed
          ? `M${p1.x},${p1.y} Q${cpx},${cpy} ${p2.x},${p2.y}`
          : `M${p1.x},${p1.y} L${p2.x},${p2.y}`;

        const col = isHl ? "#4ade80" : isTrv ? "#818cf8" : "rgba(99,102,241,0.18)";
        const sw  = isHl ? 2.5 : isTrv ? 2 : 1.2;
        const dashOffset = (-(tick * 0.4)) % 24;

        return (
          <g key={`e-${u}-${v}`}>
            {/* Glow layer */}
            {(isHl||isTrv) && <path d={d} fill="none" stroke={col} strokeWidth={sw+3} opacity={0.12} filter="url(#edgeglow)"/>}
            {/* Main edge */}
            <path d={d} fill="none" stroke={col} strokeWidth={sw}
              strokeDasharray={isTrv?"8 4":"none"}
              strokeDashoffset={isTrv ? dashOffset : 0}
              markerEnd={directed?(isHl?"url(#arrHl)":isTrv?"url(#arr)":undefined):undefined}
              opacity={isHl?1:isTrv?0.85:0.45}/>
            {/* Weight label */}
            {weighted && w !== 1 && (
              <g>
                <rect x={cpx-13} y={cpy-9} width={26} height={18} rx={6} fill="rgba(3,6,18,0.92)" stroke="rgba(99,102,241,0.25)" strokeWidth={0.8}/>
                <text x={cpx} y={cpy} textAnchor="middle" dominantBaseline="central" fill="#818cf8" fontSize={8} fontFamily="'JetBrains Mono',monospace" fontWeight="700">{w}</text>
              </g>
            )}
            {/* Dijkstra dist label on edge */}
          </g>
        );
      })}

      {/* ── NODES ── */}
      {nodes.map(node => {
        const p = pos.get(node.id);
        if (!p) return null;
        const isHl  = hlSet.has(node.id);
        const ord   = hlOrder.get(node.id) ?? -1;
        const col   = colMap.get(node.id) ?? PALETTE[0];
        const rGlow = col.glow;
        const pulseR = R + (isHl ? Math.sin(tick * 0.09) * 3 : 0);

        return (
          <g key={node.id} style={{cursor:"grab"}} onMouseDown={e=>onNodeDown(e,node.id)}>
            {/* Outer glow halo for highlighted */}
            {isHl && (
              <polygon points={hexPath(p.x, p.y, pulseR+12).replace(/M|Z/g,"").split("L").map(s=>`${s}`).join(" ")}
                style={{transformOrigin:`${p.x}px ${p.y}px`}}
                fill="none" stroke={`rgba(${rGlow},0.22)`} strokeWidth={1.5}/>
            )}
            {/* Second ring */}
            {isHl && (
              <polygon points={hexPath(p.x,p.y,pulseR+6).replace(/M|Z/g,"").split("L").map(s=>s).join(" ")}
                fill="none" stroke={`rgba(${rGlow},0.35)`} strokeWidth={1}/>
            )}
            {/* Bloom layer */}
            {isHl && <path d={hexPath(p.x,p.y,pulseR)} fill={`rgba(${rGlow},0.08)`} filter="url(#bloom)"/>}
            {/* Hex fill */}
            <path d={hexPath(p.x,p.y,R)} fill={isHl?`rgba(${rGlow},0.22)`:col.fill} stroke={isHl?col.ring:col.ring+"55"} strokeWidth={isHl?2:1.2} filter={isHl?"url(#softglow)":undefined}/>
            {/* Inner hex accent */}
            <path d={hexPath(p.x,p.y,R-5)} fill="none" stroke={isHl?col.ring+"60":col.ring+"22"} strokeWidth={0.7}/>
            {/* Node label */}
            <text x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central"
              fill={isHl?col.text:col.ring+"cc"} fontSize={11} fontWeight="700" fontFamily="'JetBrains Mono',monospace">
              {node.label.length>3?node.label.slice(0,3):node.label}
            </text>
            {/* ID subscript */}
            <text x={p.x} y={p.y+R+10} textAnchor="middle" fill={col.ring+"44"} fontSize={7} fontFamily="'JetBrains Mono',monospace">id:{node.id}</text>
            {/* Traversal order badge */}
            {ord >= 0 && (
              <g>
                <circle cx={p.x+R-2} cy={p.y-R+2} r={9} fill={col.ring} opacity={0.95}/>
                <text x={p.x+R-2} y={p.y-R+2} textAnchor="middle" dominantBaseline="central"
                  fill="#000" fontSize={7.5} fontWeight="800" fontFamily="'JetBrains Mono',monospace">{ord+1}</text>
              </g>
            )}
          </g>
        );
      })}

      {/* Reset zoom */}
      <g onClick={()=>setVb({x:0,y:0,w:W,h:H})} style={{cursor:"pointer"}}>
        <rect x={vb.x+vb.w-58} y={vb.y+7} width={52} height={17} rx={5} fill="rgba(3,6,18,0.88)" stroke="rgba(99,102,241,0.2)" strokeWidth={0.7}/>
        <text x={vb.x+vb.w-32} y={vb.y+16} textAnchor="middle" dominantBaseline="central" fill="#2a3a5a" fontSize={7} fontFamily="'JetBrains Mono',monospace" letterSpacing=".06em">⊡ RESET</text>
      </g>
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CODE EDITOR
// ═══════════════════════════════════════════════════════════════════════════
function CodeEditor({ code, setCode, step, errLines, onKeyDown, taRef }) {
  const lines = code.split("\n");
  const lnRef = useRef(null);
  const sync  = useCallback(() => { if (taRef.current && lnRef.current) lnRef.current.scrollTop = taRef.current.scrollTop; }, [taRef]);
  useEffect(() => { const ta=taRef.current; if(!ta) return; ta.addEventListener("scroll",sync,{passive:true}); return()=>ta.removeEventListener("scroll",sync); }, [sync]);
  return (
    <div style={{flex:1,display:"flex",minHeight:0,overflow:"hidden",position:"relative"}}>
      {/* Line numbers */}
      <div ref={lnRef} style={{width:38,flexShrink:0,background:"rgba(2,4,12,0.95)",borderRight:"1px solid rgba(255,255,255,0.05)",overflowY:"hidden",paddingTop:10,paddingBottom:10,display:"flex",flexDirection:"column",userSelect:"none",pointerEvents:"none",scrollbarWidth:"none"}}>
        {lines.map((_,i) => {
          const isAct=step?.ln===i, isErr=errLines.has(i);
          return <div key={i} style={{height:LINE_H,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"flex-end",paddingRight:8,fontFamily:"'JetBrains Mono',monospace",fontSize:8.5,color:isErr?"#f87171":isAct?"#818cf8":"#1a2e48",background:isErr?"rgba(239,68,68,0.07)":isAct?"rgba(99,102,241,0.07)":"transparent",transition:"color .1s,background .1s"}}>{i+1}</div>;
        })}
      </div>
      {/* Active line overlay */}
      {step && <div style={{position:"absolute",left:38,right:0,height:LINE_H,top:10+step.ln*LINE_H,background:"rgba(99,102,241,0.05)",borderLeft:"2px solid rgba(129,140,248,0.55)",pointerEvents:"none",zIndex:1,transition:"top .15s cubic-bezier(.4,0,.2,1)"}}/>}
      {/* Error overlays */}
      {[...errLines].map(i=><div key={`e${i}`} style={{position:"absolute",left:38,right:0,height:LINE_H,top:10+i*LINE_H,background:"rgba(239,68,68,0.05)",borderLeft:"2px solid rgba(248,113,113,0.5)",pointerEvents:"none",zIndex:1}}/>)}
      {/* Textarea */}
      <textarea ref={taRef} style={{flex:1,padding:"10px 14px 10px 10px",background:"transparent",border:"none",outline:"none",color:"#aac4e8",fontFamily:"'JetBrains Mono',monospace",fontSize:11,lineHeight:`${LINE_H}px`,resize:"none",caretColor:"#818cf8",tabSize:2,whiteSpace:"pre",overflowY:"auto",overflowX:"auto",scrollbarWidth:"thin",scrollbarColor:"rgba(99,102,241,0.15) transparent",position:"relative",zIndex:2,letterSpacing:".01em"}}
        value={code} onChange={e=>setCode(e.target.value)} onKeyDown={onKeyDown} spellCheck={false} placeholder="// Write your Graph code here…"/>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TERMINAL
// ═══════════════════════════════════════════════════════════════════════════
const TCOL = { addNode:"#93c5fd",addEdge:"#818cf8",removeNode:"#f87171",removeEdge:"#fb7185",bfs:"#4ade80",dfs:"#34d399",dijkstra:"#fbbf24",error:"#f87171",stderr:"#f87171",success:"#4ade80",warn:"#fbbf24",info:"#60a5fa",output:"#2a4060",prompt:"#4ade80" };
const TICO  = { addNode:"⊕",addEdge:"⎯",removeNode:"⊖",removeEdge:"⨯",bfs:"◎",dfs:"◉",dijkstra:"◈",error:"✗",stderr:"✗",success:"✓",warn:"⚠",info:"·" };

function Terminal({ lines, validating }) {
  const ref = useRef(null);
  useEffect(()=>{ if(ref.current) ref.current.scrollTop=ref.current.scrollHeight; },[lines,validating]);
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:"#010408",minHeight:0,fontFamily:"'JetBrains Mono',monospace",fontSize:10}}>
      <div ref={ref} style={{flex:1,overflowY:"auto",padding:"5px 0",scrollbarWidth:"thin",scrollbarColor:"rgba(99,102,241,0.12) transparent"}}>
        {lines.length===0&&!validating&&<div style={{padding:"4px 14px",display:"flex",alignItems:"center",gap:6}}><span style={{color:"#4ade80"}}>$</span><span style={{animation:"blink 1.1s step-end infinite",color:"#010408",marginLeft:4}}>_</span></div>}
        {lines.map((line,i)=>{
          if(line.t==="sep")  return <div key={i} style={{margin:"3px 14px",borderTop:"1px solid rgba(255,255,255,0.04)"}}/>;
          if(line.t==="blank") return <div key={i} style={{height:4}}/>;
          if(line.t==="prompt") return <div key={i} style={{padding:"2px 14px",display:"flex",gap:7}}><span style={{color:"#4ade80"}}>$</span><span style={{color:"#2a4060"}}>{line.tx}</span></div>;
          const c=TCOL[line.t]??"#2a4060", ic=TICO[line.t]??"";
          return <div key={i} style={{padding:"1.5px 14px",display:"flex",alignItems:"flex-start"}}><span style={{color:c,width:15,flexShrink:0,fontSize:8,paddingTop:2}}>{ic}</span><span style={{color:c,wordBreak:"break-word",lineHeight:1.7,flex:1}}>{line.tx}</span>{line.ln&&<span style={{marginLeft:8,color:"#0e1e30",fontSize:7.5,flexShrink:0,paddingTop:3}}>L{line.ln}</span>}</div>;
        })}
        {validating&&<div style={{padding:"3px 14px",display:"flex",alignItems:"center",gap:8}}><span style={{display:"inline-block",width:9,height:9,borderRadius:"50%",border:"1.5px solid rgba(99,102,241,0.15)",borderTopColor:"#818cf8",animation:"spin .6s linear infinite"}}/><span style={{color:"#1a2e48",fontSize:9}}>AI reviewing code…</span></div>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// AI VALIDATOR
// ═══════════════════════════════════════════════════════════════════════════
async function validate(code, lang) {
  const prompt = `You are a lenient graph code syntax checker.

CRITICAL RULES — you MUST follow these exactly:
- Numeric node IDs (0, 1, 2, ...) are ALWAYS VALID. addEdge(0,1), bfs(0), dfs(0), dijkstra(0) are all correct.
- The variable returned by addNode() is the integer ID. Using it directly in addEdge is correct.
- Only flag REAL errors: undefined variables, wrong parentheses/brackets, typos in keywords.
- Do NOT flag numeric indices, API style, or anything that is a matter of implementation choice.
- If in doubt, return valid:true.

Return ONLY raw JSON, no markdown, no backticks:
{"valid":true,"reason":"","errors":[]}
or
{"valid":false,"reason":"one sentence","errors":[{"line":1,"message":"short description"}]}

Code (${lang}):
${code.slice(0,3000)}`;
  try {
    const res = await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:[{role:"user",content:prompt}]})});
    const data = await res.json();
    if(data.error) return {valid:true,reason:"",errors:[]};
    const raw = (data.content??"").replace(/```json|```/gi,"").trim();
    const p = JSON.parse(raw);
    return {valid:!!p.valid, reason:p.reason??"", errors:Array.isArray(p.errors)?p.errors:[]};
  } catch { return {valid:true,reason:"",errors:[]}; }
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════
export default function GraphPage() {
  const [lang,       setLang]       = useState("javascript");
  const [code,       setCode]       = useState(TEMPLATES.javascript);
  const [steps,      setSteps]      = useState([]);
  const [idx,        setIdx]        = useState(-1);
  const [playing,    setPlaying]    = useState(false);
  const [speed,      setSpeed]      = useState(1.1);
  const [lKey,       setLKey]       = useState(0);
  const [done,       setDone]       = useState(false);
  const [validating, setValidating] = useState(false);
  const [aiErrs,     setAiErrs]     = useState([]);
  const [termLines,  setTermLines]  = useState([]);
  const [directed,   setDirected]   = useState(false);
  const [weighted,   setWeighted]   = useState(false);
  const [termOpen,   setTermOpen]   = useState(true);
  const [toast,      setToast]      = useState(null);
  const [sid]                       = useState(()=>Math.random().toString(36).slice(2,7).toUpperCase());

  const timerRef = useRef(null);
  const taRef    = useRef(null);
  const listRef  = useRef(null);

  const bump     = () => setLKey(k=>k+1);
  const showToast= (msg,c="#4ade80")=>{ setToast({msg,c}); setTimeout(()=>setToast(null),2400); };

  const reset = useCallback(()=>{
    clearInterval(timerRef.current);
    setSteps([]); setIdx(-1); setPlaying(false); setDone(false); setAiErrs([]); setTermLines([]);
  },[]);

  const changeLang = (l) => { setLang(l); setCode(TEMPLATES[l]); reset(); };

  const buildTerm = (stps, errs, aiEs, aiReason) => {
    const ls = [];
    const ts = new Date().toTimeString().slice(0,8);
    ls.push({t:"output",tx:`VisuoSlayer Graph v3  ·  ${ts}  ·  ${sid}`});
    ls.push({t:"sep"});
    if (aiEs.length) {
      ls.push({t:"prompt",tx:`validate --lang=${lang}`});
      ls.push({t:"blank"});
      if (aiReason) ls.push({t:"stderr",tx:aiReason});
      aiEs.forEach(e=>ls.push({t:"error",tx:`  ${e.message}`,ln:e.line}));
      ls.push({t:"blank"});
      ls.push({t:"error",tx:"exit code 1"});
      return ls;
    }
    if (errs.length) {
      ls.push({t:"prompt",tx:`run --lang=${lang}`}); ls.push({t:"blank"});
      errs.forEach(e=>ls.push({t:"stderr",tx:e}));
      ls.push({t:"blank"}); ls.push({t:"error",tx:"exit code 1"}); return ls;
    }
    ls.push({t:"prompt",tx:`run --lang=${lang}${directed?" --directed":""}`});
    ls.push({t:"blank"});
    stps.forEach(s=>{
      let tx="";
      if(s.t==="addNode")    tx=`addNode("${s.label}") → id:${s.id}`;
      else if(s.t==="addEdge")    tx=`addEdge(${s.u}, ${s.v}${weighted&&s.w!==1?`, w=${s.w}`:""})`;
      else if(s.t==="removeNode") tx=`removeNode(${s.id})`;
      else if(s.t==="removeEdge") tx=`removeEdge(${s.u}, ${s.v})`;
      else if(s.t==="bfs")        tx=`bfs(${s.start}) → [${s.order.join(" → ")}]`;
      else if(s.t==="dfs")        tx=`dfs(${s.start}) → [${s.order.join(" → ")}]`;
      else if(s.t==="dijkstra")   tx=s.msg;
      ls.push({t:s.t, tx, ln:s.ln+1});
    });
    ls.push({t:"blank"});
    ls.push({t:"success",tx:`${stps.length} op${stps.length!==1?"s":""} completed  ·  exit 0`});
    return ls;
  };

  const run = async () => {
    reset();
    setValidating(true);
    const v = await validate(code, lang);
    setValidating(false);
    if (!v.valid) {
      setAiErrs(v.errors??[]);
      setTermLines(buildTerm([],[],v.errors??[],v.reason??""));
      showToast("Errors found","#f87171"); return;
    }
    const { steps:s, errors } = parseCode(code, directed);
    if (errors.length) {
      setTermLines(buildTerm([],errors,[],"")); showToast("Parse error","#f87171"); return;
    }
    setSteps(s); setIdx(0); bump(); setPlaying(true);
    setTermLines(buildTerm(s,[],[],"")); showToast(`${s.length} ops parsed ✓`);
  };

  const goTo = useCallback((i)=>{
    clearInterval(timerRef.current); setPlaying(false);
    const ni = Math.max(0,Math.min(i,steps.length-1)); setIdx(ni); bump();
  },[steps]);

  useEffect(()=>{
    const h = e => {
      if ((e.ctrlKey||e.metaKey)&&e.key==="Enter") { e.preventDefault(); run(); }
      if (!steps.length) return;
      if ((e.ctrlKey||e.metaKey)&&e.key==="ArrowRight") { e.preventDefault(); goTo(idx+1); }
      if ((e.ctrlKey||e.metaKey)&&e.key==="ArrowLeft")  { e.preventDefault(); goTo(idx-1); }
    };
    window.addEventListener("keydown",h); return ()=>window.removeEventListener("keydown",h);
  },[code,lang,steps,idx]);

  useEffect(()=>{
    if (!playing||!steps.length) return;
    timerRef.current = setInterval(()=>{
      setIdx(p=>{
        if (p>=steps.length-1) { clearInterval(timerRef.current); setPlaying(false); setDone(true); return p; }
        bump(); return p+1;
      });
    }, speed*1000);
    return ()=>clearInterval(timerRef.current);
  },[playing,steps,speed]);

  useEffect(()=>{ listRef.current?.querySelector(".sla")?.scrollIntoView({block:"nearest",behavior:"smooth"}); },[idx]);

  const onKeyDown = e => {
    if (e.key!=="Tab") return; e.preventDefault();
    const s=e.target.selectionStart, en=e.target.selectionEnd;
    const nv=code.slice(0,s)+"  "+code.slice(en); setCode(nv);
    requestAnimationFrame(()=>{ if(taRef.current){taRef.current.selectionStart=s+2;taRef.current.selectionEnd=s+2;} });
  };

  const step  = steps[idx]??null;
  const os    = step ? OP_META[step.t]??OP_META.addNode : null;
  const prog  = steps.length ? Math.round(((idx+1)/steps.length)*100) : 0;
  const lm    = LANGS[lang]??LANGS.javascript;
  const errLn = new Set(aiErrs.map(e=>(e.line??1)-1));
  const idle  = !steps.length && !aiErrs.length;

  const metrics = [
    { l:"NODES",  v:step?.nc??0,                             c:"#93c5fd" },
    { l:"EDGES",  v:step?.ec??0,                             c:"#fbbf24" },
    { l:"OP",     v:step?.t?.toUpperCase()??"—",             c:step?OP_META[step.t]?.c??"#60a5fa":"#0e1e30" },
    { l:"STEP",   v:steps.length?`${idx+1}/${steps.length}`:"—", c:"#a78bfa" },
  ];

  const panel = {background:"rgba(3,5,16,0.99)",border:"1px solid rgba(255,255,255,0.065)",borderRadius:13,display:"flex",flexDirection:"column",overflow:"hidden",minHeight:0,boxShadow:"0 24px 64px rgba(0,0,0,0.6),inset 0 1px 0 rgba(255,255,255,0.04)"};
  const tbar  = {padding:"6px 12px",borderBottom:"1px solid rgba(255,255,255,0.055)",background:"rgba(2,3,10,0.98)",display:"flex",alignItems:"center",gap:6,flexShrink:0};
  const dot   = c => ({width:8,height:8,borderRadius:"50%",background:c,display:"inline-block"});

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700;800&family=Syne:wght@700;800&family=Outfit:wght@300;400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html,body{height:100%;overflow:hidden}
        body{background:#01030c;color:#b8d0ee;font-family:'Outfit',sans-serif;}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes idleFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
        @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
        @keyframes logoPulse{0%,100%{box-shadow:0 0 8px rgba(99,102,241,0.4)}50%{box-shadow:0 0 22px rgba(99,102,241,0.75),0 0 40px rgba(99,102,241,0.1)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
        @keyframes pop{0%{transform:scale(.78);opacity:0}65%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}
        @keyframes progGlow{0%,100%{box-shadow:0 0 4px rgba(99,102,241,0.45)}50%{box-shadow:0 0 12px rgba(99,102,241,0.8)}}
        @keyframes panelIn{from{opacity:0;transform:translateY(-4px) scale(.98)}to{opacity:1;transform:none}}
        @keyframes toastIn{from{opacity:0;transform:translateY(8px) scale(.95)}to{opacity:1;transform:none}}
        @keyframes runGlow{0%,100%{box-shadow:0 0 16px rgba(99,102,241,0.35)}50%{box-shadow:0 0 28px rgba(99,102,241,0.62)}}
        button:hover:not(:disabled){filter:brightness(1.14)!important}
        ::-webkit-scrollbar{width:3px;height:3px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(99,102,241,0.18);border-radius:4px}
      `}</style>

      <div style={{height:"100vh",display:"flex",flexDirection:"column",overflow:"hidden",background:"radial-gradient(ellipse 60% 45% at 4% 0%,rgba(99,102,241,0.07) 0%,transparent 55%),radial-gradient(ellipse 44% 36% at 96% 100%,rgba(139,92,246,0.05) 0%,transparent 50%),#01030c"}}>

        {/* ── HEADER ── */}
        <header style={{flexShrink:0,display:"flex",alignItems:"center",gap:10,padding:"5px 18px",background:"rgba(1,3,12,0.99)",backdropFilter:"blur(28px)",borderBottom:"1px solid rgba(255,255,255,0.065)",boxShadow:"0 1px 0 rgba(99,102,241,0.06),0 4px 22px rgba(0,0,0,0.55)",zIndex:20}}>
          <div style={{width:30,height:30,borderRadius:9,flexShrink:0,background:"linear-gradient(135deg,#312e81,#4f46e5 52%,#7c3aed)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,animation:"logoPulse 3.5s ease-in-out infinite"}}>⬡</div>
          <div>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:800,background:"linear-gradient(90deg,#818cf8,#c084fc 50%,#818cf8)",backgroundSize:"200% auto",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",animation:"shimmer 5s linear infinite",letterSpacing:"-.2px"}}>VisuoSlayer Graph</div>
            <div style={{fontSize:6.5,color:"#1a2e48",fontFamily:"'JetBrains Mono',monospace",letterSpacing:".1em",textTransform:"uppercase",marginTop:1}}>DSA Visualizer v3</div>
          </div>

          {/* Mode toggles */}
          <div style={{display:"flex",gap:5,marginLeft:16}}>
            {[{k:"directed",l:"DIRECTED",a:directed,fn:()=>{setDirected(v=>!v);reset();},c:"#818cf8"},{k:"weighted",l:"WEIGHTED",a:weighted,fn:()=>{setWeighted(v=>!v);reset();},c:"#fbbf24"}].map(t=>(
              <button key={t.k} onClick={t.fn} style={{padding:"3px 10px",borderRadius:20,cursor:"pointer",fontFamily:"'JetBrains Mono',monospace",fontSize:7.5,fontWeight:800,letterSpacing:".06em",border:`1.5px solid ${t.a?t.c+"70":t.c+"20"}`,background:t.a?`${t.c}15`:"rgba(255,255,255,0.025)",color:t.a?t.c:"#2a3a5a",transition:"all .14s",outline:"none"}}>{t.a?"◉":"◎"} {t.l}</button>
            ))}
          </div>

          <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:7}}>
            <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:7.5,color:lm.accent,background:lm.dim,border:`1px solid ${lm.border}`,padding:"2px 9px",borderRadius:20,fontWeight:800}}>{lm.name}</span>
            <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:6.5,color:"#1a2e48",padding:"2px 8px",borderRadius:20,border:"1px solid rgba(255,255,255,0.07)",background:"rgba(255,255,255,0.02)"}}>pid:{sid}</span>
            <div style={{width:1,height:15,background:"rgba(255,255,255,0.07)"}}/>
            <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:7,color:"#1a2e48"}}>⌘↵ run · ⌘→/← step</span>
          </div>
        </header>

        {/* ── GRID ── */}
        <main style={{flex:1,display:"grid",gridTemplateColumns:"0.8fr 1.2fr",gap:5,padding:"5px 18px 7px",minHeight:0,overflow:"hidden"}}>

          {/* ── LEFT: Editor ── */}
          <div style={panel}>
            <div style={tbar}>
              {["#ff5f57","#ffbd2e","#28c840"].map((c,i)=><span key={i} style={dot(c)}/>)}
              <span style={{marginLeft:6,fontFamily:"'JetBrains Mono',monospace",fontSize:7,color:"#2a3a5a",textTransform:"uppercase",letterSpacing:"1.2px",fontWeight:700}}>Code Editor</span>
              <span style={{marginLeft:"auto",fontFamily:"'JetBrains Mono',monospace",fontSize:7.5,fontWeight:800,color:lm.accent,background:lm.dim,border:`1px solid ${lm.border}`,padding:"1px 8px",borderRadius:20}}>{lm.name}</span>
            </div>

            {/* Editor area */}
            <div style={{flex:termOpen?"0 0 60%":1,display:"flex",flexDirection:"column",minHeight:0,borderBottom:"1px solid rgba(255,255,255,0.055)"}}>
              {/* Lang tabs */}
              <div style={{display:"flex",gap:3,flexWrap:"wrap",padding:"5px 8px",borderBottom:"1px solid rgba(255,255,255,0.055)",background:"rgba(2,3,10,0.98)",flexShrink:0}}>
                {Object.entries(LANGS).map(([k,m])=>(
                  <button key={k} onClick={()=>changeLang(k)} style={{padding:"3px 9px",borderRadius:6,cursor:"pointer",fontFamily:"'JetBrains Mono',monospace",fontSize:8,fontWeight:800,letterSpacing:".04em",border:`1.5px solid ${lang===k?m.border:"rgba(255,255,255,0.1)"}`,background:lang===k?m.dim:"rgba(255,255,255,0.03)",color:lang===k?m.accent:"#4a6080",transition:"all .12s",outline:"none"}}>{m.ext}</button>
                ))}
              </div>
              <CodeEditor code={code} setCode={setCode} step={step} errLines={errLn} onKeyDown={onKeyDown} taRef={taRef}/>
              {/* Active step indicator */}
              {step && os && (
                <div style={{display:"flex",alignItems:"center",gap:5,padding:"3px 9px",borderLeft:`2px solid ${os.bd}`,minHeight:22,borderTop:"1px solid rgba(255,255,255,0.055)",flexShrink:0,animation:"fadeUp .14s ease",background:os.bg}}>
                  <span style={{color:os.c,fontSize:9,fontWeight:700}}>{os.icon}</span>
                  <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:7.5,fontWeight:700,color:os.c}}>L{step.ln+1}</span>
                  <code style={{fontFamily:"'JetBrains Mono',monospace",fontSize:7.5,color:"#2a3a5a",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1}}>{step.cl}</code>
                </div>
              )}
              {/* Run bar */}
              <div style={{padding:"5px 9px",borderTop:"1px solid rgba(255,255,255,0.055)",display:"flex",alignItems:"center",gap:5,flexShrink:0,background:"rgba(1,2,10,0.85)"}}>
                <button onClick={run} disabled={playing||validating} style={{padding:"5px 18px",borderRadius:8,background:playing||validating?"linear-gradient(135deg,#1e1a5e,#2d2a8a)":"linear-gradient(135deg,#312e81,#4f46e5,#818cf8)",border:`1.5px solid rgba(129,140,248,${playing||validating?0.15:0.45})`,color:"#fff",fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:800,cursor:playing||validating?"not-allowed":"pointer",letterSpacing:".05em",boxShadow:playing||validating?"none":"0 0 18px rgba(99,102,241,0.38)",animation:playing||validating?"runGlow 1s ease-in-out infinite":"none",opacity:playing||validating?0.55:1,transition:"all .14s",outline:"none"}}>
                  {validating?"⟳  AI Review…":playing?"▶  Running…":"▶  Run & Visualize"}
                </button>
                {(steps.length>0||aiErrs.length>0)&&<button onClick={reset} style={{padding:"5px 10px",borderRadius:8,background:"transparent",border:"1.5px solid rgba(248,113,113,0.35)",color:"#f87171",fontFamily:"'JetBrains Mono',monospace",fontSize:8,fontWeight:700,cursor:"pointer",outline:"none"}}>↺ Reset</button>}
                <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:7,color:"#1a2e48",padding:"2px 7px",borderRadius:5,border:"1px solid rgba(255,255,255,0.08)",background:"rgba(255,255,255,0.02)",marginLeft:"auto"}}>⌘↵</span>
              </div>
            </div>

            {/* Terminal */}
            <div style={{display:"flex",flexDirection:"column",minHeight:0,overflow:"hidden",flex:termOpen?1:"0 0 0px",opacity:termOpen?1:0,pointerEvents:termOpen?"auto":"none",transition:"flex .26s cubic-bezier(.4,0,.2,1),opacity .18s"}}>
              <div style={{display:"flex",alignItems:"center",gap:4,padding:"4px 9px",background:"rgba(1,2,8,0.99)",borderBottom:"1px solid rgba(255,255,255,0.055)",borderTop:"1px solid rgba(255,255,255,0.055)",flexShrink:0}}>
                {["#ff5f57","#ffbd2e","#28c840"].map((c,i)=><span key={i} style={{width:7,height:7,borderRadius:"50%",background:c,display:"inline-block"}}/>)}
                <span style={{marginLeft:6,fontFamily:"'JetBrains Mono',monospace",fontSize:6.5,color:"#1a2e48",textTransform:"uppercase",letterSpacing:"1px"}}>terminal</span>
                <button onClick={()=>setTermOpen(false)} style={{display:"flex",alignItems:"center",justifyContent:"center",width:15,height:15,borderRadius:3,border:"1px solid rgba(255,255,255,0.1)",background:"rgba(255,255,255,0.03)",cursor:"pointer",color:"#1a2e48",fontSize:7,fontWeight:800,marginLeft:"auto",outline:"none"}}>▾</button>
              </div>
              <Terminal lines={termLines} validating={validating}/>
            </div>
            {!termOpen&&(
              <div onClick={()=>setTermOpen(true)} style={{display:"flex",alignItems:"center",gap:4,padding:"4px 9px",background:"rgba(1,2,8,0.99)",borderTop:"1px solid rgba(255,255,255,0.055)",flexShrink:0,cursor:"pointer"}}>
                {["#ff5f57","#ffbd2e","#28c840"].map((c,i)=><span key={i} style={{width:6,height:6,borderRadius:"50%",background:c,display:"inline-block"}}/>)}
                <span style={{marginLeft:5,fontFamily:"'JetBrains Mono',monospace",fontSize:6.5,color:"#1a2e48",textTransform:"uppercase",letterSpacing:"1px"}}>terminal</span>
                {termLines.some(l=>l.t==="error"||l.t==="stderr")&&<span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:6.5,color:"#f87171",background:"rgba(239,68,68,0.1)",border:"1px solid rgba(248,113,113,0.22)",padding:"0 5px",borderRadius:7,marginLeft:4}}>errors</span>}
                {termLines.some(l=>l.t==="success")&&<span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:6.5,color:"#4ade80",background:"rgba(74,222,128,0.08)",border:"1px solid rgba(74,222,128,0.22)",padding:"0 5px",borderRadius:7,marginLeft:4}}>ok</span>}
                <span style={{marginLeft:"auto",fontFamily:"'JetBrains Mono',monospace",fontSize:7,color:"#818cf8",fontWeight:700}}>▴</span>
              </div>
            )}
          </div>

          {/* ── RIGHT: Visualization ── */}
          <div style={{...panel,position:"relative"}}>
            <div style={tbar}>
              {["#818cf8","#f87171","#fbbf24"].map((c,i)=><span key={i} style={dot(c)}/>)}
              <span style={{marginLeft:6,fontFamily:"'JetBrains Mono',monospace",fontSize:7,color:"#2a3a5a",textTransform:"uppercase",letterSpacing:"1.2px",fontWeight:700}}>Visualization</span>
              {directed&&<span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:7,color:"#818cf8",background:"rgba(99,102,241,0.1)",border:"1px solid rgba(129,140,248,0.28)",padding:"1px 6px",borderRadius:10,marginLeft:4}}>DIRECTED</span>}
              {weighted&&<span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:7,color:"#fbbf24",background:"rgba(251,191,36,0.1)",border:"1px solid rgba(251,191,36,0.28)",padding:"1px 6px",borderRadius:10,marginLeft:2}}>WEIGHTED</span>}
              {steps.length>0&&<span style={{marginLeft:"auto",fontFamily:"'JetBrains Mono',monospace",fontSize:7.5,color:"#a5b4fc",background:"rgba(99,102,241,0.12)",border:"1px solid rgba(129,140,248,0.3)",padding:"1px 8px",borderRadius:20,fontWeight:800,animation:"pop .18s ease"}}>{idx+1}/{steps.length}</span>}
            </div>

            {/* Metrics */}
            <div style={{display:"flex",borderBottom:"1px solid rgba(255,255,255,0.055)",background:"rgba(2,3,14,0.95)",flexShrink:0}}>
              {metrics.map((m,mi)=>(
                <div key={m.l} style={{flex:1,padding:"5px",textAlign:"center",borderRight:mi<3?"1px solid rgba(255,255,255,0.055)":"none"}}>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:5.5,color:"#0e1e30",letterSpacing:".2em",textTransform:"uppercase",fontWeight:700,marginBottom:2}}>{m.l}</div>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:15,fontWeight:800,lineHeight:1.1,color:m.c,transition:"color .3s"}}>{String(m.v)}</div>
                </div>
              ))}
            </div>

            {/* Canvas */}
            <div style={{flex:1,position:"relative",overflow:"hidden",minHeight:0}}>
              <GraphCanvas graph={step?.graph??null} hl={step?.hl??[]} tEdges={step?.tEdges??[]} directed={directed} weighted={weighted} layoutKey={lKey}/>
            </div>

            {/* Op message */}
            <div style={{padding:"4px 10px",borderTop:"1px solid rgba(255,255,255,0.055)",background:"rgba(2,3,12,0.8)",minHeight:34,flexShrink:0,display:"flex",alignItems:"center",gap:7}}>
              {step&&os?(
                <>
                  <div style={{display:"inline-flex",alignItems:"center",gap:4,padding:"2px 10px",borderRadius:18,fontFamily:"'JetBrains Mono',monospace",fontSize:7.5,fontWeight:800,animation:"pop .18s ease",border:`1.5px solid ${os.bd}`,color:os.c,background:os.bg,flexShrink:0}}>{os.icon} {os.label}</div>
                  <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:"#2a3a5a",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",animation:"fadeUp .15s ease"}}>{step.msg}</span>
                </>
              ):(
                <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:"#0e1e30"}}>
                  {idle?"⬡  Write Graph code · addNode / addEdge · Run & Visualize":aiErrs.length?"⚠  Errors — see terminal":validating?"⟳  Reviewing…":"⏸  Ready"}
                </span>
              )}
            </div>

            {/* Playback */}
            {steps.length>0&&(
              <div style={{display:"flex",alignItems:"center",gap:4,padding:"4px 10px",borderTop:"1px solid rgba(255,255,255,0.055)",background:"rgba(2,3,10,0.9)",flexShrink:0}}>
                {[["⏮",()=>goTo(0),idx<=0],["◀",()=>goTo(idx-1),idx<=0]].map(([ic,fn,dis],i)=>(
                  <button key={i} onClick={fn} disabled={dis} style={{width:23,height:23,borderRadius:6,border:"1.5px solid rgba(255,255,255,0.1)",background:"rgba(6,10,26,0.9)",color:dis?"#0e1e30":"#4a6080",fontSize:9,cursor:dis?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .12s",outline:"none"}}>{ic}</button>
                ))}
                <button onClick={()=>{ if(done||idx>=steps.length-1){setIdx(0);bump();setDone(false);setPlaying(true);}else{clearInterval(timerRef.current);setPlaying(p=>!p);} }} style={{height:23,padding:"0 14px",borderRadius:6,background:"linear-gradient(135deg,#312e81,#4f46e5)",border:"1.5px solid rgba(129,140,248,0.42)",color:"#fff",fontSize:9,fontWeight:800,cursor:"pointer",boxShadow:"0 0 10px rgba(99,102,241,0.38)",outline:"none"}}>{playing?"⏸":done?"↺":"▶"}</button>
                {[["▶",()=>goTo(idx+1),idx>=steps.length-1],["⏭",()=>goTo(steps.length-1),idx>=steps.length-1]].map(([ic,fn,dis],i)=>(
                  <button key={i} onClick={fn} disabled={dis} style={{width:23,height:23,borderRadius:6,border:"1.5px solid rgba(255,255,255,0.1)",background:"rgba(6,10,26,0.9)",color:dis?"#0e1e30":"#4a6080",fontSize:9,cursor:dis?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .12s",outline:"none"}}>{ic}</button>
                ))}
                <div style={{width:1,height:13,background:"rgba(255,255,255,0.07)",margin:"0 2px"}}/>
                {[[1.6,"½×"],[1.1,"1×"],[0.55,"2×"],[0.28,"4×"]].map(([s,l])=>(
                  <button key={s} onClick={()=>setSpeed(s)} style={{padding:"2px 6px",borderRadius:5,cursor:"pointer",fontFamily:"'JetBrains Mono',monospace",fontSize:7.5,fontWeight:800,border:`1.5px solid ${speed===s?"rgba(129,140,248,0.5)":"rgba(255,255,255,0.09)"}`,background:speed===s?"rgba(99,102,241,0.15)":"rgba(255,255,255,0.02)",color:speed===s?"#a5b4fc":"#2a3a5a",transition:"all .12s",outline:"none"}}>{l}</button>
                ))}
                <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,marginLeft:"auto"}}><span style={{color:"#a5b4fc",fontWeight:800}}>{idx+1}</span><span style={{color:"#0e1e30"}}>/{steps.length}</span></span>
              </div>
            )}

            {/* Progress */}
            {steps.length>0&&(
              <div style={{display:"flex",alignItems:"center",gap:5,padding:"3px 10px",borderTop:"1px solid rgba(255,255,255,0.055)",flexShrink:0}}>
                <div style={{flex:1,height:2,background:"rgba(255,255,255,0.04)",borderRadius:99,overflow:"hidden"}}>
                  <div style={{height:"100%",borderRadius:99,width:`${prog}%`,transition:"width .3s cubic-bezier(.4,0,.2,1)",background:"linear-gradient(90deg,#312e81,#4f46e5,#a5b4fc)",animation:"progGlow 2.4s ease-in-out infinite"}}/>
                </div>
                <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:7,color:"#0e1e30",minWidth:22,textAlign:"right",fontWeight:700}}>{prog}%</span>
              </div>
            )}

            {/* Op log */}
            {steps.length>0&&(
              <div style={{flexShrink:0,borderTop:"1px solid rgba(255,255,255,0.055)",background:"rgba(2,3,10,0.95)"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"2px 10px",fontFamily:"'JetBrains Mono',monospace",fontSize:5.5,color:"#0e1e30",letterSpacing:".18em",textTransform:"uppercase",fontWeight:700}}>
                  <span>Operation Log</span><span style={{color:"#818cf8"}}>{steps.length} ops</span>
                </div>
                <div ref={listRef} style={{overflowX:"auto",overflowY:"hidden",padding:"2px 7px 5px",display:"flex",gap:3,alignItems:"center",scrollbarWidth:"thin",scrollbarColor:"rgba(99,102,241,0.1) transparent"}}>
                  {steps.map((s,i)=>{
                    const sm=OP_META[s.t]??OP_META.addNode, past=i<idx, active=i===idx;
                    return (
                      <div key={i} className={active?"sla":""} onClick={()=>goTo(i)} style={{display:"inline-flex",alignItems:"center",gap:3,padding:"2px 7px",borderRadius:16,cursor:"pointer",fontFamily:"'JetBrains Mono',monospace",fontSize:7,fontWeight:700,flexShrink:0,color:active?sm.c:past?"#3a5060":"#0e1e30",border:`1.5px solid ${active?sm.bd:past?"rgba(255,255,255,0.08)":"rgba(255,255,255,0.03)"}`,background:active?sm.bg:past?"rgba(255,255,255,0.02)":"transparent",transition:"all .12s"}}>
                        <span style={{width:4,height:4,borderRadius:"50%",flexShrink:0,background:past?"#4ade80":active?sm.c:"#0a1020",boxShadow:active?`0 0 4px ${sm.c}`:past?"0 0 3px rgba(74,222,128,0.4)":"none"}}/>
                        <span>{sm.icon} {s.t.slice(0,3)}</span>
                        <span style={{opacity:.5,fontSize:6.5}}>
                          {(s.t==="addNode")&&`(${s.label})`}
                          {(s.t==="addEdge"||s.t==="removeEdge")&&`(${s.u},${s.v})`}
                          {(s.t==="removeNode")&&`(${s.id})`}
                          {(s.t==="bfs"||s.t==="dfs"||s.t==="dijkstra")&&`(${s.start})`}
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
      {toast&&<div style={{position:"fixed",bottom:14,right:14,padding:"6px 14px",borderRadius:9,fontFamily:"'JetBrains Mono',monospace",fontSize:8.5,fontWeight:700,background:"rgba(2,4,16,0.98)",border:`1px solid ${toast.c}28`,color:toast.c,boxShadow:"0 8px 28px rgba(0,0,0,0.65)",zIndex:9999,animation:"toastIn .2s ease",backdropFilter:"blur(18px)"}}>{toast.msg}</div>}
    </>
  );
}