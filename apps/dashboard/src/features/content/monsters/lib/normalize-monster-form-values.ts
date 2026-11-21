import { normalizeRichTextHtml } from '@rpg/ui'
import {
  protectionFromArmorClass,
  creatureWeaponProficienciesSchema,
  creatureWeaponProficiencyTargetsFromGrantSet,
  monsterActionDraftSchema,
  monsterBonusActionDraftSchema,
  omitEmptySavingThrow,
  monsterLegendaryActionDraftSchema,
  monsterReactionDraftSchema,
  isMultiattackUseClause,
  multiattackPositiveInt,
  type ArmorClassRules,
  type ContentValidationIntent,
  type Monster,
} from '@rpg/contracts'

import { normalizeLimitedUse } from '../../lib/forms/limited-use/normalize-limited-use'
import { monsterActionActiveKeys, monsterActionTriggerText } from './actions/monster-action-kind'
import { normalizeMonsterSaveOutcomes } from './actions/save/monster-action-save-outcomes'
import { withDefaultSaveResolutionTarget } from './actions/save/monster-save-resolution-target.lib'
import { weaponActionDamageToDraft } from './actions/weapon/monster-weapon-damage-form'

import { applyEffectEndAuthoringToRow } from '../../lib/forms/mechanics/normalize-effect-end-authoring'
import { movementRowsToRecordForPreview } from '../../lib/forms/fields/content-movement-form-fields'

import { weaponProficiencyGrantSetFromMode } from '@/lib/forms/grant-sets/weapon-proficiency-grant-mode.lib'

import {
  coerceCreatureWeaponProficienciesForForm,
  MONSTER_DEFAULT_WEAPON_PROFICIENCY_MODE,
} from './creature-details/monster-weapon-proficiencies-form.lib'
import type { MonsterFormValues } from './monster-form-values'

