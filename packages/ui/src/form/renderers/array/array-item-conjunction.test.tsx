import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import type { FormItem } from '../../field-config'
import { Form } from '../../shells/form.client'

const schema = z.object({
  steps: z.array(z.object({ name: z.string() })),
})

const items: FormItem[] = [
  {
    kind: 'array',
    name: 'steps',
    heading: { label: 'Sequence' },
    itemConjunction: 'and',
    addAction: { label: 'Add step' },
    item: {
      variant: 'compact',
      reorder: 'dragHandle',
      header: { fallback: (index) => `Step ${index + 1}` },
    },
    fields: [{ type: 'text', name: 'name', label: 'Name' }],
  },
]

describe('array itemConjunction', () => {
  it('renders the word between items and keeps it outside the sortable node', async () => {
    const user = userEvent.setup()
    render(
      <Form
        schema={schema}
        defaultValues={{ steps: [{ name: 'First' }] }}
        fields={items}
        onSubmit={() => undefined}
      />,
    )

    expect(screen.queryByText('and')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Add step' }))
    const conjunction = await screen.findByText('and')
    const conjunctionRow = conjunction.closest('div.flex.justify-center')
    const sortable = conjunctionRow?.nextElementSibling
    expect(conjunctionRow).not.toBeNull()
    expect(sortable?.contains(conjunctionRow)).toBe(false)

    const handle = screen.getAllByRole('button', { name: /Drag to reorder/i })[0]
    if (handle) await user.pointer({ keys: '[MouseLeft>]', target: handle })
    expect(screen.getByText('and')).toBeInTheDocument()
  })

  it('uses equal list gap around conjunction siblings', async () => {
    const user = userEvent.setup()
    render(
      <Form
        schema={schema}
        defaultValues={{ steps: [{ name: 'First' }] }}
        fields={items}
        onSubmit={() => undefined}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Add step' }))
    const conjunction = await screen.findByText('and')
    const conjunctionRow = conjunction.closest('div.flex.justify-center')
    const list = conjunctionRow?.parentElement
    expect(list?.className).toContain('gap-1')
    expect(conjunctionRow?.className).not.toContain('py-1')
  })
})
