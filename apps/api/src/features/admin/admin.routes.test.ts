import request from 'supertest'
import { describe, expect, it } from 'vitest'

import { CSRF_HEADER } from '../../lib/cookies'
import { signSessionToken } from '../../lib/jwt'
import { SESSION_COOKIE } from '../../lib/cookies'
import { createTestCampaign, registerAndLoginTestUser } from '../../test/auth-agent'
import { createUser, UserModel } from '../user'
import { clearTestDb } from '../../test/db'
import { useIntegrationDb } from '../../test/setup/integration-db'
import { useIntegrationApp } from '../../test/setup/integration-app'

const getApp = useIntegrationApp()

useIntegrationDb()

function sessionCookie(userId: string, role: Parameters<typeof signSessionToken>[0]['role']) {
  return `${SESSION_COOKIE}=${signSessionToken({ sub: userId, role })}`
}

describe('admin users routes', () => {
  it('lists users for elevated roles', async () => {
    await clearTestDb()

    const admin = await createUser({
      email: 'admin-list@example.com',
      passwordHash: 'x',
      displayName: 'Admin Lister',
      role: 'admin',
    })
    await createUser({
      email: 'user-list@example.com',
      passwordHash: 'x',
      displayName: 'Regular User',
      role: 'user',
    })

    const response = await request(getApp())
      .get('/api/admin/users')
      .set('Cookie', sessionCookie(admin.id, 'admin'))
      .expect(200)

    expect(response.body.users).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ email: 'admin-list@example.com' }),
        expect.objectContaining({ email: 'user-list@example.com' }),
      ]),
    )
    expect(response.body.pagination.total).toBeGreaterThanOrEqual(2)
  })

  it('denies non-elevated users', async () => {
    await clearTestDb()

    const user = await createUser({
      email: 'user-deny@example.com',
      passwordHash: 'x',
      displayName: 'Denied User',
      role: 'user',
    })

    await request(getApp())
      .get('/api/admin/users')
      .set('Cookie', sessionCookie(user.id, 'user'))
      .expect(403)
  })

  it('blocks delete for users who own campaigns', async () => {
    await clearTestDb()

    const { agent: superAgent, csrfToken: superCsrf } = await registerAndLoginTestUser(getApp(), {
      email: 'super-delete@example.com',
      password: 'supersecret',
      displayName: 'Super Admin',
    })
    await UserModel.updateOne({ email: 'super-delete@example.com' }, { role: 'superadmin' })

    const { agent: targetAgent, csrfToken: targetCsrf } = await registerAndLoginTestUser(getApp(), {
      email: 'owner-delete@example.com',
      password: 'supersecret',
      displayName: 'Campaign Owner',
    })

    await createTestCampaign(targetAgent, targetCsrf, 'Owned Campaign')

    const meRes = await targetAgent.get('/api/auth/me').expect(200)
    const targetUserId = meRes.body.user.id as string

    const response = await superAgent
      .delete(`/api/admin/users/${targetUserId}`)
      .set(CSRF_HEADER, superCsrf)
      .expect(409)

    expect(response.body.error.details.blockers).toContain('owns_campaigns')
  })

  it('returns user detail, campaigns, and characters for elevated roles', async () => {
    await clearTestDb()

    const admin = await createUser({
      email: 'admin-detail@example.com',
      passwordHash: 'x',
      displayName: 'Admin Detail',
      role: 'admin',
    })
    const target = await createUser({
      email: 'target-detail@example.com',
      passwordHash: 'x',
      displayName: 'Target User',
      role: 'user',
    })

    const detailRes = await request(getApp())
      .get(`/api/admin/users/${target.id}`)
      .set('Cookie', sessionCookie(admin.id, 'admin'))
      .expect(200)

    expect(detailRes.body.user).toMatchObject({
      id: target.id,
      displayName: 'Target User',
      platformRole: 'user',
    })

    const campaignsRes = await request(getApp())
      .get(`/api/admin/users/${target.id}/campaigns`)
      .set('Cookie', sessionCookie(admin.id, 'admin'))
      .expect(200)

    expect(campaignsRes.body.campaigns).toEqual([])

    const charactersRes = await request(getApp())
      .get(`/api/admin/users/${target.id}/characters`)
      .set('Cookie', sessionCookie(admin.id, 'admin'))
      .expect(200)

    expect(charactersRes.body.characters).toEqual([])
  })
})
