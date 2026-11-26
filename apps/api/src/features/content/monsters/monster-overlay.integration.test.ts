import { describe, expect, it } from 'vitest'

import { loadSeedMonsters } from '@rpg/catalog/monsters'
import { parseStoredOverlayInput } from '@rpg/contracts'

import { makeTestCampaign } from '../../../test/fixtures/campaigns'
import { overlayUpdateFromBodies } from '../../../test/helpers/system-overlay-write'
import { useIntegrationDb } from '../../../test/setup/integration-db'
import { resolveCatalogForCampaign } from '../content.service'
import { contentEntityBody } from '../lib/resolve-system-overlay.lib'
import { updateContentEntity } from '../lib/content-write.service'
import { MonsterPatchModel } from './monster-patch.model'
import { monstersWriteConfig } from './monsters.config'

useIntegrationDb()

const SWARM_ID = 'srd-cc-5.2.1:swarm-of-insects'

function monsterBody(record: Record<string, unknown>) {
  return contentEntityBody(record)
}

async function readStoredPatch(campaignId: string, targetId: string) {
  const doc = await MonsterPatchModel.findOne({ campaignId, targetId }).lean<{ patch: unknown }>()
  return doc?.patch ?? null
}

async function overlayRevision(campaignId: string, targetId: string) {
  const patch = await readStoredPatch(campaignId, targetId)
  const parsed = parseStoredOverlayInput(patch)
  if (!parsed.ok || !parsed.overlay) return 0
  return parsed.overlay.revision
}

