import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { z } from 'zod'

import { Form } from './shells/form.client'
import type { FormItem } from './field-config'

const schema = z.object({
  level: z.coerce.number().optional(),
})

const standardArraySchema = z.object({
  scores: z.array(z.coerce.number()).length(6),
})

describe('Form heading hierarchy a11y', () => {
  it('queries srOnly child label unambiguously when parent heading shares words', () => {
    const fields: FormItem[] = [
      {
        kind: 'group',
        legend: 'Starting level',
        fields: [
          {
            type: 'number',
            name: 'level',
            label: 'Starting level',
            labelVisibility: 'srOnly',
          },
        ],
      },
    ]

    render(<Form schema={schema} fields={fields} onSubmit={vi.fn()} />)

    expect(screen.getByRole('group', { name: 'Starting level' })).toBeInTheDocument()
    expect(screen.getByRole('spinbutton', { name: 'Starting level' })).toBeInTheDocument()
    expect(screen.queryByText('Starting level', { selector: 'label:not(.sr-only)' })).toBeNull()
  })

  it('keeps visible leaf label queryable by accessible name', () => {
    const fields: FormItem[] = [{ type: 'number', name: 'level', label: 'Starting level' }]

    render(<Form schema={schema} fields={fields} onSubmit={vi.fn()} />)

    expect(screen.getByRole('spinbutton', { name: 'Starting level' })).toBeInTheDocument()
    expect(screen.getByText('Starting level')).toBeVisible()
  })

  it('queries standard array composite heading and authored sr-only score labels', () => {
    const label = 'Standard array'
    const fields: FormItem[] = [
      {
        kind: 'row',
        heading: { label, hint: 'Six fixed scores.' },
        fields: Array.from({ length: 6 }, (_, index) => ({
          type: 'number',
          name: `scores.${index}`,
          label: `${label} score ${index + 1}`,
          labelVisibility: 'srOnly',
          digits: 2,
          width: 'auto',
        })),
      },
    ]

    render(<Form schema={standardArraySchema} fields={fields} onSubmit={vi.fn()} />)

    expect(screen.getByRole('group', { name: /Standard array/ })).toBeInTheDocument()
    for (let index = 0; index < 6; index += 1) {
      expect(
        screen.getByRole('spinbutton', { name: `${label} score ${index + 1}` }),
      ).toBeInTheDocument()
    }
  })
})
