import { describe, expect, it } from 'vitest'

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

    const facing = resolveCustomClassFeatureFacing(adapted.record as never)
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
        grants: [],
        overrideDisplay: false,
        available: true,
      } as never),
    ).toBeUndefined()
  })

  it('maps failed unexpected without surfacing Error.message on the resolution', () => {
    const facing = resolveFacing({
      domain: 'monsterAction',
      source: 'draft',
      values: {
        challengeRating: 'not-a-cr',
        abilityScores: {},
        actions: [{ id: 'bite', kind: 'natural-weapon', name: 'Bite' }],
      } as never,
      ctx: {
        rulesetId: 'srd-cc-5.2.1',
        equipmentCatalogStatus: 'ready',
        spellCatalogStatus: 'ready',
      } as never,
      actionId: 'bite',
      section: 'actions',
    })
    if (facing.status === 'failed') {
      expect(facing.reason).toEqual({ code: 'unexpected' })
      expect(facingReasonMessage(facing.reason)).not.toContain('Error')
    }
  })
})
