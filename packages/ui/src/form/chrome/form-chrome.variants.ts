import { boundedScrollRegionClasses } from '../../components/ui/bounded-scroll-region.variants'
import {
  dialogPanelScrollRegionBottomInsetClasses,
  dialogPanelScrollRegionFocusClearanceClasses,
} from '../../components/ui/dialog-panel.variants'
import { cn } from '../../lib/utils'

/** Docked-footer column shell — publishes environmental inset contracts. */
export const formStickyScrollShellWithDockedFooterClasses = 'ui-form-docked-shell'

/**
 * Clip slot above a docked footer — definite size container without scroll. Pairs with
 * {@link FormStickyScrollBody}.
 */
export const formStickyScrollBodyClipClasses = cn(
  'flex min-h-0 flex-1 flex-col overflow-hidden',
  'form-scroll-body-container',
)

/** Shared scroll padding/behavior for docked-footer form bodies. */
const formStickyScrollBodyScrollSurfaceClasses = cn(
  boundedScrollRegionClasses,
  dialogPanelScrollRegionBottomInsetClasses,
  dialogPanelScrollRegionFocusClearanceClasses,
)

/** Legacy docked-footer slot when no clip is applied. */
export const formStickyScrollBodyUnboundedClasses = 'min-h-0 flex-1'

/** Viewport extras for bounded scroll bodies composed with {@link ScrollBoundaryRegion}. */
export const formStickyScrollBodyScrollViewportClasses = cn(
  'h-full min-h-0',
  dialogPanelScrollRegionBottomInsetClasses,
  dialogPanelScrollRegionFocusClearanceClasses,
)

/** Inner scroller inside the viewport-bound clip slot. */
export const formStickyScrollBodyScrollerClasses = cn(
  'h-full min-h-0',
  formStickyScrollBodyScrollSurfaceClasses,
)

/** Shared flex row for form footer actions (leading + primary group). */
export const formActionsBarActionsRowClasses = 'flex flex-wrap items-center gap-2'

export const formActionsBarLeadingGroupClasses = 'flex flex-wrap items-center gap-2'

export const formActionsBarPrimaryGroupClasses = 'ml-auto flex flex-wrap items-center gap-2'
