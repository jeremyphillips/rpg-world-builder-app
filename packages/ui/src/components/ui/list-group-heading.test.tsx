import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ListGroupHeading } from './list-group-heading.client'

describe('ListGroupHeading', () => {
  it('exposes host-owned heading id, label, and count', () => {
    render(<ListGroupHeading id="content-group" as="h2" label="Content" count={14} />)

    expect(screen.getByRole('heading', { level: 2, name: 'Content · 14' })).toHaveAttribute(
      'id',
      'content-group',
    )
    expect(screen.getByText('14')).toHaveClass('ui-list-group-heading__count')
  })

  it('applies section band modifiers', () => {
    const { container } = render(<ListGroupHeading label="Spells" first follows="complete" />)

    expect(container.firstElementChild).toHaveClass(
      'ui-list-group-heading',
      'ui-list-group-heading--first',
      'ui-list-group-heading--follows-complete',
    )
  })

  it('uses compact eyebrow typography', () => {
    render(<ListGroupHeading label="Features" />)

    expect(screen.getByText('Features').closest('.eyebrow-style-xs')).toBeInTheDocument()
  })
})
