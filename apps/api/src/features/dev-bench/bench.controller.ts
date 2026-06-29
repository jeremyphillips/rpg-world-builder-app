import type { Request, Response } from 'express'

import type {
  CreateEpicInput,
  CreateTicketInput,
  UpdateEpicInput,
  UpdateTicketInput,
} from '@rpg/contracts/dev-bench'

import { HttpError } from '../../lib/http-error'
import { listEpicsQuerySchema, listTicketsQuerySchema } from './bench-query'
import * as benchService from './bench.service'

function parseListTicketsQuery(req: Request) {
  const parsed = listTicketsQuerySchema.safeParse(req.query)
  if (!parsed.success) {
    throw HttpError.badRequest('Validation failed', {
      issues: parsed.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    })
  }

  return parsed.data
}

function parseListEpicsQuery(req: Request) {
  const parsed = listEpicsQuerySchema.safeParse(req.query)
  if (!parsed.success) {
    throw HttpError.badRequest('Validation failed', {
      issues: parsed.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    })
  }

  return parsed.data
}

export async function listTickets(req: Request, res: Response): Promise<void> {
  const tickets = await benchService.listTickets(parseListTicketsQuery(req))
  res.status(200).json({ tickets })
}

export async function createTicket(req: Request, res: Response): Promise<void> {
  const ticket = await benchService.createTicket(req.body as CreateTicketInput)
  res.status(201).json({ ticket })
}

export async function getTicketById(req: Request, res: Response): Promise<void> {
  const { ticketId } = req.params as { ticketId: string }
  const ticket = await benchService.getTicketById(ticketId)
  if (!ticket) {
    throw new HttpError(404, 'not_found', 'Ticket not found.')
  }
  res.status(200).json({ ticket })
}

export async function getTicketByKey(req: Request, res: Response): Promise<void> {
  const { key } = req.params as { key: string }
  const ticket = await benchService.getTicketByKey(key)
  if (!ticket) {
    throw new HttpError(404, 'not_found', 'Ticket not found.')
  }
  res.status(200).json({ ticket })
}

export async function updateTicket(req: Request, res: Response): Promise<void> {
  const { ticketId } = req.params as { ticketId: string }
  const ticket = await benchService.updateTicket(ticketId, req.body as UpdateTicketInput)
  if (!ticket) {
    throw new HttpError(404, 'not_found', 'Ticket not found.')
  }
  res.status(200).json({ ticket })
}

export async function deleteTicket(req: Request, res: Response): Promise<void> {
  const { ticketId } = req.params as { ticketId: string }
  const deleted = await benchService.deleteTicket(ticketId)
  if (!deleted) {
    throw new HttpError(404, 'not_found', 'Ticket not found.')
  }
  res.status(204).send()
}

export async function listEpics(req: Request, res: Response): Promise<void> {
  const epics = await benchService.listEpics(parseListEpicsQuery(req))
  res.status(200).json({ epics })
}

export async function createEpic(req: Request, res: Response): Promise<void> {
  const epic = await benchService.createEpic(req.body as CreateEpicInput)
  res.status(201).json({ epic })
}

export async function getEpicById(req: Request, res: Response): Promise<void> {
  const { epicId } = req.params as { epicId: string }
  const epic = await benchService.getEpicById(epicId)
  if (!epic) {
    throw new HttpError(404, 'not_found', 'Epic not found.')
  }
  res.status(200).json({ epic })
}

export async function updateEpic(req: Request, res: Response): Promise<void> {
  const { epicId } = req.params as { epicId: string }
  const epic = await benchService.updateEpic(epicId, req.body as UpdateEpicInput)
  if (!epic) {
    throw new HttpError(404, 'not_found', 'Epic not found.')
  }
  res.status(200).json({ epic })
}

export async function deleteEpic(req: Request, res: Response): Promise<void> {
  const { epicId } = req.params as { epicId: string }
  const deleted = await benchService.deleteEpic(epicId)
  if (!deleted) {
    throw new HttpError(404, 'not_found', 'Epic not found.')
  }
  res.status(204).send()
}
