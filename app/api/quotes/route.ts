import { NextResponse } from "next/server";
import { generateQuote, type QuoteInput } from "../../../lib/quote-engine";

const quote = {
  quote_id: "quo_01K2ABC",
  version: 4,
  status: "ready",
  currency: "CAD",
  quote_type: "firm",
  valid_until: "2026-08-08T23:59:59-04:00",
  vehicle: { body_type: "compact_suv", year: 2021, make: "Honda", model: "CR-V Touring", confidence: 0.96 },
  service_request: { package_code: "INTERIOR_DEEP_CLEAN", mobile_service: true },
  observations: [
    { observation_id: "obs_pet_hair_rear", condition: "pet_hair", severity: 3, coverage_band: "moderate", confidence: 0.88, parts: ["rear_seat_left", "rear_seat_right"] },
    { observation_id: "obs_winter_salt_front", condition: "winter_salt", severity: 2, coverage_band: "small", confidence: 0.81, parts: ["front_footwell_left", "front_footwell_right"] },
  ],
  line_items: [
    { code: "INTERIOR_DEEP_CLEAN_COMPACT_SUV", description: "Interior deep-clean package", quantity: 1, unit_amount: 19000, amount: 19000, basis: "package_and_vehicle" },
    { code: "PET_HAIR_LEVEL_3", description: "Heavy rear-seat pet-hair removal", quantity: 1, unit_amount: 6500, amount: 6500, basis: "computer_vision_observation" },
    { code: "MOBILE_SERVICE_ZONE_1", description: "Mobile service travel", quantity: 1, unit_amount: 1500, amount: 1500, basis: "postal_code_service_zone" },
  ],
  pricing: { subtotal: 27000, tax: 3510, total: 30510, deposit_due: 6102 },
  estimated_duration_minutes: { point_estimate: 210, lower: 180, upper: 255 },
  confidence: { capture: 0.94, vision: 0.87, pricing: 0.9, overall: 0.89 },
  assumptions: [
    "No biohazard or severe odour is visible in the submitted photos.",
    "The photographed surfaces represent the full vehicle condition.",
    "Loose personal items will be removed before service.",
  ],
  model_trace: { part_model: "parts-2026-07-18", condition_model: "conditions-2026-07-25", pricing_model: "labour-2026-07-20", ruleset: "ontario-retail-42" },
};

export async function GET() {
  return NextResponse.json({ data: [quote], meta: { count: 1 } });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const requested = (body.input ?? body) as Partial<QuoteInput>;
  const input: QuoteInput = {
    service: requested.service ?? "interior_deep_clean",
    bodyType: requested.bodyType ?? "compact_suv",
    mobileService: requested.mobileService ?? true,
    postalCode: requested.postalCode ?? "",
    imageCount: requested.imageCount ?? 0,
    usableImageCount: requested.usableImageCount ?? 0,
    qualityScore: requested.qualityScore ?? 0,
    conditions: requested.conditions ?? [],
  };
  const generated = generateQuote(input);
  return NextResponse.json({
    data: {
      quote_id: `quo_demo_${Date.now()}`,
      status: generated.status,
      quote_type: generated.quoteType,
      currency: generated.currency,
      line_items: generated.lineItems.map((item) => ({ ...item, amount: Math.round(item.amount * 100), unit_amount: Math.round(item.amount * 100) })),
      pricing: { subtotal: Math.round(generated.subtotal * 100), tax: Math.round(generated.tax * 100), total: Math.round(generated.total * 100), deposit_due: Math.round(generated.deposit * 100) },
      observations: generated.observations,
      estimated_duration_minutes: { point_estimate: generated.labourMinutes },
      confidence: { overall: generated.confidence, image_coverage: generated.imageCoverage },
      assumptions: generated.assumptions,
      actions: generated.actions,
    },
  }, { status: 201 });
}
