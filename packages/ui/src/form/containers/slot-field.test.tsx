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

function SlotSizeProbe() {
  const { size } = useFormSectionContext()
  return <span data-testid="slot-size">{size}</span>
}

function NotesSlot() {
  const { register } = useFormContext<{ notes: string }>()
  return <textarea aria-label="Notes" {...register('notes')} />
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
  })

  it('submits values managed by the slot control', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    renderForm(onSubmit)

    await user.type(screen.getByLabelText('Name'), 'Alert')
    await user.type(screen.getByRole('textbox', { name: 'Notes' }), 'Watchful')
    await submitAndExpectPayload(user, onSubmit, { name: 'Alert', notes: 'Watchful' })
  })

  it('has no critical accessibility violations', async () => {
    const { container } = renderForm()
    const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
    expect(results.violations.filter((v) => v.impact === 'critical')).toEqual([])
  })

  it('passes explicit size sm into slot child context', () => {
    const sizedFields: FormItem[] = [
      { type: 'text', name: 'name', label: 'Name', required: true },
      {
        kind: 'slot',
        name: 'notes',
        label: 'Notes',
        size: 'sm',
        render: () => <SlotSizeProbe />,
      },
    ]

    render(
      <Form<Values>
        schema={schema}
        fields={sizedFields}
        defaultValues={{ notes: '' }}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
      />,
    )

    expect(screen.getByTestId('slot-size')).toHaveTextContent('sm')
  })

  it('defaults slot child context to sm when size is omitted', () => {
    const probeFields: FormItem[] = [
      { type: 'text', name: 'name', label: 'Name', required: true },
      {
        kind: 'slot',
        name: 'notes',
        label: 'Notes',
        hint: 'Optional author notes.',
        render: () => <SlotSizeProbe />,
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

    expect(screen.getByTestId('slot-size')).toHaveTextContent('sm')
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveClass('h-9')
  })
})
