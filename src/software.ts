import { opts, str } from './internal/core.js';
import { SPDX_IDS } from './data/spdx.js';
import { domainOk, ipv4Ok } from './internal/shared.js';
import { isHostPort } from './network.js';
import type { Semver } from './types.js';

const ID = '(?:0|[1-9]\\d*)';
const PRE = '(?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*)';
const SEMVER = new RegExp(
  `^(${ID})\\.(${ID})\\.(${ID})(?:-(${PRE}(?:\\.${PRE})*))?(?:\\+([0-9a-zA-Z-]+(?:\\.[0-9a-zA-Z-]+)*))?$`
);

/** The semver.org pattern. `allowPrefix` accepts a leading `v`. */
export function isSemver(value: unknown, options?: { allowPrefix?: boolean }): value is Semver {
  const s = str(value, 256);
  if (s === null) return false;
  return SEMVER.test(opts(options).allowPrefix && /^v/i.test(s) ? s.slice(1) : s);
}

const PARTIAL =
  '(?:\\d+|[xX*])(?:\\.(?:\\d+|[xX*])){0,2}(?:-[0-9A-Za-z-]+(?:\\.[0-9A-Za-z-]+)*)?(?:\\+[0-9A-Za-z-]+(?:\\.[0-9A-Za-z-]+)*)?';
const COMPARATOR = new RegExp(`^(?:[<>]=?|=|\\^|~>?)?v?${PARTIAL}$`);
const PLAIN_VERSION = new RegExp(`^v?${PARTIAL}$`);

/** npm-style range: `^1.2.3`, `>=1 <2`, `1.x || 2.x`, `1.2.3 - 2.3.4`, `*`. */
export function isSemverRange(value: unknown): boolean {
  const s = str(value, 512);
  if (s === null) return false;
  return s.split('||').every((set) => {
    const toks = set.trim().split(/\s+/).filter(Boolean);
    if (toks.length === 0) return false;
    const merged: string[] = [];
    for (let i = 0; i < toks.length; i++) {
      const t = toks[i]!;
      if (/^(?:[<>]=?|=|\^|~>?)$/.test(t) && i + 1 < toks.length) merged.push(t + toks[++i]!);
      else merged.push(t);
    }
    if (merged.length === 3 && merged[1] === '-') {
      return PLAIN_VERSION.test(merged[0]!) && PLAIN_VERSION.test(merged[2]!);
    }
    return merged.every((t) => COMPARATOR.test(t));
  });
}

const CALVER_TOKENS: Record<string, string> = {
  YYYY: '\\d{4}',
  YY: '\\d{1,2}',
  '0Y': '\\d{2}',
  MM: '(?:[1-9]|1[0-2])',
  '0M': '(?:0[1-9]|1[0-2])',
  DD: '(?:[1-9]|[12]\\d|3[01])',
  '0D': '(?:0[1-9]|[12]\\d|3[01])',
  WW: '(?:[1-9]|[1-4]\\d|5[0-3])',
  '0W': '(?:0[1-9]|[1-4]\\d|5[0-3])',
  MAJOR: '\\d+',
  MINOR: '\\d+',
  MICRO: '\\d+',
  PATCH: '\\d+'
};

/** Calendar version. Pass a `format` such as `YYYY.0M.MICRO` to be exact. */
export function isCalver(value: unknown, options?: { format?: string }): boolean {
  const s = str(value, 64);
  if (s === null) return false;
  const format = opts(options).format;
  if (format === undefined) {
    return /^(?:\d{4}|\d{2})\.\d{1,2}(?:\.\d{1,4})?(?:[-+][0-9A-Za-z.-]+)?$/.test(s);
  }
  const parts = format.split(/([.\-_])/);
  const src = parts.map((p) => (/^[.\-_]$/.test(p) ? `\\${p}` : CALVER_TOKENS[p])).join('');
  if (src.includes('undefined')) return false;
  return new RegExp(`^${src}(?:[-+][0-9A-Za-z.-]+)?$`).test(s);
}

export interface GitCommitHashOptions {
  /** `full` (40 or 64 hex), `short` (abbreviated), or `any` (default). */
  length?: 'full' | 'short' | 'any';
  /** Shortest abbreviation accepted. Default 7. */
  minLength?: number;
}

export function isGitCommitHash(value: unknown, options?: GitCommitHashOptions): boolean {
  const s = str(value, 64);
  if (s === null || !/^[0-9a-fA-F]+$/.test(s)) return false;
  const o = opts(options);
  const full = s.length === 40 || s.length === 64;
  const short = !full && s.length >= (o.minLength ?? 7) && s.length < 64;
  const mode = o.length ?? 'any';
  return mode === 'full' ? full : mode === 'short' ? short : full || short;
}

