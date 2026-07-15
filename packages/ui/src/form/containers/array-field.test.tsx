import { describe, expect, it, vi, afterEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'
import { z } from 'zod'

import { Form } from '../shells/form.client'
import type { FormItem } from '../field-config'
import { readArrayItemCollapseOverrides } from '../config/array/array-item-collapse-storage.lib'
import { submitAndExpectPayload } from '../test-utils'

// ── Schema ──────────────────────────────────────────────────────────────────

const traitSchema = z.object({
  name: z.string().min(1, 'Trait name is required'),
  description: z.string(),
})

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  traits: z.array(traitSchema).min(0),
})

const rowIssueSchema = z.object({ traits: z.array(traitSchema) }).superRefine((_values, ctx) => {
  ctx.addIssue({
    code: 'custom',
    path: ['traits', 0],
    message: 'Review this trait before saving',
  })
})

type Values = z.infer<typeof schema>

// ── Field configs ────────────────────────────────────────────────────────────

const traitFields: FormItem[] = [
  { type: 'text', name: 'name', label: 'Trait name', required: true },
  { type: 'textarea', name: 'description', label: 'Description' },
]

const collapsibleTraitFields: FormItem[] = [
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
    addActionLabel: 'Add trait',
  },
]

const collapsibleTraitFieldsSimpleHeader: FormItem[] = [
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
    addActionLabel: 'Add trait',
  },
]

