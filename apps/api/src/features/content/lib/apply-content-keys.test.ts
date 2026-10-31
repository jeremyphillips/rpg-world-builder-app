import { describe, expect, it } from 'vitest'

import {
  applyStableNestedContentKeys,
  deriveEnvelopeSlugFromInput,
  regenerateNestedContentKeysForDuplicate,
} from './apply-content-keys'
import {
  CONTENT_TYPE_CAPABILITIES,
  ContentKeyError,
  ORGANIZATION_MEMBERSHIP_TITLE_ID_PREFIX,
  isOpaqueGrantRowId,
  type NestedContentIdRegenerationPath,
} from '@rpg/contracts'

describe('deriveEnvelopeSlugFromInput', () => {
  it('derives slug from name', () => {
    expect(deriveEnvelopeSlugFromInput({ name: 'Custom Leather' })).toBe('custom-leather')
  })
})

describe('applyStableNestedContentKeys', () => {
  it('derives feature ids on create', () => {
    const body = applyStableNestedContentKeys({
      features: [{ name: 'Rage', level: 1 }],
    })

    expect(body.features).toEqual([{ name: 'Rage', level: 1, id: 'rage' }])
  })

  it('preserves existing feature ids on update', () => {
    const existing = {
      features: [{ id: 'rage', name: 'Rage', level: 1 }],
    }
    const body = applyStableNestedContentKeys(
      {
        features: [{ id: 'rage', name: 'Battle Rage', level: 1 }],
      },
      existing,
    )

    expect(body.features).toEqual([{ id: 'rage', name: 'Battle Rage', level: 1 }])
  })

  it('rejects rename-in-place on update', () => {
    const existing = {
      features: [{ id: 'rage', name: 'Rage', level: 1 }],
    }

    expect(() =>
      applyStableNestedContentKeys(
        {
          features: [{ id: 'battle-rage', name: 'Rage', level: 1 }],
        },
        existing,
      ),
    ).toThrow(ContentKeyError)
  })

  it('assigns stable ids to nested heritage options', () => {
    const body = applyStableNestedContentKeys({
      heritage: {
        name: 'Draconic Ancestry',
        options: [{ name: 'Black Dragon' }],
      },
    })

    expect(body.heritage).toEqual({
      name: 'Draconic Ancestry',
      id: 'draconic-ancestry',
      options: [{ name: 'Black Dragon', id: 'black-dragon' }],
    })
  })

  it('preserves existing heritage ids on update', () => {
    const existing = {
      heritage: {
        id: 'draconic-ancestry',
        name: 'Draconic Ancestry',
        options: [{ id: 'black-dragon', name: 'Black Dragon' }],
      },
    }
    const body = applyStableNestedContentKeys(
      {
        heritage: {
          id: 'draconic-ancestry',
          name: 'Draconic Legacy',
          options: [{ id: 'black-dragon', name: 'Black Dragon' }],
        },
      },
      existing,
    )

    expect(body.heritage).toEqual({
      id: 'draconic-ancestry',
      name: 'Draconic Legacy',
      options: [{ id: 'black-dragon', name: 'Black Dragon' }],
    })
  })
})

