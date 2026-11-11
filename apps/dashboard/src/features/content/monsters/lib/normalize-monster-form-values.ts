import { normalizeRichTextHtml } from '@rpg/ui'
import {
  protectionFromArmorClass,
  creatureWeaponProficienciesSchema,
  creatureWeaponProficiencyTargetsFromGrantSet,
  monsterActionDraftSchema,
  monsterLegendaryActionDraftSchema,
  monsterReactionDraftSchema,
  type ArmorClassRules,
  type ContentValidationIntent,
} from '@rpg/contracts'

import { normalizeLimitedUse } from '../../lib/forms/limited-use/normalize-limited-use'
import { monsterActionActiveKeys, monsterActionTriggerText } from './actions/monster-action-kind'
import { normalizeMonsterSaveOutcomes } from './actions/monster-action-save-outcomes'
import { weaponActionDamageToDraft } from './actions/monster-weapon-damage-form'

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
  armorClassRules?: ArmorClassRules
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

function applyReactionTriggerDraft(
  cleaned: Record<string, unknown>,
  section: 'actions' | 'bonusActions' | 'reactions' | 'legendaryActions',
): void {
  if (section !== 'reactions') return
  const text = monsterActionTriggerText(cleaned.trigger)
  if (text) cleaned.trigger = { text }
  else delete cleaned.trigger
}

function applySaveOutcomeDraft(cleaned: Record<string, unknown>): void {
  if (cleaned.kind !== 'save' || !isRecord(cleaned.resolution)) return
  const resolution = cleaned.resolution
  if (!Array.isArray(resolution.outcomes)) return
  resolution.outcomes = normalizeMonsterSaveOutcomes(resolution.outcomes)
}

const RICH_TEXT_KEYS = ['description', 'descriptionOverride'] as const

function applyRichTextFields(record: Record<string, unknown>): void {
  for (const key of RICH_TEXT_KEYS) {
    const value = record[key]
    if (typeof value !== 'string') continue
    const normalized = normalizeRichTextHtml(value)
    if (normalized.length > 0) record[key] = normalized
    else delete record[key]
  }
}

function rollHasInput(roll: unknown): boolean {
  if (!isRecord(roll)) return false
  if (typeof roll.flat === 'number') return true
  const dice = roll.dice
  if (!isRecord(dice)) return false
  return typeof dice.count === 'number' || typeof dice.faces === 'number'
}

function effectRowHasInput(row: unknown): boolean {
  if (!isRecord(row)) return false
  if (typeof row.kind === 'string') return true
  if (row.damageType !== undefined || row.conditionId !== undefined) return true
  if (typeof row.description === 'string') return true
  return rollHasInput(row.roll)
}

/** Keeps fields that belong to the selected kind. A row with no kind stays as authored. */
function effectRowForKind(row: Record<string, unknown>): Record<string, unknown> {
  const description = row.description
  if (row.kind === 'damage') {
    return {
      kind: 'damage',
      ...(row.roll !== undefined ? { roll: row.roll } : {}),
      ...(row.damageType !== undefined ? { damageType: row.damageType } : {}),
      ...(description !== undefined ? { description } : {}),
    }
  }
  if (row.kind === 'condition') {
    return {
      kind: 'condition',
      ...(row.conditionId !== undefined ? { conditionId: row.conditionId } : {}),
      ...(description !== undefined ? { description } : {}),
    }
  }
  if (row.kind === 'note') {
    return {
      kind: 'note',
      ...(description !== undefined ? { description } : {}),
    }
  }
  return row
}

/** Drops an untouched effect shell. A started row stays, including an incomplete one. */
function omitEmptyOnHit(cleaned: Record<string, unknown>): void {
  if (!isRecord(cleaned.onHit)) return
  const rows = cleaned.onHit.effects
  if (!Array.isArray(rows)) {
    delete cleaned.onHit
    return
  }
  const authored = rows
    .filter(effectRowHasInput)
    .map((row) => effectRowForKind(row as Record<string, unknown>))
  if (authored.length === 0) {
    delete cleaned.onHit
    return
  }
  cleaned.onHit.effects = authored
}

function applyLimitedUseDraft(cleaned: Record<string, unknown>): void {
  if (!('limitedUse' in cleaned)) return
  const limitedUse = normalizeLimitedUse(cleaned.limitedUse)
  if (limitedUse) cleaned.limitedUse = limitedUse
  else delete cleaned.limitedUse
}

function applyTurnAndInvocationDraft(
  cleaned: Record<string, unknown>,
  section: 'actions' | 'bonusActions' | 'reactions' | 'legendaryActions',
): void {
  if (cleaned.onceUntilNextTurn === true || cleaned.onceUntilNextTurn === 'true') {
    cleaned.onceUntilNextTurn = true
  } else {
    delete cleaned.onceUntilNextTurn
  }
  if (section === 'legendaryActions' && cleaned.spellInvocation === 'use-entry') {
    cleaned.spellInvocation = 'use-entry'
    if (Array.isArray(cleaned.spells)) {
      cleaned.spells = cleaned.spells.map((spell) => {
        if (!isRecord(spell)) return spell
        const next = { ...spell }
        delete next.castAtLevel
        return next
      })
    }
  } else {
    delete cleaned.spellInvocation
  }
  if (Array.isArray(cleaned.actionIds)) {
    cleaned.actionIds = cleaned.actionIds.filter((id) => typeof id === 'string' && id.length > 0)
  }
  if (!isRecord(cleaned.movement)) {
    delete cleaned.movement
    return
  }
  const allowance = cleaned.movement.allowance
  if (allowance !== 'half-speed' && allowance !== 'speed') {
    delete cleaned.movement
    return
  }
  if (cleaned.movement.withoutOpportunityAttacks !== true) {
    delete cleaned.movement.withoutOpportunityAttacks
  }
}

