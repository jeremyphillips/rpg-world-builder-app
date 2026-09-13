import { boundedScrollRegionClasses } from '../../components/ui/bounded-scroll-region.variants'
import {
  dialogPanelScrollRegionBottomInsetClasses,
  dialogPanelScrollRegionFocusClearanceClasses,
  dialogPanelScrollRegionClasses,
} from '../../components/ui/dialog-panel.variants'
import { cn } from '../../lib/utils'

/** Persistent preview-rail / TabbedForm aside column width from `xl` until `2xl`. */
export const formTabbedAsideWidthBelow2xl = '280px'

/** Persistent preview-rail / TabbedForm aside column width at `2xl` and above. */
export const formTabbedAsideWidthAt2xl = '21rem'

/** TabbedForm grid tracks when the persistent preview rail is visible below `2xl`. */
export const formTabbedAsideGridColsBelow2xlClasses = `xl:grid-cols-[minmax(0,1fr)_${formTabbedAsideWidthBelow2xl}]`

/** TabbedForm grid tracks when the persistent preview rail is visible at `2xl` and above. */
export const formTabbedAsideGridColsAt2xlClasses = `2xl:grid-cols-[minmax(0,56rem)_${formTabbedAsideWidthAt2xl}]`

/** Centered TabbedForm max width below `2xl` (form cap + gap + preview rail). */
export const formTabbedAsideGridMaxWidthBelow2xlClasses = `xl:max-w-[calc(56rem+1.5rem+${formTabbedAsideWidthBelow2xl})]`

/** Centered TabbedForm max width at `2xl` and above. */
export const formTabbedAsideGridMaxWidthAt2xlClasses = `2xl:max-w-[calc(56rem+1.5rem+${formTabbedAsideWidthAt2xl})]`

/** PreviewRail card max width below `2xl` — matches the aside column. */
export const formTabbedAsideCardMaxWidthBelow2xlClasses = `max-w-[${formTabbedAsideWidthBelow2xl}]`

/** PreviewRail card max width at `2xl` and above. */
export const formTabbedAsideCardMaxWidthAt2xlClasses = `2xl:max-w-[${formTabbedAsideWidthAt2xl}]`

/** Sticky tab list wrapper — keeps section tabs visible while scrolling long panels. */
export const formStickyTabsClasses =
  'sticky top-0 z-20 bg-background supports-[backdrop-filter]:bg-background/95 supports-[backdrop-filter]:backdrop-blur-sm'

/** Transparent sticky tab surface — e.g. tabbed forms inside sheets/drawers. */
export const formStickyTabsTransparentClasses =
  'bg-transparent supports-[backdrop-filter]:bg-transparent backdrop-blur-none'

/** Keeps a long segmented section control scrollable inside the field column. */
export const formTabbedNavOverflowClasses = 'min-w-0 overflow-x-auto'

/** Tab row with a trailing compact action (e.g. Preview below `xl`). */
export const formTabbedNavWithTrailingClasses = 'flex items-center gap-2'

/** Scrollable segmented control when a trailing action shares the sticky tab row. */
export const formTabbedNavControlWrapClasses = 'min-w-0 flex-1 overflow-x-auto'

/**
 * TabbedForm body + aside grid. Below `xl` the form column stays `max-w-4xl` and
 * centered; from `xl` the rail sits in a second column ({@link formTabbedAsideWidthBelow2xl}
 * until `2xl`, then {@link formTabbedAsideWidthAt2xl}) with a large gap.
 */
export const formTabbedAsideGridClasses = cn(
  'mx-auto flex min-h-0 w-full max-w-4xl flex-1 flex-col xl:grid xl:h-full xl:grid-rows-[minmax(0,1fr)] xl:items-stretch xl:gap-6',
  formTabbedAsideGridColsBelow2xlClasses,
  formTabbedAsideGridColsAt2xlClasses,
  formTabbedAsideGridMaxWidthBelow2xlClasses,
  formTabbedAsideGridMaxWidthAt2xlClasses,
)

