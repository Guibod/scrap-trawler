import { Navigate, Route, Routes } from "react-router-dom"
import MainPage from "~resources/ui/pages/main"
import EventPage from "~resources/ui/pages/event"
import React from "react"

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<MainPage />} />
    <Route path="/event/:eventId" element={<EventPage />} />
    <Route path="*" element={<Navigate to="/" />} />
  </Routes>
)

export default AppRoutes