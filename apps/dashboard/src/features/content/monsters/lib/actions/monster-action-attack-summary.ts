import {
  ABILITY_ENTRIES,
  abilityModifier,
  derivedFieldReasonLabel,
  CHALLENGE_RATING_MECHANICS,
  formatProficiencyBonus,
  formatMonsterAttackAction,
  formatSignedModifier,
  getAbilityCompactLabel,
  getContentTypeTerm,
  getDamageTypeLabel,
  CONDITION_TERM,
  getEffectConditionLabel,
  getWeaponModeLabel,
  getWeaponPropertyLabel,
  joinInlineMetadata,
  NEUTRAL_ABILITY_SCORE,
  resolveMonsterActionAttackProfile,
  unavailableField,
  type Ability,
  type ChallengeRating,
  type DerivedField,
  type MonsterActionAttackProfile,
  type MonsterActionAttackRoll,
  type MonsterActionDraft,
  type ResolveMonsterActionAttackProfileInput,
} from '@rpg/contracts'

import { vocabularyFieldLabel } from '@/features/vocabulary'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { monsterEquipmentCatalog, monsterMagicPropertyProvider } from '../monster-form-derivation'
import type { MonsterFormValues } from '../monster-form-values'
import { normalizeMonsterFormValues } from '../normalize-monster-form-values'
import {
  formatMonsterActionAttackPreviewConfigureHint,
  MONSTER_ACTION_ATTACK_PREVIEW_ATTACK_LABEL,
  MONSTER_ACTION_ATTACK_PREVIEW_DAMAGE_LABEL,
  MONSTER_ACTION_ATTACK_PREVIEW_EXTRA_LABEL,
  MONSTER_ON_HIT_NOTE_LABEL,
  MONSTER_ACTION_ATTACK_PREVIEW_PROPERTIES_LABEL,
  MONSTER_ACTION_ATTACK_PREVIEW_RANGE_LABEL,
  MONSTER_ACTION_ATTACK_PREVIEW_REACH_LABEL,
  MONSTER_ACTION_DAMAGE_FIELD_LABEL,
  MONSTER_ATTACK_BONUS_LABEL,
  MONSTER_CHALLENGE_HEADING,
  MONSTER_EQUIPMENT_CATALOG_ERROR,
  MONSTER_LOADING_EQUIPMENT,
} from '../monster-form-labels'

/** Complete stored dice, or an explicit flat amount. Does not invent a roll. */
function actionHasStoredDamageRoll(damage: unknown): boolean {
  if (!damage || typeof damage !== 'object') return false
  const roll = damage as { dice?: { count?: unknown; faces?: unknown }; flat?: unknown }
  const dice = roll.dice
  const diceOk =
    dice !== undefined && typeof dice.count === 'number' && typeof dice.faces === 'number'
  return diceOk || typeof roll.flat === 'number'
}

function proficiencyBonus(challengeRating: unknown): number | undefined {
  if (typeof challengeRating !== 'string') return undefined
  if (!(challengeRating in CHALLENGE_RATING_MECHANICS)) return undefined
  return CHALLENGE_RATING_MECHANICS[challengeRating as ChallengeRating].proficiencyBonus
}

export function findMonsterFormActionDraft(
  values: MonsterFormValues,
  ctx: ContentFormCtx,
  actionId: string,
): MonsterActionDraft | undefined {
  const normalized = normalizeMonsterFormValues(values, {
    intent: 'draft',
    mode: 'create',
    armorClassRules: ctx.armorClassRules,
  })
  const sections = ['actions', 'bonusActions', 'reactions', 'legendaryActions'] as const
  for (const section of sections) {
    const rows = normalized[section]
    if (!Array.isArray(rows)) continue
    const match = rows.find((row) => {
      return Boolean(row) && typeof row === 'object' && 'id' in row && row.id === actionId
    })
    if (match && typeof match === 'object' && 'kind' in match) {
      return match as MonsterActionDraft
    }
  }
  return undefined
}

