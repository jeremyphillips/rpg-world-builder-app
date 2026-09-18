import { describe, expect, it } from 'vitest'

import { entityCardContentInsetVariants } from '../entity-card-content.variants'
import { entityCardFrameVariants } from '../entity-card-frame.variants'

describe('entity card surface contract', () => {
  it('keeps perimeter and content inset as separate owners', () => {
    const frame = entityCardFrameVariants({ density: 'compact', surface: 'card', leading: false })
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
