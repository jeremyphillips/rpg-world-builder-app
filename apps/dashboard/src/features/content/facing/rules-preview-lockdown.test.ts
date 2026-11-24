import { systemDefaultArmorClassRules } from '@rpg/contracts'
import { describe, expect, it, vi } from 'vitest'

import '../classes/lib/class-form-def'
import { adaptClassFeatureDraftRow } from './adapters/class-feature-draft.adapter'
import { resolveCustomClassFeatureFacing } from './domains/class-feature/resolvers/custom-class-feature-facing'
import { facingReasonMessage } from './facing-reason-message'
import { resolveFacing } from './resolve-facing'
import { resolveSpeciesTraitDraftFacing } from './domains/trait/resolve-trait-facing'

describe('rules preview lockdown', () => {
  it('treats new custom class features without id as ready when description exists', () => {
    const adapted = adaptClassFeatureDraftRow({
      kind: 'custom',
      name: 'Extra Training',
      description: '<p>Practice makes perfect.</p>',
    })
    expect(adapted.status).toBe('ok')
    if (adapted.status !== 'ok') return

    const facing = resolveCustomClassFeatureFacing(adapted.record)
    expect(facing.status).toBe('ready')
  })

  it('marks absent kind incomplete and unknown explicit kind invalid', () => {
    const missingKind = adaptClassFeatureDraftRow({ name: 'Mystery' })
    expect(missingKind).toEqual({
      status: 'incomplete',
      reason: { code: 'missing-kind' },
    })

    const unknown = adaptClassFeatureDraftRow({ kind: 'not-a-kind', name: 'Broken' })
    expect(unknown).toEqual({
      status: 'invalid',
      reason: { code: 'unsupported-kind' },
    })
  })

  it('returns undefined for custom species trait drafts', () => {
    expect(
      resolveSpeciesTraitDraftFacing({
        id: 'custom',
        kind: 'custom',
        name: 'Notes',
        description: '<p>Freeform</p>',
      }),
    ).toBeUndefined()
  })

  it('preserves custom trait inapplicability through the facing facade', () => {
    const row = {
      id: 'custom',
      kind: 'custom' as const,
      name: 'Notes',
      description: '<p>Freeform</p>',
    }
    expect(
      resolveFacing({
        domain: 'trait',
        source: 'draft',
        hostId: 'species-traits',
        row,
      }),
    ).toBeUndefined()
    expect(
      resolveFacing({
        domain: 'trait',
        source: 'draft',
        hostId: 'monster-traits',
        row,
        monster: { name: 'Example', lair: undefined, forms: undefined },
      }),
    ).toBeUndefined()
    expect(
      resolveFacing({
        domain: 'trait',
        source: 'draft',
        hostId: 'monster-traits',
        row: { ...row, kind: 'unsupported' },
        monster: { name: 'Example', lair: undefined, forms: undefined },
      }),
    ).toEqual({ status: 'invalid', reason: { code: 'unsupported-kind' } })
  })

  it('maps a thrown normalization failure to sanitized guidance', async () => {
    const monsterNormalization = await import('../monsters/lib/normalize-monster-form-values')
    const internalMessage = 'private normalization failure'
    using normalize = vi
      .spyOn(monsterNormalization, 'normalizeMonsterDraftForPreview')
      .mockImplementationOnce(() => {
        throw new Error(internalMessage)
      })
    using logger = vi.spyOn(console, 'error').mockImplementation(() => {})
    const facing = resolveFacing({
      domain: 'monsterAction',
      source: 'draft',
      values: {} as never,
      ctx: {
        rulesetId: 'srd-cc-5.2.1',
        armorClassRules: systemDefaultArmorClassRules(),
        equipmentCatalogStatus: 'ready',
        spellCatalogStatus: 'ready',
      },
      actionId: 'bite',
      section: 'actions',
    })

    expect(normalize).toHaveBeenCalledOnce()
    expect(logger).toHaveBeenCalledOnce()
    expect(facing).toEqual({ status: 'failed', reason: { code: 'unexpected' } })
    expect(facingReasonMessage({ code: 'unexpected' })).not.toContain(internalMessage)
  })
})