function attackBonusSourceIncomplete(
  action: Extract<MonsterActionDraft, { kind: 'attack' }>,
): boolean {
  const source = action.bonusSource
  if (!source?.kind) return true
  if (source.kind === 'ability') {
    if (!source.ability) return true
    return typeof source.proficient !== 'boolean'
  }
  const casting = source.castingAbility
  if (!casting) return true
  if (casting.kind === 'ability') return !casting.ability
  if (casting.kind === 'shared') return !casting.entryId
  return true
}

function authoredAttackGoverningAbility(
  action: Extract<MonsterActionDraft, { kind: 'attack' }>,
): Ability | undefined {
  const source = action.bonusSource
  if (!source) return undefined
  if (source.kind === 'ability' && source.ability) return source.ability
  if (source.kind === 'spell') {
    const casting = source.castingAbility
    if (casting?.kind === 'ability' && casting.ability) return casting.ability
  }
  return undefined
}

function authoredAttackUsesProficiencyBonus(
  action: Extract<MonsterActionDraft, { kind: 'attack' }>,
): boolean {
  const source = action.bonusSource
  if (!source) return true
  if (source.kind === 'ability') return source.proficient !== false
  return true
}

export type MonsterActionAttackPreviewGuidanceContext = {
  ctx: ContentFormCtx
  values: MonsterFormValues
  action: MonsterActionDraft
}

function weaponPreviewGuidance(
  action: Extract<MonsterActionDraft, { kind: 'weapon' }>,
  challengeBonus: number | undefined,
): string {
  const configure = formatMonsterActionAttackPreviewConfigureHint
  if (!action.equipmentEntryId) return configure(getContentTypeTerm('equipment').label)
  if (challengeBonus === undefined) return configure(MONSTER_CHALLENGE_HEADING)
  return configure(getContentTypeTerm('equipment').label)
}

function naturalWeaponPreviewGuidance(
  action: Extract<MonsterActionDraft, { kind: 'natural-weapon' }>,
  challengeBonus: number | undefined,
): string {
  const configure = formatMonsterActionAttackPreviewConfigureHint
  if (challengeBonus === undefined) return configure(MONSTER_CHALLENGE_HEADING)
  if (!actionHasStoredDamageRoll(action.damage)) return configure(MONSTER_ACTION_DAMAGE_FIELD_LABEL)
  if (action.mode !== 'melee' && action.mode !== 'ranged') return configure('Mode')
  return configure(MONSTER_ACTION_DAMAGE_FIELD_LABEL)
}

function attackPreviewGuidance(
  action: Extract<MonsterActionDraft, { kind: 'attack' }>,
  values: MonsterFormValues,
  challengeBonus: number | undefined,
): string {
  const configure = formatMonsterActionAttackPreviewConfigureHint
  if (attackBonusSourceIncomplete(action)) return configure(MONSTER_ATTACK_BONUS_LABEL)
  if (!actionHasStoredDamageRoll(action.damage)) return configure(MONSTER_ACTION_DAMAGE_FIELD_LABEL)
  if (authoredAttackUsesProficiencyBonus(action) && challengeBonus === undefined) {
    return configure(MONSTER_CHALLENGE_HEADING)
  }
  const ability = authoredAttackGoverningAbility(action)
  if (ability && typeof values.abilityScores?.[ability] !== 'number') {
    return configure(ABILITY_ENTRIES[ability].label)
  }
  return configure(MONSTER_ATTACK_BONUS_LABEL)
}

