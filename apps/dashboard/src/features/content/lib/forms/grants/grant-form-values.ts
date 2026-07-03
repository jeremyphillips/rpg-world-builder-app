import type {
  Ability,
  ArmorCategory,
  ContentGrant,
  ContentGrants,
  ContentProficiencies,
  DamageTypeId,
  FeatCategory,
  GrantGroup,
  GrantGroups,
  GrantUnlock,
  SenseId,
  SkillId,
} from '@rpg/contracts'
import { flattenGrantGroups, normalizeGrantGroups } from '@rpg/contracts'

import { type GrantRowForm, type GrantType, GRANT_DEFAULT_UNLOCK_LEVEL } from './grant-form-schema'
import type { EquipmentGrantItemForm } from './equipment-grant-form-fields'
import { equipmentGrantFromFormRow, equipmentGrantToFormRow } from './equipment-grant-form-values'

// ---------------------------------------------------------------------------
// Empty row factory
// ---------------------------------------------------------------------------

function emptyGrantRow(grantType: GrantType): GrantRowForm {
  return {
    grantType,
    unlockLevel: GRANT_DEFAULT_UNLOCK_LEVEL,
    resistances: [],
    damageType: [],
    senseType: undefined,
    senseRange: undefined,
    speedWalkOverride: undefined,
    language: undefined,
    proficiencySkills: [],
    proficiencyArmor: [],
    proficiencyTools: [],
    proficiencyWeapons: [],
    spellAbility: undefined,
    spellMode: undefined,
    spellFrequency: undefined,
    spellIds: [],
    featCategory: undefined,
    featChoose: 1,
    featAllowAnyQualifying: false,
    featReplaceable: false,
    featRecommendedIds: [],
  }
}

function optionalGrantRow(row: GrantRowForm | undefined): GrantRowForm[] {
  return row ? [row] : []
}

function formUnlockLevel(unlockLevel?: number): GrantRowForm['unlockLevel'] {
  return unlockLevel ?? GRANT_DEFAULT_UNLOCK_LEVEL
}

function unlockLevelGroupKey(unlockLevel: GrantRowForm['unlockLevel']): number | undefined {
  if (unlockLevel === undefined || unlockLevel === GRANT_DEFAULT_UNLOCK_LEVEL) {
    return undefined
  }
  return typeof unlockLevel === 'number' ? unlockLevel : Number(unlockLevel)
}

// ---------------------------------------------------------------------------
// Atomic ContentGrant → GrantRowForm (one grant may produce multiple rows)
// ---------------------------------------------------------------------------

/**
 * Converts a single atomic `ContentGrant` into one or more flat grant row form
 * values, stamping the group's `unlockLevel` onto each row.
 *
 * `languages` grants expand into one row per language ID to preserve the
 * single-language-per-row authoring UX.
 */
