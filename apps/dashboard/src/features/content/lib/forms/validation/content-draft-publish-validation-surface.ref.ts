import type { FieldValues } from 'react-hook-form'

import type { ApiValidationIssue } from '@rpg/contracts'

export type DraftPublishValidationSurface = (
  values: FieldValues,
) => readonly ApiValidationIssue[] | null

/** Registered by {@link ContentDraftPublishValidationSurfaceBridge} while the content form is mounted. */
export const draftPublishValidationSurface: { current: DraftPublishValidationSurface | null } = {
  current: null,
}
