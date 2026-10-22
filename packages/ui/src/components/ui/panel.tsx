import { forwardRef, type ComponentPropsWithoutRef, type ElementType } from 'react'

import { cn } from '../../lib/utils'
import { panelVariants, type PanelDensity, type PanelTone } from './panel.variants'

const PANEL_ELEMENTS = {
  div: 'div',
  section: 'section',
  aside: 'aside',
} as const

export type PanelElement = keyof typeof PANEL_ELEMENTS

export type PanelProps = Omit<ComponentPropsWithoutRef<'div'>, 'as'> & {
  tone?: PanelTone
  density?: PanelDensity
  /** Drops root inset so children can meet the frame. */
  bleed?: boolean
  as?: PanelElement
}

/**
 * Structural grouping surface. Padding lives on the root. Children are direct
 * descendants, so flex and grid on `className` apply to them.
 */
export const Panel = forwardRef<HTMLElement, PanelProps>(function Panel(
  { as = 'div', tone = 'transparent', density = 'comfortable', bleed = false, className, ...props },
  ref,
) {
  const Comp = PANEL_ELEMENTS[as] as ElementType

  return (
    <Comp ref={ref} className={cn(panelVariants({ tone, density, bleed }), className)} {...props} />
  )
})
