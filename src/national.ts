import { opts, str, stripSeparators } from './internal/core.js';
import { luhn, verhoeff, weighted } from './internal/checksum.js';
import { calendarOk } from './internal/shared.js';
import { isVatNumber } from './financial.js';

export interface StrictOption {
  /** Require the compact form, without separators. Default `false`. */
  strict?: boolean;
}

const digitsOf = (s: string, o: StrictOption | undefined): string | null =>
  stripSeparators(s, opts(o).strict);

const allSame = (s: string): boolean => /^(.)\1*$/.test(s);

// ------------------------------------------------------------------ United States

export function isSsn(value: unknown, options?: StrictOption): boolean {
  const s = str(value, 11);
  const m = s === null ? null : /^(\d{3})(-?)(\d{2})\2(\d{4})$/.exec(s);
  if (m === null || (opts(options).strict && m[2] === '-')) return false;
  const area = Number(m[1]);
  return area !== 0 && area !== 666 && area < 900 && m[3] !== '00' && m[4] !== '0000';
}

const EIN_PREFIXES = new Set(
  '01 02 03 04 05 06 10 11 12 13 14 15 16 20 21 22 23 24 25 26 27 30 31 32 33 34 35 36 37 38 39 40 41 42 43 44 45 46 47 48 50 51 52 53 54 55 56 57 58 59 60 61 62 63 64 65 66 67 68 71 72 73 74 75 76 77 80 81 82 83 84 85 86 87 88 90 91 92 93 94 95 98 99'.split(
    ' '
  )
);

export function isEin(value: unknown, options?: StrictOption): boolean {
  const s = str(value, 10);
  const m = s === null ? null : /^(\d{2})(-?)(\d{7})$/.exec(s);
  return m !== null && !(opts(options).strict && m[2] === '-') && EIN_PREFIXES.has(m[1]!);
}

export function isItin(value: unknown, options?: StrictOption): boolean {
  const s = str(value, 11);
  const m = s === null ? null : /^(9\d{2})(-?)(\d{2})\2(\d{4})$/.exec(s);
  if (m === null || (opts(options).strict && m[2] === '-')) return false;
  const g = Number(m[3]);
  return (
    (g >= 50 && g <= 65) || (g >= 70 && g <= 88) || (g >= 90 && g <= 92) || (g >= 94 && g <= 99)
  );
}

// ---------------------------------------------------------------- United Kingdom

const NINO_BAD = new Set(['BG', 'GB', 'KN', 'NK', 'NT', 'TN', 'ZZ']);

export function isNino(value: unknown, options?: StrictOption): boolean {
  const s = str(value, 13);
  if (s === null) return false;
  const strict = opts(options).strict ?? false;
  const ok = strict
    ? /^[A-Z]{2}\d{6}[A-D]?$/.test(s)
    : /^[A-Z]{2}(?: ?\d{2}){3}(?: ?[A-D])?$/.test(s);
  if (!ok) return false;
  const v = s.replace(/ /g, '');
  return /^[A-CEGHJ-PR-TW-Z][A-CEGHJ-NPR-TW-Z]/.test(v) && !NINO_BAD.has(v.slice(0, 2));
}

const COMPANY_PREFIXES = new Set(
  'AC BR CE CS FC GE GN ID IP LP NC NF NI NL NO NP OC OE PC R0 RC SA SC SE SF SG SI SL SO SP SR ZC'.split(
    ' '
  )
);

export function isUkCompanyNumber(value: unknown): boolean {
  const s = str(value, 8);
  if (s === null) return false;
  return /^\d{8}$/.test(s) || (/^[A-Z0-9]{2}\d{6}$/.test(s) && COMPANY_PREFIXES.has(s.slice(0, 2)));
}

// -------------------------------------------------------------------------- Canada

export function isSin(value: unknown, options?: StrictOption): boolean {
  const s = str(value, 11);
  if (s === null) return false;
  const d = digitsOf(s, options);
  return d !== null && /^[1-79]\d{8}$/.test(d) && luhn(d);
}

// ------------------------------------------------------------------------ Nigeria

/** National Identification Number: 11 digits. NIMC publishes no check digit. */
export function isNin(value: unknown): boolean {
  const s = str(value, 11);
  return s !== null && /^\d{11}$/.test(s);
}

/** Bank Verification Number: 11 digits. */
export function isBvn(value: unknown): boolean {
  const s = str(value, 11);
  return s !== null && /^\d{11}$/.test(s);
}

