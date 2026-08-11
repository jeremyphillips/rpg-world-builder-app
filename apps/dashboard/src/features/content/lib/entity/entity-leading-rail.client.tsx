'use client'

import { Children, isValidElement, type ReactNode } from 'react'
import type { ContentCardDensity } from '@rpg/ui'

import {
  entityLeadingRailColumnVariants,
  entityLeadingRailVariants,
} from './entity-leading-rail.variants'

type EntityLeadingRailProps = {
  children: ReactNode
  density?: ContentCardDensity
}

/** Lays out leading utilities — width includes padding-inline-end(contentGap). */
export function EntityLeadingRail({ children, density = 'comfortable' }: EntityLeadingRailProps) {
  const utilities = Children.toArray(children).filter((child) => child != null)

  if (utilities.length === 0) {
    return null
  }

  return (
    <div className={entityLeadingRailVariants({ density })}>
      {utilities.map((utility, index) => {
        const key = isValidElement(utility) && utility.key != null ? utility.key : index

        return (
          <div key={key} className={entityLeadingRailColumnVariants()}>
            {utility}
          </div>
        )
      })}
    </div>
  )
}
