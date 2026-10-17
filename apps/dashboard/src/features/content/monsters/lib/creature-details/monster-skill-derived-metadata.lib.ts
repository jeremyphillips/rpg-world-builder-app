import {
  abilityModifier,
  formatProficiencyBonus,
  formatSignedModifier,
  getAbilityCompactLabel,
  getTermCompactLabel,
  joinInlineMetadata,
  PROFICIENCY_BONUS_TERM,
  type Ability,
  type ProficiencyRank,
} from '@rpg/contracts'

const MISSING_PROFICIENCY_BONUS = '—'

/** Second line on committed skill rows — ability modifier and PB contribution only. */
export function monsterSkillDerivedMetadataLine(args: {
  ability: Ability
  abilityScore: number
  rank: ProficiencyRank
  proficiencyBonus: number | undefined
}): string {
  const abilityPart = `${getAbilityCompactLabel(args.ability)} ${formatSignedModifier(
    abilityModifier(args.abilityScore),
  )}`
  if (args.proficiencyBonus === undefined) {
    return joinInlineMetadata([
      abilityPart,
      `${getTermCompactLabel(PROFICIENCY_BONUS_TERM)} ${MISSING_PROFICIENCY_BONUS}`,
    ])
  }
  const pbContribution =
    args.rank === 'expertise'
      ? args.proficiencyBonus * 2
      : args.rank === 'proficient'
        ? args.proficiencyBonus
        : 0
  if (pbContribution === 0) return abilityPart
  return joinInlineMetadata([abilityPart, formatProficiencyBonus(pbContribution)])
}
