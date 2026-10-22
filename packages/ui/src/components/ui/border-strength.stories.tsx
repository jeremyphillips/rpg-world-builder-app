import type { Meta, StoryObj } from '@storybook/react-vite'

import { ClassReferenceTable } from '../../stories/semantic-classes/class-reference-table'
import { BORDER_STRENGTH_CLASS_SPECS } from './border-strength'

const meta = {
  title: 'Primitives/BorderStrength',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const ClassReference: Story = {
  tags: ['control-parity'],
  render: () => (
    <ClassReferenceTable
      rows={BORDER_STRENGTH_CLASS_SPECS.map((spec) => ({
        key: spec.key,
        sample: (
          <div
            data-semantic-class-target
            className={`${spec.className} rounded-md p-3`}
            style={{ borderWidth: 1, borderStyle: 'solid' }}
          >
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
