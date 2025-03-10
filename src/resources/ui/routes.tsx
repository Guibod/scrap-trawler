import { Navigate, Route, Routes } from "react-router-dom"
import MainPage from "~/resources/ui/pages/main"
import EventPage from "~/resources/ui/pages/event"
import React from "react"
import SettingsPage from "~/resources/ui/pages/settings"
import MainLayout from "~/resources/ui/layouts/main"
import WelcomePage from "~/resources/ui/pages/welcome"
import ChangelogPage from "~/resources/ui/pages/changelog"

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<MainLayout />}>
      <Route index element={<MainPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/welcome" element={<WelcomePage />} />
      <Route path="/changelog" element={<ChangelogPage />} />
      <Route path="/event/:eventId" element={<EventPage />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Route>
  </Routes>
)

export default AppRoutes