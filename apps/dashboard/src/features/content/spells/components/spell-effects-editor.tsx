import { createElement } from 'react'
import { z } from 'zod'
import { Form } from '@rpg/ui/form'
import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'
import { effectArrayFields } from '../lib/effects/effect-form-fields'
import { spellEffectsFormSchema } from '../lib/effects/effect-form-schema'
import { SpellEffectsPreview } from './spell-effects-preview'

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
          kind: 'display',
          id: 'effects-persistence-notice',
          content: {
            variant: 'text',
            text: EFFECTS_NOT_SAVED_BANNER,
            role: 'muted',
          },
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
