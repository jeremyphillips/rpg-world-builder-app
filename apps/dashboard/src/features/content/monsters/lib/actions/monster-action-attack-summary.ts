import {
  abilityModifier,
  derivedFieldReasonLabel,
  CHALLENGE_RATING_MECHANICS,
  formatProficiencyBonus,
  formatSignedModifier,
  getAbilityCompactLabel,
  getDamageTypeLabel,
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

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { monsterEquipmentCatalog, monsterMagicPropertyProvider } from '../monster-form-derivation'
import type { MonsterFormValues } from '../monster-form-values'
import { normalizeMonsterFormValues } from '../normalize-monster-form-values'
import {
  MONSTER_ACTION_ATTACK_PREVIEW_ATTACK_LABEL,
  MONSTER_ACTION_ATTACK_PREVIEW_DAMAGE_LABEL,
  MONSTER_ACTION_ATTACK_PREVIEW_EXTRA_LABEL,
  MONSTER_ACTION_ATTACK_PREVIEW_PROPERTIES_LABEL,
  MONSTER_ACTION_ATTACK_PREVIEW_RANGE_LABEL,
  MONSTER_ACTION_ATTACK_PREVIEW_REACH_LABEL,
} from '../monster-form-labels'

function proficiencyBonus(challengeRating: unknown): number | undefined {
  if (typeof challengeRating !== 'string') return undefined
  if (!(challengeRating in CHALLENGE_RATING_MECHANICS)) return undefined
  return CHALLENGE_RATING_MECHANICS[challengeRating as ChallengeRating].proficiencyBonus
}

export function resolveMonsterFormActionAttackProfile(
  values: MonsterFormValues,
  ctx: ContentFormCtx,
  actionId: string,
): DerivedField<MonsterActionAttackProfile> {
  if (ctx.equipmentCatalogStatus !== 'ready') return unavailableField('missing-reference')
  const normalized = normalizeMonsterFormValues(values, {
    intent: 'draft',
    mode: 'create',
    armorClassRules: ctx.armorClassRules,
  })
  const sections = ['actions', 'bonusActions', 'reactions'] as const
  let action: MonsterActionDraft | undefined
  for (const section of sections) {
    const rows = normalized[section]
    if (!Array.isArray(rows)) continue
    const match = rows.find((row) => {
      return Boolean(row) && typeof row === 'object' && 'id' in row && row.id === actionId
    })
    if (match && typeof match === 'object' && 'kind' in match) {
      action = match as MonsterActionDraft
      break
    }
  }
  if (!action) return unavailableField('missing-input')
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

export type MonsterActionAttackPreview =
  | { status: 'unavailable'; message: string }
  | { status: 'ready'; modeCaption: string; rows: readonly MonsterActionAttackPreviewRow[] }

function modeCaption(profile: MonsterActionAttackProfile): string {
  return profile.modes.map((mode) => getWeaponModeLabel(mode)).join(' and ')
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

export function buildMonsterActionAttackPreview(
  profile: DerivedField<MonsterActionAttackProfile>,
  abilityScores: Partial<Record<Ability, number>> | undefined,
): MonsterActionAttackPreview {
  if (profile.status === 'unavailable') {
    return {
      status: 'unavailable',
      message: `Attack summary unavailable (${derivedFieldReasonLabel(profile.reason)})`,
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

  value.onHit.forEach((part, index) => {
    rows.push(damagePreviewRow(`on-hit-${index}`, MONSTER_ACTION_ATTACK_PREVIEW_EXTRA_LABEL, part))
  })

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

  return {
    status: 'ready',
    modeCaption: modeCaption(value),
    rows,
  }
}
