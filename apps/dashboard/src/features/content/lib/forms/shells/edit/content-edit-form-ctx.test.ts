import { describe, expect, it } from 'vitest'

import { defaultCampaignRules } from '../../../form-options/content-campaign-rules'
import { entityEquipmentKind, mergeEditLayoutCtx } from './content-edit-form-ctx'
import type { ContentFormCtx } from '../../registry/content-form-registry'

const baseOptionsCtx: ContentFormCtx = {
  campaignRules: defaultCampaignRules(),
}

describe('entityEquipmentKind', () => {
  it('returns kind when present on the entity', () => {
    expect(entityEquipmentKind({ kind: 'service' })).toBe('service')
  })

  it('returns undefined for entities without kind', () => {
    expect(entityEquipmentKind({ id: 'x', name: 'Item' })).toBeUndefined()
  })
})

describe('mergeEditLayoutCtx', () => {
  it('prefers route form context equipmentKind over entity kind', () => {
    const ctx = mergeEditLayoutCtx(baseOptionsCtx, { equipmentKind: 'weapon' }, 'c1', 'e1', {
      kind: 'service',
      catalogLayer: 'homebrew',
    })

    expect(ctx.equipmentKind).toBe('weapon')
    expect(ctx.mode).toBe('edit')
    expect(ctx.entityCatalogLayer).toBe('homebrew')
  })

  it('falls back to entity kind when route context omits equipmentKind', () => {
    const ctx = mergeEditLayoutCtx(baseOptionsCtx, undefined, 'c1', 'e1', { kind: 'armor' })
    expect(ctx.equipmentKind).toBe('armor')
  })

  it('carries entity slug and separates campaign vs entity ruleset on edit', () => {
    const ctx = mergeEditLayoutCtx(
      { ...baseOptionsCtx, rulesetId: 'srd-cc-5.2.1' },
      undefined,
      'c1',
      'srd-cc-5.2.1:elf',
      { catalogLayer: 'system', slug: 'elf', rulesetId: 'srd-cc-5.2.1' },
    )

    expect(ctx.entitySlug).toBe('elf')
    expect(ctx.entityCatalogLayer).toBe('system')
    expect(ctx.rulesetId).toBe('srd-cc-5.2.1')
    expect(ctx.entityRulesetId).toBe('srd-cc-5.2.1')
  })

  it('keeps campaign catalog ruleset when entity ruleset differs', () => {
    const ctx = mergeEditLayoutCtx(
      { ...baseOptionsCtx, rulesetId: 'srd-cc-5.2.1' },
      undefined,
      'c1',
      'legacy:elf',
      { catalogLayer: 'homebrew', slug: 'elf', rulesetId: 'legacy-ruleset' },
    )

    expect(ctx.rulesetId).toBe('srd-cc-5.2.1')
    expect(ctx.entityRulesetId).toBe('legacy-ruleset')
  })
})
