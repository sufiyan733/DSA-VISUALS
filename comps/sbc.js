"use client";
import { createContext, useContext, useState, useEffect } from "react";

const SidebarContext = createContext();

const MOBILE_BREAKPOINT = 768;
const W_OPEN      = 248;
const W_COLLAPSED = 56;

export function SidebarProvider({ children }) {
  const [collapsed,  setCollapsed]  = useState(false);
  const [isMobile,   setIsMobile]   = useState(false);

  // Detect mobile on mount and on resize
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    check(); // run immediately
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);

  // On mobile the sidebar is a full-screen overlay — it takes up NO layout
  // space, so the content area must have marginLeft: 0.
  // On desktop it occupies real space, so push content by the sidebar width.
  const width = isMobile ? 0 : collapsed ? W_COLLAPSED : W_OPEN;

  const toggleCollapse = () => setCollapsed((prev) => !prev);

  return (
    <SidebarContext.Provider value={{ collapsed, width, toggleCollapse, isMobile }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}