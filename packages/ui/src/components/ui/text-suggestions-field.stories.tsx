import type { Meta, StoryObj } from '@storybook/react-vite'

import { TextSuggestionsField } from './text-suggestions-field.client'

const meta = {
  title: 'Components/TextSuggestionsField',
  component: TextSuggestionsField,
  args: {
    id: 'specialization',
    label: 'Specialization',
    suggestions: ['coaching inn', 'roadside inn', 'ferry house'],
    placeholder: 'Enter specialization…',
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

export const WithSuggestions: Story = {
  args: {
    value: '',
    hint: 'Add a specialization when you want to describe a more specific kind of building.',
    onValueChange: () => {},
  },
}

export const OneSuggestion: Story = {
  args: {
    value: '',
    suggestions: ['planar embassy'],
    onValueChange: () => {},
  },
}

export const ManySuggestions: Story = {
  args: {
    value: '',
    suggestions: [
      'bakery',
      'butcher',
      'chandler',
      'cobbler',
      'general store',
      'jeweler',
      'magic shop',
      'pawnshop',
      'tailor',
    ],
    onValueChange: () => {},
  },
}

export const NoSuggestionsFreeEntry: Story = {
  args: {
    value: '',
    suggestions: [],
    hint: 'Add a specialization when you want to describe a more specific kind of building.',
    onValueChange: () => {},
  },
}

export const WithValue: Story = {
  args: {
    value: 'sea temple',
    suggestions: ['sea temple', 'funerary temple', 'cathedral'],
    onValueChange: () => {},
  },
}

export const WithHint: Story = {
  args: {
    value: '',
    hint: 'Add a specialization when you want to describe a more specific kind of building.',
    onValueChange: () => {},
  },
}
