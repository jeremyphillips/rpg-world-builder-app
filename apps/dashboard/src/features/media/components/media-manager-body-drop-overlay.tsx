import { cn } from '@rpg/ui'
import { ImagePlus } from 'lucide-react'

import { mediaManagerStyles as styles } from './media-manager.variants'

export function MediaManagerBodyDropOverlay({ invalid = false }: { invalid?: boolean }) {
  return (
    <div
      className={cn(styles.bodyDropOverlay(), invalid && styles.bodyDropInvalid())}
      aria-hidden="true"
    >
      <ImagePlus className="size-8" aria-hidden="true" />
      <p className="text-sm font-semibold">
        {invalid ? "These files can't be added" : 'Drop images to add'}
      </p>
      {!invalid && <p className={styles.bodyDropSubtitle()}>Release to add them to this record</p>}
    </div>
  )
}
