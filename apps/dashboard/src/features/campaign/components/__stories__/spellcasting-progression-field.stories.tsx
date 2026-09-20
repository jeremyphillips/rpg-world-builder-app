import type { Meta, StoryObj } from '@storybook/react-vite'
import { FormProvider, useForm } from 'react-hook-form'

import { resolveSpellcastingProgressionFormState } from '../../lib/rules/character-configuration/spellcasting-progression-form-values'
import { SpellcastingProgressionField } from '../spellcasting-progression-field'

function SpellcastingProgressionFieldStory({
  defaultValues,
}: {
  defaultValues: {
    maxCharacterLevel: number
    extendedProgressionEnabled: boolean
    extendedMaxLevel?: number
    extendedTierName?: string
    slotProgressions: ReturnType<typeof resolveSpellcastingProgressionFormState>['slotProgressions']
    profiles: ReturnType<typeof resolveSpellcastingProgressionFormState>['profiles']
  }
}) {
  const form = useForm({ defaultValues })

  return (
    <FormProvider {...form}>
      <SpellcastingProgressionField />
    </FormProvider>
  )
}

const seedState = resolveSpellcastingProgressionFormState(undefined)

const meta = {
  title: 'Dashboard/Campaign/SpellcastingProgressionField',
  component: SpellcastingProgressionFieldStory,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof SpellcastingProgressionFieldStory>

export default meta
type Story = StoryObj<typeof meta>

export const SystemDefault: Story = {
  args: {
    defaultValues: {
      maxCharacterLevel: 20,
      extendedProgressionEnabled: false,
      ...seedState,
    },
  },
}

export const ExtendedProgression: Story = {
  args: {
    defaultValues: {
      maxCharacterLevel: 20,
      extendedProgressionEnabled: true,
      extendedMaxLevel: 30,
      extendedTierName: 'Epic Destiny',
      ...seedState,
    },
  },
}
