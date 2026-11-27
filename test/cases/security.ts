import { g, spec, w } from './types.js';

const PEM_BODY = 'SGVsbG8gV29ybGQ=';
const pem = (label: string, body = PEM_BODY, end = label) =>
  `-----BEGIN ${label}-----\n${body}\n-----END ${end}-----\n`;

export const security = [
  spec(
    'hasPathTraversal',
    g(
      [
        '../etc/passwd',
        '..\\windows',
        'a/../b',
        'a/..',
        '..',
        '%2e%2e/etc',
        '%2E%2E%2Fetc',
        '..%2fetc',
        '%252e%252e/x',
        '..%c0%afetc',
        'a\\..\\b',
        '....//etc',
        '.../x',
        '/..',
        '%2e%2e%5cwindows'
      ],
      [
        'file..txt',
        'a/b/c',
        '...x',
        'a.b/c',
        '.hidden',
        'my..file/x',
        'abc',
        '/etc/passwd',
        'a/./b',
        '',
        42,
        undefined
      ],
      'true means a traversal segment WAS found.'
    )
  ),
  spec(
    'isSafeRelativePath',
    g(
      ['a/b/c.txt', 'file.txt', 'dir/sub/', 'a.b/c', './a', 'a%2e%2e/b'],
      [
        '/etc/passwd',
        '\\windows',
        'C:\\x',
        'C:/x',
        '../a',
        'a/../../b',
        'a\\b',
        'a\u0000b',
        'a/%2e%2e/b',
        ''
      ]
    ),
    w([{ allowBackslash: true }], ['a\\b'], ['a\\..\\b', '\\a'])
  ),
  spec(
    'isSafeRedirectPath',
    g(
      ['/dashboard', '/a/b?x=1#y', '/', '/search?q=a%20b'],
      [
        '//evil.com',
        '/\\evil.com',
        'https://evil.com',
        'evil.com',
        '/\tevil.com',
        '/a\nb',
        '/%2fevil.com',
        '/%5Cevil.com',
        '',
        'javascript:alert(1)',
        '/a b',
        '\\evil.com'
      ]
    )
  ),
  spec(
    'hasNullByte',
    g(
      ['a\u0000b', '%00', 'file.php%00.jpg', '%00abc', 'a%00', 'A%00B'],
      ['abc', '%0', '%20', '50%', '', null],
      'true means a NUL (raw or %00) WAS found.'
    )
  ),
  spec(
    'hasBidiControls',
    g(['abc\u202Edef', '\u2066x\u2069', '\u200Fx', '\u061C'], ['abc', '日本', 'x\u200By', ''])
  ),
  spec(
    'hasZeroWidthChars',
    g(['a\u200Bb', '\uFEFFabc', 'a\u200Db', 'a\u2060b'], ['abc', 'a b', 'a\u00A0b', '日本', ''])
  ),
  spec('isWellFormedUnicode', g(['abc', '😀', '日本'], ['\ud800', 'a\udc00', '\ud83d', ''])),
  spec(
    'isNormalized',
    g(['\u00e9', 'abc'], ['e\u0301', 'é'.normalize('NFD')], 'NFC by default.'),
    w(['NFD'], ['e\u0301', 'abc'], ['\u00e9']),
    w(['NFKC'], ['fi'], ['\ufb01']),
    w(['XYZ'], [], ['abc'])
  ),
  spec(
    'isCsvSafe',
    g(
      ['hello', 'a=b', '1+1', 'x-y', 'name@example.com'],
      ['=1+1', '+1', '-1', '@SUM(A1)', '\tcmd', '\rcmd', '=HYPERLINK("x")']
    ),
    w([{ allowNumeric: true }], ['-5', '+3.14', '-1e5', 'abc'], ['=1+1', '-5+3', '@x'])
  ),
  spec(
    'isPkceCodeVerifier',
    g(
      [
        'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk',
        'a'.repeat(128),
        'A'.repeat(43),
        'a._~-'.repeat(9)
      ],
      ['a'.repeat(42), 'a'.repeat(129), `${'a'.repeat(42)}+`, `${'a'.repeat(42)} `]
    )
  ),
  spec(
    'isPkceCodeChallenge',
    g(
      ['E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM'],
      [
        'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjX',
        'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM=',
        'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw+cM'
      ]
    ),
    w([{ method: 'plain' }], ['a'.repeat(50)], ['a'.repeat(42)])
  ),
  spec(
    'isOAuthScope',
    g(
      [
        'read',
        'read write',
        'openid profile email',
        'user:email repo',
        'https://api.example.com/auth/read'
      ],
      ['read  write', ' read', 'read ', 'read\twrite', 're"ad']
    ),
    w([{ scopes: ['read', 'write'] }], ['read write', 'read'], ['admin', 'read admin'])
  ),
  spec(
    'isPemBlock',
    g(
      [
        pem('PUBLIC KEY'),
        pem('CERTIFICATE'),
        pem('PUBLIC KEY').replace(/\n/g, '\r\n'),
        pem('RSA PRIVATE KEY', `${'A'.repeat(64)}\n${'A'.repeat(64)}\nAAAA`),
        pem('PUBLIC KEY').trimEnd()
      ],
      [
        pem('PUBLIC KEY', PEM_BODY, 'PRIVATE KEY'),
        pem('PUBLIC KEY', 'not base64!'),
        '-----BEGIN PUBLIC KEY-----\nSGVsbG8gV29ybGQ=\n',
        PEM_BODY,
        pem('PUBLIC KEY', '')
      ]
    ),
    w([{ label: 'PUBLIC KEY' }], [pem('PUBLIC KEY')], [pem('CERTIFICATE')]),
    w(
      [{ label: ['CERTIFICATE', 'PUBLIC KEY'] }],
      [pem('CERTIFICATE'), pem('PUBLIC KEY')],
      [pem('PRIVATE KEY')]
    )
  ),
  spec(
    'isSshPublicKey',
    g(
      [
        'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOMqqnkVzrm0SdG6UOoqKLsabgH5C9okWi0dh2l9GKJl user@host',
        'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOMqqnkVzrm0SdG6UOoqKLsabgH5C9okWi0dh2l9GKJl',
        'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC7 comment here'
      ],
      [
        'ssh-ed25519 notbase64!',
        'ssh-foo AAAA',
        'ssh-ed25519 BBBBC3NzaC1lZDI1NTE5AAAAIOMqqnkVzrm0SdG6UOoqKLsabgH5C9okWi0dh2l9GKJl',
        'ssh-ed25519',
        'AAAAC3NzaC1lZDI1NTE5AAAAIOMq'
      ]
    )
  )
];
