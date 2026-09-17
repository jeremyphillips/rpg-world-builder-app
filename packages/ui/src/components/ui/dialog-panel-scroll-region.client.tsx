'use client'

import * as React from 'react'

import { cn } from '../../lib/utils'
import { ScrollBoundaryRegion } from './scroll-boundary-region.client'
import type { ScrollBoundaryState } from './scroll-boundary-region.lib'
import {
  dialogPanelInnerLeadingScrollViewportClasses,
  dialogPanelInnerScrollViewportClasses,
  dialogPanelSectionScrollViewportClasses,
} from './dialog-panel.variants'
import {
  assertDialogPanelViewportClassName,
  type DialogPanelScrollInset,
} from './dialog-panel-viewport-classname.lib'

export type DialogPanelScrollRegionProps = Omit<
  React.ComponentPropsWithoutRef<typeof ScrollBoundaryRegion>,
  'viewportClassName' | 'viewportRef' | 'className'
> & {
  /**
   * Viewport inset preset — `section` owns `px-6` (default Body / externalFooter);
   * `innerLeading` owns scroll chrome + `pt-5` as first content below the header;
   * `inner` owns scroll chrome only below pinned chrome in a section-inset shell.
   */
  inset?: DialogPanelScrollInset
  /** Region root layout classes (`min-h-0 flex-1`). */
  regionClassName?: string
  /**
   * Scroll viewport classes — layout and vertical overrides only (`space-y-*`, `pt-0`).
   * Must not supply horizontal inset or scroll-chrome classes owned by `inset`.
   */
  viewportClassName?: string
  viewportRef?: React.Ref<HTMLDivElement>
}

function resolveDialogPanelScrollViewportClasses(inset: DialogPanelScrollInset): string {
  if (inset === 'inner') return dialogPanelInnerScrollViewportClasses
  if (inset === 'innerLeading') return dialogPanelInnerLeadingScrollViewportClasses
  return dialogPanelSectionScrollViewportClasses
}

/**
 * Overlay Modal/Sheet/Drawer column scrollport — boundary shadows plus explicit
 * viewport inset (`section`: `px-6` / `pt-5` / `pb-6`; `innerLeading`: scroll chrome + `pt-5`;
 * `inner`: scroll chrome only below pinned chrome).
 *
 * **Overlay-only.** Do not use for:
 * - {@link FormStickyScrollBody} (page docked forms — `pt-8` spacer)
 * - PreviewRail / master-detail / character-builder nav (already use ScrollBoundaryRegion)
 * - Nested `max-h-*` lists inside an overlay body
 *
 * `regionClassName` targets the region root; `viewportClassName` and remaining HTML
 * attributes land on the scroll viewport — same split as default `Modal.Body` / `Sheet.Body`.
 */
export const DialogPanelScrollRegion = React.forwardRef<
  HTMLDivElement,
  DialogPanelScrollRegionProps
>(
  (
    {
      inset = 'section',
      regionClassName,
      viewportClassName,
      viewportRef,
      children,
      onBoundaryStateChange,
      showTopBoundaryShadow,
      showBottomBoundaryShadow,
      ...viewportProps
    },
    forwardedRef,
  ) => {
    if (process.env.NODE_ENV !== 'production') {
      assertDialogPanelViewportClassName(inset, viewportClassName)
    }

    return (
      <ScrollBoundaryRegion
        className={cn('min-h-0 flex-1', regionClassName)}
        viewportClassName={cn(resolveDialogPanelScrollViewportClasses(inset), viewportClassName)}
        viewportRef={viewportRef ?? forwardedRef}
        showTopBoundaryShadow={showTopBoundaryShadow}
        showBottomBoundaryShadow={showBottomBoundaryShadow}
        onBoundaryStateChange={onBoundaryStateChange}
        {...viewportProps}
      >
        {children}
      </ScrollBoundaryRegion>
    )
  },
)
DialogPanelScrollRegion.displayName = 'DialogPanelScrollRegion'

export type { ScrollBoundaryState }
