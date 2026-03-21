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

// Step-type → badge config (mirrors OP in stack viz)
const OP = {
  compare:    { label:"COMPARE",   icon:"⚖",  c:"#fbbf24", bg:"rgba(251,191,36,0.1)",  bd:"rgba(251,191,36,0.3)"  },
  pick_left:  { label:"PICK LEFT", icon:"⬅",  c:"#4ade80", bg:"rgba(74,222,128,0.1)",  bd:"rgba(74,222,128,0.3)"  },
  pick_right: { label:"PICK RIGHT",icon:"➡",  c:"#60a5fa", bg:"rgba(96,165,250,0.1)",  bd:"rgba(96,165,250,0.3)"  },
  copy_left:  { label:"COPY LEFT", icon:"📋", c:"#34d399", bg:"rgba(52,211,153,0.1)",  bd:"rgba(52,211,153,0.3)"  },
  copy_right: { label:"COPY RIGHT",icon:"📋", c:"#93c5fd", bg:"rgba(147,197,253,0.1)", bd:"rgba(147,197,253,0.3)" },
  merge_done: { label:"MERGED",    icon:"✓",  c:"#4ade80", bg:"rgba(74,222,128,0.1)",  bd:"rgba(74,222,128,0.3)"  },
  divide:     { label:"DIVIDE",    icon:"✂",  c:"#f472b6", bg:"rgba(244,114,182,0.1)", bd:"rgba(244,114,182,0.3)" },
  base_case:  { label:"BASE CASE", icon:"★",  c:"#a78bfa", bg:"rgba(167,139,250,0.1)", bd:"rgba(167,139,250,0.3)" },
  call:       { label:"CALL",      icon:"📞", c:"#fb923c", bg:"rgba(251,146,60,0.1)",  bd:"rgba(251,146,60,0.3)"  },
  sorted:     { label:"SORTED",    icon:"🎉", c:"#4ade80", bg:"rgba(74,222,128,0.1)",  bd:"rgba(74,222,128,0.3)"  },
  error:      { label:"ERROR",     icon:"⚠",  c:"#ef4444", bg:"rgba(239,68,68,0.1)",   bd:"rgba(239,68,68,0.3)"   },
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
// CODE TEMPLATES — one per language
// ══════════════════════════════════════════════════════════════════════════════
const TPL = {
javascript:`// Merge Sort — JavaScript
// Write your full implementation below.
// The visualizer reads your array and simulates every step.

function mergeSort(arr) {
  if (arr.length <= 1) return arr;

  const mid   = Math.floor(arr.length / 2);
  const left  = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));

  return merge(left, right);
}

function merge(left, right) {
  const result = [];
  let i = 0, j = 0;

  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) {
      result.push(left[i]);
      i++;
    } else {
      result.push(right[j]);
      j++;
    }
  }

  return result.concat(left.slice(i)).concat(right.slice(j));
}

// ── Call your function here ──
const arr = [38, 27, 43, 3, 9, 82, 10];
const sorted = mergeSort(arr);`,

typescript:`// Merge Sort — TypeScript
function mergeSort(arr: number[]): number[] {
  if (arr.length <= 1) return arr;

  const mid: number = Math.floor(arr.length / 2);
  const left: number[]  = mergeSort(arr.slice(0, mid));
  const right: number[] = mergeSort(arr.slice(mid));

  return merge(left, right);
}

function merge(left: number[], right: number[]): number[] {
  const result: number[] = [];
  let i = 0, j = 0;

  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) {
      result.push(left[i]);
      i++;
    } else {
      result.push(right[j]);
      j++;
    }
  }

  return result.concat(left.slice(i)).concat(right.slice(j));
}

// ── Call your function here ──
const arr: number[] = [38, 27, 43, 3, 9, 82, 10];
const sorted: number[] = mergeSort(arr);`,

python:`# Merge Sort — Python
def merge_sort(arr):
    if len(arr) <= 1:
        return arr

    mid   = len(arr) // 2
    left  = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])

    return merge(left, right)

def merge(left, right):
    result = []
    i = 0
    j = 0

    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1

    result.extend(left[i:])
    result.extend(right[j:])
    return result

# ── Call your function here ──
arr = [38, 27, 43, 3, 9, 82, 10]
sorted_arr = merge_sort(arr)`,

java:`// Merge Sort — Java
import java.util.Arrays;

public class Main {

    static int[] mergeSort(int[] arr) {
        if (arr.length <= 1) return arr;

        int mid     = arr.length / 2;
        int[] left  = mergeSort(Arrays.copyOfRange(arr, 0, mid));
        int[] right = mergeSort(Arrays.copyOfRange(arr, mid, arr.length));

        return merge(left, right);
    }

    static int[] merge(int[] left, int[] right) {
        int[] result = new int[left.length + right.length];
        int i = 0, j = 0, k = 0;

        while (i < left.length && j < right.length) {
            if (left[i] <= right[j]) {
                result[k++] = left[i++];
            } else {
                result[k++] = right[j++];
            }
        }

        while (i < left.length)  result[k++] = left[i++];
        while (j < right.length) result[k++] = right[j++];

        return result;
    }

    public static void main(String[] args) {
        int[] arr    = {38, 27, 43, 3, 9, 82, 10};
        int[] sorted = mergeSort(arr);
    }
}`,

cpp:`// Merge Sort — C++
#include <iostream>
#include <vector>
using namespace std;

vector<int> mergeFn(vector<int> left, vector<int> right) {
    vector<int> result;
    int i = 0, j = 0;

    while (i < (int)left.size() && j < (int)right.size()) {
        if (left[i] <= right[j]) {
            result.push_back(left[i++]);
        } else {
            result.push_back(right[j++]);
        }
    }

    while (i < (int)left.size())  result.push_back(left[i++]);
    while (j < (int)right.size()) result.push_back(right[j++]);

    return result;
}

vector<int> mergeSort(vector<int> arr) {
    if (arr.size() <= 1) return arr;

    int mid = arr.size() / 2;
    vector<int> left  = mergeSort(vector<int>(arr.begin(), arr.begin() + mid));
    vector<int> right = mergeSort(vector<int>(arr.begin() + mid, arr.end()));

    return mergeFn(left, right);
}

int main() {
    vector<int> arr    = {38, 27, 43, 3, 9, 82, 10};
    vector<int> sorted = mergeSort(arr);
    return 0;
}`,

csharp:`// Merge Sort — C#
using System;
using System.Linq;

class Program {
    static int[] MergeSort(int[] arr) {
        if (arr.Length <= 1) return arr;

        int mid      = arr.Length / 2;
        int[] left   = MergeSort(arr.Take(mid).ToArray());
        int[] right  = MergeSort(arr.Skip(mid).ToArray());

        return Merge(left, right);
    }

    static int[] Merge(int[] left, int[] right) {
        int[] result = new int[left.Length + right.Length];
        int i = 0, j = 0, k = 0;

        while (i < left.Length && j < right.Length) {
            if (left[i] <= right[j]) {
                result[k++] = left[i++];
            } else {
                result[k++] = right[j++];
            }
        }

        while (i < left.Length)  result[k++] = left[i++];
        while (j < right.Length) result[k++] = right[j++];

        return result;
    }

    static void Main() {
        int[] arr    = {38, 27, 43, 3, 9, 82, 10};
        int[] sorted = MergeSort(arr);
    }
}`,

go:`// Merge Sort — Go
package main

import "fmt"

func mergeFn(left, right []int) []int {
    result := []int{}
    i, j := 0, 0

    for i < len(left) && j < len(right) {
        if left[i] <= right[j] {
            result = append(result, left[i])
            i++
        } else {
            result = append(result, right[j])
            j++
        }
    }

    result = append(result, left[i:]...)
    result = append(result, right[j:]...)
    return result
}

func mergeSort(arr []int) []int {
    if len(arr) <= 1 {
        return arr
    }

    mid   := len(arr) / 2
    left  := mergeSort(arr[:mid])
    right := mergeSort(arr[mid:])

    return mergeFn(left, right)
}

func main() {
    arr    := []int{38, 27, 43, 3, 9, 82, 10}
    sorted := mergeSort(arr)
    fmt.Println(sorted)
}`,

rust:`// Merge Sort — Rust
fn merge(left: Vec<i32>, right: Vec<i32>) -> Vec<i32> {
    let mut result = Vec::new();
    let mut i = 0;
    let mut j = 0;

    while i < left.len() && j < right.len() {
        if left[i] <= right[j] {
            result.push(left[i]);
            i += 1;
        } else {
            result.push(right[j]);
            j += 1;
        }
    }

    result.extend_from_slice(&left[i..]);
    result.extend_from_slice(&right[j..]);
    result
}

fn merge_sort(arr: Vec<i32>) -> Vec<i32> {
    if arr.len() <= 1 { return arr; }

    let mid   = arr.len() / 2;
    let left  = merge_sort(arr[..mid].to_vec());
    let right = merge_sort(arr[mid..].to_vec());

    merge(left, right)
}

fn main() {
    let arr    = vec![38, 27, 43, 3, 9, 82, 10];
    let sorted = merge_sort(arr);
    println!("{:?}", sorted);
}`,
};

// ══════════════════════════════════════════════════════════════════════════════
// ARRAY EXTRACTION — finds numeric array in any language template
// ══════════════════════════════════════════════════════════════════════════════
function extractInputArray(code) {
  // Match [N, N, N, ...] or {N, N, N, ...}
  const patterns = [
    /(?:arr|array|nums|numbers|input|data)\s*(?:=|:=)\s*[\[{]([^\]\}]+)[\]\}]/i,
    /[\[{]\s*(-?\d+(?:\s*,\s*-?\d+)+)\s*[\]\}]/,
  ];
  for (const pat of patterns) {
    const m = code.match(pat);
    if (m) {
      const nums = m[1].split(",").map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
      if (nums.length >= 2 && nums.length <= 20) return nums;
    }
  }
  return [38, 27, 43, 3, 9, 82, 10];
}

