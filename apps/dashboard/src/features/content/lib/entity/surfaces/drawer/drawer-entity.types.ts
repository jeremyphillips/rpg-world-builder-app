import type { ReactNode } from 'react'

/** Plain-string projection for VM mappers and Current snapshots. */
export type DrawerEntityPresentation = {
  heading: string
  classification?: string
  supportingText?: string
  href?: string
}

/** Render-ready props consumed by DrawerEntityBlock. */
export type DrawerEntityBlockModel = {
  heading: ReactNode
  classification?: ReactNode
  supportingText?: ReactNode
  href?: string
}
