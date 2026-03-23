"use client";

import { useState, useRef, useEffect, useCallback } from "react";

/* ─── BST Logic ─── */
class TreeNode {
  constructor(val) {
    this.val = val;
    this.left = null;
    this.right = null;
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
  let s = node.right;
  while (s.left) s = s.left;
  node.val = s.val;
  node.right = bstDelete(node.right, s.val);
  return node;
};
const cloneTree = (n) => {
  if (!n) return null;
  const c = new TreeNode(n.val);
  c.id = n.id;
  c.left = cloneTree(n.left);
  c.right = cloneTree(n.right);
  return c;
};
const pathToNode = (node, val, path = []) => {
  if (!node) return null;
  path.push(node.val);
  if (val === node.val) return path;
  return val < node.val ? pathToNode(node.left, val, path) : pathToNode(node.right, val, path);
};
const treeHeight = (n) => (!n ? 0 : 1 + Math.max(treeHeight(n.left), treeHeight(n.right)));
const treeSize = (n) => (!n ? 0 : 1 + treeSize(n.left) + treeSize(n.right));
const layoutTree = (root) => {
  const pos = {};
  let counter = 0;
  const inorder = (n) => {
    if (!n) return;
    inorder(n.left);
    pos[n.id] = { x: counter++, y: 0 };
    inorder(n.right);
  };
  const depth = (n, d) => {
    if (!n) return;
    pos[n.id].y = d;
    depth(n.left, d + 1);
    depth(n.right, d + 1);
  };
  inorder(root);
  depth(root, 0);
  return pos;
};

/* ─── C Parser ─── */
function parseCBST(code) {
  const steps = [];
  let root = null;
  const lines = code.split("\n");

  const mainMatch = code.match(/int\s+main\s*\([^)]*\)\s*\{([\s\S]*)/);
  if (!mainMatch) {
    return { steps: [], errors: ["No main() function found. Add a main() that calls insert/search/delete."] };
  }

  let mainBody = "";
  let depth = 0;
  let started = false;
  const mainStart = code.indexOf(mainMatch[0]);
  const bodyStart = code.indexOf("{", mainStart + mainMatch[0].indexOf("main"));
  for (let ci = bodyStart; ci < code.length; ci++) {
    if (code[ci] === "{") { depth++; started = true; }
    else if (code[ci] === "}") { depth--; }
    mainBody += code[ci];
    if (started && depth === 0) break;
  }

  const mainLines = mainBody.split("\n");
  const mainBodyStartLine = code.slice(0, bodyStart).split("\n").length - 1;
  const opRe = /\b(\w+)\s*\(\s*&?\w+\s*,\s*(-?\d+)\s*\)/g;

  for (let li = 0; li < mainLines.length; li++) {
    const line = mainLines[li].trim();
    if (!line || line.startsWith("//") || line.startsWith("*") || line.startsWith("#")) continue;

    let m;
    const localRe = new RegExp(opRe.source, "g");
    while ((m = localRe.exec(mainLines[li])) !== null) {
      const fnName = m[1].toLowerCase();
      const val = parseInt(m[2], 10);
      const originalLineNum = mainBodyStartLine + li;
      const codeLine = lines[originalLineNum] ?? mainLines[li];

      let op = null;
      if (/insert|add|push|put/.test(fnName)) op = "insert";
      else if (/search|find|lookup|get|contain|has/.test(fnName)) op = "search";
      else if (/delete|remove|del|erase/.test(fnName)) op = "delete";

      if (!op) continue;
      if (/^\s*return\s/.test(mainLines[li]) || /node\s*=\s*\w+\(/.test(mainLines[li])) continue;

      if (op === "insert") {
        root = bstInsert(root, val);
        const snap = cloneTree(root);
        steps.push({ type: "insert", value: val, tree: snap, highlight: [val], path: pathToNode(snap, val), message: `insert(${val}) → placed at correct BST position`, size: treeSize(snap), height: treeHeight(snap), lineNum: originalLineNum, codeLine });
      } else if (op === "search") {
        const snap = cloneTree(root);
        const path = pathToNode(snap, val);
        steps.push({ type: "search", value: val, tree: snap, highlight: path || [], path, found: !!path, message: path ? `search(${val}) → Found ✓  path: ${path.join(" → ")}` : `search(${val}) → Not found ✗`, size: treeSize(snap), height: treeHeight(snap), lineNum: originalLineNum, codeLine });
      } else if (op === "delete") {
        root = bstDelete(root, val);
        const snap = cloneTree(root);
        steps.push({ type: "delete", value: val, tree: snap, highlight: [], path: null, message: `delete(${val}) → removed, BST property maintained`, size: treeSize(snap), height: treeHeight(snap), lineNum: originalLineNum, codeLine });
      }
    }
  }

  if (!steps.length) {
    return { steps: [], errors: ["No BST operations detected in main().\nCall insert(&tree, N), search(&tree, N), or delete(&tree, N) from main()."] };
  }
  return { steps, errors: [] };
}

/* ─── Generic/OOP Parser ─── */
function parseGenericBST(code) {
  const steps = [];
  const errors = [];
  const lines = code.split("\n");

  // ── Step 1: Find BST instance variable via scoring ──
  const SKIP_KEYWORDS = new Set([
    "if","for","while","return","class","function","def","int","void","bool",
    "string","let","const","var","new","null","true","false","this","self",
    "node","nullptr","None","undefined","else","elif","do","switch","case",
  ]);

  const candidates = new Map();
  const scoreLine = (varName, score) => {
    if (!varName) return;
    if (SKIP_KEYWORDS.has(varName)) return;
    if (varName.length < 2) return;
    candidates.set(varName, (candidates.get(varName) ?? 0) + score);
  };

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const trimmed = raw.trim();
    if (trimmed.startsWith("//") || trimmed.startsWith("#") || trimmed.startsWith("*")) continue;

    let m = raw.match(/(?:const|let|var)\s+(\w+)\s*=\s*new\s+\w+/);
    if (m) scoreLine(m[1], 10);

    m = raw.match(/\b\w+\s+(\w+)\s*=\s*new\s+\w+\s*\(/);
    if (m) scoreLine(m[1], 9);

    m = raw.match(/\b(?:BST|BinarySearchTree|BSTTree|Tree|AVL|Bst)\s*(?:<[^>]*>)?\s+(\w+)\s*[=;{(]/);
    if (m) scoreLine(m[1], 8);

    m = raw.match(/^(\w+)\s*=\s*\w+\s*\(\s*\)\s*(?:#.*)?$/);
    if (m) scoreLine(m[1], 8);

    m = raw.match(/^(\w+)\s*:=\s*&?\w+\s*[{(]/);
    if (m) scoreLine(m[1], 8);

    const dotCallRe = /\b(\w+)\s*\.\s*\w+\s*\(\s*-?\d+/g;
    let dm;
    while ((dm = dotCallRe.exec(raw)) !== null) {
      if (dm[1] === "this" || dm[1] === "self") continue;
      if (SKIP_KEYWORDS.has(dm[1])) continue;
      scoreLine(dm[1], 3);
    }
  }

  let instanceVar = null;
  let bestScore = 0;
  for (const [name, score] of candidates) {
    if (score > bestScore) { bestScore = score; instanceVar = name; }
  }

  if (!instanceVar) {
    errors.push(
      "Could not find a BST instance variable.\n\n" +
      "Make sure you declare and use a BST object:\n" +
      "  const tree = new BST();  tree.insert(50);  tree.search(30);\n" +
      "  tree = BST()             tree.insert(50)   tree.delete(30)\n" +
      "  tree := &BST{}           tree.insert(50)   tree.search(30)"
    );
    return { steps, errors };
  }

  const varEsc = instanceVar.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const callRe = new RegExp(`\\b${varEsc}\\s*\\.\\s*(\\w+)\\s*\\(\\s*(-?\\d+)`, "g");

  const DEFINITION_PREFIX = /^\s*(?:public|private|protected|static|def\s|func\s|fn\s|void\s|bool\s|int\s|Node\s|auto\s)/;
  const FUNCTION_DEF = /\bfunction\s+\w+\s*\(/;

  const allOps = [];

  for (let li = 0; li < lines.length; li++) {
    const raw = lines[li];
    const trimmed = raw.trim();

    if (trimmed.startsWith("//") || trimmed.startsWith("#") ||
        trimmed.startsWith("*") || trimmed.startsWith("/*")) continue;

    if (DEFINITION_PREFIX.test(raw) || FUNCTION_DEF.test(raw)) continue;

    callRe.lastIndex = 0;
    let m;
    while ((m = callRe.exec(raw)) !== null) {
      const rawMethod = m[1];
      const mn = rawMethod.toLowerCase();
      const val = parseInt(m[2], 10);

      let type = null;
      if (/insert|add|push|put|enqueue|append/.test(mn)) type = "insert";
      else if (/search|find|lookup|get|contain|has|exist|query/.test(mn)) type = "search";
      else if (/delete|remove|del|erase|pop/.test(mn)) type = "delete";

      if (type) allOps.push({ type, val, lineNum: li, method: rawMethod, codeLine: trimmed });
    }
  }

  if (!allOps.length) {
    errors.push(
      `Instance '${instanceVar}' found but no BST operations detected.\n\n` +
      `Use methods like:\n` +
      `  insert / add / push / put\n` +
      `  search / find / has / contains\n` +
      `  delete / remove / erase\n\n` +
      `With an integer argument:\n` +
      `  ${instanceVar}.insert(50)\n` +
      `  ${instanceVar}.search(30)\n` +
      `  ${instanceVar}.delete(20)`
    );
    return { steps, errors };
  }

  let root = null;
  for (const op of allOps) {
    if (op.type === "insert") {
      root = bstInsert(root, op.val);
      const snap = cloneTree(root);
      steps.push({
        type: "insert", value: op.val, tree: snap,
        highlight: [op.val], path: pathToNode(snap, op.val),
        message: `${op.method}(${op.val}) → placed at correct BST position`,
        size: treeSize(snap), height: treeHeight(snap),
        lineNum: op.lineNum, codeLine: op.codeLine,
      });
    } else if (op.type === "search") {
      const snap = cloneTree(root);
      const path = pathToNode(snap, op.val);
      steps.push({
        type: "search", value: op.val, tree: snap,
        highlight: path || [], path, found: !!path,
        message: path
          ? `${op.method}(${op.val}) → Found ✓  path: ${path.join(" → ")}`
          : `${op.method}(${op.val}) → Not found ✗`,
        size: treeSize(snap), height: treeHeight(snap),
        lineNum: op.lineNum, codeLine: op.codeLine,
      });
    } else {
      root = bstDelete(root, op.val);
      const snap = cloneTree(root);
      steps.push({
        type: "delete", value: op.val, tree: snap,
        highlight: [], path: null,
        message: `${op.method}(${op.val}) → removed, BST property maintained`,
        size: treeSize(snap), height: treeHeight(snap),
        lineNum: op.lineNum, codeLine: op.codeLine,
      });
    }
  }

  return { steps, errors };
}

/* ─── Dispatcher ─── */
function parseAndRunCode(code, lang) {
  if (lang === "c") return parseCBST(code);
  return parseGenericBST(code);
}

/* ─── AI Validation ─── */
async function validateWithAI(code, lang) {
  if (code.trim().length < 10) {
    return {
      valid: false,
      reason: "Code is empty.",
      errors: [{ line: 1, message: "Write a BST implementation first." }],
      apiError: null,
    };
  }

  const prompt = `You are a strict code reviewer for a BST visualizer tool. Analyze the code and return a JSON verdict.

MODE: Full implementation (${lang})
PASS if: the code contains a real BST class/struct/impl definition with insert/search/delete logic AND has operation calls with integer arguments.
FAIL if:
- The code is obviously wrong (random text, syntax errors everywhere, not ${lang} at all)
- BST comparison logic is inverted (inserts right when val < node, etc.)
- No operation calls with integer arguments exist
- The code is ONLY a call-site with no BST definition
Be lenient about method names — add/find/remove/put/erase all count.

Respond with ONLY a raw JSON object — no markdown, no backticks:
{
  "valid": true or false,
  "reason": "one clear sentence if invalid, empty string if valid",
  "errors": [] or [{"line": <number or null>, "message": "<specific issue>"}]
}

Code:
\`\`\`${lang}
${code.slice(0, 3000)}
\`\`\``;

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [{ role: "user", content: prompt }] }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return {
        valid: false,
        reason: errData.error ?? `Validation service error (HTTP ${res.status}). Check your API key.`,
        errors: [{ line: null, message: errData.error ?? `HTTP ${res.status} from validation API` }],
        apiError: `HTTP ${res.status}`,
      };
    }

    const data = await res.json();

    if (data.error) {
      return {
        valid: false,
        reason: data.error,
        errors: [{ line: null, message: data.error }],
        apiError: data.error,
      };
    }

    const raw = (data.content ?? "")
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const parsed = JSON.parse(raw);

    return {
      valid: !!parsed.valid,
      reason: parsed.reason ?? "",
      errors: Array.isArray(parsed.errors) ? parsed.errors : [],
      apiError: null,
    };
  } catch (e) {
    return {
      valid: false,
      reason: `Could not reach validation service: ${e.message}`,
      errors: [{ line: null, message: `Validation error: ${e.message}` }],
      apiError: e.message,
    };
  }
}

/* ─── Operation styles ─── */
const OP = {
  insert: { label: "INSERT", icon: "↑", c: "#4cc9f0", bg: "rgba(76,201,240,0.12)", bd: "rgba(76,201,240,0.45)" },
  search: { label: "SEARCH", icon: "◎", c: "#c77dff", bg: "rgba(199,125,255,0.1)", bd: "rgba(199,125,255,0.4)" },
  delete: { label: "DELETE", icon: "✕", c: "#f72585", bg: "rgba(247,37,133,0.1)", bd: "rgba(247,37,133,0.45)" },
};

/* ─── Languages (order: C, C++, Java, Go, Python, JavaScript) ─── */
const LANGS = {
  c:          { name: "C",          ext: "C",   accent: "#a8d8ea" },
  cpp:        { name: "C++",        ext: "C++", accent: "#00b4d8" },
  java:       { name: "Java",       ext: "JV",  accent: "#ed8b00" },
  go:         { name: "Go",         ext: "GO",  accent: "#00add8" },
  python:     { name: "Python",     ext: "PY",  accent: "#4ec9b0" },
  javascript: { name: "JavaScript", ext: "JS",  accent: "#f7df1e" },
};

/* ─── Templates ─── */
const TPL = {
  c: `// Binary Search Tree — C
#include <stdio.h>
#include <stdlib.h>

typedef struct Node {
    int val;
    struct Node* left;
    struct Node* right;
} Node;

typedef struct { Node* root; } BST;

Node* newNode(int val) {
    Node* n = (Node*)malloc(sizeof(Node));
    n->val = val; n->left = NULL; n->right = NULL;
    return n;
}

void insert(BST* t, int val) {
    Node* node = newNode(val);
    if (!t->root) { t->root = node; return; }
    Node* cur = t->root;
    while (1) {
        if (val < cur->val) {
            if (!cur->left) { cur->left = node; return; }
            cur = cur->left;
        } else {
            if (!cur->right) { cur->right = node; return; }
            cur = cur->right;
        }
    }
}

int search(BST* t, int val) {
    Node* cur = t->root;
    while (cur) {
        if (val == cur->val) return 1;
        cur = (val < cur->val) ? cur->left : cur->right;
    }
    return 0;
}

Node* _deleteRec(Node* node, int val) {
    if (!node) return NULL;
    if (val < node->val) { node->left = _deleteRec(node->left, val); return node; }
    if (val > node->val) { node->right = _deleteRec(node->right, val); return node; }
    if (!node->left) return node->right;
    if (!node->right) return node->left;
    Node* mn = node->right;
    while (mn->left) mn = mn->left;
    node->val = mn->val;
    node->right = _deleteRec(node->right, mn->val);
    return node;
}

void delete(BST* t, int val) {
    t->root = _deleteRec(t->root, val);
}

int main() {
    BST tree = { NULL };
    insert(&tree, 50);
    insert(&tree, 30);
    insert(&tree, 70);
    insert(&tree, 20);
    insert(&tree, 40);
    insert(&tree, 60);
    insert(&tree, 80);
    insert(&tree, 10);
    insert(&tree, 35);
    search(&tree, 40);
    search(&tree, 99);
    delete(&tree, 30);
    insert(&tree, 45);
    search(&tree, 45);
    return 0;
}`,

  cpp: `// Binary Search Tree — C++
#include <iostream>
using namespace std;

struct Node {
    int val; Node *left, *right;
    Node(int v) : val(v), left(nullptr), right(nullptr) {}
};

class BST {
public:
    Node* root = nullptr;

    void insert(int val) { root = ins(root, val); }
    Node* ins(Node* n, int val) {
        if (!n) return new Node(val);
        if (val < n->val) n->left = ins(n->left, val);
        else if (val > n->val) n->right = ins(n->right, val);
        return n;
    }

    bool search(int val) { return srch(root, val); }
    bool srch(Node* n, int val) {
        if (!n) return false;
        if (val == n->val) return true;
        return val < n->val ? srch(n->left, val) : srch(n->right, val);
    }

    void remove(int val) { root = del(root, val); }
    Node* del(Node* n, int val) {
        if (!n) return nullptr;
        if (val < n->val) n->left = del(n->left, val);
        else if (val > n->val) n->right = del(n->right, val);
        else {
            if (!n->left) return n->right;
            if (!n->right) return n->left;
            Node* mn = n->right;
            while (mn->left) mn = mn->left;
            n->val = mn->val;
            n->right = del(n->right, mn->val);
        }
        return n;
    }
};

int main() {
    BST tree;
    tree.insert(50); tree.insert(30); tree.insert(70);
    tree.insert(20); tree.insert(40); tree.insert(60); tree.insert(80);
    tree.insert(10); tree.insert(35);
    tree.search(40); tree.search(99);
    tree.remove(30);
    tree.insert(45); tree.search(45);
    return 0;
}`,

  java: `// Binary Search Tree — Java
class BST {
    class Node {
        int val; Node left, right;
        Node(int val) { this.val = val; }
    }
    private Node root;

    public void insert(int val) { root = insertRec(root, val); }
    private Node insertRec(Node n, int val) {
        if (n == null) return new Node(val);
        if (val < n.val) n.left = insertRec(n.left, val);
        else if (val > n.val) n.right = insertRec(n.right, val);
        return n;
    }

    public boolean search(int val) { return searchRec(root, val); }
    private boolean searchRec(Node n, int val) {
        if (n == null) return false;
        if (val == n.val) return true;
        return val < n.val ? searchRec(n.left, val) : searchRec(n.right, val);
    }

    public void delete(int val) { root = deleteRec(root, val); }
    private Node deleteRec(Node n, int val) {
        if (n == null) return null;
        if (val < n.val) n.left = deleteRec(n.left, val);
        else if (val > n.val) n.right = deleteRec(n.right, val);
        else {
            if (n.left == null) return n.right;
            if (n.right == null) return n.left;
            Node mn = n.right;
            while (mn.left != null) mn = mn.left;
            n.val = mn.val;
            n.right = deleteRec(n.right, mn.val);
        }
        return n;
    }

    public static void main(String[] args) {
        BST tree = new BST();
        tree.insert(50); tree.insert(30); tree.insert(70);
        tree.insert(20); tree.insert(40); tree.insert(60); tree.insert(80);
        tree.insert(10); tree.insert(35);
        tree.search(40); tree.search(99);
        tree.delete(30);
        tree.insert(45); tree.search(45);
    }
}`,

  go: `// Binary Search Tree — Go
package main

import "fmt"

type Node struct { val int; left, right *Node }
type BST struct { root *Node }

func (b *BST) insert(val int) { b.root = insRec(b.root, val) }
func insRec(n *Node, val int) *Node {
    if n == nil { return &Node{val: val} }
    if val < n.val { n.left = insRec(n.left, val) } else if val > n.val { n.right = insRec(n.right, val) }
    return n
}

func (b *BST) search(val int) bool { return srchRec(b.root, val) }
func srchRec(n *Node, val int) bool {
    if n == nil { return false }
    if val == n.val { return true }
    if val < n.val { return srchRec(n.left, val) }
    return srchRec(n.right, val)
}

func (b *BST) delete(val int) { b.root = delRec(b.root, val) }
func delRec(n *Node, val int) *Node {
    if n == nil { return nil }
    if val < n.val { n.left = delRec(n.left, val) } else if val > n.val { n.right = delRec(n.right, val) } else {
        if n.left == nil { return n.right }
        if n.right == nil { return n.left }
        mn := n.right
        for mn.left != nil { mn = mn.left }
        n.val = mn.val; n.right = delRec(n.right, mn.val)
    }
    return n
}

func main() {
    tree := &BST{}
    tree.insert(50); tree.insert(30); tree.insert(70)
    tree.insert(20); tree.insert(40); tree.insert(60); tree.insert(80)
    tree.insert(10); tree.insert(35)
    tree.search(40); tree.search(99)
    tree.delete(30)
    tree.insert(45); tree.search(45)
    fmt.Println("done")
}`,

  python: `# Binary Search Tree — Python
class Node:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None

class BST:
    def __init__(self):
        self.root = None

    def insert(self, val):
        if not self.root:
            self.root = Node(val); return
        cur = self.root
        while True:
            if val < cur.val:
                if not cur.left: cur.left = Node(val); return
                cur = cur.left
            else:
                if not cur.right: cur.right = Node(val); return
                cur = cur.right

    def search(self, val):
        cur = self.root
        while cur:
            if val == cur.val: return True
            cur = cur.left if val < cur.val else cur.right
        return False

    def delete(self, val):
        self.root = self._del(self.root, val)

    def _del(self, node, val):
        if not node: return None
        if val < node.val: node.left = self._del(node.left, val)
        elif val > node.val: node.right = self._del(node.right, val)
        else:
            if not node.left: return node.right
            if not node.right: return node.left
            mn = node.right
            while mn.left: mn = mn.left
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
    if (val < node.val) node.left = this._del(node.left, val);
    else if (val > node.val) node.right = this._del(node.right, val);
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
};

/* ─── Tree Visualization ─── */
function TreeViz({ tree, highlight = [], path = [], animKey, opType, idle, pointerIdx, deletedNodePos }) {
  const W = 720, NR = 22;
  if (!tree) return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:12, width:"100%", minHeight:180, justifyContent:"center", border:"1px dashed rgba(76,201,240,0.1)", borderRadius:12, background:"rgba(76,201,240,0.015)" }}>
      <div style={{ fontSize:38, animation:"idleFloat 3.5s ease-in-out infinite", filter:"drop-shadow(0 0 12px rgba(76,201,240,0.25))" }}>🌲</div>
      <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:8, color:"#2a4060", letterSpacing:".1em", textAlign:"center", lineHeight:2, textTransform:"uppercase" }}>
        {idle ? "Write a BST · insert / search / delete · Run" : "Tree will appear here"}
      </div>
    </div>
  );

  const pos = layoutTree(tree);
  const vals = Object.values(pos);
  const maxX = vals.length ? Math.max(...vals.map(p => p.x)) : 0;
  const maxY = vals.length ? Math.max(...vals.map(p => p.y)) : 0;
  const pad = 44, vGap = 68;
  const px = x => maxX === 0 ? W / 2 : (x / maxX) * (W - pad * 2) + pad;
  const py = y => y * vGap + 44;
  const svgH = Math.max((maxY + 1) * vGap + 70, 160);

  const nodes = [], edges = [];
  const collect = n => {
    if (!n) return;
    nodes.push(n);
    if (n.left) { edges.push({ from: n.id, to: n.left.id, fv: n.val, tv: n.left.val }); collect(n.left); }
    if (n.right) { edges.push({ from: n.id, to: n.right.id, fv: n.val, tv: n.right.val }); collect(n.right); }
  };
  collect(tree);

  const pathSet = new Set(path || []);
  const isPathEdge = (fv, tv) => pathSet.has(fv) && pathSet.has(tv);
  const currentPointerVal = opType === "search" && path?.length > 0
    ? path[Math.min(pointerIdx ?? path.length - 1, path.length - 1)]
    : null;

  return (
    <svg key={animKey} viewBox={`0 0 ${W} ${svgH}`} width="100%"
      style={{ overflow:"visible", maxHeight:420, display:"block" }}>
      <defs>
        <radialGradient id="gBase" cx="38%" cy="30%">
          <stop offset="0%" stopColor="#162035"/><stop offset="100%" stopColor="#060d1e"/>
        </radialGradient>
        <radialGradient id="gInsert" cx="38%" cy="30%">
          <stop offset="0%" stopColor="#1d4ed8"/><stop offset="100%" stopColor="#1e3a8a"/>
        </radialGradient>
        <radialGradient id="gSearch" cx="38%" cy="30%">
          <stop offset="0%" stopColor="#1d4ed8"/><stop offset="100%" stopColor="#1e3a8a"/>
        </radialGradient>
        <radialGradient id="gPointer" cx="38%" cy="30%">
          <stop offset="0%" stopColor="#0ea5e9"/><stop offset="100%" stopColor="#0c4a6e"/>
        </radialGradient>
        <radialGradient id="gDelete" cx="38%" cy="30%">
          <stop offset="0%" stopColor="#b91c1c"/><stop offset="100%" stopColor="#450a0a"/>
        </radialGradient>
        <filter id="fGlow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="6" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="fEdge" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.5" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="fShad" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4"/>
        </filter>
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
          .nodeIn{animation:nodeIn2 0.5s cubic-bezier(.34,1.4,.64,1) both;transform-box:fill-box;transform-origin:center}
          @keyframes nodeIn2{0%{transform:scale(.08);opacity:0}65%{transform:scale(1.12)}100%{transform:scale(1);opacity:1}}
          .nodeRipple{animation:ripple .65s ease-out forwards;transform-box:fill-box;transform-origin:center}
          @keyframes ripple{0%{transform:scale(.85);opacity:.75}100%{transform:scale(2.8);opacity:0}}
          .nodePointer{animation:pointerPulse 1.2s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
          @keyframes pointerPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}
          .nodeFound{animation:foundBounce .5s cubic-bezier(.34,1.5,.64,1) both;transform-box:fill-box;transform-origin:center}
          @keyframes foundBounce{0%{transform:scale(.9)}55%{transform:scale(1.15)}100%{transform:scale(1)}}
          .pointerArrow{animation:arrowBounce .7s ease-in-out infinite}
          @keyframes arrowBounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
          .deleteExplode{animation:deleteBurst .55s ease-out forwards;transform-box:fill-box;transform-origin:center}
          @keyframes deleteBurst{0%{transform:scale(1);opacity:1}100%{transform:scale(3);opacity:0}}
          .deleteParticle{animation:particleFly .6s ease-out forwards}
          @keyframes particleFly{0%{transform:translate(0,0) scale(1);opacity:.9}100%{transform:translate(var(--dx,0),var(--dy,0)) scale(0);opacity:0}}
        `}</style>
      </defs>
      <rect width={W} height={svgH} fill="url(#bgGrid)"/>

      {edges.map(e => {
        const fp = pos[e.from], tp = pos[e.to];
        if (!fp || !tp) return null;
        const isHL = isPathEdge(e.fv, e.tv);
        return (
          <g key={`e-${e.from}-${e.to}`}>
            {isHL && <line x1={px(fp.x)} y1={py(fp.y)} x2={px(tp.x)} y2={py(tp.y)} stroke="#3b82f6" strokeWidth="4" opacity="0.1" filter="url(#fEdge)"/>}
            <line x1={px(fp.x)} y1={py(fp.y)} x2={px(tp.x)} y2={py(tp.y)}
              stroke={isHL ? "#60a5fa" : "rgba(80,120,200,0.16)"}
              strokeWidth={isHL ? 2 : 1.3}
              markerEnd={isHL ? "url(#arrowPath)" : undefined}
              className={isHL ? "pathEdge" : "edgeDraw"}/>
          </g>
        );
      })}

      {deletedNodePos && (
        <g>
          <circle cx={deletedNodePos.x} cy={deletedNodePos.y} r={NR+6} fill="none" stroke="#f87171" strokeWidth="2.2" className="deleteExplode"/>
          {[0,1,2,3,4,5].map((_,i) => {
            const angle = i*60*Math.PI/180;
            const dx = Math.cos(angle)*20, dy = Math.sin(angle)*20;
            return <circle key={i} cx={deletedNodePos.x} cy={deletedNodePos.y} r="2.5" fill="#ff6b6b"
              style={{"--dx":`${dx}px`,"--dy":`${dy}px`}} className="deleteParticle"/>;
          })}
        </g>
      )}

      {nodes.map(node => {
        const p = pos[node.id]; if (!p) return null;
        const cx = px(p.x), cy = py(p.y);
        const isHl = highlight.includes(node.val);
        const onPath = pathSet.has(node.val);
        const isPtr = node.val === currentPointerVal && opType === "search";
        const isFound = opType === "search" && isHl && node.val === highlight[highlight.length - 1];
        const isIns = opType === "insert" && isHl;

        let fill = "url(#gBase)", stroke = "rgba(80,120,200,0.18)", strokeW = 1.4;
        if (isPtr) { fill = "url(#gPointer)"; stroke = "#7dd3fc"; strokeW = 2.2; }
        else if (isFound) { fill = "url(#gSearch)"; stroke = "#60a5fa"; strokeW = 2.2; }
        else if (onPath && opType === "search") { fill = "url(#gSearch)"; stroke = "#3b82f6"; strokeW = 1.8; }
        else if (opType === "delete" && isHl) { fill = "url(#gDelete)"; stroke = "#f87171"; strokeW = 2.2; }
        else if (isIns) { fill = "url(#gInsert)"; stroke = "#60a5fa"; strokeW = 2.2; }

        const cls = isIns ? "nodeIn" : isFound ? "nodeFound" : isPtr ? "nodePointer" : "";

        return (
          <g key={`n-${node.id}-${animKey}`}>
            {(isPtr||isFound||isIns) && <circle cx={cx} cy={cy} r={NR+12} fill="rgba(59,130,246,0.1)" filter="url(#fGlow)"/>}
            {isIns && <circle cx={cx} cy={cy} r={NR} fill="none" stroke="#60a5fa" strokeWidth="2" opacity="0" className="nodeRipple"/>}
            <circle cx={cx} cy={cy+3} r={NR} fill="rgba(0,0,0,0.4)" filter="url(#fShad)"/>
            <circle cx={cx} cy={cy} r={NR} fill={fill} stroke={stroke} strokeWidth={strokeW} className={cls} style={{transition:"fill .28s,stroke .28s"}}/>
            <circle cx={cx-5} cy={cy-5} r={4} fill="rgba(255,255,255,0.08)"/>
            {isPtr && <text x={cx} y={cy-NR-10} textAnchor="middle" fill="#7dd3fc" fontSize="11" fontFamily="'JetBrains Mono',monospace" className="pointerArrow">▼</text>}
            <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central"
              fill={isHl||onPath ? "#fff" : "#5a8aaa"} fontSize="11" fontWeight="700"
              fontFamily="'JetBrains Mono',monospace">{node.val}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* ─── Terminal ─── */
function Terminal({ lines, validating, currentStepIndex }) {
  const bodyRef = useRef(null);
  const lineRefs = useRef({});
  useEffect(() => {
    if (currentStepIndex === undefined || currentStepIndex === -1) return;
    lineRefs.current[currentStepIndex]?.scrollIntoView({ block:"nearest", behavior:"smooth" });
  }, [currentStepIndex]);
  useEffect(() => { if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight; }, [lines, validating]);

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", background:"#06080f", minHeight:0, fontFamily:"'JetBrains Mono',monospace" }}>
      <div ref={bodyRef} style={{ flex:1, overflowY:"auto", padding:"10px 0", scrollbarWidth:"thin", scrollbarColor:"#151e2e transparent" }}>
        {lines.length === 0 && !validating && (
          <div style={{ padding:"3px 18px", display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ color:"#39d98a" }}>$</span>
            <span style={{ animation:"cur 1.1s step-end infinite", color:"#1e3a22", marginLeft:4 }}>_</span>
          </div>
        )}
        {lines.map((line, i) => (
          <TermLine key={i} line={line} isLast={i===lines.length-1&&!validating}
            stepIndex={line.stepIndex} currentStepIndex={currentStepIndex}
            lineRef={el => lineRefs.current[line.stepIndex] = el}/>
        ))}
        {validating && (
          <div style={{ padding:"3px 18px", display:"flex", alignItems:"center", gap:9 }}>
            <span style={{ display:"inline-block", width:11, height:11, borderRadius:"50%", border:"1.5px solid rgba(76,201,240,0.18)", borderTopColor:"#4cc9f0", animation:"spin 0.7s linear infinite", flexShrink:0 }}/>
            <span style={{ color:"#2d3f5a", fontSize:11 }}>VisuoSlayer reviewing your code…</span>
          </div>
        )}
      </div>
    </div>
  );
}

function TermLine({ line, isLast, stepIndex, currentStepIndex, lineRef }) {
  const [vis, setVis] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), 15); return () => clearTimeout(t); }, []);
  const isActive = stepIndex !== undefined && stepIndex === currentStepIndex && currentStepIndex !== -1;

  if (line.type === "separator") return <div style={{ margin:"5px 18px", borderTop:"1px solid rgba(255,255,255,0.04)", opacity:vis?1:0, transition:"opacity 0.12s" }}/>;
  if (line.type === "blank") return <div style={{ height:7 }}/>;
  if (line.type === "prompt") return (
    <div style={{ padding:"2px 18px", display:"flex", alignItems:"center", gap:7, opacity:vis?1:0, transition:"opacity 0.1s" }}>
      <span style={{ color:"#39d98a" }}>$</span>
      <span style={{ color:"#3d6e9a", fontSize:10 }}>{line.text}</span>
    </div>
  );

  const cm = { insert:"#4cc9f0", search:"#c77dff", delete:"#f72585", error:"#f87171", stderr:"#f87171", success:"#39d98a", warn:"#fbbf24", info:"#60a5fa", output:"#4a5e7a", stdout:"#4a6080" };
  const pm = { insert:"↑", search:"◎", delete:"✕", error:"✗", stderr:"✗", success:"✓", warn:"⚠", info:"·", output:"", stdout:"" };
  const c = cm[line.type] ?? "#3a4a62";
  const pfx = pm[line.type] ?? "";

  return (
    <div ref={lineRef} style={{ padding:"1.5px 18px", display:"flex", alignItems:"flex-start", opacity:vis?1:0, transition:"opacity 0.09s", background:isActive?"rgba(76,201,240,0.08)":"transparent", borderLeft:isActive?"2px solid #4cc9f0":"2px solid transparent" }}>
      <span style={{ color:c, width:20, flexShrink:0, fontSize:10, paddingTop:2 }}>{pfx}</span>
      <span style={{ color:c, wordBreak:"break-word", lineHeight:1.65, flex:1, fontSize:10.5 }}>
        {line.text}
        {isLast && <span style={{ animation:"cur 1.1s step-end infinite", color:"#1e2535" }}> _</span>}
      </span>
      {line.lineNum && <span style={{ marginLeft:10, color:"#141c28", fontSize:9, flexShrink:0, paddingTop:3 }}>:{line.lineNum}</span>}
    </div>
  );
}

/* ─── Code Editor ─── */
const LINE_H = 21;
function CodeEditor({ code, setCode, step, errorLineSet, onKeyDown, taRef }) {
  const lnRef = useRef(null);
  const lines = code.split("\n");
  const syncScroll = useCallback(() => {
    if (taRef.current && lnRef.current) lnRef.current.scrollTop = taRef.current.scrollTop;
  }, [taRef]);
  useEffect(() => {
    const ta = taRef.current; if (!ta) return;
    ta.addEventListener("scroll", syncScroll, { passive:true });
    return () => ta.removeEventListener("scroll", syncScroll);
  }, [syncScroll]);

  return (
    <div style={{ flex:1, display:"flex", minHeight:0, overflow:"hidden", position:"relative" }}>
      <div ref={lnRef} style={{ width:42, flexShrink:0, background:"rgba(4,7,18,0.7)", borderRight:"1px solid rgba(255,255,255,0.04)", overflowY:"hidden", overflowX:"hidden", paddingTop:16, paddingBottom:16, display:"flex", flexDirection:"column", userSelect:"none", pointerEvents:"none", scrollbarWidth:"none" }}>
        {lines.map((_, i) => {
          const isAct = step?.lineNum === i, isErr = errorLineSet.has(i);
          return (
            <div key={i} style={{ height:LINE_H, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"flex-end", paddingRight:8, fontFamily:"'JetBrains Mono',monospace", fontSize:10.5, lineHeight:1, color:isErr?"#ef4444":isAct?"#4cc9f0":"#1c2738", background:isErr?"rgba(239,68,68,0.07)":isAct?"rgba(76,201,240,0.07)":"transparent", transition:"color 0.12s,background 0.12s" }}>
              {i+1}
            </div>
          );
        })}
      </div>
      {step && <div style={{ position:"absolute", left:42, right:0, height:LINE_H, top:16+step.lineNum*LINE_H, background:"rgba(76,201,240,0.04)", borderLeft:"2px solid rgba(76,201,240,0.4)", pointerEvents:"none", transition:"top 0.18s ease", zIndex:1 }}/>}
      {[...errorLineSet].map(i => <div key={`e${i}`} style={{ position:"absolute", left:42, right:0, height:LINE_H, top:16+i*LINE_H, background:"rgba(239,68,68,0.05)", borderLeft:"2px solid rgba(239,68,68,0.4)", pointerEvents:"none", zIndex:1 }}/>)}
      <textarea ref={taRef} style={{ flex:1, padding:"16px 16px 16px 12px", background:"transparent", border:"none", outline:"none", color:"#7ecfff", fontFamily:"'JetBrains Mono',monospace", fontSize:11.5, lineHeight:`${LINE_H}px`, resize:"none", caretColor:"#4cc9f0", tabSize:2, whiteSpace:"pre", overflowY:"auto", overflowX:"auto", scrollbarWidth:"thin", scrollbarColor:"#151e2e transparent", position:"relative", zIndex:2, WebkitUserSelect:"text", touchAction:"manipulation" }}
        value={code} onChange={e => setCode(e.target.value)} onKeyDown={onKeyDown}
        spellCheck={false} placeholder="// Write your BST here…"
        autoCorrect="off" autoCapitalize="none" autoComplete="off"/>
    </div>
  );
}

/* ─── Mobile Nav ─── */
function MobileStickyNav({ activeSection, onNav, hasSteps, hasErrors, termLines }) {
  const hasErr = termLines.some(l => l.type==="error"||l.type==="stderr");
  const hasOk = termLines.some(l => l.type==="success");
  const items = [
    { id:"code", icon:"⌨", label:"Code", dot:null },
    { id:"terminal", icon:"⬛", label:"Term", dot:hasErr?"#f87171":hasOk?"#39d98a":null },
    { id:"viz", icon:"🌲", label:"Tree", dot:hasSteps?"#4cc9f0":hasErrors?"#f87171":null },
  ];
  return (
    <div style={{ position:"fixed", right:0, top:"50%", transform:"translateY(-50%)", zIndex:9000, display:"flex", flexDirection:"column", background:"rgba(5,8,26,0.96)", border:"1px solid rgba(76,201,240,0.2)", borderRight:"none", borderRadius:"14px 0 0 14px", overflow:"hidden", boxShadow:"-4px 0 28px rgba(0,0,0,0.7)", backdropFilter:"blur(24px)" }}>
      {items.map((item, i) => {
        const isActive = activeSection === item.id;
        return (
          <button key={item.id} onClick={() => onNav(item.id)} style={{ position:"relative", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:4, width:50, padding:"13px 4px", border:"none", background:isActive?"linear-gradient(180deg,rgba(76,201,240,0.2),rgba(199,125,255,0.12))":"transparent", cursor:"pointer", borderBottom:i<items.length-1?"1px solid rgba(255,255,255,0.06)":"none", WebkitTapHighlightColor:"transparent", transition:"background 0.18s", borderLeft:isActive?"2.5px solid #4cc9f0":"2.5px solid transparent" }}>
            {item.dot && <span style={{ position:"absolute", top:7, right:8, width:6, height:6, borderRadius:"50%", background:item.dot, boxShadow:`0 0 8px ${item.dot}` }}/>}
            <span style={{ fontSize:17, opacity:isActive?1:0.38, transition:"opacity 0.15s,transform 0.15s", transform:isActive?"scale(1.12)":"scale(1)", lineHeight:1 }}>{item.icon}</span>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:6.5, fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase", color:isActive?"#4cc9f0":"rgba(255,255,255,0.2)", transition:"color 0.15s" }}>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 900);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

/* ─── Main Component ─── */
export default function BSTPage() {
  const [lang, setLang] = useState("c");
  const [code, setCode] = useState(TPL.c);
  const [steps, setSteps] = useState([]);
  const [idx, setIdx] = useState(-1);
  const [error, setError] = useState("");
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1.1);
  const [animKey, setAnimKey] = useState(0);
  const [done, setDone] = useState(false);
  const [validating, setValidating] = useState(false);
  const [aiErrors, setAiErrors] = useState([]);
  const [termLines, setTermLines] = useState([]);
  const [sessionId] = useState(() => Math.random().toString(36).slice(2,8).toUpperCase());
  const [toast, setToast] = useState(null);
  const [termOpen, setTermOpen] = useState(true);
  const [activeSection, setActiveSection] = useState("code");
  const [pointerIdx, setPointerIdx] = useState(null);
  const [deletedNodePos, setDeletedNodePos] = useState(null);

  const isMobile = useIsMobile();
  const timerRef = useRef(null);
  const ptrTimerRef = useRef(null);
  const taRef = useRef(null);
  const listRef = useRef(null);
  const sectionCodeRef = useRef(null);
  const sectionTermRef = useRef(null);
  const sectionVizRef = useRef(null);
  const scrollContainerRef = useRef(null);

  const bump = () => setAnimKey(k => k+1);
  const showToast = msg => { setToast(msg); setTimeout(() => setToast(null), 2400); };

  const doReset = useCallback(() => {
    clearInterval(timerRef.current); clearInterval(ptrTimerRef.current);
    setSteps([]); setIdx(-1); setError(""); setPlaying(false); setDone(false);
    setAiErrors([]); setTermLines([]); setPointerIdx(null); setDeletedNodePos(null);
  }, []);

  const handleChangeLang = l => { setLang(l); setCode(TPL[l] ?? ""); doReset(); };

  const buildTerm = (stps, errs, aiErrs, aiReason) => {
    const ls = [];
    const ts = new Date().toTimeString().slice(0, 8);
    const langLabel = LANGS[lang]?.name ?? lang;
    ls.push({ type:"output", text:`VisuoSlayer v2.3  ·  BST  ·  ${ts}  ·  pid:${sessionId}` });
    ls.push({ type:"separator" });
    if (aiErrs.length > 0) {
      ls.push({ type:"prompt", text:`visualoslayer validate --lang=${langLabel} --ds=bst` });
      ls.push({ type:"blank" });
      if (aiReason) ls.push({ type:"stderr", text:aiReason });
      aiErrs.forEach(e => ls.push({ type:"error", text:`  L${e.line??"?"}  ${e.message}`, lineNum:e.line }));
      ls.push({ type:"blank" }); ls.push({ type:"error", text:"Process exited with code 1" });
      return ls;
    }
    if (errs.length > 0) {
      ls.push({ type:"prompt", text:`visualoslayer run --lang=${langLabel}` });
      ls.push({ type:"blank" });
      errs.forEach(e => ls.push({ type:"stderr", text:e }));
      ls.push({ type:"blank" }); ls.push({ type:"error", text:"Process exited with code 1" });
      return ls;
    }
    if (stps.length > 0) {
      ls.push({ type:"prompt", text:`visualoslayer run --lang=${langLabel} --ds=bst` });
      ls.push({ type:"blank" });
      stps.forEach((s, si) => {
        let out = "";
        if (s.type==="insert") out = `insert(${s.value})  →  size:${s.size}  height:${s.height}`;
        if (s.type==="search") out = `search(${s.value})  →  ${s.found?`✓ found  path:${(s.path||[]).join("→")}`:  "✗ not found"}`;
        if (s.type==="delete") out = `delete(${s.value})  →  size:${s.size}  height:${s.height}`;
        ls.push({ type:s.type, text:out, lineNum:s.lineNum+1, stepIndex:si });
      });
      ls.push({ type:"blank" });
      ls.push({ type:"success", text:`${stps.length} op${stps.length!==1?"s":""} completed  ·  exit 0` });
    }
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
      if (isMobile) scrollToSection("terminal");
      return;
    }
    const { steps: s, errors } = parseAndRunCode(code, lang);
    if (errors.length) {
      setError(errors.join("\n"));
      setTermLines(buildTerm([], errors, [], ""));
      if (isMobile) scrollToSection("terminal");
      return;
    }
    setSteps(s); setIdx(0); bump(); setPlaying(true);
    setTermLines(buildTerm(s, [], [], ""));
    if (isMobile) scrollToSection("viz");
  };

  const animatePointer = useCallback((path) => {
    if (!path?.length) { setPointerIdx(null); return; }
    setPointerIdx(0); let i = 0;
    clearInterval(ptrTimerRef.current);
    ptrTimerRef.current = setInterval(() => {
      i++; if (i >= path.length) { clearInterval(ptrTimerRef.current); return; }
      setPointerIdx(i);
    }, 400);
  }, []);

  const goTo = useCallback((i) => {
    clearInterval(timerRef.current); clearInterval(ptrTimerRef.current); setPlaying(false);
    const ni = Math.max(0, Math.min(i, steps.length - 1));
    setIdx(ni); bump();

    const currentStep = steps[ni];
    if (currentStep?.type === "delete" && currentStep.value !== undefined && ni > 0) {
      const prevTree = steps[ni-1]?.tree;
      if (prevTree) {
        const layoutPrev = layoutTree(prevTree);
        const allVals = Object.values(layoutPrev);
        const maxX = allVals.length ? Math.max(...allVals.map(p=>p.x),0) : 0;
        const pad = 44, vGap = 68;
        const px2 = x => maxX===0?360:(x/maxX)*(720-pad*2)+pad;
        const py2 = y => y*vGap+44;
        const findPos = (node, val) => {
          if (!node) return null;
          if (node.val === val) { const p=layoutPrev[node.id]; return p?{x:px2(p.x),y:py2(p.y)}:null; }
          return findPos(node.left,val)||findPos(node.right,val);
        };
        const pos = findPos(prevTree, currentStep.value);
        setDeletedNodePos(pos ?? null);
      } else setDeletedNodePos(null);
    } else setDeletedNodePos(null);

    const s = steps[ni];
    if (s?.type==="search"&&s.path?.length) animatePointer(s.path);
    else setPointerIdx(null);
  }, [steps, animatePointer]);

  useEffect(() => {
    const h = e => { if ((e.ctrlKey||e.metaKey)&&e.key==="Enter") { e.preventDefault(); handleRun(); } };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [code, lang]);

  useEffect(() => {
    if (!playing || !steps.length) return;
    timerRef.current = setInterval(() => {
      setIdx(p => {
        if (p >= steps.length - 1) { clearInterval(timerRef.current); setPlaying(false); setDone(true); return p; }
        const next = p + 1; bump();
        const s = steps[next];
        if (s?.type==="search"&&s.path?.length) animatePointer(s.path); else setPointerIdx(null);
        return next;
      });
    }, speed * 1000);
    return () => clearInterval(timerRef.current);
  }, [playing, steps, speed, animatePointer]);

  useEffect(() => {
    listRef.current?.querySelector(".sl-active")?.scrollIntoView({ block:"nearest", behavior:"smooth" });
  }, [idx]);

  const onKeyDown = e => {
    if (e.key !== "Tab") return;
    e.preventDefault();
    const s = e.target.selectionStart, en = e.target.selectionEnd;
    const nv = code.slice(0,s)+"  "+code.slice(en);
    setCode(nv);
    requestAnimationFrame(() => { if (taRef.current) { taRef.current.selectionStart=s+2; taRef.current.selectionEnd=s+2; } });
  };

  const step = steps[idx] ?? null;
  const os = step ? OP[step.type] ?? OP.insert : null;
  const prog = steps.length ? Math.round(((idx+1)/steps.length)*100) : 0;
  const hasAiErrors = aiErrors.length > 0;
  const idle = steps.length===0&&!error&&!hasAiErrors;
  const lm = LANGS[lang];
  const errorLineSet = new Set(aiErrors.map(e => (e.line??1)-1));

  const scrollToSection = useCallback(id => {
    const map = { code:sectionCodeRef, terminal:sectionTermRef, viz:sectionVizRef };
    map[id]?.current?.scrollIntoView({ behavior:"smooth", block:"start" });
    setActiveSection(id);
  }, []);

  useEffect(() => {
    if (!isMobile) return;
    const refs = [{ id:"code", ref:sectionCodeRef },{ id:"terminal", ref:sectionTermRef },{ id:"viz", ref:sectionVizRef }];
    const obs = new IntersectionObserver(entries => {
      let best=null, bestR=0;
      entries.forEach(e => { if (e.isIntersecting&&e.intersectionRatio>bestR) { bestR=e.intersectionRatio; best=e.target.dataset.section; } });
      if (best) setActiveSection(best);
    }, { root:scrollContainerRef.current, threshold:[0.3,0.6] });
    refs.forEach(r => { if (r.ref.current) { r.ref.current.dataset.section=r.id; obs.observe(r.ref.current); } });
    return () => obs.disconnect();
  }, [isMobile]);

  /* ─── Renders ─── */
  const renderLangTabs = (mob=false) => (
    <div className={mob?"mob-lb":"lb"}>
      {Object.entries(LANGS).map(([k,m]) => {
        const isActive = lang===k;
        return (
          <button key={k} className={`${mob?"mob-lt":"lt"}${isActive?" la":""}`}
            onClick={() => handleChangeLang(k)}
            style={isActive ? { borderColor:`${m.accent}40`, color:m.accent, background:`${m.accent}0f` } : {}}>
            {mob ? m.name : m.ext}
          </button>
        );
      })}
    </div>
  );

  /* ─── CSS ─── */
  const SHARED_CSS = `
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700;800&family=Space+Grotesk:wght@600;700;800;900&family=DM+Sans:wght@400;500;600&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    html,body{height:100%;-webkit-text-size-adjust:100%;}
    body{background:#050818;color:#c8d8f0;font-family:'DM Sans',sans-serif;}
    :root{
      --cyan:#4cc9f0;--cyan-dim:rgba(76,201,240,0.15);--cyan-glow:rgba(76,201,240,0.5);
      --pink:#f72585;--green:#39d98a;--green-dim:rgba(57,217,138,0.15);--green-glow:rgba(57,217,138,0.45);
      --purple:#c77dff;
      --text-primary:#d4e4f7;--text-secondary:#6b8aaa;--text-muted:#3d5470;
      --border-subtle:rgba(255,255,255,0.07);--border-medium:rgba(255,255,255,0.13);
      --surface-0:#050818;--surface-1:rgba(8,14,36,0.95);--surface-2:rgba(12,20,48,0.8);--surface-3:rgba(16,26,58,0.7);
    }
    @keyframes cur{0%,100%{opacity:1}50%{opacity:0}}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
    @keyframes rPulse{0%,100%{box-shadow:0 0 18px rgba(76,201,240,0.45)}50%{box-shadow:0 0 42px rgba(76,201,240,0.75),0 0 80px rgba(76,201,240,0.25)}}
    @keyframes stepPop{0%{transform:scale(0.85);opacity:0}55%{transform:scale(1.05)}100%{transform:scale(1);opacity:1}}
    @keyframes toastIn{0%{opacity:0;transform:translateY(10px) scale(0.92)}100%{opacity:1;transform:none}}
    @keyframes toastOut{0%{opacity:1}100%{opacity:0;transform:translateY(-8px)}}
    @keyframes gridScroll{0%{background-position:0 0}100%{background-position:38px 38px}}
    @keyframes scanline{0%{top:-10%}100%{top:110%}}
    @keyframes blobFloat{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(22px,-16px) scale(1.06)}66%{transform:translate(-14px,20px) scale(0.95)}}
    @keyframes blob2{0%,100%{transform:translate(0,0) scale(1)}40%{transform:translate(-26px,14px) scale(1.09)}70%{transform:translate(18px,-22px) scale(0.93)}}
    @keyframes idleFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
    ::-webkit-scrollbar{width:4px;height:4px}
    ::-webkit-scrollbar-track{background:transparent}
    ::-webkit-scrollbar-thumb{background:rgba(76,201,240,0.2);border-radius:4px}
    ::-webkit-scrollbar-thumb:hover{background:rgba(76,201,240,0.4)}
    textarea::-webkit-scrollbar{width:4px}
  `;

  /* ─── MOBILE ─── */
  if (isMobile) {
    return (
      <>
        <style>{SHARED_CSS + `
          html,body{overflow:hidden;}
          .mob-pg{height:100vh;height:100dvh;display:flex;flex-direction:column;background:radial-gradient(ellipse 80% 50% at 50% 0%,rgba(76,201,240,0.1) 0%,transparent 60%),#050818;padding-top:env(safe-area-inset-top,0);}
          .mob-hd{flex-shrink:0;display:flex;align-items:center;gap:9px;padding:8px 14px;background:rgba(5,8,22,0.98);backdrop-filter:blur(24px);border-bottom:1px solid rgba(76,201,240,0.14);z-index:100;position:sticky;top:0;}
          .mob-logo{width:29px;height:29px;border-radius:8px;flex-shrink:0;background:linear-gradient(135deg,#0369a1,#4cc9f0 45%,#7209b7);display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 0 14px rgba(76,201,240,0.55);animation:rPulse 3s ease-in-out infinite;}
          .mob-brand{font-family:'Space Grotesk',sans-serif;font-size:13.5px;font-weight:900;background:linear-gradient(90deg,#4cc9f0 0%,#c77dff 50%,#f72585 100%);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:shimmer 4s linear infinite;}
          .mob-sub{font-size:8px;color:var(--text-muted);font-family:'JetBrains Mono',monospace;}
          .mob-scroll{flex:1;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;scrollbar-width:thin;scrollbar-color:rgba(76,201,240,0.15) transparent;padding-right:52px;padding-bottom:env(safe-area-inset-bottom,16px);}
          .mob-scroll::-webkit-scrollbar{width:2px;}
          .mob-sec{display:flex;flex-direction:column;}
          .mob-sec-label{display:flex;align-items:center;gap:7px;padding:9px 13px 5px;font-family:'JetBrains Mono',monospace;font-size:6.5px;font-weight:800;letter-spacing:0.18em;text-transform:uppercase;color:var(--text-muted);}
          .mob-sec-label::after{content:'';flex:1;height:1px;background:linear-gradient(90deg,rgba(76,201,240,0.22),transparent);}
          .mob-ph{padding:6px 12px;border-bottom:1px solid var(--border-subtle);background:rgba(8,14,38,0.92);display:flex;align-items:center;gap:6px;flex-shrink:0;}
          .dot{width:7px;height:7px;border-radius:50%;}
          .ptl{font-family:'JetBrains Mono',monospace;font-size:7px;color:var(--text-muted);text-transform:uppercase;letter-spacing:1.2px;margin-left:5px;font-weight:600;}
          .mob-lb{display:flex;gap:3px;padding:6px 10px;overflow-x:auto;border-bottom:1px solid var(--border-subtle);background:rgba(6,11,30,0.85);flex-shrink:0;scrollbar-width:none;-webkit-overflow-scrolling:touch;}
          .mob-lb::-webkit-scrollbar{display:none;}
          .mob-lt{padding:4px 10px;border-radius:5px;cursor:pointer;white-space:nowrap;font-family:'JetBrains Mono',monospace;font-size:8px;font-weight:700;border:1px solid var(--border-subtle);background:transparent;color:var(--text-muted);transition:all 0.15s;flex-shrink:0;}
          .mob-lt.la{color:#e8f4ff;background:rgba(255,255,255,0.06);}
          .mob-editor-wrap{background:rgba(5,8,22,0.97);border:1px solid var(--border-subtle);display:flex;flex-direction:column;height:300px;}
          .mob-rr{padding:9px 11px;border-top:1px solid rgba(76,201,240,0.2);display:flex;align-items:center;gap:7px;flex-shrink:0;background:rgba(4,8,22,0.97);}
          .mob-btn-run{flex:1;padding:10px 14px;border-radius:11px;background:linear-gradient(135deg,#0369a1,#0ea5e9,#4cc9f0);border:1px solid rgba(76,201,240,0.45);color:#fff;font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:800;cursor:pointer;transition:all 0.18s;box-shadow:0 0 22px rgba(76,201,240,0.35);-webkit-tap-highlight-color:transparent;}
          .mob-btn-run:active{transform:scale(0.97);}
          .mob-btn-run.running{animation:rPulse 1.2s ease-in-out infinite;}
          .mob-btn-run:disabled{opacity:0.4;cursor:not-allowed;}
          .mob-btn-rst{padding:10px 12px;border-radius:11px;background:transparent;border:1px solid rgba(248,113,113,0.32);color:#f87171;font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;cursor:pointer;-webkit-tap-highlight-color:transparent;white-space:nowrap;}
          .mob-alb{display:flex;align-items:center;gap:6px;padding:5px 12px;border-left:2px solid;min-height:26px;border-top:1px solid var(--border-subtle);flex-shrink:0;animation:fadeIn 0.18s ease;}
          .mob-alb-ln{font-family:'JetBrains Mono',monospace;font-size:8px;font-weight:700;white-space:nowrap;}
          .mob-alb-code{font-family:'JetBrains Mono',monospace;font-size:8px;color:var(--text-secondary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;}
          .mob-term-wrap{background:rgba(5,8,22,0.97);border:1px solid var(--border-subtle);display:flex;flex-direction:column;height:200px;}
          .mob-viz-wrap{background:rgba(5,8,22,0.97);border:1px solid var(--border-subtle);display:flex;flex-direction:column;min-height:320px;align-items:center;justify-content:center;}
          .mob-ctrl{display:flex;align-items:center;gap:3px;padding:7px 10px;border-top:1px solid var(--border-subtle);background:rgba(3,6,18,0.75);flex-shrink:0;flex-wrap:wrap;}
          .mob-cb{width:30px;height:30px;border-radius:7px;border:1px solid var(--border-medium);background:var(--surface-3);color:var(--text-secondary);font-size:11px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.12s;-webkit-tap-highlight-color:transparent;flex-shrink:0;}
          .mob-cb:active:not(:disabled){transform:scale(0.9);background:var(--cyan-dim);}
          .mob-cb:disabled{opacity:0.22;cursor:not-allowed;}
          .mob-cp{height:30px;padding:0 12px;border-radius:7px;background:linear-gradient(135deg,#0369a1,#0ea5e9,#4cc9f0);border:1px solid rgba(76,201,240,0.38);color:#fff;font-size:12px;font-weight:800;cursor:pointer;box-shadow:0 0 16px rgba(76,201,240,0.35);-webkit-tap-highlight-color:transparent;flex-shrink:0;}
          .mob-cp:active{transform:scale(0.94);}
          .mob-cp:disabled{opacity:0.25;cursor:not-allowed;}
          .mob-csep{width:1px;height:13px;background:var(--border-subtle);margin:0 1px;flex-shrink:0;}
          .mob-spd{display:flex;gap:2px;}
          .mob-sb{padding:3px 6px;border-radius:5px;cursor:pointer;font-family:'JetBrains Mono',monospace;font-size:7.5px;font-weight:700;border:1px solid var(--border-subtle);background:transparent;color:var(--text-muted);-webkit-tap-highlight-color:transparent;}
          .mob-sb.sa{background:var(--cyan-dim);border-color:rgba(76,201,240,0.42);color:var(--cyan);}
          .mob-pr{display:flex;align-items:center;gap:7px;padding:5px 12px;border-top:1px solid var(--border-subtle);flex-shrink:0;}
          .mob-pt2{flex:1;height:3px;background:rgba(255,255,255,0.05);border-radius:99px;overflow:hidden;}
          .mob-pf{height:100%;border-radius:99px;transition:width 0.4s cubic-bezier(0.4,0,0.2,1);background:linear-gradient(90deg,#0369a1,#4cc9f0,#c77dff);box-shadow:0 0 7px rgba(76,201,240,0.5);}
          .mob-ptx{font-family:'JetBrains Mono',monospace;font-size:7.5px;color:var(--text-secondary);min-width:26px;text-align:right;}
          .mob-slh{padding:4px 12px 2px;font-family:'JetBrains Mono',monospace;font-size:6px;color:var(--text-muted);letter-spacing:0.18em;text-transform:uppercase;font-weight:700;border-top:1px solid var(--border-subtle);flex-shrink:0;display:flex;align-items:center;justify-content:space-between;}
          .mob-sl{overflow-y:auto;padding:2px 6px 8px;display:flex;flex-direction:column;gap:1px;max-height:110px;flex-shrink:0;scrollbar-width:thin;}
          .mob-si{display:flex;align-items:center;gap:5px;padding:3px 7px;border-radius:5px;cursor:pointer;font-family:'JetBrains Mono',monospace;font-size:8.5px;color:var(--text-muted);transition:all 0.12s;border:1px solid transparent;-webkit-tap-highlight-color:transparent;}
          .mob-si:active{background:var(--cyan-dim);}
          .sl-active{background:rgba(76,201,240,0.1)!important;border-color:rgba(76,201,240,0.25)!important;color:var(--cyan)!important;box-shadow:inset 2.5px 0 0 var(--cyan);}
          .mob-si-dot{width:5.5px;height:5.5px;border-radius:50%;flex-shrink:0;transition:all 0.12s;}
          .mob-si-v{opacity:0.55;margin-left:1px;}
          .mob-si-ln{margin-left:auto;font-size:6.5px;color:var(--text-muted);opacity:0.7;}
          .toast{position:fixed;bottom:16px;left:50%;transform:translateX(-50%);padding:8px 16px;border-radius:10px;font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;white-space:nowrap;background:rgba(10,20,50,0.98);border:1px solid var(--border-medium);color:var(--green);box-shadow:0 8px 24px rgba(0,0,0,0.6);z-index:9999;animation:toastIn 0.22s ease;}
        `}</style>

        <div className="mob-pg">
          <header className="mob-hd">
            <div className="mob-logo">🌲</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div className="mob-brand">VisuoSlayer</div>
              <div className="mob-sub">BST · Write · Run · Visualize</div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:5, flexShrink:0 }}>
              <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:7.5, color:lm.accent, background:`${lm.accent}14`, border:`1px solid ${lm.accent}30`, padding:"1px 7px", borderRadius:16, fontWeight:800 }}>{lm.ext}</span>
              <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:6.5, color:"var(--text-muted)", padding:"1px 5px", borderRadius:12, border:"1px solid var(--border-subtle)", background:"var(--surface-2)" }}>{sessionId}</span>
            </div>
          </header>

          <div className="mob-scroll" ref={scrollContainerRef}>
            {/* CODE */}
            <div ref={sectionCodeRef} className="mob-sec">
              <div className="mob-sec-label"><span>⌨</span><span>01 · Code Editor</span></div>
              <div className="mob-editor-wrap">
                <div className="mob-ph">
                  <span className="dot" style={{ background:"#ff5f57", boxShadow:"0 0 5px #ff5f57" }}/>
                  <span className="dot" style={{ background:"#ffbd2e", boxShadow:"0 0 5px #ffbd2e" }}/>
                  <span className="dot" style={{ background:"#28c840", boxShadow:"0 0 5px #28c840" }}/>
                  <span className="ptl">Code Editor</span>
                  <span style={{ marginLeft:"auto", fontFamily:"'JetBrains Mono',monospace", fontSize:7.5, color:lm.accent, background:`${lm.accent}12`, border:`1px solid ${lm.accent}28`, padding:"1px 7px", borderRadius:14, fontWeight:800 }}>{lm.name}</span>
                </div>
                {renderLangTabs(true)}
                <div style={{ flex:1, display:"flex", flexDirection:"column", minHeight:0, position:"relative" }}>
                  <CodeEditor code={code} setCode={setCode} step={step} errorLineSet={errorLineSet} onKeyDown={onKeyDown} taRef={taRef}/>
                  {step&&os&&<div className="mob-alb" style={{ borderColor:os.bd, background:os.bg }}>
                    <span style={{ color:os.c, fontSize:9 }}>{os.icon}</span>
                    <span className="mob-alb-ln" style={{ color:os.c }}>L{step.lineNum+1}</span>
                    <code className="mob-alb-code">{step.codeLine}</code>
                  </div>}
                </div>
              </div>
              <div className="mob-rr">
                <button className={`mob-btn-run${playing||validating?" running":""}`} onClick={handleRun} disabled={playing||validating}>
                  {validating?"⟳ Validating…":playing?"▶ Running…":"▶  Run & Visualize"}
                </button>
                {(steps.length>0||error||hasAiErrors) && <button className="mob-btn-rst" onClick={doReset}>↺ Reset</button>}
                <span className="rr-hint">CTRL+ENTER</span>
              </div>
            </div>

            {/* TERMINAL */}
            <div ref={sectionTermRef} className="mob-sec" style={{ marginTop:2 }}>
              <div className="mob-sec-label"><span>⬛</span><span>02 · Terminal</span></div>
              <div className="mob-term-wrap">
                <div className="mob-ph">
                  <span className="dot" style={{ background:"#ff5f57" }}/><span className="dot" style={{ background:"#ffbd2e" }}/><span className="dot" style={{ background:"#28c840" }}/>
                  <span className="ptl">visualoslayer — bash</span>
                  <span style={{ marginLeft:"auto", fontFamily:"'JetBrains Mono',monospace", fontSize:7, color:"var(--text-muted)" }}>pid:{sessionId}</span>
                </div>
                <Terminal lines={termLines} validating={validating} currentStepIndex={idx}/>
              </div>
            </div>

            {/* VIZ */}
            <div ref={sectionVizRef} className="mob-sec" style={{ marginTop:2 }}>
              <div className="mob-sec-label"><span>🌲</span><span>03 · BST Visualization</span></div>
              <div className="mob-viz-wrap">
                <div className="mob-ph">
                  <span className="dot" style={{ background:"#4cc9f0", boxShadow:"0 0 5px #4cc9f0" }}/>
                  <span className="dot" style={{ background:"#f72585", boxShadow:"0 0 5px #f72585" }}/>
                  <span className="dot" style={{ background:"#ffd60a", boxShadow:"0 0 5px #ffd60a" }}/>
                  <span className="ptl">Binary Search Tree</span>
                  {steps.length>0&&<span style={{ marginLeft:"auto", fontFamily:"'JetBrains Mono',monospace", fontSize:7.5, color:"var(--cyan)", background:"var(--cyan-dim)", border:"1px solid rgba(76,201,240,0.28)", padding:"1px 7px", borderRadius:12, fontWeight:800 }}>{idx+1}/{steps.length}</span>}
                </div>
                <div style={{ flex:1, minHeight:280, display:"flex", alignItems:"center", justifyContent:"center", padding:"8px" }}>
                  <TreeViz tree={step?.tree??null} highlight={step?.highlight??[]} path={step?.path??[]} animKey={animKey} opType={step?.type} idle={idle} pointerIdx={pointerIdx} deletedNodePos={deletedNodePos}/>
                </div>
              </div>
            </div>
            <div style={{ height:24 }}/>
          </div>

          <MobileStickyNav activeSection={activeSection} onNav={scrollToSection} hasSteps={steps.length>0} hasErrors={!!error||hasAiErrors} termLines={termLines}/>
        </div>
        {toast&&<div className="toast">{toast}</div>}
      </>
    );
  }

  /* ─── DESKTOP ─── */
  return (
    <>
      <style>{SHARED_CSS + `
        html,body{overflow:hidden;}
        .pg{height:100vh;display:flex;flex-direction:column;overflow:hidden;
          background:radial-gradient(ellipse 65% 45% at 5% 0%,rgba(76,201,240,0.1) 0%,transparent 55%),radial-gradient(ellipse 55% 40% at 95% 100%,rgba(247,37,133,0.09) 0%,transparent 52%),#050818;}
        .hd{flex-shrink:0;display:flex;align-items:center;gap:13px;padding:8px 20px;background:rgba(5,8,22,0.99);backdrop-filter:blur(24px);border-bottom:1px solid rgba(76,201,240,0.14);box-shadow:0 1px 0 rgba(76,201,240,0.07),0 4px 28px rgba(0,0,0,0.5);}
        .hd-logo{width:34px;height:34px;border-radius:10px;flex-shrink:0;background:linear-gradient(135deg,#0369a1,#4cc9f0 45%,#7209b7);display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 0 22px rgba(76,201,240,0.55);animation:rPulse 3s ease-in-out infinite;}
        .hd-brand{font-family:'Space Grotesk',sans-serif;font-size:16px;font-weight:900;letter-spacing:-0.5px;background:linear-gradient(90deg,#4cc9f0 0%,#c77dff 50%,#f72585 100%);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:shimmer 4s linear infinite;}
        .hd-tagline{font-size:8.5px;color:var(--text-muted);font-family:'JetBrains Mono',monospace;margin-top:1px;letter-spacing:0.05em;}
        .hd-r{margin-left:auto;display:flex;align-items:center;gap:8px;flex-shrink:0;}
        .hd-pill{font-family:'JetBrains Mono',monospace;font-size:8px;padding:2px 10px;border-radius:20px;letter-spacing:0.08em;white-space:nowrap;font-weight:800;}
        .hd-pid{font-family:'JetBrains Mono',monospace;font-size:7.5px;color:var(--text-muted);padding:2px 9px;border-radius:20px;border:1px solid var(--border-subtle);background:var(--surface-2);}
        .hd-ds-badge{font-family:'JetBrains Mono',monospace;font-size:7.5px;color:var(--cyan);padding:2px 9px;border-radius:20px;border:1px solid rgba(76,201,240,0.28);background:rgba(76,201,240,0.08);letter-spacing:0.1em;}
        .main{flex:1;display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:8px 16px;min-height:0;overflow:hidden;}
        @media(max-width:1200px){.main{padding:6px 12px;gap:6px;}}
        @media(max-width:960px){.main{grid-template-columns:1fr;overflow-y:auto;overflow-x:hidden;}}
        .panel{background:var(--surface-1);border:1px solid var(--border-subtle);border-radius:12px;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.55),inset 0 1px 0 rgba(255,255,255,0.04);min-height:0;}
        @media(max-width:960px){.panel{min-height:480px;}}
        .ph{padding:8px 13px;border-bottom:1px solid var(--border-subtle);background:rgba(8,14,38,0.88);display:flex;align-items:center;gap:7px;flex-shrink:0;}
        .dot{width:8px;height:8px;border-radius:50%;transition:box-shadow 0.3s;}
        .ptl{font-family:'JetBrains Mono',monospace;font-size:7.5px;color:var(--text-muted);text-transform:uppercase;letter-spacing:1.5px;margin-left:7px;font-weight:700;}
        .left{display:flex;flex-direction:column;min-height:0;}
        .lb{display:flex;gap:3px;flex-wrap:wrap;padding:6px 10px;border-bottom:1px solid var(--border-subtle);background:rgba(6,11,30,0.85);flex-shrink:0;}
        .lt{padding:3px 9px;border-radius:5px;cursor:pointer;font-family:'JetBrains Mono',monospace;font-size:8px;font-weight:800;border:1px solid var(--border-subtle);background:transparent;color:var(--text-muted);transition:all 0.15s;letter-spacing:0.06em;}
        .lt:hover{color:var(--text-secondary);border-color:var(--border-medium);background:rgba(255,255,255,0.04);}
        .lt.la{color:#e8f4ff;background:rgba(255,255,255,0.07);box-shadow:inset 0 1px 0 rgba(255,255,255,0.12);}
        .alb{display:flex;align-items:center;gap:8px;padding:4px 13px;border-left:2px solid;min-height:25px;border-top:1px solid var(--border-subtle);flex-shrink:0;animation:fadeIn 0.18s ease;}
        .alb-ln{font-family:'JetBrains Mono',monospace;font-size:8.5px;font-weight:800;white-space:nowrap;}
        .alb-code{font-family:'JetBrains Mono',monospace;font-size:8.5px;color:var(--text-secondary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;}
        .rr{padding:8px 12px;border-top:1px solid var(--border-subtle);display:flex;align-items:center;gap:7px;flex-shrink:0;background:rgba(4,8,22,0.65);flex-wrap:wrap;}
        .btn-run{padding:6px 18px;border-radius:8px;background:linear-gradient(135deg,#0369a1,#0ea5e9,#4cc9f0);border:1px solid rgba(76,201,240,0.32);color:#fff;font-family:'JetBrains Mono',monospace;font-size:10.5px;font-weight:800;cursor:pointer;transition:all 0.18s;box-shadow:0 0 22px rgba(76,201,240,0.32),0 3px 10px rgba(0,0,0,0.45);letter-spacing:0.05em;position:relative;overflow:hidden;white-space:nowrap;}
        .btn-run::after{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,0.16) 0%,transparent 60%);border-radius:inherit;pointer-events:none;}
        .btn-run:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 0 38px rgba(76,201,240,0.58),0 6px 22px rgba(0,0,0,0.55);}
        .btn-run:active:not(:disabled){transform:translateY(0);}
        .btn-run.running{animation:rPulse 1.2s ease-in-out infinite;}
        .btn-run:disabled{opacity:0.4;cursor:not-allowed;transform:none;box-shadow:none;}
        .btn-rst{padding:6px 12px;border-radius:8px;background:transparent;border:1px solid rgba(248,113,113,0.28);color:#f87171;font-family:'JetBrains Mono',monospace;font-size:9.5px;font-weight:700;cursor:pointer;transition:all 0.16s;white-space:nowrap;}
        .btn-rst:hover{background:rgba(248,113,113,0.1);border-color:rgba(248,113,113,0.52);}
        .rr-hint{font-family:'JetBrains Mono',monospace;font-size:7.5px;color:var(--text-muted);letter-spacing:0.07em;padding:2px 6px;border-radius:4px;border:1px solid var(--border-subtle);background:var(--surface-2);white-space:nowrap;}
        .term-bar{display:flex;align-items:center;gap:6px;padding:6px 13px;background:rgba(4,7,18,0.97);border-bottom:1px solid var(--border-subtle);border-top:1px solid var(--border-subtle);flex-shrink:0;}
        .term-toggle{display:flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:4px;border:1px solid var(--border-medium);background:rgba(255,255,255,0.04);cursor:pointer;flex-shrink:0;color:var(--text-secondary);font-size:8px;font-weight:700;transition:all 0.15s;margin-left:auto;font-family:'JetBrains Mono',monospace;line-height:1;user-select:none;}
        .term-toggle:hover{background:var(--cyan-dim);color:var(--cyan);border-color:rgba(76,201,240,0.42);}
        .tm-wrap{display:flex;flex-direction:column;min-height:0;transition:flex-basis 0.32s cubic-bezier(0.4,0,0.2,1),opacity 0.25s;overflow:hidden;}
        .tm-wrap.tm-open{flex:1;min-height:100px;}
        .tm-wrap.tm-closed{flex:0 0 0px;min-height:0;opacity:0;pointer-events:none;}
        .term-body-wrap{flex:1;display:flex;flex-direction:column;min-height:0;animation:fadeUp 0.28s ease;}
        .term-bar-closed{display:flex;align-items:center;gap:6px;padding:6px 13px;background:rgba(4,7,18,0.97);border-top:1px solid var(--border-subtle);flex-shrink:0;cursor:pointer;transition:background 0.15s;}
        .term-bar-closed:hover{background:rgba(8,14,32,0.97);}
        .toast{position:fixed;bottom:20px;right:20px;padding:8px 16px;border-radius:10px;font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;background:rgba(10,20,50,0.98);border:1px solid var(--border-medium);color:var(--green);box-shadow:0 8px 28px rgba(0,0,0,0.6);z-index:9999;animation:toastIn 0.25s ease,toastOut 0.3s ease 1.9s forwards;}
      `}</style>

      <div className="pg">
        <header className="hd">
          <div className="hd-logo">🌲</div>
          <div>
            <div className="hd-brand">VisuoSlayer</div>
            <div className="hd-tagline">BST Visualizer · Write · Run · Step · AI-validated</div>
          </div>
          <div className="hd-r">
            <div className="hd-ds-badge">BST</div>
            <div className="hd-pill" style={{ color:lm.accent, background:`${lm.accent}14`, border:`1px solid ${lm.accent}30` }}>{lm.name}</div>
            <div className="hd-pid">pid:{sessionId}</div>
          </div>
        </header>

        <main className="main">
          {/* LEFT */}
          <div className="panel left">
            <div className="ph">
              <span className="dot" style={{ background:"#ff5f57", boxShadow:"0 0 6px #ff5f57" }}/>
              <span className="dot" style={{ background:"#ffbd2e", boxShadow:"0 0 6px #ffbd2e" }}/>
              <span className="dot" style={{ background:"#28c840", boxShadow:"0 0 6px #28c840" }}/>
              <span className="ptl">Code Editor</span>
              <span style={{ marginLeft:"auto", fontFamily:"'JetBrains Mono',monospace", fontSize:7.5, color:lm.accent, background:`${lm.accent}14`, border:`1px solid ${lm.accent}30`, padding:"2px 8px", borderRadius:18, fontWeight:800 }}>{lm.name}</span>
            </div>

            <div style={{ flex:termOpen?"0 0 58%":"1", display:"flex", flexDirection:"column", minHeight:0, borderBottom:"1px solid var(--border-subtle)" }}>
              {renderLangTabs(false)}
              <CodeEditor code={code} setCode={setCode} step={step} errorLineSet={errorLineSet} onKeyDown={onKeyDown} taRef={taRef}/>
              {step&&os&&<div className="alb" style={{ borderColor:os.bd, background:os.bg }}>
                <span style={{ color:os.c, fontSize:9.5 }}>{os.icon}</span>
                <span className="alb-ln" style={{ color:os.c }}>L{step.lineNum+1}</span>
                <code className="alb-code">{step.codeLine}</code>
              </div>}
              <div className="rr">
                <button className={`btn-run${playing||validating?" running":""}`} onClick={handleRun} disabled={playing||validating}>
                  {validating?"⟳ Validating…":playing?"▶ Running…":"▶  Run & Visualize"}
                </button>
                {(steps.length>0||error||hasAiErrors) && <button className="btn-rst" onClick={doReset}>↺ Reset</button>}
                <span className="rr-hint">CTRL+ENTER</span>
              </div>
            </div>

            <div className={`tm-wrap${termOpen?" tm-open":" tm-closed"}`}>
              <div className="term-body-wrap" key={termOpen?"open":"closed"}>
                <div className="term-bar">
                  <span className="dot" style={{ background:"#ff5f57", boxShadow:"0 0 5px #ff5f57" }}/>
                  <span className="dot" style={{ background:"#ffbd2e", boxShadow:"0 0 5px #ffbd2e" }}/>
                  <span className="dot" style={{ background:"#28c840", boxShadow:"0 0 5px #28c840" }}/>
                  <span style={{ marginLeft:8, fontFamily:"'JetBrains Mono',monospace", fontSize:8, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"1.2px", userSelect:"none" }}>visualoslayer — bash</span>
                  <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:7.5, color:"var(--text-muted)", marginLeft:8 }}>pid:{sessionId}</span>
                  <button className="term-toggle" onClick={() => setTermOpen(false)}>▾</button>
                </div>
                <Terminal lines={termLines} validating={validating} currentStepIndex={idx}/>
              </div>
            </div>

            {!termOpen&&(
              <div className="term-bar-closed" onClick={() => setTermOpen(true)}>
                <span className="dot" style={{ background:"#ff5f57" }}/><span className="dot" style={{ background:"#ffbd2e" }}/><span className="dot" style={{ background:"#28c840" }}/>
                <span style={{ marginLeft:8, fontFamily:"'JetBrains Mono',monospace", fontSize:8, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"1.2px" }}>visualoslayer — bash</span>
                {termLines.some(l=>l.type==="error"||l.type==="stderr")&&<span style={{ marginLeft:8, fontFamily:"'JetBrains Mono',monospace", fontSize:7.5, color:"#f87171", background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.28)", padding:"1px 6px", borderRadius:8 }}>errors</span>}
                {termLines.some(l=>l.type==="success")&&<span style={{ marginLeft:8, fontFamily:"'JetBrains Mono',monospace", fontSize:7.5, color:"var(--green)", background:"var(--green-dim)", border:"1px solid rgba(57,217,138,0.28)", padding:"1px 6px", borderRadius:8 }}>ok</span>}
                <span style={{ marginLeft:"auto", fontFamily:"'JetBrains Mono',monospace", fontSize:8, color:"var(--cyan)", fontWeight:800 }}>▴ open</span>
              </div>
            )}
          </div>

          {/* RIGHT */}
          <div className="panel">
            <div className="ph">
              <span className="dot" style={{ background:"#4cc9f0", boxShadow:"0 0 6px #4cc9f0" }}/>
              <span className="dot" style={{ background:"#f72585", boxShadow:"0 0 6px #f72585" }}/>
              <span className="dot" style={{ background:"#ffd60a", boxShadow:"0 0 6px #ffd60a" }}/>
              <span className="ptl">Visualization</span>
              {steps.length>0&&<span style={{ marginLeft:"auto", fontFamily:"'JetBrains Mono',monospace", fontSize:7.5, color:"var(--cyan)", background:"var(--cyan-dim)", border:"1px solid rgba(76,201,240,0.28)", padding:"2px 9px", borderRadius:18, fontWeight:800 }}>{idx+1}/{steps.length}</span>}
            </div>

            <div style={{ flex:1, display:"flex", flexDirection:"column", minHeight:0, overflow:"hidden", justifyContent:"center", alignItems:"center" }}>
              <div style={{ position:"relative", width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", padding:"24px 20px 16px" }}>
                <div style={{ position:"absolute", inset:0, pointerEvents:"none", backgroundImage:`linear-gradient(rgba(76,201,240,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(76,201,240,0.06) 1px,transparent 1px)`, backgroundSize:"38px 38px", animation:"gridScroll 10s linear infinite" }}/>
                <div style={{ position:"absolute", left:0, right:0, height:70, pointerEvents:"none", zIndex:1, background:"linear-gradient(to bottom,transparent,rgba(76,201,240,0.04),transparent)", animation:"scanline 6s ease-in-out infinite" }}/>
                <div style={{ position:"absolute", width:200, height:200, top:-50, left:20, background:"radial-gradient(circle,rgba(76,201,240,0.12),transparent 65%)", filter:"blur(70px)", pointerEvents:"none", animation:"blobFloat 14s ease-in-out infinite", borderRadius:"50%", mixBlendMode:"screen" }}/>
                <div style={{ position:"absolute", width:160, height:160, bottom:20, right:30, background:"radial-gradient(circle,rgba(247,37,133,0.1),transparent 65%)", filter:"blur(60px)", pointerEvents:"none", animation:"blob2 11s ease-in-out infinite", borderRadius:"50%", mixBlendMode:"screen" }}/>
                <div style={{ position:"relative", zIndex:2, width:"100%" }}>
                  <TreeViz tree={step?.tree??null} highlight={step?.highlight??[]} path={step?.path??[]} animKey={animKey} opType={step?.type} idle={idle} pointerIdx={pointerIdx} deletedNodePos={deletedNodePos}/>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      {toast&&<div className="toast">{toast}</div>}
    </>
  );
}