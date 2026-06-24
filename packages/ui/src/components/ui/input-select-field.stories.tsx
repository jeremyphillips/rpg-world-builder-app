'use client'

import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { CURRENCY_IDS } from '@rpg/contracts/primitives'
import { CASTING_TIME_UNIT_ENTRIES } from '@rpg/contracts/vocab'

import {
  InputSelectField,
  type InputSelectFieldProps,
  type InputSelectOption,
} from './input-select-field.client'

const currencyOptions: InputSelectOption[] = CURRENCY_IDS.map((id) => ({
  value: id,
  label: id,
}))

const castingTimeOptions: InputSelectOption[] = Object.entries(CASTING_TIME_UNIT_ENTRIES).map(
  ([value, entry]) => ({
    value,
    label: entry.label,
    description: entry.description,
  }),
)

const searchableUnitOptions: InputSelectOption[] = [
  ...currencyOptions,
  { value: 'ep', label: 'Electrum (ep)', description: 'Legacy coinage — homebrew only.' },
  { value: 'sc', label: 'Sovereign (sc)', description: 'Custom campaign coin.' },
  { value: 'shard', label: 'Astral shard', description: 'Planar trade currency.' },
  { value: 'credit', label: 'Credits', description: 'Sci-fantasy variant.' },
  { value: 'token', label: 'Trade token', description: 'Guild-issued scrip.' },
  { value: 'barter', label: 'Barter goods', description: 'Non-coin exchange.' },
]

type HarnessProps = Omit<
  InputSelectFieldProps,
  'value' | 'unit' | 'onValueChange' | 'onUnitChange'
> & {
  initialValue?: string | number
  initialUnit?: string
}

function InputSelectFieldHarness({ initialValue = '', initialUnit = '', ...props }: HarnessProps) {
  const [value, setValue] = React.useState<string | number | undefined>(initialValue)
  const [unit, setUnit] = React.useState(initialUnit)

  return (
    <InputSelectField
      {...props}
      value={value}
      unit={unit}
      onValueChange={setValue}
      onUnitChange={setUnit}
    />
  )
}

const meta = {
  title: 'Forms/InputSelectField',
  component: InputSelectFieldHarness,
  parameters: { layout: 'padded' },
  args: {
    id: 'demo',
    label: 'Demo',
    inputType: 'number',
    options: currencyOptions,
    initialValue: 0,
    initialUnit: 'gp',
  },
} satisfies Meta<typeof InputSelectFieldHarness>

export default meta
type Story = StoryObj<typeof meta>

export const Cost: Story = {
  args: {
    id: 'cost',
    label: 'Cost',
    inputType: 'number',
    options: currencyOptions,
    initialValue: 15,
    initialUnit: 'gp',
    min: 0,
    width: 'md',
  },
}

export const CastingTime: Story = {
  args: {
    id: 'casting-time',
    label: 'Casting time',
    inputType: 'number',
    options: castingTimeOptions,
    initialValue: 1,
    initialUnit: 'action',
    min: 1,
    width: 'lg',
  },
}

export const SearchableUnits: Story = {
  args: {
    id: 'searchable-unit',
    label: 'Unit',
    inputType: 'number',
    options: searchableUnitOptions,
    initialValue: 100,
    initialUnit: 'gp',
    searchable: true,
    unitPlaceholder: 'Choose unit',
    width: 'lg',
  },
}

export const TextValue: Story = {
  args: {
    id: 'text-value',
    label: 'Label text',
    inputType: 'text',
    options: [
      { value: 'left', label: 'Left' },
      { value: 'center', label: 'Center' },
      { value: 'right', label: 'Right' },
    ],
    initialValue: 'Example',
    initialUnit: 'center',
    placeholder: 'Enter text',
    width: 'md',
  },
}

export const WithHint: Story = {
  args: {
    id: 'cost-hint',
    label: 'Cost',
    inputType: 'number',
    options: currencyOptions,
    initialValue: 5,
    initialUnit: 'sp',
    hint: 'Enter an amount and pick a coin type.',
    min: 0,
  },
}

export const WithError: Story = {
  args: {
    id: 'cost-error',
    label: 'Cost',
    inputType: 'number',
    options: currencyOptions,
    initialValue: -1,
    initialUnit: 'gp',
    error: 'Cost must be zero or greater.',
    min: 0,
  },
}

export const Disabled: Story = {
  args: {
    id: 'cost-disabled',
    label: 'Cost',
    inputType: 'number',
    options: currencyOptions,
    initialValue: 50,
    initialUnit: 'gp',
    disabled: true,
  },
}
