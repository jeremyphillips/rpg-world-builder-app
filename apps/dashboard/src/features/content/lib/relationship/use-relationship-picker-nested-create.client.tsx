'use client'

import * as React from 'react'
import { useQueryClient } from '@tanstack/react-query'

import type { Location, LocationConnectedPartyRow, Organization } from '@rpg/contracts'

import type { CreatedContentResult } from '@/lib/create-flow'

import type { LocationAuthoringType } from '../../locations/lib/location-authoring-type'
import { LocationCreateModal } from '../../locations/components/location-create-modal.client'
import { OrganizationCreateModal } from '../../organizations/components/organization-create-modal.client'
import { mapRelationshipPickerCreateIntentsToAuxiliaryAction } from './map-relationship-picker-create-intents-to-auxiliary-action.lib'
import type { RelationshipPickerCreateIntent } from './relationship-picker-create-intents.lib'
import {
  resolveRelationshipPickerNestedCreateHandoff,
  type OrganizationForwardNestedCreateRevalidationContext,
} from './relationship-picker-nested-create.lib'

export type RelationshipPickerNestedCreatePhase = 'idle' | 'creating' | 'resolvingCreatedTarget'

type ActiveNestedCreateIntent =
  | { target: 'organization' }
  | { target: 'location'; authoringType: LocationAuthoringType }

export type UseRelationshipPickerNestedCreateInput = {
  campaignId: string
  enabled?: boolean
  createIntents: readonly RelationshipPickerCreateIntent[]
  /** Organization forward drawer — refreshes org location references after location create. */
  subjectOrganizationId?: string
  /** Location inverse drawers — refreshes connected parties after organization create. */
  locationId?: string
  onSelectCreatedOrganization?: (organizationId: string) => void
  onSelectCreatedLocation?: (locationId: string) => void
  revalidateCreatedOrganization?: (
    organization: Organization,
    orgRows: readonly LocationConnectedPartyRow[],
  ) => boolean
  revalidateCreatedLocation?: (
    location: Location,
    context: OrganizationForwardNestedCreateRevalidationContext,
  ) => boolean
}

export function useRelationshipPickerNestedCreate({
  campaignId,
  enabled = true,
  createIntents,
  subjectOrganizationId,
  locationId,
  onSelectCreatedOrganization,
  onSelectCreatedLocation,
  revalidateCreatedOrganization,
  revalidateCreatedLocation,
}: UseRelationshipPickerNestedCreateInput) {
  const queryClient = useQueryClient()
  const [phase, setPhase] = React.useState<RelationshipPickerNestedCreatePhase>('idle')
  const [activeIntent, setActiveIntent] = React.useState<ActiveNestedCreateIntent | null>(null)

  const nestedCreateBusy = phase === 'creating' || phase === 'resolvingCreatedTarget'

  const resetNestedCreate = React.useCallback(() => {
    setPhase('idle')
    setActiveIntent(null)
  }, [])

  const launchOrganizationCreate = React.useCallback(() => {
    if (nestedCreateBusy) return
    setActiveIntent({ target: 'organization' })
    setPhase('creating')
  }, [nestedCreateBusy])

  const launchLocationCreate = React.useCallback(
    (authoringType: LocationAuthoringType) => {
      if (nestedCreateBusy) return
      setActiveIntent({ target: 'location', authoringType })
      setPhase('creating')
    },
    [nestedCreateBusy],
  )

  const handleCreateModalOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (nextOpen) return
      if (phase === 'creating') {
        resetNestedCreate()
      }
    },
    [phase, resetNestedCreate],
  )

  const handleCreated = React.useCallback(
    async (result: CreatedContentResult) => {
      setActiveIntent(null)
      setPhase('resolvingCreatedTarget')

      try {
        const handoff = await resolveRelationshipPickerNestedCreateHandoff(queryClient, {
          campaignId,
          result,
          subjectOrganizationId,
          locationId,
          revalidateCreatedOrganization,
          revalidateCreatedLocation,
        })

        if (handoff.organizationId) {
          onSelectCreatedOrganization?.(handoff.organizationId)
        }
        if (handoff.locationId) {
          onSelectCreatedLocation?.(handoff.locationId)
        }
      } finally {
        setPhase('idle')
      }
    },
    [
      campaignId,
      locationId,
      onSelectCreatedLocation,
      onSelectCreatedOrganization,
      queryClient,
      revalidateCreatedLocation,
      revalidateCreatedOrganization,
      subjectOrganizationId,
    ],
  )

  const auxiliaryAction = React.useMemo(() => {
    if (!enabled) {
      return undefined
    }

    return mapRelationshipPickerCreateIntentsToAuxiliaryAction(createIntents, {
      onOrganization: launchOrganizationCreate,
      onLocation: launchLocationCreate,
      disabled: nestedCreateBusy,
    })
  }, [createIntents, enabled, launchLocationCreate, launchOrganizationCreate, nestedCreateBusy])

  const organizationCreateOpen = phase === 'creating' && activeIntent?.target === 'organization'
  const locationCreateOpen = phase === 'creating' && activeIntent?.target === 'location'

  const modals = (
    <>
      <OrganizationCreateModal
        open={organizationCreateOpen}
        onOpenChange={handleCreateModalOpenChange}
        campaignId={campaignId}
        onCreated={handleCreated}
      />
      {activeIntent?.target === 'location' ? (
        <LocationCreateModal
          open={locationCreateOpen}
          onOpenChange={handleCreateModalOpenChange}
          campaignId={campaignId}
          intent={{ authoringType: activeIntent.authoringType }}
          onCreated={handleCreated}
        />
      ) : null}
    </>
  )

  return {
    phase,
    nestedCreateBusy,
    auxiliaryAction,
    modals,
    resetNestedCreate,
  }
}
