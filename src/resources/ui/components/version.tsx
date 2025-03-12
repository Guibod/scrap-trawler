import packageJson from '../../../../package.json'
import React from "react"
import { Link } from "react-router-dom"

type VersionProps = {
  linked?: boolean
}

const Version = ({linked = true}: VersionProps) => {
  return (
    <span>
      {linked ? <Link to="/changelog">v{packageJson.version}</Link> : `v${packageJson.version}`}
    </span>
  )
}

export default Version