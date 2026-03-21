"use client"
import { useState, useRef, useEffect, useCallback } from "react"

// ══════════════════════════════════════════════════════════════════════════════
// COLOR SYSTEM
// ══════════════════════════════════════════════════════════════════════════════
const PALETTE = [
  { g1:"#f59e0b", g2:"#d97706", glow:"rgba(245,158,11,0.6)",  border:"#f59e0b" },
  { g1:"#38bdf8", g2:"#0ea5e9", glow:"rgba(56,189,248,0.6)",  border:"#38bdf8" },
  { g1:"#a78bfa", g2:"#7c3aed", glow:"rgba(167,139,250,0.6)", border:"#a78bfa" },
  { g1:"#34d399", g2:"#059669", glow:"rgba(52,211,153,0.6)",  border:"#34d399" },
  { g1:"#f472b6", g2:"#db2777", glow:"rgba(244,114,182,0.6)", border:"#f472b6" },
  { g1:"#fb923c", g2:"#ea580c", glow:"rgba(251,146,60,0.6)",  border:"#fb923c" },
  { g1:"#60a5fa", g2:"#2563eb", glow:"rgba(96,165,250,0.6)",  border:"#60a5fa" },
  { g1:"#e879f9", g2:"#a21caf", glow:"rgba(232,121,249,0.6)", border:"#e879f9" },
]
const col = (v) => PALETTE[Math.abs(Math.round(v) || 0) % PALETTE.length]

const OP = {
  enqueue:       { label:"ENQUEUE",    icon:"→",  c:"#34d399", bg:"rgba(52,211,153,0.1)",   bd:"rgba(52,211,153,0.3)"  },
  dequeue:       { label:"DEQUEUE",    icon:"←",  c:"#f59e0b", bg:"rgba(245,158,11,0.1)",   bd:"rgba(245,158,11,0.3)"  },
  dequeue_error: { label:"UNDERFLOW",  icon:"⚠",  c:"#ef4444", bg:"rgba(239,68,68,0.1)",    bd:"rgba(239,68,68,0.3)"   },
  peek:          { label:"PEEK/FRONT", icon:"👁",  c:"#38bdf8", bg:"rgba(56,189,248,0.1)",   bd:"rgba(56,189,248,0.3)"  },
  peek_error:    { label:"EMPTY",      icon:"⚠",  c:"#ef4444", bg:"rgba(239,68,68,0.1)",    bd:"rgba(239,68,68,0.3)"   },
  isEmpty:       { label:"IS EMPTY?",  icon:"∅",  c:"#a78bfa", bg:"rgba(167,139,250,0.1)",  bd:"rgba(167,139,250,0.3)" },
  size:          { label:"SIZE",       icon:"#",  c:"#fb923c", bg:"rgba(251,146,60,0.1)",   bd:"rgba(251,146,60,0.3)"  },
}

const LANGS = {
  javascript: { name:"JavaScript", ext:"JS",  accent:"#f7df1e" },
  typescript: { name:"TypeScript", ext:"TS",  accent:"#3178c6" },
  python:     { name:"Python",     ext:"PY",  accent:"#4ec9b0" },
  java:       { name:"Java",       ext:"JV",  accent:"#ed8b00" },
  cpp:        { name:"C++",        ext:"C++", accent:"#00b4d8" },
  csharp:     { name:"C#",         ext:"C#",  accent:"#9b4f96" },
  go:         { name:"Go",         ext:"GO",  accent:"#00add8" },
  rust:       { name:"Rust",       ext:"RS",  accent:"#f46623" },
}

// ══════════════════════════════════════════════════════════════════════════════
// CODE TEMPLATES — complete Queue implementations
// ══════════════════════════════════════════════════════════════════════════════
const TPL = {
javascript:`// Complete Queue implementation — JavaScript
// The visualizer executes your REAL code via sandbox.
// enqueue(N) adds to rear · dequeue() removes from front · FIFO

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

  peek() {        // front element, no removal
    if (this.isEmpty()) return undefined;
    return this.items[0];
  }

  front() {       // alias for peek
    return this.peek();
  }

  isEmpty() {
    return this.items.length === 0;
  }

  get size() {
    return this.items.length;
  }
}

// — Use your queue here —
const q = new Queue();
q.enqueue(10);
q.enqueue(25);
q.enqueue(37);
q.peek();
q.dequeue();
q.enqueue(99);
q.enqueue(4);
q.isEmpty();
q.dequeue();
q.dequeue();`,

typescript:`// Complete Queue implementation — TypeScript
class Queue<T> {
  private items: T[] = [];

  enqueue(element: T): void {
    this.items.push(element);
  }

  dequeue(): T | undefined {
    if (this.isEmpty()) return undefined;
    return this.items.shift();
  }

  peek(): T | undefined {
    if (this.isEmpty()) return undefined;
    return this.items[0];
  }

  front(): T | undefined {
    return this.peek();
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  get size(): number {
    return this.items.length;
  }
}

// — Use your queue here —
const q = new Queue<number>();
q.enqueue(10);
q.enqueue(25);
q.enqueue(37);
q.peek();
q.dequeue();
q.enqueue(99);
q.enqueue(42);
q.isEmpty();`,

python:`# Complete Queue implementation — Python
class Queue:
    def __init__(self):
        self.items = []

    def enqueue(self, element):
        self.items.append(element)

    def dequeue(self):
        if self.is_empty():
            return None
        return self.items.pop(0)

    def peek(self):
        if self.is_empty():
            return None
        return self.items[0]

    def front(self):
        return self.peek()

    def is_empty(self):
        return len(self.items) == 0

    def size(self):
        return len(self.items)

# — Use your queue here —
q = Queue()
q.enqueue(10)
q.enqueue(25)
q.enqueue(37)
q.peek()
q.dequeue()
q.enqueue(99)
q.enqueue(42)
q.is_empty()`,

java:`// Complete Queue implementation — Java
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

        public T peek() {
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
        q.peek();
        q.dequeue();
        q.enqueue(99);
        q.enqueue(42);
        q.isEmpty();
    }
}`,

cpp:`// Complete Queue implementation — C++
#include <iostream>
#include <deque>
using namespace std;

class Queue {
private:
    deque<int> items;

public:
    void enqueue(int element) {
        items.push_back(element);
    }

    int dequeue() {
        if (isEmpty()) return -1;
        int front = items.front();
        items.pop_front();
        return front;
    }

    int peek() {
        if (isEmpty()) return -1;
        return items.front();
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
    q.peek();
    q.dequeue();
    q.enqueue(99);
    q.enqueue(42);
    q.isEmpty();
    return 0;
}`,

csharp:`// Complete Queue implementation — C#
using System;
using System.Collections.Generic;

class Program {
    class Queue<T> {
        private List<T> items = new List<T>();

        public void Enqueue(T element) {
            items.Add(element);
        }

        public T Dequeue() {
            if (IsEmpty()) return default(T);
            T front = items[0];
            items.RemoveAt(0);
            return front;
        }

        public T Peek() {
            if (IsEmpty()) return default(T);
            return items[0];
        }

        public bool IsEmpty() {
            return items.Count == 0;
        }

        public int Size() {
            return items.Count;
        }
    }

    static void Main() {
        Queue<int> q = new Queue<int>();
        q.Enqueue(10);
        q.Enqueue(25);
        q.Enqueue(37);
        q.Peek();
        q.Dequeue();
        q.Enqueue(99);
        q.Enqueue(42);
        q.IsEmpty();
    }
}`,

go:`// Complete Queue implementation — Go
package main

import "fmt"

type Queue struct {
    items []int
}

func (q *Queue) Enqueue(element int) {
    q.items = append(q.items, element)
}

func (q *Queue) Dequeue() (int, bool) {
    if q.IsEmpty() {
        return 0, false
    }
    front := q.items[0]
    q.items = q.items[1:]
    return front, true
}

func (q *Queue) Peek() (int, bool) {
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
    q.Peek()
    q.Dequeue()
    q.Enqueue(99)
    q.Enqueue(42)
    q.IsEmpty()
    fmt.Println("Done")
}`,

rust:`// Complete Queue implementation — Rust
use std::collections::VecDeque;

struct Queue {
    items: VecDeque<i32>,
}

impl Queue {
    fn new() -> Queue {
        Queue { items: VecDeque::new() }
    }

    fn enqueue(&mut self, element: i32) {
        self.items.push_back(element);
    }

    fn dequeue(&mut self) -> Option<i32> {
        self.items.pop_front()
    }

    fn peek(&self) -> Option<&i32> {
        self.items.front()
    }

    fn is_empty(&self) -> bool {
        self.items.is_empty()
    }

    fn size(&self) -> usize {
        self.items.len()
    }
}

fn main() {
    let mut q = Queue::new();
    q.enqueue(10);
    q.enqueue(25);
    q.enqueue(37);
    q.peek();
    q.dequeue();
    q.enqueue(99);
    q.enqueue(42);
    q.is_empty();
}`,
}

