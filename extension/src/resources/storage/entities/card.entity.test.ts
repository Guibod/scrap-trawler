import { describe, it, expect } from 'vitest';
import { isCardAtomic, CardAtomic, isCardAtomicArray } from "./card.entity"

const validCard: CardAtomic = {
  name: 'Lightning Bolt',
  colors: ['R'],
  manaValue: 1,
  type: 'Instant',
  legalities: {},
  identifiers: { scryfallId: 'some-id' },
} as unknown as CardAtomic;

const invalidCard = {
  name: 'Fake Card',
  manaValue: '1', // Invalid: should be a number
  type: 'Instant',
  legalities: {},
  identifiers: { scryfallId: 'some-id' },
};

describe('isCardAtomic Type Guard', () => {
  it('should return true for a valid CardAtomic object', () => {
    expect(isCardAtomic(validCard)).toBe(true);
  });

  it('should return false for an invalid CardAtomic object', () => {
    expect(isCardAtomic(invalidCard)).toBe(false);
  });

  it('should return false for null', () => {
    expect(isCardAtomic(null)).toBe(false);
  });

  it('should return false for an empty object', () => {
    expect(isCardAtomic({})).toBe(false);
  });

  it('should return false if a required field is missing', () => {
    const missingFields = { ...validCard };
    delete missingFields.name; // Remove required field
    expect(isCardAtomic(missingFields)).toBe(false);
  });
});

describe('isCardAtomicArray Type Guard', () => {
  it('should return true for a valid CardAtomic object', () => {
    expect(isCardAtomicArray([validCard])).toBe(true);
  });

  it('should return false for an invalid CardAtomic object', () => {
    expect(isCardAtomicArray([invalidCard])).toBe(false);
  });

  it('should return false for both valid and invalid CardAtomic object', () => {
    expect(isCardAtomicArray([validCard, invalidCard])).toBe(false);
  });

  it('should return false for null', () => {
    expect(isCardAtomicArray(null)).toBe(false);
  });

  it('should return false for an empty object', () => {
    expect(isCardAtomicArray([{}])).toBe(false);
  });

  it('should return false if a required field is missing', () => {
    const missingFields = { ...validCard };
    delete missingFields.name; // Remove required field
    expect(isCardAtomicArray([missingFields])).toBe(false);
  });
});