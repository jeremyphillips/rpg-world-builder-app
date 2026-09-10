import { cva, type VariantProps } from 'class-variance-authority'

export const landingHeroSectionClasses = 'overflow-hidden px-6 pb-20 pt-20 sm:pb-24 sm:pt-28'

export const landingHeroInnerClasses =
  'mx-auto flex w-full max-w-3xl flex-col items-center gap-6 text-center'

export const landingHeroContentTypeListClasses =
  'flex flex-wrap items-center justify-center gap-2 pt-4'

/**
 * Staggered load-in for hero children. `landing-rise` runs `both`, so delayed
 * elements hold their hidden from-state until their turn.
 */
export const landingHeroEnterVariants = cva('motion-safe:animate-landing-rise', {
  variants: {
    step: {
      0: '',
      1: 'motion-safe:[animation-delay:100ms]',
      2: 'motion-safe:[animation-delay:200ms]',
      3: 'motion-safe:[animation-delay:300ms]',
      4: 'motion-safe:[animation-delay:400ms]',
    },
  },
  defaultVariants: {
    step: 0,
  },
})

export type LandingHeroEnterVariantProps = VariantProps<typeof landingHeroEnterVariants>
