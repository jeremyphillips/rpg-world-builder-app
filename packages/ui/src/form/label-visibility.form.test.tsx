import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import { SelectField } from '../components/ui/select-field'
import type { FormItem } from './field-config'
import { Form } from './shells/form.client'

const schema = z.object({
  limit: z.string().optional(),
  title: z.string().optional(),
  child: z.string().optional(),
  feet: z.number().optional(),
})

const fields: FormItem[] = [
  {
    type: 'select',
    name: 'limit',
    label: 'Limit',
    labelVisibility: 'srOnly',
    options: [{ value: '10', label: '10' }],
  },
  {
    type: 'select',
    name: 'title',
    label: 'Title',
    labelVisibility: 'srOnly',
    labelPosition: 'settings',
    options: [{ value: 'a', label: 'A' }],
  },
  {
    kind: 'group',
    heading: { label: 'Armor', labelVisibility: 'srOnly' },
    fields: [{ type: 'text', name: 'child', label: 'Child label' }],
  },
  {
    type: 'joinedPair',
    label: 'Speed',
    labelVisibility: 'srOnly',
    start: {
      kind: 'select',
      name: 'feet',
      options: [{ value: 30, label: '30' }],
      defaultValue: 30,
      ariaLabel: 'Speed value',
    },
    end: { kind: 'label', text: 'ft.', ariaLabel: 'Speed unit' },
  },
]

describe('labelVisibility from field config', () => {
  it('hides owned labels and keeps nested and segment names', () => {
    const { container } = render(
      <Form schema={schema} fields={fields} onSubmit={() => undefined} />,
    )

    const limit = screen.getByRole('combobox', { name: 'Limit' })
    expect(screen.getByText('Limit').closest('label')).toHaveClass('sr-only')
    expect(
      limit.closest('[data-field-anatomy]')?.querySelector('[data-field-label-region]')
        ?.childElementCount,
    ).toBe(0)

    const title = screen.getByLabelText('Title')
    expect(title.closest('[class*="grid-cols-"]')).toBeNull()
    expect(screen.getByText('Title').closest('label')).toHaveClass('sr-only')

    expect(screen.getByText('Armor').closest('legend')).toHaveClass('sr-only')
    expect(screen.getByText('Child label').closest('label')).not.toHaveClass('sr-only')

    expect(screen.getByRole('combobox', { name: 'Speed value' })).toBeInTheDocument()
    expect(screen.getByText('ft.')).toBeVisible()
    expect(screen.getByText('Speed').closest('label')).toHaveClass('sr-only')
    expect(container.querySelector('legend.sr-only')).toHaveTextContent('Armor')
  })
})

describe('inline select label visibility', () => {
  it('omits the label column when the label is sr-only', () => {
    const { container } = render(
      <SelectField
        id="limit"
        label="Limit"
        labelVisibility="srOnly"
        labelPosition="inline"
        options={[{ value: '10', label: '10' }]}
      />,
    )

    const row = container.querySelector('.gap-3')
    expect(row).not.toContainElement(screen.getByText('Limit'))
    expect(screen.getByRole('combobox', { name: 'Limit' })).toBeInTheDocument()
    expect(screen.getByText('Limit').closest('label')).toHaveClass('sr-only')
  })
})
