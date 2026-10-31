import { describe, expect, it } from 'vitest'

import {
  deriveMonsterStatBlock,
  entryProvenanceSchema,
  monsterActionSchema,
  resolveContentSourceDocumentIds,
  resolveSourceExcerpt,
  systemDefaultArmorClassRules,
  type Monster,
  type SourceExcerptRevision,
} from '@rpg/contracts'

import { loadSeedMonsters } from '../monsters'
import {
  assertExcerptLock,
  assertStoreTextPermitted,
  SourceExcerptStoreError,
} from './assert-excerpt-store'
import { buildExcerptRevisions } from './build-excerpt-revisions'
import { fingerprintSourceExcerpt } from './fingerprint-source-excerpt'
import { loadSrdMonsterExcerpts } from './load-source-excerpts'

const viewer = { isManager: false, canReadRecord: true }
const hosts = ['traits', 'actions', 'bonusActions', 'reactions'] as const

function recordFor(monster: Monster) {
  return {
    catalogLayer: monster.catalogLayer,
    rulesetId: monster.rulesetId,
    provenance: monster.provenance,
  }
}

function withoutEntryProvenance(monster: Monster): Monster {
  const copy = structuredClone(monster)
  delete copy.provenance
  const entries = copy as Record<(typeof hosts)[number], Array<{ provenance?: unknown }>>
  for (const host of hosts) {
    for (const entry of entries[host]) delete entry.provenance
  }
  return copy
}

describe('SRD monster excerpts', () => {
  it('re-captures the committed batch with the same fingerprints', async () => {
    const revisions = await loadSrdMonsterExcerpts()
    const first = revisions[0]
    if (!first) throw new Error('expected excerpts')
    const rebuilt = buildExcerptRevisions({
      documentId: first.documentId,
      capturedAt: first.capturedAt,
      transcription: first.transcription,
      excerpts: revisions.map((revision) => ({
        excerptId: revision.excerptId,
        text: revision.text,
        locator: revision.locator,
      })),
    })
    expect(await Promise.all(rebuilt.map(fingerprintSourceExcerpt))).toEqual(
      await Promise.all(revisions.map(fingerprintSourceExcerpt)),
    )
  })

  it('resolves every seed reference against the monster’s source documents', async () => {
    const revisions = await loadSrdMonsterExcerpts()
    for (const monster of loadSeedMonsters('srd-cc-5.2.1')) {
      const allowed = resolveContentSourceDocumentIds(recordFor(monster))
      const citation = monster.provenance?.citation
      if (citation) {
        expect(allowed).toContain(citation.documentId)
        expect(citation.locator?.section).toBe('Monsters')
      }
      for (const host of hosts) {
        for (const entry of monster[host]) {
          const excerpt = entry.provenance?.excerpt
          if (!excerpt) continue
          expect(allowed).toContain(excerpt.documentId)
          const resolved = resolveSourceExcerpt({
            ref: excerpt,
            revisions,
            viewer,
            record: recordFor(monster),
          })
          expect(resolved.status).toBe('available')
        }
      }
    }
  })

  it('keeps stat-block derivation independent of stored excerpts', async () => {
    const hound = loadSeedMonsters('srd-cc-5.2.1').find((monster) => monster.slug === 'hell-hound')
    if (!hound) throw new Error('expected hell hound')
    const derive = (monster: Monster) =>
      deriveMonsterStatBlock({
        monster,
        equipmentCatalog: new Map(),
        skillCatalog: new Map(),
        armorClassRules: systemDefaultArmorClassRules(),
        magicPropertyProvider: () => undefined,
      })
    expect(derive(withoutEntryProvenance(hound))).toEqual(derive(hound))
  })
})

