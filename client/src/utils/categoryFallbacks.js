/**
 * Category & Course Fallback Image System
 * Provides elegant, ultra-crisp vector illustrations matching the atelier couture aesthetic.
 * Guarantees that cards NEVER show broken image icons, even if external URLs are 404 or missing.
 */

// SVG Generator Helper
const createSvgCard = (titleFr, titleAr, topSketchesSvg, bottomSketchesSvg, isArabic = false) => {
  const displayTitle = isArabic ? titleAr : titleFr;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="100%" height="100%">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#faf8f5" />
        <stop offset="50%" stop-color="#f5f2eb" />
        <stop offset="100%" stop-color="#ece7dc" />
      </linearGradient>
      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(0,0,0,0.02)" stroke-width="1"/>
      </pattern>
      <style>
        .sketch-line { stroke: #2b2823; stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; fill: none; }
        .sketch-fill { fill: rgba(255, 255, 255, 0.45); stroke: #2b2823; stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; }
        .sketch-dashed { stroke: #2b2823; stroke-width: 1.3; stroke-dasharray: 4,4; fill: none; }
        .accent-dashed { stroke: #1e1b18; stroke-width: 2.2; stroke-dasharray: 7,5; }
        .title-text { font-family: 'Tajawal', 'Cairo', 'Playfair Display', Georgia, serif; font-size: 32px; font-weight: 700; fill: #1c1917; text-anchor: middle; letter-spacing: 1px; }
      </style>
    </defs>

    <!-- Background -->
    <rect width="600" height="400" fill="url(#bgGrad)" />
    <rect width="600" height="400" fill="url(#grid)" />

    <!-- Outer frame -->
    <rect x="8" y="8" width="584" height="384" fill="none" stroke="rgba(212,175,55,0.25)" stroke-width="1.5" rx="10" />

    <!-- Top sketches -->
    <g transform="translate(0, 5)">
      ${topSketchesSvg}
    </g>

    <!-- Center Divider Line 1 -->
    <line x1="30" y1="168" x2="570" y2="168" class="accent-dashed" />

    <!-- Center Category Title -->
    <text x="300" y="206" class="title-text">${displayTitle}</text>

    <!-- Center Divider Line 2 -->
    <line x1="30" y1="225" x2="570" y2="225" class="accent-dashed" />

    <!-- Bottom sketches -->
    <g transform="translate(0, 10)">
      ${bottomSketchesSvg}
    </g>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

// 1. Les Jupes (Skirts)
const svgJupes = (isAr) => createSvgCard(
  'les jupes',
  'التنانير',
  `
    <!-- Jupe Droite (Pencil) -->
    <g transform="translate(80, 25)">
      <path d="M 15 10 L 65 10 L 60 115 L 20 115 Z" class="sketch-fill" />
      <path d="M 15 10 Q 40 16 65 10" class="sketch-line" />
      <line x1="40" y1="13" x2="40" y2="115" class="sketch-dashed" />
      <line x1="28" y1="10" x2="28" y2="35" class="sketch-line" />
      <line x1="52" y1="10" x2="52" y2="35" class="sketch-line" />
    </g>
    <!-- Jupe Évasée (A-Line) -->
    <g transform="translate(255, 20)">
      <path d="M 25 15 L 65 15 L 85 120 L 5 120 Z" class="sketch-fill" />
      <path d="M 25 15 Q 45 20 65 15" class="sketch-line" />
      <path d="M 5 120 Q 45 130 85 120" class="sketch-line" />
      <line x1="45" y1="18" x2="45" y2="123" class="sketch-dashed" />
    </g>
    <!-- Jupe Plissée (Pleated) -->
    <g transform="translate(435, 20)">
      <path d="M 20 15 L 70 15 L 85 120 L 5 120 Z" class="sketch-fill" />
      <line x1="28" y1="15" x2="20" y2="120" class="sketch-line" />
      <line x1="38" y1="15" x2="35" y2="120" class="sketch-line" />
      <line x1="48" y1="15" x2="52" y2="120" class="sketch-line" />
      <line x1="58" y1="15" x2="68" y2="120" class="sketch-line" />
    </g>
  `,
  `
    <!-- Jupe Cloche (Circle Skirt) -->
    <g transform="translate(130, 235)">
      <path d="M 40 10 L 80 10 L 115 115 L 5 115 Z" class="sketch-fill" />
      <path d="M 5 115 Q 25 105 45 115 Q 65 125 85 115 Q 105 105 115 115" class="sketch-line" />
      <path d="M 40 10 Q 60 16 80 10" class="sketch-line" />
      <line x1="60" y1="14" x2="60" y2="117" class="sketch-dashed" />
    </g>
    <!-- Jupe à Godets / Panneaux -->
    <g transform="translate(360, 235)">
      <path d="M 30 10 L 80 10 L 105 115 L 5 115 Z" class="sketch-fill" />
      <path d="M 30 10 L 35 115" class="sketch-line" />
      <path d="M 55 10 L 55 115" class="sketch-line" />
      <path d="M 80 10 L 75 115" class="sketch-line" />
      <path d="M 45 65 L 35 115" class="sketch-dashed" />
      <path d="M 65 65 L 75 115" class="sketch-dashed" />
    </g>
  `,
  isAr
);

// 2. Les Poches (Pockets)
const svgPoches = (isAr) => createSvgCard(
  'les poches',
  'الجيوب',
  `
    <!-- Poche Plaquée (Patch pocket) -->
    <g transform="translate(90, 25)">
      <path d="M 15 15 L 75 15 L 75 80 L 45 105 L 15 80 Z" class="sketch-fill" />
      <path d="M 15 35 L 75 35" class="sketch-line" />
      <path d="M 22 22 L 68 22 L 68 76 L 45 96 L 22 76 Z" class="sketch-dashed" />
    </g>
    <!-- Poche Italienne (Slant pocket) -->
    <g transform="translate(260, 25)">
      <rect x="15" y="15" width="70" height="90" rx="4" class="sketch-fill" />
      <path d="M 15 15 L 70 70" class="sketch-line" />
      <path d="M 15 22 L 63 70" class="sketch-dashed" />
      <path d="M 70 70 L 70 105 L 15 105 Z" class="sketch-fill" opacity="0.6" />
    </g>
    <!-- Poche à Rabats (Flap pocket) -->
    <g transform="translate(425, 30)">
      <path d="M 10 25 L 80 25 L 80 48 L 45 62 L 10 48 Z" class="sketch-fill" />
      <line x1="8" y1="25" x2="82" y2="25" class="sketch-line" stroke-width="2.2" />
      <circle cx="45" cy="42" r="3.5" class="sketch-line" fill="#2b2823" />
      <path d="M 18 50 L 18 95 L 72 95 L 72 50" class="sketch-dashed" />
    </g>
  `,
  `
    <!-- Poche Passepoilée (Welt Pocket) -->
    <g transform="translate(130, 245)">
      <rect x="10" y="25" width="100" height="18" rx="2" class="sketch-fill" />
      <line x1="5" y1="34" x2="115" y2="34" class="sketch-line" stroke-width="1.8" />
      <rect x="13" y="28" width="94" height="12" class="sketch-dashed" />
      <path d="M 20 43 L 20 90 L 100 90 L 100 43" class="sketch-dashed" />
    </g>
    <!-- Poche Poitrine / Jeans -->
    <g transform="translate(365, 235)">
      <path d="M 15 15 L 85 15 L 85 75 L 50 100 L 15 75 Z" class="sketch-fill" />
      <path d="M 22 45 Q 50 70 78 45" class="sketch-line" />
      <path d="M 22 52 Q 50 77 78 52" class="sketch-dashed" />
      <line x1="15" y1="28" x2="85" y2="28" class="sketch-line" />
    </g>
  `,
  isAr
);

// 3. Les Fermetures (Zippers)
const svgFermetures = (isAr) => createSvgCard(
  'les fermetures',
  'أنواع السحاب',
  `
    <!-- Fermeture à glissière classique -->
    <g transform="translate(95, 20)">
      <rect x="25" y="10" width="40" height="110" class="sketch-fill" rx="3" />
      <line x1="45" y1="10" x2="45" y2="120" class="sketch-line" stroke-width="2" />
      <!-- Teeth -->
      <line x1="37" y1="20" x2="53" y2="20" class="sketch-line" />
      <line x1="37" y1="35" x2="53" y2="35" class="sketch-line" />
      <line x1="37" y1="50" x2="53" y2="50" class="sketch-line" />
      <line x1="37" y1="65" x2="53" y2="65" class="sketch-line" />
      <line x1="37" y1="80" x2="53" y2="80" class="sketch-line" />
      <line x1="37" y1="95" x2="53" y2="95" class="sketch-line" />
      <line x1="37" y1="110" x2="53" y2="110" class="sketch-line" />
      <!-- Slider -->
      <path d="M 38 40 L 52 40 L 48 56 L 42 56 Z" fill="#2b2823" />
      <rect x="43" y="56" width="4" height="15" rx="1.5" fill="#2b2823" />
    </g>
    <!-- Braguette pantalon (Fly zip) -->
    <g transform="translate(260, 20)">
      <path d="M 20 10 L 70 10 L 70 40 Q 65 105 20 115" class="sketch-fill" />
      <path d="M 25 15 L 65 15 L 65 40 Q 60 98 25 105" class="sketch-dashed" />
      <line x1="20" y1="10" x2="20" y2="115" class="sketch-line" stroke-width="2" />
      <circle cx="45" cy="28" r="4" class="sketch-fill" />
    </g>
    <!-- Fermeture Invisible -->
    <g transform="translate(435, 20)">
      <rect x="25" y="10" width="35" height="110" fill="rgba(255,255,255,0.6)" stroke="#2b2823" stroke-width="1.2" />
      <line x1="42" y1="10" x2="42" y2="120" class="sketch-line" stroke-width="1.8" />
      <path d="M 38 30 L 47 30 L 45 42 L 40 42 Z" fill="#2b2823" />
      <path d="M 42 42 L 42 55" class="sketch-line" stroke-width="2.5" />
      <line x1="29" y1="10" x2="29" y2="120" class="sketch-dashed" />
      <line x1="56" y1="10" x2="56" y2="120" class="sketch-dashed" />
    </g>
  `,
  `
    <!-- Fermeture Séparable (Jacket Zip) -->
    <g transform="translate(130, 235)">
      <line x1="30" y1="15" x2="30" y2="115" class="sketch-line" stroke-width="2" />
      <line x1="70" y1="15" x2="70" y2="115" class="sketch-line" stroke-width="2" />
      <line x1="30" y1="25" x2="45" y2="35" class="sketch-line" />
      <line x1="30" y1="45" x2="45" y2="55" class="sketch-line" />
      <line x1="70" y1="25" x2="55" y2="35" class="sketch-line" />
      <line x1="70" y1="45" x2="55" y2="55" class="sketch-line" />
      <rect x="42" y="70" width="16" height="25" rx="3" fill="#2b2823" />
      <rect x="47" y="95" width="6" height="18" rx="2" fill="#2b2823" />
    </g>
    <!-- Boutons & Boutonnière -->
    <g transform="translate(370, 240)">
      <rect x="25" y="10" width="40" height="100" class="sketch-fill" />
      <circle cx="45" cy="30" r="7" class="sketch-fill" />
      <circle cx="45" cy="30" r="1.5" fill="#2b2823" />
      <circle cx="45" cy="65" r="7" class="sketch-fill" />
      <circle cx="45" cy="65" r="1.5" fill="#2b2823" />
      <circle cx="45" cy="100" r="7" class="sketch-fill" />
      <circle cx="45" cy="100" r="1.5" fill="#2b2823" />
      <line x1="28" y1="10" x2="28" y2="110" class="sketch-dashed" />
    </g>
  `,
  isAr
);

// 4. La Ceinture (Belts & Waistbands)
const svgCeinture = (isAr) => createSvgCard(
  'la ceinture',
  'الحزام',
  `
    <!-- Ceinture Droite Classique -->
    <g transform="translate(60, 35)">
      <rect x="15" y="25" width="180" height="35" rx="4" class="sketch-fill" />
      <rect x="20" y="30" width="170" height="25" class="sketch-dashed" />
      <circle cx="165" cy="42" r="3.5" class="sketch-line" fill="#2b2823" />
      <circle cx="145" cy="42" r="3.5" class="sketch-line" fill="#2b2823" />
    </g>
    <!-- Boucle de ceinture (Buckle) -->
    <g transform="translate(340, 25)">
      <rect x="20" y="15" width="60" height="50" rx="8" class="sketch-fill" stroke-width="2.5" />
      <rect x="32" y="27" width="36" height="26" rx="4" class="sketch-line" />
      <line x1="50" y1="15" x2="50" y2="65" class="sketch-line" stroke-width="3" />
      <path d="M 80 25 L 170 25 L 170 55 L 80 55" class="sketch-fill" />
    </g>
  `,
  `
    <!-- Ceinture en Forme (Contoured Waistband) -->
    <g transform="translate(70, 240)">
      <path d="M 15 55 Q 100 20 185 55 L 180 85 Q 100 50 20 85 Z" class="sketch-fill" />
      <path d="M 22 62 Q 100 32 178 62" class="sketch-dashed" />
    </g>
    <!-- Ceinture avec Passants (Loops) -->
    <g transform="translate(330, 245)">
      <rect x="15" y="20" width="180" height="40" class="sketch-fill" />
      <rect x="45" y="10" width="12" height="60" rx="2" class="sketch-fill" />
      <rect x="110" y="10" width="12" height="60" rx="2" class="sketch-fill" />
      <line x1="18" y1="26" x2="190" y2="26" class="sketch-dashed" />
      <line x1="18" y1="54" x2="190" y2="54" class="sketch-dashed" />
    </g>
  `,
  isAr
);

// 5. Les Robes (Dresses)
const svgRobes = (isAr) => createSvgCard(
  'les robes',
  'الفساتين',
  `
    <!-- Robe Fourreau (Sheath dress) -->
    <g transform="translate(90, 15)">
      <path d="M 25 15 L 65 15 L 75 45 L 65 70 L 70 120 L 20 120 L 25 70 L 15 45 Z" class="sketch-fill" />
      <path d="M 35 15 Q 45 30 55 15" class="sketch-line" />
      <line x1="45" y1="30" x2="45" y2="120" class="sketch-dashed" />
    </g>
    <!-- Robe Trapèze / Évasée -->
    <g transform="translate(260, 15)">
      <path d="M 25 15 L 65 15 L 75 45 L 95 120 L 5 120 L 15 45 Z" class="sketch-fill" />
      <path d="M 30 15 Q 45 25 60 15" class="sketch-line" />
      <line x1="25" y1="70" x2="65" y2="70" class="sketch-dashed" />
    </g>
    <!-- Robe Chemisier (Shirt Dress) -->
    <g transform="translate(425, 15)">
      <path d="M 25 15 L 65 15 L 75 45 L 80 120 L 10 120 L 15 45 Z" class="sketch-fill" />
      <!-- Collar -->
      <path d="M 30 15 L 45 28 L 60 15" class="sketch-line" />
      <!-- Buttons -->
      <line x1="45" y1="28" x2="45" y2="120" class="sketch-line" />
      <circle cx="45" cy="40" r="2" fill="#2b2823" />
      <circle cx="45" cy="60" r="2" fill="#2b2823" />
      <circle cx="45" cy="80" r="2" fill="#2b2823" />
      <rect x="25" y="66" width="40" height="7" fill="#2b2823" rx="1" />
    </g>
  `,
  `
    <!-- Robe Portefeuille (Wrap dress) -->
    <g transform="translate(130, 235)">
      <path d="M 25 15 L 65 15 L 75 45 L 85 115 L 10 115 L 15 45 Z" class="sketch-fill" />
      <path d="M 25 15 L 65 65" class="sketch-line" stroke-width="2" />
      <path d="M 65 15 L 25 65" class="sketch-line" stroke-width="2" />
      <line x1="65" y1="65" x2="45" y2="115" class="sketch-dashed" />
    </g>
    <!-- Robe Empire / Soirée -->
    <g transform="translate(370, 235)">
      <path d="M 25 15 L 65 15 L 72 40 L 95 115 L 5 115 L 18 40 Z" class="sketch-fill" />
      <line x1="20" y1="45" x2="70" y2="45" class="sketch-line" stroke-width="2.2" />
      <path d="M 30 15 Q 45 28 60 15" class="sketch-line" />
      <line x1="45" y1="45" x2="35" y2="115" class="sketch-dashed" />
      <line x1="45" y1="45" x2="55" y2="115" class="sketch-dashed" />
    </g>
  `,
  isAr
);

// 6. Les Corsages (Bodices & Darts)
const svgCorsages = (isAr) => createSvgCard(
  'les corsages',
  'الكورساج',
  `
    <g transform="translate(90, 20)">
      <path d="M 20 15 L 60 15 L 75 45 L 70 110 L 20 110 L 15 45 Z" class="sketch-fill" />
      <path d="M 20 15 Q 35 30 60 15" class="sketch-line" />
      <path d="M 75 45 L 50 65 L 72 75" class="sketch-dashed" />
      <line x1="40" y1="75" x2="40" y2="110" class="sketch-dashed" />
    </g>
    <g transform="translate(260, 20)">
      <path d="M 15 15 L 55 15 L 70 45 L 65 110 L 15 110 Z" class="sketch-fill" />
      <path d="M 55 15 L 40 55 L 45 15" class="sketch-dashed" />
      <line x1="38" y1="75" x2="38" y2="110" class="sketch-dashed" />
    </g>
    <g transform="translate(425, 20)">
      <path d="M 15 15 L 65 15 L 75 45 L 70 110 L 20 110 Z" class="sketch-fill" />
      <path d="M 20 15 L 45 55 L 25 35" class="sketch-dashed" />
    </g>
  `,
  `
    <g transform="translate(140, 235)">
      <path d="M 20 15 L 80 15 L 90 60 L 80 115 L 15 115 Z" class="sketch-fill" />
      <line x1="15" y1="15" x2="15" y2="115" class="sketch-line" stroke-width="2.5" />
      <line x1="50" y1="15" x2="50" y2="115" class="sketch-dashed" />
    </g>
    <g transform="translate(370, 235)">
      <path d="M 20 15 L 75 15 L 85 55 L 75 115 L 15 115 Z" class="sketch-fill" />
      <path d="M 45 60 L 80 85" class="sketch-line" stroke-width="1.8" />
      <path d="M 45 60 L 45 115" class="sketch-line" stroke-width="1.8" />
    </g>
  `,
  isAr
);

// 7. Les Cols (Collars)
const svgCols = (isAr) => createSvgCard(
  'les cols',
  'الياقات',
  `
    <!-- Col Claudine (Peter Pan) -->
    <g transform="translate(90, 25)">
      <path d="M 15 35 Q 45 65 75 35 Q 45 10 15 35" class="sketch-fill" />
      <circle cx="45" cy="35" r="10" class="sketch-line" />
    </g>
    <!-- Col Chemisier avec pied (Shirt Collar) -->
    <g transform="translate(255, 20)">
      <path d="M 10 35 L 30 15 L 65 15 L 85 35 L 75 48 L 20 48 Z" class="sketch-fill" />
      <path d="M 20 48 L 75 48 L 75 62 L 20 62 Z" class="sketch-fill" />
      <circle cx="48" cy="55" r="2" fill="#2b2823" />
    </g>
    <!-- Col Officier (Mandarin) -->
    <g transform="translate(425, 25)">
      <path d="M 15 30 Q 50 15 85 30 L 85 45 Q 50 30 15 45 Z" class="sketch-fill" />
      <circle cx="75" cy="38" r="2" fill="#2b2823" />
    </g>
  `,
  `
    <!-- Col Châle (Shawl Collar) -->
    <g transform="translate(130, 235)">
      <path d="M 20 15 Q 55 45 75 115 L 35 115 Q 15 50 20 15" class="sketch-fill" />
      <path d="M 80 15 Q 45 45 25 115 L 65 115 Q 85 50 80 15" class="sketch-fill" />
    </g>
    <!-- Col Tailleur (Notched Lapel) -->
    <g transform="translate(370, 235)">
      <path d="M 20 15 L 50 15 L 45 45 L 65 50 L 50 115 L 25 115 Z" class="sketch-fill" />
      <path d="M 80 15 L 50 15 L 55 45 L 35 50 L 50 115 L 75 115 Z" class="sketch-fill" />
    </g>
  `,
  isAr
);

// 8. Les Manches (Sleeves)
const svgManches = (isAr) => createSvgCard(
  'les manches',
  'الأكمام',
  `
    <!-- Manche Ballon (Puff Sleeve) -->
    <g transform="translate(90, 20)">
      <path d="M 25 15 Q 50 5 75 15 Q 90 50 70 85 L 30 85 Q 10 50 25 15 Z" class="sketch-fill" />
      <line x1="30" y1="85" x2="70" y2="85" class="sketch-line" stroke-width="3" />
    </g>
    <!-- Manche Simple Droite -->
    <g transform="translate(260, 15)">
      <path d="M 25 20 Q 50 5 75 20 L 65 115 L 35 115 Z" class="sketch-fill" />
      <line x1="50" y1="12" x2="50" y2="115" class="sketch-dashed" />
    </g>
    <!-- Manche Gigot (Leg-of-mutton) -->
    <g transform="translate(425, 15)">
      <path d="M 25 20 Q 50 5 75 20 Q 95 45 65 70 L 60 115 L 40 115 L 35 70 Q 5 45 25 20 Z" class="sketch-fill" />
    </g>
  `,
  `
    <!-- Manche Papillon / Évasée -->
    <g transform="translate(130, 235)">
      <path d="M 30 15 Q 55 5 80 15 L 105 95 L 5 95 Z" class="sketch-fill" />
      <path d="M 5 95 Q 55 110 105 95" class="sketch-line" />
    </g>
    <!-- Manche Chemisier avec Poignet (Cuff) -->
    <g transform="translate(370, 235)">
      <path d="M 25 15 Q 50 5 75 15 L 70 95 L 30 95 Z" class="sketch-fill" />
      <rect x="25" y="95" width="50" height="15" rx="2" class="sketch-fill" />
      <circle cx="62" cy="102" r="2" fill="#2b2823" />
    </g>
  `,
  isAr
);

// 9. Les Chemises (Shirts)
const svgChemises = (isAr) => createSvgCard(
  'les chemises',
  'القمصان',
  `
    <!-- Chemise Homme Classique -->
    <g transform="translate(100, 20)">
      <path d="M 20 15 L 60 15 L 75 40 L 65 115 L 15 115 L 5 40 Z" class="sketch-fill" />
      <path d="M 25 15 L 40 28 L 55 15" class="sketch-line" />
      <line x1="40" y1="28" x2="40" y2="115" class="sketch-line" />
      <rect x="15" y="45" width="18" height="22" class="sketch-dashed" />
    </g>
    <!-- Chemisier Femme -->
    <g transform="translate(410, 20)">
      <path d="M 20 15 L 60 15 L 75 40 L 62 115 L 18 115 L 5 40 Z" class="sketch-fill" />
      <path d="M 25 15 Q 40 30 55 15" class="sketch-line" />
      <path d="M 20 35 Q 40 50 60 35" class="sketch-dashed" />
    </g>
  `,
  `
    <!-- Dos de Chemise avec Empiècement (Yoke) -->
    <g transform="translate(130, 235)">
      <path d="M 20 15 L 60 15 L 75 40 L 65 115 L 15 115 L 5 40 Z" class="sketch-fill" />
      <line x1="12" y1="40" x2="68" y2="40" class="sketch-line" stroke-width="2" />
      <line x1="40" y1="40" x2="40" y2="70" class="sketch-line" />
    </g>
    <!-- Col & Poignets Détails -->
    <g transform="translate(370, 235)">
      <rect x="15" y="25" width="60" height="20" rx="3" class="sketch-fill" />
      <circle cx="55" cy="35" r="2" fill="#2b2823" />
      <rect x="15" y="60" width="60" height="20" rx="3" class="sketch-fill" />
      <circle cx="55" cy="70" r="2" fill="#2b2823" />
    </g>
  `,
  isAr
);

// 10. Les Pantalons (Pants)
const svgPantalons = (isAr) => createSvgCard(
  'les pantalons',
  'السراويل',
  `
    <!-- Pantalon Droit -->
    <g transform="translate(90, 20)">
      <path d="M 15 15 L 65 15 L 70 120 L 48 120 L 40 60 L 32 120 L 10 120 Z" class="sketch-fill" />
      <line x1="25" y1="15" x2="25" y2="120" class="sketch-dashed" />
      <line x1="55" y1="15" x2="55" y2="120" class="sketch-dashed" />
    </g>
    <!-- Pantalon Large / Palazzo -->
    <g transform="translate(260, 20)">
      <path d="M 15 15 L 65 15 L 80 120 L 48 120 L 40 55 L 32 120 L 0 120 Z" class="sketch-fill" />
      <line x1="40" y1="15" x2="40" y2="55" class="sketch-line" />
    </g>
    <!-- Short -->
    <g transform="translate(435, 25)">
      <path d="M 15 15 L 65 15 L 70 70 L 46 70 L 40 45 L 34 70 L 10 70 Z" class="sketch-fill" />
      <line x1="40" y1="15" x2="40" y2="45" class="sketch-line" />
      <rect x="15" y="15" width="50" height="8" class="sketch-fill" />
    </g>
  `,
  `
    <!-- Pantalon Carotte / Cigarette -->
    <g transform="translate(130, 235)">
      <path d="M 15 15 L 65 15 L 60 115 L 45 115 L 40 60 L 35 115 L 20 115 Z" class="sketch-fill" />
      <line x1="40" y1="15" x2="40" y2="60" class="sketch-line" />
    </g>
    <!-- Caleçon / Leggings -->
    <g transform="translate(370, 235)">
      <path d="M 20 15 L 60 15 L 52 115 L 44 115 L 40 55 L 36 115 L 28 115 Z" class="sketch-fill" />
      <path d="M 20 15 Q 40 20 60 15" class="sketch-dashed" />
    </g>
  `,
  isAr
);

// 11. Matériel de Couture (Sewing Tools)
const svgMateriel = (isAr) => createSvgCard(
  'le matériel',
  'أدوات الخياطة',
  `
    <!-- Ciseaux de couture (Shears) -->
    <g transform="translate(90, 20)">
      <circle cx="25" cy="30" r="12" class="sketch-line" stroke-width="2.2" />
      <circle cx="25" cy="70" r="12" class="sketch-line" stroke-width="2.2" />
      <path d="M 35 35 L 85 65" class="sketch-line" stroke-width="2.5" />
      <path d="M 35 65 L 85 35" class="sketch-line" stroke-width="2.5" />
      <circle cx="50" cy="50" r="3" fill="#2b2823" />
    </g>
    <!-- Machine à Coudre -->
    <g transform="translate(250, 15)">
      <rect x="10" y="70" width="90" height="15" rx="3" class="sketch-fill" />
      <path d="M 20 70 L 20 20 L 75 20 L 75 45 L 60 45 L 60 60" class="sketch-line" stroke-width="2.2" fill="none" />
      <line x1="60" y1="60" x2="60" y2="70" class="sketch-line" stroke-width="2" />
      <circle cx="75" cy="32" r="8" class="sketch-line" />
    </g>
    <!-- Mètre ruban (Tape measure) -->
    <g transform="translate(430, 25)">
      <path d="M 15 60 Q 30 10 50 40 Q 70 70 85 20" class="sketch-line" stroke-width="6" stroke="#2b2823" fill="none" />
      <path d="M 15 60 Q 30 10 50 40 Q 70 70 85 20" class="sketch-dashed" stroke="#f5f2eb" stroke-width="4" fill="none" />
    </g>
  `,
  `
    <!-- Bobine de fil (Thread spool) -->
    <g transform="translate(130, 240)">
      <path d="M 25 15 L 65 15 L 60 25 L 60 75 L 65 85 L 25 85 L 30 75 L 30 25 Z" class="sketch-fill" />
      <line x1="30" y1="35" x2="60" y2="35" class="sketch-line" />
      <line x1="30" y1="50" x2="60" y2="50" class="sketch-line" />
      <line x1="30" y1="65" x2="60" y2="65" class="sketch-line" />
    </g>
    <!-- Craie & Épingles -->
    <g transform="translate(370, 240)">
      <polygon points="45,15 15,75 75,75" class="sketch-fill" />
      <line x1="15" y1="20" x2="75" y2="80" class="sketch-line" stroke-width="1.8" />
      <circle cx="75" cy="80" r="3.5" fill="#e11d48" />
    </g>
  `,
  isAr
);

// 12. Prise de Mesure (Measurements)
const svgMesures = (isAr) => createSvgCard(
  'la prise de mesure',
  'أخذ المقاسات',
  `
    <!-- Mannequin de couture avec lignes de mesures -->
    <g transform="translate(250, 10)">
      <path d="M 35 15 L 65 15 L 75 45 L 65 75 L 70 120 L 30 120 L 35 75 L 25 45 Z" class="sketch-fill" />
      <!-- Bust line -->
      <line x1="20" y1="45" x2="80" y2="45" class="sketch-dashed" stroke="#e11d48" />
      <!-- Waist line -->
      <line x1="28" y1="75" x2="72" y2="75" class="sketch-dashed" stroke="#e11d48" />
      <!-- Hip line -->
      <line x1="25" y1="105" x2="75" y2="105" class="sketch-dashed" stroke="#e11d48" />
    </g>
  `,
  `
    <!-- Ruban & Notes de mesure -->
    <g transform="translate(140, 240)">
      <rect x="15" y="15" width="70" height="85" rx="3" class="sketch-fill" />
      <line x1="25" y1="30" x2="75" y2="30" class="sketch-line" />
      <line x1="25" y1="45" x2="75" y2="45" class="sketch-line" />
      <line x1="25" y1="60" x2="75" y2="60" class="sketch-line" />
      <line x1="25" y1="75" x2="55" y2="75" class="sketch-line" />
    </g>
    <g transform="translate(360, 240)">
      <path d="M 20 60 Q 50 15 80 60" class="sketch-line" stroke-width="4" fill="none" />
      <line x1="20" y1="50" x2="20" y2="70" class="sketch-line" stroke-width="2" />
      <line x1="80" y1="50" x2="80" y2="70" class="sketch-line" stroke-width="2" />
    </g>
  `,
  isAr
);

// 13. Patrons de Base (Basic Pattern Blocks)
const svgPatronsBase = (isAr) => createSvgCard(
  'les patrons de base',
  'الباترونات الأساسية',
  `
    <g transform="translate(100, 20)">
      <!-- Master block grid -->
      <rect x="15" y="15" width="70" height="95" class="sketch-dashed" />
      <path d="M 15 15 L 55 15 L 75 45 L 70 110 L 15 110 Z" class="sketch-fill" />
      <line x1="45" y1="30" x2="45" y2="95" class="sketch-line" stroke-width="2" />
      <polygon points="45,25 41,35 49,35" fill="#2b2823" />
      <polygon points="45,100 41,90 49,90" fill="#2b2823" />
    </g>
    <!-- Règle Perroquet (French Curve) -->
    <g transform="translate(400, 25)">
      <path d="M 15 80 Q 40 15 80 30 Q 50 60 70 85 Z" class="sketch-fill" />
      <circle cx="35" cy="70" r="4" class="sketch-line" />
    </g>
  `,
  `
    <!-- Équerre et calque -->
    <g transform="translate(250, 240)">
      <polygon points="20,15 20,85 85,85" class="sketch-fill" stroke-width="2" />
      <polygon points="30,40 30,75 65,75" class="sketch-line" />
    </g>
  `,
  isAr
);

// 14. Impression du Patron & Calque
const svgImpression = (isAr) => createSvgCard(
  'impression & calque',
  'طباعة الباترون',
  `
    <!-- Grille de feuilles A4 assemblées avec repères -->
    <g transform="translate(90, 20)">
      <rect x="15" y="15" width="35" height="45" class="sketch-dashed" />
      <rect x="55" y="15" width="35" height="45" class="sketch-dashed" />
      <rect x="15" y="65" width="35" height="45" class="sketch-dashed" />
      <rect x="55" y="65" width="35" height="45" class="sketch-dashed" />
      <!-- Ligne de patron traversante -->
      <path d="M 20 90 Q 50 30 80 80" class="sketch-line" stroke-width="2.5" />
    </g>
    <!-- Carré Test 5x5 cm -->
    <g transform="translate(420, 25)">
      <rect x="15" y="15" width="60" height="60" class="sketch-fill" stroke-width="2" />
      <text x="45" y="48" font-family="sans-serif" font-size="12" font-weight="bold" fill="#2b2823" text-anchor="middle">5x5 cm</text>
    </g>
  `,
  `
    <!-- Rouleau de calque et roulette -->
    <g transform="translate(250, 240)">
      <ellipse cx="30" cy="50" rx="15" ry="30" class="sketch-fill" />
      <path d="M 30 20 L 75 20 Q 90 50 75 80 L 30 80" class="sketch-fill" />
      <!-- Roulette -->
      <circle cx="85" cy="50" r="10" class="sketch-line" stroke-dasharray="2,2" stroke-width="2" />
    </g>
  `,
  isAr
);

// Default Atelier Couture Card
const svgDefault = (titleFr, isAr) => createSvgCard(
  titleFr || 'atelier sfax',
  isAr ? 'أتيليي صفاقس' : 'atelier sfax',
  `
    <g transform="translate(250, 20)">
      <circle cx="50" cy="50" r="35" class="sketch-fill" stroke-width="2" />
      <path d="M 35 30 L 65 70 M 65 30 L 35 70" class="sketch-line" stroke-width="2.5" />
    </g>
  `,
  `
    <g transform="translate(250, 240)">
      <line x1="10" y1="40" x2="90" y2="40" class="sketch-dashed" stroke-width="2" />
      <circle cx="50" cy="40" r="5" fill="#d4af37" />
    </g>
  `,
  isAr
);

/**
 * Returns a guaranteed, stunning SVG Data URI matching the category
 */
export const getCategoryFallbackImage = (categoryOrTitle, appLanguage = 'fr') => {
  const isAr = appLanguage === 'ar';
  
  let key = '';
  if (typeof categoryOrTitle === 'object' && categoryOrTitle !== null) {
    const raw = categoryOrTitle.technicalName || 
                (typeof categoryOrTitle.title === 'object' ? (categoryOrTitle.title.fr || categoryOrTitle.title.ar || '') : categoryOrTitle.title) || 
                '';
    key = String(raw).toLowerCase().trim();
  } else if (typeof categoryOrTitle === 'string') {
    key = categoryOrTitle.toLowerCase().trim();
  }

  // Chapter 1: Matériel
  if (key.includes('materiel') || key.includes('matériel') || key.includes('أدوات')) {
    return svgMateriel(isAr);
  }

  // Chapter 2: Prise de mesure
  if (key.includes('mesure') || key.includes('مقاس')) {
    return svgMesures(isAr);
  }

  // Chapter 3: Patrons de base
  if (key.includes('base') || key.includes('patron de base') || key.includes('أساسي')) {
    return svgPatronsBase(isAr);
  }

  // Chapter 4: Impression / Calque
  if (key.includes('impression') || key.includes('calque') || key.includes('طباعة')) {
    return svgImpression(isAr);
  }

  // Chapter 5: Corsages
  if (key.includes('corsage') || key.includes('كورساج')) {
    return svgCorsages(isAr);
  }

  // Chapter 6: Cols
  if (key.includes('col') || key.includes('ياقة') || key.includes('ياقات')) {
    return svgCols(isAr);
  }

  // Chapter 7: Manches
  if (key.includes('manche') || key.includes('كم') || key.includes('أكمام')) {
    return svgManches(isAr);
  }

  // Chapter 8: Chemises
  if (key.includes('chemise') || key.includes('قميص') || key.includes('قمصان')) {
    return svgChemises(isAr);
  }

  // Chapter 9: Pantalons
  if (key.includes('pantalon') || key.includes('سروال') || key.includes('سراويل')) {
    return svgPantalons(isAr);
  }

  // Chapter 10: Jupes
  if (key.includes('jupe') || key.includes('تنورة') || key.includes('تنانير')) {
    return svgJupes(isAr);
  }

  // Chapter 11: Poches
  if (key.includes('poche') || key.includes('جيب') || key.includes('جيوب')) {
    return svgPoches(isAr);
  }

  // Chapter 12: Fermetures
  if (key.includes('fermeture') || key.includes('سحاب') || key.includes('سحابات')) {
    return svgFermetures(isAr);
  }

  // Chapter 13: Ceinture
  if (key.includes('ceinture') || key.includes('حزام')) {
    return svgCeinture(isAr);
  }

  // Chapter 14: Robes
  if (key.includes('robe') || key.includes('فستان') || key.includes('فساتين')) {
    return svgRobes(isAr);
  }

  return svgDefault(key, isAr);
};

/**
 * Resolves the best available display image with guaranteed fallback
 */
export const resolveCategoryDisplayImage = (course, appLanguage = 'fr') => {
  if (!course) return getCategoryFallbackImage('', appLanguage);

  let rawImg = '';
  if (typeof course.image === 'object' && course.image !== null) {
    // 1. Try active language
    if (course.image[appLanguage] && typeof course.image[appLanguage] === 'string' && course.image[appLanguage].trim() !== '') {
      rawImg = course.image[appLanguage].trim();
    } 
    // 2. Try French
    else if (course.image.fr && typeof course.image.fr === 'string' && course.image.fr.trim() !== '') {
      rawImg = course.image.fr.trim();
    }
    // 3. Try other available languages
    else {
      const vals = Object.values(course.image).filter(v => typeof v === 'string' && v.trim() !== '');
      if (vals.length > 0) rawImg = vals[0].trim();
    }
  } else if (typeof course.image === 'string' && course.image.trim() !== '') {
    rawImg = course.image.trim();
  }

  // If empty or known invalid, return guaranteed fallback
  if (!rawImg) {
    return getCategoryFallbackImage(course, appLanguage);
  }

  return rawImg;
};