function contentGrantToFormRows(grant: ContentGrant, unlockLevel?: number): GrantRowForm[] {
  switch (grant.kind) {
    case 'sense':
      return [
        {
          ...emptyGrantRow('senses'),
          unlockLevel: formUnlockLevel(unlockLevel),
          senseType: grant.type,
          senseRange: grant.range,
        },
      ]
    case 'resistances':
      return [{ ...emptyGrantRow('resistances'), unlockLevel: formUnlockLevel(unlockLevel), resistances: grant.damageTypes }]
    case 'damageType':
      return [{ ...emptyGrantRow('damageType'), unlockLevel: formUnlockLevel(unlockLevel), damageType: grant.damageTypes }]
    case 'speedOverride':
      return [{ ...emptyGrantRow('speedOverride'), unlockLevel: formUnlockLevel(unlockLevel), speedWalkOverride: grant.walk }]
    case 'proficiencies':
      return [
        {
          ...emptyGrantRow('proficiencies'),
          unlockLevel: formUnlockLevel(unlockLevel),
          proficiencySkills: grant.skills ?? [],
          proficiencyArmor: (grant.armor ?? []) as ArmorCategory[],
          proficiencyTools: grant.tools ?? [],
          proficiencyWeapons: grant.weapons ?? [],
        },
      ]
    case 'languages':
      return grant.languageIds.map((id) => ({
        ...emptyGrantRow('languages'),
        unlockLevel: formUnlockLevel(unlockLevel),
        language: id,
      }))
    case 'featChoice':
      return [
        {
          ...emptyGrantRow('featChoice'),
          unlockLevel: formUnlockLevel(unlockLevel),
          featCategory: grant.category,
          featChoose: grant.choose,
          featAllowAnyQualifying: grant.allowAnyQualifying ?? false,
          featReplaceable: grant.replaceable ?? false,
          featRecommendedIds: grant.recommendedFeatIds ?? [],
        },
      ]
    case 'equipment':
      return [{ grantType: 'equipment', unlockLevel: formUnlockLevel(unlockLevel), ...equipmentGrantToFormRow(grant.grant) }]
    case 'spells':
      return [
        {
          ...emptyGrantRow('spells'),
          unlockLevel: formUnlockLevel(unlockLevel),
          spellAbility: grant.ability,
          spellMode: grant.mode,
          spellFrequency: grant.frequency,
          spellIds: grant.spellIds,
        },
      ]
    case 'languageChoice':
      return []
    default:
      return []
  }
}

// ---------------------------------------------------------------------------
// GrantRowForm → atomic ContentGrant (one row → one grant or nothing)
// ---------------------------------------------------------------------------

function proficienciesFromRow(row: GrantRowForm): ContentProficiencies | undefined {
  const prof = Object.assign(
    {},
    row.proficiencySkills?.length ? { skills: row.proficiencySkills as SkillId[] } : {},
    row.proficiencyArmor?.length ? { armor: row.proficiencyArmor as ArmorCategory[] } : {},
    row.proficiencyTools?.length ? { tools: row.proficiencyTools } : {},
    row.proficiencyWeapons?.length ? { weapons: row.proficiencyWeapons } : {},
  )
  return Object.keys(prof).length ? prof : undefined
}

function sensesToGrant(row: GrantRowForm): ContentGrant | undefined {
  if (!row.senseType) return undefined
  return { kind: 'sense', type: row.senseType as SenseId, range: row.senseRange ?? 60 }
}

function resistancesToGrant(row: GrantRowForm): ContentGrant | undefined {
  if (!row.resistances?.length) return undefined
  return { kind: 'resistances', damageTypes: row.resistances as DamageTypeId[] }
}

function damageTypeToGrant(row: GrantRowForm): ContentGrant | undefined {
  if (!row.damageType?.length) return undefined
  return { kind: 'damageType', damageTypes: row.damageType as DamageTypeId[] }
}

function speedOverrideToGrant(row: GrantRowForm): ContentGrant | undefined {
  if (row.speedWalkOverride === undefined) return undefined
  return { kind: 'speedOverride', walk: row.speedWalkOverride }
}

function languagesToGrant(row: GrantRowForm): ContentGrant | undefined {
  if (!row.language) return undefined
  return { kind: 'languages', languageIds: [row.language] }
}

function proficienciesToGrant(row: GrantRowForm): ContentGrant | undefined {
  const prof = proficienciesFromRow(row)
  if (!prof) return undefined
  return { kind: 'proficiencies', ...prof }
}

function featChoiceToGrant(row: GrantRowForm): ContentGrant | undefined {
  if (!row.featCategory) return undefined
  return {
    kind: 'featChoice',
    category: row.featCategory as FeatCategory,
    choose: row.featChoose ?? 1,
    ...(row.featAllowAnyQualifying ? { allowAnyQualifying: true } : {}),
    ...(row.featReplaceable ? { replaceable: true } : {}),
    ...(row.featRecommendedIds?.length ? { recommendedFeatIds: row.featRecommendedIds } : {}),
  }
}