/** Tax Identification Number. The accepted shapes are not formally published; see the test notes. */
export function isNigeriaTin(value: unknown): boolean {
  const s = str(value, 13);
  return s !== null && /^(?:\d{8}-\d{4}|\d{10}|\d{12})$/.test(s);
}

// -------------------------------------------------------------------------- India

export function isAadhaar(value: unknown, options?: StrictOption): boolean {
  const s = str(value, 14);
  if (s === null) return false;
  const d = digitsOf(s, options);
  return d !== null && /^[2-9]\d{11}$/.test(d) && verhoeff(d);
}

export function isPan(value: unknown): boolean {
  const s = str(value, 10);
  return s !== null && /^[A-Z]{3}[ABCFGHLJPT][A-Z]\d{4}[A-Z]$/.test(s);
}

const GST_ALPHA = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function isGstin(value: unknown): boolean {
  const s = str(value, 15);
  if (s === null || !/^\d{2}[A-Z]{3}[ABCFGHLJPT][A-Z]\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(s))
    return false;
  const state = Number(s.slice(0, 2));
  if (!((state >= 1 && state <= 38) || state === 97 || state === 99)) return false;
  let sum = 0;
  for (let i = 0; i < 14; i++) {
    const v = GST_ALPHA.indexOf(s[i]!) * (i % 2 === 0 ? 1 : 2);
    sum += Math.floor(v / 36) + (v % 36);
  }
  return GST_ALPHA[(36 - (sum % 36)) % 36] === s[14];
}

export function isIfsc(value: unknown): boolean {
  const s = str(value, 11);
  return s !== null && /^[A-Z]{4}0[A-Z0-9]{6}$/.test(s);
}

// -------------------------------------------------------------------------- Brazil

function cpfDigit(nums: number[]): number {
  let sum = 0;
  for (let i = 0; i < nums.length; i++) sum += nums[i]! * (nums.length + 1 - i);
  const r = sum % 11;
  return r < 2 ? 0 : 11 - r;
}

export function isCpf(value: unknown, options?: StrictOption): boolean {
  const s = str(value, 14);
  if (s === null) return false;
  const masked = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(s);
  if (masked && opts(options).strict) return false;
  if (!masked && !/^\d{11}$/.test(s)) return false;
  const d = s.replace(/\D/g, '');
  if (allSame(d)) return false;
  const nums = [...d].map(Number);
  return cpfDigit(nums.slice(0, 9)) === nums[9] && cpfDigit(nums.slice(0, 10)) === nums[10];
}

/**
 * CNPJ, including the alphanumeric format issued from 31 July 2026: twelve characters of
 * `0-9A-Z`, then two numeric check digits. Each character's value is its ASCII code minus 48.
 */
export function isCnpj(value: unknown, options?: StrictOption): boolean {
  const s = str(value, 18);
  if (s === null) return false;
  const masked = /^[0-9A-Z]{2}\.[0-9A-Z]{3}\.[0-9A-Z]{3}\/[0-9A-Z]{4}-\d{2}$/.test(s);
  if (masked && opts(options).strict) return false;
  if (!masked && !/^[0-9A-Z]{12}\d{2}$/.test(s)) return false;
  const c = s.replace(/[./-]/g, '');
  if (allSame(c)) return false;
  const vals = [...c].map((ch) => ch.charCodeAt(0) - 48);
  const w = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const dv = (v: number[], weights: number[]) => {
    const r = v.reduce((acc, x, i) => acc + x * weights[i]!, 0) % 11;
    return r < 2 ? 0 : 11 - r;
  };
  const d1 = dv(vals.slice(0, 12), w);
  const d2 = dv(vals.slice(0, 13), [6, ...w]);
  return d1 === vals[12] && d2 === vals[13];
}

// -------------------------------------------------------------------------- Spain

const DNI_LETTERS = 'TRWAGMYFPDXBNJZSQVHLCKE';

export function isDni(value: unknown, options?: StrictOption): boolean {
  const s = str(value, 10);
  const m = s === null ? null : /^(\d{8})(-?)([A-Z])$/.exec(s);
  return (
    m !== null && !(opts(options).strict && m[2] === '-') && DNI_LETTERS[Number(m[1]) % 23] === m[3]
  );
}

