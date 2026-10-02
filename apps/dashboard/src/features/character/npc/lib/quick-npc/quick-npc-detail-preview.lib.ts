import {
  npcStartingChoiceAllowanceSelections,
  npcStartingChoiceManualConstraints,
  resolveAutomaticNpcBuild,
  resolveAvailableChoices,
  resolveNpcStartingChoices,
  seedAutomaticChoiceDraft,
  indexCharacterBuildCatalog,
  type CharacterBuildContext,
} from '@rpg/contracts'

import { projectCharacterDraftDetailSource } from '../../../lib/display/character-detail-draft-projection.lib'
import type { QuickNpcCreateContext } from './quick-npc-create-context'
import { resolveQuickNpcCreateOrganization } from './quick-npc-create-context'
import { buildQuickNpcAutomaticPreferences } from './quick-npc-template-recommendations.lib'
import { projectQuickNpcEquipmentAllocations } from './quick-npc-equipment-supply.lib'
import { usesQuickNpcClassEquipment } from './quick-npc-equipment-selections.lib'
import { materializeStartingEquipmentGrants } from './quick-npc-create'
import {
  buildQuickNpcSeed,
  mergeQuickNpcAuthoringValues,
  quickNpcAuthoringTabDefaultValues,
  type QuickNpcAuthoringTabFormValues,
  type QuickNpcAuthoringTabValues,
  type QuickNpcSetupValues,
} from './quick-npc-form-fields'

export type ProjectQuickNpcDetailPreviewArgs = {
  setup: QuickNpcSetupValues
  authoringValues?: Partial<QuickNpcAuthoringTabFormValues>
  buildContext: CharacterBuildContext
  createContext: QuickNpcCreateContext
}

export function projectQuickNpcDetailPreview({
  setup,
  authoringValues,
  buildContext,
  createContext,
}: ProjectQuickNpcDetailPreviewArgs) {
  const catalogIndex = indexCharacterBuildCatalog(buildContext.catalog)
  const tabValues = {
    ...quickNpcAuthoringTabDefaultValues,
    ...authoringValues,
  } as QuickNpcAuthoringTabValues
  const merged = mergeQuickNpcAuthoringValues(setup, tabValues)
  const organization = resolveQuickNpcCreateOrganization(createContext)

  const preferences = buildQuickNpcAutomaticPreferences({
    values: merged,
    context: buildContext,
    titles: organization?.members?.titles ?? [],
    organizationClassAffinityIds: organization?.members?.classAffinityIds,
    organizationTemplateId: organization?.members?.npcTemplateId,
  })

  const seed = buildQuickNpcSeed(merged)
  let draft = seedAutomaticChoiceDraft(seed, buildContext, preferences)
  let resolvedChoiceSets = resolveAvailableChoices(draft, buildContext)

  try {
    const classed = usesQuickNpcClassEquipment(merged.classId, merged.level)
    const { requiredWeaponIds, manualEquipmentGrantIds, startingEquipmentGrants } =
      projectQuickNpcEquipmentAllocations({
        equipmentSelections: merged.equipmentSelections,
        catalogIndex,
        classed,
      })
    const startingChoices = resolveNpcStartingChoices({
      context: buildContext,
      seed,
      startingChoiceOverrides: merged.startingChoiceOverrides,
      requiredWeaponIds,
      requiredSpellIds: merged.requiredSpellIds,
      preferences,
    })

    const resolution = resolveAutomaticNpcBuild({
      seed,
      context: buildContext,
      preferences,
      allowanceSelections: npcStartingChoiceAllowanceSelections(startingChoices),
      ...(manualEquipmentGrantIds.length > 0 ? { manualEquipmentGrantIds } : {}),
      ...(npcStartingChoiceManualConstraints(startingChoices)
        ? { constraints: npcStartingChoiceManualConstraints(startingChoices) }
        : {}),
    })

    if (resolution.ok) {
      draft = materializeStartingEquipmentGrants(
        resolution.draft,
        buildContext,
        startingEquipmentGrants,
      )
      resolvedChoiceSets = resolution.resolvedChoiceSets
    }
  } catch {
    // Keep the seeded partial draft — unresolved sections stay empty in the sheet.
  }

  return projectCharacterDraftDetailSource({
    draft,
    context: buildContext,
    catalogIndex,
    resolvedChoiceSets,
    xpProgression: { entries: [] },
  })
}
