import { beforeEach, describe, expect, it, vi } from 'vitest'

import { loadSeedMonsters } from '@rpg/catalog/monsters'

import { makeTestCampaign } from '../../../../../test/fixtures/campaigns'
import { setMongoTransactionsEnabled } from '../../../../../lib/mongo-transaction'
import { useIntegrationDb } from '../../../../../test/setup/integration-db'
import { MonsterPatchModel } from '../../../monsters/monster-patch.model'
import { monstersRegistration } from '../../../monsters/monsters.config'
import { resolveContentListForCampaign } from '../../../content.service'
import { withAuthoritativeGuardPurpose } from '../content-usage-context'
import { indexMonsterEquipmentBlockersByContentId } from './monsters'

useIntegrationDb()

beforeEach(() => {
  setMongoTransactionsEnabled(true)
  vi.restoreAllMocks()
})

describe('overlay failure seed bodies in authoritative delete guards', () => {
  it('indexes monster equipment blockers from seed when overlay apply failed', async () => {
    const campaign = await makeTestCampaign()
    const monster = loadSeedMonsters(campaign.rulesetId).find(
      (row) => (row.equipment?.length ?? 0) > 0,
    )
    expect(monster).toBeDefined()
    if (!monster?.equipment?.[0]) throw new Error('expected seed monster with equipment')
    const equipmentId = monster.equipment[0].equipmentId

    await MonsterPatchModel.create({
      campaignId: campaign.id,
      targetId: monster.id,
      patch: { name: 'Unversioned overlay' },
    })

    const { items, overlayFailures } = await resolveContentListForCampaign(
      monstersRegistration.read,
      campaign.id,
    )
    expect(items.some((row) => row.id === monster.id)).toBe(false)
    expect(overlayFailures.some((failure) => failure.targetId === monster.id)).toBe(true)

    const blockersByEquipmentId = await indexMonsterEquipmentBlockersByContentId(
      withAuthoritativeGuardPurpose({ campaignId: campaign.id }),
    )
    const blockers = blockersByEquipmentId.get(equipmentId) ?? []
    expect(
      blockers.some(
        (blocker) =>
          blocker.kind === 'content' &&
          blocker.contentTypeKey === 'monsters' &&
          blocker.id === monster.id,
      ),
    ).toBe(true)
  })
})
