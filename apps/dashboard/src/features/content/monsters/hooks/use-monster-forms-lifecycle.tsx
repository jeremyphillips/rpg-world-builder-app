import { useCallback, useState } from 'react'
import { planMonsterFormsRemoval, type FormsRemovalSummary } from '@rpg/contracts'
import { ConfirmDialog } from '@rpg/ui'
import { useFormContext } from 'react-hook-form'

import type { MonsterFormValues } from '../lib/monster-form-values'
import {
  MONSTER_ALTERNATE_FORMS_CANCEL_LABEL,
  MONSTER_ALTERNATE_FORMS_REMOVE_CONFIRM_LABEL,
  MONSTER_ALTERNATE_FORMS_REMOVE_HEADLINE,
  formatMonsterFormsRemovalSummary,
} from '../lib/monster-form-labels'
import { makeEmptyMonsterForms } from '../lib/forms/monster-forms-form-values'

type PendingRemoval = {
  next: ReturnType<typeof planMonsterFormsRemoval>['next']
  summary: FormsRemovalSummary
}

export function useMonsterFormsLifecycle() {
  const { getValues, setValue, trigger } = useFormContext<MonsterFormValues>()
  const [pending, setPending] = useState<PendingRemoval | null>(null)

  const addForms = useCallback(() => {
    setValue('forms', makeEmptyMonsterForms(), { shouldDirty: true })
    void trigger('forms')
  }, [setValue, trigger])

  const requestRemoveAll = useCallback(() => {
    const plan = planMonsterFormsRemoval(getValues())
    setPending(plan)
  }, [getValues])

  const cancelRemoveAll = useCallback(() => setPending(null), [])

  const confirmRemoveAll = useCallback(() => {
    if (!pending) return
    const { next } = pending
    setValue('forms', undefined, { shouldDirty: true })
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
    setPending(null)
    void trigger(['forms', 'traits', 'actions', 'bonusActions', 'reactions', 'legendaryActions'])
  }, [pending, setValue, trigger])

  const dialog = (
    <ConfirmDialog
      open={pending !== null}
      onOpenChange={(open) => {
        if (!open) cancelRemoveAll()
      }}
      headline={MONSTER_ALTERNATE_FORMS_REMOVE_HEADLINE}
      description={pending ? formatMonsterFormsRemovalSummary(pending.summary) : ''}
      confirmLabel={MONSTER_ALTERNATE_FORMS_REMOVE_CONFIRM_LABEL}
      cancelLabel={MONSTER_ALTERNATE_FORMS_CANCEL_LABEL}
      onConfirm={confirmRemoveAll}
      onCancel={cancelRemoveAll}
    />
  )

  return { addForms, requestRemoveAll, dialog }
}
