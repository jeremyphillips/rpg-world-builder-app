import { isMeaningfulLanguageProficiencyChoice } from '../../../../content/lib/grants/proficiency-grant-set'
import { getLanguageLabel } from '../../../../vocab/language'
import { resolveLanguagesFromChoiceSource } from '../../../creature/languages'
import { buildChoiceSetId, type ChoiceSet } from '../../choice-set'
import type { CharacterBuildContext } from '../../context'
import type { CharacterBuilderDraft } from '../../draft/draft'

// ---------------------------------------------------------------------------
// Character Builder language ChoiceSets — resolves ruleset origin language
// choices for the builder UI. Does not assemble final character languages.
// ---------------------------------------------------------------------------

function languageToChoiceSetOption(language: {
  id: string
  label: string
}): ChoiceSet['options'][number] {
  return { id: language.id, label: language.label }
}

function resolveLanguageChoiceOptions(
  choice: Parameters<typeof isMeaningfulLanguageProficiencyChoice>[0],
  languages: CharacterBuildContext['catalog']['languages'],
): ChoiceSet['options'] {
  const resolved = resolveLanguagesFromChoiceSource({
    languages,
    from: choice.from,
    categories: choice.categories,
  })

  if (choice.from.length > 0) {
    return choice.from.map((id) => {
      const language = resolved.find((row) => row.id === id)
      return {
        id,
        label: language?.label ?? getLanguageLabel(id),
      }
    })
  }

  return resolved.map(languageToChoiceSetOption)
}

/** Builds language ChoiceSets from character-creation proficiency choices. */
export function resolveLanguageChoiceSets(
  _draft: CharacterBuilderDraft,
  context: CharacterBuildContext,
): ChoiceSet[] {
  const choices = context.characterCreationRules.proficiencyChoices.languages

  // MVP authoring/rendering supports only the first choice package.
  // Additional packages are intentionally ignored until multi-package UI exists.
  const choice = choices.find(isMeaningfulLanguageProficiencyChoice)
  if (!choice || choice.choose <= 0) return []

  const options = resolveLanguageChoiceOptions(choice, context.catalog.languages)
  if (options.length === 0) return []

  return [
    {
      id: buildChoiceSetId('ruleset', context.rulesetId, choice.id),
      sourceType: 'ruleset',
      sourceId: context.rulesetId,
      choiceType: 'language',
      label: choice.label ?? 'Choose Languages',
      min: choice.choose,
      max: choice.choose,
      options,
      required: true,
    },
  ]
}
