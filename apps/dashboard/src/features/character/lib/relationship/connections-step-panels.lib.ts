import type { SplitButtonMenuGroup } from '@rpg/ui'

import {
  CONNECTION_SECTION_CATALOG,
  type ConnectionTopLevelSectionId,
} from './connection-section-catalog'
import {
  PERSON_SHORTCUT_MENU_GROUPS,
  PLACE_CONNECTION_ROLE_OPTIONS,
  PROPERTY_CONNECTION_ROLE_OPTIONS,
  getPersonConnectionRoleOption,
  type PersonConnectionRoleOption,
  type PlaceConnectionRoleOption,
  type PropertyConnectionRoleOption,
} from './connection-role-catalog'
import type { buildConnectionsStepData } from './connections-step-data.lib'

export type ConnectionsStepActiveDrawer =
  | { section: 'people'; presetRole?: PersonConnectionRoleOption }
  | { section: 'organizations' }
  | { section: 'places'; presetRole?: PlaceConnectionRoleOption }
  | { section: 'property'; presetRole?: PropertyConnectionRoleOption }
  | null

export type ConnectionsStepSectionAddAction = {
  label: string
  onPrimaryClick: () => void
  menuGroups: SplitButtonMenuGroup[]
  disabled?: boolean
}

export function buildPersonShortcutMenuGroups(
  onShortcut: (roleId: PersonConnectionRoleOption['id']) => void,
): SplitButtonMenuGroup[] {
  return PERSON_SHORTCUT_MENU_GROUPS.map((group) => ({
    id: group.id,
    label: group.label,
    items: group.roleIds.map((roleId) => {
      const role = getPersonConnectionRoleOption(roleId)!
      return {
        id: role.id,
        label: role.shortcutLabel,
        onSelect: () => onShortcut(roleId),
      }
    }),
  }))
}

function buildPlaceShortcutMenuGroups(
  onShortcut: (role: PlaceConnectionRoleOption) => void,
): SplitButtonMenuGroup[] {
  return [
    {
      id: 'places',
      items: PLACE_CONNECTION_ROLE_OPTIONS.map((role) => ({
        id: role.id,
        label: role.shortcutLabel,
        onSelect: () => onShortcut(role),
      })),
    },
  ]
}

function buildPropertyShortcutMenuGroups(
  onShortcut: (role: PropertyConnectionRoleOption) => void,
): SplitButtonMenuGroup[] {
  return [
    {
      id: 'property',
      items: PROPERTY_CONNECTION_ROLE_OPTIONS.map((role) => ({
        id: role.id,
        label: role.shortcutLabel,
        onSelect: () => onShortcut(role),
      })),
    },
  ]
}

export function resolveConnectionsStepSectionAddAction(input: {
  sectionId: ConnectionTopLevelSectionId
  campaignId?: string
  locationsReady: boolean
  openDrawer: (drawer: ConnectionsStepActiveDrawer) => void
}): ConnectionsStepSectionAddAction {
  const section = CONNECTION_SECTION_CATALOG[input.sectionId]
  const label = `Add ${section.singularAddLabel}`

  if (input.sectionId === 'people') {
    return {
      label,
      onPrimaryClick: () => input.openDrawer({ section: 'people' }),
      menuGroups: buildPersonShortcutMenuGroups((roleId) => {
        const role = getPersonConnectionRoleOption(roleId)
        input.openDrawer(role ? { section: 'people', presetRole: role } : { section: 'people' })
      }),
    }
  }

  if (input.sectionId === 'organizations') {
    return {
      label,
      onPrimaryClick: () => input.openDrawer({ section: 'organizations' }),
      menuGroups: [],
    }
  }

  if (input.sectionId === 'places') {
    return {
      label,
      onPrimaryClick: () => input.openDrawer({ section: 'places' }),
      menuGroups: buildPlaceShortcutMenuGroups((role) =>
        input.openDrawer({ section: 'places', presetRole: role }),
      ),
      disabled: !input.campaignId || !input.locationsReady,
    }
  }

  return {
    label,
    onPrimaryClick: () => input.openDrawer({ section: 'property' }),
    menuGroups: buildPropertyShortcutMenuGroups((role) =>
      input.openDrawer({ section: 'property', presetRole: role }),
    ),
    disabled: !input.campaignId || !input.locationsReady,
  }
}

const SECTION_EMPTY_LABELS: Record<
  ConnectionTopLevelSectionId,
  { withCampaign: string; withoutCampaign?: string }
> = {
  people: { withCampaign: 'No people added.' },
  organizations: { withCampaign: 'No organization added.' },
  places: {
    withCampaign: 'No places added.',
    withoutCampaign: 'Choose a campaign to link places.',
  },
  property: {
    withCampaign: 'No property added.',
    withoutCampaign: 'Choose a campaign to link property.',
  },
}

export function resolveConnectionsStepSectionEmptyLabel(
  sectionId: ConnectionTopLevelSectionId,
  campaignId?: string,
): string {
  const labels = SECTION_EMPTY_LABELS[sectionId]
  if (campaignId) return labels.withCampaign
  return labels.withoutCampaign ?? labels.withCampaign
}

export type ConnectionsStepData = ReturnType<typeof buildConnectionsStepData>
