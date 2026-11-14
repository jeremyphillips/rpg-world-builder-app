import { describe, expect, it } from 'vitest'

import { makeContentFormCtx } from '../../lib/fixtures/content-form-ctx'
import { resolveMonsterCreateDefaultValues, type MonsterFormValues } from './monster-form-values'
import { resolveMonsterPublishCatalogReadiness } from './resolve-monster-publish-catalog-readiness.lib'

describe('resolveMonsterPublishCatalogReadiness', () => {
  const base = resolveMonsterCreateDefaultValues()

  it('allows publish when catalogs are pending but the body does not need them', () => {
    const ctx = makeContentFormCtx({
      equipmentCatalogStatus: 'pending',
      skillCatalogStatus: 'pending',
      spellCatalogStatus: 'pending',
    })
    expect(resolveMonsterPublishCatalogReadiness(ctx, base)).toBeNull()
  })

  it('blocks publish when equipment is referenced and the equipment catalog is pending', () => {
    const ctx = makeContentFormCtx({ equipmentCatalogStatus: 'pending' })
    const values: MonsterFormValues = {
      ...base,
      equipment: [{ entryId: 'bow', equipmentId: 'shortbow', quantity: 1, equipped: true }],
    }
    expect(resolveMonsterPublishCatalogReadiness(ctx, values)).toMatch(/equipment/i)
  })

  it('blocks publish when spell ids are authored and the spell catalog failed', () => {
    const ctx = makeContentFormCtx({ spellCatalogStatus: 'error' })
    const values: MonsterFormValues = {
      ...base,
      actions: [
        {
          id: 'cast',
          kind: 'spell',
          name: 'Spells',
          spells: [{ spellId: 'srd-2024:fire-bolt' }],
        },
      ],
    }
    expect(resolveMonsterPublishCatalogReadiness(ctx, values)).toMatch(/spell/i)
  })
})
