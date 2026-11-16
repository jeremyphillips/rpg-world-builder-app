import { RadioGroupField, SelectField } from '@rpg/ui'
import { useFormContext, useWatch } from 'react-hook-form'

import { useMonsterFormsLifecycle } from '../../hooks/use-monster-forms-lifecycle'
import type { MonsterFormValues } from '../../lib/monster-form-values'

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

  return (
    <>
      <RadioGroupField
        id="monster-true-form-kind"
        label="True form"
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
      {forms.trueForm.kind === 'profile' ? (
        <p>The creature's profile represents its true form.</p>
      ) : forms.definedForms.length === 0 ? (
        <p>Add a form below to designate it as the true form.</p>
      ) : (
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
      )}
      {lifecycle.dialog}
    </>
  )
}
