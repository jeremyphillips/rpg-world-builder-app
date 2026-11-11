import { describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'

import { FormItems } from './form-items.client'
import type { FormItem } from '../field-config'

const field = {
  kind: 'group',
  name: 'savingThrow',
  separator: 'subtle',
  optionalDisclosure: {
    addLabel: 'Add saving throw',
    removeLabel: 'Remove saving throw',
  },
  fields: [
    {
      type: 'textarea',
      name: 'savingThrow.failure',
      label: 'Failure',
    },
  ],
} as const satisfies FormItem

function StateProbe() {
  const { formState, watch } = useFormContext()
  const savingThrow = watch('savingThrow')
  return (
    <output data-testid="state">
      {JSON.stringify({
        dirty: formState.isDirty,
        savingThrow: savingThrow ?? null,
      })}
    </output>
  )
}

function Harness() {
  const form = useForm({ defaultValues: {}, shouldUnregister: true })
  return (
    <FormProvider {...form}>
      <StateProbe />
      <FormItems items={[field]} idPrefix="test" />
    </FormProvider>
  )
}

function state() {
  return JSON.parse(screen.getByTestId('state').textContent ?? '{}') as {
    dirty: boolean
    savingThrow: unknown
  }
}

describe('group optionalDisclosure', () => {
  it('opens without writing a value and clears the object on remove', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    expect(state()).toEqual({ dirty: false, savingThrow: null })
    await user.click(screen.getByRole('button', { name: 'Add saving throw' }))
    expect(screen.getByRole('group', { name: /Saving throw/ })).toBeInTheDocument()
    expect(document.querySelector('[data-field-separator]')).toBeTruthy()
    expect(screen.getByRole('textbox', { name: 'Failure' })).toBeInTheDocument()
    expect(state()).toEqual({ dirty: false, savingThrow: null })

    await user.type(screen.getByRole('textbox', { name: 'Failure' }), 'Half damage')
    await waitFor(() => {
      expect(state().dirty).toBe(true)
    })

    await user.click(screen.getByRole('button', { name: 'Remove saving throw Saving throw' }))
    await waitFor(() => {
      expect(state()).toEqual({ dirty: true, savingThrow: null })
    })
  })
})
