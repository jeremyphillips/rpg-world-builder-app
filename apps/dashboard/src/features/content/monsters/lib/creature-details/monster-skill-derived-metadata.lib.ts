import {
  abilityModifier,
  formatProficiencyBonus,
  formatSignedModifier,
  getAbilityCompactLabel,
  joinInlineMetadata,
  type Ability,
  type ProficiencyRank,
} from '@rpg/contracts'

/** Second line on committed skill rows — ability modifier and PB contribution only. */
export function monsterSkillDerivedMetadataLine(args: {
  ability: Ability
  abilityScore: number
  rank: ProficiencyRank
  proficiencyBonus: number
}): string {
  const abilityPart = `${getAbilityCompactLabel(args.ability)} ${formatSignedModifier(
    abilityModifier(args.abilityScore),
  )}`
  const pbContribution =
    args.rank === 'expertise'
      ? args.proficiencyBonus * 2
      : args.rank === 'proficient'
        ? args.proficiencyBonus
        : 0
  if (pbContribution === 0) return abilityPart
  return joinInlineMetadata([abilityPart, formatProficiencyBonus(pbContribution)])
}
