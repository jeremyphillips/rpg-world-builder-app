import { describe, expect, it } from 'vitest'
import type { ArrayConfig, FormItem } from '@rpg/ui/form'

import {
  outcomeApplicationsReferenceEffect,
  planResolutionChange,
  resolutionChangeRequiresConfirm,
  SPELL_RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID,
} from '@rpg/contracts'

import { formatEffectRowPrimary, formatEffectRowSummary } from '../../../lib/effects/effect-display'
import { resolutionFields } from '../form/resolution-form-fields'
import { buildResolutionEffectAddMenuItems } from '../selection/resolution-selection-options.lib'
import { resolutionFormToSelectionContext } from '../selection/resolution-selection-context.lib'
import { RESOLUTION_FORM_FIXTURES } from '../../fixtures'

function walkNestedFormItems(fields: FormItem[], visit: (field: FormItem) => void): void {
  for (const field of fields) {
    visit(field)
    if ('kind' in field && field.kind === 'group') {
      walkNestedFormItems(field.fields, visit)
    }
    if ('kind' in field && field.kind === 'dependent') {
      visit(field.controller)
      walkNestedFormItems(field.dependents.fields, visit)
    }
  }
}

function findResolutionEffectsArray(fields: FormItem[]): ArrayConfig | undefined {
  let found: ArrayConfig | undefined
  walkNestedFormItems(fields, (field) => {
    if (
      !found &&
      'kind' in field &&
      field.kind === 'array' &&
      field.name === 'resolution.effects'
    ) {
      found = field
    }
  })
  return found
}

describe('resolutionFields effects array', () => {
  it('hides the generic add control in favor of the resolution-specific add slot', () => {
    const arrayField = findResolutionEffectsArray(resolutionFields({}))
    expect(arrayField?.addAction).toBe(false)
    expect(arrayField?.item?.removable).toBe(false)
  })

  it('hides the generic remove control in favor of the resolution-specific header remove slot', () => {
    const arrayField = findResolutionEffectsArray(resolutionFields({}))
    expect(arrayField?.item?.removable).toBe(false)
    expect(arrayField?.item?.removeSlot?.name).toBe('_resolutionEffectHeaderRemove')
    expect(arrayField?.item?.removeSlot?.render).toBeTypeOf('function')
  })

  it('does not include a body-level remove slot on effect rows', () => {
    const itemFields = findResolutionEffectsArray(resolutionFields({}))?.fields ?? []
    expect(
      itemFields.find(
        (field) =>
          'kind' in field && field.kind === 'slot' && field.name === '_resolutionEffectRemove',
      ),
    ).toBeUndefined()
  })

  it('does not expose a kind selector; kind is fixed at add time via templates', () => {
    const itemFields = findResolutionEffectsArray(resolutionFields({}))?.fields ?? []
    expect(itemFields.find((field) => !('kind' in field) && field.name === 'kind')).toBeUndefined()
  })

  it('opts into detailed item chrome when nested inside resolution groups', () => {
    const arrayField = findResolutionEffectsArray(resolutionFields({}))
    expect(arrayField?.item?.variant).toBe('detailed')
    expect(arrayField?.item?.collapsible).toBe(true)
  })

  it('includes template descriptions in the resolution add menu', () => {
    const context = resolutionFormToSelectionContext(RESOLUTION_FORM_FIXTURES.eldritchBlast)
    const damageItem = buildResolutionEffectAddMenuItems(context).find(
      (item) => item.id === 'damage',
    )

    expect(damageItem?.description).toMatch(/damage type/i)
  })

  it('wires grant-style collapsible item headers with parent context summaries', () => {
    const arrayField = findResolutionEffectsArray(resolutionFields({}))
    const itemHeader = arrayField?.item?.header

    expect(itemHeader).toBeDefined()
    expect(itemHeader?.summaryDependsOn).toContain('resolution.proximityKind')
    expect(itemHeader?.fallback(0)).toBe('Effect 1')
    expect(
      itemHeader?.primary?.(
        {
          id: 'fx-1',
          kind: 'damage',
          roll: { dice: { count: 1, faces: 6 } },
          damageType: 'fire',
        },
        0,
      ),
    ).toBe('Damage — 1d6 Fire damage')
    expect(
      itemHeader?.summary?.(
        {
          id: 'fx-1',
          kind: 'damage',
          roll: { dice: { count: 1, faces: 6 } },
          damageType: 'fire',
        },
        0,
        {
          'resolution.proximityKind': 'touch',
          'resolution.targetKind': 'creature',
          'resolution.targetCount': 1,
        },
      ),
    ).toBe('Inflicts 1d6 Fire damage.')
    expect(
      itemHeader?.summary?.(
        {
          id: 'fx-2',
          kind: 'healing',
          roll: { dice: { count: 3, faces: 8 } },
        },
        0,
        { 'resolution.proximityKind': 'self' },
      ),
    ).toBe('You heal 3d8 Hit Points.')
  })
})

describe('resolution effect removal planning', () => {
  it('requires confirm when removing an outcome-referenced effect', () => {
    const form = RESOLUTION_FORM_FIXTURES.inflictWounds
    const effectId = SPELL_RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID

    expect(outcomeApplicationsReferenceEffect(form.outcomes, effectId)).toBe(true)

    const plan = planResolutionChange(resolutionFormToSelectionContext(form)!, {
      field: 'removeEffect',
      effectId,
    })

    expect(resolutionChangeRequiresConfirm(plan)).toBe(true)
  })
})

describe('resolution effect array item headers', () => {
  it('formats grant-style titles and summaries for resolution effect kinds', () => {
    expect(
      formatEffectRowPrimary(
        {
          id: 'fx-1',
          kind: 'damage',
          roll: { dice: { count: 1, faces: 6 } },
          damageType: 'fire',
        },
        0,
      ),
    ).toBe('Damage — 1d6 Fire damage')

    expect(
      formatEffectRowSummary({
        id: 'fx-1',
        kind: 'damage',
        roll: { dice: { count: 1, faces: 6 } },
        damageType: 'fire',
      }),
    ).toBe('Inflicts 1d6 Fire damage.')

    expect(
      formatEffectRowPrimary(
        {
          id: 'fx-2',
          kind: 'healing',
          roll: { dice: { count: 3, faces: 8 } },
        },
        0,
      ),
    ).toBe('Healing — 3d8 healing')

    expect(
      formatEffectRowSummary({
        id: 'fx-2',
        kind: 'healing',
        roll: { dice: { count: 3, faces: 8 } },
      }),
    ).toBe('Character heals 3d8 Hit Points.')

    expect(
      formatEffectRowPrimary(
        {
          id: 'fx-3',
          kind: 'temporary-hit-points',
          roll: { dice: { count: 2, faces: 4 }, flat: 4 },
        },
        0,
      ),
    ).toBe('Temporary hit points — 2d4+4 temporary Hit Points')

    expect(
      formatEffectRowSummary({
        id: 'fx-3',
        kind: 'temporary-hit-points',
        roll: { dice: { count: 2, faces: 4 }, flat: 4 },
      }),
    ).toBe('Character gains 2d4+4 temporary Hit Points.')
  })

  it('returns empty summary for incomplete rows', () => {
    expect(formatEffectRowSummary({ id: 'fx-1', kind: 'damage' })).toBe('')
    expect(formatEffectRowSummary({ id: 'fx-2', kind: 'healing' })).toBe('')
  })
})
