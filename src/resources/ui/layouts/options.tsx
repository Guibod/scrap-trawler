import React, { type ReactNode, useEffect, useState } from "react"
import { getHumanVersion } from "~/resources/utils/version"

export const OptionPageLayout = ({children}: {children: ReactNode}) => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check system preference
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDarkMode(isDark);
  }, []);

  return (
    <div aria-label="layout-container" className={`${darkMode ? 'dark' : 'light'} text-foreground bg-background flex flex-col min-h-screen`}>
      {/* ✅ Main Content Area */}
      <main className="flex-grow container mx-auto p-6">
        {children}
      </main>

      {/* ✅ Footer (Optional) */}
      <footer className="bg-gray-900 text-white py-4 text-center text-sm">
        Scrap Trawler {getHumanVersion()} &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default OptionPageLayout;
