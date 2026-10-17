import { describe, expect, it } from 'vitest'

import { ENTITY_SURFACE_DEFAULT_EDGES } from '../../anatomy/entity-surface-edges.lib'
import { entitySurfaceVariants } from '../dash-entity-surface.variants'

describe('entitySurfaceVariants', () => {
  it('maps density to dash-entity-surface modifiers', () => {
    expect(
      entitySurfaceVariants({
        density: 'compact',
        edges: ENTITY_SURFACE_DEFAULT_EDGES,
        leadingUtilityCount: 0,
      }),
    ).toContain('dash-entity-surface--compact')
    expect(
      entitySurfaceVariants({
        density: 'comfortable',
        edges: ENTITY_SURFACE_DEFAULT_EDGES,
        leadingUtilityCount: 0,
      }),
    ).toContain('dash-entity-surface--comfortable')
  })

  it('maps edges independently', () => {
    const classes = entitySurfaceVariants({
      density: 'compact',
      edges: { start: 'default', end: 'default' },
      leadingUtilityCount: 0,
    })
    expect(classes).toContain('dash-entity-surface--start-default')
    expect(classes).toContain('dash-entity-surface--end-default')

    const startUtility = entitySurfaceVariants({
      density: 'compact',
      edges: { start: 'utility', end: 'default' },
      leadingUtilityCount: 1,
    })
    expect(startUtility).toContain('dash-entity-surface--start-utility')
    expect(startUtility).toContain('dash-entity-surface--end-default')

    const endUtility = entitySurfaceVariants({
      density: 'comfortable',
      edges: { start: 'default', end: 'utility' },
      leadingUtilityCount: 0,
    })
    expect(endUtility).toContain('dash-entity-surface--start-default')
    expect(endUtility).toContain('dash-entity-surface--end-utility')
  })

  it('maps leading utility count to closed modifiers', () => {
    expect(
      entitySurfaceVariants({
        density: 'compact',
        edges: ENTITY_SURFACE_DEFAULT_EDGES,
        leadingUtilityCount: 0,
      }),
    ).toContain('dash-entity-surface--leading-0')
    expect(
      entitySurfaceVariants({
        density: 'compact',
        edges: ENTITY_SURFACE_DEFAULT_EDGES,
        leadingUtilityCount: 1,
      }),
    ).toContain('dash-entity-surface--leading-1')
    expect(
      entitySurfaceVariants({
        density: 'compact',
        edges: ENTITY_SURFACE_DEFAULT_EDGES,
        leadingUtilityCount: 2,
      }),
    ).toContain('dash-entity-surface--leading-2')
  })
})
