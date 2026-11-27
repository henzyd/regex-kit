import { opts, str, stripSeparators } from './internal/core.js';
import { luhn, mod97, weighted } from './internal/checksum.js';
import { base58CheckValid, bech32Decode, keccak256, toHex, utf8 } from './internal/hash.js';
import { ALPHA2 } from './data/countries.js';
import { CURRENCIES, SPECIAL_CURRENCIES } from './data/currencies.js';
import { IBAN_LENGTH } from './data/iban.js';
import type { Iban } from './types.js';

export type CardBrand =
  | 'visa'
  | 'mastercard'
  | 'amex'
  | 'discover'
  | 'diners'
  | 'jcb'
  | 'unionpay'
  | 'maestro'
  | 'mir'
  | 'verve';

interface Brand {
  name: CardBrand;
  prefix: RegExp;
  lengths: number[];
}

// Order matters where ranges overlap: the more specific brand is listed first.
const BRANDS: Brand[] = [
  {
    name: 'verve',
    prefix:
      /^(?:50(?:6099|61[0-8]\d|619[0-8])|650(?:00[2-9]|01\d|02[0-7])|507(?:86[5-9]|8[7-9]\d|9[0-5]\d|96[0-4]))/,
    lengths: [16, 18, 19]
  },
  { name: 'mir', prefix: /^220[0-4]/, lengths: [16, 17, 18, 19] },
  { name: 'visa', prefix: /^4/, lengths: [13, 16, 19] },
  {
    name: 'mastercard',
    prefix: /^(?:5[1-5]|222[1-9]|22[3-9]\d|2[3-6]\d{2}|27[01]\d|2720)/,
    lengths: [16]
  },
  { name: 'amex', prefix: /^3[47]/, lengths: [15] },
  {
    name: 'discover',
    prefix: /^(?:6011|64[4-9]|65|622(?:12[6-9]|1[3-9]\d|[2-8]\d{2}|9[01]\d|92[0-5]))/,
    lengths: [16, 17, 18, 19]
  },
  { name: 'unionpay', prefix: /^62/, lengths: [16, 17, 18, 19] },
  { name: 'diners', prefix: /^(?:30[0-5]|3095|36|38|39)/, lengths: [14, 15, 16, 17, 18, 19] },
  { name: 'jcb', prefix: /^35(?:2[89]|[3-8]\d)/, lengths: [16, 17, 18, 19] },
  {
    name: 'maestro',
    prefix: /^(?:5018|5020|5038|5893|6304|6759|676[1-3]|0604)/,
    lengths: [12, 13, 14, 15, 16, 17, 18, 19]
  }
];

function brandOf(digits: string, only?: readonly string[]): Brand | null {
  for (const b of BRANDS) {
    if (only !== undefined && !only.includes(b.name)) continue;
    if (b.prefix.test(digits) && b.lengths.includes(digits.length)) return b;
  }
  return null;
}

export interface CreditCardOptions {
  /** Restrict to these brands. Default: any known brand. */
  brands?: CardBrand[];
  /** Accept a Luhn-valid number whose brand is unknown. Default `false`. */
  allowUnknownBrand?: boolean;
  /** Require digits only, with no spaces or dashes. Default `false`. */
  strict?: boolean;
}

export function isCreditCard(value: unknown, options?: CreditCardOptions): boolean {
  const s = str(value, 32);
  if (s === null) return false;
  const o = opts(options);
  const digits = stripSeparators(s, o.strict);
  if (digits === null || !/^\d{12,19}$/.test(digits) || !luhn(digits)) return false;
  if (brandOf(digits, o.brands) !== null) return true;
  return (o.allowUnknownBrand ?? false) && o.brands === undefined;
}

/** The card brand from the number's prefix and length, or `null`. Does not run the Luhn check. */
export function getCardBrand(value: unknown): CardBrand | null {
  const s = str(value, 32);
  if (s === null) return null;
  const digits = s.replace(/[ -]/g, '');
  return /^\d{12,19}$/.test(digits) ? (brandOf(digits)?.name ?? null) : null;
}

export function isCvv(value: unknown, options?: { brand?: CardBrand }): boolean {
  const s = str(value, 4);
  if (s === null || !/^\d{3,4}$/.test(s)) return false;
  const brand = opts(options).brand;
  if (brand === undefined) return true;
  return s.length === (brand === 'amex' ? 4 : 3);
}

/** Digits that pass the Luhn mod-10 check. At least two digits, no separators. */
export function isLuhn(value: unknown): boolean {
  const s = str(value, 64);
  return s !== null && /^\d{2,}$/.test(s) && luhn(s);
}

