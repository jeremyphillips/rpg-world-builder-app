import { action } from 'storybook/actions'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { ChooseFromChipsField } from './choose-from-chips-field.client'

const skillOptions = [
  { value: 'athletics', label: 'Athletics' },
  { value: 'stealth', label: 'Stealth' },
  { value: 'perception', label: 'Perception' },
  { value: 'insight', label: 'Insight' },
  { value: 'investigation', label: 'Investigation' },
]

const meta = {
  title: 'UI/ChooseFromChipsField',
  component: ChooseFromChipsField,
  parameters: { layout: 'padded' },
  args: {
    id: 'skill-profs',
    label: 'Skill proficiencies',
    options: skillOptions,
    chooseValue: 2,
    chipsValue: ['athletics', 'stealth'],
    onChooseChange: action('onChooseChange'),
    onChipsChange: action('onChipsChange'),
  },
} satisfies Meta<typeof ChooseFromChipsField>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithInfo: Story = {
  args: {
    info: 'Skill options are shared with each skill’s suggested classes. Changes here update those skill records.',
  },
}

export const WithError: Story = {
  args: {
    chipsValue: [],
    error: 'Select at least one skill option.',
    required: true,
  },
}
