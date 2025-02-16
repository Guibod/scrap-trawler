import { writeFileSync } from "fs";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get the latest Git tag (version)
const version = execSync("git describe --tags --abbrev=0").toString().trim();

// Import package.json dynamically
const packageJsonPath = join(__dirname, "../../package.json");

// ✅ Fix: Use dynamic import with .default to access JSON content
const packageJson = (await import(packageJsonPath, { assert: { type: "json" } })).default;

// Update version
packageJson.version = version;

// Write back to package.json
writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + "\n");

console.log(`✅ Updated package.json to version ${version}`);
