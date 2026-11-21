import type { Meta, StoryObj } from '@storybook/react'
import { FormProvider, useForm } from 'react-hook-form'

import { MonsterMultiattackUseStepChoiceAcquisitionSlot } from './multiattack-use-step-choice-acquisition.slot'

const meta = {
  title: 'Dashboard/Monsters/Multiattack use step choice acquisition',
  component: MonsterMultiattackUseStepChoiceAcquisitionSlot,
} satisfies Meta<typeof MonsterMultiattackUseStepChoiceAcquisitionSlot>

export default meta

type Story = StoryObj<typeof meta>

function Harness({ defaultValues }: { defaultValues: Record<string, unknown> }) {
  const form = useForm({ defaultValues })
  return (
    <FormProvider {...form}>
      <MonsterMultiattackUseStepChoiceAcquisitionSlot namePrefix="step" />
    </FormProvider>
  )
}

export const Visible: Story = {
  render: () => (
    <Harness
      defaultValues={{
        step: { kind: 'use', mode: 'single', actionId: 'bite' },
      }}
    />
  ),
}

export const HiddenWithRepetition: Story = {
  render: () => (
    <Harness
      defaultValues={{
        step: { kind: 'use', mode: 'single', actionId: 'bite', count: 2 },
      }}
    />
  ),
}
