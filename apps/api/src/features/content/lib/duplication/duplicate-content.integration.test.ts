import { describe, expect, it } from 'vitest'

import {
  deriveMonsterStatBlock,
  ELDRITCH_BLAST_RESOLUTION,
  monsterSchema,
  SPELL_RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID,
} from '@rpg/contracts'
import { loadSeedEquipment } from '@rpg/catalog/equipment'
import { loadSeedMonsters } from '@rpg/catalog/monsters'
import { loadSeedSkillProficiencies } from '@rpg/catalog/skill-proficiencies'

import { CSRF_HEADER } from '../../../../lib/cookies'
import { createTestCampaign, registerAndLoginTestUser } from '../../../../test/auth-agent'
import { useIntegrationApp } from '../../../../test/setup/integration-app'

const getApp = useIntegrationApp()

async function registerOwner() {
  return registerAndLoginTestUser(getApp())
}

describe('duplicate content routes', () => {
  const minimalClassInput = {
    slug: 'dup-source-class',
    name: 'Dup Source Class',
    primaryAbilities: ['str'],
    hitDie: 12,
    proficiencies: {
      savingThrows: ['str', 'con'],
      armor: { categories: [], items: [] },
      weapons: { categories: ['simple'], items: [] },
      skills: { categories: [], items: [] },
    },
    features: [{ name: 'Rage', level: 1 }],
  }

  const minimalFeatInput = {
    slug: 'dup-source-feat',
    name: 'Dup Source Feat',
    category: 'origin' as const,
    repeatable: { allowed: false },
  }

  const minimalArmorInput = {
    kind: 'armor' as const,
    slug: 'dup-source-armor',
    name: 'Dup Source Armor',
    category: 'light' as const,
    cost: { amount: 15, currency: 'gp' as const },
    baseAc: 12,
    addDexModifier: true,
    stealthDisadvantage: false,
  }

  const minimalSpellInput = {
    slug: 'dup-source-spell',
    name: 'Dup Source Spell',
    school: 'evocation',
    level: 0,
    classIds: ['wizard'],
    castingTime: { normal: { value: 1, unit: 'action' }, canBeCastAsRitual: false },
    range: { kind: 'distance', value: { value: 60, unit: 'ft' } },
    duration: { kind: 'instantaneous' },
    components: { verbal: true, somatic: true },
    resolution: ELDRITCH_BLAST_RESOLUTION,
  }

  it('duplicates a class with regenerated feature ids and draft status', async () => {
    const { agent, csrfToken } = await registerOwner()
    const campaignId = await createTestCampaign(agent, csrfToken)

    const sourceRes = await agent
      .post(`/api/campaigns/${campaignId}/content/classes`)
      .set(CSRF_HEADER, csrfToken)
      .send(minimalClassInput)
      .expect(201)

    const source = sourceRes.body.classes

    const res = await agent
      .post(`/api/campaigns/${campaignId}/content/classes/${source.id}/duplicate`)
      .set(CSRF_HEADER, csrfToken)
      .send({ name: 'Dup Source Class Copy' })
      .expect(201)

    expect(res.body.classes.source).toBe('homebrew')
    expect(res.body.classes.status).toBe('draft')
    expect(res.body.classes.id).not.toBe(source.id)
    expect(res.body.classes.slug).toBe('dup-source-class-copy')
    expect(res.body.classes.features[0]?.id).not.toBe(source.features[0]?.id)

    const listRes = await agent
      .get(`/api/campaigns/${campaignId}/content/classes`)
      .set(CSRF_HEADER, csrfToken)
      .expect(200)

    const listed = listRes.body.classes.find(
      (row: { id: string }) => row.id === res.body.classes.id,
    )
    expect(listed?.campaignAccess).toMatchObject({
      available: true,
      visibilityMode: 'all_players',
      effectiveAudience: 'all_players',
    })
  })

  it('duplicates a spell and remaps resolution effect ids', async () => {
    const { agent, csrfToken } = await registerOwner()
    const campaignId = await createTestCampaign(agent, csrfToken)

    const sourceRes = await agent
      .post(`/api/campaigns/${campaignId}/content/spells`)
      .set(CSRF_HEADER, csrfToken)
      .send(minimalSpellInput)
      .expect(201)

    const source = sourceRes.body.spells

    const res = await agent
      .post(`/api/campaigns/${campaignId}/content/spells/${source.id}/duplicate`)
      .set(CSRF_HEADER, csrfToken)
      .send({ name: 'Dup Source Spell Copy' })
      .expect(201)

    const resolution = res.body.spells.resolution
    expect(resolution.effects[0]?.id).not.toBe(SPELL_RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID)
    expect(resolution.outcomes[0]?.applications[0]?.effectId).toBe(resolution.effects[0]?.id)
    expect(resolution.effects[0]?.id).not.toBe(source.resolution.effects[0]?.id)
  })

  it('duplicates equipment with nestedIdRegeneration none', async () => {
    const { agent, csrfToken } = await registerOwner()
    const campaignId = await createTestCampaign(agent, csrfToken)

    const sourceRes = await agent
      .post(`/api/campaigns/${campaignId}/content/equipment`)
      .set(CSRF_HEADER, csrfToken)
      .send(minimalArmorInput)
      .expect(201)

    const source = sourceRes.body.equipment

    const res = await agent
      .post(`/api/campaigns/${campaignId}/content/equipment/${source.id}/duplicate`)
      .set(CSRF_HEADER, csrfToken)
      .send({ name: 'Dup Source Armor Copy' })
      .expect(201)

    expect(res.body.equipment.kind).toBe('armor')
    expect(res.body.equipment.slug).toBe('dup-source-armor-copy')
  })

  it('does not inherit campaign access overlay from the source feat (duplicate uses feat type default all_players)', async () => {
    const { agent, csrfToken } = await registerOwner()
    const campaignId = await createTestCampaign(agent, csrfToken)

    const sourceRes = await agent
      .post(`/api/campaigns/${campaignId}/content/feats`)
      .set(CSRF_HEADER, csrfToken)
      .send({ ...minimalFeatInput, slug: 'dup-source-feat-access-overlay' })
      .expect(201)

    const source = sourceRes.body.feats

    await agent
      .patch(`/api/campaigns/${campaignId}/content/feats/${source.id}/campaign-access`)
      .set(CSRF_HEADER, csrfToken)
      .send({
        available: false,
        visibilityMode: 'dm_only',
        participantIds: [],
      })
      .expect(200)

    const res = await agent
      .post(`/api/campaigns/${campaignId}/content/feats/${source.id}/duplicate`)
      .set(CSRF_HEADER, csrfToken)
      .send({ name: 'Dup Source Feat Copy' })
      .expect(201)

    const listRes = await agent
      .get(`/api/campaigns/${campaignId}/content/feats`)
      .set(CSRF_HEADER, csrfToken)
      .expect(200)

    const listedCopy = listRes.body.feats.find(
      (row: { id: string }) => row.id === res.body.feats.id,
    )
    const listedSource = listRes.body.feats.find((row: { id: string }) => row.id === source.id)

    expect(listedCopy?.campaignAccess).toMatchObject({
      available: true,
      visibilityMode: 'all_players',
      effectiveAudience: 'all_players',
    })
    expect(listedSource?.campaignAccess).toMatchObject({
      available: false,
      visibilityMode: 'dm_only',
      effectiveAudience: 'none',
    })
  })

  it('matches ordinary create response shape', async () => {
    const { agent, csrfToken } = await registerOwner()
    const campaignId = await createTestCampaign(agent, csrfToken)

    const sourceRes = await agent
      .post(`/api/campaigns/${campaignId}/content/feats`)
      .set(CSRF_HEADER, csrfToken)
      .send(minimalFeatInput)
      .expect(201)

    const createRes = await agent
      .post(`/api/campaigns/${campaignId}/content/feats`)
      .set(CSRF_HEADER, csrfToken)
      .send({
        ...minimalFeatInput,
        slug: 'created-feat',
        name: 'Created Feat',
        status: 'draft',
      })
      .expect(201)

    const duplicateRes = await agent
      .post(`/api/campaigns/${campaignId}/content/feats/${sourceRes.body.feats.id}/duplicate`)
      .set(CSRF_HEADER, csrfToken)
      .send({ name: 'Dup Source Feat Copy 2' })
      .expect(201)

    expect(Object.keys(duplicateRes.body)).toEqual(Object.keys(createRes.body))
    expect(duplicateRes.body.feats).toEqual(
      expect.objectContaining({
        source: 'homebrew',
        status: 'draft',
        category: 'origin',
      }),
    )
  })

  it('returns 404 when the source entity is missing', async () => {
    const { agent, csrfToken } = await registerOwner()
    const campaignId = await createTestCampaign(agent, csrfToken)

    await agent
      .post(`/api/campaigns/${campaignId}/content/feats/000000000000000000000000/duplicate`)
      .set(CSRF_HEADER, csrfToken)
      .send({ name: 'Missing Copy' })
      .expect(404)
  })

  it('replays duplicate responses for the same idempotency key', async () => {
    const { agent, csrfToken } = await registerOwner()
    const campaignId = await createTestCampaign(agent, csrfToken)

    const sourceRes = await agent
      .post(`/api/campaigns/${campaignId}/content/feats`)
      .set(CSRF_HEADER, csrfToken)
      .send({ ...minimalFeatInput, slug: 'dup-source-feat-idempotency' })
      .expect(201)

    const sourceId = sourceRes.body.feats.id as string
    const idempotencyKey = 'duplicate-idempotency-test-key'

    const firstRes = await agent
      .post(`/api/campaigns/${campaignId}/content/feats/${sourceId}/duplicate`)
      .set(CSRF_HEADER, csrfToken)
      .set('Idempotency-Key', idempotencyKey)
      .send({ name: 'Idempotent Feat Copy' })
      .expect(201)

    const secondRes = await agent
      .post(`/api/campaigns/${campaignId}/content/feats/${sourceId}/duplicate`)
      .set(CSRF_HEADER, csrfToken)
      .set('Idempotency-Key', idempotencyKey)
      .send({ name: 'Idempotent Feat Copy' })
      .expect(201)

    expect(secondRes.body.feats.id).toBe(firstRes.body.feats.id)

    const listRes = await agent
      .get(`/api/campaigns/${campaignId}/content/feats`)
      .set(CSRF_HEADER, csrfToken)
      .expect(200)

    const copies = listRes.body.feats.filter(
      (feat: { name: string }) => feat.name === 'Idempotent Feat Copy',
    )
    expect(copies).toHaveLength(1)
  })

  it('duplicates skeleton without regenerating equipment entry ids or action ids', async () => {
    const { agent, csrfToken } = await registerOwner()
    const campaignId = await createTestCampaign(agent, csrfToken)

    const skeleton = loadSeedMonsters('srd-cc-5.2.1').find((row) => row.slug === 'skeleton')
    expect(skeleton).toBeDefined()

    const res = await agent
      .post(`/api/campaigns/${campaignId}/content/monsters/${skeleton!.id}/duplicate`)
      .set(CSRF_HEADER, csrfToken)
      .send({ name: 'Skeleton Copy' })
      .expect(201)

    const copy = res.body.monsters
    expect(copy.equipment.map((entry: { entryId: string }) => entry.entryId)).toEqual(
      skeleton!.equipment.map((entry) => entry.entryId),
    )
    expect(copy.actions.map((action: { id: string }) => action.id)).toEqual(
      skeleton!.actions.map((action) => action.id),
    )
    expect(monsterSchema.safeParse(copy).success).toBe(true)

    const equipmentCatalog = new Map(loadSeedEquipment('srd-cc-5.2.1').map((row) => [row.id, row]))
    const skillCatalog = new Map(
      loadSeedSkillProficiencies('srd-cc-5.2.1').map((row) => [row.slug, row]),
    )

    const sourceBlock = deriveMonsterStatBlock({
      monster: skeleton!,
      equipmentCatalog,
      skillCatalog,
    })
    const copyBlock = deriveMonsterStatBlock({
      monster: copy,
      equipmentCatalog,
      skillCatalog,
    })

    expect(copyBlock.attacks).toEqual(sourceBlock.attacks)

    const listRes = await agent
      .get(`/api/campaigns/${campaignId}/content/monsters`)
      .set(CSRF_HEADER, csrfToken)
      .expect(200)

    const listedCopy = listRes.body.monsters.find((row: { id: string }) => row.id === copy.id)
    expect(listedCopy?.campaignAccess).toMatchObject({
      available: true,
      visibilityMode: 'dm_only',
      effectiveAudience: 'dm_only',
    })
  })

  it('rejects empty duplicate names', async () => {
    const { agent, csrfToken } = await registerOwner()
    const campaignId = await createTestCampaign(agent, csrfToken)

    const sourceRes = await agent
      .post(`/api/campaigns/${campaignId}/content/feats`)
      .set(CSRF_HEADER, csrfToken)
      .send(minimalFeatInput)
      .expect(201)

    await agent
      .post(`/api/campaigns/${campaignId}/content/feats/${sourceRes.body.feats.id}/duplicate`)
      .set(CSRF_HEADER, csrfToken)
      .send({ name: '   ' })
      .expect(400)
  })
})
