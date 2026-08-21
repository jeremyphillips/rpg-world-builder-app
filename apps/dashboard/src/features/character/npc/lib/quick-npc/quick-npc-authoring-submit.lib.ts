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

function resolveQuickNpcMembershipPayload(
  createContext: Extract<QuickNpcCreateContext, { kind: 'organization-member' }>,
  setup: QuickNpcSetupValues,
) {
  const membershipMetadata = resolveOrganizationMembershipMetadata({
    titles: createContext.organization.members?.titles ?? [],
    selectedTitle: titleFromMembershipRadioValue(
      isQuickNpcOrganizationMemberSetup(setup) ? (setup.membershipTitle ?? '') : '',
    ),
  })

  return {
    organizationId: createContext.organization.id,
    ...(membershipMetadata.title !== undefined ? { title: membershipMetadata.title } : {}),
    ...(membershipMetadata.priority !== undefined ? { priority: membershipMetadata.priority } : {}),
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

  return buildQuickNpcCreateInput({
    seed: buildQuickNpcSeed(values),
    context: args.buildContext,
    ...(constraints ? { constraints } : {}),
    ...(membership ? { membership } : {}),
  })
}
