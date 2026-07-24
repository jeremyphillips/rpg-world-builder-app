import request, { type Agent } from 'supertest'
import { describe, expect, it } from 'vitest'

import { CHILL_TOUCH_RESOLUTION, ELDRITCH_BLAST_RESOLUTION } from '@rpg/contracts'

import { CSRF_HEADER } from '../../lib/cookies'
import { CampaignMembershipModel } from '../campaign/campaign-membership.model'
import { createTestCampaign, registerAndLoginTestUser } from '../../test/auth-agent'
import { minimalNpcRequestInput } from '../../test/fixtures/npcs'
import { useIntegrationApp } from '../../test/setup/integration-app'

const getApp = useIntegrationApp()

async function registerAndLogin(): Promise<{ agent: Agent; csrfToken: string }> {
  return registerAndLoginTestUser(getApp())
}

describe('content list routes', () => {
  it('returns resolved classes for campaign members', async () => {
    const { agent, csrfToken } = await registerAndLogin()
    const campaignId = await createTestCampaign(agent, csrfToken)

    const res = await agent
      .get(`/api/campaigns/${campaignId}/content/classes`)
      .set(CSRF_HEADER, csrfToken)
      .expect(200)

    expect(Array.isArray(res.body.classes)).toBe(true)
    expect(res.body.classes.length).toBeGreaterThan(0)
    expect(res.body.classes[0].campaignAccess).toMatchObject({
      available: true,
      visibilityMode: 'all_players',
      effectiveAudience: 'all_players',
    })
  })

  it('returns resolved spells with the registry response key', async () => {
    const { agent, csrfToken } = await registerAndLogin()
    const campaignId = await createTestCampaign(agent, csrfToken)

    const res = await agent
      .get(`/api/campaigns/${campaignId}/content/spells`)
      .set(CSRF_HEADER, csrfToken)
      .expect(200)

    expect(Array.isArray(res.body.spells)).toBe(true)
    expect(res.body.spells.length).toBeGreaterThan(0)
  })

  it('returns skill proficiencies under the camelCase response key', async () => {
    const { agent, csrfToken } = await registerAndLogin()
    const campaignId = await createTestCampaign(agent, csrfToken)

    const res = await agent
      .get(`/api/campaigns/${campaignId}/content/skill-proficiencies`)
      .set(CSRF_HEADER, csrfToken)
      .expect(200)

    expect(Array.isArray(res.body.skillProficiencies)).toBe(true)
    expect(res.body.skillProficiencies.length).toBeGreaterThan(0)
  })

  it('returns catalog subclasses for a system class', async () => {
    const { agent, csrfToken } = await registerAndLogin()
    const campaignId = await createTestCampaign(agent, csrfToken)

    const res = await agent
      .get(`/api/campaigns/${campaignId}/content/classes/srd-cc-5.2.1:fighter/subclasses`)
      .set(CSRF_HEADER, csrfToken)
      .expect(200)

    expect(Array.isArray(res.body.subclasses)).toBe(true)
    expect(res.body.subclasses.length).toBeGreaterThan(0)
  })

  it('returns 404 for unknown content types', async () => {
    const { agent, csrfToken } = await registerAndLogin()
    const campaignId = await createTestCampaign(agent, csrfToken)

    await agent
      .get(`/api/campaigns/${campaignId}/content/not-a-type`)
      .set(CSRF_HEADER, csrfToken)
      .expect(404)
  })

  it('requires authentication for content reads', async () => {
    await request(getApp())
      .get('/api/campaigns/000000000000000000000000/content/classes')
      .expect(401)
  })
})

