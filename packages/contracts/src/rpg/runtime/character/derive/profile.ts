import { resolveCreatureArmorClass, type EquippedArmorPiece } from '../../creature/armor-class'
import type { CharacterClass } from '../../../content/classes/class'
import { isSpellcastingActiveAtLevel } from '../../../content/classes/spellcasting/class-spellcasting-ownership'
import type { ResolvedSpellcastingProgressionConfig } from '../../../campaign/rules/spellcasting-progression'
import { resolveSlotProgressionForClass } from '../../../campaign/rules/spellcasting-progression'
import { resolveLeveledSlotCountsAtLevel } from '../../../campaign/rules/spellcasting-progression'
import type { SkillProficiency } from '../../../content/skill-proficiency'
import { getSkillName } from '../../../content/skill-proficiency'
import { proficiencyBonus } from '../../../primitives/level'
import { ABILITY_IDS, type Ability } from '../../../vocab/ability'
import type { ArmorClassRules } from '../../../vocab/mechanics/armor-class-scale'
import type { CharacterProficiencies } from '../sheet/proficiencies'
import type { CharacterSkillToolProficiencyRank } from '../sheet/proficiencies'
import {
  abilityModifier,
  hasSavingThrowProficiency,
  resolveLevelOneMaxHp,
  savingThrowBonus,
  skillModifier,
  spellAttackBonus,
  abilitySaveDc,
} from './index'
import { resolveMaxHpAtLevel } from './hit-points-at-level'
import { resolvedField, unavailableField, type DerivedField } from '../../creature/derived-field'
// ---------------------------------------------------------------------------
// Character derived profile — reusable derivation over partial character-like
// input. Accepts incomplete data (builder drafts, sheet previews, imports)
// without requiring a persisted Character record.
// ---------------------------------------------------------------------------

export type CharacterDerivationInput = {
  level: number
  /** When set, overrides formula-derived proficiency bonus (e.g. Level 0 NPC campaign literal). */
  proficiencyBonusOverride?: number
  /** Server-resolved Armor Class rules. Required. */
  armorClassRules: ArmorClassRules
  abilityScores?: Partial<Record<Ability, number>>
  characterClass?: CharacterClass
  proficiencies: CharacterProficiencies
  skillProficiencies: readonly SkillProficiency[]
  /** Equipped armor variants for equipment-based AC; omit for unarmored preview. */
  equippedArmor?: readonly EquippedArmorPiece[]
  /** Equipped armor-bucket entry is missing or is not armor. Do not fall back to unarmored AC. */
  unresolvedEquippedArmor?: boolean
  /** Resolved spellcasting progression config; required when deriving spell slots. */
  spellcastingProgression?: ResolvedSpellcastingProgressionConfig
}

export type CharacterDerivedAbilityScore = {
  score: number | undefined
  modifier: number | undefined
}

export type CharacterDerivedSavingThrow = {
  ability: Ability
  bonus: number | undefined
  proficient: boolean
}

export type CharacterDerivedSkill = {
  skillId: string
  label: string
  modifier: number | undefined
  rank: CharacterSkillToolProficiencyRank | undefined
}

export type CharacterDerivedSpellcasting = {
  ability: Ability
  saveDc: number | undefined
  attackBonus: number | undefined
  /** Slot counts at `level`, indexed by slot level (0 = 1st-level). */
  slots: number[]
}

export type CharacterDerivedProfile = {
  abilityScores: Partial<Record<Ability, CharacterDerivedAbilityScore>>
  proficiencyBonus: number | undefined
  maxHp: number | undefined
  ac: DerivedField<number>
  savingThrows: CharacterDerivedSavingThrow[]
  skills: CharacterDerivedSkill[]
  spellcasting: CharacterDerivedSpellcasting | null
}

/** Returns the proficiency rank for a skill id on a character, if any. */
export function findSkillProficiencyRank(
  proficiencies: CharacterProficiencies,
  skillId: string,
): CharacterSkillToolProficiencyRank | undefined {
  return proficiencies.skills.find((entry) => entry.skill === skillId)?.rank
}

export function deriveAbilityScores(
  abilityScores: Partial<Record<Ability, number>> | undefined,
): Partial<Record<Ability, CharacterDerivedAbilityScore>> {
  if (!abilityScores) return {}

  return Object.fromEntries(
    ABILITY_IDS.map((ability) => {
      const score = abilityScores[ability]
      return [
        ability,
        {
          score,
          modifier: typeof score === 'number' ? abilityModifier(score) : undefined,
        },
      ]
    }),
  ) as Partial<Record<Ability, CharacterDerivedAbilityScore>>
}

