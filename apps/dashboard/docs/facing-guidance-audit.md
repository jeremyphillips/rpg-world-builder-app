# Facing invalid + guidance audit

Structured facing copy uses typed `FacingReason` codes in `@rpg/contracts` and
`facingReasonMessage` in `apps/dashboard/src/features/content/facing/facing-reason-message.ts`.
`@rpg/ui` `FacingHostPanel` accepts only `FacingHostPanelModel` (`status`, `document`,
`message`, optional preview metadata). Features never pass guidance strings or React chrome.

## Ownership

| Layer            | Owns                                                                                |
| ---------------- | ----------------------------------------------------------------------------------- |
| `@rpg/contracts` | `FacingResolution`, `FacingReason` (codes + parameters, no sentences)               |
| Dashboard facing | Domain resolvers → reasons; `facingReasonMessage` → sentences; `toFacingPanelModel` |
| `@rpg/ui`        | Neutral / failure guidance chrome inside `FacingHostPanel` only                     |

## Presentation policy

| Status                                 | Panel                                                         |
| -------------------------------------- | ------------------------------------------------------------- |
| `ready`                                | Rules document + optional attack metadata rows / mode caption |
| `incomplete`, `invalid`, `unavailable` | Neutral info guidance (no `role="alert"`)                     |
| `failed`                               | Failure copy with `role="status"` on the guidance line        |

Incomplete with a partial document shows both document and guidance.

## Applicability

Resolver `undefined` (not applicable) is separate from `FacingResolution` statuses.
Custom species / monster traits and custom class features without catalog structure are
`undefined` from the host hook — no Rules Preview panel.

## Spellbook Alert gap

Some call sites still wrap Alert children in `Text variant="supporting"` (14px fixed).
Density tokens on `.ui-alert__*` apply to unwrapped alert anatomy only.

## Agent checklist — new facing guidance

1. Add a `FacingReason` code in contracts when a new unfinished state needs a shared sentence.
2. Map it in `facingReasonMessage` (exhaustive switch).
3. Return the reason from the domain resolver — never put sentences on `FacingResolution`.
4. Mount preview only via `StructuredFacingHostPanel` / `FacingDetailBody`.
