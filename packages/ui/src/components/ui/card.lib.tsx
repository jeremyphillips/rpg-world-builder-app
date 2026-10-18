import * as React from 'react'
import { ChevronRight } from 'lucide-react'

import { cn } from '../../lib/utils'
import { renderNavigableLinkRoot } from './navigable-link-root.lib'
import { interactiveFocusVariants } from './interactive-focus.variants'
import type { CardHeaderModel, CardProps } from './card.types'
import {
  cardSurfaceVariants,
  UI_CARD_CONTENT_CLASS,
  UI_CARD_DESCRIPTION_CLASS,
  UI_CARD_FOOTER_CLASS,
  UI_CARD_HEADER_CLASS,
  UI_CARD_NAV_CHEVRON_CLASS,
  UI_CARD_NAV_CLASS,
  UI_CARD_NAV_MAIN_CLASS,
  UI_CARD_TITLE_CLASS,
  type CardSurfaceVariantProps,
  type GenericCardDensity,
} from './card.variants'

export function cardHasBody(children: React.ReactNode): boolean {
  return React.Children.toArray(children).length > 0
}

export { composeRefs } from './navigable-link-root.lib'

function CardHeaderRegion({ header }: { header: CardHeaderModel }) {
  return (
    <div className={UI_CARD_HEADER_CLASS}>
      <h3 className={UI_CARD_TITLE_CLASS}>{header.title}</h3>
      {header.description ? (
        <p className={UI_CARD_DESCRIPTION_CLASS}>{header.description}</p>
      ) : null}
    </div>
  )
}

/** Decorative trailing chevron for navigable Card and destination rows. */
export function NavigationChevron({ className }: { className?: string }) {
  return (
    <span className={cn(UI_CARD_NAV_CHEVRON_CLASS, className)} aria-hidden>
      <ChevronRight className="size-4 shrink-0" />
    </span>
  )
}

function CardNavigationChevron() {
  return <NavigationChevron />
}

type DeclarativeInteriorProps = {
  header?: CardHeaderModel
  footer?: React.ReactNode
  stretch?: boolean
  hasBody: boolean
  children?: React.ReactNode
  navigable: boolean
  showNavigationChevron: boolean
}

export function DeclarativeCardInterior({
  header,
  footer,
  stretch,
  hasBody,
  children,
  navigable,
  showNavigationChevron,
}: DeclarativeInteriorProps) {
  const main = (
    <>
      {header ? <CardHeaderRegion header={header} /> : null}
      {hasBody ? <div className={UI_CARD_CONTENT_CLASS}>{children}</div> : null}
      {footer ? (
        <div className={cn(UI_CARD_FOOTER_CLASS, stretch && 'mt-auto')}>{footer}</div>
      ) : null}
    </>
  )

  if (!navigable) {
    return <>{main}</>
  }

  return (
    <div className={UI_CARD_NAV_CLASS}>
      <div className={UI_CARD_NAV_MAIN_CLASS}>{main}</div>
      {showNavigationChevron ? <CardNavigationChevron /> : null}
    </div>
  )
}

export function resolveCardSurfaceClassName({
  tone,
  density,
  interactive,
  selected,
  disabled,
  stretch,
  className,
  navigable,
}: {
  tone?: CardSurfaceVariantProps['tone']
  density: GenericCardDensity
  interactive: boolean
  selected?: boolean
  disabled?: boolean
  stretch?: boolean
  className?: string
  navigable: boolean
}): string {
  return cn(
    cardSurfaceVariants({ tone, density, interactive, selected, disabled }),
    navigable &&
      cn('block w-full min-w-0 no-underline', interactiveFocusVariants({ context: 'standalone' })),
    stretch && 'flex h-full flex-col',
    className,
  )
}

export type ParsedCardProps = {
  className?: string
  tone?: CardSurfaceVariantProps['tone']
  density: GenericCardDensity
  interactive: boolean
  selected?: boolean
  disabled?: boolean
  header?: CardHeaderModel
  footer?: React.ReactNode
  stretch?: boolean
  children?: React.ReactNode
  link?: React.ReactElement
  showNavigationChevron: boolean
  restProps: Record<string, unknown>
  hasBody: boolean
  useDeclarativeLayout: boolean
}

type IncomingCardProps = CardProps & {
  link?: React.ReactElement
  showNavigationChevron?: boolean
  interactive?: boolean
}

function warnNavigableCardProps(link: React.ReactElement | undefined, footer: React.ReactNode) {
  if (process.env.NODE_ENV !== 'development' || link == null) {
    return
  }
  if (footer != null) {
    console.warn('Card: `footer` is not supported when `link` is set.')
  }
  if (!React.isValidElement(link)) {
    console.warn('Card: `link` must be a single React element.')
  }
}

function splitIncomingCardProps(props: CardProps) {
  const {
    className,
    tone,
    density = 'comfortable',
    interactive: interactiveProp,
    selected,
    disabled,
    header,
    footer,
    stretch,
    children,
    link,
    showNavigationChevron: showNavigationChevronProp,
    ...restProps
  } = props as IncomingCardProps

  return {
    className,
    tone,
    density,
    interactiveProp,
    selected,
    disabled,
    header,
    footer,
    stretch,
    children,
    link,
    showNavigationChevronProp,
    restProps,
  }
}

function resolveNavigableBehavior(
  link: React.ReactElement | undefined,
  showNavigationChevronProp: boolean | undefined,
  interactiveProp: boolean | undefined,
) {
  if (link == null) {
    return { interactive: interactiveProp ?? false, showNavigationChevron: false }
  }
  return { interactive: true, showNavigationChevron: showNavigationChevronProp ?? true }
}

export function parseCardProps(props: CardProps): ParsedCardProps {
  const incoming = splitIncomingCardProps(props)
  warnNavigableCardProps(incoming.link, incoming.footer)
  const { interactive, showNavigationChevron } = resolveNavigableBehavior(
    incoming.link,
    incoming.showNavigationChevronProp,
    incoming.interactiveProp,
  )
  const hasBody = cardHasBody(incoming.children)
  const useDeclarativeLayout =
    incoming.header != null || incoming.footer != null || incoming.link != null

  return {
    className: incoming.className,
    tone: incoming.tone,
    density: incoming.density,
    interactive,
    selected: incoming.selected,
    disabled: incoming.disabled,
    header: incoming.header,
    footer: incoming.footer,
    stretch: incoming.stretch,
    children: incoming.children,
    link: incoming.link,
    showNavigationChevron,
    restProps: incoming.restProps,
    hasBody,
    useDeclarativeLayout,
  }
}

export function renderNavigableCardLink(
  link: React.ReactElement,
  surfaceClassName: string,
  interior: React.ReactNode,
  restProps: Record<string, unknown>,
  ref: React.ForwardedRef<HTMLDivElement>,
): React.ReactElement {
  return renderNavigableLinkRoot(link, surfaceClassName, interior, restProps, ref)
}
