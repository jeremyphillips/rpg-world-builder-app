import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'

import type { ComboboxFieldConfig } from '../../field-config'
import { useComboboxFieldRecommendation } from './use-combobox-field-recommendation.client'

function Probe({ config }: { config: ComboboxFieldConfig }) {
  const recommendation = useComboboxFieldRecommendation(config)
  if (!recommendation || !('content' in recommendation)) return null
  return <span>{recommendation.content}</span>
}

function Host({ config }: { config: ComboboxFieldConfig }) {
  const form = useForm({ defaultValues: { mode: 'specific' } })
  return (
    <FormProvider {...form}>
      <Probe config={config} />
    </FormProvider>
  )
}

describe('useComboboxFieldRecommendation', () => {
  it('resolves static recommendations', () => {
    const config: ComboboxFieldConfig = {
      type: 'combobox',
      name: 'items',
      label: 'Items',
      options: [],
      recommendation: {
        content: 'Static recommendation',
        action: { label: '+ Add', ariaLabel: 'Add', onClick: vi.fn() },
      },
    }

    render(<Host config={config} />)
    expect(screen.getByText('Static recommendation')).toBeInTheDocument()
  })

  it('re-resolves dynamic recommendations when dependsOn values change', () => {
    const recommendationWhen = vi.fn(({ mode }: { mode: string }) =>
      mode === 'specific'
        ? {
            content: 'Dynamic recommendation',
            action: { label: '+ Add', ariaLabel: 'Add', onClick: vi.fn() },
          }
        : null,
    )

    const config: ComboboxFieldConfig = {
      type: 'combobox',
      name: 'items',
      label: 'Items',
      options: [],
      recommendationResolve: {
        dependsOn: ['mode'],
        recommendationWhen: (values) => recommendationWhen(values as { mode: string }),
      },
    }

    render(<Host config={config} />)
    expect(screen.getByText('Dynamic recommendation')).toBeInTheDocument()
    expect(recommendationWhen).toHaveBeenCalled()
  })
})
