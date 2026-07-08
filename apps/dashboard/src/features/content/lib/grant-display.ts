/**
 * Compact grant summary display — translates `grantGroups` into inline and
 * grouped-by-level summaries for builder sheets, cards, and detail surfaces.
 *
 * Contracts authoring prose (`formatSenseGrantSentence`, `formatSpellsGrantSentence`, …)
 * is too verbose for compact UI; this module owns short labels. A grant kind without
 * a compact renderer here is not a model gap — only display work pending per the
 * support matrix below.
 *
 * Traversal: always use `resolveGrantGroupsFromContent` and
 * `getGrantGroupEffectiveUnlock` from `@rpg/contracts` (groups without `unlock` are
 * the default group at `parentLevel`, typically 1 for species/heritage).
 *
 * ## Ad hoc replacement inventory
 *
 * Sites that format grants outside this module — replace incrementally, not all at once.
 *
 * - `apps/dashboard/src/features/content/species/lib/species-display.ts` — `collectSenses`:
 *   sense stat row → sense summary items (Phase 4, pending)
 * - `apps/dashboard/src/features/content/species/lib/species-display.ts` —
 *   `mapHeritageOptionToDetailItem`: grant summary lines via this helper (Phase 2, done)
 * - `apps/dashboard/src/features/content/species/lib/species-display.ts` — card
 *   `summaryItems`: trait names only → `formatGrantSummaryInline` (Phase 4, pending)
 * - `packages/contracts/src/rpg/content/lib/trait-display.ts` — `deriveGrantGroupDisplay`:
 *   partial grant → prose HTML; eventually delegate compact labels (Phase 4+, pending)
 * - `apps/dashboard/src/features/content/classes/lib/class-display.ts` —
 *   `mapFeatureToDetailItem`: prose only → grouped grant summaries (Phase 4, pending)
 * - `apps/dashboard/src/features/content/classes/lib/class-display.ts` — proficiencies:
 *   parallel category formatters (out of grant-summary scope)
 * - `apps/dashboard/src/features/content/lib/forms/grants/grant-form-fields.ts`:
 *   per-type authoring row headers; spells has title but no row summary (Phase 4, optional)
 * - `packages/contracts/src/rpg/runtime/character-builder/resolvers/species/resolve-species-heritage-choice-sets.ts`:
 *   option label = trait name only → inline grant summary on picker cards (Phase 4, pending)
 * - `apps/dashboard/src/features/character/lib/builder-species-option-display.lib.ts`:
 *   maps `summaryLines`, omits `body` when grants exist (Phase 2, done)
 *
 * Related shared grant layer (not replacement targets): `grant-form-*` authoring,
 * `collect-sourced-grants.ts` runtime assembly, `GrantGroupSource` in contracts.
 *
 * ## Compact renderer support matrix
 *
 * | Grant kind | Model | Renderer | Notes |
 * |------------|-------|----------|-------|
 * | `sense` | yes | yes | e.g. `Darkvision 120 ft` |
 * | `spells` | yes | yes | e.g. `Dancing Lights cantrip` |
 * | `movement` | yes | no | follow-up |
 * | `resistances` | yes | no | follow-up |
 * | `languages` | yes | no | follow-up |
 * | proficiencies (`weaponProficiency`, `toolProficiency`, `skillProficiency`, `armorTraining`) | yes | no | follow-up |
 * | `equipment` | yes | no | follow-up |
 * | `featChoice` | yes | no | follow-up |
 * | unrecognized kind | — | fallback | `Additional benefit` when sole unsummarized item |
 *
 * Terminology:
 * - **Unrecognized** — `ContentGrant` kind not in schema / unknown at runtime (`kind: 'unrecognized'`).
 * - **Not rendered yet** — known valid kind recognized by `KNOWN_CONTENT_GRANT_KINDS` but no compact
 *   label builder yet (`kind: 'notRenderedYet'`). Formatters collapse these to `N more benefit(s)`.
 */
import {
  getGrantGroupEffectiveUnlock,
  resolveGrantGroupsFromContent,
  type ContentGrant,
  type GrantGroup,
  type Spell,
} from '@rpg/contracts'

/** Separator for compact grant summary lists. */
export const GRANT_SUMMARY_JOIN = ' · ' as const

export type GrantDisplayVocabulary = {
  resolveSenseLabel: (type: string) => string
  resolveSpell: (slug: string) => { name: string; level: number } | undefined
}

export type GrantSummaryKind =
  | 'sense'
  | 'spell'
  | 'cantrip'
  | 'proficiency'
  | 'resistance'
  | 'speed'
  | 'trait'
  | 'notRenderedYet'
  | 'unrecognized'

export type GrantSummaryItem = {
  id: string
  label: string
  kind: GrantSummaryKind
  /** False when kind is `notRenderedYet` or `unrecognized`. */
  supported: boolean
  /** Original `ContentGrant.kind` for debugging and future renderer routing. */
  sourceGrantKind?: string
  level?: number
}