// ══════════════════════════════════════════════════════════════════════════════
// UTILITIES — brace counting, class block extraction
// ══════════════════════════════════════════════════════════════════════════════

function countBraces(line) {
  let opens = 0, closes = 0, inStr = false, strChar = ""
  const ci = line.indexOf("//")
  const cleaned = ci >= 0 ? line.slice(0, ci) : line
  for (let i = 0; i < cleaned.length; i++) {
    const ch = cleaned[i]
    if (!inStr && (ch === '"' || ch === "'" || ch === "`")) { inStr = true; strChar = ch; continue }
    if (inStr && ch === strChar && cleaned[i-1] !== "\\") { inStr = false; continue }
    if (!inStr) { if (ch === "{") opens++; else if (ch === "}") closes++ }
  }
  return { opens, closes }
}

// FIX: use [^{]* (not (?:\s+[^{]*)?) so generics like Queue<T> are matched correctly
function extractClassBlock(code, className) {
  const re = new RegExp("\\bclass\\s+" + className + "[^{]*\\{")
  const match = re.exec(code)
  if (!match) return null
  let depth = 1, i = match.index + match[0].length
  while (i < code.length && depth > 0) {
    if (code[i] === "{") depth++
    else if (code[i] === "}") depth--
    i++
  }
  return { text: code.slice(match.index, i), start: match.index, end: i }
}

// FIX: detect field name from multiple patterns (handles TypeScript class fields too)
function detectFieldName(classText) {
  // Pattern 1: this.x = [] (JS/TS constructor)
  const m1 = /this\.(\w+)\s*=\s*(?:\[\s*\]|new\s+(?:Array|VecDeque|ArrayList|LinkedList)\s*[(<])/.exec(classText)
  if (m1) return m1[1]
  // Pattern 2: private/public items: T[] = [] (TypeScript class field)
  const m2 = /(?:private|public|protected|readonly)?\s+(\w+)\s*(?::\s*[\w<>\[\]|,\s]+)?\s*=\s*\[\s*\]/.exec(classText)
  if (m2) return m2[1]
  // Pattern 3: named field heuristic
  const m3 = /(?:items|elements|data|queue|arr|list|buf|buffer)\b/.exec(classText)
  if (m3) return m3[0]
  return "items"
}

// ══════════════════════════════════════════════════════════════════════════════
// JAVASCRIPT / TYPESCRIPT REAL EXECUTION ENGINE
// ══════════════════════════════════════════════════════════════════════════════
function runJavaScript(code) {
  const classMatch = /\bclass\s+(\w+)/.exec(code)
  if (!classMatch) {
    return { steps:[], errors:["No class definition found.\nWrite a Queue class with enqueue / dequeue / peek / isEmpty, then use it below."] }
  }
  const className = classMatch[1]
  const classBlock = extractClassBlock(code, className)
  if (!classBlock) {
    return { steps:[], errors:[`Could not parse class '${className}'. Check that your class has matching opening and closing braces.`] }
  }
  const field = detectFieldName(classBlock.text)
  const execCode = code.slice(0, classBlock.start) + "\n" + code.slice(classBlock.end)

  const instrumented = `
"use strict";
const __S = [];
class ${className} {
  constructor() { this.${field} = []; }

  enqueue(v) {
    this.${field}.push(v);
    __S.push({ type:"enqueue", value:v, queue:[...this.${field}] });
  }
  push(v) { return this.enqueue(v); }
  add(v)  { return this.enqueue(v); }

  dequeue() {
    if (this.${field}.length === 0) {
      __S.push({ type:"dequeue_error", value:null, queue:[] });
      return undefined;
    }
    const v = this.${field}.shift();
    __S.push({ type:"dequeue", value:v, queue:[...this.${field}] });
    return v;
  }
  poll()   { return this.dequeue(); }
  remove() { return this.dequeue(); }
  shift()  { return this.dequeue(); }

  peek() {
    if (this.${field}.length === 0) {
      __S.push({ type:"peek_error", value:null, queue:[] });
      return undefined;
    }
    const v = this.${field}[0];
    __S.push({ type:"peek", value:v, queue:[...this.${field}] });
    return v;
  }
  front()   { return this.peek(); }
  element() { return this.peek(); }

  isEmpty() {
    const e = this.${field}.length === 0;
    __S.push({ type:"isEmpty", result:e, queue:[...this.${field}] });
    return e;
  }
  empty() { return this.isEmpty(); }

  size() {
    const s = this.${field}.length;
    __S.push({ type:"size", result:s, queue:[...this.${field}] });
    return s;
  }
  get length() { return this.${field}.length; }
  get size()   { return this.${field}.length; }
  toString()   { return "[Queue: " + this.${field}.join(", ") + "]"; }
}
${execCode}
return __S;
`.trim()

  let rawSteps
  try {
    const stub = { log:()=>{}, warn:()=>{}, error:()=>{}, info:()=>{} }
    // eslint-disable-next-line no-new-func
    const fn = new Function("console", instrumented)
    rawSteps = fn(stub)
  } catch (e) {
    return { steps:[], errors:[e.message] }
  }

  if (!rawSteps?.length) {
    return { steps:[], errors:["No queue operations were executed.\nCall enqueue(N), dequeue(), peek(), or isEmpty() on your queue instance."] }
  }

  // Map steps to original line numbers
  const lines = code.split("\n")
  let charCursor = 0, classEndLine = 0
  for (let i = 0; i < lines.length; i++) {
    if (charCursor >= classBlock.end) { classEndLine = i; break }
    charCursor += lines[i].length + 1
  }
  const callLineNums = []
  for (let i = classEndLine; i < lines.length; i++) {
    const t = lines[i].trim()
    if (!t || t.startsWith("//") || t.startsWith("*") || t.startsWith("/*")) continue
    if (/\.(enqueue|dequeue|push|pop|peek|front|element|isEmpty|is_empty|empty|size|poll|remove|add)\s*\(/.test(t)) {
      callLineNums.push(i)
    }
  }

  const steps = rawSteps.map((s, idx) => ({
    ...s,
    lineNum:  callLineNums[idx] ?? classEndLine,
    codeLine: lines[callLineNums[idx] ?? classEndLine]?.trim() ?? "",
    message:  buildMessage(s),
  }))
  return { steps, errors:[] }
}

// ══════════════════════════════════════════════════════════════════════════════
// SCOPE-AWARE PARSER — Python, Java, C++, C#, Go, Rust
// ══════════════════════════════════════════════════════════════════════════════
function parseScoped(code, lang) {
  if (lang === "python") return parsePython(code)
  return parseBraced(code, lang)
}

function parsePython(code) {
  const lines = code.split("\n")
  const execLines = []
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i], trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const indent = line.match(/^(\s*)/)?.[1]?.length ?? 0
    if (indent === 0 &&
      !trimmed.startsWith("class ") && !trimmed.startsWith("def ") &&
      !trimmed.startsWith("import ") && !trimmed.startsWith("from ") &&
      !trimmed.startsWith("if __name__")) {
      execLines.push({ lineIdx:i, line:trimmed })
    }
    if (i > 0 && lines[i-1].trim().includes("__main__") && indent === 4) {
      execLines.push({ lineIdx:i, line:trimmed })
    }
  }
  return simulateOps(execLines, lines, lang)
}

