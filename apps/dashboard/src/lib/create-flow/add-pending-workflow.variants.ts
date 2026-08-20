import { cn } from '@rpg/ui'

import {
  createTabPanelStackClasses,
  createTabPendingListClasses,
} from './create-tab-content.variants'

export const addPendingWorkflowStackClasses = createTabPanelStackClasses
export const addPendingWorkflowPendingListClasses = createTabPendingListClasses
export const addPendingWorkflowActionsClasses = cn('flex flex-wrap justify-end gap-2')
