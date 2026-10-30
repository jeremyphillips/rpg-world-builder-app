import { Children, isValidElement, type ReactNode } from 'react'

type EntityLeadingRailProps = {
  children: ReactNode
}

/** Lays out leading utilities. Content gap is the inherited leading-gap token. */
export function EntityLeadingRail({ children }: EntityLeadingRailProps) {
  const utilities = Children.toArray(children).filter((child) => child != null)

  if (utilities.length === 0) {
    return null
  }

  return (
    <div className="dash-entity-leading">
      {utilities.map((utility, index) => {
        const key = isValidElement(utility) && utility.key != null ? utility.key : index

        return (
          <div key={key} className="dash-entity-leading__column">
            {utility}
          </div>
        )
      })}
    </div>
  )
}
