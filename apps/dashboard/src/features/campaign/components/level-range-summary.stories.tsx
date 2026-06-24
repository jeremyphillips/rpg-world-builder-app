import type { Meta, StoryObj } from '@storybook/react-vite'
import { FormProvider, useForm } from 'react-hook-form'

import { ExtendedProgressionEffects } from './extended-progression-effects.client'
import { ExtendedLevelRangeSummary, StandardLevelRangeSummary } from './level-range-summary.client'

function SummaryStory({
  defaultValues,
}: {
  defaultValues: {
    maxCharacterLevel: number
    extendedProgressionEnabled: boolean
    extendedTierName?: string
    extendedMaxLevel?: number
  }
}) {
  const form = useForm({ defaultValues })
  return (
    <FormProvider {...form}>
      <div className="space-y-4">
        <StandardLevelRangeSummary />
        <ExtendedProgressionEffects />
        <ExtendedLevelRangeSummary />
      </div>
    </FormProvider>
  )
}

const meta = {
  title: 'Dashboard/Campaign/LevelRangeSummary',
  component: SummaryStory,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof SummaryStory>

export default meta
type Story = StoryObj<typeof meta>

export const ExtendedOn: Story = {
  args: {
    defaultValues: {
      maxCharacterLevel: 20,
      extendedProgressionEnabled: true,
      extendedTierName: 'Epic Destiny',
      extendedMaxLevel: 30,
    },
  },
}

export const ExtendedOnEmptyTier: Story = {
  args: {
    defaultValues: {
      maxCharacterLevel: 20,
      extendedProgressionEnabled: true,
      extendedMaxLevel: 30,
    },
  },
}

export const ExtendedOff: Story = {
  args: {
    defaultValues: {
      maxCharacterLevel: 30,
      extendedProgressionEnabled: false,
    },
  },
}
