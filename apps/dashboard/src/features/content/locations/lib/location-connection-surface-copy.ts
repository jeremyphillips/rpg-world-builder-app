import type {
  CharacterLocationConnectionKind,
  Location,
  OrganizationLocationConnectionKind,
} from '@rpg/contracts'
import {
  getOrganizationLocationConnectionDisplayLabel,
  getOrganizationLocationConnectionLabel,
  resolveLocationClassificationDisplay,
} from '@rpg/contracts'

export const TERRITORIAL_AUTHORITY_SECTION_HEADING = 'Territorial Authority'

export const TERRITORIAL_AUTHORITY_SECTION_HELPER =
  'Organizations that govern, control, or claim this location.'

export const TERRITORIAL_AUTHORITY_SECTION_EMPTY = 'No territorial authority recorded.'

type LocationInverseOrganizationSurfaceCopy = {
  empty: string
  add: string
  addDrawerTitle: string
  addDrawerInstruction: string
  addSubmit: string
}

export const LOCATION_INVERSE_ORGANIZATION_SURFACE_COPY = {
  governs: {
    empty: 'No governing organization.',
    add: 'Add governing organization',
    addDrawerTitle: 'Add governing organization',
    addDrawerInstruction: 'Choose an organization to govern this location.',
    addSubmit: 'Add governing organization',
  },
  controls: {
    empty: 'No controlling organization.',
    add: 'Add organization',
    addDrawerTitle: 'Add controlling organization',
    addDrawerInstruction: 'Choose an organization with effective control of this location.',
    addSubmit: 'Add controlling organization',
  },
  claims: {
    empty: 'No organizations claim this location.',
    add: 'Add claim',
    addDrawerTitle: 'Add claim',
    addDrawerInstruction: 'Choose an organization that claims this location.',
    addSubmit: 'Add claim',
  },
  operates_in: {
    empty: 'No organizations operate here.',
    add: 'Add organization presence',
    addDrawerTitle: 'Add organization presence',
    addDrawerInstruction: 'Choose an organization that operates in this location.',
    addSubmit: 'Add organization presence',
  },
  headquarters: {
    empty: 'No headquarters organization linked.',
    add: 'Add organization',
    addDrawerTitle: 'Add headquarters organization',
    addDrawerInstruction: 'Choose the headquarters organization for this location.',
    addSubmit: 'Add headquarters organization',
  },
  owns: {
    empty: 'No owners linked.',
    add: 'Add owner',
    addDrawerTitle: 'Add owner',
    addDrawerInstruction: 'Choose an organization that owns this location.',
    addSubmit: 'Add owner',
  },
  tenant: {
    empty: 'No tenants linked.',
    add: 'Add tenant',
    addDrawerTitle: 'Add tenant',
    addDrawerInstruction: 'Choose an organization that tenants this location.',
    addSubmit: 'Add tenant',
  },
  operator: {
    empty: 'No operators linked.',
    add: 'Add operator',
    addDrawerTitle: 'Add operator',
    addDrawerInstruction: 'Choose an organization that operates this location.',
    addSubmit: 'Add operator',
  },
} as const satisfies Record<
  OrganizationLocationConnectionKind,
  LocationInverseOrganizationSurfaceCopy
>

export const LOCATION_INVERSE_CHARACTER_SURFACE_COPY = {
  owns: {
    empty: 'No owners linked.',
    add: 'Add owner',
    addDrawerTitle: 'Add owner',
    addDrawerInstruction: 'Choose a character who owns this location.',
    addSubmit: 'Add owner',
  },
  tenant: {
    empty: 'No tenants linked.',
    add: 'Add tenant',
    addDrawerTitle: 'Add tenant',
    addDrawerInstruction: 'Choose a character who tenants this location.',
    addSubmit: 'Add tenant',
  },
  resides_at: {
    empty: 'No residents linked.',
    add: 'Add resident',
    addDrawerTitle: 'Add resident',
    addDrawerInstruction: 'Choose a character who resides at this location.',
    addSubmit: 'Add resident',
  },
  operator: {
    empty: 'No operators linked.',
    add: 'Add operator',
    addDrawerTitle: 'Add operator',
    addDrawerInstruction: 'Choose a character who operates this location.',
    addSubmit: 'Add operator',
  },
  works_at: {
    empty: 'No characters work here.',
    add: 'Add worker',
    addDrawerTitle: 'Add worker',
    addDrawerInstruction: 'Choose a character who works at this location.',
    addSubmit: 'Add worker',
  },
} as const satisfies Record<CharacterLocationConnectionKind, LocationInverseOrganizationSurfaceCopy>

