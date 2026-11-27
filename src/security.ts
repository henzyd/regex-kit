import { opts, str } from './internal/core.js';
import { isBase64 } from './network.js';
import { wellFormed } from './internal/shared.js';

/**
 * `true` when the value contains a `..` path segment, in plain, percent-encoded,
 * double-encoded or overlong-UTF-8 form, with either slash. Returns `false` for
 * non-strings, so pair it with a type check when the input is untrusted.
 */
export function hasPathTraversal(value: unknown): boolean {
  const s = typeof value === 'string' && value.length <= 8192 ? value.toLowerCase() : '';
  if (s === '') return false;
  const dot = '(?:\\.|%2e|%252e|%c0%ae)';
  const sep = '(?:[\\\\/]|%2f|%5c|%252f|%255c|%c0%af|%c1%9c)';
  return new RegExp(`(?:^|${sep})${dot}{2,}(?:${sep}|$)`).test(s);
}

export function isSafeRelativePath(
  value: unknown,
  options?: { allowBackslash?: boolean }
): boolean {
  const s = str(value, 4096);
  if (s === null) return false;
  if (/[\x00-\x1f\x7f]/.test(s) || /^[\\/]/.test(s) || /^[A-Za-z]:/.test(s)) return false;
  if (!opts(options).allowBackslash && s.includes('\\')) return false;
  return !hasPathTraversal(s);
}

/** A same-site redirect target such as `/dashboard?tab=1`. Rejects `//host`, `/\host` and control characters. */
export function isSafeRedirectPath(value: unknown): boolean {
  const s = str(value, 2048);
  if (s === null || !/^\/(?![/\\])/.test(s)) return false;
  if (/[\x00-\x20\x7f\\]/.test(s)) return false;
  return !/^\/(?:%2f|%5c)/i.test(s);
}

/** `true` when the value contains a NUL character or a percent-encoded NUL (`%00`). */
export function hasNullByte(value: unknown): boolean {
  return (
    typeof value === 'string' &&
    value.length <= 100_000 &&
    (value.includes('\u0000') || /%00/i.test(value))
  );
}

/** `true` when the value contains a bidirectional override or isolate character. */
export function hasBidiControls(value: unknown): boolean {
  return typeof value === 'string' && value.length <= 100_000 && /[‪-‮⁦-⁩‎‏؜]/.test(value);
}

/** `true` when the value contains a zero-width or invisible character. */
export function hasZeroWidthChars(value: unknown): boolean {
  return typeof value === 'string' && value.length <= 100_000 && /[​-‍⁠﻿]/.test(value);
}

export function isWellFormedUnicode(value: unknown): boolean {
  const s = str(value, 1_000_000);
  return s !== null && wellFormed(s);
}

export function isNormalized(value: unknown, form?: unknown): boolean {
  const s = str(value, 1_000_000);
  const f = form ?? 'NFC';
  if (s === null || (f !== 'NFC' && f !== 'NFD' && f !== 'NFKC' && f !== 'NFKD')) return false;
  return s.normalize(f) === s;
}

/** `true` when a spreadsheet will not read the cell as a formula (the OWASP CSV-injection list). */
export function isCsvSafe(value: unknown, options?: { allowNumeric?: boolean }): boolean {
  const s = str(value, 100_000);
  if (s === null) return false;
  if (!/^[=+\-@\t\r]/.test(s)) return true;
  return opts(options).allowNumeric === true && /^[-+]?\d+(?:\.\d+)?(?:[eE][-+]?\d+)?$/.test(s);
}

export function isPkceCodeVerifier(value: unknown): boolean {
  const s = str(value, 128);
  return s !== null && /^[A-Za-z0-9\-._~]{43,128}$/.test(s);
}

export function isPkceCodeChallenge(
  value: unknown,
  options?: { method?: 'S256' | 'plain' }
): boolean {
  const s = str(value, 128);
  if (s === null) return false;
  return opts(options).method === 'plain' ? isPkceCodeVerifier(s) : /^[A-Za-z0-9_-]{43}$/.test(s);
}

export function isOAuthScope(value: unknown, options?: { scopes?: string[] }): boolean {
  const s = str(value, 2048);
  if (s === null) return false;
  const tokens = s.split(' ');
  if (!tokens.every((t) => /^[\x21\x23-\x5b\x5d-\x7e]+$/.test(t))) return false;
  const allowed = opts(options).scopes;
  return allowed === undefined || tokens.every((t) => allowed.includes(t));
}

export function isPemBlock(value: unknown, options?: { label?: string | string[] }): boolean {
  const s = str(value, 200_000);
  const m =
    s === null
      ? null
      : /^-----BEGIN ([A-Z0-9 ]+)-----\r?\n((?:[A-Za-z0-9+/=]{1,76}\r?\n)+)-----END ([A-Z0-9 ]+)-----\r?\n?$/.exec(
          s
        );
  if (m === null || m[1] !== m[3]) return false;
  const label = opts(options).label;
  if (label !== undefined && !(Array.isArray(label) ? label : [label]).includes(m[1]!))
    return false;
  return isBase64(m[2]!.replace(/\r?\n/g, ''), { padding: 'required' });
}

const SSH_ALGOS =
  'ssh-ed25519|ssh-rsa|ssh-dss|ecdsa-sha2-nistp(?:256|384|521)|sk-ssh-ed25519@openssh\\.com|sk-ecdsa-sha2-nistp256@openssh\\.com';

export function isSshPublicKey(value: unknown): boolean {
  const s = str(value, 16384);
  const m =
    s === null
      ? null
      : new RegExp(`^(?:${SSH_ALGOS}) (AAAA[A-Za-z0-9+/]+={0,3})(?: [^\\r\\n]*)?$`).exec(s);
  return m !== null && isBase64(m[1]!, { padding: 'required' });
}
