import type { Meta, StoryObj } from '@storybook/react-vite'
import { FormProvider, useForm } from 'react-hook-form'

import { resolveMonsterCreateDefaultValues, type MonsterFormValues } from '../monster-form-values'
import { MonsterLegendarySpellcastingActionField } from './monster-action-casting-fields'

const meta = {
  title: 'Dashboard/Content/Monsters/MonsterLegendarySpellcastingActionField',
  component: MonsterLegendarySpellcastingActionField,
} satisfies Meta<typeof MonsterLegendarySpellcastingActionField>

export default meta

type Story = StoryObj<typeof meta>

function Host() {
  const values = resolveMonsterCreateDefaultValues()
  values.actions = [
    {
      id: 'spellcasting',
      kind: 'spell',
      name: 'Spellcasting',
      castingAbility: { kind: 'ability', ability: 'int' },
      spells: [{ spellId: 'srd:fireball', castAtLevel: 5 }, { spellId: 'srd:mage-hand' }],
    },
  ]
  values.legendaryActions = [
    {
      id: 'presence',
      kind: 'spell',
      name: 'Commanding Presence',
      spellInvocation: 'use-entry',
      castingAbility: { kind: 'shared', entryId: 'spellcasting' },
      spells: [{ spellId: 'srd:fireball' }],
    },
  ]
  const form = useForm<MonsterFormValues>({ defaultValues: values })
  return (
    <FormProvider {...form}>
      <MonsterLegendarySpellcastingActionField name="legendaryActions.0.castingAbility" />
    </FormProvider>
  )
}

export const Selected: Story = {
  args: { name: 'legendaryActions.0.castingAbility' },
  render: () => <Host />,
}