export const TERRITORIAL_AUTHORITY_SLOT_COPY = {
  governs: {
    heading: getOrganizationLocationConnectionDisplayLabel('governs', 'inverse'),
    ...LOCATION_INVERSE_ORGANIZATION_SURFACE_COPY.governs,
  },
  controls: {
    heading: getOrganizationLocationConnectionDisplayLabel('controls', 'inverse'),
    ...LOCATION_INVERSE_ORGANIZATION_SURFACE_COPY.controls,
  },
  claims: {
    heading: getOrganizationLocationConnectionDisplayLabel('claims', 'inverse'),
    ...LOCATION_INVERSE_ORGANIZATION_SURFACE_COPY.claims,
  },
} as const

export const TERRITORIAL_AUTHORITY_DRAWER = {
  organizationSearchPlaceholder: 'Search organizations…',
  organizationNoResults: 'No organizations found.',
  changeKindTitle: 'Change authority type',
  changeKindSubmit: 'Change authority',
  replaceTitle: 'Replace organization',
  replaceSelectedLabel: 'Selected',
  replaceHelper: 'Choose a different organization.',
  replaceSubmit: 'Replace organization',
  duplicateClaimReason: 'Already claims this location.',
} as const

export const TERRITORIAL_AUTHORITY_OVERFLOW = {
  viewOrganization: 'View organization',
  changeKind: 'Change authority type',
  replaceOrganization: 'Replace organization',
  remove: 'Remove authority',
} as const

export const LOCATION_INVERSE_PEOPLE_OVERFLOW = {
  viewOrganization: 'View organization',
  viewCharacter: 'View character',
  changeKind: 'Change connection type',
  remove: 'Remove connection',
} as const

export const LOCATION_INVERSE_ORGANIZATION_DRAWER = {
  replaceTitle: 'Replace organization',
  replaceSubmit: 'Replace organization',
  replaceHelper: 'Choose a different organization.',
} as const

export type LocationInverseTargetPresentationConfig = {
  targetLabel?: string
  targetHelp?: string
  searchPlaceholder?: string
}

export type ResolvedLocationInverseTargetPresentation = {
  targetLabel: string
  targetHelp?: string
  searchPlaceholder: string
}

export const DEFAULT_LOCATION_INVERSE_ORGANIZATION_TARGET_PRESENTATION: ResolvedLocationInverseTargetPresentation =
  {
    targetLabel: 'Organization',
    searchPlaceholder: 'Search organizations…',
  }

export const DEFAULT_LOCATION_INVERSE_CHARACTER_TARGET_PRESENTATION: ResolvedLocationInverseTargetPresentation =
  {
    targetLabel: 'Character',
    searchPlaceholder: 'Search characters…',
  }

export function resolveLocationInverseOrganizationTargetPresentation(
  kind?: OrganizationLocationConnectionKind | null,
): ResolvedLocationInverseTargetPresentation {
  if (kind && isTerritorialAuthorityKind(kind)) {
    return {
      targetLabel: 'Organization',
      searchPlaceholder: TERRITORIAL_AUTHORITY_DRAWER.organizationSearchPlaceholder,
    }
  }

  return DEFAULT_LOCATION_INVERSE_ORGANIZATION_TARGET_PRESENTATION
}

export function resolveLocationInverseOrganizationReplaceHelper(
  kind: OrganizationLocationConnectionKind,
): string {
  if (isTerritorialAuthorityKind(kind)) {
    return TERRITORIAL_AUTHORITY_DRAWER.replaceHelper
  }

  return LOCATION_INVERSE_ORGANIZATION_DRAWER.replaceHelper
}