const fields: FormItem[] = [
  { type: 'text', name: 'name', label: 'Name', required: true },
  {
    kind: 'array',
    name: 'traits',
    legend: 'Traits',
    fields: traitFields,
    addActionLabel: 'Add trait',
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
  afterEach(() => {
    localStorage.clear()
  })

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
    expect(screen.getByRole('button', { name: 'Add trait' })).toHaveClass('h-9')
    expect(screen.queryByLabelText('Trait name')).not.toBeInTheDocument()
    expect(screen.getByRole('group', { name: /Traits/ })).not.toHaveClass('mb-8')
  })

  it('omits section bottom margin and empty legends for nested arrays in dependent stacks', async () => {
    const user = userEvent.setup()
    const nestedSchema = z.object({
      enabled: z.boolean(),
      caps: z.array(z.object({ classId: z.string() })),
    })

    const nestedFields: FormItem[] = [
      {
        kind: 'stack',
        layout: 'dependent',
        fields: [
          {
            type: 'switch',
            name: 'enabled',
            label: 'Class-specific limits',
            defaultValue: true,
          },
          {
            kind: 'array',
            name: 'caps',
            legend: '',
            addActionLabel: 'Add class limit',
            fields: [{ type: 'text', name: 'classId', label: 'Class' }],
          },
        ],
      },
    ]

    render(
      <Form<z.infer<typeof nestedSchema>>
        schema={nestedSchema}
        fields={nestedFields}
        defaultValues={{ enabled: true, caps: [] }}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
      />,
    )

    const addButton = screen.getByRole('button', { name: 'Add class limit' })
    const fieldset = addButton.closest('fieldset')
    expect(fieldset).not.toBeNull()
    expect(fieldset).not.toHaveClass('mb-8')
    expect(fieldset?.querySelector('legend')).toBeNull()

    await user.click(addButton)
    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Class' })).toBeInTheDocument())

    const itemShell = screen.getByRole('group', { name: /Item #1/ })
    expect(itemShell).toHaveClass('bg-card')
    expect(itemShell).toHaveClass('shadow-surface-raised')
    const dependentsRegion = addButton.closest('[data-field-stack-dependents]')
    expect(dependentsRegion?.querySelector(':scope > .p-3')).toBeNull()
    expect(dependentsRegion?.querySelector('.bg-card')).toBe(itemShell)
  })

  it('applies itemChrome override on array item shells', async () => {
    const user = userEvent.setup()
    const subtleFields: FormItem[] = [
      {
        kind: 'array',
        name: 'traits',
        legend: 'Traits',
        itemChrome: 'subtle',
        fields: traitFields,
        addActionLabel: 'Add trait',
      },
    ]

    render(
      <Form<Values>
        schema={schema}
        fields={subtleFields}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Add trait' }))

    const itemShell = screen.getByRole('group', { name: 'Trait #1' })
    expect(itemShell).toHaveClass('bg-muted/10')
    expect(itemShell).toHaveClass('border-border')
    expect(itemShell).not.toHaveClass('bg-card')
  })

  it('defaults the add control to the outline button variant', () => {
    renderForm()

    const addButton = screen.getByRole('button', { name: 'Add trait' })
    expect(addButton).toHaveClass('border-input')
    expect(addButton).not.toHaveClass('bg-primary')
    expect(addButton).not.toHaveClass('bg-secondary')
  })

  it('renders inline add actions in the legend row with a leading plus icon', () => {
    const inlineFields: FormItem[] = [
      {
        kind: 'array',
        name: 'traits',
        legend: 'Movement',
        fields: traitFields,
        addActionLabel: 'Add speed',
        addActionLayout: 'inline',
      },
    ]

    const { container } = render(
      <Form<Values>
        schema={schema}
        fields={inlineFields}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
      />,
    )

    const fieldset = container.querySelector('fieldset')!
    const legend = fieldset.querySelector('legend')
    const addButton = screen.getByRole('button', { name: 'Add speed' })

    expect(legend).toHaveTextContent('Movement')
    expect(legend).toContainElement(addButton)
    expect(addButton.querySelector('svg')).toBeTruthy()
    expect(screen.getAllByRole('button', { name: 'Add speed' })).toHaveLength(1)
  })

  it('keeps stacked add actions below the item list', () => {
    renderForm()

    const fieldset = screen.getByRole('group', { name: /Traits/i })
    const addButton = screen.getByRole('button', { name: 'Add trait' })
    const legend = fieldset.querySelector('legend')

    expect(legend).not.toContainElement(addButton)
    expect(addButton.querySelector('svg')).toBeTruthy()
  })

  it('omits the add icon when showAddIcon is false', () => {
    const noIconFields: FormItem[] = [
      {
        kind: 'array',
        name: 'traits',
        legend: 'Traits',
        fields: traitFields,
        addActionLabel: 'Choose preset',
        showAddIcon: false,
      },
    ]

    render(
      <Form<Values>
        schema={schema}
        fields={noIconFields}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
      />,
    )

    const addButton = screen.getByRole('button', { name: 'Choose preset' })
    expect(addButton.querySelector('svg')).toBeNull()
  })

  it('applies addActionSize on the add control', () => {
    const sizedFields: FormItem[] = [
      {
        kind: 'array',
        name: 'traits',
        legend: 'Traits',
        fields: traitFields,
        addActionLabel: 'Add trait',
        addActionSize: 'sm',
      },
    ]

    render(
      <Form<Values>
        schema={schema}
        fields={sizedFields}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
      />,
    )

    const addButton = screen.getByRole('button', { name: 'Add trait' })
    expect(addButton).toHaveClass('h-8')
    expect(addButton).toHaveClass('text-xs')
  })

  it('applies addActionVariant on the add control', () => {
    const secondaryFields: FormItem[] = [
      {
        kind: 'array',
        name: 'traits',
        legend: 'Traits',
        fields: traitFields,
        addActionLabel: 'Add trait',
        addActionVariant: 'secondary',
      },
    ]

    render(
      <Form<Values>
        schema={schema}
        fields={secondaryFields}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
      />,
    )

    const addButton = screen.getByRole('button', { name: 'Add trait' })
    expect(addButton).toHaveClass('bg-secondary')
    expect(addButton).not.toHaveClass('border-input')
  })

  it('applies addActionVariant on addActionMenu dropdown triggers', async () => {
    const user = userEvent.setup()
    const grantSchema = z.object({
      grants: z.array(z.object({ grantType: z.string().optional() })),
    })

    const addActionMenuFields: FormItem[] = [
      {
        kind: 'array',
        name: 'grants',
        legend: 'Grants',
        addActionLabel: 'Add grant',
        addActionVariant: 'default',
        fields: [{ type: 'text', name: 'grantType', label: 'Grant type' }],
        addActionMenu: {
          groups: [{ id: 'traits', label: 'Traits' }],
          items: [
            {
              id: 'movement-bonus',
              label: 'Movement bonus',
              groupId: 'traits',
              appendDefaults: { grantType: 'movement-bonus' },
            },
          ],
        },
      },
    ]

    render(
      <Form<z.infer<typeof grantSchema>>
        schema={grantSchema}
        fields={addActionMenuFields}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
      />,
    )

    const addButton = screen.getByRole('button', { name: 'Add grant' })
    expect(addButton).toHaveClass('bg-primary')
    expect(addButton).not.toHaveClass('border-input')

    await user.click(addButton)
    expect(screen.getByRole('option', { name: 'Movement bonus' })).toBeInTheDocument()
  })

  it('defaults array item shells to elevated card chrome', async () => {
    const user = userEvent.setup()
    renderForm()
    await user.click(screen.getByRole('button', { name: 'Add trait' }))

    const itemShell = screen.getByRole('group', { name: 'Trait #1' })
    expect(itemShell).toHaveClass('bg-card')
    expect(itemShell).toHaveClass('shadow-surface-raised')
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
        addActionLabel: 'Add trait',
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

    const item = screen.getByRole('group', { name: 'Trait #1' })
    expect(within(item).getByRole('textbox', { name: 'Trait name' }).closest('.gap-6')).toBeTruthy()
  })

  it('adds an item when the add button is clicked', async () => {
    const user = userEvent.setup()
    renderForm()
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveClass('h-9')
    await user.click(screen.getByRole('button', { name: 'Add trait' }))
    expect(screen.getByRole('textbox', { name: 'Trait name' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Trait name' })).toHaveClass('h-8')
    expect(screen.getByRole('group', { name: 'Trait #1' })).toHaveClass(
      'rounded-md',
      'border',
      'border-border',
      'bg-card',
      'shadow-surface-raised',
      'pl-2',
    )
  })

  it('removes an item when the remove button is clicked', async () => {
    const user = userEvent.setup()
    renderForm()
    await user.click(screen.getByRole('button', { name: 'Add trait' }))
    expect(screen.getByRole('textbox', { name: 'Trait name' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Remove Traits · Trait #1' }))
    expect(screen.queryByRole('textbox', { name: 'Trait name' })).not.toBeInTheDocument()
  })

  it('submits array values correctly', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    renderForm(onSubmit)
    await user.type(screen.getByLabelText('Name'), 'Elf')
    await user.click(screen.getByRole('button', { name: 'Add trait' }))
    await user.type(screen.getByRole('textbox', { name: 'Trait name' }), 'Darkvision')
    await submitAndExpectPayload(user, onSubmit, {
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
        addActionLabel: 'Add trait',
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
        addActionLabel: 'Add trait',
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
    expect(screen.getByRole('button', { name: 'Remove Traits · Trait #1' })).toBeDisabled()
  })

  it('omits the default remove button when hideItemRemove is true', async () => {
    const user = userEvent.setup()
    const hiddenRemoveFields: FormItem[] = [
      {
        kind: 'array',
        name: 'traits',
        legend: 'Traits',
        fields: traitFields,
        addActionLabel: 'Add trait',
        hideItemRemove: true,
      },
    ]
    render(
      <Form
        schema={schema}
        fields={hiddenRemoveFields}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Add trait' }))
    expect(screen.queryByRole('button', { name: /Remove Traits/i })).not.toBeInTheDocument()
  })

  it('renders itemRemoveSlot in the header actions rail instead of the default remove button', async () => {
    const user = userEvent.setup()
    const customRemoveFields: FormItem[] = [
      {
        kind: 'array',
        name: 'traits',
        legend: 'Traits',
        fields: traitFields,
        addActionLabel: 'Add trait',
        hideItemRemove: true,
        itemRemoveSlot: {
          name: '_customTraitRemove',
          render: () => <button type="button">Custom remove</button>,
        },
      },
    ]
    render(
      <Form
        schema={schema}
        fields={customRemoveFields}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Add trait' }))
    expect(screen.queryByRole('button', { name: /Remove Traits/i })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Custom remove' })).toBeInTheDocument()
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
        addActionLabel: 'Add grant',
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
            addActionLabel: 'Add entry',
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
        addActionLabel: 'Add entry',
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
    await expectNoAxeViolations(container)
  })

  it('has no axe violations on an empty array', async () => {
    const { container } = renderForm()
    await expectNoAxeViolations(container)
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
        addActionLabel: 'Add item',
        fields: [
          { type: 'text', name: 'name', label: 'Name' },
          {
            kind: 'array',
            name: 'tags',
            legend: 'Tags',
            addActionLabel: 'Add tag',
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
        addActionLabel: 'Add trait',
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
    expect(screen.getAllByRole('button', { name: /Remove Traits · Trait #/ })).toHaveLength(2)
    expect(screen.getByRole('group', { name: 'Trait #1' })).toHaveClass('pl-2')
    expect(screen.getByRole('group', { name: 'Trait #1' })).not.toHaveClass('pl-10')
  })

  it('shows item summaries while expanded and collapsed', async () => {
    const user = userEvent.setup()

    render(
      <Form<Values>
        schema={schema}
        fields={collapsibleTraitFields}
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

  it('starts with a single collapsible item expanded', async () => {
    const user = userEvent.setup()

    render(
      <Form<Values>
        schema={schema}
        fields={collapsibleTraitFieldsSimpleHeader}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Add trait' }))
    await user.type(screen.getByRole('textbox', { name: 'Trait name' }), 'Darkvision')

    expect(screen.getByRole('button', { name: /Collapse .*Darkvision/ })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
  })

  it('starts with two collapsible items collapsed by default', async () => {
    const user = userEvent.setup()

    render(
      <Form<Values>
        schema={schema}
        fields={collapsibleTraitFieldsSimpleHeader}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Add trait' }))
    await user.click(screen.getByRole('button', { name: 'Add trait' }))

    expect(screen.getAllByRole('button', { name: /Expand .*Trait/ })).toHaveLength(2)
    expect(screen.queryByRole('button', { name: /Collapse .*Trait/ })).not.toBeInTheDocument()
  })

  it('persists a manually closed sole item across remount when uiStateKey is set', async () => {
    const user = userEvent.setup()
    const uiStateKey = 'collapse-test-form'
    const defaultValues: Values = {
      name: 'Species',
      traits: [{ name: 'Darkvision', description: 'See in the dark' }],
    }

    const first = render(
      <Form<Values>
        uiStateKey={uiStateKey}
        schema={schema}
        fields={collapsibleTraitFieldsSimpleHeader}
        defaultValues={defaultValues}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
      />,
    )

    await user.click(screen.getByRole('button', { name: /Collapse .*Darkvision/ }))
    expect(readArrayItemCollapseOverrides(uiStateKey, 'traits')).toEqual({
      'index:0': 'closed',
    })

    first.unmount()

    render(
      <Form<Values>
        uiStateKey={uiStateKey}
        schema={schema}
        fields={collapsibleTraitFieldsSimpleHeader}
        defaultValues={defaultValues}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
      />,
    )

    expect(screen.getByRole('button', { name: /Expand .*Darkvision/ })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
  })

  it('persists a manually opened item among many across remount when uiStateKey is set', async () => {
    const user = userEvent.setup()
    const uiStateKey = 'collapse-test-form-many'
    const defaultValues: Values = {
      name: 'Species',
      traits: [
        { name: 'Darkvision', description: '' },
        { name: 'Keen Senses', description: '' },
      ],
    }

    const first = render(
      <Form<Values>
        uiStateKey={uiStateKey}
        schema={schema}
        fields={collapsibleTraitFieldsSimpleHeader}
        defaultValues={defaultValues}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
      />,
    )

    await user.click(screen.getByRole('button', { name: /Expand .*Darkvision/ }))
    expect(readArrayItemCollapseOverrides(uiStateKey, 'traits')).toEqual({
      'index:0': 'open',
    })

    first.unmount()

    render(
      <Form<Values>
        uiStateKey={uiStateKey}
        schema={schema}
        fields={collapsibleTraitFieldsSimpleHeader}
        defaultValues={defaultValues}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
      />,
    )

    expect(screen.getByRole('button', { name: /Collapse .*Darkvision/ })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    expect(screen.getByRole('button', { name: /Expand .*Keen Senses/ })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
  })

  it('collapses detailed items while preserving field values', async () => {
    const user = userEvent.setup()

    render(
      <Form<Values>
        schema={schema}
        fields={collapsibleTraitFieldsSimpleHeader}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Add trait' }))
    await user.type(screen.getByRole('textbox', { name: 'Trait name' }), 'Darkvision')

    const collapseTrigger = screen.getByRole('button', { name: /Collapse .*Darkvision/ })
    expect(collapseTrigger).toHaveAttribute('aria-expanded', 'true')
    await user.click(collapseTrigger)
    expect(collapseTrigger).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByRole('textbox', { name: 'Trait name', hidden: true })).not.toBeVisible()

    await user.click(screen.getByRole('button', { name: /Expand .*Darkvision/ }))
    expect(screen.getByRole('textbox', { name: 'Trait name' })).toHaveValue('Darkvision')
  })

  it('pins compact item remove control in the top-right actions rail', async () => {
    const user = userEvent.setup()
    const compactFields: FormItem[] = [
      {
        kind: 'array',
        name: 'traits',
        legend: 'Traits',
        itemVariant: 'compact',
        fields: traitFields,
        addActionLabel: 'Add trait',
        itemHeader: { fallback: (index) => `Trait ${index + 1}`, srOnly: true },
      },
    ]

    render(
      <Form<Values>
        schema={schema}
        fields={compactFields}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Add trait' }))

    const item = screen.getByRole('group', { name: 'Traits · Trait 1 Trait name Description' })
    const actionsRail = screen.getByRole('group', { name: 'Item actions' })
    const removeButton = screen.getByRole('button', { name: 'Remove Traits · Trait 1' })

    expect(item).toContainElement(actionsRail)
    expect(actionsRail).toContainElement(removeButton)
    expect(actionsRail).toHaveClass('self-start', 'mt-1')
  })

  it('lays out compact inline rows on a dedicated grid with embedded actions', async () => {
    const compactRowFields: FormItem[] = [
      {
        kind: 'array',
        name: 'grants',
        legend: 'Grants',
        itemVariant: 'compact',
        fields: [
          {
            kind: 'row',
            fields: [
              { type: 'text', name: 'grantType', label: 'Type', required: true },
              { type: 'text', name: 'detail', label: 'Detail' },
            ],
          },
        ],
        addActionLabel: 'Add grant',
        itemHeader: { fallback: (index) => `Grant ${index + 1}`, srOnly: true },
      },
    ]

    const grantSchema = z.object({
      grants: z.array(z.object({ grantType: z.string(), detail: z.string().optional() })),
    })

    render(
      <Form<z.infer<typeof grantSchema>>
        schema={grantSchema}
        fields={compactRowFields}
        defaultValues={{ grants: [{ grantType: 'senses', detail: 'Darkvision' }] }}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
      />,
    )

    const compactRow = document.querySelector('[data-compact-inline-row]')
    expect(compactRow).toBeInTheDocument()
    expect(compactRow?.querySelector('[data-field-row]')).toBeInTheDocument()

    const actionsRail = compactRow!.querySelector('[aria-label="Item actions"]')
    expect(actionsRail).toBeInTheDocument()
    expect(actionsRail).not.toHaveClass('mt-1')
    expect(actionsRail).toHaveClass('justify-self-end')
  })

  it('honors FieldRow width tokens inside compact inline rows', async () => {
    const compactWidthFields: FormItem[] = [
      {
        kind: 'array',
        name: 'utilizes',
        legend: 'Utilize actions',
        itemVariant: 'compact',
        fields: [
          {
            kind: 'row',
            fields: [
              {
                type: 'text',
                name: 'description',
                label: 'Description',
                required: true,
                width: 'full',
              },
              {
                type: 'number',
                name: 'dc',
                label: 'DC',
                required: true,
                digits: 2,
                width: 'auto',
              },
            ],
          },
        ],
        addActionLabel: 'Add utilize action',
        itemHeader: { fallback: (index) => `Action ${index + 1}`, primaryField: 'description' },
      },
    ]

    const utilizeSchema = z.object({
      utilizes: z.array(z.object({ description: z.string(), dc: z.number() })),
    })

    render(
      <Form<z.infer<typeof utilizeSchema>>
        schema={utilizeSchema}
        fields={compactWidthFields}
        defaultValues={{ utilizes: [{ description: 'Pick a lock', dc: 15 }] }}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
      />,
    )

    const compactRow = document.querySelector('[data-compact-inline-row]')
    expect(compactRow?.querySelector('[data-field-row]')).toBeInTheDocument()

    expect(screen.getByRole('textbox', { name: 'Description' }).closest('.space-y-2')).toHaveClass(
      'flex-1',
    )
    expect(screen.getByRole('spinbutton', { name: 'DC' }).closest('.space-y-2')).toHaveClass(
      'flex-none',
    )
  })

  it('centers compact inline grip and actions when compactInlineAlign is center', () => {
    const centeredCompactRowFields: FormItem[] = [
      {
        kind: 'array',
        name: 'examples',
        legend: 'Examples',
        itemVariant: 'compact',
        compactInlineAlign: 'center',
        reorder: 'dragHandle',
        fields: [
          {
            kind: 'row',
            fields: [{ type: 'text', name: 'value', label: '', placeholder: 'Example…' }],
          },
        ],
        addActionLabel: 'Add example',
        itemHeader: { fallback: (index) => `Example ${index + 1}`, primaryField: 'value' },
      },
    ]

    const exampleSchema = z.object({
      examples: z.array(z.object({ value: z.string() })),
    })

    render(
      <Form<z.infer<typeof exampleSchema>>
        schema={exampleSchema}
        fields={centeredCompactRowFields}
        defaultValues={{ examples: [{ value: '' }] }}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
      />,
    )

    const compactRow = document.querySelector('[data-compact-inline-row]')
    expect(compactRow).toHaveAttribute('data-compact-inline-align', 'center')
    expect(compactRow).toHaveClass('items-center')
  })

  it('shows issue badge, row summary, and legend link after failed submit', async () => {
    const user = userEvent.setup()

    render(
      <Form<z.infer<typeof rowIssueSchema>>
        id="issue-form"
        schema={rowIssueSchema}
        fields={collapsibleTraitFieldsSimpleHeader}
        defaultValues={{
          traits: [
            { name: 'Darkvision', description: '' },
            { name: 'Keen Senses', description: '' },
          ],
        }}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
      />,
    )

    expect(screen.getAllByRole('button', { name: /Expand .*Trait/ })).toHaveLength(2)

    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(
      await screen.findByRole('button', { name: '1 issue in Traits · Darkvision' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Review 1 issue in 1 row in Traits' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('Review this trait before saving')
    expect(screen.getByRole('button', { name: /Collapse .*Darkvision/ })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
  })

  it('keeps submit-time expansion out of persisted collapse overrides', async () => {
    const user = userEvent.setup()
    const uiStateKey = 'validation-session-collapse'

    render(
      <Form<z.infer<typeof rowIssueSchema>>
        uiStateKey={uiStateKey}
        schema={rowIssueSchema}
        fields={collapsibleTraitFieldsSimpleHeader}
        defaultValues={{
          traits: [
            { name: 'Darkvision', description: '' },
            { name: 'Keen Senses', description: '' },
          ],
        }}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByRole('button', { name: /Collapse .*Darkvision/ })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    expect(readArrayItemCollapseOverrides(uiStateKey, 'traits')).toBeUndefined()
  })

  it('allows a user to collapse a row that validation opened', async () => {
    const user = userEvent.setup()
    const uiStateKey = 'validation-session-manual-collapse'

    render(
      <Form<z.infer<typeof rowIssueSchema>>
        uiStateKey={uiStateKey}
        schema={rowIssueSchema}
        fields={collapsibleTraitFieldsSimpleHeader}
        defaultValues={{
          traits: [
            { name: 'Darkvision', description: '' },
            { name: 'Keen Senses', description: '' },
          ],
        }}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Save' }))

    const collapseButton = await screen.findByRole('button', { name: /Collapse .*Darkvision/ })
    expect(collapseButton).toHaveAttribute('aria-expanded', 'true')

    await user.click(collapseButton)

    expect(screen.getByRole('button', { name: /Expand .*Darkvision/ })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
    expect(readArrayItemCollapseOverrides(uiStateKey, 'traits')).toEqual({ 'index:0': 'closed' })
  })

  it('suppresses per-field error text on compact rows and surfaces a row summary', async () => {
    const user = userEvent.setup()
    const grantSchema = z.object({
      grants: z.array(
        z.object({
          rarity: z.string().min(1, 'Choose a rarity.'),
          quantity: z.string().min(1, 'Quantity is required.'),
        }),
      ),
    })

    const compactGrantFields: FormItem[] = [
      {
        kind: 'array',
        name: 'grants',
        legend: 'Grants',
        itemVariant: 'compact',
        fields: [
          { type: 'text', name: 'rarity', label: 'Rarity', required: true },
          { type: 'text', name: 'quantity', label: 'Quantity', required: true },
        ],
        addActionLabel: 'Add grant',
        min: 1,
        itemHeader: { fallback: (index) => `Grant ${index + 1}`, srOnly: true },
      },
    ]

    render(
      <Form<z.infer<typeof grantSchema>>
        schema={grantSchema}
        fields={compactGrantFields}
        defaultValues={{ grants: [{ rarity: '', quantity: '' }] }}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(screen.getByLabelText('Rarity')).toHaveAttribute('aria-invalid', 'true')
      expect(screen.getByLabelText('Quantity')).toHaveAttribute('aria-invalid', 'true')
    })

    expect(screen.queryByText('Choose a rarity.')).not.toBeInTheDocument()
    expect(screen.queryByText('Quantity is required.')).not.toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('Choose a rarity. · Quantity is required.')
  })

  it('appends defaults from addActionMenu selections', async () => {
    const user = userEvent.setup()
    const grantSchema = z.object({
      grants: z.array(
        z.object({
          grantType: z.string().optional(),
          detail: z.string().optional(),
        }),
      ),
    })

    const addActionMenuFields: FormItem[] = [
      {
        kind: 'array',
        name: 'grants',
        legend: 'Grants',
        addActionLabel: 'Add grant',
        itemCollapsible: true,
        itemHeader: {
          fallback: (index) => `Grant ${index + 1}`,
          primary: (values) => (values.grantType as string | undefined) ?? undefined,
        },
        addActionMenu: {
          groups: [{ id: 'traits', label: 'Traits' }],
          items: [
            {
              id: 'movement-bonus',
              label: 'Movement bonus',
              description: 'Increase speed',
              groupId: 'traits',
              appendDefaults: { grantType: 'movement', detail: 'Walk +5' },
            },
            {
              id: 'language',
              label: 'Language',
              groupId: 'traits',
              appendDefaults: () => ({ grantType: 'languages' }),
            },
          ],
        },
        fields: [
          { type: 'text', name: 'grantType', label: 'Grant type' },
          { type: 'text', name: 'detail', label: 'Detail' },
        ],
      },
    ]

    render(
      <Form<z.infer<typeof grantSchema>>
        schema={grantSchema}
        fields={addActionMenuFields}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Add grant' }))
    await user.click(screen.getByRole('option', { name: /Movement bonus/i }))

    expect(screen.getByDisplayValue('movement')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Walk +5')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Collapse .*movement/i })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    expect(screen.getByRole('textbox', { name: 'Grant type' })).toHaveFocus()
  })

  it('applies duplicate policy states in addActionMenu', async () => {
    const user = userEvent.setup()
    const grantSchema = z.object({
      grants: z.array(z.object({ grantType: z.string().optional() })),
    })

    const duplicateFields: FormItem[] = [
      {
        kind: 'array',
        name: 'grants',
        legend: 'Grants',
        addActionLabel: 'Add grant',
        addActionMenu: {
          groups: [{ id: 'traits', label: 'Traits' }],
          items: [
            {
              id: 'movement-bonus',
              label: 'Movement bonus',
              groupId: 'traits',
              appendDefaults: { grantType: 'movement' },
              duplicatePolicy: 'block',
              isDuplicate: (items) =>
                (items as Array<{ grantType?: string }>).some(
                  (row) => row.grantType === 'movement',
                ),
            },
            {
              id: 'language',
              label: 'Language',
              groupId: 'traits',
              appendDefaults: { grantType: 'languages' },
              duplicatePolicy: 'warn',
              isDuplicate: (items) =>
                (items as Array<{ grantType?: string }>).some(
                  (row) => row.grantType === 'languages',
                ),
            },
          ],
        },
        fields: [{ type: 'text', name: 'grantType', label: 'Grant type' }],
      },
    ]

    render(
      <Form<z.infer<typeof grantSchema>>
        schema={grantSchema}
        fields={duplicateFields}
        defaultValues={{ grants: [{ grantType: 'movement' }, { grantType: 'languages' }] }}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Add grant' }))
    expect(screen.getAllByText('Already added')).toHaveLength(2)
    expect(screen.queryByRole('option', { name: /Movement bonus/i })).not.toBeInTheDocument()
    expect(screen.getByRole('option', { name: /Language/i })).toBeInTheDocument()
  })
})
