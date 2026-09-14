import { cn } from '@rpg/ui'

/** Default list max block size — override on a definite-height host only. */
export const masterDetailGridClasses = cn(
  'grid grid-cols-1 items-start gap-6 md:grid-cols-3',
  '[--master-detail-list-max-block-size:28rem]',
)
