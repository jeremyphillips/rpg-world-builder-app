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

function StructuredStatusDisclosureHarness({
  defaultValues = { available: true, visibilityMode: 'dm_only' },
}: {
  defaultValues?: Values
}) {
  const form = useForm<Values>({ defaultValues })

  return (
    <FormProvider {...form}>
      <FieldGroup
        id="access-status"
        legend="Campaign availability"
        legendSize="array"
        formControl={form.control as unknown as Control<FieldValues>}
        disclosure={{
          variant: 'summary',
          defaultOpen: false,
          resolveSummary: (values) => {
            if (!values.available) {
              return {
                status: { label: 'Unavailable', tone: 'warning', indicator: 'inactive' },
                detail: 'DM only',
                secondary: 'Hidden from discovery and selection in this campaign.',
                chrome: { variant: 'accent', tone: 'warning', emphasis: 'faint' },
              }
            }

            return {
              status: { label: 'Available', tone: 'success', indicator: 'dot' },
              detail: 'DM only',
            }
          },
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

function CompactSummaryDisclosureHarness() {
  const form = useForm<Values>({ defaultValues: { available: true, visibilityMode: 'dm_only' } })

  return (
    <FormProvider {...form}>
      <FieldGroup
        id="access-compact"
        legend="Campaign availability"
        size="sm"
        formControl={form.control as unknown as Control<FieldValues>}
        disclosure={{
          variant: 'summary',
          defaultOpen: false,
          resolveSummary: () => ({
            status: { label: 'Available', tone: 'success', indicator: 'dot' },
            detail: 'DM only',
          }),
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

  it('renders structured status row with indicator and detail', () => {
    const { container } = render(<StructuredStatusDisclosureHarness />)

    expect(screen.getByText('Available')).toBeInTheDocument()
    expect(screen.getByText('DM only')).toBeInTheDocument()
    expect(container.querySelector('[aria-hidden].rounded-full')).toBeInTheDocument()
  })

  it('applies accent chrome for unavailable structured status', () => {
    const { container } = render(
      <StructuredStatusDisclosureHarness
        defaultValues={{ available: false, visibilityMode: 'dm_only' }}
      />,
    )

    const chromeShell = container.querySelector('[data-summary-chrome]')
    expect(chromeShell).toBeInTheDocument()
    expect(chromeShell).toHaveClass('bg-warning-faint')
    expect(chromeShell).toHaveClass('rounded-tl-none', 'rounded-bl-none')
    expect(chromeShell).not.toHaveClass('bg-warning-subtle')

    const unavailableLabel = screen.getByText('Unavailable')
    expect(unavailableLabel).toHaveClass('text-semantic-warning')

    const secondary = screen.getByText('Hidden from discovery and selection in this campaign.')
    expect(secondary).toHaveClass('text-muted-foreground')
    expect(secondary).not.toHaveClass('text-semantic-warning')

    expect(screen.getByText('DM only')).toBeInTheDocument()
    expect(container.querySelector('[aria-hidden].lucide-circle-slash')).toBeInTheDocument()
  })

  it('marks decorative status indicators as aria-hidden', () => {
    const { container } = render(<StructuredStatusDisclosureHarness />)

    const dot = container.querySelector('[aria-hidden].rounded-full')
    expect(dot).toBeInTheDocument()
    expect(dot).toHaveAttribute('aria-hidden', 'true')
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

  it('has no accessibility violations for structured status row', async () => {
    const { container } = render(<StructuredStatusDisclosureHarness />)
    await expectNoAxeViolations(container)
  })

  it('uses compact field label scale for summary chrome when size is sm', () => {
    render(<CompactSummaryDisclosureHarness />)

    expect(screen.getByText('Campaign availability')).toHaveClass('text-xs')
    expect(screen.getByText('Available')).toHaveClass('text-xs')
  })
})
