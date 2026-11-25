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
 *   uses `formatCreatureSensesCompactList` from contracts (done)
 * - `apps/dashboard/src/features/content/species/lib/species-display.ts` —
 *   `mapHeritageOptionToDetailItem`: grant summary lines via this helper (Phase 2, done)
 * - `apps/dashboard/src/features/content/species/lib/species-display.ts` — card
 *   `summaryItems`: trait names only → `formatGrantSummaryInline` (Phase 4, pending)
 * - `packages/contracts/src/rpg/content/lib/grants/trait-display.ts` — `deriveGrantGroupDisplay`:
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
 * | `sense` | yes | yes | via `formatCreatureSenseCompactLine` |
 * | `spells` | yes | yes | e.g. `Dancing Lights cantrip` |
 * | `movement` | yes | yes | e.g. `Walk speed +5 ft` |
 * | `damageType` | yes | yes | e.g. `Acid damage type` |
 * | `resistances` | yes | yes | e.g. `Acid resistance` |
 * | `languages` | yes | yes | e.g. `Common language`, `Common, Elvish languages` |
 * | `skillProficiency` | yes | yes | e.g. `Athletics proficiency` |
 * | `toolProficiency` | yes | yes | e.g. `Thieves' Tools proficiency` |
 * | `weaponProficiency` | yes | yes | e.g. `Simple weapons proficiency` |
 * | `armorTraining` | yes | yes | e.g. `Light armor training` |
 * | `equipment` | yes | yes | name only; services use `{Name} service` / `{A}, {B} services` |
 * | `featChoice`, `languageChoice` | yes | hidden | included in the benefit count |
 * | `rollAdjustment` | yes | yes | advantage or disadvantage sentence |
 * | `saveOutcomeOverride` | yes | yes | success-instead sentence with use notation |
 * | unrecognized kind | — | fallback | `Additional benefit` when sole unsummarized item |
 *
 * Terminology:
 * - **Unrecognized** — `ContentGrant` kind not in schema / unknown at runtime (`kind: 'unrecognized'`).
 * - **Not rendered yet** — known valid kind explicitly hidden from compact labels (`kind: 'notRenderedYet'`). Formatters collapse these to `N more benefit(s)`.
 */
import {
  formatCreatureSenseCompactLine,
  SENSE_TERM,
  type Sense,
  formatCreatureRollAdjustmentSentence,
  formatCreatureSaveOutcomeOverrideNotation,
  formatDamageTypeGrantCompact,
  formatLanguageGrantCompact,
  formatMovementGrantCompact,
  formatResistanceGrantCompact,
  formatArmorTrainingGrantCompact,
  formatEquipmentGrantCompact,
  formatSkillProficiencyGrantCompact,
  formatToolProficiencyGrantCompact,
  formatWeaponProficiencyGrantCompact,
  getGrantGroupEffectiveUnlock,
  resolveGrantGroupsFromContent,
  resolveMechanicalGrantsFromContent,
  presentSpellReferenceDisplayName,
  presentEquipmentReferenceDisplayName,
  resolveEquipmentSlugReference,
  resolveSpellReferenceOutcome,
  type SpellCatalogContext,
  type ContentGrant,
  type EquipmentKind,
  equipmentReferenceDisplayMessageForUnresolvedReason,
  type EquipmentCatalogContext,
  type GrantGroup,
} from '@rpg/contracts'
import { joinInlineMetadata } from '@rpg/contracts/primitives'

import { formatContentReferenceUnavailable } from '../../content-type-labels'

export type GrantDisplayVocabulary = {
  resolveSenseLabel: (type: string) => string | undefined
  resolveDamageTypeLabel?: (id: string) => string | undefined
  resolveLanguageLabel?: (id: string) => string | undefined
  spellCatalog: SpellCatalogContext
  equipmentCatalog?: EquipmentCatalogContext
  resolveSkillName?: (id: string) => string | undefined
}

