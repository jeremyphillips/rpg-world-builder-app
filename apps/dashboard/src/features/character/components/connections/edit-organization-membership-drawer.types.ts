import type { OrganizationKind } from '@rpg/contracts'

export type EditOrganizationMembershipOrganization = {
  id: string
  name: string
  organizationKind: OrganizationKind
  organizationSubtype?: string
}

export type EditOrganizationMembershipDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  organization: EditOrganizationMembershipOrganization
  characterName: string
  currentTitle?: string
  onSave: (title?: string) => Promise<void>
  onRemove: () => Promise<void>
}
