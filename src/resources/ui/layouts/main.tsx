import React from "react";
import { Link, Outlet } from "react-router-dom";
import packageJson from "../../../../package.json";

export const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* ✅ Top Navigation */}
      <nav className="bg-gray-900 text-white py-4 px-6 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* ✅ Brand */}
          <Link to="/" className="text-lg font-mtg">
            Scrap Trawler
          </Link>

          {/* ✅ Navigation Links */}
          <div className="flex gap-6">
            <Link to="/" className="hover:text-gray-400 transition">Home</Link>
            <Link to="/events" className="hover:text-gray-400 transition">Events</Link>
            <Link to="/settings" className="hover:text-gray-400 transition">Settings</Link>
          </div>
        </div>
      </nav>

      {/* ✅ Main Content Area */}
      <main className="flex-grow container mx-auto p-6">
        <Outlet />
      </main>

      {/* ✅ Footer (Optional) */}
      <footer className="bg-gray-900 text-white py-4 text-center text-sm">
        Scrap Trawler v{packageJson.version} &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default MainLayout;
