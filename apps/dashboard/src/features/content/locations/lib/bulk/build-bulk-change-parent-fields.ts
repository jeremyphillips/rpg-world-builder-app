import type { Location } from '@rpg/contracts'
import type { FormItem } from '@rpg/ui/form'

import { filterReferenceableCatalogRows } from '../../../lib/form-options/content-reference-catalog.lib'
import { buildParentLocationOptions } from '../location-parent-picker'
import {
  BULK_CHANGE_PARENT_NONE_OPTION_LABEL,
  BULK_CHANGE_PARENT_PARENT_FIELD_LABEL,
  BULK_CHANGE_PARENT_PARENT_FIELD_PLACEHOLDER,
} from './bulk-change-parent-labels'

export const BULK_CHANGE_PARENT_NONE_SENTINEL = '__none__'

export type BulkChangeParentFormFieldValues = {
  parentLocationOption: string
}

export const BULK_CHANGE_PARENT_FORM_FIELD_DEFAULTS: BulkChangeParentFormFieldValues = {
  parentLocationOption: '',
}

export type BulkChangeParentConfig = {
  proposedParentId: string | null
}

/** Normalizes form values to a parent assignment config, or null when unset. */
export function toBulkChangeParentConfig(
  fieldValues: BulkChangeParentFormFieldValues,
): BulkChangeParentConfig | null {
  const { parentLocationOption } = fieldValues

  if (!parentLocationOption) {
    return null
  }

  if (parentLocationOption === BULK_CHANGE_PARENT_NONE_SENTINEL) {
    return { proposedParentId: null }
  }

  return { proposedParentId: parentLocationOption }
}

export function buildBulkChangeParentFields(campaignLocations: readonly Location[]): FormItem[] {
  const locationOptions = buildParentLocationOptions(
    filterReferenceableCatalogRows(campaignLocations),
  )

  return [
    {
      type: 'select',
      name: 'parentLocationOption',
      label: BULK_CHANGE_PARENT_PARENT_FIELD_LABEL,
      placeholder: BULK_CHANGE_PARENT_PARENT_FIELD_PLACEHOLDER,
      width: 'full',
      options: [
        { value: BULK_CHANGE_PARENT_NONE_SENTINEL, label: BULK_CHANGE_PARENT_NONE_OPTION_LABEL },
        ...locationOptions,
      ],
    },
  ]
}
