import type { ReactNode } from 'react'
import { Heading } from '@rpg/ui'

import {
  createCompositionComposerStackClasses,
  createCompositionReviewClasses,
} from './create-composition.variants'

export type CreateCompositionComposerProps = {
  heading: ReactNode
  children: ReactNode
}

export function CreateCompositionComposer({ heading, children }: CreateCompositionComposerProps) {
  return (
    <div className={createCompositionComposerStackClasses}>
      <Heading as="h3" variant="subsection">
        {heading}
      </Heading>
      <div className={createCompositionReviewClasses}>{children}</div>
    </div>
  )
}