export type MonsterNormalizeBaseline = {
  creatureFamilyIds?: readonly string[]
  classIds?: readonly string[]
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

function referencedEffectIds(outcomes: readonly unknown[]): Set<string> {
  const referenced = new Set<string>()
  for (const outcome of outcomes) {
    if (!isRecord(outcome)) continue
    const lists = [outcome.effects]
    if (isRecord(outcome.repeatSave) && isRecord(outcome.repeatSave.secondFailure)) {
      lists.push(outcome.repeatSave.secondFailure.effects)
    }
    for (const list of lists) {
      if (!Array.isArray(list)) continue
      for (const entry of list) {
        if (!isRecord(entry) || entry.kind !== 'effect-reference') continue
        if (typeof entry.effectId === 'string') referenced.add(entry.effectId)
      }
    }
  }
  return referenced
}

function pruneUnreferencedDamage(effects: unknown[], referenced: ReadonlySet<string>): unknown[] {
  return effects.filter(
    (effect) =>
      !isRecord(effect) ||
      effect.kind !== 'damage' ||
      (typeof effect.id === 'string' && referenced.has(effect.id)),
  )
}

function applySaveOutcomeDraft(cleaned: Record<string, unknown>): void {
  if (cleaned.kind !== 'save' || !isRecord(cleaned.resolution)) return
  const resolution = cleaned.resolution
  if (!Array.isArray(resolution.outcomes)) return
  const outcomes = normalizeMonsterSaveOutcomes(resolution.outcomes)
  resolution.outcomes = outcomes
  if (!Array.isArray(resolution.effects)) return
  resolution.effects = pruneUnreferencedDamage(resolution.effects, referencedEffectIds(outcomes))
}

function applySaveTargetDraft(cleaned: Record<string, unknown>): void {
  const withTarget = withDefaultSaveResolutionTarget(cleaned)
  if (withTarget === cleaned || !isRecord(withTarget.resolution)) return
  cleaned.resolution = withTarget.resolution
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
  if (typeof row.effectEndOption === 'string' && row.effectEndOption.length > 0) return true
  if (isRecord(row.end) && Object.keys(row.end).length > 0) return true
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
    const normalized = { ...row }
    applyEffectEndAuthoringToRow(normalized)
    return {
      kind: 'condition',
      ...(normalized.conditionId !== undefined ? { conditionId: normalized.conditionId } : {}),
      ...(normalized.end !== undefined ? { end: normalized.end } : {}),
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

function coerceSpellCastAtLevel(spell: Record<string, unknown>): void {
  if (typeof spell.castAtLevel !== 'string') return
  const level = Number(spell.castAtLevel)
  if (Number.isInteger(level)) spell.castAtLevel = level
  else delete spell.castAtLevel
}

/** Same limited-use normalizer as the action, applied to each spell row. */
function applySpellEntryDraft(cleaned: Record<string, unknown>): void {
  if (!Array.isArray(cleaned.spells)) return
  cleaned.spells = cleaned.spells.map((spell) => {
    if (!isRecord(spell)) return spell
    const next = { ...spell }
    applyLimitedUseDraft(next)
    coerceSpellCastAtLevel(next)
    return next
  })
}

function keepMultiattackLiteralTrue(record: Record<string, unknown>, key: string): void {
  if (record[key] === true) record[key] = true
  else delete record[key]
}

function filterMultiattackChoiceRows(rows: unknown): unknown[] {
  if (!Array.isArray(rows)) return []
  return rows
    .filter((row) => {
      if (!isRecord(row)) return false
      const actionId = row.actionId
      return typeof actionId === 'string' && actionId.trim().length > 0
    })
    .map((row) => {
      if (!isRecord(row)) return row
      const next = { ...row }
      if (next.spellId === '') delete next.spellId
      return next
    })
}

function normalizeMultiattackAttackGroupStep(step: Record<string, unknown>): void {
  const count = multiattackPositiveInt(step.count)
  if (count) step.count = count
  else delete step.count
}

function normalizeMultiattackUseStepRow(step: Record<string, unknown>): void {
  step.kind = 'use'
  delete step.actionIds
  if (step.mode !== 'single' && step.mode !== 'choice') step.mode = 'single'
  const count = multiattackPositiveInt(step.count)
  if (count) step.count = count
  else delete step.count
  if (step.mode !== 'choice') {
    keepMultiattackLiteralTrue(step, 'optional')
    if (step.actionId === '') delete step.actionId
  } else {
    step.choices = filterMultiattackChoiceRows(step.choices)
  }
  delete step.whenAvailable
}

function normalizeMultiattackDraftStep(step: Record<string, unknown>): void {
  if (!isMultiattackUseClause(step)) {
    normalizeMultiattackAttackGroupStep(step)
    return
  }
  normalizeMultiattackUseStepRow(step)
}

function applyMultiattackDraft(cleaned: Record<string, unknown>): void {
  if (cleaned.kind !== 'multiattack') return

  if (Array.isArray(cleaned.steps)) {
    cleaned.steps = cleaned.steps.map((step) => {
      if (!isRecord(step)) return step
      const next = { ...step }
      normalizeMultiattackDraftStep(next)
      return next
    })
  }

  if (isRecord(cleaned.replacement)) {
    const replacement = { ...cleaned.replacement }
    const count = multiattackPositiveInt(replacement.count)
    if (count) replacement.count = count
    else delete replacement.count
    if (replacement.replacesActionId === '') delete replacement.replacesActionId
    replacement.choices = filterMultiattackChoiceRows(replacement.choices)
    if (replacement.attackWord === true) replacement.attackWord = 'any'
    if (replacement.attackWord !== 'any') delete replacement.attackWord
    delete replacement.whenAvailable
    cleaned.replacement = replacement
  }

  if (isRecord(cleaned.alternative)) {
    const alternative = { ...cleaned.alternative }
    if (Array.isArray(alternative.steps)) {
      alternative.steps = alternative.steps.map((step) => {
        if (!isRecord(step)) return step
        const next = { ...step }
        normalizeMultiattackDraftStep(next)
        return next
      })
    }
    cleaned.alternative = alternative
  }
}

function normalizeActionMovementDraft(cleaned: Record<string, unknown>): void {
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

function applyTurnAndInvocationDraft(
  cleaned: Record<string, unknown>,
  section: 'actions' | 'bonusActions' | 'reactions' | 'legendaryActions',
): void {
  if (cleaned.kind === 'multiattack') {
    delete cleaned.onceUntilNextTurn
  } else if (cleaned.onceUntilNextTurn === true || cleaned.onceUntilNextTurn === 'true') {
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
  normalizeActionMovementDraft(cleaned)
}

function stabilizeDraftActionKeys(
  active: Record<string, unknown>,
  schema:
    | typeof monsterActionDraftSchema
    | typeof monsterBonusActionDraftSchema
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

function omitTakeActionsCombination(
  cleaned: Record<string, unknown>,
  intent: ContentValidationIntent,
): void {
  if (intent !== 'publish') return
  if (cleaned.kind !== 'take-actions') return
  const selected = Array.isArray(cleaned.standardActions) ? cleaned.standardActions : []
  if (selected.length < 2) delete cleaned.combination
}

function normalizeWeaponActionDamage(cleaned: Record<string, unknown>): void {
  if (cleaned.kind === 'weapon' && isRecord(cleaned.damage)) {
    cleaned.damage = weaponActionDamageToDraft(cleaned.damage)
  }
}

function omitEmptySavingThrowField(cleaned: Record<string, unknown>): void {
  if (!('savingThrow' in cleaned)) return
  const savingThrow = omitEmptySavingThrow(cleaned.savingThrow)
  if (savingThrow === undefined) delete cleaned.savingThrow
  else cleaned.savingThrow = savingThrow
}

function draftSchemaForSection(
  section: 'actions' | 'bonusActions' | 'reactions' | 'legendaryActions',
) {
  if (section === 'reactions') return monsterReactionDraftSchema
  if (section === 'legendaryActions') return monsterLegendaryActionDraftSchema
  if (section === 'bonusActions') return monsterBonusActionDraftSchema
  return monsterActionDraftSchema
}

function normalizeAction(
  action: unknown,
  section: 'actions' | 'bonusActions' | 'reactions' | 'legendaryActions',
  intent: ContentValidationIntent,
): unknown {
  if (!isRecord(action)) return action
  const cleaned = omitEmptyStrings(action)
  if (!isRecord(cleaned)) return cleaned
  applyRichTextFields(cleaned)
  omitEmptyOnHit(cleaned)
  applyReactionTriggerDraft(cleaned, section)
  applyTurnAndInvocationDraft(cleaned, section)
  applyMultiattackDraft(cleaned)
  applyLimitedUseDraft(cleaned)
  if (cleaned.kind === 'shape-shift' && typeof cleaned.prerequisite === 'string') {
    const prerequisite = normalizePrerequisite(cleaned.prerequisite)
    if (prerequisite) cleaned.prerequisite = prerequisite
    else delete cleaned.prerequisite
  }
  applySpellEntryDraft(cleaned)
  omitTakeActionsCombination(cleaned, intent)
  normalizeWeaponActionDamage(cleaned)
  applySaveOutcomeDraft(cleaned)
  applySaveTargetDraft(cleaned)
  omitEmptySavingThrowField(cleaned)
  const keys =
    typeof cleaned.kind === 'string' ? monsterActionActiveKeys(cleaned.kind, section) : []
  const active = keys.length > 0 ? pickKeys(cleaned, keys) : cleaned
  return stabilizeDraftActionKeys(active, draftSchemaForSection(section))
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
    if ('savingThrow' in trait) {
      const savingThrow = omitEmptySavingThrow(trait.savingThrow)
      if (savingThrow === undefined) delete trait.savingThrow
      else trait.savingThrow = savingThrow
    }
    return trait
  })
}

/**
 * Single serializer for monster preview and save.
 * Inactive AC, HP, and action-kind fields are dropped. Empty strings are absent.
 * Update payloads send `null` only for clearable keys the baseline actually had.
 */
function normalizedLegendaryBlock(
  values: MonsterFormValues,
  intent: ContentValidationIntent,
): Record<string, unknown> | undefined {
  const block = values.legendaryActions
  const actions = (block?.actions ?? []).map((action) =>
    normalizeAction(action, 'legendaryActions', intent),
  )
  if (actions.length === 0) return undefined
  const normalized: Record<string, unknown> = { actions }
  if (typeof block?.uses === 'number') normalized.uses = block.uses
  if (typeof block?.usesInLair === 'number') normalized.usesInLair = block.usesInLair
  return normalized
}

function normalizedActionSections(
  values: MonsterFormValues,
  intent: ContentValidationIntent,
): Record<string, unknown> {
  const legendaryActions = normalizedLegendaryBlock(values, intent)
  return {
    actions: (values.actions ?? []).map((action) => normalizeAction(action, 'actions', intent)),
    bonusActions: (values.bonusActions ?? []).map((action) =>
      normalizeAction(action, 'bonusActions', intent),
    ),
    reactions: (values.reactions ?? []).map((action) =>
      normalizeAction(action, 'reactions', intent),
    ),
    ...(legendaryActions ? { legendaryActions } : {}),
  }
}

function normalizedMonsterCore(
  values: MonsterFormValues,
  options: NormalizeMonsterFormOptions,
  movement: Record<string, number>,
): Record<string, unknown> {
  return {
    name: typeof values.name === 'string' ? values.name : '',
    sizes: values.sizes,
    creatureType: values.creatureType,
    ...(values.creatureFamilyIds?.length ? { creatureFamilyIds: values.creatureFamilyIds } : {}),
    ...(values.classIds?.length ? { classIds: values.classIds } : {}),
    alignment: values.alignment,
    abilityScores: values.abilityScores,
    armorClass: normalizeArmorClass(values.armorClass, options.armorClassRules),
    hitPoints: normalizeHitPoints(values.hitPoints),
    movement,
    senses: values.senses ?? [],
    communication: normalizeCommunication(values.communication),
    proficiencies: normalizeProficiencies(
      values.proficiencies,
      values.weaponProficiencyMode ?? MONSTER_DEFAULT_WEAPON_PROFICIENCY_MODE,
    ),
    defenses: values.defenses,
    equipment: values.equipment,
    traits: normalizeTraitRichText(omitEmptyStrings(values.traits)),
    ...(values.forms ? { forms: normalizeMonsterForms(values.forms) } : {}),
    ...normalizedActionSections(values, options.intent),
  }
}

export function normalizeMonsterFormValues(
  values: MonsterFormValues,
  options: NormalizeMonsterFormOptions,
): Record<string, unknown> {
  const movementRecord = movementRowsToRecordForPreview(values.movement ?? [])
  const hasFly = typeof movementRecord.fly === 'number'
  const challengeRating = values.challengeRating

  const normalized = normalizedMonsterCore(values, options, movementRecord)

  applyOptionalScalars(normalized, values, challengeRating, hasFly)
  if (options.mode === 'update' && options.baseline) {
    applyClearableNulls(normalized, options.baseline, hasFly)
  }

  return omitEmptyStrings(normalized) as Record<string, unknown>
}

/**
 * Draft normalization read as a monster for stat-block derivation and prose previews.
 * Draft intent may omit required fields; derivation callers already tolerate that.
 */
export function normalizeMonsterDraftForPreview(
  values: MonsterFormValues,
  options: NormalizeMonsterFormOptions,
): Monster {
  return normalizeMonsterFormValues(values, options) as Monster
}

function normalizePrerequisite(value: string): string {
  return value
    .trim()
    .replace(/[,.]+$/u, '')
    .trim()
}

// fallow-ignore-next-line complexity
function normalizeDefinedFormOverride(
  entry: Record<string, unknown>,
): Record<string, unknown> | undefined {
  const overrides = isRecord(entry.overrides) ? { ...entry.overrides } : {}
  if (entry.speechRestricted === true) overrides.canSpeak = false
  else delete overrides.canSpeak
  const movementBundle = isRecord(entry.movementOverride) ? entry.movementOverride : undefined
  const legacyRows = Array.isArray(entry.movementOverrideRows)
    ? (entry.movementOverrideRows as Parameters<typeof movementRowsToRecordForPreview>[0])
    : undefined
  const rows = Array.isArray(movementBundle?.rows) ? movementBundle.rows : legacyRows
  const overrideHover =
    movementBundle?.hover === true || entry.movementOverrideHover === true ? true : undefined
  if (rows) {
    const speeds = movementRowsToRecordForPreview(
      rows as Parameters<typeof movementRowsToRecordForPreview>[0],
    )
    if (Object.keys(speeds).length > 0) {
      overrides.movement = {
        speeds,
        ...(overrideHover && speeds.fly !== undefined ? { hover: true } : {}),
      }
    } else {
      delete overrides.movement
    }
  }
  delete entry.speechRestricted
  delete entry.movementOverride
  delete entry.movementOverrideRows
  delete entry.movementOverrideHover
  return Object.keys(overrides).length > 0 ? overrides : undefined
}

function normalizeMonsterForms(forms: NonNullable<MonsterFormValues['forms']>) {
  const cleaned = omitEmptyStrings(forms)
  if (!isRecord(cleaned)) return cleaned
  const shape = cleaned
  const definedForms = Array.isArray(shape.definedForms) ? shape.definedForms : []
  return {
    ...shape,
    definedForms: definedForms.map((entry) => {
      if (!isRecord(entry)) return entry
      const overrides = normalizeDefinedFormOverride(entry)
      return {
        ...entry,
        ...(overrides ? { overrides } : {}),
      }
    }),
  }
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
  if (baseline.creatureFamilyIds !== undefined && normalized.creatureFamilyIds === undefined)
    normalized.creatureFamilyIds = null
  if (baseline.classIds !== undefined && normalized.classIds === undefined)
    normalized.classIds = null
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
