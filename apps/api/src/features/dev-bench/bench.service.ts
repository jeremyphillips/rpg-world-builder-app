import { isValidObjectId } from 'mongoose'

import { formatTicketKey } from '@rpg/contracts/dev-bench'
import type {
  CreateEpicInput,
  CreateTicketInput,
  Epic,
  Ticket,
  UpdateEpicInput,
  UpdateTicketInput,
} from '@rpg/contracts/dev-bench'

import { HttpError } from '../../lib/http-error'
import type { ListEpicsQuery, ListTicketsQuery } from './bench-query'
import { DevBenchEpicModel, type DevBenchEpicSchemaType } from './epic.model'
import { DevBenchTicketKeyCounterModel, TICKET_KEY_COUNTER_ID } from './ticket-key-counter.model'
import { DevBenchTicketModel, type DevBenchTicketSchemaType } from './ticket.model'
import { toEpic } from './to-epic'
import { toTicket } from './to-ticket'
import {
  trimCreateEpicInput,
  trimCreateTicketInput,
  trimUpdateEpicInput,
  trimUpdateTicketInput,
} from './trim-dev-bench-input'

type TicketRecord = DevBenchTicketSchemaType & {
  _id: unknown
  createdAt: Date
  updatedAt: Date
}

type EpicRecord = DevBenchEpicSchemaType & {
  _id: unknown
  createdAt: Date
  updatedAt: Date
}

async function nextTicketKey(): Promise<string> {
  const doc = await DevBenchTicketKeyCounterModel.findOneAndUpdate(
    { _id: TICKET_KEY_COUNTER_ID },
    { $inc: { seq: 1 } },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
      setOnInsert: { _id: TICKET_KEY_COUNTER_ID },
    },
  ).lean<{ seq: number } | null>()

  if (!doc) {
    throw new HttpError(500, 'internal_error', 'Failed to assign ticket key.')
  }

  return formatTicketKey(doc.seq)
}

function assertNoDuplicateIds(ids: string[], field: string): void {
  if (new Set(ids).size !== ids.length) {
    throw new HttpError(400, 'invalid_reference', `Duplicate ids in ${field}.`)
  }
}

async function assertTicketIdsExist(ids: string[]): Promise<void> {
  if (ids.length === 0) {
    return
  }

  const invalidIds = ids.filter((id) => !isValidObjectId(id))
  if (invalidIds.length > 0) {
    throw new HttpError(400, 'invalid_reference', 'One or more linked tickets are invalid.')
  }

  const count = await DevBenchTicketModel.countDocuments({ _id: { $in: ids } })
  if (count !== ids.length) {
    throw new HttpError(400, 'invalid_reference', 'One or more linked tickets do not exist.')
  }
}

async function assertEpicExists(epicId: string | null | undefined): Promise<void> {
  if (epicId === undefined || epicId === null) {
    return
  }

  if (!isValidObjectId(epicId)) {
    throw new HttpError(400, 'invalid_reference', 'Epic reference is invalid.')
  }

  const exists = await DevBenchEpicModel.exists({ _id: epicId })
  if (!exists) {
    throw new HttpError(404, 'not_found', 'Epic not found.')
  }
}

async function validateTicketLinks(
  ticketId: string | undefined,
  blockedByTicketIds: string[],
  relatedTicketIds: string[],
): Promise<void> {
  assertNoDuplicateIds(blockedByTicketIds, 'blockedByTicketIds')
  assertNoDuplicateIds(relatedTicketIds, 'relatedTicketIds')

  if (ticketId) {
    if (blockedByTicketIds.includes(ticketId) || relatedTicketIds.includes(ticketId)) {
      throw new HttpError(400, 'invalid_reference', 'A ticket cannot link to itself.')
    }
  }

  await assertTicketIdsExist([...blockedByTicketIds, ...relatedTicketIds])
}

function buildTicketListFilter(query: ListTicketsQuery): Record<string, unknown> {
  const filter: Record<string, unknown> = {}

  if (query.status !== undefined) filter.status = query.status
  if (query.epicId !== undefined) filter.epicId = query.epicId
  if (query.area !== undefined) filter.area = query.area
  if (query.type !== undefined) filter.type = query.type
  if (query.priority !== undefined) filter.priority = query.priority
  if (query.size !== undefined) filter.size = query.size
  if (query.createdBy !== undefined) filter.createdBy = query.createdBy

  return filter
}