function stabilizeDraftActionKeys(
  active: Record<string, unknown>,
  schema:
    | typeof monsterActionDraftSchema
    | typeof monsterReactionDraftSchema
    | typeof monsterLegendaryActionDraftSchema,
): unknown {
  const parsed = schema.safeParse(active)
  if (!parsed.success) return active
  const parsedRecord = parsed.data as Record<string, unknown>
  const stable: Record<string, unknown> = {}
  for (const key of Object.keys(active)) {
    if (parsedRecord[key] !== undefined) stable[key] = parsedRecord[key]
  }
  return stable
}

function normalizeAction(
  action: unknown,
  section: 'actions' | 'bonusActions' | 'reactions' | 'legendaryActions',
): unknown {
  if (!isRecord(action)) return action
  const cleaned = omitEmptyStrings(action)
  if (!isRecord(cleaned)) return cleaned
  applyRichTextFields(cleaned)
  omitEmptyOnHit(cleaned)
  applyReactionTriggerDraft(cleaned, section)
  applyTurnAndInvocationDraft(cleaned, section)
  applyLimitedUseDraft(cleaned)
  if (cleaned.kind === 'weapon' && isRecord(cleaned.damage)) {
    cleaned.damage = weaponActionDamageToDraft(cleaned.damage)
  }
  applySaveOutcomeDraft(cleaned)
  const keys =
    typeof cleaned.kind === 'string' ? monsterActionActiveKeys(cleaned.kind, section) : []
  const active = keys.length > 0 ? pickKeys(cleaned, keys) : cleaned
  const schema =
    section === 'reactions'
      ? monsterReactionDraftSchema
      : section === 'legendaryActions'
        ? monsterLegendaryActionDraftSchema
        : monsterActionDraftSchema
  return stabilizeDraftActionKeys(active, schema)
}

function normalizeArmorClass(
  armorClass: MonsterFormValues['armorClass'],
  rules: ArmorClassRules | undefined,
): Record<string, unknown> {
  const next: Record<string, unknown> = {}
  if (typeof armorClass.naturalArmorBonus === 'number' && armorClass.naturalArmorBonus > 0) {
    next.naturalArmorBonus = armorClass.naturalArmorBonus
  }
  if (armorClass.useFixedAc && typeof armorClass.fixedValue === 'number' && rules) {
    next.fixedAcOffset = protectionFromArmorClass(rules, armorClass.fixedValue)
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

function normalizeTraitRichText(value: unknown): unknown {
  if (!Array.isArray(value)) return value
  return value.map((trait) => {
    if (!isRecord(trait)) return trait
    applyRichTextFields(trait)
    return trait
  })
}

/**
 * Single serializer for monster preview and save.
 * Inactive AC, HP, and action-kind fields are dropped. Empty strings are absent.
 * Update payloads send `null` only for clearable keys the baseline actually had.
 */
function normalizedActionSections(values: MonsterFormValues): Record<string, unknown> {
  return {
    actions: (values.actions ?? []).map((action) => normalizeAction(action, 'actions')),
    bonusActions: (values.bonusActions ?? []).map((action) =>
      normalizeAction(action, 'bonusActions'),
    ),
    reactions: (values.reactions ?? []).map((action) => normalizeAction(action, 'reactions')),
    legendaryActions: (values.legendaryActions ?? []).map((action) =>
      normalizeAction(action, 'legendaryActions'),
    ),
  }
}

function legendaryUseFields(values: MonsterFormValues): Record<string, number> {
  const fields: Record<string, number> = {}
  if (typeof values.legendaryActionUses === 'number') {
    fields.legendaryActionUses = values.legendaryActionUses
  }
  if (typeof values.legendaryActionUsesInLair === 'number') {
    fields.legendaryActionUsesInLair = values.legendaryActionUsesInLair
  }
  return fields
}

export function normalizeMonsterFormValues(
  values: MonsterFormValues,
  options: NormalizeMonsterFormOptions,
): Record<string, unknown> {
  const movementRecord = movementRowsToRecordForPreview(values.movement ?? [])
  const hasFly = typeof movementRecord.fly === 'number'
  const challengeRating = values.challengeRating

  const normalized: Record<string, unknown> = {
    name: typeof values.name === 'string' ? values.name : '',
    sizes: values.sizes,
    creatureType: values.creatureType,
    alignment: values.alignment,
    abilityScores: values.abilityScores,
    armorClass: normalizeArmorClass(values.armorClass, options.armorClassRules),
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
    traits: normalizeTraitRichText(omitEmptyStrings(values.traits)),
    ...normalizedActionSections(values),
    ...legendaryUseFields(values),
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
