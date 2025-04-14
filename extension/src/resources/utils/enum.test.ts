import { describe, it, expect } from 'vitest'
import { resolveEnumValue } from "~/resources/utils/enum"

enum SampleEnum {
  A = 'alpha',
  B = 'bravo',
  C = 'charlie'
}

describe('resolveEnumValue', () => {
  it('returns the correct enum value when matched', () => {
    expect(resolveEnumValue(SampleEnum, 'alpha')).toBe(SampleEnum.A)
    expect(resolveEnumValue(SampleEnum, 'bravo')).toBe(SampleEnum.B)
    expect(resolveEnumValue(SampleEnum, 'charlie')).toBe(SampleEnum.C)
  })

  it('returns undefined when the value is not in the enum', () => {
    expect(resolveEnumValue(SampleEnum, 'delta')).toBeUndefined()
    expect(resolveEnumValue(SampleEnum, '')).toBeUndefined()
    expect(resolveEnumValue(SampleEnum, 'ALPHA')).toBeUndefined()
  })
})