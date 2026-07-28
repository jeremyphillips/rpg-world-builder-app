import type { CharacterClass } from '../../../content/classes/class'
import type { ToolProficiencyChoice } from '../../../content/lib/proficiency-grant-set'
import { isMeaningfulToolProficiencyChoice } from '../../../content/lib/proficiency-grant-set'
import type { CharacterBuildCatalogIndex } from '../context'
import { resolveToolPoolChoiceOptions } from '../resolvers/proficiency/resolve-tool-pool-choice-options'

export type EligibleProficiencyChoiceTarget = {
  choiceId: string
  label: string
  choose: number
  optionCount: number
}

function isEligibleProficiencyChoiceTarget(
  choice: ToolProficiencyChoice,
  characterClass: CharacterClass,
  catalogIndex: CharacterBuildCatalogIndex,
): boolean {
  if (choice.choose !== 1) return false
  if (!isMeaningfulToolProficiencyChoice(choice)) return false
  if (!choice.pool) return false

  const optionCount = resolveToolPoolChoiceOptions(
    choice.pool,
    catalogIndex.equipment,
    characterClass.rulesetId,
  ).length

  return optionCount > 0
}

function choiceLabel(choice: ToolProficiencyChoice): string {
  return choice.label?.trim() || choice.id
}

/**
 * Returns tool proficiency choices on a class that may be referenced by
 * `target.source === 'proficiency_choice'` starting-equipment grants.
 */
export function resolveEligibleProficiencyChoiceTargets(
  characterClass: CharacterClass,
  catalogIndex: CharacterBuildCatalogIndex,
): EligibleProficiencyChoiceTarget[] {
  const choices = characterClass.characterCreation?.proficiencies?.tools?.choices ?? []
  const seenIds = new Set<string>()
  const eligible: EligibleProficiencyChoiceTarget[] = []

  for (const choice of choices) {
    if (seenIds.has(choice.id)) continue
    seenIds.add(choice.id)

    if (!isEligibleProficiencyChoiceTarget(choice, characterClass, catalogIndex)) continue

    const optionCount = resolveToolPoolChoiceOptions(
      choice.pool!,
      catalogIndex.equipment,
      characterClass.rulesetId,
    ).length

    eligible.push({
      choiceId: choice.id,
      label: choiceLabel(choice),
      choose: choice.choose,
      optionCount,
    })
  }

  return eligible
}

/** Set of choice ids eligible for proficiency-linked starting-equipment grants. */
export function eligibleProficiencyChoiceTargetIds(
  characterClass: CharacterClass,
  catalogIndex: CharacterBuildCatalogIndex,
): ReadonlySet<string> {
  return new Set(
    resolveEligibleProficiencyChoiceTargets(characterClass, catalogIndex).map(
      (entry) => entry.choiceId,
    ),
  )
}
