import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import { describe, expect, it } from 'vitest'
import { FormItems } from '@rpg/ui/form'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { monsterFormSizesOverrideGroup } from './monster-form-sizes-override-fields'

const ctx = {
  entityCatalogLayer: 'homebrew',
  sizeVocabulary: {
    labelById: { medium: 'Medium', large: 'Large' },
    activeIds: new Set(['medium', 'large']),
  },
  creatureSizesSeedIds: [],
} as ContentFormCtx

function StateProbe() {
  const { getValues } = useFormContext()
  const row = getValues('forms.definedForms.0') as Record<string, unknown> | undefined
  return (
    <output data-testid="sizes-state">
      {JSON.stringify({
        overrides: row?.overrides ?? null,
      })}
    </output>
  )
}

function DefinedFormHarness({ defaultValues }: { defaultValues?: Record<string, unknown> }) {
  const form = useForm({
    defaultValues: {
      sizes: ['medium'],
      forms: {
        definedForms: [{}],
      },
      ...defaultValues,
    },
    shouldUnregister: true,
  })
  return (
    <FormProvider {...form}>
      <StateProbe />
      <FormItems
        items={[monsterFormSizesOverrideGroup(ctx)]}
        idPrefix="defined-form"
        namePrefix="forms.definedForms.0"
      />
    </FormProvider>
  )
}

function sizesState() {
  return JSON.parse(screen.getByTestId('sizes-state').textContent ?? '{}') as {
    overrides: { sizes?: string[] } | null
  }
}

describe('monsterFormSizesOverrideGroup form behavior', () => {
  it('opens without writing overrides.sizes', async () => {
    const user = userEvent.setup()
    render(<DefinedFormHarness />)

    expect(sizesState()).toEqual({ overrides: null })
    await user.click(screen.getByRole('button', { name: 'Override Sizes' }))
    expect(document.getElementById('defined-form-forms-definedForms-0-sizesOverride')).toBeTruthy()
    expect(sizesState()).toEqual({ overrides: null })
  })

  it('shows an existing override when overrides.sizes is populated', async () => {
    const user = userEvent.setup()
    render(
      <DefinedFormHarness
        defaultValues={{
          forms: {
            definedForms: [{ overrides: { sizes: ['large'] } }],
          },
        }}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Override Sizes' }))
    expect(
      screen.getByRole('checkbox', {
        name: 'Large',
      }),
    ).toHaveAttribute('aria-checked', 'true')
  })

  it('clears overrides.sizes back to absent', async () => {
    const user = userEvent.setup()
    render(
      <DefinedFormHarness
        defaultValues={{
          forms: {
            definedForms: [{ overrides: { sizes: ['large'] } }],
          },
        }}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Override Sizes' }))
    await user.click(screen.getByRole('button', { name: 'Use base sizes' }))
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Override Sizes' })).toBeInTheDocument()
    })
    expect(sizesState()).toEqual({ overrides: null })
  })
})
