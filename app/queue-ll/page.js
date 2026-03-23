"use client";

import { useState, useRef, useEffect, useCallback } from "react";

// ══════════════════════════════════════════════════════════════════════════════
// COLOR SYSTEM (reused from stack)
// ══════════════════════════════════════════════════════════════════════════════
const PALETTE = [
  { g1:"#4facfe", g2:"#00f2fe", glow:"rgba(79,172,254,0.6)",  border:"#4facfe" },
  { g1:"#f093fb", g2:"#f5576c", glow:"rgba(245,87,108,0.6)",  border:"#f5576c" },
  { g1:"#43e97b", g2:"#38f9d7", glow:"rgba(67,233,123,0.6)",  border:"#43e97b" },
  { g1:"#fda085", g2:"#f6d365", glow:"rgba(246,211,101,0.6)", border:"#fda085" },
  { g1:"#a18cd1", g2:"#fbc2eb", glow:"rgba(161,140,209,0.6)", border:"#a18cd1" },
  { g1:"#30cfd0", g2:"#667eea", glow:"rgba(102,126,234,0.6)", border:"#30cfd0" },
  { g1:"#ff9966", g2:"#ff5e62", glow:"rgba(255,94,98,0.6)",   border:"#ff9966" },
  { g1:"#89f7fe", g2:"#66a6ff", glow:"rgba(102,166,255,0.6)", border:"#89f7fe" },
];
const col = (v) => PALETTE[Math.abs(Math.round(v) || 0) % PALETTE.length];

const OP = {
  enqueue:      { label:"ENQUEUE",    icon:"⬇", c:"#4ade80", bg:"rgba(74,222,128,0.1)",  bd:"rgba(74,222,128,0.35)"  },
  dequeue:      { label:"DEQUEUE",    icon:"⬆", c:"#f472b6", bg:"rgba(244,114,182,0.1)", bd:"rgba(244,114,182,0.35)" },
  dequeue_error:{ label:"UNDERFLOW", icon:"⚠", c:"#ef4444", bg:"rgba(239,68,68,0.1)",   bd:"rgba(239,68,68,0.35)"   },
  front:        { label:"FRONT",      icon:"👁", c:"#fbbf24", bg:"rgba(251,191,36,0.1)",  bd:"rgba(251,191,36,0.35)"  },
  front_error:  { label:"EMPTY",      icon:"⚠", c:"#ef4444", bg:"rgba(239,68,68,0.1)",   bd:"rgba(239,68,68,0.35)"   },
  isEmpty:      { label:"IS EMPTY?",  icon:"∅", c:"#60a5fa", bg:"rgba(96,165,250,0.1)",  bd:"rgba(96,165,250,0.35)"  },
  size:         { label:"SIZE",       icon:"#", c:"#a78bfa", bg:"rgba(167,139,250,0.1)", bd:"rgba(167,139,250,0.35)" },
};

// ──────────────────────────────────────────────────────────────────────────────
// LANGUAGE SUPPORT (ordered: C, C++, Java, Go, Python, JavaScript)
// ──────────────────────────────────────────────────────────────────────────────
const LANGS = {
  c:          { name:"C",          ext:"C",   accent:"#a8daff" },
  cpp:        { name:"C++",        ext:"C++", accent:"#00b4d8" },
  java:       { name:"Java",       ext:"JV",  accent:"#ed8b00" },
  go:         { name:"Go",         ext:"GO",  accent:"#00add8" },
  python:     { name:"Python",     ext:"PY",  accent:"#4ec9b0" },
  javascript: { name:"JavaScript", ext:"JS",  accent:"#f7df1e" },
};

const LINE_H = 21;

// ══════════════════════════════════════════════════════════════════════════════
// QUEUE CODE TEMPLATES (complete working implementations)
// ══════════════════════════════════════════════════════════════════════════════
const TPL = {
c: `// Queue implementation — C (circular buffer)
#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>

#define MAX 100

typedef struct {
    int items[MAX];
    int front;
    int rear;
} Queue;

void initQueue(Queue* q) {
    q->front = 0;
    q->rear = -1;
}

void enqueue(Queue* q, int value) {
    if (q->rear >= MAX - 1) return; // overflow
    q->items[++(q->rear)] = value;
}

int dequeue(Queue* q) {
    if (q->front > q->rear) return -1; // underflow
    return q->items[(q->front)++];
}

int front(Queue* q) {
    if (q->front > q->rear) return -1;
    return q->items[q->front];
}

bool isEmpty(Queue* q) {
    return q->front > q->rear;
}

int size(Queue* q) {
    return q->rear - q->front + 1;
}

int main() {
    Queue q;
    initQueue(&q);
    enqueue(&q, 10);
    enqueue(&q, 25);
    enqueue(&q, 37);
    front(&q);
    dequeue(&q);
    enqueue(&q, 99);
    enqueue(&q, 4);
    isEmpty(&q);
    dequeue(&q);
    dequeue(&q);
    return 0;
}`,

cpp: `// Queue implementation — C++ (using std::queue, but we implement our own for clarity)
#include <iostream>
#include <vector>
using namespace std;

class Queue {
private:
    vector<int> items;
public:
    void enqueue(int value) {
        items.push_back(value);
    }

    int dequeue() {
        if (isEmpty()) return -1;
        int frontVal = items[0];
        items.erase(items.begin());
        return frontVal;
    }

    int front() {
        if (isEmpty()) return -1;
        return items[0];
    }

    bool isEmpty() {
        return items.empty();
    }

    int size() {
        return items.size();
    }
};

int main() {
    Queue q;
    q.enqueue(10);
    q.enqueue(25);
    q.enqueue(37);
    q.front();
    q.dequeue();
    q.enqueue(99);
    q.enqueue(42);
    q.isEmpty();
    return 0;
}`,

java: `// Queue implementation — Java (using ArrayList)
import java.util.ArrayList;

public class Main {
    static class Queue<T> {
        private ArrayList<T> items = new ArrayList<>();

        public void enqueue(T element) {
            items.add(element);
        }

        public T dequeue() {
            if (isEmpty()) return null;
            return items.remove(0);
        }

        public T front() {
            if (isEmpty()) return null;
            return items.get(0);
        }

        public boolean isEmpty() {
            return items.isEmpty();
        }

        public int size() {
            return items.size();
        }
    }

    public static void main(String[] args) {
        Queue<Integer> q = new Queue<>();
        q.enqueue(10);
        q.enqueue(25);
        q.enqueue(37);
        q.front();
        q.dequeue();
        q.enqueue(99);
        q.enqueue(42);
        q.isEmpty();
    }
}`,

go: `// Queue implementation — Go (slice‑based)
package main

import "fmt"

type Queue struct {
    items []int
}

func (q *Queue) Enqueue(value int) {
    q.items = append(q.items, value)
}

func (q *Queue) Dequeue() (int, bool) {
    if q.IsEmpty() {
        return 0, false
    }
    front := q.items[0]
    q.items = q.items[1:]
    return front, true
}

func (q *Queue) Front() (int, bool) {
    if q.IsEmpty() {
        return 0, false
    }
    return q.items[0], true
}

func (q *Queue) IsEmpty() bool {
    return len(q.items) == 0
}

func (q *Queue) Size() int {
    return len(q.items)
}

func main() {
    q := &Queue{}
    q.Enqueue(10)
    q.Enqueue(25)
    q.Enqueue(37)
    q.Front()
    q.Dequeue()
    q.Enqueue(99)
    q.Enqueue(42)
    q.IsEmpty()
    fmt.Println("Done")
}`,

python: `# Queue implementation — Python
class Queue:
    def __init__(self):
        self.items = []

    def enqueue(self, element):
        self.items.append(element)

    def dequeue(self):
        if self.is_empty():
            return None
        return self.items.pop(0)

    def front(self):
        if self.is_empty():
            return None
        return self.items[0]

    def is_empty(self):
        return len(self.items) == 0

    def size(self):
        return len(self.items)

q = Queue()
q.enqueue(10)
q.enqueue(25)
q.enqueue(37)
q.front()
q.dequeue()
q.enqueue(99)
q.enqueue(42)
q.is_empty()`,

javascript: `// Queue implementation — JavaScript
class Queue {
    constructor() {
        this.items = [];
    }

    enqueue(element) {
        this.items.push(element);
    }

    dequeue() {
        if (this.isEmpty()) return undefined;
        return this.items.shift();
    }

    front() {
        if (this.isEmpty()) return undefined;
        return this.items[0];
    }

    isEmpty() {
        return this.items.length === 0;
    }

    get size() {
        return this.items.length;
    }
}

const q = new Queue();
q.enqueue(10);
q.enqueue(25);
q.enqueue(37);
q.front();
q.dequeue();
q.enqueue(99);
q.enqueue(4);
q.isEmpty();
q.dequeue();
q.dequeue();`,
};

