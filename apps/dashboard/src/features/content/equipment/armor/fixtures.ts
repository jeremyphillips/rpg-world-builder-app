import { loadSeedEquipment } from '@rpg/catalog/equipment'
import type { ArmorEquipment } from '@rpg/contracts'

import { STORY_RULESET_ID } from '../../lib/fixtures/constants'

export const LEATHER = loadSeedEquipment(STORY_RULESET_ID).find(
  (item): item is ArmorEquipment => item.slug === 'leather-armor',
)!

export const PLATE = loadSeedEquipment(STORY_RULESET_ID).find(
  (item): item is ArmorEquipment => item.slug === 'plate-armor',
)!

export const SHIELD = loadSeedEquipment(STORY_RULESET_ID).find(
  (item): item is ArmorEquipment => item.slug === 'shield',
)!

export const ARMOR_LIST = loadSeedEquipment(STORY_RULESET_ID).filter(
  (item): item is ArmorEquipment => item.kind === 'armor',
)
