import type {
  CharacterBuildCatalogIndex,
  CharacterBuildContext,
  CharacterBuilderDraft,
} from '@rpg/contracts'
import {
  applyEquipmentStepAction,
  resolveEquipmentAcquisitionBuilderContext,
  standardStartingWealthTableId,
} from '@rpg/contracts'

export function createStorybookApplyMagicItemAcquisition(args: {
  draft: CharacterBuilderDraft
  context: CharacterBuildContext
  catalogIndex: CharacterBuildCatalogIndex
  onDraftChange?: (patch: Partial<CharacterBuilderDraft>) => void
}) {
  return ({
    equipmentId,
    requestedQuantity,
  }: {
    equipmentId: string
    requestedQuantity: number
  }) => {
    const result = applyEquipmentStepAction({
      draft: args.draft,
      catalogIndex: args.catalogIndex,
      acquisitionContext: resolveEquipmentAcquisitionBuilderContext({
        context: args.context,
        catalogIndex: args.catalogIndex,
        startingWealthTableId: standardStartingWealthTableId(args.context.rulesetId),
      }),
      action: { kind: 'acquire_magic_item', equipmentId, requestedQuantity },
    })
    if (result.status !== 'applied') return false
    args.onDraftChange?.(result.patch)
    return true
  }
}
