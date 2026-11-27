import { g, spec, w } from './types.js';

const longLocal = 'a'.repeat(64);
const tooLong = `${longLocal}@${'b'.repeat(63)}.${'b'.repeat(63)}.${'b'.repeat(63)}.com`;

export const contact = [
  spec(
    'isEmail',
    g(
      [
        'ada@example.com',
        'first.last+tag@sub.example.co.uk',
        "o'brien@example.ie",
        'a@b.co',
        'user_name@example-domain.com',
        'x@xn--bcher-kva.example',
        `${longLocal}@example.com`
      ],
      [
        'ada@',
        '@example.com',
        'ada@example',
        'ada@@example.com',
        'ada example@example.com',
        '.ada@example.com',
        'ada.@example.com',
        'ada..lee@example.com',
        'ada@-example.com',
        'ada@example..com',
        ' ada@example.com',
        'ada@example.com ',
        'ada@example.c',
        'ada@example.123',
        'ada@exa_mple.com',
        'ada@[1.2.3.4]',
        `${'a'.repeat(65)}@example.com`,
        tooLong,
        'plain text'
      ],
      'Practical syntax: dot-atom local part, a real domain, length limits.'
    ),
    w(
      [{ allowUnicode: true }],
      ['jürgen@example.com', 'ada@münchen.de', 'ada@example.com'],
      ['jürgen@exa mple.com'],
      'Unicode local part and domain.'
    ),
    w([], [], ['jürgen@example.com', 'ada@münchen.de'], 'Unicode is rejected by default.'),
    w(
      [{ requireTld: false }],
      ['ada@localhost', 'ada@intranet'],
      ['ada@'],
      'Single-label domains.'
    ),
    w(
      [{ allowDisplayName: true }],
      ['Ada Lovelace <ada@example.com>', '"Ada, L" <ada@example.com>', 'ada@example.com'],
      ['Ada Lovelace <ada@>', 'Ada <ada@example.com> trailing'],
      'Display names.'
    ),
    w([], [], ['Ada Lovelace <ada@example.com>'], 'Display names are rejected by default.'),
    w([{ maxLength: 10 }], ['a@b.co'], ['ada@example.com'], 'Custom maximum length.')
  ),
  spec(
    'isEmailDomain',
    g(
      ['example.com', 'sub.example.co.uk'],
      ['example', '-example.com', 'exa mple.com', '[192.168.0.1]']
    ),
    w(
      [{ allowIpLiteral: true }],
      ['[192.168.0.1]', '[IPv6:::1]'],
      ['[999.1.1.1]', '[::1]'],
      'Address literals.'
    )
  ),
  spec(
    'isPhoneE164',
    g(
      ['+14155552671', '+2348012345678', '+442071838750', '+12'],
      [
        '14155552671',
        '+0123456789',
        '+1',
        '+1 415 555 2671',
        '+',
        '+1415555267100000',
        '+1415abc2671'
      ]
    )
  ),
  spec(
    'isPhone',
    g(
      ['+1 (415) 555-2671', '0801 234 5678', '(415) 555-2671', '415.555.2671', '+2348012345678'],
      [
        'abc',
        '123',
        '+1234567890123456',
        '555-2671 ext 4',
        '++14155552671',
        '415--555-2671',
        '(415 555-2671'
      ]
    )
  ),
  spec(
    'isMobilePhone',
    w(
      ['NG'],
      ['+2348012345678', '08012345678', '0801 234 5678', '08134567890', '+234 803 123 4567'],
      ['+234701234567', '07912345678', '+2358012345678', '0801234567', 'abc']
    ),
    w(['ng'], ['08012345678'], [], 'Country code is case-insensitive.'),
    w(
      ['NG', { strict: true }],
      ['+2348012345678', '08012345678'],
      ['0801 234 5678'],
      'Strict: no separators.'
    ),
    w(
      ['US'],
      ['+12025550123', '(202) 555-0123', '1-202-555-0123', '202-555-0123'],
      ['202-155-0123', '+1 (555) 123']
    ),
    w(
      ['GB'],
      ['07911 123456', '+44 7911 123456', '+447911123456', '00447911123456'],
      ['07011 123456', '0791112345']
    ),
    w(['IN'], ['+919876543210', '09876543210', '9876543210'], ['5876543210']),
    w(['ZA'], ['+27821234567', '0821234567'], ['0121234567']),
    w(['DE'], ['+4915112345678', '015112345678'], ['+49301234567']),
    w(['FR'], ['+33612345678', '0612345678'], ['0112345678']),
    w(['AU'], ['+61412345678', '0412345678'], ['0212345678']),
    w(['BR'], ['+5511987654321', '11987654321'], ['1133334444']),
    w(['JP'], ['090-1234-5678', '+819012345678'], ['03-1234-5678']),
    w(['KE'], ['0712345678', '+254712345678', '0112345678'], ['0212345678']),
    w(['GH'], ['0241234567', '+233241234567'], ['0341234567']),
    w(['ZZ'], [], ['+2348012345678'], 'Unknown country.'),
    w([], [], ['+2348012345678'], 'No country given.')
  ),
  spec(
    'isDialCode',
    g(['+234', '+1', '+44', '+91', '+380', '+971'], ['+0', '+999', '234', '+2340', '+', '+abc']),
    w([{ requirePlus: false }], ['234', '+234', '1'], ['999'])
  ),
  spec(
    'isUssdCode',
    g(
      ['*123#', '*737*50*1234#', '#123#', '*#06#', '*901#'],
      ['123', '*123', '*#', '*abc#', '*12 3#', '#']
    )
  ),
  spec(
    'isUsername',
    g(
      ['ada', 'ada_lovelace', 'ada.l-1', 'a1b'],
      ['ab', 'a'.repeat(31), '_ada', 'ada_', 'ada__l', 'ada lovelace', 'ada!', 'ádá']
    ),
    w([{ minLength: 2 }], ['ab'], ['a']),
    w([{ maxLength: 5 }], ['abcde'], ['abcdef']),
    w([{ allow: '' }], ['adal'], ['ada_l']),
    w([{ unicode: true }], ['ádá', 'ada'], ['ád!']),
    w([{ allowConsecutiveSeparators: true }], ['a__b'], ['a__'])
  ),
  spec(
    'isPersonName',
    g(
      [
        'Ada Lovelace',
        "Patrick O'Brien",
        'Jean-Luc Picard',
        'José María',
        'Zoë',
        '李雷',
        'J. R. R. Tolkien',
        'St. John',
        'Ada',
        'D’Arcy'
      ],
      ['Ada1', '-Ada', 'Ada-', 'Ada@', 'Ada  Lovelace', '123', 'a'.repeat(101)]
    )
  ),
  spec(
    'isDisplayName',
    g(
      ['Ada 🚀', 'Ada Lovelace', '  Ada', '李雷'],
      ['   ', 'Ada\nLovelace', 'Ada\u0000', 'a'.repeat(65)]
    ),
    w([{ maxLength: 100 }], ['a'.repeat(65)], ['a'.repeat(101)])
  ),
  spec(
    'isSlug',
    g(
      ['my-post-title', 'a', 'post-1', '2024-recap'],
      ['My-Post', 'my--post', '-post', 'post-', 'my_post', 'my post', 'é']
    ),
    w([{ allowUppercase: true }], ['My-Post'], ['My_Post']),
    w([{ separator: '_' }], ['my_post'], ['my-post']),
    w([{ maxLength: 5 }], ['abcde'], ['abcdef'])
  ),
  spec(
    'isHandle',
    g(
      ['@ada', '@ada_l', '@ada.lovelace', '@a'],
      ['ada', '@', '@.ada', '@ada.', '@ada..l', `@${'a'.repeat(31)}`, '@ada!']
    ),
    w([{ requireAt: false }], ['ada', '@ada'], ['.ada'])
  ),
  spec(
    'isHashtag',
    g(
      ['#hello', '#hello_world', '#2026goals', '#日本語', '#héllo'],
      ['#', '#123', 'hello', '# hello', '#hello world', `#${'a'.repeat(101)}`]
    )
  ),
  spec(
    'isAddressLine',
    g(['12 Marina Road', 'Flat 4B, Block C'], [' 12 Marina', '12 Marina ', '12\nMarina']),
    w([{ maxLength: 5 }], ['12 Ma'], ['12 Mar'])
  )
];
