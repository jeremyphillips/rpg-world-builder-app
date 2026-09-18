import type { ReactNode } from 'react'
import type { ContentCardDensity } from '@rpg/ui'

import { entityCardContentInsetVariants } from './entity-card-content.variants'

type EntityCardContentProps = {
  density?: ContentCardDensity
  children: ReactNode
}

/** Shared header/content inset region — sole owner of entity card padding. */
export function EntityCardContent({ density = 'comfortable', children }: EntityCardContentProps) {
  return <div className={entityCardContentInsetVariants({ density })}>{children}</div>
}
