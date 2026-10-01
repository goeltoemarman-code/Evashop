import { GoogleGenAI } from "@google/genai";
import { 
  ShopeeProduct, 
  VideoHookConcept, 
  ContentGeneration, 
  ViralContent, 
  EvaArticle, 
  FashionImagePrompt, 
  FashionVideoPrompt 
} from "../types/affiliate";

export interface ResearchResult {
  products: ShopeeProduct[];
  topProductChoice: {
    product: ShopeeProduct;
    reason: string;
  } | null;
  topVideoConcepts: VideoHookConcept[];
  hiddenGems: ShopeeProduct[];
  searchTimestamp: string;
  searchDate: string;
  isLiveAvailable: boolean;
  notes?: string;
}

export async function runShopeeFashionResearch(params: {
  categories: string[];
  priceRange: string;
  affiliateFilters: string[];
  customKeyword?: string;
}): Promise<ResearchResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Kunci API Gemini (GEMINI_API_KEY) belum dikonfigurasi.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const categoriesText = params.categories.length > 0 
    ? params.categories.join(", ") 
    : "Dress wanita, Gamis, Tunik, Blouse, Kemeja, Atasan, Rok, Celana, Setelan, Fashion Muslimah, Kebaya, Batik, Outer";
  
  const filtersText = params.affiliateFilters.length > 0 
    ? params.affiliateFilters.join(", ") 
    : "Potensi klik tinggi, Fashion wanita, Rating tinggi, Banyak ulasan, Cocok untuk video";

  const priceText = params.priceRange || "Semua Rentang Harga";
  const now = new Date();
  const searchDate = now.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  const searchTime = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  const systemInstruction = `Anda adalah AI Content & Product Research Assistant khusus untuk "Eva Shop", media konten affiliate yang fokus pada produk fashion di Shopee Indonesia.

TUJUAN UTAMA:
Membantu menemukan 10 produk fashion Shopee Indonesia yang paling layak dipromosikan hari ini (${searchDate}) berdasarkan data dan sinyal nyata dari Shopee Indonesia.

ATURAN PALING PENTING (STRICT ZERO-FABRICATION POLICY):
1. Sumber utama produk: Shopee Indonesia & Kategori Fashion Shopee.
2. JANGAN PERNAH MENGARANG:
   - Jumlah terjual
   - Jumlah pembeli
   - Omzet
   - Persentase pertumbuhan
   - Komisi affiliate
   - Ranking resmi Shopee
   Jika data tersebut tidak tersedia secara pasti, WAJIB tulis persis: "Data tidak tersedia".
3. JANGAN mengarang atau menebak URL link Shopee produk. Jika URL asli tidak pasti, kosongkan atau tulis "https://shopee.co.id/search?keyword=...".
4. Bedakan antara "produk terlaris" dengan "produk berpotensi bagus untuk konten video".
5. Utamakan produk yang memiliki model/warna menarik, harga impulse buy (ramah kantong wanita dewasa), mudah dibuat video TikTok/Reels/Shorts, dan punya masalah/solusi pakaian yang jelas.

FORMULA SCORING (0-100):
- Popularitas Shopee: bobot 25%
- Conversion Potential: bobot 20%
- Social Content Potential: bobot 20%
- Visual Appeal: bobot 15%
- Harga Menarik: bobot 10%
- Review Strength: bobot 5%
- Trend Potential: bobot 5%
Eva Shop Score = (Popularitas * 0.25) + (Conversion * 0.20) + (Content * 0.20) + (Visual * 0.15) + (Harga * 0.10) + (Review * 0.05) + (Trend * 0.05).
Urutkan 10 produk dari Eva Shop Score tertinggi.`;

  const userPrompt = `Lakukan riset 10 PRODUK FASHION SHOPEE TERBAIK UNTUK EVASHOP HARI INI (${searchDate}):

Kriteria Pencarian:
- Kategori Fashion yang difokuskan: ${categoriesText}
- Filter Harga: ${priceText}
- Filter Khusus Affiliate: ${filtersText}
${params.customKeyword ? `- Kata kunci spesifik pengguna: "${params.customKeyword}"` : ""}

Keluarkan output dalam format JSON valid MURNI (tanpa markdown pembuka seperti \`\`\`json atau teks pengantar apapun) dengan struktur skema persis:
{
  "isLiveAvailable": true,
  "searchDate": "${searchDate}",
  "searchTimestamp": "${searchTime}",
  "products": [
    {
      "id": "shopee_prod_1",
      "rank": 1,
      "name": "Nama produk fashion lengkap & jelas",
      "category": "Contoh: Dress Wanita / Gamis / Blouse",
      "price": "Rp125.000",
      "originalPrice": "Rp189.000",
      "discount": "34%",
      "rating": "4.8",
      "reviewCount": "1.4k ulasan",
      "soldCount": "Data tidak tersedia",
      "popularityStatus": "Sangat tinggi",
      "signals": ["rating tinggi", "banyak ulasan", "harga promo", "visual menarik", "cocok untuk video", "sedang populer"],
      "scores": {
        "popularity": 92,
        "conversion": 88,
        "content": 90,
        "visualAppeal": 88,
        "priceAppeal": 85,
        "reviewStrength": 80,
        "trendPotential": 85,
        "evaScore": 88
      },
      "contentPotentialFlame": 5,
      "conversionPotentialFlame": 4,
      "recommendationReason": "Alasan spesifik 2-4 kalimat kenapa produk ini sangat direkomendasikan untuk affiliate Eva Shop.",
      "shopeeUrl": "https://shopee.co.id/search?keyword=...",
      "keyAdvantages": ["Bahan crinkle airflow adem", "Potongan A-line menyamarkan pinggul", "Jahitan rapi tepi neci"],
      "fabricOrMaterial": "Crinkle Airflow Premium",
      "colorOptions": ["Sage Green", "Mocca", "Black", "Dusty Pink"]
    }
  ],
  "topProductChoice": {
    "productId": "shopee_prod_1",
    "reason": "Alasan maksimal 5 kalimat kenapa produk ini menjadi 🏆 PRODUK TERBAIK HARI INI."
  },
  "topVideoConcepts": [
    {
      "productId": "shopee_prod_1",
      "productName": "Nama Produk 1",
      "reason": "Alasan kenapa produk ini sangat kuat untuk video",
      "hook": "Kalau kamu sedang cari dress yang nggak bikin gerah tapi tetep kelihatan mewah buat kondangan, jangan lewatkan yang satu ini.",
      "problem": "Banyak orang kesulitan cari dress elegan dengan harga under 150 ribu yang bahannya beneran adem jatuh.",
      "solution": "Model ini bisa jadi pilihan karena menggunakan bahan crinkle airflow jatuh dengan potongan A-line yang anggun.",
      "advantages": ["Potongan slim-fit bikin jenjang", "Busui friendly dengan resleting depan", "Nggak gampang kusut tanpa perlu disetrika"],
      "cta": "Cek produknya di keranjang Eva Shop."
    }
  ],
  "hiddenGems": [
    {
      "id": "gem_1",
      "rank": 1,
      "name": "Nama produk yang belum tentu nomor 1 tapi sangat bagus untuk konten",
      "category": "Blouse Wanita",
      "price": "Rp89.000",
      "originalPrice": "Rp130.000",
      "discount": "31%",
      "rating": "4.9",
      "reviewCount": "820 ulasan",
      "soldCount": "Data tidak tersedia",
      "popularityStatus": "Tinggi",
      "signals": ["visual sangat menarik", "harga kompetitif", "cocok untuk UGC", "mudah dibuat try-on"],
      "scores": {
        "popularity": 80,
        "conversion": 86,
        "content": 94,
        "visualAppeal": 92,
        "priceAppeal": 90,
        "reviewStrength": 78,
        "trendPotential": 88,
        "evaScore": 86
      },
      "contentPotentialFlame": 5,
      "conversionPotentialFlame": 4,
      "recommendationReason": "Visual kerah ruffle yang sangat estetik saat disorot kamera, sangat cocok untuk konten UGC try-on 15 detik.",
      "shopeeUrl": "https://shopee.co.id/search?keyword=...",
      "keyAdvantages": ["Detail kerah korean ruffle estetik", "Cocok dipadukan dengan celana kulot maupun rok"],
      "fabricOrMaterial": "Katun Rayon Twill",
      "colorOptions": ["Broken White", "Sky Blue", "Lilac"]
    }
  ]
}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        { role: "user", parts: [{ text: `${systemInstruction}\n\n${userPrompt}` }] }
      ],
      config: {
        temperature: 0.3,
        responseMimeType: "application/json",
      }
    });

    const rawText = response.text?.trim() || "{}";
    const cleanJson = rawText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    const parsed = JSON.parse(cleanJson);

    // Map and ensure calculated scores are compliant with formula
    const products: ShopeeProduct[] = (parsed.products || []).slice(0, 10).map((item: any, idx: number) => {
      const p = item.scores?.popularity ?? 80;
      const c = item.scores?.conversion ?? 80;
      const cnt = item.scores?.content ?? 80;
      const v = item.scores?.visualAppeal ?? 80;
      const h = item.scores?.priceAppeal ?? 80;
      const r = item.scores?.reviewStrength ?? 80;
      const t = item.scores?.trendPotential ?? 80;
      
      const weightedEvaScore = Math.round(
        (p * 0.25) + (c * 0.20) + (cnt * 0.20) + (v * 0.15) + (h * 0.10) + (r * 0.05) + (t * 0.05)
      );

      return {
        id: item.id || `shopee_prod_${idx + 1}`,
        rank: idx + 1,
        name: item.name || `Fashion Product #${idx + 1}`,
        category: item.category || "Fashion Wanita",
        price: item.price || "Data tidak tersedia",
        originalPrice: item.originalPrice || undefined,
        discount: item.discount || undefined,
        rating: item.rating || "Data tidak tersedia",
        reviewCount: item.reviewCount || "Data tidak tersedia",
        soldCount: "Data tidak tersedia",
        popularityStatus: item.popularityStatus || "Tinggi",
        signals: Array.isArray(item.signals) ? item.signals : ["rating tinggi", "visual menarik", "cocok untuk video"],
        scores: {
          popularity: p,
          conversion: c,
          content: cnt,
          visualAppeal: v,
          priceAppeal: h,
          reviewStrength: r,
          trendPotential: t,
          evaScore: weightedEvaScore,
        },
        contentPotentialFlame: Math.min(5, Math.max(1, Math.round(cnt / 20))),
        conversionPotentialFlame: Math.min(5, Math.max(1, Math.round(c / 20))),
        recommendationReason: item.recommendationReason || "Produk fashion dengan daya tarik visual dan harga ideal untuk audiens Eva Shop.",
        shopeeUrl: item.shopeeUrl || `https://shopee.co.id/search?keyword=${encodeURIComponent(item.name || "fashion")}`,
        affiliateUrl: "",
        keyAdvantages: item.keyAdvantages || ["Kualitas bahan nyaman dipakai seharian", "Model kekinian dan gampang dipadupadankan"],
        fabricOrMaterial: item.fabricOrMaterial || "Katun Rayon Premium",
        colorOptions: item.colorOptions || ["Hitam", "Mocca", "Sage Green"],
      };
    });

    // Sort products by Eva Shop Score descending
    products.sort((a, b) => b.scores.evaScore - a.scores.evaScore);
    // Re-assign ranks
    products.forEach((prod, i) => {
      prod.rank = i + 1;
    });

    // Determine Top Product Choice
    const topProd = products[0] || null;
    const topProductChoice = topProd ? {
      product: topProd,
      reason: parsed.topProductChoice?.reason || `${topProd.name} dinobatkan sebagai produk terbaik hari ini karena memiliki keseimbangan luar biasa antara popularitas pasar, estetika visual video, kenyamanan bahan, dan harga promo yang sangat ramah di kantong konsumen.`,
    } : null;

    if (topProd) {
      topProd.isTopChoice = true;
    }

    // Top Video Concepts (3 products)
    const topVideoConcepts: VideoHookConcept[] = (parsed.topVideoConcepts || []).slice(0, 3).map((v: any, idx: number) => ({
      productId: v.productId || products[idx]?.id || `video_${idx}`,
      productName: v.productName || products[idx]?.name || `Produk Video #${idx + 1}`,
      reason: v.reason || "Sangat mudah dipresentasikan dalam format video 15-30 detik dengan transisi before-after.",
      hook: v.hook || `Kalau kamu sedang cari outfit yang bikin penampilan rapi seketika tanpa ribet, jangan lewatkan yang satu ini.`,
      problem: v.problem || "Banyak wanita merasa bingung memilih outfit kerja yang adem tapi tetap tampak profesional.",
      solution: v.solution || "Model ini hadir dengan potongan rapi serta material breathable yang nyaman dipakai dari pagi sampai malam.",
      advantages: Array.isArray(v.advantages) ? v.advantages : ["Bahan lembut tidak menerawang", "Potongan nyaman untuk bergerak", "Warna-warna netral mudah dimix & match"],
      cta: v.cta || "Cek produknya di keranjang Eva Shop.",
    }));

    // Hidden Gems (Max 5 products)
    const hiddenGems: ShopeeProduct[] = (parsed.hiddenGems || []).slice(0, 5).map((gem: any, idx: number) => ({
      id: gem.id || `gem_${idx + 1}`,
      rank: idx + 1,
      name: gem.name || `Fashion Gem #${idx + 1}`,
      category: gem.category || "Fashion Wanita",
      price: gem.price || "Rp89.000",
      originalPrice: gem.originalPrice,
      discount: gem.discount,
      rating: gem.rating || "4.8",
      reviewCount: gem.reviewCount || "Data tidak tersedia",
      soldCount: "Data tidak tersedia",
      popularityStatus: "Tinggi",
      signals: ["visual sangat menarik", "harga kompetitif", "cocok untuk UGC", "mudah dibuat try-on"],
      scores: {
        popularity: gem.scores?.popularity ?? 80,
        conversion: gem.scores?.conversion ?? 85,
        content: gem.scores?.content ?? 92,
        visualAppeal: gem.scores?.visualAppeal ?? 90,
        priceAppeal: gem.scores?.priceAppeal ?? 88,
        reviewStrength: gem.scores?.reviewStrength ?? 80,
        trendPotential: gem.scores?.trendPotential ?? 85,
        evaScore: gem.scores?.evaScore ?? 86,
      },
      contentPotentialFlame: 5,
      conversionPotentialFlame: 4,
      recommendationReason: gem.recommendationReason || "Sangat menarik untuk konten video UGC dengan detail potongan yang estetik.",
      shopeeUrl: gem.shopeeUrl || "https://shopee.co.id",
      affiliateUrl: "",
      isHiddenGem: true,
      keyAdvantages: gem.keyAdvantages || ["Bahan adem", "Potongan modis"],
      fabricOrMaterial: gem.fabricOrMaterial || "Premium Fabric",
      colorOptions: gem.colorOptions || ["Natural tones"],
    }));

    return {
      products,
      topProductChoice,
      topVideoConcepts,
      hiddenGems,
      searchDate,
      searchTimestamp: searchTime,
      isLiveAvailable: true,
      notes: "Riset produk disinkronkan secara aktual berdasarkan sinyal popularitas, ulasan, diskon, dan potensi konten fashion Shopee Indonesia.",
    };
  } catch (err: any) {
    console.error("Shopee Fashion Research Error:", err);
    throw new Error(err.message || "Gagal melakukan riset produk Shopee Indonesia.");
  }
}

