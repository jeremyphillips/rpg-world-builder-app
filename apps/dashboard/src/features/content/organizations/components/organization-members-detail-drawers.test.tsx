import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { renderWithProviders } from '@/test/render'

import type { useOrganizationMembersDetail } from '../hooks/use-organization-members-detail.client'
import { ORGANIZATION_EMPTY_SECTION_TEXT } from '../lib/organization-display'
import { ORGANIZATION_MEMBER_PICKER_CANDIDATES } from './organization-member-picker-drawer.fixtures'
import { OrganizationMembersDetailDrawers } from './organization-members-detail-drawers.client'

vi.mock('@/features/character', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>()
  return {
    ...actual,
    QuickNpcCreateModal: ({ onCancel }: { onCancel: () => void }) => (
      <div>
        <h2>Create NPC</h2>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    ),
    EditOrganizationMembershipDrawer: () => null,
  }
})

const organization = {
  id: 'organization-lantern-guild',
  slug: 'lantern-guild',
  rulesetId: 'srd-cc-5.2.1' as const,
  source: 'homebrew' as const,
  status: 'published' as const,
  campaignId: 'campaign-test-1',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Lantern Guild',
  organizationDomain: 'occupational' as const,
  functions: [],
  practices: [],
  memberClassAffinityIds: [],
  memberSpeciesAffinityIds: [],
  membershipTitles: [],
  connections: { locations: [] },
}

const buildContext = { catalog: {}, acquisition: {} } as NonNullable<
  ReturnType<typeof useOrganizationMembersDetail>['quickNpc']['buildContext']
>

type OrganizationMembersDetail = ReturnType<typeof useOrganizationMembersDetail>

function createDetail(
  overrides: Partial<OrganizationMembersDetail> = {},
): OrganizationMembersDetail {
  return {
    canManage: true,
    members: { rows: [], total: 0 },
    emptyText: ORGANIZATION_EMPTY_SECTION_TEXT.members,
    membersQuery: {} as OrganizationMembersDetail['membersQuery'],
    candidates: ORGANIZATION_MEMBER_PICKER_CANDIDATES,
    drawerState: { mode: 'add' },
    editingRow: null,
    removingRow: null,
    mutationError: null,
    pendingCharacterId: undefined,
    quickNpc: {
      campaignId: 'campaign-test-1',
      buildContext,
      buildContextFailed: false,
      onCreated: vi.fn(),
    },
    openAddDrawer: vi.fn(),
    openCreateNpcModal: vi.fn(),
    cancelCreateNpcModal: vi.fn(),
    handleQuickNpcSuccess: vi.fn(),
    openEditDrawer: vi.fn(),
    openRemoveConfirm: vi.fn(),
    closeDrawer: vi.fn(),
    handleAddMember: vi.fn(),
    handleSaveMembership: vi.fn(),
    handleRemoveFromEditDrawer: vi.fn(),
    handleConfirmRemoveMember: vi.fn(),
    memberSelectionPolicy: undefined,
    candidatesPending: false,
    ...overrides,
  }
}

describe('OrganizationMembersDetailDrawers', () => {
  it('keeps the add drawer open while the Quick NPC modal is active', () => {
    renderWithProviders(
      <OrganizationMembersDetailDrawers
        organization={organization}
        detail={createDetail({ drawerState: { mode: 'createNpc' } })}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Add member' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Create NPC', hidden: true })).toBeInTheDocument()
  })

  it('wires Quick NPC cancel back to the org hook', () => {
    const cancelCreateNpcModal = vi.fn()
    renderWithProviders(
      <OrganizationMembersDetailDrawers
        organization={organization}
        detail={createDetail({
          drawerState: { mode: 'createNpc' },
          cancelCreateNpcModal,
        })}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Cancel', hidden: true }))
    expect(cancelCreateNpcModal).toHaveBeenCalledTimes(1)
  })

  it('does not render overlays when the viewer cannot manage members', () => {
    renderWithProviders(
      <OrganizationMembersDetailDrawers
        organization={organization}
        detail={createDetail({ canManage: false })}
      />,
    )

    expect(screen.queryByRole('heading', { name: 'Add member' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Create NPC' })).not.toBeInTheDocument()
  })

  it('lists candidates while recommendation policy is still unavailable', () => {
    renderWithProviders(
      <OrganizationMembersDetailDrawers
        organization={organization}
        detail={createDetail({
          memberSelectionPolicy: undefined,
          candidatesPending: false,
        })}
      />,
    )

    expect(screen.getByText('Verna')).toBeInTheDocument()
    expect(screen.queryByText('Recommended')).not.toBeInTheDocument()
  })

  it('keeps the remove confirm open when removal fails', async () => {
    const removingRow = {
      characterId: 'char-1',
      name: 'Verna',
      characterType: 'pc' as const,
      identityLine: 'PC',
      detailHref: '/campaigns/campaign-test-1/characters/char-1',
    }
    const handleConfirmRemoveMember = vi.fn().mockRejectedValue(new Error('Network error'))
    renderWithProviders(
      <OrganizationMembersDetailDrawers
        organization={organization}
        detail={createDetail({
          drawerState: {
            mode: 'remove',
            row: removingRow,
          },
          removingRow,
          handleConfirmRemoveMember,
        })}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Remove member' }))
    await vi.waitFor(() => {
      expect(handleConfirmRemoveMember).toHaveBeenCalledTimes(1)
    })
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
  })
})