export type GrantSummaryKind =
  | 'sense'
  | 'spell'
  | 'cantrip'
  | 'unresolvedSpell'
  | 'proficiency'
  | 'damageType'
  | 'resistance'
  | 'language'
  | 'training'
  | 'equipment'
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
    const outcome = resolveSpellReferenceOutcome(spellId, vocabulary.spellCatalog)
    const spellKind: GrantSummaryKind =
      outcome.status === 'unresolved'
        ? 'unresolvedSpell'
        : outcome.spell.level === 0
          ? 'cantrip'
          : 'spell'

    return {
      id: `${idPrefix}:spells:${spellIndex}`,
      label: presentSpellReferenceDisplayName(outcome),
      kind: spellKind,
      supported: true,
      sourceGrantKind: grant.kind,
      level,
    }
  })
}

function mapCompactProficiencyGrantToItems(
  label: string | undefined,
  idPrefix: string,
  sourceGrantKind: string,
  summaryKind: Extract<GrantSummaryKind, 'proficiency' | 'training' | 'equipment'>,
  level: number,
): GrantSummaryItem[] {
  if (!label) {
    return [
      {
        id: `${idPrefix}:notRendered`,
        label: '',
        kind: 'notRenderedYet',
        supported: false,
        sourceGrantKind,
        level,
      },
    ]
  }

  return [
    {
      id: idPrefix,
      label,
      kind: summaryKind,
      supported: true,
      sourceGrantKind,
      level,
    },
  ]
}

function createSupportedGrantItems(
  idPrefix: string,
  suffix: string,
  label: string,
  kind: GrantSummaryKind,
  sourceGrantKind: string,
  level: number,
): GrantSummaryItem[] {
  return [
    {
      id: `${idPrefix}:${suffix}`,
      label,
      kind,
      supported: true,
      sourceGrantKind,
      level,
    },
  ]
}

