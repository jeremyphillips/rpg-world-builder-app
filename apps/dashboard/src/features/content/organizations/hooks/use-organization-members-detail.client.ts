'use client'

import * as React from 'react'

import type { CampaignNpcDetail, Organization } from '@rpg/contracts'
import { getErrorMessage, resolveOrganizationMembershipMetadata } from '@rpg/contracts'
import { useQueryClient } from '@tanstack/react-query'

import { useCampaignCharacters, useCanManageCampaign } from '@/features/campaign'
import {
  createCharacterOrganizationMembership,
  deleteCharacterOrganizationMembership,
  invalidateCharacterOrganizationMembershipQueries,
  updateCharacterOrganizationMembership,
  useCampaignNpcBuildContext,
  useNpcs,
  type CharacterOrganizationMembershipSubjectKind,
} from '@/features/character'

import { buildLocationConnectedPartyCharactersById } from '../../locations/lib/location-connected-party-character-options.lib'
import type { OrganizationMemberPickerCandidate } from '../components/organization-member-picker-drawer.client'
import type { OrganizationMemberPickerCommit } from '../components/organization-member-picker-drawer.client'
import {
  buildOrganizationMemberRows,
  type OrganizationMemberRowVm,
} from '../lib/build-organization-member-rows'
import { ORGANIZATION_EMPTY_SECTION_TEXT } from '../lib/organization-display'
import {
  ORGANIZATION_MEMBER_ADD_FAILED,
  ORGANIZATION_MEMBERS_MUTATION_ERROR,
} from '../lib/organization-members.constants'
import { useOrganizationMembers } from './use-organization-members'

const UPDATE_MEMBERSHIP_FAILED = 'Could not update this membership.'
const REMOVE_MEMBER_FAILED = 'Could not remove this member.'

export type OrganizationMembersDrawerState =
  | { mode: 'add' }
  | { mode: 'createNpc' }
  | { mode: 'edit'; row: OrganizationMemberRowVm }
  | { mode: 'remove'; row: OrganizationMemberRowVm }

function subjectKindFor(
  row: Pick<OrganizationMemberRowVm, 'characterType'>,
): CharacterOrganizationMembershipSubjectKind {
  return row.characterType === 'npc' ? 'npc' : 'pc'
}