// ══════════════════════════════════════════════════════════════════════════════
// SIMULATION ENGINE — builds full step trace with every event
// ══════════════════════════════════════════════════════════════════════════════
function buildMergeSortSteps(inputArr) {
  const steps = [];
  let sid = 0;
  const add = (type, data) => steps.push({ id: sid++, type, ...data });

  function mergeSort(arr, depth, path) {
    add("call", {
      arr: [...arr], depth, path,
      codeLine: arr.length <= 1 ? "if (arr.length <= 1) return arr;" : "const mid = Math.floor(arr.length / 2);",
      lineHint: arr.length <= 1 ? "base" : "mid",
      msg: `mergeSort([${arr.join(", ")}])  depth=${depth}  path="${path||"root"}"`,
    });

    if (arr.length <= 1) {
      add("base_case", {
        arr: [...arr], depth, path,
        codeLine: "if (arr.length <= 1) return arr;",
        lineHint: "base",
        msg: `Base case ★  [${arr.join(", ")}] has ≤1 element → trivially sorted`,
      });
      return [...arr];
    }

    const mid = Math.floor(arr.length / 2);
    const leftArr  = arr.slice(0, mid);
    const rightArr = arr.slice(mid);

    add("divide", {
      arr: [...arr], left: [...leftArr], right: [...rightArr], mid, depth, path,
      codeLine: "const left = mergeSort(arr.slice(0, mid));",
      lineHint: "divide",
      msg: `Divide  [${arr.join(", ")}]  →  left [${leftArr.join(", ")}]  |  right [${rightArr.join(", ")}]   mid=${mid}`,
    });

    const sortedLeft  = mergeSort(leftArr,  depth + 1, path + "L");
    const sortedRight = mergeSort(rightArr, depth + 1, path + "R");
    return mergeFn(sortedLeft, sortedRight, depth, path, arr);
  }

  function mergeFn(left, right, depth, path, original) {
    add("call", {
      arr: original ? [...original] : [...left, ...right],
      left: [...left], right: [...right], result: [],
      depth, path, isMerge: true,
      codeLine: "return merge(left, right);",
      lineHint: "merge",
      msg: `merge([${left.join(", ")}],  [${right.join(", ")}])  ← both sides sorted`,
    });

    const result = [];
    let i = 0, j = 0;

    while (i < left.length && j < right.length) {
      add("compare", {
        left: [...left], right: [...right], result: [...result],
        li: i, ri: j, depth, path,
        codeLine: "if (left[i] <= right[j]) {",
        lineHint: "compare",
        msg: `Compare  left[${i}]=${left[i]}  vs  right[${j}]=${right[j]}  →  ${left[i] <= right[j] ? `${left[i]} ≤ ${right[j]}, pick LEFT` : `${right[j]} < ${left[i]}, pick RIGHT`}`,
      });

      if (left[i] <= right[j]) {
        result.push(left[i]);
        add("pick_left", {
          left: [...left], right: [...right], result: [...result],
          li: i, ri: j, picked: left[i], depth, path,
          codeLine: "result.push(left[i]);  i++;",
          lineHint: "push_left",
          msg: `Pick ${left[i]} from LEFT  →  output so far: [${result.join(", ")}]`,
        });
        i++;
      } else {
        result.push(right[j]);
        add("pick_right", {
          left: [...left], right: [...right], result: [...result],
          li: i, ri: j, picked: right[j], depth, path,
          codeLine: "result.push(right[j]);  j++;",
          lineHint: "push_right",
          msg: `Pick ${right[j]} from RIGHT  →  output so far: [${result.join(", ")}]`,
        });
        j++;
      }
    }

    while (i < left.length) {
      result.push(left[i]);
      add("copy_left", {
        left: [...left], right: [...right], result: [...result],
        li: i, ri: j, picked: left[i], depth, path,
        codeLine: "return result.concat(left.slice(i))",
        lineHint: "concat",
        msg: `Copy remaining left[${i}]=${left[i]}  →  output: [${result.join(", ")}]`,
      });
      i++;
    }

    while (j < right.length) {
      result.push(right[j]);
      add("copy_right", {
        left: [...left], right: [...right], result: [...result],
        li: i, ri: j, picked: right[j], depth, path,
        codeLine: ".concat(right.slice(j));",
        lineHint: "concat",
        msg: `Copy remaining right[${j}]=${right[j]}  →  output: [${result.join(", ")}]`,
      });
      j++;
    }

    add("merge_done", {
      left: [...left], right: [...right], result: [...result],
      depth, path,
      codeLine: "return result;",
      lineHint: "return",
      msg: `✓ Merged  →  [${result.join(", ")}]  (${result.length} elements, fully sorted)`,
    });

    return result;
  }

  const sorted = mergeSort(inputArr, 0, "");
  add("sorted", {
    arr: [...sorted], depth: 0, path: "",
    codeLine: "const sorted = mergeSort(arr);",
    lineHint: "sorted",
    msg: `🎉 Array fully sorted:  [${sorted.join(", ")}]`,
  });

  return { steps, sorted };
}

// ══════════════════════════════════════════════════════════════════════════════
// LINE MAPPING — maps a step's lineHint to actual line number in editor
// ══════════════════════════════════════════════════════════════════════════════
function mapStepToLine(step, codeLines) {
  const hint = step.lineHint ?? "";
  const searches = {
    base:       ["<= 1", "length <= 1", "len(arr) <= 1", "arr.len() <= 1", "arr.Length <= 1"],
    mid:        ["Math.floor", "arr.length / 2", "len(arr) //", "arr.length / 2", "arr.Length / 2", "len(arr) / 2"],
    divide:     ["mergeSort(arr.slice", "merge_sort(arr[:", "mergeSort(arr[:mid", "mergeSort(Arrays", "mergeSort(vector", "MergeSort(arr.Take", "mergeSort(arr[:"],
    merge:      ["return merge(", "return mergeFn(", "merge(left, right)", "Merge(left", "mergeFn(left"],
    compare:    ["left[i] <=", "left[i] <=", "left.get(i)", "left[i] <="],
    push_left:  ["result.push(left", "result.append(left", "result[k++] = left", "push_back(left", "result.push(left[i])"],
    push_right: ["result.push(right", "result.append(right", "result[k++] = right", "push_back(right"],
    concat:     ["concat(left", "extend(left", "extend_from_slice", "result.extend", "result = append(result, left"],
    return:     ["return result", "return result"],
    sorted:     ["sorted =", "sorted_arr", "const sorted", "sorted :=", "let sorted"],
  };
  const terms = searches[hint] ?? [step.codeLine ?? ""];
  for (const term of terms) {
    for (let i = 0; i < codeLines.length; i++) {
      if (codeLines[i].includes(term)) return i;
    }
  }
  return 0;
}

