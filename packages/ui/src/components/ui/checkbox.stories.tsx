import type { Meta, StoryObj } from '@storybook/react-vite'

import { ClassReferenceTable } from '../../stories/semantic-classes/class-reference-table'
import { Checkbox } from './checkbox.client'
import { CHOICE_CONTROL_KIND_SPECS, UI_CHOICE_CONTROL_BLOCK_CLASS } from './choice-control.styles'
import { checkboxControlClasses } from './choice-control.variants'

const meta = {
  title: 'Forms/Controls/Checkbox',
  component: Checkbox,
  parameters: {
    semanticClasses: true,
    docs: {
      description: {
        component: `${UI_CHOICE_CONTROL_BLOCK_CLASS} with \`ui-choice-control--checkbox\` owns indicator geometry and checked fill in choice-control.css.`,
      },
    },
  },
  args: { 'aria-label': 'Accept terms' },
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Checked: Story = { args: { defaultChecked: true } }

export const Error: Story = { args: { 'aria-invalid': true } }

export const Disabled: Story = { args: { disabled: true, defaultChecked: true } }

export const ClassReference: Story = {
  tags: ['control-parity'],
  parameters: { semanticClasses: true },
  render: () => {
    const spec = CHOICE_CONTROL_KIND_SPECS.find((entry) => entry.kind === 'checkbox')!
    return (
      <ClassReferenceTable
        rows={[
          {
            key: spec.kind,
            sample: <Checkbox aria-label="Reference" data-semantic-class-target defaultChecked />,
            propsLabel: 'Checkbox',
            className: checkboxControlClasses(),
            keyValues: `control size: ${spec.controlSize}`,
            useCase: spec.useCase,
          },
        ]}
      />
    )
  },
}