export type GrantSummaryGroup = {
  id: string
  level: number
  label: string
  items: GrantSummaryItem[]
}

export type GrantSummaryModel = {
  groups: GrantSummaryGroup[]
  flatItems: GrantSummaryItem[]
  /** Count of items with `supported: false` (not rendered yet + unrecognized). */
  notRenderedCount?: number
  /** Count truncated by `maxItems` in inline formatting. */
  overflowCount?: number
}

export type GrantSummaryFormatOptions = {
  maxItems?: number
  includeTypeSuffix?: boolean
  /** When true, not-rendered grants render as `Unsupported grant: {kind}` (tests/dev only). */
  exposeUnsupportedGrants?: boolean
}

const KNOWN_CONTENT_GRANT_KINDS = new Set<string>([
  'sense',
  'resistances',
  'damageType',
  'movement',
  'weaponProficiency',
  'toolProficiency',
  'skillProficiency',
  'armorTraining',
  'languages',
  'languageChoice',
  'featChoice',
  'equipment',
  'spells',
])

function formatSlugLabel(slug: string): string {
  return slug
    .split('-')
    .map((part) => (part.length > 0 ? part.charAt(0).toUpperCase() + part.slice(1) : part))
    .join(' ')
}

function isKnownGrantKind(kind: string): kind is ContentGrant['kind'] {
  return KNOWN_CONTENT_GRANT_KINDS.has(kind)
}

function formatMoreBenefitsLabel(count: number): string {
  return count === 1 ? '1 more benefit' : `${count} more benefits`
}

function formatBenefitCountLabel(count: number): string {
  return count === 1 ? '1 benefit' : `${count} benefits`
}

function isRenderableGrant(item: GrantSummaryItem): boolean {
  return item.supported
}

/** Known valid grants without a compact renderer yet — countable for overflow/totals. */
function isHiddenKnownValidGrant(item: GrantSummaryItem): boolean {
  return item.kind === 'notRenderedYet'
}

function formatSenseCompactLabel(
  grant: Extract<ContentGrant, { kind: 'sense' }>,
  vocabulary: GrantDisplayVocabulary,
): string {
  return `${vocabulary.resolveSenseLabel(grant.type)} ${grant.range} ft`
}

function formatSpellTypeSuffix(kind: 'cantrip' | 'spell'): string {
  return kind === 'cantrip' ? 'cantrip' : 'spell'
}

function mapSpellGrantToItems(
  grant: Extract<ContentGrant, { kind: 'spells' }>,
  vocabulary: GrantDisplayVocabulary,
  idPrefix: string,
  level: number,
): GrantSummaryItem[] {
  return grant.spellIds.map((spellId, spellIndex) => {
    const resolved = vocabulary.resolveSpell(spellId)
    const name = resolved?.name ?? formatSlugLabel(spellId)
    const spellKind: GrantSummaryKind =
      resolved?.level === 0 ? 'cantrip' : resolved ? 'spell' : 'spell'

    return {
      id: `${idPrefix}:spells:${spellIndex}`,
      label: name,
      kind: spellKind,
      supported: true,
      sourceGrantKind: grant.kind,
      level,
    }
  })
}

function mapGrantToItems(
  grant: ContentGrant,
  vocabulary: GrantDisplayVocabulary,
  idPrefix: string,
  level: number,
): GrantSummaryItem[] {
  if (grant.kind === 'sense') {
    return [
      {
        id: `${idPrefix}:sense`,
        label: formatSenseCompactLabel(grant, vocabulary),
        kind: 'sense',
        supported: true,
        sourceGrantKind: grant.kind,
        level,
      },
    ]
  }

  if (grant.kind === 'spells') {
    return mapSpellGrantToItems(grant, vocabulary, idPrefix, level)
  }

  if (!isKnownGrantKind(grant.kind)) {
    const rawKind =
      typeof grant === 'object' && grant !== null && 'kind' in grant
        ? String((grant as { kind: unknown }).kind)
        : 'unknown'

    return [
      {
        id: `${idPrefix}:unrecognized`,
        label: '',
        kind: 'unrecognized',
        supported: false,
        sourceGrantKind: rawKind,
        level,
      },
    ]
  }

  return [
    {
      id: `${idPrefix}:${grant.kind}`,
      label: '',
      kind: 'notRenderedYet',
      supported: false,
      sourceGrantKind: grant.kind,
      level,
    },
  ]
}

function formatSupportedItemLabel(item: GrantSummaryItem, includeTypeSuffix?: boolean): string {
  if (!item.supported) return ''

  if (includeTypeSuffix && (item.kind === 'cantrip' || item.kind === 'spell')) {
    return `${item.label} ${formatSpellTypeSuffix(item.kind)}`
  }

  return item.label
}

