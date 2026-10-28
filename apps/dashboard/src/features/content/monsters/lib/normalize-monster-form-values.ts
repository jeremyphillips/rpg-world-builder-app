import {
  creatureWeaponProficienciesSchema,
  creatureWeaponProficiencyTargetsFromGrantSet,
  monsterActionDraftSchema,
  monsterReactionDraftSchema,
  type ContentValidationIntent,
} from '@rpg/contracts'

import { monsterActionActiveKeys } from './actions/monster-action-kind'

import { movementRowsToRecordForPreview } from '../../lib/forms/fields/content-movement-form-fields'

import { weaponProficiencyGrantSetFromMode } from '@/lib/forms/grant-sets/weapon-proficiency-grant-mode.lib'

import {
  coerceCreatureWeaponProficienciesForForm,
  MONSTER_DEFAULT_WEAPON_PROFICIENCY_MODE,
} from './creature-details/monster-weapon-proficiencies-form.lib'
import type { MonsterFormValues } from './monster-form-values'

export type MonsterNormalizeBaseline = {
  hover?: boolean
  description?: string
  experiencePointsOverride?: number
}

export type NormalizeMonsterFormOptions = {
  baseline?: MonsterNormalizeBaseline
  intent: ContentValidationIntent
  mode?: 'create' | 'update'
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Drops blank strings so cleared fields are absent rather than empty. */
export function omitEmptyStrings(value: unknown): unknown {
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : undefined
  }
  if (Array.isArray(value)) {
    return value.map((entry) => omitEmptyStrings(entry))
  }
  if (!isRecord(value)) return value
  const next: Record<string, unknown> = {}
  for (const [key, entry] of Object.entries(value)) {
    const cleaned = omitEmptyStrings(entry)
    if (cleaned !== undefined) next[key] = cleaned
  }
  return next
}

function pickKeys(
  value: Record<string, unknown>,
  keys: readonly string[],
): Record<string, unknown> {
  const next: Record<string, unknown> = {}
  for (const key of keys) {
    if (value[key] !== undefined) next[key] = value[key]
  }
  return next
}

function normalizeAction(
  action: unknown,
  section: 'actions' | 'bonusActions' | 'reactions',
): unknown {
  if (!isRecord(action)) return action
  const cleaned = omitEmptyStrings(action)
  if (!isRecord(cleaned)) return cleaned
  const keys =
    typeof cleaned.kind === 'string' ? monsterActionActiveKeys(cleaned.kind, section) : []
  const active = keys.length > 0 ? pickKeys(cleaned, keys) : cleaned
  const schema = section === 'reactions' ? monsterReactionDraftSchema : monsterActionDraftSchema
  const parsed = schema.safeParse(active)
  if (!parsed.success) return active
  // Keep authored keys. Draft parse can insert defaults the author did not type.
  const parsedRecord = parsed.data as Record<string, unknown>
  const stable: Record<string, unknown> = {}
  for (const key of Object.keys(active)) {
    if (parsedRecord[key] !== undefined) stable[key] = parsedRecord[key]
  }
  return stable
}

function normalizeArmorClass(armorClass: MonsterFormValues['armorClass']): Record<string, unknown> {
  const next: Record<string, unknown> = {}
  if (typeof armorClass.naturalArmorBonus === 'number' && armorClass.naturalArmorBonus > 0) {
    next.naturalArmorBonus = armorClass.naturalArmorBonus
  }
  if (armorClass.useFixedAc && typeof armorClass.fixedValue === 'number') {
    next.fixedValue = armorClass.fixedValue
  }
  return next
}

function normalizeHitPoints(hitPoints: MonsterFormValues['hitPoints']): Record<string, unknown> {
  if (hitPoints.kind === 'hit-dice') {
    const count = hitPoints.count
    if (!Number.isInteger(count) || count < 1) {
      return { kind: 'hit-dice' }
    }
    return { kind: 'hit-dice', count }
  }
  const next: Record<string, unknown> = { kind: 'fixed' }
  if (hitPoints.average !== undefined) next.average = hitPoints.average
  return next
}

function dedupeSkillProficiencies(
  skills: MonsterFormValues['proficiencies']['skills'],
): MonsterFormValues['proficiencies']['skills'] {
  const seen = new Set<string>()
  const next: MonsterFormValues['proficiencies']['skills'] = []
  for (const row of skills) {
    if (seen.has(row.skill)) continue
    seen.add(row.skill)
    next.push(row)
  }
  return next
}

