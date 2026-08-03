import type { Meta, StoryObj } from '@storybook/react-vite'

import { TextSuggestionsField } from './text-suggestions-field.client'

const meta = {
  title: 'Components/TextSuggestionsField',
  component: TextSuggestionsField,
  args: {
    id: 'specialization',
    label: 'Specialization',
    suggestions: ['coaching inn', 'roadside inn', 'ferry house'],
    placeholder: 'Optional',
  },
} satisfies Meta<typeof TextSuggestionsField>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {
  args: {
    value: '',
    onValueChange: () => {},
  },
}

export const WithValue: Story = {
  args: {
    value: 'Sea temple',
    suggestions: ['sea temple', 'funerary temple', 'cathedral'],
    onValueChange: () => {},
  },
}

export const WithHint: Story = {
  args: {
    value: '',
    hint: 'Optional refinement for this archetype.',
    onValueChange: () => {},
  },
}
