/**
 * Mobile number rules per country: calling code, trunk prefix, and a pattern for the
 * national significant number. These are format checks, not numbering-plan databases.
 * For authoritative validation use libphonenumber.
 */
export interface MobileRule {
  cc: string;
  trunk?: string;
  national: string;
}

export const MOBILE: Readonly<Record<string, MobileRule>> = {
  NG: { cc: '234', trunk: '0', national: '(?:70[1-9]|80[1-9]|81[0-9]|90[1-9]|91[1-8])\\d{7}' },
  US: { cc: '1', trunk: '1', national: '[2-9]\\d{2}[2-9]\\d{6}' },
  CA: { cc: '1', trunk: '1', national: '[2-9]\\d{2}[2-9]\\d{6}' },
  GB: { cc: '44', trunk: '0', national: '7(?:[1-57-9]\\d{8}|624\\d{6})' },
  IE: { cc: '353', trunk: '0', national: '8[35-9]\\d{7}' },
  IN: { cc: '91', trunk: '0', national: '[6-9]\\d{9}' },
  GH: { cc: '233', trunk: '0', national: '[25]\\d{8}' },
  KE: { cc: '254', trunk: '0', national: '(?:7\\d{8}|1[01]\\d{7})' },
  ZA: { cc: '27', trunk: '0', national: '[678]\\d{8}' },
  TZ: { cc: '255', trunk: '0', national: '[67]\\d{8}' },
  UG: { cc: '256', trunk: '0', national: '7\\d{8}' },
  RW: { cc: '250', trunk: '0', national: '7[2389]\\d{7}' },
  ET: { cc: '251', trunk: '0', national: '9\\d{8}' },
  SN: { cc: '221', national: '7[0-8]\\d{7}' },
  CM: { cc: '237', national: '6\\d{8}' },
  ZM: { cc: '260', trunk: '0', national: '9[567]\\d{7}' },
  ZW: { cc: '263', trunk: '0', national: '7[1-9]\\d{7}' },
  EG: { cc: '20', trunk: '0', national: '1[0125]\\d{8}' },
  DE: { cc: '49', trunk: '0', national: '1[5-7]\\d{8,9}' },
  FR: { cc: '33', trunk: '0', national: '[67]\\d{8}' },
  ES: { cc: '34', national: '[67]\\d{8}' },
  IT: { cc: '39', national: '3\\d{8,9}' },
  NL: { cc: '31', trunk: '0', national: '6\\d{8}' },
  BE: { cc: '32', trunk: '0', national: '4\\d{8}' },
  PT: { cc: '351', national: '9[1236]\\d{7}' },
  PL: { cc: '48', national: '[45-8]\\d{8}' },
  SE: { cc: '46', trunk: '0', national: '7[02369]\\d{7}' },
  NO: { cc: '47', national: '[49]\\d{7}' },
  DK: { cc: '45', national: '[2-9]\\d{7}' },
  CH: { cc: '41', trunk: '0', national: '7[5-9]\\d{7}' },
  AT: { cc: '43', trunk: '0', national: '6\\d{8,12}' },
  UA: { cc: '380', trunk: '0', national: '(?:39|50|6[3678]|9[1-9])\\d{7}' },
  RU: { cc: '7', trunk: '8', national: '9\\d{9}' },
  TR: { cc: '90', trunk: '0', national: '5\\d{9}' },
  SA: { cc: '966', trunk: '0', national: '5\\d{8}' },
  AE: { cc: '971', trunk: '0', national: '5[024568]\\d{7}' },
  PK: { cc: '92', trunk: '0', national: '3\\d{9}' },
  BD: { cc: '880', trunk: '0', national: '1[3-9]\\d{8}' },
  CN: { cc: '86', national: '1[3-9]\\d{9}' },
  JP: { cc: '81', trunk: '0', national: '[7-9]0\\d{8}' },
  KR: { cc: '82', trunk: '0', national: '1[0-9]\\d{7,8}' },
  SG: { cc: '65', national: '[89]\\d{7}' },
  MY: { cc: '60', trunk: '0', national: '1\\d{8,9}' },
  ID: { cc: '62', trunk: '0', national: '8\\d{8,11}' },
  PH: { cc: '63', trunk: '0', national: '9\\d{9}' },
  TH: { cc: '66', trunk: '0', national: '[689]\\d{8}' },
  VN: { cc: '84', trunk: '0', national: '[35789]\\d{8}' },
  AU: { cc: '61', trunk: '0', national: '4\\d{8}' },
  NZ: { cc: '64', trunk: '0', national: '2\\d{7,9}' },
  BR: { cc: '55', trunk: '0', national: '[1-9][1-9]9\\d{8}' },
  MX: { cc: '52', national: '[1-9]\\d{9}' },
  AR: { cc: '54', trunk: '0', national: '9?[1-9]\\d{9}' }
};