function parseBraced(code, lang) {
  const lines = code.split("\n")
  const execLines = []
  let depth = 0, inClass = false, classDepth = -1
  let inMain = false, mainDepth = -1, mlComment = false
  const needsMain = ["java","cpp","csharp","go","rust"]

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i], trimmed = line.trim()
    if (mlComment) { if (trimmed.includes("*/")) mlComment = false; continue }
    if (trimmed.startsWith("/*")) { mlComment = true; continue }
    if (trimmed.startsWith("//") || trimmed.startsWith("*") || trimmed.startsWith("#")) continue
    if (!trimmed) continue

    const { opens, closes } = countBraces(line)
    const depthBefore = depth
    depth += opens - closes

    if (/\bclass\s+\w+/.test(trimmed)) { inClass = true; classDepth = depthBefore }
    if (needsMain.includes(lang)) {
      if (/\bmain\s*\(/.test(trimmed) || /\bfunc\s+main\s*\(/.test(trimmed)) { inMain = true; mainDepth = depthBefore }
    }
    if (inClass && depth <= classDepth) { inClass = false; classDepth = -1 }
    if (inMain && depth <= mainDepth)   { inMain  = false; mainDepth  = -1 }

    const isExec = needsMain.includes(lang)
      ? (inMain && depth === mainDepth + 1 && !inClass)
      : (depth === 0 && !inClass)

    if (isExec) execLines.push({ lineIdx:i, line:trimmed })
  }
  return simulateOps(execLines, lines, lang)
}

// ── Simulate operations from parsed exec lines ────────────────────────────────
function simulateOps(execLines, allLines, lang) {
  const steps = [], errors = [], queue = []

  const ENQ_RE = [
    /\.(?:enqueue|Enqueue|push|add|offer|push_back|append)\s*\(\s*(-?[\d.]+)\s*\)/,
    /\bappend\s*\(\s*\w+\s*,\s*(-?[\d.]+)\s*\)/,
  ]
  const DEQ_RE  = /\.(?:dequeue|Dequeue|poll|remove|shift|pop_front|pop)\s*\(\s*\)/
  const PEEK_RE = /\.(?:peek|Peek|front|Front|element|Element|head)\s*\(\s*\)/
  const EMPTY_RE = /\.(?:isEmpty|IsEmpty|is_empty|empty|Empty)\s*\(\s*\)/
  const SIZE_RE  = /\.(?:size|Size|length|Length)\s*\(\s*\)/

  for (const { lineIdx, line } of execLines) {
    const origLine = allLines[lineIdx]?.trim() ?? line

    let enqVal = null
    for (const re of ENQ_RE) {
      const m = line.match(re); if (m) { enqVal = parseFloat(m[1]); break }
    }
    if (enqVal !== null && !isNaN(enqVal)) {
      queue.push(enqVal)
      steps.push({ type:"enqueue", value:enqVal, queue:[...queue], lineNum:lineIdx, codeLine:origLine, message:buildMessage({ type:"enqueue", value:enqVal, queue:[...queue] }) })
      continue
    }
    if (DEQ_RE.test(line)) {
      if (queue.length === 0) {
        steps.push({ type:"dequeue_error", value:null, queue:[], lineNum:lineIdx, codeLine:origLine, message:buildMessage({ type:"dequeue_error" }) })
      } else {
        const v = queue.shift()
        steps.push({ type:"dequeue", value:v, queue:[...queue], lineNum:lineIdx, codeLine:origLine, message:buildMessage({ type:"dequeue", value:v, queue:[...queue] }) })
      }
      continue
    }
    if (PEEK_RE.test(line)) {
      if (queue.length === 0) {
        steps.push({ type:"peek_error", value:null, queue:[], lineNum:lineIdx, codeLine:origLine, message:buildMessage({ type:"peek_error" }) })
      } else {
        const v = queue[0]
        steps.push({ type:"peek", value:v, queue:[...queue], lineNum:lineIdx, codeLine:origLine, message:buildMessage({ type:"peek", value:v, queue:[...queue] }) })
      }
      continue
    }
    if (EMPTY_RE.test(line)) {
      const e = queue.length === 0
      steps.push({ type:"isEmpty", result:e, queue:[...queue], lineNum:lineIdx, codeLine:origLine, message:buildMessage({ type:"isEmpty", result:e, queue:[...queue] }) })
      continue
    }
    if (SIZE_RE.test(line)) {
      const s = queue.length
      steps.push({ type:"size", result:s, queue:[...queue], lineNum:lineIdx, codeLine:origLine, message:buildMessage({ type:"size", result:s, queue:[...queue] }) })
      continue
    }
  }

  if (steps.length === 0) {
    errors.push("No queue operations detected in the execution body.\nMake sure you call enqueue(N), dequeue(), peek(), isEmpty() on your queue instance.\nValues must be numeric literals, e.g. enqueue(42).")
  }
  return { steps, errors }
}

