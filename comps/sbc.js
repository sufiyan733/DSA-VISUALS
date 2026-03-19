"use client";
import { createContext, useContext, useState } from "react";

const SidebarContext = createContext();

export function SidebarProvider({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const W_OPEN = 248;
  const W_COLLAPSED = 56;
  const width = collapsed ? W_COLLAPSED : W_OPEN;

  const toggleCollapse = () => setCollapsed((prev) => !prev);

  return (
    <SidebarContext.Provider value={{ collapsed, width, toggleCollapse }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}