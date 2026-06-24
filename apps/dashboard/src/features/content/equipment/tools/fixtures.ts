import { loadSeedEquipment } from '@rpg/catalog/equipment'
import type { ToolEquipment } from '@rpg/contracts'

import { STORY_RULESET_ID } from '../../lib/fixtures/constants'

export const THIEVES_TOOLS = loadSeedEquipment(STORY_RULESET_ID).find(
  (item): item is ToolEquipment => item.slug === 'thieves-tools',
)!

export const LUTE = loadSeedEquipment(STORY_RULESET_ID).find(
  (item): item is ToolEquipment => item.slug === 'lute',
)!

export const TOOL_LIST = loadSeedEquipment(STORY_RULESET_ID).filter(
  (item): item is ToolEquipment => item.kind === 'tool',
)
