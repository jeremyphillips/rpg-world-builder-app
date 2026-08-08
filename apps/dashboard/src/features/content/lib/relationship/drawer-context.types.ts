import type { ReactNode } from 'react'

/** Plain-string projection for VM mappers and Current snapshots. */
export type DrawerContextEntityPresentation = {
  heading: string
  headingSuffix?: string
  supportingText?: string
  href?: string
}

/** Render-ready entity block for drawer context chrome. */
export type DrawerContextEntity = {
  heading: ReactNode
  headingSuffix?: ReactNode
  supportingText?: ReactNode
  href?: string
}

export function toDrawerContextEntity(
  presentation: DrawerContextEntityPresentation,
): DrawerContextEntity {
  return presentation
}
