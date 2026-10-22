import type { Meta, StoryObj } from '@storybook/react-vite'

import { ClassReferenceTable } from '../../stories/semantic-classes/class-reference-table'
import { EmptyPanel } from './empty-panel.client'
import { EMPTY_PANEL_CLASS_SPECS } from './empty-panel.variants'

const meta = {
  title: 'UI/EmptyPanel',
  component: EmptyPanel,
  parameters: { layout: 'padded', semanticClasses: true },
} satisfies Meta<typeof EmptyPanel>

export default meta
type Story = StoryObj<typeof meta>

export const PassiveMessage: Story = {
  name: 'Passive message',
  args: {
    children: 'No tables added.',
  },
}

export const OnFieldContainer: Story = {
  args: {
    children: 'No grants added.',
  },
  decorators: [
    (Story) => (
      <div className="rounded-lg border border-border-subtle bg-field-container p-4 [--surface-current:var(--field-container)]">
        <Story />
      </div>
    ),
  ],
}

/** @deprecated Story alias — use PassiveMessage */
export const Default = PassiveMessage

export const ClassReference: Story = {
  tags: ['control-parity'],
  parameters: { semanticClasses: true },
  render: () => (
    <ClassReferenceTable
      rows={EMPTY_PANEL_CLASS_SPECS.map((spec) => ({
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
