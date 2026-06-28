import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import {
  ticketSchema,
  createEpicInputSchema,
  createTicketInputSchema,
} from '@rpg/contracts/dev-bench'

import { clearTestDb, startTestDb, stopTestDb } from '../../test/db'
import {
  createEpic,
  createTicket,
  deleteEpic,
  getEpicById,
  getTicketById,
  listEpics,
  listTickets,
  updateEpic,
  updateTicket,
} from './bench.service'

beforeAll(async () => {
  await startTestDb()
})

afterAll(async () => {
  await stopTestDb()
})

beforeEach(async () => {
  await clearTestDb()
})

const baseTicketInput = createTicketInputSchema.parse({
  title: 'Capture gap',
  type: 'feature',
  priority: 'medium',
  size: 'm',
  createdBy: 'user',
})

describe('createTicket', () => {
  it('assigns sequential keys', async () => {
    const first = await createTicket(baseTicketInput)
    const second = await createTicket({ ...baseTicketInput, title: 'Second ticket' })

    expect(first.key).toBe('BENCH-001')
    expect(second.key).toBe('BENCH-002')
    expect(ticketSchema.parse(first)).toStrictEqual(first)
  })

  it('rejects invalid epic references', async () => {
    await expect(
      createTicket({
        ...baseTicketInput,
        epicId: '507f1f77bcf86cd799439011',
      }),
    ).rejects.toMatchObject({ status: 404, code: 'not_found' })
  })
})

describe('listTickets', () => {
  it('filters by status, epicId, and area', async () => {
    const epic = await createEpic(createEpicInputSchema.parse({ title: 'Rules Configuration' }))
    await createTicket({ ...baseTicketInput, status: 'backlog', area: 'rules', epicId: epic.id })
    await createTicket({
      ...baseTicketInput,
      title: 'Bench item',
      status: 'up_next',
      area: 'api',
    })

    expect(await listTickets({ status: 'backlog' })).toHaveLength(1)
    expect(await listTickets({ epicId: epic.id })).toHaveLength(1)
    expect(await listTickets({ area: 'api' })).toHaveLength(1)
  })
})

describe('updateTicket', () => {
  it('updates status without changing key', async () => {
    const ticket = await createTicket(baseTicketInput)
    const updated = await updateTicket(ticket.id, { status: 'in_progress' })

    expect(updated?.status).toBe('in_progress')
    expect(updated?.key).toBe('BENCH-001')
  })

  it('rejects invalid epic references', async () => {
    const ticket = await createTicket(baseTicketInput)

    await expect(
      updateTicket(ticket.id, { epicId: '507f1f77bcf86cd799439011' }),
    ).rejects.toMatchObject({ status: 404, code: 'not_found' })
  })
})

describe('epic CRUD', () => {
  it('round-trips create, read, update, and delete', async () => {
    const created = await createEpic(
      createEpicInputSchema.parse({ title: 'Character Builder', area: 'character_builder' }),
    )
    expect(await getEpicById(created.id)).toMatchObject({ title: 'Character Builder' })

    const updated = await updateEpic(created.id, { status: 'paused' })
    expect(updated?.status).toBe('paused')
    expect(await listEpics({ status: 'paused' })).toHaveLength(1)

    const ticket = await createTicket({ ...baseTicketInput, epicId: created.id })
    expect((await getTicketById(ticket.id))?.epicId).toBe(created.id)

    expect(await deleteEpic(created.id)).toBe(true)
    expect(await getEpicById(created.id)).toBeNull()
    expect((await getTicketById(ticket.id))?.epicId).toBeNull()
  })
})
