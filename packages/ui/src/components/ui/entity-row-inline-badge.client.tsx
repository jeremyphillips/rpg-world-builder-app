'use client'

import { createContext, useContext, type ReactNode } from 'react'

import { Badge } from './badge'
import type { BadgeAppearance, BadgeEmphasis, BadgeLayout, BadgeTone } from './badge.variants'
import type { GenericCardDensity } from './card.variants'
import { resolveEntityRowInlineBadgeSize } from './entity-row-inline-badge-size.lib'

const EntityRowInlineDensityContext = createContext<GenericCardDensity | null>(null)

/**
 * Publishes the owning row's density for {@link EntityRowInlineBadge}.
 * Standalone `Badge` does not read this value.
 */
export function EntityRowInlineDensityProvider({
  density,
  children,
}: {
  density: GenericCardDensity
  children: ReactNode
}) {
  return (
    <EntityRowInlineDensityContext.Provider value={density}>
      {children}
    </EntityRowInlineDensityContext.Provider>
  )
}

export type EntityRowInlineBadgeProps = {
  appearance?: BadgeAppearance
  tone?: BadgeTone
  emphasis?: BadgeEmphasis
  layout?: BadgeLayout
  leadingIcon?: ReactNode
  trailingIcon?: ReactNode
  title?: string
  children: ReactNode
}

/**
 * Inline badge for a managed entity-row slot. Size comes from the owning row's
 * density. There is no size, density, or className prop.
 */
export function EntityRowInlineBadge({
  appearance,
  tone,
  emphasis,
  layout,
  leadingIcon,
  trailingIcon,
  title,
  children,
}: EntityRowInlineBadgeProps) {
  const density = useContext(EntityRowInlineDensityContext)
  if (density == null) {
    throw new Error('EntityRowInlineBadge must render inside EntityRowInlineDensityProvider.')
  }

  return (
    <Badge
      appearance={appearance}
      tone={tone}
      emphasis={emphasis}
      layout={layout}
      leadingIcon={leadingIcon}
      trailingIcon={trailingIcon}
      title={title}
      size={resolveEntityRowInlineBadgeSize(density)}
    >
      {children}
    </Badge>
  )
}