// ── Human-readable step message ───────────────────────────────────────────────
function buildMessage(s) {
  switch (s.type) {
    case "enqueue":       return `enqueue(${s.value})  →  added ${s.value} to rear · queue size: ${s.queue?.length}`
    case "dequeue":       return `dequeue()  →  returned ${s.value}  ·  removed from front · queue size: ${s.queue?.length}`
    case "dequeue_error": return `dequeue()  →  ⚠ Queue Underflow! Cannot dequeue from an empty queue.`
    case "peek":          return `peek()  →  front element is ${s.value}  ·  queue unchanged`
    case "peek_error":    return `peek()  →  ⚠ Queue is empty! Nothing to peek at.`
    case "isEmpty":       return `isEmpty()  →  ${s.result}  ·  queue has ${s.queue?.length ?? 0} element${s.queue?.length !== 1 ? "s" : ""}`
    case "size":          return `size()  →  ${s.result}  ·  queue contains ${s.result} element${s.result !== 1 ? "s" : ""}`
    default:              return ""
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// AI VALIDATION GATE — uses /api/chat, fails open on error
// ══════════════════════════════════════════════════════════════════════════════
async function validateWithAI(code, lang) {
  const prompt = `You are a strict code reviewer for a Queue data-structure visualizer.

The user has written a Queue implementation in ${lang}. Your job:
1. Check if it is a CORRECT and COMPLETE Queue with at least enqueue and dequeue.
2. Check FIFO order: enqueue adds to rear, dequeue removes from front.
3. Look for logic bugs: wrong order, dequeue from wrong end, peek removing elements, isEmpty wrong, etc.
4. Look for syntax errors that would prevent execution.

Return ONLY valid JSON — no markdown:
{
  "valid": true | false,
  "reason": "one sentence summary",
  "errors": [
    { "line": <1-based line number>, "message": "<what is wrong>" }
  ]
}

If valid is true, errors must be [].

Code:
\`\`\`${lang}
${code}
\`\`\``

  try {
    const res = await fetch("/api/chat", {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ messages:[{ role:"user", content:prompt }] }),
    })
    const data = await res.json()
    if (data.error) return { valid:true, reason:"", errors:[], apiError:data.error }
    const raw = (data.content ?? "").replace(/```json|```/gi, "").trim()
    const parsed = JSON.parse(raw)
    return { valid:!!parsed.valid, reason:parsed.reason ?? "", errors:Array.isArray(parsed.errors) ? parsed.errors : [], apiError:null }
  } catch (e) {
    return { valid:true, reason:"", errors:[], apiError:e.message }
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// MASTER ENTRY POINT
// ══════════════════════════════════════════════════════════════════════════════
function runCode(code, lang) {
  const trimmed = code.trim()
  if (!trimmed) return { steps:[], errors:["Please write some code first."] }
  if (lang === "javascript" || lang === "typescript") return runJavaScript(code)
  return parseScoped(code, lang)
}

// ══════════════════════════════════════════════════════════════════════════════
// QUEUE VISUALIZATION
// ══════════════════════════════════════════════════════════════════════════════
function QueueViz({ step, animKey, idle }) {
  const [flyItem, setFlyItem] = useState(null)

  useEffect(() => {
    if (step?.type === "dequeue" && step.value !== null && step.value !== undefined) {
      setFlyItem({ v:step.value, key:animKey })
      const t = setTimeout(() => setFlyItem(null), 900)
      return () => clearTimeout(t)
    }
    if (step?.type !== "dequeue") setFlyItem(null)
  }, [animKey, step?.type])

  const queue    = step?.queue ?? []
  const isEnq    = step?.type === "enqueue"
  const isPeek   = step?.type === "peek"
  const isDeq    = step?.type === "dequeue"
  const isEmpty  = step?.type === "isEmpty"
  const isSz     = step?.type === "size"
  const isErr    = step?.type === "dequeue_error" || step?.type === "peek_error"

  return (
    <div className={`qv${isErr ? " qv-err" : ""}`} key={isErr ? `e${animKey}` : "qv"}>

      {/* ── Metrics strip ── */}
      <div className="qv-metrics">
        {[
          { lbl:"SIZE",   val:queue.length,                         c:"#38bdf8" },
          { lbl:"FRONT",  val:queue.length ? queue[0]         : "—", c:"#f59e0b" },
          { lbl:"REAR",   val:queue.length ? queue[queue.length-1] : "—", c:"#34d399" },
          { lbl:"POLICY", val:"FIFO",                               c:"#a78bfa" },
        ].map(m => (
          <div className="qv-m" key={m.lbl}>
            <span className="qv-ml">{m.lbl}</span>
            <span className="qv-mv" style={{ color:m.c }}>{String(m.val)}</span>
          </div>
        ))}
      </div>

      {/* ── Queue lane ── */}
      <div className="qv-lane-wrap">

        {/* Dequeue fly-off */}
        {flyItem && (
          <div key={flyItem.key} className="qv-fly"
            style={{ background:`linear-gradient(135deg,${col(flyItem.v).g1},${col(flyItem.v).g2})`, boxShadow:`0 0 40px ${col(flyItem.v).glow}` }}>
            <span className="qv-fly-v">{flyItem.v}</span>
            <span className="qv-fly-tag">← DEQUEUE</span>
          </div>
        )}

        {/* FRONT label */}
        <div className="qv-end-label qv-front-label">
          <div className="qv-el-line" style={{ background:"linear-gradient(180deg,transparent,#f59e0b88)" }}/>
          <span style={{ color:"#f59e0b" }}>FRONT</span>
          <span className="qv-el-arrow" style={{ color:"#f59e0b" }}>←</span>
        </div>

        {/* Horizontal queue */}
        <div className="qv-lane">
          {queue.length === 0 && !flyItem ? (
            <div className={`qv-empty${isErr ? " qv-empty-err" : ""}`}>
              <div className="qv-ei">{idle ? "🚌" : isErr ? "⚠" : "∅"}</div>
              <div className="qv-et">{idle ? "Run code to start" : isErr ? "Queue underflow!" : "Queue is empty"}</div>
            </div>
          ) : queue.map((v, i) => {
            const isFront  = i === 0
            const isRear   = i === queue.length - 1
            const isNewEnq = isRear && isEnq
            const isPkFr   = isFront && isPeek
            const ec       = isEmpty || isSz
            const c        = col(v)
            return (
              <div
                key={`${v}-${i}-${isNewEnq ? animKey : "s"}`}
                className={[
                  "qv-block",
                  isNewEnq ? "qv-enq" : "",
                  isPkFr   ? "qv-pk"  : "",
                  isFront  ? "qv-front-block" : "",
                  isRear   ? "qv-rear-block"  : "",
                  ec       ? "qv-ec"  : "",
                ].join(" ")}
                style={{
                  background: `linear-gradient(135deg,${c.g1},${c.g2})`,
                  boxShadow:  isFront || isRear
                    ? `0 0 32px ${c.glow}, 0 4px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.22)`
                    : `0 3px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.12)`,
                  borderColor: (isFront || isRear) ? c.border : "rgba(255,255,255,0.08)",
                  height: `${Math.max(52, 68 - i * 2)}px`,
                }}>
                {isPkFr && <div className="qv-pr"  key={`r1-${animKey}`} style={{ borderColor:c.border }}/>}
                {isPkFr && <div className="qv-pr2" key={`r2-${animKey}`} style={{ borderColor:c.border }}/>}
                <span className="qv-bidx">[{i}]</span>
                <span className="qv-bval">{v}</span>
              </div>
            )
          })}
        </div>

        {/* REAR label */}
        <div className="qv-end-label qv-rear-label">
          <div className="qv-el-line" style={{ background:"linear-gradient(180deg,transparent,#34d39988)" }}/>
          <span style={{ color:"#34d399" }}>REAR</span>
          <span className="qv-el-arrow" style={{ color:"#34d399" }}>←</span>
        </div>

        {/* Enqueue arrow */}
        {isEnq && (
          <div className="qv-enq-arrow" key={`ea-${animKey}`}>
            <span className="qv-ea-val">{step.value}</span>
            <span className="qv-ea-arrow">→</span>
          </div>
        )}
      </div>

      {/* Rail */}
      <div className="qv-rail">
        <div className="qv-rail-shine"/>
      </div>
      <p className="qv-base">FIFO — First In, First Out</p>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════════
export default function QueueDSPage() {
  const [lang,       setLang]       = useState("javascript")
  const [code,       setCode]       = useState(TPL.javascript)
  const [steps,      setSteps]      = useState([])
  const [idx,        setIdx]        = useState(-1)
  const [error,      setError]      = useState("")
  const [playing,    setPlaying]    = useState(false)
  const [speed,      setSpeed]      = useState(1.1)
  const [animKey,    setAnimKey]    = useState(0)
  const [done,       setDone]       = useState(false)
  const [validating, setValidating] = useState(false)
  const [aiErrors,   setAiErrors]   = useState([])
  const [aiReason,   setAiReason]   = useState("")
  const [apiNote,    setApiNote]    = useState("")

  const timerRef = useRef(null)
  const taRef    = useRef(null)
  const listRef  = useRef(null)

  const bump = () => setAnimKey(k => k + 1)

  const doReset = useCallback(() => {
    clearInterval(timerRef.current)
    setSteps([]); setIdx(-1); setError("")
    setPlaying(false); setDone(false)
    setAiErrors([]); setAiReason(""); setApiNote("")
  }, [])

  const changeLang = (l) => { setLang(l); setCode(TPL[l] ?? ""); doReset() }

  const handleRun = async () => {
    doReset()
    setValidating(true)
    const validation = await validateWithAI(code, lang)
    setValidating(false)
    if (validation.apiError) setApiNote(validation.apiError)
    if (!validation.valid) { setAiReason(validation.reason ?? ""); setAiErrors(validation.errors ?? []); return }
    const { steps:s, errors } = runCode(code, lang)
    if (errors.length) { setError(errors.join("\n")); return }
    setSteps(s); setIdx(0); bump(); setPlaying(true)
  }

  const goTo = useCallback((i) => {
    clearInterval(timerRef.current); setPlaying(false)
    setIdx(Math.max(0, Math.min(i, steps.length - 1))); bump()
  }, [steps.length])

  // Ctrl+Enter shortcut
  useEffect(() => {
    const h = (e) => { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); handleRun() } }
    window.addEventListener("keydown", h)
    return () => window.removeEventListener("keydown", h)
  }, [code, lang])

  // Autoplay
  useEffect(() => {
    if (!playing || !steps.length) return
    timerRef.current = setInterval(() => {
      setIdx(prev => {
        if (prev >= steps.length - 1) { clearInterval(timerRef.current); setPlaying(false); setDone(true); return prev }
        bump(); return prev + 1
      })
    }, speed * 1000)
    return () => clearInterval(timerRef.current)
  }, [playing, steps, speed])

  useEffect(() => {
    listRef.current?.querySelector(".sl-active")?.scrollIntoView({ block:"nearest", behavior:"smooth" })
  }, [idx])

  const onKeyDown = (e) => {
    if (e.key !== "Tab") return
    e.preventDefault()
    const s = e.target.selectionStart, en = e.target.selectionEnd
    const nv = code.slice(0, s) + "  " + code.slice(en)
    setCode(nv)
    requestAnimationFrame(() => {
      if (taRef.current) { taRef.current.selectionStart = s + 2; taRef.current.selectionEnd = s + 2 }
    })
  }

  const step         = steps[idx] ?? null
  const os           = step ? (OP[step.type] ?? OP.enqueue) : null
  const prog         = steps.length ? Math.round(((idx + 1) / steps.length) * 100) : 0
  const hasAiErrors  = aiErrors.length > 0
  const idle         = steps.length === 0 && !error && !hasAiErrors
  const lm           = LANGS[lang]
  const codeLines    = code.split("\n")
  const errorLineSet = new Set(aiErrors.map(e => (e.line ?? 1) - 1))

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:#050308;color:#e2e8f0;font-family:'DM Sans',sans-serif;min-height:100vh}

        /* PAGE */
        .pg{min-height:100vh;display:flex;flex-direction:column;
          background:
            radial-gradient(ellipse 60% 45% at 5%  0%, rgba(245,158,11,0.1)  0%,transparent 55%),
            radial-gradient(ellipse 50% 40% at 95% 100%,rgba(52,211,153,0.08) 0%,transparent 55%),
            radial-gradient(ellipse 40% 35% at 50% 55%, rgba(56,189,248,0.05) 0%,transparent 60%),
            #050308}

        /* HEADER */
        .hd{position:sticky;top:0;z-index:200;display:flex;align-items:center;gap:14px;
          padding:14px 40px;background:rgba(5,3,8,0.9);backdrop-filter:blur(22px) saturate(160%);
          border-bottom:1px solid rgba(245,158,11,0.14)}
        .hd-logo{width:40px;height:40px;border-radius:12px;flex-shrink:0;
          background:linear-gradient(135deg,#92400e,#f59e0b);
          display:flex;align-items:center;justify-content:center;font-size:20px;
          box-shadow:0 0 24px rgba(245,158,11,0.5)}
        .hd-title{font-family:'Syne',sans-serif;font-size:19px;font-weight:800;letter-spacing:-0.4px;
          background:linear-gradient(90deg,#fde68a,#f59e0b,#34d399,#38bdf8);
          -webkit-background-clip:text;-webkit-text-fill-color:transparent}
        .hd-sub{font-size:10px;color:#292524;font-family:'JetBrains Mono',monospace;margin-top:2px}
        .hd-badge{margin-left:auto;background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.25);
          color:#f59e0b;font-size:10px;font-family:'JetBrains Mono',monospace;
          padding:4px 12px;border-radius:20px;letter-spacing:0.05em;white-space:nowrap}

        /* MAIN GRID */
        .main{display:grid;grid-template-columns:1fr 1fr;gap:18px;
          padding:20px 40px 60px;max-width:1440px;margin:0 auto;width:100%;flex:1}
        @media(max-width:960px){.main{grid-template-columns:1fr;padding:16px 14px 60px}.hd{padding:12px 16px}}

        /* PANEL */
        .panel{background:rgba(9,7,4,0.82);border:1px solid rgba(255,255,255,0.06);
          border-radius:18px;display:flex;flex-direction:column;overflow:hidden;
          box-shadow:0 24px 60px rgba(0,0,0,0.6)}
        .ph{padding:12px 18px;border-bottom:1px solid rgba(255,255,255,0.05);
          background:rgba(14,10,5,0.65);display:flex;align-items:center;gap:7px}
        .pd{width:10px;height:10px;border-radius:50%}
        .pt{font-family:'JetBrains Mono',monospace;font-size:9.5px;color:#292524;
          text-transform:uppercase;letter-spacing:1.5px;margin-left:8px}

        /* LANG TABS */
        .lb{display:flex;gap:4px;flex-wrap:wrap;padding:11px 16px;
          border-bottom:1px solid rgba(255,255,255,0.04);background:rgba(10,7,3,0.5)}
        .lt{padding:5px 11px;border-radius:7px;cursor:pointer;
          font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;
          border:1px solid rgba(255,255,255,0.07);background:transparent;color:#292524;
          transition:all 0.17s;letter-spacing:0.03em}
        .lt:hover{color:#44403c;border-color:rgba(255,255,255,0.12)}
        .lt.la{background:rgba(245,158,11,0.14);border-color:rgba(245,158,11,0.38);color:#fbbf24}

        /* CODE EDITOR */
        .cw{flex:1;position:relative;display:flex;flex-direction:column;min-height:0}
        .ln-col{position:absolute;left:0;top:0;bottom:0;width:40px;padding:18px 0;
          border-right:1px solid rgba(255,255,255,0.04);overflow:hidden;pointer-events:none;
          display:flex;flex-direction:column}
        .ln{font-family:'JetBrains Mono',monospace;font-size:11px;color:#1c1917;
          text-align:right;padding-right:9px;line-height:1.7;height:22px;flex-shrink:0}
        .ln.aln{color:#f59e0b;background:rgba(245,158,11,0.07);border-radius:3px}
        .ln.eln{color:#ef4444!important;background:rgba(239,68,68,0.12);border-radius:3px}
        .al-overlay{position:absolute;left:40px;right:0;height:22px;pointer-events:none;
          background:rgba(245,158,11,0.055);border-left:2px solid rgba(245,158,11,0.45);
          transition:top 0.2s ease}
        .err-line-overlay{position:absolute;left:40px;right:0;height:22px;pointer-events:none;
          background:rgba(239,68,68,0.07);border-left:2px solid rgba(239,68,68,0.55)}
        .ta{flex:1;padding:18px 16px 18px 50px;background:transparent;border:none;outline:none;
          color:#c6a85a;font-family:'JetBrains Mono',monospace;font-size:12px;line-height:1.7;
          resize:none;caret-color:#f59e0b;min-height:320px;tab-size:2;white-space:pre}
        .ta::selection{background:rgba(245,158,11,0.2)}

        /* ACTIVE LINE BAR */
        .alb{display:flex;align-items:center;gap:9px;padding:6px 14px;
          border-top:1px solid rgba(255,255,255,0.05);border-left:3px solid;min-height:34px;
          animation:alIn 0.22s ease}
        @keyframes alIn{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:none}}
        .alb-icon{font-size:13px}
        .alb-lnum{font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;white-space:nowrap}
        .alb-code{font-family:'JetBrains Mono',monospace;font-size:10px;color:#292524;
          overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1}

        /* ERROR BOX */
        .err{margin:10px 14px;padding:13px 14px;background:rgba(239,68,68,0.07);
          border:1px solid rgba(239,68,68,0.28);border-radius:12px;
          color:#fca5a5;font-family:'JetBrains Mono',monospace;font-size:11.5px;line-height:1.65;
          animation:errSh 0.38s ease}
        @keyframes errSh{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}
        .err-t{font-weight:700;color:#ef4444;margin-bottom:7px;display:flex;align-items:center;gap:7px;font-size:12px}

        /* VALIDATING */
        .validating-bar{margin:10px 14px;padding:11px 14px;display:flex;align-items:center;gap:10px;
          background:rgba(245,158,11,0.07);border:1px solid rgba(245,158,11,0.28);border-radius:12px;
          animation:fadeIn 0.2s ease}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        .vld-spinner{width:16px;height:16px;border-radius:50%;border:2px solid rgba(245,158,11,0.25);
          border-top-color:#f59e0b;animation:spin 0.7s linear infinite;flex-shrink:0}
        @keyframes spin{to{transform:rotate(360deg)}}
        .vld-txt{font-family:'JetBrains Mono',monospace;font-size:11px;color:#f59e0b;letter-spacing:0.04em}

        /* AI ERROR PANEL */
        .ai-err{margin:10px 14px;border-radius:14px;overflow:hidden;
          border:1px solid rgba(239,68,68,0.35);animation:errSh 0.38s ease}
        .ai-err-head{padding:10px 14px;background:rgba(239,68,68,0.14);
          display:flex;align-items:center;gap:9px;border-bottom:1px solid rgba(239,68,68,0.2)}
        .ai-err-icon{font-size:15px}
        .ai-err-title{font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700;color:#ef4444;flex:1}
        .ai-err-badge{font-family:'JetBrains Mono',monospace;font-size:9px;padding:2px 8px;
          border-radius:20px;background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.3);
          color:#fca5a5;letter-spacing:0.06em}
        .ai-err-reason{padding:9px 14px;font-family:'DM Sans',sans-serif;font-size:12px;
          color:#94a3b8;background:rgba(239,68,68,0.05);border-bottom:1px solid rgba(239,68,68,0.1);line-height:1.5}
        .ai-err-list{display:flex;flex-direction:column;gap:0;max-height:180px;overflow-y:auto}
        .ai-err-list::-webkit-scrollbar{width:3px}
        .ai-err-list::-webkit-scrollbar-thumb{background:rgba(239,68,68,0.3);border-radius:4px}
        .ai-err-row{display:flex;align-items:flex-start;gap:10px;padding:8px 14px;
          border-bottom:1px solid rgba(239,68,68,0.07);cursor:pointer;transition:background 0.15s}
        .ai-err-row:hover{background:rgba(239,68,68,0.07)}
        .ai-err-row:last-child{border-bottom:none}
        .ai-err-ln{font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;
          color:#ef4444;white-space:nowrap;min-width:44px;padding-top:1px}
        .ai-err-msg{font-family:'DM Sans',sans-serif;font-size:12px;color:#fca5a5;line-height:1.5}
        .ai-err-code{font-family:'JetBrains Mono',monospace;font-size:10px;color:#44403c;
          margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:340px}
        .api-note{margin:6px 14px 0;padding:7px 12px;border-radius:9px;
          background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.18);
          font-family:'JetBrains Mono',monospace;font-size:9.5px;color:#78350f;line-height:1.5}

        /* RUN ROW */
        .rr{padding:12px 16px;border-top:1px solid rgba(255,255,255,0.05);
          display:flex;align-items:center;gap:9px;flex-wrap:wrap}
        .btn-run{padding:10px 28px;border-radius:10px;
          background:linear-gradient(135deg,#92400e,#d97706,#f59e0b);border:none;color:#fff;
          font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:700;cursor:pointer;
          transition:all 0.22s;box-shadow:0 0 22px rgba(245,158,11,0.42),0 4px 14px rgba(0,0,0,0.3);
          letter-spacing:0.04em}
        .btn-run:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 0 38px rgba(245,158,11,0.65),0 8px 22px rgba(0,0,0,0.3)}
        .btn-run:active{transform:translateY(0)}
        .btn-run:disabled{opacity:0.5;cursor:not-allowed}
        .btn-run.running{animation:rPulse 1s ease-in-out infinite;background:linear-gradient(135deg,#451a03,#92400e)}
        @keyframes rPulse{0%,100%{box-shadow:0 0 22px rgba(245,158,11,0.4)}50%{box-shadow:0 0 42px rgba(245,158,11,0.75)}}
        .btn-rst{padding:10px 16px;border-radius:10px;background:transparent;
          border:1px solid rgba(255,255,255,0.09);color:#44403c;
          font-family:'JetBrains Mono',monospace;font-size:11px;cursor:pointer;transition:all 0.18s}
        .btn-rst:hover{color:#f87171;border-color:rgba(248,113,113,0.4)}
        .rr-hint{font-family:'JetBrains Mono',monospace;font-size:9px;color:#1c1917;letter-spacing:0.07em}

        /* ═══ VISUALIZATION PANEL ═══ */
        .vb{flex:1;display:flex;flex-direction:column}

        /* Queue viz wrapper */
        .qv{flex:1;display:flex;flex-direction:column}
        .qv.qv-err{animation:qvSh 0.42s ease}
        @keyframes qvSh{0%,100%{transform:translateX(0)}18%{transform:translateX(-10px)}36%{transform:translateX(10px)}54%{transform:translateX(-6px)}72%{transform:translateX(6px)}}

        /* Metrics */
        .qv-metrics{display:flex;gap:0;border-bottom:1px solid rgba(255,255,255,0.05);background:rgba(9,6,3,0.5)}
        .qv-m{flex:1;padding:9px 12px;text-align:center;border-right:1px solid rgba(255,255,255,0.05);
          display:flex;flex-direction:column;gap:3px}
        .qv-m:last-child{border-right:none}
        .qv-ml{font-family:'JetBrains Mono',monospace;font-size:7.5px;color:#1c1917;letter-spacing:0.12em;text-transform:uppercase}
        .qv-mv{font-family:'JetBrains Mono',monospace;font-size:17px;font-weight:700;line-height:1}

        /* Lane wrap */
        .qv-lane-wrap{flex:1;display:flex;align-items:center;justify-content:center;
          padding:24px 20px 12px;position:relative;gap:0;min-height:160px;overflow:hidden}

        /* Dequeue fly */
        .qv-fly{position:absolute;left:20px;top:50%;transform:translateY(-50%);
          height:52px;padding:0 16px;border-radius:13px;display:flex;align-items:center;gap:9px;
          z-index:20;pointer-events:none;border:1.5px solid rgba(255,255,255,0.28);
          animation:qFlyLeft 0.85s cubic-bezier(0.22,1,0.36,1) forwards}
        @keyframes qFlyLeft{
          0%{transform:translateY(-50%) translateX(0) scale(1);opacity:1}
          30%{opacity:1}
          100%{transform:translateY(-50%) translateX(-130px) scale(0.55);opacity:0}}
        .qv-fly-v{font-family:'JetBrains Mono',monospace;font-size:17px;font-weight:700;color:#fff}
        .qv-fly-tag{font-family:'JetBrains Mono',monospace;font-size:8.5px;color:rgba(255,255,255,0.7);letter-spacing:0.06em}

        /* End labels */
        .qv-end-label{display:flex;flex-direction:column;align-items:center;gap:4px;flex-shrink:0;width:46px}
        .qv-el-line{width:2px;height:28px;border-radius:1px}
        .qv-el-arrow{font-size:16px;font-weight:700}
        .qv-end-label span:not(.qv-el-arrow){font-family:'JetBrains Mono',monospace;font-size:9px;font-weight:700;letter-spacing:0.06em}

        /* Horizontal queue */
        .qv-lane{display:flex;flex-direction:row;align-items:center;gap:5px;
          flex:1;overflow-x:auto;padding:6px 4px;justify-content:center}
        .qv-lane::-webkit-scrollbar{height:3px}
        .qv-lane::-webkit-scrollbar-thumb{background:rgba(245,158,11,0.3);border-radius:3px}

        /* Queue block */
        .qv-block{min-width:54px;border-radius:11px;border:1.5px solid transparent;
          display:flex;flex-direction:column;align-items:center;justify-content:center;
          gap:2px;position:relative;overflow:hidden;transition:min-width 0.32s ease,height 0.32s ease;
          padding:0 8px;flex-shrink:0}
        .qv-block::before{content:'';position:absolute;inset:0;
          background:linear-gradient(145deg,rgba(255,255,255,0.18) 0%,transparent 58%);
          border-radius:inherit;pointer-events:none}

        .qv-enq{animation:blkSlide 0.52s cubic-bezier(0.34,1.56,0.64,1) both}
        @keyframes blkSlide{0%{transform:translateX(80px) scale(0.7);opacity:0}60%{transform:translateX(-4px) scale(1.05)}100%{transform:translateX(0) scale(1);opacity:1}}

        .qv-pr,.qv-pr2{position:absolute;inset:-4px;border-radius:15px;border:2.5px solid;
          animation:pkRing 0.78s cubic-bezier(0.22,1,0.36,1) forwards;pointer-events:none}
        .qv-pr2{animation-delay:0.16s}
        @keyframes pkRing{0%{transform:scale(1);opacity:0.9}100%{transform:scale(1.32);opacity:0}}
        .qv-pk{animation:pkPulse 0.6s ease 2 both}
        @keyframes pkPulse{0%,100%{filter:brightness(1)}50%{filter:brightness(1.5) saturate(1.4)}}

        .qv-ec{animation:ecCheck 0.48s ease both}
        @keyframes ecCheck{0%,100%{transform:scale(1)}35%{transform:scale(1.06) translateY(-3px)}68%{transform:scale(0.97) translateY(1px)}}

        .qv-bidx{font-family:'JetBrains Mono',monospace;font-size:8px;color:rgba(255,255,255,0.38)}
        .qv-bval{font-family:'JetBrains Mono',monospace;font-size:16px;font-weight:700;color:#fff;
          text-shadow:0 2px 9px rgba(0,0,0,0.35)}

        /* Enqueue incoming arrow */
        .qv-enq-arrow{position:absolute;right:16px;top:50%;transform:translateY(-50%);
          display:flex;align-items:center;gap:6px;animation:enqIn 0.5s ease both}
        @keyframes enqIn{from{opacity:0;transform:translateY(-50%) translateX(30px)}to{opacity:1;transform:translateY(-50%) translateX(0)}}
        .qv-ea-val{font-family:'JetBrains Mono',monospace;font-size:15px;font-weight:700;color:#34d399;
          background:rgba(52,211,153,0.15);border:1px solid rgba(52,211,153,0.4);
          border-radius:8px;padding:3px 10px}
        .qv-ea-arrow{font-size:20px;color:#34d399;font-weight:700}

        /* Empty states */
        .qv-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;
          width:200px;height:70px;border:1px dashed rgba(255,255,255,0.07);border-radius:13px;gap:7px}
        .qv-empty.qv-empty-err{border-color:rgba(239,68,68,0.35);animation:errSh 0.38s ease}
        .qv-ei{font-size:22px;opacity:0.45}
        .qv-et{font-family:'JetBrains Mono',monospace;font-size:9.5px;color:#1c1917;letter-spacing:0.07em}

        /* Rail */
        .qv-rail{margin:0 20px;height:8px;border-radius:6px;
          background:linear-gradient(90deg,rgba(245,158,11,0.22),rgba(52,211,153,0.18),rgba(245,158,11,0.22));
          position:relative;overflow:hidden;
          box-shadow:0 0 20px rgba(245,158,11,0.22),0 3px 10px rgba(245,158,11,0.12)}
        .qv-rail::after{content:'';position:absolute;top:0;left:-100%;width:45%;height:100%;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,0.26),transparent);
          animation:railShine 3.5s ease-in-out infinite}
        @keyframes railShine{0%,100%{left:-100%}55%{left:160%}}
        .qv-base{font-family:'JetBrains Mono',monospace;font-size:8px;color:#1c1917;
          letter-spacing:0.1em;margin:5px 0 12px;text-align:center}

        /* OP INFO */
        .oi{padding:13px 18px;border-top:1px solid rgba(255,255,255,0.05);
          background:rgba(9,6,3,0.5);min-height:76px}
        .oi-badge{display:inline-flex;align-items:center;gap:8px;padding:5px 13px;
          border-radius:20px;margin-bottom:8px;font-family:'JetBrains Mono',monospace;
          font-size:10.5px;font-weight:700;animation:bdIn 0.28s ease;border:1px solid}
        @keyframes bdIn{from{opacity:0;transform:translateX(-9px)}to{opacity:1;transform:none}}
        .oi-msg{font-family:'JetBrains Mono',monospace;font-size:11.5px;color:#44403c;line-height:1.55;animation:mgIn 0.3s ease}
        @keyframes mgIn{from{opacity:0}to{opacity:1}}
        .oi-idle{display:flex;align-items:center;gap:9px;font-family:'JetBrains Mono',monospace;
          font-size:10.5px;color:#1c1917;letter-spacing:0.06em;padding:7px 0}

        /* CONTROLS */
        .ctrl{display:flex;align-items:center;gap:7px;padding:9px 16px;
          border-top:1px solid rgba(255,255,255,0.05);background:rgba(6,4,2,0.5);flex-wrap:wrap}
        .cb{width:33px;height:32px;border-radius:8px;border:1px solid rgba(255,255,255,0.08);
          background:rgba(255,255,255,0.03);color:#44403c;font-size:12px;cursor:pointer;
          display:flex;align-items:center;justify-content:center;transition:all 0.17s}
        .cb:hover:not(:disabled){background:rgba(245,158,11,0.14);color:#fbbf24;border-color:rgba(245,158,11,0.35)}
        .cb:disabled{opacity:0.28;cursor:not-allowed}
        .cp{height:32px;padding:0 12px;border-radius:8px;
          background:linear-gradient(135deg,#92400e,#f59e0b);border:none;color:#fff;
          font-size:12px;cursor:pointer;box-shadow:0 0 16px rgba(245,158,11,0.42);transition:all 0.2s}
        .cp:hover{transform:scale(1.05);box-shadow:0 0 28px rgba(245,158,11,0.62)}
        .cp:disabled{opacity:0.38;cursor:not-allowed;transform:none}
        .cs{width:1px;height:20px;background:rgba(255,255,255,0.07);margin:0 2px}
        .spd{display:flex;gap:3px}
        .sb{padding:4px 8px;border-radius:6px;cursor:pointer;
          font-family:'JetBrains Mono',monospace;font-size:9px;font-weight:700;
          border:1px solid rgba(255,255,255,0.07);background:transparent;color:#1c1917;transition:all 0.14s}
        .sb:hover{color:#57534e}
        .sb.sa{background:rgba(245,158,11,0.14);border-color:rgba(245,158,11,0.35);color:#fbbf24}

        /* PROGRESS */
        .pr{display:flex;align-items:center;gap:9px;padding:7px 18px;
          border-top:1px solid rgba(255,255,255,0.04)}
        .pt2{flex:1;height:5px;background:rgba(255,255,255,0.05);border-radius:99px;overflow:hidden}
        .pf{height:100%;border-radius:99px;transition:width 0.42s ease;
          background:linear-gradient(90deg,#92400e,#f59e0b,#fde68a);
          box-shadow:0 0 10px rgba(245,158,11,0.55)}
        .ptx{font-family:'JetBrains Mono',monospace;font-size:10px;color:#1c1917;white-space:nowrap}

        /* DONE BANNER */
        .db{padding:11px 18px;border-top:1px solid rgba(52,211,153,0.2);
          background:rgba(52,211,153,0.06);display:flex;align-items:center;gap:10px;
          animation:dbIn 0.52s cubic-bezier(0.22,1,0.36,1)}
        @keyframes dbIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
        .db-tx{font-family:'JetBrains Mono',monospace;font-size:11.5px;color:#34d399}
        .db-sp{display:inline-block;animation:spSpin 0.65s ease}
        @keyframes spSpin{0%{transform:scale(0) rotate(-180deg)}60%{transform:scale(1.35) rotate(12deg)}100%{transform:scale(1) rotate(0)}}

        /* STEPS LIST */
        .slh{padding:9px 18px 5px;font-family:'JetBrains Mono',monospace;font-size:8px;color:#1c1917;
          letter-spacing:0.12em;text-transform:uppercase;border-top:1px solid rgba(255,255,255,0.04)}
        .sl{max-height:130px;overflow-y:auto;padding:0 12px 10px;display:flex;flex-direction:column;gap:2px}
        .sl::-webkit-scrollbar{width:3px}
        .sl::-webkit-scrollbar-track{background:transparent}
        .sl::-webkit-scrollbar-thumb{background:#1c1917;border-radius:4px}
        .si{display:flex;align-items:center;gap:7px;padding:4px 9px;border-radius:7px;
          cursor:pointer;font-family:'JetBrains Mono',monospace;font-size:9.5px;color:#1c1917;
          transition:all 0.14s;border:1px solid transparent}
        .si:hover{background:rgba(245,158,11,0.06);color:#44403c}
        .sl-active{background:rgba(245,158,11,0.1)!important;border-color:rgba(245,158,11,0.2)!important;color:#fbbf24!important}
        .si-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0}
        .si-v{opacity:0.5;margin-left:2px}
        .si-ln{margin-left:auto;font-size:8px;color:#1c1917}
      `}</style>

      <div className="pg">

        {/* ── HEADER ── */}
        <header className="hd">
          <div className="hd-logo">🚌</div>
          <div>
            <div className="hd-title">Queue DS Visualizer</div>
            <div className="hd-sub">Write complete code · Run · Watch every operation execute · FIFO guaranteed</div>
          </div>
          <div className="hd-badge">{lm.name} · Real Execution Engine</div>
        </header>

        {/* ── GRID ── */}
        <main className="main">

          {/* ══ LEFT — CODE EDITOR ══ */}
          <div className="panel">
            <div className="ph">
              <span className="pd" style={{ background:"#ff5f57" }}/>
              <span className="pd" style={{ background:"#ffbd2e" }}/>
              <span className="pd" style={{ background:"#28c840" }}/>
              <span className="pt">Code Editor</span>
              <span style={{ marginLeft:"auto", fontFamily:"'JetBrains Mono',monospace", fontSize:9,
                color:lm.accent, background:`${lm.accent}18`, border:`1px solid ${lm.accent}35`,
                padding:"2px 9px", borderRadius:20 }}>{lm.name}</span>
            </div>

            {/* Language tabs */}
            <div className="lb">
              {Object.entries(LANGS).map(([k, m]) => (
                <button key={k}
                  className={`lt${lang === k ? " la" : ""}`}
                  onClick={() => changeLang(k)}
                  style={lang === k ? { borderColor:`${m.accent}55`, color:m.accent, background:`${m.accent}15` } : {}}>
                  {m.ext}
                </button>
              ))}
            </div>

            {/* Code area */}
            <div className="cw">
              <div className="ln-col">
                {codeLines.map((_, i) => (
                  <div key={i} className={["ln", step?.lineNum === i ? "aln" : "", errorLineSet.has(i) ? "eln" : ""].join(" ")}>{i+1}</div>
                ))}
              </div>
              {step && <div className="al-overlay" style={{ top:`${18 + step.lineNum * 22}px` }}/>}
              {[...errorLineSet].map(i => (
                <div key={`el${i}`} className="err-line-overlay" style={{ top:`${18 + i * 22}px` }}/>
              ))}
              <textarea ref={taRef} className="ta"
                value={code}
                onChange={e => { setCode(e.target.value); if (steps.length) doReset() }}
                onKeyDown={onKeyDown}
                spellCheck={false}
                placeholder="// Write your complete Queue implementation here, then use it below the class..."/>
            </div>

            {/* Active line bar */}
            {step && os && (
              <div className="alb" style={{ borderColor:os.bd, background:os.bg }}>
                <span className="alb-icon" style={{ color:os.c }}>{os.icon}</span>
                <span className="alb-lnum" style={{ color:os.c }}>line {step.lineNum + 1}</span>
                <code className="alb-code">{step.codeLine}</code>
              </div>
            )}

            {/* Validating */}
            {validating && (
              <div className="validating-bar">
                <div className="vld-spinner"/>
                <span className="vld-txt">AI is checking your implementation…</span>
              </div>
            )}

            {/* AI error panel */}
            {hasAiErrors && (
              <div className="ai-err">
                <div className="ai-err-head">
                  <span className="ai-err-icon">🤖</span>
                  <span className="ai-err-title">Implementation Error</span>
                  <span className="ai-err-badge">{aiErrors.length} issue{aiErrors.length !== 1 ? "s" : ""}</span>
                </div>
                {aiReason && <div className="ai-err-reason">{aiReason}</div>}
                <div className="ai-err-list">
                  {aiErrors.map((e, i) => (
                    <div key={i} className="ai-err-row"
                      onClick={() => {
                        if (taRef.current) taRef.current.scrollTop = Math.max(0, ((e.line ?? 1) - 4)) * 22
                      }}>
                      <span className="ai-err-ln">L{e.line ?? "?"}</span>
                      <div>
                        <div className="ai-err-msg">{e.message}</div>
                        {codeLines[(e.line ?? 1) - 1] && (
                          <div className="ai-err-code">{codeLines[(e.line ?? 1) - 1].trim()}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Runtime error */}
            {error && (
              <div className="err">
                <div className="err-t"><span>⚠</span> Execution Error</div>
                <pre style={{ whiteSpace:"pre-wrap", fontFamily:"'JetBrains Mono',monospace", fontSize:11.5 }}>{error}</pre>
              </div>
            )}

            {apiNote && (
              <div className="api-note">ℹ {apiNote} — visualization ran without AI check.</div>
            )}

            {/* Run row */}
            <div className="rr">
              <button className={`btn-run${playing || validating ? " running" : ""}`}
                onClick={handleRun} disabled={playing || validating}>
                {validating ? "🤖 Checking..." : playing ? "▶ Running..." : "▶  Run & Visualize"}
              </button>
              {(steps.length > 0 || error || hasAiErrors) && (
                <button className="btn-rst" onClick={doReset}>↺ Reset</button>
              )}
              <span className="rr-hint">CTRL + ENTER</span>
            </div>
          </div>

          {/* ══ RIGHT — VISUALIZATION ══ */}
          <div className="panel">
            <div className="ph">
              <span className="pd" style={{ background:"#f59e0b" }}/>
              <span className="pd" style={{ background:"#34d399" }}/>
              <span className="pd" style={{ background:"#38bdf8" }}/>
              <span className="pt">Queue Visualization</span>
              {steps.length > 0 && (
                <span style={{ marginLeft:"auto", fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:"#292524" }}>
                  {steps.length} ops
                </span>
              )}
            </div>

            <div className="vb">
              <QueueViz step={step} animKey={animKey} idle={idle}/>

              {/* Op info */}
              <div className="oi">
                {step && os ? (
                  <>
                    <div className="oi-badge" style={{ color:os.c, background:os.bg, borderColor:os.bd }}>
                      <span>{os.icon}</span>
                      <span>{os.label}</span>
                      {step.value !== null && step.value !== undefined && step.type === "enqueue" && (
                        <span style={{ opacity:0.65 }}>({step.value})</span>
                      )}
                      {(step.type === "dequeue" || step.type === "peek") && step.value !== null && (
                        <span style={{ opacity:0.65 }}>→ {step.value}</span>
                      )}
                      {(step.type === "isEmpty" || step.type === "size") && (
                        <span style={{ opacity:0.65 }}>→ {String(step.result)}</span>
                      )}
                    </div>
                    <div className="oi-msg">{step.message}</div>
                  </>
                ) : (
                  <div className="oi-idle">
                    <span>📟</span>
                    <span>
                      {idle ? "Write your Queue class, then call enqueue/dequeue/peek/isEmpty below it and click Run"
                        : hasAiErrors ? "Fix the implementation errors shown in the editor"
                        : error ? "Fix the errors above and run again"
                        : validating ? "AI is reviewing your code…"
                        : "Waiting…"}
                    </span>
                  </div>
                )}
              </div>

              {/* Done banner */}
              {done && (
                <div className="db">
                  <span className="db-sp">🎉</span>
                  <span className="db-tx">All {steps.length} operation{steps.length !== 1 ? "s" : ""} visualized!</span>
                </div>
              )}

              {/* Controls */}
              {steps.length > 0 && (
                <div className="ctrl">
                  <button className="cb" title="First" onClick={() => goTo(0)} disabled={idx <= 0}>⏮</button>
                  <button className="cb" title="Prev"  onClick={() => goTo(idx - 1)} disabled={idx <= 0}>◀</button>
                  <button className="cp"
                    onClick={() => {
                      if (done || idx >= steps.length - 1) { setIdx(0); bump(); setDone(false); setPlaying(true) }
                      else { clearInterval(timerRef.current); setPlaying(p => !p) }
                    }}>
                    {playing ? "⏸" : done ? "↺" : "▶"}
                  </button>
                  <button className="cb" title="Next" onClick={() => goTo(idx + 1)} disabled={idx >= steps.length - 1}>▶</button>
                  <button className="cb" title="Last" onClick={() => goTo(steps.length - 1)} disabled={idx >= steps.length - 1}>⏭</button>
                  <div className="cs"/>
                  <div className="spd">
                    {[[2,"0.5×"],[1.1,"1×"],[0.55,"2×"]].map(([s, lbl]) => (
                      <button key={s} className={`sb${speed === s ? " sa" : ""}`}
                        onClick={() => setSpeed(s)}>{lbl}</button>
                    ))}
                  </div>
                  <div className="cs"/>
                  <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:"#1c1917" }}>
                    {idx + 1} / {steps.length}
                  </span>
                </div>
              )}

              {/* Progress */}
              {steps.length > 0 && (
                <div className="pr">
                  <div className="pt2"><div className="pf" style={{ width:`${prog}%` }}/></div>
                  <span className="ptx">{prog}%</span>
                </div>
              )}

              {/* Steps list */}
              {steps.length > 0 && (
                <>
                  <div className="slh">OPERATION LOG — click any step to jump</div>
                  <div className="sl" ref={listRef}>
                    {steps.map((s, i) => {
                      const sm = OP[s.type] ?? OP.enqueue
                      const past = i < idx, active = i === idx
                      return (
                        <div key={i} className={`si${active ? " sl-active" : ""}`} onClick={() => goTo(i)}>
                          <span className="si-dot" style={{
                            background: past ? "#34d399" : active ? sm.c : "#1c1917",
                            boxShadow: active ? `0 0 7px ${sm.c}` : "none",
                          }}/>
                          <span style={{ color: active ? sm.c : past ? "#292524" : "#1c1917" }}>
                            {sm.label}
                            {s.type === "enqueue" && <span className="si-v">({s.value})</span>}
                            {s.type === "dequeue" && s.value !== null && <span className="si-v"> → {s.value}</span>}
                            {s.type === "peek"    && s.value !== null && <span className="si-v"> = {s.value}</span>}
                            {s.type === "isEmpty" && <span className="si-v"> = {String(s.result)}</span>}
                            {s.type === "size"    && <span className="si-v"> = {s.result}</span>}
                            {(s.type === "dequeue_error" || s.type === "peek_error") && (
                              <span style={{ color:"#ef4444", opacity:0.8 }}> ⚠</span>
                            )}
                          </span>
                          <span className="si-ln">L{s.lineNum + 1}</span>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

        </main>
      </div>
    </>
  )
}