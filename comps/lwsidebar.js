"use client";
import { useSidebar } from "./sbc";
import Sidebar from "./sidebar";

export default function LayoutWithSidebar({ children }) {
  const { width } = useSidebar(); // get current sidebar width

  return (
    <div style={{ display: "flex", minHeight: "100vh", width: "100%" }}>
      <Sidebar />
      <main style={{
        marginLeft: `${width}px`,   // push content right by sidebar width
        flex: 1,
        overflowY: "auto",
        backgroundColor: "#04040f",
        transition: "margin-left 0.26s cubic-bezier(0.16,1,0.3,1)",
      }}>
        {children}
      </main>
    </div>
  );
}