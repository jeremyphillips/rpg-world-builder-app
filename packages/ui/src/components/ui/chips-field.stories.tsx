import { action } from 'storybook/actions'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { ChipsField } from './chips-field.client'

const meta = {
  title: 'UI/ChipsField',
  component: ChipsField,
  parameters: { layout: 'padded' },
  args: {
    id: 'chips-demo',
    onChange: action('onChange'),
    onBlur: action('onBlur'),
  },
} satisfies Meta<typeof ChipsField>

export default meta
type Story = StoryObj<typeof meta>

const playStyleOptions = [
  { value: 'dungeon_crawl', label: 'Dungeon Crawl' },
  { value: 'urban_adventure', label: 'Urban Adventure' },
  { value: 'political_intrigue', label: 'Political Intrigue' },
  { value: 'exploration', label: 'Exploration' },
  { value: 'survival', label: 'Survival' },
  { value: 'mystery', label: 'Mystery' },
  { value: 'sandbox', label: 'Sandbox' },
  { value: 'tactical_combat', label: 'Tactical Combat' },
  { value: 'roleplay_driven', label: 'Roleplay-Driven' },
]

const difficultyOptions = [
  { value: 'casual', label: 'Casual' },
  { value: 'dangerous', label: 'Dangerous' },
  { value: 'brutal', label: 'Brutal' },
]

/** Multi-select: pick any number of play styles. */
export const MultiSelect: Story = {
  args: {
    label: 'Play Style',
    options: playStyleOptions,
    multiple: true,
    value: ['dungeon_crawl', 'exploration'],
  },
}

/** Single-select: only one difficulty can be active at a time. */
export const SingleSelect: Story = {
  args: {
    label: 'Difficulty',
    options: difficultyOptions,
    multiple: false,
    value: 'dangerous',
  },
}

export const WithError: Story = {
  args: {
    label: 'Play Style',
    options: playStyleOptions,
    multiple: true,
    value: [],
    error: 'Select at least one play style.',
    required: true,
  },
}

export const WithHint: Story = {
  args: {
    label: 'Play Style',
    options: playStyleOptions,
    multiple: true,
    value: [],
    hint: 'Pick as many as apply — this helps players find your campaign.',
  },
}

export const Disabled: Story = {
  args: {
    label: 'Difficulty',
    options: difficultyOptions,
    multiple: false,
    value: 'casual',
    disabled: true,
  },
}

export const SizeMedium: Story = {
  args: {
    label: 'Play Style',
    options: playStyleOptions,
    multiple: true,
    value: ['exploration'],
    chipSize: 'md',
  },
}

export const SizeLarge: Story = {
  args: {
    label: 'Difficulty',
    options: difficultyOptions,
    multiple: false,
    value: 'dangerous',
    chipSize: 'lg',
  },
}
