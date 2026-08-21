import {
  assembleCharacterProficiencies,
  indexCharacterBuildCatalog,
  resolveProficiencyPickerItems,
  type ChoiceSet,
  type ProficiencyPickerItem,
} from '@rpg/contracts'

import { createProficienciesStepOriginLanguagesFixture } from '../../../lib/proficiencies/proficiencies-step.fixtures'
import {
  createProficienciesStepRogueFixture,
  proficienciesStepAcrobaticsSkill,
  proficienciesStepPerceptionSkill,
  proficienciesStepStealthSkill,
} from '../../../lib/proficiencies/proficiencies-step.fixtures'

const rogueFixture = createProficienciesStepRogueFixture()

export const proficiencyPickerSkillChoiceSetFixture = rogueFixture.resolvedChoiceSets.find(
  (choiceSet) => choiceSet.choiceType === 'skillProficiency',
)! satisfies ChoiceSet

export const proficiencyPickerStealthOptionId = proficienciesStepStealthSkill.id
export const proficiencyPickerAcrobaticsOptionId = proficienciesStepAcrobaticsSkill.id
export const proficiencyPickerPerceptionOptionId = proficienciesStepPerceptionSkill.id

const catalogIndex = indexCharacterBuildCatalog(rogueFixture.context.catalog)
export { catalogIndex as proficiencyPickerCatalogIndexFixture }

const proficiencies = assembleCharacterProficiencies(
  rogueFixture.draft,
  catalogIndex,
  rogueFixture.resolvedChoiceSets,
  rogueFixture.context.catalog.classes[0]!,
)

export const proficiencyPickerOpenItemsFixture: ProficiencyPickerItem[] =
  resolveProficiencyPickerItems({
    draft: rogueFixture.draft,
    context: rogueFixture.context,
    choiceSetId: proficiencyPickerSkillChoiceSetFixture.id,
    proficiencies,
  })

export const proficiencyPickerItemsFixture: ProficiencyPickerItem[] = resolveProficiencyPickerItems(
  {
    draft: {
      ...rogueFixture.draft,
      choiceSelections: {
        [proficiencyPickerSkillChoiceSetFixture.id]: [
          proficiencyPickerStealthOptionId,
          proficiencyPickerAcrobaticsOptionId,
        ],
      },
    },
    context: rogueFixture.context,
    choiceSetId: proficiencyPickerSkillChoiceSetFixture.id,
    proficiencies: assembleCharacterProficiencies(
      {
        ...rogueFixture.draft,
        choiceSelections: {
          [proficiencyPickerSkillChoiceSetFixture.id]: [
            proficiencyPickerStealthOptionId,
            proficiencyPickerAcrobaticsOptionId,
          ],
        },
      },
      catalogIndex,
      rogueFixture.resolvedChoiceSets,
      rogueFixture.context.catalog.classes[0]!,
    ),
  },
)

const originLanguagesFixture = createProficienciesStepOriginLanguagesFixture()

export const proficiencyPickerLanguageChoiceSetFixture =
  originLanguagesFixture.resolvedChoiceSets.find(
    (choiceSet) => choiceSet.choiceType === 'language',
  )! satisfies ChoiceSet

const originCatalogIndex = indexCharacterBuildCatalog(originLanguagesFixture.context.catalog)
export { originCatalogIndex as proficiencyPickerLanguageCatalogIndexFixture }
const originProficiencies = assembleCharacterProficiencies(
  originLanguagesFixture.draft,
  originCatalogIndex,
  originLanguagesFixture.resolvedChoiceSets,
  undefined,
)

export const proficiencyPickerLanguageItemsFixture: ProficiencyPickerItem[] =
  resolveProficiencyPickerItems({
    draft: originLanguagesFixture.draft,
    context: originLanguagesFixture.context,
    choiceSetId: proficiencyPickerLanguageChoiceSetFixture.id,
    proficiencies: originProficiencies,
  })
