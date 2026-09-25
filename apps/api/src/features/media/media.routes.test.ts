import request, { type Agent } from 'supertest'
import { describe, expect, it } from 'vitest'

import { MEDIA_UPLOAD_FORM_FIELD, MEDIA_UPLOAD_IDEMPOTENCY_HEADER } from '@rpg/contracts'

import { CSRF_HEADER } from '../../lib/cookies'
import { createTestCampaign, registerAndLoginTestUser } from '../../test/auth-agent'
import { clearTestDb } from '../../test/db'
import {
  CORRUPT_IMAGE_BUFFER,
  createTestImageBuffer,
  MINIMAL_PNG_BUFFER,
  SVG_BUFFER,
} from '../../test/fixtures/media-images'
import { registerCampaignMember } from '../../test/helpers/campaign-membership'
import { useIntegrationApp } from '../../test/setup/integration-app'
import { useIntegrationDb } from '../../test/setup/integration-db'

const getApp = useIntegrationApp()

useIntegrationDb()

async function authedOwnerCampaign(email: string) {
  const { agent, csrfToken, userId } = await registerAndLoginTestUser(getApp(), {
    email,
    password: 'supersecret',
    displayName: 'Media Owner',
  })
  const campaignId = await createTestCampaign(agent, csrfToken)
  return { agent, csrfToken, campaignId, userId }
}

async function createSession(agent: Agent, csrfToken: string, scope: Record<string, unknown>) {
  return agent.post('/api/media/sessions').set(CSRF_HEADER, csrfToken).send({ scope }).expect(201)
}

function uploadToSession(
  agent: Agent,
  csrfToken: string,
  sessionId: string,
  buffer: Buffer,
  filename: string,
  idempotencyKey?: string,
) {
  let req = agent.post(`/api/media/sessions/${sessionId}/assets`).set(CSRF_HEADER, csrfToken)

  if (idempotencyKey) {
    req = req.set(MEDIA_UPLOAD_IDEMPOTENCY_HEADER, idempotencyKey)
  }

  return req.attach(MEDIA_UPLOAD_FORM_FIELD, buffer, filename)
}

