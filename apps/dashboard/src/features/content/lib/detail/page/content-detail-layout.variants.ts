/** Vertical stack for toolbar, hero card, and narrow body column. */
export const contentDetailRootClasses = 'space-y-6'

export const contentDetailToolbarClasses = 'flex justify-end gap-2'

/** Hero card content shell — no padding; text column carries `p-6`. */
export const contentDetailHeroCardContentClasses = 'p-0'

export const contentDetailHeroGridClasses = 'grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-0'

/** Padded inner wrapper for hero title and metadata. */
export const contentDetailHeroMainClasses = 'space-y-8 p-6 md:col-span-2'

/**
 * Hero artwork — square inner edge, rounded outer edge matching the card.
 * Mobile: flat top (below text). Desktop: flat left (beside text).
 */
export const contentDetailHeroImageClasses =
  'w-full rounded-none rounded-bl-xl rounded-br-xl object-cover shadow-sm md:rounded-none md:rounded-tr-xl md:rounded-br-xl'

export const contentDetailHeroCardClasses = 'overflow-hidden'
