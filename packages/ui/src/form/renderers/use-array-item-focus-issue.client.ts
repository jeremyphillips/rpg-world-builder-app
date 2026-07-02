'use client'

import * as React from 'react'

import type { ArrayConfig } from '../field-config'
import type { ArrayItemIssueGroup } from '../errors/form-issue.types'
import { buildValidationSessionExpandKey } from '../errors'
import type { ValidationSessionExpandKey } from '../context/form-ui.context'
import { focusDomIssueTarget } from './array-field-item-focus.lib'

interface UseArrayItemFocusIssueOptions {
  issueGroup: ArrayItemIssueGroup
  collapsible: boolean
  addValidationSessionExpandKeys: (keys: readonly ValidationSessionExpandKey[]) => void
  fullName: string
  index: number
  itemValues: Record<string, unknown>
  itemPrefix: string
  idPrefix: string
  itemCollapseKey: ArrayConfig['itemCollapseKey']
  arrayPattern: ArrayConfig['arrayPattern']
}

export function useArrayItemFocusIssue({
  issueGroup,
  collapsible,
  addValidationSessionExpandKeys,
  fullName,
  index,
  itemValues,
  itemPrefix,
  idPrefix,
  itemCollapseKey,
  arrayPattern,
}: UseArrayItemFocusIssueOptions): () => void {
  return React.useCallback(() => {
    const issue = issueGroup.sortedIssues[0]
    if (!issue) return

    if (collapsible) {
      addValidationSessionExpandKeys([
        buildValidationSessionExpandKey(fullName, index, itemValues, itemCollapseKey ?? 'id'),
      ])
    }

    focusDomIssueTarget(issue, idPrefix, arrayPattern, itemPrefix)
  }, [
    addValidationSessionExpandKeys,
    arrayPattern,
    collapsible,
    fullName,
    idPrefix,
    index,
    issueGroup.sortedIssues,
    itemCollapseKey,
    itemPrefix,
    itemValues,
  ])
}
