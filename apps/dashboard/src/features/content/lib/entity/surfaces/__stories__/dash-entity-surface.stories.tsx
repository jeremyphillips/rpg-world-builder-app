import type { Meta, StoryObj } from '@storybook/react-vite'

import { ClassReferenceTable } from '@rpg/ui/storybook/class-reference-table'

import { DASH_ENTITY_SURFACE_CLASS_SPECS } from '../dash-entity-surface.styles'

const meta = {
  title: 'Content/Entity/DashEntitySurface',
  parameters: { layout: 'padded', semanticClasses: true },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const ClassReference: Story = {
  tags: ['control-parity'],
  parameters: { semanticClasses: true },
  render: () => (
    <ClassReferenceTable
      rows={DASH_ENTITY_SURFACE_CLASS_SPECS.map((spec) => ({
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
