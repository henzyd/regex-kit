# Test cases

> **Generated file.** It is rendered from the data in `test/cases/` by
> `npm run docs:cases`, and a test fails if it is out of date. Edit the data, not this page.

This document lists what `@henzyd/regex-kit` is tested against: **317 validators,
4,406 concrete cases in 707 groups**, plus the checks that apply to every
validator at once.

## What is tested

| # | Aspect | How | Where |
| - | ------ | --- | ----- |
| 1 | **Accepts and rejects the right values** | Every validator has valid and invalid inputs, and one group per option or locale, including boundaries (shortest, longest, off-by-one). | The tables below · `test/cases.test.ts` |
| 2 | **Options and locales** | Each option is exercised on and off, and a country argument is tried with an unsupported code, a lowercase code and none at all. | The tables below |
| 3 | **Checksums and algorithms** | Official or widely published vectors where they exist; a single changed digit must fail. Hashes are checked against `node:crypto` and published Keccak vectors. | The tables below · `test/hash.test.ts` |
| 4 | **Contract for every validator** | Non-strings give `false` (or `null` for `get*`); the empty string gives `false`; hostile arguments never throw and always return a boolean. | `test/contract.test.ts` |
| 5 | **Safe on untrusted input** | A 12-million-character string is rejected by the length guard in well under a second; twenty pathological shapes at 2,000 and 20,000 characters, against every option set, finish in under 250 ms each (ReDoS). | `test/contract.test.ts` |
| 6 | **Deterministic, no hidden state** | Valid and invalid inputs are interleaved three times; answers never change (no leaked `lastIndex`, no caches that alter results). | `test/contract.test.ts` |
| 7 | **Reference data** | Country, currency, language and script tables are cross-checked against the ICU data in the runtime; counts and shapes of calling codes, IBAN lengths, postal and mobile tables are asserted. | `test/data.test.ts` |
| 8 | **Helpers and result objects** | `optional`, `all`, `any`, `not`, `listOf`, `matches`, `standardSchema`, `checkEmail`, `checkCreditCard`. | `test/helpers.test.ts` |
| 9 | **The documentation is true** | Every example in `docs/using-validators.md` runs as written; every function named in `docs/validators.md` is exported and every export is documented. | `test/guide.test.ts` · `test/docs.test.ts` |
| 10 | **The published package works** | Build, `publint`, Are the Types Wrong, and an install smoke test that loads the packed tarball through `import` and `require` on Node 20.19, 22 and 24. | `npm run check` · CI |

## Reading the tables

- ✅ means the validator returns `true`; ❌ means `false`.
- Arguments are what follows the value: an options object, a country code, or both.
- For `has*` functions, ✅ means the problem **was found** (the name reads backwards from `is*`).
- `get*` functions list `input → result` instead.
- Numbers, `NaN`, `undefined` and other non-strings appear as written. Invisible characters are shown as escapes.
- Algorithms were checked against independent implementations; where a standard could not be verified from a primary source, the catalogue says so under *Facts to confirm*.

## Running the tests

```bash
npm test              # everything
npm run docs:cases    # regenerate this file after changing test/cases/
```

## Coverage by section

