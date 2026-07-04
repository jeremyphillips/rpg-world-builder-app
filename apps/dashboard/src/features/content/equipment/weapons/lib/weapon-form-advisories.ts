import {
  formatWeaponMasteryModeHint,
  getWeaponPropertyModeAdvisories,
  isWeaponMasteryCompatibleWithMode,
  type WeaponPropertyModeAdvisory,
} from '@rpg/contracts'

import type { AdvisoryFormSubmitOptions } from '../../../lib/forms/shells/use-advisory-form-submit'
import type { EquipmentFormValues } from '../../lib/equipment-form-fields'

/** Minimal RHF surface used by mastery save blocking (union or weapon-only forms). */
export type WeaponMasteryBlockForm = {
  getValues: () => EquipmentFormValues
  setError: (name: 'mastery', error: { type: 'manual'; message: string }) => void
}

/** Soft advisories for incompatible property selections at save time (tier 3). */
export function getWeaponFormPropertyAdvisories(
  values: EquipmentFormValues,
): readonly WeaponPropertyModeAdvisory[] {
  if (values.kind !== 'weapon') return []
  return getWeaponPropertyModeAdvisories({
    mode: values.mode,
    properties: values.properties,
  })
}

export function weaponFormHasInvalidMastery(values: EquipmentFormValues): boolean {
  if (values.kind !== 'weapon') return false
  if (!values.mode || !values.mastery) return false
  return !isWeaponMasteryCompatibleWithMode(values.mastery, values.mode)
}

/** Hard block: sets a field error and returns true when save must stop. */
export function blockWeaponSaveForInvalidMastery(form: WeaponMasteryBlockForm): boolean {
  const values = form.getValues()
  if (values.kind !== 'weapon' || !weaponFormHasInvalidMastery(values)) return false

  form.setError('mastery', {
    type: 'manual',
    message:
      formatWeaponMasteryModeHint(values.mode) ??
      'Selected mastery is not available for this weapon mode.',
  })
  return true
}

/** Confirm-dialog body when tier-3 property advisories remain at save. */
export function formatWeaponPropertyAdvisoryConfirmMessage(
  advisories: readonly { message: string }[],
): string {
  if (advisories.length === 0) return ''

  const lines = advisories.map((advisory) => advisory.message)
  if (lines.length === 1) {
    return `${lines[0]} Save anyway?`
  }

  return `${lines.join(' ')} Save anyway?`
}

/** Advisory submit options for weapon equipment create/edit forms. */
export function weaponAdvisorySubmitOptions(): AdvisoryFormSubmitOptions<EquipmentFormValues> {
  return {
    blockSubmit: (form) => blockWeaponSaveForInvalidMastery(form),
    getAdvisories: getWeaponFormPropertyAdvisories,
    formatConfirmDescription: formatWeaponPropertyAdvisoryConfirmMessage,
    confirmHeadline: 'Incompatible weapon properties',
    confirmLabel: 'Save anyway',
  }
}
