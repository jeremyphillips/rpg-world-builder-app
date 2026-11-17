import { describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'

import { FormItems } from '../../../containers/form-items.client'
import type { FormItem } from '../../../field-config'

function SelectDisclosureHarness({
  items,
  defaultValues = {},
}: {
  items: FormItem[]
  defaultValues?: Record<string, unknown>
}) {
  const form = useForm({ defaultValues })
  return (
    <FormProvider {...form}>
      <FormItems items={items} idPrefix="test" />
    </FormProvider>
  )
}

describe('FormItems select optionalDisclosure', () => {
  it('renders an add control when the select value is empty', () => {
    render(
      <SelectDisclosureHarness
        items={[
          {
            type: 'select',
            name: 'functionOverride',
            label: 'Function override',
            options: [
              { value: 'care', label: 'Care' },
              { value: 'lodging', label: 'Lodging' },
            ],
            optionalDisclosure: {
              intent: 'add',
              addLabel: 'Add function override',
              removeLabel: 'Remove function override',
            },
          },
        ]}
      />,
    )

    expect(screen.getByRole('button', { name: 'Add function override' })).toBeInTheDocument()
    expect(screen.queryByLabelText('Function override')).not.toBeInTheDocument()
  })

  it('expands populated values and clears them on remove', async () => {
    const user = userEvent.setup()

    render(
      <SelectDisclosureHarness
        defaultValues={{ functionOverride: 'care' }}
        items={[
          {
            type: 'select',
            name: 'functionOverride',
            label: 'Function override',
            options: [
              { value: 'care', label: 'Care' },
              { value: 'lodging', label: 'Lodging' },
            ],
            optionalDisclosure: {
              intent: 'add',
              addLabel: 'Add function override',
              removeLabel: 'Remove function override',
            },
          },
        ]}
      />,
    )

    expect(screen.getByLabelText('Function override')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Remove function override' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Remove function override' }))

    expect(screen.getByRole('button', { name: 'Add function override' })).toBeInTheDocument()
  })

  it('opens on add and shows the select control', async () => {
    const user = userEvent.setup()

    render(
      <SelectDisclosureHarness
        items={[
          {
            type: 'select',
            name: 'functionOverride',
            label: 'Function override',
            options: [{ value: 'care', label: 'Care' }],
            optionalDisclosure: {
              intent: 'add',
              addLabel: 'Add function override',
              removeLabel: 'Remove function override',
            },
          },
        ]}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Add function override' }))

    expect(screen.getByLabelText('Function override')).toBeInTheDocument()
  })

  it('prompts before removing populated select values when confirmBeforeClear is set', async () => {
    const user = userEvent.setup()

    render(
      <SelectDisclosureHarness
        defaultValues={{ functionOverride: 'care' }}
        items={[
          {
            type: 'select',
            name: 'functionOverride',
            label: 'Function override',
            options: [
              { value: 'care', label: 'Care' },
              { value: 'lodging', label: 'Lodging' },
            ],
            optionalDisclosure: {
              intent: 'add',
              addLabel: 'Add function override',
              removeLabel: 'Remove function override',
              confirmBeforeClear: {
                headline: 'Remove function override?',
                description: 'This will clear the selected override.',
                confirmLabel: 'Remove',
              },
            },
          },
        ]}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Remove function override' }))

    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
    expect(screen.getByLabelText('Function override')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Remove' }))

    expect(screen.getByRole('button', { name: 'Add function override' })).toBeInTheDocument()
  })

  it('aligns an open disclosure control with a sibling select', () => {
    const { container } = render(
      <SelectDisclosureHarness
        defaultValues={{ castAtLevel: '4' }}
        items={[
          {
            kind: 'row',
            fields: [
              {
                type: 'select',
                name: 'frequency',
                label: 'Frequency',
                labelVisibility: 'srOnly',
                width: '1/2',
                options: [{ value: 'at-will', label: 'At will' }],
                defaultValue: 'at-will',
              },
              {
                type: 'select',
                name: 'castAtLevel',
                label: 'Cast at level',
                width: '1/2',
                options: [{ value: '4', label: '4th' }],
                optionalDisclosure: { intent: 'add', addLabel: 'Cast at a higher level' },
              },
            ],
          },
        ]}
      />,
    )

    const frequency = screen.getByRole('combobox', { name: 'Frequency' })
    const cast = screen.getByRole('combobox', { name: 'Cast at level' })
    const participants = [...container.querySelectorAll('[data-field-row-participant]')]
    const controlRegionFor = (control: HTMLElement) =>
      participants.find((participant) =>
        participant.querySelector(':scope > [data-field-control-region]')?.contains(control),
      )

    expect(participants).toHaveLength(2)
    expect(controlRegionFor(frequency)).toBeTruthy()
    expect(controlRegionFor(cast)).toBeTruthy()
    const castParticipant = controlRegionFor(cast)!
    const labelRegion = castParticipant.querySelector('[data-field-label-region]')
    expect(labelRegion?.querySelector('[aria-hidden]')).toHaveTextContent('Cast at level')
    expect(labelRegion).toContainElement(
      screen.getByRole('button', { name: 'Remove Cast at level' }),
    )
  })

  it('keeps a populated optional select expanded after remount', () => {
    const items = [
      {
        type: 'select',
        name: 'followUpActionId',
        label: 'Attack on a miss',
        options: [
          { value: 'rapier', label: 'Rapier' },
          { value: 'claw', label: 'Claw' },
        ],
        optionalDisclosure: {
          intent: 'add',
          addLabel: 'Add attack on a miss',
          removeLabel: 'Remove attack on a miss',
        },
      },
    ] as const satisfies FormItem[]

    const { unmount } = render(
      <SelectDisclosureHarness defaultValues={{ followUpActionId: 'rapier' }} items={[...items]} />,
    )
    expect(screen.getByRole('combobox', { name: 'Attack on a miss' })).toBeInTheDocument()

    unmount()
    render(
      <SelectDisclosureHarness defaultValues={{ followUpActionId: 'rapier' }} items={[...items]} />,
    )
    expect(screen.getByRole('combobox', { name: 'Attack on a miss' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Remove attack on a miss' })).toBeInTheDocument()
  })

  it('clears a populated optional select to an empty value on remove', async () => {
    const user = userEvent.setup()
    const items = [
      {
        type: 'select',
        name: 'followUpActionId',
        label: 'Attack on a miss',
        options: [{ value: 'rapier', label: 'Rapier' }],
        optionalDisclosure: {
          intent: 'add',
          addLabel: 'Add attack on a miss',
          removeLabel: 'Remove attack on a miss',
        },
      },
    ] as const satisfies FormItem[]

    function ValueProbe() {
      const { watch } = useFormContext()
      return (
        <output data-testid="value">{JSON.stringify(watch('followUpActionId') ?? null)}</output>
      )
    }

    function Harness() {
      const form = useForm({ defaultValues: { followUpActionId: 'rapier' } })
      return (
        <FormProvider {...form}>
          <ValueProbe />
          <FormItems items={[...items]} idPrefix="test" />
        </FormProvider>
      )
    }

    render(<Harness />)

    await user.click(screen.getByRole('button', { name: 'Remove attack on a miss' }))
    await waitFor(() => {
      const stored = screen.getByTestId('value').textContent
      expect(stored === 'null' || stored === '""').toBe(true)
    })
    expect(screen.getByRole('button', { name: 'Add attack on a miss' })).toBeInTheDocument()
  })
})
