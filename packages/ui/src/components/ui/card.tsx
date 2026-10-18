import * as React from 'react'

import { cn } from '../../lib/utils'
import {
  cardSurfaceVariants,
  UI_CARD_CONTENT_CLASS,
  UI_CARD_DESCRIPTION_CLASS,
  UI_CARD_FOOTER_CLASS,
  UI_CARD_HEADER_CLASS,
  UI_CARD_TITLE_CLASS,
  type CardSurfaceVariantProps,
  type GenericCardDensity,
} from './card.variants'

export type CardHeaderModel = {
  title: string
  description?: string
}

type CardProps = Omit<CardSurfaceVariantProps, 'density'> &
  React.HTMLAttributes<HTMLDivElement> & {
    density?: GenericCardDensity
    header?: CardHeaderModel
    footer?: React.ReactNode
    /** Full-height column; pins footer with mt-auto on internal layout. */
    stretch?: boolean
    children?: React.ReactNode
  }

function cardHasBody(children: React.ReactNode): boolean {
  return React.Children.toArray(children).length > 0
}

/** Form-style cards keep body regions on the child (e.g. `<Form contentClassName={…}>`). */
function shouldWrapBodyInContent(
  header: CardHeaderModel | undefined,
  footer: React.ReactNode | undefined,
  hasBody: boolean,
): boolean {
  if (!hasBody) {
    return false
  }
  if (header != null && footer == null) {
    return false
  }
  return true
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      tone,
      density = 'comfortable',
      interactive,
      selected,
      disabled,
      header,
      footer,
      stretch,
      children,
      ...props
    },
    ref,
  ) => {
    const hasBody = cardHasBody(children)
    const useDeclarativeLayout = header != null || footer != null
    const wrapBody = shouldWrapBodyInContent(header, footer, hasBody)

    if (!useDeclarativeLayout) {
      return (
        <div
          ref={ref}
          className={cn(
            cardSurfaceVariants({ tone, density, interactive, selected, disabled }),
            className,
          )}
          {...props}
        >
          {children}
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={cn(
          cardSurfaceVariants({ tone, density, interactive, selected, disabled }),
          stretch && 'flex h-full flex-col',
          className,
        )}
        {...props}
      >
        {header ? (
          <div className={UI_CARD_HEADER_CLASS}>
            <h3 className={UI_CARD_TITLE_CLASS}>{header.title}</h3>
            {header.description ? (
              <p className={UI_CARD_DESCRIPTION_CLASS}>{header.description}</p>
            ) : null}
          </div>
        ) : null}
        {hasBody ? (
          wrapBody ? (
            <div className={UI_CARD_CONTENT_CLASS}>{children}</div>
          ) : (
            children
          )
        ) : null}
        {footer ? (
          <div className={cn(UI_CARD_FOOTER_CLASS, stretch && 'mt-auto')}>{footer}</div>
        ) : null}
      </div>
    )
  },
)
Card.displayName = 'Card'

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn(UI_CARD_HEADER_CLASS, className)} {...props} />
  ),
)
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn(UI_CARD_TITLE_CLASS, className)} {...props} />
  ),
)
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn(UI_CARD_DESCRIPTION_CLASS, className)} {...props} />
))
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
export type { GenericCardDensity, CardProps }
