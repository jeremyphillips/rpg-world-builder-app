import { useMemo, type ReactNode } from 'react'

import {
  resolveCampaignIdFromContext,
  resolvePlayableBuilderContent,
  type CharacterBuildContext,
  type Location,
  type Organization,
  type OrganizationReferenceResolution,
} from '@rpg/contracts'
import {
  RelationshipFieldProvider,
  type RelationshipFieldAdapter,
  type RelationshipFieldRegistry,
} from '@rpg/ui/form'

import { useLocations } from '@/features/content'

import { filterResidenceEligibleLocations } from '../connections/residence-location-connection.lib'
import { resolveCharacterLocationsQueryStatus } from './character-locations-query-status.lib'
import { characterOrganizationMembershipRelationshipAdapter } from './character-organization-membership-relationship.adapter'
import { characterResidenceRelationshipAdapter } from './character-residence-relationship.adapter'
import type { CharacterRelationshipFieldContext } from './character-relationship-field-context.types'
import {
  CHARACTER_ORGANIZATION_MEMBERSHIP_VOCABULARY,
  CHARACTER_RESIDENCE_VOCABULARY,
} from './character-relationship-vocabulary'

const CHARACTER_RELATIONSHIP_FIELD_REGISTRY: RelationshipFieldRegistry = {
  [CHARACTER_ORGANIZATION_MEMBERSHIP_VOCABULARY]:
    characterOrganizationMembershipRelationshipAdapter as RelationshipFieldAdapter,
  [CHARACTER_RESIDENCE_VOCABULARY]:
    characterResidenceRelationshipAdapter as RelationshipFieldAdapter,
}

export type CharacterRelationshipFormProviderProps = {
  buildContext: CharacterBuildContext
  children: ReactNode
}

export function CharacterRelationshipFormProvider({
  buildContext,
  children,
}: CharacterRelationshipFormProviderProps) {
  const context = useCharacterBuilderRelationshipFieldContext(buildContext)

  return (
    <RelationshipFieldProvider context={context} registry={CHARACTER_RELATIONSHIP_FIELD_REGISTRY}>
      {children}
    </RelationshipFieldProvider>
  )
}

export function useCharacterBuilderRelationshipFieldContext(
  buildContext: CharacterBuildContext,
): CharacterRelationshipFieldContext {
  const campaignId = resolveCampaignIdFromContext(buildContext)
  const locationsQuery = useLocations(campaignId)
  const availableOrganizations = useMemo(
    () => resolvePlayableBuilderContent(buildContext).organizations,
    [buildContext],
  )

  return useMemo(() => {
    const organizationsById = new Map(
      buildContext.catalog.organizations.map((organization) => [organization.id, organization]),
    )
    const locationsQueryStatus = resolveCharacterLocationsQueryStatus({
      campaignId,
      isPending: locationsQuery.isPending,
      isError: locationsQuery.isError,
      error: locationsQuery.error,
      hasData: locationsQuery.data !== undefined,
    })
    const eligibleResidenceLocations =
      locationsQueryStatus.status === 'success'
        ? filterResidenceEligibleLocations(locationsQuery.data ?? [])
        : []
    const locationsById = new Map(
      eligibleResidenceLocations.map((location) => [location.id, location]),
    )
    const availableOrganizationIdSet = new Set(availableOrganizations.map(({ id }) => id))
    const availableResidenceIdSet = new Set(eligibleResidenceLocations.map(({ id }) => id))

    return {
      mode: 'draft',
      campaignId,
      buildContext,
      organizationsById,
      locationsById,
      availableOrganizationIdSet,
      availableResidenceIdSet,
      availableOrganizations,
      eligibleResidenceLocations,
      locationsQueryStatus,
    }
  }, [
    availableOrganizations,
    buildContext,
    campaignId,
    locationsQuery.data,
    locationsQuery.error,
    locationsQuery.isError,
    locationsQuery.isPending,
  ])
}

export type CharacterApiRelationshipFieldContextInput = {
  campaignId: string
  availableOrganizations: readonly Organization[]
  eligibleResidenceLocations: readonly Location[]
  locationsQueryStatus: CharacterRelationshipFieldContext['locationsQueryStatus']
  organizationsById: Map<string, Organization>
  locationsById: Map<string, Location>
  availableOrganizationIdSet: Set<string>
  availableResidenceIdSet: Set<string>
  onEditMembership?: (membership: OrganizationReferenceResolution) => void
  onRemoveUnresolvedMembership?: (membership: OrganizationReferenceResolution) => void
}

export function buildCharacterApiRelationshipFieldContext(
  input: CharacterApiRelationshipFieldContextInput,
): CharacterRelationshipFieldContext {
  return {
    mode: 'api',
    campaignId: input.campaignId,
    organizationsById: input.organizationsById,
    locationsById: input.locationsById,
    availableOrganizationIdSet: input.availableOrganizationIdSet,
    availableResidenceIdSet: input.availableResidenceIdSet,
    availableOrganizations: input.availableOrganizations,
    eligibleResidenceLocations: input.eligibleResidenceLocations,
    locationsQueryStatus: input.locationsQueryStatus,
    onEditMembership: input.onEditMembership,
    onRemoveUnresolvedMembership: input.onRemoveUnresolvedMembership,
  }
}

export {
  CHARACTER_RELATIONSHIP_FIELD_REGISTRY,
  CHARACTER_ORGANIZATION_MEMBERSHIP_VOCABULARY,
  CHARACTER_RESIDENCE_VOCABULARY,
}
