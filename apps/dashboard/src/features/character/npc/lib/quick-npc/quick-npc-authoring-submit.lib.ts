import {
  getNpcTemplateEntry,
  npcStartingChoiceAllowanceSelections,
  npcStartingChoiceIncompleteOverride,
  npcStartingChoiceManualConstraints,
  resolveNpcStartingChoices,
  resolveOrganizationMembershipMetadata,
  type CharacterBuildContext,
} from '@rpg/contracts'

import { titleFromMembershipRadioValue } from '../../../lib/organization-membership/organization-membership-title.lib'
import type { QuickNpcCreateContext } from './quick-npc-create-context'
import { buildQuickNpcCreateInput, QuickNpcStartingChoiceIncompleteError } from './quick-npc-create'
import {
  buildQuickNpcSeed,
  isQuickNpcOrganizationMemberSetup,
  mergeQuickNpcAuthoringValues,
  type QuickNpcAuthoringTabValues,
  type QuickNpcSetupValues,
} from './quick-npc-form-fields'
import {
  buildQuickNpcAutomaticPreferences,
  resolveQuickNpcTemplateRecommendations,
} from './quick-npc-template-recommendations.lib'

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

// fallow-ignore-next-line complexity
export function buildQuickNpcAuthoringCreateInput(args: {
  createContext: QuickNpcCreateContext
  setup: QuickNpcSetupValues
  tabValues: QuickNpcAuthoringTabValues
  buildContext: CharacterBuildContext
}) {
  const values = mergeQuickNpcAuthoringValues(args.setup, args.tabValues)
  const membership =
    args.createContext.kind === 'organization-member'
      ? resolveQuickNpcMembershipPayload(args.createContext, args.setup)
      : undefined

  const organization =
    args.createContext.kind === 'organization-member' ? args.createContext.organization : undefined

  const preferenceArgs = {
    values,
    context: args.buildContext,
    titles: organization?.members?.titles ?? [],
    organizationClassAffinityIds: organization?.members?.classAffinityIds,
    organizationTemplateId: organization?.members?.npcTemplateId,
  }
  const preferences = buildQuickNpcAutomaticPreferences(preferenceArgs)
  const recommendations = resolveQuickNpcTemplateRecommendations({
    ...preferenceArgs,
    lockInUserClass: true,
  })
  const templateLabel = recommendations.npcTemplateId
    ? getNpcTemplateEntry(recommendations.npcTemplateId)?.label
    : undefined
  const startingChoices = resolveNpcStartingChoices({
    context: args.buildContext,
    seed: buildQuickNpcSeed(values),
    startingChoiceOverrides: values.startingChoiceOverrides,
    requiredWeaponIds: values.requiredWeaponIds,
    requiredSpellIds: values.requiredSpellIds,
    preferences,
    ...(templateLabel ? { suggestionOwnerLabel: templateLabel } : {}),
  })
  const incomplete = npcStartingChoiceIncompleteOverride(startingChoices)
  if (incomplete) {
    throw new QuickNpcStartingChoiceIncompleteError()
  }
  const manualConstraints = npcStartingChoiceManualConstraints(startingChoices)

  return buildQuickNpcCreateInput({
    seed: buildQuickNpcSeed(values),
    context: args.buildContext,
    preferences,
    allowanceSelections: npcStartingChoiceAllowanceSelections(startingChoices),
    ...(manualConstraints ? { constraints: manualConstraints } : {}),
    ...(membership ? { membership } : {}),
  })
}
