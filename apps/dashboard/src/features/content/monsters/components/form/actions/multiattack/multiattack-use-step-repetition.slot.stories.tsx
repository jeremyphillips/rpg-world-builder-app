import type { Meta, StoryObj } from '@storybook/react'
import { FormProvider, useForm } from 'react-hook-form'

import { MonsterMultiattackUseStepRepetitionSlot } from './multiattack-use-step-repetition.slot'

const meta = {
  title: 'Dashboard/Monsters/Multiattack use step repetition',
  component: MonsterMultiattackUseStepRepetitionSlot,
} satisfies Meta<typeof MonsterMultiattackUseStepRepetitionSlot>

export default meta

type Story = StoryObj<typeof meta>

function Harness({ defaultValues }: { defaultValues: Record<string, unknown> }) {
  const form = useForm({ defaultValues })
  return (
    <FormProvider {...form}>
      <MonsterMultiattackUseStepRepetitionSlot namePrefix="step" />
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
