import { describe, expect, it } from 'vitest'

import { CSRF_HEADER } from '../../../lib/cookies'
import { createTestCampaign, registerAndLoginTestUser } from '../../../test/auth-agent'
import { registerCampaignMember } from '../../../test/helpers/campaign-membership'
import {
  seedCharacterParticipation,
  setMembershipControlledPcs,
} from '../../../test/helpers/campaign-participation'
import { minimalStandalonePcInput } from '../../../test/fixtures/characters'
import { useIntegrationApp } from '../../../test/setup/integration-app'

const getApp = useIntegrationApp()
const TEST_PASSWORD = 'supersecret'
const KOBOLD_ID = 'srd-cc-5.2.1:kobold-warrior'
const SKELETON_ID = 'srd-cc-5.2.1:skeleton'
const DAGGER_ID = 'srd-cc-5.2.1:dagger'

const minimalHomebrewMonsterInput = {
  slug: 'usage-test-monster',
  name: 'Usage Test Monster',
  size: 'small',
  creatureType: 'humanoid',
  alignment: 'n',
  abilityScores: { str: 8, dex: 12, con: 10, int: 8, wis: 8, cha: 8 },
  armorClass: { kind: 'unarmored' },
  hitPoints: { kind: 'hit-dice', count: 1 },
  movement: { walk: 30 },
  languages: { entries: [] },
  challengeRating: '0',
  proficiencies: {
    savingThrows: [],
    skills: [],
    weapons: [{ weaponId: DAGGER_ID }],
  },
  defenses: {
    vulnerabilities: [],
    resistances: [],
    immunities: [],
    conditionImmunities: [],
  },
  equipment: [
    {
      entryId: 'dagger',
      equipmentId: DAGGER_ID,
      quantity: 1,
      equipped: true,
    },
  ],
  traits: [],
  actions: [{ id: 'dagger', kind: 'weapon', equipmentEntryId: 'dagger' }],
  bonusActions: [],
  reactions: [],
} as const

async function registerOwner(email: string) {
  return registerAndLoginTestUser(getApp(), {
    email,
    password: TEST_PASSWORD,
    displayName: 'Monster Access Owner',
  })
}

describe('monsters campaign access (integration)', () => {
  it('hides seed monsters from players but shows them to managers in list responses', async () => {
    const owner = await registerOwner('monsters-list-owner@example.com')
    const campaignId = await createTestCampaign(owner.agent, owner.csrfToken, 'Monsters List')

    const managerList = await owner.agent
      .get(`/api/campaigns/${campaignId}/content/monsters`)
      .set(CSRF_HEADER, owner.csrfToken)
      .expect(200)

    expect(managerList.body.monsters.some((row: { id: string }) => row.id === KOBOLD_ID)).toBe(true)

    const player = await registerCampaignMember(getApp(), {
      campaignId,
      email: 'monsters-list-player@example.com',
      campaignRole: 'pc',
    })

    const playerList = await player.agent
      .get(`/api/campaigns/${campaignId}/content/monsters`)
      .set(CSRF_HEADER, player.csrfToken)
      .expect(200)

    expect(playerList.body.monsters.some((row: { id: string }) => row.id === KOBOLD_ID)).toBe(false)
  })

  it('hides seed monsters from players in global search but keeps them for managers', async () => {
    const owner = await registerOwner('monsters-search-owner@example.com')
    const campaignId = await createTestCampaign(owner.agent, owner.csrfToken, 'Monsters Search')

    const managerCatalog = await owner.agent
      .get(`/api/campaigns/${campaignId}/search/catalog`)
      .set(CSRF_HEADER, owner.csrfToken)
      .expect(200)

    expect(
      managerCatalog.body.documents.some(
        (doc: { target: { kind: string; id: string } }) =>
          doc.target.kind === 'monster' && doc.target.id === SKELETON_ID,
      ),
    ).toBe(true)

    const player = await registerCampaignMember(getApp(), {
      campaignId,
      email: 'monsters-search-player@example.com',
      campaignRole: 'pc',
    })

    const playerCatalog = await player.agent
      .get(`/api/campaigns/${campaignId}/search/catalog`)
      .set(CSRF_HEADER, player.csrfToken)
      .expect(200)

    expect(
      playerCatalog.body.documents.some(
        (doc: { target: { kind: string } }) => doc.target.kind === 'monster',
      ),
    ).toBe(false)
  })

  it('reveals a monster to a granted PC when shared with specific_players', async () => {
    const owner = await registerOwner('monsters-share-owner@example.com')
    const campaignId = await createTestCampaign(owner.agent, owner.csrfToken, 'Monsters Share')

    const characterRes = await owner.agent
      .post('/api/characters')
      .set(CSRF_HEADER, owner.csrfToken)
      .send({ ...minimalStandalonePcInput, name: 'Granted PC' })
      .expect(201)
    const pcCharacterId = characterRes.body.character.id as string

    await seedCharacterParticipation({ campaignId, characterId: pcCharacterId })
    await setMembershipControlledPcs({
      campaignId,
      userId: owner.userId,
      controlledCharacterIds: [pcCharacterId],
    })

    await owner.agent
      .patch(`/api/campaigns/${campaignId}/content/monsters/${KOBOLD_ID}/campaign-access`)
      .set(CSRF_HEADER, owner.csrfToken)
      .send({
        available: true,
        visibilityMode: 'specific_players',
        participantIds: [pcCharacterId],
      })
      .expect(200)

    const player = await registerCampaignMember(getApp(), {
      campaignId,
      email: 'monsters-share-player@example.com',
      campaignRole: 'pc',
      controlledCharacterIds: [pcCharacterId],
    })

    const playerList = await player.agent
      .get(`/api/campaigns/${campaignId}/content/monsters`)
      .set(CSRF_HEADER, player.csrfToken)
      .expect(200)

    expect(playerList.body.monsters.some((row: { id: string }) => row.id === KOBOLD_ID)).toBe(true)
  })

  it('omits DM-only monster referrers from player equipment usage reads', async () => {
    const owner = await registerOwner('monsters-usage-owner@example.com')
    const campaignId = await createTestCampaign(owner.agent, owner.csrfToken, 'Monsters Usage')

    const createRes = await owner.agent
      .post(`/api/campaigns/${campaignId}/content/monsters`)
      .set(CSRF_HEADER, owner.csrfToken)
      .send(minimalHomebrewMonsterInput)
      .expect(201)

    const monsterId = createRes.body.monsters.id as string

    const managerUsage = await owner.agent
      .get(`/api/campaigns/${campaignId}/content/equipment/${DAGGER_ID}/usage`)
      .set(CSRF_HEADER, owner.csrfToken)
      .expect(200)

    expect(
      managerUsage.body.usage.references.some(
        (ref: { kind: string; id: string }) => ref.kind === 'content' && ref.id === monsterId,
      ),
    ).toBe(true)

    const player = await registerCampaignMember(getApp(), {
      campaignId,
      email: 'monsters-usage-player@example.com',
      campaignRole: 'pc',
    })

    const playerUsage = await player.agent
      .get(`/api/campaigns/${campaignId}/content/equipment/${DAGGER_ID}/usage`)
      .set(CSRF_HEADER, player.csrfToken)
      .expect(200)

    expect(
      playerUsage.body.usage.references.some(
        (ref: { kind: string; id: string }) => ref.kind === 'content' && ref.id === monsterId,
      ),
    ).toBe(false)
  })
})
