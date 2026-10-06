import { useEffect } from 'react'
import type { FieldValues } from 'react-hook-form'
import type { ZodType } from 'zod'
import type { TabbedFormTab } from '@rpg/ui/form'

import {
  useContentPublishValidation,
  type ContentPublishValidation,
} from './use-content-publish-validation'

/** Bridges live publish validation into {@link FormUiProvider} presentation props. */
export function ContentFormPublishValidationBridge({
  schema,
  tabs,
  onValidationChange,
}: {
  schema: ZodType<FieldValues>
  tabs: TabbedFormTab[]
  onValidationChange: (validation: Pick<ContentPublishValidation, 'issues'>) => void
}) {
  const validation = useContentPublishValidation({ schema, tabs, debounceMs: 0 })

  useEffect(() => {
    onValidationChange({ issues: [...validation.issues] })
  }, [onValidationChange, validation.issues])

  return null
}
