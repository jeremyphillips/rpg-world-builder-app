import {
  buildTerritorialAuthorityRelationship,
  getOrganizationKindLabel,
  getTerritorialAuthorityLabel,
  groupTerritorialAuthorityRelationshipsByKind,
  TERRITORIAL_AUTHORITY_ENTRIES,
  type Organization,
  type TerritorialAuthorityKind,
  type TerritorialAuthorityRelationship,
} from '@rpg/contracts'

import { ROUTES } from '@/app/routes'

import type { LocationAuthoringType } from './location-authoring-type'
import { getLocationRelationshipCapabilities } from './location-relationship-capabilities'

export const TERRITORIAL_AUTHORITY_FIELD = 'territorialAuthority'

export const TERRITORIAL_AUTHORITY_SECTION_LABEL = 'Territorial Authority'

export const TERRITORIAL_AUTHORITY_SECTION_DESCRIPTION =
  'Add organizations that govern, control, or claim this region.'

export const TERRITORIAL_AUTHORITY_EMPTY_TEXT = 'No territorial authority linked yet.'

export const TERRITORIAL_AUTHORITY_ADD_LABEL = 'Add authority'

export const TERRITORIAL_AUTHORITY_DRAWER_TITLE = 'Add territorial authority'

export const TERRITORIAL_AUTHORITY_KIND_LABEL = 'Authority type'

export const TERRITORIAL_AUTHORITY_ORGANIZATION_LABEL = 'Organization'

export const TERRITORIAL_AUTHORITY_KIND_PLACEHOLDER = 'Choose authority type…'

export const TERRITORIAL_AUTHORITY_SEARCH_DISABLED_PLACEHOLDER = 'Choose an authority type first'

export const TERRITORIAL_AUTHORITY_CHOOSE_KIND_LIST_MESSAGE =
  'Choose an authority type to see available organizations.'

export const TERRITORIAL_AUTHORITY_UNRESOLVED_ORGANIZATION_LABEL = 'Unavailable organization'

export type TerritorialAuthorityRow = {
  relationship: TerritorialAuthorityRelationship
  kindLabel: string
  organizationLabel: string
  organizationSummary?: string
  organizationHref?: string
  organizationUnresolved: boolean
}

export function buildTerritorialAuthorityKindOptions(authoringType: LocationAuthoringType) {
  return getLocationRelationshipCapabilities(authoringType).territorialAuthorityKinds.map(
    (value) => ({
      value,
      label: getTerritorialAuthorityLabel(value),
      description: TERRITORIAL_AUTHORITY_ENTRIES[value].description,
    }),
  )
}

export function isTerritorialAuthorityAuthoringSupported(authoringType: LocationAuthoringType) {
  return getLocationRelationshipCapabilities(authoringType).territorialAuthorityKinds.length > 0
}

export function shouldShowTerritorialAuthoritySection(input: {
  authoringType: LocationAuthoringType
  relationships: readonly TerritorialAuthorityRelationship[]
}): boolean {
  return (
    input.relationships.length > 0 || isTerritorialAuthorityAuthoringSupported(input.authoringType)
  )
}

export function buildTerritorialAuthorityRows(input: {
  relationships: readonly TerritorialAuthorityRelationship[]
  campaignId: string
  organizationsById: ReadonlyMap<string, Organization>
}): TerritorialAuthorityRow[] {
  return input.relationships.map((relationship) => {
    const organization = input.organizationsById.get(relationship.organizationId)
    const organizationUnresolved = !organization

    return {
      relationship,
      kindLabel: getTerritorialAuthorityLabel(relationship.kind),
      organizationLabel: organization?.name ?? TERRITORIAL_AUTHORITY_UNRESOLVED_ORGANIZATION_LABEL,
      organizationSummary: organization
        ? getOrganizationKindLabel(organization.organizationKind)
        : undefined,
      organizationHref: organization
        ? ROUTES.content.organizations.detail(input.campaignId, organization.id)
        : undefined,
      organizationUnresolved,
    }
  })
}

export { groupTerritorialAuthorityRelationshipsByKind }

export function appendTerritorialAuthorityRelationship(input: {
  relationships: readonly TerritorialAuthorityRelationship[]
  organizationId: string
  kind: TerritorialAuthorityKind
  id?: string
}): TerritorialAuthorityRelationship[] {
  return [
    ...input.relationships,
    buildTerritorialAuthorityRelationship({
      id: input.id ?? crypto.randomUUID(),
      organizationId: input.organizationId,
      kind: input.kind,
    }),
  ]
}

export function removeTerritorialAuthorityRelationship(
  relationships: readonly TerritorialAuthorityRelationship[],
  relationshipId: string,
): TerritorialAuthorityRelationship[] {
  return relationships.filter((relationship) => relationship.id !== relationshipId)
}

export function isTerritorialAuthorityRelationshipSelected(input: {
  relationships: readonly TerritorialAuthorityRelationship[]
  relationshipId: string
}): boolean {
  return input.relationships.some((relationship) => relationship.id === input.relationshipId)
}

export function buildTerritorialAuthoritySearchText(input: {
  name: string
  organizationKindLabel?: string
}): string {
  return [input.name, input.organizationKindLabel].filter(Boolean).join(' ')
}

export function buildTerritorialAuthorityAddActionLabel(kind: TerritorialAuthorityKind): string {
  return `Add as ${getTerritorialAuthorityLabel(kind).toLowerCase()}`
}
