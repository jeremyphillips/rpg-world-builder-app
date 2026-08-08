import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { RelationshipFieldGroupRow } from './relationship-field-group-row.client'

describe('RelationshipFieldGroupRow', () => {
  it('delegates eyebrow to DetailSectionGroup label', () => {
    render(
      <RelationshipFieldGroupRow eyebrow="Headquarters">
        <p>Row content</p>
      </RelationshipFieldGroupRow>,
    )

    const label = screen.getByText('Headquarters')
    expect(label.tagName).toBe('P')
    expect(screen.getByText('Row content')).toBeInTheDocument()
  })

  it('renders children without eyebrow chrome when eyebrow is omitted', () => {
    render(
      <RelationshipFieldGroupRow>
        <p>Row content</p>
      </RelationshipFieldGroupRow>,
    )

    expect(screen.getByText('Row content')).toBeInTheDocument()
    expect(screen.queryByText('Headquarters')).not.toBeInTheDocument()
  })
})
