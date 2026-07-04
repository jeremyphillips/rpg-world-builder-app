'use client'

import * as React from 'react'

import {
  resolveTabValidationState,
  type TabValidationState,
} from '../errors/resolve-tab-validation-state'
import type { TabbedFormTab } from '../shells/tabbed-form-panels.client'
import { useFormValidationPresentation } from './use-form-validation-presentation.client'

const EMPTY_TAB_VALIDATION_STATE: TabValidationState = {
  tabId: '',
  count: 0,
  issues: [],
}

function gateTabValidationState(
  tabStates: TabValidationState[],
  hasAttemptedSubmit: boolean,
): TabValidationState[] {
  if (hasAttemptedSubmit) return tabStates

  return tabStates.map((state) => ({
    ...EMPTY_TAB_VALIDATION_STATE,
    tabId: state.tabId,
  }))
}

/** Per-tab validation counts and issues, gated until the first failed submit. */
export function useTabbedFormTabValidationState(tabs: TabbedFormTab[]) {
  const allFields = React.useMemo(() => tabs.flatMap((tab) => tab.fields), [tabs])
  const { issues, hasAttemptedSubmit } = useFormValidationPresentation(allFields)

  const tabStates = React.useMemo(
    () => resolveTabValidationState(issues, tabs, allFields),
    [issues, tabs, allFields],
  )

  return {
    hasAttemptedSubmit,
    tabStates: gateTabValidationState(tabStates, hasAttemptedSubmit),
  }
}