// ══════════════════════════════════════════════════════════════════════════════
// GEMINI VALIDATION GATE (mirrors stack visualizer exactly)
// ══════════════════════════════════════════════════════════════════════════════
async function validateWithGemini(code, lang) {
  const prompt = `You are a strict code reviewer for a Merge Sort algorithm visualizer.

The user has written a Merge Sort implementation in ${lang}. Your job:
1. Check if it is a CORRECT and COMPLETE Merge Sort with at least mergeSort and merge functions.
2. Look for logic bugs: wrong split point, merge not producing sorted output, base case missing, not returning result, etc.
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
If valid is false, include at least one error with exact line number (1-based) and a clear message.

Code:
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
    if (data.error) return { valid: true, reason: `AI unavailable: ${data.error}`, errors: [], apiError: data.error };
    const raw     = data.content ?? "";
    const cleaned = raw.replace(/```json|```/gi, "").trim();
    const parsed  = JSON.parse(cleaned);
    return { valid: !!parsed.valid, reason: parsed.reason ?? "", errors: Array.isArray(parsed.errors) ? parsed.errors : [], apiError: null };
  } catch (e) {
    return { valid: true, reason: "", errors: [], apiError: e.message };
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// MERGE SORT VISUALIZATION — the main visual panel
// Mirrors StackViz from the stack visualizer in structure and animation style
// ══════════════════════════════════════════════════════════════════════════════
function MergeSortViz({ step, animKey, idle }) {
  // "flyItem" — the picked element flies into the output (mirrors pop fly-away)
  const [flyItem, setFlyItem] = useState(null);

  useEffect(() => {
    if ((step?.type === "pick_left" || step?.type === "pick_right" || step?.type === "copy_left" || step?.type === "copy_right") && step.picked != null) {
      setFlyItem({ v: step.picked, side: step.type.includes("left") ? "LEFT" : "RIGHT", key: animKey });
      const t = setTimeout(() => setFlyItem(null), 700);
      return () => clearTimeout(t);
    }
    if (!["pick_left","pick_right","copy_left","copy_right"].includes(step?.type)) setFlyItem(null);
  }, [animKey, step?.type]);

  if (!step) {
    return (
      <div className="msv">
        <div className="msv-metrics">
          {[{lbl:"DEPTH",val:"—",c:"#f472b6"},{lbl:"PHASE",val:"—",c:"#60a5fa"},{lbl:"LEFT",val:"—",c:"#4ade80"},{lbl:"RIGHT",val:"—",c:"#93c5fd"},{lbl:"OUTPUT",val:"—",c:"#fbbf24"},{lbl:"POLICY",val:"D&C",c:"#a78bfa"}].map(m=>(
            <div className="msv-m" key={m.lbl}><span className="msv-ml">{m.lbl}</span><span className="msv-mv" style={{color:m.c}}>{m.val}</span></div>
          ))}
        </div>
        <div className="msv-idle">
          <div className="msv-idle-icon">{idle ? "🌊" : "⏳"}</div>
          <div className="msv-idle-txt">{idle ? "Write merge sort code below, then click Run & Visualize" : "Waiting for steps…"}</div>
        </div>
        <div className="msv-plat"><div className="msv-plat-shine"/></div>
        <p className="msv-base">▲ MERGE SORT ENGINE</p>
      </div>
    );
  }

  const isErr     = step.type === "error";
  const isSorted  = step.type === "sorted";
  const isMergeDone = step.type === "merge_done";
  const isCompare = step.type === "compare";
  const isPick    = step.type === "pick_left" || step.type === "pick_right";
  const isCopy    = step.type === "copy_left" || step.type === "copy_right";
  const isBase    = step.type === "base_case";
  const isDivide  = step.type === "divide";
  const isCall    = step.type === "call";
  const depth     = step.depth ?? 0;

  const left   = step.left   ?? (isBase || isDivide || isCall ? step.arr ?? [] : []);
  const right  = step.right  ?? [];
  const result = step.result ?? [];
  const arr    = step.arr    ?? [];

  // Metrics (mirrors stack viz metrics strip exactly)
  const phaseLabel = isBase ? "BASE ★" : isDivide ? "DIVIDE ✂" : (isCall && !step.isMerge) ? "RECURSE ↓" : isCall && step.isMerge ? "MERGE ↑" : isMergeDone ? "DONE ✓" : isCompare ? "COMPARE ⚖" : isPick ? "PICK" : isCopy ? "COPY" : isSorted ? "SORTED 🎉" : "MERGE ↑";

  const metrics = [
    { lbl:"DEPTH",  val: depth,                                     c:"#f472b6" },
    { lbl:"PHASE",  val: phaseLabel,                                c:"#60a5fa" },
    { lbl:"LEFT",   val: (step.isMerge ? left : isDivide ? step.left ?? [] : arr).length,  c:"#4ade80" },
    { lbl:"RIGHT",  val: (step.isMerge ? right : isDivide ? step.right ?? [] : []).length, c:"#93c5fd" },
    { lbl:"OUTPUT", val: result.length,                             c:"#fbbf24" },
    { lbl:"POLICY", val: "D&C",                                     c:"#a78bfa" },
  ];

  return (
    <div className={`msv${isErr ? " msv-err" : ""}${isSorted ? " msv-sorted" : ""}`} key={isErr ? `e${animKey}` : "msv"}>

      {/* ── Metrics strip (identical layout to stack viz) ── */}
      <div className="msv-metrics">
        {metrics.map(m => (
          <div className="msv-m" key={m.lbl}>
            <span className="msv-ml">{m.lbl}</span>
            <span className="msv-mv" style={{color:m.c}}>{String(m.val)}</span>
          </div>
        ))}
      </div>

      {/* ── Recursion depth ladder ── */}
      <div className="msv-depth-row">
        <span className="msv-depth-lbl">DEPTH:</span>
        {Array.from({length: Math.max(7, depth + 3)}).map((_,i) => (
          <div key={i} className="msv-depth-pip" style={{
            background: i < depth ? "rgba(244,114,182,0.35)" : i === depth ? "rgba(244,114,182,0.9)" : "rgba(255,255,255,0.03)",
            border: `1px solid ${i <= depth ? "rgba(244,114,182,0.55)" : "rgba(255,255,255,0.06)"}`,
            color: i < depth ? "#f9a8d4" : i === depth ? "#fff" : "#1e3050",
            boxShadow: i === depth ? "0 0 10px rgba(244,114,182,0.55)" : "none",
          }}>{i}</div>
        ))}
      </div>

      {/* ── Main display area ── */}
      <div className="msv-body">

        {/* ── DIVIDE / initial CALL: show original + split ── */}
        {(isDivide || (isCall && !step.isMerge)) && (
          <div className="msv-section" key={`div-${animKey}`}>
            <div className="msv-sect-lbl" style={{color:"#f472b6"}}>
              {isDivide ? `✂ SPLITTING  [${arr.join(", ")}]  at mid=${step.mid ?? Math.floor(arr.length/2)}` : `↓ CALL  mergeSort([${arr.join(", ")}])  depth=${depth}`}
            </div>
            {/* Original array */}
            <div className="msv-arr-row">
              {arr.map((v,i) => {
                const c = col(v);
                const isLeft  = isDivide && i < (step.mid ?? 0);
                const isRight = isDivide && i >= (step.mid ?? 0);
                return (
                  <div key={i} className="msv-block"
                    style={{
                      background: isDivide ? (isLeft ? `linear-gradient(135deg,${c.g1}55,${c.g2}22)` : `linear-gradient(135deg,${c.g1}33,${c.g2}11)`) : `linear-gradient(135deg,${c.g1}33,${c.g2}11)`,
                      border: `1.5px solid ${isDivide ? (isLeft ? c.border : `${c.border}60`) : `${c.border}50`}`,
                      boxShadow: isDivide && isLeft ? `0 0 14px ${c.glow}` : "0 3px 10px rgba(0,0,0,0.4)",
                      animation: `blkIn 0.4s cubic-bezier(0.34,1.56,0.64,1) ${i*0.05}s both`,
                    }}>
                    <span className="msv-bidx">[{i}]</span>
                    <span className="msv-bval">{v}</span>
                  </div>
                );
              })}
            </div>
            {/* Halves shown only on divide */}
            {isDivide && step.left && step.right && (
              <div className="msv-halves">
                <div className="msv-half msv-half-l">
                  <div className="msv-half-lbl">LEFT HALF →</div>
                  <div className="msv-arr-row">
                    {step.left.map((v,i) => { const c=col(v); return (
                      <div key={i} className="msv-block msv-block-push"
                        style={{background:`linear-gradient(135deg,${c.g1},${c.g2})`,border:`1.5px solid ${c.border}`,boxShadow:`0 0 16px ${c.glow}`,animation:`blkIn 0.45s cubic-bezier(0.34,1.56,0.64,1) ${i*0.07}s both`}}>
                        <span className="msv-bval">{v}</span>
                      </div>
                    );})}
                  </div>
                </div>
                <div className="msv-divider-arrow">→</div>
                <div className="msv-half msv-half-r">
                  <div className="msv-half-lbl">RIGHT HALF →</div>
                  <div className="msv-arr-row">
                    {step.right.map((v,i) => { const c=col(v); return (
                      <div key={i} className="msv-block msv-block-push"
                        style={{background:`linear-gradient(135deg,${c.g1}88,${c.g2}66)`,border:`1.5px solid ${c.border}88`,animation:`blkIn 0.45s cubic-bezier(0.34,1.56,0.64,1) ${i*0.07}s both`}}>
                        <span className="msv-bval">{v}</span>
                      </div>
                    );})}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── BASE CASE ── */}
        {isBase && (
          <div className="msv-section" key={`base-${animKey}`}>
            <div className="msv-sect-lbl" style={{color:"#a78bfa"}}>★ BASE CASE — single element, trivially sorted</div>
            <div className="msv-arr-row" style={{justifyContent:"center"}}>
              {arr.map((v,i) => { const c=col(v); return (
                <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:5}}>
                  <div className="msv-block msv-block-base"
                    style={{background:`linear-gradient(135deg,${c.g1},${c.g2})`,border:`1.5px solid ${c.border}`,boxShadow:`0 0 28px ${c.glow}, 0 6px 20px rgba(0,0,0,0.55)`,width:54,height:54}}>
                    <span className="msv-bval" style={{fontSize:17}}>{v}</span>
                  </div>
                  <div className="msv-sorted-badge">✓ sorted</div>
                </div>
              );})}
            </div>
          </div>
        )}

        {/* ── MERGE CALL ── */}
        {isCall && step.isMerge && (
          <div className="msv-section" key={`mc-${animKey}`}>
            <div className="msv-sect-lbl" style={{color:"#fb923c"}}>↑ MERGE CALL  depth={depth}  path="{step.path||"root"}"</div>
            <div className="msv-halves">
              <div className="msv-half msv-half-l">
                <div className="msv-half-lbl">SORTED LEFT</div>
                <div className="msv-arr-row">
                  {left.map((v,i) => { const c=col(v); return (
                    <div key={i} className="msv-block" style={{background:`linear-gradient(135deg,${c.g1}44,${c.g2}22)`,border:`1.5px solid ${c.border}60`,animation:`blkIn 0.38s ease ${i*0.06}s both`}}>
                      <span className="msv-bval">{v}</span>
                    </div>
                  );})}
                </div>
              </div>
              <div className="msv-divider-arrow">+</div>
              <div className="msv-half msv-half-r">
                <div className="msv-half-lbl">SORTED RIGHT</div>
                <div className="msv-arr-row">
                  {right.map((v,i) => { const c=col(v); return (
                    <div key={i} className="msv-block" style={{background:`linear-gradient(135deg,${c.g1}33,${c.g2}11)`,border:`1.5px solid ${c.border}44`,animation:`blkIn 0.38s ease ${i*0.06}s both`}}>
                      <span className="msv-bval">{v}</span>
                    </div>
                  );})}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── COMPARE / PICK / COPY — the main merge loop visualization ── */}
        {(isCompare || isPick || isCopy) && (
          <div className="msv-section" key={`cmp-${animKey}`}>

            {/* Flying-pick animation (mirrors stack's flyItem pop) */}
            {flyItem && (
              <div className="msv-fly" key={`fly-${flyItem.key}`}
                style={{
                  background: `linear-gradient(135deg,${col(flyItem.v).g1},${col(flyItem.v).g2})`,
                  boxShadow:  `0 0 40px ${col(flyItem.v).glow}`,
                }}>
                <span className="msv-fly-v">{flyItem.v}</span>
                <span className="msv-fly-tag">← {flyItem.side}</span>
              </div>
            )}

            <div className="msv-merge-grid">
              {/* LEFT side */}
              <div className="msv-mg-side msv-mg-left">
                <div className="msv-half-lbl" style={{color:"#f472b6"}}>LEFT</div>
                <div className="msv-arr-col">
                  {left.map((v,i) => {
                    const isPast = i < step.li;
                    const isCur  = i === step.li;
                    const isPicked = isPick && step.type === "pick_left" && isCur;
                    const c = col(v);
                    return (
                      <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                        <div className={`msv-block ${isPicked?"msv-block-picked":isCompare&&isCur?"msv-block-compare":""}`}
                          style={{
                            background: isPicked||( isCompare&&isCur) ? `linear-gradient(135deg,${c.g1},${c.g2})` : isPast ? "rgba(255,255,255,0.02)" : `linear-gradient(135deg,${c.g1}33,${c.g2}11)`,
                            border: `1.5px solid ${isPicked||(isCompare&&isCur) ? c.border : isPast ? "rgba(255,255,255,0.05)" : `${c.border}50`}`,
                            boxShadow: isPicked ? `0 0 28px ${c.glow}` : (isCompare&&isCur) ? `0 0 18px ${c.glow}` : "0 3px 8px rgba(0,0,0,0.4)",
                            opacity: isPast ? 0.25 : 1,
                            animation: isPicked ? `blkPop 0.38s cubic-bezier(0.34,1.56,0.64,1) both` : "none",
                          }}>
                          <span className="msv-bidx">[{i}]</span>
                          <span className="msv-bval">{v}</span>
                        </div>
                        {isCur && !isPast && <div className="msv-ptr" style={{background:"#f472b6",boxShadow:"0 0 6px #f472b6"}}/>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* VS / arrow divider */}
              <div className="msv-mg-vs">
                {isCompare ? <span style={{color:"#fbbf24",fontSize:16,fontWeight:700}}>⚖</span> : <span style={{color:"#4ade80",fontSize:14}}>→</span>}
              </div>

              {/* RIGHT side */}
              <div className="msv-mg-side msv-mg-right">
                <div className="msv-half-lbl" style={{color:"#60a5fa"}}>RIGHT</div>
                <div className="msv-arr-col">
                  {right.map((v,i) => {
                    const isPast = i < step.ri;
                    const isCur  = i === step.ri;
                    const isPicked = isPick && step.type === "pick_right" && isCur;
                    const c = col(v);
                    return (
                      <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                        <div className={`msv-block ${isPicked?"msv-block-picked":isCompare&&isCur?"msv-block-compare":""}`}
                          style={{
                            background: isPicked||(isCompare&&isCur) ? `linear-gradient(135deg,${c.g1},${c.g2})` : isPast ? "rgba(255,255,255,0.02)" : `linear-gradient(135deg,${c.g1}33,${c.g2}11)`,
                            border: `1.5px solid ${isPicked||(isCompare&&isCur) ? c.border : isPast ? "rgba(255,255,255,0.05)" : `${c.border}50`}`,
                            boxShadow: isPicked ? `0 0 28px ${c.glow}` : (isCompare&&isCur) ? `0 0 18px ${c.glow}` : "0 3px 8px rgba(0,0,0,0.4)",
                            opacity: isPast ? 0.25 : 1,
                            animation: isPicked ? `blkPop 0.38s cubic-bezier(0.34,1.56,0.64,1) both` : "none",
                          }}>
                          <span className="msv-bidx">[{i}]</span>
                          <span className="msv-bval">{v}</span>
                        </div>
                        {isCur && !isPast && <div className="msv-ptr" style={{background:"#60a5fa",boxShadow:"0 0 6px #60a5fa"}}/>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Output row */}
            <div className="msv-output-row">
              <div className="msv-half-lbl" style={{color:"#4ade80",marginBottom:6}}>OUTPUT (merged so far)</div>
              <div className="msv-arr-row" style={{minHeight:42,flexWrap:"wrap"}}>
                {result.length === 0
                  ? <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#1a2030"}}>empty</span>
                  : result.map((v,i) => {
                    const isLatest = i === result.length - 1;
                    const c = col(v);
                    return (
                      <div key={i} className={`msv-block${isLatest?" msv-block-output":""}`}
                        style={{
                          background: "linear-gradient(135deg,rgba(74,222,128,0.28),rgba(52,211,153,0.18))",
                          border: `1.5px solid ${isLatest ? "rgba(74,222,128,0.9)" : "rgba(74,222,128,0.5)"}`,
                          boxShadow: isLatest ? "0 0 22px rgba(74,222,128,0.55)" : "0 3px 8px rgba(0,0,0,0.35)",
                          animation: isLatest ? `blkDrop 0.42s cubic-bezier(0.34,1.56,0.64,1) both` : "none",
                        }}>
                        <span className="msv-bval" style={{color:"#4ade80"}}>{v}</span>
                      </div>
                    );
                  })
                }
              </div>
            </div>
          </div>
        )}

        {/* ── MERGE DONE ── */}
        {isMergeDone && (
          <div className="msv-section" key={`md-${animKey}`}>
            <div className="msv-sect-lbl" style={{color:"#4ade80"}}>✓ MERGE COMPLETE  depth={depth}</div>
            <div className="msv-arr-row" style={{flexWrap:"wrap",padding:"12px 14px",borderRadius:12,background:"rgba(74,222,128,0.08)",border:"1px solid rgba(74,222,128,0.25)"}}>
              {result.map((v,i) => { const c=col(v); return (
                <div key={i} className="msv-block"
                  style={{
                    background:"linear-gradient(135deg,rgba(74,222,128,0.3),rgba(52,211,153,0.2))",
                    border:"1.5px solid rgba(74,222,128,0.7)",
                    boxShadow:"0 0 14px rgba(74,222,128,0.35)",
                    animation:`blkIn 0.38s cubic-bezier(0.34,1.56,0.64,1) ${i*0.05}s both`,
                  }}>
                  <span className="msv-bval" style={{color:"#4ade80"}}>{v}</span>
                </div>
              );})}
            </div>
          </div>
        )}

        {/* ── FULLY SORTED ── */}
        {isSorted && (
          <div className="msv-section" key={`sorted-${animKey}`}>
            <div className="msv-sect-lbl" style={{color:"#4ade80",fontSize:12}}>🎉 FULLY SORTED</div>
            <div className="msv-arr-row" style={{flexWrap:"wrap",justifyContent:"center"}}>
              {arr.map((v,i) => { const c=col(v); return (
                <div key={i} className="msv-block msv-block-sorted"
                  style={{
                    background:`linear-gradient(135deg,${c.g1},${c.g2})`,
                    border:`2px solid ${c.border}`,
                    boxShadow:`0 0 22px ${c.glow}, 0 6px 18px rgba(0,0,0,0.5)`,
                    width:50,height:50,
                    animation:`blkDrop 0.55s cubic-bezier(0.34,1.56,0.64,1) ${i*0.07}s both`,
                  }}>
                  <span className="msv-bval" style={{fontSize:16}}>{v}</span>
                </div>
              );})}
            </div>
          </div>
        )}
      </div>

      {/* Platform (identical to stack viz) */}
      <div className="msv-plat"><div className="msv-plat-shine"/></div>
      <p className="msv-base">▲ MERGE SORT ENGINE</p>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MINI CALL TREE (bonus: shows full recursion tree path)
// ══════════════════════════════════════════════════════════════════════════════
function CallTreeMini({ steps, currentIdx }) {
  const seen = new Map();
  for (let i = 0; i <= currentIdx && i < steps.length; i++) {
    const s = steps[i];
    const key = `${s.depth}|${s.path}`;
    if (!seen.has(key)) seen.set(key, { depth:s.depth, path:s.path, arr: s.arr ?? s.left ?? [], done:false });
    if (s.type === "merge_done" || s.type === "base_case") seen.get(key).done = true;
  }
  const cur = steps[currentIdx];
  const curKey = cur ? `${cur.depth}|${cur.path}` : null;
  const maxD = Math.max(...[...seen.values()].map(n => n.depth), 0);

  return (
    <div className="ct">
      <div className="ct-lbl">CALL TREE</div>
      <div className="ct-body">
        {Array.from({length:maxD+1}).map((_,d) => {
          const nodes = [...seen.values()].filter(n => n.depth === d);
          if (!nodes.length) return null;
          return (
            <div key={d} className="ct-row">
              <span className="ct-d">{d}</span>
              {nodes.map(n => {
                const key = `${n.depth}|${n.path}`;
                const isActive = key === curKey;
                const preview = n.arr.slice(0,3).join(",") + (n.arr.length>3?"…":"");
                return (
                  <div key={key} className="ct-node" style={{
                    background: isActive?"rgba(244,114,182,0.22)":n.done?"rgba(74,222,128,0.1)":"rgba(255,255,255,0.03)",
                    border: `1px solid ${isActive?"rgba(244,114,182,0.65)":n.done?"rgba(74,222,128,0.28)":"rgba(255,255,255,0.06)"}`,
                    color: isActive?"#f9a8d4":n.done?"#4ade80":"#2d3748",
                    boxShadow: isActive?"0 0 10px rgba(244,114,182,0.45)":"none",
                  }}>[{preview}]</div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════════
export default function MergeSortVisualizerPage() {
  const [lang,       setLang]       = useState("javascript");
  const [code,       setCode]       = useState(TPL.javascript);
  const [steps,      setSteps]      = useState([]);
  const [idx,        setIdx]        = useState(-1);
  const [error,      setError]      = useState("");
  const [playing,    setPlaying]    = useState(false);
  const [speed,      setSpeed]      = useState(1.1);
  const [animKey,    setAnimKey]    = useState(0);
  const [done,       setDone]       = useState(false);
  const [inputArr,   setInputArr]   = useState([38,27,43,3,9,82,10]);
  // Gemini gate — mirrors stack viz exactly
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

  const changeLang = (l) => { setLang(l); setCode(TPL[l] ?? ""); doReset(); };

  // ── Main run handler — Gemini gate first (mirrors stack viz) ──────────────
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
    const arr = extractInputArray(code);
    if (arr.length < 2)  { setError("Need at least 2 numeric elements in your array."); return; }
    if (arr.length > 18) { setError("Max 18 elements for clean visualization. Reduce the array size."); return; }
    setInputArr(arr);
    const { steps: s } = buildMergeSortSteps(arr);
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

  // Ctrl+Enter
  useEffect(() => {
    const h = (e) => { if ((e.ctrlKey||e.metaKey)&&e.key==="Enter") { e.preventDefault(); handleRun(); } };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [code, lang]);

  // Autoplay
  useEffect(() => {
    if (!playing || !steps.length) return;
    timerRef.current = setInterval(() => {
      setIdx(prev => {
        if (prev >= steps.length - 1) { clearInterval(timerRef.current); setPlaying(false); setDone(true); return prev; }
        bump();
        return prev + 1;
      });
    }, speed * 1000);
    return () => clearInterval(timerRef.current);
  }, [playing, steps, speed]);

  // Scroll active step
  useEffect(() => {
    listRef.current?.querySelector(".sl-active")?.scrollIntoView({ block:"nearest", behavior:"smooth" });
  }, [idx]);

  // Tab support
  const onKeyDown = (e) => {
    if (e.key !== "Tab") return;
    e.preventDefault();
    const s = e.target.selectionStart, en = e.target.selectionEnd;
    const nv = code.slice(0,s) + "  " + code.slice(en);
    setCode(nv);
    requestAnimationFrame(() => { if(taRef.current){taRef.current.selectionStart=s+2;taRef.current.selectionEnd=s+2;} });
  };

  const step     = steps[idx] ?? null;
  const os       = step ? (OP[step.type] ?? OP.compare) : null;
  const prog     = steps.length ? Math.round(((idx+1)/steps.length)*100) : 0;
  const hasAiErr = aiErrors.length > 0;
  const idle     = steps.length === 0 && !error && !hasAiErr;
  const lm       = LANGS[lang];
  const codeLines= code.split("\n");
  const activeLine = step ? mapStepToLine(step, codeLines) : -1;
  const errLineSet = new Set(aiErrors.map(e => (e.line ?? 1) - 1));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:#030612;color:#e2e8f0;font-family:'DM Sans',sans-serif;min-height:100vh}

        /* PAGE */
        .pg{min-height:100vh;display:flex;flex-direction:column;
          background:
            radial-gradient(ellipse 60% 45% at 10% 0%,rgba(74,222,128,0.1) 0%,transparent 60%),
            radial-gradient(ellipse 50% 40% at 90% 100%,rgba(244,114,182,0.1) 0%,transparent 58%),
            radial-gradient(ellipse 40% 35% at 50% 55%,rgba(96,165,250,0.05) 0%,transparent 60%),
            #030612}

        /* HEADER */
        .hd{position:sticky;top:0;z-index:200;display:flex;align-items:center;gap:14px;
          padding:14px 40px;background:rgba(3,6,18,0.9);backdrop-filter:blur(22px) saturate(160%);
          border-bottom:1px solid rgba(74,222,128,0.12)}
        .hd-logo{width:40px;height:40px;border-radius:12px;flex-shrink:0;
          background:linear-gradient(135deg,#166534,#4ade80);
          display:flex;align-items:center;justify-content:center;font-size:20px;
          box-shadow:0 0 24px rgba(74,222,128,0.5)}
        .hd-title{font-family:'Syne',sans-serif;font-size:19px;font-weight:800;letter-spacing:-0.4px;
          background:linear-gradient(90deg,#4ade80,#60a5fa,#f9a8d4);
          -webkit-background-clip:text;-webkit-text-fill-color:transparent}
        .hd-sub{font-size:10px;color:#334155;font-family:'JetBrains Mono',monospace;margin-top:2px}
        .hd-badge{margin-left:auto;background:rgba(74,222,128,0.1);border:1px solid rgba(74,222,128,0.25);
          color:#4ade80;font-size:10px;font-family:'JetBrains Mono',monospace;
          padding:4px 12px;border-radius:20px;letter-spacing:0.05em;white-space:nowrap}

        /* MAIN GRID */
        .main{display:grid;grid-template-columns:1fr 1fr;gap:18px;
          padding:20px 40px 60px;max-width:1440px;margin:0 auto;width:100%;flex:1}
        @media(max-width:960px){.main{grid-template-columns:1fr;padding:16px 14px 60px}.hd{padding:12px 16px}}

        /* PANEL */
        .panel{background:rgba(7,12,30,0.78);border:1px solid rgba(255,255,255,0.07);
          border-radius:18px;display:flex;flex-direction:column;overflow:hidden;
          box-shadow:0 24px 60px rgba(0,0,0,0.55)}
        .ph{padding:12px 18px;border-bottom:1px solid rgba(255,255,255,0.06);
          background:rgba(12,20,44,0.6);display:flex;align-items:center;gap:7px}
        .pd{width:10px;height:10px;border-radius:50%}
        .pt{font-family:'JetBrains Mono',monospace;font-size:9.5px;color:#334155;
          text-transform:uppercase;letter-spacing:1.5px;margin-left:8px}

        /* LANG TABS */
        .lb{display:flex;gap:4px;flex-wrap:wrap;padding:11px 16px;
          border-bottom:1px solid rgba(255,255,255,0.05);background:rgba(9,16,36,0.5)}
        .lt{padding:5px 11px;border-radius:7px;cursor:pointer;
          font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;
          border:1px solid rgba(255,255,255,0.07);background:transparent;color:#2d3748;
          transition:all 0.17s;letter-spacing:0.03em}
        .lt:hover{color:#475569;border-color:rgba(255,255,255,0.13)}
        .lt.la{background:rgba(74,222,128,0.16);border-color:rgba(74,222,128,0.38);color:#4ade80}

        /* CODE EDITOR */
        .cw{flex:1;position:relative;display:flex;flex-direction:column;min-height:0}
        .ln-col{position:absolute;left:0;top:0;bottom:0;width:40px;padding:18px 0;
          border-right:1px solid rgba(255,255,255,0.04);overflow:hidden;pointer-events:none;
          display:flex;flex-direction:column}
        .ln{font-family:'JetBrains Mono',monospace;font-size:11px;color:#1e293b;
          text-align:right;padding-right:9px;line-height:1.7;height:22px;flex-shrink:0}
        .ln.aln{color:#4ade80;background:rgba(74,222,128,0.07);border-radius:3px}
        .al-overlay{position:absolute;left:40px;right:0;height:22px;pointer-events:none;
          background:rgba(74,222,128,0.055);border-left:2px solid rgba(74,222,128,0.45);
          transition:top 0.2s ease}
        .ta{flex:1;padding:18px 16px 18px 50px;background:transparent;border:none;outline:none;
          color:#7dd3fc;font-family:'JetBrains Mono',monospace;font-size:12px;line-height:1.7;
          resize:none;caret-color:#4ade80;min-height:320px;tab-size:2;white-space:pre}
        .ta::selection{background:rgba(74,222,128,0.2)}

        /* ACTIVE LINE BAR */
        .alb{display:flex;align-items:center;gap:9px;padding:6px 14px;
          border-top:1px solid rgba(255,255,255,0.05);border-left:3px solid;min-height:34px;
          animation:alIn 0.22s ease}
        @keyframes alIn{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:none}}
        .alb-icon{font-size:13px}
        .alb-lnum{font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;white-space:nowrap}
        .alb-code{font-family:'JetBrains Mono',monospace;font-size:10px;color:#334155;
          overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1}

        /* ERROR */
        .err{margin:10px 14px;padding:13px 14px;background:rgba(239,68,68,0.07);
          border:1px solid rgba(239,68,68,0.28);border-radius:12px;
          color:#fca5a5;font-family:'JetBrains Mono',monospace;font-size:11.5px;line-height:1.65;
          animation:errSh 0.38s ease}
        @keyframes errSh{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}
        .err-t{font-weight:700;color:#ef4444;margin-bottom:7px;display:flex;align-items:center;gap:7px;font-size:12px}

        /* VALIDATING */
        .vld-bar{margin:10px 14px;padding:11px 14px;display:flex;align-items:center;gap:10px;
          background:rgba(251,191,36,0.07);border:1px solid rgba(251,191,36,0.28);border-radius:12px;
          animation:fadeIn 0.2s ease}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        .vld-spinner{width:16px;height:16px;border-radius:50%;border:2px solid rgba(251,191,36,0.25);
          border-top-color:#fbbf24;animation:spin 0.7s linear infinite;flex-shrink:0}
        @keyframes spin{to{transform:rotate(360deg)}}
        .vld-txt{font-family:'JetBrains Mono',monospace;font-size:11px;color:#fbbf24;letter-spacing:0.04em}

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
        .ai-err-code{font-family:'JetBrains Mono',monospace;font-size:10px;color:#475569;
          margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:340px}
        .api-note{margin:6px 14px 0;padding:7px 12px;border-radius:9px;
          background:rgba(251,191,36,0.06);border:1px solid rgba(251,191,36,0.18);
          font-family:'JetBrains Mono',monospace;font-size:9.5px;color:#92400e;line-height:1.5}

        /* ERROR LINE in gutter */
        .ln.eln{color:#ef4444!important;background:rgba(239,68,68,0.12);border-radius:3px}
        .err-line-overlay{position:absolute;left:40px;right:0;height:22px;pointer-events:none;
          background:rgba(239,68,68,0.07);border-left:2px solid rgba(239,68,68,0.55)}

        /* RUN ROW */
        .rr{padding:12px 16px;border-top:1px solid rgba(255,255,255,0.05);
          display:flex;align-items:center;gap:9px;flex-wrap:wrap}
        .btn-run{padding:10px 28px;border-radius:10px;
          background:linear-gradient(135deg,#166534,#16a34a,#4ade80);border:none;color:#fff;
          font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:700;cursor:pointer;
          transition:all 0.22s;box-shadow:0 0 22px rgba(74,222,128,0.42),0 4px 14px rgba(0,0,0,0.3);
          letter-spacing:0.04em}
        .btn-run:hover{transform:translateY(-2px);box-shadow:0 0 38px rgba(74,222,128,0.65),0 8px 22px rgba(0,0,0,0.3)}
        .btn-run:active{transform:translateY(0)}
        .btn-run.running{animation:rPulse 1s ease-in-out infinite;background:linear-gradient(135deg,#14532d,#166534)}
        @keyframes rPulse{0%,100%{box-shadow:0 0 22px rgba(74,222,128,0.4)}50%{box-shadow:0 0 42px rgba(74,222,128,0.75)}}
        .btn-rst{padding:10px 16px;border-radius:10px;background:transparent;
          border:1px solid rgba(255,255,255,0.1);color:#475569;
          font-family:'JetBrains Mono',monospace;font-size:11px;cursor:pointer;transition:all 0.18s}
        .btn-rst:hover{color:#f87171;border-color:rgba(248,113,113,0.4)}
        .rr-hint{font-family:'JetBrains Mono',monospace;font-size:9px;color:#1e293b;letter-spacing:0.07em}

        /* ═══ VISUALIZATION PANEL ═══ */
        .vb{flex:1;display:flex;flex-direction:column;overflow:hidden}

        /* MERGE SORT VIZ */
        .msv{flex:1;display:flex;flex-direction:column;overflow:hidden}
        .msv.msv-err{animation:svSh 0.42s ease}
        @keyframes svSh{0%,100%{transform:translateX(0)}18%{transform:translateX(-10px)}36%{transform:translateX(10px)}54%{transform:translateX(-6px)}72%{transform:translateX(6px)}}
        .msv.msv-sorted{animation:sortedPulse 0.6s ease}
        @keyframes sortedPulse{0%,100%{filter:brightness(1)}50%{filter:brightness(1.15)}}

        /* Metrics strip */
        .msv-metrics{display:flex;border-bottom:1px solid rgba(255,255,255,0.05);background:rgba(7,12,28,0.5)}
        .msv-m{flex:1;padding:8px 6px;text-align:center;border-right:1px solid rgba(255,255,255,0.04);
          display:flex;flex-direction:column;gap:2px}
        .msv-m:last-child{border-right:none}
        .msv-ml{font-family:'JetBrains Mono',monospace;font-size:7px;color:#1e3050;letter-spacing:0.12em;text-transform:uppercase}
        .msv-mv{font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:700;line-height:1;white-space:nowrap}

        /* Depth row */
        .msv-depth-row{display:flex;align-items:center;gap:5px;padding:7px 14px;
          border-bottom:1px solid rgba(255,255,255,0.04);background:rgba(5,9,22,0.4);flex-wrap:wrap}
        .msv-depth-lbl{font-family:'JetBrains Mono',monospace;font-size:7.5px;color:#1e3050;
          letter-spacing:0.1em;margin-right:4px;white-space:nowrap}
        .msv-depth-pip{width:18px;height:18px;border-radius:6px;display:flex;align-items:center;
          justify-content:center;font-family:'JetBrains Mono',monospace;font-size:8px;font-weight:700;
          transition:all 0.3s;flex-shrink:0}

        /* Body */
        .msv-body{flex:1;padding:14px 16px 8px;overflow-y:auto;display:flex;flex-direction:column;gap:12px;min-height:200px}
        .msv-body::-webkit-scrollbar{width:3px}
        .msv-body::-webkit-scrollbar-thumb{background:#1e3050;border-radius:4px}

        /* Idle */
        .msv-idle{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:20px;min-height:180px}
        .msv-idle-icon{font-size:36px;opacity:0.35}
        .msv-idle-txt{font-family:'JetBrains Mono',monospace;font-size:10px;color:#1e3050;
          letter-spacing:0.07em;text-align:center;line-height:1.6}

        /* Section */
        .msv-section{display:flex;flex-direction:column;gap:8px;animation:fUp 0.35s ease}

        /* Section label */
        .msv-sect-lbl{font-family:'JetBrains Mono',monospace;font-size:9px;font-weight:700;
          letter-spacing:0.08em;opacity:0.9}

        /* Array row */
        .msv-arr-row{display:flex;gap:5px;align-items:center;flex-wrap:wrap}
        .msv-arr-col{display:flex;flex-direction:column;gap:4px;align-items:center}

        /* Block */
        .msv-block{height:42px;min-width:40px;border-radius:10px;
          display:flex;flex-direction:column;align-items:center;justify-content:center;
          position:relative;overflow:hidden;padding:0 8px;flex-shrink:0;
          transition:background 0.3s,border-color 0.3s,box-shadow 0.3s}
        .msv-block::before{content:'';position:absolute;inset:0;
          background:linear-gradient(135deg,rgba(255,255,255,0.15) 0%,transparent 55%);
          border-radius:inherit;pointer-events:none}
        .msv-block-push{animation:blkIn 0.48s cubic-bezier(0.34,1.56,0.64,1) both}
        .msv-block-picked{animation:blkPop 0.38s cubic-bezier(0.34,1.56,0.64,1) both}
        .msv-block-compare{animation:blkPop 0.32s cubic-bezier(0.34,1.56,0.64,1) both}
        .msv-block-output{animation:blkDrop 0.42s cubic-bezier(0.34,1.56,0.64,1) both}
        .msv-block-sorted{animation:blkDrop 0.52s cubic-bezier(0.34,1.56,0.64,1) both}
        .msv-block-base{animation:blkBase 0.55s cubic-bezier(0.34,1.56,0.64,1) both}
        @keyframes blkIn{0%{opacity:0;transform:translateY(-50px) scale(0.78)}60%{opacity:1;transform:translateY(4px) scale(1.04)}80%{transform:translateY(-2px) scale(0.98)}100%{transform:translateY(0) scale(1);opacity:1}}
        @keyframes blkDrop{0%{opacity:0;transform:translateY(-40px) scale(0.8)}60%{opacity:1;transform:translateY(4px) scale(1.06)}100%{transform:translateY(0) scale(1);opacity:1}}
        @keyframes blkPop{0%{transform:scale(0.82);opacity:0.5}60%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}
        @keyframes blkBase{0%{transform:scale(0.7) rotate(-5deg);opacity:0}60%{transform:scale(1.12) rotate(2deg)}100%{transform:scale(1) rotate(0);opacity:1}}

        .msv-bidx{font-family:'JetBrains Mono',monospace;font-size:7.5px;color:rgba(255,255,255,0.4);
          position:absolute;top:3px;left:5px}
        .msv-bval{font-family:'JetBrains Mono',monospace;font-size:14px;font-weight:700;color:#fff;
          text-shadow:0 2px 8px rgba(0,0,0,0.4)}

        /* Pointer dot */
        .msv-ptr{width:5px;height:5px;border-radius:50%;animation:topPulse 1.2s ease-in-out infinite}
        @keyframes topPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(1.7)}}

        /* Sorted badge */
        .msv-sorted-badge{padding:2px 8px;border-radius:20px;background:rgba(167,139,250,0.18);
          border:1px solid rgba(167,139,250,0.4);font-family:'JetBrains Mono',monospace;
          font-size:8.5px;font-weight:700;color:#a78bfa}

        /* Halves grid */
        .msv-halves{display:grid;grid-template-columns:1fr auto 1fr;gap:8px;align-items:start}
        .msv-half{padding:9px 10px;border-radius:11px}
        .msv-half-l{background:rgba(244,114,182,0.06);border:1px solid rgba(244,114,182,0.2)}
        .msv-half-r{background:rgba(96,165,250,0.06);border:1px solid rgba(96,165,250,0.2)}
        .msv-half-lbl{font-family:'JetBrains Mono',monospace;font-size:7.5px;font-weight:700;
          letter-spacing:0.1em;margin-bottom:7px;color:#94a3b8}
        .msv-divider-arrow{display:flex;align-items:center;justify-content:center;
          font-family:'JetBrains Mono',monospace;font-size:14px;color:#334155;padding-top:22px}

        /* Merge grid (compare/pick layout) */
        .msv-merge-grid{display:grid;grid-template-columns:1fr 28px 1fr;gap:6px;align-items:start}
        .msv-mg-side{padding:8px 10px;border-radius:11px}
        .msv-mg-left{background:rgba(244,114,182,0.06);border:1px solid rgba(244,114,182,0.2)}
        .msv-mg-right{background:rgba(96,165,250,0.06);border:1px solid rgba(96,165,250,0.2)}
        .msv-mg-vs{display:flex;align-items:center;justify-content:center;padding-top:22px}

        /* Output row */
        .msv-output-row{padding:9px 12px;border-radius:11px;
          background:rgba(74,222,128,0.06);border:1px solid rgba(74,222,128,0.2)}

        /* Flying pick block (mirrors stack flyItem) */
        .msv-fly{position:relative;align-self:center;margin:0 auto 4px;
          min-width:100px;height:46px;border-radius:12px;display:flex;align-items:center;
          justify-content:center;gap:8px;border:1.5px solid rgba(255,255,255,0.25);
          animation:flyPick 0.65s cubic-bezier(0.22,1,0.36,1) forwards}
        @keyframes flyPick{0%{opacity:0;transform:translateY(-30px) scale(0.75)}40%{opacity:1;transform:translateY(4px) scale(1.08)}60%{transform:translateY(-2px) scale(0.97)}100%{opacity:0;transform:translateY(30px) scale(0.8)}}
        .msv-fly-v{font-family:'JetBrains Mono',monospace;font-size:17px;font-weight:700;color:#fff}
        .msv-fly-tag{font-family:'JetBrains Mono',monospace;font-size:8.5px;color:rgba(255,255,255,0.7);letter-spacing:0.06em}

        /* Platform */
        .msv-plat{margin:4px 20px 0;height:11px;border-radius:7px;
          background:linear-gradient(90deg,rgba(74,222,128,0.28),rgba(74,222,128,0.14),rgba(74,222,128,0.28));
          position:relative;overflow:hidden;
          box-shadow:0 0 22px rgba(74,222,128,0.28),0 4px 12px rgba(74,222,128,0.14)}
        .msv-plat-shine{position:absolute;top:0;left:-100%;width:55%;height:100%;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,0.28),transparent);
          animation:pShine 3.2s ease-in-out infinite}
        @keyframes pShine{0%,100%{left:-100%}55%{left:160%}}
        .msv-base{font-family:'JetBrains Mono',monospace;font-size:8px;color:#1e3050;
          letter-spacing:0.1em;text-align:center;margin-top:4px;margin-bottom:8px}

        /* CALL TREE */
        .ct{padding:8px 14px;border-top:1px solid rgba(255,255,255,0.04);background:rgba(5,9,22,0.5)}
        .ct-lbl{font-family:'JetBrains Mono',monospace;font-size:7.5px;color:#1e3050;letter-spacing:0.1em;margin-bottom:6px}
        .ct-body{display:flex;flex-direction:column;gap:4px;max-height:90px;overflow-y:auto}
        .ct-body::-webkit-scrollbar{width:3px}
        .ct-body::-webkit-scrollbar-thumb{background:#1e3050;border-radius:4px}
        .ct-row{display:flex;gap:4px;align-items:center;flex-wrap:wrap}
        .ct-d{font-family:'JetBrains Mono',monospace;font-size:7px;color:#1e2a38;width:10px;flex-shrink:0}
        .ct-node{padding:2px 6px;border-radius:5px;font-family:'JetBrains Mono',monospace;
          font-size:8px;font-weight:700;transition:all 0.2s;white-space:nowrap}

        /* OP INFO */
        .oi{padding:12px 18px;border-top:1px solid rgba(255,255,255,0.05);
          background:rgba(7,12,28,0.5);min-height:72px}
        .oi-badge{display:inline-flex;align-items:center;gap:8px;padding:5px 13px;
          border-radius:20px;margin-bottom:7px;font-family:'JetBrains Mono',monospace;
          font-size:10.5px;font-weight:700;animation:bdIn 0.28s ease;border:1px solid}
        @keyframes bdIn{from{opacity:0;transform:translateX(-9px)}to{opacity:1;transform:none}}
        .oi-msg{font-family:'JetBrains Mono',monospace;font-size:11px;color:#475569;line-height:1.55;animation:mgIn 0.3s ease;word-break:break-word}
        @keyframes mgIn{from{opacity:0}to{opacity:1}}
        .oi-idle{display:flex;align-items:center;gap:9px;font-family:'JetBrains Mono',monospace;
          font-size:10.5px;color:#1e3050;letter-spacing:0.06em;padding:7px 0}

        /* CONTROLS */
        .ctrl{display:flex;align-items:center;gap:7px;padding:9px 16px;
          border-top:1px solid rgba(255,255,255,0.05);background:rgba(5,9,24,0.5);flex-wrap:wrap}
        .cb{width:33px;height:32px;border-radius:8px;border:1px solid rgba(255,255,255,0.09);
          background:rgba(255,255,255,0.04);color:#475569;font-size:12px;cursor:pointer;
          display:flex;align-items:center;justify-content:center;transition:all 0.17s}
        .cb:hover:not(:disabled){background:rgba(74,222,128,0.14);color:#4ade80;border-color:rgba(74,222,128,0.35)}
        .cb:disabled{opacity:0.28;cursor:not-allowed}
        .cp{height:32px;padding:0 12px;border-radius:8px;
          background:linear-gradient(135deg,#166534,#4ade80);border:none;color:#fff;
          font-size:12px;cursor:pointer;box-shadow:0 0 16px rgba(74,222,128,0.42);transition:all 0.2s}
        .cp:hover{transform:scale(1.05);box-shadow:0 0 28px rgba(74,222,128,0.62)}
        .cp:disabled{opacity:0.38;cursor:not-allowed;transform:none}
        .cs{width:1px;height:20px;background:rgba(255,255,255,0.07);margin:0 2px}
        .spd{display:flex;gap:3px}
        .sb{padding:4px 8px;border-radius:6px;cursor:pointer;
          font-family:'JetBrains Mono',monospace;font-size:9px;font-weight:700;
          border:1px solid rgba(255,255,255,0.07);background:transparent;color:#2d3748;transition:all 0.14s}
        .sb:hover{color:#64748b}
        .sb.sa{background:rgba(74,222,128,0.14);border-color:rgba(74,222,128,0.35);color:#4ade80}

        /* PROGRESS */
        .pr{display:flex;align-items:center;gap:9px;padding:7px 18px;
          border-top:1px solid rgba(255,255,255,0.04)}
        .pt2{flex:1;height:5px;background:rgba(255,255,255,0.05);border-radius:99px;overflow:hidden}
        .pf{height:100%;border-radius:99px;transition:width 0.42s ease;
          background:linear-gradient(90deg,#166534,#4ade80,#86efac);
          box-shadow:0 0 10px rgba(74,222,128,0.55)}
        .ptx{font-family:'JetBrains Mono',monospace;font-size:10px;color:#1e3050;white-space:nowrap}

        /* DONE BANNER */
        .db{padding:11px 18px;border-top:1px solid rgba(74,222,128,0.2);
          background:rgba(74,222,128,0.06);display:flex;align-items:center;gap:10px;
          animation:dbIn 0.52s cubic-bezier(0.22,1,0.36,1)}
        @keyframes dbIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
        .db-tx{font-family:'JetBrains Mono',monospace;font-size:11.5px;color:#4ade80}
        .db-sp{display:inline-block;animation:spSpin 0.65s ease}
        @keyframes spSpin{0%{transform:scale(0) rotate(-180deg)}60%{transform:scale(1.35) rotate(12deg)}100%{transform:scale(1) rotate(0)}}

        /* STEPS LIST */
        .slh{padding:9px 18px 5px;font-family:'JetBrains Mono',monospace;font-size:8px;color:#1e3050;
          letter-spacing:0.12em;text-transform:uppercase;border-top:1px solid rgba(255,255,255,0.04)}
        .sl{max-height:120px;overflow-y:auto;padding:0 12px 10px;display:flex;flex-direction:column;gap:2px}
        .sl::-webkit-scrollbar{width:3px}
        .sl::-webkit-scrollbar-track{background:transparent}
        .sl::-webkit-scrollbar-thumb{background:#1e3050;border-radius:4px}
        .si{display:flex;align-items:center;gap:7px;padding:4px 9px;border-radius:7px;
          cursor:pointer;font-family:'JetBrains Mono',monospace;font-size:9.5px;color:#1e3050;
          transition:all 0.14s;border:1px solid transparent}
        .si:hover{background:rgba(74,222,128,0.06);color:#475569}
        .sl-active{background:rgba(74,222,128,0.1)!important;border-color:rgba(74,222,128,0.2)!important;color:#4ade80!important}
        .si-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0}
        .si-v{opacity:0.5;margin-left:2px}
        .si-ln{margin-left:auto;font-size:8px;color:#1e3050}

        /* Misc */
        @keyframes fUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      <div className="pg">

        {/* ── HEADER ── */}
        <header className="hd">
          <div className="hd-logo">🌊</div>
          <div>
            <div className="hd-title">Merge Sort Visualizer</div>
            <div className="hd-sub">Write complete code · Run · Watch every divide &amp; merge step execute</div>
          </div>
          <div className="hd-badge" style={{marginLeft:"auto"}}>{lm.name} · Simulation Engine</div>
        </header>

        <main className="main">

          {/* ══ LEFT — CODE EDITOR ══ */}
          <div className="panel">
            <div className="ph">
              <span className="pd" style={{background:"#ff5f57"}}/>
              <span className="pd" style={{background:"#ffbd2e"}}/>
              <span className="pd" style={{background:"#28c840"}}/>
              <span className="pt">Code Editor</span>
              <span style={{marginLeft:"auto",fontFamily:"'JetBrains Mono',monospace",fontSize:9,
                color:lm.accent,background:`${lm.accent}18`,border:`1px solid ${lm.accent}35`,
                padding:"2px 9px",borderRadius:20}}>{lm.name}</span>
            </div>

            {/* Language tabs */}
            <div className="lb">
              {Object.entries(LANGS).map(([k,m]) => (
                <button key={k} className={`lt${lang===k?" la":""}`}
                  onClick={() => changeLang(k)}
                  style={lang===k?{borderColor:`${m.accent}55`,color:m.accent,background:`${m.accent}15`}:{}}>
                  {m.ext}
                </button>
              ))}
            </div>

            {/* Code area */}
            <div className="cw">
              <div className="ln-col">
                {codeLines.map((_,i) => (
                  <div key={i} className={[
                    "ln",
                    activeLine === i ? "aln" : "",
                    errLineSet.has(i) ? "eln" : "",
                  ].join(" ")}>{i+1}</div>
                ))}
              </div>
              {/* Active line overlay */}
              {step && activeLine >= 0 && (
                <div className="al-overlay" style={{top:`${18 + activeLine * 22}px`}}/>
              )}
              {/* Error line overlays */}
              {[...errLineSet].map(i => (
                <div key={`el${i}`} className="err-line-overlay" style={{top:`${18 + i * 22}px`}}/>
              ))}
              <textarea ref={taRef} className="ta"
                value={code}
                onChange={e => { setCode(e.target.value); if(steps.length) doReset(); }}
                onKeyDown={onKeyDown}
                spellCheck={false}
                placeholder="// Write your mergeSort and merge functions here, then call mergeSort([...]) below..."
              />
            </div>

            {/* Active line bar */}
            {step && os && (
              <div className="alb" style={{borderColor:os.bd, background:os.bg}}>
                <span className="alb-icon" style={{color:os.c}}>{os.icon}</span>
                <span className="alb-lnum" style={{color:os.c}}>line {activeLine+1}</span>
                <code className="alb-code">{codeLines[activeLine]?.trim()}</code>
              </div>
            )}

            {/* Validating spinner */}
            {validating && (
              <div className="vld-bar">
                <div className="vld-spinner"/>
                <span className="vld-txt">VisuoSlayer is reviewing your implementation…</span>
              </div>
            )}

            {/* Gemini AI error panel */}
            {hasAiErr && (
              <div className="ai-err">
                <div className="ai-err-head">
                  <span className="ai-err-icon">🤖</span>
                  <span className="ai-err-title">Implementation Error</span>
                  <span className="ai-err-badge">{aiErrors.length} issue{aiErrors.length!==1?"s":""}</span>
                </div>
                {aiReason && <div className="ai-err-reason">{aiReason}</div>}
                <div className="ai-err-list">
                  {aiErrors.map((e,i) => (
                    <div key={i} className="ai-err-row"
                      onClick={() => { const lineH=22; if(taRef.current) taRef.current.scrollTop=Math.max(0,((e.line??1)-4))*lineH; }}>
                      <span className="ai-err-ln">L{e.line??"?"}</span>
                      <div>
                        <div className="ai-err-msg">{e.message}</div>
                        {codeLines[(e.line??1)-1] && (
                          <div className="ai-err-code">{codeLines[(e.line??1)-1].trim()}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Runtime errors */}
            {error && (
              <div className="err">
                <div className="err-t"><span>⚠</span> Error</div>
                <pre style={{whiteSpace:"pre-wrap",fontFamily:"'JetBrains Mono',monospace",fontSize:11.5}}>{error}</pre>
              </div>
            )}

            {/* API quota notice */}
            {apiNote && (
              <div className="api-note">ℹ {apiNote} — visualization ran without AI check.</div>
            )}

            {/* Run row */}
            <div className="rr">
              <button className={`btn-run${playing||validating?" running":""}`}
                onClick={handleRun} disabled={playing||validating}>
                {validating?"🤖 Checking...":playing?"▶ Simulating...":"▶  Run & Visualize"}
              </button>
              {(steps.length>0||error||hasAiErr) && (
                <button className="btn-rst" onClick={doReset}>↺ Reset</button>
              )}
              <span className="rr-hint">CTRL + ENTER</span>
            </div>
          </div>

          {/* ══ RIGHT — VISUALIZATION ══ */}
          <div className="panel">
            <div className="ph">
              <span className="pd" style={{background:"#4ade80"}}/>
              <span className="pd" style={{background:"#60a5fa"}}/>
              <span className="pd" style={{background:"#f472b6"}}/>
              <span className="pt">Merge Sort Visualization</span>
              {steps.length>0 && (
                <span style={{marginLeft:"auto",fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#334155"}}>{steps.length} steps</span>
              )}
            </div>

            <div className="vb">
              <MergeSortViz step={step} animKey={animKey} idle={idle}/>

              {/* Call tree (only when running) */}
              {steps.length>0 && idx>=0 && (
                <CallTreeMini steps={steps} currentIdx={idx}/>
              )}

              {/* Op info badge + message */}
              <div className="oi">
                {step && os ? (
                  <>
                    <div className="oi-badge" style={{color:os.c,background:os.bg,borderColor:os.bd}}>
                      <span>{os.icon}</span>
                      <span>{os.label}</span>
                      {step.type==="compare" && step.left && step.right && (
                        <span style={{opacity:0.65}}>{step.left[step.li]} vs {step.right[step.ri]}</span>
                      )}
                      {(step.type==="pick_left"||step.type==="pick_right") && (
                        <span style={{opacity:0.65}}>→ {step.picked}</span>
                      )}
                      {step.type==="merge_done" && (
                        <span style={{opacity:0.65}}>[{step.result?.join(",")}]</span>
                      )}
                      {step.type==="sorted" && (
                        <span style={{opacity:0.65}}>✓</span>
                      )}
                    </div>
                    <div className="oi-msg">{step.msg}</div>
                  </>
                ) : (
                  <div className="oi-idle">
                    <span>📟</span>
                    <span>
                      {idle
                        ? "Write your mergeSort + merge functions, put your array in the code, then click Run & Visualize"
                        : hasAiErr
                        ? "Fix the implementation errors shown in the editor"
                        : error
                        ? "Fix the error above and run again"
                        : validating
                        ? "AI is reviewing your code…"
                        : "Waiting…"}
                    </span>
                  </div>
                )}
              </div>

              {/* Done banner */}
              {done && (
                <div className="db">
                  <span className="db-sp">🎉</span>
                  <span className="db-tx">
                    All {steps.length} steps visualized! Sorted: [{steps[steps.length-1]?.arr?.join(", ")}]
                  </span>
                </div>
              )}

              {/* Playback controls */}
              {steps.length>0 && (
                <div className="ctrl">
                  <button className="cb" title="First"   onClick={() => goTo(0)}               disabled={idx<=0}>⏮</button>
                  <button className="cb" title="Prev"    onClick={() => goTo(idx-1)}            disabled={idx<=0}>◀</button>
                  <button className="cp"
                    onClick={() => {
                      if(done||idx>=steps.length-1){ setIdx(0); bump(); setDone(false); setPlaying(true); }
                      else { clearInterval(timerRef.current); setPlaying(p=>!p); }
                    }}>
                    {playing?"⏸":done?"↺":"▶"}
                  </button>
                  <button className="cb" title="Next" onClick={() => goTo(idx+1)} disabled={idx>=steps.length-1}>▶</button>
                  <button className="cb" title="Last" onClick={() => goTo(steps.length-1)} disabled={idx>=steps.length-1}>⏭</button>
                  <div className="cs"/>
                  <div className="spd">
                    {[[2,"0.5×"],[1.1,"1×"],[0.55,"2×"],[0.28,"4×"]].map(([s,lbl]) => (
                      <button key={s} className={`sb${speed===s?" sa":""}`} onClick={() => setSpeed(s)}>{lbl}</button>
                    ))}
                  </div>
                  <div className="cs"/>
                  <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#1e3050"}}>
                    {idx+1} / {steps.length}
                  </span>
                </div>
              )}

              {/* Progress bar */}
              {steps.length>0 && (
                <div className="pr">
                  <div className="pt2"><div className="pf" style={{width:`${prog}%`}}/></div>
                  <span className="ptx">{prog}%</span>
                </div>
              )}

              {/* Steps list — click any to jump */}
              {steps.length>0 && (
                <>
                  <div className="slh">STEP LOG — click any step to jump</div>
                  <div className="sl" ref={listRef}>
                    {steps.map((s,i) => {
                      const sm = OP[s.type] ?? OP.compare;
                      const past=i<idx, active=i===idx;
                      return (
                        <div key={i} className={`si${active?" sl-active":""}`} onClick={() => goTo(i)}>
                          <span className="si-dot" style={{
                            background: past?"#4ade80":active?sm.c:"#1e3050",
                            boxShadow: active?`0 0 7px ${sm.c}`:"none",
                          }}/>
                          <span style={{color:active?sm.c:past?"#334155":"#1e3050"}}>
                            {sm.label}
                            {s.type==="compare"&&<span className="si-v"> {s.left?.[s.li]} vs {s.right?.[s.ri]}</span>}
                            {(s.type==="pick_left"||s.type==="pick_right")&&<span className="si-v"> → {s.picked}</span>}
                            {(s.type==="copy_left"||s.type==="copy_right")&&<span className="si-v"> {s.picked}</span>}
                            {s.type==="divide"&&<span className="si-v"> [{s.arr?.slice(0,4).join(",")}{(s.arr?.length??0)>4?"…":""}]</span>}
                            {s.type==="merge_done"&&<span className="si-v"> →[{s.result?.join(",")}]</span>}
                            {s.type==="base_case"&&<span className="si-v"> [{s.arr?.join(",")}]★</span>}
                          </span>
                          <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:7.5,color:"#1e3050",marginLeft:4,opacity:0.7}}>d{s.depth}</span>
                          <span className="si-ln">L{activeLine+1}</span>
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