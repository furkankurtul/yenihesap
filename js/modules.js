// Modül tanımları — arayüz alanlarının yeni.xlsx hücre eşlemeleri
// in: giriş hücreleri (kullanıcı yazar), out: sonuç hücreleri (motor hesaplar)

export const CARK_VARIANTS = [
  {
    id: 'azdirma',
    title: 'Azdırma (Staehely)',
    inputs: [
      { cell: 'E10', label: 'mn', unit: 'modül' },
      { cell: 'E11', label: 'Bo', unit: '°' },
      { cell: 'E12', label: 'ℓno', unit: '°' },
      { cell: 'E13', label: 'G', unit: '' },
      { cell: 'C11', label: 'Z1', unit: 'diş' },
      { cell: 'G11', label: 'Z2', unit: 'diş' },
      { cell: 'C12', label: 'da1', unit: 'mm' },
      { cell: 'G12', label: 'da2', unit: 'mm' },
    ],
    isOrani: 'D5', tersOran: 'B5',
    gears: ['A7', 'B7', 'C7', 'D7'],
    carkOrani: 'C8', hata: 'C9', derece: 'D4', dms: 'G17',
    manualGears: ['E7', 'F7', 'G7', 'H7'],
    manualOran: 'G8', manualHata: 'G9', manualDerece: 'E4', manualDms: 'H17',
    wOlcusu: { n1: 'C14', w1: 'C13', n2: 'G14', w2: 'G13' },
    eksen: { do1: 'C15', do2: 'G15', av: 'E15', ao: 'E16' },
    geometry: [
      ['X1', 'F17'], ['X2', 'F18'], ['da1', 'F19'], ['da2', 'F20'],
      ['do1', 'F21'], ['do2', 'F22'], ['dg1', 'F23'], ["Z'1", 'F28'], ["Z'2", 'F27'],
      ['Bw', 'C17'], ['asb', 'C19'], ['aso', 'C20'], ['evao', 'C21'], ['evasb', 'C22'],
      ['sno', 'C23'], ['tso1', 'C25'], ['sso1', 'C26'], ['tso2', 'C27'], ['sao2', 'C28'],
      ['ax2', 'C29'], ['ax1', 'C30'], ['sg', 'F29'], ['tg', 'F30'],
      ['i (Z2/Z1)', 'F24'], ['Devir', 'F33'],
    ],
  },
  {
    id: 'kucuk',
    title: 'Küçük Makine',
    inputs: [
      { cell: 'E59', label: 'mn', unit: 'modül' },
      { cell: 'E60', label: 'Bo', unit: '°' },
      { cell: 'E61', label: 'ℓno', unit: '°' },
      { cell: 'C60', label: 'Z1', unit: 'diş' },
      { cell: 'G60', label: 'Z2', unit: 'diş' },
      { cell: 'C61', label: 'da1', unit: 'mm' },
      { cell: 'G61', label: 'da2', unit: 'mm' },
    ],
    isOrani: 'D54', tersOran: 'B54',
    gears: ['A56', 'B56', 'C56', 'D56'],
    carkOrani: 'C57', hata: 'C58', derece: 'D51', dms: 'C51',
    manualGears: ['E56', 'F56', 'G56', 'H56'],
    manualOran: 'G57', manualHata: 'G58', manualDerece: 'E51', manualDms: 'H66',
    wOlcusu: { n1: 'C63', w1: 'C62', n2: 'G63', w2: 'G62' },
    eksen: { do1: 'C64', do2: 'G64', av: 'E64', ao: 'E65' },
    geometry: [
      ['X1', 'F66'], ['X2', 'F67'], ['da1', 'F68'], ['da2', 'F69'],
      ['do1', 'F70'], ['do2', 'F71'], ['dg1', 'F72'], ["Z'1", 'F77'], ["Z'2", 'F76'],
      ['Bw', 'C66'], ['asb', 'C68'], ['aso', 'C69'], ['evao', 'C70'], ['evasb', 'C71'],
      ['sno', 'C72'], ['tso1', 'C74'], ['sso1', 'C75'], ['tso2', 'C76'], ['sao2', 'C77'],
      ['ax2', 'C78'], ['ax1', 'C79'], ['sg', 'F78'], ['tg', 'F79'],
    ],
  },
  {
    id: 'buyuk',
    title: 'Büyük Makine',
    inputs: [
      { cell: 'E96', label: 'mn', unit: 'modül' },
      { cell: 'E97', label: 'Bo', unit: '°' },
      { cell: 'E98', label: 'ℓno', unit: '°' },
      { cell: 'C96', label: 'Z1', unit: 'diş' },
      { cell: 'G96', label: 'Z2', unit: 'diş' },
      { cell: 'C97', label: 'da1', unit: 'mm' },
      { cell: 'G97', label: 'da2', unit: 'mm' },
    ],
    isOrani: 'B91', tersOran: 'D91',
    gears: ['A93', 'B93', 'C93', 'D93'],
    carkOrani: 'C94', hata: 'C95', derece: 'D90', dms: 'C90',
    manualGears: ['E93', 'F93', 'G93', 'H93'],
    manualOran: 'G94', manualHata: 'G95', manualDerece: 'E90', manualDms: 'G90',
    wOlcusu: { n1: 'C99', w1: 'C98', n2: 'G99', w2: 'G98' },
    eksen: { do1: 'C100', do2: 'G100', av: 'E100', ao: 'E101' },
    geometry: [
      ['X1', 'F105'], ['X2', 'F106'], ['da1', 'F107'], ['da2', 'F108'],
      ['do1', 'F109'], ['do2', 'F110'], ['dg1', 'F111'], ["Z'1", 'F116'], ["Z'2", 'F115'],
      ['Bw', 'C106'], ['asb', 'C108'], ['aso', 'C109'], ['evao', 'C110'], ['evasb', 'C111'],
      ['sno', 'C112'], ['tso1', 'C114'], ['sso1', 'C115'], ['tso2', 'C116'], ['so2', 'C117'],
      ['sg', 'C118'], ['tg', 'C119'], ['ax2', 'F117'], ['ax1', 'F118'],
    ],
  },
];

