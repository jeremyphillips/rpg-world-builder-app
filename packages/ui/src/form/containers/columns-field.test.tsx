import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { z } from 'zod'

import { FORM_COLUMNS_WIDE_MEDIA_QUERY } from './form-columns.variants'
import { Form } from '../shells/form.client'
import { flattenFields, type FormItem } from '../field-config'

const schema = z.object({
  description: z.string().optional(),
  primaryAbilities: z.array(z.string()),
  hitDie: z.string().optional(),
  scores: z.string().optional(),
})

const twoColumnFields: FormItem[] = [
  {
    kind: 'columns',
    columns: [
      {
        fields: [
          { type: 'textarea', name: 'description', label: 'Description' },
          {
            type: 'chips',
            name: 'primaryAbilities',
            label: 'Primary abilities',
            options: [
              { label: 'Strength', value: 'str' },
              { label: 'Dexterity', value: 'dex' },
            ],
          },
          {
            type: 'select',
            name: 'hitDie',
            label: 'Hit die',
            options: [{ label: 'd8', value: '8' }],
            width: 'auto',
          },
        ],
      },
      {
        fields: [
          {
            kind: 'slot',
            name: 'scores',
            heading: {
              label: 'Suggested ability scores',
              hint: 'Reorder abilities for the Standard Array.',
            },
            render: () => <span>Score list</span>,
          },
        ],
      },
    ],
  },
]

function renderColumns(fields: FormItem[] = twoColumnFields) {
  return render(
    <Form
      schema={schema}
      fields={fields}
      defaultValues={{ description: '', primaryAbilities: [], hitDie: '8' }}
      onSubmit={vi.fn()}
    />,
  )
}

function stubMatchMedia(matches: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches: query === FORM_COLUMNS_WIDE_MEDIA_QUERY ? matches : false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  )
}

describe('columns field layout', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('flattens leaf fields in column-major collapse order and skips slots', () => {
    expect(flattenFields(twoColumnFields).map((field) => field.name)).toEqual([
      'description',
      'primaryAbilities',
      'hitDie',
    ])
  })

  it('renders independent stacks without a shared field container on the wrapper', () => {
    const { container } = renderColumns()

    const layout = container.querySelector('[data-form-columns-layout="stacks"]')
    expect(layout).toBeInstanceOf(HTMLElement)
    expect(layout).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-2')
    expect(layout).not.toHaveClass('bg-field-container')

    expect(container.querySelectorAll('.bg-field-container')).toHaveLength(4)
    const shell = container.querySelector('.bg-field-container')
    expect(shell).toContainElement(screen.getByLabelText('Description'))
    expect(screen.getByText('Suggested ability scores')).toBeInTheDocument()
    expect(shell).not.toContainElement(screen.getByText('Suggested ability scores'))
  })

  it('keeps column-major DOM order without matchMedia for the default collapse', () => {
    const { container } = renderColumns()
    const layout = container.querySelector('[data-form-columns]')
    expect(layout).toHaveAttribute('data-form-columns-layout', 'stacks')
    const description = screen.getByLabelText('Description')
    const hitDie = screen.getByLabelText('Hit die')
    expect(description.compareDocumentPosition(hitDie) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    )
  })

  it('reorders DOM to interleaved sequence when narrow and collapseOrder is interleave', () => {
    stubMatchMedia(false)

    const fields: FormItem[] = [
      {
        kind: 'columns',
        collapseOrder: 'interleave',
        columns: [
          {
            fields: [
              { type: 'textarea', name: 'description', label: 'Description' },
              {
                type: 'select',
                name: 'hitDie',
                label: 'Hit die',
                options: [{ label: 'd8', value: '8' }],
              },
            ],
          },
          {
            fields: [{ type: 'text', name: 'scores', label: 'Suggested ability scores' }],
          },
        ],
      },
    ]

    const { container } = render(
      <Form
        schema={schema}
        fields={fields}
        defaultValues={{ description: '', primaryAbilities: [], hitDie: '8', scores: '' }}
        onSubmit={vi.fn()}
      />,
    )

    expect(container.querySelector('[data-form-columns]')).toHaveAttribute(
      'data-form-columns-layout',
      'sequence',
    )

    const description = screen.getByLabelText('Description')
    const scores = screen.getByLabelText('Suggested ability scores')
    const hitDie = screen.getByLabelText('Hit die')
    expect(description.compareDocumentPosition(scores) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    )
    expect(scores.compareDocumentPosition(hitDie) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    )
    expect(flattenFields(fields).map((field) => field.name)).toEqual([
      'description',
      'scores',
      'hitDie',
    ])
  })
})
