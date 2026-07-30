import {
  getVocabularySetCapability,
  type VocabularyOptionSetId,
  type VocabularySetCapability,
} from '@rpg/contracts'

import { HttpError } from '../../../lib/http-error'

export function assertVocabularySetCapability(
  setId: VocabularyOptionSetId,
  capability: keyof VocabularySetCapability,
): void {
  if (!getVocabularySetCapability(setId)[capability]) {
    throw new HttpError(
      403,
      'forbidden',
      `Vocabulary set "${setId}" does not support this operation.`,
    )
  }
}
