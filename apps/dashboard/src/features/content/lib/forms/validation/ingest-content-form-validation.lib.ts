import {
  replaceFormValidationProducerSlot,
  type FormIssue,
  type FormValidationProducerSession,
  type FormValidationProducerSlot,
} from '@rpg/ui/form'

export { applyCanonicalFormIssuesToRhf } from './content-form-validation-rhf.lib'

export function ingestContentFormValidationIssues(
  session: FormValidationProducerSession,
  slot: FormValidationProducerSlot,
  stamp: number,
  issues: readonly FormIssue[],
): FormValidationProducerSession {
  return replaceFormValidationProducerSlot(session, slot, stamp, issues)
}
