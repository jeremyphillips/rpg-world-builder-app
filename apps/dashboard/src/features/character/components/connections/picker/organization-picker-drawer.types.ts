import {
  catalogNounFromContentType,
  formatCatalogPickerCopy,
  type CharacterOrganizationConnection,
  type Organization,
} from '@rpg/contracts'

const organizationNoun = catalogNounFromContentType('organizations')

export const ORGANIZATION_PICKER_COPY = formatCatalogPickerCopy(organizationNoun, {
  noResultsMessage: `No ${organizationNoun.plural} match this view.`,
})

export const ORGANIZATION_PICKER_NO_RESULTS_MESSAGE = ORGANIZATION_PICKER_COPY.noResultsMessage
export const ORGANIZATION_PICKER_NO_ITEMS_MESSAGE = ORGANIZATION_PICKER_COPY.noItemsMessage

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
