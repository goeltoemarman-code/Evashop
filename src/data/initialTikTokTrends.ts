import { TikTokTrendingProduct, TikTokSoundTrend, TikTokHashtagTrend } from '../types/tiktokTrends';

export const INITIAL_TIKTOK_PRODUCTS: TikTokTrendingProduct[] = [
  {
    id: 'tt_prod_1',
    rank: 1,
    name: 'Gamis Crinkle Airflow Loose A-Line Busui Friendly Mayung',
    category: 'Fashion & Hijab',
    priceRange: 'Rp109.000 - Rp119.000',
    originalPrice: 'Rp165.000',
    discount: '34%',
    salesEstimate: '18.4k+ terjual di TikTok Shop',
    viewsCount: '28.6M Views',
    growthRate: '+540% dlm 48 jam',
    fypScore: 98,
    viralityScore: 96,
    conversionPotential: 95,
    isTop1: true,
    isBreakout: true,
    recommendedAudio: {
      name: 'Dj Gala Gala Jedag Jedug Slow Reverb',
      author: 'Viral Sound ID',
      type: 'Sped Up Beat',
      usageTip: 'Pakai beat drop di detik ke-3 pas transisi dari pakaian santai ke gamis terpasang rapi sambil berputar.'
    },
    viralFormat: 'Before-After Try On & Spin 360°',
    targetAudience: 'Hijabers, Ibu Muda, Mahasiswi (20-35 tahun)',
    whyItIsViral: 'Bahan crinkle airflow yang super flowy dan tidak perlu disetrika sangat satisfying saat diayunkan (sway effect) di video pendek TikTok. Format perbandingan "sebelum vs sesudah styling" memicu retensi tontonan di atas 85%.',
    signals: ['FYP Velocity Tinggi', 'Sound Matching', 'Impulse Buy (<120k)', 'Banyak Stitch/Duet'],
    keyHooks: [
      'Gila sih, gamis seadem ini kenapa harganya cuma 100 ribuan di TikTok Shop?!',
      'Stop scrolling kalau kamu tipe orang yang males banget nyetrika baju tapi pengen tetep keliatan rapi!',
      'Nemu outfit kondangan penyelamat kaum mager, bahan airflow crinkle yang jatuhnya super anggun!'
    ],
    script30s: {
      hook: 'Stop scrolling! Kalau kamu mager nyetrika tapi pengen gamis yang semayung dan semewah ini, tonton sampai habis!',
      problem: 'Pasti kesel kan kalau mau buru-buru pergi tapi baju lecek parah, gerah, dan nggak sempat nyetrika?',
      solution: 'Gamis crinkle airflow ini hadir jadi solusi penyelamat OOTD kamu biar tampil rapi anggun seketika.',
      threeBenefits: [
        'Bahan airflow crinkle premium super adem dan anti-kusut tanpa setrika',
        'Siluet mayung A-line lebar yang anggun menyamarkan lekuk tubuh',
        'Resleting depan praktis busui friendly dengan jahitan kuat standar butik'
      ],
      demonstration: 'Gamis crinkle airflow premium ini langsung rapi tanpa disetrika dengan siluet mayung lebar yang anggun.',
      cta: 'buruan ambil dikeranjang video ini ya tepatnya Evashop!',
      cameraDirections: '0-3s: Close-up ekspresi kagum kibaskan gamis. 3-10s: Tunjukkan baju kusut di lemari. 10-18s: Transisi gamis terpakai anggun. 18-28s: Zoom detail 3 manfaat kain & resleting. 28-35s: Arahkan tangan ke keranjang video Evashop.'
    },
    topHashtags: ['#racuntiktok', '#gamiscrinkle', '#outfithijab', '#tiktokshophaul', '#fyp'],
    keyAdvantages: [
      'Bahan crinkle airflow anti kusut tanpa setrika',
      'Resleting busui friendly dengan jahitan tepi rapi',
      'Siluet A-line lebar menyamarkan lekuk tubuh'
    ],
    tiktokShopUrl: 'https://www.tiktok.com/search?q=gamis+crinkle+airflow'
  },
  {
    id: 'tt_prod_2',
    rank: 2,
    name: 'Celana Kulot Highwaist Linen Rami Tali Serut Loose Cut',
    category: 'Fashion & Hijab',
    priceRange: 'Rp89.000 - Rp99.000',
    originalPrice: 'Rp140.000',
    discount: '36%',
    salesEstimate: '22.1k+ terjual di TikTok Shop',
    viewsCount: '19.4M Views',
    growthRate: '+390% dlm 48 jam',
    fypScore: 94,
    viralityScore: 93,
    conversionPotential: 92,
    isBreakout: true,
    recommendedAudio: {
      name: 'Aesthetic Chill Lo-Fi Coffee Morning',
      author: 'Tiktok Creator Beats',
      type: 'Aesthetic Lo-fi',
      usageTip: 'Cocok untuk video bertema "1 Kulot 4 Gaya OOTD (Kantor, Kuliah, Hangout, Casual)".'
    },
    viralFormat: '1 Item 4 Style Mix & Match',
    targetAudience: 'Cewek Kue, Cewek Mamba, Mahasiswi & Karyawan Muda (18-28 tahun)',
    whyItIsViral: 'Efek visual potongan highwaist yang seketika membuat kaki terlihat 10cm lebih jenjang. Format video mix and match membuat audiens menyalin video (save bookmark) sehingga algoritma mem-boost ke jutaan FYP.',
    signals: ['High Bookmark Rate', 'Kaki Terlihat Jenjang', 'Harga Pelajar/Mahasiswa'],
    keyHooks: [
      'Penyelamat cewek paha besar dan betis lebar! Kulot ini beneran bikin kelihatan tinggi semampai.',
      'Satu celana 80 ribuan ini bisa kamu pakai buat 5 acara berbeda dalam seminggu, tonton sampai habis!',
      'Kenapa baru tau celana linen ini sekarang? Jahitannya tebal dan nggak tembus sama sekali.'
    ],
    script30s: {
      hook: 'Stop scrolling! Celana kulot ini sukses bikin insecure hilang karena paha besar ketutup sempurna!',
      problem: 'Sering kesel kan cari kulot yang ngetat di pinggul, bikin begah, dan bahannya tipis nerawang?',
      solution: 'Kulot linen rami loose cut ini hadir jadi solusi tepat biar kamu tampil jenjang dan percaya diri seharian.',
      threeBenefits: [
        'Potongan highwaist lurus menyamarkan paha dan betis seketika',
        'Serat linen rami tebal bertekstur mewah yang tidak menerawang',
        'Pinggang belakang full karet elastis super nyaman anti-begah'
      ],
      demonstration: 'Kulot linen rami ini punya potongan loose lurus dengan pinggang elastis dan bahan linen premium tebal.',
      cta: 'buruan ambil dikeranjang video ini ya tepatnya Evashop!',
      cameraDirections: '0-3s: Low angle tunjukkan efek kaki jenjang. 3-10s: Tunjukkan kulot sempit yang bikin sesak. 10-18s: Tunjukkan kulot terpakai santai. 18-28s: Zoom 3 manfaat serat linen, saku, dan karet pinggang. 28-35s: Arahkan tangan ke keranjang video Evashop.'
    },
    topHashtags: ['#kulothighwaist', '#ootdinspo', '#racuntiktokshop', '#cewekkue', '#fashiontiktok'],
    keyAdvantages: [
      'Potongan lurus menyamarkan paha dan betis',
      'Serat linen rami tebal tidak menerawang',
      'Pinggang belakang karet elastis super nyaman'
    ],
    tiktokShopUrl: 'https://www.tiktok.com/search?q=kulot+linen+highwaist'
  },
  {
    id: 'tt_prod_3',
    rank: 3,
    name: 'Mugwort Clay Mask Stick Pembersih Komedo & Pori-Pori Instan',
    category: 'Beauty & Skincare',
    priceRange: 'Rp38.000 - Rp49.000',
    originalPrice: 'Rp79.000',
    discount: '51%',
    salesEstimate: '45.7k+ terjual di TikTok Shop',
    viewsCount: '34.2M Views',
    growthRate: '+610% dlm 48 jam',
    fypScore: 97,
    viralityScore: 98,
    conversionPotential: 96,
    isBreakout: true,
    recommendedAudio: {
      name: 'ASMR Tingling Water & Tapping Sound',
      author: 'Clean Beauty Sound',
      type: 'Voiceover Sound',
      usageTip: 'Matikan musik saat detik ke 0-5, perbesar suara ASMR "klik" tutup stick dan olesan lembut ke kulit hidung.'
    },
    viralFormat: 'ASMR Skincare Routine & Macro Close-up',
    targetAudience: 'Pria & Wanita Remaja hingga Dewasa (16-30 tahun)',
    whyItIsViral: 'Bentuk stick putar yang higienis tanpa mengotori tangan dan sensasi visual olesan mulus (oddly satisfying). Video ASMR tekstur clay mask memiliki retensi completion rate tertinggi di niche kecantikan TikTok.',
    signals: ['Oddly Satisfying ASMR', 'Sensasi Komedo Terangkat', 'Harga Under 50k (Impulse Checkout)'],
    keyHooks: [
      'Dengar suara ini... ini alasan kenapa clay mask stick ini terjual puluhan ribu botol di TikTok!',
      'Kalau hidung kamu gradakan banyak komedo hitam, coba pakai ini 10 menit sebelum mandi.',
      'Masker paling praktis di dunia, tinggal putar dan oles tanpa belepotan di tangan sama sekali!'
    ],
    script30s: {
      hook: 'Stop scrolling! Kalau hidungmu gradakan banyak komedo hitam, wajib tonton cara instan ini!',
      problem: 'Pakai clay mask biasa itu ribet banget, tangan kotor belepotan, dan sering bikin kulit kering ketarik.',
      solution: 'Mugwort clay mask stick ini hadir jadi solusi praktis bikin pori-pori bersih mulus tanpa repot.',
      threeBenefits: [
        'Kemasan stick putar higienis yang tinggal oles tanpa mengotori tangan',
        'Ekstrak mugwort & centella efektif redakan kemerahan dan angkat komedo',
        'Formula deep cleansing bersihkan pori tersumbat hanya dalam 10 menit'
      ],
      demonstration: 'Tinggal putar dan oles, ekstrak mugwort dan centella membersihkan pori tanpa bikin kulit kering ketarik.',
      cta: 'buruan ambil dikeranjang video ini ya tepatnya Evashop!',
      cameraDirections: '0-3s: Macro close-up olesan stick ke hidung dengan suara ASMR. 3-10s: Tunjukkan komedo membandel di hidung. 10-18s: Oles merata stick tanpa belepotan jari. 18-28s: Zoom 3 manfaat kulit bersih setelah dibilas. 28-35s: Arahkan tangan ke keranjang video Evashop.'
    },
    topHashtags: ['#racunskincare', '#mugwortclaymask', '#skintok', '#racuntiktok', '#komedohilang'],
    keyAdvantages: [
      'Kemasan stick putar praktis tanpa mengotori jari',
      'Menenangkan jerawat kemerahan dengan ekstrak mugwort',
      'Membersihkan pori tersumbat dalam 10 menit'
    ],
    tiktokShopUrl: 'https://www.tiktok.com/search?q=mugwort+stick+clay+mask'
  },
  {
    id: 'tt_prod_4',
    rank: 4,
    name: 'Cardigan Crop Rajut Vintage Korean Buttoned Cable Knit',
    category: 'Fashion & Hijab',
    priceRange: 'Rp72.000 - Rp85.000',
    originalPrice: 'Rp125.000',
    discount: '32%',
    salesEstimate: '14.2k+ terjual di TikTok Shop',
    viewsCount: '15.8M Views',
    growthRate: '+310% dlm 48 jam',
    fypScore: 91,
    viralityScore: 90,
    conversionPotential: 89,
    recommendedAudio: {
      name: 'Cute Korean Cafe Acoustic Guitar',
      author: 'Seoul Indie Vibe',
      type: 'Aesthetic Lo-fi',
      usageTip: 'Pakai filter warna soft warm aesthetic khas cewek Korea dan transisi lempar baju ke kamera.'
    },
    viralFormat: 'Korean Style Transition & Outfit Inspo',
    targetAudience: 'Mahasiswi, Remaja & Pecinta Drakor (17-25 tahun)',
    whyItIsViral: 'Tekstur rajutan timbul yang terlihat mahal di video meski harga di bawah 80 ribu. Tren "Korean Clean Girl Outfit" terus mendominasi algoritma fashion TikTok Indonesia.',
    signals: ['Visual Aesthetic Hangat', 'Rajut Tebal Tidak Terawang', 'Tren Korean Wave'],
    keyHooks: [
      'Outfit ala cewek drakor modal 70 ribuan, rajutnya selembut dan setebal ini!',
      'Jangan beli cardigan ini kalau nggak mau ditanyain temen satu tongkrongan belinya di mana!',
      'Kombinasi cardigan rajut sama rok plisket ini beneran definisi cewek kue gemes!'
    ],
    script30s: {
      hook: 'Stop scrolling! Outfit ala cewek drakor semewah ini masa harganya cuma 70 ribuan?!',
      problem: 'Banyak cardigan rajut murah yang pas dateng tipis nerawang, gatal di kulit, dan gampang melar.',
      solution: 'Cardigan cable knit vintage ini hadir jadi solusi tampil chic ala Korean look dengan kenyamanan maksimal.',
      threeBenefits: [
        'Rajut 7-gauge tebal, empuk, dan sama sekali tidak bikin gatal',
        'Cuttingan semi-crop pas di pinggang mempercantik proporsi tubuh',
        'Detail kancing batok vintage dan motif rajut kabel standar butik'
      ],
      demonstration: 'Rajutannya padat, kancing batok hidup dan detail cable knit mewah dipadu tanktop atau kemeja sama cantiknya.',
      cta: 'buruan ambil dikeranjang video ini ya tepatnya Evashop!',
      cameraDirections: '0-3s: Lempar baju ke kamera, transisi terpasang rapi. 3-10s: Tunjukkan cardigan tipis yang bikin risih. 10-18s: Pose mirror selfie Korean clean girl. 18-28s: Zoom 3 manfaat rajut tebal dan kancing. 28-35s: Arahkan tangan ke keranjang video Evashop.'
    },
    topHashtags: ['#cardiganrajut', '#koreanstyle', '#racuntiktok', '#ootdhangout', '#fypfashion'],
    keyAdvantages: [
      'Rajut 7-gauge tebal, empuk dan tidak bikin gatal',
      'Potongan semi-crop pas di pinggang mempermanis siluet',
      'Warna pastel & earth tone yang estetik di kamera'
    ],
    tiktokShopUrl: 'https://www.tiktok.com/search?q=cardigan+crop+rajut'
  },
  {
    id: 'tt_prod_5',
    rank: 5,
    name: 'Lip Velvet Tint Lip Crayon Matte Stain Transferproof Ringan',
    category: 'Beauty & Skincare',
    priceRange: 'Rp29.000 - Rp39.000',
    originalPrice: 'Rp60.000',
    discount: '42%',
    salesEstimate: '38.9k+ terjual di TikTok Shop',
    viewsCount: '41.5M Views',
    growthRate: '+480% dlm 48 jam',
    fypScore: 96,
    viralityScore: 97,
    conversionPotential: 95,
    recommendedAudio: {
      name: 'Viral TikTok Phonk / Lip Swatch Pop',
      author: 'Beauty Beats',
      type: 'Trending Sound',
      usageTip: 'Uji transferproof dengan minum air dari gelas bening saat beat drop.'
    },
    viralFormat: 'Stress Test Transferproof & Swatch Bibir Gelap',
    targetAudience: 'Semua Wanita Pengguna Lipstik Harian (16-40 tahun)',
    whyItIsViral: 'Format video "Tes Ketahanan Minum Kopi / Pakai Masker" yang tidak meninggalkan bekas sama sekali. Harga 30 ribuan membuat penonton langsung checkout tanpa berpikir panjang.',
    signals: ['Uji Coba Ekstrem Tahan Lama', 'Nutup Bibir Gelap', 'Harga Super Terjangkau'],
    keyHooks: [
      'Bibir gelap tertutup sempurna cuma dengan sekali swipe lip velvet 30 ribuan ini!',
      'Tes transferproof paling gila: diminum pake gelas putih beneran nggak nempel sama sekali?!',
      'Kalau bibir kamu gampang kering tapi pengen hasil matte yang powdery, wajib nonton ini!'
    ],
    script30s: {
      hook: 'Stop scrolling! Kaget banget, lip velvet 30 ribuan ini beneran transferproof pas diuji minum gelas!',
      problem: 'Capek nggak sih setiap habis makan atau minum lipstik langsung luntur, belepotan, dan nempel di mana-mana?',
      solution: 'Lip velvet matte stain ini hadir jadi solusi bibir cantik on-point seharian tanpa repot touch up.',
      threeBenefits: [
        'Formula transferproof tidak menempel di sedotan, gelas, maupun masker',
        'Tekstur powdery velvet lembut yang tidak membuat bibir kering pecah-pecah',
        'Pigmentasi tinggi menutup warna bibir gelap sempurna hanya dalam 1 swipe'
      ],
      demonstration: 'Tekstur mousse velvet super lembut langsung menutup bibir gelap dan transferproof tahan seharian.',
      cta: 'buruan ambil dikeranjang video ini ya tepatnya Evashop!',
      cameraDirections: '0-3s: Close-up bibir swatch satu garis tegas. 3-10s: Tunjukkan bekas lipstik menempel di cangkir. 10-18s: Oles lip velvet merata. 18-28s: Tes cium tisu putih bukti nol transfer & 3 manfaatnya. 28-35s: Arahkan tangan ke keranjang video Evashop.'
    },
    topHashtags: ['#liptintviral', '#racunmakeup', '#transferprooflip', '#beautytok', '#fyp'],
    keyAdvantages: [
      'Formula transferproof tidak menempel di sedotan / masker',
      'Tekstur powdery velvet tidak membuat bibir pecah-pecah',
      'Pigmentasi tinggi menutup bibir gelap seketika'
    ],
    tiktokShopUrl: 'https://www.tiktok.com/search?q=lip+velvet+tint+transferproof'
  },
  {
    id: 'tt_prod_6',
    rank: 6,
    name: 'Blouse Wanita Katun Rayon V-Neck Kancing Batok Adem',
    category: 'Fashion & Hijab',
    priceRange: 'Rp68.000 - Rp78.000',
    originalPrice: 'Rp110.000',
    discount: '35%',
    salesEstimate: '16.5k+ terjual di TikTok Shop',
    viewsCount: '12.9M Views',
    growthRate: '+270% dlm 48 jam',
    fypScore: 89,
    viralityScore: 88,
    conversionPotential: 91,
    recommendedAudio: {
      name: 'Happy Work Day Upbeat Acoustic',
      author: 'Office Creator ID',
      type: 'Aesthetic Lo-fi',
      usageTip: 'Tunjukkan kepraktisan baju saat dipakai di cuaca panas naik ojek online atau transportasi umum.'
    },
    viralFormat: 'Real Life Commuter & Office Wear POV',
    targetAudience: 'Wanita Karir, Guru, Mahasiswi Magang (21-35 tahun)',
    whyItIsViral: 'Menjawab keresahan riil para pekerja komuter di Indonesia: baju kantor yang tidak gerah, menyerap keringat, dan tetap tampak profesional dengan harga ramah kantong.',
    signals: ['Solusi Gerah Commuter', 'Harga Under 80k', 'Formal & Santai Serbaguna'],
    keyHooks: [
      'Penyelamat anak kereta dan pejuang ojol! Baju kantor yang beneran dingin semriwing di badan.',
      'Nemu blouse kerja yang potongannya bikin leher jenjang dan perut buncit tersamarkan!',
      'Gaji pertama jangan dihabisin, outfit kerja rapi ini harganya nggak sampai 80 ribu!'
    ],
    script30s: {
      hook: 'Stop scrolling! Outfit kerja andalan pejuang ojol & KRL, ademnya juara nggak bikin apek!',
      problem: 'Sering risih gak sih kalau baju kerja bahannya kaku, panas, dan gampang keliatan keringat basah?',
      solution: 'Blouse katun rayon twill ini hadir jadi solusi ngantor tetap rapi, sejuk, dan percaya diri seharian.',
      threeBenefits: [
        'Material katun rayon twill premium yang menyerap keringat dan super dingin',
        'Kerah V-neck anggun yang memberi ilusi leher lebih ramping dan proporsional',
        'Aksen kancing batok kelapa natural yang memberi kesan clean dan elegan'
      ],
      demonstration: 'Katun rayon twill berpori bikin angin lewat bebas, cutting V-neck anggun dan kancing batok estetik.',
      cta: 'buruan ambil dikeranjang video ini ya tepatnya Evashop!',
      cameraDirections: '0-3s: Pose cermin kantor outfit rapi. 3-10s: Tunjukkan gerah kepanasan di jalan. 10-18s: Kipas blouse tunjukkan ringannya kain. 18-28s: Zoom 3 manfaat kerah, serat kain, dan kancing. 28-35s: Arahkan tangan ke keranjang video Evashop.'
    },
    topHashtags: ['#blousekerja', '#outfitkantor', '#racuntiktok', '#pejuangkrl', '#ootdkerja'],
    keyAdvantages: [
      'Katun rayon twill menyerap keringat seharian',
      'Kancing batok kelapa natural yang elegan',
      'Kerah V-neck memberi ilusi leher lebih ramping'
    ],
    tiktokShopUrl: 'https://www.tiktok.com/search?q=blouse+katun+rayon+wanita'
  },
  {
    id: 'tt_prod_7',
    rank: 7,
    name: 'Botol Minum Tumbler Termos Stainless 1200ml Sedotan Tahan Es 24 Jam',
    category: 'Perlengkapan Rumah',
    priceRange: 'Rp79.000 - Rp95.000',
    originalPrice: 'Rp150.000',
    discount: '40%',
    salesEstimate: '29.3k+ terjual di TikTok Shop',
    viewsCount: '27.4M Views',
    growthRate: '+440% dlm 48 jam',
    fypScore: 93,
    viralityScore: 94,
    conversionPotential: 92,
    isBreakout: true,
    recommendedAudio: {
      name: 'Ice Cubes Clinking ASMR Tumbler Pour',
      author: 'Hydration Tok',
      type: 'Voiceover Sound',
      usageTip: 'Suara batu es jatuh ke dalam tumbler stainless diiringi gemercik air dingin di detik pembuka.'
    },
    viralFormat: 'Ice Retention Test 24 Jam & Aesthetic Tumbler Tour',
    targetAudience: 'Anak Gym, Pekerja Kantor, Mahasiswa, Ibu Rumah Tangga (18-40 tahun)',
    whyItIsViral: 'Dupe alternatif termos viral merek jutaan rupiah dengan performa insulasi dingin 24 jam yang sama kuatnya. Format video eksperimen membuktikan es batu masih utuh setelah seharian penuh.',
    signals: ['Eksperimen Bukti Nyata', 'Gaya Hidup Sehat & Hemat', 'Visual Warna Pastel Trendi'],
    keyHooks: [
      'Eksperimen gila: kita isi es batu jam 8 pagi, apa masih ada esnya pas jam 8 malam besoknya?!',
      'Daripada beli tumbler jutaan, tumbler 80 ribuan ini udah tahan es seharian penuh dan anti tumpah!',
      'Alasan kenapa konsumsi air putihku naik 2 liter sehari semenjak punya tumbler gemes ini.'
    ],
    script30s: {
      hook: 'Stop scrolling! Tes ketahanan es batu 24 jam di tumbler 80 ribuan ini bikin melongo!',
      problem: 'Bawa es kopi di botol biasa baru 1 jam udah cair dan hambar, belum lagi airnya sering bocor merembes di tas.',
      solution: 'Tumbler stainless double-wall 1200ml ini hadir jadi solusi minum dingin segar seharian penuh tanpa drama bocor.',
      threeBenefits: [
        'Insulasi double-wall stainless steel 304 yang tahan es batu hingga 24 jam',
        'Kapasitas jumbo 1200ml dilengkapi sedotan silikon food-grade ramah gigi',
        'Tutup ulir kedap 100% anti bocor walau dibolak-balik di dalam tas'
      ],
      demonstration: 'Tumbler double-wall stainless 1200ml ini ada sedotan silikon food-grade dan es batu awet dingin seharian penuh.',
      cta: 'buruan ambil dikeranjang video ini ya tepatnya Evashop!',
      cameraDirections: '0-3s: Buka tutup termos perlihatkan es batu gemerincing. 3-10s: Tunjukkan es kopi cair di botol plastik biasa. 10-18s: Tuang air es ke tumbler. 18-28s: Balik botol di atas meja uji anti-bocor & 3 manfaatnya. 28-35s: Arahkan tangan ke keranjang video Evashop.'
    },
    topHashtags: ['#tumblerviral', '#racuntiktokshop', '#tumblerlucu', '#hematbeli', '#fyp'],
    keyAdvantages: [
      'Double wall stainless steel 304 tahan dingin hingga 24 jam',
      'Kapasitas besar 1200ml tidak perlu bolak-balik isi ulang',
      'Tutup 2in1 bisa sedotan atau teguk langsung anti bocor'
    ],
    tiktokShopUrl: 'https://www.tiktok.com/search?q=tumbler+stainless+1200ml'
  },
  {
    id: 'tt_prod_8',
    rank: 8,
    name: 'Rok Plisket Maxi Mayung Swing Premium Hyget Super Tebal',
    category: 'Fashion & Hijab',
    priceRange: 'Rp59.000 - Rp69.000',
    originalPrice: 'Rp95.000',
    discount: '34%',
    salesEstimate: '31.2k+ terjual di TikTok Shop',
    viewsCount: '21.0M Views',
    growthRate: '+330% dlm 48 jam',
    fypScore: 92,
    viralityScore: 91,
    conversionPotential: 94,
    recommendedAudio: {
      name: 'Slow Motion Walking Violin Cinematic',
      author: 'Elegance Audio',
      type: 'Trending Sound',
      usageTip: 'Gunakan mode slow motion 0.5x saat model mengibaskan rok plisket sambil berjalan di luar ruangan.'
    },
    viralFormat: 'Slow-mo Sway Walking Video',
    targetAudience: 'Hijabers, Mahasiswi, Ibu-ibu Muda (18-45 tahun)',
    whyItIsViral: 'Efek visual "sway" atau gelombang lipatan plisket saat berjalan dalam gerak lambat (slow-motion) sangat membius mata di FYP TikTok. Harga di bawah 65 ribu adalah pemicu instan pembelian impulsif.',
    signals: ['Slow Motion Satisfaction', 'Harga Super Murah (<65k)', 'Cocok Segala Ukuran S-XXL'],
    keyHooks: [
      'Rok plisket 60 ribuan tapi pas dipake swing-swing auranya kayak outfit jutaan rupiah!',
      'Pernah beli rok plisket yang lipatannya gampang hilang pas dicuci? Rok yang satu ini lipatannya mati permanen!',
      'Gampang banget dipaduin sama blouse atau knit sweater, rok ini beneran serba guna!'
    ],
    script30s: {
      hook: 'Stop scrolling! Rok plisket semayung ini auranya mewah banget padahal harganya 60 ribuan!',
      problem: 'Banyak rok plisket murah yang tipis menerawang, gerah, dan lipatannya gampang hilang pas dicuci.',
      solution: 'Rok plisket maxi hyget premium ini hadir jadi solusi tampil anggun semampai tanpa takut terawang.',
      threeBenefits: [
        'Bahan hyget super tebal berbobot yang tidak menjiplak dan tidak menerawang',
        'Lipatan plisket mesin presisi yang tajam awet permanen walau dicuci berulang',
        'Pinggang full karet elastis ekstra nyaman fleksibel dari ukuran S sampai XXL'
      ],
      demonstration: 'Bahan hyget super tebal, jatuh rapi, dan lipatan plisketnya awet tajam dengan karet pinggang elastis S sampai XXL.',
      cta: 'buruan ambil dikeranjang video ini ya tepatnya Evashop!',
      cameraDirections: '0-3s: Slow motion kaki melangkah dengan rok berayun lebar. 3-10s: Tunjukkan rok tipis yang jiplak di badan. 10-18s: Putar badan anggun pamerkan siluet swing. 18-28s: Tarik karet pinggang tunjukkan elastisitas & 3 manfaatnya. 28-35s: Arahkan tangan ke keranjang video Evashop.'
    },
    topHashtags: ['#rokplisket', '#outfithijabers', '#racuntiktok', '#mayungswing', '#fyp'],
    keyAdvantages: [
      'Lipatan plisket mesin awet permanen tidak mudah buyar',
      'Bahan hyget super tebal tidak jiplak di badan',
      'Pinggang full karet elastis melar nyaman hingga XXL'
    ],
    tiktokShopUrl: 'https://www.tiktok.com/search?q=rok+plisket+mayung+tebal'
  },
  {
    id: 'tt_prod_9',
    rank: 9,
    name: 'Tas Selempang Wanita Puffer Cloud Bag Nylon Quilted Waterproof',
    category: 'Tas & Sepatu',
    priceRange: 'Rp55.000 - Rp68.000',
    originalPrice: 'Rp115.000',
    discount: '45%',
    salesEstimate: '17.8k+ terjual di TikTok Shop',
    viewsCount: '16.3M Views',
    growthRate: '+360% dlm 48 jam',
    fypScore: 91,
    viralityScore: 92,
    conversionPotential: 90,
    recommendedAudio: {
      name: 'What is In My Bag Viral TikTok Voiceover',
      author: 'Daily Creator ID',
      type: 'Voiceover Sound',
      usageTip: 'Bikin video "What fits in my bag" dan masukkan barang-barang berukuran besar yang mengejutkan penonton.'
    },
    viralFormat: 'What Fits In My Bag? (Kapastias Ajaib)',
    targetAudience: 'Remaja, Mahasiswi, Cewek Kue & Minimalis (17-26 tahun)',
    whyItIsViral: 'Desain tas "puffer empuk mirip bantal awan" yang sedang tren di kalangan fashion Gen Z global. Format video membuktikan tas kecil tapi muat iPad, dompet, payung, dan pouch makeup selalu memikat audiens.',
    signals: ['Tren Desain Puffer Cloud', 'Kapasitas Menipu Mata', 'Ringan & Anti Air'],
    keyHooks: [
      'Kelihatannya kecil kayak awan empuk, tapi pas dibuka dalamnya kayak kantong Doraemon!',
      'Tas puffer paling viral di TikTok, empuk kayak bantal dan muat iPad sampai payung lipat!',
      'Nggak heran tas ini sold out di mana-mana, harganya cuma 50 ribuan tapi bahannya waterproof!'
    ],
    script30s: {
      hook: 'Stop scrolling! Tas awan empuk yang dalamnya kayak kantong Doraemon, muat sebanyak ini?!',
      problem: 'Sering risih bawa tas selempang yang talinya bikin pundak pegal, sempit, dan basah pas kena gerimis?',
      solution: 'Tas puffer cloud quilted ini hadir jadi solusi bawa semua barang esensial harianmu dengan nyaman dan ringan.',
      threeBenefits: [
        'Bahan parasut nylon quilted anti air (waterproof) dan super empuk',
        'Kapasitas lega muat iPad, dompet panjang, payung lipat hingga pouch makeup',
        'Tali pundak lebar berbusa empuk yang anti-pegal dipakai seharian'
      ],
      demonstration: 'Tas puffer nylon busa empuk ini muat iPad, botol minum, makeup dan tahan cipratan air gerimis.',
      cta: 'buruan ambil dikeranjang video ini ya tepatnya Evashop!',
      cameraDirections: '0-3s: Squish tas empuk mirip awan. 3-10s: Tunjukkan pundak sakit akibat tas tali kaku. 10-18s: Masukkan iPad & dompet berturut-turut. 18-28s: Semprot air bukti waterproof & 3 manfaatnya. 28-35s: Arahkan tangan ke keranjang video Evashop.'
    },
    topHashtags: ['#pufferbag', '#taswanita', '#whatsinmybag', '#racuntiktok', '#taslucu'],
    keyAdvantages: [
      'Bahan parasut nylon quilted empuk dan anti air ringan',
      'Kapasitas luas menampung barang esensial harian',
      'Tali lebar empuk tidak membuat pundak pegal'
    ],
    tiktokShopUrl: 'https://www.tiktok.com/search?q=tas+puffer+cloud+bag'
  },
  {
    id: 'tt_prod_10',
    rank: 10,
    name: 'Lampu Meja Sunset Lamp RGB Remote Proyektor Aesthetic Foto Kamar',
    category: 'Aksesoris & Gadget',
    priceRange: 'Rp32.000 - Rp45.000',
    originalPrice: 'Rp85.000',
    discount: '53%',
    salesEstimate: '26.4k+ terjual di TikTok Shop',
    viewsCount: '23.8M Views',
    growthRate: '+290% dlm 48 jam',
    fypScore: 90,
    viralityScore: 93,
    conversionPotential: 88,
    recommendedAudio: {
      name: 'Golden Hour Sunset Acoustic Ambient',
      author: 'Chill Room Beats',
      type: 'Aesthetic Lo-fi',
      usageTip: 'Matikan lampu kamar tepat saat beat drop dan nyalakan lampu sunset ke arah dinding putih.'
    },
    viralFormat: 'Room Makeover / Golden Hour Photo Shoot at Home',
    targetAudience: 'Kreator Konten, Remaja Kamar Aesthetic, Gamers (15-28 tahun)',
    whyItIsViral: 'Membuat kamar biasa tampak seperti studio foto keemasan (golden hour) seketika dalam gelap. Alat esensial bagi para pembuat konten foto OOTD dan video selfie TikTok di rumah.',
    signals: ['Efek Golden Hour Instan', 'Upgrade Kamar Estetik', 'Harga Di Bawah 45k'],
    keyHooks: [
      'Modal 30 ribuan kamar kosanku langsung berubah jadi studio foto golden hour estetik!',
      'Rahasia foto selfie muka glowing tanpa filter di kamar gelap, wajib punya lampu ini!',
      'Gak perlu nunggu sore buat dapet cahaya senja, tinggal klik remote langsung estetik seketika!'
    ],
    script30s: {
      hook: 'Stop scrolling! Kamar kosan biasa bisa seestetik studio foto cuma modal lampu 30 ribuan!',
      problem: 'Mau foto selfie OOTD di kamar sering banget gelap, pencahayaan kusam, dan bayangannya jelek.',
      solution: 'Sunset lamp RGB projector ini hadir jadi solusi pencahayaan golden hour instan kapan saja.',
      threeBenefits: [
        'Lensa kristal HD dengan 16 pilihan warna RGB dramatis dan estetik',
        'Dilengkapi remote control pintar untuk atur efek warna dan tingkat kecerahan',
        'Kepala lampu putar 360° yang fleksibel menembak sudut dinding mana pun'
      ],
      demonstration: 'Lampu sunset 16 warna RGB dengan remote control instan mengubah dinding kamar jadi nuansa senja hangat.',
      cta: 'buruan ambil dikeranjang video ini ya tepatnya Evashop!',
      cameraDirections: '0-3s: Kamar gelap seketika menyala cahaya sunset keemasan. 3-10s: Tunjukkan foto kusam tanpa lampu. 10-18s: Ganti warna lampu via remote. 18-28s: Pose selfie glowing & uji 3 manfaatnya. 28-35s: Arahkan tangan ke keranjang video Evashop.'
    },
    topHashtags: ['#sunsetlamp', '#kamarestetik', '#racuntiktok', '#racunkos', '#fyp'],
    keyAdvantages: [
      'Proyeksi lensa kristal HD tajam dengan 16 pilihan warna RGB',
      'Sudah dilengkapi remote control dan pengaturan kecerahan',
      'Kepala lampu dapat diputar 360 derajat untuk berbagai sudut foto'
    ],
    tiktokShopUrl: 'https://www.tiktok.com/search?q=sunset+lamp+projector'
  }
];

