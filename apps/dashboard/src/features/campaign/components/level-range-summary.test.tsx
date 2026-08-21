import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'

import { ExtendedLevelRangeSummary, StandardLevelRangeSummary } from './level-range-summary'

function SummaryHarness({
  defaultValues,
  component,
}: {
  defaultValues: {
    maxCharacterLevel: number
    extendedProgressionEnabled: boolean
    extendedTierName?: string
    extendedMaxLevel?: number
  }
  component: 'standard' | 'extended'
}) {
  const form = useForm({ defaultValues })
  const Summary = component === 'standard' ? StandardLevelRangeSummary : ExtendedLevelRangeSummary
  return (
    <FormProvider {...form}>
      <Summary />
    </FormProvider>
  )
}

describe('StandardLevelRangeSummary', () => {
  it('shows a simple range when extended progression is off', () => {
    render(
      <SummaryHarness
        component="standard"
        defaultValues={{
          maxCharacterLevel: 30,
          extendedProgressionEnabled: false,
        }}
      />,
    )

    expect(screen.getByText('Range: 1–30')).toBeInTheDocument()
  })

  it('hides when extended progression is on', () => {
    render(
      <SummaryHarness
        component="standard"
        defaultValues={{
          maxCharacterLevel: 20,
          extendedProgressionEnabled: true,
          extendedMaxLevel: 30,
        }}
      />,
    )

    expect(screen.queryByText(/Range:/)).not.toBeInTheDocument()
  })
})

describe('ExtendedLevelRangeSummary', () => {
  it('shows the combined range when extended progression is on', () => {
    render(
      <SummaryHarness
        component="extended"
        defaultValues={{
          maxCharacterLevel: 20,
          extendedProgressionEnabled: true,
          extendedTierName: 'Epic Destiny',
          extendedMaxLevel: 30,
        }}
      />,
    )

    expect(screen.getByText('Range: 1–20 standard · 21–30 Epic Destiny')).toBeInTheDocument()
  })

  it('uses a placeholder tier label when tier name is empty', () => {
    render(
      <SummaryHarness
        component="extended"
        defaultValues={{
          maxCharacterLevel: 20,
          extendedProgressionEnabled: true,
          extendedMaxLevel: 30,
        }}
      />,
    )

    expect(screen.getByText('Range: 1–20 standard · 21–30 extended')).toBeInTheDocument()
  })

  it('hides when extended progression is off', () => {
    render(
      <SummaryHarness
        component="extended"
        defaultValues={{
          maxCharacterLevel: 20,
          extendedProgressionEnabled: false,
        }}
      />,
    )

    expect(screen.queryByText(/Range:/)).not.toBeInTheDocument()
  })
})
