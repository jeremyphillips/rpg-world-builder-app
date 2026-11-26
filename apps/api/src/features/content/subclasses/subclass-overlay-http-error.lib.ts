import type { CatalogOverlayListFailure } from '@rpg/contracts'

import { HttpError } from '../../../lib/http-error'

export function subclassOverlayUnresolvedHttpError(
  overlayFailure: CatalogOverlayListFailure,
  issuePath: string,
  issueCode: string,
): HttpError {
  return new HttpError(409, overlayFailure.code, overlayFailure.message, {
    issues: [
      {
        path: issuePath,
        code: issueCode,
        message: overlayFailure.message,
      },
    ],
  })
}
