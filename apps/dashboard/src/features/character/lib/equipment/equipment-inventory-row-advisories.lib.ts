import {
  resolveCharacterBuildAdvisoriesForDraft,
  type CharacterBuildContext,
  type CharacterBuilderDraft,
  type ChoiceSet,
} from '@rpg/contracts'

import type { EntitySummaryStatusItem } from '@/features/content'

import {
  buildAdvisoryStatusItems,
  indexBuildAdvisoriesByEquipmentId,
  lookupBuildAdvisoriesForEquipment,
} from '../build-advisories/build-advisory-presentation.lib'
import type { EquipmentInventoryRow } from './equipment-step.lib'

export type EquipmentAdvisoryIndex = {
  byEquipmentId: ReturnType<typeof indexBuildAdvisoriesByEquipmentId>
  rulesetId: string
}

/** Advisories for a build, keyed by equipment id. Shared by Builder and Quick NPC projections. */
export function buildEquipmentAdvisoryIndex(args: {
  draft: CharacterBuilderDraft
  context: CharacterBuildContext
  choiceSets: readonly ChoiceSet[]
}): EquipmentAdvisoryIndex {
  return {
    byEquipmentId: indexBuildAdvisoriesByEquipmentId(
      resolveCharacterBuildAdvisoriesForDraft(args.draft, args.context, {
        resolvedChoiceSets: args.choiceSets,
      }),
    ),
    rulesetId: args.context.rulesetId,
  }
}

export function advisoryStatusItemsForEquipment(
  index: EquipmentAdvisoryIndex,
  equipmentId: string,
): EntitySummaryStatusItem[] {
  return buildAdvisoryStatusItems(
    lookupBuildAdvisoriesForEquipment(index.byEquipmentId, equipmentId, index.rulesetId),
  )
}

export function enrichEquipmentInventoryRows(args: {
  rows: readonly EquipmentInventoryRow[]
  draft: CharacterBuilderDraft
  context: CharacterBuildContext
  choiceSets: readonly ChoiceSet[]
}): EquipmentInventoryRow[] {
  const index = buildEquipmentAdvisoryIndex(args)
  return args.rows.map((row) => ({
    ...row,
    advisoryStatusItems: advisoryStatusItemsForEquipment(index, row.entry.equipmentId),
  }))
}
