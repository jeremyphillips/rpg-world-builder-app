'use client'

import * as React from 'react'
import { useQueryClient } from '@tanstack/react-query'

import type {
  CharacterBuildCatalogIndex,
  CharacterBuildContext,
  Location,
  LocationConnectedPartyRow,
  Organization,
} from '@rpg/contracts'

import type { ContentCreateContext, CreatedContentResult } from '@/lib/create-flow'
import { STANDALONE_CONTENT_CREATE_CONTEXT } from '@/lib/create-flow'

import type { LocationAuthoringType } from '../../locations/lib/location-authoring-type'
import type { LocationConnectedPartyCharacterOption } from '../../locations/lib/location-connected-party-character-options.lib'
import { applyRelationshipPickerNestedCreateHandoff } from './apply-relationship-picker-nested-create-handoff.lib'
import { mapRelationshipPickerCreateIntentsToAuxiliaryAction } from './map-relationship-picker-create-intents-to-auxiliary-action.lib'
import type { RelationshipPickerCreateIntent } from './relationship-picker-create-intents.lib'
import { RelationshipPickerNestedCreateModals } from './relationship-picker-nested-create-modals.client'
import {
  resolveRelationshipPickerNestedCreateHandoff,
  type OrganizationForwardNestedCreateRevalidationContext,
} from './relationship-picker-nested-create.lib'

export type RelationshipPickerNestedCreatePhase = 'idle' | 'creating' | 'resolvingCreatedTarget'

type ActiveNestedCreateIntent =
  | { target: 'organization' }
  | { target: 'location'; authoringType: LocationAuthoringType }
  | { target: 'character' }

export type UseRelationshipPickerNestedCreateInput = {
  campaignId: string
  enabled?: boolean
  createIntents: readonly RelationshipPickerCreateIntent[]
  /** Semantic create context snapshotted when nested create launches. */
  nestedCreateContext?: ContentCreateContext
  subjectOrganizationId?: string
  locationId?: string
  npcBuildContext?: CharacterBuildContext | null
  npcCatalogIndex?: CharacterBuildCatalogIndex | null
  onSelectCreatedOrganization?: (organizationId: string) => void
  onSelectCreatedLocation?: (locationId: string) => void
  onSelectCreatedNpc?: (characterId: string) => void
  revalidateCreatedOrganization?: (
    organization: Organization,
    orgRows: readonly LocationConnectedPartyRow[],
  ) => boolean
  revalidateCreatedLocation?: (
    location: Location,
    context: OrganizationForwardNestedCreateRevalidationContext,
  ) => boolean
  revalidateCreatedNpc?: (character: LocationConnectedPartyCharacterOption) => boolean
}

export function useRelationshipPickerNestedCreate({
  campaignId,
  enabled = true,
  createIntents,
  nestedCreateContext,
  subjectOrganizationId,
  locationId,
  npcBuildContext,
  npcCatalogIndex,
  onSelectCreatedOrganization,
  onSelectCreatedLocation,
  onSelectCreatedNpc,
  revalidateCreatedOrganization,
  revalidateCreatedLocation,
  revalidateCreatedNpc,
}: UseRelationshipPickerNestedCreateInput) {
  const queryClient = useQueryClient()
  const [phase, setPhase] = React.useState<RelationshipPickerNestedCreatePhase>('idle')
  const [activeIntent, setActiveIntent] = React.useState<ActiveNestedCreateIntent | null>(null)
  const [activeCreateContext, setActiveCreateContext] = React.useState<ContentCreateContext>(
    STANDALONE_CONTENT_CREATE_CONTEXT,
  )

  const nestedCreateBusy = phase === 'creating' || phase === 'resolvingCreatedTarget'

  const snapshotCreateContext = React.useCallback(() => {
    return nestedCreateContext ?? STANDALONE_CONTENT_CREATE_CONTEXT
  }, [nestedCreateContext])

  const resetNestedCreate = React.useCallback(() => {
    setPhase('idle')
    setActiveIntent(null)
    setActiveCreateContext(STANDALONE_CONTENT_CREATE_CONTEXT)
  }, [])

  const launchOrganizationCreate = React.useCallback(() => {
    if (nestedCreateBusy) return
    setActiveCreateContext(snapshotCreateContext())
    setActiveIntent({ target: 'organization' })
    setPhase('creating')
  }, [nestedCreateBusy, snapshotCreateContext])

  const launchLocationCreate = React.useCallback(
    (authoringType: LocationAuthoringType) => {
      if (nestedCreateBusy) return
      setActiveCreateContext(snapshotCreateContext())
      setActiveIntent({ target: 'location', authoringType })
      setPhase('creating')
    },
    [nestedCreateBusy, snapshotCreateContext],
  )

  const launchNpcCreate = React.useCallback(() => {
    if (nestedCreateBusy) return
    setActiveCreateContext(snapshotCreateContext())
    setActiveIntent({ target: 'character' })
    setPhase('creating')
  }, [nestedCreateBusy, snapshotCreateContext])

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
          catalogIndex: npcCatalogIndex,
          revalidateCreatedOrganization,
          revalidateCreatedLocation,
          revalidateCreatedNpc,
        })

        applyRelationshipPickerNestedCreateHandoff(handoff, {
          onSelectCreatedOrganization,
          onSelectCreatedLocation,
          onSelectCreatedNpc,
        })
      } finally {
        setPhase('idle')
      }
    },
    [
      campaignId,
      locationId,
      npcCatalogIndex,
      onSelectCreatedLocation,
      onSelectCreatedNpc,
      onSelectCreatedOrganization,
      queryClient,
      revalidateCreatedLocation,
      revalidateCreatedNpc,
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
      onCharacter: launchNpcCreate,
      disabled: nestedCreateBusy,
    })
  }, [
    createIntents,
    enabled,
    launchLocationCreate,
    launchNpcCreate,
    launchOrganizationCreate,
    nestedCreateBusy,
  ])

  const modals = (
    <RelationshipPickerNestedCreateModals
      campaignId={campaignId}
      activeIntent={activeIntent}
      createContext={activeCreateContext}
      organizationCreateOpen={phase === 'creating' && activeIntent?.target === 'organization'}
      locationCreateOpen={phase === 'creating' && activeIntent?.target === 'location'}
      npcCreateOpen={phase === 'creating' && activeIntent?.target === 'character'}
      npcBuildContext={npcBuildContext}
      onCreateModalOpenChange={handleCreateModalOpenChange}
      onCreated={handleCreated}
      onNpcCancel={resetNestedCreate}
    />
  )

  return {
    phase,
    nestedCreateBusy,
    auxiliaryAction,
    modals,
    resetNestedCreate,
  }
}
