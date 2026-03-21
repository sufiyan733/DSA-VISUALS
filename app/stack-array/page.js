"use client";
import { useState, useRef, useEffect, useCallback } from "react";

const PALETTE = [
  { g1:"#4facfe", g2:"#00f2fe", glow:"rgba(79,172,254,0.55)",  border:"#4facfe" },
  { g1:"#f093fb", g2:"#f5576c", glow:"rgba(245,87,108,0.55)",  border:"#f5576c" },
  { g1:"#43e97b", g2:"#38f9d7", glow:"rgba(67,233,123,0.55)",  border:"#43e97b" },
  { g1:"#fda085", g2:"#f6d365", glow:"rgba(246,211,101,0.55)", border:"#fda085" },
  { g1:"#a18cd1", g2:"#fbc2eb", glow:"rgba(161,140,209,0.55)", border:"#a18cd1" },
  { g1:"#30cfd0", g2:"#667eea", glow:"rgba(102,126,234,0.55)", border:"#30cfd0" },
  { g1:"#ff9966", g2:"#ff5e62", glow:"rgba(255,94,98,0.55)",   border:"#ff9966" },
  { g1:"#89f7fe", g2:"#66a6ff", glow:"rgba(102,166,255,0.55)", border:"#89f7fe" },
];
const col = (v) => PALETTE[Math.abs(Math.round(v) || 0) % PALETTE.length];

