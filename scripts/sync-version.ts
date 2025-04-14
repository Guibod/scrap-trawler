import { execSync } from "child_process"
import { readFileSync, writeFileSync } from "fs"
import { join } from "path"

// Get latest Git tag (assumes 'vX.Y.Z' format)
const rawTag = execSync("git describe --tags --abbrev=0", {
  encoding: "utf8"
}).trim()

const version = rawTag.replace(/^v/, "")
console.log(`🔖 Found tag: ${rawTag} → version: ${version}`)

const packageFiles = [
  "extension/package.json",
  "cloudflare-proxy/package.json"
]

for (const path of packageFiles) {
  const fullPath = join(process.cwd(), path)
  const json = JSON.parse(readFileSync(fullPath, "utf8"))
  json.version = version
  writeFileSync(fullPath, JSON.stringify(json, null, 2) + "\n")
  console.log(`✅ Updated ${path} to version ${version}`)
}
