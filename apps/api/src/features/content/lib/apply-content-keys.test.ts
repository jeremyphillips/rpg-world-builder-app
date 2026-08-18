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
