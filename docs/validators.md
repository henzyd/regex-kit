# Validator catalogue

Every validator in `@henzyd/regex-kit`, grouped by area, with its kind and priority. All
of them are implemented. The inputs each one is tested against are listed in
[Test cases](test-cases.md), and [Using validators](using-validators.md) shows how to call
them. The priorities record the order they were planned in; they no longer gate anything.

The catalogue was revised after an independent review that found gaps in the HTTP request
layer, forms, security hygiene and config values, and several entries that were wrong or
under-specified. Facts that could not be confirmed from a primary source are listed under
[Facts to confirm](#facts-to-confirm).

## Conventions

These apply to every validator, so the tables below do not repeat them.

### Shape

- **Signature:** `isX(value: unknown, options?): boolean`. Synchronous, never throws.
- **Input types:** most validators accept only strings. Anything else returns `false`,
  including `null`, `undefined`, arrays and objects. **Numeric-domain validators** also
  accept a finite `number`, because JSON bodies deliver ports, coordinates, years and
  timestamps as numbers: `isPort`, `isInteger`, `isDecimal`, `isFloat`, `isLatitude`,
  `isLongitude`, `isYear`, `isUnixTimestamp`, `isHttpStatusCode`, `isPercentage`,
  `isSafeInteger`. Their notes say so. `NaN`, `Infinity` and `-0` are rejected.
- **Empty string:** `false` for every validator except `isBlank`. Whether an empty value
  is acceptable is a decision for your API; use the `optional` helper below.
- **Purity:** pure, with one exception. Validators whose answer depends on the current
  time (`isCreditCardExpiry`, `isDateOfBirth`, `isUnixTimestamp` with a sanity range) read
  the clock, and take an optional `now: Date | number` so tests and callers stay in
  control. They are marked ⏱.
- **No network, no runtime dependencies.** A validator checks that a value is
  _well-formed_, not that it _exists_.
- **Narrowing:** validators return a type guard where a branded type is useful, for
  example `value is Uuid`.

### Naming

| Prefix   | Returns                              | Example                                              |
| -------- | ------------------------------------ | ---------------------------------------------------- |
| `isX`    | `true` when the value is valid       | `isEmail`, `isUuid`                                  |
| `hasX`   | `true` when a **problem** is present | `hasPathTraversal`, `hasNullByte`, `hasBidiControls` |
| `getX`   | A value, or `null`                   | `getCardBrand`, `getPasswordIssues`                  |
| `checkX` | A result object with a reason        | `checkEmail`, `checkCreditCard`                      |

The `has` prefix reads backwards from `is`: `hasNullByte(value)` is `true` for a **bad**
value. Each `has` entry says so in its notes, and the guide groups them together.

### Normalisation and separators

- **Validators never trim, lowercase or rewrite.** Leading or trailing whitespace makes a
  value invalid. Options such as `{ trim: true }` exist only where real-world input
  demands it.
- **Display separators.** Identifiers that people type or read off a card or a page
  accept the separators of their printed form by default: spaces in an IBAN or a card
  number, hyphens in an ISBN, spaces and dashes in a phone number. Each entry lists which
  ones. Pass `{ strict: true }` to require the canonical form (no separators), which is
  what you want for stored or machine-to-machine values.
- **Case.** Each entry states whether it is case-sensitive. The default follows the
  governing standard (hex digits and UUIDs are case-insensitive, base64 is not).

### Locale and Unicode

- **Locale-aware validators** take a country or locale code as an argument, for example
  `isPostalCode(value, 'GB')`.
- **Unicode.** Validators that accept human text (`isPersonName`, `isAlpha`, `isUsername`
  with `unicode: true`) use Unicode property escapes. Those that accept protocol text
  (`isDomain`, `isSlug`, `isHttpHeaderName`) are ASCII unless an option says otherwise.
- **Runtime baseline.** ES2022 and Node 20.19 or newer. Anything needing the `v` flag
  (`isEmoji`), `Intl.Segmenter` (`hasLength` with `unit: 'graphemes'`) or
  `Intl.supportedValuesOf` (`isTimezone`) feature-detects and documents what it does on an
  engine without them. Hermes (React Native) support is unconfirmed; see
  [Facts to confirm](#facts-to-confirm-before-implementing).

### Safety

- **ReDoS policy.** No nested quantifiers, no overlapping alternations, no backtracking
  into unbounded repeats. Each pattern is checked in CI with a worst-case input test and a
  static scan, and each entry that uses a pattern outside the simple cases documents its
  complexity.
- **Input length guard.** Every validator has a documented maximum input length (for
  example 320 for `isEmail`, 2048 for `isUrl`, 253 for `isDomain`). Longer input returns
  `false` before any pattern runs, so a 10 MB string never costs more than a length
  check. The cap is an option where a caller can legitimately exceed it.

### Kinds

| Kind               | Meaning                                                                     |
| ------------------ | --------------------------------------------------------------------------- |
| `regex`            | A single pattern decides it.                                                |
| `regex + checksum` | A pattern checks the shape, then code checks a check digit (Luhn, mod 97).  |
| `regex + data`     | A pattern plus a small lookup table, such as a list of valid country codes. |
| `regex + code`     | A pattern plus other logic that is not a checksum: calendar checks, ranges. |

Kinds combine, for example `regex + data + checksum` for `isIban`.

A regular expression cannot compute a checksum. The
[Regular Expressions Cookbook](https://www.oreilly.com/library/view/regular-expressions-cookbook/9780596802837/ch04s13.html)
says as much about ISBNs, and the same is true of Luhn, mod 97 and the rest. Where a
check digit exists, we run it, so `isIban` does not accept a well-shaped but invalid
number.

### Data policy

Entries marked `data` ship a lookup table (country codes, IBAN lengths, special-purpose IP
ranges). Each table records the source and the date it was last checked. Updating a table
is a minor release and appears in the changelog, so a validator's answer for a given input
only changes in a release you can read about.

### Priority

| Priority | Meaning                                                                     |
| -------- | --------------------------------------------------------------------------- |
| **P1**   | The first releases. Things nearly every project needs.                      |
| **P2**   | Common, but narrower, or needs more design (locales, options, data).        |
| **P3**   | Later, or only if there is demand. Often service-specific or fast-changing. |

---

## 1. Contact and identity

| Function        | Validates                                                 | Kind         | Priority | Notes                                                                                                    |
| --------------- | --------------------------------------------------------- | ------------ | -------- | -------------------------------------------------------------------------------------------------------- |
| `isEmail`       | Practical email address                                   | regex        | P1       | Deliberately not full RFC 5322. Options: `allowUnicode`, `allowDisplayName`, `requireTld`, `maxLength`.  |
| `isEmailDomain` | The part after the `@`                                    | regex        | P3       | Shares logic with `isDomain`.                                                                            |
| `isPhoneE164`   | E.164 international number, `+14155552671`                | regex        | P1       | Shape only: `+`, up to 15 digits, no leading zero in the country code.                                   |
| `isPhone`       | Loose phone number with common separators                 | regex        | P1       | Digits, spaces, dots, dashes, parentheses, optional `+`. A format check, not a dial plan.                |
| `isMobilePhone` | Mobile number for a given country                         | regex + data | P2       | `isMobilePhone(value, 'NG')`. Per-country prefix rules. Recommend a dedicated library for full accuracy. |
| `isDialCode`    | Country calling code, `+234`                              | regex + data | P2       | Used by phone inputs that split the country code from the number.                                        |
| `isUssdCode`    | USSD service code, `*123#`, `*737*50*1234#`               | regex        | P3       | Starts with `*` or `#`, ends with `#`, digits and `*` or `#` between. Common in mobile-money markets.    |
| `isUsername`    | Configurable username                                     | regex        | P1       | Options: `minLength`, `maxLength`, allowed characters, no leading or trailing separator.                 |
| `isPersonName`  | Human name, Unicode letters, spaces, hyphens, apostrophes | regex        | P2       | Permissive on purpose; names are not ASCII.                                                              |
| `isDisplayName` | Free-form display name                                    | regex        | P2       | Any Unicode text of bounded length, no control characters, not blank.                                    |
| `isSlug`        | URL slug, `my-post-title`                                 | regex        | P1       | Lowercase letters, digits, single hyphens.                                                               |
| `isHandle`      | `@handle` style social handle                             | regex        | P2       | Options for max length and allowed characters.                                                           |
| `isHashtag`     | `#hashtag`                                                | regex        | P3       | Unicode letters and digits.                                                                              |
| `isAddressLine` | One line of a postal address                              | regex        | P3       | Bounded length, no control characters. Deliberately permissive; addresses have no universal grammar.     |

## 2. Network and web

| Function           | Validates                                     | Kind         | Priority | Notes                                                                                                                                                                                              |
| ------------------ | --------------------------------------------- | ------------ | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `isUrl`            | Absolute URL                                  | regex        | P1       | Options: `protocols`, `requireProtocol`, `requireTld`, `allowLocalhost`, `allowIp`, `allowCredentials` (default `false`, so `https://user:pass@host` is rejected).                                 |
| `isHttpUrl`        | `http` or `https` URL                         | regex        | P1       | Shorthand for the common case. Same options.                                                                                                                                                       |
| `isWebSocketUrl`   | `ws` or `wss` URL                             | regex        | P1       |                                                                                                                                                                                                    |
| `isRelativeUrl`    | Relative reference, `../a?b=1#c`              | regex        | P2       | Rejects a scheme and a leading `//`.                                                                                                                                                               |
| `isDatabaseUrl`    | Connection string for common databases        | regex        | P2       | `postgres`, `mysql`, `mongodb`, `mongodb+srv`, `redis`, `rediss`, `amqp`. Credentials optional. Shape only; never logs or returns the password.                                                    |
| `isDeepLink`       | App deep link, `myapp://item/42`              | regex        | P2       | Custom scheme per RFC 3986. Option `schemes` to pin yours. Rejects dangerous schemes (`javascript`, `data`, `vbscript`) by default.                                                                |
| `isDomain`         | Fully qualified domain name                   | regex        | P1       | Label length 1-63, total 253, no leading or trailing hyphen, optional punycode.                                                                                                                    |
| `isHostname`       | Hostname, with or without TLD                 | regex        | P1       | Allows `localhost` and single-label names.                                                                                                                                                         |
| `isHostPort`       | `host:port`, `example.com:8080`, `[::1]:3000` | regex        | P1       | Host is a hostname, IPv4 or bracketed IPv6. Option `requirePort`. Common in config and env values.                                                                                                 |
| `isTld`            | Top-level domain syntax                       | regex        | P3       | Syntax only. A live TLD list changes too often to bundle.                                                                                                                                          |
| `isAsn`            | Autonomous system number, `AS64512`           | regex        | P3       |                                                                                                                                                                                                    |
| `isIpv4`           | IPv4 address                                  | regex        | P1       | Rejects leading zeros by default; option to allow.                                                                                                                                                 |
| `isIpv6`           | IPv6 address                                  | regex        | P1       | Full and `::` compressed forms, zone ids optional, IPv4-mapped forms.                                                                                                                              |
| `isIp`             | Either IPv4 or IPv6                           | regex        | P1       | Option `version: 4 \| 6`.                                                                                                                                                                          |
| `isPublicIp`       | A routable, non-special-purpose address       | regex + data | P1       | For SSRF guards: rejects loopback, private, link-local, CGNAT, multicast, documentation and cloud-metadata ranges, from the IANA special-purpose registries.                                       |
| `isPrivateIp`      | RFC 1918 and IPv6 ULA (`fc00::/7`)            | regex + data | P2       |                                                                                                                                                                                                    |
| `isLoopbackIp`     | `127.0.0.0/8`, `::1`                          | regex + data | P2       |                                                                                                                                                                                                    |
| `isLinkLocalIp`    | `169.254.0.0/16`, `fe80::/10`                 | regex + data | P2       | Covers the cloud metadata address `169.254.169.254`.                                                                                                                                               |
| `isIpv4Cidr`       | IPv4 CIDR block, `10.0.0.0/8`                 | regex        | P1       | Prefix 0-32.                                                                                                                                                                                       |
| `isIpv6Cidr`       | IPv6 CIDR block                               | regex        | P1       | Prefix 0-128.                                                                                                                                                                                      |
| `isCidr`           | Either CIDR kind                              | regex        | P1       |                                                                                                                                                                                                    |
| `isIpRange`        | `192.168.0.1-192.168.0.50`                    | regex + code | P3       | Start must not exceed end.                                                                                                                                                                         |
| `isPort`           | TCP/UDP port, 0-65535                         | regex + code | P1       | Also accepts a number. Option to exclude 0.                                                                                                                                                        |
| `isMacAddress`     | MAC address                                   | regex        | P1       | Colon, dash, dot (Cisco) and bare forms.                                                                                                                                                           |
| `isUrlPath`        | URL path, `/a/b`                              | regex        | P3       |                                                                                                                                                                                                    |
| `isUrlSafe`        | Only RFC 3986 unreserved characters           | regex        | P2       | `A-Z a-z 0-9 - . _ ~`.                                                                                                                                                                             |
| `isPercentEncoded` | Well-formed percent-encoding, no stray `%`    | regex        | P2       | Every `%` is followed by two hex digits. Does not decode.                                                                                                                                          |
| `isUriScheme`      | URI scheme, `https`, `mailto`                 | regex        | P3       |                                                                                                                                                                                                    |
| `isMailtoUri`      | `mailto:` URI                                 | regex        | P3       | RFC 6068.                                                                                                                                                                                          |
| `isTelUri`         | `tel:` URI                                    | regex        | P3       | RFC 3966.                                                                                                                                                                                          |
| `isSmsUri`         | `sms:` URI                                    | regex        | P3       | RFC 5724.                                                                                                                                                                                          |
| `isGeoUri`         | `geo:` URI                                    | regex        | P3       | RFC 5870.                                                                                                                                                                                          |
| `isDataUri`        | `data:` URI                                   | regex        | P2       | Option `mediaTypes`. Optional size cap.                                                                                                                                                            |
| `isMimeType`       | MIME type, `application/json`                 | regex        | P2       | Syntax per RFC 6838, not a registry lookup. By default no parameters; option `allowParameters` for `text/html; charset=utf-8`. See also `isContentType`.                                           |
| `isBase64`         | Base64                                        | regex        | P1       | Options: `urlSafe`, `padding: 'required' \| 'optional' \| 'none'`. Case-sensitive.                                                                                                                 |
| `isBase64Url`      | URL-safe Base64                               | regex        | P1       |                                                                                                                                                                                                    |
| `isBase32`         | Base32 (RFC 4648 and Crockford)               | regex        | P2       |                                                                                                                                                                                                    |
| `isBase58`         | Base58                                        | regex        | P2       |                                                                                                                                                                                                    |
| `isJwt`            | JSON Web Token structure                      | regex        | P1       | Option `type: 'jws' \| 'jwe' \| 'any'`. Signed (three segments), encrypted (five segments), and unsecured with an empty signature when `allowEmptySignature` is set. Does **not** verify anything. |

## 3. Identifiers

| Function        | Validates                                             | Kind  | Priority | Notes                                                                                                                                                           |
| --------------- | ----------------------------------------------------- | ----- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `isUuid`        | UUID, any version                                     | regex | P1       | Option `version: 1-8 \| 'nil' \| 'max'` per RFC 9562. Variant bits enforced, except for the nil and max UUIDs, which are valid by definition.                   |
| `isGuid`        | Any `8-4-4-4-12` hex identifier, variant not enforced | regex | P1       | Looser than `isUuid`, for Microsoft-style GUIDs. Option for braces.                                                                                             |
| `isUlid`        | ULID                                                  | regex | P1       | 26 characters, Crockford base32, first character at most `7`.                                                                                                   |
| `isCuid`        | CUID v1                                               | regex | P3       | Deprecated by its authors; kept for existing data.                                                                                                              |
| `isCuid2`       | CUID2                                                 | regex | P1       | Lowercase alphanumeric, starts with a letter.                                                                                                                   |
| `isNanoid`      | NanoID                                                | regex | P1       | Default 21 characters of `A-Za-z0-9_-`; option for custom length/alphabet.                                                                                      |
| `isKsuid`       | KSUID                                                 | regex | P3       | 27 base62 characters.                                                                                                                                           |
| `isObjectId`    | MongoDB ObjectId                                      | regex | P1       | 24 hex characters.                                                                                                                                              |
| `isSnowflakeId` | Twitter/Discord-style snowflake                       | regex | P3       | Digits within the 64-bit range. Option for epoch-sanity.                                                                                                        |
| `isShortId`     | Short URL-safe id of configurable length              | regex | P3       |                                                                                                                                                                 |
| `isHash`        | Hex digest by algorithm                               | regex | P1       | `isHash(value, 'sha256')`. Algorithms: sha224, sha256, sha384, sha512, sha3-256, sha3-512, blake2b, blake2s. `md5`, `sha1` and `crc32` need `{ legacy: true }`. |
| `isOciDigest`   | Container digest, `sha256:<64 hex>`                   | regex | P2       | Also accepts `sha512:`.                                                                                                                                         |
| `isSriHash`     | Subresource Integrity value, `sha384-<base64>`        | regex | P2       | One or more space-separated entries; `sha256`, `sha384`, `sha512` only, with the matching base64 length.                                                        |
| `isBcryptHash`  | bcrypt hash                                           | regex | P2       | `$2a$`, `$2b$`, `$2y$`, cost factor, 60 characters.                                                                                                             |
| `isArgon2Hash`  | Argon2 PHC string                                     | regex | P3       |                                                                                                                                                                 |
| `isHex`         | Hexadecimal string                                    | regex | P1       | Options: `prefix`, `length`, `caseSensitive`.                                                                                                                   |
| `isBinary`      | Binary digits string                                  | regex | P2       |                                                                                                                                                                 |
| `isOctal`       | Octal digits string                                   | regex | P2       |                                                                                                                                                                 |
| `isOid`         | Object identifier, `1.2.840.113549`                   | regex | P3       | Dotted decimal, at least two arcs, no leading zeros.                                                                                                            |

## 4. Numbers and text

| Function            | Validates                              | Kind         | Priority | Notes                                                                                                                                                              |
| ------------------- | -------------------------------------- | ------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `isNumeric`         | Digits only                            | regex        | P1       | Options `allowSign`, `allowDecimal`. Also accepts a number.                                                                                                        |
| `isInteger`         | Integer                                | regex + code | P1       | Options: `allowNegative`, `allowLeadingZeros`, `min`, `max`, `bigint` (compare as `BigInt` past 2^53). Also accepts a number.                                      |
| `isSafeInteger`     | Integer within ±(2^53 − 1)             | regex + code | P2       | Also accepts a number. For ids that must survive a round trip through JSON.                                                                                        |
| `isDecimal`         | Decimal number                         | regex        | P1       | Options: `decimalPlaces`, `locale` for `,` versus `.`. Also accepts a number.                                                                                      |
| `isFloat`           | Float, optionally scientific notation  | regex        | P2       | Also accepts a number.                                                                                                                                             |
| `isPercentage`      | `42%`, `42.5%`                         | regex        | P2       | Options for range. Also accepts a number.                                                                                                                          |
| `isCurrencyAmount`  | `$1,234.56` style amount               | regex        | P2       | Options: `symbol`, `thousandsSeparator`, `decimalSeparator`.                                                                                                       |
| `isRomanNumeral`    | Roman numerals                         | regex        | P3       |                                                                                                                                                                    |
| `isAlpha`           | Letters only                           | regex        | P1       | Option `locale` or `unicode: true`.                                                                                                                                |
| `isAlphanumeric`    | Letters and digits only                | regex        | P1       | Same options.                                                                                                                                                      |
| `isAscii`           | ASCII only                             | regex        | P1       |                                                                                                                                                                    |
| `isPrintableAscii`  | Printable ASCII only                   | regex        | P2       |                                                                                                                                                                    |
| `hasNoControlChars` | No C0 or C1 control characters, no DEL | regex        | P2       | Rejects newline and tab by default; option `allow: ['\n', '\t']`. The invisible-character checks are in [section 15](#15-security-and-input-hygiene).              |
| `isBlank`           | Empty or whitespace only               | regex        | P1       | The only validator that returns `true` for `''`.                                                                                                                   |
| `isLowercase`       | No uppercase letters                   | regex        | P2       |                                                                                                                                                                    |
| `isUppercase`       | No lowercase letters                   | regex        | P2       |                                                                                                                                                                    |
| `isCamelCase`       | `camelCase`                            | regex        | P3       | Also `isPascalCase`, `isSnakeCase`, `isKebabCase`, `isScreamingSnakeCase`.                                                                                         |
| `isEmoji`           | A single emoji                         | regex        | P3       | Uses `\p{RGI_Emoji}` with the `v` flag (Node 20+). Moves with each Unicode release. Not in RGI: some widely used emoji. Needs a fallback where `v` is unsupported. |
| `isHtmlTag`         | A single HTML tag                      | regex        | P3       | Detection, not parsing. Never use for sanitising.                                                                                                                  |

## 5. Dates and time

| Function               | Validates                             | Kind         | Priority | Notes                                                                                                                                                                                |
| ---------------------- | ------------------------------------- | ------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `isIsoDate`            | `2026-11-23`                          | regex + code | P1       | Calendar-aware: rejects `2026-02-30` and non-leap `02-29`.                                                                                                                           |
| `isIsoTime`            | `13:45:30.123`                        | regex        | P1       | Optional offset and fractional seconds.                                                                                                                                              |
| `isIsoDateTime`        | `2026-11-23T13:45:30Z`                | regex + code | P1       | Options: `requireOffset`, `allowSpace`.                                                                                                                                              |
| `isIsoDuration`        | `P3Y6M4DT12H30M5S`                    | regex        | P1       | Rejects bare `P` and `PT`. Option `allowWeeks` for `P2W`.                                                                                                                            |
| `isDurationString`     | `5m`, `1h30m`, `500ms`                | regex        | P2       | The short form used in config (Go, ms, Kubernetes). Option `units`.                                                                                                                  |
| `isIsoWeekDate`        | `2026-W47-1`                          | regex + code | P3       |                                                                                                                                                                                      |
| `isRfc3339`            | RFC 3339 timestamp                    | regex + code | P2       | A profile of ISO 8601 that requires an offset. Strict by default: uppercase `T` and `Z`. Options `allowLowercase` and `allowSpace`, which RFC 3339 permits as a readability note.    |
| `isDate`               | A date in a stated format             | regex + code | P1       | `isDate(value, 'DD/MM/YYYY')`. Formats: `YYYY-MM-DD`, `DD/MM/YYYY`, `MM/DD/YYYY`, and more.                                                                                          |
| `isDateTimeLocal`      | `2026-11-23T13:45`                    | regex + code | P1       | The value format of `<input type="datetime-local">`: no offset, optional seconds.                                                                                                    |
| `isMonthString`        | `2026-11`                             | regex + code | P2       | Value format of `<input type="month">`.                                                                                                                                              |
| `isWeekString`         | `2026-W47`                            | regex + code | P2       | Value format of `<input type="week">`. Checks that the year has 53 weeks when it says so.                                                                                            |
| `isTime12h`            | `1:30 PM`                             | regex        | P1       |                                                                                                                                                                                      |
| `isTime24h`            | `13:30`                               | regex        | P1       | Option to allow seconds.                                                                                                                                                             |
| `isUnixTimestamp` ⏱    | Seconds or milliseconds since epoch   | regex + code | P1       | Option `unit: 's' \| 'ms'` and a sane range (default 1970 to year 2100). Also accepts a number.                                                                                      |
| `isTimezoneOffset`     | `+01:00`, `-0530`, `Z`                | regex        | P2       |                                                                                                                                                                                      |
| `isTimezone`           | IANA name, `Africa/Lagos`             | regex + data | P2       | Uses `Intl.supportedValuesOf('timeZone')` where present, otherwise a bundled list. **Answers can differ by runtime and ICU data**; `{ checkData: false }` falls back to the pattern. |
| `isCron`               | Cron expression                       | regex + code | P2       | Option `dialect: 'unix' \| 'quartz' \| 'aws' \| 'k8s'`. Unix is five fields; Quartz and AWS add seconds or a year and use `?`. Checks field ranges.                                  |
| `isYear`               | Four-digit year, with optional range  | regex        | P2       | Also accepts a number.                                                                                                                                                               |
| `isCreditCardExpiry` ⏱ | `MM/YY` or `MM/YYYY`, not in the past | regex + code | P2       | Option `now`. Two-digit years resolve to the current century. `{ allowPast: true }` checks shape only.                                                                               |
| `isDateOfBirth` ⏱      | A real date, not in the future        | regex + code | P2       | Options `minAge`, `maxAge`, `format`, `now`. The age and not-in-the-future rules come from forms, not from a standard.                                                               |

## 6. Financial

| Function           | Validates                                                                           | Kind                    | Priority | Notes                                                                                                                                                                  |
| ------------------ | ----------------------------------------------------------------------------------- | ----------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `isCreditCard`     | Card number                                                                         | regex + checksum        | P1       | Luhn plus length and prefix per brand. Option `brands`. Accepts spaces and dashes unless `strict`.                                                                     |
| `getCardBrand`     | Brand: Visa, Mastercard, Amex, Discover, Diners, JCB, UnionPay, Maestro, Mir, Verve | regex                   | P2       | Returns the brand name or `null`. Does not check the Luhn digit; combine with `isCreditCard`.                                                                          |
| `isCvv`            | CVV/CVC, 3 or 4 digits                                                              | regex                   | P1       | Option `brand` to fix the length (Amex uses 4).                                                                                                                        |
| `isLuhn`           | Any digit string passing the Luhn check                                             | regex + checksum        | P1       | The building block for cards, IMEI, SIN and others. Exported on its own.                                                                                               |
| `isIban`           | IBAN                                                                                | regex + data + checksum | P1       | Per-country length and structure from the registry, then mod 97. Uses chunked arithmetic, no `BigInt` required. Accepts spaces unless `strict`.                        |
| `isBic`            | BIC / SWIFT code                                                                    | regex + data            | P1       | 8 or 11 characters per ISO 9362. The first four may be letters or digits in practice, so the default is permissive. Positions 5-6 are checked against `isCountryCode`. |
| `isAbaRouting`     | US ABA routing number                                                               | regex + checksum        | P2       | 9 digits, 3-7-1 weighted checksum.                                                                                                                                     |
| `isSortCode`       | UK sort code                                                                        | regex                   | P2       | `12-34-56`, also unseparated.                                                                                                                                          |
| `isNuban`          | Nigerian bank account number                                                        | regex + checksum        | P2       | 10 digits. Check digit computed from the bank code and serial with the CBN's weighted mod 10 scheme. Optional bank-code list.                                          |
| `isUpiId`          | Indian UPI id, `name@bank`                                                          | regex                   | P3       |                                                                                                                                                                        |
| `isBankAccount`    | Account number format by country                                                    | regex + data            | P3       | Shape only. Highly country-specific.                                                                                                                                   |
| `isCurrencyCode`   | ISO 4217 code, `NGN`, `USD`                                                         | regex + data            | P1       |                                                                                                                                                                        |
| `isBitcoinAddress` | Bitcoin address                                                                     | regex                   | P2       | Legacy (`1`, `3`), Bech32 (`bc1q`) and Taproot (`bc1p`). Option `checksum: true` runs Bech32/Bech32m, or Base58Check (needs SHA-256).                                  |
| `isEvmAddress`     | `0x` plus 40 hex (Ethereum, Polygon, BSC, ...)                                      | regex                   | P2       | Shape by default. Option `checksum: true` enforces EIP-55 mixed case, which needs Keccak-256. See [decision 7](#decisions).                                            |
| `isCryptoAddress`  | Address for a named chain                                                           | regex                   | P3       | `isCryptoAddress(value, 'solana')`. Litecoin, Dogecoin, Solana, Tron, XRP, Cosmos. Shape only unless the chain's checksum is cheap.                                    |
| `isTxHash`         | Transaction hash for a chain                                                        | regex                   | P3       | `0x` plus 64 hex on EVM chains; Base58 and hex elsewhere.                                                                                                              |
| `isVatNumber`      | EU/UK VAT number                                                                    | regex + checksum        | P2       | Per-country format, with checksum where the country defines one. No VIES lookup.                                                                                       |
| `isIsin`           | ISIN securities identifier                                                          | regex + checksum        | P3       | Luhn over letter-expanded digits.                                                                                                                                      |
| `isLei`            | Legal Entity Identifier                                                             | regex + checksum        | P3       | 20 characters, mod 97-10.                                                                                                                                              |
| `isCusip`          | CUSIP                                                                               | regex + checksum        | P3       |                                                                                                                                                                        |
| `isTicker`         | Stock ticker symbol                                                                 | regex                   | P3       | Syntax only.                                                                                                                                                           |

## 7. Products, publications and devices

| Function         | Validates                     | Kind             | Priority | Notes                                                                          |
| ---------------- | ----------------------------- | ---------------- | -------- | ------------------------------------------------------------------------------ |
| `isIsbn`         | ISBN-10 or ISBN-13            | regex + checksum | P1       | Option `version: 10 \| 13`. Accepts hyphens and spaces unless `strict`.        |
| `isIssn`         | ISSN                          | regex + checksum | P2       | 8 digits, last may be `X`.                                                     |
| `isEan`          | EAN-8 and EAN-13              | regex + checksum | P1       |                                                                                |
| `isUpc`          | UPC-A and UPC-E               | regex + checksum | P1       |                                                                                |
| `isGtin`         | GTIN-8, 12, 13 and 14         | regex + checksum | P2       | The umbrella over EAN and UPC.                                                 |
| `isIsrc`         | ISRC (recordings)             | regex            | P3       |                                                                                |
| `isDoi`          | DOI                           | regex            | P2       | `10.` prefix, registrant, suffix.                                              |
| `isOrcid`        | ORCID iD                      | regex + checksum | P3       | Mod 11-2 check character.                                                      |
| `isImei`         | IMEI                          | regex + checksum | P2       | 15 digits, Luhn.                                                               |
| `isVin`          | Vehicle identification number | regex + checksum | P2       | 17 characters, no `I`, `O` or `Q`. Check digit applies to North American VINs. |
| `isLicensePlate` | Vehicle plate by country      | regex + data     | P3       | Highly country-specific.                                                       |

## 8. Geography and locale

| Function            | Validates                                  | Kind         | Priority | Notes                                                                                 |
| ------------------- | ------------------------------------------ | ------------ | -------- | ------------------------------------------------------------------------------------- |
| `isPostalCode`      | Postal code for a country                  | regex + data | P1       | `isPostalCode(value, 'GB')`. Aim for broad country coverage, with a generic fallback. |
| `isLatitude`        | -90 to 90                                  | regex + code | P1       | Also accepts a number.                                                                |
| `isLongitude`       | -180 to 180                                | regex + code | P1       | Also accepts a number.                                                                |
| `isLatLong`         | `51.5074, -0.1278`                         | regex + code | P1       | Option for decimal-degree versus DMS formats.                                         |
| `isGeohash`         | Geohash                                    | regex        | P3       |                                                                                       |
| `isPlusCode`        | Open Location Code, `8FVC9G8F+6W`          | regex        | P3       |                                                                                       |
| `isCountryCode`     | ISO 3166-1 alpha-2, alpha-3 or numeric     | regex + data | P1       | Option `format`.                                                                      |
| `isSubdivisionCode` | ISO 3166-2, `US-CA`                        | regex + data | P3       |                                                                                       |
| `isLanguageCode`    | ISO 639-1 or 639-2                         | regex + data | P2       |                                                                                       |
| `isLocale`          | BCP 47 language tag, `en-GB`, `zh-Hant-TW` | regex        | P2       | Syntax per RFC 5646.                                                                  |
| `isScriptCode`      | ISO 15924, `Latn`                          | regex + data | P3       |                                                                                       |
| `isIataAirport`     | IATA airport code, `LOS`                   | regex        | P3       | Three letters. Syntax only; a list is fast-moving.                                    |
| `isIcaoAirport`     | ICAO airport code, `DNMM`                  | regex        | P3       | Four letters.                                                                         |
| `isFlightNumber`    | `BA117`                                    | regex        | P3       | Two-character airline code plus 1-4 digits and an optional suffix.                    |
| `isUnLocode`        | UN/LOCODE, `NGLOS`                         | regex        | P3       | Country code plus three characters.                                                   |

## 9. National and tax identifiers

Per-country, so the surface is large. Each checks the published check digit where the
country defines one, and the shape otherwise. They are plain named exports, not a
dispatcher, so a bundler drops the countries you do not use. Where a country has no public
check digit (Nigeria's NIN and BVN, Kenya's KRA PIN, Ghana Card, the UAE TRN) the entry is
a shape check, and the test notes say so.

| Country        | Functions                                                        | Priority |
| -------------- | ---------------------------------------------------------------- | -------- |
| United States  | `isSsn`, `isEin`, `isItin`, `isAbaRouting`                       | P2       |
| United Kingdom | `isNino`, `isUkCompanyNumber`, `isPostalCode(value, 'GB')`       | P2       |
| Canada         | `isSin` (Luhn)                                                   | P3       |
| Nigeria        | `isNin`, `isBvn`, `isNigeriaTin`, `isNuban`, `isMobilePhone`     | P2       |
| India          | `isAadhaar` (Verhoeff), `isPan`, `isGstin`, `isIfsc`             | P2       |
| Brazil         | `isCpf`, `isCnpj` (alphanumeric, see below)                      | P2       |
| Spain          | `isDni`, `isNie`, `isCif`                                        | P3       |
| France         | `isNir`, `isSiren`, `isSiret`                                    | P3       |
| Germany        | `isSteuerId`, `isUstId`                                          | P3       |
| Italy          | `isCodiceFiscale` (with omocodia), `isPartitaIva`                | P3       |
| Netherlands    | `isBsn` (11-proof)                                               | P3       |
| Poland         | `isPesel`, `isNip`, `isRegon`                                    | P3       |
| Sweden         | `isPersonnummer`                                                 | P3       |
| Mexico         | `isCurp`, `isRfcMx`                                              | P3       |
| Australia      | `isTfn`, `isAbn`                                                 | P3       |
| China          | `isChineseId`                                                    | P3       |
| Japan          | `isMyNumber`                                                     | P3       |
| South Korea    | `isRrn` (checksum optional: numbers issued since 2020 have none) | P3       |
| Singapore      | `isNric`, `isUen`                                                | P3       |
| South Africa   | `isSaId`                                                         | P3       |
| Kenya          | `isKraPin`, `isKenyaId`                                          | P3       |
| Ghana          | `isGhanaCard`, `isPostalCode(value, 'GH')` (digital address)     | P3       |
| UAE            | `isEmiratesId`, `isUaeTrn`                                       | P3       |
| Turkey         | `isTckn`, `isVkn`                                                | P3       |
| Argentina      | `isCuit`, `isDniAr`                                              | P3       |

VAT numbers for the EU, UK and Norway are `isVatNumber`, in [section 6](#6-financial).

**Brazil's CNPJ is now alphanumeric.** New registrations from 31 July 2026 carry letters in
the first twelve positions; the last two check digits stay numeric, and existing numeric
CNPJs remain valid. `isCnpj` accepts `[0-9A-Z]{12}\d{2}` (or the masked
`12.ABC.345/01DE-35` form), with the mod 11 check computed over the ASCII code of each
character minus 48. The tests include the worked example from the
[Receita Federal Q&A](https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/perguntas-e-respostas/cnpj/cnpj-alfanumerico.pdf)
(`12.ABC.345/01DE-35`), which the implementation reproduces. Anything that stores a CNPJ in
a numeric-only column needs changing.

## 10. Colours

| Function     | Validates                                       | Kind         | Priority | Notes                                                                                               |
| ------------ | ----------------------------------------------- | ------------ | -------- | --------------------------------------------------------------------------------------------------- |
| `isHexColor` | `#fff`, `#ffffff`, optionally `#ffffffff`       | regex        | P1       | Options: `allowShort`, `allowAlpha`, `requireHash`. `<input type="color">` always yields `#rrggbb`. |
| `isRgbColor` | `rgb()` and `rgba()`, modern and legacy syntax  | regex + code | P2       | Range-checks each channel.                                                                          |
| `isHslColor` | `hsl()` and `hsla()`                            | regex + code | P2       |                                                                                                     |
| `isCssColor` | Any CSS colour literal, including named colours | regex + data | P2       | Named colours need a list of 148 names.                                                             |

## 11. Software and developer tooling

| Function               | Validates                                          | Kind         | Priority | Notes                                                                                                                                                                                                   |
| ---------------------- | -------------------------------------------------- | ------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `isSemver`             | Semantic version                                   | regex        | P1       | The official semver.org pattern. Option `allowPrefix` for `v1.2.3`.                                                                                                                                     |
| `isSemverRange`        | npm-style range, `^1.2.3`, `>=1 <2`                | regex        | P3       |                                                                                                                                                                                                         |
| `isCalver`             | Calendar version                                   | regex        | P3       |                                                                                                                                                                                                         |
| `isGitCommitHash`      | Git object id                                      | regex        | P1       | Option `length: 'full' \| 'short' \| 'any'`. Full is 40 hex (SHA-1) or 64 hex (SHA-256 repositories); short is 4 to 39 or 63, default minimum 7.                                                        |
| `isGitRefName`         | Valid branch or tag name                           | regex + code | P2       | Per `git check-ref-format` rules.                                                                                                                                                                       |
| `isGitUrl`             | Clone URL, `https://`, `ssh://` or `git@host:path` | regex        | P3       |                                                                                                                                                                                                         |
| `isNpmPackageName`     | npm package name, scoped or not                    | regex + data | P1       | Per npm naming rules: length 214, lowercase, URL-safe characters. Rejects reserved names (`node_modules`, `favicon.ico`) and core module names. Option `allowLegacy` for grandfathered uppercase names. |
| `isPurl`               | Package URL, `pkg:npm/%40henzyd/regex-kit@1.0.0`   | regex        | P3       |                                                                                                                                                                                                         |
| `isDockerImage`        | Image reference with registry, tag and digest      | regex        | P2       |                                                                                                                                                                                                         |
| `isDns1123Label`       | Kubernetes resource name, DNS-1123 label           | regex        | P1       | Lowercase alphanumerics and `-`, at most 63, starting and ending alphanumeric.                                                                                                                          |
| `isDns1123Subdomain`   | Kubernetes object name                             | regex        | P2       | Dot-separated DNS-1123 labels, at most 253.                                                                                                                                                             |
| `isS3BucketName`       | S3 bucket name                                     | regex        | P2       | 3-63 characters, lowercase, no IP-address form, no reserved prefixes or suffixes.                                                                                                                       |
| `isAwsArn`             | AWS ARN                                            | regex        | P2       | Option `service`. Partitions `aws`, `aws-cn`, `aws-us-gov`.                                                                                                                                             |
| `isAwsRegion`          | `eu-west-1`                                        | regex        | P3       | Pattern only; the region list moves.                                                                                                                                                                    |
| `isAndroidPackageName` | `com.example.app`                                  | regex        | P2       | At least two segments, each starting with a letter.                                                                                                                                                     |
| `isIosBundleId`        | `com.example.App`                                  | regex        | P2       | Reverse-DNS, letters, digits, hyphens and dots.                                                                                                                                                         |
| `isEnvVarName`         | `MY_ENV_VAR`                                       | regex        | P2       |                                                                                                                                                                                                         |
| `isIdentifier`         | Programming-language identifier                    | regex        | P3       | Option `language: 'js' \| 'python' \| 'sql' \| ...`. Optionally rejects reserved words.                                                                                                                 |
| `isGraphqlName`        | GraphQL name                                       | regex        | P3       | `[_A-Za-z][_0-9A-Za-z]*`.                                                                                                                                                                               |
| `isSqlIdentifier`      | Unquoted SQL identifier                            | regex        | P3       | A shape check for generated schema names. **Not** an injection defence; use parameterised queries.                                                                                                      |
| `isJsonPointer`        | RFC 6901 pointer, `/a/0/b`                         | regex        | P3       | `~0` and `~1` escapes only.                                                                                                                                                                             |
| `isCveId`              | `CVE-2026-12345`                                   | regex        | P3       |                                                                                                                                                                                                         |
| `isSpdxLicenseId`      | SPDX identifier, `MIT`, `Apache-2.0`               | regex + data | P3       |                                                                                                                                                                                                         |
| `isFileName`           | Safe file name, cross-platform                     | regex        | P1       | Rejects path separators, reserved Windows names (`CON`, `NUL`) and trailing dots.                                                                                                                       |
| `isFileExtension`      | `.png`, `png`                                      | regex        | P2       | Option `allowed: string[]`.                                                                                                                                                                             |
| `isPosixPath`          | POSIX path                                         | regex        | P2       |                                                                                                                                                                                                         |
| `isWindowsPath`        | Windows path, including UNC                        | regex        | P2       |                                                                                                                                                                                                         |
| `isFilePermission`     | `755`, `rwxr-xr-x`                                 | regex        | P3       |                                                                                                                                                                                                         |
| `isDataSize`           | `10MB`, `1.5 GiB`                                  | regex        | P3       |                                                                                                                                                                                                         |
| `isApiKeyLike`         | Known secret formats (AWS, GitHub, Stripe, Slack)  | regex        | P3       | For detection, such as flagging a pasted secret. Prefixes change; versioned list.                                                                                                                       |

## 12. Passwords and one-time codes

| Function            | Validates                                | Kind         | Priority | Notes                                                                                                                                                                                                                                                                                                        |
| ------------------- | ---------------------------------------- | ------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `isPassword`        | A password against a configurable policy | regex + code | P1       | **Default policy is length only**: `minLength` and `maxLength` (at least 64 allowed, counted in code points). Composition rules (`lowercase`, `uppercase`, `digits`, `symbols`, `noSpaces`, `noRepeating`) are opt-in. Not a strength meter. Renamed from `isStrongPassword`; see [decision 10](#decisions). |
| `getPasswordIssues` | Which policy rules a value failed        | regex + code | P2       | Returns an array of rule names, empty when it passes. Useful for form messages.                                                                                                                                                                                                                              |
| `isOtp`             | N-digit one-time code                    | regex        | P1       | Default 6; option `length`, `alphanumeric`.                                                                                                                                                                                                                                                                  |
| `isPin`             | Numeric PIN                              | regex        | P2       | Options for length and rejecting trivial values like `1234` or `0000`.                                                                                                                                                                                                                                       |
| `isTotpSecret`      | Base32 TOTP secret                       | regex        | P3       |                                                                                                                                                                                                                                                                                                              |
| `isTotpUri`         | `otpauth://totp/...` provisioning URI    | regex        | P3       |                                                                                                                                                                                                                                                                                                              |

## 13. HTTP and API requests

The values that arrive in headers, cookies and query strings. Most of these exist to keep
bad bytes out of a place where they change meaning (a header, a cookie), so they check
characters strictly.

| Function                | Validates                                 | Kind         | Priority | Notes                                                                                                                            |
| ----------------------- | ----------------------------------------- | ------------ | -------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `isHttpMethod`          | `GET`, `POST`, `PATCH`, ...               | regex        | P1       | Method token per RFC 9110. Option `methods` to allow only a list.                                                                |
| `isHttpHeaderName`      | `Content-Type`, `X-Request-Id`            | regex        | P1       | The RFC 9110 token characters. Case-insensitive. Option `allowPseudo` for HTTP/2 `:authority`.                                   |
| `isHttpHeaderValue`     | A value safe to put in a header           | regex        | P1       | No CR, LF or NUL, no control characters other than tab. The check that stops header injection (response splitting).              |
| `isContentType`         | `application/json; charset=utf-8`         | regex        | P1       | Media type plus parameters. Option `mediaTypes` to allow a list; ignores case and parameter spacing.                             |
| `isBearerToken`         | `Bearer <token68>`                        | regex        | P1       | RFC 6750 token characters, optional trailing `=`. Shape only.                                                                    |
| `isAuthorizationHeader` | `Bearer`, `Basic` or `Digest` credentials | regex        | P2       | Option `schemes`. For `Basic`, checks that the credentials are base64. Never decodes or logs them.                               |
| `isOrigin`              | `https://app.example.com`, no path        | regex        | P1       | Scheme, host and optional port only. Option `allowNull` for the literal `null` some browsers send. Use for CORS allow-lists.     |
| `isHttpStatusCode`      | 100-599                                   | regex + code | P2       | Also accepts a number. Option `class: '2xx' \| '4xx' \| ...`.                                                                    |
| `isETag`                | `"abc"` or `W/"abc"`                      | regex        | P2       | Per RFC 9110 entity-tag.                                                                                                         |
| `isCookieName`          | Cookie name                               | regex        | P1       | RFC 6265 token. Options `allowPrefixes` for `__Host-` and `__Secure-`.                                                           |
| `isCookieValue`         | Cookie value                              | regex        | P1       | RFC 6265 cookie-octets, optionally in double quotes.                                                                             |
| `isHttpDate`            | `Sun, 06 Nov 1994 08:49:37 GMT`           | regex + code | P2       | The IMF-fixdate form. Checks weekday against the date. Option `allowObsolete` for the two older forms.                           |
| `isTraceparent`         | W3C `traceparent` header                  | regex        | P2       | `00-<32 hex>-<16 hex>-<2 hex>`; rejects all-zero trace and span ids and version `ff`.                                            |
| `isIdempotencyKey`      | `Idempotency-Key` header value            | regex        | P3       | Printable ASCII, bounded length (default 255), option for UUID-only.                                                             |
| `isSortParam`           | `-createdAt,name`                         | regex        | P2       | Comma-separated fields with an optional `-` or `+` prefix. Option `fields` to allow only known ones, and `maxFields`.            |
| `isCursor`              | Opaque pagination cursor                  | regex        | P3       | URL-safe characters with a length cap. Does not decode.                                                                          |
| `isCharset`             | `utf-8`, `iso-8859-1`                     | regex        | P3       | Token syntax; optional list of common names.                                                                                     |
| `isAcceptLanguage`      | `en-GB,en;q=0.9`                          | regex        | P3       | Language ranges with `q` weights between 0 and 1.                                                                                |
| `isMultipartBoundary`   | `multipart/form-data` boundary            | regex        | P3       | 1-70 characters per RFC 2046.                                                                                                    |
| `isHmacSignatureHeader` | `sha256=<hex>` style webhook signatures   | regex        | P3       | The GitHub shape. Per-provider formats (Stripe's `t=...,v1=...`) live under service-specific. Checks shape, never the signature. |

## 14. Forms and generic input

What HTML forms and query strings actually send: everything is a string, booleans arrive as
`on`, and lists arrive as comma-separated text.

| Function          | Validates                                           | Kind         | Priority | Notes                                                                                                                                                                                                         |
| ----------------- | --------------------------------------------------- | ------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `isBooleanString` | `true`, `false`, `1`, `0`, `on`, `off`, `yes`, `no` | regex        | P1       | Option `values` to narrow. Case-insensitive by default. A checked box sends `on` (or its `value`) and an unchecked one sends nothing.                                                                         |
| `hasLength`       | Length within a range, in a stated unit             | regex + code | P1       | `hasLength(value, { min, max, unit })`. Units: `'utf16'` (JS `.length`), `'codepoints'` (default), `'graphemes'` (needs `Intl.Segmenter`), `'bytes'` (UTF-8). Returns `true` when the length is **in range**. |
| `isDelimitedList` | `a,b,c`                                             | regex + code | P1       | Options: `separator`, `item` (a validator for each entry), `min`, `max`, `allowEmpty`, `unique`. Rejects empty items such as `a,,b` by default.                                                               |
| `isSingleLine`    | No line breaks                                      | regex        | P1       | For `<input>` text. Rejects CR, LF, U+2028, U+2029.                                                                                                                                                           |
| `isPlainText`     | Text with no control characters but tab and newline | regex        | P2       | Also rejects lone surrogates. For `<textarea>` content.                                                                                                                                                       |
| `isTitle`         | Short human title                                   | regex        | P3       | Bounded length, single line, not blank.                                                                                                                                                                       |

The date and time inputs (`isDateTimeLocal`, `isMonthString`, `isWeekString`,
`isDateOfBirth`) are in [section 5](#5-dates-and-time), and `isHexColor` covers
`<input type="color">`.

## 15. Security and input hygiene

Checks for values that should never contain certain bytes or shapes. **`hasX` returns
`true` when the problem is present.** None of these sanitise, and none replaces escaping at
the point of use.

| Function              | Validates                                       | Kind         | Priority | Notes                                                                                                                                         |
| --------------------- | ----------------------------------------------- | ------------ | -------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `hasPathTraversal`    | `..` segments, `%2e%2e`, backslash variants     | regex        | P1       | Returns `true` on a hit. Checks the decoded and encoded forms but does not decode for you.                                                    |
| `isSafeRelativePath`  | A relative path that stays inside its base      | regex        | P1       | No leading `/`, no drive letter, no `..`, no NUL. Option `allowBackslash`. A pre-check: still resolve and compare against the base directory. |
| `isSafeRedirectPath`  | A same-site redirect target, `/dashboard?tab=1` | regex        | P1       | Starts with a single `/`; rejects `//host`, `/\host`, control characters and any scheme. The open-redirect guard for `?next=` parameters.     |
| `hasNullByte`         | A NUL character                                 | regex        | P1       | Returns `true` on a hit.                                                                                                                      |
| `hasBidiControls`     | Bidirectional override and isolate characters   | regex        | P2       | U+202A-202E, U+2066-2069, U+200E, U+200F, U+061C. Returns `true` on a hit. The "Trojan Source" class of attack.                               |
| `hasZeroWidthChars`   | Zero-width and invisible characters             | regex        | P2       | U+200B-200D, U+2060, U+FEFF. Returns `true` on a hit. Catches pasted-in invisible characters that make two identical-looking values differ.   |
| `isWellFormedUnicode` | No lone surrogates                              | regex        | P2       | Uses `String.prototype.isWellFormed` where present.                                                                                           |
| `isNormalized`        | Already in a Unicode normalisation form         | regex + code | P3       | `isNormalized(value, 'NFC')`. Compares against `String.prototype.normalize`.                                                                  |
| `isCsvSafe`           | Won't be read as a formula by a spreadsheet     | regex        | P2       | Rejects a leading `=`, `+`, `-`, `@`, tab or CR (the OWASP CSV-injection list). Option `allowNumeric` so `-5` stays valid.                    |
| `isPkceCodeVerifier`  | PKCE code verifier                              | regex        | P2       | 43-128 characters from `A-Z a-z 0-9 - . _ ~` (RFC 7636).                                                                                      |
| `isPkceCodeChallenge` | PKCE code challenge                             | regex        | P2       | Base64url without padding; 43 characters for `S256`.                                                                                          |
| `isOAuthScope`        | Space-delimited OAuth scope string              | regex        | P2       | RFC 6749 scope tokens. Option `scopes` to allow only a list.                                                                                  |
| `isPemBlock`          | A PEM-encoded block                             | regex        | P3       | `-----BEGIN <label>-----` through `END`, base64 body. Option `label`. Shape only.                                                             |
| `isSshPublicKey`      | `ssh-ed25519 AAAA... comment`                   | regex        | P3       | Known algorithm names, base64 body, optional comment.                                                                                         |

## 16. Health and science

Identifiers used in health, laboratory and research data. All P3: narrow audience, and the
code sets some of them index are licensed or fast-moving, so most are shape plus checksum
only.

| Function      | Validates                        | Kind             | Priority | Notes                                                            |
| ------------- | -------------------------------- | ---------------- | -------- | ---------------------------------------------------------------- |
| `isNpi`       | US National Provider Identifier  | regex + checksum | P3       | 10 digits, Luhn with the `80840` prefix.                         |
| `isIcd10`     | ICD-10 code, `A00.1`             | regex            | P3       | Pattern only. The code list is licensed and updated yearly.      |
| `isNdc`       | US National Drug Code            | regex            | P3       | 10-digit forms `4-4-2`, `5-3-2`, `5-4-1`, and the 11-digit form. |
| `isLoinc`     | LOINC code, `2345-7`             | regex + checksum | P3       | Mod 10 check digit.                                              |
| `isCasNumber` | CAS Registry Number, `7732-18-5` | regex + checksum | P3       |                                                                  |
| `isInchiKey`  | InChIKey                         | regex            | P3       | 27 characters, `14-10-1` blocks.                                 |
| `isArxivId`   | arXiv identifier, `2601.01234`   | regex            | P3       | New and old schemes.                                             |
| `isPubmedId`  | PubMed id                        | regex            | P3       | Digits only.                                                     |
| `isBloodType` | `A+`, `O-`, `AB+`                | regex            | P3       |                                                                  |

## 17. Commerce and mobile

| Function           | Validates               | Kind             | Priority | Notes                                                                                             |
| ------------------ | ----------------------- | ---------------- | -------- | ------------------------------------------------------------------------------------------------- |
| `isSku`            | Stock-keeping unit      | regex            | P2       | Letters, digits, `-`, `_`, `.`, bounded length. Options for case and separators. Your own scheme. |
| `isCouponCode`     | Promo or voucher code   | regex            | P3       | Alphanumeric, optional hyphen groups. Options `length`, `uppercase`.                              |
| `isTrackingNumber` | Courier tracking number | regex + checksum | P3       | `isTrackingNumber(value, 'ups')`. UPS, FedEx, USPS, DHL, Royal Mail. Formats change; versioned.   |
| `isIccid`          | SIM card number         | regex + checksum | P3       | 18-20 digits, begins `89`, Luhn.                                                                  |
| `isImsi`           | Subscriber identity     | regex            | P3       | 14 or 15 digits.                                                                                  |
| `isApnsToken`      | Apple push device token | regex            | P3       | 64 hex characters in the common case. Apple has not guaranteed the length; option `length`.       |

## 18. Service-specific identifiers

Fast-changing and tied to third parties, so every entry here is P3 and may live in a
separate subpath so it can be versioned on its own.

| Function            | Validates                                     |
| ------------------- | --------------------------------------------- |
| `isYoutubeVideoId`  | 11-character video id, and watch / short URLs |
| `isGithubUsername`  | GitHub username rules                         |
| `isGithubRepo`      | `owner/repo`                                  |
| `isSlackId`         | Slack user / channel / workspace ids          |
| `isDiscordId`       | Discord snowflake                             |
| `isTwitterHandle`   | X / Twitter handle                            |
| `isInstagramHandle` | Instagram username                            |
| `isLinkedinUrl`     | LinkedIn profile URL                          |
| `isStripeId`        | Stripe object ids, `cus_`, `pi_`, `sub_`      |
| `isStripeSignature` | `Stripe-Signature` header shape               |

---

## Helpers

Not validators themselves, but small functions that make validators fit real data. They are
plain functions, they allocate nothing beyond the closure, and they tree-shake like
everything else.

| Function          | Does                                                             | Priority | Notes                                                                                           |
| ----------------- | ---------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------- |
| `optional`        | Accepts `undefined`, `null` or `''`, otherwise runs the check    | P1       | `optional(isEmail)(form.email)`. The explicit answer to "an empty field is fine".               |
| `all`             | Every check passes                                               | P1       | `all(isEmail, matches(/@example\.com$/))`.                                                      |
| `any`             | At least one check passes                                        | P1       | `any(isEmail, isPhoneE164)`.                                                                    |
| `not`             | Inverts a check                                                  | P2       |                                                                                                 |
| `listOf`          | Every element of an array passes                                 | P2       | `listOf(isUuid, { min: 1, max: 50 })` for JSON arrays; `isDelimitedList` covers strings.        |
| `isOneOf`         | The value is in a given set                                      | P1       | `isOneOf(value, ['asc', 'desc'])`. Also accepts numbers for numeric enums.                      |
| `matches`         | A caller-supplied `RegExp`, with the input length guard          | P2       | So your own patterns get the same length cap and `never throws` behaviour.                      |
| `standardSchema`  | Wraps a check as a [Standard Schema](https://standardschema.dev) | P3       | A plain function, so the validators plug into libraries that read the spec, with no dependency. |
| `checkEmail`      | Like `isEmail`, but returns `{ ok: false, reason }`              | P2       | Reasons: `type`, `empty`, `tooLong`, `noAt`, `localPart`, `domain`.                             |
| `checkCreditCard` | Like `isCreditCard`, with a reason                               | P2       | Reasons: `type`, `empty`, `format`, `length`, `brand`, `luhn`.                                  |
| `escapeRegExp`    | Escapes a string for use inside a `RegExp`                       | P3       | The one function here that is not a check.                                                      |

---

## Deliberately not included

- **Anything that needs the network:** DNS, MX, reachability, VIES, "is this phone live".
- **Anything that needs a large or fast-moving data set:** the public suffix list,
  full IANA registries, full airline and airport lists, Unicode emoji data beyond what a
  single pattern holds.
- **Signature and cryptographic verification:** JWT signatures, webhook HMACs, password
  breach checks. A format check says the value is shaped like one, nothing more.
- **Attack detectors.** `looksLikeSqlInjection` and `looksLikeXss` give a false sense of
  security and are trivially bypassed. Parameterise queries and escape output instead.
  The `has` checks above target specific, well-defined byte patterns, not intent.
- **Parsers.** JSON, XML and regular-expression validity, JSONPath, ICU message syntax and CSS
  selectors are better done by a parser, and are not regex problems. Where a platform
  parser is the right tool (such as `new URL()`), the docs say so.
- **User-agent validation.** The grammar is nominal and real values are arbitrary.
- **Confusable and homograph detection.** It needs the Unicode confusables data and
  script-mixing rules; use a dedicated library.
- **File content sniffing.** Magic-byte checks work on bytes, not strings.
- **Sanitising.** These functions say yes or no. They never rewrite or escape input.

## Decisions

The questions that were open while the catalogue was being planned, and how they were
settled for 0.1.0. Each can be revisited; the cost of changing one is noted.

1. **Locale packaging.** Resolved: one named export per country identifier, and one
   `isPostalCode` / `isMobilePhone` dispatcher over bundled tables. The tables live in
   `src/data/` and carry no side effects, so a bundler drops the ones you do not reach.
   Per-country subpaths remain possible later without breaking the dispatcher.
2. **Raw patterns.** Not exported. Patterns stay private so they can be tightened without a
   breaking change. `matches(regex)` wraps your own pattern with the same guards.
3. **Subpath layout.** A single entry point. The package is `sideEffects: false` and ESM
   first, so unused validators are dropped; grouping can be added later as extra exports.
4. **Result type.** `isX` returns a boolean. `checkEmail` and `checkCreditCard` return
   `{ ok: true } | { ok: false, reason }`, and `getPasswordIssues` returns the failed rules.
   More `checkX` functions will follow demand; their reason codes are public API.
5. **Which locales first.** All of section 9 shipped together. The country list is the
   one the review asked for; further countries are additive.
6. **Separators.** Accept the printed form by default (spaces in an IBAN or card, hyphens in
   an ISBN), reject leading, trailing and doubled separators, and offer `{ strict: true }`
   for the canonical form.
7. **Hash functions.** Bundled: a small SHA-256 and Keccak-256 in `src/internal/hash.ts`,
   used only by `isBitcoinAddress({ checksum: true })`, `isEvmAddress({ checksum })` and
   `isCryptoAddress(value, 'tron')`. They are checked against `node:crypto` and published
   vectors, and a bundler drops them when those options are unused.
8. **Numbers as input.** Numeric-domain validators accept a finite number as well as a
   string; every other validator rejects non-strings.
9. **Runtime floor.** ES2022 on Node 20.19 or newer. `isEmoji` feature-detects the `v`
   flag and falls back to a pictographic pattern; `hasLength` with graphemes falls back to
   code points without `Intl.Segmenter`; `isTimezone` falls back to `Intl.DateTimeFormat`.
   Hermes has not been tested.
10. **Password naming.** `isPassword`, with a length-only default.
11. **Data versioning.** Table updates are minor releases and appear in the changelog.
    Each table's header records its source and the date it was checked.

## Facts to confirm

Things that could not be confirmed from a primary source while writing. None blocks use;
each is worth checking before relying on the entry for something regulated.

- **Password length defaults.** NIST SP 800-63B-4 (final) is said to forbid composition
  rules and to require a longer minimum when a password is the only factor than when it is
  paired with MFA (15 versus 8 characters is the figure I recall). The secondary sources
  checked quote only the 8-character figure and an older draft's wording. The default is 8
  to 128 code points. Read [the final text](https://pages.nist.gov/800-63-4/sp800-63b/passwords)
  and adjust the default if it says otherwise.
- **BIC first four characters.** SWIFT's own material says earlier editions of ISO 9362
  already allowed letters or digits there, while its BIC policy describes the prefix as
  alphabetic. The 2022 text is paywalled. The default is permissive.
- **CNPJ check digits.** The ASCII-minus-48 rule reproduces the worked example in the
  official Q&A, which is strong evidence. The dates are consistent across sources:
  production from 27 July 2026, first issuance on 31 July 2026.
- **Hermes and the `v` flag.** Node 20 and current browsers support `\p{RGI_Emoji}`; nothing
  was found on Hermes. The fallback pattern applies where the flag is missing.
- **NUBAN.** The 3-7-3 weighted mod 10 scheme is implemented from memory of the CBN
  specification and is tested against vectors generated from the same description, not
  against independent bank-issued numbers. Pass the bank code to check the digit; without
  it the check is shape only.
- **Shape-only national identifiers.** `isNin`, `isBvn`, `isNigeriaTin`, `isKraPin`,
  `isKenyaId`, `isGhanaCard`, `isUaeTrn`, `isUen`, `isRfcMx` (date only) and the
  licence-plate table check format, not a check digit.
- **Special-purpose IP ranges.** `isPublicIp` uses the IANA special-purpose registries as of
  2026-11. Recheck when the registries change.
- **Reference tables.** Country, currency, language and script lists were checked against
  the ICU data in the test runtime. The ISO 4217 table drops BGN and HRK (now EUR) and ANG
  (now XCG). IBAN lengths are checked for plausibility, not against the registry text.

## Prior art

- [validator.js](https://github.com/validatorjs/validator.js): the widest existing set of
  string validators, with locale-aware phone and postal code checks. The main reference for
  coverage.
- [Zod's string formats](https://zod.dev/api): emoji, base64, JWT, NanoID, CUID/CUID2,
  ULID, IPv4/IPv6, CIDR, and the UUID version handling (`z.uuid({ version })` versus
  `z.guid()`).
- [Regular Expressions Cookbook, "Validate ISBNs"](https://www.oreilly.com/library/view/regular-expressions-cookbook/9780596802837/ch04s13.html):
  on why checksums cannot be done with a regular expression alone.
- [Luhn algorithm](https://en.wikipedia.org/wiki/Luhn_algorithm) and
  [check digits](https://en.wikipedia.org/wiki/Check_digit): the background for the
  `regex + checksum` entries.
- [libphonenumber](https://github.com/google/libphonenumber): what to use when a phone
  check needs to be authoritative, rather than a format check.
- [NIST SP 800-63B-4, passwords](https://pages.nist.gov/800-63-4/sp800-63b/passwords):
  the basis for the length-only `isPassword` default.
- [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110) (HTTP semantics),
  [RFC 6265](https://www.rfc-editor.org/rfc/rfc6265) (cookies),
  [RFC 6750](https://www.rfc-editor.org/rfc/rfc6750) (bearer tokens),
  [RFC 7636](https://www.rfc-editor.org/rfc/rfc7636) (PKCE) and
  [RFC 9562](https://www.rfc-editor.org/rfc/rfc9562) (UUIDs): the grammars behind
  sections 3, 13 and 15.
- [Receita Federal: CNPJ alfanumérico](https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/perguntas-e-respostas/cnpj/cnpj-alfanumerico.pdf)
  and [Serpro: what changes](https://www.serpro.gov.br/menu/noticias/noticias-2026/cnpj-alfanumerico-o-que-muda).
- [V8: RegExp `v` flag and properties of strings](https://v8.dev/features/regexp-v-flag):
  `\p{RGI_Emoji}` and its support.
- [OWASP Input Validation Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html):
  the case for allow-list, shape-based checks, and for validating on the server.