describe('content draft visibility', () => {
  const minimalFeatInput = {
    slug: 'draft-visibility-feat',
    name: 'Draft Visibility Feat',
    category: 'origin' as const,
    repeatable: { allowed: false },
  }

  async function addCampaignMember(
    campaignId: string,
    email: string,
    campaignRole: 'pc' | 'observer',
  ) {
    const member = await registerAndLoginTestUser(getApp(), {
      email,
      password: 'supersecret',
      displayName: 'Campaign Member',
    })
    const meRes = await member.agent
      .get('/api/auth/me')
      .set(CSRF_HEADER, member.csrfToken)
      .expect(200)
    await CampaignMembershipModel.create({
      campaignId,
      userId: meRes.body.user.id as string,
      campaignRole,
      characterIds: [],
      invitedAt: new Date(),
      joinedAt: new Date(),
    })
    return member
  }

  it('includes drafts in list responses for campaign managers', async () => {
    const { agent, csrfToken } = await registerAndLoginTestUser(getApp(), {
      email: 'draft-owner@example.com',
      password: 'supersecret',
      displayName: 'Owner',
    })
    const campaignId = await createTestCampaign(agent, csrfToken)

    const createRes = await agent
      .post(`/api/campaigns/${campaignId}/content/feats`)
      .set(CSRF_HEADER, csrfToken)
      .send({ ...minimalFeatInput, status: 'draft' })
      .expect(201)

    const draftId = createRes.body.feats.id as string

    const listRes = await agent
      .get(`/api/campaigns/${campaignId}/content/feats`)
      .set(CSRF_HEADER, csrfToken)
      .expect(200)

    expect(listRes.body.feats.some((feat: { id: string }) => feat.id === draftId)).toBe(true)
  })

  it('excludes drafts from list responses for non-manager campaign members', async () => {
    const owner = await registerAndLoginTestUser(getApp(), {
      email: 'draft-owner-2@example.com',
      password: 'supersecret',
      displayName: 'Owner',
    })
    const campaignId = await createTestCampaign(owner.agent, owner.csrfToken)

    const createRes = await owner.agent
      .post(`/api/campaigns/${campaignId}/content/feats`)
      .set(CSRF_HEADER, owner.csrfToken)
      .send({ ...minimalFeatInput, slug: 'draft-hidden-feat', status: 'draft' })
      .expect(201)

    const draftId = createRes.body.feats.id as string
    const member = await addCampaignMember(campaignId, 'draft-pc@example.com', 'pc')

    const listRes = await member.agent
      .get(`/api/campaigns/${campaignId}/content/feats`)
      .set(CSRF_HEADER, member.csrfToken)
      .expect(200)

    expect(listRes.body.feats.some((feat: { id: string }) => feat.id === draftId)).toBe(false)
  })
})

