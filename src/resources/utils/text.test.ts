import { describe, it, expect } from 'vitest';
import { removeDiacritics } from "~resources/utils/text"

describe('removeDiacritics', () => {
  it('should remove diacritics from common accented characters', () => {
    expect(removeDiacritics('Élève')).toBe('eleve');
    expect(removeDiacritics('Crème brûlée')).toBe('creme brulee');
    expect(removeDiacritics('naïve façade')).toBe('naive facade');
  });

  it('should handle multiple diacritics in a word', () => {
    expect(removeDiacritics('Péché')).toBe('peche');
    expect(removeDiacritics('Mañana')).toBe('manana');
  });

  it('should handle non-Latin scripts without errors', () => {
    expect(removeDiacritics('Привет')).toBe('привет'); // Cyrillic, no diacritics to remove
    expect(removeDiacritics('你好')).toBe('你好'); // Chinese, no diacritics
  });

  it('should preserve non-accented characters', () => {
    expect(removeDiacritics('hello')).toBe('hello');
    expect(removeDiacritics('1234')).toBe('1234');
    expect(removeDiacritics('test!@#')).toBe('test!@#');
  });

  it('should handle empty string', () => {
    expect(removeDiacritics('')).toBe('');
  });

  it('should handle mixed diacritics and normal text', () => {
    expect(removeDiacritics('Café du Monde')).toBe('cafe du monde');
    expect(removeDiacritics('fiancée')).toBe('fiancee');
  });
});
