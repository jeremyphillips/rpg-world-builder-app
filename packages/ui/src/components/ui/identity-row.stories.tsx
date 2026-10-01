import type { Meta, StoryObj } from '@storybook/react-vite'

import { IdentityRow } from './identity-row.client'
import { InteractiveListRow } from './interactive-list-row.client'

const meta = {
  title: 'UI/IdentityRow',
  component: IdentityRow,
  tags: ['autodocs'],
} satisfies Meta<typeof IdentityRow>

export default meta

type Story = StoryObj<typeof IdentityRow>

export const Default: Story = {
  args: {
    heading: 'Dock Ward',
    classification: 'District',
    supporting: 'Located in Harborford',
    size: 'md',
  },
}

export const LongHeadingVisibleClassification: Story = {
  render: () => (
    <div className="w-56 border border-border p-2">
      <IdentityRow
        heading="Very Long Location Name That Should Truncate Before Classification"
        classification="District"
        supporting="Secondary line"
        size="md"
      />
    </div>
  ),
}

export const LongClassification: Story = {
  render: () => (
    <div className="w-56 border border-border p-2">
      <IdentityRow
        heading="Harborford"
        classification="Very Long Classification Label That Stays shrink-0"
        size="md"
      />
    </div>
  ),
}

export const WrappedSupporting: Story = {
  args: {
    heading: 'Building',
    supporting:
      'A contained structure such as a tavern, temple, or guild hall within a parent location.',
    supportingWrap: true,
    size: 'md',
  },
}

export const HeadingOnly: Story = {
  args: {
    heading: 'Circle Envoy',
    size: 'md',
  },
}

export const Sizes: Story = {
  render: () => (
    <div className="flex max-w-md flex-col gap-4">
      <IdentityRow heading="Small (12px)" classification="sm" size="sm" supporting="Supporting" />
      <IdentityRow heading="Medium (14px)" classification="md" size="md" supporting="Supporting" />
      <IdentityRow heading="Large (16px)" classification="lg" size="lg" supporting="Supporting" />
    </div>
  ),
}

export const InInteractiveListRowWithSlots: Story = {
  render: () => (
    <div className="w-56 border border-border">
      <InteractiveListRow
        name="Very Long Spell Name That Eventually Truncates"
        classification="Spell"
        metadata="Level 3 · Evocation"
        startSlot={<span className="text-muted-foreground">◆</span>}
        endSlot={<span aria-hidden>✓</span>}
      />
    </div>
  ),
}
