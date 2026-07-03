import { cva, type VariantProps } from 'class-variance-authority'

/** Shared size token for secondary body copy (15px @ 16px root). */
export const textSecondaryBodyClasses = 'text-md'

export const textVariants = cva('', {
  variants: {
    variant: {
      body: 'text-foreground',
      muted: 'text-muted-foreground',
      small: `${textSecondaryBodyClasses} text-muted-foreground`,
      caption: 'text-xs text-muted-foreground',
      emphasis: `${textSecondaryBodyClasses} font-body-emphasis`,
      option: `${textSecondaryBodyClasses} font-body leading-none`,
      lead: 'text-lg text-muted-foreground',
      info: `${textSecondaryBodyClasses} text-info`,
      success: `${textSecondaryBodyClasses} text-success`,
      warning: `${textSecondaryBodyClasses} text-warning`,
      destructive: `${textSecondaryBodyClasses} text-destructive`,
    },
  },
  defaultVariants: {
    variant: 'body',
  },
})

export type TextVariantProps = VariantProps<typeof textVariants>
