import { z } from 'zod'

import type { ApiContentTypeKey } from '@rpg/contracts'
import type { ContentWriteConfig, WriteEntityBase } from '../content-write-config'

export const duplicateContentRequestSchema = z.object({
  name: z.string().trim().min(1),
})

export type DuplicateContentRequest = z.infer<typeof duplicateContentRequestSchema>

export interface DuplicateContentContext {
  campaignId: string
  contentType: ApiContentTypeKey
  entityId: string
  requestedName: string
  idempotencyKey?: string
}

export interface ContentDuplicationAdapter<T extends WriteEntityBase> {
  writeConfig: ContentWriteConfig<T>
}
