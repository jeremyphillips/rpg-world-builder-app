import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'
import { describe, expect, it } from 'vitest'

import { FormItems } from '../../containers/form-items.client'
import type { FormItem } from '../../field-config'

const speechField = {
  type: 'boolean',
  name: 'speechRestricted',
  label: 'Cannot speak',
} as const satisfies FormItem

function Harness() {
  const form = useForm({
    defaultValues: { speechRestricted: false },
  })
  return (
    <FormProvider {...form}>
      <FormItems items={[speechField]} idPrefix="test" />
    </FormProvider>
  )
}

describe('boolean field', () => {
  it('renders a plain checkbox option and toggles form state', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    const control = screen.getByRole('checkbox', { name: 'Cannot speak' })
    expect(control.closest('.ui-checkbox-option')).toBeNull()
    expect(screen.getByText('Cannot speak')).toHaveClass('text-style-option')

    await user.click(control)
    expect(control).toBeChecked()
  })
})
