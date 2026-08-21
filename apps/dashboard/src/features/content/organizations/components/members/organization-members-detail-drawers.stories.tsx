import type { Meta, StoryObj } from '@storybook/react-vite'

import type { useOrganizationMembersDetail } from '../../hooks/use-organization-members-detail'
import { ORGANIZATION_EMPTY_SECTION_TEXT } from '../../lib/organization-display'
import { ORGANIZATION_MEMBER_PICKER_CANDIDATES } from './organization-member-picker-drawer.fixtures'
import { OrganizationMembersDetailDrawers } from './organization-members-detail-drawers'

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
  members: { classAffinityIds: [], speciesAffinityIds: [], titles: [] },
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
    },
    openAddDrawer: () => undefined,
    openCreateNpcModal: () => undefined,
    cancelCreateNpcModal: () => undefined,
    handleQuickNpcContentCreated: async () => undefined,
    openEditDrawer: () => undefined,
    openRemoveConfirm: () => undefined,
    closeDrawer: () => undefined,
    handleAddMember: async () => undefined,
    handleSaveMembership: async () => undefined,
    handleRemoveFromEditDrawer: async () => undefined,
    handleConfirmRemoveMember: async () => undefined,
    memberSelectionPolicy: undefined,
    candidatesPending: false,
    ...overrides,
  }
}

const meta = {
  title: 'Content/Organizations/OrganizationMembersDetailDrawers',
  component: OrganizationMembersDetailDrawers,
  parameters: { layout: 'fullscreen' },
  args: {
    organization,
    detail: createDetail(),
  },
} satisfies Meta<typeof OrganizationMembersDetailDrawers>

export default meta
type Story = StoryObj<typeof meta>

/** G6 canonical: add-member picker overlay from the workflow hook. */
export const AddMember: Story = {}

/** G6 canonical: sibling Quick NPC create while the add drawer stays mounted. */
export const CreateNpcModal: Story = {
  args: {
    detail: createDetail({ drawerState: { mode: 'createNpc' } }),
  },
}

/** G6 canonical: edit membership drawer for an existing roster row. */
export const EditMembership: Story = {
  args: {
    detail: createDetail({
      drawerState: {
        mode: 'edit',
        row: {
          characterId: 'char-1',
          name: 'Verna',
          characterType: 'pc',
          identityLine: 'PC · Dwarf · Level 1 Fighter',
          detailHref: '/campaigns/campaign-test-1/characters/char-1',
          title: 'Journeyman',
        },
      },
      editingRow: {
        characterId: 'char-1',
        name: 'Verna',
        characterType: 'pc',
        identityLine: 'PC',
        detailHref: '/campaigns/campaign-test-1/characters/char-1',
        title: 'Journeyman',
      },
    }),
  },
}

/** G6 canonical: remove confirm above the workflow stack. */
export const RemoveConfirm: Story = {
  args: {
    detail: createDetail({
      drawerState: {
        mode: 'remove',
        row: {
          characterId: 'char-1',
          name: 'Verna',
          characterType: 'pc',
          identityLine: 'PC',
          detailHref: '/campaigns/campaign-test-1/characters/char-1',
        },
      },
      removingRow: {
        characterId: 'char-1',
        name: 'Verna',
        characterType: 'pc',
        identityLine: 'PC',
        detailHref: '/campaigns/campaign-test-1/characters/char-1',
      },
    }),
  },
}
