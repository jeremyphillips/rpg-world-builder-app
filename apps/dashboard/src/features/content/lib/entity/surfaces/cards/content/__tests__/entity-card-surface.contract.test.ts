import { createElement } from 'react'
import { describe, expect, it } from 'vitest'

import { validateSemanticControlCssCompleteness } from '@rpg/ui/test-utils'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { resolveEntitySurfaceEdges } from '../../../../anatomy/entity-surface-edges.lib'
import type { EntityAnatomyTrailing } from '../../../../anatomy/entity-anatomy-trailing.types'
import { DASH_ENTITY_CARD_BODY_CLASS } from '../../../dash-entity-surface.variants'
import { catalogCardBodyWashVariants } from '../../../catalog/catalog-card.variants'
import { disclosureEntityCardBodyWashVariants } from '../../disclosure/disclosure-entity-card.variants'
import { entityCardFrameVariants } from '../entity-card-frame.variants'

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
    const frame = entityCardFrameVariants({ density: 'compact' })

    expect(frame).not.toMatch(/\bpy-\d/)
    expect(frame).not.toMatch(/\bp[xytblr]-\d/)
    expect(frame).toContain('dash-entity-card')
    expect(frame).toContain('dash-entity-card--compact')
    expect(frame).toContain('dash-entity-surface--compact')
    expect(frame).not.toMatch(/pl-\[var\(--entity-surface-inline-start\)\]/)
    expect(frame).not.toMatch(/\[--entity-surface-inset:/)
  })

  it('publishes block inset on the frame density modifier', () => {
    expect(entityCardFrameVariants({ density: 'compact' })).toContain('dash-entity-card--compact')
    expect(entityCardFrameVariants({ density: 'comfortable' })).toContain(
      'dash-entity-card--comfortable',
    )
  })

  it('does not reference removed catalog row surface tokens', () => {
    const frame = entityCardFrameVariants({ density: 'compact' })
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
    expect(entityCardFrameVariants({ density: 'compact', edges })).toContain(
      'dash-entity-surface--end-utility',
    )
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
      expect(entityCardFrameVariants({ density: 'compact', edges })).toContain(
        'dash-entity-surface--end-default',
      )
    }
  })

  it('keeps body wash on dash-entity-card__body', () => {
    for (const wash of [disclosureEntityCardBodyWashVariants(), catalogCardBodyWashVariants()]) {
      expect(wash).toContain(DASH_ENTITY_CARD_BODY_CLASS)
      expect(wash).not.toContain('pr-[var(--entity-body-inline-end)]')
    }
  })
})
