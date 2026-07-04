'use client'

import type { FieldErrors, FieldValues, UseFormReturn } from 'react-hook-form'

import { navigateInvalidSubmit } from '../config/navigate-invalid-submit.client'
import { getFirstInvalidTabId } from '../errors/resolve-tab-validation-state'
import { prepareFormIssues } from '../errors/resolve-invalid-submit-navigation'
import type { FormItem } from '../field-config'
import type { FormUiContextValue } from '../context/form-ui.context'
import type { TabbedFormTab } from './tabbed-form-panels.client'
import { getTabPanelIdPrefix } from './tabbed-form-id.lib'

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
      if (tabId) setActiveTabId(tabId)
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