describe('content draft write routes', () => {
  const draftCreateCases = [
    {
      routeKey: 'classes',
      responseKey: 'classes',
      input: { slug: 'route-draft-class', name: '', hitDie: 8, status: 'draft' as const },
    },
    {
      routeKey: 'equipment',
      responseKey: 'equipment',
      input: {
        slug: 'route-draft-armor',
        kind: 'armor' as const,
        name: '',
        status: 'draft' as const,
      },
    },
    {
      routeKey: 'feats',
      responseKey: 'feats',
      input: {
        slug: 'route-draft-feat',
        name: '',
        repeatable: { allowed: false },
        status: 'draft' as const,
      },
    },
    {
      routeKey: 'skill-proficiencies',
      responseKey: 'skillProficiencies',
      input: { slug: 'route-draft-skill', name: '', status: 'draft' as const },
    },
    {
      routeKey: 'species',
      responseKey: 'species',
      input: {
        slug: 'route-draft-species',
        name: '',
        creatureType: 'humanoid',
        status: 'draft' as const,
      },
    },
    {
      routeKey: 'spells',
      responseKey: 'spells',
      input: {
        slug: 'route-draft-spell',
        name: '',
        school: 'evocation',
        status: 'draft' as const,
      },
    },
  ] as const

  it.each(draftCreateCases)(
    'creates an incomplete $routeKey draft via POST',
    async ({ routeKey, responseKey, input }) => {
      const { agent, csrfToken } = await registerAndLogin()
      const campaignId = await createTestCampaign(agent, csrfToken)

      const res = await agent
        .post(`/api/campaigns/${campaignId}/content/${routeKey}`)
        .set(CSRF_HEADER, csrfToken)
        .send(input)
        .expect(201)

      const entity = res.body[responseKey] as { id: string; status: string; source: string }
      expect(entity.source).toBe('homebrew')
      expect(entity.status).toBe('draft')
      expect(entity.id).toBeTruthy()
    },
  )

  it('rejects promote when a draft body is publish-incomplete', async () => {
    const { agent, csrfToken } = await registerAndLogin()
    const campaignId = await createTestCampaign(agent, csrfToken)

    const createRes = await agent
      .post(`/api/campaigns/${campaignId}/content/skill-proficiencies`)
      .set(CSRF_HEADER, csrfToken)
      .send({ slug: 'route-promote-skill', name: '', status: 'draft' })
      .expect(201)

    const entityId = createRes.body.skillProficiencies.id as string

    const promoteRes = await agent
      .post(`/api/campaigns/${campaignId}/content/skill-proficiencies/${entityId}/publish`)
      .set(CSRF_HEADER, csrfToken)
      .expect(400)

    expect(promoteRes.body.error.code).toBe('validation_error')
    expect(promoteRes.body.error.details?.issues?.length).toBeGreaterThan(0)
  })
})

