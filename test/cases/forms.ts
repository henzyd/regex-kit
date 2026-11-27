import { g, spec, w } from './types.js';

export const forms = [
  spec(
    'isBooleanString',
    g(['true', 'FALSE', '1', '0', 'on', 'Off', 'yes', 'No'], ['y', 'n', 't', '2', 'truee', 'on ']),
    w([{ values: ['yes', 'no'] }], ['YES', 'no'], ['true', '1'])
  ),
  spec(
    'hasLength',
    w([{ min: 2, max: 5 }], ['ab', 'abcde', '日本', '😀😀'], ['a', 'abcdef', '']),
    w([{ max: 3 }], ['', 'abc'], ['abcd'], 'Empty is accepted when zero is in range.'),
    w([{ min: 1 }], ['a'], ['']),
    w([{ unit: 'utf16', max: 1 }], ['a'], ['😀']),
    w([{ unit: 'codepoints', max: 1 }], ['😀'], ['ab', '👨‍👩‍👧']),
    w([{ unit: 'graphemes', max: 1 }], ['👨‍👩‍👧', 'e\u0301', 'a'], ['ab']),
    w([{ unit: 'bytes', max: 2 }], ['é', 'ab'], ['abc', '日']),
    w([{ min: 3, unit: 'bytes' }], ['日'], ['ab'])
  ),
  spec(
    'isDelimitedList',
    g(['a,b,c', 'a', '1,2,3'], ['a,,b', ',', 'a,b,', ',a']),
    w([{ separator: '|' }], ['a|b'], ['a,b|']),
    w([{ item: (x: string) => /^\d+$/.test(x) }], ['1,2,3'], ['1,a']),
    w([{ min: 2 }], ['a,b'], ['a']),
    w([{ max: 2 }], ['a,b'], ['a,b,c']),
    w([{ unique: true }], ['a,b'], ['a,a']),
    w([{ allowEmpty: true }], ['a,,b', ','], []),
    w([{ trim: true, item: (x: string) => /^[a-z]$/.test(x) }], ['a, b , c'], ['a, 1']),
    w([{ item: (x: string) => /^[a-z]$/.test(x) }], ['a,b'], ['a, b'])
  ),
  spec(
    'isSingleLine',
    g(
      ['hello', 'a b', '日本語'],
      ['a\nb', 'a\rb', 'a\u2028b', 'a\u2029b', 'a\u000bb', 'a\fb', 'a\u0085b']
    )
  ),
  spec(
    'isPlainText',
    g(
      ['hello', 'a\nb', 'a\tb', 'a\r\nb', '日本語 😀'],
      ['a\u0000b', 'a\u0007b', 'a\u007fb', 'a\u0085b', '\ud800', 'a\udc00b', 'a\ud83db']
    )
  ),
  spec(
    'isTitle',
    g(['Hello world', 'A'], ['   ', 'a\nb', 'a\u0000b', 'a'.repeat(121)]),
    w([{ maxLength: 5 }], ['abcde'], ['abcdef'])
  )
];
