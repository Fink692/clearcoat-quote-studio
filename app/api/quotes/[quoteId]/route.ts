import { NextResponse } from "next/server";

export async function GET(_request: Request, { params }: { params: { quoteId: string } }) {
  return NextResponse.json({
    quote_id: params.quoteId,
    status: "ready",
    version: 4,
    actions: { can_accept: true, requires_estimator_review: true, additional_views: [] },
  });
}

export async function PATCH(request: Request, { params }: { params: { quoteId: string } }) {
  const body = await request.json().catch(() => ({}));
  return NextResponse.json({
    quote_id: params.quoteId,
    version: 5,
    status: body.status ?? "review",
    updated_at: new Date().toISOString(),
    override: body.override ?? null,
    message: "Quote version updated with an auditable override.",
  });
}
