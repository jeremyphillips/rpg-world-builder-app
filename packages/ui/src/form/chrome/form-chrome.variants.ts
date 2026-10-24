import { boundedScrollRegionClasses } from '../../components/ui/bounded-scroll-region.variants'
import {
  dialogPanelScrollRegionBottomInsetClasses,
  dialogPanelScrollRegionFocusClearanceClasses,
} from '../../components/ui/dialog-panel.variants'
import { cn } from '../../lib/utils'

/** TabbedForm grid when the persistent preview rail is visible (`aside && !externalFooter`). */
export const formTabbedAsideGridClasses = 'ui-tabbed-form'

/** Form column inside {@link formTabbedAsideGridClasses}. */
export const formTabbedAsideBodyClasses = 'ui-tabbed-form__body'

/** Viewport-bounded aside column for the preview rail. */
export const formTabbedAsideSlotClasses = 'ui-tabbed-form__aside'

/** Hide compact preview trigger when the persistent rail column is visible (`xl` and up). */
export const formTabbedPreviewRailCompactTriggerHiddenClasses = 'xl:hidden'

/**
 * Top inset for viewport-bound form scroll bodies — apply via
 * {@link FormViewportScrollTopInset} as the first child inside the scroll region
 * (not on the scroll container itself) so sticky tabs can reach `top-0`.
 * This is `pt-8` (2rem). Dashboard `pageShellInsetTopClasses` is `pt-6`.
 */
export const formViewportScrollBodyTopInsetClasses = 'pt-8'

/** Visually hide inactive TabbedForm panels while keeping them mounted. */
export const formTabbedInactivePanelClasses = 'hidden'

/** Docked-footer column shell — publishes environmental inset contracts. */
export const formStickyScrollShellWithDockedFooterClasses = 'ui-form-docked-shell'

/** Sticky section tabs in {@link TabbedFormPanels}. */
export const formStickyTabsClasses = 'ui-form-sticky-tabs'

/** Transparent sticky tab surface — e.g. tabbed forms inside sheets/drawers. */
export const formStickyTabsTransparentClasses = 'ui-form-sticky-tabs--transparent'

/** Sticky actions bar — save/cancel during document or ancestor scroll. */
export const formStickyActionsBarClasses = 'ui-form-actions-bar ui-form-actions-bar--sticky'

/** Docked actions bar — below a bounded scroll body (content forms). */
export const formDockedActionsBarClasses = 'ui-form-actions-bar ui-form-actions-bar--docked'

/** Transparent sticky actions bar — pair with {@link formStickyTabsTransparentClasses}. */
export const formStickyActionsBarTransparentClasses = 'ui-form-actions-bar--transparent'

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

/**
 * @deprecated Use {@link FormStickyScrollBody}. Kept for tests that assert scroller tokens.
 */
export const formStickyScrollBodyClasses = formStickyScrollBodyScrollerClasses

/** Top spacing for a non-sticky form footer. */
export const formFooterSpacingClasses = 'pt-4'

/** Shared flex row for form footer actions (leading + primary group). */
export const formActionsBarActionsRowClasses = 'flex flex-wrap items-center gap-2'

export const formActionsBarLeadingGroupClasses = 'flex flex-wrap items-center gap-2'

export const formActionsBarPrimaryGroupClasses = 'ml-auto flex flex-wrap items-center gap-2'
