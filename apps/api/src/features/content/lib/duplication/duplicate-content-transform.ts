import { contentStatusToValidationIntent, type ApiContentTypeKey } from '@rpg/contracts'

import type { ContentWriteConfig, WriteEntityBase } from '../content-write-config'
import { resolveWriteInputSchema } from '../content-write-config'
import { regenerateNestedContentKeysForDuplicate } from '../apply-content-keys'
import {
  extractEntityBodyForDuplicate,
  resolveNestedIdRegeneration,
} from './duplicate-content-policy'
import type { ResolvedContentSlug } from '../slug/resolve-unique-content-slug'

export interface TransformDuplicateSourceInput<T extends WriteEntityBase> {
  source: T
  requestedName: string
  destinationSlug: ResolvedContentSlug
  contentType: ApiContentTypeKey
  writeConfig: ContentWriteConfig<T>
}

export function transformDuplicateSource<T extends WriteEntityBase>({
  source,
  requestedName,
  destinationSlug,
  contentType,
  writeConfig,
}: TransformDuplicateSourceInput<T>): Record<string, unknown> {
  const stripped = extractEntityBodyForDuplicate(source as unknown as Record<string, unknown>)
  const withRegeneratedIds = regenerateNestedContentKeysForDuplicate(stripped, {
    destinationSlug,
    nestedIdRegeneration: resolveNestedIdRegeneration(contentType),
  })

  const candidate = {
    ...withRegeneratedIds,
    name: requestedName,
    slug: destinationSlug,
  }

  const validationIntent = contentStatusToValidationIntent('draft')
  const schema = resolveWriteInputSchema(writeConfig, 'create', validationIntent)
  return schema.parse(candidate) as Record<string, unknown>
}
