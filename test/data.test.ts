import { describe, expect, it } from 'vitest';
import { CSS_NAMED_COLORS } from '../src/data/colours.js';
import { ALPHA2, ALPHA3, NUMERIC } from '../src/data/countries.js';
import { CURRENCIES, SPECIAL_CURRENCIES } from '../src/data/currencies.js';
import { COUNTRY_CALLING } from '../src/data/dial.js';
import { IBAN_LENGTH } from '../src/data/iban.js';
import { LANGUAGES_ALPHA2, SCRIPTS } from '../src/data/languages.js';
import { MOBILE } from '../src/data/mobile.js';
import { POSTAL } from '../src/data/postal.js';
import { SPDX_IDS } from '../src/data/spdx.js';

const names = (type: 'region' | 'currency' | 'language' | 'script') =>
  new Intl.DisplayNames(['en'], { type, fallback: 'none' });

describe('data tables', () => {
  it('has 249 ISO 3166-1 countries with unique alpha-3 and numeric codes', () => {
    expect(ALPHA2.size).toBe(249);
    expect(ALPHA3.size).toBe(249);
    expect(NUMERIC.size).toBe(249);
    for (const c of ALPHA3) expect(c).toMatch(/^[A-Z]{3}$/);
    for (const c of NUMERIC) expect(c).toMatch(/^\d{3}$/);
  });

  it('country codes are known to the runtime ICU data', () => {
    const regions = names('region');
    const unknown = [...ALPHA2].filter((c) => regions.of(c) === undefined);
    expect(unknown).toEqual([]);
  });

  it('currency codes are known to the runtime ICU data', () => {
    const currencies = names('currency');
    const unknown = [...CURRENCIES].filter((c) => currencies.of(c) === undefined);
    expect(unknown).toEqual([]);
    for (const c of SPECIAL_CURRENCIES) expect(CURRENCIES.has(c)).toBe(false);
    expect(CURRENCIES.size).toBeGreaterThan(150);
  });

  it('every ICU-listed currency is either in the table or deliberately withdrawn', () => {
    const supported = (
      Intl as unknown as { supportedValuesOf: (k: string) => string[] }
    ).supportedValuesOf('currency');
    const withdrawn = new Set([
      'ANG',
      'BGN',
      'HRK',
      'SLL',
      'ZWL',
      'CUC',
      'LTL',
      'LVL',
      'EEK',
      'CYP',
      'MTL',
      'SIT',
      'SKK',
      'VEF',
      'ZWD',
      'ZWR',
      'ZWN',
      'MRO',
      'STD',
      'BYR',
      'AZM',
      'TRL',
      'GHC',
      'ROL',
      'RUR',
      'VEB',
      'YUM',
      'XFU',
      'XFO'
    ]);
    const missing = supported.filter(
      (c) => !CURRENCIES.has(c) && !SPECIAL_CURRENCIES.has(c) && !withdrawn.has(c)
    );
    expect(missing).toEqual([]);
  });

  it('has 184 ISO 639-1 languages known to the runtime', () => {
    expect(LANGUAGES_ALPHA2.size).toBe(184);
    const langs = names('language');
    const unknown = [...LANGUAGES_ALPHA2].filter((c) => langs.of(c) === undefined);
    expect(unknown).toEqual([]);
  });

  it('script codes look like ISO 15924 and the common ones are known to the runtime', () => {
    for (const s of SCRIPTS) expect(s).toMatch(/^[A-Z][a-z]{3}$/);
    const scripts = names('script');
    for (const s of [
      'Latn',
      'Cyrl',
      'Arab',
      'Hans',
      'Hant',
      'Deva',
      'Grek',
      'Hebr',
      'Thai',
      'Jpan',
      'Kore'
    ]) {
      expect(SCRIPTS.has(s)).toBe(true);
      expect(scripts.of(s)).toBeDefined();
    }
  });

  it('IBAN lengths are plausible and use real countries', () => {
    for (const [cc, n] of Object.entries(IBAN_LENGTH)) {
      expect(ALPHA2.has(cc) || cc === 'XK', cc).toBe(true);
      expect(n).toBeGreaterThanOrEqual(15);
      expect(n).toBeLessThanOrEqual(34);
    }
    expect(Object.keys(IBAN_LENGTH).length).toBeGreaterThan(75);
  });

  it('postal and mobile tables use real countries; mobile calling codes exist', () => {
    for (const cc of Object.keys(POSTAL)) expect(ALPHA2.has(cc), cc).toBe(true);
    for (const [cc, rule] of Object.entries(MOBILE)) {
      expect(ALPHA2.has(cc), cc).toBe(true);
      expect(COUNTRY_CALLING.has(rule.cc), `${cc} +${rule.cc}`).toBe(true);
      expect(() => new RegExp(`^(?:${rule.national})$`)).not.toThrow();
    }
  });

  it('has 148 CSS named colours, all lowercase', () => {
    expect(CSS_NAMED_COLORS.size).toBe(148);
    for (const c of CSS_NAMED_COLORS) expect(c).toBe(c.toLowerCase());
  });

  it('SPDX ids have no duplicates in spirit and include the common licences', () => {
    for (const id of ['MIT', 'Apache-2.0', 'ISC', 'BSD-3-Clause', 'GPL-3.0-only', 'MPL-2.0'])
      expect(SPDX_IDS.has(id)).toBe(true);
  });

  it('calling codes are digit strings', () => {
    for (const c of COUNTRY_CALLING) expect(c).toMatch(/^[1-9]\d{0,2}$/);
  });
});
