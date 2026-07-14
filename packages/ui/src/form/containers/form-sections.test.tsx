import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { z } from 'zod'

import { Form } from '../shells/form.client'
import type { FormItem } from '../field-config'

const schema = z.object({
  title: z.string(),
  tags: z.array(z.object({ label: z.string() })),
})

const fields: FormItem[] = [
  {
    kind: 'group',
    legend: 'Identity',
    fields: [{ type: 'text', name: 'title', label: 'Title' }],
  },
  {
    kind: 'array',
    name: 'tags',
    legend: 'Tags',
    fields: [{ type: 'text', name: 'label', label: 'Label' }],
    addLabel: 'Add tag',
  },
]

describe('Form section rendering', () => {
  it('renders top-level groups and arrays as fieldsets', () => {
    render(<Form schema={schema} fields={fields} onSubmit={vi.fn()} />)

    expect(screen.getByRole('group', { name: /Identity/ })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: /Tags/ })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Identity' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Tags' })).not.toBeInTheDocument()
  })

  it('renders group and array legends with expected typography', () => {
    render(<Form schema={schema} fields={fields} onSubmit={vi.fn()} />)

    expect(screen.getByText('Identity').closest('legend')).toHaveClass('text-field-group-legend')
    expect(screen.getByText('Tags')).toHaveClass('text-sm')
    expect(screen.getByText('Tags')).not.toHaveClass('text-field-array-legend')
  })
})
