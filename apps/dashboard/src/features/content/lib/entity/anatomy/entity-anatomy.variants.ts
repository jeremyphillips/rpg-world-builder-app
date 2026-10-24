import { cn, rowAnatomyTracksVariants, type ContentCardDensity } from '@rpg/ui'

/** Embedded EntityAnatomyHost host — anatomy only; collection inset owned by the host. */
export const entityAnatomyHostRootVariants = 'w-full min-w-0'

/** Stretch media cell inner row — top-aligns media within the stretch track. */
export const entityAnatomyMediaCellInnerVariants = 'flex h-full items-start'

export function entityAnatomyVariants({ density }: { density?: ContentCardDensity } = {}) {
  return cn(
    rowAnatomyTracksVariants({ band: 'control' }),
    'dash-entity-anatomy min-w-0 w-full',
    density === 'compact' && 'dash-entity-anatomy--compact',
    density === 'comfortable' && 'dash-entity-anatomy--comfortable',
    density === 'spacious' && 'dash-entity-anatomy--spacious',
  )
}
