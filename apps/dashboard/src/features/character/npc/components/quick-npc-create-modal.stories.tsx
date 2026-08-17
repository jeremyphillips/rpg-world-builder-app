import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'

import { withDashboardProviders } from '../../../../../.storybook/decorators'
import {
  createCampaignNpcBuilderContextFixture,
  populatedBuilderCatalog,
} from '../../lib/character-builder-fixtures'
import { QuickNpcCreateModal } from './quick-npc-create-modal.client'

const organization = {
  id: 'organization-lantern-guild',
  name: 'Lantern Guild',
  organizationDomain: 'occupational' as const,
}

const buildContext = createCampaignNpcBuilderContextFixture({
  catalog: {
    ...populatedBuilderCatalog,
    organizations: [
      {
        id: organization.id,
        slug: 'lantern-guild',
        rulesetId: 'srd-cc-5.2.1',
        source: 'homebrew',
        status: 'published',
        campaignId: 'campaign-test-1',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        name: organization.name,
        organizationDomain: organization.organizationDomain,
        functions: [],
        practices: [],
        memberClassAffinityIds: [],
        memberSpeciesAffinityIds: [],
        membershipTitles: [],
        connections: { locations: [] },
      },
    ],
  },
})

const meta = {
  title: 'Dashboard/Character/QuickNpcCreateModal',
  component: QuickNpcCreateModal,
  decorators: [withDashboardProviders],
  args: {
    open: true,
    onOpenChange: () => undefined,
    campaignId: 'campaign-test-1',
    buildContext,
    organization,
    onCancel: () => undefined,
    onCreated: () => undefined,
  },
} satisfies Meta<typeof QuickNpcCreateModal>

export default meta
type Story = StoryObj<typeof meta>

export const Setup: Story = {}

export const Authoring: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body)
    const dwarf = canvas.queryByRole('radio', { name: /dwarf/i })
    if (dwarf) await userEvent.click(dwarf)
    const fighter = canvas.queryByRole('radio', { name: /fighter/i })
    if (fighter && fighter.getAttribute('aria-checked') !== 'true') {
      await userEvent.click(fighter)
    }
    await userEvent.click(canvas.getByRole('button', { name: 'Continue' }))
    await expect(canvas.getByText('Create a new NPC as a member of Lantern Guild.')).toBeVisible()
  },
}