function mapUnrecognizedGrantToItems(
  grant: unknown,
  idPrefix: string,
  level: number,
): GrantSummaryItem[] {
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

function mapNotRenderedGrantToItems(
  sourceGrantKind: string,
  idPrefix: string,
  level: number,
): GrantSummaryItem[] {
  return [
    {
      id: `${idPrefix}:${sourceGrantKind}`,
      label: '',
      kind: 'notRenderedYet',
      supported: false,
      sourceGrantKind,
      level,
    },
  ]
}

type GrantItemMapper<K extends ContentGrant['kind']> = (
  grant: Extract<ContentGrant, { kind: K }>,
  vocabulary: GrantDisplayVocabulary,
  idPrefix: string,
  level: number,
) => GrantSummaryItem[]

function equipmentNameResolver(
  catalog: EquipmentCatalogContext | undefined,
): (slug: string) => string {
  return (slug) =>
    catalog
      ? presentEquipmentReferenceDisplayName(
          resolveEquipmentSlugReference(slug, catalog, catalog.scope),
        )
      : equipmentReferenceDisplayMessageForUnresolvedReason('catalog-unavailable')
}

function equipmentKindResolver(
  catalog: EquipmentCatalogContext | undefined,
): (slug: string) => EquipmentKind | undefined {
  return (slug) => {
    if (!catalog) return undefined
    const outcome = resolveEquipmentSlugReference(slug, catalog, catalog.scope)
    return outcome.status === 'resolved' ? outcome.equipment.kind : undefined
  }
}

export function formatScopedSenseSummary(
  sense: Sense,
  resolveLabel: GrantDisplayVocabulary['resolveSenseLabel'],
): string {
  const label = resolveLabel(sense.type)
  return label
    ? formatCreatureSenseCompactLine(sense, label)
    : `${SENSE_TERM.label} reference unavailable`
}

function formatScopedProficiencyReferences(
  ids: readonly string[],
  resolve: (id: string) => { label: string } | { unavailable: string },
  formatResolved: (ids: string[], label: (id: string) => string | undefined) => string | undefined,
): string | undefined {
  const names = new Map<string, string>()
  const unavailable = new Set<string>()
  for (const id of ids) {
    const result = resolve(id)
    if ('label' in result) names.set(id, result.label)
    else unavailable.add(result.unavailable)
  }
  const resolved = formatResolved(
    ids.filter((id) => names.has(id)),
    (id) => names.get(id),
  )
  return [resolved, ...unavailable].filter(Boolean).join(', ') || undefined
}

function formatScopedSkillSummary(
  grant: Extract<ContentGrant, { kind: 'skillProficiency' }>['grant'],
  resolveLabel: GrantDisplayVocabulary['resolveSkillName'],
): string | undefined {
  if (grant.kind !== 'fixed') return undefined
  return formatScopedProficiencyReferences(
    grant.skillIds,
    (id) => {
      const label = resolveLabel?.(id)
      return label
        ? { label }
        : { unavailable: formatContentReferenceUnavailable('skill-proficiencies') }
    },
    (skillIds, label) => formatSkillProficiencyGrantCompact({ ...grant, skillIds }, label),
  )
}

function formatScopedEquipmentProficiency(
  slugs: readonly string[] | undefined,
  catalog: EquipmentCatalogContext | undefined,
  formatResolved: Parameters<typeof formatScopedProficiencyReferences>[2],
): string | undefined {
  return formatScopedProficiencyReferences(
    slugs ?? [],
    (slug) => {
      if (!catalog)
        return {
          unavailable: equipmentReferenceDisplayMessageForUnresolvedReason('catalog-unavailable'),
        }
      const outcome = resolveEquipmentSlugReference(slug, catalog, catalog.scope)
      return outcome.status === 'resolved'
        ? { label: outcome.equipment.name }
        : { unavailable: presentEquipmentReferenceDisplayName(outcome) }
    },
    formatResolved,
  )
}

// Null entries participate in compact benefit counts without a visible label.
const GRANT_ITEM_MAPPERS = {
  languageChoice: null,
  featChoice: null,
  sense: (grant, vocabulary, idPrefix, level) =>
    createSupportedGrantItems(
      idPrefix,
      'sense',
      formatScopedSenseSummary(grant, vocabulary.resolveSenseLabel),
      'sense',
      grant.kind,
      level,
    ),
  spells: (grant, vocabulary, idPrefix, level) =>
    mapSpellGrantToItems(grant, vocabulary, idPrefix, level),
  movement: (grant, _vocabulary, idPrefix, level) =>
    createSupportedGrantItems(
      idPrefix,
      'movement',
      formatMovementGrantCompact(grant),
      'speed',
      grant.kind,
      level,
    ),
  damageType: (grant, vocabulary, idPrefix, level) =>
    createSupportedGrantItems(
      idPrefix,
      'damageType',
      formatDamageTypeGrantCompact(grant.damageTypes, vocabulary.resolveDamageTypeLabel),
      'damageType',
      grant.kind,
      level,
    ),
  resistances: (grant, vocabulary, idPrefix, level) =>
    createSupportedGrantItems(
      idPrefix,
      'resistances',
      formatResistanceGrantCompact(grant.damageTypes, vocabulary.resolveDamageTypeLabel),
      'resistance',
      grant.kind,
      level,
    ),
  languages: (grant, vocabulary, idPrefix, level) =>
    createSupportedGrantItems(
      idPrefix,
      'languages',
      formatLanguageGrantCompact(grant.languageIds, vocabulary.resolveLanguageLabel),
      'language',
      grant.kind,
      level,
    ),
  skillProficiency: (grant, vocabulary, idPrefix, level) =>
    mapCompactProficiencyGrantToItems(
      formatScopedSkillSummary(grant.grant, vocabulary.resolveSkillName),
      `${idPrefix}:skillProficiency`,
      grant.kind,
      'proficiency',
      level,
    ),
  toolProficiency: ({ grant, kind }, vocabulary, idPrefix, level) =>
    mapCompactProficiencyGrantToItems(
      grant.kind === 'fixed'
        ? formatScopedEquipmentProficiency(
            grant.toolSlugs,
            vocabulary.equipmentCatalog,
            (toolSlugs, label) => formatToolProficiencyGrantCompact({ ...grant, toolSlugs }, label),
          )
        : undefined,
      `${idPrefix}:toolProficiency`,
      kind,
      'proficiency',
      level,
    ),
  weaponProficiency: ({ grant, kind }, vocabulary, idPrefix, level) =>
    mapCompactProficiencyGrantToItems(
      grant.kind === 'fixed'
        ? formatScopedEquipmentProficiency(
            grant.weaponSlugs,
            vocabulary.equipmentCatalog,
            (weaponSlugs, label) =>
              formatWeaponProficiencyGrantCompact({ ...grant, weaponSlugs }, label),
          )
        : undefined,
      `${idPrefix}:weaponProficiency`,
      kind,
      'proficiency',
      level,
    ),
  armorTraining: ({ grant, kind }, vocabulary, idPrefix, level) =>
    mapCompactProficiencyGrantToItems(
      grant.kind === 'fixed'
        ? formatScopedEquipmentProficiency(
            grant.armorSlugs,
            vocabulary.equipmentCatalog,
            (armorSlugs, label) => formatArmorTrainingGrantCompact({ ...grant, armorSlugs }, label),
          )
        : undefined,
      `${idPrefix}:armorTraining`,
      kind,
      'training',
      level,
    ),
  equipment: (grant, vocabulary, idPrefix, level) =>
    mapCompactProficiencyGrantToItems(
      formatEquipmentGrantCompact(grant.grant, {
        resolveEquipmentName: equipmentNameResolver(vocabulary.equipmentCatalog),
        resolveEquipmentKind: equipmentKindResolver(vocabulary.equipmentCatalog),
      }),
      `${idPrefix}:equipment`,
      grant.kind,
      'equipment',
      level,
    ),
  rollAdjustment: (grant, _vocabulary, idPrefix, level) =>
    createSupportedGrantItems(
      idPrefix,
      'rollAdjustment',
      formatCreatureRollAdjustmentSentence(grant).replace(/\.$/, ''),
      'trait',
      grant.kind,
      level,
    ),
  saveOutcomeOverride: (grant, _vocabulary, idPrefix, level) => {
    const notation = formatCreatureSaveOutcomeOverrideNotation(grant.limitedUse)
    const label = `Succeed on a failed saving throw (${notation})`
    return createSupportedGrantItems(
      idPrefix,
      'saveOutcomeOverride',
      label,
      'trait',
      grant.kind,
      level,
    )
  },
} satisfies { [K in ContentGrant['kind']]: GrantItemMapper<K> | null }

function mapGrantToItems(
  grant: ContentGrant,
  vocabulary: GrantDisplayVocabulary,
  idPrefix: string,
  level: number,
): GrantSummaryItem[] {
  if (!Object.hasOwn(GRANT_ITEM_MAPPERS, grant.kind)) {
    return mapUnrecognizedGrantToItems(grant, idPrefix, level)
  }
  const mapper = GRANT_ITEM_MAPPERS[grant.kind] as GrantItemMapper<ContentGrant['kind']> | null
  return mapper
    ? mapper(grant, vocabulary, idPrefix, level)
    : mapNotRenderedGrantToItems(grant.kind, idPrefix, level)
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

export function buildGrantSummaryModel(
  grantGroups: GrantGroup[] | undefined,
  vocabulary: GrantDisplayVocabulary,
  options?: {
    parentLevel?: number
    trait?: Parameters<typeof resolveMechanicalGrantsFromContent>[0]
  },
): GrantSummaryModel {
  const parentLevel = options?.parentLevel ?? 1
  const parentUnlock = { level: parentLevel }

  const normalizedGroups = grantGroups?.length
    ? resolveGrantGroupsFromContent({ kind: 'custom', grantGroups }, parentUnlock)
    : options?.trait
      ? (() => {
          const grants = resolveMechanicalGrantsFromContent(options.trait, {
            parentLevel,
            level: parentLevel,
          })
          return grants.length ? [{ grants, unlock: parentUnlock }] : []
        })()
      : []

  if (normalizedGroups.length === 0) {
    return { groups: [], flatItems: [] }
  }

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

  const text = joinInlineMetadata(visibleParts)
  if (overflowCount === undefined || overflowCount === 0) {
    return text
  }

  return text.length > 0
    ? joinInlineMetadata([text, `+${overflowCount} more`])
    : `+${overflowCount} more`
}

export function formatGrantSummaryByLevel(
  model: GrantSummaryModel,
  options?: GrantSummaryFormatOptions,
): Array<{ label: string; text: string }> {
  return model.groups
    .map((group) => ({
      label: group.label,
      text: joinInlineMetadata(buildDisplayParts(group.items, options)),
    }))
    .filter((entry) => entry.text.length > 0)
}
