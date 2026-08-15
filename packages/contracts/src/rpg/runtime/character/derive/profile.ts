import type { ArmorEquipment } from '../../../content/equipment'
import { DEFAULT_ARMOR_CLASS_BASE } from '../../../campaign/patches/campaign-mechanics-patch'
import type { CharacterClass } from '../../../content/classes/class'
import { isSpellcastingActiveAtLevel } from '../../../content/classes/spellcasting'
import type { SkillProficiency } from '../../../content/skill-proficiency'
import { getSkillName } from '../../../content/skill-proficiency'
import { getSlotRow, SLOT_TABLES } from '../../../content/classes/spellcasting/slots'
import { proficiencyBonus } from '../../../primitives/level'
import { ABILITY_IDS, type Ability } from '../../../vocab/ability'
import type { ArmorClassBase } from '../../../vocab/mechanics/edition-preset-mechanics'
import type { CharacterProficiencies } from '../proficiencies'
import type { CharacterSkillToolProficiencyRank } from '../proficiencies'
import {
  abilityModifier,
  hasSavingThrowProficiency,
  resolveLevelOneMaxHp,
  resolveUnarmoredAc,
  savingThrowBonus,
  skillModifier,
  spellAttackBonus,
  spellSaveDc,
} from './index'
import { resolveMaxHpAtLevel } from './hit-points-at-level'
import { resolveEquippedArmorClass } from './armor-class'

// ---------------------------------------------------------------------------
// Character derived profile — reusable derivation over partial character-like
// input. Accepts incomplete data (builder drafts, sheet previews, imports)
// without requiring a persisted Character record.
// ---------------------------------------------------------------------------

export type CharacterDerivationInput = {
  level: number
  /** When set, overrides formula-derived proficiency bonus (e.g. Level 0 NPC campaign literal). */
  proficiencyBonusOverride?: number
  /** Ruleset base AC (ascending mode). Defaults to the SRD ascending base when omitted. */
  armorClassBase?: ArmorClassBase
  abilityScores?: Partial<Record<Ability, number>>
  characterClass?: CharacterClass
  proficiencies: CharacterProficiencies
  skillProficiencies: readonly SkillProficiency[]
  /** Equipped armor variants for equipment-based AC; omit for unarmored preview. */
  equippedArmor?: readonly ArmorEquipment[]
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
  const acBase = input.armorClassBase ?? DEFAULT_ARMOR_CLASS_BASE
  const profBonus = input.proficiencyBonusOverride ?? proficiencyBonus(input.level)
  const conScore = input.abilityScores?.con
  const dexScore = input.abilityScores?.dex

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
    ac:
      input.equippedArmor && input.equippedArmor.length > 0
        ? resolveEquippedArmorClass({
            acBase,
            dexModifier: typeof dexScore === 'number' ? abilityModifier(dexScore) : 0,
            equippedArmor: input.equippedArmor,
          })
        : resolveUnarmoredAc({ acBase, dexScore }),
    savingThrows: deriveSavingThrows(input, profBonus),
    skills: deriveSkillModifiers(input, profBonus),
    spellcasting: deriveSpellcastingStats(input, profBonus),
  }
}
