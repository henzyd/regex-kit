import { g, spec, w } from './types.js';

const VISA = '4111111111111111';

export const financial = [
  spec(
    'isCreditCard',
    g(
      [
        VISA,
        '4012888888881881',
        '4222222222222',
        '4000000000000000006',
        '5555555555554444',
        '5105105105105100',
        '2223003122003222',
        '378282246310005',
        '371449635398431',
        '6011111111111117',
        '6011000990139424',
        '6500000000000002',
        '30569309025904',
        '38520000023237',
        '36000000000008',
        '3530111333300000',
        '3566002020360505',
        '6250941006528599',
        '6200000000000005',
        '6759649826438453',
        '5018000000000009',
        '2200000000000004',
        '4111 1111 1111 1111',
        '4111-1111-1111-1111'
      ],
      [
        `${VISA.slice(0, 15)}2`,
        '0000000000000000',
        '411111111111',
        '41111111111111111111',
        'abcd',
        '4111 1111 1111 111a',
        '',
        '4111  1111 1111 1111 ',
        '1234567812345670'
      ]
    ),
    w([{ strict: true }], [VISA], ['4111 1111 1111 1111', '4111-1111-1111-1111']),
    w([{ brands: ['visa'] }], [VISA], ['5555555555554444', '378282246310005']),
    w([{ brands: ['amex', 'mastercard'] }], ['378282246310005', '5555555555554444'], [VISA]),
    w([{ allowUnknownBrand: true }], ['0000000000000000', VISA], ['0000000000000001'])
  ),
  spec('getCardBrand', {
    results: [
      [VISA, 'visa'],
      ['5555 5555 5555 4444', 'mastercard'],
      ['2223003122003222', 'mastercard'],
      ['378282246310005', 'amex'],
      ['6011111111111117', 'discover'],
      ['30569309025904', 'diners'],
      ['3530111333300000', 'jcb'],
      ['6250941006528599', 'unionpay'],
      ['6759649826438453', 'maestro'],
      ['2200000000000004', 'mir'],
      ['5061000000000008', 'verve'],
      ['4111111111111112', 'visa'],
      ['1234', null],
      ['41', null],
      ['abc', null],
      ['', null],
      [undefined, null],
      [42, null]
    ],
    note: 'The brand comes from the prefix and length only. The Luhn digit is not checked.'
  }),
  spec(
    'isCvv',
    g(['123', '1234', '000'], ['12', '12345', '12a', '', ' 123']),
    w([{ brand: 'amex' }], ['1234'], ['123']),
    w([{ brand: 'visa' }], ['123'], ['1234'])
  ),
  spec('isLuhn', g(['79927398713', VISA, '00'], ['79927398710', '1', '', '4111 1111', 'abc'])),
  spec(
    'isIban',
    g(
      [
        'GB82WEST12345698765432',
        'GB82 WEST 1234 5698 7654 32',
        'DE89370400440532013000',
        'FR1420041010050500013M02606',
        'NL91ABNA0417164300',
        'ES9121000418450200051332',
        'NO9386011117947',
        'IT60X0542811101000000123456',
        'CH9300762011623852957',
        'BE68539007547034',
        'PL61109010140000071219812874',
        'SE4550000000058398257466',
        'SA0380000000608010167519',
        'AE070331234567890123456',
        'BR1800360305000010009795493C1',
        'PT50000201231234567890154',
        'TR330006100519786457841326',
        'IE29AIBK93115212345678',
        'LU280019400644750000',
        'AT611904300234573201',
        'DK5000400440116243',
        'FI2112345600000785',
        'GR1601101250000000012300695',
        'HU42117730161111101800000000',
        'CZ6508000000192000145399',
        'RO49AAAA1B31007593840000',
        'LT121000011101001000',
        'KW81CBKU0000000000001234560101',
        'QA58DOHB00001234567890ABCDEFG',
        'EG380019000500000000263180002',
        'UA213223130000026007233566001',
        'RU0304452522540817810538091310419',
        'IL620108000000099999999',
        'JO94CBJO0010000000000131000302'
      ],
      [
        'GB82WEST12345698765433',
        'GB82WEST1234569876543',
        'XX82WEST12345698765432',
        'gb82west12345698765432',
        'DE89370400440532013001',
        'GB82-WEST-1234-5698-7654-32',
        '',
        'GB82',
        '1234567890123456'
      ]
    ),
    w([{ strict: true }], ['GB82WEST12345698765432'], ['GB82 WEST 1234 5698 7654 32']),
    w(
      [{ allowLowercase: true }],
      ['gb82west12345698765432', 'GB82WEST12345698765432'],
      ['gb82west12345698765433']
    )
  ),
  spec(
    'isBic',
    g(
      ['DEUTDEFF', 'DEUTDEFF500', 'NWBKGB2L', 'BOFAUS3N', 'CITIUS33XXX', 'GTBINGLA'],
      ['ABCD1234', 'DEUTDEFF50', 'deutdeff', 'DEUTXXFF', 'DEUTDEF', 'DEUTDEFF5000']
    )
  ),
  spec(
    'isAbaRouting',
    g(
      ['011000015', '021000021', '111000025', '121000248'],
      ['011000016', '01100001', '0110000150', 'abcdefghi', '991000000']
    )
  ),
  spec(
    'isSortCode',
    g(['12-34-56', '123456', '12 34 56'], ['12-34-5', '1234-56', '12-3456', 'ab-cd-ef']),
    w([{ strict: true }], ['123456'], ['12-34-56'])
  ),
  spec(
    'isNuban',
    g(['0123456789', '0001135681'], ['012345678', '01234567890', '012345678a']),
    w(['058'], ['0001135681'], ['0001135682', '1234567895']),
    w(['044'], ['1234567895'], ['1234567896']),
    w(['58'], [], ['0001135681'], 'The bank code is three digits.')
  ),
  spec(
    'isUpiId',
    g(
      ['user@okaxis', 'john.doe-1@ybl', '9876543210@paytm'],
      ['user', 'user@', '@okaxis', 'user@ok', 'user @okaxis', 'u@okaxis']
    )
  ),
  spec(
    'isBankAccount',
    w(['US'], ['12345678', '000123456789'], ['123', 'abc']),
    w(['GB'], ['12345678'], ['1234567', '123456789']),
    w(['NG'], ['0123456789'], ['012345678']),
    w(['IN'], ['123456789', '123456789012345678'], ['12345678']),
    w(['ZZ'], [], ['12345678']),
    w([], [], ['12345678'])
  ),
  spec(
    'isCurrencyCode',
    g(
      ['USD', 'NGN', 'EUR', 'JPY', 'GBP', 'ZWG', 'KES', 'ZAR', 'XCG'],
      ['ANG', 'usd', 'US', 'USDD', 'XXX', 'BGN', 'HRK', 'ABC', '']
    ),
    w([{ allowSpecial: true }], ['XAU', 'XXX', 'XDR', 'USD'], ['ABC'])
  ),
  spec(
    'isBitcoinAddress',
    g(
      [
        '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy',
        'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
        'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4',
        'BC1QW508D6QEJXTDG4Y5R3ZARVARY0C5XW7KV8F3T4',
        'bc1p0xlxvlhemja6c4dqv22uapctqupfhlxm9h8z3k2e72q4k9hcz7vqzk5jj0',
        '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNb'
      ],
      [
        '0A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5md',
        'Bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4',
        'tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx',
        '1A1zP1eP5QGefi2DMPTfTL5SLmv7Divf0a',
        ''
      ]
    ),
    w(
      [{ checksum: true }],
      [
        '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy',
        'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
        'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4',
        'BC1QW508D6QEJXTDG4Y5R3ZARVARY0C5XW7KV8F3T4',
        'bc1p0xlxvlhemja6c4dqv22uapctqupfhlxm9h8z3k2e72q4k9hcz7vqzk5jj0'
      ],
      ['1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNb', 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdp'],
      'Base58Check and Bech32 / Bech32m checksums.'
    )
  ),
  spec(
    'isEvmAddress',
    g(
      [
        '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed',
        '0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaed',
        '0x5AAEB6053F3E94C9B9A09F33669435E7EF1BEAED',
        '0x5AAeb6053F3E94C9b9A09f33669435E7Ef1BeAed'
      ],
      [
        '0x123',
        '5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed',
        '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAeg',
        '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAedd',
        ''
      ]
    ),
    w(
      [{ checksum: true }],
      [
        '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed',
        '0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359',
        '0xdbF03B407c01E7cD3CBea99509d93f8DDDC8C6FB',
        '0xD1220A0cf47c7B9Be7A2E6BA89F429762e7b9aDb',
        '0x52908400098527886E0F7030069857D2E4169EE7',
        '0xde709f2102306220921060314715629080e2fb77',
        '0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaed'
      ],
      ['0x5AAeb6053F3E94C9b9A09f33669435E7Ef1BeAed', '0xfb6916095ca1df60bB79Ce92cE3Ea74c37c5d359'],
      'EIP-55: mixed case must carry the checksum; all-lower and all-upper pass.'
    ),
    w(
      [{ checksum: 'require' }],
      ['0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed', '0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359'],
      ['0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaed', '0x5AAeb6053F3E94C9b9A09f33669435E7Ef1BeAed']
    )
  ),
  spec(
    'isCryptoAddress',
    w(
      ['bitcoin'],
      ['1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'],
      ['0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed']
    ),
    w(
      ['ethereum'],
      ['0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed'],
      ['1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa']
    ),
    w(['litecoin'], ['LW5v6JXmj54omLidkuVKnRyjP2WPBg8Y4E'], ['XW5v6JXmj54omLidkuVKnRyjP2WPBg8Y4E']),
    w(['dogecoin'], ['DyNoVKf58ZTBqNAYT3j5qcdsyuMNmPfYet'], ['Xyn']),
    w(
      ['solana'],
      ['So11111111111111111111111111111111111111112'],
      ['So1111', '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed']
    ),
    w(
      ['tron'],
      ['TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'],
      ['TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6u', '1R7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t']
    ),
    w(
      ['xrp'],
      ['rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh'],
      ['xHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh', 'r0Hb9CJAWyB4rj91VRWn96DkukG4bwdtyTh']
    ),
    w(['cosmos'], ['cosmos1hsk6jryyqjfhp5dhc55tc9jtckygx0eph6dd02'], ['cosmos1hsk6']),
    w(['nosuchchain'], [], ['1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa']),
    w([], [], ['1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'])
  ),
  spec(
    'isTxHash',
    g([`0x${'a'.repeat(64)}`], [`0x${'a'.repeat(63)}`, 'a'.repeat(64), `0x${'g'.repeat(64)}`]),
    w(['evm'], [`0x${'0'.repeat(64)}`], ['a'.repeat(64)]),
    w(['bitcoin'], ['a'.repeat(64), 'F'.repeat(64)], [`0x${'a'.repeat(64)}`]),
    w(['tron'], ['a'.repeat(64)], ['a'.repeat(63)]),
    w(
      ['solana'],
      ['MASi45ub7Qe4ZE36UT5G6cU4ud8Fhhe4deS4F3cw9KTAb8dLcukC7edhDQ7cn5d4gEYkbUrMWeWQLGsCmrG6dLaY'],
      ['abc']
    ),
    w(['nosuchchain'], [], [`0x${'a'.repeat(64)}`])
  ),
  spec(
    'isVatNumber',
    g(
      [
        'BE0123456749',
        'DE136695976',
        'DK12345674',
        'IT01234567897',
        'SE556703748501',
        'PL5261025237',
        'FI20774740',
        'FR44732829320',
        'NL123456789B01',
        'ESX1234567Z',
        'ATU12345678',
        'GB123456789',
        'GB123456789012',
        'GBGD001',
        'EL123456789',
        'NO123456789MVA',
        'IE1234567T',
        'IE1234567FA',
        'BG123456789',
        'CY12345678X',
        'CZ12345678',
        'EE123456789',
        'HR12345678901',
        'HU12345678',
        'LT123456789',
        'LU12345678',
        'LV12345678901',
        'MT12345678',
        'PT123456789',
        'RO12',
        'SI12345678',
        'SK1234567890',
        'XI123456789',
        'DE 136 695 976',
        'DE136.695.976'
      ],
      [
        'BE0123456748',
        'DE136695977',
        'DK12345675',
        'IT01234567898',
        'SE556703748401',
        'PL5261025238',
        'FI20774741',
        'FR45732829320',
        'DE13669597',
        'XX123456789',
        '136695976',
        'FR1',
        'ATU1234567',
        ''
      ]
    ),
    w([{ strict: true }], ['DE136695976'], ['DE 136 695 976']),
    w([{ country: 'DE' }], ['DE136695976'], ['FR44732829320'])
  ),
  spec(
    'isIsin',
    g(
      ['US0378331005', 'GB0002634946', 'DE000BAY0017', 'AU0000XVGZA3'],
      ['US0378331006', 'US037833100', 'us0378331005', '1S0378331005']
    )
  ),
  spec(
    'isLei',
    g(
      ['5493001KJTIIGC8Y1R12', 'HWUPKR0MPOU8FGXBT394'],
      ['5493001KJTIIGC8Y1R13', '5493001KJTIIGC8Y1R1', '5493001KJTIIGC8Y1RAA']
    )
  ),
  spec(
    'isCusip',
    g(['037833100', '17275R102', '38259P508'], ['037833101', '03783310', '037833100X'])
  ),
  spec(
    'isTicker',
    g(
      ['AAPL', 'BRK.B', 'BF-B', 'T', 'GOOGL', 'A1', 'SPY'],
      ['aapl', '1AAPL', 'AAPL!', 'TOOLONGSYMBOL', 'AA PL', '.A']
    )
  )
];
