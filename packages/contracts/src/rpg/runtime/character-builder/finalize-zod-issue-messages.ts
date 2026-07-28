import { formatFieldMessage } from '../../../validation/define-message'

import { characterBuilderValidationMessages } from './character-builder-messages'

const CREATE_INPUT_ZOD_PATH_MESSAGES: ReadonlyArray<{
  matches: (path: string | undefined) => boolean
  message: () => string
}> = [
  {
    matches: (path) => path === 'name' || Boolean(path?.endsWith('.name')),
    message: characterBuilderValidationMessages.nameRequired,
  },
  {
    matches: (path) => path === 'alignment',
    message: characterBuilderValidationMessages.alignmentRequired,
  },
  {
    matches: (path) => path === 'species' || path === 'species.id',
    message: characterBuilderValidationMessages.speciesRequired,
  },
  {
    matches: (path) => path === 'classes' || Boolean(path?.startsWith('classes.')),
    message: characterBuilderValidationMessages.classRequired,
  },
  {
    matches: (path) => path === 'abilityScores' || Boolean(path?.startsWith('abilityScores.')),
    message: characterBuilderValidationMessages.abilitiesIncomplete,
  },
]

export function mapCreateInputZodIssueMessage(
  path: string | undefined,
  _code: string,
): string | undefined {
  const match = CREATE_INPUT_ZOD_PATH_MESSAGES.find((entry) => entry.matches(path))
  return match ? formatFieldMessage(match.message()) : undefined
}
