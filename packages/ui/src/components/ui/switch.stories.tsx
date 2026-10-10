import type { Meta, StoryObj } from '@storybook/react-vite'

import { ClassReferenceTable } from '../../stories/semantic-classes/class-reference-table'
import { CHOICE_CONTROL_KIND_SPECS, UI_CHOICE_CONTROL_BLOCK_CLASS } from './choice-control.styles'
import { switchControlClasses, switchThumbClasses } from './choice-control.variants'
import { Switch } from './switch.client'

const meta = {
  title: 'Forms/Controls/Switch',
  component: Switch,
  parameters: {
    semanticClasses: true,
    docs: {
      description: {
        component: `${UI_CHOICE_CONTROL_BLOCK_CLASS} with \`ui-choice-control--switch\` and \`ui-choice-control__thumb\` own track and thumb presentation in choice-control.css.`,
      },
    },
  },
  args: { 'aria-label': 'Enable notifications' },
} satisfies Meta<typeof Switch>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const On: Story = { args: { defaultChecked: true } }

export const Disabled: Story = { args: { disabled: true, defaultChecked: true } }

export const ClassReference: Story = {
  tags: ['control-parity'],
  parameters: { semanticClasses: true },
  render: () => {
    const spec = CHOICE_CONTROL_KIND_SPECS.find((entry) => entry.kind === 'switch')!
    return (
      <ClassReferenceTable
        rows={[
          {
            key: spec.kind,
            sample: <Switch aria-label="Reference" data-semantic-class-target defaultChecked />,
            propsLabel: 'Switch',
            className: `${switchControlClasses()} ${switchThumbClasses()}`,
            keyValues: `track: ${spec.controlSize}`,
            useCase: spec.useCase,
          },
        ]}
      />
    )
  },
}
