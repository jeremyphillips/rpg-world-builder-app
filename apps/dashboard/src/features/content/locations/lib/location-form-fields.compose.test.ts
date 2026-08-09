import { describe, expect, it } from 'vitest'
import type { FormItem } from '@rpg/ui/form'

import { makeContentFormCtx } from '../../lib/fixtures/content-form-ctx'
import {
  buildLocationFields,
  buildSettlementStartingDistrictsFormItems,
  composeLocationCreateBodyFields,
  SETTLEMENT_STARTING_DISTRICTS_GROUP_LEGEND,
} from './location-form-fields'
import type { LocationFormCtx } from './location-form-ctx'
import { resolveSettlementStructureAuthoringGuidance } from './location-settlement-create-composition.lib'

function collectFieldNames(items: FormItem[]): string[] {
  const names: string[] = []

  for (const item of items) {
    if ('name' in item && typeof item.name === 'string') {
      names.push(item.name)
    }
    if ('fields' in item && Array.isArray(item.fields)) {
      names.push(...collectFieldNames(item.fields as FormItem[]))
    }
  }

  return names
}

function fieldIndex(items: FormItem[], name: string): number {
  return collectFieldNames(items).indexOf(name)
}

describe('composeLocationCreateBodyFields', () => {
  const ctx: LocationFormCtx = {
    ...makeContentFormCtx(),
    mode: 'create',
    fixedCreate: {
      authoringType: 'settlement',
      settlementType: 'city',
      parent: { kind: 'fixed', locationId: 'location-parent' },
    },
  }

  it('matches buildLocationFields when no slot is provided', () => {
    expect(collectFieldNames(composeLocationCreateBodyFields(ctx))).toEqual(
      collectFieldNames(buildLocationFields(ctx)),
    )
  })

  it('places Structure items after description', () => {
    const slotItems = buildSettlementStartingDistrictsFormItems(
      resolveSettlementStructureAuthoringGuidance('city'),
    )
    const items = composeLocationCreateBodyFields(ctx, { afterDescription: slotItems })

    expect(fieldIndex(items, 'description')).toBeGreaterThan(-1)
    expect(fieldIndex(items, 'startingDistricts')).toBeGreaterThan(fieldIndex(items, 'description'))
  })
})

describe('buildSettlementStartingDistrictsFormItems', () => {
  it('does not accept composition state and renders slot chrome only', () => {
    const guidance = resolveSettlementStructureAuthoringGuidance('city')
    const items = buildSettlementStartingDistrictsFormItems(guidance)

    expect(items).toHaveLength(1)
    expect(items[0]).toMatchObject({
      kind: 'group',
      legend: SETTLEMENT_STARTING_DISTRICTS_GROUP_LEGEND,
      description: expect.stringContaining(guidance.helper),
    })

    const group = items[0] as Extract<FormItem, { kind: 'group' }>
    expect(group.fields).toEqual([
      expect.objectContaining({
        kind: 'slot',
        name: 'startingDistricts',
      }),
    ])
  })
})
