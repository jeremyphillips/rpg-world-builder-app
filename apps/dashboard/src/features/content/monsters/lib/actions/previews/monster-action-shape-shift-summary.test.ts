import { describe, expect, it } from 'vitest'

import type { ContentFormCtx } from '../../../../lib/forms/registry/content-form-registry'
import { monsterFormTestValues } from '../../monster-form-test-values'
import { MONSTER_SHAPE_SHIFT_REQUIRES_ALTERNATE_FORM_NOTE } from '../../monster-form-labels'
import { buildMonsterActionShapeShiftPreview } from './monster-action-shape-shift-summary'

const ctx = {
  equipmentCatalogById: new Map(),
  spellCatalogById: new Map(),
} as unknown as ContentFormCtx

describe('buildMonsterActionShapeShiftPreview', () => {
  it('returns destination names and rules prose when forms are complete', () => {
    const values = monsterFormTestValues({
      name: 'Werebear',
      sizes: ['medium'],
      forms: {
        profileFormId: 'profile',
        trueForm: { kind: 'defined', formId: 'humanoid' },
        definedForms: [
          { id: 'humanoid', name: 'Humanoid' },
          {
            id: 'bear',
            name: 'Bear',
            overrides: { sizes: ['large' as const] },
          },
        ],
      },
      bonusActions: [{ id: 'shape-shift', kind: 'shape-shift', equipment: 'unchanged' }],
    })

    const preview = buildMonsterActionShapeShiftPreview({
      values,
      ctx,
      actionId: 'shape-shift',
    })

    expect(preview?.destinationsProse).toBe('Bear')
    expect(preview?.rulesProse).toMatch(/werebear shape-shifts into a Large bear/i)
  })

  it('guides when only the true form exists', () => {
    const values = monsterFormTestValues({
      name: 'Werebear',
      forms: {
        profileFormId: 'profile',
        trueForm: { kind: 'defined', formId: 'humanoid' },
        definedForms: [{ id: 'humanoid', name: 'Humanoid' }],
      },
      bonusActions: [{ id: 'shape-shift', kind: 'shape-shift', equipment: 'unchanged' }],
    })

    const preview = buildMonsterActionShapeShiftPreview({
      values,
      ctx,
      actionId: 'shape-shift',
    })

    expect(preview?.destinationsProse).toBe('')
    expect(preview?.rulesProse).toBe(MONSTER_SHAPE_SHIFT_REQUIRES_ALTERNATE_FORM_NOTE)
  })
})