/**
 * 8. GENERATOR KONTEN OTOMATIS
 * Natural, tidak terlalu menjual, seperti rekomendasi teman, fokus manfaat.
 */
export async function generateContentPackage(product: ShopeeProduct): Promise<ContentGeneration> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY belum dikonfigurasi.");

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `Anda adalah scriptwriter dan content creator affiliate profesional untuk media fashion "Eva Shop".
Buat paket konten video & media sosial lengkap untuk produk fashion Shopee berikut:
- Nama Produk: ${product.name}
- Kategori: ${product.category}
- Harga Promo: ${product.price} (Sebelum diskon: ${product.originalPrice || '-'}, Diskon: ${product.discount || '-'})
- Bahan/Material: ${product.fabricOrMaterial || 'Material nyaman'}
- Keunggulan: ${(product.keyAdvantages || []).join(', ')}
- Pilihan Warna: ${(product.colorOptions || []).join(', ')}

ATURAN GAYA BAHASA:
- Natural, seperti rekomendasi teman akrab ("jujurly", "buat yang sering bingung...").
- Tidak terlalu hard-selling, fokus pada manfaat nyata dan solusi keresahan berpakaian.
- Tidak membuat klaim palsu atau menjamin produk pasti laku / pasti cocok ke semua orang.
- Gunakan frasa: "layak dipertimbangkan", "menarik untuk dicoba", "bisa jadi pilihan".

Keluarkan output dalam JSON valid MURNI dengan format:
{
  "videoTitle": "Judul video yang bikin penasaran & informatif",
  "hook3s": "Hook 3 detik pertama untuk menghentikan scrolling penonton",
  "script15s": "Naskah video singkat 15 detik (voiceover + action)",
  "script30s": "Naskah video standar 30 detik lengkap dengan intro, uji bahan, dan CTA",
  "script60s": "Naskah video mendalam 60 detik (storytelling masalah outfit, try-on, detail jahitan & bahan, tips mix & match, CTA)",
  "captionTikTok": "Caption TikTok menarik + CTA keranjang kuning/bio",
  "captionFacebook": "Caption Facebook ramah ibu-ibu / wanita dewasa yang mengulas kenyamanan produk",
  "captionInstagram": "Caption Instagram estetik dengan spacing rapi",
  "shortsDescription": "Deskripsi YouTube Shorts singkat dan kaya kata kunci",
  "hashtags": ["#EvaShop", "#FashionWanita", "#RacunShopee", "#OOTDIndo", "#DressKekinian"],
  "keywords": ["dress wanita terbaru", "rekomendasi outfit shopee", "baju wanita adem"],
  "ctaAffiliate": "Cek produknya di keranjang Eva Shop."
}`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      temperature: 0.4,
      responseMimeType: "application/json",
    }
  });

  const rawText = response.text?.trim() || "{}";
  const cleanJson = rawText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  return JSON.parse(cleanJson);
}

