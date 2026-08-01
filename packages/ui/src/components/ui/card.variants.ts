import { cn } from '../../lib/utils'
import { establishSurfaceCurrent } from './surface-current.lib'
import { fieldSurfaceRaisedShadowClasses } from './field-surface.variants'

/** Card corner radius — one step below `rounded-xl`; tune via `--radius-card`. */
export const cardRadiusClasses = 'rounded-card'

/** Default card chrome — border, card fill, and raised surface shadow. */
export const cardSurfaceClasses = cn(
  cardRadiusClasses,
  'border bg-card text-card-foreground',
  establishSurfaceCurrent('card'),
  fieldSurfaceRaisedShadowClasses,
)
