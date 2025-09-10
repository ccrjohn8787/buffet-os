# Sprint 04 — Compare Years + Eval Harness

Duration: 1 week
Goal: Compare passages across years and establish evaluation suite with CI gate.

## Scope
- `/compare?docA=&docB=&topic=` backend and UI with sentence-level diff
- Evaluation harness with golden set and CI check

## Deliverables
- Diff logic (sentence-tokenized) and highlight changes
- Compare page with topic filter and export of diff
- Golden set of ≥200 questions mapping to quotes/anchors
- CI integration to run eval and block on regressions

## Acceptance Criteria
- Compare works on ≥10 year pairs with clear diffs
- Eval suite ≥95% pass; zero incorrect quotes displayed

## Tasks
- Backend diff + API
- UI for compare flow and export
- Eval dataset, metrics, and CI wiring

## Risks
- Tokenization differences → lock library/version and snapshot tests