export const MODULES = {
  modul: {
    title: 'Modül Hesabı',
    inputs: [
      { cell: 'I6', label: '&no (kavrama açısı)', unit: '°' },
      { cell: 'J6', label: 'w1', unit: 'mm' },
      { cell: 'K6', label: 'w2', unit: 'mm' },
      { cell: 'K8', label: 'Bm', unit: '°' },
    ],
    outputs: [
      { cell: 'K7', label: 'mn (modül)', big: true, dec: 4 },
      { cell: 'I7', label: 'DP', big: true, dec: 4 },
      { cell: 'K9', label: 'Bo', dec: 0 },
    ],
  },
  derece: {
    title: 'Derece Hatası (Kalite Kontrol)',
    inputs: [
      { cell: 'J12', label: 'Hata oranı', unit: 'mm' },
      { cell: 'J13', label: 'Diş boyu', unit: 'mm' },
    ],
    outputs: [
      { cell: 'J14', label: 'Derece hatası (ondalık)', dec: 6 },
      { cell: 'J17', label: 'Derece hatası', big: true, dec: 0 },
    ],
  },
  malzeme: {
    title: 'Malzeme Ağırlık / Maliyet',
    inputs: [
      { cell: 'K25', label: 'Ø (çap)', unit: 'mm' },
      { cell: 'K26', label: 'Boy', unit: 'mm' },
      { cell: 'K28', label: 'Birim fiyat', unit: '₺/kg' },
    ],
    outputs: [
      { cell: 'K27', label: 'Ağırlık (kg)', big: true, dec: 3 },
      { cell: 'K24', label: 'Tutar (₺)', big: true, dec: 2 },
    ],
  },
  taksimat: {
    title: 'Taksimat Hesabı',
    inputs: [
      { cell: 'E37', label: 'Sabit sayı', unit: '' },
      { cell: 'E38', label: 'Z', unit: 'diş' },
      { cell: 'D41', label: 'a', unit: '' },
      { cell: 'E41', label: 'b', unit: '' },
      { cell: 'F41', label: 'c', unit: '' },
      { cell: 'G41', label: 'd', unit: '' },
    ],
    outputs: [
      { cell: 'E45', label: 'Diş oranı', dec: 8 },
      { cell: 'E46', label: 'Çark oranı', dec: 8 },
      { cell: 'E47', label: 'Hata', dec: 8, errIfNonZero: true },
    ],
  },
  konik: {
    title: 'Konik Hesabı',
    inputs: [
      { cell: 'H26', label: 'Büyük çap', unit: 'mm' },
      { cell: 'I26', label: 'Küçük çap', unit: 'mm' },
      { cell: 'I27', label: 'Boy', unit: 'mm' },
    ],
    outputs: [
      { cell: 'I29', label: 'Konik derece (ondalık)', dec: 6 },
      { cell: 'I32', label: 'Konik derece Bo', big: true, dec: 0 },
    ],
  },
  bicak: {
    title: 'Bıçak Derece Hesabı (Azdırma)',
    inputs: [
      { cell: 'U52', label: 'Bıçak çapı', unit: 'mm' },
      { cell: 'U53', label: 'Mn', unit: 'modül' },
      { cell: 'U54', label: 'G', unit: '' },
    ],
    outputs: [
      { cell: 'T55', label: 'BWo (ondalık)', dec: 6 },
      { cell: 'U51', label: 'BWo', big: true, dec: 0 },
    ],
  },
};

export const HOME_ITEMS = [
  { route: 'cark', title: 'Çark Hesabı', desc: 'Azdırma · Küçük Makine · Büyük Makine' },
  { route: 'modul', title: 'Modül Hesabı', desc: 'w1/w2 ölçümünden mn ve DP' },
  { route: 'derece', title: 'Derece Hatası', desc: 'Kalite kontrol sonrası' },
  { route: 'malzeme', title: 'Malzeme Ağırlık / Maliyet', desc: 'Ø ve boydan kg ve tutar' },
  { route: 'zst', title: 'ZST630 Çark Tablosu', desc: 'Z değerine göre A · B · C' },
  { route: 'taksimat', title: 'Taksimat Hesabı', desc: 'Sabit sayı ve çark seçimi' },
  { route: 'konik', title: 'Konik Hesabı', desc: 'Çaplardan konik derecesi' },
  { route: 'bicak', title: 'Bıçak Derece Hesabı', desc: 'Azdırma bıçağı BWo' },
  { route: 'kayitlar', title: 'Kayıtlı İşler', desc: 'Kaydedilen hesapları aç veya sil' },
];
