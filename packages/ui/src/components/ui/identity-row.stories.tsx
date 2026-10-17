import type { Meta, StoryObj } from '@storybook/react-vite'

import { ClassReferenceTable } from '../../stories/semantic-classes/class-reference-table'
import { IdentityRow, IdentityRowHeadingLine } from './identity-row.client'
import { InteractiveListRow } from './interactive-list-row.client'
import { IDENTITY_ROW_CLASS_SPECS } from './identity-row.styles'

const meta = {
  title: 'UI/IdentityRow',
  component: IdentityRow,
  tags: ['autodocs'],
  parameters: { semanticClasses: true },
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

export const EntityCompactHeadingLine: Story = {
  render: () => (
    <div className="w-72 border border-border p-2">
      <IdentityRowHeadingLine
        heading="Longsword"
        classification="Weapon"
        headingEnd="15 gp"
        recipe="entity-compact"
      />
    </div>
  ),
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

export const ClassReference: Story = {
  tags: ['control-parity'],
  parameters: { semanticClasses: true },
  render: () => (
    <ClassReferenceTable
      rows={IDENTITY_ROW_CLASS_SPECS.map((spec) => ({
        key: spec.key,
        sample: (
          <span data-semantic-class-target className={spec.className}>
            Sample
          </span>
        ),
        propsLabel: spec.key,
        className: spec.className,
        keyValues: spec.keyValues,
        useCase: spec.useCase,
      }))}
    />
  ),
}
