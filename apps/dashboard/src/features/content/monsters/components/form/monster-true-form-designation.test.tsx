import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'
import { describe, expect, it } from 'vitest'

import {
  MONSTER_DEFINED_FORM_DISPLAY_FALLBACK,
  MONSTER_TRUE_FORM_DEFINED_EMPTY_HINT,
  MONSTER_TRUE_FORM_HEADING,
  MONSTER_TRUE_FORM_PROFILE_HINT,
  MONSTER_TRUE_FORM_SELECT_HINT,
  MONSTER_TRUE_FORM_SELECT_LABEL,
} from '../../lib/monster-form-labels'
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
  it('surfaces profile guidance on the true-form radio hint', () => {
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
    expect(screen.getByText(MONSTER_TRUE_FORM_PROFILE_HINT)).toBeInTheDocument()
    expect(screen.queryByText(MONSTER_TRUE_FORM_DEFINED_EMPTY_HINT)).not.toBeInTheDocument()
  })

  it('surfaces empty-defined guidance on the radio hint and omits the selector', () => {
    render(
      <Host
        forms={{
          profileFormId: 'profile',
          trueForm: { kind: 'defined' },
          definedForms: [],
        }}
      />,
    )

    expect(screen.getByText(MONSTER_TRUE_FORM_DEFINED_EMPTY_HINT)).toBeInTheDocument()
    expect(
      screen.queryByRole('combobox', { name: MONSTER_TRUE_FORM_SELECT_LABEL }),
    ).not.toBeInTheDocument()
  })

  it('omits the radio hint when defined forms exist and shows the selector', () => {
    render(
      <Host
        forms={{
          profileFormId: 'profile',
          trueForm: { kind: 'defined', formId: 'bear' },
          definedForms: [{ id: 'bear', name: 'Bear' }],
        }}
      />,
    )

    const radiogroup = screen.getByRole('radiogroup', { name: 'True form' })
    expect(radiogroup).toBeInTheDocument()
    expect(screen.queryByText(MONSTER_TRUE_FORM_PROFILE_HINT)).not.toBeInTheDocument()
    expect(screen.queryByText(MONSTER_TRUE_FORM_DEFINED_EMPTY_HINT)).not.toBeInTheDocument()
    expect(
      screen.getByRole('combobox', { name: MONSTER_TRUE_FORM_SELECT_LABEL }),
    ).toBeInTheDocument()
    expect(screen.getByText(MONSTER_TRUE_FORM_SELECT_HINT)).toBeInTheDocument()
  })

  it('updates the radio hint when switching between profile and defined form', async () => {
    const user = userEvent.setup()
    render(
      <Host
        forms={{
          profileFormId: 'profile',
          trueForm: { kind: 'profile' },
          definedForms: [],
        }}
      />,
    )

    expect(screen.getByText(MONSTER_TRUE_FORM_PROFILE_HINT)).toBeInTheDocument()
    await user.click(screen.getByLabelText('Defined form'))
    expect(screen.getByText(MONSTER_TRUE_FORM_DEFINED_EMPTY_HINT)).toBeInTheDocument()
    expect(screen.queryByText(MONSTER_TRUE_FORM_PROFILE_HINT)).not.toBeInTheDocument()
  })

  it('hides the duplicate true-form label while keeping the accessible radiogroup name', () => {
    render(
      <Host
        forms={{
          profileFormId: 'profile',
          trueForm: { kind: 'profile' },
          definedForms: [],
        }}
      />,
    )

    expect(screen.getByRole('radiogroup', { name: MONSTER_TRUE_FORM_HEADING })).toBeInTheDocument()
    expect(screen.getByText(MONSTER_TRUE_FORM_HEADING)).toHaveClass('sr-only')
  })

  it('uses New form as the selector label for an unnamed defined form', () => {
    render(
      <Host
        forms={{
          profileFormId: 'profile',
          trueForm: { kind: 'defined', formId: 'row-1' },
          definedForms: [{ id: 'row-1', name: '' }],
        }}
      />,
    )

    expect(screen.getByText(MONSTER_DEFINED_FORM_DISPLAY_FALLBACK)).toBeInTheDocument()
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