function buildEpicListFilter(query: ListEpicsQuery): Record<string, unknown> {
  const filter: Record<string, unknown> = {}

  if (query.status !== undefined) filter.status = query.status
  if (query.area !== undefined) filter.area = query.area

  return filter
}

export async function listTickets(query: ListTicketsQuery): Promise<Ticket[]> {
  const docs = await DevBenchTicketModel.find(buildTicketListFilter(query))
    .sort({ createdAt: -1 })
    .lean<TicketRecord[]>()

  return docs.map(toTicket)
}

export async function createTicket(input: CreateTicketInput): Promise<Ticket> {
  const trimmed = trimCreateTicketInput(input)

  await assertEpicExists(trimmed.epicId)
  await validateTicketLinks(undefined, trimmed.blockedByTicketIds, trimmed.relatedTicketIds)

  const key = await nextTicketKey()
  const doc = await DevBenchTicketModel.create({
    ...trimmed,
    key,
  })

  return toTicket(doc.toObject() as TicketRecord)
}

export async function getTicketById(ticketId: string): Promise<Ticket | null> {
  if (!isValidObjectId(ticketId)) {
    return null
  }

  const doc = await DevBenchTicketModel.findById(ticketId).lean<TicketRecord | null>()
  return doc ? toTicket(doc) : null
}

export async function getTicketByKey(key: string): Promise<Ticket | null> {
  const doc = await DevBenchTicketModel.findOne({ key }).lean<TicketRecord | null>()
  return doc ? toTicket(doc) : null
}

export async function updateTicket(
  ticketId: string,
  input: UpdateTicketInput,
): Promise<Ticket | null> {
  if (!isValidObjectId(ticketId)) {
    return null
  }

  const existing = await DevBenchTicketModel.findById(ticketId).lean<TicketRecord | null>()
  if (!existing) {
    return null
  }

  const trimmed = trimUpdateTicketInput(input)

  if (trimmed.epicId !== undefined) {
    await assertEpicExists(trimmed.epicId)
  }

  const blockedByTicketIds = trimmed.blockedByTicketIds ?? existing.blockedByTicketIds ?? []
  const relatedTicketIds = trimmed.relatedTicketIds ?? existing.relatedTicketIds ?? []

  if (trimmed.blockedByTicketIds !== undefined || trimmed.relatedTicketIds !== undefined) {
    await validateTicketLinks(ticketId, blockedByTicketIds, relatedTicketIds)
  }

  const doc = await DevBenchTicketModel.findByIdAndUpdate(
    ticketId,
    { $set: trimmed },
    { new: true },
  ).lean<TicketRecord | null>()

  return doc ? toTicket(doc) : null
}

export async function deleteTicket(ticketId: string): Promise<boolean> {
  if (!isValidObjectId(ticketId)) {
    return false
  }

  const result = await DevBenchTicketModel.deleteOne({ _id: ticketId })
  return result.deletedCount === 1
}

export async function listEpics(query: ListEpicsQuery): Promise<Epic[]> {
  const docs = await DevBenchEpicModel.find(buildEpicListFilter(query))
    .sort({ createdAt: -1 })
    .lean<EpicRecord[]>()

  return docs.map(toEpic)
}

export async function createEpic(input: CreateEpicInput): Promise<Epic> {
  const trimmed = trimCreateEpicInput(input)
  const doc = await DevBenchEpicModel.create(trimmed)
  return toEpic(doc.toObject() as EpicRecord)
}

export async function getEpicById(epicId: string): Promise<Epic | null> {
  if (!isValidObjectId(epicId)) {
    return null
  }

  const doc = await DevBenchEpicModel.findById(epicId).lean<EpicRecord | null>()
  return doc ? toEpic(doc) : null
}

export async function updateEpic(epicId: string, input: UpdateEpicInput): Promise<Epic | null> {
  if (!isValidObjectId(epicId)) {
    return null
  }

  const trimmed = trimUpdateEpicInput(input)
  const doc = await DevBenchEpicModel.findByIdAndUpdate(
    epicId,
    { $set: trimmed },
    { new: true },
  ).lean<EpicRecord | null>()

  return doc ? toEpic(doc) : null
}

export async function deleteEpic(epicId: string): Promise<boolean> {
  if (!isValidObjectId(epicId)) {
    return false
  }

  await DevBenchTicketModel.updateMany({ epicId }, { $set: { epicId: null } })
  const result = await DevBenchEpicModel.deleteOne({ _id: epicId })
  return result.deletedCount === 1
}
