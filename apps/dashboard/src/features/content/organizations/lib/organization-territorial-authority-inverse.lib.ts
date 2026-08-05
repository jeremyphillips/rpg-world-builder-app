import { canInverseWriteCrossContentRelationship } from '@rpg/contracts'

export const ORGANIZATION_TERRITORIAL_INVERSE_ADD_LABEL = 'Link region'

export const ORGANIZATION_TERRITORIAL_INVERSE_DRAWER_TITLE =
  'Link region with territorial authority'

export const ORGANIZATION_TERRITORIAL_INVERSE_MUTATION_ERROR =
  'Could not update territorial authority for this organization.'

export const ORGANIZATION_TERRITORIAL_INVERSE_REGION_SEARCH_PLACEHOLDER = 'Search regions'

export const ORGANIZATION_TERRITORIAL_INVERSE_CHOOSE_KIND_MESSAGE =
  'Choose an authority type to see available regions.'

export function canEditOrganizationTerritorialAuthorityInverse(
  canManageCampaign: boolean,
): boolean {
  return (
    canManageCampaign && canInverseWriteCrossContentRelationship('organization_location_connection')
  )
}

export function buildTerritorialAuthorityInverseRegionSearchText(input: {
  name: string
  slug: string
}): string {
  return `${input.name} ${input.slug}`
}
