import { describe, expect, it } from 'vitest'

import { loadSeedMonsters } from '@rpg/catalog/monsters'
import {
  applyStoredOverlay,
  overlayPolicyForParticipant,
  parseStoredOverlayInput,
} from '@rpg/contracts'

import { makeTestCampaign } from '../../../test/fixtures/campaigns'
import { overlayNameOnlyUpdate } from '../../../test/helpers/system-overlay-write'
import { useIntegrationDb } from '../../../test/setup/integration-db'
import { resolveContentListForCampaign } from '../content.service'
import { contentEntityBody } from './resolve-system-overlay.lib'
import { updateContentEntity } from './content-write.service'
import { MonsterPatchModel } from '../monsters/monster-patch.model'
import { monstersWriteConfig } from '../monsters/monsters.config'

useIntegrationDb()

const SWARM_ID = 'srd-cc-5.2.1:swarm-of-insects'
const ORPHAN_TRAIT_ID = 'orphaned-trait-id'

function swarmSeedBody() {
  const seed = loadSeedMonsters('srd-cc-5.2.1').find((row) => row.id === SWARM_ID)
  if (!seed) throw new Error('expected swarm seed')
  return contentEntityBody(seed as unknown as Record<string, unknown>)
}

function orphanOnlyStoredOverlay(revision: number) {
  return {
    version: 1,
    revision,
    collections: {
      traits: {
        kind: 'identity' as const,
        overrides: [{ origin: 'seed' as const, id: ORPHAN_TRAIT_ID, set: { name: 'Gone' } }],
        additions: [],
        removedIds: [],
      },
    },
  }
}

function identityConflictStoredOverlay(revision: number) {
  const seedBody = swarmSeedBody()
  const swarmTrait = (seedBody.traits as Array<Record<string, unknown>>).find(
    (t) => t.id === 'swarm',
  )
  if (!swarmTrait) throw new Error('expected swarm trait')
  return {
    version: 1,
    revision,
    collections: {
      traits: {
        kind: 'identity' as const,
        overrides: [{ origin: 'seed' as const, id: ORPHAN_TRAIT_ID, set: { name: 'Gone' } }],
        additions: [
          {
            origin: 'homebrew' as const,
            id: 'swarm',
            row: { ...swarmTrait, name: 'Collision Trait' },
          },
        ],
        removedIds: [],
      },
    },
  }
}

async function readStoredPatch(campaignId: string, targetId: string) {
  const doc = await MonsterPatchModel.findOne({ campaignId, targetId }).lean<{ patch: unknown }>()
  return doc?.patch ?? null
}

function assertOrphanFixture(seedBody: Record<string, unknown>, stored: Record<string, unknown>) {
  const policy = overlayPolicyForParticipant('monsters')
  const applied = applyStoredOverlay(seedBody, stored, policy)
  expect(applied.ok).toBe(true)
  if (!applied.ok) return
  expect(applied.result.diagnostics.orphanedSeedOverrides).toContain(ORPHAN_TRAIT_ID)
}

