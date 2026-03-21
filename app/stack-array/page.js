"use client";
import { useState, useRef, useEffect, useCallback } from "react";

// ── Color palette ────────────────────────────────────────────────────────────
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
  push:       { label:"push",      icon:"⬇", c:"#4ade80", bg:"rgba(74,222,128,0.10)",  bd:"rgba(74,222,128,0.35)"  },
  pop:        { label:"pop",       icon:"⬆", c:"#f472b6", bg:"rgba(244,114,182,0.10)", bd:"rgba(244,114,182,0.35)" },
  pop_error:  { label:"UNDERFLOW", icon:"⚠", c:"#ef4444", bg:"rgba(239,68,68,0.10)",   bd:"rgba(239,68,68,0.35)"   },
  peek:       { label:"peek",      icon:"👁", c:"#fbbf24", bg:"rgba(251,191,36,0.10)",  bd:"rgba(251,191,36,0.35)"  },
  peek_error: { label:"EMPTY",     icon:"⚠", c:"#ef4444", bg:"rgba(239,68,68,0.10)",   bd:"rgba(239,68,68,0.35)"   },
  isEmpty:    { label:"isEmpty",   icon:"∅", c:"#60a5fa", bg:"rgba(96,165,250,0.10)",  bd:"rgba(96,165,250,0.35)"  },
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

// ── useIsMobile ──────────────────────────────────────────────────────────────
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

// ── Terminal ─────────────────────────────────────────────────────────────────
function Terminal({lines,sessionId,validating}){
  const bodyRef=useRef(null);
  useEffect(()=>{if(bodyRef.current)bodyRef.current.scrollTop=bodyRef.current.scrollHeight;},[lines,validating]);
  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",background:"#06080f",minHeight:0,fontFamily:"'JetBrains Mono',monospace",fontSize:"11px"}}>
      <div ref={bodyRef} style={{flex:1,overflowY:"auto",padding:"10px 0 10px",scrollbarWidth:"thin",scrollbarColor:"rgba(96,165,250,0.2) transparent"}}>
        {lines.length===0&&!validating&&(
          <div style={{padding:"3px 16px",display:"flex",alignItems:"center",gap:6}}>
            <span style={{color:"#4ade80",userSelect:"none"}}>$</span>
            <span style={{animation:"cur 1.1s step-end infinite",color:"#1a2a1a",marginLeft:4}}>_</span>
          </div>
        )}
        {lines.map((line,i)=><TermLine key={i} line={line} isLast={i===lines.length-1&&!validating}/>)}
        {validating&&(
          <div style={{padding:"3px 16px",display:"flex",alignItems:"center",gap:9}}>
            <span style={{display:"inline-block",width:10,height:10,borderRadius:"50%",
              border:"1.5px solid rgba(96,165,250,0.18)",borderTopColor:"#60a5fa",
              animation:"spin 0.7s linear infinite",flexShrink:0}}/>
            <span style={{color:"#3a5070",fontSize:10}}>VisuoSlayer reviewing…</span>
          </div>
        )}
      </div>
    </div>
  );
}

function TermLine({line,isLast}){
  const[vis,setVis]=useState(false);
  useEffect(()=>{const t=setTimeout(()=>setVis(true),15);return()=>clearTimeout(t);},[]);
  if(line.type==="separator")return<div style={{margin:"5px 16px",borderTop:"1px solid rgba(255,255,255,0.05)",opacity:vis?1:0,transition:"opacity 0.12s"}}/>;
  if(line.type==="blank")return<div style={{height:6}}/>;
  if(line.type==="prompt")return(
    <div style={{padding:"2px 16px",display:"flex",alignItems:"center",gap:7,opacity:vis?1:0,transition:"opacity 0.1s"}}>
      <span style={{color:"#4ade80",userSelect:"none",flexShrink:0}}>$</span>
      <span style={{color:"#3a6090",fontSize:10,wordBreak:"break-all"}}>{line.text}</span>
    </div>
  );
  const cm={
    push:"#4ade80",pop:"#f472b6",peek:"#fbbf24",isEmpty:"#60a5fa",
    pop_error:"#f87171",peek_error:"#f87171",error:"#f87171",stderr:"#f87171",
    success:"#4ade80",warn:"#fbbf24",info:"#60a5fa",output:"#3a4e6a",stdout:"#4a607a"
  };
  const pm={error:"✗",stderr:"✗",pop_error:"✗",peek_error:"✗",success:"✓",warn:"⚠",info:"·",
    push:"⬇",pop:"⬆",peek:"👁",isEmpty:"∅",output:"",stdout:""};
  const c=cm[line.type]??"#3a5070";
  const pfx=pm[line.type]??"";
  return(
    <div style={{padding:"1.5px 16px",display:"flex",alignItems:"flex-start",opacity:vis?1:0,transition:"opacity 0.09s"}}>
      <span style={{color:c,width:18,flexShrink:0,fontSize:9,paddingTop:2}}>{pfx}</span>
      <span style={{color:c,wordBreak:"break-word",lineHeight:1.65,flex:1,fontSize:10}}>
        {line.text}
        {isLast&&<span style={{animation:"cur 1.1s step-end infinite",color:"#1e2535"}}> _</span>}
      </span>
      {line.lineNum&&<span style={{marginLeft:8,color:"#2a3a50",fontSize:8,flexShrink:0,paddingTop:3}}>:{line.lineNum}</span>}
    </div>
  );
}

// ── Code Editor ──────────────────────────────────────────────────────────────
function CodeEditor({code,setCode,step,errorLineSet,onKeyDown,taRef}){
  const lnRef=useRef(null);
  const lines=code.split("\n");
  const syncScroll=useCallback(()=>{
    if(taRef.current&&lnRef.current)lnRef.current.scrollTop=taRef.current.scrollTop;
  },[taRef]);
  useEffect(()=>{
    const ta=taRef.current;if(!ta)return;
    ta.addEventListener("scroll",syncScroll,{passive:true});
    return()=>ta.removeEventListener("scroll",syncScroll);
  },[syncScroll]);

  return(
    <div style={{flex:1,display:"flex",minHeight:0,overflow:"hidden",position:"relative"}}>
      <div ref={lnRef} style={{
        width:38,flexShrink:0,background:"rgba(4,7,18,0.75)",
        borderRight:"1px solid rgba(255,255,255,0.05)",
        overflowY:"hidden",overflowX:"hidden",
        paddingTop:14,paddingBottom:14,
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
              display:"flex",alignItems:"center",justifyContent:"flex-end",paddingRight:7,
              fontFamily:"'JetBrains Mono',monospace",fontSize:9,lineHeight:1,
              color:isErr?"#f87171":isAct?"#60a5fa":"#2a3a54",
              background:isErr?"rgba(248,113,113,0.07)":isAct?"rgba(96,165,250,0.07)":"transparent",
              borderRadius:3,transition:"color 0.15s,background 0.15s",
            }}>{i+1}</div>
          );
        })}
      </div>
      {step&&(
        <div style={{
          position:"absolute",left:38,right:0,height:LINE_H,
          top:14+step.lineNum*LINE_H,
          background:"rgba(96,165,250,0.04)",
          borderLeft:"2px solid rgba(96,165,250,0.4)",
          pointerEvents:"none",transition:"top 0.2s cubic-bezier(0.4,0,0.2,1)",zIndex:1,
        }}/>
      )}
      {[...errorLineSet].map(i=>(
        <div key={`e${i}`} style={{
          position:"absolute",left:38,right:0,height:LINE_H,
          top:14+i*LINE_H,
          background:"rgba(248,113,113,0.05)",
          borderLeft:"2px solid rgba(248,113,113,0.45)",
          pointerEvents:"none",zIndex:1,
        }}/>
      ))}
      <textarea ref={taRef} style={{
        flex:1,padding:`14px 12px 14px 10px`,
        background:"transparent",border:"none",outline:"none",
        color:"#7ecfff",fontFamily:"'JetBrains Mono',monospace",
        fontSize:11,lineHeight:`${LINE_H}px`,
        resize:"none",caretColor:"#60a5fa",tabSize:2,whiteSpace:"pre",
        overflowY:"auto",overflowX:"auto",
        scrollbarWidth:"thin",scrollbarColor:"rgba(96,165,250,0.2) transparent",
        position:"relative",zIndex:2,
        WebkitUserSelect:"text",
        touchAction:"manipulation",
      }}
        value={code}
        onChange={e=>setCode(e.target.value)}
        onKeyDown={onKeyDown}
        spellCheck={false}
        placeholder="// Write your Stack implementation here..."
        autoCorrect="off"
        autoCapitalize="none"
        autoComplete="off"
      />
    </div>
  );
}

