import type { Agent } from 'supertest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { describe, expect, it, vi, afterEach } from 'vitest'

import { CSRF_HEADER } from '../../lib/cookies'
import { registerAndLoginTestUser } from '../../test/auth-agent'
import { useIntegrationApp } from '../../test/setup/integration-app'

const getApp = useIntegrationApp()

const fixturePath = join(
  dirname(fileURLToPath(import.meta.url)),
  '../../../../../packages/contracts/src/character-import/dnd-beyond/fixtures/character-133058471.json',
)
const fixtureJson = readFileSync(fixturePath, 'utf8')

async function login(): Promise<{ agent: Agent; csrfToken: string }> {
  return registerAndLoginTestUser(getApp(), {
    email: 'import@example.com',
    password: 'supersecret',
    displayName: 'Importer',
  })
}

describe('character import routes', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('previews a public D&D Beyond character for the authenticated user', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(fixtureJson, {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      ),
    )

    const { agent, csrfToken } = await login()
    const res = await agent
      .post('/api/character-import/dnd-beyond/preview')
      .set(CSRF_HEADER, csrfToken)
      .send({ input: '133058471' })
      .expect(200)

    expect(res.body.result.extraction.name.value).toBe('Presto')
  })

  it('rejects malformed input', async () => {
    const { agent, csrfToken } = await login()
    const res = await agent
      .post('/api/character-import/dnd-beyond/preview')
      .set(CSRF_HEADER, csrfToken)
      .send({ input: 'https://example.com/not-ddb' })
      .expect(400)

    expect(res.body.error.code).toBe('bad_request')
  })
})
