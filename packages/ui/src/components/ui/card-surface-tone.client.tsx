'use client'

import * as React from 'react'

import type { CardSurfaceTone } from './card.variants'

const CardSurfaceToneContext = React.createContext<CardSurfaceTone | null>(null)

export function CardSurfaceToneProvider({
  tone,
  children,
}: {
  tone: CardSurfaceTone
  children: React.ReactNode
}): React.JSX.Element {
  return <CardSurfaceToneContext.Provider value={tone}>{children}</CardSurfaceToneContext.Provider>
}

export function useCardSurfaceTone(componentDefault: CardSurfaceTone): CardSurfaceTone {
  const hostTone = React.useContext(CardSurfaceToneContext)
  return hostTone ?? componentDefault
}
