"use client";
import { useState, useRef, useEffect, useCallback } from "react";

// ── Color palette for nodes ─────────────────────────────────────────────────
const PALETTE = [
  { g1:"#f72585", g2:"#b5179e", glow:"rgba(247,37,133,0.6)",   border:"#f72585" },
  { g1:"#7209b7", g2:"#560bad", glow:"rgba(114,9,183,0.6)",    border:"#7209b7" },
  { g1:"#3a0ca3", g2:"#4361ee", glow:"rgba(67,97,238,0.6)",    border:"#4361ee" },
  { g1:"#4cc9f0", g2:"#4895ef", glow:"rgba(76,201,240,0.6)",   border:"#4cc9f0" },
  { g1:"#06d6a0", g2:"#1b9aaa", glow:"rgba(6,214,160,0.6)",    border:"#06d6a0" },
  { g1:"#ffd60a", g2:"#ffc300", glow:"rgba(255,214,10,0.6)",   border:"#ffd60a" },
  { g1:"#ff6b35", g2:"#ff4d6d", glow:"rgba(255,107,53,0.6)",   border:"#ff6b35" },
  { g1:"#c77dff", g2:"#9d4edd", glow:"rgba(199,125,255,0.6)",  border:"#c77dff" },
];
const col = (v) => PALETTE[Math.abs(Math.round(v) || 0) % PALETTE.length];

// ── Op styles ───────────────────────────────────────────────────────────────
const OP = {
  insertFront: { label:"insertFront", icon:"⬅", c:"#4cc9f0", bg:"rgba(76,201,240,0.08)", bd:"rgba(76,201,240,0.3)" },
  insertBack:  { label:"insertBack",  icon:"➡", c:"#06d6a0", bg:"rgba(6,214,160,0.08)",  bd:"rgba(6,214,160,0.3)"  },
  insertAt:    { label:"insertAt",    icon:"↕", c:"#ffd60a", bg:"rgba(255,214,10,0.08)", bd:"rgba(255,214,10,0.3)" },
  delete:      { label:"delete",      icon:"✂", c:"#f72585", bg:"rgba(247,37,133,0.08)", bd:"rgba(247,37,133,0.3)" },
  search:      { label:"search",      icon:"🔍",c:"#c77dff", bg:"rgba(199,125,255,0.08)",bd:"rgba(199,125,255,0.3)"},
  traverse:    { label:"traverse",    icon:"→", c:"#ff6b35", bg:"rgba(255,107,53,0.08)", bd:"rgba(255,107,53,0.3)" },
  reverse:     { label:"reverse",     icon:"⇄", c:"#ffd60a", bg:"rgba(255,214,10,0.08)", bd:"rgba(255,214,10,0.3)" },
  size:        { label:"size",        icon:"#", c:"#4895ef", bg:"rgba(72,149,239,0.08)", bd:"rgba(72,149,239,0.3)" },
  error:       { label:"ERROR",       icon:"⚠", c:"#ef4444", bg:"rgba(239,68,68,0.08)",  bd:"rgba(239,68,68,0.3)"  },
};

// ── Language templates ───────────────────────────────────────────────────────
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
javascript:`// Linked List — JavaScript
class Node {
  constructor(value) {
    this.value = value;
    this.next = null;
  }
}

class LinkedList {
  constructor() {
    this.head = null;
    this.length = 0;
  }

  insertFront(value) {
    const node = new Node(value);
    node.next = this.head;
    this.head = node;
    this.length++;
  }

  insertBack(value) {
    const node = new Node(value);
    if (!this.head) { this.head = node; this.length++; return; }
    let cur = this.head;
    while (cur.next) cur = cur.next;
    cur.next = node;
    this.length++;
  }

  delete(value) {
    if (!this.head) return false;
    if (this.head.value === value) {
      this.head = this.head.next;
      this.length--;
      return true;
    }
    let cur = this.head;
    while (cur.next) {
      if (cur.next.value === value) {
        cur.next = cur.next.next;
        this.length--;
        return true;
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

  reverse() {
    let prev = null, cur = this.head;
    while (cur) {
      let nxt = cur.next;
      cur.next = prev;
      prev = cur;
      cur = nxt;
    }
    this.head = prev;
  }

  size() { return this.length; }
}

// — Use your linked list here —
const ll = new LinkedList();
ll.insertBack(10);
ll.insertBack(25);
ll.insertBack(37);
ll.insertFront(5);
ll.search(25);
ll.delete(25);
ll.insertBack(99);
ll.reverse();
ll.size();`,

typescript:`// Linked List — TypeScript
class Node<T> {
  value: T;
  next: Node<T> | null = null;
  constructor(value: T) { this.value = value; }
}

class LinkedList<T> {
  private head: Node<T> | null = null;
  private length: number = 0;

  insertFront(value: T): void {
    const node = new Node(value);
    node.next = this.head;
    this.head = node;
    this.length++;
  }

  insertBack(value: T): void {
    const node = new Node(value);
    if (!this.head) { this.head = node; this.length++; return; }
    let cur = this.head;
    while (cur.next) cur = cur.next;
    cur.next = node;
    this.length++;
  }

  delete(value: T): boolean {
    if (!this.head) return false;
    if (this.head.value === value) {
      this.head = this.head.next;
      this.length--;
      return true;
    }
    let cur: Node<T> = this.head;
    while (cur.next) {
      if (cur.next.value === value) {
        cur.next = cur.next.next;
        this.length--;
        return true;
      }
      cur = cur.next;
    }
    return false;
  }

  search(value: T): number {
    let cur = this.head, idx = 0;
    while (cur) {
      if (cur.value === value) return idx;
      cur = cur.next; idx++;
    }
    return -1;
  }

  reverse(): void {
    let prev: Node<T> | null = null, cur = this.head;
    while (cur) {
      let nxt = cur.next;
      cur.next = prev;
      prev = cur;
      cur = nxt;
    }
    this.head = prev;
  }

  size(): number { return this.length; }
}

const ll = new LinkedList<number>();
ll.insertBack(10);
ll.insertBack(25);
ll.insertBack(37);
ll.insertFront(5);
ll.search(25);
ll.delete(25);
ll.insertBack(99);
ll.reverse();
ll.size();`,

python:`# Linked List — Python
class Node:
    def __init__(self, value):
        self.value = value
        self.next = None

class LinkedList:
    def __init__(self):
        self.head = None
        self.length = 0

    def insert_front(self, value):
        node = Node(value)
        node.next = self.head
        self.head = node
        self.length += 1

    def insert_back(self, value):
        node = Node(value)
        if not self.head:
            self.head = node
            self.length += 1
            return
        cur = self.head
        while cur.next:
            cur = cur.next
        cur.next = node
        self.length += 1

    def delete(self, value):
        if not self.head:
            return False
        if self.head.value == value:
            self.head = self.head.next
            self.length -= 1
            return True
        cur = self.head
        while cur.next:
            if cur.next.value == value:
                cur.next = cur.next.next
                self.length -= 1
                return True
            cur = cur.next
        return False

    def search(self, value):
        cur = self.head
        idx = 0
        while cur:
            if cur.value == value:
                return idx
            cur = cur.next
            idx += 1
        return -1

    def reverse(self):
        prev = None
        cur = self.head
        while cur:
            nxt = cur.next
            cur.next = prev
            prev = cur
            cur = nxt
        self.head = prev

    def size(self):
        return self.length

ll = LinkedList()
ll.insert_back(10)
ll.insert_back(25)
ll.insert_back(37)
ll.insert_front(5)
ll.search(25)
ll.delete(25)
ll.insert_back(99)
ll.reverse()
ll.size()`,

java:`// Linked List — Java
public class Main {
    static class Node {
        int value;
        Node next;
        Node(int value) { this.value = value; }
    }

    static class LinkedList {
        Node head = null;
        int length = 0;

        void insertFront(int value) {
            Node node = new Node(value);
            node.next = head;
            head = node;
            length++;
        }

        void insertBack(int value) {
            Node node = new Node(value);
            if (head == null) { head = node; length++; return; }
            Node cur = head;
            while (cur.next != null) cur = cur.next;
            cur.next = node;
            length++;
        }

        boolean delete(int value) {
            if (head == null) return false;
            if (head.value == value) { head = head.next; length--; return true; }
            Node cur = head;
            while (cur.next != null) {
                if (cur.next.value == value) {
                    cur.next = cur.next.next;
                    length--;
                    return true;
                }
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

        void reverse() {
            Node prev = null, cur = head;
            while (cur != null) {
                Node nxt = cur.next;
                cur.next = prev;
                prev = cur;
                cur = nxt;
            }
            head = prev;
        }

        int size() { return length; }
    }

    public static void main(String[] args) {
        LinkedList ll = new LinkedList();
        ll.insertBack(10);
        ll.insertBack(25);
        ll.insertBack(37);
        ll.insertFront(5);
        ll.search(25);
        ll.delete(25);
        ll.insertBack(99);
        ll.reverse();
        ll.size();
    }
}`,

cpp:`// Linked List — C++
#include <iostream>
using namespace std;

struct Node {
    int value;
    Node* next;
    Node(int v) : value(v), next(nullptr) {}
};

class LinkedList {
public:
    Node* head = nullptr;
    int length = 0;

    void insertFront(int value) {
        Node* node = new Node(value);
        node->next = head;
        head = node;
        length++;
    }

    void insertBack(int value) {
        Node* node = new Node(value);
        if (!head) { head = node; length++; return; }
        Node* cur = head;
        while (cur->next) cur = cur->next;
        cur->next = node;
        length++;
    }

    bool delete_node(int value) {
        if (!head) return false;
        if (head->value == value) {
            Node* tmp = head;
            head = head->next;
            delete tmp; length--;
            return true;
        }
        Node* cur = head;
        while (cur->next) {
            if (cur->next->value == value) {
                Node* tmp = cur->next;
                cur->next = cur->next->next;
                delete tmp; length--;
                return true;
            }
            cur = cur->next;
        }
        return false;
    }

    int search(int value) {
        Node* cur = head; int idx = 0;
        while (cur) {
            if (cur->value == value) return idx;
            cur = cur->next; idx++;
        }
        return -1;
    }

    void reverse() {
        Node* prev = nullptr, *cur = head;
        while (cur) {
            Node* nxt = cur->next;
            cur->next = prev;
            prev = cur;
            cur = nxt;
        }
        head = prev;
    }

    int size() { return length; }
};

int main() {
    LinkedList ll;
    ll.insertBack(10);
    ll.insertBack(25);
    ll.insertBack(37);
    ll.insertFront(5);
    ll.search(25);
    ll.delete_node(25);
    ll.insertBack(99);
    ll.reverse();
    ll.size();
    return 0;
}`,

