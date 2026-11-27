import { describe, expect, it, vi } from 'vitest'

import * as contracts from '@rpg/contracts'
import { loadSeedFeats } from '@rpg/catalog/feats'
import { loadSeedMonsters } from '@rpg/catalog/monsters'
import {
  buildSystemOverlayIntent,
  overlayPolicyForParticipant,
  reconcileOverlayUpdate,
} from '@rpg/contracts'

import { contentEntityBody, resolveSystemBodyWithOverlay } from './resolve-system-overlay.lib'
import { resolveCatalog } from './resolve-catalog'

interface Record_ {
  id: string
  name: string
  slug?: string
  hitDie?: number
  status?: 'draft' | 'published'
}

const system: Record_[] = [
  { id: 'sys:a', name: 'A', slug: 'a', hitDie: 8 },
  { id: 'sys:b', name: 'B', slug: 'b', hitDie: 10 },
]

const publishedSystem = system.map((record) => ({ ...record, status: 'published' as const }))

describe('resolveCatalog', () => {
  it('returns the system catalog with published status when there are no patches or homebrew', () => {
    expect(resolveCatalog(system, [], [])).toEqual({
      records: publishedSystem,
      overlayFailures: [],
    })
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

  it('records unversioned patch documents as overlay failures when overlay wiring is present', () => {
    const alert = loadSeedFeats('srd-cc-5.2.1').find((feat) => feat.slug === 'alert')
    expect(alert).toBeDefined()
    const result = resolveCatalog(
      [alert!],
      [{ targetId: alert!.id, patch: { name: 'Patched Alert' } }],
      [],
      { overlayParticipantId: 'feats' },
    )
    expect(result.records).toEqual([])
    expect(result.overlayFailures).toEqual([
      expect.objectContaining({
        targetId: alert!.id,
        code: 'unsupported_overlay_version',
      }),
    ])
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
    expect(result.overlayFailures).toEqual([])
    expect(result.records[0]?.name).toBe('Watchful Alert')
    expect(result.records[0]?.status).toBe('published')
  })

  it('appends homebrew records after the resolved system records', () => {
    const homebrew: Record_[] = [{ id: 'hb:1', name: 'Homebrew', slug: 'homebrew' }]
    const result = resolveCatalog(system, [], homebrew)
    expect(result.records).toHaveLength(3)
    expect(result.records.at(-1)).toEqual({ id: 'hb:1', name: 'Homebrew', slug: 'homebrew' })
  })

  it('ignores patches whose target is not in the system catalog', () => {
    const result = resolveCatalog(
      system,
      [{ targetId: 'sys:gone', patch: { version: 1, revision: 0, set: { hitDie: 4 } } }],
      [],
      { overlayParticipantId: 'classes' },
    )
    expect(result.overlayFailures).toEqual([])
    expect(result.records).toHaveLength(publishedSystem.length)
    for (const [index, record] of publishedSystem.entries()) {
      expect(result.records[index]).toEqual(expect.objectContaining(record))
      expect(result.records[index]).toEqual(
        expect.objectContaining({ seedRowIdsByPath: expect.any(Object) }),
      )
    }
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

    const effective = resolveSystemBodyWithOverlay(seedBody, reconciled.result.stored, policy)
    expect(effective).toEqual(reconciled.result.body)
    expect(effective.traits).toEqual(seedBody.traits)
    expect(effective.movement).toEqual({ walk: 30 })

    const resolved = resolveCatalog(
      [swarm],
      [{ targetId: swarm.id, patch: reconciled.result.stored }],
      [],
      { overlayParticipantId: 'monsters', contentTypeKey: 'monsters' },
    ).records[0]
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

  it('attaches seedRowIdsByPath and overlayRevision on resolved system rows', () => {
    const alert = loadSeedFeats('srd-cc-5.2.1').find((feat) => feat.slug === 'alert')
    expect(alert).toBeDefined()
    const { records } = resolveCatalog(
      [alert!],
      [
        {
          targetId: alert!.id,
          patch: { version: 1, revision: 2, set: { name: 'Other Name' } },
        },
      ],
      [],
      { overlayParticipantId: 'feats' },
    )
    const resolved = records[0] as Record<string, unknown>
    expect(resolved.seedRowIdsByPath).toBeDefined()
    expect(resolved.overlayRevision).toBe(2)
  })

  it('isolates a malformed sibling overlay without failing healthy rows', () => {
    const feats = loadSeedFeats('srd-cc-5.2.1')
    const [broken, healthy] = feats.slice(0, 2)
    expect(broken).toBeDefined()
    expect(healthy).toBeDefined()
    const result = resolveCatalog(
      [broken!, healthy!],
      [
        { targetId: broken!.id, patch: { name: 'Bad' } },
        {
          targetId: healthy!.id,
          patch: { version: 1, revision: 0, set: { name: 'Patched Feat' } },
        },
      ],
      [],
      { overlayParticipantId: 'feats' },
    )
    expect(result.records).toHaveLength(1)
    expect(result.records[0]?.id).toBe(healthy!.id)
    expect(result.overlayFailures).toHaveLength(1)
    expect(result.overlayFailures[0]?.targetId).toBe(broken!.id)
  })
  it('rethrows when applyStoredOverlay throws instead of recording overlayFailures', () => {
    const alert = loadSeedFeats('srd-cc-5.2.1').find((feat) => feat.slug === 'alert')
    expect(alert).toBeDefined()
    if (!alert) return

    const spy = vi.spyOn(contracts, 'applyStoredOverlay').mockImplementation(() => {
      throw new Error('programmer')
    })
    try {
      expect(() =>
        resolveCatalog(
          [alert],
          [{ targetId: alert.id, patch: { version: 1, revision: 0, set: { name: 'X' } } }],
          [],
          { overlayParticipantId: 'feats' },
        ),
      ).toThrow('programmer')
    } finally {
      spy.mockRestore()
    }
  })
})
