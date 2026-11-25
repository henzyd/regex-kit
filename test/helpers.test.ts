import { describe, expect, it } from 'vitest';
import {
  all,
  any,
  checkCreditCard,
  checkEmail,
  escapeRegExp,
  isApiKeyLike,
  isEmail,
  isInteger,
  isPhoneE164,
  isUrl,
  listOf,
  matches,
  not,
  optional,
  standardSchema
} from '../src/index.js';

describe('optional', () => {
  const email = optional(isEmail);
  it('accepts undefined, null and the empty string', () => {
    expect(email(undefined)).toBe(true);
    expect(email(null)).toBe(true);
    expect(email('')).toBe(true);
  });
  it('otherwise runs the check', () => {
    expect(email('ada@example.com')).toBe(true);
    expect(email('nope')).toBe(false);
    expect(email(0)).toBe(false);
  });
  it('passes options through', () => {
    expect(optional(isUrl)('example.com', { requireProtocol: false })).toBe(true);
    expect(optional(isUrl)('example.com')).toBe(false);
  });
});

describe('all, any, not', () => {
  it('all needs every check', () => {
    const check = all(isEmail, (v) => typeof v === 'string' && v.endsWith('.com'));
    expect(check('a@b.com')).toBe(true);
    expect(check('a@b.org')).toBe(false);
    expect(all()('anything')).toBe(true);
  });
  it('any needs one check', () => {
    const contact = any(isEmail, isPhoneE164);
    expect(contact('a@b.com')).toBe(true);
    expect(contact('+14155552671')).toBe(true);
    expect(contact('neither')).toBe(false);
    expect(any()('anything')).toBe(false);
  });
  it('not inverts and keeps arguments', () => {
    expect(not(isEmail)('nope')).toBe(true);
    expect(not(isEmail)('a@b.com')).toBe(false);
    expect(not(isInteger)('5', { min: 10 })).toBe(true);
  });
});

describe('listOf', () => {
  const emails = listOf(isEmail, { min: 1, max: 2 });
  it('checks every element and the length', () => {
    expect(emails(['a@b.com'])).toBe(true);
    expect(emails(['a@b.com', 'c@d.org'])).toBe(true);
    expect(emails([])).toBe(false);
    expect(emails(['a@b.com', 'c@d.org', 'e@f.io'])).toBe(false);
    expect(emails(['a@b.com', 'bad'])).toBe(false);
  });
  it('rejects non-arrays', () => {
    expect(emails('a@b.com')).toBe(false);
    expect(emails(undefined)).toBe(false);
    expect(listOf(isEmail)([])).toBe(true);
  });
});

describe('matches', () => {
  it('wraps a RegExp with the same guards as the built-ins', () => {
    const hex = matches(/^[0-9a-f]+$/);
    expect(hex('dead')).toBe(true);
    expect(hex('xyz')).toBe(false);
    expect(hex('')).toBe(false);
    expect(hex(12)).toBe(false);
    expect(hex('a'.repeat(5000))).toBe(false);
    expect(matches(/^a+$/, { maxLength: 5000 })('a'.repeat(5000))).toBe(true);
  });
  it('is not confused by global or sticky flags', () => {
    const g = matches(/a/g);
    expect([g('a'), g('a'), g('a')]).toEqual([true, true, true]);
    const y = matches(/a/y);
    expect([y('a'), y('a')]).toEqual([true, true]);
  });
});

describe('standardSchema', () => {
  const schema = standardSchema(isEmail, 'Not an email');
  it('has the Standard Schema shape', () => {
    expect(schema['~standard'].version).toBe(1);
    expect(schema['~standard'].vendor).toBe('regex-kit');
  });
  it('returns a value or issues', () => {
    expect(schema['~standard'].validate('a@b.com')).toEqual({ value: 'a@b.com' });
    expect(schema['~standard'].validate('nope')).toEqual({ issues: [{ message: 'Not an email' }] });
    expect(standardSchema(isEmail)['~standard'].validate(1)).toEqual({
      issues: [{ message: 'Invalid value' }]
    });
  });
});

describe('checkEmail', () => {
  it('passes valid addresses', () => {
    expect(checkEmail('ada@example.com')).toEqual({ ok: true });
  });
  it('says why an address failed', () => {
    expect(checkEmail(42)).toEqual({ ok: false, reason: 'type' });
    expect(checkEmail('')).toEqual({ ok: false, reason: 'empty' });
    expect(checkEmail('plain')).toEqual({ ok: false, reason: 'noAt' });
    expect(checkEmail('a b@example.com')).toEqual({ ok: false, reason: 'localPart' });
    expect(checkEmail('@example.com')).toEqual({ ok: false, reason: 'localPart' });
    expect(checkEmail('ada@nodot')).toEqual({ ok: false, reason: 'domain' });
    expect(checkEmail('ada@-bad.com')).toEqual({ ok: false, reason: 'domain' });
    expect(checkEmail('a'.repeat(400))).toEqual({ ok: false, reason: 'tooLong' });
  });
  it('agrees with isEmail and honours options', () => {
    for (const v of ['ada@example.com', 'ada@', 'x', 'a@b', 'jürgen@example.com']) {
      expect(checkEmail(v).ok).toBe(isEmail(v));
    }
    expect(checkEmail('jürgen@example.com', { allowUnicode: true })).toEqual({ ok: true });
  });
});

describe('checkCreditCard', () => {
  it('passes valid numbers', () => {
    expect(checkCreditCard('4111 1111 1111 1111')).toEqual({ ok: true });
  });
  it('says why a number failed', () => {
    expect(checkCreditCard(1)).toEqual({ ok: false, reason: 'type' });
    expect(checkCreditCard('')).toEqual({ ok: false, reason: 'empty' });
    expect(checkCreditCard('4111-abcd')).toEqual({ ok: false, reason: 'format' });
    expect(checkCreditCard('4111')).toEqual({ ok: false, reason: 'length' });
    expect(checkCreditCard('0000000000000000')).toEqual({ ok: false, reason: 'brand' });
    expect(checkCreditCard('4111111111111112')).toEqual({ ok: false, reason: 'luhn' });
  });
  it('honours brands and strict', () => {
    expect(checkCreditCard('4111111111111111', { brands: ['amex'] })).toEqual({
      ok: false,
      reason: 'brand'
    });
    expect(checkCreditCard('4111 1111 1111 1111', { strict: true })).toEqual({
      ok: false,
      reason: 'format'
    });
  });
});

describe('escapeRegExp', () => {
  it('leaves plain text alone', () => {
    expect(escapeRegExp('hello world')).toBe('hello world');
  });
  it('produces a pattern that matches the input literally', () => {
    const input = 'a.b*c+d?(e)[f]{g}|h^i$j\\k/l-m';
    expect(new RegExp(`^${escapeRegExp(input)}$`).test(input)).toBe(true);
  });
  it('does not let metacharacters match anything else', () => {
    expect(new RegExp(escapeRegExp('a.c')).test('abc')).toBe(false);
  });
});

describe('isApiKeyLike secret-key prefixes', () => {
  // Built at runtime so no secret-shaped literal is committed or printed in the
  // generated docs (GitHub push protection flags those, even when they are fake).
  it.each(['sk_live_', 'sk_test_', 'rk_live_', 'rk_test_'])('accepts %s keys', (prefix) => {
    expect(isApiKeyLike(prefix + 'a'.repeat(24))).toBe(true);
    expect(isApiKeyLike(prefix + 'a'.repeat(23))).toBe(false);
  });
});
