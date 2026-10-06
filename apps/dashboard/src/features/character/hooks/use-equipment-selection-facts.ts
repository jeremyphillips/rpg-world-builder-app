import { useContext } from 'react'

import { EquipmentSelectionFactsContext } from '../components/equipment/selection-facts/equipment-selection-facts-context'
import type { EquipmentSelectionFacts } from '../lib/equipment/equipment-selection-facts.lib'

/** Facts from the nearest provider; empty outside one. Read by sections, never by rows. */
export function useEquipmentSelectionFacts(): EquipmentSelectionFacts {
  return useContext(EquipmentSelectionFactsContext)
}
