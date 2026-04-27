"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useLayoutEffect,
  type ReactNode,
} from "react";

interface SidebarContextType {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  toggleCollapse: () => void;
  toggleMobile: () => void;
  closeMobile: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

const SIDEBAR_COLLAPSED_KEY = "damira-admin-sidebar-collapsed";

export function SidebarProvider({ children }: { children: ReactNode }) {
  // Always start with false to match server render, then sync from localStorage
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  // Restore collapsed state from localStorage after mount
  // Use layoutEffect to avoid cascading renders while ensuring sync before paint
  useLayoutEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional for hydration handling
    setHasMounted(true);
    const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    if (stored === "true") {
      setIsCollapsed(true);
    }
  }, []);

  // Persist collapsed state to localStorage (only after initial mount)
  useEffect(() => {
    if (hasMounted) {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(isCollapsed));
    }
  }, [isCollapsed, hasMounted]);

  // Close mobile sidebar on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileOpen) {
        setIsMobileOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isMobileOpen]);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  const toggleMobile = useCallback(() => {
    setIsMobileOpen((prev) => !prev);
  }, []);

  const closeMobile = useCallback(() => {
    setIsMobileOpen(false);
  }, []);

  return (
    <SidebarContext.Provider
      value={{
        isCollapsed,
        isMobileOpen,
        toggleCollapse,
        toggleMobile,
        closeMobile,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}
