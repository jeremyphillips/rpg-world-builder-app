import { render, screen } from '@testing-library/react'
import { describe, expect, expectTypeOf, it } from 'vitest'

import {
  EntityRowInlineBadge,
  EntityRowInlineDensityProvider,
  type EntityRowInlineBadgeProps,
} from './entity-row-inline-badge.client'
import { IdentityRowHeadingLine } from './identity-row.client'
import type { GenericCardDensity } from './card.variants'

const DENSITIES = [
  { density: 'compact', badgeClass: 'ui-badge--sm' },
  { density: 'comfortable', badgeClass: 'ui-badge--sm' },
  { density: 'spacious', badgeClass: 'ui-badge--md' },
] as const satisfies readonly { density: GenericCardDensity; badgeClass: string }[]

describe('EntityRowInlineBadge', () => {
  it.each(DENSITIES)(
    'renders $density as $badgeClass from the row provider',
    ({ density, badgeClass }) => {
      render(
        <EntityRowInlineDensityProvider density={density}>
          <EntityRowInlineBadge tone="warning">Unavailable</EntityRowInlineBadge>
        </EntityRowInlineDensityProvider>,
      )

      const badge = screen.getByText('Unavailable')
      expect(badge).toHaveClass(badgeClass)
      expect(badge).not.toHaveClass('ui-badge--lg')
    },
  )

  it('ignores size, density, and className passed beside the closed props', () => {
    const foreign = {
      children: 'Unavailable',
      size: 'lg',
      density: 'spacious',
      className: 'ui-badge--lg',
    } as EntityRowInlineBadgeProps

    render(
      <EntityRowInlineDensityProvider density="compact">
        <EntityRowInlineBadge {...foreign} />
      </EntityRowInlineDensityProvider>,
    )

    const badge = screen.getByText('Unavailable')
    expect(badge).toHaveClass('ui-badge--sm')
    expect(badge).not.toHaveClass('ui-badge--lg')
    expect(badge).not.toHaveClass('ui-badge--md')
  })

  it('does not accept size, density, or className on the public props', () => {
    expectTypeOf<EntityRowInlineBadgeProps>().not.toHaveProperty('size')
    expectTypeOf<EntityRowInlineBadgeProps>().not.toHaveProperty('density')
    expectTypeOf<EntityRowInlineBadgeProps>().not.toHaveProperty('className')
  })
})

describe('IdentityRowHeadingLine headingBadge', () => {
  it.each(DENSITIES)('sizes the managed badge for $density', ({ density, badgeClass }) => {
    render(
      <IdentityRowHeadingLine
        heading="Harbor District"
        density={density}
        headingBadge={{ tone: 'warning', children: 'Unavailable' }}
      />,
    )

    expect(screen.getByText('Unavailable')).toHaveClass(badgeClass)
    expect(screen.getByText('Harbor District')).toBeInTheDocument()
  })

  it('keeps a non-badge headingEnd', () => {
    render(<IdentityRowHeadingLine heading="Longsword" headingEnd="15 gp" />)

    expect(screen.getByText('15 gp')).toBeInTheDocument()
    expect(screen.queryByText('15 gp')?.className ?? '').not.toContain('ui-badge')
  })
})
