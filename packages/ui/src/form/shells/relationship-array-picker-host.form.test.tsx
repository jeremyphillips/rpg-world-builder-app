import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { z } from 'zod'

import { Form } from './form.client'
import {
  RelationshipFieldProvider,
  type RelationshipFieldAdapter,
  type RelationshipFieldRegistry,
} from '../context/relationship-field.context'
import type { FormItem } from '../field-config'

const TEST_VOCABULARY = 'test_relationship'

type TestEdge = { id: string; label: string }
type TestSelection = { label: string }

const testAdapter: RelationshipFieldAdapter<TestEdge, TestSelection, { nextId: number }> = {
  getItemKey: (edge) => edge.id,
  listAriaLabel: 'Test relationships',
  projectRow: (edge) => ({
    key: edge.id,
    content: <span>{edge.label}</span>,
  }),
  renderPicker: ({ open, onOpenChange, onAdd }) =>
    open ? (
      <div>
        <button type="button" onClick={() => onAdd({ label: 'Gamma' })}>
          Pick Gamma
        </button>
        <button type="button" onClick={() => onOpenChange(false)}>
          Close picker
        </button>
      </div>
    ) : null,
  createEdge: (selection, _items, context) => ({
    id: `edge-${context.nextId}`,
    label: selection.label,
  }),
}

const registry: RelationshipFieldRegistry = {
  [TEST_VOCABULARY]: testAdapter as RelationshipFieldAdapter,
}

const schema = z.object({
  links: z.array(z.object({ id: z.string(), label: z.string() })),
})

const relationshipArrayField = (cardinality: 'one' | 'many' | undefined): FormItem => ({
  kind: 'array',
  name: 'links',
  legend: 'Links',
  fields: [],
  addAction: {
    label: 'Add link',
    relationship: { vocabulary: TEST_VOCABULARY, ...(cardinality ? { cardinality } : {}) },
  },
  item: {
    header: {
      fallback: (index) => `Link ${index + 1}`,
      primary: (values) => (typeof values.label === 'string' ? values.label : undefined),
    },
  },
})

describe('Form relationship array addAction', () => {
  it('opens the adapter picker and appends an edge', async () => {
    const user = userEvent.setup()

    render(
      <RelationshipFieldProvider context={{ nextId: 1 }} registry={registry}>
        <Form
          schema={schema}
          fields={[relationshipArrayField(undefined)]}
          defaultValues={{ links: [] }}
          onSubmit={() => undefined}
        />
      </RelationshipFieldProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'Add link' }))
    await user.click(screen.getByRole('button', { name: 'Pick Gamma' }))

    expect(screen.getByText('Gamma')).toBeInTheDocument()
  })

  it('replaces the array when cardinality is one', async () => {
    const user = userEvent.setup()

    render(
      <RelationshipFieldProvider context={{ nextId: 2 }} registry={registry}>
        <Form
          schema={schema}
          fields={[relationshipArrayField('one')]}
          defaultValues={{
            links: [{ id: 'edge-1', label: 'Alpha' }],
          }}
          onSubmit={() => undefined}
        />
      </RelationshipFieldProvider>,
    )

    expect(screen.getByText('Alpha')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Add link' }))
    await user.click(screen.getByRole('button', { name: 'Pick Gamma' }))

    expect(screen.getByText('Gamma')).toBeInTheDocument()
    expect(screen.queryByText('Alpha')).not.toBeInTheDocument()
  })
})
