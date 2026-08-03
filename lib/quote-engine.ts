export type ServiceCode = "interior_deep_clean" | "exterior_decontamination" | "combined_detail";
export type BodyType = "sedan" | "compact_suv" | "full_size_suv" | "truck";
export type ConditionCode = "pet_hair" | "winter_salt" | "stain_spill" | "road_film" | "brake_dust" | "water_spots";

export type QuoteCondition = {
  code: ConditionCode;
  severity: 1 | 2 | 3 | 4;
  coverage: "spot" | "small" | "moderate" | "pervasive";
};

export type QuoteInput = {
  service: ServiceCode;
  bodyType: BodyType;
  mobileService: boolean;
  postalCode?: string;
  imageCount: number;
  usableImageCount: number;
  qualityScore: number;
  conditions: QuoteCondition[];
};

export type QuoteLineItem = {
  code: string;
  label: string;
  amount: number;
  basis: string;
};

export type GeneratedQuote = {
  quoteType: "firm" | "bounded" | "evidence" | "review";
  status: "ready" | "more_evidence" | "review";
  currency: "CAD";
  subtotal: number;
  tax: number;
  total: number;
  deposit: number;
  labourMinutes: number;
  confidence: number;
  imageCoverage: number;
  lineItems: QuoteLineItem[];
  observations: Array<QuoteCondition & { label: string; confidence: number }>;
  actions: { canAccept: boolean; additionalEvidence: boolean; reviewRequired: boolean };
  assumptions: string[];
};

const serviceLabels: Record<ServiceCode, string> = {
  interior_deep_clean: "Interior deep clean",
  exterior_decontamination: "Exterior decontamination",
  combined_detail: "Combined detail",
};

const conditionLabels: Record<ConditionCode, string> = {
  pet_hair: "Pet-hair removal",
  winter_salt: "Winter salt extraction",
  stain_spill: "Stain and spill treatment",
  road_film: "Road-film decontamination",
  brake_dust: "Brake-dust wheel treatment",
  water_spots: "Water-spot treatment",
};

const basePrices: Record<ServiceCode, Record<BodyType, number>> = {
  interior_deep_clean: { sedan: 165, compact_suv: 190, full_size_suv: 225, truck: 215 },
  exterior_decontamination: { sedan: 145, compact_suv: 165, full_size_suv: 195, truck: 185 },
  combined_detail: { sedan: 275, compact_suv: 315, full_size_suv: 365, truck: 345 },
};

const conditionRates: Record<ConditionCode, { base: number; severity: number; minutes: number }> = {
  pet_hair: { base: 20, severity: 15, minutes: 18 },
  winter_salt: { base: 18, severity: 10, minutes: 12 },
  stain_spill: { base: 28, severity: 14, minutes: 16 },
  road_film: { base: 20, severity: 8, minutes: 11 },
  brake_dust: { base: 18, severity: 8, minutes: 9 },
  water_spots: { base: 25, severity: 10, minutes: 13 },
};

const coverageMultiplier = { spot: 0.7, small: 1, moderate: 1.25, pervasive: 1.6 } as const;

const roundCents = (amount: number) => Math.round(amount * 100) / 100;

export function generateQuote(input: QuoteInput): GeneratedQuote {
  const usable = Math.max(0, Math.min(input.usableImageCount, input.imageCount));
  const imageCoverage = input.imageCount === 0 ? 0 : Math.min(1, usable / Math.max(4, input.imageCount));
  const normalizedQuality = Math.max(0, Math.min(1, input.qualityScore));
  const confidence = Math.max(0, Math.min(0.98, normalizedQuality * 0.65 + imageCoverage * 0.35));
  const base = basePrices[input.service][input.bodyType];
  const lineItems: QuoteLineItem[] = [{ code: input.service.toUpperCase(), label: serviceLabels[input.service], amount: base, basis: "service and vehicle class" }];
  let conditionMinutes = 0;

  for (const condition of input.conditions) {
    const rate = conditionRates[condition.code];
    const amount = roundCents((rate.base + rate.severity * condition.severity) * coverageMultiplier[condition.coverage]);
    lineItems.push({ code: condition.code.toUpperCase(), label: conditionLabels[condition.code], amount, basis: "visible condition selected during inspection" });
    conditionMinutes += Math.round(rate.minutes * condition.severity * coverageMultiplier[condition.coverage]);
  }

  if (input.mobileService) {
    lineItems.push({ code: "MOBILE_SERVICE_ZONE_1", label: "Mobile service travel", amount: 15, basis: input.postalCode ? `postal code ${input.postalCode}` : "mobile-service minimum" });
  }

  const subtotal = roundCents(lineItems.reduce((sum, item) => sum + item.amount, 0));
  const tax = roundCents(subtotal * 0.13);
  const total = roundCents(subtotal + tax);
  const deposit = roundCents(total * 0.2);
  const labourMinutes = Math.round((input.service === "combined_detail" ? 180 : 120) + conditionMinutes + (input.mobileService ? 15 : 0));
  const enoughEvidence = input.imageCount >= 4 && usable >= 4;
  const reviewRequired = !enoughEvidence || confidence < 0.64;
  const additionalEvidence = input.imageCount < 4 || usable < 3;
  const quoteType = additionalEvidence ? "evidence" : reviewRequired ? "review" : confidence >= 0.8 ? "firm" : "bounded";

  return {
    quoteType,
    status: additionalEvidence ? "more_evidence" : reviewRequired ? "review" : "ready",
    currency: "CAD",
    subtotal,
    tax,
    total,
    deposit,
    labourMinutes,
    confidence,
    imageCoverage,
    lineItems,
    observations: input.conditions.map((condition) => ({ ...condition, label: conditionLabels[condition.code], confidence: Math.max(0.5, confidence - (condition.severity === 4 ? 0.05 : 0)) })),
    actions: { canAccept: !reviewRequired && !additionalEvidence, additionalEvidence, reviewRequired },
    assumptions: [
      "The quote reflects visible conditions in the submitted photos.",
      "No biohazard, severe odour, or hidden contamination is assumed.",
      "Final scope may change if on-site conditions differ materially.",
    ],
  };
}
