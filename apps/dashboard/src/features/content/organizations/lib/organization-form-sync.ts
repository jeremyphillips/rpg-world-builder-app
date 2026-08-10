import { isOrganizationSubtypeValidForKind, type OrganizationKind } from '@rpg/contracts'
import type { FormValueSync } from '@rpg/ui/form'

/** Clears subtype only when incompatible with the new kind (or kind is unset). */
function syncOrganizationKindChange(
  values: Record<string, unknown>,
): Partial<Record<string, unknown>> | undefined {
  const kind = values.organizationKind
  const subtype = values.organizationSubtype
  if (typeof subtype !== 'string' || subtype === '') return undefined

  if (typeof kind !== 'string' || kind === '') {
    return { organizationSubtype: undefined }
  }

  if (!isOrganizationSubtypeValidForKind(kind as OrganizationKind, subtype)) {
    return { organizationSubtype: undefined }
  }

  return undefined
}

export const organizationFormValueSyncs: FormValueSync[] = [
  {
    dependsOn: ['organizationKind'],
    apply: (values, changedKeys) =>
      changedKeys.includes('organizationKind') ? syncOrganizationKindChange(values) : undefined,
  },
]
