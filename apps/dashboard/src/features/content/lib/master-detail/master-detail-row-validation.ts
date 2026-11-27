import { useCallback, useMemo } from 'react'
import { useWatch } from 'react-hook-form'
import {
  collectArraySections,
  groupIssuesForItemPrefix,
  resolveSectionFieldOrder,
  type FormIssue,
  type FormItem,
} from '@rpg/ui/form'

import { useContentFormPresentationIssues } from '../forms/validation/content-form-presentation-issues.client'
import {
  embeddedArrayResolverField,
  type EmbeddedArrayResolverFieldInput,
} from '../forms/validation/tabbed-form-resolver-fields'

/** Collection summary includes rows hidden by availability. Reveal changes the list, not the count. */
export function countMasterDetailRowsWithIssues(
  rows: readonly { item: { issueCount?: number } }[],
  showRowBadges = true,
): number {
  if (!showRowBadges) return 0
  return rows.filter((row) => (row.item.issueCount ?? 0) > 0).length
}

/** Visually-hidden validation state appended to a master-detail list row button. */
export function masterDetailRowValidationStateLabel(count: number): string {
  return `${count} ${count === 1 ? 'validation issue' : 'validation issues'}`
}

/** Per-row issue counts from distinct claim targets, gated like tab badges. */
export function useMasterDetailRowValidation(
  fieldName: string,
  resolver: EmbeddedArrayResolverFieldInput | FormItem[],
) {
  const resolverInput = useMemo((): EmbeddedArrayResolverFieldInput => {
    if (Array.isArray(resolver)) return { itemFields: resolver }
    return resolver
  }, [resolver])

  const resolverFields = useMemo(
    () => [embeddedArrayResolverField(fieldName, fieldName, resolverInput)],
    [fieldName, resolverInput],
  )

  const formValues = useWatch() as Record<string, unknown>

  const { issues, hasAttemptedSubmit, hasAttemptedPublish } =
    useContentFormPresentationIssues(resolverFields)

  const showRowBadges = hasAttemptedSubmit || hasAttemptedPublish

  const arraySection = useMemo(() => {
    return collectArraySections(resolverFields, formValues ?? {}).find(
      (entry) => entry.fullName === fieldName,
    )
  }, [fieldName, formValues, resolverFields])

  const rowGroup = useCallback(
    (index: number) => {
      const itemPrefix = `${fieldName}.${index}`
      const fieldOrder = resolveSectionFieldOrder(arraySection, index)
      return groupIssuesForItemPrefix(issues, itemPrefix, fieldName, index, fieldOrder)
    },
    [arraySection, fieldName, issues],
  )

  const getRowIssueCount = useCallback(
    (index: number): number => {
      if (!showRowBadges) return 0
      return rowGroup(index).totalCount
    },
    [rowGroup, showRowBadges],
  )

  const getRowHeaderIssues = useCallback(
    (index: number): FormIssue[] => {
      if (!showRowBadges) return []
      return rowGroup(index).headerIssues.filter((issue) => issue.claim?.kind === 'row')
    },
    [rowGroup, showRowBadges],
  )

  const hasRowValidationIssue = useCallback(
    (index: number): boolean => getRowIssueCount(index) > 0,
    [getRowIssueCount],
  )

  return {
    getRowIssueCount,
    getRowHeaderIssues,
    hasRowValidationIssue,
    showRowBadges,
  }
}
