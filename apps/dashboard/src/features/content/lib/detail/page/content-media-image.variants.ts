import { cva } from 'class-variance-authority'

export const contentMediaImageFrameVariants = cva('relative isolate overflow-hidden', {
  variants: {
    frame: {
      intrinsic: 'min-h-0 w-full',
      primary: 'aspect-[4/3] w-full min-h-0',
      square: 'size-6 shrink-0 rounded-md lg:size-8',
    },
  },
  defaultVariants: {
    frame: 'intrinsic',
  },
})

export const contentMediaImageClasses =
  'block size-full max-w-none select-none object-cover object-center'
