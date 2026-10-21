import type * as React from 'react'

import type { CardSurfaceVariantProps, GenericCardDensity } from './card.variants'

export type CardHeaderModel = {
  title: string
  description?: string
}

type CardSharedSurfaceProps = Omit<CardSurfaceVariantProps, 'interactive' | 'density'> & {
  density?: GenericCardDensity
  header?: CardHeaderModel
  /** Full-bleed art above the header. The shell clips it to the card radius. */
  leadMedia?: React.ReactNode
  stretch?: boolean
}

/** Static / footer-action / form chrome — default path. */
export type StaticCardProps = CardSharedSurfaceProps &
  Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> & {
    link?: never
    showNavigationChevron?: never
    interactive?: boolean
    footer?: React.ReactNode
    children?: React.ReactNode
  }

/** Single-destination navigation — whole card is the hit target. */
export type NavigableCardProps = CardSharedSurfaceProps &
  Omit<React.HTMLAttributes<HTMLElement>, 'children'> & {
    link: React.ReactElement
    showNavigationChevron?: boolean
    interactive?: never
    footer?: never
    children?: React.ReactNode
  }

export type CardProps = StaticCardProps | NavigableCardProps
