import { describe, expect, it } from 'vitest'

import { CSRF_HEADER } from '../../../lib/cookies'
import { createTestCampaign, registerAndLoginTestUser } from '../../../test/auth-agent'
import { useIntegrationApp } from '../../../test/setup/integration-app'

const getApp = useIntegrationApp()

describe('location content routes', () => {
  it('supports create, list, update, duplication, and delete for a simple hierarchy', async () => {
    const { agent, csrfToken } = await registerAndLoginTestUser(getApp())
    const campaignId = await createTestCampaign(agent, csrfToken)

    const worldRes = await agent
      .post(`/api/campaigns/${campaignId}/content/locations`)
      .set(CSRF_HEADER, csrfToken)
      .send({
        slug: 'faerun',
        kind: 'world',
        name: 'Faerûn',
      })
      .expect(201)

    const world = worldRes.body.locations
    expect(world).toMatchObject({
      kind: 'world',
      name: 'Faerûn',
      source: 'homebrew',
      status: 'published',
    })

    const regionRes = await agent
      .post(`/api/campaigns/${campaignId}/content/locations`)
      .set(CSRF_HEADER, csrfToken)
      .send({
        slug: 'sword-coast',
        kind: 'region',
        name: 'Sword Coast',
        classification: { kind: 'geographic', type: 'coast' },
        parentLocationId: world.id,
      })
      .expect(201)

    const region = regionRes.body.locations
    expect(region.parentLocationId).toBe(world.id)

    const listRes = await agent
      .get(`/api/campaigns/${campaignId}/content/locations`)
      .set(CSRF_HEADER, csrfToken)
      .expect(200)
    expect(listRes.body.locations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: world.id }),
        expect.objectContaining({ id: region.id }),
      ]),
    )

    const updateRes = await agent
      .patch(`/api/campaigns/${campaignId}/content/locations/${region.id}`)
      .set(CSRF_HEADER, csrfToken)
      .send({ kind: 'region', description: 'Western Faerûn.' })
      .expect(200)
    expect(updateRes.body.locations).toMatchObject({
      description: 'Western Faerûn.',
    })

    const duplicateRes = await agent
      .post(`/api/campaigns/${campaignId}/content/locations/${region.id}/duplicate`)
      .set(CSRF_HEADER, csrfToken)
      .send({ name: 'Sword Coast Copy' })
      .expect(201)
    expect(duplicateRes.body.locations).toMatchObject({
      name: 'Sword Coast Copy',
      kind: 'region',
      status: 'draft',
    })

    await agent
      .delete(`/api/campaigns/${campaignId}/content/locations/${duplicateRes.body.locations.id}`)
      .set(CSRF_HEADER, csrfToken)
      .expect(200)
  })

  it('rejects invalid parent kind pairings on publish', async () => {
    const { agent, csrfToken } = await registerAndLoginTestUser(getApp())
    const campaignId = await createTestCampaign(agent, csrfToken)

    const worldRes = await agent
      .post(`/api/campaigns/${campaignId}/content/locations`)
      .set(CSRF_HEADER, csrfToken)
      .send({
        slug: 'lone-world',
        kind: 'world',
        name: 'Lone World',
      })
      .expect(201)

    const regionRes = await agent
      .post(`/api/campaigns/${campaignId}/content/locations`)
      .set(CSRF_HEADER, csrfToken)
      .send({
        slug: 'lone-region',
        kind: 'region',
        name: 'Lone Region',
        parentLocationId: worldRes.body.locations.id,
      })
      .expect(201)

    await agent
      .post(`/api/campaigns/${campaignId}/content/locations`)
      .set(CSRF_HEADER, csrfToken)
      .send({
        slug: 'invalid-tower',
        kind: 'structure',
        name: 'Invalid Tower',
        parentLocationId: regionRes.body.locations.id,
      })
      .expect(400)
  })

  it('allows incomplete drafts without parent or kind-specific fields', async () => {
    const { agent, csrfToken } = await registerAndLoginTestUser(getApp())
    const campaignId = await createTestCampaign(agent, csrfToken)

    const createRes = await agent
      .post(`/api/campaigns/${campaignId}/content/locations`)
      .set(CSRF_HEADER, csrfToken)
      .send({
        slug: 'unfinished-site',
        kind: 'site',
        name: '',
        status: 'draft',
      })
      .expect(201)

    expect(createRes.body.locations).toMatchObject({
      kind: 'site',
      status: 'draft',
    })
    expect(createRes.body.locations.parentLocationId).toBeUndefined()
  })

  it('persists Model E building classification variants', async () => {
    const { agent, csrfToken } = await registerAndLoginTestUser(getApp())
    const campaignId = await createTestCampaign(agent, csrfToken)

    const worldRes = await agent
      .post(`/api/campaigns/${campaignId}/content/locations`)
      .set(CSRF_HEADER, csrfToken)
      .send({ slug: 'model-e-world', kind: 'world', name: 'Model E World' })
      .expect(201)

    const settlementRes = await agent
      .post(`/api/campaigns/${campaignId}/content/locations`)
      .set(CSRF_HEADER, csrfToken)
      .send({
        slug: 'model-e-settlement',
        kind: 'settlement',
        name: 'Model E Settlement',
        settlementType: 'city',
        parentLocationId: worldRes.body.locations.id,
      })
      .expect(201)

    const parentId = settlementRes.body.locations.id

    const facilityOnlyRes = await agent
      .post(`/api/campaigns/${campaignId}/content/locations`)
      .set(CSRF_HEADER, csrfToken)
      .send({
        slug: 'yawning-portal',
        kind: 'structure',
        name: 'Yawning Portal',
        structureType: 'building',
        classification: { facilityType: 'brewery' },
        parentLocationId: parentId,
      })
      .expect(201)
    expect(facilityOnlyRes.body.locations.classification).toEqual({ facilityType: 'brewery' })

    const formOnlyRes = await agent
      .post(`/api/campaigns/${campaignId}/content/locations`)
      .set(CSRF_HEADER, csrfToken)
      .send({
        slug: 'coaching-inn',
        kind: 'structure',
        name: 'Coaching Inn',
        structureType: 'building',
        classification: { form: 'house' },
        parentLocationId: parentId,
      })
      .expect(201)
    expect(formOnlyRes.body.locations.classification).toEqual({ form: 'house' })

    const combinedRes = await agent
      .post(`/api/campaigns/${campaignId}/content/locations`)
      .set(CSRF_HEADER, csrfToken)
      .send({
        slug: 'healing-temple',
        kind: 'structure',
        name: 'Healing Temple',
        structureType: 'building',
        classification: { form: 'house', facilityType: 'temple' },
        parentLocationId: parentId,
      })
      .expect(201)
    expect(combinedRes.body.locations.classification).toEqual({
      form: 'house',
      facilityType: 'temple',
    })

    const unclassifiedRes = await agent
      .post(`/api/campaigns/${campaignId}/content/locations`)
      .set(CSRF_HEADER, csrfToken)
      .send({
        slug: 'unfinished-hall',
        kind: 'structure',
        name: 'Unfinished Hall',
        structureType: 'building',
        parentLocationId: parentId,
      })
      .expect(201)
    expect(unclassifiedRes.body.locations.classification).toBeUndefined()
  })

  it('rejects invalid Model E building classification values', async () => {
    const { agent, csrfToken } = await registerAndLoginTestUser(getApp())
    const campaignId = await createTestCampaign(agent, csrfToken)

    const worldRes = await agent
      .post(`/api/campaigns/${campaignId}/content/locations`)
      .set(CSRF_HEADER, csrfToken)
      .send({ slug: 'reject-world', kind: 'world', name: 'Reject World' })
      .expect(201)

    const settlementRes = await agent
      .post(`/api/campaigns/${campaignId}/content/locations`)
      .set(CSRF_HEADER, csrfToken)
      .send({
        slug: 'reject-settlement',
        kind: 'settlement',
        name: 'Reject Settlement',
        settlementType: 'town',
        parentLocationId: worldRes.body.locations.id,
      })
      .expect(201)

    const parentId = settlementRes.body.locations.id

    await agent
      .post(`/api/campaigns/${campaignId}/content/locations`)
      .set(CSRF_HEADER, csrfToken)
      .send({
        slug: 'empty-classification',
        kind: 'structure',
        name: 'Empty Classification',
        structureType: 'building',
        classification: {},
        parentLocationId: parentId,
      })
      .expect(400)

    await agent
      .post(`/api/campaigns/${campaignId}/content/locations`)
      .set(CSRF_HEADER, csrfToken)
      .send({
        slug: 'bad-form',
        kind: 'structure',
        name: 'Bad Form',
        structureType: 'building',
        classification: { form: 'gatehouse' },
        parentLocationId: parentId,
      })
      .expect(400)

    await agent
      .post(`/api/campaigns/${campaignId}/content/locations`)
      .set(CSRF_HEADER, csrfToken)
      .send({
        slug: 'bad-facility',
        kind: 'structure',
        name: 'Bad Facility',
        structureType: 'building',
        classification: { facilityType: 'not-a-facility' },
        parentLocationId: parentId,
      })
      .expect(400)

    await agent
      .post(`/api/campaigns/${campaignId}/content/locations`)
      .set(CSRF_HEADER, csrfToken)
      .send({
        slug: 'fort-with-classification',
        kind: 'structure',
        name: 'Fort With Classification',
        structureType: 'fortification',
        classification: { facilityType: 'brewery' },
        parentLocationId: parentId,
      })
      .expect(400)
  })

  it('rejects district-under-district parent assignments on publish', async () => {
    const { agent, csrfToken } = await registerAndLoginTestUser(getApp())
    const campaignId = await createTestCampaign(agent, csrfToken)

    const worldRes = await agent
      .post(`/api/campaigns/${campaignId}/content/locations`)
      .set(CSRF_HEADER, csrfToken)
      .send({ slug: 'nest-world', kind: 'world', name: 'Nest World' })
      .expect(201)

    const settlementRes = await agent
      .post(`/api/campaigns/${campaignId}/content/locations`)
      .set(CSRF_HEADER, csrfToken)
      .send({
        slug: 'nest-city',
        kind: 'settlement',
        name: 'Nest City',
        settlementType: 'city',
        parentLocationId: worldRes.body.locations.id,
      })
      .expect(201)

    const districtRes = await agent
      .post(`/api/campaigns/${campaignId}/content/locations`)
      .set(CSRF_HEADER, csrfToken)
      .send({
        slug: 'outer-district',
        kind: 'district',
        name: 'Outer District',
        parentLocationId: settlementRes.body.locations.id,
      })
      .expect(201)

    const siblingDistrictRes = await agent
      .post(`/api/campaigns/${campaignId}/content/locations`)
      .set(CSRF_HEADER, csrfToken)
      .send({
        slug: 'sibling-district',
        kind: 'district',
        name: 'Sibling District',
        parentLocationId: settlementRes.body.locations.id,
      })
      .expect(201)

    await agent
      .post(`/api/campaigns/${campaignId}/content/locations`)
      .set(CSRF_HEADER, csrfToken)
      .send({
        slug: 'inner-district',
        kind: 'district',
        name: 'Inner District',
        parentLocationId: districtRes.body.locations.id,
      })
      .expect(400)

    await agent
      .patch(
        `/api/campaigns/${campaignId}/content/locations/${siblingDistrictRes.body.locations.id}`,
      )
      .set(CSRF_HEADER, csrfToken)
      .send({
        kind: 'district',
        parentLocationId: districtRes.body.locations.id,
      })
      .expect(400)
  })

  it('changes only the moved child parentLocationId during hierarchy mutation', async () => {
    const { agent, csrfToken } = await registerAndLoginTestUser(getApp())
    const campaignId = await createTestCampaign(agent, csrfToken)

    const worldRes = await agent
      .post(`/api/campaigns/${campaignId}/content/locations`)
      .set(CSRF_HEADER, csrfToken)
      .send({ slug: 'move-world', kind: 'world', name: 'Move World' })
      .expect(201)

    const settlementRes = await agent
      .post(`/api/campaigns/${campaignId}/content/locations`)
      .set(CSRF_HEADER, csrfToken)
      .send({
        slug: 'move-city',
        kind: 'settlement',
        name: 'Move City',
        settlementType: 'city',
        parentLocationId: worldRes.body.locations.id,
      })
      .expect(201)

    const parkRes = await agent
      .post(`/api/campaigns/${campaignId}/content/locations`)
      .set(CSRF_HEADER, csrfToken)
      .send({
        slug: 'move-park',
        kind: 'district',
        name: 'Park',
        parentLocationId: settlementRes.body.locations.id,
      })
      .expect(201)

    const tenderloinRes = await agent
      .post(`/api/campaigns/${campaignId}/content/locations`)
      .set(CSRF_HEADER, csrfToken)
      .send({
        slug: 'move-tenderloin',
        kind: 'district',
        name: 'Tenderloin',
        parentLocationId: settlementRes.body.locations.id,
      })
      .expect(201)

    const guildhouseRes = await agent
      .post(`/api/campaigns/${campaignId}/content/locations`)
      .set(CSRF_HEADER, csrfToken)
      .send({
        slug: 'move-guildhouse',
        kind: 'structure',
        name: 'Guildhouse',
        structureType: 'building',
        classification: { facilityType: 'residence' },
        parentLocationId: parkRes.body.locations.id,
      })
      .expect(201)

    const snapshotBefore = await agent
      .get(`/api/campaigns/${campaignId}/content/locations`)
      .set(CSRF_HEADER, csrfToken)
      .expect(200)

    const hierarchySnapshot = (locations: Array<{ id: string; parentLocationId?: string }>) =>
      Object.fromEntries(
        locations.map((location) => [location.id, location.parentLocationId ?? null]),
      )

    const before = hierarchySnapshot(snapshotBefore.body.locations)

    await agent
      .patch(`/api/campaigns/${campaignId}/content/locations/${guildhouseRes.body.locations.id}`)
      .set(CSRF_HEADER, csrfToken)
      .send({
        kind: 'structure',
        parentLocationId: tenderloinRes.body.locations.id,
      })
      .expect(200)

    const snapshotAfter = await agent
      .get(`/api/campaigns/${campaignId}/content/locations`)
      .set(CSRF_HEADER, csrfToken)
      .expect(200)

    const after = hierarchySnapshot(snapshotAfter.body.locations)
    const changedIds = Object.keys(before).filter((id) => before[id] !== after[id])

    expect(changedIds).toEqual([guildhouseRes.body.locations.id])
    expect(after[guildhouseRes.body.locations.id]).toBe(tenderloinRes.body.locations.id)
  })
})