describe('content write routes', () => {
  const minimalFeatInput = {
    slug: 'route-write-feat',
    name: 'Route Write Feat',
    category: 'origin' as const,
    repeatable: { allowed: false },
  }

  const minimalSkillInput = {
    slug: 'route-write-skill',
    name: 'Route Write Skill',
    ability: 'wis' as const,
    examples: ['Inspect a clue'],
  }

  it('creates homebrew content via POST', async () => {
    const { agent, csrfToken } = await registerAndLogin()
    const campaignId = await createTestCampaign(agent, csrfToken)

    const res = await agent
      .post(`/api/campaigns/${campaignId}/content/feats`)
      .set(CSRF_HEADER, csrfToken)
      .send(minimalFeatInput)
      .expect(201)

    expect(res.body.feats.source).toBe('homebrew')
    expect(res.body.feats.slug).toBe('route-write-feat')
  })

  it('patches a system record via PATCH and returns merged catalog row', async () => {
    const { agent, csrfToken } = await registerAndLogin()
    const campaignId = await createTestCampaign(agent, csrfToken)

    const listRes = await agent
      .get(`/api/campaigns/${campaignId}/content/feats`)
      .set(CSRF_HEADER, csrfToken)
      .expect(200)

    const alert = listRes.body.feats.find((feat: { slug: string }) => feat.slug === 'alert')
    expect(alert).toBeDefined()

    const patchRes = await agent
      .patch(`/api/campaigns/${campaignId}/content/feats/${alert.id}`)
      .set(CSRF_HEADER, csrfToken)
      .send({ name: 'Route Patched Alert' })
      .expect(200)

    expect(patchRes.body.feats.source).toBe('system')
    expect(patchRes.body.feats.name).toBe('Route Patched Alert')

    const reloadRes = await agent
      .get(`/api/campaigns/${campaignId}/content/feats`)
      .set(CSRF_HEADER, csrfToken)
      .expect(200)

    expect(reloadRes.body.feats.find((feat: { id: string }) => feat.id === alert.id)?.name).toBe(
      'Route Patched Alert',
    )
  })

  it('creates and updates homebrew skill proficiencies via POST and PATCH', async () => {
    const { agent, csrfToken } = await registerAndLogin()
    const campaignId = await createTestCampaign(agent, csrfToken)

    const createRes = await agent
      .post(`/api/campaigns/${campaignId}/content/skill-proficiencies`)
      .set(CSRF_HEADER, csrfToken)
      .send(minimalSkillInput)
      .expect(201)

    const entityId = createRes.body.skillProficiencies.id as string
    expect(createRes.body.skillProficiencies.source).toBe('homebrew')

    const patchRes = await agent
      .patch(`/api/campaigns/${campaignId}/content/skill-proficiencies/${entityId}`)
      .set(CSRF_HEADER, csrfToken)
      .send({ name: 'Updated Route Write Skill' })
      .expect(200)

    expect(patchRes.body.skillProficiencies.name).toBe('Updated Route Write Skill')
  })

  const minimalSpellInput = {
    slug: 'route-write-spell',
    name: 'Route Write Spell',
    school: 'evocation',
    level: 0,
    classIds: ['wizard'],
    castingTime: { normal: { value: 1, unit: 'action' }, canBeCastAsRitual: false },
    range: { kind: 'distance', value: { value: 60, unit: 'ft' } },
    duration: { kind: 'instantaneous' },
    components: { verbal: true, somatic: true },
  }

  it('creates homebrew spell with resolution, round-trips on reload, and clears via null', async () => {
    const { agent, csrfToken } = await registerAndLogin()
    const campaignId = await createTestCampaign(agent, csrfToken)

    const createRes = await agent
      .post(`/api/campaigns/${campaignId}/content/spells`)
      .set(CSRF_HEADER, csrfToken)
      .send({ ...minimalSpellInput, resolution: ELDRITCH_BLAST_RESOLUTION })
      .expect(201)

    const entityId = createRes.body.spells.id as string
    expect(createRes.body.spells.resolution).toEqual(ELDRITCH_BLAST_RESOLUTION)

    const patchRes = await agent
      .patch(`/api/campaigns/${campaignId}/content/spells/${entityId}`)
      .set(CSRF_HEADER, csrfToken)
      .send({ resolution: CHILL_TOUCH_RESOLUTION })
      .expect(200)

    expect(patchRes.body.spells.resolution).toEqual(CHILL_TOUCH_RESOLUTION)

    const omitRes = await agent
      .patch(`/api/campaigns/${campaignId}/content/spells/${entityId}`)
      .set(CSRF_HEADER, csrfToken)
      .send({ name: 'Resolution Unchanged Spell' })
      .expect(200)

    expect(omitRes.body.spells.name).toBe('Resolution Unchanged Spell')
    expect(omitRes.body.spells.resolution).toEqual(CHILL_TOUCH_RESOLUTION)

    const reloadRes = await agent
      .get(`/api/campaigns/${campaignId}/content/spells`)
      .set(CSRF_HEADER, csrfToken)
      .expect(200)

    expect(
      reloadRes.body.spells.find((spell: { id: string }) => spell.id === entityId)?.resolution,
    ).toEqual(CHILL_TOUCH_RESOLUTION)

    const clearRes = await agent
      .patch(`/api/campaigns/${campaignId}/content/spells/${entityId}`)
      .set(CSRF_HEADER, csrfToken)
      .send({ resolution: null })
      .expect(200)

    expect(clearRes.body.spells.resolution).toBeUndefined()

    const reloadAfterClear = await agent
      .get(`/api/campaigns/${campaignId}/content/spells`)
      .set(CSRF_HEADER, csrfToken)
      .expect(200)

    expect(
      reloadAfterClear.body.spells.find((spell: { id: string }) => spell.id === entityId)
        ?.resolution,
    ).toBeUndefined()
  })

  it('replaces resolution on a system spell via overlay patch', async () => {
    const { agent, csrfToken } = await registerAndLogin()
    const campaignId = await createTestCampaign(agent, csrfToken)

    const listRes = await agent
      .get(`/api/campaigns/${campaignId}/content/spells`)
      .set(CSRF_HEADER, csrfToken)
      .expect(200)

    const eldritchBlast = listRes.body.spells.find(
      (spell: { slug: string }) => spell.slug === 'eldritch-blast',
    )
    expect(eldritchBlast?.resolution).toBeDefined()

    const patchedResolution = {
      ...eldritchBlast.resolution,
      effects: [
        {
          ...eldritchBlast.resolution.effects[0],
          roll: { dice: { count: 2, faces: 10 } },
        },
      ],
    }

    const patchRes = await agent
      .patch(`/api/campaigns/${campaignId}/content/spells/${eldritchBlast.id}`)
      .set(CSRF_HEADER, csrfToken)
      .send({ resolution: patchedResolution })
      .expect(200)

    expect(patchRes.body.spells.resolution).toEqual(patchedResolution)

    const reloadRes = await agent
      .get(`/api/campaigns/${campaignId}/content/spells`)
      .set(CSRF_HEADER, csrfToken)
      .expect(200)

    expect(
      reloadRes.body.spells.find((spell: { id: string }) => spell.id === eldritchBlast.id)
        ?.resolution,
    ).toEqual(patchedResolution)
  })
})

