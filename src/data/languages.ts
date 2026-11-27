/** ISO 639-1 two-letter language codes, 2026-11. */
export const LANGUAGES_ALPHA2: ReadonlySet<string> = new Set(
  (
    'aa ab ae af ak am an ar as av ay az ba be bg bh bi bm bn bo br bs ca ce ch co cr cs cu cv cy da de dv dz ee ' +
    'el en eo es et eu fa ff fi fj fo fr fy ga gd gl gn gu gv ha he hi ho hr ht hu hy hz ia id ie ig ii ik io is ' +
    'it iu ja jv ka kg ki kj kk kl km kn ko kr ks ku kv kw ky la lb lg li ln lo lt lu lv mg mh mi mk ml mn mr ms ' +
    'mt my na nb nd ne ng nl nn no nr nv ny oc oj om or os pa pi pl ps pt qu rm rn ro ru rw sa sc sd se sg si sk ' +
    'sl sm sn so sq sr ss st su sv sw ta te tg th ti tk tl tn to tr ts tt tw ty ug uk ur uz ve vi vo wa wo xh yi ' +
    'yo za zh zu'
  ).split(' ')
);

/** ISO 15924 script codes (Qaaa-Qabx private use are accepted separately). */
export const SCRIPTS: ReadonlySet<string> = new Set(
  (
    'Adlm Afak Aghb Ahom Arab Aran Armi Armn Avst Bali Bamu Bass Batk Beng Bhks Blis Bopo Brah Brai Bugi Buhd ' +
    'Cakm Cans Cari Cham Cher Chrs Cirt Copt Cpmn Cprt Cyrl Cyrs Deva Diak Dogr Dsrt Dupl Egyd Egyh Egyp Elba ' +
    'Elym Ethi Geok Geor Glag Gong Gonm Goth Gran Grek Gujr Guru Hanb Hang Hani Hano Hans Hant Hatr Hebr Hira ' +
    'Hluw Hmng Hmnp Hrkt Hung Inds Ital Jamo Java Jpan Jurc Kali Kana Kawi Khar Khmr Khoj Kitl Kits Knda Kore ' +
    'Kpel Kthi Lana Laoo Latf Latg Latn Leke Lepc Limb Lina Linb Lisu Loma Lyci Lydi Mahj Maka Mand Mani Marc ' +
    'Maya Medf Mend Merc Mero Mlym Modi Mong Moon Mroo Mtei Mult Mymr Nagm Nand Narb Nbat Newa Nkdb Nkgb Nkoo ' +
    'Nshu Ogam Olck Orkh Orya Osge Osma Ougr Palm Pauc Pcun Pelm Perm Phag Phli Phlp Phlv Phnx Piqd Plrd Prti ' +
    'Psin Ranj Rjng Rohg Roro Runr Samr Sara Sarb Saur Sgnw Shaw Shrd Shui Sidd Sind Sinh Sogd Sogo Sora Soyo ' +
    'Sund Sylo Syrc Syre Syrj Syrn Tagb Takr Tale Talu Taml Tang Tavt Telu Teng Tfng Tglg Thaa Thai Tibt Tirh ' +
    'Tnsa Toto Ugar Vaii Visp Vith Wara Wcho Wole Xpeo Xsux Yezi Yiii Zanb Zinh Zmth Zsye Zsym Zxxx Zyyy Zzzz'
  ).split(' ')
);