function equipmentToGrant(row: GrantRowForm): ContentGrant | undefined {
  if (!row.itemKind) return undefined
  return { kind: 'equipment', grant: equipmentGrantFromFormRow(row as EquipmentGrantItemForm) }
}

function spellsToGrant(row: GrantRowForm): ContentGrant | undefined {
  if (!row.spellAbility || !row.spellMode || !row.spellIds?.length) return undefined
  return {
    kind: 'spells',
    ability: row.spellAbility as Ability,
    mode: row.spellMode,
    ...(row.spellMode === 'free_cast' && row.spellFrequency
      ? { frequency: row.spellFrequency }
      : {}),
    spellIds: row.spellIds,
  }
}

/**
 * Converts a single grant row form value into an atomic `ContentGrant`, or
 * `undefined` when the row is incomplete (transient/empty rows are silently
 * dropped).
 */
export function formRowToContentGrant(row: GrantRowForm): ContentGrant | undefined {
  switch (row.grantType) {
    case 'senses':       return sensesToGrant(row)
    case 'resistances':  return resistancesToGrant(row)
    case 'damageType':   return damageTypeToGrant(row)
    case 'speedOverride': return speedOverrideToGrant(row)
    case 'languages':    return languagesToGrant(row)
    case 'proficiencies': return proficienciesToGrant(row)
    case 'featChoice':   return featChoiceToGrant(row)
    case 'equipment':    return equipmentToGrant(row)
    case 'spells':       return spellsToGrant(row)
    default:             return undefined
  }
}

// ---------------------------------------------------------------------------
// Primary mappers: GrantGroups ↔ flat GrantRowForm[]
// ---------------------------------------------------------------------------

/**
 * Flattens `grantGroups` into flat grant-row form values.
 * Each row receives an `unlockLevel` matching the group's `unlock.level`
 * (`undefined` for the default group, which maps to "When feature is gained").
 */
export function grantGroupsToFormRows(
  groups: GrantGroup[],
  _parentUnlock?: GrantUnlock,
): GrantRowForm[] {
  return flattenGrantGroups(groups).flatMap(({ grant, unlock }) =>
    contentGrantToFormRows(grant, unlock?.level),
  )
}

/**
 * Folds flat grant-row form values into canonical `GrantGroups`.
 * Rows are grouped by `unlockLevel`, then `normalizeGrantGroups` enforces
 * the canonical shape (sorted, no duplicates, default group first).
 * Empty / incomplete rows are silently dropped.
 */
export function formRowsToGrantGroups(
  rows: GrantRowForm[],
  parentUnlock?: GrantUnlock,
): GrantGroups {
  const byUnlock = new Map<number | undefined, GrantRowForm[]>()
  for (const row of rows) {
    const key = unlockLevelGroupKey(row.unlockLevel)
    const existing = byUnlock.get(key) ?? []
    byUnlock.set(key, [...existing, row])
  }

  const groups: GrantGroup[] = []

  const defaultRows = byUnlock.get(undefined)
  if (defaultRows) {
    const grants = defaultRows.flatMap((row) => {
      const grant = formRowToContentGrant(row)
      return grant ? [grant] : []
    })
    if (grants.length) groups.push({ grants })
  }

  const levelEntries = (
    Array.from(byUnlock.entries()) as Array<[number | undefined, GrantRowForm[]]>
  )
    .filter((entry): entry is [number, GrantRowForm[]] => entry[0] !== undefined)
    .sort(([a], [b]) => a - b)

  for (const [level, levelRows] of levelEntries) {
    const grants = levelRows.flatMap((row) => {
      const grant = formRowToContentGrant(row)
      return grant ? [grant] : []
    })
    if (grants.length) groups.push({ unlock: { level }, grants })
  }

  return normalizeGrantGroups(groups, parentUnlock)
}

// ---------------------------------------------------------------------------
// Legacy bridge: ContentGrants bag ↔ flat GrantRowForm[]
//
// Used for loading features / custom traits that still carry the old `grants`
// bag (no `grantGroups`). Deprecated — consumers should prefer
// `grantGroupsToFormRows` / `formRowsToGrantGroups`.
// ---------------------------------------------------------------------------

