import {
  indexCharacterBuildCatalog,
  npcStartingChoiceAllowanceSelections,
  npcStartingChoiceIncompleteOverride,
  npcStartingChoiceManualConstraints,
  resolveNpcStartingChoices,
  resolveOrganizationMembershipMetadata,
  type CharacterBuildContext,
} from '@rpg/contracts'

import { titleFromMembershipRadioValue } from '../../../lib/organization-membership/organization-membership-title.lib'
import type { QuickNpcCreateContext } from './quick-npc-create-context'
import {
  prepareQuickNpcCreate,
  type QuickNpcPrepareCreateArgs,
  type QuickNpcPreparedCreate,
  QuickNpcStartingChoiceIncompleteError,
} from './quick-npc-create'
import {
  buildQuickNpcSeed,
  isQuickNpcOrganizationMemberSetup,
  mergeQuickNpcAuthoringValues,
  type QuickNpcAuthoringTabValues,
  type QuickNpcSetupValues,
} from './quick-npc-form-fields'
import { buildQuickNpcAutomaticPreferences } from './quick-npc-template-recommendations.lib'
import { splitQuickNpcAdditionalEquipmentIds } from './quick-npc-additional-equipment.lib'

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
  const { requiredWeaponIds, manualEquipmentGrantIds } = splitQuickNpcAdditionalEquipmentIds({
    additionalEquipmentIds: values.additionalEquipmentIds,
    catalogIndex,
  })
  const startingChoices = resolveNpcStartingChoices({
    context: args.buildContext,
    seed: buildQuickNpcSeed(values),
    startingChoiceOverrides: values.startingChoiceOverrides,
    requiredWeaponIds,
    requiredSpellIds: values.requiredSpellIds,
    preferences,
  })
  const incomplete = npcStartingChoiceIncompleteOverride(startingChoices)
  if (incomplete) {
    throw new QuickNpcStartingChoiceIncompleteError()
  }
  const manualConstraints = npcStartingChoiceManualConstraints(startingChoices)

  return {
    seed: buildQuickNpcSeed(values),
    context: args.buildContext,
    preferences,
    allowanceSelections: npcStartingChoiceAllowanceSelections(startingChoices),
    ...(manualEquipmentGrantIds.length > 0 ? { manualEquipmentGrantIds } : {}),
    ...(manualConstraints ? { constraints: manualConstraints } : {}),
    ...(membership ? { membership } : {}),
  }
}

export function prepareQuickNpcAuthoringCreate(
  args: QuickNpcAuthoringPrepareArgs,
): QuickNpcPreparedCreate {
  return prepareQuickNpcCreate(assembleQuickNpcPrepareCreateArgs(args))
}

/** @deprecated Prefer {@link prepareQuickNpcAuthoringCreate} when narrative needs the resolved draft. */
export function buildQuickNpcAuthoringCreateInput(args: QuickNpcAuthoringPrepareArgs) {
  return prepareQuickNpcAuthoringCreate(args).input
}