csharp:`// Linked List — C#
using System;

class Program {
    class Node {
        public int Value;
        public Node Next;
        public Node(int value) { Value = value; }
    }

    class LinkedList {
        Node head = null;
        int length = 0;

        public void InsertFront(int value) {
            Node node = new Node(value);
            node.Next = head;
            head = node;
            length++;
        }

        public void InsertBack(int value) {
            Node node = new Node(value);
            if (head == null) { head = node; length++; return; }
            Node cur = head;
            while (cur.Next != null) cur = cur.Next;
            cur.Next = node;
            length++;
        }

        public bool Delete(int value) {
            if (head == null) return false;
            if (head.Value == value) { head = head.Next; length--; return true; }
            Node cur = head;
            while (cur.Next != null) {
                if (cur.Next.Value == value) {
                    cur.Next = cur.Next.Next;
                    length--;
                    return true;
                }
                cur = cur.Next;
            }
            return false;
        }

        public int Search(int value) {
            Node cur = head; int idx = 0;
            while (cur != null) {
                if (cur.Value == value) return idx;
                cur = cur.Next; idx++;
            }
            return -1;
        }

        public void Reverse() {
            Node prev = null, cur = head;
            while (cur != null) {
                Node nxt = cur.Next;
                cur.Next = prev;
                prev = cur;
                cur = nxt;
            }
            head = prev;
        }

        public int Size() { return length; }
    }

    static void Main() {
        LinkedList ll = new LinkedList();
        ll.InsertBack(10);
        ll.InsertBack(25);
        ll.InsertBack(37);
        ll.InsertFront(5);
        ll.Search(25);
        ll.Delete(25);
        ll.InsertBack(99);
        ll.Reverse();
        ll.Size();
    }
}`,

go:`// Linked List — Go
package main

import "fmt"

type Node struct {
    value int
    next  *Node
}

type LinkedList struct {
    head   *Node
    length int
}

func (ll *LinkedList) InsertFront(value int) {
    node := &Node{value: value}
    node.next = ll.head
    ll.head = node
    ll.length++
}

func (ll *LinkedList) InsertBack(value int) {
    node := &Node{value: value}
    if ll.head == nil { ll.head = node; ll.length++; return }
    cur := ll.head
    for cur.next != nil { cur = cur.next }
    cur.next = node
    ll.length++
}

func (ll *LinkedList) Delete(value int) bool {
    if ll.head == nil { return false }
    if ll.head.value == value { ll.head = ll.head.next; ll.length--; return true }
    cur := ll.head
    for cur.next != nil {
        if cur.next.value == value {
            cur.next = cur.next.next
            ll.length--
            return true
        }
        cur = cur.next
    }
    return false
}

func (ll *LinkedList) Search(value int) int {
    cur := ll.head
    for i := 0; cur != nil; i++ {
        if cur.value == value { return i }
        cur = cur.next
    }
    return -1
}

func (ll *LinkedList) Reverse() {
    var prev *Node
    cur := ll.head
    for cur != nil {
        nxt := cur.next
        cur.next = prev
        prev = cur
        cur = nxt
    }
    ll.head = prev
}

func (ll *LinkedList) Size() int { return ll.length }

func main() {
    ll := &LinkedList{}
    ll.InsertBack(10)
    ll.InsertBack(25)
    ll.InsertBack(37)
    ll.InsertFront(5)
    ll.Search(25)
    ll.Delete(25)
    ll.InsertBack(99)
    ll.Reverse()
    fmt.Println(ll.Size())
}`,

rust:`// Linked List — Rust
#[derive(Debug)]
struct Node {
    value: i32,
    next: Option<Box<Node>>,
}

struct LinkedList {
    head: Option<Box<Node>>,
    length: usize,
}

impl LinkedList {
    fn new() -> Self {
        LinkedList { head: None, length: 0 }
    }

    fn insert_front(&mut self, value: i32) {
        let mut node = Box::new(Node { value, next: None });
        node.next = self.head.take();
        self.head = Some(node);
        self.length += 1;
    }

    fn insert_back(&mut self, value: i32) {
        let node = Box::new(Node { value, next: None });
        match self.head {
            None => { self.head = Some(node); }
            Some(ref mut h) => {
                let mut cur = h;
                while cur.next.is_some() {
                    cur = cur.next.as_mut().unwrap();
                }
                cur.next = Some(node);
            }
        }
        self.length += 1;
    }

    fn search(&self, value: i32) -> i32 {
        let mut cur = &self.head;
        let mut idx = 0;
        while let Some(n) = cur {
            if n.value == value { return idx; }
            cur = &n.next;
            idx += 1;
        }
        -1
    }

    fn size(&self) -> usize { self.length }
}

fn main() {
    let mut ll = LinkedList::new();
    ll.insert_back(10);
    ll.insert_back(25);
    ll.insert_back(37);
    ll.insert_front(5);
    ll.search(25);
    ll.insert_back(99);
    ll.size();
}`,
};

// ── Parser / Simulator ───────────────────────────────────────────────────────
function buildMessage(s) {
  switch (s.type) {
    case "insertFront": return `insertFront(${s.value})  ·  list: ${fmtList(s.list)}  (size: ${s.list.length})`;
    case "insertBack":  return `insertBack(${s.value})   ·  list: ${fmtList(s.list)}  (size: ${s.list.length})`;
    case "insertAt":    return `insertAt(${s.index}, ${s.value})  ·  list: ${fmtList(s.list)}`;
    case "delete":      return s.found ? `delete(${s.value})  →  removed  ·  list: ${fmtList(s.list)}` : `delete(${s.value})  →  not found`;
    case "search":      return s.result >= 0 ? `search(${s.value})  →  found at index ${s.result}` : `search(${s.value})  →  not found (-1)`;
    case "traverse":    return `traverse  →  ${fmtList(s.list)}`;
    case "reverse":     return `reverse()  ·  list: ${fmtList(s.list)}`;
    case "size":        return `size()  →  ${s.result}`;
    default: return "";
  }
}
function fmtList(arr) {
  if (!arr.length) return "NULL";
  return arr.map(v => v).join(" → ") + " → NULL";
}

function runLinkedList(code, lang) {
  if (!code.trim()) return { steps: [], errors: ["Please write some code first."] };
  if (lang === "javascript" || lang === "typescript") return runJSLinkedList(code);
  return parseGenericLL(code, lang);
}

