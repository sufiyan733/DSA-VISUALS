"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

// ═══════════════════════════════════════════════════════════════════════════════
// VOICE ENGINE — Premium male voice with variable speed
// ═══════════════════════════════════════════════════════════════════════════════
let currentRate = 1.25;

function getMaleVoice() {
  if (typeof window === "undefined") return null;
  const all = window.speechSynthesis.getVoices();
  const picks = [
    v => v.name === "Google UK English Male",
    v => v.name === "Microsoft Ryan Online (Natural) - English (United Kingdom)",
    v => v.name === "Microsoft Guy Online (Natural) - English (United States)",
    v => v.name === "Microsoft Davis Online (Natural) - English (United States)",
    v => v.name === "Microsoft Mark - English (United States)",
    v => v.name === "Alex",
    v => v.name === "Daniel",
    v => /Natural/i.test(v.name) && /male|man|guy|ryan|davis|mark|daniel|alex|james|chris/i.test(v.name) && v.lang.startsWith("en"),
    v => /Neural/i.test(v.name) && v.lang.startsWith("en-US") && !/aria|jenny|zira|hazel|susan|linda/i.test(v.name),
    v => v.lang.startsWith("en-GB"),
    v => v.lang.startsWith("en"),
  ];
  for (const fn of picks) { const m = all.find(fn); if (m) return m; }
  return all[0] ?? null;
}

function voiceSpeak(text, onEnd, rate) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const go = () => {
    const u = new SpeechSynthesisUtterance(text);
    u.rate = rate ?? currentRate; u.pitch = 0.92; u.volume = 1;
    const v = getMaleVoice(); if (v) u.voice = v;
    u.onend = onEnd; u.onerror = () => onEnd?.();
    window.speechSynthesis.speak(u);
  };
  window.speechSynthesis.getVoices().length === 0
    ? (window.speechSynthesis.onvoiceschanged = () => { go(); window.speechSynthesis.onvoiceschanged = null; })
    : go();
}
function voiceStop() { typeof window !== "undefined" && window.speechSynthesis?.cancel(); }

// ═══════════════════════════════════════════════════════════════════════════════
// NARRATIONS
// ═══════════════════════════════════════════════════════════════════════════════
const NARR = {
  intro: `A linked list is a chain of nodes. Each node holds two things: the data you care about, and a pointer to the next node. Unlike arrays, the nodes live scattered across memory — connected only by these pointers. This gives linked lists a superpower: inserting and deleting anywhere is O of 1, as long as you have a pointer to that position. The tradeoff? No random access. You cannot jump to index 5 directly. You must walk the chain from the beginning.`,

  nodes: `Every node is the same shape: a value and a pointer to the next node. The head pointer marks where the list begins. The tail's next pointer is null — that's how you know you've reached the end. In a doubly linked list, every node also has a prev pointer, pointing backward. This doubles your pointer storage but lets you traverse in both directions.`,

  types: `There are three flavors of linked lists. Singly linked: one pointer per node, forward only — the simplest and most memory-efficient. Doubly linked: two pointers per node, forward and backward — more flexible, costs one extra pointer per node. Circular: the tail's next pointer loops back to the head instead of null — perfect for round-robin scheduling, music playlists, and anything that needs to cycle forever.`,

  ops: `Insertion and deletion are where linked lists shine. Insert at head: create a new node, point it to the current head, update head. That's O of 1. Insert at tail: walk to the end, attach. O of n unless you keep a tail pointer. Insert in the middle: walk to position, rewire two pointers. O of n to find, O of 1 to insert. Delete: find the predecessor, update its next pointer to skip the target. The deleted node becomes unreachable and gets garbage collected.`,

  traversal: `Traversal means walking every node from head to null. Use a current pointer, start at head, move current to current dot next, stop when current is null. This is always O of n — you must visit every node. Searching for a value is also O of n. There's no shortcut. Unlike arrays, you cannot binary search a linked list because there's no random access. Index lookups are O of n.`,

  advanced: `Two-pointer technique is the key to most linked list interview problems. Use a slow pointer and a fast pointer. Fast moves two steps, slow moves one. When fast reaches the end, slow is at the middle. This also detects cycles: if fast and slow ever point to the same node, there's a cycle. Floyd's algorithm. Reversing a list uses three pointers: previous, current, and next. Walk the list, flip each arrow, done in O of n with O of 1 space.`,

  memory: `Arrays store elements contiguously — each element sits right next to the last in memory. Linked lists scatter nodes anywhere the allocator finds space. Arrays have superb cache performance: when you load element zero, elements one through fifteen likely land in the same cache line. Linked list traversal causes cache misses at every node — a serious performance cost in practice. For small data that needs frequent insertion and deletion in the middle, linked lists win. For most other cases, arrays win.`,

  quiz: `You've reached the quiz. You've learned what nodes are, the three types of linked lists, insertion and deletion mechanics, traversal and the two-pointer technique, cycle detection with Floyd's algorithm, and the memory model. Some questions will require careful thought about pointer manipulation. Getting something wrong is the fastest path to understanding it correctly. Take your time.`,
};

const NAV_SECTIONS = [
  { id: "intro",      icon: "🔗", label: "Intro",      col: "#38bdf8" },
  { id: "nodes",      icon: "🧩", label: "Nodes",      col: "#a78bfa" },
  { id: "types",      icon: "🌿", label: "Types",      col: "#34d399" },
  { id: "ops",        icon: "⚡", label: "Operations", col: "#fb923c" },
  { id: "traversal",  icon: "🚶", label: "Traversal",  col: "#f472b6" },
  { id: "advanced",   icon: "🧠", label: "Advanced",   col: "#fbbf24" },
  { id: "memory",     icon: "💾", label: "Memory",     col: "#60a5fa" },
  { id: "quiz",       icon: "🎯", label: "Quiz",       col: "#ec4899" },
];

const SPEED_OPTIONS = [0.75, 1.0, 1.25, 1.5, 2.0];

// ═══════════════════════════════════════════════════════════════════════════════
// HOOKS
// ═══════════════════════════════════════════════════════════════════════════════
function useVisible(threshold = 0.07) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return [ref, vis];
}

function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) setMatches(media.matches);
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);
  return matches;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROGRESS BAR
// ═══════════════════════════════════════════════════════════════════════════════
function ProgressBar() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const h = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setP(max > 0 ? (window.scrollY / max) * 100 : 0);
    };
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 3, zIndex: 999, background: "rgba(255,255,255,0.03)" }}>
      <div style={{ height: "100%", width: `${p}%`, background: "linear-gradient(90deg,#38bdf8,#a78bfa,#34d399,#f472b6)", transition: "width 0.1s linear", boxShadow: "0 0 14px rgba(56,189,248,0.9)" }} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SPEAKING WAVE
// ═══════════════════════════════════════════════════════════════════════════════
function SpeakingWave({ color = "#38bdf8", size = 16 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2, height: size }}>
      {[0, 1, 2, 3].map(i => (
        <div key={i} style={{ width: size * 0.18, height: size * 0.5, background: color, borderRadius: 99, animation: `wave 1.1s ease-in-out ${i * 0.15}s infinite` }} />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MINI PLAYER
// ═══════════════════════════════════════════════════════════════════════════════
function MiniPlayer({ speaking, speakingLabel, onStop, speed }) {
  if (!speaking) return null;
  return (
    <div style={{
      position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
      zIndex: 850, display: "flex", alignItems: "center", gap: 12,
      padding: "10px 20px", borderRadius: 99,
      background: "rgba(3,7,18,0.97)", backdropFilter: "blur(24px)",
      border: "1px solid rgba(56,189,248,0.35)",
      boxShadow: "0 8px 36px rgba(56,189,248,0.18),0 2px 12px rgba(0,0,0,0.7)",
      animation: "slideUp 0.35s cubic-bezier(0.22,1,0.36,1) both",
      maxWidth: "calc(100vw - 48px)",
    }}>
      <SpeakingWave color="#38bdf8" size={16} />
      <div>
        <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 600, color: "#e2e8f0", lineHeight: 1 }}>{speakingLabel}</div>
        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "#38bdf8", marginTop: 2 }}>{speed}× · premium male voice</div>
      </div>
      <button onClick={onStop} style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.35)", borderRadius: 20, cursor: "pointer", padding: "4px 12px", fontFamily: "'JetBrains Mono',monospace", fontSize: 9, fontWeight: 700, color: "#f87171" }}>⏹ STOP</button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// BACK TO TOP
// ═══════════════════════════════════════════════════════════════════════════════
function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const h = () => setShow(window.scrollY > 1200);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  return (
    <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} style={{
      position: "fixed", bottom: 24, right: 20, zIndex: 850,
      width: 44, height: 44, borderRadius: 14, cursor: "pointer",
      background: "rgba(56,189,248,0.15)", border: "1px solid rgba(56,189,248,0.35)",
      color: "#7dd3fc", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center",
      opacity: show ? 1 : 0, transform: show ? "scale(1)" : "scale(0.7)",
      pointerEvents: show ? "auto" : "none",
      transition: "all 0.3s cubic-bezier(0.22,1,0.36,1)",
      boxShadow: "0 8px 24px rgba(56,189,248,0.3)",
    }}>↑</button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPLETED BADGE
