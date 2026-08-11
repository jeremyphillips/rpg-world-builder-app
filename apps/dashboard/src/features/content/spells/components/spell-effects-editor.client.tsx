'use client'

import { createElement } from 'react'
import { z } from 'zod'
import { Form } from '@rpg/ui/form'
import { Text } from '@rpg/ui'

import type { ContentFormCtx } from '../../lib/forms/content-form-registry'
import { effectArrayFields } from '../lib/effects/effect-form-fields'
import { spellEffectsFormSchema } from '../lib/effects/effect-form-schema'
import { SpellEffectsPreview } from './spell-effects-preview.client'

export const EFFECTS_NOT_SAVED_BANNER = 'Effects are not saved yet.'

const spellEffectsEditorSchema = z.object({
  effects: spellEffectsFormSchema,
})

export type SpellEffectsEditorValues = z.infer<typeof spellEffectsEditorSchema>

export type SpellEffectsEditorProps = {
  formCtx: ContentFormCtx
  defaultEffects?: SpellEffectsEditorValues['effects']
}

/** Effects tab shell: save-disabled banner, live preview, and atomic effect array editor. */
export function SpellEffectsEditor({ formCtx, defaultEffects = [] }: SpellEffectsEditorProps) {
  return (
    <Form
      schema={spellEffectsEditorSchema}
      fields={[
        {
          kind: 'slot',
          name: '_effectsPersistenceNotice',
          render: () =>
            createElement(
              Text,
              { variant: 'muted', className: 'text-sm', role: 'status' },
              EFFECTS_NOT_SAVED_BANNER,
            ),
        },
        {
          kind: 'slot',
          name: '_effectsPreview',
          label: 'Preview',
          render: () => createElement(SpellEffectsPreview),
        },
        ...effectArrayFields(formCtx),
      ]}
      defaultValues={{ effects: defaultEffects }}
      onSubmit={() => undefined}
      density="compact"
    />
  )
}
