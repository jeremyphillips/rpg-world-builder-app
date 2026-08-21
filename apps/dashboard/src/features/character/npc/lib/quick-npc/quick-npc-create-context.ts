import type {
  OrganizationDomain,
  OrganizationForm,
  OrganizationFunction,
  OrganizationMembershipTitleDefinition,
  OrganizationPractice,
} from '@rpg/contracts'

import type { ContentCreateContext } from '@/lib/create-flow'

export const QUICK_NPC_CREATE_SUBMIT_LABEL = 'Create NPC' as const

export type QuickNpcCreateFormOrganization = {
  id: string
  name: string
  organizationDomain: OrganizationDomain
  organizationForm?: OrganizationForm
  functions?: readonly OrganizationFunction[]
  practices?: readonly OrganizationPractice[]
  members?: {
    classAffinityIds?: readonly string[]
    speciesAffinityIds?: readonly string[]
    titles?: readonly OrganizationMembershipTitleDefinition[]
  }
}

export type QuickNpcCreateContext =
  | { kind: 'standalone' }
  | { kind: 'organization-member'; organization: QuickNpcCreateFormOrganization }

export function isQuickNpcOrganizationMemberContext(
  context: QuickNpcCreateContext,
): context is Extract<QuickNpcCreateContext, { kind: 'organization-member' }> {
  return context.kind === 'organization-member'
}

export function resolveQuickNpcCreateRemountKey(
  context: QuickNpcCreateContext,
  campaignId: string,
): string {
  if (context.kind === 'organization-member') {
    return context.organization.id
  }
  return `standalone:${campaignId}`
}

export function resolveQuickNpcCreateOrganization(
  context: QuickNpcCreateContext,
): QuickNpcCreateFormOrganization | undefined {
  return context.kind === 'organization-member' ? context.organization : undefined
}

/** Lossy map — relationship-target semantics do not flow into Quick NPC context today. */
export function mapContentCreateContextToQuickNpcCreateContext(
  context: ContentCreateContext,
): QuickNpcCreateContext {
  if (context.kind === 'standalone') {
    return { kind: 'standalone' }
  }

  return { kind: 'standalone' }
}
