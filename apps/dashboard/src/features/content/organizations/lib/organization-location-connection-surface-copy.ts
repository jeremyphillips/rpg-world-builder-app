import type {
  OrganizationLocationConnectionFamily,
  OrganizationLocationConnectionKind,
} from '@rpg/contracts'

import type { OrganizationConnectionDrawerIntent } from '../../lib/relationship/location-connection/location-connection-drawer-intent'
import type { OrganizationLocationTargetBrowseScope } from './organization-location-target-browse-scope'

export type OrganizationForwardTargetPresentationConfig = {
  targetLabel?: string
  targetHelp?: string
  searchPlaceholder?: string
  browseScopes?: readonly OrganizationLocationTargetBrowseScope[]
}

export type ResolvedOrganizationForwardTargetPresentation = {
  targetLabel: string
  targetHelp?: string
  searchPlaceholder: string
  browseScopes?: readonly OrganizationLocationTargetBrowseScope[]
}

export const DEFAULT_ORGANIZATION_FORWARD_TARGET_PRESENTATION: ResolvedOrganizationForwardTargetPresentation =
  {
    targetLabel: 'Location',
    searchPlaceholder: 'Search locations…',
  }

export const ORGANIZATION_FORWARD_DEFAULT_CHANGE_TARGET_DRAWER_TITLE = 'Change location'

type OrganizationForwardSurfaceCopy = {
  empty: string
  add: string
  addDrawerTitle: string
  addDrawerInstruction: string
  addSubmit: string
  targetPresentation?: OrganizationForwardTargetPresentationConfig
  changeTargetDrawerTitle?: string
}

type OrganizationForwardFamilySurfaceCopy = {
  heading: string
  kindHeading: 'show' | 'omit'
  empty: string
  add: string
  addDrawerHelper?: string
}

export const ORGANIZATION_FORWARD_FAMILY_PRESENTATION = {
  site: {
    heading: 'Sites & facilities',
    kindHeading: 'show',
    empty: 'No site relationships linked.',
    add: 'Add site relationship',
    addDrawerHelper:
      'Connect this organization to a specific site or facility it owns, occupies, operates, or uses as headquarters.',
  },
  geographic_presence: {
    heading: 'Areas of operation',
    kindHeading: 'omit',
    empty: 'No areas of operation linked.',
    add: 'Add area of operation',
  },
  territorial_authority: {
    heading: 'Territorial authority',
    kindHeading: 'show',
    empty: 'No territorial authority linked.',
    add: 'Add territorial authority',
  },
} as const satisfies Record<
  OrganizationLocationConnectionFamily,
  OrganizationForwardFamilySurfaceCopy
>

export const ORGANIZATION_LOCATION_CONNECTION_FAMILY_ORDER: OrganizationLocationConnectionFamily[] =
  ['territorial_authority', 'geographic_presence', 'site']

/** @deprecated Use ORGANIZATION_FORWARD_FAMILY_PRESENTATION or resolveOrganizationForwardFamilyPresentation. */
export const ORGANIZATION_FORWARD_FAMILY_SURFACE_COPY = ORGANIZATION_FORWARD_FAMILY_PRESENTATION

export const ORGANIZATION_FORWARD_SURFACE_COPY = {
  headquarters: {
    empty: 'No headquarters linked.',
    add: 'Add headquarters',
    addDrawerTitle: 'Add headquarters',
    addDrawerInstruction: 'Choose a location for this organization’s headquarters.',
    addSubmit: 'Add headquarters',
    changeTargetDrawerTitle: 'Change headquarters location',
    targetPresentation: {
      targetHelp: 'Choose a structure for this headquarters.',
      searchPlaceholder: 'Search structures…',
    },
  },
  owns: {
    empty: 'No owned locations linked.',
    add: 'Add owned location',
    addDrawerTitle: 'Add owned location',
    addDrawerInstruction: 'Choose a location this organization owns.',
    addSubmit: 'Add owned location',
  },
  tenant: {
    empty: 'No tenancy locations linked.',
    add: 'Add tenancy',
    addDrawerTitle: 'Add tenancy',
    addDrawerInstruction: 'Choose a location where this organization is a tenant.',
    addSubmit: 'Add tenancy',
  },
  operator: {
    empty: 'No operated locations linked.',
    add: 'Add operated location',
    addDrawerTitle: 'Add operated location',
    addDrawerInstruction: 'Choose a location this organization operates.',
    addSubmit: 'Add operated location',
  },
  operates_in: {
    empty: 'No areas of operation linked.',
    add: 'Add area of operation',
    addDrawerTitle: 'Add area of operation',
    addDrawerInstruction: 'Choose a geographic area where this organization operates.',
    addSubmit: 'Add area of operation',
    changeTargetDrawerTitle: 'Change area of operation',
    targetPresentation: {
      targetHelp: 'Choose a settlement or region for this area of operation.',
      browseScopes: ['all', 'settlement', 'region'],
    },
  },
  governs: {
    empty: 'No governed locations linked.',
    add: 'Add governed location',
    addDrawerTitle: 'Add governed location',
    addDrawerInstruction: 'Choose a location this organization governs.',
    addSubmit: 'Add governed location',
    changeTargetDrawerTitle: 'Change governed territory',
  },
  controls: {
    empty: 'No controlled locations linked.',
    add: 'Add controlled location',
    addDrawerTitle: 'Add controlled location',
    addDrawerInstruction: 'Choose a location this organization controls.',
    addSubmit: 'Add controlled location',
    changeTargetDrawerTitle: 'Change controlled territory',
  },
  claims: {
    empty: 'No territorial claims linked.',
    add: 'Add claim',
    addDrawerTitle: 'Add claim',
    addDrawerInstruction: 'Choose a location this organization claims.',
    addSubmit: 'Add claim',
    changeTargetDrawerTitle: 'Change claimed territory',
  },
} satisfies Record<OrganizationLocationConnectionKind, OrganizationForwardSurfaceCopy>

