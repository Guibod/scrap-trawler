import { describe, it, expect } from 'vitest'
import { resolveEnumValue, sortByEnumOrder } from "~/resources/utils/enum"
import { MTG_COLORS } from '../domain/enums/mtg/colors.dbo'

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

describe("sortByEnumOrder", () => {
  it("should sort MTG_COLORS in enum declaration order", () => {
    const unordered: MTG_COLORS[] = [
      MTG_COLORS.RED,
      MTG_COLORS.BLUE,
      MTG_COLORS.GREEN,
      MTG_COLORS.BLACK,
      MTG_COLORS.WHITE
    ]

    const sorted = sortByEnumOrder(unordered, MTG_COLORS)

    expect(sorted).toEqual([
      MTG_COLORS.WHITE,
      MTG_COLORS.BLUE,
      MTG_COLORS.BLACK,
      MTG_COLORS.RED,
      MTG_COLORS.GREEN
    ])
  })
})