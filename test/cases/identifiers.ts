import { g, spec, w } from './types.js';

const SHA256_EMPTY = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
const SHA512_EMPTY =
  'cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e';

export const identifiers = [
  spec(
    'isUuid',
    g(
      [
        '123e4567-e89b-12d3-a456-426614174000',
        'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        '00000000-0000-0000-0000-000000000000',
        'ffffffff-ffff-ffff-ffff-ffffffffffff',
        'F47AC10B-58CC-4372-A567-0E02B2C3D479',
        '017f22e2-79b0-7cc3-98c4-dc0c0c07398f'
      ],
      [
        'f47ac10b-58cc-0372-a567-0e02b2c3d479',
        'f47ac10b-58cc-9372-a567-0e02b2c3d479',
        'f47ac10b-58cc-4372-c567-0e02b2c3d479',
        'f47ac10b58cc4372a5670e02b2c3d479',
        'f47ac10b-58cc-4372-a567-0e02b2c3d47',
        'g47ac10b-58cc-4372-a567-0e02b2c3d479',
        '{f47ac10b-58cc-4372-a567-0e02b2c3d479}',
        ' f47ac10b-58cc-4372-a567-0e02b2c3d479'
      ]
    ),
    w(
      [{ version: 4 }],
      ['f47ac10b-58cc-4372-a567-0e02b2c3d479'],
      ['123e4567-e89b-12d3-a456-426614174000', '00000000-0000-0000-0000-000000000000']
    ),
    w(
      [{ version: 1 }],
      ['123e4567-e89b-12d3-a456-426614174000'],
      ['f47ac10b-58cc-4372-a567-0e02b2c3d479']
    ),
    w(
      [{ version: 7 }],
      ['017f22e2-79b0-7cc3-98c4-dc0c0c07398f'],
      ['f47ac10b-58cc-4372-a567-0e02b2c3d479']
    ),
    w(
      [{ version: 'nil' }],
      ['00000000-0000-0000-0000-000000000000'],
      ['f47ac10b-58cc-4372-a567-0e02b2c3d479', 'ffffffff-ffff-ffff-ffff-ffffffffffff']
    ),
    w(
      [{ version: 'max' }],
      ['ffffffff-ffff-ffff-ffff-ffffffffffff', 'FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF'],
      ['00000000-0000-0000-0000-000000000000']
    )
  ),
  spec(
    'isGuid',
    g(
      [
        '123e4567-e89b-12d3-a456-426614174000',
        '00000000-0000-0000-0000-000000000000',
        '123e4567-e89b-02d3-0456-426614174000'
      ],
      ['{123e4567-e89b-12d3-a456-426614174000}', '123e4567e89b12d3a456426614174000', 'x']
    ),
    w(
      [{ allowBraces: true }],
      ['{123e4567-e89b-12d3-a456-426614174000}', '123e4567-e89b-12d3-a456-426614174000'],
      ['{123e4567-e89b-12d3-a456-426614174000', '(123e4567-e89b-12d3-a456-426614174000)']
    )
  ),
  spec(
    'isUlid',
    g(
      ['01ARZ3NDEKTSV4RRFFQ69G5FAV', '01arz3ndektsv4rrffq69g5fav', '7ZZZZZZZZZZZZZZZZZZZZZZZZZ'],
      [
        '81ARZ3NDEKTSV4RRFFQ69G5FAV',
        '01ARZ3NDEKTSV4RRFFQ69G5FAU',
        '01ARZ3NDEKTSV4RRFFQ69G5FA',
        '01ARZ3NDEKTSV4RRFFQ69G5FAVV',
        '01ARZ3NDEKTSV4RRFFQ69G5FAI'
      ]
    )
  ),
  spec(
    'isCuid',
    g(
      ['cjld2cjxh0000qzrmn831i7rn'],
      [
        'Cjld2cjxh0000qzrmn831i7rn',
        'cjld2cjxh0000qzrmn831i7r',
        'xjld2cjxh0000qzrmn831i7rn',
        'cjld2cjxh0000qzrmn831i7rn1'
      ]
    )
  ),
  spec(
    'isCuid2',
    g(
      ['tz4a98xxat96iws9zmbrgj3a'],
      [
        '1z4a98xxat96iws9zmbrgj3a',
        'Tz4a98xxat96iws9zmbrgj3a',
        'tz4a98xxat96iws9zmbrgj3',
        'tz4a98-xat96iws9zmbrgj3a'
      ]
    ),
    w([{ length: 10 }], ['tz4a98xxat'], ['tz4a98xxa'])
  ),
  spec(
    'isNanoid',
    g(
      ['V1StGXR8_Z5jdHi6B-myT'],
      ['V1StGXR8_Z5jdHi6B-my', 'V1StGXR8_Z5jdHi6B-my!', 'V1StGXR8_Z5jdHi6B-myTT']
    ),
    w([{ length: 10 }], ['abcdefghij'], ['abcdefghi']),
    w([{ alphabet: '0123456789' }], ['123456789012345678901'], ['V1StGXR8_Z5jdHi6B-myT'])
  ),
  spec(
    'isKsuid',
    g(
      ['0ujsswThIGTUYm2K8FjOOfXtY1K'],
      ['0ujsswThIGTUYm2K8FjOOfXtY1', '0ujsswThIGTUYm2K8FjOOfXtY1-']
    )
  ),
  spec(
    'isObjectId',
    g(
      ['507f1f77bcf86cd799439011', '507F1F77BCF86CD799439011'],
      ['507f1f77bcf86cd79943901', '507f1f77bcf86cd7994390111', 'g07f1f77bcf86cd799439011']
    )
  ),
  spec(
    'isSnowflakeId',
    g(
      ['1541815603606036480', '175928847299117063', '1', '9223372036854775808'],
      ['0', '01', '-1', '1.5', '18446744073709551616', 'abc', '1'.repeat(21)]
    ),
    w([{ signed: true }], ['9223372036854775807'], ['9223372036854775808']),
    w([{ epoch: 1420070400000 }], ['175928847299117063', '1'], ['9223372036854775807'])
  ),
  spec(
    'isShortId',
    g(['abc123', 'V1StGXR8_Z5jdHi6B-myT'], ['abc12', 'a'.repeat(22), 'abc 123', 'abc!23']),
    w([{ minLength: 3 }], ['abc'], ['ab'])
  ),
  spec(
    'isHash',
    w(
      ['sha256'],
      [SHA256_EMPTY, SHA256_EMPTY.toUpperCase()],
      [SHA256_EMPTY.slice(1), `g${SHA256_EMPTY.slice(1)}`, SHA512_EMPTY]
    ),
    w(['sha512'], [SHA512_EMPTY], [SHA256_EMPTY]),
    w(['md5'], [], ['d41d8cd98f00b204e9800998ecf8427e'], 'Legacy algorithms need an opt-in.'),
    w(
      ['md5', { legacy: true }],
      ['d41d8cd98f00b204e9800998ecf8427e'],
      ['d41d8cd98f00b204e9800998ecf8427']
    ),
    w(['sha1', { legacy: true }], ['da39a3ee5e6b4b0d3255bfef95601890afd80709'], ['da39a3ee']),
    w(['crc32', { legacy: true }], ['cbf43926'], ['cbf4392']),
    w(['sha3-256'], [SHA256_EMPTY], []),
    w(['blake2b'], [SHA512_EMPTY], []),
    w(['sha999'], [], [SHA256_EMPTY], 'Unknown algorithm.'),
    w([], [], [SHA256_EMPTY], 'No algorithm.')
  ),
  spec(
    'isOciDigest',
    g(
      [`sha256:${'a'.repeat(64)}`, `sha512:${'0'.repeat(128)}`],
      [
        `sha256:${'A'.repeat(64)}`,
        `sha1:${'a'.repeat(40)}`,
        'sha256:abc',
        `sha256${'a'.repeat(64)}`
      ]
    )
  ),
  spec(
    'isSriHash',
    g(
      [
        'sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=',
        'sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC',
        'sha512-z4PhNX7vuL3xVChQ1m2AB9Yg5AULVxXcg/SpIdNs6c5H0NE8XYXysP+DGNKHfuwvY7kxvUdBeoGlODJ6+SfaPg==',
        'sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU= sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC'
      ],
      [
        'md5-abc',
        'sha256-short',
        'sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU',
        'sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU= bad'
      ]
    )
  ),
  spec(
    'isBcryptHash',
    g(
      [
        '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
        '$2a$12$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
        '$2y$04$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
      ],
      [
        '$2b$32$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
        '$2c$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
        '$2b$10$short',
        'N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
      ]
    )
  ),
  spec(
    'isArgon2Hash',
    g(
      [
        '$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHQ$RdescudvJCsgt3ub+b+dWRWJTmaaJObG',
        '$argon2i$m=4096,t=3,p=1$c2FsdA$aGFzaA'
      ],
      [
        '$argon2x$v=19$m=65536,t=3,p=4$c29tZXNhbHQ$aGFzaA',
        'argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHQ$aGFzaA',
        '$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHQ'
      ]
    )
  ),
  spec(
    'isHex',
    g(
      ['deadbeef', 'DEADBEEF', '0123456789abcdef', 'DeadBeef'],
      ['0xdeadbeef', 'deadbeeg', 'dead beef', '0x']
    ),
    w([{ prefix: true }], ['0xdeadbeef', '0XDEADBEEF'], ['deadbeef', '0x']),
    w([{ prefix: 'optional' }], ['0xdeadbeef', 'deadbeef'], ['0xzz']),
    w([{ length: 8 }], ['deadbeef'], ['dead', 'deadbeef00']),
    w([{ caseSensitive: true }], ['deadbeef', 'DEADBEEF', '1234'], ['DeadBeef'])
  ),
  spec(
    'isBinary',
    g(['0101', '1'], ['012', '0b01', 'abc']),
    w([{ prefix: true }], ['0b01', '0B11'], ['01']),
    w([{ prefix: 'optional' }], ['0b01', '01'], ['0b2'])
  ),
  spec(
    'isOctal',
    g(['0755', '777'], ['789', '0o755', 'abc']),
    w([{ prefix: 'optional' }], ['0o755', '755'], ['0o789'])
  ),
  spec(
    'isOid',
    g(
      ['1.2.840.113549', '2.5.4.3', '0.9.2342.19200300', '2.999.1'],
      ['1', '3.1', '1.40', '1.2.03', '1..2', '1.2.', 'a.b', '1.2.-3']
    )
  )
];
