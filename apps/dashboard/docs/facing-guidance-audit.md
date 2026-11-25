# Facing invalid + guidance audit

Structured facing copy uses typed `FacingReason` codes in `@rpg/contracts` and
`facingReasonMessage` in `apps/dashboard/src/features/content/facing/facing-reason-message.ts`.
`@rpg/ui` `FacingHostPanel` accepts only `FacingHostPanelModel` (`status`, `document`,
`message`, optional preview metadata). Editor hooks pass a draft domain request through `FacingHostConfig`. The structured host resolves that request and owns the conversion to the UI display model. Monster attack resolution supplies an attack profile, which the host formats once for the preview.

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

Incomplete with a partial document shows both document and guidance. Rules Preview, published class detail, and the builder class details sheet share the dashboard table adapter for structured facing blocks. The adapter requires a table renderer, and the shared block dispatcher rejects unsupported block kinds.

## Applicability

Resolver `undefined` (not applicable) is separate from `FacingResolution` statuses.
Custom species and monster traits resolve to an inapplicable result through the facing facade. An empty selection supplies no request. Custom class features with authored content can resolve to a rules document.

Monster draft facing identifies the selected action before checking equipment and spell catalog readiness. Action prose does not use the monster’s fixed Armor Class offset, so Armor Class rules are optional for draft normalization. Magic-property definitions come from the campaign ruleset or the existing default system ruleset while campaign context loads. Authored Special Abilities without a configured saving throw, Leap, Teleport, Take Actions, and Shape Shift use the shared rules composer independently of those catalog states. Spell actions report incomplete configuration before checking the catalog when no spell is selected. A configured spell action checks its shared casting source, if any, and uses the scoped spell catalog to distinguish loading, load failure, and missing references. Draft attack previews derive the selected attack once through the same resolver used for draft stat blocks. Readiness guidance uses the same normalized action from the selected section. Natural and custom attacks render in draft preview and published detail during equipment and spell catalog failures. Published detail uses equipment readiness separately from full stat-block readiness, so a weapon attack can still render when its equipment is available and the skill or campaign rules load fails. Weapon attacks distinguish an unset selection from a missing item or a catalog load failure. Spell previews derive save DC from the monster’s challenge rating and casting ability when equipment-backed stat derivation is unavailable. Multiattacks check their referenced actions, require equipment for weapon targets, and use the spell catalog for explicit spell choices. Published multiattack rules also remain visible during equipment catalog failures when their actions do not reference weapons. Action references and parry follow-ups check their referenced actions and any weapon equipment they need. Saving throws use the monster’s own ability scores and challenge rating, or its direct shared casting source. They can render during catalog failures. The draft resolver reports a missing shared casting source and rejects unsupported action kinds with a typed reason. When a dependency is unavailable, published detail preserves usable content. Parry keeps its Armor Class response and omits the unresolved follow-up attack. Action references and shared spell invocations omit the unavailable generated sentence and retain authored notes where supported. Multiattack formatting requires a resolved weapon identity before naming the weapon in its rules.

## Spellbook Alert gap

Some call sites still wrap Alert children in `Text variant="supporting"` (14px fixed).
Density tokens on `.ui-alert__*` apply to unwrapped alert anatomy only.

## Agent checklist — new facing guidance

1. Add a `FacingReason` code in contracts when a new unfinished state needs a shared sentence.
2. Map it in `facingReasonMessage` (exhaustive switch).
3. Return the reason from the domain resolver — never put sentences on `FacingResolution`.
4. Mount preview through `StructuredFacingHostPanel` and use `FacingDetailBody` for published documents. The structured host owns the raw `FacingHostPanel` import. The dashboard import guard covers package and workspace paths.
