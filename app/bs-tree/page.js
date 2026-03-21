"use client";
import { useState, useRef, useEffect, useCallback } from "react";

/* ─── BST Logic ─── */
class TreeNode {
  constructor(val) {
    this.val = val; this.left = null; this.right = null;
    this.id = Math.random().toString(36).slice(2, 9);
  }
}
const bstInsert = (node, val) => {
  if (!node) return new TreeNode(val);
  if (val < node.val) node.left = bstInsert(node.left, val);
  else if (val > node.val) node.right = bstInsert(node.right, val);
  return node;
};
const bstDelete = (node, v) => {
  if (!node) return null;
  if (v < node.val) { node.left = bstDelete(node.left, v); return node; }
  if (v > node.val) { node.right = bstDelete(node.right, v); return node; }
  if (!node.left) return node.right;
  if (!node.right) return node.left;
  let s = node.right; while (s.left) s = s.left;
  node.val = s.val; node.right = bstDelete(node.right, s.val); return node;
};
const cloneTree = (n) => {
  if (!n) return null;
  const c = new TreeNode(n.val); c.id = n.id;
  c.left = cloneTree(n.left); c.right = cloneTree(n.right); return c;
};
const pathToNode = (node, val, path = []) => {
  if (!node) return null;
  path.push(node.val);
  if (val === node.val) return path;
  return val < node.val ? pathToNode(node.left, val, path) : pathToNode(node.right, val, path);
};
const treeHeight = (n) => !n ? 0 : 1 + Math.max(treeHeight(n.left), treeHeight(n.right));
const treeSize  = (n) => !n ? 0 : 1 + treeSize(n.left) + treeSize(n.right);

