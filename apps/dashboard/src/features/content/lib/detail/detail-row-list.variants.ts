import { cva } from 'class-variance-authority'

export type DetailRowListSeparatorKind = 'structural' | 'record'

/** Row-list divider tokens — structural between siblings; record between list items only. */
export const detailRowListSeparatorVariants = cva('', {
  variants: {
    kind: {
      structural: '[&>*+*]:border-t [&>*+*]:border-border-subtle',
      record: '[&>li+li]:border-t [&>li+li]:border-border-subtle',
    },
  },
})
