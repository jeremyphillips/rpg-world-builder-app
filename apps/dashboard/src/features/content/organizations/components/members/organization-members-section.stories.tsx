import type { Meta, StoryObj } from '@storybook/react-vite'

import { ORGANIZATION_EMPTY_SECTION_TEXT } from '../../lib/organization-display'
import { ORGANIZATION_MEMBERS_LOAD_ERROR } from '../../lib/members/organization-members.constants'
import { ORGANIZATION_MEMBER_ROWS } from './organization-members-section.fixtures'
import { OrganizationMembersSection } from './organization-members-section'

const meta = {
  title: 'Content/Organizations/OrganizationMembersSection',
  component: OrganizationMembersSection,
  parameters: { layout: 'padded' },
  args: {
    rows: ORGANIZATION_MEMBER_ROWS,
    emptyText: ORGANIZATION_EMPTY_SECTION_TEXT.members,
  },
} satisfies Meta<typeof OrganizationMembersSection>

export default meta
type Story = StoryObj<typeof OrganizationMembersSection>

export const Manager: Story = {
  args: { canManage: true },
}

export const ReadOnly: Story = {
  args: { canManage: false },
}

export const ManagerEmpty: Story = {
  args: { rows: [], canManage: true },
}

export const ReadOnlyEmpty: Story = {
  args: { rows: [], canManage: false },
}

export const Loading: Story = {
  args: { rows: [], isPending: true },
}

export const Error: Story = {
  args: { rows: [], isError: true, errorText: ORGANIZATION_MEMBERS_LOAD_ERROR },
}

export const MutationError: Story = {
  args: { canManage: true, mutationError: 'Could not update members for this organization.' },
}
