import { formatFieldMessage } from '../../../../validation/define-message'

import type { CharacterBuildValidationIssue } from './types'

export function validationIssue(
  code: string,
  message: string,
  extra: Omit<CharacterBuildValidationIssue, 'code' | 'message'> = {},
): CharacterBuildValidationIssue {
  return { code, message: formatFieldMessage(message), ...extra }
}