export function isNie(value: unknown, options?: StrictOption): boolean {
  const s = str(value, 11);
  const m = s === null ? null : /^([XYZ])(\d{7})(-?)([A-Z])$/.exec(s);
  if (m === null || (opts(options).strict && m[3] === '-')) return false;
  const n = Number(`${'XYZ'.indexOf(m[1]!)}${m[2]}`);
  return DNI_LETTERS[n % 23] === m[4];
}

export function isCif(value: unknown): boolean {
  const s = str(value, 9);
  if (s === null || !/^[ABCDEFGHJNPQRSUVW]\d{7}[0-9A-J]$/.test(s)) return false;
  let sum = 0;
  for (let i = 0; i < 7; i++) {
    let n = Number(s[i + 1]);
    if (i % 2 === 0) {
      n *= 2;
      n = Math.floor(n / 10) + (n % 10);
    }
    sum += n;
  }
  const control = (10 - (sum % 10)) % 10;
  const letter = 'JABCDEFGHI'[control]!;
  const last = s[8]!;
  if ('PQRSNW'.includes(s[0]!)) return last === letter;
  if ('ABEH'.includes(s[0]!)) return last === String(control);
  return last === String(control) || last === letter;
}

// ------------------------------------------------------------------------- France

export function isNir(value: unknown, options?: StrictOption): boolean {
  const s = str(value, 21);
  if (s === null) return false;
  const d = digitsOf(s, options);
  const m =
    d === null ? null : /^([12]\d{2}(?:0[1-9]|1[0-2]|[2-9]\d)(?:\d{2}|2A|2B)\d{6})(\d{2})$/.exec(d);
  if (m === null) return false;
  const base = Number(m[1]!.replace('2A', '19').replace('2B', '18'));
  return 97 - Number(base % 97) === Number(m[2]);
}

export function isSiren(value: unknown, options?: StrictOption): boolean {
  const s = str(value, 11);
  if (s === null) return false;
  const d = digitsOf(s, options);
  return d !== null && /^\d{9}$/.test(d) && luhn(d);
}

export function isSiret(value: unknown, options?: StrictOption): boolean {
  const s = str(value, 17);
  if (s === null) return false;
  const d = digitsOf(s, options);
  if (d === null || !/^\d{14}$/.test(d)) return false;
  // La Poste establishments use a sum-of-digits rule instead of Luhn.
  if (d.startsWith('356000000')) return [...d].reduce((a, x) => a + Number(x), 0) % 5 === 0;
  return luhn(d);
}

// ------------------------------------------------------------------------ Germany

export function isSteuerId(value: unknown, options?: StrictOption): boolean {
  const s = str(value, 14);
  if (s === null) return false;
  const d = digitsOf(s, options);
  if (d === null || !/^[1-9]\d{10}$/.test(d)) return false;
  const counts = new Map<string, number>();
  for (const c of d.slice(0, 10)) counts.set(c, (counts.get(c) ?? 0) + 1);
  const repeated = [...counts.values()].filter((n) => n > 1);
  if (repeated.length !== 1 || repeated[0]! > 3) return false;
  if (repeated[0] === 3 && /(\d)\1\1/.test(d.slice(0, 10))) return false;
  let product = 10;
  for (let i = 0; i < 10; i++) {
    let sum = (Number(d[i]) + product) % 10;
    if (sum === 0) sum = 10;
    product = (2 * sum) % 11;
  }
  const check = 11 - product === 10 ? 0 : 11 - product;
  return check === Number(d[10]);
}

/** German VAT number (`DE` plus nine digits). Shares its checksum with `isVatNumber`. */
export function isUstId(value: unknown, options?: StrictOption): boolean {
  return isVatNumber(value, { country: 'DE', strict: opts(options).strict });
}

// -------------------------------------------------------------------------- Italy

const CF_ODD: Record<string, number> = {};
'0123456789'.split('').forEach((c, i) => (CF_ODD[c] = [1, 0, 5, 7, 9, 13, 15, 17, 19, 21][i]!));
'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  .split('')
  .forEach(
    (c, i) =>
      (CF_ODD[c] = [
        1, 0, 5, 7, 9, 13, 15, 17, 19, 21, 2, 4, 18, 20, 11, 3, 6, 8, 12, 14, 16, 10, 22, 25, 24, 23
      ][i]!)
  );
const OMOCODIA = 'LMNPQRSTUV';