// ── Stack Visualizer ─────────────────────────────────────────────────────────
function StackViz({step,animKey,idle,compact}){
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

  const metrics=[
    {lbl:"SIZE",  val:stack.length,                           c:"#60a5fa"},
    {lbl:"TOP",   val:stack.length?stack[stack.length-1]:"—", c:"#fbbf24"},
    {lbl:"EMPTY", val:stack.length===0?"true":"false",        c:stack.length===0?"#f472b6":"#4ade80"},
    {lbl:"POLICY",val:"LIFO",                                 c:"#a78bfa"},
  ];

  const blockW = compact ? 130 : 155;
  const blockH = compact ? 38 : 44;

  return(
    <div className={`sv${isErr?" sv-err":""}`} key={isErr?`e${animKey}`:"sv"}>
      <div className="sv-metrics">
        {metrics.map((m,mi)=>(
          <div className={`sv-m${step&&mi===0?" sv-m-active":""}`} key={m.lbl}>
            <span className="sv-ml">{m.lbl}</span>
            <span className="sv-mv" style={{color:m.c,fontSize:compact?"12px":"15px"}}>{String(m.val)}</span>
          </div>
        ))}
      </div>

      <div className="sv-col">
        <div className="sv-blob sv-blob-1"/>
        <div className="sv-blob sv-blob-2"/>

        {fly&&(
          <div key={fly.key} className="sv-fly"
            style={{
              background:`linear-gradient(135deg,${col(fly.v).g1},${col(fly.v).g2})`,
              boxShadow:`0 0 40px ${col(fly.v).glow},0 0 80px ${col(fly.v).glow}40`,
              width: compact ? "140px" : "180px",
              height: compact ? "36px" : "44px",
            }}>
            <span className="sv-fly-v" style={{fontSize:compact?"12px":"15px"}}>{fly.v}</span>
            <span className="sv-fly-tag">↑ POP</span>
          </div>
        )}

        <div className="sv-blocks">
          {stack.length===0&&!fly?(
            <div className={`sv-empty${isErr?" sv-empty-err":""}`} style={{width:compact?"140px":"175px",height:compact?"60px":"78px"}}>
              <div className="sv-ei" style={{fontSize:compact?"16px":"20px"}}>{idle?"📚":isErr?"⚠":"∅"}</div>
              <div className="sv-et">{idle?"Run code to start":isErr?"Stack underflow!":"Stack is empty"}</div>
            </div>
          ):rev.map((v,ri)=>{
            const ix2=stack.length-1-ri,isTop=ix2===stack.length-1;
            const isNew=isTop&&isPush,pk=isTop&&isPeek,ec=isEmpOp;
            const c=col(v);
            return(
              <div key={`${v}-${ix2}-${isNew?animKey:"s"}`}
                className={["sv-block",isNew?"sv-push":"",pk?"sv-peek":"",isTop?"sv-top":"",ec?"sv-ec":""].filter(Boolean).join(" ")}
                style={{
                  background:`linear-gradient(135deg,${c.g1},${c.g2})`,
                  boxShadow:isTop
                    ?`0 0 36px ${c.glow},0 0 72px ${c.glow}40,0 6px 20px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,255,255,0.25)`
                    :`0 3px 12px rgba(0,0,0,0.45),inset 0 1px 0 rgba(255,255,255,0.12)`,
                  borderColor:isTop?c.border:"rgba(255,255,255,0.08)",
                  width:`${Math.max(blockW,blockW+45-ri*5)}px`,
                  height:`${blockH}px`,
                }}>
                <div className="sv-block-shine"/>
                {pk&&<div className="sv-pr" key={`r1-${animKey}`} style={{borderColor:c.border}}/>}
                {pk&&<div className="sv-pr2" key={`r2-${animKey}`} style={{borderColor:c.border}}/>}
                <span className="sv-bidx">[{ix2}]</span>
                <span className="sv-bval" style={{fontSize:compact?"12px":"15px"}}>{v}</span>
                {isTop&&<span className="sv-btag">← TOP</span>}
              </div>
            );
          })}
        </div>

        <div className="sv-plat" style={{width:compact?"170px":"210px"}}><div className="sv-plat-shine"/></div>
        <p className="sv-base">▲ BASE OF STACK</p>
      </div>
    </div>
  );
}

