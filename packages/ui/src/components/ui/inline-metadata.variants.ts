import { cva } from 'class-variance-authority'

export type InlineMetadataRole = 'heading' | 'supporting'
export type InlineMetadataDensity = 'compact' | 'comfortable'

export const inlineMetadataRootVariants = cva('', {
  variants: {
    wrap: {
      false: 'flex min-w-0 items-baseline',
      true: '',
    },
  },
})

export const inlineMetadataItemVariants = cva('', {
  variants: {
    role: {
      heading: '',
      supporting: 'text-muted-foreground',
    },
    wrap: {
      false: '',
      true: '',
    },
    truncate: {
      true: '',
      false: '',
    },
  },
  compoundVariants: [
    {
      wrap: false,
      truncate: true,
      className: 'min-w-0 shrink truncate',
    },
    {
      wrap: false,
      truncate: false,
      className: 'shrink-0',
    },
  ],
})

export const inlineMetadataSeparatorVariants = cva('font-normal text-muted-foreground', {
  variants: {
    density: {
      compact: '',
      comfortable: '',
    },
    wrap: {
      false: '',
      true: '',
    },
  },
  compoundVariants: [
    {
      wrap: false,
      density: 'compact',
      className: 'mx-1',
    },
    {
      wrap: false,
      density: 'comfortable',
      className: 'mx-1.5',
    },
    {
      wrap: true,
      density: 'comfortable',
      className: 'mx-0.5',
    },
  ],
})
