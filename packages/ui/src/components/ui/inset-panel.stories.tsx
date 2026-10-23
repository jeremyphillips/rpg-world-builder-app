import type { Meta, StoryObj } from '@storybook/react-vite'
import { Table2 } from 'lucide-react'

import { ClassReferenceTable } from '../../stories/semantic-classes/class-reference-table'
import {
  emptyStateWellSupportingClasses,
  emptyStateWellTitleClasses,
} from './empty-state-well.variants'
import { InsetPanel } from './inset-panel.client'
import { INSET_PANEL_CLASS_SPECS } from './inset-panel.variants'

const meta = {
  title: 'Primitives/InsetPanel',
  component: InsetPanel,
  parameters: { layout: 'padded', semanticClasses: true },
  args: {
    children: (
      <InsetPanel.Text>
        Placeholder copy scales with the panel size via <code>InsetPanel.Text</code>.
      </InsetPanel.Text>
    ),
  },
} satisfies Meta<typeof InsetPanel>

export default meta
type Story = StoryObj<typeof meta>

export const SolidMuted: Story = {
  args: {
    surface: { emphasis: 'default' },
    borderStyle: 'solid',
    size: 'sm',
  },
}

export const SolidSunkenDefault: Story = {
  args: {
    borderStyle: 'solid',
    size: 'sm',
  },
}

/** Instructional gate — roman supporting copy via `InsetPanel.Text`. */
export const InstructionalGate: Story = {
  name: 'Instructional gate',
  args: {
    ...insetPanelGateStoryProps(),
    children: <InsetPanel.Text>Save this class first to add subclasses.</InsetPanel.Text>,
  },
}

/** Passive single-message empty — canonical italic passive role. */
export const PassiveMessageEmpty: Story = {
  name: 'Passive message empty',
  args: {
    ...insetPanelEmptyStoryProps(),
    children: (
      <InsetPanel.PassiveMessage>No organizations connected yet.</InsetPanel.PassiveMessage>
    ),
  },
}

/** Structured empty — title + supporting (roman); wording alone does not pick typography. */
export const StructuredTitleSupporting: Story = {
  name: 'Structured title + supporting',
  args: {
    ...insetPanelGateStoryProps(),
    children: (
      <div className="flex flex-col items-center gap-2">
        <Table2 className="size-8 shrink-0 text-muted-foreground opacity-50" aria-hidden />
        <p className={emptyStateWellTitleClasses}>No heritage group yet</p>
        <p className={emptyStateWellSupportingClasses}>
          Create a set of heritage choices players can select during character creation.
        </p>
      </div>
    ),
  },
}

export const ScorePool: Story = {
  args: {
    borderStyle: 'dashed',
    surface: { emphasis: 'subtle' },
    size: 'md',
    children: (
      <>
        <div className="flex min-h-16 flex-wrap items-center gap-3" />
        <InsetPanel.Text as="p" variant="supporting" aria-live="polite">
          3 scores remaining
        </InsetPanel.Text>
      </>
    ),
  },
}

function insetPanelGateStoryProps() {
  return {
    borderStyle: 'dashed' as const,
    surface: { elevation: 'sunken' } as const,
    size: 'lg' as const,
    align: 'center' as const,
  }
}

function insetPanelEmptyStoryProps() {
  return {
    borderStyle: 'dashed' as const,
    size: 'md' as const,
    align: 'center' as const,
  }
}

export const OnFieldContainer: Story = {
  args: {
    ...insetPanelEmptyStoryProps(),
    children: (
      <InsetPanel.PassiveMessage>No organizations connected yet.</InsetPanel.PassiveMessage>
    ),
  },
  decorators: [
    (Story) => (
      <div className="rounded-lg border border-border-subtle bg-field-container p-4 [--surface-current:var(--field-container)]">
        <Story />
      </div>
    ),
  ],
}

/** @deprecated Story alias — use InstructionalGate */
export const DashedGate = InstructionalGate

/** @deprecated Story alias — use PassiveMessageEmpty */
export const DashedEmpty = PassiveMessageEmpty

export const ClassReference: Story = {
  tags: ['control-parity'],
  parameters: { semanticClasses: true },
  render: () => (
    <ClassReferenceTable
      rows={INSET_PANEL_CLASS_SPECS.map((spec) => ({
        key: spec.key,
        sample: (
          <div data-semantic-class-target className={spec.className}>
            {spec.useCase}
          </div>
        ),
        propsLabel: spec.key,
        className: spec.className,
        keyValues: spec.keyValues,
        useCase: spec.useCase,
      }))}
    />
  ),
}
