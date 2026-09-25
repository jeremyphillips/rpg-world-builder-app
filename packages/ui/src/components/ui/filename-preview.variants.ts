import { cva, type VariantProps } from 'class-variance-authority'

export type FilenamePreviewDisplayVariantProps = VariantProps<typeof filenamePreviewVariants>

export const filenamePreviewVariants = cva('min-w-0 max-w-full whitespace-nowrap', {
  variants: {
    display: {
      block: 'block',
      inline: 'inline-block align-bottom',
    },
  },
  defaultVariants: {
    display: 'block',
  },
})

export const filenamePreviewFullVariants = cva('block min-w-0 max-w-full break-words')
