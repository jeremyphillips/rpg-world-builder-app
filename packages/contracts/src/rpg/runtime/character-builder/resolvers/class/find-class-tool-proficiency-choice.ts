import type { CharacterClass } from '../../../../content/classes/class'
import type { ToolProficiencyChoice } from '../../../../content/lib/grants/proficiency-grant-set'

/** Class tool proficiency choice with this id, when the class defines one. */
export function findClassToolProficiencyChoice(
  characterClass: CharacterClass,
  choiceId: string,
): ToolProficiencyChoice | undefined {
  return (characterClass.characterCreation?.proficiencies?.tools?.choices ?? []).find(
    (entry) => entry.id === choiceId,
  )
}