/* ─── Parser ─── */
function parseAndRunCode(code) {
  const steps = [], errors = [];
  const stripped = code.replace(/\/\/[^\n]*/g,"").replace(/\/\*[\s\S]*?\*\//g,"").replace(/#[^\n]*/g,"");
  const lines = code.split("\n"), strippedLines = stripped.split("\n");
  let instanceVar = null;
  const instancePatterns = [
    /(?:const|let|var)\s+(\w+)\s*=\s*new\s+\w*[Bb][Ss][Tt]\s*\(/,
    /(?:const|let|var)\s+(\w+)\s*=\s*new\s+\w+\s*\(\s*\)/,
    /(\w+)\s*=\s*(?:BST|BinarySearchTree|Tree)\s*\(\s*\)/,
    /(\w+)\s*:=\s*&?\s*(?:BST|BinarySearchTree|Tree)\s*[({]/,
    /(?:BST|BinarySearchTree|Tree)\s*(?:<\w+>)?\s+(\w+)\s*[=;]/,
  ];
  for (const pat of instancePatterns) { const m = stripped.match(pat); if (m) { instanceVar = m[1]; break; } }
  if (!instanceVar) { const fb = stripped.match(/(\w+)\s*\.\s*(?:insert|Insert)\s*\(\s*\d+/); if (fb) instanceVar = fb[1]; }
  if (!instanceVar) { errors.push("Could not find BST instance.\nCreate one:\n  const tree = new BST();\n  tree.insert(50);"); return { steps, errors }; }
  const varRe = instanceVar.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
  const callRe = new RegExp(`${varRe}\\s*\\.\\s*(insert|Insert|add|Add|search|Search|find|Find|contains|Contains|has|Has|delete|Delete|remove|Remove|delete_val)\\s*\\(\\s*(\\d+)`,"g");
  const allOps = []; let m;
  while ((m = callRe.exec(stripped)) !== null) {
    const mn = m[1].toLowerCase();
    let type = "insert";
    if (["search","find","contains","has"].includes(mn)) type = "search";
    else if (["delete","remove","delete_val"].includes(mn)) type = "delete";
    allOps.push({ type, val: +m[2], charIdx: m.index });
  }
  if (!allOps.length) { errors.push(`Instance '${instanceVar}' found but no calls detected.\nCall insert(N), search(N), or delete(N).`); return { steps, errors }; }
  const getLineNum = (ci) => { let cur=0; for(let i=0;i<strippedLines.length;i++){cur+=strippedLines[i].length+1;if(cur>ci)return i;} return lines.length-1; };
  let root = null;
  for (const op of allOps) {
    const lineNum = getLineNum(op.charIdx), codeLine = lines[lineNum]?.trim() ?? "";
    if (op.type==="insert") {
      root = bstInsert(root, op.val);
      const snap = cloneTree(root);
      steps.push({type:"insert",value:op.val,tree:snap,highlight:[op.val],path:pathToNode(snap,op.val),message:`insert(${op.val}) → placed at correct BST position`,size:treeSize(snap),height:treeHeight(snap),lineNum,codeLine});
    } else if (op.type==="search") {
      const snap = cloneTree(root), path = pathToNode(snap, op.val);
      steps.push({type:"search",value:op.val,tree:snap,highlight:path||[],path,found:!!path,message:path?`search(${op.val}) → Found ✓  path: ${path.join(" → ")}`:`search(${op.val}) → Not found ✗`,size:treeSize(snap),height:treeHeight(snap),lineNum,codeLine});
    } else {
      root = bstDelete(root, op.val);
      const snap = cloneTree(root);
      steps.push({type:"delete",value:op.val,tree:snap,highlight:[],path:null,message:`delete(${op.val}) → removed, BST property maintained`,size:treeSize(snap),height:treeHeight(snap),lineNum,codeLine});
    }
  }
  return { steps, errors };
}

/* ─── Layout ─── */
function layoutTree(root) {
  const pos = {}; let counter = 0;
  const inorder = (n) => { if(!n) return; inorder(n.left); pos[n.id]={x:counter++,y:0}; inorder(n.right); };
  const depth   = (n,d) => { if(!n) return; pos[n.id].y=d; depth(n.left,d+1); depth(n.right,d+1); };
  inorder(root); depth(root, 0); return pos;
}

/* ─── Tree SVG (compact) ─── */
function TreeViz({ tree, highlight=[], path=[], animKey, opType, idle, pointerIdx, deletedNodePos }) {
  const W=720, NR=24;
  if (!tree) return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12,width:"100%",minHeight:200,justifyContent:"center",border:"1px dashed rgba(96,165,250,0.1)",borderRadius:12,background:"rgba(59,130,246,0.015)"}}>
      <div style={{fontSize:40,animation:"idleFloat 3.5s ease-in-out infinite",filter:"drop-shadow(0 0 12px rgba(96,165,250,0.25))"}}>🌲</div>
      <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:"#2a4060",letterSpacing:".1em",textAlign:"center",lineHeight:2,textTransform:"uppercase"}}>
        {idle?"Write a BST · insert / search / delete · Run":"Tree will appear here"}
      </div>
    </div>
  );

  const pos = layoutTree(tree);
  const vals = Object.values(pos);
  const maxX = vals.length ? Math.max(...vals.map(p=>p.x)) : 0;
  const maxY = vals.length ? Math.max(...vals.map(p=>p.y)) : 0;
  const pad=48, vGap=72;
  const px=(x)=>maxX===0?W/2:(x/maxX)*(W-pad*2)+pad;
  const py=(y)=>y*vGap+48;
  const svgH=Math.max((maxY+1)*vGap+80,180);

  const nodes=[], edges=[];
  const collect=(n)=>{
    if(!n) return; nodes.push(n);
    if(n.left) {edges.push({from:n.id,to:n.left.id,fv:n.val,tv:n.left.val}); collect(n.left);}
    if(n.right){edges.push({from:n.id,to:n.right.id,fv:n.val,tv:n.right.val}); collect(n.right);}
  };
  collect(tree);

  const pathSet = new Set(path||[]);
  const isPathEdge = (fv,tv) => pathSet.has(fv) && pathSet.has(tv);
  const currentPointerVal = (opType==="search" && path && path.length>0)
    ? path[Math.min(pointerIdx??path.length-1, path.length-1)] : null;

  return (
    <svg key={animKey} viewBox={`0 0 ${W} ${svgH}`} width="100%" style={{overflow:"visible",maxHeight:440,display:"block"}}>
      <defs>
        <radialGradient id="gBase"    cx="38%" cy="30%"><stop offset="0%" stopColor="#162035"/><stop offset="100%" stopColor="#060d1e"/></radialGradient>
        <radialGradient id="gInsert" cx="38%" cy="30%"><stop offset="0%" stopColor="#1d4ed8"/><stop offset="100%" stopColor="#1e3a8a"/></radialGradient>
        <radialGradient id="gSearch" cx="38%" cy="30%"><stop offset="0%" stopColor="#1d4ed8"/><stop offset="100%" stopColor="#1e3a8a"/></radialGradient>
        <radialGradient id="gPointer"cx="38%" cy="30%"><stop offset="0%" stopColor="#0ea5e9"/><stop offset="100%" stopColor="#0c4a6e"/></radialGradient>
        <radialGradient id="gDelete" cx="38%" cy="30%"><stop offset="0%" stopColor="#b91c1c"/><stop offset="100%" stopColor="#450a0a"/></radialGradient>
        <filter id="fGlow"  x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="fEdge"  x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="fShad"  x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4"/></filter>
        <marker id="arrowPath" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,1 L0,6 L7,3.5 z" fill="#60a5fa" opacity="0.8"/>
        </marker>
        <pattern id="bgGrid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(96,130,255,0.04)" strokeWidth="1"/>
        </pattern>
        <style>{`
          .edgeDraw{stroke-dasharray:800;stroke-dashoffset:800;animation:edReveal .45s ease forwards}
          @keyframes edReveal{to{stroke-dashoffset:0}}
          .pathEdge{stroke-dasharray:9 5;animation:dashFlow .9s linear infinite}
          @keyframes dashFlow{to{stroke-dashoffset:-28}}
          .nodeIn{animation:nodeIn .5s cubic-bezier(.34,1.4,.64,1) both;transform-box:fill-box;transform-origin:center}
          @keyframes nodeIn{0%{transform:scale(.08);opacity:0}65%{transform:scale(1.12)}100%{transform:scale(1);opacity:1}}
          .nodeRipple{animation:ripple .65s ease-out forwards;transform-box:fill-box;transform-origin:center}
          @keyframes ripple{0%{transform:scale(.85);opacity:.75;stroke-width:2.5}100%{transform:scale(2.8);opacity:0;stroke-width:.5}}
          .nodePointer{animation:pointerPulse 1.2s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
          @keyframes pointerPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}
          .nodeFound{animation:foundBounce .5s cubic-bezier(.34,1.5,.64,1) both;transform-box:fill-box;transform-origin:center}
          @keyframes foundBounce{0%{transform:scale(.9)}55%{transform:scale(1.15)}100%{transform:scale(1)}}
          .pointerArrow{animation:arrowBounce .7s ease-in-out infinite}
          @keyframes arrowBounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
          .deleteExplode{animation:deleteBurst .55s ease-out forwards;transform-box:fill-box;transform-origin:center}
          @keyframes deleteBurst{0%{transform:scale(1);opacity:1;stroke-width:2.5}100%{transform:scale(3);opacity:0;stroke-width:.5}}
          .deleteParticle{animation:particleFly .6s ease-out forwards}
          @keyframes particleFly{0%{transform:translate(0,0) scale(1);opacity:.9}100%{transform:translate(var(--dx,0),var(--dy,0)) scale(0);opacity:0}}
        `}</style>
      </defs>
      <rect width={W} height={svgH} fill="url(#bgGrid)"/>

      {/* Edges */}
      {edges.map(e=>{
        const fp=pos[e.from], tp=pos[e.to]; if(!fp||!tp) return null;
        const isHL=isPathEdge(e.fv,e.tv);
        return (
          <g key={`e-${e.from}-${e.to}`}>
            {isHL&&<line x1={px(fp.x)} y1={py(fp.y)} x2={px(tp.x)} y2={py(tp.y)} stroke="#3b82f6" strokeWidth="4" opacity="0.1" filter="url(#fEdge)"/>}
            <line x1={px(fp.x)} y1={py(fp.y)} x2={px(tp.x)} y2={py(tp.y)}
              stroke={isHL?"#60a5fa":"rgba(80,120,200,0.16)"} strokeWidth={isHL?2:1.3}
              markerEnd={isHL?"url(#arrowPath)":undefined}
              className={isHL?"pathEdge":"edgeDraw"}/>
          </g>
        );
      })}

      {/* Deleted node animation (if any) */}
      {deletedNodePos && (
        <g>
          <circle cx={deletedNodePos.x} cy={deletedNodePos.y} r={NR+6}
            fill="none" stroke="#f87171" strokeWidth="2.2" className="deleteExplode"/>
          {[0,1,2,3,4,5].map((_,i)=>{
            const angle = (i*60) * Math.PI/180;
            const dx = Math.cos(angle)*20, dy = Math.sin(angle)*20;
            return (
              <circle key={i} cx={deletedNodePos.x} cy={deletedNodePos.y} r="2.5" fill="#ff6b6b"
                style={{'--dx':`${dx}px`,'--dy':`${dy}px`}} className="deleteParticle"/>
            );
          })}
        </g>
      )}

      {/* Nodes */}
      {nodes.map(node=>{
        const p=pos[node.id]; if(!p) return null;
        const cx=px(p.x), cy=py(p.y);
        const isHl   = highlight.includes(node.val);
        const onPath = pathSet.has(node.val);
        const isPtr  = node.val===currentPointerVal && opType==="search";
        const isFound= opType==="search" && isHl && node.val===highlight[highlight.length-1];
        const isIns  = opType==="insert" && isHl;
        const isDel  = opType==="delete" && isHl;

        let fill="url(#gBase)", stroke="rgba(80,120,200,0.18)", strokeW=1.4;
        if (isPtr)           { fill="url(#gPointer)"; stroke="#7dd3fc"; strokeW=2.2; }
        else if (isFound)    { fill="url(#gSearch)"; stroke="#60a5fa"; strokeW=2.2; }
        else if (onPath && opType==="search") { fill="url(#gSearch)"; stroke="#3b82f6"; strokeW=1.8; }
        else if (isDel)      { fill="url(#gDelete)"; stroke="#f87171"; strokeW=2.2; }
        else if (isIns)      { fill="url(#gInsert)"; stroke="#60a5fa"; strokeW=2.2; }

        const cls = isIns?"nodeIn":isFound?"nodeFound":isPtr?"nodePointer":"";

        return (
          <g key={`n-${node.id}-${animKey}`}>
            {(isPtr||isFound||isIns)&&<circle cx={cx} cy={cy} r={NR+12} fill={isDel?"rgba(239,68,68,0.1)":"rgba(59,130,246,0.1)"} filter="url(#fGlow)"/>}
            {isIns&&<circle cx={cx} cy={cy} r={NR} fill="none" stroke="#60a5fa" strokeWidth="2" opacity="0" className="nodeRipple"/>}
            <circle cx={cx} cy={cy+3} r={NR} fill="rgba(0,0,0,0.4)" filter="url(#fShad)"/>
            <circle cx={cx} cy={cy} r={NR} fill={fill} stroke={stroke} strokeWidth={strokeW} className={cls} style={{transition:"fill .28s,stroke .28s"}}/>
            <circle cx={cx-6} cy={cy-6} r={5}   fill="rgba(255,255,255,0.08)"/>
            <circle cx={cx-3.5} cy={cy-3.5} r={2} fill="rgba(255,255,255,0.16)"/>
            {isPtr&&(
              <text x={cx} y={cy-NR-12} textAnchor="middle" fill="#7dd3fc" fontSize="12"
                fontFamily="'JetBrains Mono',monospace" className="pointerArrow">▼</text>
            )}
            <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central"
              fill={(isHl||onPath)?"#fff":"#5a8aaa"} fontSize="12" fontWeight="700"
              fontFamily="'JetBrains Mono',monospace">{node.val}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* ─── Constants ─── */
const LANGS = {
  javascript:{ name:"JavaScript", ext:"JS",  accent:"#fde047", bg:"rgba(253,224,71,0.12)", border:"rgba(253,224,71,0.38)" },
  typescript:{ name:"TypeScript", ext:"TS",  accent:"#60a5fa", bg:"rgba(96,165,250,0.12)", border:"rgba(96,165,250,0.38)" },
  python:    { name:"Python",     ext:"PY",  accent:"#4ade80", bg:"rgba(74,222,128,0.12)", border:"rgba(74,222,128,0.38)" },
  java:      { name:"Java",       ext:"JV",  accent:"#fb923c", bg:"rgba(251,146,60,0.12)", border:"rgba(251,146,60,0.38)" },
  cpp:       { name:"C++",        ext:"C++", accent:"#38bdf8", bg:"rgba(56,189,248,0.12)", border:"rgba(56,189,248,0.38)" },
  csharp:    { name:"C#",         ext:"C#",  accent:"#c084fc", bg:"rgba(192,132,252,0.12)", border:"rgba(192,132,252,0.38)" },
  go:        { name:"Go",         ext:"GO",  accent:"#34d399", bg:"rgba(52,211,153,0.12)", border:"rgba(52,211,153,0.38)" },
};
const TPL = {
javascript: `// Binary Search Tree — JavaScript
class BST {
  constructor() { this.root = null; }

  insert(val) {
    const node = { val, left: null, right: null };
    if (!this.root) { this.root = node; return; }
    let cur = this.root;
    while (true) {
      if (val < cur.val) {
        if (!cur.left) { cur.left = node; return; }
        cur = cur.left;
      } else {
        if (!cur.right) { cur.right = node; return; }
        cur = cur.right;
      }
    }
  }

  search(val) {
    let cur = this.root;
    while (cur) {
      if (val === cur.val) return true;
      cur = val < cur.val ? cur.left : cur.right;
    }
    return false;
  }

  delete(val) { this.root = this._del(this.root, val); }

  _del(node, val) {
    if (!node) return null;
    if (val < node.val) { node.left = this._del(node.left, val); }
    else if (val > node.val) { node.right = this._del(node.right, val); }
    else {
      if (!node.left) return node.right;
      if (!node.right) return node.left;
      let min = node.right;
      while (min.left) min = min.left;
      node.val = min.val;
      node.right = this._del(node.right, min.val);
    }
    return node;
  }
}

const tree = new BST();
tree.insert(50);
tree.insert(30);
tree.insert(70);
tree.insert(20);
tree.insert(40);
tree.insert(60);
tree.insert(80);
tree.insert(10);
tree.insert(35);
tree.search(40);
tree.search(99);
tree.delete(30);
tree.insert(45);
tree.search(45);`,

typescript: `// Binary Search Tree — TypeScript
interface TNode { val: number; left: TNode | null; right: TNode | null; }
class BST {
  root: TNode | null = null;
  insert(val: number): void {
    const node: TNode = { val, left: null, right: null };
    if (!this.root) { this.root = node; return; }
    let cur = this.root;
    while (true) {
      if (val < cur.val) { if (!cur.left) { cur.left = node; return; } cur = cur.left; }
      else { if (!cur.right) { cur.right = node; return; } cur = cur.right; }
    }
  }
  search(val: number): boolean {
    let cur = this.root;
    while (cur) { if (val === cur.val) return true; cur = val < cur.val ? cur.left : cur.right; }
    return false;
  }
  delete(val: number): void { this.root = this._del(this.root, val); }
  private _del(n: TNode | null, val: number): TNode | null {
    if (!n) return null;
    if (val < n.val) n.left = this._del(n.left, val);
    else if (val > n.val) n.right = this._del(n.right, val);
    else {
      if (!n.left) return n.right; if (!n.right) return n.left;
      let min = n.right; while (min.left) min = min.left;
      n.val = min.val; n.right = this._del(n.right, min.val);
    }
    return n;
  }
}
const tree = new BST();
tree.insert(50); tree.insert(30); tree.insert(70);
tree.insert(20); tree.insert(40); tree.insert(60); tree.insert(80);
tree.search(40); tree.search(99); tree.delete(30);
tree.insert(45); tree.search(45);`,

python: `# Binary Search Tree — Python
class TreeNode:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None

class BST:
    def __init__(self):
        self.root = None

    def insert(self, val):
        if not self.root:
            self.root = TreeNode(val)
            return
        cur = self.root
        while True:
            if val < cur.val:
                if not cur.left:
                    cur.left = TreeNode(val)
                    return
                cur = cur.left
            else:
                if not cur.right:
                    cur.right = TreeNode(val)
                    return
                cur = cur.right

    def search(self, val):
        cur = self.root
        while cur:
            if val == cur.val:
                return True
            cur = cur.left if val < cur.val else cur.right
        return False

    def delete(self, val):
        self.root = self._del(self.root, val)

    def _del(self, node, val):
        if not node:
            return None
        if val < node.val:
            node.left = self._del(node.left, val)
        elif val > node.val:
            node.right = self._del(node.right, val)
        else:
            if not node.left:
                return node.right
            if not node.right:
                return node.left
            mn = node.right
            while mn.left:
                mn = mn.left
            node.val = mn.val
            node.right = self._del(node.right, mn.val)
        return node

tree = BST()
tree.insert(50)
tree.insert(30)
tree.insert(70)
tree.insert(20)
tree.insert(40)
tree.insert(60)
tree.insert(80)
tree.insert(10)
tree.insert(35)
tree.search(40)
tree.search(99)
tree.delete(30)
tree.insert(45)
tree.search(45)`,

java: `// Binary Search Tree — Java
class BST {
    class Node {
        int val;
        Node left, right;
        Node(int val) { this.val = val; }
    }

    private Node root;

    public void insert(int val) {
        root = insertRec(root, val);
    }

    private Node insertRec(Node node, int val) {
        if (node == null) return new Node(val);
        if (val < node.val) node.left = insertRec(node.left, val);
        else if (val > node.val) node.right = insertRec(node.right, val);
        return node;
    }

    public boolean search(int val) {
        return searchRec(root, val);
    }

    private boolean searchRec(Node node, int val) {
        if (node == null) return false;
        if (val == node.val) return true;
        return val < node.val ? searchRec(node.left, val) : searchRec(node.right, val);
    }

    public void delete(int val) {
        root = deleteRec(root, val);
    }

    private Node deleteRec(Node node, int val) {
        if (node == null) return null;
        if (val < node.val) node.left = deleteRec(node.left, val);
        else if (val > node.val) node.right = deleteRec(node.right, val);
        else {
            if (node.left == null) return node.right;
            if (node.right == null) return node.left;
            Node min = node.right;
            while (min.left != null) min = min.left;
            node.val = min.val;
            node.right = deleteRec(node.right, min.val);
        }
        return node;
    }

    public static void main(String[] args) {
        BST tree = new BST();
        tree.insert(50);
        tree.insert(30);
        tree.insert(70);
        tree.insert(20);
        tree.insert(40);
        tree.insert(60);
        tree.insert(80);
        tree.insert(10);
        tree.insert(35);
        tree.search(40);
        tree.search(99);
        tree.delete(30);
        tree.insert(45);
        tree.search(45);
    }
}`,

cpp: `// Binary Search Tree — C++
#include <iostream>
using namespace std;

struct Node {
    int val;
    Node *left, *right;
    Node(int v) : val(v), left(nullptr), right(nullptr) {}
};

class BST {
public:
    Node* root = nullptr;

    void insert(int val) {
        root = insertRec(root, val);
    }

    Node* insertRec(Node* node, int val) {
        if (!node) return new Node(val);
        if (val < node->val) node->left = insertRec(node->left, val);
        else if (val > node->val) node->right = insertRec(node->right, val);
        return node;
    }

    bool search(int val) {
        return searchRec(root, val);
    }

    bool searchRec(Node* node, int val) {
        if (!node) return false;
        if (val == node->val) return true;
        return val < node->val ? searchRec(node->left, val) : searchRec(node->right, val);
    }

    void deleteVal(int val) {
        root = deleteRec(root, val);
    }

    Node* deleteRec(Node* node, int val) {
        if (!node) return nullptr;
        if (val < node->val) node->left = deleteRec(node->left, val);
        else if (val > node->val) node->right = deleteRec(node->right, val);
        else {
            if (!node->left) return node->right;
            if (!node->right) return node->left;
            Node* min = node->right;
            while (min->left) min = min->left;
            node->val = min->val;
            node->right = deleteRec(node->right, min->val);
        }
        return node;
    }
};

int main() {
    BST tree;
    tree.insert(50);
    tree.insert(30);
    tree.insert(70);
    tree.insert(20);
    tree.insert(40);
    tree.insert(60);
    tree.insert(80);
    tree.insert(10);
    tree.insert(35);
    tree.search(40);
    tree.search(99);
    tree.deleteVal(30);
    tree.insert(45);
    tree.search(45);
    return 0;
}`,

csharp: `// Binary Search Tree — C#
using System;

class BST {
    class Node {
        public int val;
        public Node left, right;
        public Node(int val) { this.val = val; }
    }

    private Node root;

    public void Insert(int val) {
        root = InsertRec(root, val);
    }

    private Node InsertRec(Node node, int val) {
        if (node == null) return new Node(val);
        if (val < node.val) node.left = InsertRec(node.left, val);
        else if (val > node.val) node.right = InsertRec(node.right, val);
        return node;
    }

    public bool Search(int val) {
        return SearchRec(root, val);
    }

    private bool SearchRec(Node node, int val) {
        if (node == null) return false;
        if (val == node.val) return true;
        return val < node.val ? SearchRec(node.left, val) : SearchRec(node.right, val);
    }

    public void Delete(int val) {
        root = DeleteRec(root, val);
    }

    private Node DeleteRec(Node node, int val) {
        if (node == null) return null;
        if (val < node.val) node.left = DeleteRec(node.left, val);
        else if (val > node.val) node.right = DeleteRec(node.right, val);
        else {
            if (node.left == null) return node.right;
            if (node.right == null) return node.left;
            Node min = node.right;
            while (min.left != null) min = min.left;
            node.val = min.val;
            node.right = DeleteRec(node.right, min.val);
        }
        return node;
    }

    static void Main() {
        BST tree = new BST();
        tree.Insert(50);
        tree.Insert(30);
        tree.Insert(70);
        tree.Insert(20);
        tree.Insert(40);
        tree.Insert(60);
        tree.Insert(80);
        tree.Insert(10);
        tree.Insert(35);
        tree.Search(40);
        tree.Search(99);
        tree.Delete(30);
        tree.Insert(45);
        tree.Search(45);
    }
}`,

go: `// Binary Search Tree — Go
package main

import "fmt"

type Node struct {
    val   int
    left  *Node
    right *Node
}

type BST struct {
    root *Node
}

func (b *BST) insert(val int) {
    b.root = insertRec(b.root, val)
}

func insertRec(node *Node, val int) *Node {
    if node == nil {
        return &Node{val: val}
    }
    if val < node.val {
        node.left = insertRec(node.left, val)
    } else if val > node.val {
        node.right = insertRec(node.right, val)
    }
    return node
}

func (b *BST) search(val int) bool {
    return searchRec(b.root, val)
}

func searchRec(node *Node, val int) bool {
    if node == nil {
        return false
    }
    if val == node.val {
        return true
    }
    if val < node.val {
        return searchRec(node.left, val)
    }
    return searchRec(node.right, val)
}

func (b *BST) delete(val int) {
    b.root = deleteRec(b.root, val)
}

func deleteRec(node *Node, val int) *Node {
    if node == nil {
        return nil
    }
    if val < node.val {
        node.left = deleteRec(node.left, val)
    } else if val > node.val {
        node.right = deleteRec(node.right, val)
    } else {
        if node.left == nil {
            return node.right
        }
        if node.right == nil {
            return node.left
        }
        min := node.right
        for min.left != nil {
            min = min.left
        }
        node.val = min.val
        node.right = deleteRec(node.right, min.val)
    }
    return node
}

func main() {
    tree := &BST{}
    tree.insert(50)
    tree.insert(30)
    tree.insert(70)
    tree.insert(20)
    tree.insert(40)
    tree.insert(60)
    tree.insert(80)
    tree.insert(10)
    tree.insert(35)
    tree.search(40)
    tree.search(99)
    tree.delete(30)
    tree.insert(45)
    tree.search(45)
    fmt.Println("done")
}`,
};
const OP = {
  insert:{ label:"INSERT", icon:"↑", c:"#60a5fa", bg:"rgba(59,130,246,0.12)", bd:"rgba(96,165,250,0.45)" },
  search:{ label:"SEARCH", icon:"◎", c:"#93c5fd", bg:"rgba(59,130,246,0.1)",  bd:"rgba(147,197,253,0.4)" },
  delete:{ label:"DELETE", icon:"✕", c:"#f87171", bg:"rgba(239,68,68,0.1)",   bd:"rgba(248,113,113,0.45)"},
};
const LINE_H = 18;

async function validateWithAI(code, lang) {
  const prompt = `BST code reviewer. Check: BST class, logic bugs, syntax.
Return ONLY JSON, no markdown:
{"valid":true,"reason":"","errors":[]} OR {"valid":false,"reason":"short","errors":[{"line":1,"message":"issue"}]}
Code:\n\`\`\`${lang}\n${code.slice(0,3000)}\n\`\`\``;
  try {
    const res  = await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:[{role:"user",content:prompt}]})});
    const data = await res.json();
    if (data.error) return {valid:true,reason:"",errors:[],apiError:data.error};
    const raw  = (data.content??"").replace(/```json|```/gi,"").trim();
    const parsed = JSON.parse(raw);
    return {valid:!!parsed.valid,reason:parsed.reason??"",errors:Array.isArray(parsed.errors)?parsed.errors:[],apiError:null};
  } catch(e) { return {valid:true,reason:"",errors:[],apiError:e.message}; }
}

/* ─── Code Editor ─── */
function CodeEditor({ code, setCode, step, errorLineSet, onKeyDown, taRef }) {
  const lines  = code.split("\n");
  const lnRef  = useRef(null);
  const sync = useCallback(()=>{ if(taRef.current&&lnRef.current) lnRef.current.scrollTop=taRef.current.scrollTop; },[taRef]);
  useEffect(()=>{ const ta=taRef.current; if(!ta) return; ta.addEventListener("scroll",sync,{passive:true}); return()=>ta.removeEventListener("scroll",sync); },[sync]);
  return (
    <div style={{flex:1,display:"flex",minHeight:0,overflow:"hidden",position:"relative"}}>
      <div ref={lnRef} style={{width:36,flexShrink:0,background:"rgba(2,5,16,0.92)",borderRight:"1px solid rgba(255,255,255,0.06)",overflowY:"hidden",paddingTop:12,paddingBottom:12,display:"flex",flexDirection:"column",userSelect:"none",pointerEvents:"none",scrollbarWidth:"none"}}>
        {lines.map((_,i)=>{
          const isAct=step?.lineNum===i, isErr=errorLineSet.has(i);
          return <div key={i} style={{height:LINE_H,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"flex-end",paddingRight:6,fontFamily:"'JetBrains Mono',monospace",fontSize:9,lineHeight:1,color:isErr?"#f87171":isAct?"#93c5fd":"#2a4060",background:isErr?"rgba(239,68,68,0.07)":isAct?"rgba(59,130,246,0.07)":"transparent",transition:"color .12s,background .12s"}}>{i+1}</div>;
        })}
      </div>
      {step&&<div style={{position:"absolute",left:36,right:0,height:LINE_H,top:12+step.lineNum*LINE_H,background:"rgba(59,130,246,0.05)",borderLeft:"2px solid rgba(96,165,250,0.45)",pointerEvents:"none",zIndex:1,transition:"top .17s cubic-bezier(.4,0,.2,1)"}}/>}
      {[...errorLineSet].map(i=><div key={`e${i}`} style={{position:"absolute",left:36,right:0,height:LINE_H,top:12+i*LINE_H,background:"rgba(239,68,68,0.05)",borderLeft:"2px solid rgba(248,113,113,0.45)",pointerEvents:"none",zIndex:1}}/>)}
      <textarea ref={taRef} style={{flex:1,padding:"12px 12px 12px 8px",background:"transparent",border:"none",outline:"none",color:"#cfe2ff",fontFamily:"'JetBrains Mono',monospace",fontSize:11,lineHeight:`${LINE_H}px`,resize:"none",caretColor:"#60a5fa",tabSize:2,whiteSpace:"pre",overflowY:"auto",overflowX:"auto",scrollbarWidth:"thin",scrollbarColor:"rgba(96,165,250,0.18) transparent",position:"relative",zIndex:2}}
        value={code} onChange={e=>setCode(e.target.value)} onKeyDown={onKeyDown} spellCheck={false} placeholder="// Write your BST here…"/>
    </div>
  );
}

/* ─── Terminal ─── */
function Terminal({ lines, validating }) {
  const ref = useRef(null);
  useEffect(()=>{ if(ref.current) ref.current.scrollTop=ref.current.scrollHeight; },[lines,validating]);
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:"#020509",minHeight:0,fontFamily:"'JetBrains Mono',monospace",fontSize:"10px"}}>
      <div ref={ref} style={{flex:1,overflowY:"auto",padding:"6px 0",scrollbarWidth:"thin",scrollbarColor:"rgba(96,165,250,0.14) transparent"}}>
        {lines.length===0&&!validating&&<div style={{padding:"3px 14px",display:"flex",alignItems:"center",gap:6}}><span style={{color:"#4ade80",userSelect:"none"}}>$</span><span style={{animation:"blink 1.1s step-end infinite",color:"#050d0a",marginLeft:4}}>_</span></div>}
        {lines.map((line,i)=><TLine key={i} line={line} isLast={i===lines.length-1&&!validating}/>)}
        {validating&&<div style={{padding:"3px 14px",display:"flex",alignItems:"center",gap:8}}><span style={{display:"inline-block",width:8,height:8,borderRadius:"50%",border:"1.5px solid rgba(96,165,250,0.18)",borderTopColor:"#60a5fa",animation:"spin .65s linear infinite",flexShrink:0}}/><span style={{color:"#2a4060",fontSize:9}}>AI reviewing BST…</span></div>}
      </div>
    </div>
  );
}
function TLine({ line, isLast }) {
  const [vis,setVis]=useState(false);
  useEffect(()=>{const t=setTimeout(()=>setVis(true),12);return()=>clearTimeout(t);},[]);
  if(line.type==="separator") return <div style={{margin:"3px 14px",borderTop:"1px solid rgba(255,255,255,0.05)",opacity:vis?1:0}}/>;
  if(line.type==="blank")     return <div style={{height:4}}/>;
  if(line.type==="prompt")    return <div style={{padding:"1.5px 14px",display:"flex",alignItems:"center",gap:6,opacity:vis?1:0}}><span style={{color:"#4ade80",userSelect:"none"}}>$</span><span style={{color:"#3a5878"}}>{line.text}</span></div>;
  const cm={insert:"#93c5fd",search:"#7dd3fc",delete:"#f87171",error:"#f87171",stderr:"#f87171",success:"#4ade80",warn:"#fbbf24",info:"#60a5fa",output:"#3a5878"};
  const pm={insert:"↑",search:"◎",delete:"✕",error:"✗",stderr:"✗",success:"✓",warn:"⚠",info:"·"};
  const c=cm[line.type]??"#3a5878";
  return <div style={{padding:"1px 14px",display:"flex",alignItems:"flex-start",opacity:vis?1:0,transition:"opacity .08s"}}><span style={{color:c,width:16,flexShrink:0,fontSize:8,paddingTop:2}}>{pm[line.type]??""}</span><span style={{color:c,wordBreak:"break-word",lineHeight:1.6,flex:1}}>{line.text}{isLast&&<span style={{animation:"blink 1.1s step-end infinite",color:"#040a09"}}> _</span>}</span>{line.lineNum&&<span style={{marginLeft:8,color:"#1e3a50",fontSize:7.5,flexShrink:0,paddingTop:2}}>:{line.lineNum}</span>}</div>;
}

