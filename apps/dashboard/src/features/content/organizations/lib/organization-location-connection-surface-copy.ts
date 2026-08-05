import type { OrganizationLocationConnectionKind } from '@rpg/contracts'
import { getOrganizationLocationConnectionLabel } from '@rpg/contracts'

type OrganizationForwardSurfaceCopy = {
  empty: string
  add: string
  addDrawerTitle: string
  addDrawerInstruction: string
  addSubmit: string
}

export const ORGANIZATION_FORWARD_SURFACE_COPY = {
  headquarters: {
    empty: 'No headquarters linked.',
    add: 'Add headquarters',
    addDrawerTitle: 'Add headquarters',
    addDrawerInstruction: 'Choose a location for this organization’s headquarters.',
    addSubmit: 'Add headquarters',
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
  },
  governs: {
    empty: 'No governed locations linked.',
    add: 'Add governed location',
    addDrawerTitle: 'Add governed location',
    addDrawerInstruction: 'Choose a location this organization governs.',
    addSubmit: 'Add governed location',
  },
  controls: {
    empty: 'No controlled locations linked.',
    add: 'Add controlled location',
    addDrawerTitle: 'Add controlled location',
    addDrawerInstruction: 'Choose a location this organization controls.',
    addSubmit: 'Add controlled location',
  },
  claims: {
    empty: 'No territorial claims linked.',
    add: 'Add claim',
    addDrawerTitle: 'Add claim',
    addDrawerInstruction: 'Choose a location this organization claims.',
    addSubmit: 'Add claim',
  },
} as const satisfies Record<OrganizationLocationConnectionKind, OrganizationForwardSurfaceCopy>

export const ORGANIZATION_FORWARD_OVERFLOW = {
  viewLocation: 'View location',
  changeKind: 'Change connection type',
  remove: 'Remove connection',
} as const

export function resolveOrganizationForwardSurfaceCopy(
  kind: OrganizationLocationConnectionKind,
): OrganizationForwardSurfaceCopy {
  return ORGANIZATION_FORWARD_SURFACE_COPY[kind]
}

export function resolveOrganizationForwardAddDrawerTitle(
  kind: OrganizationLocationConnectionKind,
): string {
  return ORGANIZATION_FORWARD_SURFACE_COPY[kind].addDrawerTitle
}

export function resolveOrganizationForwardAddDrawerInstruction(
  kind: OrganizationLocationConnectionKind,
): string {
  return ORGANIZATION_FORWARD_SURFACE_COPY[kind].addDrawerInstruction
}

export function resolveOrganizationForwardAddSubmitLabel(
  kind: OrganizationLocationConnectionKind,
): string {
  return ORGANIZATION_FORWARD_SURFACE_COPY[kind].addSubmit
}

export function resolveOrganizationForwardKindHeading(
  kind: OrganizationLocationConnectionKind,
): string {
  return getOrganizationLocationConnectionLabel(kind)
}
