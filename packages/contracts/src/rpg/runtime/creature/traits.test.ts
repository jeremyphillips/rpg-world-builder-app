import { describe, expect, it } from 'vitest'

import type { ContentTrait } from '../../content/lib/grants'
import { resolveCreatureTraitGrants } from './traits'

const magicResistance: ContentTrait = {
  kind: 'template',
  id: 'magic-resistance',
  templateId: 'magic-resistance',
}

const packTactics: ContentTrait = {
  kind: 'template',
  id: 'pack-tactics',
  templateId: 'pack-tactics',
}

describe('resolveCreatureTraitGrants', () => {
  it('expands template, custom, and grant rows and drops unavailable rows', () => {
    const resolved = resolveCreatureTraitGrants([
      { trait: magicResistance, source: 'magic' },
      { trait: { ...packTactics, available: false }, source: 'hidden' },
      {
        trait: {
          kind: 'grant',
          id: 'darkvision',
          grantGroups: [
            { grants: [{ id: 'sense-1', kind: 'sense', type: 'darkvision', range: 60 }] },
          ],
        },
        source: 'sense',
      },
      {
        trait: {
          kind: 'custom',
          id: 'fey-ancestry',
          name: 'Fey Ancestry',
          grantGroups: [
            {
              grants: [
                {
                  id: 'charm-advantage',
                  kind: 'rollAdjustment',
                  mode: 'advantage',
                  rolls: [{ kind: 'saving-throw' }],
                  circumstance: { kind: 'vs-condition', conditionId: 'charmed' },
                },
              ],
            },
          ],
        },
        source: 'fey',
        parentLevel: 1,
      },
    ])

    expect(resolved.map((row) => row.grant.kind)).toEqual([
      'rollAdjustment',
      'sense',
      'rollAdjustment',
    ])
    expect(resolved[0]).toMatchObject({
      templateId: 'magic-resistance',
      sources: ['magic'],
      grant: {
        id: 'magic-resistance-effect',
        mode: 'advantage',
        circumstance: { kind: 'vs-magic' },
      },
    })
    expect(resolved[2]?.grant).toMatchObject({ id: 'charm-advantage', kind: 'rollAdjustment' })
  })

  it('dedupes one template id and merges sources', () => {
    const resolved = resolveCreatureTraitGrants([
      { trait: magicResistance, source: { id: 'species' }, parentLevel: 1 },
      {
        trait: { ...magicResistance, id: 'magic-resistance-2' },
        source: { id: 'feat' },
        parentLevel: 5,
      },
    ])

    expect(resolved).toHaveLength(1)
    expect(resolved[0]?.sources).toEqual([{ id: 'species' }, { id: 'feat' }])
    expect(resolved[0]?.unlockLevel).toBe(1)
    expect(resolved[0]?.grant.id).toBe('magic-resistance-effect')
  })

  it('keeps the first template payload when configs differ', () => {
    const resolved = resolveCreatureTraitGrants([
      {
        trait: {
          kind: 'template',
          id: 'lr-3',
          templateId: 'legendary-resistance',
          config: { uses: 3 },
        },
        source: 'first',
      },
      {
        trait: {
          kind: 'template',
          id: 'lr-4',
          templateId: 'legendary-resistance',
          config: { uses: 4 },
        },
        source: 'second',
      },
    ])

    expect(resolved).toHaveLength(1)
    expect(resolved[0]?.sources).toEqual(['first', 'second'])
    expect(resolved[0]?.grant).toMatchObject({
      kind: 'saveOutcomeOverride',
      limitedUse: { count: { kind: 'fixed', value: 3 } },
    })
  })
})
