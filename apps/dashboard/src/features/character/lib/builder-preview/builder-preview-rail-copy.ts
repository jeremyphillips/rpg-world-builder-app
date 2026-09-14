export const BUILDER_PREVIEW_HEADER_TITLE = 'Character preview'

export const BUILDER_PREVIEW_SECTIONS_TITLE = 'Sections'

export const BUILDER_PREVIEW_SECTIONS_DESCRIPTION = 'Live summary of your character as you build.'

export const BUILDER_PREVIEW_COMPACT_LABEL = 'Preview'

export const BUILDER_PREVIEW_READY_TITLE = 'Ready to create'

export const BUILDER_PREVIEW_READY_BODY = 'All required steps are complete.'

export const BUILDER_PREVIEW_INCOMPLETE_TITLE = 'Builder incomplete'

export const BUILDER_PREVIEW_INCOMPLETE_BODY = 'Complete each step to create your character.'

export function builderPreviewAttentionTitle(issueCount: number): string {
  if (issueCount === 1) return '1 section needs attention.'
  return `${issueCount} sections need attention.`
}