export function isCodiceFiscale(value: unknown): boolean {
  const s = str(value, 16);
  if (s === null) return false;
  if (
    !/^[A-Z]{6}[\dLMNPQRSTUV]{2}[ABCDEHLMPRST][\dLMNPQRSTUV]{2}[A-Z][\dLMNPQRSTUV]{3}[A-Z]$/.test(s)
  ) {
    return false;
  }
  const digit = (c: string) => (OMOCODIA.includes(c) ? String(OMOCODIA.indexOf(c)) : c);
  const day = Number(digit(s[9]!) + digit(s[10]!));
  if (!((day >= 1 && day <= 31) || (day >= 41 && day <= 71))) return false;
  let sum = 0;
  for (let i = 0; i < 15; i++) {
    const c = s[i]!;
    sum += i % 2 === 0 ? CF_ODD[c]! : /\d/.test(c) ? Number(c) : c.charCodeAt(0) - 65;
  }
  return String.fromCharCode(65 + (sum % 26)) === s[15];
}

export function isPartitaIva(value: unknown, options?: StrictOption): boolean {
  const s = str(value, 13);
  if (s === null) return false;
  const d = digitsOf(s, options);
  return d !== null && /^\d{11}$/.test(d) && !/^0+$/.test(d.slice(0, 7)) && luhn(d);
}

// ------------------------------------------------------------------- Netherlands

export function isBsn(value: unknown, options?: StrictOption): boolean {
  const s = str(value, 11);
  if (s === null) return false;
  const d = digitsOf(s, options);
  if (d === null || !/^\d{8,9}$/.test(d)) return false;
  const n = d.padStart(9, '0');
  if (/^0+$/.test(n)) return false;
  return weighted(n, [9, 8, 7, 6, 5, 4, 3, 2, -1]) % 11 === 0;
}

// -------------------------------------------------------------------------- Poland

export function isPesel(value: unknown): boolean {
  const s = str(value, 11);
  if (s === null || !/^\d{11}$/.test(s)) return false;
  const yy = Number(s.slice(0, 2));
  let mm = Number(s.slice(2, 4));
  const dd = Number(s.slice(4, 6));
  const century = [1900, 2000, 2100, 2200, 1800][Math.floor(mm / 20)]!;
  mm %= 20;
  if (!calendarOk(century + yy, mm, dd)) return false;
  const sum = weighted(s, [1, 3, 7, 9, 1, 3, 7, 9, 1, 3]);
  return (10 - (sum % 10)) % 10 === Number(s[10]);
}

export function isNip(value: unknown, options?: StrictOption): boolean {
  const s = str(value, 13);
  if (s === null) return false;
  const d = digitsOf(s, options);
  if (d === null || !/^\d{10}$/.test(d)) return false;
  const r = weighted(d, [6, 5, 7, 2, 3, 4, 5, 6, 7]) % 11;
  return r !== 10 && r === Number(d[9]);
}

export function isRegon(value: unknown): boolean {
  const s = str(value, 14);
  if (s === null) return false;
  const w9 = [8, 9, 2, 3, 4, 5, 6, 7];
  const w14 = [2, 4, 8, 5, 0, 9, 7, 3, 6, 1, 2, 4, 8];
  const check = (d: string, w: number[]) => {
    const r = weighted(d, w) % 11;
    return (r === 10 ? 0 : r) === Number(d[w.length]);
  };
  if (/^\d{9}$/.test(s)) return check(s, w9);
  return /^\d{14}$/.test(s) && check(s, w14) && check(s.slice(0, 9), w9);
}

// ------------------------------------------------------------------------- Sweden

export function isPersonnummer(value: unknown): boolean {
  const s = str(value, 13);
  const m = s === null ? null : /^(\d{2})?(\d{2})(\d{2})(\d{2})([-+]?)(\d{3})(\d)$/.exec(s);
  if (m === null) return false;
  const mm = Number(m[3]);
  let dd = Number(m[4]);
  if (dd > 60) dd -= 60;
  const years =
    m[1] !== undefined
      ? [Number(m[1]) * 100 + Number(m[2])]
      : [1900 + Number(m[2]), 2000 + Number(m[2])];
  if (!years.some((y) => calendarOk(y, mm, dd))) return false;
  return luhn(`${m[2]}${m[3]}${m[4]}${m[6]}${m[7]}`);
}

// ------------------------------------------------------------------------- Mexico

