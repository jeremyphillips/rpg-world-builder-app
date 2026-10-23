import * as React from 'react'

import { cn } from '../../lib/utils'
import {
  CardMedia,
  DeclarativeCardInterior,
  parseCardProps,
  renderNavigableCardLink,
  resolveCardSurfaceClassName,
} from './card.lib'
import type { CardHeaderModel, CardProps, NavigableCardProps, StaticCardProps } from './card.types'
import type { GenericCardDensity } from './card.variants'

export type { CardHeaderModel, CardProps, NavigableCardProps, StaticCardProps }

const Card = React.forwardRef<HTMLDivElement, CardProps>((props, ref) => {
  const parsed = parseCardProps(props)
  const surfaceClassName = resolveCardSurfaceClassName({
    tone: parsed.tone,
    elevation: parsed.elevation,
    density: parsed.density,
    interactive: parsed.interactive,
    selected: parsed.selected,
    disabled: parsed.disabled,
    stretch: parsed.stretch,
    leadMedia: parsed.leadMedia != null,
    className: parsed.className,
    navigable: parsed.link != null,
  })

  if (!parsed.useDeclarativeLayout) {
    return (
      <div ref={ref} className={surfaceClassName} {...parsed.restProps}>
        <CardMedia leadMedia={parsed.leadMedia} />
        {parsed.children}
      </div>
    )
  }

  const interior = (
    <>
      <CardMedia leadMedia={parsed.leadMedia} />
      <DeclarativeCardInterior
        header={parsed.header}
        footer={parsed.footer}
        hasBody={parsed.hasBody}
        navigable={parsed.link != null}
        showNavigationChevron={parsed.showNavigationChevron}
      >
        {parsed.children}
      </DeclarativeCardInterior>
    </>
  )

  if (parsed.link != null) {
    return renderNavigableCardLink(parsed.link, surfaceClassName, interior, parsed.restProps, ref)
  }

  return (
    <div ref={ref} className={surfaceClassName} {...parsed.restProps}>
      {interior}
    </div>
  )
})
Card.displayName = 'Card'

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('ui-card__header', className)} {...props} />
  ),
)
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn('ui-card__title', className)} {...props} />
  ),
)
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('ui-card__description', className)} {...props} />
))
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('ui-card__content', className)} {...props} />
  ),
)
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('ui-card__footer', className)} {...props} />
  ),
)
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
export type { GenericCardDensity }
