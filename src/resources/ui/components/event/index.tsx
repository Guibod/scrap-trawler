import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useEvent } from "~/resources/ui/providers/event"

const EventIndexRedirect = () => {
  const { showSetupByDefault } = useEvent()
  const navigate = useNavigate()

  useEffect(() => {
    navigate(showSetupByDefault ? "setup" : "view", { replace: true })
  }, [showSetupByDefault, navigate])

  return null
}

export default EventIndexRedirect
