import * as React from 'react'

import { getErrorMessage, type CharacterRelationshipProjectionRow } from '@rpg/contracts'

import { resolveQueryErrorLabel } from '@/lib/query/query-state.lib'

import { useCampaignCharacters } from '@/features/campaign'
import { useOrganizations, useLocations } from '@/features/content'

import { createCharacterRelationshipIdempotencyKey } from '../api/character-relationship-client'
import type { CharacterRelationshipSubjectKind } from '../lib/invalidate-character-relationship-queries'
import {
  buildOrganizationMembershipCreateInput,
  buildPersonRelationshipCreateInput,
  buildPlaceRelationshipCreateInput,
  buildPropertyRelationshipCreateInput,
} from '../lib/relationship/connection-create-input.lib'
import type {
  PersonConnectionRoleOption,
  PlaceConnectionRoleOption,
  PropertyConnectionRoleOption,
} from '../lib/relationship/connection-role-catalog'
import { buildConnectionSheetData } from '../lib/relationship/connection-sheet-data.lib'
import {
  replaceConnectionRow,
  resolveConnectionRoleChange,
  updateConnectionRowDetails,
  type ConnectionSheetSaveInput,
} from '../lib/relationship/connection-sheet-save.lib'
import { useNpcs } from '../npc/hooks/use-npcs'
import { useCharacterRelationshipMutations } from './use-character-relationship-mutations'
import { useCharacterRelationships } from './use-character-relationships'

function rethrowCanonicalized(error: unknown, fallback: string): never {
  throw new Error(getErrorMessage(error, fallback))
}

export function useCharacterConnectionsSheet(input: {
  campaignId: string
  characterId: string
  canEdit: boolean
  subjectKind: CharacterRelationshipSubjectKind
}) {
  const { campaignId, characterId, canEdit, subjectKind } = input
  const relationshipsQuery = useCharacterRelationships(campaignId, characterId, {
    limit: 100,
    kinds: undefined,
  })
  const organizationsQuery = useOrganizations(campaignId)
  const locationsQuery = useLocations(campaignId)
  const charactersQuery = useCampaignCharacters(campaignId)
  const npcsQuery = useNpcs(campaignId)
  const mutations = useCharacterRelationshipMutations(campaignId, {
    characters: [{ characterId, subjectKind }],
  })

  const sheetData = React.useMemo(
    () =>
      buildConnectionSheetData({
        campaignId,
        characterId,
        subjectKind,
        canEdit,
        organizations: organizationsQuery.data ?? [],
        locations: locationsQuery.data,
        locationsPending: locationsQuery.isPending,
        locationsError: locationsQuery.error,
        locationsHasData: locationsQuery.data !== undefined,
        campaignCharacters: charactersQuery.data ?? [],
        campaignNpcs: npcsQuery.data ?? [],
      }),
    [
      campaignId,
      canEdit,
      characterId,
      charactersQuery.data,
      locationsQuery.data,
      locationsQuery.error,
      locationsQuery.isPending,
      npcsQuery.data,
      organizationsQuery.data,
      subjectKind,
    ],
  )

  const projections = React.useMemo(
    () => relationshipsQuery.data?.items ?? [],
    [relationshipsQuery.data?.items],
  )

  const [editingRow, setEditingRow] = React.useState<CharacterRelationshipProjectionRow | null>(
    null,
  )

  const handleAddPerson = React.useCallback(
    async (relatedCharacterId: string, role: PersonConnectionRoleOption) => {
      try {
        await mutations.createRelationship({
          idempotencyKey: createCharacterRelationshipIdempotencyKey(),
          relationship: buildPersonRelationshipCreateInput(characterId, relatedCharacterId, role),
        })
      } catch (error) {
        rethrowCanonicalized(error, 'Could not add this person connection.')
      }
    },
    [characterId, mutations],
  )

  const handleAddOrganization = React.useCallback(
    async (organizationId: string, title?: string, priority?: number) => {
      try {
        await mutations.createRelationship({
          idempotencyKey: createCharacterRelationshipIdempotencyKey(),
          relationship: buildOrganizationMembershipCreateInput(characterId, organizationId, {
            ...(title !== undefined ? { title } : {}),
            ...(priority !== undefined ? { priority } : {}),
          }),
        })
      } catch (error) {
        rethrowCanonicalized(error, 'Could not add this organization membership.')
      }
    },
    [characterId, mutations],
  )

  const handleAddPlace = React.useCallback(
    async (
      locationId: string,
      role: PlaceConnectionRoleOption,
      details?: Record<string, unknown>,
    ) => {
      try {
        await mutations.createRelationship({
          idempotencyKey: createCharacterRelationshipIdempotencyKey(),
          relationship: buildPlaceRelationshipCreateInput(characterId, locationId, role, details),
        })
      } catch (error) {
        rethrowCanonicalized(error, 'Could not add this place connection.')
      }
    },
    [characterId, mutations],
  )

  const handleAddProperty = React.useCallback(
    async (
      locationId: string,
      role: PropertyConnectionRoleOption,
      details?: Record<string, unknown>,
    ) => {
      try {
        await mutations.createRelationship({
          idempotencyKey: createCharacterRelationshipIdempotencyKey(),
          relationship: buildPropertyRelationshipCreateInput(
            characterId,
            locationId,
            role,
            details,
          ),
        })
      } catch (error) {
        rethrowCanonicalized(error, 'Could not add this property connection.')
      }
    },
    [characterId, mutations],
  )

  const handleSaveRow = React.useCallback(
    async (row: CharacterRelationshipProjectionRow, input: ConnectionSheetSaveInput) => {
      const roleChange = resolveConnectionRoleChange(row, input)

      try {
        if (roleChange.kindChanged) {
          await replaceConnectionRow({
            row,
            focalCharacterId: characterId,
            sectionId: roleChange.sectionId,
            nextPersonRole: roleChange.nextPersonRole,
            nextPlaceRole: roleChange.nextPlaceRole,
            nextPropertyRole: roleChange.nextPropertyRole,
            details: input.details,
            visibility: input.visibility,
            participantIds: input.participantIds,
            mutations,
          })
          return
        }

        await updateConnectionRowDetails({
          row,
          details: input.details,
          visibility: input.visibility,
          participantIds: input.participantIds,
          mutations,
        })
      } catch (error) {
        rethrowCanonicalized(error, 'Could not update this connection.')
      }
    },
    [characterId, mutations],
  )

  const handleRemoveRow = React.useCallback(
    async (row: CharacterRelationshipProjectionRow) => {
      try {
        await mutations.deleteRelationship(row.relationshipId, {
          expectedRevision: row.revision,
        })
      } catch (error) {
        rethrowCanonicalized(error, 'Could not remove this connection.')
      }
    },
    [mutations],
  )

  const isBootstrapping =
    (relationshipsQuery.isPending && relationshipsQuery.data === undefined) ||
    (organizationsQuery.isPending && organizationsQuery.data === undefined)

  const relationshipsErrorLabel = resolveQueryErrorLabel(
    [relationshipsQuery],
    'Could not load character relationships.',
  )

  return {
    isBootstrapping,
    isRelationshipsError: relationshipsQuery.isError,
    relationshipsErrorLabel,
    projections,
    sheetData,
    editingRow,
    setEditingRow,
    handleAddPerson,
    handleAddOrganization,
    handleAddPlace,
    handleAddProperty,
    handleSaveRow,
    handleRemoveRow,
    isMutating: mutations.isPending,
  }
}
