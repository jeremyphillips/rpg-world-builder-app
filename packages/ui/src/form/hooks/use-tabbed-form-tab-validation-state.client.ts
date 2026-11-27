'use client'

import * as React from 'react'

import {
  resolveTabValidationState,
  type TabValidationState,
} from '../errors/resolve-tab-validation-state'
import {
  collectTabbedFormResolverItems,
  type TabbedFormTab,
} from '../shells/tabbed-form-panels.lib'
import { useFormValidationSessionProjection } from './use-form-validation-session-projection.client'

const EMPTY_TAB_VALIDATION_STATE: TabValidationState = {
  tabId: '',
  count: 0,
  issues: [],
}

function gateTabValidationState(
  tabStates: TabValidationState[],
  showTabBadges: boolean,
): TabValidationState[] {
  if (showTabBadges) return tabStates

  return tabStates.map((state) => ({
    ...EMPTY_TAB_VALIDATION_STATE,
    tabId: state.tabId,
  }))
}

/** Per-tab validation counts and issues, gated until publish or submit presentation activates. */
export function useTabbedFormTabValidationState(tabs: TabbedFormTab[]) {
  const allFields = React.useMemo(() => collectTabbedFormResolverItems(tabs), [tabs])
  const { issues, hasAttemptedSubmit, hasAttemptedPublish } =
    useFormValidationSessionProjection(allFields)

  const tabStates = React.useMemo(
    () => resolveTabValidationState(issues, tabs, allFields),
    [issues, tabs, allFields],
  )

  const showTabBadges = hasAttemptedSubmit || hasAttemptedPublish

  return {
    hasAttemptedSubmit,
    hasAttemptedPublish,
    tabStates: gateTabValidationState(tabStates, showTabBadges),
  }
}
