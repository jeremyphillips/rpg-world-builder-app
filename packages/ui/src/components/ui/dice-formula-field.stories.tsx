import { CLASS_HIT_DICE } from '@rpg/contracts/primitives'
import type { ComponentProps } from 'react'
import { useState } from 'react'
import { action } from 'storybook/actions'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { z } from 'zod'

import { DiceFormulaField } from './dice-formula-field.client'
import { Text } from './text'
import { Form } from '../../form/shells/form.client'
import type { FormItem } from '../../form/field-config'
import {
  defaultDiceFormulaForMode,
  formatDiceFormula,
  type DiceFormulaValue,
} from './dice-formula-field.lib'
import { SubmitButton } from './submit-button'

function DiceFormulaPreview({ value, ...props }: ComponentProps<typeof DiceFormulaField>) {
  const [current, setCurrent] = useState<DiceFormulaValue | undefined>(value)

  return (
    <div className="max-w-md space-y-4">
      <DiceFormulaField
        {...props}
        value={current}
        onChange={(next) => {
          setCurrent(next)
          action('onChange')(next)
        }}
      />
      <Text variant="small">
        Rolls{' '}
        <span className="font-mono font-medium text-foreground">
          {formatDiceFormula(
            current ?? defaultDiceFormulaForMode(props.modifierMode ?? 'optional'),
          )}
        </span>
      </Text>
    </div>
  )
}

const meta = {
  title: 'Forms/DiceFormulaField',
  component: DiceFormulaField,
  args: {
    id: 'dice-formula',
    label: 'Roll',
    modifierMode: 'optional',
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof DiceFormulaField>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => <DiceFormulaPreview {...args} />,
}

export const ModifierRequired: Story = {
  render: (args) => <DiceFormulaPreview {...args} modifierMode="required" />,
}

export const DiceOnly: Story = {
  render: (args) => <DiceFormulaPreview {...args} modifierMode="none" label="Hit die" />,
}

export const InlineLabel: Story = {
  render: (args) => <DiceFormulaPreview {...args} labelPosition="inline" />,
}

export const RestrictedFaces: Story = {
  render: (args) => (
    <DiceFormulaPreview
      {...args}
      modifierMode="none"
      label="Hit die"
      faces={CLASS_HIT_DICE}
      value={{ count: 1, faces: 8 }}
    />
  ),
}

export const WithModifier: Story = {
  render: (args) => (
    <DiceFormulaPreview
      {...args}
      value={{ count: 2, faces: 6, modifier: { operator: '+', amount: 3 } }}
    />
  ),
}

export const MultiplyRequired: Story = {
  render: (args) => (
    <DiceFormulaPreview
      {...args}
      modifierMode="required"
      modifierOperators={['×']}
      modifierMin={1}
      modifierAmountLabel="Multiplier"
      value={{ count: 1, faces: 10, modifier: { operator: '×', amount: 250 } }}
    />
  ),
}

export const AllOperators: Story = {
  render: (args) => (
    <DiceFormulaPreview
      {...args}
      modifierMode="required"
      modifierOperators={['+', '-', '×', '÷']}
      value={{ count: 2, faces: 6, modifier: { operator: '×', amount: 3 } }}
    />
  ),
}

export const WithHint: Story = {
  render: (args) => (
    <DiceFormulaPreview
      {...args}
      hint="Weapon damage uses count, die, and an optional flat bonus."
    />
  ),
}

export const WithError: Story = {
  render: (args) => <DiceFormulaPreview {...args} error="Enter a valid roll." />,
}

export const Disabled: Story = {
  render: (args) => (
    <DiceFormulaPreview
      {...args}
      disabled
      value={{ count: 1, faces: 8, modifier: { operator: '+', amount: 2 } }}
    />
  ),
}

const formSchema = z.object({
  damage: z.object({
    count: z.number().int().min(1),
    faces: z.number().int(),
    modifier: z
      .object({
        operator: z.enum(['+', '-']),
        amount: z.number().int().min(0),
      })
      .optional(),
  }),
})

const formFields: FormItem[] = [
  {
    type: 'diceFormula',
    name: 'damage',
    label: 'Damage',
    modifierMode: 'optional',
    required: true,
  },
]

export const InForm: Story = {
  render: () => (
    <Form
      schema={formSchema}
      fields={formFields}
      onSubmit={(values: z.infer<typeof formSchema>) => action('submit')(values)}
      footer={<SubmitButton>Save</SubmitButton>}
    />
  ),
}
