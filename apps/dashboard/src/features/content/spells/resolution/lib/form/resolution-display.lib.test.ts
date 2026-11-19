import { describe, expect, it } from 'vitest'
import { resolveDisplayBlocks } from '@rpg/ui/form'

import { RESOLUTION_SECTION_LABELS } from './resolution-form-labels'
import { resolutionEffectsApplicationLabelDisplay } from './resolution-effects-application-label-display.lib'
import { resolutionSelectionHintsDisplay } from './resolution-selection-hints-display.lib'
import { RESOLUTION_FIELD_NAME } from './resolution-form-constants'

describe('resolution display configs', () => {
  it('formats effects application label for projectile pattern', () => {
    const blocks = resolveDisplayBlocks(resolutionEffectsApplicationLabelDisplay(), {
      [`${RESOLUTION_FIELD_NAME}.applicationPatternKind`]: 'projectiles',
      [`${RESOLUTION_FIELD_NAME}.projectileCount`]: 3,
    })
    expect(blocks[0]?.variant).toBe('text')
    expect(blocks[0]?.variant === 'text' ? blocks[0].text.length : 0).toBeGreaterThan(0)
  })

  it('emits selection hints for self with area', () => {
    const blocks = resolveDisplayBlocks(resolutionSelectionHintsDisplay(), {
      [`${RESOLUTION_FIELD_NAME}.selectionMode`]: 'self',
      [`${RESOLUTION_FIELD_NAME}.areaOfEffect.shape`]: 'sphere',
    })
    expect(blocks).toHaveLength(2)
    expect(blocks.map((block) => (block.variant === 'text' ? block.text : ''))).toEqual([
      RESOLUTION_SECTION_LABELS.selectionSelfOriginHint,
      RESOLUTION_SECTION_LABELS.selectionAffectedAreaHint,
    ])
  })
})
