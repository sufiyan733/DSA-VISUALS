"use client";

import { useState, useRef, useEffect, useCallback } from "react";

// ── Color palette for nodes ─────────────────────────────────────────────────
const PALETTE = [
  { g1:"#f72585", g2:"#b5179e", glow:"rgba(247,37,133,0.7)",   border:"#f72585" },
  { g1:"#7209b7", g2:"#560bad", glow:"rgba(114,9,183,0.7)",    border:"#7209b7" },
  { g1:"#3a0ca3", g2:"#4361ee", glow:"rgba(67,97,238,0.7)",    border:"#4361ee" },
  { g1:"#4cc9f0", g2:"#4895ef", glow:"rgba(76,201,240,0.7)",   border:"#4cc9f0" },
  { g1:"#06d6a0", g2:"#1b9aaa", glow:"rgba(6,214,160,0.7)",    border:"#06d6a0" },
  { g1:"#ffd60a", g2:"#ffc300", glow:"rgba(255,214,10,0.7)",   border:"#ffd60a" },
  { g1:"#ff6b35", g2:"#ff4d6d", glow:"rgba(255,107,53,0.7)",   border:"#ff6b35" },
  { g1:"#c77dff", g2:"#9d4edd", glow:"rgba(199,125,255,0.7)",  border:"#c77dff" },
];
const col = (v) => PALETTE[Math.abs(Math.round(v) || 0) % PALETTE.length];

// ── Op styles ───────────────────────────────────────────────────────────────
const OP = {
  insertFront: { label:"insertFront", icon:"⬅", c:"#4cc9f0", bg:"rgba(76,201,240,0.10)", bd:"rgba(76,201,240,0.35)" },
  insertBack:  { label:"insertBack",  icon:"➡", c:"#06d6a0", bg:"rgba(6,214,160,0.10)",  bd:"rgba(6,214,160,0.35)"  },
  insertAt:    { label:"insertAt",    icon:"↕", c:"#ffd60a", bg:"rgba(255,214,10,0.10)", bd:"rgba(255,214,10,0.35)" },
  delete:      { label:"delete",      icon:"✂", c:"#f72585", bg:"rgba(247,37,133,0.10)", bd:"rgba(247,37,133,0.35)" },
  search:      { label:"search",      icon:"🔍",c:"#c77dff", bg:"rgba(199,125,255,0.10)",bd:"rgba(199,125,255,0.35)"},
  traverse:    { label:"traverse",    icon:"→", c:"#ff6b35", bg:"rgba(255,107,53,0.10)", bd:"rgba(255,107,53,0.35)" },
  reverse:     { label:"reverse",     icon:"⇄", c:"#ffd60a", bg:"rgba(255,214,10,0.10)", bd:"rgba(255,214,10,0.35)" },
  reverseStep: { label:"reverse…",   icon:"⇄", c:"#ffd60a", bg:"rgba(255,214,10,0.08)", bd:"rgba(255,214,10,0.28)" },
  size:        { label:"size",        icon:"#", c:"#4895ef", bg:"rgba(72,149,239,0.10)", bd:"rgba(72,149,239,0.35)" },
  error:       { label:"ERROR",       icon:"⚠", c:"#ef4444", bg:"rgba(239,68,68,0.10)",  bd:"rgba(239,68,68,0.35)"  },
};

// ── Language templates ───────────────────────────────────────────────────────
const LANGS = {
  c:          { name:"C",          ext:"C",   accent:"#a8d8ea", group:"lang" },
  custom:     { name:"Custom",     ext:"✎",   accent:"#c77dff", group:"custom" },
  javascript: { name:"JavaScript", ext:"JS",  accent:"#f7df1e", group:"lang" },
  typescript: { name:"TypeScript", ext:"TS",  accent:"#3178c6", group:"lang" },
  python:     { name:"Python",     ext:"PY",  accent:"#4ec9b0", group:"lang" },
  java:       { name:"Java",       ext:"JV",  accent:"#ed8b00", group:"lang" },
  cpp:        { name:"C++",        ext:"C++", accent:"#00b4d8", group:"lang" },
  csharp:     { name:"C#",         ext:"C#",  accent:"#9b4f96", group:"lang" },
  go:         { name:"Go",         ext:"GO",  accent:"#00add8", group:"lang" },
  rust:       { name:"Rust",       ext:"RS",  accent:"#f46623", group:"lang" },
};

const LINE_H = 21;

const TPL = {
c:`// Linked List — C
#include <stdio.h>
#include <stdlib.h>

typedef struct Node {
    int value;
    struct Node* next;
} Node;

typedef struct {
    Node* head;
    int length;
} LinkedList;

Node* newNode(int value) {
    Node* n = (Node*)malloc(sizeof(Node));
    n->value = value;
    n->next  = NULL;
    return n;
}

void insertFront(LinkedList* ll, int value) {
    Node* n = newNode(value);
    n->next  = ll->head;
    ll->head = n;
    ll->length++;
}

void insertBack(LinkedList* ll, int value) {
    Node* n = newNode(value);
    if (!ll->head) { ll->head = n; ll->length++; return; }
    Node* cur = ll->head;
    while (cur->next) cur = cur->next;
    cur->next = n;
    ll->length++;
}

int delete(LinkedList* ll, int value) {
    if (!ll->head) return 0;
    if (ll->head->value == value) {
        Node* tmp = ll->head;
        ll->head  = ll->head->next;
        free(tmp); ll->length--;
        return 1;
    }
    Node* cur = ll->head;
    while (cur->next) {
        if (cur->next->value == value) {
            Node* tmp = cur->next;
            cur->next = cur->next->next;
            free(tmp); ll->length--;
            return 1;
        }
        cur = cur->next;
    }
    return 0;
}

int search(LinkedList* ll, int value) {
    Node* cur = ll->head; int i = 0;
    while (cur) {
        if (cur->value == value) return i;
        cur = cur->next; i++;
    }
    return -1;
}

void reverse(LinkedList* ll) {
    Node* prev = NULL, *cur = ll->head;
    while (cur) {
        Node* nxt = cur->next;
        cur->next = prev;
        prev = cur; cur = nxt;
    }
    ll->head = prev;
}

int size(LinkedList* ll) { return ll->length; }

int main() {
    LinkedList ll = { NULL, 0 };
    insertBack(&ll, 10);
    insertBack(&ll, 25);
    insertBack(&ll, 37);
    insertFront(&ll, 5);
    search(&ll, 25);
    delete(&ll, 25);
    insertBack(&ll, 99);
    reverse(&ll);
    size(&ll);
    return 0;
}`,

custom: ``,

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
    case "reverseStep": {
      const phase = s.phase;
      if (phase === "init")  return `reverse()  →  init: prev=NULL, cur=${s.origList[s.curIdx] ?? "NULL"}`;
      if (phase === "swap")  return `reverse()  →  cur[${s.curIdx}]=${s.origList[s.curIdx]} · cur.next ← prev (${s.prevIdx >= 0 ? s.origList[s.prevIdx] : "NULL"})  ·  ${s.swappedCount}/${s.total} done`;
      if (phase === "done")  return `reverse()  →  complete ✓  list: ${fmtList(s.list)}`;
      return `reverse()  step ${s.swappedCount}/${s.total}`;
    }
    case "size":        return `size()  →  ${s.result}`;
    default: return "";
  }
}

function fmtList(arr) {
  if (!arr.length) return "NULL";
  return arr.map(v => v).join(" → ") + " → NULL";
}

// ── Expand a single reverse() call into per-iteration micro-steps ────────────
// Each step carries:
//   origList   – the original order (used as stable index reference throughout)
//   list       – the *current* state of the list (for metrics/final display)
//   arrows     – array of length origList.length-1:
//                  "fwd"  = original forward arrow  (not yet swapped)
//                  "rev"  = reversed backward arrow (already swapped)
//                  "cur"  = the arrow currently being redirected (glowing)
//   prevIdx    – index in origList of the `prev` pointer (-1 = NULL)
//   curIdx     – index in origList of the `cur`  pointer (-1 = done)
//   nextIdx    – index in origList of the `next` pointer (-1 = NULL)
//   swappedCount – how many nodes have been processed
//   phase      – "init" | "swap" | "done"
function expandReverseSteps(origList, lineNum, codeLine) {
  if (!origList.length) return [];
  const n = origList.length;
  const steps = [];
  const base = { origList:[...origList], lineNum, codeLine, total:n };

  // Phase 0 — show initial state before any work
  const initArrows = Array(n - 1).fill("fwd");
  steps.push({
    type:"reverseStep", phase:"init",
    ...base,
    list:[...origList],
    arrows:[...initArrows],
    prevIdx:-1, curIdx:0, nextIdx:origList.length>1?1:-1,
    swappedCount:0,
    message: buildMessage({ type:"reverseStep", phase:"init", origList, curIdx:0, prevIdx:-1, swappedCount:0, total:n }),
  });

  // Simulate the while loop: prev=null, cur=head → process each node
  const arrows = Array(n - 1).fill("fwd");
  for (let ci = 0; ci < n; ci++) {
    const ni = ci + 1 < n ? ci + 1 : -1; // nextIdx in origList
    const pi = ci - 1;                    // prevIdx in origList (-1 = NULL)

    // Mark the current arrow (ci → ci+1) as actively being redirected
    const swapArrows = [...arrows];
    if (ci < n - 1) swapArrows[ci] = "cur";

    const swappedCount = ci; // ci nodes already done before this step
    steps.push({
      type:"reverseStep", phase:"swap",
      ...base,
      // list still in original order during the process (we show pointer labels, not reorder nodes)
      list:[...origList],
      arrows:[...swapArrows],
      prevIdx:pi, curIdx:ci, nextIdx:ni,
      swappedCount,
      message: buildMessage({ type:"reverseStep", phase:"swap", origList, curIdx:ci, prevIdx:pi, swappedCount, total:n }),
    });

    // After showing the swap, mark that arrow as reversed
    if (ci < n - 1) arrows[ci] = "rev";
  }

  // Final "done" step — list is now reversed
  const finalList = [...origList].reverse();
  const doneArrows = Array(n - 1).fill("rev");
  steps.push({
    type:"reverseStep", phase:"done",
    ...base,
    list:[...finalList],
    arrows:[...doneArrows],
    prevIdx: n - 1, curIdx:-1, nextIdx:-1,
    swappedCount: n,
    message: buildMessage({ type:"reverseStep", phase:"done", origList, list:finalList, swappedCount:n, total:n }),
  });

  return steps;
}

function runLinkedList(code, lang) {
  if (!code.trim()) return { steps: [], errors: ["Please write some code first."] };
  if (lang === "custom") return parseGenericLL(code, lang);
  if (lang === "javascript" || lang === "typescript") return runJSLinkedList(code);
  if (lang === "c") return parseCLinkedList(code);
  return parseGenericLL(code, lang);
}

// ── C-specific parser ────────────────────────────────────────────────────────
function parseCLinkedList(code) {
  const steps = [], list = [];
  const lines = code.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const t = raw.trim();
    if (!t || t.startsWith("//") || t.startsWith("*") || t.startsWith("#")) continue;

    // insertBack / insertFront patterns for C: insertBack(&ll, 10);
    const ibRe = /\binsertBack\s*\(\s*&?\w+\s*,\s*(-?[\d.]+)\s*\)/;
    const ifRe = /\binsertFront\s*\(\s*&?\w+\s*,\s*(-?[\d.]+)\s*\)/;
    const delRe = /\bdelete\s*\(\s*&?\w+\s*,\s*(-?[\d.]+)\s*\)/;
    const srRe  = /\bsearch\s*\(\s*&?\w+\s*,\s*(-?[\d.]+)\s*\)/;
    const revRe = /\breverse\s*\(\s*&?\w+\s*\)/;
    const szRe  = /\bsize\s*\(\s*&?\w+\s*\)/;

    let m;
    if ((m = ibRe.exec(t))) {
      const v = parseFloat(m[1]); list.push(v);
      steps.push({ type:"insertBack", value:v, list:[...list], lineNum:i, codeLine:t, message:buildMessage({type:"insertBack",value:v,list:[...list]}) });
    } else if ((m = ifRe.exec(t))) {
      const v = parseFloat(m[1]); list.unshift(v);
      steps.push({ type:"insertFront", value:v, list:[...list], lineNum:i, codeLine:t, message:buildMessage({type:"insertFront",value:v,list:[...list]}) });
    } else if ((m = delRe.exec(t))) {
      const v = parseFloat(m[1]); const idx = list.indexOf(v); const found = idx >= 0;
      if (found) list.splice(idx, 1);
      steps.push({ type:"delete", value:v, found, list:[...list], lineNum:i, codeLine:t, message:buildMessage({type:"delete",value:v,found,list:[...list]}) });
    } else if ((m = srRe.exec(t))) {
      const v = parseFloat(m[1]); const result = list.indexOf(v);
      steps.push({ type:"search", value:v, result, list:[...list], lineNum:i, codeLine:t, message:buildMessage({type:"search",value:v,result,list:[...list]}) });
    } else if (revRe.test(t)) {
      const revSteps = expandReverseSteps([...list], i, t);
      steps.push(...revSteps);
      list.reverse();
    } else if (szRe.test(t)) {
      steps.push({ type:"size", result:list.length, list:[...list], lineNum:i, codeLine:t, message:buildMessage({type:"size",result:list.length,list:[...list]}) });
    }
  }

  if (!steps.length) return { steps:[], errors:["No linked list operations detected in C code.\nMake sure main() calls insertBack(&ll,N), insertFront(&ll,N), delete(&ll,N), search(&ll,N), reverse(&ll), or size(&ll)."] };
  return { steps, errors: [] };
}