// ═══════════════════════════════════════════════════════════════════════════════
function CompletedBadge({ seen }) {
  if (!seen) return null;
  return (
    <span style={{
      padding: "2px 9px", borderRadius: 20, fontSize: 9,
      fontFamily: "'JetBrains Mono',monospace", fontWeight: 700,
      background: "rgba(56,189,248,0.12)", border: "1px solid rgba(56,189,248,0.3)",
      color: "#38bdf8", letterSpacing: "0.08em", animation: "fadeIn 0.4s ease both",
    }}>✓ READ</span>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SPEED PANEL (embedded in RightSidebar)
// ═══════════════════════════════════════════════════════════════════════════════
function SpeedPanel({ speed, setSpeed, speaking, onRestart }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(o => !o)}
        title="Playback Speed"
        style={{
          display: "flex", alignItems: "center", gap: 5,
          padding: "5px 11px", borderRadius: 20, cursor: "pointer",
          background: open ? "rgba(56,189,248,0.2)" : "rgba(255,255,255,0.05)",
          border: `1.5px solid ${open ? "#38bdf8" : "rgba(255,255,255,0.1)"}`,
          fontFamily: "'JetBrains Mono',monospace", fontSize: 9, fontWeight: 700,
          color: open ? "#7dd3fc" : "#64748b", transition: "all 0.2s",
        }}>
        ⚡ {speed}×
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", right: 0,
          background: "rgba(8,10,22,0.97)", backdropFilter: "blur(28px)",
          border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14,
          padding: "8px 6px", display: "flex", flexDirection: "column", gap: 3,
          zIndex: 1000, minWidth: 100,
          boxShadow: "0 16px 48px rgba(0,0,0,0.7)",
          animation: "panelPop 0.18s cubic-bezier(0.22,1,0.36,1) both",
        }}>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: "#2d3748", letterSpacing: "0.1em", padding: "2px 8px 6px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>SPEED</div>
          {SPEED_OPTIONS.map(s => (
            <button key={s} onClick={() => {
              currentRate = s;
              setSpeed(s);
              setOpen(false);
              if (speaking) onRestart();
            }} style={{
              padding: "6px 12px", borderRadius: 8, cursor: "pointer", textAlign: "left",
              background: speed === s ? "rgba(56,189,248,0.2)" : "transparent",
              border: `1px solid ${speed === s ? "rgba(56,189,248,0.45)" : "transparent"}`,
              fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 700,
              color: speed === s ? "#7dd3fc" : "#475569", transition: "all 0.15s",
            }}>
              {s === 1.25 ? `${s}× ★` : `${s}×`}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// RIGHT SIDEBAR (replaces top sticky nav)
// ═══════════════════════════════════════════════════════════════════════════════
function RightSidebar({ active, speaking, speed, setSpeed, onRestart, seenCount, open, setOpen }) {
  const [show, setShow] = useState(false);
  const [speedOpen, setSpeedOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 600px)');
  const router = useRouter();

  useEffect(() => {
    const h = () => setShow(window.scrollY > 500);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  const goToCode = () => { router.push("/ll"); };

  if (!open) {
    const btnSize = isMobile ? 36 : 40;
    const btnRight = isMobile ? 12 : 16;
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          position: "fixed",
          right: btnRight,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 950,
          width: btnSize,
          height: btnSize,
          borderRadius: btnSize / 2,
          background: "rgba(56,189,248,0.2)",
          border: "1px solid rgba(56,189,248,0.4)",
          backdropFilter: "blur(12px)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: isMobile ? 18 : 20,
          color: "#38bdf8",
          transition: "all 0.2s",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        }}
      >
        ◀
      </button>
    );
  }

  // Mobile values (compact)
  const mobileBtnSize = 32;
  const mobileGap = 3;
  const mobilePadding = "8px 6px";
  const mobileFontIcon = 18;
  const mobileFontText = 9;
  const mobileCodePadding = "4px 8px";
  const mobileProgressPillPadding = "4px 8px";
  const mobileProgressBarWidth = 24;
  const mobileSpeakingPadding = "4px 8px";

  const isMobileView = isMobile;
  const btnSize = isMobileView ? mobileBtnSize : 36;
  const gap = isMobileView ? mobileGap : 4;
  const padding = isMobileView ? mobilePadding : "8px 6px";
  const fontSizeIcon = isMobileView ? mobileFontIcon : 16;
  const fontSizeText = isMobileView ? mobileFontText : 8;
  const codePadding = isMobileView ? mobileCodePadding : "4px 8px";
  const progressPillPadding = isMobileView ? mobileProgressPillPadding : "3px 6px";
  const progressBarWidth = isMobileView ? mobileProgressBarWidth : 24;
  const speakingPadding = isMobileView ? mobileSpeakingPadding : "3px 6px";

  return (
    <nav
      style={{
        position: "fixed",
        right: isMobileView ? 12 : 16,
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 900,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap,
        padding,
        background: "rgba(3,6,18,0.94)",
        backdropFilter: "blur(28px) saturate(180%)",
        borderRadius: isMobileView ? 24 : 24,
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "0 12px 48px rgba(0,0,0,0.7)",
        opacity: show ? 1 : 0,
        pointerEvents: show ? "auto" : "none",
        transition: "opacity 0.3s ease",
        width: "auto",
        maxHeight: isMobileView ? "85vh" : "auto",
        overflowY: isMobileView ? "auto" : "visible",
        scrollbarWidth: "thin",
      }}
    >
      {/* Close button */}
      <button
        onClick={() => setOpen(false)}
        style={{
          width: btnSize,
          height: btnSize,
          borderRadius: 10,
          border: "none",
          background: "rgba(255,255,255,0.05)",
          cursor: "pointer",
          fontSize: isMobileView ? 14 : 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#94a3b8",
          marginBottom: 2,
        }}
      >
        ✕
      </button>

      {/* Section icons */}
      {NAV_SECTIONS.map((s) => (
        <button
          key={s.id}
          onClick={() => document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth" })}
          title={s.label}
          style={{
            width: btnSize,
            height: btnSize,
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            background: active === s.id ? `${s.col}22` : "transparent",
            outline: active === s.id ? `1.5px solid ${s.col}55` : "1.5px solid transparent",
            fontSize: fontSizeIcon,
            transition: "all 0.2s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            flexShrink: 0,
          }}
        >
          {s.icon}
        </button>
      ))}

      {/* Progress pill */}
      <div
        style={{
          padding: progressPillPadding,
          borderRadius: 16,
          background: "rgba(56,189,248,0.08)",
          border: "1px solid rgba(56,189,248,0.2)",
          display: "flex",
          alignItems: "center",
          gap: 4,
          width: "auto",
        }}
      >
        <div
          style={{
            width: progressBarWidth,
            height: isMobileView ? 3 : 4,
            borderRadius: 99,
            background: "rgba(255,255,255,0.06)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${(seenCount / NAV_SECTIONS.length) * 100}%`,
              background: "#38bdf8",
              borderRadius: 99,
              transition: "width 0.5s ease",
            }}
          />
        </div>
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: isMobileView ? 8 : 7,
            color: "#38bdf8",
            fontWeight: 700,
          }}
        >
          {seenCount}/{NAV_SECTIONS.length}
        </span>
      </div>

      {/* Code button – links to /ll */}
      <button
        onClick={goToCode}
        style={{
          padding: codePadding,
          borderRadius: 16,
          cursor: "pointer",
          background: "rgba(139,92,246,0.12)",
          border: "1px solid rgba(139,92,246,0.35)",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: fontSizeText,
          fontWeight: 700,
          color: "#a78bfa",
          transition: "all 0.2s",
          whiteSpace: "nowrap",
        }}
      >
        💻 {isMobileView ? "Code" : "Code"}
      </button>

      {/* Speed Panel */}
      <div style={{ position: "relative" }}>
        <button
          onClick={() => setSpeedOpen((o) => !o)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 3,
            padding: codePadding,
            borderRadius: 16,
            cursor: "pointer",
            background: speedOpen ? "rgba(56,189,248,0.2)" : "rgba(255,255,255,0.05)",
            border: `1.5px solid ${speedOpen ? "#38bdf8" : "rgba(255,255,255,0.1)"}`,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: fontSizeText,
            fontWeight: 700,
            color: speedOpen ? "#7dd3fc" : "#64748b",
            transition: "all 0.2s",
          }}
        >
          ⚡ {speed}×
        </button>
        {speedOpen && (
          <div
            style={{
              position: "absolute",
              top: 0,
              right: "calc(100% + 8px)",
              background: "rgba(5,8,20,0.97)",
              backdropFilter: "blur(28px)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 12,
              padding: "4px 4px",
              display: "flex",
              flexDirection: "column",
              gap: 2,
              zIndex: 1000,
              minWidth: 80,
              boxShadow: "0 16px 48px rgba(0,0,0,0.8)",
              animation: "panelPop 0.18s cubic-bezier(0.22,1,0.36,1) both",
            }}
          >
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 6,
                color: "#2d3748",
                letterSpacing: "0.1em",
                padding: "1px 5px 3px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              SPEED
            </div>
            {SPEED_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => {
                  currentRate = s;
                  setSpeed(s);
                  setSpeedOpen(false);
                  if (speaking) onRestart();
                }}
                style={{
                  padding: "3px 8px",
                  borderRadius: 5,
                  cursor: "pointer",
                  textAlign: "left",
                  background: speed === s ? "rgba(56,189,248,0.2)" : "transparent",
                  border: `1px solid ${speed === s ? "rgba(56,189,248,0.45)" : "transparent"}`,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 8,
                  fontWeight: 700,
                  color: speed === s ? "#7dd3fc" : "#475569",
                  transition: "all 0.15s",
                }}
              >
                {s === 1.25 ? `${s}× ★` : `${s}×`}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Speaking indicator */}
      {speaking && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 3,
            padding: speakingPadding,
            borderRadius: 12,
            background: "rgba(56,189,248,0.12)",
            border: "1px solid rgba(56,189,248,0.3)",
          }}
        >
          <SpeakingWave color="#38bdf8" size={isMobileView ? 10 : 9} />
        </div>
      )}
    </nav>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION WRAPPER
