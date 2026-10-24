import React, { createContext, useContext, useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar';

const SidebarContext = createContext(null);

// Asosiy tablar ichida yon menyuni boshqaradi
export function SidebarProvider({ children }) {
  const [visible, setVisible] = useState(false);

  const value = useMemo(() => ({
    open: () => setVisible(true),
    close: () => setVisible(false),
  }), []);

  return (
    <SidebarContext.Provider value={value}>
      {children}
      <Sidebar visible={visible} onClose={value.close} />
    </SidebarContext.Provider>
  );
}

// Provider tashqarisida (masalan, stack ekranlarida) null qaytaradi — u holda menyu tugmasi ko'rsatilmaydi
export const useSidebar = () => useContext(SidebarContext);
