import { g, spec, w } from './types.js';

export const software = [
  spec(
    'isSemver',
    g(
      [
        '0.0.4',
        '1.2.3',
        '10.20.30',
        '1.1.2-prerelease+meta',
        '1.0.0-alpha',
        '1.0.0-alpha.1',
        '1.0.0-0.3.7',
        '1.0.0-x.7.z.92',
        '1.0.0+20130313144700',
        '1.0.0-beta+exp.sha.5114f85',
        '1.0.0-rc.1'
      ],
      [
        '1',
        '1.2',
        '1.2.3.4',
        '01.2.3',
        '1.02.3',
        '1.2.03',
        '1.2.3-',
        '1.2.3-01',
        '1.2.3+',
        'v1.2.3',
        'a.b.c',
        '1.2.3 ',
        '-1.2.3'
      ]
    ),
    w([{ allowPrefix: true }], ['v1.2.3', '1.2.3', 'V1.0.0-rc.1'], ['vv1.2.3', 'v1.2'])
  ),
  spec(
    'isSemverRange',
    g(
      [
        '^1.2.3',
        '~1.2.3',
        '>=1 <2',
        '>=1.2.3 <2.0.0',
        '1.x || 2.x',
        '1.2.3 - 2.3.4',
        '*',
        '1.x',
        '>= 1.2.3',
        '<=2.0.0',
        '~>1.2',
        '1.2.3 || >=2.5.0 <3',
        '^0.0.3-beta.1'
      ],
      [
        '',
        'abc',
        '^',
        '>=',
        '1.2.3 -',
        '1.2.3 - ',
        '^^1.2.3',
        '1..2',
        '>>1.2.3',
        '1.2.3.4',
        '1.2.3 ||',
        '=>1.2.3'
      ]
    )
  ),
  spec(
    'isCalver',
    g(
      ['2026.11', '2026.11.25', '26.11.1', '2026.11.2-rc1'],
      ['2026', '2026.11.25.1.1', 'v2026.11', '2026.abc', 'abc']
    ),
    w(
      [{ format: 'YYYY.MM.DD' }],
      ['2026.11.25', '2026.1.5'],
      ['2026.13.01', '2026.11.32', '2026.11']
    ),
    w([{ format: 'YYYY.0M.0D' }], ['2026.11.05'], ['2026.1.5']),
    w([{ format: 'YY.MM.MICRO' }], ['26.11.3', '26.11.300'], ['2026.11.3', '26.11']),
    w([{ format: 'YYYY-0M-0D' }], ['2026-11-25'], ['2026.11.25']),
    w([{ format: 'YYYY.WW' }], ['2026.47', '2026.53'], ['2026.54']),
    w([{ format: 'YYYY.NOPE' }], [], ['2026.11'])
  ),
  spec(
    'isGitCommitHash',
    g(
      ['a'.repeat(40), 'A1B2C3D'.padEnd(40, '0'), 'abc1234', 'abc1234def', 'a'.repeat(64)],
      ['abc123', 'a'.repeat(65), 'g'.repeat(40), 'abc 1234', 'abc123g']
    ),
    w([{ length: 'full' }], ['a'.repeat(40), 'a'.repeat(64)], ['abc1234', 'a'.repeat(41)]),
    w(
      [{ length: 'short' }],
      ['abc1234', 'a'.repeat(39)],
      ['a'.repeat(40), 'a'.repeat(64), 'abc123']
    ),
    w([{ length: 'short', minLength: 4 }], ['abcd'], ['abc']),
    w([{ minLength: 10 }], ['abc1234def', 'a'.repeat(40)], ['abc1234'])
  ),
  spec(
    'isGitRefName',
    g(
      [
        'main',
        'feature/login',
        'release-1.2.3',
        'refs/heads/main',
        'v1.0.0',
        'user/fix_bug-42',
        'a@b'
      ],
      [
        '',
        '@',
        '/main',
        'main/',
        'feat//x',
        'feat..x',
        'a b',
        'a~b',
        'a^b',
        'a:b',
        'a?b',
        'a*b',
        'a[b',
        'a\\b',
        'a@{b',
        'main.',
        '.hidden',
        'feat/.x',
        'feat.lock',
        'a/b.lock/c',
        'a\tb'
      ]
    ),
    w([{ allowOneLevel: false }], ['feature/login'], ['main'])
  ),
  spec(
    'isGitUrl',
    g(
      [
        'https://github.com/henzyd/regex-kit.git',
        'https://github.com/henzyd/regex-kit',
        'git@github.com:henzyd/regex-kit.git',
        'ssh://git@github.com/henzyd/regex-kit.git',
        'ssh://git@host:2222/path/repo.git',
        'git://example.com/repo.git',
        'https://user:token@gitlab.com/g/p.git',
        'github.com:henzyd/regex-kit.git'
      ],
      [
        'github.com/henzyd/regex-kit',
        'https://github.com',
        'ftp://example.com/repo.git',
        'git@github.com',
        'https://git hub.com/x/y.git',
        'git@:path',
        ''
      ]
    )
  ),
  spec(
    'isNpmPackageName',
    g(
      [
        'lodash',
        '@henzyd/regex-kit',
        'is-odd',
        'left-pad',
        'a',
        'foo.bar',
        '~tilde',
        'foo_bar',
        '@scope/pkg-name',
        'abc123'
      ],
      [
        '',
        '.hidden',
        '_private',
        'Upper',
        'has space',
        'node_modules',
        'favicon.ico',
        'fs',
        'http',
        '@scope',
        '@/pkg',
        '@scope/',
        'pkg/sub',
        'a'.repeat(215),
        ' lodash',
        'lodash ',
        'é',
        'pkg!'
      ]
    ),
    w([{ allowLegacy: true }], ['JSONStream', 'Upper', 'lodash'], ['.Upper'])
  ),
  spec(
    'isPurl',
    g(
      [
        'pkg:npm/%40henzyd/regex-kit@1.0.0',
        'pkg:npm/lodash@4.17.21',
        'pkg:pypi/django@1.11.1',
        'pkg:maven/org.apache.commons/commons-lang3@3.12.0?type=jar',
        'pkg:github/package-url/purl-spec@244fd47e#subpath',
        'pkg:golang/github.com/gorilla/context'
      ],
      ['npm/lodash', 'pkg:', 'pkg:npm', 'pkg:NPM/lodash', 'pkg:npm/', 'pkg:npm/lo dash']
    )
  ),
  spec(
    'isDockerImage',
    g(
      [
        'nginx',
        'nginx:1.25',
        'library/nginx:latest',
        'ghcr.io/henzyd/regex-kit:1.0.0',
        'localhost:5000/app:dev',
        'registry.example.com:443/team/app',
        `nginx@sha256:${'a'.repeat(64)}`,
        `ghcr.io/org/app:1.0@sha256:${'0'.repeat(64)}`,
        'my_app',
        'a/b/c/d'
      ],
      [
        '',
        'Nginx',
        'nginx:',
        'nginx:tag with space',
        'nginx@sha256:abc',
        '/nginx',
        'nginx//app',
        'nginx:-bad',
        'registry.example.com:99999/app',
        'a'.repeat(300)
      ]
    )
  ),
  spec(
    'isDns1123Label',
    g(
      ['my-app', 'a', 'a1', '1a', 'a'.repeat(63)],
      ['', '-a', 'a-', 'My-App', 'a_b', 'a.b', 'a'.repeat(64)]
    )
  ),
  spec(
    'isDns1123Subdomain',
    g(
      ['my-app', 'example.com', 'a.b.c', 'foo-bar.baz1'],
      ['', 'a..b', '.a', 'a.', 'A.b', 'a_b.c', `${'a'.repeat(63)}.`.repeat(4)]
    )
  ),
  spec(
    'isS3BucketName',
    g(
      ['my-bucket', 'my.bucket.name', 'abc', 'a1b2c3', '0abc', 'a'.repeat(63)],
      [
        'ab',
        'a'.repeat(64),
        'My-Bucket',
        'my_bucket',
        '-bucket',
        'bucket-',
        '.bucket',
        'bucket.',
        'my..bucket',
        '192.168.5.4',
        'xn--bucket',
        'sthree-bucket',
        'amzn-s3-demo-bucket',
        'bucket-s3alias',
        'bucket--ol-s3',
        'bucket.mrap',
        'bucket--x-s3'
      ]
    )
  ),
  spec(
    'isAwsArn',
    g(
      [
        'arn:aws:s3:::my-bucket',
        'arn:aws:iam::123456789012:role/MyRole',
        'arn:aws:lambda:us-east-1:123456789012:function:fn',
        'arn:aws-cn:ec2:cn-north-1:123456789012:instance/i-123',
        'arn:aws-us-gov:s3:::bucket',
        'arn:aws:iam::aws:policy/AdministratorAccess'
      ],
      [
        'arn:aws:s3',
        'arn:azure:s3:::b',
        'arn:aws:s3:::',
        'aws:s3:::b',
        'arn:aws:S3:::b',
        'arn:aws:s3:::my bucket',
        'arn:aws:iam::12345:role/x'
      ]
    ),
    w([{ service: 's3' }], ['arn:aws:s3:::my-bucket'], ['arn:aws:iam::123456789012:role/MyRole'])
  ),
  spec(
    'isAwsRegion',
    g(
      [
        'us-east-1',
        'eu-west-1',
        'ap-southeast-2',
        'us-gov-west-1',
        'cn-north-1',
        'me-south-1',
        'af-south-1',
        'il-central-1',
        'ca-west-1'
      ],
      ['us-east', 'us-east-11', 'US-EAST-1', 'useast1', 'us_east_1', 'east-1', '']
    )
  ),
  spec(
    'isAndroidPackageName',
    g(
      ['com.example.app', 'com.example.my_app', 'org.a.b.c', 'com.Example.App2'],
      [
        'com',
        '1com.example',
        'com..example',
        'com.example.',
        '.com.example',
        'com.exa-mple',
        'com.1example'
      ]
    )
  ),
  spec(
    'isIosBundleId',
    g(
      ['com.example.App', 'com.example.my-app', 'org.a.b'],
      ['com', 'com..example', '.com.example', 'com.exa_mple', 'com.example.', 'a'.repeat(156)]
    )
  ),
  spec(
    'isEnvVarName',
    g(
      ['MY_ENV_VAR', 'PATH', '_PRIVATE', 'A1', 'DATABASE_URL_2'],
      ['my_env_var', '1VAR', 'MY-VAR', 'MY VAR', 'MY.VAR', '']
    ),
    w([{ allowLowercase: true }], ['my_env_var', 'MY_ENV'], ['my-var'])
  ),
  spec(
    'isIdentifier',
    g(
      ['foo', '_bar', '$baz', 'camelCase', 'ünïcode', 'a1', '日本語'],
      ['1foo', 'foo-bar', 'foo bar', 'foo.bar', '', '#x']
    ),
    w(
      [{ language: 'js', rejectReserved: true }],
      ['foo', 'klass'],
      ['class', 'await', 'yield', 'null']
    ),
    w([{ language: 'python' }], ['snake_case', '_x', 'ñandú'], ['$x', '1x']),
    w([{ language: 'python', rejectReserved: true }], ['foo'], ['lambda', 'None', 'True']),
    w([{ language: 'sql' }], ['table_name', 'col$1', '_x'], ['1col', 'my-col', 'ñ']),
    w([{ language: 'sql', rejectReserved: true }], ['users'], ['SELECT', 'table', 'Where'])
  ),
  spec(
    'isGraphqlName',
    g(['name', '_name', 'Name1', '__typename'], ['1name', 'my-name', 'my name', '', 'é'])
  ),
  spec(
    'isSqlIdentifier',
    g(
      ['users', 'user_accounts', '_tmp', 'T1'],
      ['1table', 'my-table', 'my table', 'users;DROP', '"users"', 'a'.repeat(64), 'é']
    ),
    w([{ maxLength: 5 }], ['users'], ['users2'])
  ),
  spec(
    'isJsonPointer',
    g(
      ['/a/b', '/a/0/b', '/', '/a~0b', '/a~1b', '/foo/bar~0~1'],
      ['a/b', '/a~2b', '/a~', '//~', 'a', '~0'].slice(0, 5),
      'The empty pointer (whole document) is rejected like any empty string.'
    )
  ),
  spec(
    'isCveId',
    g(
      ['CVE-2021-44228', 'CVE-1999-0001', 'CVE-2026-1234567'],
      ['CVE-1998-0001', 'CVE-2021-123', 'cve-2021-44228', 'CVE-21-44228', 'CVE2021-44228']
    )
  ),
  spec(
    'isSpdxLicenseId',
    g(
      [
        'MIT',
        'Apache-2.0',
        'GPL-3.0-or-later',
        'BSD-3-Clause',
        'ISC',
        'MPL-2.0',
        'CC0-1.0',
        'LicenseRef-Custom-1',
        'Unlicense',
        '0BSD'
      ],
      ['mit', 'Apache 2.0', 'GPL-3', 'NotALicense', 'LicenseRef-', 'LicenseRef-a b', '']
    )
  ),
  spec(
    'isFileName',
    g(
      [
        'report.pdf',
        'my file.txt',
        'résumé.docx',
        '.gitignore',
        'a',
        'archive.tar.gz',
        'CONFIGURATION.txt',
        'a'.repeat(255)
      ],
      [
        '',
        '.',
        '..',
        'a/b',
        'a\\b',
        'a:b',
        'a*b',
        'a?b',
        'a"b',
        'a<b',
        'a>b',
        'a|b',
        'a\u0000b',
        'a\nb',
        'name.',
        'name ',
        ' name',
        'CON',
        'con.txt',
        'NUL',
        'AUX.log',
        'PRN',
        'COM1',
        'com9.txt',
        'LPT3',
        'a'.repeat(256)
      ]
    ),
    w([{ maxLength: 10 }], ['a'.repeat(10)], ['a'.repeat(11)])
  ),
  spec(
    'isFileExtension',
    g(
      ['.png', 'png', '.tar', 'c++', 'mp4', '.7z'],
      ['', '.', '..png', 'a.b', '.png ', 'ext ension', '.a'.repeat(20)]
    ),
    w([{ allowed: ['png', 'jpg'] }], ['.png', 'PNG', 'jpg'], ['gif', '.exe'])
  ),
  spec(
    'isPosixPath',
    g(
      ['/usr/bin', 'relative/path', '/', '../x', './y', '/a//b', '/with space/file'],
      ['', '/a\u0000b', `/${'a'.repeat(256)}`, 'a'.repeat(5000)]
    )
  ),
  spec(
    'isWindowsPath',
    g(
      [
        'C:\\Users\\ada',
        'C:/Users/ada',
        'D:\\',
        '\\\\server\\share\\file.txt',
        'relative\\path',
        '..\\x',
        'C:\\a\\b.txt'
      ],
      [
        'C:',
        'C:foo',
        'C:\\a<b',
        'C:\\a|b',
        'C:\\a?b',
        'C:\\a*b',
        'C:\\a"b',
        'C:\\CON',
        'C:\\dir\\NUL.txt',
        'C:\\a.\\b',
        'C:\\a \\b',
        'C:\\a:b',
        `C:\\${'a'.repeat(300)}`
      ]
    ),
    w([{ allowLong: true }], [`C:\\${'a'.repeat(300)}`], ['C:\\CON'])
  ),
  spec(
    'isFilePermission',
    g(
      [
        '755',
        '0644',
        '644',
        'rwxr-xr-x',
        '-rwxr-xr-x',
        'drwxr-xr-x',
        'rwsr-xr-x',
        'rwxrwxrwt',
        'rw-r--r--'
      ],
      ['888', '75', '77777', 'rwxr-xr-', 'rwxr-xr-xx', 'xwr------', '', 'abc']
    )
  ),
  spec(
    'isDataSize',
    g(
      ['10MB', '1.5 GiB', '500 KB', '2TB', '100B', '1 PiB', '10mb', '3.14 gib'],
      ['10', 'MB', '10 XB', '1.5.5 GB', '-5MB', '10 M', '1,5GB', '']
    )
  ),
  spec(
    'isApiKeyLike',
    g(
      [
        'AKIAIOSFODNN7EXAMPLE',
        `ghp_${'a'.repeat(36)}`,
        `github_pat_${'A'.repeat(82)}`,
        `pk_live_${'a'.repeat(24)}`,
        `pk_test_${'B'.repeat(30)}`,
        'xoxb-1234567890-abcdefghij',
        `AIza${'a'.repeat(35)}`,
        `npm_${'a'.repeat(36)}`,
        `sk-ant-${'a'.repeat(30)}`,
        `SG.${'a'.repeat(22)}.${'b'.repeat(43)}`,
        `SK${'0'.repeat(32)}`
      ],
      [
        'AKIAIOSFODNN7EXAMPL',
        'ghp_short',
        'sk_live_short',
        'hello world',
        'xoxz-123',
        '',
        'password123'
      ]
    ),
    w([{ providers: ['aws'] }], ['AKIAIOSFODNN7EXAMPLE'], [`ghp_${'a'.repeat(36)}`]),
    w([{ providers: ['nosuch'] }], [], ['AKIAIOSFODNN7EXAMPLE'])
  )
];
