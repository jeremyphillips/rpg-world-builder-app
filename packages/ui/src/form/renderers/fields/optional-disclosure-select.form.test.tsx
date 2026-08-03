import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'

import { FormItems } from '../../containers/form-items.client'
import type { FormItem } from '../../field-config'

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
              addLabel: 'Add function override',
              removeLabel: 'Remove function override',
            },
          },
        ]}
      />,
    )

    expect(screen.getByLabelText('Function override')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Remove function override Function override' }),
    ).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: 'Remove function override Function override' }),
    )

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
})
