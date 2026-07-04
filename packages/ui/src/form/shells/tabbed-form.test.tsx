import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'
import { describe, it, expect, vi } from 'vitest'
import { z } from 'zod'

import { TabbedForm } from './tabbed-form.client'
import type { TabbedFormTab } from './tabbed-form.client'
import { submitAndExpectPayload } from '../test-utils'
import {
  formStickyActionsBarTransparentClasses,
  formStickyTabsTransparentClasses,
} from '../chrome/form-chrome.variants'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  level: z.number().int().min(1).max(25),
  mood: z.array(z.string()).optional(),
})

type TestValues = z.infer<typeof schema>

const tabs: TabbedFormTab[] = [
  {
    id: 'identity',
    label: 'Identity',
    fields: [{ type: 'text', name: 'name', label: 'Campaign name', required: true }],
  },
  {
    id: 'rules',
    label: 'Rules',
    fields: [
      { type: 'number', name: 'level', label: 'Starting level', min: 1, max: 25, defaultValue: 1 },
    ],
  },
  {
    id: 'flavor',
    label: 'Flavor',
    fields: [
      {
        type: 'chips',
        name: 'mood',
        label: 'Mood',
        multiple: true,
        options: [
          { value: 'heroic', label: 'Heroic' },
          { value: 'dark_fantasy', label: 'Dark Fantasy' },
        ],
      },
    ],
  },
]