const ORGANIZATION_FORWARD_SURFACE_COPY_BY_KIND: Record<
  OrganizationLocationConnectionKind,
  OrganizationForwardSurfaceCopy
> = ORGANIZATION_FORWARD_SURFACE_COPY

type OrganizationForwardOverflowLabels = {
  viewLocation: string
  changeKind: string
  changeTarget: string
  remove: string
}

export const ORGANIZATION_FORWARD_OVERFLOW_BY_FAMILY = {
  site: {
    viewLocation: 'View location',
    changeKind: 'Change relationship type',
    changeTarget: 'Change location',
    remove: 'Remove relationship',
  },
  geographic_presence: {
    viewLocation: 'View location',
    changeKind: 'Change connection type',
    changeTarget: 'Change area',
    remove: 'Remove area of operation',
  },
  territorial_authority: {
    viewLocation: 'View location',
    changeKind: 'Change authority type',
    changeTarget: 'Change territory',
    remove: 'Remove authority',
  },
} as const satisfies Record<OrganizationLocationConnectionFamily, OrganizationForwardOverflowLabels>

/** @deprecated Use resolveOrganizationForwardOverflowLabels(family) for family-aware copy. */
export const ORGANIZATION_FORWARD_OVERFLOW = ORGANIZATION_FORWARD_OVERFLOW_BY_FAMILY.site

export function resolveOrganizationForwardOverflowLabels(
  family: OrganizationLocationConnectionFamily,
): OrganizationForwardOverflowLabels {
  return ORGANIZATION_FORWARD_OVERFLOW_BY_FAMILY[family]
}

export function resolveOrganizationForwardSurfaceCopy(
  kind: OrganizationLocationConnectionKind,
): OrganizationForwardSurfaceCopy {
  return ORGANIZATION_FORWARD_SURFACE_COPY_BY_KIND[kind]
}

export function resolveOrganizationForwardTargetPresentation(
  kind: OrganizationLocationConnectionKind,
): ResolvedOrganizationForwardTargetPresentation {
  const config = ORGANIZATION_FORWARD_SURFACE_COPY_BY_KIND[kind].targetPresentation

  return {
    targetLabel:
      config?.targetLabel ?? DEFAULT_ORGANIZATION_FORWARD_TARGET_PRESENTATION.targetLabel,
    targetHelp: config?.targetHelp,
    searchPlaceholder:
      config?.searchPlaceholder ??
      DEFAULT_ORGANIZATION_FORWARD_TARGET_PRESENTATION.searchPlaceholder,
    browseScopes: config?.browseScopes,
  }
}

export function resolveOrganizationForwardChangeTargetDrawerTitle(
  kind: OrganizationLocationConnectionKind,
): string {
  return (
    ORGANIZATION_FORWARD_SURFACE_COPY_BY_KIND[kind].changeTargetDrawerTitle ??
    ORGANIZATION_FORWARD_DEFAULT_CHANGE_TARGET_DRAWER_TITLE
  )
}

export function resolveOrganizationForwardChangeTargetEntityLabel(
  intent: OrganizationConnectionDrawerIntent,
): string {
  return intent === 'territorial_authority' ? 'Territory' : 'Location'
}

export function resolveOrganizationForwardAddDrawerTitle(
  kind: OrganizationLocationConnectionKind,
): string {
  return ORGANIZATION_FORWARD_SURFACE_COPY_BY_KIND[kind].addDrawerTitle
}

export function resolveOrganizationForwardAddDrawerInstruction(
  kind: OrganizationLocationConnectionKind,
): string {
  return ORGANIZATION_FORWARD_SURFACE_COPY_BY_KIND[kind].addDrawerInstruction
}

export function resolveOrganizationForwardAddSubmitLabel(
  kind: OrganizationLocationConnectionKind,
): string {
  return ORGANIZATION_FORWARD_SURFACE_COPY_BY_KIND[kind].addSubmit
}

export function resolveOrganizationForwardFamilyPresentation(
  family: OrganizationLocationConnectionFamily,
): OrganizationForwardFamilySurfaceCopy {
  return ORGANIZATION_FORWARD_FAMILY_PRESENTATION[family]
}

export function resolveOrganizationForwardFamilySurfaceCopy(
  family: OrganizationLocationConnectionFamily,
): Pick<OrganizationForwardFamilySurfaceCopy, 'empty' | 'add' | 'addDrawerHelper'> {
  const presentation = ORGANIZATION_FORWARD_FAMILY_PRESENTATION[family]
  return {
    empty: presentation.empty,
    add: presentation.add,
    addDrawerHelper: 'addDrawerHelper' in presentation ? presentation.addDrawerHelper : undefined,
  }
}

export function resolveOrganizationForwardFamilyAddDrawerHelper(
  family: OrganizationLocationConnectionFamily,
): string | undefined {
  const copy: OrganizationForwardFamilySurfaceCopy =
    ORGANIZATION_FORWARD_FAMILY_SURFACE_COPY[family]
  return copy.addDrawerHelper
}
