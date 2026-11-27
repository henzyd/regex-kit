export * from './types.js';
export * from './contact.js';
export * from './network.js';
export * from './identifiers.js';
export * from './text.js';

/**
 * Escape every character that has a special meaning inside a regular expression,
 * so the result can be embedded in a pattern and matched literally.
 */
export function escapeRegExp(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\\-/]/g, '\\$&');
}
export * from './datetime.js';
export * from './financial.js';
export * from './products.js';
export * from './geo.js';
export * from './national.js';
export * from './colour.js';
export * from './password.js';
export * from './software.js';
export * from './http.js';
export * from './forms.js';
export * from './security.js';
export * from './health.js';
export * from './commerce.js';
export * from './service.js';
export * from './helpers.js';
export * from './check.js';
