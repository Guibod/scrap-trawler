import React, { useEffect, useState } from "react"
import { Link, Outlet, useLocation } from "react-router-dom"
import { Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@heroui/react"
import Version from "~/resources/ui/components/version"
import CardDatabaseStatus from "~/resources/ui/components/card/status"
import { ErrorBoundary } from "~/resources/ui/error"

export const MainLayout = () => {
  const [darkMode, setDarkMode] = useState(false);
  const location = useLocation()

  useEffect(() => {
    // Check system preference
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDarkMode(isDark);
  }, []);

  return (
    <div aria-label="layout-container" className={`${darkMode ? 'dark' : 'light'} text-foreground bg-background flex flex-col min-h-screen`}>
      <Navbar>
        <NavbarBrand>
          <Link to="/" className="font-mtg text-2xl">
            Scrap Trawler
          </Link>
        </NavbarBrand>
        <NavbarContent>
          <NavbarItem>
            <Link to="/">Events</Link>
          </NavbarItem>
          <NavbarItem>
            <Link to="/settings">Settings</Link>
          </NavbarItem>
          <NavbarItem>
            <Link to="/welcome">About</Link>
          </NavbarItem>
        </NavbarContent>
      </Navbar>

      {/* ✅ Main Content Area */}
      <main className="flex-grow container mx-auto p-6">
        <ErrorBoundary key={location.pathname}>
          <Outlet />
        </ErrorBoundary>
      </main>

      {/* ✅ Footer (Optional) */}
      <footer className="bg-gray-900 text-white py-4 text-center text-sm mt-auto flex justify-center items-center gap-5">
        <span>Scrap Trawler <Version /> &copy; {new Date().getFullYear()}</span>

        <CardDatabaseStatus />
      </footer>
    </div>
  );
};

export default MainLayout;