describe('regenerateNestedContentKeysForDuplicate', () => {
  it('forces new feature ids even when source ids are present', () => {
    const body = regenerateNestedContentKeysForDuplicate(
      {
        features: [{ id: 'rage', name: 'Rage', level: 1 }],
      },
      {
        destinationSlug: 'berserker-copy',
        nestedIdRegeneration: { paths: ['features'] },
      },
    )

    expect((body.features as Array<{ id: string; name: string }>)[0]).toMatchObject({
      name: 'Rage',
      level: 1,
    })
    expect((body.features as Array<{ id: string }>)[0]?.id).not.toBe('rage')
  })

  it('regenerates organization members.titles ids while preserving snapshot payload', () => {
    const body = regenerateNestedContentKeysForDuplicate(
      {
        members: {
          titles: [
            {
              id: 'omt_source-1',
              sourceTitleId: 'treasurer',
              label: 'Treasurer',
              description: 'Keeps the books.',
              priority: 50,
            },
            {
              id: 'omt_source-2',
              sourceTitleId: 'clerk',
              label: 'Clerk',
              priority: 20,
            },
          ],
        },
      },
      {
        destinationSlug: 'river-bank-copy',
        nestedIdRegeneration: { paths: ['members.titles'] },
      },
    )

    const titles = (body.members as { titles: Array<Record<string, unknown>> }).titles
    expect(titles[0]).toMatchObject({
      sourceTitleId: 'treasurer',
      label: 'Treasurer',
      description: 'Keeps the books.',
      priority: 50,
    })
    expect(titles[1]).toMatchObject({
      sourceTitleId: 'clerk',
      label: 'Clerk',
      priority: 20,
    })
    expect(titles[0]?.id).toMatch(new RegExp(`^${ORGANIZATION_MEMBERSHIP_TITLE_ID_PREFIX}`))
    expect(titles[1]?.id).toMatch(new RegExp(`^${ORGANIZATION_MEMBERSHIP_TITLE_ID_PREFIX}`))
    expect(titles[0]?.id).not.toBe('omt_source-1')
    expect(titles[1]?.id).not.toBe('omt_source-2')
    expect(new Set(titles.map((title) => title.id)).size).toBe(2)
  })

  it('regenerates organization connection row ids while preserving location and kind', () => {
    const body = regenerateNestedContentKeysForDuplicate(
      {
        connections: {
          locations: [
            { id: 'conn-1', locationId: 'loc-1', kind: 'headquarters' },
            { id: 'conn-2', locationId: 'loc-2', kind: 'operates_in' },
          ],
        },
      },
      {
        destinationSlug: 'river-bank-copy',
        nestedIdRegeneration: { paths: ['connections.locations'] },
      },
    )

    const locations = (body.connections as { locations: Array<Record<string, unknown>> }).locations
    expect(locations[0]).toMatchObject({ locationId: 'loc-1', kind: 'headquarters' })
    expect(locations[1]).toMatchObject({ locationId: 'loc-2', kind: 'operates_in' })
    expect(locations[0]?.id).not.toBe('conn-1')
    expect(locations[1]?.id).not.toBe('conn-2')
    expect(new Set(locations.map((row) => row.id)).size).toBe(2)
  })

  it('regenerates starting-equipment contribution ids on class duplication', () => {
    const body = regenerateNestedContentKeysForDuplicate(
      {
        characterCreation: {
          startingEquipment: {
            choose: 1,
            options: [
              {
                id: 'standard-equipment',
                label: 'Standard Equipment',
                items: [
                  { id: 'javelin', kind: 'grant', quantity: 8 },
                  { id: 'flail', kind: 'grant', quantity: 1 },
                ],
              },
            ],
          },
        },
      },
      {
        destinationSlug: 'fighter-copy',
        nestedIdRegeneration: { paths: ['characterCreation.startingEquipment'] },
      },
    )

    const items = (
      body.characterCreation as {
        startingEquipment: { options: Array<{ items: Array<{ id: string; kind: string }> }> }
      }
    ).startingEquipment.options[0]?.items

    expect(items?.map((item) => item.kind)).toEqual(['grant', 'grant'])
    expect(items?.[0]?.id).not.toBe('javelin')
    expect(items?.[1]?.id).not.toBe('flail')
    expect(new Set(items?.map((item) => item.id)).size).toBe(2)
  })

  it('implements every nestedIdRegeneration path declared in CONTENT_TYPE_CAPABILITIES', () => {
    const declaredPaths = new Set<NestedContentIdRegenerationPath>()
    for (const capability of Object.values(CONTENT_TYPE_CAPABILITIES)) {
      if (capability.nestedIdRegeneration === 'none') continue
      for (const path of capability.nestedIdRegeneration.paths) {
        declaredPaths.add(path)
      }
    }

    for (const path of declaredPaths) {
      expect(() =>
        regenerateNestedContentKeysForDuplicate(
          {},
          {
            destinationSlug: 'duplicate-copy',
            nestedIdRegeneration: { paths: [path] },
          },
        ),
      ).not.toThrow()
    }
  })
})

const OPAQUE_GRANT_ID = 'grt_11111111-1111-1111-1111-111111111111'
const OTHER_OPAQUE_GRANT_ID = 'grt_22222222-2222-2222-2222-222222222222'

function traitWithGrants(grants: Array<Record<string, unknown>>): {
  traits: Array<Record<string, unknown>>
} {
  return {
    traits: [
      {
        id: 'lineage',
        name: 'Lineage',
        grantGroups: [{ grants }],
      },
    ],
  }
}

function firstGrantId(body: Record<string, unknown>): string {
  const traits = body.traits as Array<{
    grantGroups: Array<{ grants: Array<{ id: string }> }>
  }>
  return traits[0]!.grantGroups[0]!.grants[0]!.id
}

