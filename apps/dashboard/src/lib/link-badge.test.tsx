import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { LinkBadge, StaticBadge } from './link-badge'

describe('LinkBadge', () => {
  it('renders a link with badge outline classes', () => {
    render(
      <MemoryRouter>
        <LinkBadge to="/spells/1">Fireball</LinkBadge>
      </MemoryRouter>,
    )

    const link = screen.getByRole('link', { name: 'Fireball' })
    expect(link).toHaveClass('ui-badge', 'ui-badge--outline-neutral', 'hover:underline')
  })
})

describe('StaticBadge', () => {
  it('renders outline neutral badge', () => {
    render(<StaticBadge>Slug</StaticBadge>)
    expect(screen.getByText('Slug')).toHaveClass('ui-badge', 'ui-badge--outline-neutral')
  })
})