describe('content delete routes', () => {
  const minimalSpeciesInput = {
    slug: 'route-delete-folk',
    name: 'Route Delete Folk',
    creatureType: 'humanoid',
    sizes: ['medium'],
    movement: { walk: 30 },
    traits: [],
  }

  it('returns deletion availability for homebrew content', async () => {
    const { agent, csrfToken } = await registerAndLogin()
    const campaignId = await createTestCampaign(agent, csrfToken)

    const createRes = await agent
      .post(`/api/campaigns/${campaignId}/content/species`)
      .set(CSRF_HEADER, csrfToken)
      .send(minimalSpeciesInput)
      .expect(201)

    const entityId = createRes.body.species.id as string

    const res = await agent
      .get(`/api/campaigns/${campaignId}/content/species/${entityId}/deletion-availability`)
      .set(CSRF_HEADER, csrfToken)
      .expect(200)

    expect(res.body.availability).toEqual({ status: 'allowed' })
  })

  it('deletes homebrew content and returns deleted result', async () => {
    const { agent, csrfToken } = await registerAndLogin()
    const campaignId = await createTestCampaign(agent, csrfToken)

    const createRes = await agent
      .post(`/api/campaigns/${campaignId}/content/species`)
      .set(CSRF_HEADER, csrfToken)
      .send(minimalSpeciesInput)
      .expect(201)

    const entityId = createRes.body.species.id as string

    const res = await agent
      .delete(`/api/campaigns/${campaignId}/content/species/${entityId}`)
      .set(CSRF_HEADER, csrfToken)
      .expect(200)

    expect(res.body.result).toEqual({ status: 'deleted' })
  })

  it('returns blocked result shape on DELETE when usage exists', async () => {
    const { agent, csrfToken } = await registerAndLogin()
    const campaignId = await createTestCampaign(agent, csrfToken)

    const createRes = await agent
      .post(`/api/campaigns/${campaignId}/content/species`)
      .set(CSRF_HEADER, csrfToken)
      .send(minimalSpeciesInput)
      .expect(201)

    const entityId = createRes.body.species.id as string

    await agent
      .post(`/api/campaigns/${campaignId}/npcs`)
      .set(CSRF_HEADER, csrfToken)
      .send({
        ...minimalNpcRequestInput,
        name: 'Blocking NPC',
        species: { id: entityId },
      })
      .expect(201)

    const res = await agent
      .delete(`/api/campaigns/${campaignId}/content/species/${entityId}`)
      .set(CSRF_HEADER, csrfToken)
      .expect(409)

    expect(res.body.result.status).toBe('blocked')
    expect(Array.isArray(res.body.result.blockers)).toBe(true)
  })
})

