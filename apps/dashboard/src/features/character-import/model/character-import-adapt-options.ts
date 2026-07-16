import { loadSeedEquipment } from '@rpg/catalog/equipment'
import { loadSeedSpells } from '@rpg/catalog/spells'
import {
  createDndBeyondEquipmentNameIndex,
  createDndBeyondSpellNameIndex,
  DND_BEYOND_SRD_TOOL_RULESET_ID,
  type AdaptDndBeyondCharacterOptions,
  type DndBeyondEquipmentNameIndex,
  type DndBeyondSpellNameIndex,
} from '@rpg/contracts/character-import'

export function buildCharacterImportEquipmentNameIndex(): DndBeyondEquipmentNameIndex {
  return createDndBeyondEquipmentNameIndex(
    loadSeedEquipment(DND_BEYOND_SRD_TOOL_RULESET_ID).map((item) => ({
      name: item.name,
      slug: item.slug,
    })),
  )
}

export function buildCharacterImportSpellNameIndex(): DndBeyondSpellNameIndex {
  return createDndBeyondSpellNameIndex(
    loadSeedSpells(DND_BEYOND_SRD_TOOL_RULESET_ID).map((spell) => ({
      name: spell.name,
      slug: spell.slug,
    })),
  )
}

export function createCharacterImportAdaptOptions(): AdaptDndBeyondCharacterOptions {
  return {
    equipmentNameIndex: buildCharacterImportEquipmentNameIndex(),
    spellNameIndex: buildCharacterImportSpellNameIndex(),
  }
}
