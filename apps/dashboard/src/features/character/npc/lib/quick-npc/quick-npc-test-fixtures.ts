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
  members: {
    classAffinityIds: [] as string[],
    speciesAffinityIds: [] as string[],
    titles: [
      {
        id: 'omt_guildmaster',
        label: 'Guildmaster',
        description: 'Head of the guild.',
        priority: 50 as const,
        npcRecommendation: { templateId: 'criminal' as const, level: 5 },
      },
    ],
  },
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

export function quickNpcMemberSetupWithChosenTitle(
  overrides: Partial<Omit<QuickNpcOrganizationMemberSetupValues, 'membershipTitle'>> = {},
): QuickNpcSetupValues {
  return quickNpcMemberSetupValues({
    membershipTitle: 'omt_guildmaster',
    ...overrides,
  })
}

/** @deprecated Use {@link quickNpcMemberSetupWithChosenTitle}. */
export const quickNpcMemberSetupWithNoTitle = quickNpcMemberSetupWithChosenTitle
