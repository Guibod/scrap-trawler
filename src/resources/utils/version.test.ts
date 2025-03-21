import { describe, expect, it, vi } from 'vitest'
import * as versionUtils from '~/resources/utils/version'

vi.mock('../../../package.json', () => ({
  default: {
    version: '1.2.3'
  }
}))

describe('versionUtils', () => {
  it('getSemverVersion returns raw version', () => {
    expect(versionUtils.getSemverVersion()).toBe('1.2.3')
  })

  it('getHumanVersion returns formatted version string', () => {
    expect(versionUtils.getHumanVersion()).toBe('v1.2.3 (Alpha)')
  })
})