import { Product, UserFitProfile, SmartSizeResult, SmartSizeDimensionMatch } from '../types';

export const STORAGE_KEY_FIT_PROFILE = 'elan_user_fit_profile';

export const DEFAULT_FIT_PROFILE: UserFitProfile = {
  unit: 'metric',
  heightCm: 175,
  weightKg: 68,
  chestCm: 92,
  waistCm: 76,
  hipsCm: 96,
  bodyBuild: 'regular',
  fitPreference: 'regular',
  referenceBrand: 'Zara',
  referenceSize: 'M',
  savedAt: new Date().toISOString(),
};

/**
 * Retrieves the saved fit profile from localStorage, falling back to the standard profile.
 */
export const getStoredFitProfile = (): UserFitProfile => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FIT_PROFILE);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.chestCm === 'number') {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Could not read fit profile from storage', err);
  }
  return DEFAULT_FIT_PROFILE;
};

/**
 * Checks whether user has explicitly saved a personalized fit quiz profile.
 */
export const hasUserCompletedFitQuiz = (): boolean => {
  try {
    return Boolean(localStorage.getItem(STORAGE_KEY_FIT_PROFILE));
  } catch {
    return false;
  }
};

interface SizeBenchmark {
  chest: number;
  waist: number;
  hips: number;
  height: number;
}

const SIZE_BENCHMARKS: Record<string, SizeBenchmark> = {
  XS: { chest: 86, waist: 70, hips: 90, height: 165 },
  S: { chest: 90, waist: 74, hips: 94, height: 170 },
  M: { chest: 96, waist: 79, hips: 98, height: 176 },
  L: { chest: 103, waist: 85, hips: 104, height: 182 },
  XL: { chest: 111, waist: 93, hips: 112, height: 186 },
  XXL: { chest: 119, waist: 101, hips: 120, height: 190 },
};

/**
 * Calculates probabilistic sizing match score and dimensional breakdown
 * for a garment against the user's saved Fit Quiz data.
 */
