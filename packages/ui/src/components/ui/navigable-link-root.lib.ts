import * as React from 'react'

import { cn } from '../../lib/utils'

export function composeRefs<T>(...refs: Array<React.Ref<T> | undefined>): React.RefCallback<T> {
  return (node) => {
    for (const ref of refs) {
      if (ref == null) continue
      if (typeof ref === 'function') {
        ref(node)
      } else {
        ref.current = node
      }
    }
  }
}

type LinkElementProps = React.HTMLAttributes<HTMLElement> & {
  ref?: React.Ref<HTMLElement>
}

/** Clones an app-supplied link/a element as the navigable root with merged surface chrome. */
export function renderNavigableLinkRoot(
  link: React.ReactElement,
  surfaceClassName: string,
  interior: React.ReactNode,
  restProps: Record<string, unknown>,
  ref: React.ForwardedRef<HTMLElement> | null,
): React.ReactElement {
  const linkElement = link as React.ReactElement<LinkElementProps>
  const { className: linkClassName, ref: linkRef, ...linkRest } = linkElement.props

  return React.cloneElement(linkElement, {
    ...restProps,
    ...linkRest,
    ref: composeRefs(ref ?? undefined, linkRef),
    className: cn(surfaceClassName, linkClassName),
    children: interior,
  })
}
