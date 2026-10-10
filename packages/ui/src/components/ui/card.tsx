import * as React from 'react'

import { cn } from '../../lib/utils'
import {
  cardSurfaceVariants,
  UI_CARD_CONTENT_CLASS,
  UI_CARD_FOOTER_CLASS,
  UI_CARD_HEADER_CLASS,
  type CardSurfaceVariantProps,
} from './card.variants'
import { headingVariants } from './heading.variants'
import { textVariants } from './text.variants'

type CardProps = React.HTMLAttributes<HTMLDivElement> & CardSurfaceVariantProps

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, interactive, ...props }, ref) => (
    <div ref={ref} className={cn(cardSurfaceVariants({ interactive }), className)} {...props} />
  ),
)
Card.displayName = 'Card'

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn(UI_CARD_HEADER_CLASS, className)} {...props} />
  ),
)
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn(headingVariants({ variant: 'card' }), className)} {...props} />
  ),
)
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn(textVariants({ variant: 'small' }), className)} {...props} />
  ),
)
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn(UI_CARD_CONTENT_CLASS, className)} {...props} />
  ),
)
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn(UI_CARD_FOOTER_CLASS, className)} {...props} />
  ),
)
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
