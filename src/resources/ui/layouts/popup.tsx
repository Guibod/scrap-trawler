import React, { type ReactNode, useEffect, useState } from "react"

export const PopupLayout = ({children}: {children: ReactNode}) => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check system preference
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDarkMode(isDark);
  }, []);

  return (
    <main aria-label="layout-container" className={`transition-all ${darkMode ? 'dark' : 'light'} text-foreground bg-background`}>
      {children}
    </main>
  );
};

export default PopupLayout;