export function isGitRefName(value: unknown, options?: { allowOneLevel?: boolean }): boolean {
  const s = str(value, 255);
  if (s === null) return false;
  if (!(opts(options).allowOneLevel ?? true) && !s.includes('/')) return false;
  if (s === '@' || s.endsWith('/') || s.endsWith('.') || s.startsWith('/') || s.includes('//'))
    return false;
  if (s.includes('..') || s.includes('@{') || /[\x00-\x20\x7f~^:?*[\\]/.test(s)) return false;
  return s.split('/').every((c) => !c.startsWith('.') && !c.endsWith('.lock'));
}

export function isGitUrl(value: unknown): boolean {
  const s = str(value, 2048);
  if (s === null || /\s/.test(s)) return false;
  const url =
    /^(?:https?|git|ssh|git\+ssh|ssh\+git):\/\/(?:[A-Za-z0-9._~-]+(?::[^@/\s]*)?@)?([^/:\s]+)(?::\d{1,5})?\/[^\s]+$/.exec(
      s
    );
  if (url !== null) return domainOk(url[1]!, { requireTld: false }) || ipv4Ok(url[1]!, false);
  const scp = /^(?:[A-Za-z0-9._-]+@)?([A-Za-z0-9.-]+):(?!\/\/)[^\s]+$/.exec(s);
  return scp !== null && domainOk(scp[1]!, { requireTld: false });
}

const NODE_CORE = new Set(
  'assert buffer child_process cluster console constants crypto dgram diagnostics_channel dns domain events fs http http2 https inspector module net os path perf_hooks process punycode querystring readline repl stream string_decoder sys timers tls trace_events tty url util v8 vm wasi worker_threads zlib'.split(
    ' '
  )
);

export function isNpmPackageName(value: unknown, options?: { allowLegacy?: boolean }): boolean {
  const s = str(value, 214);
  if (s === null || s !== s.trim()) return false;
  const legacy = opts(options).allowLegacy ?? false;
  const cls = legacy ? 'A-Za-z0-9' : 'a-z0-9';
  const re = new RegExp(`^(?:@[${cls}-~][${cls}\\-~._]*/)?[${cls}\\-~][${cls}\\-~._]*$`);
  if (!re.test(s) || s.startsWith('.') || s.startsWith('_')) return false;
  const unscoped = s.startsWith('@') ? null : s;
  if (
    unscoped !== null &&
    (NODE_CORE.has(unscoped) || unscoped === 'node_modules' || unscoped === 'favicon.ico')
  ) {
    return false;
  }
  return !s.split('/').some((p) => p === 'node_modules' || p === 'favicon.ico');
}

export function isPurl(value: unknown): boolean {
  const s = str(value, 1024);
  return (
    s !== null &&
    /^pkg:[a-z][a-z0-9.+-]*\/[^/?#@\s]+(?:\/[^/?#@\s]+)*(?:@[^?#\s]+)?(?:\?[^#\s]+)?(?:#\S+)?$/.test(
      s
    )
  );
}

const PATH_PART = /^[a-z0-9]+(?:(?:[._]|__|-+)[a-z0-9]+)*$/;
const DIGEST = /^[A-Za-z][A-Za-z0-9]*(?:[-_+.][A-Za-z][A-Za-z0-9]*)*:[0-9a-fA-F]{32,}$/;

/** Image reference: `[registry[:port]/]repo[:tag][@digest]`. */
export function isDockerImage(value: unknown): boolean {
  const s = str(value, 512);
  if (s === null) return false;
  let rest = s;
  const at = rest.indexOf('@');
  if (at >= 0) {
    if (!DIGEST.test(rest.slice(at + 1))) return false;
    rest = rest.slice(0, at);
  }
  const lastSlash = rest.lastIndexOf('/');
  const colon = rest.lastIndexOf(':');
  if (colon > lastSlash) {
    if (!/^[\w][\w.-]{0,127}$/.test(rest.slice(colon + 1))) return false;
    rest = rest.slice(0, colon);
  }
  if (rest.length > 255) return false;
  const parts = rest.split('/');
  if (
    parts.length > 1 &&
    (parts[0]!.includes('.') || parts[0]!.includes(':') || parts[0] === 'localhost')
  ) {
    if (!isHostPort(parts[0], { requirePort: false })) return false;
    parts.shift();
  }
  return parts.length > 0 && parts.every((p) => PATH_PART.test(p));
}

export function isDns1123Label(value: unknown): boolean {
  const s = str(value, 63);
  return s !== null && /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(s);
}

export function isDns1123Subdomain(value: unknown): boolean {
  const s = str(value, 253);
  return s !== null && s.split('.').every((l) => isDns1123Label(l));
}

export function isS3BucketName(value: unknown): boolean {
  const s = str(value, 63);
  if (s === null || s.length < 3 || !/^[a-z0-9][a-z0-9.-]*[a-z0-9]$/.test(s) || s.includes('..'))
    return false;
  if (/^\d+\.\d+\.\d+\.\d+$/.test(s)) return false;
  if (/^(?:xn--|sthree-|amzn-s3-demo-)/.test(s)) return false;
  return !/(?:-s3alias|--ol-s3|\.mrap|--x-s3)$/.test(s);
}

export function isAwsArn(value: unknown, options?: { service?: string }): boolean {
  const s = str(value, 2048);
  const m =
    s === null
      ? null
      : /^arn:(aws|aws-cn|aws-us-gov|aws-iso|aws-iso-b):([a-z0-9-]+):([a-z0-9-]*):(\d{12}|aws)?:(\S+)$/.exec(
          s
        );
  if (m === null) return false;
  const service = opts(options).service;
  return service === undefined || m[2] === service;
}

export function isAwsRegion(value: unknown): boolean {
  const s = str(value, 24);
  return s !== null && /^[a-z]{2}(?:-(?:gov|iso[a-z]?))?-[a-z]+-\d$/.test(s);
}

export function isAndroidPackageName(value: unknown): boolean {
  const s = str(value, 255);
  return s !== null && /^[A-Za-z][A-Za-z0-9_]*(?:\.[A-Za-z][A-Za-z0-9_]*)+$/.test(s);
}

export function isIosBundleId(value: unknown): boolean {
  const s = str(value, 155);
  return s !== null && /^[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+$/.test(s);
}

export function isEnvVarName(value: unknown, options?: { allowLowercase?: boolean }): boolean {
  const s = str(value, 256);
  if (s === null) return false;
  return (opts(options).allowLowercase ? /^[A-Za-z_][A-Za-z0-9_]*$/ : /^[A-Z_][A-Z0-9_]*$/).test(s);
}

const RESERVED: Record<string, Set<string>> = {
  js: new Set(
    'await break case catch class const continue debugger default delete do else enum export extends false finally for function if implements import in instanceof interface let new null package private protected public return static super switch this throw true try typeof var void while with yield'.split(
      ' '
    )
  ),
  python: new Set(
    'False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield'.split(
      ' '
    )
  ),
  sql: new Set(
    'select from where insert update delete table drop create alter index join group order by having union'.split(
      ' '
    )
  )
};

export interface IdentifierOptions {
  language?: 'js' | 'python' | 'sql';
  /** Reject reserved words. Default `false`. */
  rejectReserved?: boolean;
}

export function isIdentifier(value: unknown, options?: IdentifierOptions): boolean {
  const s = str(value, 256);
  if (s === null) return false;
  const o = opts(options);
  const lang = o.language ?? 'js';
  const re =
    lang === 'js'
      ? /^[$_\p{ID_Start}][$‌‍\p{ID_Continue}]*$/u
      : lang === 'python'
        ? /^[_\p{ID_Start}][\p{ID_Continue}]*$/u
        : /^[A-Za-z_][A-Za-z0-9_$]*$/;
  if (!re.test(s)) return false;
  return !(o.rejectReserved && RESERVED[lang]!.has(lang === 'sql' ? s.toLowerCase() : s));
}

export function isGraphqlName(value: unknown): boolean {
  const s = str(value, 256);
  return s !== null && /^[_A-Za-z][_0-9A-Za-z]*$/.test(s);
}

/** A shape check for generated schema names. Not an injection defence: parameterise queries. */
export function isSqlIdentifier(value: unknown, options?: { maxLength?: number }): boolean {
  const s = str(value, 256);
  return (
    s !== null && s.length <= (opts(options).maxLength ?? 63) && /^[A-Za-z_][A-Za-z0-9_]*$/.test(s)
  );
}

export function isJsonPointer(value: unknown): boolean {
  const s = str(value, 2048);
  return s !== null && /^(?:\/(?:[^~/]|~[01])*)+$/.test(s);
}

export function isCveId(value: unknown): boolean {
  const s = str(value, 24);
  const m = s === null ? null : /^CVE-(\d{4})-(\d{4,19})$/.exec(s);
  return m !== null && Number(m[1]) >= 1999;
}

export function isSpdxLicenseId(value: unknown): boolean {
  const s = str(value, 64);
  return s !== null && (SPDX_IDS.has(s) || /^LicenseRef-[A-Za-z0-9.-]+$/.test(s));
}

const WIN_RESERVED = /^(?:CON|PRN|AUX|NUL|COM[0-9]|LPT[0-9])(?:\..*)?$/i;

export function isFileName(value: unknown, options?: { maxLength?: number }): boolean {
  const s = str(value, 1024);
  if (s === null || s.length > (opts(options).maxLength ?? 255)) return false;
  if (s === '.' || s === '..' || /[<>:"/\\|?*\x00-\x1f\x7f]/.test(s)) return false;
  if (s.endsWith('.') || s.endsWith(' ') || s.startsWith(' ')) return false;
  return !WIN_RESERVED.test(s);
}

export function isFileExtension(value: unknown, options?: { allowed?: string[] }): boolean {
  const s = str(value, 20);
  if (s === null || !/^\.?[A-Za-z0-9][A-Za-z0-9_+-]{0,15}$/.test(s)) return false;
  const allowed = opts(options).allowed;
  if (allowed === undefined) return true;
  const norm = (x: string) => x.replace(/^\./, '').toLowerCase();
  return allowed.map(norm).includes(norm(s));
}

export function isPosixPath(value: unknown): boolean {
  const s = str(value, 4096);
  return s !== null && !s.includes('\x00') && s.split('/').every((seg) => seg.length <= 255);
}

export function isWindowsPath(value: unknown, options?: { allowLong?: boolean }): boolean {
  const s = str(value, 32768);
  if (s === null || s.length > (opts(options).allowLong ? 32767 : 260)) return false;
  let rest = s;
  if (/^\\\\[^\\/:*?"<>|\s]+\\[^\\/:*?"<>|]+/.test(s)) rest = s.slice(2);
  else if (/^[A-Za-z]:[\\/]/.test(s)) rest = s.slice(3);
  else if (/^[A-Za-z]:/.test(s)) return false;
  if (/[<>:"|?*\x00-\x1f]/.test(rest)) return false;
  return rest
    .split(/[\\/]/)
    .every(
      (seg) =>
        !(seg.endsWith('.') && seg !== '.' && seg !== '..') &&
        !seg.endsWith(' ') &&
        !WIN_RESERVED.test(seg)
    );
}

export function isFilePermission(value: unknown): boolean {
  const s = str(value, 10);
  if (s === null) return false;
  return /^[0-7]{3,4}$/.test(s) || /^[-dlcbps]?[r-][w-][xsS-][r-][w-][xsS-][r-][w-][xtT-]$/.test(s);
}

export function isDataSize(value: unknown): boolean {
  const s = str(value, 24);
  return s !== null && /^\d+(?:\.\d+)? ?(?:[KMGTP]i?B|B)$/i.test(s);
}

const SECRET_PATTERNS: Record<string, RegExp> = {
  aws: /^(?:AKIA|ASIA|AGPA|AIDA|AROA)[0-9A-Z]{16}$/,
  github: /^(?:gh[pousr]_[A-Za-z0-9]{36,255}|github_pat_[A-Za-z0-9_]{82})$/,
  stripe: /^(?:sk|pk|rk)_(?:live|test)_[A-Za-z0-9]{24,}$/,
  slack: /^xox[abprs]-[A-Za-z0-9-]{10,}$/,
  google: /^AIza[0-9A-Za-z_-]{35}$/,
  npm: /^npm_[A-Za-z0-9]{36}$/,
  anthropic: /^sk-ant-[A-Za-z0-9_-]{20,}$/,
  sendgrid: /^SG\.[A-Za-z0-9_-]{22}\.[A-Za-z0-9_-]{43}$/,
  twilio: /^SK[0-9a-f]{32}$/
};

/** Detects strings shaped like well-known provider secrets. Prefixes change; this list is versioned. */
export function isApiKeyLike(value: unknown, options?: { providers?: string[] }): boolean {
  const s = str(value, 300);
  if (s === null) return false;
  const providers = opts(options).providers ?? Object.keys(SECRET_PATTERNS);
  return providers.some((p) => Object.hasOwn(SECRET_PATTERNS, p) && SECRET_PATTERNS[p]!.test(s));
}
