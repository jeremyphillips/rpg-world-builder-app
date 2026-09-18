import * as React from 'react'
import { describe, expect, it, vi, afterEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { UseFormReturn } from 'react-hook-form'
import axe from 'axe-core'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'
import { z } from 'zod'

import { Form } from '../shells/form.client'
import type { FormItem } from '../field-config'
import { readArrayItemCollapseOverrides } from '../config/array/array-item-collapse-storage.lib'
import { submitAndExpectPayload } from '../test-utils'
import { collapsibleListItemHeaderVerticalPaddingVariants } from '../../components/ui/collapsible-list-item/collapsible-list-item.variants'
import {
  movementChromeStabilityFields,
  movementChromeStabilitySchema,
  type MovementChromeStabilityValues,
} from './array-field-chrome-stability.harness.client'

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
    item: {
      variant: 'detailed',
      collapsible: true,
      header: {
        fallback: (index) => `Trait ${index + 1}`,
        primaryField: 'name',
        summary: (values) => (values.description as string) || 'No description',
      },
    },
    fields: traitFields,
    addAction: { label: 'Add trait' },
  },
]

const collapsibleTraitFieldsSimpleHeader: FormItem[] = [
  {
    kind: 'array',
    name: 'traits',
    legend: 'Traits',
    item: {
      variant: 'detailed',
      collapsible: true,
      header: {
        fallback: (index) => `Trait ${index + 1}`,
        primaryField: 'name',
      },
    },
    fields: traitFields,
    addAction: { label: 'Add trait' },
  },
]

