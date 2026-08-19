import { cva } from 'class-variance-authority'

export const quickNpcBuildCardSectionClasses = 'flex flex-col gap-y-3'

/** Stacks on create-setup modal body gap (`gap-4`) for 32px from upstream summaries. */
export const quickNpcBuildCardSetupOffsetClasses = 'mt-4'

export const quickNpcBuildCardShellClasses =
  'flex flex-col gap-y-4 rounded-md border border-border bg-card px-4 py-4'

export const quickNpcBuildCardIdentityRowClasses = 'flex flex-wrap items-center gap-2'

export const quickNpcBuildCardIdentityTitleClasses = 'heading-style-card text-foreground'

export const quickNpcBuildCardAttributesShellClasses =
  'flex flex-col rounded-md border border-border bg-sunken shadow-surface-sunken'

export const quickNpcBuildCardAttributeRowClasses = 'flex flex-col px-3 py-2'

export const quickNpcBuildCardAttributeRowDividerClasses = 'border-t border-border'

/** Attribute row header — 11px eyebrow (`Eyebrow` sm) with 4px spacing before value/editor. */
export const quickNpcBuildCardAttributeHeaderClasses =
  'mb-1 flex flex-wrap items-center justify-between gap-2'

export const quickNpcBuildCardAttributeValueClasses = 'text-base font-body-emphasis text-foreground'

export const quickNpcBuildCardAttributeHelperClasses = 'text-sm text-muted-foreground'

export const quickNpcBuildCardLevelPromptClasses = 'text-xs text-muted-foreground'

export const quickNpcBuildCardClassGroupClasses = 'flex flex-col gap-y-2'

export const quickNpcBuildCardClassOptionsClasses = 'grid gap-2'

export const quickNpcBuildCardClassOptionRowClasses = 'flex items-center gap-2'

export const quickNpcBuildCardClassOptionLabelClasses =
  'text-md font-body-emphasis leading-none text-foreground'

export const quickNpcBuildCardLevelEditorClasses = 'flex flex-wrap items-center gap-3'

export const quickNpcBuildCardActionLinkClasses = 'h-auto px-0 text-xs'

export const quickNpcBuildCardDescriptionVariants = cva('text-sm text-muted-foreground')
