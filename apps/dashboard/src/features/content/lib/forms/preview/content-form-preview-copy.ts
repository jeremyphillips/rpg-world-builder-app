import type { VocabularyTerm } from '@rpg/contracts'

export const CONTENT_PREVIEW_SECTIONS_TITLE = 'Sections'
export const CONTENT_PREVIEW_AS_PLAYER_LABEL = 'Preview as player'
export const CONTENT_PREVIEW_COMPACT_LABEL = 'Preview'
export const CONTENT_PREVIEW_READY_TITLE = 'Ready to publish'
export const CONTENT_PREVIEW_READY_BODY = 'Required configuration is complete.'
export const CONTENT_PREVIEW_NOT_READY_TITLE = 'Not ready to publish'
export const CONTENT_PREVIEW_NOT_READY_BODY = 'Required configuration is incomplete.'
export const CONTENT_PREVIEW_NEEDS_ATTENTION = 'Needs attention'
export const CONTENT_PREVIEW_STATUS_READY = 'Ready'
export const CONTENT_PREVIEW_STATUS_OFF = 'Off'
export const CONTENT_PREVIEW_STATUS_NONE = 'None'
export const CONTENT_PREVIEW_STATUS_NOT_CONFIGURED = 'Not configured'
export const CONTENT_PREVIEW_DESCRIPTION_PLACEHOLDER =
  'A brief description will appear here once provided.'

export function contentPreviewHeaderTitle(term: VocabularyTerm): string {
  return `${term.label} Preview`
}

export function contentPreviewUnnamedName(term: VocabularyTerm): string {
  return `Unnamed ${term.label}`
}

export function contentPreviewSectionsDescription(term: VocabularyTerm): string {
  const singular = term.sentence?.singular ?? term.label.toLowerCase()
  return `Overview of this ${singular} and its current configuration.`
}

export function contentPreviewAsPlayerHelper(term: VocabularyTerm): string {
  const singular = term.sentence?.singular ?? term.label.toLowerCase()
  return `See how this ${singular} will appear to players in your campaign.`
}

export function contentPreviewAttentionTitle(count: number): string {
  return `${count} sections need attention.`
}

export function contentPreviewDefaultFeaturesStatus(count: number): string {
  return `${count} default features`
}

export function contentPreviewFeaturesStatus(count: number): string {
  return `${count} features`
}
