import type { Meta, StoryObj } from '@storybook/react-vite'
import { createEmptyCharacterBuilderDraft } from '@rpg/contracts'

import { createStandaloneBuilderContextFixture } from '../../../lib/fixtures/character-builder-fixtures'
import { cityCouncil, lanternGuild } from '../../connections/organization-picker-drawer.fixtures'
import { ConnectionsStep } from './connections-step.client'

const context = createStandaloneBuilderContextFixture({
  catalog: {
    ...createStandaloneBuilderContextFixture().catalog,
    organizations: [lanternGuild, cityCouncil],
  },
})

const meta = {
  title: 'Character Builder/ConnectionsStep',
  component: ConnectionsStep,
  parameters: { layout: 'padded' },
  args: {
    context,
    draft: createEmptyCharacterBuilderDraft(),
    validationIssues: [],
    onDraftChange: () => undefined,
  },
} satisfies Meta<typeof ConnectionsStep>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {}

export const Selected: Story = {
  args: {
    draft: {
      ...createEmptyCharacterBuilderDraft(),
      connections: { organizations: [{ organizationId: lanternGuild.id }], locations: [] },
    },
  },
}

export const StaleSelection: Story = {
  args: {
    draft: {
      ...createEmptyCharacterBuilderDraft(),
      connections: { organizations: [{ organizationId: 'organization-missing' }], locations: [] },
    },
  },
}
