import { Router } from 'express'

import {
  createEpicInputSchema,
  createTicketInputSchema,
  updateEpicInputSchema,
  updateTicketInputSchema,
} from '@rpg/contracts/dev-bench'

import { validate } from '../../middleware/validate'
import * as controller from './bench.controller'

export const benchRouter: Router = Router()

benchRouter.get('/tickets', controller.listTickets)
benchRouter.post('/tickets', validate(createTicketInputSchema), controller.createTicket)
benchRouter.get('/tickets/by-key/:key', controller.getTicketByKey)
benchRouter.get('/tickets/:ticketId', controller.getTicketById)
benchRouter.patch('/tickets/:ticketId', validate(updateTicketInputSchema), controller.updateTicket)
benchRouter.delete('/tickets/:ticketId', controller.deleteTicket)

benchRouter.get('/epics', controller.listEpics)
benchRouter.post('/epics', validate(createEpicInputSchema), controller.createEpic)
benchRouter.get('/epics/:epicId', controller.getEpicById)
benchRouter.patch('/epics/:epicId', validate(updateEpicInputSchema), controller.updateEpic)
benchRouter.delete('/epics/:epicId', controller.deleteEpic)
