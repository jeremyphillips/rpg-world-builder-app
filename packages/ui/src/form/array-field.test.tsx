import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { z } from 'zod'

import { Form } from './form.client'
import type { FormItem } from './field-config'

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
    expect(screen.getByText('Traits')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add trait' })).toBeInTheDocument()
    expect(screen.queryByLabelText('Trait name')).not.toBeInTheDocument()
  })

  it('adds an item when the add button is clicked', async () => {
    const user = userEvent.setup()
    renderForm()
    await user.click(screen.getByRole('button', { name: 'Add trait' }))
    expect(screen.getByRole('textbox', { name: 'Trait name' })).toBeInTheDocument()
  })

  it('removes an item when the remove button is clicked', async () => {
    const user = userEvent.setup()
    renderForm()
    await user.click(screen.getByRole('button', { name: 'Add trait' }))
    expect(screen.getByRole('textbox', { name: 'Trait name' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Remove Traits item 1' }))
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
    expect(screen.getByRole('button', { name: 'Remove Traits item 1' })).toBeDisabled()
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
})