describe('TabbedForm', () => {
  it('renders all tab triggers', () => {
    render(<TabbedForm<TestValues> schema={schema} tabs={tabs} onSubmit={vi.fn()} />)
    expect(screen.getByRole('tab', { name: 'Identity' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Rules' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Flavor' })).toBeInTheDocument()
  })

  it('shows the first tab panel by default', () => {
    render(<TabbedForm<TestValues> schema={schema} tabs={tabs} onSubmit={vi.fn()} />)
    expect(screen.getByRole('textbox', { name: /Campaign name/i })).toBeInTheDocument()
  })

  it('switches tabs on click', async () => {
    render(<TabbedForm<TestValues> schema={schema} tabs={tabs} onSubmit={vi.fn()} />)
    await userEvent.click(screen.getByRole('tab', { name: 'Rules' }))
    expect(screen.getByLabelText('Starting level')).toBeInTheDocument()
  })

  it('renders a form-level error in the sticky actions bar', () => {
    render(
      <TabbedForm<TestValues>
        schema={schema}
        tabs={tabs}
        onSubmit={vi.fn()}
        formError="Something went wrong."
      />,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong.')
    expect(screen.getByRole('toolbar', { name: 'Form actions' })).toBeInTheDocument()
  })

  it('renders a custom footer', () => {
    render(
      <TabbedForm<TestValues>
        schema={schema}
        tabs={tabs}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save changes</button>}
      />,
    )
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeInTheDocument()
  })

  it('calls onSubmit with valid values', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(
      <TabbedForm<TestValues>
        schema={schema}
        tabs={tabs}
        onSubmit={onSubmit}
        defaultValues={{ name: '', level: 1 }}
        footer={<button type="submit">Save</button>}
      />,
    )
    await user.type(screen.getByRole('textbox', { name: /Campaign name/i }), 'The Sunless Citadel')
    await submitAndExpectPayload(
      user,
      onSubmit,
      { name: 'The Sunless Citadel' },
      { match: 'object' },
    )
  })

  it('renders tab header content above fields', async () => {
    const tabsWithHeader: TabbedFormTab[] = [
      ...tabs,
      {
        id: 'notes',
        label: 'Notes',
        fields: [],
        header: <p>Notes are managed elsewhere.</p>,
      },
    ]
    render(<TabbedForm<TestValues> schema={schema} tabs={tabsWithHeader} onSubmit={vi.fn()} />)
    await userEvent.click(screen.getByRole('tab', { name: 'Notes' }))
    expect(screen.getByText('Notes are managed elsewhere.')).toBeInTheDocument()
  })

  it('applies sticky chrome when enabled', () => {
    render(
      <TabbedForm<TestValues>
        schema={schema}
        tabs={tabs}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save changes</button>}
      />,
    )

    const tablist = screen.getByRole('tablist')
    expect(tablist.parentElement).toHaveClass('sticky')
    expect(screen.getByRole('toolbar', { name: 'Form actions' })).toHaveClass('sticky')
  })

  it('merges stickyTabsClassName and stickyActionsBarClassName onto sticky chrome', () => {
    render(
      <TabbedForm<TestValues>
        schema={schema}
        tabs={tabs}
        onSubmit={vi.fn()}
        stickyTabsClassName={formStickyTabsTransparentClasses}
        stickyActionsBarClassName={formStickyActionsBarTransparentClasses}
        footer={<button type="submit">Save changes</button>}
      />,
    )

    const tablist = screen.getByRole('tablist')
    expect(tablist.parentElement).toHaveClass('sticky', 'bg-transparent')
    expect(tablist.parentElement).not.toHaveClass('bg-background')
    expect(screen.getByRole('toolbar', { name: 'Form actions' })).toHaveClass('bg-transparent')
  })

  it('renders a flat layout when stickyChrome is false', () => {
    render(
      <TabbedForm<TestValues>
        schema={schema}
        tabs={tabs}
        onSubmit={vi.fn()}
        stickyChrome={false}
        formError="Something went wrong."
        footer={<button type="submit">Save changes</button>}
      />,
    )

    const tablist = screen.getByRole('tablist')
    expect(tablist.parentElement).not.toHaveClass('sticky')
    expect(screen.queryByRole('toolbar', { name: 'Form actions' })).not.toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong.')
  })

  it('renders footer via footerWrapper instead of the sticky actions bar', () => {
    render(
      <TabbedForm<TestValues>
        schema={schema}
        tabs={tabs}
        onSubmit={vi.fn()}
        formError="Something went wrong."
        footer={<button type="submit">Save changes</button>}
        footerWrapper={({ footer, formError }) => (
          <footer data-testid="external-footer">
            {formError ? <p role="alert">{formError}</p> : null}
            {footer}
          </footer>
        )}
      />,
    )

    expect(screen.queryByRole('toolbar', { name: 'Form actions' })).not.toBeInTheDocument()
    expect(screen.getByTestId('external-footer')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong.')
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeInTheDocument()
  })

  it('wraps tab content with contentWrapper', () => {
    render(
      <TabbedForm<TestValues>
        schema={schema}
        tabs={tabs}
        onSubmit={vi.fn()}
        contentWrapper={(content) => <section data-testid="wrapped-content">{content}</section>}
      />,
    )

    expect(screen.getByTestId('wrapped-content')).toContainElement(screen.getByRole('tablist'))
  })

  it('does not show tab issue badges before the first failed submit', () => {
    render(
      <TabbedForm<TestValues>
        schema={schema}
        tabs={tabs}
        onSubmit={vi.fn()}
        defaultValues={{ name: '', level: 1 }}
        footer={<button type="submit">Save</button>}
      />,
    )

    expect(screen.getByRole('tab', { name: 'Identity' })).toHaveTextContent('Identity')
    expect(screen.getByRole('tab', { name: 'Rules' })).toHaveTextContent('Rules')
    expect(screen.queryByText(/fields need attention/i)).not.toBeInTheDocument()
  })

  it('shows tab trigger badges with accessible names after a failed submit', async () => {
    const user = userEvent.setup()
    const validationSchema = z.object({
      name: z.string().min(1, 'Name is required'),
      notes: z.string().min(1, 'Notes are required'),
    })

    type ValidationValues = z.infer<typeof validationSchema>

    const validationTabs: TabbedFormTab[] = [
      {
        id: 'identity',
        label: 'Identity',
        fields: [{ type: 'text', name: 'name', label: 'Name', required: true }],
      },
      {
        id: 'notes',
        label: 'Notes',
        fields: [{ type: 'text', name: 'notes', label: 'Notes', required: true }],
      },
    ]

    render(
      <TabbedForm<ValidationValues>
        schema={validationSchema}
        tabs={validationTabs}
        onSubmit={vi.fn()}
        defaultValues={{ name: 'Valid name', notes: '' }}
        footer={<button type="submit">Save</button>}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(
        screen.getByRole('tab', { name: /Notes.*1 field needs attention/i }),
      ).toHaveAttribute('aria-selected', 'true')
    })
    const notesInput = screen.getByLabelText('Notes')
    expect(notesInput).toHaveFocus()
    expect(screen.getByRole('tab', { name: 'Identity' })).toHaveTextContent('Identity')
    expect(screen.getByRole('tab', { name: /Notes/ })).toHaveTextContent('1')
  })

  it('auto-switches to the first invalid tab and focuses the tab-scoped control', async () => {
    const user = userEvent.setup()
    const validationSchema = z.object({
      name: z.string().min(1, 'Name is required'),
      notes: z.string().min(1, 'Notes are required'),
    })

    type ValidationValues = z.infer<typeof validationSchema>

    const validationTabs: TabbedFormTab[] = [
      {
        id: 'identity',
        label: 'Identity',
        fields: [{ type: 'text', name: 'name', label: 'Name', required: true }],
      },
      {
        id: 'notes',
        label: 'Notes',
        fields: [{ type: 'text', name: 'notes', label: 'Notes', required: true }],
      },
    ]

    render(
      <TabbedForm<ValidationValues>
        id="campaign-form"
        schema={validationSchema}
        tabs={validationTabs}
        onSubmit={vi.fn()}
        defaultValues={{ name: 'Valid name', notes: '' }}
        footer={<button type="submit">Save</button>}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(screen.getByLabelText('Notes')).toHaveFocus()
    })
    expect(screen.getByLabelText('Notes')).toHaveAttribute('id', 'campaign-form-notes-notes')
    expect(screen.getByRole('tab', { name: /Notes/i })).toHaveAttribute('aria-selected', 'true')
  })

  it('propagates issue badges to a hidden tab after a failed submit', async () => {
    const user = userEvent.setup()
    const validationSchema = z.object({
      name: z.string().min(1, 'Name is required'),
      grants: z.array(
        z.object({
          label: z.string().min(1, 'Label is required'),
        }),
      ),
    })

    type ValidationValues = z.infer<typeof validationSchema>

    const validationTabs: TabbedFormTab[] = [
      {
        id: 'identity',
        label: 'Identity',
        fields: [{ type: 'text', name: 'name', label: 'Name', required: true }],
      },
      {
        id: 'grants',
        label: 'Grants',
        fields: [
          {
            kind: 'array',
            name: 'grants',
            legend: 'Grants',
            addLabel: 'Add grant',
            min: 1,
            itemVariant: 'detailed',
            itemCollapsible: true,
            fields: [{ type: 'text', name: 'label', label: 'Label', required: true }],
          },
        ],
      },
    ]

    render(
      <TabbedForm<ValidationValues>
        schema={validationSchema}
        tabs={validationTabs}
        onSubmit={vi.fn()}
        defaultValues={{ name: 'Valid name', grants: [{ label: '' }] }}
        footer={<button type="submit">Save</button>}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(screen.getByLabelText('Label')).toHaveAttribute('aria-invalid', 'true')
    })

    expect(screen.getByRole('tab', { name: /Grants/i })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByLabelText('Label')).toHaveFocus()

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /1 issue in Grants · Grant #1/i }),
      ).toBeInTheDocument()
    })

    expect(
      screen.getByRole('tab', { name: /Grants.*1 field needs attention/i }),
    ).toBeInTheDocument()
  })

  it('suppresses inline error text on inactive tab panels while keeping invalid chrome', async () => {
    const user = userEvent.setup()
    const validationSchema = z.object({
      name: z.string().min(1, 'Name is required'),
      notes: z.string().min(1, 'Notes are required'),
    })

    type ValidationValues = z.infer<typeof validationSchema>

    const validationTabs: TabbedFormTab[] = [
      {
        id: 'identity',
        label: 'Identity',
        fields: [{ type: 'text', name: 'name', label: 'Name', required: true }],
      },
      {
        id: 'notes',
        label: 'Notes',
        fields: [{ type: 'text', name: 'notes', label: 'Notes', required: true }],
      },
    ]

    render(
      <TabbedForm<ValidationValues>
        schema={validationSchema}
        tabs={validationTabs}
        onSubmit={vi.fn()}
        defaultValues={{ name: '', notes: '' }}
        footer={<button type="submit">Save</button>}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(screen.getByLabelText('Name')).toHaveAttribute('aria-invalid', 'true')
    })
    expect(screen.getByText('Name is required')).toBeInTheDocument()

    const notesPanel = screen.getByRole('tabpanel', { name: /Notes/i })
    const notesInput = within(notesPanel).getByLabelText('Notes')
    expect(notesInput).toHaveAttribute('aria-invalid', 'true')
    expect(screen.queryByText('Notes are required')).not.toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(
      <TabbedForm<TestValues>
        schema={schema}
        tabs={tabs}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
      />,
    )
    await expectNoAxeViolations(container)
  })
})
