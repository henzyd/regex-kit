import { describe, expect, it } from 'vitest';
import {
  any,
  hasPathTraversal,
  isCreditCard,
  isEmail,
  isIban,
  isInteger,
  isIsoDate,
  isMobilePhone,
  isDomain,
  isPassword,
  isPhoneE164,
  isPort,
  isPostalCode,
  isUrl,
  isUuid,
  optional
} from '../src/index.js';
import type { Uuid } from '../src/index.js';

/** Every example in docs/using-validators.md, run as written. */
describe('docs/using-validators.md', () => {
  it('The basics', () => {
    expect(isEmail('ada@example.com')).toBe(true);
    expect(isEmail('ada@')).toBe(false);
    expect(isUuid('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
    expect(isEmail(undefined)).toBe(false);
    expect(isEmail(42)).toBe(false);
    expect(isEmail(null)).toBe(false);
    expect(isPort(8080)).toBe(true);
    expect(isPort('8080')).toBe(true);
    expect(hasPathTraversal('../etc/passwd')).toBe(true);
  });

  it('Options', () => {
    expect(isUrl('ftp://files.example.com', { protocols: ['ftp'] })).toBe(true);
    expect(isUrl('localhost:3000', { allowLocalhost: true, requireProtocol: false })).toBe(true);
    expect(isInteger('007')).toBe(false);
    expect(isInteger('007', { allowLeadingZeros: true })).toBe(true);
    expect(isPassword('correct horse battery', { minLength: 12 })).toBe(true);
    expect(isPassword('Ab1!', { minLength: 12 })).toBe(false);
    expect(isPassword('abcdefghijkl', { minLength: 12, digits: 1 })).toBe(false);
  });

  it('Locale-aware validators', () => {
    expect(isPostalCode('SW1A 1AA', 'GB')).toBe(true);
    expect(isPostalCode('90210', 'US')).toBe(true);
    expect(isMobilePhone('+2348012345678', 'NG')).toBe(true);
    expect(isPostalCode('12345', 'ZZ')).toBe(false);
  });

  it('Checksummed validators', () => {
    expect(isCreditCard('4111 1111 1111 1111')).toBe(true);
    expect(isCreditCard('4111 1111 1111 1112')).toBe(false);
    expect(isIban('GB82 WEST 1234 5698 7654 32')).toBe(true);
    expect(isIban('GB82WEST12345698765432', { strict: true })).toBe(true);
    expect(isIban('GB82 WEST 1234 5698 7654 32', { strict: true })).toBe(false);
  });

  it('Type guards narrow', () => {
    const loadUser = (id: Uuid) => id;
    const raw: string = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
    let loaded: string | undefined;
    if (isUuid(raw)) loaded = loadUser(raw);
    expect(loaded).toBe(raw);
  });

  it('In a web form', () => {
    const validate = (form: { email: string; password: string }) => {
      const errors: Record<string, string> = {};
      if (!isEmail(form.email.trim())) errors.email = 'Enter a valid email address.';
      if (!isPassword(form.password, { minLength: 12 }))
        errors.password = 'Use at least 12 characters.';
      return errors;
    };
    expect(validate({ email: ' ada@example.com ', password: 'correct horse battery' })).toEqual({});
    expect(Object.keys(validate({ email: 'nope', password: 'short' }))).toEqual([
      'email',
      'password'
    ]);
  });

  it('Optional values', () => {
    expect(optional(isEmail)('')).toBe(true);
    expect(optional(isEmail)('nope')).toBe(false);
    expect(any(isEmail, isPhoneE164)('+14155552671')).toBe(true);
  });

  it('On the server', () => {
    const page = '3';
    expect(isInteger(page, { min: 1, max: 1000 })).toBe(true);
    expect(isInteger('0', { min: 1, max: 1000 })).toBe(false);
    expect(isIsoDate('2026-11-25')).toBe(true);
  });

  it('Common questions', () => {
    expect(isUrl('example.com')).toBe(false);
    expect(isUrl('example.com', { requireProtocol: false })).toBe(true);
    expect(isDomain('example.com')).toBe(true);
    expect(isCreditCard('4111 1111 1111 1112')).toBe(false);
  });

  it('A mixed batch collects the failing fields', () => {
    const input = { email: 'ada@example.com', phone: '12', postcode: 'SW1A 1AA' };
    const checks = {
      email: isEmail(input.email),
      phone: isPhoneE164(input.phone),
      postcode: isPostalCode(input.postcode, 'GB')
    };
    const failed = Object.entries(checks)
      .filter(([, ok]) => !ok)
      .map(([field]) => field);
    expect(failed).toEqual(['phone']);
  });
});
