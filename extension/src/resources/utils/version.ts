import packageJson from '../../../package.json'

export const getSemverVersion = (): string => {
  return packageJson.version
}
export const getHumanVersion = (): string => {
  return `v${packageJson.version} (Alpha)`
}