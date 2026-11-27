import { g, spec, w } from './types.js';

const REPEAT = (c: string, n: number) => c.repeat(n);

export const network = [
  spec(
    'isDomain',
    g(
      [
        'example.com',
        'sub.example.co.uk',
        'a-b.example.org',
        'xn--bcher-kva.example',
        'EXAMPLE.COM',
        '1example.com',
        'example.museum'
      ],
      [
        'example',
        '-example.com',
        'example-.com',
        'exa_mple.com',
        'example..com',
        '.example.com',
        'example.com.',
        'example.c',
        'example.123',
        `${REPEAT('a', 64)}.com`,
        `${REPEAT('a.', 130)}com`
      ]
    ),
    w([{ requireTld: false }], ['localhost', 'example', 'example.com'], ['123', '-a']),
    w([{ unicode: true }], ['münchen.de', '例え.jp', 'example.com'], ['mün chen.de']),
    w([], [], ['münchen.de'], 'Unicode is off by default.'),
    w([{ allowTrailingDot: true }], ['example.com.', 'example.com'], ['example.com..']),
    w([{ allowWildcard: true }], ['*.example.com'], ['*.*.example.com', 'a.*.example.com']),
    w([], [], ['*.example.com'], 'Wildcards are off by default.')
  ),
  spec(
    'isHostname',
    g(
      ['localhost', 'example.com', 'my-host', 'host1', 'a.b'],
      ['-host', 'host_name', 'host name', '123', '1.2.3.4', 'host-']
    )
  ),
  spec('isTld', g(['com', 'io', 'museum', 'xn--p1ai'], ['c', '123', '.com', 'co.uk', 'com1'])),
  spec(
    'isHostPort',
    g(
      ['example.com:8080', 'localhost:3000', '127.0.0.1:80', '[::1]:3000', '[2001:db8::1]:443'],
      [
        'example.com',
        'example.com:',
        'example.com:99999',
        '::1:80',
        '[::1]',
        '[::1',
        '[::1]x',
        'exa mple.com:80',
        ':80'
      ]
    ),
    w([{ requirePort: false }], ['example.com', '[::1]', 'localhost:3000'], ['[::1', 'a b'])
  ),
  spec(
    'isAsn',
    g(['AS64512', 'AS13335', 'as1', 'AS0'], ['64512', 'AS4294967296', 'AS', 'AS01', 'ASX']),
    w([{ requirePrefix: false }], ['64512', 'AS64512'], ['4294967296', 'x'])
  ),
  spec(
    'isPort',
    g(
      [0, 80, '80', '65535', 8080, '0'],
      [65536, '65536', -1, '-1', 1.5, '08', '80a', '', Number.NaN, Number.POSITIVE_INFINITY, '1e3']
    ),
    w([{ allowZero: false }], [1, '1'], [0, '0'])
  ),
  spec(
    'isIpv4',
    g(
      ['192.168.0.1', '0.0.0.0', '255.255.255.255', '8.8.8.8'],
      [
        '256.1.1.1',
        '1.2.3',
        '1.2.3.4.5',
        '01.2.3.4',
        '1.2.3.04',
        'a.b.c.d',
        '1.2.3.4 ',
        ' 1.2.3.4',
        '1..2.3',
        '1.2.3.-4'
      ]
    ),
    w([{ allowLeadingZeros: true }], ['010.001.002.003'], ['010.001.002.256'])
  ),
  spec(
    'isIpv6',
    g(
      [
        '::1',
        '::',
        '2001:db8::1',
        '2001:0db8:0000:0000:0000:ff00:0042:8329',
        '::ffff:192.168.0.1',
        'fe80::1',
        '1:2:3:4:5:6:7:8',
        '1::',
        '::2:3:4:5:6:7:8',
        'ABCD::EF01'
      ],
      [
        '1:2:3:4:5:6:7',
        '1:2:3:4:5:6:7:8:9',
        ':::',
        '1::2::3',
        '12345::1',
        'g::1',
        '::ffff:999.1.1.1',
        ':1',
        '1:',
        '2001:db8:::1',
        'fe80::1%eth0',
        '%eth0'
      ]
    ),
    w([{ allowZone: true }], ['fe80::1%eth0', 'fe80::1'], ['fe80::1%', '%eth0', 'fe80::1%a b'])
  ),
  spec(
    'isIp',
    g(['1.2.3.4', '::1'], ['1.2.3', 'localhost']),
    w([{ version: 4 }], ['1.2.3.4'], ['::1']),
    w([{ version: 6 }], ['::1'], ['1.2.3.4'])
  ),
  spec(
    'isIpv4Cidr',
    g(
      ['10.0.0.0/8', '192.168.1.0/24', '0.0.0.0/0', '1.2.3.4/32'],
      [
        '10.0.0.0/33',
        '10.0.0.0',
        '10.0.0.0/',
        '10.0.0.0/08',
        '10.0.0/8',
        '/8',
        '10.0.0.0/-1',
        '::1/64'
      ]
    )
  ),
  spec(
    'isIpv6Cidr',
    g(
      ['2001:db8::/32', '::/0', 'fe80::/10', '::1/128'],
      ['::1/129', '::1', '2001:db8::/', '10.0.0.0/8']
    )
  ),
  spec('isCidr', g(['10.0.0.0/8', '2001:db8::/32'], ['10.0.0.0', '::1', 'a/b'])),
  spec(
    'isIpRange',
    g(
      ['192.168.0.1-192.168.0.50', '10.0.0.1 - 10.0.0.9', '1.1.1.1-1.1.1.1'],
      ['192.168.0.50-192.168.0.1', '192.168.0.1', '1.1.1.1-2.2.2', '-']
    )
  ),
  spec(
    'isPublicIp',
    g(
      [
        '8.8.8.8',
        '1.1.1.1',
        '93.184.216.34',
        '172.32.0.1',
        '2606:4700:4700::1111',
        '2001:4860:4860::8888'
      ],
      [
        '10.0.0.1',
        '127.0.0.1',
        '192.168.1.1',
        '172.16.0.1',
        '172.31.255.255',
        '169.254.169.254',
        '100.64.0.1',
        '0.0.0.0',
        '224.0.0.1',
        '255.255.255.255',
        '::1',
        '::',
        'fe80::1',
        'fc00::1',
        'fd12:3456::1',
        '::ffff:10.0.0.1',
        '2001:db8::1',
        '2002:0a00:0001::',
        'not an ip',
        '127.1'
      ]
    )
  ),
  spec(
    'isPrivateIp',
    g(
      ['10.1.2.3', '172.16.0.1', '172.31.255.255', '192.168.0.1', 'fd00::1', 'fc00::1'],
      ['8.8.8.8', '172.32.0.1', '172.15.255.255', '127.0.0.1', '11.0.0.1', '2001:db8::1', 'x']
    )
  ),
  spec(
    'isLoopbackIp',
    g(
      ['127.0.0.1', '127.255.255.254', '::1', '::ffff:127.0.0.1'],
      ['128.0.0.1', '10.0.0.1', '::2', 'localhost']
    )
  ),
  spec(
    'isLinkLocalIp',
    g(
      ['169.254.169.254', '169.254.0.1', 'fe80::1', 'febf::1'],
      ['169.253.0.1', 'fec0::1', '10.0.0.1', 'x']
    )
  ),
  spec(
    'isMacAddress',
    g(
      ['00:1A:2B:3C:4D:5E', '00-1a-2b-3c-4d-5e', '001a.2b3c.4d5e', '001A2B3C4D5E'],
      [
        '00:1A:2B:3C:4D',
        '00:1A:2B:3C:4D:5E:6F',
        '00:1A-2B:3C:4D:5E',
        'GG:1A:2B:3C:4D:5E',
        '001A2B3C4D5',
        '00:1A:2B:3C:4D:5'
      ]
    ),
    w([{ format: 'colon' }], ['00:1A:2B:3C:4D:5E'], ['00-1A-2B-3C-4D-5E', '001A2B3C4D5E']),
    w([{ format: 'dash' }], ['00-1A-2B-3C-4D-5E'], ['00:1A:2B:3C:4D:5E']),
    w([{ format: 'dot' }], ['001a.2b3c.4d5e'], ['00:1A:2B:3C:4D:5E']),
    w([{ format: 'bare' }], ['001A2B3C4D5E'], ['00:1A:2B:3C:4D:5E'])
  ),
  spec(
    'isUrl',
    g(
      [
        'https://example.com',
        'http://example.com/path?x=1#frag',
        'https://sub.example.co.uk:8080/a/b',
        'ftp://files.example.com/pub',
        'https://example.com/a%20b',
        'https://93.184.216.34/',
        'https://[2001:db8::1]:8443/x',
        'https://xn--bcher-kva.example/',
        'HTTPS://EXAMPLE.COM'
      ],
      [
        'example.com',
        '//example.com',
        'http://',
        'http:// example.com',
        'http://example',
        'http://localhost',
        'https://exa mple.com',
        'http://-example.com',
        'http://example.com:99999',
        'http://example.com:/',
        'javascript:alert(1)',
        'mailto:a@b.co',
        'https://user:pass@example.com',
        'https://example.com/<script>',
        'https://example.com/%zz',
        'https://256.256.256.256',
        'file:///etc/passwd',
        'http://[::1',
        'localhost:3000'
      ]
    ),
    w([{ protocols: ['ftp'] }], ['ftp://files.example.com'], ['https://example.com']),
    w([{ protocols: ['mailto'] }], ['mailto:ada@example.com'], ['https://example.com', 'mailto:']),
    w(
      [{ allowLocalhost: true }],
      ['http://localhost:3000/x', 'http://localhost'],
      ['http://intranet']
    ),
    w([{ requireTld: false }], ['http://intranet/', 'http://localhost'], ['http://-bad']),
    w(
      [{ requireProtocol: false }],
      ['example.com', 'example.com/path', 'https://example.com'],
      ['//example.com', 'exa mple.com']
    ),
    w([{ requireProtocol: false, allowLocalhost: true }], ['localhost:3000'], ['localhost:abc']),
    w([{ allowIp: false }], ['https://example.com'], ['http://1.2.3.4', 'http://[::1]']),
    w(
      [{ allowCredentials: true }],
      ['https://user:pass@example.com/', 'https://user@example.com'],
      ['https://us er@example.com']
    ),
    w([{ maxLength: 20 }], ['https://example.com'], ['https://example.com/long/path'])
  ),
  spec(
    'isHttpUrl',
    g(
      ['https://example.com', 'http://example.com/a'],
      ['ftp://example.com', 'ws://example.com', 'example.com']
    )
  ),
  spec(
    'isWebSocketUrl',
    g(
      ['wss://example.com/socket', 'ws://example.com:8080'],
      ['https://example.com', 'ws://localhost:8080']
    ),
    w([{ allowLocalhost: true }], ['ws://localhost:8080'], ['http://localhost'])
  ),
  spec(
    'isRelativeUrl',
    g(
      ['/a/b', 'a/b?c=1#d', '../x', '?q=1', '#frag', './a:b'],
      ['//example.com', 'https://example.com', 'a:b', 'mailto:x', ' /a', '/a b', '/a%zz']
    )
  ),
  spec(
    'isUrlPath',
    g(
      ['/', '/a/b', '/a%20b', '/a/b/', '/a//b', "/a-b_c.d~e!$&'()*+,;=:@"],
      ['a/b', '/a b', '/a%2', '/a?b', '/a#b']
    )
  ),
  spec('isUrlSafe', g(['abc-DEF_123.~'], ['a b', 'a/b', 'a%20', 'é'])),
  spec(
    'isPercentEncoded',
    g(['a%20b', '100%25', 'abc', '%E2%9C%93'], ['100%', '%zz', 'a b', '%2'])
  ),
  spec(
    'isUriScheme',
    g(['https', 'mailto', 'git+ssh', 'a.b-c'], ['1http', 'ht tp', 'http:', 'a'.repeat(33)])
  ),
  spec(
    'isDatabaseUrl',
    g(
      [
        'postgres://user:pass@localhost:5432/mydb',
        'postgresql://localhost/db',
        'mysql://root@127.0.0.1:3306/app',
        'mongodb://u:p@host1:27017,host2:27017/db?replicaSet=rs0',
        'mongodb+srv://u:p@cluster0.example.net/db',
        'redis://localhost:6379',
        'rediss://:secret@cache.example.com:6380/0',
        'amqp://guest:guest@localhost:5672/'
      ],
      [
        'http://localhost',
        'postgres://',
        'postgres:/localhost',
        'postgres://user@/db',
        'postgres://local host/db',
        'mongodb+srv://host:27017/db',
        'postgres://host:99999/db',
        'localhost:5432/db'
      ]
    ),
    w([{ schemes: ['sqlserver'] }], ['sqlserver://host:1433'], ['postgres://localhost'])
  ),
  spec(
    'isDeepLink',
    g(
      ['myapp://item/42', 'myapp://open?id=1', 'com.example.app://callback', 'myapp:item/42'],
      [
        'https://example.com',
        'javascript:alert(1)',
        'data:text/html,x',
        'myapp://has space',
        'vbscript:x',
        'myapp:',
        ' myapp://x',
        'file:///x'
      ]
    ),
    w([{ schemes: ['myapp'] }], ['myapp://x'], ['other://x']),
    w([{ schemes: ['https'] }], ['https://example.com/app'], ['myapp://x'])
  ),
  spec(
    'isMailtoUri',
    g(
      [
        'mailto:ada@example.com',
        'mailto:a@example.com,b@example.com',
        'mailto:ada@example.com?subject=Hi%20there&body=Hello',
        'mailto:?subject=x'
      ],
      [
        'mailto:',
        'mailto:not-an-email',
        'ada@example.com',
        'mailto:ada@example.com?subject',
        'mailto:ada@example.com extra',
        'mailto:ada@example.com?'
      ]
    )
  ),
  spec(
    'isTelUri',
    g(
      [
        'tel:+14155552671',
        'tel:+1-415-555-2671',
        'tel:7042;phone-context=example.com',
        'tel:+1415;ext=123'
      ],
      ['tel:', 'tel:14155552671', 'tel:+abc', '+1415', 'tel:+1 415']
    )
  ),
  spec(
    'isSmsUri',
    g(
      [
        'sms:+15551234567',
        'sms:+15551234567?body=hello',
        'sms:+15551234567,+15557654321',
        'sms:5551234;body=hi'
      ],
      ['sms:', 'sms:abc', 'tel:+1555']
    )
  ),
  spec(
    'isGeoUri',
    g(
      ['geo:48.2010,16.3695', 'geo:48.198634,16.371648,3.4;crs=wgs84;u=40', 'geo:0,0'],
      ['geo:91,0', 'geo:0,181', 'geo:48.2010', 'geo:a,b', '48.2,16.3']
    )
  ),
  spec(
    'isDataUri',
    g(
      [
        'data:text/plain;base64,SGVsbG8=',
        'data:,Hello%20World',
        'data:image/png;base64,iVBORw0KGgo=',
        'data:text/html;charset=utf-8,%3Ch1%3Ehi%3C%2Fh1%3E'
      ],
      [
        'data:text/plain;base64,@@@',
        'data:text/plain',
        'data:image/png;base64',
        'text/plain,hi',
        'data:text/plain,100%',
        'data:text/plain,a b'
      ]
    ),
    w(
      [{ mediaTypes: ['image/png'] }],
      ['data:image/png;base64,iVBORw0KGgo='],
      ['data:text/plain,hi']
    )
  ),
  spec(
    'isMimeType',
    g(
      [
        'application/json',
        'text/html',
        'image/svg+xml',
        'application/vnd.api+json',
        'application/x-www-form-urlencoded'
      ],
      [
        'json',
        'application/',
        '/json',
        'application/json; charset=utf-8',
        'text/*',
        '*/*',
        'application/js on'
      ]
    ),
    w(
      [{ allowParameters: true }],
      [
        'text/html; charset=utf-8',
        'multipart/form-data; boundary="abc 123"',
        'application/json;charset=UTF-8',
        'text/plain'
      ],
      ['text/html; charset', 'text/html;']
    ),
    w([{ allowWildcard: true }], ['image/*', '*/*', 'text/plain'], ['*/json'])
  ),
  spec(
    'isBase64',
    g(
      ['SGVsbG8gV29ybGQ=', 'SGVsbG8=', 'TWFu', 'TWE=', 'TQ==', 'YQ=='],
      ['SGVsbG8', 'SGVsbG8==', 'SGVs bG8=', 'SGVsbG8=x', 'S', '====', 'SGVsbG8-']
    ),
    w([{ padding: 'optional' }], ['SGVsbG8', 'SGVsbG8='], ['S']),
    w([{ padding: 'none' }], ['SGVsbG8', 'TWFu'], ['SGVsbG8=']),
    w([{ urlSafe: true, padding: 'none' }], ['a-_b'], ['a+/b']),
    w([], ['a+/b'], ['a-_b'], 'Standard alphabet by default.')
  ),
  spec(
    'isBase64Url',
    g(['SGVsbG8', 'a-_b', 'abc'], ['SGVsbG8=', 'a+/b', 'S']),
    w([{ padding: 'optional' }], ['SGVsbG8=', 'SGVsbG8'], ['S='])
  ),
  spec(
    'isBase32',
    g(
      ['JBSWY3DPEBLW64TMMQ======', 'JBSWY3DPEBLW64TMMQ', 'MFRGG===', 'MFRGG', 'ME======'],
      ['jbswy3dp', 'JBSWY3D1', 'MFRG=', 'JBSWY3DP=======', 'A']
    ),
    w([{ padding: 'required' }], ['MFRGG==='], ['MFRGG']),
    w([{ padding: 'none' }], ['MFRGG'], ['MFRGG===']),
    w([{ variant: 'hex' }], ['CPNMUOJ1', 'CPNMUOG='], ['CPNMUOJ1W']),
    w([{ variant: 'crockford' }], ['91JPRV3F', '91jprv3f'], ['ILOU'])
  ),
  spec('isBase58', g(['3yQ', '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2'], ['0OIl', 'abc!'])),
  spec(
    'isJwt',
    g(
      [
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.' + 'A'.repeat(43),
        'eyJhbGciOiJSU0EtT0FFUCIsImVuYyI6IkEyNTZHQ00ifQ.OKOawDo13gRp2ojaHV7LFpZcgV7T6DVZKTyKOMTYUmKoTCVJRgckCL9kiMT03JGeipsEdY3mx_etLbbWSrFr05kLzcSr4qKAq7YN7e9jwQRb23nfa6c9d-StnImGyFDbSv04uVuxIp5Zms1gNxKKK2Da14B8S4rzVRltdYwam_lDp5XnZAYpQdb76FdIKLaVmqgfwX7XWRxv2322i-vDxRfqNzo_tETKzpVLzfiwQyeyPGLBIO56YJ7eObdv0je81860ppamavo35UgoRdbYaBcoh9QcfylQr66oc6vFWXRcZ_ZT2LawVCWTIy3brGPi6UklfCpIMfIjf7iGdXKHzg.48V1_ALb6US04U3b.5eym8TW_c8SuK0ltJ3rpYIzOeDQz7TALvtu6UG9oMo4vpzs9tX_EFShS8iB7j6jiSdiwkIr3ajwQzaBtQD_A.XFBoMYUZodetZdvTiFvSkQ'
      ],
      [
        'a.b.c',
        'eyJhbGciOiJIUzI1NiJ9.eyJhIjoxfQ',
        'eyJhbGciOiJIUzI1NiJ9.eyJhIjoxfQ.sig=nat',
        '..',
        'eyJhbGciOiJub25lIn0.eyJzdWIiOiIxIn0.',
        'eyJ.eyJ.',
        'eyJ.eyJ.sig.extra'
      ]
    ),
    w(
      [{ allowEmptySignature: true }],
      ['eyJhbGciOiJub25lIn0.eyJzdWIiOiIxIn0.'],
      ['eyJhbGciOiJub25lIn0.zzz.']
    ),
    w([{ type: 'jws' }], ['eyJhbGciOiJIUzI1NiJ9.eyJhIjoxfQ.c2ln'], ['a.b.c.d.e']),
    w([{ type: 'jwe' }], [], ['eyJhbGciOiJIUzI1NiJ9.eyJhIjoxfQ.c2ln'])
  ),
  spec('isEmoji', g(['😀', '👍🏽', '👨‍👩‍👧‍👦', '🇳🇬', '❤️', '1️⃣', '🏳️‍🌈'], ['a', '😀😀', '1', '😀 ', '😀a']))
];
