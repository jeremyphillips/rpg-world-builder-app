import type { Meta, StoryObj } from '@storybook/react-vite'
import { FormProvider, useForm } from 'react-hook-form'

import { monsterFormTestValues } from '../../lib/monster-form-test-values'
import type { MonsterFormValues } from '../../lib/monster-form-values'
import { MonsterFormAvailabilityControl } from './monster-form-availability'

const meta = {
  title: 'Dashboard/Content/Monsters/MonsterFormAvailability',
  component: MonsterFormAvailabilityControl,
  args: { namePrefix: 'actions.0' },
} satisfies Meta<typeof MonsterFormAvailabilityControl>

export default meta
type Story = StoryObj<typeof meta>

const values = monsterFormTestValues({
  name: 'Werebear',
  forms: {
    profileFormId: 'profile',
    trueForm: { kind: 'defined', formId: 'humanoid' },
    definedForms: [
      { id: 'humanoid', name: 'Humanoid' },
      { id: 'hybrid', name: 'Bear-humanoid hybrid' },
      { id: 'bear', name: 'Bear' },
    ],
  },
  actions: [
    {
      id: 'rend',
      kind: 'special',
      name: 'Rend',
      description: '<p>Claws.</p>',
      onlyInFormIds: ['bear', 'hybrid'],
    },
  ] as MonsterFormValues['actions'],
})

function Host() {
  const form = useForm<MonsterFormValues>({ defaultValues: values })
  return (
    <FormProvider {...form}>
      <MonsterFormAvailabilityControl namePrefix="actions.0" />
    </FormProvider>
  )
}

export const SelectedForms: Story = {
  render: () => <Host />,
}
