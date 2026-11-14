import { describe, expect, it } from 'vitest'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import {
  MONSTER_MULTIATTACK_STEPS_LABEL,
  formatMonsterActionMultiattackPreviewConfigureHint,
} from '../monster-form-labels'
import { resolveMonsterCreateDefaultValues } from '../monster-form-values'
import { buildMonsterActionMultiattackPreview } from './monster-action-multiattack-summary'

function readyCtx(): ContentFormCtx {
  return {
    entityCatalogLayer: 'homebrew',
    equipmentCatalogStatus: 'ready',
    equipmentCatalogById: new Map(),
    spellCatalogStatus: 'ready',
    spellCatalogById: new Map(),
    armorClassRules: { mode: 'ascending', base: 10 },
    options: { skills: { visible: [] } },
    rulesetId: 'srd-cc-5.2.1',
  } as ContentFormCtx
}

describe('buildMonsterActionMultiattackPreview', () => {
  it('prints stat-block prose from formatMonsterMultiattack', () => {
    const ctx = readyCtx()
    const values = {
      ...resolveMonsterCreateDefaultValues(),
      name: 'Wolf',
      actions: [
        {
          id: 'bite',
          kind: 'natural-weapon' as const,
          name: 'Bite',
          mode: 'melee',
          damageType: 'piercing',
          damage: { dice: { count: 1, faces: 8 } },
        },
        {
          id: 'multiattack',
          kind: 'multiattack' as const,
          name: 'Multiattack',
          steps: [{ count: 1, actionIds: ['bite'] }],
        },
      ],
    }

    const preview = buildMonsterActionMultiattackPreview({
      values,
      ctx,
      actionId: 'multiattack',
    })

    expect(preview?.status).toBe('ready')
    if (!preview || preview.status !== 'ready') return
    expect(preview.prose).toMatch(/wolf makes one bite attack/i)
  })

  it('returns steps guidance when no steps are configured', () => {
    const ctx = readyCtx()
    const values = {
      ...resolveMonsterCreateDefaultValues(),
      actions: [
        {
          id: 'multiattack',
          kind: 'multiattack' as const,
          name: 'Multiattack',
          steps: [],
        },
      ],
    }

    expect(
      buildMonsterActionMultiattackPreview({
        values,
        ctx,
        actionId: 'multiattack',
      }),
    ).toEqual({
      status: 'unavailable',
      guidance: formatMonsterActionMultiattackPreviewConfigureHint(MONSTER_MULTIATTACK_STEPS_LABEL),
    })
  })
})
