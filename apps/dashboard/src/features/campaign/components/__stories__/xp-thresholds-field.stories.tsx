import type { Meta, StoryObj } from '@storybook/react-vite'
import { FormProvider, useForm } from 'react-hook-form'

import { XpThresholdsField } from '../xp-thresholds-field'

function XpThresholdsFieldStory({
  defaultValues,
}: {
  defaultValues: {
    maxCharacterLevel: number
    extendedProgressionEnabled: boolean
    extendedMaxLevel?: number
    extendedTierName?: string
    xpThresholdOverrides: Array<{ level: number; xpRequired: number }>
  }
}) {
  const form = useForm({ defaultValues })

  return (
    <FormProvider {...form}>
      <XpThresholdsField />
    </FormProvider>
  )
}

const meta = {
  title: 'Dashboard/Campaign/XpThresholdsField',
  component: XpThresholdsFieldStory,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof XpThresholdsFieldStory>

export default meta
type Story = StoryObj<typeof meta>

export const SystemDefault: Story = {
  args: {
    defaultValues: {
      maxCharacterLevel: 20,
      extendedProgressionEnabled: false,
      xpThresholdOverrides: [],
    },
  },
}

export const DerivedExtendedProgression: Story = {
  args: {
    defaultValues: {
      maxCharacterLevel: 20,
      extendedProgressionEnabled: true,
      extendedMaxLevel: 30,
      extendedTierName: 'Epic Destiny',
      xpThresholdOverrides: [],
    },
  },
}

export const CampaignOverride: Story = {
  args: {
    defaultValues: {
      maxCharacterLevel: 20,
      extendedProgressionEnabled: false,
      xpThresholdOverrides: [{ level: 5, xpRequired: 7000 }],
    },
  },
}
