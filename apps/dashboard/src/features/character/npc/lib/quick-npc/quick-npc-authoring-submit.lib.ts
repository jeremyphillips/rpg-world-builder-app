import { resolveOrganizationMembershipMetadata, type CharacterBuildContext } from '@rpg/contracts'

import { titleFromMembershipRadioValue } from '../../../lib/organization-membership/organization-membership-title.lib'
import type { QuickNpcCreateContext } from './quick-npc-create-context'
import { buildQuickNpcCreateInput } from './quick-npc-create'
import {
  buildQuickNpcConstraints,
  buildQuickNpcSeed,
  isQuickNpcOrganizationMemberSetup,
  mergeQuickNpcAuthoringValues,
  type QuickNpcAuthoringTabValues,
  type QuickNpcSetupValues,
} from './quick-npc-form-fields'
import { buildQuickNpcAutomaticPreferences } from './quick-npc-template-recommendations.lib'

function resolveQuickNpcMembershipPayload(
  createContext: Extract<QuickNpcCreateContext, { kind: 'organization-member' }>,
  setup: QuickNpcSetupValues,
) {
  const membershipMetadata = resolveOrganizationMembershipMetadata({
    titles: createContext.organization.members?.titles ?? [],
    selectedMembershipTitleId: titleFromMembershipRadioValue(
      isQuickNpcOrganizationMemberSetup(setup) ? (setup.membershipTitle ?? '') : '',
    ),
  })

  return {
    organizationId: createContext.organization.id,
    ...(membershipMetadata.membershipTitleId !== undefined
      ? { membershipTitleId: membershipMetadata.membershipTitleId }
      : {}),
  }
}

export function buildQuickNpcAuthoringCreateInput(args: {
  createContext: QuickNpcCreateContext
  setup: QuickNpcSetupValues
  tabValues: QuickNpcAuthoringTabValues
  buildContext: CharacterBuildContext
}) {
  const values = mergeQuickNpcAuthoringValues(args.setup, args.tabValues)
  const constraints = buildQuickNpcConstraints(values)
  const membership =
    args.createContext.kind === 'organization-member'
      ? resolveQuickNpcMembershipPayload(args.createContext, args.setup)
      : undefined

  const organization =
    args.createContext.kind === 'organization-member' ? args.createContext.organization : undefined

  const preferences = buildQuickNpcAutomaticPreferences({
    values,
    context: args.buildContext,
    titles: organization?.members?.titles ?? [],
    organizationClassAffinityIds: organization?.members?.classAffinityIds,
    organizationTemplateId: organization?.members?.npcTemplateId,
  })

  return buildQuickNpcCreateInput({
    seed: buildQuickNpcSeed(values),
    context: args.buildContext,
    preferences,
    ...(constraints ? { constraints } : {}),
    ...(membership ? { membership } : {}),
  })
}
