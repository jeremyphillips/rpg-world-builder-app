# Visual vocabulary

Phase 1 contract for semantic tone, visual emphasis, content hierarchy, and
composable chrome. Types live in
[`visual-vocabulary.types.ts`](../src/components/ui/visual-vocabulary.types.ts);
resolvers in [`chrome.variants.ts`](../src/components/ui/chrome.variants.ts).

See also [design tokens](./design-tokens.md) for Layer 1–3 mechanics.

## Dimensions

| Dimension         | Type               | Phase 1 export? | Rules                                                                                |
| ----------------- | ------------------ | --------------- | ------------------------------------------------------------------------------------ |
| Semantic tone     | `SemanticTone`     | Yes             | Meaning only — `neutral`, `info`, `success`, `warning`, `destructive`                |
| Visual emphasis   | `VisualEmphasis`   | Yes             | `faint` \| `subtle` \| `default` \| `strong` — **not** `plain`                       |
| Elevation         | `SurfaceElevation` | Yes (type only) | On `SurfaceConfig`, not `ChromeConfig` until subsystem migration                     |
| Content hierarchy | `ContentTone`      | Yes             | Prefer over new `muted` variant values                                               |
| Component state   | (doc only)         | **No**          | `inactive` \| `selected` \| `invalid` \| `disabled` — export when an API consumes it |
| Chrome shape      | `ChromeVariant`    | Yes             | Separate from tone/emphasis                                                          |

## Rules

- **`status.tone`** → icon + primary status label only. `detail`, `secondary`, and
  section `legend` use `ContentTone.secondary` (`text-muted-foreground` / `Text variant="muted"`).
- **Accent chrome** — neutral/faint semantic shell + semantic pseudo-rail + **no**
  semantic perimeter (`border-border-subtle` at faint emphasis).
- **Panel / callout** — semantic background + semantic perimeter + **no** rail (Phase 2+).
- **Untreated surface** — `{ variant: 'plain' }` or omit `chrome` entirely. Absence of
  emphasis is not a `VisualEmphasis` value; `plain` ∉ `VisualEmphasis`.

## Chrome resolvers (Phase 1)

Shell and accent are structurally separate; compose at `resolveChromeClasses`.

| Function                     | Responsibility                                      |
| ---------------------------- | --------------------------------------------------- |
| `resolveChromeShellClasses`  | Border + background wash                            |
| `resolveChromeAccentClasses` | Pseudo-rail only (`before:` geometry)               |
| `resolveChromeClasses`       | Composes shell + accent when `variant === 'accent'` |

**Supported matrix** (`SupportedSemanticChrome` — closed union):

| Combo              | Shell                                        | Accent                                    |
| ------------------ | -------------------------------------------- | ----------------------------------------- |
| `warning × faint`  | `bg-warning-faint` + `border-border-subtle`  | `before:bg-semantic-warning-accent-faint` |
| `warning × subtle` | `bg-warning-subtle` + `border-warning-muted` | `before:bg-semantic-warning-border`       |
| `neutral × subtle` | `bg-surface-muted` + `border-border-subtle`  | (none)                                    |

Pseudo-rail geometry: `before:absolute before:inset-y-2 before:left-0 before:w-0.5
before:rounded-full`. Never `border-l-2` on `rounded-md` accent shells.

## Tokens (Phase 1)

| Token                             | Role                                                                            |
| --------------------------------- | ------------------------------------------------------------------------------- |
| `--warning-faint`                 | Wash — visibly lighter than `warning-subtle`, distinct from surrounding surface |
| `--semantic-warning-accent-faint` | Pseudo-rail accent only — perimeter stays neutral at faint emphasis             |

Namespace: `bg-warning-faint` (wash) vs `text-semantic-warning` (label) vs
`semantic-warning-accent-faint` (rail).

## Phase 2 — surface and chrome migration

`SurfaceConfig` replaces `FieldSurfaceVariant` / `InsetPanelSurface` string literals:

| Legacy               | `SurfaceConfig`                              |
| -------------------- | -------------------------------------------- |
| `base` / flat canvas | `{ elevation: 'flat' }` or `{}`              |
| `raised`             | `{ elevation: 'raised' }`                    |
| `subtle`             | `{ emphasis: 'subtle', elevation: 'flat' }`  |
| `muted`              | `{ emphasis: 'default', elevation: 'flat' }` |
| `strong`             | `{ emphasis: 'strong', elevation: 'flat' }`  |
| `sunken` (inset)     | `{ elevation: 'sunken' }`                    |

`resolveSurfaceClasses` in [`surface.variants.ts`](../src/components/ui/surface.variants.ts) resolves neutral and semantic washes.

Group `chrome` panel / outline / callout variants use `ChromeConfig` (`tone`, `emphasis`, `elevation`, `borderAccent`) and delegate to [`chrome.variants.ts`](../src/components/ui/chrome.variants.ts). Inset, divider, and legend-rail accent remain field-group-specific.

Container chrome uses `surface?: SurfaceConfig` and `tone?: SemanticSurfaceTone` (replaces `status`).

## Migration map (Phase 1 + 2)

| Current                                 | Intent               | Target                                                                        |
| --------------------------------------- | -------------------- | ----------------------------------------------------------------------------- |
| `FieldSurfaceVariant.base`              | untreated flat plane | `{ variant: 'plain' }` + `SurfaceConfig { elevation: 'flat' }` when migrating |
| `...raised`                             | card elevation       | `SurfaceConfig { elevation: 'raised' }`                                       |
| `...subtle`                             | light wash           | `emphasis: 'subtle'`, `elevation: 'flat'`                                     |
| `...muted`                              | secondary panel      | `emphasis: 'subtle'` on `bg-surface-muted` recipe                             |
| `...strong`                             | dense chrome         | `emphasis: 'strong'`                                                          |
| `FieldStatusTone` + container           | semantic callout     | `{ tone, emphasis: 'subtle' }`                                                |
| `FieldBorderLadderTone`                 | border intensity     | maps to `VisualEmphasis` on border channel                                    |
| `FieldGroupSummary.surface: 'inactive'` | warning accent shell | `chrome: { variant: 'accent', tone: 'warning', emphasis: 'faint' }`           |
| `status.indicator: 'inactive'`          | icon shape           | keep as **indicator**, not state vocabulary                                   |
| `status.tone: 'positive'`               | success status       | `tone: 'success'`                                                             |

## Reference case — campaign availability (unavailable)

Collapsed summary disclosure for unavailable campaign access:

```ts
{
  status: { label: 'Unavailable', tone: 'warning', indicator: 'inactive' },
  detail: 'DM only',
  secondary: 'Hidden from discovery and selection in this campaign.',
  chrome: { variant: 'accent', tone: 'warning', emphasis: 'faint' },
}
```

| Element               | Treatment                                    |
| --------------------- | -------------------------------------------- |
| Left accent rail      | `resolveChromeAccentClasses` — warning faint |
| `CircleSlash` icon    | `text-semantic-warning`                      |
| `Unavailable` label   | `text-semantic-warning`                      |
| **Change**            | `text-primary` (text button)                 |
| `DM only` detail      | `text-muted-foreground`                      |
| Secondary consequence | `text-xs text-muted-foreground`              |
| Section legend        | `Text variant="muted"`                       |

Expanded state stays visually neutral (inset chrome only). Validate in Storybook
light and dark: **Content → Campaign Access → SectionUnavailable** and
**Forms/Layout/FieldGroup → SummaryDisclosure**.

Dashboard resolver: `resolveCampaignAccessSummary` in
`apps/dashboard/src/features/content/lib/campaign-access/campaign-access-summary.ts`.
