'use client'

import { Children, isValidElement, type ReactNode } from 'react'

import {
  entityLeadingRailColumnVariants,
  entityLeadingRailVariants,
} from './entity-leading-rail.variants'

type EntityLeadingRailProps = {
  children: ReactNode
}

/** Geometry SSOT for leading utilities — consumes the leading offset var, never publishes it. */
export function EntityLeadingRail({ children }: EntityLeadingRailProps) {
  const utilities = Children.toArray(children).filter((child) => child != null)

  if (utilities.length === 0) {
    return null
  }

  return (
    <div className={entityLeadingRailVariants()}>
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
