import { RadioGroupField, SelectField } from '@rpg/ui'
import { useFormContext, useWatch } from 'react-hook-form'

import { useMonsterFormsLifecycle } from '../../hooks/use-monster-forms-lifecycle'
import {
  MONSTER_DEFINED_FORM_DISPLAY_FALLBACK,
  MONSTER_TRUE_FORM_DEFINED_EMPTY_HINT,
  MONSTER_TRUE_FORM_HEADING,
  MONSTER_TRUE_FORM_KIND_DEFINED_LABEL,
  MONSTER_TRUE_FORM_KIND_PROFILE_LABEL,
  MONSTER_TRUE_FORM_PROFILE_HINT,
  MONSTER_TRUE_FORM_SELECT_HINT,
  MONSTER_TRUE_FORM_SELECT_LABEL,
  MONSTER_TRUE_FORM_SELECT_PLACEHOLDER,
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

function definedFormDisplayName(name: string | undefined): string {
  return name?.trim() || MONSTER_DEFINED_FORM_DISPLAY_FALLBACK
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
          { value: 'profile', label: MONSTER_TRUE_FORM_KIND_PROFILE_LABEL },
          { value: 'defined', label: MONSTER_TRUE_FORM_KIND_DEFINED_LABEL },
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
          label={MONSTER_TRUE_FORM_SELECT_LABEL}
          placeholder={MONSTER_TRUE_FORM_SELECT_PLACEHOLDER}
          value={selectedId}
          options={forms.definedForms.map((form) => ({
            value: form.id,
            label: definedFormDisplayName(form.name),
          }))}
          hint={MONSTER_TRUE_FORM_SELECT_HINT}
          error={selectorError}
          onValueChange={(formId) => lifecycle.requestDesignation({ kind: 'defined', formId })}
        />
      ) : null}
      {lifecycle.dialog}
    </>
  )
}
