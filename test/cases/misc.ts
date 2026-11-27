import { g, spec, w } from './types.js';

const H = (n: number, c = 'a') => c.repeat(n);

export const health = [
  spec('isNpi', g(['1234567893', '1245319599'], ['1234567890', '3234567893', '123456789', 'abc'])),
  spec(
    'isIcd10',
    g(
      ['A00', 'A00.1', 'S72.001A', 'Z99.89', 'M54.5', 'U07.1'],
      ['a00', 'A0', 'A00.', 'A00.12345', '00A', 'A00.1.2', 'AA0']
    ),
    w([{ allowUndotted: true }], ['A001', 'S72001A', 'A00.1'], ['A00123456'])
  ),
  spec(
    'isNdc',
    g(
      ['0002-3227-30', '12345-678-90', '12345-6789-0', '00002322730', '0002322730'],
      ['12345-67-890', '1234-567-89', 'abc', '123456789']
    )
  ),
  spec(
    'isLoinc',
    g(['2345-7', '718-7', '2160-0', '5778-6'], ['2345-8', '2345', '1-9', '12345678-1'])
  ),
  spec(
    'isCasNumber',
    g(
      ['7732-18-5', '50-00-0', '64-17-5', '58-08-2'],
      ['7732-18-6', '7732185', '12-34-5', 'abc-de-f']
    )
  ),
  spec(
    'isInchiKey',
    g(
      ['BSYNRYMUTXBXSQ-UHFFFAOYSA-N'],
      ['BSYNRYMUTXBXSQ-UHFFFAOYSA', 'bsynrymutxbxsq-uhfffaoysa-n', 'BSYNRYMUTXBXSQ-UHFFFAOYSB-N']
    )
  ),
  spec(
    'isArxivId',
    g(
      [
        '2301.01234',
        '2301.12345v2',
        '1706.03762',
        'hep-th/9901001',
        'math.GT/0309136',
        'cond-mat/0001001v1'
      ],
      ['2313.01234', '2301.123', '230.01234', 'hep-th/990100', '2301.01234v']
    )
  ),
  spec('isPubmedId', g(['12345678', '1', '999999999'], ['0', '1234567890', 'abc', '012'])),
  spec(
    'isBloodType',
    g(['A+', 'O-', 'AB+', 'B-', 'AB-'], ['C+', 'A', 'AB', 'a+', 'O++', 'A positive'])
  )
];

export const commerce = [
  spec(
    'isSku',
    g(
      ['ABC-123', 'shirt_red_L', 'A1', 'SKU.001', 'a', '12345'],
      ['', '-abc', 'abc-', 'a--b', 'a b', 'a/b', 'é', H(65)]
    ),
    w([{ uppercase: true }], ['ABC-1'], ['abc-1']),
    w([{ separators: '-' }], ['a-b'], ['a_b']),
    w([{ separators: '' }], ['ab12'], ['a-b']),
    w([{ minLength: 3 }], ['abc'], ['ab']),
    w([{ maxLength: 3 }], ['abc'], ['abcd'])
  ),
  spec(
    'isCouponCode',
    g(
      ['SAVE20', 'save20', 'BLACK-FRIDAY-2026', 'A1B2'],
      ['-SAVE', 'SAVE-', 'SA--VE', 'SA VE', 'SAVE!']
    ),
    w([{ uppercase: true }], ['SAVE20'], ['save20']),
    w([{ length: 6 }], ['SAVE20', 'SA-VE20'], ['SAVE2']),
    w([{ length: { min: 4, max: 6 } }], ['SAVE'], ['SAVE2026'])
  ),
  spec(
    'isTrackingNumber',
    w(
      ['ups'],
      ['1Z999AA10123456784'],
      ['1Z999AA10123456785', '1Z999AA1012345678', '1z999aa10123456784']
    ),
    w(['fedex'], ['123456789012', '123456789012345', '1234567890123456789012'], ['12345']),
    w(['usps'], ['9400111899223197428490', 'EA123456789US'], ['1234', 'EA123456789GB']),
    w(['dhl'], ['1234567890', `JJD${H(18, '0')}`], ['12345']),
    w(['royalmail'], ['AB123456789GB'], ['AB123456789US']),
    w(['nosuchcarrier'], [], ['1Z999AA10123456784']),
    w([], [], ['1Z999AA10123456784'])
  ),
  spec(
    'isIccid',
    g(
      ['89442000000000000008', '8944200000000000009'],
      ['8944200000000000000', '79442000000000000008', '894420000000000000']
    )
  ),
  spec(
    'isImsi',
    g(
      ['310150123456789', '31015012345678'],
      ['3101501234567', '3101501234567890', '31015012345678a']
    )
  ),
  spec(
    'isApnsToken',
    g([H(64), H(64, 'F')], [H(63), H(64, 'g')]),
    w([{ length: 32 }], [H(32)], [H(64)])
  )
];

