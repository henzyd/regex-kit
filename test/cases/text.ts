import { g, spec, w } from './types.js';

export const text = [
  spec(
    'isNumeric',
    g(['123', '0', '007', 123], ['12a', '-1', '1.5', ' 1', '1e5', -1, 1.5]),
    w([{ allowSign: true }], ['-1', '+1', '1'], ['--1', '1-']),
    w([{ allowDecimal: true }], ['1.5', '1'], ['.5', '1.', '1.5.5']),
    w([{ allowSign: true, allowDecimal: true }], ['-1.5', '+0.25'], ['-.5'])
  ),
  spec(
    'isInteger',
    g(
      ['0', '7', '-7', '123456789012345678901234567890', 42, -42, 0],
      [
        '007',
        '-0',
        '+1',
        '1.0',
        '1e3',
        ' 1',
        '1_000',
        '0x10',
        1.5,
        Number.NaN,
        Number.POSITIVE_INFINITY
      ]
    ),
    w([{ allowLeadingZeros: true }], ['007', '-007', '0'], ['0x7']),
    w([{ allowNegative: false }], ['1', '0'], ['-1']),
    w([{ min: 1, max: 10 }], ['1', '10', 5], ['0', '11', 0, '-3']),
    w([{ min: 9007199254740993n }], ['9007199254740993', '9007199254740994'], ['9007199254740992']),
    w([{ max: -5 }], ['-6', -5], ['-4']),
    w([{ min: 1.5 }], ['2'], ['1'], 'Fractional bounds round inwards.')
  ),
  spec(
    'isSafeInteger',
    g(
      ['9007199254740991', 9007199254740991, '-9007199254740991', '0'],
      ['9007199254740992', '-9007199254740992', 1.5, 'abc']
    )
  ),
  spec(
    'isDecimal',
    g(
      ['1', '1.5', '-1.5', '0.5', '10.00', '123456.789', 1.5],
      ['.5', '1.', '1.5.5', '1,5', 'abc', '01.5', '--1.5', '1e5']
    ),
    w([{ decimalPlaces: 2 }], ['1.00', '0.99'], ['1.0', '1', '1.005']),
    w([{ decimalPlaces: { min: 1, max: 2 } }], ['1.5', '1.55'], ['1', '1.555']),
    w([{ decimalSeparator: ',' }], ['1,5', '10'], ['1.5']),
    w([{ locale: 'de-DE' }], ['1,5'], ['1.5']),
    w([{ locale: 'en' }], ['1.5'], ['1,5']),
    w([{ allowNegative: false }], ['1.5'], ['-1.5']),
    w([{ allowLeadingZeros: true }], ['01.5'], ['0a.5'])
  ),
  spec(
    'isFloat',
    g(
      ['1', '1.5', '.5', '1.', '-1.5', '1e5', '1.5E-3', '+2.5', 1.5],
      ['abc', '1e', 'e5', '1.5.5', '1e999', '.', Number.NaN]
    ),
    w([{ min: 0, max: 1 }], ['0.5', '0', '1'], ['2', '-0.1'])
  ),
  spec(
    'isPercentage',
    g(
      ['42%', '0%', '100%', '42.5%', '+5%', 50, 0, 100],
      ['101%', '-1%', '42', '%', 'abc%', '42 %', 101, -1, Number.NaN]
    ),
    w([{ min: -100, max: 100 }], ['-50%', 100], ['-101%']),
    w([{ requireSymbol: false }], ['42', '42%'], ['abc'])
  ),
  spec(
    'isCurrencyAmount',
    g(
      ['$1,234.56', '$5', '$0.99', '1234.56', '-$5.00', '$1234.56', '£10', '€1,000'],
      ['$1,23.45', '$1.234', '$', 'abc', '$ 5', '5$', '$1,234,56']
    ),
    w([{ symbolPosition: 'suffix' }], ['5$', '5 €', '5'], ['$5']),
    w([{ symbolPosition: 'either' }], ['$5', '5$', '5 €', '5'], ['$5$']),
    w(
      [{ symbol: '€', thousandsSeparator: '.', decimalSeparator: ',' }],
      ['€1.234,56', '€5', '1.234,56'],
      ['$1,234.56', '€1,234.56']
    ),
    w([{ requireSymbol: true }], ['$5'], ['5']),
    w([{ allowNegative: false }], ['$5'], ['-$5']),
    w([{ decimalPlaces: { min: 2, max: 2 } }], ['$5.00'], ['$5', '$5.0']),
    w([{ decimalPlaces: { max: 0 } }], ['$5', '$1,000'], ['$5.00']),
    w([{ thousandsSeparator: '' }], ['$1234'], ['$1,234'])
  ),
  spec(
    'isRomanNumeral',
    g(
      ['I', 'IV', 'IX', 'XL', 'XC', 'CD', 'CM', 'MCMXCIV', 'MMMCMXCIX'],
      ['IIII', 'VX', 'IC', 'MMMM', 'ABC', 'iv', 'IVI']
    ),
    w([{ caseInsensitive: true }], ['mcmxciv', 'IV'], ['abc'])
  ),
  spec(
    'isAlpha',
    g(['abc', 'ABC', 'aBc'], ['abc1', 'ab c', 'é', 'abc-']),
    w([{ unicode: true }], ['é', '日本', 'Ünïcödé', 'abc'], ['abc1', 'a b']),
    w([{ locale: 'ru-RU' }], ['привет'], ['hello']),
    w([{ locale: 'el' }], ['αβγ'], ['abc']),
    w([{ locale: 'de-DE' }], ['äöüß', 'abc'], ['привет']),
    w([{ locale: 'ja' }], ['ひらがな', 'カタカナ', '漢字'], ['abc'])
  ),
  spec(
    'isAlphanumeric',
    g(['abc123', 'ABC', '123'], ['abc-123', 'abc 123', 'é1']),
    w([{ unicode: true }], ['é1', '日本1'], ['é-1'])
  ),
  spec('isAscii', g(['hello', 'a\tb', '\u0000'], ['héllo', '日本', '😀'])),
  spec('isPrintableAscii', g(['hello world!~'], ['a\tb', 'a\n', '\u007f', 'é'])),
  spec(
    'hasNoControlChars',
    g(['hello', 'héllo', '日本'], ['a\nb', 'a\tb', 'a\u0000b', 'a\u007fb', 'a\u0085b']),
    w([{ allow: ['\n', '\t'] }], ['a\nb\tc', 'abc'], ['a\u0000b', 'a\rb'])
  ),
  spec('isBlank', g(['', ' ', '  \t\n', ' '], ['a', ' a ', '0'])),
  spec('isLowercase', g(['hello', 'hello123', 'héllo', '123'], ['Hello', 'HELLO', 'heLLo'])),
  spec('isUppercase', g(['HELLO', 'HELLO123', '123'], ['Hello', 'hello'])),
  spec(
    'isCamelCase',
    g(
      ['camelCase', 'camel', 'getHTTPResponse', 'a1B2'],
      ['CamelCase', 'snake_case', 'kebab-case', '1camel', 'camel Case']
    )
  ),
  spec(
    'isPascalCase',
    g(['PascalCase', 'Pascal', 'HTMLParser'], ['pascalCase', 'Pascal_Case', '1Pascal'])
  ),
  spec(
    'isSnakeCase',
    g(
      ['snake_case', 'snake', 'a_1'],
      ['Snake_case', 'snake__case', '_snake', 'snake_', 'snake-case']
    )
  ),
  spec(
    'isKebabCase',
    g(
      ['kebab-case', 'kebab', 'a-1'],
      ['Kebab-case', 'kebab--case', '-kebab', 'kebab-', 'kebab_case']
    )
  ),
  spec(
    'isScreamingSnakeCase',
    g(['SCREAMING_SNAKE', 'A', 'MAX_1'], ['Screaming_Snake', 'SCREAMING__SNAKE', '_A', 'a_b'])
  ),
  spec(
    'isHtmlTag',
    g(
      [
        '<div>',
        '</div>',
        '<br/>',
        '<br />',
        '<img src="a.png" alt="x">',
        '<a href="https://x.co" target=_blank>',
        '<my-element>'
      ],
      ['div', '<div', '<>', '< div>', '<div><span>', '<1div>', 'text <b>', '<div>text</div>']
    )
  )
];
