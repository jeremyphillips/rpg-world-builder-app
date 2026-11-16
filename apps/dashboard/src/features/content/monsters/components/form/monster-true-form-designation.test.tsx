import { render, screen } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'
import { describe, expect, it } from 'vitest'

import type { MonsterFormValues } from '../../lib/monster-form-values'
import { MonsterTrueFormDesignation } from './monster-true-form-designation'

function Host({ forms }: { forms: unknown }) {
  const form = useForm<MonsterFormValues>({
    defaultValues: { forms } as MonsterFormValues,
  })
  return (
    <FormProvider {...form}>
      <MonsterTrueFormDesignation />
    </FormProvider>
  )
}

describe('MonsterTrueFormDesignation', () => {
  it('renders the profile designation', () => {
    render(
      <Host
        forms={{
          profileFormId: 'profile',
          trueForm: { kind: 'profile' },
          definedForms: [],
        }}
      />,
    )

    expect(screen.getByRole('radiogroup', { name: 'True form' })).toBeInTheDocument()
    expect(screen.getByText("The creature's profile represents its true form.")).toBeInTheDocument()
  })

  it('does not crash on a superseded persisted forms shape', () => {
    const { container } = render(
      <Host
        forms={{
          trueForm: { id: 'humanoid', name: 'Humanoid' },
          alternates: [{ id: 'bear', name: 'Bear' }],
        }}
      />,
    )

    expect(container).toBeEmptyDOMElement()
  })
})