/** One actionable next step when the attack profile cannot resolve yet. */
export function resolveMonsterActionAttackPreviewGuidance({
  ctx,
  values,
  action,
}: MonsterActionAttackPreviewGuidanceContext): string {
  const configure = formatMonsterActionAttackPreviewConfigureHint
  if (ctx.equipmentCatalogStatus === 'error') return MONSTER_EQUIPMENT_CATALOG_ERROR
  if (ctx.equipmentCatalogStatus !== 'ready') return MONSTER_LOADING_EQUIPMENT

  const challengeBonus = proficiencyBonus(values.challengeRating)
  if (action.kind === 'weapon') return weaponPreviewGuidance(action, challengeBonus)
  if (action.kind === 'natural-weapon') return naturalWeaponPreviewGuidance(action, challengeBonus)
  if (action.kind === 'attack') return attackPreviewGuidance(action, values, challengeBonus)
  return configure(MONSTER_ATTACK_BONUS_LABEL)
}

export function resolveMonsterFormActionAttackProfile(
  values: MonsterFormValues,
  ctx: ContentFormCtx,
  actionId: string,
): DerivedField<MonsterActionAttackProfile> {
  if (ctx.equipmentCatalogStatus !== 'ready') return unavailableField('missing-reference')
  const action = findMonsterFormActionDraft(values, ctx, actionId)
  if (!action) return unavailableField('missing-input')
  const normalized = normalizeMonsterFormValues(values, {
    intent: 'draft',
    mode: 'create',
    armorClassRules: ctx.armorClassRules,
  })
  return resolveMonsterActionAttackProfile({
    action,
    monster: normalized as ResolveMonsterActionAttackProfileInput['monster'],
    equipmentCatalog: monsterEquipmentCatalog(ctx),
    proficiencyBonus: proficiencyBonus(normalized.challengeRating),
    magicPropertyProvider: monsterMagicPropertyProvider(ctx),
  })
}

export type MonsterActionAttackPreviewRow = {
  id: string
  label: string
  primary: string
  secondary?: string
}

export type MonsterActionAttackPreviewUnavailableContext = MonsterActionAttackPreviewGuidanceContext

export type MonsterActionAttackPreview =
  | { status: 'unavailable'; guidance: string }
  | {
      status: 'ready'
      modeCaption: string
      rows: readonly MonsterActionAttackPreviewRow[]
      /** Same sentence the published stat block prints from this profile. */
      sentence?: string
    }

function modeCaption(profile: MonsterActionAttackProfile): string {
  return profile.modes.map((mode) => getWeaponModeLabel(mode)).join(' or ')
}

function rangeLabel(range: { normal: number; long?: number }): string {
  return range.long !== undefined ? `${range.normal}/${range.long} ft` : `${range.normal} ft`
}

function governingAbilityModifier(
  profile: MonsterActionAttackProfile,
  abilityScores: Partial<Record<Ability, number>> | undefined,
): number {
  const score = abilityScores?.[profile.governingAbility] ?? NEUTRAL_ABILITY_SCORE
  return abilityModifier(score)
}

function attackRowSecondary(
  profile: MonsterActionAttackProfile,
  abilityScores: Partial<Record<Ability, number>> | undefined,
): string {
  const abilityPart = `${getAbilityCompactLabel(profile.governingAbility)} ${formatSignedModifier(
    governingAbilityModifier(profile, abilityScores),
  )}`
  if (profile.proficiencyContribution === 0) return abilityPart
  return joinInlineMetadata([abilityPart, formatProficiencyBonus(profile.proficiencyContribution)])
}

function damageRowSecondary(roll: MonsterActionAttackRoll): string {
  const typeLabel = getDamageTypeLabel(roll.damageTypeId)
  if (!roll.expression) return typeLabel
  return `(${roll.expression}) ${typeLabel}`
}

function damagePreviewRow(id: string, label: string, roll: MonsterActionAttackRoll) {
  return {
    id,
    label,
    primary: String(roll.average),
    secondary: damageRowSecondary(roll),
  }
}