export interface IbanOptions {
  /** Require the compact form, with no spaces. Default `false`. */
  strict?: boolean;
  /** Accept lowercase letters. Default `false`. */
  allowLowercase?: boolean;
}

export function isIban(value: unknown, options?: IbanOptions): value is Iban {
  const s = str(value, 48);
  if (s === null) return false;
  const o = opts(options);
  if (!o.strict && /^ | $| {2}/.test(s)) return false;
  let v = o.strict ? s : s.replace(/ /g, '');
  if (o.allowLowercase) v = v.toUpperCase();
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(v)) return false;
  const len = Object.hasOwn(IBAN_LENGTH, v.slice(0, 2)) ? IBAN_LENGTH[v.slice(0, 2)] : undefined;
  if (len === undefined || v.length !== len) return false;
  return mod97(v.slice(4) + v.slice(0, 4)) === 1;
}

/** BIC / SWIFT code: 8 or 11 characters. */
export function isBic(value: unknown): boolean {
  const s = str(value, 11);
  return (
    s !== null &&
    /^[A-Z0-9]{4}[A-Z]{2}[A-Z0-9]{2}(?:[A-Z0-9]{3})?$/.test(s) &&
    (ALPHA2.has(s.slice(4, 6)) || s.slice(4, 6) === 'XK')
  );
}

export function isAbaRouting(value: unknown): boolean {
  const s = str(value, 9);
  if (s === null || !/^\d{9}$/.test(s)) return false;
  const prefix = Number(s.slice(0, 2));
  const prefixOk =
    prefix <= 12 ||
    (prefix >= 21 && prefix <= 32) ||
    (prefix >= 61 && prefix <= 72) ||
    prefix === 80;
  return prefixOk && weighted(s, [3, 7, 1, 3, 7, 1, 3, 7, 1]) % 10 === 0;
}

export function isSortCode(value: unknown, options?: { strict?: boolean }): boolean {
  const s = str(value, 8);
  if (s === null) return false;
  if (/^\d{6}$/.test(s)) return true;
  return !opts(options).strict && /^\d{2}[- ]\d{2}[- ]\d{2}$/.test(s);
}

/**
 * Nigerian bank account number. Ten digits; pass the three-digit bank code as the second
 * argument to also verify the check digit (CBN weighted mod 10 scheme).
 */
export function isNuban(value: unknown, bankCode?: unknown): boolean {
  const s = str(value, 10);
  if (s === null || !/^\d{10}$/.test(s)) return false;
  if (bankCode === undefined) return true;
  if (typeof bankCode !== 'string' || !/^\d{3}$/.test(bankCode)) return false;
  const sum = weighted(bankCode + s.slice(0, 9), [3, 7, 3, 3, 7, 3, 3, 7, 3, 3, 7, 3]);
  return (10 - (sum % 10)) % 10 === Number(s[9]);
}

export function isUpiId(value: unknown): boolean {
  const s = str(value, 330);
  return s !== null && /^[A-Za-z0-9._-]{2,256}@[A-Za-z][A-Za-z0-9]{2,64}$/.test(s);
}

const ACCOUNT: Record<string, RegExp> = {
  US: /^\d{4,17}$/,
  GB: /^\d{8}$/,
  CA: /^\d{7,12}$/,
  AU: /^\d{6,10}$/,
  NG: /^\d{10}$/,
  IN: /^\d{9,18}$/,
  ZA: /^\d{9,11}$/,
  GH: /^\d{13}$/,
  KE: /^\d{10,14}$/,
  BR: /^\d{1,13}$/
};

/** Domestic account number shape for a country. Shape only; a short list of countries. */
export function isBankAccount(value: unknown, country?: unknown): boolean {
  const s = str(value, 32);
  if (s === null || typeof country !== 'string') return false;
  const re = Object.hasOwn(ACCOUNT, country.toUpperCase())
    ? ACCOUNT[country.toUpperCase()]
    : undefined;
  return re !== undefined && re.test(s);
}

export function isCurrencyCode(value: unknown, options?: { allowSpecial?: boolean }): boolean {
  const s = str(value, 3);
  if (s === null) return false;
  return CURRENCIES.has(s) || (opts(options).allowSpecial === true && SPECIAL_CURRENCIES.has(s));
}

const B58 = '[1-9A-HJ-NP-Za-km-z]';
const BECH = '[ac-hj-np-z02-9]';

export interface BitcoinOptions {
  /** Verify Base58Check or Bech32 checksums, not just the shape. Default `false`. */
  checksum?: boolean;
}

