import { createContext } from 'react'
import type { FieldSize } from '@rpg/ui'

export const EntityCardUtilityFieldSizeContext = createContext<FieldSize | null>(null)
