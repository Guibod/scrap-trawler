import { describe, it, expect } from 'vitest';
import { hashStringSHA1, hashStringSHA256 } from './crypto'; // Adjust path as needed

describe('hashStringSHA1', () => {
  it('should return the correct SHA-1 hash for a given string', async () => {
    const input = 'test-string';
    const expectedHash = '4f49d69613b186e71104c7ca1b26c1e5b78c9193'; // Precomputed SHA-1

    const result = await hashStringSHA1(input);

    expect(result).toBe(expectedHash);
  });

  it('should return different hashes for different inputs', async () => {
    const hash1 = await hashStringSHA1('hello');
    const hash2 = await hashStringSHA1('world');

    expect(hash1).not.toBe(hash2);
  });
});

describe('hashStringSHA256', () => {
  it('should return a 16-character SHA-256 hash for a given string', async () => {
    const input = 'test-string';
    const expectedHash = 'ffe65f1d98fafede'; // First 16 chars of actual SHA-256

    const result = await hashStringSHA256(input);

    expect(result).toBe(expectedHash);
  });

  it('should always return 16-character hashes', async () => {
    const hash = await hashStringSHA256('longer test string');
    expect(hash.length).toBe(16);
  });

  it('should return different hashes for different inputs', async () => {
    const hash1 = await hashStringSHA256('hello');
    const hash2 = await hashStringSHA256('world');

    expect(hash1).not.toBe(hash2);
  });
});