function normalizeLanguageProficiencies(
  languages: MonsterFormValues['proficiencies']['languages'],
): MonsterFormValues['proficiencies']['languages'] {
  const seen = new Set<string>()
  const next: MonsterFormValues['proficiencies']['languages'] = []
  for (const row of languages ?? []) {
    if (seen.has(row.language)) continue
    seen.add(row.language)
    if (row.speaks === false) {
      next.push({ language: row.language, speaks: false })
    } else {
      next.push({ language: row.language })
    }
  }
  return next
}

function normalizeProficiencies(
  proficiencies: MonsterFormValues['proficiencies'],
  weaponProficiencyMode: MonsterFormValues['weaponProficiencyMode'],
): Record<string, unknown> {
  const coercedWeapons = coerceCreatureWeaponProficienciesForForm(proficiencies.weapons)
  const grantSet = weaponProficiencyGrantSetFromMode(
    weaponProficiencyMode ?? MONSTER_DEFAULT_WEAPON_PROFICIENCY_MODE,
    coercedWeapons,
  )
  const weapons = creatureWeaponProficiencyTargetsFromGrantSet(
    creatureWeaponProficienciesSchema.parse(grantSet),
  )
  return {
    ...proficiencies,
    skills: dedupeSkillProficiencies(proficiencies.skills ?? []),
    languages: normalizeLanguageProficiencies(proficiencies.languages),
    weapons,
  }
}

function normalizeCommunication(
  communication: MonsterFormValues['communication'],
): Record<string, unknown> {
  const cleaned = omitEmptyStrings(communication)
  if (!isRecord(cleaned)) return {}
  if (typeof cleaned.telepathy === 'number') return { telepathy: cleaned.telepathy }
  return {}
}

/**
 * Single serializer for monster preview and save.
 * Inactive AC, HP, and action-kind fields are dropped. Empty strings are absent.
 * Update payloads send `null` only for clearable keys the baseline actually had.
 */
export function normalizeMonsterFormValues(
  values: MonsterFormValues,
  options: NormalizeMonsterFormOptions,
): Record<string, unknown> {
  const movementRecord = movementRowsToRecordForPreview(values.movement ?? [])
  const hasFly = typeof movementRecord.fly === 'number'
  const challengeRating = values.challengeRating

  const normalized: Record<string, unknown> = {
    name: typeof values.name === 'string' ? values.name : '',
    size: values.size,
    creatureType: values.creatureType,
    alignment: values.alignment,
    abilityScores: values.abilityScores,
    armorClass: normalizeArmorClass(values.armorClass),
    hitPoints: normalizeHitPoints(values.hitPoints),
    movement: movementRecord,
    senses: values.senses ?? [],
    communication: normalizeCommunication(values.communication),
    proficiencies: normalizeProficiencies(
      values.proficiencies,
      values.weaponProficiencyMode ?? MONSTER_DEFAULT_WEAPON_PROFICIENCY_MODE,
    ),
    defenses: values.defenses,
    equipment: values.equipment,
    traits: omitEmptyStrings(values.traits),
    actions: (values.actions ?? []).map((action) => normalizeAction(action, 'actions')),
    bonusActions: (values.bonusActions ?? []).map((action) =>
      normalizeAction(action, 'bonusActions'),
    ),
    reactions: (values.reactions ?? []).map((action) => normalizeAction(action, 'reactions')),
  }

  applyOptionalScalars(normalized, values, challengeRating, hasFly)
  if (options.mode === 'update' && options.baseline) {
    applyClearableNulls(normalized, options.baseline, hasFly)
  }

  return omitEmptyStrings(normalized) as Record<string, unknown>
}

function applyOptionalScalars(
  normalized: Record<string, unknown>,
  values: MonsterFormValues,
  challengeRating: MonsterFormValues['challengeRating'],
  hasFly: boolean,
): void {
  if (challengeRating) normalized.challengeRating = challengeRating
  if (hasFly && values.hover !== undefined) normalized.hover = values.hover
  if (typeof values.description === 'string' && values.description.trim()) {
    normalized.description = values.description.trim()
  }
  if (challengeRating === '0' && values.experiencePointsOverride === 0) {
    normalized.experiencePointsOverride = 0
  }
}

function applyClearableNulls(
  normalized: Record<string, unknown>,
  baseline: NonNullable<NormalizeMonsterFormOptions['baseline']>,
  hasFly: boolean,
): void {
  if (baseline.description !== undefined && normalized.description === undefined) {
    normalized.description = null
  }
  if (baseline.hover !== undefined && !hasFly) normalized.hover = null
  if (
    baseline.experiencePointsOverride !== undefined &&
    normalized.experiencePointsOverride === undefined
  ) {
    normalized.experiencePointsOverride = null
  }
}