function senseGrantsToRows(senses: ContentGrants['senses']): GrantRowForm[] {
  return (senses ?? []).map((sense) => ({
    ...emptyGrantRow('senses'),
    senseType: sense.type,
    senseRange: sense.range,
  }))
}

function resistancesToRow(resistances: ContentGrants['resistances']): GrantRowForm | undefined {
  if (!resistances?.length) return undefined
  return { ...emptyGrantRow('resistances'), resistances }
}

function damageTypesToRow(damageType: ContentGrants['damageType']): GrantRowForm | undefined {
  if (!damageType?.length) return undefined
  return { ...emptyGrantRow('damageType'), damageType }
}

function speedOverrideToRow(
  speedOverride: ContentGrants['speedOverride'],
): GrantRowForm | undefined {
  if (speedOverride?.walk === undefined) return undefined
  return { ...emptyGrantRow('speedOverride'), speedWalkOverride: speedOverride.walk }
}

function languageGrantsToRows(languages: ContentGrants['languages']): GrantRowForm[] {
  return (languages ?? []).map((language) => ({ ...emptyGrantRow('languages'), language }))
}

function legacyProficienciesToRow(
  proficiencies: ContentGrants['proficiencies'],
): GrantRowForm | undefined {
  if (!proficiencies) return undefined
  const { skills, armor, tools, weapons } = proficiencies
  return {
    ...emptyGrantRow('proficiencies'),
    proficiencySkills: skills ?? [],
    proficiencyArmor: armor ?? [],
    proficiencyTools: tools ?? [],
    proficiencyWeapons: weapons ?? [],
  }
}

/** Each innate spell entry becomes a `spells` row, preserving the level as `unlockLevel`. */
function innateSpellsToSpellRows(innateSpells: ContentGrants['innateSpells']): GrantRowForm[] {
  if (!innateSpells) return []
  return innateSpells.entries.map((entry) => ({
    ...emptyGrantRow('spells'),
    unlockLevel: entry.level,
    spellAbility: innateSpells.ability,
    spellMode: entry.kind ?? 'free_cast',
    spellFrequency: entry.frequency,
    spellIds: entry.spellIds,
  }))
}

function featChoiceToRow(featChoice: ContentGrants['featChoice']): GrantRowForm | undefined {
  if (!featChoice) return undefined
  return {
    ...emptyGrantRow('featChoice'),
    featCategory: featChoice.category,
    featChoose: featChoice.choose,
    featAllowAnyQualifying: featChoice.allowAnyQualifying ?? false,
    featReplaceable: featChoice.replaceable ?? false,
    featRecommendedIds: featChoice.recommendedFeatIds ?? [],
  }
}

function equipmentGrantsToRows(equipment: ContentGrants['equipment']): GrantRowForm[] {
  return (equipment ?? []).map((grant) => ({
    grantType: 'equipment',
    ...equipmentGrantToFormRow(grant),
  }))
}

/**
 * Converts a legacy `ContentGrants` bag into flat grant-row form values.
 *
 * @deprecated Prefer `grantGroupsToFormRows` for the atomic model. This bridge
 *   exists for features and custom traits that carry only a `grants` bag (no
 *   `grantGroups`). It will be removed once all catalog seeds and homebrew are
 *   migrated.
 */
export function grantsToFormRows(grants: ContentGrants | undefined): GrantRowForm[] {
  if (!grants) return []
  return [
    ...senseGrantsToRows(grants.senses),
    ...optionalGrantRow(resistancesToRow(grants.resistances)),
    ...optionalGrantRow(damageTypesToRow(grants.damageType)),
    ...optionalGrantRow(speedOverrideToRow(grants.speedOverride)),
    ...languageGrantsToRows(grants.languages),
    ...optionalGrantRow(legacyProficienciesToRow(grants.proficiencies)),
    ...innateSpellsToSpellRows(grants.innateSpells),
    ...optionalGrantRow(featChoiceToRow(grants.featChoice)),
    ...equipmentGrantsToRows(grants.equipment),
  ]
}

