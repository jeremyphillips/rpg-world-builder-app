import {
  monsterActionDraftSchema,
  monsterReactionDraftSchema,
  type ContentValidationIntent,
} from '@rpg/contracts'

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

const WEAPON_KEYS = ['id', 'kind', 'name', 'equipmentEntryId', 'description', 'trigger'] as const
const NATURAL_KEYS = [
  'id',
  'kind',
  'name',
  'mode',
  'properties',
  'reach',
  'range',
  'damage',
  'damageType',
  'description',
  'trigger',
] as const
const SPECIAL_KEYS = ['id', 'kind', 'name', 'description', 'trigger'] as const

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

function keysForActionKind(kind: unknown): readonly string[] {
  if (kind === 'weapon') return WEAPON_KEYS
  if (kind === 'natural-weapon') return NATURAL_KEYS
  if (kind === 'special') return SPECIAL_KEYS
  return []
}

function normalizeAction(
  action: unknown,
  section: 'actions' | 'bonusActions' | 'reactions',
): unknown {
  if (!isRecord(action)) return action
  const cleaned = omitEmptyStrings(action)
  if (!isRecord(cleaned)) return cleaned
  const keys = keysForActionKind(cleaned.kind)
  const active =
    keys.length > 0
      ? pickKeys(cleaned, section === 'reactions' ? keys : keys.filter((key) => key !== 'trigger'))
      : cleaned
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
  if (armorClass.kind === 'natural') {
    return { kind: 'natural', bonus: armorClass.bonus }
  }
  if (armorClass.kind === 'fixed') {
    const next: Record<string, unknown> = { kind: 'fixed' }
    if ('value' in armorClass && armorClass.value !== undefined) next.value = armorClass.value
    return next
  }
  return { kind: armorClass.kind }
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
  if (typeof hitPoints.formula === 'string' && hitPoints.formula.trim()) {
    next.formula = hitPoints.formula.trim()
  }
  return next
}

function normalizeLanguages(languages: MonsterFormValues['languages']): Record<string, unknown> {
  const cleaned = omitEmptyStrings(languages)
  if (!isRecord(cleaned)) return { entries: [] }
  const entries = Array.isArray(cleaned.entries) ? cleaned.entries : []
  const nextEntries = entries.map((entry) => {
    if (!isRecord(entry)) return entry
    const row: Record<string, unknown> = { language: entry.language }
    if (entry.speaks === false) row.speaks = false
    return row
  })
  const next: Record<string, unknown> = { entries: nextEntries }
  if (typeof cleaned.telepathy === 'number') next.telepathy = cleaned.telepathy
  if (typeof cleaned.note === 'string') next.note = cleaned.note
  return next
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
  const movement = omitEmptyStrings(values.movement)
  const movementRecord = isRecord(movement) ? movement : {}
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
    languages: normalizeLanguages(values.languages),
    proficiencies: values.proficiencies,
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
