import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm, type Control, type FieldValues } from 'react-hook-form'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { FieldGroup } from './field-group'

type Values = {
  available: boolean
  visibilityMode: string
}

function SummaryDisclosureHarness({
  defaultValues = { available: true, visibilityMode: 'all_players' },
}: {
  defaultValues?: Values
}) {
  const form = useForm<Values>({ defaultValues })

  return (
    <FormProvider {...form}>
      <FieldGroup
        id="access"
        legend="Campaign availability"
        legendSize="array"
        formControl={form.control as unknown as Control<FieldValues>}
        fieldsChrome={{
          variant: 'summaryDisclosure',
          defaultOpen: false,
          resolveSummary: (values) => ({
            primary: values.available ? `Available · ${values.visibilityMode}` : 'Unavailable',
            secondary: values.available
              ? undefined
              : 'This content cannot be discovered or selected in this campaign.',
          }),
          summaryDependsOn: ['available', 'visibilityMode'],
        }}
      >
        <div>Expanded fields</div>
      </FieldGroup>
    </FormProvider>
  )
}

describe('FieldGroup summaryDisclosure chrome', () => {
  it('renders collapsed summary and opens from Change', async () => {
    const user = userEvent.setup()
    render(<SummaryDisclosureHarness />)

    expect(screen.getByText('Campaign availability')).toBeInTheDocument()
    expect(screen.getByText('Available · all_players')).toBeInTheDocument()
    expect(screen.getByText('Expanded fields')).not.toBeVisible()

    await user.click(screen.getByRole('button', { name: 'Change' }))
    expect(screen.getByText('Expanded fields')).toBeVisible()
  })

  it('shows unavailable secondary copy when collapsed', () => {
    render(
      <SummaryDisclosureHarness defaultValues={{ available: false, visibilityMode: 'dm_only' }} />,
    )

    expect(screen.getByText('Unavailable')).toBeInTheDocument()
    expect(
      screen.getByText('This content cannot be discovered or selected in this campaign.'),
    ).toBeInTheDocument()
  })

  it('closes from Done', async () => {
    const user = userEvent.setup()
    render(<SummaryDisclosureHarness />)

    await user.click(screen.getByRole('button', { name: 'Change' }))
    await user.click(screen.getByRole('button', { name: 'Done' }))

    expect(screen.getByText('Expanded fields')).not.toBeVisible()
  })

  it('has no accessibility violations when collapsed', async () => {
    const { container } = render(<SummaryDisclosureHarness />)
    await expectNoAxeViolations(container)
  })

  it('has no accessibility violations when expanded', async () => {
    const user = userEvent.setup()
    const { container } = render(<SummaryDisclosureHarness />)
    await user.click(screen.getByRole('button', { name: 'Change' }))
    await expectNoAxeViolations(container)
  })
})
