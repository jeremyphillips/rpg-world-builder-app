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
        disclosure={{
          variant: 'summary',
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

function SummaryDisclosureNoPanelDividerHarness() {
  const form = useForm<Values>({
    defaultValues: { available: true, visibilityMode: 'all_players' },
  })

  return (
    <FormProvider {...form}>
      <FieldGroup
        id="access-plain"
        legend="Campaign availability"
        formControl={form.control as unknown as Control<FieldValues>}
        disclosure={{
          variant: 'summary',
          defaultOpen: true,
          panelDivider: false,
          resolveSummary: () => ({ primary: 'Available' }),
        }}
      >
        <div>Expanded fields</div>
      </FieldGroup>
    </FormProvider>
  )
}

describe('FieldGroup summary disclosure', () => {
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

  it('renders panel top divider by default when expanded', async () => {
    const user = userEvent.setup()
    const { container } = render(<SummaryDisclosureHarness />)

    await user.click(screen.getByRole('button', { name: 'Change' }))

    const panel = container.querySelector('#access-panel')
    expect(panel).toHaveClass('border-t', 'border-border', 'pt-3')
  })

  it('omits panel top divider when panelDivider is false', () => {
    const { container } = render(<SummaryDisclosureNoPanelDividerHarness />)

    const panel = container.querySelector('#access-plain-panel')
    expect(panel).not.toHaveClass('border-t')
    expect(panel).toHaveClass('pt-3')
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
