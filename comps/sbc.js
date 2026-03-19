"use client";
import { createContext, useContext, useState, useEffect } from "react";

const SidebarContext = createContext();

const MOBILE_BREAKPOINT = 768;
const W_OPEN      = 272; // ← must match sidebar.jsx's W_OPEN (was 248, causing 24px gap)
const W_COLLAPSED = 0;

export function SidebarProvider({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile,  setIsMobile]  = useState(true);  // assume mobile until measured
  const [mounted,   setMounted]   = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    check();
    window.addEventListener("resize", check, { passive: true });
    setMounted(true);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Before mount: width=0 so layout wrapper adds no margin
  // After mount on mobile: width=0 (sidebar is an overlay)
  // After mount on desktop: real sidebar width
  const width = !mounted || isMobile ? 0 : collapsed ? W_COLLAPSED : W_OPEN;

  const toggleCollapse = () => setCollapsed((prev) => !prev);

  return (
    <SidebarContext.Provider value={{ collapsed, width, toggleCollapse, isMobile, mounted }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}