export const calculateSmartSize = (
  product: Product,
  profile: UserFitProfile | null = getStoredFitProfile()
): SmartSizeResult => {
  const activeProfile = profile || DEFAULT_FIT_PROFILE;
  const { category, sizes } = product;

  // Handle Bags and Accessories (Universal One Size)
  if (category === 'accessories' || category === 'bags' || sizes.includes('One Size')) {
    return {
      isRecommended: true,
      matchScore: 98,
      recommendedSize: 'One Size',
      fitCategory: 'Universal Fit',
      confidenceReason: 'Universal sculptural silhouette engineered to complement all body proportions.',
      dimensions: [
        {
          label: 'Proportional Balance',
          userMeasure: `${activeProfile.heightCm} cm height`,
          targetRange: 'Unisex Universal',
          status: 'optimal',
        },
      ],
    };
  }

  // Handle Footwear (Numeric sizing 37 - 44)
  const isFootwear = category === 'footwear' || sizes.some((s) => !isNaN(Number(s)));
  if (isFootwear) {
    // Height to shoe size heuristic
    let estimatedEu = Math.round(activeProfile.heightCm / 4.4); // e.g. 175 / 4.4 ≈ 40
    if (product.gender === 'women') estimatedEu = Math.min(estimatedEu, 39);
    const estimatedStr = String(estimatedEu);

    // Find closest available shoe size
    const availableNumeric = sizes.filter((s) => !isNaN(Number(s))).map(Number);
    const closestSize = availableNumeric.reduce((prev, curr) =>
      Math.abs(curr - estimatedEu) < Math.abs(prev - estimatedEu) ? curr : prev,
      availableNumeric[0] || 40
    );

    const delta = Math.abs(closestSize - estimatedEu);
    const score = Math.max(82, 97 - delta * 5);

    return {
      isRecommended: score >= 88,
      matchScore: score,
      recommendedSize: String(closestSize),
      fitCategory: delta === 0 ? 'True to Size' : 'Slight Ease',
      confidenceReason: `Calibrated for ${activeProfile.heightCm}cm stature with European artisan last geometry.`,
      dimensions: [
        {
          label: 'Foot Bed Length',
          userMeasure: `EU ${estimatedEu} reference`,
          targetRange: `EU ${closestSize}`,
          status: delta === 0 ? 'optimal' : 'snug',
        },
      ],
    };
  }

  // Standard Apparel Sizing (XS, S, M, L, XL, XXL)
  let bestSize = sizes[0] || 'M';
  let bestDelta = 999;
  let bestScore = 80;

  // Measurement focus weights based on category
  let chestWeight = 0.55;
  let waistWeight = 0.35;
  let hipsWeight = 0.10;

  if (category === 'bottoms') {
    chestWeight = 0.05;
    waistWeight = 0.65;
    hipsWeight = 0.30;
  } else if (category === 'tailoring') {
    chestWeight = 0.50;
    waistWeight = 0.35;
    hipsWeight = 0.15;
  } else if (category === 'dresses') {
    chestWeight = 0.40;
    waistWeight = 0.35;
    hipsWeight = 0.25;
  } else if (category === 'outerwear') {
    chestWeight = 0.65;
    waistWeight = 0.25;
    hipsWeight = 0.10;
  }

  // User target adjustments based on build & preference
  let targetChest = activeProfile.chestCm;
  let targetWaist = activeProfile.waistCm;
  let targetHips = activeProfile.hipsCm;

  if (activeProfile.fitPreference === 'snug') {
    targetChest += 2; // wants smaller garment
    targetWaist += 2;
  } else if (activeProfile.fitPreference === 'relaxed') {
    targetChest -= 3; // wants roomier garment
    targetWaist -= 3;
  }

  if (activeProfile.bodyBuild === 'broad' || activeProfile.bodyBuild === 'athletic') {
    targetChest -= 2; // broader shoulders require extra allowance
  }

  // Evaluate candidate sizes
  sizes.forEach((sizeKey) => {
    const bench = SIZE_BENCHMARKS[sizeKey];
    if (!bench) return;

    const chestDiff = Math.abs(bench.chest - targetChest);
    const waistDiff = Math.abs(bench.waist - targetWaist);
    const hipsDiff = Math.abs(bench.hips - targetHips);

    const weightedDiff = chestDiff * chestWeight + waistDiff * waistWeight + hipsDiff * hipsWeight;

    if (weightedDiff < bestDelta) {
      bestDelta = weightedDiff;
      bestSize = sizeKey;
    }
  });

  // Calculate probability score (80% - 99%)
  // A perfect fit delta near 0 gives 98-99%
  const baseScore = 100 - bestDelta * 1.5;
  let buildBonus = 0;
  if (activeProfile.bodyBuild === 'regular' || activeProfile.bodyBuild === 'athletic') {
    buildBonus = 1;
  }
  bestScore = Math.max(76, Math.min(99, Math.round(baseScore + buildBonus)));

  const bench = SIZE_BENCHMARKS[bestSize] || SIZE_BENCHMARKS.M;
  const chestEase = Math.round(bench.chest - activeProfile.chestCm);
  const waistEase = Math.round(bench.waist - activeProfile.waistCm);

  const dimensions: SmartSizeDimensionMatch[] = [
    {
      label: category === 'bottoms' ? 'Waist Band' : 'Chest Line',
      userMeasure: `${category === 'bottoms' ? activeProfile.waistCm : activeProfile.chestCm} cm`,
      targetRange: `${category === 'bottoms' ? bench.waist : bench.chest} cm (${category === 'bottoms' ? (waistEase >= 0 ? `+${waistEase}` : waistEase) : (chestEase >= 0 ? `+${chestEase}` : chestEase)}cm ease)`,
      status: Math.abs(chestEase) <= 5 ? 'optimal' : chestEase < 0 ? 'snug' : 'relaxed',
    },
    {
      label: category === 'bottoms' ? 'Hips / Seat' : 'Waist Drape',
      userMeasure: `${category === 'bottoms' ? activeProfile.hipsCm : activeProfile.waistCm} cm`,
      targetRange: `${category === 'bottoms' ? bench.hips : bench.waist} cm`,
      status: Math.abs(waistEase) <= 6 ? 'optimal' : 'relaxed',
    },
    {
      label: 'Proportional Stature',
      userMeasure: `${activeProfile.heightCm} cm`,
      targetRange: `${bench.height - 4}–${bench.height + 4} cm`,
      status: 'optimal',
    },
  ];

  const fitCategory =
    bestScore >= 95
      ? 'True to Size'
      : activeProfile.fitPreference === 'relaxed'
      ? 'Slight Ease'
      : 'Sculpted Fit';

  const isRecommended = bestScore >= 88 && sizes.includes(bestSize);

  return {
    isRecommended,
    matchScore: bestScore,
    recommendedSize: bestSize,
    fitCategory,
    confidenceReason: `Size ${bestSize} delivers a ${bestScore}% precision match for your ${activeProfile.bodyBuild} build with ${activeProfile.fitPreference} tailoring ease.`,
    dimensions,
  };
};
