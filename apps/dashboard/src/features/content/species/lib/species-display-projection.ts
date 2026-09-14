import {
  isEffectiveAvailable,
  isVisibleToViewer,
  resolveDefaultSpeciesAccess,
  resolveEffectiveCampaignAccess,
  resolveEffectiveSpeciesTraitAccess,
  type ContentViewer,
  type ResolvedContentCampaignAccess,
  type SpeciesBodyTrait,
  type SpeciesHeritageOption,
} from '@rpg/contracts'

export type SpeciesDisplayProjectionContext = {
  speciesAccess: ResolvedContentCampaignAccess
  viewer?: ContentViewer
}

function passesViewerGate(
  access: ResolvedContentCampaignAccess,
  viewer: ContentViewer | undefined,
): boolean {
  if (!viewer) return isEffectiveAvailable(access)
  return isVisibleToViewer(access, viewer)
}

export function projectVisibleSpeciesTraits(
  traits: readonly SpeciesBodyTrait[],
  ctx: SpeciesDisplayProjectionContext,
): SpeciesBodyTrait[] {
  return traits.filter((trait) => {
    const effective = resolveEffectiveSpeciesTraitAccess(ctx.speciesAccess, trait)
    return passesViewerGate(effective, ctx.viewer)
  })
}

export function projectVisibleHeritageOptions(
  options: readonly SpeciesHeritageOption[],
  ctx: SpeciesDisplayProjectionContext,
): SpeciesHeritageOption[] {
  return options.filter((option) => {
    const effective = resolveEffectiveCampaignAccess(ctx.speciesAccess, option.campaignAccess)
    return passesViewerGate(effective, ctx.viewer)
  })
}

export function resolveSpeciesDisplayAccess(
  species: Record<string, unknown>,
): ResolvedContentCampaignAccess {
  const campaignAccess = species.campaignAccess as ResolvedContentCampaignAccess | undefined
  return resolveDefaultSpeciesAccess(campaignAccess)
}
