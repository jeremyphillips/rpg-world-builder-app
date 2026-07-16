import { describe, expect, it } from 'vitest'

import {
  ticketSchema,
  createEpicInputSchema,
  createTicketInputSchema,
} from '@rpg/contracts/dev-bench'

import { useIntegrationDb } from '../../test/setup/integration-db'
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

useIntegrationDb()

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

  it('filters by epicName case-insensitively', async () => {
    const epic = await createEpic(
      createEpicInputSchema.parse({ title: 'Character Builder', area: 'character_builder' }),
    )
    await createTicket({ ...baseTicketInput, epicId: epic.id, status: 'backlog' })
    await createTicket({ ...baseTicketInput, title: 'Other epic work', status: 'backlog' })

    const tickets = await listTickets({ epicName: '  character builder  ' })
    expect(tickets).toHaveLength(1)
    expect(tickets[0]?.epicId).toBe(epic.id)
  })

  it('returns 404 when epicName has no match', async () => {
    await expect(listTickets({ epicName: 'Missing Epic' })).rejects.toMatchObject({
      status: 404,
      code: 'not_found',
    })
  })

  it('returns 400 when epicName is ambiguous', async () => {
    await createEpic(createEpicInputSchema.parse({ title: 'Rules Configuration' }))
    await createEpic(createEpicInputSchema.parse({ title: 'rules configuration' }))

    await expect(listTickets({ epicName: 'Rules Configuration' })).rejects.toMatchObject({
      status: 400,
      code: 'bad_request',
    })
  })

  it('prefers epicId over epicName when both are set', async () => {
    const characterEpic = await createEpic(
      createEpicInputSchema.parse({ title: 'Character Builder', area: 'character_builder' }),
    )
    const rulesEpic = await createEpic(
      createEpicInputSchema.parse({ title: 'Rules Configuration', area: 'rules' }),
    )
    await createTicket({ ...baseTicketInput, epicId: characterEpic.id, status: 'backlog' })
    await createTicket({
      ...baseTicketInput,
      title: 'Rules work',
      epicId: rulesEpic.id,
      status: 'backlog',
    })

    const tickets = await listTickets({
      epicId: characterEpic.id,
      epicName: 'Rules Configuration',
    })
    expect(tickets).toHaveLength(1)
    expect(tickets[0]?.epicId).toBe(characterEpic.id)
  })

  it('filters bucket active to incomplete work', async () => {
    await createTicket({ ...baseTicketInput, status: 'backlog' })
    await createTicket({ ...baseTicketInput, title: 'On desk', status: 'up_next' })
    await createTicket({ ...baseTicketInput, title: 'Blocked item', status: 'blocked' })
    await createTicket({ ...baseTicketInput, title: 'Finished', status: 'done' })
    await createTicket({ ...baseTicketInput, title: 'Declined', status: 'wont_do' })

    const activeTickets = await listTickets({ bucket: 'active' })
    expect(activeTickets.map((ticket) => ticket.title).sort()).toEqual([
      'Blocked item',
      'Capture gap',
      'On desk',
    ])
  })

  it('filters bucket done to completed tickets only', async () => {
    await createTicket({ ...baseTicketInput, status: 'backlog' })
    await createTicket({ ...baseTicketInput, title: 'Finished', status: 'done' })

    const doneTickets = await listTickets({ bucket: 'done' })
    expect(doneTickets).toHaveLength(1)
    expect(doneTickets[0]?.title).toBe('Finished')
  })

  it('combines epicName and bucket active', async () => {
    const epic = await createEpic(
      createEpicInputSchema.parse({ title: 'Character Builder', area: 'character_builder' }),
    )
    await createTicket({ ...baseTicketInput, epicId: epic.id, status: 'backlog' })
    await createTicket({
      ...baseTicketInput,
      title: 'Done in epic',
      epicId: epic.id,
      status: 'done',
    })
    await createTicket({ ...baseTicketInput, title: 'Other open', status: 'backlog' })

    const tickets = await listTickets({ epicName: 'Character Builder', bucket: 'active' })
    expect(tickets).toHaveLength(1)
    expect(tickets[0]?.title).toBe('Capture gap')
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

  it('rejects the same id in blockedByTicketIds and relatedTicketIds', async () => {
    const blocker = await createTicket({ ...baseTicketInput, title: 'Blocker' })
    const ticket = await createTicket({ ...baseTicketInput, title: 'Blocked work' })

    await expect(
      updateTicket(ticket.id, {
        blockedByTicketIds: [blocker.id],
        relatedTicketIds: [blocker.id],
      }),
    ).rejects.toMatchObject({
      status: 400,
      code: 'invalid_reference',
      message: 'A ticket id cannot appear in both blockedByTicketIds and relatedTicketIds.',
    })
  })
})

describe('createTicket link validation', () => {
  it('rejects the same id in blockedByTicketIds and relatedTicketIds', async () => {
    const blocker = await createTicket({ ...baseTicketInput, title: 'Blocker' })

    await expect(
      createTicket({
        ...baseTicketInput,
        title: 'Linked work',
        blockedByTicketIds: [blocker.id],
        relatedTicketIds: [blocker.id],
      }),
    ).rejects.toMatchObject({
      status: 400,
      code: 'invalid_reference',
      message: 'A ticket id cannot appear in both blockedByTicketIds and relatedTicketIds.',
    })
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
