import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'
import { describe, it, expect, vi } from 'vitest'
import { z } from 'zod'

import { TabbedForm, TABBED_FORM_SECTIONS_ARIA_LABEL } from './tabbed-form.client'
import type { TabbedFormTab } from './tabbed-form.client'
import { useTabbedFormChrome } from './tabbed-form-chrome.context'
import { FormShellFooterScope, FormShellFooterSlot } from '../chrome/form-shell-footer.context'
import { FormShellSubmitButton } from '../chrome/form-shell-submit-button'
import { FormItems } from '../containers/form-items.client'
import { submitAndExpectPayload } from '../test-utils'
import {
  formStickyActionsBarTransparentClasses,
  formStickyScrollBodyClasses,
  formStickyTabsTransparentClasses,
  formViewportScrollBodyTopInsetClasses,
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

function getSectionsNav() {
  return screen.getByRole('group', { name: TABBED_FORM_SECTIONS_ARIA_LABEL })
}

describe('TabbedForm', () => {
  it('renders all tab triggers', () => {
    render(<TabbedForm<TestValues> schema={schema} tabs={tabs} onSubmit={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Identity' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Rules' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Flavor' })).toBeInTheDocument()
  })

  it('shows the first tab panel by default', () => {
    render(<TabbedForm<TestValues> schema={schema} tabs={tabs} onSubmit={vi.fn()} />)
    expect(screen.getByRole('textbox', { name: /Campaign name/i })).toBeInTheDocument()
  })

  it('switches tabs on click', async () => {
    render(<TabbedForm<TestValues> schema={schema} tabs={tabs} onSubmit={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: 'Rules' }))
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

  it('wraps hoisted header content and tab panels in a rhythm stack', () => {
    render(
      <TabbedForm<TestValues>
        schema={schema}
        tabs={tabs}
        onSubmit={vi.fn()}
        header={<p data-testid="form-header">Campaign access</p>}
      />,
    )

    const header = screen.getByTestId('form-header')
    const rhythmStack = header.parentElement

    expect(rhythmStack).toHaveClass('gap-4')
    expect(rhythmStack).toContainElement(getSectionsNav())
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
    await userEvent.click(screen.getByRole('button', { name: 'Notes' }))
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

    const sectionsNav = getSectionsNav()
    expect(sectionsNav.parentElement).toHaveClass('sticky')
    const toolbar = screen.getByRole('toolbar', { name: 'Form actions' })
    expect(toolbar).toHaveClass('shrink-0')
    expect(toolbar).not.toHaveClass('sticky')
    expect(toolbar.closest('.overflow-y-auto')).toBeNull()
    expect(toolbar.parentElement).toHaveClass('flex', 'flex-col')

    const scrollRegion = sectionsNav.closest('.overflow-y-auto')
    expect(scrollRegion?.className).toContain('scrollbar-slim')
    expect(scrollRegion?.className).toContain('pe-2.5')
    expect(scrollRegion?.className).toContain('ps-1')
    for (const token of formStickyScrollBodyClasses.split(/\s+/)) {
      expect(scrollRegion?.className).toContain(token)
    }
  })

  it('renders scrollBodyClassName as a scroll-away inset inside the scroll region', () => {
    render(
      <TabbedForm<TestValues>
        schema={schema}
        tabs={tabs}
        onSubmit={vi.fn()}
        scrollBodyClassName={formViewportScrollBodyTopInsetClasses}
      />,
    )

    const sectionsNav = getSectionsNav()
    const scrollRegion = sectionsNav.closest('.overflow-y-auto')
    expect(scrollRegion?.className).not.toContain('pt-8')

    const inset = scrollRegion?.querySelector('[aria-hidden="true"]')
    expect(inset).toHaveClass('pt-8', 'shrink-0')
    expect(inset).not.toBeNull()
    expect(
      inset!.compareDocumentPosition(sectionsNav) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
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

    const sectionsNav = getSectionsNav()
    expect(sectionsNav.parentElement).toHaveClass('sticky', 'bg-transparent')
    expect(sectionsNav.parentElement).not.toHaveClass('bg-background')
    expect(screen.getByRole('toolbar', { name: 'Form actions' })).toHaveClass('bg-transparent')
  })

  it('renders an aside in a 2xl grid and keeps the footer in the form column', () => {
    render(
      <TabbedForm<TestValues>
        schema={schema}
        tabs={tabs}
        onSubmit={vi.fn()}
        aside={<aside data-testid="preview-aside">Preview</aside>}
        footer={<button type="submit">Save changes</button>}
      />,
    )

    const aside = screen.getByTestId('preview-aside')
    const slot = aside.parentElement
    const grid = slot?.parentElement
    const toolbar = screen.getByRole('toolbar', { name: 'Form actions' })
    const formColumn = toolbar.parentElement

    expect(slot).toHaveClass('2xl:col-start-2', '2xl:row-start-1')
    expect(grid).toHaveClass('2xl:grid-cols-[minmax(0,56rem)_21rem]')
    expect(formColumn).toHaveClass('2xl:col-start-1')
    expect(grid).toContainElement(formColumn)
    expect(grid?.childElementCount).toBe(2)
    expect(screen.getByRole('textbox', { name: /Campaign name/i })).toBeInTheDocument()
  })

  it('renders a trailing control on the sticky tab row', () => {
    render(
      <TabbedForm<TestValues>
        schema={schema}
        tabs={tabs}
        onSubmit={vi.fn()}
        tabRowTrailing={<button type="button">Preview</button>}
      />,
    )

    const preview = screen.getByRole('button', { name: 'Preview' })
    const tabRow = preview.parentElement
    expect(tabRow).toHaveClass('sticky')
    expect(tabRow).toContainElement(getSectionsNav())
  })

  it('exposes activeTabId on tabbed form chrome context', async () => {
    function ActiveTabProbe() {
      const chrome = useTabbedFormChrome()
      return <span data-testid="active-tab">{chrome?.activeTabId}</span>
    }

    render(
      <TabbedForm<TestValues>
        schema={schema}
        tabs={tabs}
        onSubmit={vi.fn()}
        header={<ActiveTabProbe />}
      />,
    )

    expect(screen.getByTestId('active-tab')).toHaveTextContent('identity')
    await userEvent.click(screen.getByRole('button', { name: 'Rules' }))
    expect(screen.getByTestId('active-tab')).toHaveTextContent('rules')
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

    const sectionsNav = getSectionsNav()
    expect(sectionsNav.parentElement).not.toHaveClass('sticky')
    expect(screen.queryByRole('toolbar', { name: 'Form actions' })).not.toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong.')
  })

  it('renders footer via externalFooter instead of the sticky actions bar', () => {
    render(
      <FormShellFooterScope>
        <TabbedForm<TestValues>
          schema={schema}
          tabs={tabs}
          onSubmit={vi.fn()}
          formError="Something went wrong."
          externalFooter
          footer={<button type="submit">Save changes</button>}
        />
        <footer data-testid="external-footer">
          <FormShellFooterSlot />
        </footer>
      </FormShellFooterScope>,
    )

    expect(screen.queryByRole('toolbar', { name: 'Form actions' })).not.toBeInTheDocument()
    expect(screen.getByTestId('external-footer')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong.')
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeInTheDocument()
  })

  it('wraps external footer body content in a scroll region', () => {
    render(
      <FormShellFooterScope>
        <TabbedForm<TestValues>
          schema={schema}
          tabs={tabs}
          onSubmit={vi.fn()}
          externalFooter
          header={<p>Above tabs</p>}
          footer={<button type="submit">Save changes</button>}
        />
        <footer>
          <FormShellFooterSlot />
        </footer>
      </FormShellFooterScope>,
    )

    const aboveTabs = screen.getByText('Above tabs')
    const scrollRegion = aboveTabs.closest('.overflow-y-auto')

    expect(scrollRegion).toBeTruthy()
    expect(scrollRegion?.className).toContain('min-h-0')
    expect(scrollRegion?.className).toContain('pb-6')
    expect(scrollRegion).toContainElement(getSectionsNav())
  })

  it('submits via an external footer button associated with form id', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()

    render(
      <FormShellFooterScope>
        <div data-testid="overlay-content">
          <div data-testid="overlay-body">
            <TabbedForm<TestValues>
              id="external-footer-form"
              schema={schema}
              tabs={tabs}
              onSubmit={onSubmit}
              externalFooter
              footer={() => <FormShellSubmitButton>Save changes</FormShellSubmitButton>}
            />
          </div>
          <div data-testid="overlay-footer">
            <FormShellFooterSlot />
          </div>
        </div>
      </FormShellFooterScope>,
    )

    const content = screen.getByTestId('overlay-content')
    const footer = screen.getByTestId('overlay-footer')
    expect(content).toContainElement(screen.getByTestId('overlay-body'))
    expect(content).toContainElement(footer)
    expect(screen.getByTestId('overlay-body')).not.toContainElement(footer)

    await user.click(screen.getByRole('button', { name: 'Save changes' }))
    expect(onSubmit).not.toHaveBeenCalled()

    await user.type(screen.getByRole('textbox', { name: /Campaign name/i }), 'Mira')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
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

    expect(screen.getByTestId('wrapped-content')).toContainElement(getSectionsNav())
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

    expect(screen.getByRole('button', { name: 'Identity' })).toHaveTextContent('Identity')
    expect(screen.getByRole('button', { name: 'Rules' })).toHaveTextContent('Rules')
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
        screen.getByRole('button', { name: /Notes.*1 field needs attention/i }),
      ).toHaveAttribute('aria-pressed', 'true')
    })
    const notesInput = screen.getByRole('textbox', { name: 'Notes' })
    expect(notesInput).toHaveFocus()
    expect(screen.getByRole('button', { name: 'Identity' })).toHaveTextContent('Identity')
    expect(within(getSectionsNav()).getByRole('button', { name: /Notes/ })).toHaveTextContent('1')
  })

  it('uses resolverFields for tier-1 validation copy on header-only paths', async () => {
    const user = userEvent.setup()
    const validationSchema = z.object({
      name: z.string().min(1),
      meta: z.object({ title: z.string().min(1) }),
    })

    type ValidationValues = z.infer<typeof validationSchema>

    const validationTabs: TabbedFormTab[] = [
      {
        id: 'identity',
        label: 'Identity',
        fields: [{ type: 'text', name: 'name', label: 'Name', required: true }],
      },
      {
        id: 'meta',
        label: 'Meta',
        fields: [],
        resolverFields: [{ type: 'text', name: 'meta.title', label: 'Title', required: true }],
        header: (
          <FormItems
            items={[{ type: 'text', name: 'title', label: 'Title', required: true }]}
            idPrefix="meta"
            namePrefix="meta"
          />
        ),
      },
    ]

    render(
      <TabbedForm<ValidationValues>
        schema={validationSchema}
        tabs={validationTabs}
        onSubmit={vi.fn()}
        defaultValues={{ name: 'Valid name', meta: { title: '' } }}
        footer={<button type="submit">Save</button>}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Meta' }))
    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(screen.getByText('Title is required.')).toBeInTheDocument()
    })
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
      expect(screen.getByRole('textbox', { name: 'Notes' })).toHaveFocus()
    })
    expect(screen.getByRole('textbox', { name: 'Notes' })).toHaveAttribute(
      'id',
      'campaign-form-notes-notes',
    )
    expect(within(getSectionsNav()).getByRole('button', { name: /Notes/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
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
            addAction: { label: 'Add grant' },
            min: 1,
            item: { variant: 'detailed', collapsible: true },
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
      expect(screen.getByRole('textbox', { name: 'Label' })).toHaveAttribute('aria-invalid', 'true')
    })

    expect(within(getSectionsNav()).getByRole('button', { name: /Grants/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('textbox', { name: 'Label' })).toHaveFocus()

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /1 issue in Grants · Grant #1/i }),
      ).toBeInTheDocument()
    })

    expect(
      screen.getByRole('button', { name: /Grants.*1 field needs attention/i }),
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
      expect(screen.getByRole('textbox', { name: 'Name' })).toHaveAttribute('aria-invalid', 'true')
    })
    expect(screen.getByText('Name is required')).toBeInTheDocument()

    const notesPanel = screen.getByRole('region', { name: 'Notes' })
    const notesInput = within(notesPanel).getByRole('textbox', { name: 'Notes' })
    expect(notesInput).toHaveAttribute('aria-invalid', 'true')
    expect(screen.queryByText('Notes are required')).not.toBeInTheDocument()
  })

  it('shows the validation summary after a failed submit', async () => {
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
      expect(screen.getByRole('status')).toHaveTextContent(
        'Some fields need attention. Errors were found in Notes.',
      )
    })
    expect(screen.getByRole('button', { name: 'Review Notes' })).toBeInTheDocument()
  })

  it('Review summary buttons switch tabs and focus the tab-scoped control', async () => {
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
        id="review-form"
        schema={validationSchema}
        tabs={validationTabs}
        onSubmit={vi.fn()}
        defaultValues={{ name: '', notes: '' }}
        footer={<button type="submit">Save</button>}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: 'Name' })).toHaveFocus()
    })

    await user.click(screen.getByRole('button', { name: 'Review Notes' }))

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: 'Notes' })).toHaveFocus()
    })
    expect(screen.getByRole('textbox', { name: 'Notes' })).toHaveAttribute(
      'id',
      'review-form-notes-notes',
    )
    expect(within(getSectionsNav()).getByRole('button', { name: /Notes/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('clears tab badges and the validation summary after errors are fixed', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
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
        onSubmit={onSubmit}
        defaultValues={{ name: 'Valid name', notes: '' }}
        footer={<button type="submit">Save</button>}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    await user.type(screen.getByRole('textbox', { name: 'Notes' }), 'All good now')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled()
    })
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: 'Notes' })).toHaveTextContent('Notes')
    expect(screen.queryByText(/fields need attention/i)).not.toBeInTheDocument()
  })

  it('uses segmented-control section semantics with aria-controls and hidden inactive panels', () => {
    render(
      <TabbedForm<TestValues> id="campaign-form" schema={schema} tabs={tabs} onSubmit={vi.fn()} />,
    )

    const identityTrigger = screen.getByRole('button', { name: 'Identity' })
    const rulesPanel = document.getElementById('campaign-form-panel-rules')
    const identityPanel = document.getElementById('campaign-form-panel-identity')

    expect(identityTrigger).toHaveAttribute('aria-controls', 'campaign-form-panel-identity')
    expect(identityTrigger).toHaveAttribute('aria-pressed', 'true')
    expect(rulesPanel).toHaveClass('hidden')
    expect(identityPanel).not.toHaveClass('hidden')
  })

  it('activates sections with arrow keys on the segmented control', async () => {
    const user = userEvent.setup()
    render(<TabbedForm<TestValues> schema={schema} tabs={tabs} onSubmit={vi.fn()} />)

    const identityTrigger = screen.getByRole('button', { name: 'Identity' })
    identityTrigger.focus()
    await user.keyboard('{ArrowRight}')

    expect(screen.getByRole('button', { name: 'Rules' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByLabelText('Starting level')).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <TabbedForm<TestValues>
        schema={schema}
        tabs={tabs}
        onSubmit={vi.fn()}
        defaultValues={{ name: '', level: 1 }}
        footer={<button type="submit">Save</button>}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => {
      expect(screen.getByRole('status')).toBeInTheDocument()
    })
    await expectNoAxeViolations(container)
  })
})
