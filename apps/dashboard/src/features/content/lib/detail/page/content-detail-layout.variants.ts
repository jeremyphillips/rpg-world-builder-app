/** Vertical stack for toolbar, hero card, and narrow body column. */
export const contentDetailRootClasses = 'space-y-6'

export const contentDetailToolbarClasses = 'flex justify-end gap-2'

/** Hero card content shell — no padding; text column carries `p-6`. */
export const contentDetailHeroCardContentClasses = 'p-0'

export const contentDetailHeroGridClasses = 'grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-0'

/** Padded inner wrapper for hero title and metadata. */
export const contentDetailHeroMainClasses = 'space-y-8 p-6 md:col-span-2'

/** Hero image column — stretches with the text column on desktop. */
export const contentDetailHeroImageShellClasses = 'flex w-full min-h-0 md:h-full md:flex-col'

/**
 * Hero artwork clip shell — outer corners use `rounded-card`; inner edge stays
 * square where the image meets text. Mobile keeps a 4:3 block; desktop fills the column.
 */
export const contentDetailHeroImageFrameClasses =
  'aspect-[4/3] size-full w-full min-h-0 md:aspect-auto md:h-full rounded-none rounded-b-card shadow-sm md:rounded-none md:rounded-tr-card md:rounded-br-card'

/** Legacy img hero path — same shell geometry plus object-cover on the element. */
export const contentDetailHeroImageClasses = `${contentDetailHeroImageFrameClasses} object-cover`

export const contentDetailHeroCardClasses = 'overflow-hidden'