function runJSLinkedList(code) {
  const steps = [];
  const instrumented = `"use strict";
const __S = [];

class Node {
  constructor(value) { this.value = value; this.next = null; }
}

class LinkedList {
  constructor() { this.head = null; this.length = 0; }

  _toArray() {
    const a = []; let c = this.head;
    while (c) { a.push(c.value); c = c.next; }
    return a;
  }

  insertFront(value) {
    const node = new Node(value);
    node.next = this.head; this.head = node; this.length++;
    __S.push({ type:"insertFront", value, list: this._toArray() });
  }

  insertBack(value) {
    const node = new Node(value);
    if (!this.head) { this.head = node; } else {
      let cur = this.head; while (cur.next) cur = cur.next; cur.next = node;
    }
    this.length++;
    __S.push({ type:"insertBack", value, list: this._toArray() });
  }

  insertAt(index, value) {
    if (index <= 0) { this.insertFront(value); return; }
    const node = new Node(value);
    let cur = this.head, i = 0;
    while (cur && i < index - 1) { cur = cur.next; i++; }
    if (cur) { node.next = cur.next; cur.next = node; this.length++; }
    __S.push({ type:"insertAt", index, value, list: this._toArray() });
  }

  delete(value) {
    let found = false;
    if (!this.head) { __S.push({ type:"delete", value, found: false, list: [] }); return false; }
    if (this.head.value === value) {
      this.head = this.head.next; this.length--; found = true;
      __S.push({ type:"delete", value, found: true, list: this._toArray() }); return true;
    }
    let cur = this.head;
    while (cur.next) {
      if (cur.next.value === value) {
        cur.next = cur.next.next; this.length--; found = true; break;
      }
      cur = cur.next;
    }
    __S.push({ type:"delete", value, found, list: this._toArray() });
    return found;
  }

  search(value) {
    let cur = this.head, idx = 0;
    while (cur) { if (cur.value === value) { __S.push({ type:"search", value, result: idx, list: this._toArray() }); return idx; } cur = cur.next; idx++; }
    __S.push({ type:"search", value, result: -1, list: this._toArray() });
    return -1;
  }

  reverse() {
    let prev = null, cur = this.head;
    while (cur) { let n = cur.next; cur.next = prev; prev = cur; cur = n; }
    this.head = prev;
    __S.push({ type:"reverse", list: this._toArray() });
  }

  traverse() { __S.push({ type:"traverse", list: this._toArray() }); return this._toArray(); }
  size() { __S.push({ type:"size", result: this.length, list: this._toArray() }); return this.length; }
  get length_prop() { return this.length; }
}

// strip class definitions from user code
${stripClassDefs(code)}
return __S;`;

  try {
    const fn = new Function("console", instrumented);
    const raw = fn({ log: () => {}, warn: () => {}, error: () => {}, info: () => {} });
    if (!raw?.length) return { steps: [], errors: ["No linked list operations detected."] };

    const lines = code.split("\n");
    const opLines = [];
    for (let i = 0; i < lines.length; i++) {
      const t = lines[i].trim();
      if (t.startsWith("//") || t.startsWith("*") || !t) continue;
      if (/\.(insertFront|insertBack|insertAt|delete|search|reverse|traverse|size|insert_front|insert_back|delete_node|Delete|Insert|Search|Reverse|Size)\s*\(/.test(t))
        opLines.push(i);
    }

    return {
      steps: raw.map((s, ix) => ({
        ...s, lineNum: opLines[ix] ?? 0,
        codeLine: lines[opLines[ix] ?? 0]?.trim() ?? "",
        message: buildMessage(s),
      })),
      errors: []
    };
  } catch (e) {
    return { steps: [], errors: [e.message] };
  }
}

function stripClassDefs(code) {
  // Remove class Node and class LinkedList/Stack blocks
  let result = code;
  const classRe = /\bclass\s+(?:Node|LinkedList|Stack)\b/g;
  let m;
  const toRemove = [];
  while ((m = classRe.exec(code)) !== null) {
    let d = 1, i = code.indexOf("{", m.index) + 1;
    while (i < code.length && d > 0) { if (code[i] === "{") d++; else if (code[i] === "}") d--; i++; }
    toRemove.push([m.index, i]);
  }
  for (let i = toRemove.length - 1; i >= 0; i--) {
    result = result.slice(0, toRemove[i][0]) + result.slice(toRemove[i][1]);
  }
  return result;
}

function parseGenericLL(code, lang) {
  const steps = [], list = [];
  const lines = code.split("\n");
  const opLines = [];
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    if (!t || t.startsWith("//") || t.startsWith("#") || t.startsWith("*")) continue;
    if (/\.(insertFront|insertBack|insert_front|insert_back|InsertFront|InsertBack|Push|push_front|push_back|append|prepend)\s*\(/.test(t) ||
        /\.(delete|Delete|delete_node|remove|Remove)\s*\(/.test(t) ||
        /\.(search|Search|find|Find|contains|Contains)\s*\(/.test(t) ||
        /\.(reverse|Reverse)\s*\(\s*\)/.test(t) ||
        /\.(size|Size|length|Length)\s*\(\s*\)/.test(t))
      opLines.push(i);
  }

  for (const li of opLines) {
    const line = lines[li].trim();
    const codeLine = line;

    const ibRe = /\.(insertBack|insert_back|InsertBack|append|Push|push_back)\s*\(\s*(-?[\d.]+)\s*\)/;
    const ifRe = /\.(insertFront|insert_front|InsertFront|prepend|push_front)\s*\(\s*(-?[\d.]+)\s*\)/;
    const delRe = /\.(delete|Delete|delete_node|remove|Remove)\s*\(\s*(-?[\d.]+)\s*\)/;
    const srRe = /\.(search|Search|find|Find|contains|Contains)\s*\(\s*(-?[\d.]+)\s*\)/;
    const revRe = /\.(reverse|Reverse)\s*\(\s*\)/;
    const szRe  = /\.(size|Size|length|Length)\s*\(\s*\)/;

    let m;
    if ((m = ibRe.exec(line))) {
      const v = parseFloat(m[2]); list.push(v);
      steps.push({ type:"insertBack", value:v, list:[...list], lineNum:li, codeLine, message:buildMessage({type:"insertBack",value:v,list:[...list]}) });
    } else if ((m = ifRe.exec(line))) {
      const v = parseFloat(m[2]); list.unshift(v);
      steps.push({ type:"insertFront", value:v, list:[...list], lineNum:li, codeLine, message:buildMessage({type:"insertFront",value:v,list:[...list]}) });
    } else if ((m = delRe.exec(line))) {
      const v = parseFloat(m[2]); const idx = list.indexOf(v); const found = idx >= 0;
      if (found) list.splice(idx, 1);
      steps.push({ type:"delete", value:v, found, list:[...list], lineNum:li, codeLine, message:buildMessage({type:"delete",value:v,found,list:[...list]}) });
    } else if ((m = srRe.exec(line))) {
      const v = parseFloat(m[2]); const result = list.indexOf(v);
      steps.push({ type:"search", value:v, result, list:[...list], lineNum:li, codeLine, message:buildMessage({type:"search",value:v,result,list:[...list]}) });
    } else if (revRe.test(line)) {
      list.reverse();
      steps.push({ type:"reverse", list:[...list], lineNum:li, codeLine, message:buildMessage({type:"reverse",list:[...list]}) });
    } else if (szRe.test(line)) {
      steps.push({ type:"size", result:list.length, list:[...list], lineNum:li, codeLine, message:buildMessage({type:"size",result:list.length,list:[...list]}) });
    }
  }

  if (!steps.length) return { steps:[], errors:["No linked list operations detected.\nCall insertBack(N), insertFront(N), delete(N), search(N), reverse(), or size()."] };
  return { steps, errors: [] };
}

// ── AI Validation (mirrors original VisuoSlayer stack validator) ─────────────
async function validateWithVisuoSlayer(code, lang) {
  const prompt = `You are a strict code reviewer for VisuoSlayer, a Linked List data-structure visualizer.
The user wrote a Singly Linked List in ${lang}. Check:
1. Is it a correct complete Singly Linked List with at minimum insertFront or insertBack, and delete or search?
2. Logic bugs: wrong pointer links, delete not correctly relinking, search returning wrong index, reverse leaving broken pointers?
3. Syntax errors?
Return ONLY valid JSON (no markdown):
{"valid":true|false,"reason":"one sentence","errors":[{"line":<1-based int>,"message":"<issue>"}]}
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
    if (data.error) return { valid: true, reason: "", errors: [], apiError: data.error };
    const raw = data.content ?? "";
    const cleaned = raw.replace(/```json|```/gi, "").trim();
    const parsed = JSON.parse(cleaned);
    return { valid: !!parsed.valid, reason: parsed.reason ?? "", errors: Array.isArray(parsed.errors) ? parsed.errors : [], apiError: null };
  } catch (e) {
    return { valid: true, reason: "", errors: [], apiError: e.message };
  }
}

// ── Terminal ─────────────────────────────────────────────────────────────────
function Terminal({ lines, sessionId, validating }) {
  const bodyRef = useRef(null);
  useEffect(() => { if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight; }, [lines, validating]);
  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", background:"#07090f", minHeight:0, fontFamily:"'JetBrains Mono',monospace", fontSize:"11.5px" }}>
      <div ref={bodyRef} style={{ flex:1, overflowY:"auto", padding:"10px 0 10px", scrollbarWidth:"thin", scrollbarColor:"#151e2e transparent" }}>
        {lines.length === 0 && !validating && (
          <div style={{ padding:"3px 18px", display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ color:"#4ade80", userSelect:"none" }}>$</span>
            <span style={{ animation:"cur 1.1s step-end infinite", color:"#1e3a22", marginLeft:4 }}>_</span>
          </div>
        )}
        {lines.map((line, i) => <TermLine key={i} line={line} isLast={i === lines.length - 1 && !validating} />)}
        {validating && (
          <div style={{ padding:"3px 18px", display:"flex", alignItems:"center", gap:9 }}>
            <span style={{ display:"inline-block", width:11, height:11, borderRadius:"50%", border:"1.5px solid rgba(76,201,240,0.18)", borderTopColor:"#4cc9f0", animation:"spin 0.7s linear infinite", flexShrink:0 }} />
            <span style={{ color:"#2d3f5a", fontSize:11 }}>VisuoSlayer is reviewing your implementation…</span>
          </div>
        )}
      </div>
    </div>
  );
}

function TermLine({ line, isLast }) {
  const [vis, setVis] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), 15); return () => clearTimeout(t); }, []);
  if (line.type === "separator") return <div style={{ margin:"5px 18px", borderTop:"1px solid rgba(255,255,255,0.04)", opacity:vis?1:0, transition:"opacity 0.12s" }} />;
  if (line.type === "blank") return <div style={{ height:7 }} />;
  if (line.type === "prompt") return (
    <div style={{ padding:"2px 18px", display:"flex", alignItems:"center", gap:7, opacity:vis?1:0, transition:"opacity 0.1s" }}>
      <span style={{ color:"#4ade80", userSelect:"none", flexShrink:0 }}>$</span>
      <span style={{ color:"#3d6e9a" }}>{line.text}</span>
    </div>
  );
  const cm = {
    insertFront:"#4cc9f0", insertBack:"#39d98a", delete:"#f72585", search:"#c77dff",
    reverse:"#ffd60a", size:"#4895ef", traverse:"#ff6b35",
    error:"#f87171", stderr:"#f87171", success:"#39d98a", warn:"#fbbf24", info:"#60a5fa",
    output:"#4a5e7a", stdout:"#4a6080", prompt:"#2a4060"
  };
  const pm = {
    insertFront:"⬅", insertBack:"➡", delete:"✂", search:"🔍", reverse:"⇄", size:"#", traverse:"→",
    error:"✗", stderr:"✗", success:"✓", warn:"⚠", info:"·", output:"", stdout:""
  };
  const c = cm[line.type] ?? "#3a4a62";
  const pfx = pm[line.type] ?? "";
  return (
    <div style={{ padding:"1.5px 18px", display:"flex", alignItems:"flex-start", opacity:vis?1:0, transition:"opacity 0.09s" }}>
      <span style={{ color:c, width:20, flexShrink:0, fontSize:10, paddingTop:2 }}>{pfx}</span>
      <span style={{ color:c, wordBreak:"break-word", lineHeight:1.65, flex:1 }}>
        {line.text}
        {isLast && <span style={{ animation:"cur 1.1s step-end infinite", color:"#1e2535" }}> _</span>}
      </span>
      {line.lineNum && <span style={{ marginLeft:10, color:"#141c28", fontSize:9, flexShrink:0, paddingTop:3 }}>:{line.lineNum}</span>}
    </div>
  );
}

// ── Code Editor ──────────────────────────────────────────────────────────────
function CodeEditor({ code, setCode, step, errorLineSet, onKeyDown, taRef }) {
  const lnRef = useRef(null);
  const lines = code.split("\n");
  const syncScroll = useCallback(() => { if (taRef.current && lnRef.current) lnRef.current.scrollTop = taRef.current.scrollTop; }, [taRef]);
  useEffect(() => {
    const ta = taRef.current; if (!ta) return;
    ta.addEventListener("scroll", syncScroll, { passive:true });
    return () => ta.removeEventListener("scroll", syncScroll);
  }, [syncScroll]);

  return (
    <div style={{ flex:1, display:"flex", minHeight:0, overflow:"hidden", position:"relative" }}>
      <div ref={lnRef} style={{ width:44, flexShrink:0, background:"rgba(4,7,18,0.7)", borderRight:"1px solid rgba(255,255,255,0.04)", overflowY:"hidden", overflowX:"hidden", paddingTop:16, paddingBottom:16, display:"flex", flexDirection:"column", userSelect:"none", pointerEvents:"none", scrollbarWidth:"none" }}>
        {lines.map((_, i) => {
          const isAct = step?.lineNum === i;
          const isErr = errorLineSet.has(i);
          return (
            <div key={i} style={{ height:LINE_H, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"flex-end", paddingRight:9, fontFamily:"'JetBrains Mono',monospace", fontSize:10.5, lineHeight:1, color:isErr?"#ef4444":isAct?"#4cc9f0":"#1c2738", background:isErr?"rgba(239,68,68,0.07)":isAct?"rgba(76,201,240,0.06)":"transparent", borderRadius:3, transition:"color 0.12s,background 0.12s" }}>{i + 1}</div>
          );
        })}
      </div>
      {step && (
        <div style={{ position:"absolute", left:44, right:0, height:LINE_H, top:16+step.lineNum*LINE_H, background:"rgba(76,201,240,0.04)", borderLeft:"2px solid rgba(76,201,240,0.38)", pointerEvents:"none", transition:"top 0.18s ease", zIndex:1 }} />
      )}
      {[...errorLineSet].map(i => (
        <div key={`e${i}`} style={{ position:"absolute", left:44, right:0, height:LINE_H, top:16+i*LINE_H, background:"rgba(239,68,68,0.05)", borderLeft:"2px solid rgba(239,68,68,0.4)", pointerEvents:"none", zIndex:1 }} />
      ))}
      <textarea ref={taRef} style={{ flex:1, padding:`16px 16px 16px 12px`, background:"transparent", border:"none", outline:"none", color:"#7ecfff", fontFamily:"'JetBrains Mono',monospace", fontSize:11.5, lineHeight:`${LINE_H}px`, resize:"none", caretColor:"#4cc9f0", tabSize:2, whiteSpace:"pre", overflowY:"auto", overflowX:"auto", scrollbarWidth:"thin", scrollbarColor:"#151e2e transparent", position:"relative", zIndex:2 }}
        value={code} onChange={e => setCode(e.target.value)} onKeyDown={onKeyDown} spellCheck={false}
        placeholder="// Write your LinkedList implementation here…"
      />
    </div>
  );
}

// ── Linked List Visualizer ───────────────────────────────────────────────────
function LLNode({ value, index, isHead, isTail, isHighlighted, isNew, isDeleting, animKey, showPointer }) {
  const c = col(value);
  return (
    <div style={{ display:"flex", alignItems:"center", gap:0 }}>
      <div
        className={[
          "ll-node",
          isNew ? "ll-node-new" : "",
          isDeleting ? "ll-node-del" : "",
          isHighlighted ? "ll-node-hi" : "",
        ].join(" ")}
        style={{
          background:`linear-gradient(135deg,${c.g1},${c.g2})`,
          boxShadow: isHighlighted
            ? `0 0 40px ${c.glow}, 0 0 80px ${c.glow}40, inset 0 1px 0 rgba(255,255,255,0.3)`
            : `0 0 18px ${c.glow}60, inset 0 1px 0 rgba(255,255,255,0.15)`,
          borderColor: isHighlighted ? c.border : "rgba(255,255,255,0.12)",
          position:"relative",
        }}
      >
        {/* Shine */}
        <div style={{ position:"absolute", top:0, left:0, right:0, bottom:0, borderRadius:"inherit", background:"linear-gradient(135deg,rgba(255,255,255,0.18) 0%,transparent 50%)", pointerEvents:"none" }} />
        {/* Index label */}
        <div style={{ position:"absolute", top:-20, left:"50%", transform:"translateX(-50%)", fontFamily:"'JetBrains Mono',monospace", fontSize:8.5, color:"rgba(180,210,255,0.45)", whiteSpace:"nowrap", fontWeight:600 }}>[{index}]</div>
        {/* Hover tooltip */}
        <div className="ll-node-tip">val: {value} · idx: {index}</div>
        {/* HEAD / TAIL badge */}
        {isHead && <div className="ll-badge" style={{ top:-34, left:"50%", transform:"translateX(-50%)", background:"rgba(76,201,240,0.15)", border:"1px solid rgba(76,201,240,0.4)", color:"#4cc9f0" }}>HEAD</div>}
        {isTail && <div className="ll-badge" style={{ bottom:-34, left:"50%", transform:"translateX(-50%)", background:"rgba(247,37,133,0.15)", border:"1px solid rgba(247,37,133,0.4)", color:"#f72585" }}>TAIL</div>}
        {/* Value + Next split */}
        <div style={{ display:"flex", alignItems:"stretch", gap:0 }}>
          <div style={{ padding:"8px 14px", display:"flex", alignItems:"center", justifyContent:"center", minWidth:44 }}>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:15, fontWeight:700, color:"#fff", textShadow:`0 2px 8px rgba(0,0,0,0.4)` }}>{value}</span>
          </div>
          <div style={{ width:1, background:"rgba(255,255,255,0.15)", margin:"6px 0" }} />
          <div style={{ padding:"8px 10px", display:"flex", alignItems:"center", justifyContent:"center", minWidth:32 }}>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:"rgba(180,210,255,0.5)", fontWeight:600 }}>{showPointer ? "→" : "∅"}</span>
          </div>
        </div>
      </div>
      {/* Arrow connector */}
      {showPointer && (
        <div className="ll-arrow" style={{ "--gc1":c.g1, "--gc2":c.g2 }}>
          <div className="ll-arrow-line" />
          <div className="ll-arrow-head" />
          <div className="ll-arrow-particles">
            {[0,1,2].map(i => <div key={i} className="ll-particle" style={{ "--delay":`${i * 0.3}s`, background:c.g1 }} />)}
          </div>
        </div>
      )}
    </div>
  );
}

function NullTerminator() {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:0 }}>
      <div className="ll-null" >
        <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:"rgba(180,200,230,0.35)", letterSpacing:"0.1em" }}>NULL</span>
      </div>
    </div>
  );
}

function LinkedListViz({ step, animKey, idle, prevList }) {
  const list = step?.list ?? [];
  const isReverse = step?.type === "reverse";
  const isDelete = step?.type === "delete";
  const isSearch = step?.type === "search";
  const isInsertFront = step?.type === "insertFront";
  const isInsertBack = step?.type === "insertBack";
  const isEmpty = list.length === 0;

  // Determine which node to highlight
  let highlightIdx = -1;
  if (isSearch && step.result >= 0) highlightIdx = step.result;
  if (isInsertFront) highlightIdx = 0;
  if (isInsertBack) highlightIdx = list.length - 1;

  // Determine which was newly added
  const newIdx = isInsertFront ? 0 : isInsertBack ? list.length - 1 : -1;
  // Determine which was deleted
  const deletedValue = isDelete && step.found ? step.value : null;

  const metrics = [
    { lbl:"SIZE",   val:list.length,                    c:"#4cc9f0" },
    { lbl:"HEAD",   val:list.length ? list[0] : "NULL", c:"#4cc9f0" },
    { lbl:"TAIL",   val:list.length ? list[list.length-1] : "NULL", c:"#f72585" },
    { lbl:"TYPE",   val:"SINGLY",                       c:"#c77dff" },
  ];

  return (
    <div className="ll-viz">
      {/* Metrics bar */}
      <div className="sv-metrics">
        {metrics.map(m => (
          <div className="sv-m" key={m.lbl}>
            <span className="sv-ml">{m.lbl}</span>
            <span className="sv-mv" style={{ color:m.c }}>{String(m.val)}</span>
          </div>
        ))}
      </div>

      {/* Canvas area */}
      <div className="ll-canvas">
        {/* Ambient glow blobs */}
        <div className="ll-blob ll-blob-1" />
        <div className="ll-blob ll-blob-2" />
        <div className="ll-blob ll-blob-3" />

        {/* Grid pattern */}
        <div className="ll-grid" />
        {/* Scanline sweep */}
        <div className="ll-scan" />

        {/* Reverse animation overlay */}
        {isReverse && <div className="ll-reverse-overlay" key={`rev-${animKey}`}><div className="ll-reverse-text">REVERSING ⇄</div></div>}

        {/* Nodes container */}
        <div className="ll-nodes-wrap">
          {isEmpty ? (
            <div className="ll-empty">
              <div className="ll-empty-icon">{idle ? "🔗" : "∅"}</div>
              <div className="ll-empty-text">{idle ? "Run code to see your list" : "List is empty"}</div>
            </div>
          ) : (
            <div className={`ll-nodes-row${isReverse ? " ll-nodes-reversing" : ""}`} key={isReverse ? `rev-${animKey}` : "nodes"}>
              {/* HEAD pointer */}
              <div className="ll-head-ptr">
                <div className="ll-head-ptr-line" />
                <div className="ll-head-ptr-label">HEAD</div>
              </div>
              {list.map((v, i) => (
                <LLNode
                  key={`${v}-${i}-${isReverse ? animKey : "s"}`}
                  value={v}
                  index={i}
                  isHead={i === 0}
                  isTail={i === list.length - 1}
                  isHighlighted={i === highlightIdx}
                  isNew={i === newIdx}
                  isDeleting={false}
                  animKey={animKey}
                  showPointer={i < list.length - 1}
                />
              ))}
              <NullTerminator />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function LinkedListPage() {
  const [lang, setLang]           = useState("javascript");
  const [code, setCode]           = useState(TPL.javascript);
  const [steps, setSteps]         = useState([]);
  const [idx, setIdx]             = useState(-1);
  const [error, setError]         = useState("");
  const [playing, setPlaying]     = useState(false);
  const [speed, setSpeed]         = useState(1.1);
  const [animKey, setAnimKey]     = useState(0);
  const [done, setDone]           = useState(false);
  const [validating, setValidating] = useState(false);
  const [aiErrors, setAiErrors]   = useState([]);
  const [termLines, setTermLines] = useState([]);
  const [sessionId]               = useState(() => Math.random().toString(36).slice(2, 8).toUpperCase());

  const [toast, setToast]       = useState(null);
  const [termOpen, setTermOpen] = useState(true);
  const timerRef = useRef(null), taRef = useRef(null), listRef = useRef(null);
  const bump = () => setAnimKey(k => k + 1);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2200); };

  const copyListState = () => {
    if (!step) return;
    const txt = step.list.length ? step.list.join(" → ") + " → NULL" : "NULL (empty)";
    navigator.clipboard?.writeText(txt).then(() => showToast("📋 Copied: " + txt)).catch(() => showToast("📋 " + txt));
  };

  const doReset = useCallback(() => {
    clearInterval(timerRef.current);
    setSteps([]); setIdx(-1); setError(""); setPlaying(false); setDone(false); setAiErrors([]); setTermLines([]);
  }, []);

  const handleChangeLang = (l) => { setLang(l); setCode(TPL[l] ?? ""); doReset(); };

  const buildTerm = (stps, errs, aiErrs, aiReason) => {
    const ls = [];
    const ts = new Date().toTimeString().slice(0, 8);
    ls.push({ type:"output", text:`VisuoSlayer v2.0  ·  LinkedList  ·  ${ts}  ·  pid:${sessionId}` });
    ls.push({ type:"separator" });
    if (aiErrs.length > 0) {
      ls.push({ type:"prompt", text:`visualoslayer validate --lang=${lang} --ds=linked-list` });
      ls.push({ type:"blank" });
      if (aiReason) ls.push({ type:"stderr", text:aiReason });
      aiErrs.forEach(e => ls.push({ type:"error", text:`  L${e.line ?? "?"}  ${e.message}`, lineNum:e.line }));
      ls.push({ type:"blank" });
      ls.push({ type:"error", text:"Process exited with code 1" });
      return ls;
    }
    if (errs.length > 0) {
      ls.push({ type:"prompt", text:`visualoslayer run --lang=${lang}` });
      ls.push({ type:"blank" });
      errs.forEach(e => ls.push({ type:"stderr", text:e }));
      ls.push({ type:"blank" });
      ls.push({ type:"error", text:"Process exited with code 1" });
      return ls;
    }
    if (stps.length > 0) {
      ls.push({ type:"prompt", text:`visualoslayer run --lang=${lang} --ds=linked-list` });
      ls.push({ type:"blank" });
      stps.forEach(s => {
        const ie = s.type === "error";
        let out = "";
        switch (s.type) {
          case "insertFront": out = `insertFront(${s.value})  →  ${fmtList(s.list)}`; break;
          case "insertBack":  out = `insertBack(${s.value})   →  ${fmtList(s.list)}`; break;
          case "delete":      out = s.found ? `delete(${s.value})  →  removed  ·  ${fmtList(s.list)}` : `delete(${s.value})  →  not found`; break;
          case "search":      out = s.result >= 0 ? `search(${s.value})  →  index ${s.result}` : `search(${s.value})  →  not found`; break;
          case "reverse":     out = `reverse()  →  ${fmtList(s.list)}`; break;
          case "size":        out = `size()  →  ${s.result}`; break;
          case "traverse":    out = `traverse()  →  ${fmtList(s.list)}`; break;
        }
        ls.push({ type: ie ? "error" : s.type, text: out, lineNum: s.lineNum + 1 });
      });
      ls.push({ type:"blank" });
      ls.push({ type:"success", text:`${stps.length} op${stps.length !== 1 ? "s" : ""} completed  ·  Process exited with code 0` });
    }
    return ls;
  };

  const handleRun = async () => {
    doReset(); setValidating(true);
    const v = await validateWithVisuoSlayer(code, lang);
    setValidating(false);
    if (!v.valid) {
      setAiErrors(v.errors ?? []);
      setTermLines(buildTerm([], [], v.errors ?? [], v.reason ?? ""));
      return;
    }
    const { steps: s, errors } = runLinkedList(code, lang);
    if (errors.length) { setError(errors.join("\n")); setTermLines(buildTerm([], errors, [], "")); return; }
    setSteps(s); setIdx(0); bump(); setPlaying(true); setTermLines(buildTerm(s, [], [], ""));
  };

  const goTo = useCallback((i) => {
    clearInterval(timerRef.current); setPlaying(false); setIdx(Math.max(0, Math.min(i, steps.length - 1))); bump();
  }, [steps.length]);

  useEffect(() => {
    const h = (e) => { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); handleRun(); } };
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
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

  useEffect(() => { listRef.current?.querySelector(".sl-active")?.scrollIntoView({ block:"nearest", behavior:"smooth" }); }, [idx]);

  const onKeyDown = (e) => {
    if (e.key !== "Tab") return; e.preventDefault();
    const s = e.target.selectionStart, en = e.target.selectionEnd;
    const nv = code.slice(0, s) + "  " + code.slice(en); setCode(nv);
    requestAnimationFrame(() => { if (taRef.current) { taRef.current.selectionStart = s + 2; taRef.current.selectionEnd = s + 2; } });
  };

  const step = steps[idx] ?? null;
  const os = step ? (OP[step.type] ?? OP.insertBack) : null;
  const prog = steps.length ? Math.round(((idx + 1) / steps.length) * 100) : 0;
  const hasAiErrors = aiErrors.length > 0;
  const idle = steps.length === 0 && !error && !hasAiErrors;
  const lm = LANGS[lang];
  const errorLineSet = new Set(aiErrors.map(e => (e.line ?? 1) - 1));
  const prevList = idx > 0 ? steps[idx - 1].list : [];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Space+Grotesk:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html,body{height:100%;overflow:hidden}
        body{background:#050818;color:#c8d8f0;font-family:'DM Sans',sans-serif;}

        /* ── DESIGN TOKENS ── */
        :root {
          --cyan:#4cc9f0; --cyan-dim:rgba(76,201,240,0.18); --cyan-glow:rgba(76,201,240,0.45);
          --pink:#f72585; --pink-dim:rgba(247,37,133,0.15); --pink-glow:rgba(247,37,133,0.4);
          --purple:#c77dff; --purple-dim:rgba(199,125,255,0.15);
          --green:#39d98a; --green-dim:rgba(57,217,138,0.15); --green-glow:rgba(57,217,138,0.4);
          --yellow:#ffd60a; --orange:#ff6b35;
          --text-primary:#d4e4f7; --text-secondary:#6b8aaa; --text-muted:#3d5470;
          --border-subtle:rgba(255,255,255,0.07); --border-medium:rgba(255,255,255,0.12);
          --surface-0:#050818; --surface-1:rgba(8,14,36,0.95); --surface-2:rgba(12,20,48,0.8);
          --surface-3:rgba(16,26,58,0.7);
        }

        /* ── KEYFRAMES ── */
        @keyframes cur{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes nodeIn{
          0%{transform:translateY(-70px) scale(0.65) rotate(-10deg);opacity:0;filter:blur(4px)}
          55%{transform:translateY(8px) scale(1.08) rotate(1.5deg);opacity:1;filter:blur(0)}
          75%{transform:translateY(-3px) scale(0.97) rotate(-0.5deg)}
          100%{transform:none;opacity:1;filter:blur(0)}
        }
        @keyframes nodeDel{
          0%{transform:scale(1);opacity:1;filter:blur(0)}
          30%{transform:scale(1.15) translateY(-8px);filter:blur(1px);opacity:0.7}
          100%{transform:scale(0.2) translateY(-80px) rotate(15deg);opacity:0;filter:blur(6px)}
        }
        @keyframes nodeHi{
          0%{filter:brightness(1) saturate(1)}
          25%{filter:brightness(1.9) saturate(1.6) drop-shadow(0 0 12px currentColor)}
          50%{filter:brightness(2.2) saturate(1.8) drop-shadow(0 0 20px currentColor)}
          75%{filter:brightness(1.9) saturate(1.6) drop-shadow(0 0 12px currentColor)}
          100%{filter:brightness(1) saturate(1)}
        }
        @keyframes revNodes{
          0%{transform:scaleX(1) perspective(600px) rotateY(0)}
          30%{transform:scaleX(0.05) perspective(600px) rotateY(90deg)}
          60%{transform:scaleX(1.04) perspective(600px) rotateY(-3deg)}
          80%{transform:scaleX(0.98) perspective(600px) rotateY(1deg)}
          100%{transform:scaleX(1) perspective(600px) rotateY(0)}
        }
        @keyframes particleFlow{
          0%{opacity:0;transform:translateX(0) scale(0.3)}
          20%{opacity:1;transform:translateX(8px) scale(1)}
          80%{opacity:0.8;transform:translateX(30px) scale(0.7)}
          100%{opacity:0;transform:translateX(42px) scale(0.2)}
        }
        @keyframes arrowGlow{0%,100%{opacity:0.45;filter:brightness(1)}50%{opacity:1;filter:brightness(1.5)}}
        @keyframes blobFloat{
          0%,100%{transform:translate(0,0) scale(1)}
          33%{transform:translate(24px,-18px) scale(1.06)}
          66%{transform:translate(-14px,22px) scale(0.95)}
        }
        @keyframes blob2{
          0%,100%{transform:translate(0,0) scale(1)}
          40%{transform:translate(-28px,15px) scale(1.09)}
          70%{transform:translate(20px,-24px) scale(0.93)}
        }
        @keyframes revOverlay{
          0%{opacity:0;backdrop-filter:blur(0px)}
          15%{opacity:1;backdrop-filter:blur(8px)}
          80%{opacity:1}
          100%{opacity:0;backdrop-filter:blur(0px)}
        }
        @keyframes revText{
          0%{letter-spacing:-4px;opacity:0;transform:scaleX(0.6)}
          25%{letter-spacing:6px;opacity:1;transform:scaleX(1.02)}
          65%{letter-spacing:6px;opacity:1;transform:scaleX(1)}
          100%{letter-spacing:18px;opacity:0;transform:scaleX(1.1)}
        }
        @keyframes headPtrPulse{0%,100%{opacity:0.4;transform:scaleY(1)}50%{opacity:1;transform:scaleY(1.06)}}
        @keyframes rPulse{0%,100%{box-shadow:0 0 20px var(--cyan-glow)}50%{box-shadow:0 0 42px var(--cyan-glow),0 0 80px rgba(76,201,240,0.2)}}
        @keyframes gridScroll{0%{background-position:0 0}100%{background-position:40px 40px}}
        @keyframes nullBlink{0%,100%{opacity:0.25;border-color:rgba(255,255,255,0.1)}50%{opacity:0.6;border-color:rgba(255,255,255,0.25)}}
        @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
        @keyframes scanline{0%{top:-10%}100%{top:110%}}
        @keyframes metricPop{0%{transform:scale(1)}50%{transform:scale(1.12)}100%{transform:scale(1)}}
        @keyframes toastIn{0%{opacity:0;transform:translateY(8px) scale(0.94)}100%{opacity:1;transform:none}}
        @keyframes toastOut{0%{opacity:1;transform:none}100%{opacity:0;transform:translateY(-8px) scale(0.94)}}
        @keyframes stepPop{0%{transform:scale(0.88);opacity:0}60%{transform:scale(1.04)}100%{transform:scale(1);opacity:1}}
        @keyframes trailFade{0%{opacity:0.6}100%{opacity:0}}

        /* ── PAGE ── */
        .pg{height:100vh;display:flex;flex-direction:column;overflow:hidden;
          background:
            radial-gradient(ellipse 60% 45% at 5% 0%,rgba(76,201,240,0.09) 0%,transparent 55%),
            radial-gradient(ellipse 50% 40% at 95% 100%,rgba(247,37,133,0.08) 0%,transparent 52%),
            radial-gradient(ellipse 40% 35% at 50% 50%,rgba(114,9,183,0.04) 0%,transparent 60%),
            #050818}

        /* ── HEADER ── */
        .hd{flex-shrink:0;display:flex;align-items:center;gap:12px;padding:9px 24px;
          background:rgba(5,8,22,0.98);backdrop-filter:blur(20px);
          border-bottom:1px solid rgba(76,201,240,0.12);
          box-shadow:0 1px 0 rgba(76,201,240,0.06),0 4px 24px rgba(0,0,0,0.4)}
        .hd-logo{width:34px;height:34px;border-radius:9px;flex-shrink:0;
          background:linear-gradient(135deg,#0ea5e9,#4cc9f0 40%,#7209b7);
          display:flex;align-items:center;justify-content:center;font-size:17px;
          box-shadow:0 0 20px rgba(76,201,240,0.5),0 0 40px rgba(76,201,240,0.15);
          animation:rPulse 3s ease-in-out infinite}
        .hd-brand{font-family:'Space Grotesk',sans-serif;font-size:16px;font-weight:800;letter-spacing:-0.4px;
          background:linear-gradient(90deg,#4cc9f0 0%,#a78bfa 50%,#f72585 100%);
          background-size:200% auto;
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;
          animation:shimmer 4s linear infinite}
        .hd-tagline{font-size:9px;color:var(--text-muted);font-family:'JetBrains Mono',monospace;margin-top:1px;letter-spacing:0.04em}
        .hd-r{margin-left:auto;display:flex;align-items:center;gap:8px}
        .hd-pill{font-family:'JetBrains Mono',monospace;font-size:8.5px;padding:3px 10px;border-radius:20px;letter-spacing:0.07em;white-space:nowrap;font-weight:700}
        .hd-pid{font-family:'JetBrains Mono',monospace;font-size:8px;color:var(--text-muted);padding:3px 9px;border-radius:20px;border:1px solid var(--border-subtle);background:var(--surface-2)}
        .hd-ds-badge{font-family:'JetBrains Mono',monospace;font-size:8px;color:var(--cyan);padding:3px 9px;border-radius:20px;border:1px solid rgba(76,201,240,0.25);background:rgba(76,201,240,0.07);letter-spacing:0.08em}

        /* ── GRID ── */
        .main{flex:1;display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:10px 24px;min-height:0;overflow:hidden}

        /* ── PANELS ── */
        .panel{background:var(--surface-1);border:1px solid var(--border-subtle);border-radius:14px;
          display:flex;flex-direction:column;overflow:hidden;
          box-shadow:0 20px 60px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,255,255,0.04);min-height:0}
        .ph{padding:9px 14px;border-bottom:1px solid var(--border-subtle);
          background:rgba(8,14,38,0.85);display:flex;align-items:center;gap:7px;flex-shrink:0}
        .dot{width:9px;height:9px;border-radius:50%;transition:box-shadow 0.3s}
        .ptl{font-family:'JetBrains Mono',monospace;font-size:8px;color:var(--text-muted);
          text-transform:uppercase;letter-spacing:1.5px;margin-left:8px;font-weight:600}

        /* ── LEFT LAYOUT ── */
        .left{display:flex;flex-direction:column;min-height:0}
        .ed-wrap{flex:0 0 58%;display:flex;flex-direction:column;min-height:0;border-bottom:1px solid var(--border-subtle)}
        .tm-wrap{flex:1;display:flex;flex-direction:column;min-height:110px}

        /* ── LANG TABS ── */
        .lb{display:flex;gap:3px;flex-wrap:wrap;padding:8px 12px;
          border-bottom:1px solid var(--border-subtle);background:rgba(6,11,30,0.8);flex-shrink:0}
        .lt{padding:4px 10px;border-radius:6px;cursor:pointer;
          font-family:'JetBrains Mono',monospace;font-size:8.5px;font-weight:700;
          border:1px solid var(--border-subtle);background:transparent;
          color:var(--text-muted);transition:all 0.15s;letter-spacing:0.05em}
        .lt:hover{color:var(--text-secondary);border-color:var(--border-medium);background:rgba(255,255,255,0.04)}
        .lt.la{border-color:transparent;color:#e8f4ff;background:rgba(255,255,255,0.06);
          box-shadow:inset 0 1px 0 rgba(255,255,255,0.1)}

        /* ── ACTIVE LINE BAR ── */
        .alb{display:flex;align-items:center;gap:8px;padding:5px 14px;
          border-left:2px solid;min-height:28px;border-top:1px solid var(--border-subtle);
          flex-shrink:0;animation:fadeIn 0.18s ease;backdrop-filter:blur(4px)}
        .alb-ln{font-family:'JetBrains Mono',monospace;font-size:9px;font-weight:700;white-space:nowrap}
        .alb-code{font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--text-secondary);
          overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1}

        /* ── RUN BAR ── */
        .rr{padding:9px 13px;border-top:1px solid var(--border-subtle);
          display:flex;align-items:center;gap:8px;flex-shrink:0;background:rgba(4,8,22,0.6)}
        .btn-run{padding:7px 20px;border-radius:8px;
          background:linear-gradient(135deg,#0369a1,#0ea5e9,#4cc9f0);
          border:1px solid rgba(76,201,240,0.3);color:#fff;
          font-family:'JetBrains Mono',monospace;font-size:10.5px;font-weight:700;cursor:pointer;
          transition:all 0.18s;box-shadow:0 0 20px rgba(76,201,240,0.3),0 2px 8px rgba(0,0,0,0.4);
          letter-spacing:0.04em;position:relative;overflow:hidden}
        .btn-run::after{content:'';position:absolute;inset:0;
          background:linear-gradient(135deg,rgba(255,255,255,0.15) 0%,transparent 60%);
          border-radius:inherit;pointer-events:none}
        .btn-run:hover:not(:disabled){transform:translateY(-2px);
          box-shadow:0 0 36px rgba(76,201,240,0.55),0 6px 20px rgba(0,0,0,0.5)}
        .btn-run:active:not(:disabled){transform:translateY(0)}
        .btn-run.running{animation:rPulse 1.2s ease-in-out infinite;
          background:linear-gradient(135deg,#023e8a,#0077b6,#0ea5e9)}
        .btn-run:disabled{opacity:0.4;cursor:not-allowed;transform:none;box-shadow:none}
        .btn-rst{padding:7px 13px;border-radius:8px;background:transparent;
          border:1px solid rgba(248,113,113,0.25);color:#f87171;
          font-family:'JetBrains Mono',monospace;font-size:9.5px;font-weight:600;cursor:pointer;
          transition:all 0.16s}
        .btn-rst:hover{background:rgba(248,113,113,0.1);border-color:rgba(248,113,113,0.5);
          box-shadow:0 0 14px rgba(248,113,113,0.2)}
        .rr-hint{font-family:'JetBrains Mono',monospace;font-size:8px;color:var(--text-muted);
          letter-spacing:0.07em;padding:3px 7px;border-radius:5px;border:1px solid var(--border-subtle);
          background:var(--surface-2)}

        /* ── TERMINAL BAR ── */
        .term-bar{display:flex;align-items:center;gap:6px;padding:7px 14px;
          background:rgba(4,7,18,0.95);border-bottom:1px solid var(--border-subtle);
          border-top:1px solid var(--border-subtle);flex-shrink:0}

        /* ── METRICS BAR ── */
        .sv-metrics{display:flex;border-bottom:1px solid var(--border-subtle);
          background:rgba(4,8,26,0.75);flex-shrink:0}
        .sv-m{flex:1;padding:8px 10px;text-align:center;
          border-right:1px solid var(--border-subtle);display:flex;flex-direction:column;gap:3px;
          transition:background 0.2s}
        .sv-m:last-child{border-right:none}
        .sv-m.sv-m-active{background:rgba(76,201,240,0.05);animation:metricPop 0.3s ease}
        .sv-ml{font-family:'JetBrains Mono',monospace;font-size:6.5px;color:var(--text-muted);
          letter-spacing:0.2em;text-transform:uppercase;font-weight:600}
        .sv-mv{font-family:'JetBrains Mono',monospace;font-size:15px;font-weight:700;line-height:1.1;
          transition:color 0.3s}

        /* ── CANVAS ── */
        .ll-canvas{flex:1;position:relative;overflow:hidden;
          display:flex;align-items:center;justify-content:flex-start;padding:52px 24px 42px}

        /* Animated grid */
        .ll-grid{position:absolute;inset:0;pointer-events:none;
          background-image:
            linear-gradient(rgba(76,201,240,0.06) 1px,transparent 1px),
            linear-gradient(90deg,rgba(76,201,240,0.06) 1px,transparent 1px);
          background-size:38px 38px;animation:gridScroll 10s linear infinite}

        /* Scanline sweep */
        .ll-scan{position:absolute;left:0;right:0;height:80px;pointer-events:none;z-index:1;
          background:linear-gradient(to bottom,transparent,rgba(76,201,240,0.03),transparent);
          animation:scanline 6s ease-in-out infinite}

        /* Ambient blobs */
        .ll-blob{position:absolute;border-radius:50%;pointer-events:none;filter:blur(70px);mix-blend-mode:screen}
        .ll-blob-1{width:260px;height:260px;top:-60px;left:20px;
          background:radial-gradient(circle,rgba(76,201,240,0.14),transparent 65%);
          animation:blobFloat 14s ease-in-out infinite}
        .ll-blob-2{width:200px;height:200px;bottom:-20px;right:40px;
          background:radial-gradient(circle,rgba(247,37,133,0.11),transparent 65%);
          animation:blob2 11s ease-in-out infinite}
        .ll-blob-3{width:160px;height:160px;top:45%;left:48%;transform:translate(-50%,-50%);
          background:radial-gradient(circle,rgba(199,125,255,0.09),transparent 65%);
          animation:blobFloat 18s ease-in-out infinite reverse}

        /* ── NODES WRAP ── */
        .ll-nodes-wrap{position:relative;z-index:2;width:100%;
          overflow-x:auto;overflow-y:visible;
          padding:52px 8px 52px;
          scrollbar-width:thin;scrollbar-color:rgba(76,201,240,0.25) transparent}
        .ll-nodes-row{display:flex;align-items:center;gap:0;width:max-content}
        .ll-nodes-reversing{animation:revNodes 0.75s cubic-bezier(0.4,0,0.2,1) both}

        /* HEAD pointer */
        .ll-head-ptr{display:flex;flex-direction:column;align-items:center;margin-right:10px;flex-shrink:0}
        .ll-head-ptr-line{width:2px;height:32px;
          background:linear-gradient(to bottom,transparent,var(--cyan));
          animation:headPtrPulse 2.2s ease-in-out infinite;border-radius:2px}
        .ll-head-ptr-label{font-family:'JetBrains Mono',monospace;font-size:7.5px;
          color:var(--cyan);letter-spacing:0.12em;font-weight:700;opacity:0.85}

        /* ── NODE ── */
        .ll-node{border-radius:11px;border:1.5px solid rgba(255,255,255,0.15);
          position:relative;overflow:visible;flex-shrink:0;
          transition:box-shadow 0.25s,border-color 0.25s;cursor:default}
        .ll-node:hover{border-color:rgba(255,255,255,0.28)!important}
        .ll-node-new{animation:nodeIn 0.55s cubic-bezier(0.34,1.56,0.64,1) both}
        .ll-node-del{animation:nodeDel 0.5s cubic-bezier(0.4,0,1,1) both}
        .ll-node-hi{animation:nodeHi 0.7s ease both}

        /* Node tooltip on hover */
        .ll-node:hover .ll-node-tip{opacity:1;transform:translateY(0)}
        .ll-node-tip{position:absolute;bottom:-30px;left:50%;transform:translateX(-50%) translateY(4px);
          background:rgba(10,18,45,0.95);border:1px solid var(--border-medium);border-radius:6px;
          padding:3px 8px;font-family:'JetBrains Mono',monospace;font-size:8px;color:var(--text-secondary);
          white-space:nowrap;pointer-events:none;opacity:0;transition:all 0.15s;z-index:20;
          box-shadow:0 4px 12px rgba(0,0,0,0.4)}

        .ll-badge{position:absolute;font-family:'JetBrains Mono',monospace;font-size:7.5px;font-weight:700;
          padding:2px 8px;border-radius:20px;letter-spacing:0.1em;white-space:nowrap;
          box-shadow:0 2px 8px rgba(0,0,0,0.4)}

        /* ── ARROW ── */
        .ll-arrow{display:flex;align-items:center;position:relative;width:44px;flex-shrink:0;height:44px}
        .ll-arrow-line{flex:1;height:2px;
          background:linear-gradient(90deg,rgba(76,201,240,0.35),rgba(76,201,240,0.8));
          position:relative;animation:arrowGlow 2s ease-in-out infinite;border-radius:1px}
        .ll-arrow-head{width:0;height:0;
          border-top:5px solid transparent;border-bottom:5px solid transparent;
          border-left:9px solid rgba(76,201,240,0.85);
          filter:drop-shadow(0 0 4px rgba(76,201,240,0.6))}
        .ll-arrow-particles{position:absolute;top:50%;left:2px;transform:translateY(-50%);
          width:calc(100% - 10px);overflow:hidden;height:10px;pointer-events:none}
        .ll-particle{position:absolute;top:50%;transform:translateY(-50%);
          width:4px;height:4px;border-radius:50%;
          animation:particleFlow 1.4s ease-in-out infinite;animation-delay:var(--delay);
          box-shadow:0 0 4px currentColor}

        /* ── NULL TERMINATOR ── */
        .ll-null{padding:8px 14px;border-radius:9px;border:1px dashed rgba(255,255,255,0.18);
          background:rgba(255,255,255,0.025);flex-shrink:0;
          animation:nullBlink 2.5s ease-in-out infinite;display:flex;align-items:center;
          box-shadow:inset 0 1px 0 rgba(255,255,255,0.05)}

        /* ── EMPTY STATE ── */
        .ll-empty{display:flex;flex-direction:column;align-items:center;gap:10px;
          padding:20px;border:1px dashed rgba(76,201,240,0.12);border-radius:14px;
          background:rgba(76,201,240,0.02)}
        .ll-empty-icon{font-size:36px;opacity:0.35;animation:blobFloat 4s ease-in-out infinite}
        .ll-empty-text{font-family:'JetBrains Mono',monospace;font-size:9.5px;
          color:var(--text-muted);letter-spacing:0.1em}

        /* ── REVERSE OVERLAY ── */
        .ll-reverse-overlay{position:absolute;inset:0;display:flex;align-items:center;
          justify-content:center;pointer-events:none;z-index:10;
          animation:revOverlay 1.4s ease forwards;background:rgba(5,8,24,0.35)}
        .ll-reverse-text{font-family:'Space Grotesk',sans-serif;font-size:30px;font-weight:800;
          background:linear-gradient(90deg,var(--yellow),var(--orange),var(--pink),var(--yellow));
          background-size:200% auto;
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;
          animation:revText 1.4s ease forwards,shimmer 1s linear infinite;letter-spacing:6px;
          filter:drop-shadow(0 0 20px rgba(255,214,10,0.5))}

        /* ── OP INFO ── */
        .oi{padding:9px 15px;border-top:1px solid var(--border-subtle);
          background:rgba(4,8,24,0.6);min-height:58px;flex-shrink:0}
        .oi-badge{display:inline-flex;align-items:center;gap:7px;padding:4px 12px;
          border-radius:20px;margin-bottom:5px;font-family:'JetBrains Mono',monospace;
          font-size:9.5px;font-weight:700;animation:stepPop 0.22s ease;border:1px solid;letter-spacing:0.04em}
        .oi-msg{font-family:'JetBrains Mono',monospace;font-size:10px;line-height:1.6;
          animation:fadeUp 0.2s ease;color:var(--text-secondary)}
        .oi-idle{display:flex;align-items:center;gap:8px;font-family:'JetBrains Mono',monospace;
          font-size:9px;color:var(--text-muted);letter-spacing:0.04em;padding:6px 0}

        /* ── CONTROLS ── */
        .ctrl{display:flex;align-items:center;gap:5px;padding:7px 13px;
          border-top:1px solid var(--border-subtle);background:rgba(3,6,18,0.65);
          flex-wrap:wrap;flex-shrink:0}
        .cb{width:29px;height:27px;border-radius:7px;border:1px solid var(--border-medium);
          background:var(--surface-3);color:var(--text-secondary);font-size:11px;cursor:pointer;
          display:flex;align-items:center;justify-content:center;transition:all 0.14s;
          box-shadow:0 1px 3px rgba(0,0,0,0.3)}
        .cb:hover:not(:disabled){background:var(--cyan-dim);color:var(--cyan);
          border-color:rgba(76,201,240,0.45);box-shadow:0 0 12px var(--cyan-glow)}
        .cb:active:not(:disabled){transform:scale(0.93)}
        .cb:disabled{opacity:0.22;cursor:not-allowed}
        .cp{height:27px;padding:0 14px;border-radius:7px;
          background:linear-gradient(135deg,#0369a1,#0ea5e9,#4cc9f0);
          border:1px solid rgba(76,201,240,0.35);color:#fff;font-size:11px;font-weight:700;
          cursor:pointer;box-shadow:0 0 16px rgba(76,201,240,0.35);transition:all 0.15s;
          letter-spacing:0.02em}
        .cp:hover{transform:scale(1.06);box-shadow:0 0 28px rgba(76,201,240,0.55)}
        .cp:active{transform:scale(0.97)}
        .cp:disabled{opacity:0.25;cursor:not-allowed;transform:none;box-shadow:none}
        .csep{width:1px;height:16px;background:var(--border-subtle);margin:0 3px}
        .spd{display:flex;gap:2px}
        .sb{padding:3px 8px;border-radius:5px;cursor:pointer;
          font-family:'JetBrains Mono',monospace;font-size:8px;font-weight:700;
          border:1px solid var(--border-subtle);background:transparent;
          color:var(--text-muted);transition:all 0.12s}
        .sb:hover{color:var(--text-secondary);border-color:var(--border-medium)}
        .sb.sa{background:var(--cyan-dim);border-color:rgba(76,201,240,0.4);
          color:var(--cyan);box-shadow:0 0 8px rgba(76,201,240,0.2)}

        /* ── PROGRESS ── */
        .pr{display:flex;align-items:center;gap:8px;padding:6px 15px;
          border-top:1px solid var(--border-subtle);flex-shrink:0}
        .pt2{flex:1;height:4px;background:rgba(255,255,255,0.05);border-radius:99px;overflow:hidden;
          box-shadow:inset 0 1px 2px rgba(0,0,0,0.3)}
        .pf{height:100%;border-radius:99px;transition:width 0.4s cubic-bezier(0.4,0,0.2,1);
          background:linear-gradient(90deg,#0369a1,#4cc9f0,#c77dff);
          box-shadow:0 0 8px rgba(76,201,240,0.5)}
        .ptx{font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--text-secondary);
          min-width:32px;text-align:right}

        /* ── OP LOG ── */
        .slh{padding:6px 15px 3px;font-family:'JetBrains Mono',monospace;font-size:7px;
          color:var(--text-muted);letter-spacing:0.18em;text-transform:uppercase;font-weight:600;
          border-top:1px solid var(--border-subtle);flex-shrink:0;
          display:flex;align-items:center;justify-content:space-between}
        .slh-count{font-size:7px;color:var(--cyan);opacity:0.7}
        .sl{overflow-y:auto;padding:3px 8px 8px;display:flex;flex-direction:column;gap:1.5px;
          max-height:95px;flex-shrink:0;
          scrollbar-width:thin;scrollbar-color:rgba(76,201,240,0.2) transparent}
        .si{display:flex;align-items:center;gap:6px;padding:3px 8px;border-radius:5px;
          cursor:pointer;font-family:'JetBrains Mono',monospace;font-size:8px;
          color:var(--text-muted);transition:all 0.12s;border:1px solid transparent}
        .si:hover{background:var(--cyan-dim);color:var(--text-secondary);border-color:rgba(76,201,240,0.12)}
        .sl-active{background:rgba(76,201,240,0.09)!important;border-color:rgba(76,201,240,0.22)!important;
          color:var(--cyan)!important;box-shadow:inset 3px 0 0 var(--cyan)}
        .si-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0;transition:all 0.15s}
        .si-v{opacity:0.55;margin-left:2px}
        .si-ln{margin-left:auto;font-size:7px;color:var(--text-muted);opacity:0.7}
        .si-past .si-dot{background:var(--green)!important;box-shadow:0 0 5px var(--green-glow)}

        /* ── TOAST ── */
        .toast{position:fixed;bottom:24px;right:24px;padding:8px 16px;border-radius:9px;
          font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:600;
          background:rgba(10,20,50,0.97);border:1px solid var(--border-medium);
          color:var(--green);box-shadow:0 8px 24px rgba(0,0,0,0.5),0 0 16px var(--green-glow);
          z-index:9999;animation:toastIn 0.25s ease,toastOut 0.3s ease 1.8s forwards}

        @keyframes termSlideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}
        @keyframes termSlideUp{from{opacity:1;transform:none}to{opacity:0;transform:translateY(-8px)}}

        .tm-wrap{display:flex;flex-direction:column;min-height:0;
          transition:flex-basis 0.32s cubic-bezier(0.4,0,0.2,1),opacity 0.25s ease;overflow:hidden}
        .tm-wrap.tm-open{flex:1;min-height:110px;}
        .tm-wrap.tm-closed{flex:0 0 0px;min-height:0;opacity:0;pointer-events:none;}

        .term-body-wrap{flex:1;display:flex;flex-direction:column;min-height:0;
          animation:termSlideDown 0.28s cubic-bezier(0.4,0,0.2,1)}

        .term-toggle{display:flex;align-items:center;justify-content:center;
          width:18px;height:18px;border-radius:5px;border:1px solid var(--border-medium);
          background:rgba(255,255,255,0.04);cursor:pointer;flex-shrink:0;
          color:var(--text-secondary);font-size:9px;font-weight:700;
          transition:all 0.15s;margin-left:auto;font-family:'JetBrains Mono',monospace;
          line-height:1;user-select:none}
        .term-toggle:hover{background:var(--cyan-dim);color:var(--cyan);
          border-color:rgba(76,201,240,0.4);box-shadow:0 0 8px var(--cyan-glow)}

        .term-bar-closed{display:flex;align-items:center;gap:6px;padding:7px 14px;
          background:rgba(4,7,18,0.95);border-top:1px solid var(--border-subtle);flex-shrink:0;
          cursor:pointer;transition:background 0.15s}
        .term-bar-closed:hover{background:rgba(8,14,32,0.95)}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(76,201,240,0.2);border-radius:4px}
        ::-webkit-scrollbar-thumb:hover{background:rgba(76,201,240,0.4)}
        textarea::-webkit-scrollbar{width:4px}
        .ll-nodes-wrap::-webkit-scrollbar{height:4px}
      `}</style>

      <div className="pg">
        {/* HEADER */}
        <header className="hd">
          <div className="hd-logo">🔗</div>
          <div>
            <div className="hd-brand">VisuoSlayer</div>
            <div className="hd-tagline">Linked List DS Visualizer · Write · Run · Step through every pointer</div>
          </div>
          <div className="hd-r">
            <div className="hd-ds-badge">SINGLY LINKED LIST</div>
            <div className="hd-pill" style={{ color:lm.accent, background:`${lm.accent}12`, border:`1px solid ${lm.accent}28` }}>{lm.name}</div>
            <div className="hd-pid">pid:{sessionId}</div>
          </div>
        </header>

        <main className="main">
          {/* LEFT: editor + terminal */}
          <div className="panel left">
            <div className="ph">
              <span className="dot" style={{ background:"#ff5f57", boxShadow:"0 0 6px #ff5f57" }} />
              <span className="dot" style={{ background:"#ffbd2e", boxShadow:"0 0 6px #ffbd2e" }} />
              <span className="dot" style={{ background:"#28c840", boxShadow:"0 0 6px #28c840" }} />
              <span className="ptl">Code Editor</span>
              <span style={{ marginLeft:"auto", fontFamily:"'JetBrains Mono',monospace", fontSize:8, color:lm.accent, background:`${lm.accent}12`, border:`1px solid ${lm.accent}28`, padding:"2px 8px", borderRadius:20, fontWeight:700 }}>{lm.name}</span>
            </div>

            <div className="ed-wrap" style={{ flex: termOpen ? "0 0 58%" : "1" }}>
              <div className="lb">
                {Object.entries(LANGS).map(([k, m]) => (
                  <button key={k} className={`lt${lang === k ? " la" : ""}`}
                    onClick={() => handleChangeLang(k)}
                    style={lang === k ? { borderColor:`${m.accent}35`, color:m.accent, background:`${m.accent}0e` } : {}}
                  >{m.ext}</button>
                ))}
              </div>

              <CodeEditor code={code} setCode={setCode} step={step} errorLineSet={errorLineSet} onKeyDown={onKeyDown} taRef={taRef} />

              {step && os && (
                <div className="alb" style={{ borderColor:os.bd, background:os.bg }}>
                  <span style={{ color:os.c, fontSize:10 }}>{os.icon}</span>
                  <span className="alb-ln" style={{ color:os.c }}>L{step.lineNum + 1}</span>
                  <code className="alb-code">{step.codeLine}</code>
                </div>
              )}

              <div className="rr">
                <button className={`btn-run${playing || validating ? " running" : ""}`} onClick={handleRun} disabled={playing || validating}>
                  {validating ? "⟳ VisuoSlayer…" : playing ? "▶ Running…" : "▶  Run & Visualize"}
                </button>
                {(steps.length > 0 || error || hasAiErrors) && (
                  <button className="btn-rst" onClick={doReset}>↺ Reset</button>
                )}
                <span className="rr-hint">CTRL+ENTER</span>
              </div>
            </div>

            <div className={`tm-wrap${termOpen ? " tm-open" : " tm-closed"}`}>
              <div className="term-body-wrap" key={termOpen ? "open" : "closed"}>
                <div className="term-bar">
                  <span className="dot" style={{ background:"#ff5f57", boxShadow:"0 0 5px #ff5f57" }} />
                  <span className="dot" style={{ background:"#ffbd2e", boxShadow:"0 0 5px #ffbd2e" }} />
                  <span className="dot" style={{ background:"#28c840", boxShadow:"0 0 5px #28c840" }} />
                  <span style={{ marginLeft:8, fontFamily:"'JetBrains Mono',monospace", fontSize:8.5, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"1.2px", userSelect:"none" }}>visualoslayer — bash</span>
                  <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:8, color:"var(--text-muted)", marginLeft:8 }}>pid:{sessionId}</span>
                  <button className="term-toggle" onClick={() => setTermOpen(false)} title="Collapse terminal">▾</button>
                </div>
                <Terminal lines={termLines} sessionId={sessionId} validating={validating} />
              </div>
            </div>

            {!termOpen && (
              <div className="term-bar-closed" onClick={() => setTermOpen(true)} title="Expand terminal">
                <span className="dot" style={{ background:"#ff5f57", boxShadow:"0 0 4px #ff5f57" }} />
                <span className="dot" style={{ background:"#ffbd2e", boxShadow:"0 0 4px #ffbd2e" }} />
                <span className="dot" style={{ background:"#28c840", boxShadow:"0 0 4px #28c840" }} />
                <span style={{ marginLeft:8, fontFamily:"'JetBrains Mono',monospace", fontSize:8.5, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"1.2px" }}>visualoslayer — bash</span>
                {termLines.some(l => l.type === "error" || l.type === "stderr") && (
                  <span style={{ marginLeft:8, fontFamily:"'JetBrains Mono',monospace", fontSize:8, color:"#f87171", background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.25)", padding:"1px 7px", borderRadius:10 }}>errors</span>
                )}
                {termLines.some(l => l.type === "success") && (
                  <span style={{ marginLeft:8, fontFamily:"'JetBrains Mono',monospace", fontSize:8, color:"var(--green)", background:"var(--green-dim)", border:"1px solid rgba(57,217,138,0.25)", padding:"1px 7px", borderRadius:10 }}>ok</span>
                )}
                <span style={{ marginLeft:"auto", fontFamily:"'JetBrains Mono',monospace", fontSize:8.5, color:"var(--cyan)", fontWeight:700 }}>▴ open</span>
              </div>
            )}
          </div>

          {/* RIGHT: viz + info + controls + log */}
          <div className="panel">
            <div className="ph">
              <span className="dot" style={{ background:"#4cc9f0", boxShadow:"0 0 6px #4cc9f0" }} />
              <span className="dot" style={{ background:"#f72585", boxShadow:"0 0 6px #f72585" }} />
              <span className="dot" style={{ background:"#ffd60a", boxShadow:"0 0 6px #ffd60a" }} />
              <span className="ptl">Linked List Visualization</span>
              {steps.length > 0 && (
                <span style={{ marginLeft:"auto", fontFamily:"'JetBrains Mono',monospace", fontSize:8, color:"var(--cyan)", background:"var(--cyan-dim)", border:"1px solid rgba(76,201,240,0.25)", padding:"2px 9px", borderRadius:20, fontWeight:700 }}>
                  {idx + 1} / {steps.length}
                </span>
              )}
            </div>

            <div style={{ flex:1, display:"flex", flexDirection:"column", minHeight:0, overflow:"hidden" }}>
              <LinkedListViz step={step} animKey={animKey} idle={idle} prevList={prevList} />

              <div className="oi">
                {step && os ? (
                  <>
                    <div className="oi-badge" style={{ color:os.c, background:os.bg, borderColor:os.bd }}>
                      <span>{os.icon}</span>
                      <span>{os.label}</span>
                      {step.value != null && <span style={{ opacity:0.55 }}>({step.value})</span>}
                      {step.type === "search" && <span style={{ opacity:0.55 }}>→ {step.result >= 0 ? `idx ${step.result}` : "not found"}</span>}
                      {step.type === "size" && <span style={{ opacity:0.55 }}>→ {step.result}</span>}
                      {step.type === "delete" && <span style={{ opacity:0.55 }}>→ {step.found ? "removed" : "not found"}</span>}
                    </div>
                    <div className="oi-msg">{step.message}</div>
                  </>
                ) : (
                  <div className="oi-idle">
                    <span>🔗</span>
                    <span style={{ color:"var(--text-muted)" }}>{idle ? "Write a LinkedList class, use it below, hit Run" : hasAiErrors ? "VisuoSlayer found errors — see terminal" : error ? "Fix errors and run again" : validating ? "VisuoSlayer reviewing your code…" : "Waiting…"}</span>
                  </div>
                )}
              </div>

              {steps.length > 0 && (
                <div className="ctrl">
                  <button className="cb" title="First step" onClick={() => goTo(0)} disabled={idx <= 0}>⏮</button>
                  <button className="cb" title="Previous step" onClick={() => goTo(idx - 1)} disabled={idx <= 0}>◀</button>
                  <button className="cp" title={playing ? "Pause" : done ? "Restart" : "Play"} onClick={() => {
                    if (done || idx >= steps.length - 1) { setIdx(0); bump(); setDone(false); setPlaying(true); }
                    else { clearInterval(timerRef.current); setPlaying(p => !p); }
                  }}>{playing ? "⏸" : done ? "↺" : "▶"}</button>
                  <button className="cb" title="Next step" onClick={() => goTo(idx + 1)} disabled={idx >= steps.length - 1}>▶</button>
                  <button className="cb" title="Last step" onClick={() => goTo(steps.length - 1)} disabled={idx >= steps.length - 1}>⏭</button>
                  <div className="csep" />
                  <div className="spd">
                    {[[2, "0.5×"], [1.1, "1×"], [0.55, "2×"]].map(([s, lbl]) => (
                      <button key={s} className={`sb${speed === s ? " sa" : ""}`} onClick={() => setSpeed(s)} title={`Playback speed ${lbl}`}>{lbl}</button>
                    ))}
                  </div>
                  <div className="csep" />
                  <button className="cb" title="Copy current list state to clipboard" onClick={copyListState} style={{ fontSize:12 }}>📋</button>
                  <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:8.5, color:"var(--text-secondary)", marginLeft:2 }}>
                    <span style={{ color:"var(--cyan)", fontWeight:700 }}>{idx + 1}</span>
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
                      const sm = OP[s.type] ?? OP.insertBack;
                      const past = i < idx, active = i === idx;
                      return (
                        <div key={i} className={`si${active ? " sl-active" : ""}${past ? " si-past" : ""}`} onClick={() => goTo(i)}>
                          <span className="si-dot" style={{ background:past ? "var(--green)" : active ? sm.c : "var(--text-muted)", boxShadow:active ? `0 0 6px ${sm.c}` : past ? "0 0 5px var(--green-glow)" : "none" }} />
                          <span style={{ color:active ? sm.c : past ? "var(--text-secondary)" : "var(--text-muted)" }}>
                            {sm.label}
                            {s.value != null && <span className="si-v">({s.value})</span>}
                            {s.type === "search" && <span className="si-v"> → {s.result >= 0 ? `idx ${s.result}` : "–1"}</span>}
                            {s.type === "size" && <span className="si-v"> = {s.result}</span>}
                            {s.type === "delete" && <span style={{ color:s.found ? "var(--green)" : "#f87171", opacity:0.75 }}> {s.found ? "✓" : "✗"}</span>}
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
      {toast && <div className="toast">{toast}</div>}
    </>
  );
}