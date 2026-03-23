"use client";
import { useState, useRef, useEffect, useCallback } from "react";

// ── Color palette ────────────────────────────────────────────────────────────
const PALETTE = [
  { g1:"#4facfe", g2:"#00f2fe", glow:"rgba(79,172,254,0.65)",  border:"#4facfe" },
  { g1:"#f093fb", g2:"#f5576c", glow:"rgba(245,87,108,0.65)",  border:"#f5576c" },
  { g1:"#43e97b", g2:"#38f9d7", glow:"rgba(67,233,123,0.65)",  border:"#43e97b" },
  { g1:"#fda085", g2:"#f6d365", glow:"rgba(246,211,101,0.65)", border:"#fda085" },
  { g1:"#a18cd1", g2:"#fbc2eb", glow:"rgba(161,140,209,0.65)", border:"#a18cd1" },
  { g1:"#30cfd0", g2:"#667eea", glow:"rgba(102,126,234,0.65)", border:"#30cfd0" },
  { g1:"#ff9966", g2:"#ff5e62", glow:"rgba(255,94,98,0.65)",   border:"#ff9966" },
  { g1:"#89f7fe", g2:"#66a6ff", glow:"rgba(102,166,255,0.65)", border:"#89f7fe" },
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
  c:          { name:"C",          ext:"C",   accent:"#a8daff", custom:false },
  cpp:        { name:"C++",        ext:"C++", accent:"#00b4d8", custom:false },
  java:       { name:"Java",       ext:"JV",  accent:"#ed8b00", custom:false },
  go:         { name:"Go",         ext:"GO",  accent:"#00add8", custom:false },
  python:     { name:"Python",     ext:"PY",  accent:"#4ec9b0", custom:false },
  javascript: { name:"JavaScript", ext:"JS",  accent:"#f7df1e", custom:false },
};

const LINE_H = 21;