const CURP_ALPHA = '0123456789ABCDEFGHIJKLMNÑOPQRSTUVWXYZ';
const MX_STATES = new Set(
  'AS BC BS CC CL CM CS CH DF DG GT GR HG JC MC MN MS NT NL OC PL QT QR SP SL SR TC TS TL VZ YN ZS NE'.split(
    ' '
  )
);

export function isCurp(value: unknown): boolean {
  const s = str(value, 18);
  const m =
    s === null
      ? null
      : /^[A-Z][AEIOUX][A-Z]{2}(\d{2})(\d{2})(\d{2})[HMX]([A-Z]{2})[B-DF-HJ-NP-TV-Z]{3}[A-Z\d]\d$/.exec(
          s
        );
  if (m === null || !MX_STATES.has(m[4]!)) return false;
  const century = /\d/.test(s![16]!) ? 1900 : 2000;
  if (!calendarOk(century + Number(m[1]), Number(m[2]), Number(m[3]))) return false;
  let sum = 0;
  for (let i = 0; i < 17; i++) sum += CURP_ALPHA.indexOf(s![i]!) * (18 - i);
  return (10 - (sum % 10)) % 10 === Number(s![17]);
}

/** Mexican RFC (tax id): 12 characters for companies, 13 for individuals. Shape and date only. */
export function isRfcMx(value: unknown): boolean {
  const s = str(value, 13);
  const m = s === null ? null : /^[A-ZÑ&]{3,4}(\d{2})(\d{2})(\d{2})[A-Z\d]{3}$/.exec(s);
  return (
    m !== null && [1900, 2000].some((c) => calendarOk(c + Number(m[1]), Number(m[2]), Number(m[3])))
  );
}

// ---------------------------------------------------------------------- Australia

export function isTfn(value: unknown, options?: StrictOption): boolean {
  const s = str(value, 11);
  if (s === null) return false;
  const d = digitsOf(s, options);
  return d !== null && /^\d{9}$/.test(d) && weighted(d, [1, 4, 3, 7, 5, 8, 6, 9, 10]) % 11 === 0;
}

export function isAbn(value: unknown, options?: StrictOption): boolean {
  const s = str(value, 14);
  if (s === null) return false;
  const d = digitsOf(s, options);
  if (d === null || !/^\d{11}$/.test(d) || d.startsWith('0')) return false;
  const adjusted = `${Number(d[0]) - 1}${d.slice(1)}`;
  return weighted(adjusted, [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19]) % 89 === 0;
}

// ---------------------------------------------------------------- China, Japan, Korea

export function isChineseId(value: unknown): boolean {
  const s = str(value, 18);
  const m = s === null ? null : /^[1-8]\d{5}((?:19|20)\d{2})(\d{2})(\d{2})\d{3}[\dX]$/.exec(s);
  if (m === null || !calendarOk(Number(m[1]), Number(m[2]), Number(m[3]))) return false;
  const sum = weighted(s!, [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]);
  return '10X98765432'[sum % 11] === s![17];
}

export function isMyNumber(value: unknown, options?: StrictOption): boolean {
  const s = str(value, 14);
  if (s === null) return false;
  const d = digitsOf(s, options);
  if (d === null || !/^\d{12}$/.test(d)) return false;
  let q = 0;
  for (let i = 1; i <= 11; i++) q += Number(d[11 - i]) * (i <= 6 ? i + 1 : i - 5);
  const r = q % 11;
  return (r <= 1 ? 0 : 11 - r) === Number(d[11]);
}

export interface RrnOptions {
  /** Verify the check digit. Numbers issued after October 2020 have none. Default `false`. */
  checksum?: boolean;
}

export function isRrn(value: unknown, options?: RrnOptions): boolean {
  const s = str(value, 14);
  const m = s === null ? null : /^(\d{2})(\d{2})(\d{2})-?([0-9])(\d{6})$/.exec(s);
  if (m === null) return false;
  const g = Number(m[4]);
  const century = [1900, 1900, 1900, 2000, 2000, 1900, 1900, 2000, 2000, 1800][g]!;
  if (!calendarOk(century + Number(m[1]), Number(m[2]), Number(m[3])) || g === 0) return false;
  if (!opts(options).checksum) return true;
  const d = s!.replace('-', '');
  return (11 - (weighted(d, [2, 3, 4, 5, 6, 7, 8, 9, 2, 3, 4, 5]) % 11)) % 10 === Number(d[12]);
}

