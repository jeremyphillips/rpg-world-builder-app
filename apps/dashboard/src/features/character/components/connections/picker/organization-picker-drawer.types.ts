import {
  getContentTypeSentenceForm,
  type CharacterOrganizationConnection,
  type Organization,
  type OrganizationDomain,
} from '@rpg/contracts'

const organizationSingular = getContentTypeSentenceForm('organizations', 1)
const organizationPlural = getContentTypeSentenceForm('organizations', 2)

export const ORGANIZATION_PICKER_ALL_DOMAINS = 'all'
export const ORGANIZATION_PICKER_NO_RESULTS_MESSAGE = `No ${organizationPlural} match this view.`
export const ORGANIZATION_PICKER_NO_ITEMS_MESSAGE = `No ${organizationPlural} are available.`
export const ORGANIZATION_PICKER_TITLE = `Choose ${organizationSingular}`
export const ORGANIZATION_PICKER_DESCRIPTION = `Choose an ${organizationSingular} connected to this character.`
export const ORGANIZATION_PICKER_SEARCH_PLACEHOLDER = `Search ${organizationPlural}`
export const ORGANIZATION_PICKER_ADD_SUBMIT_LABEL = `Add ${organizationSingular}`

export type OrganizationPickerDomainFilter =
  | typeof ORGANIZATION_PICKER_ALL_DOMAINS
  | OrganizationDomain

export type OrganizationPickerItem = {
  organization: Organization
  selected: boolean
}

/** Add-flow payload — optional catalog title id validated on the API write path. */
export type OrganizationMembershipSelection = Pick<
  CharacterOrganizationConnection,
  'organizationId' | 'membershipTitleId'
>

export type OrganizationPickerDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: readonly OrganizationPickerItem[]
  onAdd: (membership: OrganizationMembershipSelection) => void | Promise<void>
}