export function resolveLocationInverseCharacterTargetPresentation(
  _kind?: CharacterLocationConnectionKind | null,
): ResolvedLocationInverseTargetPresentation {
  return DEFAULT_LOCATION_INVERSE_CHARACTER_TARGET_PRESENTATION
}

export function resolveLocationInverseCharacterAddDrawerTitle(
  kind: CharacterLocationConnectionKind,
): string {
  return LOCATION_INVERSE_CHARACTER_SURFACE_COPY[kind].addDrawerTitle
}

export function resolveLocationInverseCharacterAddDrawerInstruction(
  kind: CharacterLocationConnectionKind,
): string {
  return LOCATION_INVERSE_CHARACTER_SURFACE_COPY[kind].addDrawerInstruction
}

export function resolveLocationInverseCharacterAddSubmitLabel(
  kind: CharacterLocationConnectionKind,
): string {
  return LOCATION_INVERSE_CHARACTER_SURFACE_COPY[kind].addSubmit
}

export function resolveLocationInverseOrganizationSurfaceCopy(
  kind: OrganizationLocationConnectionKind,
): LocationInverseOrganizationSurfaceCopy {
  return LOCATION_INVERSE_ORGANIZATION_SURFACE_COPY[kind]
}

export function resolveLocationInverseOrganizationAddDrawerTitle(
  kind: OrganizationLocationConnectionKind,
): string {
  return LOCATION_INVERSE_ORGANIZATION_SURFACE_COPY[kind].addDrawerTitle
}

export function resolveLocationInverseOrganizationAddDrawerInstruction(
  kind: OrganizationLocationConnectionKind,
): string {
  return LOCATION_INVERSE_ORGANIZATION_SURFACE_COPY[kind].addDrawerInstruction
}

export function resolveLocationInverseOrganizationAddSubmitLabel(
  kind: OrganizationLocationConnectionKind,
): string {
  return LOCATION_INVERSE_ORGANIZATION_SURFACE_COPY[kind].addSubmit
}

export function resolveLocationConnectionContext(location: Location): string {
  return `${location.name} · ${resolveLocationClassificationDisplay(location).text}`
}

export function resolveTerritorialAuthorityReplaceContext(
  location: Location,
  kind: OrganizationLocationConnectionKind,
): string {
  return `${resolveLocationConnectionContext(location)} · ${getOrganizationLocationConnectionDisplayLabel(kind, 'inverse')}`
}

export function resolveTerritorialAuthorityChangeKindCurrent(input: {
  organizationName: string
  kind: OrganizationLocationConnectionKind
}): string {
  return `${input.organizationName} · ${getOrganizationLocationConnectionDisplayLabel(input.kind, 'inverse')}`
}

export function resolveTerritorialKindOccupiedReason(input: {
  kind: Extract<OrganizationLocationConnectionKind, 'governs' | 'controls'>
  occupantName: string
}): string {
  if (input.kind === 'governs') {
    return `${input.occupantName} currently governs this location.`
  }
  return `${input.occupantName} currently controls this location.`
}

export function resolveTerritorialRemoveConfirmation(input: {
  organizationName: string
  kind: OrganizationLocationConnectionKind
  locationName: string
}): { heading: string; body: string; confirm: string } {
  const kindLabel = getOrganizationLocationConnectionLabel(input.kind).toLowerCase()
  return {
    heading: 'Remove territorial authority?',
    body: `Remove ${input.organizationName} as a ${kindLabel} authority for ${input.locationName}?`,
    confirm: TERRITORIAL_AUTHORITY_OVERFLOW.remove,
  }
}

export function isTerritorialAuthorityKind(
  kind: OrganizationLocationConnectionKind,
): kind is Extract<OrganizationLocationConnectionKind, 'governs' | 'controls' | 'claims'> {
  return kind === 'governs' || kind === 'controls' || kind === 'claims'
}
