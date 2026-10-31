import {
  CHALLENGE_RATING_MECHANICS,
  formatSignedModifier,
  getAbilityLabel,
  getDamageTypeLabel,
  getWeaponModeLabel,
  getWeaponPropertyLabel,
  resolveMonsterActionAttackProfile,
  unavailableField,
  type ChallengeRating,
  type DerivedField,
  type MonsterActionAttackProfile,
  type MonsterActionDraft,
  type ResolveMonsterActionAttackProfileInput,
} from '@rpg/contracts'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { monsterEquipmentCatalog, monsterMagicPropertyProvider } from '../monster-form-derivation'
import type { MonsterFormValues } from '../monster-form-values'
import { normalizeMonsterFormValues } from '../normalize-monster-form-values'

const REASON_LABEL = {
  'missing-input': 'missing input',
  'missing-reference': 'missing reference',
  conflict: 'conflict',
} as const

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

function sourceCaption(profile: MonsterActionAttackProfile): string {
  const modes = profile.modes.map((mode) => getWeaponModeLabel(mode).toLowerCase()).join(' and ')
  if (profile.sourceKind === 'weapon') {
    return modes ? `Catalog ${modes} ${profile.sourceLabel}` : `Catalog ${profile.sourceLabel}`
  }
  if (profile.sourceKind === 'natural-weapon') {
    return modes ? `Natural weapon, ${modes}` : 'Natural weapon'
  }
  return modes ? `Custom attack, ${modes}` : 'Custom attack'
}

function rangeLabel(range: { normal: number; long?: number }): string {
  return range.long !== undefined ? `${range.normal}/${range.long} ft` : `${range.normal} ft`
}

export function describeMonsterActionAttackProfile(
  profile: DerivedField<MonsterActionAttackProfile>,
): string[] {
  if (profile.status === 'unavailable') {
    return [`Attack summary unavailable (${REASON_LABEL[profile.reason]})`]
  }
  const value = profile.value
  const lines = [
    sourceCaption(value),
    `Attack ${formatSignedModifier(value.attackBonus)} (${getAbilityLabel(value.governingAbility)}, proficiency ${formatSignedModifier(value.proficiencyContribution)})`,
    `Damage ${value.primary.average}${value.primary.expression ? ` (${value.primary.expression})` : ''} ${getDamageTypeLabel(value.primary.damageTypeId)}`,
  ]
  for (const part of value.onHit) {
    lines.push(
      `On hit ${part.average} (${part.expression}) ${getDamageTypeLabel(part.damageTypeId)}`,
    )
  }
  if (value.reach !== undefined) lines.push(`Reach ${value.reach} ft`)
  if (value.range) lines.push(`Range ${rangeLabel(value.range)}`)
  if (value.weaponProperties && value.weaponProperties.length > 0) {
    lines.push(value.weaponProperties.map((id) => getWeaponPropertyLabel(id)).join(', '))
  }
  for (const capability of value.unresolvedCapabilities) {
    lines.push(
      `${getWeaponPropertyLabel(capability.id)} unavailable (${REASON_LABEL[capability.reason]})`,
    )
  }
  return lines
}
