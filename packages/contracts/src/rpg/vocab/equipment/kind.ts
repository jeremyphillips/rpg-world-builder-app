import type { GameTermEntry, VocabularyTerm } from '../types'
import { vocabEnumFromEntries } from '../enum-schema'

// ---------------------------------------------------------------------------
// Equipment kind — discriminant for the unified equipment catalog content type.
// ---------------------------------------------------------------------------

export const EQUIPMENT_KIND_TERM = {
  label: 'Equipment Kind',
  description: 'The top-level type of an equipment catalog item.',
  sentence: {
    singular: 'equipment kind',
    plural: 'equipment kinds',
  },
} as const satisfies VocabularyTerm

export const EQUIPMENT_KIND_ENTRIES = {
  weapon: {
    label: 'Weapon',
    description: 'A weapon item such as a sword, bow, or thrown weapon.',
  },
  armor: {
    label: 'Armor',
    description: 'Armor or a shield used for protection.',
  },
  adventuring_gear: {
    label: 'Adventuring Gear',
    description: 'General equipment used while adventuring.',
    sentence: {
      singular: 'piece of adventuring gear',
      plural: 'pieces of adventuring gear',
    },
  },
  tool: {
    label: 'Tool',
    description: 'A tool set, kit, game set, or musical instrument.',
  },
  mount: {
    label: 'Mount',
    description: 'A rideable animal or similar mount.',
  },
  vehicle: {
    label: 'Vehicle',
    description: 'A land or water vehicle.',
  },
  service: {
    label: 'Service',
    description: 'A purchasable service.',
  },
  magic_item: {
    label: 'Magic Item',
    description: 'A magical item such as a potion, scroll, or wondrous item.',
  },
} as const satisfies Record<string, GameTermEntry>

export const EQUIPMENT_KIND_LABELS = Object.fromEntries(
  Object.entries(EQUIPMENT_KIND_ENTRIES).map(([kind, entry]) => [kind, entry.label]),
) as {
  readonly [Kind in keyof typeof EQUIPMENT_KIND_ENTRIES]: (typeof EQUIPMENT_KIND_ENTRIES)[Kind]['label']
}

export type EquipmentKind = keyof typeof EQUIPMENT_KIND_LABELS

export const EQUIPMENT_KINDS = Object.keys(EQUIPMENT_KIND_LABELS) as [
  EquipmentKind,
  ...EquipmentKind[],
]

export const equipmentKindSchema = vocabEnumFromEntries(EQUIPMENT_KIND_ENTRIES)

/** Returns the display name for an equipment kind. Falls back to the raw value. */
export function getEquipmentKindLabel(kind: string): string {
  return EQUIPMENT_KIND_LABELS[kind as EquipmentKind] ?? kind
}

/** Returns the reference entry for an equipment kind, if known. */
export function getEquipmentKindEntry(kind: string): GameTermEntry | undefined {
  return EQUIPMENT_KIND_ENTRIES[kind as EquipmentKind]
}
