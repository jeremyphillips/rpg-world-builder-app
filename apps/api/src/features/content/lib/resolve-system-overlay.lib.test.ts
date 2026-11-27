import { describe, expect, it } from 'vitest'

import { contentEntityBody, mergeExistingContentBody } from './resolve-system-overlay.lib'

describe('contentEntityBody', () => {
  it('strips catalog envelope and overlay response metadata from persistence comparisons', () => {
    const body = contentEntityBody({
      id: 'srd:owlbear',
      slug: 'owlbear',
      rulesetId: 'srd-cc-5.2.1',
      catalogLayer: 'system',
      status: 'published',
      campaignId: 'camp',
      provenance: { kind: 'seed' },
      createdAt: '2020-01-01',
      updatedAt: '2020-01-02',
      seedRowIdsByPath: { traits: ['a'] },
      overlayRevision: 3,
      overlayReadDiagnostics: { orphanedSeedOverrides: ['x'], identityConflicts: [] },
      campaignAccess: {
        available: true,
        visibilityMode: 'all_players',
        effectiveAudience: 'all_players',
      },
      name: 'Owlbear',
      armorClass: 13,
    })

    expect(body).toEqual({ name: 'Owlbear', armorClass: 13 })
    expect(body).not.toHaveProperty('overlayReadDiagnostics')
    expect(body).not.toHaveProperty('campaignAccess')
  })
})

describe('mergeExistingContentBody', () => {
  it('drops overlay response metadata before applying the write input', () => {
    const merged = mergeExistingContentBody(
      {
        id: 'srd:owlbear',
        slug: 'owlbear',
        overlayRevision: 4,
        seedRowIdsByPath: { traits: ['a'] },
        overlayReadDiagnostics: { orphanedSeedOverrides: ['x'], identityConflicts: [] },
        campaignAccess: { available: false },
        name: 'Owlbear',
        traits: [{ id: 'a' }],
      },
      { name: 'Renamed' },
    )

    expect(merged).toEqual({ name: 'Renamed', traits: [{ id: 'a' }] })
    expect(merged).not.toHaveProperty('overlayReadDiagnostics')
    expect(merged).not.toHaveProperty('overlayRevision')
    expect(merged).not.toHaveProperty('seedRowIdsByPath')
  })
})
