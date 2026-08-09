import type {
  CharacterOrganizationConnection,
  Organization,
  OrganizationKind,
} from '@rpg/contracts'

export const ORGANIZATION_PICKER_ALL_TYPES = 'all'
export const ORGANIZATION_PICKER_RESET_VIEW_LABEL = 'Reset view'
export const ORGANIZATION_PICKER_NO_RESULTS_MESSAGE = 'No organizations match this view.'
export const ORGANIZATION_PICKER_NO_ITEMS_MESSAGE = 'No organizations are available.'
export const ORGANIZATION_PICKER_TITLE = 'Choose organization'
export const ORGANIZATION_PICKER_DESCRIPTION = 'Choose an organization connected to this character.'
/** UI-only sentinel — never persisted as a membership title. */
export const ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE = '__no_title__'

export type OrganizationPickerTypeFilter = typeof ORGANIZATION_PICKER_ALL_TYPES | OrganizationKind

export type OrganizationPickerItem = {
  organization: Organization
  selected: boolean
}

export type OrganizationMembershipSelection = Pick<
  CharacterOrganizationConnection,
  'organizationId' | 'title'
>

export type OrganizationPickerDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: readonly OrganizationPickerItem[]
  onAdd: (membership: OrganizationMembershipSelection) => void
}
