import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { z } from 'zod'

import { Form } from '../../shells/form.client'
import {
  RelationshipFieldProvider,
  type RelationshipFieldAdapter,
  type RelationshipFieldRegistry,
} from '../../context/relationship-field.context'
import type { FormItem } from '../../field-config'

const TEST_VOCABULARY = 'test_relationship'

type TestEdge = { id: string; label: string }
type TestSelection = { label: string }

const testAdapter: RelationshipFieldAdapter<TestEdge, TestSelection, { nextId: number }> = {
  getItemKey: (edge) => edge.id,
  listAriaLabel: 'Test relationships',
  projectRow: (edge, _context, actions) => ({
    key: edge.id,
    content: (
      <div>
        <span>{edge.label}</span>
        {actions.onRemove ? (
          <button type="button" onClick={actions.onRemove}>
            Remove {edge.label}
          </button>
        ) : null}
      </div>
    ),
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

const fields: FormItem[] = [
  {
    type: 'relationship',
    name: 'links',
    label: 'Links',
    vocabulary: TEST_VOCABULARY,
    emptyLabel: 'No links yet.',
    addActionLabel: 'Add link',
  },
]

describe('Form relationship field', () => {
  it('renders empty state and appends an edge from the vocabulary picker', async () => {
    const user = userEvent.setup()

    render(
      <RelationshipFieldProvider context={{ nextId: 1 }} registry={registry}>
        <Form
          schema={schema}
          fields={fields}
          defaultValues={{ links: [{ id: 'edge-0', label: 'Alpha' }] }}
          onSubmit={() => undefined}
        />
      </RelationshipFieldProvider>,
    )

    expect(screen.getByText('Alpha')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Add link' }))
    await user.click(screen.getByRole('button', { name: 'Pick Gamma' }))

    expect(screen.getByText('Gamma')).toBeInTheDocument()
  })

  it('removes an edge from the list', async () => {
    const user = userEvent.setup()

    render(
      <RelationshipFieldProvider context={{ nextId: 2 }} registry={registry}>
        <Form
          schema={schema}
          fields={fields}
          defaultValues={{
            links: [
              { id: 'edge-1', label: 'Alpha' },
              { id: 'edge-2', label: 'Beta' },
            ],
          }}
          onSubmit={() => undefined}
        />
      </RelationshipFieldProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'Remove Beta' }))
    expect(screen.queryByText('Beta')).not.toBeInTheDocument()
    expect(screen.getByText('Alpha')).toBeInTheDocument()
  })
})