const OP = {
  push:       { label:"push",      icon:"⬇", c:"#4ade80", bg:"rgba(74,222,128,0.08)",  bd:"rgba(74,222,128,0.25)"  },
  pop:        { label:"pop",       icon:"⬆", c:"#f472b6", bg:"rgba(244,114,182,0.08)", bd:"rgba(244,114,182,0.25)" },
  pop_error:  { label:"UNDERFLOW", icon:"⚠", c:"#ef4444", bg:"rgba(239,68,68,0.08)",   bd:"rgba(239,68,68,0.25)"   },
  peek:       { label:"peek",      icon:"👁", c:"#fbbf24", bg:"rgba(251,191,36,0.08)",  bd:"rgba(251,191,36,0.25)"  },
  peek_error: { label:"EMPTY",     icon:"⚠", c:"#ef4444", bg:"rgba(239,68,68,0.08)",   bd:"rgba(239,68,68,0.25)"   },
  isEmpty:    { label:"isEmpty",   icon:"∅", c:"#60a5fa", bg:"rgba(96,165,250,0.08)",  bd:"rgba(96,165,250,0.25)"  },
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

const LINE_H = 21;

const TPL = {
javascript:`// Stack implementation — JavaScript
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

typescript:`// Stack implementation — TypeScript
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

const s = new Stack<number>();
s.push(10);
s.push(25);
s.push(37);
s.peek();
s.pop();
s.push(99);
s.push(42);
s.isEmpty();`,

python:`# Stack implementation — Python
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

s = Stack()
s.push(10)
s.push(25)
s.push(37)
s.peek()
s.pop()
s.push(99)
s.push(42)
s.is_empty()`,

java:`// Stack implementation — Java
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

cpp:`// Stack implementation — C++
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

csharp:`// Stack implementation — C#
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

go:`// Stack implementation — Go
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

rust:`// Stack implementation — Rust
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

// ── parse helpers ──────────────────────────────────────────────────────────
function countBraces(line) {
  let o=0,c=0,inS=false,sc="";
  const ci=line.indexOf("//"),cl=ci>=0?line.slice(0,ci):line;
  for(let i=0;i<cl.length;i++){
    const ch=cl[i];
    if(!inS&&(ch==='"'||ch==="'"||ch==="`")){inS=true;sc=ch;continue;}
    if(inS&&ch===sc&&cl[i-1]!=="\\"){inS=false;continue;}
    if(!inS){if(ch==="{")o++;else if(ch==="}")c++;}
  }
  return{opens:o,closes:c};
}
function extractClassBlock(code,cn){
  const re=new RegExp(`\\bclass\\s+${cn}(?:\\s+[^{]*)?\\{`);
  const m=re.exec(code);if(!m)return null;
  let d=1,i=m.index+m[0].length;
  while(i<code.length&&d>0){if(code[i]==="{")d++;else if(code[i]==="}") d--;i++;}
  return{text:code.slice(m.index,i),start:m.index,end:i};
}

// ── JS execution ──────────────────────────────────────────────────────────
function runJavaScript(code){
  const cm=/\bclass\s+(\w+)/.exec(code);
  if(!cm)return{steps:[],errors:["No class definition found."]};
  const cn=cm[1];
  const fm=/this\.(\w+)\s*=\s*(?:\[\s*\]|new\s+Array\s*\(\s*\))/.exec(code);
  const f=fm?.[1]??"items";
  const cb=extractClassBlock(code,cn);
  if(!cb)return{steps:[],errors:[`Could not parse class '${cn}'.`]};
  const ec=code.slice(0,cb.start)+"\n"+code.slice(cb.end);
  const ins=`"use strict";
const __S=[];
class ${cn}{
  constructor(){this.${f}=[];}
  push(v){this.${f}.push(v);__S.push({type:"push",value:v,stack:[...this.${f}]});}
  pop(){
    if(this.${f}.length===0){__S.push({type:"pop_error",value:null,stack:[]});return undefined;}
    const v=this.${f}.pop();__S.push({type:"pop",value:v,stack:[...this.${f}]});return v;
  }
  peek(){
    if(this.${f}.length===0){__S.push({type:"peek_error",value:null,stack:[]});return undefined;}
    const v=this.${f}[this.${f}.length-1];__S.push({type:"peek",value:v,stack:[...this.${f}]});return v;
  }
  top(){return this.peek();}front(){return this.peek();}
  isEmpty(){const e=this.${f}.length===0;__S.push({type:"isEmpty",result:e,stack:[...this.${f}]});return e;}
  get size(){return this.${f}.length;}get length(){return this.${f}.length;}
  toString(){return "[Stack: "+this.${f}.join(", ")+"]";}
}
${ec}
return __S;`;
  let raw;
  try{const fn=new Function("console",ins);raw=fn({log:()=>{},warn:()=>{},error:()=>{},info:()=>{}});}
  catch(e){return{steps:[],errors:[e.message]};}
  if(!raw?.length)return{steps:[],errors:["No stack operations were executed."]};
  const lines=code.split("\n");
  const cls=[];let cur=0,cel=0;
  for(let i=0;i<lines.length;i++){if(cur>=cb.end){cel=i;break;}cur+=lines[i].length+1;}
  for(let i=cel;i<lines.length;i++){
    const t=lines[i].trim();
    if(t.startsWith("//")||t.startsWith("*")||t.startsWith("/*"))continue;
    if(/\.(push|pop|peek|top|front|isEmpty|is_empty|empty|size)\s*\(/.test(t))cls.push(i);
  }
  return{steps:raw.map((s,ix)=>({
    ...s,lineNum:cls[ix]??cel,
    codeLine:lines[cls[ix]??cel]?.trim()??"",
    message:buildMessage(s),
  })),errors:[]};
}

function parseScoped(code,lang){if(lang==="python")return parsePython(code);return parseBraced(code,lang);}
function parsePython(code){
  const lines=code.split("\n"),ex=[];
  for(let i=0;i<lines.length;i++){
    const l=lines[i],t=l.trim();
    if(!t||t.startsWith("#"))continue;
    const ind=l.match(/^(\s*)/)?.[1]?.length??0;
    if(ind===0&&!t.startsWith("class ")&&!t.startsWith("def ")&&!t.startsWith("import ")&&!t.startsWith("from ")&&!t.startsWith("if __name__"))
      ex.push({lineIdx:i,line:t});
    if(i>0&&lines[i-1].trim().includes("__main__")&&ind===4)ex.push({lineIdx:i,line:t});
  }
  return simulateOps(ex,code.split("\n"),lang);
}
function parseBraced(code,lang){
  const lines=code.split("\n"),ex=[];
  let d=0,inC=false,cd=-1,inM=false,md=-1,ml=false;
  const nm=["java","cpp","csharp","go","rust"];
  for(let i=0;i<lines.length;i++){
    const l=lines[i],t=l.trim();
    if(ml){if(t.includes("*/"))ml=false;continue;}
    if(t.startsWith("/*")){ml=true;continue;}
    if(t.startsWith("//")||t.startsWith("*")||t.startsWith("#")||!t)continue;
    const{opens,closes}=countBraces(l);
    const db=d;d+=opens-closes;
    if(/\bclass\s+\w+/.test(t)){inC=true;cd=db;}
    if(nm.includes(lang)&&(/\bmain\s*\(/.test(t)||/\bfunc\s+main\s*\(/.test(t))){inM=true;md=db;}
    if(inC&&d<=cd){inC=false;cd=-1;}
    if(inM&&d<=md){inM=false;md=-1;}
    const isEx=nm.includes(lang)?(inM&&d===md+1&&!inC):(lang==="javascript"||lang==="typescript")?(d===0&&!inC):true;
    if(isEx)ex.push({lineIdx:i,line:t});
  }
  return simulateOps(ex,lines,lang);
}
function simulateOps(ex,all,lang){
  const steps=[],errors=[],stack=[];
  const PR=[/\.(?:push|Push|append|add|enqueue)\s*\(\s*(-?[\d.]+)\s*\)/,/\bappend\s*\(\s*\w+\s*,\s*(-?[\d.]+)\s*\)/];
  const POR=/\.(?:pop|Pop|pop_back|remove_last|dequeue|poll|delete_last)\s*\(\s*\)/;
  const PKR=/\.(?:peek|Peek|top|Top|last|back|front)\s*\(\s*\)|\.(?:peek|top)\(\)|\.last\(\)/;
  const ER=/\.(?:isEmpty|IsEmpty|is_empty|empty|Empty)\s*\(\s*\)/;
  for(const{lineIdx:li,line}of ex){
    const ol=all[li]?.trim()??line;
    let pv=null;
    for(const re of PR){const m=line.match(re);if(m){pv=parseFloat(m[1]);break;}}
    if(pv!==null&&!isNaN(pv)){
      stack.push(pv);
      steps.push({type:"push",value:pv,stack:[...stack],lineNum:li,codeLine:ol,message:buildMessage({type:"push",value:pv,stack:[...stack]})});
      continue;
    }
    if(POR.test(line)){
      if(stack.length===0)steps.push({type:"pop_error",value:null,stack:[],lineNum:li,codeLine:ol,message:buildMessage({type:"pop_error"})});
      else{const v=stack.pop();steps.push({type:"pop",value:v,stack:[...stack],lineNum:li,codeLine:ol,message:buildMessage({type:"pop",value:v,stack:[...stack]})});}
      continue;
    }
    if(PKR.test(line)){
      if(stack.length===0)steps.push({type:"peek_error",value:null,stack:[],lineNum:li,codeLine:ol,message:buildMessage({type:"peek_error"})});
      else{const v=stack[stack.length-1];steps.push({type:"peek",value:v,stack:[...stack],lineNum:li,codeLine:ol,message:buildMessage({type:"peek",value:v,stack:[...stack]})});}
      continue;
    }
    if(ER.test(line)){
      const e=stack.length===0;
      steps.push({type:"isEmpty",result:e,stack:[...stack],lineNum:li,codeLine:ol,message:buildMessage({type:"isEmpty",result:e,stack:[...stack]})});
      continue;
    }
  }
  if(!steps.length)errors.push("No stack operations detected.\nCall push(N), pop(), peek(), or isEmpty() on your stack instance.");
  return{steps,errors};
}
function buildMessage(s){
  switch(s.type){
    case"push":      return`push(${s.value})  ·  stack: [${s.stack.join(", ")}]  (size: ${s.stack.length})`;
    case"pop":       return`pop()  →  ${s.value}  ·  stack: [${s.stack.join(", ")}]  (size: ${s.stack.length})`;
    case"pop_error": return`pop()  →  ⚠ Stack Underflow — cannot pop from empty stack`;
    case"peek":      return`peek()  →  ${s.value}  ·  stack unchanged  (size: ${s.stack.length})`;
    case"peek_error":return`peek()  →  ⚠ Stack is empty — nothing to peek at`;
    case"isEmpty":   return`isEmpty()  →  ${s.result}  ·  ${s.stack?.length??0} element${s.stack?.length!==1?"s":""}`;
    default:         return"";
  }
}

async function validateWithVisuoSlayer(code,lang){
  const prompt=`You are a strict code reviewer for VisuoSlayer, a Stack data-structure visualizer.
The user wrote a Stack in ${lang}. Check:
1. Is it a correct complete Stack with push and pop?
2. Logic bugs: wrong LIFO, pop not removing from top, peek removing elements, isEmpty wrong?
3. Syntax errors?
Return ONLY valid JSON (no markdown):
{"valid":true|false,"reason":"one sentence","errors":[{"line":<1-based int>,"message":"<issue>"}]}
Code:
\`\`\`${lang}
${code}
\`\`\``;
  try{
    const res=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:[{role:"user",content:prompt}]})});
    const data=await res.json();
    if(data.error)return{valid:true,reason:"",errors:[],apiError:data.error};
    const raw=data.content??"";
    const cleaned=raw.replace(/```json|```/gi,"").trim();
    const parsed=JSON.parse(cleaned);
    return{valid:!!parsed.valid,reason:parsed.reason??"",errors:Array.isArray(parsed.errors)?parsed.errors:[],apiError:null};
  }catch(e){return{valid:true,reason:"",errors:[],apiError:e.message};}
}
function runCode(code,lang){
  if(!code.trim())return{steps:[],errors:["Please write some code first."]};
  if(lang==="javascript"||lang==="typescript")return runJavaScript(code);
  return parseScoped(code,lang);
}

// ── Terminal ───────────────────────────────────────────────────────────────
function Terminal({lines,sessionId,validating}){
  const bodyRef=useRef(null);
  useEffect(()=>{if(bodyRef.current)bodyRef.current.scrollTop=bodyRef.current.scrollHeight;},[lines,validating]);
  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",background:"#07090f",minHeight:0,fontFamily:"'JetBrains Mono',monospace",fontSize:"11.5px"}}>
      <div ref={bodyRef} style={{flex:1,overflowY:"auto",padding:"10px 0 10px",scrollbarWidth:"thin",scrollbarColor:"#151e2e transparent"}}>
        {lines.length===0&&!validating&&(
          <div style={{padding:"3px 18px",display:"flex",alignItems:"center",gap:6}}>
            <span style={{color:"#4ade80",userSelect:"none"}}>$</span>
            <span style={{animation:"cur 1.1s step-end infinite",color:"#1e2a1e",marginLeft:4}}>_</span>
          </div>
        )}
        {lines.map((line,i)=><TermLine key={i} line={line} isLast={i===lines.length-1&&!validating}/>)}
        {validating&&(
          <div style={{padding:"3px 18px",display:"flex",alignItems:"center",gap:9}}>
            <span style={{display:"inline-block",width:11,height:11,borderRadius:"50%",
              border:"1.5px solid rgba(96,165,250,0.18)",borderTopColor:"#60a5fa",
              animation:"spin 0.7s linear infinite",flexShrink:0}}/>
            <span style={{color:"#2d3f5a",fontSize:11}}>VisuoSlayer is reviewing your implementation…</span>
          </div>
        )}
      </div>
    </div>
  );
}

