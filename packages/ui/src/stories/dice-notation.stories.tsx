import { CLASS_HIT_DICE } from '@rpg/contracts/primitives'
import type { ReactNode } from 'react'
import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { z } from 'zod'

import { DiceFormulaField } from '../components/ui/dice-formula-field.client'
import { FieldGroup } from '../components/ui/field-group'
import { Text } from '../components/ui/text'
import { Form } from '../form/form.client'
import type { FormItem } from '../form/field-config'
import { CardFooter } from '../components/ui/card'
import { SubmitButton } from '../components/ui/submit-button'
import { formatDiceFormula, type DiceFormulaValue } from '../components/ui/dice-formula-field.lib'

function RecipePanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <Text variant="small" className="font-medium text-foreground">
        {title}
      </Text>
      {children}
    </section>
  )
}

function WeaponDamageRecipe() {
  const [value, setValue] = useState<DiceFormulaValue>({ count: 1, faces: 8 })

  return (
    <RecipePanel title="Weapon damage (optional modifier)">
      <DiceFormulaField
        id="weapon-damage"
        label="Damage"
        modifierMode="optional"
        value={value}
        onChange={setValue}
      />
      <Text variant="small">
        Preview:{' '}
        <span className="font-mono font-medium text-foreground">{formatDiceFormula(value)}</span>
      </Text>
    </RecipePanel>
  )
}

function HitDieRecipe() {
  const [value, setValue] = useState<DiceFormulaValue>({ count: 1, faces: 8 })

  return (
    <RecipePanel title="Hit die (dice only)">
      <DiceFormulaField
        id="hit-die"
        label="Hit die"
        modifierMode="none"
        faces={CLASS_HIT_DICE}
        value={value}
        onChange={setValue}
      />
      <Text variant="small">
        Preview:{' '}
        <span className="font-mono font-medium text-foreground">{formatDiceFormula(value)}</span>
      </Text>
    </RecipePanel>
  )
}

function HealingRecipe() {
  const [value, setValue] = useState<DiceFormulaValue>({
    count: 2,
    faces: 8,
    modifier: { operator: '+', amount: 2 },
  })

  return (
    <RecipePanel title="Healing (required modifier)">
      <DiceFormulaField
        id="healing"
        label="Healing"
        modifierMode="required"
        value={value}
        onChange={setValue}
      />
      <Text variant="small">
        Preview:{' '}
        <span className="font-mono font-medium text-foreground">{formatDiceFormula(value)}</span>
      </Text>
    </RecipePanel>
  )
}

const schema = z.object({
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

const fields: FormItem[] = [
  {
    type: 'diceFormula',
    name: 'damage',
    label: 'Roll',
    modifierMode: 'optional',
    required: true,
  },
]

function SchemaDrivenRecipe() {
  return (
    <RecipePanel title="Schema-driven form">
      <Form
        schema={schema}
        fields={fields}
        onSubmit={() => undefined}
        footer={
          <CardFooter className="justify-end px-0 pb-0 pt-4">
            <SubmitButton>Save</SubmitButton>
          </CardFooter>
        }
      />
    </RecipePanel>
  )
}

function DiceNotationRecipes() {
  return (
    <FieldGroup legend="Dice formula recipes" className="max-w-md">
      <WeaponDamageRecipe />
      <HitDieRecipe />
      <HealingRecipe />
      <SchemaDrivenRecipe />
    </FieldGroup>
  )
}

const meta = {
  title: 'Recipes/DiceNotation',
  component: DiceNotationRecipes,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof DiceNotationRecipes>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
