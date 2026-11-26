import { describe, expect, it } from 'vitest'

import { loadSeedFeats } from '@rpg/catalog/feats'
import { loadSeedMonsters } from '@rpg/catalog/monsters'
import {
  buildSystemOverlayIntent,
  overlayPolicyForParticipant,
  reconcileOverlayUpdate,
} from '@rpg/contracts'

import { catalogOverlayEffectiveBody, contentEntityBody } from './resolve-system-overlay.lib'
import { resolveCatalog } from './resolve-catalog'

interface Record_ {
  id: string
  name: string
  hitDie?: number
  status?: 'draft' | 'published'
}

const system: Record_[] = [
  { id: 'sys:a', name: 'A', hitDie: 8 },
  { id: 'sys:b', name: 'B', hitDie: 10 },
]

const publishedSystem = system.map((record) => ({ ...record, status: 'published' as const }))

describe('resolveCatalog', () => {
  it('returns the system catalog with published status when there are no patches or homebrew', () => {
    expect(resolveCatalog(system, [], [])).toEqual(publishedSystem)
  })

  it('throws when a patch exists without overlay participant wiring', () => {
    expect(() =>
      resolveCatalog(
        system,
        [{ targetId: 'sys:b', patch: { version: 1, revision: 0, set: { hitDie: 12 } } }],
        [],
      ),
    ).toThrow('overlayParticipantId is not configured')
  })

  it('rejects unversioned patch documents when overlay wiring is present', () => {
    const alert = loadSeedFeats('srd-cc-5.2.1').find((feat) => feat.slug === 'alert')
    expect(alert).toBeDefined()
    expect(() =>
      resolveCatalog([alert!], [{ targetId: alert!.id, patch: { name: 'Patched Alert' } }], [], {
        overlayParticipantId: 'feats',
      }),
    ).toThrow(/supported version/i)
  })

  it('applies a versioned overlay scalar onto its target by id', () => {
    const alert = loadSeedFeats('srd-cc-5.2.1').find((feat) => feat.slug === 'alert')
    expect(alert).toBeDefined()
    const result = resolveCatalog(
      [alert!],
      [
        {
          targetId: alert!.id,
          patch: { version: 1, revision: 1, set: { name: 'Watchful Alert' } },
        },
      ],
      [],
      { overlayParticipantId: 'feats' },
    )
    expect(result[0]?.name).toBe('Watchful Alert')
    expect(result[0]?.status).toBe('published')
  })

  it('appends homebrew records after the resolved system records', () => {
    const homebrew: Record_[] = [{ id: 'hb:1', name: 'Homebrew' }]
    const result = resolveCatalog(system, [], homebrew)
    expect(result).toHaveLength(3)
    expect(result.at(-1)).toEqual({ id: 'hb:1', name: 'Homebrew' })
  })

  it('ignores patches whose target is not in the system catalog', () => {
    const result = resolveCatalog(
      system,
      [{ targetId: 'sys:gone', patch: { version: 1, revision: 0, set: { hitDie: 4 } } }],
      [],
      { overlayParticipantId: 'classes' },
    )
    expect(result).toEqual(publishedSystem)
  })

  it('keeps untouched traits on a movement-only monster overlay', () => {
    const swarm = loadSeedMonsters('srd-cc-5.2.1').find(
      (row) => row.id === 'srd-cc-5.2.1:swarm-of-insects',
    )
    expect(swarm).toBeDefined()
    if (!swarm) return

    const seedBody = contentEntityBody(swarm as unknown as Record<string, unknown>)
    const policy = overlayPolicyForParticipant('monsters')
    const intent = buildSystemOverlayIntent({
      policy,
      catalogSeed: seedBody,
      baseline: seedBody,
      draft: { ...seedBody, movement: { walk: 30 } },
    })
    const reconciled = reconcileOverlayUpdate(seedBody, null, intent, policy)
    expect(reconciled.ok).toBe(true)
    if (!reconciled.ok) return

    const effective = catalogOverlayEffectiveBody(seedBody, reconciled.result.stored, policy)
    expect(effective.traits).toEqual(seedBody.traits)
    expect(effective.movement).toEqual({ walk: 30 })

    const resolved = resolveCatalog(
      [swarm],
      [{ targetId: swarm.id, patch: reconciled.result.stored }],
      [],
      { overlayParticipantId: 'monsters', contentTypeKey: 'monsters' },
    )[0]
    const fromCatalog = contentEntityBody(resolved as unknown as Record<string, unknown>)
    expect(fromCatalog.traits).toEqual(seedBody.traits)
    expect(fromCatalog.movement).toEqual({ walk: 30 })
  })

  it('does not mutate the system seed', () => {
    const alert = loadSeedFeats('srd-cc-5.2.1').find((feat) => feat.slug === 'alert')
    expect(alert).toBeDefined()
    resolveCatalog(
      [alert!],
      [
        {
          targetId: alert!.id,
          patch: { version: 1, revision: 0, set: { name: 'Other Name' } },
        },
      ],
      [],
      { overlayParticipantId: 'feats' },
    )
    expect(alert!.name).not.toBe('Other Name')
  })
})
