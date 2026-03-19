"use client";
import { useSidebar } from "./sbc";
import Sidebar from "./sidebar";

export default function LayoutWithSidebar({ children }) {
  const { width } = useSidebar();

  return (
    <div style={{
      display: "flex",
      minHeight: "100vh",
      width: "100vw",       // exactly the viewport — never wider
      maxWidth: "100vw",
      overflowX: "hidden",
    }}>
      <Sidebar />
      <main
        style={{
          marginLeft: `${width}px`,
          width: `calc(100vw - ${width}px)`,  // take exactly what's left
          maxWidth: `calc(100vw - ${width}px)`,
          minWidth: 0,
          overflowY: "auto",
          overflowX: "hidden",
          backgroundColor: "#04040f",
          transition: "margin-left 0.26s cubic-bezier(0.16,1,0.3,1), width 0.26s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        {children}
      </main>
    </div>
  );
}