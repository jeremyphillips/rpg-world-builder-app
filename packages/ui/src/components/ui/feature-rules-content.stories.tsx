import type { Meta, StoryObj } from '@storybook/react-vite'

import { FeatureRulesContent } from './feature-rules-content'

const meta = {
  title: 'Primitives/FeatureRulesContent',
  component: FeatureRulesContent,
} satisfies Meta<typeof FeatureRulesContent>

export default meta

type Story = StoryObj<typeof meta>

export const IntroAndRules: Story = {
  args: {
    introHtml: '<p>As a student of arcane magic, you have learned to cast spells.</p>',
    rulesDocument: [
      [
        { kind: 'lead', treatment: 'paragraph', label: 'Cantrips' },
        { kind: 'text', value: 'You know three Wizard cantrips of your choice.' },
      ],
    ],
  },
}

export const RulesOnly: Story = {
  args: {
    rulesDocument: [
      [
        { kind: 'lead', treatment: 'paragraph', label: 'Spell Slots' },
        { kind: 'text', value: 'The Wizard table shows how many spell slots you have.' },
      ],
    ],
  },
}
