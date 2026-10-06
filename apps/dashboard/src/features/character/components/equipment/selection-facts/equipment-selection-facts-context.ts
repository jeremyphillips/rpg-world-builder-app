import { createContext } from 'react'

import {
  EMPTY_EQUIPMENT_SELECTION_FACTS,
  type EquipmentSelectionFacts,
} from '../../../lib/equipment/equipment-selection-facts.lib'

export const EquipmentSelectionFactsContext = createContext<EquipmentSelectionFacts>(
  EMPTY_EQUIPMENT_SELECTION_FACTS,
)