describe('system overlay diagnostics write', () => {
  it('orphan fixture: resolves diagnostics on catalog read before any write', async () => {
    const campaign = await makeTestCampaign()
    const seedBody = swarmSeedBody()
    const stored = orphanOnlyStoredOverlay(1)
    assertOrphanFixture(seedBody, stored)

    await MonsterPatchModel.create({
      campaignId: campaign.id,
      targetId: SWARM_ID,
      patch: stored,
    })

    const { items } = await resolveContentListForCampaign(
      monstersWriteConfig.readConfig,
      campaign.id,
    )
    const swarm = items.find((row) => row.id === SWARM_ID)
    expect(swarm?.overlayReadDiagnostics?.orphanedSeedOverrides).toEqual([ORPHAN_TRAIT_ID])
  })

  it('orphan fixture: unrelated name-only save preserves stored override and increments revision', async () => {
    const campaign = await makeTestCampaign()
    const seedBody = swarmSeedBody()
    const stored = orphanOnlyStoredOverlay(0)
    assertOrphanFixture(seedBody, stored)

    await MonsterPatchModel.create({
      campaignId: campaign.id,
      targetId: SWARM_ID,
      patch: stored,
    })

    const { items } = await resolveContentListForCampaign(
      monstersWriteConfig.readConfig,
      campaign.id,
    )
    const resolved = items.find((row) => row.id === SWARM_ID)
    expect(resolved).toBeDefined()
    if (!resolved) return

    const baseline = contentEntityBody(resolved as unknown as Record<string, unknown>)
    await updateContentEntity(
      monstersWriteConfig,
      campaign.id,
      SWARM_ID,
      overlayNameOnlyUpdate({
        participantId: 'monsters',
        catalogSeed: seedBody,
        baseline,
        name: 'Renamed Swarm',
        expectedOverlayRevision: 0,
      }),
    )

    const persisted = await readStoredPatch(campaign.id, SWARM_ID)
    const parsed = parseStoredOverlayInput(persisted)
    expect(parsed.ok).toBe(true)
    if (!parsed.ok) return
    expect(parsed.overlay?.revision).toBe(1)

    const traitsCollection = parsed.overlay?.collections?.traits
    expect(traitsCollection?.kind).toBe('identity')
    if (traitsCollection?.kind !== 'identity') return
    expect(traitsCollection.overrides).toEqual(
      expect.arrayContaining([expect.objectContaining({ origin: 'seed', id: ORPHAN_TRAIT_ID })]),
    )
    expect(persisted).not.toHaveProperty('traits')
    expect(persisted).not.toHaveProperty('overlayReadDiagnostics')

    const afterRead = await resolveContentListForCampaign(
      monstersWriteConfig.readConfig,
      campaign.id,
    )
    const reread = afterRead.items.find((row) => row.id === SWARM_ID)
    expect(reread?.name).toBe('Renamed Swarm')
    expect(reread?.overlayReadDiagnostics?.orphanedSeedOverrides).toEqual([ORPHAN_TRAIT_ID])
  })

  it('identity-conflict fixture: seed row wins in body; diagnostics persist across name-only save', async () => {
    const campaign = await makeTestCampaign()
    const seedBody = swarmSeedBody()
    const stored = identityConflictStoredOverlay(0)
    const policy = overlayPolicyForParticipant('monsters')
    const applied = applyStoredOverlay(seedBody, stored, policy)
    expect(applied.ok).toBe(true)
    if (!applied.ok) return
    expect(applied.result.diagnostics.identityConflicts).toEqual(['swarm'])
    expect(applied.result.diagnostics.orphanedSeedOverrides).toContain(ORPHAN_TRAIT_ID)

    await MonsterPatchModel.create({
      campaignId: campaign.id,
      targetId: SWARM_ID,
      patch: stored,
    })

    const baseline = contentEntityBody(
      (await resolveContentListForCampaign(monstersWriteConfig.readConfig, campaign.id)).items.find(
        (row) => row.id === SWARM_ID,
      ) as unknown as Record<string, unknown>,
    )
    await updateContentEntity(
      monstersWriteConfig,
      campaign.id,
      SWARM_ID,
      overlayNameOnlyUpdate({
        participantId: 'monsters',
        catalogSeed: seedBody,
        baseline,
        name: 'Named Despite Conflict',
        expectedOverlayRevision: 0,
      }),
    )

    const persisted = await readStoredPatch(campaign.id, SWARM_ID)
    const parsedAfter = parseStoredOverlayInput(persisted)
    expect(parsedAfter.ok).toBe(true)
    if (!parsedAfter.ok) return
    const traits = parsedAfter.overlay?.collections?.traits
    expect(traits?.kind).toBe('identity')
    if (traits?.kind !== 'identity') return
    expect(traits.additions.some((row) => row.id === 'swarm')).toBe(true)

    const reread = (
      await resolveContentListForCampaign(monstersWriteConfig.readConfig, campaign.id)
    ).items.find((row) => row.id === SWARM_ID)
    expect(reread?.overlayReadDiagnostics?.identityConflicts).toEqual(['swarm'])
  })
})
