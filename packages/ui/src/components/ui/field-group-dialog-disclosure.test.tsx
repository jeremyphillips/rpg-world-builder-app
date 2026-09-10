import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm, type Control, type FieldValues } from 'react-hook-form'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { FieldGroup } from './field-group'

type Values = {
  available: boolean
}

function DialogDisclosureHarness({
  hint = 'Controls where this content can be discovered and used.',
}: {
  hint?: string
}) {
  const form = useForm<Values>({ defaultValues: { available: true } })

  return (
    <FormProvider {...form}>
      <FieldGroup
        id="access-dialog"
        legend="Campaign availability"
        formControl={form.control as unknown as Control<FieldValues>}
        disclosure={{
          variant: 'dialog',
          hint,
          dialogHeadline: 'Campaign availability',
          resolveSummary: (values) => ({
            status: {
              label: values.available ? 'Available' : 'Unavailable',
              tone: values.available ? 'success' : 'warning',
              indicator: values.available ? 'dot' : 'inactive',
            },
            detail: 'All players',
          }),
        }}
      >
        <div>Dialog editor fields</div>
      </FieldGroup>
    </FormProvider>
  )
}

describe('FieldGroup dialog disclosure', () => {
  it('opens the editor in a modal', async () => {
    const user = userEvent.setup()
    render(<DialogDisclosureHarness />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    const trigger = screen.getByRole('button', { name: 'Campaign availability' })
    expect(trigger).toHaveAttribute('aria-labelledby')
    expect(trigger).toHaveAttribute('aria-describedby')
    expect(screen.queryByRole('button', { name: 'Change' })).not.toBeInTheDocument()

    await user.click(trigger)

    expect(screen.getByRole('dialog', { name: 'Campaign availability' })).toBeInTheDocument()
    expect(screen.getByText('Dialog editor fields')).toBeVisible()
  })

  it('dismisses the modal from the footer Done action', async () => {
    const user = userEvent.setup()
    render(<DialogDisclosureHarness />)

    await user.click(screen.getByRole('button', { name: 'Campaign availability' }))

    const done = screen.getByRole('button', { name: 'Done' })
    expect(screen.getByRole('dialog')).toContainElement(done)

    await user.click(done)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  itAxe('has no axe violations for labelledby/describedby trigger wiring', async () => {
    const { container } = render(<DialogDisclosureHarness />)
    await expectNoAxeViolations(container)

    const trigger = screen.getByRole('button', { name: 'Campaign availability' })
    expect(trigger).toHaveAttribute('aria-labelledby')
    expect(
      document.getElementById(trigger.getAttribute('aria-labelledby') ?? ''),
    ).toHaveTextContent('Campaign availability')
    expect(document.getElementById(trigger.getAttribute('aria-labelledby') ?? '')?.tagName).toBe(
      'SPAN',
    )
  })
})
