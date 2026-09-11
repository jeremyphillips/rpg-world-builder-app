import type { PreviewRailSectionMarker, PreviewRailStatusTone } from '@rpg/ui'

import {
  CONTENT_PREVIEW_NEEDS_ATTENTION,
  CONTENT_PREVIEW_STATUS_READY,
} from './content-form-preview-copy'
import type {
  ContentPreviewSection,
  ContentPreviewSectionBodyProps,
} from './content-form-preview.types'

/** True when the section has preview content worth expanding (not status-only rows). */
export function isContentPreviewSectionExpandable(section: ContentPreviewSection): boolean {
  if (section.description?.trim()) return true
  if (section.facts?.length) return true
  return false
}

/** @deprecated Use {@link isContentPreviewSectionExpandable}. */
export const hasContentPreviewSectionBody = isContentPreviewSectionExpandable

/** Maps a section projection to PreviewRail section-body props when expandable. */
export function resolveContentPreviewSectionBodyProps(
  section: ContentPreviewSection,
): ContentPreviewSectionBodyProps | null {
  if (!isContentPreviewSectionExpandable(section)) return null

  return {
    ...(section.description?.trim() ? { description: section.description } : {}),
    ...(section.facts?.length ? { facts: section.facts } : {}),
  }
}

export type ContentPreviewSectionPresentation = {
  marker?: PreviewRailSectionMarker
  status?: string
  statusTone?: PreviewRailStatusTone
}

/** Maps a valid section projection to its rail marker — validation overrides this separately. */
export function resolveDerivedContentPreviewPresentation(
  section: ContentPreviewSection,
): ContentPreviewSectionPresentation {
  switch (section.derivedKind) {
    case 'off':
      return {
        marker: 'off',
        status: section.status,
      }
    case 'none':
      return {
        marker: 'none',
        status: section.status,
      }
    case 'notConfigured':
      return {
        marker: 'notConfigured',
        status: section.status,
      }
    case 'ready':
    case 'count':
    case 'prepared':
    case 'known':
    case 'fullList':
      return {
        marker: 'complete',
        status: section.status,
        statusTone: section.status === CONTENT_PREVIEW_STATUS_READY ? 'success' : undefined,
      }
    default: {
      const exhaustive: never = section.derivedKind
      return exhaustive
    }
  }
}

/**
 * Part 2 precedence + marker mapping.
 * `sectionValid` comes from the live publish-schema parse (not tab badges).
 *
 * Validation markers (`incomplete`, `attention`) always mean publish validation —
 * never optional content that has not been authored.
 */
export function resolveContentPreviewSectionPresentation(
  section: ContentPreviewSection,
  sectionValid: boolean,
  hasAttemptedPublish: boolean,
): ContentPreviewSectionPresentation {
  if (!sectionValid) {
    if (!hasAttemptedPublish) {
      return { marker: 'incomplete' }
    }

    return {
      marker: 'attention',
      status: CONTENT_PREVIEW_NEEDS_ATTENTION,
      statusTone: 'warning',
    }
  }

  return resolveDerivedContentPreviewPresentation(section)
}