// ── CODE TEMPLATES ────────────────────────────────────────────────────────────
const TPL = {
c: `// Linked List Stack — C
#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>

typedef struct Node {
    int data;
    struct Node* next;
} Node;

typedef struct {
    Node* top;
} Stack;

void init(Stack* s) {
    s->top = NULL;
}

void push(Stack* s, int val) {
    Node* newNode = (Node*)malloc(sizeof(Node));
    newNode->data = val;
    newNode->next = s->top;
    s->top = newNode;
}

int pop(Stack* s) {
    if (s->top == NULL) return -1;
    Node* temp = s->top;
    int val = temp->data;
    s->top = s->top->next;
    free(temp);
    return val;
}

int peek(Stack* s) {
    if (s->top == NULL) return -1;
    return s->top->data;
}

bool isEmpty(Stack* s) {
    return s->top == NULL;
}

int size(Stack* s) {
    int count = 0;
    Node* cur = s->top;
    while (cur) {
        count++;
        cur = cur->next;
    }
    return count;
}

int main() {
    Stack s;
    init(&s);
    push(&s, 10);
    push(&s, 25);
    push(&s, 37);
    peek(&s);
    pop(&s);
    push(&s, 99);
    push(&s, 4);
    isEmpty(&s);
    pop(&s);
    pop(&s);
    return 0;
}`,

cpp: `// Linked List Stack — C++
#include <iostream>
using namespace std;

struct Node {
    int data;
    Node* next;
    Node(int val) : data(val), next(nullptr) {}
};

class Stack {
private:
    Node* top;

public:
    Stack() : top(nullptr) {}

    ~Stack() {
        while (!isEmpty()) pop();
    }

    void push(int val) {
        Node* newNode = new Node(val);
        newNode->next = top;
        top = newNode;
    }

    int pop() {
        if (isEmpty()) return -1;
        int val = top->data;
        Node* temp = top;
        top = top->next;
        delete temp;
        return val;
    }

    int peek() {
        return isEmpty() ? -1 : top->data;
    }

    bool isEmpty() {
        return top == nullptr;
    }

    int size() {
        int count = 0;
        Node* cur = top;
        while (cur) {
            count++;
            cur = cur->next;
        }
        return count;
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

java: `// Linked List Stack — Java
public class Main {

    static class Node<T> {
        T data;
        Node<T> next;

        Node(T data) {
            this.data = data;
        }
    }

    static class Stack<T> {
        private Node<T> top;

        public void push(T data) {
            Node<T> newNode = new Node<>(data);
            newNode.next = top;
            top = newNode;
        }

        public T pop() {
            if (isEmpty()) return null;
            T data = top.data;
            top = top.next;
            return data;
        }

        public T peek() {
            return isEmpty() ? null : top.data;
        }

        public boolean isEmpty() {
            return top == null;
        }

        public int size() {
            int count = 0;
            Node<T> cur = top;
            while (cur != null) {
                count++;
                cur = cur.next;
            }
            return count;
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

go: `// Linked List Stack — Go
package main

import "fmt"

type Node struct {
    value int
    next  *Node
}

type Stack struct {
    top *Node
}

func (s *Stack) Push(value int) {
    newNode := &Node{value: value, next: s.top}
    s.top = newNode
}

func (s *Stack) Pop() (int, bool) {
    if s.IsEmpty() {
        return 0, false
    }
    value := s.top.value
    s.top = s.top.next
    return value, true
}

func (s *Stack) Peek() (int, bool) {
    if s.IsEmpty() {
        return 0, false
    }
    return s.top.value, true
}

func (s *Stack) IsEmpty() bool {
    return s.top == nil
}

func (s *Stack) Size() int {
    count := 0
    cur := s.top
    for cur != nil {
        count++
        cur = cur.next
    }
    return count
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

python: `# Linked List Stack — Python
class Node:
    def __init__(self, value):
        self.value = value
        self.next = None


class Stack:
    def __init__(self):
        self.top = None

    def push(self, value):
        new_node = Node(value)
        new_node.next = self.top
        self.top = new_node

    def pop(self):
        if self.is_empty():
            return None
        value = self.top.value
        self.top = self.top.next
        return value

    def peek(self):
        return self.top.value if self.top else None

    def is_empty(self):
        return self.top is None

    def size(self):
        count = 0
        cur = self.top
        while cur:
            count += 1
            cur = cur.next
        return count


s = Stack()
s.push(10)
s.push(25)
s.push(37)
s.peek()
s.pop()
s.push(99)
s.push(42)
s.is_empty()`,

javascript: `// Linked List Stack — JavaScript
class Node {
    constructor(value) {
        this.value = value;
        this.next = null;
    }
}

class Stack {
    constructor() {
        this.top = null;
    }

    push(value) {
        const newNode = new Node(value);
        newNode.next = this.top;
        this.top = newNode;
    }

    pop() {
        if (this.isEmpty()) return undefined;
        const value = this.top.value;
        this.top = this.top.next;
        return value;
    }

    peek() {
        return this.isEmpty() ? undefined : this.top.value;
    }

    isEmpty() {
        return this.top === null;
    }

    get size() {
        let count = 0;
        let cur = this.top;
        while (cur) {
            count++;
            cur = cur.next;
        }
        return count;
    }
}

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
};

// ── Parsers ───────────────────────────────────────────────────────────────────
function parseCStack(code) {
  const steps = [], stack = [];
  const lines = code.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    if (!t || t.startsWith("//") || t.startsWith("*") || t.startsWith("#")) continue;
    const pushM  = /\bpush\s*\(\s*&?\w+\s*,\s*(-?[\d.]+)\s*\)/.exec(t);
    const isPopT   = /\bpop\s*\(\s*&?\w+\s*\)/.test(t);
    const isPeekT  = /\bpeek\s*\(\s*&?\w+\s*\)/.test(t);
    const isEmptyT = /\bisEmpty\s*\(\s*&?\w+\s*\)/.test(t);
    if (pushM) {
      const v = parseFloat(pushM[1]); stack.push(v);
      steps.push({ type:"push", value:v, stack:[...stack], lineNum:i, codeLine:t, message:buildMessage({type:"push",value:v,stack:[...stack]}) });
    } else if (isPopT) {
      if (stack.length === 0) steps.push({ type:"pop_error", value:null, stack:[], lineNum:i, codeLine:t, message:buildMessage({type:"pop_error"}) });
      else { const v = stack.pop(); steps.push({ type:"pop", value:v, stack:[...stack], lineNum:i, codeLine:t, message:buildMessage({type:"pop",value:v,stack:[...stack]}) }); }
    } else if (isPeekT) {
      if (stack.length === 0) steps.push({ type:"peek_error", value:null, stack:[], lineNum:i, codeLine:t, message:buildMessage({type:"peek_error"}) });
      else { const v = stack[stack.length-1]; steps.push({ type:"peek", value:v, stack:[...stack], lineNum:i, codeLine:t, message:buildMessage({type:"peek",value:v,stack:[...stack]}) }); }
    } else if (isEmptyT) {
      const e = stack.length === 0;
      steps.push({ type:"isEmpty", result:e, stack:[...stack], lineNum:i, codeLine:t, message:buildMessage({type:"isEmpty",result:e,stack:[...stack]}) });
    }
  }
  if (!steps.length) return { steps:[], errors:["No stack operations found.\nMake sure main() calls push(&s,N), pop(&s), peek(&s), or isEmpty(&s)."] };
  return { steps, errors:[] };
}

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
  const m=re.exec(code); if(!m)return null;
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
  return{steps:raw.map((s,ix)=>({...s,lineNum:cls[ix]??cel,codeLine:lines[cls[ix]??cel]?.trim()??"",message:buildMessage(s)})),errors:[]};
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
  const nm=["java","cpp","go","rust"];
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
    const isEx=nm.includes(lang)?(inM&&d===md+1&&!inC):(lang==="javascript")?(d===0&&!inC):true;
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
  if(lang==="c")return parseCStack(code);
  if(lang==="javascript")return runJavaScript(code);
  return parseScoped(code,lang);
}

// ── useIsMobile ───────────────────────────────────────────────────────────────
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

// ── CSS ───────────────────────────────────────────────────────────────────────
const SHARED_CSS = `
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Space+Grotesk:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

:root{
  --cyan:#60a5fa;--cyan-dim:rgba(96,165,250,0.15);--cyan-glow:rgba(96,165,250,0.45);
  --pink:#f472b6;--pink-dim:rgba(244,114,182,0.15);
  --green:#4ade80;--green-dim:rgba(74,222,128,0.15);--green-glow:rgba(74,222,128,0.4);
  --purple:#a78bfa;--yellow:#fbbf24;
  --text-primary:#d4e4f7;--text-secondary:#6b8aaa;--text-muted:#3d5470;
  --border-subtle:rgba(255,255,255,0.07);--border-medium:rgba(255,255,255,0.13);
  --surface-0:#050818;--surface-1:rgba(8,14,36,0.95);--surface-2:rgba(12,20,48,0.8);--surface-3:rgba(16,26,58,0.7);
}

@keyframes cur{0%,100%{opacity:1}50%{opacity:0}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
@keyframes rPulse{0%,100%{box-shadow:0 0 16px rgba(96,165,250,0.4)}50%{box-shadow:0 0 32px rgba(96,165,250,0.7)}}
@keyframes toastIn{0%{opacity:0;transform:translateY(8px) scale(0.94)}100%{opacity:1;transform:none}}
@keyframes blkDrop{
  0%{transform:translateY(-55px) scale(0.8);opacity:0;filter:blur(2px)}
  55%{transform:translateY(4px) scale(1.04);opacity:1;filter:blur(0)}
  75%{transform:translateY(-2px) scale(0.98)}
  100%{transform:translateY(0) scale(1);opacity:1}
}
@keyframes flyAway{
  0%{opacity:1;transform:translateX(-50%) translateY(0) scale(1) rotate(0deg)}
  30%{opacity:1}
  100%{opacity:0;transform:translateX(-50%) translateY(-90px) scale(0.45) rotate(18deg)}
}
@keyframes pkRing{0%{transform:scale(1);opacity:0.9}100%{transform:scale(1.38);opacity:0}}
@keyframes pkPulse{0%,100%{filter:brightness(1)}50%{filter:brightness(1.55) saturate(1.4)}}
@keyframes ecCheck{0%,100%{transform:scale(1)}35%{transform:scale(1.06) translateY(-4px)}68%{transform:scale(0.97) translateY(2px)}}
@keyframes pShine{0%,100%{left:-100%}55%{left:160%}}
@keyframes svSh{0%,100%{transform:none}18%{transform:translateX(-7px)}36%{transform:translateX(7px)}54%{transform:translateX(-4px)}72%{transform:translateX(4px)}}
@keyframes blobFloat{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(18px,-12px) scale(1.06)}66%{transform:translate(-10px,16px) scale(0.95)}}
@keyframes blob2{0%,100%{transform:translate(0,0) scale(1)}40%{transform:translate(-20px,10px) scale(1.08)}70%{transform:translate(14px,-18px) scale(0.93)}}
@keyframes gridScroll{0%{background-position:0 0}100%{background-position:32px 32px}}
@keyframes arrowFade{0%{opacity:0;transform:translateY(-4px)}100%{opacity:1;transform:none}}
@keyframes scanline{0%{top:-10%}100%{top:110%}}
@keyframes termSlideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}

/* ── Viz shared ── */
.sv{display:flex;flex-direction:column;flex:1;min-height:0;position:relative;overflow:hidden}
.sv-col{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;padding:12px 12px 0;position:relative;overflow:hidden}
.sv-col::before{content:'';position:absolute;inset:0;pointer-events:none;background-image:linear-gradient(rgba(96,165,250,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(96,165,250,0.05) 1px,transparent 1px);background-size:32px 32px;animation:gridScroll 10s linear infinite}
.sv-col::after{content:'';position:absolute;left:0;right:0;height:60px;pointer-events:none;z-index:0;background:linear-gradient(to bottom,transparent,rgba(96,165,250,0.025),transparent);animation:scanline 7s ease-in-out infinite}
.sv-blob{position:absolute;border-radius:50%;pointer-events:none;filter:blur(55px);mix-blend-mode:screen}
.sv-blob-1{width:180px;height:180px;top:-20px;left:-10px;background:radial-gradient(circle,rgba(59,130,246,0.14),transparent 65%);animation:blobFloat 13s ease-in-out infinite}
.sv-blob-2{width:140px;height:140px;bottom:20px;right:-10px;background:radial-gradient(circle,rgba(244,114,182,0.10),transparent 65%);animation:blob2 10s ease-in-out infinite}

/* fly-away */
.sv-fly-container{position:absolute;top:0;left:0;right:0;height:0;pointer-events:none;z-index:50}
.sv-fly{position:absolute;top:10px;left:50%;transform:translateX(-50%);border-radius:10px;display:flex;align-items:center;justify-content:center;gap:7px;border:1.5px solid rgba(255,255,255,0.25);animation:flyAway 0.82s cubic-bezier(0.22,1,0.36,1) forwards;will-change:transform,opacity;white-space:nowrap;}
.sv-fly-v{font-family:'JetBrains Mono',monospace;font-weight:700;color:#fff}
.sv-fly-tag{font-family:'JetBrains Mono',monospace;font-size:7px;color:rgba(255,255,255,0.6);letter-spacing:0.06em}

/* TOP pointer */
.sv-top-pointer{position:absolute;top:-26px;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;z-index:3;background:rgba(0,0,0,0.55);backdrop-filter:blur(4px);padding:2px 10px;border-radius:20px;border:1px solid var(--cyan);white-space:nowrap;}
.sv-top-arrow{font-size:11px;color:var(--cyan);}
.sv-top-label{font-family:'JetBrains Mono',monospace;font-size:7px;color:var(--cyan);letter-spacing:0.1em;}

/* blocks */
.sv-blocks{display:flex;flex-direction:column;align-items:center;width:100%;position:relative;z-index:2}
.sv-node-wrapper{display:flex;flex-direction:column;align-items:center;width:100%;}
.sv-block{border-radius:10px;border:1.5px solid transparent;display:flex;align-items:center;padding:0 10px;gap:7px;position:relative;overflow:hidden;transition:width 0.28s,box-shadow 0.28s,height 0.28s;cursor:default;}
.sv-block-shine{position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,0.18) 0%,transparent 52%);border-radius:inherit;pointer-events:none}
.sv-block:hover{filter:brightness(1.08)}
.sv-push{animation:blkDrop 0.5s cubic-bezier(0.34,1.56,0.64,1) both}
.sv-pr,.sv-pr2{position:absolute;inset:-4px;border-radius:14px;border:2px solid;animation:pkRing 0.75s cubic-bezier(0.22,1,0.36,1) forwards;pointer-events:none}
.sv-pr2{animation-delay:0.16s}
.sv-peek{animation:pkPulse 0.6s ease 2 both}
.sv-top{z-index:2}
.sv-ec{animation:ecCheck 0.46s ease both}
.sv-bidx{font-family:'JetBrains Mono',monospace;font-size:7px;color:rgba(255,255,255,0.35);flex-shrink:0;font-weight:600}
.sv-bval{font-family:'JetBrains Mono',monospace;font-weight:700;color:#fff;flex:1;text-align:center;text-shadow:0 2px 8px rgba(0,0,0,0.35)}
.sv-btag{font-family:'JetBrains Mono',monospace;font-size:7px;color:rgba(255,255,255,0.6);flex-shrink:0;letter-spacing:0.06em}

/* connectors */
.sv-connector{display:flex;flex-direction:column;align-items:center;animation:arrowFade 0.2s ease}
.sv-arrow-line{width:2px;background:rgba(96,165,250,0.4);box-shadow:0 0 4px rgba(96,165,250,0.3);}
.sv-arrow-head{font-size:9px;color:rgba(96,165,250,0.7);margin-top:-1px;line-height:1;}

/* null */
.sv-null{padding:2px 8px;background:rgba(0,0,0,0.3);border-radius:12px;border:1px dashed rgba(96,165,250,0.3);text-align:center;}
.sv-null-text{font-family:'JetBrains Mono',monospace;font-size:8px;color:rgba(96,165,250,0.5);letter-spacing:0.08em;}

/* empty */
.sv-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;border:1px dashed rgba(255,255,255,0.08);border-radius:12px;gap:6px;background:rgba(255,255,255,0.015);z-index:2;position:relative}
.sv-empty.sv-empty-err{border-color:rgba(248,113,113,0.3);animation:svSh 0.36s ease;background:rgba(248,113,113,0.03)}
.sv-ei{opacity:0.4}
.sv-et{font-family:'JetBrains Mono',monospace;font-size:8px;color:var(--text-muted);letter-spacing:0.08em}

/* platform */
.sv-plat{height:7px;border-radius:5px;background:linear-gradient(90deg,rgba(96,165,250,0.22),rgba(96,165,250,0.1),rgba(96,165,250,0.22));position:relative;overflow:hidden;box-shadow:0 0 14px rgba(96,165,250,0.22)}
.sv-plat-shine{position:absolute;top:0;left:-100%;width:55%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent);animation:pShine 3.5s ease-in-out infinite}
.sv-base{font-family:'JetBrains Mono',monospace;font-size:7px;color:var(--text-muted);letter-spacing:0.15em}
.sv-err .sv-empty-err{animation:svSh 0.36s ease}

::-webkit-scrollbar{width:4px;height:4px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:rgba(96,165,250,0.2);border-radius:4px}
::-webkit-scrollbar-thumb:hover{background:rgba(96,165,250,0.4)}
textarea::-webkit-scrollbar{width:4px}
`;

const DESKTOP_CSS = `
html,body{height:100%;overflow:hidden}
body{background:#050818;color:#c8d8f0;font-family:'DM Sans',sans-serif;}
@keyframes rPulse2{0%,100%{box-shadow:0 0 20px rgba(96,165,250,0.4)}50%{box-shadow:0 0 44px rgba(96,165,250,0.7),0 0 80px rgba(96,165,250,0.2)}}
@keyframes toastOut{0%{opacity:1;transform:none}100%{opacity:0;transform:translateY(-8px) scale(0.94)}}
.pg{height:100vh;display:flex;flex-direction:column;overflow:hidden;background:radial-gradient(ellipse 60% 45% at 5% 0%,rgba(59,130,246,0.10) 0%,transparent 55%),radial-gradient(ellipse 50% 40% at 95% 100%,rgba(244,114,182,0.08) 0%,transparent 52%),radial-gradient(ellipse 40% 35% at 50% 50%,rgba(167,139,250,0.04) 0%,transparent 60%),#050818}
.hd{flex-shrink:0;display:flex;align-items:center;gap:12px;padding:9px 24px;background:rgba(5,8,22,0.98);backdrop-filter:blur(20px);border-bottom:1px solid rgba(96,165,250,0.12);box-shadow:0 1px 0 rgba(96,165,250,0.06),0 4px 24px rgba(0,0,0,0.4)}
.hd-logo{width:34px;height:34px;border-radius:9px;flex-shrink:0;background:linear-gradient(135deg,#1d4ed8,#3b82f6 50%,#a78bfa);display:flex;align-items:center;justify-content:center;font-size:17px;box-shadow:0 0 20px rgba(96,165,250,0.5),0 0 40px rgba(96,165,250,0.15);animation:rPulse2 3s ease-in-out infinite}
.hd-brand{font-family:'Space Grotesk',sans-serif;font-size:16px;font-weight:800;letter-spacing:-0.4px;background:linear-gradient(90deg,#93c5fd 0%,#a78bfa 50%,#f472b6 100%);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:shimmer 4s linear infinite}
.hd-tagline{font-size:9px;color:var(--text-muted);font-family:'JetBrains Mono',monospace;margin-top:1px;letter-spacing:0.04em}
.hd-r{margin-left:auto;display:flex;align-items:center;gap:8px}
.hd-pill{font-family:'JetBrains Mono',monospace;font-size:8.5px;padding:3px 10px;border-radius:20px;letter-spacing:0.07em;white-space:nowrap;font-weight:700}
.hd-pid{font-family:'JetBrains Mono',monospace;font-size:8px;color:var(--text-muted);padding:3px 9px;border-radius:20px;border:1px solid var(--border-subtle);background:var(--surface-2)}
.hd-ds-badge{font-family:'JetBrains Mono',monospace;font-size:8px;color:var(--cyan);padding:3px 9px;border-radius:20px;border:1px solid rgba(96,165,250,0.25);background:rgba(96,165,250,0.08);letter-spacing:0.08em}
.main{flex:1;display:grid;gap:10px;padding:10px 24px;min-height:0;overflow:hidden;grid-template-columns:1fr 1fr;}
.panel{background:var(--surface-1);border:1px solid var(--border-subtle);border-radius:14px;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,255,255,0.04);min-height:0}
.ph{padding:9px 14px;border-bottom:1px solid var(--border-subtle);background:rgba(8,14,38,0.85);display:flex;align-items:center;gap:7px;flex-shrink:0}
.dot{width:9px;height:9px;border-radius:50%;transition:box-shadow 0.3s;flex-shrink:0}
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
/* desktop viz */
.sv-col{padding:14px 14px 0}
.sv-blob-1{width:200px;height:200px}
.sv-blob-2{width:160px;height:160px}
.sv-fly{width:180px;height:44px}
.sv-fly-v{font-size:15px}
.sv-empty{width:175px;height:78px}
.sv-ei{font-size:20px}
.sv-plat{width:210px;margin-top:4px}
.sv-base{margin-top:4px;margin-bottom:8px}
.toast{position:fixed;bottom:24px;right:24px;padding:8px 16px;border-radius:9px;font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:600;background:rgba(10,20,50,0.97);border:1px solid var(--border-medium);color:var(--green);box-shadow:0 8px 24px rgba(0,0,0,0.5),0 0 16px var(--green-glow);z-index:9999;animation:toastIn 0.25s ease,toastOut 0.3s ease 1.8s forwards}
`;

const MOBILE_CSS = `
html,body{height:100%;-webkit-text-size-adjust:100%;}
body{background:#050818;color:#c8d8f0;font-family:'DM Sans',sans-serif;}
.mob-pg{min-height:100vh;min-height:100dvh;display:flex;flex-direction:column;background:radial-gradient(ellipse 80% 50% at 50% 0%,rgba(59,130,246,0.12) 0%,transparent 60%),#050818;padding-top:env(safe-area-inset-top,0);}
.mob-hd{flex-shrink:0;display:flex;align-items:center;gap:10px;padding:10px 16px;background:rgba(5,8,22,0.98);backdrop-filter:blur(20px);border-bottom:1px solid rgba(96,165,250,0.12);z-index:100;position:sticky;top:0;}
.mob-logo{width:30px;height:30px;border-radius:8px;flex-shrink:0;background:linear-gradient(135deg,#1d4ed8,#3b82f6 50%,#a78bfa);display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 0 16px rgba(96,165,250,0.5);animation:rPulse 3s ease-in-out infinite;}
.mob-brand{font-family:'Space Grotesk',sans-serif;font-size:14px;font-weight:800;background:linear-gradient(90deg,#93c5fd 0%,#a78bfa 50%,#f472b6 100%);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:shimmer 4s linear infinite;}
.mob-sub{font-size:9px;color:var(--text-muted);font-family:'JetBrains Mono',monospace;margin-top:1px;}
.mob-scroll{flex:1;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;scrollbar-width:thin;scrollbar-color:rgba(96,165,250,0.15) transparent;padding-right:52px;padding-bottom:env(safe-area-inset-bottom,16px);}
.mob-scroll::-webkit-scrollbar{width:3px;}
.mob-scroll::-webkit-scrollbar-thumb{background:rgba(96,165,250,0.18);border-radius:4px;}
.mob-sec{display:flex;flex-direction:column;}
.mob-sec-label{display:flex;align-items:center;gap:8px;padding:10px 14px 6px;font-family:'JetBrains Mono',monospace;font-size:7px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:var(--text-muted);}
.mob-sec-label::after{content:'';flex:1;height:1px;background:linear-gradient(90deg,rgba(96,165,250,0.2),transparent);}
.mob-ph{padding:8px 14px;border-bottom:1px solid var(--border-subtle);background:rgba(8,14,38,0.9);display:flex;align-items:center;gap:7px;flex-shrink:0;}
.dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;}
.ptl{font-family:'JetBrains Mono',monospace;font-size:7.5px;color:var(--text-muted);text-transform:uppercase;letter-spacing:1.5px;margin-left:6px;font-weight:600;}
.mob-lb{display:flex;gap:4px;padding:8px 12px;overflow-x:auto;border-bottom:1px solid var(--border-subtle);background:rgba(6,11,30,0.8);flex-shrink:0;scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}
.mob-lb::-webkit-scrollbar{display:none;}
.mob-lt{padding:5px 12px;border-radius:6px;cursor:pointer;white-space:nowrap;font-family:'JetBrains Mono',monospace;font-size:9px;font-weight:700;border:1px solid var(--border-subtle);background:transparent;color:var(--text-muted);transition:all 0.15s;flex-shrink:0;}
.mob-lt.la{color:#e8f4ff;background:rgba(255,255,255,0.06);}
.mob-editor-wrap{background:rgba(5,8,22,0.95);border:1px solid var(--border-subtle);display:flex;flex-direction:column;height:340px;}
.mob-rr{padding:10px 12px;border-top:1px solid rgba(96,165,250,0.18);display:flex;align-items:center;gap:8px;flex-shrink:0;background:rgba(4,8,22,0.96);box-shadow:0 -4px 16px rgba(0,0,0,0.4);}
.mob-btn-run{flex:1;padding:12px 16px;border-radius:12px;background:linear-gradient(135deg,#1d4ed8,#3b82f6,#60a5fa);border:1px solid rgba(96,165,250,0.4);color:#fff;font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:700;cursor:pointer;transition:all 0.18s;box-shadow:0 0 24px rgba(96,165,250,0.35),0 4px 12px rgba(0,0,0,0.4);-webkit-tap-highlight-color:transparent;letter-spacing:0.03em;}
.mob-btn-run:active{transform:scale(0.97);box-shadow:0 0 12px rgba(96,165,250,0.2);}
.mob-btn-run.running{animation:rPulse 1.2s ease-in-out infinite;}
.mob-btn-run:disabled{opacity:0.4;cursor:not-allowed;}
.mob-btn-rst{padding:12px 14px;border-radius:12px;background:transparent;border:1px solid rgba(248,113,113,0.3);color:#f87171;font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:600;cursor:pointer;transition:all 0.16s;-webkit-tap-highlight-color:transparent;white-space:nowrap;}
.mob-btn-rst:active{background:rgba(248,113,113,0.12);}
.mob-alb{display:flex;align-items:center;gap:7px;padding:6px 14px;border-left:2px solid;min-height:30px;border-top:1px solid var(--border-subtle);flex-shrink:0;animation:fadeIn 0.18s ease;}
.mob-alb-ln{font-family:'JetBrains Mono',monospace;font-size:9px;font-weight:700;white-space:nowrap;}
.mob-alb-code{font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--text-secondary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;}
.mob-term-wrap{background:rgba(5,8,22,0.95);border:1px solid var(--border-subtle);display:flex;flex-direction:column;height:220px;}
/* Mobile viz */
.mob-viz-wrap{background:rgba(5,8,22,0.95);border:1px solid var(--border-subtle);display:flex;flex-direction:column;min-height:380px;position:relative;overflow:hidden;}
.mob-viz-wrap .sv-col{padding:12px 12px 0;justify-content:flex-end;flex:1;}
.mob-viz-wrap .sv-fly-container{position:absolute;top:0;left:0;right:0;height:0;z-index:50;pointer-events:none;}
.mob-viz-wrap .sv-fly{width:140px;height:36px;top:8px;}
.mob-viz-wrap .sv-fly-v{font-size:12px;}
.mob-viz-wrap .sv-empty{width:150px;height:68px;}
.mob-viz-wrap .sv-ei{font-size:17px;}
.mob-viz-wrap .sv-plat{width:170px;margin-top:4px;}
.toast{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);padding:9px 18px;border-radius:10px;font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:600;white-space:nowrap;background:rgba(10,20,50,0.97);border:1px solid var(--border-medium);color:var(--green);box-shadow:0 8px 24px rgba(0,0,0,0.5),0 0 16px var(--green-glow);z-index:9999;animation:toastIn 0.25s ease;}
`;

// ── Terminal ───────────────────────────────────────────────────────────────────
function Terminal({lines,sessionId,validating,currentStepIndex}){
  const bodyRef=useRef(null);
  const lineRefs=useRef({});
  useEffect(()=>{
    if(currentStepIndex===undefined||currentStepIndex===-1)return;
    lineRefs.current[currentStepIndex]?.scrollIntoView({block:"nearest",behavior:"smooth"});
  },[currentStepIndex]);
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
        {lines.map((line,i)=><TermLine key={i} line={line} isLast={i===lines.length-1&&!validating} stepIndex={line.stepIndex} currentStepIndex={currentStepIndex} lineRef={el=>lineRefs.current[line.stepIndex]=el}/>)}
        {validating&&(
          <div style={{padding:"3px 16px",display:"flex",alignItems:"center",gap:9}}>
            <span style={{display:"inline-block",width:10,height:10,borderRadius:"50%",border:"1.5px solid rgba(96,165,250,0.18)",borderTopColor:"#60a5fa",animation:"spin 0.7s linear infinite",flexShrink:0}}/>
            <span style={{color:"#3a5070",fontSize:10}}>VisuoSlayer reviewing…</span>
          </div>
        )}
      </div>
    </div>
  );
}

