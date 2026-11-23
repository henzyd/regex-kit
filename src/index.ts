/**
 * Escape every character that has a special meaning inside a regular expression,
 * so the result can be embedded in a pattern and matched literally.
 *
 * This is a placeholder export that keeps the build, tests and smoke script
 * exercising something real until the first genuine feature lands.
 */
export function escapeRegExp(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\\-/]/g, '\\$&');
}
