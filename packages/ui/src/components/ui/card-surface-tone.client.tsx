'use client'

import * as React from 'react'

import type { CardSurfaceTone } from './card.variants'

const CardSurfaceToneContext = React.createContext<CardSurfaceTone | null>(null)

export function CardSurfaceToneProvider({
  tone,
  inheritHostPlane = false,
  children,
}: {
  tone: CardSurfaceTone
  /** When true, quiet card fill resolves to inherited `--surface-current` (create-composition hosts). */
  inheritHostPlane?: boolean
  children: React.ReactNode
}): React.JSX.Element {
  const content = inheritHostPlane ? (
    <div className="ui-card-tone-host--inherit">{children}</div>
  ) : (
    children
  )

  return <CardSurfaceToneContext.Provider value={tone}>{content}</CardSurfaceToneContext.Provider>
}

export function useCardSurfaceTone(componentDefault: CardSurfaceTone): CardSurfaceTone {
  const hostTone = React.useContext(CardSurfaceToneContext)
  return hostTone ?? componentDefault
}