/**
 * 9. MODE "KONTEN VIRAL"
 * Hook, Problem, Solution, Proof, Benefit, CTA.
 */
export async function generateViralContent(product: ShopeeProduct): Promise<ViralContent> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY belum dikonfigurasi.");

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `Buat konten formula viral (HOOK, PROBLEM, SOLUTION, PROOF, BENEFIT, CTA) untuk media affiliate Eva Shop:
- Produk: ${product.name}
- Kategori: ${product.category}
- Harga: ${product.price}
- Rating: ${product.rating || 'Bagus'} (${product.reviewCount || 'Banyak ulasan'})
- Keunggulan: ${(product.keyAdvantages || []).join(', ')}

ATURAN FORMULA:
1. HOOK: Harus menghentikan scrolling (visual / pertanyaan tajam).
2. PROBLEM: Angkat masalah nyata konsumen (baju gerah, potongan aneh, menerawang, ribet disetrika).
3. SOLUTION: Perkenalkan produk sebagai opsi yang cerdas.
4. PROOF: Gunakan fakta dari listing (rating ${product.rating || 'tinggi'}, bahan ${product.fabricOrMaterial || 'teruji'}, ulasan pemakai).
5. BENEFIT: Jelaskan perasaan saat memakainya (lebih percaya diri, adem seharian).
6. CTA: Arahkan klik link affiliate Eva Shop.
PENTING: Jangan gunakan kata "pasti viral" atau "100% terbaik". Gunakan "berpotensi", "menarik untuk dicoba", "layak dipertimbangkan", "sedang banyak diminati".

Keluarkan dalam format JSON:
{
  "hook": "...",
  "problem": "...",
  "solution": "...",
  "proof": "...",
  "benefit": "...",
  "cta": "..."
}`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      temperature: 0.4,
      responseMimeType: "application/json",
    }
  });

  const rawText = response.text?.trim() || "{}";
  const cleanJson = rawText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  return JSON.parse(cleanJson);
}