// ═══════════════════════════════════════════════════════════════════════════════
function Sect({ id, icon, title, color, visual, cards, voice, speaking, onVoice, seen }) {
  const [ref, vis] = useVisible(0.07);
  const isSp = speaking === id;
  return (
    <section id={id} ref={ref} style={{
      padding: "0 0 88px",
      opacity: vis ? 1 : 0, transform: vis ? "none" : "translateY(52px)",
      transition: "opacity 0.78s cubic-bezier(0.22,1,0.36,1),transform 0.78s cubic-bezier(0.22,1,0.36,1)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        <div style={{
          width: 52, height: 52, borderRadius: 18, flexShrink: 0,
          background: `${color}14`, border: `1px solid ${color}38`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24,
          boxShadow: `0 0 32px ${color}18`,
        }}>{icon}</div>
        <h2 style={{ flex: 1, margin: 0, minWidth: 0, fontFamily: "'Clash Display',sans-serif", fontSize: "clamp(19px,3.8vw,30px)", fontWeight: 700, color: "#f8fafc", letterSpacing: "-0.022em", lineHeight: 1.15 }}>{title}</h2>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <CompletedBadge seen={seen} />
          <button onClick={() => onVoice(id, voice)} style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "7px 14px", borderRadius: 28, cursor: "pointer",
            background: isSp ? `${color}20` : "rgba(255,255,255,0.04)",
            border: `1.5px solid ${isSp ? color : "rgba(255,255,255,0.1)"}`,
            fontFamily: "'JetBrains Mono',monospace", fontSize: 9, fontWeight: 700,
            color: isSp ? color : "#475569", transition: "all 0.22s",
          }}>
            {isSp ? <SpeakingWave color={color} size={12} /> : <span style={{ fontSize: 12 }}>🔊</span>}
            {isSp ? "STOP" : "LISTEN"}
          </button>
        </div>
      </div>
      <div className="sg" style={{ display: "grid", gridTemplateColumns: "minmax(0,1.15fr) minmax(0,0.85fr)", gap: 18 }}>
        <div style={{
          padding: 22, borderRadius: 24,
          background: "linear-gradient(150deg,rgba(255,255,255,0.028) 0%,rgba(0,0,0,0.22) 100%)",
          border: `1px solid ${color}18`, boxShadow: `0 0 64px ${color}09`, minWidth: 0,
        }}>{visual}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 9, minWidth: 0 }}>
          {cards.map((c, i) => (
            <div key={i} style={{
              padding: "13px 15px", borderRadius: 14,
              background: "rgba(255,255,255,0.022)",
              border: "1px solid rgba(255,255,255,0.052)",
              borderLeft: `3px solid ${color}55`,
              animation: vis ? `sRight 0.5s cubic-bezier(0.22,1,0.36,1) ${0.1 + i * 0.1}s both` : "none",
            }}>
              {c.lbl && <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8.5, fontWeight: 700, color, letterSpacing: "0.12em", marginBottom: 5, opacity: 0.88 }}>{c.lbl}</div>}
              <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#94a3b8", lineHeight: 1.7 }}>{c.body}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// HERO — Animated chain of nodes (mobile-responsive)
// ═══════════════════════════════════════════════════════════════════════════════
const NODE_COLORS = ["#38bdf8", "#a78bfa", "#34d399", "#fb923c", "#f472b6", "#fbbf24"];
const NODE_VALS = [42, 17, 85, 33, 61, 9, 77, 28];

function Hero({ onStart, onVoice }) {
  const [nodes, setNodes] = useState([
    { id: 1, v: 42, c: "#38bdf8" },
    { id: 2, v: 17, c: "#a78bfa" },
    { id: 3, v: 85, c: "#34d399" },
    { id: 4, v: 33, c: "#fb923c" },
  ]);
  const [highlightIdx, setHighlightIdx] = useState(null);
  const [opLabel, setOpLabel] = useState(null);
  const [paused, setPaused] = useState(false);
  const counter = useRef(5);
  const vIdx = useRef(4);
  const pauseRef = useRef(false);
  const nodesRef = useRef(nodes);
  const isMobile = useMediaQuery('(max-width: 600px)');

  useEffect(() => { nodesRef.current = nodes; }, [nodes]);
  useEffect(() => { pauseRef.current = paused; }, [paused]);

  useEffect(() => {
    const tick = () => {
      if (pauseRef.current) return;
      const cur = nodesRef.current;
      const rand = Math.random();

      if (cur.length >= 5 || (rand < 0.35 && cur.length > 2)) {
        // Highlight traversal
        let i = 0;
        const walk = () => {
          if (i < cur.length) {
            setHighlightIdx(i);
            i++;
            setTimeout(walk, 350);
          } else {
            setHighlightIdx(null);
            setOpLabel(null);
          }
        };
        setOpLabel({ text: "TRAVERSAL →", col: "#38bdf8" });
        walk();
      } else {
        // Push new node
        const v = NODE_VALS[vIdx.current % NODE_VALS.length];
        vIdx.current++;
        const item = { id: counter.current++, v, c: NODE_COLORS[counter.current % NODE_COLORS.length] };
        setNodes(n => [...n.slice(-4), item]);
        setOpLabel({ text: `INSERT ${v}`, col: "#34d399" });
        setTimeout(() => setOpLabel(null), 800);
      }
    };
    const id = setInterval(tick, 2200);
    return () => clearInterval(id);
  }, []);

  // Responsive sizes
  const nodeDataWidth = isMobile ? 42 : 54;
  const nodePtrWidth = isMobile ? 28 : 38;
  const nodeHeight = isMobile ? 42 : 54;
  const arrowWidth = isMobile ? 12 : 18;
  const headOffset = isMobile ? 4 : 6;

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "80px 24px 48px", textAlign: "center", position: "relative", overflow: "hidden",
    }}>
      {/* BG (unchanged) */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: "radial-gradient(circle,rgba(56,189,248,0.04) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
      <div style={{ position: "absolute", top: "8%", left: "5%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,rgba(56,189,248,0.11) 0%,transparent 70%)", filter: "blur(90px)", pointerEvents: "none", animation: "orb1 26s ease-in-out infinite" }} />
      <div style={{ position: "absolute", bottom: "10%", right: "4%", width: 380, height: 380, borderRadius: "50%", background: "radial-gradient(circle,rgba(167,139,250,0.09) 0%,transparent 70%)", filter: "blur(72px)", pointerEvents: "none", animation: "orb2 32s ease-in-out infinite" }} />
      <div style={{ position: "absolute", top: "40%", right: "10%", width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle,rgba(52,211,153,0.07) 0%,transparent 70%)", filter: "blur(60px)", pointerEvents: "none", animation: "orb3 20s ease-in-out infinite" }} />

      {/* OP Label */}
      <div style={{ height: 32, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
        {opLabel && (
          <span key={opLabel.text} style={{
            padding: "4px 18px", borderRadius: 20,
            background: `${opLabel.col}18`, border: `1px solid ${opLabel.col}50`,
            fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 700,
            color: opLabel.col, animation: "opLabelIn 0.3s cubic-bezier(0.22,1,0.36,1) both",
          }}>{opLabel.text}</span>
        )}
      </div>

      {/* Chain visualization with horizontal scroll on mobile */}
      <div style={{
        marginBottom: 40, position: "relative", width: "100%",
        overflowX: "auto", overflowY: "visible", paddingBottom: 8,
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          minWidth: "max-content", gap: 0, margin: "0 auto",
        }}>
          {/* HEAD label */}
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            marginRight: headOffset,
          }}>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: isMobile ? 8 : 9, color: "#38bdf8", fontWeight: 700, marginBottom: 4, letterSpacing: "0.08em" }}>HEAD</div>
            <div style={{ width: 2, height: isMobile ? 16 : 20, background: "linear-gradient(#38bdf8,transparent)", marginBottom: 2 }} />
            <div style={{ fontSize: isMobile ? 12 : 14, color: "#38bdf8" }}>↓</div>
          </div>

          {nodes.map((node, i) => (
            <div key={node.id} style={{ display: "flex", alignItems: "center" }}>
              {/* Node box */}
              <div style={{
                display: "flex", borderRadius: isMobile ? 10 : 14, overflow: "hidden",
                border: `1.5px solid ${highlightIdx === i ? node.c : `${node.c}50`}`,
                boxShadow: highlightIdx === i ? `0 0 28px ${node.c}60, 0 0 0 3px ${node.c}20` : `0 4px 16px rgba(0,0,0,0.4)`,
                transition: "all 0.35s cubic-bezier(0.34,1.56,0.64,1)",
                animation: i === nodes.length - 1 ? "nodeIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both" : "none",
                transform: highlightIdx === i ? "scale(1.08)" : "scale(1)",
              }}>
                {/* Data section */}
                <div style={{
                  width: nodeDataWidth, height: nodeHeight, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  background: highlightIdx === i ? `${node.c}25` : `${node.c}12`,
                  transition: "background 0.3s", gap: 2,
                }}>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: isMobile ? 12 : 15, fontWeight: 700, color: node.c }}>{node.v}</span>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: isMobile ? 6 : 7, color: `${node.c}70`, letterSpacing: "0.06em" }}>DATA</span>
                </div>
                {/* Pointer section */}
                <div style={{
                  width: nodePtrWidth, height: nodeHeight, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  background: "rgba(255,255,255,0.025)", borderLeft: `1px solid ${node.c}30`, gap: 2,
                }}>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: isMobile ? 11 : 13, color: i < nodes.length - 1 ? "#60a5fa" : "#ef4444" }}>
                    {i < nodes.length - 1 ? "→" : "∅"}
                  </span>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: isMobile ? 6 : 7, color: "rgba(255,255,255,0.2)", letterSpacing: "0.06em" }}>NEXT</span>
                </div>
              </div>

              {/* Arrow between nodes */}
              {i < nodes.length - 1 && (
                <div style={{ display: "flex", alignItems: "center", margin: "0 2px" }}>
                  <div style={{ width: arrowWidth, height: 2, background: `linear-gradient(90deg,${node.c}80,${nodes[i + 1].c}80)` }} />
                  <div style={{ fontSize: isMobile ? 10 : 12, color: nodes[i + 1].c, marginLeft: -2 }}>›</div>
                </div>
              )}
            </div>
          ))}

          {/* NULL terminator */}
          <div style={{ display: "flex", alignItems: "center", marginLeft: 6 }}>
            <div style={{ width: 14, height: 2, background: "rgba(239,68,68,0.4)" }} />
            <div style={{ padding: isMobile ? "4px 8px" : "6px 12px", borderRadius: 10, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", fontFamily: "'JetBrains Mono',monospace", fontSize: isMobile ? 8 : 10, fontWeight: 700, color: "#ef4444" }}>NULL</div>
          </div>
        </div>
      </div>

      {/* Pause button (position adjusted for mobile) */}
      <button onClick={() => setPaused(p => !p)} style={{
        position: "absolute", bottom: isMobile ? -20 : -36, right: 0,
        padding: "3px 10px", borderRadius: 20, cursor: "pointer",
        background: paused ? "rgba(251,191,36,0.15)" : "rgba(255,255,255,0.04)",
        border: `1px solid ${paused ? "rgba(251,191,36,0.4)" : "rgba(255,255,255,0.1)"}`,
        fontFamily: "'JetBrains Mono',monospace", fontSize: 8, fontWeight: 700,
        color: paused ? "#fbbf24" : "#334155", transition: "all 0.2s",
      }}>{paused ? "▶ RESUME" : "⏸ PAUSE"}</button>

      {/* Text (unchanged) */}
      <div style={{ maxWidth: 640, position: "relative" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 20,
          padding: "5px 18px", borderRadius: 40,
          background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.2)",
          fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "#38bdf8", letterSpacing: "0.1em",
        }}>🔗 INTERACTIVE VISUAL GUIDE · LINKED LISTS FROM ZERO</div>

        <h1 style={{
          margin: "0 0 16px", fontFamily: "'Clash Display',sans-serif",
          fontSize: "clamp(38px,7.5vw,80px)", fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1.0,
          background: "linear-gradient(145deg,#f8fafc 0%,#7dd3fc 28%,#c4b5fd 58%,#6ee7b7 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
        }}>Linked List<br />Data Structures</h1>

        <p style={{ margin: "0 auto 32px", fontFamily: "'DM Sans',sans-serif", fontSize: "clamp(14px,2.2vw,17px)", color: "#64748b", lineHeight: 1.72, maxWidth: 520 }}>
          Nodes. Pointers. Chains. Every concept animated, explained, and narrated at your chosen speed with a <strong style={{ color: "#7dd3fc" }}>premium male voice</strong>. From null to advanced two-pointer technique.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={onStart} style={{
            padding: "15px 36px", borderRadius: 16, cursor: "pointer",
            background: "linear-gradient(135deg,#0ea5e9 0%,#8b5cf6 100%)",
            border: "none", fontFamily: "'Clash Display',sans-serif", fontSize: 16, fontWeight: 700,
            color: "#fff", boxShadow: "0 8px 36px rgba(14,165,233,0.45)", transition: "all 0.25s",
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px) scale(1.02)"; e.currentTarget.style.boxShadow = "0 14px 48px rgba(14,165,233,0.6)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 8px 36px rgba(14,165,233,0.45)"; }}>
            Begin Learning ↓
          </button>
          <button onClick={onVoice} style={{
            padding: "15px 26px", borderRadius: 16, cursor: "pointer",
            background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(255,255,255,0.15)",
            fontFamily: "'Clash Display',sans-serif", fontSize: 16, fontWeight: 600,
            color: "#94a3b8", transition: "all 0.25s", display: "flex", alignItems: "center", gap: 9,
          }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#f8fafc"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#94a3b8"; }}>
            <span style={{ fontSize: 18 }}>🔊</span> Hear Intro
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 28, justifyContent: "center", marginTop: 44, flexWrap: "wrap" }}>
          {[["8", "Sections"], ["7+", "Animations"], ["6", "Quiz Qs"], ["O(1)", "Insert/Delete"]].map(([n, l]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Clash Display',sans-serif", fontSize: 28, fontWeight: 700, background: "linear-gradient(135deg,#7dd3fc,#c4b5fd)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{n}</div>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "#2d3748", letterSpacing: "0.1em", marginTop: 3 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VISUAL: Intro — Interactive LL builder (unchanged)
// ═══════════════════════════════════════════════════════════════════════════════
function VisIntro() {
  const [nodes, setNodes] = useState([
    { id: 1, v: 10, c: "#38bdf8" },
    { id: 2, v: 20, c: "#a78bfa" },
    { id: 3, v: 30, c: "#34d399" },
  ]);
  const [log, setLog] = useState([]);
  const [pushVal, setPushVal] = useState("");
  const [highlight, setHighlight] = useState(null);
  const counter = useRef(4);

  const flash = (id) => { setHighlight(id); setTimeout(() => setHighlight(null), 700); };

  const addLog = (msg) => setLog(l => [{ msg, ts: Date.now() }, ...l].slice(0, 4));

  const insertHead = () => {
    const v = parseInt(pushVal) || Math.floor(Math.random() * 90 + 10);
    const c = NODE_COLORS[counter.current % NODE_COLORS.length];
    const item = { id: counter.current++, v, c };
    setNodes(n => [item, ...n]);
    addLog(`INSERT HEAD(${v}) — new head, O(1)`);
    flash(item.id); setPushVal("");
  };

  const insertTail = () => {
    const v = parseInt(pushVal) || Math.floor(Math.random() * 90 + 10);
    const c = NODE_COLORS[counter.current % NODE_COLORS.length];
    const item = { id: counter.current++, v, c };
    setNodes(n => [...n, item]);
    addLog(`INSERT TAIL(${v}) — walk to end, O(n)`);
    flash(item.id); setPushVal("");
  };

  const deleteHead = () => {
    if (nodes.length === 0) return;
    const head = nodes[0];
    addLog(`DELETE HEAD(${head.v}) — update head pointer, O(1)`);
    setNodes(n => n.slice(1));
  };

  const deleteTail = () => {
    if (nodes.length === 0) return;
    const tail = nodes[nodes.length - 1];
    addLog(`DELETE TAIL(${tail.v}) — walk to end, O(n)`);
    setNodes(n => n.slice(0, -1));
  };

  return (
    <div>
      <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8.5, color: "#2d3748", letterSpacing: "0.08em", marginBottom: 10 }}>LIVE LINKED LIST — build it yourself</div>

      {/* Chain display with horizontal scroll */}
      <div style={{ minHeight: 80, marginBottom: 14, overflowX: "auto", paddingBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 0, minWidth: "max-content", padding: "4px 0" }}>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "#38bdf8", fontWeight: 700, marginRight: 8, whiteSpace: "nowrap" }}>HEAD →</div>
          {nodes.length === 0 && <div style={{ padding: "10px 16px", borderRadius: 10, border: "1px dashed rgba(255,255,255,0.1)", fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "#1a2030" }}>empty list</div>}
          {nodes.map((node, i) => (
            <div key={node.id} style={{ display: "flex", alignItems: "center" }}>
              <div style={{
                display: "flex", borderRadius: 11, overflow: "hidden",
                border: `1.5px solid ${highlight === node.id ? node.c : `${node.c}45`}`,
                boxShadow: highlight === node.id ? `0 0 22px ${node.c}50` : "none",
                transition: "all 0.35s cubic-bezier(0.34,1.56,0.64,1)",
                animation: i === 0 || i === nodes.length - 1 ? "nodeIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both" : "none",
                transform: highlight === node.id ? "scale(1.1)" : "scale(1)",
              }}>
                <div style={{ width: 46, height: 44, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: `${node.c}14`, gap: 1 }}>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13, fontWeight: 700, color: node.c }}>{node.v}</span>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 7, color: `${node.c}60` }}>[{i}]</span>
                </div>
                <div style={{ width: 30, height: 44, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.02)", borderLeft: `1px solid ${node.c}25`, fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: i < nodes.length - 1 ? "#60a5fa" : "#ef4444" }}>
                  {i < nodes.length - 1 ? "→" : "∅"}
                </div>
              </div>
              {i < nodes.length - 1 && <div style={{ width: 10, height: 2, background: `rgba(255,255,255,0.1)` }} />}
            </div>
          ))}
          {nodes.length > 0 && <div style={{ marginLeft: 8, padding: "6px 10px", borderRadius: 8, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "#ef4444" }}>NULL</div>}
        </div>
      </div>

      {/* Controls (unchanged) */}
      <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
        <div style={{ display: "flex", borderRadius: 9, overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)" }}>
          <input value={pushVal} onChange={e => setPushVal(e.target.value)} onKeyDown={e => e.key === "Enter" && insertHead()} placeholder="val" type="number"
            style={{ width: 52, padding: "6px 9px", background: "rgba(255,255,255,0.04)", border: "none", outline: "none", fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: "#f8fafc" }} />
          <button onClick={insertHead} style={{ padding: "6px 10px", background: "rgba(56,189,248,0.18)", border: "none", borderLeft: "1px solid rgba(255,255,255,0.08)", cursor: "pointer", fontFamily: "'JetBrains Mono',monospace", fontSize: 8, fontWeight: 700, color: "#38bdf8", whiteSpace: "nowrap" }}>+ HEAD</button>
          <button onClick={insertTail} style={{ padding: "6px 10px", background: "rgba(52,211,153,0.15)", border: "none", borderLeft: "1px solid rgba(255,255,255,0.08)", cursor: "pointer", fontFamily: "'JetBrains Mono',monospace", fontSize: 8, fontWeight: 700, color: "#34d399", whiteSpace: "nowrap" }}>+ TAIL</button>
        </div>
        <button onClick={deleteHead} disabled={nodes.length === 0} style={{ padding: "6px 12px", borderRadius: 9, cursor: nodes.length ? "pointer" : "not-allowed", background: "rgba(251,113,133,0.12)", border: "1px solid rgba(251,113,133,0.3)", fontFamily: "'JetBrains Mono',monospace", fontSize: 9, fontWeight: 700, color: nodes.length ? "#fb7185" : "#2d3748", opacity: nodes.length ? 1 : 0.4 }}>DEL HEAD</button>
        <button onClick={deleteTail} disabled={nodes.length === 0} style={{ padding: "6px 12px", borderRadius: 9, cursor: nodes.length ? "pointer" : "not-allowed", background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.25)", fontFamily: "'JetBrains Mono',monospace", fontSize: 9, fontWeight: 700, color: nodes.length ? "#fbbf24" : "#2d3748", opacity: nodes.length ? 1 : 0.4 }}>DEL TAIL</button>
      </div>

      {/* Log */}
      {log.map((l, i) => (
        <div key={l.ts} style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: i === 0 ? "#38bdf8" : "#2d3748", padding: "2px 0", animation: i === 0 ? "fadeIn 0.25s ease" : "none" }}>
          {i === 0 ? "▶ " : "  "}{l.msg}
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VISUAL: Nodes anatomy (unchanged)
// ═══════════════════════════════════════════════════════════════════════════════
function VisNodes() {
  const [mode, setMode] = useState("singly");
  const [hovered, setHovered] = useState(null);

  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {[["singly", "Singly"], ["doubly", "Doubly"]].map(([m, lbl]) => (
          <button key={m} onClick={() => setMode(m)} style={{
            padding: "5px 14px", borderRadius: 20, cursor: "pointer",
            background: mode === m ? "rgba(167,139,250,0.2)" : "rgba(255,255,255,0.04)",
            border: `1px solid ${mode === m ? "#a78bfa" : "rgba(255,255,255,0.1)"}`,
            fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 700,
            color: mode === m ? "#a78bfa" : "#475569", transition: "all 0.22s",
          }}>{lbl}</button>
        ))}
      </div>

      {mode === "singly" ? (
        <div>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
            <div style={{ position: "relative" }}>
              <div style={{ display: "flex", borderRadius: 16, overflow: "hidden", border: "2px solid #a78bfa", boxShadow: "0 0 40px rgba(167,139,250,0.3)", width: 220 }}>
                <div
                  onMouseEnter={() => setHovered("data")}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    flex: 1, padding: "20px 14px", background: hovered === "data" ? "rgba(167,139,250,0.22)" : "rgba(167,139,250,0.12)", cursor: "pointer", transition: "background 0.2s",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                  }}>
                  <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 22, fontWeight: 700, color: "#a78bfa" }}>42</div>
                  <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: "#a78bfa90", letterSpacing: "0.1em" }}>DATA</div>
                </div>
                <div style={{ width: 1, background: "rgba(167,139,250,0.3)" }} />
                <div
                  onMouseEnter={() => setHovered("next")}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    width: 80, padding: "20px 12px", background: hovered === "next" ? "rgba(56,189,248,0.2)" : "rgba(56,189,248,0.08)", cursor: "pointer", transition: "background 0.2s",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                  }}>
                  <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 18, color: "#38bdf8" }}>→</div>
                  <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: "#38bdf890", letterSpacing: "0.1em" }}>NEXT</div>
                </div>
              </div>

              {hovered === "data" && (
                <div style={{ position: "absolute", top: "105%", left: 0, marginTop: 6, padding: "8px 12px", borderRadius: 10, background: "rgba(5,8,20,0.96)", border: "1px solid rgba(167,139,250,0.4)", fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#c4b5fd", whiteSpace: "nowrap", zIndex: 10, animation: "fUp 0.2s ease" }}>
                  Stores any value: int, string, object…
                </div>
              )}
              {hovered === "next" && (
                <div style={{ position: "absolute", top: "105%", right: 0, marginTop: 6, padding: "8px 12px", borderRadius: 10, background: "rgba(5,8,20,0.96)", border: "1px solid rgba(56,189,248,0.4)", fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#7dd3fc", whiteSpace: "nowrap", zIndex: 10, animation: "fUp 0.2s ease" }}>
                  Pointer to the next node (or null)
                </div>
              )}
            </div>
          </div>

          <div style={{ padding: "10px 14px", borderRadius: 12, background: "rgba(0,0,0,0.45)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: "#2d3748", marginBottom: 5 }}>PYTHON</div>
            <pre style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: "#94a3b8", margin: 0, lineHeight: 1.75 }}>{`class Node:
    def __init__(self, data):
        self.data = data   # the value
        self.next = None   # pointer to next`}</pre>
          </div>
        </div>
      ) : (
        <div>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
            <div style={{ display: "flex", borderRadius: 16, overflow: "hidden", border: "2px solid #34d399", boxShadow: "0 0 40px rgba(52,211,153,0.25)", width: 260 }}>
              <div onMouseEnter={() => setHovered("prev")} onMouseLeave={() => setHovered(null)} style={{ width: 60, padding: "18px 10px", background: hovered === "prev" ? "rgba(251,191,36,0.2)" : "rgba(251,191,36,0.08)", cursor: "pointer", transition: "background 0.2s", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 16, color: "#fbbf24" }}>←</div>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 7, color: "#fbbf2490" }}>PREV</div>
              </div>
              <div style={{ width: 1, background: "rgba(52,211,153,0.2)" }} />
              <div style={{ flex: 1, padding: "18px 10px", background: "rgba(52,211,153,0.1)", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 20, fontWeight: 700, color: "#34d399" }}>42</div>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 7, color: "#34d39990" }}>DATA</div>
              </div>
              <div style={{ width: 1, background: "rgba(52,211,153,0.2)" }} />
              <div onMouseEnter={() => setHovered("nx")} onMouseLeave={() => setHovered(null)} style={{ width: 60, padding: "18px 10px", background: hovered === "nx" ? "rgba(56,189,248,0.2)" : "rgba(56,189,248,0.08)", cursor: "pointer", transition: "background 0.2s", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 16, color: "#38bdf8" }}>→</div>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 7, color: "#38bdf890" }}>NEXT</div>
              </div>
            </div>
          </div>
          <div style={{ padding: "10px 14px", borderRadius: 12, background: "rgba(0,0,0,0.45)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: "#2d3748", marginBottom: 5 }}>PYTHON</div>
            <pre style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: "#94a3b8", margin: 0, lineHeight: 1.75 }}>{`class Node:
    def __init__(self, data):
        self.data = data
        self.next = None  # forward
        self.prev = None  # backward`}</pre>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VISUAL: Types (unchanged)
