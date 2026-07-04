import { expect } from 'vitest'
import { loadSeedEquipmentByKind } from '@rpg/catalog/equipment'
import { createEquipmentInputSchema, type Equipment, type EquipmentKind } from '@rpg/contracts'
import type { FormItem, GroupConfig } from '@rpg/ui/form'

import { STORY_RULESET_ID } from '../../../lib/fixtures/constants'
import type { EquipmentFormValuesFor } from '../equipment-form-fields'
import { equipmentFormDef } from '../equipment-form-def'

/** Seed equipment of one kind from the fixture ruleset. */
export function seedEquipmentOfKind(kind: EquipmentKind): Equipment[] {
  return loadSeedEquipmentByKind(STORY_RULESET_ID, kind)
}

/** Legends of the top-level group items, in render order. */
export function collectGroupLegends(fields: readonly FormItem[]): string[] {
  return fields
    .filter((field): field is GroupConfig => 'kind' in field && field.kind === 'group')
    .map((field) => field.legend)
}

/**
 * Asserts `buildFields` for a kind composes the shared Identity/Economy groups
 * plus the registered kind group as the last item. Returns the built fields so
 * callers can layer per-family assertions on top.
 */
export function expectComposedKindGroups(
  equipmentKind: EquipmentKind,
  lastLegend: string,
  expectedLegends: readonly string[] = ['Identity', 'Economy', lastLegend],
): FormItem[] {
  const fields = equipmentFormDef.buildFields({ equipmentKind })
  expect(collectGroupLegends(fields)).toEqual(expectedLegends)
  expect(fields.at(-1)).toMatchObject({ kind: 'group', legend: lastLegend })
  return fields
}

/** Seed item → kind-narrowed form values for per-family assertions. */
export function toEquipmentFormValues<K extends EquipmentKind>(
  item: Extract<Equipment, { kind: K }>,
): EquipmentFormValuesFor<K> {
  return equipmentFormDef.toFormValues(item) as EquipmentFormValuesFor<K>
}

/** Asserts the toFormValues → toInput → createEquipmentInputSchema.parse round-trip. */
export function expectSeedRoundTrip(item: Equipment): void {
  const input = equipmentFormDef.toInput(toEquipmentFormValues(item))
  expect(() => createEquipmentInputSchema.parse(input)).not.toThrow()
}
