import type { Meta, StoryObj } from '@storybook/react-vite'

import { FieldGroup } from './field-group'
import { TextField } from './text-field'
import { SelectField } from './select-field'

const meta = {
  title: 'Forms/Layout/FieldGroup',
  component: FieldGroup,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof FieldGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    legend: 'Character basics',
    children: (
      <>
        <TextField id="char-name" label="Name" placeholder="Tasha" />
        <SelectField
          id="char-class"
          label="Class"
          placeholder="Choose a class"
          options={[
            { label: 'Wizard', value: 'wizard' },
            { label: 'Rogue', value: 'rogue' },
          ]}
        />
      </>
    ),
  },
}

export const WithDescription: Story = {
  args: {
    legend: 'Character basics',
    description: 'These show on your character sheet header.',
    children: <TextField id="char-name-2" label="Name" placeholder="Tasha" />,
  },
}

/** Nested subgroup — smaller legend for groups inside another group (weapon Damage, etc.). */
export const NestedSubgroup: Story = {
  render: () => (
    <FieldGroup legend="Weapon">
      <TextField id="weapon-name" label="Name" placeholder="Longsword" />
      <FieldGroup legend="Damage" legendSize="subsection">
        <TextField id="damage-dice" label="Dice" placeholder="1d8" />
      </FieldGroup>
    </FieldGroup>
  ),
}
