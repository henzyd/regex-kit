# Using validators

How to call the validators in `@henzyd/regex-kit`, in a browser form, a mobile app, and a
server request handler.

> Every example on this page is run by the test suite (`test/guide.test.ts`). The full
> list of what each validator accepts and rejects is in [Test cases](test-cases.md).

## Install

```bash
npm install @henzyd/regex-kit
```

ESM and CommonJS are both supported, with bundled types. Node 20.19 or newer, and no
runtime dependencies.

```ts
import { isEmail, isUuid } from '@henzyd/regex-kit';
```

```js
const { isEmail, isUuid } = require('@henzyd/regex-kit');
```

## The basics

Every validator has the same shape: it takes a value and returns a boolean.

```ts
isEmail('ada@example.com'); // true
isEmail('ada@'); // false
isUuid('123e4567-e89b-12d3-a456-426614174000'); // true
```

Four rules hold for all of them, so you can rely on them without reading each entry:

- **They never throw.** Bad input returns `false`.
- **Anything that is not a string returns `false`.** `isEmail(undefined)`, `isEmail(42)` and
  `isEmail(null)` are all `false`, so you can pass raw request data without a guard. The
  exception is validators for numeric values (`isPort`, `isInteger`, `isLatitude`,
  `isYear` and similar), which also accept a finite number, because JSON bodies carry
  numbers: `isPort(8080)` and `isPort('8080')` are both `true`.
