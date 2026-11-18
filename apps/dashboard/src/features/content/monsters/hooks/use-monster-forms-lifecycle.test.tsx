import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { describe, expect, it } from 'vitest'

import type { MonsterFormValues } from '../lib/monster-form-values'
import { monsterFormTestValues } from '../lib/monster-form-test-values'
import { useMonsterFormsLifecycle } from './use-monster-forms-lifecycle'

function LifecycleHost({ values }: { values: MonsterFormValues }) {
  const form = useForm<MonsterFormValues>({ defaultValues: values })
  return (
    <FormProvider {...form}>
      <LifecycleControls />
    </FormProvider>
  )
}

function LifecycleControls() {
  const lifecycle = useMonsterFormsLifecycle()
  const forms = useWatch<MonsterFormValues, 'forms'>({ name: 'forms' })
  return (
    <>
      <button
        type="button"
        onClick={() => lifecycle.requestDesignation({ kind: 'defined', formId: 'bear' })}
      >
        Designate bear
      </button>
      <button type="button" onClick={() => lifecycle.requestDefinedFormRemoval('humanoid')}>
        Remove humanoid
      </button>
      <button type="button" onClick={() => lifecycle.requestDefinedFormRemoval('bear')}>
        Remove bear
      </button>
      <button type="button" onClick={lifecycle.requestRemoveAll}>
        Remove forms
      </button>
      <output aria-label="forms state">{JSON.stringify(forms)}</output>
      {lifecycle.dialog}
    </>
  )
}

const values = monsterFormTestValues({
  name: 'Werebear',
  forms: {
    profileFormId: 'profile',
    trueForm: { kind: 'defined', formId: 'humanoid' },
    definedForms: [
      { id: 'humanoid', name: 'Humanoid' },
      { id: 'bear', name: 'Bear', overrides: { sizes: ['large'] } },
    ],
  },
})

describe('useMonsterFormsLifecycle', () => {
  it('keeps designation and overrides unchanged when cleanup is cancelled', async () => {
    const user = userEvent.setup()
    render(<LifecycleHost values={values} />)

    await user.click(screen.getByRole('button', { name: 'Designate bear' }))
    expect(screen.getByRole('alertdialog')).toHaveTextContent('Set Bear as the true form?')
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(screen.getByLabelText('forms state')).toHaveTextContent(
      '"trueForm":{"kind":"defined","formId":"humanoid"}',
    )
    expect(screen.getByLabelText('forms state')).toHaveTextContent('"sizes":["large"]')
  })

  it('cleans overrides and designates the row only after confirmation', async () => {
    const user = userEvent.setup()
    render(<LifecycleHost values={values} />)

    await user.click(screen.getByRole('button', { name: 'Designate bear' }))
    await user.click(screen.getByRole('button', { name: 'Set true form' }))

    expect(screen.getByLabelText('forms state')).toHaveTextContent(
      '"trueForm":{"kind":"defined","formId":"bear"}',
    )
    expect(screen.getByLabelText('forms state')).not.toHaveTextContent('"sizes":["large"]')
  })

  it('names action references indirectly affected by profile restriction cleanup', async () => {
    const user = userEvent.setup()
    render(
      <LifecycleHost
        values={monsterFormTestValues({
          name: 'Werebear',
          forms: {
            profileFormId: 'profile',
            trueForm: { kind: 'profile' },
            definedForms: [{ id: 'bear', name: 'Bear' }],
          },
          actions: [
            { id: 'slam', kind: 'special', name: 'Slam', onlyInFormIds: ['profile'] },
            {
              id: 'multi',
              kind: 'multiattack',
              name: 'Multiattack',
              steps: [{ actionIds: ['slam'] }],
            },
          ] as MonsterFormValues['actions'],
        })}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Designate bear' }))

    expect(screen.getByRole('alertdialog')).toHaveTextContent(
      'Also affected action references: Multiattack.',
    )
  })

  it('returns to the profile when removing the designated row', async () => {
    const user = userEvent.setup()
    render(<LifecycleHost values={values} />)

    await user.click(screen.getByRole('button', { name: 'Remove humanoid' }))
    expect(screen.getByRole('alertdialog')).toHaveTextContent(
      'The creature profile will become the true form.',
    )
    await user.click(screen.getByRole('button', { name: 'Remove form' }))

    expect(screen.getByLabelText('forms state')).toHaveTextContent('"trueForm":{"kind":"profile"}')
    expect(screen.getByLabelText('forms state')).not.toHaveTextContent('"id":"humanoid"')
  })

  it('lists remaining forms and emptied restrictions when a form is removed', async () => {
    const user = userEvent.setup()
    render(
      <LifecycleHost
        values={monsterFormTestValues({
          name: 'Werebear',
          forms: {
            profileFormId: 'profile',
            trueForm: { kind: 'defined', formId: 'humanoid' },
            definedForms: [
              { id: 'humanoid', name: 'Humanoid' },
              { id: 'hybrid', name: 'Bear-humanoid hybrid' },
              { id: 'bear', name: 'Bear' },
            ],
          },
          actions: [
            { id: 'rend', kind: 'special', name: 'Rend', onlyInFormIds: ['bear', 'hybrid'] },
            { id: 'bite', kind: 'special', name: 'Bite', onlyInFormIds: ['bear'] },
            {
              id: 'multi',
              kind: 'multiattack',
              name: 'Multiattack',
              steps: [{ actionIds: ['bite'] }],
            },
          ] as MonsterFormValues['actions'],
        })}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Remove bear' }))
    const dialog = screen.getByRole('alertdialog')
    expect(dialog).toHaveTextContent('Rend and Bite lose Bear.')
    expect(dialog).toHaveTextContent(
      'Rend will then be available only in Bear-humanoid hybrid form.',
    )
    expect(dialog).toHaveTextContent('Bite will have no forms selected.')
    expect(dialog).toHaveTextContent('No row becomes unrestricted.')
    expect(dialog).toHaveTextContent('Also affected: Multiattack.')
  })

  it('preserves designation when removing a non-designated row', async () => {
    const user = userEvent.setup()
    render(<LifecycleHost values={values} />)

    await user.click(screen.getByRole('button', { name: 'Remove bear' }))
    await user.click(screen.getByRole('button', { name: 'Remove form' }))

    expect(screen.getByLabelText('forms state')).toHaveTextContent(
      '"trueForm":{"kind":"defined","formId":"humanoid"}',
    )
    expect(screen.getByLabelText('forms state')).not.toHaveTextContent('"id":"bear"')
  })

  it('removes the complete configuration only after confirmation', async () => {
    const user = userEvent.setup()
    render(<LifecycleHost values={values} />)

    await user.click(screen.getByRole('button', { name: 'Remove forms' }))
    const dialog = screen.getByRole('alertdialog')
    expect(dialog).toHaveTextContent('Remove forms?')
    await user.click(within(dialog).getByRole('button', { name: 'Remove forms' }))

    expect(screen.getByLabelText('forms state')).toBeEmptyDOMElement()
  })
})
