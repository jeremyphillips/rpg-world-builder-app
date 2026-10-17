import { useEffect } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { SemanticText } from '@rpg/ui'

import { WEAPON_PROFICIENCY_PERSISTED_MIXED_RECONCILIATION_MESSAGE } from '@/lib/forms/grant-sets/weapon-proficiency-grant-form-labels'

import type { ClassFormValues } from '../lib/class-form-fields'

/** Clears persisted-mixed reconciliation once the author selects a weapon proficiency mode. */
export function ClassWeaponProficiencyReconciliationField() {
  const form = useFormContext<ClassFormValues>()
  const pending = useWatch<ClassFormValues, 'weaponProficiencyReconciliationPending'>({
    name: 'weaponProficiencyReconciliationPending',
  })

  useEffect(() => {
    if (!pending) return undefined

    const subscription = form.watch((_values, { name, type }) => {
      if (type !== 'change' || name !== 'weaponProficiencyMode') return
      form.setValue('weaponProficiencyReconciliationPending', false, { shouldValidate: true })
    })

    return () => subscription.unsubscribe()
  }, [form, pending])

  if (!pending) return null

  return (
    <SemanticText tone="warning">
      {WEAPON_PROFICIENCY_PERSISTED_MIXED_RECONCILIATION_MESSAGE}
    </SemanticText>
  )
}
