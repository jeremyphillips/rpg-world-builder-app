import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import {
  RelationshipFieldGroup,
  RelationshipFieldGroupRow,
} from './relationship-field-group.client'
import { CrossContentRelationshipRow } from './cross-content-relationship-row.client'
import { RelationshipEmptyInlineRow } from './relationship-empty-inline-row.client'

describe('RelationshipFieldGroup', () => {
  it('renders card header, subtle body, and padded kind rows', () => {
    const { container } = render(
      <RelationshipFieldGroup
        heading="Territorial Authority"
        headingId="territorial-authority-heading"
        helper="Organizations that govern, control, or claim this location."
      >
        <RelationshipFieldGroupRow eyebrow="Governs">
          <CrossContentRelationshipRow heading="City Council" />
        </RelationshipFieldGroupRow>
        <RelationshipFieldGroupRow eyebrow="Controls">
          <RelationshipEmptyInlineRow
            emptyLabel="No controlling organization."
            addLabel="Add organization"
            onAdd={() => undefined}
          />
        </RelationshipFieldGroupRow>
        <RelationshipFieldGroupRow eyebrow="Claims">
          <RelationshipEmptyInlineRow
            emptyLabel="No organizations claim this location."
            addLabel="Add claim"
            onAdd={() => undefined}
          />
        </RelationshipFieldGroupRow>
      </RelationshipFieldGroup>,
    )

    expect(
      screen.getByRole('heading', { name: 'Territorial Authority', level: 2 }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Organizations that govern, control, or claim this location.'),
    ).toBeInTheDocument()
    expect(screen.getByText('Governs')).toBeInTheDocument()
    expect(screen.getByText('Controls')).toBeInTheDocument()
    expect(screen.getByText('Claims')).toBeInTheDocument()

    const shell = container.firstElementChild
    expect(shell).toHaveClass('rounded-md', 'border', 'border-border-subtle', 'overflow-hidden')

    const header = shell?.firstElementChild
    expect(header).toHaveClass('bg-card', 'px-4', 'py-2')

    const body = header?.nextElementSibling
    expect(body).toHaveClass('bg-surface-subtle')

    const rows = body?.children
    expect(rows?.length).toBe(3)
    expect(rows?.[0]).toHaveClass('px-4', 'py-2', 'border-b', 'border-border-subtle')
    expect(rows?.[2]).toHaveClass('last:border-b-0')
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <RelationshipFieldGroup
        heading="Territorial Authority"
        headingId="territorial-authority-heading"
        helper="Organizations that govern, control, or claim this location."
      >
        <RelationshipFieldGroupRow eyebrow="Governs">
          <CrossContentRelationshipRow heading="City Council" />
        </RelationshipFieldGroupRow>
      </RelationshipFieldGroup>,
    )

    await expectNoAxeViolations(container)
  })
})
