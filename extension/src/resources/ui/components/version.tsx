import React from "react"
import { Link } from "react-router-dom"
import { getHumanVersion } from "~/resources/utils/version"

type VersionProps = {
  linked?: boolean
}

const Version = ({linked = true}: VersionProps) => {
  const version = getHumanVersion()
  return (
    <span>
      {linked ? <Link to="/changelog">{version}</Link> : `${version}`}
    </span>
  )
}

export default Version