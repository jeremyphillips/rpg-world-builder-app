import { cva, type VariantProps } from 'class-variance-authority'

/**
 * Reveal-on-scroll transition. The wrapper renders visible on the server (so
 * no-JS visitors and above-the-fold content are never hidden); the client
 * component flips `data-reveal` to `hidden` only for below-the-fold content,
 * then to `revealed` when it enters the viewport.
 */
export const scrollRevealVariants = cva(
  [
    'transition-[opacity,translate] duration-700 ease-out',
    'data-[reveal=hidden]:opacity-0',
    'motion-reduce:transition-none motion-reduce:data-[reveal=hidden]:opacity-100',
  ],
  {
    variants: {
      direction: {
        up: 'data-[reveal=hidden]:translate-y-8 motion-reduce:data-[reveal=hidden]:translate-y-0',
        none: '',
      },
    },
    defaultVariants: {
      direction: 'up',
    },
  },
)

export type ScrollRevealVariantProps = VariantProps<typeof scrollRevealVariants>
