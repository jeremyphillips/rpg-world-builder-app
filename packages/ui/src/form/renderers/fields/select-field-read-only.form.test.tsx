import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { z } from 'zod'

import { Form } from '../../shells/form.client'
import type { FormItem } from '../../field-config'

const schema = z.object({
  rows: z.array(
    z.object({
      kind: z.enum(['healing', 'damage']),
      amount: z.enum(['full', 'half']),
    }),
  ),
})

type Values = z.infer<typeof schema>

const amountOptions = [
  { value: 'full', label: 'Full effect' },
  { value: 'half', label: 'Half effect' },
] as const

const fields: FormItem[] = [
  {
    kind: 'array',
    name: 'rows',
    legend: 'Applications',
    filterSelectDependsOn: [],
    filterSelectOptions: ({ arrayItems, rowIndex, fieldName, options }) => {
      if (fieldName !== 'amount') return [...options]
      const row = arrayItems[rowIndex] as Values['rows'][number] | undefined
      if (row?.kind === 'healing') {
        return options.filter((option) => option.value === 'full')
      }
      return [...options]
    },
    fields: [
      {
        type: 'select',
        name: 'kind',
        label: 'Kind',
        options: [
          { value: 'healing', label: 'Healing' },
          { value: 'damage', label: 'Damage' },
        ],
      },
      {
        type: 'select',
        name: 'amount',
        label: 'Amount',
        options: [...amountOptions],
        presentation: {
          readOnlyWhen: ({ options }) => options.length === 1,
        },
      },
    ],
  },
]

describe('SelectField read-only presentation', () => {
  it('renders read-only value when only one option remains and submits successfully', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    render(
      <Form<Values>
        schema={schema}
        fields={fields}
        defaultValues={{ rows: [{ kind: 'healing', amount: 'full' }] }}
        onSubmit={onSubmit}
        footer={<button type="submit">Save</button>}
      />,
    )

    expect(screen.getByLabelText('Amount')).toHaveTextContent('Full effect')
    expect(screen.getByText('Amount')).toBeInTheDocument()
    expect(screen.queryByRole('combobox', { name: 'Amount' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(onSubmit).toHaveBeenCalledWith(
      { rows: [{ kind: 'healing', amount: 'full' }] },
      expect.anything(),
    )
  })

  it('renders an editable select when multiple amount options remain', () => {
    render(
      <Form<Values>
        schema={schema}
        fields={fields}
        defaultValues={{ rows: [{ kind: 'damage', amount: 'half' }] }}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
      />,
    )

    expect(screen.getByRole('combobox', { name: 'Amount' })).toBeInTheDocument()
    expect(screen.queryByLabelText('Half effect')).not.toBeInTheDocument()
  })
})
