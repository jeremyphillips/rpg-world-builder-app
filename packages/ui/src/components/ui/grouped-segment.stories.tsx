import type { Meta, StoryObj } from '@storybook/react-vite'

import { GroupedDivider, GroupedStaticSegment } from './grouped-segment.client'

/**
 * Primitives for grouped field anatomy — dividers and static segments between
 * interactive occupants. Sizing tokens: [packages/ui/docs/forms.md](../../../docs/forms.md).
 */
const meta = {
  title: 'UI/GroupedSegment',
  component: GroupedDivider,
  parameters: {
    docs: {
      description: {
        component:
          'Non-interactive grouped segments and dividers shared by JoinedPair, InputSelect, and DiceFormula clusters.',
      },
    },
  },
} satisfies Meta<typeof GroupedDivider>

export default meta

type Story = StoryObj<typeof meta>

function MockSegment({ children }: { children: string }) {
  return (
    <span className="flex h-9 items-center rounded-l-md border border-input bg-input px-3 text-sm">
      {children}
    </span>
  )
}

function MockEndSegment({ children }: { children: string }) {
  return (
    <span className="flex h-9 items-center rounded-r-md border border-input bg-surface-faint px-3 text-sm">
      {children}
    </span>
  )
}

export const PrimaryDivider: Story = {
  render: () => (
    <div className="inline-flex items-center rounded-md border border-input">
      <MockSegment>30</MockSegment>
      <GroupedDivider strength="primary" />
      <MockEndSegment>ft.</MockEndSegment>
    </div>
  ),
}

export const SubtleDivider: Story = {
  render: () => (
    <div className="inline-flex items-center rounded-md border border-input">
      <MockSegment>+</MockSegment>
      <GroupedDivider strength="subtle" />
      <MockEndSegment>1</MockEndSegment>
    </div>
  ),
}

export const DiceGlueSegment: Story = {
  render: () => (
    <div className="inline-flex items-center rounded-md border border-input">
      <MockSegment>2</MockSegment>
      <GroupedDivider strength="primary" />
      <GroupedStaticSegment size="md" position="middle" surfaceRole="glue" mono>
        d
      </GroupedStaticSegment>
      <GroupedDivider strength="subtle" />
      <MockEndSegment>6</MockEndSegment>
    </div>
  ),
}

export const CompactOperatorInset: Story = {
  render: () => (
    <div className="inline-flex items-center rounded-md border border-input">
      <GroupedStaticSegment size="md" position="start" surfaceRole="value" inset="compact" mono>
        ×
      </GroupedStaticSegment>
      <GroupedDivider strength="primary" />
      <MockEndSegment>250</MockEndSegment>
    </div>
  ),
}
