import request from 'supertest'
import { describe, expect, it } from 'vitest'

import { registerAndLoginTestUser } from '../../test/auth-agent'
import { useIntegrationApp } from '../../test/setup/integration-app'

const getApp = useIntegrationApp()

describe('ruleset routes', () => {
  it('returns system classes for a supported ruleset', async () => {
    const { agent } = await registerAndLoginTestUser(getApp())

    const res = await agent.get('/api/rulesets/srd-cc-5.2.1/content/classes').expect(200)

    expect(Array.isArray(res.body.classes)).toBe(true)
    expect(res.body.classes.length).toBeGreaterThan(0)
    expect(
      res.body.classes.every((item: { campaignId: unknown }) => item.campaignId === null),
    ).toBe(true)
  })

  it('returns resolved character creation rules for an unpatched ruleset', async () => {
    const { agent } = await registerAndLoginTestUser(getApp())

    const res = await agent.get('/api/rulesets/srd-cc-5.2.1/character-creation-rules').expect(200)

    expect(res.body.patch.characterCreation.startingLevel).toBe(1)
    expect(res.body.patch.characterCreation.species.creatureTypePolicy).toEqual({
      mode: 'only',
      ids: ['humanoid'],
    })
    expect(res.body.patch.mechanics).toBeDefined()
  })

  it('returns 404 for unsupported ruleset ids', async () => {
    const { agent } = await registerAndLoginTestUser(getApp())

    await agent.get('/api/rulesets/unsupported-ruleset/content/classes').expect(404)
    await agent.get('/api/rulesets/unsupported-ruleset/character-creation-rules').expect(404)
  })

  it('returns 404 for unknown content types', async () => {
    const { agent } = await registerAndLoginTestUser(getApp())

    await agent.get('/api/rulesets/srd-cc-5.2.1/content/not-a-type').expect(404)
  })

  it('requires authentication', async () => {
    await request(getApp()).get('/api/rulesets/srd-cc-5.2.1/content/classes').expect(401)
    await request(getApp()).get('/api/rulesets/srd-cc-5.2.1/character-creation-rules').expect(401)
  })
})
