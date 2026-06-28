import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import request from 'supertest'
import type { Express } from 'express'

import { createApp } from '../../app'
import { clearTestDb, startTestDb, stopTestDb } from '../../test/db'

let app: Express

beforeAll(async () => {
  await startTestDb()
  app = createApp()
})

afterEach(async () => {
  await clearTestDb()
})

afterAll(async () => {
  await stopTestDb()
})

const baseTicketInput = {
  title: 'Add patch write support',
  type: 'feature',
  priority: 'high',
  size: 'm',
  createdBy: 'user',
}

describe('bench routes', () => {
  it('creates a ticket without auth or CSRF', async () => {
    const res = await request(app).post('/api/bench/tickets').send(baseTicketInput).expect(201)

    expect(res.body.ticket.key).toBe('BENCH-001')
    expect(res.body.ticket.title).toBe('Add patch write support')
  })

  it('reads a ticket by key and patches status', async () => {
    await request(app).post('/api/bench/tickets').send(baseTicketInput).expect(201)

    const byKey = await request(app).get('/api/bench/tickets/by-key/BENCH-001').expect(200)
    expect(byKey.body.ticket.key).toBe('BENCH-001')

    const patched = await request(app)
      .patch(`/api/bench/tickets/${byKey.body.ticket.id}`)
      .send({ status: 'up_next' })
      .expect(200)

    expect(patched.body.ticket.status).toBe('up_next')
    expect(patched.body.ticket.key).toBe('BENCH-001')
  })

  it('returns 404 for unknown ticket ids', async () => {
    await request(app).get('/api/bench/tickets/507f1f77bcf86cd799439011').expect(404)
  })

  it('creates and lists epics', async () => {
    await request(app).post('/api/bench/epics').send({ title: 'Rules Configuration' }).expect(201)

    const list = await request(app).get('/api/bench/epics').expect(200)
    expect(list.body.epics).toHaveLength(1)
    expect(list.body.epics[0].title).toBe('Rules Configuration')
  })
})