describe('stabilizeGrantRowIds', () => {
  it('allocates missing ids before strict parse', () => {
    const body = applyStableNestedContentKeys(
      traitWithGrants([{ kind: 'sense', type: 'darkvision', range: 60 }]),
    )

    expect(isOpaqueGrantRowId(firstGrantId(body))).toBe(true)
  })

  it('preserves stored ids when grants or groups are reordered', () => {
    const stored = {
      traits: [
        {
          id: 'lineage',
          name: 'Lineage',
          grantGroups: [
            { grants: [{ id: 'darkvision', kind: 'sense', type: 'darkvision', range: 60 }] },
            {
              unlock: { level: 3 },
              grants: [{ id: OPAQUE_GRANT_ID, kind: 'languages', languageIds: ['elvish'] }],
            },
          ],
        },
      ],
    }
    const reordered = {
      traits: [
        {
          id: 'lineage',
          name: 'Lineage',
          grantGroups: [
            {
              unlock: { level: 3 },
              grants: [{ id: OPAQUE_GRANT_ID, kind: 'languages', languageIds: ['elvish'] }],
            },
            { grants: [{ id: 'darkvision', kind: 'sense', type: 'darkvision', range: 120 }] },
          ],
        },
      ],
    }

    const body = applyStableNestedContentKeys(reordered, stored)
    const groups = (
      body.traits as Array<{ grantGroups: Array<{ grants: Array<{ id: string }> }> }>
    )[0]!.grantGroups

    expect(groups.map((group) => group.grants[0]!.id)).toEqual([OPAQUE_GRANT_ID, 'darkvision'])
  })

  it('allocates a new opaque id when a deleted grant is replaced by the same kind', () => {
    const stored = traitWithGrants([
      { id: 'hellish-rebuke-spells', kind: 'spells', spellIds: ['hellish-rebuke'] },
    ])
    const incoming = traitWithGrants([{ kind: 'spells', spellIds: ['thaumaturgy'] }])

    const id = firstGrantId(applyStableNestedContentKeys(incoming, stored))
    expect(id).not.toBe('hellish-rebuke-spells')
    expect(isOpaqueGrantRowId(id)).toBe(true)
  })

  it('rejects a stored id reused for a different kind', () => {
    const stored = traitWithGrants([
      { id: 'hellish-rebuke-spells', kind: 'spells', spellIds: ['hellish-rebuke'] },
    ])
    const incoming = traitWithGrants([
      { id: 'hellish-rebuke-spells', kind: 'sense', type: 'darkvision', range: 60 },
    ])

    expect(() => applyStableNestedContentKeys(incoming, stored)).toThrow(ContentKeyError)
  })

  it('rejects a readable seed id that is not already stored', () => {
    expect(() =>
      applyStableNestedContentKeys(
        traitWithGrants([{ id: 'darkvision', kind: 'sense', type: 'darkvision', range: 60 }]),
      ),
    ).toThrow(ContentKeyError)
  })

  it('rejects duplicate ids within an owner', () => {
    const stored = traitWithGrants([
      { id: 'darkvision', kind: 'sense', type: 'darkvision', range: 60 },
    ])
    const incoming = traitWithGrants([
      { id: 'darkvision', kind: 'sense', type: 'darkvision', range: 60 },
      { id: 'darkvision', kind: 'sense', type: 'darkvision', range: 120 },
    ])

    expect(() => applyStableNestedContentKeys(incoming, stored)).toThrow(ContentKeyError)
  })

  it('stabilizes system-patch updates against the effective body', () => {
    const effective = {
      features: [
        {
          id: 'spellcasting',
          name: 'Spellcasting',
          level: 1,
          grantGroups: [
            {
              grants: [
                { id: 'spellcasting', kind: 'spellcasting' },
                { id: OPAQUE_GRANT_ID, kind: 'spells', spellIds: ['shield'] },
              ],
            },
          ],
        },
      ],
    }
    const incoming = {
      features: [
        {
          id: 'spellcasting',
          name: 'Spellcasting',
          level: 1,
          grantGroups: [
            {
              grants: [
                { id: OPAQUE_GRANT_ID, kind: 'spells', spellIds: ['shield'] },
                { id: 'spellcasting', kind: 'spellcasting' },
                { id: OTHER_OPAQUE_GRANT_ID, kind: 'languages', languageIds: ['draconic'] },
              ],
            },
          ],
        },
      ],
    }

    const body = applyStableNestedContentKeys(incoming, effective)
    const grants = (
      body.features as Array<{ grantGroups: Array<{ grants: Array<{ id: string }> }> }>
    )[0]!.grantGroups[0]!.grants

    expect(grants.map((grant) => grant.id)).toEqual([
      OPAQUE_GRANT_ID,
      'spellcasting',
      OTHER_OPAQUE_GRANT_ID,
    ])
  })

  it('copies grant row ids when trait ids are regenerated for duplication', () => {
    const body = regenerateNestedContentKeysForDuplicate(
      {
        traits: [
          {
            id: 'darkvision',
            name: 'Darkvision',
            grantGroups: [
              {
                grants: [{ id: 'darkvision', kind: 'sense', type: 'darkvision', range: 60 }],
              },
            ],
          },
        ],
      },
      {
        destinationSlug: 'custom-elf',
        nestedIdRegeneration: { paths: ['traits', 'heritage'] },
      },
    )

    const trait = (
      body.traits as Array<{
        id: string
        grantGroups: Array<{ grants: Array<{ id: string }> }>
      }>
    )[0]!
    expect(trait.id).not.toBe('darkvision')
    expect(trait.grantGroups[0]!.grants[0]!.id).toBe('darkvision')
  })
})
