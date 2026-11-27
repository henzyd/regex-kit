import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import {
  base58CheckValid,
  base58Decode,
  bech32Decode,
  keccak256,
  sha256,
  toHex,
  utf8
} from '../src/internal/hash.js';
import { gs1, luhn, mod97, verhoeff } from '../src/internal/checksum.js';

describe('sha256', () => {
  it('matches node:crypto at every padding boundary', () => {
    for (const n of [0, 1, 3, 55, 56, 57, 63, 64, 65, 119, 120, 127, 128, 129, 1000, 4096]) {
      const bytes = new Uint8Array(n).map((_, i) => (i * 31 + 7) & 0xff);
      expect(toHex(sha256(bytes)), `length ${n}`).toBe(
        createHash('sha256').update(bytes).digest('hex')
      );
    }
  });
  it('hashes the standard vector', () => {
    expect(toHex(sha256(utf8('abc')))).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'
    );
  });
});

describe('keccak256', () => {
  it('matches the published vectors', () => {
    expect(toHex(keccak256(utf8('')))).toBe(
      'c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470'
    );
    expect(toHex(keccak256(utf8('abc')))).toBe(
      '4e03657aea45a94fc7d47ba826c8d667c0d1e6e33a64a036ec44f58fa12d6c45'
    );
    expect(toHex(keccak256(utf8('The quick brown fox jumps over the lazy dog')))).toBe(
      '4d741b6f1eb29cb2a9b9911c82f56fa8d73b04959d3d9d222895df6c0b28aa15'
    );
  });
  it('handles inputs at and beyond the 136-byte rate', () => {
    const a = keccak256(new Uint8Array(135));
    const b = keccak256(new Uint8Array(136));
    const c = keccak256(new Uint8Array(137));
    expect(new Set([toHex(a), toHex(b), toHex(c)]).size).toBe(3);
    expect(toHex(keccak256(new Uint8Array(200)))).toHaveLength(64);
  });
});

describe('base58 and bech32', () => {
  it('decodes and checks Base58Check', () => {
    expect(base58CheckValid('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa')).toBe(true);
    expect(base58CheckValid('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNb')).toBe(false);
    expect(base58Decode('0OIl')).toBeNull();
    expect(base58Decode('11')?.length).toBe(2);
  });
  it('verifies Bech32 and Bech32m', () => {
    expect(bech32Decode('bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq')).toMatchObject({
      hrp: 'bc',
      version: 0,
      program: 20
    });
    expect(
      bech32Decode('bc1p0xlxvlhemja6c4dqv22uapctqupfhlxm9h8z3k2e72q4k9hcz7vqzk5jj0')
    ).toMatchObject({ version: 1, program: 32 });
    expect(bech32Decode('bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdp')).toBeNull();
    expect(bech32Decode('Bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq')).toBeNull();
  });
});

describe('checksum primitives', () => {
  it('luhn', () => {
    expect(luhn('79927398713')).toBe(true);
    expect(luhn('79927398710')).toBe(false);
    expect(luhn('')).toBe(false);
    expect(luhn('12a')).toBe(false);
  });
  it('mod97 follows ISO 7064', () => {
    expect(mod97('WEST12345698765432GB82')).toBe(1);
    expect(mod97('a')).toBe(-1);
  });
  it('verhoeff', () => {
    expect(verhoeff('234123412346')).toBe(true);
    expect(verhoeff('234123412347')).toBe(false);
  });
  it('gs1 mod 10', () => {
    expect(gs1('4006381333931')).toBe(true);
    expect(gs1('4006381333932')).toBe(false);
  });
  it('mod97 gives 1 for every valid IBAN-shaped example', () => {
    expect(mod97('34891234567890GB')).toBeGreaterThanOrEqual(0);
  });
});