| Section | Validators | Cases |
| ------- | ---------- | ----- |
| [1. Contact and identity](#1-contact-and-identity) | 14 | 259 |
| [2. Network and web](#2-network-and-web) | 40 | 559 |
| [3. Identifiers](#3-identifiers) | 19 | 194 |
| [4. Numbers and text](#4-numbers-and-text) | 22 | 339 |
| [5. Dates and time](#5-dates-and-time) | 20 | 347 |
| [6. Financial](#6-financial) | 21 | 381 |
| [7. Products, publications and devices](#7-products-publications-and-devices) | 11 | 152 |
| [8. Geography and locale](#8-geography-and-locale) | 15 | 277 |
| [9. National and tax identifiers](#9-national-and-tax-identifiers) | 49 | 353 |
| [10. Colours](#10-colours) | 4 | 75 |
| [11. Software and developer tooling](#11-software-and-developer-tooling) | 30 | 561 |
| [12. Passwords and one-time codes](#12-passwords-and-one-time-codes) | 6 | 106 |
| [13. HTTP and API requests](#13-http-and-api-requests) | 20 | 253 |
| [14. Forms and generic input](#14-forms-and-generic-input) | 6 | 98 |
| [15. Security and input hygiene](#15-security-and-input-hygiene) | 14 | 178 |
| [16. Health and science](#16-health-and-science) | 9 | 81 |
| [17. Commerce and mobile](#17-commerce-and-mobile) | 6 | 75 |
| [18. Service-specific identifiers](#18-service-specific-identifiers) | 10 | 106 |
| [Helpers](#helpers) | 1 | 12 |

## 1. Contact and identity

### `isEmail`

- **No extra arguments** — Practical syntax: dot-atom local part, a real domain, length limits.
  - ✅ accepts: `"ada@example.com"` · `"first.last+tag@sub.example.co.uk"` · `"o'brien@example.ie"` · `"a@b.co"` · `"user_name@example-domain.com"` · `"x@xn--bcher-kva.example"` · `"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa@example.com"`
  - ❌ rejects: `"ada@"` · `"@example.com"` · `"ada@example"` · `"ada@@example.com"` · `"ada example@example.com"` · `".ada@example.com"` · `"ada.@example.com"` · `"ada..lee@example.com"` · `"ada@-example.com"` · `"ada@example..com"` · `" ada@example.com"` · `"ada@example.com "` · `"ada@example.c"` · `"ada@example.123"` · `"ada@exa_mple.com"` · `"ada@[1.2.3.4]"` · `"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa@example.com"` · `"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"… (260 chars)` · `"plain text"`
- **Arguments: `{ allowUnicode: true }`** — Unicode local part and domain.
  - ✅ accepts: `"jürgen@example.com"` · `"ada@münchen.de"` · `"ada@example.com"`
  - ❌ rejects: `"jürgen@exa mple.com"`
- **No extra arguments** — Unicode is rejected by default.
  - ❌ rejects: `"jürgen@example.com"` · `"ada@münchen.de"`
- **Arguments: `{ requireTld: false }`** — Single-label domains.
  - ✅ accepts: `"ada@localhost"` · `"ada@intranet"`
  - ❌ rejects: `"ada@"`
- **Arguments: `{ allowDisplayName: true }`** — Display names.
  - ✅ accepts: `"Ada Lovelace <ada@example.com>"` · `"\"Ada, L\" <ada@example.com>"` · `"ada@example.com"`
  - ❌ rejects: `"Ada Lovelace <ada@>"` · `"Ada <ada@example.com> trailing"`
- **No extra arguments** — Display names are rejected by default.
  - ❌ rejects: `"Ada Lovelace <ada@example.com>"`
- **Arguments: `{ maxLength: 10 }`** — Custom maximum length.
  - ✅ accepts: `"a@b.co"`
  - ❌ rejects: `"ada@example.com"`

### `isEmailDomain`

- **No extra arguments**
  - ✅ accepts: `"example.com"` · `"sub.example.co.uk"`
  - ❌ rejects: `"example"` · `"-example.com"` · `"exa mple.com"` · `"[192.168.0.1]"`
- **Arguments: `{ allowIpLiteral: true }`** — Address literals.
  - ✅ accepts: `"[192.168.0.1]"` · `"[IPv6:::1]"`
  - ❌ rejects: `"[999.1.1.1]"` · `"[::1]"`

### `isPhoneE164`

- **No extra arguments**
  - ✅ accepts: `"+14155552671"` · `"+2348012345678"` · `"+442071838750"` · `"+12"`
  - ❌ rejects: `"14155552671"` · `"+0123456789"` · `"+1"` · `"+1 415 555 2671"` · `"+"` · `"+1415555267100000"` · `"+1415abc2671"`

### `isPhone`

- **No extra arguments**
  - ✅ accepts: `"+1 (415) 555-2671"` · `"0801 234 5678"` · `"(415) 555-2671"` · `"415.555.2671"` · `"+2348012345678"`
  - ❌ rejects: `"abc"` · `"123"` · `"+1234567890123456"` · `"555-2671 ext 4"` · `"++14155552671"` · `"415--555-2671"` · `"(415 555-2671"`

### `isMobilePhone`

- **Arguments: `"NG"`**
  - ✅ accepts: `"+2348012345678"` · `"08012345678"` · `"0801 234 5678"` · `"08134567890"` · `"+234 803 123 4567"`
  - ❌ rejects: `"+234701234567"` · `"07912345678"` · `"+2358012345678"` · `"0801234567"` · `"abc"`
- **Arguments: `"ng"`** — Country code is case-insensitive.
  - ✅ accepts: `"08012345678"`
- **Arguments: `"NG", { strict: true }`** — Strict: no separators.
  - ✅ accepts: `"+2348012345678"` · `"08012345678"`
  - ❌ rejects: `"0801 234 5678"`
- **Arguments: `"US"`**
  - ✅ accepts: `"+12025550123"` · `"(202) 555-0123"` · `"1-202-555-0123"` · `"202-555-0123"`
  - ❌ rejects: `"202-155-0123"` · `"+1 (555) 123"`
- **Arguments: `"GB"`**
  - ✅ accepts: `"07911 123456"` · `"+44 7911 123456"` · `"+447911123456"` · `"00447911123456"`
  - ❌ rejects: `"07011 123456"` · `"0791112345"`
- **Arguments: `"IN"`**
  - ✅ accepts: `"+919876543210"` · `"09876543210"` · `"9876543210"`
  - ❌ rejects: `"5876543210"`
- **Arguments: `"ZA"`**
  - ✅ accepts: `"+27821234567"` · `"0821234567"`
  - ❌ rejects: `"0121234567"`
- **Arguments: `"DE"`**
  - ✅ accepts: `"+4915112345678"` · `"015112345678"`
  - ❌ rejects: `"+49301234567"`
- **Arguments: `"FR"`**
  - ✅ accepts: `"+33612345678"` · `"0612345678"`
  - ❌ rejects: `"0112345678"`
- **Arguments: `"AU"`**
  - ✅ accepts: `"+61412345678"` · `"0412345678"`
  - ❌ rejects: `"0212345678"`
- **Arguments: `"BR"`**
  - ✅ accepts: `"+5511987654321"` · `"11987654321"`
  - ❌ rejects: `"1133334444"`
- **Arguments: `"JP"`**
  - ✅ accepts: `"090-1234-5678"` · `"+819012345678"`
  - ❌ rejects: `"03-1234-5678"`
- **Arguments: `"KE"`**
  - ✅ accepts: `"0712345678"` · `"+254712345678"` · `"0112345678"`
  - ❌ rejects: `"0212345678"`
- **Arguments: `"GH"`**
  - ✅ accepts: `"0241234567"` · `"+233241234567"`
  - ❌ rejects: `"0341234567"`
- **Arguments: `"ZZ"`** — Unknown country.
  - ❌ rejects: `"+2348012345678"`
- **No extra arguments** — No country given.
  - ❌ rejects: `"+2348012345678"`

### `isDialCode`

- **No extra arguments**
  - ✅ accepts: `"+234"` · `"+1"` · `"+44"` · `"+91"` · `"+380"` · `"+971"`
  - ❌ rejects: `"+0"` · `"+999"` · `"234"` · `"+2340"` · `"+"` · `"+abc"`
- **Arguments: `{ requirePlus: false }`**
  - ✅ accepts: `"234"` · `"+234"` · `"1"`
  - ❌ rejects: `"999"`

### `isUssdCode`

- **No extra arguments**
  - ✅ accepts: `"*123#"` · `"*737*50*1234#"` · `"#123#"` · `"*#06#"` · `"*901#"`
  - ❌ rejects: `"123"` · `"*123"` · `"*#"` · `"*abc#"` · `"*12 3#"` · `"#"`

### `isUsername`

- **No extra arguments**
  - ✅ accepts: `"ada"` · `"ada_lovelace"` · `"ada.l-1"` · `"a1b"`
  - ❌ rejects: `"ab"` · `"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"` · `"_ada"` · `"ada_"` · `"ada__l"` · `"ada lovelace"` · `"ada!"` · `"ádá"`
- **Arguments: `{ minLength: 2 }`**
  - ✅ accepts: `"ab"`
  - ❌ rejects: `"a"`
- **Arguments: `{ maxLength: 5 }`**
  - ✅ accepts: `"abcde"`
  - ❌ rejects: `"abcdef"`
- **Arguments: `{ allow: "" }`**
  - ✅ accepts: `"adal"`
  - ❌ rejects: `"ada_l"`
- **Arguments: `{ unicode: true }`**
  - ✅ accepts: `"ádá"` · `"ada"`
  - ❌ rejects: `"ád!"`
- **Arguments: `{ allowConsecutiveSeparators: true }`**
  - ✅ accepts: `"a__b"`
  - ❌ rejects: `"a__"`

### `isPersonName`

- **No extra arguments**
  - ✅ accepts: `"Ada Lovelace"` · `"Patrick O'Brien"` · `"Jean-Luc Picard"` · `"José María"` · `"Zoë"` · `"李雷"` · `"J. R. R. Tolkien"` · `"St. John"` · `"Ada"` · `"D’Arcy"`
  - ❌ rejects: `"Ada1"` · `"-Ada"` · `"Ada-"` · `"Ada@"` · `"Ada  Lovelace"` · `"123"` · `"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"… (101 chars)`

### `isDisplayName`

- **No extra arguments**
  - ✅ accepts: `"Ada 🚀"` · `"Ada Lovelace"` · `"  Ada"` · `"李雷"`
  - ❌ rejects: `"   "` · `"Ada\nLovelace"` · `"Ada\u0000"` · `"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"`
- **Arguments: `{ maxLength: 100 }`**
  - ✅ accepts: `"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"`
  - ❌ rejects: `"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"… (101 chars)`

### `isSlug`

- **No extra arguments**
  - ✅ accepts: `"my-post-title"` · `"a"` · `"post-1"` · `"2024-recap"`
  - ❌ rejects: `"My-Post"` · `"my--post"` · `"-post"` · `"post-"` · `"my_post"` · `"my post"` · `"é"`
- **Arguments: `{ allowUppercase: true }`**
  - ✅ accepts: `"My-Post"`
  - ❌ rejects: `"My_Post"`
- **Arguments: `{ separator: "_" }`**
  - ✅ accepts: `"my_post"`
  - ❌ rejects: `"my-post"`
- **Arguments: `{ maxLength: 5 }`**
  - ✅ accepts: `"abcde"`
  - ❌ rejects: `"abcdef"`

### `isHandle`

- **No extra arguments**
  - ✅ accepts: `"@ada"` · `"@ada_l"` · `"@ada.lovelace"` · `"@a"`
  - ❌ rejects: `"ada"` · `"@"` · `"@.ada"` · `"@ada."` · `"@ada..l"` · `"@aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"` · `"@ada!"`
- **Arguments: `{ requireAt: false }`**
  - ✅ accepts: `"ada"` · `"@ada"`
  - ❌ rejects: `".ada"`

### `isHashtag`

- **No extra arguments**
  - ✅ accepts: `"#hello"` · `"#hello_world"` · `"#2026goals"` · `"#日本語"` · `"#héllo"`
  - ❌ rejects: `"#"` · `"#123"` · `"hello"` · `"# hello"` · `"#hello world"` · `"#aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"… (102 chars)`

### `isAddressLine`

- **No extra arguments**
  - ✅ accepts: `"12 Marina Road"` · `"Flat 4B, Block C"`
  - ❌ rejects: `" 12 Marina"` · `"12 Marina "` · `"12\nMarina"`
- **Arguments: `{ maxLength: 5 }`**
  - ✅ accepts: `"12 Ma"`
  - ❌ rejects: `"12 Mar"`

## 2. Network and web

### `isDomain`

- **No extra arguments**
  - ✅ accepts: `"example.com"` · `"sub.example.co.uk"` · `"a-b.example.org"` · `"xn--bcher-kva.example"` · `"EXAMPLE.COM"` · `"1example.com"` · `"example.museum"`
  - ❌ rejects: `"example"` · `"-example.com"` · `"example-.com"` · `"exa_mple.com"` · `"example..com"` · `".example.com"` · `"example.com."` · `"example.c"` · `"example.123"` · `"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.com"` · `"a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a."… (263 chars)`
- **Arguments: `{ requireTld: false }`**
  - ✅ accepts: `"localhost"` · `"example"` · `"example.com"`
  - ❌ rejects: `"123"` · `"-a"`
- **Arguments: `{ unicode: true }`**
  - ✅ accepts: `"münchen.de"` · `"例え.jp"` · `"example.com"`
  - ❌ rejects: `"mün chen.de"`
- **No extra arguments** — Unicode is off by default.
  - ❌ rejects: `"münchen.de"`
- **Arguments: `{ allowTrailingDot: true }`**
  - ✅ accepts: `"example.com."` · `"example.com"`
  - ❌ rejects: `"example.com.."`
- **Arguments: `{ allowWildcard: true }`**
  - ✅ accepts: `"*.example.com"`
  - ❌ rejects: `"*.*.example.com"` · `"a.*.example.com"`
- **No extra arguments** — Wildcards are off by default.
  - ❌ rejects: `"*.example.com"`

### `isHostname`

- **No extra arguments**
  - ✅ accepts: `"localhost"` · `"example.com"` · `"my-host"` · `"host1"` · `"a.b"`
  - ❌ rejects: `"-host"` · `"host_name"` · `"host name"` · `"123"` · `"1.2.3.4"` · `"host-"`

### `isTld`

- **No extra arguments**
  - ✅ accepts: `"com"` · `"io"` · `"museum"` · `"xn--p1ai"`
  - ❌ rejects: `"c"` · `"123"` · `".com"` · `"co.uk"` · `"com1"`

### `isHostPort`

- **No extra arguments**
  - ✅ accepts: `"example.com:8080"` · `"localhost:3000"` · `"127.0.0.1:80"` · `"[::1]:3000"` · `"[2001:db8::1]:443"`
  - ❌ rejects: `"example.com"` · `"example.com:"` · `"example.com:99999"` · `"::1:80"` · `"[::1]"` · `"[::1"` · `"[::1]x"` · `"exa mple.com:80"` · `":80"`
- **Arguments: `{ requirePort: false }`**
  - ✅ accepts: `"example.com"` · `"[::1]"` · `"localhost:3000"`
  - ❌ rejects: `"[::1"` · `"a b"`

### `isAsn`

- **No extra arguments**
  - ✅ accepts: `"AS64512"` · `"AS13335"` · `"as1"` · `"AS0"`
  - ❌ rejects: `"64512"` · `"AS4294967296"` · `"AS"` · `"AS01"` · `"ASX"`
- **Arguments: `{ requirePrefix: false }`**
  - ✅ accepts: `"64512"` · `"AS64512"`
  - ❌ rejects: `"4294967296"` · `"x"`

### `isPort`

- **No extra arguments**
  - ✅ accepts: `0` · `80` · `"80"` · `"65535"` · `8080` · `"0"`
  - ❌ rejects: `65536` · `"65536"` · `-1` · `"-1"` · `1.5` · `"08"` · `"80a"` · `""` · `NaN` · `Infinity` · `"1e3"`
- **Arguments: `{ allowZero: false }`**
  - ✅ accepts: `1` · `"1"`
  - ❌ rejects: `0` · `"0"`

### `isIpv4`

- **No extra arguments**
  - ✅ accepts: `"192.168.0.1"` · `"0.0.0.0"` · `"255.255.255.255"` · `"8.8.8.8"`
  - ❌ rejects: `"256.1.1.1"` · `"1.2.3"` · `"1.2.3.4.5"` · `"01.2.3.4"` · `"1.2.3.04"` · `"a.b.c.d"` · `"1.2.3.4 "` · `" 1.2.3.4"` · `"1..2.3"` · `"1.2.3.-4"`
- **Arguments: `{ allowLeadingZeros: true }`**
  - ✅ accepts: `"010.001.002.003"`
  - ❌ rejects: `"010.001.002.256"`

### `isIpv6`

- **No extra arguments**
  - ✅ accepts: `"::1"` · `"::"` · `"2001:db8::1"` · `"2001:0db8:0000:0000:0000:ff00:0042:8329"` · `"::ffff:192.168.0.1"` · `"fe80::1"` · `"1:2:3:4:5:6:7:8"` · `"1::"` · `"::2:3:4:5:6:7:8"` · `"ABCD::EF01"`
  - ❌ rejects: `"1:2:3:4:5:6:7"` · `"1:2:3:4:5:6:7:8:9"` · `":::"` · `"1::2::3"` · `"12345::1"` · `"g::1"` · `"::ffff:999.1.1.1"` · `":1"` · `"1:"` · `"2001:db8:::1"` · `"fe80::1%eth0"` · `"%eth0"`
- **Arguments: `{ allowZone: true }`**
  - ✅ accepts: `"fe80::1%eth0"` · `"fe80::1"`
  - ❌ rejects: `"fe80::1%"` · `"%eth0"` · `"fe80::1%a b"`

### `isIp`

- **No extra arguments**
  - ✅ accepts: `"1.2.3.4"` · `"::1"`
  - ❌ rejects: `"1.2.3"` · `"localhost"`
- **Arguments: `{ version: 4 }`**
  - ✅ accepts: `"1.2.3.4"`
  - ❌ rejects: `"::1"`
- **Arguments: `{ version: 6 }`**
  - ✅ accepts: `"::1"`
  - ❌ rejects: `"1.2.3.4"`

### `isIpv4Cidr`

- **No extra arguments**
  - ✅ accepts: `"10.0.0.0/8"` · `"192.168.1.0/24"` · `"0.0.0.0/0"` · `"1.2.3.4/32"`
  - ❌ rejects: `"10.0.0.0/33"` · `"10.0.0.0"` · `"10.0.0.0/"` · `"10.0.0.0/08"` · `"10.0.0/8"` · `"/8"` · `"10.0.0.0/-1"` · `"::1/64"`

### `isIpv6Cidr`

- **No extra arguments**
  - ✅ accepts: `"2001:db8::/32"` · `"::/0"` · `"fe80::/10"` · `"::1/128"`
  - ❌ rejects: `"::1/129"` · `"::1"` · `"2001:db8::/"` · `"10.0.0.0/8"`

### `isCidr`

- **No extra arguments**
  - ✅ accepts: `"10.0.0.0/8"` · `"2001:db8::/32"`
  - ❌ rejects: `"10.0.0.0"` · `"::1"` · `"a/b"`

### `isIpRange`

- **No extra arguments**
  - ✅ accepts: `"192.168.0.1-192.168.0.50"` · `"10.0.0.1 - 10.0.0.9"` · `"1.1.1.1-1.1.1.1"`
  - ❌ rejects: `"192.168.0.50-192.168.0.1"` · `"192.168.0.1"` · `"1.1.1.1-2.2.2"` · `"-"`

### `isPublicIp`

- **No extra arguments**
  - ✅ accepts: `"8.8.8.8"` · `"1.1.1.1"` · `"93.184.216.34"` · `"172.32.0.1"` · `"2606:4700:4700::1111"` · `"2001:4860:4860::8888"`
  - ❌ rejects: `"10.0.0.1"` · `"127.0.0.1"` · `"192.168.1.1"` · `"172.16.0.1"` · `"172.31.255.255"` · `"169.254.169.254"` · `"100.64.0.1"` · `"0.0.0.0"` · `"224.0.0.1"` · `"255.255.255.255"` · `"::1"` · `"::"` · `"fe80::1"` · `"fc00::1"` · `"fd12:3456::1"` · `"::ffff:10.0.0.1"` · `"2001:db8::1"` · `"2002:0a00:0001::"` · `"not an ip"` · `"127.1"`

### `isPrivateIp`

- **No extra arguments**
  - ✅ accepts: `"10.1.2.3"` · `"172.16.0.1"` · `"172.31.255.255"` · `"192.168.0.1"` · `"fd00::1"` · `"fc00::1"`
  - ❌ rejects: `"8.8.8.8"` · `"172.32.0.1"` · `"172.15.255.255"` · `"127.0.0.1"` · `"11.0.0.1"` · `"2001:db8::1"` · `"x"`

### `isLoopbackIp`

- **No extra arguments**
  - ✅ accepts: `"127.0.0.1"` · `"127.255.255.254"` · `"::1"` · `"::ffff:127.0.0.1"`
  - ❌ rejects: `"128.0.0.1"` · `"10.0.0.1"` · `"::2"` · `"localhost"`

### `isLinkLocalIp`

- **No extra arguments**
  - ✅ accepts: `"169.254.169.254"` · `"169.254.0.1"` · `"fe80::1"` · `"febf::1"`
  - ❌ rejects: `"169.253.0.1"` · `"fec0::1"` · `"10.0.0.1"` · `"x"`

### `isMacAddress`

- **No extra arguments**
  - ✅ accepts: `"00:1A:2B:3C:4D:5E"` · `"00-1a-2b-3c-4d-5e"` · `"001a.2b3c.4d5e"` · `"001A2B3C4D5E"`
  - ❌ rejects: `"00:1A:2B:3C:4D"` · `"00:1A:2B:3C:4D:5E:6F"` · `"00:1A-2B:3C:4D:5E"` · `"GG:1A:2B:3C:4D:5E"` · `"001A2B3C4D5"` · `"00:1A:2B:3C:4D:5"`
- **Arguments: `{ format: "colon" }`**
  - ✅ accepts: `"00:1A:2B:3C:4D:5E"`
  - ❌ rejects: `"00-1A-2B-3C-4D-5E"` · `"001A2B3C4D5E"`
- **Arguments: `{ format: "dash" }`**
  - ✅ accepts: `"00-1A-2B-3C-4D-5E"`
  - ❌ rejects: `"00:1A:2B:3C:4D:5E"`
- **Arguments: `{ format: "dot" }`**
  - ✅ accepts: `"001a.2b3c.4d5e"`
  - ❌ rejects: `"00:1A:2B:3C:4D:5E"`
- **Arguments: `{ format: "bare" }`**
  - ✅ accepts: `"001A2B3C4D5E"`
  - ❌ rejects: `"00:1A:2B:3C:4D:5E"`

### `isUrl`

- **No extra arguments**
  - ✅ accepts: `"https://example.com"` · `"http://example.com/path?x=1#frag"` · `"https://sub.example.co.uk:8080/a/b"` · `"ftp://files.example.com/pub"` · `"https://example.com/a%20b"` · `"https://93.184.216.34/"` · `"https://[2001:db8::1]:8443/x"` · `"https://xn--bcher-kva.example/"` · `"HTTPS://EXAMPLE.COM"`
  - ❌ rejects: `"example.com"` · `"//example.com"` · `"http://"` · `"http:// example.com"` · `"http://example"` · `"http://localhost"` · `"https://exa mple.com"` · `"http://-example.com"` · `"http://example.com:99999"` · `"http://example.com:/"` · `"javascript:alert(1)"` · `"mailto:a@b.co"` · `"https://user:pass@example.com"` · `"https://example.com/<script>"` · `"https://example.com/%zz"` · `"https://256.256.256.256"` · `"file:///etc/passwd"` · `"http://[::1"` · `"localhost:3000"`
- **Arguments: `{ protocols: ["ftp"] }`**
  - ✅ accepts: `"ftp://files.example.com"`
  - ❌ rejects: `"https://example.com"`
- **Arguments: `{ protocols: ["mailto"] }`**
  - ✅ accepts: `"mailto:ada@example.com"`
  - ❌ rejects: `"https://example.com"` · `"mailto:"`
- **Arguments: `{ allowLocalhost: true }`**
  - ✅ accepts: `"http://localhost:3000/x"` · `"http://localhost"`
  - ❌ rejects: `"http://intranet"`
- **Arguments: `{ requireTld: false }`**
  - ✅ accepts: `"http://intranet/"` · `"http://localhost"`
  - ❌ rejects: `"http://-bad"`
- **Arguments: `{ requireProtocol: false }`**
  - ✅ accepts: `"example.com"` · `"example.com/path"` · `"https://example.com"`
  - ❌ rejects: `"//example.com"` · `"exa mple.com"`
- **Arguments: `{ requireProtocol: false, allowLocalhost: true }`**
  - ✅ accepts: `"localhost:3000"`
  - ❌ rejects: `"localhost:abc"`
- **Arguments: `{ allowIp: false }`**
  - ✅ accepts: `"https://example.com"`
  - ❌ rejects: `"http://1.2.3.4"` · `"http://[::1]"`
- **Arguments: `{ allowCredentials: true }`**
  - ✅ accepts: `"https://user:pass@example.com/"` · `"https://user@example.com"`
  - ❌ rejects: `"https://us er@example.com"`
- **Arguments: `{ maxLength: 20 }`**
  - ✅ accepts: `"https://example.com"`
  - ❌ rejects: `"https://example.com/long/path"`

### `isHttpUrl`

- **No extra arguments**
  - ✅ accepts: `"https://example.com"` · `"http://example.com/a"`
  - ❌ rejects: `"ftp://example.com"` · `"ws://example.com"` · `"example.com"`

### `isWebSocketUrl`

- **No extra arguments**
  - ✅ accepts: `"wss://example.com/socket"` · `"ws://example.com:8080"`
  - ❌ rejects: `"https://example.com"` · `"ws://localhost:8080"`
- **Arguments: `{ allowLocalhost: true }`**
  - ✅ accepts: `"ws://localhost:8080"`
  - ❌ rejects: `"http://localhost"`

### `isRelativeUrl`

- **No extra arguments**
  - ✅ accepts: `"/a/b"` · `"a/b?c=1#d"` · `"../x"` · `"?q=1"` · `"#frag"` · `"./a:b"`
  - ❌ rejects: `"//example.com"` · `"https://example.com"` · `"a:b"` · `"mailto:x"` · `" /a"` · `"/a b"` · `"/a%zz"`

### `isUrlPath`

- **No extra arguments**
  - ✅ accepts: `"/"` · `"/a/b"` · `"/a%20b"` · `"/a/b/"` · `"/a//b"` · `"/a-b_c.d~e!$&'()*+,;=:@"`
  - ❌ rejects: `"a/b"` · `"/a b"` · `"/a%2"` · `"/a?b"` · `"/a#b"`

### `isUrlSafe`

- **No extra arguments**
  - ✅ accepts: `"abc-DEF_123.~"`
  - ❌ rejects: `"a b"` · `"a/b"` · `"a%20"` · `"é"`

### `isPercentEncoded`

- **No extra arguments**
  - ✅ accepts: `"a%20b"` · `"100%25"` · `"abc"` · `"%E2%9C%93"`
  - ❌ rejects: `"100%"` · `"%zz"` · `"a b"` · `"%2"`

### `isUriScheme`

- **No extra arguments**
  - ✅ accepts: `"https"` · `"mailto"` · `"git+ssh"` · `"a.b-c"`
  - ❌ rejects: `"1http"` · `"ht tp"` · `"http:"` · `"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"`

### `isDatabaseUrl`

- **No extra arguments**
  - ✅ accepts: `"postgres://user:pass@localhost:5432/mydb"` · `"postgresql://localhost/db"` · `"mysql://root@127.0.0.1:3306/app"` · `"mongodb://u:p@host1:27017,host2:27017/db?replicaSet=rs0"` · `"mongodb+srv://u:p@cluster0.example.net/db"` · `"redis://localhost:6379"` · `"rediss://:secret@cache.example.com:6380/0"` · `"amqp://guest:guest@localhost:5672/"`
  - ❌ rejects: `"http://localhost"` · `"postgres://"` · `"postgres:/localhost"` · `"postgres://user@/db"` · `"postgres://local host/db"` · `"mongodb+srv://host:27017/db"` · `"postgres://host:99999/db"` · `"localhost:5432/db"`
- **Arguments: `{ schemes: ["sqlserver"] }`**
  - ✅ accepts: `"sqlserver://host:1433"`
  - ❌ rejects: `"postgres://localhost"`

### `isDeepLink`

- **No extra arguments**
  - ✅ accepts: `"myapp://item/42"` · `"myapp://open?id=1"` · `"com.example.app://callback"` · `"myapp:item/42"`
  - ❌ rejects: `"https://example.com"` · `"javascript:alert(1)"` · `"data:text/html,x"` · `"myapp://has space"` · `"vbscript:x"` · `"myapp:"` · `" myapp://x"` · `"file:///x"`
- **Arguments: `{ schemes: ["myapp"] }`**
  - ✅ accepts: `"myapp://x"`
  - ❌ rejects: `"other://x"`
- **Arguments: `{ schemes: ["https"] }`**
  - ✅ accepts: `"https://example.com/app"`
  - ❌ rejects: `"myapp://x"`

### `isMailtoUri`

- **No extra arguments**
  - ✅ accepts: `"mailto:ada@example.com"` · `"mailto:a@example.com,b@example.com"` · `"mailto:ada@example.com?subject=Hi%20there&body=Hello"` · `"mailto:?subject=x"`
  - ❌ rejects: `"mailto:"` · `"mailto:not-an-email"` · `"ada@example.com"` · `"mailto:ada@example.com?subject"` · `"mailto:ada@example.com extra"` · `"mailto:ada@example.com?"`

### `isTelUri`

- **No extra arguments**
  - ✅ accepts: `"tel:+14155552671"` · `"tel:+1-415-555-2671"` · `"tel:7042;phone-context=example.com"` · `"tel:+1415;ext=123"`
  - ❌ rejects: `"tel:"` · `"tel:14155552671"` · `"tel:+abc"` · `"+1415"` · `"tel:+1 415"`

### `isSmsUri`

- **No extra arguments**
  - ✅ accepts: `"sms:+15551234567"` · `"sms:+15551234567?body=hello"` · `"sms:+15551234567,+15557654321"` · `"sms:5551234;body=hi"`
  - ❌ rejects: `"sms:"` · `"sms:abc"` · `"tel:+1555"`

### `isGeoUri`

- **No extra arguments**
  - ✅ accepts: `"geo:48.2010,16.3695"` · `"geo:48.198634,16.371648,3.4;crs=wgs84;u=40"` · `"geo:0,0"`
  - ❌ rejects: `"geo:91,0"` · `"geo:0,181"` · `"geo:48.2010"` · `"geo:a,b"` · `"48.2,16.3"`

### `isDataUri`

- **No extra arguments**
  - ✅ accepts: `"data:text/plain;base64,SGVsbG8="` · `"data:,Hello%20World"` · `"data:image/png;base64,iVBORw0KGgo="` · `"data:text/html;charset=utf-8,%3Ch1%3Ehi%3C%2Fh1%3E"`
  - ❌ rejects: `"data:text/plain;base64,@@@"` · `"data:text/plain"` · `"data:image/png;base64"` · `"text/plain,hi"` · `"data:text/plain,100%"` · `"data:text/plain,a b"`
- **Arguments: `{ mediaTypes: ["image/png"] }`**
  - ✅ accepts: `"data:image/png;base64,iVBORw0KGgo="`
  - ❌ rejects: `"data:text/plain,hi"`

### `isMimeType`

- **No extra arguments**
  - ✅ accepts: `"application/json"` · `"text/html"` · `"image/svg+xml"` · `"application/vnd.api+json"` · `"application/x-www-form-urlencoded"`
  - ❌ rejects: `"json"` · `"application/"` · `"/json"` · `"application/json; charset=utf-8"` · `"text/*"` · `"*/*"` · `"application/js on"`
- **Arguments: `{ allowParameters: true }`**
  - ✅ accepts: `"text/html; charset=utf-8"` · `"multipart/form-data; boundary=\"abc 123\""` · `"application/json;charset=UTF-8"` · `"text/plain"`
  - ❌ rejects: `"text/html; charset"` · `"text/html;"`
- **Arguments: `{ allowWildcard: true }`**
  - ✅ accepts: `"image/*"` · `"*/*"` · `"text/plain"`
  - ❌ rejects: `"*/json"`

### `isBase64`

- **No extra arguments**
  - ✅ accepts: `"SGVsbG8gV29ybGQ="` · `"SGVsbG8="` · `"TWFu"` · `"TWE="` · `"TQ=="` · `"YQ=="`
  - ❌ rejects: `"SGVsbG8"` · `"SGVsbG8=="` · `"SGVs bG8="` · `"SGVsbG8=x"` · `"S"` · `"===="` · `"SGVsbG8-"`
- **Arguments: `{ padding: "optional" }`**
  - ✅ accepts: `"SGVsbG8"` · `"SGVsbG8="`
  - ❌ rejects: `"S"`
- **Arguments: `{ padding: "none" }`**
  - ✅ accepts: `"SGVsbG8"` · `"TWFu"`
  - ❌ rejects: `"SGVsbG8="`
- **Arguments: `{ urlSafe: true, padding: "none" }`**
  - ✅ accepts: `"a-_b"`
  - ❌ rejects: `"a+/b"`
- **No extra arguments** — Standard alphabet by default.
  - ✅ accepts: `"a+/b"`
  - ❌ rejects: `"a-_b"`

### `isBase64Url`

- **No extra arguments**
  - ✅ accepts: `"SGVsbG8"` · `"a-_b"` · `"abc"`
  - ❌ rejects: `"SGVsbG8="` · `"a+/b"` · `"S"`
- **Arguments: `{ padding: "optional" }`**
  - ✅ accepts: `"SGVsbG8="` · `"SGVsbG8"`
  - ❌ rejects: `"S="`

### `isBase32`

- **No extra arguments**
  - ✅ accepts: `"JBSWY3DPEBLW64TMMQ======"` · `"JBSWY3DPEBLW64TMMQ"` · `"MFRGG==="` · `"MFRGG"` · `"ME======"`
  - ❌ rejects: `"jbswy3dp"` · `"JBSWY3D1"` · `"MFRG="` · `"JBSWY3DP======="` · `"A"`
- **Arguments: `{ padding: "required" }`**
  - ✅ accepts: `"MFRGG==="`
  - ❌ rejects: `"MFRGG"`
- **Arguments: `{ padding: "none" }`**
  - ✅ accepts: `"MFRGG"`
  - ❌ rejects: `"MFRGG==="`
- **Arguments: `{ variant: "hex" }`**
  - ✅ accepts: `"CPNMUOJ1"` · `"CPNMUOG="`
  - ❌ rejects: `"CPNMUOJ1W"`
- **Arguments: `{ variant: "crockford" }`**
  - ✅ accepts: `"91JPRV3F"` · `"91jprv3f"`
  - ❌ rejects: `"ILOU"`

### `isBase58`

- **No extra arguments**
  - ✅ accepts: `"3yQ"` · `"1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2"`
  - ❌ rejects: `"0OIl"` · `"abc!"`

### `isJwt`

- **No extra arguments**
  - ✅ accepts: `"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ"… (91 chars)` · `"eyJhbGciOiJSU0EtT0FFUCIsImVuYyI6IkEyNTZH"… (514 chars)`
  - ❌ rejects: `"a.b.c"` · `"eyJhbGciOiJIUzI1NiJ9.eyJhIjoxfQ"` · `"eyJhbGciOiJIUzI1NiJ9.eyJhIjoxfQ.sig=nat"` · `".."` · `"eyJhbGciOiJub25lIn0.eyJzdWIiOiIxIn0."` · `"eyJ.eyJ."` · `"eyJ.eyJ.sig.extra"`
- **Arguments: `{ allowEmptySignature: true }`**
  - ✅ accepts: `"eyJhbGciOiJub25lIn0.eyJzdWIiOiIxIn0."`
  - ❌ rejects: `"eyJhbGciOiJub25lIn0.zzz."`
- **Arguments: `{ type: "jws" }`**
  - ✅ accepts: `"eyJhbGciOiJIUzI1NiJ9.eyJhIjoxfQ.c2ln"`
  - ❌ rejects: `"a.b.c.d.e"`
- **Arguments: `{ type: "jwe" }`**
  - ❌ rejects: `"eyJhbGciOiJIUzI1NiJ9.eyJhIjoxfQ.c2ln"`

### `isEmoji`

- **No extra arguments**
  - ✅ accepts: `"😀"` · `"👍🏽"` · `"👨\u200d👩\u200d👧\u200d👦"` · `"🇳🇬"` · `"❤️"` · `"1️⃣"` · `"🏳️\u200d🌈"`
  - ❌ rejects: `"a"` · `"😀😀"` · `"1"` · `"😀 "` · `"😀a"`

## 3. Identifiers

### `isUuid`

- **No extra arguments**
  - ✅ accepts: `"123e4567-e89b-12d3-a456-426614174000"` · `"f47ac10b-58cc-4372-a567-0e02b2c3d479"` · `"00000000-0000-0000-0000-000000000000"` · `"ffffffff-ffff-ffff-ffff-ffffffffffff"` · `"F47AC10B-58CC-4372-A567-0E02B2C3D479"` · `"017f22e2-79b0-7cc3-98c4-dc0c0c07398f"`
  - ❌ rejects: `"f47ac10b-58cc-0372-a567-0e02b2c3d479"` · `"f47ac10b-58cc-9372-a567-0e02b2c3d479"` · `"f47ac10b-58cc-4372-c567-0e02b2c3d479"` · `"f47ac10b58cc4372a5670e02b2c3d479"` · `"f47ac10b-58cc-4372-a567-0e02b2c3d47"` · `"g47ac10b-58cc-4372-a567-0e02b2c3d479"` · `"{f47ac10b-58cc-4372-a567-0e02b2c3d479}"` · `" f47ac10b-58cc-4372-a567-0e02b2c3d479"`
- **Arguments: `{ version: 4 }`**
  - ✅ accepts: `"f47ac10b-58cc-4372-a567-0e02b2c3d479"`
  - ❌ rejects: `"123e4567-e89b-12d3-a456-426614174000"` · `"00000000-0000-0000-0000-000000000000"`
- **Arguments: `{ version: 1 }`**
  - ✅ accepts: `"123e4567-e89b-12d3-a456-426614174000"`
  - ❌ rejects: `"f47ac10b-58cc-4372-a567-0e02b2c3d479"`
- **Arguments: `{ version: 7 }`**
  - ✅ accepts: `"017f22e2-79b0-7cc3-98c4-dc0c0c07398f"`
  - ❌ rejects: `"f47ac10b-58cc-4372-a567-0e02b2c3d479"`
- **Arguments: `{ version: "nil" }`**
  - ✅ accepts: `"00000000-0000-0000-0000-000000000000"`
  - ❌ rejects: `"f47ac10b-58cc-4372-a567-0e02b2c3d479"` · `"ffffffff-ffff-ffff-ffff-ffffffffffff"`
- **Arguments: `{ version: "max" }`**
  - ✅ accepts: `"ffffffff-ffff-ffff-ffff-ffffffffffff"` · `"FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF"`
  - ❌ rejects: `"00000000-0000-0000-0000-000000000000"`

### `isGuid`

- **No extra arguments**
  - ✅ accepts: `"123e4567-e89b-12d3-a456-426614174000"` · `"00000000-0000-0000-0000-000000000000"` · `"123e4567-e89b-02d3-0456-426614174000"`
  - ❌ rejects: `"{123e4567-e89b-12d3-a456-426614174000}"` · `"123e4567e89b12d3a456426614174000"` · `"x"`
- **Arguments: `{ allowBraces: true }`**
  - ✅ accepts: `"{123e4567-e89b-12d3-a456-426614174000}"` · `"123e4567-e89b-12d3-a456-426614174000"`
  - ❌ rejects: `"{123e4567-e89b-12d3-a456-426614174000"` · `"(123e4567-e89b-12d3-a456-426614174000)"`

### `isUlid`

- **No extra arguments**
  - ✅ accepts: `"01ARZ3NDEKTSV4RRFFQ69G5FAV"` · `"01arz3ndektsv4rrffq69g5fav"` · `"7ZZZZZZZZZZZZZZZZZZZZZZZZZ"`
  - ❌ rejects: `"81ARZ3NDEKTSV4RRFFQ69G5FAV"` · `"01ARZ3NDEKTSV4RRFFQ69G5FAU"` · `"01ARZ3NDEKTSV4RRFFQ69G5FA"` · `"01ARZ3NDEKTSV4RRFFQ69G5FAVV"` · `"01ARZ3NDEKTSV4RRFFQ69G5FAI"`

### `isCuid`

- **No extra arguments**
  - ✅ accepts: `"cjld2cjxh0000qzrmn831i7rn"`
  - ❌ rejects: `"Cjld2cjxh0000qzrmn831i7rn"` · `"cjld2cjxh0000qzrmn831i7r"` · `"xjld2cjxh0000qzrmn831i7rn"` · `"cjld2cjxh0000qzrmn831i7rn1"`

### `isCuid2`

- **No extra arguments**
  - ✅ accepts: `"tz4a98xxat96iws9zmbrgj3a"`
  - ❌ rejects: `"1z4a98xxat96iws9zmbrgj3a"` · `"Tz4a98xxat96iws9zmbrgj3a"` · `"tz4a98xxat96iws9zmbrgj3"` · `"tz4a98-xat96iws9zmbrgj3a"`
- **Arguments: `{ length: 10 }`**
  - ✅ accepts: `"tz4a98xxat"`
  - ❌ rejects: `"tz4a98xxa"`

### `isNanoid`

- **No extra arguments**
  - ✅ accepts: `"V1StGXR8_Z5jdHi6B-myT"`
  - ❌ rejects: `"V1StGXR8_Z5jdHi6B-my"` · `"V1StGXR8_Z5jdHi6B-my!"` · `"V1StGXR8_Z5jdHi6B-myTT"`
- **Arguments: `{ length: 10 }`**
  - ✅ accepts: `"abcdefghij"`
  - ❌ rejects: `"abcdefghi"`
- **Arguments: `{ alphabet: "0123456789" }`**
  - ✅ accepts: `"123456789012345678901"`
  - ❌ rejects: `"V1StGXR8_Z5jdHi6B-myT"`

### `isKsuid`

- **No extra arguments**
  - ✅ accepts: `"0ujsswThIGTUYm2K8FjOOfXtY1K"`
  - ❌ rejects: `"0ujsswThIGTUYm2K8FjOOfXtY1"` · `"0ujsswThIGTUYm2K8FjOOfXtY1-"`

### `isObjectId`

- **No extra arguments**
  - ✅ accepts: `"507f1f77bcf86cd799439011"` · `"507F1F77BCF86CD799439011"`
  - ❌ rejects: `"507f1f77bcf86cd79943901"` · `"507f1f77bcf86cd7994390111"` · `"g07f1f77bcf86cd799439011"`

### `isSnowflakeId`

- **No extra arguments**
  - ✅ accepts: `"1541815603606036480"` · `"175928847299117063"` · `"1"` · `"9223372036854775808"`
  - ❌ rejects: `"0"` · `"01"` · `"-1"` · `"1.5"` · `"18446744073709551616"` · `"abc"` · `"111111111111111111111"`
- **Arguments: `{ signed: true }`**
  - ✅ accepts: `"9223372036854775807"`
  - ❌ rejects: `"9223372036854775808"`
- **Arguments: `{ epoch: 1420070400000 }`**
  - ✅ accepts: `"175928847299117063"` · `"1"`
  - ❌ rejects: `"9223372036854775807"`

### `isShortId`

- **No extra arguments**
  - ✅ accepts: `"abc123"` · `"V1StGXR8_Z5jdHi6B-myT"`
  - ❌ rejects: `"abc12"` · `"aaaaaaaaaaaaaaaaaaaaaa"` · `"abc 123"` · `"abc!23"`
- **Arguments: `{ minLength: 3 }`**
  - ✅ accepts: `"abc"`
  - ❌ rejects: `"ab"`

### `isHash`

- **Arguments: `"sha256"`**
  - ✅ accepts: `"e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"` · `"E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855"`
  - ❌ rejects: `"3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"` · `"g3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"` · `"cf83e1357eefb8bdf1542850d66d8007d620e405"… (128 chars)`
- **Arguments: `"sha512"`**
  - ✅ accepts: `"cf83e1357eefb8bdf1542850d66d8007d620e405"… (128 chars)`
  - ❌ rejects: `"e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"`
- **Arguments: `"md5"`** — Legacy algorithms need an opt-in.
  - ❌ rejects: `"d41d8cd98f00b204e9800998ecf8427e"`
- **Arguments: `"md5", { legacy: true }`**
  - ✅ accepts: `"d41d8cd98f00b204e9800998ecf8427e"`
  - ❌ rejects: `"d41d8cd98f00b204e9800998ecf8427"`
- **Arguments: `"sha1", { legacy: true }`**
  - ✅ accepts: `"da39a3ee5e6b4b0d3255bfef95601890afd80709"`
  - ❌ rejects: `"da39a3ee"`
- **Arguments: `"crc32", { legacy: true }`**
  - ✅ accepts: `"cbf43926"`
  - ❌ rejects: `"cbf4392"`
- **Arguments: `"sha3-256"`**
  - ✅ accepts: `"e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"`
- **Arguments: `"blake2b"`**
  - ✅ accepts: `"cf83e1357eefb8bdf1542850d66d8007d620e405"… (128 chars)`
- **Arguments: `"sha999"`** — Unknown algorithm.
  - ❌ rejects: `"e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"`
- **No extra arguments** — No algorithm.
  - ❌ rejects: `"e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"`

### `isOciDigest`

- **No extra arguments**
  - ✅ accepts: `"sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"` · `"sha512:000000000000000000000000000000000"… (135 chars)`
  - ❌ rejects: `"sha256:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"` · `"sha1:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"` · `"sha256:abc"` · `"sha256aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"`

### `isSriHash`

- **No extra arguments**
  - ✅ accepts: `"sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU="` · `"sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC"` · `"sha512-z4PhNX7vuL3xVChQ1m2AB9Yg5AULVxXcg"… (95 chars)` · `"sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMp"… (123 chars)`
  - ❌ rejects: `"md5-abc"` · `"sha256-short"` · `"sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU"` · `"sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU= bad"`

### `isBcryptHash`

- **No extra arguments**
  - ✅ accepts: `"$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"` · `"$2a$12$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"` · `"$2y$04$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"`
  - ❌ rejects: `"$2b$32$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"` · `"$2c$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"` · `"$2b$10$short"` · `"N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"`

### `isArgon2Hash`

- **No extra arguments**
  - ✅ accepts: `"$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHQ$RdescudvJCsgt3ub+b+dWRWJTmaaJObG"` · `"$argon2i$m=4096,t=3,p=1$c2FsdA$aGFzaA"`
  - ❌ rejects: `"$argon2x$v=19$m=65536,t=3,p=4$c29tZXNhbHQ$aGFzaA"` · `"argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHQ$aGFzaA"` · `"$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHQ"`

### `isHex`

- **No extra arguments**
  - ✅ accepts: `"deadbeef"` · `"DEADBEEF"` · `"0123456789abcdef"` · `"DeadBeef"`
  - ❌ rejects: `"0xdeadbeef"` · `"deadbeeg"` · `"dead beef"` · `"0x"`
- **Arguments: `{ prefix: true }`**
  - ✅ accepts: `"0xdeadbeef"` · `"0XDEADBEEF"`
  - ❌ rejects: `"deadbeef"` · `"0x"`
- **Arguments: `{ prefix: "optional" }`**
  - ✅ accepts: `"0xdeadbeef"` · `"deadbeef"`
  - ❌ rejects: `"0xzz"`
- **Arguments: `{ length: 8 }`**
  - ✅ accepts: `"deadbeef"`
  - ❌ rejects: `"dead"` · `"deadbeef00"`
- **Arguments: `{ caseSensitive: true }`**
  - ✅ accepts: `"deadbeef"` · `"DEADBEEF"` · `"1234"`
  - ❌ rejects: `"DeadBeef"`

### `isBinary`

- **No extra arguments**
  - ✅ accepts: `"0101"` · `"1"`
  - ❌ rejects: `"012"` · `"0b01"` · `"abc"`
- **Arguments: `{ prefix: true }`**
  - ✅ accepts: `"0b01"` · `"0B11"`
  - ❌ rejects: `"01"`
- **Arguments: `{ prefix: "optional" }`**
  - ✅ accepts: `"0b01"` · `"01"`
  - ❌ rejects: `"0b2"`

### `isOctal`

- **No extra arguments**
  - ✅ accepts: `"0755"` · `"777"`
  - ❌ rejects: `"789"` · `"0o755"` · `"abc"`
- **Arguments: `{ prefix: "optional" }`**
  - ✅ accepts: `"0o755"` · `"755"`
  - ❌ rejects: `"0o789"`

### `isOid`

- **No extra arguments**
  - ✅ accepts: `"1.2.840.113549"` · `"2.5.4.3"` · `"0.9.2342.19200300"` · `"2.999.1"`
  - ❌ rejects: `"1"` · `"3.1"` · `"1.40"` · `"1.2.03"` · `"1..2"` · `"1.2."` · `"a.b"` · `"1.2.-3"`

## 4. Numbers and text

### `isNumeric`

- **No extra arguments**
  - ✅ accepts: `"123"` · `"0"` · `"007"` · `123`
  - ❌ rejects: `"12a"` · `"-1"` · `"1.5"` · `" 1"` · `"1e5"` · `-1` · `1.5`
- **Arguments: `{ allowSign: true }`**
  - ✅ accepts: `"-1"` · `"+1"` · `"1"`
  - ❌ rejects: `"--1"` · `"1-"`
- **Arguments: `{ allowDecimal: true }`**
  - ✅ accepts: `"1.5"` · `"1"`
  - ❌ rejects: `".5"` · `"1."` · `"1.5.5"`
- **Arguments: `{ allowSign: true, allowDecimal: true }`**
  - ✅ accepts: `"-1.5"` · `"+0.25"`
  - ❌ rejects: `"-.5"`

### `isInteger`

- **No extra arguments**
  - ✅ accepts: `"0"` · `"7"` · `"-7"` · `"123456789012345678901234567890"` · `42` · `-42` · `0`
  - ❌ rejects: `"007"` · `"-0"` · `"+1"` · `"1.0"` · `"1e3"` · `" 1"` · `"1_000"` · `"0x10"` · `1.5` · `NaN` · `Infinity`
- **Arguments: `{ allowLeadingZeros: true }`**
  - ✅ accepts: `"007"` · `"-007"` · `"0"`
  - ❌ rejects: `"0x7"`
- **Arguments: `{ allowNegative: false }`**
  - ✅ accepts: `"1"` · `"0"`
  - ❌ rejects: `"-1"`
- **Arguments: `{ min: 1, max: 10 }`**
  - ✅ accepts: `"1"` · `"10"` · `5`
  - ❌ rejects: `"0"` · `"11"` · `0` · `"-3"`
- **Arguments: `{ min: 9007199254740993n }`**
  - ✅ accepts: `"9007199254740993"` · `"9007199254740994"`
  - ❌ rejects: `"9007199254740992"`
- **Arguments: `{ max: -5 }`**
  - ✅ accepts: `"-6"` · `-5`
  - ❌ rejects: `"-4"`
- **Arguments: `{ min: 1.5 }`** — Fractional bounds round inwards.
  - ✅ accepts: `"2"`
  - ❌ rejects: `"1"`

### `isSafeInteger`

- **No extra arguments**
  - ✅ accepts: `"9007199254740991"` · `9007199254740991` · `"-9007199254740991"` · `"0"`
  - ❌ rejects: `"9007199254740992"` · `"-9007199254740992"` · `1.5` · `"abc"`

### `isDecimal`

- **No extra arguments**
  - ✅ accepts: `"1"` · `"1.5"` · `"-1.5"` · `"0.5"` · `"10.00"` · `"123456.789"` · `1.5`
  - ❌ rejects: `".5"` · `"1."` · `"1.5.5"` · `"1,5"` · `"abc"` · `"01.5"` · `"--1.5"` · `"1e5"`
- **Arguments: `{ decimalPlaces: 2 }`**
  - ✅ accepts: `"1.00"` · `"0.99"`
  - ❌ rejects: `"1.0"` · `"1"` · `"1.005"`
- **Arguments: `{ decimalPlaces: { min: 1, max: 2 } }`**
  - ✅ accepts: `"1.5"` · `"1.55"`
  - ❌ rejects: `"1"` · `"1.555"`
- **Arguments: `{ decimalSeparator: "," }`**
  - ✅ accepts: `"1,5"` · `"10"`
  - ❌ rejects: `"1.5"`
- **Arguments: `{ locale: "de-DE" }`**
  - ✅ accepts: `"1,5"`
  - ❌ rejects: `"1.5"`
- **Arguments: `{ locale: "en" }`**
  - ✅ accepts: `"1.5"`
  - ❌ rejects: `"1,5"`
- **Arguments: `{ allowNegative: false }`**
  - ✅ accepts: `"1.5"`
  - ❌ rejects: `"-1.5"`
- **Arguments: `{ allowLeadingZeros: true }`**
  - ✅ accepts: `"01.5"`
  - ❌ rejects: `"0a.5"`

### `isFloat`

- **No extra arguments**
  - ✅ accepts: `"1"` · `"1.5"` · `".5"` · `"1."` · `"-1.5"` · `"1e5"` · `"1.5E-3"` · `"+2.5"` · `1.5`
  - ❌ rejects: `"abc"` · `"1e"` · `"e5"` · `"1.5.5"` · `"1e999"` · `"."` · `NaN`
- **Arguments: `{ min: 0, max: 1 }`**
  - ✅ accepts: `"0.5"` · `"0"` · `"1"`
  - ❌ rejects: `"2"` · `"-0.1"`

### `isPercentage`

- **No extra arguments**
  - ✅ accepts: `"42%"` · `"0%"` · `"100%"` · `"42.5%"` · `"+5%"` · `50` · `0` · `100`
  - ❌ rejects: `"101%"` · `"-1%"` · `"42"` · `"%"` · `"abc%"` · `"42 %"` · `101` · `-1` · `NaN`
- **Arguments: `{ min: -100, max: 100 }`**
  - ✅ accepts: `"-50%"` · `100`
  - ❌ rejects: `"-101%"`
- **Arguments: `{ requireSymbol: false }`**
  - ✅ accepts: `"42"` · `"42%"`
  - ❌ rejects: `"abc"`

### `isCurrencyAmount`

- **No extra arguments**
  - ✅ accepts: `"$1,234.56"` · `"$5"` · `"$0.99"` · `"1234.56"` · `"-$5.00"` · `"$1234.56"` · `"£10"` · `"€1,000"`
  - ❌ rejects: `"$1,23.45"` · `"$1.234"` · `"$"` · `"abc"` · `"$ 5"` · `"5$"` · `"$1,234,56"`
- **Arguments: `{ symbolPosition: "suffix" }`**
  - ✅ accepts: `"5$"` · `"5 €"` · `"5"`
  - ❌ rejects: `"$5"`
- **Arguments: `{ symbolPosition: "either" }`**
  - ✅ accepts: `"$5"` · `"5$"` · `"5 €"` · `"5"`
  - ❌ rejects: `"$5$"`
- **Arguments: `{ symbol: "€", thousandsSeparator: ".", decimalSeparator: "," }`**
  - ✅ accepts: `"€1.234,56"` · `"€5"` · `"1.234,56"`
  - ❌ rejects: `"$1,234.56"` · `"€1,234.56"`
- **Arguments: `{ requireSymbol: true }`**
  - ✅ accepts: `"$5"`
  - ❌ rejects: `"5"`
- **Arguments: `{ allowNegative: false }`**
  - ✅ accepts: `"$5"`
  - ❌ rejects: `"-$5"`
- **Arguments: `{ decimalPlaces: { min: 2, max: 2 } }`**
  - ✅ accepts: `"$5.00"`
  - ❌ rejects: `"$5"` · `"$5.0"`
- **Arguments: `{ decimalPlaces: { max: 0 } }`**
  - ✅ accepts: `"$5"` · `"$1,000"`
  - ❌ rejects: `"$5.00"`
- **Arguments: `{ thousandsSeparator: "" }`**
  - ✅ accepts: `"$1234"`
  - ❌ rejects: `"$1,234"`

### `isRomanNumeral`

- **No extra arguments**
  - ✅ accepts: `"I"` · `"IV"` · `"IX"` · `"XL"` · `"XC"` · `"CD"` · `"CM"` · `"MCMXCIV"` · `"MMMCMXCIX"`
  - ❌ rejects: `"IIII"` · `"VX"` · `"IC"` · `"MMMM"` · `"ABC"` · `"iv"` · `"IVI"`
- **Arguments: `{ caseInsensitive: true }`**
  - ✅ accepts: `"mcmxciv"` · `"IV"`
  - ❌ rejects: `"abc"`

### `isAlpha`

- **No extra arguments**
  - ✅ accepts: `"abc"` · `"ABC"` · `"aBc"`
  - ❌ rejects: `"abc1"` · `"ab c"` · `"é"` · `"abc-"`
- **Arguments: `{ unicode: true }`**
  - ✅ accepts: `"é"` · `"日本"` · `"Ünïcödé"` · `"abc"`
  - ❌ rejects: `"abc1"` · `"a b"`
- **Arguments: `{ locale: "ru-RU" }`**
  - ✅ accepts: `"привет"`
  - ❌ rejects: `"hello"`
- **Arguments: `{ locale: "el" }`**
  - ✅ accepts: `"αβγ"`
  - ❌ rejects: `"abc"`
- **Arguments: `{ locale: "de-DE" }`**
  - ✅ accepts: `"äöüß"` · `"abc"`
  - ❌ rejects: `"привет"`
- **Arguments: `{ locale: "ja" }`**
  - ✅ accepts: `"ひらがな"` · `"カタカナ"` · `"漢字"`
  - ❌ rejects: `"abc"`

### `isAlphanumeric`

- **No extra arguments**
  - ✅ accepts: `"abc123"` · `"ABC"` · `"123"`
  - ❌ rejects: `"abc-123"` · `"abc 123"` · `"é1"`
- **Arguments: `{ unicode: true }`**
  - ✅ accepts: `"é1"` · `"日本1"`
  - ❌ rejects: `"é-1"`

### `isAscii`

- **No extra arguments**
  - ✅ accepts: `"hello"` · `"a\tb"` · `"\u0000"`
  - ❌ rejects: `"héllo"` · `"日本"` · `"😀"`

### `isPrintableAscii`

- **No extra arguments**
  - ✅ accepts: `"hello world!~"`
  - ❌ rejects: `"a\tb"` · `"a\n"` · `""` · `"é"`

### `hasNoControlChars`

- **No extra arguments**
  - ✅ accepts: `"hello"` · `"héllo"` · `"日本"`
  - ❌ rejects: `"a\nb"` · `"a\tb"` · `"a\u0000b"` · `"ab"` · `"a\u0085b"`
- **Arguments: `{ allow: ["\n", "\t"] }`**
  - ✅ accepts: `"a\nb\tc"` · `"abc"`
  - ❌ rejects: `"a\u0000b"` · `"a\rb"`

### `isBlank`

- **No extra arguments**
  - ✅ accepts: `""` · `" "` · `"  \t\n"` · `" "`
  - ❌ rejects: `"a"` · `" a "` · `"0"`

### `isLowercase`

- **No extra arguments**
  - ✅ accepts: `"hello"` · `"hello123"` · `"héllo"` · `"123"`
  - ❌ rejects: `"Hello"` · `"HELLO"` · `"heLLo"`

### `isUppercase`

- **No extra arguments**
  - ✅ accepts: `"HELLO"` · `"HELLO123"` · `"123"`
  - ❌ rejects: `"Hello"` · `"hello"`

### `isCamelCase`

- **No extra arguments**
  - ✅ accepts: `"camelCase"` · `"camel"` · `"getHTTPResponse"` · `"a1B2"`
  - ❌ rejects: `"CamelCase"` · `"snake_case"` · `"kebab-case"` · `"1camel"` · `"camel Case"`

### `isPascalCase`

- **No extra arguments**
  - ✅ accepts: `"PascalCase"` · `"Pascal"` · `"HTMLParser"`
  - ❌ rejects: `"pascalCase"` · `"Pascal_Case"` · `"1Pascal"`

### `isSnakeCase`

- **No extra arguments**
  - ✅ accepts: `"snake_case"` · `"snake"` · `"a_1"`
  - ❌ rejects: `"Snake_case"` · `"snake__case"` · `"_snake"` · `"snake_"` · `"snake-case"`

### `isKebabCase`

- **No extra arguments**
  - ✅ accepts: `"kebab-case"` · `"kebab"` · `"a-1"`
  - ❌ rejects: `"Kebab-case"` · `"kebab--case"` · `"-kebab"` · `"kebab-"` · `"kebab_case"`

### `isScreamingSnakeCase`

- **No extra arguments**
  - ✅ accepts: `"SCREAMING_SNAKE"` · `"A"` · `"MAX_1"`
  - ❌ rejects: `"Screaming_Snake"` · `"SCREAMING__SNAKE"` · `"_A"` · `"a_b"`

### `isHtmlTag`

- **No extra arguments**
  - ✅ accepts: `"<div>"` · `"</div>"` · `"<br/>"` · `"<br />"` · `"<img src=\"a.png\" alt=\"x\">"` · `"<a href=\"https://x.co\" target=_blank>"` · `"<my-element>"`
  - ❌ rejects: `"div"` · `"<div"` · `"<>"` · `"< div>"` · `"<div><span>"` · `"<1div>"` · `"text <b>"` · `"<div>text</div>"`

## 5. Dates and time

### `isIsoDate`

- **No extra arguments** — Calendar-aware: leap years and month lengths.
  - ✅ accepts: `"2026-11-25"` · `"2024-02-29"` · `"2000-02-29"` · `"0001-01-01"` · `"9999-12-31"`
  - ❌ rejects: `"2026-02-30"` · `"2025-02-29"` · `"1900-02-29"` · `"2026-13-01"` · `"2026-00-10"` · `"2026-11-00"` · `"2026-11-31"` · `"26-11-25"` · `"2026/11/25"` · `"2026-1-5"` · `"2026-11-25T00:00:00Z"` · `" 2026-11-25"`

### `isIsoTime`

- **No extra arguments**
  - ✅ accepts: `"13:45"` · `"13:45:30"` · `"13:45:30.123"` · `"13:45:30Z"` · `"13:45:30+01:00"` · `"13:45:30-0530"` · `"23:59:60"` · `"00:00"` · `"13:45:30,5"`
  - ❌ rejects: `"24:00"` · `"13:60"` · `"13:45:61"` · `"1:45"` · `"13:45:30+25:00"` · `"13:45:30+01:60"` · `"13:45:30."` · `"abc"` · `"13:45 "`
- **Arguments: `{ requireOffset: true }`**
  - ✅ accepts: `"13:45:30Z"` · `"13:45+01:00"`
  - ❌ rejects: `"13:45:30"`

### `isIsoDateTime`

- **No extra arguments**
  - ✅ accepts: `"2026-11-25T13:45:30Z"` · `"2026-11-25T13:45:30+01:00"` · `"2026-11-25T13:45"` · `"2026-11-25T13:45:30.123456Z"`
  - ❌ rejects: `"2026-11-25 13:45:30"` · `"2026-02-30T13:45:30Z"` · `"2026-11-25T24:00:00Z"` · `"2026-11-25"` · `"T13:45"` · `"2026-11-25T13:45:30Z extra"`
- **Arguments: `{ allowSpace: true }`**
  - ✅ accepts: `"2026-11-25 13:45:30"` · `"2026-11-25T13:45:30"`
  - ❌ rejects: `"2026-11-25  13:45"`
- **Arguments: `{ requireOffset: true }`**
  - ✅ accepts: `"2026-11-25T13:45:30Z"`
  - ❌ rejects: `"2026-11-25T13:45:30"`

### `isIsoDuration`

- **No extra arguments**
  - ✅ accepts: `"P3Y6M4DT12H30M5S"` · `"P1Y"` · `"P1M"` · `"PT1H"` · `"PT0S"` · `"P1DT1H"` · `"P1.5D"` · `"PT0.5S"` · `"P3Y"`
  - ❌ rejects: `"P"` · `"PT"` · `"P1Y2"` · `"1Y"` · `"P1H"` · `"P-1Y"` · `"PT1H1"` · `"P2W"` · `"P1DT"`
- **Arguments: `{ allowWeeks: true }`**
  - ✅ accepts: `"P2W"` · `"P1Y"`
  - ❌ rejects: `"P2WT"`

### `isDurationString`

- **No extra arguments**
  - ✅ accepts: `"5m"` · `"1h30m"` · `"500ms"` · `"2d"` · `"1.5h"` · `"10s"` · `"1w2d"`
  - ❌ rejects: `"5"` · `"m"` · `"5 m"` · `"1h 30m"` · `"-5m"` · `"5x"` · `"5ms5"`
- **Arguments: `{ units: ["s", "m"] }`**
  - ✅ accepts: `"5m"` · `"1m30s"`
  - ❌ rejects: `"5h"`

### `isIsoWeekDate`

- **No extra arguments**
  - ✅ accepts: `"2026-W47-1"` · `"2026-W01"` · `"2020-W53"` · `"2026-W53"` · `"2026-W52-7"`
  - ❌ rejects: `"2025-W53"` · `"2026-W00"` · `"2026-W54"` · `"2026-W47-0"` · `"2026-W47-8"` · `"2026W47"` · `"2026-47"`

### `isRfc3339`

- **No extra arguments**
  - ✅ accepts: `"2026-11-25T13:45:30Z"` · `"2026-11-25T13:45:30.123+01:00"` · `"2026-11-25T13:45:30-05:00"` · `"2026-11-25T23:59:60Z"`
  - ❌ rejects: `"2026-11-25T13:45:30"` · `"2026-11-25T13:45Z"` · `"2026-11-25t13:45:30z"` · `"2026-11-25 13:45:30Z"` · `"2026-02-30T13:45:30Z"` · `"2026-11-25T13:45:30+0100"` · `"2026-11-25T13:45:30+24:00"`
- **Arguments: `{ allowLowercase: true }`**
  - ✅ accepts: `"2026-11-25t13:45:30z"`
  - ❌ rejects: `"2026-11-25 13:45:30Z"`
- **Arguments: `{ allowSpace: true }`**
  - ✅ accepts: `"2026-11-25 13:45:30Z"`
  - ❌ rejects: `"2026-11-25t13:45:30Z"`

### `isDate`

- **Arguments: `"DD/MM/YYYY"`**
  - ✅ accepts: `"25/11/2026"` · `"29/02/2024"` · `"01/01/0001"`
  - ❌ rejects: `"31/02/2026"` · `"2026-11-25"` · `"25/13/2026"` · `"1/2/2026"` · `"29/02/2025"`
- **Arguments: `"MM/DD/YYYY"`**
  - ✅ accepts: `"11/25/2026"`
  - ❌ rejects: `"25/11/2026"`
- **Arguments: `"YYYY-MM-DD"`**
  - ✅ accepts: `"2026-11-25"`
  - ❌ rejects: `"2026-11-31"`
- **Arguments: `"DD.MM.YYYY"`**
  - ✅ accepts: `"25.11.2026"`
  - ❌ rejects: `"25/11/2026"`
- **Arguments: `"D/M/YYYY"`**
  - ✅ accepts: `"1/2/2026"` · `"25/11/2026"`
  - ❌ rejects: `"32/1/2026"`
- **Arguments: `"DD/MM/YY"`**
  - ✅ accepts: `"25/11/26"` · `"29/02/00"`
  - ❌ rejects: `"29/02/99"`
- **Arguments: `"DD/MM"`** — A format needs a day, a month and a year.
  - ❌ rejects: `"25/11"`
- **Arguments: `"DD/MM/YYYYY"`** — Unknown tokens make the format invalid.
  - ❌ rejects: `"25/11/2026"`
- **Arguments: `"foo"`**
  - ❌ rejects: `"25/11/2026"`
- **No extra arguments** — No format given.
  - ❌ rejects: `"2026-11-25"`

### `isDateTimeLocal`

- **No extra arguments**
  - ✅ accepts: `"2026-11-25T13:45"` · `"2026-11-25T13:45:30"` · `"2026-11-25T13:45:30.123"`
  - ❌ rejects: `"2026-11-25T13:45Z"` · `"2026-11-25 13:45"` · `"2026-02-30T13:45"` · `"2026-11-25T24:00"` · `"2026-11-25T13:45:30.1234"`

### `isMonthString`

- **No extra arguments**
  - ✅ accepts: `"2026-11"` · `"2026-01"`
  - ❌ rejects: `"2026-13"` · `"2026-00"` · `"2026-1"` · `"26-11"` · `"0000-01"`

### `isWeekString`

- **No extra arguments**
  - ✅ accepts: `"2026-W47"` · `"2020-W53"` · `"2026-W53"`
  - ❌ rejects: `"2025-W53"` · `"2026-W00"` · `"2026-W5"` · `"2026W47"`

### `isTime12h`

- **No extra arguments**
  - ✅ accepts: `"1:30 PM"` · `"12:00 am"` · `"01:30PM"` · `"9:05 pm"`
  - ❌ rejects: `"13:30 PM"` · `"0:30 AM"` · `"1:60 PM"` · `"1:30"` · `"1:30 XM"` · `"1:30:15 PM"` · `"1:30  PM"`
- **Arguments: `{ allowSeconds: true }`**
  - ✅ accepts: `"1:30:15 PM"` · `"1:30 PM"`
  - ❌ rejects: `"1:30:60 PM"`

### `isTime24h`

- **No extra arguments**
  - ✅ accepts: `"00:00"` · `"13:30"` · `"23:59"`
  - ❌ rejects: `"24:00"` · `"1:30"` · `"13:60"` · `"13:30:15"` · `"13.30"`
- **Arguments: `{ allowSeconds: true }`**
  - ✅ accepts: `"13:30:15"` · `"13:30"`
  - ❌ rejects: `"13:30:60"`

### `isUnixTimestamp`

- **No extra arguments**
  - ✅ accepts: `0` · `"0"` · `1700000000` · `"1700000000"` · `4102444800`
  - ❌ rejects: `4102444801` · `-1` · `1.5` · `"1700000000000"` · `"abc"` · `"-5"` · `NaN`
- **Arguments: `{ unit: "ms" }`**
  - ✅ accepts: `1700000000000` · `"4102444800000"`
  - ❌ rejects: `4102444800001` · `1.5`
- **Arguments: `{ unit: "any" }`**
  - ✅ accepts: `"1700000000"` · `"1700000000000"`
  - ❌ rejects: `"99999999999999999"`
- **Arguments: `{ min: 100, max: 200 }`**
  - ✅ accepts: `150` · `100` · `200`
  - ❌ rejects: `99` · `201`
- **Arguments: `{ notFuture: true, now: 1700000000000 }`**
  - ✅ accepts: `1699999999`
  - ❌ rejects: `1700000001`
- **Arguments: `{ unit: "ms", notFuture: true, now: 1700000000000 }`**
  - ✅ accepts: `1700000000000`
  - ❌ rejects: `1700000000001`

### `isTimezoneOffset`

- **No extra arguments**
  - ✅ accepts: `"Z"` · `"+01:00"` · `"-05:30"` · `"+0100"` · `"-0530"` · `"+01"` · `"+14:00"` · `"-12:00"`
  - ❌ rejects: `"+15:00"` · `"+14:30"` · `"01:00"` · `"+1:00"` · `"+01:60"` · `"Z1"` · `"UTC"`

### `isTimezone`

- **No extra arguments**
  - ✅ accepts: `"Africa/Lagos"` · `"America/New_York"` · `"Europe/London"` · `"Asia/Tokyo"` · `"UTC"` · `"America/Chicago"`
  - ❌ rejects: `"Africa/Lagoss"` · `"africa/lagos"` · `"Lagos"` · `"Mars/Olympus"` · `"+01:00"` · `"Africa/"`
- **Arguments: `{ checkData: false }`**
  - ✅ accepts: `"Mars/Olympus"` · `"Africa/Lagos"`
  - ❌ rejects: `"africa/lagos"` · `"+01:00"` · `"Africa/"`

### `isCron`

- **No extra arguments**
  - ✅ accepts: `"* * * * *"` · `"*/5 * * * *"` · `"0 0 * * 0"` · `"0 9-17 * * MON-FRI"` · `"15,45 */2 1 JAN *"` · `"0 0 1 1 *"` · `"59 23 31 12 7"` · `"0-30/10 * * * *"`
  - ❌ rejects: `"* * * *"` · `"* * * * * *"` · `"60 * * * *"` · `"* 24 * * *"` · `"* * 0 * *"` · `"* * 32 * *"` · `"* * * 13 *"` · `"* * * * 8"` · `"*/0 * * * *"` · `"5-3 * * * *"` · `"@daily"` · `"? * * * *"` · `" * * * * *"` · `"a * * * *"` · `"* * * * * "` · `"* * * * FRI-MON"`
- **Arguments: `{ dialect: "k8s" }`**
  - ✅ accepts: `"@daily"` · `"@hourly"` · `"@weekly"` · `"0 0 * * ?"` · `"*/5 * * * *"`
  - ❌ rejects: `"@reboot"` · `"@sometimes"` · `"* * * *"`
- **Arguments: `{ dialect: "quartz" }`**
  - ✅ accepts: `"0 0 12 * * ?"` · `"0 15 10 ? * MON-FRI"` · `"0 0 12 1/5 * ?"` · `"0 0 0 L * ?"` · `"0 0 0 15W * ?"` · `"0 0 0 ? * 6#3"` · `"0 0 12 * * ? 2026"`
  - ❌ rejects: `"0 0 12 * *"` · `"0 0 12 * * 8"` · `"0 0 12 * * * 2026 1"` · `"60 0 12 * * ?"`
- **Arguments: `{ dialect: "aws" }`**
  - ✅ accepts: `"0 10 * * ? *"` · `"0/15 * * * ? *"` · `"0 12 ? * MON-FRI 2026"`
  - ❌ rejects: `"0 10 * * *"` · `"* * * * * * *"`

### `isYear`

- **No extra arguments**
  - ✅ accepts: `"2026"` · `2026` · `"0001"` · `"9999"`
  - ❌ rejects: `"26"` · `"20266"` · `"abc"` · `999` · `"-2026"` · `2026.5`
- **Arguments: `{ min: 1900, max: 2100 }`**
  - ✅ accepts: `2000` · `"1900"`
  - ❌ rejects: `1899` · `2101`

### `isCreditCardExpiry`

- **Arguments: `{ now: 1795608000000 }`** — Valid through the end of the stated month.
  - ✅ accepts: `"11/26"` · `"12/26"` · `"01/27"` · `"11/2026"` · `"11/46"`
  - ❌ rejects: `"10/26"` · `"13/26"` · `"00/26"` · `"1/26"` · `"12/46"` · `"11/47"` · `"11-26"` · `"11/2"`
- **Arguments: `{ now: 1795608000000, allowPast: true }`**
  - ✅ accepts: `"01/20"` · `"10/26"`
  - ❌ rejects: `"13/26"`
- **Arguments: `{ now: 1795608000000, maxYears: 5 }`**
  - ✅ accepts: `"11/31"`
  - ❌ rejects: `"12/31"`

### `isDateOfBirth`

- **Arguments: `{ now: 1795608000000 }`**
  - ✅ accepts: `"1990-05-15"` · `"2026-11-25"` · `"1876-11-26"`
  - ❌ rejects: `"2026-11-26"` · `"2027-01-01"` · `"1800-01-01"` · `"1990-02-30"` · `"1990-5-15"` · `"15/05/1990"`
- **Arguments: `{ now: 1795608000000, minAge: 18 }`**
  - ✅ accepts: `"2008-11-25"` · `"1990-01-01"`
  - ❌ rejects: `"2008-11-26"` · `"2020-01-01"`
- **Arguments: `{ now: 1795608000000, maxAge: 65 }`**
  - ✅ accepts: `"1961-11-25"`
  - ❌ rejects: `"1960-11-25"`
- **Arguments: `{ now: 1795608000000, format: "DD/MM/YYYY" }`**
  - ✅ accepts: `"15/05/1990"`
  - ❌ rejects: `"1990-05-15"` · `"31/02/1990"`

## 6. Financial

### `isCreditCard`

- **No extra arguments**
  - ✅ accepts: `"4111111111111111"` · `"4012888888881881"` · `"4222222222222"` · `"4000000000000000006"` · `"5555555555554444"` · `"5105105105105100"` · `"2223003122003222"` · `"378282246310005"` · `"371449635398431"` · `"6011111111111117"` · `"6011000990139424"` · `"6500000000000002"` · `"30569309025904"` · `"38520000023237"` · `"36000000000008"` · `"3530111333300000"` · `"3566002020360505"` · `"6250941006528599"` · `"6200000000000005"` · `"6759649826438453"` · `"5018000000000009"` · `"2200000000000004"` · `"4111 1111 1111 1111"` · `"4111-1111-1111-1111"`
  - ❌ rejects: `"4111111111111112"` · `"0000000000000000"` · `"411111111111"` · `"41111111111111111111"` · `"abcd"` · `"4111 1111 1111 111a"` · `""` · `"4111  1111 1111 1111 "` · `"1234567812345670"`
- **Arguments: `{ strict: true }`**
  - ✅ accepts: `"4111111111111111"`
  - ❌ rejects: `"4111 1111 1111 1111"` · `"4111-1111-1111-1111"`
- **Arguments: `{ brands: ["visa"] }`**
  - ✅ accepts: `"4111111111111111"`
  - ❌ rejects: `"5555555555554444"` · `"378282246310005"`
- **Arguments: `{ brands: ["amex", "mastercard"] }`**
  - ✅ accepts: `"378282246310005"` · `"5555555555554444"`
  - ❌ rejects: `"4111111111111111"`
- **Arguments: `{ allowUnknownBrand: true }`**
  - ✅ accepts: `"0000000000000000"` · `"4111111111111111"`
  - ❌ rejects: `"0000000000000001"`

### `getCardBrand`

- **No extra arguments** — The brand comes from the prefix and length only. The Luhn digit is not checked.
  - `"4111111111111111"` → `"visa"`
  - `"5555 5555 5555 4444"` → `"mastercard"`
  - `"2223003122003222"` → `"mastercard"`
  - `"378282246310005"` → `"amex"`
  - `"6011111111111117"` → `"discover"`
  - `"30569309025904"` → `"diners"`
  - `"3530111333300000"` → `"jcb"`
  - `"6250941006528599"` → `"unionpay"`
  - `"6759649826438453"` → `"maestro"`
  - `"2200000000000004"` → `"mir"`
  - `"5061000000000008"` → `"verve"`
  - `"4111111111111112"` → `"visa"`
  - `"1234"` → `null`
  - `"41"` → `null`
  - `"abc"` → `null`
  - `""` → `null`
  - `undefined` → `null`
  - `42` → `null`

### `isCvv`

- **No extra arguments**
  - ✅ accepts: `"123"` · `"1234"` · `"000"`
  - ❌ rejects: `"12"` · `"12345"` · `"12a"` · `""` · `" 123"`
- **Arguments: `{ brand: "amex" }`**
  - ✅ accepts: `"1234"`
  - ❌ rejects: `"123"`
- **Arguments: `{ brand: "visa" }`**
  - ✅ accepts: `"123"`
  - ❌ rejects: `"1234"`

### `isLuhn`

- **No extra arguments**
  - ✅ accepts: `"79927398713"` · `"4111111111111111"` · `"00"`
  - ❌ rejects: `"79927398710"` · `"1"` · `""` · `"4111 1111"` · `"abc"`

### `isIban`

- **No extra arguments**
  - ✅ accepts: `"GB82WEST12345698765432"` · `"GB82 WEST 1234 5698 7654 32"` · `"DE89370400440532013000"` · `"FR1420041010050500013M02606"` · `"NL91ABNA0417164300"` · `"ES9121000418450200051332"` · `"NO9386011117947"` · `"IT60X0542811101000000123456"` · `"CH9300762011623852957"` · `"BE68539007547034"` · `"PL61109010140000071219812874"` · `"SE4550000000058398257466"` · `"SA0380000000608010167519"` · `"AE070331234567890123456"` · `"BR1800360305000010009795493C1"` · `"PT50000201231234567890154"` · `"TR330006100519786457841326"` · `"IE29AIBK93115212345678"` · `"LU280019400644750000"` · `"AT611904300234573201"` · `"DK5000400440116243"` · `"FI2112345600000785"` · `"GR1601101250000000012300695"` · `"HU42117730161111101800000000"` · `"CZ6508000000192000145399"` · `"RO49AAAA1B31007593840000"` · `"LT121000011101001000"` · `"KW81CBKU0000000000001234560101"` · `"QA58DOHB00001234567890ABCDEFG"` · `"EG380019000500000000263180002"` · `"UA213223130000026007233566001"` · `"RU0304452522540817810538091310419"` · `"IL620108000000099999999"` · `"JO94CBJO0010000000000131000302"`
  - ❌ rejects: `"GB82WEST12345698765433"` · `"GB82WEST1234569876543"` · `"XX82WEST12345698765432"` · `"gb82west12345698765432"` · `"DE89370400440532013001"` · `"GB82-WEST-1234-5698-7654-32"` · `""` · `"GB82"` · `"1234567890123456"`
- **Arguments: `{ strict: true }`**
  - ✅ accepts: `"GB82WEST12345698765432"`
  - ❌ rejects: `"GB82 WEST 1234 5698 7654 32"`
- **Arguments: `{ allowLowercase: true }`**
  - ✅ accepts: `"gb82west12345698765432"` · `"GB82WEST12345698765432"`
  - ❌ rejects: `"gb82west12345698765433"`

### `isBic`

- **No extra arguments**
  - ✅ accepts: `"DEUTDEFF"` · `"DEUTDEFF500"` · `"NWBKGB2L"` · `"BOFAUS3N"` · `"CITIUS33XXX"` · `"GTBINGLA"`
  - ❌ rejects: `"ABCD1234"` · `"DEUTDEFF50"` · `"deutdeff"` · `"DEUTXXFF"` · `"DEUTDEF"` · `"DEUTDEFF5000"`

### `isAbaRouting`

- **No extra arguments**
  - ✅ accepts: `"011000015"` · `"021000021"` · `"111000025"` · `"121000248"`
  - ❌ rejects: `"011000016"` · `"01100001"` · `"0110000150"` · `"abcdefghi"` · `"991000000"`

### `isSortCode`

- **No extra arguments**
  - ✅ accepts: `"12-34-56"` · `"123456"` · `"12 34 56"`
  - ❌ rejects: `"12-34-5"` · `"1234-56"` · `"12-3456"` · `"ab-cd-ef"`
- **Arguments: `{ strict: true }`**
  - ✅ accepts: `"123456"`
  - ❌ rejects: `"12-34-56"`

### `isNuban`

- **No extra arguments**
  - ✅ accepts: `"0123456789"` · `"0001135681"`
  - ❌ rejects: `"012345678"` · `"01234567890"` · `"012345678a"`
- **Arguments: `"058"`**
  - ✅ accepts: `"0001135681"`
  - ❌ rejects: `"0001135682"` · `"1234567895"`
- **Arguments: `"044"`**
  - ✅ accepts: `"1234567895"`
  - ❌ rejects: `"1234567896"`
- **Arguments: `"58"`** — The bank code is three digits.
  - ❌ rejects: `"0001135681"`

### `isUpiId`

- **No extra arguments**
  - ✅ accepts: `"user@okaxis"` · `"john.doe-1@ybl"` · `"9876543210@paytm"`
  - ❌ rejects: `"user"` · `"user@"` · `"@okaxis"` · `"user@ok"` · `"user @okaxis"` · `"u@okaxis"`

### `isBankAccount`

- **Arguments: `"US"`**
  - ✅ accepts: `"12345678"` · `"000123456789"`
  - ❌ rejects: `"123"` · `"abc"`
- **Arguments: `"GB"`**
  - ✅ accepts: `"12345678"`
  - ❌ rejects: `"1234567"` · `"123456789"`
- **Arguments: `"NG"`**
  - ✅ accepts: `"0123456789"`
  - ❌ rejects: `"012345678"`
- **Arguments: `"IN"`**
  - ✅ accepts: `"123456789"` · `"123456789012345678"`
  - ❌ rejects: `"12345678"`
- **Arguments: `"ZZ"`**
  - ❌ rejects: `"12345678"`
- **No extra arguments**
  - ❌ rejects: `"12345678"`

### `isCurrencyCode`

- **No extra arguments**
  - ✅ accepts: `"USD"` · `"NGN"` · `"EUR"` · `"JPY"` · `"GBP"` · `"ZWG"` · `"KES"` · `"ZAR"` · `"XCG"`
  - ❌ rejects: `"ANG"` · `"usd"` · `"US"` · `"USDD"` · `"XXX"` · `"BGN"` · `"HRK"` · `"ABC"` · `""`
- **Arguments: `{ allowSpecial: true }`**
  - ✅ accepts: `"XAU"` · `"XXX"` · `"XDR"` · `"USD"`
  - ❌ rejects: `"ABC"`

### `isBitcoinAddress`

- **No extra arguments**
  - ✅ accepts: `"1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"` · `"3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy"` · `"bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq"` · `"bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4"` · `"BC1QW508D6QEJXTDG4Y5R3ZARVARY0C5XW7KV8F3T4"` · `"bc1p0xlxvlhemja6c4dqv22uapctqupfhlxm9h8z3k2e72q4k9hcz7vqzk5jj0"` · `"1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNb"`
  - ❌ rejects: `"0A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"` · `"bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5md"` · `"Bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4"` · `"tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx"` · `"1A1zP1eP5QGefi2DMPTfTL5SLmv7Divf0a"` · `""`
- **Arguments: `{ checksum: true }`** — Base58Check and Bech32 / Bech32m checksums.
  - ✅ accepts: `"1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"` · `"3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy"` · `"bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq"` · `"bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4"` · `"BC1QW508D6QEJXTDG4Y5R3ZARVARY0C5XW7KV8F3T4"` · `"bc1p0xlxvlhemja6c4dqv22uapctqupfhlxm9h8z3k2e72q4k9hcz7vqzk5jj0"`
  - ❌ rejects: `"1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNb"` · `"bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdp"`

### `isEvmAddress`

- **No extra arguments**
  - ✅ accepts: `"0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed"` · `"0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaed"` · `"0x5AAEB6053F3E94C9B9A09F33669435E7EF1BEAED"` · `"0x5AAeb6053F3E94C9b9A09f33669435E7Ef1BeAed"`
  - ❌ rejects: `"0x123"` · `"5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed"` · `"0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAeg"` · `"0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAedd"` · `""`
- **Arguments: `{ checksum: true }`** — EIP-55: mixed case must carry the checksum; all-lower and all-upper pass.
  - ✅ accepts: `"0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed"` · `"0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359"` · `"0xdbF03B407c01E7cD3CBea99509d93f8DDDC8C6FB"` · `"0xD1220A0cf47c7B9Be7A2E6BA89F429762e7b9aDb"` · `"0x52908400098527886E0F7030069857D2E4169EE7"` · `"0xde709f2102306220921060314715629080e2fb77"` · `"0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaed"`
  - ❌ rejects: `"0x5AAeb6053F3E94C9b9A09f33669435E7Ef1BeAed"` · `"0xfb6916095ca1df60bB79Ce92cE3Ea74c37c5d359"`
- **Arguments: `{ checksum: "require" }`**
  - ✅ accepts: `"0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed"` · `"0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359"`
  - ❌ rejects: `"0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaed"` · `"0x5AAeb6053F3E94C9b9A09f33669435E7Ef1BeAed"`

### `isCryptoAddress`

- **Arguments: `"bitcoin"`**
  - ✅ accepts: `"1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"`
  - ❌ rejects: `"0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed"`
- **Arguments: `"ethereum"`**
  - ✅ accepts: `"0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed"`
  - ❌ rejects: `"1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"`
- **Arguments: `"litecoin"`**
  - ✅ accepts: `"LW5v6JXmj54omLidkuVKnRyjP2WPBg8Y4E"`
  - ❌ rejects: `"XW5v6JXmj54omLidkuVKnRyjP2WPBg8Y4E"`
- **Arguments: `"dogecoin"`**
  - ✅ accepts: `"DyNoVKf58ZTBqNAYT3j5qcdsyuMNmPfYet"`
  - ❌ rejects: `"Xyn"`
- **Arguments: `"solana"`**
  - ✅ accepts: `"So11111111111111111111111111111111111111112"`
  - ❌ rejects: `"So1111"` · `"0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed"`
- **Arguments: `"tron"`**
  - ✅ accepts: `"TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"`
  - ❌ rejects: `"TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6u"` · `"1R7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"`
- **Arguments: `"xrp"`**
  - ✅ accepts: `"rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh"`
  - ❌ rejects: `"xHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh"` · `"r0Hb9CJAWyB4rj91VRWn96DkukG4bwdtyTh"`
- **Arguments: `"cosmos"`**
  - ✅ accepts: `"cosmos1hsk6jryyqjfhp5dhc55tc9jtckygx0eph6dd02"`
  - ❌ rejects: `"cosmos1hsk6"`
- **Arguments: `"nosuchchain"`**
  - ❌ rejects: `"1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"`
- **No extra arguments**
  - ❌ rejects: `"1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"`

### `isTxHash`

- **No extra arguments**
  - ✅ accepts: `"0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"`
  - ❌ rejects: `"0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"` · `"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"` · `"0xgggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg"`
- **Arguments: `"evm"`**
  - ✅ accepts: `"0x0000000000000000000000000000000000000000000000000000000000000000"`
  - ❌ rejects: `"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"`
- **Arguments: `"bitcoin"`**
  - ✅ accepts: `"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"` · `"FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"`
  - ❌ rejects: `"0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"`
- **Arguments: `"tron"`**
  - ✅ accepts: `"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"`
  - ❌ rejects: `"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"`
- **Arguments: `"solana"`**
  - ✅ accepts: `"MASi45ub7Qe4ZE36UT5G6cU4ud8Fhhe4deS4F3cw"… (88 chars)`
  - ❌ rejects: `"abc"`
- **Arguments: `"nosuchchain"`**
  - ❌ rejects: `"0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"`

### `isVatNumber`

- **No extra arguments**
  - ✅ accepts: `"BE0123456749"` · `"DE136695976"` · `"DK12345674"` · `"IT01234567897"` · `"SE556703748501"` · `"PL5261025237"` · `"FI20774740"` · `"FR44732829320"` · `"NL123456789B01"` · `"ESX1234567Z"` · `"ATU12345678"` · `"GB123456789"` · `"GB123456789012"` · `"GBGD001"` · `"EL123456789"` · `"NO123456789MVA"` · `"IE1234567T"` · `"IE1234567FA"` · `"BG123456789"` · `"CY12345678X"` · `"CZ12345678"` · `"EE123456789"` · `"HR12345678901"` · `"HU12345678"` · `"LT123456789"` · `"LU12345678"` · `"LV12345678901"` · `"MT12345678"` · `"PT123456789"` · `"RO12"` · `"SI12345678"` · `"SK1234567890"` · `"XI123456789"` · `"DE 136 695 976"` · `"DE136.695.976"`
  - ❌ rejects: `"BE0123456748"` · `"DE136695977"` · `"DK12345675"` · `"IT01234567898"` · `"SE556703748401"` · `"PL5261025238"` · `"FI20774741"` · `"FR45732829320"` · `"DE13669597"` · `"XX123456789"` · `"136695976"` · `"FR1"` · `"ATU1234567"` · `""`
- **Arguments: `{ strict: true }`**
  - ✅ accepts: `"DE136695976"`
  - ❌ rejects: `"DE 136 695 976"`
- **Arguments: `{ country: "DE" }`**
  - ✅ accepts: `"DE136695976"`
  - ❌ rejects: `"FR44732829320"`

### `isIsin`

- **No extra arguments**
  - ✅ accepts: `"US0378331005"` · `"GB0002634946"` · `"DE000BAY0017"` · `"AU0000XVGZA3"`
  - ❌ rejects: `"US0378331006"` · `"US037833100"` · `"us0378331005"` · `"1S0378331005"`

### `isLei`

- **No extra arguments**
  - ✅ accepts: `"5493001KJTIIGC8Y1R12"` · `"HWUPKR0MPOU8FGXBT394"`
  - ❌ rejects: `"5493001KJTIIGC8Y1R13"` · `"5493001KJTIIGC8Y1R1"` · `"5493001KJTIIGC8Y1RAA"`

### `isCusip`

- **No extra arguments**
  - ✅ accepts: `"037833100"` · `"17275R102"` · `"38259P508"`
  - ❌ rejects: `"037833101"` · `"03783310"` · `"037833100X"`

### `isTicker`

- **No extra arguments**
  - ✅ accepts: `"AAPL"` · `"BRK.B"` · `"BF-B"` · `"T"` · `"GOOGL"` · `"A1"` · `"SPY"`
  - ❌ rejects: `"aapl"` · `"1AAPL"` · `"AAPL!"` · `"TOOLONGSYMBOL"` · `"AA PL"` · `".A"`

## 7. Products, publications and devices

### `isIsbn`

- **No extra arguments**
  - ✅ accepts: `"0306406152"` · `"978-0-306-40615-7"` · `"9780306406157"` · `"080442957X"` · `"0-8044-2957-X"` · `"0 306 40615 2"` · `"080442957x"` · `"9791090636071"`
  - ❌ rejects: `"0306406153"` · `"9780306406158"` · `"030640615"` · `"978030640615"` · `"abc"` · `"1234567890"` · `"978-0-306-40615-8"`
- **Arguments: `{ version: 10 }`**
  - ✅ accepts: `"0306406152"`
  - ❌ rejects: `"9780306406157"`
- **Arguments: `{ version: 13 }`**
  - ✅ accepts: `"9780306406157"`
  - ❌ rejects: `"0306406152"`
- **Arguments: `{ strict: true }`**
  - ✅ accepts: `"9780306406157"` · `"0306406152"`
  - ❌ rejects: `"978-0-306-40615-7"` · `"0-306-40615-2"`

### `isIssn`

- **No extra arguments**
  - ✅ accepts: `"0378-5955"` · `"2049-3630"` · `"2434-561X"` · `"03785955"`
  - ❌ rejects: `"0378-5954"` · `"2434-5611"` · `"0378-59555"` · `"037-85955"` · `"0378 5955"` · `"abcd-efgh"`
- **Arguments: `{ strict: true }`**
  - ✅ accepts: `"03785955"`
  - ❌ rejects: `"0378-5955"`

### `isEan`

- **No extra arguments**
  - ✅ accepts: `"4006381333931"` · `"96385074"` · `"5901234123457"` · `"73513537"`
  - ❌ rejects: `"4006381333932"` · `"96385075"` · `"400638133393"` · `"abc"` · `"123"`

### `isUpc`

- **No extra arguments**
  - ✅ accepts: `"036000291452"` · `"042100005264"` · `"01234565"`
  - ❌ rejects: `"036000291453"` · `"01234566"` · `"12345"` · `"21234565"` · `"abcdefghijkl"`

### `isGtin`

- **No extra arguments**
  - ✅ accepts: `"4006381333931"` · `"036000291452"` · `"96385074"` · `"10012345678902"`
  - ❌ rejects: `"123456789"` · `"4006381333932"` · `"10012345678903"`

### `isIsrc`

- **No extra arguments**
  - ✅ accepts: `"USRC17607839"` · `"US-RC1-76-07839"` · `"GBAYE0601498"`
  - ❌ rejects: `"usrc17607839"` · `"USRC1760783"` · `"US-RC1-76-0783"` · `"1SRC17607839"`
- **Arguments: `{ strict: true }`**
  - ✅ accepts: `"USRC17607839"`
  - ❌ rejects: `"US-RC1-76-07839"`

### `isDoi`

- **No extra arguments**
  - ✅ accepts: `"10.1038/nphys1170"` · `"10.1000/xyz123"` · `"10.1000.10/123456"` · `"10.5555/12345678"`
  - ❌ rejects: `"10.123/abc"` · `"11.1038/abc"` · `"10.1038"` · `"10.1038/"` · `"doi:10.1038/nphys1170"`
- **Arguments: `{ allowPrefix: true }`**
  - ✅ accepts: `"doi:10.1038/nphys1170"` · `"https://doi.org/10.1038/nphys1170"` · `"10.1038/nphys1170"`
  - ❌ rejects: `"doi:11.1038/x"`

### `isOrcid`

- **No extra arguments**
  - ✅ accepts: `"0000-0002-1825-0097"` · `"0000-0001-5109-3700"` · `"0000-0002-1694-233X"` · `"0000000218250097"`
  - ❌ rejects: `"0000-0002-1825-0098"` · `"0000-0002-1825-009"` · `"0000 0002 1825 0097"` · `"0000-0002-1694-233Y"`
- **Arguments: `{ strict: true }`**
  - ✅ accepts: `"0000000218250097"`
  - ❌ rejects: `"0000-0002-1825-0097"`

### `isImei`

- **No extra arguments**
  - ✅ accepts: `"490154203237518"` · `"356938035643809"` · `"49-015420-323751-8"` · `"490 154 203 237 518"`
  - ❌ rejects: `"490154203237519"` · `"49015420323751"` · `"4901542032375181"` · `"abc"`
- **Arguments: `{ allowSv: true }`**
  - ✅ accepts: `"4901542032375181"` · `"490154203237518"`
  - ❌ rejects: `"490154203237"`
- **Arguments: `{ strict: true }`**
  - ✅ accepts: `"490154203237518"`
  - ❌ rejects: `"49-015420-323751-8"`

### `isVin`

- **No extra arguments**
  - ✅ accepts: `"1M8GDM9AXKP042788"` · `"11111111111111111"` · `"1HGCM82633A004352"` · `"WVWZZZ1JZXW000001"`
  - ❌ rejects: `"1M8GDM9A1KP042788"` · `"1M8GDM9AXKP04278"` · `"IM8GDM9AXKP042788"` · `"1M8GDM9AOKP042788"` · `"wvwzzz1jzxw000001"` · `"1M8GDM9AQKP042788"`
- **Arguments: `{ checkDigit: false }`**
  - ✅ accepts: `"1M8GDM9A1KP042788"`
  - ❌ rejects: `"1M8GDM9AXKP04278"`

### `isLicensePlate`

- **Arguments: `"GB"`**
  - ✅ accepts: `"AB12 CDE"` · `"AB12CDE"`
  - ❌ rejects: `"A123 BCD"` · `"1234 ABC"`
- **Arguments: `"NG"`**
  - ✅ accepts: `"ABC-123-DE"` · `"ABC 123 DE"` · `"ABC123DE"`
  - ❌ rejects: `"AB-123-DE"`
- **Arguments: `"DE"`**
  - ✅ accepts: `"B AB 1234"` · `"M-AB 123"` · `"HH-AB 1234E"`
  - ❌ rejects: `"BAB1234"`
- **Arguments: `"FR"`**
  - ✅ accepts: `"AB-123-CD"`
  - ❌ rejects: `"AB123CD"`
- **Arguments: `"ES"`**
  - ✅ accepts: `"1234 BCD"` · `"1234BCD"`
  - ❌ rejects: `"1234 AEI"`
- **Arguments: `"IN"`**
  - ✅ accepts: `"MH12AB1234"` · `"MH-12-AB-1234"`
  - ❌ rejects: `"M12AB1234"`
- **Arguments: `"ZA"`**
  - ✅ accepts: `"ABC123GP"` · `"CA 123 GP"`
  - ❌ rejects: `"123ABCGP"`
- **Arguments: `"KE"`**
  - ✅ accepts: `"KCA 123A"` · `"KBZ123Z"`
  - ❌ rejects: `"ABC 123A"`
- **Arguments: `"GH"`**
  - ✅ accepts: `"GR-1234-20"`
  - ❌ rejects: `"GR1234-20"`
- **Arguments: `"BR"`**
  - ✅ accepts: `"ABC-1D23"` · `"ABC1234"`
  - ❌ rejects: `"AB-1234"`
- **Arguments: `"US"`**
  - ✅ accepts: `"ABC1234"` · `"7ABC123"`
  - ❌ rejects: `"TOOLONGPLATE"`
- **Arguments: `"ZZ"`**
  - ❌ rejects: `"ABC1234"`
- **No extra arguments**
  - ❌ rejects: `"ABC1234"`

## 8. Geography and locale

### `isPostalCode`

- **Arguments: `"GB"`**
  - ✅ accepts: `"SW1A 1AA"` · `"EC1A 1BB"` · `"M1 1AE"` · `"B33 8TH"` · `"CR2 6XH"` · `"DN55 1PT"` · `"sw1a 1aa"` · `"GIR 0AA"`
  - ❌ rejects: `"SW1A1A"` · `"12345"` · `"Q1 1AA"`
- **Arguments: `"gb"`** — Country codes are case-insensitive.
  - ✅ accepts: `"SW1A 1AA"`
- **Arguments: `"US"`**
  - ✅ accepts: `"90210"` · `"90210-1234"`
  - ❌ rejects: `"9021"` · `"90210-12"` · `"ABCDE"`
- **Arguments: `"CA"`**
  - ✅ accepts: `"K1A 0B1"` · `"K1A0B1"` · `"M5V 2T6"`
  - ❌ rejects: `"D1A 0B1"` · `"K1A 0B"`
- **Arguments: `"DE"`**
  - ✅ accepts: `"10115"` · `"01067"`
  - ❌ rejects: `"1011"` · `"00000"` · `"01000"`
- **Arguments: `"FR"`**
  - ✅ accepts: `"75001"` · `"75 001"`
  - ❌ rejects: `"7500"` · `"00100"`
- **Arguments: `"NL"`**
  - ✅ accepts: `"1011 AB"` · `"1011AB"`
  - ❌ rejects: `"0123 AB"` · `"1011 SA"` · `"1011 A"`
- **Arguments: `"NG"`**
  - ✅ accepts: `"100001"` · `"940001"`
  - ❌ rejects: `"10001"`
- **Arguments: `"IN"`**
  - ✅ accepts: `"110001"` · `"560001"`
  - ❌ rejects: `"011000"` · `"11000"`
- **Arguments: `"JP"`**
  - ✅ accepts: `"100-0001"` · `"1000001"`
  - ❌ rejects: `"100-001"`
- **Arguments: `"BR"`**
  - ✅ accepts: `"01310-100"` · `"01310100"`
  - ❌ rejects: `"01310-10"`
- **Arguments: `"AU"`**
  - ✅ accepts: `"2000"`
  - ❌ rejects: `"200"`
- **Arguments: `"ES"`**
  - ✅ accepts: `"28001"` · `"08001"` · `"52001"`
  - ❌ rejects: `"53001"` · `"00100"`
- **Arguments: `"IT"`**
  - ✅ accepts: `"00100"`
  - ❌ rejects: `"0010"`
- **Arguments: `"PL"`**
  - ✅ accepts: `"00-950"`
  - ❌ rejects: `"00950"`
- **Arguments: `"PT"`**
  - ✅ accepts: `"1000-001"`
  - ❌ rejects: `"1000001"`
- **Arguments: `"SE"`**
  - ✅ accepts: `"114 55"` · `"11455"`
  - ❌ rejects: `"1145"`
- **Arguments: `"IE"`**
  - ✅ accepts: `"D02 X285"` · `"D6W 4X23"` · `"A65 F4E2"`
  - ❌ rejects: `"D02 B285"` · `"XYZ"`
- **Arguments: `"GH"`**
  - ✅ accepts: `"GA-183-8164"` · `"AK-039-5028"`
  - ❌ rejects: `"GA1838164"`
- **Arguments: `"ZA"`**
  - ✅ accepts: `"0001"` · `"2000"`
  - ❌ rejects: `"20000"`
- **Arguments: `"KE"`**
  - ✅ accepts: `"00100"`
  - ❌ rejects: `"0100"`
- **Arguments: `"any"`**
  - ✅ accepts: `"SW1A 1AA"` · `"12345"` · `"A-123"`
  - ❌ rejects: `""` · `"!!!"` · `"ABC"` · `"11111111111111111"`
- **Arguments: `"ZZ"`**
  - ❌ rejects: `"12345"`
- **No extra arguments**
  - ❌ rejects: `"12345"`

### `isLatitude`

- **No extra arguments**
  - ✅ accepts: `"51.5074"` · `"-33.8688"` · `"0"` · `"90"` · `"-90"` · `"90.0"` · `"+45"` · `51.5074` · `0` · `-90`
  - ❌ rejects: `"90.1"` · `"-90.0001"` · `"91"` · `"abc"` · `"1e2"` · `"12."` · `".5"` · `91` · `NaN` · `"1,5"`

### `isLongitude`

- **No extra arguments**
  - ✅ accepts: `"-0.1278"` · `"180"` · `"-180"` · `"179.99999"` · `"+120"` · `3.14` · `180`
  - ❌ rejects: `"180.1"` · `"181"` · `"-181"` · `"abc"` · `181` · `Infinity`

### `isLatLong`

- **No extra arguments**
  - ✅ accepts: `"51.5074, -0.1278"` · `"51.5074,-0.1278"` · `"0,0"` · `"90,180"` · `"-90,-180"`
  - ❌ rejects: `"91,0"` · `"0,181"` · `"51.5074"` · `"51.5074 -0.1278"` · `"a,b"` · `"51.5074, -0.1278, 3"` · `"40°26′46″N 79°58′56″W"`
- **Arguments: `{ format: "dms" }`**
  - ✅ accepts: `"40°26′46″N 79°58′56″W"` · `"40°26'46\"N, 79°58'56\"W"`
  - ❌ rejects: `"40°26′46″N"` · `"40°60′46″N 79°58′56″W"` · `"91°00′00″N 0°00′00″E"` · `"51.5074, -0.1278"`
- **Arguments: `{ format: "any" }`**
  - ✅ accepts: `"51.5074, -0.1278"` · `"40°26′46″N 79°58′56″W"`
  - ❌ rejects: `"nonsense"`

### `isGeohash`

- **No extra arguments**
  - ✅ accepts: `"u4pruydqqvj"` · `"ezs42"` · `"9q8yy"`
  - ❌ rejects: `"a"` · `"ezs4a"` · `"EZS42"` · `"u4pruydqqvj12"`

### `isPlusCode`

- **No extra arguments**
  - ✅ accepts: `"8FVC9G8F+6W"` · `"9G8F+6W"` · `"8FVC0000+"` · `"8F000000+"` · `"8FVC9G8F+6WQ"`
  - ❌ rejects: `"8FVC9G8F6W"` · `"8FVC9G8F+6"` · `"8FVC9G8F+6A"` · `"8fvc9g8f+6w"` · `"8FVC00+"` · `"+6W"`

### `isCountryCode`

- **No extra arguments**
  - ✅ accepts: `"NG"` · `"US"` · `"GB"` · `"FR"` · `"JP"` · `"AX"`
  - ❌ rejects: `"ng"` · `"XX"` · `"USA"` · `"840"` · `"N"` · `"XK"` · `""`
- **Arguments: `{ format: "alpha3" }`**
  - ✅ accepts: `"NGA"` · `"USA"` · `"GBR"`
  - ❌ rejects: `"NG"` · `"XXX"` · `"nga"`
- **Arguments: `{ format: "numeric" }`**
  - ✅ accepts: `"566"` · `"840"` · `"004"`
  - ❌ rejects: `"4"` · `"999"` · `"USA"`
- **Arguments: `{ format: "any" }`**
  - ✅ accepts: `"NG"` · `"NGA"` · `"566"`
  - ❌ rejects: `"ZZZ"` · `"1"`

### `isSubdivisionCode`

- **No extra arguments**
  - ✅ accepts: `"US-CA"` · `"GB-ENG"` · `"NG-LA"` · `"FR-75"` · `"IN-MH"`
  - ❌ rejects: `"XX-AA"` · `"US-"` · `"us-ca"` · `"US-CALI"` · `"USCA"`

### `isLanguageCode`

- **No extra arguments**
  - ✅ accepts: `"en"` · `"fr"` · `"yo"` · `"ha"` · `"ig"` · `"eng"` · `"yor"`
  - ❌ rejects: `"xx"` · `"EN"` · `"e"` · `"english"` · `"e1"`
- **Arguments: `{ format: "alpha2" }`**
  - ✅ accepts: `"en"`
  - ❌ rejects: `"eng"`
- **Arguments: `{ format: "alpha3" }`**
  - ✅ accepts: `"eng"`
  - ❌ rejects: `"en"`

### `isLocale`

- **No extra arguments**
  - ✅ accepts: `"en"` · `"en-GB"` · `"zh-Hant-TW"` · `"sr-Latn-RS"` · `"es-419"` · `"de-CH-1996"` · `"en-US-u-ca-gregory"` · `"x-private"` · `"en-x-custom"` · `"fr-CA"`
  - ❌ rejects: `"en_GB"` · `"e"` · `"en-"` · `"-en"` · `"en--GB"` · `"en-GB-"` · `"1234"` · `"en-US-u"` · `"abcdefghi"` · `"en-a"`

### `isScriptCode`

- **No extra arguments**
  - ✅ accepts: `"Latn"` · `"Cyrl"` · `"Arab"` · `"Hans"` · `"Hant"` · `"Deva"` · `"Qaaa"` · `"Qabx"`
  - ❌ rejects: `"latn"` · `"LATN"` · `"Lat"` · `"Latnn"` · `"Qaby"` · `"Abcd"`

### `isIataAirport`

- **No extra arguments**
  - ✅ accepts: `"LOS"` · `"LHR"` · `"JFK"`
  - ❌ rejects: `"lh"` · `"LHRR"` · `"L1S"`

### `isIcaoAirport`

- **No extra arguments**
  - ✅ accepts: `"DNMM"` · `"EGLL"`
  - ❌ rejects: `"DNM"` · `"dnmm"` · `"DNMM1"`

### `isFlightNumber`

- **No extra arguments**
  - ✅ accepts: `"BA117"` · `"BA 117"` · `"AA1"` · `"U21234"` · `"3K123"` · `"EK783A"`
  - ❌ rejects: `"12345"` · `"BA"` · `"BA12345"` · `"ba117"`

### `isUnLocode`

- **No extra arguments**
  - ✅ accepts: `"NGLOS"` · `"NG LOS"` · `"GBLON"` · `"USNYC"`
  - ❌ rejects: `"XXLOS"` · `"NGL"` · `"NG1OS"`

## 9. National and tax identifiers

### `isSsn`

- **No extra arguments**
  - ✅ accepts: `"123-45-6789"` · `"123456789"` · `"078-05-1120"`
  - ❌ rejects: `"000-45-6789"` · `"666-45-6789"` · `"900-45-6789"` · `"123-00-6789"` · `"123-45-0000"` · `"123-456789"` · `"12345-6789"` · `"123-45-678"` · `"abc"`
- **Arguments: `{ strict: true }`**
  - ✅ accepts: `"123456789"`
  - ❌ rejects: `"123-45-6789"`

### `isEin`

- **No extra arguments**
  - ✅ accepts: `"12-3456789"` · `"123456789"` · `"95-1234567"`
  - ❌ rejects: `"07-1234567"` · `"00-1234567"` · `"12-345678"` · `"123-456789"`
- **Arguments: `{ strict: true }`**
  - ✅ accepts: `"123456789"`
  - ❌ rejects: `"12-3456789"`

### `isItin`

- **No extra arguments**
  - ✅ accepts: `"900-70-1234"` · `"912-50-1234"` · `"999-99-9999"` · `"900701234"`
  - ❌ rejects: `"800-70-1234"` · `"900-69-1234"` · `"900-93-1234"` · `"900-49-1234"`

### `isNino`

- **No extra arguments**
  - ✅ accepts: `"AB123456C"` · `"AB 12 34 56 C"` · `"AB123456"` · `"JG103759A"`
  - ❌ rejects: `"BG123456C"` · `"GB123456C"` · `"NK123456C"` · `"TN123456C"` · `"ZZ123456C"` · `"DA123456C"` · `"AO123456C"` · `"AB123456E"` · `"AB12345C"` · `"ab123456c"` · `"QQ123456C"`
- **Arguments: `{ strict: true }`**
  - ✅ accepts: `"AB123456C"`
  - ❌ rejects: `"AB 12 34 56 C"`

### `isUkCompanyNumber`

- **No extra arguments**
  - ✅ accepts: `"00445790"` · `"SC123456"` · `"NI123456"` · `"OC301234"` · `"R0001234"`
  - ❌ rejects: `"1234567"` · `"XX123456"` · `"SC12345"` · `"ABCDEFGH"`

### `isSin`

- **No extra arguments** — Numbers starting with 0 or 8 are never issued, so the well-known sample 046 454 286 is rejected.
  - ✅ accepts: `"130692544"` · `"130 692 544"` · `"130-692-544"` · `"123456782"`
  - ❌ rejects: `"130692545"` · `"000000000"` · `"846454286"` · `"046454286"` · `"13069254"` · `"1306925440"`
- **Arguments: `{ strict: true }`**
  - ✅ accepts: `"130692544"`
  - ❌ rejects: `"130 692 544"`

### `isNin`

- **No extra arguments**
  - ✅ accepts: `"12345678901"`
  - ❌ rejects: `"1234567890"` · `"123456789012"` · `"1234567890a"`

### `isBvn`

- **No extra arguments**
  - ✅ accepts: `"22123456789"`
  - ❌ rejects: `"2212345678"` · `"221234567890"`

### `isNigeriaTin`

- **No extra arguments**
  - ✅ accepts: `"12345678-0001"` · `"1234567890"` · `"123456789012"`
  - ❌ rejects: `"12345"` · `"12345678-001"` · `"abcdefghij"`

### `isAadhaar`

- **No extra arguments**
  - ✅ accepts: `"234123412346"` · `"2341 2341 2346"` · `"2341-2341-2346"` · `"999999999999"`
  - ❌ rejects: `"234123412347"` · `"034123412346"` · `"134123412346"` · `"23412341234"` · `"2341 2341 234"`
- **Arguments: `{ strict: true }`**
  - ✅ accepts: `"234123412346"`
  - ❌ rejects: `"2341 2341 2346"`

### `isPan`

- **No extra arguments**
  - ✅ accepts: `"ABCPE1234F"` · `"AAAPL1234C"`
  - ❌ rejects: `"ABCZE1234F"` · `"abcpe1234f"` · `"ABCPE12345"` · `"ABCPE1234"`

### `isGstin`

- **No extra arguments**
  - ✅ accepts: `"27AAPFU0939F1ZV"` · `"22AAAAA0000A1ZC"` · `"29AABCT1332L1ZA"`
  - ❌ rejects: `"27AAPFU0939F1ZW"` · `"40AAPFU0939F1ZV"` · `"27AAPFU0939F1XV"` · `"27aapfu0939f1zv"` · `"27AAPFU0939F1Z"`

### `isIfsc`

- **No extra arguments**
  - ✅ accepts: `"SBIN0001234"` · `"HDFC0000123"` · `"ICIC0ABC123"`
  - ❌ rejects: `"SBIN1001234"` · `"SBI0001234"` · `"sbin0001234"` · `"SBIN000123"`

### `isCpf`

- **No extra arguments**
  - ✅ accepts: `"12345678909"` · `"123.456.789-09"` · `"11144477735"`
  - ❌ rejects: `"12345678900"` · `"11111111111"` · `"123.456.789-00"` · `"123456789-09"` · `"123.456.78909"` · `"1234567890"`
- **Arguments: `{ strict: true }`**
  - ✅ accepts: `"12345678909"`
  - ❌ rejects: `"123.456.789-09"`

### `isCnpj`

- **No extra arguments**
  - ✅ accepts: `"11222333000181"` · `"11.222.333/0001-81"` · `"11444777000161"` · `"12ABC34501DE35"` · `"12.ABC.345/01DE-35"`
  - ❌ rejects: `"11222333000182"` · `"00000000000000"` · `"12ABC34501DE36"` · `"12abc34501de35"` · `"11.222.333/0001-8"` · `"112223330001"`
- **Arguments: `{ strict: true }`**
  - ✅ accepts: `"12ABC34501DE35"`
  - ❌ rejects: `"12.ABC.345/01DE-35"`

### `isDni`

- **No extra arguments**
  - ✅ accepts: `"12345678Z"` · `"12345678-Z"`
  - ❌ rejects: `"12345678A"` · `"1234567Z"` · `"12345678z"`
- **Arguments: `{ strict: true }`**
  - ✅ accepts: `"12345678Z"`
  - ❌ rejects: `"12345678-Z"`

### `isNie`

- **No extra arguments**
  - ✅ accepts: `"X1234567L"` · `"Y1234567X"` · `"Z1234567R"`
  - ❌ rejects: `"X1234567A"` · `"A1234567L"` · `"X123456L"`

### `isCif`

- **No extra arguments**
  - ✅ accepts: `"A58818501"` · `"B12345674"` · `"Q2826000H"` · `"P0000001H"`
  - ❌ rejects: `"A5881850A"` · `"Q28260008"` · `"B12345675"` · `"I12345674"` · `"A5881850"`

### `isNir`

- **No extra arguments**
  - ✅ accepts: `"184127645108946"` · `"1 84 12 76 451 089 46"` · `"269052300000151"` · `"185012A12345666"`
  - ❌ rejects: `"184127645108947"` · `"384127645108946"` · `"184137645108946"` · `"18412764510894"`
- **Arguments: `{ strict: true }`**
  - ✅ accepts: `"184127645108946"`
  - ❌ rejects: `"1 84 12 76 451 089 46"`

### `isSiren`

- **No extra arguments**
  - ✅ accepts: `"732829320"` · `"552100554"` · `"732 829 320"`
  - ❌ rejects: `"732829321"` · `"73282932"` · `"abcdefghi"`

### `isSiret`

- **No extra arguments** — La Poste establishments (356000000...) use a digit-sum rule instead of Luhn.
  - ✅ accepts: `"73282932000074"` · `"732 829 320 00074"` · `"35600000000001"`
  - ❌ rejects: `"73282932000075"` · `"7328293200007"` · `"35600000000002"`

### `isSteuerId`

- **No extra arguments**
  - ✅ accepts: `"86095742719"` · `"86 095 742 719"`
  - ❌ rejects: `"86095742710"` · `"06095742719"` · `"86095742718"` · `"12345678901"` · `"11111111119"`

### `isUstId`

- **No extra arguments**
  - ✅ accepts: `"DE136695976"` · `"DE 136 695 976"`
  - ❌ rejects: `"DE136695977"` · `"FR44732829320"` · `"136695976"`

### `isCodiceFiscale`

- **No extra arguments** — Includes omocodia variants, where digits are replaced by LMNPQRSTUV.
  - ✅ accepts: `"RSSMRA85T10A562S"` · `"BNCGPP80A01H501E"` · `"RSSMRA85T10A56NH"` · `"RSSMRA85T10A5MNN"`
  - ❌ rejects: `"RSSMRA85T10A562T"` · `"RSSMRA85T10A562"` · `"RSSMRA85X10A562S"` · `"RSSMRA85T32A562S"` · `"rssmra85t10a562s"`

### `isPartitaIva`

- **No extra arguments**
  - ✅ accepts: `"01234567897"` · `"0123 456 7897"`
  - ❌ rejects: `"01234567898"` · `"00000000000"` · `"1234567890"`

### `isBsn`

- **No extra arguments**
  - ✅ accepts: `"111222333"` · `"10000008"` · `"111 222 333"`
  - ❌ rejects: `"111222334"` · `"000000000"` · `"12345678a"`

### `isPesel`

- **No extra arguments**
  - ✅ accepts: `"44051401359"` · `"02271409867"`
  - ❌ rejects: `"44051401358"` · `"44131401359"` · `"4405140135"` · `"abcdefghijk"` · `"02211409862"`

### `isNip`

- **No extra arguments**
  - ✅ accepts: `"5261025237"` · `"526-102-52-37"`
  - ❌ rejects: `"5261025238"` · `"123456789"` · `"1234567890"`

### `isRegon`

- **No extra arguments**
  - ✅ accepts: `"123456785"` · `"12345678512347"`
  - ❌ rejects: `"123456786"` · `"12345678512348"` · `"12345678"` · `"12345678512340"`

### `isPersonnummer`

- **No extra arguments**
  - ✅ accepts: `"811228-9874"` · `"8112289874"` · `"19811228-9874"` · `"198112289874"` · `"640823-3234"` · `"701063-2391"`
  - ❌ rejects: `"811228-9875"` · `"811328-9874"` · `"811232-9874"` · `"811228+987"` · `"abc"`

### `isCurp`

- **No extra arguments**
  - ✅ accepts: `"HEGG560427MVZRRL04"` · `"GODE561231HDFMRL06"`
  - ❌ rejects: `"HEGG560427MVZRRL05"` · `"HEGG560427MXXRRL04"` · `"HEGG561327MVZRRL04"` · `"hegg560427mvzrrl04"`

### `isRfcMx`

- **No extra arguments**
  - ✅ accepts: `"GODE561231GR8"` · `"ABC010101AB1"`
  - ❌ rejects: `"GODE561331GR8"` · `"AB010101AB1"` · `"GODE561231GR"`

### `isTfn`

- **No extra arguments**
  - ✅ accepts: `"123456782"` · `"123 456 782"`
  - ❌ rejects: `"123456783"` · `"12345678"` · `"abc"`

### `isAbn`

- **No extra arguments**
  - ✅ accepts: `"51824753556"` · `"51 824 753 556"`
  - ❌ rejects: `"51824753557"` · `"01824753556"` · `"5182475355"`

### `isChineseId`

- **No extra arguments**
  - ✅ accepts: `"11010519491231002X"` · `"440301199001011234"`
  - ❌ rejects: `"11010519491231002Y"` · `"11010519491331002X"` · `"01010519491231002X"` · `"1101051949123100"`

### `isMyNumber`

- **No extra arguments**
  - ✅ accepts: `"123456789018"` · `"1234 5678 9018"`
  - ❌ rejects: `"123456789019"` · `"12345678901"`

### `isRrn`

- **No extra arguments**
  - ✅ accepts: `"800101-1234567"` · `"8001011234567"` · `"0001013234567"`
  - ❌ rejects: `"801301-1234567"` · `"800101-0234567"` · `"800101-1234"` · `"abc"`
- **Arguments: `{ checksum: true }`**
  - ✅ accepts: `"8001011234560"` · `"800101-1234560"`
  - ❌ rejects: `"8001011234567"`

### `isNric`

- **No extra arguments**
  - ✅ accepts: `"S1234567D"` · `"T0123456G"` · `"F1234567N"` · `"G1234567X"`
  - ❌ rejects: `"S1234567A"` · `"A1234567D"` · `"S123456D"` · `"s1234567d"`

### `isUen`

- **No extra arguments**
  - ✅ accepts: `"53123456A"` · `"201912345K"` · `"T08LL0001A"`
  - ❌ rejects: `"5312345A"` · `"T08LL001A"` · `"12345678"`

### `isSaId`

- **No extra arguments**
  - ✅ accepts: `"8001015009087"` · `"9002281234085"`
  - ❌ rejects: `"8001015009088"` · `"8013015009087"` · `"800101500908"` · `"8001015009287"`

### `isKraPin`

- **No extra arguments**
  - ✅ accepts: `"A123456789Z"` · `"P051234567X"`
  - ❌ rejects: `"B123456789Z"` · `"A12345678Z"` · `"a123456789z"`

### `isKenyaId`

- **No extra arguments**
  - ✅ accepts: `"12345678"` · `"1234567"`
  - ❌ rejects: `"123456"` · `"123456789"` · `"1234567a"`

### `isGhanaCard`

- **No extra arguments**
  - ✅ accepts: `"GHA-123456789-0"`
  - ❌ rejects: `"GHA-12345678-0"` · `"GHA123456789-0"` · `"gha-123456789-0"`

### `isEmiratesId`

- **No extra arguments**
  - ✅ accepts: `"784-1985-1234567-3"` · `"784198512345673"`
  - ❌ rejects: `"784-1985-1234567-4"` · `"785-1985-1234567-3"` · `"784-1985-123456-3"`
- **Arguments: `{ strict: true }`**
  - ✅ accepts: `"784198512345673"`
  - ❌ rejects: `"784-1985-1234567-3"`

### `isUaeTrn`

- **No extra arguments**
  - ✅ accepts: `"100123456700003"`
  - ❌ rejects: `"10012345670000"` · `"abcdefghijklmno"`

### `isTckn`

- **No extra arguments**
  - ✅ accepts: `"10000000146"` · `"12345678950"`
  - ❌ rejects: `"10000000147"` · `"00000000146"` · `"1234567890"` · `"12345678951"`

### `isVkn`

- **No extra arguments**
  - ✅ accepts: `"1234567890"`
  - ❌ rejects: `"1234567891"` · `"123456789"`

### `isCuit`

- **No extra arguments**
  - ✅ accepts: `"20-12345678-6"` · `"30-71234567-1"` · `"27-12345678-0"` · `"20123456786"`
  - ❌ rejects: `"20-12345678-7"` · `"10-12345678-6"` · `"2012345678"` · `"20-1234567-6"`

### `isDniAr`

- **No extra arguments**
  - ✅ accepts: `"12345678"` · `"1234567"` · `"12.345.678"`
  - ❌ rejects: `"123456"` · `"123456789"` · `"12-345-678"`
- **Arguments: `{ strict: true }`**
  - ✅ accepts: `"12345678"`
  - ❌ rejects: `"12.345.678"`

## 10. Colours

### `isHexColor`

- **No extra arguments**
  - ✅ accepts: `"#fff"` · `"#ffffff"` · `"#FFF"` · `"#1a2B3c"`
  - ❌ rejects: `"fff"` · `"#ff"` · `"#ffff"` · `"#fffffff"` · `"#ffffff80"` · `"#ggg"` · `"red"` · `"# fff"`
- **Arguments: `{ allowAlpha: true }`**
  - ✅ accepts: `"#ffffff80"` · `"#fff8"` · `"#fff"` · `"#ffffff"`
  - ❌ rejects: `"#fffff"` · `"#ffffff8"`
- **Arguments: `{ allowShort: false }`**
  - ✅ accepts: `"#ffffff"`
  - ❌ rejects: `"#fff"`
- **Arguments: `{ allowShort: false, allowAlpha: true }`**
  - ✅ accepts: `"#ffffff80"`
  - ❌ rejects: `"#fff8"`
- **Arguments: `{ requireHash: false }`**
  - ✅ accepts: `"fff"` · `"ffffff"` · `"#fff"`
  - ❌ rejects: `"ff"`

### `isRgbColor`

- **No extra arguments**
  - ✅ accepts: `"rgb(255, 0, 0)"` · `"rgb(255,0,0)"` · `"rgba(255, 0, 0, 0.5)"` · `"rgb(100%, 0%, 0%)"` · `"rgb(255 0 0)"` · `"rgb(255 0 0 / 50%)"` · `"rgb(255 0 0 / 0.5)"` · `"RGB(0, 128, 255)"` · `"rgb(10.5, 20, 30)"` · `"rgb(100% 0 0)"`
  - ❌ rejects: `"rgb(256, 0, 0)"` · `"rgb(-1, 0, 0)"` · `"rgb(255, 0)"` · `"rgb(255 0 0 0)"` · `"rgb(100%, 0, 0)"` · `"rgba(255, 0, 0, 2)"` · `"rgb(255 0 0 / )"` · `"rgb 255 0 0"` · `"rgb(255, 0, 0"` · `"rgb(a, b, c)"` · `"rgb(101%, 0%, 0%)"` · `"#ff0000"`

### `isHslColor`

- **No extra arguments**
  - ✅ accepts: `"hsl(120, 100%, 50%)"` · `"hsla(120, 100%, 50%, 0.3)"` · `"hsl(120deg 100% 50%)"` · `"hsl(0.5turn 50% 50% / 0.5)"` · `"hsl(3.14rad, 50%, 50%)"` · `"hsl(400, 50%, 50%)"`
  - ❌ rejects: `"hsl(120, 100, 50)"` · `"hsl(120, 101%, 50%)"` · `"hsl(120, 100%)"` · `"hsl(abc, 50%, 50%)"` · `"hsl(120, 100%, 50%, 2)"` · `"hsl 120 100% 50%"`

### `isCssColor`

- **No extra arguments**
  - ✅ accepts: `"red"` · `"RebeccaPurple"` · `"transparent"` · `"currentColor"` · `"#fff"` · `"#ffffff80"` · `"rgb(1, 2, 3)"` · `"hsl(0, 0%, 0%)"` · `"lightgoldenrodyellow"` · `"grey"`
  - ❌ rejects: `"notacolor"` · `"#ggg"` · `"rgb(1, 2)"` · `"redd"` · `""`

## 11. Software and developer tooling

### `isSemver`

- **No extra arguments**
  - ✅ accepts: `"0.0.4"` · `"1.2.3"` · `"10.20.30"` · `"1.1.2-prerelease+meta"` · `"1.0.0-alpha"` · `"1.0.0-alpha.1"` · `"1.0.0-0.3.7"` · `"1.0.0-x.7.z.92"` · `"1.0.0+20130313144700"` · `"1.0.0-beta+exp.sha.5114f85"` · `"1.0.0-rc.1"`
  - ❌ rejects: `"1"` · `"1.2"` · `"1.2.3.4"` · `"01.2.3"` · `"1.02.3"` · `"1.2.03"` · `"1.2.3-"` · `"1.2.3-01"` · `"1.2.3+"` · `"v1.2.3"` · `"a.b.c"` · `"1.2.3 "` · `"-1.2.3"`
- **Arguments: `{ allowPrefix: true }`**
  - ✅ accepts: `"v1.2.3"` · `"1.2.3"` · `"V1.0.0-rc.1"`
  - ❌ rejects: `"vv1.2.3"` · `"v1.2"`

### `isSemverRange`

- **No extra arguments**
  - ✅ accepts: `"^1.2.3"` · `"~1.2.3"` · `">=1 <2"` · `">=1.2.3 <2.0.0"` · `"1.x || 2.x"` · `"1.2.3 - 2.3.4"` · `"*"` · `"1.x"` · `">= 1.2.3"` · `"<=2.0.0"` · `"~>1.2"` · `"1.2.3 || >=2.5.0 <3"` · `"^0.0.3-beta.1"`
  - ❌ rejects: `""` · `"abc"` · `"^"` · `">="` · `"1.2.3 -"` · `"1.2.3 - "` · `"^^1.2.3"` · `"1..2"` · `">>1.2.3"` · `"1.2.3.4"` · `"1.2.3 ||"` · `"=>1.2.3"`

### `isCalver`

- **No extra arguments**
  - ✅ accepts: `"2026.11"` · `"2026.11.25"` · `"26.11.1"` · `"2026.11.2-rc1"`
  - ❌ rejects: `"2026"` · `"2026.11.25.1.1"` · `"v2026.11"` · `"2026.abc"` · `"abc"`
- **Arguments: `{ format: "YYYY.MM.DD" }`**
  - ✅ accepts: `"2026.11.25"` · `"2026.1.5"`
  - ❌ rejects: `"2026.13.01"` · `"2026.11.32"` · `"2026.11"`
- **Arguments: `{ format: "YYYY.0M.0D" }`**
  - ✅ accepts: `"2026.11.05"`
  - ❌ rejects: `"2026.1.5"`
- **Arguments: `{ format: "YY.MM.MICRO" }`**
  - ✅ accepts: `"26.11.3"` · `"26.11.300"`
  - ❌ rejects: `"2026.11.3"` · `"26.11"`
- **Arguments: `{ format: "YYYY-0M-0D" }`**
  - ✅ accepts: `"2026-11-25"`
  - ❌ rejects: `"2026.11.25"`
- **Arguments: `{ format: "YYYY.WW" }`**
  - ✅ accepts: `"2026.47"` · `"2026.53"`
  - ❌ rejects: `"2026.54"`
- **Arguments: `{ format: "YYYY.NOPE" }`**
  - ❌ rejects: `"2026.11"`

### `isGitCommitHash`

- **No extra arguments**
  - ✅ accepts: `"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"` · `"A1B2C3D000000000000000000000000000000000"` · `"abc1234"` · `"abc1234def"` · `"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"`
  - ❌ rejects: `"abc123"` · `"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"` · `"gggggggggggggggggggggggggggggggggggggggg"` · `"abc 1234"` · `"abc123g"`
- **Arguments: `{ length: "full" }`**
  - ✅ accepts: `"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"` · `"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"`
  - ❌ rejects: `"abc1234"` · `"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"`
- **Arguments: `{ length: "short" }`**
  - ✅ accepts: `"abc1234"` · `"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"`
  - ❌ rejects: `"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"` · `"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"` · `"abc123"`
- **Arguments: `{ length: "short", minLength: 4 }`**
  - ✅ accepts: `"abcd"`
  - ❌ rejects: `"abc"`
- **Arguments: `{ minLength: 10 }`**
  - ✅ accepts: `"abc1234def"` · `"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"`
  - ❌ rejects: `"abc1234"`

### `isGitRefName`

- **No extra arguments**
  - ✅ accepts: `"main"` · `"feature/login"` · `"release-1.2.3"` · `"refs/heads/main"` · `"v1.0.0"` · `"user/fix_bug-42"` · `"a@b"`
  - ❌ rejects: `""` · `"@"` · `"/main"` · `"main/"` · `"feat//x"` · `"feat..x"` · `"a b"` · `"a~b"` · `"a^b"` · `"a:b"` · `"a?b"` · `"a*b"` · `"a[b"` · `"a\\b"` · `"a@{b"` · `"main."` · `".hidden"` · `"feat/.x"` · `"feat.lock"` · `"a/b.lock/c"` · `"a\tb"`
- **Arguments: `{ allowOneLevel: false }`**
  - ✅ accepts: `"feature/login"`
  - ❌ rejects: `"main"`

### `isGitUrl`

- **No extra arguments**
  - ✅ accepts: `"https://github.com/henzyd/regex-kit.git"` · `"https://github.com/henzyd/regex-kit"` · `"git@github.com:henzyd/regex-kit.git"` · `"ssh://git@github.com/henzyd/regex-kit.git"` · `"ssh://git@host:2222/path/repo.git"` · `"git://example.com/repo.git"` · `"https://user:token@gitlab.com/g/p.git"` · `"github.com:henzyd/regex-kit.git"`
  - ❌ rejects: `"github.com/henzyd/regex-kit"` · `"https://github.com"` · `"ftp://example.com/repo.git"` · `"git@github.com"` · `"https://git hub.com/x/y.git"` · `"git@:path"` · `""`

### `isNpmPackageName`

- **No extra arguments**
  - ✅ accepts: `"lodash"` · `"@henzyd/regex-kit"` · `"is-odd"` · `"left-pad"` · `"a"` · `"foo.bar"` · `"~tilde"` · `"foo_bar"` · `"@scope/pkg-name"` · `"abc123"`
  - ❌ rejects: `""` · `".hidden"` · `"_private"` · `"Upper"` · `"has space"` · `"node_modules"` · `"favicon.ico"` · `"fs"` · `"http"` · `"@scope"` · `"@/pkg"` · `"@scope/"` · `"pkg/sub"` · `"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"… (215 chars)` · `" lodash"` · `"lodash "` · `"é"` · `"pkg!"`
- **Arguments: `{ allowLegacy: true }`**
  - ✅ accepts: `"JSONStream"` · `"Upper"` · `"lodash"`
  - ❌ rejects: `".Upper"`

### `isPurl`

- **No extra arguments**
  - ✅ accepts: `"pkg:npm/%40henzyd/regex-kit@1.0.0"` · `"pkg:npm/lodash@4.17.21"` · `"pkg:pypi/django@1.11.1"` · `"pkg:maven/org.apache.commons/commons-lang3@3.12.0?type=jar"` · `"pkg:github/package-url/purl-spec@244fd47e#subpath"` · `"pkg:golang/github.com/gorilla/context"`
  - ❌ rejects: `"npm/lodash"` · `"pkg:"` · `"pkg:npm"` · `"pkg:NPM/lodash"` · `"pkg:npm/"` · `"pkg:npm/lo dash"`

### `isDockerImage`

- **No extra arguments**
  - ✅ accepts: `"nginx"` · `"nginx:1.25"` · `"library/nginx:latest"` · `"ghcr.io/henzyd/regex-kit:1.0.0"` · `"localhost:5000/app:dev"` · `"registry.example.com:443/team/app"` · `"nginx@sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"` · `"ghcr.io/org/app:1.0@sha256:0000000000000"… (91 chars)` · `"my_app"` · `"a/b/c/d"`
  - ❌ rejects: `""` · `"Nginx"` · `"nginx:"` · `"nginx:tag with space"` · `"nginx@sha256:abc"` · `"/nginx"` · `"nginx//app"` · `"nginx:-bad"` · `"registry.example.com:99999/app"` · `"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"… (300 chars)`

### `isDns1123Label`

- **No extra arguments**
  - ✅ accepts: `"my-app"` · `"a"` · `"a1"` · `"1a"` · `"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"`
  - ❌ rejects: `""` · `"-a"` · `"a-"` · `"My-App"` · `"a_b"` · `"a.b"` · `"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"`

### `isDns1123Subdomain`

- **No extra arguments**
  - ✅ accepts: `"my-app"` · `"example.com"` · `"a.b.c"` · `"foo-bar.baz1"`
  - ❌ rejects: `""` · `"a..b"` · `".a"` · `"a."` · `"A.b"` · `"a_b.c"` · `"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"… (256 chars)`

### `isS3BucketName`

- **No extra arguments**
  - ✅ accepts: `"my-bucket"` · `"my.bucket.name"` · `"abc"` · `"a1b2c3"` · `"0abc"` · `"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"`
  - ❌ rejects: `"ab"` · `"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"` · `"My-Bucket"` · `"my_bucket"` · `"-bucket"` · `"bucket-"` · `".bucket"` · `"bucket."` · `"my..bucket"` · `"192.168.5.4"` · `"xn--bucket"` · `"sthree-bucket"` · `"amzn-s3-demo-bucket"` · `"bucket-s3alias"` · `"bucket--ol-s3"` · `"bucket.mrap"` · `"bucket--x-s3"`

### `isAwsArn`

- **No extra arguments**
  - ✅ accepts: `"arn:aws:s3:::my-bucket"` · `"arn:aws:iam::123456789012:role/MyRole"` · `"arn:aws:lambda:us-east-1:123456789012:function:fn"` · `"arn:aws-cn:ec2:cn-north-1:123456789012:instance/i-123"` · `"arn:aws-us-gov:s3:::bucket"` · `"arn:aws:iam::aws:policy/AdministratorAccess"`
  - ❌ rejects: `"arn:aws:s3"` · `"arn:azure:s3:::b"` · `"arn:aws:s3:::"` · `"aws:s3:::b"` · `"arn:aws:S3:::b"` · `"arn:aws:s3:::my bucket"` · `"arn:aws:iam::12345:role/x"`
- **Arguments: `{ service: "s3" }`**
  - ✅ accepts: `"arn:aws:s3:::my-bucket"`
  - ❌ rejects: `"arn:aws:iam::123456789012:role/MyRole"`

### `isAwsRegion`

- **No extra arguments**
  - ✅ accepts: `"us-east-1"` · `"eu-west-1"` · `"ap-southeast-2"` · `"us-gov-west-1"` · `"cn-north-1"` · `"me-south-1"` · `"af-south-1"` · `"il-central-1"` · `"ca-west-1"`
  - ❌ rejects: `"us-east"` · `"us-east-11"` · `"US-EAST-1"` · `"useast1"` · `"us_east_1"` · `"east-1"` · `""`

### `isAndroidPackageName`

- **No extra arguments**
  - ✅ accepts: `"com.example.app"` · `"com.example.my_app"` · `"org.a.b.c"` · `"com.Example.App2"`
  - ❌ rejects: `"com"` · `"1com.example"` · `"com..example"` · `"com.example."` · `".com.example"` · `"com.exa-mple"` · `"com.1example"`

### `isIosBundleId`

- **No extra arguments**
  - ✅ accepts: `"com.example.App"` · `"com.example.my-app"` · `"org.a.b"`
  - ❌ rejects: `"com"` · `"com..example"` · `".com.example"` · `"com.exa_mple"` · `"com.example."` · `"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"… (156 chars)`

### `isEnvVarName`

- **No extra arguments**
  - ✅ accepts: `"MY_ENV_VAR"` · `"PATH"` · `"_PRIVATE"` · `"A1"` · `"DATABASE_URL_2"`
  - ❌ rejects: `"my_env_var"` · `"1VAR"` · `"MY-VAR"` · `"MY VAR"` · `"MY.VAR"` · `""`
- **Arguments: `{ allowLowercase: true }`**
  - ✅ accepts: `"my_env_var"` · `"MY_ENV"`
  - ❌ rejects: `"my-var"`

### `isIdentifier`

- **No extra arguments**
  - ✅ accepts: `"foo"` · `"_bar"` · `"$baz"` · `"camelCase"` · `"ünïcode"` · `"a1"` · `"日本語"`
  - ❌ rejects: `"1foo"` · `"foo-bar"` · `"foo bar"` · `"foo.bar"` · `""` · `"#x"`
- **Arguments: `{ language: "js", rejectReserved: true }`**
  - ✅ accepts: `"foo"` · `"klass"`
  - ❌ rejects: `"class"` · `"await"` · `"yield"` · `"null"`
- **Arguments: `{ language: "python" }`**
  - ✅ accepts: `"snake_case"` · `"_x"` · `"ñandú"`
  - ❌ rejects: `"$x"` · `"1x"`
- **Arguments: `{ language: "python", rejectReserved: true }`**
  - ✅ accepts: `"foo"`
  - ❌ rejects: `"lambda"` · `"None"` · `"True"`
- **Arguments: `{ language: "sql" }`**
  - ✅ accepts: `"table_name"` · `"col$1"` · `"_x"`
  - ❌ rejects: `"1col"` · `"my-col"` · `"ñ"`
- **Arguments: `{ language: "sql", rejectReserved: true }`**
  - ✅ accepts: `"users"`
  - ❌ rejects: `"SELECT"` · `"table"` · `"Where"`

### `isGraphqlName`

- **No extra arguments**
  - ✅ accepts: `"name"` · `"_name"` · `"Name1"` · `"__typename"`
  - ❌ rejects: `"1name"` · `"my-name"` · `"my name"` · `""` · `"é"`

### `isSqlIdentifier`

- **No extra arguments**
  - ✅ accepts: `"users"` · `"user_accounts"` · `"_tmp"` · `"T1"`
  - ❌ rejects: `"1table"` · `"my-table"` · `"my table"` · `"users;DROP"` · `"\"users\""` · `"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"` · `"é"`
- **Arguments: `{ maxLength: 5 }`**
  - ✅ accepts: `"users"`
  - ❌ rejects: `"users2"`

### `isJsonPointer`

- **No extra arguments** — The empty pointer (whole document) is rejected like any empty string.
  - ✅ accepts: `"/a/b"` · `"/a/0/b"` · `"/"` · `"/a~0b"` · `"/a~1b"` · `"/foo/bar~0~1"`
  - ❌ rejects: `"a/b"` · `"/a~2b"` · `"/a~"` · `"//~"` · `"a"`

### `isCveId`

- **No extra arguments**
  - ✅ accepts: `"CVE-2021-44228"` · `"CVE-1999-0001"` · `"CVE-2026-1234567"`
  - ❌ rejects: `"CVE-1998-0001"` · `"CVE-2021-123"` · `"cve-2021-44228"` · `"CVE-21-44228"` · `"CVE2021-44228"`

### `isSpdxLicenseId`

- **No extra arguments**
  - ✅ accepts: `"MIT"` · `"Apache-2.0"` · `"GPL-3.0-or-later"` · `"BSD-3-Clause"` · `"ISC"` · `"MPL-2.0"` · `"CC0-1.0"` · `"LicenseRef-Custom-1"` · `"Unlicense"` · `"0BSD"`
  - ❌ rejects: `"mit"` · `"Apache 2.0"` · `"GPL-3"` · `"NotALicense"` · `"LicenseRef-"` · `"LicenseRef-a b"` · `""`

### `isFileName`

- **No extra arguments**
  - ✅ accepts: `"report.pdf"` · `"my file.txt"` · `"résumé.docx"` · `".gitignore"` · `"a"` · `"archive.tar.gz"` · `"CONFIGURATION.txt"` · `"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"… (255 chars)`
  - ❌ rejects: `""` · `"."` · `".."` · `"a/b"` · `"a\\b"` · `"a:b"` · `"a*b"` · `"a?b"` · `"a\"b"` · `"a<b"` · `"a>b"` · `"a|b"` · `"a\u0000b"` · `"a\nb"` · `"name."` · `"name "` · `" name"` · `"CON"` · `"con.txt"` · `"NUL"` · `"AUX.log"` · `"PRN"` · `"COM1"` · `"com9.txt"` · `"LPT3"` · `"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"… (256 chars)`
- **Arguments: `{ maxLength: 10 }`**
  - ✅ accepts: `"aaaaaaaaaa"`
  - ❌ rejects: `"aaaaaaaaaaa"`

### `isFileExtension`

- **No extra arguments**
  - ✅ accepts: `".png"` · `"png"` · `".tar"` · `"c++"` · `"mp4"` · `".7z"`
  - ❌ rejects: `""` · `"."` · `"..png"` · `"a.b"` · `".png "` · `"ext ension"` · `".a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a.a"`
- **Arguments: `{ allowed: ["png", "jpg"] }`**
  - ✅ accepts: `".png"` · `"PNG"` · `"jpg"`
  - ❌ rejects: `"gif"` · `".exe"`

### `isPosixPath`

- **No extra arguments**
  - ✅ accepts: `"/usr/bin"` · `"relative/path"` · `"/"` · `"../x"` · `"./y"` · `"/a//b"` · `"/with space/file"`
  - ❌ rejects: `""` · `"/a\u0000b"` · `"/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"… (257 chars)` · `"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"… (5000 chars)`

### `isWindowsPath`

- **No extra arguments**
  - ✅ accepts: `"C:\\Users\\ada"` · `"C:/Users/ada"` · `"D:\\"` · `"\\\\server\\share\\file.txt"` · `"relative\\path"` · `"..\\x"` · `"C:\\a\\b.txt"`
  - ❌ rejects: `"C:"` · `"C:foo"` · `"C:\\a<b"` · `"C:\\a|b"` · `"C:\\a?b"` · `"C:\\a*b"` · `"C:\\a\"b"` · `"C:\\CON"` · `"C:\\dir\\NUL.txt"` · `"C:\\a.\\b"` · `"C:\\a \\b"` · `"C:\\a:b"` · `"C:\\aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"… (303 chars)`
- **Arguments: `{ allowLong: true }`**
  - ✅ accepts: `"C:\\aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"… (303 chars)`
  - ❌ rejects: `"C:\\CON"`

### `isFilePermission`

- **No extra arguments**
  - ✅ accepts: `"755"` · `"0644"` · `"644"` · `"rwxr-xr-x"` · `"-rwxr-xr-x"` · `"drwxr-xr-x"` · `"rwsr-xr-x"` · `"rwxrwxrwt"` · `"rw-r--r--"`
  - ❌ rejects: `"888"` · `"75"` · `"77777"` · `"rwxr-xr-"` · `"rwxr-xr-xx"` · `"xwr------"` · `""` · `"abc"`

### `isDataSize`

- **No extra arguments**
  - ✅ accepts: `"10MB"` · `"1.5 GiB"` · `"500 KB"` · `"2TB"` · `"100B"` · `"1 PiB"` · `"10mb"` · `"3.14 gib"`
  - ❌ rejects: `"10"` · `"MB"` · `"10 XB"` · `"1.5.5 GB"` · `"-5MB"` · `"10 M"` · `"1,5GB"` · `""`

### `isApiKeyLike`

- **No extra arguments**
  - ✅ accepts: `"AKIAIOSFODNN7EXAMPLE"` · `"ghp_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"` · `"github_pat_AAAAAAAAAAAAAAAAAAAAAAAAAAAAA"… (93 chars)` · `"pk_live_aaaaaaaaaaaaaaaaaaaaaaaa"` · `"pk_test_BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"` · `"xoxb-1234567890-abcdefghij"` · `"AIzaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"` · `"npm_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"` · `"sk-ant-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"` · `"SG.aaaaaaaaaaaaaaaaaaaaaa.bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"` · `"SK00000000000000000000000000000000"`
  - ❌ rejects: `"AKIAIOSFODNN7EXAMPL"` · `"ghp_short"` · `"sk_live_short"` · `"hello world"` · `"xoxz-123"` · `""` · `"password123"`
- **Arguments: `{ providers: ["aws"] }`**
  - ✅ accepts: `"AKIAIOSFODNN7EXAMPLE"`
  - ❌ rejects: `"ghp_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"`
- **Arguments: `{ providers: ["nosuch"] }`**
  - ❌ rejects: `"AKIAIOSFODNN7EXAMPLE"`

## 12. Passwords and one-time codes

### `isPassword`

- **No extra arguments** — Default policy: length only, 8 to 128 code points.
  - ✅ accepts: `"correct horse battery"` · `"abcdefgh"` · `"päss wörd 123"` · `"12345678"` · `"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"… (128 chars)` · `"🙂🙂🙂🙂🙂🙂🙂🙂"`
  - ❌ rejects: `"short"` · `"abcdefg"` · `"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"… (129 chars)` · `"🙂🙂🙂🙂🙂🙂🙂"`
- **Arguments: `{ minLength: 12 }`**
  - ✅ accepts: `"correct horse battery"` · `"abcdefghijkl"`
  - ❌ rejects: `"Ab1!"` · `"abcdefghijk"`
- **Arguments: `{ maxLength: 10 }`**
  - ✅ accepts: `"abcdefghij"`
  - ❌ rejects: `"abcdefghijk"`
- **Arguments: `{ lowercase: 1 }`**
  - ✅ accepts: `"ABCDEFg1"`
  - ❌ rejects: `"ABCDEFG1"`
- **Arguments: `{ uppercase: 1 }`**
  - ✅ accepts: `"abcdefgH"`
  - ❌ rejects: `"abcdefgh"`
- **Arguments: `{ digits: 2 }`**
  - ✅ accepts: `"abcdef12"`
  - ❌ rejects: `"abcdefg1"`
- **Arguments: `{ symbols: 1 }`**
  - ✅ accepts: `"abcdefg!"` · `"abcdefg€"`
  - ❌ rejects: `"abcdefg1"` · `"abcdef g"`
- **Arguments: `{ noSpaces: true }`**
  - ✅ accepts: `"abcdefgh"`
  - ❌ rejects: `"abcd efgh"`
- **Arguments: `{ noRepeating: true }`**
  - ✅ accepts: `"aabbccdd"`
  - ❌ rejects: `"aaabcdef"`
- **Arguments: `{ noRepeating: 1 }`**
  - ✅ accepts: `"abcdefgh"`
  - ❌ rejects: `"aabcdefg"`
- **Arguments: `{ lowercase: 1, uppercase: 1, digits: 1, symbols: 1, minLength: 10 }`**
  - ✅ accepts: `"Abcdefgh1!"`
  - ❌ rejects: `"abcdefgh1!"` · `"Abcdefghi!"` · `"Abcdefghi1"` · `"Ab1!"`

### `getPasswordIssues`

- **No extra arguments**
  - `"correct horse battery"` → `[]`
  - `"abc"` → `["minLength"]`
  - `""` → `["minLength"]`
  - `undefined` → `null`
  - `42` → `null`
  - `"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"… (129 chars)` → `["maxLength"]`
- **Arguments: `{ lowercase: 1, uppercase: 1, digits: 1, symbols: 1, noSpaces: true, noRepeating: true, minLength: 10 }`**
  - `"abc"` → `["minLength", "uppercase", "digits", "symbols"]`
  - `"ABC  aaa 123"` → `["symbols", "noSpaces", "noRepeating"]`
  - `"Abcdefgh1!"` → `[]`

### `isOtp`

- **No extra arguments**
  - ✅ accepts: `"123456"` · `"000000"`
  - ❌ rejects: `"12345"` · `"1234567"` · `"12345a"` · `""` · `" 123456"`
- **Arguments: `{ length: 4 }`**
  - ✅ accepts: `"1234"`
  - ❌ rejects: `"123456"`
- **Arguments: `{ length: 8, alphanumeric: true }`**
  - ✅ accepts: `"ab12CD34"`
  - ❌ rejects: `"ab12CD3!"`

### `isPin`

- **No extra arguments**
  - ✅ accepts: `"1234"` · `"0000"` · `"4821"`
  - ❌ rejects: `"123"` · `"12345"` · `"abcd"` · `"12 34"`
- **Arguments: `{ length: 6 }`**
  - ✅ accepts: `"123456"`
  - ❌ rejects: `"1234"`
- **Arguments: `{ length: { min: 4, max: 6 } }`**
  - ✅ accepts: `"1234"` · `"12345"` · `"123456"`
  - ❌ rejects: `"123"` · `"1234567"`
- **Arguments: `{ rejectTrivial: true }`**
  - ✅ accepts: `"4821"` · `"1357"` · `"2580"`
  - ❌ rejects: `"0000"` · `"1111"` · `"1234"` · `"4321"` · `"7890"` · `"1212"` · `"3737"` · `"9876"`
- **Arguments: `{ length: 6, rejectTrivial: true }`**
  - ✅ accepts: `"482193"`
  - ❌ rejects: `"123456"` · `"123123"` · `"000000"`

### `isTotpSecret`

- **No extra arguments**
  - ✅ accepts: `"JBSWY3DPEHPK3PXP"` · `"JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP"` · `"JBSW Y3DP EHPK 3PXP"`
  - ❌ rejects: `"JBSWY3DP"` · `"jbswy3dpehpk3pxp"` · `"JBSWY3DPEHPK3PX1"` · `"JBSWY3DPEHPK3PXP!"` · `" JBSWY3DPEHPK3PXP"`
- **Arguments: `{ strict: true }`**
  - ✅ accepts: `"JBSWY3DPEHPK3PXP"`
  - ❌ rejects: `"JBSW Y3DP EHPK 3PXP"`

### `isTotpUri`

- **No extra arguments**
  - ✅ accepts: `"otpauth://totp/Example:ada@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Example"` · `"otpauth://totp/ada?secret=JBSWY3DPEHPK3PXP&digits=8&period=60&algorithm=SHA256"` · `"otpauth://hotp/ada?secret=JBSWY3DPEHPK3PXP&counter=5"`
  - ❌ rejects: `"otpauth://totp/ada"` · `"otpauth://totp/ada?secret=short"` · `"otpauth://hotp/ada?secret=JBSWY3DPEHPK3PXP"` · `"otpauth://totp/ada?secret=JBSWY3DPEHPK3PXP&digits=5"` · `"otpauth://totp/ada?secret=JBSWY3DPEHPK3PXP&algorithm=MD5"` · `"https://example.com"` · `"otpauth://totp/ada?secret=JBSWY3DPEHPK3PXP&period=0"`

## 13. HTTP and API requests

### `isHttpMethod`

- **No extra arguments**
  - ✅ accepts: `"GET"` · `"POST"` · `"PATCH"` · `"DELETE"` · `"OPTIONS"` · `"HEAD"` · `"PUT"`
  - ❌ rejects: `"get"` · `"Get"` · `"PROPFIND"` · `""` · `" GET"` · `"GET "`
- **Arguments: `{ methods: ["GET", "POST"] }`**
  - ✅ accepts: `"GET"` · `"POST"`
  - ❌ rejects: `"PUT"`
- **Arguments: `{ anyToken: true }`**
  - ✅ accepts: `"PROPFIND"` · `"M-SEARCH"` · `"get"`
  - ❌ rejects: `"BAD METHOD"` · `"A(B)"`

### `isHttpHeaderName`

- **No extra arguments**
  - ✅ accepts: `"Content-Type"` · `"X-Request-Id"` · `"accept"` · `"x_custom"`
  - ❌ rejects: `"Content Type"` · `"Content-Type:"` · `"Héader"` · `"Bad(Name)"` · `":authority"`
- **Arguments: `{ allowPseudo: true }`**
  - ✅ accepts: `":authority"` · `":status"` · `"Accept"`
  - ❌ rejects: `":foo"` · `":"`

### `isHttpHeaderValue`

- **No extra arguments** — Rejects CR, LF and NUL: the header-injection check.
  - ✅ accepts: `"application/json"` · `"text/html; charset=utf-8"` · `"a b"` · `"Bearer abc.def"` · `"a\tb"`
  - ❌ rejects: `"a\r\nSet-Cookie: x=y"` · `"a\nb"` · `"a\u0000b"` · `" leading"` · `"trailing "` · `"héllo"`
- **Arguments: `{ maxLength: 5 }`**
  - ✅ accepts: `"abcde"`
  - ❌ rejects: `"abcdef"`

### `isContentType`

- **No extra arguments**
  - ✅ accepts: `"application/json"` · `"text/html; charset=utf-8"` · `"multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxk"` · `"application/json;charset=UTF-8"` · `"Application/JSON"`
  - ❌ rejects: `"json"` · `"text/html;"` · `"text/*"` · `"application/json; charset"` · `"text/html; ; charset=x"`
- **Arguments: `{ mediaTypes: ["application/json"] }`**
  - ✅ accepts: `"application/json; charset=utf-8"` · `"APPLICATION/JSON"`
  - ❌ rejects: `"text/html"`

### `isBearerToken`

- **No extra arguments**
  - ✅ accepts: `"Bearer abc123"` · `"bearer abc.def-ghi_jkl~+/="` · `"Bearer eyJhbGciOiJIUzI1NiJ9.eyJhIjoxfQ.c2ln"`
  - ❌ rejects: `"Bearer"` · `"Bearer "` · `"Bearer a b"` · `"Token abc"` · `"Bearer abc!"` · `"abc"`

### `isAuthorizationHeader`

- **No extra arguments**
  - ✅ accepts: `"Bearer abc123"` · `"Basic dXNlcjpwYXNz"` · `"Digest username=\"Mufasa\", realm=\"x\", nonce=\"y\", uri=\"/dir\", response=\"r\""`
  - ❌ rejects: `"Basic dXNlcjpwYXN"` · `"Basic not base64!"` · `"Negotiate abc"` · `"Bearer"` · `""` · `"Bearer a b"`
- **Arguments: `{ schemes: ["Negotiate"] }`**
  - ✅ accepts: `"Negotiate YIIB"`
  - ❌ rejects: `"Bearer abc"`

### `isOrigin`

- **No extra arguments**
  - ✅ accepts: `"https://app.example.com"` · `"http://localhost:3000"` · `"https://127.0.0.1:8443"` · `"http://[::1]:8080"` · `"HTTPS://Example.com"`
  - ❌ rejects: `"https://example.com/"` · `"https://example.com/path"` · `"example.com"` · `"https://"` · `"https://user@example.com"` · `"https://example.com?x=1"` · `"null"` · `"ftp://example.com"`
- **Arguments: `{ allowNull: true }`**
  - ✅ accepts: `"null"`
  - ❌ rejects: `"nul"`
- **Arguments: `{ schemes: ["chrome-extension"] }`**
  - ✅ accepts: `"chrome-extension://abcdefghijklmnop"`
  - ❌ rejects: `"https://example.com"`

### `isHttpStatusCode`

- **No extra arguments**
  - ✅ accepts: `200` · `"404"` · `301` · `"599"` · `100`
  - ❌ rejects: `99` · `600` · `"20"` · `"2000"` · `"abc"` · `200.5` · `0`
- **Arguments: `{ class: "2xx" }`**
  - ✅ accepts: `200` · `299`
  - ❌ rejects: `404` · `199`
- **Arguments: `{ class: ["4xx", "5xx"] }`**
  - ✅ accepts: `404` · `503`
  - ❌ rejects: `200` · `301`

### `isETag`

- **No extra arguments**
  - ✅ accepts: `"\"abc\""` · `"W/\"abc\""` · `"\"\""` · `"\"33a64df551425fcc55e4d42a148795d9f25f89d4\""`
  - ❌ rejects: `"abc"` · `"W/abc"` · `"\"a\"b\""` · `"\"a b\""` · `"W/\""` · `"'abc'"`

### `isCookieName`

- **No extra arguments**
  - ✅ accepts: `"session"` · `"__Host-id"` · `"sid_1"` · `"X-Token"`
  - ❌ rejects: `"a b"` · `"a=b"` · `"a;b"` · `"a,b"` · `"a\"b"` · `"na me"`
- **Arguments: `{ prefix: "__Host-" }`**
  - ✅ accepts: `"__Host-id"`
  - ❌ rejects: `"id"` · `"__Secure-id"`
- **Arguments: `{ prefix: "__Secure-" }`**
  - ✅ accepts: `"__Secure-x"`
  - ❌ rejects: `"__Host-x"`

### `isCookieValue`

- **No extra arguments**
  - ✅ accepts: `"abc123"` · `"\"quoted\""` · `"a.b-c_d"` · `"eyJhbGc"` · `"%20x"`
  - ❌ rejects: `"a b"` · `"a;b"` · `"a,b"` · `"a\"b"` · `"a\\b"` · `"\"unterminated"` · `"a\nb"`

### `isHttpDate`

- **No extra arguments**
  - ✅ accepts: `"Sun, 06 Nov 1994 08:49:37 GMT"` · `"Tue, 15 Nov 1994 08:12:31 GMT"` · `"Wed, 25 Nov 2026 12:00:00 GMT"`
  - ❌ rejects: `"Mon, 06 Nov 1994 08:49:37 GMT"` · `"Sun, 31 Feb 1994 08:49:37 GMT"` · `"Sun, 06 Nov 1994 25:49:37 GMT"` · `"Sun, 06 Nov 1994 08:49:37 UTC"` · `"Sun, 6 Nov 1994 08:49:37 GMT"` · `"Sunday, 06-Nov-94 08:49:37 GMT"` · `"Sun Nov  6 08:49:37 1994"` · `"Sun, 06 Nov 1994 08:49:37"`
- **Arguments: `{ allowObsolete: true }`**
  - ✅ accepts: `"Sunday, 06-Nov-94 08:49:37 GMT"` · `"Sun Nov  6 08:49:37 1994"` · `"Sun, 06 Nov 1994 08:49:37 GMT"`
  - ❌ rejects: `"Monday, 06-Nov-94 08:49:37 GMT"` · `"Mon Nov  6 08:49:37 1994"`

### `isTraceparent`

- **No extra arguments**
  - ✅ accepts: `"00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01"`
  - ❌ rejects: `"00-00000000000000000000000000000000-b7ad6b7169203331-01"` · `"00-0af7651916cd43dd8448eb211c80319c-0000000000000000-01"` · `"ff-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01"` · `"00-0AF7651916CD43DD8448EB211C80319C-b7ad6b7169203331-01"` · `"00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331"` · `"0af7651916cd43dd8448eb211c80319c"`

### `isIdempotencyKey`

- **No extra arguments**
  - ✅ accepts: `"f47ac10b-58cc-4372-a567-0e02b2c3d479"` · `"order-12345"` · `"abc!@#"`
  - ❌ rejects: `"has space"` · `"é"` · `"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"… (256 chars)`
- **Arguments: `{ uuidOnly: true }`**
  - ✅ accepts: `"f47ac10b-58cc-4372-a567-0e02b2c3d479"`
  - ❌ rejects: `"order-1"`
- **Arguments: `{ maxLength: 5 }`**
  - ✅ accepts: `"abcde"`
  - ❌ rejects: `"abcdef"`

### `isSortParam`

- **No extra arguments**
  - ✅ accepts: `"name"` · `"-createdAt"` · `"-createdAt,name"` · `"+name"` · `"user.name,-id"`
  - ❌ rejects: `","` · `"name,"` · `"name,name"` · `"a b"` · `"1name"` · `"-"` · `"--name"` · `"name;drop"`
- **Arguments: `{ fields: ["name", "createdAt"] }`**
  - ✅ accepts: `"name"` · `"-createdAt"`
  - ❌ rejects: `"id"` · `"-id"`
- **Arguments: `{ maxFields: 2 }`**
  - ✅ accepts: `"a,b"`
  - ❌ rejects: `"a,b,c"`

### `isCursor`

- **No extra arguments**
  - ✅ accepts: `"eyJpZCI6MTIzfQ=="` · `"abc-DEF_123.~"` · `"a"`
  - ❌ rejects: `"a b"` · `"a/b"` · `"a+b"`
- **Arguments: `{ maxLength: 5 }`**
  - ✅ accepts: `"abcde"`
  - ❌ rejects: `"abcdef"`

### `isCharset`

- **No extra arguments**
  - ✅ accepts: `"utf-8"` · `"UTF-8"` · `"iso-8859-1"` · `"windows-1252"` · `"x-sjis"`
  - ❌ rejects: `"utf 8"` · `"-utf8"` · `"utf-8;"` · `"é"`

### `isAcceptLanguage`

- **No extra arguments**
  - ✅ accepts: `"en"` · `"en-GB"` · `"en-GB,en;q=0.9"` · `"fr-CH, fr;q=0.9, en;q=0.8, de;q=0.7, *;q=0.5"` · `"*"` · `"en;q=1"`
  - ❌ rejects: `"en;q=1.5"` · `"en;q="` · `"en_GB"` · `"e n"` · `"en,,fr"` · `"123"` · `"en;q=0.1234"`

### `isMultipartBoundary`

- **No extra arguments**
  - ✅ accepts: `"----WebKitFormBoundary7MA4YWxkTrZu0gW"` · `"boundary"` · `"abc def"` · `"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"`
  - ❌ rejects: `"abc "` · `"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"` · `"a\"b"` · `"a\nb"`

### `isHmacSignatureHeader`

- **No extra arguments**
  - ✅ accepts: `"sha256=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"` · `"sha1=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"` · `"sha512=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"… (135 chars)`
  - ❌ rejects: `"sha256=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"` · `"sha256="` · `"md5=abc"` · `"SHA256=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"` · `"sha256=gggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg"`

## 14. Forms and generic input

### `isBooleanString`

- **No extra arguments**
  - ✅ accepts: `"true"` · `"FALSE"` · `"1"` · `"0"` · `"on"` · `"Off"` · `"yes"` · `"No"`
  - ❌ rejects: `"y"` · `"n"` · `"t"` · `"2"` · `"truee"` · `"on "`
- **Arguments: `{ values: ["yes", "no"] }`**
  - ✅ accepts: `"YES"` · `"no"`
  - ❌ rejects: `"true"` · `"1"`

### `hasLength`

- **Arguments: `{ min: 2, max: 5 }`**
  - ✅ accepts: `"ab"` · `"abcde"` · `"日本"` · `"😀😀"`
  - ❌ rejects: `"a"` · `"abcdef"` · `""`
- **Arguments: `{ max: 3 }`** — Empty is accepted when zero is in range.
  - ✅ accepts: `""` · `"abc"`
  - ❌ rejects: `"abcd"`
- **Arguments: `{ min: 1 }`**
  - ✅ accepts: `"a"`
  - ❌ rejects: `""`
- **Arguments: `{ unit: "utf16", max: 1 }`**
  - ✅ accepts: `"a"`
  - ❌ rejects: `"😀"`
- **Arguments: `{ unit: "codepoints", max: 1 }`**
  - ✅ accepts: `"😀"`
  - ❌ rejects: `"ab"` · `"👨\u200d👩\u200d👧"`
- **Arguments: `{ unit: "graphemes", max: 1 }`**
  - ✅ accepts: `"👨\u200d👩\u200d👧"` · `"é"` · `"a"`
  - ❌ rejects: `"ab"`
- **Arguments: `{ unit: "bytes", max: 2 }`**
  - ✅ accepts: `"é"` · `"ab"`
  - ❌ rejects: `"abc"` · `"日"`
- **Arguments: `{ min: 3, unit: "bytes" }`**
  - ✅ accepts: `"日"`
  - ❌ rejects: `"ab"`

### `isDelimitedList`

- **No extra arguments**
  - ✅ accepts: `"a,b,c"` · `"a"` · `"1,2,3"`
  - ❌ rejects: `"a,,b"` · `","` · `"a,b,"` · `",a"`
- **Arguments: `{ separator: "|" }`**
  - ✅ accepts: `"a|b"`
  - ❌ rejects: `"a,b|"`
- **Arguments: `{ item: [Function] }`**
  - ✅ accepts: `"1,2,3"`
  - ❌ rejects: `"1,a"`
- **Arguments: `{ min: 2 }`**
  - ✅ accepts: `"a,b"`
  - ❌ rejects: `"a"`
- **Arguments: `{ max: 2 }`**
  - ✅ accepts: `"a,b"`
  - ❌ rejects: `"a,b,c"`
- **Arguments: `{ unique: true }`**
  - ✅ accepts: `"a,b"`
  - ❌ rejects: `"a,a"`
- **Arguments: `{ allowEmpty: true }`**
  - ✅ accepts: `"a,,b"` · `","`
- **Arguments: `{ trim: true, item: [Function] }`**
  - ✅ accepts: `"a, b , c"`
  - ❌ rejects: `"a, 1"`
- **Arguments: `{ item: [Function] }`**
  - ✅ accepts: `"a,b"`
  - ❌ rejects: `"a, b"`

### `isSingleLine`

- **No extra arguments**
  - ✅ accepts: `"hello"` · `"a b"` · `"日本語"`
  - ❌ rejects: `"a\nb"` · `"a\rb"` · `"a\u2028b"` · `"a\u2029b"` · `"a\u000bb"` · `"a\fb"` · `"a\u0085b"`

### `isPlainText`

- **No extra arguments**
  - ✅ accepts: `"hello"` · `"a\nb"` · `"a\tb"` · `"a\r\nb"` · `"日本語 😀"`
  - ❌ rejects: `"a\u0000b"` · `"a\u0007b"` · `"ab"` · `"a\u0085b"` · `"\ud800"` · `"a\udc00b"` · `"a\ud83db"`

### `isTitle`

- **No extra arguments**
  - ✅ accepts: `"Hello world"` · `"A"`
  - ❌ rejects: `"   "` · `"a\nb"` · `"a\u0000b"` · `"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"… (121 chars)`
- **Arguments: `{ maxLength: 5 }`**
  - ✅ accepts: `"abcde"`
  - ❌ rejects: `"abcdef"`

## 15. Security and input hygiene

### `hasPathTraversal`

- **No extra arguments** — true means a traversal segment WAS found.
  - ✅ accepts: `"../etc/passwd"` · `"..\\windows"` · `"a/../b"` · `"a/.."` · `".."` · `"%2e%2e/etc"` · `"%2E%2E%2Fetc"` · `"..%2fetc"` · `"%252e%252e/x"` · `"..%c0%afetc"` · `"a\\..\\b"` · `"....//etc"` · `".../x"` · `"/.."` · `"%2e%2e%5cwindows"`
  - ❌ rejects: `"file..txt"` · `"a/b/c"` · `"...x"` · `"a.b/c"` · `".hidden"` · `"my..file/x"` · `"abc"` · `"/etc/passwd"` · `"a/./b"` · `""` · `42` · `undefined`

### `isSafeRelativePath`

- **No extra arguments**
  - ✅ accepts: `"a/b/c.txt"` · `"file.txt"` · `"dir/sub/"` · `"a.b/c"` · `"./a"` · `"a%2e%2e/b"`
  - ❌ rejects: `"/etc/passwd"` · `"\\windows"` · `"C:\\x"` · `"C:/x"` · `"../a"` · `"a/../../b"` · `"a\\b"` · `"a\u0000b"` · `"a/%2e%2e/b"` · `""`
- **Arguments: `{ allowBackslash: true }`**
  - ✅ accepts: `"a\\b"`
  - ❌ rejects: `"a\\..\\b"` · `"\\a"`

### `isSafeRedirectPath`

- **No extra arguments**
  - ✅ accepts: `"/dashboard"` · `"/a/b?x=1#y"` · `"/"` · `"/search?q=a%20b"`
  - ❌ rejects: `"//evil.com"` · `"/\\evil.com"` · `"https://evil.com"` · `"evil.com"` · `"/\tevil.com"` · `"/a\nb"` · `"/%2fevil.com"` · `"/%5Cevil.com"` · `""` · `"javascript:alert(1)"` · `"/a b"` · `"\\evil.com"`

### `hasNullByte`

- **No extra arguments** — true means a NUL (raw or %00) WAS found.
  - ✅ accepts: `"a\u0000b"` · `"%00"` · `"file.php%00.jpg"` · `"%00abc"` · `"a%00"` · `"A%00B"`
  - ❌ rejects: `"abc"` · `"%0"` · `"%20"` · `"50%"` · `""` · `null`

### `hasBidiControls`

- **No extra arguments**
  - ✅ accepts: `"abc\u202edef"` · `"\u2066x\u2069"` · `"\u200fx"` · `"؜"`
  - ❌ rejects: `"abc"` · `"日本"` · `"x\u200by"` · `""`

### `hasZeroWidthChars`

- **No extra arguments**
  - ✅ accepts: `"a\u200bb"` · `"\ufeffabc"` · `"a\u200db"` · `"a\u2060b"`
  - ❌ rejects: `"abc"` · `"a b"` · `"a b"` · `"日本"` · `""`

### `isWellFormedUnicode`

- **No extra arguments**
  - ✅ accepts: `"abc"` · `"😀"` · `"日本"`
  - ❌ rejects: `"\ud800"` · `"a\udc00"` · `"\ud83d"` · `""`

### `isNormalized`

- **No extra arguments** — NFC by default.
  - ✅ accepts: `"é"` · `"abc"`
  - ❌ rejects: `"é"` · `"é"`
- **Arguments: `"NFD"`**
  - ✅ accepts: `"é"` · `"abc"`
  - ❌ rejects: `"é"`
- **Arguments: `"NFKC"`**
  - ✅ accepts: `"fi"`
  - ❌ rejects: `"ﬁ"`
- **Arguments: `"XYZ"`**
  - ❌ rejects: `"abc"`

### `isCsvSafe`

- **No extra arguments**
  - ✅ accepts: `"hello"` · `"a=b"` · `"1+1"` · `"x-y"` · `"name@example.com"`
  - ❌ rejects: `"=1+1"` · `"+1"` · `"-1"` · `"@SUM(A1)"` · `"\tcmd"` · `"\rcmd"` · `"=HYPERLINK(\"x\")"`
- **Arguments: `{ allowNumeric: true }`**
  - ✅ accepts: `"-5"` · `"+3.14"` · `"-1e5"` · `"abc"`
  - ❌ rejects: `"=1+1"` · `"-5+3"` · `"@x"`

### `isPkceCodeVerifier`

- **No extra arguments**
  - ✅ accepts: `"dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk"` · `"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"… (128 chars)` · `"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"` · `"a._~-a._~-a._~-a._~-a._~-a._~-a._~-a._~-a._~-"`
  - ❌ rejects: `"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"` · `"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"… (129 chars)` · `"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa+"` · `"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa "`

### `isPkceCodeChallenge`

- **No extra arguments**
  - ✅ accepts: `"E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM"`
  - ❌ rejects: `"dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjX"` · `"E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM="` · `"E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw+cM"`
- **Arguments: `{ method: "plain" }`**
  - ✅ accepts: `"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"`
  - ❌ rejects: `"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"`

### `isOAuthScope`

- **No extra arguments**
  - ✅ accepts: `"read"` · `"read write"` · `"openid profile email"` · `"user:email repo"` · `"https://api.example.com/auth/read"`
  - ❌ rejects: `"read  write"` · `" read"` · `"read "` · `"read\twrite"` · `"re\"ad"`
- **Arguments: `{ scopes: ["read", "write"] }`**
  - ✅ accepts: `"read write"` · `"read"`
  - ❌ rejects: `"admin"` · `"read admin"`

### `isPemBlock`

- **No extra arguments**
  - ✅ accepts: `"-----BEGIN PUBLIC KEY-----\nSGVsbG8gV29ybGQ=\n-----END PUBLIC KEY-----\n"` · `"-----BEGIN CERTIFICATE-----\nSGVsbG8gV29ybGQ=\n-----END CERTIFICATE-----\n"` · `"-----BEGIN PUBLIC KEY-----\r\nSGVsbG8gV29ybGQ=\r\n-----END PUBLIC KEY-----\r\n"` · `"-----BEGIN RSA PRIVATE KEY-----\nAAAAAAAA"… (197 chars)` · `"-----BEGIN PUBLIC KEY-----\nSGVsbG8gV29ybGQ=\n-----END PUBLIC KEY-----"`
  - ❌ rejects: `"-----BEGIN PUBLIC KEY-----\nSGVsbG8gV29ybGQ=\n-----END PRIVATE KEY-----\n"` · `"-----BEGIN PUBLIC KEY-----\nnot base64!\n-----END PUBLIC KEY-----\n"` · `"-----BEGIN PUBLIC KEY-----\nSGVsbG8gV29ybGQ=\n"` · `"SGVsbG8gV29ybGQ="` · `"-----BEGIN PUBLIC KEY-----\n\n-----END PUBLIC KEY-----\n"`
- **Arguments: `{ label: "PUBLIC KEY" }`**
  - ✅ accepts: `"-----BEGIN PUBLIC KEY-----\nSGVsbG8gV29ybGQ=\n-----END PUBLIC KEY-----\n"`
  - ❌ rejects: `"-----BEGIN CERTIFICATE-----\nSGVsbG8gV29ybGQ=\n-----END CERTIFICATE-----\n"`
- **Arguments: `{ label: ["CERTIFICATE", "PUBLIC KEY"] }`**
  - ✅ accepts: `"-----BEGIN CERTIFICATE-----\nSGVsbG8gV29ybGQ=\n-----END CERTIFICATE-----\n"` · `"-----BEGIN PUBLIC KEY-----\nSGVsbG8gV29ybGQ=\n-----END PUBLIC KEY-----\n"`
  - ❌ rejects: `"-----BEGIN PRIVATE KEY-----\nSGVsbG8gV29ybGQ=\n-----END PRIVATE KEY-----\n"`

### `isSshPublicKey`

- **No extra arguments**
  - ✅ accepts: `"ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOMq"… (90 chars)` · `"ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOMqqnkVzrm0SdG6UOoqKLsabgH5C9okWi0dh2l9GKJl"` · `"ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC7 comment here"`
  - ❌ rejects: `"ssh-ed25519 notbase64!"` · `"ssh-foo AAAA"` · `"ssh-ed25519 BBBBC3NzaC1lZDI1NTE5AAAAIOMqqnkVzrm0SdG6UOoqKLsabgH5C9okWi0dh2l9GKJl"` · `"ssh-ed25519"` · `"AAAAC3NzaC1lZDI1NTE5AAAAIOMq"`

## 16. Health and science

### `isNpi`

- **No extra arguments**
  - ✅ accepts: `"1234567893"` · `"1245319599"`
  - ❌ rejects: `"1234567890"` · `"3234567893"` · `"123456789"` · `"abc"`

### `isIcd10`

- **No extra arguments**
  - ✅ accepts: `"A00"` · `"A00.1"` · `"S72.001A"` · `"Z99.89"` · `"M54.5"` · `"U07.1"`
  - ❌ rejects: `"a00"` · `"A0"` · `"A00."` · `"A00.12345"` · `"00A"` · `"A00.1.2"` · `"AA0"`
- **Arguments: `{ allowUndotted: true }`**
  - ✅ accepts: `"A001"` · `"S72001A"` · `"A00.1"`
  - ❌ rejects: `"A00123456"`

### `isNdc`

- **No extra arguments**
  - ✅ accepts: `"0002-3227-30"` · `"12345-678-90"` · `"12345-6789-0"` · `"00002322730"` · `"0002322730"`
  - ❌ rejects: `"12345-67-890"` · `"1234-567-89"` · `"abc"` · `"123456789"`

### `isLoinc`

- **No extra arguments**
  - ✅ accepts: `"2345-7"` · `"718-7"` · `"2160-0"` · `"5778-6"`
  - ❌ rejects: `"2345-8"` · `"2345"` · `"1-9"` · `"12345678-1"`

### `isCasNumber`

- **No extra arguments**
  - ✅ accepts: `"7732-18-5"` · `"50-00-0"` · `"64-17-5"` · `"58-08-2"`
  - ❌ rejects: `"7732-18-6"` · `"7732185"` · `"12-34-5"` · `"abc-de-f"`

### `isInchiKey`

- **No extra arguments**
  - ✅ accepts: `"BSYNRYMUTXBXSQ-UHFFFAOYSA-N"`
  - ❌ rejects: `"BSYNRYMUTXBXSQ-UHFFFAOYSA"` · `"bsynrymutxbxsq-uhfffaoysa-n"` · `"BSYNRYMUTXBXSQ-UHFFFAOYSB-N"`

### `isArxivId`

- **No extra arguments**
  - ✅ accepts: `"2301.01234"` · `"2301.12345v2"` · `"1706.03762"` · `"hep-th/9901001"` · `"math.GT/0309136"` · `"cond-mat/0001001v1"`
  - ❌ rejects: `"2313.01234"` · `"2301.123"` · `"230.01234"` · `"hep-th/990100"` · `"2301.01234v"`

### `isPubmedId`

- **No extra arguments**
  - ✅ accepts: `"12345678"` · `"1"` · `"999999999"`
  - ❌ rejects: `"0"` · `"1234567890"` · `"abc"` · `"012"`

### `isBloodType`

- **No extra arguments**
  - ✅ accepts: `"A+"` · `"O-"` · `"AB+"` · `"B-"` · `"AB-"`
  - ❌ rejects: `"C+"` · `"A"` · `"AB"` · `"a+"` · `"O++"` · `"A positive"`

## 17. Commerce and mobile

### `isSku`

- **No extra arguments**
  - ✅ accepts: `"ABC-123"` · `"shirt_red_L"` · `"A1"` · `"SKU.001"` · `"a"` · `"12345"`
  - ❌ rejects: `""` · `"-abc"` · `"abc-"` · `"a--b"` · `"a b"` · `"a/b"` · `"é"` · `"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"`
- **Arguments: `{ uppercase: true }`**
  - ✅ accepts: `"ABC-1"`
  - ❌ rejects: `"abc-1"`
- **Arguments: `{ separators: "-" }`**
  - ✅ accepts: `"a-b"`
  - ❌ rejects: `"a_b"`
- **Arguments: `{ separators: "" }`**
  - ✅ accepts: `"ab12"`
  - ❌ rejects: `"a-b"`
- **Arguments: `{ minLength: 3 }`**
  - ✅ accepts: `"abc"`
  - ❌ rejects: `"ab"`
- **Arguments: `{ maxLength: 3 }`**
  - ✅ accepts: `"abc"`
  - ❌ rejects: `"abcd"`

### `isCouponCode`

- **No extra arguments**
  - ✅ accepts: `"SAVE20"` · `"save20"` · `"BLACK-FRIDAY-2026"` · `"A1B2"`
  - ❌ rejects: `"-SAVE"` · `"SAVE-"` · `"SA--VE"` · `"SA VE"` · `"SAVE!"`
- **Arguments: `{ uppercase: true }`**
  - ✅ accepts: `"SAVE20"`
  - ❌ rejects: `"save20"`
- **Arguments: `{ length: 6 }`**
  - ✅ accepts: `"SAVE20"` · `"SA-VE20"`
  - ❌ rejects: `"SAVE2"`
- **Arguments: `{ length: { min: 4, max: 6 } }`**
  - ✅ accepts: `"SAVE"`
  - ❌ rejects: `"SAVE2026"`

### `isTrackingNumber`

- **Arguments: `"ups"`**
  - ✅ accepts: `"1Z999AA10123456784"`
  - ❌ rejects: `"1Z999AA10123456785"` · `"1Z999AA1012345678"` · `"1z999aa10123456784"`
- **Arguments: `"fedex"`**
  - ✅ accepts: `"123456789012"` · `"123456789012345"` · `"1234567890123456789012"`
  - ❌ rejects: `"12345"`
- **Arguments: `"usps"`**
  - ✅ accepts: `"9400111899223197428490"` · `"EA123456789US"`
  - ❌ rejects: `"1234"` · `"EA123456789GB"`
- **Arguments: `"dhl"`**
  - ✅ accepts: `"1234567890"` · `"JJD000000000000000000"`
  - ❌ rejects: `"12345"`
- **Arguments: `"royalmail"`**
  - ✅ accepts: `"AB123456789GB"`
  - ❌ rejects: `"AB123456789US"`
- **Arguments: `"nosuchcarrier"`**
  - ❌ rejects: `"1Z999AA10123456784"`
- **No extra arguments**
  - ❌ rejects: `"1Z999AA10123456784"`

### `isIccid`

- **No extra arguments**
  - ✅ accepts: `"89442000000000000008"` · `"8944200000000000009"`
  - ❌ rejects: `"8944200000000000000"` · `"79442000000000000008"` · `"894420000000000000"`

### `isImsi`

- **No extra arguments**
  - ✅ accepts: `"310150123456789"` · `"31015012345678"`
  - ❌ rejects: `"3101501234567"` · `"3101501234567890"` · `"31015012345678a"`

### `isApnsToken`

- **No extra arguments**
  - ✅ accepts: `"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"` · `"FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"`
  - ❌ rejects: `"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"` · `"gggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg"`
- **Arguments: `{ length: 32 }`**
  - ✅ accepts: `"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"`
  - ❌ rejects: `"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"`

## 18. Service-specific identifiers

### `isYoutubeVideoId`

- **No extra arguments**
  - ✅ accepts: `"dQw4w9WgXcQ"`
  - ❌ rejects: `"dQw4w9WgXc"` · `"dQw4w9WgXcQQ"` · `"dQw4w9WgXc!"` · `"https://youtu.be/dQw4w9WgXcQ"`
- **Arguments: `{ allowUrl: true }`**
  - ✅ accepts: `"dQw4w9WgXcQ"` · `"https://www.youtube.com/watch?v=dQw4w9WgXcQ"` · `"https://youtu.be/dQw4w9WgXcQ"` · `"https://youtube.com/shorts/dQw4w9WgXcQ"` · `"https://www.youtube.com/watch?feature=share&v=dQw4w9WgXcQ"` · `"https://m.youtube.com/embed/dQw4w9WgXcQ"`
  - ❌ rejects: `"https://vimeo.com/123"` · `"https://www.youtube.com/watch?v=short"` · `"https://youtube.com.evil.com/watch?v=dQw4w9WgXcQ"`

### `isGithubUsername`

- **No extra arguments**
  - ✅ accepts: `"octocat"` · `"a"` · `"user-name"` · `"a1"` · `"A-b-C"` · `"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"`
  - ❌ rejects: `"-user"` · `"user-"` · `"us--er"` · `"user_name"` · `"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"` · `"user name"`

### `isGithubRepo`

- **No extra arguments**
  - ✅ accepts: `"octocat/Hello-World"` · `"henzyd/regex-kit"` · `"a/b"` · `"o/.github"` · `"o/a.b_c"`
  - ❌ rejects: `"octocat"` · `"a/b/c"` · `"/repo"` · `"owner/"` · `"-o/repo"` · `"owner/.."` · `"owner/."` · `"owner/a b"`

### `isSlackId`

- **No extra arguments**
  - ✅ accepts: `"U012AB3CDE"` · `"C0123456789"` · `"W012A3CDE"` · `"T012ABCDE"` · `"D01234567"`
  - ❌ rejects: `"u012ab3cde"` · `"X012AB3CDE"` · `"U012"` · `"U012AB3CDEFGHIJ"`

### `isDiscordId`

- **No extra arguments**
  - ✅ accepts: `"80351110224678912"` · `"175928847299117063"`
  - ❌ rejects: `"123"` · `"0"` · `"abc"`
- **Arguments: `{ epoch: true }`**
  - ✅ accepts: `"175928847299117063"`
  - ❌ rejects: `"9223372036854775807"`

### `isTwitterHandle`

- **No extra arguments**
  - ✅ accepts: `"jack"` · `"@jack"` · `"user_name"` · `"a"` · `"A1_"`
  - ❌ rejects: `"@"` · `"user name"` · `"user-name"` · `"abcdefghijklmnop"` · `"@@a"`

### `isInstagramHandle`

- **No extra arguments**
  - ✅ accepts: `"instagram"` · `"@a.b_c"` · `"a"` · `"user.name"` · `"a_b"`
  - ❌ rejects: `".user"` · `"user."` · `"us..er"` · `"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"` · `"user name"` · `"user-name"` · `"@"`

### `isLinkedinUrl`

- **No extra arguments**
  - ✅ accepts: `"https://www.linkedin.com/in/ada-lovelace"` · `"https://linkedin.com/in/ada/"` · `"https://uk.linkedin.com/in/ada"` · `"https://www.linkedin.com/company/anthropic"` · `"http://www.linkedin.com/in/ada?trk=x"`
  - ❌ rejects: `"https://example.com/in/ada"` · `"https://www.linkedin.com/feed"` · `"https://www.linkedin.com/in/"` · `"linkedin.com/in/ada"` · `"https://linkedin.com.evil.com/in/ada"`

### `isStripeId`

- **No extra arguments**
  - ✅ accepts: `"cus_NffrFeUfNV2Hib"` · `"pi_3MtwBwLkdIwHu7ix28a3tqPa"` · `"sub_1MowQVLkdIwHu7ixeRlqHVzs"` · `"price_1MoBy5LkdIwHu7ixZhnattbh"` · `"prod_NWjs8kKbJWmuuc"` · `"evt_1MqqbKLt4dXK03v5qaIbiZ5Q"`
  - ❌ rejects: `"cus_"` · `"cus_short"` · `"xyz_NffrFeUfNV2Hib"` · `"NffrFeUfNV2Hib"` · `"cus-NffrFeUfNV2Hib"`
- **Arguments: `{ prefix: "cus" }`**
  - ✅ accepts: `"cus_NffrFeUfNV2Hib"`
  - ❌ rejects: `"pi_3MtwBwLkdIwHu7ix28a3tqPa"`

### `isStripeSignature`

- **No extra arguments**
  - ✅ accepts: `"t=1492774577,v1=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"` · `"t=1492774577,v1=aaaaaaaaaaaaaaaaaaaaaaaa"… (148 chars)`
  - ❌ rejects: `"t=,v1=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"` · `"t=1,v1=short"` · `"v1=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"` · `"t=1492774577,v1=AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"`

## Helpers

### `isOneOf`

- **Arguments: `["asc", "desc"]`**
  - ✅ accepts: `"asc"` · `"desc"`
  - ❌ rejects: `"ASC"` · `"x"` · `""` · `1`
- **Arguments: `[1, 2, 3]`**
  - ✅ accepts: `1` · `3`
  - ❌ rejects: `4` · `"1"`
- **No extra arguments** — No list given.
  - ❌ rejects: `"asc"`
- **Arguments: `"asc"`** — The list must be an array.
  - ❌ rejects: `"asc"`
