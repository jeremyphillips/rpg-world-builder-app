import { ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE } from '../../../lib/organization-membership/organization-membership-title.lib'
import type {
  QuickNpcCreateContext,
  QuickNpcCreateFormOrganization,
} from './quick-npc-create-context'
import type {
  QuickNpcOrganizationMemberSetupValues,
  QuickNpcSetupValues,
  QuickNpcStandaloneSetupValues,
} from './quick-npc-form-fields'

export const quickNpcTestOrganization = {
  id: 'organization-lantern-guild',
  name: 'Lantern Guild',
  organizationDomain: 'occupational' as const,
}

export function quickNpcOrganizationMemberCreateContext(
  organization: QuickNpcCreateFormOrganization = quickNpcTestOrganization,
): Extract<QuickNpcCreateContext, { kind: 'organization-member' }> {
  return { kind: 'organization-member', organization }
}

export function quickNpcStandaloneCreateContext(): Extract<
  QuickNpcCreateContext,
  { kind: 'standalone' }
> {
  return { kind: 'standalone' }
}

export function quickNpcMemberSetupValues(
  overrides: Partial<QuickNpcOrganizationMemberSetupValues> = {},
): QuickNpcOrganizationMemberSetupValues {
  return {
    contextKind: 'organization-member',
    speciesId: '',
    membershipTitle: undefined,
    classId: '',
    level: 0,
    ...overrides,
  }
}

export function quickNpcStandaloneSetupValues(
  overrides: Partial<QuickNpcStandaloneSetupValues> = {},
): QuickNpcStandaloneSetupValues {
  return {
    contextKind: 'standalone',
    speciesId: '',
    classId: '',
    level: 0,
    ...overrides,
  }
}

export function quickNpcMemberSetupWithNoTitle(
  overrides: Partial<Omit<QuickNpcOrganizationMemberSetupValues, 'membershipTitle'>> = {},
): QuickNpcSetupValues {
  return quickNpcMemberSetupValues({
    membershipTitle: ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE,
    ...overrides,
  })
}
