import { describe, expect, it } from 'vitest'

import {
  DEFAULT_ORGANIZATION_FORWARD_TARGET_PRESENTATION,
  ORGANIZATION_FORWARD_DEFAULT_CHANGE_TARGET_DRAWER_TITLE,
  resolveOrganizationForwardChangeTargetDrawerTitle,
  resolveOrganizationForwardTargetPresentation,
} from './organization-location-connection-surface-copy'

describe('organization-location-connection-surface-copy target presentation', () => {
  it('resolves headquarters structure-scoped picker copy and change title', () => {
    expect(resolveOrganizationForwardTargetPresentation('headquarters')).toEqual({
      targetLabel: 'Location',
      targetHelp: 'Choose a structure for this headquarters.',
      searchPlaceholder: 'Search structures…',
      browseScopes: undefined,
    })
    expect(resolveOrganizationForwardChangeTargetDrawerTitle('headquarters')).toBe(
      'Change headquarters location',
    )
  })

  it('resolves operates_in browse scopes without overriding the default placeholder', () => {
    expect(resolveOrganizationForwardTargetPresentation('operates_in')).toEqual({
      targetLabel: 'Location',
      targetHelp: 'Choose a settlement or region where this organization is present.',
      searchPlaceholder: DEFAULT_ORGANIZATION_FORWARD_TARGET_PRESENTATION.searchPlaceholder,
      browseScopes: ['all', 'settlement', 'region'],
    })
  })

  it('falls back to generic defaults for kinds without target presentation config', () => {
    expect(resolveOrganizationForwardTargetPresentation('owns')).toEqual(
      DEFAULT_ORGANIZATION_FORWARD_TARGET_PRESENTATION,
    )
    expect(resolveOrganizationForwardChangeTargetDrawerTitle('owns')).toBe(
      ORGANIZATION_FORWARD_DEFAULT_CHANGE_TARGET_DRAWER_TITLE,
    )
  })
})
