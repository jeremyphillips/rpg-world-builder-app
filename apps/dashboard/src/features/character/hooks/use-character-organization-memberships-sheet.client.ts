'use client'

import * as React from 'react'
import { getErrorMessage } from '@rpg/contracts'
import type { Organization, OrganizationReferenceResolution } from '@rpg/contracts'

import { useOrganizations } from '@/features/content'

import type { EditOrganizationMembershipOrganization } from '../components/connections/edit-organization-membership-drawer.types'
import type { OrganizationPickerItem } from '../components/connections/organization-picker-drawer.types'
import { useCharacterOrganizationMembershipMutations } from './use-character-organization-membership-mutations'
import { useCharacterOrganizationReferences } from './use-character-organization-references'
import type { CharacterOrganizationMembershipSubjectKind } from '../lib/invalidate-character-organization-membership-queries'
import { UNAVAILABLE_ORGANIZATION_LABEL } from '../lib/display/character-display'

function toPickerItems(
  organizations: readonly Organization[],
  memberships: readonly OrganizationReferenceResolution[],
): OrganizationPickerItem[] {
  const selectedIds = new Set(memberships.map((membership) => membership.organizationId))
  return organizations
    .filter((organization) => organization.status === 'published')
    .map((organization) => ({
      organization,
      selected: selectedIds.has(organization.id),
    }))
}

function toEditableOrganization(
  membership: OrganizationReferenceResolution | null,
): EditOrganizationMembershipOrganization | null {
  const organization = membership?.organization
  if (!organization || typeof organization.organizationKind !== 'string') return null
  return {
    id: organization.id,
    name: organization.name,
    organizationKind: organization.organizationKind,
    ...(organization.organizationSubtype !== undefined
      ? { organizationSubtype: organization.organizationSubtype }
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
  subjectKind: CharacterOrganizationMembershipSubjectKind
}) {
  const { campaignId, characterId, characterName, canEdit, subjectKind } = input
  const referencesQuery = useCharacterOrganizationReferences(campaignId, characterId)
  const organizationsQuery = useOrganizations(canEdit ? campaignId : undefined)
  const mutations = useCharacterOrganizationMembershipMutations(
    campaignId,
    characterId,
    subjectKind,
  )

  const memberships = React.useMemo(() => referencesQuery.data ?? [], [referencesQuery.data])
  const [pickerOpen, setPickerOpen] = React.useState(false)
  const [editingMembership, setEditingMembership] =
    React.useState<OrganizationReferenceResolution | null>(null)
  const [unresolvedToRemove, setUnresolvedToRemove] =
    React.useState<OrganizationReferenceResolution | null>(null)

  const pickerItems = React.useMemo(
    () => toPickerItems(organizationsQuery.data ?? [], memberships),
    [memberships, organizationsQuery.data],
  )
  const editingOrganization = toEditableOrganization(editingMembership)

  const handleAdd = React.useCallback(
    async (membership: { organizationId: string; title?: string }) => {
      try {
        await mutations.addMembership(membership)
      } catch (error) {
        rethrowCanonicalized(error, 'Could not add this organization membership.')
      }
    },
    [mutations],
  )

  const handleSave = React.useCallback(
    async (title?: string) => {
      if (!editingMembership) return
      try {
        await mutations.updateMembership(editingMembership.organizationId, {
          title: title ?? null,
        })
      } catch (error) {
        rethrowCanonicalized(error, 'Could not update this organization membership.')
      }
    },
    [editingMembership, mutations],
  )

  const handleRemove = React.useCallback(async () => {
    if (!editingMembership) return
    try {
      await mutations.removeMembership(editingMembership.organizationId)
    } catch (error) {
      rethrowCanonicalized(error, 'Could not remove this organization membership.')
    }
  }, [editingMembership, mutations])

  const handleRemoveUnresolved = React.useCallback(async () => {
    if (!unresolvedToRemove) return
    try {
      await mutations.removeMembership(unresolvedToRemove.organizationId)
      setUnresolvedToRemove(null)
    } catch {
      // Keep confirm open for retry; ConfirmDialog has no inline error slot.
    }
  }, [mutations, unresolvedToRemove])

  const unresolvedRemoveHeadline = unresolvedToRemove
    ? `Remove ${characterName} from ${unresolvedToRemove.organization?.name ?? UNAVAILABLE_ORGANIZATION_LABEL}?`
    : ''

  return {
    isBootstrapping: referencesQuery.isPending && referencesQuery.data === undefined,
    memberships,
    pickerOpen,
    setPickerOpen,
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
