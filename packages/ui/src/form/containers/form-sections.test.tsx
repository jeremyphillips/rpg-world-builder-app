import { describe, expect, it, vi, beforeEach } from 'vitest'
import { StrictMode } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { z } from 'zod'

import { Form } from './form.client'
import { resetAccordionBatchStateForTests } from './form-accordion-state'
import type { FormItem } from './field-config'

const schema = z.object({
  title: z.string(),
  tags: z.array(z.object({ label: z.string() })),
})

const fields: FormItem[] = [
  {
    kind: 'group',
    legend: 'Identity',
    collapsible: true,
    fields: [{ type: 'text', name: 'title', label: 'Title' }],
  },
  {
    kind: 'array',
    name: 'tags',
    legend: 'Tags',
    collapsible: true,
    fields: [{ type: 'text', name: 'label', label: 'Label' }],
    addLabel: 'Add tag',
  },
]

describe('Form collapsible sections', () => {
  beforeEach(() => {
    resetAccordionBatchStateForTests()
  })

  it('wraps collapsible top-level groups and arrays in accordion triggers', () => {
    const { container } = render(<Form schema={schema} fields={fields} onSubmit={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Identity' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tags' })).toBeInTheDocument()

    const openContent = container.querySelector('[role="region"][data-state="open"]')
    expect(openContent?.className).toContain('data-[state=open]:overflow-visible')
  })

  it('renders plain fieldsets when collapsibleSections is false', () => {
    render(<Form schema={schema} fields={fields} onSubmit={vi.fn()} collapsibleSections={false} />)
    expect(screen.queryByRole('button', { name: 'Identity' })).not.toBeInTheDocument()
    expect(screen.getByRole('group', { name: /Identity/ })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: /Tags/ })).toBeInTheDocument()
  })

  it('stays closed after toggling a section shut', async () => {
    const user = userEvent.setup()
    render(<Form schema={schema} fields={fields} onSubmit={vi.fn()} />)

    const trigger = screen.getByRole('button', { name: 'Identity' })
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await user.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('stays closed under StrictMode after one toggle', async () => {
    const user = userEvent.setup()
    render(
      <StrictMode>
        <Form schema={schema} fields={fields} onSubmit={vi.fn()} />
      </StrictMode>,
    )

    const trigger = screen.getByRole('button', { name: 'Identity' })
    await user.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('stays open after reopening a section under StrictMode', async () => {
    const user = userEvent.setup()
    render(
      <StrictMode>
        <Form schema={schema} fields={fields} onSubmit={vi.fn()} />
      </StrictMode>,
    )

    const trigger = screen.getByRole('button', { name: 'Identity' })
    await user.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await user.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
  })

  it('keeps field values when a collapsible section is closed', async () => {
    const user = userEvent.setup()
    render(<Form schema={schema} fields={fields} onSubmit={vi.fn()} />)

    await user.type(screen.getByLabelText('Title'), 'Dragonborn')
    await user.click(screen.getByRole('button', { name: 'Identity' }))
    await user.click(screen.getByRole('button', { name: 'Identity' }))
    expect(screen.getByLabelText('Title')).toHaveValue('Dragonborn')
  })

  it('respects collapsible: true on an individual section', () => {
    const mixedFields: FormItem[] = [
      {
        kind: 'group',
        legend: 'Identity',
        fields: [{ type: 'text', name: 'title', label: 'Title' }],
      },
      {
        kind: 'array',
        name: 'tags',
        legend: 'Tags',
        collapsible: true,
        fields: [{ type: 'text', name: 'label', label: 'Label' }],
      },
    ]

    render(<Form schema={schema} fields={mixedFields} onSubmit={vi.fn()} />)
    expect(screen.queryByRole('button', { name: 'Identity' })).not.toBeInTheDocument()
    expect(screen.getByRole('group', { name: /Identity/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tags' })).toBeInTheDocument()
  })
})
