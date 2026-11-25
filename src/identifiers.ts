import { opts, str } from './internal/core.js';
import type { Cuid2, Nanoid, ObjectId, Ulid, Uuid } from './types.js';

export interface UuidOptions {
  /** A specific version (1-8), `nil`, `max`, or `any` (default). */
  version?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 'nil' | 'max' | 'any';
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-([1-8])[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const NIL = /^0{8}-0{4}-0{4}-0{4}-0{12}$/;
const MAX = /^f{8}-f{4}-f{4}-f{4}-f{12}$/i;

/** RFC 9562 UUID. The variant bits are enforced, except for the nil and max UUIDs. */
export function isUuid(value: unknown, options?: UuidOptions): value is Uuid {
  const s = str(value, 36);
  if (s === null) return false;
  const v = opts(options).version ?? 'any';
  if (v === 'nil') return NIL.test(s);
  if (v === 'max') return MAX.test(s);
  const m = UUID.exec(s);
  if (m !== null) return v === 'any' || Number(m[1]) === v;
  return v === 'any' && (NIL.test(s) || MAX.test(s));
}

export function isGuid(value: unknown, options?: { allowBraces?: boolean }): boolean {
  const s = str(value, 38);
  if (s === null) return false;
  const core = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (opts(options).allowBraces && s.startsWith('{') && s.endsWith('}'))
    return core.test(s.slice(1, -1));
  return core.test(s);
}

export function isUlid(value: unknown): value is Ulid {
  const s = str(value, 26);
  return s !== null && /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/i.test(s);
}

export function isCuid(value: unknown): boolean {
  const s = str(value, 25);
  return s !== null && /^c[a-z0-9]{24}$/.test(s);
}

export function isCuid2(value: unknown, options?: { length?: number }): value is Cuid2 {
  const s = str(value, 32);
  if (s === null) return false;
  const length = opts(options).length ?? 24;
  return s.length === length && length >= 2 && /^[a-z][a-z0-9]*$/.test(s);
}

export function isNanoid(
  value: unknown,
  options?: { length?: number; alphabet?: string }
): value is Nanoid {
  const s = str(value, 256);
  if (s === null) return false;
  const o = opts(options);
  if (s.length !== (o.length ?? 21)) return false;
  if (o.alphabet === undefined) return /^[A-Za-z0-9_-]+$/.test(s);
  const set = new Set(o.alphabet);
  for (const c of s) if (!set.has(c)) return false;
  return true;
}

export function isKsuid(value: unknown): boolean {
  const s = str(value, 27);
  return s !== null && /^[0-9A-Za-z]{27}$/.test(s);
}

export function isObjectId(value: unknown): value is ObjectId {
  const s = str(value, 24);
  return s !== null && /^[0-9a-f]{24}$/i.test(s);
}

export interface SnowflakeOptions {
  /** Treat as a signed 64-bit integer (maximum 2^63 - 1). Default `false`. */
  signed?: boolean;
  /**
   * Epoch in milliseconds (Discord: 1420070400000, Twitter: 1288834974657). When set,
   * the embedded timestamp must fall between the epoch and a day from now.
   */
  epoch?: number;
}

export function isSnowflakeId(value: unknown, options?: SnowflakeOptions): boolean {
  const s = str(value, 20);
  if (s === null || !/^[1-9]\d{0,19}$/.test(s)) return false;
  const n = BigInt(s);
  const o = opts(options);
  if (n > (o.signed ? 2n ** 63n - 1n : 2n ** 64n - 1n)) return false;
  if (o.epoch !== undefined) {
    const ts = Number(n >> 22n) + o.epoch;
    return ts >= o.epoch && ts <= Date.now() + 86_400_000;
  }
  return true;
}

export function isShortId(
  value: unknown,
  options?: { minLength?: number; maxLength?: number }
): boolean {
  const s = str(value, 256);
  if (s === null) return false;
  const o = opts(options);
  return (
    s.length >= (o.minLength ?? 6) && s.length <= (o.maxLength ?? 21) && /^[A-Za-z0-9_-]+$/.test(s)
  );
}

export type HashAlgorithm =
  | 'md5'
  | 'sha1'
  | 'crc32'
  | 'sha224'
  | 'sha256'
  | 'sha384'
  | 'sha512'
  | 'sha3-224'
  | 'sha3-256'
  | 'sha3-384'
  | 'sha3-512'
  | 'blake2b'
  | 'blake2s';

const HASH_LENGTH: Record<HashAlgorithm, number> = {
  md5: 32,
  sha1: 40,
  crc32: 8,
  sha224: 56,
  sha256: 64,
  sha384: 96,
  sha512: 128,
  'sha3-224': 56,
  'sha3-256': 64,
  'sha3-384': 96,
  'sha3-512': 128,
  blake2b: 128,
  blake2s: 64
};

/** Hex digest check. `md5`, `sha1` and `crc32` need `{ legacy: true }`. */
export function isHash(
  value: unknown,
  algorithm?: unknown,
  options?: { legacy?: boolean }
): boolean {
  if (typeof algorithm !== 'string' || !Object.hasOwn(HASH_LENGTH, algorithm)) return false;
  const alg = algorithm as HashAlgorithm;
  if (['md5', 'sha1', 'crc32'].includes(alg) && !opts(options).legacy) return false;
  const s = str(value, 128);
  return s !== null && s.length === HASH_LENGTH[alg] && /^[0-9a-f]+$/i.test(s);
}

export function isOciDigest(value: unknown): boolean {
  const s = str(value, 140);
  return s !== null && /^(?:sha256:[a-f0-9]{64}|sha512:[a-f0-9]{128})$/.test(s);
}

export function isSriHash(value: unknown): boolean {
  const s = str(value, 2048);
  if (s === null) return false;
  const entry =
    /^(?:sha256-[A-Za-z0-9+/]{43}=|sha384-[A-Za-z0-9+/]{64}|sha512-[A-Za-z0-9+/]{86}==)(?:\?[\x21-\x7e]*)?$/;
  return s.split(/ +/).every((e) => entry.test(e));
}

export function isBcryptHash(value: unknown): boolean {
  const s = str(value, 60);
  return s !== null && /^\$2[aby]\$(?:0[4-9]|[12]\d|3[01])\$[./A-Za-z0-9]{53}$/.test(s);
}

export function isArgon2Hash(value: unknown): boolean {
  const s = str(value, 512);
  return (
    s !== null &&
    /^\$argon2(?:id|i|d)\$(?:v=\d+\$)?m=\d+,t=\d+,p=\d+\$[A-Za-z0-9+/]+\$[A-Za-z0-9+/]+$/.test(s)
  );
}

export interface HexOptions {
  /** `false` (default): no `0x`. `true`: `0x` required. `'optional'`: either. */
  prefix?: boolean | 'optional';
  /** Exact number of hex digits, excluding any prefix. */
  length?: number;
  /** When `true`, mixed case is rejected: all lower or all upper. Default `false`. */
  caseSensitive?: boolean;
}

export function isHex(value: unknown, options?: HexOptions): boolean {
  const s = str(value, 100_000);
  if (s === null) return false;
  const o = opts(options);
  const prefix = o.prefix ?? false;
  let digits = s;
  const has = /^0[xX]/.test(s);
  if (has) {
    if (prefix === false) return false;
    digits = s.slice(2);
  } else if (prefix === true) return false;
  if (digits.length === 0 || !/^[0-9a-fA-F]+$/.test(digits)) return false;
  if (o.length !== undefined && digits.length !== o.length) return false;
  if (o.caseSensitive && /[a-f]/.test(digits) && /[A-F]/.test(digits)) return false;
  return true;
}

export function isBinary(value: unknown, options?: { prefix?: boolean | 'optional' }): boolean {
  return radix(value, /^[01]+$/, /^0[bB]/, opts(options).prefix ?? false);
}

export function isOctal(value: unknown, options?: { prefix?: boolean | 'optional' }): boolean {
  return radix(value, /^[0-7]+$/, /^0[oO]/, opts(options).prefix ?? false);
}

function radix(value: unknown, digits: RegExp, pre: RegExp, prefix: boolean | 'optional'): boolean {
  const s = str(value, 100_000);
  if (s === null) return false;
  const has = pre.test(s);
  if (has && prefix === false) return false;
  if (!has && prefix === true) return false;
  return digits.test(has ? s.slice(2) : s);
}

export function isOid(value: unknown): boolean {
  const s = str(value, 255);
  if (s === null || !/^[0-2](?:\.(?:0|[1-9]\d*))+$/.test(s)) return false;
  const [a, b] = s.split('.');
  return Number(a) === 2 || Number(b) <= 39;
}
