import { opts, str } from './internal/core.js';
import { isSnowflakeId } from './identifiers.js';

export function isYoutubeVideoId(value: unknown, options?: { allowUrl?: boolean }): boolean {
  const s = str(value, 200);
  if (s === null) return false;
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return true;
  if (!opts(options).allowUrl) return false;
  return /^https?:\/\/(?:(?:www|m|music)\.)?(?:youtube\.com\/(?:watch\?(?:[^#\s]*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)[A-Za-z0-9_-]{11}(?:[?&#][^\s]*)?$/.test(
    s
  );
}

export function isGithubUsername(value: unknown): boolean {
  const s = str(value, 39);
  return s !== null && /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}$/.test(s);
}

export function isGithubRepo(value: unknown): boolean {
  const s = str(value, 140);
  if (s === null) return false;
  const [owner, repo, ...rest] = s.split('/');
  return (
    rest.length === 0 &&
    owner !== undefined &&
    repo !== undefined &&
    isGithubUsername(owner) &&
    /^[A-Za-z0-9._-]{1,100}$/.test(repo) &&
    repo !== '.' &&
    repo !== '..'
  );
}

export function isSlackId(value: unknown): boolean {
  const s = str(value, 13);
  return s !== null && /^[UWCGDTBEF][A-Z0-9]{8,12}$/.test(s);
}

/** A Discord snowflake, with the Discord epoch check available through `{ epoch: true }`. */
export function isDiscordId(value: unknown, options?: { epoch?: boolean }): boolean {
  return (
    isSnowflakeId(value, opts(options).epoch ? { epoch: 1420070400000 } : undefined) &&
    String(value).length >= 17
  );
}

export function isTwitterHandle(value: unknown): boolean {
  const s = str(value, 16);
  return s !== null && /^@?[A-Za-z0-9_]{1,15}$/.test(s);
}

export function isInstagramHandle(value: unknown): boolean {
  const s = str(value, 31);
  if (s === null) return false;
  const name = s.startsWith('@') ? s.slice(1) : s;
  return (
    /^[A-Za-z0-9._]{1,30}$/.test(name) &&
    !name.startsWith('.') &&
    !name.endsWith('.') &&
    !name.includes('..')
  );
}

export function isLinkedinUrl(value: unknown): boolean {
  const s = str(value, 300);
  return (
    s !== null &&
    /^https?:\/\/(?:[a-z]{2,3}\.)?linkedin\.com\/(?:in|pub|company|school)\/[A-Za-z0-9\-_%.]+\/?(?:\?[^\s#]*)?$/.test(
      s
    )
  );
}

const STRIPE_PREFIXES =
  'cus|pi|sub|price|prod|ch|in|evt|re|pm|seti|src|card|acct|txn|po|ii|si|cs|plan|tok|py|pyr|dp|cn|link|ba|fee|file|cs_live|cs_test|whsec|rk|sk|pk|ic|ipi|iauth|ich|tr|trr|prv|pmc|sku|sli|cbtxn|obj|ord|or|orm|ppage|tax|txr|txi|tm|tmr|vf|mbf|mbt|mi|mr|setatt|pca|rcpt|issfr|itcard|ca|ba|bank|btok|ctok|pyr|tbtxn'
    .split('|')
    .join('|');

/** `cus_...`, `pi_...`, `sub_...` and similar Stripe object ids. The prefix list is versioned. */
export function isStripeId(value: unknown, options?: { prefix?: string }): boolean {
  const s = str(value, 80);
  const m = s === null ? null : new RegExp(`^(${STRIPE_PREFIXES})_[A-Za-z0-9]{8,64}$`).exec(s);
  if (m === null) return false;
  const p = opts(options).prefix;
  return p === undefined || m[1] === p;
}

export function isStripeSignature(value: unknown): boolean {
  const s = str(value, 400);
  return s !== null && /^t=\d{1,12},v1=[0-9a-f]{64}(?:,v\d+=[0-9a-f]{64})*$/.test(s);
}
