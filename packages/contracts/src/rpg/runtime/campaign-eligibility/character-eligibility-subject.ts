import type { CreateCharacterInput } from '../character/create-input'
import { createDefaultCharacterVitalState } from '../character/sheet/character-vital'
import type { Character, PcCharacter } from '../character/sheet'

/**
 * Narrow projection consumed by campaign eligibility resolvers. Avoids inventing
 * persistence-only fields (vital, timestamps) at candidate-resolution time.
 */
export type CharacterEligibilitySubject = CreateCharacterInput & {
  userId: string
  id?: string
}

export function projectCharacterEligibilitySubjectFromCharacter(
  character: PcCharacter,
): CharacterEligibilitySubject {
  return {
    id: character.id,
    userId: character.userId,
    characterType: character.characterType,
    rulesetId: character.rulesetId,
    name: character.name,
    imageKey: character.imageKey,
    classes: character.classes,
    species: character.species,
    alignment: character.alignment,
    xp: character.xp,
    abilityScores: character.abilityScores,
    hitPoints: character.hitPoints,
    proficiencies: character.proficiencies,
    spells: character.spells,
    equipment: character.equipment,
    wealth: character.wealth,
    narrative: character.narrative,
    connections: character.connections,
    feats: character.feats,
  }
}

export function projectCharacterEligibilitySubjectFromCreateInput(
  input: CreateCharacterInput,
  userId: string,
): CharacterEligibilitySubject {
  return { ...input, userId }
}

/** Bridge to existing eligibility resolvers that still accept a full Character. */
export function characterForEligibilityCheck(subject: CharacterEligibilitySubject): Character {
  const now = new Date().toISOString()
  return {
    ...subject,
    id: subject.id ?? 'eligibility-check',
    vital: createDefaultCharacterVitalState(),
    createdAt: now,
    updatedAt: now,
  }
}
