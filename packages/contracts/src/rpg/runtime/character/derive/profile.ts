import type { CharacterClass } from '../../../content/classes/class'
import { isSpellcastingActiveAtLevel } from '../../../content/classes/spellcasting'
import type { SkillProficiency } from '../../../content/skill-proficiency'
import { getSkillName } from '../../../content/skill-proficiency'
import { getSlotRow, SLOT_TABLES } from '../../../content/spell-slots'
import { proficiencyBonus } from '../../../primitives/level'
import { ABILITY_IDS, type Ability } from '../../../vocab/ability'
import type { CharacterProficiencies } from '../proficiencies'
import type { CharacterSkillToolProficiencyRank } from '../proficiencies'
import {
  abilityModifier,
  hasSavingThrowProficiency,
  levelOneMaxHp,
  savingThrowBonus,
  skillModifier,
  spellAttackBonus,
  spellSaveDc,
  unarmoredAc,
} from './index'

// ---------------------------------------------------------------------------
// Character derived profile — reusable derivation over partial character-like
// input. Accepts incomplete data (builder drafts, sheet previews, imports)
// without requiring a persisted Character record.
// ---------------------------------------------------------------------------

export type CharacterDerivationInput = {
  level: number
  abilityScores?: Partial<Record<Ability, number>>
  characterClass?: CharacterClass
  proficiencies: CharacterProficiencies
  skillProficiencies: readonly SkillProficiency[]
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
  ac: number | undefined
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

export function deriveSpellcastingStats(
  input: CharacterDerivationInput,
  profBonus: number | undefined,
): CharacterDerivedSpellcasting | null {
  const spellcasting = input.characterClass?.spellcasting

  if (!spellcasting || !isSpellcastingActiveAtLevel(spellcasting, input.level)) {
    return null
  }

  const abilityScore = input.abilityScores?.[spellcasting.ability]
  const slots = getSlotRow(SLOT_TABLES[spellcasting.progression], input.level) ?? []

  return {
    ability: spellcasting.ability,
    saveDc:
      typeof abilityScore === 'number' && typeof profBonus === 'number'
        ? spellSaveDc(abilityScore, profBonus)
        : undefined,
    attackBonus:
      typeof abilityScore === 'number' && typeof profBonus === 'number'
        ? spellAttackBonus(abilityScore, profBonus)
        : undefined,
    slots,
  }
}

/**
 * Derives ability modifiers, defenses, skills, and spellcasting from partial
 * character-like input. Tolerant of missing class or ability scores.
 */
export function deriveCharacterProfile(input: CharacterDerivationInput): CharacterDerivedProfile {
  const profBonus = input.characterClass ? proficiencyBonus(input.level) : undefined
  const conScore = input.abilityScores?.con
  const dexScore = input.abilityScores?.dex

  return {
    abilityScores: deriveAbilityScores(input.abilityScores),
    proficiencyBonus: profBonus,
    maxHp:
      input.characterClass && typeof conScore === 'number'
        ? levelOneMaxHp(input.characterClass.hitDie, conScore)
        : undefined,
    ac: typeof dexScore === 'number' ? unarmoredAc(dexScore) : undefined,
    savingThrows: deriveSavingThrows(input, profBonus),
    skills: deriveSkillModifiers(input, profBonus),
    spellcasting: deriveSpellcastingStats(input, profBonus),
  }
}