function TermLine({line,isLast}){
  const[vis,setVis]=useState(false);
  useEffect(()=>{const t=setTimeout(()=>setVis(true),15);return()=>clearTimeout(t);},[]);
  if(line.type==="separator")return<div style={{margin:"5px 18px",borderTop:"1px solid rgba(255,255,255,0.04)",opacity:vis?1:0,transition:"opacity 0.12s"}}/>;
  if(line.type==="blank")return<div style={{height:7}}/>;
  if(line.type==="prompt")return(
    <div style={{padding:"2px 18px",display:"flex",alignItems:"center",gap:7,opacity:vis?1:0,transition:"opacity 0.1s"}}>
      <span style={{color:"#4ade80",userSelect:"none",flexShrink:0}}>$</span>
      <span style={{color:"#1e3318"}}>{line.text}</span>
    </div>
  );
  const cm={push:"#4ade80",pop:"#f472b6",peek:"#fbbf24",isEmpty:"#60a5fa",
    pop_error:"#ef4444",peek_error:"#ef4444",error:"#ef4444",stderr:"#ef4444",
    success:"#4ade80",warn:"#fbbf24",info:"#60a5fa",output:"#252f42",stdout:"#5a7090"};
  const pm={error:"✗",stderr:"✗",pop_error:"✗",peek_error:"✗",success:"✓",warn:"⚠",info:"·",
    push:"⬇",pop:"⬆",peek:"👁",isEmpty:"∅",output:"",stdout:""};
  const c=cm[line.type]??"#3a4a62";
  const pfx=pm[line.type]??"";
  return(
    <div style={{padding:"1.5px 18px",display:"flex",alignItems:"flex-start",opacity:vis?1:0,transition:"opacity 0.09s"}}>
      <span style={{color:c,width:20,flexShrink:0,fontSize:10,paddingTop:2}}>{pfx}</span>
      <span style={{color:c,wordBreak:"break-word",lineHeight:1.65,flex:1}}>
        {line.text}
        {isLast&&<span style={{animation:"cur 1.1s step-end infinite",color:"#1e2535"}}> _</span>}
      </span>
      {line.lineNum&&<span style={{marginLeft:10,color:"#141c28",fontSize:9,flexShrink:0,paddingTop:3}}>:{line.lineNum}</span>}
    </div>
  );
}

// ── Code Editor with synced line numbers ───────────────────────────────────
function CodeEditor({code,setCode,step,errorLineSet,onKeyDown,taRef}){
  const lnRef=useRef(null);
  const lines=code.split("\n");

  const syncScroll=useCallback(()=>{
    if(taRef.current&&lnRef.current)lnRef.current.scrollTop=taRef.current.scrollTop;
  },[taRef]);

  useEffect(()=>{
    const ta=taRef.current;
    if(!ta)return;
    ta.addEventListener("scroll",syncScroll,{passive:true});
    return()=>ta.removeEventListener("scroll",syncScroll);
  },[syncScroll]);

  return(
    <div style={{flex:1,display:"flex",minHeight:0,overflow:"hidden",position:"relative"}}>
      {/* Line gutter */}
      <div ref={lnRef} style={{
        width:44,flexShrink:0,
        background:"rgba(4,7,18,0.7)",
        borderRight:"1px solid rgba(255,255,255,0.04)",
        overflowY:"hidden",overflowX:"hidden",
        paddingTop:16,paddingBottom:16,
        display:"flex",flexDirection:"column",
        userSelect:"none",pointerEvents:"none",
        scrollbarWidth:"none",msOverflowStyle:"none",
      }}>
        {lines.map((_,i)=>{
          const isAct=step?.lineNum===i;
          const isErr=errorLineSet.has(i);
          return(
            <div key={i} style={{
              height:LINE_H,flexShrink:0,
              display:"flex",alignItems:"center",justifyContent:"flex-end",
              paddingRight:9,
              fontFamily:"'JetBrains Mono',monospace",fontSize:10.5,lineHeight:1,
              color:isErr?"#ef4444":isAct?"#60a5fa":"#1c2738",
              background:isErr?"rgba(239,68,68,0.07)":isAct?"rgba(96,165,250,0.06)":"transparent",
              borderRadius:3,
              transition:"color 0.12s,background 0.12s",
            }}>{i+1}</div>
          );
        })}
      </div>

      {/* Active line overlay */}
      {step&&(
        <div style={{
          position:"absolute",left:44,right:0,height:LINE_H,
          top:16+step.lineNum*LINE_H,
          background:"rgba(96,165,250,0.04)",
          borderLeft:"2px solid rgba(96,165,250,0.38)",
          pointerEvents:"none",transition:"top 0.18s ease",zIndex:1,
        }}/>
      )}
      {/* Error overlays */}
      {[...errorLineSet].map(i=>(
        <div key={`e${i}`} style={{
          position:"absolute",left:44,right:0,height:LINE_H,
          top:16+i*LINE_H,
          background:"rgba(239,68,68,0.05)",
          borderLeft:"2px solid rgba(239,68,68,0.4)",
          pointerEvents:"none",zIndex:1,
        }}/>
      ))}

      <textarea ref={taRef} style={{
        flex:1,padding:`16px 16px 16px 12px`,
        background:"transparent",border:"none",outline:"none",
        color:"#7ecfff",fontFamily:"'JetBrains Mono',monospace",
        fontSize:11.5,lineHeight:`${LINE_H}px`,
        resize:"none",caretColor:"#60a5fa",tabSize:2,whiteSpace:"pre",
        overflowY:"auto",overflowX:"auto",
        scrollbarWidth:"thin",scrollbarColor:"#151e2e transparent",
        position:"relative",zIndex:2,
      }}
        value={code}
        onChange={e=>setCode(e.target.value)}
        onKeyDown={onKeyDown}
        spellCheck={false}
        placeholder="// Write your Stack implementation here..."
      />
    </div>
  );
}

