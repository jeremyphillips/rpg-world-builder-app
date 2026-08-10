import type { Request, Response } from 'express'
import { z } from 'zod'

import { HttpError } from '../../../lib/http-error'
import { resolveOrganizationMembers } from './resolve-organization-members'

const organizationMembersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
})

export async function listOrganizationMembers(req: Request, res: Response): Promise<void> {
  const { campaignId, organizationId } = req.params as {
    campaignId: string
    organizationId: string
  }

  const queryResult = organizationMembersQuerySchema.safeParse(req.query)
  if (!queryResult.success) {
    throw new HttpError(400, 'validation_error', 'Invalid pagination query.', {
      issues: queryResult.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    })
  }

  const members = await resolveOrganizationMembers({
    campaignId,
    organizationId,
    page: queryResult.data.page,
    pageSize: queryResult.data.pageSize,
  })

  if (!members) {
    throw new HttpError(404, 'not_found', 'Organization not found.')
  }

  res.status(200).json(members)
}
