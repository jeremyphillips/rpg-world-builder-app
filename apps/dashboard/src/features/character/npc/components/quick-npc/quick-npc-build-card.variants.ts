import { cva } from 'class-variance-authority'

export const quickNpcBuildCardSectionClasses = 'flex flex-col gap-y-3'

/** Stacks on create-setup modal body gap (`gap-4`) for 32px from upstream summaries. */
export const quickNpcBuildCardSetupOffsetClasses = 'mt-4'

export const quickNpcBuildCardShellClasses =
  'flex flex-col gap-y-4 rounded-md border border-border bg-surface-lift px-3 py-3'

export const quickNpcBuildCardTemplateIdentityClasses = 'flex flex-col gap-y-2'

export const quickNpcBuildCardIdentityRowClasses = 'flex flex-wrap items-center gap-2'

export const quickNpcBuildCardIdentityTitleClasses = 'heading-style-card text-foreground'

export const quickNpcBuildCardAttributesShellClasses = 'flex flex-col'

export const quickNpcBuildCardAttributeRowClasses =
  'flex flex-col border-b border-border pb-2.5 mb-2.5 last:border-b-0 last:mb-0 last:pb-0'

/** Attribute row header — 11px eyebrow (`Eyebrow` sm) with value/editor below. */
export const quickNpcBuildCardAttributeHeaderClasses =
  'flex flex-wrap items-center justify-between gap-2'

export const quickNpcBuildCardLevelEditorClasses = 'flex flex-wrap items-center gap-3'

export const quickNpcBuildCardDescriptionVariants = cva('text-sm text-muted-foreground')