function TermLine({line,isLast,stepIndex,currentStepIndex,lineRef}){
  const[vis,setVis]=useState(false);
  useEffect(()=>{const t=setTimeout(()=>setVis(true),15);return()=>clearTimeout(t);},[]);
  const isActive=stepIndex!==undefined&&stepIndex===currentStepIndex&&currentStepIndex!==-1;
  if(line.type==="separator")return<div style={{margin:"5px 16px",borderTop:"1px solid rgba(255,255,255,0.05)",opacity:vis?1:0,transition:"opacity 0.12s"}}/>;
  if(line.type==="blank")return<div style={{height:6}}/>;
  if(line.type==="prompt")return(
    <div style={{padding:"2px 16px",display:"flex",alignItems:"center",gap:7,opacity:vis?1:0,transition:"opacity 0.1s"}}>
      <span style={{color:"#4ade80",userSelect:"none",flexShrink:0}}>$</span>
      <span style={{color:"#3a6090",fontSize:10,wordBreak:"break-all"}}>{line.text}</span>
    </div>
  );
  const cm={push:"#4ade80",pop:"#f472b6",peek:"#fbbf24",isEmpty:"#60a5fa",pop_error:"#f87171",peek_error:"#f87171",error:"#f87171",stderr:"#f87171",success:"#4ade80",warn:"#fbbf24",info:"#60a5fa",output:"#3a4e6a",stdout:"#4a607a"};
  const pm={error:"✗",stderr:"✗",pop_error:"✗",peek_error:"✗",success:"✓",warn:"⚠",info:"·",push:"⬇",pop:"⬆",peek:"👁",isEmpty:"∅",output:"",stdout:""};
  const c=cm[line.type]??"#3a5070";
  const pfx=pm[line.type]??"";
  return(
    <div ref={lineRef} style={{padding:"1.5px 16px",display:"flex",alignItems:"flex-start",opacity:vis?1:0,transition:"opacity 0.09s",background:isActive?"rgba(96,165,250,0.1)":"transparent",borderLeft:isActive?"2px solid #60a5fa":"2px solid transparent"}}>
      <span style={{color:c,width:18,flexShrink:0,fontSize:9,paddingTop:2}}>{pfx}</span>
      <span style={{color:c,wordBreak:"break-word",lineHeight:1.65,flex:1,fontSize:10}}>
        {line.text}
        {isLast&&<span style={{animation:"cur 1.1s step-end infinite",color:"#1e2535"}}> _</span>}
      </span>
      {line.lineNum&&<span style={{marginLeft:8,color:"#2a3a50",fontSize:8,flexShrink:0,paddingTop:3}}>:{line.lineNum}</span>}
    </div>
  );
}

