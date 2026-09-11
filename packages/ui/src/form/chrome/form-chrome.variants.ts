import { dialogPanelScrollRegionClasses } from '../../components/ui/dialog-panel.variants'

/** Sticky tab list wrapper — keeps section tabs visible while scrolling long panels. */
export const formStickyTabsClasses =
  'sticky top-0 z-20 bg-background supports-[backdrop-filter]:bg-background/95 supports-[backdrop-filter]:backdrop-blur-sm'

/** Transparent sticky tab surface — e.g. tabbed forms inside sheets/drawers. */
export const formStickyTabsTransparentClasses =
  'bg-transparent supports-[backdrop-filter]:bg-transparent backdrop-blur-none'

/** Keeps a long segmented section control scrollable inside the field column. */
export const formTabbedNavOverflowClasses = 'min-w-0 overflow-x-auto'

/** Tab row with a trailing compact action (e.g. Preview below `2xl`). */
export const formTabbedNavWithTrailingClasses = 'flex items-center gap-2'

/** Scrollable segmented control when a trailing action shares the sticky tab row. */
export const formTabbedNavControlWrapClasses = 'min-w-0 flex-1 overflow-x-auto'

/**
 * TabbedForm body + aside grid. Below `2xl` the form column stays `max-w-4xl` and
 * centered; at `2xl` the rail sits in a second column (~21rem) with a large gap.
 */
export const formTabbedAsideGridClasses =
  'mx-auto flex min-h-0 w-full max-w-4xl flex-1 flex-col 2xl:mx-0 2xl:grid 2xl:max-w-none 2xl:grid-cols-[minmax(0,56rem)_21rem] 2xl:items-stretch 2xl:gap-6'

export const formTabbedAsideBodyClasses = 'min-w-0 2xl:col-start-1 2xl:row-start-1'

export const formTabbedAsideSlotClasses = 'hidden min-w-0 2xl:col-start-2 2xl:row-start-1 2xl:block'

/** @deprecated Footer lives in the form column scroll shell — not a separate grid row. */
export const formTabbedAsideFooterClasses = 'min-w-0 2xl:col-start-1 2xl:row-start-2'

/** Visually hide inactive TabbedForm panels while keeping them mounted. */
export const formTabbedInactivePanelClasses = 'hidden'

/** Bottom padding on tab panels so the last field clears the sticky actions bar. */
/** removed pb-24 as it did not seem to be necessary */
export const formTabPanelsBottomPaddingClasses = ''

/**
 * Tighter vertical gap between hoisted chrome and tab panels in `<TabbedForm>`.
 * Overrides inherited `comfortable` rhythm (`gap-6`) on the outer rhythm stack only.
 */
export const formTabbedChromeRhythmStackClasses = 'gap-4'

/** Sticky actions bar — save/cancel and form-level errors stay reachable on long forms. */
export const formStickyActionsBarClasses =
  'sticky bottom-0 z-20 border-t border-border bg-background pt-4 pb-4 supports-[backdrop-filter]:bg-background/95 supports-[backdrop-filter]:backdrop-blur-sm'

/** Docked actions bar — flex-column footer below a bounded scroll body (content forms). */
export const formDockedActionsBarClasses =
  'z-20 shrink-0 border-t border-border bg-background pt-4 pb-4 supports-[backdrop-filter]:bg-background/95 supports-[backdrop-filter]:backdrop-blur-sm'

/** Column shell for sticky chrome — pairs scroll body with a docked footer. */
export const formStickyScrollShellClasses = 'flex min-h-0 flex-1 flex-col'

/** Scrollable field column when the footer is docked below it. */
export const formStickyScrollBodyClasses = dialogPanelScrollRegionClasses

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
