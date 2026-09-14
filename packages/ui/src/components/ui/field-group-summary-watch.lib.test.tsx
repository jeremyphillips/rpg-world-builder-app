import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import { renderHook } from '@testing-library/react'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'

import { useSummaryDisclosureWatchedValues } from './field-group-summary-watch.lib'

type Values = {
  heritage: {
    options: Array<{
      campaignAccess: {
        available: boolean
        visibilityMode: string
      }
    }>
  }
}

function createWrapper(defaultValues: Values) {
  return function Wrapper({ children }: { children: ReactNode }) {
    const form = useForm<Values>({ defaultValues })
    return <FormProvider {...form}>{children}</FormProvider>
  }
}

function useWatchedSummary(
  summaryDependsOn: readonly string[],
  namePrefix?: string,
): Record<string, unknown> {
  const { control } = useFormContext<Values>()
  return useSummaryDisclosureWatchedValues(control, summaryDependsOn, namePrefix)
}

describe('useSummaryDisclosureWatchedValues', () => {
  const defaultValues = {
    heritage: {
      options: [
        {
          campaignAccess: {
            available: true,
            visibilityMode: 'dm_only',
          },
        },
      ],
    },
  } satisfies Values

  it('resolves nested summaryDependsOn paths with namePrefix', () => {
    const { result } = renderHook(
      () => useWatchedSummary(['available', 'visibilityMode'], 'heritage.options.0.campaignAccess'),
      { wrapper: createWrapper(defaultValues) },
    )

    expect(result.current.available).toBe(true)
    expect(result.current.visibilityMode).toBe('dm_only')
  })

  it('returns undefined for root-level keys when values live under namePrefix', () => {
    const { result } = renderHook(() => useWatchedSummary(['available', 'visibilityMode']), {
      wrapper: createWrapper(defaultValues),
    })

    expect(result.current.available).toBeUndefined()
    expect(result.current.visibilityMode).toBeUndefined()
  })
})