describe('content campaign access routes', () => {
  const minimalFeatInput = {
    slug: 'route-campaign-access-feat',
    name: 'Campaign Access Feat',
    category: 'origin' as const,
    repeatable: { allowed: false },
  }

  it('attaches default campaignAccess on list rows and supports create-then-patch sequencing', async () => {
    const { agent, csrfToken } = await registerAndLogin()
    const campaignId = await createTestCampaign(agent, csrfToken)

    const createRes = await agent
      .post(`/api/campaigns/${campaignId}/content/feats`)
      .set(CSRF_HEADER, csrfToken)
      .send(minimalFeatInput)
      .expect(201)

    const entityId = createRes.body.feats.id as string

    const patchRes = await agent
      .patch(`/api/campaigns/${campaignId}/content/feats/${entityId}/campaign-access`)
      .set(CSRF_HEADER, csrfToken)
      .send({ available: false, visibilityMode: 'dm_only', participantIds: [] })
      .expect(200)

    expect(patchRes.body.result.campaignAccess).toMatchObject({
      available: false,
      visibilityMode: 'dm_only',
      effectiveAudience: 'none',
    })

    const listRes = await agent
      .get(`/api/campaigns/${campaignId}/content/feats`)
      .set(CSRF_HEADER, csrfToken)
      .expect(200)

    expect(
      listRes.body.feats.find((feat: { id: string }) => feat.id === entityId)?.campaignAccess,
    ).toMatchObject({
      available: false,
      visibilityMode: 'dm_only',
      effectiveAudience: 'none',
    })
  })

  it('returns campaign-access-availability preflight for system content', async () => {
    const { agent, csrfToken } = await registerAndLogin()
    const campaignId = await createTestCampaign(agent, csrfToken)

    const listRes = await agent
      .get(`/api/campaigns/${campaignId}/content/feats`)
      .set(CSRF_HEADER, csrfToken)
      .expect(200)

    const alert = listRes.body.feats.find((feat: { slug: string }) => feat.slug === 'alert')
    expect(alert).toBeDefined()

    const res = await agent
      .get(`/api/campaigns/${campaignId}/content/feats/${alert.id}/campaign-access-availability`)
      .set(CSRF_HEADER, csrfToken)
      .expect(200)

    expect(res.body.availability).toEqual({ status: 'allowed' })
  })

  it('returns normalized campaignAccess from PATCH for client baseline', async () => {
    const { agent, csrfToken } = await registerAndLogin()
    const campaignId = await createTestCampaign(agent, csrfToken)

    const createRes = await agent
      .post(`/api/campaigns/${campaignId}/content/feats`)
      .set(CSRF_HEADER, csrfToken)
      .send({ ...minimalFeatInput, slug: 'normalized-access-feat', name: 'Normalized Access Feat' })
      .expect(201)

    const entityId = createRes.body.feats.id as string

    const patchRes = await agent
      .patch(`/api/campaigns/${campaignId}/content/feats/${entityId}/campaign-access`)
      .set(CSRF_HEADER, csrfToken)
      .send({ available: false, visibilityMode: 'all_players', participantIds: [] })
      .expect(200)

    expect(patchRes.body.result).toMatchObject({
      status: 'updated',
      campaignAccess: {
        available: false,
        visibilityMode: 'all_players',
        participantIds: [],
        effectiveAudience: 'none',
      },
    })
  })

  it('returns structured blockers when turning access off for referenced homebrew content', async () => {
    const { agent, csrfToken } = await registerAndLogin()
    const campaignId = await createTestCampaign(agent, csrfToken)

    const createRes = await agent
      .post(`/api/campaigns/${campaignId}/content/feats`)
      .set(CSRF_HEADER, csrfToken)
      .send({ ...minimalFeatInput, slug: 'blocked-access-feat', name: 'Blocked Access Feat' })
      .expect(201)

    const entityId = createRes.body.feats.id as string

    await agent
      .post(`/api/campaigns/${campaignId}/npcs`)
      .set(CSRF_HEADER, csrfToken)
      .send({
        ...minimalNpcRequestInput,
        name: 'Feat Holder',
        feats: [{ featId: entityId }],
      })
      .expect(201)

    const patchRes = await agent
      .patch(`/api/campaigns/${campaignId}/content/feats/${entityId}/campaign-access`)
      .set(CSRF_HEADER, csrfToken)
      .send({ available: false, visibilityMode: 'all_players', participantIds: [] })
      .expect(409)

    expect(patchRes.body.result.status).toBe('blocked')
    expect(Array.isArray(patchRes.body.result.blockers)).toBe(true)
  })

  it('rejects malformed campaign access payloads', async () => {
    const { agent, csrfToken } = await registerAndLogin()
    const campaignId = await createTestCampaign(agent, csrfToken)

    const createRes = await agent
      .post(`/api/campaigns/${campaignId}/content/feats`)
      .set(CSRF_HEADER, csrfToken)
      .send({ ...minimalFeatInput, slug: 'malformed-access-feat', name: 'Malformed Access Feat' })
      .expect(201)

    const entityId = createRes.body.feats.id as string

    await agent
      .patch(`/api/campaigns/${campaignId}/content/feats/${entityId}/campaign-access`)
      .set(CSRF_HEADER, csrfToken)
      .send({ available: 'nope' })
      .expect(400)
  })
})

