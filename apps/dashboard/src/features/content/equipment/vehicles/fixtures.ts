import { loadSeedEquipment } from '@rpg/catalog/equipment'
import type { VehicleEquipment } from '@rpg/contracts'

import { STORY_RULESET_ID } from '../../lib/fixtures/constants'

export const ROWBOAT = loadSeedEquipment(STORY_RULESET_ID).find(
  (item): item is VehicleEquipment => item.slug === 'rowboat',
)!

export const GALLEY = loadSeedEquipment(STORY_RULESET_ID).find(
  (item): item is VehicleEquipment => item.slug === 'galley',
)!

export const VEHICLE_LIST = loadSeedEquipment(STORY_RULESET_ID).filter(
  (item): item is VehicleEquipment => item.kind === 'vehicle',
)
