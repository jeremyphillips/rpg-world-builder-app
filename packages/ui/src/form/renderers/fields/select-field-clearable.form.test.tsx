import { describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'

import { FormItems } from '../../containers/form-items.client'
import type { FormItem } from '../../field-config'

function SelectHarness({
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

describe('FormItems select clearable', () => {
  it('clears a populated optional select to undefined', async () => {
    const user = userEvent.setup()
    render(
      <SelectHarness
        defaultValues={{ organizationForm: 'guild' }}
        items={[
          {
            type: 'select',
            name: 'organizationForm',
            label: 'Form',
            clearable: true,
            clearAccessibleName: 'Clear Form',
            options: [
              { value: 'guild', label: 'Guild' },
              { value: 'order', label: 'Order' },
            ],
          },
        ]}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Clear Form' }))
    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: 'Form' })).not.toHaveTextContent(/Guild/i)
      expect(screen.getByRole('combobox', { name: 'Form' })).toHaveFocus()
    })
  })
})