export function isBitcoinAddress(value: unknown, options?: BitcoinOptions): boolean {
  const s = str(value, 90);
  if (s === null) return false;
  const check = opts(options).checksum ?? false;
  if (new RegExp(`^[13]${B58}{25,34}$`).test(s)) return !check || base58CheckValid(s);
  const lower = s === s.toUpperCase() ? s.toLowerCase() : s;
  if (
    new RegExp(`^bc1q${BECH}{38}$`).test(lower) ||
    new RegExp(`^bc1q${BECH}{58}$`).test(lower) ||
    new RegExp(`^bc1p${BECH}{58}$`).test(lower)
  ) {
    if (!check) return true;
    const d = bech32Decode(lower);
    if (d === null || d.hrp !== 'bc') return false;
    return d.version === 0
      ? d.program === 20 || d.program === 32
      : d.version === 1 && d.program === 32;
  }
  return false;
}

/** EIP-55 mixed-case checksum form of a 40-hex address (no `0x`). */
function eip55(hex: string): string {
  const lower = hex.toLowerCase();
  const h = toHex(keccak256(utf8(lower)));
  let out = '';
  for (let i = 0; i < lower.length; i++) {
    const c = lower[i]!;
    out += /[a-f]/.test(c) && parseInt(h[i]!, 16) >= 8 ? c.toUpperCase() : c;
  }
  return out;
}

export interface EvmOptions {
  /**
   * `true`: a mixed-case address must carry a correct EIP-55 checksum (all-lowercase and
   * all-uppercase pass). `'require'`: the checksum casing is mandatory.
   */
  checksum?: boolean | 'require';
}

export function isEvmAddress(value: unknown, options?: EvmOptions): boolean {
  const s = str(value, 42);
  if (s === null || !/^0x[0-9a-fA-F]{40}$/.test(s)) return false;
  const mode = opts(options).checksum ?? false;
  if (mode === false) return true;
  const hex = s.slice(2);
  const mixed = /[a-f]/.test(hex) && /[A-F]/.test(hex);
  if (mode === 'require') return hex === eip55(hex);
  return !mixed || hex === eip55(hex);
}

export type Chain =
  'bitcoin' | 'ethereum' | 'litecoin' | 'dogecoin' | 'solana' | 'tron' | 'xrp' | 'cosmos';

const RIPPLE = '[rpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz]';

/** Address shape for a named chain. Tron is also checked with Base58Check. */
export function isCryptoAddress(value: unknown, chain?: unknown): boolean {
  const s = str(value, 100);
  if (s === null || typeof chain !== 'string') return false;
  switch (chain) {
    case 'bitcoin':
      return isBitcoinAddress(s);
    case 'ethereum':
      return isEvmAddress(s);
    case 'litecoin':
      return (
        new RegExp(`^[LM3]${B58}{25,34}$`).test(s) || new RegExp(`^ltc1[qp]${BECH}{38,58}$`).test(s)
      );
    case 'dogecoin':
      return new RegExp(`^[DA9]${B58}{33}$`).test(s);
    case 'solana':
      return new RegExp(`^${B58}{32,44}$`).test(s);
    case 'tron':
      return new RegExp(`^T${B58}{33}$`).test(s) && base58CheckValid(s);
    case 'xrp':
      return new RegExp(`^r${RIPPLE}{24,33}$`).test(s);
    case 'cosmos':
      return new RegExp(`^cosmos1${BECH}{38}$`).test(s);
    default:
      return false;
  }
}

/** Transaction hash shape: `evm` (default), `bitcoin`, `solana` or `tron`. */
export function isTxHash(value: unknown, chain?: unknown): boolean {
  const s = str(value, 100);
  if (s === null) return false;
  switch (chain ?? 'evm') {
    case 'evm':
      return /^0x[0-9a-fA-F]{64}$/.test(s);
    case 'bitcoin':
    case 'tron':
      return /^[0-9a-fA-F]{64}$/.test(s);
    case 'solana':
      return new RegExp(`^${B58}{86,88}$`).test(s);
    default:
      return false;
  }
}

// ----------------------------------------------------------------- VAT numbers

const VAT: Record<string, RegExp> = {
  AT: /^ATU\d{8}$/,
  BE: /^BE[01]\d{9}$/,
  BG: /^BG\d{9,10}$/,
  CY: /^CY\d{8}[A-Z]$/,
  CZ: /^CZ\d{8,10}$/,
  DE: /^DE\d{9}$/,
  DK: /^DK\d{8}$/,
  EE: /^EE\d{9}$/,
  EL: /^EL\d{9}$/,
  ES: /^ES[A-Z0-9]\d{7}[A-Z0-9]$/,
  FI: /^FI\d{8}$/,
  FR: /^FR[A-Z0-9]{2}\d{9}$/,
  GB: /^GB(?:\d{9}|\d{12}|GD\d{3}|HA\d{3})$/,
  HR: /^HR\d{11}$/,
  HU: /^HU\d{8}$/,
  IE: /^IE(?:\d{7}[A-W][A-IW]?|\d[A-Z+*]\d{5}[A-W])$/,
  IT: /^IT\d{11}$/,
  LT: /^LT(?:\d{9}|\d{12})$/,
  LU: /^LU\d{8}$/,
  LV: /^LV\d{11}$/,
  MT: /^MT\d{8}$/,
  NL: /^NL\d{9}B\d{2}$/,
  NO: /^NO\d{9}MVA$/,
  PL: /^PL\d{10}$/,
  PT: /^PT\d{9}$/,
  RO: /^RO\d{2,10}$/,
  SE: /^SE\d{12}$/,
  SI: /^SI\d{8}$/,
  SK: /^SK\d{10}$/,
  XI: /^XI(?:\d{9}|\d{12}|GD\d{3}|HA\d{3})$/
};