describe('content campaign access discovery enforcement', () => {
  const minimalFeatInput = {
    slug: 'discovery-feat',
    name: 'Discovery Feat',
    category: 'origin' as const,
    repeatable: { allowed: false },
  }

  async function addCampaignMember(
    campaignId: string,
    email: string,
    campaignRole: 'pc' | 'observer',
    characterIds: string[] = [],
  ) {
    const member = await registerAndLoginTestUser(getApp(), {
      email,
      password: 'supersecret',
      displayName: 'Campaign Member',
    })
    const meRes = await member.agent
      .get('/api/auth/me')
      .set(CSRF_HEADER, member.csrfToken)
      .expect(200)
    await CampaignMembershipModel.create({
      campaignId,
      userId: meRes.body.user.id as string,
      campaignRole,
      characterIds,
      invitedAt: new Date(),
      joinedAt: new Date(),
    })
    return member
  }

  async function createPublishedFeat(
    campaignId: string,
    agent: Agent,
    csrfToken: string,
    slug: string,
  ) {
    const createRes = await agent
      .post(`/api/campaigns/${campaignId}/content/feats`)
      .set(CSRF_HEADER, csrfToken)
      .send({ ...minimalFeatInput, slug, name: `Feat ${slug}` })
      .expect(201)
    return createRes.body.feats.id as string
  }

  it('hides unavailable and dm_only content from non-manager members', async () => {
    const owner = await registerAndLoginTestUser(getApp(), {
      email: 'discovery-owner@example.com',
      password: 'supersecret',
      displayName: 'Owner',
    })
    const campaignId = await createTestCampaign(owner.agent, owner.csrfToken)

    const unavailableId = await createPublishedFeat(
      campaignId,
      owner.agent,
      owner.csrfToken,
      'discovery-unavailable-feat',
    )
    const dmOnlyId = await createPublishedFeat(
      campaignId,
      owner.agent,
      owner.csrfToken,
      'discovery-dm-only-feat',
    )

    await owner.agent
      .patch(`/api/campaigns/${campaignId}/content/feats/${unavailableId}/campaign-access`)
      .set(CSRF_HEADER, owner.csrfToken)
      .send({ available: false, visibilityMode: 'all_players', participantIds: [] })
      .expect(200)

    await owner.agent
      .patch(`/api/campaigns/${campaignId}/content/feats/${dmOnlyId}/campaign-access`)
      .set(CSRF_HEADER, owner.csrfToken)
      .send({ available: true, visibilityMode: 'dm_only', participantIds: [] })
      .expect(200)

    const member = await addCampaignMember(campaignId, 'discovery-pc@example.com', 'pc', ['pc-1'])

    const listRes = await member.agent
      .get(`/api/campaigns/${campaignId}/content/feats`)
      .set(CSRF_HEADER, member.csrfToken)
      .expect(200)

    const listedIds = listRes.body.feats.map((feat: { id: string }) => feat.id)
    expect(listedIds).not.toContain(unavailableId)
    expect(listedIds).not.toContain(dmOnlyId)

    const ownerListRes = await owner.agent
      .get(`/api/campaigns/${campaignId}/content/feats`)
      .set(CSRF_HEADER, owner.csrfToken)
      .expect(200)

    const ownerListedIds = ownerListRes.body.feats.map((feat: { id: string }) => feat.id)
    expect(ownerListedIds).toContain(unavailableId)
    expect(ownerListedIds).toContain(dmOnlyId)
  })

  it('defensively hides specific_players content unless the viewer PC is granted', async () => {
    const owner = await registerAndLoginTestUser(getApp(), {
      email: 'discovery-specific-owner@example.com',
      password: 'supersecret',
      displayName: 'Owner',
    })
    const campaignId = await createTestCampaign(owner.agent, owner.csrfToken)

    const restrictedId = await createPublishedFeat(
      campaignId,
      owner.agent,
      owner.csrfToken,
      'discovery-specific-feat',
    )

    await owner.agent
      .patch(`/api/campaigns/${campaignId}/content/feats/${restrictedId}/campaign-access`)
      .set(CSRF_HEADER, owner.csrfToken)
      .send({
        available: true,
        visibilityMode: 'specific_players',
        participantIds: ['granted-pc'],
      })
      .expect(200)

    const grantedMember = await addCampaignMember(
      campaignId,
      'discovery-granted@example.com',
      'pc',
      ['granted-pc'],
    )
    const deniedMember = await addCampaignMember(campaignId, 'discovery-denied@example.com', 'pc', [
      'other-pc',
    ])

    const grantedList = await grantedMember.agent
      .get(`/api/campaigns/${campaignId}/content/feats`)
      .set(CSRF_HEADER, grantedMember.csrfToken)
      .expect(200)
    expect(grantedList.body.feats.some((feat: { id: string }) => feat.id === restrictedId)).toBe(
      true,
    )

    const deniedList = await deniedMember.agent
      .get(`/api/campaigns/${campaignId}/content/feats`)
      .set(CSRF_HEADER, deniedMember.csrfToken)
      .expect(200)
    expect(deniedList.body.feats.some((feat: { id: string }) => feat.id === restrictedId)).toBe(
      false,
    )
  })

  it('hides restricted content from observers', async () => {
    const owner = await registerAndLoginTestUser(getApp(), {
      email: 'discovery-observer-owner@example.com',
      password: 'supersecret',
      displayName: 'Owner',
    })
    const campaignId = await createTestCampaign(owner.agent, owner.csrfToken)

    const dmOnlyId = await createPublishedFeat(
      campaignId,
      owner.agent,
      owner.csrfToken,
      'discovery-observer-feat',
    )

    await owner.agent
      .patch(`/api/campaigns/${campaignId}/content/feats/${dmOnlyId}/campaign-access`)
      .set(CSRF_HEADER, owner.csrfToken)
      .send({ available: true, visibilityMode: 'dm_only', participantIds: [] })
      .expect(200)

    const observer = await addCampaignMember(
      campaignId,
      'discovery-observer@example.com',
      'observer',
    )

    const listRes = await observer.agent
      .get(`/api/campaigns/${campaignId}/content/feats`)
      .set(CSRF_HEADER, observer.csrfToken)
      .expect(200)

    expect(listRes.body.feats.some((feat: { id: string }) => feat.id === dmOnlyId)).toBe(false)
  })
})
