import { useCallback, useMemo } from 'react'
import { useWatch } from 'react-hook-form'
import {
  collectArraySections,
  groupIssuesForItemPrefix,
  resolveSectionFieldOrder,
  useFormValidationPresentation,
  type FormItem,
} from '@rpg/ui/form'

import {
  embeddedArrayResolverField,
  type EmbeddedArrayResolverFieldInput,
} from '../forms/validation/tabbed-form-resolver-fields'

/** Visually-hidden validation state appended to a master-detail list row button. */
export function masterDetailRowValidationStateLabel(count: number): string {
  return `${count} ${count === 1 ? 'validation issue' : 'validation issues'}`
}

/** Per-row issue counts from unique presentation paths, gated like tab badges. */
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
    useFormValidationPresentation(resolverFields)

  const showRowBadges = hasAttemptedSubmit || hasAttemptedPublish

  const arraySection = useMemo(() => {
    return collectArraySections(resolverFields, formValues ?? {}).find(
      (entry) => entry.fullName === fieldName,
    )
  }, [fieldName, formValues, resolverFields])

  const getRowIssueCount = useCallback(
    (index: number): number => {
      if (!showRowBadges) return 0
      const itemPrefix = `${fieldName}.${index}`
      const fieldOrder = resolveSectionFieldOrder(arraySection, index)
      return groupIssuesForItemPrefix(issues, itemPrefix, fieldName, index, fieldOrder).totalCount
    },
    [arraySection, fieldName, issues, showRowBadges],
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
