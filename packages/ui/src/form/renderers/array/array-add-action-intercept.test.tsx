import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { z } from 'zod'

import { Form } from '../../shells/form.client'
import { ArrayAddActionInterceptProvider } from '../../context/array-add-action-intercept.context'
import type { FormItem } from '../../field-config'

const schema = z.object({
  items: z.array(z.object({ id: z.string() })),
})

const fields: FormItem[] = [
  {
    kind: 'array',
    name: 'items',
    heading: { label: 'Items' },
    addAction: {
      label: 'Add item',
      layout: 'inline',
      intercept: 'picker',
    },
    fields: [{ type: 'text', name: 'id', label: 'ID', required: true }],
  },
]

describe('Array add action intercept', () => {
  it('invokes intercept handler instead of appending a default row', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()

    render(
      <ArrayAddActionInterceptProvider registry={{ picker: { onSelect } }}>
        <Form
          schema={schema}
          fields={fields}
          defaultValues={{ items: [] }}
          onSubmit={() => undefined}
        />
      </ArrayAddActionInterceptProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'Add item' }))
    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(screen.queryByLabelText('ID')).not.toBeInTheDocument()
  })
})
