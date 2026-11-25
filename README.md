# @henzyd/regex-kit

Tested validators for the data that arrives in web forms, mobile apps and server requests:
emails, URLs, IP addresses, IBANs, dates, HTTP headers, national IDs and about three hundred
more. Plain functions, no dependencies, ESM and CommonJS, full TypeScript types.

```ts
import { isEmail, isIban, isPostalCode, isUuid } from '@henzyd/regex-kit';

isEmail('ada@example.com'); // true
isIban('GB82 WEST 1234 5698 7654 32'); // true
isPostalCode('SW1A 1AA', 'GB'); // true
isUuid('not-a-uuid'); // false
```

## Install

```bash
npm install @henzyd/regex-kit
```

```js
const { isEmail } = require('@henzyd/regex-kit'); // CommonJS works too
```

Node 20.19 or newer. Import by name; the package is `sideEffects: false`, so a bundler
drops the validators you do not use.

## What every validator promises

- **It takes any value and returns a boolean.** `isEmail(undefined)` is `false`, not an error.
  It never throws.
- **It checks shape, not existence.** An email can be well-formed and still bounce.
- **It is safe on hostile input.** Every validator has a length limit and linear-time
  patterns, and the test suite times twenty pathological inputs against each of them.
- **It does not change your input.** No trimming, no lowercasing, no sanitising.

Options go in a second argument (`isUrl(value, { allowLocalhost: true })`), and a country in
the second argument where it matters (`isPostalCode(value, 'GB')`).

## What is in it

| Area                 | Examples                                                                                       |
| -------------------- | ---------------------------------------------------------------------------------------------- |
| Contact and identity | `isEmail`, `isPhoneE164`, `isMobilePhone`, `isUsername`, `isSlug`                              |
| Network and web      | `isUrl`, `isDomain`, `isIpv6`, `isCidr`, `isPublicIp`, `isJwt`, `isBase64`, `isMimeType`       |
| Identifiers          | `isUuid`, `isUlid`, `isNanoid`, `isObjectId`, `isHash`, `isSriHash`                            |
| Numbers and text     | `isInteger`, `isDecimal`, `isCurrencyAmount`, `isAlpha`, `isEmoji`                             |
| Dates and time       | `isIsoDate`, `isIsoDateTime`, `isDate(value, 'DD/MM/YYYY')`, `isTimezone`, `isCron`            |
| Financial            | `isCreditCard`, `isIban`, `isBic`, `isCurrencyCode`, `isBitcoinAddress`, `isVatNumber`         |
| Products and devices | `isIsbn`, `isEan`, `isImei`, `isVin`, `isDoi`                                                  |
| Geography            | `isPostalCode`, `isLatLong`, `isCountryCode`, `isLocale`                                       |
| National IDs         | 50 identifiers for 25 countries, from `isSsn` to `isCnpj` (the new alphanumeric one)           |
| Software             | `isSemver`, `isNpmPackageName`, `isDockerImage`, `isAwsArn`, `isGitRefName`                    |
| Passwords and codes  | `isPassword` (length-first, per NIST), `isOtp`, `isPin`, `isTotpUri`                           |
| HTTP requests        | `isHttpHeaderValue` (blocks header injection), `isOrigin`, `isContentType`, `isCookieName`     |
| Forms                | `isBooleanString`, `hasLength`, `isDelimitedList`, `isDateTimeLocal`                           |
| Security hygiene     | `hasPathTraversal`, `isSafeRedirectPath`, `hasBidiControls`, `isCsvSafe`, `isPkceCodeVerifier` |
| Helpers              | `optional`, `all`, `any`, `listOf`, `matches`, `standardSchema`, `checkEmail`                  |

The complete list, with options and what each one deliberately rejects, is the
[validator catalogue](docs/validators.md). How to call them in a form, an app and a server
handler is in [Using validators](docs/using-validators.md).

## Tested

About 4,400 concrete cases, plus contract tests that run against every validator at once
(6,400 tests in all). The cases are all listed in [docs/test-cases.md](docs/test-cases.md), which is generated
from the test data so it cannot drift. Checksums are checked against published vectors, and
the reference data (countries, currencies, languages) against the ICU data in the runtime.

## Limits worth knowing

A passing check means _plausibly well-formed_. It does not mean the card is real, the
mailbox exists, the token is genuine or the input is safe to put in HTML, SQL or a shell
command: escape or parameterise at the point of use. `isMobilePhone` and `isPostalCode` are
format checks; use libphonenumber when a phone number must be authoritative. The
[catalogue](docs/validators.md#facts-to-confirm) lists what could not be verified against a
primary source.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Security issues follow [SECURITY.md](SECURITY.md).

## Licence

MIT
