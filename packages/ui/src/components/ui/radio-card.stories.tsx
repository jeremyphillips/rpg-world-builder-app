import type { Meta, StoryObj } from '@storybook/react-vite'

import { RadioCard } from './radio-card.client'

const options = [
  {
    label: 'Modern 5e',
    value: '5e',
    badge: 'Recommended',
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
  {
    label: 'Classic Basic',
    value: 'becmi',
    description:
      'Fast old-school play with descending armor class, class tables, simple saves, and lightweight character options.',
    meta: ['Descending AC', 'Class tables', 'Simple saves'],
  },
]

const meta = {
  title: 'Forms/Controls/RadioCard',
  component: RadioCard,
  args: {
    'aria-label': 'Edition preset',
    options,
  },
} satisfies Meta<typeof RadioCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithSelection: Story = { args: { defaultValue: '5e' } }

export const Disabled: Story = { args: { disabled: true, defaultValue: '5e' } }

export const SingleOption: Story = {
  args: {
    options: [
      {
        label: 'Modern 5e',
        value: '5e',
        badge: 'Recommended',
        description:
          'A familiar modern fantasy rules framework with ascending armor class, proficiency-based advancement, ability checks, saving throws, and standardized d20 combat.',
        meta: ['Ascending AC', 'Proficiency bonus', 'Ability checks', 'Saving throws'],
      },
    ],
  },
}

const gridOptions = [
  {
    label: 'Modern 5e',
    value: '5e',
    badge: 'Recommended',
    description: 'Familiar modern fantasy with proficiency-based advancement and d20 combat.',
    meta: ['Ascending AC', 'Proficiency bonus'],
  },
  {
    label: 'Modern 3e',
    value: '3e',
    description: 'Detailed d20 framework with skills, feats, and granular customization.',
    meta: ['Fort/Ref/Will', 'Skills & feats'],
  },
  {
    label: 'Pathfinder 2e',
    value: 'pf2e',
    description: 'Tactical three-action combat with degrees of success and modular feats.',
    meta: ['Three actions', 'Degrees of success'],
  },
  {
    label: 'Classic Basic',
    value: 'becmi',
    description: 'Fast old-school play with descending armor class and simple saves.',
    meta: ['Descending AC', 'Class tables'],
  },
]

export const RadioOnRightTwoColumnGrid: Story = {
  args: {
    controlPosition: 'right',
    className: 'grid-cols-1 sm:grid-cols-2',
    options: gridOptions,
    defaultValue: '5e',
  },
}
