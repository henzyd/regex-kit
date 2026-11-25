import { g, spec, w } from './types.js';

export const geo = [
  spec(
    'isPostalCode',
    w(
      ['GB'],
      ['SW1A 1AA', 'EC1A 1BB', 'M1 1AE', 'B33 8TH', 'CR2 6XH', 'DN55 1PT', 'sw1a 1aa', 'GIR 0AA'],
      ['SW1A1A', '12345', 'Q1 1AA']
    ),
    w(['gb'], ['SW1A 1AA'], [], 'Country codes are case-insensitive.'),
    w(['US'], ['90210', '90210-1234'], ['9021', '90210-12', 'ABCDE']),
    w(['CA'], ['K1A 0B1', 'K1A0B1', 'M5V 2T6'], ['D1A 0B1', 'K1A 0B']),
    w(['DE'], ['10115', '01067'], ['1011', '00000', '01000']),
    w(['FR'], ['75001', '75 001'], ['7500', '00100']),
    w(['NL'], ['1011 AB', '1011AB'], ['0123 AB', '1011 SA', '1011 A']),
    w(['NG'], ['100001', '940001'], ['10001']),
    w(['IN'], ['110001', '560001'], ['011000', '11000']),
    w(['JP'], ['100-0001', '1000001'], ['100-001']),
    w(['BR'], ['01310-100', '01310100'], ['01310-10']),
    w(['AU'], ['2000'], ['200']),
    w(['ES'], ['28001', '08001', '52001'], ['53001', '00100']),
    w(['IT'], ['00100'], ['0010']),
    w(['PL'], ['00-950'], ['00950']),
    w(['PT'], ['1000-001'], ['1000001']),
    w(['SE'], ['114 55', '11455'], ['1145']),
    w(['IE'], ['D02 X285', 'D6W 4X23', 'A65 F4E2'], ['D02 B285', 'XYZ']),
    w(['GH'], ['GA-183-8164', 'AK-039-5028'], ['GA1838164']),
    w(['ZA'], ['0001', '2000'], ['20000']),
    w(['KE'], ['00100'], ['0100']),
    w(['any'], ['SW1A 1AA', '12345', 'A-123'], ['', '!!!', 'ABC', '1'.repeat(17)]),
    w(['ZZ'], [], ['12345']),
    w([], [], ['12345'])
  ),
  spec(
    'isLatitude',
    g(
      ['51.5074', '-33.8688', '0', '90', '-90', '90.0', '+45', 51.5074, 0, -90],
      ['90.1', '-90.0001', '91', 'abc', '1e2', '12.', '.5', 91, Number.NaN, '1,5']
    )
  ),
  spec(
    'isLongitude',
    g(
      ['-0.1278', '180', '-180', '179.99999', '+120', 3.14, 180],
      ['180.1', '181', '-181', 'abc', 181, Number.POSITIVE_INFINITY]
    )
  ),
  spec(
    'isLatLong',
    g(
      ['51.5074, -0.1278', '51.5074,-0.1278', '0,0', '90,180', '-90,-180'],
      [
        '91,0',
        '0,181',
        '51.5074',
        '51.5074 -0.1278',
        'a,b',
        '51.5074, -0.1278, 3',
        '40°26′46″N 79°58′56″W'
      ]
    ),
    w(
      [{ format: 'dms' }],
      ['40°26′46″N 79°58′56″W', '40°26\'46"N, 79°58\'56"W'],
      ['40°26′46″N', '40°60′46″N 79°58′56″W', '91°00′00″N 0°00′00″E', '51.5074, -0.1278']
    ),
    w([{ format: 'any' }], ['51.5074, -0.1278', '40°26′46″N 79°58′56″W'], ['nonsense'])
  ),
  spec('isGeohash', g(['u4pruydqqvj', 'ezs42', '9q8yy'], ['a', 'ezs4a', 'EZS42', 'u4pruydqqvj12'])),
  spec(
    'isPlusCode',
    g(
      ['8FVC9G8F+6W', '9G8F+6W', '8FVC0000+', '8F000000+', '8FVC9G8F+6WQ'],
      ['8FVC9G8F6W', '8FVC9G8F+6', '8FVC9G8F+6A', '8fvc9g8f+6w', '8FVC00+', '+6W']
    )
  ),
  spec(
    'isCountryCode',
    g(['NG', 'US', 'GB', 'FR', 'JP', 'AX'], ['ng', 'XX', 'USA', '840', 'N', 'XK', '']),
    w([{ format: 'alpha3' }], ['NGA', 'USA', 'GBR'], ['NG', 'XXX', 'nga']),
    w([{ format: 'numeric' }], ['566', '840', '004'], ['4', '999', 'USA']),
    w([{ format: 'any' }], ['NG', 'NGA', '566'], ['ZZZ', '1'])
  ),
  spec(
    'isSubdivisionCode',
    g(['US-CA', 'GB-ENG', 'NG-LA', 'FR-75', 'IN-MH'], ['XX-AA', 'US-', 'us-ca', 'US-CALI', 'USCA'])
  ),
  spec(
    'isLanguageCode',
    g(['en', 'fr', 'yo', 'ha', 'ig', 'eng', 'yor'], ['xx', 'EN', 'e', 'english', 'e1']),
    w([{ format: 'alpha2' }], ['en'], ['eng']),
    w([{ format: 'alpha3' }], ['eng'], ['en'])
  ),
  spec(
    'isLocale',
    g(
      [
        'en',
        'en-GB',
        'zh-Hant-TW',
        'sr-Latn-RS',
        'es-419',
        'de-CH-1996',
        'en-US-u-ca-gregory',
        'x-private',
        'en-x-custom',
        'fr-CA'
      ],
      ['en_GB', 'e', 'en-', '-en', 'en--GB', 'en-GB-', '1234', 'en-US-u', 'abcdefghi', 'en-a']
    )
  ),
  spec(
    'isScriptCode',
    g(
      ['Latn', 'Cyrl', 'Arab', 'Hans', 'Hant', 'Deva', 'Qaaa', 'Qabx'],
      ['latn', 'LATN', 'Lat', 'Latnn', 'Qaby', 'Abcd']
    )
  ),
  spec('isIataAirport', g(['LOS', 'LHR', 'JFK'], ['lh', 'LHRR', 'L1S'])),
  spec('isIcaoAirport', g(['DNMM', 'EGLL'], ['DNM', 'dnmm', 'DNMM1'])),
  spec(
    'isFlightNumber',
    g(['BA117', 'BA 117', 'AA1', 'U21234', '3K123', 'EK783A'], ['12345', 'BA', 'BA12345', 'ba117'])
  ),
  spec('isUnLocode', g(['NGLOS', 'NG LOS', 'GBLON', 'USNYC'], ['XXLOS', 'NGL', 'NG1OS']))
];
