import { dialogPanelScrollRegionClasses } from '../../components/ui/dialog-panel.variants'

/** Sticky tab list wrapper — keeps section tabs visible while scrolling long panels. */
export const formStickyTabsClasses =
  'sticky top-0 z-20 bg-background supports-[backdrop-filter]:bg-background/95 supports-[backdrop-filter]:backdrop-blur-sm'

/** Transparent sticky tab surface — e.g. tabbed forms inside sheets/drawers. */
export const formStickyTabsTransparentClasses =
  'bg-transparent supports-[backdrop-filter]:bg-transparent backdrop-blur-none'

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
  'sticky bottom-0 z-20 mt-6 border-t border-border bg-background pt-4 pb-4 supports-[backdrop-filter]:bg-background/95 supports-[backdrop-filter]:backdrop-blur-sm'

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
