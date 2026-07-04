'use client'

import { flushSync } from 'react-dom'
import type { FieldErrors, FieldValues, UseFormReturn } from 'react-hook-form'

import { performInvalidSubmitFocus } from '../config/navigate-invalid-submit-focus.lib'
import { navigateInvalidSubmit } from '../config/navigate-invalid-submit.client'
import { findArraySectionForIssue } from '../errors/group-form-issues'
import type { FormIssue } from '../errors/form-issue.types'
import {
  getFirstInvalidTabId,
  resolveTabValidationState,
} from '../errors/resolve-tab-validation-state'
import {
  prepareFormIssues,
  resolveValidationExpandKeys,
  type InvalidSubmitNavigation,
} from '../errors/resolve-invalid-submit-navigation'
import { collectArraySections } from '../errors/resolve-field-order'
import { resolveIssueFocusControlId } from '../errors/resolve-issue-focus-target'
import type { FormItem } from '../field-config'
import type { FormUiContextValue } from '../context/form-ui.context'
import type { TabbedFormTab } from './tabbed-form-panels.client'
import { getTabPanelIdPrefix } from './tabbed-form-id.lib'

function getItemValuesFromForm<TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>,
) {
  return (fullName: string, index: number) => {
    const value = form.getValues(`${fullName}.${index}` as never)
    return typeof value === 'object' && value !== null
      ? (value as Record<string, unknown>)
      : undefined
  }
}

function buildNavigationForIssue<TFieldValues extends FieldValues>(
  issue: FormIssue,
  fields: FormItem[],
  form: UseFormReturn<TFieldValues>,
  idPrefix: string,
): InvalidSubmitNavigation {
  const sections = collectArraySections(fields)
  const getItemValues = getItemValuesFromForm(form)
  const expandKeys = resolveValidationExpandKeys(issue, sections, getItemValues)
  const focusSection = findArraySectionForIssue(issue, sections)
  const focusControlId = resolveIssueFocusControlId(
    issue,
    idPrefix,
    focusSection?.config.arrayPattern,
  )

  return { firstIssue: issue, expandKeys, focusControlId }
}

function focusTabbedFormNavigation(
  navigation: InvalidSubmitNavigation,
  tabId: string,
  idPrefix: string,
  ui: Pick<FormUiContextValue, 'addValidationSessionExpandKeys'>,
): void {
  ui.addValidationSessionExpandKeys(navigation.expandKeys)

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      performInvalidSubmitFocus(navigation, idPrefix, {
        tabPanelSelector: `[data-tab-panel="${tabId}"]`,
        tabTriggerSelector: `[data-tab-trigger="${tabId}"]`,
      })
    })
  })
}

/** Switches to a tab and focuses its first invalid control (summary Review actions). */
export function navigateTabbedFormToTabIssue<TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>,
  fields: FormItem[],
  formId: string,
  tabs: TabbedFormTab[],
  ui: Pick<FormUiContextValue, 'addValidationSessionExpandKeys'>,
  tabId: string,
  setActiveTabId: (tabId: string) => void,
  errors: FieldErrors<TFieldValues> = form.formState.errors,
): void {
  const issues = prepareFormIssues(errors, fields)
  const tabState = resolveTabValidationState(issues, tabs, fields).find(
    (state) => state.tabId === tabId,
  )
  const firstIssue = tabState?.issues[0]
  if (!firstIssue) return

  const idPrefix = getTabPanelIdPrefix(formId, tabId)
  flushSync(() => setActiveTabId(tabId))
  focusTabbedFormNavigation(
    buildNavigationForIssue(firstIssue, fields, form, idPrefix),
    tabId,
    idPrefix,
    ui,
  )
}

export function navigateTabbedFormInvalidSubmit<TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>,
  fields: FormItem[],
  formId: string,
  tabs: TabbedFormTab[],
  ui: Pick<FormUiContextValue, 'markSubmitAttempted' | 'addValidationSessionExpandKeys'>,
  errors: FieldErrors<TFieldValues>,
  setActiveTabId: (tabId: string) => void,
): void {
  const issues = prepareFormIssues(errors, fields)
  const tabId = getFirstInvalidTabId(issues, tabs, fields)
  const idPrefix = tabId ? getTabPanelIdPrefix(formId, tabId) : formId

  navigateInvalidSubmit(form, fields, formId, ui, errors, {
    idPrefix,
    onBeforeFocus: () => {
      if (tabId) flushSync(() => setActiveTabId(tabId))
    },
    waitForLayout: Boolean(tabId),
    focusFallbacks: tabId
      ? {
          tabPanelSelector: `[data-tab-panel="${tabId}"]`,
          tabTriggerSelector: `[data-tab-trigger="${tabId}"]`,
        }
      : undefined,
  })
}
