import { getContentTypeCapitalizedSentenceLabel, getContentTypeTerm } from '@rpg/contracts'

const BASE_GRANT_TYPES = [
  'resistances',
  'senses',
  'damageType',
  'movement',
  'weaponProficiency',
  'toolProficiency',
  'skillProficiency',
  'armorTraining',
  'languages',
  'rollAdjustment',
  'saveOutcomeOverride',
] as const

/** Grant types exposed in species traits and class-feature grant pickers. */
export const GRANT_TYPES = [...BASE_GRANT_TYPES, 'spells', 'featChoice'] as const

/** Managed class spellcasting activation — not in Add Grant menus. */
export const MANAGED_SPELLCASTING_GRANT_TYPE = 'spellcasting' as const

/** All grant row discriminators, including types not yet wired into consumer forms. */
export const GRANT_ROW_TYPES = [
  ...GRANT_TYPES,
  'equipment',
  MANAGED_SPELLCASTING_GRANT_TYPE,
] as const

type BaseGrantType = (typeof BASE_GRANT_TYPES)[number]
export type GrantType = (typeof GRANT_TYPES)[number]
export type GrantRowType = (typeof GRANT_ROW_TYPES)[number]

const BASE_GRANT_TYPE_LABELS: Record<BaseGrantType, string> = {
  resistances: 'Damage resistance',
  senses: 'Special sense',
  damageType: 'Damage type',
  movement: 'Movement',
  weaponProficiency: 'Weapon proficiency',
  toolProficiency: 'Tool proficiency',
  skillProficiency: 'Skill proficiency',
  armorTraining: 'Armor training',
  languages: 'Language',
  rollAdjustment: 'Roll adjustment',
  saveOutcomeOverride: 'Saving throw success',
}

export const GRANT_TYPE_LABELS: Record<GrantType, string> = {
  ...BASE_GRANT_TYPE_LABELS,
  spells: getContentTypeCapitalizedSentenceLabel('spells', { plural: true }),
  featChoice: `${getContentTypeTerm('feats').label} choice`,
}

export const GRANT_ROW_TYPE_LABELS: Record<GrantRowType, string> = {
  ...GRANT_TYPE_LABELS,
  equipment: getContentTypeTerm('equipment').label,
  spellcasting: 'Spellcasting',
}

/** Label shown in the "Granted at" select when the row has no explicit unlock level. */
export const GRANT_DEFAULT_UNLOCK_LABEL = 'when feature is gained'

/** User-facing label for a grant row unlocked at a specific character level. */
export function formatGrantUnlockLevelLabel(level: number): string {
  return `at level ${level}`
}

/** Radix Select rejects empty-string item values; use this for the default unlock level. */
export const GRANT_DEFAULT_UNLOCK_LEVEL = 'default' as const