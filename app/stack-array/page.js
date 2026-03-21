"use client";
import { useState, useRef, useEffect, useCallback } from "react";

// ══════════════════════════════════════════════════════════════════════════════
// COLOR SYSTEM
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
  push:       { label:"PUSH",      icon:"⬇", c:"#4ade80", bg:"rgba(74,222,128,0.1)",  bd:"rgba(74,222,128,0.3)"  },
  pop:        { label:"POP",       icon:"⬆", c:"#f472b6", bg:"rgba(244,114,182,0.1)", bd:"rgba(244,114,182,0.3)" },
  pop_error:  { label:"UNDERFLOW", icon:"⚠", c:"#ef4444", bg:"rgba(239,68,68,0.1)",   bd:"rgba(239,68,68,0.3)"   },
  peek:       { label:"PEEK",      icon:"👁", c:"#fbbf24", bg:"rgba(251,191,36,0.1)",  bd:"rgba(251,191,36,0.3)"  },
  peek_error: { label:"EMPTY",     icon:"⚠", c:"#ef4444", bg:"rgba(239,68,68,0.1)",   bd:"rgba(239,68,68,0.3)"   },
  isEmpty:    { label:"IS EMPTY?", icon:"∅", c:"#60a5fa", bg:"rgba(96,165,250,0.1)",  bd:"rgba(96,165,250,0.3)"  },
};

const LANGS = {
  javascript:{ name:"JavaScript", ext:"JS",  accent:"#f7df1e" },
  typescript:{ name:"TypeScript", ext:"TS",  accent:"#3178c6" },
  python:    { name:"Python",     ext:"PY",  accent:"#4ec9b0" },
  java:      { name:"Java",       ext:"JV",  accent:"#ed8b00" },
  cpp:       { name:"C++",        ext:"C++", accent:"#00b4d8" },
  csharp:    { name:"C#",         ext:"C#",  accent:"#9b4f96" },
  go:        { name:"Go",         ext:"GO",  accent:"#00add8" },
  rust:      { name:"Rust",       ext:"RS",  accent:"#f46623" },
};

// ══════════════════════════════════════════════════════════════════════════════
// CODE TEMPLATES — complete working implementations
// ══════════════════════════════════════════════════════════════════════════════
const TPL = {
javascript:`// Complete Stack implementation — JavaScript
// Write your full class, then use it below.
// The visualizer executes your REAL code.

class Stack {
  constructor() {
    this.items = [];
  }

  push(element) {
    this.items.push(element);
  }

  pop() {
    if (this.isEmpty()) return undefined;
    return this.items.pop();
  }

  peek() {
    if (this.isEmpty()) return undefined;
    return this.items[this.items.length - 1];
  }

  isEmpty() {
    return this.items.length === 0;
  }

  get size() {
    return this.items.length;
  }
}

// — Use your stack here —
const s = new Stack();
s.push(10);
s.push(25);
s.push(37);
s.peek();
s.pop();
s.push(99);
s.push(4);
s.isEmpty();
s.pop();
s.pop();`,

typescript:`// Complete Stack implementation — TypeScript
class Stack<T> {
  private items: T[] = [];

  push(element: T): void {
    this.items.push(element);
  }

  pop(): T | undefined {
    if (this.isEmpty()) return undefined;
    return this.items.pop();
  }

  peek(): T | undefined {
    if (this.isEmpty()) return undefined;
    return this.items[this.items.length - 1];
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  get size(): number {
    return this.items.length;
  }
}

// — Use your stack here —
const s = new Stack<number>();
s.push(10);
s.push(25);
s.push(37);
s.peek();
s.pop();
s.push(99);
s.push(42);
s.isEmpty();`,

python:`# Complete Stack implementation — Python
class Stack:
    def __init__(self):
        self.items = []

    def push(self, element):
        self.items.append(element)

    def pop(self):
        if self.is_empty():
            return None
        return self.items.pop()

    def peek(self):
        if self.is_empty():
            return None
        return self.items[-1]

    def is_empty(self):
        return len(self.items) == 0

    def size(self):
        return len(self.items)

# — Use your stack here —
s = Stack()
s.push(10)
s.push(25)
s.push(37)
s.peek()
s.pop()
s.push(99)
s.push(42)
s.is_empty()`,

java:`// Complete Stack implementation — Java
import java.util.ArrayList;

public class Main {
    static class Stack<T> {
        private ArrayList<T> items = new ArrayList<>();

        public void push(T element) {
            items.add(element);
        }

        public T pop() {
            if (isEmpty()) return null;
            return items.remove(items.size() - 1);
        }

        public T peek() {
            if (isEmpty()) return null;
            return items.get(items.size() - 1);
        }

        public boolean isEmpty() {
            return items.isEmpty();
        }

        public int size() {
            return items.size();
        }
    }

    public static void main(String[] args) {
        Stack<Integer> s = new Stack<>();
        s.push(10);
        s.push(25);
        s.push(37);
        s.peek();
        s.pop();
        s.push(99);
        s.push(42);
        s.isEmpty();
    }
}`,

cpp:`// Complete Stack implementation — C++
#include <iostream>
#include <vector>
using namespace std;

class Stack {
private:
    vector<int> items;

public:
    void push(int element) {
        items.push_back(element);
    }

    int pop() {
        if (isEmpty()) return -1;
        int top = items.back();
        items.pop_back();
        return top;
    }

    int peek() {
        if (isEmpty()) return -1;
        return items.back();
    }

    bool isEmpty() {
        return items.empty();
    }

    int size() {
        return items.size();
    }
};

int main() {
    Stack s;
    s.push(10);
    s.push(25);
    s.push(37);
    s.peek();
    s.pop();
    s.push(99);
    s.push(42);
    s.isEmpty();
    return 0;
}`,

csharp:`// Complete Stack implementation — C#
using System;
using System.Collections.Generic;

class Program {
    class Stack<T> {
        private List<T> items = new List<T>();

        public void Push(T element) {
            items.Add(element);
        }

        public T Pop() {
            if (IsEmpty()) return default(T);
            T top = items[items.Count - 1];
            items.RemoveAt(items.Count - 1);
            return top;
        }

        public T Peek() {
            if (IsEmpty()) return default(T);
            return items[items.Count - 1];
        }

        public bool IsEmpty() {
            return items.Count == 0;
        }

        public int Size() {
            return items.Count;
        }
    }

    static void Main() {
        Stack<int> s = new Stack<int>();
        s.Push(10);
        s.Push(25);
        s.Push(37);
        s.Peek();
        s.Pop();
        s.Push(99);
        s.Push(42);
        s.IsEmpty();
    }
}`,

go:`// Complete Stack implementation — Go
package main

import "fmt"

type Stack struct {
    items []int
}

func (s *Stack) Push(element int) {
    s.items = append(s.items, element)
}

func (s *Stack) Pop() (int, bool) {
    if s.IsEmpty() {
        return 0, false
    }
    top := s.items[len(s.items)-1]
    s.items = s.items[:len(s.items)-1]
    return top, true
}

func (s *Stack) Peek() (int, bool) {
    if s.IsEmpty() {
        return 0, false
    }
    return s.items[len(s.items)-1], true
}

func (s *Stack) IsEmpty() bool {
    return len(s.items) == 0
}

func (s *Stack) Size() int {
    return len(s.items)
}

func main() {
    s := &Stack{}
    s.Push(10)
    s.Push(25)
    s.Push(37)
    s.Peek()
    s.Pop()
    s.Push(99)
    s.Push(42)
    s.IsEmpty()
    fmt.Println("Done")
}`,

rust:`// Complete Stack implementation — Rust
struct Stack {
    items: Vec<i32>,
}

impl Stack {
    fn new() -> Stack {
        Stack { items: Vec::new() }
    }

    fn push(&mut self, element: i32) {
        self.items.push(element);
    }

    fn pop(&mut self) -> Option<i32> {
        self.items.pop()
    }

    fn peek(&self) -> Option<&i32> {
        self.items.last()
    }

    fn is_empty(&self) -> bool {
        self.items.is_empty()
    }

    fn size(&self) -> usize {
        self.items.len()
    }
}

fn main() {
    let mut s = Stack::new();
    s.push(10);
    s.push(25);
    s.push(37);
    s.peek();
    s.pop();
    s.push(99);
    s.push(42);
    s.is_empty();
}`,
};

