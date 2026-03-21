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
  insertHead:   { label:"INSERT HEAD", icon:"⬅", c:"#4ade80", bg:"rgba(74,222,128,0.1)",  bd:"rgba(74,222,128,0.3)"  },
  insertTail:   { label:"INSERT TAIL", icon:"➡", c:"#60a5fa", bg:"rgba(96,165,250,0.1)",  bd:"rgba(96,165,250,0.3)"  },
  insertAt:     { label:"INSERT AT",   icon:"⬇", c:"#a78bfa", bg:"rgba(167,139,250,0.1)", bd:"rgba(167,139,250,0.3)" },
  deleteHead:   { label:"DELETE HEAD", icon:"⬆", c:"#f472b6", bg:"rgba(244,114,182,0.1)", bd:"rgba(244,114,182,0.3)" },
  deleteTail:   { label:"DELETE TAIL", icon:"↩", c:"#fb923c", bg:"rgba(251,146,60,0.1)",  bd:"rgba(251,146,60,0.3)"  },
  deleteVal:    { label:"DELETE VAL",  icon:"✕", c:"#ef4444", bg:"rgba(239,68,68,0.1)",   bd:"rgba(239,68,68,0.3)"   },
  search:       { label:"SEARCH",      icon:"🔍", c:"#fbbf24", bg:"rgba(251,191,36,0.1)",  bd:"rgba(251,191,36,0.3)"  },
  traverse:     { label:"TRAVERSE",    icon:"→", c:"#34d399", bg:"rgba(52,211,153,0.1)",  bd:"rgba(52,211,153,0.3)"  },
  isEmpty:      { label:"IS EMPTY?",   icon:"∅", c:"#60a5fa", bg:"rgba(96,165,250,0.1)",  bd:"rgba(96,165,250,0.3)"  },
  getSize:      { label:"GET SIZE",    icon:"#", c:"#a78bfa", bg:"rgba(167,139,250,0.1)", bd:"rgba(167,139,250,0.3)" },
  delete_error: { label:"NOT FOUND",   icon:"⚠", c:"#ef4444", bg:"rgba(239,68,68,0.1)",   bd:"rgba(239,68,68,0.3)"   },
  search_miss:  { label:"NOT FOUND",   icon:"⚠", c:"#ef4444", bg:"rgba(239,68,68,0.1)",   bd:"rgba(239,68,68,0.3)"   },
  empty_error:  { label:"EMPTY",       icon:"⚠", c:"#ef4444", bg:"rgba(239,68,68,0.1)",   bd:"rgba(239,68,68,0.3)"   },
};

const LANGS = {
  javascript:{ name:"JavaScript", ext:"JS",  accent:"#f7df1e" },
  typescript:{ name:"TypeScript", ext:"TS",  accent:"#3178c6" },
  python:    { name:"Python",     ext:"PY",  accent:"#4ec9b0" },
  java:      { name:"Java",       ext:"JV",  accent:"#ed8b00" },
  cpp:       { name:"C++",        ext:"C++", accent:"#00b4d8" },
  csharp:    { name:"C#",         ext:"C#",  accent:"#9b4f96" },
};

// ══════════════════════════════════════════════════════════════════════════════
// CODE TEMPLATES
// ══════════════════════════════════════════════════════════════════════════════
const TPL = {
javascript:`// ─── Singly Linked List — JavaScript ───────────────────
class Node {
  constructor(value) {
    this.value = value;
    this.next  = null;
  }
}

class LinkedList {
  constructor() {
    this.head = null;
    this.size = 0;
  }

  insertHead(value) {
    const node = new Node(value);
    node.next  = this.head;
    this.head  = node;
    this.size++;
  }

  insertTail(value) {
    const node = new Node(value);
    if (!this.head) { this.head = node; this.size++; return; }
    let cur = this.head;
    while (cur.next) cur = cur.next;
    cur.next = node;
    this.size++;
  }

  insertAt(index, value) {
    if (index <= 0) { this.insertHead(value); return; }
    const node = new Node(value);
    let cur = this.head, i = 0;
    while (cur && i < index - 1) { cur = cur.next; i++; }
    if (!cur) { this.insertTail(value); return; }
    node.next = cur.next;
    cur.next  = node;
    this.size++;
  }

  deleteHead() {
    if (!this.head) return undefined;
    const val = this.head.value;
    this.head  = this.head.next;
    this.size--;
    return val;
  }

  deleteTail() {
    if (!this.head) return undefined;
    if (!this.head.next) {
      const v = this.head.value;
      this.head = null; this.size--;
      return v;
    }
    let cur = this.head;
    while (cur.next.next) cur = cur.next;
    const val = cur.next.value;
    cur.next  = null;
    this.size--;
    return val;
  }

  delete(value) {
    if (!this.head) return false;
    if (this.head.value === value) {
      this.head = this.head.next; this.size--; return true;
    }
    let cur = this.head;
    while (cur.next) {
      if (cur.next.value === value) {
        cur.next = cur.next.next; this.size--; return true;
      }
      cur = cur.next;
    }
    return false;
  }

  search(value) {
    let cur = this.head, idx = 0;
    while (cur) {
      if (cur.value === value) return idx;
      cur = cur.next; idx++;
    }
    return -1;
  }

  traverse() {
    const result = [];
    let cur = this.head;
    while (cur) { result.push(cur.value); cur = cur.next; }
    return result;
  }

  isEmpty()  { return this.size === 0; }
  getSize()  { return this.size; }
}

// ─── Use your list below ─────────────────────────────
const ll = new LinkedList();
ll.insertTail(10);
ll.insertTail(25);
ll.insertTail(37);
ll.insertHead(5);
ll.insertAt(2, 99);
ll.search(25);
ll.traverse();
ll.deleteHead();
ll.deleteTail();
ll.delete(99);
ll.getSize();
ll.isEmpty();`,

typescript:`// ─── Singly Linked List — TypeScript ────────────────────
class Node<T> {
  value: T;
  next: Node<T> | null = null;
  constructor(value: T) { this.value = value; }
}

class LinkedList<T> {
  head: Node<T> | null = null;
  size: number = 0;

  insertHead(value: T): void {
    const node = new Node(value);
    node.next = this.head;
    this.head = node;
    this.size++;
  }

  insertTail(value: T): void {
    const node = new Node(value);
    if (!this.head) { this.head = node; this.size++; return; }
    let cur = this.head;
    while (cur.next) cur = cur.next;
    cur.next = node;
    this.size++;
  }

  insertAt(index: number, value: T): void {
    if (index <= 0) { this.insertHead(value); return; }
    const node = new Node(value);
    let cur = this.head; let i = 0;
    while (cur && i < index - 1) { cur = cur.next; i++; }
    if (!cur) { this.insertTail(value); return; }
    node.next = cur.next;
    cur.next  = node;
    this.size++;
  }

  deleteHead(): T | undefined {
    if (!this.head) return undefined;
    const val = this.head.value;
    this.head = this.head.next;
    this.size--;
    return val;
  }

  deleteTail(): T | undefined {
    if (!this.head) return undefined;
    if (!this.head.next) {
      const v = this.head.value; this.head = null; this.size--; return v;
    }
    let cur = this.head;
    while (cur.next!.next) cur = cur.next!;
    const val = cur.next!.value;
    cur.next = null;
    this.size--;
    return val;
  }

  delete(value: T): boolean {
    if (!this.head) return false;
    if (this.head.value === value) {
      this.head = this.head.next; this.size--; return true;
    }
    let cur = this.head;
    while (cur.next) {
      if (cur.next.value === value) {
        cur.next = cur.next.next; this.size--; return true;
      }
      cur = cur.next;
    }
    return false;
  }

  search(value: T): number {
    let cur = this.head; let idx = 0;
    while (cur) {
      if (cur.value === value) return idx;
      cur = cur.next; idx++;
    }
    return -1;
  }

  traverse(): T[] {
    const result: T[] = [];
    let cur = this.head;
    while (cur) { result.push(cur.value); cur = cur.next; }
    return result;
  }

  isEmpty(): boolean { return this.size === 0; }
  getSize(): number  { return this.size; }
}

// ─── Use your list below ─────────────────────────────
const ll = new LinkedList<number>();
ll.insertTail(10);
ll.insertTail(25);
ll.insertTail(37);
ll.insertHead(5);
ll.search(25);
ll.traverse();
ll.deleteHead();
ll.deleteTail();
ll.getSize();`,

python:`# ─── Singly Linked List — Python ─────────────────────
class Node:
    def __init__(self, value):
        self.value = value
        self.next  = None

class LinkedList:
    def __init__(self):
        self.head  = None
        self._size = 0

    def insert_head(self, value):
        node      = Node(value)
        node.next = self.head
        self.head = node
        self._size += 1

    def insert_tail(self, value):
        node = Node(value)
        if not self.head:
            self.head = node; self._size += 1; return
        cur = self.head
        while cur.next: cur = cur.next
        cur.next = node
        self._size += 1

    def insert_at(self, index, value):
        if index <= 0:
            self.insert_head(value); return
        node = Node(value)
        cur = self.head; i = 0
        while cur and i < index - 1: cur = cur.next; i += 1
        if not cur:
            self.insert_tail(value); return
        node.next = cur.next
        cur.next  = node
        self._size += 1

    def delete_head(self):
        if not self.head: return None
        val       = self.head.value
        self.head = self.head.next
        self._size -= 1
        return val

    def delete_tail(self):
        if not self.head: return None
        if not self.head.next:
            val = self.head.value; self.head = None; self._size -= 1; return val
        cur = self.head
        while cur.next.next: cur = cur.next
        val = cur.next.value; cur.next = None; self._size -= 1; return val

    def delete(self, value):
        if not self.head: return False
        if self.head.value == value:
            self.head = self.head.next; self._size -= 1; return True
        cur = self.head
        while cur.next:
            if cur.next.value == value:
                cur.next = cur.next.next; self._size -= 1; return True
            cur = cur.next
        return False

    def search(self, value):
        cur = self.head; idx = 0
        while cur:
            if cur.value == value: return idx
            cur = cur.next; idx += 1
        return -1

    def traverse(self):
        result = []; cur = self.head
        while cur: result.append(cur.value); cur = cur.next
        return result

    def is_empty(self):  return self._size == 0
    def get_size(self):  return self._size

# ─── Use your list below ─────────────────────────────
ll = LinkedList()
ll.insert_tail(10)
ll.insert_tail(25)
ll.insert_tail(37)
ll.insert_head(5)
ll.insert_at(2, 99)
ll.search(25)
ll.traverse()
ll.delete_head()
ll.delete_tail()
ll.delete(99)
ll.get_size()
ll.is_empty()`,

java:`// ─── Singly Linked List — Java ──────────────────────────
public class Main {
    static class Node {
        int  value;
        Node next;
        Node(int value) { this.value = value; }
    }

    static class LinkedList {
        Node head = null;
        int  size = 0;

        void insertHead(int value) {
            Node node = new Node(value);
            node.next = head; head = node; size++;
        }

        void insertTail(int value) {
            Node node = new Node(value);
            if (head == null) { head = node; size++; return; }
            Node cur = head;
            while (cur.next != null) cur = cur.next;
            cur.next = node; size++;
        }

        void insertAt(int index, int value) {
            if (index <= 0) { insertHead(value); return; }
            Node node = new Node(value);
            Node cur = head; int i = 0;
            while (cur != null && i < index - 1) { cur = cur.next; i++; }
            if (cur == null) { insertTail(value); return; }
            node.next = cur.next; cur.next = node; size++;
        }

        int deleteHead() {
            if (head == null) return -1;
            int val = head.value; head = head.next; size--; return val;
        }

        int deleteTail() {
            if (head == null) return -1;
            if (head.next == null) { int v = head.value; head = null; size--; return v; }
            Node cur = head;
            while (cur.next.next != null) cur = cur.next;
            int val = cur.next.value; cur.next = null; size--; return val;
        }

        boolean delete(int value) {
            if (head == null) return false;
            if (head.value == value) { head = head.next; size--; return true; }
            Node cur = head;
            while (cur.next != null) {
                if (cur.next.value == value) { cur.next = cur.next.next; size--; return true; }
                cur = cur.next;
            }
            return false;
        }

        int search(int value) {
            Node cur = head; int idx = 0;
            while (cur != null) {
                if (cur.value == value) return idx;
                cur = cur.next; idx++;
            }
            return -1;
        }

        boolean isEmpty() { return size == 0; }
        int     getSize() { return size; }
    }

    public static void main(String[] args) {
        LinkedList ll = new LinkedList();
        ll.insertTail(10);
        ll.insertTail(25);
        ll.insertTail(37);
        ll.insertHead(5);
        ll.search(25);
        ll.deleteHead();
        ll.deleteTail();
        ll.delete(25);
        ll.getSize();
        ll.isEmpty();
    }
}`,

cpp:`// ─── Singly Linked List — C++ ────────────────────────────
#include <iostream>
#include <vector>
using namespace std;

struct Node {
    int   value;
    Node* next;
    Node(int v) : value(v), next(nullptr) {}
};

class LinkedList {
public:
    Node* head;
    int   sz;
    LinkedList() : head(nullptr), sz(0) {}

    void insertHead(int value) {
        Node* node = new Node(value);
        node->next = head; head = node; sz++;
    }

    void insertTail(int value) {
        Node* node = new Node(value);
        if (!head) { head = node; sz++; return; }
        Node* cur = head;
        while (cur->next) cur = cur->next;
        cur->next = node; sz++;
    }

    void insertAt(int index, int value) {
        if (index <= 0) { insertHead(value); return; }
        Node* node = new Node(value);
        Node* cur = head; int i = 0;
        while (cur && i < index - 1) { cur = cur->next; i++; }
        if (!cur) { insertTail(value); return; }
        node->next = cur->next; cur->next = node; sz++;
    }

    int deleteHead() {
        if (!head) return -1;
        int val = head->value;
        Node* tmp = head; head = head->next;
        delete tmp; sz--; return val;
    }

    int deleteTail() {
        if (!head) return -1;
        if (!head->next) {
            int v = head->value; delete head; head = nullptr; sz--; return v;
        }
        Node* cur = head;
        while (cur->next->next) cur = cur->next;
        int val = cur->next->value;
        delete cur->next; cur->next = nullptr; sz--; return val;
    }

    bool deleteVal(int value) {
        if (!head) return false;
        if (head->value == value) {
            Node* tmp = head; head = head->next; delete tmp; sz--; return true;
        }
        Node* cur = head;
        while (cur->next) {
            if (cur->next->value == value) {
                Node* tmp = cur->next;
                cur->next = cur->next->next;
                delete tmp; sz--; return true;
            }
            cur = cur->next;
        }
        return false;
    }

    int  search(int value) {
        Node* cur = head; int idx = 0;
        while (cur) {
            if (cur->value == value) return idx;
            cur = cur->next; idx++;
        }
        return -1;
    }

    bool isEmpty() { return sz == 0; }
    int  getSize() { return sz; }
};

int main() {
    LinkedList ll;
    ll.insertTail(10);
    ll.insertTail(25);
    ll.insertTail(37);
    ll.insertHead(5);
    ll.search(25);
    ll.deleteHead();
    ll.deleteTail();
    ll.deleteVal(25);
    ll.getSize();
    ll.isEmpty();
    return 0;
}`,

csharp:`// ─── Singly Linked List — C# ─────────────────────────────
using System;
using System.Collections.Generic;

class Program {
    class Node {
        public int  Value;
        public Node Next;
        public Node(int value) { Value = value; }
    }

    class LinkedList {
        public Node Head = null;
        public int  Size = 0;

        public void InsertHead(int value) {
            Node node = new Node(value);
            node.Next = Head; Head = node; Size++;
        }

        public void InsertTail(int value) {
            Node node = new Node(value);
            if (Head == null) { Head = node; Size++; return; }
            Node cur = Head;
            while (cur.Next != null) cur = cur.Next;
            cur.Next = node; Size++;
        }

        public void InsertAt(int index, int value) {
            if (index <= 0) { InsertHead(value); return; }
            Node node = new Node(value);
            Node cur = Head; int i = 0;
            while (cur != null && i < index - 1) { cur = cur.Next; i++; }
            if (cur == null) { InsertTail(value); return; }
            node.Next = cur.Next; cur.Next = node; Size++;
        }

        public int DeleteHead() {
            if (Head == null) return -1;
            int val = Head.Value; Head = Head.Next; Size--; return val;
        }

        public int DeleteTail() {
            if (Head == null) return -1;
            if (Head.Next == null) { int v = Head.Value; Head = null; Size--; return v; }
            Node cur = Head;
            while (cur.Next.Next != null) cur = cur.Next;
            int val = cur.Next.Value; cur.Next = null; Size--; return val;
        }

        public bool Delete(int value) {
            if (Head == null) return false;
            if (Head.Value == value) { Head = Head.Next; Size--; return true; }
            Node cur = Head;
            while (cur.Next != null) {
                if (cur.Next.Value == value) { cur.Next = cur.Next.Next; Size--; return true; }
                cur = cur.Next;
            }
            return false;
        }

        public int Search(int value) {
            Node cur = Head; int idx = 0;
            while (cur != null) {
                if (cur.Value == value) return idx;
                cur = cur.Next; idx++;
            }
            return -1;
        }

        public bool IsEmpty() { return Size == 0; }
        public int  GetSize() { return Size; }
    }

    static void Main() {
        LinkedList ll = new LinkedList();
        ll.InsertTail(10);
        ll.InsertTail(25);
        ll.InsertTail(37);
        ll.InsertHead(5);
        ll.Search(25);
        ll.DeleteHead();
        ll.DeleteTail();
        ll.Delete(25);
        ll.GetSize();
        ll.IsEmpty();
    }
}`,
};

