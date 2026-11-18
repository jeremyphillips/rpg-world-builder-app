import { RadioGroupField, SelectField } from '@rpg/ui'
import { useFormContext, useWatch } from 'react-hook-form'

import { useMonsterFormsLifecycle } from '../../hooks/use-monster-forms-lifecycle'
import {
  MONSTER_TRUE_FORM_DEFINED_EMPTY_HINT,
  MONSTER_TRUE_FORM_HEADING,
  MONSTER_TRUE_FORM_PROFILE_HINT,
} from '../../lib/monster-form-labels'
import type { MonsterFormValues } from '../../lib/monster-form-values'

function trueFormKindRadioHint(
  kind: 'profile' | 'defined',
  definedFormCount: number,
): string | undefined {
  if (kind === 'profile') return MONSTER_TRUE_FORM_PROFILE_HINT
  if (kind === 'defined' && definedFormCount === 0) return MONSTER_TRUE_FORM_DEFINED_EMPTY_HINT
  return undefined
}

export function MonsterTrueFormDesignation() {
  const forms = useWatch<MonsterFormValues, 'forms'>({ name: 'forms' })
  const {
    formState: { errors },
  } = useFormContext<MonsterFormValues>()
  const lifecycle = useMonsterFormsLifecycle()
  if (!forms?.trueForm || !Array.isArray(forms.definedForms)) return null

  const selectedId = forms.trueForm.kind === 'defined' ? forms.trueForm.formId : undefined
  const selectorError = (errors.forms?.trueForm as { formId?: { message?: string } } | undefined)
    ?.formId?.message
  const radioHint = trueFormKindRadioHint(forms.trueForm.kind, forms.definedForms.length)

  return (
    <>
      <RadioGroupField
        id="monster-true-form-kind"
        label={MONSTER_TRUE_FORM_HEADING}
        hint={radioHint}
        value={forms.trueForm.kind}
        options={[
          { value: 'profile', label: 'Creature profile' },
          { value: 'defined', label: 'Defined form' },
        ]}
        onValueChange={(kind) =>
          lifecycle.requestDesignation(
            kind === 'profile' ? { kind: 'profile' } : { kind: 'defined', formId: undefined },
          )
        }
      />
      {forms.trueForm.kind === 'defined' && forms.definedForms.length > 0 ? (
        <SelectField
          id="monster-true-form-id"
          label="Select form"
          placeholder="Select a form"
          value={selectedId}
          options={forms.definedForms.map((form) => ({
            value: form.id,
            label: form.name?.trim() || 'Untitled form',
          }))}
          hint="The selected form uses the creature's base statistics."
          error={selectorError}
          onValueChange={(formId) => lifecycle.requestDesignation({ kind: 'defined', formId })}
        />
      ) : null}
      {lifecycle.dialog}
    </>
  )
}
