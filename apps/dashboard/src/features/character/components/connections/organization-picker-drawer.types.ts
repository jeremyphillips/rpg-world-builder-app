import type {
  CharacterOrganizationConnection,
  Organization,
  OrganizationDomain,
} from '@rpg/contracts'

export const ORGANIZATION_PICKER_ALL_TYPES = 'all'
export const ORGANIZATION_PICKER_RESET_VIEW_LABEL = 'Reset view'
export const ORGANIZATION_PICKER_NO_RESULTS_MESSAGE = 'No organizations match this view.'
export const ORGANIZATION_PICKER_NO_ITEMS_MESSAGE = 'No organizations are available.'
export const ORGANIZATION_PICKER_TITLE = 'Choose organization'
export const ORGANIZATION_PICKER_DESCRIPTION = 'Choose an organization connected to this character.'

export { ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE } from './organization-membership-title-field.types'

export type OrganizationPickerTypeFilter = typeof ORGANIZATION_PICKER_ALL_TYPES | OrganizationDomain

export type OrganizationPickerItem = {
  organization: Organization
  selected: boolean
}

/** Add-flow payload — `title`/`priority` are stamped together by the contracts metadata helper. */
export type OrganizationMembershipSelection = Pick<
  CharacterOrganizationConnection,
  'organizationId' | 'title' | 'priority'
>

export type OrganizationPickerDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: readonly OrganizationPickerItem[]
  onAdd: (membership: OrganizationMembershipSelection) => void | Promise<void>
}
