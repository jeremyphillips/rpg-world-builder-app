import * as React from 'react'
import {
  getErrorMessage,
  isContentPlayableFor,
  resolveOrganizationMembershipMetadata,
} from '@rpg/contracts'
import type { Organization } from '@rpg/contracts'

import { useOrganizations } from '@/features/content'

import {
  formatRemoveMembershipHeadline,
  type EditOrganizationMembershipOrganization,
} from '../components/connections/edit-organization-membership-drawer.types'
import type { OrganizationPickerItem } from '../components/connections/picker/organization-picker-drawer.types'
import { useCharacterRelationshipMutations } from './use-character-relationship-mutations'
import { useCharacterRelationships } from './use-character-relationships'
import type { CharacterRelationshipSubjectKind } from '../lib/invalidate-character-relationship-queries'
import { UNAVAILABLE_ORGANIZATION_LABEL } from '../lib/display/character-display'
import { resolveRelationshipPlayActor } from '../lib/relationship/character-relationship-play-actor.lib'
import {
  organizationMembershipProjectionToSheetRow,
  type OrganizationMembershipSheetRow,
} from '../lib/relationship/character-relationship-form-rows.lib'

function toPickerItems(
  organizations: readonly Organization[],
  memberships: readonly OrganizationMembershipSheetRow[],
  playActor: ReturnType<typeof resolveRelationshipPlayActor>,
): OrganizationPickerItem[] {
  const selectedIds = new Set(memberships.map((membership) => membership.organizationId))
  return organizations
    .filter((organization) => isContentPlayableFor(organization, playActor))
    .map((organization) => ({
      organization,
      selected: selectedIds.has(organization.id),
    }))
}

function toEditableOrganization(
  membership: OrganizationMembershipSheetRow | null,
): EditOrganizationMembershipOrganization | null {
  const organization = membership?.organization
  if (!organization || typeof organization.organizationDomain !== 'string') return null
  return {
    id: organization.id,
    name: organization.name,
    organizationDomain: organization.organizationDomain,
    members: { titles: organization.members?.titles ?? [] },
    ...(organization.organizationForm !== undefined
      ? { organizationForm: organization.organizationForm }
      : {}),
  }
}

function rethrowCanonicalized(error: unknown, fallback: string): never {
  throw new Error(getErrorMessage(error, fallback))
}

export function useCharacterOrganizationMembershipsSheet(input: {
  campaignId: string
  characterId: string
  characterName: string
  canEdit: boolean
  subjectKind: CharacterRelationshipSubjectKind
}) {
  const { campaignId, characterId, characterName, canEdit, subjectKind } = input
  const relationshipsQuery = useCharacterRelationships(campaignId, characterId, {
    kinds: ['organizationMembership'],
    limit: 50,
  })
  const organizationsQuery = useOrganizations(canEdit ? campaignId : undefined)
  const mutations = useCharacterRelationshipMutations(campaignId, {
    characters: [{ characterId, subjectKind }],
  })

  const memberships = React.useMemo(
    () => (relationshipsQuery.data?.items ?? []).map(organizationMembershipProjectionToSheetRow),
    [relationshipsQuery.data?.items],
  )
  const [editingMembership, setEditingMembership] =
    React.useState<OrganizationMembershipSheetRow | null>(null)
  const [unresolvedToRemove, setUnresolvedToRemove] =
    React.useState<OrganizationMembershipSheetRow | null>(null)

  const pickerItems = React.useMemo(
    () =>
      toPickerItems(
        organizationsQuery.data ?? [],
        memberships,
        resolveRelationshipPlayActor(subjectKind, characterId),
      ),
    [characterId, memberships, organizationsQuery.data, subjectKind],
  )
  const editingOrganization = React.useMemo(
    () => toEditableOrganization(editingMembership),
    [editingMembership],
  )

  const handleAdd = React.useCallback(
    async (organizationId: string, idempotencyKey: string) => {
      try {
        const { relationship } = await mutations.createRelationship({
          idempotencyKey,
          relationship: {
            kind: 'organizationMembership',
            characterId,
            organizationId,
          },
        })
        return { relationshipId: relationship.id }
      } catch (error) {
        rethrowCanonicalized(error, 'Could not add this organization membership.')
      }
    },
    [characterId, mutations],
  )

  const handleSave = React.useCallback(
    async (title?: string) => {
      if (!editingMembership || !editingOrganization) return
      const metadata = resolveOrganizationMembershipMetadata({
        titles: editingOrganization.members?.titles ?? [],
        selectedTitle: title,
        currentMembership: editingMembership,
      })
      try {
        await mutations.updateRelationship(editingMembership.relationshipId, {
          expectedRevision: editingMembership.revision,
          details: {
            title: metadata.title ?? null,
            priority: metadata.priority ?? null,
          },
        })
      } catch (error) {
        rethrowCanonicalized(error, 'Could not update this organization membership.')
      }
    },
    [editingMembership, editingOrganization, mutations],
  )

  const handleRemove = React.useCallback(async () => {
    if (!editingMembership) return
    try {
      await mutations.deleteRelationship(editingMembership.relationshipId, {
        expectedRevision: editingMembership.revision,
      })
    } catch (error) {
      rethrowCanonicalized(error, 'Could not remove this organization membership.')
    }
  }, [editingMembership, mutations])

  const handleRemoveUnresolved = React.useCallback(async () => {
    if (!unresolvedToRemove) return
    try {
      await mutations.deleteRelationship(unresolvedToRemove.relationshipId, {
        expectedRevision: unresolvedToRemove.revision,
      })
      setUnresolvedToRemove(null)
    } catch {
      // Keep confirm open for retry; ConfirmDialog has no inline error slot.
    }
  }, [mutations, unresolvedToRemove])

  const unresolvedRemoveHeadline = unresolvedToRemove
    ? formatRemoveMembershipHeadline(
        characterName,
        unresolvedToRemove.organization?.name ?? UNAVAILABLE_ORGANIZATION_LABEL,
      )
    : ''

  return {
    isBootstrapping: relationshipsQuery.isPending && relationshipsQuery.data === undefined,
    memberships,
    membershipProjections: relationshipsQuery.data?.items ?? [],
    pickerItems,
    editingMembership,
    setEditingMembership,
    editingOrganization,
    unresolvedToRemove,
    setUnresolvedToRemove,
    unresolvedRemoveHeadline,
    handleAdd,
    handleSave,
    handleRemove,
    handleRemoveUnresolved,
  }
}
