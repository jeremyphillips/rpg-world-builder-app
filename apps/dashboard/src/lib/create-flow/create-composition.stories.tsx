import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button, Text } from '@rpg/ui'

import { CreateCompositionComposer } from './create-composition-composer'
import { CreateCompositionStage } from './create-composition-stage'
import { CreateCompositionSummary } from './create-composition-summary'

const meta = {
  title: 'Create Flow/Composition',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const SummaryRows: Story = {
  render: () => (
    <CreateCompositionSummary
      rows={[
        { id: 'relationship', label: 'Relationship', value: 'Owner', onChange: () => undefined },
        {
          id: 'organization',
          label: 'Organization',
          value: 'Harbor Merchants Guild',
          onChange: () => undefined,
        },
      ]}
    />
  ),
}

export const StageDiscovery: Story = {
  render: () => (
    <CreateCompositionStage
      heading="Choose organization"
      helper="Select an existing organization or create a new one."
    >
      <Text variant="muted">Discovery body slot</Text>
    </CreateCompositionStage>
  ),
}

export const StageBranch: Story = {
  render: () => (
    <CreateCompositionStage
      heading="New organization"
      helper="This organization will be created when you create the building."
      action={
        <Button type="button" variant="ghost" size="sm" density="compact">
          Choose existing
        </Button>
      }
    >
      <Text variant="muted">Create-new form slot</Text>
    </CreateCompositionStage>
  ),
}

export const ComposerStack: Story = {
  render: () => (
    <CreateCompositionComposer heading="Add organization relationship">
      <CreateCompositionSummary
        rows={[{ id: 'relationship', label: 'Relationship', value: 'Owner' }]}
      />
      <CreateCompositionStage
        heading="Choose organization"
        helper="Select an existing organization or create a new one."
      >
        <Text variant="muted">Discovery body slot</Text>
      </CreateCompositionStage>
    </CreateCompositionComposer>
  ),
}
