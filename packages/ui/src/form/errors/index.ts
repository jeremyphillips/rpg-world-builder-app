export type {
  FormIssue,
  FormIssueClaim,
  FormIssueClaimKind,
  FormIssueScope,
  FormIssueSeverity,
  ArrayItemIssueGroup,
} from './form-issue.types'
export { FORM_ISSUE_SEVERITY_ORDER } from './form-issue.types'
export {
  flattenFormIssues,
  formIssueFromEncodedMessage,
  formIssuesFromZodIssues,
} from './flatten-form-issues'
export { classifyFormIssue, classifyFormIssues } from './classify-form-issue'
export {
  filterIssuesForItemPrefix,
  countIssueClaimTargets,
  groupIssuesForItemPrefix,
  sortFormIssues,
  countInvalidArrayItems,
  countIssuesForArrayPath,
  resolveDirectArrayItemIndex,
  indexArrayItemIssues,
  findArraySectionForIssue,
  buildFieldSummaryText,
  type ArrayIssueIndex,
} from './group-form-issues'
export {
  resolveArrayItemFieldOrder,
  resolveFieldOrderIndex,
  collectArraySections,
  resolveSectionFieldOrder,
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
  resolveNestedFieldErrorMessage,
} from './resolve-field-error-message'
export {
  findRoutedIssueForFieldPath,
  findRoutedIssuesForSlot,
  resolveFieldIssueDisplayMessage,
} from './resolve-field-issue.lib'
export {
  enrichFormIssuesWithPresentationPaths,
  resolveFormIssuePresentationPath,
} from './resolve-form-issue-presentation-path.lib'
export { routeFormIssues, FORM_ISSUE_ROUTING_FALLBACK_LOG } from './route-form-issues.lib'
export {
  buildValidationSessionExpandKey,
  resolveValidationExpandKeys,
  resolveInvalidSubmitNavigation,
  prepareFormIssues,
  findArrayConfigAtPath,
  type ValidationSessionExpandKey,
  type InvalidSubmitNavigation,
} from './resolve-invalid-submit-navigation'
export {
  pathOwnsIssue,
  collectTabPathPrefixes,
  resolveTabValidationState,
  getFirstInvalidTabId,
  resolveInvalidSubmitTabId,
  type TabValidationState,
  type TabValidationTab,
} from './resolve-tab-validation-state'
export {
  collectInactiveFieldPaths,
  filterIssuesForPresentation,
  isFieldPathEligibleForPresentation,
  isInactivePathPrefix,
  isPresentationSessionExpanded,
  isPathTouched,
  issueMatchesFieldPath,
  shouldShowFieldErrorPresentation,
  type PresentationSessionFlags,
} from './resolve-field-error-presentation.lib'