export const INITIAL_TIKTOK_SOUNDS: TikTokSoundTrend[] = [
  {
    id: 'snd_1',
    title: 'Dj Gala Gala Jedag Jedug Slow Reverb',
    creator: 'Viral Sound ID',
    tag: 'Trending #1 Musik',
    totalVideos: '2.4M Video Digunakan',
    growth: '+450% Hari Ini',
    vibe: 'Beat Hentak & Transisi Cepat',
    bestProductFit: 'Fashion Try-On, Gamis Mayung, Celana Kulot Highwaist'
  },
  {
    id: 'snd_2',
    title: 'Aesthetic Chill Lo-Fi Coffee Morning',
    creator: 'Tiktok Creator Beats',
    tag: 'Trending Niche Lifestyle',
    totalVideos: '890k Video Digunakan',
    growth: '+280% Hari Ini',
    vibe: 'Tenang, Santai, Hangat',
    bestProductFit: 'Tumbler Stainless, OOTD Korean Look, Tas Puffer'
  },
  {
    id: 'snd_3',
    title: 'ASMR Tingling Water & Tapping Sound',
    creator: 'Clean Beauty Sound',
    tag: 'Trending Skincare & Beauty',
    totalVideos: '1.1M Video Digunakan',
    growth: '+520% Hari Ini',
    vibe: 'Oddly Satisfying & Renyah',
    bestProductFit: 'Clay Mask Stick, Lip Velvet Tint, Serum Brightening'
  },
  {
    id: 'snd_4',
    title: 'What is In My Bag Viral Voiceover Hook',
    creator: 'Daily Creator ID',
    tag: 'Trending Niche Storytelling',
    totalVideos: '620k Video Digunakan',
    growth: '+310% Hari Ini',
    vibe: 'Penasaran & Relatable',
    bestProductFit: 'Tas Puffer Cloud, Dompet Lipat, Aksesoris Organizer'
  }
];

export const INITIAL_TIKTOK_HASHTAGS: TikTokHashtagTrend[] = [
  {
    tag: '#racuntiktok',
    views: '48.2B Views',
    growth: '+12.4% minggu ini',
    description: 'Hashtag wajib untuk segala review barang murah & bermanfaat yang memicu rasa ingin beli.'
  },
  {
    tag: '#tiktokshophaul',
    views: '29.7B Views',
    growth: '+18.1% minggu ini',
    description: 'Format unboxing dan review borongan belanjaan dari keranjang kuning TikTok Shop.'
  },
  {
    tag: '#outfitideas',
    views: '19.5B Views',
    growth: '+9.3% minggu ini',
    description: 'Inspirasi padu-padan busana harian, kuliah, ngantor, dan kondangan.'
  },
  {
    tag: '#skintok',
    views: '22.8B Views',
    growth: '+14.6% minggu ini',
    description: 'Komunitas pecinta produk perawatan wajah, tips komedo, dan tes ketahanan makeup.'
  },
  {
    tag: '#fyp',
    views: '990B+ Views',
    growth: 'Stabil Utama',
    description: 'Pengungkit distribusi algoritma TikTok ke halaman For You Page penonton baru.'
  }
];
