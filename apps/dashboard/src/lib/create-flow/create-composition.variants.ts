import { cn } from '@rpg/ui'

import {
  createTabComposerReviewClasses,
  createTabComposerStackClasses,
} from './create-tab-content.variants'

/** 8px — composer subsection title to review body. */
export const createCompositionComposerStackClasses = createTabComposerStackClasses

/** 8px — sibling review stages (active decision, summary, discovery, branch). */
export const createCompositionReviewClasses = createTabComposerReviewClasses

/** 2px — stage heading row to helper copy when helper is present. */
export const createCompositionStageSubheadingClasses = cn('flex flex-col gap-0.5')

/** 10px — stage subheading block to stage body (search, form, …). */
export const createCompositionStageStackClasses = cn('flex flex-col gap-2.5')

/** Heading row with optional trailing stage action. */
export const createCompositionStageHeadingRowClasses = cn('flex items-center justify-between gap-2')

/** Vertical stack for completed-decision summary rows. */
export const createCompositionSummaryRowsClasses = cn('flex flex-col')
