# Clearcoat Photo-to-Quote Research

## Overview

Clearcoat turns a guided set of vehicle photos into a transparent detailing quote. Computer vision is treated as an evidence layer; pricing remains deterministic, confidence-aware, and reviewable by an estimator.

## Product decisions

- Use a progressive mobile capture flow instead of a grid of blank upload boxes.
- Separate capture, vision, pricing, and overall confidence.
- Support firm quotes, bounded quotes, additional-evidence requests, and estimator review.
- Show visible-photo language, assumptions, exclusions, and a human-review path.
- Keep pricing versioned and record every estimator override with a reason.
- Keep raw images short-lived and model-improvement consent optional.

## MVP implementation

The first implementation is a Next.js/React app with local-first seeded data. It includes the customer, estimator, admin, booking, privacy, and quote API surfaces without requiring external provider credentials.