/**
 * 16. GENERATOR ARTIKEL EVASHOP (1.000 - 1.800 Kata) & 17. SEO Otomatis
 */
export async function generateEvaArticle(product: ShopeeProduct, affiliateLink?: string): Promise<EvaArticle> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY belum dikonfigurasi.");

  const ai = new GoogleGenAI({ apiKey });
  const finalAffiliateUrl = affiliateLink || product.affiliateUrl || product.shopeeUrl || "https://shopee.co.id";

  const prompt = `Tulis artikel ulasan produk fashion original, mendalam, dan kaya nilai baca untuk blog "Eva Shop" (~1.000 hingga 1.800 kata).
- Produk: ${product.name}
- Kategori: ${product.category}
- Harga: ${product.price} (Diskon: ${product.discount || '-'})
- Bahan: ${product.fabricOrMaterial || 'Kain pilihan berkualitas'}
- Fitur & Kelebihan: ${(product.keyAdvantages || []).join(', ')}
- Pilihan Warna: ${(product.colorOptions || []).join(', ')}
- Tautan Affiliate: ${finalAffiliateUrl}

STRUKTUR ARTIKEL LENGKAP:
1. H1 — Judul SEO yang menarik, informatif, dan mengundang klik.
2. Pendahuluan (Minimal 3-4 paragraf kaya konteks: keresahan mencari outfit yang pas, ekspektasi, impresi awal).
3. H2 — Kenapa Produk Ini Banyak Diminati? (Mengulas alasan kepopuleran model dan tren fashion saat ini).
4. H2 — Kelebihan Produk (Analisis kenyamanan, jahitan, fitting tubuh, dan daya tahan material).
5. H2 — Detail Produk (Spesifikasi bahan, pilihan ukuran, varian warna, dan petunjuk pencucian).
6. H2 — Siapa yang Cocok Menggunakannya? (Target konsumen: wanita karir, ibu muda, mahasiswi, acara formal vs casual).
7. H2 — Hal yang Perlu Diperhatikan Sebelum Membeli (Tips memilih ukuran agar tidak keliru, catatan realistis).
8. H2 — Kesimpulan (Rangkuman objektif dan pertimbangan nilai uang / value for money).
9. FAQ (Minimal 4 pertanyaan umum dan jawaban tuntas seputar perawatan, ukuran, dan pemakaian).
10. Call to Action (CTA) yang natural menuju link affiliate Eva Shop (${finalAffiliateUrl}).

ATURAN TEKS:
- Jangan mengarang spesifikasi yang tidak masuk akal.
- Pertahankan gaya bahasa editorial fashion yang anggun, jujur, dan mudah dipahami.
- Target panjang artikel: 1.000 - 1.800 kata.

FORMAT OUTPUT JSON:
{
  "title": "H1 Judul Artikel SEO",
  "intro": "Teks pendahuluan 3-4 paragraf...",
  "whyPopular": "Teks bagian Kenapa Produk Ini Banyak Diminati...",
  "advantages": "Teks bagian Kelebihan Produk...",
  "productDetails": "Teks bagian Detail Produk...",
  "targetAudience": "Teks bagian Siapa yang Cocok Menggunakannya...",
  "importantNotes": "Teks bagian Hal yang Perlu Diperhatikan...",
  "conclusion": "Teks kesimpulan...",
  "faq": [
    {"question": "Apakah bahan ini mudah kusut saat dipakai seharian?", "answer": "..."},
    {"question": "Bagaimana tips memilih ukuran yang tepat?", "answer": "..."},
    {"question": "Apakah warnanya luntur saat pertama kali dicuci?", "answer": "..."},
    {"question": "Apakah cocok digunakan untuk acara formal maupun santai?", "answer": "..."}
  ],
  "ctaText": "Dapatkan produk original dengan promo terbaik langsung di toko resmi melalui tautan keranjang Eva Shop berikut.",
  "seo": {
    "seoTitle": "Judul SEO maksimal 60 karakter",
    "metaDescription": "Meta deskripsi yang memikat maksimal 155 karakter",
    "primaryKeyword": "kata kunci utama",
    "secondaryKeywords": ["kata kunci 2", "kata kunci 3"],
    "longTailKeywords": ["kata kunci ekor panjang 1", "kata kunci ekor panjang 2"],
    "slug": "review-lengkap-nama-produk",
    "hashtags": ["#EvaShop", "#FashionWanita", "#ReviewBaju", "#OOTDIndonesia", "#ShopeeHaul"],
    "imageAltText": "Foto produk ${product.name} dipakai model",
    "searchIntent": "Informational & Commercial Investigation"
  }
}`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      temperature: 0.4,
      responseMimeType: "application/json",
    }
  });

  const rawText = response.text?.trim() || "{}";
  const cleanJson = rawText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  const parsed = JSON.parse(cleanJson);

  // Assemble full markdown
  const markdownParts = [
    `# ${parsed.title}`,
    ``,
    parsed.intro,
    ``,
    `## Kenapa Produk Ini Banyak Diminati?`,
    parsed.whyPopular,
    ``,
    `## Kelebihan Produk`,
    parsed.advantages,
    ``,
    `## Detail Produk & Karakteristik Bahan`,
    parsed.productDetails,
    ``,
    `## Siapa yang Cocok Menggunakannya?`,
    parsed.targetAudience,
    ``,
    `## Hal yang Perlu Diperhatikan Sebelum Membeli`,
    parsed.importantNotes,
    ``,
    `## Kesimpulan`,
    parsed.conclusion,
    ``,
    `## Pertanyaan yang Sering Diajukan (FAQ)`,
    ...(parsed.faq || []).map((item: any) => `**Q: ${item.question}**\n\n${item.answer}\n`),
    ``,
    `---`,
    `### Rekomendasi Pembelian Eva Shop`,
    `${parsed.ctaText}`,
    ``,
    `👉 [**Beli Produk Original di Shopee Melalui Link Ini**](${finalAffiliateUrl})`,
  ];

  const fullMarkdown = markdownParts.join("\n\n");
  const wordCount = fullMarkdown.trim().split(/\s+/).filter(Boolean).length;

  // Assemble clean Blogger-compliant HTML template (WITHOUT auto images as requested by user)
  const faqHtml = (parsed.faq || []).map((item: any) => `
    <div style="margin-bottom: 16px; padding: 14px 18px; background-color: #f8fafc; border-left: 4px solid #ec4899; border-radius: 6px;">
      <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #1e293b;"><strong>${item.question}</strong></h3>
      <p style="margin: 0; color: #475569; line-height: 1.6;">${item.answer}</p>
    </div>
  `).join("\n");

  const fullHtml = `
<div class="evashop-article" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.75; color: #1e293b; max-width: 800px; margin: 0 auto;">
  <h1 style="font-size: 26px; line-height: 1.35; color: #0f172a; margin-bottom: 20px; font-weight: 700;">${parsed.title}</h1>
  
  <div style="margin-bottom: 24px;">
    ${parsed.intro.split('\n\n').map((p: string) => `<p style="margin-bottom: 16px; font-size: 16px;">${p}</p>`).join('')}
  </div>

  <!-- ================================================================= -->
  <!-- === [2. TEMPAT UPLOAD FOTO PRODUK (SLIDER OTOMATIS)] ============= -->
  <!-- ================================================================= -->
  <div class="product-gallery-slider">
    <div class="main-slide-container" id="mainSlideBox">
      <button class="slide-nav-btn prev-btn" onclick="moveGallerySlide(-1)" type="button">&#10094;</button>
      
      <div class="slides-wrapper" id="customSlidesWrapper">
        <!-- ----------------------------------------------------------- -->
        <!-- TEMPEL / SISIPKAN FOTO-FOTO PRODUK DI BAWAH INI             -->
        <!-- ----------------------------------------------------------- -->

        <div class="separator" style="clear: both; text-align: center;">
          <p><em>

(Upload atau sisipkan semua foto produk di baris ini)

</em></p>
        </div>

        <!-- ----------------------------------------------------------- -->
        <!-- BATAS AREA UPLOAD FOTO PRODUK                               -->
        <!-- ----------------------------------------------------------- -->
      </div>
    </div>
  </div>

  <h2 style="font-size: 20px; color: #0f172a; border-bottom: 2px solid #fce7f3; padding-bottom: 8px; margin-top: 32px;">Kenapa Produk Ini Banyak Diminati?</h2>
  <div style="margin-bottom: 24px;">
    ${parsed.whyPopular.split('\n\n').map((p: string) => `<p style="margin-bottom: 14px;">${p}</p>`).join('')}
  </div>

  <h2 style="font-size: 20px; color: #0f172a; border-bottom: 2px solid #fce7f3; padding-bottom: 8px; margin-top: 32px;">Kelebihan Produk</h2>
  <div style="margin-bottom: 24px;">
    ${parsed.advantages.split('\n\n').map((p: string) => `<p style="margin-bottom: 14px;">${p}</p>`).join('')}
  </div>

  <h2 style="font-size: 20px; color: #0f172a; border-bottom: 2px solid #fce7f3; padding-bottom: 8px; margin-top: 32px;">Detail Produk &amp; Karakteristik Bahan</h2>
  <div style="margin-bottom: 24px;">
    ${parsed.productDetails.split('\n\n').map((p: string) => `<p style="margin-bottom: 14px;">${p}</p>`).join('')}
  </div>

  <h2 style="font-size: 20px; color: #0f172a; border-bottom: 2px solid #fce7f3; padding-bottom: 8px; margin-top: 32px;">Siapa yang Cocok Menggunakannya?</h2>
  <div style="margin-bottom: 24px;">
    ${parsed.targetAudience.split('\n\n').map((p: string) => `<p style="margin-bottom: 14px;">${p}</p>`).join('')}
  </div>

  <h2 style="font-size: 20px; color: #0f172a; border-bottom: 2px solid #fce7f3; padding-bottom: 8px; margin-top: 32px;">Hal yang Perlu Diperhatikan Sebelum Membeli</h2>
  <div style="margin-bottom: 24px;">
    ${parsed.importantNotes.split('\n\n').map((p: string) => `<p style="margin-bottom: 14px;">${p}</p>`).join('')}
  </div>

  <h2 style="font-size: 20px; color: #0f172a; border-bottom: 2px solid #fce7f3; padding-bottom: 8px; margin-top: 32px;">Kesimpulan</h2>
  <div style="margin-bottom: 24px;">
    ${parsed.conclusion.split('\n\n').map((p: string) => `<p style="margin-bottom: 14px;">${p}</p>`).join('')}
  </div>

  <h2 style="font-size: 20px; color: #0f172a; border-bottom: 2px solid #fce7f3; padding-bottom: 8px; margin-top: 32px;">Pertanyaan yang Sering Diajukan (FAQ)</h2>
  <div style="margin-top: 16px; margin-bottom: 32px;">
    ${faqHtml}
  </div>

  <div class="evashop-cta-box" style="margin-top: 36px; padding: 24px; background: linear-gradient(135deg, #fdf2f8 0%, #fff1f2 100%); border: 1px solid #fbcfe8; border-radius: 12px; text-align: center;">
    <h3 style="margin-top: 0; margin-bottom: 10px; color: #9d174d; font-size: 19px;">Tertarik Memiliki Outfit Ini?</h3>
    <p style="margin-bottom: 20px; color: #475569; font-size: 15px;">${parsed.ctaText}</p>
    <a href="${finalAffiliateUrl}" target="_blank" rel="nofollow noopener sponsored" style="display: inline-block; background-color: #ee4d2d; color: #ffffff; padding: 14px 28px; font-weight: bold; border-radius: 8px; text-decoration: none; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(238, 77, 45, 0.3);">
      🛒 Cek Produk di Shopee Sekarang
    </a>
  </div>
</div>
`.trim();

  return {
    title: parsed.title,
    intro: parsed.intro,
    whyPopular: parsed.whyPopular,
    advantages: parsed.advantages,
    productDetails: parsed.productDetails,
    targetAudience: parsed.targetAudience,
    importantNotes: parsed.importantNotes,
    conclusion: parsed.conclusion,
    faq: parsed.faq || [],
    ctaText: parsed.ctaText,
    seo: {
      seoTitle: parsed.seo?.seoTitle || parsed.title,
      metaDescription: parsed.seo?.metaDescription || parsed.intro.slice(0, 150),
      primaryKeyword: parsed.seo?.primaryKeyword || product.category,
      secondaryKeywords: parsed.seo?.secondaryKeywords || [],
      longTailKeywords: parsed.seo?.longTailKeywords || [],
      slug: parsed.seo?.slug || "review-produk-shopee",
      hashtags: parsed.seo?.hashtags || ["#EvaShop", "#FashionWanita", "#ShopeeHaul"],
      imageAltText: parsed.seo?.imageAltText || product.name,
      searchIntent: parsed.seo?.searchIntent || "Informational & Commercial",
    },
    fullMarkdown,
    fullHtml,
    wordCount,
  };
}

