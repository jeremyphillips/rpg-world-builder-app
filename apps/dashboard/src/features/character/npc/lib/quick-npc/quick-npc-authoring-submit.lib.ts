import {
  indexCharacterBuildCatalog,
  npcStartingChoiceAllowanceSelections,
  npcStartingChoiceManualConstraints,
  npcStartingChoicePinnedChoiceSetIds,
  resolveNpcStartingChoiceIssues,
  resolveNpcStartingChoices,
  resolveOrganizationMembershipMetadata,
  type CharacterBuildContext,
} from '@rpg/contracts'

import { titleFromMembershipRadioValue } from '../../../lib/organization-membership/organization-membership-title.lib'
import type { QuickNpcCreateContext } from './quick-npc-create-context'
import {
  prepareQuickNpcCreate,
  resolveQuickNpcPreparedDraft,
  type QuickNpcPrepareCreateArgs,
  type QuickNpcPreparedCreate,
} from './quick-npc-create'
import {
  buildQuickNpcSeed,
  isQuickNpcOrganizationMemberSetup,
  mergeQuickNpcAuthoringValues,
  type QuickNpcAuthoringTabValues,
  type QuickNpcSetupValues,
} from './quick-npc-form-fields'
import { buildQuickNpcAutomaticPreferences } from './quick-npc-template-recommendations.lib'
import { projectQuickNpcEquipmentAllocations } from './quick-npc-equipment-supply.lib'
import { usesQuickNpcClassEquipment } from './quick-npc-equipment-selections.lib'
import { normalizeQuickNpcStartingChoiceOverrides } from './quick-npc-starting-choices.lib'

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

export type QuickNpcAuthoringPrepareArgs = {
  createContext: QuickNpcCreateContext
  setup: QuickNpcSetupValues
  tabValues: QuickNpcAuthoringTabValues
  buildContext: CharacterBuildContext
}

// fallow-ignore-next-line complexity
export function assembleQuickNpcPrepareCreateArgs(
  args: QuickNpcAuthoringPrepareArgs,
): QuickNpcPrepareCreateArgs {
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
  const catalogIndex = indexCharacterBuildCatalog(args.buildContext.catalog)
  const classed = usesQuickNpcClassEquipment(values.classId, values.level)
  const { startingEquipmentGrants } = projectQuickNpcEquipmentAllocations({
    equipmentSelections: values.equipmentSelections,
    catalogIndex,
    classed,
  })
  const startingChoiceOverrides = normalizeQuickNpcStartingChoiceOverrides({
    setup: args.setup,
    context: args.buildContext,
    createContext: args.createContext,
    overrides: values.startingChoiceOverrides,
    requiredSpellIds: values.requiredSpellIds,
  })
  const startingChoices = resolveNpcStartingChoices({
    context: args.buildContext,
    seed: buildQuickNpcSeed(values),
    startingChoiceOverrides,
    classPackage: values.classPackage,
    requiredSpellIds: values.requiredSpellIds,
    preferences,
  })
  const startingChoiceIssues = resolveNpcStartingChoiceIssues(startingChoices)
  const manualConstraints = npcStartingChoiceManualConstraints(startingChoices)

  return {
    seed: buildQuickNpcSeed(values),
    context: args.buildContext,
    preferences,
    allowanceSelections: npcStartingChoiceAllowanceSelections(startingChoices),
    pinnedChoiceSetIds: npcStartingChoicePinnedChoiceSetIds(startingChoices),
    ...(startingEquipmentGrants.length > 0 ? { startingEquipmentGrants } : {}),
    ...(manualConstraints ? { constraints: manualConstraints } : {}),
    classPackage: values.classPackage,
    ...(membership ? { membership } : {}),
    fallbackDraft: startingChoices.draft,
    fallbackResolvedChoiceSets: startingChoices.resolvedChoiceSets,
    startingChoiceIssues,
  }
}

export function prepareQuickNpcAuthoringCreate(
  args: QuickNpcAuthoringPrepareArgs,
): QuickNpcPreparedCreate {
  return prepareQuickNpcCreate(assembleQuickNpcPrepareCreateArgs(args))
}

export function resolveQuickNpcAuthoringPreparedDraft(args: QuickNpcAuthoringPrepareArgs) {
  return resolveQuickNpcPreparedDraft(assembleQuickNpcPrepareCreateArgs(args))
}
