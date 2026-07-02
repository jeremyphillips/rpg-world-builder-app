export type {
  FormIssue,
  FormIssueScope,
  FormIssueSeverity,
  ArrayItemIssueGroup,
} from './form-issue.types'
export { FORM_ISSUE_SEVERITY_ORDER } from './form-issue.types'
export { flattenFormIssues } from './flatten-form-issues'
export { classifyFormIssue, classifyFormIssues } from './classify-form-issue'
export {
  filterIssuesForItemPrefix,
  groupIssuesForItemPrefix,
  sortFormIssues,
  countInvalidArrayItems,
  countIssuesForArrayPath,
  indexArrayItemIssues,
  findArraySectionForIssue,
  buildFieldSummaryText,
  type ArrayIssueIndex,
} from './group-form-issues'
export {
  resolveArrayItemFieldOrder,
  resolveFieldOrderIndex,
  collectArraySections,
  type ArraySectionMeta,
} from './resolve-field-order'
export {
  buildFieldControlId,
  resolveIssueFocusFieldName,
  resolveIssueFocusControlId,
} from './resolve-issue-focus-target'
export {
  resolveFieldErrorMessage,
  resolveFirstFieldErrorMessage,
} from './resolve-field-error-message'
export {
  buildValidationSessionExpandKey,
  resolveValidationExpandKeys,
  resolveInvalidSubmitNavigation,
  prepareFormIssues,
  findArrayConfigAtPath,
  type ValidationSessionExpandKey,
  type InvalidSubmitNavigation,
} from './resolve-invalid-submit-navigation'
