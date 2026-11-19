import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { z } from 'zod'

import { Form } from '../../shells/form.client'
import type { FormItem, RowConfig } from '../../field-config'
import { submitAndExpectPayload } from '../../test-utils'

const schema = z.object({
  level: z.number(),
  note: z.string().optional(),
})

type Values = z.infer<typeof schema>

describe('DisplayFieldRenderer', () => {
  it('renders static text with live region when configured', () => {
    const fields: FormItem[] = [
      {
        type: 'number',
        name: 'level',
        label: 'Level',
        required: true,
      },
      {
        kind: 'display',
        id: 'live-summary',
        content: { variant: 'text', text: 'Summary line', role: 'muted', live: 'polite' },
      },
    ]

    render(
      <Form<Values>
        schema={schema}
        fields={fields}
        defaultValues={{ level: 1, note: '' }}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
      />,
    )

    const summary = screen.getByText('Summary line')
    expect(summary).toHaveAttribute('aria-live', 'polite')
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('renders advisory notice without aria-live', () => {
    const fields: FormItem[] = [
      {
        kind: 'display',
        id: 'notice',
        content: {
          variant: 'notice',
          notice: { tone: 'warning', title: 'Heads up', message: 'Persistent note.' },
        },
      },
      { type: 'text', name: 'note', label: 'Note' },
    ]

    render(
      <Form<Values>
        schema={schema}
        fields={fields}
        defaultValues={{ level: 1, note: '' }}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
      />,
    )

    expect(screen.getByText('Heads up')).toBeInTheDocument()
    expect(screen.getByText('Persistent note.')).toBeInTheDocument()
    expect(screen.getByText('Persistent note.').closest('[aria-live]')).toBeNull()
  })

  it('resolves text from dependsOn without dirtying the form', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    const fields: FormItem[] = [
      {
        type: 'number',
        name: 'level',
        label: 'Level',
        required: true,
      },
      {
        kind: 'display',
        id: 'resolved-summary',
        resolve: {
          dependsOn: ['level'],
          contentWhen: (values) => ({
            variant: 'text',
            text: `Tier ends at ${values.level}`,
            role: 'muted',
          }),
        },
      },
    ]

    render(
      <Form<Values>
        schema={schema}
        fields={fields}
        defaultValues={{ level: 3, note: '' }}
        onSubmit={onSubmit}
        footer={<button type="submit">Save</button>}
      />,
    )

    expect(screen.getByText('Tier ends at 3')).toBeInTheDocument()
    const level = screen.getByRole('spinbutton', { name: 'Level' })
    await user.click(level)
    await user.keyboard('{Control>}a{/Control}8')
    expect(screen.getByText('Tier ends at 8')).toBeInTheDocument()
    await submitAndExpectPayload(user, onSubmit, { level: 8 }, { match: 'object' })
  })

  it('renders null for empty resolved content without extra nodes', () => {
    const fields: FormItem[] = [
      { type: 'text', name: 'note', label: 'Note', required: true },
      {
        kind: 'display',
        id: 'hidden-summary',
        resolve: {
          dependsOn: ['note'],
          contentWhen: () => undefined,
        },
      },
    ]

    const { container } = render(
      <Form<Values>
        schema={schema}
        fields={fields}
        defaultValues={{ level: 1, note: 'abc' }}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
      />,
    )

    const note = screen.getByRole('textbox', { name: 'Note' })
    expect(container.querySelectorAll('p')).toHaveLength(0)
    expect(note).toBeInTheDocument()
  })

  it('excludes display from row field items at compile time', () => {
    const _excluded: RowConfig = {
      kind: 'row',
      fields: [
        { type: 'text', name: 'note', label: 'Note' },
        // @ts-expect-error display items are not row participants
        { kind: 'display', id: 'row-display', content: { variant: 'text', text: 'nope' } },
      ],
    }
    expect(_excluded.fields).toHaveLength(2)
  })
})
