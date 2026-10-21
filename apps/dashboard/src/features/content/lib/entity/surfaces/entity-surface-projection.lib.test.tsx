import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { resolveContentDisplayFallback } from '@rpg/contracts'

import { projectEntitySurfaceIdentityToSummaryModel } from './entity-surface-projection.lib'

describe('entity surface projection media', () => {
  it('paints fill-only thumbnail media inside an anatomy-owned shell', () => {
    const { container } = render(
      projectEntitySurfaceIdentityToSummaryModel({
        heading: 'Shortsword',
        fallback: resolveContentDisplayFallback({
          domain: 'equipment',
          surface: 'compact',
        }),
      }).media!,
    )

    expect(container.firstElementChild).toHaveClass('size-full')
    expect(container.firstElementChild).not.toHaveClass('size-10')
  })
})
