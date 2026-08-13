import type { Request, Response } from 'express'

import {
  buildingCreateCompositionRequestSchema,
  type BuildingCreateCompositionIssue,
} from '@rpg/contracts'

import { HttpError } from '../../../lib/http-error'
import { createBuildingComposition } from './building-create-composition.service'

function requestIssueAttribution(
  body: unknown,
  path: readonly PropertyKey[],
): Partial<BuildingCreateCompositionIssue> {
  if (typeof body !== 'object' || body === null) return {}
  const root = body as Record<string, unknown>
  const index = typeof path[1] === 'number' ? path[1] : undefined
  if (index === undefined) return {}
  if (path[0] === 'organizations') {
    const organizationDraftId = draftIdAt(root.organizations, index, 'organizationDraftId')
    return organizationDraftId ? { organizationDraftId } : {}
  }
  if (path[0] === 'relationships') {
    const relationshipDraftId = draftIdAt(root.relationships, index, 'relationshipDraftId')
    return relationshipDraftId ? { relationshipDraftId } : {}
  }
  return {}
}

function draftIdAt(collection: unknown, index: number, key: string): string | undefined {
  if (!Array.isArray(collection)) return undefined
  const draft = collection[index]
  if (typeof draft !== 'object' || draft === null) return undefined
  const value = (draft as Record<string, unknown>)[key]
  return typeof value === 'string' ? value : undefined
}

function requestIssueTarget(
  path: readonly PropertyKey[],
): BuildingCreateCompositionIssue['target'] {
  if (path[0] === 'organizations') return 'organization'
  if (path[0] === 'relationships') return 'relationship'
  return 'building'
}

export async function createBuildingCompositionItem(req: Request, res: Response): Promise<void> {
  const parsed = buildingCreateCompositionRequestSchema.safeParse(req.body)
  if (!parsed.success) {
    const issues = parsed.error.issues.map((entry) => ({
      target: requestIssueTarget(entry.path),
      code: 'validation_error',
      message: entry.message,
      ...(entry.path.length > 0 ? { path: entry.path.join('.') } : {}),
      ...requestIssueAttribution(req.body, entry.path),
    })) satisfies BuildingCreateCompositionIssue[]
    throw new HttpError(
      422,
      'building_create_validation_failed',
      'Building create plan is invalid.',
      {
        issues,
      },
    )
  }

  const { campaignId } = req.params as { campaignId: string }
  const result = await createBuildingComposition(campaignId, parsed.data)
  res.status(201).json(result)
}
