import type { ReactNode } from 'react'

import type { EquipmentSelectionFacts } from '../../../lib/equipment/equipment-selection-facts.lib'
import { EquipmentSelectionFactsContext } from './equipment-selection-facts-context'

/** Step-draft equipment facts for inventory and package sections below the equipment step. */
export function EquipmentSelectionFactsProvider({
  facts,
  children,
}: {
  facts: EquipmentSelectionFacts
  children: ReactNode
}) {
  return (
    <EquipmentSelectionFactsContext.Provider value={facts}>
      {children}
    </EquipmentSelectionFactsContext.Provider>
  )
}
