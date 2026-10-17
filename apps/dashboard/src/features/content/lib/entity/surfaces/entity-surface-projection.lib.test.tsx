import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { resolveContentDisplayFallback } from '@rpg/contracts'

import {
  ENTITY_SURFACE_LEADING_THUMB_FRAME,
  projectEntitySurfaceIdentityToSummaryModel,
} from './entity-surface-projection.lib'

describe('entity surface projection media', () => {
  it('paints the standard sm thumbnail frame for fallback media', () => {
    const { container } = render(
      projectEntitySurfaceIdentityToSummaryModel({
        heading: 'Shortsword',
        fallback: resolveContentDisplayFallback({
          domain: 'equipment',
          surface: 'compact',
        }),
      }).media!,
    )

    expect(container.firstElementChild).toHaveClass('size-10')
    expect(ENTITY_SURFACE_LEADING_THUMB_FRAME).toBe('insetSm')
  })
})
