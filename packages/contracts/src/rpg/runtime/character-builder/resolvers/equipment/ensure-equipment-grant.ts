import type { CharacterBuildCatalogIndex } from '../../context'
import type { CharacterBuilderDraft, EquipmentGrantContribution } from '../../draft/draft'
import { cloneEquipmentDraftChannel } from './equipment-draft-base'

export type EnsureEquipmentGrantFailure = {
  ok: false
  reason: 'equipment_not_in_catalog'
}

export type EnsureEquipmentGrantSuccess = {
  ok: true
  draft: CharacterBuilderDraft
}

export type EnsureEquipmentGrantResult = EnsureEquipmentGrantSuccess | EnsureEquipmentGrantFailure

/**
 * Writes the draft grant channel for `equipmentId`.
 * `ensure` raises the stored quantity. `additional` replaces it with the
 * caller's additive amount. Callers must enforce availability first.
 * Never consults purchase affordability or budget planners.
 */
export function ensureEquipmentGrant(args: {
  draft: CharacterBuilderDraft
  equipmentId: string
  quantity: number
  catalogIndex: CharacterBuildCatalogIndex
  contribution?: EquipmentGrantContribution
}): EnsureEquipmentGrantResult {
  const { draft, equipmentId, quantity, catalogIndex } = args

  if (!catalogIndex.equipment.get(equipmentId)) {
    return { ok: false, reason: 'equipment_not_in_catalog' }
  }

  const grants = [...(draft.equipment?.grants ?? [])]
  const existingIndex = grants.findIndex((grant) => grant.equipmentId === equipmentId)

  if (existingIndex >= 0) {
    const existing = grants[existingIndex]!
    grants[existingIndex] =
      args.contribution === 'additional'
        ? { equipmentId, quantity, contribution: 'additional' }
        : {
            equipmentId: existing.equipmentId,
            quantity: Math.max(existing.quantity, quantity),
            ...(existing.contribution ? { contribution: existing.contribution } : {}),
          }
  } else {
    grants.push({
      equipmentId,
      quantity,
      ...(args.contribution ? { contribution: args.contribution } : {}),
    })
  }

  return {
    ok: true,
    draft: {
      ...draft,
      equipment: cloneEquipmentDraftChannel(draft, { grants }),
    },
  }
}
