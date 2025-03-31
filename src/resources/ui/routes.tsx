import { Navigate, Route, Routes } from "react-router-dom"
import MainPage from "~/resources/ui/pages/main"
import EventPage from "~/resources/ui/pages/event"
import React from "react"
import SettingsPage from "~/resources/ui/pages/settings"
import MainLayout from "~/resources/ui/layouts/main"
import WelcomePage from "~/resources/ui/pages/welcome"
import ChangelogPage from "~/resources/ui/pages/changelog"
import EventView from "~/resources/ui/components/event/view"
import EventSetup from "~/resources/ui/components/event/setup"
import EventIndexRedirect from "~/resources/ui/components/event"
import EventPlayerPage from "~/resources/ui/pages/player"

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<MainLayout />}>
      <Route index element={<MainPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/welcome" element={<WelcomePage />} />
      <Route path="/changelog" element={<ChangelogPage />} />
      <Route path="/event/:eventId" element={<EventPage />} >
        <Route index element={<EventIndexRedirect />} />
        <Route path="view" element={<EventView />} />
        <Route path="setup" element={<EventSetup />} />
        <Route path="player/:playerId" element={<EventPlayerPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Route>
  </Routes>
)

export default AppRoutes