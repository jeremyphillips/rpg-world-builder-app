import { cva, type VariantProps } from 'class-variance-authority'

import type { FieldRhythm } from '../../components/ui/field.variants'

export const FORM_COLUMNS_WIDTH_EQUAL = 'equal' as const
export const FORM_COLUMNS_WIDTH_PRIMARY_DETAIL = 'primary-detail' as const

/** Tailwind `md` — two independent stacks from this breakpoint up. */
export const FORM_COLUMNS_WIDE_MEDIA_QUERY = '(min-width: 768px)'

export const formColumnsGridVariants = cva('grid min-w-0', {
  variants: {
    count: {
      2: '',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    },
    ratio: {
      equal: '',
      'primary-detail': '',
    },
    rhythm: {
      compact: 'gap-3',
      comfortable: 'gap-6',
    } satisfies Record<FieldRhythm, string>,
  },
  compoundVariants: [
    { count: 2, ratio: 'equal', class: 'grid-cols-1 md:grid-cols-2' },
    {
      count: 2,
      ratio: 'primary-detail',
      class: 'grid-cols-1 md:grid-cols-[2fr_minmax(18rem,1fr)]',
    },
  ],
  defaultVariants: {
    count: 2,
    ratio: 'equal',
    rhythm: 'comfortable',
  },
})

export type FormColumnsGridVariantProps = VariantProps<typeof formColumnsGridVariants>

export function resolveFormColumnsGridCount(columnCount: number): 2 | 3 {
  return columnCount >= 3 ? 3 : 2
}
