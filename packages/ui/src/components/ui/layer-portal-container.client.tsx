'use client'

import * as React from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import * as SelectPrimitive from '@radix-ui/react-select'

const LayerPortalContainerContext = React.createContext<HTMLElement | null>(null)

/** Supplies a DOM node for portaled overlays (popover, select) inside modal layers. */
export function LayerPortalContainerProvider({
  container,
  children,
}: {
  container: HTMLElement | null
  children: React.ReactNode
}) {
  return (
    <LayerPortalContainerContext.Provider value={container}>
      {children}
    </LayerPortalContainerContext.Provider>
  )
}

/** Portal target for combobox/input-select popovers — falls back to document body. */
export function useLayerPortalContainer() {
  return React.useContext(LayerPortalContainerContext)
}

type PopoverPortalProps = React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Portal>

/** Popover portal that renders inside an enclosing sheet/modal when present. */
export function PopoverLayerPortal({ container, children, ...props }: PopoverPortalProps) {
  const layerContainer = useLayerPortalContainer()
  return (
    <PopoverPrimitive.Portal container={container ?? layerContainer ?? undefined} {...props}>
      {children}
    </PopoverPrimitive.Portal>
  )
}

type SelectPortalProps = React.ComponentPropsWithoutRef<typeof SelectPrimitive.Portal>

/** Select portal that renders inside an enclosing sheet/modal when present. */
export function SelectLayerPortal({ container, children, ...props }: SelectPortalProps) {
  const layerContainer = useLayerPortalContainer()
  return (
    <SelectPrimitive.Portal container={container ?? layerContainer ?? undefined} {...props}>
      {children}
    </SelectPrimitive.Portal>
  )
}