// ── Stack Viz ──────────────────────────────────────────────────────────────
function StackViz({step,animKey,idle}){
  const[fly,setFly]=useState(null);
  useEffect(()=>{
    if(step?.type==="pop"&&step.value!=null){
      setFly({v:step.value,key:animKey});
      const t=setTimeout(()=>setFly(null),820);return()=>clearTimeout(t);
    }
    if(step?.type!=="pop")setFly(null);
  },[animKey,step?.type]);
  const stack=step?.stack??[];
  const isPush=step?.type==="push",isPeek=step?.type==="peek";
  const isEmpOp=step?.type==="isEmpty";
  const isErr=step?.type==="pop_error"||step?.type==="peek_error";
  const rev=[...stack].reverse();
  return(
    <div className={`sv${isErr?" sv-err":""}`} key={isErr?`e${animKey}`:"sv"}>
      <div className="sv-metrics">
        {[
          {lbl:"SIZE",  val:stack.length,                           c:"#60a5fa"},
          {lbl:"TOP",   val:stack.length?stack[stack.length-1]:"—", c:"#fbbf24"},
          {lbl:"EMPTY", val:stack.length===0?"true":"false",        c:stack.length===0?"#f472b6":"#4ade80"},
          {lbl:"POLICY",val:"LIFO",                                 c:"#a78bfa"},
        ].map(m=>(
          <div className="sv-m" key={m.lbl}>
            <span className="sv-ml">{m.lbl}</span>
            <span className="sv-mv" style={{color:m.c}}>{String(m.val)}</span>
          </div>
        ))}
      </div>
      <div className="sv-col">
        {fly&&(
          <div key={fly.key} className="sv-fly" style={{background:`linear-gradient(135deg,${col(fly.v).g1},${col(fly.v).g2})`,boxShadow:`0 0 34px ${col(fly.v).glow}`}}>
            <span className="sv-fly-v">{fly.v}</span><span className="sv-fly-tag">↑ POP</span>
          </div>
        )}
        <div className="sv-blocks">
          {stack.length===0&&!fly?(
            <div className={`sv-empty${isErr?" sv-empty-err":""}`}>
              <div className="sv-ei">{idle?"📚":isErr?"⚠":"∅"}</div>
              <div className="sv-et">{idle?"Run code to start":isErr?"Stack underflow!":"Stack is empty"}</div>
            </div>
          ):rev.map((v,ri)=>{
            const ix2=stack.length-1-ri,isTop=ix2===stack.length-1;
            const isNew=isTop&&isPush,pk=isTop&&isPeek,ec=isEmpOp;
            const c=col(v);
            return(
              <div key={`${v}-${ix2}-${isNew?animKey:"s"}`}
                className={["sv-block",isNew?"sv-push":"",pk?"sv-peek":"",isTop?"sv-top":"",ec?"sv-ec":""].join(" ")}
                style={{
                  background:`linear-gradient(135deg,${c.g1},${c.g2})`,
                  boxShadow:isTop?`0 0 30px ${c.glow},0 5px 16px rgba(0,0,0,0.48),inset 0 1px 0 rgba(255,255,255,0.2)`:`0 3px 10px rgba(0,0,0,0.4),inset 0 1px 0 rgba(255,255,255,0.1)`,
                  borderColor:isTop?c.border:"rgba(255,255,255,0.07)",
                  width:`${Math.max(155,196-ri*5)}px`,
                }}>
                {pk&&<div className="sv-pr" key={`r1-${animKey}`} style={{borderColor:c.border}}/>}
                {pk&&<div className="sv-pr2" key={`r2-${animKey}`} style={{borderColor:c.border}}/>}
                <span className="sv-bidx">[{ix2}]</span>
                <span className="sv-bval">{v}</span>
                {isTop&&<span className="sv-btag">← TOP</span>}
              </div>
            );
          })}
        </div>
        <div className="sv-plat"><div className="sv-plat-shine"/></div>
        <p className="sv-base">▲ BASE OF STACK</p>
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────
export default function StackDSPage(){
  const[lang,      setLang]      =useState("javascript");
  const[code,      setCode]      =useState(TPL.javascript);
  const[steps,     setSteps]     =useState([]);
  const[idx,       setIdx]       =useState(-1);
  const[error,     setError]     =useState("");
  const[playing,   setPlaying]   =useState(false);
  const[speed,     setSpeed]     =useState(1.1);
  const[animKey,   setAnimKey]   =useState(0);
  const[done,      setDone]      =useState(false);
  const[validating,setValidating]=useState(false);
  const[aiErrors,  setAiErrors]  =useState([]);
  const[termLines, setTermLines] =useState([]);
  const[sessionId]               =useState(()=>Math.random().toString(36).slice(2,8).toUpperCase());

  const timerRef=useRef(null),taRef=useRef(null),listRef=useRef(null);
  const bump=()=>setAnimKey(k=>k+1);

  const doReset=useCallback(()=>{
    clearInterval(timerRef.current);
    setSteps([]);setIdx(-1);setError("");setPlaying(false);setDone(false);setAiErrors([]);setTermLines([]);
  },[]);

  const handleChangeLang=(l)=>{setLang(l);setCode(TPL[l]??"");doReset();};

  const buildTerm=(stps,errs,aiErrs,aiReason)=>{
    const ls=[];
    const ts=new Date().toTimeString().slice(0,8);
    ls.push({type:"output",text:`VisuoSlayer v1.0  ·  ${ts}  ·  pid:${sessionId}`});
    ls.push({type:"separator"});
    if(aiErrs.length>0){
      ls.push({type:"prompt",text:`visualoslayer validate --lang=${lang}`});
      ls.push({type:"blank"});
      if(aiReason)ls.push({type:"stderr",text:aiReason});
      aiErrs.forEach(e=>ls.push({type:"error",text:`  L${e.line??'?'}  ${e.message}`,lineNum:e.line}));
      ls.push({type:"blank"});
      ls.push({type:"error",text:"Process exited with code 1"});
      return ls;
    }
    if(errs.length>0){
      ls.push({type:"prompt",text:`visualoslayer run --lang=${lang}`});
      ls.push({type:"blank"});
      errs.forEach(e=>ls.push({type:"stderr",text:e}));
      ls.push({type:"blank"});
      ls.push({type:"error",text:"Process exited with code 1"});
      return ls;
    }
    if(stps.length>0){
      ls.push({type:"prompt",text:`visualoslayer run --lang=${lang}`});
      ls.push({type:"blank"});
      stps.forEach(s=>{
        const ie=s.type==="pop_error"||s.type==="peek_error";
        let out="";
        switch(s.type){
          case"push":      out=`push(${s.value})  →  [${s.stack.join(", ")}]  size:${s.stack.length}`;break;
          case"pop":       out=`pop()  →  ${s.value}  ·  [${s.stack.join(", ")}]  size:${s.stack.length}`;break;
          case"pop_error": out=`pop()  →  Error: Stack Underflow`;break;
          case"peek":      out=`peek()  →  ${s.value}  ·  unchanged  size:${s.stack.length}`;break;
          case"peek_error":out=`peek()  →  Error: Stack is empty`;break;
          case"isEmpty":   out=`isEmpty()  →  ${s.result}  ·  ${s.stack.length} item${s.stack.length!==1?"s":""}`;break;
        }
        ls.push({type:ie?"error":s.type,text:out,lineNum:s.lineNum+1});
      });
      ls.push({type:"blank"});
      ls.push({type:"success",text:`${stps.length} op${stps.length!==1?"s":""} completed  ·  Process exited with code 0`});
    }
    return ls;
  };

  const handleRun=async()=>{
    doReset();setValidating(true);
    const v=await validateWithVisuoSlayer(code,lang);
    setValidating(false);
    if(!v.valid){
      setAiErrors(v.errors??[]);
      setTermLines(buildTerm([],[],v.errors??[],v.reason??"")); return;
    }
    const{steps:s,errors}=runCode(code,lang);
    if(errors.length){setError(errors.join("\n"));setTermLines(buildTerm([],errors,[],"")); return;}
    setSteps(s);setIdx(0);bump();setPlaying(true);setTermLines(buildTerm(s,[],[],"")); 
  };

  const goTo=useCallback((i)=>{
    clearInterval(timerRef.current);setPlaying(false);setIdx(Math.max(0,Math.min(i,steps.length-1)));bump();
  },[steps.length]);

  useEffect(()=>{
    const h=(e)=>{if((e.ctrlKey||e.metaKey)&&e.key==="Enter"){e.preventDefault();handleRun();}};
    window.addEventListener("keydown",h);return()=>window.removeEventListener("keydown",h);
  },[code,lang]);

  useEffect(()=>{
    if(!playing||!steps.length)return;
    timerRef.current=setInterval(()=>{
      setIdx(p=>{
        if(p>=steps.length-1){clearInterval(timerRef.current);setPlaying(false);setDone(true);return p;}
        bump();return p+1;
      });
    },speed*1000);
    return()=>clearInterval(timerRef.current);
  },[playing,steps,speed]);

  useEffect(()=>{listRef.current?.querySelector(".sl-active")?.scrollIntoView({block:"nearest",behavior:"smooth"});},[idx]);

  const onKeyDown=(e)=>{
    if(e.key!=="Tab")return;e.preventDefault();
    const s=e.target.selectionStart,en=e.target.selectionEnd;
    const nv=code.slice(0,s)+"  "+code.slice(en);setCode(nv);
    requestAnimationFrame(()=>{if(taRef.current){taRef.current.selectionStart=s+2;taRef.current.selectionEnd=s+2;}});
  };

  const step=steps[idx]??null,os=step?(OP[step.type]??OP.push):null;
  const prog=steps.length?Math.round(((idx+1)/steps.length)*100):0;
  const hasAiErrors=aiErrors.length>0;
  const idle=steps.length===0&&!error&&!hasAiErrors;
  const lm=LANGS[lang];
  const errorLineSet=new Set(aiErrors.map(e=>(e.line??1)-1));

  return(
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html,body{height:100%;overflow:hidden}
        body{background:#030612;color:#e2e8f0;font-family:'DM Sans',sans-serif;}

        @keyframes cur{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes blkDrop{0%{transform:translateY(-80px) scale(0.78);opacity:0}58%{transform:translateY(5px) scale(1.04);opacity:1}78%{transform:translateY(-2px) scale(0.98)}100%{transform:none;opacity:1}}
        @keyframes flyAway{0%{transform:translateX(-50%) scale(1) rotate(0);opacity:1}35%{opacity:1}100%{transform:translateX(calc(-50% + 65px)) translateY(-110px) scale(0.55) rotate(20deg);opacity:0}}
        @keyframes pkRing{0%{transform:scale(1);opacity:0.85}100%{transform:scale(1.3);opacity:0}}
        @keyframes pkPulse{0%,100%{filter:brightness(1)}50%{filter:brightness(1.45) saturate(1.35)}}
        @keyframes ecCheck{0%,100%{transform:scale(1)}35%{transform:scale(1.05) translateY(-4px)}68%{transform:scale(0.97) translateY(2px)}}
        @keyframes pShine{0%,100%{left:-100%}55%{left:160%}}
        @keyframes rPulse{0%,100%{box-shadow:0 0 18px rgba(59,130,246,0.35)}50%{box-shadow:0 0 38px rgba(96,165,250,0.65)}}
        @keyframes svSh{0%,100%{transform:none}18%{transform:translateX(-8px)}36%{transform:translateX(8px)}54%{transform:translateX(-5px)}72%{transform:translateX(5px)}}

        .pg{height:100vh;display:flex;flex-direction:column;overflow:hidden;
          background:
            radial-gradient(ellipse 55% 40% at 6% 0%,rgba(59,130,246,0.10) 0%,transparent 58%),
            radial-gradient(ellipse 45% 38% at 94% 100%,rgba(244,114,182,0.08) 0%,transparent 55%),
            #030612}

        /* HEADER */
        .hd{flex-shrink:0;display:flex;align-items:center;gap:11px;padding:9px 26px;
          background:rgba(3,6,18,0.97);backdrop-filter:blur(18px);
          border-bottom:1px solid rgba(255,255,255,0.05)}
        .hd-logo{width:32px;height:32px;border-radius:8px;flex-shrink:0;
          background:linear-gradient(135deg,#1d4ed8,#60a5fa);
          display:flex;align-items:center;justify-content:center;font-size:16px;
          box-shadow:0 0 16px rgba(59,130,246,0.38)}
        .hd-brand{font-family:'Syne',sans-serif;font-size:15px;font-weight:800;letter-spacing:-0.3px;
          background:linear-gradient(90deg,#93c5fd,#60a5fa,#c4b5fd);
          -webkit-background-clip:text;-webkit-text-fill-color:transparent}
        .hd-tagline{font-size:9px;color:#141e2e;font-family:'JetBrains Mono',monospace;margin-top:1px}
        .hd-r{margin-left:auto;display:flex;align-items:center;gap:7px}
        .hd-pill{font-family:'JetBrains Mono',monospace;font-size:8.5px;padding:2px 9px;
          border-radius:20px;letter-spacing:0.06em;white-space:nowrap}
        .hd-pid{font-family:'JetBrains Mono',monospace;font-size:8.5px;color:#141e2e;
          padding:2px 8px;border-radius:20px;border:1px solid rgba(255,255,255,0.04)}

        /* GRID */
        .main{flex:1;display:grid;grid-template-columns:1fr 1fr;gap:11px;
          padding:11px 26px 11px;min-height:0;overflow:hidden}

        /* PANELS */
        .panel{background:rgba(5,9,22,0.88);border:1px solid rgba(255,255,255,0.06);
          border-radius:13px;display:flex;flex-direction:column;overflow:hidden;
          box-shadow:0 18px 44px rgba(0,0,0,0.48);min-height:0}
        .ph{padding:8px 13px;border-bottom:1px solid rgba(255,255,255,0.06);
          background:rgba(8,13,32,0.75);display:flex;align-items:center;gap:6px;flex-shrink:0}
        .dot{width:9px;height:9px;border-radius:50%}
        .ptl{font-family:'JetBrains Mono',monospace;font-size:8.5px;color:#141e2e;
          text-transform:uppercase;letter-spacing:1.4px;margin-left:7px}

        /* LEFT */
        .left{display:flex;flex-direction:column;min-height:0}
        .ed-wrap{flex:0 0 58%;display:flex;flex-direction:column;min-height:0;border-bottom:2px solid rgba(255,255,255,0.04)}
        .tm-wrap{flex:1;display:flex;flex-direction:column;min-height:110px}

        /* LANG TABS */
        .lb{display:flex;gap:2px;flex-wrap:wrap;padding:7px 11px;
          border-bottom:1px solid rgba(255,255,255,0.05);background:rgba(6,10,26,0.7);flex-shrink:0}
        .lt{padding:3px 9px;border-radius:5px;cursor:pointer;
          font-family:'JetBrains Mono',monospace;font-size:8.5px;font-weight:700;
          border:1px solid rgba(255,255,255,0.06);background:transparent;color:#141e2e;
          transition:all 0.13s;letter-spacing:0.04em}
        .lt:hover{color:#2a3a50;border-color:rgba(255,255,255,0.09)}
        .lt.la{border-color:transparent;color:#dde8ff}

        /* ACTIVE LINE BAR */
        .alb{display:flex;align-items:center;gap:7px;padding:4px 13px;
          border-left:2px solid;min-height:26px;border-top:1px solid rgba(255,255,255,0.04);flex-shrink:0}
        .alb-ln{font-family:'JetBrains Mono',monospace;font-size:8.5px;font-weight:700;white-space:nowrap}
        .alb-code{font-family:'JetBrains Mono',monospace;font-size:8.5px;color:#1a2535;
          overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1}

        /* RUN BAR */
        .rr{padding:8px 12px;border-top:1px solid rgba(255,255,255,0.05);
          display:flex;align-items:center;gap:7px;flex-shrink:0;background:rgba(4,7,18,0.5)}
        .btn-run{padding:6px 18px;border-radius:7px;
          background:linear-gradient(135deg,#1d4ed8,#3b82f6,#60a5fa);border:none;color:#fff;
          font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;cursor:pointer;
          transition:all 0.16s;box-shadow:0 0 16px rgba(59,130,246,0.32);letter-spacing:0.04em}
        .btn-run:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 0 28px rgba(96,165,250,0.52)}
        .btn-run.running{animation:rPulse 1s ease-in-out infinite;background:linear-gradient(135deg,#1e3a8a,#1d4ed8)}
        .btn-run:disabled{opacity:0.45;cursor:not-allowed;transform:none}
        .btn-rst{padding:6px 12px;border-radius:7px;background:transparent;
          border:1px solid rgba(255,255,255,0.07);color:#1e2d40;
          font-family:'JetBrains Mono',monospace;font-size:9.5px;cursor:pointer;transition:all 0.14s}
        .btn-rst:hover{color:#f87171;border-color:rgba(248,113,113,0.28)}
        .rr-hint{font-family:'JetBrains Mono',monospace;font-size:7.5px;color:#0d1620;letter-spacing:0.07em}

        /* TERM TITLEBAR */
        .term-bar{display:flex;align-items:center;gap:6px;padding:6px 13px;
          background:rgba(6,9,16,0.9);border-bottom:1px solid rgba(255,255,255,0.04);flex-shrink:0}

        /* RIGHT */
        .vb{flex:1;display:flex;flex-direction:column;min-height:0;overflow:hidden}

        /* STACK VIZ */
        .sv{display:flex;flex-direction:column;flex:1;min-height:0}
        .sv.sv-err{animation:svSh 0.38s ease}
        .sv-metrics{display:flex;border-bottom:1px solid rgba(255,255,255,0.05);background:rgba(4,7,20,0.65);flex-shrink:0}
        .sv-m{flex:1;padding:7px 8px;text-align:center;border-right:1px solid rgba(255,255,255,0.05);display:flex;flex-direction:column;gap:2px}
        .sv-m:last-child{border-right:none}
        .sv-ml{font-family:'JetBrains Mono',monospace;font-size:6px;color:#111925;letter-spacing:0.18em;text-transform:uppercase}
        .sv-mv{font-family:'JetBrains Mono',monospace;font-size:14px;font-weight:700;line-height:1}
        .sv-col{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;
          padding:16px 16px 0;position:relative;overflow:hidden}
        .sv-fly{position:absolute;top:10px;left:50%;transform:translateX(-50%);
          width:175px;height:42px;border-radius:10px;display:flex;align-items:center;justify-content:center;gap:8px;
          z-index:20;pointer-events:none;border:1.5px solid rgba(255,255,255,0.22);
          animation:flyAway 0.78s cubic-bezier(0.22,1,0.36,1) forwards}
        .sv-fly-v{font-family:'JetBrains Mono',monospace;font-size:14px;font-weight:700;color:#fff}
        .sv-fly-tag{font-family:'JetBrains Mono',monospace;font-size:7px;color:rgba(255,255,255,0.6);letter-spacing:0.06em}
        .sv-blocks{display:flex;flex-direction:column;gap:3px;align-items:center;width:100%}
        .sv-block{height:42px;border-radius:10px;border:1.5px solid transparent;
          display:flex;align-items:center;padding:0 11px;gap:7px;position:relative;overflow:hidden;transition:width 0.26s}
        .sv-block::before{content:'';position:absolute;inset:0;
          background:linear-gradient(135deg,rgba(255,255,255,0.15) 0%,transparent 52%);border-radius:inherit;pointer-events:none}
        .sv-push{animation:blkDrop 0.46s cubic-bezier(0.34,1.56,0.64,1) both}
        .sv-pr,.sv-pr2{position:absolute;inset:-4px;border-radius:14px;border:2px solid;
          animation:pkRing 0.72s cubic-bezier(0.22,1,0.36,1) forwards;pointer-events:none}
        .sv-pr2{animation-delay:0.14s}
        .sv-peek{animation:pkPulse 0.55s ease 2 both}
        .sv-top{z-index:2}
        .sv-ec{animation:ecCheck 0.44s ease both}
        .sv-bidx{font-family:'JetBrains Mono',monospace;font-size:7px;color:rgba(255,255,255,0.32);flex-shrink:0}
        .sv-bval{font-family:'JetBrains Mono',monospace;font-size:14px;font-weight:700;color:#fff;flex:1;text-align:center;text-shadow:0 2px 8px rgba(0,0,0,0.28)}
        .sv-btag{font-family:'JetBrains Mono',monospace;font-size:6.5px;color:rgba(255,255,255,0.55);flex-shrink:0;letter-spacing:0.05em}
        .sv-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;
          width:170px;height:72px;border:1px dashed rgba(255,255,255,0.06);border-radius:10px;gap:5px}
        .sv-empty.sv-empty-err{border-color:rgba(239,68,68,0.28);animation:svSh 0.34s ease}
        .sv-ei{font-size:18px;opacity:0.38}
        .sv-et{font-family:'JetBrains Mono',monospace;font-size:8px;color:#111925;letter-spacing:0.07em}
        .sv-plat{margin-top:3px;width:200px;height:7px;border-radius:5px;
          background:linear-gradient(90deg,rgba(96,165,250,0.2),rgba(96,165,250,0.09),rgba(96,165,250,0.2));
          position:relative;overflow:hidden;box-shadow:0 0 14px rgba(96,165,250,0.18)}
        .sv-plat-shine{position:absolute;top:0;left:-100%;width:55%;height:100%;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,0.24),transparent);
          animation:pShine 3.2s ease-in-out infinite}
        .sv-base{font-family:'JetBrains Mono',monospace;font-size:6.5px;color:#111925;
          letter-spacing:0.13em;margin-top:3px;margin-bottom:8px}

        /* OP INFO */
        .oi{padding:8px 14px;border-top:1px solid rgba(255,255,255,0.05);
          background:rgba(4,7,20,0.55);min-height:57px;flex-shrink:0}
        .oi-badge{display:inline-flex;align-items:center;gap:6px;padding:3px 10px;
          border-radius:20px;margin-bottom:4px;font-family:'JetBrains Mono',monospace;
          font-size:9px;font-weight:700;animation:fadeIn 0.2s ease;border:1px solid}
        .oi-msg{font-family:'JetBrains Mono',monospace;font-size:10px;color:"#1e2d40";line-height:1.55;animation:fadeIn 0.22s ease;color:#253550}
        .oi-idle{display:flex;align-items:center;gap:7px;font-family:'JetBrains Mono',monospace;
          font-size:9px;color:#111925;letter-spacing:0.04em;padding:5px 0}

        /* CONTROLS */
        .ctrl{display:flex;align-items:center;gap:4px;padding:6px 12px;
          border-top:1px solid rgba(255,255,255,0.05);background:rgba(3,6,16,0.55);flex-wrap:wrap;flex-shrink:0}
        .cb{width:27px;height:25px;border-radius:6px;border:1px solid rgba(255,255,255,0.06);
          background:rgba(255,255,255,0.03);color:#1e2d40;font-size:10px;cursor:pointer;
          display:flex;align-items:center;justify-content:center;transition:all 0.12s}
        .cb:hover:not(:disabled){background:rgba(96,165,250,0.09);color:#93c5fd;border-color:rgba(96,165,250,0.22)}
        .cb:disabled{opacity:0.2;cursor:not-allowed}
        .cp{height:25px;padding:0 9px;border-radius:6px;
          background:linear-gradient(135deg,#1d4ed8,#60a5fa);border:none;color:#fff;
          font-size:10px;cursor:pointer;box-shadow:0 0 11px rgba(59,130,246,0.32);transition:all 0.14s}
        .cp:hover{transform:scale(1.05);box-shadow:0 0 20px rgba(96,165,250,0.5)}
        .cp:disabled{opacity:0.28;cursor:not-allowed;transform:none}
        .csep{width:1px;height:15px;background:rgba(255,255,255,0.05);margin:0 2px}
        .spd{display:flex;gap:2px}
        .sb{padding:2px 6px;border-radius:4px;cursor:pointer;
          font-family:'JetBrains Mono',monospace;font-size:7.5px;font-weight:700;
          border:1px solid rgba(255,255,255,0.05);background:transparent;color:#111925;transition:all 0.1s}
        .sb:hover{color:#1e2d40}
        .sb.sa{background:rgba(96,165,250,0.09);border-color:rgba(96,165,250,0.22);color:#93c5fd}

        /* PROGRESS */
        .pr{display:flex;align-items:center;gap:7px;padding:5px 14px;
          border-top:1px solid rgba(255,255,255,0.04);flex-shrink:0}
        .pt2{flex:1;height:3px;background:rgba(255,255,255,0.04);border-radius:99px;overflow:hidden}
        .pf{height:100%;border-radius:99px;transition:width 0.36s ease;
          background:linear-gradient(90deg,#1d4ed8,#60a5fa,#93c5fd);
          box-shadow:0 0 6px rgba(96,165,250,0.42)}
        .ptx{font-family:'JetBrains Mono',monospace;font-size:8.5px;color:#111925}

        /* OP LOG */
        .slh{padding:5px 14px 2px;font-family:'JetBrains Mono',monospace;font-size:6.5px;color:#111925;
          letter-spacing:0.17em;text-transform:uppercase;border-top:1px solid rgba(255,255,255,0.04);flex-shrink:0}
        .sl{overflow-y:auto;padding:0 8px 7px;display:flex;flex-direction:column;gap:1px;
          max-height:90px;flex-shrink:0;scrollbar-width:thin;scrollbar-color:#151e2e transparent}
        .si{display:flex;align-items:center;gap:5px;padding:2px 7px;border-radius:4px;
          cursor:pointer;font-family:'JetBrains Mono',monospace;font-size:8px;color:#111925;
          transition:all 0.1s;border:1px solid transparent}
        .si:hover{background:rgba(96,165,250,0.05);color:#1e2d40}
        .sl-active{background:rgba(96,165,250,0.07)!important;border-color:rgba(96,165,250,0.13)!important;color:#93c5fd!important}
        .si-dot{width:5px;height:5px;border-radius:50%;flex-shrink:0}
        .si-v{opacity:0.42;margin-left:1px}
        .si-ln{margin-left:auto;font-size:7px;color:#111925}

        ::-webkit-scrollbar{width:3px;height:3px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:#151e2e;border-radius:3px}
        textarea::-webkit-scrollbar{width:3px}
        .ln-col::-webkit-scrollbar{display:none}
      `}</style>

      <div className="pg">
        {/* HEADER */}
        <header className="hd">
          <div className="hd-logo">📚</div>
          <div>
            <div className="hd-brand">VisuoSlayer</div>
            <div className="hd-tagline">Stack DS Visualizer · Write · Run · Step through every operation</div>
          </div>
          <div className="hd-r">
            <div className="hd-pill" style={{color:lm.accent,background:`${lm.accent}0e`,border:`1px solid ${lm.accent}20`}}>{lm.name}</div>
            <div className="hd-pid">pid:{sessionId}</div>
          </div>
        </header>

        <main className="main">

          {/* LEFT: editor + terminal */}
          <div className="panel left">
            <div className="ph">
              <span className="dot" style={{background:"#ff5f57",boxShadow:"0 0 5px #ff5f5750"}}/>
              <span className="dot" style={{background:"#ffbd2e",boxShadow:"0 0 5px #ffbd2e40"}}/>
              <span className="dot" style={{background:"#28c840",boxShadow:"0 0 5px #28c84040"}}/>
              <span className="ptl">Code Editor</span>
              <span style={{marginLeft:"auto",fontFamily:"'JetBrains Mono',monospace",fontSize:7.5,
                color:lm.accent,background:`${lm.accent}0e`,border:`1px solid ${lm.accent}22`,
                padding:"2px 7px",borderRadius:20}}>{lm.name}</span>
            </div>

            {/* Editor top */}
            <div className="ed-wrap">
              <div className="lb">
                {Object.entries(LANGS).map(([k,m])=>(
                  <button key={k} className={`lt${lang===k?" la":""}`}
                    onClick={()=>handleChangeLang(k)}
                    style={lang===k?{borderColor:`${m.accent}35`,color:m.accent,background:`${m.accent}0e`}:{}}
                  >{m.ext}</button>
                ))}
              </div>

              <CodeEditor
                code={code} setCode={setCode} step={step}
                errorLineSet={errorLineSet} onKeyDown={onKeyDown} taRef={taRef}
              />

              {step&&os&&(
                <div className="alb" style={{borderColor:os.bd,background:os.bg}}>
                  <span style={{color:os.c,fontSize:10}}>{os.icon}</span>
                  <span className="alb-ln" style={{color:os.c}}>L{step.lineNum+1}</span>
                  <code className="alb-code">{step.codeLine}</code>
                </div>
              )}

              <div className="rr">
                <button className={`btn-run${playing||validating?" running":""}`}
                  onClick={handleRun} disabled={playing||validating}>
                  {validating?"⟳ VisuoSlayer…":playing?"▶ Running…":"▶  Run & Visualize"}
                </button>
                {(steps.length>0||error||hasAiErrors)&&(
                  <button className="btn-rst" onClick={doReset}>↺ Reset</button>
                )}
                <span className="rr-hint">CTRL+ENTER</span>
              </div>
            </div>

            {/* Terminal bottom */}
            <div className="tm-wrap">
              <div className="term-bar">
                <span className="dot" style={{background:"#ff5f57"}}/>
                <span className="dot" style={{background:"#ffbd2e"}}/>
                <span className="dot" style={{background:"#28c840"}}/>
                <span style={{marginLeft:7,fontFamily:"'JetBrains Mono',monospace",fontSize:8.5,color:"#1a2535",textTransform:"uppercase",letterSpacing:"1.2px",userSelect:"none"}}>
                  visualoslayer — bash
                </span>
                <span style={{marginLeft:"auto",fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:"#111925"}}>
                  pid:{sessionId}
                </span>
              </div>
              <Terminal lines={termLines} sessionId={sessionId} validating={validating}/>
            </div>
          </div>

          {/* RIGHT: viz + info + controls + log */}
          <div className="panel">
            <div className="ph">
              <span className="dot" style={{background:"#60a5fa",boxShadow:"0 0 5px #60a5fa50"}}/>
              <span className="dot" style={{background:"#f472b6",boxShadow:"0 0 5px #f472b640"}}/>
              <span className="dot" style={{background:"#4ade80",boxShadow:"0 0 5px #4ade8040"}}/>
              <span className="ptl">Stack Visualization</span>
              {steps.length>0&&(
                <span style={{marginLeft:"auto",fontFamily:"'JetBrains Mono',monospace",fontSize:7.5,color:"#141e2e"}}>
                  step {idx+1}/{steps.length}
                </span>
              )}
            </div>

            <div className="vb">
              <StackViz step={step} animKey={animKey} idle={idle}/>

              <div className="oi">
                {step&&os?(
                  <>
                    <div className="oi-badge" style={{color:os.c,background:os.bg,borderColor:os.bd}}>
                      <span>{os.icon}</span><span>{os.label}</span>
                      {step.type==="push"&&<span style={{opacity:0.55}}>({step.value})</span>}
                      {(step.type==="pop"||step.type==="peek")&&step.value!=null&&<span style={{opacity:0.55}}>→ {step.value}</span>}
                      {step.type==="isEmpty"&&<span style={{opacity:0.55}}>→ {String(step.result)}</span>}
                    </div>
                    <div className="oi-msg">{step.message}</div>
                  </>
                ):(
                  <div className="oi-idle">
                    <span>📟</span>
                    <span>{idle?"Write a Stack class, use it below, hit Run":hasAiErrors?"VisuoSlayer found errors — see terminal":error?"Fix errors and run again":validating?"VisuoSlayer reviewing your code…":"Waiting…"}</span>
                  </div>
                )}
              </div>

              {steps.length>0&&(
                <div className="ctrl">
                  <button className="cb" onClick={()=>goTo(0)} disabled={idx<=0}>⏮</button>
                  <button className="cb" onClick={()=>goTo(idx-1)} disabled={idx<=0}>◀</button>
                  <button className="cp"
                    onClick={()=>{
                      if(done||idx>=steps.length-1){setIdx(0);bump();setDone(false);setPlaying(true);}
                      else{clearInterval(timerRef.current);setPlaying(p=>!p);}
                    }}>
                    {playing?"⏸":done?"↺":"▶"}
                  </button>
                  <button className="cb" onClick={()=>goTo(idx+1)} disabled={idx>=steps.length-1}>▶</button>
                  <button className="cb" onClick={()=>goTo(steps.length-1)} disabled={idx>=steps.length-1}>⏭</button>
                  <div className="csep"/>
                  <div className="spd">
                    {[[2,"0.5×"],[1.1,"1×"],[0.55,"2×"]].map(([s,lbl])=>(
                      <button key={s} className={`sb${speed===s?" sa":""}`} onClick={()=>setSpeed(s)}>{lbl}</button>
                    ))}
                  </div>
                  <div className="csep"/>
                  <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:"#111925"}}>
                    {idx+1} / {steps.length}
                  </span>
                </div>
              )}

              {steps.length>0&&(
                <div className="pr">
                  <div className="pt2"><div className="pf" style={{width:`${prog}%`}}/></div>
                  <span className="ptx">{prog}%</span>
                </div>
              )}

              {steps.length>0&&(
                <>
                  <div className="slh">OPERATION LOG — click to jump</div>
                  <div className="sl" ref={listRef}>
                    {steps.map((s,i)=>{
                      const sm=OP[s.type]??OP.push;
                      const past=i<idx,active=i===idx;
                      return(
                        <div key={i} className={`si${active?" sl-active":""}`} onClick={()=>goTo(i)}>
                          <span className="si-dot" style={{
                            background:past?"#4ade80":active?sm.c:"#111925",
                            boxShadow:active?`0 0 5px ${sm.c}`:"none",
                          }}/>
                          <span style={{color:active?sm.c:past?"#1a2535":"#111925"}}>
                            {sm.label}
                            {s.type==="push"&&<span className="si-v">({s.value})</span>}
                            {s.type==="pop"&&s.value!=null&&<span className="si-v"> → {s.value}</span>}
                            {s.type==="peek"&&s.value!=null&&<span className="si-v"> = {s.value}</span>}
                            {s.type==="isEmpty"&&<span className="si-v"> = {String(s.result)}</span>}
                            {(s.type==="pop_error"||s.type==="peek_error")&&<span style={{color:"#ef4444",opacity:0.65}}> ⚠</span>}
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
    </>
  );
}