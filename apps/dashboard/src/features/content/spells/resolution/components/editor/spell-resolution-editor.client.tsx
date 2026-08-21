'use client'

import { z } from 'zod'
import { Form } from '@rpg/ui/form'

import type { ContentFormCtx } from '../../../../lib/forms/registry/content-form-registry'
import { resolutionFields } from '../../lib/form/resolution-form-fields'
import { optionalResolutionFormSchema } from '../../lib/form/resolution-form-schema'

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
      density="compact"
    />
  )
}
