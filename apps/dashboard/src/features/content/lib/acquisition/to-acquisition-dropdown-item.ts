import type { ButtonDropdownItem } from '@rpg/ui'

import type { AcquisitionOption } from './acquisition.types'

export function toAcquisitionDropdownItem(option: AcquisitionOption): ButtonDropdownItem {
  const supportingMetadata = supportingLineMetadata(option)
  const unavailable = option.availability.status === 'unavailable' ? option.availability : undefined

  return {
    id: option.id,
    label: option.label,
    groupId: option.groupId,
    searchTerms: option.searchTerms,
    search: option.search,
    classification: option.classification,
    metadata: unavailable ? readyDescriptionText(option) : supportingMetadata,
    ...(unavailable ? { disabled: true as const, disabledReason: unavailable.message } : {}),
  }
}

function readyDescriptionText(option: AcquisitionOption): string | undefined {
  if (option.description.status !== 'ready') return undefined
  return option.description.text
}

function supportingLineMetadata(option: AcquisitionOption): string | undefined {
  if (option.description.status === 'ready') return option.description.text
  return option.description.message
}
