import { action } from 'storybook/actions'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { ComboboxField } from './combobox-field.client'

const meta = {
  title: 'UI/ComboboxField',
  component: ComboboxField,
  parameters: { layout: 'padded' },
  args: {
    id: 'combobox-demo',
    onChange: action('onChange'),
    onBlur: action('onBlur'),
  },
} satisfies Meta<typeof ComboboxField>

export default meta
type Story = StoryObj<typeof meta>

const weaponOptions = [
  { value: 'dagger', label: 'Dagger' },
  { value: 'dart', label: 'Dart' },
  { value: 'light-crossbow', label: 'Light Crossbow' },
  { value: 'quarterstaff', label: 'Quarterstaff' },
  { value: 'sling', label: 'Sling' },
  { value: 'longsword', label: 'Longsword' },
  { value: 'shortbow', label: 'Shortbow' },
  { value: 'rapier', label: 'Rapier' },
  { value: 'scimitar', label: 'Scimitar' },
  { value: 'hand-crossbow', label: 'Hand Crossbow' },
]

const spellOptions = [
  { value: 'fire-bolt', label: 'Fire Bolt', description: 'Cantrip' },
  { value: 'mage-hand', label: 'Mage Hand', description: 'Cantrip' },
  { value: 'shield', label: 'Shield', description: 'Level 1' },
  { value: 'magic-missile', label: 'Magic Missile', description: 'Level 1' },
  { value: 'custom-ray', label: 'Ray of Custom', description: 'Homebrew' },
]

const toolOptions = [
  { value: 'thieves-tools', label: "Thieves' Tools" },
  { value: 'smiths-tools', label: "Smith's Tools" },
  { value: 'lute', label: 'Lute' },
]

/** Multi-select with removable chips — typical catalog picker. */
export const MultiSelect: Story = {
  args: {
    label: 'Specific weapons',
    options: weaponOptions,
    multiple: true,
    value: ['dagger', 'longsword'],
    placeholder: 'Choose weapons…',
  },
}

/** Single-select closes the panel after choosing one value. */
export const SingleSelect: Story = {
  args: {
    label: 'Primary weapon',
    options: weaponOptions,
    multiple: false,
    value: 'rapier',
    placeholder: 'Choose a weapon…',
  },
}

export const WithDescriptions: Story = {
  args: {
    label: 'Spells',
    options: spellOptions,
    multiple: true,
    value: ['fire-bolt', 'custom-ray'],
    placeholder: 'Choose spells…',
  },
}

export const StaleSelection: Story = {
  args: {
    label: 'Tools',
    options: toolOptions,
    multiple: true,
    value: ['thieves-tools', 'removed-homebrew-tool'],
    placeholder: 'Choose tools…',
  },
}

export const Loading: Story = {
  args: {
    label: 'Spells',
    options: spellOptions,
    multiple: true,
    value: [],
    loading: true,
  },
}

export const WithError: Story = {
  args: {
    label: 'Spells',
    options: spellOptions,
    multiple: true,
    value: [],
    error: 'Select at least one spell.',
    required: true,
  },
}

export const WithHint: Story = {
  args: {
    label: 'Tools',
    options: toolOptions,
    multiple: true,
    value: [],
    hint: 'Pick proficiencies granted by this class.',
  },
}

export const Disabled: Story = {
  args: {
    label: 'Tools',
    options: toolOptions,
    multiple: true,
    value: ['lute'],
    disabled: true,
  },
}
