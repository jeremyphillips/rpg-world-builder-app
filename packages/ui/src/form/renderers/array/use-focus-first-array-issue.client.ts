'use client'

import * as React from 'react'

import type { ArrayConfig } from '../../field-config'
import type { ValidationSessionExpandKey } from '../../context/form-ui.context'
import { buildValidationSessionExpandKey, sortFormIssues, type FormIssue } from '../../errors'
import { collectArraySections } from '../../errors/resolve-field-order'
import type { FormItem } from '../../field-config'
import { focusDomIssueTarget } from './array-field-item-focus.lib'

interface UseFocusFirstArrayIssueOptions {
  fullName: string
  idPrefix: string
  arrayPattern: ArrayConfig['arrayPattern']
  itemCollapseKey: ArrayConfig['itemCollapseKey']
  issues: FormIssue[]
  fields: FormItem[]
  getItemValues: (index: number) => Record<string, unknown>
  addValidationSessionExpandKeys: (keys: readonly ValidationSessionExpandKey[]) => void
}

export function useFocusFirstArrayIssue({
  fullName,
  idPrefix,
  arrayPattern,
  itemCollapseKey,
  issues,
  fields,
  getItemValues,
  addValidationSessionExpandKeys,
}: UseFocusFirstArrayIssueOptions): () => void {
  return React.useCallback(() => {
    const sections = collectArraySections(fields)
    const arrayIssues = issues.filter(
      (issue) => issue.path === fullName || issue.path.startsWith(`${fullName}.`),
    )
    const firstIssue = sortFormIssues(arrayIssues, sections)[0]
    if (!firstIssue || firstIssue.itemIndex === undefined) return

    const itemValues = getItemValues(firstIssue.itemIndex)
    addValidationSessionExpandKeys([
      buildValidationSessionExpandKey(
        fullName,
        firstIssue.itemIndex,
        itemValues,
        itemCollapseKey ?? 'id',
      ),
    ])

    focusDomIssueTarget(firstIssue, idPrefix, arrayPattern, firstIssue.itemPrefix)
  }, [
    addValidationSessionExpandKeys,
    arrayPattern,
    fields,
    fullName,
    getItemValues,
    idPrefix,
    issues,
    itemCollapseKey,
  ])
}
