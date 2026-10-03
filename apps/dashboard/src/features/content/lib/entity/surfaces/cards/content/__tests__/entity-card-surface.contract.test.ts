import { createElement } from 'react'
import { describe, expect, it } from 'vitest'

import { resolveEntitySurfaceEdges } from '../../../../anatomy/entity-surface-edges.lib'
import type { EntityAnatomyTrailing } from '../../../../anatomy/entity-anatomy-trailing.types'
import { catalogEntityRowBodyWashVariants } from '../../../catalog/catalog-entity-row.variants'
import { disclosureEntityCardBodyWashVariants } from '../../disclosure/disclosure-entity-card.variants'
import { entityCardContentInsetVariants } from '../entity-card-content.variants'
import { entityCardFrameVariants } from '../entity-card-frame.variants'

const button = () => createElement('button', { type: 'button' })
const utilityTrailing: EntityAnatomyTrailing = { kind: 'utility', content: button() }
const actionTrailing: EntityAnatomyTrailing = { kind: 'action', content: button() }
const groupTrailing: EntityAnatomyTrailing = {
  kind: 'group',
  primary: button(),
  secondary: { kind: 'price', label: '15 GP' },
}

const END_UTILITY = '[--entity-surface-inline-end:var(--entity-surface-utility-inset)]'
const END_DEFAULT = '[--entity-surface-inline-end:var(--entity-surface-inset)]'

describe('entity card surface contract', () => {
  it('keeps perimeter and content inset as separate owners', () => {
    const frame = entityCardFrameVariants({ density: 'compact', surface: 'card' })
    const content = entityCardContentInsetVariants({ density: 'compact' })

    expect(frame).not.toMatch(/\bpy-\d/)
    expect(frame).not.toMatch(/\bp[xytblr]-\d/)
    expect(frame).not.toMatch(/pl-\[var\(--entity-surface-inline-start\)\]/)

    expect(content).toContain('py-2')
    expect(content).toContain('pl-[var(--entity-surface-inline-start)]')
    expect(content).toContain('pr-[var(--entity-surface-inline-end)]')
  })

  it('resolves identical content inset across surfaces at the same density', () => {
    expect(entityCardContentInsetVariants({ density: 'compact' })).toBe(
      entityCardContentInsetVariants({ density: 'compact' }),
    )
    expect(entityCardContentInsetVariants({ density: 'comfortable' })).toContain('py-3')
  })

  it('maps surface identities on the frame only', () => {
    expect(entityCardFrameVariants({ density: 'compact', surface: 'card' })).toContain('bg-card')
    expect(entityCardFrameVariants({ density: 'compact', surface: 'subtle' })).toContain(
      'bg-surface-subtle',
    )
    expect(entityCardFrameVariants({ density: 'compact', surface: 'catalogRow' })).toContain(
      'bg-catalog-picker-row-surface',
    )
  })
})

describe('edge-aware surface inset', () => {
  it('tightens the header end inset for utility and chevron trailing', () => {
    expect(resolveEntitySurfaceEdges({ leadingUtilityCount: 0, trailing: utilityTrailing })).toEqual(
      { start: 'default', end: 'utility' },
    )
    expect(
      resolveEntitySurfaceEdges({
        leadingUtilityCount: 1,
        trailing: { kind: 'indicator', variant: 'chevron' },
      }),
    ).toEqual({ start: 'utility', end: 'utility' })

    const edges = resolveEntitySurfaceEdges({ leadingUtilityCount: 0, trailing: utilityTrailing })
    expect(entityCardFrameVariants({ density: 'compact', edges })).toContain(END_UTILITY)
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
      expect(entityCardFrameVariants({ density: 'compact', edges })).toContain(END_DEFAULT)
    }
  })

  it('keeps body end padding on the base inset whatever the trailing kind', () => {
    for (const wash of [disclosureEntityCardBodyWashVariants(), catalogEntityRowBodyWashVariants()]) {
      expect(wash).toContain('pr-[var(--entity-body-inline-end)]')
      expect(wash).not.toContain('pr-[var(--entity-surface-inline-end)]')
    }
  })
})
