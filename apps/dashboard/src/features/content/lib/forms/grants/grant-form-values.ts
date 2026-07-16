import type {
  Ability,
  ContentGrant,
  DamageTypeId,
  FeatCategory,
  GrantGroup,
  GrantGroups,
  GrantUnlock,
  MovementBonusFeet,
  MovementSpeedFeet,
  SenseId,
} from '@rpg/contracts'
import { flattenGrantGroups, normalizeGrantGroups } from '@rpg/contracts'

import {
  type GrantRowForm,
  type GrantRowType,
  GRANT_DEFAULT_UNLOCK_LEVEL,
} from './grant-form-schema'
import type { EquipmentGrantItemForm } from './equipment-grant-form-fields'
import { equipmentGrantFromFormRow, equipmentGrantToFormRow } from './equipment-grant-form-values'
import type {
  ArmorTrainingItemForm,
  SkillProficiencyItemForm,
  ToolProficiencyItemForm,
  WeaponProficiencyItemForm,
} from './proficiency-grant-form-fields'
import {
  armorTrainingGrantFromFormRow,
  armorTrainingGrantToFormRow,
  skillProficiencyGrantFromFormRow,
  skillProficiencyGrantToFormRow,
  toolProficiencyGrantFromFormRow,
  toolProficiencyGrantToFormRow,
  weaponProficiencyGrantFromFormRow,
  weaponProficiencyGrantToFormRow,
} from './proficiency-grant-form-values'

// ---------------------------------------------------------------------------
// Empty row factory
// ---------------------------------------------------------------------------