// ── Code Editor ────────────────────────────────────────────────────────────────
function CodeEditor({code,setCode,step,errorLineSet,onKeyDown,taRef}){
  const lnRef=useRef(null);
  const lines=code.split("\n");
  const syncScroll=useCallback(()=>{if(taRef.current&&lnRef.current)lnRef.current.scrollTop=taRef.current.scrollTop;},[taRef]);
  useEffect(()=>{const ta=taRef.current;if(!ta)return;ta.addEventListener("scroll",syncScroll,{passive:true});return()=>ta.removeEventListener("scroll",syncScroll);},[syncScroll]);
  return(
    <div style={{flex:1,display:"flex",minHeight:0,overflow:"hidden",position:"relative"}}>
      <div ref={lnRef} style={{width:38,flexShrink:0,background:"rgba(4,7,18,0.75)",borderRight:"1px solid rgba(255,255,255,0.05)",overflowY:"hidden",overflowX:"hidden",paddingTop:14,paddingBottom:14,display:"flex",flexDirection:"column",userSelect:"none",pointerEvents:"none",scrollbarWidth:"none",msOverflowStyle:"none"}}>
        {lines.map((_,i)=>{
          const isAct=step?.lineNum===i,isErr=errorLineSet.has(i);
          return(<div key={i} style={{height:LINE_H,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"flex-end",paddingRight:7,fontFamily:"'JetBrains Mono',monospace",fontSize:9,lineHeight:1,color:isErr?"#f87171":isAct?"#60a5fa":"#2a3a54",background:isErr?"rgba(248,113,113,0.07)":isAct?"rgba(96,165,250,0.07)":"transparent",borderRadius:3,transition:"color 0.15s,background 0.15s"}}>{i+1}</div>);
        })}
      </div>
      {step&&<div style={{position:"absolute",left:38,right:0,height:LINE_H,top:14+step.lineNum*LINE_H,background:"rgba(96,165,250,0.04)",borderLeft:"2px solid rgba(96,165,250,0.4)",pointerEvents:"none",transition:"top 0.2s cubic-bezier(0.4,0,0.2,1)",zIndex:1}}/>}
      {[...errorLineSet].map(i=>(<div key={`e${i}`} style={{position:"absolute",left:38,right:0,height:LINE_H,top:14+i*LINE_H,background:"rgba(248,113,113,0.05)",borderLeft:"2px solid rgba(248,113,113,0.45)",pointerEvents:"none",zIndex:1}}/>))}
      <textarea ref={taRef} style={{flex:1,padding:"14px 12px 14px 10px",background:"transparent",border:"none",outline:"none",color:"#7ecfff",fontFamily:"'JetBrains Mono',monospace",fontSize:11,lineHeight:`${LINE_H}px`,resize:"none",caretColor:"#60a5fa",tabSize:2,whiteSpace:"pre",overflowY:"auto",overflowX:"auto",scrollbarWidth:"thin",scrollbarColor:"rgba(96,165,250,0.2) transparent",position:"relative",zIndex:2,WebkitUserSelect:"text",touchAction:"manipulation"}}
        value={code} onChange={e=>setCode(e.target.value)} onKeyDown={onKeyDown} spellCheck={false}
        placeholder="// Write your Stack implementation here..." autoCorrect="off" autoCapitalize="none" autoComplete="off"
      />
    </div>
  );
}

