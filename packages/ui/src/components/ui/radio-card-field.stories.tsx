import type { Meta, StoryObj } from '@storybook/react-vite'

import { RadioCardField } from './radio-card-field'

const options = [
  {
    label: 'Classic Basic',
    value: 'becmi',
    description:
      'Fast old-school play with descending armor class, class tables, simple saves, and lightweight character options.',
    meta: ['Descending AC', 'Class tables', 'Simple saves'],
  },
  {
    label: 'Modern 5e',
    value: '5e',
    description:
      'A familiar modern fantasy rules framework with ascending armor class, proficiency-based advancement, ability checks, saving throws, and standardized d20 combat.',
    meta: ['Ascending AC', 'Proficiency bonus', 'Ability checks', 'Saving throws'],
  },
  {
    label: 'Modern 3e',
    value: '3e',
    description:
      'A detailed d20 framework with ascending armor class, attack bonuses, Fortitude/Reflex/Will saves, skill ranks, feats, and more granular character customization.',
    meta: ['Ascending AC', 'Attack bonuses', 'Fort/Ref/Will', 'Skills & feats'],
  },
]

const meta = {
  title: 'Forms/RadioCardField',
  component: RadioCardField,
  args: {
    id: 'edition-preset',
    label: 'Edition preset',
    options,
  },
} satisfies Meta<typeof RadioCardField>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithSelection: Story = { args: { defaultValue: '5e' } }

export const WithError: Story = { args: { error: 'Choose an edition preset.' } }

export const Disabled: Story = { args: { disabled: true, defaultValue: '5e' } }

export const WithHint: Story = {
  args: {
    hint: 'Pick the rules era that best matches your campaign. You can fine-tune individual mechanics below.',
  },
}
