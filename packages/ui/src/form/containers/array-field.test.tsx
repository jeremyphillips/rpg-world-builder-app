import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { z } from 'zod'

import { Form } from '../shells/form.client'
import type { FormItem } from '../field-config'

// ── Schema ──────────────────────────────────────────────────────────────────

const traitSchema = z.object({
  name: z.string().min(1, 'Trait name is required'),
  description: z.string(),
})

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  traits: z.array(traitSchema).min(0),
})

type Values = z.infer<typeof schema>

// ── Field configs ────────────────────────────────────────────────────────────

const traitFields: FormItem[] = [
  { type: 'text', name: 'name', label: 'Trait name', required: true },
  { type: 'textarea', name: 'description', label: 'Description' },
]

const fields: FormItem[] = [
  { type: 'text', name: 'name', label: 'Name', required: true },
  {
    kind: 'array',
    name: 'traits',
    legend: 'Traits',
    fields: traitFields,
    addLabel: 'Add trait',
  },
]

function renderForm(onSubmit: (values: Values) => void = vi.fn()) {
  return render(
    <Form<Values>
      schema={schema}
      fields={fields}
      onSubmit={onSubmit}
      footer={<button type="submit">Save</button>}
    />,
  )
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('ArrayFieldRenderer', () => {
  it('renders the add button and legend for an empty array', () => {
    renderForm()
    expect(screen.getByRole('group', { name: /Traits/ })).toBeInTheDocument()
    expect(screen.getByText('Traits')).toHaveClass('text-sm')
    expect(screen.getByText('Traits')).not.toHaveClass('text-field-array-legend')
    expect(screen.getByText('Traits')).not.toHaveClass('text-field-group-legend')
    expect(screen.getByRole('group', { name: /Traits/ }).querySelector(':scope > div')).toHaveClass(
      'gap-2',
    )
    expect(screen.getByRole('button', { name: 'Add trait' })).toBeInTheDocument()
    expect(screen.queryByLabelText('Trait name')).not.toBeInTheDocument()
  })

  it('uses gap-3 between sm comfortable array items while keeping gap-6 inside item bodies', async () => {
    const user = userEvent.setup()
    const comfortableFields: FormItem[] = [
      {
        kind: 'array',
        name: 'traits',
        legend: 'Traits',
        rhythm: 'comfortable',
        fields: traitFields,
        addLabel: 'Add trait',
      },
    ]

    render(
      <Form<Values>
        schema={schema}
        fields={comfortableFields}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Add trait' }))

    const list = screen.getByRole('group', { name: /Traits/ }).querySelector(':scope > div')
    expect(list).toHaveClass('gap-3')
    expect(list).not.toHaveClass('gap-6')

    const item = screen.getByRole('group', { name: 'Item 1' })
    expect(within(item).getByRole('textbox', { name: 'Trait name' }).closest('.gap-6')).toBeTruthy()
  })

  it('adds an item when the add button is clicked', async () => {
    const user = userEvent.setup()
    renderForm()
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveClass('h-9')
    await user.click(screen.getByRole('button', { name: 'Add trait' }))
    expect(screen.getByRole('textbox', { name: 'Trait name' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Trait name' })).toHaveClass('h-8')
    expect(screen.getByRole('group', { name: 'Item 1' })).toHaveClass(
      'rounded-md',
      'border',
      'border-border',
      'pl-2',
    )
  })

  it('removes an item when the remove button is clicked', async () => {
    const user = userEvent.setup()
    renderForm()
    await user.click(screen.getByRole('button', { name: 'Add trait' }))
    expect(screen.getByRole('textbox', { name: 'Trait name' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Remove Traits · Item 1' }))
    expect(screen.queryByRole('textbox', { name: 'Trait name' })).not.toBeInTheDocument()
  })

  it('submits array values correctly', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    renderForm(onSubmit)
    await user.type(screen.getByLabelText('Name'), 'Elf')
    await user.click(screen.getByRole('button', { name: 'Add trait' }))
    await user.type(screen.getByRole('textbox', { name: 'Trait name' }), 'Darkvision')
    await user.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.lastCall?.[0]).toEqual({
      name: 'Elf',
      traits: [{ name: 'Darkvision', description: '' }],
    })
  })

  it('validates required fields inside an array item', async () => {
    const user = userEvent.setup()
    renderForm()
    await user.type(screen.getByLabelText('Name'), 'Elf')
    await user.click(screen.getByRole('button', { name: 'Add trait' }))
    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(await screen.findByText('Trait name is required')).toBeInTheDocument()
  })

  it('hides the add button when max is reached', async () => {
    const user = userEvent.setup()
    const maxFields: FormItem[] = [
      {
        kind: 'array',
        name: 'traits',
        legend: 'Traits',
        fields: traitFields,
        addLabel: 'Add trait',
        max: 1,
      },
    ]
    const maxSchema = z.object({ traits: z.array(traitSchema) })
    render(
      <Form
        schema={maxSchema}
        fields={maxFields}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Add trait' }))
    expect(screen.queryByRole('button', { name: 'Add trait' })).not.toBeInTheDocument()
  })

  it('disables the remove button when at min count', async () => {
    const user = userEvent.setup()
    const minFields: FormItem[] = [
      {
        kind: 'array',
        name: 'traits',
        legend: 'Traits',
        fields: traitFields,
        addLabel: 'Add trait',
        min: 1,
      },
    ]
    const minSchema = z.object({ traits: z.array(traitSchema) })
    render(
      <Form
        schema={minSchema}
        fields={minFields}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Add trait' }))
    expect(screen.getByRole('button', { name: 'Remove Traits · Item 1' })).toBeDisabled()
  })

  it('hides nested arrays when item-scoped visibility is false', async () => {
    const user = userEvent.setup()
    const grantSchema = z.object({
      grants: z.array(
        z.object({
          grantType: z.string(),
          detail: z.string().optional(),
          entries: z.array(z.object({ spell: z.string() })).optional(),
        }),
      ),
    })

    const grantFields: FormItem[] = [
      {
        kind: 'array',
        name: 'grants',
        legend: 'Grants',
        addLabel: 'Add grant',
        fields: [
          {
            type: 'text',
            name: 'grantType',
            label: 'Grant type',
            required: true,
          },
          {
            type: 'text',
            name: 'detail',
            label: 'Sense detail',
            visibility: {
              dependsOn: ['grantType'],
              visibleWhen: (v) => v.grantType === 'senses',
            },
          },
          {
            kind: 'array',
            name: 'entries',
            legend: 'Innate spell entries',
            addLabel: 'Add entry',
            visibility: {
              dependsOn: ['grantType'],
              visibleWhen: (v) => v.grantType === 'innateSpells',
            },
            fields: [{ type: 'text', name: 'spell', label: 'Spell', required: true }],
          },
        ],
      },
    ]

    render(
      <Form
        schema={grantSchema}
        fields={grantFields}
        defaultValues={{ grants: [{ grantType: 'senses' }] }}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
      />,
    )

    expect(screen.getByLabelText('Sense detail')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Add entry' })).not.toBeInTheDocument()

    await user.clear(screen.getByLabelText('Grant type'))
    await user.type(screen.getByLabelText('Grant type'), 'innateSpells')

    expect(screen.queryByLabelText('Sense detail')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add entry' })).toBeInTheDocument()
  })

  it('supports item-scoped conditional visibility', async () => {
    const user = userEvent.setup()
    const conditionalSchema = z.object({
      entries: z.array(z.object({ enabled: z.boolean(), detail: z.string().optional() })),
    })

    const conditionalFields: FormItem[] = [
      {
        kind: 'array',
        name: 'entries',
        legend: 'Entries',
        fields: [
          { type: 'switch', name: 'enabled', label: 'Enabled' },
          {
            type: 'text',
            name: 'detail',
            label: 'Detail',
            visibility: {
              dependsOn: ['enabled'],
              visibleWhen: (v) => v.enabled === true,
            },
          },
        ],
        addLabel: 'Add entry',
      },
    ]

    render(
      <Form
        schema={conditionalSchema}
        fields={conditionalFields}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Add entry' }))
    // Detail should be hidden while switch is off
    expect(screen.queryByLabelText('Detail')).not.toBeInTheDocument()

    // Turn on the switch to reveal the conditional field
    await user.click(screen.getByRole('switch', { name: 'Enabled' }))
    expect(screen.getByLabelText('Detail')).toBeInTheDocument()
  })

  it('has no axe violations with a populated array', async () => {
    const user = userEvent.setup()
    const { container } = renderForm()
    await user.click(screen.getByRole('button', { name: 'Add trait' }))
    const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
    expect(results.violations).toEqual([])
  })

  it('has no axe violations on an empty array', async () => {
    const { container } = renderForm()
    const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
    expect(results.violations).toEqual([])
  })

  it('does not duplicate landmarks for nested arrays inside multiple items', async () => {
    const user = userEvent.setup()
    const nestedSchema = z.object({
      items: z.array(
        z.object({
          name: z.string(),
          tags: z.array(z.object({ label: z.string() })).optional(),
        }),
      ),
    })

    const nestedFields: FormItem[] = [
      {
        kind: 'array',
        name: 'items',
        legend: 'Items',
        addLabel: 'Add item',
        fields: [
          { type: 'text', name: 'name', label: 'Name' },
          {
            kind: 'array',
            name: 'tags',
            legend: 'Tags',
            addLabel: 'Add tag',
            fields: [{ type: 'text', name: 'label', label: 'Label' }],
          },
        ],
      },
    ]

    const { container } = render(
      <Form
        schema={nestedSchema}
        fields={nestedFields}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Add item' }))
    await user.click(screen.getByRole('button', { name: 'Add item' }))

    const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
    expect(results.violations.filter((violation) => violation.id === 'landmark-unique')).toEqual([])
  })

  it('hides drag handles when reorder is false', async () => {
    const user = userEvent.setup()
    const noReorderFields: FormItem[] = [
      {
        kind: 'array',
        name: 'traits',
        legend: 'Traits',
        reorder: false,
        fields: traitFields,
        addLabel: 'Add trait',
      },
    ]

    render(
      <Form<Values>
        schema={schema}
        fields={noReorderFields}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Add trait' }))
    await user.click(screen.getByRole('button', { name: 'Add trait' }))

    expect(screen.queryByRole('button', { name: /Drag to reorder Traits/ })).not.toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /Remove Traits · Item/ })).toHaveLength(2)
    expect(screen.getByRole('group', { name: 'Item 1' })).toHaveClass('pl-2')
    expect(screen.getByRole('group', { name: 'Item 1' })).not.toHaveClass('pl-10')
  })

  it('shows item summaries while expanded and collapsed', async () => {
    const user = userEvent.setup()
    const collapsibleFields: FormItem[] = [
      {
        kind: 'array',
        name: 'traits',
        legend: 'Traits',
        itemVariant: 'detailed',
        itemCollapsible: true,
        itemHeader: {
          fallback: (index) => `Trait ${index + 1}`,
          primaryField: 'name',
          summary: (values) => (values.description as string) || 'No description',
        },
        fields: traitFields,
        addLabel: 'Add trait',
      },
    ]

    render(
      <Form<Values>
        schema={schema}
        fields={collapsibleFields}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Add trait' }))
    await user.type(screen.getByRole('textbox', { name: 'Trait name' }), 'Darkvision')
    await user.type(screen.getByRole('textbox', { name: 'Description' }), 'See in the dark')

    expect(screen.getByText('See in the dark', { selector: 'p' })).toBeInTheDocument()

    const collapseTrigger = screen.getByRole('button', { name: /Collapse .*Darkvision/ })
    await user.click(collapseTrigger)

    expect(screen.getByText('See in the dark', { selector: 'p' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Trait name', hidden: true })).not.toBeVisible()
  })

  it('collapses detailed items while preserving field values', async () => {
    const user = userEvent.setup()
    const collapsibleFields: FormItem[] = [
      {
        kind: 'array',
        name: 'traits',
        legend: 'Traits',
        itemVariant: 'detailed',
        itemCollapsible: true,
        itemHeader: {
          fallback: (index) => `Trait ${index + 1}`,
          primaryField: 'name',
        },
        fields: traitFields,
        addLabel: 'Add trait',
      },
    ]

    render(
      <Form<Values>
        schema={schema}
        fields={collapsibleFields}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Add trait' }))
    await user.type(screen.getByRole('textbox', { name: 'Trait name' }), 'Darkvision')

    const collapseTrigger = screen.getByRole('button', { name: /Collapse .*Trait 1/ })
    expect(collapseTrigger).toHaveAttribute('aria-expanded', 'true')
    await user.click(collapseTrigger)
    expect(collapseTrigger).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByRole('textbox', { name: 'Trait name', hidden: true })).not.toBeVisible()

    await user.click(screen.getByRole('button', { name: /Expand .*Trait 1/ }))
    expect(screen.getByRole('textbox', { name: 'Trait name' })).toHaveValue('Darkvision')
  })
})