// ── Stack Visualizer ───────────────────────────────────────────────────────────
function StackViz({step,animKey,idle,compact}){
  const[fly,setFly]=useState(null);

  useEffect(()=>{
    if(step?.type==="pop"&&step.value!=null){
      setFly({v:step.value,key:animKey});
      const t=setTimeout(()=>setFly(null),850);
      return()=>clearTimeout(t);
    }
    if(step?.type!=="pop") setFly(null);
  },[animKey,step?.type,step?.value]);

  const stack   = step?.stack??[];
  const isPush  = step?.type==="push";
  const isPeek  = step?.type==="peek";
  const isEmpOp = step?.type==="isEmpty";
  const isErr   = step?.type==="pop_error"||step?.type==="peek_error";

  const len   = stack.length;
  const baseH = Math.max(compact?28:34, (compact?40:46)-Math.max(0,len-5)*1.5);
  const baseW = Math.max(compact?90:110,(compact?148:162)-Math.max(0,len-5)*3);
  const gap   = Math.max(2, 4-Math.max(0,len-6)*0.4);
  const nullW = Math.max(compact?75:90, baseW-20);

  // TOP = stack[last]; reverse so TOP is at index 0 (rendered first = visually top)
  const nodes = [...stack].reverse();

  return(
    <div className={`sv${isErr?" sv-err":""}`} key={isErr?`e${animKey}`:"sv"}>
      <div className="sv-col">
        <div className="sv-blob sv-blob-1"/>
        <div className="sv-blob sv-blob-2"/>

        {/* fly-away escapes via absolute container at very top of sv-col */}
        <div className="sv-fly-container">
          {fly&&(
            <div key={fly.key} className="sv-fly" style={{
              background:`linear-gradient(135deg,${col(fly.v).g1},${col(fly.v).g2})`,
              boxShadow:`0 0 36px ${col(fly.v).glow},0 0 70px ${col(fly.v).glow}40`,
            }}>
              <span className="sv-fly-v" style={{fontSize:compact?"12px":"15px"}}>{fly.v}</span>
              <span className="sv-fly-tag">↑ POP</span>
            </div>
          )}
        </div>

        {/* TOP pointer sits just above the topmost block */}
        {nodes.length>0&&(
          <div className="sv-top-pointer">
            <span className="sv-top-arrow">▼</span>
            <span className="sv-top-label">TOP</span>
          </div>
        )}

        <div className="sv-blocks" style={{gap:`${gap}px`}}>
          {nodes.length===0&&!fly?(
            <div className={`sv-empty${isErr?" sv-empty-err":""}`}>
              <div className="sv-ei">{idle?"📚":isErr?"⚠":"∅"}</div>
              <div className="sv-et">{idle?"Run code to start":isErr?"Stack underflow!":"Stack is empty"}</div>
            </div>
          ):nodes.map((v,idx)=>{
            const isTop = idx===0;
            const isNew = isTop&&isPush;
            const pk    = isTop&&isPeek;
            const ec    = isEmpOp;
            const c     = col(v);
            const nodeIndex = nodes.length-1-idx;
            const blockW = Math.max(baseW-idx*2, compact?60:70);
            return(
              <div key={`node-${v}-${idx}-${animKey}`} className="sv-node-wrapper">
                <div
                  className={["sv-block",isNew?"sv-push":"",pk?"sv-peek":"",isTop?"sv-top":"",ec?"sv-ec":""].filter(Boolean).join(" ")}
                  style={{
                    background:`linear-gradient(135deg,${c.g1},${c.g2})`,
                    boxShadow:isTop
                      ?`0 0 32px ${c.glow},0 0 64px ${c.glow}40,0 5px 18px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,255,255,0.25)`
                      :`0 2px 10px rgba(0,0,0,0.45),inset 0 1px 0 rgba(255,255,255,0.12)`,
                    borderColor:isTop?c.border:"rgba(255,255,255,0.08)",
                    width:`${blockW}px`,
                    height:`${baseH}px`,
                  }}
                >
                  <div className="sv-block-shine"/>
                  {pk&&<div className="sv-pr"  key={`r1-${animKey}`} style={{borderColor:c.border}}/>}
                  {pk&&<div className="sv-pr2" key={`r2-${animKey}`} style={{borderColor:c.border}}/>}
                  <span className="sv-bidx">[{nodeIndex}]</span>
                  <span className="sv-bval" style={{fontSize:compact?"12px":"14px"}}>{v}</span>
                  {isTop&&<span className="sv-btag">← TOP</span>}
                </div>
                {idx<nodes.length-1&&(
                  <div className="sv-connector" style={{margin:`${gap}px 0`}}>
                    <div className="sv-arrow-line" style={{height:`${gap+5}px`}}/>
                    <div className="sv-arrow-head">▼</div>
                  </div>
                )}
              </div>
            );
          })}
          {nodes.length>0&&(
            <div className="sv-null" style={{width:`${nullW}px`,marginTop:`${gap}px`}}>
              <span className="sv-null-text">NULL</span>
            </div>
          )}
        </div>

        <div className="sv-plat"><div className="sv-plat-shine"/></div>
        <p className="sv-base">▲ BASE OF STACK (tail)</p>
      </div>
    </div>
  );
}