export const formTabbedAsideBodyClasses = 'min-h-0 min-w-0 xl:col-start-1 xl:h-full xl:row-start-1'

/**
 * Top inset for viewport-bound form scroll bodies — apply via
 * {@link FormViewportScrollTopInset} as the first child inside the scroll region
 * (not on the scroll container itself) so sticky tabs can reach `top-0`. Matches
 * dashboard `pageShellInsetTopClasses`.
 */
export const formViewportScrollBodyTopInsetClasses = 'pt-8'

/**
 * Top inset for the preview-rail column — matches dashboard `pageShellInsetTopClasses`.
 */
export const formTabbedAsideSlotTopInsetClasses = 'xl:pt-8'

/**
 * Bottom inset for the preview-rail column — matches dashboard
 * `pageShellInsetBottomClasses` (`pb-8`) while the form footer stays flush.
 */
export const formTabbedAsideSlotBottomInsetClasses = 'xl:pb-8'

/** Hide compact preview trigger when the persistent rail column is visible (`xl` and up). */
export const formTabbedPreviewRailCompactTriggerHiddenClasses = 'xl:hidden'

export const formTabbedAsideSlotClasses = cn(
  'hidden min-h-0 min-w-0 xl:col-start-2 xl:flex xl:h-full xl:flex-col xl:row-start-1',
  formTabbedAsideSlotTopInsetClasses,
  formTabbedAsideSlotBottomInsetClasses,
)

/** @deprecated Footer lives in the form column scroll shell — not a separate grid row. */
export const formTabbedAsideFooterClasses = 'min-w-0 xl:col-start-1 xl:row-start-2'

/** Visually hide inactive TabbedForm panels while keeping them mounted. */
export const formTabbedInactivePanelClasses = 'hidden'

/**
 * Tighter vertical gap between hoisted chrome and tab panels in `<TabbedForm>`.
 * Overrides inherited `comfortable` rhythm (`gap-6`) on the outer rhythm stack only.
 */
export const formTabbedChromeRhythmStackClasses = 'gap-4'

/** Sticky actions bar — save/cancel and form-level errors stay reachable on long forms. */
export const formStickyActionsBarClasses =
  'sticky bottom-0 z-20 border-t border-border bg-background pt-4 pb-4 supports-[backdrop-filter]:bg-background/95 supports-[backdrop-filter]:backdrop-blur-sm'

/**
 * Standard docked actions bar vertical footprint (single control row, no validation
 * summary). SSOT for docked footer geometry and {@link RPG_CONTENT_BOTTOM_INSET_VAR}.
 */
export const RPG_FORM_DOCKED_ACTIONS_BAR_BLOCK_SIZE_VAR = '--rpg-form-docked-actions-bar-block-size'

export const formDockedActionsBarBlockSizeContractClasses = cn(
  `[${RPG_FORM_DOCKED_ACTIONS_BAR_BLOCK_SIZE_VAR}:69px]`,
)

/**
 * Standard bottom viewport space reserved by surrounding chrome. Bounded inner panels
 * may subtract this from viewport-relative fallback caps — not remaining content height.
 */
export const RPG_CONTENT_BOTTOM_INSET_VAR = '--rpg-content-bottom-inset'

/** Layout gap between bounded inner panels and docked footer chrome. */
export const RPG_CONTENT_FLOOR_GAP_VAR = '--rpg-content-floor-gap'

export const formDockedFooterFloorGapContractClasses = `[${RPG_CONTENT_FLOOR_GAP_VAR}:1rem]`

/**
 * Standard top viewport space reserved by surrounding chrome (app shell, page heading,
 * form scroll chrome). Bounded inner panels may subtract this from viewport caps.
 */
export const RPG_CONTENT_TOP_INSET_VAR = '--rpg-content-top-inset'

/**
 * Conservative block-size contracts for scrollable content above tab panels inside a
 * docked-footer form column. Summed into {@link RPG_CONTENT_TOP_INSET_VAR} on
 * {@link formStickyScrollShellWithDockedFooterClasses} only.
 */
