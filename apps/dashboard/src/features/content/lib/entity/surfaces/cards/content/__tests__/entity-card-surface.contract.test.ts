import { createElement } from 'react'
import { describe, expect, it } from 'vitest'

import { validateSemanticControlCssCompleteness } from '@rpg/ui/test-utils'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  ENTITY_SURFACE_DEFAULT_EDGES,
  resolveEntitySurfaceEdges,
} from '../../../../anatomy/entity-surface-edges.lib'
import type { EntityAnatomyTrailing } from '../../../../anatomy/entity-anatomy-trailing.types'
import { DASH_ENTITY_CARD_BODY_CLASS } from '../../../dash-entity-surface.variants'
import { entityCardFrameClassName } from '../entity-card-frame.lib'

const button = () => createElement('button', { type: 'button' })
const utilityTrailing: EntityAnatomyTrailing = { kind: 'utility', content: button() }
const actionTrailing: EntityAnatomyTrailing = { kind: 'action', content: button() }
const groupTrailing: EntityAnatomyTrailing = {
  kind: 'group',
  primary: button(),
  secondary: { kind: 'price', label: '15 GP' },
}

const dashEntityCardCssPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../dash-entity-card.css',
)

const dashEntitySurfaceCssPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../../dash-entity-surface.css',
)

describe('entity card surface contract', () => {
  it('keeps perimeter and content inset as separate owners', () => {
    const frame = entityCardFrameClassName({
      density: 'compact',
      edges: ENTITY_SURFACE_DEFAULT_EDGES,
      leadingUtilityCount: 0,
    })

    expect(frame).not.toMatch(/\bpy-\d/)
    expect(frame).not.toMatch(/\bp[xytblr]-\d/)
    expect(frame).toContain('dash-entity-card')
    expect(frame).toContain('dash-entity-surface--compact')
    expect(frame).not.toContain('dash-entity-card--compact')
    expect(frame).not.toMatch(/pl-\[var\(--entity-surface-inline-start\)\]/)
    expect(frame).not.toMatch(/\[--entity-surface-inset:/)
  })

  it('does not reference removed catalog row surface tokens', () => {
    const frame = entityCardFrameClassName({
      density: 'compact',
      edges: ENTITY_SURFACE_DEFAULT_EDGES,
      leadingUtilityCount: 0,
    })
    expect(frame).not.toContain('bg-catalog-picker-row-surface')
    expect(frame).not.toContain('surface=')
  })

  it('registers dash-entity-card semantic CSS completely', () => {
    const failures = validateSemanticControlCssCompleteness({
      filePath: dashEntityCardCssPath,
      classPrefix: 'dash',
      dimensions: [
        {
          modifierPrefix: 'dash-entity-card__content',
          requiredProperties: ['padding-inline-start', 'padding-inline-end', 'padding-block'],
        },
      ],
    })
    expect(failures).toEqual([])
  })

  it('registers dash-entity-surface semantic CSS completely', () => {
    const failures = validateSemanticControlCssCompleteness({
      filePath: dashEntitySurfaceCssPath,
      classPrefix: 'dash',
      dimensions: [
        {
          modifierPrefix: 'dash-entity-surface--compact',
          requiredProperties: [
            '--entity-surface-inset',
            '--entity-surface-utility-inset',
            '--entity-leading-content-gap',
          ],
        },
        {
          modifierPrefix: 'dash-entity-surface--comfortable',
          requiredProperties: [
            '--entity-surface-inset',
            '--entity-surface-utility-inset',
            '--entity-leading-content-gap',
          ],
        },
        {
          modifierPrefix: 'dash-entity-surface--leading-0',
          requiredProperties: ['--entity-content-offset'],
        },
        {
          modifierPrefix: 'dash-entity-surface--leading-1',
          requiredProperties: ['--entity-content-offset'],
        },
        {
          modifierPrefix: 'dash-entity-surface--leading-2',
          requiredProperties: ['--entity-content-offset'],
        },
      ],
    })
    expect(failures).toEqual([])
  })
})

describe('edge-aware surface inset', () => {
  it('tightens the header end inset for utility and chevron trailing', () => {
    expect(
      resolveEntitySurfaceEdges({ leadingUtilityCount: 0, trailing: utilityTrailing }),
    ).toEqual({ start: 'default', end: 'utility' })
    expect(
      resolveEntitySurfaceEdges({
        leadingUtilityCount: 1,
        trailing: { kind: 'indicator', variant: 'chevron' },
      }),
    ).toEqual({ start: 'utility', end: 'utility' })

    const edges = resolveEntitySurfaceEdges({ leadingUtilityCount: 0, trailing: utilityTrailing })
    expect(
      entityCardFrameClassName({ density: 'compact', edges, leadingUtilityCount: 0 }),
    ).toContain('dash-entity-surface--end-utility')
  })

  it('keeps the default end inset for action, group, and quantity trailing', () => {
    for (const trailing of [
      actionTrailing,
      groupTrailing,
      { kind: 'indicator', variant: 'quantity', quantity: 2 } as const,
      undefined,
    ]) {
      const edges = resolveEntitySurfaceEdges({ leadingUtilityCount: 0, trailing })
      expect(edges.end).toBe('default')
      expect(
        entityCardFrameClassName({ density: 'compact', edges, leadingUtilityCount: 0 }),
      ).toContain('dash-entity-surface--end-default')
    }
  })

  it('keeps body wash on dash-entity-card__body', () => {
    for (const wash of [
      'dash-entity-card__body dash-entity-card__body--disclosure-wash',
      'dash-entity-card__body dash-entity-card__body--catalog-wash',
    ]) {
      expect(wash).toContain(DASH_ENTITY_CARD_BODY_CLASS)
      expect(wash).not.toContain('pr-[var(--entity-body-inline-end)]')
    }
  })
})