function buildSupportedDisplayParts(
  items: GrantSummaryItem[],
  includeTypeSuffix?: boolean,
): string[] {
  return items
    .filter((item) => item.supported)
    .map((item) => formatSupportedItemLabel(item, includeTypeSuffix))
    .filter((label) => label.length > 0)
}

function appendNotRenderedDisplayParts(
  parts: string[],
  notRendered: GrantSummaryItem[],
  supportedCount: number,
  exposeUnsupportedGrants?: boolean,
): string[] {
  const hiddenKnownValid = notRendered.filter(isHiddenKnownValidGrant)
  const unrecognized = notRendered.filter((item) => item.kind === 'unrecognized')

  if (exposeUnsupportedGrants) {
    return [
      ...parts,
      ...notRendered.map((item) => `Unsupported grant: ${item.sourceGrantKind ?? 'unknown'}`),
    ]
  }

  if (supportedCount > 0 && hiddenKnownValid.length > 0) {
    return [...parts, formatMoreBenefitsLabel(hiddenKnownValid.length)]
  }

  if (supportedCount === 0 && hiddenKnownValid.length > 0) {
    return [formatBenefitCountLabel(hiddenKnownValid.length)]
  }

  if (unrecognized.length > 0 && supportedCount === 0 && hiddenKnownValid.length === 0) {
    return parts
  }

  return parts
}

function buildDisplayParts(
  items: GrantSummaryItem[],
  options?: Pick<GrantSummaryFormatOptions, 'includeTypeSuffix' | 'exposeUnsupportedGrants'>,
): string[] {
  const supported = items.filter(isRenderableGrant)
  const notRendered = items.filter((item) => !item.supported)
  const parts = buildSupportedDisplayParts(supported, options?.includeTypeSuffix)

  return appendNotRenderedDisplayParts(
    parts,
    notRendered,
    supported.length,
    options?.exposeUnsupportedGrants,
  )
}

function applyMaxItems(
  parts: string[],
  maxItems?: number,
): { parts: string[]; overflowCount?: number } {
  if (maxItems === undefined || parts.length <= maxItems) {
    return { parts }
  }

  return {
    parts: parts.slice(0, maxItems),
    overflowCount: parts.length - maxItems,
  }
}

/** Resolves spell slugs from catalog entries by `Spell.slug`. */
export function buildSpellGrantVocabulary(
  spells: readonly Spell[],
): GrantDisplayVocabulary['resolveSpell'] {
  const spellsBySlug = new Map(spells.map((spell) => [spell.slug, spell]))

  return (slug) => {
    const spell = spellsBySlug.get(slug)
    if (!spell) return undefined
    return { name: spell.name, level: spell.level }
  }
}

export function buildGrantSummaryModel(
  grantGroups: GrantGroup[] | undefined,
  vocabulary: GrantDisplayVocabulary,
  options?: { parentLevel?: number },
): GrantSummaryModel {
  const parentLevel = options?.parentLevel ?? 1
  const parentUnlock = { level: parentLevel }

  if (!grantGroups?.length) {
    return { groups: [], flatItems: [] }
  }

  const normalizedGroups = resolveGrantGroupsFromContent(
    { kind: 'custom', grantGroups },
    parentUnlock,
  )

  const groups: GrantSummaryGroup[] = normalizedGroups.map((group, groupIndex) => {
    const effectiveUnlock = getGrantGroupEffectiveUnlock(group, parentUnlock)!
    const level = effectiveUnlock.level

    const items = group.grants.flatMap((grant, grantIndex) =>
      mapGrantToItems(grant, vocabulary, `g${groupIndex}:l${level}:r${grantIndex}`, level),
    )

    return {
      id: `level-${level}-${groupIndex}`,
      level,
      label: `L${level}`,
      items,
    }
  })

  const flatItems = groups.flatMap((group) => group.items)
  const notRenderedCount = flatItems.filter(isHiddenKnownValidGrant).length

  return {
    groups,
    flatItems,
    ...(notRenderedCount > 0 ? { notRenderedCount } : {}),
  }
}

export function formatGrantSummaryInline(
  model: GrantSummaryModel,
  options?: GrantSummaryFormatOptions,
): string {
  const parts = buildDisplayParts(model.flatItems, options)
  const { parts: visibleParts, overflowCount } = applyMaxItems(parts, options?.maxItems)

  const text = visibleParts.join(GRANT_SUMMARY_JOIN)
  if (overflowCount === undefined || overflowCount === 0) {
    return text
  }

  return text.length > 0
    ? `${text}${GRANT_SUMMARY_JOIN}+${overflowCount} more`
    : `+${overflowCount} more`
}

export function formatGrantSummaryByLevel(
  model: GrantSummaryModel,
  options?: GrantSummaryFormatOptions,
): Array<{ label: string; text: string }> {
  return model.groups
    .map((group) => ({
      label: group.label,
      text: buildDisplayParts(group.items, options).join(GRANT_SUMMARY_JOIN),
    }))
    .filter((entry) => entry.text.length > 0)
}