export const service = [
  spec(
    'isYoutubeVideoId',
    g(
      ['dQw4w9WgXcQ'],
      ['dQw4w9WgXc', 'dQw4w9WgXcQQ', 'dQw4w9WgXc!', 'https://youtu.be/dQw4w9WgXcQ']
    ),
    w(
      [{ allowUrl: true }],
      [
        'dQw4w9WgXcQ',
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        'https://youtu.be/dQw4w9WgXcQ',
        'https://youtube.com/shorts/dQw4w9WgXcQ',
        'https://www.youtube.com/watch?feature=share&v=dQw4w9WgXcQ',
        'https://m.youtube.com/embed/dQw4w9WgXcQ'
      ],
      [
        'https://vimeo.com/123',
        'https://www.youtube.com/watch?v=short',
        'https://youtube.com.evil.com/watch?v=dQw4w9WgXcQ'
      ]
    )
  ),
  spec(
    'isGithubUsername',
    g(
      ['octocat', 'a', 'user-name', 'a1', 'A-b-C', H(39)],
      ['-user', 'user-', 'us--er', 'user_name', H(40), 'user name']
    )
  ),
  spec(
    'isGithubRepo',
    g(
      ['octocat/Hello-World', 'henzyd/regex-kit', 'a/b', 'o/.github', 'o/a.b_c'],
      ['octocat', 'a/b/c', '/repo', 'owner/', '-o/repo', 'owner/..', 'owner/.', 'owner/a b']
    )
  ),
  spec(
    'isSlackId',
    g(
      ['U012AB3CDE', 'C0123456789', 'W012A3CDE', 'T012ABCDE', 'D01234567'],
      ['u012ab3cde', 'X012AB3CDE', 'U012', 'U012AB3CDEFGHIJ']
    )
  ),
  spec(
    'isDiscordId',
    g(['80351110224678912', '175928847299117063'], ['123', '0', 'abc']),
    w([{ epoch: true }], ['175928847299117063'], ['9223372036854775807'])
  ),
  spec(
    'isTwitterHandle',
    g(
      ['jack', '@jack', 'user_name', 'a', 'A1_'],
      ['@', 'user name', 'user-name', 'abcdefghijklmnop', '@@a']
    )
  ),
  spec(
    'isInstagramHandle',
    g(
      ['instagram', '@a.b_c', 'a', 'user.name', 'a_b'],
      ['.user', 'user.', 'us..er', H(31), 'user name', 'user-name', '@']
    )
  ),
  spec(
    'isLinkedinUrl',
    g(
      [
        'https://www.linkedin.com/in/ada-lovelace',
        'https://linkedin.com/in/ada/',
        'https://uk.linkedin.com/in/ada',
        'https://www.linkedin.com/company/anthropic',
        'http://www.linkedin.com/in/ada?trk=x'
      ],
      [
        'https://example.com/in/ada',
        'https://www.linkedin.com/feed',
        'https://www.linkedin.com/in/',
        'linkedin.com/in/ada',
        'https://linkedin.com.evil.com/in/ada'
      ]
    )
  ),
  spec(
    'isStripeId',
    g(
      [
        'cus_NffrFeUfNV2Hib',
        'pi_3MtwBwLkdIwHu7ix28a3tqPa',
        'sub_1MowQVLkdIwHu7ixeRlqHVzs',
        'price_1MoBy5LkdIwHu7ixZhnattbh',
        'prod_NWjs8kKbJWmuuc',
        'evt_1MqqbKLt4dXK03v5qaIbiZ5Q'
      ],
      ['cus_', 'cus_short', 'xyz_NffrFeUfNV2Hib', 'NffrFeUfNV2Hib', 'cus-NffrFeUfNV2Hib']
    ),
    w([{ prefix: 'cus' }], ['cus_NffrFeUfNV2Hib'], ['pi_3MtwBwLkdIwHu7ix28a3tqPa'])
  ),
  spec(
    'isStripeSignature',
    g(
      [`t=1492774577,v1=${H(64)}`, `t=1492774577,v1=${H(64)},v0=${H(64, 'b')}`],
      ['t=,v1=' + H(64), 't=1,v1=short', `v1=${H(64)}`, `t=1492774577,v1=${H(64, 'A')}`]
    )
  )
];

export const helpers = [
  spec(
    'isOneOf',
    w([['asc', 'desc']], ['asc', 'desc'], ['ASC', 'x', '', 1]),
    w([[1, 2, 3]], [1, 3], [4, '1']),
    w([], [], ['asc'], 'No list given.'),
    w(['asc'], [], ['asc'], 'The list must be an array.')
  )
];
