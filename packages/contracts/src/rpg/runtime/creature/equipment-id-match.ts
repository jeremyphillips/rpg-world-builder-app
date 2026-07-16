import type { Equipment } from '../../content/equipment'

import { toEquipmentContentId } from './equipment'

/** Matches a catalog equipment row against a slug, bare id, or ruleset-qualified reference. */
export function equipmentIdMatchesReference(args: {
  reference: string
  equipment: Equipment
  rulesetId: string
}): boolean {
  const { reference, equipment, rulesetId } = args

  return (
    reference === equipment.id ||
    reference === equipment.slug ||
    toEquipmentContentId(rulesetId, reference) === equipment.id
  )
}

/** Resolves a reference to a catalog equipment row when present. */
export function resolveEquipmentByReference(args: {
  reference: string
  equipment: ReadonlyMap<string, Equipment>
  rulesetId: string
}): Equipment | undefined {
  const { reference, equipment, rulesetId } = args

  const direct = equipment.get(reference)
  if (direct) return direct

  const contentId = toEquipmentContentId(rulesetId, reference)
  const byContentId = equipment.get(contentId)
  if (byContentId) return byContentId

  for (const row of equipment.values()) {
    if (equipmentIdMatchesReference({ reference, equipment: row, rulesetId })) return row
  }

  return undefined
}
