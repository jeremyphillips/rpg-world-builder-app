import {
  isEffectiveAvailable,
  resolveDefaultSpeciesAccess,
  resolveEffectiveCampaignAccess,
} from '../../../../content/lib/campaign-access'
import { resolveTraitName } from '../../../../content/lib/grants/trait-display'
import type { Species, SpeciesHeritageOption } from '../../../../content/species'
import { isContentPlayableFor } from '../../../campaign/content-resolution-policy'
import { buildChoiceSetId, type ChoiceSet } from '../../choice-set'
import type { CharacterBuildCatalogIndex, CharacterBuildContext } from '../../context'
import type { CharacterBuilderDraft } from '../../draft/draft'

export function resolveSelectedHeritageOptionId(
  draft: CharacterBuilderDraft,
  species: Species,
): string | undefined {
  if (draft.species.heritageId) return draft.species.heritageId

  const heritageChoiceId = buildChoiceSetId('species', species.id, 'heritage')
  return draft.choiceSelections[heritageChoiceId]?.[0]
}

type SpeciesWithAccess = Species & {
  campaignAccess?: ReturnType<typeof resolveDefaultSpeciesAccess>
}

function isHeritageOptionPlayable(
  speciesAccess: ReturnType<typeof resolveDefaultSpeciesAccess>,
  option: SpeciesHeritageOption,
  context: CharacterBuildContext,
): boolean {
  const effective = resolveEffectiveCampaignAccess(speciesAccess, option.campaignAccess)
  if (!isEffectiveAvailable(effective)) return false
  return isContentPlayableFor({ campaignAccess: effective }, context.playActor)
}

/** Builds species heritage trait ChoiceSets when the species defines heritage options. */
export function resolveSpeciesHeritageChoiceSets(
  draft: CharacterBuilderDraft,
  catalogIndex: CharacterBuildCatalogIndex,
  context: CharacterBuildContext,
): ChoiceSet[] {
  const speciesId = draft.species.speciesId
  if (!speciesId) return []

  const species = catalogIndex.species.get(speciesId) as SpeciesWithAccess | undefined
  if (!species?.heritage) return []

  const speciesAccess = resolveDefaultSpeciesAccess(species.campaignAccess)
  const visibleOptions = species.heritage.options.filter((option) =>
    isHeritageOptionPlayable(speciesAccess, option, context),
  )

  if (visibleOptions.length === 0) return []

  return [
    {
      id: buildChoiceSetId('species', species.id, 'heritage'),
      sourceType: 'species',
      sourceId: species.id,
      choiceType: 'trait',
      label: species.heritage.name,
      min: species.heritage.choose,
      max: species.heritage.choose,
      options: visibleOptions.map((option) => ({
        id: option.id,
        label: resolveTraitName(option),
      })),
      required: true,
    },
  ]
}
