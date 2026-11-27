import { g, spec, w } from './types.js';

export const passwords = [
  spec(
    'isPassword',
    g(
      [
        'correct horse battery',
        'abcdefgh',
        'päss wörd 123',
        '12345678',
        `${'a'.repeat(128)}`,
        '🙂'.repeat(8)
      ],
      ['short', 'abcdefg', 'a'.repeat(129), '🙂'.repeat(7)],
      'Default policy: length only, 8 to 128 code points.'
    ),
    w([{ minLength: 12 }], ['correct horse battery', 'abcdefghijkl'], ['Ab1!', 'abcdefghijk']),
    w([{ maxLength: 10 }], ['abcdefghij'], ['abcdefghijk']),
    w([{ lowercase: 1 }], ['ABCDEFg1'], ['ABCDEFG1']),
    w([{ uppercase: 1 }], ['abcdefgH'], ['abcdefgh']),
    w([{ digits: 2 }], ['abcdef12'], ['abcdefg1']),
    w([{ symbols: 1 }], ['abcdefg!', 'abcdefg€'], ['abcdefg1', 'abcdef g']),
    w([{ noSpaces: true }], ['abcdefgh'], ['abcd efgh']),
    w([{ noRepeating: true }], ['aabbccdd'], ['aaabcdef']),
    w([{ noRepeating: 1 }], ['abcdefgh'], ['aabcdefg']),
    w(
      [{ lowercase: 1, uppercase: 1, digits: 1, symbols: 1, minLength: 10 }],
      ['Abcdefgh1!'],
      ['abcdefgh1!', 'Abcdefghi!', 'Abcdefghi1', 'Ab1!']
    )
  ),
  spec(
    'getPasswordIssues',
    {
      results: [
        ['correct horse battery', []],
        ['abc', ['minLength']],
        ['', ['minLength']],
        [undefined, null],
        [42, null],
        ['a'.repeat(129), ['maxLength']]
      ]
    },
    {
      args: [
        {
          lowercase: 1,
          uppercase: 1,
          digits: 1,
          symbols: 1,
          noSpaces: true,
          noRepeating: true,
          minLength: 10
        }
      ],
      results: [
        ['abc', ['minLength', 'uppercase', 'digits', 'symbols']],
        ['ABC  aaa 123', ['symbols', 'noSpaces', 'noRepeating']],
        ['Abcdefgh1!', []]
      ]
    }
  ),
  spec(
    'isOtp',
    g(['123456', '000000'], ['12345', '1234567', '12345a', '', ' 123456']),
    w([{ length: 4 }], ['1234'], ['123456']),
    w([{ length: 8, alphanumeric: true }], ['ab12CD34'], ['ab12CD3!'])
  ),
  spec(
    'isPin',
    g(['1234', '0000', '4821'], ['123', '12345', 'abcd', '12 34']),
    w([{ length: 6 }], ['123456'], ['1234']),
    w([{ length: { min: 4, max: 6 } }], ['1234', '12345', '123456'], ['123', '1234567']),
    w(
      [{ rejectTrivial: true }],
      ['4821', '1357', '2580'],
      ['0000', '1111', '1234', '4321', '7890', '1212', '3737', '9876']
    ),
    w([{ length: 6, rejectTrivial: true }], ['482193'], ['123456', '123123', '000000'])
  ),
  spec(
    'isTotpSecret',
    g(
      ['JBSWY3DPEHPK3PXP', 'JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP', 'JBSW Y3DP EHPK 3PXP'],
      ['JBSWY3DP', 'jbswy3dpehpk3pxp', 'JBSWY3DPEHPK3PX1', 'JBSWY3DPEHPK3PXP!', ' JBSWY3DPEHPK3PXP']
    ),
    w([{ strict: true }], ['JBSWY3DPEHPK3PXP'], ['JBSW Y3DP EHPK 3PXP'])
  ),
  spec(
    'isTotpUri',
    g(
      [
        'otpauth://totp/Example:ada@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Example',
        'otpauth://totp/ada?secret=JBSWY3DPEHPK3PXP&digits=8&period=60&algorithm=SHA256',
        'otpauth://hotp/ada?secret=JBSWY3DPEHPK3PXP&counter=5'
      ],
      [
        'otpauth://totp/ada',
        'otpauth://totp/ada?secret=short',
        'otpauth://hotp/ada?secret=JBSWY3DPEHPK3PXP',
        'otpauth://totp/ada?secret=JBSWY3DPEHPK3PXP&digits=5',
        'otpauth://totp/ada?secret=JBSWY3DPEHPK3PXP&algorithm=MD5',
        'https://example.com',
        'otpauth://totp/ada?secret=JBSWY3DPEHPK3PXP&period=0'
      ]
    )
  )
];