export function useOrganizationMembersDetail(
  campaignId: string,
  organization: Pick<
    Organization,
    'id' | 'name' | 'organizationDomain' | 'organizationForm' | 'functions' | 'practices'
  >,
) {
  const organizationId = organization.id
  const canManage = useCanManageCampaign(campaignId)
  const queryClient = useQueryClient()
  const membersQuery = useOrganizationMembers(campaignId, organizationId)
  const campaignCharactersQuery = useCampaignCharacters(canManage ? campaignId : undefined)
  const npcsQuery = useNpcs(canManage ? campaignId : undefined)
  const {
    catalogIndex,
    context: npcBuildContext,
    isError: npcBuildContextIsError,
    unavailable: npcBuildContextUnavailable,
  } = useCampaignNpcBuildContext(canManage ? campaignId : undefined)

  const [drawerState, setDrawerState] = React.useState<OrganizationMembersDrawerState | null>(null)
  const [mutationError, setMutationError] = React.useState<string | null>(null)
  const [pendingCharacterId, setPendingCharacterId] = React.useState<string>()

  const members = React.useMemo(
    () =>
      membersQuery.data
        ? buildOrganizationMemberRows(membersQuery.data, { campaignId })
        : { rows: [], total: 0 },
    [campaignId, membersQuery.data],
  )

  const membersByCharacterId = React.useMemo(
    () => new Map(members.rows.map((row) => [row.characterId, row])),
    [members.rows],
  )

  const candidates = React.useMemo<OrganizationMemberPickerCandidate[]>(() => {
    if (!canManage) return []
    const characters = buildLocationConnectedPartyCharactersById(
      campaignCharactersQuery.data ?? [],
      npcsQuery.data ?? [],
      catalogIndex,
    )
    return [...characters.values()].map((character) => {
      const member = membersByCharacterId.get(character.id)

      return {
        ...character,
        isMember: member !== undefined,
        ...(member?.title !== undefined ? { membershipTitle: member.title } : {}),
      }
    })
  }, [campaignCharactersQuery.data, canManage, catalogIndex, membersByCharacterId, npcsQuery.data])

  const invalidate = React.useCallback(
    async (input: {
      characterId: string
      subjectKind: CharacterOrganizationMembershipSubjectKind
    }) =>
      invalidateCharacterOrganizationMembershipQueries(queryClient, {
        campaignId,
        characterId: input.characterId,
        subjectKind: input.subjectKind,
        organizationIds: [organizationId],
      }),
    [campaignId, organizationId, queryClient],
  )

  const handleAddMember = React.useCallback(
    async (commit: OrganizationMemberPickerCommit) => {
      setMutationError(null)
      try {
        await createCharacterOrganizationMembership(campaignId, commit.characterId, {
          organizationId,
          ...(commit.title !== undefined ? { title: commit.title } : {}),
          ...(commit.priority !== undefined ? { priority: commit.priority } : {}),
        })
        await invalidate({
          characterId: commit.characterId,
          subjectKind: subjectKindFor(commit),
        })
      } catch (error) {
        throw new Error(getErrorMessage(error, ORGANIZATION_MEMBER_ADD_FAILED), { cause: error })
      }
    },
    [campaignId, invalidate, organizationId],
  )

  /** Quick NPC creation already wrote the membership atomically — refresh reads only. */
  const handleQuickNpcCreated = React.useCallback(
    async (npc: CampaignNpcDetail) => {
      await invalidate({ characterId: npc.character.id, subjectKind: 'npc' })
    },
    [invalidate],
  )

  /** Quick NPC creation context for the Add member drawer — buildContext is null until it resolves. */
  const quickNpc = React.useMemo(
    () => ({
      campaignId,
      buildContext: npcBuildContext,
      buildContextFailed:
        npcBuildContextIsError ||
        (npcBuildContextUnavailable !== null && npcBuildContextUnavailable.kind !== 'loading'),
      onCreated: handleQuickNpcCreated,
    }),
    [
      campaignId,
      handleQuickNpcCreated,
      npcBuildContext,
      npcBuildContextIsError,
      npcBuildContextUnavailable,
    ],
  )

  const editingRow = drawerState?.mode === 'edit' ? drawerState.row : null

  const handleSaveMembership = React.useCallback(
    async (title?: string) => {
      if (!editingRow) return
      const metadata = resolveOrganizationMembershipMetadata({
        domain: organization.organizationDomain,
        form: organization.organizationForm,
        functions: organization.functions,
        practices: organization.practices,
        selectedTitle: title,
        currentMembership: {
          ...(editingRow.title !== undefined ? { title: editingRow.title } : {}),
          ...(editingRow.priority !== undefined ? { priority: editingRow.priority } : {}),
        },
      })

      setMutationError(null)
      try {
        await updateCharacterOrganizationMembership(
          campaignId,
          editingRow.characterId,
          organizationId,
          { title: metadata.title ?? null, priority: metadata.priority ?? null },
        )
        await invalidate({
          characterId: editingRow.characterId,
          subjectKind: subjectKindFor(editingRow),
        })
      } catch (error) {
        throw new Error(getErrorMessage(error, UPDATE_MEMBERSHIP_FAILED), { cause: error })
      }
    },
    [
      campaignId,
      editingRow,
      invalidate,
      organization.functions,
      organization.practices,
      organization.organizationDomain,
      organization.organizationForm,
      organizationId,
    ],
  )

  const removeMember = React.useCallback(
    async (row: OrganizationMemberRowVm) => {
      setPendingCharacterId(row.characterId)
      try {
        await deleteCharacterOrganizationMembership(campaignId, row.characterId, organizationId)
        await invalidate({ characterId: row.characterId, subjectKind: subjectKindFor(row) })
      } finally {
        setPendingCharacterId(undefined)
      }
    },
    [campaignId, invalidate, organizationId],
  )

  /** Edit-drawer remove — rethrows so the drawer can render the failure inline. */
  const handleRemoveFromEditDrawer = React.useCallback(async () => {
    if (!editingRow) return
    setMutationError(null)
    try {
      await removeMember(editingRow)
    } catch (error) {
      throw new Error(getErrorMessage(error, REMOVE_MEMBER_FAILED), { cause: error })
    }
  }, [editingRow, removeMember])

  /** Row-overflow remove — the ConfirmDialog has no inline error slot, so surface it on the panel. */
  const handleConfirmRemoveMember = React.useCallback(async () => {
    if (drawerState?.mode !== 'remove') return
    const row = drawerState.row
    setMutationError(null)
    try {
      await removeMember(row)
      setDrawerState(null)
    } catch (error) {
      setMutationError(getErrorMessage(error, ORGANIZATION_MEMBERS_MUTATION_ERROR))
      setDrawerState(null)
    }
  }, [drawerState, removeMember])

  const openAddDrawer = React.useCallback(() => setDrawerState({ mode: 'add' }), [])
  const openCreateNpcModal = React.useCallback(() => setDrawerState({ mode: 'createNpc' }), [])
  const cancelCreateNpcModal = React.useCallback(() => setDrawerState({ mode: 'add' }), [])
  const handleQuickNpcSuccess = React.useCallback(
    async (npc: CampaignNpcDetail) => {
      await handleQuickNpcCreated(npc)
      setDrawerState(null)
    },
    [handleQuickNpcCreated],
  )
  const openEditDrawer = React.useCallback(
    (row: OrganizationMemberRowVm) => setDrawerState({ mode: 'edit', row }),
    [],
  )
  const openRemoveConfirm = React.useCallback(
    (row: OrganizationMemberRowVm) => setDrawerState({ mode: 'remove', row }),
    [],
  )
  const closeDrawer = React.useCallback(() => setDrawerState(null), [])

  return {
    canManage,
    members,
    emptyText: ORGANIZATION_EMPTY_SECTION_TEXT.members,
    membersQuery,
    candidates,
    drawerState,
    editingRow,
    removingRow: drawerState?.mode === 'remove' ? drawerState.row : null,
    mutationError,
    pendingCharacterId,
    quickNpc,
    openAddDrawer,
    openCreateNpcModal,
    cancelCreateNpcModal,
    handleQuickNpcSuccess,
    openEditDrawer,
    openRemoveConfirm,
    closeDrawer,
    handleAddMember,
    handleSaveMembership,
    handleRemoveFromEditDrawer,
    handleConfirmRemoveMember,
  }
}
