'use client'

import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { CURRENCY_IDS, getCurrencyAbbrev } from '@rpg/contracts/primitives'
import { CASTING_TIME_UNIT_ENTRIES } from '@rpg/contracts/vocab'

import {
  InputSelectField,
  type InputSelectFieldProps,
  type InputSelectOption,
} from './input-select-field.client'

const currencyOptions: InputSelectOption[] = CURRENCY_IDS.map((id) => ({
  value: id,
  label: getCurrencyAbbrev(id),
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
    width: 'auto',
    valueDigits: 2,
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
    width: 'auto',
    valueDigits: 2,
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
    width: 'full',
    valueDigits: 3,
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
    width: 'xl',
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
    valueDigits: 2,
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
    valueDigits: 2,
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
    valueDigits: 2,
  },
}

const weightUnitOptions: InputSelectOption[] = [{ value: 'lb', label: 'lb.' }]

export const Weight: Story = {
  args: {
    id: 'weight',
    label: 'Weight',
    inputType: 'number',
    options: weightUnitOptions,
    initialValue: 3,
    initialUnit: 'lb',
    unitDisabled: true,
    min: 0,
    step: 0.5,
    width: 'auto',
    valueDigits: 2,
    hint: 'Leave blank for no weight',
  },
}

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <InputSelectFieldHarness
          key={size}
          id={`cost-${size}`}
          label={`Cost (${size})`}
          inputType="number"
          options={currencyOptions}
          initialValue={15}
          initialUnit="gp"
          min={0}
          size={size}
          width="auto"
          valueDigits={2}
        />
      ))}
    </div>
  ),
}
