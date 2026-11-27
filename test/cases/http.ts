import { g, spec, w } from './types.js';

const H = (n: number) => 'a'.repeat(n);

export const http = [
  spec(
    'isHttpMethod',
    g(
      ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD', 'PUT'],
      ['get', 'Get', 'PROPFIND', '', ' GET', 'GET ']
    ),
    w([{ methods: ['GET', 'POST'] }], ['GET', 'POST'], ['PUT']),
    w([{ anyToken: true }], ['PROPFIND', 'M-SEARCH', 'get'], ['BAD METHOD', 'A(B)'])
  ),
  spec(
    'isHttpHeaderName',
    g(
      ['Content-Type', 'X-Request-Id', 'accept', 'x_custom'],
      ['Content Type', 'Content-Type:', 'Héader', 'Bad(Name)', ':authority']
    ),
    w([{ allowPseudo: true }], [':authority', ':status', 'Accept'], [':foo', ':'])
  ),
  spec(
    'isHttpHeaderValue',
    g(
      ['application/json', 'text/html; charset=utf-8', 'a b', 'Bearer abc.def', 'a\tb'],
      ['a\r\nSet-Cookie: x=y', 'a\nb', 'a\u0000b', ' leading', 'trailing ', 'héllo'],
      'Rejects CR, LF and NUL: the header-injection check.'
    ),
    w([{ maxLength: 5 }], ['abcde'], ['abcdef'])
  ),
  spec(
    'isContentType',
    g(
      [
        'application/json',
        'text/html; charset=utf-8',
        'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxk',
        'application/json;charset=UTF-8',
        'Application/JSON'
      ],
      ['json', 'text/html;', 'text/*', 'application/json; charset', 'text/html; ; charset=x']
    ),
    w(
      [{ mediaTypes: ['application/json'] }],
      ['application/json; charset=utf-8', 'APPLICATION/JSON'],
      ['text/html']
    )
  ),
  spec(
    'isBearerToken',
    g(
      [
        'Bearer abc123',
        'bearer abc.def-ghi_jkl~+/=',
        'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhIjoxfQ.c2ln'
      ],
      ['Bearer', 'Bearer ', 'Bearer a b', 'Token abc', 'Bearer abc!', 'abc']
    )
  ),
  spec(
    'isAuthorizationHeader',
    g(
      [
        'Bearer abc123',
        'Basic dXNlcjpwYXNz',
        'Digest username="Mufasa", realm="x", nonce="y", uri="/dir", response="r"'
      ],
      ['Basic dXNlcjpwYXN', 'Basic not base64!', 'Negotiate abc', 'Bearer', '', 'Bearer a b']
    ),
    w([{ schemes: ['Negotiate'] }], ['Negotiate YIIB'], ['Bearer abc'])
  ),
  spec(
    'isOrigin',
    g(
      [
        'https://app.example.com',
        'http://localhost:3000',
        'https://127.0.0.1:8443',
        'http://[::1]:8080',
        'HTTPS://Example.com'
      ],
      [
        'https://example.com/',
        'https://example.com/path',
        'example.com',
        'https://',
        'https://user@example.com',
        'https://example.com?x=1',
        'null',
        'ftp://example.com'
      ]
    ),
    w([{ allowNull: true }], ['null'], ['nul']),
    w(
      [{ schemes: ['chrome-extension'] }],
      ['chrome-extension://abcdefghijklmnop'],
      ['https://example.com']
    )
  ),
  spec(
    'isHttpStatusCode',
    g([200, '404', 301, '599', 100], [99, 600, '20', '2000', 'abc', 200.5, 0]),
    w([{ class: '2xx' }], [200, 299], [404, 199]),
    w([{ class: ['4xx', '5xx'] }], [404, 503], [200, 301])
  ),
  spec(
    'isETag',
    g(
      ['"abc"', 'W/"abc"', '""', '"33a64df551425fcc55e4d42a148795d9f25f89d4"'],
      ['abc', 'W/abc', '"a"b"', '"a b"', 'W/"', "'abc'"]
    )
  ),
  spec(
    'isCookieName',
    g(['session', '__Host-id', 'sid_1', 'X-Token'], ['a b', 'a=b', 'a;b', 'a,b', 'a"b', 'na me']),
    w([{ prefix: '__Host-' }], ['__Host-id'], ['id', '__Secure-id']),
    w([{ prefix: '__Secure-' }], ['__Secure-x'], ['__Host-x'])
  ),
  spec(
    'isCookieValue',
    g(
      ['abc123', '"quoted"', 'a.b-c_d', 'eyJhbGc', '%20x'],
      ['a b', 'a;b', 'a,b', 'a"b', 'a\\b', '"unterminated', 'a\nb']
    )
  ),
  spec(
    'isHttpDate',
    g(
      [
        'Sun, 06 Nov 1994 08:49:37 GMT',
        'Tue, 15 Nov 1994 08:12:31 GMT',
        'Wed, 25 Nov 2026 12:00:00 GMT'
      ],
      [
        'Mon, 06 Nov 1994 08:49:37 GMT',
        'Sun, 31 Feb 1994 08:49:37 GMT',
        'Sun, 06 Nov 1994 25:49:37 GMT',
        'Sun, 06 Nov 1994 08:49:37 UTC',
        'Sun, 6 Nov 1994 08:49:37 GMT',
        'Sunday, 06-Nov-94 08:49:37 GMT',
        'Sun Nov  6 08:49:37 1994',
        'Sun, 06 Nov 1994 08:49:37'
      ]
    ),
    w(
      [{ allowObsolete: true }],
      [
        'Sunday, 06-Nov-94 08:49:37 GMT',
        'Sun Nov  6 08:49:37 1994',
        'Sun, 06 Nov 1994 08:49:37 GMT'
      ],
      ['Monday, 06-Nov-94 08:49:37 GMT', 'Mon Nov  6 08:49:37 1994']
    )
  ),
  spec(
    'isTraceparent',
    g(
      ['00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01'],
      [
        '00-00000000000000000000000000000000-b7ad6b7169203331-01',
        '00-0af7651916cd43dd8448eb211c80319c-0000000000000000-01',
        'ff-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01',
        '00-0AF7651916CD43DD8448EB211C80319C-b7ad6b7169203331-01',
        '00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331',
        '0af7651916cd43dd8448eb211c80319c'
      ]
    )
  ),
  spec(
    'isIdempotencyKey',
    g(
      ['f47ac10b-58cc-4372-a567-0e02b2c3d479', 'order-12345', 'abc!@#'],
      ['has space', 'é', H(256)]
    ),
    w([{ uuidOnly: true }], ['f47ac10b-58cc-4372-a567-0e02b2c3d479'], ['order-1']),
    w([{ maxLength: 5 }], ['abcde'], ['abcdef'])
  ),
  spec(
    'isSortParam',
    g(
      ['name', '-createdAt', '-createdAt,name', '+name', 'user.name,-id'],
      [',', 'name,', 'name,name', 'a b', '1name', '-', '--name', 'name;drop']
    ),
    w([{ fields: ['name', 'createdAt'] }], ['name', '-createdAt'], ['id', '-id']),
    w([{ maxFields: 2 }], ['a,b'], ['a,b,c'])
  ),
  spec(
    'isCursor',
    g(['eyJpZCI6MTIzfQ==', 'abc-DEF_123.~', 'a'], ['a b', 'a/b', 'a+b']),
    w([{ maxLength: 5 }], ['abcde'], ['abcdef'])
  ),
  spec(
    'isCharset',
    g(['utf-8', 'UTF-8', 'iso-8859-1', 'windows-1252', 'x-sjis'], ['utf 8', '-utf8', 'utf-8;', 'é'])
  ),
  spec(
    'isAcceptLanguage',
    g(
      [
        'en',
        'en-GB',
        'en-GB,en;q=0.9',
        'fr-CH, fr;q=0.9, en;q=0.8, de;q=0.7, *;q=0.5',
        '*',
        'en;q=1'
      ],
      ['en;q=1.5', 'en;q=', 'en_GB', 'e n', 'en,,fr', '123', 'en;q=0.1234']
    )
  ),
  spec(
    'isMultipartBoundary',
    g(
      ['----WebKitFormBoundary7MA4YWxkTrZu0gW', 'boundary', 'abc def', H(70)],
      ['abc ', H(71), 'a"b', 'a\nb']
    )
  ),
  spec(
    'isHmacSignatureHeader',
    g(
      [`sha256=${H(64)}`, `sha1=${H(40)}`, `sha512=${H(128)}`],
      [`sha256=${H(63)}`, 'sha256=', 'md5=abc', `SHA256=${H(64)}`, `sha256=${'g'.repeat(64)}`]
    )
  )
];