// ══════════════════════════════════════════════════════════════════════════════
// C PARSER (Queue version)
// ══════════════════════════════════════════════════════════════════════════════
function parseCQueue(code) {
  const steps = [];
  const queue = [];
  const lines = code.split("\n");

  // Find main() body
  const mainMatch = code.match(/int\s+main\s*\([^)]*\)\s*\{([\s\S]*)/);
  if (!mainMatch) {
    return { steps: [], errors: ["No main() function found. Add a main() that calls enqueue/dequeue/front/isEmpty/size."] };
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

  // Patterns
  const enqueueRe = /\b(enqueue|Enqueue|add|push)\s*\(\s*&?\w+\s*,\s*(-?[\d.]+)\s*\)/;
  const dequeueRe = /\b(dequeue|Dequeue|pop|remove)\s*\(\s*&?\w+\s*\)/;
  const frontRe   = /\b(front|Front|peek|top|first|head)\s*\(\s*&?\w+\s*\)/;
  const isEmptyRe = /\b(isEmpty|IsEmpty|empty)\s*\(\s*&?\w+\s*\)/;
  const sizeRe    = /\b(size|Size|length)\s*\(\s*&?\w+\s*\)/;

  for (let li = 0; li < mainLines.length; li++) {
    const line = mainLines[li].trim();
    if (!line || line.startsWith("//") || line.startsWith("*") || line.startsWith("#")) continue;

    const originalLineNum = mainBodyStartLine + li;
    const codeLine = lines[originalLineNum] ?? mainLines[li];

    // Enqueue
    const enqMatch = line.match(enqueueRe);
    if (enqMatch) {
      const v = parseFloat(enqMatch[2]);
      queue.push(v);
      steps.push({
        type: "enqueue", value: v, queue: [...queue],
        lineNum: originalLineNum, codeLine: codeLine,
        message: buildMessage({ type: "enqueue", value: v, queue: [...queue] })
      });
      continue;
    }

    // Dequeue
    if (dequeueRe.test(line)) {
      if (queue.length === 0) {
        steps.push({
          type: "dequeue_error", value: null, queue: [],
          lineNum: originalLineNum, codeLine: codeLine,
          message: buildMessage({ type: "dequeue_error" })
        });
      } else {
        const v = queue.shift();
        steps.push({
          type: "dequeue", value: v, queue: [...queue],
          lineNum: originalLineNum, codeLine: codeLine,
          message: buildMessage({ type: "dequeue", value: v, queue: [...queue] })
        });
      }
      continue;
    }

    // Front
    if (frontRe.test(line)) {
      if (queue.length === 0) {
        steps.push({
          type: "front_error", value: null, queue: [],
          lineNum: originalLineNum, codeLine: codeLine,
          message: buildMessage({ type: "front_error" })
        });
      } else {
        const v = queue[0];
        steps.push({
          type: "front", value: v, queue: [...queue],
          lineNum: originalLineNum, codeLine: codeLine,
          message: buildMessage({ type: "front", value: v, queue: [...queue] })
        });
      }
      continue;
    }

    // isEmpty
    if (isEmptyRe.test(line)) {
      const e = queue.length === 0;
      steps.push({
        type: "isEmpty", result: e, queue: [...queue],
        lineNum: originalLineNum, codeLine: codeLine,
        message: buildMessage({ type: "isEmpty", result: e, queue: [...queue] })
      });
      continue;
    }

    // size
    if (sizeRe.test(line)) {
      steps.push({
        type: "size", result: queue.length, queue: [...queue],
        lineNum: originalLineNum, codeLine: codeLine,
        message: buildMessage({ type: "size", result: queue.length, queue: [...queue] })
      });
      continue;
    }
  }

  if (!steps.length) {
    return { steps: [], errors: ["No queue operations detected in main().\nCall enqueue(&q,N), dequeue(&q), front(&q), isEmpty(&q), or size(&q)."] };
  }
  return { steps, errors: [] };
}

// ══════════════════════════════════════════════════════════════════════════════
// JAVASCRIPT REAL EXECUTION ENGINE (Queue version)
// ══════════════════════════════════════════════════════════════════════════════
function runJavaScript(code) {
  const classMatch = /\bclass\s+(\w+)/.exec(code);
  if (!classMatch) {
    return { steps: [], errors: ["No class definition found.\nWrite a Queue class with enqueue / dequeue / front / isEmpty methods, then use it below."] };
  }
  const className = classMatch[1];

  // Find data field (usually this.items)
  const fieldMatch = /this\.(\w+)\s*=\s*(?:\[\s*\]|new\s+Array\s*\(\s*\))/.exec(code);
  const field = fieldMatch?.[1] ?? "items";

  const classBlock = extractClassBlock(code, className);
  if (!classBlock) {
    return { steps: [], errors: [`Could not parse class '${className}'.`] };
  }
  const execCode = code.slice(0, classBlock.start) + "\n" + code.slice(classBlock.end);

  const instrumented = `
"use strict";
const __Q = [];
class ${className} {
  constructor() { this.${field} = []; }

  enqueue(v) {
    this.${field}.push(v);
    __Q.push({ type:"enqueue", value:v, queue:[...this.${field}] });
  }

  dequeue() {
    if (this.${field}.length === 0) {
      __Q.push({ type:"dequeue_error", value:null, queue:[] });
      return undefined;
    }
    const v = this.${field}.shift();
    __Q.push({ type:"dequeue", value:v, queue:[...this.${field}] });
    return v;
  }

  front() {
    if (this.${field}.length === 0) {
      __Q.push({ type:"front_error", value:null, queue:[] });
      return undefined;
    }
    const v = this.${field}[0];
    __Q.push({ type:"front", value:v, queue:[...this.${field}] });
    return v;
  }

  peek()   { return this.front(); } // alias
  top()    { return this.front(); } // alias

  isEmpty() {
    const e = this.${field}.length === 0;
    __Q.push({ type:"isEmpty", result:e, queue:[...this.${field}] });
    return e;
  }

  get size()   { return this.${field}.length; }
  get length() { return this.${field}.length; }
  toString()   { return "[Queue: " + this.${field}.join(", ") + "]"; }
}

${execCode}
return __Q;
`.trim();

  let rawSteps;
  try {
    const stubConsole = { log: () => {}, warn: () => {}, error: () => {}, info: () => {} };
    const fn = new Function("console", instrumented);
    rawSteps = fn(stubConsole);
  } catch (e) {
    return { steps: [], errors: [e.message] };
  }

  if (!rawSteps?.length) {
    return { steps: [], errors: ["No queue operations were executed.\nCall enqueue(), dequeue(), front(), or isEmpty() on your queue instance after the class definition."] };
  }

  const lines = code.split("\n");
  const callLineNums = [];
  let charCursor = 0, classEndLine = 0;
  for (let i = 0; i < lines.length; i++) {
    if (charCursor >= classBlock.end) { classEndLine = i; break; }
    charCursor += lines[i].length + 1;
  }
  for (let i = classEndLine; i < lines.length; i++) {
    const t = lines[i].trim();
    if (t.startsWith("//") || t.startsWith("*") || t.startsWith("/*")) continue;
    if (/\.(enqueue|dequeue|front|peek|top|isEmpty|is_empty|empty|size)\s*\(/.test(t)) {
      callLineNums.push(i);
    }
  }

  const steps = rawSteps.map((s, idx) => ({
    ...s,
    lineNum:  callLineNums[idx] ?? classEndLine,
    codeLine: lines[callLineNums[idx] ?? classEndLine]?.trim() ?? "",
    message:  buildMessage(s),
  }));

  return { steps, errors: [] };
}

// ══════════════════════════════════════════════════════════════════════════════
// BRACE-COUNTING UTILITIES (reused)
// ══════════════════════════════════════════════════════════════════════════════
function countBraces(line) {
  let opens = 0, closes = 0;
  let inStr = false, strChar = "";
  const commentIdx = line.indexOf("//");
  const cleaned = commentIdx >= 0 ? line.slice(0, commentIdx) : line;
  for (let i = 0; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (!inStr && (ch === '"' || ch === "'" || ch === "`")) { inStr = true; strChar = ch; continue; }
    if (inStr && ch === strChar && cleaned[i - 1] !== "\\") { inStr = false; continue; }
    if (!inStr) {
      if (ch === "{") opens++;
      else if (ch === "}") closes++;
    }
  }
  return { opens, closes };
}

function extractClassBlock(code, className) {
  const re = new RegExp(`\\bclass\\s+${className}(?:\\s+[^{]*)?\\{`);
  const match = re.exec(code);
  if (!match) return null;
  let depth = 1, i = match.index + match[0].length;
  while (i < code.length && depth > 0) {
    if (code[i] === "{") depth++;
    else if (code[i] === "}") depth--;
    i++;
  }
  return { text: code.slice(match.index, i), start: match.index, end: i };
}

// ══════════════════════════════════════════════════════════════════════════════
// SCOPE-AWARE PARSER (Queue version)
// ══════════════════════════════════════════════════════════════════════════════
function parseScoped(code, lang) {
  if (lang === "python") return parsePython(code);
  return parseBraced(code, lang);
}

function parsePython(code) {
  const lines = code.split("\n");
  const execLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const indent = line.match(/^(\s*)/)?.[1]?.length ?? 0;
    if (indent === 0 &&
        !trimmed.startsWith("class ") &&
        !trimmed.startsWith("def ") &&
        !trimmed.startsWith("import ") &&
        !trimmed.startsWith("from ") &&
        !trimmed.startsWith("if __name__")) {
      execLines.push({ lineIdx: i, line: trimmed });
    }
    if (i > 0 && lines[i-1].trim().includes("__main__") && indent === 4) {
      execLines.push({ lineIdx: i, line: trimmed });
    }
  }

  return simulateOps(execLines, code.split("\n"), lang);
}

function parseBraced(code, lang) {
  const lines = code.split("\n");
  const execLines = [];

  let depth = 0;
  let inClass = false, classDepth = -1;
  let inMain = false, mainDepth = -1;
  let mlComment = false;

  const needsMain = ["java", "cpp", "csharp", "go", "rust"];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (mlComment) {
      if (trimmed.includes("*/")) mlComment = false;
      continue;
    }
    if (trimmed.startsWith("/*")) { mlComment = true; continue; }
    if (trimmed.startsWith("//") || trimmed.startsWith("*") || trimmed.startsWith("#")) continue;
    if (!trimmed) continue;

    const { opens, closes } = countBraces(line);
    const depthBefore = depth;
    depth += opens - closes;

    if (/\bclass\s+\w+/.test(trimmed)) {
      inClass = true;
      classDepth = depthBefore;
    }
    if (needsMain.includes(lang)) {
      if (/\bmain\s*\(/.test(trimmed) || /\bfunc\s+main\s*\(/.test(trimmed)) {
        inMain = true;
        mainDepth = depthBefore;
      }
    }
    if (inClass && depth <= classDepth) { inClass = false; classDepth = -1; }
    if (inMain  && depth <= mainDepth)  { inMain  = false; mainDepth  = -1; }

    const isExec = needsMain.includes(lang)
      ? (inMain && depth === mainDepth + 1 && !inClass)
      : (lang === "javascript" || lang === "typescript")
        ? (depth === 0 && !inClass)
        : true;

    if (isExec) execLines.push({ lineIdx: i, line: trimmed });
  }

  return simulateOps(execLines, lines, lang);
}

function simulateOps(execLines, allLines, lang) {
  const steps = [], errors = [], queue = [];

  // Regex patterns (case‑insensitive, with optional integer)
  const ENQUEUE_RE = [
    /\.(?:enqueue|Enqueue|add|append|push_back)\s*\(\s*(-?[\d.]+)\s*\)/,
    /\bappend\s*\(\s*\w+\s*,\s*(-?[\d.]+)\s*\)/, // Go append(q.items, N)
  ];
  const DEQUEUE_RE = /\.(?:dequeue|Dequeue|pop_front|remove_first|poll|shift)\s*\(\s*\)/;
  const FRONT_RE   = /\.(?:front|Front|peek|Peek|first|First|head|Head)\s*\(\s*\)/;
  const EMPTY_RE   = /\.(?:isEmpty|IsEmpty|is_empty|empty|Empty)\s*\(\s*\)/;
  const SIZE_RE    = /\.(?:size|Size|length|Length|count|Count)\s*\(\s*\)/;

  for (const { lineIdx, line } of execLines) {
    const origLine = allLines[lineIdx]?.trim() ?? line;

    // Enqueue
    let enqVal = null;
    for (const re of ENQUEUE_RE) {
      const m = line.match(re);
      if (m) { enqVal = parseFloat(m[1]); break; }
    }
    if (enqVal !== null && !isNaN(enqVal)) {
      queue.push(enqVal);
      steps.push({ type:"enqueue", value:enqVal, queue:[...queue], lineNum:lineIdx, codeLine:origLine, message:buildMessage({type:"enqueue",value:enqVal,queue:[...queue]}) });
      continue;
    }

    // Dequeue
    if (DEQUEUE_RE.test(line)) {
      if (queue.length === 0) {
        steps.push({ type:"dequeue_error", value:null, queue:[], lineNum:lineIdx, codeLine:origLine, message:buildMessage({type:"dequeue_error"}) });
      } else {
        const v = queue.shift();
        steps.push({ type:"dequeue", value:v, queue:[...queue], lineNum:lineIdx, codeLine:origLine, message:buildMessage({type:"dequeue",value:v,queue:[...queue]}) });
      }
      continue;
    }

    // Front
    if (FRONT_RE.test(line)) {
      if (queue.length === 0) {
        steps.push({ type:"front_error", value:null, queue:[], lineNum:lineIdx, codeLine:origLine, message:buildMessage({type:"front_error"}) });
      } else {
        const v = queue[0];
        steps.push({ type:"front", value:v, queue:[...queue], lineNum:lineIdx, codeLine:origLine, message:buildMessage({type:"front",value:v,queue:[...queue]}) });
      }
      continue;
    }

    // IsEmpty
    if (EMPTY_RE.test(line)) {
      const e = queue.length === 0;
      steps.push({ type:"isEmpty", result:e, queue:[...queue], lineNum:lineIdx, codeLine:origLine, message:buildMessage({type:"isEmpty",result:e,queue:[...queue]}) });
      continue;
    }

    // Size
    if (SIZE_RE.test(line)) {
      steps.push({ type:"size", result:queue.length, queue:[...queue], lineNum:lineIdx, codeLine:origLine, message:buildMessage({type:"size",result:queue.length,queue:[...queue]}) });
      continue;
    }
  }

  if (steps.length === 0) {
    errors.push("No queue operations detected in the execution body.\nMake sure you call enqueue(N), dequeue(), front(), isEmpty() or size() on your queue instance.\nValues must be numeric literals, e.g. enqueue(42).");
  }

  return { steps, errors };
}

function buildMessage(s) {
  switch (s.type) {
    case "enqueue":       return `enqueue(${s.value})  →  added ${s.value} to back · queue size: ${s.queue?.length}`;
    case "dequeue":       return `dequeue()  →  removed ${s.value} from front · queue size: ${s.queue?.length}`;
    case "dequeue_error": return `dequeue()  →  ⚠ Queue Underflow! Cannot dequeue from an empty queue.`;
    case "front":         return `front()  →  front element is ${s.value}  ·  queue unchanged`;
    case "front_error":   return `front()  →  ⚠ Queue is empty! Nothing to see at the front.`;
    case "isEmpty":       return `isEmpty()  →  ${s.result}  ·  queue has ${s.queue?.length ?? 0} element${s.queue?.length !== 1 ? "s" : ""}`;
    case "size":          return `size()  →  ${s.result}  ·  queue has ${s.result} element${s.result !== 1 ? "s" : ""}`;
    default:              return "";
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// AI VALIDATION (Queue version)
// ══════════════════════════════════════════════════════════════════════════════
async function validateWithAI(code, lang) {
  if (code.trim().length < 10) {
    return { valid: false, reason: "Code is empty.", errors: [{ line: 1, message: "Write a Queue implementation first." }], apiError: null };
  }

  const prompt = `You are a strict code reviewer for a Queue data-structure visualizer.

The user has written a Queue implementation in ${lang}. Your job:
1. Check if it is a CORRECT and COMPLETE Queue implementation with at least enqueue and dequeue.
2. Look for logic bugs: wrong FIFO order, dequeue not removing from front, front returning wrong element, isEmpty wrong condition, etc.
3. Look for syntax errors that would prevent execution.

Return ONLY valid JSON — no markdown, no explanation outside the JSON:
{
  "valid": true | false,
  "reason": "one sentence summary",
  "errors": [
    { "line": <1-based line number>, "message": "<what is wrong on this line>" }
  ]
}

If valid is true, errors array must be empty [].
If valid is false, include at least one error with the exact line number (1-based) and a clear message.

Here is the code:
\`\`\`${lang}
${code}
\`\`\``;

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [{ role: "user", content: prompt }] }),
    });
    const data = await res.json();

    if (data.error) {
      return { valid: true, reason: `AI unavailable: ${data.error}`, errors: [], apiError: data.error };
    }

    const raw = data.content ?? "";
    const cleaned = raw.replace(/```json|```/gi, "").trim();
    const parsed = JSON.parse(cleaned);

    return {
      valid:    !!parsed.valid,
      reason:   parsed.reason   ?? "",
      errors:   Array.isArray(parsed.errors) ? parsed.errors : [],
      apiError: null,
    };
  } catch (e) {
    return { valid: true, reason: "", errors: [], apiError: e.message };
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// MASTER ENTRY POINT
// ══════════════════════════════════════════════════════════════════════════════
function runCode(code, lang) {
  const trimmed = code.trim();
  if (!trimmed) return { steps: [], errors: ["Please write some code first."] };

  if (lang === "c") return parseCQueue(code);
  if (lang === "javascript") return runJavaScript(code);
  return parseScoped(code, lang);
}

// ══════════════════════════════════════════════════════════════════════════════
// QUEUE VISUALIZATION COMPONENT (horizontal, mobile-optimized)
// ══════════════════════════════════════════════════════════════════════════════
function QueueViz({ step, animKey, idle, compact }) {
  const [flyItem, setFlyItem] = useState(null);

  useEffect(() => {
    if (step?.type === "dequeue" && step.value !== null && step.value !== undefined) {
      setFlyItem({ v: step.value, key: animKey });
      const t = setTimeout(() => setFlyItem(null), 800);
      return () => clearTimeout(t);
    }
    if (step?.type !== "dequeue") setFlyItem(null);
  }, [animKey, step?.type]);

  const queue   = step?.queue ?? [];
  const isEnq   = step?.type === "enqueue";
  const isFront = step?.type === "front";
  const isEmpty = step?.type === "isEmpty";
  const isErr   = step?.type === "dequeue_error" || step?.type === "front_error";
  const frontVal = queue.length ? queue[0] : null;

  // Metrics strip (same as stack but with Front/Back)
  const metrics = [
    { lbl:"SIZE",   val: queue.length,                         c:"#60a5fa" },
    { lbl:"FRONT",  val: frontVal ?? "—",                     c:"#fbbf24" },
    { lbl:"BACK",   val: queue.length ? queue[queue.length-1] : "—", c:"#4ade80" },
    { lbl:"POLICY", val: "FIFO",                               c:"#a78bfa" },
  ];

  // Responsive block sizes
  const blockHeight = compact ? 44 : 58;
  const blockMinWidth = compact ? 70 : 90;
  const fontSizeVal = compact ? 16 : 18;
  const fontSizeIdx = compact ? 7 : 8.5;
  const fontSizeTag = compact ? 6.5 : 8;

  return (
    <div className={`qv${isErr ? " qv-err" : ""}`} key={isErr ? `e${animKey}` : "qv"}>

      {/* Metrics bar */}
      <div className="qv-metrics">
        {metrics.map((m, mi) => (
          <div className="qv-m" key={m.lbl}>
            <span className="qv-ml">{m.lbl}</span>
            <span className="qv-mv" style={{ color:m.c, fontSize: compact ? "12px" : "15px" }}>
              {String(m.val)}
            </span>
          </div>
        ))}
      </div>

      {/* Horizontal queue row */}
      <div className="qv-row">
        <div className="qv-front-tag">FRONT →</div>
        <div className="qv-items">
          {queue.length === 0 && !flyItem ? (
            <div className={`qv-empty${isErr ? " qv-empty-err" : ""}`}>
              <div className="qv-ei">{idle ? "📚" : isErr ? "⚠" : "∅"}</div>
              <div className="qv-et">{idle ? "Run code to start" : isErr ? "Queue underflow!" : "Queue is empty"}</div>
            </div>
          ) : queue.map((v, idx) => {
            const isFirst = idx === 0;
            const isLast  = idx === queue.length - 1;
            const isNew   = isLast && isEnq;
            const pk      = isFirst && isFront;
            const c       = col(v);
            return (
              <div
                key={`${v}-${idx}-${isNew ? animKey : "s"}`}
                className={[
                  "qv-block",
                  isNew ? "qv-enq" : "",
                  pk ? "qv-front" : "",
                  isFirst ? "qv-first" : "",
                  isLast ? "qv-last" : ""
                ].filter(Boolean).join(" ")}
                style={{
                  height: `${blockHeight}px`,
                  minWidth: `${blockMinWidth}px`,
                  background: `linear-gradient(135deg,${c.g1},${c.g2})`,
                  boxShadow: isFirst
                    ? `0 0 36px ${c.glow}, 0 6px 20px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.22)`
                    : `0 4px 14px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.12)`,
                  borderColor: isFirst ? c.border : "rgba(255,255,255,0.08)",
                }}
              >
                {pk && <div className="qv-pk-ring"  key={`r1-${animKey}`} style={{ borderColor: c.border }} />}
                {pk && <div className="qv-pk-ring2" key={`r2-${animKey}`} style={{ borderColor: c.border }} />}
                <span className="qv-bidx" style={{ fontSize: fontSizeIdx }}>[{idx}]</span>
                <span className="qv-bval" style={{ fontSize: fontSizeVal }}>{v}</span>
                {isFirst && <span className="qv-btag" style={{ fontSize: fontSizeTag }}>← FRONT</span>}
                {isLast && !isFirst && <span className="qv-btag back" style={{ fontSize: fontSizeTag }}>BACK →</span>}
              </div>
            );
          })}
          {flyItem && (
            <div key={flyItem.key} className="qv-fly"
              style={{
                height: `${blockHeight}px`,
                minWidth: `${blockMinWidth}px`,
                background: `linear-gradient(135deg,${col(flyItem.v).g1},${col(flyItem.v).g2})`,
                boxShadow: `0 0 40px ${col(flyItem.v).glow}`,
              }}>
              <span className="qv-fly-v" style={{ fontSize: fontSizeVal }}>{flyItem.v}</span>
              <span className="qv-fly-tag">← DEQUEUE</span>
            </div>
          )}
        </div>
        <div className="qv-back-tag">← BACK</div>
      </div>

      {/* Platform */}
      <div className="qv-plat"><div className="qv-plat-shine" /></div>
      <p className="qv-base">▲ FIFO QUEUE</p>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// useIsMobile (unchanged)
// ══════════════════════════════════════════════════════════════════════════════
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

// ══════════════════════════════════════════════════════════════════════════════
// Terminal (unchanged)
// ══════════════════════════════════════════════════════════════════════════════
function Terminal({ lines, sessionId, validating, currentStepIndex }) {
  const bodyRef = useRef(null);
  const lineRefs = useRef({});
  useEffect(() => {
    if (currentStepIndex === undefined || currentStepIndex === -1) return;
    lineRefs.current[currentStepIndex]?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [currentStepIndex]);
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [lines, validating]);

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", background:"#06080f", minHeight:0, fontFamily:"'JetBrains Mono',monospace", fontSize:"11px" }}>
      <div ref={bodyRef} style={{ flex:1, overflowY:"auto", padding:"10px 0 10px", scrollbarWidth:"thin", scrollbarColor:"rgba(96,165,250,0.2) transparent" }}>
        {lines.length === 0 && !validating && (
          <div style={{ padding:"3px 16px", display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ color:"#4ade80", userSelect:"none" }}>$</span>
            <span style={{ animation:"cur 1.1s step-end infinite", color:"#1a2a1a", marginLeft:4 }}>_</span>
          </div>
        )}
        {lines.map((line, i) => (
          <TermLine key={i} line={line} isLast={i === lines.length - 1 && !validating} stepIndex={line.stepIndex} currentStepIndex={currentStepIndex} lineRef={el => lineRefs.current[line.stepIndex] = el} />
        ))}
        {validating && (
          <div style={{ padding:"3px 16px", display:"flex", alignItems:"center", gap:9 }}>
            <span style={{ display:"inline-block", width:10, height:10, borderRadius:"50%", border:"1.5px solid rgba(96,165,250,0.18)", borderTopColor:"#60a5fa", animation:"spin 0.7s linear infinite", flexShrink:0 }} />
            <span style={{ color:"#3a5070", fontSize:10 }}>VisuoSlayer reviewing…</span>
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
  if (line.type === "separator") return <div style={{ margin:"5px 16px", borderTop:"1px solid rgba(255,255,255,0.05)", opacity:vis?1:0, transition:"opacity 0.12s" }} />;
  if (line.type === "blank") return <div style={{ height:6 }} />;
  if (line.type === "prompt") return (
    <div style={{ padding:"2px 16px", display:"flex", alignItems:"center", gap:7, opacity:vis?1:0, transition:"opacity 0.1s" }}>
      <span style={{ color:"#4ade80", userSelect:"none", flexShrink:0 }}>$</span>
      <span style={{ color:"#3a6090", fontSize:10, wordBreak:"break-all" }}>{line.text}</span>
    </div>
  );
  const cm = { enqueue:"#4ade80", dequeue:"#f472b6", front:"#fbbf24", isEmpty:"#60a5fa", size:"#a78bfa", dequeue_error:"#f87171", front_error:"#f87171", error:"#f87171", stderr:"#f87171", success:"#4ade80", warn:"#fbbf24", info:"#60a5fa", output:"#3a4e6a", stdout:"#4a607a" };
  const pm = { error:"✗", stderr:"✗", dequeue_error:"✗", front_error:"✗", success:"✓", warn:"⚠", info:"·", enqueue:"⬇", dequeue:"⬆", front:"👁", isEmpty:"∅", size:"#", output:"", stdout:"" };
  const c = cm[line.type] ?? "#3a5070";
  const pfx = pm[line.type] ?? "";
  return (
    <div ref={lineRef} style={{ padding:"1.5px 16px", display:"flex", alignItems:"flex-start", opacity:vis?1:0, transition:"opacity 0.09s", background:isActive?"rgba(96,165,250,0.1)":"transparent", borderLeft:isActive?"2px solid #60a5fa":"2px solid transparent" }}>
      <span style={{ color:c, width:18, flexShrink:0, fontSize:9, paddingTop:2 }}>{pfx}</span>
      <span style={{ color:c, wordBreak:"break-word", lineHeight:1.65, flex:1, fontSize:10 }}>
        {line.text}
        {isLast && <span style={{ animation:"cur 1.1s step-end infinite", color:"#1e2535" }}> _</span>}
      </span>
      {line.lineNum && <span style={{ marginLeft:8, color:"#2a3a50", fontSize:8, flexShrink:0, paddingTop:3 }}>:{line.lineNum}</span>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Code Editor (unchanged)
// ══════════════════════════════════════════════════════════════════════════════
function CodeEditor({ code, setCode, step, errorLineSet, onKeyDown, taRef }) {
  const lnRef = useRef(null);
  const lines = code.split("\n");
  const syncScroll = useCallback(() => {
    if (taRef.current && lnRef.current) lnRef.current.scrollTop = taRef.current.scrollTop;
  }, [taRef]);
  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.addEventListener("scroll", syncScroll, { passive: true });
    return () => ta.removeEventListener("scroll", syncScroll);
  }, [syncScroll]);

  return (
    <div style={{ flex:1, display:"flex", minHeight:0, overflow:"hidden", position:"relative" }}>
      <div ref={lnRef} style={{ width:38, flexShrink:0, background:"rgba(4,7,18,0.75)", borderRight:"1px solid rgba(255,255,255,0.05)", overflowY:"hidden", overflowX:"hidden", paddingTop:14, paddingBottom:14, display:"flex", flexDirection:"column", userSelect:"none", pointerEvents:"none", scrollbarWidth:"none", msOverflowStyle:"none" }}>
        {lines.map((_, i) => {
          const isAct = step?.lineNum === i, isErr = errorLineSet.has(i);
          return (
            <div key={i} style={{ height:LINE_H, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"flex-end", paddingRight:7, fontFamily:"'JetBrains Mono',monospace", fontSize:9, lineHeight:1, color:isErr?"#f87171":isAct?"#60a5fa":"#2a3a54", background:isErr?"rgba(248,113,113,0.07)":isAct?"rgba(96,165,250,0.07)":"transparent", borderRadius:3, transition:"color 0.15s,background 0.15s" }}>
              {i + 1}
            </div>
          );
        })}
      </div>
      {step && (
        <div style={{ position:"absolute", left:38, right:0, height:LINE_H, top:14+step.lineNum*LINE_H, background:"rgba(96,165,250,0.04)", borderLeft:"2px solid rgba(96,165,250,0.4)", pointerEvents:"none", transition:"top 0.2s cubic-bezier(0.4,0,0.2,1)", zIndex:1 }} />
      )}
      {[...errorLineSet].map((i) => (
        <div key={`e${i}`} style={{ position:"absolute", left:38, right:0, height:LINE_H, top:14+i*LINE_H, background:"rgba(248,113,113,0.05)", borderLeft:"2px solid rgba(248,113,113,0.45)", pointerEvents:"none", zIndex:1 }} />
      ))}
      <textarea
        ref={taRef}
        style={{ flex:1, padding:"14px 12px 14px 10px", background:"transparent", border:"none", outline:"none", color:"#7ecfff", fontFamily:"'JetBrains Mono',monospace", fontSize:11, lineHeight:`${LINE_H}px`, resize:"none", caretColor:"#60a5fa", tabSize:2, whiteSpace:"pre", overflowY:"auto", overflowX:"auto", scrollbarWidth:"thin", scrollbarColor:"rgba(96,165,250,0.2) transparent", position:"relative", zIndex:2, WebkitUserSelect:"text", touchAction:"manipulation" }}
        value={code}
        onChange={(e) => setCode(e.target.value)}
        onKeyDown={onKeyDown}
        spellCheck={false}
        placeholder="// Write your Queue implementation here..."
        autoCorrect="off"
        autoCapitalize="none"
        autoComplete="off"
      />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Right Sticky Nav (same as stack, but with Queue icon)
// ══════════════════════════════════════════════════════════════════════════════
function StickyNav({ activeSection, onNav, hasSteps, hasErrors, termLines }) {
  const hasTermErr = termLines.some(l => l.type === "error" || l.type === "stderr");
  const hasTermOk  = termLines.some(l => l.type === "success");
  const items = [
    { id:"code",     icon:"⌨", label:"Code",  dot:null },
    { id:"terminal", icon:"⬛", label:"Term",  dot:hasTermErr?"#f87171":hasTermOk?"#4ade80":null },
    { id:"viz",      icon:"🔁", label:"Queue", dot:hasSteps?"#60a5fa":hasErrors?"#f87171":null },
  ];
  return (
    <div style={{ position:"fixed", right:0, top:"50%", transform:"translateY(-50%)", zIndex:9000, display:"flex", flexDirection:"column", gap:0, background:"rgba(5,8,26,0.95)", border:"1px solid rgba(96,165,250,0.18)", borderRight:"none", borderRadius:"12px 0 0 12px", overflow:"hidden", boxShadow:"-4px 0 32px rgba(0,0,0,0.7),-1px 0 0 rgba(96,165,250,0.08)", backdropFilter:"blur(20px)" }}>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:"linear-gradient(90deg,transparent,#60a5fa,#a78bfa,transparent)", opacity:0.6 }} />
      {items.map((item, i) => {
        const isActive = activeSection === item.id;
        return (
          <button key={item.id} onClick={() => onNav(item.id)} style={{ position:"relative", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:4, width:48, padding:"12px 4px", border:"none", background:isActive?"linear-gradient(180deg,rgba(96,165,250,0.18),rgba(167,139,250,0.12))":"transparent", cursor:"pointer", borderBottom:i<items.length-1?"1px solid rgba(255,255,255,0.06)":"none", WebkitTapHighlightColor:"transparent", transition:"background 0.18s", borderLeft:isActive?"2px solid #60a5fa":"2px solid transparent" }}>
            {item.dot && <span style={{ position:"absolute", top:7, right:9, width:5, height:5, borderRadius:"50%", background:item.dot, boxShadow:`0 0 6px ${item.dot}` }} />}
            {isActive && <span style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at center,rgba(96,165,250,0.08),transparent 70%)", pointerEvents:"none" }} />}
            <span style={{ fontSize:16, opacity:isActive?1:0.4, transition:"opacity 0.15s,transform 0.15s", transform:isActive?"scale(1.1)":"scale(1)", lineHeight:1, position:"relative" }}>{item.icon}</span>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:7, fontWeight:700, letterSpacing:"0.05em", textTransform:"uppercase", color:isActive?"#60a5fa":"rgba(255,255,255,0.22)", transition:"color 0.15s", position:"relative" }}>{item.label}</span>
          </button>
        );
      })}
      <div style={{ position:"absolute", bottom:0, left:0, right:0, height:2, background:"linear-gradient(90deg,transparent,#f472b6,#60a5fa,transparent)", opacity:0.4 }} />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════════
export default function QueueDSPage() {
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
  const [aiReason, setAiReason] = useState("");
  const [apiNote, setApiNote] = useState("");
  const [termLines, setTermLines] = useState([]);
  const [sessionId] = useState(() => Math.random().toString(36).slice(2,8).toUpperCase());
  const [toast, setToast] = useState(null);
  const [termOpen, setTermOpen] = useState(true);
  const [activeSection, setActiveSection] = useState("code");

  const isMobile = useIsMobile();
  const timerRef = useRef(null);
  const taRef = useRef(null);
  const listRef = useRef(null);
  const sectionCodeRef = useRef(null);
  const sectionTermRef = useRef(null);
  const sectionVizRef = useRef(null);
  const scrollContainerRef = useRef(null);

  const bump = () => setAnimKey(k => k + 1);
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2200); };

  const copyQueueState = () => {
    const s = steps[idx] ?? null;
    if (!s) return;
    const txt = s.queue.length ? `[${s.queue.join(", ")}]  FRONT: ${s.queue[0]}  BACK: ${s.queue[s.queue.length-1]}` : "[] (empty)";
    navigator.clipboard?.writeText(txt).then(() => showToast("📋 Copied: " + txt)).catch(() => showToast("📋 " + txt));
  };

  const doReset = useCallback(() => {
    clearInterval(timerRef.current);
    setSteps([]); setIdx(-1); setError(""); setPlaying(false); setDone(false);
    setAiErrors([]); setAiReason(""); setApiNote(""); setTermLines([]);
  }, []);

  const handleChangeLang = (l) => { setLang(l); setCode(TPL[l] ?? ""); doReset(); };

  const buildTerm = (stps, errs, aiErrs, aiReason) => {
    const ls = [];
    const ts = new Date().toTimeString().slice(0,8);
    ls.push({ type:"output", text:`VisuoSlayer v2.1  ·  Queue  ·  ${ts}  ·  pid:${sessionId}` });
    ls.push({ type:"separator" });
    if (aiErrs.length > 0) {
      ls.push({ type:"prompt", text:`validate --lang=${lang} --ds=queue` });
      ls.push({ type:"blank" });
      if (aiReason) ls.push({ type:"stderr", text:aiReason });
      aiErrs.forEach(e => ls.push({ type:"error", text:`  L${e.line??"?"}  ${e.message}`, lineNum:e.line }));
      ls.push({ type:"blank" });
      ls.push({ type:"error", text:"Process exited with code 1" });
      return ls;
    }
    if (errs.length > 0) {
      ls.push({ type:"prompt", text:`run --lang=${lang}` });
      ls.push({ type:"blank" });
      errs.forEach(e => ls.push({ type:"stderr", text:e }));
      ls.push({ type:"blank" });
      ls.push({ type:"error", text:"Process exited with code 1" });
      return ls;
    }
    if (stps.length > 0) {
      ls.push({ type:"prompt", text:`run --lang=${lang} --ds=queue` });
      ls.push({ type:"blank" });
      stps.forEach((s, stepIdx) => {
        const ie = s.type === "dequeue_error" || s.type === "front_error";
        let out = "";
        switch (s.type) {
          case "enqueue":       out = `enqueue(${s.value})  →  [${s.queue.join(", ")}]  size:${s.queue.length}`; break;
          case "dequeue":       out = `dequeue()  →  ${s.value}  ·  [${s.queue.join(", ")}]  size:${s.queue.length}`; break;
          case "dequeue_error": out = `dequeue()  →  Error: Queue Underflow`; break;
          case "front":         out = `front()  →  ${s.value}  ·  unchanged  size:${s.queue.length}`; break;
          case "front_error":   out = `front()  →  Error: Queue is empty`; break;
          case "isEmpty":       out = `isEmpty()  →  ${s.result}  ·  ${s.queue.length} item${s.queue.length!==1?"s":""}`; break;
          case "size":          out = `size()  →  ${s.result}  ·  queue has ${s.result} element${s.result!==1?"s":""}`; break;
        }
        ls.push({ type:ie?"error":s.type, text:out, lineNum:s.lineNum+1, stepIndex:stepIdx });
      });
      ls.push({ type:"blank" });
      ls.push({ type:"success", text:`${stps.length} op${stps.length!==1?"s":""} completed  ·  exit code 0` });
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
      setAiReason(v.reason ?? "");
      setTermLines(buildTerm([], [], v.errors ?? [], v.reason ?? ""));
      if (isMobile) scrollToSection("terminal");
      return;
    }
    if (v.apiError) setApiNote(v.apiError);
    const { steps: s, errors } = runCode(code, lang);
    if (errors.length) {
      setError(errors.join("\n"));
      setTermLines(buildTerm([], errors, [], ""));
      if (isMobile) scrollToSection("terminal");
      return;
    }
    setSteps(s); setIdx(0); bump(); setPlaying(true);
    setTermLines(buildTerm(s, [], [], ""));
  };

  const goTo = useCallback((i) => {
    clearInterval(timerRef.current);
    setPlaying(false);
    setIdx(Math.max(0, Math.min(i, steps.length - 1)));
    bump();
  }, [steps.length]);

  useEffect(() => {
    const h = (e) => { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); handleRun(); } };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [code, lang]);

  useEffect(() => {
    if (!playing || !steps.length) return;
    timerRef.current = setInterval(() => {
      setIdx(p => {
        if (p >= steps.length - 1) { clearInterval(timerRef.current); setPlaying(false); setDone(true); return p; }
        bump(); return p + 1;
      });
    }, speed * 1000);
    return () => clearInterval(timerRef.current);
  }, [playing, steps, speed]);

  useEffect(() => {
    listRef.current?.querySelector(".sl-active")?.scrollIntoView({ block:"nearest", behavior:"smooth" });
  }, [idx]);

  useEffect(() => {
    if (!isMobile) return;
    const refs = [{ id:"code", ref:sectionCodeRef }, { id:"terminal", ref:sectionTermRef }, { id:"viz", ref:sectionVizRef }];
    const obs = new IntersectionObserver((entries) => {
      let best = null, bestRatio = 0;
      entries.forEach(e => { if (e.isIntersecting && e.intersectionRatio > bestRatio) { bestRatio = e.intersectionRatio; best = e.target.dataset.section; } });
      if (best) setActiveSection(best);
    }, { root: scrollContainerRef.current, threshold: [0.3, 0.6] });
    refs.forEach(r => { if (r.ref.current) { r.ref.current.dataset.section = r.id; obs.observe(r.ref.current); } });
    return () => obs.disconnect();
  }, [isMobile]);

  const scrollToSection = useCallback((id) => {
    const map = { code: sectionCodeRef, terminal: sectionTermRef, viz: sectionVizRef };
    map[id]?.current?.scrollIntoView({ behavior:"smooth", block:"start" });
    setActiveSection(id);
  }, []);

  const onKeyDown = (e) => {
    if (e.key !== "Tab") return;
    e.preventDefault();
    const s = e.target.selectionStart, en = e.target.selectionEnd;
    const nv = code.slice(0,s) + "  " + code.slice(en);
    setCode(nv);
    requestAnimationFrame(() => { if (taRef.current) { taRef.current.selectionStart = s+2; taRef.current.selectionEnd = s+2; } });
  };

  const step = steps[idx] ?? null;
  const os = step ? (OP[step.type] ?? OP.enqueue) : null;
  const prog = steps.length ? Math.round(((idx+1)/steps.length)*100) : 0;
  const hasAiErrors = aiErrors.length > 0;
  const idle = steps.length === 0 && !error && !hasAiErrors;
  const lm = LANGS[lang];
  const errorLineSet = new Set(aiErrors.map(e => (e.line ?? 1) - 1));

  // ── MOBILE LAYOUT (identical to stack but with queue label) ────────────────
  if (isMobile) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Space+Grotesk:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
          *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
          html,body{height:100%;-webkit-text-size-adjust:100%;}
          body{background:#050818;color:#c8d8f0;font-family:'DM Sans',sans-serif;}

          :root{--cyan:#60a5fa;--cyan-dim:rgba(96,165,250,0.15);--cyan-glow:rgba(96,165,250,0.45);--pink:#f472b6;--pink-dim:rgba(244,114,182,0.15);--green:#4ade80;--green-dim:rgba(74,222,128,0.15);--green-glow:rgba(74,222,128,0.4);--purple:#a78bfa;--yellow:#fbbf24;--text-primary:#d4e4f7;--text-secondary:#6b8aaa;--text-muted:#3d5470;--border-subtle:rgba(255,255,255,0.07);--border-medium:rgba(255,255,255,0.13);--surface-0:#050818;--surface-1:rgba(8,14,36,0.95);--surface-2:rgba(12,20,48,0.8);--surface-3:rgba(16,26,58,0.7);}

          @keyframes cur{0%,100%{opacity:1}50%{opacity:0}}
          @keyframes spin{to{transform:rotate(360deg)}}
          @keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
          @keyframes fadeIn{from{opacity:0}to{opacity:1}}
          @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
          @keyframes rPulse{0%,100%{box-shadow:0 0 16px rgba(96,165,250,0.4)}50%{box-shadow:0 0 32px rgba(96,165,250,0.7)}}
          @keyframes stepPop{0%{transform:scale(0.88);opacity:0}60%{transform:scale(1.04)}100%{transform:scale(1);opacity:1}}
          @keyframes metricPop{0%{transform:scale(1)}50%{transform:scale(1.1)}100%{transform:scale(1)}}
          @keyframes toastIn{0%{opacity:0;transform:translateY(8px) scale(0.94)}100%{opacity:1;transform:none}}
          @keyframes blkDrop{0%{transform:translateX(80px) scale(0.78);opacity:0}55%{transform:translateX(-5px) scale(1.04);opacity:1}78%{transform:translateX(2px) scale(0.98)}100%{transform:translateX(0) scale(1);opacity:1}}
          @keyframes flyAway{0%{transform:translateX(-50%) scale(1) rotate(0);opacity:1}35%{opacity:1}100%{transform:translateX(calc(-50% + 70px)) translateY(-120px) scale(0.5) rotate(22deg);opacity:0}}
          @keyframes pkRing{0%{transform:scale(1);opacity:0.9}100%{transform:scale(1.35);opacity:0}}
          @keyframes pkPulse{0%,100%{filter:brightness(1)}50%{filter:brightness(1.55) saturate(1.4)}}
          @keyframes ecCheck{0%,100%{transform:scale(1)}35%{transform:scale(1.06) translateY(-4px)}68%{transform:scale(0.97) translateY(2px)}}
          @keyframes pShine{0%,100%{left:-100%}55%{left:160%}}
          @keyframes svSh{0%,100%{transform:none}18%{transform:translateX(-7px)}36%{transform:translateX(7px)}54%{transform:translateX(-4px)}72%{transform:translateX(4px)}}
          @keyframes blobFloat{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(18px,-12px) scale(1.06)}66%{transform:translate(-10px,16px) scale(0.95)}}
          @keyframes blob2{0%,100%{transform:translate(0,0) scale(1)}40%{transform:translate(-20px,10px) scale(1.08)}70%{transform:translate(14px,-18px) scale(0.93)}}
          @keyframes gridScroll{0%{background-position:0 0}100%{background-position:32px 32px}}
          @keyframes scanline{0%{top:-10%}100%{top:110%}}

          .mob-pg{height:100vh;height:100dvh;display:flex;flex-direction:column;background:radial-gradient(ellipse 80% 50% at 50% 0%,rgba(59,130,246,0.12) 0%,transparent 60%),#050818;padding-top:env(safe-area-inset-top,0);}
          .mob-hd{flex-shrink:0;display:flex;align-items:center;gap:10px;padding:10px 16px;background:rgba(5,8,22,0.98);backdrop-filter:blur(20px);border-bottom:1px solid rgba(96,165,250,0.12);z-index:100;position:sticky;top:0;}
          .mob-logo{width:30px;height:30px;border-radius:8px;flex-shrink:0;background:linear-gradient(135deg,#1d4ed8,#3b82f6 50%,#a78bfa);display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 0 16px rgba(96,165,250,0.5);animation:rPulse 3s ease-in-out infinite;}
          .mob-brand{font-family:'Space Grotesk',sans-serif;font-size:14px;font-weight:800;background:linear-gradient(90deg,#93c5fd 0%,#a78bfa 50%,#f472b6 100%);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:shimmer 4s linear infinite;}
          .mob-sub{font-size:9px;color:var(--text-muted);font-family:'JetBrains Mono',monospace;margin-top:1px;}

          .mob-scroll{flex:1;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;scrollbar-width:thin;scrollbar-color:rgba(96,165,250,0.15) transparent;padding-right:52px;padding-bottom:env(safe-area-inset-bottom,16px);}
          .mob-scroll::-webkit-scrollbar{width:3px;} .mob-scroll::-webkit-scrollbar-thumb{background:rgba(96,165,250,0.18);border-radius:4px;}
          .mob-sec{display:flex;flex-direction:column;}
          .mob-sec-label{display:flex;align-items:center;gap:8px;padding:10px 14px 6px;font-family:'JetBrains Mono',monospace;font-size:7px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:var(--text-muted);}
          .mob-sec-label::after{content:'';flex:1;height:1px;background:linear-gradient(90deg,rgba(96,165,250,0.2),transparent);}
          .mob-ph{padding:8px 14px;border-bottom:1px solid var(--border-subtle);background:rgba(8,14,38,0.9);display:flex;align-items:center;gap:7px;flex-shrink:0;}
          .dot{width:8px;height:8px;border-radius:50%;}
          .ptl{font-family:'JetBrains Mono',monospace;font-size:7.5px;color:var(--text-muted);text-transform:uppercase;letter-spacing:1.5px;margin-left:6px;font-weight:600;}
          .mob-lb{display:flex;gap:4px;padding:8px 12px;overflow-x:auto;border-bottom:1px solid var(--border-subtle);background:rgba(6,11,30,0.8);flex-shrink:0;scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}
          .mob-lb::-webkit-scrollbar{display:none;}
          .mob-lt{padding:5px 12px;border-radius:6px;cursor:pointer;white-space:nowrap;font-family:'JetBrains Mono',monospace;font-size:9px;font-weight:700;border:1px solid var(--border-subtle);background:transparent;color:var(--text-muted);transition:all 0.15s;flex-shrink:0;}
          .mob-lt.la{color:#e8f4ff;background:rgba(255,255,255,0.06);}
          .mob-editor-wrap{background:rgba(5,8,22,0.95);border:1px solid var(--border-subtle);border-radius:0;display:flex;flex-direction:column;height:340px;}
          .mob-rr{padding:10px 12px;border-top:1px solid rgba(96,165,250,0.18);display:flex;align-items:center;gap:8px;flex-shrink:0;background:rgba(4,8,22,0.96);box-shadow:0 -4px 16px rgba(0,0,0,0.4);}
          .mob-btn-run{flex:1;padding:12px 16px;border-radius:12px;background:linear-gradient(135deg,#1d4ed8,#3b82f6,#60a5fa);border:1px solid rgba(96,165,250,0.4);color:#fff;font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:700;cursor:pointer;transition:all 0.18s;box-shadow:0 0 24px rgba(96,165,250,0.35),0 4px 12px rgba(0,0,0,0.4);-webkit-tap-highlight-color:transparent;letter-spacing:0.03em;}
          .mob-btn-run:active{transform:scale(0.97);}
          .mob-btn-run.running{animation:rPulse 1.2s ease-in-out infinite;}
          .mob-btn-run:disabled{opacity:0.4;cursor:not-allowed;}
          .mob-btn-rst{padding:12px 14px;border-radius:12px;background:transparent;border:1px solid rgba(248,113,113,0.3);color:#f87171;font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:600;cursor:pointer;transition:all 0.16s;-webkit-tap-highlight-color:transparent;white-space:nowrap;}
          .mob-btn-rst:active{background:rgba(248,113,113,0.12);}
          .mob-alb{display:flex;align-items:center;gap:7px;padding:6px 14px;border-left:2px solid;min-height:30px;border-top:1px solid var(--border-subtle);flex-shrink:0;animation:fadeIn 0.18s ease;}
          .mob-alb-ln{font-family:'JetBrains Mono',monospace;font-size:9px;font-weight:700;white-space:nowrap;}
          .mob-alb-code{font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--text-secondary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;}
          .mob-term-wrap{background:rgba(5,8,22,0.95);border:1px solid var(--border-subtle);display:flex;flex-direction:column;height:220px;}
          .qv{display:flex;flex-direction:column;flex:1;min-height:0;position:relative;}
          .qv.qv-err{animation:svSh 0.4s ease;}
          .qv-metrics{display:flex;border-bottom:1px solid var(--border-subtle);background:rgba(4,8,26,0.75);flex-shrink:0;}
          .qv-m{flex:1;padding:6px 4px;text-align:center;border-right:1px solid var(--border-subtle);display:flex;flex-direction:column;gap:2px;transition:background 0.2s;}
          .qv-m:last-child{border-right:none;}
          .qv-m.sv-m-active{background:rgba(96,165,250,0.05);animation:metricPop 0.3s ease;}
          .qv-ml{font-family:'JetBrains Mono',monospace;font-size:6px;color:var(--text-muted);letter-spacing:0.15em;text-transform:uppercase;font-weight:600;}
          .qv-mv{font-family:'JetBrains Mono',monospace;font-weight:700;line-height:1.1;transition:color 0.3s;}
          .qv-row{flex:1;display:flex;align-items:center;justify-content:center;gap:12px;padding:12px 12px 0;position:relative;min-height:200px;flex-wrap:wrap;}
          .qv-front-tag,.qv-back-tag{font-family:'JetBrains Mono',monospace;font-size:9px;color:#1e3050;letter-spacing:0.08em;}
          .qv-front-tag{color:#fbbf24;}
          .qv-back-tag{color:#4ade80;}
          .qv-items{display:flex;flex-direction:row;gap:6px;align-items:center;flex-wrap:wrap;justify-content:center;overflow-x:auto;padding-bottom:4px;max-width:100%;}
          .qv-block{height:44px;min-width:70px;border-radius:13px;border:1.5px solid transparent;display:flex;align-items:center;justify-content:center;padding:0 8px;gap:6px;position:relative;transition:all 0.28s ease;flex-shrink:0;}
          .qv-block::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,0.18) 0%,transparent 58%);border-radius:inherit;pointer-events:none;}
          .qv-enq{animation:blkDrop 0.52s cubic-bezier(0.34,1.56,0.64,1) both;}
          .qv-front{animation:frontPulse 0.6s ease 2 both;}
          @keyframes frontPulse{0%,100%{filter:brightness(1)}50%{filter:brightness(1.45) saturate(1.4)}}
          .qv-pk-ring,.qv-pk-ring2{position:absolute;inset:-4px;border-radius:19px;border:2.5px solid;animation:pkRing 0.78s cubic-bezier(0.22,1,0.36,1) forwards;pointer-events:none;}
          .qv-pk-ring2{animation-delay:0.16s;}
          .qv-bidx{font-family:'JetBrains Mono',monospace;font-size:7px;color:rgba(255,255,255,0.42);}
          .qv-bval{font-family:'JetBrains Mono',monospace;font-size:16px;font-weight:700;color:#fff;text-shadow:0 2px 9px rgba(0,0,0,0.35);}
          .qv-btag{font-family:'JetBrains Mono',monospace;font-size:6.5px;color:rgba(255,255,255,0.68);white-space:nowrap;}
          .qv-btag.back{color:rgba(74,222,128,0.9);}
          .qv-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;min-width:120px;height:72px;border:1px dashed rgba(255,255,255,0.07);border-radius:13px;gap:5px;}
          .qv-empty.sv-empty-err{border-color:rgba(239,68,68,0.35);animation:svSh 0.38s ease;}
          .qv-ei{font-size:18px;opacity:0.45;}
          .qv-et{font-family:'JetBrains Mono',monospace;font-size:8px;color:#1e3050;letter-spacing:0.07em;}
          .qv-fly{position:absolute;top:18px;left:50%;transform:translateX(-50%);height:44px;min-width:70px;border-radius:13px;display:flex;align-items:center;justify-content:center;gap:6px;z-index:20;pointer-events:none;border:1.5px solid rgba(255,255,255,0.28);animation:flyAway 0.76s cubic-bezier(0.22,1,0.36,1) forwards;white-space:nowrap;}
          .qv-fly-v{font-family:'JetBrains Mono',monospace;font-size:16px;font-weight:700;color:#fff;}
          .qv-fly-tag{font-family:'JetBrains Mono',monospace;font-size:7px;color:rgba(255,255,255,0.7);letter-spacing:0.06em;}
          .qv-plat{margin-top:5px;width:280px;height:11px;border-radius:7px;background:linear-gradient(90deg,rgba(96,165,250,0.28),rgba(96,165,250,0.14),rgba(96,165,250,0.28));position:relative;overflow:hidden;align-self:center;}
          .qv-plat-shine{position:absolute;top:0;left:-100%;width:55%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.28),transparent);animation:pShine 3.2s ease-in-out infinite;}
          .qv-base{font-family:'JetBrains Mono',monospace;font-size:8px;color:#1e3050;letter-spacing:0.1em;margin-top:4px;margin-bottom:14px;text-align:center;}
          .mob-viz-wrap{background:rgba(5,8,22,0.95);border:1px solid var(--border-subtle);display:flex;flex-direction:column;min-height:360px;}
          .mob-oi{padding:8px 14px;border-top:1px solid var(--border-subtle);background:rgba(4,8,24,0.6);flex-shrink:0;}
          .mob-oi-badge{display:inline-flex;align-items:center;gap:6px;padding:3px 10px;border-radius:16px;margin-bottom:4px;font-family:'JetBrains Mono',monospace;font-size:9px;font-weight:700;animation:stepPop 0.22s ease;border:1px solid;letter-spacing:0.04em;}
          .mob-oi-msg{font-family:'JetBrains Mono',monospace;font-size:9px;line-height:1.6;animation:fadeUp 0.2s ease;color:var(--text-secondary);word-break:break-word;}
          .mob-ctrl{display:flex;align-items:center;gap:4px;padding:8px 12px;border-top:1px solid var(--border-subtle);background:rgba(3,6,18,0.7);flex-shrink:0;}
          .mob-cb{width:34px;height:34px;border-radius:8px;border:1px solid var(--border-medium);background:var(--surface-3);color:var(--text-secondary);font-size:12px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.14s;-webkit-tap-highlight-color:transparent;flex-shrink:0;}
          .mob-cb:active:not(:disabled){transform:scale(0.9);background:var(--cyan-dim);}
          .mob-cb:disabled{opacity:0.22;cursor:not-allowed;}
          .mob-cp{height:34px;padding:0 14px;border-radius:8px;background:linear-gradient(135deg,#1d4ed8,#3b82f6,#60a5fa);border:1px solid rgba(96,165,250,0.35);color:#fff;font-size:12px;font-weight:700;cursor:pointer;box-shadow:0 0 16px rgba(96,165,250,0.35);-webkit-tap-highlight-color:transparent;flex-shrink:0;}
          .mob-cp:active{transform:scale(0.95);}
          .mob-cp:disabled{opacity:0.25;cursor:not-allowed;}
          .mob-csep{width:1px;height:14px;background:var(--border-subtle);margin:0 2px;flex-shrink:0;}
          .mob-spd{display:flex;gap:2px;}
          .mob-sb{padding:4px 7px;border-radius:5px;cursor:pointer;font-family:'JetBrains Mono',monospace;font-size:8px;font-weight:700;border:1px solid var(--border-subtle);background:transparent;color:var(--text-muted);-webkit-tap-highlight-color:transparent;}
          .mob-sb.sa{background:var(--cyan-dim);border-color:rgba(96,165,250,0.4);color:var(--cyan);}
          .mob-pr{display:flex;align-items:center;gap:7px;padding:5px 14px;border-top:1px solid var(--border-subtle);flex-shrink:0;}
          .mob-pt2{flex:1;height:4px;background:rgba(255,255,255,0.05);border-radius:99px;overflow:hidden;}
          .mob-pf{height:100%;border-radius:99px;transition:width 0.4s cubic-bezier(0.4,0,0.2,1);background:linear-gradient(90deg,#1d4ed8,#60a5fa,#a78bfa);box-shadow:0 0 8px rgba(96,165,250,0.5);}
          .mob-ptx{font-family:'JetBrains Mono',monospace;font-size:8px;color:var(--text-secondary);min-width:28px;text-align:right;}
          .mob-slh{padding:5px 14px 3px;font-family:'JetBrains Mono',monospace;font-size:7px;color:var(--text-muted);letter-spacing:0.18em;text-transform:uppercase;font-weight:600;border-top:1px solid var(--border-subtle);flex-shrink:0;display:flex;align-items:center;justify-content:space-between;}
          .mob-sl{overflow-y:auto;padding:3px 8px 8px;display:flex;flex-direction:column;gap:1.5px;max-height:120px;flex-shrink:0;scrollbar-width:thin;scrollbar-color:rgba(96,165,250,0.2) transparent;}
          .mob-si{display:flex;align-items:center;gap:6px;padding:4px 8px;border-radius:5px;cursor:pointer;font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--text-muted);transition:all 0.12s;border:1px solid transparent;-webkit-tap-highlight-color:transparent;}
          .mob-si:active{background:var(--cyan-dim);}
          .sl-active{background:rgba(96,165,250,0.09)!important;border-color:rgba(96,165,250,0.22)!important;color:var(--cyan)!important;box-shadow:inset 3px 0 0 var(--cyan);}
          .mob-si-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0;transition:all 0.15s;}
          .mob-si-v{opacity:0.55;margin-left:1px;}
          .mob-si-ln{margin-left:auto;font-size:7px;color:var(--text-muted);opacity:0.7;}
          .toast{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);padding:9px 18px;border-radius:10px;font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:600;white-space:nowrap;background:rgba(10,20,50,0.97);border:1px solid var(--border-medium);color:var(--green);box-shadow:0 8px 24px rgba(0,0,0,0.5),0 0 16px var(--green-glow);z-index:9999;animation:toastIn 0.25s ease;}
          ::-webkit-scrollbar{width:3px;height:3px;} ::-webkit-scrollbar-track{background:transparent;} ::-webkit-scrollbar-thumb{background:rgba(96,165,250,0.2);border-radius:4px;} textarea::-webkit-scrollbar{width:3px;}
        `}</style>

        <div className="mob-pg">
          <header className="mob-hd">
            <div className="mob-logo">🔁</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div className="mob-brand">VisuoSlayer</div>
              <div className="mob-sub">Queue DS · Write · Run · Visualize</div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:6, flexShrink:0 }}>
              <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:8, color:lm.accent, background:`${lm.accent}12`, border:`1px solid ${lm.accent}28`, padding:"2px 8px", borderRadius:20, fontWeight:700 }}>{lm.ext}</span>
              <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:7.5, color:"var(--text-muted)", padding:"2px 7px", borderRadius:16, border:"1px solid var(--border-subtle)", background:"var(--surface-2)" }}>{sessionId}</span>
            </div>
          </header>

          <div className="mob-scroll" ref={scrollContainerRef}>
            {/* CODE */}
            <div ref={sectionCodeRef} className="mob-sec">
              <div className="mob-sec-label"><span>⌨</span><span>01 · Code Editor</span></div>
              <div className="mob-editor-wrap">
                <div className="mob-ph">
                  <span className="dot" style={{ background:"#ff5f57", boxShadow:"0 0 5px #ff5f57" }} />
                  <span className="dot" style={{ background:"#ffbd2e", boxShadow:"0 0 5px #ffbd2e" }} />
                  <span className="dot" style={{ background:"#28c840", boxShadow:"0 0 5px #28c840" }} />
                  <span className="ptl">Code Editor</span>
                  <span style={{ marginLeft:"auto", fontFamily:"'JetBrains Mono',monospace", fontSize:8, color:lm.accent, background:`${lm.accent}10`, border:`1px solid ${lm.accent}25`, padding:"2px 8px", borderRadius:16, fontWeight:700 }}>{lm.name}</span>
                </div>
                <div className="mob-lb">
                  {Object.entries(LANGS).map(([k, m]) => (
                    <button key={k} className={`mob-lt${lang===k?" la":""}`} onClick={() => handleChangeLang(k)} style={lang===k?{borderColor:`${m.accent}35`,color:m.accent,background:`${m.accent}0e`}:{}}>{m.name}</button>
                  ))}
                </div>
                <div style={{ flex:1, display:"flex", flexDirection:"column", minHeight:0, position:"relative" }}>
                  <CodeEditor code={code} setCode={setCode} step={step} errorLineSet={errorLineSet} onKeyDown={onKeyDown} taRef={taRef} />
                  {step && os && (
                    <div className="mob-alb" style={{ borderColor:os.bd, background:os.bg }}>
                      <span style={{ color:os.c, fontSize:10 }}>{os.icon}</span>
                      <span className="mob-alb-ln" style={{ color:os.c }}>L{step.lineNum+1}</span>
                      <code className="mob-alb-code">{step.codeLine}</code>
                    </div>
                  )}
                </div>
              </div>
              <div className="mob-rr">
                <button className={`mob-btn-run${playing||validating?" running":""}`} onClick={handleRun} disabled={playing||validating}>
                  {validating?"⟳ Reviewing…":playing?"▶ Running…":"▶  Run & Visualize"}
                </button>
                {(steps.length > 0 || error || hasAiErrors) && <button className="mob-btn-rst" onClick={doReset}>↺ Reset</button>}
              </div>
            </div>

            {/* TERMINAL */}
            <div ref={sectionTermRef} className="mob-sec" style={{ marginTop:2 }}>
              <div className="mob-sec-label"><span>⬛</span><span>02 · Terminal</span></div>
              <div className="mob-term-wrap">
                <div className="mob-ph">
                  <span className="dot" style={{ background:"#ff5f57", boxShadow:"0 0 5px #ff5f57" }} />
                  <span className="dot" style={{ background:"#ffbd2e", boxShadow:"0 0 5px #ffbd2e" }} />
                  <span className="dot" style={{ background:"#28c840", boxShadow:"0 0 5px #28c840" }} />
                  <span className="ptl">visualoslayer — bash</span>
                  <span style={{ marginLeft:"auto", fontFamily:"'JetBrains Mono',monospace", fontSize:8, color:"var(--text-muted)" }}>pid:{sessionId}</span>
                </div>
                <Terminal lines={termLines} sessionId={sessionId} validating={validating} currentStepIndex={idx} />
              </div>
            </div>

            {/* VIZ */}
            <div ref={sectionVizRef} className="mob-sec" style={{ marginTop:2 }}>
              <div className="mob-sec-label"><span>🔁</span><span>03 · Queue Visualization</span></div>
              <div className="mob-viz-wrap">
                <div className="mob-ph">
                  <span className="dot" style={{ background:"#60a5fa", boxShadow:"0 0 5px #60a5fa" }} />
                  <span className="dot" style={{ background:"#f472b6", boxShadow:"0 0 5px #f472b6" }} />
                  <span className="dot" style={{ background:"#4ade80", boxShadow:"0 0 5px #4ade80" }} />
                  <span className="ptl">Queue Visualization</span>
                  {steps.length > 0 && <span style={{ marginLeft:"auto", fontFamily:"'JetBrains Mono',monospace", fontSize:8, color:"var(--cyan)", background:"var(--cyan-dim)", border:"1px solid rgba(96,165,250,0.25)", padding:"2px 8px", borderRadius:16, fontWeight:700 }}>{idx+1} / {steps.length}</span>}
                </div>
                <QueueViz step={step} animKey={animKey} idle={idle} compact={true} />
                <div className="mob-oi">
                  {step && os ? (
                    <>
                      <div className="mob-oi-badge" style={{ color:os.c, background:os.bg, borderColor:os.bd }}>
                        <span>{os.icon}</span><span>{os.label}</span>
                        {step.type==="enqueue"&&<span style={{opacity:0.55}}>({step.value})</span>}
                        {(step.type==="dequeue"||step.type==="front")&&step.valid!==false&&step.value!=null&&<span style={{opacity:0.55}}>→ {step.value}</span>}
                        {step.type==="isEmpty"&&<span style={{opacity:0.55}}>→ {String(step.result)}</span>}
                        {step.type==="size"&&<span style={{opacity:0.55}}>→ {step.result}</span>}
                      </div>
                      <div className="mob-oi-msg">{step.message}</div>
                    </>
                  ) : (
                    <div style={{ display:"flex", alignItems:"center", gap:8, fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:"var(--text-muted)", padding:"4px 0" }}>
                      <span>🔁</span>
                      <span>{idle?"Write a Queue, hit Run to visualize":hasAiErrors?"Errors found — check Terminal":error?"Fix errors and run again":validating?"Reviewing code…":"Waiting…"}</span>
                    </div>
                  )}
                </div>
                {steps.length > 0 && (
                  <div className="mob-ctrl">
                    <button className="mob-cb" onClick={() => goTo(0)} disabled={idx<=0}>⏮</button>
                    <button className="mob-cb" onClick={() => goTo(idx-1)} disabled={idx<=0}>◀</button>
                    <button className="mob-cp" onClick={() => { if(done||idx>=steps.length-1){setIdx(0);bump();setDone(false);setPlaying(true);}else{clearInterval(timerRef.current);setPlaying(p=>!p);} }}>
                      {playing?"⏸":done?"↺":"▶"}
                    </button>
                    <button className="mob-cb" onClick={() => goTo(idx+1)} disabled={idx>=steps.length-1}>▶</button>
                    <button className="mob-cb" onClick={() => goTo(steps.length-1)} disabled={idx>=steps.length-1}>⏭</button>
                    <div className="mob-csep" />
                    <div className="mob-spd">
                      {[[2,"½×"],[1.1,"1×"],[0.55,"2×"]].map(([s,lbl]) => (
                        <button key={s} className={`mob-sb${speed===s?" sa":""}`} onClick={() => setSpeed(s)}>{lbl}</button>
                      ))}
                    </div>
                    <div className="mob-csep" />
                    <button className="mob-cb" onClick={copyQueueState} style={{ fontSize:14 }}>📋</button>
                  </div>
                )}
                {steps.length > 0 && (
                  <div className="mob-pr">
                    <div className="mob-pt2"><div className="mob-pf" style={{ width:`${prog}%` }} /></div>
                    <span className="mob-ptx">{prog}%</span>
                  </div>
                )}
                {steps.length > 0 && (
                  <>
                    <div className="mob-slh"><span>OPERATION LOG</span><span style={{ color:"var(--cyan)", fontSize:7 }}>{steps.length} ops</span></div>
                    <div className="mob-sl" ref={listRef}>
                      {steps.map((s, i) => {
                        const sm = OP[s.type] ?? OP.enqueue;
                        const past = i<idx, active = i===idx;
                        return (
                          <div key={i} className={`mob-si${active?" sl-active":""}`} onClick={() => goTo(i)}>
                            <span className="mob-si-dot" style={{ background:past?"var(--green)":active?sm.c:"var(--text-muted)", boxShadow:active?`0 0 6px ${sm.c}`:past?"0 0 5px var(--green-glow)":"none" }} />
                            <span style={{ color:active?sm.c:past?"var(--text-secondary)":"var(--text-muted)" }}>
                              {sm.label}
                              {s.type==="enqueue"&&<span className="mob-si-v">({s.value})</span>}
                              {s.type==="dequeue"&&s.valid!==false&&<span className="mob-si-v"> → {s.value}</span>}
                              {s.type==="front"&&s.valid!==false&&<span className="mob-si-v"> = {s.value}</span>}
                              {s.type==="isEmpty"&&<span className="mob-si-v"> = {String(s.result)}</span>}
                              {s.type==="size"&&<span className="mob-si-v"> = {s.result}</span>}
                              {(s.type==="dequeue_error"||s.type==="front_error")&&<span style={{color:"#f87171",opacity:0.7}}> ⚠</span>}
                            </span>
                            <span className="mob-si-ln">L{s.lineNum+1}</span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
                <div style={{ height:16 }} />
              </div>
            </div>
            <div style={{ height:24 }} />
          </div>

          <StickyNav activeSection={activeSection} onNav={scrollToSection} hasSteps={steps.length>0} hasErrors={!!error||hasAiErrors} termLines={termLines} />
        </div>
        {toast && <div className="toast">{toast}</div>}
      </>
    );
  }

  // ── DESKTOP LAYOUT (identical to stack but with queue content) ──────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Space+Grotesk:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html,body{height:100%;overflow:hidden}
        body{background:#050818;color:#c8d8f0;font-family:'DM Sans',sans-serif;}
        :root{--cyan:#60a5fa;--cyan-dim:rgba(96,165,250,0.15);--cyan-glow:rgba(96,165,250,0.45);--pink:#f472b6;--pink-dim:rgba(244,114,182,0.15);--green:#4ade80;--green-dim:rgba(74,222,128,0.15);--green-glow:rgba(74,222,128,0.4);--purple:#a78bfa;--yellow:#fbbf24;--text-primary:#d4e4f7;--text-secondary:#6b8aaa;--text-muted:#3d5470;--border-subtle:rgba(255,255,255,0.07);--border-medium:rgba(255,255,255,0.13);--surface-0:#050818;--surface-1:rgba(8,14,36,0.95);--surface-2:rgba(12,20,48,0.8);--surface-3:rgba(16,26,58,0.7);}

        @keyframes cur{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
        @keyframes rPulse{0%,100%{box-shadow:0 0 20px rgba(96,165,250,0.4)}50%{box-shadow:0 0 44px rgba(96,165,250,0.7),0 0 80px rgba(96,165,250,0.2)}}
        @keyframes stepPop{0%{transform:scale(0.88);opacity:0}60%{transform:scale(1.04)}100%{transform:scale(1);opacity:1}}
        @keyframes metricPop{0%{transform:scale(1)}50%{transform:scale(1.1)}100%{transform:scale(1)}}
        @keyframes toastIn{0%{opacity:0;transform:translateY(8px) scale(0.94)}100%{opacity:1;transform:none}}
        @keyframes toastOut{0%{opacity:1;transform:none}100%{opacity:0;transform:translateY(-8px) scale(0.94)}}
        @keyframes termSlideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}
        @keyframes blkDrop{0%{transform:translateX(80px) scale(0.78);opacity:0}55%{transform:translateX(-5px) scale(1.05);opacity:1}78%{transform:translateX(2px) scale(0.98)}100%{transform:translateX(0) scale(1);opacity:1}}
        @keyframes flyAway{0%{transform:translateX(-50%) scale(1) rotate(0);opacity:1}35%{opacity:1}100%{transform:translateX(calc(-50% + 70px)) translateY(-120px) scale(0.5) rotate(22deg);opacity:0}}
        @keyframes pkRing{0%{transform:scale(1);opacity:0.9}100%{transform:scale(1.35);opacity:0}}
        @keyframes pkPulse{0%,100%{filter:brightness(1)}50%{filter:brightness(1.55) saturate(1.4)}}
        @keyframes ecCheck{0%,100%{transform:scale(1)}35%{transform:scale(1.06) translateY(-5px)}68%{transform:scale(0.97) translateY(2px)}}
        @keyframes pShine{0%,100%{left:-100%}55%{left:160%}}
        @keyframes svSh{0%,100%{transform:none}18%{transform:translateX(-9px)}36%{transform:translateX(9px)}54%{transform:translateX(-5px)}72%{transform:translateX(5px)}}
        @keyframes blobFloat{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(22px,-16px) scale(1.06)}66%{transform:translate(-14px,20px) scale(0.95)}}
        @keyframes blob2{0%,100%{transform:translate(0,0) scale(1)}40%{transform:translate(-26px,14px) scale(1.08)}70%{transform:translate(18px,-22px) scale(0.93)}}
        @keyframes scanline{0%{top:-10%}100%{top:110%}}
        @keyframes gridScroll{0%{background-position:0 0}100%{background-position:38px 38px}}

        .pg{height:100vh;display:flex;flex-direction:column;overflow:hidden;background:radial-gradient(ellipse 60% 45% at 5% 0%,rgba(59,130,246,0.10) 0%,transparent 55%),radial-gradient(ellipse 50% 40% at 95% 100%,rgba(244,114,182,0.08) 0%,transparent 52%),radial-gradient(ellipse 40% 35% at 50% 50%,rgba(167,139,250,0.04) 0%,transparent 60%),#050818}
        .hd{flex-shrink:0;display:flex;align-items:center;gap:12px;padding:9px 24px;background:rgba(5,8,22,0.98);backdrop-filter:blur(20px);border-bottom:1px solid rgba(96,165,250,0.12);box-shadow:0 1px 0 rgba(96,165,250,0.06),0 4px 24px rgba(0,0,0,0.4)}
        .hd-logo{width:34px;height:34px;border-radius:9px;flex-shrink:0;background:linear-gradient(135deg,#1d4ed8,#3b82f6 50%,#a78bfa);display:flex;align-items:center;justify-content:center;font-size:17px;box-shadow:0 0 20px rgba(96,165,250,0.5),0 0 40px rgba(96,165,250,0.15);animation:rPulse 3s ease-in-out infinite}
        .hd-brand{font-family:'Space Grotesk',sans-serif;font-size:16px;font-weight:800;letter-spacing:-0.4px;background:linear-gradient(90deg,#93c5fd 0%,#a78bfa 50%,#f472b6 100%);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:shimmer 4s linear infinite}
        .hd-tagline{font-size:9px;color:var(--text-muted);font-family:'JetBrains Mono',monospace;margin-top:1px;letter-spacing:0.04em}
        .hd-r{margin-left:auto;display:flex;align-items:center;gap:8px}
        .hd-pill{font-family:'JetBrains Mono',monospace;font-size:8.5px;padding:3px 10px;border-radius:20px;letter-spacing:0.07em;white-space:nowrap;font-weight:700}
        .hd-pid{font-family:'JetBrains Mono',monospace;font-size:8px;color:var(--text-muted);padding:3px 9px;border-radius:20px;border:1px solid var(--border-subtle);background:var(--surface-2)}
        .hd-ds-badge{font-family:'JetBrains Mono',monospace;font-size:8px;color:var(--cyan);padding:3px 9px;border-radius:20px;border:1px solid rgba(96,165,250,0.25);background:rgba(96,165,250,0.08);letter-spacing:0.08em}
        .main{flex:1;display:grid;gap:10px;padding:10px 24px;min-height:0;overflow:hidden;}
        @media(min-width:768px){.main{grid-template-columns:1fr 1fr;}}
        .panel{background:var(--surface-1);border:1px solid var(--border-subtle);border-radius:14px;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,255,255,0.04);min-height:0}
        .ph{padding:9px 14px;border-bottom:1px solid var(--border-subtle);background:rgba(8,14,38,0.85);display:flex;align-items:center;gap:7px;flex-shrink:0}
        .dot{width:9px;height:9px;border-radius:50%;transition:box-shadow 0.3s}
        .ptl{font-family:'JetBrains Mono',monospace;font-size:8px;color:var(--text-muted);text-transform:uppercase;letter-spacing:1.5px;margin-left:8px;font-weight:600}
        .left{display:flex;flex-direction:column;min-height:0}
        .lb{display:flex;gap:3px;flex-wrap:wrap;padding:7px 11px;border-bottom:1px solid var(--border-subtle);background:rgba(6,11,30,0.8);flex-shrink:0}
        .lt{padding:3px 9px;border-radius:6px;cursor:pointer;font-family:'JetBrains Mono',monospace;font-size:8px;font-weight:700;border:1px solid var(--border-subtle);background:transparent;color:var(--text-muted);transition:all 0.15s;letter-spacing:0.05em}
        .lt:hover{color:var(--text-secondary);border-color:var(--border-medium);background:rgba(255,255,255,0.04)}
        .lt.la{color:#e8f4ff;background:rgba(255,255,255,0.06);box-shadow:inset 0 1px 0 rgba(255,255,255,0.1)}
        .alb{display:flex;align-items:center;gap:8px;padding:5px 14px;border-left:2px solid;min-height:26px;border-top:1px solid var(--border-subtle);flex-shrink:0;animation:fadeIn 0.18s ease;backdrop-filter:blur(4px)}
        .alb-ln{font-family:'JetBrains Mono',monospace;font-size:9px;font-weight:700;white-space:nowrap}
        .alb-code{font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--text-secondary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1}
        .rr{padding:8px 12px;border-top:1px solid var(--border-subtle);display:flex;align-items:center;gap:7px;flex-shrink:0;background:rgba(4,8,22,0.6)}
        .btn-run{padding:7px 18px;border-radius:8px;background:linear-gradient(135deg,#1d4ed8,#3b82f6,#60a5fa);border:1px solid rgba(96,165,250,0.35);color:#fff;font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;cursor:pointer;transition:all 0.18s;box-shadow:0 0 20px rgba(96,165,250,0.3),0 2px 8px rgba(0,0,0,0.4);letter-spacing:0.04em;position:relative;overflow:hidden;white-space:nowrap}
        .btn-run::after{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,0.15) 0%,transparent 60%);border-radius:inherit;pointer-events:none}
        .btn-run:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 0 36px rgba(96,165,250,0.55),0 6px 20px rgba(0,0,0,0.5)}
        .btn-run:active:not(:disabled){transform:translateY(0)}
        .btn-run.running{animation:rPulse 1.2s ease-in-out infinite;background:linear-gradient(135deg,#1e3a8a,#1d4ed8,#3b82f6)}
        .btn-run:disabled{opacity:0.4;cursor:not-allowed;transform:none;box-shadow:none}
        .btn-rst{padding:7px 11px;border-radius:8px;background:transparent;border:1px solid rgba(248,113,113,0.28);color:#f87171;font-family:'JetBrains Mono',monospace;font-size:9px;font-weight:600;cursor:pointer;transition:all 0.16s}
        .btn-rst:hover{background:rgba(248,113,113,0.1);border-color:rgba(248,113,113,0.5)}
        .rr-hint{font-family:'JetBrains Mono',monospace;font-size:8px;color:var(--text-muted);letter-spacing:0.07em;padding:3px 7px;border-radius:5px;border:1px solid var(--border-subtle);background:var(--surface-2)}
        .term-bar{display:flex;align-items:center;gap:6px;padding:6px 13px;background:rgba(4,7,18,0.95);border-bottom:1px solid var(--border-subtle);border-top:1px solid var(--border-subtle);flex-shrink:0}
        .tm-wrap{display:flex;flex-direction:column;min-height:0;transition:flex-basis 0.32s cubic-bezier(0.4,0,0.2,1),opacity 0.25s ease;overflow:hidden}
        .tm-wrap.tm-open{flex:1;min-height:90px}
        .tm-wrap.tm-closed{flex:0 0 0px;min-height:0;opacity:0;pointer-events:none}
        .term-body-wrap{flex:1;display:flex;flex-direction:column;min-height:0;animation:termSlideDown 0.28s cubic-bezier(0.4,0,0.2,1)}
        .term-toggle{display:flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:5px;border:1px solid var(--border-medium);background:rgba(255,255,255,0.04);cursor:pointer;flex-shrink:0;color:var(--text-secondary);font-size:9px;font-weight:700;transition:all 0.15s;margin-left:auto;font-family:'JetBrains Mono',monospace;line-height:1;user-select:none}
        .term-toggle:hover{background:var(--cyan-dim);color:var(--cyan);border-color:rgba(96,165,250,0.4)}
        .term-bar-closed{display:flex;align-items:center;gap:6px;padding:6px 13px;background:rgba(4,7,18,0.95);border-top:1px solid var(--border-subtle);flex-shrink:0;cursor:pointer;transition:background 0.15s}
        .term-bar-closed:hover{background:rgba(8,14,32,0.95)}
        .qv-metrics{display:flex;border-bottom:1px solid var(--border-subtle);background:rgba(4,8,26,0.75);flex-shrink:0}
        .qv-m{flex:1;padding:7px 8px;text-align:center;border-right:1px solid var(--border-subtle);display:flex;flex-direction:column;gap:3px;transition:background 0.2s}
        .qv-m:last-child{border-right:none}
        .qv-m.sv-m-active{background:rgba(96,165,250,0.05);animation:metricPop 0.3s ease}
        .qv-ml{font-family:'JetBrains Mono',monospace;font-size:6.5px;color:var(--text-muted);letter-spacing:0.2em;text-transform:uppercase;font-weight:600}
        .qv-mv{font-family:'JetBrains Mono',monospace;font-weight:700;line-height:1.1;transition:color 0.3s}
        .qv{display:flex;flex-direction:column;flex:1;min-height:0;position:relative}
        .qv.qv-err{animation:svSh 0.4s ease}
        .qv-row{flex:1;display:flex;align-items:center;justify-content:center;gap:12px;padding:14px 14px 0;position:relative;flex-wrap:wrap}
        .qv-front-tag,.qv-back-tag{font-family:'JetBrains Mono',monospace;font-size:9px;color:#1e3050;letter-spacing:0.08em}
        .qv-front-tag{color:#fbbf24}
        .qv-back-tag{color:#4ade80}
        .qv-items{display:flex;flex-direction:row;gap:6px;align-items:center;flex-wrap:wrap;justify-content:center;overflow-x:auto;padding-bottom:4px;max-width:100%;}
        .qv-block{height:58px;min-width:90px;border-radius:13px;border:1.5px solid transparent;display:flex;align-items:center;justify-content:center;padding:0 12px;gap:8px;position:relative;transition:all 0.28s ease;flex-shrink:0;}
        .qv-block::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,0.18) 0%,transparent 58%);border-radius:inherit;pointer-events:none;}
        .qv-enq{animation:blkDrop 0.52s cubic-bezier(0.34,1.56,0.64,1) both;}
        .qv-front{animation:frontPulse 0.6s ease 2 both;}
        @keyframes frontPulse{0%,100%{filter:brightness(1)}50%{filter:brightness(1.45) saturate(1.4)}}
        .qv-pk-ring,.qv-pk-ring2{position:absolute;inset:-4px;border-radius:19px;border:2.5px solid;animation:pkRing 0.78s cubic-bezier(0.22,1,0.36,1) forwards;pointer-events:none}
        .qv-pk-ring2{animation-delay:0.16s}
        .qv-bidx{font-family:'JetBrains Mono',monospace;font-size:8.5px;color:rgba(255,255,255,0.42);}
        .qv-bval{font-family:'JetBrains Mono',monospace;font-size:18px;font-weight:700;color:#fff;text-shadow:0 2px 9px rgba(0,0,0,0.35);}
        .qv-btag{font-family:'JetBrains Mono',monospace;font-size:8px;color:rgba(255,255,255,0.68);white-space:nowrap;}
        .qv-btag.back{color:rgba(74,222,128,0.9);}
        .qv-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;min-width:140px;height:88px;border:1px dashed rgba(255,255,255,0.07);border-radius:13px;gap:7px;}
        .qv-empty.sv-empty-err{border-color:rgba(239,68,68,0.35);animation:svSh 0.38s ease;}
        .qv-ei{font-size:22px;opacity:0.45;}
        .qv-et{font-family:'JetBrains Mono',monospace;font-size:9.5px;color:#1e3050;letter-spacing:0.07em;}
        .qv-fly{position:absolute;top:18px;left:50%;transform:translateX(-50%);height:58px;min-width:90px;border-radius:13px;display:flex;align-items:center;justify-content:center;gap:9px;z-index:20;pointer-events:none;border:1.5px solid rgba(255,255,255,0.28);animation:flyAway 0.76s cubic-bezier(0.22,1,0.36,1) forwards;}
        .qv-fly-v{font-family:'JetBrains Mono',monospace;font-size:18px;font-weight:700;color:#fff;}
        .qv-fly-tag{font-family:'JetBrains Mono',monospace;font-size:8.5px;color:rgba(255,255,255,0.7);letter-spacing:0.06em;}
        .qv-plat{margin-top:5px;width:280px;height:11px;border-radius:7px;background:linear-gradient(90deg,rgba(96,165,250,0.28),rgba(96,165,250,0.14),rgba(96,165,250,0.28));position:relative;overflow:hidden;align-self:center;}
        .qv-plat-shine{position:absolute;top:0;left:-100%;width:55%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.28),transparent);animation:pShine 3.2s ease-in-out infinite;}
        .qv-base{font-family:'JetBrains Mono',monospace;font-size:8px;color:#1e3050;letter-spacing:0.1em;margin-top:4px;margin-bottom:14px;text-align:center;}
        .oi{padding:8px 14px;border-top:1px solid var(--border-subtle);background:rgba(4,8,24,0.6);min-height:54px;flex-shrink:0}
        .oi-badge{display:inline-flex;align-items:center;gap:7px;padding:4px 12px;border-radius:20px;margin-bottom:4px;font-family:'JetBrains Mono',monospace;font-size:9.5px;font-weight:700;animation:stepPop 0.22s ease;border:1px solid;letter-spacing:0.04em}
        .oi-msg{font-family:'JetBrains Mono',monospace;font-size:9.5px;line-height:1.6;animation:fadeUp 0.2s ease;color:var(--text-secondary)}
        .oi-idle{display:flex;align-items:center;gap:8px;font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--text-muted);letter-spacing:0.04em;padding:6px 0}
        .ctrl{display:flex;align-items:center;gap:4px;padding:6px 12px;border-top:1px solid var(--border-subtle);background:rgba(3,6,18,0.65);flex-wrap:wrap;flex-shrink:0}
        .cb{width:28px;height:26px;border-radius:7px;border:1px solid var(--border-medium);background:var(--surface-3);color:var(--text-secondary);font-size:11px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.14s}
        .cb:hover:not(:disabled){background:var(--cyan-dim);color:var(--cyan);border-color:rgba(96,165,250,0.45);box-shadow:0 0 12px var(--cyan-glow)}
        .cb:active:not(:disabled){transform:scale(0.93)}
        .cb:disabled{opacity:0.22;cursor:not-allowed}
        .cp{height:26px;padding:0 13px;border-radius:7px;background:linear-gradient(135deg,#1d4ed8,#3b82f6,#60a5fa);border:1px solid rgba(96,165,250,0.35);color:#fff;font-size:11px;font-weight:700;cursor:pointer;box-shadow:0 0 16px rgba(96,165,250,0.35);transition:all 0.15s}
        .cp:hover{transform:scale(1.06);box-shadow:0 0 28px rgba(96,165,250,0.55)}
        .cp:active{transform:scale(0.97)}
        .cp:disabled{opacity:0.25;cursor:not-allowed;transform:none;box-shadow:none}
        .csep{width:1px;height:14px;background:var(--border-subtle);margin:0 2px}
        .spd{display:flex;gap:2px}
        .sb{padding:3px 7px;border-radius:5px;cursor:pointer;font-family:'JetBrains Mono',monospace;font-size:8px;font-weight:700;border:1px solid var(--border-subtle);background:transparent;color:var(--text-muted);transition:all 0.12s}
        .sb:hover{color:var(--text-secondary);border-color:var(--border-medium)}
        .sb.sa{background:var(--cyan-dim);border-color:rgba(96,165,250,0.4);color:var(--cyan);box-shadow:0 0 8px rgba(96,165,250,0.2)}
        .pr{display:flex;align-items:center;gap:8px;padding:5px 14px;border-top:1px solid var(--border-subtle);flex-shrink:0}
        .pt2{flex:1;height:4px;background:rgba(255,255,255,0.05);border-radius:99px;overflow:hidden;box-shadow:inset 0 1px 2px rgba(0,0,0,0.3)}
        .pf{height:100%;border-radius:99px;transition:width 0.4s cubic-bezier(0.4,0,0.2,1);background:linear-gradient(90deg,#1d4ed8,#60a5fa,#a78bfa);box-shadow:0 0 8px rgba(96,165,250,0.5)}
        .ptx{font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--text-secondary);min-width:32px;text-align:right}
        .slh{padding:5px 14px 2px;font-family:'JetBrains Mono',monospace;font-size:7px;color:var(--text-muted);letter-spacing:0.18em;text-transform:uppercase;font-weight:600;border-top:1px solid var(--border-subtle);flex-shrink:0;display:flex;align-items:center;justify-content:space-between}
        .slh-count{font-size:7px;color:var(--cyan);opacity:0.7}
        .sl{overflow-y:auto;padding:3px 8px 6px;display:flex;flex-direction:column;gap:1.5px;max-height:90px;flex-shrink:0;scrollbar-width:thin;scrollbar-color:rgba(96,165,250,0.2) transparent}
        .si{display:flex;align-items:center;gap:6px;padding:3px 8px;border-radius:5px;cursor:pointer;font-family:'JetBrains Mono',monospace;font-size:8px;color:var(--text-muted);transition:all 0.12s;border:1px solid transparent}
        .si:hover{background:var(--cyan-dim);color:var(--text-secondary);border-color:rgba(96,165,250,0.12)}
        .sl-active{background:rgba(96,165,250,0.09)!important;border-color:rgba(96,165,250,0.22)!important;color:var(--cyan)!important;box-shadow:inset 3px 0 0 var(--cyan)}
        .si-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0;transition:all 0.15s}
        .si-v{opacity:0.55;margin-left:2px}
        .si-ln{margin-left:auto;font-size:7px;color:var(--text-muted);opacity:0.7}
        .toast{position:fixed;bottom:24px;right:24px;padding:8px 16px;border-radius:9px;font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:600;background:rgba(10,20,50,0.97);border:1px solid var(--border-medium);color:var(--green);box-shadow:0 8px 24px rgba(0,0,0,0.5),0 0 16px var(--green-glow);z-index:9999;animation:toastIn 0.25s ease,toastOut 0.3s ease 1.8s forwards}
        ::-webkit-scrollbar{width:4px;height:4px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:rgba(96,165,250,0.2);border-radius:4px} ::-webkit-scrollbar-thumb:hover{background:rgba(96,165,250,0.4)} textarea::-webkit-scrollbar{width:4px}
      `}</style>

      <div className="pg">
        <header className="hd">
          <div className="hd-logo">🔁</div>
          <div>
            <div className="hd-brand">VisuoSlayer</div>
            <div className="hd-tagline">Queue DS Visualizer · Write · Run · Step through every operation</div>
          </div>
          <div className="hd-r">
            <div className="hd-ds-badge">FIFO QUEUE</div>
            <div className="hd-pill" style={{ color:lm.accent, background:`${lm.accent}12`, border:`1px solid ${lm.accent}28` }}>{lm.name}</div>
            <div className="hd-pid">pid:{sessionId}</div>
          </div>
        </header>

        <main className="main">
          {/* LEFT */}
          <div className="panel left">
            <div className="ph">
              <span className="dot" style={{ background:"#ff5f57", boxShadow:"0 0 6px #ff5f57" }} />
              <span className="dot" style={{ background:"#ffbd2e", boxShadow:"0 0 6px #ffbd2e" }} />
              <span className="dot" style={{ background:"#28c840", boxShadow:"0 0 6px #28c840" }} />
              <span className="ptl">Code Editor</span>
              <span style={{ marginLeft:"auto", fontFamily:"'JetBrains Mono',monospace", fontSize:8, color:lm.accent, background:`${lm.accent}12`, border:`1px solid ${lm.accent}28`, padding:"2px 8px", borderRadius:20, fontWeight:700 }}>{lm.name}</span>
            </div>

            <div style={{ flex:termOpen?"0 0 58%":"1", display:"flex", flexDirection:"column", minHeight:0, borderBottom:"1px solid var(--border-subtle)" }}>
              <div className="lb">
                {Object.entries(LANGS).map(([k, m]) => (
                  <button key={k} className={`lt${lang===k?" la":""}`} onClick={() => handleChangeLang(k)} style={lang===k?{borderColor:`${m.accent}35`,color:m.accent,background:`${m.accent}0e`}:{}}>{m.ext}</button>
                ))}
              </div>
              <CodeEditor code={code} setCode={setCode} step={step} errorLineSet={errorLineSet} onKeyDown={onKeyDown} taRef={taRef} />
              {step && os && (
                <div className="alb" style={{ borderColor:os.bd, background:os.bg }}>
                  <span style={{ color:os.c, fontSize:10 }}>{os.icon}</span>
                  <span className="alb-ln" style={{ color:os.c }}>L{step.lineNum+1}</span>
                  <code className="alb-code">{step.codeLine}</code>
                </div>
              )}
              <div className="rr">
                <button className={`btn-run${playing||validating?" running":""}`} onClick={handleRun} disabled={playing||validating}>
                  {validating?"⟳ VisuoSlayer…":playing?"▶ Running…":"▶  Run & Visualize"}
                </button>
                {(steps.length > 0 || error || hasAiErrors) && <button className="btn-rst" onClick={doReset}>↺ Reset</button>}
                <span className="rr-hint">CTRL+ENTER</span>
              </div>
            </div>

            <div className={`tm-wrap${termOpen?" tm-open":" tm-closed"}`}>
              <div className="term-body-wrap" key={termOpen?"open":"closed"}>
                <div className="term-bar">
                  <span className="dot" style={{ background:"#ff5f57", boxShadow:"0 0 5px #ff5f57" }} />
                  <span className="dot" style={{ background:"#ffbd2e", boxShadow:"0 0 5px #ffbd2e" }} />
                  <span className="dot" style={{ background:"#28c840", boxShadow:"0 0 5px #28c840" }} />
                  <span style={{ marginLeft:8, fontFamily:"'JetBrains Mono',monospace", fontSize:8.5, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"1.2px", userSelect:"none" }}>visualoslayer — bash</span>
                  <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:8, color:"var(--text-muted)", marginLeft:8 }}>pid:{sessionId}</span>
                  <button className="term-toggle" onClick={() => setTermOpen(false)} title="Collapse">▾</button>
                </div>
                <Terminal lines={termLines} sessionId={sessionId} validating={validating} currentStepIndex={idx} />
              </div>
            </div>

            {!termOpen && (
              <div className="term-bar-closed" onClick={() => setTermOpen(true)}>
                <span className="dot" style={{ background:"#ff5f57", boxShadow:"0 0 4px #ff5f57" }} />
                <span className="dot" style={{ background:"#ffbd2e", boxShadow:"0 0 4px #ffbd2e" }} />
                <span className="dot" style={{ background:"#28c840", boxShadow:"0 0 4px #28c840" }} />
                <span style={{ marginLeft:8, fontFamily:"'JetBrains Mono',monospace", fontSize:8.5, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"1.2px" }}>visualoslayer — bash</span>
                {termLines.some((l) => l.type==="error"||l.type==="stderr") && <span style={{ marginLeft:8, fontFamily:"'JetBrains Mono',monospace", fontSize:8, color:"#f87171", background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.25)", padding:"1px 7px", borderRadius:10 }}>errors</span>}
                {termLines.some((l) => l.type==="success") && <span style={{ marginLeft:8, fontFamily:"'JetBrains Mono',monospace", fontSize:8, color:"var(--green)", background:"var(--green-dim)", border:"1px solid rgba(74,222,128,0.25)", padding:"1px 7px", borderRadius:10 }}>ok</span>}
                <span style={{ marginLeft:"auto", fontFamily:"'JetBrains Mono',monospace", fontSize:8.5, color:"var(--cyan)", fontWeight:700 }}>▴ open</span>
              </div>
            )}
          </div>

          {/* RIGHT */}
          <div className="panel">
            <div className="ph">
              <span className="dot" style={{ background:"#60a5fa", boxShadow:"0 0 6px #60a5fa" }} />
              <span className="dot" style={{ background:"#f472b6", boxShadow:"0 0 6px #f472b6" }} />
              <span className="dot" style={{ background:"#4ade80", boxShadow:"0 0 6px #4ade80" }} />
              <span className="ptl">Queue Visualization</span>
              {steps.length > 0 && <span style={{ marginLeft:"auto", fontFamily:"'JetBrains Mono',monospace", fontSize:8, color:"var(--cyan)", background:"var(--cyan-dim)", border:"1px solid rgba(96,165,250,0.25)", padding:"2px 9px", borderRadius:20, fontWeight:700 }}>{idx+1} / {steps.length}</span>}
            </div>

            <div style={{ flex:1, display:"flex", flexDirection:"column", minHeight:0, overflow:"hidden" }}>
              <QueueViz step={step} animKey={animKey} idle={idle} />

              <div className="oi">
                {step && os ? (
                  <>
                    <div className="oi-badge" style={{ color:os.c, background:os.bg, borderColor:os.bd }}>
                      <span>{os.icon}</span><span>{os.label}</span>
                      {step.type==="enqueue"&&<span style={{opacity:0.55}}>({step.value})</span>}
                      {(step.type==="dequeue"||step.type==="front")&&step.valid!==false&&step.value!=null&&<span style={{opacity:0.55}}>→ {step.value}</span>}
                      {step.type==="isEmpty"&&<span style={{opacity:0.55}}>→ {String(step.result)}</span>}
                      {step.type==="size"&&<span style={{opacity:0.55}}>→ {step.result}</span>}
                    </div>
                    <div className="oi-msg">{step.message}</div>
                  </>
                ) : (
                  <div className="oi-idle">
                    <span>🔁</span>
                    <span style={{ color:"var(--text-muted)" }}>
                      {idle?"Write a Queue class, use it below, hit Run":hasAiErrors?"VisuoSlayer found errors — see terminal":error?"Fix errors and run again":validating?"VisuoSlayer reviewing your code…":"Waiting…"}
                    </span>
                  </div>
                )}
              </div>

              {steps.length > 0 && (
                <div className="ctrl">
                  <button className="cb" onClick={() => goTo(0)} disabled={idx<=0}>⏮</button>
                  <button className="cb" onClick={() => goTo(idx-1)} disabled={idx<=0}>◀</button>
                  <button className="cp" onClick={() => { if(done||idx>=steps.length-1){setIdx(0);bump();setDone(false);setPlaying(true);}else{clearInterval(timerRef.current);setPlaying(p=>!p);} }}>
                    {playing?"⏸":done?"↺":"▶"}
                  </button>
                  <button className="cb" onClick={() => goTo(idx+1)} disabled={idx>=steps.length-1}>▶</button>
                  <button className="cb" onClick={() => goTo(steps.length-1)} disabled={idx>=steps.length-1}>⏭</button>
                  <div className="csep" />
                  <div className="spd">
                    {[[2,"0.5×"],[1.1,"1×"],[0.55,"2×"]].map(([s,lbl]) => (
                      <button key={s} className={`sb${speed===s?" sa":""}`} onClick={() => setSpeed(s)}>{lbl}</button>
                    ))}
                  </div>
                  <div className="csep" />
                  <button className="cb" onClick={copyQueueState} style={{ fontSize:12 }}>📋</button>
                  <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:8.5, color:"var(--text-secondary)", marginLeft:2 }}>
                    <span style={{ color:"var(--cyan)", fontWeight:700 }}>{idx+1}</span>
                    <span style={{ color:"var(--text-muted)" }}>/{steps.length}</span>
                  </span>
                </div>
              )}

              {steps.length > 0 && (
                <div className="pr">
                  <div className="pt2"><div className="pf" style={{ width:`${prog}%` }} /></div>
                  <span className="ptx">{prog}%</span>
                </div>
              )}

              {steps.length > 0 && (
                <>
                  <div className="slh">
                    <span>OPERATION LOG — click to jump</span>
                    <span className="slh-count">{steps.length} ops</span>
                  </div>
                  <div className="sl" ref={listRef}>
                    {steps.map((s, i) => {
                      const sm = OP[s.type] ?? OP.enqueue;
                      const past = i<idx, active = i===idx;
                      return (
                        <div key={i} className={`si${active?" sl-active":""}`} onClick={() => goTo(i)}>
                          <span className="si-dot" style={{ background:past?"var(--green)":active?sm.c:"var(--text-muted)", boxShadow:active?`0 0 6px ${sm.c}`:past?"0 0 5px var(--green-glow)":"none" }} />
                          <span style={{ color:active?sm.c:past?"var(--text-secondary)":"var(--text-muted)" }}>
                            {sm.label}
                            {s.type==="enqueue"&&<span className="si-v">({s.value})</span>}
                            {s.type==="dequeue"&&s.valid!==false&&<span className="si-v"> → {s.value}</span>}
                            {s.type==="front"&&s.valid!==false&&<span className="si-v"> = {s.value}</span>}
                            {s.type==="isEmpty"&&<span className="si-v"> = {String(s.result)}</span>}
                            {s.type==="size"&&<span className="si-v"> = {s.result}</span>}
                            {(s.type==="dequeue_error"||s.type==="front_error")&&<span style={{color:"#f87171",opacity:0.7}}> ⚠</span>}
                          </span>
                          <span className="si-ln">L{s.lineNum+1}</span>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
      {toast && <div className="toast">{toast}</div>}
    </>
  );
}