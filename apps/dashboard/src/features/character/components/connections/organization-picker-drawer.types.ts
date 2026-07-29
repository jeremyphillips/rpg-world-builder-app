import type { Organization, OrganizationKind } from '@rpg/contracts'

export const ORGANIZATION_PICKER_ALL_TYPES = 'all'
export const ORGANIZATION_PICKER_RESET_VIEW_LABEL = 'Reset view'
export const ORGANIZATION_PICKER_NO_RESULTS_MESSAGE = 'No organizations match this view.'
export const ORGANIZATION_PICKER_NO_ITEMS_MESSAGE = 'No organizations are available.'

export type OrganizationPickerTypeFilter = typeof ORGANIZATION_PICKER_ALL_TYPES | OrganizationKind

export type OrganizationPickerItem = {
  organization: Organization
  selected: boolean
}

export type OrganizationPickerDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: readonly OrganizationPickerItem[]
  selectedCount: number
  onAdd: (organizationId: string) => void
  onRemove: (organizationId: string) => void
}