// ── Sticky Nav ─────────────────────────────────────────────────────────────────
function StickyNav({activeSection,onNav,hasSteps,hasErrors,termLines}){
  const hasTermErr=termLines.some(l=>l.type==="error"||l.type==="stderr");
  const hasTermOk =termLines.some(l=>l.type==="success");
  const items=[
    {id:"code",     icon:"⌨", label:"Code",  dot:null},
    {id:"terminal", icon:"⬛", label:"Term",  dot:hasTermErr?"#f87171":hasTermOk?"#4ade80":null},
    {id:"viz",      icon:"📚", label:"Stack", dot:hasSteps?"#60a5fa":hasErrors?"#f87171":null},
  ];
  return(
    <div style={{position:"fixed",right:0,top:"50%",transform:"translateY(-50%)",zIndex:9000,display:"flex",flexDirection:"column",gap:0,background:"rgba(5,8,26,0.95)",border:"1px solid rgba(96,165,250,0.18)",borderRight:"none",borderRadius:"12px 0 0 12px",overflow:"hidden",boxShadow:"-4px 0 32px rgba(0,0,0,0.7),-1px 0 0 rgba(96,165,250,0.08)",backdropFilter:"blur(20px)"}}>
      <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg,transparent,#60a5fa,#a78bfa,transparent)",opacity:0.6}}/>
      {items.map((item,i)=>{
        const isActive=activeSection===item.id;
        return(
          <button key={item.id} onClick={()=>onNav(item.id)} style={{position:"relative",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4,width:48,padding:"12px 4px",border:"none",background:isActive?"linear-gradient(180deg,rgba(96,165,250,0.18),rgba(167,139,250,0.12))":"transparent",cursor:"pointer",borderBottom:i<items.length-1?"1px solid rgba(255,255,255,0.06)":"none",WebkitTapHighlightColor:"transparent",transition:"background 0.18s",borderLeft:isActive?"2px solid #60a5fa":"2px solid transparent"}}>
            {item.dot&&<span style={{position:"absolute",top:7,right:9,width:5,height:5,borderRadius:"50%",background:item.dot,boxShadow:`0 0 6px ${item.dot}`}}/>}
            {isActive&&<span style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at center,rgba(96,165,250,0.08),transparent 70%)",pointerEvents:"none"}}/>}
            <span style={{fontSize:16,opacity:isActive?1:0.4,transition:"opacity 0.15s,transform 0.15s",transform:isActive?"scale(1.1)":"scale(1)",lineHeight:1,position:"relative"}}>{item.icon}</span>
            <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:7,fontWeight:700,letterSpacing:"0.05em",textTransform:"uppercase",color:isActive?"#60a5fa":"rgba(255,255,255,0.22)",transition:"color 0.15s",position:"relative"}}>{item.label}</span>
          </button>
        );
      })}
      <div style={{position:"absolute",bottom:0,left:0,right:0,height:2,background:"linear-gradient(90deg,transparent,#f472b6,#60a5fa,transparent)",opacity:0.4}}/>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function StackDSPage(){
  const[lang,        setLang]       =useState("c");
  const[code,        setCode]       =useState(TPL.c);
  const[steps,       setSteps]      =useState([]);
  const[idx,         setIdx]        =useState(-1);
  const[error,       setError]      =useState("");
  const[playing,     setPlaying]    =useState(false);
  const[speed,       setSpeed]      =useState(1.1);
  const[animKey,     setAnimKey]    =useState(0);
  const[done,        setDone]       =useState(false);
  const[validating,  setValidating] =useState(false);
  const[aiErrors,    setAiErrors]   =useState([]);
  const[termLines,   setTermLines]  =useState([]);
  const[sessionId,   setSessionId]  =useState("");
  const[mounted,     setMounted]    =useState(false);
  const[toast,       setToast]      =useState(null);
  const[termOpen,    setTermOpen]   =useState(true);
  const[activeSection,setActiveSection]=useState("code");

  useEffect(()=>{setMounted(true);setSessionId(Math.random().toString(36).slice(2,8).toUpperCase());},[]);

  const isMobile=useIsMobile();
  const timerRef=useRef(null),taRef=useRef(null),listRef=useRef(null);
  const sectionCodeRef=useRef(null),sectionTermRef=useRef(null),sectionVizRef=useRef(null);
  const scrollContainerRef=useRef(null);

  const bump=()=>setAnimKey(k=>k+1);
  const showToast=(msg)=>{setToast(msg);setTimeout(()=>setToast(null),2200);};

  const doReset=useCallback(()=>{
    clearInterval(timerRef.current);
    setSteps([]);setIdx(-1);setError("");setPlaying(false);setDone(false);setAiErrors([]);setTermLines([]);
  },[]);

  const handleChangeLang=(l)=>{setLang(l);setCode(TPL[l]??"");doReset();};

  const buildTerm=(stps,errs,aiErrs,aiReason)=>{
    const ls=[];
    const ts=new Date().toTimeString().slice(0,8);
    ls.push({type:"output",text:`VisuoSlayer v2.1  ·  ${ts}  ·  pid:${sessionId}`});
    ls.push({type:"separator"});
    if(aiErrs.length>0){
      ls.push({type:"prompt",text:`validate --lang=${lang} --ds=stack`});ls.push({type:"blank"});
      if(aiReason)ls.push({type:"stderr",text:aiReason});
      aiErrs.forEach(e=>ls.push({type:"error",text:`  L${e.line??'?'}  ${e.message}`,lineNum:e.line}));
      ls.push({type:"blank"});ls.push({type:"error",text:"Process exited with code 1"});return ls;
    }
    if(errs.length>0){
      ls.push({type:"prompt",text:`run --lang=${lang}`});ls.push({type:"blank"});
      errs.forEach(e=>ls.push({type:"stderr",text:e}));
      ls.push({type:"blank"});ls.push({type:"error",text:"Process exited with code 1"});return ls;
    }
    if(stps.length>0){
      ls.push({type:"prompt",text:`run --lang=${lang} --ds=stack`});ls.push({type:"blank"});
      stps.forEach((s,stepIdx)=>{
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
        ls.push({type:ie?"error":s.type,text:out,lineNum:s.lineNum+1,stepIndex:stepIdx});
      });
      ls.push({type:"blank"});
      ls.push({type:"success",text:`${stps.length} op${stps.length!==1?"s":""} completed  ·  exit code 0`});
    }
    return ls;
  };

  const handleRun=async()=>{
    doReset();setValidating(true);
    const v=await validateWithVisuoSlayer(code,lang);
    setValidating(false);
    if(!v.valid){
      setAiErrors(v.errors??[]);setTermLines(buildTerm([],[],v.errors??[],v.reason??""));
      if(isMobile)scrollToSection("terminal");return;
    }
    const{steps:s,errors}=runCode(code,lang);
    if(errors.length){setError(errors.join("\n"));setTermLines(buildTerm([],errors,[],"")); if(isMobile)scrollToSection("terminal");return;}
    setSteps(s);setIdx(0);bump();setPlaying(true);setTermLines(buildTerm(s,[],[],""));
  };

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

  useEffect(()=>{
    if(!isMobile)return;
    const refs=[{id:"code",ref:sectionCodeRef},{id:"terminal",ref:sectionTermRef},{id:"viz",ref:sectionVizRef}];
    const obs=new IntersectionObserver((entries)=>{
      let best=null,bestRatio=0;
      entries.forEach(e=>{if(e.isIntersecting&&e.intersectionRatio>bestRatio){bestRatio=e.intersectionRatio;best=e.target.dataset.section;}});
      if(best)setActiveSection(best);
    },{root:scrollContainerRef.current,threshold:[0.3,0.6]});
    refs.forEach(r=>{if(r.ref.current){r.ref.current.dataset.section=r.id;obs.observe(r.ref.current);}});
    return()=>obs.disconnect();
  },[isMobile]);

  const scrollToSection=useCallback((id)=>{
    const map={code:sectionCodeRef,terminal:sectionTermRef,viz:sectionVizRef};
    map[id]?.current?.scrollIntoView({behavior:"smooth",block:"start"});
    setActiveSection(id);
  },[]);

  const onKeyDown=(e)=>{
    if(e.key!=="Tab")return;e.preventDefault();
    const s=e.target.selectionStart,en=e.target.selectionEnd;
    const nv=code.slice(0,s)+"  "+code.slice(en);setCode(nv);
    requestAnimationFrame(()=>{if(taRef.current){taRef.current.selectionStart=s+2;taRef.current.selectionEnd=s+2;}});
  };

  const step        = steps[idx]??null;
  const os          = step?(OP[step.type]??OP.push):null;
  const hasAiErrors = aiErrors.length>0;
  const idle        = steps.length===0&&!error&&!hasAiErrors;
  const lm          = LANGS[lang];
  const errorLineSet= new Set(aiErrors.map(e=>(e.line??1)-1));

  // ── MOBILE ────────────────────────────────────────────────────────────────
  if(isMobile){
    return(
      <>
        <style>{SHARED_CSS+MOBILE_CSS}</style>
        <div className="mob-pg">
          <header className="mob-hd">
            <div className="mob-logo">📚</div>
            <div style={{flex:1,minWidth:0}}>
              <div className="mob-brand">VisuoSlayer</div>
              <div className="mob-sub">Linked List Stack · Write · Run · Visualize</div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
              <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:lm.accent,background:`${lm.accent}12`,border:`1px solid ${lm.accent}28`,padding:"2px 8px",borderRadius:20,fontWeight:700}}>{lm.ext}</span>
              <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:7.5,color:"var(--text-muted)",padding:"2px 7px",borderRadius:16,border:"1px solid var(--border-subtle)",background:"var(--surface-2)"}}>{mounted?sessionId:"------"}</span>
            </div>
          </header>

          <div className="mob-scroll" ref={scrollContainerRef}>
            {/* CODE */}
            <div ref={sectionCodeRef} className="mob-sec">
              <div className="mob-sec-label"><span>⌨</span><span>01 · Code Editor</span></div>
              <div className="mob-editor-wrap">
                <div className="mob-ph">
                  <span className="dot" style={{background:"#ff5f57",boxShadow:"0 0 5px #ff5f57"}}/>
                  <span className="dot" style={{background:"#ffbd2e",boxShadow:"0 0 5px #ffbd2e"}}/>
                  <span className="dot" style={{background:"#28c840",boxShadow:"0 0 5px #28c840"}}/>
                  <span className="ptl">Code Editor</span>
                  <span style={{marginLeft:"auto",fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:lm.accent,background:`${lm.accent}10`,border:`1px solid ${lm.accent}25`,padding:"2px 8px",borderRadius:16,fontWeight:700}}>{lm.name}</span>
                </div>
                <div className="mob-lb">
                  {Object.entries(LANGS).map(([k,m])=>(
                    <button key={k} className={`mob-lt${lang===k?" la":""}`} onClick={()=>handleChangeLang(k)}
                      style={lang===k?{borderColor:`${m.accent}35`,color:m.accent,background:`${m.accent}0e`}:{}}
                    >{m.name}</button>
                  ))}
                </div>
                <div style={{flex:1,display:"flex",flexDirection:"column",minHeight:0,position:"relative"}}>
                  <CodeEditor code={code} setCode={setCode} step={step} errorLineSet={errorLineSet} onKeyDown={onKeyDown} taRef={taRef}/>
                  {step&&os&&(
                    <div className="mob-alb" style={{borderColor:os.bd,background:os.bg}}>
                      <span style={{color:os.c,fontSize:10}}>{os.icon}</span>
                      <span className="mob-alb-ln" style={{color:os.c}}>L{step.lineNum+1}</span>
                      <code className="mob-alb-code">{step.codeLine}</code>
                    </div>
                  )}
                </div>
              </div>
              <div className="mob-rr">
                <button className={`mob-btn-run${playing||validating?" running":""}`} onClick={handleRun} disabled={playing||validating}>
                  {validating?"⟳ Reviewing…":playing?"▶ Running…":"▶  Run & Visualize"}
                </button>
                {(steps.length>0||error||hasAiErrors)&&<button className="mob-btn-rst" onClick={doReset}>↺ Reset</button>}
              </div>
            </div>

            {/* TERMINAL */}
            <div ref={sectionTermRef} className="mob-sec" style={{marginTop:2}}>
              <div className="mob-sec-label"><span>⬛</span><span>02 · Terminal</span></div>
              <div className="mob-term-wrap">
                <div className="mob-ph">
                  <span className="dot" style={{background:"#ff5f57",boxShadow:"0 0 5px #ff5f57"}}/>
                  <span className="dot" style={{background:"#ffbd2e",boxShadow:"0 0 5px #ffbd2e"}}/>
                  <span className="dot" style={{background:"#28c840",boxShadow:"0 0 5px #28c840"}}/>
                  <span className="ptl">visualoslayer — bash</span>
                  <span style={{marginLeft:"auto",fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:"var(--text-muted)"}}>pid:{mounted?sessionId:"------"}</span>
                </div>
                <Terminal lines={termLines} sessionId={sessionId} validating={validating} currentStepIndex={idx}/>
              </div>
            </div>

            {/* VIZ */}
            <div ref={sectionVizRef} className="mob-sec" style={{marginTop:2}}>
              <div className="mob-sec-label"><span>📚</span><span>03 · Linked List Stack</span></div>
              <div className="mob-viz-wrap">
                <div className="mob-ph">
                  <span className="dot" style={{background:"#60a5fa",boxShadow:"0 0 5px #60a5fa"}}/>
                  <span className="dot" style={{background:"#f472b6",boxShadow:"0 0 5px #f472b6"}}/>
                  <span className="dot" style={{background:"#4ade80",boxShadow:"0 0 5px #4ade80"}}/>
                  <span className="ptl">Linked List Stack</span>
                  {steps.length>0&&<span style={{marginLeft:"auto",fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:"var(--cyan)",background:"var(--cyan-dim)",border:"1px solid rgba(96,165,250,0.25)",padding:"2px 8px",borderRadius:16,fontWeight:700}}>{idx+1} / {steps.length}</span>}
                </div>
                <StackViz step={step} animKey={animKey} idle={idle} compact={true}/>
              </div>
            </div>
            <div style={{height:24}}/>
          </div>

          <StickyNav activeSection={activeSection} onNav={scrollToSection} hasSteps={steps.length>0} hasErrors={!!error||hasAiErrors} termLines={termLines}/>
        </div>
        {toast&&<div className="toast">{toast}</div>}
      </>
    );
  }

  // ── DESKTOP ───────────────────────────────────────────────────────────────
  return(
    <>
      <style>{SHARED_CSS+DESKTOP_CSS}</style>
      <div className="pg">
        <header className="hd">
          <div className="hd-logo">📚</div>
          <div>
            <div className="hd-brand">VisuoSlayer</div>
            <div className="hd-tagline">Linked List Stack · Write · Run · Step through every operation</div>
          </div>
          <div className="hd-r">
            <div className="hd-ds-badge">LIFO STACK</div>
            <div className="hd-pill" style={{color:lm.accent,background:`${lm.accent}12`,border:`1px solid ${lm.accent}28`}}>{lm.name}</div>
            <div className="hd-pid">pid:{mounted?sessionId:"------"}</div>
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
              <span style={{marginLeft:"auto",fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:lm.accent,background:`${lm.accent}12`,border:`1px solid ${lm.accent}28`,padding:"2px 8px",borderRadius:20,fontWeight:700}}>{lm.name}</span>
            </div>
            <div style={{flex:termOpen?"0 0 58%":"1",display:"flex",flexDirection:"column",minHeight:0,borderBottom:"1px solid var(--border-subtle)"}}>
              <div className="lb">
                {Object.entries(LANGS).map(([k,m])=>(
                  <button key={k} className={`lt${lang===k?" la":""}`} onClick={()=>handleChangeLang(k)}
                    style={lang===k?{borderColor:`${m.accent}35`,color:m.accent,background:`${m.accent}0e`}:{}}
                  >{m.ext}</button>
                ))}
              </div>
              <CodeEditor code={code} setCode={setCode} step={step} errorLineSet={errorLineSet} onKeyDown={onKeyDown} taRef={taRef}/>
              {step&&os&&(
                <div className="alb" style={{borderColor:os.bd,background:os.bg}}>
                  <span style={{color:os.c,fontSize:10}}>{os.icon}</span>
                  <span className="alb-ln" style={{color:os.c}}>L{step.lineNum+1}</span>
                  <code className="alb-code">{step.codeLine}</code>
                </div>
              )}
              <div className="rr">
                <button className={`btn-run${playing||validating?" running":""}`} onClick={handleRun} disabled={playing||validating}>
                  {validating?"⟳ VisuoSlayer…":playing?"▶ Running…":"▶  Run & Visualize"}
                </button>
                {(steps.length>0||error||hasAiErrors)&&<button className="btn-rst" onClick={doReset}>↺ Reset</button>}
                <span className="rr-hint">CTRL+ENTER</span>
              </div>
            </div>

            <div className={`tm-wrap${termOpen?" tm-open":" tm-closed"}`}>
              <div className="term-body-wrap" key={termOpen?"open":"closed"}>
                <div className="term-bar">
                  <span className="dot" style={{background:"#ff5f57",boxShadow:"0 0 5px #ff5f57"}}/>
                  <span className="dot" style={{background:"#ffbd2e",boxShadow:"0 0 5px #ffbd2e"}}/>
                  <span className="dot" style={{background:"#28c840",boxShadow:"0 0 5px #28c840"}}/>
                  <span style={{marginLeft:8,fontFamily:"'JetBrains Mono',monospace",fontSize:8.5,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"1.2px",userSelect:"none"}}>visualoslayer — bash</span>
                  <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:"var(--text-muted)",marginLeft:8}}>pid:{mounted?sessionId:"------"}</span>
                  <button className="term-toggle" onClick={()=>setTermOpen(false)} title="Collapse">▾</button>
                </div>
                <Terminal lines={termLines} sessionId={sessionId} validating={validating} currentStepIndex={idx}/>
              </div>
            </div>

            {!termOpen&&(
              <div className="term-bar-closed" onClick={()=>setTermOpen(true)}>
                <span className="dot" style={{background:"#ff5f57",boxShadow:"0 0 4px #ff5f57"}}/>
                <span className="dot" style={{background:"#ffbd2e",boxShadow:"0 0 4px #ffbd2e"}}/>
                <span className="dot" style={{background:"#28c840",boxShadow:"0 0 4px #28c840"}}/>
                <span style={{marginLeft:8,fontFamily:"'JetBrains Mono',monospace",fontSize:8.5,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"1.2px"}}>visualoslayer — bash</span>
                {termLines.some(l=>l.type==="error"||l.type==="stderr")&&<span style={{marginLeft:8,fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:"#f87171",background:"rgba(248,113,113,0.1)",border:"1px solid rgba(248,113,113,0.25)",padding:"1px 7px",borderRadius:10}}>errors</span>}
                {termLines.some(l=>l.type==="success")&&<span style={{marginLeft:8,fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:"var(--green)",background:"var(--green-dim)",border:"1px solid rgba(74,222,128,0.25)",padding:"1px 7px",borderRadius:10}}>ok</span>}
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
              <span className="ptl">Linked List Stack</span>
              {steps.length>0&&(
                <span style={{marginLeft:"auto",fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:"var(--cyan)",background:"var(--cyan-dim)",border:"1px solid rgba(96,165,250,0.25)",padding:"2px 9px",borderRadius:20,fontWeight:700}}>
                  {idx+1} / {steps.length}
                </span>
              )}
            </div>
            <div style={{flex:1,display:"flex",flexDirection:"column",minHeight:0,overflow:"hidden",justifyContent:"center",alignItems:"center"}}>
              <StackViz step={step} animKey={animKey} idle={idle}/>
            </div>
          </div>
        </main>
      </div>
      {toast&&<div className="toast">{toast}</div>}
    </>
  );
}