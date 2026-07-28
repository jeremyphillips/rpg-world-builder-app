import type {
  CharacterBuildCatalogIndex,
  CharacterBuildContext,
  CharacterBuilderDraft,
  Equipment,
  EquipmentBudgetSummary,
} from '@rpg/contracts'

import type { EquipmentInventoryRow } from '../../lib/equipment/equipment-step.lib'
import type { EquipmentOwnedSourceAction } from './equipment-acquisition-panel.lib'

export type EquipmentAcquisitionPanelLayout = 'default' | 'disclosure'

export type EquipmentAcquisitionPanelBodyProps = {
  draft: CharacterBuilderDraft
  context: CharacterBuildContext
  catalogIndex: CharacterBuildCatalogIndex
  equipment: Equipment
  rows: readonly EquipmentInventoryRow[]
  budget?: EquipmentBudgetSummary
  quantity: number
  onQuantityChange: (quantity: number) => void
  isPending?: boolean
  successQuantity?: number
  onSourceAction: (action: EquipmentOwnedSourceAction) => void
  onCommit: (requestedQuantity: number) => void
  layout?: EquipmentAcquisitionPanelLayout
}