const fields: FormItem[] = [
  { type: 'text', name: 'name', label: 'Name', required: true },
  {
    kind: 'array',
    name: 'traits',
    legend: 'Traits',
    fields: traitFields,
    addAction: { label: 'Add trait' },
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

  it('wraps a top-level array fieldset in one shared field container', () => {
    const { container } = renderForm()

    const fieldset = screen.getByRole('group', { name: /Traits/ })
    const shell = fieldset.closest('.bg-field-container')
    expect(shell).toBeInstanceOf(HTMLElement)
    expect(shell).toContainElement(fieldset)
    expect(fieldset).toHaveClass('border-0', 'flex', 'flex-col')
    expect(shell).toContainElement(screen.getByText('Traits'))
    expect(shell).toContainElement(screen.getByRole('button', { name: 'Add trait' }))
    expect(container.querySelectorAll('.bg-field-container')).toHaveLength(2)
  })

  it('opts out of the shared array container with fieldChrome none', () => {
    const unboxedFields: FormItem[] = [
      {
        kind: 'array',
        name: 'traits',
        legend: 'Traits',
        fieldChrome: { variant: 'none' },
        fields: traitFields,
        addAction: { label: 'Add trait' },
      },
    ]

    const { container } = render(
      <Form<Values>
        schema={schema}
        fields={unboxedFields}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
      />,
    )

    expect(container.querySelector('.bg-field-container')).toBeNull()
    expect(screen.getByRole('group', { name: /Traits/ })).toBeInTheDocument()
  })

  it('renders the add button, legend, and empty state for an empty array', () => {
    renderForm()
    expect(screen.getByRole('group', { name: /Traits/ })).toBeInTheDocument()
    const legend = screen.getByRole('group', { name: /Traits/ }).querySelector('legend')
    expect(legend).toHaveClass('text-md', 'font-field-label')
    expect(legend).not.toHaveClass('text-field-array-legend')
    expect(legend).not.toHaveClass('text-field-group-legend')
    expect(screen.getByRole('group', { name: /Traits/ }).querySelector(':scope > div')).toHaveClass(
      'gap-3',
    )
    expect(screen.getByRole('button', { name: 'Add trait' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add trait' })).toHaveClass('h-9')
    expect(screen.getByRole('status')).toHaveTextContent('No trait added.')
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
        kind: 'dependent',
        controller: {
          type: 'switch',
          name: 'enabled',
          label: 'Class-specific limits',
          defaultValue: true,
        },

        dependents: {
          fields: [
            {
              kind: 'array',
              name: 'caps',
              legend: '',
              addAction: { label: 'Add class limit' },
              fields: [{ type: 'text', name: 'classId', label: 'Class' }],
            },
          ],
        },
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
    expect(itemShell).toHaveClass('bg-surface-subtle')
    const nest = addButton.closest('[data-field-dependent-nest]')
    expect(nest).toHaveClass('bg-background')
    expect(nest).toContainElement(itemShell)
  })

  it('applies item surface override on array item shells', async () => {
    const user = userEvent.setup()
    const raisedFields: FormItem[] = [
      {
        kind: 'array',
        name: 'traits',
        legend: 'Traits',
        item: { surface: { elevation: 'raised' } },
        fields: traitFields,
        addAction: { label: 'Add trait' },
      },
    ]

    render(
      <Form<Values>
        schema={schema}
        fields={raisedFields}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Add trait' }))

    const itemShell = screen.getByRole('group', { name: 'Trait #1' })
    expect(itemShell).toHaveClass('bg-card')
    expect(itemShell).toHaveClass('shadow-surface-raised')
    expect(itemShell).not.toHaveClass('bg-surface-subtle')
  })

  it('defaults the add control to the outline button variant', () => {
    renderForm()

    const addButton = screen.getByRole('button', { name: 'Add trait' })
    expect(addButton).toHaveClass('border-interactive-outline')
    expect(addButton).not.toHaveClass('bg-primary')
    expect(addButton).not.toHaveClass('bg-secondary')
  })

  it('renders array heading hints beside inline add actions', () => {
    const inlineFields: FormItem[] = [
      {
        kind: 'array',
        name: 'traits',
        heading: {
          label: 'Grants',
          hint: 'Add the mechanical effects this feature provides.',
        },
        fields: traitFields,
        addAction: { label: 'Add grant', layout: 'inline' },
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
    const addButton = screen.getByRole('button', { name: 'Add grant' })

    expect(legend).toHaveTextContent('Grants')
    expect(
      screen.getByText('Add the mechanical effects this feature provides.'),
    ).toBeInTheDocument()
    expect(legend).toContainElement(addButton)
    expect(legend).toHaveClass('w-full')
    expect(document.querySelector('.grid.items-start')).toBeTruthy()
  })

  it('renders inline add actions in the legend row with a leading plus icon', () => {
    const inlineFields: FormItem[] = [
      {
        kind: 'array',
        name: 'traits',
        legend: 'Movement',
        fields: traitFields,
        addAction: { label: 'Add speed', layout: 'inline' },
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
    expect(legend).toHaveClass('w-full')
    expect(addButton).toHaveClass('h-8')
    expect(addButton.querySelector('svg')).toBeTruthy()
    expect(screen.getAllByRole('button', { name: 'Add speed' })).toHaveLength(1)
  })

  it('keeps stacked add actions below the item list with action-owned spacing', () => {
    renderForm()

    const fieldset = screen.getByRole('group', { name: /Traits/i })
    const addButton = screen.getByRole('button', { name: 'Add trait' })
    const legend = fieldset.querySelector('legend')

    expect(legend).not.toContainElement(addButton)
    expect(addButton.closest('.mt-4')).toBeTruthy()
    expect(addButton.querySelector('svg')).toBeTruthy()
  })

  it('omits the add icon when showAddIcon is false', () => {
    const noIconFields: FormItem[] = [
      {
        kind: 'array',
        name: 'traits',
        legend: 'Traits',
        fields: traitFields,
        addAction: { label: 'Choose preset', icon: false },
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
        addAction: { label: 'Add trait', size: 'sm' },
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
        addAction: { label: 'Add trait', variant: 'secondary' },
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
    expect(addButton).not.toHaveClass('border-interactive-outline')
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
        addAction: {
          label: 'Add grant',
          variant: 'default',
          menu: {
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
        fields: [{ type: 'text', name: 'grantType', label: 'Grant type' }],
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
    expect(addButton).not.toHaveClass('border-interactive-outline')

    await user.click(addButton)
    expect(screen.getByRole('option', { name: 'Movement bonus' })).toBeInTheDocument()
  })

  it('defaults flat array item shells to the subtle content plane', async () => {
    const user = userEvent.setup()
    renderForm()
    await user.click(screen.getByRole('button', { name: 'Add trait' }))

    const itemShell = screen.getByRole('group', { name: 'Trait #1' })
    expect(itemShell).toHaveClass('bg-surface-subtle')
    expect(itemShell).toHaveClass('border-border')
    expect(itemShell).not.toHaveClass('bg-card')
    expect(itemShell).not.toHaveClass('shadow-surface-raised')

    const body = itemShell.querySelector('[id$="-body"]')
    expect(body).toHaveClass('bg-background')
    expect(body).toHaveClass('border-t')
  })

  it('uses tighter disclosure gaps between collapsible array items', async () => {
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

    const list = screen.getByRole('group', { name: /Traits/ }).querySelector(':scope > div')
    expect(list).toHaveClass('gap-2')
  })

  it('uses 12px disclosure gaps for comfortable collapsible arrays', async () => {
    const user = userEvent.setup()
    const comfortableCollapsibleFields: FormItem[] = [
      {
        kind: 'array',
        name: 'traits',
        legend: 'Traits',
        density: 'comfortable',
        item: {
          variant: 'detailed',
          collapsible: true,
          header: {
            fallback: (index) => `Trait ${index + 1}`,
            primaryField: 'name',
          },
        },
        fields: traitFields,
        addAction: { label: 'Add trait' },
      },
    ]

    render(
      <Form<Values>
        schema={schema}
        fields={comfortableCollapsibleFields}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Add trait' }))
    await user.click(screen.getByRole('button', { name: 'Add trait' }))

    const list = screen.getByRole('group', { name: /Traits/ }).querySelector(':scope > div')
    expect(list).toHaveClass('gap-3')
    expect(list).not.toHaveClass('gap-6')
  })

  it('uses gap-6 between comfortable-density array items while keeping gap-6 inside item bodies', async () => {
    const user = userEvent.setup()
    const comfortableFields: FormItem[] = [
      {
        kind: 'array',
        name: 'traits',
        legend: 'Traits',
        density: 'comfortable',
        fields: traitFields,
        addAction: { label: 'Add trait' },
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
    expect(list).toHaveClass('gap-6')

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
      'rounded-sm',
      'border',
      'border-border',
      'bg-surface-subtle',
      'pl-2',
      'py-2',
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
    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Elf')
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
    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Elf')
    await user.click(screen.getByRole('button', { name: 'Add trait' }))
    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(await screen.findByText('Trait name is required')).toBeInTheDocument()
  })

  it('keeps the add button visible and disabled when resolveCanAppend reports saturation', async () => {
    const saturatedFields: FormItem[] = [
      {
        kind: 'array',
        name: 'modes',
        legend: 'Modes',
        fields: [{ type: 'select', name: 'mode', label: 'Mode', options: [] }],
        addAction: { label: 'Add mode' },
        resolveCanAppend: (items) =>
          (items as { mode: string }[]).filter((row) => row.mode).length >= 2
            ? { enabled: false, reason: 'All modes have been added.' }
            : { enabled: true },
      },
    ]
    const saturatedSchema = z.object({ modes: z.array(z.object({ mode: z.string() })) })

    render(
      <Form
        schema={saturatedSchema}
        fields={saturatedFields}
        defaultValues={{ modes: [{ mode: 'walk' }, { mode: 'fly' }] }}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
      />,
    )

    const addButton = screen.getByRole('button', { name: 'Add mode' })
    expect(addButton).toBeDisabled()
    expect(addButton).toHaveAttribute('title', 'All modes have been added.')
  })

  it('keeps the add button visible and disabled when max is reached', async () => {
    const user = userEvent.setup()
    const maxFields: FormItem[] = [
      {
        kind: 'array',
        name: 'traits',
        legend: 'Traits',
        fields: traitFields,
        addAction: { label: 'Add trait' },
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
    const addButton = screen.getByRole('button', { name: 'Add trait' })
    expect(addButton).toBeDisabled()
    expect(addButton).toHaveAttribute('title', 'Add up to 1 items.')
  })

  it('allows removing the last item and shows neutral empty-state copy only', async () => {
    const user = userEvent.setup()
    const minFields: FormItem[] = [
      {
        kind: 'array',
        name: 'traits',
        legend: 'Traits',
        fields: traitFields,
        addAction: { label: 'Add trait' },
        min: 1,
      },
    ]
    const minSchema = z.object({ traits: z.array(traitSchema).min(1) })
    render(
      <Form
        schema={minSchema}
        fields={minFields}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Add trait' }))
    const removeButton = screen.getByRole('button', { name: 'Remove Traits · Trait #1' })
    expect(removeButton).toBeEnabled()
    await user.click(removeButton)

    expect(screen.getByRole('status')).toHaveTextContent('No trait added.')
    expect(screen.queryByText(/Add at least one trait/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Trait name')).not.toBeInTheDocument()
  })

  it('shows container validation error and legend issue link after failed submit on empty min arrays', async () => {
    const user = userEvent.setup()
    const minFields: FormItem[] = [
      {
        kind: 'array',
        name: 'traits',
        legend: 'Traits',
        fields: traitFields,
        addAction: { label: 'Add trait' },
        min: 1,
      },
    ]
    const minSchema = z.object({ traits: z.array(traitSchema).min(1) })
    render(
      <Form
        schema={minSchema}
        fields={minFields}
        defaultValues={{ traits: [] }}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(screen.getByRole('status')).toHaveTextContent('No trait added.')
    expect(screen.getByText('Add at least one trait.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Review 1 issue in Traits/i })).toBeInTheDocument()
  })

  it('shows required marker on array legend when min is at least one', async () => {
    render(
      <Form
        schema={z.object({ traits: z.array(traitSchema).min(1) })}
        fields={[
          {
            kind: 'array',
            name: 'traits',
            legend: 'Traits',
            fields: traitFields,
            addAction: { label: 'Add trait' },
            min: 1,
          },
        ]}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
      />,
    )

    expect(screen.getByText('*', { selector: 'legend *' })).toBeInTheDocument()
  })

  it('shows empty-state primary copy without validation error on initial empty arrays', () => {
    render(
      <Form
        schema={z.object({ traits: z.array(traitSchema) })}
        fields={[
          {
            kind: 'array',
            name: 'traits',
            legend: 'Traits',
            fields: traitFields,
            addAction: { label: 'Add trait' },
            min: 1,
          },
        ]}
        defaultValues={{ traits: [] }}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
      />,
    )

    expect(screen.getByRole('status')).toHaveTextContent('No trait added.')
    expect(screen.queryByText(/Add at least one trait/i)).not.toBeInTheDocument()
  })

  it('omits the default remove button when hideItemRemove is true', async () => {
    const user = userEvent.setup()
    const hiddenRemoveFields: FormItem[] = [
      {
        kind: 'array',
        name: 'traits',
        legend: 'Traits',
        fields: traitFields,
        addAction: { label: 'Add trait' },
        item: { removable: false },
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
        addAction: { label: 'Add trait' },
        item: {
          removeSlot: {
            name: '_customTraitRemove',
            render: () => <button type="button">Custom remove</button>,
          },
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
        addAction: { label: 'Add grant' },
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
            legend: 'Spell entries',
            addAction: { label: 'Add entry' },
            visibility: {
              dependsOn: ['grantType'],
              visibleWhen: (v) => v.grantType === 'spells',
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

    expect(screen.getByRole('textbox', { name: 'Sense detail' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Add entry' })).not.toBeInTheDocument()

    await user.clear(screen.getByRole('textbox', { name: 'Grant type' }))
    await user.type(screen.getByRole('textbox', { name: 'Grant type' }), 'spells')

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
        addAction: { label: 'Add entry' },
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
    expect(screen.getByRole('textbox', { name: 'Detail' })).toBeInTheDocument()
  })

  itAxe('has no axe violations with a populated array', async () => {
    const user = userEvent.setup()
    const { container } = renderForm()
    await user.click(screen.getByRole('button', { name: 'Add trait' }))
    await expectNoAxeViolations(container)
  })

  itAxe('has no axe violations on an empty array', async () => {
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
        addAction: { label: 'Add item' },
        fields: [
          { type: 'text', name: 'name', label: 'Name' },
          {
            kind: 'array',
            name: 'tags',
            legend: 'Tags',
            addAction: { label: 'Add tag' },
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
        item: { reorder: false },
        fields: traitFields,
        addAction: { label: 'Add trait' },
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

  it('bleeds detailed collapsible item bodies to the shell edge via CollapsibleListItem', async () => {
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

    const itemShell = screen.getByRole('group', { name: 'Trait 1' })
    expect(itemShell).toHaveClass('pb-0')
    const body = itemShell.querySelector('[id$="-body"]')
    expect(body).not.toBeNull()
    expect(body).toHaveClass('bg-background')
    expect(body).toHaveClass('-ml-2')
    expect(body).toHaveClass('-mr-3')
    expect(body).toHaveClass('pl-[var(--content-inline-start)]')
    expect(body).not.toHaveClass('pl-[var(--content-column-indent)]')
  })

  it('stacks summary subheadlines with a 2px gap below the title row', async () => {
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

    const itemShell = screen.getByRole('group', { name: /Darkvision/ })
    const headerRow = itemShell.firstElementChild as HTMLElement
    const headerStack = headerRow.firstElementChild as HTMLElement
    const summary = screen.getByText('See in the dark', { selector: 'p' })

    expect(headerRow).toHaveClass(
      collapsibleListItemHeaderVerticalPaddingVariants({ density: 'compact' }),
    )
    expect(headerStack).toHaveClass('gap-0.5')
    expect(headerStack).toContainElement(summary)
  })

  it('keeps header rhythm invariant when a summarized item is collapsed', async () => {
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

    const collapseTrigger = screen.getByRole('button', { name: /Collapse .*Darkvision/ })
    await user.click(collapseTrigger)

    const itemShell = screen.getByRole('group', { name: /Darkvision/ })
    const headerRow = itemShell.firstElementChild as HTMLElement
    expect(headerRow).toHaveClass(
      collapsibleListItemHeaderVerticalPaddingVariants({ density: 'compact' }),
    )
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

  it('embeds compact stacked item actions in the flatNoHeader row grid', async () => {
    const user = userEvent.setup()
    const compactFields: FormItem[] = [
      {
        kind: 'array',
        name: 'traits',
        legend: 'Traits',
        item: {
          variant: 'compact',
          header: { fallback: (index) => `Trait ${index + 1}`, srOnly: true },
        },
        fields: traitFields,
        addAction: { label: 'Add trait' },
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

    const item = screen.getByRole('group', { name: 'Traits · Trait 1' })
    const actionsRail = within(item).getByRole('group', { name: 'Item actions' })
    const removeButton = screen.getByRole('button', { name: 'Remove Traits · Trait 1' })

    expect(item).toContainElement(actionsRail)
    expect(actionsRail).toContainElement(removeButton)
    expect(document.querySelector('[data-array-item-flat-no-header]')).toHaveAttribute(
      'data-array-item-content-layout',
      'stacked',
    )
    expect(document.querySelector('[data-compact-inline-row]')).toBeInTheDocument()
    expect(actionsRail).toHaveClass('self-center')
    expect(actionsRail).not.toHaveClass('mt-1')
  })

  it('lays out compact inline rows on the shared anatomy grid with embedded actions', async () => {
    const compactRowFields: FormItem[] = [
      {
        kind: 'array',
        name: 'grants',
        legend: 'Grants',
        item: {
          variant: 'compact',
          header: { fallback: (index) => `Grant ${index + 1}`, srOnly: true },
        },
        fields: [
          {
            kind: 'row',
            fields: [
              { type: 'text', name: 'grantType', label: 'Type', required: true },
              { type: 'text', name: 'detail', label: 'Detail' },
            ],
          },
        ],
        addAction: { label: 'Add grant' },
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

    const inlineRow = document.querySelector('[data-array-item-anatomy-inline-row]')
    expect(inlineRow).toBeInTheDocument()
    const anatomyGrid = document.querySelector('[data-array-item-anatomy-grid]')
    expect(anatomyGrid).toBeInTheDocument()
    expect(anatomyGrid?.querySelector('[data-field-row-anatomy]')).toBeNull()

    const actionsRail = anatomyGrid!.querySelector('[aria-label="Item actions"]')
    expect(actionsRail).toBeInTheDocument()
    expect(actionsRail).not.toHaveClass('mt-1')
    expect(actionsRail?.closest('[data-array-item-anatomy-actions]')).toBeInTheDocument()
  })

  it('honors FieldRow width tokens inside compact inline rows', async () => {
    const compactWidthFields: FormItem[] = [
      {
        kind: 'array',
        name: 'utilizes',
        legend: 'Utilize actions',
        item: {
          variant: 'compact',
          header: { fallback: (index) => `Action ${index + 1}`, primaryField: 'description' },
        },
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
        addAction: { label: 'Add utilize action' },
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

    expect(document.querySelector('[data-array-item-anatomy-grid]')).toBeInTheDocument()

    expect(
      screen.getByRole('textbox', { name: 'Description' }).closest('[data-field-row-participant]'),
    ).toHaveClass('min-w-0', 'w-full')
    expect(
      screen.getByRole('spinbutton', { name: 'DC' }).closest('[data-field-row-participant]'),
    ).toHaveClass('w-fit')
  })

  it('centers unlabeled compact inline grip and actions in the shared anatomy grid cell', () => {
    const centeredCompactRowFields: FormItem[] = [
      {
        kind: 'array',
        name: 'examples',
        legend: 'Examples',
        item: {
          variant: 'compact',
          headerVisibility: 'hidden',
          reorder: 'dragHandle',
          header: { fallback: (index) => `Example ${index + 1}`, primaryField: 'value' },
        },
        fields: [
          {
            kind: 'row',
            fields: [{ type: 'text', name: 'value', label: '', placeholder: 'Example…' }],
          },
        ],
        addAction: { label: 'Add example' },
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

    expect(document.querySelector('[data-array-item-anatomy-inline-row]')).toBeInTheDocument()
    expect(document.querySelector('[data-array-item-anatomy-grid]')).toBeInTheDocument()
    expect(document.querySelector('[data-field-row-anatomy]')).toBeNull()

    expect(document.querySelector('[data-array-item-anatomy-grip]')).toHaveClass('items-center')
    expect(document.querySelector('[data-array-item-anatomy-actions]')).toHaveClass('items-center')
  })

  it('keeps movement-shaped inline chrome on the anatomy grid when the message track grows', async () => {
    function MovementFeetErrorEffect({
      form,
      message,
    }: {
      form: UseFormReturn<MovementChromeStabilityValues>
      message?: string
    }) {
      React.useEffect(() => {
        form.clearErrors('movement.0.feet')
        if (message) {
          form.setError('movement.0.feet', { type: 'manual', message })
        }
      }, [form, message])
      return null
    }

    function MovementChromeFixture({ errorMessage }: { errorMessage?: string }) {
      return (
        <Form<MovementChromeStabilityValues>
          id="movement-chrome-test"
          schema={movementChromeStabilitySchema}
          fields={movementChromeStabilityFields}
          defaultValues={{ movement: [{ mode: 'walk', feet: 30 }] }}
          onSubmit={vi.fn()}
          header={(form) => <MovementFeetErrorEffect form={form} message={errorMessage} />}
          footer={<button type="submit">Save</button>}
        />
      )
    }

    const assertAnatomyGridChrome = () => {
      const anatomyGrid = document.querySelector('[data-array-item-anatomy-grid]')
      expect(anatomyGrid).toBeInTheDocument()
      expect(anatomyGrid?.querySelector('[data-field-row-anatomy]')).toBeNull()

      const grip = document.querySelector('[data-array-item-anatomy-grip]') as HTMLElement | null
      const actions = document.querySelector(
        '[data-array-item-anatomy-actions]',
      ) as HTMLElement | null

      expect(grip).toHaveStyle({ gridRow: '1 / -1' })
      expect(actions).toHaveStyle({ gridRow: '1 / -1' })
      expect(grip).toHaveClass('items-center')
      expect(actions).toHaveClass('items-center')
      expect(anatomyGrid).toContainElement(grip)
      expect(anatomyGrid).toContainElement(actions)
    }

    const { rerender } = render(<MovementChromeFixture />)
    assertAnatomyGridChrome()

    rerender(
      <MovementChromeFixture errorMessage="Speed must be a positive whole number and cannot exceed the species movement cap for this mode." />,
    )

    await waitFor(() => {
      expect(screen.getByText(/species movement cap/i)).toBeInTheDocument()
    })
    assertAnatomyGridChrome()
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
      screen.queryByRole('button', { name: '1 issue in Traits · Darkvision' }),
    ).not.toBeInTheDocument()
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

  it('shows per-field error text inline on compact rows', async () => {
    const user = userEvent.setup()
    const grantSchema = z.object({
      grants: z.array(
        z.object({
          rarity: z.string().min(1),
          quantity: z.string().min(1),
        }),
      ),
    })

    const compactGrantFields: FormItem[] = [
      {
        kind: 'array',
        name: 'grants',
        legend: 'Grants',
        item: {
          variant: 'compact',
          header: { fallback: (index) => `Grant ${index + 1}`, srOnly: true },
        },
        fields: [
          { type: 'select', name: 'rarity', label: 'Rarity', options: [], required: true },
          { type: 'text', name: 'quantity', label: 'Quantity', required: true },
        ],
        addAction: { label: 'Add grant' },
        min: 1,
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
      expect(screen.getByRole('combobox', { name: 'Rarity' })).toHaveAttribute(
        'aria-invalid',
        'true',
      )
      expect(screen.getByRole('textbox', { name: 'Quantity' })).toHaveAttribute(
        'aria-invalid',
        'true',
      )
    })

    expect(screen.getByText('Choose a rarity.')).toBeInTheDocument()
    expect(screen.getByText('Quantity is required.')).toBeInTheDocument()
    expect(
      within(screen.getByRole('group', { name: 'Item actions' })).queryByRole('button', {
        name: /issues/i,
      }),
    ).not.toBeInTheDocument()
  })

  it('surfaces a joined row summary on compact rows when errorPlacement is row', async () => {
    const user = userEvent.setup()
    const grantSchema = z.object({
      grants: z.array(
        z.object({
          rarity: z.string().min(1),
          quantity: z.string().min(1),
        }),
      ),
    })

    const compactGrantFields: FormItem[] = [
      {
        kind: 'array',
        name: 'grants',
        legend: 'Grants',
        errorPlacement: 'row',
        item: {
          variant: 'compact',
          header: { fallback: (index) => `Grant ${index + 1}`, srOnly: true },
        },
        fields: [
          { type: 'select', name: 'rarity', label: 'Rarity', options: [], required: true },
          { type: 'text', name: 'quantity', label: 'Quantity', required: true },
        ],
        addAction: { label: 'Add grant' },
        min: 1,
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
      expect(screen.getByRole('combobox', { name: 'Rarity' })).toHaveAttribute(
        'aria-invalid',
        'true',
      )
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
        addAction: {
          label: 'Add grant',
          menu: {
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
        },
        item: {
          collapsible: true,
          header: {
            fallback: (index) => `Grant ${index + 1}`,
            primary: (values) => (values.grantType as string | undefined) ?? undefined,
          },
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
        addAction: {
          label: 'Add grant',
          menu: {
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

  describe('item presentation matrix', () => {
    it('renders unlabeled stacked rows without visible item headers when headerVisibility is hidden', async () => {
      const user = userEvent.setup()
      const fields: FormItem[] = [
        {
          kind: 'array',
          name: 'movement',
          legend: 'Movement',
          item: {
            variant: 'compact',
            headerVisibility: 'hidden',
            header: {
              fallback: (index) => `Movement ${index + 1}`,
              primaryField: 'mode',
            },
          },
          fields: [
            { type: 'text', name: 'mode', label: 'Mode', required: true },
            { type: 'text', name: 'feet', label: 'Feet', required: true },
          ],
          addAction: { label: 'Add speed' },
        },
      ]

      render(
        <Form<{ movement: Array<{ mode: string; feet: string }> }>
          schema={z.object({
            movement: z.array(z.object({ mode: z.string(), feet: z.string() })),
          })}
          fields={fields}
          onSubmit={vi.fn()}
          footer={<button type="submit">Save</button>}
        />,
      )

      await user.click(screen.getByRole('button', { name: 'Add speed' }))

      expect(document.querySelector('[data-array-item-flat-no-header]')).toBeInTheDocument()
      expect(
        document.querySelector('[data-array-item-content-layout="stacked"]'),
      ).toBeInTheDocument()
      expect(screen.queryByText('Movement 1')).not.toBeInTheDocument()
      expect(screen.getByRole('group', { name: 'Movement · Movement 1' })).toBeInTheDocument()
    })

    it('keeps collapsible header anatomy when headerVisibility hidden is normalized', async () => {
      render(
        <Form<{ traits: Array<{ name: string }> }>
          schema={z.object({ traits: z.array(z.object({ name: z.string() })) })}
          fields={[
            {
              kind: 'array',
              name: 'traits',
              legend: 'Traits',
              item: {
                collapsible: true,
                headerVisibility: 'hidden',
                header: { fallback: (index) => `Trait ${index + 1}`, primaryField: 'name' },
              },
              fields: [{ type: 'text', name: 'name', label: 'Trait name' }],
              addAction: { label: 'Add trait' },
            },
          ]}
          defaultValues={{ traits: [{ name: 'Darkvision' }] }}
          onSubmit={vi.fn()}
          footer={<button type="submit">Save</button>}
        />,
      )

      expect(screen.getByRole('button', { name: /Collapse .*Darkvision/ })).toBeInTheDocument()
    })

    it('renders equivalent flatNoHeader chrome for bare text, row wrap, and inlineSentence', async () => {
      const user = userEvent.setup()
      const baseItem = {
        variant: 'compact' as const,
        headerVisibility: 'hidden' as const,
        header: { fallback: (index: number) => `Row ${index + 1}` },
      }

      const cases: FormItem[][] = [
        [{ type: 'text', name: 'value', label: 'Value', required: true }],
        [
          {
            kind: 'row',
            fields: [{ type: 'text', name: 'value', label: 'Value', required: true }],
          },
        ],
        [
          {
            type: 'inlineSentence',
            name: 'sentence',
            label: 'Value',
            labelVisibility: 'srOnly',
            segments: [
              {
                kind: 'select',
                name: 'value',
                options: [{ value: 'sample', label: 'Sample' }],
                defaultValue: 'sample',
                width: 'full',
              },
            ],
          },
        ],
      ]

      for (const fields of cases) {
        const { unmount } = render(
          <Form<{ rows: Array<{ value: string }> }>
            schema={z.object({ rows: z.array(z.object({ value: z.string() })) })}
            fields={[
              {
                kind: 'array',
                name: 'rows',
                legend: 'Rows',
                item: baseItem,
                fields,
                addAction: { label: 'Add row' },
              },
            ]}
            onSubmit={vi.fn()}
            footer={<button type="submit">Save</button>}
          />,
        )

        await user.click(screen.getByRole('button', { name: 'Add row' }))

        const flatShell = document.querySelector('[data-array-item-flat-no-header]')
        expect(flatShell).toBeInTheDocument()
        expect(flatShell).toHaveAttribute('data-array-item-content-layout', 'inline')
        expect(document.querySelector('[data-array-item-anatomy-inline-row]')).toBeInTheDocument()
        expect(document.querySelector('[data-array-item-anatomy-grid]')).toBeInTheDocument()

        unmount()
      }
    })

    it('reserves drag-handle geometry when reorder is configured but only one item exists', async () => {
      const user = userEvent.setup()
      const fields: FormItem[] = [
        {
          kind: 'array',
          name: 'tags',
          legend: 'Tags',
          item: {
            variant: 'compact',
            headerVisibility: 'hidden',
            header: { fallback: (index) => `Tag ${index + 1}`, srOnly: true },
          },
          fields: [{ type: 'text', name: 'label', label: 'Label', required: true }],
          addAction: { label: 'Add tag' },
        },
      ]

      render(
        <Form<{ tags: Array<{ label: string }> }>
          schema={z.object({ tags: z.array(z.object({ label: z.string() })) })}
          fields={fields}
          onSubmit={vi.fn()}
          footer={<button type="submit">Save</button>}
        />,
      )

      await user.click(screen.getByRole('button', { name: 'Add tag' }))
      const anatomyGrid = document.querySelector('[data-array-item-anatomy-grid]') as HTMLElement
      expect(anatomyGrid).toBeInTheDocument()
      expect(anatomyGrid.style.gridTemplateColumns).toContain('var(--leading-chrome-size)')
      expect(
        anatomyGrid.querySelector('[aria-hidden="true"][class*="opacity-0"]'),
      ).toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: 'Add tag' }))
      expect(screen.getAllByLabelText(/Drag to reorder/i)).toHaveLength(2)

      await user.click(screen.getAllByRole('button', { name: /Remove/i })[1]!)
      expect(
        (document.querySelector('[data-array-item-anatomy-grid]') as HTMLElement).style
          .gridTemplateColumns,
      ).toContain('var(--leading-chrome-size)')
    })
  })
})