describe('monster system overlay', () => {
  it('stores movement-only intent without wholesale traits collection', async () => {
    const campaign = await makeTestCampaign()
    const catalog = await resolveCatalogForCampaign(monstersWriteConfig.readConfig, campaign.id)
    const swarm = catalog.find((row) => row.id === SWARM_ID)
    expect(swarm).toBeDefined()
    if (!swarm) return

    const seed = monsterBody(swarm as unknown as Record<string, unknown>)
    const draft = { ...seed, movement: { walk: 30 } }
    await updateContentEntity(
      monstersWriteConfig,
      campaign.id,
      SWARM_ID,
      overlayUpdateFromBodies({
        participantId: 'monsters',
        catalogSeed: seed,
        baseline: seed,
        draft,
      }),
    )

    const patch = await readStoredPatch(campaign.id, SWARM_ID)
    const parsed = parseStoredOverlayInput(patch)
    expect(parsed.ok).toBe(true)
    if (!parsed.ok) return
    expect(parsed.overlay?.collections?.traits).toBeUndefined()
    expect((parsed.overlay?.set as { movement?: unknown })?.movement).toEqual({ walk: 30 })

    const afterRead = await resolveCatalogForCampaign(monstersWriteConfig.readConfig, campaign.id)
    const resolved = afterRead.find((row) => row.id === SWARM_ID)
    expect(resolved?.movement).toEqual({ walk: 30 })
    expect(resolved?.traits.map((trait) => trait.id)).toEqual(['swarm', 'spider-climb'])
  })

  it('keeps a homebrew trait across an unrelated movement save', async () => {
    const campaign = await makeTestCampaign()
    const catalog = await resolveCatalogForCampaign(monstersWriteConfig.readConfig, campaign.id)
    const swarm = catalog.find((row) => row.id === SWARM_ID)
    expect(swarm).toBeDefined()
    if (!swarm) return

    const seed = monsterBody(swarm as unknown as Record<string, unknown>)
    const homebrew = {
      id: 'homebrew-stinger',
      kind: 'custom' as const,
      name: 'Stinger',
      description: 'The swarm stings.',
    }
    const withHomebrew = {
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
        draft: withHomebrew,
      }),
    )

    const movementOnly = { ...withHomebrew, movement: { walk: 25 } }
    const revision = await overlayRevision(campaign.id, SWARM_ID)
    await updateContentEntity(
      monstersWriteConfig,
      campaign.id,
      SWARM_ID,
      overlayUpdateFromBodies({
        participantId: 'monsters',
        catalogSeed: seed,
        baseline: withHomebrew,
        draft: movementOnly,
        expectedOverlayRevision: revision,
      }),
    )

    const afterRead = await resolveCatalogForCampaign(monstersWriteConfig.readConfig, campaign.id)
    expect(afterRead.find((row) => row.id === SWARM_ID)?.traits.map((t) => t.id)).toEqual([
      'swarm',
      'spider-climb',
      'homebrew-stinger',
    ])
  })

  it('stores a sparse trait row override instead of pinning the whole array', async () => {
    const campaign = await makeTestCampaign()
    const seedMonster = loadSeedMonsters('srd-cc-5.2.1').find((row) => row.id === SWARM_ID)
    expect(seedMonster).toBeDefined()
    if (!seedMonster) return

    const catalog = await resolveCatalogForCampaign(monstersWriteConfig.readConfig, campaign.id)
    const swarm = catalog.find((row) => row.id === SWARM_ID)
    expect(swarm).toBeDefined()
    if (!swarm) return

    const seed = monsterBody(swarm as unknown as Record<string, unknown>)
    const editedTraits = (seed.traits as Array<Record<string, unknown>>).map((trait) =>
      trait.id === 'swarm' && trait.preset === 'swarm' ? { ...trait, noun: 'beetle' } : trait,
    )
    const draft = { ...seed, traits: editedTraits }
    await updateContentEntity(
      monstersWriteConfig,
      campaign.id,
      SWARM_ID,
      overlayUpdateFromBodies({
        participantId: 'monsters',
        catalogSeed: seed,
        baseline: seed,
        draft,
      }),
    )

    const patch = await readStoredPatch(campaign.id, SWARM_ID)
    const parsed = parseStoredOverlayInput(patch)
    expect(parsed.ok).toBe(true)
    if (!parsed.ok) return
    const traitsCollection = parsed.overlay?.collections?.traits
    expect(traitsCollection?.kind).toBe('identity')
    if (traitsCollection?.kind !== 'identity') return
    expect(traitsCollection.overrides.length).toBeGreaterThan(0)
    expect(patch).not.toHaveProperty('traits')

    const afterRead = await resolveCatalogForCampaign(monstersWriteConfig.readConfig, campaign.id)
    expect(
      afterRead.find((row) => row.id === SWARM_ID)?.traits.find((t) => t.id === 'swarm'),
    ).toMatchObject({
      noun: 'beetle',
    })
  })

  it('omits a monster with an unversioned patch from catalog resolve', async () => {
    const campaign = await makeTestCampaign()
    await MonsterPatchModel.create({
      campaignId: campaign.id,
      targetId: SWARM_ID,
      patch: { traits: [] },
    })
    const catalog = await resolveCatalogForCampaign(monstersWriteConfig.readConfig, campaign.id)
    expect(catalog.some((row) => row.id === SWARM_ID)).toBe(false)
    expect(catalog.length).toBeGreaterThan(0)
  })

  it('clears optional classIds on a system monster via overlay intent', async () => {
    const campaign = await makeTestCampaign()
    const mageId = 'srd-cc-5.2.1:mage'
    const catalog = await resolveCatalogForCampaign(monstersWriteConfig.readConfig, campaign.id)
    const mage = catalog.find((row) => row.id === mageId)
    expect(mage?.classIds).toBeDefined()

    const seed = monsterBody(mage as unknown as Record<string, unknown>)
    expect(seed.classIds).toEqual(expect.arrayContaining([expect.any(String)]))
    await updateContentEntity(
      monstersWriteConfig,
      campaign.id,
      mageId,
      overlayUpdateFromBodies({
        participantId: 'monsters',
        catalogSeed: seed,
        baseline: seed,
        draft: { ...seed, classIds: [] },
      }),
    )

    const afterRead = await resolveCatalogForCampaign(monstersWriteConfig.readConfig, campaign.id)
    expect(afterRead.find((row) => row.id === mageId)?.classIds).toEqual([])
  })

  it('renames one action without storing wholesale action arrays at the patch root', async () => {
    const campaign = await makeTestCampaign()
    const catalog = await resolveCatalogForCampaign(monstersWriteConfig.readConfig, campaign.id)
    const kobold = catalog.find(
      (row) => row.slug === 'kobold-warrior' && row.catalogLayer === 'system',
    )
    expect(kobold).toBeDefined()
    if (!kobold) return

    const seed = monsterBody(kobold as unknown as Record<string, unknown>)
    const actions = (seed.actions as Array<Record<string, unknown>>).map((action, index) =>
      index === 0 ? { ...action, name: 'Renamed strike' } : action,
    )
    const draft = { ...seed, actions }
    await updateContentEntity(
      monstersWriteConfig,
      campaign.id,
      kobold.id,
      overlayUpdateFromBodies({
        participantId: 'monsters',
        catalogSeed: seed,
        baseline: seed,
        draft,
      }),
    )

    const patch = await readStoredPatch(campaign.id, kobold.id)
    expect(patch).not.toHaveProperty('actions')
    const parsed = parseStoredOverlayInput(patch)
    expect(parsed.ok).toBe(true)

    const afterRead = await resolveCatalogForCampaign(monstersWriteConfig.readConfig, campaign.id)
    const resolved = afterRead.find((row) => row.id === kobold.id)
    expect(resolved?.actions[0]?.name).toBe('Renamed strike')
  })

  it('clears experiencePointsOverride on a system monster and keeps it cleared across name-only save', async () => {
    const campaign = await makeTestCampaign()
    const catalog = await resolveCatalogForCampaign(monstersWriteConfig.readConfig, campaign.id)
    const kobold = catalog.find(
      (row) => row.slug === 'kobold-warrior' && row.catalogLayer === 'system',
    )
    expect(kobold).toBeDefined()
    if (!kobold) return

    const seed = monsterBody(kobold as unknown as Record<string, unknown>)
    const withXp = { ...seed, challengeRating: '0', experiencePointsOverride: 0 }
    await updateContentEntity(
      monstersWriteConfig,
      campaign.id,
      kobold.id,
      overlayUpdateFromBodies({
        participantId: 'monsters',
        catalogSeed: seed,
        baseline: seed,
        draft: withXp,
      }),
    )

    const revision = await overlayRevision(campaign.id, kobold.id)
    const cleared = await updateContentEntity(monstersWriteConfig, campaign.id, kobold.id, {
      systemOverlayIntent: {
        set: { challengeRating: '1/8' },
        clear: ['experiencePointsOverride'],
      },
      expectedOverlayRevision: revision,
    })
    expect(cleared.experiencePointsOverride).toBeUndefined()

    const stored = await readStoredPatch(campaign.id, kobold.id)
    const parsed = parseStoredOverlayInput(stored)
    expect(parsed.ok).toBe(true)
    if (!parsed.ok) return
    expect(parsed.overlay?.clear).toContain('experiencePointsOverride')

    const revision2 = await overlayRevision(campaign.id, kobold.id)
    const afterName = await updateContentEntity(
      monstersWriteConfig,
      campaign.id,
      kobold.id,
      overlayUpdateFromBodies({
        participantId: 'monsters',
        catalogSeed: seed,
        baseline: cleared,
        draft: { ...cleared, name: kobold.name },
        expectedOverlayRevision: revision2,
      }),
    )
    expect(afterName.experiencePointsOverride).toBeUndefined()
  })
})