function runJSLinkedList(code) {
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
    while (cur) {
      if (cur.value === value) { __S.push({ type:"search", value, result: idx, list: this._toArray() }); return idx; }
      cur = cur.next; idx++;
    }
    __S.push({ type:"search", value, result: -1, list: this._toArray() });
    return -1;
  }
  reverse() {
    const __before = this._toArray();
    let prev = null, cur = this.head;
    while (cur) { let n = cur.next; cur.next = prev; prev = cur; cur = n; }
    this.head = prev;
    __S.push({ type:"__reverseMarker", listBefore: __before, list: this._toArray() });
  }
  traverse() { __S.push({ type:"traverse", list: this._toArray() }); return this._toArray(); }
  size() { __S.push({ type:"size", result: this.length, list: this._toArray() }); return this.length; }
}
${stripClassDefs(code)}
return __S;`;

  try {
    const fn = new Function("console", instrumented);
    const raw = fn({ log:()=>{}, warn:()=>{}, error:()=>{}, info:()=>{} });
    if (!raw?.length) return { steps: [], errors: ["No linked list operations detected."] };
    const lines = code.split("\n");
    const opLines = [];
    for (let i = 0; i < lines.length; i++) {
      const t = lines[i].trim();
      if (t.startsWith("//") || t.startsWith("*") || !t) continue;
      if (/\.(insertFront|insertBack|insertAt|delete|search|reverse|traverse|size|insert_front|insert_back|delete_node|Delete|Insert|Search|Reverse|Size)\s*\(/.test(t))
        opLines.push(i);
    }
    // Expand __reverseMarker events into micro-steps
    const steps = [];
    let opIdx = 0;
    for (const s of raw) {
      const lineNum = opLines[opIdx] ?? 0;
      const codeLine = lines[lineNum]?.trim() ?? "";
      opIdx++;
      if (s.type === "__reverseMarker") {
        const revSteps = expandReverseSteps(s.listBefore, lineNum, codeLine);
        steps.push(...revSteps);
      } else {
        steps.push({ ...s, lineNum, codeLine, message: buildMessage(s) });
      }
    }
    return { steps, errors: [] };
  } catch (e) {
    return { steps: [], errors: [e.message] };
  }
}

function stripClassDefs(code) {
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
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    if (!t || t.startsWith("//") || t.startsWith("#") || t.startsWith("*")) continue;

    const ibRe = /\.(insertBack|insert_back|InsertBack|append|Push|push_back)\s*\(\s*(-?[\d.]+)\s*\)/;
    const ifRe = /\.(insertFront|insert_front|InsertFront|prepend|push_front)\s*\(\s*(-?[\d.]+)\s*\)/;
    const delRe = /\.(delete|Delete|delete_node|remove|Remove)\s*\(\s*(-?[\d.]+)\s*\)/;
    const srRe  = /\.(search|Search|find|Find|contains|Contains)\s*\(\s*(-?[\d.]+)\s*\)/;
    const revRe = /\.(reverse|Reverse)\s*\(\s*\)/;
    const szRe  = /\.(size|Size|length|Length)\s*\(\s*\)/;

    let m;
    if ((m = ibRe.exec(t))) {
      const v = parseFloat(m[2]); list.push(v);
      steps.push({ type:"insertBack", value:v, list:[...list], lineNum:i, codeLine:t, message:buildMessage({type:"insertBack",value:v,list:[...list]}) });
    } else if ((m = ifRe.exec(t))) {
      const v = parseFloat(m[2]); list.unshift(v);
      steps.push({ type:"insertFront", value:v, list:[...list], lineNum:i, codeLine:t, message:buildMessage({type:"insertFront",value:v,list:[...list]}) });
    } else if ((m = delRe.exec(t))) {
      const v = parseFloat(m[2]); const idx = list.indexOf(v); const found = idx >= 0;
      if (found) list.splice(idx, 1);
      steps.push({ type:"delete", value:v, found, list:[...list], lineNum:i, codeLine:t, message:buildMessage({type:"delete",value:v,found,list:[...list]}) });
    } else if ((m = srRe.exec(t))) {
      const v = parseFloat(m[2]); const result = list.indexOf(v);
      steps.push({ type:"search", value:v, result, list:[...list], lineNum:i, codeLine:t, message:buildMessage({type:"search",value:v,result,list:[...list]}) });
    } else if (revRe.test(t)) {
      const revSteps = expandReverseSteps([...list], i, t);
      steps.push(...revSteps);
      list.reverse();
    } else if (szRe.test(t)) {
      steps.push({ type:"size", result:list.length, list:[...list], lineNum:i, codeLine:t, message:buildMessage({type:"size",result:list.length,list:[...list]}) });
    }
  }

  if (!steps.length) return { steps:[], errors:["No linked list operations detected.\nCall insertBack(N), insertFront(N), delete(N), search(N), reverse(), or size()."] };
  return { steps, errors: [] };
}

// ── AI Validation ────────────────────────────────────────────────────────────
async function validateWithVisuoSlayer(code, lang) {
  if (lang === "custom") {
    // For custom, just try to run it directly — skip AI validation
    return { valid: true, reason: "", errors: [], apiError: null };
  }
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
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ messages:[{ role:"user", content:prompt }] }),
    });
    const data = await res.json();
    if (data.error) return { valid:true, reason:"", errors:[], apiError:data.error };
    const raw = data.content ?? "";
    const cleaned = raw.replace(/```json|```/gi, "").trim();
    const parsed = JSON.parse(cleaned);
    return { valid:!!parsed.valid, reason:parsed.reason??"", errors:Array.isArray(parsed.errors)?parsed.errors:[], apiError:null };
  } catch(e) {
    return { valid:true, reason:"", errors:[], apiError:e.message };
  }
}

// ── Terminal ─────────────────────────────────────────────────────────────────
function Terminal({ lines, sessionId, validating, currentStepIndex }) {
  const bodyRef = useRef(null);
  const lineRefs = useRef({});
  useEffect(() => {
    if (currentStepIndex === undefined || currentStepIndex === -1) return;
    const targetLine = lineRefs.current[currentStepIndex];
    if (targetLine && bodyRef.current) targetLine.scrollIntoView({ block:"nearest", behavior:"smooth" });
  }, [currentStepIndex]);
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [lines, validating]);

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", background:"#06080f", minHeight:0, fontFamily:"'JetBrains Mono',monospace" }}>
      <div ref={bodyRef} style={{ flex:1, overflowY:"auto", padding:"10px 0", scrollbarWidth:"thin", scrollbarColor:"#151e2e transparent" }}>
        {lines.length === 0 && !validating && (
          <div style={{ padding:"3px 18px", display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ color:"#39d98a", userSelect:"none" }}>$</span>
            <span style={{ animation:"cur 1.1s step-end infinite", color:"#1e3a22", marginLeft:4 }}>_</span>
          </div>
        )}
        {lines.map((line, i) => (
          <TermLine key={i} line={line} isLast={i===lines.length-1&&!validating}
            stepIndex={line.stepIndex} currentStepIndex={currentStepIndex}
            lineRef={el => lineRefs.current[line.stepIndex] = el} />
        ))}
        {validating && (
          <div style={{ padding:"3px 18px", display:"flex", alignItems:"center", gap:9 }}>
            <span style={{ display:"inline-block", width:11, height:11, borderRadius:"50%", border:"1.5px solid rgba(76,201,240,0.18)", borderTopColor:"#4cc9f0", animation:"spin 0.7s linear infinite", flexShrink:0 }} />
            <span style={{ color:"#2d3f5a", fontSize:11 }}>VisuoSlayer reviewing your implementation…</span>
          </div>
        )}
      </div>
    </div>
  );
}

function TermLine({ line, isLast, stepIndex, currentStepIndex, lineRef }) {
  const [vis, setVis] = useState(false);
  useEffect(() => { const t = setTimeout(()=>setVis(true), 15); return ()=>clearTimeout(t); }, []);
  const isActive = stepIndex !== undefined && stepIndex === currentStepIndex && currentStepIndex !== -1;
  if (line.type === "separator") return <div style={{ margin:"5px 18px", borderTop:"1px solid rgba(255,255,255,0.04)", opacity:vis?1:0, transition:"opacity 0.12s" }} />;
  if (line.type === "blank") return <div style={{ height:7 }} />;
  if (line.type === "prompt") return (
    <div style={{ padding:"2px 18px", display:"flex", alignItems:"center", gap:7, opacity:vis?1:0, transition:"opacity 0.1s" }}>
      <span style={{ color:"#39d98a", userSelect:"none", flexShrink:0 }}>$</span>
      <span style={{ color:"#3d6e9a", fontSize:10 }}>{line.text}</span>
    </div>
  );
  const cm = {
    insertFront:"#4cc9f0", insertBack:"#39d98a", delete:"#f72585", search:"#c77dff",
    reverse:"#ffd60a", size:"#4895ef", traverse:"#ff6b35",
    error:"#f87171", stderr:"#f87171", success:"#39d98a", warn:"#fbbf24", info:"#60a5fa",
    output:"#4a5e7a", stdout:"#4a6080"
  };
  const pm = {
    insertFront:"⬅", insertBack:"➡", delete:"✂", search:"🔍", reverse:"⇄", size:"#", traverse:"→",
    error:"✗", stderr:"✗", success:"✓", warn:"⚠", info:"·", output:"", stdout:""
  };
  const c = cm[line.type] ?? "#3a4a62";
  const pfx = pm[line.type] ?? "";
  return (
    <div ref={lineRef} style={{
      padding:"1.5px 18px", display:"flex", alignItems:"flex-start",
      opacity:vis?1:0, transition:"opacity 0.09s",
      background: isActive ? "rgba(76,201,240,0.08)" : "transparent",
      borderLeft: isActive ? "2px solid #4cc9f0" : "2px solid transparent",
    }}>
      <span style={{ color:c, width:20, flexShrink:0, fontSize:10, paddingTop:2 }}>{pfx}</span>
      <span style={{ color:c, wordBreak:"break-word", lineHeight:1.65, flex:1, fontSize:10.5 }}>
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
      <div ref={lnRef} style={{ width:44, flexShrink:0, background:"rgba(4,7,18,0.7)", borderRight:"1px solid rgba(255,255,255,0.04)", overflowY:"hidden", overflowX:"hidden", paddingTop:16, paddingBottom:16, display:"flex", flexDirection:"column", userSelect:"none", pointerEvents:"none", scrollbarWidth:"none" }}>
        {lines.map((_, i) => {
          const isAct = step?.lineNum === i;
          const isErr = errorLineSet.has(i);
          return (
            <div key={i} style={{ height:LINE_H, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"flex-end", paddingRight:9, fontFamily:"'JetBrains Mono',monospace", fontSize:10.5, lineHeight:1, color:isErr?"#ef4444":isAct?"#4cc9f0":"#1c2738", background:isErr?"rgba(239,68,68,0.07)":isAct?"rgba(76,201,240,0.07)":"transparent", borderRadius:3, transition:"color 0.12s,background 0.12s" }}>{i + 1}</div>
          );
        })}
      </div>
      {step && (
        <div style={{ position:"absolute", left:44, right:0, height:LINE_H, top:16+step.lineNum*LINE_H, background:"rgba(76,201,240,0.04)", borderLeft:"2px solid rgba(76,201,240,0.4)", pointerEvents:"none", transition:"top 0.18s ease", zIndex:1 }} />
      )}
      {[...errorLineSet].map(i => (
        <div key={`e${i}`} style={{ position:"absolute", left:44, right:0, height:LINE_H, top:16+i*LINE_H, background:"rgba(239,68,68,0.05)", borderLeft:"2px solid rgba(239,68,68,0.4)", pointerEvents:"none", zIndex:1 }} />
      ))}
      <textarea ref={taRef} style={{ flex:1, padding:`16px 16px 16px 12px`, background:"transparent", border:"none", outline:"none", color:"#7ecfff", fontFamily:"'JetBrains Mono',monospace", fontSize:11.5, lineHeight:`${LINE_H}px`, resize:"none", caretColor:"#4cc9f0", tabSize:2, whiteSpace:"pre", overflowY:"auto", overflowX:"auto", scrollbarWidth:"thin", scrollbarColor:"#151e2e transparent", position:"relative", zIndex:2, WebkitUserSelect:"text", touchAction:"manipulation" }}
        value={code} onChange={e=>setCode(e.target.value)} onKeyDown={onKeyDown} spellCheck={false}
        placeholder="// Write your LinkedList implementation here…"
        autoCorrect="off" autoCapitalize="none" autoComplete="off"
      />
    </div>
  );
}

// ── Node component (works for both compact/full, always shows HEAD/TAIL) ────
function LLNode({ value, index, isHead, isTail, isHighlighted, isNew, isDeleting, animKey, showPointer, compact, hideArrow }) {
  const c = col(value);
  const nodeW  = compact ? 42  : 58;
  const nodeH  = compact ? 36  : 50;
  const valFS  = compact ? 13  : 16;
  const idxFS  = compact ? 6.5 : 8.5;
  const badgeFS= compact ? 6   : 8;
  const badgeP = compact ? "2px 6px" : "3px 10px";

  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", position:"relative", paddingTop: compact ? 32 : 40, paddingBottom: compact ? 28 : 36 }}>
      {/* HEAD badge — floats above, in the column layout so it gets real space */}
      {isHead ? (
        <div style={{
          position:"absolute", top:0, left:"50%", transform:"translateX(-50%)",
          background:"rgba(76,201,240,0.2)", border:"1.5px solid rgba(76,201,240,0.7)",
          color:"#4cc9f0", fontSize:badgeFS, padding:badgeP, borderRadius:20,
          fontFamily:"'JetBrains Mono',monospace", fontWeight:900,
          whiteSpace:"nowrap", letterSpacing:"0.12em",
          boxShadow:"0 0 12px rgba(76,201,240,0.5), 0 0 24px rgba(76,201,240,0.2)",
          animation:"headPulse 2s ease-in-out infinite",
          zIndex:5,
        }}>▼ HEAD</div>
      ) : (
        /* spacer so all nodes align the same vertical center */
        <div style={{ position:"absolute", top:0, height: compact?18:22 }} />
      )}

      {/* Index label */}
      <div style={{ position:"absolute", top: compact?18:22, left:"50%", transform:"translateX(-50%)", fontFamily:"'JetBrains Mono',monospace", fontSize:idxFS, color:"rgba(180,210,255,0.45)", whiteSpace:"nowrap", fontWeight:600, letterSpacing:"0.04em", zIndex:4 }}>[{index}]</div>

      {/* The node box */}
      <div style={{ display:"flex", alignItems:"center" }}>
        <div
          className={[
            "ll-node",
            isNew      ? "ll-node-new"  : "",
            isDeleting ? "ll-node-del"  : "",
            isHighlighted ? "ll-node-hi": "",
          ].filter(Boolean).join(" ")}
          style={{
            width:   nodeW,
            height:  nodeH,
            background: `linear-gradient(135deg,${c.g1},${c.g2})`,
            boxShadow: isHighlighted
              ? `0 0 32px ${c.glow}, 0 0 64px ${c.glow}50, inset 0 1px 0 rgba(255,255,255,0.35)`
              : `0 0 16px ${c.glow}60, 0 4px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.18)`,
            borderColor: isHighlighted ? c.border : "rgba(255,255,255,0.14)",
            borderRadius: compact ? 8 : 12,
            border: "1.5px solid",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            cursor: "default",
            transition: "box-shadow 0.25s, border-color 0.25s",
            overflow: "visible",
          }}
        >
          {/* Shine overlay */}
          <div style={{ position:"absolute", inset:0, borderRadius:"inherit", background:"linear-gradient(135deg,rgba(255,255,255,0.22) 0%,transparent 55%)", pointerEvents:"none" }} />

          {/* Value */}
          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:valFS, fontWeight:800, color:"#fff", textShadow:`0 2px 10px rgba(0,0,0,0.5)`, position:"relative", zIndex:1 }}>{value}</span>

          {/* Search highlight rings */}
          {isHighlighted && (
            <>
              <div className="ll-ring-1" style={{ position:"absolute", inset:-5, borderRadius: compact ? 13 : 17, border:`2px solid ${c.border}`, animation:"ringExpand 0.7s ease forwards", pointerEvents:"none" }} />
              <div className="ll-ring-2" style={{ position:"absolute", inset:-10, borderRadius: compact ? 18 : 22, border:`1.5px solid ${c.border}`, animation:"ringExpand 0.7s 0.12s ease forwards", pointerEvents:"none", opacity:0.6 }} />
            </>
          )}

          {/* Pointer info (desktop only) */}
          {!compact && (
            <div style={{ position:"absolute", bottom:-22, left:"50%", transform:"translateX(-50%)", fontSize:7.5, color:"rgba(76,201,240,0.4)", fontFamily:"'JetBrains Mono',monospace", whiteSpace:"nowrap" }}>
              {showPointer ? "next →" : "next = NULL"}
            </div>
          )}
        </div>

        {/* Arrow connector — skipped when hideArrow=true (caller renders its own) */}
        {showPointer && !hideArrow && (
          <div className="ll-arrow" style={{ width: compact ? 30 : 46, height: compact ? 28 : 44, flexShrink:0 }}>
            <div style={{ flex:1, height: compact?1.5:2, background:`linear-gradient(90deg,${c.g1}70,${c.g2})`, borderRadius:2, animation:"arrowGlow 2s ease-in-out infinite" }} />
            <div style={{ width:0, height:0, borderTop:`${compact?3:5}px solid transparent`, borderBottom:`${compact?3:5}px solid transparent`, borderLeft:`${compact?6:9}px solid ${c.g2}`, filter:`drop-shadow(0 0 ${compact?2:4}px ${c.glow})` }} />
            {!compact && (
              <div style={{ position:"absolute", top:"50%", left:2, transform:"translateY(-50%)", width:"calc(100% - 12px)", overflow:"hidden", height:10, pointerEvents:"none" }}>
                {[0,1,2].map(pi => (
                  <div key={pi} style={{ position:"absolute", top:"50%", transform:"translateY(-50%)", width:4, height:4, borderRadius:"50%", background:c.g1, boxShadow:`0 0 4px ${c.glow}`, animation:"particleFlow 1.4s ease-in-out infinite", animationDelay:`${pi*0.35}s` }} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* TAIL badge — floats below in column layout */}
      {isTail ? (
        <div style={{
          position:"absolute", bottom:0, left:"50%", transform:"translateX(-50%)",
          background:"rgba(247,37,133,0.2)", border:"1.5px solid rgba(247,37,133,0.7)",
          color:"#f72585", fontSize:badgeFS, padding:badgeP, borderRadius:20,
          fontFamily:"'JetBrains Mono',monospace", fontWeight:900,
          whiteSpace:"nowrap", letterSpacing:"0.12em",
          boxShadow:"0 0 12px rgba(247,37,133,0.5), 0 0 24px rgba(247,37,133,0.2)",
          animation:"tailPulse 2s ease-in-out infinite 0.5s",
          zIndex:5,
        }}>▲ TAIL</div>
      ) : null}
    </div>
  );
}

function NullTerminator({ compact }) {
  return (
    <div style={{ display:"flex", alignItems:"center", paddingLeft: compact ? 4 : 0 }}>
      <div style={{
        padding: compact ? "4px 7px" : "8px 14px",
        borderRadius: compact ? 7 : 10,
        background:"rgba(255,255,255,0.02)",
        border:`1px dashed rgba(255,255,255,${compact?0.18:0.22})`,
        animation:"nullBlink 2.8s ease-in-out infinite",
        display:"flex", alignItems:"center", justifyContent:"center",
      }}>
        <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize: compact?8:10.5, color:"rgba(180,200,230,0.35)", letterSpacing:"0.1em", fontWeight:600 }}>NULL</span>
      </div>
    </div>
  );
}

// ── Reverse-step arrow (can point left or right, or glow as "active") ────────
function ReverseArrow({ direction, isActive, isReversed, color, compact }) {
  // direction: "fwd" | "rev" | "cur"
  const w = compact ? 30 : 46;
  const h = compact ? 28 : 44;
  const lineH = compact ? 1.5 : 2;
  const headSize = compact ? 3 : 5;
  const headLen  = compact ? 6 : 9;

  const activeColor = "#ffd60a";
  const revColor    = "#f72585";
  const fwdColor    = color;

  const c = isActive ? activeColor : isReversed ? revColor : fwdColor;
  const glow = isActive
    ? "rgba(255,214,10,0.9)"
    : isReversed
    ? "rgba(247,37,133,0.7)"
    : `${color}90`;

  // For reversed arrows we draw them right-to-left using CSS transform
  return (
    <div style={{ width:w, height:h, flexShrink:0, display:"flex", alignItems:"center", position:"relative", transform: isReversed ? "scaleX(-1)" : "none", transition:"transform 0.35s ease" }}>
      {/* Line */}
      <div style={{ flex:1, height:lineH, background:`linear-gradient(90deg,${c}60,${c})`, borderRadius:2, animation: isActive ? "arrowActivePulse 0.5s ease-in-out infinite alternate" : "arrowGlow 2s ease-in-out infinite", boxShadow: isActive ? `0 0 8px ${glow}` : "none" }} />
      {/* Head */}
      <div style={{ width:0, height:0, borderTop:`${headSize}px solid transparent`, borderBottom:`${headSize}px solid transparent`, borderLeft:`${headLen}px solid ${c}`, filter:`drop-shadow(0 0 ${isActive?6:3}px ${glow})` }} />
      {/* Active spark particles */}
      {isActive && (
        <div style={{ position:"absolute", top:"50%", left:2, transform:"translateY(-50%)", width:`calc(100% - 12px)`, overflow:"hidden", height:10, pointerEvents:"none" }}>
          {[0,1,2].map(pi => (
            <div key={pi} style={{ position:"absolute", top:"50%", transform:"translateY(-50%)", width:4, height:4, borderRadius:"50%", background:activeColor, boxShadow:`0 0 6px ${activeColor}`, animation:"particleFlow 0.8s ease-in-out infinite", animationDelay:`${pi*0.2}s` }} />
          ))}
        </div>
      )}
      {/* Reversed label */}
      {isReversed && !isActive && (
        <div style={{ position:"absolute", top: compact?-14:-18, left:"50%", transform:"translateX(50%) scaleX(-1)", fontFamily:"'JetBrains Mono',monospace", fontSize: compact?5:6.5, color:revColor, fontWeight:700, whiteSpace:"nowrap", letterSpacing:"0.05em", opacity:0.85 }}>rev</div>
      )}
    </div>
  );
}

// ── Linked List Visualizer ───────────────────────────────────────────────────
function LinkedListViz({ step, animKey, idle, compact }) {
  const isRevStep = step?.type === "reverseStep";
  const isReverse = step?.type === "reverse";

  // For reverseStep, use origList as the stable display order
  const displayList = isRevStep ? step.origList : (step?.list ?? []);
  const list = step?.list ?? []; // for metrics (may differ when done)

  const isSearch = step?.type === "search";
  const isInsF   = step?.type === "insertFront";
  const isInsB   = step?.type === "insertBack";
  const isEmpty  = displayList.length === 0;

  let highlightIdx = -1;
  if (isSearch && step.result >= 0) highlightIdx = step.result;
  if (isInsF) highlightIdx = 0;
  if (isInsB) highlightIdx = displayList.length - 1;
  const newIdx = isInsF ? 0 : isInsB ? displayList.length - 1 : -1;

  // Pointer role labels for reverseStep
  const roleOf = (i) => {
    if (!isRevStep) return null;
    if (step.phase === "done") return null;
    if (i === step.curIdx)  return { label:"CUR",  color:"#4cc9f0" };
    if (i === step.prevIdx) return { label:"PREV", color:"#06d6a0" };
    if (i === step.nextIdx) return { label:"NEXT", color:"#c77dff" };
    return null;
  };

  // Arrow state for reverseStep
  const arrowState = (i) => {
    if (!isRevStep || !step.arrows) return "fwd";
    return step.arrows[i] ?? "fwd";
  };

  // HEAD: during reverseStep "done" phase, head moved to last origList node
  const headIdx = isRevStep && step.phase === "done"
    ? displayList.length - 1   // new head = last in orig = first in reversed
    : 0;

  const metricList = isRevStep && step.phase === "done" ? step.list : (isRevStep ? step.origList : list);
  const metrics = [
    { lbl:"SIZE",  val:metricList.length,                                   c:"#4cc9f0" },
    { lbl:"HEAD",  val:metricList.length ? metricList[0] : "NULL",          c:"#4cc9f0" },
    { lbl:"TAIL",  val:metricList.length ? metricList[metricList.length-1] : "NULL", c:"#f72585" },
    { lbl:"TYPE",  val:"SINGLY",                                            c:"#c77dff" },
  ];

  // Reverse progress badge
  const revProgress = isRevStep && step.phase !== "done"
    ? `${step.swappedCount}/${step.total}`
    : null;

  return (
    <div style={{ display:"flex", flexDirection:"column", flex:1, minHeight:0 }}>
      {/* Metrics bar */}
      <div style={{ display:"flex", borderBottom:"1px solid rgba(255,255,255,0.07)", background:"rgba(4,8,26,0.9)", flexShrink:0 }}>
        {metrics.map((m, mi) => (
          <div key={m.lbl} style={{ flex:1, padding: compact?"6px 4px":"8px 10px", textAlign:"center", borderRight: mi<3?"1px solid rgba(255,255,255,0.07)":"none", display:"flex", flexDirection:"column", gap:2, background: step&&mi===0?"rgba(76,201,240,0.05)":"transparent", transition:"background 0.2s" }}>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize: compact?5.5:6.5, color:"#6b8aaa", letterSpacing:"0.15em", textTransform:"uppercase", fontWeight:600 }}>{m.lbl}</span>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize: compact?12:15, fontWeight:800, color:m.c, lineHeight:1.1, transition:"color 0.3s" }}>{String(m.val)}</span>
          </div>
        ))}
      </div>

      {/* Canvas */}
      <div style={{ flex:1, position:"relative", overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"flex-start", padding: compact?"8px":"32px 24px 24px" }}>
        {/* Grid */}
        <div style={{ position:"absolute", inset:0, pointerEvents:"none", backgroundImage:`linear-gradient(rgba(76,201,240,${compact?0.04:0.06}) 1px,transparent 1px),linear-gradient(90deg,rgba(76,201,240,${compact?0.04:0.06}) 1px,transparent 1px)`, backgroundSize:`${compact?24:38}px ${compact?24:38}px`, animation:"gridScroll 10s linear infinite" }} />
        {/* Scan */}
        <div style={{ position:"absolute", left:0, right:0, height: compact?40:80, pointerEvents:"none", zIndex:1, background:"linear-gradient(to bottom,transparent,rgba(76,201,240,0.04),transparent)", animation:"scanline 6s ease-in-out infinite" }} />
        {/* Blobs */}
        <div style={{ position:"absolute", width: compact?120:240, height: compact?120:240, top: compact?-30:-60, left: compact?-15:20, background:`radial-gradient(circle,${isRevStep?"rgba(255,214,10,0.1)":"rgba(76,201,240,0.12)"},transparent 65%)`, filter:`blur(${compact?40:70}px)`, pointerEvents:"none", animation:"blobFloat 14s ease-in-out infinite", borderRadius:"50%", mixBlendMode:"screen", transition:"background 0.4s" }} />
        <div style={{ position:"absolute", width: compact?90:180, height: compact?90:180, bottom: compact?-15:30, right: compact?-10:40, background:`radial-gradient(circle,${isRevStep?"rgba(247,37,133,0.12)":"rgba(247,37,133,0.1)"},transparent 65%)`, filter:`blur(${compact?35:60}px)`, pointerEvents:"none", animation:"blob2 11s ease-in-out infinite", borderRadius:"50%", mixBlendMode:"screen" }} />

        {/* Reverse progress banner */}
        {isRevStep && step.phase !== "done" && (
          <div style={{
            position:"absolute", top: compact?6:12, left:"50%", transform:"translateX(-50%)",
            background:"rgba(255,214,10,0.1)", border:"1px solid rgba(255,214,10,0.4)",
            borderRadius:20, padding: compact?"2px 10px":"3px 14px",
            fontFamily:"'JetBrains Mono',monospace", fontSize: compact?7:9,
            fontWeight:800, color:"#ffd60a", letterSpacing:"0.1em",
            whiteSpace:"nowrap", zIndex:5, pointerEvents:"none",
            boxShadow:"0 0 12px rgba(255,214,10,0.25)",
            animation:"headPulse 1.2s ease-in-out infinite",
          }}>
            ⇄ REVERSING  {step.swappedCount}/{step.total}
          </div>
        )}
        {isRevStep && step.phase === "done" && (
          <div style={{
            position:"absolute", top: compact?6:12, left:"50%", transform:"translateX(-50%)",
            background:"rgba(6,214,160,0.1)", border:"1px solid rgba(6,214,160,0.4)",
            borderRadius:20, padding: compact?"2px 10px":"3px 14px",
            fontFamily:"'JetBrains Mono',monospace", fontSize: compact?7:9,
            fontWeight:800, color:"#06d6a0", letterSpacing:"0.1em",
            whiteSpace:"nowrap", zIndex:5, pointerEvents:"none",
            boxShadow:"0 0 12px rgba(6,214,160,0.25)",
          }}>
            ✓ REVERSED
          </div>
        )}

        {/* Legend for pointer labels during reverseStep */}
        {isRevStep && step.phase !== "done" && !compact && (
          <div style={{ position:"absolute", bottom:8, right:14, display:"flex", gap:10, zIndex:5, pointerEvents:"none" }}>
            {[["PREV","#06d6a0"],["CUR","#4cc9f0"],["NEXT","#c77dff"]].map(([lbl,c]) => (
              <div key={lbl} style={{ display:"flex", alignItems:"center", gap:4 }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:c, boxShadow:`0 0 6px ${c}` }} />
                <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:7.5, color:c, fontWeight:700 }}>{lbl}</span>
              </div>
            ))}
            <div style={{ display:"flex", alignItems:"center", gap:4 }}>
              <div style={{ width:16, height:2, background:"#ffd60a", borderRadius:1, boxShadow:"0 0 6px #ffd60a" }} />
              <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:7.5, color:"#ffd60a", fontWeight:700 }}>ACTIVE</span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:4 }}>
              <div style={{ width:16, height:2, background:"#f72585", borderRadius:1, boxShadow:"0 0 4px #f72585" }} />
              <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:7.5, color:"#f72585", fontWeight:700 }}>REVERSED</span>
            </div>
          </div>
        )}

        {/* Nodes scroll area */}
        <div style={{ position:"relative", zIndex:2, width:"100%", overflowX:"auto", overflowY:"visible", padding: compact?"8px 6px 8px":"52px 12px 60px", scrollbarWidth:"thin", scrollbarColor:"rgba(76,201,240,0.25) transparent" }}>
          {isEmpty ? (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap: compact?6:10, padding: compact?12:20, border:"1px dashed rgba(76,201,240,0.15)", borderRadius: compact?10:14, background:"rgba(76,201,240,0.02)", width:"fit-content", minWidth: compact?160:220 }}>
              <div style={{ fontSize: compact?28:40, opacity:0.4, animation:"blobFloat 4s ease-in-out infinite" }}>{idle ? "🔗" : "∅"}</div>
              <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize: compact?8:9.5, color:"#6b8aaa", letterSpacing:"0.1em" }}>{idle ? "Run code to see your list" : "List is empty"}</div>
            </div>
          ) : (
            <div style={{ display:"flex", alignItems:"center", gap:0, width:"max-content" }}>

              {displayList.map((v, i) => {
                const role = roleOf(i);
                const aState = arrowState(i);
                const isActive = aState === "cur";
                const isRev    = aState === "rev";
                const c = col(v);
                const isHeadNode = isRevStep ? (step.phase==="done" ? i===displayList.length-1 : i===0) : i===0;
                const isTailNode = i === displayList.length - 1;

                return (
                  <div key={`${v}-${i}-${isRevStep?`rev-${animKey}`:"s"}`} style={{ display:"flex", alignItems:"center", gap:0, position:"relative" }}>
                    {/* Pointer role label (PREV/CUR/NEXT) during reverseStep — sits above HEAD badge */}
                    {role && (
                      <div style={{
                        position:"absolute",
                        top: compact ? -8 : -10,
                        left:"50%", transform:"translateX(-50%)",
                        fontFamily:"'JetBrains Mono',monospace",
                        fontSize: compact ? 6.5 : 8,
                        fontWeight:900, color:role.color,
                        background:`${role.color}18`,
                        border:`1px solid ${role.color}55`,
                        borderRadius:12, padding: compact?"1px 5px":"2px 8px",
                        whiteSpace:"nowrap", letterSpacing:"0.1em",
                        boxShadow:`0 0 10px ${role.color}50`,
                        animation:"stepPop 0.2s ease",
                        zIndex:20,
                        pointerEvents:"none",
                      }}>
                        {role.label}
                        <div style={{ position:"absolute", bottom:-5, left:"50%", transform:"translateX(-50%)", width:0, height:0, borderLeft:"3px solid transparent", borderRight:"3px solid transparent", borderTop:`4px solid ${role.color}` }} />
                      </div>
                    )}

                    {/* The node itself */}
                    <LLNode
                      value={v} index={i}
                      isHead={isHeadNode}
                      isTail={isTailNode}
                      isHighlighted={i===highlightIdx || (isRevStep && role?.label==="CUR")}
                      isNew={i===newIdx}
                      isDeleting={false}
                      animKey={animKey}
                      showPointer={i < displayList.length - 1}
                      compact={compact}
                      hideArrow={isRevStep}
                    />

                    {/* Custom directional arrow — only during reverseStep, vertically centered with the node box */}
                    {isRevStep && i < displayList.length - 1 && (
                      <div style={{ display:"flex", alignSelf:"center", flexShrink:0 }}>
                        <ReverseArrow
                          direction={aState}
                          isActive={isActive}
                          isReversed={isRev}
                          color={c.g2}
                          compact={compact}
                        />
                      </div>
                    )}
                  </div>
                );
              })}

              <NullTerminator compact={compact} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Sticky Nav (mobile) ──────────────────────────────────────────────────────
function StickyNav({ activeSection, onNav, hasSteps, hasErrors, termLines }) {
  const hasTermErr = termLines.some(l => l.type === "error" || l.type === "stderr");
  const hasTermOk  = termLines.some(l => l.type === "success");
  const items = [
    { id:"code",     icon:"⌨", label:"Code", dot:null },
    { id:"terminal", icon:"⬛", label:"Term", dot: hasTermErr?"#f87171":hasTermOk?"#39d98a":null },
    { id:"viz",      icon:"🔗", label:"List", dot: hasSteps?"#4cc9f0":hasErrors?"#f87171":null },
  ];
  return (
    <div style={{ position:"fixed", right:0, top:"50%", transform:"translateY(-50%)", zIndex:9000, display:"flex", flexDirection:"column", background:"rgba(5,8,26,0.96)", border:"1px solid rgba(76,201,240,0.2)", borderRight:"none", borderRadius:"14px 0 0 14px", overflow:"hidden", boxShadow:"-4px 0 28px rgba(0,0,0,0.7), -1px 0 0 rgba(76,201,240,0.1)", backdropFilter:"blur(24px)" }}>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:"linear-gradient(90deg,transparent,#4cc9f0,#c77dff,transparent)", opacity:0.7 }} />
      {items.map((item, i) => {
        const isActive = activeSection === item.id;
        return (
          <button key={item.id} onClick={() => onNav(item.id)} style={{ position:"relative", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:4, width:50, padding:"13px 4px", border:"none", background: isActive?"linear-gradient(180deg,rgba(76,201,240,0.2),rgba(199,125,255,0.12))":"transparent", cursor:"pointer", borderBottom: i<items.length-1?"1px solid rgba(255,255,255,0.06)":"none", WebkitTapHighlightColor:"transparent", transition:"background 0.18s", borderLeft: isActive?"2.5px solid #4cc9f0":"2.5px solid transparent" }}>
            {item.dot && <span style={{ position:"absolute", top:7, right:8, width:6, height:6, borderRadius:"50%", background:item.dot, boxShadow:`0 0 8px ${item.dot}` }} />}
            {isActive && <span style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at center,rgba(76,201,240,0.1),transparent 70%)", pointerEvents:"none" }} />}
            <span style={{ fontSize:17, opacity:isActive?1:0.38, transition:"opacity 0.15s,transform 0.15s", transform:isActive?"scale(1.12)":"scale(1)", lineHeight:1 }}>{item.icon}</span>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:6.5, fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase", color:isActive?"#4cc9f0":"rgba(255,255,255,0.2)", transition:"color 0.15s" }}>{item.label}</span>
          </button>
        );
      })}
      <div style={{ position:"absolute", bottom:0, left:0, right:0, height:2, background:"linear-gradient(90deg,transparent,#f72585,#4cc9f0,transparent)", opacity:0.5 }} />
    </div>
  );
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

// ── Shared CSS (animations + base) ──────────────────────────────────────────
const SHARED_CSS = `
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700;800&family=Space+Grotesk:wght@600;700;800;900&family=DM+Sans:wght@400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%;-webkit-text-size-adjust:100%;}
body{background:#050818;color:#c8d8f0;font-family:'DM Sans',sans-serif;}

:root{
  --cyan:#4cc9f0; --cyan-dim:rgba(76,201,240,0.15); --cyan-glow:rgba(76,201,240,0.5);
  --pink:#f72585; --pink-dim:rgba(247,37,133,0.15); --pink-glow:rgba(247,37,133,0.45);
  --green:#39d98a; --green-dim:rgba(57,217,138,0.15); --green-glow:rgba(57,217,138,0.45);
  --purple:#c77dff; --yellow:#ffd60a; --orange:#ff6b35;
  --text-primary:#d4e4f7; --text-secondary:#6b8aaa; --text-muted:#3d5470;
  --border-subtle:rgba(255,255,255,0.07); --border-medium:rgba(255,255,255,0.13);
  --surface-0:#050818; --surface-1:rgba(8,14,36,0.95); --surface-2:rgba(12,20,48,0.8); --surface-3:rgba(16,26,58,0.7);
}

@keyframes arrowActivePulse{0%{opacity:0.7;box-shadow:none}100%{opacity:1;box-shadow:0 0 12px rgba(255,214,10,0.9)}}
@keyframes cur{0%,100%{opacity:1}50%{opacity:0}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
@keyframes rPulse{0%,100%{box-shadow:0 0 18px rgba(76,201,240,0.45)}50%{box-shadow:0 0 42px rgba(76,201,240,0.75),0 0 80px rgba(76,201,240,0.25)}}
@keyframes stepPop{0%{transform:scale(0.85);opacity:0}55%{transform:scale(1.05)}100%{transform:scale(1);opacity:1}}
@keyframes metricPop{0%{transform:scale(1)}50%{transform:scale(1.14)}100%{transform:scale(1)}}
@keyframes toastIn{0%{opacity:0;transform:translateY(10px) scale(0.92)}100%{opacity:1;transform:none}}
@keyframes toastOut{0%{opacity:1}100%{opacity:0;transform:translateY(-8px)}}
@keyframes headPulse{0%,100%{box-shadow:0 0 8px rgba(76,201,240,0.4)}50%{box-shadow:0 0 18px rgba(76,201,240,0.8)}}
@keyframes tailPulse{0%,100%{box-shadow:0 0 8px rgba(247,37,133,0.4)}50%{box-shadow:0 0 18px rgba(247,37,133,0.8)}}
@keyframes headPtrPulse{0%,100%{opacity:0.4;transform:scaleY(1)}50%{opacity:1;transform:scaleY(1.1)}}
@keyframes arrowGlow{0%,100%{opacity:0.5;filter:brightness(1)}50%{opacity:1;filter:brightness(1.6)}}
@keyframes particleFlow{0%{opacity:0;transform:translateX(0) scale(0.3)}20%{opacity:1;transform:translateX(6px) scale(1)}80%{opacity:0.7;transform:translateX(28px) scale(0.6)}100%{opacity:0;transform:translateX(40px) scale(0.2)}}
@keyframes nullBlink{0%,100%{opacity:0.25;border-color:rgba(255,255,255,0.1)}50%{opacity:0.65;border-color:rgba(255,255,255,0.28)}}
@keyframes gridScroll{0%{background-position:0 0}100%{background-position:38px 38px}}
@keyframes scanline{0%{top:-10%}100%{top:110%}}
@keyframes blobFloat{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(22px,-16px) scale(1.06)}66%{transform:translate(-14px,20px) scale(0.95)}}
@keyframes blob2{0%,100%{transform:translate(0,0) scale(1)}40%{transform:translate(-26px,14px) scale(1.09)}70%{transform:translate(18px,-22px) scale(0.93)}}
@keyframes revOverlay{0%{opacity:0}15%{opacity:1}80%{opacity:1}100%{opacity:0}}
@keyframes revText{0%{letter-spacing:-3px;opacity:0;transform:scaleX(0.7)}20%{letter-spacing:4px;opacity:1;transform:scaleX(1.02)}65%{opacity:1}100%{letter-spacing:14px;opacity:0;transform:scaleX(1.08)}}
@keyframes ringExpand{0%{transform:scale(0.9);opacity:0.9}100%{transform:scale(1.5);opacity:0}}
@keyframes nodeIn{0%{transform:translateY(-55px) scale(0.7);opacity:0;filter:blur(3px)}50%{transform:translateY(6px) scale(1.05);opacity:1;filter:blur(0)}72%{transform:translateY(-2px) scale(0.98)}100%{transform:none;opacity:1}}
@keyframes nodeDel{0%{transform:scale(1);opacity:1}25%{transform:scale(1.12) translateY(-8px);filter:brightness(1.5)}100%{transform:scale(0.2) translateY(-60px);opacity:0;filter:blur(4px)}}
@keyframes nodeHi{0%{filter:brightness(1)}20%{filter:brightness(1.8) saturate(1.5) drop-shadow(0 0 12px currentColor)}50%{filter:brightness(2.2) saturate(1.8) drop-shadow(0 0 20px currentColor)}80%{filter:brightness(1.8) saturate(1.5) drop-shadow(0 0 12px currentColor)}100%{filter:brightness(1)}}
@keyframes revNodes{0%{transform:scaleX(1) perspective(500px) rotateY(0)}28%{transform:scaleX(0.08) perspective(500px) rotateY(65deg)}58%{transform:scaleX(1.02) perspective(500px) rotateY(-3deg)}80%{transform:scaleX(0.99) perspective(500px) rotateY(1deg)}100%{transform:none}}

.ll-node{overflow:visible!important;}
.ll-node-new{animation:nodeIn 0.5s cubic-bezier(0.34,1.2,0.64,1) both;}
.ll-node-del{animation:nodeDel 0.45s cubic-bezier(0.4,0,1,1) both;}
.ll-node-hi{animation:nodeHi 0.65s ease both;}
.ll-nodes-reversing{animation:revNodes 0.75s cubic-bezier(0.4,0,0.2,1) both;}
.ll-arrow{display:flex;align-items:center;position:relative;flex-shrink:0;}
.ll-ring-1,.ll-ring-2{position:absolute;pointer-events:none;}

::-webkit-scrollbar{width:4px;height:4px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:rgba(76,201,240,0.2);border-radius:4px}
::-webkit-scrollbar-thumb:hover{background:rgba(76,201,240,0.4)}
textarea::-webkit-scrollbar{width:4px}
`;

// ── Main Component ────────────────────────────────────────────────────────────
export default function LinkedListPage() {
  const [lang,       setLang]       = useState("c");
  const [code,       setCode]       = useState(TPL.c);
  const [steps,      setSteps]      = useState([]);
  const [idx,        setIdx]        = useState(-1);
  const [error,      setError]      = useState("");
  const [playing,    setPlaying]    = useState(false);
  const [speed,      setSpeed]      = useState(1.1);
  const [animKey,    setAnimKey]    = useState(0);
  const [done,       setDone]       = useState(false);
  const [validating, setValidating] = useState(false);
  const [aiErrors,   setAiErrors]   = useState([]);
  const [termLines,  setTermLines]  = useState([]);
  const [sessionId,  setSessionId]  = useState("");
  const [mounted,    setMounted]    = useState(false);
  const [toast,      setToast]      = useState(null);
  const [termOpen,   setTermOpen]   = useState(true);

  useEffect(() => {
    setMounted(true);
    setSessionId(Math.random().toString(36).slice(2,8).toUpperCase());
  }, []);
  const [activeSection, setActiveSection] = useState("code");

  const isMobile = useIsMobile();

  const timerRef = useRef(null), taRef = useRef(null), listRef = useRef(null);
  const sectionCodeRef = useRef(null);
  const sectionTermRef = useRef(null);
  const sectionVizRef  = useRef(null);
  const scrollContainerRef = useRef(null);

  const bump = () => setAnimKey(k => k + 1);
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2400); };

  const copyListState = () => {
    const s = steps[idx] ?? null;
    if (!s) return;
    const txt = s.list.length ? s.list.join(" → ") + " → NULL" : "NULL (empty)";
    navigator.clipboard?.writeText(txt).then(() => showToast("📋 " + txt)).catch(() => showToast("📋 " + txt));
  };

  const doReset = useCallback(() => {
    clearInterval(timerRef.current);
    setSteps([]); setIdx(-1); setError(""); setPlaying(false); setDone(false); setAiErrors([]); setTermLines([]);
  }, []);

  const handleChangeLang = (l) => {
    setLang(l);
    setCode(TPL[l] ?? "");
    doReset();
  };

  const buildTerm = (stps, errs, aiErrs, aiReason) => {
    const ls = [];
    const ts = new Date().toTimeString().slice(0,8);
    ls.push({ type:"output", text:`VisuoSlayer v2.1  ·  LinkedList  ·  ${ts}  ·  pid:${sessionId}` });
    ls.push({ type:"separator" });
    if (aiErrs.length > 0) {
      ls.push({ type:"prompt", text:`visualoslayer validate --lang=${lang} --ds=linked-list` });
      ls.push({ type:"blank" });
      if (aiReason) ls.push({ type:"stderr", text:aiReason });
      aiErrs.forEach(e => ls.push({ type:"error", text:`  L${e.line??"?"}  ${e.message}`, lineNum:e.line }));
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
      stps.forEach((s, si) => {
        let out = "";
        switch(s.type) {
          case "insertFront": out=`insertFront(${s.value})  →  ${fmtList(s.list)}`; break;
          case "insertBack":  out=`insertBack(${s.value})   →  ${fmtList(s.list)}`; break;
          case "delete":      out=s.found?`delete(${s.value})  →  removed  ·  ${fmtList(s.list)}`:`delete(${s.value})  →  not found`; break;
          case "search":      out=s.result>=0?`search(${s.value})  →  index ${s.result}`:`search(${s.value})  →  not found`; break;
          case "reverse":     out=`reverse()  →  ${fmtList(s.list)}`; break;
          case "reverseStep": {
            if (s.phase==="init") out=`reverse()  →  starting: [${s.origList.join(", ")}]`;
            else if (s.phase==="swap") out=`reverse()  →  step ${s.swappedCount+1}/${s.total}: cur=${s.origList[s.curIdx]} · flipping pointer`;
            else out=`reverse()  →  done ✓  ${fmtList(s.list)}`;
            break;
          }
          case "size":        out=`size()  →  ${s.result}`; break;
          case "traverse":    out=`traverse()  →  ${fmtList(s.list)}`; break;
        }
        ls.push({ type:s.type==="error"?"error":s.type, text:out, lineNum:s.lineNum+1, stepIndex:si });
      });
      ls.push({ type:"blank" });
      ls.push({ type:"success", text:`${stps.length} op${stps.length!==1?"s":""} completed  ·  exit code 0` });
    }
    return ls;
  };

  const handleRun = async () => {
    doReset(); setValidating(true);
    const v = await validateWithVisuoSlayer(code, lang);
    setValidating(false);
    if (!v.valid) {
      setAiErrors(v.errors ?? []);
      setTermLines(buildTerm([], [], v.errors??[], v.reason??""));
      if (isMobile) scrollToSection("terminal");
      return;
    }
    const { steps:s, errors } = runLinkedList(code, lang);
    if (errors.length) {
      setError(errors.join("\n"));
      setTermLines(buildTerm([], errors, [], ""));
      if (isMobile) scrollToSection("terminal");
      return;
    }
    setSteps(s); setIdx(0); bump(); setPlaying(true); setTermLines(buildTerm(s,[],[],"")); 
  };

  const goTo = useCallback((i) => {
    clearInterval(timerRef.current); setPlaying(false); setIdx(Math.max(0, Math.min(i, steps.length-1))); bump();
  }, [steps.length]);

  useEffect(() => {
    const h = (e) => { if ((e.ctrlKey||e.metaKey) && e.key==="Enter") { e.preventDefault(); handleRun(); } };
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  }, [code, lang]);

  useEffect(() => {
    if (!playing || !steps.length) return;
    timerRef.current = setInterval(() => {
      setIdx(p => {
        if (p >= steps.length-1) { clearInterval(timerRef.current); setPlaying(false); setDone(true); return p; }
        bump(); return p+1;
      });
    }, speed*1000);
    return () => clearInterval(timerRef.current);
  }, [playing, steps, speed]);

  useEffect(() => {
    listRef.current?.querySelector(".sl-active")?.scrollIntoView({ block:"nearest", behavior:"smooth" });
  }, [idx]);

  const onKeyDown = (e) => {
    if (e.key !== "Tab") return; e.preventDefault();
    const s = e.target.selectionStart, en = e.target.selectionEnd;
    const nv = code.slice(0,s) + "  " + code.slice(en); setCode(nv);
    requestAnimationFrame(() => { if (taRef.current) { taRef.current.selectionStart=s+2; taRef.current.selectionEnd=s+2; } });
  };

  useEffect(() => {
    if (!isMobile) return;
    const refs = [
      { id:"code",     ref:sectionCodeRef },
      { id:"terminal", ref:sectionTermRef },
      { id:"viz",      ref:sectionVizRef  },
    ];
    const obs = new IntersectionObserver(
      (entries) => {
        let best=null, bestR=0;
        entries.forEach(e => { if (e.isIntersecting && e.intersectionRatio > bestR) { bestR=e.intersectionRatio; best=e.target.dataset.section; } });
        if (best) setActiveSection(best);
      },
      { root:scrollContainerRef.current, threshold:[0.3,0.6] }
    );
    refs.forEach(r => { if (r.ref.current) { r.ref.current.dataset.section=r.id; obs.observe(r.ref.current); } });
    return () => obs.disconnect();
  }, [isMobile]);

  const scrollToSection = useCallback((id) => {
    const map = { code:sectionCodeRef, terminal:sectionTermRef, viz:sectionVizRef };
    map[id]?.current?.scrollIntoView({ behavior:"smooth", block:"start" });
    setActiveSection(id);
  }, []);

  const step = steps[idx] ?? null;
  const os = step ? (OP[step.type] ?? OP.insertBack) : null;
  const prog = steps.length ? Math.round(((idx+1)/steps.length)*100) : 0;
  const hasAiErrors = aiErrors.length > 0;
  const idle = steps.length===0 && !error && !hasAiErrors;
  const lm = LANGS[lang];
  const errorLineSet = new Set(aiErrors.map(e => (e.line??1)-1));

  // ── Language tabs renderer ────────────────────────────────────────────────
  const renderLangTabs = (mobile = false) => {
    const cls = mobile ? "mob-lt" : "lt";
    const activeCls = mobile ? " la" : " la";
    return (
      <div className={mobile ? "mob-lb" : "lb"}>
        {/* C first, then Custom right next to it, then others */}
        {Object.entries(LANGS).map(([k, m]) => {
          const isActive = lang === k;
          const isCustom = k === "custom";
          return (
            <button key={k}
              className={`${cls}${isActive ? activeCls : ""}`}
              onClick={() => handleChangeLang(k)}
              style={{
                ...(isActive ? { borderColor:`${m.accent}40`, color:m.accent, background:`${m.accent}0f` } : {}),
                ...(isCustom ? {
                  borderColor: isActive ? `${m.accent}40` : "rgba(199,125,255,0.22)",
                  color: isActive ? m.accent : "rgba(199,125,255,0.6)",
                  background: isActive ? `${m.accent}0f` : "rgba(199,125,255,0.05)",
                  fontStyle:"italic",
                } : {}),
              }}
            >
              {mobile ? m.name : m.ext}
            </button>
          );
        })}
      </div>
    );
  };

  // ── Op log row ────────────────────────────────────────────────────────────
  const renderOpLog = (mobile = false) => {
    const slCls = mobile ? "mob-sl" : "sl";
    const siCls = mobile ? "mob-si" : "si";
    const dotCls = mobile ? "mob-si-dot" : "si-dot";
    const vCls = mobile ? "mob-si-v" : "si-v";
    const lnCls = mobile ? "mob-si-ln" : "si-ln";
    return (
      <div className={slCls} ref={listRef}>
        {steps.map((s, i) => {
          const sm = OP[s.type] ?? OP.insertBack;
          const past = i<idx, active = i===idx;
          const isRevS = s.type === "reverseStep";
          return (
            <div key={i} className={`${siCls}${active?" sl-active":""}${past&&!mobile?" si-past":""}`} onClick={() => goTo(i)}>
              <span className={dotCls} style={{ background:past?"var(--green)":active?sm.c:"var(--text-muted)", boxShadow:active?`0 0 6px ${sm.c}`:past?"0 0 5px var(--green-glow)":"none" }} />
              <span style={{ color:active?sm.c:past?"var(--text-secondary)":"var(--text-muted)" }}>
                {sm.label}
                {isRevS && s.phase==="init" && <span className={vCls}> init</span>}
                {isRevS && s.phase==="swap" && <span className={vCls}> {s.swappedCount+1}/{s.total}</span>}
                {isRevS && s.phase==="done" && <span style={{ color:"var(--green)", opacity:0.85 }}> ✓</span>}
                {!isRevS && s.value != null && <span className={vCls}>({s.value})</span>}
                {s.type==="search" && <span className={vCls}> → {s.result>=0?`idx ${s.result}`:"–1"}</span>}
                {s.type==="size"   && <span className={vCls}> = {s.result}</span>}
                {s.type==="delete" && <span style={{ color:s.found?"var(--green)":"#f87171", opacity:0.8 }}> {s.found?"✓":"✗"}</span>}
              </span>
              <span className={lnCls}>L{s.lineNum+1}</span>
            </div>
          );
        })}
      </div>
    );
  };

  // ── Playback controls ─────────────────────────────────────────────────────
  const renderControls = (mobile = false) => {
    const ctrlCls = mobile ? "mob-ctrl" : "ctrl";
    const cbCls   = mobile ? "mob-cb"   : "cb";
    const cpCls   = mobile ? "mob-cp"   : "cp";
    const sepCls  = mobile ? "mob-csep" : "csep";
    const spdCls  = mobile ? "mob-spd"  : "spd";
    const sbCls   = mobile ? "mob-sb"   : "sb";
    const speedOpts = mobile ? [[2,"½×"],[1.1,"1×"],[0.55,"2×"]] : [[2,"0.5×"],[1.1,"1×"],[0.55,"2×"]];
    return (
      <div className={ctrlCls}>
        <button className={cbCls} onClick={()=>goTo(0)} disabled={idx<=0}>⏮</button>
        <button className={cbCls} onClick={()=>goTo(idx-1)} disabled={idx<=0}>◀</button>
        <button className={cpCls} onClick={() => {
          if (done||idx>=steps.length-1) { setIdx(0); bump(); setDone(false); setPlaying(true); }
          else { clearInterval(timerRef.current); setPlaying(p=>!p); }
        }}>{playing?"⏸":done?"↺":"▶"}</button>
        <button className={cbCls} onClick={()=>goTo(idx+1)} disabled={idx>=steps.length-1}>▶</button>
        <button className={cbCls} onClick={()=>goTo(steps.length-1)} disabled={idx>=steps.length-1}>⏭</button>
        <div className={sepCls} />
        <div className={spdCls}>
          {speedOpts.map(([s,lbl]) => (
            <button key={s} className={`${sbCls}${speed===s?" sa":""}`} onClick={()=>setSpeed(s)}>{lbl}</button>
          ))}
        </div>
        <div className={sepCls} />
        <button className={cbCls} onClick={copyListState} style={{ fontSize:mobile?13:12 }}>📋</button>
        {!mobile && (
          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:8.5, color:"var(--text-secondary)", marginLeft:2 }}>
            <span style={{ color:"var(--cyan)", fontWeight:700 }}>{idx+1}</span>
            <span style={{ color:"var(--text-muted)" }}>/{steps.length}</span>
          </span>
        )}
      </div>
    );
  };

  // ── MOBILE LAYOUT ─────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <>
        <style>{SHARED_CSS + `
          html,body{overflow:hidden;}
          .mob-pg{height:100vh;height:100dvh;display:flex;flex-direction:column;
            background:radial-gradient(ellipse 80% 50% at 50% 0%,rgba(76,201,240,0.1) 0%,transparent 60%),#050818;
            padding-top:env(safe-area-inset-top,0);}

          .mob-hd{flex-shrink:0;display:flex;align-items:center;gap:9px;padding:8px 14px;
            background:rgba(5,8,22,0.98);backdrop-filter:blur(24px);
            border-bottom:1px solid rgba(76,201,240,0.14);z-index:100;position:sticky;top:0;}
          .mob-logo{width:29px;height:29px;border-radius:8px;flex-shrink:0;
            background:linear-gradient(135deg,#0369a1,#4cc9f0 45%,#7209b7);
            display:flex;align-items:center;justify-content:center;font-size:14px;
            box-shadow:0 0 14px rgba(76,201,240,0.55);animation:rPulse 3s ease-in-out infinite;}
          .mob-brand{font-family:'Space Grotesk',sans-serif;font-size:13.5px;font-weight:900;
            background:linear-gradient(90deg,#4cc9f0 0%,#c77dff 50%,#f72585 100%);
            background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;
            animation:shimmer 4s linear infinite;}
          .mob-sub{font-size:8px;color:var(--text-muted);font-family:'JetBrains Mono',monospace;}

          .mob-scroll{flex:1;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;
            scrollbar-width:thin;scrollbar-color:rgba(76,201,240,0.15) transparent;
            padding-right:52px;padding-bottom:env(safe-area-inset-bottom,16px);}
          .mob-scroll::-webkit-scrollbar{width:2px;}
          .mob-scroll::-webkit-scrollbar-thumb{background:rgba(76,201,240,0.18);border-radius:2px;}

          .mob-sec{display:flex;flex-direction:column;}
          .mob-sec-label{display:flex;align-items:center;gap:7px;padding:9px 13px 5px;
            font-family:'JetBrains Mono',monospace;font-size:6.5px;font-weight:800;
            letter-spacing:0.18em;text-transform:uppercase;color:var(--text-muted);}
          .mob-sec-label::after{content:'';flex:1;height:1px;background:linear-gradient(90deg,rgba(76,201,240,0.22),transparent);}

          .mob-ph{padding:6px 12px;border-bottom:1px solid var(--border-subtle);
            background:rgba(8,14,38,0.92);display:flex;align-items:center;gap:6px;flex-shrink:0;}
          .dot{width:7px;height:7px;border-radius:50%;}
          .ptl{font-family:'JetBrains Mono',monospace;font-size:7px;color:var(--text-muted);
            text-transform:uppercase;letter-spacing:1.2px;margin-left:5px;font-weight:600;}

          .mob-lb{display:flex;gap:3px;padding:6px 10px;overflow-x:auto;
            border-bottom:1px solid var(--border-subtle);background:rgba(6,11,30,0.85);
            flex-shrink:0;scrollbar-width:none;-webkit-overflow-scrolling:touch;}
          .mob-lb::-webkit-scrollbar{display:none;}
          .mob-lt{padding:4px 10px;border-radius:5px;cursor:pointer;white-space:nowrap;
            font-family:'JetBrains Mono',monospace;font-size:8px;font-weight:700;
            border:1px solid var(--border-subtle);background:transparent;
            color:var(--text-muted);transition:all 0.15s;flex-shrink:0;}
          .mob-lt.la{color:#e8f4ff;background:rgba(255,255,255,0.06);}

          .mob-editor-wrap{background:rgba(5,8,22,0.97);border:1px solid var(--border-subtle);
            display:flex;flex-direction:column;height:330px;}
          .mob-rr{padding:9px 11px;border-top:1px solid rgba(76,201,240,0.2);
            display:flex;align-items:center;gap:7px;flex-shrink:0;
            background:rgba(4,8,22,0.97);box-shadow:0 -5px 18px rgba(0,0,0,0.5);}
          .mob-btn-run{flex:1;padding:11px 14px;border-radius:11px;
            background:linear-gradient(135deg,#0369a1,#0ea5e9,#4cc9f0);
            border:1px solid rgba(76,201,240,0.45);color:#fff;
            font-family:'JetBrains Mono',monospace;font-size:11.5px;font-weight:800;cursor:pointer;
            transition:all 0.18s;box-shadow:0 0 22px rgba(76,201,240,0.35),0 4px 12px rgba(0,0,0,0.45);
            -webkit-tap-highlight-color:transparent;letter-spacing:0.03em;}
          .mob-btn-run:active{transform:scale(0.97);}
          .mob-btn-run.running{animation:rPulse 1.2s ease-in-out infinite;}
          .mob-btn-run:disabled{opacity:0.4;cursor:not-allowed;}
          .mob-btn-rst{padding:11px 13px;border-radius:11px;background:transparent;
            border:1px solid rgba(248,113,113,0.32);color:#f87171;
            font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;cursor:pointer;
            transition:all 0.16s;-webkit-tap-highlight-color:transparent;white-space:nowrap;}
          .mob-btn-rst:active{background:rgba(248,113,113,0.12);}

          .mob-alb{display:flex;align-items:center;gap:6px;padding:5px 12px;border-left:2px solid;
            min-height:26px;border-top:1px solid var(--border-subtle);flex-shrink:0;animation:fadeIn 0.18s ease;}
          .mob-alb-ln{font-family:'JetBrains Mono',monospace;font-size:8px;font-weight:700;white-space:nowrap;}
          .mob-alb-code{font-family:'JetBrains Mono',monospace;font-size:8px;color:var(--text-secondary);
            overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;}

          .mob-term-wrap{background:rgba(5,8,22,0.97);border:1px solid var(--border-subtle);
            display:flex;flex-direction:column;height:210px;}

          .mob-viz-wrap{background:rgba(5,8,22,0.97);border:1px solid var(--border-subtle);
            display:flex;flex-direction:column;min-height:340px;}

          .mob-oi{padding:7px 12px;border-top:1px solid var(--border-subtle);background:rgba(4,8,24,0.7);flex-shrink:0;}
          .mob-oi-badge{display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:14px;
            margin-bottom:3px;font-family:'JetBrains Mono',monospace;font-size:8.5px;font-weight:800;
            animation:stepPop 0.22s ease;border:1px solid;letter-spacing:0.03em;}
          .mob-oi-msg{font-family:'JetBrains Mono',monospace;font-size:8.5px;line-height:1.55;
            animation:fadeUp 0.2s ease;color:var(--text-secondary);word-break:break-word;}

          .mob-ctrl{display:flex;align-items:center;gap:3px;padding:7px 10px;
            border-top:1px solid var(--border-subtle);background:rgba(3,6,18,0.75);flex-shrink:0;}
          .mob-cb{width:31px;height:31px;border-radius:7px;border:1px solid var(--border-medium);
            background:var(--surface-3);color:var(--text-secondary);font-size:11px;cursor:pointer;
            display:flex;align-items:center;justify-content:center;transition:all 0.12s;
            -webkit-tap-highlight-color:transparent;flex-shrink:0;}
          .mob-cb:active:not(:disabled){transform:scale(0.9);background:var(--cyan-dim);}
          .mob-cb:disabled{opacity:0.22;cursor:not-allowed;}
          .mob-cp{height:31px;padding:0 13px;border-radius:7px;
            background:linear-gradient(135deg,#0369a1,#0ea5e9,#4cc9f0);
            border:1px solid rgba(76,201,240,0.38);color:#fff;font-size:12px;font-weight:800;
            cursor:pointer;box-shadow:0 0 16px rgba(76,201,240,0.35);
            -webkit-tap-highlight-color:transparent;flex-shrink:0;}
          .mob-cp:active{transform:scale(0.94);}
          .mob-cp:disabled{opacity:0.25;cursor:not-allowed;}
          .mob-csep{width:1px;height:13px;background:var(--border-subtle);margin:0 1px;flex-shrink:0;}
          .mob-spd{display:flex;gap:2px;}
          .mob-sb{padding:3px 6px;border-radius:5px;cursor:pointer;
            font-family:'JetBrains Mono',monospace;font-size:7.5px;font-weight:700;
            border:1px solid var(--border-subtle);background:transparent;
            color:var(--text-muted);-webkit-tap-highlight-color:transparent;}
          .mob-sb.sa{background:var(--cyan-dim);border-color:rgba(76,201,240,0.42);color:var(--cyan);}

          .mob-pr{display:flex;align-items:center;gap:7px;padding:5px 12px;
            border-top:1px solid var(--border-subtle);flex-shrink:0;}
          .mob-pt2{flex:1;height:3px;background:rgba(255,255,255,0.05);border-radius:99px;overflow:hidden;}
          .mob-pf{height:100%;border-radius:99px;transition:width 0.4s cubic-bezier(0.4,0,0.2,1);
            background:linear-gradient(90deg,#0369a1,#4cc9f0,#c77dff);box-shadow:0 0 7px rgba(76,201,240,0.5);}
          .mob-ptx{font-family:'JetBrains Mono',monospace;font-size:7.5px;color:var(--text-secondary);min-width:26px;text-align:right;}

          .mob-slh{padding:4px 12px 2px;font-family:'JetBrains Mono',monospace;font-size:6px;
            color:var(--text-muted);letter-spacing:0.18em;text-transform:uppercase;font-weight:700;
            border-top:1px solid var(--border-subtle);flex-shrink:0;
            display:flex;align-items:center;justify-content:space-between;}
          .mob-sl{overflow-y:auto;padding:2px 6px 8px;display:flex;flex-direction:column;gap:1px;
            max-height:110px;flex-shrink:0;scrollbar-width:thin;scrollbar-color:rgba(76,201,240,0.18) transparent;}
          .mob-si{display:flex;align-items:center;gap:5px;padding:3px 7px;border-radius:5px;cursor:pointer;
            font-family:'JetBrains Mono',monospace;font-size:8.5px;color:var(--text-muted);transition:all 0.12s;
            border:1px solid transparent;-webkit-tap-highlight-color:transparent;}
          .mob-si:active{background:var(--cyan-dim);}
          .sl-active{background:rgba(76,201,240,0.1)!important;border-color:rgba(76,201,240,0.25)!important;color:var(--cyan)!important;box-shadow:inset 2.5px 0 0 var(--cyan);}
          .mob-si-dot{width:5.5px;height:5.5px;border-radius:50%;flex-shrink:0;transition:all 0.12s;}
          .mob-si-v{opacity:0.55;margin-left:1px;}
          .mob-si-ln{margin-left:auto;font-size:6.5px;color:var(--text-muted);opacity:0.7;}

          .toast{position:fixed;bottom:16px;left:50%;transform:translateX(-50%);padding:8px 16px;border-radius:10px;
            font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;white-space:nowrap;
            background:rgba(10,20,50,0.98);border:1px solid var(--border-medium);
            color:var(--green);box-shadow:0 8px 24px rgba(0,0,0,0.6),0 0 14px var(--green-glow);
            z-index:9999;animation:toastIn 0.22s ease;}
        `}</style>

        <div className="mob-pg">
          {/* Header */}
          <header className="mob-hd">
            <div className="mob-logo">🔗</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div className="mob-brand">VisuoSlayer</div>
              <div className="mob-sub">Linked List · Write · Run · Visualize</div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:5, flexShrink:0 }}>
              <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:7.5, color:lm.accent, background:`${lm.accent}14`, border:`1px solid ${lm.accent}30`, padding:"1px 7px", borderRadius:16, fontWeight:800 }}>{lm.ext}</span>
              <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:6.5, color:"var(--text-muted)", padding:"1px 5px", borderRadius:12, border:"1px solid var(--border-subtle)", background:"var(--surface-2)" }}>{mounted ? sessionId : "------"}</span>
            </div>
          </header>

          {/* Scrollable content */}
          <div className="mob-scroll" ref={scrollContainerRef}>

            {/* ── 01 CODE ── */}
            <div ref={sectionCodeRef} className="mob-sec">
              <div className="mob-sec-label"><span>⌨</span><span>01 · Code Editor</span></div>
              <div className="mob-editor-wrap">
                <div className="mob-ph">
                  <span className="dot" style={{ background:"#ff5f57", boxShadow:"0 0 5px #ff5f57" }} />
                  <span className="dot" style={{ background:"#ffbd2e", boxShadow:"0 0 5px #ffbd2e" }} />
                  <span className="dot" style={{ background:"#28c840", boxShadow:"0 0 5px #28c840" }} />
                  <span className="ptl">Code Editor</span>
                  <span style={{ marginLeft:"auto", fontFamily:"'JetBrains Mono',monospace", fontSize:7.5, color:lm.accent, background:`${lm.accent}12`, border:`1px solid ${lm.accent}28`, padding:"1px 7px", borderRadius:14, fontWeight:800 }}>{lm.name}</span>
                </div>
                {renderLangTabs(true)}
                <div style={{ flex:1, display:"flex", flexDirection:"column", minHeight:0, position:"relative" }}>
                  <CodeEditor code={code} setCode={setCode} step={step} errorLineSet={errorLineSet} onKeyDown={onKeyDown} taRef={taRef} />
                  {step && os && (
                    <div className="mob-alb" style={{ borderColor:os.bd, background:os.bg }}>
                      <span style={{ color:os.c, fontSize:9 }}>{os.icon}</span>
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
                {(steps.length>0||error||hasAiErrors) && <button className="mob-btn-rst" onClick={doReset}>↺ Reset</button>}
              </div>
            </div>

            {/* ── 02 TERMINAL ── */}
            <div ref={sectionTermRef} className="mob-sec" style={{ marginTop:2 }}>
              <div className="mob-sec-label"><span>⬛</span><span>02 · Terminal</span></div>
              <div className="mob-term-wrap">
                <div className="mob-ph">
                  <span className="dot" style={{ background:"#ff5f57" }} /><span className="dot" style={{ background:"#ffbd2e" }} /><span className="dot" style={{ background:"#28c840" }} />
                  <span className="ptl">visualoslayer — bash</span>
                  <span style={{ marginLeft:"auto", fontFamily:"'JetBrains Mono',monospace", fontSize:7, color:"var(--text-muted)" }}>pid:{mounted ? sessionId : "------"}</span>
                </div>
                <Terminal lines={termLines} sessionId={sessionId} validating={validating} currentStepIndex={idx} />
              </div>
            </div>

            {/* ── 03 VISUALIZATION ── */}
            <div ref={sectionVizRef} className="mob-sec" style={{ marginTop:2 }}>
              <div className="mob-sec-label"><span>🔗</span><span>03 · Linked List Visualization</span></div>
              <div className="mob-viz-wrap">
                <div className="mob-ph">
                  <span className="dot" style={{ background:"#4cc9f0", boxShadow:"0 0 5px #4cc9f0" }} />
                  <span className="dot" style={{ background:"#f72585", boxShadow:"0 0 5px #f72585" }} />
                  <span className="dot" style={{ background:"#ffd60a", boxShadow:"0 0 5px #ffd60a" }} />
                  <span className="ptl">Linked List</span>
                  {steps.length>0 && <span style={{ marginLeft:"auto", fontFamily:"'JetBrains Mono',monospace", fontSize:7.5, color:"var(--cyan)", background:"var(--cyan-dim)", border:"1px solid rgba(76,201,240,0.28)", padding:"1px 7px", borderRadius:12, fontWeight:800 }}>{idx+1}/{steps.length}</span>}
                </div>

                <LinkedListViz step={step} animKey={animKey} idle={idle} compact={true} />

                <div className="mob-oi">
                  {step && os ? (
                    <>
                      <div className="mob-oi-badge" style={{ color:os.c, background:os.bg, borderColor:os.bd }}>
                        <span>{os.icon}</span><span>{os.label}</span>
                        {step.type==="reverseStep" && step.phase==="init" && <span style={{ opacity:0.6 }}>init</span>}
                        {step.type==="reverseStep" && step.phase==="swap" && <span style={{ opacity:0.6 }}>{step.swappedCount+1}/{step.total}</span>}
                        {step.type==="reverseStep" && step.phase==="done" && <span style={{ color:"#06d6a0", opacity:0.9 }}>✓ done</span>}
                        {step.type!=="reverseStep" && step.value!=null && <span style={{ opacity:0.6 }}>({step.value})</span>}
                        {step.type==="search" && <span style={{ opacity:0.6 }}>→ {step.result>=0?`idx ${step.result}`:"not found"}</span>}
                        {step.type==="size"   && <span style={{ opacity:0.6 }}>→ {step.result}</span>}
                        {step.type==="delete" && <span style={{ opacity:0.6 }}>→ {step.found?"removed":"not found"}</span>}
                      </div>
                      {/* Pointer legend for reverseStep on mobile */}
                      {step.type==="reverseStep" && step.phase!=="done" && (
                        <div style={{ display:"flex", gap:8, marginBottom:3, flexWrap:"wrap" }}>
                          {step.prevIdx>=0 && <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:7.5, color:"#06d6a0", background:"rgba(6,214,160,0.1)", border:"1px solid rgba(6,214,160,0.3)", borderRadius:10, padding:"1px 6px" }}>PREV={step.origList[step.prevIdx]}</span>}
                          {step.curIdx>=0  && <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:7.5, color:"#4cc9f0", background:"rgba(76,201,240,0.1)", border:"1px solid rgba(76,201,240,0.3)", borderRadius:10, padding:"1px 6px" }}>CUR={step.origList[step.curIdx]}</span>}
                          {step.nextIdx>=0 && <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:7.5, color:"#c77dff", background:"rgba(199,125,255,0.1)", border:"1px solid rgba(199,125,255,0.3)", borderRadius:10, padding:"1px 6px" }}>NEXT={step.origList[step.nextIdx]}</span>}
                          {step.prevIdx<0  && <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:7.5, color:"#06d6a0", opacity:0.5, background:"rgba(6,214,160,0.06)", borderRadius:10, padding:"1px 6px" }}>PREV=NULL</span>}
                          {step.nextIdx<0  && <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:7.5, color:"#c77dff", opacity:0.5, background:"rgba(199,125,255,0.06)", borderRadius:10, padding:"1px 6px" }}>NEXT=NULL</span>}
                        </div>
                      )}
                      <div className="mob-oi-msg">{step.message}</div>
                    </>
                  ) : (
                    <div style={{ display:"flex", alignItems:"center", gap:7, fontFamily:"'JetBrains Mono',monospace", fontSize:8.5, color:"var(--text-muted)", padding:"4px 0" }}>
                      <span>🔗</span>
                      <span>{idle?"Write a LinkedList, hit Run to visualize":hasAiErrors?"Errors found — check Terminal":error?"Fix errors and run again":validating?"Reviewing code…":"Waiting…"}</span>
                    </div>
                  )}
                </div>

                {steps.length>0 && renderControls(true)}
                {steps.length>0 && (
                  <div className="mob-pr">
                    <div className="mob-pt2"><div className="mob-pf" style={{ width:`${prog}%` }} /></div>
                    <span className="mob-ptx">{prog}%</span>
                  </div>
                )}
                {steps.length>0 && (
                  <>
                    <div className="mob-slh"><span>OPERATION LOG</span><span style={{ color:"var(--cyan)", fontSize:6.5 }}>{steps.length} ops</span></div>
                    {renderOpLog(true)}
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

  // ── DESKTOP / TABLET LAYOUT ───────────────────────────────────────────────
  return (
    <>
      <style>{SHARED_CSS + `
        html,body{overflow:hidden;}
        .pg{height:100vh;display:flex;flex-direction:column;overflow:hidden;
          background:
            radial-gradient(ellipse 65% 45% at 5% 0%,rgba(76,201,240,0.1) 0%,transparent 55%),
            radial-gradient(ellipse 55% 40% at 95% 100%,rgba(247,37,133,0.09) 0%,transparent 52%),
            radial-gradient(ellipse 40% 35% at 50% 50%,rgba(114,9,183,0.05) 0%,transparent 60%),
            #050818;}

        .hd{flex-shrink:0;display:flex;align-items:center;gap:13px;padding:9px 24px;
          background:rgba(5,8,22,0.99);backdrop-filter:blur(24px);
          border-bottom:1px solid rgba(76,201,240,0.14);
          box-shadow:0 1px 0 rgba(76,201,240,0.07),0 4px 28px rgba(0,0,0,0.5);}
        .hd-logo{width:36px;height:36px;border-radius:10px;flex-shrink:0;
          background:linear-gradient(135deg,#0369a1,#4cc9f0 45%,#7209b7);
          display:flex;align-items:center;justify-content:center;font-size:18px;
          box-shadow:0 0 22px rgba(76,201,240,0.55),0 0 50px rgba(76,201,240,0.18);
          animation:rPulse 3s ease-in-out infinite;}
        .hd-brand{font-family:'Space Grotesk',sans-serif;font-size:17px;font-weight:900;letter-spacing:-0.5px;
          background:linear-gradient(90deg,#4cc9f0 0%,#c77dff 50%,#f72585 100%);
          background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;
          animation:shimmer 4s linear infinite;}
        .hd-tagline{font-size:9px;color:var(--text-muted);font-family:'JetBrains Mono',monospace;margin-top:1px;letter-spacing:0.05em;}
        .hd-r{margin-left:auto;display:flex;align-items:center;gap:9px;}
        .hd-pill{font-family:'JetBrains Mono',monospace;font-size:8.5px;padding:3px 11px;border-radius:20px;letter-spacing:0.08em;white-space:nowrap;font-weight:800;}
        .hd-pid{font-family:'JetBrains Mono',monospace;font-size:8px;color:var(--text-muted);padding:3px 10px;border-radius:20px;border:1px solid var(--border-subtle);background:var(--surface-2);}
        .hd-ds-badge{font-family:'JetBrains Mono',monospace;font-size:8px;color:var(--cyan);padding:3px 10px;border-radius:20px;border:1px solid rgba(76,201,240,0.28);background:rgba(76,201,240,0.08);letter-spacing:0.1em;}

        .main{flex:1;display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:10px 20px;min-height:0;overflow:hidden;}
        @media(max-width:1100px){.main{padding:8px 14px;gap:8px;}}

        .panel{background:var(--surface-1);border:1px solid var(--border-subtle);border-radius:14px;
          display:flex;flex-direction:column;overflow:hidden;
          box-shadow:0 20px 60px rgba(0,0,0,0.55),inset 0 1px 0 rgba(255,255,255,0.04);min-height:0;}
        .ph{padding:9px 14px;border-bottom:1px solid var(--border-subtle);
          background:rgba(8,14,38,0.88);display:flex;align-items:center;gap:7px;flex-shrink:0;}
        .dot{width:9px;height:9px;border-radius:50%;transition:box-shadow 0.3s;}
        .ptl{font-family:'JetBrains Mono',monospace;font-size:8px;color:var(--text-muted);
          text-transform:uppercase;letter-spacing:1.5px;margin-left:8px;font-weight:700;}
        .left{display:flex;flex-direction:column;min-height:0;}

        .lb{display:flex;gap:3px;flex-wrap:wrap;padding:7px 11px;
          border-bottom:1px solid var(--border-subtle);background:rgba(6,11,30,0.85);flex-shrink:0;}
        .lt{padding:4px 10px;border-radius:6px;cursor:pointer;
          font-family:'JetBrains Mono',monospace;font-size:8.5px;font-weight:800;
          border:1px solid var(--border-subtle);background:transparent;
          color:var(--text-muted);transition:all 0.15s;letter-spacing:0.06em;}
        .lt:hover{color:var(--text-secondary);border-color:var(--border-medium);background:rgba(255,255,255,0.04);}
        .lt.la{color:#e8f4ff;background:rgba(255,255,255,0.07);box-shadow:inset 0 1px 0 rgba(255,255,255,0.12);}

        .alb{display:flex;align-items:center;gap:8px;padding:5px 14px;border-left:2px solid;
          min-height:27px;border-top:1px solid var(--border-subtle);flex-shrink:0;
          animation:fadeIn 0.18s ease;backdrop-filter:blur(4px);}
        .alb-ln{font-family:'JetBrains Mono',monospace;font-size:9px;font-weight:800;white-space:nowrap;}
        .alb-code{font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--text-secondary);
          overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;}

        .rr{padding:9px 13px;border-top:1px solid var(--border-subtle);
          display:flex;align-items:center;gap:8px;flex-shrink:0;background:rgba(4,8,22,0.65);}
        .btn-run{padding:7px 20px;border-radius:9px;
          background:linear-gradient(135deg,#0369a1,#0ea5e9,#4cc9f0);
          border:1px solid rgba(76,201,240,0.32);color:#fff;
          font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:800;cursor:pointer;
          transition:all 0.18s;box-shadow:0 0 22px rgba(76,201,240,0.32),0 3px 10px rgba(0,0,0,0.45);
          letter-spacing:0.05em;position:relative;overflow:hidden;}
        .btn-run::after{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,0.16) 0%,transparent 60%);border-radius:inherit;pointer-events:none;}
        .btn-run:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 0 38px rgba(76,201,240,0.58),0 6px 22px rgba(0,0,0,0.55);}
        .btn-run:active:not(:disabled){transform:translateY(0);}
        .btn-run.running{animation:rPulse 1.2s ease-in-out infinite;background:linear-gradient(135deg,#023e8a,#0077b6,#0ea5e9);}
        .btn-run:disabled{opacity:0.4;cursor:not-allowed;transform:none;box-shadow:none;}
        .btn-rst{padding:7px 13px;border-radius:9px;background:transparent;
          border:1px solid rgba(248,113,113,0.28);color:#f87171;
          font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;cursor:pointer;transition:all 0.16s;}
        .btn-rst:hover{background:rgba(248,113,113,0.1);border-color:rgba(248,113,113,0.52);box-shadow:0 0 14px rgba(248,113,113,0.2);}
        .rr-hint{font-family:'JetBrains Mono',monospace;font-size:8px;color:var(--text-muted);letter-spacing:0.07em;padding:3px 7px;border-radius:5px;border:1px solid var(--border-subtle);background:var(--surface-2);}

        .term-bar{display:flex;align-items:center;gap:6px;padding:7px 14px;
          background:rgba(4,7,18,0.97);border-bottom:1px solid var(--border-subtle);border-top:1px solid var(--border-subtle);flex-shrink:0;}
        .term-toggle{display:flex;align-items:center;justify-content:center;width:19px;height:19px;border-radius:5px;
          border:1px solid var(--border-medium);background:rgba(255,255,255,0.04);cursor:pointer;flex-shrink:0;
          color:var(--text-secondary);font-size:9px;font-weight:700;transition:all 0.15s;margin-left:auto;
          font-family:'JetBrains Mono',monospace;line-height:1;user-select:none;}
        .term-toggle:hover{background:var(--cyan-dim);color:var(--cyan);border-color:rgba(76,201,240,0.42);box-shadow:0 0 9px var(--cyan-glow);}
        .tm-wrap{display:flex;flex-direction:column;min-height:0;transition:flex-basis 0.32s cubic-bezier(0.4,0,0.2,1),opacity 0.25s;overflow:hidden;}
        .tm-wrap.tm-open{flex:1;min-height:110px;}
        .tm-wrap.tm-closed{flex:0 0 0px;min-height:0;opacity:0;pointer-events:none;}
        .term-body-wrap{flex:1;display:flex;flex-direction:column;min-height:0;animation:fadeUp 0.28s ease;}
        .term-bar-closed{display:flex;align-items:center;gap:6px;padding:7px 14px;background:rgba(4,7,18,0.97);border-top:1px solid var(--border-subtle);flex-shrink:0;cursor:pointer;transition:background 0.15s;}
        .term-bar-closed:hover{background:rgba(8,14,32,0.97);}

        .oi{padding:9px 15px;border-top:1px solid var(--border-subtle);background:rgba(4,8,24,0.68);min-height:70px;flex-shrink:0;}
        .oi-badge{display:inline-flex;align-items:center;gap:7px;padding:4px 13px;border-radius:20px;margin-bottom:5px;font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:800;animation:stepPop 0.22s ease;border:1px solid;letter-spacing:0.04em;}
        .oi-msg{font-family:'JetBrains Mono',monospace;font-size:10px;line-height:1.6;animation:fadeUp 0.2s ease;color:var(--text-secondary);}
        .oi-idle{display:flex;align-items:center;gap:8px;font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--text-muted);letter-spacing:0.04em;padding:6px 0;}

        .ctrl{display:flex;align-items:center;gap:5px;padding:7px 13px;border-top:1px solid var(--border-subtle);background:rgba(3,6,18,0.7);flex-wrap:wrap;flex-shrink:0;}
        .cb{width:30px;height:28px;border-radius:7px;border:1px solid var(--border-medium);background:var(--surface-3);color:var(--text-secondary);font-size:11px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.14s;box-shadow:0 1px 3px rgba(0,0,0,0.3);}
        .cb:hover:not(:disabled){background:var(--cyan-dim);color:var(--cyan);border-color:rgba(76,201,240,0.48);box-shadow:0 0 14px var(--cyan-glow);}
        .cb:active:not(:disabled){transform:scale(0.92);}
        .cb:disabled{opacity:0.22;cursor:not-allowed;}
        .cp{height:28px;padding:0 14px;border-radius:7px;background:linear-gradient(135deg,#0369a1,#0ea5e9,#4cc9f0);border:1px solid rgba(76,201,240,0.38);color:#fff;font-size:11px;font-weight:800;cursor:pointer;box-shadow:0 0 18px rgba(76,201,240,0.38);transition:all 0.15s;}
        .cp:hover{transform:scale(1.07);box-shadow:0 0 30px rgba(76,201,240,0.6);}
        .cp:active{transform:scale(0.96);}
        .cp:disabled{opacity:0.25;cursor:not-allowed;transform:none;box-shadow:none;}
        .csep{width:1px;height:16px;background:var(--border-subtle);margin:0 3px;}
        .spd{display:flex;gap:2px;}
        .sb{padding:3px 8px;border-radius:5px;cursor:pointer;font-family:'JetBrains Mono',monospace;font-size:8px;font-weight:700;border:1px solid var(--border-subtle);background:transparent;color:var(--text-muted);transition:all 0.12s;}
        .sb:hover{color:var(--text-secondary);border-color:var(--border-medium);}
        .sb.sa{background:var(--cyan-dim);border-color:rgba(76,201,240,0.42);color:var(--cyan);box-shadow:0 0 9px rgba(76,201,240,0.22);}

        .pr{display:flex;align-items:center;gap:8px;padding:6px 15px;border-top:1px solid var(--border-subtle);flex-shrink:0;}
        .pt2{flex:1;height:4px;background:rgba(255,255,255,0.05);border-radius:99px;overflow:hidden;box-shadow:inset 0 1px 2px rgba(0,0,0,0.35);}
        .pf{height:100%;border-radius:99px;transition:width 0.4s cubic-bezier(0.4,0,0.2,1);background:linear-gradient(90deg,#0369a1,#4cc9f0,#c77dff);box-shadow:0 0 10px rgba(76,201,240,0.55);}
        .ptx{font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--text-secondary);min-width:32px;text-align:right;}

        .slh{padding:5px 15px 2px;font-family:'JetBrains Mono',monospace;font-size:7px;color:var(--text-muted);letter-spacing:0.18em;text-transform:uppercase;font-weight:700;border-top:1px solid var(--border-subtle);flex-shrink:0;display:flex;align-items:center;justify-content:space-between;}
        .slh-count{color:var(--cyan);opacity:0.75;}
        .sl{overflow-y:auto;padding:3px 8px 8px;display:flex;flex-direction:column;gap:1.5px;max-height:95px;flex-shrink:0;scrollbar-width:thin;scrollbar-color:rgba(76,201,240,0.22) transparent;}
        .si{display:flex;align-items:center;gap:6px;padding:3px 8px;border-radius:5px;cursor:pointer;font-family:'JetBrains Mono',monospace;font-size:8.5px;color:var(--text-muted);transition:all 0.12s;border:1px solid transparent;}
        .si:hover{background:var(--cyan-dim);color:var(--text-secondary);border-color:rgba(76,201,240,0.14);}
        .sl-active{background:rgba(76,201,240,0.1)!important;border-color:rgba(76,201,240,0.25)!important;color:var(--cyan)!important;box-shadow:inset 3px 0 0 var(--cyan);}
        .si-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0;transition:all 0.15s;}
        .si-v{opacity:0.55;margin-left:2px;}
        .si-ln{margin-left:auto;font-size:7px;color:var(--text-muted);opacity:0.7;}
        .si-past .si-dot{background:var(--green)!important;box-shadow:0 0 5px var(--green-glow)!important;}

        .toast{position:fixed;bottom:24px;right:24px;padding:9px 18px;border-radius:10px;
          font-family:'JetBrains Mono',monospace;font-size:10.5px;font-weight:700;
          background:rgba(10,20,50,0.98);border:1px solid var(--border-medium);
          color:var(--green);box-shadow:0 8px 28px rgba(0,0,0,0.6),0 0 18px var(--green-glow);
          z-index:9999;animation:toastIn 0.25s ease,toastOut 0.3s ease 1.9s forwards;}
      `}</style>

      <div className="pg">
        <header className="hd">
          <div className="hd-logo">🔗</div>
          <div>
            <div className="hd-brand">VisuoSlayer</div>
            <div className="hd-tagline">Linked List DS Visualizer · Write · Run · Step through every pointer</div>
          </div>
          <div className="hd-r">
            <div className="hd-ds-badge">SINGLY LINKED LIST</div>
            <div className="hd-pill" style={{ color:lm.accent, background:`${lm.accent}14`, border:`1px solid ${lm.accent}30` }}>{lm.name}</div>
            <div className="hd-pid">pid:{mounted ? sessionId : "------"}</div>
          </div>
        </header>

        <main className="main">
          {/* LEFT — Editor + Terminal */}
          <div className="panel left">
            <div className="ph">
              <span className="dot" style={{ background:"#ff5f57", boxShadow:"0 0 6px #ff5f57" }} />
              <span className="dot" style={{ background:"#ffbd2e", boxShadow:"0 0 6px #ffbd2e" }} />
              <span className="dot" style={{ background:"#28c840", boxShadow:"0 0 6px #28c840" }} />
              <span className="ptl">Code Editor</span>
              <span style={{ marginLeft:"auto", fontFamily:"'JetBrains Mono',monospace", fontSize:8, color:lm.accent, background:`${lm.accent}14`, border:`1px solid ${lm.accent}30`, padding:"2px 9px", borderRadius:20, fontWeight:800 }}>{lm.name}</span>
            </div>

            <div style={{ flex: termOpen?"0 0 58%":"1", display:"flex", flexDirection:"column", minHeight:0, borderBottom:"1px solid var(--border-subtle)" }}>
              {renderLangTabs(false)}
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
                {(steps.length>0||error||hasAiErrors) && <button className="btn-rst" onClick={doReset}>↺ Reset</button>}
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
                  <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:8, color:"var(--text-muted)", marginLeft:8 }}>pid:{mounted ? sessionId : "------"}</span>
                  <button className="term-toggle" onClick={() => setTermOpen(false)}>▾</button>
                </div>
                <Terminal lines={termLines} sessionId={sessionId} validating={validating} currentStepIndex={idx} />
              </div>
            </div>

            {!termOpen && (
              <div className="term-bar-closed" onClick={() => setTermOpen(true)}>
                <span className="dot" style={{ background:"#ff5f57" }} /><span className="dot" style={{ background:"#ffbd2e" }} /><span className="dot" style={{ background:"#28c840" }} />
                <span style={{ marginLeft:8, fontFamily:"'JetBrains Mono',monospace", fontSize:8.5, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"1.2px" }}>visualoslayer — bash</span>
                {termLines.some(l=>l.type==="error"||l.type==="stderr") && <span style={{ marginLeft:8, fontFamily:"'JetBrains Mono',monospace", fontSize:8, color:"#f87171", background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.28)", padding:"1px 7px", borderRadius:10 }}>errors</span>}
                {termLines.some(l=>l.type==="success") && <span style={{ marginLeft:8, fontFamily:"'JetBrains Mono',monospace", fontSize:8, color:"var(--green)", background:"var(--green-dim)", border:"1px solid rgba(57,217,138,0.28)", padding:"1px 7px", borderRadius:10 }}>ok</span>}
                <span style={{ marginLeft:"auto", fontFamily:"'JetBrains Mono',monospace", fontSize:8.5, color:"var(--cyan)", fontWeight:800 }}>▴ open</span>
              </div>
            )}
          </div>

          {/* RIGHT — Visualization */}
          <div className="panel">
            <div className="ph">
              <span className="dot" style={{ background:"#4cc9f0", boxShadow:"0 0 6px #4cc9f0" }} />
              <span className="dot" style={{ background:"#f72585", boxShadow:"0 0 6px #f72585" }} />
              <span className="dot" style={{ background:"#ffd60a", boxShadow:"0 0 6px #ffd60a" }} />
              <span className="ptl">Linked List Visualization</span>
              {steps.length>0 && (
                <span style={{ marginLeft:"auto", fontFamily:"'JetBrains Mono',monospace", fontSize:8, color:"var(--cyan)", background:"var(--cyan-dim)", border:"1px solid rgba(76,201,240,0.28)", padding:"2px 10px", borderRadius:20, fontWeight:800 }}>
                  {idx+1} / {steps.length}
                </span>
              )}
            </div>

            <div style={{ flex:1, display:"flex", flexDirection:"column", minHeight:0, overflow:"hidden" }}>
              <LinkedListViz step={step} animKey={animKey} idle={idle} compact={false} />

              <div className="oi">
                {step && os ? (
                  <>
                    <div className="oi-badge" style={{ color:os.c, background:os.bg, borderColor:os.bd }}>
                      <span>{os.icon}</span><span>{os.label}</span>
                      {step.type==="reverseStep" && step.phase==="init" && <span style={{ opacity:0.6 }}>init</span>}
                      {step.type==="reverseStep" && step.phase==="swap" && <span style={{ opacity:0.6 }}>step {step.swappedCount+1}/{step.total}</span>}
                      {step.type==="reverseStep" && step.phase==="done" && <span style={{ color:"#06d6a0" }}>✓ done</span>}
                      {step.type!=="reverseStep" && step.value!=null && <span style={{ opacity:0.55 }}>({step.value})</span>}
                      {step.type==="search" && <span style={{ opacity:0.55 }}>→ {step.result>=0?`idx ${step.result}`:"not found"}</span>}
                      {step.type==="size"   && <span style={{ opacity:0.55 }}>→ {step.result}</span>}
                      {step.type==="delete" && <span style={{ opacity:0.55 }}>→ {step.found?"removed":"not found"}</span>}
                    </div>
                    {/* Pointer state chips for reverseStep */}
                    {step.type==="reverseStep" && step.phase!=="done" && (
                      <div style={{ display:"flex", gap:7, marginTop:3, marginBottom:2, flexWrap:"wrap" }}>
                        <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:8.5, color:"#06d6a0", background:"rgba(6,214,160,0.1)", border:"1px solid rgba(6,214,160,0.3)", borderRadius:10, padding:"1px 8px" }}>
                          PREV = {step.prevIdx>=0 ? step.origList[step.prevIdx] : "NULL"}
                        </span>
                        <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:8.5, color:"#4cc9f0", background:"rgba(76,201,240,0.1)", border:"1px solid rgba(76,201,240,0.3)", borderRadius:10, padding:"1px 8px" }}>
                          CUR = {step.curIdx>=0 ? step.origList[step.curIdx] : "NULL"}
                        </span>
                        <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:8.5, color:"#c77dff", background:"rgba(199,125,255,0.1)", border:"1px solid rgba(199,125,255,0.3)", borderRadius:10, padding:"1px 8px" }}>
                          NEXT = {step.nextIdx>=0 ? step.origList[step.nextIdx] : "NULL"}
                        </span>
                        <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:8.5, color:"#ffd60a", background:"rgba(255,214,10,0.1)", border:"1px solid rgba(255,214,10,0.3)", borderRadius:10, padding:"1px 8px" }}>
                          cur.next ← {step.prevIdx>=0 ? step.origList[step.prevIdx] : "NULL"}
                        </span>
                      </div>
                    )}
                    <div className="oi-msg">{step.message}</div>
                  </>
                ) : (
                  <div className="oi-idle">
                    <span>🔗</span>
                    <span style={{ color:"var(--text-muted)" }}>
                      {idle?"Write a LinkedList class, use it below, hit Run"
                        :hasAiErrors?"VisuoSlayer found errors — see terminal"
                        :error?"Fix errors and run again"
                        :validating?"VisuoSlayer reviewing your code…"
                        :"Waiting…"}
                    </span>
                  </div>
                )}
              </div>

              {steps.length>0 && renderControls(false)}
              {steps.length>0 && (
                <div className="pr">
                  <div className="pt2"><div className="pf" style={{ width:`${prog}%` }} /></div>
                  <span className="ptx">{prog}%</span>
                </div>
              )}
              {steps.length>0 && (
                <>
                  <div className="slh"><span>OPERATION LOG — click to jump</span><span className="slh-count">{steps.length} ops</span></div>
                  {renderOpLog(false)}
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