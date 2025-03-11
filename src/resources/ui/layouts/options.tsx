import React, { type ReactNode } from "react";
import packageJson from "../../../../package.json";

export const OptionPageLayout = ({children}: {children: ReactNode}) => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* ✅ Main Content Area */}
      <main className="flex-grow container mx-auto p-6">
        {children}
      </main>

      {/* ✅ Footer (Optional) */}
      <footer className="bg-gray-900 text-white py-4 text-center text-sm">
        Scrap Trawler v{packageJson.version} &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default OptionPageLayout;
