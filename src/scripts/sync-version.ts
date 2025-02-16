import { writeFileSync } from "fs";
import { execSync } from "child_process";

const version = execSync("git describe --tags --abbrev=0").toString().trim();
const packageJson = require("../../package.json");

packageJson.version = version;
writeFileSync("../../package.json", JSON.stringify(packageJson, null, 2) + "\n");

console.log(`Updated package.json to version ${version}`);