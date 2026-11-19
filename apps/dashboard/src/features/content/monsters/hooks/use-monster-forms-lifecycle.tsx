import { useCallback, useState, type ReactNode } from 'react'
import {
  planMonsterDefinedFormRemoval,
  planMonsterFormsRemoval,
  planMonsterTrueFormDesignation,
} from '@rpg/contracts'
import { ConfirmDialog } from '@rpg/ui'
import { useFormContext } from 'react-hook-form'

import type { MonsterFormValues } from '../lib/monster-form-values'
import {
  MONSTER_FORMS_CANCEL_LABEL,
  MONSTER_FORMS_REMOVE_CONFIRM_LABEL,
  MONSTER_FORMS_REMOVE_HEADLINE,
  formatMonsterDefinedFormRemovalSummary,
  formatMonsterFormsRemovalSummary,
} from '../lib/monster-form-labels'
import { makeEmptyMonsterForms } from '../lib/forms/monster-forms-form-values'

export type MonsterFormsLifecycleApi = {
  addForms: () => void
  requestDesignation: (trueForm: NonNullable<MonsterFormValues['forms']>['trueForm']) => void
  requestDefinedFormRemoval: (formId: string, afterConfirm?: () => void) => void
  requestRemoveAll: () => void
}

type MonsterFormsLifecycleValue = MonsterFormsLifecycleApi & {
  dialog: ReactNode
}

type PendingRemoval = {
  next: unknown
  description: string
  headline: string
  confirmLabel: string
  afterConfirm?: () => void
}

export function useMonsterFormsLifecycle(): MonsterFormsLifecycleValue {
  const { getValues, setValue, trigger } = useFormContext<MonsterFormValues>()
  const [pending, setPending] = useState<PendingRemoval | null>(null)

  const addForms = useCallback(() => {
    setValue('forms', makeEmptyMonsterForms(), { shouldDirty: true })
    void trigger('forms')
  }, [setValue, trigger])

  const requestRemoveAll = useCallback(() => {
    const plan = planMonsterFormsRemoval(getValues())
    setPending({
      next: plan.next,
      description: formatMonsterFormsRemovalSummary(plan.summary),
      headline: MONSTER_FORMS_REMOVE_HEADLINE,
      confirmLabel: MONSTER_FORMS_REMOVE_CONFIRM_LABEL,
    })
  }, [getValues])

  const requestDesignation = useCallback(
    (trueForm: NonNullable<MonsterFormValues['forms']>['trueForm']) => {
      const values = getValues()
      if (!values.forms) return
      const plan = planMonsterTrueFormDesignation(
        values as Parameters<typeof planMonsterTrueFormDesignation>[0],
        trueForm,
      )
      const selected =
        trueForm.kind === 'defined'
          ? values.forms.definedForms.find((form) => form.id === trueForm.formId)
          : undefined
      const consequences = [
        plan.summary.removedProfileName
          ? 'The profile form name override will be removed.'
          : undefined,
        plan.summary.strippedProfileReferences.length > 0
          ? 'The creature profile will no longer be available to the listed form restrictions.'
          : undefined,
        plan.summary.indirectlyAffectedReferences.length > 0
          ? `Also affected action references: ${plan.summary.indirectlyAffectedReferences
              .map((row) => row.name?.trim() || 'Untitled action')
              .join(', ')}.`
          : undefined,
      ].filter(Boolean) as string[]
      if (plan.summary.clearedOverrideLabels.length > 0 && selected) {
        setPending({
          next: plan.next,
          headline: `Set ${selected.name || 'Untitled form'} as the true form?`,
          description: `The true form uses the creature's base statistics. ${
            selected.name || 'This form'
          }'s statistic overrides will be removed. Affected overrides: ${plan.summary.clearedOverrideLabels.join(', ')}.`,
          confirmLabel: 'Set true form',
        })
        return
      }
      if (consequences.length > 0) {
        setPending({
          next: plan.next,
          headline: 'Use a defined form as the true form?',
          description: consequences.join(' '),
          confirmLabel: 'Use defined form',
        })
        return
      }
      setValue('forms', plan.next.forms as MonsterFormValues['forms'], { shouldDirty: true })
      setValue('traits', plan.next.traits as MonsterFormValues['traits'], { shouldDirty: true })
      setValue('actions', plan.next.actions as MonsterFormValues['actions'], { shouldDirty: true })
      setValue('bonusActions', plan.next.bonusActions as MonsterFormValues['bonusActions'], {
        shouldDirty: true,
      })
      setValue('reactions', plan.next.reactions as MonsterFormValues['reactions'], {
        shouldDirty: true,
      })
      setValue(
        'legendaryActions',
        plan.next.legendaryActions as MonsterFormValues['legendaryActions'],
        { shouldDirty: true },
      )
      void trigger('forms')
    },
    [getValues, setValue, trigger],
  )

  const requestDefinedFormRemoval = useCallback(
    (formId: string, afterConfirm?: () => void) => {
      const values = getValues()
      if (!values.forms) return
      const plan = planMonsterDefinedFormRemoval(
        values as Parameters<typeof planMonsterDefinedFormRemoval>[0],
        formId,
      )
      if (!plan) return
      const name = plan.summary.removedForm.name?.trim() || 'Untitled form'
      setPending({
        next: plan.next,
        headline: `Remove ${name}?`,
        description: formatMonsterDefinedFormRemovalSummary(plan.summary),
        confirmLabel: 'Remove form',
        afterConfirm,
      })
    },
    [getValues],
  )

  const cancelRemoveAll = useCallback(() => setPending(null), [])

  const confirmRemoveAll = useCallback(() => {
    if (!pending) return
    const next = pending.next as Partial<MonsterFormValues>
    setValue('forms', next.forms as MonsterFormValues['forms'], { shouldDirty: true })
    setValue('traits', next.traits as MonsterFormValues['traits'], { shouldDirty: true })
    setValue('actions', next.actions as MonsterFormValues['actions'], { shouldDirty: true })
    setValue('bonusActions', next.bonusActions as MonsterFormValues['bonusActions'], {
      shouldDirty: true,
    })
    setValue('reactions', next.reactions as MonsterFormValues['reactions'], {
      shouldDirty: true,
    })
    setValue(
      'legendaryActions',
      (next.legendaryActions ?? undefined) as MonsterFormValues['legendaryActions'],
      { shouldDirty: true },
    )
    pending.afterConfirm?.()
    setPending(null)
    void trigger(['forms', 'traits', 'actions', 'bonusActions', 'reactions', 'legendaryActions'])
  }, [pending, setValue, trigger])

  const dialog = (
    <ConfirmDialog
      open={pending !== null}
      onOpenChange={(open) => {
        if (!open) cancelRemoveAll()
      }}
      headline={pending?.headline ?? MONSTER_FORMS_REMOVE_HEADLINE}
      description={pending?.description ?? ''}
      confirmLabel={pending?.confirmLabel ?? MONSTER_FORMS_REMOVE_CONFIRM_LABEL}
      cancelLabel={MONSTER_FORMS_CANCEL_LABEL}
      onConfirm={confirmRemoveAll}
      onCancel={cancelRemoveAll}
    />
  )

  return {
    addForms,
    requestDesignation,
    requestDefinedFormRemoval,
    requestRemoveAll,
    dialog,
  }
}
