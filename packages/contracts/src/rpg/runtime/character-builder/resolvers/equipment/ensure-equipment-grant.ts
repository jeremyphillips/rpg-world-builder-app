import type { CharacterBuildCatalogIndex } from '../../context'
import type { CharacterBuilderDraft } from '../../draft/draft'
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
 * Ensures the draft's grant channel targets at least `quantity` for `equipmentId`.
 * Acquisition semantics only — callers must enforce campaign/content availability
 * before invoking. Never consults purchase affordability or budget planners.
 */
export function ensureEquipmentGrant(args: {
  draft: CharacterBuilderDraft
  equipmentId: string
  quantity: number
  catalogIndex: CharacterBuildCatalogIndex
}): EnsureEquipmentGrantResult {
  const { draft, equipmentId, quantity, catalogIndex } = args

  if (!catalogIndex.equipment.get(equipmentId)) {
    return { ok: false, reason: 'equipment_not_in_catalog' }
  }

  const grants = [...(draft.equipment?.grants ?? [])]
  const existingIndex = grants.findIndex((grant) => grant.equipmentId === equipmentId)

  if (existingIndex >= 0) {
    const existing = grants[existingIndex]!
    grants[existingIndex] = {
      equipmentId: existing.equipmentId,
      quantity: Math.max(existing.quantity, quantity),
    }
  } else {
    grants.push({ equipmentId, quantity })
  }

  return {
    ok: true,
    draft: {
      ...draft,
      equipment: cloneEquipmentDraftChannel(draft, { grants }),
    },
  }
}