// ═══════════════════════════════════════════════════════════════════════════════
function VisTypes() {
  const [sel, setSel] = useState("singly");
  const TYPES = {
    singly: {
      col: "#38bdf8",
      label: "Singly Linked List",
      desc: "Each node has one pointer: next. Traversal is forward-only. The simplest form.",
      nodes: [10, 20, 30, 40],
      pros: ["Minimal memory (1 pointer per node)", "Simple to implement", "Fast insert/delete at head O(1)"],
      cons: ["No backward traversal", "Delete requires predecessor access", "Tail insert is O(n) without tail pointer"],
    },
    doubly: {
      col: "#34d399",
      label: "Doubly Linked List",
      desc: "Each node has two pointers: next and prev. You can traverse both ways.",
      nodes: [10, 20, 30, 40],
      pros: ["Bidirectional traversal", "Delete in O(1) with pointer to node", "Efficient tail operations with tail pointer"],
      cons: ["2× pointer memory overhead", "More complex to implement", "More pointer updates per operation"],
    },
    circular: {
      col: "#fb923c",
      label: "Circular Linked List",
      desc: "The tail's next pointer points back to head. No null terminator — loops forever.",
      nodes: [10, 20, 30, 40],
      pros: ["Infinite traversal (round-robin, playlists)", "Efficient for cyclic algorithms", "Head accessible from any node"],
      cons: ["Easy to create infinite loops if not careful", "Need explicit stop condition on traversal", "More complex cycle logic"],
    },
  };
  const t = TYPES[sel];
  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {Object.entries(TYPES).map(([k, v]) => (
          <button key={k} onClick={() => setSel(k)} style={{
            padding: "5px 14px", borderRadius: 20, cursor: "pointer",
            background: sel === k ? `${v.col}20` : "rgba(255,255,255,0.04)",
            border: `1px solid ${sel === k ? v.col : "rgba(255,255,255,0.1)"}`,
            fontFamily: "'JetBrains Mono',monospace", fontSize: 9, fontWeight: 700,
            color: sel === k ? v.col : "#475569", transition: "all 0.22s",
          }}>{k}</button>
        ))}
      </div>

      {/* Chain visualization */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, marginBottom: 14, flexWrap: "wrap" }}>
        {t.nodes.map((v, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", borderRadius: 10, overflow: "hidden", border: `1.5px solid ${t.col}60` }}>
              <div style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", background: `${t.col}14`, fontFamily: "'JetBrains Mono',monospace", fontSize: 12, fontWeight: 700, color: t.col }}>{v}</div>
              {sel === "doubly" && <div style={{ width: 22, height: 40, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(251,191,36,0.08)", borderLeft: `1px solid ${t.col}25`, fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "#fbbf24" }}>←</div>}
              <div style={{ width: 26, height: 40, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.02)", borderLeft: `1px solid ${t.col}25`, fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: t.col }}>
                {sel === "circular" && i === t.nodes.length - 1 ? "↩" : "→"}
              </div>
            </div>
            {i < t.nodes.length - 1 && <div style={{ width: 8, height: 2, background: `${t.col}40` }} />}
          </div>
        ))}
        {sel === "circular" ? (
          <div style={{ marginLeft: 8, fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: t.col, padding: "4px 10px", borderRadius: 10, background: `${t.col}10`, border: `1px solid ${t.col}30` }}>→ HEAD</div>
        ) : (
          <div style={{ marginLeft: 8, fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "#ef4444", padding: "4px 10px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)" }}>NULL</div>
        )}
      </div>

      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#94a3b8", marginBottom: 12, lineHeight: 1.65 }}>{t.desc}</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div style={{ padding: "10px 12px", borderRadius: 10, background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.15)" }}>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: "#34d399", marginBottom: 6, letterSpacing: "0.08em" }}>PROS</div>
          {t.pros.map((p, i) => <div key={i} style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#4ade80", marginBottom: 3 }}>✓ {p}</div>)}
        </div>
        <div style={{ padding: "10px 12px", borderRadius: 10, background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: "#f87171", marginBottom: 6, letterSpacing: "0.08em" }}>CONS</div>
          {t.cons.map((c, i) => <div key={i} style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#f87171", marginBottom: 3 }}>✗ {c}</div>)}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VISUAL: Operations — step-by-step animated (unchanged)
// ═══════════════════════════════════════════════════════════════════════════════
function VisOps() {
  const [op, setOp] = useState(null);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const OPS = {
    insertHead: {
      col: "#38bdf8", label: "Insert at Head",
      nodes: [
        { v: 10, c: "#38bdf8", isNew: false },
        { v: 20, c: "#a78bfa", isNew: false },
        { v: 30, c: "#34d399", isNew: false },
      ],
      steps: [
        { desc: "Start: list is [10 → 20 → 30]", code: "# Current: head → 10 → 20 → 30 → null", highlight: [] },
        { desc: "Create new node with value 5", code: "new_node = Node(5)", highlight: ["new"] },
        { desc: "new_node.next = head (point to old head)", code: "new_node.next = head  # O(1)", highlight: ["new", 0] },
        { desc: "head = new_node (update head pointer)", code: "head = new_node       # O(1) done!", highlight: ["new"] },
      ],
    },
    deleteMiddle: {
      col: "#f472b6", label: "Delete Middle Node",
      nodes: [
        { v: 10, c: "#38bdf8" },
        { v: 20, c: "#f472b6" },
        { v: 30, c: "#34d399" },
        { v: 40, c: "#fb923c" },
      ],
      steps: [
        { desc: "Delete node with value 20", code: "# Want to delete: 20", highlight: [] },
        { desc: "Walk to predecessor (node before 20)", code: "curr = head\nwhile curr.next.data != 20:\n    curr = curr.next", highlight: [0] },
        { desc: "curr is at 10 (predecessor of 20)", code: "# curr = node(10)", highlight: [0] },
        { desc: "curr.next = curr.next.next — skip over 20", code: "curr.next = curr.next.next  # O(1)!", highlight: [0, 2, 3], deleted: [1] },
      ],
    },
  };

  const handleOp = (k) => {
    setOp(k); setStep(0); setPlaying(false);
  };

  useEffect(() => {
    if (!playing || !op) return;
    const steps = OPS[op].steps;
    if (step >= steps.length - 1) { setPlaying(false); return; }
    const t = setTimeout(() => setStep(s => s + 1), 900);
    return () => clearTimeout(t);
  }, [playing, step, op]);

  const current = op ? OPS[op] : null;
  const currentStep = current ? current.steps[step] : null;

  return (
    <div>
      <div style={{ display: "flex", gap: 7, marginBottom: 14, flexWrap: "wrap" }}>
        {Object.entries(OPS).map(([k, v]) => (
          <button key={k} onClick={() => handleOp(k)} style={{
            padding: "7px 14px", borderRadius: 20, cursor: "pointer",
            background: op === k ? `${v.col}20` : "rgba(255,255,255,0.04)",
            border: `1px solid ${op === k ? v.col : "rgba(255,255,255,0.1)"}`,
            fontFamily: "'JetBrains Mono',monospace", fontSize: 9, fontWeight: 700,
            color: op === k ? v.col : "#475569", transition: "all 0.22s",
          }}>{v.label}</button>
        ))}
      </div>

      {current && currentStep ? (
        <div>
          {/* Step counter */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ display: "flex", gap: 5 }}>
              {current.steps.map((_, i) => (
                <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: i <= step ? current.col : "rgba(255,255,255,0.1)", transition: "background 0.3s" }} />
              ))}
            </div>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: "#2d3748" }}>step {step + 1}/{current.steps.length}</span>
          </div>

          {/* Nodes */}
          <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 14, flexWrap: "wrap" }}>
            {op === "insertHead" && step >= 1 && (
              <div style={{ display: "flex", alignItems: "center" }}>
                <div style={{
                  display: "flex", borderRadius: 10, overflow: "hidden",
                  border: `2px solid ${current.col}`,
                  boxShadow: `0 0 24px ${current.col}60`,
                  animation: "nodeIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both",
                }}>
                  <div style={{ width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center", background: `${current.col}25`, fontFamily: "'JetBrains Mono',monospace", fontSize: 13, fontWeight: 700, color: current.col }}>5</div>
                  <div style={{ width: 28, height: 42, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.03)", borderLeft: `1px solid ${current.col}30`, fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: step >= 2 ? "#38bdf8" : "#334155" }}>
                    {step >= 2 ? "→" : "∅"}
                  </div>
                </div>
                {step >= 2 && <div style={{ width: 12, height: 2, background: `${current.col}40` }} />}
              </div>
            )}
            {current.nodes.map((node, i) => {
              const isHighlighted = currentStep.highlight?.includes(i);
              const isDeleted = currentStep.deleted?.includes(i);
              return (
                <div key={i} style={{ display: "flex", alignItems: "center" }}>
                  <div style={{
                    display: "flex", borderRadius: 10, overflow: "hidden",
                    border: `1.5px solid ${isHighlighted ? node.c : isDeleted ? "#ef4444" : `${node.c}40`}`,
                    boxShadow: isHighlighted ? `0 0 20px ${node.c}50` : "none",
                    opacity: isDeleted ? 0.25 : 1,
                    transition: "all 0.4s",
                    transform: isHighlighted ? "scale(1.06)" : "scale(1)",
                  }}>
                    <div style={{ width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center", background: isDeleted ? "rgba(239,68,68,0.1)" : `${node.c}14`, fontFamily: "'JetBrains Mono',monospace", fontSize: 13, fontWeight: 700, color: isDeleted ? "#ef4444" : node.c }}>
                      {isDeleted ? "✕" : node.v}
                    </div>
                    <div style={{ width: 28, height: 42, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.02)", borderLeft: `1px solid ${node.c}25`, fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: op === "deleteMiddle" && i === 0 && step >= 3 ? "#34d399" : (i < current.nodes.length - 1 ? "#60a5fa" : "#ef4444") }}>
                      {op === "deleteMiddle" && i === 0 && step >= 3 ? "→→" : (i < current.nodes.length - 1 ? "→" : "∅")}
                    </div>
                  </div>
                  {i < current.nodes.length - 1 && !isDeleted && <div style={{ width: 8, height: 2, background: "rgba(255,255,255,0.1)" }} />}
                </div>
              );
            })}
          </div>

          <div style={{ padding: "10px 14px", borderRadius: 10, background: `${current.col}0a`, border: `1px solid ${current.col}20`, marginBottom: 10 }}>
            <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#cbd5e1", marginBottom: 8 }}>{currentStep.desc}</div>
            <pre style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: current.col, margin: 0, lineHeight: 1.7 }}>{currentStep.code}</pre>
          </div>

          <div style={{ display: "flex", gap: 7 }}>
            <button onClick={() => { setStep(0); setPlaying(false); }} style={{ padding: "5px 12px", borderRadius: 20, cursor: "pointer", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "#475569" }}>↺ RESET</button>
            <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0} style={{ padding: "5px 12px", borderRadius: 20, cursor: step ? "pointer" : "not-allowed", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: step ? "#94a3b8" : "#2d3748", opacity: step ? 1 : 0.4 }}>← BACK</button>
            <button onClick={() => setStep(s => Math.min(current.steps.length - 1, s + 1))} disabled={step === current.steps.length - 1} style={{ padding: "5px 16px", borderRadius: 20, cursor: step < current.steps.length - 1 ? "pointer" : "not-allowed", background: `${current.col}15`, border: `1px solid ${current.col}35`, fontFamily: "'JetBrains Mono',monospace", fontSize: 9, fontWeight: 700, color: step < current.steps.length - 1 ? current.col : "#2d3748", opacity: step < current.steps.length - 1 ? 1 : 0.4 }}>NEXT →</button>
            <button onClick={() => { setStep(0); setPlaying(true); }} style={{ padding: "5px 14px", borderRadius: 20, cursor: "pointer", background: `${current.col}15`, border: `1px solid ${current.col}35`, fontFamily: "'JetBrains Mono',monospace", fontSize: 9, fontWeight: 700, color: current.col }}>▶ AUTO</button>
          </div>
        </div>
      ) : (
        <div style={{ padding: 16, borderRadius: 14, background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.06)", textAlign: "center" }}>
          <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "#1e2a38" }}>SELECT AN OPERATION ABOVE TO SEE IT STEP BY STEP</p>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VISUAL: Traversal — animated pointer walk (unchanged)
// ═══════════════════════════════════════════════════════════════════════════════
function VisTraversal() {
  const NODES = [
    { v: 15, c: "#38bdf8" },
    { v: 42, c: "#a78bfa" },
    { v: 7, c: "#34d399" },
    { v: 99, c: "#fb923c" },
    { v: 23, c: "#f472b6" },
  ];
  const [curr, setCurr] = useState(-1);
  const [target, setTarget] = useState(99);
  const [found, setFound] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [log, setLog] = useState([]);

  const reset = () => { setCurr(-1); setFound(null); setLog([]); setPlaying(false); };

  useEffect(() => {
    if (!playing) return;
    if (curr === -1) {
      setLog(["Starting traversal at head..."]);
      setTimeout(() => setCurr(0), 400);
      return;
    }
    if (curr >= NODES.length) {
      setLog(l => [...l, `Reached null — value ${target} not found.`]);
      setFound(false); setPlaying(false); return;
    }
    const node = NODES[curr];
    const isFound = node.v === target;
    setLog(l => [...l, `Check node[${curr}] = ${node.v} ${isFound ? "→ FOUND! ✓" : "→ not target, advance"}`]);
    if (isFound) { setFound(true); setPlaying(false); return; }
    const t = setTimeout(() => setCurr(c => c + 1), 700);
    return () => clearTimeout(t);
  }, [playing, curr]);

  return (
    <div>
      <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8.5, color: "#2d3748", marginBottom: 10, letterSpacing: "0.08em" }}>LINEAR TRAVERSAL — walking node by node</div>

      {/* Nodes with horizontal scroll */}
      <div style={{ overflowX: "auto", paddingBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 0, marginBottom: 20, minWidth: "max-content", padding: "12px 4px" }}>
          {NODES.map((node, i) => {
            const isCurr = i === curr;
            const isPassed = i < curr;
            const isFound2 = found && i === curr;
            return (
              <div key={i} style={{ display: "flex", alignItems: "flex-start" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  {/* Current pointer label */}
                  <div style={{ height: 18, display: "flex", alignItems: "center" }}>
                    {isCurr && (
                      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: isFound2 ? "#4ade80" : node.c, fontWeight: 700, animation: "fUp 0.2s ease" }}>curr</span>
                    )}
                  </div>
                  {isCurr && <div style={{ width: 2, height: 8, background: isFound2 ? "#4ade80" : node.c }} />}
                  {isCurr && <div style={{ fontSize: 10, color: isFound2 ? "#4ade80" : node.c, marginTop: -4 }}>▼</div>}
                  {!isCurr && <div style={{ height: 22 }} />}

                  <div style={{
                    display: "flex", borderRadius: 10, overflow: "hidden",
                    border: `1.5px solid ${isCurr ? (isFound2 ? "#4ade80" : node.c) : isPassed ? `${node.c}30` : `${node.c}50`}`,
                    boxShadow: isCurr ? `0 0 20px ${isFound2 ? "#4ade80" : node.c}50` : "none",
                    transition: "all 0.3s",
                    transform: isCurr ? "scale(1.1)" : "scale(1)",
                  }}>
                    <div style={{ width: 42, height: 42, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: isCurr ? (isFound2 ? "rgba(74,222,128,0.25)" : `${node.c}25`) : isPassed ? "rgba(255,255,255,0.02)" : `${node.c}10`, transition: "all 0.3s" }}>
                      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13, fontWeight: 700, color: isPassed ? "#2d3748" : isCurr ? (isFound2 ? "#4ade80" : node.c) : node.c }}>{node.v}</span>
                    </div>
                    <div style={{ width: 24, height: 42, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.02)", borderLeft: `1px solid ${node.c}20`, fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: i < NODES.length - 1 ? "#60a5fa" : "#ef4444" }}>
                      {i < NODES.length - 1 ? "→" : "∅"}
                    </div>
                  </div>
                </div>
                {i < NODES.length - 1 && <div style={{ width: 6, height: 2, background: "rgba(255,255,255,0.08)", marginTop: 58 }} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Controls (unchanged) */}
      <div style={{ display: "flex", gap: 7, alignItems: "center", marginBottom: 10, flexWrap: "wrap" }}>
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "#2d3748" }}>SEARCH:</span>
        {NODES.map((n, i) => (
          <button key={i} onClick={() => { setTarget(n.v); reset(); }} style={{
            padding: "3px 10px", borderRadius: 20, cursor: "pointer",
            background: target === n.v ? `${n.c}20` : "rgba(255,255,255,0.04)",
            border: `1px solid ${target === n.v ? n.c : "rgba(255,255,255,0.08)"}`,
            fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 700, color: target === n.v ? n.c : "#475569",
          }}>{n.v}</button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 7, marginBottom: 10 }}>
        <button onClick={reset} style={{ padding: "5px 12px", borderRadius: 20, cursor: "pointer", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "#475569" }}>↺</button>
        <button onClick={() => { if (curr === -1 || found !== null) reset(); setTimeout(() => setPlaying(true), 50); }} style={{ padding: "5px 18px", borderRadius: 20, cursor: "pointer", background: "rgba(244,114,182,0.15)", border: "1px solid rgba(244,114,182,0.35)", fontFamily: "'JetBrains Mono',monospace", fontSize: 9, fontWeight: 700, color: "#f472b6" }}>▶ TRAVERSE</button>
      </div>

      {/* Log */}
      <div style={{ minHeight: 60 }}>
        {log.map((l, i) => (
          <div key={i} style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: i === log.length - 1 ? "#f472b6" : "#2d3748", padding: "2px 0", animation: i === log.length - 1 ? "fadeIn 0.2s ease" : "none" }}>
            {i === log.length - 1 ? "▶ " : "  "}{l}
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VISUAL: Advanced — Two Pointer & Reverse (unchanged)
// ═══════════════════════════════════════════════════════════════════════════════
function VisAdvanced() {
  const [mode, setMode] = useState("twoptr");
  const NODES_VALS = [1, 2, 3, 4, 5, 6];
  const [slow, setSlow] = useState(-1);
  const [fast, setFast] = useState(-1);
  const [done, setDone] = useState(false);
  const [log, setLog] = useState([]);
  const [playing, setPlaying] = useState(false);

  // Reversal state
  const [revNodes, setRevNodes] = useState([1, 2, 3, 4, 5]);
  const [revStep, setRevStep] = useState(0);
  const [revPlaying, setRevPlaying] = useState(false);
  const REV_STEPS = [
    { prev: -1, curr: 0, next: 1, desc: "prev=null, curr=head(1), next=curr.next(2)", arrows: [] },
    { prev: -1, curr: 0, next: 1, desc: "curr.next = prev (flip arrow: 1 → null)", arrows: [{ from: 0, to: -1 }] },
    { prev: 0, curr: 1, next: 2, desc: "Advance: prev=1, curr=2, next=3", arrows: [{ from: 0, to: -1 }] },
    { prev: 0, curr: 1, next: 2, desc: "curr.next = prev (flip: 2 → 1)", arrows: [{ from: 0, to: -1 }, { from: 1, to: 0 }] },
    { prev: 1, curr: 2, next: 3, desc: "Advance: prev=2, curr=3, next=4", arrows: [{ from: 0, to: -1 }, { from: 1, to: 0 }] },
    { prev: 1, curr: 2, next: 3, desc: "curr.next = prev (flip: 3 → 2)", arrows: [{ from: 0, to: -1 }, { from: 1, to: 0 }, { from: 2, to: 1 }] },
    { prev: 2, curr: 3, next: 4, desc: "Advance and flip: 4 → 3", arrows: [{ from: 0, to: -1 }, { from: 1, to: 0 }, { from: 2, to: 1 }, { from: 3, to: 2 }] },
    { prev: 3, curr: 4, next: -1, desc: "Last flip: 5 → 4. curr.next is null → done!", arrows: [{ from: 0, to: -1 }, { from: 1, to: 0 }, { from: 2, to: 1 }, { from: 3, to: 2 }, { from: 4, to: 3 }] },
    { prev: 4, curr: -1, next: -1, desc: "head = prev = 5. List reversed: 5→4→3→2→1→null", arrows: [{ from: 0, to: -1 }, { from: 1, to: 0 }, { from: 2, to: 1 }, { from: 3, to: 2 }, { from: 4, to: 3 }] },
  ];

  const resetTP = () => { setSlow(-1); setFast(-1); setDone(false); setLog([]); setPlaying(false); };

  useEffect(() => {
    if (!playing || mode !== "twoptr") return;
    if (slow === -1) {
      setSlow(0); setFast(0);
      setLog(["slow=0, fast=0 — both start at head"]);
      return;
    }
    const nextFast = fast + 2;
    const nextSlow = slow + 1;
    if (nextFast >= NODES_VALS.length) {
      setDone(true); setPlaying(false);
      setLog(l => [...l, `fast reached end → slow=${slow} is the MIDDLE! Value=${NODES_VALS[slow]}`]);
      return;
    }
    const t = setTimeout(() => {
      setSlow(nextSlow); setFast(nextFast);
      setLog(l => [...l, `slow→${nextSlow}(${NODES_VALS[nextSlow]}), fast→${nextFast}(${NODES_VALS[nextFast]})`]);
    }, 700);
    return () => clearTimeout(t);
  }, [playing, slow, fast, mode]);

  useEffect(() => {
    if (!revPlaying || mode !== "reverse") return;
    if (revStep >= REV_STEPS.length - 1) { setRevPlaying(false); return; }
    const t = setTimeout(() => setRevStep(s => s + 1), 800);
    return () => clearTimeout(t);
  }, [revPlaying, revStep, mode]);

  return (
    <div>
      <div style={{ display: "flex", gap: 7, marginBottom: 14 }}>
        {[["twoptr", "Two-Pointer (Find Middle)"], ["reverse", "Reverse a List"]].map(([m, lbl]) => (
          <button key={m} onClick={() => { setMode(m); resetTP(); setRevStep(0); setRevPlaying(false); }} style={{
            padding: "5px 12px", borderRadius: 20, cursor: "pointer",
            background: mode === m ? "rgba(251,191,36,0.2)" : "rgba(255,255,255,0.04)",
            border: `1px solid ${mode === m ? "#fbbf24" : "rgba(255,255,255,0.1)"}`,
            fontFamily: "'JetBrains Mono',monospace", fontSize: 9, fontWeight: 700,
            color: mode === m ? "#fbbf24" : "#475569", transition: "all 0.22s",
          }}>{lbl}</button>
        ))}
      </div>

      {mode === "twoptr" ? (
        <div>
          <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#94a3b8", marginBottom: 12, lineHeight: 1.6 }}>
            Fast pointer moves <strong style={{ color: "#fbbf24" }}>2 steps</strong>, slow moves <strong style={{ color: "#34d399" }}>1 step</strong>. When fast hits end, slow is at the <strong style={{ color: "#f472b6" }}>middle</strong>.
          </div>
          <div style={{ overflowX: "auto", paddingBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 0, marginBottom: 14, minWidth: "max-content", padding: "28px 4px 4px" }}>
              {NODES_VALS.map((v, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                    {/* Pointer labels */}
                    <div style={{ height: 22, display: "flex", gap: 3, alignItems: "center" }}>
                      {i === slow && slow !== -1 && <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: done ? "#f472b6" : "#34d399", fontWeight: 700, padding: "1px 5px", borderRadius: 4, background: done ? "rgba(244,114,182,0.15)" : "rgba(52,211,153,0.15)" }}>S</span>}
                      {i === fast && fast !== -1 && fast !== slow && <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: "#fbbf24", fontWeight: 700, padding: "1px 5px", borderRadius: 4, background: "rgba(251,191,36,0.15)" }}>F</span>}
                      {i === fast && fast === slow && slow !== -1 && <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: "#a78bfa", fontWeight: 700 }}>S/F</span>}
                    </div>
                    <div style={{ width: 42, height: 42, borderRadius: 10, border: `1.5px solid ${i === slow && done ? "#f472b6" : i === fast && fast !== -1 ? "#fbbf24" : i === slow && slow !== -1 ? "#34d399" : "rgba(255,255,255,0.12)"}`, display: "flex", alignItems: "center", justifyContent: "center", background: i === slow && done ? "rgba(244,114,182,0.2)" : i === fast && fast !== -1 && fast !== slow ? "rgba(251,191,36,0.15)" : i === slow && slow !== -1 ? "rgba(52,211,153,0.15)" : "rgba(255,255,255,0.03)", fontFamily: "'JetBrains Mono',monospace", fontSize: 13, fontWeight: 700, color: i === slow && done ? "#f472b6" : "rgba(255,255,255,0.7)", transition: "all 0.3s", boxShadow: i === slow && done ? "0 0 20px rgba(244,114,182,0.4)" : "none" }}>{v}</div>
                  </div>
                  {i < NODES_VALS.length - 1 && <div style={{ width: 14, height: 2, background: "rgba(255,255,255,0.08)", marginTop: 53 }} />}
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 7, marginBottom: 8 }}>
            <button onClick={resetTP} style={{ padding: "5px 12px", borderRadius: 20, cursor: "pointer", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "#475569" }}>↺</button>
            <button onClick={() => { resetTP(); setTimeout(() => setPlaying(true), 50); }} style={{ padding: "5px 18px", borderRadius: 20, cursor: "pointer", background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.35)", fontFamily: "'JetBrains Mono',monospace", fontSize: 9, fontWeight: 700, color: "#fbbf24" }}>▶ RUN</button>
          </div>
          <div style={{ minHeight: 48 }}>
            {log.map((l, i) => <div key={i} style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: i === log.length - 1 ? "#fbbf24" : "#2d3748", padding: "1px 0" }}>{l}</div>)}
          </div>
        </div>
      ) : (
        <div>
          <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#94a3b8", marginBottom: 10, lineHeight: 1.6 }}>
            Three pointers: <strong style={{ color: "#f87171" }}>prev</strong>, <strong style={{ color: "#fbbf24" }}>curr</strong>, <strong style={{ color: "#34d399" }}>next</strong>. Flip each arrow. O(n) time, O(1) space.
          </div>
          {/* Rev nodes */}
          <div style={{ overflowX: "auto", paddingBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginBottom: 12, minWidth: "max-content" }}>
              {revNodes.map((v, i) => {
                const rs = REV_STEPS[revStep];
                const isFlipped = rs.arrows.some(a => a.from === i);
                const isCurr = i === rs.curr;
                const isPrev = i === rs.prev;
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                      <div style={{ height: 14, display: "flex", gap: 2 }}>
                        {isCurr && <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 7, color: "#fbbf24", fontWeight: 700 }}>curr</span>}
                        {isPrev && <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 7, color: "#f87171", fontWeight: 700 }}>prev</span>}
                      </div>
                      <div style={{ width: 38, height: 38, borderRadius: 9, border: `1.5px solid ${isCurr ? "#fbbf24" : isPrev ? "#f87171" : isFlipped ? "#34d399" : "rgba(255,255,255,0.1)"}`, display: "flex", alignItems: "center", justifyContent: "center", background: isCurr ? "rgba(251,191,36,0.2)" : isPrev ? "rgba(248,113,133,0.15)" : isFlipped ? "rgba(52,211,153,0.1)" : "rgba(255,255,255,0.03)", fontFamily: "'JetBrains Mono',monospace", fontSize: 12, fontWeight: 700, color: isCurr ? "#fbbf24" : isPrev ? "#f87171" : isFlipped ? "#34d399" : "#94a3b8", transition: "all 0.35s" }}>{v}</div>
                    </div>
                    {i < revNodes.length - 1 && (
                      <div style={{ width: 20, height: 2, background: isFlipped ? "rgba(52,211,153,0.4)" : "rgba(255,255,255,0.1)", position: "relative" }}>
                        {isFlipped && <span style={{ position: "absolute", left: -4, top: -7, fontSize: 10, color: "#34d399" }}>←</span>}
                        {!isFlipped && <span style={{ position: "absolute", right: -4, top: -7, fontSize: 10, color: "rgba(255,255,255,0.2)" }}>→</span>}
                      </div>
                    )}
                  </div>
                );
              })}
              <div style={{ marginLeft: 4, fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "#ef4444", padding: "3px 8px", borderRadius: 8, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>NULL</div>
            </div>
          </div>
          <div style={{ padding: "8px 12px", borderRadius: 10, background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)", marginBottom: 10 }}>
            <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#fbbf24", lineHeight: 1.6 }}>{REV_STEPS[revStep].desc}</div>
          </div>
          <div style={{ display: "flex", gap: 7 }}>
            <button onClick={() => { setRevStep(0); setRevPlaying(false); }} style={{ padding: "5px 12px", borderRadius: 20, cursor: "pointer", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "#475569" }}>↺</button>
            <button onClick={() => setRevStep(s => Math.max(0, s - 1))} style={{ padding: "5px 10px", borderRadius: 20, cursor: "pointer", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "#94a3b8" }}>← BACK</button>
            <button onClick={() => setRevStep(s => Math.min(REV_STEPS.length - 1, s + 1))} style={{ padding: "5px 14px", borderRadius: 20, cursor: "pointer", background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.35)", fontFamily: "'JetBrains Mono',monospace", fontSize: 9, fontWeight: 700, color: "#fbbf24" }}>NEXT →</button>
            <button onClick={() => { setRevStep(0); setRevPlaying(true); }} style={{ padding: "5px 14px", borderRadius: 20, cursor: "pointer", background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.35)", fontFamily: "'JetBrains Mono',monospace", fontSize: 9, fontWeight: 700, color: "#fbbf24" }}>▶ AUTO</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VISUAL: Memory model comparison (unchanged)
// ═══════════════════════════════════════════════════════════════════════════════
function VisMemory() {
  const [mode, setMode] = useState("array");
  const ARRAY_ADDRS = [0x1000, 0x1004, 0x1008, 0x100C, 0x1010];
  const LL_ADDRS = [0x1000, 0x2840, 0x1F20, 0x3C00, 0x0A80];
  const VALS = [10, 20, 30, 40, 50];

  return (
    <div>
      <div style={{ display: "flex", gap: 7, marginBottom: 14 }}>
        {[["array", "Array (Contiguous)"], ["linked", "Linked List (Scattered)"]].map(([m, lbl]) => (
          <button key={m} onClick={() => setMode(m)} style={{
            padding: "5px 12px", borderRadius: 20, cursor: "pointer",
            background: mode === m ? "rgba(96,165,250,0.2)" : "rgba(255,255,255,0.04)",
            border: `1px solid ${mode === m ? "#60a5fa" : "rgba(255,255,255,0.1)"}`,
            fontFamily: "'JetBrains Mono',monospace", fontSize: 9, fontWeight: 700,
            color: mode === m ? "#60a5fa" : "#475569", transition: "all 0.22s",
          }}>{lbl}</button>
        ))}
      </div>

      {mode === "array" ? (
        <div>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "#2d3748", marginBottom: 8, letterSpacing: "0.06em" }}>MEMORY — addresses are sequential (+4 bytes each)</div>
          <div style={{ display: "flex", gap: 0, marginBottom: 14 }}>
            {VALS.map((v, i) => (
              <div key={i} style={{
                flex: 1, textAlign: "center",
                borderRadius: i === 0 ? "8px 0 0 8px" : i === VALS.length - 1 ? "0 8px 8px 0" : 0,
                background: "rgba(96,165,250,0.12)", border: "1px solid rgba(96,165,250,0.25)",
                borderLeft: i > 0 ? "none" : undefined, padding: "10px 6px",
              }}>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 700, color: "#60a5fa" }}>{v}</div>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: "#2d3748", marginTop: 4 }}>0x{ARRAY_ADDRS[i].toString(16).toUpperCase()}</div>
              </div>
            ))}
          </div>
          <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(96,165,250,0.07)", border: "1px solid rgba(96,165,250,0.18)", marginBottom: 8 }}>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "#60a5fa", marginBottom: 5 }}>✓ Cache-line friendly</div>
            <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#94a3b8", lineHeight: 1.6 }}>Loading arr[0] pulls arr[0]–arr[15] into L1 cache simultaneously. Next 15 accesses are lightning fast — no memory bus trips.</div>
          </div>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "#34d399" }}>O(1) random access: arr[i] = base_addr + i × size</div>
        </div>
      ) : (
        <div>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "#2d3748", marginBottom: 8, letterSpacing: "0.06em" }}>MEMORY — nodes scattered across heap</div>
          {VALS.map((v, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "#60a5fa", width: 56, flexShrink: 0 }}>0x{LL_ADDRS[i].toString(16).toUpperCase()}</div>
              <div style={{ display: "flex", borderRadius: 8, overflow: "hidden", border: "1px solid rgba(96,165,250,0.3)" }}>
                <div style={{ width: 38, height: 32, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(96,165,250,0.12)", fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 700, color: "#60a5fa" }}>{v}</div>
                <div style={{ width: 80, height: 32, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.02)", borderLeft: "1px solid rgba(96,165,250,0.15)", fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: i < VALS.length - 1 ? "#a78bfa" : "#ef4444" }}>
                  {i < VALS.length - 1 ? `→ 0x${LL_ADDRS[i + 1].toString(16).toUpperCase()}` : "→ NULL"}
                </div>
              </div>
              {i < VALS.length - 1 && (
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: "#f87171" }}>
                  +{Math.abs(LL_ADDRS[i + 1] - LL_ADDRS[i])} bytes jump!
                </div>
              )}
            </div>
          ))}
          <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.18)", marginTop: 8 }}>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "#f87171", marginBottom: 5 }}>✗ Cache miss on every node</div>
            <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#94a3b8", lineHeight: 1.6 }}>Each pointer jump likely leaves the cache line. In practice, linked lists can be 10–100× slower than arrays for sequential reads.</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPLEXITY TABLE (unchanged)
