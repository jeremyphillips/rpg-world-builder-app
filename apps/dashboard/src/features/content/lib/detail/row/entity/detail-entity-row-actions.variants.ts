import { cva } from 'class-variance-authority'

/** Layout-only trailing control cluster — does not restyle children. */
export const detailEntityRowActionsVariants = cva('flex shrink-0 items-center gap-0.5')