function emptyGrantRow(grantType: GrantRowType): GrantRowForm {
  return {
    grantType,
    unlockLevel: GRANT_DEFAULT_UNLOCK_LEVEL,
    resistances: [],
    damageType: [],
    senseType: undefined,
    senseRange: undefined,
    movementMode: undefined,
    movementOperation: undefined,
    movementFeet: undefined,
    movementMatchMode: undefined,
    language: undefined,
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

function grantRows(
  grantType: GrantRowType,
  unlockLevel: number | undefined,
  values: Partial<GrantRowForm>,
): GrantRowForm[] {
  return [{ ...emptyGrantRow(grantType), unlockLevel: formUnlockLevel(unlockLevel), ...values }]
}

type ContentGrantRowsConverter<K extends ContentGrant['kind']> = (
  grant: Extract<ContentGrant, { kind: K }>,
  unlockLevel?: number,
) => GrantRowForm[]

const CONTENT_GRANT_TO_FORM_ROWS = {
  sense: (grant, unlockLevel) =>
    grantRows('senses', unlockLevel, { senseType: grant.type, senseRange: grant.range }),
  resistances: (grant, unlockLevel) =>
    grantRows('resistances', unlockLevel, { resistances: grant.damageTypes }),
  damageType: (grant, unlockLevel) =>
    grantRows('damageType', unlockLevel, { damageType: grant.damageTypes }),
  movement: (grant, unlockLevel) => {
    const base = {
      movementMode: grant.mode,
      movementOperation: grant.operation,
    }
    if (grant.operation === 'match') {
      return grantRows('movement', unlockLevel, {
        ...base,
        movementMatchMode: grant.matchMode,
      })
    }
    return grantRows('movement', unlockLevel, {
      ...base,
      movementFeet: grant.feet,
    })
  },
  weaponProficiency: (grant, unlockLevel) => [
    {
      grantType: 'weaponProficiency',
      unlockLevel: formUnlockLevel(unlockLevel),
      ...weaponProficiencyGrantToFormRow(grant.grant),
    },
  ],
  toolProficiency: (grant, unlockLevel) => [
    {
      grantType: 'toolProficiency',
      unlockLevel: formUnlockLevel(unlockLevel),
      ...toolProficiencyGrantToFormRow(grant.grant),
    },
  ],
  skillProficiency: (grant, unlockLevel) => [
    {
      grantType: 'skillProficiency',
      unlockLevel: formUnlockLevel(unlockLevel),
      ...skillProficiencyGrantToFormRow(grant.grant),
    },
  ],
  armorTraining: (grant, unlockLevel) => [
    {
      grantType: 'armorTraining',
      unlockLevel: formUnlockLevel(unlockLevel),
      ...armorTrainingGrantToFormRow(grant.grant),
    },
  ],
  languages: (grant, unlockLevel) =>
    grant.languageIds.map((id) => ({
      ...emptyGrantRow('languages'),
      unlockLevel: formUnlockLevel(unlockLevel),
      language: id,
    })),
  featChoice: (grant, unlockLevel) =>
    grantRows('featChoice', unlockLevel, {
      featCategory: grant.category,
      featChoose: grant.choose,
      featAllowAnyQualifying: grant.allowAnyQualifying ?? false,
      featReplaceable: grant.replaceable ?? false,
      featRecommendedIds: grant.recommendedFeatIds ?? [],
    }),
  equipment: (grant, unlockLevel) => [
    {
      grantType: 'equipment',
      unlockLevel: formUnlockLevel(unlockLevel),
      ...equipmentGrantToFormRow(grant.grant),
    },
  ],
  spells: (grant, unlockLevel) =>
    grantRows('spells', unlockLevel, {
      spellAbility: grant.ability,
      spellMode: grant.mode,
      spellFrequency: grant.frequency,
      spellIds: grant.spellIds,
    }),
  languageChoice: () => [],
} satisfies { [K in ContentGrant['kind']]: ContentGrantRowsConverter<K> }

/**
 * Converts a single atomic `ContentGrant` into one or more flat grant row form
 * values, stamping the group's `unlockLevel` onto each row.
 *
 * `languages` grants expand into one row per language ID to preserve the
 * single-language-per-row authoring UX.
 */
function contentGrantToFormRows(grant: ContentGrant, unlockLevel?: number): GrantRowForm[] {
  const convert = CONTENT_GRANT_TO_FORM_ROWS[grant.kind] as (
    grant: ContentGrant,
    unlockLevel?: number,
  ) => GrantRowForm[]
  return convert(grant, unlockLevel)
}

// ---------------------------------------------------------------------------
// GrantRowForm → atomic ContentGrant (one row → one grant or nothing)
// ---------------------------------------------------------------------------

function weaponProficiencyToGrant(row: GrantRowForm): ContentGrant | undefined {
  if (!row.proficiencySource) return undefined
  return {
    kind: 'weaponProficiency',
    grant: weaponProficiencyGrantFromFormRow(row as WeaponProficiencyItemForm),
  }
}

function toolProficiencyToGrant(row: GrantRowForm): ContentGrant | undefined {
  if (!row.proficiencySource) return undefined
  return {
    kind: 'toolProficiency',
    grant: toolProficiencyGrantFromFormRow(row as ToolProficiencyItemForm),
  }
}

function skillProficiencyToGrant(row: GrantRowForm): ContentGrant | undefined {
  if (!row.proficiencySource) return undefined
  return {
    kind: 'skillProficiency',
    grant: skillProficiencyGrantFromFormRow(row as SkillProficiencyItemForm),
  }
}

function armorTrainingToGrant(row: GrantRowForm): ContentGrant | undefined {
  if (!row.proficiencySource) return undefined
  return {
    kind: 'armorTraining',
    grant: armorTrainingGrantFromFormRow(row as ArmorTrainingItemForm),
  }
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

function movementToGrant(row: GrantRowForm): ContentGrant | undefined {
  if (!row.movementMode || !row.movementOperation) return undefined

  if (row.movementOperation === 'match') {
    if (!row.movementMatchMode || row.movementMatchMode === row.movementMode) return undefined
    return {
      kind: 'movement',
      mode: row.movementMode,
      operation: 'match',
      matchMode: row.movementMatchMode,
    }
  }

  if (row.movementFeet === undefined) return undefined
  const feet = typeof row.movementFeet === 'number' ? row.movementFeet : Number(row.movementFeet)
  if (!Number.isFinite(feet)) return undefined

  if (row.movementOperation === 'increase') {
    return {
      kind: 'movement',
      mode: row.movementMode,
      operation: 'increase',
      feet: feet as MovementBonusFeet,
    }
  }

  return {
    kind: 'movement',
    mode: row.movementMode,
    operation: 'set',
    feet: feet as MovementSpeedFeet,
  }
}

function languagesToGrant(row: GrantRowForm): ContentGrant | undefined {
  if (!row.language) return undefined
  return { kind: 'languages', languageIds: [row.language] }
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

type GrantRowContentConverter = (row: GrantRowForm) => ContentGrant | undefined

const FORM_ROW_TO_CONTENT_GRANT: Partial<Record<GrantRowType, GrantRowContentConverter>> = {
  senses: sensesToGrant,
  resistances: resistancesToGrant,
  damageType: damageTypeToGrant,
  movement: movementToGrant,
  languages: languagesToGrant,
  weaponProficiency: weaponProficiencyToGrant,
  toolProficiency: toolProficiencyToGrant,
  skillProficiency: skillProficiencyToGrant,
  armorTraining: armorTrainingToGrant,
  featChoice: featChoiceToGrant,
  equipment: equipmentToGrant,
  spells: spellsToGrant,
}

/**
 * Converts a single grant row form value into an atomic `ContentGrant`, or
 * `undefined` when the row is incomplete (transient/empty rows are silently
 * dropped).
 */
export function formRowToContentGrant(row: GrantRowForm): ContentGrant | undefined {
  return FORM_ROW_TO_CONTENT_GRANT[row.grantType]?.(row)
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