function onHitPreviewRow(
  effect: MonsterActionAttackProfile['onHit'][number],
  index: number,
): MonsterActionAttackPreviewRow {
  if (effect.kind === 'damage') {
    return damagePreviewRow(`on-hit-${index}`, MONSTER_ACTION_ATTACK_PREVIEW_EXTRA_LABEL, effect)
  }
  if (effect.kind === 'condition') {
    return {
      id: `on-hit-${index}`,
      label: vocabularyFieldLabel(CONDITION_TERM),
      primary: getEffectConditionLabel(effect.conditionId),
      ...(effect.description ? { secondary: effect.description } : {}),
    }
  }
  return {
    id: `on-hit-${index}`,
    label: MONSTER_ON_HIT_NOTE_LABEL,
    primary: effect.description,
  }
}

function attackDistanceRows(value: MonsterActionAttackProfile): MonsterActionAttackPreviewRow[] {
  const rows: MonsterActionAttackPreviewRow[] = []
  if (value.reach !== undefined) {
    rows.push({
      id: 'reach',
      label: MONSTER_ACTION_ATTACK_PREVIEW_REACH_LABEL,
      primary: `${value.reach} ft`,
    })
  }
  if (value.range) {
    rows.push({
      id: 'range',
      label: MONSTER_ACTION_ATTACK_PREVIEW_RANGE_LABEL,
      primary: rangeLabel(value.range),
    })
  }
  if (value.weaponProperties && value.weaponProperties.length > 0) {
    rows.push({
      id: 'properties',
      label: MONSTER_ACTION_ATTACK_PREVIEW_PROPERTIES_LABEL,
      primary: value.weaponProperties.map((id) => getWeaponPropertyLabel(id)).join(', '),
    })
  }
  for (const capability of value.unresolvedCapabilities) {
    rows.push({
      id: `capability-${capability.id}`,
      label: getWeaponPropertyLabel(capability.id),
      primary: `Unavailable (${derivedFieldReasonLabel(capability.reason)})`,
    })
  }
  return rows
}

function attackPreviewSentence(value: MonsterActionAttackProfile): string | undefined {
  return formatMonsterAttackAction({
    attackBonusLabel: formatSignedModifier(value.attackBonus),
    damage: String(value.primary.average),
    ...(value.primary.expression ? { damageExpression: value.primary.expression } : {}),
    damageTypeId: value.primary.damageTypeId,
    modes: [...value.modes],
    ...(value.reach !== undefined ? { reach: value.reach } : {}),
    ...(value.range ? { range: value.range } : {}),
    ...(value.onHit.length > 0 ? { onHit: value.onHit } : {}),
  })
}

export function buildMonsterActionAttackPreview(
  profile: DerivedField<MonsterActionAttackProfile>,
  abilityScores: Partial<Record<Ability, number>> | undefined,
  unavailableContext?: MonsterActionAttackPreviewUnavailableContext,
): MonsterActionAttackPreview {
  if (profile.status === 'unavailable') {
    return {
      status: 'unavailable',
      guidance: unavailableContext
        ? resolveMonsterActionAttackPreviewGuidance(unavailableContext)
        : formatMonsterActionAttackPreviewConfigureHint(MONSTER_ATTACK_BONUS_LABEL),
    }
  }

  const value = profile.value
  const rows: MonsterActionAttackPreviewRow[] = [
    {
      id: 'attack',
      label: MONSTER_ACTION_ATTACK_PREVIEW_ATTACK_LABEL,
      primary: formatSignedModifier(value.attackBonus),
      secondary: attackRowSecondary(value, abilityScores),
    },
    damagePreviewRow('damage', MONSTER_ACTION_ATTACK_PREVIEW_DAMAGE_LABEL, value.primary),
  ]

  value.onHit.forEach((effect, index) => {
    rows.push(onHitPreviewRow(effect, index))
  })
  rows.push(...attackDistanceRows(value))

  const sentence = attackPreviewSentence(value)

  return {
    status: 'ready',
    modeCaption: modeCaption(value),
    rows,
    ...(sentence ? { sentence } : {}),
  }
}
