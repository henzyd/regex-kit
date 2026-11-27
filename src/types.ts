import type { Brand } from './internal/core.js';

/** Branded string types. A validator that returns `value is Uuid` narrows to these. */
export type Email = Brand<string, 'Email'>;
export type Uuid = Brand<string, 'Uuid'>;
export type Ulid = Brand<string, 'Ulid'>;
export type Cuid2 = Brand<string, 'Cuid2'>;
export type Nanoid = Brand<string, 'Nanoid'>;
export type ObjectId = Brand<string, 'ObjectId'>;
export type Slug = Brand<string, 'Slug'>;
export type Domain = Brand<string, 'Domain'>;
export type Ipv4 = Brand<string, 'Ipv4'>;
export type Ipv6 = Brand<string, 'Ipv6'>;
export type HttpUrl = Brand<string, 'HttpUrl'>;
export type Base64 = Brand<string, 'Base64'>;
export type IsoDate = Brand<string, 'IsoDate'>;
export type Semver = Brand<string, 'Semver'>;
export type Jwt = Brand<string, 'Jwt'>;
export type Iban = Brand<string, 'Iban'>;