function vatChecksum(cc: string, v: string): boolean {
  const body = v.slice(2);
  switch (cc) {
    case 'BE': {
      const n = Number(body.slice(0, 8));
      return 97 - (n % 97) === Number(body.slice(8));
    }
    case 'DK':
      return weighted(body, [2, 7, 6, 5, 4, 3, 2, 1]) % 11 === 0;
    case 'IT':
      return luhn(body);
    case 'SE':
      return luhn(body.slice(0, 10)) && body.slice(10) !== '00';
    case 'PL': {
      const sum = weighted(body, [6, 5, 7, 2, 3, 4, 5, 6, 7]) % 11;
      return sum !== 10 && sum === Number(body[9]);
    }
    case 'FI': {
      const sum = weighted(body, [7, 9, 10, 5, 8, 4, 2]) % 11;
      const check = sum === 0 ? 0 : 11 - sum;
      return check !== 10 && check === Number(body[7]);
    }
    case 'FR': {
      if (!/^\d{2}/.test(body)) return true;
      const siren = Number(body.slice(2));
      return (12 + 3 * (siren % 97)) % 97 === Number(body.slice(0, 2));
    }
    case 'DE': {
      let product = 10;
      for (let i = 0; i < 8; i++) {
        let sum = (Number(body[i]) + product) % 10;
        if (sum === 0) sum = 10;
        product = (2 * sum) % 11;
      }
      const check = 11 - product === 10 ? 0 : 11 - product;
      return check === Number(body[8]);
    }
    default:
      return true;
  }
}

/**
 * EU, UK and Norway VAT number including its country prefix (`DE136695976`, Greece is
 * `EL`). Spaces and dots are ignored unless `strict`. Checksums run where the country
 * defines a simple one. No VIES lookup.
 */
export function isVatNumber(
  value: unknown,
  options?: { country?: string; strict?: boolean }
): boolean {
  const s = str(value, 24);
  if (s === null) return false;
  const o = opts(options);
  const v = o.strict ? s : s.replace(/[ .-]/g, '');
  const cc = v.slice(0, 2);
  const re = Object.hasOwn(VAT, cc) ? VAT[cc] : undefined;
  if (re === undefined || !re.test(v)) return false;
  if (o.country !== undefined && o.country.toUpperCase() !== cc) return false;
  return vatChecksum(cc, v);
}

// ---------------------------------------------------------- securities

function expandLetters(s: string): string {
  let out = '';
  for (const c of s) out += c >= 'A' && c <= 'Z' ? String(c.charCodeAt(0) - 55) : c;
  return out;
}

export function isIsin(value: unknown): boolean {
  const s = str(value, 12);
  return s !== null && /^[A-Z]{2}[A-Z0-9]{9}\d$/.test(s) && luhn(expandLetters(s));
}

export function isLei(value: unknown): boolean {
  const s = str(value, 20);
  return s !== null && /^[A-Z0-9]{18}\d{2}$/.test(s) && mod97(s) === 1;
}

export function isCusip(value: unknown): boolean {
  const s = str(value, 9);
  if (s === null || !/^[0-9A-Z*@#]{8}\d$/.test(s)) return false;
  let sum = 0;
  for (let i = 0; i < 8; i++) {
    const c = s[i]!;
    let v = /\d/.test(c)
      ? Number(c)
      : /[A-Z]/.test(c)
        ? c.charCodeAt(0) - 55
        : { '*': 36, '@': 37, '#': 38 }[c]!;
    if (i % 2 === 1) v *= 2;
    sum += Math.floor(v / 10) + (v % 10);
  }
  return (10 - (sum % 10)) % 10 === Number(s[8]);
}

export function isTicker(value: unknown): boolean {
  const s = str(value, 12);
  return s !== null && /^[A-Z][A-Z0-9]{0,5}(?:[.-][A-Z0-9]{1,3})?$/.test(s);
}
