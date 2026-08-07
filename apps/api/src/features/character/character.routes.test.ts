import request, { type Agent } from 'supertest'
import { describe, expect, it } from 'vitest'

import { CSRF_HEADER } from '../../lib/cookies'
import { registerAndLoginTestUser } from '../../test/auth-agent'
import { minimalStandalonePcInput } from '../../test/fixtures/characters'
import { useIntegrationApp } from '../../test/setup/integration-app'

const getApp = useIntegrationApp()

async function registerAndLogin(
  email = 'dm@example.com',
): Promise<{ agent: Agent; csrfToken: string }> {
  return registerAndLoginTestUser(getApp(), {
    email,
    password: 'supersecret',
    displayName: 'Game Master',
  })
}

async function createCharacter(
  agent: Agent,
  csrfToken: string,
  body: Record<string, unknown> = minimalStandalonePcInput,
): Promise<string> {
  const res = await agent.post('/api/characters').set(CSRF_HEADER, csrfToken).send(body).expect(201)

  return res.body.character.id as string
}

describe('character routes', () => {
  it('creates a standalone PC for the authenticated user', async () => {
    const { agent, csrfToken } = await registerAndLogin()
    const characterId = await createCharacter(agent, csrfToken, {
      ...minimalStandalonePcInput,
      connections: { organizations: [{ organizationId: 'organization-1' }], locations: [] },
    })

    const res = await agent.get(`/api/characters/${characterId}`).expect(200)

    expect(res.body.character).toMatchObject({
      id: characterId,
      characterType: 'pc',
      name: 'Verna',
      rulesetId: 'srd-cc-5.2.1',
      connections: { organizations: [{ organizationId: 'organization-1' }], locations: [] },
    })
    expect(res.body.character.userId).toBeTruthy()
    expect(res.body.character.createdAt).toMatch(/^\d{4}-/)
    expect(res.body.character.vital).toEqual({ status: 'alive' })
  })

  it('lists only the session user characters', async () => {
    const owner = await registerAndLogin('owner@example.com')
    const other = await registerAndLogin('other@example.com')

    const ownedId = await createCharacter(owner.agent, owner.csrfToken)
    await createCharacter(other.agent, other.csrfToken, {
      ...minimalStandalonePcInput,
      name: 'Someone Else',
    })

    const res = await owner.agent.get('/api/characters').expect(200)

    expect(res.body.characters).toHaveLength(1)
    expect(res.body.characters[0]?.id).toBe(ownedId)
    expect(res.body.characters[0]?.name).toBe('Verna')
  })

  it('returns 404 when fetching another user character', async () => {
    const owner = await registerAndLogin('owner2@example.com')
    const other = await registerAndLogin('other2@example.com')
    const otherCharacterId = await createCharacter(other.agent, other.csrfToken)

    await owner.agent.get(`/api/characters/${otherCharacterId}`).expect(404)
  })

  it('rejects client-supplied userId', async () => {
    const { agent, csrfToken } = await registerAndLogin('userid@example.com')

    const res = await agent
      .post('/api/characters')
      .set(CSRF_HEADER, csrfToken)
      .send({ ...minimalStandalonePcInput, userId: 'client-user' })
      .expect(400)

    expect(res.body.error.message).toContain('userId')
  })

  it('rejects non-pc characterType', async () => {
    const { agent, csrfToken } = await registerAndLogin('npc@example.com')

    const res = await agent
      .post('/api/characters')
      .set(CSRF_HEADER, csrfToken)
      .send({ ...minimalStandalonePcInput, characterType: 'npc', campaignId: 'camp_1' })
      .expect(400)

    expect(res.body.error.code).toBe('bad_request')
  })

  it('rejects non-null campaignId', async () => {
    const { agent, csrfToken } = await registerAndLogin('campaign@example.com')

    const res = await agent
      .post('/api/characters')
      .set(CSRF_HEADER, csrfToken)
      .send({ ...minimalStandalonePcInput, campaignId: '000000000000000000000000' })
      .expect(400)

    expect(res.body.error.message).toContain('campaign')
  })

  it('rejects unsupported rulesetId', async () => {
    const { agent, csrfToken } = await registerAndLogin('ruleset@example.com')

    const res = await agent
      .post('/api/characters')
      .set(CSRF_HEADER, csrfToken)
      .send({ ...minimalStandalonePcInput, rulesetId: 'unsupported-ruleset' })
      .expect(400)

    expect(res.body.error.message).toContain('rulesetId')
  })

  it('requires authentication for reads', async () => {
    await request(getApp()).get('/api/characters').expect(401)
    await request(getApp()).get('/api/characters/000000000000000000000000').expect(401)
  })

  it('deletes an owned character and returns 404 afterward', async () => {
    const { agent, csrfToken } = await registerAndLogin('delete@example.com')
    const characterId = await createCharacter(agent, csrfToken)

    await agent.delete(`/api/characters/${characterId}`).set(CSRF_HEADER, csrfToken).expect(204)
    await agent.get(`/api/characters/${characterId}`).expect(404)
  })

  it('returns 404 when deleting another user character', async () => {
    const owner = await registerAndLogin('delete-owner@example.com')
    const other = await registerAndLogin('delete-other@example.com')
    const ownedId = await createCharacter(owner.agent, owner.csrfToken)

    await other.agent
      .delete(`/api/characters/${ownedId}`)
      .set(CSRF_HEADER, other.csrfToken)
      .expect(404)
  })

  it('requires authentication for delete', async () => {
    await request(getApp()).delete('/api/characters/000000000000000000000000').expect(403)
  })

  it('does not expose a public PC lifecycle PATCH route', async () => {
    const { agent, csrfToken } = await registerAndLogin('patch@example.com')
    const characterId = await createCharacter(agent, csrfToken)

    await agent
      .patch(`/api/characters/${characterId}`)
      .set(CSRF_HEADER, csrfToken)
      .send({ roster: { status: 'inactive' } })
      .expect(404)
  })
})
