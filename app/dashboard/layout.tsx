// // app/dashboard/layout.tsx
// 'use client';

// import React, { useState } from 'react';
// import Sidebar from './_components/Sidebar';
// import Header from './_components/Header';

// export default function DashboardLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const [sidebarOpen, setSidebarOpen] = useState(false);

//   const toggleSidebar = () => {
//     setSidebarOpen(!sidebarOpen);
//   };

//   return (
//     <div className="min-h-screen bg-gray-950 flex">
//       <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
      
//       <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
//         <Header onMenuToggle={toggleSidebar} />
        
//         <main className="flex-1 overflow-y-auto">
//           {children}
//         </main>
//       </div>
//     </div>
//   );
// }

// app/dashboard/layout.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from './_components/Sidebar';
import Header from './_components/Header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    }
  }, []);

  // Listen for theme changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'theme') {
        setIsDarkMode(e.newValue === 'dark');
      }
    };
    
    const handleThemeChange = (e: CustomEvent) => {
      setIsDarkMode(e.detail.isDark);
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('themeChange', handleThemeChange as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('themeChange', handleThemeChange as EventListener);
    };
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className={`min-h-screen flex ${isDarkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
      
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        <Header onMenuToggle={toggleSidebar} />
        
        <main className={`flex-1 overflow-y-auto ${isDarkMode ? '' : 'bg-gray-50'}`}>
          {children}
        </main>
      </div>
    </div>
  );
}