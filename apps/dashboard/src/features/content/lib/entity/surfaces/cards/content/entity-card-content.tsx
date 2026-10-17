import type { ReactNode } from 'react'

/** Shared header/content inset region — padding from `dash-entity-card__content`. */
export function EntityCardContent({ children }: { children: ReactNode }) {
  return <div className="dash-entity-card__content">{children}</div>
}
