const INVISIBLE = new RegExp(
  '[' +
    [
      0x2028, 0x2029, 0x85, 0x200b, 0x200c, 0x200d, 0x200e, 0x200f, 0x2060, 0xfeff, 0x202a, 0x202b,
      0x202c, 0x202d, 0x202e, 0x2066, 0x2067, 0x2068, 0x2069
    ]
      .map((c) => '\\u' + c.toString(16).padStart(4, '0'))
      .join('') +
    ']',
  'g'
);

const escapeSeparators = (s: string): string =>
  s.replace(INVISIBLE, (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, '0')}`);

/** Render a test input compactly and unambiguously, for test names and the docs. */
export function show(value: unknown): string {
  if (typeof value === 'string') {
    const text =
      value.length > 80
        ? `${JSON.stringify(value.slice(0, 40))}… (${value.length} chars)`
        : JSON.stringify(value);
    return escapeSeparators(text);
  }
  if (typeof value === 'bigint') return `${value}n`;
  if (typeof value === 'number') return Object.is(value, -0) ? '-0' : String(value);
  if (typeof value === 'function') return '[Function]';
  if (typeof value === 'symbol') return String(value);
  if (value === undefined) return 'undefined';
  if (value instanceof Date) return 'new Date()';
  if (Array.isArray(value)) return `[${value.map(show).join(', ')}]`;
  if (value !== null && typeof value === 'object') {
    return `{ ${Object.entries(value)
      .map(([k, v]) => `${k}: ${show(v)}`)
      .join(', ')} }`;
  }
  return String(value);
}
