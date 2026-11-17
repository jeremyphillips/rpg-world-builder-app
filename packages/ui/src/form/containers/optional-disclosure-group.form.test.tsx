import { describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'

import { FormItems } from './form-items.client'
import { FormRhythmStack, FormSectionContext } from '../context/form-section.context'
import { DEFAULT_FORM_DENSITY } from '../form-density'
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

  it('opens when watchPaths have content and clears them on remove', async () => {
    const user = userEvent.setup()
    const watched = {
      kind: 'group',
      name: 'wrapper',
      heading: { label: 'Wrapper' },
      separator: 'subtle',
      optionalDisclosure: {
        addLabel: 'Add tags',
        removeLabel: 'Remove',
        watchPaths: ['tags', 'roles'],
        clearPaths: ['tags', 'roles'],
      },
      fields: [
        { type: 'text', name: 'tags', label: 'Tags' },
        { type: 'text', name: 'roles', label: 'Roles' },
      ],
    } as const satisfies FormItem
    function WatchHarness({ defaultValues }: { defaultValues?: Record<string, unknown> }) {
      const form = useForm({ defaultValues, shouldUnregister: true })
      return (
        <FormProvider {...form}>
          <FormItems items={[watched]} idPrefix="watch" />
        </FormProvider>
      )
    }
    render(<WatchHarness defaultValues={{ tags: ['demon'] }} />)
    expect(screen.getByText('Tags')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Remove Wrapper' }))
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Add tags' })).toBeInTheDocument()
    })
  })

  it('applies headingScale field on open optional disclosure groups', async () => {
    const user = userEvent.setup()
    const movementGroup = {
      kind: 'group',
      name: 'movementOverride',
      heading: { label: 'Movement' },
      headingScale: 'field',
      optionalDisclosure: {
        addLabel: 'Override movement',
        removeLabel: 'Remove',
        labeled: true,
      },
      fields: [{ type: 'text', name: 'walk', label: 'Walk' }],
    } as const satisfies FormItem
    function MovementHarness() {
      const form = useForm({ defaultValues: {}, shouldUnregister: true })
      return (
        <FormProvider {...form}>
          <FormItems items={[movementGroup]} idPrefix="movement" />
        </FormProvider>
      )
    }
    render(<MovementHarness />)
    const addButton = screen.getByRole('button', { name: 'Override movement' })
    expect(addButton).toHaveClass('ui-button__text--xs')
    await user.click(addButton)
    expect(screen.getByRole('group', { name: /Movement/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Remove Movement' })).toHaveClass(
      'ui-button__text--xs',
    )
    const movementLabel = screen
      .getByText('Movement')
      .closest('span.text-style-field-label-sm, span.text-style-field-label-md')
    expect(movementLabel).toHaveClass('text-style-field-label-md')
    expect(movementLabel?.className).not.toMatch(/text-style-field-legend/)
  })

  it('keeps open and closed optional groups free of fieldset trailing margin in rhythm stacks', async () => {
    const user = userEvent.setup()
    const rhythmField = {
      kind: 'group',
      name: 'movementOverride',
      heading: { label: 'Movement' },
      optionalDisclosure: {
        addLabel: 'Override movement',
        removeLabel: 'Remove',
      },
      fields: [
        { type: 'text', name: 'walk', label: 'Walk' },
        { type: 'text', name: 'hover', label: 'Hover' },
      ],
    } as const satisfies FormItem

    function RhythmHarness() {
      const form = useForm({ defaultValues: {}, shouldUnregister: true })
      return (
        <FormProvider {...form}>
          <FormSectionContext.Provider
            value={{
              depth: 1,
              namedGroupDepth: 1,
              density: DEFAULT_FORM_DENSITY,
              inGroup: true,
            }}
          >
            <FormRhythmStack>
              <FormItems
                items={[rhythmField, { type: 'text', name: 'notes', label: 'Notes' }]}
                idPrefix="rhythm"
              />
            </FormRhythmStack>
          </FormSectionContext.Provider>
        </FormProvider>
      )
    }

    render(<RhythmHarness />)
    expect(screen.getByRole('button', { name: 'Override movement' })).not.toHaveClass('mb-8')
    await user.click(screen.getByRole('button', { name: 'Override movement' }))
    const movementGroup = screen.getByRole('group', { name: /Movement/ })
    expect(movementGroup).not.toHaveClass('mb-8')
    await user.click(screen.getByRole('button', { name: 'Remove Movement' }))
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Override movement' })).toBeInTheDocument()
    })
    expect(screen.queryByRole('group', { name: /Movement/ })).not.toBeInTheDocument()
  })

  it('writes seedWhen when the group opens', async () => {
    const user = userEvent.setup()
    const seeded = {
      ...field,
      optionalDisclosure: { addLabel: 'Add saving throw', seedWhen: () => ({ withinFeet: 10 }) },
    } as const satisfies FormItem
    function SeedHarness() {
      const form = useForm({ defaultValues: {}, shouldUnregister: true })
      return (
        <FormProvider {...form}>
          <StateProbe />
          <FormItems items={[seeded]} idPrefix="seed" />
        </FormProvider>
      )
    }
    render(<SeedHarness />)
    await user.click(screen.getByRole('button', { name: 'Add saving throw' }))
    await waitFor(() => {
      expect(state().savingThrow).toEqual({ withinFeet: 10 })
    })
  })
})