// ---------------------------------------------------------------------- Singapore

const NRIC_ST = 'JZIHGFEDCBA';
const NRIC_FG = 'XWUTRQPNMLK';
const NRIC_M = 'KLJNPQRTUWX';

export function isNric(value: unknown): boolean {
  const s = str(value, 9);
  if (s === null || !/^[STFGM]\d{7}[A-Z]$/.test(s)) return false;
  let sum = weighted(s.slice(1, 8), [2, 7, 6, 5, 4, 3, 2]);
  if (s[0] === 'T' || s[0] === 'G') sum += 4;
  if (s[0] === 'M') sum += 3;
  const table = 'ST'.includes(s[0]!) ? NRIC_ST : s[0] === 'M' ? NRIC_M : NRIC_FG;
  return table[sum % 11] === s[8];
}

export function isUen(value: unknown): boolean {
  const s = str(value, 10);
  return s !== null && /^(?:\d{8}[A-Z]|\d{9}[A-Z]|[TSR]\d{2}[A-Z]{2}\d{4}[A-Z])$/.test(s);
}

// ------------------------------------------------------------------------- Africa

export function isSaId(value: unknown): boolean {
  const s = str(value, 13);
  const m = s === null ? null : /^(\d{2})(\d{2})(\d{2})\d{4}([01])\d{2}$/.exec(s);
  if (m === null) return false;
  const ok = [1900, 2000].some((c) => calendarOk(c + Number(m[1]), Number(m[2]), Number(m[3])));
  return ok && luhn(s!);
}

export function isKraPin(value: unknown): boolean {
  const s = str(value, 11);
  return s !== null && /^[AP]\d{9}[A-Z]$/.test(s);
}

export function isKenyaId(value: unknown): boolean {
  const s = str(value, 8);
  return s !== null && /^\d{7,8}$/.test(s);
}

export function isGhanaCard(value: unknown): boolean {
  const s = str(value, 15);
  return s !== null && /^GHA-\d{9}-\d$/.test(s);
}

// ---------------------------------------------------------- UAE, Turkey, Argentina

export function isEmiratesId(value: unknown, options?: StrictOption): boolean {
  const s = str(value, 18);
  if (s === null) return false;
  const masked = /^784-\d{4}-\d{7}-\d$/.test(s);
  if (masked && opts(options).strict) return false;
  if (!masked && !/^784\d{12}$/.test(s)) return false;
  return luhn(s.replace(/-/g, ''));
}

export function isUaeTrn(value: unknown): boolean {
  const s = str(value, 15);
  return s !== null && /^\d{15}$/.test(s);
}

export function isTckn(value: unknown): boolean {
  const s = str(value, 11);
  if (s === null || !/^[1-9]\d{10}$/.test(s)) return false;
  const n = [...s].map(Number);
  const d10 =
    ((((n[0]! + n[2]! + n[4]! + n[6]! + n[8]!) * 7 - (n[1]! + n[3]! + n[5]! + n[7]!)) % 10) + 10) %
    10;
  return d10 === n[9] && n.slice(0, 10).reduce((a, b) => a + b, 0) % 10 === n[10];
}

export function isVkn(value: unknown): boolean {
  const s = str(value, 10);
  if (s === null || !/^\d{10}$/.test(s)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    const tmp = (Number(s[i]) + (9 - i)) % 10;
    let v = (tmp * 2 ** (9 - i)) % 9;
    if (tmp !== 0 && v === 0) v = 9;
    sum += v;
  }
  return (10 - (sum % 10)) % 10 === Number(s[9]);
}

export function isCuit(value: unknown, options?: StrictOption): boolean {
  const s = str(value, 13);
  if (s === null) return false;
  const d = digitsOf(s, options);
  if (d === null || !/^(?:20|23|24|27|30|33|34)\d{9}$/.test(d)) return false;
  const dd = 11 - (weighted(d, [5, 4, 3, 2, 7, 6, 5, 4, 3, 2]) % 11);
  return dd !== 10 && (dd === 11 ? 0 : dd) === Number(d[10]);
}

export function isDniAr(value: unknown, options?: { strict?: boolean }): boolean {
  const s = str(value, 10);
  if (s === null) return false;
  if (/^\d{7,8}$/.test(s)) return true;
  return !opts(options).strict && /^\d{1,2}\.\d{3}\.\d{3}$/.test(s);
}
