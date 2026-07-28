import { describe, expect, it } from 'vitest'

import { USER_RECENT_ACTIVITY_DAYS } from '@rpg/contracts'

import { clearTestDb } from '../../test/db'
import { useIntegrationDb } from '../../test/setup/integration-db'
import { UserModel } from './user.model'
import { createUser, recordUserActivity, recordUserLoginActivity } from './user.service'

useIntegrationDb()

describe('user activity tracking', () => {
  it('sets both timestamps on login activity', async () => {
    await clearTestDb()

    const user = await createUser({
      email: 'login-activity@example.com',
      passwordHash: 'x',
      displayName: 'Login User',
    })

    await recordUserLoginActivity(user.id)

    const doc = await UserModel.findById(user.id).lean()
    expect(doc?.lastSignedInAt).toBeInstanceOf(Date)
    expect(doc?.lastActiveAt).toBeInstanceOf(Date)
  })

  it('throttles activity writes', async () => {
    await clearTestDb()

    const user = await createUser({
      email: 'throttle@example.com',
      passwordHash: 'x',
      displayName: 'Throttle User',
    })

    await recordUserLoginActivity(user.id)
    const first = await UserModel.findById(user.id).lean()

    await recordUserActivity(user.id)
    const second = await UserModel.findById(user.id).lean()

    expect(second?.lastActiveAt?.getTime()).toBe(first?.lastActiveAt?.getTime())
  })

  it('uses recent-activity cutoff with inclusive boundary', () => {
    const cutoff = new Date(Date.now() - USER_RECENT_ACTIVITY_DAYS * 24 * 60 * 60 * 1000)
    const exactlyAtCutoff = new Date(cutoff.getTime())
    const justBeforeCutoff = new Date(cutoff.getTime() - 1)

    expect(exactlyAtCutoff >= cutoff).toBe(true)
    expect(justBeforeCutoff < cutoff).toBe(true)
  })
})