// ══════════════════════════════════════════════════════════════════════════════
// BRACE-COUNTING UTILITIES
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
// JAVASCRIPT / TYPESCRIPT REAL EXECUTION ENGINE
// ══════════════════════════════════════════════════════════════════════════════

function runJavaScript(code) {
  const classMatch = /\bclass\s+(\w+)/.exec(code);
  if (!classMatch) {
    return { steps: [], errors: ["No class definition found.\nWrite a Stack class with push / pop / peek / isEmpty methods, then use it below."] };
  }
  const className = classMatch[1];

  const fieldMatch = /this\.(\w+)\s*=\s*(?:\[\s*\]|new\s+Array\s*\(\s*\))/.exec(code);
  const field = fieldMatch?.[1] ?? "items";

  const classBlock = extractClassBlock(code, className);
  if (!classBlock) {
    return { steps: [], errors: [`Could not parse class '${className}'. Make sure the class has a proper opening and closing brace.`] };
  }
  const execCode = code.slice(0, classBlock.start) + "\n" + code.slice(classBlock.end);

  const instrumented = `
"use strict";
const __S = [];
class ${className} {
  constructor() { this.${field} = []; }

  push(v) {
    this.${field}.push(v);
    __S.push({ type:"push", value:v, stack:[...this.${field}] });
  }

  pop() {
    if (this.${field}.length === 0) {
      __S.push({ type:"pop_error", value:null, stack:[] });
      return undefined;
    }
    const v = this.${field}.pop();
    __S.push({ type:"pop", value:v, stack:[...this.${field}] });
    return v;
  }

  peek() {
    if (this.${field}.length === 0) {
      __S.push({ type:"peek_error", value:null, stack:[] });
      return undefined;
    }
    const v = this.${field}[this.${field}.length - 1];
    __S.push({ type:"peek", value:v, stack:[...this.${field}] });
    return v;
  }

  top()   { return this.peek(); }
  front() { return this.peek(); }

  isEmpty() {
    const e = this.${field}.length === 0;
    __S.push({ type:"isEmpty", result:e, stack:[...this.${field}] });
    return e;
  }

  get size()   { return this.${field}.length; }
  get length() { return this.${field}.length; }
  toString()   { return "[Stack: " + this.${field}.join(", ") + "]"; }
}

${execCode}
return __S;
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
    return { steps: [], errors: ["No stack operations were executed.\nCall push(), pop(), peek(), or isEmpty() on your stack instance after the class definition."] };
  }

  const lines = code.split("\n");
  const callLineNums = [];
  let charCursor = 0;
  let classEndLine = 0;
  for (let i = 0; i < lines.length; i++) {
    if (charCursor >= classBlock.end) { classEndLine = i; break; }
    charCursor += lines[i].length + 1;
  }
  for (let i = classEndLine; i < lines.length; i++) {
    const t = lines[i].trim();
    if (t.startsWith("//") || t.startsWith("*") || t.startsWith("/*")) continue;
    if (/\.(push|pop|peek|top|front|isEmpty|is_empty|empty|size)\s*\(/.test(t)) {
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
// SCOPE-AWARE PARSER — Python, Java, C++, C#, Go, Rust
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
    if (i > 0 && lines[i - 1].trim().includes("__main__") && indent === 4) {
      execLines.push({ lineIdx: i, line: trimmed });
    }
  }

  return simulateOps(execLines, code.split("\n"), lang);
}

function parseBraced(code, lang) {
  const lines   = code.split("\n");
  const execLines = [];

  let depth     = 0;
  let inClass   = false;
  let classDepth= -1;
  let inMain    = false;
  let mainDepth = -1;
  let mlComment = false;

  const needsMain = ["java", "cpp", "csharp", "go", "rust"];

  for (let i = 0; i < lines.length; i++) {
    const line    = lines[i];
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
      inClass    = true;
      classDepth = depthBefore;
    }

    if (needsMain.includes(lang)) {
      if (/\bmain\s*\(/.test(trimmed) || /\bfunc\s+main\s*\(/.test(trimmed)) {
        inMain    = true;
        mainDepth = depthBefore;
      }
    }

    if (inClass  && depth <= classDepth) { inClass  = false; classDepth = -1; }
    if (inMain   && depth <= mainDepth)  { inMain   = false; mainDepth  = -1; }

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
  const steps  = [];
  const errors = [];
  const stack  = [];

  const PUSH_RE = [
    /\.(?:push|Push|append|add|enqueue)\s*\(\s*(-?[\d.]+)\s*\)/,
    /\bappend\s*\(\s*\w+\s*,\s*(-?[\d.]+)\s*\)/,
  ];
  const POP_RE  = /\.(?:pop|Pop|pop_back|remove_last|dequeue|poll|delete_last)\s*\(\s*\)/;
  const PEEK_RE = /\.(?:peek|Peek|top|Top|last|back|front)\s*\(\s*\)|\.(?:peek|top)\(\)|\.last\(\)/;
  const EMPTY_RE = /\.(?:isEmpty|IsEmpty|is_empty|empty|Empty)\s*\(\s*\)/;

  for (const { lineIdx, line } of execLines) {
    const origLine = allLines[lineIdx]?.trim() ?? line;

    let pushVal = null;
    for (const re of PUSH_RE) {
      const m = line.match(re);
      if (m) { pushVal = parseFloat(m[1]); break; }
    }
    if (pushVal !== null && !isNaN(pushVal)) {
      stack.push(pushVal);
      steps.push({ type:"push", value:pushVal, stack:[...stack], lineNum:lineIdx, codeLine:origLine, message:buildMessage({type:"push",value:pushVal,stack:[...stack]}) });
      continue;
    }

    if (POP_RE.test(line)) {
      if (stack.length === 0) {
        steps.push({ type:"pop_error", value:null, stack:[], lineNum:lineIdx, codeLine:origLine, message:buildMessage({type:"pop_error"}) });
      } else {
        const v = stack.pop();
        steps.push({ type:"pop", value:v, stack:[...stack], lineNum:lineIdx, codeLine:origLine, message:buildMessage({type:"pop",value:v,stack:[...stack]}) });
      }
      continue;
    }

    if (PEEK_RE.test(line)) {
      if (stack.length === 0) {
        steps.push({ type:"peek_error", value:null, stack:[], lineNum:lineIdx, codeLine:origLine, message:buildMessage({type:"peek_error"}) });
      } else {
        const v = stack[stack.length - 1];
        steps.push({ type:"peek", value:v, stack:[...stack], lineNum:lineIdx, codeLine:origLine, message:buildMessage({type:"peek",value:v,stack:[...stack]}) });
      }
      continue;
    }

    if (EMPTY_RE.test(line)) {
      const e = stack.length === 0;
      steps.push({ type:"isEmpty", result:e, stack:[...stack], lineNum:lineIdx, codeLine:origLine, message:buildMessage({type:"isEmpty",result:e,stack:[...stack]}) });
      continue;
    }
  }

  if (steps.length === 0) {
    errors.push("No stack operations detected in the execution body.\nMake sure you call push(N), pop(), peek(), isEmpty() on your stack instance.\nValues must be numeric literals, e.g. push(42).");
  }

  return { steps, errors };
}

function buildMessage(s) {
  switch (s.type) {
    case "push":       return `push(${s.value})  →  added ${s.value} to top · stack size: ${s.stack?.length}`;
    case "pop":        return `pop()  →  returned ${s.value}  ·  removed from top · stack size: ${s.stack?.length}`;
    case "pop_error":  return `pop()  →  ⚠ Stack Underflow! Cannot pop from an empty stack.`;
    case "peek":       return `peek()  →  top element is ${s.value}  ·  stack unchanged`;
    case "peek_error": return `peek()  →  ⚠ Stack is empty! Nothing to peek at.`;
    case "isEmpty":    return `isEmpty()  →  ${s.result}  ·  stack has ${s.stack?.length ?? 0} element${s.stack?.length !== 1 ? "s" : ""}`;
    default:           return "";
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// GEMINI VALIDATION GATE
// ══════════════════════════════════════════════════════════════════════════════

async function validateWithGemini(code, lang) {
  const prompt = `You are a strict code reviewer for a Stack data-structure visualizer.

The user has written a Stack implementation in ${lang}. Your job:
1. Check if it is a CORRECT and COMPLETE Stack implementation with at least push and pop.
2. Look for logic bugs: wrong LIFO order, pop not removing from top, peek removing elements, isEmpty wrong condition, etc.
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
      return { valid: true, reason: `Server unavailable: ${data.error}`, errors: [], apiError: data.error };
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

function runCode(code, lang) {
  const trimmed = code.trim();
  if (!trimmed) return { steps: [], errors: ["Please write some code first."] };

  if (lang === "javascript" || lang === "typescript") {
    return runJavaScript(code);
  }
  return parseScoped(code, lang);
}

// ══════════════════════════════════════════════════════════════════════════════
// STACK VISUALIZATION
// ══════════════════════════════════════════════════════════════════════════════
function StackViz({ step, animKey, idle }) {
  const [flyItem, setFlyItem] = useState(null);

  useEffect(() => {
    if (step?.type === "pop" && step.valid !== false && step.value !== null && step.value !== undefined) {
      setFlyItem({ v: step.value, key: animKey });
      const t = setTimeout(() => setFlyItem(null), 800);
      return () => clearTimeout(t);
    }
    if (step?.type !== "pop") setFlyItem(null);
  }, [animKey, step?.type]);

  const stack   = step?.stack ?? [];
  const isPush  = step?.type === "push";
  const isPeek  = step?.type === "peek" && step.valid !== false;
  const isEmpty = step?.type === "isEmpty";
  const isErr   = step?.type === "pop_error" || step?.type === "peek_error";
  const reversed = [...stack].reverse();

  return (
    <div className={`sv${isErr ? " sv-err" : ""}`} key={isErr ? `e${animKey}` : "sv"}>

      {/* Metrics strip */}
      <div className="sv-metrics">
        {[
          { lbl:"SIZE",   val: stack.length,                         c:"#60a5fa" },
          { lbl:"TOP",    val: stack.length ? stack[stack.length-1] : "—", c:"#fbbf24" },
          { lbl:"EMPTY",  val: stack.length === 0 ? "YES" : "NO",   c: stack.length === 0 ? "#f472b6" : "#4ade80" },
          { lbl:"POLICY", val: "LIFO",                               c:"#a78bfa" },
        ].map(m => (
          <div className="sv-m" key={m.lbl}>
            <span className="sv-ml">{m.lbl}</span>
            <span className="sv-mv" style={{ color:m.c }}>{String(m.val)}</span>
          </div>
        ))}
      </div>

      {/* Stack column */}
      <div className="sv-col">

        {flyItem && (
          <div key={flyItem.key} className="sv-fly"
            style={{
              background: `linear-gradient(135deg,${col(flyItem.v).g1},${col(flyItem.v).g2})`,
              boxShadow: `0 0 40px ${col(flyItem.v).glow}`,
            }}>
            <span className="sv-fly-v">{flyItem.v}</span>
            <span className="sv-fly-tag">↑ POP</span>
          </div>
        )}

        <div className="sv-blocks">
          {stack.length === 0 && !flyItem ? (
            <div className={`sv-empty${isErr ? " sv-empty-err" : ""}`}>
              <div className="sv-ei">{idle ? "📚" : isErr ? "⚠" : "∅"}</div>
              <div className="sv-et">{idle ? "Run code to start" : isErr ? "Stack underflow!" : "Stack is empty"}</div>
            </div>
          ) : reversed.map((v, ri) => {
            const idx   = stack.length - 1 - ri;
            const isTop = idx === stack.length - 1;
            const isNew = isTop && isPush;
            const pk    = isTop && isPeek;
            const ec    = isEmpty;
            const c     = col(v);
            return (
              <div
                key={`${v}-${idx}-${isNew ? animKey : "s"}`}
                className={["sv-block", isNew?"sv-push":"", pk?"sv-peek":"", isTop?"sv-top":"", ec?"sv-ec":""].join(" ")}
                style={{
                  background:  `linear-gradient(135deg,${c.g1},${c.g2})`,
                  boxShadow:   isTop
                    ? `0 0 36px ${c.glow}, 0 6px 20px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.22)`
                    : `0 4px 14px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.12)`,
                  borderColor: isTop ? c.border : "rgba(255,255,255,0.08)",
                  width: `${Math.max(170, 210 - ri * 5)}px`,
                }}>
                {pk && <div className="sv-pr"  key={`r1-${animKey}`} style={{ borderColor:c.border }} />}
                {pk && <div className="sv-pr2" key={`r2-${animKey}`} style={{ borderColor:c.border }} />}
                <span className="sv-bidx">[{idx}]</span>
                <span className="sv-bval">{v}</span>
                {isTop && <span className="sv-btag">← TOP</span>}
              </div>
            );
          })}
        </div>

        <div className="sv-plat"><div className="sv-plat-shine" /></div>
        <p className="sv-base">▲ BASE OF STACK</p>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TERMINAL OUTPUT COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
function TerminalOutput({ steps, error, aiErrors, apiNote, validating }) {
  const [entries, setEntries] = useState([]);
  const [expanded, setExpanded] = useState(true);
  const terminalBodyRef = useRef(null);

  useEffect(() => {
    const newEntries = [];

    if (validating) {
      newEntries.push({ type: "info", message: "🤖 Saif's Chatbot is validating your code...", timestamp: Date.now() });
    }
    if (apiNote) {
      newEntries.push({ type: "warn", message: `ℹ️ ${apiNote}`, timestamp: Date.now() });
    }
    if (aiErrors.length > 0) {
      newEntries.push({ type: "error", message: `❌ Implementation errors found:`, timestamp: Date.now() });
      aiErrors.forEach(e => {
        newEntries.push({ type: "error", message: `Line ${e.line}: ${e.message}`, timestamp: Date.now() });
      });
    }
    if (error) {
      newEntries.push({ type: "error", message: `⛔ Runtime error: ${error}`, timestamp: Date.now() });
    }

    steps.forEach((step, idx) => {
      const sm = OP[step.type] ?? OP.push;
      let msg = `[${idx + 1}] ${sm.label.toUpperCase()}`;
      if (step.type === "push") msg += ` ${step.value}`;
      else if (step.type === "pop" && step.valid !== false) msg += ` → ${step.value}`;
      else if (step.type === "peek" && step.valid !== false) msg += ` = ${step.value}`;
      else if (step.type === "isEmpty") msg += ` = ${step.result}`;
      else if (step.type === "pop_error") msg += ` ⚠ Underflow`;
      else if (step.type === "peek_error") msg += ` ⚠ Empty`;
      msg += ` (stack size: ${step.stack?.length ?? 0})`;
      newEntries.push({ type: step.type, message: msg, timestamp: Date.now() + idx, lineNum: step.lineNum + 1 });
    });

    newEntries.sort((a, b) => a.timestamp - b.timestamp);
    setEntries(newEntries);

    if (terminalBodyRef.current) {
      terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight;
    }
  }, [steps, error, aiErrors, apiNote, validating]);

  const clearTerminal = () => setEntries([]);

  return (
    <div style={{ marginTop: "12px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 16px",
        background: "rgba(0,0,0,0.3)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "14px" }}>📟</span>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "11px",
            fontWeight: "bold",
            color: "#94a3b8",
            letterSpacing: "0.5px"
          }}>
            TERMINAL OUTPUT
          </span>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={clearTerminal}
            style={{
              background: "none",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "6px",
              padding: "3px 8px",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "9px",
              color: "#64748b",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "#60a5fa"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"}
          >
            Clear
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              background: "none",
              border: "none",
              color: "#64748b",
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            {expanded ? "▼" : "▲"}
          </button>
        </div>
      </div>

      {expanded && (
        <div
          ref={terminalBodyRef}
          style={{
            maxHeight: "200px",
            overflowY: "auto",
            background: "rgba(0,0,0,0.6)",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "11px",
            padding: "8px 0",
          }}
        >
          {entries.length === 0 ? (
            <div style={{
              padding: "12px 16px",
              color: "#1e293b",
              fontStyle: "italic",
              textAlign: "center"
            }}>
              No output yet. Run your code.
            </div>
          ) : (
            entries.map((entry, i) => {
              let icon = "▸", color = "#60a5fa";
              if (entry.type === "error") { icon = "✗"; color = "#ef4444"; }
              else if (entry.type === "warn") { icon = "⚠"; color = "#fbbf24"; }
              else if (entry.type === "info") { icon = "ℹ"; color = "#60a5fa"; }
              else if (entry.type === "push") { icon = "⬇"; color = "#4ade80"; }
              else if (entry.type === "pop") { icon = "⬆"; color = "#f472b6"; }
              else if (entry.type === "peek") { icon = "👁"; color = "#fbbf24"; }
              else if (entry.type === "isEmpty") { icon = "∅"; color = "#60a5fa"; }
              else if (entry.type === "pop_error") { icon = "⚠"; color = "#ef4444"; }
              else if (entry.type === "peek_error") { icon = "⚠"; color = "#ef4444"; }

              return (
                <div
                  key={i}
                  style={{
                    padding: "4px 16px",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                    borderBottom: "1px solid rgba(255,255,255,0.03)",
                    animation: "fadeIn 0.2s ease",
                  }}
                >
                  <span style={{ color, width: "20px", flexShrink: 0 }}>{icon}</span>
                  <span style={{ color: "#a0aec0", wordBreak: "break-word" }}>{entry.message}</span>
                  {entry.lineNum && (
                    <span style={{
                      marginLeft: "auto",
                      color: "#334155",
                      fontSize: "9px",
                      fontFamily: "'JetBrains Mono', monospace"
                    }}>
                      L{entry.lineNum}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════════
export default function StackDSPage() {
  const [lang,    setLang]    = useState("javascript");
  const [code,       setCode]       = useState(TPL.javascript);
  const [steps,      setSteps]      = useState([]);
  const [idx,        setIdx]        = useState(-1);
  const [error,      setError]      = useState("");
  const [playing,    setPlaying]    = useState(false);
  const [speed,      setSpeed]      = useState(1.1);
  const [animKey,    setAnimKey]    = useState(0);
  const [done,       setDone]       = useState(false);
  const [validating, setValidating] = useState(false);
  const [aiErrors,   setAiErrors]   = useState([]);
  const [aiReason,   setAiReason]   = useState("");
  const [apiNote,    setApiNote]    = useState("");

  const timerRef = useRef(null);
  const taRef    = useRef(null);
  const listRef  = useRef(null);

  const bump = () => setAnimKey(k => k + 1);

  const doReset = useCallback(() => {
    clearInterval(timerRef.current);
    setSteps([]); setIdx(-1); setError("");
    setPlaying(false); setDone(false);
    setAiErrors([]); setAiReason(""); setApiNote("");
  }, []);

  const changeLang = (l) => {
    setLang(l);
    setCode(TPL[l] ?? "");
    doReset();
  };

  const handleRun = async () => {
    doReset();
    setValidating(true);

    const validation = await validateWithGemini(code, lang);
    setValidating(false);

    if (validation.apiError) setApiNote(validation.apiError);
    if (!validation.valid) {
      setAiReason(validation.reason ?? "");
      setAiErrors(validation.errors ?? []);
      return;
    }

    const { steps: s, errors } = runCode(code, lang);
    if (errors.length) { setError(errors.join("\n")); return; }
    setSteps(s);
    setIdx(0);
    bump();
    setPlaying(true);
  };

  const goTo = useCallback((i) => {
    clearInterval(timerRef.current);
    setPlaying(false);
    const clamped = Math.max(0, Math.min(i, steps.length - 1));
    setIdx(clamped);
    bump();
  }, [steps.length]);

  // Ctrl+Enter to run
  useEffect(() => {
    const h = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); handleRun(); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [code, lang]);

  // Autoplay
  useEffect(() => {
    if (!playing || !steps.length) return;
    timerRef.current = setInterval(() => {
      setIdx(prev => {
        if (prev >= steps.length - 1) {
          clearInterval(timerRef.current);
          setPlaying(false);
          setDone(true);
          return prev;
        }
        bump();
        return prev + 1;
      });
    }, speed * 1000);
    return () => clearInterval(timerRef.current);
  }, [playing, steps, speed]);

  // Scroll active step into view
  useEffect(() => {
    listRef.current?.querySelector(".sl-active")?.scrollIntoView({ block:"nearest", behavior:"smooth" });
  }, [idx]);

  // Tab support
  const onKeyDown = (e) => {
    if (e.key !== "Tab") return;
    e.preventDefault();
    const s = e.target.selectionStart, en = e.target.selectionEnd;
    const nv = code.slice(0, s) + "  " + code.slice(en);
    setCode(nv);
    requestAnimationFrame(() => {
      if (taRef.current) { taRef.current.selectionStart = s + 2; taRef.current.selectionEnd = s + 2; }
    });
  };

  const step         = steps[idx] ?? null;
  const os           = step ? (OP[step.type] ?? OP.push) : null;
  const prog         = steps.length ? Math.round(((idx + 1) / steps.length) * 100) : 0;
  const hasAiErrors  = aiErrors.length > 0;
  const idle         = steps.length === 0 && !error && !hasAiErrors;
  const lm           = LANGS[lang];
  const codeLines    = code.split("\n");
  const errorLineSet = new Set(aiErrors.map(e => (e.line ?? 1) - 1));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:#030612;color:#e2e8f0;font-family:'DM Sans',sans-serif;min-height:100vh}

        .pg{min-height:100vh;display:flex;flex-direction:column;
          background:radial-gradient(ellipse 60% 45% at 10% 0%,rgba(59,130,246,0.13) 0%,transparent 60%),
                     radial-gradient(ellipse 50% 40% at 90% 100%,rgba(244,114,182,0.1) 0%,transparent 58%),
                     radial-gradient(ellipse 40% 35% at 50% 55%,rgba(74,222,128,0.05) 0%,transparent 60%),
                     #030612}

        .hd{position:sticky;top:0;z-index:200;display:flex;align-items:center;gap:14px;
          padding:14px 40px;background:rgba(3,6,18,0.9);backdrop-filter:blur(22px) saturate(160%);
          border-bottom:1px solid rgba(96,165,250,0.12)}
        .hd-logo{width:40px;height:40px;border-radius:12px;flex-shrink:0;
          background:linear-gradient(135deg,#2563eb,#60a5fa);
          display:flex;align-items:center;justify-content:center;font-size:20px;
          box-shadow:0 0 24px rgba(59,130,246,0.5)}
        .hd-title{font-family:'Syne',sans-serif;font-size:19px;font-weight:800;letter-spacing:-0.4px;
          background:linear-gradient(90deg,#93c5fd,#60a5fa,#f9a8d4);
          -webkit-background-clip:text;-webkit-text-fill-color:transparent}
        .hd-sub{font-size:10px;color:#334155;font-family:'JetBrains Mono',monospace;margin-top:2px}
        .hd-badge{margin-left:auto;background:rgba(59,130,246,0.1);border:1px solid rgba(96,165,250,0.25);
          color:#60a5fa;font-size:10px;font-family:'JetBrains Mono',monospace;
          padding:4px 12px;border-radius:20px;letter-spacing:0.05em;white-space:nowrap}

        .main{display:grid;grid-template-columns:1fr 1fr;gap:18px;
          padding:20px 40px 60px;max-width:1440px;margin:0 auto;width:100%;flex:1}
        @media(max-width:960px){.main{grid-template-columns:1fr;padding:16px 14px 60px}.hd{padding:12px 16px}}

        .panel{background:rgba(7,12,30,0.78);border:1px solid rgba(255,255,255,0.07);
          border-radius:18px;display:flex;flex-direction:column;overflow:hidden;
          box-shadow:0 24px 60px rgba(0,0,0,0.55)}
        .ph{padding:12px 18px;border-bottom:1px solid rgba(255,255,255,0.06);
          background:rgba(12,20,44,0.6);display:flex;align-items:center;gap:7px}
        .pd{width:10px;height:10px;border-radius:50%}
        .pt{font-family:'JetBrains Mono',monospace;font-size:9.5px;color:#334155;
          text-transform:uppercase;letter-spacing:1.5px;margin-left:8px}

        .lb{display:flex;gap:4px;flex-wrap:wrap;padding:11px 16px;
          border-bottom:1px solid rgba(255,255,255,0.05);background:rgba(9,16,36,0.5)}
        .lt{padding:5px 11px;border-radius:7px;cursor:pointer;
          font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;
          border:1px solid rgba(255,255,255,0.07);background:transparent;color:#2d3748;
          transition:all 0.17s;letter-spacing:0.03em}
        .lt:hover{color:#475569;border-color:rgba(255,255,255,0.13)}
        .lt.la{background:rgba(59,130,246,0.16);border-color:rgba(96,165,250,0.38);color:#93c5fd}

        .cw{flex:1;position:relative;display:flex;flex-direction:column;min-height:0}
        .ln-col{position:absolute;left:0;top:0;bottom:0;width:40px;padding:18px 0;
          border-right:1px solid rgba(255,255,255,0.04);overflow:hidden;pointer-events:none;
          display:flex;flex-direction:column}
        .ln{font-family:'JetBrains Mono',monospace;font-size:11px;color:#1e293b;
          text-align:right;padding-right:9px;line-height:1.7;height:22px;flex-shrink:0}
        .ln.aln{color:#60a5fa;background:rgba(96,165,250,0.07);border-radius:3px}
        .al-overlay{position:absolute;left:40px;right:0;height:22px;pointer-events:none;
          background:rgba(96,165,250,0.055);border-left:2px solid rgba(96,165,250,0.45);
          transition:top 0.2s ease}
        .ta{flex:1;padding:18px 16px 18px 50px;background:transparent;border:none;outline:none;
          color:#7dd3fc;font-family:'JetBrains Mono',monospace;font-size:12px;line-height:1.7;
          resize:none;caret-color:#60a5fa;min-height:320px;tab-size:2;white-space:pre}
        .ta::selection{background:rgba(96,165,250,0.2)}

        .alb{display:flex;align-items:center;gap:9px;padding:6px 14px;
          border-top:1px solid rgba(255,255,255,0.05);border-left:3px solid;min-height:34px;
          animation:alIn 0.22s ease}
        @keyframes alIn{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:none}}
        .alb-icon{font-size:13px}
        .alb-lnum{font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;white-space:nowrap}
        .alb-code{font-family:'JetBrains Mono',monospace;font-size:10px;color:#334155;
          overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1}

        .err{margin:10px 14px;padding:13px 14px;background:rgba(239,68,68,0.07);
          border:1px solid rgba(239,68,68,0.28);border-radius:12px;
          color:#fca5a5;font-family:'JetBrains Mono',monospace;font-size:11.5px;line-height:1.65;
          animation:errSh 0.38s ease}
        @keyframes errSh{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}
        .err-t{font-weight:700;color:#ef4444;margin-bottom:7px;display:flex;align-items:center;gap:7px;font-size:12px}

        .validating-bar{margin:10px 14px;padding:11px 14px;display:flex;align-items:center;gap:10px;
          background:rgba(251,191,36,0.07);border:1px solid rgba(251,191,36,0.28);border-radius:12px;
          animation:fadeIn 0.2s ease}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        .vld-spinner{width:16px;height:16px;border-radius:50%;border:2px solid rgba(251,191,36,0.25);
          border-top-color:#fbbf24;animation:spin 0.7s linear infinite;flex-shrink:0}
        @keyframes spin{to{transform:rotate(360deg)}}
        .vld-txt{font-family:'JetBrains Mono',monospace;font-size:11px;color:#fbbf24;letter-spacing:0.04em}

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
        .ai-err-code{font-family:'JetBrains Mono',monospace;font-size:10px;color:#475569;
          margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:340px}
        .api-note{margin:6px 14px 0;padding:7px 12px;border-radius:9px;
          background:rgba(251,191,36,0.06);border:1px solid rgba(251,191,36,0.18);
          font-family:'JetBrains Mono',monospace;font-size:9.5px;color:#92400e;line-height:1.5}

        .ln.eln{color:#ef4444!important;background:rgba(239,68,68,0.12);border-radius:3px}
        .err-line-overlay{position:absolute;left:40px;right:0;height:22px;pointer-events:none;
          background:rgba(239,68,68,0.07);border-left:2px solid rgba(239,68,68,0.55)}

        .rr{padding:12px 16px;border-top:1px solid rgba(255,255,255,0.05);
          display:flex;align-items:center;gap:9px;flex-wrap:wrap}
        .btn-run{padding:10px 28px;border-radius:10px;
          background:linear-gradient(135deg,#1d4ed8,#3b82f6,#60a5fa);border:none;color:#fff;
          font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:700;cursor:pointer;
          transition:all 0.22s;box-shadow:0 0 22px rgba(59,130,246,0.42),0 4px 14px rgba(0,0,0,0.3);
          letter-spacing:0.04em}
        .btn-run:hover{transform:translateY(-2px);box-shadow:0 0 38px rgba(96,165,250,0.65),0 8px 22px rgba(0,0,0,0.3)}
        .btn-run:active{transform:translateY(0)}
        .btn-run.running{animation:rPulse 1s ease-in-out infinite;
          background:linear-gradient(135deg,#1e3a8a,#1d4ed8)}
        @keyframes rPulse{0%,100%{box-shadow:0 0 22px rgba(59,130,246,0.4)}50%{box-shadow:0 0 42px rgba(96,165,250,0.75)}}
        .btn-rst{padding:10px 16px;border-radius:10px;background:transparent;
          border:1px solid rgba(255,255,255,0.1);color:#475569;
          font-family:'JetBrains Mono',monospace;font-size:11px;cursor:pointer;transition:all 0.18s}
        .btn-rst:hover{color:#f87171;border-color:rgba(248,113,113,0.4)}
        .rr-hint{font-family:'JetBrains Mono',monospace;font-size:9px;color:#1e293b;letter-spacing:0.07em}

        .vb{flex:1;display:flex;flex-direction:column}

        .sv{flex:1;display:flex;flex-direction:column}
        .sv.sv-err{animation:svSh 0.42s ease}
        @keyframes svSh{0%,100%{transform:translateX(0)}18%{transform:translateX(-10px)}36%{transform:translateX(10px)}54%{transform:translateX(-6px)}72%{transform:translateX(6px)}}

        .sv-metrics{display:flex;gap:0;border-bottom:1px solid rgba(255,255,255,0.05);background:rgba(7,12,28,0.5)}
        .sv-m{flex:1;padding:9px 12px;text-align:center;border-right:1px solid rgba(255,255,255,0.05);
          display:flex;flex-direction:column;gap:3px}
        .sv-m:last-child{border-right:none}
        .sv-ml{font-family:'JetBrains Mono',monospace;font-size:7.5px;color:#1e3050;letter-spacing:0.12em;text-transform:uppercase}
        .sv-mv{font-family:'JetBrains Mono',monospace;font-size:17px;font-weight:700;line-height:1}

        .sv-col{flex:1;display:flex;flex-direction:column;align-items:center;
          justify-content:flex-end;padding:28px 20px 0;position:relative;min-height:300px}

        .sv-fly{position:absolute;top:18px;left:50%;transform:translateX(-50%);
          width:196px;height:50px;border-radius:13px;display:flex;align-items:center;
          justify-content:center;gap:9px;z-index:20;pointer-events:none;
          border:1.5px solid rgba(255,255,255,0.28);
          animation:flyAway 0.76s cubic-bezier(0.22,1,0.36,1) forwards}
        @keyframes flyAway{
          0%{transform:translateX(-50%) translateY(0) scale(1) rotate(0deg);opacity:1}
          35%{opacity:1}
          100%{transform:translateX(calc(-50% + 70px)) translateY(-120px) scale(0.58) rotate(22deg);opacity:0}}
        .sv-fly-v{font-family:'JetBrains Mono',monospace;font-size:17px;font-weight:700;color:#fff}
        .sv-fly-tag{font-family:'JetBrains Mono',monospace;font-size:8.5px;color:rgba(255,255,255,0.7);letter-spacing:0.06em}

        .sv-blocks{display:flex;flex-direction:column;gap:4px;align-items:center;width:100%;position:relative}

        .sv-block{height:50px;border-radius:13px;border:1.5px solid transparent;
          display:flex;align-items:center;padding:0 14px;gap:9px;position:relative;overflow:hidden;
          transition:width 0.32s ease}
        .sv-block::before{content:'';position:absolute;inset:0;
          background:linear-gradient(135deg,rgba(255,255,255,0.18) 0%,transparent 58%);
          border-radius:inherit;pointer-events:none}

        .sv-push{animation:blkDrop 0.52s cubic-bezier(0.34,1.56,0.64,1) both}
        @keyframes blkDrop{
          0%{transform:translateY(-80px) scale(0.78);opacity:0}
          58%{transform:translateY(5px) scale(1.04);opacity:1}
          78%{transform:translateY(-2px) scale(0.98)}
          100%{transform:translateY(0) scale(1);opacity:1}}

        .sv-pr,.sv-pr2{position:absolute;inset:-4px;border-radius:17px;border:2.5px solid;
          animation:pkRing 0.78s cubic-bezier(0.22,1,0.36,1) forwards;pointer-events:none}
        .sv-pr2{animation-delay:0.16s}
        @keyframes pkRing{0%{transform:scale(1);opacity:0.9}100%{transform:scale(1.32);opacity:0}}

        .sv-peek{animation:pkPulse 0.6s ease 2 both}
        @keyframes pkPulse{0%,100%{filter:brightness(1)}50%{filter:brightness(1.45) saturate(1.4)}}

        .sv-top{z-index:2}

        .sv-ec{animation:ecCheck 0.48s ease both}
        @keyframes ecCheck{0%,100%{transform:scale(1)}35%{transform:scale(1.05) translateY(-4px)}68%{transform:scale(0.97) translateY(2px)}}

        .sv-bidx{font-family:'JetBrains Mono',monospace;font-size:8.5px;color:rgba(255,255,255,0.42);flex-shrink:0}
        .sv-bval{font-family:'JetBrains Mono',monospace;font-size:17px;font-weight:700;color:#fff;flex:1;text-align:center;text-shadow:0 2px 9px rgba(0,0,0,0.35)}
        .sv-btag{font-family:'JetBrains Mono',monospace;font-size:8px;color:rgba(255,255,255,0.68);flex-shrink:0;letter-spacing:0.05em;white-space:nowrap}

        .sv-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;
          width:200px;height:88px;border:1px dashed rgba(255,255,255,0.07);border-radius:13px;gap:7px}
        .sv-empty.sv-empty-err{border-color:rgba(239,68,68,0.35);animation:errSh 0.38s ease}
        .sv-ei{font-size:22px;opacity:0.45}
        .sv-et{font-family:'JetBrains Mono',monospace;font-size:9.5px;color:#1e3050;letter-spacing:0.07em}

        .sv-plat{margin-top:5px;width:240px;height:11px;border-radius:7px;
          background:linear-gradient(90deg,rgba(96,165,250,0.28),rgba(96,165,250,0.14),rgba(96,165,250,0.28));
          position:relative;overflow:hidden;
          box-shadow:0 0 22px rgba(96,165,250,0.28),0 4px 12px rgba(96,165,250,0.14)}
        .sv-plat-shine{position:absolute;top:0;left:-100%;width:55%;height:100%;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,0.28),transparent);
          animation:pShine 3.2s ease-in-out infinite}
        @keyframes pShine{0%,100%{left:-100%}55%{left:160%}}
        .sv-base{font-family:'JetBrains Mono',monospace;font-size:8px;color:#1e3050;
          letter-spacing:0.1em;margin-top:4px;margin-bottom:14px}

        .oi{padding:13px 18px;border-top:1px solid rgba(255,255,255,0.05);
          background:rgba(7,12,28,0.5);min-height:76px}
        .oi-badge{display:inline-flex;align-items:center;gap:8px;padding:5px 13px;
          border-radius:20px;margin-bottom:8px;font-family:'JetBrains Mono',monospace;
          font-size:10.5px;font-weight:700;animation:bdIn 0.28s ease;border:1px solid}
        @keyframes bdIn{from{opacity:0;transform:translateX(-9px)}to{opacity:1;transform:none}}
        .oi-msg{font-family:'JetBrains Mono',monospace;font-size:11.5px;color:#475569;line-height:1.55;animation:mgIn 0.3s ease}
        @keyframes mgIn{from{opacity:0}to{opacity:1}}
        .oi-idle{display:flex;align-items:center;gap:9px;font-family:'JetBrains Mono',monospace;
          font-size:10.5px;color:#1e3050;letter-spacing:0.06em;padding:7px 0}

        .ctrl{display:flex;align-items:center;gap:7px;padding:9px 16px;
          border-top:1px solid rgba(255,255,255,0.05);background:rgba(5,9,24,0.5);flex-wrap:wrap}
        .cb{width:33px;height:32px;border-radius:8px;border:1px solid rgba(255,255,255,0.09);
          background:rgba(255,255,255,0.04);color:#475569;font-size:12px;cursor:pointer;
          display:flex;align-items:center;justify-content:center;transition:all 0.17s}
        .cb:hover:not(:disabled){background:rgba(96,165,250,0.14);color:#93c5fd;border-color:rgba(96,165,250,0.35)}
        .cb:disabled{opacity:0.28;cursor:not-allowed}
        .cp{height:32px;padding:0 12px;border-radius:8px;
          background:linear-gradient(135deg,#1d4ed8,#60a5fa);border:none;color:#fff;
          font-size:12px;cursor:pointer;box-shadow:0 0 16px rgba(59,130,246,0.42);transition:all 0.2s}
        .cp:hover{transform:scale(1.05);box-shadow:0 0 28px rgba(96,165,250,0.62)}
        .cp:disabled{opacity:0.38;cursor:not-allowed;transform:none}
        .cs{width:1px;height:20px;background:rgba(255,255,255,0.07);margin:0 2px}
        .spd{display:flex;gap:3px}
        .sb{padding:4px 8px;border-radius:6px;cursor:pointer;
          font-family:'JetBrains Mono',monospace;font-size:9px;font-weight:700;
          border:1px solid rgba(255,255,255,0.07);background:transparent;color:#2d3748;transition:all 0.14s}
        .sb:hover{color:#64748b}
        .sb.sa{background:rgba(96,165,250,0.14);border-color:rgba(96,165,250,0.35);color:#93c5fd}

        .pr{display:flex;align-items:center;gap:9px;padding:7px 18px;
          border-top:1px solid rgba(255,255,255,0.04)}
        .pt2{flex:1;height:5px;background:rgba(255,255,255,0.05);border-radius:99px;overflow:hidden}
        .pf{height:100%;border-radius:99px;transition:width 0.42s ease;
          background:linear-gradient(90deg,#1d4ed8,#60a5fa,#93c5fd);
          box-shadow:0 0 10px rgba(96,165,250,0.55)}
        .ptx{font-family:'JetBrains Mono',monospace;font-size:10px;color:#1e3050;white-space:nowrap}

        .db{padding:11px 18px;border-top:1px solid rgba(74,222,128,0.2);
          background:rgba(74,222,128,0.06);display:flex;align-items:center;gap:10px;
          animation:dbIn 0.52s cubic-bezier(0.22,1,0.36,1)}
        @keyframes dbIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
        .db-tx{font-family:'JetBrains Mono',monospace;font-size:11.5px;color:#4ade80}
        .db-sp{display:inline-block;animation:spSpin 0.65s ease}
        @keyframes spSpin{0%{transform:scale(0) rotate(-180deg)}60%{transform:scale(1.35) rotate(12deg)}100%{transform:scale(1) rotate(0)}}

        .slh{padding:9px 18px 5px;font-family:'JetBrains Mono',monospace;font-size:8px;color:#1e3050;
          letter-spacing:0.12em;text-transform:uppercase;border-top:1px solid rgba(255,255,255,0.04)}
        .sl{max-height:120px;overflow-y:auto;padding:0 12px 10px;display:flex;flex-direction:column;gap:2px}
        .sl::-webkit-scrollbar{width:3px}
        .sl::-webkit-scrollbar-track{background:transparent}
        .sl::-webkit-scrollbar-thumb{background:#1e3050;border-radius:4px}
        .si{display:flex;align-items:center;gap:7px;padding:4px 9px;border-radius:7px;
          cursor:pointer;font-family:'JetBrains Mono',monospace;font-size:9.5px;color:#1e3050;
          transition:all 0.14s;border:1px solid transparent}
        .si:hover{background:rgba(96,165,250,0.06);color:#475569}
        .sl-active{background:rgba(96,165,250,0.1)!important;border-color:rgba(96,165,250,0.2)!important;color:#93c5fd!important}
        .si-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0}
        .si-v{opacity:0.5;margin-left:2px}
        .si-ln{margin-left:auto;font-size:8px;color:#1e3050}
      `}</style>

      <div className="pg">

        <header className="hd">
          <div className="hd-logo">📚</div>
          <div>
            <div className="hd-title">Stack DS Visualizer</div>
            <div className="hd-sub">Write complete code · Run · Watch every operation execute</div>
          </div>
          <div className="hd-badge">{lm.name} · Real Execution Engine</div>
        </header>

        <main className="main">

          {/* LEFT PANEL */}
          <div className="panel">
            <div className="ph">
              <span className="pd" style={{ background:"#ff5f57" }} />
              <span className="pd" style={{ background:"#ffbd2e" }} />
              <span className="pd" style={{ background:"#28c840" }} />
              <span className="pt">Code Editor</span>
              <span style={{ marginLeft:"auto", fontFamily:"'JetBrains Mono',monospace", fontSize:9,
                color:lm.accent, background:`${lm.accent}18`, border:`1px solid ${lm.accent}35`,
                padding:"2px 9px", borderRadius:20 }}>{lm.name}</span>
            </div>

            <div className="lb">
              {Object.entries(LANGS).map(([k, m]) => (
                <button key={k}
                  className={`lt${lang === k ? " la" : ""}`}
                  onClick={() => changeLang(k)}
                  style={lang === k ? { borderColor:`${m.accent}55`, color:m.accent, background:`${m.accent}15` } : {}}
                >{m.ext}</button>
              ))}
            </div>

            <div className="cw">
              <div className="ln-col">
                {codeLines.map((_, i) => (
                  <div key={i} className={[
                    "ln",
                    step?.lineNum === i ? "aln" : "",
                    errorLineSet.has(i) ? "eln" : "",
                  ].join(" ")}>{i + 1}</div>
                ))}
              </div>
              {step && (
                <div className="al-overlay" style={{ top:`${18 + step.lineNum * 22}px` }} />
              )}
              {[...errorLineSet].map(i => (
                <div key={`el${i}`} className="err-line-overlay" style={{ top:`${18 + i * 22}px` }} />
              ))}
              <textarea ref={taRef} className="ta"
                value={code}
                onChange={e => { setCode(e.target.value); if (steps.length) doReset(); }}
                onKeyDown={onKeyDown}
                spellCheck={false}
                placeholder="// Write your complete Stack implementation here, then use it below the class..."
              />
            </div>

            {step && os && (
              <div className="alb" style={{ borderColor:os.bd, background:os.bg }}>
                <span className="alb-icon" style={{ color:os.c }}>{os.icon}</span>
                <span className="alb-lnum" style={{ color:os.c }}>line {step.lineNum + 1}</span>
                <code className="alb-code">{step.codeLine}</code>
              </div>
            )}

            {validating && (
              <div className="validating-bar">
                <div className="vld-spinner" />
                <span className="vld-txt">VisuoSlayer is checking your implementation…</span>
              </div>
            )}

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
                        const lineH = 22;
                        if (taRef.current) taRef.current.scrollTop = Math.max(0, ((e.line ?? 1) - 4)) * lineH;
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

            {error && (
              <div className="err">
                <div className="err-t"><span>⚠</span> Execution Error</div>
                <pre style={{ whiteSpace:"pre-wrap", fontFamily:"'JetBrains Mono',monospace", fontSize:11.5 }}>{error}</pre>
              </div>
            )}

            {apiNote && (
              <div className="api-note">ℹ {apiNote} — visualization ran without AI check.</div>
            )}

            <div className="rr">
              <button className={`btn-run${playing ? " running" : validating ? " running" : ""}`}
                onClick={handleRun} disabled={playing || validating}>
                {validating ? "🤖 Checking..." : playing ? "▶ Running..." : "▶  Run & Visualize"}
              </button>
              {(steps.length > 0 || error || hasAiErrors) && (
                <button className="btn-rst" onClick={doReset}>↺ Reset</button>
              )}
              <span className="rr-hint">CTRL + ENTER</span>
            </div>

            {/* TERMINAL OUTPUT */}
            <TerminalOutput
              steps={steps}
              error={error}
              aiErrors={aiErrors}
              apiNote={apiNote}
              validating={validating}
            />
          </div>

          {/* RIGHT PANEL */}
          <div className="panel">
            <div className="ph">
              <span className="pd" style={{ background:"#60a5fa" }} />
              <span className="pd" style={{ background:"#f472b6" }} />
              <span className="pd" style={{ background:"#4ade80" }} />
              <span className="pt">Stack Visualization</span>
              {steps.length > 0 && (
                <span style={{ marginLeft:"auto", fontFamily:"'JetBrains Mono',monospace",
                  fontSize:9, color:"#334155" }}>{steps.length} ops</span>
              )}
            </div>

            <div className="vb">
              <StackViz step={step} animKey={animKey} idle={idle} />

              <div className="oi">
                {step && os ? (
                  <>
                    <div className="oi-badge" style={{ color:os.c, background:os.bg, borderColor:os.bd }}>
                      <span>{os.icon}</span>
                      <span>{os.label}</span>
                      {step.value !== null && step.value !== undefined && step.type === "push" && (
                        <span style={{ opacity:0.65 }}>({step.value})</span>
                      )}
                      {(step.type === "pop" || step.type === "peek") && step.valid !== false && step.value !== null && (
                        <span style={{ opacity:0.65 }}>→ {step.value}</span>
                      )}
                      {step.type === "isEmpty" && (
                        <span style={{ opacity:0.65 }}>→ {String(step.result)}</span>
                      )}
                    </div>
                    <div className="oi-msg">{step.message}</div>
                  </>
                ) : (
                  <div className="oi-idle">
                    <span>📟</span>
                    <span>{idle ? "Write your Stack class, then call push/pop/peek/isEmpty below it and click Run" : hasAiErrors ? "Fix the implementation errors shown in the editor" : error ? "Fix the errors above and run again" : validating ? "VisuoSlayer is reviewing your code…" : "Waiting..."}</span>
                  </div>
                )}
              </div>

              {done && (
                <div className="db">
                  <span className="db-sp">🎉</span>
                  <span className="db-tx">All {steps.length} operation{steps.length !== 1 ? "s" : ""} visualized!</span>
                </div>
              )}

              {steps.length > 0 && (
                <div className="ctrl">
                  <button className="cb" title="First" onClick={() => goTo(0)} disabled={idx <= 0}>⏮</button>
                  <button className="cb" title="Prev"  onClick={() => goTo(idx - 1)} disabled={idx <= 0}>◀</button>
                  <button className="cp"
                    onClick={() => {
                      if (done || idx >= steps.length - 1) { setIdx(0); bump(); setDone(false); setPlaying(true); }
                      else { clearInterval(timerRef.current); setPlaying(p => !p); }
                    }}>
                    {playing ? "⏸" : done ? "↺" : "▶"}
                  </button>
                  <button className="cb" title="Next" onClick={() => goTo(idx + 1)} disabled={idx >= steps.length - 1}>▶</button>
                  <button className="cb" title="Last" onClick={() => goTo(steps.length - 1)} disabled={idx >= steps.length - 1}>⏭</button>

                  <div className="cs" />
                  <div className="spd">
                    {[[2,"0.5×"],[1.1,"1×"],[0.55,"2×"]].map(([s, lbl]) => (
                      <button key={s} className={`sb${speed === s ? " sa" : ""}`}
                        onClick={() => setSpeed(s)}>{lbl}</button>
                    ))}
                  </div>
                  <div className="cs" />
                  <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:"#1e3050" }}>
                    {idx + 1} / {steps.length}
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
                  <div className="slh">OPERATION LOG — click any step to jump</div>
                  <div className="sl" ref={listRef}>
                    {steps.map((s, i) => {
                      const sm = OP[s.type] ?? OP.push;
                      const past = i < idx, active = i === idx;
                      return (
                        <div key={i}
                          className={`si${active ? " sl-active" : ""}`}
                          onClick={() => goTo(i)}>
                          <span className="si-dot" style={{
                            background: past ? "#4ade80" : active ? sm.c : "#1e3050",
                            boxShadow: active ? `0 0 7px ${sm.c}` : "none",
                          }} />
                          <span style={{ color: active ? sm.c : past ? "#334155" : "#1e3050" }}>
                            {sm.label}
                            {s.type === "push" && <span className="si-v">({s.value})</span>}
                            {s.type === "pop"  && s.valid !== false && <span className="si-v"> → {s.value}</span>}
                            {s.type === "peek" && s.valid !== false && <span className="si-v"> = {s.value}</span>}
                            {s.type === "isEmpty" && <span className="si-v"> = {String(s.result)}</span>}
                            {(s.type === "pop_error" || s.type === "peek_error") && <span style={{ color:"#ef4444", opacity:0.8 }}> ⚠</span>}
                          </span>
                          <span className="si-ln">L{s.lineNum + 1}</span>
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
    </>
  );
}