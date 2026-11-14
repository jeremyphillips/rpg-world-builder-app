import { describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'

import { FormItems } from '../../../containers/form-items.client'
import type { FormItem } from '../../../field-config'

function Harness({
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

describe('FormItems combobox optionalDisclosure', () => {
  it('renders an add control for an empty multi combobox', async () => {
    const user = userEvent.setup()
    render(
      <Harness
        items={[
          {
            type: 'combobox',
            name: 'creatureFamilyIds',
            label: 'Creature families',
            multiple: true,
            options: [{ value: 'demon', label: 'Demon' }],
            optionalDisclosure: { addLabel: 'Add families', removeLabel: 'Remove families' },
          },
        ]}
      />,
    )
    expect(screen.getByRole('button', { name: 'Add families' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Add families' }))
    expect(screen.getByRole('combobox', { name: 'Creature families' })).toBeInTheDocument()
  })

  it('expands populated multi values and clears on remove', async () => {
    const user = userEvent.setup()
    render(
      <Harness
        defaultValues={{ creatureFamilyIds: ['demon'] }}
        items={[
          {
            type: 'combobox',
            name: 'creatureFamilyIds',
            label: 'Creature families',
            multiple: true,
            options: [{ value: 'demon', label: 'Demon' }],
            optionalDisclosure: { addLabel: 'Add families', removeLabel: 'Remove families' },
          },
        ]}
      />,
    )
    expect(screen.getByRole('combobox', { name: 'Creature families' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Remove families Creature families' }))
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Add families' })).toBeInTheDocument()
    })
  })
})