export function deriveSavingThrows(
  input: CharacterDerivationInput,
  profBonus: number | undefined,
): CharacterDerivedSavingThrow[] {
  const classSaves = input.characterClass?.proficiencies.savingThrows ?? []

  return ABILITY_IDS.map((ability) => {
    const proficient = input.characterClass ? hasSavingThrowProficiency(ability, classSaves) : false
    const score = input.abilityScores?.[ability]
    const bonus =
      typeof score === 'number' && typeof profBonus === 'number'
        ? savingThrowBonus(score, proficient, profBonus)
        : undefined

    return { ability, bonus, proficient }
  })
}

export function deriveSkillModifiers(
  input: CharacterDerivationInput,
  profBonus: number | undefined,
): CharacterDerivedSkill[] {
  return input.skillProficiencies.map((skillRow) => {
    const abilityScore = input.abilityScores?.[skillRow.ability]
    const rank = findSkillProficiencyRank(input.proficiencies, skillRow.slug)
    const modifier =
      typeof abilityScore === 'number' && typeof profBonus === 'number'
        ? skillModifier(abilityScore, rank, profBonus)
        : undefined

    return {
      skillId: skillRow.slug,
      label: skillRow.name ?? getSkillName(skillRow.slug),
      modifier,
      rank,
    }
  })
}

// fallow-ignore-next-line complexity
export function deriveSpellcastingStats(
  input: CharacterDerivationInput,
  profBonus: number | undefined,
): CharacterDerivedSpellcasting | null {
  const characterClass = input.characterClass
  const spellcasting = characterClass?.spellcasting

  if (
    !characterClass ||
    !spellcasting ||
    !isSpellcastingActiveAtLevel(characterClass, input.level, { runtime: true })
  ) {
    return null
  }

  const abilityScore = input.abilityScores?.[spellcasting.ability]
  const slotProgression = input.spellcastingProgression
    ? resolveSlotProgressionForClass({ spellcasting }, input.spellcastingProgression)
    : null
  const slots = slotProgression
    ? resolveLeveledSlotCountsAtLevel(slotProgression, input.level).slots
    : []

  return {
    ability: spellcasting.ability,
    saveDc:
      typeof abilityScore === 'number' && typeof profBonus === 'number'
        ? abilitySaveDc(abilityScore, profBonus)
        : undefined,
    attackBonus:
      typeof abilityScore === 'number' && typeof profBonus === 'number'
        ? spellAttackBonus(abilityScore, profBonus)
        : undefined,
    slots,
  }
}

function deriveArmorClass(input: CharacterDerivationInput): DerivedField<number> {
  if (input.unresolvedEquippedArmor) return unavailableField('missing-reference')

  const dexScore = input.abilityScores?.dex
  const dexModifier = typeof dexScore === 'number' ? abilityModifier(dexScore) : 0
  const equipped = input.equippedArmor ?? []
  const bodyArmor = equipped.find((armor) => armor.category !== 'shields')
  const shields = equipped.filter((armor) => armor.category === 'shields')
  return resolvedField(
    resolveCreatureArmorClass({
      rules: input.armorClassRules,
      dexModifier,
      bodyArmor,
      shields,
      eligibility: { skinCompetesWithArmor: false },
    }).ac,
  )
}

/**
 * Derives ability modifiers, defenses, skills, and spellcasting from partial
 * character-like input. Tolerant of missing class or ability scores.
 */
export function deriveCharacterProfile(input: CharacterDerivationInput): CharacterDerivedProfile {
  const profBonus = input.proficiencyBonusOverride ?? proficiencyBonus(input.level)
  const conScore = input.abilityScores?.con

  return {
    abilityScores: deriveAbilityScores(input.abilityScores),
    proficiencyBonus: profBonus,
    maxHp: input.characterClass
      ? input.level <= 1
        ? resolveLevelOneMaxHp({
            hitDie: input.characterClass.hitDie,
            conScore,
          })
        : resolveMaxHpAtLevel({
            hitDie: input.characterClass.hitDie,
            constitutionModifier: typeof conScore === 'number' ? abilityModifier(conScore) : 0,
            level: input.level,
            method: 'average',
          })
      : undefined,
    ac: deriveArmorClass(input),
    savingThrows: deriveSavingThrows(input, profBonus),
    skills: deriveSkillModifiers(input, profBonus),
    spellcasting: deriveSpellcastingStats(input, profBonus),
  }
}