export const formDockedScrollTopChromeBlockSizeContractClasses = cn(
  '[--rpg-form-viewport-scroll-body-top-inset:2rem]',
  '[--rpg-form-identity-header-block-size:8rem]',
  '[--rpg-form-sticky-tabs-block-size:3rem]',
  '[--rpg-form-docked-scroll-top-chrome-inset:calc(var(--rpg-form-viewport-scroll-body-top-inset)+var(--rpg-form-identity-header-block-size)+var(--rpg-form-sticky-tabs-block-size))]',
)

/** Column shell for sticky chrome — pairs scroll body with a docked footer. */
export const formStickyScrollShellClasses = 'flex min-h-0 flex-1 flex-col'

/**
 * Sticky-chrome shell that docks a standard actions bar below the scroll body.
 * Publishes environmental inset variables for viewport-relative bounded panels.
 */
export const formStickyScrollShellWithDockedFooterClasses = cn(
  formStickyScrollShellClasses,
  formDockedActionsBarBlockSizeContractClasses,
  formDockedFooterFloorGapContractClasses,
  formDockedScrollTopChromeBlockSizeContractClasses,
  `[${RPG_CONTENT_BOTTOM_INSET_VAR}:calc(var(${RPG_FORM_DOCKED_ACTIONS_BAR_BLOCK_SIZE_VAR})+var(${RPG_CONTENT_FLOOR_GAP_VAR}))]`,
  `[${RPG_CONTENT_TOP_INSET_VAR}:calc(var(${RPG_CONTENT_TOP_INSET_VAR},0px)+var(--rpg-form-docked-scroll-top-chrome-inset))]`,
)

/** Docked actions bar — flex-column footer below a bounded scroll body (content forms). */
export const formDockedActionsBarClasses = cn(
  formDockedActionsBarBlockSizeContractClasses,
  'z-20 box-border shrink-0 border-t border-border bg-background supports-[backdrop-filter]:bg-background/95 supports-[backdrop-filter]:backdrop-blur-sm',
  `min-h-[var(${RPG_FORM_DOCKED_ACTIONS_BAR_BLOCK_SIZE_VAR})]`,
  'flex flex-col justify-center py-4',
)

/**
 * Clip slot above a docked footer — definite size container without scroll. Pairs with
 * {@link formStickyScrollBodyScrollerClasses} inside {@link FormStickyScrollBody}.
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

/**
 * Legacy docked-footer slot when no clip is applied — prefer `pageScroll` on `<Form>`
 * so the page shell owns scroll instead of composing an inner scroller here.
 */
export const formStickyScrollBodyUnboundedClasses = 'min-h-0 flex-1'

/** Inner scroller inside the viewport-bound clip slot. */
export const formStickyScrollBodyScrollerClasses = cn(
  'h-full min-h-0',
  formStickyScrollBodyScrollSurfaceClasses,
)

/**
 * @deprecated Use {@link FormStickyScrollBody} (clip + scroller). Kept for tests that
 * assert scroller tokens on the inner overflow region.
 */
export const formStickyScrollBodyClasses = formStickyScrollBodyScrollerClasses

/**
 * Sheet/drawer/modal scroll region — grows inside a flex column shell with a docked
 * footer. Composes {@link dialogPanelScrollRegionClasses} for end-of-scroll clearance.
 */
export const formSheetScrollRegionClasses = dialogPanelScrollRegionClasses

/** Transparent sticky actions bar surface — pair with `formStickyTabsTransparentClasses`. */
export const formStickyActionsBarTransparentClasses =
  'bg-transparent supports-[backdrop-filter]:bg-transparent backdrop-blur-none'

/** Top spacing for a non-sticky form footer. */
export const formFooterSpacingClasses = 'pt-4'

/** Shared flex row for form footer actions (leading + primary group). */
export const formActionsBarActionsRowClasses = 'flex flex-wrap items-center gap-2'

export const formActionsBarLeadingGroupClasses = 'flex flex-wrap items-center gap-2'

export const formActionsBarPrimaryGroupClasses = 'ml-auto flex flex-wrap items-center gap-2'
