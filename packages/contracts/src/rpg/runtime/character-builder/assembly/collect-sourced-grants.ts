import { classFeaturesUnlockedAtLevel } from '../../../content/classes/class-feature-availability'
import type { CharacterClass } from '../../../content/classes/class'
import {
  isEffectiveAvailable,
  resolveDefaultSpeciesAccess,
  resolveEffectiveCampaignAccess,
  resolveEffectiveSpeciesTraitAccess,
  type ResolvedContentCampaignAccess,
} from '../../../content/lib/campaign-access'
import type { ContentGrant, GrantGroupSource } from '../../../content/lib/grants'
import {
  getUnlockedGrantsAtLevel,
  resolveGrantGroupsFromContent,
} from '../../../content/lib/grants'
import type { Species } from '../../../content/species'
import type { CharacterSelectionSource } from '../../character/sheet/selection-sources'
import type { CharacterBuildCatalogIndex } from '../context'
import type { CharacterBuilderDraft } from '../draft/draft'
import { resolveSelectedHeritageOptionId } from '../resolvers/species/resolve-species-heritage-choice-sets'

// ---------------------------------------------------------------------------
// Collects unlocked content grants with provenance for finalize assembly.
// ---------------------------------------------------------------------------

export type SourcedContentGrant = {
  grant: ContentGrant
  sources: CharacterSelectionSource[]
}

function traitSourcedGrants(
  trait: GrantGroupSource,
  sources: CharacterSelectionSource[],
  characterLevel: number,
  parentLevel = 1,
): SourcedContentGrant[] {
  const groups = resolveGrantGroupsFromContent(trait, { level: parentLevel })
  if (!groups.length) return []

  const grants = getUnlockedGrantsAtLevel(groups, characterLevel, parentLevel)

  return grants.map((grant) => ({ grant, sources }))
}

type SpeciesWithAccess = Species & {
  campaignAccess?: ResolvedContentCampaignAccess
}

function speciesTraitGrants(
  species: SpeciesWithAccess,
  characterLevel: number,
): SourcedContentGrant[] {
  const speciesAccess = resolveDefaultSpeciesAccess(species.campaignAccess)

  return species.traits.flatMap((trait) => {
    const effective = resolveEffectiveSpeciesTraitAccess(speciesAccess, trait)
    if (!isEffectiveAvailable(effective)) return []

    return traitSourcedGrants(
      trait,
      [{ kind: 'speciesTrait', sourceId: species.id, grantId: trait.id }],
      characterLevel,
    )
  })
}

function heritageOptionGrants(
  species: SpeciesWithAccess,
  heritageOptionId: string,
  characterLevel: number,
): SourcedContentGrant[] {
  const heritageOption = species.heritage?.options.find((option) => option.id === heritageOptionId)
  if (!heritageOption) return []

  const speciesAccess = resolveDefaultSpeciesAccess(species.campaignAccess)
  const effective = resolveEffectiveCampaignAccess(speciesAccess, heritageOption.campaignAccess)
  if (!isEffectiveAvailable(effective)) return []

  return traitSourcedGrants(
    heritageOption,
    [{ kind: 'heritageOption', sourceId: species.id, grantId: heritageOptionId }],
    characterLevel,
  )
}

function classFeatureGrants(
  characterClass: CharacterClass,
  characterLevel: number,
): SourcedContentGrant[] {
  return classFeaturesUnlockedAtLevel(characterClass.features, characterLevel).flatMap((feature) =>
    traitSourcedGrants(
      feature,
      [{ kind: 'classFeature', sourceId: characterClass.id, grantId: feature.id }],
      characterLevel,
      feature.level,
    ),
  )
}

/** Returns unlocked grants from species traits, heritage, and class features. */
export function collectSourcedGrants(
  draft: CharacterBuilderDraft,
  catalogIndex: CharacterBuildCatalogIndex,
  characterClass?: CharacterClass,
): SourcedContentGrant[] {
  const characterLevel = draft.class.level
  const sourced: SourcedContentGrant[] = []

  const speciesId = draft.species.speciesId
  if (speciesId) {
    const species = catalogIndex.species.get(speciesId)
    if (species) {
      sourced.push(...speciesTraitGrants(species, characterLevel))

      const heritageOptionId = resolveSelectedHeritageOptionId(draft, species)
      if (heritageOptionId) {
        sourced.push(...heritageOptionGrants(species, heritageOptionId, characterLevel))
      }
    }
  }

  if (characterClass) {
    sourced.push(...classFeatureGrants(characterClass, characterLevel))
  }

  return sourced
}
