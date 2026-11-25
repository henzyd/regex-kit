# Changelog

All notable changes to `@henzyd/regex-kit` are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - Unreleased

First release.

### Added

- About three hundred validators, grouped as in `docs/validators.md`: contact and identity,
  network and web, identifiers, numbers and text, dates and time, financial, products and
  devices, geography and locale, national and tax identifiers for 25 countries, colours,
  software tooling, passwords and one-time codes, HTTP requests, forms, security hygiene,
  health and science, commerce and mobile, and service-specific ids.
- Helpers: `optional`, `all`, `any`, `not`, `listOf`, `isOneOf`, `matches`,
  `standardSchema`, plus `checkEmail` and `checkCreditCard`, which return a failure reason.
- Branded string types for validators that narrow (`Uuid`, `Email`, `Iban`, and others).
- Reference data bundled in the package: ISO 3166-1, ISO 4217, ISO 639-1, ISO 15924, IBAN
  lengths, E.164 calling codes, postal and mobile formats, CSS colours, SPDX identifiers.
- Small internal SHA-256 and Keccak-256 for Bitcoin, Tron and EIP-55 address checksums.
- `docs/using-validators.md`, `docs/validators.md` and a generated `docs/test-cases.md`.

### Notes

- `isCnpj` accepts the alphanumeric CNPJ issued from 31 July 2026.
- `isPassword` checks length by default; composition rules are opt-in.
- Package setup: dual ESM and CommonJS build with type declarations, Vitest, ESLint,
  Prettier, and CI, security and release workflows.

[Unreleased]: https://github.com/henzyd/regex-kit/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/henzyd/regex-kit/releases/tag/v0.1.0