// ── Mobile Tab Bar ────────────────────────────────────────────────────────────
function MobileTabBar({activeTab, setActiveTab, hasSteps, hasErrors, hasAiErrors, termLines}) {
  const tabs = [
    { id: "code", label: "Code", icon: "⌨" },
    { id: "viz",  label: "Stack", icon: "📚" },
    { id: "log",  label: "Terminal", icon: "⬛" },
  ];
  const hasTermErrors = termLines.some(l=>l.type==="error"||l.type==="stderr");
  const hasTermOk = termLines.some(l=>l.type==="success");

  return (
    <div style={{
      display:"flex",
      background:"rgba(3,5,16,0.98)",
      borderTop:"1px solid rgba(96,165,250,0.18)",
      backdropFilter:"blur(24px)",
      boxShadow:"0 -4px 24px rgba(0,0,0,0.6), 0 -1px 0 rgba(96,165,250,0.08)",
      paddingBottom:"env(safe-area-inset-bottom, 8px)",
      flexShrink:0,
    }}>
      {tabs.map(t=>{
        const isActive = activeTab === t.id;
        let badge = null;
        if(t.id==="log" && hasTermErrors) badge = <span style={{position:"absolute",top:6,right:"calc(50% - 16px)",width:6,height:6,borderRadius:"50%",background:"#f87171",boxShadow:"0 0 6px #f87171"}}/>;
        if(t.id==="log" && !hasTermErrors && hasTermOk) badge = <span style={{position:"absolute",top:6,right:"calc(50% - 16px)",width:6,height:6,borderRadius:"50%",background:"#4ade80",boxShadow:"0 0 6px #4ade80"}}/>;
        if(t.id==="viz" && hasSteps) badge = <span style={{position:"absolute",top:6,right:"calc(50% - 16px)",width:6,height:6,borderRadius:"50%",background:"#60a5fa",boxShadow:"0 0 6px #60a5fa"}}/>;
        return (
          <button key={t.id} onClick={()=>setActiveTab(t.id)} style={{
            flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
            gap:4,padding:"11px 4px 8px",border:"none",background:"transparent",cursor:"pointer",
            position:"relative",
            borderTop: isActive ? "2px solid #60a5fa" : "2px solid transparent",
            transition:"all 0.15s",
            WebkitTapHighlightColor:"transparent",
          }}>
            {badge}
            <span style={{fontSize:18,opacity:isActive?1:0.35,transition:"opacity 0.15s",lineHeight:1}}>{t.icon}</span>
            <span style={{
              fontFamily:"'JetBrains Mono',monospace",fontSize:8.5,fontWeight:700,
              letterSpacing:"0.06em",textTransform:"uppercase",
              color:isActive?"#60a5fa":"rgba(255,255,255,0.25)",
              transition:"color 0.15s",
            }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function StackDSPage(){
  const[lang,       setLang]      =useState("javascript");
  const[code,       setCode]      =useState(TPL.javascript);
  const[steps,      setSteps]     =useState([]);
  const[idx,        setIdx]       =useState(-1);
  const[error,      setError]     =useState("");
  const[playing,    setPlaying]   =useState(false);
  const[speed,      setSpeed]     =useState(1.1);
  const[animKey,    setAnimKey]   =useState(0);
  const[done,       setDone]      =useState(false);
  const[validating, setValidating]=useState(false);
  const[aiErrors,   setAiErrors]  =useState([]);
  const[termLines,  setTermLines] =useState([]);
  const[sessionId]                =useState(()=>Math.random().toString(36).slice(2,8).toUpperCase());
  const[toast,      setToast]     =useState(null);
  const[termOpen,   setTermOpen]  =useState(true);
  const[mobileTab,  setMobileTab] =useState("code");

  const isMobile = useIsMobile();

  const timerRef=useRef(null),taRef=useRef(null),listRef=useRef(null);
  const bump=()=>setAnimKey(k=>k+1);

  const showToast=(msg)=>{setToast(msg);setTimeout(()=>setToast(null),2200);};

  const copyStackState=()=>{
    const step=steps[idx]??null;
    if(!step)return;
    const txt=step.stack.length?`[${step.stack.join(", ")}]  TOP: ${step.stack[step.stack.length-1]}`:"[] (empty)";
    navigator.clipboard?.writeText(txt).then(()=>showToast("📋 Copied: "+txt)).catch(()=>showToast("📋 "+txt));
  };

  const doReset=useCallback(()=>{
    clearInterval(timerRef.current);
    setSteps([]);setIdx(-1);setError("");setPlaying(false);setDone(false);setAiErrors([]);setTermLines([]);
  },[]);

  const handleChangeLang=(l)=>{setLang(l);setCode(TPL[l]??"");doReset();};

  const buildTerm=(stps,errs,aiErrs,aiReason)=>{
    const ls=[];
    const ts=new Date().toTimeString().slice(0,8);
    ls.push({type:"output",text:`VisuoSlayer v2.0  ·  ${ts}  ·  pid:${sessionId}`});
    ls.push({type:"separator"});
    if(aiErrs.length>0){
      ls.push({type:"prompt",text:`validate --lang=${lang} --ds=stack`});
      ls.push({type:"blank"});
      if(aiReason)ls.push({type:"stderr",text:aiReason});
      aiErrs.forEach(e=>ls.push({type:"error",text:`  L${e.line??'?'}  ${e.message}`,lineNum:e.line}));
      ls.push({type:"blank"});
      ls.push({type:"error",text:"Process exited with code 1"});
      return ls;
    }
    if(errs.length>0){
      ls.push({type:"prompt",text:`run --lang=${lang}`});
      ls.push({type:"blank"});
      errs.forEach(e=>ls.push({type:"stderr",text:e}));
      ls.push({type:"blank"});
      ls.push({type:"error",text:"Process exited with code 1"});
      return ls;
    }
    if(stps.length>0){
      ls.push({type:"prompt",text:`run --lang=${lang} --ds=stack`});
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
      ls.push({type:"success",text:`${stps.length} op${stps.length!==1?"s":""} completed  ·  exit code 0`});
    }
    return ls;
  };

  const handleRun=async()=>{
    doReset();setValidating(true);
    if(isMobile) setMobileTab("viz");
    const v=await validateWithVisuoSlayer(code,lang);
    setValidating(false);
    if(!v.valid){
      setAiErrors(v.errors??[]);
      setTermLines(buildTerm([],[],v.errors??[],v.reason??""));
      if(isMobile) setMobileTab("log");
      return;
    }
    const{steps:s,errors}=runCode(code,lang);
    if(errors.length){setError(errors.join("\n"));setTermLines(buildTerm([],errors,[],"")); if(isMobile) setMobileTab("log"); return;}
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

  const step=steps[idx]??null;
  const os=step?(OP[step.type]??OP.push):null;
  const prog=steps.length?Math.round(((idx+1)/steps.length)*100):0;
  const hasAiErrors=aiErrors.length>0;
  const idle=steps.length===0&&!error&&!hasAiErrors;
  const lm=LANGS[lang];
  const errorLineSet=new Set(aiErrors.map(e=>(e.line??1)-1));

  // ── MOBILE LAYOUT ──────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Space+Grotesk:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
          *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
          html,body{height:100%;overflow:hidden;-webkit-text-size-adjust:100%;}
          body{background:#050818;color:#c8d8f0;font-family:'DM Sans',sans-serif;}

          :root{
            --cyan:#60a5fa; --cyan-dim:rgba(96,165,250,0.15); --cyan-glow:rgba(96,165,250,0.45);
            --pink:#f472b6; --pink-dim:rgba(244,114,182,0.15);
            --green:#4ade80; --green-dim:rgba(74,222,128,0.15); --green-glow:rgba(74,222,128,0.4);
            --purple:#a78bfa; --yellow:#fbbf24;
            --text-primary:#d4e4f7; --text-secondary:#6b8aaa; --text-muted:#3d5470;
            --border-subtle:rgba(255,255,255,0.07); --border-medium:rgba(255,255,255,0.13);
            --surface-0:#050818; --surface-1:rgba(8,14,36,0.95); --surface-2:rgba(12,20,48,0.8);
            --surface-3:rgba(16,26,58,0.7);
          }

          @keyframes cur{0%,100%{opacity:1}50%{opacity:0}}
          @keyframes spin{to{transform:rotate(360deg)}}
          @keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
          @keyframes fadeIn{from{opacity:0}to{opacity:1}}
          @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
          @keyframes rPulse{0%,100%{box-shadow:0 0 16px rgba(96,165,250,0.4)}50%{box-shadow:0 0 32px rgba(96,165,250,0.7)}}
          @keyframes stepPop{0%{transform:scale(0.88);opacity:0}60%{transform:scale(1.04)}100%{transform:scale(1);opacity:1}}
          @keyframes metricPop{0%{transform:scale(1)}50%{transform:scale(1.1)}100%{transform:scale(1)}}
          @keyframes toastIn{0%{opacity:0;transform:translateY(8px) scale(0.94)}100%{opacity:1;transform:none}}
          @keyframes blkDrop{0%{transform:translateY(-60px) scale(0.78);opacity:0;filter:blur(3px)}55%{transform:translateY(4px) scale(1.05);opacity:1;filter:blur(0)}75%{transform:translateY(-2px) scale(0.98)}100%{transform:none;opacity:1}}
          @keyframes flyAway{0%{transform:translateX(-50%) scale(1) rotate(0);opacity:1}35%{opacity:1}100%{transform:translateX(calc(-50% + 55px)) translateY(-100px) scale(0.5) rotate(22deg);opacity:0}}
          @keyframes pkRing{0%{transform:scale(1);opacity:0.9}100%{transform:scale(1.35);opacity:0}}
          @keyframes pkPulse{0%,100%{filter:brightness(1)}50%{filter:brightness(1.55) saturate(1.4)}}
          @keyframes ecCheck{0%,100%{transform:scale(1)}35%{transform:scale(1.06) translateY(-4px)}68%{transform:scale(0.97) translateY(2px)}}
          @keyframes pShine{0%,100%{left:-100%}55%{left:160%}}
          @keyframes svSh{0%,100%{transform:none}18%{transform:translateX(-7px)}36%{transform:translateX(7px)}54%{transform:translateX(-4px)}72%{transform:translateX(4px)}}
          @keyframes blobFloat{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(18px,-12px) scale(1.06)}66%{transform:translate(-10px,16px) scale(0.95)}}
          @keyframes blob2{0%,100%{transform:translate(0,0) scale(1)}40%{transform:translate(-20px,10px) scale(1.08)}70%{transform:translate(14px,-18px) scale(0.93)}}
          @keyframes gridScroll{0%{background-position:0 0}100%{background-position:32px 32px}}
          @keyframes slideInUp{from{transform:translateY(100%);opacity:0}to{transform:none;opacity:1}}
          @keyframes scanline{0%{top:-10%}100%{top:110%}}

          /* Mobile page */
          .mob-pg{height:100vh;height:100dvh;display:flex;flex-direction:column;overflow:hidden;
            background:radial-gradient(ellipse 80% 50% at 50% 0%,rgba(59,130,246,0.12) 0%,transparent 60%),#050818;
            padding-top:env(safe-area-inset-top,0);}

          /* Mobile header */
          .mob-hd{flex-shrink:0;display:flex;align-items:center;gap:10px;padding:10px 16px;
            background:rgba(5,8,22,0.98);backdrop-filter:blur(20px);
            border-bottom:1px solid rgba(96,165,250,0.12);}
          .mob-logo{width:30px;height:30px;border-radius:8px;flex-shrink:0;
            background:linear-gradient(135deg,#1d4ed8,#3b82f6 50%,#a78bfa);
            display:flex;align-items:center;justify-content:center;font-size:14px;
            box-shadow:0 0 16px rgba(96,165,250,0.5);animation:rPulse 3s ease-in-out infinite;}
          .mob-brand{font-family:'Space Grotesk',sans-serif;font-size:14px;font-weight:800;
            background:linear-gradient(90deg,#93c5fd 0%,#a78bfa 50%,#f472b6 100%);
            background-size:200% auto;
            -webkit-background-clip:text;-webkit-text-fill-color:transparent;
            animation:shimmer 4s linear infinite;}
          .mob-sub{font-size:9px;color:var(--text-muted);font-family:'JetBrains Mono',monospace;margin-top:1px;}

          /* Content area */
          .mob-content{flex:1;min-height:0;overflow:hidden;display:flex;flex-direction:column;}
          .mob-pane{flex:1;min-height:0;overflow:hidden;display:flex;flex-direction:column;animation:slideInUp 0.22s ease;}

          /* Panel chrome */
          .mob-ph{padding:8px 14px;border-bottom:1px solid var(--border-subtle);
            background:rgba(8,14,38,0.9);display:flex;align-items:center;gap:7px;flex-shrink:0;}
          .dot{width:8px;height:8px;border-radius:50%;}
          .ptl{font-family:'JetBrains Mono',monospace;font-size:7.5px;color:var(--text-muted);
            text-transform:uppercase;letter-spacing:1.5px;margin-left:6px;font-weight:600;}

          /* Lang chips — horizontal scroll */
          .mob-lb{display:flex;gap:4px;padding:8px 12px;overflow-x:auto;
            border-bottom:1px solid var(--border-subtle);background:rgba(6,11,30,0.8);
            flex-shrink:0;scrollbar-width:none;-ms-overflow-style:none;
            -webkit-overflow-scrolling:touch;}
          .mob-lb::-webkit-scrollbar{display:none;}
          .mob-lt{padding:5px 12px;border-radius:6px;cursor:pointer;white-space:nowrap;
            font-family:'JetBrains Mono',monospace;font-size:9px;font-weight:700;
            border:1px solid var(--border-subtle);background:transparent;
            color:var(--text-muted);transition:all 0.15s;flex-shrink:0;}
          .mob-lt.la{color:#e8f4ff;background:rgba(255,255,255,0.06);}

          /* Run bar — always pinned at bottom of code pane */
          .mob-rr{padding:10px 12px 14px;border-top:1px solid rgba(96,165,250,0.18);
            display:flex;align-items:center;gap:8px;flex-shrink:0;
            background:rgba(4,8,22,0.96);backdrop-filter:blur(16px);
            box-shadow:0 -8px 32px rgba(0,0,0,0.5),0 -1px 0 rgba(96,165,250,0.08);}
          .mob-btn-run{flex:1;padding:12px 16px;border-radius:12px;
            background:linear-gradient(135deg,#1d4ed8,#3b82f6,#60a5fa);
            border:1px solid rgba(96,165,250,0.4);color:#fff;
            font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:700;cursor:pointer;
            transition:all 0.18s;box-shadow:0 0 24px rgba(96,165,250,0.35),0 4px 12px rgba(0,0,0,0.4);
            -webkit-tap-highlight-color:transparent;letter-spacing:0.03em;}
          .mob-btn-run:active{transform:scale(0.97);box-shadow:0 0 12px rgba(96,165,250,0.2);}
          .mob-btn-run.running{animation:rPulse 1.2s ease-in-out infinite;}
          .mob-btn-run:disabled{opacity:0.4;cursor:not-allowed;}
          .mob-btn-rst{padding:12px 14px;border-radius:12px;background:transparent;
            border:1px solid rgba(248,113,113,0.3);color:#f87171;
            font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:600;cursor:pointer;
            transition:all 0.16s;-webkit-tap-highlight-color:transparent;white-space:nowrap;}
          .mob-btn-rst:active{background:rgba(248,113,113,0.12);}

          /* Active line bar */
          .mob-alb{display:flex;align-items:center;gap:7px;padding:6px 14px;
            border-left:2px solid;min-height:30px;border-top:1px solid var(--border-subtle);
            flex-shrink:0;animation:fadeIn 0.18s ease;}
          .mob-alb-ln{font-family:'JetBrains Mono',monospace;font-size:9px;font-weight:700;white-space:nowrap;}
          .mob-alb-code{font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--text-secondary);
            overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;}

          /* Viz panel */
          .sv{display:flex;flex-direction:column;flex:1;min-height:0;position:relative;}
          .sv.sv-err{animation:svSh 0.4s ease;}
          .sv-metrics{display:flex;border-bottom:1px solid var(--border-subtle);background:rgba(4,8,26,0.75);flex-shrink:0;}
          .sv-m{flex:1;padding:6px 4px;text-align:center;border-right:1px solid var(--border-subtle);
            display:flex;flex-direction:column;gap:2px;transition:background 0.2s;}
          .sv-m:last-child{border-right:none;}
          .sv-m.sv-m-active{background:rgba(96,165,250,0.05);animation:metricPop 0.3s ease;}
          .sv-ml{font-family:'JetBrains Mono',monospace;font-size:6px;color:var(--text-muted);letter-spacing:0.15em;text-transform:uppercase;font-weight:600;}
          .sv-mv{font-family:'JetBrains Mono',monospace;font-weight:700;line-height:1.1;transition:color 0.3s;}
          .sv-col{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;
            padding:12px 12px 0;position:relative;overflow:hidden;}
          .sv-col::before{content:'';position:absolute;inset:0;pointer-events:none;
            background-image:linear-gradient(rgba(96,165,250,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(96,165,250,0.04) 1px,transparent 1px);
            background-size:32px 32px;animation:gridScroll 10s linear infinite;}
          .sv-col::after{content:'';position:absolute;left:0;right:0;height:60px;pointer-events:none;z-index:0;
            background:linear-gradient(to bottom,transparent,rgba(96,165,250,0.02),transparent);
            animation:scanline 7s ease-in-out infinite;}
          .sv-blob{position:absolute;border-radius:50%;pointer-events:none;filter:blur(55px);mix-blend-mode:screen;}
          .sv-blob-1{width:160px;height:160px;top:-20px;left:-10px;background:radial-gradient(circle,rgba(59,130,246,0.14),transparent 65%);animation:blobFloat 13s ease-in-out infinite;}
          .sv-blob-2{width:130px;height:130px;bottom:15px;right:-5px;background:radial-gradient(circle,rgba(244,114,182,0.10),transparent 65%);animation:blob2 10s ease-in-out infinite;}
          .sv-fly{position:absolute;top:10px;left:50%;transform:translateX(-50%);
            border-radius:10px;display:flex;align-items:center;justify-content:center;gap:7px;
            z-index:20;pointer-events:none;border:1.5px solid rgba(255,255,255,0.25);
            animation:flyAway 0.82s cubic-bezier(0.22,1,0.36,1) forwards;}
          .sv-fly-v{font-family:'JetBrains Mono',monospace;font-weight:700;color:#fff;}
          .sv-fly-tag{font-family:'JetBrains Mono',monospace;font-size:7px;color:rgba(255,255,255,0.65);letter-spacing:0.06em;}
          .sv-blocks{display:flex;flex-direction:column;gap:3px;align-items:center;width:100%;position:relative;z-index:2;}
          .sv-block{border-radius:10px;border:1.5px solid transparent;display:flex;align-items:center;padding:0 10px;gap:7px;position:relative;overflow:hidden;transition:width 0.28s,box-shadow 0.28s;cursor:default;}
          .sv-block-shine{position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,0.18) 0%,transparent 52%);border-radius:inherit;pointer-events:none;}
          .sv-push{animation:blkDrop 0.5s cubic-bezier(0.34,1.56,0.64,1) both;}
          .sv-pr,.sv-pr2{position:absolute;inset:-4px;border-radius:14px;border:2px solid;animation:pkRing 0.75s cubic-bezier(0.22,1,0.36,1) forwards;pointer-events:none;}
          .sv-pr2{animation-delay:0.15s;}
          .sv-peek{animation:pkPulse 0.6s ease 2 both;}
          .sv-top{z-index:2;}
          .sv-ec{animation:ecCheck 0.46s ease both;}
          .sv-bidx{font-family:'JetBrains Mono',monospace;font-size:7px;color:rgba(255,255,255,0.35);flex-shrink:0;font-weight:600;}
          .sv-bval{font-family:'JetBrains Mono',monospace;font-weight:700;color:#fff;flex:1;text-align:center;text-shadow:0 2px 10px rgba(0,0,0,0.35);}
          .sv-btag{font-family:'JetBrains Mono',monospace;font-size:7px;color:rgba(255,255,255,0.6);flex-shrink:0;letter-spacing:0.06em;}
          .sv-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;border:1px dashed rgba(255,255,255,0.08);border-radius:10px;gap:5px;background:rgba(255,255,255,0.015);z-index:2;position:relative;}
          .sv-empty.sv-empty-err{border-color:rgba(248,113,113,0.3);animation:svSh 0.36s ease;background:rgba(248,113,113,0.03);}
          .sv-ei{opacity:0.4;}
          .sv-et{font-family:'JetBrains Mono',monospace;font-size:8px;color:var(--text-muted);letter-spacing:0.08em;}
          .sv-plat{margin-top:3px;height:6px;border-radius:4px;
            background:linear-gradient(90deg,rgba(96,165,250,0.22),rgba(96,165,250,0.1),rgba(96,165,250,0.22));
            position:relative;overflow:hidden;box-shadow:0 0 12px rgba(96,165,250,0.22);}
          .sv-plat-shine{position:absolute;top:0;left:-100%;width:55%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent);animation:pShine 3.5s ease-in-out infinite;}
          .sv-base{font-family:'JetBrains Mono',monospace;font-size:7px;color:var(--text-muted);letter-spacing:0.12em;margin-top:4px;margin-bottom:6px;}

          /* Op info */
          .mob-oi{padding:8px 14px;border-top:1px solid var(--border-subtle);background:rgba(4,8,24,0.6);min-height:50px;flex-shrink:0;}
          .mob-oi-badge{display:inline-flex;align-items:center;gap:6px;padding:3px 10px;border-radius:16px;margin-bottom:4px;font-family:'JetBrains Mono',monospace;font-size:9px;font-weight:700;animation:stepPop 0.22s ease;border:1px solid;letter-spacing:0.04em;}
          .mob-oi-msg{font-family:'JetBrains Mono',monospace;font-size:9px;line-height:1.6;animation:fadeUp 0.2s ease;color:var(--text-secondary);word-break:break-word;}

          /* Controls */
          .mob-ctrl{display:flex;align-items:center;gap:4px;padding:8px 12px;
            border-top:1px solid var(--border-subtle);background:rgba(3,6,18,0.7);flex-shrink:0;}
          .mob-cb{width:34px;height:34px;border-radius:8px;border:1px solid var(--border-medium);
            background:var(--surface-3);color:var(--text-secondary);font-size:12px;cursor:pointer;
            display:flex;align-items:center;justify-content:center;transition:all 0.14s;
            -webkit-tap-highlight-color:transparent;flex-shrink:0;}
          .mob-cb:active:not(:disabled){transform:scale(0.9);background:var(--cyan-dim);}
          .mob-cb:disabled{opacity:0.22;cursor:not-allowed;}
          .mob-cp{height:34px;padding:0 14px;border-radius:8px;
            background:linear-gradient(135deg,#1d4ed8,#3b82f6,#60a5fa);
            border:1px solid rgba(96,165,250,0.35);color:#fff;font-size:12px;font-weight:700;
            cursor:pointer;box-shadow:0 0 16px rgba(96,165,250,0.35);
            -webkit-tap-highlight-color:transparent;flex-shrink:0;}
          .mob-cp:active{transform:scale(0.95);}
          .mob-cp:disabled{opacity:0.25;cursor:not-allowed;}
          .mob-csep{width:1px;height:14px;background:var(--border-subtle);margin:0 2px;flex-shrink:0;}
          .mob-spd{display:flex;gap:2px;}
          .mob-sb{padding:4px 7px;border-radius:5px;cursor:pointer;
            font-family:'JetBrains Mono',monospace;font-size:8px;font-weight:700;
            border:1px solid var(--border-subtle);background:transparent;
            color:var(--text-muted);-webkit-tap-highlight-color:transparent;}
          .mob-sb.sa{background:var(--cyan-dim);border-color:rgba(96,165,250,0.4);color:var(--cyan);}

          /* Progress */
          .mob-pr{display:flex;align-items:center;gap:7px;padding:5px 14px;border-top:1px solid var(--border-subtle);flex-shrink:0;}
          .mob-pt2{flex:1;height:4px;background:rgba(255,255,255,0.05);border-radius:99px;overflow:hidden;}
          .mob-pf{height:100%;border-radius:99px;transition:width 0.4s cubic-bezier(0.4,0,0.2,1);
            background:linear-gradient(90deg,#1d4ed8,#60a5fa,#a78bfa);box-shadow:0 0 8px rgba(96,165,250,0.5);}
          .mob-ptx{font-family:'JetBrains Mono',monospace;font-size:8px;color:var(--text-secondary);min-width:28px;text-align:right;}

          /* Op log */
          .mob-slh{padding:5px 14px 3px;font-family:'JetBrains Mono',monospace;font-size:7px;
            color:var(--text-muted);letter-spacing:0.18em;text-transform:uppercase;font-weight:600;
            border-top:1px solid var(--border-subtle);flex-shrink:0;
            display:flex;align-items:center;justify-content:space-between;}
          .mob-sl{overflow-y:auto;padding:3px 8px 6px;display:flex;flex-direction:column;gap:1.5px;
            max-height:80px;flex-shrink:0;scrollbar-width:thin;scrollbar-color:rgba(96,165,250,0.2) transparent;}
          .mob-si{display:flex;align-items:center;gap:6px;padding:4px 8px;border-radius:5px;cursor:pointer;
            font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--text-muted);transition:all 0.12s;
            border:1px solid transparent;-webkit-tap-highlight-color:transparent;}
          .mob-si:active{background:var(--cyan-dim);}
          .sl-active{background:rgba(96,165,250,0.09)!important;border-color:rgba(96,165,250,0.22)!important;color:var(--cyan)!important;box-shadow:inset 3px 0 0 var(--cyan);}
          .mob-si-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0;transition:all 0.15s;}
          .mob-si-v{opacity:0.55;margin-left:1px;}
          .mob-si-ln{margin-left:auto;font-size:7px;color:var(--text-muted);opacity:0.7;}

          /* Toast */
          .toast{position:fixed;bottom:80px;left:50%;transform:translateX(-50%);padding:9px 18px;border-radius:10px;
            font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:600;white-space:nowrap;
            background:rgba(10,20,50,0.97);border:1px solid var(--border-medium);
            color:var(--green);box-shadow:0 8px 24px rgba(0,0,0,0.5),0 0 16px var(--green-glow);
            z-index:9999;animation:toastIn 0.25s ease;}

          ::-webkit-scrollbar{width:3px;height:3px;}
          ::-webkit-scrollbar-track{background:transparent;}
          ::-webkit-scrollbar-thumb{background:rgba(96,165,250,0.2);border-radius:4px;}
          textarea::-webkit-scrollbar{width:3px;}
        `}</style>

        <div className="mob-pg">
          {/* Mobile Header */}
          <header className="mob-hd">
            <div className="mob-logo">📚</div>
            <div style={{flex:1,minWidth:0}}>
              <div className="mob-brand">VisuoSlayer</div>
              <div className="mob-sub">Stack DS · Write · Run · Visualize</div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
              <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:lm.accent,background:`${lm.accent}12`,border:`1px solid ${lm.accent}28`,padding:"2px 8px",borderRadius:20,fontWeight:700}}>{lm.ext}</span>
              <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:7.5,color:"var(--text-muted)",padding:"2px 7px",borderRadius:16,border:"1px solid var(--border-subtle)",background:"var(--surface-2)"}}>{sessionId}</span>
            </div>
          </header>

          {/* Content */}
          <div className="mob-content">
            {/* CODE TAB */}
            {mobileTab === "code" && (
              <div className="mob-pane" style={{display:"flex",flexDirection:"column"}}>
                {/* Panel header */}
                <div className="mob-ph">
                  <span className="dot" style={{background:"#ff5f57",boxShadow:"0 0 5px #ff5f57"}}/>
                  <span className="dot" style={{background:"#ffbd2e",boxShadow:"0 0 5px #ffbd2e"}}/>
                  <span className="dot" style={{background:"#28c840",boxShadow:"0 0 5px #28c840"}}/>
                  <span className="ptl">Code Editor</span>
                  <span style={{marginLeft:"auto",fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:lm.accent,background:`${lm.accent}10`,border:`1px solid ${lm.accent}25`,padding:"2px 8px",borderRadius:16,fontWeight:700}}>{lm.name}</span>
                </div>

                {/* Lang tabs — horizontal scroll */}
                <div className="mob-lb">
                  {Object.entries(LANGS).map(([k,m])=>(
                    <button key={k} className={`mob-lt${lang===k?" la":""}`}
                      onClick={()=>handleChangeLang(k)}
                      style={lang===k?{borderColor:`${m.accent}35`,color:m.accent,background:`${m.accent}0e`}:{}}
                    >{m.name}</button>
                  ))}
                </div>

                {/* Editor — takes all remaining space, scrolls independently */}
                <div style={{flex:1,minHeight:0,display:"flex",flexDirection:"column",position:"relative"}}>
                  <CodeEditor code={code} setCode={setCode} step={step}
                    errorLineSet={errorLineSet} onKeyDown={onKeyDown} taRef={taRef}/>

                  {/* Active line bar — shown when stepping */}
                  {step&&os&&(
                    <div className="mob-alb" style={{borderColor:os.bd,background:os.bg}}>
                      <span style={{color:os.c,fontSize:10}}>{os.icon}</span>
                      <span className="mob-alb-ln" style={{color:os.c}}>L{step.lineNum+1}</span>
                      <code className="mob-alb-code">{step.codeLine}</code>
                    </div>
                  )}

                  {/* Fade hint above run bar so last line of code is visually clear */}
                  <div style={{
                    position:"absolute",bottom:0,left:0,right:0,height:28,
                    background:"linear-gradient(to bottom,transparent,rgba(4,8,22,0.85))",
                    pointerEvents:"none",zIndex:3,
                  }}/>
                </div>

                {/* Run bar — always pinned, never scrolls away */}
                <div className="mob-rr">
                  <button className={`mob-btn-run${playing||validating?" running":""}`}
                    onClick={handleRun} disabled={playing||validating}>
                    {validating?"⟳ Reviewing…":playing?"▶ Running…":"▶  Run & Visualize"}
                  </button>
                  {(steps.length>0||error||hasAiErrors)&&(
                    <button className="mob-btn-rst" onClick={doReset}>↺ Reset</button>
                  )}
                </div>
              </div>
            )}

            {/* VIZ TAB */}
            {mobileTab === "viz" && (
              <div className="mob-pane" style={{display:"flex",flexDirection:"column",minHeight:0}}>
                <div className="mob-ph">
                  <span className="dot" style={{background:"#60a5fa",boxShadow:"0 0 5px #60a5fa"}}/>
                  <span className="dot" style={{background:"#f472b6",boxShadow:"0 0 5px #f472b6"}}/>
                  <span className="dot" style={{background:"#4ade80",boxShadow:"0 0 5px #4ade80"}}/>
                  <span className="ptl">Stack Visualization</span>
                  {steps.length>0&&(
                    <span style={{marginLeft:"auto",fontFamily:"'JetBrains Mono',monospace",fontSize:8,
                      color:"var(--cyan)",background:"var(--cyan-dim)",border:"1px solid rgba(96,165,250,0.25)",
                      padding:"2px 8px",borderRadius:16,fontWeight:700}}>
                      {idx+1} / {steps.length}
                    </span>
                  )}
                </div>

                <div style={{flex:1,display:"flex",flexDirection:"column",minHeight:0,overflow:"hidden"}}>
                  <StackViz step={step} animKey={animKey} idle={idle} compact={true}/>

                  <div className="mob-oi">
                    {step&&os?(
                      <>
                        <div className="mob-oi-badge" style={{color:os.c,background:os.bg,borderColor:os.bd}}>
                          <span>{os.icon}</span><span>{os.label}</span>
                          {step.type==="push"&&<span style={{opacity:0.55}}>({step.value})</span>}
                          {(step.type==="pop"||step.type==="peek")&&step.value!=null&&<span style={{opacity:0.55}}>→ {step.value}</span>}
                          {step.type==="isEmpty"&&<span style={{opacity:0.55}}>→ {String(step.result)}</span>}
                        </div>
                        <div className="mob-oi-msg">{step.message}</div>
                      </>
                    ):(
                      <div style={{display:"flex",alignItems:"center",gap:8,fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"var(--text-muted)",padding:"4px 0"}}>
                        <span>📟</span>
                        <span>{idle?"Write a Stack, hit Run to visualize":hasAiErrors?"Errors found — check Terminal":error?"Fix errors and run again":validating?"Reviewing code…":"Waiting…"}</span>
                      </div>
                    )}
                  </div>

                  {steps.length>0&&(
                    <div className="mob-ctrl">
                      <button className="mob-cb" onClick={()=>goTo(0)} disabled={idx<=0}>⏮</button>
                      <button className="mob-cb" onClick={()=>goTo(idx-1)} disabled={idx<=0}>◀</button>
                      <button className="mob-cp"
                        onClick={()=>{
                          if(done||idx>=steps.length-1){setIdx(0);bump();setDone(false);setPlaying(true);}
                          else{clearInterval(timerRef.current);setPlaying(p=>!p);}
                        }}>
                        {playing?"⏸":done?"↺":"▶"}
                      </button>
                      <button className="mob-cb" onClick={()=>goTo(idx+1)} disabled={idx>=steps.length-1}>▶</button>
                      <button className="mob-cb" onClick={()=>goTo(steps.length-1)} disabled={idx>=steps.length-1}>⏭</button>
                      <div className="mob-csep"/>
                      <div className="mob-spd">
                        {[[2,"½×"],[1.1,"1×"],[0.55,"2×"]].map(([s,lbl])=>(
                          <button key={s} className={`mob-sb${speed===s?" sa":""}`} onClick={()=>setSpeed(s)}>{lbl}</button>
                        ))}
                      </div>
                      <div className="mob-csep"/>
                      <button className="mob-cb" onClick={copyStackState} style={{fontSize:14}}>📋</button>
                    </div>
                  )}

                  {steps.length>0&&(
                    <div className="mob-pr">
                      <div className="mob-pt2"><div className="mob-pf" style={{width:`${prog}%`}}/></div>
                      <span className="mob-ptx">{prog}%</span>
                    </div>
                  )}

                  {steps.length>0&&(
                    <>
                      <div className="mob-slh">
                        <span>OPERATION LOG</span>
                        <span style={{color:"var(--cyan)",fontSize:7}}>{steps.length} ops</span>
                      </div>
                      <div className="mob-sl" ref={listRef}>
                        {steps.map((s,i)=>{
                          const sm=OP[s.type]??OP.push;
                          const past=i<idx,active=i===idx;
                          return(
                            <div key={i} className={`mob-si${active?" sl-active":""}`} onClick={()=>goTo(i)}>
                              <span className="mob-si-dot" style={{
                                background:past?"var(--green)":active?sm.c:"var(--text-muted)",
                                boxShadow:active?`0 0 6px ${sm.c}`:past?"0 0 5px var(--green-glow)":"none",
                              }}/>
                              <span style={{color:active?sm.c:past?"var(--text-secondary)":"var(--text-muted)"}}>
                                {sm.label}
                                {s.type==="push"&&<span className="mob-si-v">({s.value})</span>}
                                {s.type==="pop"&&s.value!=null&&<span className="mob-si-v"> → {s.value}</span>}
                                {s.type==="peek"&&s.value!=null&&<span className="mob-si-v"> = {s.value}</span>}
                                {s.type==="isEmpty"&&<span className="mob-si-v"> = {String(s.result)}</span>}
                                {(s.type==="pop_error"||s.type==="peek_error")&&<span style={{color:"#f87171",opacity:0.7}}> ⚠</span>}
                              </span>
                              <span className="mob-si-ln">L{s.lineNum+1}</span>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* TERMINAL TAB */}
            {mobileTab === "log" && (
              <div className="mob-pane" style={{display:"flex",flexDirection:"column",minHeight:0}}>
                <div className="mob-ph">
                  <span className="dot" style={{background:"#ff5f57",boxShadow:"0 0 5px #ff5f57"}}/>
                  <span className="dot" style={{background:"#ffbd2e",boxShadow:"0 0 5px #ffbd2e"}}/>
                  <span className="dot" style={{background:"#28c840",boxShadow:"0 0 5px #28c840"}}/>
                  <span className="ptl">visualoslayer — bash</span>
                  <span style={{marginLeft:"auto",fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:"var(--text-muted)"}}>pid:{sessionId}</span>
                </div>
                <Terminal lines={termLines} sessionId={sessionId} validating={validating}/>
              </div>
            )}
          </div>

          {/* Bottom Tab Bar */}
          <MobileTabBar
            activeTab={mobileTab}
            setActiveTab={setMobileTab}
            hasSteps={steps.length>0}
            hasErrors={!!error||hasAiErrors}
            hasAiErrors={hasAiErrors}
            termLines={termLines}
          />
        </div>

        {toast&&<div className="toast">{toast}</div>}
      </>
    );
  }

  // ── DESKTOP LAYOUT (≥768px) ────────────────────────────────────────────────
  return(
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Space+Grotesk:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html,body{height:100%;overflow:hidden}
        body{background:#050818;color:#c8d8f0;font-family:'DM Sans',sans-serif;}

        :root{
          --cyan:#60a5fa; --cyan-dim:rgba(96,165,250,0.15); --cyan-glow:rgba(96,165,250,0.45);
          --pink:#f472b6; --pink-dim:rgba(244,114,182,0.15);
          --green:#4ade80; --green-dim:rgba(74,222,128,0.15); --green-glow:rgba(74,222,128,0.4);
          --purple:#a78bfa; --yellow:#fbbf24;
          --text-primary:#d4e4f7; --text-secondary:#6b8aaa; --text-muted:#3d5470;
          --border-subtle:rgba(255,255,255,0.07); --border-medium:rgba(255,255,255,0.13);
          --surface-0:#050818; --surface-1:rgba(8,14,36,0.95); --surface-2:rgba(12,20,48,0.8);
          --surface-3:rgba(16,26,58,0.7);
        }

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
        @keyframes blkDrop{0%{transform:translateY(-80px) scale(0.78);opacity:0;filter:blur(3px)}55%{transform:translateY(6px) scale(1.05);opacity:1;filter:blur(0)}75%{transform:translateY(-2px) scale(0.98)}100%{transform:none;opacity:1}}
        @keyframes flyAway{0%{transform:translateX(-50%) scale(1) rotate(0);opacity:1}35%{opacity:1}100%{transform:translateX(calc(-50% + 65px)) translateY(-120px) scale(0.5) rotate(22deg);opacity:0}}
        @keyframes pkRing{0%{transform:scale(1);opacity:0.9}100%{transform:scale(1.35);opacity:0}}
        @keyframes pkPulse{0%,100%{filter:brightness(1)}50%{filter:brightness(1.55) saturate(1.4)}}
        @keyframes ecCheck{0%,100%{transform:scale(1)}35%{transform:scale(1.06) translateY(-5px)}68%{transform:scale(0.97) translateY(2px)}}
        @keyframes pShine{0%,100%{left:-100%}55%{left:160%}}
        @keyframes svSh{0%,100%{transform:none}18%{transform:translateX(-9px)}36%{transform:translateX(9px)}54%{transform:translateX(-5px)}72%{transform:translateX(5px)}}
        @keyframes blobFloat{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(22px,-16px) scale(1.06)}66%{transform:translate(-14px,20px) scale(0.95)}}
        @keyframes blob2{0%,100%{transform:translate(0,0) scale(1)}40%{transform:translate(-26px,14px) scale(1.08)}70%{transform:translate(18px,-22px) scale(0.93)}}
        @keyframes scanline{0%{top:-10%}100%{top:110%}}
        @keyframes gridScroll{0%{background-position:0 0}100%{background-position:38px 38px}}

        .pg{height:100vh;display:flex;flex-direction:column;overflow:hidden;
          background:radial-gradient(ellipse 60% 45% at 5% 0%,rgba(59,130,246,0.10) 0%,transparent 55%),
            radial-gradient(ellipse 50% 40% at 95% 100%,rgba(244,114,182,0.08) 0%,transparent 52%),
            radial-gradient(ellipse 40% 35% at 50% 50%,rgba(167,139,250,0.04) 0%,transparent 60%),
            #050818}

        .hd{flex-shrink:0;display:flex;align-items:center;gap:12px;padding:9px 24px;
          background:rgba(5,8,22,0.98);backdrop-filter:blur(20px);
          border-bottom:1px solid rgba(96,165,250,0.12);
          box-shadow:0 1px 0 rgba(96,165,250,0.06),0 4px 24px rgba(0,0,0,0.4)}
        .hd-logo{width:34px;height:34px;border-radius:9px;flex-shrink:0;
          background:linear-gradient(135deg,#1d4ed8,#3b82f6 50%,#a78bfa);
          display:flex;align-items:center;justify-content:center;font-size:17px;
          box-shadow:0 0 20px rgba(96,165,250,0.5),0 0 40px rgba(96,165,250,0.15);
          animation:rPulse 3s ease-in-out infinite}
        .hd-brand{font-family:'Space Grotesk',sans-serif;font-size:16px;font-weight:800;letter-spacing:-0.4px;
          background:linear-gradient(90deg,#93c5fd 0%,#a78bfa 50%,#f472b6 100%);
          background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;
          animation:shimmer 4s linear infinite}
        .hd-tagline{font-size:9px;color:var(--text-muted);font-family:'JetBrains Mono',monospace;margin-top:1px;letter-spacing:0.04em}
        .hd-r{margin-left:auto;display:flex;align-items:center;gap:8px}
        .hd-pill{font-family:'JetBrains Mono',monospace;font-size:8.5px;padding:3px 10px;border-radius:20px;letter-spacing:0.07em;white-space:nowrap;font-weight:700}
        .hd-pid{font-family:'JetBrains Mono',monospace;font-size:8px;color:var(--text-muted);padding:3px 9px;border-radius:20px;border:1px solid var(--border-subtle);background:var(--surface-2)}
        .hd-ds-badge{font-family:'JetBrains Mono',monospace;font-size:8px;color:var(--cyan);padding:3px 9px;border-radius:20px;border:1px solid rgba(96,165,250,0.25);background:rgba(96,165,250,0.08);letter-spacing:0.08em}

        /* Responsive layout: side-by-side on ≥768, may be tighter on tablet */
        .main{flex:1;display:grid;gap:10px;padding:10px 24px;min-height:0;overflow:hidden;}
        @media(min-width:768px) and (max-width:1100px){
          .main{grid-template-columns:1fr 1fr;padding:8px 14px;gap:8px;}
        }
        @media(min-width:1100px){
          .main{grid-template-columns:1fr 1fr;padding:10px 24px;}
        }

        .panel{background:var(--surface-1);border:1px solid var(--border-subtle);border-radius:14px;
          display:flex;flex-direction:column;overflow:hidden;
          box-shadow:0 20px 60px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,255,255,0.04);min-height:0}
        .ph{padding:9px 14px;border-bottom:1px solid var(--border-subtle);
          background:rgba(8,14,38,0.85);display:flex;align-items:center;gap:7px;flex-shrink:0}
        .dot{width:9px;height:9px;border-radius:50%;transition:box-shadow 0.3s}
        .ptl{font-family:'JetBrains Mono',monospace;font-size:8px;color:var(--text-muted);
          text-transform:uppercase;letter-spacing:1.5px;margin-left:8px;font-weight:600}
        .left{display:flex;flex-direction:column;min-height:0}

        .lb{display:flex;gap:3px;flex-wrap:wrap;padding:7px 11px;
          border-bottom:1px solid var(--border-subtle);background:rgba(6,11,30,0.8);flex-shrink:0}
        .lt{padding:3px 9px;border-radius:6px;cursor:pointer;
          font-family:'JetBrains Mono',monospace;font-size:8px;font-weight:700;
          border:1px solid var(--border-subtle);background:transparent;
          color:var(--text-muted);transition:all 0.15s;letter-spacing:0.05em}
        .lt:hover{color:var(--text-secondary);border-color:var(--border-medium);background:rgba(255,255,255,0.04)}
        .lt.la{color:#e8f4ff;background:rgba(255,255,255,0.06);box-shadow:inset 0 1px 0 rgba(255,255,255,0.1)}

        .alb{display:flex;align-items:center;gap:8px;padding:5px 14px;
          border-left:2px solid;min-height:26px;border-top:1px solid var(--border-subtle);
          flex-shrink:0;animation:fadeIn 0.18s ease;backdrop-filter:blur(4px)}
        .alb-ln{font-family:'JetBrains Mono',monospace;font-size:9px;font-weight:700;white-space:nowrap}
        .alb-code{font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--text-secondary);
          overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1}

        .rr{padding:8px 12px;border-top:1px solid var(--border-subtle);
          display:flex;align-items:center;gap:7px;flex-shrink:0;background:rgba(4,8,22,0.6)}
        .btn-run{padding:7px 18px;border-radius:8px;
          background:linear-gradient(135deg,#1d4ed8,#3b82f6,#60a5fa);
          border:1px solid rgba(96,165,250,0.35);color:#fff;
          font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;cursor:pointer;
          transition:all 0.18s;box-shadow:0 0 20px rgba(96,165,250,0.3),0 2px 8px rgba(0,0,0,0.4);
          letter-spacing:0.04em;position:relative;overflow:hidden;white-space:nowrap}
        .btn-run::after{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,0.15) 0%,transparent 60%);border-radius:inherit;pointer-events:none}
        .btn-run:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 0 36px rgba(96,165,250,0.55),0 6px 20px rgba(0,0,0,0.5)}
        .btn-run:active:not(:disabled){transform:translateY(0)}
        .btn-run.running{animation:rPulse 1.2s ease-in-out infinite;background:linear-gradient(135deg,#1e3a8a,#1d4ed8,#3b82f6)}
        .btn-run:disabled{opacity:0.4;cursor:not-allowed;transform:none;box-shadow:none}
        .btn-rst{padding:7px 11px;border-radius:8px;background:transparent;
          border:1px solid rgba(248,113,113,0.28);color:#f87171;
          font-family:'JetBrains Mono',monospace;font-size:9px;font-weight:600;cursor:pointer;transition:all 0.16s}
        .btn-rst:hover{background:rgba(248,113,113,0.1);border-color:rgba(248,113,113,0.5)}
        .rr-hint{font-family:'JetBrains Mono',monospace;font-size:8px;color:var(--text-muted);
          letter-spacing:0.07em;padding:3px 7px;border-radius:5px;border:1px solid var(--border-subtle);background:var(--surface-2)}

        .term-bar{display:flex;align-items:center;gap:6px;padding:6px 13px;
          background:rgba(4,7,18,0.95);border-bottom:1px solid var(--border-subtle);
          border-top:1px solid var(--border-subtle);flex-shrink:0}
        .tm-wrap{display:flex;flex-direction:column;min-height:0;transition:flex-basis 0.32s cubic-bezier(0.4,0,0.2,1),opacity 0.25s ease;overflow:hidden}
        .tm-wrap.tm-open{flex:1;min-height:90px}
        .tm-wrap.tm-closed{flex:0 0 0px;min-height:0;opacity:0;pointer-events:none}
        .term-body-wrap{flex:1;display:flex;flex-direction:column;min-height:0;animation:termSlideDown 0.28s cubic-bezier(0.4,0,0.2,1)}
        .term-toggle{display:flex;align-items:center;justify-content:center;
          width:18px;height:18px;border-radius:5px;border:1px solid var(--border-medium);
          background:rgba(255,255,255,0.04);cursor:pointer;flex-shrink:0;
          color:var(--text-secondary);font-size:9px;font-weight:700;transition:all 0.15s;margin-left:auto;
          font-family:'JetBrains Mono',monospace;line-height:1;user-select:none}
        .term-toggle:hover{background:var(--cyan-dim);color:var(--cyan);border-color:rgba(96,165,250,0.4)}
        .term-bar-closed{display:flex;align-items:center;gap:6px;padding:6px 13px;
          background:rgba(4,7,18,0.95);border-top:1px solid var(--border-subtle);flex-shrink:0;cursor:pointer;transition:background 0.15s}
        .term-bar-closed:hover{background:rgba(8,14,32,0.95)}

        .sv-metrics{display:flex;border-bottom:1px solid var(--border-subtle);background:rgba(4,8,26,0.75);flex-shrink:0}
        .sv-m{flex:1;padding:7px 8px;text-align:center;border-right:1px solid var(--border-subtle);display:flex;flex-direction:column;gap:3px;transition:background 0.2s}
        .sv-m:last-child{border-right:none}
        .sv-m.sv-m-active{background:rgba(96,165,250,0.05);animation:metricPop 0.3s ease}
        .sv-ml{font-family:'JetBrains Mono',monospace;font-size:6.5px;color:var(--text-muted);letter-spacing:0.2em;text-transform:uppercase;font-weight:600}
        .sv-mv{font-family:'JetBrains Mono',monospace;font-weight:700;line-height:1.1;transition:color 0.3s}

        .sv{display:flex;flex-direction:column;flex:1;min-height:0;position:relative}
        .sv.sv-err{animation:svSh 0.4s ease}
        .sv-col{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;padding:14px 14px 0;position:relative;overflow:hidden}
        .sv-col::before{content:'';position:absolute;inset:0;pointer-events:none;
          background-image:linear-gradient(rgba(96,165,250,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(96,165,250,0.05) 1px,transparent 1px);
          background-size:38px 38px;animation:gridScroll 10s linear infinite}
        .sv-col::after{content:'';position:absolute;left:0;right:0;height:70px;pointer-events:none;z-index:0;
          background:linear-gradient(to bottom,transparent,rgba(96,165,250,0.025),transparent);
          animation:scanline 7s ease-in-out infinite}
        .sv-blob{position:absolute;border-radius:50%;pointer-events:none;filter:blur(65px);mix-blend-mode:screen}
        .sv-blob-1{width:200px;height:200px;top:-30px;left:-20px;background:radial-gradient(circle,rgba(59,130,246,0.14),transparent 65%);animation:blobFloat 13s ease-in-out infinite}
        .sv-blob-2{width:160px;height:160px;bottom:20px;right:-10px;background:radial-gradient(circle,rgba(244,114,182,0.10),transparent 65%);animation:blob2 10s ease-in-out infinite}
        .sv-fly{position:absolute;top:10px;left:50%;transform:translateX(-50%);border-radius:11px;display:flex;align-items:center;justify-content:center;gap:8px;z-index:20;pointer-events:none;border:1.5px solid rgba(255,255,255,0.25);animation:flyAway 0.82s cubic-bezier(0.22,1,0.36,1) forwards}
        .sv-fly-v{font-family:'JetBrains Mono',monospace;font-weight:700;color:#fff}
        .sv-fly-tag{font-family:'JetBrains Mono',monospace;font-size:7.5px;color:rgba(255,255,255,0.65);letter-spacing:0.06em}
        .sv-blocks{display:flex;flex-direction:column;gap:4px;align-items:center;width:100%;position:relative;z-index:2}
        .sv-block{height:44px;border-radius:11px;border:1.5px solid transparent;display:flex;align-items:center;padding:0 12px;gap:8px;position:relative;overflow:hidden;transition:width 0.28s,box-shadow 0.28s;cursor:default}
        .sv-block-shine{position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,0.18) 0%,transparent 52%);border-radius:inherit;pointer-events:none}
        .sv-block:hover{filter:brightness(1.08)}
        .sv-push{animation:blkDrop 0.5s cubic-bezier(0.34,1.56,0.64,1) both}
        .sv-pr,.sv-pr2{position:absolute;inset:-4px;border-radius:15px;border:2px solid;animation:pkRing 0.75s cubic-bezier(0.22,1,0.36,1) forwards;pointer-events:none}
        .sv-pr2{animation-delay:0.15s}
        .sv-peek{animation:pkPulse 0.6s ease 2 both}
        .sv-top{z-index:2}
        .sv-ec{animation:ecCheck 0.46s ease both}
        .sv-bidx{font-family:'JetBrains Mono',monospace;font-size:7.5px;color:rgba(255,255,255,0.35);flex-shrink:0;font-weight:600}
        .sv-bval{font-family:'JetBrains Mono',monospace;font-weight:700;color:#fff;flex:1;text-align:center;text-shadow:0 2px 10px rgba(0,0,0,0.35)}
        .sv-btag{font-family:'JetBrains Mono',monospace;font-size:7px;color:rgba(255,255,255,0.6);flex-shrink:0;letter-spacing:0.06em}
        .sv-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;width:175px;height:78px;border:1px dashed rgba(255,255,255,0.08);border-radius:12px;gap:6px;background:rgba(255,255,255,0.015);z-index:2;position:relative}
        .sv-empty.sv-empty-err{border-color:rgba(248,113,113,0.3);animation:svSh 0.36s ease;background:rgba(248,113,113,0.03)}
        .sv-ei{font-size:20px;opacity:0.4}
        .sv-et{font-family:'JetBrains Mono',monospace;font-size:8.5px;color:var(--text-muted);letter-spacing:0.08em}
        .sv-plat{margin-top:4px;width:210px;height:7px;border-radius:5px;
          background:linear-gradient(90deg,rgba(96,165,250,0.22),rgba(96,165,250,0.1),rgba(96,165,250,0.22));
          position:relative;overflow:hidden;box-shadow:0 0 16px rgba(96,165,250,0.22)}
        .sv-plat-shine{position:absolute;top:0;left:-100%;width:55%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent);animation:pShine 3.5s ease-in-out infinite}
        .sv-base{font-family:'JetBrains Mono',monospace;font-size:7px;color:var(--text-muted);letter-spacing:0.15em;margin-top:4px;margin-bottom:8px}

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

        .toast{position:fixed;bottom:24px;right:24px;padding:8px 16px;border-radius:9px;
          font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:600;
          background:rgba(10,20,50,0.97);border:1px solid var(--border-medium);
          color:var(--green);box-shadow:0 8px 24px rgba(0,0,0,0.5),0 0 16px var(--green-glow);
          z-index:9999;animation:toastIn 0.25s ease,toastOut 0.3s ease 1.8s forwards}

        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(96,165,250,0.2);border-radius:4px}
        ::-webkit-scrollbar-thumb:hover{background:rgba(96,165,250,0.4)}
        textarea::-webkit-scrollbar{width:4px}
      `}</style>

      <div className="pg">
        <header className="hd">
          <div className="hd-logo">📚</div>
          <div>
            <div className="hd-brand">VisuoSlayer</div>
            <div className="hd-tagline">Stack DS Visualizer · Write · Run · Step through every operation</div>
          </div>
          <div className="hd-r">
            <div className="hd-ds-badge">LIFO STACK</div>
            <div className="hd-pill" style={{color:lm.accent,background:`${lm.accent}12`,border:`1px solid ${lm.accent}28`}}>{lm.name}</div>
            <div className="hd-pid">pid:{sessionId}</div>
          </div>
        </header>

        <main className="main">
          {/* LEFT */}
          <div className="panel left">
            <div className="ph">
              <span className="dot" style={{background:"#ff5f57",boxShadow:"0 0 6px #ff5f57"}}/>
              <span className="dot" style={{background:"#ffbd2e",boxShadow:"0 0 6px #ffbd2e"}}/>
              <span className="dot" style={{background:"#28c840",boxShadow:"0 0 6px #28c840"}}/>
              <span className="ptl">Code Editor</span>
              <span style={{marginLeft:"auto",fontFamily:"'JetBrains Mono',monospace",fontSize:8,
                color:lm.accent,background:`${lm.accent}12`,border:`1px solid ${lm.accent}28`,
                padding:"2px 8px",borderRadius:20,fontWeight:700}}>{lm.name}</span>
            </div>

            <div style={{flex:termOpen?"0 0 58%":"1",display:"flex",flexDirection:"column",minHeight:0,borderBottom:"1px solid var(--border-subtle)"}}>
              <div className="lb">
                {Object.entries(LANGS).map(([k,m])=>(
                  <button key={k} className={`lt${lang===k?" la":""}`}
                    onClick={()=>handleChangeLang(k)}
                    style={lang===k?{borderColor:`${m.accent}35`,color:m.accent,background:`${m.accent}0e`}:{}}
                  >{m.ext}</button>
                ))}
              </div>

              <CodeEditor code={code} setCode={setCode} step={step}
                errorLineSet={errorLineSet} onKeyDown={onKeyDown} taRef={taRef}/>

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

            <div className={`tm-wrap${termOpen?" tm-open":" tm-closed"}`}>
              <div className="term-body-wrap" key={termOpen?"open":"closed"}>
                <div className="term-bar">
                  <span className="dot" style={{background:"#ff5f57",boxShadow:"0 0 5px #ff5f57"}}/>
                  <span className="dot" style={{background:"#ffbd2e",boxShadow:"0 0 5px #ffbd2e"}}/>
                  <span className="dot" style={{background:"#28c840",boxShadow:"0 0 5px #28c840"}}/>
                  <span style={{marginLeft:8,fontFamily:"'JetBrains Mono',monospace",fontSize:8.5,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"1.2px",userSelect:"none"}}>
                    visualoslayer — bash
                  </span>
                  <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:"var(--text-muted)",marginLeft:8}}>pid:{sessionId}</span>
                  <button className="term-toggle" onClick={()=>setTermOpen(false)} title="Collapse">▾</button>
                </div>
                <Terminal lines={termLines} sessionId={sessionId} validating={validating}/>
              </div>
            </div>

            {!termOpen&&(
              <div className="term-bar-closed" onClick={()=>setTermOpen(true)}>
                <span className="dot" style={{background:"#ff5f57",boxShadow:"0 0 4px #ff5f57"}}/>
                <span className="dot" style={{background:"#ffbd2e",boxShadow:"0 0 4px #ffbd2e"}}/>
                <span className="dot" style={{background:"#28c840",boxShadow:"0 0 4px #28c840"}}/>
                <span style={{marginLeft:8,fontFamily:"'JetBrains Mono',monospace",fontSize:8.5,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"1.2px"}}>
                  visualoslayer — bash
                </span>
                {termLines.some(l=>l.type==="error"||l.type==="stderr")&&(
                  <span style={{marginLeft:8,fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:"#f87171",background:"rgba(248,113,113,0.1)",border:"1px solid rgba(248,113,113,0.25)",padding:"1px 7px",borderRadius:10}}>errors</span>
                )}
                {termLines.some(l=>l.type==="success")&&(
                  <span style={{marginLeft:8,fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:"var(--green)",background:"var(--green-dim)",border:"1px solid rgba(74,222,128,0.25)",padding:"1px 7px",borderRadius:10}}>ok</span>
                )}
                <span style={{marginLeft:"auto",fontFamily:"'JetBrains Mono',monospace",fontSize:8.5,color:"var(--cyan)",fontWeight:700}}>▴ open</span>
              </div>
            )}
          </div>

          {/* RIGHT */}
          <div className="panel">
            <div className="ph">
              <span className="dot" style={{background:"#60a5fa",boxShadow:"0 0 6px #60a5fa"}}/>
              <span className="dot" style={{background:"#f472b6",boxShadow:"0 0 6px #f472b6"}}/>
              <span className="dot" style={{background:"#4ade80",boxShadow:"0 0 6px #4ade80"}}/>
              <span className="ptl">Stack Visualization</span>
              {steps.length>0&&(
                <span style={{marginLeft:"auto",fontFamily:"'JetBrains Mono',monospace",fontSize:8,
                  color:"var(--cyan)",background:"var(--cyan-dim)",border:"1px solid rgba(96,165,250,0.25)",
                  padding:"2px 9px",borderRadius:20,fontWeight:700}}>
                  {idx+1} / {steps.length}
                </span>
              )}
            </div>

            <div style={{flex:1,display:"flex",flexDirection:"column",minHeight:0,overflow:"hidden"}}>
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
                    <span style={{color:"var(--text-muted)"}}>
                      {idle?"Write a Stack class, use it below, hit Run"
                        :hasAiErrors?"VisuoSlayer found errors — see terminal"
                        :error?"Fix errors and run again"
                        :validating?"VisuoSlayer reviewing your code…"
                        :"Waiting…"}
                    </span>
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
                  <button className="cb" onClick={copyStackState} style={{fontSize:12}}>📋</button>
                  <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8.5,color:"var(--text-secondary)",marginLeft:2}}>
                    <span style={{color:"var(--cyan)",fontWeight:700}}>{idx+1}</span>
                    <span style={{color:"var(--text-muted)"}}>/{steps.length}</span>
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
                  <div className="slh">
                    <span>OPERATION LOG — click to jump</span>
                    <span className="slh-count">{steps.length} ops</span>
                  </div>
                  <div className="sl" ref={listRef}>
                    {steps.map((s,i)=>{
                      const sm=OP[s.type]??OP.push;
                      const past=i<idx,active=i===idx;
                      return(
                        <div key={i} className={`si${active?" sl-active":""}`} onClick={()=>goTo(i)}>
                          <span className="si-dot" style={{
                            background:past?"var(--green)":active?sm.c:"var(--text-muted)",
                            boxShadow:active?`0 0 6px ${sm.c}`:past?"0 0 5px var(--green-glow)":"none",
                          }}/>
                          <span style={{color:active?sm.c:past?"var(--text-secondary)":"var(--text-muted)"}}>
                            {sm.label}
                            {s.type==="push"&&<span className="si-v">({s.value})</span>}
                            {s.type==="pop"&&s.value!=null&&<span className="si-v"> → {s.value}</span>}
                            {s.type==="peek"&&s.value!=null&&<span className="si-v"> = {s.value}</span>}
                            {s.type==="isEmpty"&&<span className="si-v"> = {String(s.result)}</span>}
                            {(s.type==="pop_error"||s.type==="peek_error")&&<span style={{color:"#f87171",opacity:0.7}}> ⚠</span>}
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
      {toast&&<div className="toast">{toast}</div>}
    </>
  );
}