import { useCallback, useMemo } from 'react'
import {
  collectArraySections,
  groupIssuesForItemPrefix,
  useFormValidationPresentation,
  type FormItem,
} from '@rpg/ui/form'

import { embeddedArrayResolverField } from '../forms/validation/tabbed-form-resolver-fields'

/** Visually-hidden validation state appended to a master-detail list row button. */
export function masterDetailRowValidationStateLabel(count: number): string {
  return `${count} ${count === 1 ? 'validation issue' : 'validation issues'}`
}

/** Per-row issue counts from unique presentation paths, gated like tab badges. */
export function useMasterDetailRowValidation(fieldName: string, itemFields: FormItem[]) {
  const resolverFields = useMemo(
    () => [embeddedArrayResolverField(fieldName, fieldName, itemFields)],
    [fieldName, itemFields],
  )

  const { issues, hasAttemptedSubmit, hasAttemptedPublish } =
    useFormValidationPresentation(resolverFields)

  const showRowBadges = hasAttemptedSubmit || hasAttemptedPublish

  const fieldOrder = useMemo(() => {
    const section = collectArraySections(resolverFields).find(
      (entry) => entry.fullName === fieldName,
    )
    return section?.fieldOrder ?? []
  }, [fieldName, resolverFields])

  const getRowIssueCount = useCallback(
    (index: number): number => {
      if (!showRowBadges) return 0
      const itemPrefix = `${fieldName}.${index}`
      return groupIssuesForItemPrefix(issues, itemPrefix, fieldName, index, fieldOrder).totalCount
    },
    [fieldName, fieldOrder, issues, showRowBadges],
  )

  const hasRowValidationIssue = useCallback(
    (index: number): boolean => getRowIssueCount(index) > 0,
    [getRowIssueCount],
  )

  return {
    getRowIssueCount,
    hasRowValidationIssue,
    showRowBadges,
  }
}
