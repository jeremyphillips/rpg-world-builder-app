'use client'

import { z } from 'zod'
import { Form } from '@rpg/ui/form'

import type { ContentFormCtx } from '../../../../lib/forms/content-form-registry'
import { resolutionFields } from '../../lib/form/resolution-form-fields'
import { RESOLUTION_SECTION_LABELS } from '../../lib/form/resolution-form-labels'
import { optionalResolutionFormSchema } from '../../lib/form/resolution-form-schema'

export const RESOLUTION_NOT_SAVED_BANNER = RESOLUTION_SECTION_LABELS.notSavedBanner

const spellResolutionEditorSchema = z.object({
  resolution: optionalResolutionFormSchema,
})

export type SpellResolutionEditorValues = z.infer<typeof spellResolutionEditorSchema>

export type SpellResolutionEditorProps = {
  formCtx: ContentFormCtx
  defaultResolution?: SpellResolutionEditorValues['resolution']
}

/** Resolution tab shell for Storybook and isolated tests. */
export function SpellResolutionEditor({ formCtx, defaultResolution }: SpellResolutionEditorProps) {
  return (
    <Form
      schema={spellResolutionEditorSchema}
      fields={resolutionFields(formCtx)}
      defaultValues={{ resolution: defaultResolution }}
      onSubmit={() => undefined}
      rhythm="compact"
    />
  )
}
