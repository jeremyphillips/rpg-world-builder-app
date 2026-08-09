import { cva, type VariantProps } from 'class-variance-authority'

export const locationCreateSetupSummaryVariants = cva(
  'flex items-start justify-between gap-3 rounded-md border border-border bg-muted px-3 py-2',
)

export const locationCreateSetupSummaryCopyVariants = cva('flex min-w-0 flex-col gap-0.5')

export type LocationCreateSetupSummaryVariants = VariantProps<
  typeof locationCreateSetupSummaryVariants
>