function applySensesFromRows(result: ContentGrants, rows: GrantRowForm[]): void {
  const senseRows = rows.filter((row) => row.grantType === 'senses' && row.senseType)
  if (!senseRows.length) return
  result.senses = senseRows.map((row) => ({
    type: row.senseType as SenseId,
    range: row.senseRange ?? 60,
  }))
}

function applyResistancesFromRows(result: ContentGrants, rows: GrantRowForm[]): void {
  const row = rows.find((r) => r.grantType === 'resistances')
  if (!row?.resistances?.length) return
  result.resistances = row.resistances as DamageTypeId[]
}

function applyDamageTypesFromRows(result: ContentGrants, rows: GrantRowForm[]): void {
  const row = rows.find((r) => r.grantType === 'damageType')
  if (!row?.damageType?.length) return
  result.damageType = row.damageType as DamageTypeId[]
}

function applySpeedOverrideFromRows(result: ContentGrants, rows: GrantRowForm[]): void {
  const row = rows.find((r) => r.grantType === 'speedOverride')
  if (row?.speedWalkOverride === undefined) return
  result.speedOverride = { walk: row.speedWalkOverride }
}

function applyLanguagesFromRows(result: ContentGrants, rows: GrantRowForm[]): void {
  const languageRows = rows.filter((r) => r.grantType === 'languages' && r.language)
  if (!languageRows.length) return
  result.languages = languageRows.map((r) => r.language!)
}

function applyProficienciesFromRows(result: ContentGrants, rows: GrantRowForm[]): void {
  const row = rows.find((r) => r.grantType === 'proficiencies')
  if (!row) return
  const prof = proficienciesFromRow(row)
  if (prof) result.proficiencies = prof
}

function applyFeatChoiceFromRows(result: ContentGrants, rows: GrantRowForm[]): void {
  const row = rows.find((r) => r.grantType === 'featChoice')
  if (!row?.featCategory) return

  const choose = row.featChoose ?? 1
  const featChoice: ContentGrants['featChoice'] = {
    category: row.featCategory as FeatCategory,
    choose,
  }
  if (row.featAllowAnyQualifying) {
    featChoice.allowAnyQualifying = true
  }
  if (row.featReplaceable) {
    featChoice.replaceable = true
  }
  if (row.featRecommendedIds?.length) {
    featChoice.recommendedFeatIds = row.featRecommendedIds
  }
  result.featChoice = featChoice
}

function applyEquipmentFromRows(result: ContentGrants, rows: GrantRowForm[]): void {
  const equipmentRows = rows.filter((row) => row.grantType === 'equipment' && row.itemKind)
  if (!equipmentRows.length) return

  result.equipment = equipmentRows.map((row) =>
    equipmentGrantFromFormRow(row as EquipmentGrantItemForm),
  )
}

/**
 * Folds grant-row form values back into a legacy `ContentGrants` bag.
 *
 * @deprecated Prefer `formRowsToGrantGroups` for the atomic model. This bridge
 *   exists for consumers that still produce a `grants` bag. It will be removed
 *   once all consumers are migrated to `grantGroups`.
 */
export function formRowsToGrants(rows: GrantRowForm[]): ContentGrants | undefined {
  if (!rows.length) return undefined

  const result: ContentGrants = {}
  applySensesFromRows(result, rows)
  applyResistancesFromRows(result, rows)
  applyDamageTypesFromRows(result, rows)
  applySpeedOverrideFromRows(result, rows)
  applyLanguagesFromRows(result, rows)
  applyProficienciesFromRows(result, rows)
  applyFeatChoiceFromRows(result, rows)
  applyEquipmentFromRows(result, rows)

  return Object.keys(result).length ? result : undefined
}
