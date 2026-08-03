# clearcoat quote studio

A mobile-first photo-to-quote workspace for auto detailing teams. It includes an estimator queue, confidence-aware quote breakdowns, audit evidence, guided customer capture, appointment-ready quote review, pricing rules, customer records, dispatch calendar, privacy controls, and a canonical quote API surface.

## Run locally

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

The app uses seeded inspection data and a deterministic local quote engine so the end-to-end quote experience is usable without third-party ML, storage, payment, or calendar credentials. Uploads are checked in-browser for dimensions, exposure, and sharpness; selected visible conditions then drive transparent line items, HST, labour time, confidence, and evidence/review routing. This is an inspectable quote workflow, not a claim of trained computer vision or an automatic guarantee about hidden vehicle conditions.

## Included surfaces

- Customer: guided capture, real file selection, local image-quality analysis, visible-condition inputs, quote generation, assumptions, and human-review routing.
- Estimator: inspection queue, searchable status table, evidence overlays, confidence signals, editable labour, override notes, approval, customer notification, and audit trail.
- Admin: pricing rules, customer records, dispatch calendar, workspace privacy controls, retention, model-improvement consent, and data-rights tools.
- API: `GET/POST /api/quotes` and `GET/PATCH /api/quotes/:quoteId` as a provider-neutral starting point for the quote lifecycle. `POST /api/quotes` uses the same deterministic quote engine as the UI; no Stripe or payment integration is included.
