import type { ReactNode } from 'react'
import type { FieldSize } from '@rpg/ui'

import { EntityCardUtilityFieldSizeContext } from './entity-card-utility-field-size.context'

export function EntityCardUtilityFieldSizeProvider({
  size,
  children,
}: {
  size: FieldSize | null
  children: ReactNode
}) {
  return (
    <EntityCardUtilityFieldSizeContext.Provider value={size}>
      {children}
    </EntityCardUtilityFieldSizeContext.Provider>
  )
}