// ═══════════════════════════════════════════════════════════════════════════════
function ComplexityTable() {
  const [hov, setHov] = useState(null);
  const rows = [
    { nm: "Access by index", sl: "O(n)", dl: "O(n)", arr: "O(1)", n: "Must walk from head — no random access." },
    { nm: "Search", sl: "O(n)", dl: "O(n)", arr: "O(n)", n: "Linear scan in all cases." },
    { nm: "Insert at head", sl: "O(1)", dl: "O(1)", arr: "O(n)*", n: "LL excels here — just update head pointer." },
    { nm: "Insert at tail", sl: "O(n)/O(1)†", dl: "O(1)", arr: "O(1)*", n: "O(1) if tail pointer maintained." },
    { nm: "Insert at middle", sl: "O(n)", dl: "O(n)", arr: "O(n)", n: "LL: O(1) once at position. Array: shift elements." },
    { nm: "Delete at head", sl: "O(1)", dl: "O(1)", arr: "O(n)*", n: "LL just advances head pointer." },
    { nm: "Delete at middle", sl: "O(n)", dl: "O(1)‡", arr: "O(n)", n: "DLL: O(1) with node pointer (no predecessor walk)." },
    { nm: "Space overhead", sl: "1 ptr/node", dl: "2 ptrs/node", arr: "None", n: "Each pointer is 8 bytes (64-bit system)." },
  ];
  const getColor = (v) => {
    if (v === "O(1)" || v === "None") return "#4ade80";
    if (v.includes("O(n)")) return "#f87171";
    return "#fbbf24";
  };
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 500 }}>
        <thead>
          <tr>{["Operation", "Singly LL", "Doubly LL", "Array", "Note"].map(h => (
            <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontFamily: "'JetBrains Mono',monospace", fontSize: 8.5, letterSpacing: "0.1em", color: "#2d3748", borderBottom: "1px solid rgba(255,255,255,0.06)", fontWeight: 700, whiteSpace: "nowrap" }}>{h}</th>
          ))}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}
              style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", background: hov === i ? "rgba(255,255,255,0.025)" : "transparent", transition: "background 0.2s" }}>
              <td style={{ padding: "9px 12px", fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 700, color: "#e2e8f0", whiteSpace: "nowrap" }}>{r.nm}</td>
              <td style={{ padding: "9px 12px", fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: getColor(r.sl), whiteSpace: "nowrap" }}>{r.sl}</td>
              <td style={{ padding: "9px 12px", fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: getColor(r.dl), whiteSpace: "nowrap" }}>{r.dl}</td>
              <td style={{ padding: "9px 12px", fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: getColor(r.arr), whiteSpace: "nowrap" }}>{r.arr}</td>
              <td style={{ padding: "9px 12px", fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#475569" }}>{r.n}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: 8, fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "#2d3748", lineHeight: 1.8 }}>
        * Array insert/delete requires shifting all elements after the position.<br />
        † Singly LL tail insert is O(1) only if tail pointer is maintained.<br />
        ‡ DLL delete is O(1) with a direct node reference — no need to find predecessor.
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONFETTI (unchanged)
// ═══════════════════════════════════════════════════════════════════════════════
function Confetti() {
  const pieces = Array.from({ length: 36 }, (_, i) => ({
    id: i, x: Math.random() * 100, delay: Math.random() * 0.8,
    dur: 1.8 + Math.random() * 1.2,
    color: ["#38bdf8", "#a78bfa", "#34d399", "#fbbf24", "#f472b6", "#fb923c"][i % 6],
    size: 6 + Math.random() * 6,
  }));
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 3000, overflow: "hidden" }}>
      {pieces.map(p => (
        <div key={p.id} style={{
          position: "absolute", top: "-10%", left: `${p.x}%`,
          width: p.size, height: p.size, borderRadius: p.id % 3 === 0 ? "50%" : 2,
          background: p.color, animation: `confettiFall ${p.dur}s ease-in ${p.delay}s both`,
        }} />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// QUIZ (unchanged)
// ═══════════════════════════════════════════════════════════════════════════════
function Quiz({ onDone }) {
  const QS = [
    { q: "What does each node in a singly linked list contain?", opts: ["Only the data", "Data + previous pointer", "Data + next pointer", "Data + index"], ans: 2, exp: "A singly linked list node holds its value (data) and one pointer to the next node. That next pointer is null for the last node." },
    { q: "What is the time complexity of inserting at the HEAD of a linked list?", opts: ["O(n)", "O(log n)", "O(1)", "O(n²)"], ans: 2, exp: "O(1). Create new node, set new_node.next = head, update head = new_node. Three operations, no matter the list size." },
    { q: "Which operation is O(n) in a singly linked list WITHOUT a tail pointer?", opts: ["Insert at head", "Delete head", "Insert at tail", "Peek head"], ans: 2, exp: "Insert at tail requires walking the entire list to find the last node. With a tail pointer, it becomes O(1)." },
    { q: "In Floyd's cycle detection, what do slow and fast pointers do?", opts: ["Both move 1 step", "Slow moves 1, fast moves 2", "Slow moves 2, fast moves 1", "Both move 2 steps"], ans: 1, exp: "Slow moves 1 step, fast moves 2. If there's a cycle, fast will eventually lap slow and they'll meet at the same node." },
    { q: "What is the KEY advantage of a doubly linked list over singly?", opts: ["Less memory usage", "Faster search", "O(1) delete with direct node pointer", "Automatic sorting"], ans: 2, exp: "With a doubly linked list, if you have a pointer to a node, you can delete it in O(1) — because you can access its predecessor via prev. Singly requires O(n) to find the predecessor." },
    { q: "Why are linked lists generally SLOWER than arrays in practice despite similar Big-O?", opts: ["More operations per step", "Cache misses — nodes are scattered in memory", "Larger node size", "Pointer arithmetic is slow"], ans: 1, exp: "Cache misses. Arrays are contiguous in memory so loading one element brings neighbors into cache too. Each linked list pointer jump likely causes a cache miss — 100-200 CPU cycles wasted vs ~1 cycle for a cache hit." },
  ];
  const [ans, setAns] = useState({});
  const [rev, setRev] = useState({});
  const score = Object.entries(ans).filter(([qi, ai]) => QS[+qi].ans === +ai).length;
  const answered = Object.keys(rev).length;
  useEffect(() => { if (answered === QS.length) onDone?.(score, QS.length); }, [rev]);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "#2d3748" }}>PROGRESS</span>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "#38bdf8", fontWeight: 700 }}>{answered}/{QS.length}</span>
        </div>
        <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${(answered / QS.length) * 100}%`, background: "linear-gradient(90deg,#0ea5e9,#8b5cf6)", borderRadius: 99, transition: "width 0.5s cubic-bezier(0.22,1,0.36,1)" }} />
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {QS.map((q, qi) => {
          const isR = rev[qi];
          const bc = isR ? (ans[qi] === q.ans ? "rgba(74,222,128,0.35)" : "rgba(239,68,68,0.35)") : "rgba(255,255,255,0.07)";
          return (
            <div key={qi} style={{ padding: "16px 18px", borderRadius: 16, background: "rgba(255,255,255,0.02)", border: `1px solid ${bc}`, transition: "border-color 0.3s" }}>
              <div style={{ display: "flex", gap: 10, marginBottom: 12, alignItems: "flex-start" }}>
                <span style={{ width: 24, height: 24, borderRadius: 8, flexShrink: 0, marginTop: 1, background: isR ? (ans[qi] === q.ans ? "rgba(74,222,128,0.2)" : "rgba(239,68,68,0.2)") : "rgba(56,189,248,0.15)", border: `1px solid ${isR ? (ans[qi] === q.ans ? "rgba(74,222,128,0.42)" : "rgba(239,68,68,0.42)") : "rgba(56,189,248,0.32)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'JetBrains Mono',monospace", fontSize: 9, fontWeight: 700, color: isR ? (ans[qi] === q.ans ? "#4ade80" : "#ef4444") : "#38bdf8" }}>{qi + 1}</span>
                <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 600, color: "#e2e8f0", lineHeight: 1.52 }}>{q.q}</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
                {q.opts.map((opt, oi) => {
                  const isSel = ans[qi] === oi, isCorr = q.ans === oi;
                  let bg = "rgba(255,255,255,0.03)", brd = "rgba(255,255,255,0.07)", col = "#64748b";
                  if (isR) { if (isCorr) { bg = "rgba(74,222,128,0.12)"; brd = "rgba(74,222,128,0.38)"; col = "#4ade80"; } else if (isSel) { bg = "rgba(239,68,68,0.12)"; brd = "rgba(239,68,68,0.38)"; col = "#f87171"; } else col = "#2d3748"; }
                  else if (isSel) { bg = "rgba(56,189,248,0.12)"; brd = "rgba(56,189,248,0.38)"; col = "#7dd3fc"; }
                  return (
                    <button key={oi} onClick={() => !isR && setAns(a => ({ ...a, [qi]: oi }))} style={{ padding: "9px 12px", borderRadius: 10, cursor: isR ? "default" : "pointer", background: bg, border: `1px solid ${brd}`, fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: col, textAlign: "left", transition: "all 0.22s", display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 19, height: 19, borderRadius: "50%", flexShrink: 0, background: `${col}26`, border: `1px solid ${col}50`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'JetBrains Mono',monospace", fontSize: 9, fontWeight: 700, color: col }}>{isR && isCorr ? "✓" : isR && isSel && !isCorr ? "✗" : String.fromCharCode(65 + oi)}</span>
                      {opt}
                    </button>
                  );
                })}
              </div>
              {ans[qi] !== undefined && !isR && (
                <button onClick={() => setRev(r => ({ ...r, [qi]: true }))} style={{ marginTop: 10, padding: "6px 18px", borderRadius: 20, cursor: "pointer", background: "rgba(56,189,248,0.12)", border: "1px solid rgba(56,189,248,0.3)", fontFamily: "'JetBrains Mono',monospace", fontSize: 9, fontWeight: 700, color: "#38bdf8" }}>CHECK →</button>
              )}
              {isR && (
                <div style={{ marginTop: 10, padding: "9px 12px", borderRadius: 10, background: ans[qi] === q.ans ? "rgba(74,222,128,0.07)" : "rgba(239,68,68,0.07)", border: `1px solid ${ans[qi] === q.ans ? "rgba(74,222,128,0.2)" : "rgba(239,68,68,0.2)"}`, fontFamily: "'DM Sans',sans-serif", fontSize: 12.5, color: "#94a3b8", lineHeight: 1.58, animation: "fUp 0.3s ease" }}>
                  <span style={{ fontWeight: 700, color: ans[qi] === q.ans ? "#4ade80" : "#f87171" }}>{ans[qi] === q.ans ? "✓ Correct! " : "✗ Not quite — "}</span>{q.exp}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function LinkedListPage() {
  const [speaking, setSpeaking] = useState(null);
  const [active, setActive] = useState("intro");
  const [qScore, setQScore] = useState(null);
  const [qTotal, setQTotal] = useState(null);
  const [speed, setSpeed] = useState(1.25);
  const [seenSections, setSeenSections] = useState(new Set());
  const [showConfetti, setShowConfetti] = useState(false);
  const [navOpen, setNavOpen] = useState(true);
  const currentNarr = useRef(null);

  useEffect(() => {
    const lk = document.createElement("link");
    lk.rel = "stylesheet";
    lk.href = "https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;700&display=swap";
    document.head.appendChild(lk);

    const lk2 = document.createElement("link");
    lk2.rel = "stylesheet";
    lk2.href = "https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&display=swap";
    document.head.appendChild(lk2);

    const warm = () => { window.speechSynthesis?.getVoices(); window.removeEventListener("click", warm); };
    window.addEventListener("click", warm);
    return () => { try { document.head.removeChild(lk); document.head.removeChild(lk2); } catch { } };
  }, []);

  useEffect(() => {
    const io = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          setActive(e.target.id);
          setSeenSections(s => new Set([...s, e.target.id]));
        }
      }),
      { rootMargin: "-35% 0px -35% 0px" }
    );
    NAV_SECTIONS.forEach(s => { const el = document.getElementById(s.id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.key === "s" || e.key === "S") { voiceStop(); setSpeaking(null); }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const idx = NAV_SECTIONS.findIndex(s => s.id === active);
        const next = NAV_SECTIONS[Math.min(idx + 1, NAV_SECTIONS.length - 1)];
        if (next) document.getElementById(next.id)?.scrollIntoView({ behavior: "smooth" });
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        const idx = NAV_SECTIONS.findIndex(s => s.id === active);
        const prev = NAV_SECTIONS[Math.max(idx - 1, 0)];
        if (prev) document.getElementById(prev.id)?.scrollIntoView({ behavior: "smooth" });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  const handleVoice = useCallback((id, text) => {
    if (speaking === id) { voiceStop(); setSpeaking(null); currentNarr.current = null; }
    else {
      currentNarr.current = { id, text };
      setSpeaking(id);
      voiceSpeak(text, () => { setSpeaking(null); currentNarr.current = null; }, currentRate);
    }
  }, [speaking]);

  const handleRestart = useCallback(() => {
    if (currentNarr.current) {
      const { id, text } = currentNarr.current;
      voiceStop();
      setTimeout(() => voiceSpeak(text, () => { setSpeaking(null); currentNarr.current = null; }, currentRate), 80);
    }
  }, []);

  const handleStop = useCallback(() => { voiceStop(); setSpeaking(null); currentNarr.current = null; }, []);

  const speakingLabel = speaking
    ? (NAV_SECTIONS.find(s => s.id === speaking)?.label ?? "Introduction")
    : null;

  const goIntro = () => document.getElementById("intro")?.scrollIntoView({ behavior: "smooth" });

  const SECTS = [
    {
      id: "intro", icon: "🔗", title: "What is a Linked List?", color: "#38bdf8", voice: NARR.intro,
      visual: <VisIntro />,
      cards: [
        { lbl: "THE CORE IDEA", body: "A linked list is a sequence of nodes. Each node holds a value and a pointer to the next node. The chain of pointers is what connects them — not physical memory proximity." },
        { lbl: "VS ARRAY", body: "An array is a block of memory. A linked list is a chain of scattered nodes. Arrays give O(1) random access. Linked lists give O(1) insert/delete at known positions." },
        { lbl: "THE HEAD POINTER", body: "You only need to store one thing: a pointer to the first node (the head). From the head, you can reach every node by following .next pointers." },
        { lbl: "NULL TERMINATOR", body: "The last node's .next is null. This is how you know you've reached the end. Always check for null before dereferencing a pointer." },
      ],
    },
    {
      id: "nodes", icon: "🧩", title: "Anatomy of a Node", color: "#a78bfa", voice: NARR.nodes,
      visual: <VisNodes />,
      cards: [
        { lbl: "NODE STRUCTURE", body: "Every node is an object with at least two fields: data (the value you care about) and next (a reference to the next node, or null)." },
        { lbl: "DATA FIELD", body: "Can store anything: integers, strings, objects, even other linked lists. The data type is the same for all nodes in one list." },
        { lbl: "NEXT POINTER", body: "In a 64-bit system, a pointer is 8 bytes. For a list of n integers (4 bytes each), you pay 8 bytes overhead per node — 2× the data size." },
        { lbl: "DOUBLY LINKED", body: "Add a prev pointer. Now each node costs 3 fields instead of 2. Trade: O(1) backward traversal and O(1) delete with node reference." },
      ],
    },
    {
      id: "types", icon: "🌿", title: "Three Types of Linked Lists", color: "#34d399", voice: NARR.types,
      visual: <VisTypes />,
      cards: [
        { lbl: "SINGLY LINKED", body: "One pointer per node. Forward traversal only. Most memory-efficient. Use when you only ever iterate forward and don't need O(1) delete." },
        { lbl: "DOUBLY LINKED", body: "Two pointers per node. Both directions. Used in LRU cache (O(1) eviction), browser history, text editors (cursor movement)." },
        { lbl: "CIRCULAR", body: "Tail's next points to head. No null terminator. Used in round-robin schedulers, multiplayer game turn loops, and audio/video playlists." },
        { lbl: "WHICH TO USE?", body: "Default to singly. Upgrade to doubly if you need backward traversal or O(1) node deletion. Circular only for cyclic problems." },
      ],
    },
    {
      id: "ops", icon: "⚡", title: "Insertion & Deletion", color: "#fb923c", voice: NARR.ops,
      visual: <VisOps />,
      cards: [
        { lbl: "INSERT AT HEAD — O(1)", body: "1. Create new node. 2. new_node.next = head. 3. head = new_node. Three steps, always constant time. The classic LL win." },
        { lbl: "INSERT AT TAIL — O(n)", body: "Without a tail pointer: walk from head to the last node, then attach. Keep a tail pointer to make this O(1)." },
        { lbl: "INSERT IN MIDDLE — O(n)", body: "Walk to position (O(n)). Once there: new_node.next = curr.next, curr.next = new_node. The insert itself is O(1) — the walk costs." },
        { lbl: "DELETE — THE KEY TRICK", body: "To delete a node, find its PREDECESSOR. Set predecessor.next = target.next. The target becomes unreachable and garbage-collected." },
      ],
    },
    {
      id: "traversal", icon: "🚶", title: "Traversal & Search", color: "#f472b6", voice: NARR.traversal,
      visual: <VisTraversal />,
      cards: [
        { lbl: "BASIC TRAVERSAL", body: "curr = head. While curr is not null: process curr.data, then curr = curr.next. Always O(n). No shortcuts." },
        { lbl: "SEARCH — O(n)", body: "Linked lists have no binary search. You cannot jump to the middle without walking there first. Sequential scan only." },
        { lbl: "INDEX ACCESS — O(n)", body: "To get node at index k, you must walk k steps from head. Unlike arrays, there's no arithmetic shortcut. This is the cost of scattered memory." },
        { lbl: "SENTINEL NODES", body: "A dummy head node at the start (value doesn't matter) simplifies edge cases — empty list, insert at head, delete head all become identical code paths." },
      ],
    },
    {
      id: "advanced", icon: "🧠", title: "Advanced Techniques", color: "#fbbf24", voice: NARR.advanced,
      visual: <VisAdvanced />,
      cards: [
        { lbl: "TWO POINTER TECHNIQUE", body: "Slow + fast pointers. Fast at 2×, slow at 1×. When fast hits null, slow is at the midpoint. Finds middle in O(n) with O(1) space — no length calculation needed." },
        { lbl: "FLOYD'S CYCLE DETECTION", body: "Same slow/fast setup. If fast ever equals slow (not at start), there's a cycle. If fast reaches null, no cycle. O(n) time, O(1) space." },
        { lbl: "LIST REVERSAL", body: "Three pointers: prev (null), curr (head), next. Loop: save next = curr.next, flip curr.next = prev, advance prev = curr, curr = next. O(n) time, O(1) space." },
        { lbl: "MERGE SORT ON LL", body: "Actually more efficient than on arrays because no shifting needed. Use two-pointer to split, recursively sort both halves, merge by pointer rewiring. O(n log n)." },
      ],
    },
    {
      id: "memory", icon: "💾", title: "Memory Model & Tradeoffs", color: "#60a5fa", voice: NARR.memory,
      visual: <VisMemory />,
      cards: [
        { lbl: "ARRAYS: CONTIGUOUS", body: "All elements sit next to each other in memory. Loading element[0] often brings element[0]–[15] into CPU cache. 15 free subsequent lookups." },
        { lbl: "LL: SCATTERED", body: "Each node is allocated separately on the heap. Consecutive nodes can be megabytes apart. Every .next dereference can cause a cache miss." },
        { lbl: "CACHE MISS COST", body: "L1 cache hit: ~1 cycle. RAM access (cache miss): ~200 cycles. In practice, linked lists traversing n nodes incur up to n cache misses. Arrays rarely do." },
        { lbl: "WHEN TO ACTUALLY USE LL", body: "Frequent insert/delete at known positions with an existing pointer. Queues (insert tail, delete head). LRU caches. When list size is unpredictable and you can't afford array resizing." },
      ],
    },
  ];

  return (
    <div style={{ background: "#03070f", color: "#f8fafc", minHeight: "100vh", overflowX: "hidden" }}>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        ::selection{background:rgba(56,189,248,0.4)}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(56,189,248,0.35);border-radius:8px}
        ::-webkit-scrollbar-thumb:hover{background:rgba(56,189,248,0.55)}

        @keyframes orb1{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(24px,-18px) scale(1.05)}66%{transform:translate(-14px,11px) scale(0.97)}}
        @keyframes orb2{0%,100%{transform:translate(0,0)}42%{transform:translate(-22px,16px)}84%{transform:translate(16px,-10px)}}
        @keyframes orb3{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(18px,-12px) scale(1.08)}}
        @keyframes nodeIn{0%{opacity:0;transform:translateY(-40px) scale(0.8)}60%{transform:translateY(5px) scale(1.05)}100%{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes opLabelIn{from{opacity:0;transform:scale(0.85) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes sRight{from{opacity:0;transform:translateX(26px)}to{opacity:1;transform:translateX(0)}}
        @keyframes fUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes slideUp{from{opacity:0;transform:translate(-50%,20px)}to{opacity:1;transform:translate(-50%,0)}}
        @keyframes wave{0%,100%{transform:scaleY(0.4)}50%{transform:scaleY(1)}}
        @keyframes confettiFall{0%{transform:translateY(0) rotate(0deg);opacity:1}80%{opacity:1}100%{transform:translateY(110vh) rotate(720deg);opacity:0}}
        @keyframes panelPop{from{opacity:0;transform:translateY(-8px) scale(0.96)}to{opacity:1;transform:translateY(0) scale(1)}}

        @media(max-width:760px){
          .sg{grid-template-columns:1fr !important}
        }
      `}</style>

      {showConfetti && <Confetti />}
      <ProgressBar />
      <RightSidebar
        active={active}
        speaking={!!speaking}
        speed={speed}
        setSpeed={setSpeed}
        onRestart={handleRestart}
        seenCount={seenSections.size}
        open={navOpen}
        setOpen={setNavOpen}
      />
      <BackToTop />
      <MiniPlayer speaking={speaking} speakingLabel={speakingLabel} onStop={handleStop} speed={speed} />

      <Hero onStart={goIntro} onVoice={() => handleVoice("__hero__", NARR.intro)} />

      {/* Keyboard hint */}
      <div style={{ textAlign: "center", marginBottom: 32, fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "#1e2a38", letterSpacing: "0.1em" }}>
        PRESS <kbd style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 5, padding: "1px 7px", color: "#2d3748" }}>S</kbd> TO STOP VOICE · <kbd style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 5, padding: "1px 7px", color: "#2d3748" }}>↑↓</kbd> TO NAVIGATE
      </div>

      <main style={{ maxWidth: 1020, margin: "0 auto", padding: "0 20px 100px" }}>

        {SECTS.map(s => (
          <Sect key={s.id} id={s.id} icon={s.icon} title={s.title}
            color={s.color} visual={s.visual} cards={s.cards}
            voice={s.voice} speaking={speaking} onVoice={handleVoice}
            seen={seenSections.has(s.id)} />
        ))}

        {/* Complexity table */}
        <section id="complexity" style={{ marginBottom: 88 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22, flexWrap: "wrap" }}>
            <div style={{ width: 52, height: 52, borderRadius: 18, flexShrink: 0, background: "rgba(56,189,248,0.12)", border: "1px solid rgba(56,189,248,0.32)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, boxShadow: "0 0 32px rgba(56,189,248,0.15)" }}>📊</div>
            <div>
              <h2 style={{ fontFamily: "'Clash Display',sans-serif", fontSize: "clamp(19px,3.8vw,30px)", fontWeight: 700, color: "#f8fafc" }}>Complexity Cheat Sheet</h2>
              <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "#2d3748", marginTop: 3, letterSpacing: "0.08em" }}>SINGLY vs DOUBLY vs ARRAY · HOVER ROWS</p>
            </div>
          </div>
          <div style={{ borderRadius: 22, overflow: "hidden", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <ComplexityTable />
          </div>
        </section>

        {/* Quiz */}
        <section id="quiz" style={{ marginBottom: 88 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8, flexWrap: "wrap" }}>
            <div style={{ width: 52, height: 52, borderRadius: 18, flexShrink: 0, background: "rgba(236,72,153,0.12)", border: "1px solid rgba(236,72,153,0.32)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, boxShadow: "0 0 32px rgba(236,72,153,0.15)" }}>🎯</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{ fontFamily: "'Clash Display',sans-serif", fontSize: "clamp(19px,3.8vw,30px)", fontWeight: 700, color: "#f8fafc" }}>Test Your Knowledge</h2>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#475569", marginTop: 3 }}>6 questions · covers every section · some are subtle</p>
            </div>
            <button onClick={() => handleVoice("quiz", NARR.quiz)} style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "7px 14px", borderRadius: 28, cursor: "pointer", flexShrink: 0,
              background: speaking === "quiz" ? "rgba(236,72,153,0.2)" : "rgba(255,255,255,0.04)",
              border: `1.5px solid ${speaking === "quiz" ? "#ec4899" : "rgba(255,255,255,0.1)"}`,
              fontFamily: "'JetBrains Mono',monospace", fontSize: 9, fontWeight: 700,
              color: speaking === "quiz" ? "#ec4899" : "#475569", transition: "all 0.22s",
            }}>
              {speaking === "quiz" ? <SpeakingWave color="#ec4899" size={12} /> : <span style={{ fontSize: 12 }}>🔊</span>}
              {speaking === "quiz" ? "STOP" : "LISTEN"}
            </button>
          </div>
          <div style={{ marginBottom: 22 }} />
          <Quiz onDone={(sc, tot) => {
            setQScore(sc); setQTotal(tot);
            if (sc >= tot) { setShowConfetti(true); setTimeout(() => setShowConfetti(false), 4500); }
          }} />

          {qScore !== null && (
            <div style={{
              marginTop: 30, padding: "36px 24px", borderRadius: 24, textAlign: "center",
              background: `linear-gradient(138deg,${qScore >= 5 ? "rgba(74,222,128,0.1)" : qScore >= 3 ? "rgba(251,191,36,0.1)" : "rgba(239,68,68,0.1)"} 0%,rgba(0,0,0,0) 100%)`,
              border: `1px solid ${qScore >= 5 ? "rgba(74,222,128,0.32)" : qScore >= 3 ? "rgba(251,191,36,0.32)" : "rgba(239,68,68,0.32)"}`,
              animation: "fUp 0.5s ease",
            }}>
              <div style={{ fontSize: 52, marginBottom: 12 }}>{qScore >= 5 ? "🏆" : qScore >= 3 ? "⭐" : "💪"}</div>
              <div style={{ fontFamily: "'Clash Display',sans-serif", fontSize: 40, fontWeight: 700, color: qScore >= 5 ? "#4ade80" : qScore >= 3 ? "#fbbf24" : "#f87171" }}>{qScore} / {qTotal}</div>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 15, color: "#94a3b8", margin: "10px 0 24px", lineHeight: 1.55 }}>
                {qScore >= 5 ? "Outstanding! You genuinely understand linked lists." : qScore >= 3 ? "Solid progress. Review the sections you missed and retry." : "Great start — re-read the sections above and come back stronger."}
              </p>
              <button onClick={() => window.location.href = "/ll"} style={{
                padding: "12px 28px", borderRadius: 16, cursor: "pointer",
                background: "linear-gradient(135deg,#0ea5e9,#8b5cf6)", border: "none",
                fontFamily: "'Clash Display',sans-serif", fontSize: 15, fontWeight: 700, color: "#fff",
                boxShadow: "0 8px 32px rgba(14,165,233,0.4)",
              }}>💻 See the Code →</button>
            </div>
          )}
        </section>

        {/* Footer card */}
        <div style={{
          textAlign: "center", padding: "52px 24px", borderRadius: 28,
          background: "linear-gradient(140deg,rgba(56,189,248,0.09) 0%,rgba(167,139,250,0.07) 50%,rgba(52,211,153,0.06) 100%)",
          border: "1px solid rgba(56,189,248,0.18)", position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle,rgba(56,189,248,0.04) 1px,transparent 1px)", backgroundSize: "32px 32px", pointerEvents: "none" }} />
          <div style={{ fontSize: 48, marginBottom: 14 }}>🔗</div>
          <h3 style={{ fontFamily: "'Clash Display',sans-serif", fontSize: "clamp(18px,3.2vw,27px)", fontWeight: 700, color: "#f8fafc", marginBottom: 12 }}>You've completed the Linked List guide!</h3>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: "#64748b", maxWidth: 480, margin: "0 auto 28px", lineHeight: 1.72 }}>
            Now implement one from scratch. Start with singly, add a tail pointer, then implement reverse. Writing it from memory is how mastery happens.
          </p>
          <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap", marginBottom: 16 }}>
            {NAV_SECTIONS.map(s => (
              <div key={s.id} style={{
                padding: "4px 12px", borderRadius: 20,
                background: seenSections.has(s.id) ? `${s.col}18` : "rgba(255,255,255,0.03)",
                border: `1px solid ${seenSections.has(s.id) ? `${s.col}38` : "rgba(255,255,255,0.06)"}`,
                fontFamily: "'JetBrains Mono',monospace", fontSize: 9, fontWeight: 700,
                color: seenSections.has(s.id) ? s.col : "#1a2030", transition: "all 0.3s",
              }}>{s.icon} {s.label} {seenSections.has(s.id) ? "✓" : ""}</div>
            ))}
          </div>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "#2d3748", marginBottom: 24 }}>
            {seenSections.size} / {NAV_SECTIONS.length} sections visited
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => window.location.href = "/ll"} style={{
              padding: "13px 28px", borderRadius: 14, cursor: "pointer",
              background: "linear-gradient(135deg,#0ea5e9,#8b5cf6)", border: "none",
              fontFamily: "'Clash Display',sans-serif", fontSize: 14, fontWeight: 700, color: "#fff",
              boxShadow: "0 6px 28px rgba(14,165,233,0.4)",
            }}>💻 See Implementation Code →</button>
            <button onClick={() => window.location.href = "/stack"} style={{
              padding: "13px 28px", borderRadius: 14, cursor: "pointer",
              background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(255,255,255,0.12)",
              fontFamily: "'Clash Display',sans-serif", fontSize: 14, fontWeight: 700, color: "#94a3b8",
            }}>← Back to Stacks</button>
          </div>
        </div>
      </main>
    </div>
  );
}