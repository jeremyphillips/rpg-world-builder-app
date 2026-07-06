import type { CharacterClass, CreateClassInput } from '@rpg/contracts'

import type { CharacterCreationProficienciesForm } from './class-character-creation-proficiencies-form-fields'

const DEFAULT_SKILL_CHOICE_FORM = { choose: 0, from: [] as string[] }

/** Maps stored character-creation proficiencies into flat form state (first choice only). */
export function characterCreationProficienciesToFormValues(
  characterCreation?: CharacterClass['characterCreation'],
): CharacterCreationProficienciesForm {
  const skillChoice = characterCreation?.proficiencies?.skills?.choices?.[0]
  return {
    skills: {
      choose: skillChoice?.choose ?? DEFAULT_SKILL_CHOICE_FORM.choose,
      from: skillChoice?.from ?? DEFAULT_SKILL_CHOICE_FORM.from,
    },
  }
}

/** Ephemeral defaults while authoring — omitted on save when not meaningful. */
export function characterCreationProficienciesDefaultValues(): CharacterCreationProficienciesForm {
  return characterCreationProficienciesToFormValues()
}

/** Persists skill choices when choose > 0 and from is non-empty; otherwise omits. */
export function characterCreationProficienciesFromFormValues(
  proficiencies: CharacterCreationProficienciesForm | undefined,
  entity?: CharacterClass,
): NonNullable<CreateClassInput['characterCreation']>['proficiencies'] | undefined {
  const choice = proficiencies?.skills
  if (!choice || choice.choose <= 0 || choice.from.length === 0) return undefined
  const existingLabel = entity?.characterCreation?.proficiencies?.skills?.choices?.[0]?.label
  return {
    skills: {
      choices: [
        {
          id: 'class-skills',
          ...(existingLabel ? { label: existingLabel } : {}),
          choose: choice.choose,
          from: choice.from,
        },
      ],
    },
  }
}
