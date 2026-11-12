import { describe, expect, it } from 'vitest'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { formatMonsterActionSpellPreviewConfigureHint } from '../monster-form-labels'
import { SPELLCASTING_ABILITY_FIELD_LABEL } from '../../../lib/forms/mechanics/spellcasting-ability-field-copy'
import { resolveMonsterCreateDefaultValues } from '../monster-form-values'
import { buildMonsterActionSpellPreview } from './monster-action-spell-summary'

const mageHandId = 'srd-cc-5.2.1:mage-hand'
const detectMagicId = 'srd-cc-5.2.1:detect-magic'

function readyCtx(spellMap: Map<string, { id: string; name: string }>): ContentFormCtx {
  return {
    entityCatalogLayer: 'homebrew',
    equipmentCatalogStatus: 'ready',
    equipmentCatalogById: new Map(),
    spellCatalogStatus: 'ready',
    spellCatalogById: spellMap,
    armorClassRules: { mode: 'ascending', base: 10 },
    options: { skills: { visible: [] } },
    rulesetId: 'srd-cc-5.2.1',
  } as ContentFormCtx
}

describe('buildMonsterActionSpellPreview', () => {
  it('prints stat-block prose from formatMonsterSpellEntry', () => {
    const spells = new Map([
      [mageHandId, { id: mageHandId, name: 'Mage Hand' }],
      [detectMagicId, { id: detectMagicId, name: 'Detect Magic' }],
    ])
    const ctx = readyCtx(spells)
    const values = {
      ...resolveMonsterCreateDefaultValues(),
      name: 'Archmage',
      challengeRating: '5',
      abilityScores: { str: 10, dex: 10, con: 10, int: 20, wis: 10, cha: 10 },
      actions: [
        {
          id: 'spellcasting',
          kind: 'spell' as const,
          profile: 'primary' as const,
          name: 'Spellcasting',
          castingAbility: { kind: 'ability' as const, ability: 'int' as const },
          spells: [{ spellId: mageHandId }, { spellId: detectMagicId }],
        },
      ],
    }

    const preview = buildMonsterActionSpellPreview({
      values,
      ctx,
      actionId: 'spellcasting',
      section: 'actions',
    })

    expect(preview?.status).toBe('ready')
    if (!preview || preview.status !== 'ready') return
    expect(preview.bodyHtml).toMatch(/casts.*Mage Hand.*Detect Magic/i)
    expect(preview.bodyHtml).toContain('Intelligence')
  })

  it('returns spellcasting-ability guidance when ability is unset', () => {
    const ctx = readyCtx(new Map())
    const values = {
      ...resolveMonsterCreateDefaultValues(),
      challengeRating: '1',
      actions: [
        {
          id: 'spellcasting',
          kind: 'spell' as const,
          name: 'Spellcasting',
          spells: [{ spellId: mageHandId }],
        },
      ],
    }

    expect(
      buildMonsterActionSpellPreview({
        values,
        ctx,
        actionId: 'spellcasting',
        section: 'actions',
      }),
    ).toEqual({
      status: 'unavailable',
      guidance: formatMonsterActionSpellPreviewConfigureHint(SPELLCASTING_ABILITY_FIELD_LABEL),
    })
  })
})
