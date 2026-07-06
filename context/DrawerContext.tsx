import React, { createContext, useContext, useState, ReactNode } from 'react';

interface DrawerContextValue {
  isOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
}

const DrawerContext = createContext<DrawerContextValue | null>(null);

export function DrawerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <DrawerContext.Provider value={{
      isOpen,
      openDrawer: () => setIsOpen(true),
      closeDrawer: () => setIsOpen(false),
      toggleDrawer: () => setIsOpen(v => !v),
    }}>
      {children}
    </DrawerContext.Provider>
  );
}

export function useDrawer() {
  const ctx = useContext(DrawerContext);
  if (!ctx) throw new Error('useDrawer must be inside DrawerProvider');
  return ctx;
}
