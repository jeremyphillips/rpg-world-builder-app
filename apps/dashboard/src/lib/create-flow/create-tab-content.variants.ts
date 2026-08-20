import { cn } from '@rpg/ui'

/** 12px — offset from tab list to tab panel content. */
export const createTabPanelContentOffsetClasses = 'mt-3'

/** 12px — major sections inside a create tab panel (alerts, intro, workflow). */
export const createTabPanelStackClasses = cn('flex flex-col gap-3')

/** 4px — tab panel intro heading to helper copy. */
export const createTabIntroClasses = cn('flex flex-col gap-1')

/** 8px — composing section title to review body. */
export const createTabComposerStackClasses = cn('flex flex-col gap-2')

/** 8px — review stages (intent, summary rows, discovery). */
export const createTabComposerReviewClasses = cn('flex flex-col gap-2')

/** No gap — stage heading to helper line. */
export const createTabStageSubheadingClasses = cn('flex flex-col gap-0')

/** 4px — stage subheading block to the discovery control column. */
export const createTabDiscoveryStackClasses = cn('flex flex-col gap-1')

/** 2px — discovery create action to picker card list. */
export const createTabDiscoveryBodyClasses = cn('flex flex-col gap-0.5')

/** 8px — search field to inline discovery action. */
export const createTabDiscoveryControlsClasses = cn('flex flex-col gap-2')

export const createTabDiscoveryCreateActionClasses = cn('flex justify-end')

/** 8px — sibling picker / entity cards in discovery. */
export const createTabDiscoveryListClasses = cn('flex flex-col gap-2')

/** 8px — sibling pending draft cards in Add / Pending mode. */
export const createTabPendingListClasses = cn('flex flex-col gap-2')