- **An empty string is `false`** (except for `isBlank`). Whether an empty field is
  acceptable is up to you; see [Optional values](#optional-values).
- **They check shape, not existence.** `isEmail` does not know whether the mailbox exists,
  and `isUrl` does not know whether the page loads.

The names tell you what `true` means. `isX` is `true` for a valid value. `hasX` is `true`
when a **problem** is present, so `hasPathTraversal('../etc/passwd')` is `true`. `getX`
returns a value or `null`.

## Options

A second argument tunes the check. Options are always an object, and every option has a
documented default.

```ts
isUrl('ftp://files.example.com', { protocols: ['ftp'] }); // true
isUrl('localhost:3000', { allowLocalhost: true, requireProtocol: false }); // true

isInteger('007'); // false: leading zeros rejected by default
isInteger('007', { allowLeadingZeros: true }); // true

isPassword('correct horse battery', { minLength: 12 }); // true: length is the default rule
isPassword('Ab1!', { minLength: 12 }); // false: too short, whatever it contains
isPassword('abcdefghijkl', { minLength: 12, digits: 1 }); // false: composition rules are opt-in
```

Passwords are checked on length by default and not on composition. Requiring symbols and
capitals makes people choose predictable passwords, and current NIST guidance advises
against it, so those rules are options you turn on rather than defaults.

## Locale-aware validators

Where the rules depend on a country, the country code is the second argument. It is an
ISO 3166-1 alpha-2 code.

```ts
isPostalCode('SW1A 1AA', 'GB'); // true
isPostalCode('90210', 'US'); // true
isMobilePhone('+2348012345678', 'NG'); // true
```

An unsupported country throws no error: the validator returns `false`, so check the
country list in [Test cases](test-cases.md) when a valid-looking value is rejected. Country
codes are case-insensitive. `isPostalCode(value, 'any')` is a generic fallback that accepts
a plausible code of any country.

## Checksummed validators

Some identifiers contain a check digit. The validator runs the checksum as well as the
pattern, so a well-shaped but invalid number is rejected.

```ts
isCreditCard('4111 1111 1111 1111'); // true  (Luhn passes)
isCreditCard('4111 1111 1111 1112'); // false (right shape, wrong check digit)
isIban('GB82 WEST 1234 5698 7654 32'); // true
```

A pass means the number is _plausibly typed correctly_. It does not mean the card is real
or the account exists.

Identifiers that people type or copy from a printed form accept that form's separators:
spaces in a card number or IBAN, hyphens in an ISBN. Pass `{ strict: true }` when you want
the canonical form only, which is what you want for values read back from your own
database.

```ts
isIban('GB82WEST12345698765432', { strict: true }); // true
isIban('GB82 WEST 1234 5698 7654 32', { strict: true }); // false: spaces not allowed
```

## Type guards

Validators that identify a specific kind of string narrow its type, so the compiler
remembers the check happened.

```ts
import { isUuid, type Uuid } from '@henzyd/regex-kit';

function loadUser(id: Uuid) {
  /* ... */
}

function handler(raw: string) {
  if (isUuid(raw)) {
    loadUser(raw); // raw is Uuid here
  }
}
```

## In a web form

Validate on the client for fast feedback, and again on the server, because the client
check is only a convenience.

```tsx
import { isEmail, isPassword } from '@henzyd/regex-kit';

function validate(form: { email: string; password: string }) {
  const errors: Record<string, string> = {};

  if (!isEmail(form.email.trim())) errors.email = 'Enter a valid email address.';
  if (!isPassword(form.password, { minLength: 12 })) {
    errors.password = 'Use at least 12 characters.';
  }

  return errors;
}
```

Validators do not trim or change case. Trim before you validate, as above, and use the
trimmed value afterwards too, so what you stored is what you checked. Do not trim a
password, though: spaces are allowed in one.

Form fields arrive as strings, so the form-oriented validators match what browsers send:
`isBooleanString` for a checkbox (`on`), `isDateTimeLocal` for `datetime-local` inputs,
`isDelimitedList` for comma-separated text, and `isSingleLine` for a text input.

### Optional values

An empty string is invalid for every validator, so wrap the check for fields that may be
left blank:

```ts
import { optional, isEmail, isPhoneE164 } from '@henzyd/regex-kit';

const emailOk = optional(isEmail)(form.email); // true when empty or a valid email
```

`optional` accepts `undefined`, `null` and `''`. Combine checks with `all` and `any`:
`any(isEmail, isPhoneE164)(form.contact)` accepts either.

## On the server

Validate every value that crosses a trust boundary: body, query string, path parameters,
headers and environment variables.

```ts
import { isUuid, isInteger, isIsoDate } from '@henzyd/regex-kit';

app.get('/orders/:id', (req, res) => {
  const { id } = req.params;
  const { page = '1', since } = req.query;

  if (!isUuid(id)) return res.status(400).json({ error: 'id must be a UUID' });
  if (!isInteger(page, { min: 1, max: 1000 })) {
    return res.status(400).json({ error: 'page must be between 1 and 1000' });
  }
  if (since !== undefined && !isIsoDate(since)) {
    return res.status(400).json({ error: 'since must be an ISO date' });
  }

  // ...
});
```

Note the pattern for optional values: check for `undefined` yourself, or wrap the check in
`optional`. A missing value is a decision about your API, not about the format.

The request layer has its own validators. Use `isHttpHeaderValue` before you copy
user input into a response header (it rejects CR and LF, which stop header injection),
`isSafeRedirectPath` before you redirect to a `?next=` parameter, and `isPublicIp` before
your server fetches a URL a user gave you. These are pre-checks: `isPublicIp` cannot stop a
hostname that later resolves to a private address, so resolve and check at connection
time as well.

## With a schema library

The validators are plain predicates, so they plug into any schema library. For example,
with Zod:

```ts
import { z } from 'zod';
import { isIban, isCurrencyCode } from '@henzyd/regex-kit';

const Payout = z.object({
  iban: z.string().refine(isIban, 'Not a valid IBAN'),
  currency: z.string().refine(isCurrencyCode, 'Unknown currency code')
});
```

The same works with `.custom()` in Yup or `custom` in Valibot, Joi and express-validator.
The package does not depend on any of them.

## Checking a lot of values

To report every failing field at once, run the checks and collect the results:

```ts
const checks = {
  email: isEmail(input.email),
  phone: isPhoneE164(input.phone),
  postcode: isPostalCode(input.postcode, 'GB')
};

const failed = Object.entries(checks)
  .filter(([, ok]) => !ok)
  .map(([field]) => field);
```

## Safe on untrusted input

- **Patterns are written to avoid catastrophic backtracking** and are tested against long
  non-matching input. A malicious string should not stall your event loop.
- **Every validator has a maximum input length** (320 for `isEmail`, for example) and
  returns `false` for anything longer without running its pattern, so a 10 MB string costs
  a length check and nothing more. You should still limit request body size at your
  server, since the string has already been read into memory by then.

- **Validating is not sanitising.** A `true` means the value has a given shape. It does not
  make the value safe to put into HTML, SQL or a shell command. Escape or parameterise at
  the point of use.
- **A format check is not an authorisation check.** `isJwt` confirms a token has the shape
  of a JWT (signed, encrypted or unsecured, per its `type` option); it does not verify the
  signature.
- **Validators that read the clock take `now`.** `isCreditCardExpiry` and `isDateOfBirth`
  compare against the current time, so tests should pass `{ now }` to stay deterministic.

## Bundle size

The package is marked `sideEffects: false`, so a bundler drops the validators you do not
import. Import by name, and avoid `import * as validators`, which pulls in everything.

## Testing your own usage

Validators are deterministic (the clock-reading ones accept `now`), so they are easy to
test. When you hit a value that
is wrongly accepted or rejected, [open an issue](https://github.com/henzyd/regex-kit/issues)
with the exact string. It becomes a test case.

## Common questions

**Why does `isEmail` accept an address that does not exist?** It checks that the address is
well-formed. The only way to know a mailbox exists is to send a message to it.

**Why does `isUrl('example.com')` return `false`?** A bare domain has no protocol, so by
default it is not an absolute URL. Pass `{ requireProtocol: false }`, or use `isDomain`.

**Why was my credit card rejected when the digits look right?** The check digit failed.
The Luhn algorithm catches most single-digit typos, which is what it is for.

**Can I get the underlying `RegExp`?** Not yet. Whether to export raw patterns is an open
question in the [Validator catalogue](validators.md#open-questions).

**Can I find out _why_ validation failed?** Not with a boolean validator. A `checkX` form
that returns a failure reason exists for `checkEmail` and `checkCreditCard`, and
`getPasswordIssues` lists which password rules failed. More follow demand; see the
[decisions](validators.md#decisions).

**Do the validators work in React Native?** The core ones use plain patterns. A few
(`isEmoji`, `hasLength` by grapheme, `isTimezone`) depend on newer JavaScript engine
features and are documented with what they do without them. Hermes (React Native) has
not been tested.