/* ─── Complexity Panel (compact) ─── */
function ComplexityPanel({ visible, onClose }) {
  if (!visible) return null;
  return (
    <div style={{position:"absolute",top:38,right:6,zIndex:100,background:"rgba(5,10,28,0.97)",border:"1px solid rgba(96,165,250,0.22)",borderRadius:10,padding:"12px 14px",minWidth:220,boxShadow:"0 16px 40px rgba(0,0,0,0.65)",backdropFilter:"blur(20px)",animation:"panelFade .18s ease"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
        <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:"#93c5fd",letterSpacing:".12em",textTransform:"uppercase",fontWeight:700}}>Time Complexity</span>
        <button onClick={onClose} style={{background:"none",border:"none",color:"#3a5878",cursor:"pointer",fontSize:14,lineHeight:1,padding:"0 2px"}}>×</button>
      </div>
      <table style={{borderCollapse:"collapse",width:"100%",fontFamily:"'JetBrains Mono',monospace"}}>
        {[["Operation","Average","Worst"],["Search","O(log n)","O(n)"],["Insert","O(log n)","O(n)"],["Delete","O(log n)","O(n)"],["Space","O(n)","O(n)"]].map((row,ri)=>(
          <tr key={ri} style={{borderBottom:ri<4?"1px solid rgba(255,255,255,0.05)":"none"}}>
            {row.map((cell,ci)=>(
              <td key={ci} style={{padding:"5px 6px",fontSize:ri===0?7:10,fontWeight:ci===0||ri===0?700:500,color:ri===0?"#2a4060":ci===0?"#c8dff5":ci===1?"#4ade80":"#fbbf24",textAlign:ci===0?"left":"center"}}>{cell}</td>
            ))}
          </tr>
        ))}
      </table>
      <div style={{marginTop:8,padding:"6px 8px",background:"rgba(59,130,246,0.07)",borderRadius:6,border:"1px solid rgba(96,165,250,0.1)"}}>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:7.5,color:"#60a5fa",lineHeight:1.65}}>💡 Worst case O(n) occurs on skewed trees (sorted input). Use AVL/Red-Black for guaranteed O(log n).</div>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function TreeDSPage() {
  const [lang,setLang]           = useState("javascript");
  const [code,setCode]           = useState(TPL.javascript);
  const [steps,setSteps]         = useState([]);
  const [idx,setIdx]             = useState(-1);
  const [error,setError]         = useState("");
  const [playing,setPlaying]     = useState(false);
  const [speed,setSpeed]         = useState(1.4);
  const [animKey,setAnimKey]     = useState(0);
  const [done,setDone]           = useState(false);
  const [validating,setValidating]=useState(false);
  const [aiErrors,setAiErrors]   = useState([]);
  const [termLines,setTermLines] = useState([]);
  const [sessionId]              = useState(()=>Math.random().toString(36).slice(2,8).toUpperCase());
  const [toast,setToast]         = useState(null);
  const [termOpen,setTermOpen]   = useState(true);
  const [showOh,setShowOh]       = useState(false);
  const [pointerIdx,setPointerIdx]= useState(null);
  const [deletedNodePos, setDeletedNodePos] = useState(null);

  const timerRef=useRef(null), ptrTimerRef=useRef(null), taRef=useRef(null), listRef=useRef(null);
  const bump=()=>setAnimKey(k=>k+1);
  const showToast=(msg)=>{setToast(msg);setTimeout(()=>setToast(null),2100);};

  const doReset=useCallback(()=>{
    clearInterval(timerRef.current); clearInterval(ptrTimerRef.current);
    setSteps([]); setIdx(-1); setError(""); setPlaying(false); setDone(false);
    setAiErrors([]); setTermLines([]); setPointerIdx(null); setDeletedNodePos(null);
  },[]);

  const handleChangeLang=(l)=>{setLang(l);setCode(TPL[l]??"");doReset();};

  const buildTerm=(stps,errs,aiErrs,aiReason)=>{
    const ls=[]; const ts=new Date().toTimeString().slice(0,8);
    ls.push({type:"output",text:`VisuoSlayer v3.2  ·  BST  ·  ${ts}  ·  pid:${sessionId}`});
    ls.push({type:"separator"});
    if(aiErrs.length>0){
      ls.push({type:"prompt",text:`validate --lang=${lang} --ds=bst`}); ls.push({type:"blank"});
      if(aiReason) ls.push({type:"stderr",text:aiReason});
      aiErrs.forEach(e=>ls.push({type:"error",text:`  L${e.line??"?"}  ${e.message}`,lineNum:e.line}));
      ls.push({type:"blank"}); ls.push({type:"error",text:"Process exited with code 1"}); return ls;
    }
    if(errs.length>0){
      ls.push({type:"prompt",text:`run --lang=${lang}`}); ls.push({type:"blank"});
      errs.forEach(e=>ls.push({type:"stderr",text:e}));
      ls.push({type:"blank"}); ls.push({type:"error",text:"Process exited with code 1"}); return ls;
    }
    ls.push({type:"prompt",text:`run --lang=${lang} --ds=bst`}); ls.push({type:"blank"});
    stps.forEach(s=>{
      let out="";
      if(s.type==="insert") out=`insert(${s.value})  →  size:${s.size}  height:${s.height}`;
      if(s.type==="search") out=`search(${s.value})  →  ${s.found?`✓ found  path:${(s.path||[]).join("→")}`:"✗ not found"}`;
      if(s.type==="delete") out=`delete(${s.value})  →  size:${s.size}  height:${s.height}`;
      ls.push({type:s.type,text:out,lineNum:s.lineNum+1});
    });
    ls.push({type:"blank"}); ls.push({type:"success",text:`${stps.length} op${stps.length!==1?"s":""} completed  ·  exit 0`});
    return ls;
  };

  const handleRun=async()=>{
    doReset(); setValidating(true);
    const v=await validateWithAI(code,lang);
    setValidating(false);
    if(!v.valid){setAiErrors(v.errors??[]);setTermLines(buildTerm([],[],v.errors??[],v.reason??"")); return;}
    const{steps:s,errors}=parseAndRunCode(code);
    if(errors.length){setError(errors.join("\n"));setTermLines(buildTerm([],errors,[],"")); return;}
    setSteps(s); setIdx(0); bump(); setPlaying(true); setTermLines(buildTerm(s,[],[],""));

    if(s[0]?.type==="delete" && s[0]?.value) {
      setDeletedNodePos(null);
    }
  };

  const animatePointer=useCallback((path)=>{
    if(!path||path.length===0){setPointerIdx(null);return;}
    setPointerIdx(0);
    let i=0;
    clearInterval(ptrTimerRef.current);
    ptrTimerRef.current=setInterval(()=>{
      i++;
      if(i>=path.length){clearInterval(ptrTimerRef.current);return;}
      setPointerIdx(i);
    },400);
  },[]);

  const goTo=useCallback((i)=>{
    clearInterval(timerRef.current); clearInterval(ptrTimerRef.current);
    setPlaying(false);
    const ni=Math.max(0,Math.min(i,steps.length-1));
    setIdx(ni); bump();

    const currentStep = steps[ni];
    if (currentStep?.type === "delete" && currentStep.value !== undefined && ni > 0) {
      const prevTree = steps[ni-1]?.tree;
      if (prevTree) {
        const findNodePos = (node, val, layout) => {
          if (!node) return null;
          if (node.val === val) {
            const pos = layout[node.id];
            if (pos) {
              const maxX = Math.max(...Object.values(layout).map(p=>p.x), 0);
              const maxY = Math.max(...Object.values(layout).map(p=>p.y), 0);
              const pad=48, vGap=72;
              const px = (x) => maxX===0 ? 360 : (x/maxX)*(720-pad*2)+pad;
              const py = (y) => y*vGap+48;
              return { x: px(pos.x), y: py(pos.y) };
            }
            return null;
          }
          return findNodePos(node.left, val, layout) || findNodePos(node.right, val, layout);
        };
        const layoutPrev = layoutTree(prevTree);
        const pos = findNodePos(prevTree, currentStep.value, layoutPrev);
        if (pos) setDeletedNodePos(pos);
        else setDeletedNodePos(null);
      } else setDeletedNodePos(null);
    } else {
      setDeletedNodePos(null);
    }

    const s=steps[ni];
    if(s?.type==="search"&&s.path?.length) animatePointer(s.path);
    else setPointerIdx(null);
  },[steps,animatePointer]);

  useEffect(()=>{
    const h=(e)=>{if((e.ctrlKey||e.metaKey)&&e.key==="Enter"){e.preventDefault();handleRun();}};
    window.addEventListener("keydown",h); return()=>window.removeEventListener("keydown",h);
  },[code,lang]);

  useEffect(()=>{
    if(!playing||!steps.length) return;
    timerRef.current=setInterval(()=>{
      setIdx(p=>{
        if(p>=steps.length-1){clearInterval(timerRef.current);setPlaying(false);setDone(true);return p;}
        const next=p+1; bump();
        const s=steps[next];
        if(s?.type==="search"&&s.path?.length) animatePointer(s.path);
        else setPointerIdx(null);
        return next;
      });
    },speed*1000);
    return()=>clearInterval(timerRef.current);
  },[playing,steps,speed,animatePointer]);

  useEffect(()=>{listRef.current?.querySelector(".sla")?.scrollIntoView({block:"nearest",behavior:"smooth"});},[idx]);

  const onKeyDown=(e)=>{
    if(e.key!=="Tab") return; e.preventDefault();
    const s=e.target.selectionStart,en=e.target.selectionEnd;
    const nv=code.slice(0,s)+"  "+code.slice(en); setCode(nv);
    requestAnimationFrame(()=>{if(taRef.current){taRef.current.selectionStart=s+2;taRef.current.selectionEnd=s+2;}});
  };

  const step=steps[idx]??null, os=step?(OP[step.type]??OP.insert):null;
  const prog=steps.length?Math.round(((idx+1)/steps.length)*100):0;
  const hasAiErr=aiErrors.length>0, idle=steps.length===0&&!error&&!hasAiErr;
  const lm=LANGS[lang]??LANGS.javascript;
  const errLineSet=new Set(aiErrors.map(e=>(e.line??1)-1));
  const metrics=[
    {lbl:"SIZE",   val:step?.size??0,                           c:"#93c5fd"},
    {lbl:"HEIGHT", val:step?.height??0,                         c:"#fbbf24"},
    {lbl:"OP",     val:step?.type?.toUpperCase()??"—",          c:step?(OP[step.type]?.c??"#60a5fa"):"#1e3a50"},
    {lbl:"STEP",   val:steps.length?(idx+1)+"/"+steps.length:"—",c:"#a78bfa"},
  ];

  const panel={background:"rgba(4,8,22,0.98)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,display:"flex",flexDirection:"column",overflow:"hidden",minHeight:0,boxShadow:"0 14px 44px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,255,255,0.04)"};
  const titlebar={padding:"6px 10px",borderBottom:"1px solid rgba(255,255,255,0.07)",background:"rgba(3,7,20,0.95)",display:"flex",alignItems:"center",gap:6,flexShrink:0};
  const dot=(c)=>({width:8,height:8,borderRadius:"50%",background:c,display:"inline-block"});

  return (<>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700;800&family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
      *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
      html,body{height:100%;overflow:hidden}
      body{background:#03060f;color:#c8dff5;font-family:'DM Sans',sans-serif;}
      @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
      @keyframes spin{to{transform:rotate(360deg)}}
      @keyframes idleFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
      @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
      @keyframes logoBreathe{0%,100%{box-shadow:0 0 14px rgba(59,130,246,0.38)}50%{box-shadow:0 0 28px rgba(59,130,246,0.7),0 0 44px rgba(59,130,246,0.14)}}
      @keyframes fadeUp{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}
      @keyframes pop{0%{transform:scale(.82);opacity:0}65%{transform:scale(1.07)}100%{transform:scale(1);opacity:1}}
      @keyframes progressGlow{0%,100%{box-shadow:0 0 4px rgba(96,165,250,0.45)}50%{box-shadow:0 0 12px rgba(96,165,250,0.85)}}
      @keyframes pillActive{0%,100%{box-shadow:0 0 0 rgba(96,165,250,0)}50%{box-shadow:0 0 8px rgba(96,165,250,0.3)}}
      @keyframes panelFade{0%{opacity:0;transform:translateY(-5px) scale(.98)}100%{opacity:1;transform:none}}
      @keyframes toastIn{0%{opacity:0;transform:translateY(10px) scale(.94)}100%{opacity:1;transform:none}}
      @keyframes toastOut{0%{opacity:1}100%{opacity:0;transform:translateY(-6px)}}
      @keyframes runPulse{0%,100%{box-shadow:0 0 16px rgba(59,130,246,0.4)}50%{box-shadow:0 0 28px rgba(59,130,246,0.65)}}
      button:hover{filter:brightness(1.14)}
      ::-webkit-scrollbar{width:3px;height:3px}
      ::-webkit-scrollbar-track{background:transparent}
      ::-webkit-scrollbar-thumb{background:rgba(96,165,250,0.18);border-radius:4px}
    `}</style>

    <div style={{height:"100vh",display:"flex",flexDirection:"column",overflow:"hidden",background:"radial-gradient(ellipse 60% 44% at 7% 0%,rgba(29,78,216,0.07) 0%,transparent 55%),radial-gradient(ellipse 46% 38% at 93% 100%,rgba(124,58,237,0.05) 0%,transparent 52%),#03060f"}}>

      {/* ═══ HEADER (compact) ═══ */}
      <header style={{flexShrink:0,display:"flex",alignItems:"center",gap:10,padding:"6px 18px",background:"rgba(2,5,16,0.99)",backdropFilter:"blur(24px)",borderBottom:"1px solid rgba(255,255,255,0.08)",boxShadow:"0 1px 0 rgba(59,130,246,0.06),0 4px 20px rgba(0,0,0,0.55)",zIndex:20}}>
        <div style={{width:28,height:28,borderRadius:7,flexShrink:0,background:"linear-gradient(135deg,#1e3a8a,#2563eb 52%,#7c3aed)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,animation:"logoBreathe 3.5s ease-in-out infinite"}}>🌲</div>
        <div>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:800,letterSpacing:"-.1px",background:"linear-gradient(90deg,#60a5fa,#a78bfa 50%,#60a5fa)",backgroundSize:"200% auto",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",animation:"shimmer 5s linear infinite"}}>VisuoSlayer</div>
          <div style={{fontSize:7,color:"#2a4060",fontFamily:"'JetBrains Mono',monospace",marginTop:1,letterSpacing:".08em",textTransform:"uppercase"}}>Binary Search Tree Visualizer</div>
        </div>
        <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:6}}>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:7.5,color:"#93c5fd",padding:"2px 9px",borderRadius:18,border:"1px solid rgba(96,165,250,0.32)",background:"rgba(59,130,246,0.1)",letterSpacing:".08em",fontWeight:700}}>BST</div>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:7.5,padding:"2px 9px",borderRadius:18,fontWeight:800,color:lm.accent,background:lm.bg,border:`1px solid ${lm.border}`}}>{lm.name}</div>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:6.5,color:"#3a5878",padding:"2px 8px",borderRadius:18,border:"1px solid rgba(255,255,255,0.09)",background:"rgba(255,255,255,0.025)"}}>pid:{sessionId}</div>
        </div>
      </header>

      {/* ═══ MAIN — compact layout ═══ */}
      <main style={{flex:1,display:"grid",gridTemplateColumns:"0.9fr 1.1fr",gap:6,padding:"6px 18px 8px",minHeight:0,overflow:"hidden"}}>

        {/* ─── LEFT PANEL ─── */}
        <div style={panel}>
          <div style={titlebar}>
            {["#ff5f57","#ffbd2e","#28c840"].map((c,i)=><span key={i} style={dot(c)}/>)}
            <span style={{marginLeft:6,fontFamily:"'JetBrains Mono',monospace",fontSize:7,color:"#4a6a88",textTransform:"uppercase",letterSpacing:"1.2px",fontWeight:700}}>Code Editor</span>
            <span style={{marginLeft:"auto",fontFamily:"'JetBrains Mono',monospace",fontSize:7.5,fontWeight:800,color:lm.accent,background:lm.bg,border:`1px solid ${lm.border}`,padding:"1px 8px",borderRadius:18}}>{lm.name}</span>
          </div>

          <div style={{flex:termOpen?"0 0 58%":"1",display:"flex",flexDirection:"column",minHeight:0,borderBottom:"1px solid rgba(255,255,255,0.07)"}}>
            {/* LANGUAGE TABS */}
            <div style={{display:"flex",gap:4,flexWrap:"wrap",padding:"6px 10px",borderBottom:"1px solid rgba(255,255,255,0.07)",background:"rgba(3,6,18,0.96)",flexShrink:0}}>
              {Object.entries(LANGS).map(([k,m])=>(
                <button key={k} onClick={()=>handleChangeLang(k)} style={{
                  padding:"4px 10px",borderRadius:6,cursor:"pointer",
                  fontFamily:"'JetBrains Mono',monospace",fontSize:8.5,fontWeight:800,letterSpacing:".04em",
                  border:`1.5px solid ${lang===k?m.border:"rgba(255,255,255,0.18)"}`,
                  background:lang===k?m.bg:"rgba(255,255,255,0.06)",
                  color:lang===k?m.accent:"#8aaccc",
                  transition:"all .12s",outline:"none",
                }}>{m.ext}</button>
              ))}
            </div>

            <CodeEditor code={code} setCode={setCode} step={step} errorLineSet={errLineSet} onKeyDown={onKeyDown} taRef={taRef}/>

            {step&&os&&(
              <div style={{display:"flex",alignItems:"center",gap:6,padding:"4px 10px",borderLeft:`2px solid ${os.bd}`,minHeight:24,borderTop:"1px solid rgba(255,255,255,0.07)",flexShrink:0,animation:"fadeUp .14s ease",background:os.bg}}>
                <span style={{color:os.c,fontSize:9,fontWeight:700}}>{os.icon}</span>
                <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,fontWeight:700,color:os.c}}>L{step.lineNum+1}</span>
                <code style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:"#4a6a88",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1}}>{step.codeLine}</code>
              </div>
            )}

            {/* Run bar */}
            <div style={{padding:"6px 10px",borderTop:"1px solid rgba(255,255,255,0.07)",display:"flex",alignItems:"center",gap:6,flexShrink:0,background:"rgba(2,5,15,0.78)"}}>
              <button onClick={handleRun} disabled={playing||validating} style={{
                padding:"5px 16px",borderRadius:6,
                background:playing||validating?"linear-gradient(135deg,#1e3a6e,#1d4ed8)":"linear-gradient(135deg,#1e40af,#2563eb,#3b82f6)",
                border:`1.5px solid rgba(96,165,250,${playing||validating?.18:.48})`,
                color:"#fff",fontFamily:"'JetBrains Mono',monospace",fontSize:9.5,fontWeight:800,
                cursor:playing||validating?"not-allowed":"pointer",letterSpacing:".05em",
                boxShadow:playing||validating?"none":"0 0 16px rgba(59,130,246,0.42),0 2px 6px rgba(0,0,0,0.4)",
                animation:playing||validating?"runPulse 1s ease-in-out infinite":"none",
                opacity:playing||validating?.58:1,transition:"all .14s",outline:"none",
              }}>
                {validating?"⟳  AI Review…":playing?"▶  Running…":"▶  Run & Visualize"}
              </button>
              {(steps.length>0||error||hasAiErr)&&(
                <button onClick={doReset} style={{padding:"5px 11px",borderRadius:6,background:"transparent",border:"1.5px solid rgba(248,113,113,0.4)",color:"#f87171",fontFamily:"'JetBrains Mono',monospace",fontSize:8,fontWeight:700,cursor:"pointer",transition:"all .13s",outline:"none"}}>↺ Reset</button>
              )}
              <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:7,color:"#4a6a88",padding:"2px 7px",borderRadius:5,border:"1px solid rgba(255,255,255,0.11)",background:"rgba(255,255,255,0.03)"}}>⌘↵</span>
            </div>
          </div>

          {/* Terminal */}
          <div style={{display:"flex",flexDirection:"column",minHeight:0,overflow:"hidden",flex:termOpen?"1":"0 0 0px",opacity:termOpen?1:0,pointerEvents:termOpen?"auto":"none",transition:"flex .28s cubic-bezier(.4,0,.2,1),opacity .2s ease"}}>
            <div style={{flex:1,display:"flex",flexDirection:"column",minHeight:0}}>
              <div style={{display:"flex",alignItems:"center",gap:4,padding:"5px 10px",background:"rgba(2,4,12,0.99)",borderBottom:"1px solid rgba(255,255,255,0.07)",borderTop:"1px solid rgba(255,255,255,0.07)",flexShrink:0}}>
                {["#ff5f57","#ffbd2e","#28c840"].map((c,i)=><span key={i} style={{width:7,height:7,borderRadius:"50%",background:c,display:"inline-block"}}/>)}
                <span style={{marginLeft:6,fontFamily:"'JetBrains Mono',monospace",fontSize:7,color:"#4a6a88",textTransform:"uppercase",letterSpacing:"1px"}}>terminal</span>
                <button onClick={()=>setTermOpen(false)} style={{display:"flex",alignItems:"center",justifyContent:"center",width:16,height:16,borderRadius:4,border:"1px solid rgba(255,255,255,0.14)",background:"rgba(255,255,255,0.05)",cursor:"pointer",color:"#4a6a88",fontSize:8,fontWeight:800,marginLeft:"auto",outline:"none"}}>▾</button>
              </div>
              <Terminal lines={termLines} validating={validating}/>
            </div>
          </div>
          {!termOpen&&(
            <div onClick={()=>setTermOpen(true)} style={{display:"flex",alignItems:"center",gap:4,padding:"5px 10px",background:"rgba(2,4,12,0.99)",borderTop:"1px solid rgba(255,255,255,0.07)",flexShrink:0,cursor:"pointer"}}>
              {["#ff5f57","#ffbd2e","#28c840"].map((c,i)=><span key={i} style={{width:7,height:7,borderRadius:"50%",background:c,display:"inline-block"}}/>)}
              <span style={{marginLeft:6,fontFamily:"'JetBrains Mono',monospace",fontSize:7,color:"#4a6a88",textTransform:"uppercase",letterSpacing:"1px"}}>terminal</span>
              {termLines.some(l=>l.type==="error"||l.type==="stderr")&&<span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:6.5,color:"#f87171",background:"rgba(239,68,68,0.12)",border:"1px solid rgba(248,113,113,0.26)",padding:"0px 6px",borderRadius:8,marginLeft:5}}>errors</span>}
              {termLines.some(l=>l.type==="success")&&<span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:6.5,color:"#4ade80",background:"rgba(74,222,128,0.1)",border:"1px solid rgba(74,222,128,0.26)",padding:"0px 6px",borderRadius:8,marginLeft:5}}>ok</span>}
              <span style={{marginLeft:"auto",fontFamily:"'JetBrains Mono',monospace",fontSize:7,color:"#60a5fa",fontWeight:700}}>▴</span>
            </div>
          )}
        </div>

        {/* ─── RIGHT PANEL ─── */}
        <div style={{...panel,position:"relative"}}>
          <div style={titlebar}>
            {["#60a5fa","#f87171","#fbbf24"].map((c,i)=><span key={i} style={dot(c)}/>)}
            <span style={{marginLeft:6,fontFamily:"'JetBrains Mono',monospace",fontSize:7,color:"#4a6a88",textTransform:"uppercase",letterSpacing:"1.2px",fontWeight:700}}>Visualization</span>
            {steps.length>0&&<span style={{marginLeft:"auto",fontFamily:"'JetBrains Mono',monospace",fontSize:7.5,color:"#93c5fd",background:"rgba(59,130,246,0.14)",border:"1px solid rgba(96,165,250,0.32)",padding:"1px 7px",borderRadius:18,fontWeight:800,animation:"pop .18s ease"}}>{idx+1}/{steps.length}</span>}
            <button onClick={()=>setShowOh(v=>!v)} style={{marginLeft:steps.length>0?5:"auto",padding:"1px 8px",borderRadius:16,cursor:"pointer",fontFamily:"'JetBrains Mono',monospace",fontSize:7.5,fontWeight:700,border:`1.5px solid ${showOh?"rgba(167,139,250,0.5)":"rgba(167,139,250,0.28)"}`,background:showOh?"rgba(167,139,250,0.18)":"rgba(167,139,250,0.06)",color:"#a78bfa",transition:"all .13s",outline:"none"}}>O(·)</button>
          </div>

          <ComplexityPanel visible={showOh} onClose={()=>setShowOh(false)}/>

          {/* Metrics */}
          <div style={{display:"flex",borderBottom:"1px solid rgba(255,255,255,0.07)",background:"rgba(2,5,18,0.92)",flexShrink:0}}>
            {metrics.map((m,mi)=>(
              <div key={m.lbl} style={{flex:1,padding:"6px",textAlign:"center",borderRight:mi<3?"1px solid rgba(255,255,255,0.07)":"none",display:"flex",flexDirection:"column",gap:2}}>
                <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:6,color:"#2a4060",letterSpacing:".2em",textTransform:"uppercase",fontWeight:700}}>{m.lbl}</span>
                <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:14,fontWeight:800,lineHeight:1.1,color:m.c,transition:"color .3s"}}>{String(m.val)}</span>
              </div>
            ))}
          </div>

          {/* Tree canvas */}
          <div style={{flex:1,position:"relative",overflow:"auto",display:"flex",alignItems:"flex-start",justifyContent:"center",padding:"10px 8px 6px",minHeight:0,scrollbarWidth:"thin",scrollbarColor:"rgba(96,165,250,0.1) transparent"}}>
            <div style={{position:"absolute",inset:0,pointerEvents:"none",backgroundImage:"linear-gradient(rgba(59,130,246,0.028) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,0.028) 1px,transparent 1px)",backgroundSize:"40px 40px",zIndex:0}}/>
            <div style={{position:"relative",zIndex:2,width:"100%"}}>
              <TreeViz tree={step?.tree??null} highlight={step?.highlight??[]} path={step?.path??[]} animKey={animKey} opType={step?.type} idle={idle} pointerIdx={pointerIdx} deletedNodePos={deletedNodePos}/>
            </div>
          </div>

          {/* Search pointer path banner */}
          {step?.type==="search"&&step.path&&step.path.length>0&&(
            <div style={{padding:"5px 12px",borderTop:"1px solid rgba(59,130,246,0.14)",background:"rgba(29,78,216,0.06)",flexShrink:0,display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",animation:"fadeUp .16s ease"}}>
              <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:7,color:"#60a5fa",letterSpacing:".1em",textTransform:"uppercase",fontWeight:700,flexShrink:0}}>Pointer</span>
              <div style={{display:"flex",alignItems:"center",gap:2,flexWrap:"wrap"}}>
                {step.path.map((v,pi)=>{
                  const curPi=pointerIdx??step.path.length-1;
                  const isCur=pi===curPi, isPast=pi<curPi;
                  return (
                    <span key={pi} style={{display:"inline-flex",alignItems:"center",gap:2,fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:700}}>
                      {pi>0&&<span style={{color:"rgba(96,165,250,0.3)",fontSize:7}}>→</span>}
                      <span style={{padding:"1px 6px",borderRadius:5,background:isCur?"rgba(59,130,246,0.22)":isPast?"rgba(59,130,246,0.07)":"transparent",border:isCur?"1.5px solid rgba(96,165,250,0.5)":"1.5px solid transparent",color:isCur?"#93c5fd":isPast?"#60a5fa":"#2a4060",transition:"all .2s"}}>{v}</span>
                    </span>
                  );
                })}
                <span style={{marginLeft:3,fontFamily:"'JetBrains Mono',monospace",fontSize:8,fontWeight:700,color:step.found?"#4ade80":"#f87171"}}>{step.found?"✓ found":"✗ not found"}</span>
              </div>
            </div>
          )}

          {/* Op message */}
          <div style={{padding:"5px 12px",borderTop:"1px solid rgba(255,255,255,0.07)",background:"rgba(2,5,16,0.72)",minHeight:40,flexShrink:0,display:"flex",alignItems:"center",gap:6}}>
            {step&&os?(
              <>
                <div style={{display:"inline-flex",alignItems:"center",gap:5,padding:"3px 10px",borderRadius:18,fontFamily:"'JetBrains Mono',monospace",fontSize:8.5,fontWeight:800,animation:"pop .18s ease",border:`1.5px solid ${os.bd}`,color:os.c,background:os.bg,flexShrink:0}}>
                  <span>{os.icon}</span><span>{os.label}</span><span style={{opacity:.6}}>({step.value})</span>
                  {step.type==="search"&&<span style={{color:step.found?"#4ade80":"#f87171"}}>{step.found?"✓":"✗"}</span>}
                </div>
                <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8.5,color:"#4a6a88",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",animation:"fadeUp .16s ease"}}>{step.message}</span>
              </>
            ):(
              <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:"#2a4060"}}>
                {idle?"🌲  Write a BST · insert / search / delete · Run":hasAiErr?"⚠  Errors found — see terminal":error?"✗  Fix errors and run again":validating?"⟳  Reviewing…":"⏸  Ready"}
              </span>
            )}
          </div>

          {/* Playback controls */}
          {steps.length>0&&(
            <div style={{display:"flex",alignItems:"center",gap:4,padding:"5px 10px",borderTop:"1px solid rgba(255,255,255,0.07)",background:"rgba(2,4,14,0.82)",flexShrink:0}}>
              {[["⏮",()=>goTo(0),idx<=0],["◀",()=>goTo(idx-1),idx<=0]].map(([icon,fn,dis],i)=>(
                <button key={i} onClick={fn} disabled={dis} style={{width:24,height:24,borderRadius:6,border:"1.5px solid rgba(255,255,255,0.14)",background:"rgba(10,18,44,0.82)",color:dis?"#1e3a50":"#7a9cb8",fontSize:10,cursor:dis?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .12s",outline:"none"}}>{icon}</button>
              ))}
              <button onClick={()=>{if(done||idx>=steps.length-1){setIdx(0);bump();setDone(false);setPlaying(true);}else{clearInterval(timerRef.current);setPlaying(p=>!p);}}
              } style={{height:24,padding:"0 12px",borderRadius:6,background:"linear-gradient(135deg,#1e40af,#2563eb,#3b82f6)",border:"1.5px solid rgba(96,165,250,0.45)",color:"#fff",fontSize:10,fontWeight:800,cursor:"pointer",boxShadow:"0 0 12px rgba(59,130,246,0.4)",transition:"all .13s",outline:"none"}}>
                {playing?"⏸":done?"↺":"▶"}
              </button>
              {[["▶",()=>goTo(idx+1),idx>=steps.length-1],["⏭",()=>goTo(steps.length-1),idx>=steps.length-1]].map(([icon,fn,dis],i)=>(
                <button key={i} onClick={fn} disabled={dis} style={{width:24,height:24,borderRadius:6,border:"1.5px solid rgba(255,255,255,0.14)",background:"rgba(10,18,44,0.82)",color:dis?"#1e3a50":"#7a9cb8",fontSize:10,cursor:dis?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .12s",outline:"none"}}>{icon}</button>
              ))}
              <div style={{width:1,height:14,background:"rgba(255,255,255,0.09)",margin:"0 2px"}}/>
              <div style={{display:"flex",gap:2}}>
                {[[2,"½×"],[1.4,"1×"],[0.7,"2×"]].map(([s,lbl])=>(
                  <button key={s} onClick={()=>setSpeed(s)} style={{padding:"2px 7px",borderRadius:5,cursor:"pointer",fontFamily:"'JetBrains Mono',monospace",fontSize:7.5,fontWeight:800,border:`1.5px solid ${speed===s?"rgba(96,165,250,0.48)":"rgba(255,255,255,0.13)"}`,background:speed===s?"rgba(59,130,246,0.16)":"rgba(255,255,255,0.03)",color:speed===s?"#93c5fd":"#6a8eaa",transition:"all .12s",outline:"none"}}>{lbl}</button>
                ))}
              </div>
              <div style={{width:1,height:14,background:"rgba(255,255,255,0.09)",margin:"0 2px"}}/>
              <button onClick={()=>{if(!step)return;navigator.clipboard?.writeText(`BST size:${step.size} h:${step.height} | ${step.type}(${step.value})`).then(()=>showToast("Copied!"));}} title="Copy state" style={{width:24,height:24,borderRadius:6,border:"1.5px solid rgba(255,255,255,0.14)",background:"rgba(10,18,44,0.82)",color:"#6a8eaa",fontSize:11,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",outline:"none"}}>📋</button>
              <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,marginLeft:"auto"}}>
                <span style={{color:"#93c5fd",fontWeight:800}}>{idx+1}</span>
                <span style={{color:"#2a4060"}}>/{steps.length}</span>
              </span>
            </div>
          )}

          {/* Progress */}
          {steps.length>0&&(
            <div style={{display:"flex",alignItems:"center",gap:6,padding:"4px 12px",borderTop:"1px solid rgba(255,255,255,0.07)",flexShrink:0}}>
              <div style={{flex:1,height:2,background:"rgba(255,255,255,0.05)",borderRadius:99,overflow:"hidden"}}>
                <div style={{height:"100%",borderRadius:99,width:`${prog}%`,transition:"width .36s cubic-bezier(.4,0,.2,1)",background:"linear-gradient(90deg,#1e40af,#3b82f6,#93c5fd)",animation:"progressGlow 2.4s ease-in-out infinite"}}/>
              </div>
              <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:7.5,color:"#2a4060",minWidth:26,textAlign:"right",fontWeight:700}}>{prog}%</span>
            </div>
          )}

          {/* Op log pills */}
          {steps.length>0&&(
            <div style={{flexShrink:0,borderTop:"1px solid rgba(255,255,255,0.07)",background:"rgba(2,4,14,0.9)"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"3px 12px 2px",fontFamily:"'JetBrains Mono',monospace",fontSize:6,color:"#2a4060",letterSpacing:".16em",textTransform:"uppercase",fontWeight:700}}>
                <span>Operation Log</span>
                <span style={{color:"#60a5fa"}}>{steps.length} ops</span>
              </div>
              <div ref={listRef} style={{overflowX:"auto",overflowY:"hidden",padding:"2px 8px 6px",display:"flex",gap:3,alignItems:"center",scrollbarWidth:"thin",scrollbarColor:"rgba(96,165,250,0.12) transparent"}}>
                {steps.map((s,i)=>{
                  const sm=OP[s.type]??OP.insert, past=i<idx, active=i===idx;
                  return (
                    <div key={i} className={active?"sla":""} onClick={()=>goTo(i)} style={{display:"inline-flex",alignItems:"center",gap:3,padding:"2px 8px",borderRadius:16,cursor:"pointer",fontFamily:"'JetBrains Mono',monospace",fontSize:7.5,fontWeight:700,flexShrink:0,color:active?sm.c:past?"#6a8eaa":"#2a4060",border:`1.5px solid ${active?sm.bd:past?"rgba(255,255,255,0.12)":"rgba(255,255,255,0.05)"}`,background:active?sm.bg:past?"rgba(255,255,255,0.03)":"transparent",boxShadow:active?"0 0 8px rgba(96,165,250,0.22)":"none",animation:active?"pillActive 1.5s ease-in-out infinite":"none",transition:"all .13s"}}>
                      <span style={{width:4,height:4,borderRadius:"50%",flexShrink:0,background:past?"#4ade80":active?sm.c:"#1e3a50",boxShadow:active?`0 0 4px ${sm.c}`:past?"0 0 3px rgba(74,222,128,0.5)":"none"}}/>
                      <span>{sm.label.toLowerCase()}<span style={{opacity:.5}}>({s.value})</span>{s.type==="search"&&<span style={{color:s.found?"#4ade80":"#f87171"}}>{s.found?" ✓":" ✗"}</span>}</span>
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
    {toast&&<div style={{position:"fixed",bottom:16,right:16,padding:"6px 14px",borderRadius:8,fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:700,background:"rgba(4,10,28,0.98)",border:"1px solid rgba(96,165,250,0.22)",color:"#4ade80",boxShadow:"0 6px 22px rgba(0,0,0,0.6)",zIndex:9999,animation:"toastIn .2s ease, toastOut .24s ease 1.9s forwards",backdropFilter:"blur(16px)"}}>{toast}</div>}
  </>);
}