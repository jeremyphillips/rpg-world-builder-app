import { Icon } from './icon/icon'
import * as React from 'react'
import { cn } from '../../lib/utils'
import { renderNavigableLinkRoot } from './navigable-link-root.lib'
import { interactiveFocusVariants } from './interactive-focus.variants'
import type { CardHeaderModel, CardProps } from './card.types'
import {
  cardSurfaceVariants,
  type CardSurfaceVariantProps,
  type GenericCardDensity,
} from './card.variants'

export function cardHasBody(children: React.ReactNode): boolean {
  return React.Children.toArray(children).length > 0
}

export { composeRefs } from './navigable-link-root.lib'

function CardHeaderRegion({ header }: { header: CardHeaderModel }) {
  return (
    <div className="ui-card__header">
      <h3 className="ui-card__title">{header.title}</h3>
      {header.description ? <p className="ui-card__description">{header.description}</p> : null}
    </div>
  )
}

/** Decorative trailing chevron for navigable Card and destination rows. */
export function NavigationChevron({ className }: { className?: string }) {
  return (
    <span className={cn('ui-card__nav-chevron', className)} aria-hidden>
      <Icon name="chevron-right" size="md" className="shrink-0" />
    </span>
  )
}

function CardNavigationChevron() {
  return <NavigationChevron />
}

/** Navigable card interior — main column plus optional trailing chevron. */
export function CardNavInterior({
  main,
  showNavigationChevron = true,
  mainClassName,
}: {
  main: React.ReactNode
  showNavigationChevron?: boolean
  mainClassName?: string
}) {
  return (
    <div className="ui-card__nav">
      <div className={cn('ui-card__nav-main', mainClassName)}>{main}</div>
      {showNavigationChevron ? <CardNavigationChevron /> : null}
    </div>
  )
}

export function CardMedia({ leadMedia }: { leadMedia?: React.ReactNode }) {
  if (leadMedia == null) {
    return null
  }
  return <div className="ui-card__media">{leadMedia}</div>
}

type DeclarativeInteriorProps = {
  header?: CardHeaderModel
  footer?: React.ReactNode
  hasBody: boolean
  children?: React.ReactNode
  navigable: boolean
  showNavigationChevron: boolean
}

export function DeclarativeCardInterior({
  header,
  footer,
  hasBody,
  children,
  navigable,
  showNavigationChevron,
}: DeclarativeInteriorProps) {
  const main = (
    <>
      {header ? <CardHeaderRegion header={header} /> : null}
      {hasBody ? <div className="ui-card__content">{children}</div> : null}
      {footer ? <div className="ui-card__footer">{footer}</div> : null}
    </>
  )

  if (!navigable) {
    return <>{main}</>
  }

  return <CardNavInterior main={main} showNavigationChevron={showNavigationChevron} />
}

export function resolveCardSurfaceClassName({
  tone,
  elevation,
  density,
  interactive,
  selected,
  disabled,
  stretch,
  leadMedia,
  className,
  navigable,
}: {
  tone?: CardSurfaceVariantProps['tone']
  elevation?: CardSurfaceVariantProps['elevation']
  density: GenericCardDensity
  interactive: boolean
  selected?: boolean
  disabled?: boolean
  stretch?: boolean
  leadMedia?: boolean
  className?: string
  navigable: boolean
}): string {
  return cn(
    cardSurfaceVariants({ tone, elevation, density, interactive, selected, disabled }),
    navigable &&
      cn('block w-full min-w-0 no-underline', interactiveFocusVariants({ context: 'standalone' })),
    stretch && 'ui-card--stretch',
    leadMedia && 'ui-card--media',
    className,
  )
}

export type ParsedCardProps = {
  className?: string
  tone?: CardSurfaceVariantProps['tone']
  elevation?: CardSurfaceVariantProps['elevation']
  density: GenericCardDensity
  interactive: boolean
  selected?: boolean
  disabled?: boolean
  header?: CardHeaderModel
  footer?: React.ReactNode
  leadMedia?: React.ReactNode
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
    elevation,
    density = 'comfortable',
    interactive: interactiveProp,
    selected,
    disabled,
    header,
    footer,
    leadMedia,
    stretch,
    children,
    link,
    showNavigationChevron: showNavigationChevronProp,
    ...restProps
  } = props as IncomingCardProps

  return {
    className,
    tone,
    elevation,
    density,
    interactiveProp,
    selected,
    disabled,
    header,
    footer,
    leadMedia,
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
    elevation: incoming.elevation,
    density: incoming.density,
    interactive,
    selected: incoming.selected,
    disabled: incoming.disabled,
    header: incoming.header,
    footer: incoming.footer,
    leadMedia: incoming.leadMedia,
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
  return renderNavigableLinkRoot(
    link,
    surfaceClassName,
    interior,
    restProps,
    ref as React.ForwardedRef<HTMLElement>,
  )
}