describe('excerpt access', () => {
  const ref = {
    documentId: 'srd-5.2.1' as const,
    excerptId: 'monsters/mage/protective-magic',
  }
  const record = {
    catalogLayer: 'system' as const,
    rulesetId: 'srd-cc-5.2.1' as const,
  }

  it('returns missing and unavailable without falling back to catalog text', async () => {
    const revisions = await loadSrdMonsterExcerpts()
    expect(
      resolveSourceExcerpt({
        ref: { ...ref, excerptId: 'monsters/mage/missing' },
        revisions,
        viewer,
        record,
      }).status,
    ).toBe('missing')
    expect(
      resolveSourceExcerpt({
        ref,
        revisions,
        viewer: { isManager: false, canReadRecord: false },
        record,
      }).status,
    ).toBe('unavailable')
    expect(
      resolveSourceExcerpt({
        ref,
        revisions,
        viewer,
        record: { ...record, catalogLayer: 'homebrew' },
      }).status,
    ).toBe('missing')
  })

  it('rejects stored text for a reference-only document and allows a shared excerpt', () => {
    expect(() => assertStoreTextPermitted(false)).toThrow(SourceExcerptStoreError)
    expect(entryProvenanceSchema.safeParse({ excerpt: [ref, ref] }).success).toBe(false)
    const action = {
      kind: 'special' as const,
      name: 'One',
      description: 'One.',
      provenance: { excerpt: ref },
    }
    expect(monsterActionSchema.safeParse({ ...action, id: 'one' }).success).toBe(true)
    expect(monsterActionSchema.safeParse({ ...action, id: 'two', name: 'Two' }).success).toBe(true)
  })
})

describe('excerpt lock', () => {
  async function sample(): Promise<SourceExcerptRevision> {
    const [revision] = await loadSrdMonsterExcerpts()
    if (!revision) throw new Error('expected a revision')
    return structuredClone(revision)
  }

  it('rejects edits, removals, gaps, and bad supersession', async () => {
    const revision = await sample()
    const lock = { [`${revision.excerptId}@1`]: await fingerprintSourceExcerpt(revision) }
    await expect(assertExcerptLock([revision], lock)).resolves.toBeUndefined()

    const edited = { ...revision, text: `${revision.text} ` }
    await expect(assertExcerptLock([edited], lock)).rejects.toThrow(/does not match/)
    await expect(assertExcerptLock([], lock)).rejects.toThrow(/has no revision/)
    await expect(assertExcerptLock([revision], {})).rejects.toThrow(/Unlocked/)

    const second = {
      ...revision,
      revision: 2,
      supersedes: {
        revision: 1,
        reason: 'transcription-error' as const,
        note: 'Corrected a word.',
      },
    }
    await expect(assertExcerptLock([revision, second], lock)).rejects.toThrow(/Unlocked/)
    await expect(
      assertExcerptLock([revision, second], {
        ...lock,
        [`${second.excerptId}@2`]: await fingerprintSourceExcerpt(second),
      }),
    ).resolves.toBeUndefined()

    const gapped = { ...revision, revision: 2 }
    await expect(
      assertExcerptLock([gapped], {
        [`${revision.excerptId}@2`]: await fingerprintSourceExcerpt(gapped),
      }),
    ).rejects.toThrow(/contiguous/)

    const badSupersedes = {
      ...second,
      supersedes: { revision: 9, reason: 'transcription-error' as const, note: 'No.' },
    }
    await expect(
      assertExcerptLock([revision, badSupersedes], {
        [`${revision.excerptId}@1`]: await fingerprintSourceExcerpt(revision),
        [`${badSupersedes.excerptId}@2`]: await fingerprintSourceExcerpt(badSupersedes),
      }),
    ).rejects.toThrow(/supersede/)

    const withSupersedes = { ...revision, supersedes: second.supersedes }
    await expect(
      assertExcerptLock([withSupersedes], {
        [`${revision.excerptId}@1`]: await fingerprintSourceExcerpt(withSupersedes),
      }),
    ).rejects.toThrow(/cannot supersede/)
  })
})
