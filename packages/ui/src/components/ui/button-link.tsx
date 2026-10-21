'use client'

import * as React from 'react'

import { renderNavigableLinkRoot } from './navigable-link-root.lib'
import { resolveButtonAppearance } from './resolve-button-appearance'
import type { ButtonVariantProps } from './button.variants'
import type { TextActionTone } from './text-action.variants'

type ButtonLinkSharedProps = {
  link: React.ReactElement
  children: React.ReactNode
  className?: string
  size?: ButtonVariantProps['size']
  density?: ButtonVariantProps['density']
}

export type ButtonLinkProps = ButtonLinkSharedProps &
  (
    | { variant?: Exclude<ButtonVariantProps['variant'], 'text'>; tone?: never }
    | { variant: 'text'; tone?: TextActionTone }
  )

function warnButtonLinkProps(link: React.ReactElement) {
  if (process.env.NODE_ENV !== 'development') {
    return
  }
  if (!React.isValidElement(link)) {
    console.warn('ButtonLink: `link` must be a single React element.')
    return
  }
  const linkChildren = (link.props as { children?: React.ReactNode }).children
  if (linkChildren != null && linkChildren !== '') {
    console.warn('ButtonLink: put label content in `children`, not on the `link` element.')
  }
}

const ButtonLink = React.forwardRef<HTMLElement, ButtonLinkProps>(
  ({ link, children, className, variant, size, density, tone }, ref) => {
    warnButtonLinkProps(link)

    return renderNavigableLinkRoot(
      link,
      resolveButtonAppearance({ variant, size, density, tone, className }),
      children,
      {},
      ref,
    )
  },
)
ButtonLink.displayName = 'ButtonLink'

export { ButtonLink }
