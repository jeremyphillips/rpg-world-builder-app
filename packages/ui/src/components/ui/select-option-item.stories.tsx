import type { Meta, StoryObj } from '@storybook/react-vite'

import { SelectOptionItem } from './select-option-item.client'
import { Select, SelectContent, SelectTrigger, SelectValue } from './select.client'

const meta = {
  title: 'Forms/Controls/SelectOptionItem',
  component: SelectOptionItem,
  render: () => (
    <Select defaultOpen>
      <SelectTrigger aria-label="Movement mode" className="w-56">
        <SelectValue placeholder="Choose a mode…" />
      </SelectTrigger>
      <SelectContent>
        <SelectOptionItem option={{ label: 'Walk', value: 'walk' }} />
        <SelectOptionItem
          option={{
            label: 'Fly',
            value: 'fly',
            disabled: true,
            disabledReason: 'Already used',
          }}
        />
      </SelectContent>
    </Select>
  ),
} satisfies Meta<typeof SelectOptionItem>

export default meta
type Story = StoryObj<typeof meta>

/** Strong (`DC 15`) and quiet (`4 spells`) trailing on list rows and closed value. */
export const TrailingVariants: Story = {
  render: () => (
    <Select defaultValue="int" defaultOpen className="w-80 max-w-md">
      <SelectTrigger aria-label="Spellcasting ability">
        <SelectValue placeholder="Choose" />
      </SelectTrigger>
      <SelectContent>
        <SelectOptionItem
          option={{
            label: 'Spellcasting (Intelligence)',
            value: 'shared:spellcasting',
            trailing: { text: 'DC 15', variant: 'strong' },
          }}
        />
        <SelectOptionItem
          option={{
            label: 'Intelligence',
            value: 'int',
            trailing: { text: 'DC 15', variant: 'strong' },
          }}
        />
        <SelectOptionItem
          option={{
            label: 'Wisdom',
            value: 'wis',
            trailing: { text: 'DC 13', variant: 'strong' },
          }}
        />
        <SelectOptionItem
          option={{
            label: 'Spellcasting',
            value: 'spell',
            trailing: { text: '4 spells', variant: 'quiet' },
          }}
        />
      </SelectContent>
    </Select>
  ),
}

export const TrailingMetadata: Story = {
  render: () => (
    <Select defaultValue="int" defaultOpen className="w-72">
      <SelectTrigger aria-label="Spellcasting ability">
        <SelectValue placeholder="Choose">
          <span className="ui-select-option-row">
            <span className="ui-select-option-row__label ui-select-option-row__label--truncate">
              Spellcasting (Intelligence)
            </span>
            <span className="ui-select-option-trailing ui-select-option-trailing--strong">
              DC 15
            </span>
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectOptionItem
          option={{
            label: 'Spellcasting (Intelligence)',
            value: 'shared:spellcasting',
            trailing: { text: 'DC 15', variant: 'strong' },
          }}
        />
        <SelectOptionItem
          option={{
            label: 'Intelligence',
            value: 'int',
            trailing: { text: 'DC 15', variant: 'strong' },
          }}
        />
        <SelectOptionItem
          option={{
            label: 'Wisdom',
            value: 'wis',
            trailing: { text: 'DC 13', variant: 'strong' },
          }}
        />
      </SelectContent>
    </Select>
  ),
}

export const DisabledWithReason: Story = {
  args: {
    option: {
      label: 'Fly',
      value: 'fly',
      disabled: true,
      disabledReason: 'Already used',
    },
  },
}
