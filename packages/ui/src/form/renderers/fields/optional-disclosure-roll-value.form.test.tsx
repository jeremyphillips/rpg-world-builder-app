import { describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'

import { FormItems } from '../../containers/form-items.client'
import { buildDefaultValues, type FormItem } from '../../field-config'

const disclosure = {
  labeled: true,
  addLabel: 'Override',
  removeLabel: 'Use weapon default',
  summary: {
    dependsOn: ['source'],
    resolve: (_values: Record<string, unknown>, state: { open: boolean }) =>
      state.open ? 'Replacing 1d6' : 'Using 1d6',
  },
  seedWhen: () => ({ dice: { count: 2, faces: 6 } }),
} as const

const field = {
  type: 'rollValue',
  name: 'damage',
  label: 'Base damage override',
  optionalDisclosure: disclosure,
} as const satisfies FormItem

function StateProbe() {
  const { formState, watch } = useFormContext()
  const damage = watch('damage')
  return (
    <output data-testid="state">
      {JSON.stringify({
        dirty: formState.isDirty,
        dirtyFields: formState.dirtyFields,
        damage: damage ?? null,
      })}
    </output>
  )
}

function Harness({
  items,
  defaultValues = {},
}: {
  items: FormItem[]
  defaultValues?: Record<string, unknown>
}) {
  const form = useForm({ defaultValues, shouldUnregister: true })
  return (
    <FormProvider {...form}>
      <StateProbe />
      <FormItems items={items} idPrefix="test" />
    </FormProvider>
  )
}

function state() {
  return JSON.parse(screen.getByTestId('state').textContent ?? '{}') as {
    dirty: boolean
    dirtyFields: Record<string, unknown>
    damage: unknown
  }
}

describe('rollValue optionalDisclosure', () => {
  it('does not seed dice defaults while the override is absent', () => {
    expect(buildDefaultValues([field])).toEqual({})
    expect(
      buildDefaultValues([
        {
          type: 'rollValue',
          name: 'damage',
          label: 'Damage roll',
        },
      ]),
    ).toEqual({})
  })

  it('seeds on add and returns to a clean absent value on remove', async () => {
    const user = userEvent.setup()
    render(<Harness items={[field]} />)

    expect(screen.getByText('Base damage override')).toBeInTheDocument()
    expect(screen.getByText('Using 1d6')).toBeInTheDocument()
    expect(screen.queryByLabelText('Number of dice')).not.toBeInTheDocument()
    expect(state()).toMatchObject({ dirty: false, damage: null })

    await user.click(screen.getByRole('button', { name: 'Override' }))

    expect(screen.getByLabelText('Number of dice')).toHaveValue(2)
    expect(screen.getByText('Replacing 1d6')).toBeInTheDocument()
    expect(state()).toMatchObject({
      dirty: true,
      damage: { dice: { count: 2, faces: 6 } },
    })

    await user.click(
      screen.getByRole('button', { name: 'Use weapon default Base damage override' }),
    )

    expect(screen.getByRole('button', { name: 'Override' })).toBeEnabled()
    expect(screen.queryByLabelText('Number of dice')).not.toBeInTheDocument()
    await waitFor(() => {
      expect(state()).toMatchObject({ dirtyFields: {}, damage: null })
    })
  })

  it('stays open when a stored roll is only partly filled', () => {
    render(<Harness defaultValues={{ damage: { dice: { count: 2 } } }} items={[field]} />)

    expect(
      screen.getByRole('button', { name: 'Use weapon default Base damage override' }),
    ).toBeInTheDocument()
    expect(state()).toMatchObject({ damage: { dice: { count: 2 } } })
  })

  it('keeps a flat-only roll flat', () => {
    render(
      <Harness defaultValues={{ damage: { flatOperator: '+', flatAmount: 1 } }} items={[field]} />,
    )

    expect(screen.getByLabelText('Flat modifier value')).toHaveValue(1)
    expect(screen.queryByLabelText('Number of dice')).not.toBeInTheDocument()
  })

  it('does not seed when add is disabled', async () => {
    const user = userEvent.setup()
    render(
      <Harness
        items={[
          {
            ...field,
            optionalDisclosure: { ...disclosure, addDisabled: true },
          },
        ]}
      />,
    )

    const add = screen.getByRole('button', { name: 'Override' })
    expect(add).toBeDisabled()
    await user.click(add)
    expect(state()).toMatchObject({ dirty: false, damage: null })
  })

  it('marks removal dirty when the override was loaded', async () => {
    const user = userEvent.setup()
    render(
      <Harness defaultValues={{ damage: { dice: { count: 2, faces: 10 } } }} items={[field]} />,
    )

    expect(state().dirtyFields).toEqual({})
    await user.click(
      screen.getByRole('button', { name: 'Use weapon default Base damage override' }),
    )
    await waitFor(() => {
      expect(state().damage).toBeNull()
      expect(state().dirtyFields).not.toEqual({})
    })
  })
})