// ══════════════════════════════════════════════════════════════════════════════
// BRACE / INDENT UTILITIES
// ══════════════════════════════════════════════════════════════════════════════
function countBraces(line) {
  let opens=0, closes=0, inStr=false, strChar="";
  const ci = line.indexOf("//");
  const cleaned = ci>=0 ? line.slice(0,ci) : line;
  for (let i=0;i<cleaned.length;i++) {
    const ch=cleaned[i];
    if (!inStr&&(ch==='"'||ch==="'"||ch==="`")){inStr=true;strChar=ch;continue;}
    if (inStr&&ch===strChar&&cleaned[i-1]!=="\\"){inStr=false;continue;}
    if (!inStr){if(ch==="{")opens++;else if(ch==="}") closes++;}
  }
  return {opens,closes};
}
function extractClassBlock(code, className) {
  const re = new RegExp(`\\bclass\\s+${className}(?:\\s+[^{]*)?\\{`);
  const match = re.exec(code);
  if (!match) return null;
  let depth=1, i=match.index+match[0].length;
  while (i<code.length&&depth>0){if(code[i]==="{")depth++;else if(code[i]==="}") depth--;i++;}
  return {text:code.slice(match.index,i),start:match.index,end:i};
}

// ══════════════════════════════════════════════════════════════════════════════
// JAVASCRIPT/TYPESCRIPT REAL EXECUTION ENGINE
// ══════════════════════════════════════════════════════════════════════════════
function runJavaScript(code) {
  const classMatches = [...code.matchAll(/\bclass\s+(\w+)/g)];
  if (!classMatches.length) return {steps:[],errors:["No class definition found."],termLines:[]};

  const llClass  = classMatches.find(m=>/list/i.test(m[1])) ?? classMatches[classMatches.length-1];
  const className = llClass[1];
  const nodeClass = classMatches.find(m=>/node/i.test(m[1]));
  const nodeName  = nodeClass?.[1] ?? "Node";

  let execCode = code;
  const toRemove = [...classMatches].reverse();
  for (const m of toRemove) {
    const block = extractClassBlock(execCode, m[1]);
    if (block) execCode = execCode.slice(0,block.start)+"\n"+execCode.slice(block.end);
  }

  const instrumented = `"use strict";
const __S=[]; const __T=[];
class ${nodeName}{constructor(v){this.value=v;this.next=null;}}
class ${className}{
  constructor(){this.head=null;this._size=0;}
  get size(){return this._size;}
  _toArr(){const a=[];let c=this.head;while(c){a.push(c.value);c=c.next;}return a;}
  insertHead(value){
    const node=new ${nodeName}(value);node.next=this.head;this.head=node;this._size++;
    __S.push({type:"insertHead",value,nodes:this._toArr(),highlighted:0});
    __T.push({kind:"success",text:\`insertHead(\${value})  →  added \${value} at HEAD  [size: \${this._size}]\`,op:"insertHead",val:value,size:this._size});
  }
  insertTail(value){
    const node=new ${nodeName}(value);
    if(!this.head){this.head=node;this._size++;__S.push({type:"insertTail",value,nodes:this._toArr(),highlighted:0});__T.push({kind:"success",text:\`insertTail(\${value})  →  added \${value} at TAIL  [size: \${this._size}]\`,op:"insertTail",val:value,size:this._size});return;}
    let cur=this.head;while(cur.next)cur=cur.next;cur.next=node;this._size++;
    __S.push({type:"insertTail",value,nodes:this._toArr(),highlighted:this._size-1});
    __T.push({kind:"success",text:\`insertTail(\${value})  →  added \${value} at TAIL  [size: \${this._size}]\`,op:"insertTail",val:value,size:this._size});
  }
  insertAt(index,value){
    const ci=Math.max(0,Math.min(index,this._size));
    if(ci<=0){this.insertHead(value);return;}
    if(ci>=this._size){this.insertTail(value);return;}
    const node=new ${nodeName}(value);let cur=this.head,i=0;
    while(cur&&i<ci-1){cur=cur.next;i++;}
    node.next=cur.next;cur.next=node;this._size++;
    __S.push({type:"insertAt",value,index:ci,nodes:this._toArr(),highlighted:ci});
    __T.push({kind:"success",text:\`insertAt(\${ci}, \${value})  →  inserted \${value} at index \${ci}  [size: \${this._size}]\`,op:"insertAt",val:value,size:this._size});
  }
  deleteHead(){
    if(!this.head){__S.push({type:"empty_error",value:null,nodes:[],highlighted:-1});__T.push({kind:"error",text:"deleteHead()  →  ✗ List is empty! Nothing to delete.",op:"deleteHead",size:0});return undefined;}
    const val=this.head.value;this.head=this.head.next;this._size--;
    __S.push({type:"deleteHead",value:val,nodes:this._toArr(),highlighted:-1});
    __T.push({kind:"warn",text:\`deleteHead()  →  removed \${val} from HEAD  [size: \${this._size}]\`,op:"deleteHead",val,size:this._size});
    return val;
  }
  deleteTail(){
    if(!this.head){__S.push({type:"empty_error",value:null,nodes:[],highlighted:-1});__T.push({kind:"error",text:"deleteTail()  →  ✗ List is empty! Nothing to delete.",op:"deleteTail",size:0});return undefined;}
    if(!this.head.next){const v=this.head.value;this.head=null;this._size--;__S.push({type:"deleteTail",value:v,nodes:[],highlighted:-1});__T.push({kind:"warn",text:\`deleteTail()  →  removed \${v} from TAIL  [size: \${this._size}]\`,op:"deleteTail",val:v,size:this._size});return v;}
    let cur=this.head;while(cur.next.next)cur=cur.next;
    const val=cur.next.value;cur.next=null;this._size--;
    __S.push({type:"deleteTail",value:val,nodes:this._toArr(),highlighted:this._size-1});
    __T.push({kind:"warn",text:\`deleteTail()  →  removed \${val} from TAIL  [size: \${this._size}]\`,op:"deleteTail",val,size:this._size});
    return val;
  }
  delete(value){
    if(!this.head){__S.push({type:"delete_error",value,nodes:[],highlighted:-1});__T.push({kind:"error",text:\`delete(\${value})  →  ✗ List is empty!\`,op:"delete",size:0});return false;}
    if(this.head.value===value){this.head=this.head.next;this._size--;__S.push({type:"deleteVal",value,nodes:this._toArr(),highlighted:-1});__T.push({kind:"warn",text:\`delete(\${value})  →  node removed  [size: \${this._size}]\`,op:"delete",val:value,size:this._size});return true;}
    let cur=this.head;
    while(cur.next){if(cur.next.value===value){cur.next=cur.next.next;this._size--;__S.push({type:"deleteVal",value,nodes:this._toArr(),highlighted:-1});__T.push({kind:"warn",text:\`delete(\${value})  →  node removed  [size: \${this._size}]\`,op:"delete",val:value,size:this._size});return true;}cur=cur.next;}
    __S.push({type:"delete_error",value,nodes:this._toArr(),highlighted:-1});
    __T.push({kind:"error",text:\`delete(\${value})  →  ✗ Value \${value} not found in list!\`,op:"delete",size:this._size});
    return false;
  }
  search(value){
    let cur=this.head,idx=0;
    while(cur){if(cur.value===value){__S.push({type:"search",value,result:idx,nodes:this._toArr(),highlighted:idx});__T.push({kind:"info",text:\`search(\${value})  →  found at index \${idx}  ✓\`,op:"search",val:value,result:idx,size:this._size});return idx;}cur=cur.next;idx++;}
    __S.push({type:"search_miss",value,result:-1,nodes:this._toArr(),highlighted:-1});
    __T.push({kind:"error",text:\`search(\${value})  →  ✗ Value \${value} not found (-1)\`,op:"search",size:this._size});
    return -1;
  }
  traverse(){
    const arr=this._toArr();
    __S.push({type:"traverse",nodes:arr,highlighted:-2});
    __T.push({kind:"info",text:\`traverse()  →  [\${arr.join(" → ")}]  (\${arr.length} nodes)\`,op:"traverse",size:arr.length});
    return arr;
  }
  isEmpty(){
    const e=this._size===0;
    __S.push({type:"isEmpty",result:e,nodes:this._toArr(),highlighted:-1});
    __T.push({kind:"info",text:\`isEmpty()  →  \${e}  (\${this._size} node\${this._size!==1?"s":""})\`,op:"isEmpty",result:e,size:this._size});
    return e;
  }
  getSize(){
    __S.push({type:"getSize",result:this._size,nodes:this._toArr(),highlighted:-1});
    __T.push({kind:"info",text:\`getSize()  →  \${this._size}\`,op:"getSize",result:this._size,size:this._size});
    return this._size;
  }
  prepend(v){return this.insertHead(v);}
  append(v){return this.insertTail(v);}
  push(v){return this.insertTail(v);}
  unshift(v){return this.insertHead(v);}
  pop(){return this.deleteTail();}
  shift(){return this.deleteHead();}
  remove(v){return this.delete(v);}
  find(v){return this.search(v);}
}
${execCode}
return {steps:__S,termLines:__T};`.trim();

  let result;
  try {
    const stub={log:()=>{},warn:()=>{},error:()=>{},info:()=>{}};
    // eslint-disable-next-line no-new-func
    result = new Function("console",instrumented)(stub);
  } catch(e) {
    return {steps:[],errors:[e.message],termLines:[{kind:"error",text:`Runtime Error: ${e.message}`}]};
  }

  const {steps:rawSteps=[],termLines=[]} = result??{};
  if (!rawSteps.length) return {steps:[],errors:["No list operations executed.\nCall insertHead(), insertTail(), deleteHead(), search(), etc."],termLines};

  const lines = code.split("\n");
  const allBlocks = [...classMatches];
  let maxClassEnd=0;
  for (const m of allBlocks){const block=extractClassBlock(code,m[1]);if(block&&block.end>maxClassEnd)maxClassEnd=block.end;}
  let classEndLine=0,charCursor=0;
  for(let i=0;i<lines.length;i++){if(charCursor>=maxClassEnd){classEndLine=i;break;}charCursor+=lines[i].length+1;}
  const callLineNums=[];
  const opRe=/\.(insertHead|insertTail|insertAt|deleteHead|deleteTail|delete|remove|search|find|traverse|isEmpty|is_empty|getSize|get_size|push|pop|unshift|shift|prepend|append)\s*\(/;
  for(let i=classEndLine;i<lines.length;i++){const t=lines[i].trim();if(t.startsWith("//")||t.startsWith("*")||t.startsWith("/*"))continue;if(opRe.test(t))callLineNums.push(i);}

  const steps=rawSteps.map((s,i)=>({
    ...s,
    lineNum:  callLineNums[i]??classEndLine,
    codeLine: lines[callLineNums[i]??classEndLine]?.trim()??"",
    message:  buildMessage(s),
  }));
  return {steps,errors:[],termLines};
}

// ══════════════════════════════════════════════════════════════════════════════
// SCOPE-AWARE PARSER  (Python, Java, C++, C#)
// ══════════════════════════════════════════════════════════════════════════════
function parseScoped(code,lang){
  if(lang==="python") return parsePython(code);
  return parseBraced(code,lang);
}
function parsePython(code){
  const lines=code.split("\n"),execLines=[];
  for(let i=0;i<lines.length;i++){
    const line=lines[i],trimmed=line.trim();
    if(!trimmed||trimmed.startsWith("#")) continue;
    const indent=line.match(/^(\s*)/)?.[1]?.length??0;
    if(indent===0&&!trimmed.startsWith("class ")&&!trimmed.startsWith("def ")&&
       !trimmed.startsWith("import ")&&!trimmed.startsWith("from ")&&!trimmed.startsWith("if __name__"))
      execLines.push({lineIdx:i,line:trimmed});
  }
  return simulateOps(execLines,code.split("\n"),lang);
}
function parseBraced(code,lang){
  const lines=code.split("\n"),execLines=[];
  let depth=0,inClass=false,classDepth=-1,inMain=false,mainDepth=-1,mlComment=false;
  const needsMain=["java","cpp","csharp"];
  for(let i=0;i<lines.length;i++){
    const line=lines[i],trimmed=line.trim();
    if(mlComment){if(trimmed.includes("*/")) mlComment=false;continue;}
    if(trimmed.startsWith("/*")){mlComment=true;continue;}
    if(trimmed.startsWith("//")||trimmed.startsWith("*")||trimmed.startsWith("#")||!trimmed) continue;
    const{opens,closes}=countBraces(line);
    const depthBefore=depth;depth+=opens-closes;
    if(/\bclass\s+\w+/.test(trimmed)){inClass=true;classDepth=depthBefore;}
    if(needsMain.includes(lang)&&/\bmain\s*\(/.test(trimmed)){inMain=true;mainDepth=depthBefore;}
    if(inClass&&depth<=classDepth){inClass=false;classDepth=-1;}
    if(inMain&&depth<=mainDepth){inMain=false;mainDepth=-1;}
    const isExec=needsMain.includes(lang)?(inMain&&depth===mainDepth+1&&!inClass):(depth===0&&!inClass);
    if(isExec) execLines.push({lineIdx:i,line:trimmed});
  }
  return simulateOps(execLines,lines,lang);
}

function simulateOps(execLines,allLines,lang){
  const steps=[],errors=[],termLines=[],list=[];
  const INS_HEAD=/\.(?:insertHead|prepend|unshift|insert_head|InsertHead)\s*\(\s*(-?[\d.]+)\s*\)/;
  const INS_TAIL=/\.(?:insertTail|append|push|insert_tail|InsertTail)\s*\(\s*(-?[\d.]+)\s*\)/;
  const INS_AT  =/\.(?:insertAt|insert_at|InsertAt)\s*\(\s*(\d+)\s*,\s*(-?[\d.]+)\s*\)/;
  const DEL_HEAD=/\.(?:deleteHead|shift|delete_head|DeleteHead)\s*\(\s*\)/;
  const DEL_TAIL=/\.(?:deleteTail|pop|delete_tail|DeleteTail)\s*\(\s*\)/;
  const DEL_VAL =/\.(?:delete|remove|deleteVal|delete_val|Delete|Remove)\s*\(\s*(-?[\d.]+)\s*\)/;
  const SEARCH  =/\.(?:search|find|indexOf|index_of|Search|Find)\s*\(\s*(-?[\d.]+)\s*\)/;
  const TRAVERSE=/\.(?:traverse|toArray|to_list|print|display|toList|Traverse)\s*\(\s*\)/;
  const ISEMPTY =/\.(?:isEmpty|IsEmpty|is_empty|empty|Empty)\s*\(\s*\)/;
  const GETSIZE =/\.(?:getSize|GetSize|get_size|length|size|count|GetSize|Size)\s*\(\s*\)/;

  for(const{lineIdx,line}of execLines){
    const orig=allLines[lineIdx]?.trim()??line;
    let m;
    const push=(s)=>steps.push({...s,lineNum:lineIdx,codeLine:orig,message:buildMessage(s)});
    const term=(t)=>termLines.push(t);

    if((m=line.match(INS_HEAD))){
      const v=parseFloat(m[1]);list.unshift(v);
      push({type:"insertHead",value:v,nodes:[...list],highlighted:0});
      term({kind:"success",text:`insertHead(${v})  →  added ${v} at HEAD  [size: ${list.length}]`,op:"insertHead",val:v,size:list.length});continue;
    }
    if((m=line.match(INS_TAIL))){
      const v=parseFloat(m[1]);list.push(v);
      push({type:"insertTail",value:v,nodes:[...list],highlighted:list.length-1});
      term({kind:"success",text:`insertTail(${v})  →  added ${v} at TAIL  [size: ${list.length}]`,op:"insertTail",val:v,size:list.length});continue;
    }
    if((m=line.match(INS_AT))){
      const idx=parseInt(m[1]),v=parseFloat(m[2]),ci=Math.max(0,Math.min(idx,list.length));
      list.splice(ci,0,v);
      push({type:"insertAt",value:v,index:ci,nodes:[...list],highlighted:ci});
      term({kind:"success",text:`insertAt(${ci}, ${v})  →  inserted ${v} at index ${ci}  [size: ${list.length}]`,op:"insertAt",val:v,size:list.length});continue;
    }
    if(DEL_HEAD.test(line)){
      if(!list.length){push({type:"empty_error",value:null,nodes:[],highlighted:-1});term({kind:"error",text:"deleteHead()  →  ✗ List is empty! Nothing to delete.",op:"deleteHead",size:0});}
      else{const v=list.shift();push({type:"deleteHead",value:v,nodes:[...list],highlighted:-1});term({kind:"warn",text:`deleteHead()  →  removed ${v} from HEAD  [size: ${list.length}]`,op:"deleteHead",val:v,size:list.length});}
      continue;
    }
    if(DEL_TAIL.test(line)){
      if(!list.length){push({type:"empty_error",value:null,nodes:[],highlighted:-1});term({kind:"error",text:"deleteTail()  →  ✗ List is empty! Nothing to delete.",op:"deleteTail",size:0});}
      else{const v=list.pop();push({type:"deleteTail",value:v,nodes:[...list],highlighted:list.length-1});term({kind:"warn",text:`deleteTail()  →  removed ${v} from TAIL  [size: ${list.length}]`,op:"deleteTail",val:v,size:list.length});}
      continue;
    }
    if((m=line.match(DEL_VAL))){
      const v=parseFloat(m[1]),fi=list.indexOf(v);
      if(fi===-1){push({type:"delete_error",value:v,nodes:[...list],highlighted:-1});term({kind:"error",text:`delete(${v})  →  ✗ Value ${v} not found in list!`,op:"delete",size:list.length});}
      else{list.splice(fi,1);push({type:"deleteVal",value:v,nodes:[...list],highlighted:-1});term({kind:"warn",text:`delete(${v})  →  node removed  [size: ${list.length}]`,op:"delete",val:v,size:list.length});}
      continue;
    }
    if((m=line.match(SEARCH))){
      const v=parseFloat(m[1]),fi=list.indexOf(v);
      if(fi===-1){push({type:"search_miss",value:v,result:-1,nodes:[...list],highlighted:-1});term({kind:"error",text:`search(${v})  →  ✗ Value ${v} not found (-1)`,op:"search",size:list.length});}
      else{push({type:"search",value:v,result:fi,nodes:[...list],highlighted:fi});term({kind:"info",text:`search(${v})  →  found at index ${fi}  ✓`,op:"search",val:v,result:fi,size:list.length});}
      continue;
    }
    if(TRAVERSE.test(line)){
      push({type:"traverse",nodes:[...list],highlighted:-2});
      term({kind:"info",text:`traverse()  →  [${list.join(" → ")}]  (${list.length} nodes)`,op:"traverse",size:list.length});continue;
    }
    if(ISEMPTY.test(line)){
      const e=list.length===0;
      push({type:"isEmpty",result:e,nodes:[...list],highlighted:-1});
      term({kind:"info",text:`isEmpty()  →  ${e}  (${list.length} node${list.length!==1?"s":""})`,op:"isEmpty",result:e,size:list.length});continue;
    }
    if(GETSIZE.test(line)){
      push({type:"getSize",result:list.length,nodes:[...list],highlighted:-1});
      term({kind:"info",text:`getSize()  →  ${list.length}`,op:"getSize",result:list.length,size:list.length});continue;
    }
  }
  if(!steps.length) errors.push("No list operations detected.\nCall insertHead(N), insertTail(N), deleteHead(), search(N), etc.");
  return{steps,errors,termLines};
}

function buildMessage(s){
  switch(s.type){
    case "insertHead":  return `insertHead(${s.value})  →  prepended ${s.value} · new HEAD · list size: ${s.nodes?.length}`;
    case "insertTail":  return `insertTail(${s.value})  →  appended ${s.value} · new TAIL · list size: ${s.nodes?.length}`;
    case "insertAt":    return `insertAt(${s.index}, ${s.value})  →  inserted ${s.value} at index ${s.index} · list size: ${s.nodes?.length}`;
    case "deleteHead":  return `deleteHead()  →  removed ${s.value} from HEAD · head now → ${s.nodes?.[0]??'null'} · list size: ${s.nodes?.length}`;
    case "deleteTail":  return `deleteTail()  →  removed ${s.value} from TAIL · list size: ${s.nodes?.length}`;
    case "deleteVal":   return `delete(${s.value})  →  found and removed node ${s.value} · list size: ${s.nodes?.length}`;
    case "delete_error":return `delete(${s.value})  →  ⚠ Value ${s.value} not found in list!`;
    case "search":      return `search(${s.value})  →  ✓ found at index ${s.result}  ·  node highlighted`;
    case "search_miss": return `search(${s.value})  →  ⚠ Value ${s.value} not found · returns -1`;
    case "traverse":    return `traverse()  →  visited all ${s.nodes?.length} nodes: [${s.nodes?.join(" → ")}]`;
    case "isEmpty":     return `isEmpty()  →  ${s.result}  ·  list has ${s.nodes?.length??0} node${s.nodes?.length!==1?"s":""}`;
    case "getSize":     return `getSize()  →  ${s.result}  ·  ${s.result} node${s.result!==1?"s":""}`;
    case "empty_error": return `⚠ Operation failed! The list is empty.`;
    default: return "";
  }
}

function runCode(code,lang){
  const t=code.trim();
  if(!t) return{steps:[],errors:["Please write some code first."],termLines:[]};
  if(lang==="javascript"||lang==="typescript") return runJavaScript(code);
  return parseScoped(code,lang);
}

// ══════════════════════════════════════════════════════════════════════════════
// AI VALIDATION GATE
// ══════════════════════════════════════════════════════════════════════════════
async function validateWithAI(code, lang) {
  const prompt = `You are a strict code reviewer for a Linked List data-structure visualizer.

The user has written a Singly Linked List implementation in ${lang}. Your job:
1. Check if it is a CORRECT and COMPLETE Linked List implementation.
2. Look for logic bugs: wrong pointer updates, not updating head, not decrementing size, etc.
3. Look for syntax errors.

CRITICAL RULE: If there are ANY errors at all — even one — set "valid" to false.
Do NOT be lenient. A single bug means valid=false.

Return ONLY valid JSON (no markdown, no backticks):
{
  "valid": true,
  "reason": "one sentence summary",
  "errors": []
}

Code:
\`\`\`${lang}
${code}
\`\`\``;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        model:"claude-sonnet-4-20250514",
        max_tokens:1000,
        messages:[{role:"user",content:prompt}],
      }),
    });
    if(!res.ok) return{valid:true,reason:"",errors:[],apiError:`HTTP ${res.status}`};
    const data = await res.json();
    if(data.error) return{valid:true,reason:`AI unavailable: ${data.error.message}`,errors:[],apiError:data.error.message};
    const raw = data.content?.map(i=>i.text||"").join("")??"";
    // Strip possible markdown fences
    const cleaned = raw.replace(/^```json\s*/i,"").replace(/^```\s*/i,"").replace(/\s*```\s*$/,"").trim();
    try {
      const parsed = JSON.parse(cleaned);
      return{valid:!!parsed.valid,reason:parsed.reason??"",errors:Array.isArray(parsed.errors)?parsed.errors:[],apiError:null};
    } catch {
      // If JSON parse fails, assume valid to avoid blocking
      return{valid:true,reason:"",errors:[],apiError:"AI response parse error"};
    }
  } catch(e){
    return{valid:true,reason:"",errors:[],apiError:e.message};
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// ARROW & NULL MARKER
// ══════════════════════════════════════════════════════════════════════════════
function Arrow({color="rgba(96,165,250,0.5)", animated=false}){
  const id = `ah${Math.abs(color.split("").reduce((a,c)=>a+c.charCodeAt(0),0))}`;
  return(
    <svg width="44" height="20" viewBox="0 0 44 20" style={{flexShrink:0,display:"block",overflow:"visible"}}>
      <defs>
        <marker id={id} markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
          <polygon points="0 0,7 3.5,0 7" fill={color}/>
        </marker>
      </defs>
      <line x1="2" y1="10" x2="34" y2="10"
        stroke={color} strokeWidth="2"
        strokeDasharray={animated?"5 3":"none"}
        markerEnd={`url(#${id})`}
        opacity="0.9">
        {animated&&<animate attributeName="stroke-dashoffset" from="8" to="0" dur="0.45s" repeatCount="indefinite"/>}
      </line>
    </svg>
  );
}
function NullMarker(){
  return(
    <div style={{
      width:36,height:36,borderRadius:7,
      border:"1.5px dashed rgba(255,255,255,0.12)",
      display:"flex",alignItems:"center",justifyContent:"center",
      fontFamily:"'JetBrains Mono',monospace",fontSize:8,
      color:"rgba(255,255,255,0.18)",flexShrink:0,
      background:"rgba(255,255,255,0.02)",letterSpacing:"0.05em",
    }}>NULL</div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// LINKED LIST VISUALIZATION
// ══════════════════════════════════════════════════════════════════════════════
function LinkedListViz({step, animKey, idle}){
  const [flyItem, setFlyItem] = useState(null);
  const [traverseIdx, setTraverseIdx] = useState(-1);
  const traverseTimer = useRef(null);

  useEffect(()=>{
    clearInterval(traverseTimer.current);
    setTraverseIdx(-1);
    if(step?.type==="traverse"&&step.nodes?.length){
      let i=0;setTraverseIdx(0);
      traverseTimer.current=setInterval(()=>{
        i++;
        if(i>=step.nodes.length){clearInterval(traverseTimer.current);setTraverseIdx(-3);}
        else setTraverseIdx(i);
      },240);
    }
    return()=>clearInterval(traverseTimer.current);
  },[animKey,step?.type]);

  useEffect(()=>{
    const isDelete=["deleteHead","deleteTail","deleteVal"].includes(step?.type);
    if(isDelete&&step.value!=null){
      setFlyItem({v:step.value,type:step.type,key:animKey});
      const t=setTimeout(()=>setFlyItem(null),900);
      return()=>clearTimeout(t);
    }
  },[animKey,step?.type]);

  const nodes=step?.nodes??[];
  const isErr=["delete_error","search_miss","empty_error"].includes(step?.type);

  const getHL=(i)=>{
    if(step?.type==="traverse"){
      if(traverseIdx===-3) return "done";
      if(i===traverseIdx) return "active";
      if(i<traverseIdx) return "visited";
      return "none";
    }
    if(step?.type==="search"&&step.highlighted===i) return "found";
    if(step?.type==="insertAt"&&step.highlighted===i) return "new";
    if(step?.type==="insertHead"&&i===0) return "new";
    if(step?.type==="insertTail"&&i===nodes.length-1) return "new";
    return "none";
  };

  return(
    <div className={`llv${isErr?" llv-err":""}`} key={isErr?`e${animKey}`:"llv"}>
      {/* Metrics bar */}
      <div className="llv-metrics">
        {[
          {lbl:"SIZE",  val:nodes.length,                              c:"#60a5fa"},
          {lbl:"HEAD",  val:nodes.length?nodes[0]:"NULL",             c:"#4ade80"},
          {lbl:"TAIL",  val:nodes.length?nodes[nodes.length-1]:"NULL",c:"#fbbf24"},
          {lbl:"TYPE",  val:"SINGLY →",                               c:"#a78bfa"},
        ].map(m=>(
          <div className="llv-m" key={m.lbl}>
            <span className="llv-ml">{m.lbl}</span>
            <span className="llv-mv" style={{color:m.c}}>{String(m.val)}</span>
          </div>
        ))}
      </div>

      {/* Chain area */}
      <div className="llv-chain-wrap">
        {flyItem&&(
          <div key={flyItem.key} className={`llv-fly llv-fly-${flyItem.type}`}
            style={{
              background:`linear-gradient(135deg,${col(flyItem.v).g1},${col(flyItem.v).g2})`,
              boxShadow:`0 0 28px ${col(flyItem.v).glow}`,
            }}>
            <span className="llv-fly-v">{flyItem.v}</span>
            <span className="llv-fly-tag">✕ DEL</span>
          </div>
        )}

        {nodes.length>0&&(
          <div className="llv-pointer-row">
            <div className="llv-head-ptr">
              <div className="llv-ptr-chip llv-ptr-head">HEAD</div>
              <svg width="2" height="18" viewBox="0 0 2 18"><line x1="1" y1="0" x2="1" y2="18" stroke="#4ade80" strokeWidth="1.5"/></svg>
              <svg width="12" height="8" viewBox="0 0 12 8"><polygon points="0,0 12,0 6,8" fill="#4ade80"/></svg>
            </div>
            {nodes.length>1&&(
              <div className="llv-tail-ptr" style={{marginLeft:`${(nodes.length-1)*130}px`}}>
                <svg width="12" height="8" viewBox="0 0 12 8"><polygon points="0,8 12,8 6,0" fill="#fbbf24"/></svg>
                <svg width="2" height="18" viewBox="0 0 2 18"><line x1="1" y1="0" x2="1" y2="18" stroke="#fbbf24" strokeWidth="1.5"/></svg>
                <div className="llv-ptr-chip llv-ptr-tail">TAIL</div>
              </div>
            )}
          </div>
        )}

        <div className="llv-chain">
          {nodes.length===0?(
            <div className={`llv-empty${isErr?" llv-empty-err":""}`}>
              <div className="llv-ei">{idle?"🔗":isErr?"⚠":"∅"}</div>
              <div className="llv-et">{idle?"Run code to start":isErr?"Operation failed!":"List is empty"}</div>
            </div>
          ):nodes.map((v,i)=>{
            const hl=getHL(i);
            const c=col(v);
            const isNew=hl==="new";
            const isFound=hl==="found";
            const isVisited=hl==="visited";
            const isActive=hl==="active";
            const isDone=hl==="done";
            const arrowColor=isActive||isDone?"#34d399":isVisited?"rgba(52,211,153,0.6)":isFound?"#fbbf24":"rgba(96,165,250,0.45)";
            return(
              <div key={`${v}-${i}-${isNew?animKey:"n"}`} className="llv-node-group">
                <div className={["llv-node",isNew?"llv-node-new":"",isFound?"llv-node-found":"",isVisited?"llv-node-visited":"",isActive?"llv-node-active":"",isDone?"llv-node-done":""].join(" ")}
                  style={{
                    background:`linear-gradient(135deg,${c.g1},${c.g2})`,
                    boxShadow:isFound
                      ?`0 0 36px ${c.glow},0 0 0 2.5px #fbbf24,0 8px 22px rgba(0,0,0,0.55)`
                      :isActive
                      ?`0 0 36px rgba(52,211,153,0.7),0 0 0 2px #34d399,0 8px 22px rgba(0,0,0,0.55)`
                      :`0 0 28px ${c.glow},0 6px 18px rgba(0,0,0,0.5)`,
                  }}>
                  <div className="llv-node-top">
                    <span className="llv-node-idx">[{i}]</span>
                    {i===0&&<span className="llv-badge llv-badge-h">H</span>}
                    {i===nodes.length-1&&nodes.length>1&&<span className="llv-badge llv-badge-t">T</span>}
                  </div>
                  <span className="llv-node-val">{v}</span>
                  <div className="llv-node-ptr">
                    <span className="llv-ptr-label">next</span>
                    <div className="llv-ptr-dot" style={{background:i<nodes.length-1?arrowColor:"rgba(255,255,255,0.2)"}}/>
                  </div>
                  {isFound&&<div className="llv-found-ring" key={`fr-${animKey}`}/>}
                  {isFound&&<div className="llv-found-ring llv-fr2" key={`fr2-${animKey}`}/>}
                  {isNew&&<div className="llv-new-glow" key={`ng-${animKey}`}/>}
                </div>
                {i<nodes.length-1&&<Arrow color={arrowColor} animated={isActive||isVisited}/>}
                {i===nodes.length-1&&<><Arrow color="rgba(255,255,255,0.12)"/><NullMarker/></>}
              </div>
            );
          })}
        </div>

        {nodes.length>0&&(
          <div className="llv-addrs">
            {nodes.map((v,i)=>(
              <div key={i} className="llv-addr">
                <span>0x{(0xA000+i*0x18).toString(16).toUpperCase()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ENHANCED TERMINAL — with copy, timestamps, filtering, detail rows
// ══════════════════════════════════════════════════════════════════════════════
function Terminal({lines, currentStep, isRunning, hasErrors, errorLines, onJumpToStep}){
  const termRef = useRef(null);
  const [filter, setFilter] = useState("all");
  const [copied, setCopied]  = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);

  // Auto-scroll to active line
  useEffect(()=>{
    if(termRef.current){
      const active = termRef.current.querySelector(".term-row-active");
      if(active) active.scrollIntoView({block:"nearest",behavior:"smooth"});
      else if(currentStep<0) termRef.current.scrollTop=0;
    }
  },[lines, currentStep]);

  const kindMeta = {
    success:{ c:"#4ade80", bg:"rgba(74,222,128,0.07)", border:"rgba(74,222,128,0.15)", icon:"✓", label:"INSERT" },
    warn:   { c:"#fbbf24", bg:"rgba(251,191,36,0.07)",  border:"rgba(251,191,36,0.15)",  icon:"−", label:"DELETE" },
    error:  { c:"#f87171", bg:"rgba(248,113,113,0.07)", border:"rgba(248,113,113,0.15)", icon:"✗", label:"ERROR"  },
    info:   { c:"#818cf8", bg:"rgba(129,140,248,0.07)", border:"rgba(129,140,248,0.15)", icon:"›", label:"INFO"   },
    system: { c:"#64748b", bg:"transparent",            border:"transparent",           icon:"#", label:"SYS"    },
  };

  const filtered = filter==="all" ? lines : lines.filter(l=>l.kind===filter);
  const counts = lines.reduce((a,l)=>({...a,[l.kind]:(a[l.kind]||0)+1}),{});

  const copyAll = () => {
    const txt = [
      ...errorLines.map(e=>`[ERROR] ${e}`),
      ...lines.map((l,i)=>`[${String(i+1).padStart(3,"0")}] [${l.kind.toUpperCase()}] ${l.text}`)
    ].join("\n");
    navigator.clipboard?.writeText(txt).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),1800);});
  };

  const statusColor = hasErrors ? "#f87171" : lines.length>0 ? "#4ade80" : "#334155";
  const statusText  = hasErrors ? "ERROR" : isRunning ? "RUNNING" : lines.length>0 ? "DONE" : "IDLE";

  const getOpColor = (op) => {
    if(!op) return "#64748b";
    if(["insertHead","insertTail","insertAt"].includes(op)) return "#4ade80";
    if(["deleteHead","deleteTail","delete"].includes(op)) return "#fbbf24";
    if(["search"].includes(op)) return "#818cf8";
    if(["traverse"].includes(op)) return "#34d399";
    return "#60a5fa";
  };

  // Compute stats for summary bar
  const totalInserts = (counts.success||0);
  const totalDeletes = (counts.warn||0);
  const totalErrors  = (counts.error||0);
  const totalInfo    = (counts.info||0);

  return(
    <div className="term-wrap">
      {/* Terminal chrome */}
      <div className="term-header">
        <div className="term-dots">
          <span className="term-dot" style={{background:"#ff5f57"}}/>
          <span className="term-dot" style={{background:"#ffbd2e"}}/>
          <span className="term-dot" style={{background:"#28c840"}}/>
        </div>
        <span className="term-title">
          <span style={{fontSize:9,opacity:0.6}}>⬛</span> OUTPUT
        </span>
        <div className="term-status-pill" style={{
          color:statusColor,
          background:`${statusColor}14`,
          border:`1px solid ${statusColor}35`,
        }}>
          <span className="term-status-dot" style={{background:statusColor,boxShadow:`0 0 5px ${statusColor}`}}/>
          {statusText}
          {isRunning&&<span className="term-cursor-sm"/>}
        </div>
        <div style={{flex:1}}/>
        {lines.length>0&&(
          <button className="term-copy-btn" onClick={copyAll} title="Copy all output">
            {copied?"✓ Copied":"⎘ Copy"}
          </button>
        )}
      </div>

      {/* Filter bar — only show if there are lines */}
      {(lines.length>0||errorLines.length>0)&&(
        <div className="term-filter-bar">
          <button
            className={`tfilter-btn${filter==="all"?" tfilter-active":""}`}
            onClick={()=>setFilter("all")}
            style={filter==="all"?{color:"#94a3b8",borderColor:"rgba(148,163,184,0.28)"}:{}}>
            ALL <span className="tfilter-count">{lines.length}</span>
          </button>
          {[
            {k:"success", icon:"✓", label:"Insert"},
            {k:"warn",    icon:"−", label:"Delete"},
            {k:"error",   icon:"✗", label:"Error"},
            {k:"info",    icon:"›", label:"Info"},
          ].map(({k,icon,label})=>(counts[k]>0||true)&&(
            <button
              key={k}
              className={`tfilter-btn${filter===k?" tfilter-active":""}`}
              onClick={()=>setFilter(k)}
              style={filter===k?{color:kindMeta[k]?.c,borderColor:`${kindMeta[k]?.c}40`}:{}}>
              <span style={{color:kindMeta[k]?.c}}>{icon}</span> {label} <span className="tfilter-count" style={{color:filter===k?kindMeta[k]?.c:undefined}}>{counts[k]||0}</span>
            </button>
          ))}
        </div>
      )}

      {/* Terminal body */}
      <div className="term-body" ref={termRef}>
        {lines.length===0&&errorLines.length===0&&(
          <div className="term-idle-screen">
            <div className="term-idle-prompt-row">
              <span className="term-prompt-char">$</span>
              <span className="term-idle-text">
                {isRunning?"Reviewing your implementation…":"Waiting for execution…"}
              </span>
              {isRunning&&<span className="term-cursor"/>}
            </div>
            <div className="term-hint-row">
              <span>Press <kbd className="term-kbd">▶ Run</kbd> or <kbd className="term-kbd">Ctrl+Enter</kbd> to execute</span>
            </div>
          </div>
        )}

        {/* AI/runtime error lines */}
        {errorLines.length>0&&(
          <div className="term-error-block">
            <div className="term-error-block-header">
              <span style={{color:"#f87171"}}>⚠ ERRORS DETECTED — VISUALIZATION BLOCKED</span>
            </div>
            {errorLines.map((e,i)=>(
              <div key={`ae${i}`} className="term-error-row">
                <span className="term-err-bullet">✗</span>
                <span className="term-err-text">{e}</span>
              </div>
            ))}
          </div>
        )}

        {/* Operation rows */}
        {filtered.map((line,i)=>{
          const k = kindMeta[line.kind]??kindMeta.info;
          // Find original index in unfiltered lines for syncing with visualizer
          const origIdx = filter==="all" ? i : lines.indexOf(line);
          const isActive = !hasErrors && origIdx===currentStep;
          const isExpanded = expandedRow===i;
          const opColor = getOpColor(line.op);

          return(
            <div key={i}
              className={`term-row${isActive?" term-row-active":""}`}
              style={{
                background:isActive?k.bg:"transparent",
                borderLeft:isActive?`2px solid ${k.c}`:"2px solid transparent",
              }}
              onClick={()=>{
                setExpandedRow(isExpanded?null:i);
                if(onJumpToStep&&filter==="all") onJumpToStep(i);
              }}>

              {/* Line number */}
              <span className="term-lnum">{String(origIdx+1).padStart(3,"0")}</span>

              {/* Kind icon */}
              <span className="term-kind-icon" style={{color:k.c}}>{k.icon}</span>

              {/* Op tag */}
              {line.op&&(
                <span className="term-op-tag" style={{color:opColor,background:`${opColor}18`,borderColor:`${opColor}35`}}>
                  {line.op}
                </span>
              )}

              {/* Main text */}
              <span className="term-text" style={{color:isActive?k.c:"#4a5568"}}>{line.text}</span>

              {/* Active cursor */}
              {isActive&&<span className="term-cursor"/>}

              {/* Size badge */}
              {line.size!=null&&(
                <span className="term-size-badge" style={{color:"#1e3a5f"}}>
                  n={line.size}
                </span>
              )}
            </div>
          );
        })}

        {/* Summary footer */}
        {lines.length>0&&!hasErrors&&currentStep>=lines.length-1&&(
          <div className="term-summary-bar">
            <span className="term-sum-icon">🏁</span>
            <span style={{color:"#374151"}}>{lines.length} operation{lines.length!==1?"s":""} completed</span>
            {totalInserts>0&&<span className="term-sum-chip" style={{color:"#4ade80",background:"rgba(74,222,128,0.1)",borderColor:"rgba(74,222,128,0.2)"}}>✓ {totalInserts} insert{totalInserts!==1?"s":""}</span>}
            {totalDeletes>0&&<span className="term-sum-chip" style={{color:"#fbbf24",background:"rgba(251,191,36,0.1)",borderColor:"rgba(251,191,36,0.2)"}}>− {totalDeletes} delete{totalDeletes!==1?"s":""}</span>}
            {totalInfo>0&&<span className="term-sum-chip" style={{color:"#818cf8",background:"rgba(129,140,248,0.1)",borderColor:"rgba(129,140,248,0.2)"}}>› {totalInfo} query{totalInfo!==1?"s":""}</span>}
            {totalErrors>0&&<span className="term-sum-chip" style={{color:"#f87171",background:"rgba(248,113,113,0.1)",borderColor:"rgba(248,113,113,0.2)"}}>✗ {totalErrors} error{totalErrors!==1?"s":""}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════════
export default function LinkedListPage(){
  const [lang,       setLang]       = useState("javascript");
  const [code,       setCode]       = useState(TPL.javascript);
  const [steps,      setSteps]      = useState([]);
  const [termLines,  setTermLines]  = useState([]);
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
  const [activeTab,  setActiveTab]  = useState("viz");

  const timerRef = useRef(null);
  const taRef    = useRef(null);
  const listRef  = useRef(null);
  const bump     = () => setAnimKey(k=>k+1);

  const doReset = useCallback(()=>{
    clearInterval(timerRef.current);
    setSteps([]); setIdx(-1); setError(""); setTermLines([]);
    setPlaying(false); setDone(false);
    setAiErrors([]); setAiReason(""); setApiNote("");
  },[]);

  const changeLang = (l)=>{ setLang(l); setCode(TPL[l]??""); doReset(); };

  const handleRun = async ()=>{
    doReset();
    setValidating(true);

    const validation = await validateWithAI(code, lang);
    setValidating(false);

    if(validation.apiError) setApiNote(validation.apiError);

    if(!validation.valid){
      setAiReason(validation.reason??"");
      setAiErrors(validation.errors??[]);
      setActiveTab("terminal");
      return;
    }

    const{steps:s,errors,termLines:tl}=runCode(code,lang);

    if(errors.length){
      setError(errors.join("\n"));
      setActiveTab("terminal");
      return;
    }

    setTermLines(tl);
    setSteps(s);
    setIdx(0);
    bump();
    setPlaying(true);
    setActiveTab("viz");
  };

  const goTo = useCallback((i)=>{
    clearInterval(timerRef.current); setPlaying(false);
    const c=Math.max(0,Math.min(i,steps.length-1));
    setIdx(c); bump();
  },[steps.length]);

  useEffect(()=>{
    const h=(e)=>{ if((e.ctrlKey||e.metaKey)&&e.key==="Enter"){e.preventDefault();handleRun();} };
    window.addEventListener("keydown",h);
    return()=>window.removeEventListener("keydown",h);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[code,lang]);

  useEffect(()=>{
    if(!playing||!steps.length) return;
    timerRef.current=setInterval(()=>{
      setIdx(prev=>{
        if(prev>=steps.length-1){clearInterval(timerRef.current);setPlaying(false);setDone(true);return prev;}
        bump(); return prev+1;
      });
    },speed*1000);
    return()=>clearInterval(timerRef.current);
  },[playing,steps,speed]);

  useEffect(()=>{
    listRef.current?.querySelector(".sl-active")?.scrollIntoView({block:"nearest",behavior:"smooth"});
  },[idx]);

  const onKeyDown=(e)=>{
    if(e.key!=="Tab") return;
    e.preventDefault();
    const s=e.target.selectionStart,en=e.target.selectionEnd;
    const nv=code.slice(0,s)+"  "+code.slice(en);
    setCode(nv);
    requestAnimationFrame(()=>{if(taRef.current){taRef.current.selectionStart=s+2;taRef.current.selectionEnd=s+2;}});
  };

  const step       = steps[idx]??null;
  const os         = step?(OP[step.type]??OP.insertTail):null;
  const prog       = steps.length?Math.round(((idx+1)/steps.length)*100):0;
  const hasAiErrors= aiErrors.length>0;
  const hasAnyErr  = hasAiErrors||!!error;
  const idle       = steps.length===0&&!error&&!hasAiErrors;
  const lm         = LANGS[lang];
  const codeLines  = code.split("\n");
  const errorLineSet=new Set(aiErrors.map(e=>(e.line??1)-1));

  const termErrorLines=[
    ...(aiReason?[`🤖 AI Review: ${aiReason}`]:[]),
    ...aiErrors.map(e=>`Line ${e.line??'?'}: ${e.message}`),
    ...(error?[error]:[]),
  ];

  return(
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        body{background:#030612;color:#e2e8f0;font-family:'DM Sans',sans-serif;min-height:100vh;overflow-x:hidden}

        /* ── PAGE ──────────────────────────────────────────── */
        .pg{min-height:100vh;display:flex;flex-direction:column;
          background:
            radial-gradient(ellipse 55% 40% at 8% 0%,rgba(52,211,153,0.10) 0%,transparent 60%),
            radial-gradient(ellipse 45% 35% at 92% 100%,rgba(167,139,250,0.09) 0%,transparent 58%),
            radial-gradient(ellipse 35% 30% at 50% 52%,rgba(96,165,250,0.04) 0%,transparent 55%),
            #030612}

        /* ── HEADER ────────────────────────────────────────── */
        .hd{position:sticky;top:0;z-index:200;display:flex;align-items:center;gap:14px;
          padding:13px 36px;background:rgba(3,6,18,0.92);backdrop-filter:blur(24px) saturate(170%);
          border-bottom:1px solid rgba(52,211,153,0.1)}
        .hd-logo{width:38px;height:38px;border-radius:11px;flex-shrink:0;
          background:linear-gradient(135deg,#059669,#34d399);
          display:flex;align-items:center;justify-content:center;font-size:18px;
          box-shadow:0 0 20px rgba(52,211,153,0.45)}
        .hd-title{font-family:'Syne',sans-serif;font-size:18px;font-weight:800;letter-spacing:-0.3px;
          background:linear-gradient(90deg,#6ee7b7,#34d399,#a78bfa 80%);
          -webkit-background-clip:text;-webkit-text-fill-color:transparent}
        .hd-sub{font-size:9.5px;color:#1e3a5f;font-family:'JetBrains Mono',monospace;margin-top:2px;letter-spacing:0.06em}
        .hd-right{margin-left:auto;display:flex;align-items:center;gap:10px}
        .hd-badge{background:rgba(52,211,153,0.08);border:1px solid rgba(52,211,153,0.22);
          color:#34d399;font-size:9.5px;font-family:'JetBrains Mono',monospace;
          padding:4px 11px;border-radius:20px;letter-spacing:0.06em;white-space:nowrap}
        .hd-lang-badge{font-size:9.5px;font-family:'JetBrains Mono',monospace;
          padding:4px 11px;border-radius:20px;border:1px solid;white-space:nowrap}

        /* ── MAIN GRID ─────────────────────────────────────── */
        .main{display:grid;grid-template-columns:1fr 1fr;gap:16px;
          padding:18px 36px 56px;max-width:1480px;margin:0 auto;width:100%;flex:1}
        @media(max-width:980px){
          .main{grid-template-columns:1fr;padding:14px 14px 56px}
          .hd{padding:11px 16px}
        }

        /* ── PANEL ─────────────────────────────────────────── */
        .panel{background:rgba(6,10,26,0.82);border:1px solid rgba(255,255,255,0.065);
          border-radius:16px;display:flex;flex-direction:column;overflow:hidden;
          box-shadow:0 20px 52px rgba(0,0,0,0.52),inset 0 1px 0 rgba(255,255,255,0.04)}
        .ph{padding:11px 16px;border-bottom:1px solid rgba(255,255,255,0.055);
          background:rgba(10,18,40,0.65);display:flex;align-items:center;gap:7px;flex-shrink:0}
        .pd{width:10px;height:10px;border-radius:50%}
        .pt{font-family:'JetBrains Mono',monospace;font-size:9px;color:#1e3a5f;
          text-transform:uppercase;letter-spacing:1.6px;margin-left:8px}

        /* ── LANG TABS ─────────────────────────────────────── */
        .lb{display:flex;gap:4px;flex-wrap:wrap;padding:10px 14px;
          border-bottom:1px solid rgba(255,255,255,0.045);background:rgba(8,14,32,0.55);flex-shrink:0}
        .lt{padding:4px 10px;border-radius:7px;cursor:pointer;
          font-family:'JetBrains Mono',monospace;font-size:9.5px;font-weight:700;
          border:1px solid rgba(255,255,255,0.065);background:transparent;color:#1e3a5f;
          transition:all 0.16s;letter-spacing:0.04em}
        .lt:hover{color:#475569;border-color:rgba(255,255,255,0.12)}
        .lt.la{background:rgba(52,211,153,0.14);border-color:rgba(52,211,153,0.35);color:#6ee7b7}

        /* ── CODE EDITOR ───────────────────────────────────── */
        .cw{flex:1;position:relative;display:flex;flex-direction:column;min-height:0}
        .ln-col{position:absolute;left:0;top:0;bottom:0;width:42px;padding:18px 0;
          border-right:1px solid rgba(255,255,255,0.038);overflow:hidden;pointer-events:none;
          display:flex;flex-direction:column}
        .ln{font-family:'JetBrains Mono',monospace;font-size:10.5px;color:#1e2d47;
          text-align:right;padding-right:9px;line-height:1.7;height:22px;flex-shrink:0;
          transition:color 0.15s}
        .ln.aln{color:#34d399;background:rgba(52,211,153,0.08);border-radius:3px}
        .ln.eln{color:#ef4444!important;background:rgba(239,68,68,0.1);border-radius:3px}
        .al-overlay{position:absolute;left:42px;right:0;height:22px;pointer-events:none;
          background:rgba(52,211,153,0.048);border-left:2px solid rgba(52,211,153,0.42);
          transition:top 0.18s ease}
        .err-line-overlay{position:absolute;left:42px;right:0;height:22px;pointer-events:none;
          background:rgba(239,68,68,0.06);border-left:2px solid rgba(239,68,68,0.5)}
        .ta{flex:1;padding:18px 16px 18px 52px;background:transparent;border:none;outline:none;
          color:#7dd3fc;font-family:'JetBrains Mono',monospace;font-size:11.5px;line-height:1.7;
          resize:none;caret-color:#34d399;min-height:300px;tab-size:2;white-space:pre}
        .ta::selection{background:rgba(52,211,153,0.18)}

        /* Active line bar */
        .alb{display:flex;align-items:center;gap:9px;padding:6px 14px;
          border-top:1px solid rgba(255,255,255,0.045);border-left:3px solid;min-height:32px;
          flex-shrink:0;animation:alIn 0.2s ease}
        @keyframes alIn{from{opacity:0;transform:translateX(-7px)}to{opacity:1;transform:none}}
        .alb-icon{font-size:12px}
        .alb-lnum{font-family:'JetBrains Mono',monospace;font-size:9.5px;font-weight:700;white-space:nowrap}
        .alb-code{font-family:'JetBrains Mono',monospace;font-size:9.5px;color:#334155;
          overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1}

        /* Validating bar */
        .validating-bar{margin:8px 14px;padding:10px 14px;display:flex;align-items:center;gap:10px;
          background:rgba(52,211,153,0.06);border:1px solid rgba(52,211,153,0.25);border-radius:11px;
          flex-shrink:0;animation:fadeIn 0.2s ease}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        .vld-spinner{width:15px;height:15px;border-radius:50%;border:2px solid rgba(52,211,153,0.22);
          border-top-color:#34d399;animation:spin 0.65s linear infinite;flex-shrink:0}
        @keyframes spin{to{transform:rotate(360deg)}}
        .vld-txt{font-family:'JetBrains Mono',monospace;font-size:10.5px;color:#34d399;letter-spacing:0.04em}

        /* AI error panel */
        .ai-err{margin:8px 14px;border-radius:12px;overflow:hidden;
          border:1px solid rgba(239,68,68,0.32);flex-shrink:0;animation:errSh 0.36s ease}
        @keyframes errSh{0%,100%{transform:translateX(0)}20%{transform:translateX(-7px)}40%{transform:translateX(7px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}
        .ai-err-head{padding:9px 14px;background:rgba(239,68,68,0.12);
          display:flex;align-items:center;gap:9px;border-bottom:1px solid rgba(239,68,68,0.18)}
        .ai-err-icon{font-size:14px}
        .ai-err-title{font-family:'JetBrains Mono',monospace;font-size:10.5px;font-weight:700;color:#ef4444;flex:1}
        .ai-err-badge{font-family:'JetBrains Mono',monospace;font-size:8.5px;padding:2px 8px;
          border-radius:20px;background:rgba(239,68,68,0.14);border:1px solid rgba(239,68,68,0.28);
          color:#fca5a5;letter-spacing:0.06em}
        .ai-err-blocked{padding:8px 14px;background:rgba(239,68,68,0.07);
          border-bottom:1px solid rgba(239,68,68,0.12);
          display:flex;align-items:center;gap:7px;
          font-family:'JetBrains Mono',monospace;font-size:9.5px;color:#f87171;letter-spacing:0.04em}
        .ai-err-reason{padding:8px 14px;font-family:'DM Sans',sans-serif;font-size:11.5px;
          color:#94a3b8;background:rgba(239,68,68,0.04);border-bottom:1px solid rgba(239,68,68,0.08);line-height:1.5}
        .ai-err-list{display:flex;flex-direction:column;gap:0;max-height:170px;overflow-y:auto}
        .ai-err-list::-webkit-scrollbar{width:3px}
        .ai-err-list::-webkit-scrollbar-thumb{background:rgba(239,68,68,0.28);border-radius:4px}
        .ai-err-row{display:flex;align-items:flex-start;gap:10px;padding:7px 14px;
          border-bottom:1px solid rgba(239,68,68,0.06);cursor:pointer;transition:background 0.14s}
        .ai-err-row:hover{background:rgba(239,68,68,0.06)}
        .ai-err-row:last-child{border-bottom:none}
        .ai-err-ln{font-family:'JetBrains Mono',monospace;font-size:9.5px;font-weight:700;
          color:#ef4444;white-space:nowrap;min-width:40px;padding-top:1px}
        .ai-err-msg{font-family:'DM Sans',sans-serif;font-size:11.5px;color:#fca5a5;line-height:1.5}
        .ai-err-code{font-family:'JetBrains Mono',monospace;font-size:9.5px;color:#475569;
          margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:340px}

        /* Runtime error */
        .err{margin:8px 14px;padding:12px 14px;background:rgba(239,68,68,0.06);
          border:1px solid rgba(239,68,68,0.25);border-radius:11px;
          color:#fca5a5;font-family:'JetBrains Mono',monospace;font-size:11px;line-height:1.65;
          flex-shrink:0;animation:errSh 0.36s ease}
        .err-t{font-weight:700;color:#ef4444;margin-bottom:6px;display:flex;align-items:center;gap:7px;font-size:11.5px}

        .api-note{margin:5px 14px 0;padding:6px 11px;border-radius:8px;flex-shrink:0;
          background:rgba(52,211,153,0.05);border:1px solid rgba(52,211,153,0.15);
          font-family:'JetBrains Mono',monospace;font-size:9px;color:#064e3b;line-height:1.5}

        /* Run row */
        .rr{padding:11px 14px;border-top:1px solid rgba(255,255,255,0.045);
          display:flex;align-items:center;gap:8px;flex-wrap:wrap;flex-shrink:0}
        .btn-run{padding:9px 24px;border-radius:9px;
          background:linear-gradient(135deg,#065f46,#059669,#34d399);border:none;color:#fff;
          font-family:'JetBrains Mono',monospace;font-size:11.5px;font-weight:700;cursor:pointer;
          transition:all 0.2s;box-shadow:0 0 18px rgba(52,211,153,0.38),0 4px 12px rgba(0,0,0,0.3);
          letter-spacing:0.04em}
        .btn-run:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 0 32px rgba(52,211,153,0.6),0 8px 20px rgba(0,0,0,0.3)}
        .btn-run:active:not(:disabled){transform:translateY(0)}
        .btn-run.running{animation:rPulse 1s ease-in-out infinite;
          background:linear-gradient(135deg,#064e3b,#065f46)}
        .btn-run:disabled{opacity:0.62;cursor:not-allowed}
        @keyframes rPulse{0%,100%{box-shadow:0 0 18px rgba(52,211,153,0.35)}50%{box-shadow:0 0 36px rgba(52,211,153,0.7)}}
        .btn-rst{padding:9px 14px;border-radius:9px;background:transparent;
          border:1px solid rgba(255,255,255,0.09);color:#334155;
          font-family:'JetBrains Mono',monospace;font-size:10.5px;cursor:pointer;transition:all 0.17s}
        .btn-rst:hover{color:#f87171;border-color:rgba(248,113,113,0.38)}
        .rr-hint{font-family:'JetBrains Mono',monospace;font-size:8.5px;color:#1e2d47;letter-spacing:0.08em}

        /* ══ RIGHT PANEL TABS ══════════════════════════════════ */
        .rtabs{display:flex;border-bottom:1px solid rgba(255,255,255,0.055);
          background:rgba(10,18,40,0.65);flex-shrink:0}
        .rtab{flex:1;padding:10px 14px;cursor:pointer;
          font-family:'JetBrains Mono',monospace;font-size:9.5px;font-weight:700;
          letter-spacing:0.06em;text-transform:uppercase;
          border:none;background:transparent;color:#1e3a5f;
          transition:all 0.17s;position:relative;border-bottom:2px solid transparent}
        .rtab:hover{color:#475569}
        .rtab.rtab-active{color:#34d399;border-bottom-color:#34d399;background:rgba(52,211,153,0.04)}
        .rtab-badge{display:inline-flex;align-items:center;justify-content:center;
          width:16px;height:16px;border-radius:50%;margin-left:6px;font-size:8px;font-weight:700;
          background:rgba(239,68,68,0.2);color:#f87171;border:1px solid rgba(239,68,68,0.3);
          vertical-align:middle}
        .rtab-badge.rb-ok{background:rgba(52,211,153,0.15);color:#34d399;border-color:rgba(52,211,153,0.3)}

        /* ══ VIZ PANEL ════════════════════════════════════════ */
        .vb{flex:1;display:flex;flex-direction:column;overflow:hidden}
        .vb-content{flex:1;display:flex;flex-direction:column;overflow:hidden}

        /* Linked list viz */
        .llv{flex:1;display:flex;flex-direction:column;min-height:0;overflow:hidden}
        .llv.llv-err{animation:errSh 0.4s ease}
        .llv-metrics{display:flex;gap:0;border-bottom:1px solid rgba(255,255,255,0.045);background:rgba(6,10,24,0.55);flex-shrink:0}
        .llv-m{flex:1;padding:8px 10px;text-align:center;border-right:1px solid rgba(255,255,255,0.045);display:flex;flex-direction:column;gap:3px}
        .llv-m:last-child{border-right:none}
        .llv-ml{font-family:'JetBrains Mono',monospace;font-size:7px;color:#1e2d47;letter-spacing:0.14em;text-transform:uppercase}
        .llv-mv{font-family:'JetBrains Mono',monospace;font-size:16px;font-weight:700;line-height:1}
        .llv-chain-wrap{flex:1;display:flex;flex-direction:column;align-items:center;
          justify-content:center;padding:16px 16px 4px;position:relative;min-height:180px;overflow:hidden}
        .llv-pointer-row{display:flex;align-items:flex-end;width:100%;position:relative;height:42px;flex-shrink:0;margin-bottom:2px}
        .llv-head-ptr{display:flex;flex-direction:column;align-items:center;position:absolute;left:32px}
        .llv-tail-ptr{display:flex;flex-direction:column;align-items:center;position:absolute;transition:margin 0.3s ease}
        .llv-ptr-chip{font-family:'JetBrains Mono',monospace;font-size:8px;font-weight:700;
          padding:2px 7px;border-radius:5px;letter-spacing:0.08em}
        .llv-ptr-head{background:rgba(74,222,128,0.14);border:1px solid rgba(74,222,128,0.3);color:#4ade80}
        .llv-ptr-tail{background:rgba(251,191,36,0.12);border:1px solid rgba(251,191,36,0.28);color:#fbbf24}
        .llv-chain{display:flex;align-items:center;gap:0;flex-nowrap:nowrap;
          overflow-x:auto;padding:4px 8px 12px;width:100%;justify-content:safe center;
          scrollbar-width:thin;scrollbar-color:#1e2d47 transparent}
        .llv-chain::-webkit-scrollbar{height:3px}
        .llv-chain::-webkit-scrollbar-thumb{background:#1e2d47;border-radius:4px}
        .llv-node-group{display:flex;align-items:center;flex-shrink:0}
        .llv-node{width:78px;height:68px;border-radius:12px;border:1.5px solid rgba(255,255,255,0.16);
          position:relative;display:flex;flex-direction:column;flex-shrink:0;
          overflow:visible;transition:transform 0.22s,box-shadow 0.22s}
        .llv-node::before{content:'';position:absolute;inset:0;
          background:linear-gradient(138deg,rgba(255,255,255,0.17) 0%,transparent 55%);
          border-radius:inherit;pointer-events:none;z-index:1}
        .llv-node-new{animation:nodeDrop 0.5s cubic-bezier(0.34,1.56,0.64,1) both}
        @keyframes nodeDrop{0%{transform:translateY(-65px) scale(0.75);opacity:0}62%{transform:translateY(4px) scale(1.04);opacity:1}82%{transform:translateY(-2px) scale(0.98)}100%{transform:translateY(0) scale(1)}}
        .llv-node-found{animation:nodePulse 0.5s ease 3 both}
        @keyframes nodePulse{0%,100%{filter:brightness(1)}50%{filter:brightness(1.5) saturate(1.5)}}
        .llv-node-active{animation:nodeActive 0.38s ease both}
        @keyframes nodeActive{0%{filter:brightness(1)}60%{filter:brightness(1.38)}100%{filter:brightness(1.18)}}
        .llv-node-visited{opacity:0.72}
        .llv-node-done{animation:nodeDone 0.3s ease both}
        @keyframes nodeDone{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}
        .llv-node-top{display:flex;align-items:center;justify-content:space-between;padding:5px 7px 0;position:relative;z-index:2}
        .llv-node-idx{font-family:'JetBrains Mono',monospace;font-size:7px;color:rgba(255,255,255,0.4)}
        .llv-badge{width:15px;height:15px;border-radius:4px;display:flex;align-items:center;justify-content:center;
          font-family:'JetBrains Mono',monospace;font-size:7px;font-weight:700;color:#000}
        .llv-badge-h{background:#4ade80;box-shadow:0 0 8px rgba(74,222,128,0.55)}
        .llv-badge-t{background:#fbbf24;box-shadow:0 0 8px rgba(251,191,36,0.55)}
        .llv-node-val{font-family:'JetBrains Mono',monospace;font-size:18px;font-weight:700;color:#fff;
          flex:1;display:flex;align-items:center;justify-content:center;
          text-shadow:0 2px 7px rgba(0,0,0,0.4);line-height:1;position:relative;z-index:2}
        .llv-node-ptr{display:flex;align-items:center;gap:4px;margin:0 7px 5px;
          border-top:1px solid rgba(255,255,255,0.12);padding-top:3px;position:relative;z-index:2}
        .llv-ptr-label{font-family:'JetBrains Mono',monospace;font-size:6.5px;color:rgba(255,255,255,0.36);letter-spacing:0.04em}
        .llv-ptr-dot{width:6px;height:6px;border-radius:50%;margin-left:auto;border:1.5px solid rgba(255,255,255,0.25);transition:background 0.2s}
        .llv-found-ring{position:absolute;inset:-5px;border-radius:16px;border:2px solid #fbbf24;
          animation:fndRing 0.65s cubic-bezier(0.22,1,0.36,1) forwards;pointer-events:none;z-index:10}
        .llv-fr2{animation-delay:0.17s}
        @keyframes fndRing{0%{transform:scale(1);opacity:0.9}100%{transform:scale(1.38);opacity:0}}
        .llv-new-glow{position:absolute;inset:0;border-radius:12px;background:rgba(255,255,255,0.14);
          animation:newGlow 0.55s ease forwards;pointer-events:none;z-index:0}
        @keyframes newGlow{0%{opacity:1}100%{opacity:0}}
        .llv-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;
          width:200px;height:76px;border:1px dashed rgba(255,255,255,0.065);border-radius:12px;gap:7px}
        .llv-empty.llv-empty-err{border-color:rgba(239,68,68,0.32);animation:errSh 0.36s ease}
        .llv-ei{font-size:20px;opacity:0.4}
        .llv-et{font-family:'JetBrains Mono',monospace;font-size:9px;color:#1e2d47;letter-spacing:0.08em}
        .llv-addrs{display:flex;gap:0;padding:4px 8px 6px;overflow-x:auto;justify-content:safe center;flex-shrink:0}
        .llv-addr{font-family:'JetBrains Mono',monospace;font-size:7.5px;color:#0f1a2e;
          width:78px;text-align:center;flex-shrink:0;margin:0 22px 0 0;letter-spacing:0.04em}
        .llv-addr:last-child{margin-right:0}
        .llv-fly{position:absolute;top:14px;right:18%;
          width:72px;height:54px;border-radius:12px;display:flex;flex-direction:column;
          align-items:center;justify-content:center;gap:1px;z-index:20;pointer-events:none;
          border:1.5px solid rgba(255,255,255,0.24)}
        .llv-fly-deleteHead{animation:flyLeft 0.8s cubic-bezier(0.22,1,0.36,1) forwards}
        @keyframes flyLeft{0%{opacity:1;transform:translateX(0) translateY(0) scale(1)}100%{opacity:0;transform:translateX(-110px) translateY(-72px) scale(0.48) rotate(-22deg)}}
        .llv-fly-deleteTail{animation:flyRight 0.8s cubic-bezier(0.22,1,0.36,1) forwards}
        @keyframes flyRight{0%{opacity:1;transform:translateX(0) translateY(0) scale(1)}100%{opacity:0;transform:translateX(110px) translateY(-72px) scale(0.48) rotate(22deg)}}
        .llv-fly-deleteVal{animation:flyUp 0.8s cubic-bezier(0.22,1,0.36,1) forwards}
        @keyframes flyUp{0%{opacity:1;transform:translateY(0) scale(1)}100%{opacity:0;transform:translateY(-100px) scale(0.42) rotate(14deg)}}
        .llv-fly-v{font-family:'JetBrains Mono',monospace;font-size:15px;font-weight:700;color:#fff}
        .llv-fly-tag{font-family:'JetBrains Mono',monospace;font-size:7.5px;color:rgba(255,255,255,0.65);letter-spacing:0.06em}

        /* Op info */
        .oi{padding:12px 16px;border-top:1px solid rgba(255,255,255,0.045);
          background:rgba(6,10,24,0.55);min-height:72px;flex-shrink:0}
        .oi-badge{display:inline-flex;align-items:center;gap:7px;padding:4px 12px;
          border-radius:20px;margin-bottom:7px;font-family:'JetBrains Mono',monospace;
          font-size:10px;font-weight:700;animation:bdIn 0.26s ease;border:1px solid}
        @keyframes bdIn{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:none}}
        .oi-msg{font-family:'JetBrains Mono',monospace;font-size:11px;color:#334155;line-height:1.55;animation:mgIn 0.28s ease}
        @keyframes mgIn{from{opacity:0}to{opacity:1}}
        .oi-idle{display:flex;align-items:center;gap:9px;font-family:'JetBrains Mono',monospace;
          font-size:10px;color:#1e2d47;letter-spacing:0.06em;padding:6px 0}

        /* Controls */
        .ctrl{display:flex;align-items:center;gap:6px;padding:8px 14px;
          border-top:1px solid rgba(255,255,255,0.045);background:rgba(4,8,20,0.55);
          flex-wrap:wrap;flex-shrink:0}
        .cb{width:32px;height:30px;border-radius:7px;border:1px solid rgba(255,255,255,0.08);
          background:rgba(255,255,255,0.03);color:#334155;font-size:11px;cursor:pointer;
          display:flex;align-items:center;justify-content:center;transition:all 0.16s}
        .cb:hover:not(:disabled){background:rgba(52,211,153,0.12);color:#6ee7b7;border-color:rgba(52,211,153,0.32)}
        .cb:disabled{opacity:0.24;cursor:not-allowed}
        .cp{height:30px;padding:0 11px;border-radius:7px;
          background:linear-gradient(135deg,#065f46,#34d399);border:none;color:#fff;
          font-size:12px;cursor:pointer;box-shadow:0 0 14px rgba(52,211,153,0.38);transition:all 0.18s}
        .cp:hover:not(:disabled){transform:scale(1.05);box-shadow:0 0 24px rgba(52,211,153,0.58)}
        .cp:disabled{opacity:0.34;cursor:not-allowed;transform:none}
        .cs{width:1px;height:18px;background:rgba(255,255,255,0.065);margin:0 2px}
        .spd{display:flex;gap:3px}
        .sb{padding:4px 7px;border-radius:5px;cursor:pointer;
          font-family:'JetBrains Mono',monospace;font-size:8.5px;font-weight:700;
          border:1px solid rgba(255,255,255,0.065);background:transparent;color:#1e2d47;transition:all 0.13s}
        .sb:hover{color:#475569}
        .sb.sa{background:rgba(52,211,153,0.12);border-color:rgba(52,211,153,0.32);color:#6ee7b7}

        /* Progress bar */
        .pr{display:flex;align-items:center;gap:8px;padding:6px 16px;
          border-top:1px solid rgba(255,255,255,0.038);flex-shrink:0}
        .pt2{flex:1;height:4px;background:rgba(255,255,255,0.045);border-radius:99px;overflow:hidden}
        .pf{height:100%;border-radius:99px;transition:width 0.4s ease;
          background:linear-gradient(90deg,#065f46,#34d399,#6ee7b7);
          box-shadow:0 0 8px rgba(52,211,153,0.5)}
        .ptx{font-family:'JetBrains Mono',monospace;font-size:9.5px;color:#1e2d47;white-space:nowrap}

        /* Done banner */
        .db{padding:10px 16px;border-top:1px solid rgba(74,222,128,0.18);
          background:rgba(74,222,128,0.05);display:flex;align-items:center;gap:9px;flex-shrink:0;
          animation:dbIn 0.5s cubic-bezier(0.22,1,0.36,1)}
        @keyframes dbIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
        .db-tx{font-family:'JetBrains Mono',monospace;font-size:11px;color:#4ade80}
        .db-sp{display:inline-block;animation:spSpin 0.6s ease}
        @keyframes spSpin{0%{transform:scale(0) rotate(-180deg)}60%{transform:scale(1.3) rotate(10deg)}100%{transform:scale(1) rotate(0)}}

        /* Steps list */
        .slh{padding:8px 16px 4px;font-family:'JetBrains Mono',monospace;font-size:7.5px;color:#1e2d47;
          letter-spacing:0.13em;text-transform:uppercase;border-top:1px solid rgba(255,255,255,0.038);flex-shrink:0}
        .sl{max-height:120px;overflow-y:auto;padding:0 10px 8px;display:flex;flex-direction:column;gap:2px;flex-shrink:0}
        .sl::-webkit-scrollbar{width:3px}
        .sl::-webkit-scrollbar-track{background:transparent}
        .sl::-webkit-scrollbar-thumb{background:#1e2d47;border-radius:4px}
        .si{display:flex;align-items:center;gap:7px;padding:3px 8px;border-radius:6px;
          cursor:pointer;font-family:'JetBrains Mono',monospace;font-size:9px;color:#1e2d47;
          transition:all 0.13s;border:1px solid transparent}
        .si:hover{background:rgba(52,211,153,0.05);color:#334155}
        .sl-active{background:rgba(52,211,153,0.09)!important;border-color:rgba(52,211,153,0.18)!important;color:#6ee7b7!important}
        .si-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0}
        .si-v{opacity:0.45;margin-left:2px}
        .si-ln{margin-left:auto;font-size:7.5px;color:#1e2d47}

        /* ══ ENHANCED TERMINAL ═══════════════════════════════════ */
        .term-wrap{flex:1;display:flex;flex-direction:column;min-height:0;overflow:hidden;
          background:rgba(3,5,15,0.6)}

        .term-header{display:flex;align-items:center;gap:8px;padding:10px 14px;
          border-bottom:1px solid rgba(255,255,255,0.05);
          background:rgba(8,12,28,0.85);flex-shrink:0}
        .term-dots{display:flex;gap:5px;align-items:center}
        .term-dot{width:9px;height:9px;border-radius:50%;flex-shrink:0}
        .term-title{font-family:'JetBrains Mono',monospace;font-size:9px;color:#1e3050;
          letter-spacing:0.14em;text-transform:uppercase;display:flex;align-items:center;gap:5px}

        .term-status-pill{display:flex;align-items:center;gap:5px;margin-left:4px;
          font-family:'JetBrains Mono',monospace;font-size:8.5px;font-weight:700;
          letter-spacing:0.08em;padding:3px 10px;border-radius:20px}
        .term-status-dot{width:5px;height:5px;border-radius:50%;flex-shrink:0}

        .term-cursor-sm{display:inline-block;width:5px;height:10px;background:currentColor;
          vertical-align:middle;margin-left:4px;border-radius:1px;
          animation:blink 1s step-end infinite;opacity:0.7}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}

        .term-copy-btn{padding:4px 10px;border-radius:6px;cursor:pointer;
          font-family:'JetBrains Mono',monospace;font-size:8.5px;font-weight:600;
          border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.04);
          color:#334155;transition:all 0.15s;letter-spacing:0.04em;white-space:nowrap}
        .term-copy-btn:hover{color:#6ee7b7;border-color:rgba(52,211,153,0.3);background:rgba(52,211,153,0.06)}

        /* Filter bar */
        .term-filter-bar{display:flex;align-items:center;gap:3px;padding:7px 12px;
          border-bottom:1px solid rgba(255,255,255,0.04);background:rgba(6,10,22,0.7);
          flex-shrink:0;overflow-x:auto;scrollbar-width:none}
        .term-filter-bar::-webkit-scrollbar{display:none}
        .tfilter-btn{padding:3px 9px;border-radius:6px;cursor:pointer;
          font-family:'JetBrains Mono',monospace;font-size:8.5px;font-weight:700;
          border:1px solid rgba(255,255,255,0.06);background:transparent;color:#1e3050;
          transition:all 0.13s;letter-spacing:0.04em;white-space:nowrap;display:flex;align-items:center;gap:4px}
        .tfilter-btn:hover{color:#334155;background:rgba(255,255,255,0.03)}
        .tfilter-active{background:rgba(255,255,255,0.05)!important}
        .tfilter-count{font-size:8px;opacity:0.7;font-weight:400}

        /* Body */
        .term-body{flex:1;overflow-y:auto;font-family:'JetBrains Mono',monospace;
          background:transparent;scrollbar-width:thin;scrollbar-color:#1e2d47 transparent}
        .term-body::-webkit-scrollbar{width:3px}
        .term-body::-webkit-scrollbar-thumb{background:#1e2d47;border-radius:4px}

        /* Idle screen */
        .term-idle-screen{padding:24px 20px;display:flex;flex-direction:column;gap:12px}
        .term-idle-prompt-row{display:flex;align-items:center;gap:9px;font-size:12px;color:#1e3050}
        .term-prompt-char{color:#34d399;font-size:14px;font-weight:700}
        .term-idle-text{color:#1e3050;font-size:11px;letter-spacing:0.03em}
        .term-cursor{display:inline-block;width:7px;height:13px;background:#34d399;
          vertical-align:middle;margin-left:5px;border-radius:1px;
          animation:blink 1s step-end infinite}
        .term-hint-row{font-size:9.5px;color:#0f1a2e;letter-spacing:0.05em}
        .term-kbd{display:inline-block;padding:1px 6px;border-radius:4px;font-size:8.5px;
          background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);color:#334155}

        /* Error block */
        .term-error-block{margin:10px 12px;border-radius:10px;overflow:hidden;
          border:1px solid rgba(248,113,113,0.25);animation:errSh 0.36s ease}
        .term-error-block-header{padding:8px 14px;background:rgba(248,113,113,0.1);
          font-family:'JetBrains Mono',monospace;font-size:9px;font-weight:700;
          letter-spacing:0.08em;border-bottom:1px solid rgba(248,113,113,0.15)}
        .term-error-row{display:flex;align-items:flex-start;gap:8px;padding:7px 14px;
          border-bottom:1px solid rgba(248,113,113,0.07);background:rgba(248,113,113,0.04)}
        .term-error-row:last-child{border-bottom:none}
        .term-err-bullet{color:#f87171;font-size:10px;flex-shrink:0;padding-top:1px}
        .term-err-text{font-size:11px;color:#fca5a5;line-height:1.55}

        /* Operation rows */
        .term-row{display:flex;align-items:center;gap:0;padding:4px 0;
          transition:background 0.12s,border-color 0.12s;cursor:pointer;
          border-left:2px solid transparent;margin:0 8px;border-radius:4px}
        .term-row:hover{background:rgba(255,255,255,0.02)}
        .term-row-active{background:rgba(52,211,153,0.05)!important}

        .term-lnum{font-size:8px;color:#0f1926;min-width:38px;padding:0 8px;
          text-align:right;flex-shrink:0;user-select:none;font-family:'JetBrains Mono',monospace}
        .term-kind-icon{font-size:10px;min-width:18px;text-align:center;flex-shrink:0;font-weight:700}

        .term-op-tag{font-family:'JetBrains Mono',monospace;font-size:8px;font-weight:700;
          padding:1px 6px;border-radius:4px;border:1px solid;margin-right:6px;flex-shrink:0;
          letter-spacing:0.04em;white-space:nowrap}

        .term-text{font-size:10.5px;color:#334155;padding:0 6px 0 0;line-height:1.6;
          word-break:break-all;flex:1;transition:color 0.12s;letter-spacing:0.01em}

        .term-size-badge{font-family:'JetBrains Mono',monospace;font-size:8px;
          padding:1px 6px;border-radius:4px;background:rgba(255,255,255,0.03);
          border:1px solid rgba(255,255,255,0.05);flex-shrink:0;margin-right:8px;
          white-space:nowrap}

        /* Summary footer */
        .term-summary-bar{display:flex;align-items:center;gap:7px;flex-wrap:wrap;
          padding:10px 14px;border-top:1px solid rgba(255,255,255,0.04);margin-top:4px;
          font-family:'JetBrains Mono',monospace;font-size:9px;color:#1e2d47;
          background:rgba(6,10,22,0.5)}
        .term-sum-icon{font-size:11px}
        .term-sum-chip{padding:2px 8px;border-radius:5px;border:1px solid;font-size:8px;
          font-weight:700;letter-spacing:0.04em}
      `}</style>

      <div className="pg">
        {/* ── HEADER ── */}
        <header className="hd">
          <div className="hd-logo">🔗</div>
          <div>
            <div className="hd-title">Linked List DS Visualizer</div>
            <div className="hd-sub">Write · Validate · Visualize — real execution engine with AI review</div>
          </div>
          <div className="hd-right">
            <div className="hd-lang-badge" style={{color:lm.accent,background:`${lm.accent}12`,borderColor:`${lm.accent}30`}}>
              {lm.name}
            </div>
            <div className="hd-badge">Singly Linked List</div>
          </div>
        </header>

        {/* ── MAIN GRID ── */}
        <main className="main">

          {/* LEFT: Code editor */}
          <div className="panel">
            <div className="ph">
              <span className="pd" style={{background:"#ff5f57"}}/>
              <span className="pd" style={{background:"#ffbd2e"}}/>
              <span className="pd" style={{background:"#28c840"}}/>
              <span className="pt">Code Editor</span>
              <span style={{marginLeft:"auto",fontFamily:"'JetBrains Mono',monospace",fontSize:9,
                color:lm.accent,background:`${lm.accent}16`,border:`1px solid ${lm.accent}33`,
                padding:"2px 9px",borderRadius:20}}>{lm.name}</span>
            </div>

            {/* Language selector */}
            <div className="lb">
              {Object.entries(LANGS).map(([k,m])=>(
                <button key={k}
                  className={`lt${lang===k?" la":""}`}
                  onClick={()=>changeLang(k)}
                  style={lang===k?{borderColor:`${m.accent}50`,color:m.accent,background:`${m.accent}12`}:{}}>
                  {m.ext}
                </button>
              ))}
            </div>

            {/* Editor */}
            <div className="cw">
              <div className="ln-col">
                {codeLines.map((_,i)=>(
                  <div key={i} className={["ln",step?.lineNum===i?"aln":"",errorLineSet.has(i)?"eln":""].join(" ")}>{i+1}</div>
                ))}
              </div>
              {step&&<div className="al-overlay" style={{top:`${18+step.lineNum*22}px`}}/>}
              {[...errorLineSet].map(i=>(
                <div key={`el${i}`} className="err-line-overlay" style={{top:`${18+i*22}px`}}/>
              ))}
              <textarea ref={taRef} className="ta"
                value={code}
                onChange={e=>{setCode(e.target.value);if(steps.length||hasAiErrors) doReset();}}
                onKeyDown={onKeyDown}
                spellCheck={false}
                placeholder="// Write your LinkedList + Node class here, then use it below..."
              />
            </div>

            {/* Active line indicator */}
            {step&&os&&(
              <div className="alb" style={{borderColor:os.bd,background:os.bg}}>
                <span className="alb-icon" style={{color:os.c}}>{os.icon}</span>
                <span className="alb-lnum" style={{color:os.c}}>line {step.lineNum+1}</span>
                <code className="alb-code">{step.codeLine}</code>
              </div>
            )}

            {/* Validating */}
            {validating&&(
              <div className="validating-bar">
                <div className="vld-spinner"/>
                <span className="vld-txt">🤖 AI is reviewing your implementation…</span>
              </div>
            )}

            {/* AI errors */}
            {hasAiErrors&&(
              <div className="ai-err">
                <div className="ai-err-head">
                  <span className="ai-err-icon">🤖</span>
                  <span className="ai-err-title">Implementation Error — Visualization Blocked</span>
                  <span className="ai-err-badge">{aiErrors.length} issue{aiErrors.length!==1?"s":""}</span>
                </div>
                <div className="ai-err-blocked">
                  <span>🚫</span>
                  <span>Fix all errors below before the visualization can run</span>
                </div>
                {aiReason&&<div className="ai-err-reason">{aiReason}</div>}
                <div className="ai-err-list">
                  {aiErrors.map((e,i)=>(
                    <div key={i} className="ai-err-row"
                      onClick={()=>{const lh=22;if(taRef.current)taRef.current.scrollTop=Math.max(0,((e.line??1)-4))*lh;}}>
                      <span className="ai-err-ln">L{e.line??"?"}</span>
                      <div>
                        <div className="ai-err-msg">{e.message}</div>
                        {codeLines[(e.line??1)-1]&&<div className="ai-err-code">{codeLines[(e.line??1)-1].trim()}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Runtime errors */}
            {error&&(
              <div className="err">
                <div className="err-t"><span>⚠</span> Execution Error — Visualization Blocked</div>
                <pre style={{whiteSpace:"pre-wrap",fontFamily:"'JetBrains Mono',monospace",fontSize:10.5}}>{error}</pre>
              </div>
            )}

            {apiNote&&<div className="api-note">ℹ {apiNote} — visualization ran without AI check.</div>}

            {/* Run row */}
            <div className="rr">
              <button className={`btn-run${playing||validating?" running":""}`}
                onClick={handleRun} disabled={playing||validating}>
                {validating?"🤖 Checking…":playing?"▶ Running…":"▶  Run & Visualize"}
              </button>
              {(steps.length>0||error||hasAiErrors)&&(
                <button className="btn-rst" onClick={doReset}>↺ Reset</button>
              )}
              <span className="rr-hint">CTRL + ENTER</span>
              {hasAnyErr&&<span style={{marginLeft:"auto",fontFamily:"'JetBrains Mono',monospace",fontSize:8.5,color:"#f87171"}}>🚫 FIX ERRORS TO VISUALIZE</span>}
            </div>
          </div>

          {/* RIGHT: Visualizer + Terminal */}
          <div className="panel">
            <div className="ph">
              <span className="pd" style={{background:"#34d399"}}/>
              <span className="pd" style={{background:"#a78bfa"}}/>
              <span className="pd" style={{background:"#fbbf24"}}/>
              <span className="pt">Visualizer</span>
              {steps.length>0&&(
                <span style={{marginLeft:"auto",fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#334155"}}>{steps.length} ops</span>
              )}
            </div>

            {/* Tab switcher */}
            <div className="rtabs">
              <button className={`rtab${activeTab==="viz"?" rtab-active":""}`}
                onClick={()=>setActiveTab("viz")}>
                ⬡ Visualization
                {steps.length>0&&<span className="rtab-badge rb-ok">{steps.length}</span>}
              </button>
              <button className={`rtab${activeTab==="terminal"?" rtab-active":""}`}
                onClick={()=>setActiveTab("terminal")}>
                ⬛ Terminal
                {hasAnyErr&&(
                  <span className="rtab-badge">{aiErrors.length||"!"}</span>
                )}
                {!hasAnyErr&&termLines.length>0&&(
                  <span className="rtab-badge rb-ok">{termLines.length}</span>
                )}
              </button>
            </div>

            <div className="vb">
              {/* ── VIZ TAB ── */}
              {activeTab==="viz"&&(
                <div className="vb-content">
                  <LinkedListViz step={step} animKey={animKey} idle={idle&&!hasAnyErr}/>

                  <div className="oi">
                    {step&&os?(
                      <>
                        <div className="oi-badge" style={{color:os.c,background:os.bg,borderColor:os.bd}}>
                          <span>{os.icon}</span>
                          <span>{os.label}</span>
                          {["insertHead","insertTail","insertAt"].includes(step.type)&&(
                            <span style={{opacity:0.6}}>({step.value})</span>
                          )}
                          {["deleteHead","deleteTail","deleteVal"].includes(step.type)&&step.value!=null&&(
                            <span style={{opacity:0.6}}>→ {step.value}</span>
                          )}
                          {step.type==="search"&&<span style={{opacity:0.6}}>→ [{step.result}]</span>}
                          {step.type==="search_miss"&&<span style={{opacity:0.6}}>→ -1</span>}
                          {step.type==="isEmpty"&&<span style={{opacity:0.6}}>→ {String(step.result)}</span>}
                          {step.type==="getSize"&&<span style={{opacity:0.6}}>→ {step.result}</span>}
                        </div>
                        <div className="oi-msg">{step.message}</div>
                      </>
                    ):(
                      <div className="oi-idle">
                        <span>🔗</span>
                        <span>
                          {hasAnyErr?"🚫 Fix all errors — visualization is blocked until code is correct"
                           :idle?"Write your LinkedList class, call operations below it, then click Run"
                           :validating?"Reviewing your code…"
                           :"Waiting…"}
                        </span>
                      </div>
                    )}
                  </div>

                  {done&&(
                    <div className="db">
                      <span className="db-sp">🎉</span>
                      <span className="db-tx">All {steps.length} operation{steps.length!==1?"s":""} visualized!</span>
                    </div>
                  )}

                  {steps.length>0&&(
                    <div className="ctrl">
                      <button className="cb" title="First" onClick={()=>goTo(0)} disabled={idx<=0}>⏮</button>
                      <button className="cb" title="Prev"  onClick={()=>goTo(idx-1)} disabled={idx<=0}>◀</button>
                      <button className="cp"
                        onClick={()=>{
                          if(done||idx>=steps.length-1){setIdx(0);bump();setDone(false);setPlaying(true);}
                          else{clearInterval(timerRef.current);setPlaying(p=>!p);}
                        }}>
                        {playing?"⏸":done?"↺":"▶"}
                      </button>
                      <button className="cb" title="Next" onClick={()=>goTo(idx+1)} disabled={idx>=steps.length-1}>▶</button>
                      <button className="cb" title="Last" onClick={()=>goTo(steps.length-1)} disabled={idx>=steps.length-1}>⏭</button>
                      <div className="cs"/>
                      <div className="spd">
                        {[[2,"0.5×"],[1.1,"1×"],[0.55,"2×"]].map(([s,lbl])=>(
                          <button key={s} className={`sb${speed===s?" sa":""}`} onClick={()=>setSpeed(s)}>{lbl}</button>
                        ))}
                      </div>
                      <div className="cs"/>
                      <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8.5,color:"#1e2d47"}}>
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
                      <div className="slh">OPERATION LOG — click any step to jump</div>
                      <div className="sl" ref={listRef}>
                        {steps.map((s,i)=>{
                          const sm=OP[s.type]??OP.insertTail;
                          const past=i<idx,active=i===idx;
                          return(
                            <div key={i} className={`si${active?" sl-active":""}`} onClick={()=>goTo(i)}>
                              <span className="si-dot" style={{
                                background:past?"#34d399":active?sm.c:"#1e2d47",
                                boxShadow:active?`0 0 6px ${sm.c}`:"none",
                              }}/>
                              <span style={{color:active?sm.c:past?"#334155":"#1e2d47"}}>
                                {sm.label}
                                {["insertHead","insertTail","insertAt"].includes(s.type)&&<span className="si-v">({s.value})</span>}
                                {["deleteHead","deleteTail","deleteVal"].includes(s.type)&&s.value!=null&&<span className="si-v"> → {s.value}</span>}
                                {s.type==="search"&&<span className="si-v"> → [{s.result}]</span>}
                                {s.type==="search_miss"&&<span className="si-v"> → -1</span>}
                                {s.type==="isEmpty"&&<span className="si-v"> = {String(s.result)}</span>}
                                {s.type==="getSize"&&<span className="si-v"> = {s.result}</span>}
                                {["delete_error","search_miss","empty_error"].includes(s.type)&&<span style={{color:"#ef4444",opacity:0.8}}> ⚠</span>}
                              </span>
                              <span className="si-ln">L{s.lineNum+1}</span>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ── TERMINAL TAB ── */}
              {activeTab==="terminal"&&(
                <Terminal
                  lines={termLines}
                  currentStep={idx}
                  isRunning={validating||playing}
                  hasErrors={hasAnyErr}
                  errorLines={termErrorLines}
                  onJumpToStep={(i)=>{ if(steps.length>i) goTo(i); }}
                />
              )}
            </div>
          </div>

        </main>
      </div>
    </>
  );
}