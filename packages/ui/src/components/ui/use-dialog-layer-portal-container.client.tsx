'use client'

import * as React from 'react'

import { LayerPortalContainerProvider } from './layer-portal-container.client'

function assignRef<T>(ref: React.ForwardedRef<T>, node: T | null) {
  if (typeof ref === 'function') {
    ref(node)
    return
  }
  if (ref) {
    ref.current = node
  }
}

/** Tracks dialog/sheet content element for overlay portal targets and forwarded refs. */
export function useDialogLayerPortalContainer<T extends HTMLElement>(
  forwardedRef: React.ForwardedRef<T>,
) {
  const [portalContainer, setPortalContainer] = React.useState<T | null>(null)

  const composedRef = React.useCallback(
    (node: T | null) => {
      setPortalContainer(node)
      assignRef(forwardedRef, node)
    },
    [forwardedRef],
  )

  const portalProvider = React.useCallback(
    (children: React.ReactNode) => (
      <LayerPortalContainerProvider container={portalContainer}>
        {children}
      </LayerPortalContainerProvider>
    ),
    [portalContainer],
  )

  return { composedRef, portalProvider }
}
