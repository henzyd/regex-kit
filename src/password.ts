import { opts, str } from './internal/core.js';

export interface PasswordOptions {
  /** Minimum length in code points. Default 8. */
  minLength?: number;
  /** Maximum length in code points. Default 128. Keep it at 64 or more. */
  maxLength?: number;
  /** Minimum number of lowercase letters. Composition rules are off by default. */
  lowercase?: number;
  uppercase?: number;
  digits?: number;
  symbols?: number;
  /** Reject spaces. Default `false`: spaces are fine in a passphrase. */
  noSpaces?: boolean;
  /** Reject a run of the same character longer than this (`true` means 2). */
  noRepeating?: boolean | number;
}

export type PasswordIssue =
  | 'minLength'
  | 'maxLength'
  | 'lowercase'
  | 'uppercase'
  | 'digits'
  | 'symbols'
  | 'noSpaces'
  | 'noRepeating';

function issues(s: string, o: PasswordOptions): PasswordIssue[] {
  const out: PasswordIssue[] = [];
  const chars = [...s];
  if (chars.length < (o.minLength ?? 8)) out.push('minLength');
  if (chars.length > (o.maxLength ?? 128)) out.push('maxLength');
  const count = (re: RegExp) => chars.filter((c) => re.test(c)).length;
  if (o.lowercase !== undefined && count(/\p{Ll}/u) < o.lowercase) out.push('lowercase');
  if (o.uppercase !== undefined && count(/\p{Lu}/u) < o.uppercase) out.push('uppercase');
  if (o.digits !== undefined && count(/\p{Nd}/u) < o.digits) out.push('digits');
  if (o.symbols !== undefined && count(/[^\p{L}\p{N}\s]/u) < o.symbols) out.push('symbols');
  if (o.noSpaces && /\s/.test(s)) out.push('noSpaces');
  if (o.noRepeating) {
    const max = o.noRepeating === true ? 2 : o.noRepeating;
    let run = 1;
    for (let i = 1; i < chars.length; i++) {
      run = chars[i] === chars[i - 1] ? run + 1 : 1;
      if (run > max) {
        out.push('noRepeating');
        break;
      }
    }
  }
  return out;
}

/**
 * Checks a password against a policy. The default policy is length only; current NIST
 * guidance advises against composition rules, so they are opt-in. This is not a strength
 * meter and it does not check breach lists. Never trim a password before calling it.
 */
export function isPassword(value: unknown, options?: PasswordOptions): boolean {
  const s = str(value, 4096);
  return s !== null && issues(s, opts(options)).length === 0;
}

/** The policy rules a password fails, or `null` if the value is not a string. */
export function getPasswordIssues(
  value: unknown,
  options?: PasswordOptions
): PasswordIssue[] | null {
  if (typeof value !== 'string' || value.length > 4096) return null;
  return issues(value, opts(options));
}

export function isOtp(
  value: unknown,
  options?: { length?: number; alphanumeric?: boolean }
): boolean {
  const s = str(value, 16);
  if (s === null) return false;
  const o = opts(options);
  if (s.length !== (o.length ?? 6)) return false;
  return (o.alphanumeric ? /^[A-Za-z0-9]+$/ : /^\d+$/).test(s);
}

export interface PinOptions {
  /** Exact length, or a `{ min, max }` range. Default 4. */
  length?: number | { min?: number; max?: number };
  /** Reject `0000`, `1234`, `4321`, `1212` and similar. Default `false`. */
  rejectTrivial?: boolean;
}

function trivialPin(s: string): boolean {
  if (/^(\d)\1+$/.test(s)) return true;
  const d = [...s].map(Number);
  const steps = d.slice(1).map((x, i) => (x - d[i]! + 10) % 10);
  if (steps.every((x) => x === 1) || steps.every((x) => x === 9)) return true;
  for (let p = 1; p <= s.length / 2; p++) {
    if (s.length % p === 0 && s === s.slice(0, p).repeat(s.length / p)) return true;
  }
  return false;
}

export function isPin(value: unknown, options?: PinOptions): boolean {
  const s = str(value, 12);
  if (s === null || !/^\d+$/.test(s)) return false;
  const o = opts(options);
  const len = o.length ?? 4;
  const [lo, hi] = typeof len === 'number' ? [len, len] : [len.min ?? 4, len.max ?? 12];
  if (s.length < lo || s.length > hi) return false;
  return !(o.rejectTrivial && trivialPin(s));
}

const B32 = /^[A-Z2-7]+={0,6}$/;

export function isTotpSecret(value: unknown, options?: { strict?: boolean }): boolean {
  const s = str(value, 140);
  if (s === null) return false;
  const v = opts(options).strict ? s : s.replace(/ /g, '');
  if (!opts(options).strict && /^ | $| {2}/.test(s)) return false;
  const body = v.replace(/=+$/, '');
  return B32.test(v) && body.length >= 16 && body.length <= 128;
}

export function isTotpUri(value: unknown): boolean {
  const s = str(value, 1024);
  const m = s === null ? null : /^otpauth:\/\/(totp|hotp)\/([^?#]+)\?([^#]+)$/i.exec(s);
  if (m === null) return false;
  const params = new Map<string, string>();
  for (const p of m[3]!.split('&')) {
    const [k, v, ...rest] = p.split('=');
    if (k === undefined || v === undefined || rest.length > 0) return false;
    params.set(k.toLowerCase(), v);
  }
  if (!isTotpSecret(params.get('secret'))) return false;
  const digits = params.get('digits');
  if (digits !== undefined && !/^[678]$/.test(digits)) return false;
  const period = params.get('period');
  if (period !== undefined && !/^[1-9]\d{0,5}$/.test(period)) return false;
  const alg = params.get('algorithm');
  if (alg !== undefined && !/^(?:SHA1|SHA256|SHA512)$/i.test(alg)) return false;
  if (m[1]!.toLowerCase() === 'hotp') return /^\d{1,20}$/.test(params.get('counter') ?? '');
  return true;
}
