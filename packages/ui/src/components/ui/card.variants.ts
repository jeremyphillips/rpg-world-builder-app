import { cn } from '../../lib/utils'
import { fieldSurfaceRaisedShadowClasses } from './field-surface.variants'

/** Default card chrome — border, card fill, and raised surface shadow. */
export const cardSurfaceClasses = cn(
  'rounded-xl border bg-card text-card-foreground',
  fieldSurfaceRaisedShadowClasses,
)
