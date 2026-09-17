import { render, screen } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'
import { describe, expect, it } from 'vitest'

import { XpThresholdsField } from './xp-thresholds-field'

function XpThresholdsFieldHarness({
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

describe('XpThresholdsField', () => {
  it('applies warning tone only to the derived phrase in the summary', () => {
    render(
      <XpThresholdsFieldHarness
        defaultValues={{
          maxCharacterLevel: 20,
          extendedProgressionEnabled: true,
          extendedMaxLevel: 30,
          extendedTierName: 'Epic Destiny',
          xpThresholdOverrides: [],
        }}
      />,
    )

    expect(screen.getByText('30 levels ·')).toHaveClass('text-muted-foreground')
    expect(screen.getByText('10 thresholds derived')).toHaveClass('text-semantic-warning')
  })

  it('keeps non-derived summary muted', () => {
    render(
      <XpThresholdsFieldHarness
        defaultValues={{
          maxCharacterLevel: 20,
          extendedProgressionEnabled: false,
          xpThresholdOverrides: [],
        }}
      />,
    )

    expect(screen.getByText('20 levels · System default')).toHaveClass('text-muted-foreground')
  })
})
