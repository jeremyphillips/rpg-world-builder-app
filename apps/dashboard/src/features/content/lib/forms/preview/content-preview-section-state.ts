import type { PreviewRailSectionMarker, PreviewRailStatusTone } from '@rpg/ui'

import {
  CONTENT_PREVIEW_NEEDS_ATTENTION,
  CONTENT_PREVIEW_STATUS_READY,
} from './content-form-preview-copy'
import type { ContentPreviewDerivedKind, ContentPreviewSection } from './content-form-preview.types'

export type ContentPreviewSectionPresentation = {
  marker?: PreviewRailSectionMarker
  status?: string
  statusTone?: PreviewRailStatusTone
}

const IDLE_KINDS = new Set<ContentPreviewDerivedKind>(['off', 'none', 'notConfigured'])

/**
 * Part 2 precedence + 3.2a marker mapping.
 * `sectionValid` comes from the live publish-schema parse (not tab badges).
 */
export function resolveContentPreviewSectionPresentation(
  section: ContentPreviewSection,
  sectionValid: boolean,
  hasAttemptedSubmit: boolean,
): ContentPreviewSectionPresentation {
  if (!sectionValid) {
    if (!hasAttemptedSubmit) {
      return {}
    }

    return {
      marker: 'attention',
      status: CONTENT_PREVIEW_NEEDS_ATTENTION,
      statusTone: 'warning',
    }
  }

  if (IDLE_KINDS.has(section.derivedKind)) {
    return {
      marker: 'idle',
      status: section.status,
    }
  }

  return {
    marker: 'complete',
    status: section.status,
    statusTone: section.status === CONTENT_PREVIEW_STATUS_READY ? 'success' : undefined,
  }
}
