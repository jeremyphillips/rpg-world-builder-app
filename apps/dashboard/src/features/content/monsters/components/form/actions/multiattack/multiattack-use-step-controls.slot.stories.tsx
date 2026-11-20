import type { Meta, StoryObj } from '@storybook/react'
import { FormProvider, useForm } from 'react-hook-form'

import { MonsterMultiattackUseStepControlsSlot } from './multiattack-use-step-controls.slot'

const meta = {
  title: 'Dashboard/Monsters/Multiattack use step controls',
  component: MonsterMultiattackUseStepControlsSlot,
} satisfies Meta<typeof MonsterMultiattackUseStepControlsSlot>

export default meta

type Story = StoryObj<typeof meta>

function Harness({ defaultValues }: { defaultValues: Record<string, unknown> }) {
  const form = useForm({ defaultValues })
  return (
    <FormProvider {...form}>
      <MonsterMultiattackUseStepControlsSlot namePrefix="step" />
    </FormProvider>
  )
}

export const SingleUse: Story = {
  render: () => (
    <Harness
      defaultValues={{
        step: { kind: 'use', mode: 'single', actionId: 'bite' },
      }}
    />
  ),
}

export const WithRepetition: Story = {
  render: () => (
    <Harness
      defaultValues={{
        step: { kind: 'use', mode: 'single', actionId: 'bite', count: 2 },
      }}
    />
  ),
}
