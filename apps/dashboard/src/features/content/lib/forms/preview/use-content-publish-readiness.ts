import type { FieldValues } from 'react-hook-form'
import type { ZodType } from 'zod'
import type { TabbedFormTab } from '@rpg/ui/form'

import {
  useContentPublishValidation,
  type ContentPublishValidation,
} from '../validation/content-form-publish-validation.client'

export type ContentPublishReadiness = Pick<
  ContentPublishValidation,
  'invalidTabIds' | 'isChecking'
> & {
  valid: boolean
}

/**
 * Debounced silent publish-schema parse. Never writes form state.
 * Section validity uses the same path→tab ownership as tab badges.
 * The first snapshot is synchronous so the rail never paints a false Ready.
 */
export function useContentPublishReadiness<TValues extends FieldValues>({
  schema,
  tabs,
  debounceMs,
}: {
  schema: ZodType<TValues>
  tabs: TabbedFormTab[]
  debounceMs?: number
}): ContentPublishReadiness {
  const validation = useContentPublishValidation({ schema, tabs, debounceMs })

  return {
    valid: validation.isPublishReady,
    invalidTabIds: validation.invalidTabIds,
    isChecking: validation.isChecking,
  }
}
