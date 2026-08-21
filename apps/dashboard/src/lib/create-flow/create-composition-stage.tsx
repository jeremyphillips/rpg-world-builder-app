import type { ReactNode } from 'react'
import { Heading, Text } from '@rpg/ui'

import {
  createCompositionStageHeadingRowClasses,
  createCompositionStageStackClasses,
  createCompositionStageSubheadingClasses,
} from './create-composition.variants'

export type CreateCompositionStageProps = {
  heading: ReactNode
  helper?: ReactNode
  action?: ReactNode
  children?: ReactNode
}

export function CreateCompositionStage({
  heading,
  helper,
  action,
  children,
}: CreateCompositionStageProps) {
  return (
    <div className={createCompositionStageStackClasses}>
      <div className={createCompositionStageSubheadingClasses}>
        <div className={createCompositionStageHeadingRowClasses}>
          <Heading as="h4" variant="group">
            {heading}
          </Heading>
          {action}
        </div>
        {helper != null ? <Text variant="muted">{helper}</Text> : null}
      </div>
      {children}
    </div>
  )
}