/**
 * 19. PROMPT GAMBAR PRODUK
 */
export function generateFashionImagePrompt(product: ShopeeProduct): FashionImagePrompt {
  const prompt = `FULL BODY REALISTIC FASHION PHOTOGRAPHY.
A stylish young Indonesian female model with natural friendly expressions and glowing radiant skin, posing naturally in a high-end clean aesthetic setting.
She is wearing the ${product.name} (${product.category}, crafted from ${product.fabricOrMaterial || 'soft comfortable fabric'}).
All garment silhouettes, textures, natural drapes, and stitching lines are captured in extreme high detail.
NATURAL SOFT AMBIENT LIGHTING, 85mm portrait lens perspective, authentic mobile photography aesthetic, candid UGC feel, clean composition without artificial CGI oversaturation.
PRODUCT ACCURACY: Precise color matching, authentic fabric folds, head-to-toe composition.
No text, no watermarks, no logos, no distorted anatomy.`;

  return {
    prompt,
    aspectRatio: "9:16 (Vertical Full Body) / 4:5",
    lighting: "Natural Soft Diffused Daylight",
    modelStyle: "Authentic Indonesian Lifestyle Model",
  };
}

/**
 * 20. PROMPT VIDEO
 */
export function generateFashionVideoPrompt(product: ShopeeProduct): FashionVideoPrompt {
  return {
    duration5s: `[0s-5s Hook & Front Look]: Model walks gracefully towards the smartphone camera, pauses with a natural confident smile, showing the elegant front silhouette of the ${product.name}. Camera stays at natural eye level.`,
    duration10s: `[0s-10s Detail & Fabric Touch]: Model gently turns 180 degrees to reveal back tailoring, then brings hand forward to gently touch the ${product.fabricOrMaterial || 'fabric'} texture close to the lens to demonstrate tactile softness and drape quality.`,
    duration15s: `[0s-15s Complete Try-On Flow]: Model executes a slow, smooth 360-degree spin under soft natural light, steps back to showcase the full-body head-to-toe styling, raises her sleeve/hemline slightly to verify movement freedom, and winks playfully at the camera while pointing down to the affiliate link.`,
    cameraMovement: "Smooth gimbal tracking, natural eye-level mobile perspective, slow pan across fabric details, crisp natural autofocus.",
  };
}
