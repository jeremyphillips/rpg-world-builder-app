import { cva } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import {
  emptyStateWellBodyClasses,
  emptyStateWellSurfaceClasses,
} from './empty-state-well.variants'

export const emptyPanelVariants = cva(
  cn('rounded-md border px-3 py-2.5', emptyStateWellBodyClasses, emptyStateWellSurfaceClasses),
)