describe('media routes', () => {
  it('requires authentication', async () => {
    await clearTestDb()
    await request(getApp()).get('/api/media/assets/asset-1').expect(401)
  })

  it('creates a session, uploads raster assets, and returns authorized metadata', async () => {
    await clearTestDb()

    const { agent, csrfToken, campaignId } = await authedOwnerCampaign('media-owner@example.com')
    const sessionRes = await createSession(agent, csrfToken, {
      kind: 'campaign-content',
      campaignId,
    })

    const sessionId = sessionRes.body.id as string
    expect(sessionRes.body.scope).toEqual({ kind: 'campaign-content', campaignId })

    for (const format of ['jpeg', 'png', 'webp', 'gif'] as const) {
      const buffer = await createTestImageBuffer(format)
      const uploadRes = await uploadToSession(
        agent,
        csrfToken,
        sessionId,
        buffer,
        `sample.${format === 'jpeg' ? 'jpg' : format}`,
      ).expect(201)

      expect(uploadRes.body.sessionId).toBe(sessionId)
      expect(uploadRes.body.asset.mimeType).toMatch(/^image\//)
      expect(uploadRes.body.asset.orientedWidth).toBeGreaterThan(0)
      expect(uploadRes.body.asset.lifecycle).toBe('ready')
    }

    const firstAssetId = (
      await uploadToSession(agent, csrfToken, sessionId, MINIMAL_PNG_BUFFER, 'tiny.png')
    ).body.asset.id as string

    const metadataRes = await agent.get(`/api/media/assets/${firstAssetId}`).expect(200)
    expect(metadataRes.body.id).toBe(firstAssetId)
    expect(metadataRes.headers['cache-control']).toContain('private')
  })

  it('replays idempotent uploads and rejects conflicting reuse of the same key', async () => {
    await clearTestDb()

    const { agent, csrfToken, userId } = await authedOwnerCampaign('media-idem@example.com')
    const sessionRes = await createSession(agent, csrfToken, { kind: 'user-pc', userId })
    const sessionId = sessionRes.body.id as string

    const first = await uploadToSession(
      agent,
      csrfToken,
      sessionId,
      MINIMAL_PNG_BUFFER,
      'idem.png',
      'upload-key-1',
    ).expect(201)

    const replay = await uploadToSession(
      agent,
      csrfToken,
      sessionId,
      MINIMAL_PNG_BUFFER,
      'idem.png',
      'upload-key-1',
    ).expect(201)

    expect(replay.body.asset.id).toBe(first.body.asset.id)

    const conflict = await uploadToSession(
      agent,
      csrfToken,
      sessionId,
      await createTestImageBuffer('jpeg'),
      'other.jpg',
      'upload-key-1',
    ).expect(409)

    expect(conflict.body.error.code).toBe('conflict')
  })

  it('deduplicates identical bytes within the same scope', async () => {
    await clearTestDb()

    const { agent, csrfToken, campaignId } = await authedOwnerCampaign('media-dedupe@example.com')
    const sessionOne = (
      await createSession(agent, csrfToken, {
        kind: 'campaign-npc',
        campaignId,
      })
    ).body.id as string
    const sessionTwo = (
      await createSession(agent, csrfToken, {
        kind: 'campaign-npc',
        campaignId,
      })
    ).body.id as string

    const first = await uploadToSession(
      agent,
      csrfToken,
      sessionOne,
      MINIMAL_PNG_BUFFER,
      'a.png',
    ).expect(201)
    const second = await uploadToSession(
      agent,
      csrfToken,
      sessionTwo,
      MINIMAL_PNG_BUFFER,
      'b.png',
    ).expect(201)

    expect(second.body.asset.id).toBe(first.body.asset.id)
  })

  it('rejects unauthorized scopes, corrupt files, and svg uploads', async () => {
    await clearTestDb()

    const owner = await authedOwnerCampaign('media-auth@example.com')
    const outsider = await registerAndLoginTestUser(getApp(), {
      email: 'media-outsider@example.com',
      password: 'supersecret',
      displayName: 'Outsider',
    })

    await outsider.agent
      .post('/api/media/sessions')
      .set(CSRF_HEADER, outsider.csrfToken)
      .send({ scope: { kind: 'campaign-content', campaignId: owner.campaignId } })
      .expect(403)

    const sessionRes = await createSession(owner.agent, owner.csrfToken, {
      kind: 'campaign-content',
      campaignId: owner.campaignId,
    })
    const sessionId = sessionRes.body.id as string

    await uploadToSession(
      owner.agent,
      owner.csrfToken,
      sessionId,
      CORRUPT_IMAGE_BUFFER,
      'bad.bin',
    ).expect(400)

    await uploadToSession(owner.agent, owner.csrfToken, sessionId, SVG_BUFFER, 'icon.svg').expect(
      400,
    )

    const uploadRes = await uploadToSession(
      owner.agent,
      owner.csrfToken,
      sessionId,
      MINIMAL_PNG_BUFFER,
      'secure.png',
    ).expect(201)
    const assetId = uploadRes.body.asset.id as string

    await outsider.agent.get(`/api/media/assets/${assetId}`).expect(403)
    await request(getApp()).get(`/api/media/assets/${assetId}`).expect(401)

    await request(getApp()).get('/api/uploads/not-a-valid-key').expect(400)
    await request(getApp()).get('/api/uploads/00000000-0000-4000-8000-000000000001.png').expect(404)
  })

  it('forbids uploading to another user pc scope', async () => {
    await clearTestDb()

    const owner = await authedOwnerCampaign('media-pc-owner@example.com')
    const other = await registerAndLoginTestUser(getApp(), {
      email: 'media-pc-other@example.com',
      password: 'supersecret',
      displayName: 'Other User',
    })

    await owner.agent
      .post('/api/media/sessions')
      .set(CSRF_HEADER, owner.csrfToken)
      .send({ scope: { kind: 'user-pc', userId: other.userId } })
      .expect(403)
  })

  it('serves authorized renditions with private caching and rejects outsiders', async () => {
    await clearTestDb()

    const owner = await authedOwnerCampaign('media-rendition-owner@example.com')
    const outsider = await registerAndLoginTestUser(getApp(), {
      email: 'media-rendition-outsider@example.com',
      password: 'supersecret',
      displayName: 'Outsider',
    })

    const sessionRes = await createSession(owner.agent, owner.csrfToken, {
      kind: 'campaign-content',
      campaignId: owner.campaignId,
    })
    const sessionId = sessionRes.body.id as string
    const buffer = await createTestImageBuffer('png', 200)
    const uploadRes = await uploadToSession(
      owner.agent,
      owner.csrfToken,
      sessionId,
      buffer,
      'art.png',
    ).expect(201)
    const assetId = uploadRes.body.asset.id as string

    const renditionRes = await owner.agent
      .get(`/api/media/assets/${assetId}/renditions/compact-identity`)
      .expect(200)

    expect(renditionRes.headers['content-type']).toContain('image/webp')
    expect(renditionRes.headers['cache-control']).toContain('private')
    expect(renditionRes.body.length).toBeGreaterThan(0)

    await outsider.agent.get(`/api/media/assets/${assetId}/renditions/compact-identity`).expect(403)
  })

  it('lets campaign members read campaign-identity renditions but not upload', async () => {
    await clearTestDb()

    const owner = await authedOwnerCampaign('media-identity-owner@example.com')
    const player = await registerCampaignMember(getApp(), {
      campaignId: owner.campaignId,
      email: 'media-identity-player@example.com',
      campaignRole: 'pc',
    })

    const sessionRes = await createSession(owner.agent, owner.csrfToken, {
      kind: 'campaign-identity',
      campaignId: owner.campaignId,
    })
    const sessionId = sessionRes.body.id as string
    const buffer = await createTestImageBuffer('png', 200)
    const uploadRes = await uploadToSession(
      owner.agent,
      owner.csrfToken,
      sessionId,
      buffer,
      'banner.png',
    ).expect(201)
    const assetId = uploadRes.body.asset.id as string

    await player.agent.get(`/api/media/assets/${assetId}/renditions/banner`).expect(200)
    await player.agent.get(`/api/media/assets/${assetId}`).expect(200)

    await player.agent
      .post('/api/media/sessions')
      .set(CSRF_HEADER, player.csrfToken)
      .send({ scope: { kind: 'campaign-identity', campaignId: owner.campaignId } })
      .expect(403)
  })
})
