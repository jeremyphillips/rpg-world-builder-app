import type { Meta, StoryObj } from '@storybook/react-vite'
import { FormProvider, useForm } from 'react-hook-form'

import type { MonsterFormValues } from '../../lib/monster-form-values'
import { resolveMonsterCreateDefaultValues } from '../../lib/monster-form-values'
import { MonsterActionCastingAbilityField } from '../../lib/actions/monster-action-casting-fields'

const meta = {
  title: 'Dashboard/Content/Monsters/MonsterActionOnHitFields',
  component: MonsterActionCastingAbilityField,
} satisfies Meta<typeof MonsterActionCastingAbilityField>

export default meta

type Story = StoryObj<typeof meta>

function Host() {
  const form = useForm<MonsterFormValues>({ defaultValues: resolveMonsterCreateDefaultValues() })
  return (
    <FormProvider {...form}>
      <MonsterActionCastingAbilityField name="actions.0.castingAbility" sharedOptions={[]} />
    </FormProvider>
  )
}

export const CastingAbility: Story = {
  args: { name: 'actions.0.castingAbility', sharedOptions: [] },
  render: () => <Host />,
}
