import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useFormContext } from 'react-hook-form'
import axe from 'axe-core'
import { z } from 'zod'

import { Form } from '../shells/form.client'
import { useFormSectionContext } from '../context/form-section.context'
import type { FormItem } from '../field-config'
import { submitAndExpectPayload } from '../test-utils'

function SlotDensityProbe() {
  const { density } = useFormSectionContext()
  return <span data-testid="slot-density">{density}</span>
}

function NotesSlot() {
  const { register } = useFormContext<{ notes: string }>()
  return <textarea aria-label="Notes" {...register('notes')} />
}

function NullSlot() {
  return null
}

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  notes: z.string().optional(),
})

type Values = z.infer<typeof schema>

const fields: FormItem[] = [
  { type: 'text', name: 'name', label: 'Name', required: true },
  {
    kind: 'slot',
    name: 'notes',
    label: 'Notes',
    hint: 'Optional author notes.',
    render: () => <NotesSlot />,
  },
]

function renderForm(onSubmit: (values: Values) => void = vi.fn()) {
  return render(
    <Form<Values>
      schema={schema}
      fields={fields}
      defaultValues={{ notes: '' }}
      onSubmit={onSubmit}
      footer={<button type="submit">Save</button>}
    />,
  )
}

describe('SlotFieldRenderer', () => {
  it('renders slot label, hint, and custom control', () => {
    renderForm()
    expect(screen.getByText('Notes')).toBeInTheDocument()
    expect(screen.getByText('Optional author notes.')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Notes' })).toBeInTheDocument()
    expect(screen.getByText('Notes')).not.toHaveClass('text-field-group-legend')
    expect(screen.getByText('Notes')).toHaveClass('font-field-label')
  })

  it('submits values managed by the slot control', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    renderForm(onSubmit)

    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Alert')
    await user.type(screen.getByRole('textbox', { name: 'Notes' }), 'Watchful')
    await submitAndExpectPayload(user, onSubmit, { name: 'Alert', notes: 'Watchful' })
  })

  it('has no critical accessibility violations', async () => {
    const { container } = renderForm()
    const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
    expect(results.violations.filter((v) => v.impact === 'critical')).toEqual([])
  })

  it('inherits parent density in slot child context', () => {
    const sizedFields: FormItem[] = [
      { type: 'text', name: 'name', label: 'Name', required: true },
      {
        kind: 'slot',
        name: 'notes',
        label: 'Notes',
        render: () => <SlotDensityProbe />,
      },
    ]

    render(
      <Form<Values>
        schema={schema}
        fields={sizedFields}
        defaultValues={{ notes: '' }}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
        density="compact"
      />,
    )

    expect(screen.getByTestId('slot-density')).toHaveTextContent('compact')
  })

  it('defaults slot child context to comfortable form density', () => {
    const probeFields: FormItem[] = [
      { type: 'text', name: 'name', label: 'Name', required: true },
      {
        kind: 'slot',
        name: 'notes',
        label: 'Notes',
        hint: 'Optional author notes.',
        render: () => <SlotDensityProbe />,
      },
    ]

    render(
      <Form<Values>
        schema={schema}
        fields={probeFields}
        defaultValues={{ notes: '' }}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
      />,
    )

    expect(screen.getByTestId('slot-density')).toHaveTextContent('comfortable')
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveClass('h-9')
  })

  it('omits the rhythm wrapper when an unlabeled slot renders null', () => {
    const nullSlotFields: FormItem[] = [
      {
        kind: 'slot',
        name: 'empty',
        render: () => null,
      },
      { type: 'text', name: 'name', label: 'Name', required: true },
    ]

    const { container } = render(
      <Form<Values>
        schema={schema}
        fields={nullSlotFields}
        defaultValues={{ notes: '' }}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
        density="compact"
      />,
    )

    expect(container.querySelectorAll('.flex.flex-col.gap-3')).toHaveLength(1)
    expect(screen.getByRole('textbox', { name: 'Name' })).toBeInTheDocument()
  })

  it('omits the rhythm wrapper when an unlabeled slot component renders null', () => {
    const nullComponentSlotFields: FormItem[] = [
      {
        kind: 'slot',
        name: 'empty',
        render: () => <NullSlot />,
      },
      { type: 'text', name: 'name', label: 'Name', required: true },
    ]

    const { container } = render(
      <Form<Values>
        schema={schema}
        fields={nullComponentSlotFields}
        defaultValues={{ notes: '' }}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
        density="compact"
      />,
    )

    expect(container.querySelectorAll('.flex.flex-col.gap-3')).toHaveLength(1)
    expect(screen.getByRole('textbox', { name: 'Name' })).toBeInTheDocument()
  })

  it('wraps a slot with a trailing separator when configured', () => {
    const separatorFields: FormItem[] = [
      {
        kind: 'slot',
        name: 'notes',
        label: 'Notes',
        separator: 'subtle',
        render: () => <NotesSlot />,
      },
      { type: 'text', name: 'name', label: 'Name', required: true },
    ]

    const { container } = render(
      <Form<Values>
        schema={schema}
        fields={separatorFields}
        defaultValues={{ notes: '' }}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
      />,
    )

    const separator = container.querySelector('[data-field-separator]')
    expect(separator).toBeInTheDocument()
    expect(separator).toHaveClass('border-b', 'border-border-subtle', 'pb-7')
    expect(separator).toContainElement(screen.getByRole('textbox', { name: 'Notes' }))
    expect(separator).not.toContainElement(screen.getByRole('textbox', { name: 'Name' }))
  })

  it('uses compact separator padding when the parent group rhythm is compact', () => {
    const compactGroupFields: FormItem[] = [
      {
        kind: 'group',
        legend: 'Campaign access',
        density: 'compact',
        fields: [
          {
            kind: 'slot',
            name: 'notes',
            label: 'Notes',
            separator: 'subtle',
            render: () => <NotesSlot />,
          },
          { type: 'text', name: 'name', label: 'Name', required: true },
        ],
      },
    ]

    const { container } = render(
      <Form<Values>
        schema={schema}
        fields={compactGroupFields}
        defaultValues={{ notes: '' }}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
      />,
    )

    const separator = container.querySelector('[data-field-separator]')
    expect(separator).toBeInTheDocument()
    expect(separator).toHaveClass('border-b', 'border-border-subtle', 'pb-2')
    expect(separator).not.toHaveClass('pb-7')
  })

  it('wraps slot content in panel chrome when configured', () => {
    const chromedFields: FormItem[] = [
      {
        kind: 'slot',
        name: 'notes',
        hint: 'Optional author notes.',
        chrome: { variant: 'panel' },
        render: () => <NotesSlot />,
      },
      { type: 'text', name: 'name', label: 'Name', required: true },
    ]

    const { container } = render(
      <Form<Values>
        schema={schema}
        fields={chromedFields}
        defaultValues={{ notes: '' }}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
      />,
    )

    const chromeShell = container.querySelector('.rounded-md.border.bg-surface-subtle')
    expect(chromeShell).toBeTruthy()
    expect(chromeShell).toContainElement(screen.getByRole('textbox', { name: 'Notes' }))
    expect(chromeShell).toContainElement(screen.getByText('Optional author notes.'))
  })

  it('hides a slot when its visibility predicate is false', () => {
    const conditionalFields: FormItem[] = [
      {
        type: 'switch',
        name: 'showNotes',
        label: 'Show notes',
      },
      {
        kind: 'slot',
        name: 'notes',
        label: 'Notes',
        visibility: {
          dependsOn: ['showNotes'],
          visibleWhen: (values) => values.showNotes === true,
        },
        render: () => <NotesSlot />,
      },
    ]

    render(
      <Form<Values & { showNotes?: boolean }>
        schema={schema.extend({ showNotes: z.boolean().optional() })}
        fields={conditionalFields}
        defaultValues={{ notes: '', showNotes: false }}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
      />,
    )

    expect(screen.queryByRole('textbox', { name: 'Notes' })).not.toBeInTheDocument()
  })
})
