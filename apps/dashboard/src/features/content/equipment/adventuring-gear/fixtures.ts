import { loadSeedEquipment } from '@rpg/catalog/equipment'
import type { AdventuringGearEquipment } from '@rpg/contracts'

import { STORY_RULESET_ID } from '../../lib/fixtures/constants'

export const TORCH = loadSeedEquipment(STORY_RULESET_ID).find(
  (item): item is AdventuringGearEquipment => item.slug === 'torch',
)!

export const ARROWS = loadSeedEquipment(STORY_RULESET_ID).find(
  (item): item is AdventuringGearEquipment => item.slug === 'arrows',
)!

export const ADVENTURING_GEAR_LIST = loadSeedEquipment(STORY_RULESET_ID).filter(
  (item): item is AdventuringGearEquipment => item.kind === 'adventuring_gear',
)
