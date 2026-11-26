import { describe, expect, it } from 'vitest'

import { loadSeedMonsters } from '@rpg/catalog/monsters'
import { parseStoredOverlayInput } from '@rpg/contracts'

import { makeTestCampaign } from '../../../test/fixtures/campaigns'
import { expectHttpErrorAsync } from '../../../test/expect-http-error'
import {
  overlayNameOnlyUpdate,
  overlayUpdateFromBodies,
} from '../../../test/helpers/system-overlay-write'
import { useIntegrationDb } from '../../../test/setup/integration-db'
import { resolveCatalogForCampaign } from '../content.service'
import { contentEntityBody } from './resolve-system-overlay.lib'
import { updateContentEntity } from './content-write.service'
import { MonsterPatchModel } from '../monsters/monster-patch.model'
import { monstersWriteConfig } from '../monsters/monsters.config'

useIntegrationDb()

const SWARM_ID = 'srd-cc-5.2.1:swarm-of-insects'

async function readStoredPatch(campaignId: string, targetId: string) {
  const doc = await MonsterPatchModel.findOne({ campaignId, targetId }).lean<{ patch: unknown }>()
  return doc?.patch ?? null
}

function assertWriteMatchesRead(
  written: Record<string, unknown>,
  campaignId: string,
  targetId: string,
) {
  const catalog = resolveCatalogForCampaign(monstersWriteConfig.readConfig, campaignId)
  return catalog.then((rows) => {
    const resolved = rows.find((row) => row.id === targetId)
    expect(resolved).toBeDefined()
    if (!resolved) return
    expect(contentEntityBody(resolved as unknown as Record<string, unknown>)).toEqual(
      contentEntityBody(written as unknown as Record<string, unknown>),
    )
  })
}

describe('overlay write/read invariants', () => {
  it('nested trait override: effective values, sparse storage, write equals read', async () => {
    const campaign = await makeTestCampaign()
    const catalog = await resolveCatalogForCampaign(monstersWriteConfig.readConfig, campaign.id)
    const swarm = catalog.find((row) => row.id === SWARM_ID)
    expect(swarm).toBeDefined()
    if (!swarm) return

    const seed = contentEntityBody(swarm as unknown as Record<string, unknown>)
    const editedTraits = (seed.traits as Array<Record<string, unknown>>).map((trait) =>
      trait.id === 'swarm' && trait.preset === 'swarm' ? { ...trait, noun: 'beetle' } : trait,
    )
    const written = await updateContentEntity(
      monstersWriteConfig,
      campaign.id,
      SWARM_ID,
      overlayUpdateFromBodies({
        participantId: 'monsters',
        catalogSeed: seed,
        baseline: seed,
        draft: { ...seed, traits: editedTraits },
      }),
    )

    const patch = await readStoredPatch(campaign.id, SWARM_ID)
    expect(patch).not.toHaveProperty('traits')
    expect(patch).not.toHaveProperty('overlayReadDiagnostics')
    const parsed = parseStoredOverlayInput(patch)
    expect(parsed.ok).toBe(true)
    if (!parsed.ok) return
    const traits = parsed.overlay?.collections?.traits
    expect(traits?.kind).toBe('identity')
    if (traits?.kind !== 'identity') return
    expect(traits.overrides.length).toBeGreaterThan(0)

    const after = await resolveCatalogForCampaign(monstersWriteConfig.readConfig, campaign.id)
    const resolved = after.find((row) => row.id === SWARM_ID)
    expect(resolved?.traits.find((t) => t.id === 'swarm')).toMatchObject({ noun: 'beetle' })
    expect(resolved?.traits.map((t) => t.id)).toEqual(expect.arrayContaining(['spider-climb']))

    await assertWriteMatchesRead(
      written as unknown as Record<string, unknown>,
      campaign.id,
      SWARM_ID,
    )
  })

  it('unrelated movement save preserves homebrew trait addition', async () => {
    const campaign = await makeTestCampaign()
    const catalog = await resolveCatalogForCampaign(monstersWriteConfig.readConfig, campaign.id)
    const swarm = catalog.find((row) => row.id === SWARM_ID)
    expect(swarm).toBeDefined()
    if (!swarm) return

    const seed = contentEntityBody(swarm as unknown as Record<string, unknown>)
    const homebrew = {
      id: 'homebrew-stinger',
      kind: 'custom' as const,
      name: 'Stinger',
      description: 'The swarm stings.',
    }
    const withTrait = {
      ...seed,
      traits: [...(seed.traits as unknown[]), homebrew],
    }
    await updateContentEntity(
      monstersWriteConfig,
      campaign.id,
      SWARM_ID,
      overlayUpdateFromBodies({
        participantId: 'monsters',
        catalogSeed: seed,
        baseline: seed,
        draft: withTrait,
      }),
    )

    const mid = await resolveCatalogForCampaign(monstersWriteConfig.readConfig, campaign.id)
    const baseline = contentEntityBody(
      mid.find((row) => row.id === SWARM_ID) as unknown as Record<string, unknown>,
    )
    const written = await updateContentEntity(
      monstersWriteConfig,
      campaign.id,
      SWARM_ID,
      overlayUpdateFromBodies({
        participantId: 'monsters',
        catalogSeed: seed,
        baseline,
        draft: { ...baseline, movement: { walk: 25 } },
        expectedOverlayRevision: 1,
      }),
    )

    const after = await resolveCatalogForCampaign(monstersWriteConfig.readConfig, campaign.id)
    expect(after.find((row) => row.id === SWARM_ID)?.movement).toEqual({ walk: 25 })
    expect(after.find((row) => row.id === SWARM_ID)?.traits.map((t) => t.id)).toEqual(
      expect.arrayContaining(['homebrew-stinger', 'swarm', 'spider-climb']),
    )
    await assertWriteMatchesRead(
      written as unknown as Record<string, unknown>,
      campaign.id,
      SWARM_ID,
    )
  })

  it('stale overlay revision on diagnostic-bearing patch leaves stored overlay unchanged', async () => {
    const campaign = await makeTestCampaign()
    const seedMonster = loadSeedMonsters('srd-cc-5.2.1').find((row) => row.id === SWARM_ID)
    expect(seedMonster).toBeDefined()
    if (!seedMonster) return

    const stored = {
      version: 1,
      revision: 2,
      collections: {
        traits: {
          kind: 'identity' as const,
          overrides: [{ origin: 'seed' as const, id: 'orphan', set: { name: 'Gone' } }],
          additions: [],
          removedIds: [],
        },
      },
    }
    await MonsterPatchModel.create({ campaignId: campaign.id, targetId: SWARM_ID, patch: stored })

    const catalog = await resolveCatalogForCampaign(monstersWriteConfig.readConfig, campaign.id)
    const swarm = catalog.find((row) => row.id === SWARM_ID)
    expect(swarm).toBeDefined()
    if (!swarm) return
    const seed = contentEntityBody(swarm as unknown as Record<string, unknown>)

    await expectHttpErrorAsync(
      () =>
        updateContentEntity(
          monstersWriteConfig,
          campaign.id,
          SWARM_ID,
          overlayNameOnlyUpdate({
            participantId: 'monsters',
            catalogSeed: seed,
            baseline: seed,
            name: 'Should Not Apply',
            expectedOverlayRevision: 1,
          }),
        ),
      { status: 409, code: 'stale_revision' },
    )

    const persisted = await readStoredPatch(campaign.id, SWARM_ID)
    expect(persisted).toEqual(stored)
  })
})
