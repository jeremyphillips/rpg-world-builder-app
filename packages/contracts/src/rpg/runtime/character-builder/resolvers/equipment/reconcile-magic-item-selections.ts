import type { CharacterBuilderDraft } from '../../draft'
import type { MagicItemGrantSelection } from '../../magic-item-selection'
import { magicItemGrantSelectionKey } from '../../magic-item-selection'
import { cloneEquipmentDraftChannel } from './equipment-draft-base'

export function reconcileMagicItemSelections(args: {
  draft: CharacterBuilderDraft
  remove: ReadonlyArray<{ allowanceId: string; equipmentId: string }>
}): CharacterBuilderDraft {
  const { draft, remove } = args
  const current = draft.equipment?.magicItemSelections ?? []

  if (remove.length === 0 || current.length === 0) return draft

  const removeKeys = new Set(remove.map((entry) => magicItemGrantSelectionKey(entry)))
  const magicItemSelections = current.filter(
    (row) => !removeKeys.has(magicItemGrantSelectionKey(row)),
  )

  if (magicItemSelections.length === current.length) return draft

  return {
    ...draft,
    equipment: cloneEquipmentDraftChannel(draft, { magicItemSelections }),
  }
}

export function upsertMagicItemGrantSelection(args: {
  selections: readonly MagicItemGrantSelection[]
  allowanceId: string
  equipmentId: string
  quantity: number
}): MagicItemGrantSelection[] {
  const { allowanceId, equipmentId, quantity } = args
  const key = magicItemGrantSelectionKey({ allowanceId, equipmentId })
  const without = args.selections.filter((row) => magicItemGrantSelectionKey(row) !== key)

  if (quantity <= 0) return without

  return [...without, { allowanceId, equipmentId, quantity }]
}

export function applyGrantAllocationsToSelections(args: {
  selections: readonly MagicItemGrantSelection[]
  equipmentId: string
  grantAllocations: ReadonlyArray<{ allowanceId: string; quantity: number }>
  merge?: boolean
}): MagicItemGrantSelection[] {
  const { equipmentId, grantAllocations, merge = true } = args
  let next = [...args.selections]

  for (const allocation of grantAllocations) {
    const existing = next.find(
      (row) => row.allowanceId === allocation.allowanceId && row.equipmentId === equipmentId,
    )
    const quantity = merge ? (existing?.quantity ?? 0) + allocation.quantity : allocation.quantity

    next = upsertMagicItemGrantSelection({
      selections: next,
      allowanceId: allocation.allowanceId,
      equipmentId,
      quantity,
    })
  }

  return next
}
