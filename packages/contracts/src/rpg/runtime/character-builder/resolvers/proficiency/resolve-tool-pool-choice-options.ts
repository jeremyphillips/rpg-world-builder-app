import type { ToolProficiencyPool } from '../../../../content/lib/grants/proficiency-grant'
import type { ToolProficiencyChoice } from '../../../../content/lib/grants/proficiency-grant-set'
import type { CreatureEquipmentCatalog } from '../../../creature/equipment'
import {
  listToolsMatchingPool,
  toolPoolChoiceOptions,
  type CreatureProficiencyPoolOption,
} from '../../../creature/proficiencies'

/** Expands a tool proficiency pool into sorted ChoiceSet options (catalog ids + labels). */
export function resolveToolPoolChoiceOptions(
  pool: ToolProficiencyPool,
  equipment: CreatureEquipmentCatalog,
  rulesetId: string,
): CreatureProficiencyPoolOption[] {
  return toolPoolChoiceOptions(
    listToolsMatchingPool({
      pool,
      equipment,
      rulesetId,
    }),
  )
}

/** Returns false when the choice cannot produce a valid ChoiceSet at resolve time. */
export function validateToolProficiencyChoiceResolvable(
  choice: Pick<ToolProficiencyChoice, 'choose' | 'pool'>,
  equipment: CreatureEquipmentCatalog,
  rulesetId: string,
): boolean {
  if (!choice.pool || choice.choose <= 0) return false

  const resolvedCount = resolveToolPoolChoiceOptions(choice.pool, equipment, rulesetId).length
  return resolvedCount > 0 && choice.choose <= resolvedCount
}
